/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../auth/authContext";

export interface Player {
    id: string;
    name: string;
    position: { x: number, y: number };
}

const useWebSocket = (spaceId: string) => {

    const wsURL = import.meta.env.VITE_WS_URL;
    const wsRef = useRef<WebSocket | null>(null);
    const playersRef = useRef<Record<string, Player>>({});
    const { user } = useAuth();

    useEffect(() => {
        wsRef.current = new WebSocket(`${wsURL}/space/ws/${spaceId}`);

        wsRef.current.onopen = () => console.log("Connected to game server");

        wsRef.current.onmessage = (ev: MessageEvent) => {
            const message = JSON.parse(ev.data);
            // console.log(message.type)
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

                    playersRef.current = {
                        ...playersRef.current,
                        [message.content.player_id]: newPlayer
                    }
                    break;
                }
                case "position_update": {
                    // Update player position
                    const playerId = message.content.player_id;
                    const existingPlayer = playersRef.current[playerId];

                    if (existingPlayer) {
                        playersRef.current = {
                            ...playersRef.current,
                            [playerId]: {
                                ...existingPlayer,
                                position: {
                                    x: message.content.position.x,
                                    y: message.content.position.y
                                },
                            },
                        };
                    }
                    break;
                }

                case "player_left": {
                    const updatedPlayers = { ...playersRef.current };
                    delete updatedPlayers[message.content.player_id];
                    playersRef.current = updatedPlayers;
                    toast.error(`${updatedPlayers[message.content.player_id]?.name || 'A player'} left the space`);
                    break;
                }

                case "existing_players": {
                    const existingPlayers: Record<string, Player> = {};
                    message.content.forEach((player: any) => {
                        existingPlayers[player.id] = {
                            id: player.id,
                            name: player.name,
                            position: player.position,
                        };
                    });
                    playersRef.current = existingPlayers;
                    break;
                }
                default:
                    console.warn("Unknown message type:", message);
            }
        };

        return () => {
            wsRef.current?.close();
        };
    }, [spaceId]);

    return {
        ws: wsRef.current,
        playersRef,
        localUserId: user?.id.toString(10),
    };
};

export default useWebSocket;
