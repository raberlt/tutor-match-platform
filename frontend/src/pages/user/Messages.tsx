import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

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
  participantId: number;
  participantName: string;
  participantRole: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/messages/admin/all");
      if (response.ok) {
        const data = await response.json();
        // Tạo danh sách conversations từ messages
        const conversationMap = new Map();
        data.forEach((msg: Message) => {
          const key = `${Math.min(msg.senderId, msg.receiverId)}-${Math.max(
            msg.senderId,
            msg.receiverId
          )}`;
          if (!conversationMap.has(key)) {
            conversationMap.set(key, {
              participantId:
                msg.senderId === user?.id ? msg.receiverId : msg.senderId,
              participantName:
                msg.senderId === user?.id ? msg.receiverName : msg.senderName,
              participantRole:
                msg.senderId === user?.id ? msg.receiverRole : msg.senderRole,
              lastMessage: msg.content,
              lastMessageTime: new Date(msg.createdAt).toLocaleTimeString(
                "vi-VN",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              ),
              unreadCount: 0,
            });
          }
        });
        setConversations(Array.from(conversationMap.values()));
      } else {
        throw new Error("Failed to load conversations");
      }
    } catch (err) {
      setError("Không thể tải danh sách cuộc trò chuyện");
      console.error("Error loading conversations:", err);
      // Fallback to mock data
      loadMockConversations();
    } finally {
      setLoading(false);
    }
  };

  const loadMockConversations = () => {
    const mockConversations: Conversation[] = [
      {
        participantId: 1,
        participantName: "Nguyễn Văn A",
        participantRole: "TUTOR",
        lastMessage: "Chào em, em có thể học vào tối thứ 3 được không ạ?",
        lastMessageTime: "10:30",
        unreadCount: 2,
      },
      {
        participantId: 2,
        participantName: "Trần Thị B",
        participantRole: "STUDENT",
        lastMessage: "Em muốn đặt lịch học môn Toán.",
        lastMessageTime: "Hôm qua",
        unreadCount: 0,
      },
    ];
    setConversations(mockConversations);
  };

  const loadMessages = async (participantId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/messages/between/${participantId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        throw new Error("Failed to load messages");
      }
    } catch (err) {
      setError("Không thể tải tin nhắn");
      console.error("Error loading messages:", err);
      // Fallback to mock data
      loadMockMessages(participantId);
    } finally {
      setLoading(false);
    }
  };

  const loadMockMessages = (participantId: number) => {
    const mockMessages: Message[] = [
      {
        id: 1,
        senderId: participantId,
        senderName: selectedConversation?.participantName || "",
        senderRole: selectedConversation?.participantRole || "",
        receiverId: user?.id || 0,
        receiverName: user?.firstName + " " + user?.lastName || "",
        receiverRole: user?.role || "",
        content: "Chào em, em có thể học vào tối thứ 3 được không ạ?",
        isRead: true,
        createdAt: "2024-01-15T10:30:00",
      },
      {
        id: 2,
        senderId: user?.id || 0,
        senderName: user?.firstName + " " + user?.lastName || "",
        senderRole: user?.role || "",
        receiverId: participantId,
        receiverName: selectedConversation?.participantName || "",
        receiverRole: selectedConversation?.participantRole || "",
        content: "Chào thầy/cô, em có thể sắp xếp được ạ.",
        isRead: true,
        createdAt: "2024-01-15T10:35:00",
      },
    ];
    setMessages(mockMessages);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedConversation) {
      try {
        const response = await fetch("/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            senderId: user?.id || 0,
            receiverId: selectedConversation.participantId,
            content: newMessage,
          }),
        });

        if (response.ok) {
          const sentMessage = await response.json();
          setMessages([...messages, sentMessage]);
          setNewMessage("");

          // Cập nhật last message trong conversation
          setConversations((prev) =>
            prev.map((conv) =>
              conv.participantId === selectedConversation.participantId
                ? {
                    ...conv,
                    lastMessage: newMessage,
                    lastMessageTime: "Vừa xong",
                  }
                : conv
            )
          );
        } else {
          throw new Error("Failed to send message");
        }
      } catch (err) {
        setError("Không thể gửi tin nhắn");
        console.error("Error sending message:", err);
      }
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.participantId);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "TUTOR":
        return "bg-green-100 text-green-800";
      case "STUDENT":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "TUTOR":
        return "Gia sư";
      case "STUDENT":
        return "Học viên";
      default:
        return role;
    }
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải tin nhắn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Tin nhắn</h1>

        <div className="flex flex-col lg:flex-row bg-white rounded-lg shadow-lg overflow-hidden h-[80vh]">
          {/* Sidebar - Danh sách cuộc trò chuyện */}
          <div className="w-full lg:w-1/3 border-r border-gray-200 bg-gray-50 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Cuộc trò chuyện
              </h2>
            </div>
            {conversations.map((conv) => (
              <div
                key={conv.participantId}
                className={`flex items-center p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors ${
                  selectedConversation?.participantId === conv.participantId
                    ? "bg-blue-50"
                    : ""
                }`}
                onClick={() => handleConversationSelect(conv)}
              >
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-600 font-semibold">
                      {conv.participantName.charAt(0)}
                    </span>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-900">
                      {conv.participantName}
                    </p>
                    <span className="text-xs text-gray-500">
                      {conv.lastMessageTime}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-gray-600 truncate">
                      {conv.lastMessage}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getRoleColor(
                      conv.participantRole
                    )}`}
                  >
                    {getRoleText(conv.participantRole)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Khu vực tin nhắn */}
          <div className="w-full lg:w-2/3 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-gray-200 bg-white flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-600 font-semibold">
                      {selectedConversation.participantName.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-3">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {selectedConversation.participantName}
                    </h2>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                        selectedConversation.participantRole
                      )}`}
                    >
                      {getRoleText(selectedConversation.participantRole)}
                    </span>
                  </div>
                </div>

                {/* Danh sách tin nhắn */}
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex mb-4 ${
                        msg.senderId === user?.id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${
                          msg.senderId === user?.id
                            ? "bg-blue-500 text-white"
                            : "bg-white text-gray-800 border border-gray-200"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <span className="block text-xs text-right mt-1 opacity-75">
                          {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input gửi tin nhắn */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleSendMessage();
                        }
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập tin nhắn..."
                    />
                    <button
                      onClick={handleSendMessage}
                      className="ml-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Gửi
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <p className="text-gray-500 text-lg">
                  Chọn một cuộc trò chuyện để xem tin nhắn
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
