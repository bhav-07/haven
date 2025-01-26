package main

import (
	"fmt"

	"github.com/bhav-07/haven/config"
	"github.com/bhav-07/haven/db"
	"github.com/bhav-07/haven/handlers/auth"
	"github.com/bhav-07/haven/handlers/space"
	"github.com/bhav-07/haven/middleware"
	"github.com/bhav-07/haven/models"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func init() {
	config.LoadConfig()
	_, err := db.InitializeDB()
	if err != nil {
		log.Error("Failed to initialize database", "error", err.Error())
		panic(err)
	}

	err = db.DB.AutoMigrate(&models.User{}, &models.Space{})
	if err != nil {
		log.Error("Error migrating database", "error", err.Error())
		panic(fmt.Sprintf("Error migrating database: %v", err))
	}
}

func main() {
	app := fiber.New(fiber.Config{AppName: "Haven"})
	defer db.CloseDB(db.DB)

	app.Use(logger.New())

	app.Use(cors.New(*config.GetCORSConfig()))

	auth.AuthHandlers(app.Group("/auth"), db.DB)

	protected := app.Use(middleware.AuthMiddleware(db.DB))

	space.SpaceHandlers(protected, db.DB)

	protected.Get("/secure", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status":  "success",
			"message": "You are authenticated",
		})
	})

	app.Get("/ping", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status":  "success",
			"message": "pong",
		})
	})

	app.Listen(":8080")
}
