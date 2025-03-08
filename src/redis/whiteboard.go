package redis

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/bhav-07/haven/models"
	"github.com/go-redis/redis/v8"
	"github.com/gofiber/contrib/websocket"
	"gorm.io/gorm"
)

type WhiteboardState struct {
	Type     string          `json:"type"`
	Elements json.RawMessage `json:"elements"`
	AppState json.RawMessage `json:"appState,omitempty"`
	RoomID   string          `json:"roomId,omitempty"`
}

type RoomParticipants struct {
	Type         string   `json:"type"`
	Participants []string `json:"participants"`
}

type Space struct {
	SpaceID       uint
	Clients       map[*websocket.Conn]string
	State         WhiteboardState
	Mutex         sync.Mutex
	lastModified  time.Time
	saveScheduled bool
	timer         *time.Timer
}

type WhiteboardServer struct {
	redisClient  *redis.Client
	ctx          context.Context
	rooms        map[string]*Space
	mu           sync.RWMutex
	db           *gorm.DB
	debounceTime time.Duration
}

var (
	whiteboardServer *WhiteboardServer
	once             sync.Once
)

func NewWhiteboardServer(db *gorm.DB) *WhiteboardServer {
	once.Do(func() {
		ctx := context.Background()

		whiteboardServer = &WhiteboardServer{
			redisClient:  RedisClient,
			ctx:          ctx,
			rooms:        make(map[string]*Space),
			mu:           sync.RWMutex{},
			db:           db,
			debounceTime: 3 * time.Second,
		}

		go whiteboardServer.subscribeToRedis()
	})

	return whiteboardServer
}

func (ws *WhiteboardServer) saveWhiteboardState(spaceID uint, elements, appState json.RawMessage) error {
	var whiteboard models.SpaceWhiteboard
	result := ws.db.Where("space_id = ?", spaceID).First(&whiteboard)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			whiteboard = models.SpaceWhiteboard{
				SpaceID:  spaceID,
				Elements: elements,
				AppState: appState,
			}
			return ws.db.Create(&whiteboard).Error
		}
		return result.Error
	}

	whiteboard.Elements = elements
	whiteboard.AppState = appState
	return ws.db.Save(&whiteboard).Error
}

func (ws *WhiteboardServer) scheduleRoomSave(roomID string) {
	ws.mu.RLock()
	room, exists := ws.rooms[roomID]
	ws.mu.RUnlock()

	if !exists {
		return
	}

	room.Mutex.Lock()
	defer room.Mutex.Unlock()

	// Update the last modified time
	room.lastModified = time.Now()

	// If a save is already scheduled, don't schedule another one
	if room.saveScheduled {
		return
	}

	// Schedule a save operation
	room.saveScheduled = true

	// Create a new timer if one doesn't exist or reset the existing one
	if room.timer == nil {
		room.timer = time.AfterFunc(ws.debounceTime, func() {
			ws.saveRoomState(roomID)
		})
	} else {
		room.timer.Reset(ws.debounceTime)
	}
}

func (ws *WhiteboardServer) saveRoomState(roomID string) {
	ws.mu.RLock()
	room, exists := ws.rooms[roomID]
	ws.mu.RUnlock()

	if !exists {
		return
	}

	room.Mutex.Lock()
	if room.SpaceID == 0 {
		room.saveScheduled = false
		room.Mutex.Unlock()
		log.Printf("Room %s has no valid SpaceID, skipping save", roomID)
		return
	}

	elements := room.State.Elements
	appState := room.State.AppState
	spaceID := room.SpaceID
	room.saveScheduled = false
	room.Mutex.Unlock()

	log.Printf("Saving whiteboard state for space %d", spaceID)
	if err := ws.saveWhiteboardState(spaceID, elements, appState); err != nil {
		log.Printf("Error saving whiteboard state for space %d: %v", spaceID, err)
	}
}

func (ws *WhiteboardServer) subscribeToRedis() {
	pubsub := ws.redisClient.Subscribe(ws.ctx, "whiteboard:updates", "whiteboard:participants")
	defer pubsub.Close()

	ch := pubsub.Channel()
	for msg := range ch {
		var message map[string]interface{}
		if err := json.Unmarshal([]byte(msg.Payload), &message); err != nil {
			log.Printf("Error parsing Redis message: %v", err)
			continue
		}

		messageType, ok := message["type"].(string)
		if !ok {
			continue
		}

		roomID, ok := message["roomId"].(string)
		if !ok {
			continue
		}

		ws.mu.RLock()
		room, exists := ws.rooms[roomID]
		ws.mu.RUnlock()

		if !exists {
			continue
		}

		room.Mutex.Lock()
		if messageType == "scene-update" {
			msgBytes, _ := json.Marshal(message)
			var state WhiteboardState
			json.Unmarshal(msgBytes, &state)
			room.State = state

			go ws.scheduleRoomSave(roomID)
		}

		for client := range room.Clients {
			if err := client.WriteJSON(message); err != nil {
				log.Printf("Error broadcasting: %v", err)
			}
		}
		room.Mutex.Unlock()
	}
}

func (ws *WhiteboardServer) publishToRedis(channel string, message interface{}) {
	jsonMessage, err := json.Marshal(message)
	if err != nil {
		log.Printf("Error marshaling message: %v", err)
		return
	}

	err = ws.redisClient.Publish(ws.ctx, channel, jsonMessage).Err()
	if err != nil {
		log.Printf("Error publishing to Redis: %v", err)
	}
}

func (ws *WhiteboardServer) HandleWebSocket(c *websocket.Conn) {
	roomID := c.Params("spaceId")
	if roomID == "" {
		log.Println("Room ID is required")
		c.Close()
		return
	}

	var spaceID uint
	if _, err := fmt.Sscanf(roomID, "%d", &spaceID); err != nil {
		log.Printf("Invalid space ID format: %s", roomID)
	}

	nickname := c.Locals("nickName").(string)

	ws.mu.Lock()
	if _, exists := ws.rooms[roomID]; !exists {
		// Try to load existing whiteboard state from database
		var whiteboard models.SpaceWhiteboard
		var elements json.RawMessage = json.RawMessage("[]")
		var appState json.RawMessage = json.RawMessage("{}")

		if spaceID != 0 {
			if result := ws.db.Where("space_id = ?", spaceID).First(&whiteboard); result.Error == nil {
				elements = whiteboard.Elements
				appState = whiteboard.AppState
			}
		}

		ws.rooms[roomID] = &Space{
			Clients: make(map[*websocket.Conn]string),
			State: WhiteboardState{
				Type:     "scene-update",
				Elements: elements,
				AppState: appState,
			},
			SpaceID: spaceID,
		}
	}
	room := ws.rooms[roomID]
	ws.mu.Unlock()

	room.Mutex.Lock()
	room.Clients[c] = nickname
	room.Mutex.Unlock()

	defer func() {
		room.Mutex.Lock()
		delete(room.Clients, c)

		if len(room.Clients) == 0 {
			elements := room.State.Elements
			appState := room.State.AppState
			spaceID := room.SpaceID

			if room.timer != nil {
				room.timer.Stop()
			}

			room.Mutex.Unlock()

			if spaceID != 0 {
				log.Printf("Last client left, saving whiteboard state for space %d", spaceID)
				ws.saveWhiteboardState(spaceID, elements, appState)
			}

			ws.mu.Lock()
			delete(ws.rooms, roomID)
			ws.mu.Unlock()
		} else {
			room.Mutex.Unlock()
			ws.broadcastParticipants(roomID)
		}

		c.Close()
	}()

	err := c.WriteJSON(room.State)
	if err != nil {
		log.Println("Error sending initial state:", err)
		return
	}

	ws.broadcastParticipants(roomID)

	for {
		var message WhiteboardState
		if err := c.ReadJSON(&message); err != nil {
			log.Println("Error reading JSON:", err)
			break
		}

		if message.Type == "" {
			message.Type = "scene-update"
		}

		message.RoomID = roomID

		channel := "whiteboard:updates"
		ws.publishToRedis(channel, message)
	}
}

func (ws *WhiteboardServer) broadcastParticipants(roomID string) {
	ws.mu.RLock()
	room, exists := ws.rooms[roomID]
	ws.mu.RUnlock()

	if !exists {
		return
	}

	room.Mutex.Lock()
	participants := make([]string, 0, len(room.Clients))
	for _, username := range room.Clients {
		participants = append(participants, username)
	}
	room.Mutex.Unlock()

	ws.publishToRedis("whiteboard:participants", map[string]interface{}{
		"type":         "participants-update",
		"participants": participants,
		"roomId":       roomID,
	})
}
