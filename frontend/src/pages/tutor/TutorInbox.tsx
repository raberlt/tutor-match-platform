import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useSearchParams } from "react-router-dom";

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
  participantAvatar?: string;
  unreadCount: number;
}

export const TutorInbox: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const studentParam = searchParams.get("student"); // Get student ID from URL

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<ReturnType<
    typeof setInterval
  > | null>(null);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);
  const messagesContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-select conversation with student from URL parameter
  useEffect(() => {
    if (studentParam && studentParam !== "undefined") {
      const studentId = parseInt(studentParam);
      if (!isNaN(studentId)) {
        // Wait for conversations to load first
        if (conversations.length > 0) {
          const studentConversation = conversations.find(
            (conv) => conv.participantId === studentId
          );
          if (studentConversation) {
            setSelectedConversation(studentConversation);
            loadMessages(studentConversation.participantId);
          } else {
            // Create new conversation with student
            createNewConversationWithStudent(studentId);
          }
        } else {
          // If no conversations yet, create new one directly
          createNewConversationWithStudent(studentId);
        }
      }
    }
  }, [studentParam, conversations]); // eslint-disable-line react-hooks/exhaustive-deps

  // Setup auto-refresh for selected conversation
  useEffect(() => {
    if (selectedConversation) {
      // Start polling for new messages every 3 seconds
      const interval = setInterval(() => {
        loadMessages(selectedConversation.participantId, true); // isPolling = true
      }, 3000);

      setRefreshInterval(interval);

      // Cleanup on conversation change or unmount
      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    } else {
      // Clear interval when no conversation selected
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  }, [selectedConversation]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  // Only scroll when user sends a new message, not during polling
  useEffect(() => {
    // Don't auto-scroll at all - let user control scrolling
    setPreviousMessageCount(messages.length);
  }, [messages, previousMessageCount]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/messages/conversations", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Conversations API response:", data);

        // Backend returns conversations directly, not messages to process
        if (Array.isArray(data)) {
          // Sắp xếp cuộc trò chuyện theo thời gian tin nhắn cuối cùng (mới nhất trước)
          const sortedConversations = data.sort((a, b) => {
            const timeA = new Date(a.lastMessageTime || 0).getTime();
            const timeB = new Date(b.lastMessageTime || 0).getTime();
            return timeB - timeA;
          });
          setConversations(sortedConversations);

          // Tự động chọn cuộc trò chuyện mới nhất nếu chưa có cuộc trò chuyện nào được chọn
          if (!selectedConversation && sortedConversations.length > 0) {
            setSelectedConversation(sortedConversations[0]);
            loadMessages(sortedConversations[0].participantId);
          }
        } else {
          console.log("Unexpected data format, using mock conversations");
          loadMockConversations();
        }
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
        participantRole: "STUDENT",
        lastMessage: "Chào thầy/cô! Em muốn hỏi về buổi học sắp tới.",
        lastMessageTime: "Vừa xong",
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
      {
        participantId: 3,
        participantName: "Lê Văn C",
        participantRole: "STUDENT",
        lastMessage: "Cảm ơn thầy/cô đã giúp em hiểu bài!",
        lastMessageTime: "2 ngày trước",
        unreadCount: 1,
      },
    ];
    setConversations(mockConversations);
  };

  // Create new conversation with student
  const createNewConversationWithStudent = async (studentId: number) => {
    try {
      // Fetch student info first
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/users/${studentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const studentData = await response.json();
        const newConversation: Conversation = {
          participantId: studentId,
          participantName:
            `${studentData.firstName || ""} ${
              studentData.lastName || ""
            }`.trim() || "Học viên",
          participantRole: "STUDENT",
          lastMessage: "Bắt đầu cuộc trò chuyện",
          lastMessageTime: new Date().toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          unreadCount: 0,
        };

        // Add to conversations list if not exists
        setConversations((prev) => {
          const exists = prev.find((conv) => conv.participantId === studentId);
          if (!exists) {
            return [newConversation, ...prev];
          }
          return prev;
        });

        // Select this conversation
        setSelectedConversation(newConversation);
        setMessages([]); // Start with empty messages
      } else {
        throw new Error("Failed to fetch student info");
      }
    } catch (error) {
      console.error("Error creating conversation with student:", error);
      setError("Không thể tạo cuộc trò chuyện với học viên");
    }
  };

  const loadMessages = async (participantId: number, isPollingCall = false) => {
    try {
      if (!isPollingCall) {
        setLoading(true);
      }
      console.log(
        `Loading messages for participant ${participantId}, isPolling: ${isPollingCall}`
      );

      const response = await fetch(
        `/api/messages/conversation/${participantId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log(
        `Messages response status for ${participantId}:`,
        response.status
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`Messages data for ${participantId}:`, data);
        console.log(`First message time:`, data[0]?.createdAt);
        console.log(`Last message time:`, data[data.length - 1]?.createdAt);
        setMessages(data);
      } else {
        const errorText = await response.text();
        console.error(`Messages error for ${participantId}:`, errorText);
        throw new Error("Failed to load messages");
      }
    } catch (err) {
      console.error("Error loading messages:", err);
      // Fallback to mock messages only if not polling
      if (!isPollingCall) {
        setError("Không thể tải tin nhắn");
        loadMockMessages(participantId);
      }
    } finally {
      if (!isPollingCall) {
        setLoading(false);
      }
    }
  };

  const loadMockMessages = (participantId: number) => {
    const mockMessages: Message[] = [
      {
        id: 1,
        senderId: participantId,
        senderName: selectedConversation?.participantName || "Học viên",
        senderRole: selectedConversation?.participantRole || "STUDENT",
        receiverId: user?.id || 0,
        receiverName: user?.firstName + " " + user?.lastName || "Bạn",
        receiverRole: user?.role || "TUTOR",
        content: "Chào thầy/cô! Em muốn hỏi về buổi học sắp tới.",
        isRead: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        senderId: user?.id || 0,
        senderName: user?.firstName + " " + user?.lastName || "Bạn",
        senderRole: user?.role || "TUTOR",
        receiverId: participantId,
        receiverName: selectedConversation?.participantName || "Học viên",
        receiverRole: selectedConversation?.participantRole || "STUDENT",
        content: "Chào em! Thầy/cô có thể giúp gì cho em?",
        isRead: true,
        createdAt: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
      },
    ];
    setMessages(mockMessages);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedConversation) {
      try {
        const response = await fetch("/api/messages/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            receiverId: selectedConversation.participantId,
            content: newMessage,
          }),
        });

        if (response.ok) {
          const sentMessage = await response.json();
          setMessages((prev) => [...prev, sentMessage.data || sentMessage]);
          setNewMessage("");

          // Scroll to bottom only when user sends a message
          setTimeout(scrollToBottom, 100);

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => {
              setError(null);
              loadConversations();
            }}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Thử lại
          </button>
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
            {conversations.length > 0 ? (
              conversations.map((conv) => (
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
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <div className="mb-4">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <p className="text-sm">Chưa có cuộc trò chuyện nào</p>
                <p className="text-xs mt-1">
                  Học viên sẽ nhắn tin cho bạn từ trang buổi học
                </p>
              </div>
            )}
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
                <div
                  ref={messagesContainerRef}
                  className="flex-1 p-4 overflow-y-auto bg-gray-50"
                >
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
