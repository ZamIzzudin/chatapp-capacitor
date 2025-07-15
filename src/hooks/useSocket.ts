/** @format */

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { User, Message } from "@/types/chat";
import { LocalNotifications } from "@capacitor/local-notifications";
import { App } from "@capacitor/app";

export const useSocket = (serverUrl: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<Map<string, number>>(
    new Map()
  );
  const [isAppInForeground, setIsAppInForeground] = useState(true);
  const [currentChatUserId, setCurrentChatUserId] = useState<string | null>(
    null
  );
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const currentChatUserIdRef = useRef<string | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    currentChatUserIdRef.current = currentChatUserId;
  }, [currentChatUserId]);

  // Initialize notifications and app state
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Request notification permissions
        const permission = await LocalNotifications.requestPermissions();
        console.log("Notification permission:", permission);

        // Listen for app state changes
        App.addListener("appStateChange", ({ isActive }) => {
          setIsAppInForeground(isActive);
          console.log("App state changed:", isActive ? "foreground" : "background");
        });
      } catch (error) {
        console.log("Notifications not available:", error);
      }
    };

    initializeNotifications();

    return () => {
      App.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    const newSocket = io(serverUrl);
    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected:", newSocket.id);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket disconnected");
    });

    newSocket.on("users_updated", (users: User[]) => {
      setOnlineUsers(users);
    });

    newSocket.on("user_joined", (data: { userId: string; username: string }) => {
      setCurrentUserId(data.userId);
      console.log("Current user ID set:", data.userId);
    });
    newSocket.on("message_received", (message: Message) => {
      console.log("Message received:", message);
      console.log("Current user ID:", currentUserId);
      console.log("Message sender ID:", message.senderId);
      console.log("Current chat user ID:", currentChatUserIdRef.current);
      console.log("App in foreground:", isAppInForeground);
      
      setMessages((prev) => [...prev, message]);

      // Only show notification if message is not from current user
      if (message.senderId !== newSocket.id) {
        const isCurrentChat = currentChatUserIdRef.current === message.senderId;
        const shouldShowNotification = !isAppInForeground || !isCurrentChat;

        console.log("Should show notification:", shouldShowNotification);
        
        // Update unread count
        setUnreadMessages((prev) => {
          const newMap = new Map(prev);
          const currentCount = newMap.get(message.senderId) || 0;
          newMap.set(message.senderId, currentCount + 1);
          return newMap;
        });

        // Show local notification
        if (shouldShowNotification) {
          showNotification(message);
        }
      }
    });

    newSocket.on("chat_history", (chatMessages: Message[]) => {
      setMessages(chatMessages);
    });

    return () => {
      newSocket.close();
    };
  }, [serverUrl, isAppInForeground, currentUserId]);

  const showNotification = async (message: Message) => {
    try {
      console.log("Showing notification for message:", message.content);
      await LocalNotifications.schedule({
        notifications: [
          {
            title: `New message from ${message.senderName}`,
            body: message.content,
            id: Date.now(),
            schedule: { at: new Date(Date.now() + 100) },
            sound: "default",
            attachments: undefined,
            actionTypeId: "",
            extra: {
              senderId: message.senderId,
              senderName: message.senderName,
            },
          },
        ],
      });
      console.log("Notification scheduled successfully");
    } catch (error) {
      console.log("Failed to show notification:", error);
    }
  };

  const joinChat = (username: string) => {
    if (socket) {
      socket.emit("join", { username });
    }
  };

  const sendMessage = (receiverId: string, content: string) => {
    if (socket) {
      socket.emit("send_message", { receiverId, content });
    }
  };

  const startChat = (userId: string) => {
    if (socket) {
      socket.emit("start_chat", { userId });
      setCurrentChatUserId(userId);

      // Mark messages as read when starting chat
      setUnreadMessages((prev) => {
        const newMap = new Map(prev);
        newMap.delete(userId);
        return newMap;
      });
    }
  };

  const markMessagesAsReadCallback = useCallback((userId: string) => {
    setUnreadMessages((prev) => {
      const newMap = new Map(prev);
      newMap.delete(userId);
      return newMap;
    });
  }, []);

  const getUnreadCount = (userId: string): number => {
    return unreadMessages.get(userId) || 0;
  };

  return {
    socket,
    isConnected,
    onlineUsers,
    messages,
    unreadMessages,
    currentUserId,
    joinChat,
    sendMessage,
    startChat,
    setMessages,
    markMessagesAsRead: markMessagesAsReadCallback,
    getUnreadCount,
    setCurrentChatUserId,
  };
};
