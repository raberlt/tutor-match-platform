import React, { useState, useEffect } from "react";
import { useI18n } from "../../contexts/I18nContext";
import viData from "./json/adminMessages.data.vi.json";
import enData from "./json/adminMessages.data.en.json";

// Types based on backend entities
interface Message {
  id: number;
  senderName: string;
  senderEmail: string;
  recipientName: string;
  recipientEmail: string;
  subject: string;
  content: string;
  messageType: "BOOKING_INQUIRY" | "FEEDBACK" | "CANCELLATION_REQUEST";
  status: "UNREAD" | "READ";
  createdAt: string;
  updatedAt: string;
}

interface MessageStats {
  totalMessages: number;
  unreadMessages: number;
  readMessages: number;
  bookingInquiries: number;
  feedbacks: number;
  cancellationRequests: number;
}

const AdminMessages: React.FC = () => {
  const { t, locale } = useI18n();
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<MessageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  // Load localized mock data (replace with API later)
  useEffect(() => {
    const dataset = locale === "vi" ? viData : enData;
    setMessages(dataset.messages as Message[]);
    setStats(dataset.stats as MessageStats);
    setLoading(false);
  }, [locale]);

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "" || message.status === selectedStatus;

    const matchesType =
      selectedType === "" || message.messageType === selectedType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    return status === "UNREAD"
      ? "bg-blue-100 text-blue-800"
      : "bg-gray-100 text-gray-800";
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "BOOKING_INQUIRY":
        return "bg-green-100 text-green-800";
      case "FEEDBACK":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLATION_REQUEST":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto border-blue-600"></div>
          <p className="mt-3 text-gray-600">{t("loading")}</p>
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
                {t("adminMessages.title")}
              </h1>
              <p className="text-gray-600 mt-1">
                {t("adminMessages.subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-blue-100">
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
                    {t("adminMessages.totalMessages")}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.totalMessages}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-blue-100">
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
                      d="M15 17h5l-5 5v-5zM4.828 7l2.586-2.586a2 2 0 012.828 0L12 6l-1.414 1.414a2 2 0 01-2.828 0L4.828 7z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {t("adminMessages.unreadMessages")}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.unreadMessages}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-gray-100">
                  <svg
                    className="w-6 h-6 text-gray-600"
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
                    {t("adminMessages.readMessages")}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.readMessages}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-green-100">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {t("adminMessages.bookingInquiries")}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.bookingInquiries}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-yellow-100">
                  <svg
                    className="w-6 h-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {t("adminMessages.feedbacks")}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.feedbacks}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-red-100">
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {t("adminMessages.cancellationRequests")}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.cancellationRequests}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder={t("adminMessages.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t("adminMessages.status")}</option>
                <option value="UNREAD">{t("adminMessages.unread")}</option>
                <option value="READ">{t("adminMessages.read")}</option>
              </select>
            </div>
            <div className="sm:w-48">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t("adminMessages.messageType")}</option>
                <option value="BOOKING_INQUIRY">
                  {t("adminMessages.bookingInquiry")}
                </option>
                <option value="FEEDBACK">{t("adminMessages.feedback")}</option>
                <option value="CANCELLATION_REQUEST">
                  {t("adminMessages.cancellationRequest")}
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Messages Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("adminMessages.senderName")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("adminMessages.recipientName")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("adminMessages.subject")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("adminMessages.content")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("adminMessages.messageType")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("adminMessages.status")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("adminMessages.createdAt")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("adminMessages.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMessages.map((message) => (
                  <tr key={message.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {message.senderName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {message.senderEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {message.recipientName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {message.recipientEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {message.subject}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {truncateContent(message.content)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(
                          message.messageType
                        )}`}
                      >
                        {message.messageType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          message.status
                        )}`}
                      >
                        {message.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(message.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        {t("adminMessages.markAsRead")}
                      </button>
                      <button className="text-green-600 hover:text-green-900 mr-3">
                        {t("adminMessages.reply")}
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        {t("adminMessages.delete")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredMessages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">{t("loading")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;
