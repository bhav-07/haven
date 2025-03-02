package redis

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2/log"
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

type Player struct {
	ID       string          `json:"id"`
	Name     string          `json:"name"`
	SpaceID  string          `json:"space_id"`
	Position Position        `json:"position"`
	Conn     *websocket.Conn `json:"-"`
}

type SpaceServer struct {
	redisClient *redis.Client
	ctx         context.Context
	spaces      map[string]map[string]*Player
	mu          sync.RWMutex
}

func NewSpaceServer() (*SpaceServer, error) {
	ctx := context.Background()

	gs := &SpaceServer{
		redisClient: RedisClient,
		ctx:         ctx,
		spaces:      make(map[string]map[string]*Player),
	}

	go gs.subscribeToRedis()

	return gs, nil
}

func (gs *SpaceServer) subscribeToRedis() {
	pubsub := gs.redisClient.Subscribe(gs.ctx, "game:positions", "game:events")
	defer pubsub.Close()

	ch := pubsub.Channel()
	for msg := range ch {
		var message Message
		if err := json.Unmarshal([]byte(msg.Payload), &message); err != nil {
			log.Error("Error parsing Redis message: %v", err)
			continue
		}

		gs.broadcastToSpacePlayers(message)
	}
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

func (gs *SpaceServer) HandleWebSocket(c *websocket.Conn) {

	userId, ok := c.Locals("userId").(uint)
	if !ok {
		log.Error("Unable to get userId")
		return
	}

	userName := c.Locals("userName").(string)

	spaceIdstring := c.Params("id")
	// spaceId, err := strconv.ParseUint(spaceIdstring, 10, 64)
	// if err != nil {
	// 	log.Warn("Unable to convert string to uint")
	// 	return
	// }
	userIdStr := fmt.Sprintf("%d", userId)

	player := &Player{
		ID:       userIdStr,
		Name:     userName,
		SpaceID:  spaceIdstring,
		Conn:     c,
		Position: Position{X: 850, Y: 1040},
	}

	gs.mu.Lock()
	if gs.spaces[spaceIdstring] == nil {
		gs.spaces[spaceIdstring] = make(map[string]*Player)
	}
	gs.spaces[spaceIdstring][userIdStr] = player
	gs.mu.Unlock()

	gs.mu.Lock()
	var currentPlayersInSpace []Player
	for userId, players := range gs.spaces[spaceIdstring] {
		if userId != userIdStr {
			//Send all players info except user themselves
			currentPlayersInSpace = append(currentPlayersInSpace, *players)
		}
	}
	gs.mu.Unlock()

	joinMessage := map[string]interface{}{
		"type":    "existing_players",
		"content": currentPlayersInSpace,
		"time":    time.Now(),
	}

	if err := player.Conn.WriteJSON(joinMessage); err != nil {
		log.Errorf("Error sending existing players to new player: %v", err)
	}

	gs.publishToRedis("game:events", "player_joined", map[string]interface{}{
		"player_id":   player.ID,
		"player_name": player.Name,
		"space_id":    spaceIdstring,
		"position":    player.Position,
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

		var msgData struct {
			Type     string   `json:"type"`
			Position Position `json:"position"`
		}

		if err := json.Unmarshal(msg, &msgData); err != nil {
			log.Error("Error parsing WebSocket message: %v", err)
			continue
		}

		switch msgData.Type {
		case "position_update":
			player.Position = msgData.Position
			gs.publishToRedis("game:positions", "position_update", map[string]interface{}{
				"player_id":   player.ID,
				"space_id":    player.SpaceID,
				"position":    msgData.Position,
				"player_name": player.Name,
			})
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
		"player_id":   player.ID,
		"player_name": player.Name,
		"space_id":    player.SpaceID,
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
