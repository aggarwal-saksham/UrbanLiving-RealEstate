import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import "./chat.scss";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import { format } from "timeago.js";
import { SocketContext } from "../../context/SocketContext";
import { useNotificationStore } from "../../lib/notificationStore";

const Chat = ({ chats: initialChats = [], autoOpenUserId }) => {
  const { currentUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const decrease = useNotificationStore((state) => state.decrease);

  const [chats, setChats] = useState([]);
  const [chat, setChat] = useState(null);
  const messageEndRef = useRef(null);
  const chatRef = useRef(chat);

  useEffect(() => {
    // The API can occasionally hand back sparse entries, so we sanitize once here.
    setChats(initialChats.filter(Boolean));
  }, [initialChats]);

  useEffect(() => {
    // We keep a ref in sync so socket handlers can read the latest open chat.
    chatRef.current = chat;
  }, [chat]);

  useEffect(() => {
    // Auto-scroll to the newest message whenever the thread grows.
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  const handleOpenChat = async (id, receiver) => {
    try {
      const res = await apiRequest("/chats/" + id);

      if (!res.data.seenBy.includes(currentUser.id)) {
        // Mark the thread as read as soon as the user actually opens it.
        await apiRequest.put("/chats/read/" + id);
        decrease();
      }

      setChat({ ...res.data, receiver });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const tryAutoOpenChat = async () => {
      if (!autoOpenUserId || !currentUser) return;

      const targetChat = chats.find(
        (item) => item?.receiver?.id?.toString() === autoOpenUserId.toString()
      );

      if (targetChat) {
        handleOpenChat(targetChat.id, targetChat.receiver);
        return;
      }

      try {
        // If a thread does not exist yet, create it quietly and open it right away.
        const res = await apiRequest.post("/chats", {
          receiverId: autoOpenUserId,
        });

        setChats((prev) => {
          const alreadyExists = prev.some((item) => item.id === res.data.id);
          return alreadyExists ? prev : [...prev, res.data];
        });

        handleOpenChat(res.data.id, res.data.receiver);
      } catch (err) {
        console.error("Failed to auto-create chat:", err);
      }
    };

    tryAutoOpenChat();
  }, [autoOpenUserId, chats, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const text = formData.get("text")?.trim();

    if (!text || !chat) return;

    try {
      const res = await apiRequest.post("/messages/" + chat.id, { text });

      setChat((prev) => ({
        ...prev,
        messages: [...prev.messages, res.data],
      }));

      setChats((prevChats) =>
        prevChats.map((item) =>
          item.id === chat.id
            ? {
                ...item,
                lastMessage: text,
                seenBy: [currentUser.id],
              }
            : item
        )
      );

      e.target.reset();

      socket?.emit("sendMessage", {
        receiverId: chat.receiver.id,
        data: {
          ...res.data,
          chatId: chat.id,
          sender: currentUser,
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (data) => {
      if (chatRef.current?.id === data.chatId) {
        setChat((prev) => ({
          ...prev,
          messages: [...prev.messages, data],
        }));
      }

      setChats((prevChats) => {
        const chatExists = prevChats.some((item) => item.id === data.chatId);

        if (chatExists) {
          // Refresh the preview so the list stays useful even before opening the chat.
          return prevChats.map((item) =>
            item.id === data.chatId
              ? {
                  ...item,
                  lastMessage: data.text,
                  seenBy: item.id === chatRef.current?.id ? [currentUser.id] : [],
                }
              : item
          );
        }

        if (!data.sender?.id) {
          return prevChats;
        }

        return [
          ...prevChats,
          {
            id: data.chatId,
            lastMessage: data.text,
            seenBy: [],
            receiver: {
              id: data.sender.id,
              username: data.sender.username,
              avatar: data.sender.avatar,
            },
            userIDs: [currentUser.id, data.sender.id],
          },
        ];
      });
    };

    socket.on("getMessage", handleIncomingMessage);

    return () => {
      socket.off("getMessage", handleIncomingMessage);
    };
  }, [socket, currentUser]);

  const uniqueChats = useMemo(() => {
    const uniqueChatsMap = new Map();

    chats.filter(Boolean).forEach((item) => {
      if (!item?.receiver?.id) return;

      // A normalized key prevents the same two people from showing up twice.
      const uniqueKey =
        currentUser.id < item.receiver.id
          ? `${currentUser.id}_${item.receiver.id}`
          : `${item.receiver.id}_${currentUser.id}`;

      if (!uniqueChatsMap.has(uniqueKey)) {
        uniqueChatsMap.set(uniqueKey, item);
      }
    });

    return Array.from(uniqueChatsMap.values());
  }, [chats, currentUser.id]);

  return (
    <div className="chat">
      <div className="messages">
        <h1>Messages</h1>
        {uniqueChats.map((item) => (
          <div
            className="message"
            key={item.id}
            style={{
              backgroundColor:
                item.seenBy?.includes(currentUser.id) || chat?.id === item.id
                  ? "white"
                  : "#fecd514e",
            }}
            onClick={() => handleOpenChat(item.id, item.receiver)}
          >
            <img src={item.receiver?.avatar || "/noavatar.jpg"} alt="" />
            <span>{item.receiver?.username || "Unknown user"}</span>
            <p>{item.lastMessage || "Start the conversation"}</p>
          </div>
        ))}
      </div>

      {chat && (
        <div className="chatBox">
          <div className="top">
            <div className="user">
              <img src={chat.receiver.avatar || "/noavatar.jpg"} alt="" />
              {chat.receiver.username}
            </div>
            <div className="close" onClick={() => setChat(null)}>
              X
            </div>
          </div>
          <div className="center">
            {chat.messages.map((message) => (
              <div
                className="chatMessage"
                style={{
                  alignSelf:
                    message.userId === currentUser.id
                      ? "flex-end"
                      : "flex-start",
                  textAlign:
                    message.userId === currentUser.id ? "right" : "left",
                }}
                key={message.id}
              >
                <p>{message.text}</p>
                <span>{format(message.createdAt)}</span>
              </div>
            ))}
            <div ref={messageEndRef}></div>
          </div>
          <form className="bottom" onSubmit={handleSubmit}>
            <textarea
              name="text"
              onKeyDown={(e) => {
                // Enter sends, Shift+Enter gives the user a newline.
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  e.target.form.requestSubmit();
                }
              }}
            ></textarea>
            <button>Send</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chat;
