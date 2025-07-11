package space

import (
	"encoding/json"
	"errors"
	"fmt"
	"strconv"

	"github.com/bhav-07/haven/models"
	"github.com/bhav-07/haven/redis"
	"github.com/bhav-07/haven/utils"
	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
	"gorm.io/gorm"
)

func SpaceHandlers(route fiber.Router, db *gorm.DB) {

	spaceServer, err := redis.NewSpaceServer()
	if err != nil {
		log.Error("Unable to create a space server: %v", err.Error())
	}

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
			return db.Select("users.id", "users.name", "users.nickname")
		}).
			First(&space)
		if result.Error != nil {
			if errors.Is(result.Error, gorm.ErrRecordNotFound) {
				return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
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

	route.Patch("/space/:id/join", func(c *fiber.Ctx) error {
		userId, ok := c.Locals("userId").(uint)
		if !ok {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"status": "error",
				"error":  "Unable to get user details. Please login again",
			})
		}

		// Get the space ID from the URL parameter
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
		if err := db.Preload("Members").First(&space, spaceId).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"status": "error",
				"error":  "Space not found",
			})
		}

		var user models.User
		if err := db.First(&user, userId).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"status": "error",
				"error":  "User not found",
			})
		}

		for _, member := range space.Members {
			if member.ID == userId {
				return c.Status(fiber.StatusConflict).JSON(fiber.Map{
					"status": "error",
					"error":  "User is already a member of this space",
				})
			}
		}

		if err := db.Model(&space).Association("Members").Append(&user); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"status": "error",
				"error":  "Failed to add user to the space",
			})
		}

		return c.JSON(fiber.Map{
			"status":  "success",
			"message": "User successfully added to the space",
		})
	})

	route.Delete("/space/:id", func(c *fiber.Ctx) error {
		userId, ok := c.Locals("userId").(uint)
		fmt.Println(userId)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
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
		if err := db.First(&space, spaceId).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"status": "error",
				"error":  "Space not found",
			})
		}
		if space.CreatedBy != userId {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"status": "error",
				"error":  "You are not authorized to delete this space",
			})
		}

		if err := db.Delete(&space).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"status": "error",
				"error":  "Failed to delete space",
			})
		}

		successMessage := fmt.Sprintf("Space #%s %s deleted successfully", spaceIdstring, space.Name)

		return c.JSON(fiber.Map{
			"status":  "success",
			"message": successMessage,
		})

	})

	route.Use("/space/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	route.Get("/space/ws/:id", websocket.New(func(c *websocket.Conn) {
		spaceServer.HandleWebSocket(c, db)
	}))

}
