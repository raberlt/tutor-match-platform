import React, { useState, useEffect, useCallback } from "react";

interface Message {
  id: number;
  senderId: number;
  senderName: string;
  senderRole: string;
  receiverId: number;
  receiverName: string;
  receiverRole: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface Conversation {
  id: string;
  participantId: number;
  participantName: string;
  participantRole: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  avatar?: string;
}

export const AdminMessages: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadAllMessages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/messages/admin/all");
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        // Tạo danh sách conversations từ messages
        const conversationMap = new Map();
        data.forEach((msg: Message) => {
          const key = `${Math.min(msg.senderId, msg.receiverId)}-${Math.max(
            msg.senderId,
            msg.receiverId
          )}`;
          if (!conversationMap.has(key)) {
            conversationMap.set(key, {
              id: key,
              participantId: msg.senderId,
              participantName: msg.senderName,
              participantRole: msg.senderRole,
              lastMessage: msg.content,
              lastMessageTime: msg.createdAt,
              unreadCount: 0,
              isOnline: false,
            });
          }
        });
        setConversations(Array.from(conversationMap.values()));
      } else {
        setError("Không thể tải tin nhắn");
      }
    } catch (err) {
      setError("Lỗi khi tải tin nhắn");
      console.error("Error loading messages:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllMessages();
  }, [loadAllMessages]);

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    // Load messages for this conversation
    const conversationMessages = messages.filter(
      (msg) =>
        (msg.senderId === conversation.participantId ||
          msg.receiverId === conversation.participantId) &&
        (msg.senderId !== conversation.participantId ||
          msg.receiverId !== conversation.participantId)
    );
    setMessages(conversationMessages);
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.participantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-blue-100 text-blue-800";
      case "TUTOR":
        return "bg-green-100 text-green-800";
      case "STUDENT":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Admin";
      case "TUTOR":
        return "Gia sư";
      case "STUDENT":
        return "Học viên";
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">Đang tải tin nhắn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center space-x-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "rgb(148, 204, 230)" }}
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Quản lý cuộc trò chuyện
              </h1>
              <p className="text-gray-600 mt-1">
                Xem chi tiết cuộc trò chuyện giữa gia sư và học viên (chỉ khi đã
                booking thành công và thanh toán)
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-100">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  Tổng cuộc trò chuyện
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {conversations.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-green-100">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  Tin nhắn đã đọc
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {messages.filter((msg) => msg.isRead).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-yellow-100">
                <svg
                  className="w-5 h-5 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  Tin nhắn chưa đọc
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {messages.filter((msg) => !msg.isRead).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm cuộc trò chuyện..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex h-96">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Danh sách cuộc trò chuyện
                </h3>
              </div>
              <div className="overflow-y-auto h-full">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => handleConversationSelect(conversation)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                        selectedConversation?.id === conversation.id
                          ? "bg-blue-50 border-l-4 border-l-blue-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {conversation.participantName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {conversation.participantName}
                            </p>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                                conversation.participantRole
                              )}`}
                            >
                              {getRoleText(conversation.participantRole)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.lastMessage}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(
                              conversation.lastMessageTime
                            ).toLocaleString("vi-VN")}
                          </p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                              {conversation.unreadCount}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <div className="mb-4">
                        <svg
                          className="w-16 h-16 mx-auto text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Chưa có cuộc trò chuyện nào
                      </h3>
                      <p className="text-gray-400 text-xs">
                        Chỉ hiển thị cuộc trò chuyện giữa gia sư và học viên đã
                        booking thành công
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <div className="flex-1 flex flex-col">
                  {/* Conversation Header */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {selectedConversation.participantName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {selectedConversation.participantName}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {getRoleText(selectedConversation.participantRole)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages
                      .filter(
                        (msg) =>
                          (msg.senderId ===
                            selectedConversation.participantId ||
                            msg.receiverId ===
                              selectedConversation.participantId) &&
                          (msg.senderId !==
                            selectedConversation.participantId ||
                            msg.receiverId !==
                              selectedConversation.participantId)
                      )
                      .map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.senderId ===
                            selectedConversation.participantId
                              ? "justify-start"
                              : "justify-end"
                          }`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-lg ${
                              message.senderId ===
                              selectedConversation.participantId
                                ? "bg-gray-200 text-gray-900"
                                : "bg-blue-500 text-white"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.senderId ===
                                selectedConversation.participantId
                                  ? "text-gray-500"
                                  : "text-blue-100"
                              }`}
                            >
                              {new Date(message.createdAt).toLocaleString(
                                "vi-VN"
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="mb-4">
                      <svg
                        className="w-16 h-16 mx-auto text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Chọn cuộc trò chuyện để xem
                    </h3>
                    <p className="text-gray-400 text-xs">
                      Chỉ hiển thị cuộc trò chuyện giữa gia sư và học viên đã
                      booking thành công
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
