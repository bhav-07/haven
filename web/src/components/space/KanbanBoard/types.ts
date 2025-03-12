export type Column = {
    id: string;
    title: string;
};

export type Task = {
    id: string;
    status: TaskStatus;
    title: string;
    description: string;
};

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";