package auth

import (
	"context"
	"fmt"
	"net/http"

	"github.com/bhav-07/haven/config"
	"github.com/bhav-07/haven/models"
	"github.com/bhav-07/haven/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
	"gorm.io/gorm"
)

func AuthHandlers(route fiber.Router, db *gorm.DB) {

	// Oauth handler
	route.Get("/google/callback", func(c *fiber.Ctx) error {
		googleOauthConfig := config.GetGoogleOauthConfig()
		code := c.Query("code")
		token, err := googleOauthConfig.Exchange(context.Background(), code)

		if err != nil {
			log.Warn("Error exchanging code: %v", err.Error())
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"status": "error",
				"error":  err.Error(),
			})
		}

		userInfo, err := utils.GetUserInfo(token.AccessToken)
		if err != nil {
			fmt.Println("Error getting user info: ", err.Error())
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
				"status": "error",
				"error":  err.Error(),
			})
		}

		var user models.User
		result := db.Where("email = ?", userInfo.Email).First(&user)

		if result.Error == gorm.ErrRecordNotFound {
			newUser := models.User{
				Email:    userInfo.Email,
				Name:     userInfo.Name,
				Nickname: userInfo.Name,
			}

			if err := db.Create(&newUser).Error; err != nil {
				log.Warn("Error creating user: %v", err.Error())
				return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
					"status": "error",
					"error":  "Failed to create user",
				})
			}
			userInfo.ID = newUser.ID
		} else if result.Error != nil {
			log.Warn("Database error: %v", result.Error)
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
				"status": "error",
				"error":  "Database error",
			})
		} else {
			userInfo.ID = user.ID
			userInfo.Nickname = user.Nickname
		}

		signedToken, err := utils.SignJWT(userInfo)
		if err != nil {
			fmt.Println("Error signing token: ", err.Error())
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
				"status": "error",
				"error":  err.Error(),
			})
		}

		c.Cookie(&fiber.Cookie{
			Name:     "token",
			Value:    signedToken,
			HTTPOnly: true,          // Prevent JavaScript access to the cookie for security
			Secure:   false,         // Set Secure to false for local development (use true for HTTPS)
			SameSite: "None",        // Allow cross-origin requests
			MaxAge:   3600 * 24 * 7, // 7 days
			Domain:   "localhost",   // Ensure this is "localhost" for local development
		})

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status":  "success",
			"message": "Authorized successfully",
		})
	})

	//Takes the cookie and verifies it
	route.Get("/me", func(c *fiber.Ctx) error {
		token := c.Cookies("token")
		if token == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"status": "error",
				"error":  "No token provided",
			})
		}

		claims, err := utils.VerifyJWT(token)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"status": "error",
				"error":  "Invalid token",
			})
		}

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status": "success",
			"user":   claims,
		})
	})
}
