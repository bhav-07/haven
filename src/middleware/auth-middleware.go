package middleware

import (
	"errors"
	"fmt"

	"github.com/bhav-07/haven/handlers/auth"
	"github.com/bhav-07/haven/models"
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
		}

		claims, err := auth.VerifyJWT(tokenString)
		fmt.Println(claims["id"])

		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(&fiber.Map{
				"status":  "error",
				"message": "Unauthorized",
			})
		}
		id, ok := claims["id"].(float64) // JWT claims often return numbers as float64
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(&fiber.Map{
				"status":  "error",
				"message": "Invalid token payload",
			})
		}

		var user models.User
		if err := db.First(&user, uint(id)).Error; errors.Is(err, gorm.ErrRecordNotFound) {
			log.Warn("user not found in the db")
			c.ClearCookie("token")
			return c.Status(fiber.StatusUnauthorized).JSON(&fiber.Map{
				"status":  "error",
				"message": "Unauthorized",
			})
		}

		c.Locals("userId", claims["id"])

		return c.Next()
	}
}
