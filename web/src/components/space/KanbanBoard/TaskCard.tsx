import { useDraggable } from "@dnd-kit/core";
import { TaskType } from "./types";
import { Hourglass } from "lucide-react";

type TaskCardProps = {
  task: TaskType;
};

export function TaskCard({ task }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
      }
    : undefined;

  const getDaysLeft = (dueDateString: string) => {
    const dueDate = new Date(dueDateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    const diff = Math.floor(
      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diff > 0)
      return {
        text: `${diff} days left`,
        color: "text-green-600 bg-green-100",
      };
    if (diff === 0)
      return { text: "Due today", color: "text-yellow-600 bg-yellow-100" };
    return {
      text: `${Math.abs(diff)} days overdue`,
      color: "text-red-600 bg-red-100",
    };
  };

  const priorityColors: Record<TaskType["priority"], string> = {
    HIGH: "text-red-500 bg-red-100",
    MEDIUM: "text-yellow-500 bg-yellow-100",
    LOW: "text-green-500 bg-green-100",
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="cursor-grab rounded-lg bg-white p-4 shadow-sm hover:shadow-lg transition-shadow ease-in-out"
      style={style}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-neutral-800">{task.title}</h3>
        <span
          className={`px-2 py-1 text-xs font-bold rounded ${
            priorityColors[task.priority]
          }`}
        >
          {task.priority}
        </span>
      </div>

      <p className="mt-2 text-sm text-neutral-700">{task.description}</p>

      {task.status != "DONE" && (
        <div className="mt-3 text-sm font-semibold text-neutral-500">
          <span
            className={`${
              getDaysLeft(task.dueDate).color
            } flex items-center justify-start gap-1 w-fit py-1 px-2 rounded-full`}
          >
            <Hourglass className="size-4" />
            <p className={``}>{getDaysLeft(task.dueDate).text}</p>
          </span>
        </div>
      )}
    </div>
  );
}
