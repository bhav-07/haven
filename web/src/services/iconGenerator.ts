import {
    CircleCheck,
    Clock,
    Video,
    MinusCircle,
    LucideIcon
} from "lucide-react";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { statusStyles } from "../types";

export const statusIcons = {
    online: statusStyles.online.Icon,
    away: statusStyles.away.Icon,
    meeting: statusStyles.meeting.Icon,
    dnd: statusStyles.dnd.Icon,
} as const;

export function generateIconDataUrl(
    Icon: LucideIcon,
    color: string = "#ffffff",
    size: number = 16
): string {
    const iconElement = createElement(Icon, {
        size,
        color,
        strokeWidth: 3
    });

    const svgString = renderToString(iconElement);
    const base64 = btoa(svgString);
    return `data:image/svg+xml;base64,${base64}`;
}

export function generateStatusIcons(): Record<string, string> {
    return {
        online: generateIconDataUrl(CircleCheck, "#22c55e", 16),
        away: generateIconDataUrl(Clock, "#facc15", 16),
        meeting: generateIconDataUrl(Video, "#3b82f6", 16),
        dnd: generateIconDataUrl(MinusCircle, "#ef4444", 16),
    };
}