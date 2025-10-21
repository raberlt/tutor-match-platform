import React, { useState } from "react";
import api from "../../services/api";

const TestDataDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const generateTestTutors = async () => {
    setLoading(true);
    setResult("");

    try {
      const response = await api.post("/admin/test/generate-tutors", {
        tutors: [
          {
            firstName: "Nguyễn",
            lastName: "Văn A",
            email: "nguyenvana@test.com",
            password: "123456",
            phoneNumber: "0123456789",
            address: "Hà Nội",
            gender: "MALE",
            dateOfBirth: "1995-01-15",
            educationLevel: "COLLEGE_UNIVERSITY",
            headline: "Gia sư Toán - Lý chuyên nghiệp",
            bio: "Tôi là gia sư có kinh nghiệm 5 năm dạy Toán và Lý.",
            experience: "5 năm kinh nghiệm giảng dạy tại các trường THPT",
            subjects: ["Toán học", "Vật lý"],
            hourlyRates: { "Toán học": 200000, "Vật lý": 180000 },
          },
          {
            firstName: "Trần",
            lastName: "Thị B",
            email: "tranthib@test.com",
            password: "123456",
            phoneNumber: "0987654321",
            address: "TP.HCM",
            gender: "FEMALE",
            dateOfBirth: "1992-03-20",
            educationLevel: "COLLEGE_UNIVERSITY",
            headline: "Chuyên gia tiếng Anh IELTS",
            bio: "Chuyên gia dạy tiếng Anh với chứng chỉ IELTS 8.0.",
            experience:
              "Thạc sĩ chuyên ngành, từng làm việc tại các trung tâm giáo dục lớn",
            subjects: ["Tiếng Anh", "IELTS"],
            hourlyRates: { "Tiếng Anh": 250000, IELTS: 300000 },
          },
        ],
        count: 2,
      });

      setResult(
        `✅ Đã tạo thành công ${response.data.createdCount}/${
          response.data.requestedCount
        } gia sư test!\n\nChi tiết:\n${JSON.stringify(response.data, null, 2)}`
      );
    } catch (error: any) {
      setResult(
        `❌ Lỗi: ${
          error.response?.data?.message ||
          error.message ||
          "Không thể tạo gia sư test"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const clearTestData = async () => {
    setLoading(true);
    setResult("");

    try {
      const response = await api.post("/admin/test/clear-test-data");

      setResult(
        `✅ ${response.data.message}\n\nChi tiết:\n${JSON.stringify(
          response.data,
          null,
          2
        )}`
      );
    } catch (error: any) {
      setResult(
        `❌ Lỗi: ${
          error.response?.data?.message ||
          error.message ||
          "Không thể xóa dữ liệu test"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const getStats = async () => {
    setLoading(true);
    setResult("");

    try {
      const response = await api.get("/admin/test/test-data-stats");

      setResult(
        `📊 Thống kê dữ liệu test:\n\n${JSON.stringify(response.data, null, 2)}`
      );
    } catch (error: any) {
      setResult(
        `❌ Lỗi: ${
          error.response?.data?.message ||
          error.message ||
          "Không thể lấy thống kê"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Test Data Generator Demo
      </h1>

      <div className="space-y-4">
        <button
          onClick={generateTestTutors}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Đang tạo..." : "Tạo 2 gia sư test"}
        </button>

        <button
          onClick={clearTestData}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 ml-4"
        >
          {loading ? "Đang xóa..." : "Xóa dữ liệu test"}
        </button>

        <button
          onClick={getStats}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 ml-4"
        >
          {loading ? "Đang tải..." : "Xem thống kê"}
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

export default TestDataDemo;
