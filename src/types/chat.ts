export interface User {
  id: string;
  username: string;
  isOnline: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  timestamp: Date;
}

export interface ChatRoom {
  id: string;
  participants: User[];
  messages: Message[];
  lastMessage?: Message;
}