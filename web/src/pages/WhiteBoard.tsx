import { useEffect, useState, useRef } from "react";
import {
  Excalidraw,
  exportToBlob,
  Footer,
  Sidebar,
} from "@excalidraw/excalidraw";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { useAuth } from "../auth/authContext";

const ExcalidrawBoard = ({
  spaceId,
  onClose,
}: {
  spaceId: string;
  onClose: () => void;
}) => {
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const { user } = useAuth();

  const username = user?.nickname;
  console.log(username);

  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState([]);
  const lastSentElements = useRef([]);
  const updateLock = useRef(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [docked, setDocked] = useState(false);

  useEffect(() => {
    if (!spaceId) return;

    if (socket) {
      socket.close();
    }

    const wsProtocol = "ws:";
    const wsUrl = `${wsProtocol}//${window.location.hostname}:8080/whiteboard/ws/${spaceId}?username=${username}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log(
        `Connected to whiteboard in space: ${spaceId} as ${username}`
      );
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log(data);
        if (
          data.type === "scene-update" &&
          excalidrawAPI &&
          !updateLock.current
        ) {
          updateLock.current = true;

          try {
            const elements =
              typeof data.elements === "string"
                ? JSON.parse(data.elements)
                : data.elements;

            excalidrawAPI.updateScene({ elements });
          } catch (err) {
            console.error("Error updating scene:", err);
          } finally {
            setTimeout(() => {
              updateLock.current = false;
            }, 50);
          }
        } else if (data.type === "participants-update") {
          setParticipants(data.participants || []);
        }
      } catch (err) {
        console.error("Error parsing message:", err);
      }
    };

    ws.onclose = () => {
      console.log(`Disconnected from whiteboard: ${spaceId}`);
      setIsConnected(false);
      setParticipants([]);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [spaceId, username, excalidrawAPI]);

  useEffect(() => {
    if (!excalidrawAPI) return;

    const unsubscribePointerDown = excalidrawAPI.onPointerDown(() => {
      setIsDrawing(true);
    });

    const unsubscribePointerUp = excalidrawAPI.onPointerUp(() => {
      setIsDrawing(false);
    });

    return () => {
      unsubscribePointerDown();
      unsubscribePointerUp();
    };
  }, [excalidrawAPI]);

  const handleChange = (elements: readonly ExcalidrawElement[]) => {
    if (
      !socket ||
      socket.readyState !== WebSocket.OPEN ||
      !elements ||
      updateLock.current ||
      isDrawing
    )
      return;

    const currentElements = JSON.stringify(elements);
    const lastElements = JSON.stringify(lastSentElements.current);

    if (currentElements !== lastElements) {
      lastSentElements.current = JSON.parse(currentElements);

      socket.send(
        JSON.stringify({
          type: "scene-update",
          elements: elements,
        })
      );
    }
  };

  const handleExport = async () => {
    if (!excalidrawAPI) return;

    try {
      const blob = await exportToBlob({
        elements: excalidrawAPI.getSceneElements(),
        appState: excalidrawAPI.getAppState(),
        files: excalidrawAPI.getFiles(),
        mimeType: "image/png",
        quality: 1,
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${spaceId}-whiteboard.png`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting whiteboard:", error);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-100 rounded-2xl">
      <div className="flex justify-between items-center p-4 bg-neutral-800 shadow-md">
        <div className="flex items-center gap-4">
          <div
            className={`text-sm font-semibold px-3 py-1 rounded-lg ${
              isConnected ? "bg-green-700 text-white" : "bg-red-700 text-white"
            }`}
          >
            {isConnected ? "Connected" : "Disconnected"}
          </div>
          <div className="text-white font-medium">
            {participants.length} participant
            {participants.length !== 1 ? "s" : ""}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleExport}
            disabled={!excalidrawAPI}
            className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg disabled:bg-gray-400 hover:bg-blue-600 transition"
          >
            Export PNG
          </button>
          <button
            onClick={onClose}
            className="bg-neutral-200 text-neutral-700 text-lg px-3 py-2 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>

      <div className="h-full flex-grow w-full p-0">
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          onChange={handleChange}
          viewModeEnabled={false}
          zenModeEnabled={false}
          gridModeEnabled={false}
          theme="dark"
          UIOptions={{
            dockedSidebarBreakpoint: 0,
          }}
        >
          <Sidebar name="Sidebar" docked={docked} onDock={setDocked}>
            <Sidebar.Header />
            <Sidebar.Tabs>
              <Sidebar.Tab tab="participants">
                <div className="items-center flex flex-col">
                  <span className="text-center font-mono text-xl py-2 w-full">
                    <h1>Participants</h1>
                  </span>
                  {participants.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No participants yet</p>
                    </div>
                  ) : (
                    <ul>
                      {participants.map((participant, index) => (
                        <li key={index} className="text-lg font-semibold">
                          {participant}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Sidebar.Tab>
              <Sidebar.Tab tab="chat">Chat goes here</Sidebar.Tab>
              <Sidebar.TabTriggers>
                <Sidebar.TabTrigger tab="participants">
                  Participants
                </Sidebar.TabTrigger>
                <Sidebar.TabTrigger tab="chat">Chat</Sidebar.TabTrigger>
              </Sidebar.TabTriggers>
            </Sidebar.Tabs>
          </Sidebar>
          <Footer>
            <Sidebar.Trigger
              name="Sidebar"
              tab="participants"
              className="font-bold"
              style={{
                marginLeft: "0.5rem",
                background: "#3b82f6",
                color: "white",
              }}
            >
              Sidebar
            </Sidebar.Trigger>
          </Footer>
        </Excalidraw>
      </div>
    </div>
  );
};

export default ExcalidrawBoard;
