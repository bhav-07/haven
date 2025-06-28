/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../auth/authContext";
import { ChatHistoryType, UserStatusType } from "../types";

export interface Player {
    id: string;
    name: string;
    position: { x: number, y: number };
    nickname: string;
    status: UserStatusType;
}

const useWebSocket = (spaceId: string) => {

    const wsURL = import.meta.env.VITE_WS_URL;
    const wsRef = useRef<WebSocket | null>(null);
    const playersRef = useRef<Record<string, Player>>({});
    const { user } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatHistoryType[]>([]);

    const sendChatMessage = (content: string) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            const message = {
                type: "chat_message",
                content: content
            };
            wsRef.current.send(JSON.stringify(message));
        } else {
            console.error("WebSocket is not open. Cannot send message.");
        }
    };

    useEffect(() => {
        wsRef.current = new WebSocket(`${wsURL}/space/ws/${spaceId}`);

        wsRef.current.onopen = () => {
            console.log("Connected to game server");
            setIsConnected(true);
        };

        wsRef.current.onclose = () => {
            console.log("Disconnected from game server");
            setIsConnected(false);
        };

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
                        name: message.content.player_name,
                        nickname: message.content.player_nickname,
                        status: message.content.status,
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
                    const leavingPlayerName = updatedPlayers[message.content.player_id]?.name;
                    delete updatedPlayers[message.content.player_id];
                    playersRef.current = updatedPlayers;
                    toast.error(`${leavingPlayerName || 'A player'} left the space`);
                    break;
                }

                case "existing_players": {
                    const existingPlayers: Record<string, Player> = {};
                    message?.content?.forEach?.((player: any) => {
                        existingPlayers[player.id] = {
                            id: player.id,
                            name: player.name,
                            position: player.position,
                            nickname: player.nickname,
                            status: player.status,
                        };
                    });
                    playersRef.current = existingPlayers;
                    break;
                }

                case "status_update": {
                    const playerId = message.content.player_id;
                    const existingPlayer = playersRef.current[playerId];
                    if (existingPlayer) {
                        playersRef.current = {
                            ...playersRef.current,
                            [playerId]: {
                                ...existingPlayer,
                                status: message.content.status
                            },
                        };
                    }
                    break;
                }

                case "chat_message": {
                    const chatMessage: ChatHistoryType = {
                        author: message.content.author,
                        content: message.content.content,
                        time: message.content.time,
                    };
                    setChatHistory(prev => [...prev, chatMessage]);
                    break;
                }

                case "chat_history": {
                    setChatHistory(message.content);
                    break;
                }
                default:
                    console.warn("Unknown message type:", message);
            }
        };
        const handleBeforeUnload = () => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.close(1000, "Page unloading");
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);


        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            if (wsRef.current) {
                wsRef.current.close(1000, "Component unmounting");
            }
        };
    }, [spaceId, wsURL]);

    return {
        ws: wsRef.current,
        playersRef,
        localUserId: user?.id.toString(10),
        isConnected,
        chatHistory,
        sendChatMessage
    };
};

export default useWebSocket;
