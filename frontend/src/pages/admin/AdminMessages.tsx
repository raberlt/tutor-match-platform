import React, { useState, useEffect } from "react";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "STUDENT" | "TUTOR";
  receiverId: string;
  receiverName: string;
  receiverRole: "STUDENT" | "TUTOR";
  content: string;
  timestamp: string;
  isRead: boolean;
  conversationId: string;
}

interface Conversation {
  id: string;
  participants: {
    student: {
      id: string;
      name: string;
    };
    tutor: {
      id: string;
      name: string;
    };
  };
  lastMessage: Message;
  unreadCount: number;
  createdAt: string;
}

const AdminMessages: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [messageViewMode, setMessageViewMode] = useState<"tutor" | "student">(
    "tutor"
  );

  // Mock data
  const mockConversations: Conversation[] = [
    {
      id: "1",
      participants: {
        student: { id: "s1", name: "Nguyễn Minh An" },
        tutor: { id: "t1", name: "Trần Văn Bình" },
      },
      lastMessage: {
        id: "m1",
        senderId: "s1",
        senderName: "Nguyễn Minh An",
        senderRole: "STUDENT",
        receiverId: "t1",
        receiverName: "Trần Văn Bình",
        receiverRole: "TUTOR",
        content: "Thầy ơi, em có câu hỏi về bài tập toán",
        timestamp: "2025-01-20T10:30:00Z",
        isRead: false,
        conversationId: "1",
      },
      unreadCount: 3,
      createdAt: "2025-01-15T09:00:00Z",
    },
    {
      id: "2",
      participants: {
        student: { id: "s2", name: "Lê Thị Hoa" },
        tutor: { id: "t2", name: "Phạm Văn Cường" },
      },
      lastMessage: {
        id: "m2",
        senderId: "t2",
        senderName: "Phạm Văn Cường",
        senderRole: "TUTOR",
        receiverId: "s2",
        receiverName: "Lê Thị Hoa",
        receiverRole: "STUDENT",
        content: "Em nhớ làm bài tập về nhà nhé",
        timestamp: "2025-01-20T09:15:00Z",
        isRead: true,
        conversationId: "2",
      },
      unreadCount: 0,
      createdAt: "2025-01-10T14:30:00Z",
    },
    {
      id: "3",
      participants: {
        student: { id: "s3", name: "Hoàng Văn Đức" },
        tutor: { id: "t1", name: "Trần Văn Bình" },
      },
      lastMessage: {
        id: "m3",
        senderId: "s3",
        senderName: "Hoàng Văn Đức",
        senderRole: "STUDENT",
        receiverId: "t1",
        receiverName: "Trần Văn Bình",
        receiverRole: "TUTOR",
        content: "Cảm ơn thầy đã giúp em hiểu bài",
        timestamp: "2025-01-19T16:45:00Z",
        isRead: true,
        conversationId: "3",
      },
      unreadCount: 0,
      createdAt: "2025-01-12T11:20:00Z",
    },
  ];

  const mockMessages: Message[] = [
    {
      id: "m1",
      senderId: "s1",
      senderName: "Nguyễn Minh An",
      senderRole: "STUDENT",
      receiverId: "t1",
      receiverName: "Trần Văn Bình",
      receiverRole: "TUTOR",
      content: "Thầy ơi, em có câu hỏi về bài tập toán",
      timestamp: "2025-01-20T10:30:00Z",
      isRead: false,
      conversationId: "1",
    },
    {
      id: "m2",
      senderId: "t1",
      senderName: "Trần Văn Bình",
      senderRole: "TUTOR",
      receiverId: "s1",
      receiverName: "Nguyễn Minh An",
      receiverRole: "STUDENT",
      content: "Chào em! Thầy sẽ giúp em giải bài tập này",
      timestamp: "2025-01-20T10:35:00Z",
      isRead: true,
      conversationId: "1",
    },
    {
      id: "m3",
      senderId: "s1",
      senderName: "Nguyễn Minh An",
      senderRole: "STUDENT",
      receiverId: "t1",
      receiverName: "Trần Văn Bình",
      receiverRole: "TUTOR",
      content: "Bài tập về phương trình bậc hai ạ",
      timestamp: "2025-01-20T10:40:00Z",
      isRead: false,
      conversationId: "1",
    },
  ];

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setConversations(mockConversations);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      // Simulate API call with conversationId
      console.log("Loading messages for conversation:", conversationId);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setMessages(mockMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("vi-VN");
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "STUDENT":
        return "bg-blue-100 text-blue-800";
      case "TUTOR":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "STUDENT":
        return "Học viên";
      case "TUTOR":
        return "Gia sư";
      default:
        return "Không xác định";
    }
  };

  const filteredConversations = conversations.filter((conversation) => {
    const matchesSearch =
      conversation.participants.student.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      conversation.participants.tutor.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    // Lọc theo chế độ xem tin nhắn
    const matchesViewMode =
      messageViewMode === "tutor"
        ? conversation.lastMessage.senderRole === "TUTOR"
        : conversation.lastMessage.senderRole === "STUDENT";

    return matchesSearch && matchesViewMode;
  });

  const totalUnreadMessages = conversations.reduce(
    (sum, c) => sum + c.unreadCount,
    0
  );
  const totalConversations = conversations.length;
  const activeConversations = conversations.filter(
    (c) => c.unreadCount > 0
  ).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý tin nhắn
            </h1>
            <p className="text-sm text-gray-600">
              Theo dõi và quản lý cuộc trò chuyện giữa gia sư và học viên
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-blue-500">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600"
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
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Tổng cuộc trò chuyện
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {totalConversations}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-red-500">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12 7H4.828z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Tin nhắn chưa đọc
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {totalUnreadMessages}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-green-500">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg
                className="w-6 h-6 text-green-600"
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
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Cuộc trò chuyện hoạt động
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {activeConversations}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-purple-500">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Người dùng tham gia
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {conversations.length * 2}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Chế độ xem tin nhắn */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setMessageViewMode("tutor")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  messageViewMode === "tutor"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Tin nhắn từ gia sư
              </button>
              <button
                onClick={() => setMessageViewMode("student")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  messageViewMode === "student"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Tin nhắn từ học viên
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm cuộc trò chuyện..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Cuộc trò chuyện ({filteredConversations.length})
              </h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleConversationSelect(conversation)}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                    selectedConversation?.id === conversation.id
                      ? "bg-blue-50"
                      : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-gray-600"
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
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conversation.participants.student.name} ↔{" "}
                          {conversation.participants.tutor.name}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.lastMessage.content}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                            conversation.lastMessage.senderRole
                          )}`}
                        >
                          {getRoleText(conversation.lastMessage.senderRole)}
                        </span>
                        <p className="text-xs text-gray-400">
                          {formatTime(conversation.lastMessage.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Messages View */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {selectedConversation.participants.student.name} ↔{" "}
                      {selectedConversation.participants.tutor.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {messageViewMode === "tutor"
                        ? "Đang xem tin nhắn từ gia sư"
                        : "Đang xem tin nhắn từ học viên"}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="h-96 overflow-y-auto p-6">
                <div className="space-y-4">
                  {messages
                    .filter((message) =>
                      messageViewMode === "tutor"
                        ? message.senderRole === "TUTOR"
                        : message.senderRole === "STUDENT"
                    )
                    .map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderRole === "STUDENT"
                            ? "justify-start"
                            : "justify-end"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.senderRole === "STUDENT"
                              ? "bg-gray-100 text-gray-900"
                              : "bg-blue-600 text-white"
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs font-medium">
                              {message.senderName}
                            </span>
                            <span
                              className={`inline-flex px-1 py-0.5 text-xs font-semibold rounded ${getRoleColor(
                                message.senderRole
                              )}`}
                            >
                              {getRoleText(message.senderRole)}
                            </span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-75 mt-1">
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-96 flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
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
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Chọn cuộc trò chuyện
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Chọn một cuộc trò chuyện để xem tin nhắn
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;
