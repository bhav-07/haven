package whiteboard

import (
	"github.com/bhav-07/haven/redis"
	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func WhiteboardHandlers(route fiber.Router, db *gorm.DB) {

	whiteboardServer := redis.NewWhiteboardServer(db)

	route.Use("/whiteboard/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	route.Get("/whiteboard/ws/:spaceId", websocket.New(whiteboardServer.HandleWebSocket))
}
