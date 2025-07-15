import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { User, Message } from '@/types/chat';
import { LocalNotifications } from '@capacitor/local-notifications';
import { App } from '@capacitor/app';

export const useSocket = (serverUrl: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<Map<string, number>>(new Map());
  const [isAppInForeground, setIsAppInForeground] = useState(true);
  const [currentChatUserId, setCurrentChatUserId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialize notifications and app state
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Request notification permissions
        const permission = await LocalNotifications.requestPermissions();
        console.log('Notification permission:', permission);

        // Listen for app state changes
        App.addListener('appStateChange', ({ isActive }) => {
          setIsAppInForeground(isActive);
        });
      } catch (error) {
        console.log('Notifications not available:', error);
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

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('users_updated', (users: User[]) => {
      setOnlineUsers(users);
    });

    newSocket.on('message_received', (message: Message) => {
      setMessages(prev => [...prev, message]);
      
      // Handle unread messages and notifications
      const isCurrentChat = currentChatUserId === message.senderId;
      const shouldShowNotification = !isAppInForeground || !isCurrentChat;
      
      if (shouldShowNotification) {
        // Update unread count
        setUnreadMessages(prev => {
          const newMap = new Map(prev);
          const currentCount = newMap.get(message.senderId) || 0;
          newMap.set(message.senderId, currentCount + 1);
          return newMap;
        });

        // Show local notification
        showNotification(message);
      }
    });

    newSocket.on('chat_history', (chatMessages: Message[]) => {
      setMessages(chatMessages);
    });

    return () => {
      newSocket.close();
    };
  }, [serverUrl]);

  const showNotification = async (message: Message) => {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: `New message from ${message.senderName}`,
            body: message.content,
            id: Date.now(),
            schedule: { at: new Date(Date.now() + 100) },
            sound: 'default',
            attachments: undefined,
            actionTypeId: '',
            extra: {
              senderId: message.senderId,
              senderName: message.senderName
            }
          }
        ]
      });
    } catch (error) {
      console.log('Failed to show notification:', error);
    }
  };

  const joinChat = (username: string) => {
    if (socket) {
      socket.emit('join', { username });
    }
  };

  const sendMessage = (receiverId: string, content: string) => {
    if (socket) {
      socket.emit('send_message', { receiverId, content });
    }
  };

  const startChat = (userId: string) => {
    if (socket) {
      socket.emit('start_chat', { userId });
      setCurrentChatUserId(userId);
      
      // Mark messages as read when starting chat
      setUnreadMessages(prev => {
        const newMap = new Map(prev);
        newMap.delete(userId);
        return newMap;
      });
    }
  };

  const markMessagesAsRead = (userId: string) => {
    setUnreadMessages(prev => {
      const newMap = new Map(prev);
      newMap.delete(userId);
      return newMap;
    });
  };

  const markMessagesAsReadCallback = useCallback((userId: string) => {
    setUnreadMessages(prev => {
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
    joinChat,
    sendMessage,
    startChat,
    setMessages,
    markMessagesAsRead: markMessagesAsReadCallback,
    getUnreadCount,
    setCurrentChatUserId
  };
};