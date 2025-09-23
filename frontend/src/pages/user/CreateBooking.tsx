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

  const isPackageBooking = formData.bookingType === "PACKAGE";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Đặt Lịch Học
            </h1>

            {systemInfo && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  {systemInfo.systemName} v{systemInfo.version}
                </h3>
                <div className="text-sm text-blue-700">
                  <p className="mb-2">Tính năng:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {systemInfo.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

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

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Loại Booking */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại Booking *
                </label>
                <select
                  name="bookingType"
                  value={formData.bookingType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="TRIAL">Học thử</option>
                  <option value="SINGLE_SESSION">Học buổi đơn</option>
                  <option value="PACKAGE">Học theo gói</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  {formData.bookingType === "TRIAL" &&
                    "Buổi học thử miễn phí hoặc có phí thấp"}
                  {formData.bookingType === "SINGLE_SESSION" &&
                    "Đặt lịch học một buổi đơn lẻ"}
                  {formData.bookingType === "PACKAGE" &&
                    "Đặt lịch học theo gói có hợp đồng"}
                </p>
              </div>

              {/* Tutor ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Giảng viên *
                </label>
                <input
                  type="number"
                  name="tutorId"
                  value={formData.tutorId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="1"
                />
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

              {/* Chỉ hiển thị cho PACKAGE */}
              {isPackageBooking && (
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBooking;
