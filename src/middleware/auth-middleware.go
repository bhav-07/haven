package middleware

import (
	"errors"
	"fmt"

	"github.com/bhav-07/haven/models"
	"github.com/bhav-07/haven/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
	"gorm.io/gorm"
)

func AuthMiddleware(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		cookieToken := c.Cookies("token")
		var tokenString string

		if cookieToken != "" {
			tokenString = cookieToken
		} else {
			return c.Status(fiber.StatusUnauthorized).JSON(&fiber.Map{
				"status":  "error",
				"message": "Unauthorized",
			})
		}

		claims, err := utils.VerifyJWT(tokenString)

		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(&fiber.Map{
				"status":  "error",
				"message": "Unauthorized",
			})
		}

		var id uint
		if idFloat, ok := claims["id"].(float64); ok {
			id = uint(idFloat) // Convert float64 to uint
		} else {
			fmt.Println("claims['id'] is not a float64, type:", fmt.Sprintf("%T", claims["id"]))
			return c.Status(fiber.StatusUnauthorized).JSON(&fiber.Map{
				"status":  "error",
				"message": "Invalid token payload",
			})
		}

		var user models.User
		if err := db.First(&user, id).Error; errors.Is(err, gorm.ErrRecordNotFound) {
			log.Warn("user not found in the db")
			c.ClearCookie("token")
			return c.Status(fiber.StatusUnauthorized).JSON(&fiber.Map{
				"status":  "error",
				"message": "Unauthorized",
			})
		}

		c.Locals("userId", id)
		c.Locals("userName", user.Name)
		c.Locals("nickName", user.Nickname)

		return c.Next()
	}
}
