import { useState } from "react";
import { ColumnType, TaskType } from "./types";
import { Column } from "./Column";
import { DndContext, DragEndEvent } from "@dnd-kit/core";

const COLUMNS: ColumnType[] = [
  { id: "TODO", title: "To Do" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "IN_REVIEW", title: "In Review" },
  { id: "DONE", title: "Done" },
];

const INITIAL_TASKS: TaskType[] = [
  {
    id: "1",
    title: "Research Project",
    description: "Gather requirements and create initial documentation",
    status: "TODO",
    priority: "HIGH",
    createdAt: new Date().toISOString(),
    dueDate: new Date("2025-03-20").toISOString(), // 🟢 3 days left
  },
  {
    id: "2",
    title: "Design System",
    description: "Create component library and design tokens",
    status: "TODO",
    priority: "MEDIUM",
    createdAt: new Date().toISOString(),
    dueDate: new Date("2025-03-17").toISOString(), // 🟡 Due today
  },
  {
    id: "3",
    title: "API Integration",
    description: "Implement REST API endpoints",
    status: "IN_PROGRESS",
    priority: "HIGH",
    createdAt: new Date().toISOString(),
    dueDate: new Date("2025-03-15").toISOString(), // 🔴 2 days overdue
  },
  {
    id: "4",
    title: "Testing",
    description: "Write unit tests for core functionality",
    status: "DONE",
    priority: "LOW",
    createdAt: new Date().toISOString(),
    dueDate: new Date("2025-03-12").toISOString(), // 🔴 5 days overdue
  },
  {
    id: "5",
    title: "Database Schema",
    description: "Design and implement database schema using PostgreSQL",
    status: "IN_REVIEW",
    priority: "HIGH",
    createdAt: new Date().toISOString(),
    dueDate: new Date("2025-03-25").toISOString(), // 🟢 8 days left
  },
  {
    id: "6",
    title: "Authentication",
    description: "Implement user authentication using OAuth and JWT",
    status: "IN_PROGRESS",
    priority: "HIGH",
    createdAt: new Date().toISOString(),
    dueDate: new Date("2025-03-10").toISOString(), // 🔴 7 days overdue
  },
  {
    id: "7",
    title: "Frontend Development",
    description: "Build UI components and pages in React",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    createdAt: new Date().toISOString(),
    dueDate: new Date("2025-03-30").toISOString(), // 🟢 13 days left
  },
  {
    id: "8",
    title: "Deployment",
    description: "Set up CI/CD pipelines and deploy to production",
    status: "IN_REVIEW",
    priority: "HIGH",
    createdAt: new Date().toISOString(),
    dueDate: new Date("2025-03-17").toISOString(), // 🟡 Due today
  },
  {
    id: "9",
    title: "Bug Fixes",
    description: "Resolve known issues and optimize performance",
    status: "TODO",
    priority: "MEDIUM",
    createdAt: new Date().toISOString(),
    dueDate: new Date("2025-03-28").toISOString(), // 🟢 11 days left
  },
  {
    id: "10",
    title: "Documentation",
    description: "Write technical documentation and API references",
    status: "DONE",
    priority: "LOW",
    createdAt: new Date().toISOString(),
    dueDate: new Date("2025-03-05").toISOString(), // 🔴 12 days overdue
  },
];

const KanbanBoard = ({ onClose }: { onClose: () => void }) => {
  const [tasks, setTasks] = useState<TaskType[]>(INITIAL_TASKS);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskType["status"];

    setTasks(() =>
      tasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  }

  return (
    <div className="w-full h-full p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold">Kanban Board</h1>
        <button
          onClick={onClose}
          className="text-neutral-100 bg-neutral-700 text-lg px-3 py-2 rounded-lg"
        >
          Close
        </button>
      </div>
      <div className="gap-4 grid grid-cols-2 md:grid-cols-4 overflow-x-auto h-full scrollbar-thin">
        <DndContext onDragEnd={handleDragEnd}>
          {COLUMNS.map((column) => {
            return (
              <Column
                column={column}
                key={column.id}
                tasks={tasks.filter((task) => task.status === column.id)}
              />
            );
          })}
        </DndContext>
      </div>
    </div>
  );
};

export default KanbanBoard;
