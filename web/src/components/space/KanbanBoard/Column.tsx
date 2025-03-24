import { useDroppable } from "@dnd-kit/core";
import { TaskCard } from "./TaskCard";
import { ColumnType, TaskType } from "./types";

type ColumnProps = {
  column: ColumnType;
  tasks: TaskType[];
};

export function Column({ column, tasks }: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const getBorderColor = () => {
    switch (column.id) {
      case "TODO":
        return "border-[#fde47d]";
      case "IN_PROGRESS":
        return "border-[#93d4f0]";
      case "IN_REVIEW":
        return "border-[#fac6b0]";
      case "DONE":
        return "border-[#98FB98]";
    }
  };

  return (
    <div
      className={`flex w-full flex-col h-fit md:min-h-full bg-neutral-300/90 rounded-lg p-4 border-t-[12px] ${getBorderColor()} `}
    >
      <h2 className="mb-4 font-semibold text-neutral-800">{column.title}</h2>
      <div ref={setNodeRef} className="flex flex-1 flex-col gap-4">
        {tasks.map((task) => {
          return <TaskCard key={task.id} task={task} />;
        })}
      </div>
    </div>
  );
}
