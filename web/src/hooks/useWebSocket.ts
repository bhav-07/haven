/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export interface Player {
    id: string;
    name: string;
    position: { x: number, y: number };
}

const useWebSocket = (spaceId: string) => {

    const wsURL = import.meta.env.VITE_WS_URL;
    const wsRef = useRef<WebSocket | null>(null);
    const [players, setPlayers] = useState<Record<string, Player>>({});

    useEffect(() => {
        wsRef.current = new WebSocket(`${wsURL}/space/ws/${spaceId}`);

        wsRef.current.onopen = () => console.log("Connected to game server");

        wsRef.current.onmessage = (ev: MessageEvent) => {
            const message = JSON.parse(ev.data);
            console.log(message.type)
            switch (message.type) {
                case "player_joined": {
                    toast.success(`${message.content.player_name} joined the space`);
                    const newPlayer: Player = {
                        id: message.content.player_id,
                        position: {
                            x: message.content.position.x,
                            y: message.content.position.y
                        },
                        name: message.content.player_name
                    };

                    setPlayers((prev) => {
                        const newState = {
                            ...prev,
                            [message.content.player_id]: newPlayer,
                        };
                        return newState;
                    });
                    break;
                }
                case "position_update": {
                    setPlayers((prev) => ({
                        ...prev,
                        [message.content.player_id]: {
                            id: message.content.player_id,
                            position: { x: message.content.position.x, y: message.content.position.y },
                        },
                    }));
                    break;
                }

                case "player_left":
                    toast.error(`${message.content.player_name} left the space`);
                    setPlayers((prev) => {
                        const updatedPlayers = { ...prev };
                        delete updatedPlayers[message.content.player_id];
                        return updatedPlayers;
                    });
                    break;

                default:
                    console.warn("Unknown message type:", message);
            }
        };

        return () => {
            wsRef.current?.close();
        };
    }, [spaceId]);

    return { ws: wsRef.current, players };
};

export default useWebSocket;
