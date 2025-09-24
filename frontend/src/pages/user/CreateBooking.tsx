import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { bookingService } from "../../services/bookingService";
import { TutorService } from "../../services/tutorService";
import type {
  BookingRequestCreateDTO,
  BookingSystemInfo,
  TutorPreviewProfile,
  TutorProfile,
  Subject,
  TutorSubjectDetail,
} from "../../types";

const CreateBooking: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [systemInfo, setSystemInfo] = useState<BookingSystemInfo | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingMode, setBookingMode] = useState<"single" | "package" | null>(
    null
  );

  // Get tutor info from navigation state
  const selectedTutor = location.state?.selectedTutor as
    | TutorPreviewProfile
    | TutorProfile
    | null;
  const selectedSubject = location.state?.selectedSubject as
    | Subject
    | TutorSubjectDetail
    | null;

  const [formData, setFormData] = useState<BookingRequestCreateDTO>({
    bookingType: "TRIAL",
    tutorId: selectedTutor?.id || 0,
    subjectId: selectedSubject?.id || 0,
    date: "",
    fromTime: "",
    toTime: "",
    note: "",
    sessionsPerWeek: 1,
    contractDuration: 1,
  });

  useEffect(() => {
    loadSystemInfo();
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedTutor) {
      setFormData((prev) => ({ ...prev, tutorId: selectedTutor.id }));
    }
    if (selectedSubject) {
      setFormData((prev) => ({ ...prev, subjectId: selectedSubject.id }));
    }
  }, [selectedTutor, selectedSubject]);

  const loadSystemInfo = async () => {
    try {
      const info = await bookingService.getBookingSystemInfo();
      setSystemInfo(info);
    } catch (error) {
      console.error("Error loading system info:", error);
    }
  };

  const loadSubjects = async () => {
    try {
      const subjectsData = await TutorService.getSubjects();
      setSubjects(subjectsData);
    } catch (error) {
      console.error("Error loading subjects:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "tutorId" ||
        name === "subjectId" ||
        name === "sessionsPerWeek" ||
        name === "contractDuration"
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await bookingService.createBooking(formData);
      navigate("/user/my-sessions");
    } catch (error: unknown) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingModeSelect = (mode: "single" | "package") => {
    setBookingMode(mode);
    if (mode === "single") {
      setFormData((prev) => ({ ...prev, bookingType: "SINGLE_SESSION" }));
    } else {
      setFormData((prev) => ({ ...prev, bookingType: "PACKAGE" }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Đặt Lịch Học
            </h1>

            {/* Selected Tutor Info */}
            {selectedTutor && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Gia sư đã chọn
                </h3>
                <div className="flex items-center space-x-4">
                  {selectedTutor.imageAvatar ? (
                    <img
                      src={selectedTutor.imageAvatar}
                      alt={`${selectedTutor.firstName} ${selectedTutor.lastName}`}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {selectedTutor.firstName.charAt(0)}
                        {selectedTutor.lastName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {selectedTutor.firstName} {selectedTutor.lastName}
                    </h4>
                    {selectedTutor.headline && (
                      <p className="text-sm text-gray-600">
                        {selectedTutor.headline}
                      </p>
                    )}
                    {selectedTutor.fees && (
                      <p className="text-sm text-blue-600 font-medium">
                        {selectedTutor.fees.toLocaleString("vi-VN")} VNĐ/buổi
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Booking Mode Selection */}
            {!bookingMode && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Chọn loại đặt lịch
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Single Session Option */}
                  <div
                    className="border-2 border-gray-200 rounded-xl p-6 cursor-pointer hover:border-blue-300 hover:shadow-lg transition-all duration-200"
                    onClick={() => handleBookingModeSelect("single")}
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-blue-600"
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Đặt lẻ
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Đặt lịch học một buổi đơn lẻ, linh hoạt theo nhu cầu
                      </p>
                      <div className="text-sm text-gray-500">
                        <p>• Đặt lịch nhanh chóng</p>
                        <p>• Thanh toán từng buổi</p>
                        <p>• Linh hoạt thời gian</p>
                      </div>
                    </div>
                  </div>

                  {/* Package Option */}
                  <div
                    className="border-2 border-gray-200 rounded-xl p-6 cursor-pointer hover:border-green-300 hover:shadow-lg transition-all duration-200"
                    onClick={() => handleBookingModeSelect("package")}
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Đặt theo gói
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Đặt lịch học theo gói có hợp đồng, tiết kiệm chi phí
                      </p>
                      <div className="text-sm text-gray-500">
                        <p>• Giá ưu đãi theo gói</p>
                        <p>• Lịch học cố định</p>
                        <p>• Cam kết dài hạn</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Booking Form */}
            {bookingMode && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Back Button */}
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => setBookingMode(null)}
                    className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Quay lại chọn loại đặt lịch
                  </button>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Môn học *
                  </label>
                  <select
                    name="subjectId"
                    value={formData.subjectId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Chọn môn học</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ngày học */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày học *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                {/* Thời gian */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Từ giờ *
                    </label>
                    <input
                      type="time"
                      name="fromTime"
                      value={formData.fromTime}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Đến giờ *
                    </label>
                    <input
                      type="time"
                      name="toTime"
                      value={formData.toTime}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Package-specific fields */}
                {bookingMode === "package" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số buổi/tuần *
                        </label>
                        <input
                          type="number"
                          name="sessionsPerWeek"
                          value={formData.sessionsPerWeek}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                          min="1"
                          max="7"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Thời gian hợp đồng (tháng) *
                        </label>
                        <input
                          type="number"
                          name="contractDuration"
                          value={formData.contractDuration}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                          min="1"
                          max="12"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Ghi chú */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập ghi chú cho buổi học..."
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate("/user/my-sessions")}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Đang tạo..." : "Tạo Booking"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBooking;
