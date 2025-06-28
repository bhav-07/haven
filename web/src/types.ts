export type UserStatusType = "online" | "away" | "meeting" | "dnd";

export const validStatuses: UserStatusType[] = ["online", "away", "meeting", "dnd"];

export type StatusOptionType = {
    description: string;
    label: string;
    value: string;
};