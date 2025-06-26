package kanban

import (
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/bhav-07/haven/models"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
	"gorm.io/gorm"
)

func KanbanHandlers(route fiber.Router, db *gorm.DB) {
	route.Post("/", func(c *fiber.Ctx) error {
		spaceId := c.Query("spaceID")

		spaceIdUINT, err := strconv.ParseUint(spaceId, 10, 64)

		if err != nil {
			log.Warn("Unable to convert string to uint")
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"status": "error",
				"error":  "Unable to convert string to uint",
			})
		}

		newTask := new(models.KanbanTasks)

		newTask.SpaceID = uint(spaceIdUINT)

		if err := json.Unmarshal(c.Body(), &newTask); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"status": "error",
				"error":  err.Error(),
			})
		}

		if err := db.Create(&newTask).Error; err != nil {
			log.Warn("Error creating Task: %v", err.Error())
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"status": "error",
				"error":  "Failed to create task",
			})
		}

		// taskJSON, _ := json.Marshal(fiber.Map{
		// 	"type": "create",
		// 	"task": newTask,
		// })
		// clientManager.BroadcastToSpace(newTask.SpaceID, taskJSON)

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status":  "success",
			"message": "Task created successfully",
		})
	})

	route.Get("/", func(c *fiber.Ctx) error {
		spaceId := c.Query("spaceID")

		spaceIdUINT, err := strconv.ParseUint(spaceId, 10, 64)

		if err != nil {
			log.Warn("Unable to convert string to uint")
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"status": "error",
				"error":  "Unable to convert string to uint",
			})
		}

		tasks := new([]models.KanbanTasks)

		if err := db.Where(&models.KanbanTasks{SpaceID: uint(spaceIdUINT)}).Find(&tasks).Error; err != nil {
			log.Warn("Error creating Task: %v", err.Error())
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"status": "error",
				"error":  "Failed to create task",
			})
		}

		return c.JSON(fiber.Map{
			"status": "success",
			"data":   tasks,
		})
	})

	route.Patch("/", func(c *fiber.Ctx) error {
		spaceId := c.Query("spaceID")
		taskId := c.Query("taskID")

		spaceIdUINT, err1 := strconv.ParseUint(spaceId, 10, 64)
		taskIdUINT, err2 := strconv.ParseUint(taskId, 10, 64)

		if err1 != nil || err2 != nil {
			log.Warn("Unable to convert string to uint")
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"status": "error",
				"error":  "Unable to convert string to uint",
			})
		}
		type UpdateTaskStatusRequest struct {
			NewStatus string `json:"new_status"`
		}
		req := new(UpdateTaskStatusRequest)

		if err := c.BodyParser(req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"status": "error",
				"error":  "Invalid request body",
			})
		}

		fmt.Println(req.NewStatus)

		result := db.Model(&models.KanbanTasks{}).Where("id = ? AND space_id = ?", taskIdUINT, spaceIdUINT).Update("status", req.NewStatus)
		if result.Error != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"status": "error",
				"error":  "Failed to update task",
			})
		}

		if result.RowsAffected == 0 {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"status": "error",
				"error":  "Task found",
			})
		}

		return c.JSON(fiber.Map{
			"status":  "success",
			"message": "Task updated successfully",
		})

	})

	route.Delete("/", func(c *fiber.Ctx) error {
		spaceId := c.Query("spaceID")
		taskId := c.Query("taskID")

		spaceIdUINT, err1 := strconv.ParseUint(spaceId, 10, 64)
		taskIdUINT, err2 := strconv.ParseUint(taskId, 10, 64)

		if err1 != nil || err2 != nil {
			log.Warn("Unable to convert string to uint")
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"status": "error",
				"error":  "Unable to convert string to uint",
			})
		}

		task := new(models.KanbanTasks)

		task.SpaceID = uint(spaceIdUINT)
		task.ID = uint(taskIdUINT)

		if err := db.Delete(&task).Error; err != nil {
			log.Warn("Error creating Task: %v", err.Error())
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"status": "error",
				"error":  "Failed to create task",
			})
		}

		// taskJSON, _ := json.Marshal(fiber.Map{
		// 	"type":   "delete",
		// 	"taskID": task.ID,
		// })
		// clientManager.BroadcastToSpace(task.SpaceID, taskJSON)

		return c.JSON(fiber.Map{
			"status":  "success",
			"message": "Task deleted successfully",
		})
	})
}
