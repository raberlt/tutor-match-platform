import React, { useState } from "react";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "user" | "tutor" | "admin";
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: "user" | "tutor" | "admin";
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  avatar?: string;
}

export const Messages: React.FC = () => {
  const [conversations] = useState<Conversation[]>([
    {
      id: "1",
      participantId: "tutor1",
      participantName: "Cô Nguyễn Thị Lan",
      participantRole: "tutor",
      lastMessage: "Em có thể học vào tối thứ 3 được không ạ?",
      lastMessageTime: "10:30",
      unreadCount: 2,
      isOnline: true,
    },
    {
      id: "2",
      participantId: "tutor2",
      participantName: "Thầy Trần Văn Nam",
      participantRole: "tutor",
      lastMessage: "Bài tập hôm qua em làm được bao nhiêu?",
      lastMessageTime: "Hôm qua",
      unreadCount: 0,
      isOnline: false,
    },
    {
      id: "3",
      participantId: "admin1",
      participantName: "Admin TutorMatch",
      participantRole: "admin",
      lastMessage: "Chúc mừng em đã hoàn thành 10 buổi học đầu tiên!",
      lastMessageTime: "2 ngày trước",
      unreadCount: 1,
      isOnline: true,
    },
  ]);

  const [messages] = useState<Message[]>([
    {
      id: "1",
      senderId: "tutor1",
      senderName: "Cô Nguyễn Thị Lan",
      senderRole: "tutor",
      content:
        "Chào em! Cô đã xem lịch học của em rồi. Tuần này chúng ta sẽ ôn tập về thì trong tiếng Anh nhé.",
      timestamp: "09:00",
      isRead: true,
    },
    {
      id: "2",
      senderId: "user",
      senderName: "Tôi",
      senderRole: "user",
      content: "Dạ em cảm ơn cô. Em có thắc mắc về bài tập ở nhà ạ.",
      timestamp: "09:15",
      isRead: true,
    },
    {
      id: "3",
      senderId: "tutor1",
      senderName: "Cô Nguyễn Thị Lan",
      senderRole: "tutor",
      content: "Em cứ hỏi thoải mái, cô sẽ giải đáp cho em.",
      timestamp: "09:16",
      isRead: true,
    },
    {
      id: "4",
      senderId: "user",
      senderName: "Tôi",
      senderRole: "user",
      content:
        "Em không hiểu cách dùng present perfect tense ạ. Cô có thể giải thích thêm không ạ?",
      timestamp: "09:20",
      isRead: true,
    },
    {
      id: "5",
      senderId: "tutor1",
      senderName: "Cô Nguyễn Thị Lan",
      senderRole: "tutor",
      content:
        "Present Perfect được dùng để diễn tả hành động đã xảy ra trong quá khứ nhưng kết quả vẫn còn ảnh hưởng đến hiện tại. Ví dụ: I have finished my homework.",
      timestamp: "09:25",
      isRead: true,
    },
    {
      id: "6",
      senderId: "tutor1",
      senderName: "Cô Nguyễn Thị Lan",
      senderRole: "tutor",
      content: "Em có thể học vào tối thứ 3 được không ạ?",
      timestamp: "10:30",
      isRead: false,
    },
  ]);

  const [selectedConversation, setSelectedConversation] = useState<string>("1");
  const [newMessage, setNewMessage] = useState("");

  const getSelectedMessages = () => {
    if (selectedConversation === "1") {
      return messages;
    }
    return [];
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log("Sending message:", newMessage);
      setNewMessage("");
    }
  };

  const formatTime = (time: string) => {
    return time;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "tutor":
        return "text-blue-600";
      case "admin":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "tutor":
        return "👨‍🏫";
      case "admin":
        return "👑";
      default:
        return "👤";
    }
  };

  return (
    <div
      className="flex h-[calc(100vh-200px)] bg-white rounded-2xl shadow-lg overflow-hidden"
      style={{ borderColor: "rgba(148, 204, 230, 0.2)" }}
    >
      {/* Conversations List */}
      <div
        className="w-1/4 border-r"
        style={{ borderColor: "rgba(148, 204, 230, 0.2)" }}
      >
        <div
          className="p-4 border-b"
          style={{ borderColor: "rgba(148, 204, 230, 0.2)" }}
        >
          <h2 className="text-lg font-semibold text-gray-900">Tin nhắn</h2>
          <div className="mt-3">
            <input
              type="text"
              placeholder="Tìm kiếm cuộc trò chuyện..."
              className="w-full px-3 py-2 border rounded-xl focus:outline-none transition-colors duration-200"
              style={{
                borderColor: "rgba(148, 204, 230, 0.3)",
                backgroundColor: "rgba(148, 204, 230, 0.05)",
              }}
            />
          </div>
        </div>

        <div className="overflow-y-auto">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation.id)}
              className={`p-3 border-b cursor-pointer transition-colors duration-200 ${
                selectedConversation === conversation.id ? "border-r-4" : ""
              }`}
              style={{
                borderColor:
                  selectedConversation === conversation.id
                    ? "rgb(148, 204, 230)"
                    : "rgba(148, 204, 230, 0.1)",
                backgroundColor:
                  selectedConversation === conversation.id
                    ? "rgba(148, 204, 230, 0.1)"
                    : "transparent",
              }}
            >
              <div className="flex items-start space-x-3">
                <div className="relative flex-shrink-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgba(148, 204, 230, 0.2)" }}
                  >
                    <span className="text-lg">
                      {getRoleIcon(conversation.participantRole)}
                    </span>
                  </div>
                  {conversation.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`text-sm font-medium truncate ${getRoleColor(
                        conversation.participantRole
                      )}`}
                    >
                      {conversation.participantName}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {conversation.lastMessageTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span
                        className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full"
                        style={{ backgroundColor: "rgb(148, 204, 230)" }}
                      >
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center mt-1">
                    <span
                      className={`text-xs ${getRoleColor(
                        conversation.participantRole
                      )}`}
                    >
                      {conversation.participantRole === "tutor"
                        ? "Gia sư"
                        : conversation.participantRole === "admin"
                        ? "Admin"
                        : "Học viên"}
                    </span>
                    {conversation.isOnline && (
                      <span className="ml-2 text-xs text-green-600">
                        ● Online
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div
              className="p-4 border-b"
              style={{
                borderColor: "rgba(148, 204, 230, 0.2)",
                backgroundColor: "rgba(148, 204, 230, 0.05)",
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgba(148, 204, 230, 0.2)" }}
                  >
                    <span className="text-lg">
                      {getRoleIcon(
                        conversations.find((c) => c.id === selectedConversation)
                          ?.participantRole || "user"
                      )}
                    </span>
                  </div>
                  {conversations.find((c) => c.id === selectedConversation)
                    ?.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <h3
                    className={`font-medium ${getRoleColor(
                      conversations.find((c) => c.id === selectedConversation)
                        ?.participantRole || "user"
                    )}`}
                  >
                    {
                      conversations.find((c) => c.id === selectedConversation)
                        ?.participantName
                    }
                  </h3>
                  <p className="text-sm text-gray-500">
                    {conversations.find((c) => c.id === selectedConversation)
                      ?.isOnline
                      ? "Đang online"
                      : "Offline"}
                  </p>
                </div>

                <div className="ml-auto flex space-x-2">
                  <button
                    className="p-2 rounded-full transition-colors duration-200"
                    style={{
                      color: "rgb(148, 204, 230)",
                      backgroundColor: "rgba(148, 204, 230, 0.1)",
                    }}
                  >
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
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </button>
                  <button
                    className="p-2 rounded-full transition-colors duration-200"
                    style={{
                      color: "rgb(148, 204, 230)",
                      backgroundColor: "rgba(148, 204, 230, 0.1)",
                    }}
                  >
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
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {getSelectedMessages().map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl ${
                      message.senderId === "user"
                        ? "text-white"
                        : "text-gray-900"
                    }`}
                    style={{
                      backgroundColor:
                        message.senderId === "user"
                          ? "rgb(148, 204, 230)"
                          : "rgba(148, 204, 230, 0.1)",
                    }}
                  >
                    {message.senderId !== "user" && (
                      <div
                        className={`text-xs font-medium mb-1 ${getRoleColor(
                          message.senderRole
                        )}`}
                      >
                        {message.senderName}
                      </div>
                    )}
                    <p className="text-sm">{message.content}</p>
                    <div
                      className={`text-xs mt-1 ${
                        message.senderId === "user"
                          ? "text-blue-100"
                          : "text-gray-500"
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div
              className="p-4 border-t"
              style={{ borderColor: "rgba(148, 204, 230, 0.2)" }}
            >
              <div className="flex space-x-3">
                <button
                  className="p-2 rounded-xl transition-colors duration-200"
                  style={{
                    color: "rgb(148, 204, 230)",
                    backgroundColor: "rgba(148, 204, 230, 0.1)",
                  }}
                >
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
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-4 py-2 border rounded-xl focus:outline-none transition-colors duration-200"
                  style={{
                    borderColor: "rgba(148, 204, 230, 0.3)",
                    backgroundColor: "rgba(148, 204, 230, 0.05)",
                  }}
                />
                <button
                  className="p-2 rounded-xl transition-colors duration-200"
                  style={{
                    color: "rgb(148, 204, 230)",
                    backgroundColor: "rgba(148, 204, 230, 0.1)",
                  }}
                >
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
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a2.5 2.5 0 000-5H9v5zm0 0H7.5a2.5 2.5 0 000 5H9v-5z"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  style={{
                    backgroundColor: "rgb(148, 204, 230)",
                    opacity: !newMessage.trim() ? 0.5 : 1,
                  }}
                >
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
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div
                className="text-6xl mb-4 p-4 rounded-full"
                style={{ backgroundColor: "rgba(148, 204, 230, 0.1)" }}
              >
                💬
              </div>
              <h3 className="text-lg font-medium mb-2">
                Chọn một cuộc trò chuyện
              </h3>
              <p className="text-sm">
                Chọn cuộc trò chuyện từ danh sách để bắt đầu nhắn tin
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
