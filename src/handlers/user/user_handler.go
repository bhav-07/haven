package user

import (
	"github.com/bhav-07/haven/models"
	"github.com/gofiber/fiber/v2"
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
			return db.Select("users.id", "users.name")
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
}
