// import { useState, useEffect, useRef } from "react";
// import { Excalidraw } from "@excalidraw/excalidraw";
// import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
// import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";

// const WS_URL = "ws://localhost:8080/whiteboard/ws/123";

// function App() {
//   const elements = useRef<ExcalidrawElement[]>([]);
//   const lastSyncTimestamp = useRef<number>(0);
//   const ws = useRef<WebSocket | null>(null);
//   const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
//   const [excalidrawAPI, setExcalidrawAPI] =
//     useState<ExcalidrawImperativeAPI | null>(null);

//   useEffect(() => {
//     ws.current = new WebSocket(WS_URL);

//     ws.current.onmessage = (event) => {
//       try {
//         const receivedData = JSON.parse(event.data);
//         if (receivedData.elements) {
//           const validElements = filterElements(
//             receivedData.elements.map((el: ExcalidrawElement) => ({
//               ...el,
//               id: el.id || crypto.randomUUID(),
//             }))
//           );

//           elements.current = reconcileElements(
//             elements.current,
//             validElements,
//             lastSyncTimestamp.current
//           );
//           excalidrawAPI?.updateScene({ elements: elements.current });
//         }
//       } catch (error) {
//         console.error("Error handling message:", error);
//       }
//     };

//     return () => ws.current?.close();
//   }, [excalidrawAPI]);

//   const filterElements = (elements: readonly ExcalidrawElement[]) => {
//     return elements.filter((el) => !el.isDeleted && el.type !== "selection");
//   };

//   const handleChange = (newElements: readonly ExcalidrawElement[]) => {
//     const validElements = filterElements(newElements);
//     elements.current = [...validElements];

//     if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

//     debounceTimeout.current = setTimeout(() => {
//       if (ws.current?.readyState === WebSocket.OPEN) {
//         lastSyncTimestamp.current = Date.now();
//         ws.current.send(
//           JSON.stringify({
//             elements: validElements,
//             timestamp: lastSyncTimestamp.current,
//           })
//         );
//       }
//     }, 100);
//   };

//   return (
//     <div style={{ height: "100vh" }}>
//       {/* <h1 style={{ textAlign: "center" }}>Collaborative Whiteboard</h1> */}
//       <div style={{ height: "calc(100vh)" }}>
//         <Excalidraw
//           isCollaborating={true}
//           excalidrawAPI={(api) => setExcalidrawAPI(api)}
//           onChange={handleChange}
//           theme="dark"
//         />
//       </div>
//     </div>
//   );
// }

// function reconcileElements(
//   local: ExcalidrawElement[],
//   remote: ExcalidrawElement[],
//   lastSync: number
// ): ExcalidrawElement[] {
//   const remoteMap = new Map(remote.map((el) => [el.id, el]));
//   const localMap = new Map(local.map((el) => [el.id, el]));

//   const merged: ExcalidrawElement[] = [];

//   // Merge remote elements with conflict resolution
//   remote.forEach((remoteEl) => {
//     const localEl = localMap.get(remoteEl.id);
//     merged.push(
//       localEl && localEl.updated > remoteEl.updated ? localEl : remoteEl
//     );
//   });

//   // Add local elements not in remote that were modified after last sync
//   local.forEach((localEl) => {
//     if (!remoteMap.has(localEl.id) && localEl.updated > lastSync) {
//       merged.push(localEl);
//     }
//   });

//   return merged;
// }

// export default App;

// File: src/components/CollaborativeBoard.jsx
import { useEffect, useState, useRef } from "react";
import { Excalidraw, exportToBlob } from "@excalidraw/excalidraw";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";

const ExcalidrawBoard = ({ spaceId = "default-space" }) => {
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [username, setUsername] = useState(
    `user-${Math.floor(Math.random() * 1000)}`
  );
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState([]);
  const lastSentElements = useRef([]);
  const updateLock = useRef(false);
  const [isDrawing, setIsDrawing] = useState(false);

  // Connect to WebSocket server
  useEffect(() => {
    if (!spaceId || !username) return;

    // Close previous connection if exists
    if (socket) {
      socket.close();
    }

    // Use secure WebSocket in production
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
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

        if (
          data.type === "scene-update" &&
          excalidrawAPI &&
          !updateLock.current
        ) {
          // Set lock to prevent update loops
          updateLock.current = true;

          try {
            // Parse the elements if they're a string
            const elements =
              typeof data.elements === "string"
                ? JSON.parse(data.elements)
                : data.elements;

            excalidrawAPI.updateScene({ elements });
          } catch (err) {
            console.error("Error updating scene:", err);
          } finally {
            // Release lock after a short delay to prevent immediate re-triggering
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

    // Subscribe to pointer down event (start drawing)
    const unsubscribePointerDown = excalidrawAPI.onPointerDown(() => {
      setIsDrawing(true);
    });

    // Subscribe to pointer up event (stop drawing)
    const unsubscribePointerUp = excalidrawAPI.onPointerUp(() => {
      setIsDrawing(false);
    });

    return () => {
      unsubscribePointerDown();
      unsubscribePointerUp();
    };
  }, [excalidrawAPI]);

  // Handle changes to the Excalidraw scene
  const handleChange = (elements: readonly ExcalidrawElement[]) => {
    if (
      !socket ||
      socket.readyState !== WebSocket.OPEN ||
      !elements ||
      updateLock.current ||
      isDrawing
    )
      return;

    // Stringify and parse to ensure we're comparing similar objects
    const currentElements = JSON.stringify(elements);
    const lastElements = JSON.stringify(lastSentElements.current);

    if (currentElements !== lastElements) {
      lastSentElements.current = JSON.parse(currentElements);

      // Send scene update to server
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
        files: excalidrawAPI.getFiles(), // Add files property
        mimeType: "image/png",
        quality: 1,
      });

      // Create download link
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
    <div className="flex flex-col h-screen w-screen bg-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-white shadow-md">
        {/* Username Input & Connection Status */}
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your Name"
            onBlur={() => {
              if (socket) socket.close();
            }}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <div
            className={`text-sm font-semibold px-3 py-1 rounded-lg ${
              isConnected ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            {isConnected ? "Connected" : "Disconnected"}
          </div>
        </div>

        {/* Participants & Export Button */}
        <div className="flex items-center gap-4">
          <div className="text-gray-700 font-medium">
            {participants.length} participant
            {participants.length !== 1 ? "s" : ""}
          </div>
          <button
            onClick={handleExport}
            disabled={!excalidrawAPI}
            className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg disabled:bg-gray-400 hover:bg-blue-600 transition"
          >
            Export PNG
          </button>
        </div>
      </div>

      {/* Excalidraw Canvas */}
      <div className="h-full flex-grow w-screen p-2">
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          onChange={handleChange}
          viewModeEnabled={false}
          zenModeEnabled={false}
          gridModeEnabled={false}
          // className="shadow-lg rounded-lg bg-white"
        />
      </div>
    </div>
  );
};

export default ExcalidrawBoard;
