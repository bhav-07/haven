export type ColumnType = {
    id: string;
    title: string;
};

export type TaskType = {
    id: string;
    status: TaskStatusType;
    title: string;
    description: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    createdAt: string;
    dueDate: string;
};

export type TaskStatusType = "TODO" | "IN_PROGRESS" | "DONE" | "IN_REVIEW";