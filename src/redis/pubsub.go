package redis

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"github.com/bhav-07/haven/models"
	"github.com/bhav-07/haven/utils"
	"github.com/go-redis/redis/v8"
	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2/log"
	"gorm.io/gorm"
)

type Message struct {
	Type    string      `json:"type"`
	Content interface{} `json:"content"`
	Time    time.Time   `json:"time"`
}

type Position struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

type ChatMessage struct {
	Time    time.Time `json:"time"`
	Content string    `json:"content"`
	Author  string    `json:"author"`
}

type Player struct {
	ID       string            `json:"id"`
	Name     string            `json:"name"`
	SpaceID  string            `json:"space_id"`
	Nickname string            `json:"nickname"`
	Position Position          `json:"position"`
	Conn     *websocket.Conn   `json:"-"`
	Status   models.UserStatus `json:"status"`
}

type SpaceServer struct {
	redisClient *redis.Client
	ctx         context.Context
	spaces      map[string]map[string]*Player
	mu          sync.RWMutex
	spaceChats  map[string][]ChatMessage
}

func NewSpaceServer() (*SpaceServer, error) {
	ctx := context.Background()

	gs := &SpaceServer{
		redisClient: RedisClient,
		ctx:         ctx,
		spaces:      make(map[string]map[string]*Player),
		spaceChats:  make(map[string][]ChatMessage),
	}

	go gs.subscribeToRedis()

	return gs, nil
}

func (gs *SpaceServer) subscribeToRedis() {
	pubsub := gs.redisClient.Subscribe(gs.ctx, "game:positions", "game:events", "user:status_updates", "game:chat")
	defer pubsub.Close()

	ch := pubsub.Channel()
	for msg := range ch {
		var message Message
		if err := json.Unmarshal([]byte(msg.Payload), &message); err != nil {
			log.Error("Error parsing Redis message: %v", err)
			continue
		}

		switch msg.Channel {
		case "user:status_updates":
			gs.handleStatusUpdate(message)
		case "game:chat":
			gs.handleChatMessage(message)
		default:
			gs.broadcastToSpacePlayers(message)
		}
	}
}

func (gs *SpaceServer) handleStatusUpdate(message Message) {
	content, ok := message.Content.(map[string]interface{})
	if !ok {
		return
	}

	userIdStr, ok := content["user_id"].(string)
	if !ok {
		return
	}

	newStatus, ok := content["status"].(string)
	if !ok {
		return
	}

	gs.mu.Lock()
	defer gs.mu.Unlock()

	for spaceID, players := range gs.spaces {
		if player, exists := players[userIdStr]; exists {
			player.Status = models.UserStatus(newStatus)

			statusUpdateMessage := Message{
				Type: "status_update",
				Content: map[string]interface{}{
					"player_id":       player.ID,
					"player_name":     player.Name,
					"player_nickname": player.Nickname,
					"space_id":        spaceID,
					"status":          player.Status,
				},
				Time: time.Now(),
			}

			for _, p := range players {
				if err := p.Conn.WriteJSON(statusUpdateMessage); err != nil {
					log.Error("Error sending status update to player %s: %v", p.ID, err)
				}
			}
		}
	}
}

func (gs *SpaceServer) handleChatMessage(message Message) {
	content, ok := message.Content.(map[string]interface{})
	if !ok {
		return
	}

	spaceID, ok := content["space_id"].(string)
	if !ok {
		return
	}

	chatMsg := ChatMessage{
		Time:    time.Now(),
		Content: content["content"].(string),
		Author:  content["author"].(string),
	}

	gs.mu.Lock()
	defer gs.mu.Unlock()

	if _, exists := gs.spaceChats[spaceID]; !exists {
		gs.spaceChats[spaceID] = []ChatMessage{}
	}

	messages := append(gs.spaceChats[spaceID], chatMsg)
	if len(messages) > 50 {
		messages = messages[len(messages)-50:]
	}
	gs.spaceChats[spaceID] = messages

	if players, exists := gs.spaces[spaceID]; exists {
		chatMsg := Message{
			Type:    "chat_message",
			Content: chatMsg,
			Time:    time.Now(),
		}
		for _, player := range players {
			if err := player.Conn.WriteJSON(chatMsg); err != nil {
				log.Error("Error sending chat to player %s: %v", player.ID, err)
			}
		}
	}
}

func PublishStatusUpdate(redisClient *redis.Client, userID uint, status models.UserStatus) error {
	ctx := context.Background()

	message := Message{
		Type: "status_update",
		Content: map[string]interface{}{
			"user_id": fmt.Sprintf("%d", userID),
			"status":  string(status),
		},
		Time: time.Now(),
	}

	jsonMessage, err := json.Marshal(message)
	if err != nil {
		return fmt.Errorf("error marshaling status update message: %v", err)
	}

	err = redisClient.Publish(ctx, "user:status_updates", jsonMessage).Err()
	if err != nil {
		return fmt.Errorf("error publishing status update to Redis: %v", err)
	}

	return nil
}

func (gs *SpaceServer) broadcastToSpacePlayers(message Message) {
	gs.mu.RLock()
	defer gs.mu.RUnlock()

	content, ok := message.Content.(map[string]interface{})
	if !ok {
		return
	}

	spaceID, ok := content["space_id"].(string)
	if !ok {
		return
	}

	for _, player := range gs.spaces[spaceID] {
		err := player.Conn.WriteJSON(message)
		if err != nil {
			log.Error("Error sending to player %s: %v", player.ID, err)
		}
	}
}

func (gs *SpaceServer) HandleWebSocket(c *websocket.Conn, db *gorm.DB) {

	userId, ok := c.Locals("userId").(uint)
	if !ok {
		log.Error("Unable to get userId")
		return
	}

	user, err := utils.GetUserfromID(userId, db)

	if err != nil {
		log.Errorf("Couldnt get user info using used id: %v", userId)
		c.Close()
	}

	spaceIdstring := c.Params("id")
	// spaceId, err := strconv.ParseUint(spaceIdstring, 10, 64)
	// if err != nil {
	// 	log.Warn("Unable to convert string to uint")
	// 	return
	// }
	userIdStr := fmt.Sprintf("%d", userId)

	player := &Player{
		ID:       userIdStr,
		Name:     user.Name,
		SpaceID:  spaceIdstring,
		Nickname: user.Nickname,
		Conn:     c,
		Position: Position{X: 850, Y: 1040},
		Status:   user.Status,
	}

	gs.mu.Lock()
	if gs.spaces[spaceIdstring] == nil {
		gs.spaces[spaceIdstring] = make(map[string]*Player)
		gs.spaceChats[spaceIdstring] = []ChatMessage{}
	}

	var currentPlayersInSpace []Player
	for userId, players := range gs.spaces[spaceIdstring] {
		if userId != userIdStr {
			//Send all players info except user themselves
			currentPlayersInSpace = append(currentPlayersInSpace, *players)
		}
	}
	gs.spaces[spaceIdstring][userIdStr] = player
	chatHistory := gs.spaceChats[spaceIdstring]
	gs.mu.Unlock()

	if len(chatHistory) > 0 {
		historyMsg := Message{
			Type:    "chat_history",
			Content: chatHistory,
			Time:    time.Now(),
		}
		if err := player.Conn.WriteJSON(historyMsg); err != nil {
			log.Errorf("Error sending chat history: %v", err)
		}
	}

	joinMessage := map[string]interface{}{
		"type":    "existing_players",
		"content": currentPlayersInSpace,
		"time":    time.Now(),
	}

	if err := player.Conn.WriteJSON(joinMessage); err != nil {
		log.Errorf("Error sending existing players to new player: %v", err)
	}

	gs.publishToRedis("game:events", "player_joined", map[string]interface{}{
		"player_id":       player.ID,
		"player_nickname": player.Nickname,
		"player_name":     player.Name,
		"space_id":        spaceIdstring,
		"position":        player.Position,
		"status":          player.Status,
	})

	gs.handlePlayerMessages(player)
}

func (gs *SpaceServer) handlePlayerMessages(player *Player) {
	defer func() {
		gs.handlePlayerDisconnect(player)
	}()

	for {
		messageType, msg, err := player.Conn.ReadMessage()
		if err != nil {
			return
		}

		if messageType != websocket.TextMessage {
			continue
		}

		var message struct {
			Type     string   `json:"type"`
			Position Position `json:"position,omitempty"`
			Content  string   `json:"content,omitempty"`
		}

		if err := json.Unmarshal(msg, &message); err != nil {
			log.Error("Error parsing WebSocket message: %v", err)
			continue
		}

		switch message.Type {
		case "position_update":
			player.Position = message.Position
			gs.publishToRedis("game:positions", "position_update", map[string]interface{}{
				"player_id":       player.ID,
				"space_id":        player.SpaceID,
				"position":        message.Position,
				"player_name":     player.Name,
				"player_nickname": player.Nickname,
				"status":          player.Status,
			})
		case "chat_message":
			gs.publishToRedis("game:chat", "chat_message", map[string]interface{}{
				"space_id": player.SpaceID,
				"content":  message.Content,
				"author":   player.Nickname,
			})
			println(message.Content)
		default:
			log.Warnf("Unknown message type received: %s", message.Type)
		}

	}
}

func (gs *SpaceServer) handlePlayerDisconnect(player *Player) {
	gs.mu.Lock()
	delete(gs.spaces[player.SpaceID], player.ID)

	if len(gs.spaces[player.SpaceID]) == 0 {
		delete(gs.spaces, player.SpaceID)
	}
	gs.mu.Unlock()

	player.Conn.Close()

	gs.publishToRedis("game:events", "player_left", map[string]interface{}{
		"player_id":       player.ID,
		"player_name":     player.Name,
		"space_id":        player.SpaceID,
		"player_nickname": player.Nickname,
	})
}

func (gs *SpaceServer) publishToRedis(channel string, messageType string, content interface{}) {
	message := Message{
		Type:    messageType,
		Content: content,
		Time:    time.Now(),
	}

	jsonMessage, err := json.Marshal(message)
	if err != nil {
		log.Error("Error marshaling message: %v", err)
		return
	}

	err = gs.redisClient.Publish(gs.ctx, channel, jsonMessage).Err()
	if err != nil {
		log.Error("Error publishing to Redis: %v", err)
	}
}
