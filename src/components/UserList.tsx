import { useState } from 'react';
import { User, MessageCircle, Search, Users, Circle } from 'lucide-react';
import { User as UserType } from '@/types/chat';
import NotificationTest from './NotificationTest';

interface UserListProps {
  users: UserType[];
  currentUserId: string;
  onStartChat: (userId: string) => void;
  getUnreadCount: (userId: string) => number;
}

export default function UserList({ users, currentUserId, onStartChat, getUnreadCount }: UserListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user => 
    user.id !== currentUserId && 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentUser = users.find(user => user.id === currentUserId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 w-10 h-10 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">ChatApp</h1>
                <p className="text-sm text-gray-600">Welcome, {currentUser?.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Circle className="w-3 h-3 text-green-500 fill-current" />
              {users.length} online
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b bg-gray-50 rounded-t-lg">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              <h2 className="font-semibold text-gray-800">Online Users</h2>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {filteredUsers.length}
              </span>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No users found</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onStartChat(user.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        {getUnreadCount(user.id) > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">
                              {getUnreadCount(user.id) > 9 ? '9+' : getUnreadCount(user.id)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{user.username}</h3>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-green-600">Online</p>
                          {getUnreadCount(user.id) > 0 && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">
                              {getUnreadCount(user.id)} new message{getUnreadCount(user.id) > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <button className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      </button>
                      {getUnreadCount(user.id) > 0 && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <NotificationTest />
    </div>
  );
}