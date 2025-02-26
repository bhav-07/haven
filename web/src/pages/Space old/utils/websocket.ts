import toast from "react-hot-toast";

export const handleSpaceWebSocket = (wsRef: React.MutableRefObject<WebSocket | null>, spaceId: string) => {
    if (!wsRef.current) {
        wsRef.current = new WebSocket(`ws://localhost:8080/space/ws/${spaceId}`);

        wsRef.current.onopen = () => {
            console.log("Connected to game server");
        };

        wsRef.current.onclose = (e) => {
            console.log("Connection closed:", e.reason);
            // Implement reconnection logic if needed
        };

        wsRef.current.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        wsRef.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log("Received message:", message);
            if (message.type == "player_joined") {
                toast.success(`${message.content.player_name} joined`);
            }
        };
    }

    // Cleanup WebSocket connection on unmount
    return () => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
    };
}