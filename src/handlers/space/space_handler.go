package space

import (
	"encoding/json"
	"errors"
	"fmt"
	"strconv"

	"github.com/bhav-07/haven/models"
	"github.com/bhav-07/haven/utils"
	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
	"gorm.io/gorm"
)

func SpaceHandlers(route fiber.Router, db *gorm.DB) {

	route.Post("/space", func(c *fiber.Ctx) error {
		newSpace := new(models.Space)
		userId, ok := c.Locals("userId").(uint)
		if !ok {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"status": "error",
				"error":  "Unable to get user details. Please login again",
			})
		}

		user, err := utils.GetUserfromID(userId, db)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"status": "error",
				"error":  err.Error(),
			})
		}

		newSpace.CreatedBy = user.ID
		newSpace.Members = []models.User{user}
		if err := json.Unmarshal(c.Body(), &newSpace); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"status": "error",
				"error":  err.Error(),
			})
		}

		if err := db.Create(&newSpace).Error; err != nil {
			log.Warn("Error creating user: %v", err.Error())
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"status": "error",
				"error":  "Failed to create user",
			})
		}

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status":  "success",
			"message": "space created successfully",
		})
	})

	route.Get("/space/:id", func(c *fiber.Ctx) error {
		userId, ok := c.Locals("userId").(uint)
		if !ok {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"status": "error",
				"error":  "Unable to get user details. Please login again",
			})
		}

		spaceIdstring := c.Params("id")
		spaceId, err := strconv.ParseUint(spaceIdstring, 10, 64)
		if err != nil {
			log.Warn("Unable to convert string to uint")
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"status": "error",
				"error":  "Unable to convert string to uint",
			})
		}

		var space models.Space
		result := db.Joins("JOIN user_spaces ON user_spaces.space_id = spaces.id").
			Where("spaces.id = ? AND user_spaces.user_id = ?", spaceId, userId).Preload("Members", func(db *gorm.DB) *gorm.DB {
			return db.Select("users.id", "users.name")
		}).
			First(&space)
		if result.Error != nil {
			if errors.Is(result.Error, gorm.ErrRecordNotFound) {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"status": "error",
					"error":  "space not found or user is not a member",
				})
			}
		}

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status": "success",
			"data":   space,
		})
	})

	route.Use("space/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	route.Get("space/ws/:id", websocket.New(func(c *websocket.Conn) {
		var (
			mt  int
			msg []byte
			err error
		)
		for {
			if mt, msg, err = c.ReadMessage(); err != nil {
				fmt.Println("read:", err)
				break
			}
			fmt.Printf("recv: %s", msg)

			if err = c.WriteMessage(mt, msg); err != nil {
				fmt.Println("write:", err)
				break
			}
		}

	}))
}
