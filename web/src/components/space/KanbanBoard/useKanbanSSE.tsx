/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { TaskStatusType, TaskType } from "./types";
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

export const useKanbanSSE = (spaceId: string) => {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/kanban?spaceID=${spaceId}`
        );
        if (response.data.status === "error")
          throw new Error("Failed to fetch tasks");

        const data = await response.data.data;

        console.log(data);

        const mappedTasks: TaskType[] = data.map((task: any) => ({
          id: task.ID.toString(),
          status: task.status as TaskStatusType,
          title: task.title,
          description: task.description || "",
          priority: task.priority as "LOW" | "MEDIUM" | "HIGH",
          createdAt: new Date(task.CreatedAt).toISOString(),
          dueDate: (task.due_date as string) || "",
        }));

        console.log(mappedTasks);

        setTasks(mappedTasks);
      } catch (err) {
        setError("Failed to load tasks");
        console.error(err);
      }
    };

    fetchTasks();
  }, [spaceId]);

  const createTask = async (task: Omit<TaskType, "id" | "createdAt">) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/kanban?spaceID=${spaceId}`,
        {
          ...task,
          SpaceID: parseInt(spaceId, 10),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.status) throw new Error("Failed to create task");

      return true;
    } catch (err) {
      console.error("Error creating task:", err);
      return false;
    }
  };

  const updateTaskStatus = async (
    taskId: string,
    newStatus: TaskType["status"]
  ) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/kanban?spaceID=${spaceId}&taskID=${taskId}`,
        {
          new_status: newStatus,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.status) throw new Error("Failed to update task");

      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );

      return true;
    } catch (err) {
      console.error("Error updating task:", err);
      return false;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/kanban?spaceID=${spaceId}&taskID=${taskId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.status) throw new Error("Failed to delete task");

      setTasks((prev) => prev.filter((task) => task.id !== taskId));

      return true;
    } catch (err) {
      console.error("Error updating task:", err);
      return false;
    }
  };

  return {
    tasks,
    error,
    createTask,
    updateTaskStatus,
    deleteTask,
    setTasks,
  };
};
