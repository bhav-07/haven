import { MessageCircleMore } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { ChatHistoryType, customTailwindScrollbar } from "../../types";
import {
  formatTimeforHourAndMinute,
  getColorFromName,
} from "../../services/util";

export const ChatBox = ({
  chatHistory,
  onSendMessage,
  isConnected,
}: {
  chatHistory: ChatHistoryType[];
  onSendMessage: (message: string) => void;
  isConnected: boolean;
}) => {
  const [chatVisible, setChatVisible] = useState(true);

  const [messageInput, setMessageInput] = useState("");

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!chatVisible) {
      requestAnimationFrame(() => {
        scrollContainerRef.current?.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      });
    }
  }, [chatHistory, chatVisible]);

  return (
    <>
      <button
        className="rounded-full bg-neutral-800 p-2"
        onClick={() => setChatVisible(!chatVisible)}
      >
        <MessageCircleMore className="size-8 stroke-[#ffefe2]" />
      </button>
      <div
        className={`absolute top-16 right-0 rounded-lg bg-neutral-800 shadow-2xl w-[350px] h-[600px] flex flex-col ${
          chatVisible && "hidden"
        } flex`}
      >
        <span className="font-semibold p-2 border-b-[1px] border-neutral-600 flex-none">
          Live Chat
        </span>
        <div
          ref={scrollContainerRef}
          className={`flex grow h-full flex-col overflow-y-scroll px-2 py-2 gap-1 max-h-100 ${customTailwindScrollbar}`}
        >
          {chatHistory.length === 0 ? (
            <div className="text-neutral-400 text-sm font-semibold text-center my-4">
              No messages yet, start the conversation!
            </div>
          ) : (
            chatHistory.map((item, index) => (
              <div
                key={index}
                className="flex-wrap space-x-1 antialiased hover:bg-neutral-700 p-1 rounded-lg"
              >
                <span className="text-neutral-300 text-xs">
                  {formatTimeforHourAndMinute(item.time)}
                </span>
                <span
                  style={{ color: getColorFromName(item.author) }}
                  className="font-medium text-base"
                >
                  {item.author}
                </span>

                <span className="text-base font-normal">: {item.content}</span>
              </div>
            ))
          )}
        </div>
        <div className="flex-none border-t-[1px] border-neutral-600 p-2 flex gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => {
              console.log("Input changed:", e.target.value);
              setMessageInput(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && messageInput.trim() !== "") {
                e.preventDefault();
                onSendMessage(messageInput);
                setMessageInput("");
              }
            }}
            onFocus={() => console.log("Input focused")}
            onBlur={() => console.log("Input blurred")}
            onClick={() => console.log("Input clicked")}
            disabled={!isConnected}
            placeholder="Type a message..."
            className="flex-grow bg-neutral-700 text-white px-3 py-2 rounded-lg outline-none text-sm"
          />
          <button
            onClick={() => {
              if (messageInput.trim() !== "") {
                onSendMessage(messageInput);
                setMessageInput("");
              }
            }}
            className="bg-neutral-600 text-white p-2 rounded-lg text-sm hover:bg-neutral-500"
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
};
