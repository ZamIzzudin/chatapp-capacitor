'use client';

import { useState, useEffect } from 'react';
import LoginPage from '@/components/LoginPage';
import UserList from '@/components/UserList';
import ChatPage from '@/components/ChatPage';
import { useSocket } from '@/hooks/useSocket';
import { User } from '@/types/chat';

type AppState = 'login' | 'userlist' | 'chat';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chatPartner, setChatPartner] = useState<User | null>(null);
  const [pendingUsername, setPendingUsername] = useState<string | null>(null);
  
  const {
    isConnected,
    onlineUsers,
    messages,
    getUnreadCount,
    joinChat,
    sendMessage,
    startChat,
    setMessages,
    markMessagesAsRead,
    setCurrentChatUserId
  } = useSocket('http://localhost:3001');

  const handleLogin = (username: string) => {
    setPendingUsername(username);
    joinChat(username);
  };

  useEffect(() => {
    if (isConnected && onlineUsers.length > 0 && pendingUsername && !currentUser) {
      const user = onlineUsers.find(u => u.username === pendingUsername);
      if (user) {
        setCurrentUser(user);
        setPendingUsername(null);
        setAppState('userlist');
      }
    }
  }, [isConnected, onlineUsers, pendingUsername, currentUser]);

  const handleStartChat = (userId: string) => {
    const partner = onlineUsers.find(user => user.id === userId);
    if (partner) {
      setChatPartner(partner);
      startChat(userId);
      setAppState('chat');
    }
  };

  const handleSendMessage = (content: string) => {
    if (chatPartner) {
      sendMessage(chatPartner.id, content);
    }
  };

  const handleBackToUserList = () => {
    setChatPartner(null);
    setMessages([]);
    setCurrentChatUserId(null);
    setAppState('userlist');
  };

  if (appState === 'login') {
    return <LoginPage onLogin={handleLogin} isConnecting={!isConnected} />;
  }

  if (appState === 'userlist' && currentUser) {
    return (
      <UserList
        users={onlineUsers}
        currentUserId={currentUser.id}
        onStartChat={handleStartChat}
        getUnreadCount={getUnreadCount}
      />
    );
  }

  if (appState === 'chat' && currentUser && chatPartner) {
    return (
      <ChatPage
        messages={messages}
        currentUserId={currentUser.id}
        chatPartner={chatPartner}
        onSendMessage={handleSendMessage}
        onBack={handleBackToUserList}
        markMessagesAsRead={markMessagesAsRead}
      />
    );
  }

  return null;
}