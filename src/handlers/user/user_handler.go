package user

import (
	"github.com/bhav-07/haven/models"
	"github.com/bhav-07/haven/redis"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
	"gorm.io/gorm"
)

func UserHandlers(route fiber.Router, db *gorm.DB) {
	route.Get("/spaces", func(c *fiber.Ctx) error {
		userId, ok := c.Locals("userId").(uint)
		if !ok {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"status": "error",
				"error":  "Unable to get user details. Please login again",
			})
		}
		// var user models.User
		// if err := db.Preload("Spaces").First(&user, userId).Error; err != nil {
		// 	return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
		// 		"status": "error",
		// 		"error":  "Failed to retrieve user spaces",
		// 	})
		// }

		var spaces []models.Space
		result := db.Joins("JOIN user_spaces ON user_spaces.space_id = spaces.id").
			Where("user_spaces.user_id = ?", userId).Preload("Members", func(db *gorm.DB) *gorm.DB {
			return db.Select("users.id", "users.name", "users.nickname")
		}).
			Find(&spaces)
		if result.Error != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"status": "error",
				"error":  "Something went wrong while fetching user spaces",
			})
		}

		return c.JSON(fiber.Map{
			"status": "success",
			"data":   spaces,
		})

	})

	route.Patch("/nickname", func(c *fiber.Ctx) error {
		userId, ok := c.Locals("userId").(uint)
		if !ok {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"status": "error",
				"error":  "Unable to get user details. Please login again",
			})
		}

		type UpdateNameRequest struct {
			Nickname string `json:"nickname"`
		}
		req := new(UpdateNameRequest)

		if err := c.BodyParser(req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"status": "error",
				"error":  "Invalid request body",
			})
		}

		if len(req.Nickname) < 1 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"status": "error",
				"error":  "Name cannot be empty",
			})
		}

		result := db.Model(&models.User{}).Where("id = ?", userId).Update("nickname", req.Nickname)
		if result.Error != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"status": "error",
				"error":  "Failed to update user name",
			})
		}

		if result.RowsAffected == 0 {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"status": "error",
				"error":  "User not found",
			})
		}

		return c.JSON(fiber.Map{
			"status":  "success",
			"message": "User name updated successfully",
		})
	})

	route.Get("/status", func(c *fiber.Ctx) error {
		userId, ok := c.Locals("userId").(uint)
		if !ok {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"status": "error",
				"error":  "Unable to get user details. Please login again",
			})
		}

		var user models.User
		result := db.Select("id, status").Where("id = ?", userId).First(&user)
		if result.Error != nil {
			if result.Error == gorm.ErrRecordNotFound {
				return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
					"status": "error",
					"error":  "User not found",
				})
			}
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"status": "error",
				"error":  "Failed to get user status",
			})
		}

		return c.JSON(fiber.Map{
			"status": "success",
			"data": fiber.Map{
				"user_id": user.ID,
				"status":  user.Status,
			},
		})
	})

	route.Get("/status/options", func(c *fiber.Ctx) error {
		statuses := []fiber.Map{
			{"value": models.UserStatusOnline, "label": "Online", "description": "Available and active"},
			{"value": models.UserStatusAway, "label": "Away", "description": "Temporarily away"},
			{"value": models.UserStatusBusy, "label": "meeting", "description": "Busy in meeting"},
			{"value": models.UserStatusDND, "label": "DND", "description": "Do not disturb"},
		}

		return c.JSON(fiber.Map{
			"status": "success",
			"data":   statuses,
		})
	})

	route.Patch("/status", func(c *fiber.Ctx) error {
		userId, ok := c.Locals("userId").(uint)
		if !ok {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"status": "error",
				"error":  "Unable to get user details. Please login again",
			})
		}

		type UpdateStatusRequest struct {
			Status string `json:"status" validate:"required"`
		}
		req := new(UpdateStatusRequest)

		if err := c.BodyParser(req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"status": "error",
				"error":  "Invalid request body",
			})
		}

		// Validate status value
		userStatus := models.UserStatus(req.Status)
		if !userStatus.IsValid() {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"status": "error",
				"error":  "Invalid status. Valid statuses are: online, offline, away, busy, meeting, inactive",
			})
		}

		result := db.Model(&models.User{}).Where("id = ?", userId).Update("status", userStatus)
		if result.Error != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"status": "error",
				"error":  "Failed to update user status",
			})
		}

		if result.RowsAffected == 0 {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"status": "error",
				"error":  "User not found",
			})
		}

		if err := redis.PublishStatusUpdate(redis.RedisClient, userId, userStatus); err != nil {
			log.Error("Failed to publish status update to Redis: %v", err)
			// Don't fail the API request, just log the error
		}

		return c.JSON(fiber.Map{
			"status":  "success",
			"message": "User status updated successfully",
			"data": fiber.Map{
				"status": userStatus,
			},
		})
	})
}
