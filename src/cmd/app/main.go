package main

import (
	"fmt"

	"github.com/bhav-07/haven/config"
	"github.com/bhav-07/haven/db"
	"github.com/bhav-07/haven/handlers/auth"
	"github.com/bhav-07/haven/handlers/kanban"
	"github.com/bhav-07/haven/handlers/space"
	"github.com/bhav-07/haven/handlers/user"
	"github.com/bhav-07/haven/handlers/whiteboard"
	"github.com/bhav-07/haven/middleware"
	"github.com/bhav-07/haven/models"
	"github.com/bhav-07/haven/redis"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func init() {
	config.LoadConfig()
	_, err := db.InitializeDB()
	redis.InitializeRedis()
	if err != nil {
		log.Error("Failed to initialize database", "error", err.Error())
		panic(err)
	}

	err = db.DB.AutoMigrate(&models.User{}, &models.Space{}, &models.SpaceWhiteboard{}, &models.KanbanTasks{})
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

	app.Get("/ping", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status":  "success",
			"message": "pong",
		})
	})

	auth.AuthHandlers(app.Group("/auth"), db.DB)

	protected := app.Use(middleware.AuthMiddleware(db.DB))

	space.SpaceHandlers(protected, db.DB)

	kanban.KanbanHandlers(protected.Group("/kanban"), db.DB)

	whiteboard.WhiteboardHandlers(protected, db.DB)

	user.UserHandlers(protected.Group("/user"), db.DB)

	protected.Get("/secure", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status":  "success",
			"message": "You are authenticated",
		})
	})

	if err := app.Listen(":8080"); err != nil {
		log.Error(err)
	}
}
