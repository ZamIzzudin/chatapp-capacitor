import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { User, Message } from '@/types/chat';

export const useSocket = (serverUrl: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<Socket | null>(null);

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
    });

    newSocket.on('chat_history', (chatMessages: Message[]) => {
      setMessages(chatMessages);
    });

    return () => {
      newSocket.close();
    };
  }, [serverUrl]);

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
    }
  };

  return {
    socket,
    isConnected,
    onlineUsers,
    messages,
    joinChat,
    sendMessage,
    startChat,
    setMessages
  };
};