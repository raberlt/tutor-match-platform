import React, { useState } from "react";
import api from "../../services/api";

const SimpleTest: React.FC = () => {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult("");

    try {
      // Test basic connection first
      const response = await api.get("/admin/test/test-data-stats");
      setResult(
        `✅ Kết nối thành công!\n\n${JSON.stringify(response.data, null, 2)}`
      );
    } catch (error: any) {
      setResult(
        `❌ Lỗi kết nối:\n\n${JSON.stringify(
          {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: error.config?.url,
            method: error.config?.method,
          },
          null,
          2
        )}`
      );
    } finally {
      setLoading(false);
    }
  };

  const testGenerate = async () => {
    setLoading(true);
    setResult("");

    try {
      const response = await api.post("/admin/test/generate-tutors", {
        tutors: [
          {
            firstName: "Test",
            lastName: "User",
            email: "test@test.com",
            password: "123456",
            phoneNumber: "0123456789",
            address: "Hà Nội",
            gender: "MALE",
            dateOfBirth: "1995-01-15",
            educationLevel: "COLLEGE_UNIVERSITY",
            headline: "Test Tutor",
            bio: "Test bio",
            experience: "Test experience",
            subjects: ["Toán học"],
            hourlyRates: { "Toán học": 200000 },
          },
        ],
        count: 1,
      });

      setResult(
        `✅ Tạo thành công!\n\n${JSON.stringify(response.data, null, 2)}`
      );
    } catch (error: any) {
      setResult(
        `❌ Lỗi tạo tutor:\n\n${JSON.stringify(
          {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: error.config?.url,
            method: error.config?.method,
          },
          null,
          2
        )}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Simple API Test</h1>

      <div className="space-y-4">
        <button
          onClick={testConnection}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Đang test..." : "Test Connection"}
        </button>

        <button
          onClick={testGenerate}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 ml-4"
        >
          {loading ? "Đang tạo..." : "Test Generate Tutor"}
        </button>
      </div>

      {result && (
        <div className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Kết quả</h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
};

export default SimpleTest;


