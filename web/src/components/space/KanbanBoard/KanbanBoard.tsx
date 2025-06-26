import { ColumnType, TaskType } from "./types";
import { Column } from "./Column";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useKanbanSSE } from "./useKanbanSSE";

const COLUMNS: ColumnType[] = [
  { id: "TODO", title: "To Do" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "IN_REVIEW", title: "In Review" },
  { id: "DONE", title: "Done" },
];

interface KanbanBoardProps {
  onClose: () => void;
  spaceId: string;
}

const KanbanBoard = ({ onClose, spaceId }: KanbanBoardProps) => {
  const { tasks, error, updateTaskStatus } = useKanbanSSE(spaceId);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskType["status"];

    await updateTaskStatus(taskId, newStatus);
  }

  return (
    <div className="w-full h-full p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold">Kanban Board</h1>
        </div>
        <button
          onClick={onClose}
          className="text-neutral-100 bg-neutral-700 text-lg px-3 py-2 rounded-lg"
        >
          Close
        </button>
      </div>

      {error && (
        <div className="bg-red-500 text-white p-2 mb-4 rounded">{error}</div>
      )}

      <div className="gap-4 grid grid-cols-2 md:grid-cols-4 overflow-x-auto h-full scrollbar-thin">
        <DndContext onDragEnd={handleDragEnd}>
          {COLUMNS.map((column) => {
            return (
              <Column
                spaceId={spaceId}
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
