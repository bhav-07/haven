import { CheckCircle2, Clock, MinusCircle, Video } from "lucide-react";

export type UserStatusType = "online" | "away" | "meeting" | "dnd";

export const validStatuses: UserStatusType[] = ["online", "away", "meeting", "dnd"];

export type StatusOptionType = {
    description: string;
    label: string;
    value: string;
};

export const statusStyles: Record<
    UserStatusType,
    {
        color: string;
        label: string;
        border: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Icon: React.ComponentType<any>;
    }
> = {
    online: {
        color: "text-green-200",
        border: "border-green-200",
        label: "Online",
        Icon: CheckCircle2,
    },
    away: {
        color: "text-yellow-200",
        border: "border-yellow-200",
        label: "Away",
        Icon: Clock,
    },
    meeting: {
        color: "text-blue-200",
        border: "border-blue-200",
        label: "In Meeting",
        Icon: Video,
    },
    dnd: {
        color: "text-red-200",
        border: "border-red-200",
        label: "DND",
        Icon: MinusCircle,
    },
};

export type ChatHistoryType = {
    author: string;
    content: string;
    time: string;
}

export const customTailwindScrollbar = "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500";