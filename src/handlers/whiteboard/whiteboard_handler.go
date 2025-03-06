package whiteboard

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// WhiteboardState represents the Excalidraw scene state
type WhiteboardState struct {
	Type     string          `json:"type"`
	Elements json.RawMessage `json:"elements"`
	AppState json.RawMessage `json:"appState,omitempty"`
	RoomID   string          `json:"roomId,omitempty"`
	Username string          `json:"username,omitempty"`
}

// RoomParticipants tracks users in each room
type RoomParticipants struct {
	Type         string   `json:"type"`
	Participants []string `json:"participants"`
}

// Room structure to track room-specific data
type Room struct {
	Clients map[*websocket.Conn]string // maps connections to usernames
	State   WhiteboardState
	Mutex   sync.Mutex
}

var (
	// Rooms maps room IDs to room data
	rooms = make(map[string]*Room)
	// Global mutex for rooms map access
	globalMutex = sync.Mutex{}
)

// WhiteboardWebSocketHandler handles WebSocket connections for the whiteboard
func WhiteboardWebSocketHandler(c *websocket.Conn) {
	// Get room ID from URL parameter
	roomID := c.Params("spaceId")
	if roomID == "" {
		log.Println("Room ID is required")
		c.Close()
		return
	}

	// Get username from query param or set default
	username := c.Query("username")
	if username == "" {
		username = "anonymous"
	}

	// Initialize room if it doesn't exist
	globalMutex.Lock()
	if _, exists := rooms[roomID]; !exists {
		rooms[roomID] = &Room{
			Clients: make(map[*websocket.Conn]string),
			State: WhiteboardState{
				Type:     "scene-update",
				Elements: json.RawMessage("[]"),
			},
		}
	}
	room := rooms[roomID]
	globalMutex.Unlock()

	// Register client in room
	room.Mutex.Lock()
	room.Clients[c] = username
	room.Mutex.Unlock()

	// Setup clean-up on disconnect
	defer func() {
		// Remove client from room
		room.Mutex.Lock()
		delete(room.Clients, c)

		// If room is empty, delete it
		if len(room.Clients) == 0 {
			room.Mutex.Unlock()
			globalMutex.Lock()
			delete(rooms, roomID)
			globalMutex.Unlock()
		} else {
			room.Mutex.Unlock()
			// Broadcast updated participants list
			broadcastParticipants(roomID)
		}

		c.Close()
	}()

	// Send current state to the new client
	err := c.WriteJSON(room.State)
	if err != nil {
		log.Println("Error sending initial state:", err)
		return
	}

	// Broadcast updated participants list
	broadcastParticipants(roomID)

	// Handle incoming messages
	for {
		var message WhiteboardState
		if err := c.ReadJSON(&message); err != nil {
			log.Println("Error reading JSON:", err)
			break
		}

		// Set message type if not provided
		if message.Type == "" {
			message.Type = "scene-update"
		}

		// Add room ID
		message.RoomID = roomID
		message.Username = username

		// Update room state
		room.Mutex.Lock()
		if message.Type == "scene-update" {
			room.State = message
		}

		// Broadcast to all clients in the room
		for client := range room.Clients {
			if err := client.WriteJSON(message); err != nil {
				log.Println("Error broadcasting:", err)
				// Don't remove here - let the client's disconnect handler do it
			}
		}
		room.Mutex.Unlock()
	}
}

// broadcastParticipants sends the updated participants list to all clients in a room
func broadcastParticipants(roomID string) {
	globalMutex.Lock()
	room, exists := rooms[roomID]
	globalMutex.Unlock()

	if !exists {
		return
	}

	room.Mutex.Lock()
	defer room.Mutex.Unlock()

	// Collect usernames
	participants := make([]string, 0, len(room.Clients))
	for _, username := range room.Clients {
		participants = append(participants, username)
	}

	// Create participants update message
	message := RoomParticipants{
		Type:         "participants-update",
		Participants: participants,
	}

	// Broadcast to all clients in the room
	for client := range room.Clients {
		if err := client.WriteJSON(message); err != nil {
			log.Println("Error broadcasting participants:", err)
		}
	}
}

// WhiteboardHandlers registers the whiteboard routes
func WhiteboardHandlers(route fiber.Router, db *gorm.DB) {
	// WebSocket upgrade middleware
	route.Use("/whiteboard/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	// WebSocket endpoint with room parameter
	route.Get("/whiteboard/ws/:spaceId", websocket.New(WhiteboardWebSocketHandler))
}
