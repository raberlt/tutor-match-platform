import React, { useState } from "react";
import api from "../../services/api";

interface TutorData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  gender: "MALE" | "FEMALE";
  dateOfBirth: string;
  educationLevel: string;
  headline: string;
  bio: string;
  experience: string;
  subjects: string[];
  hourlyRates: { [key: string]: number };
}

const TestDataGenerator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [count, setCount] = useState(10);

  // Mock data templates
  const firstNames = [
    "Nguyễn",
    "Trần",
    "Lê",
    "Phạm",
    "Hoàng",
    "Phan",
    "Vũ",
    "Võ",
    "Đặng",
    "Bùi",
    "Đỗ",
    "Hồ",
    "Ngô",
    "Dương",
    "Lý",
    "Đinh",
    "Đào",
    "Mai",
    "Cao",
    "Lưu",
  ];

  const lastNames = [
    "Minh",
    "Văn",
    "Thị",
    "Hữu",
    "Đức",
    "Quang",
    "Tuấn",
    "Hùng",
    "Duy",
    "Nam",
    "Anh",
    "Linh",
    "Hương",
    "Mai",
    "Lan",
    "Hoa",
    "Thảo",
    "Nga",
    "Yến",
    "Trang",
  ];

  const subjects = [
    "Toán học",
    "Vật lý",
    "Hóa học",
    "Sinh học",
    "Ngữ văn",
    "Lịch sử",
    "Địa lý",
    "Tiếng Anh",
    "Tiếng Trung",
    "Tiếng Hàn",
    "Tiếng Nhật",
    "Tin học",
    "GDCD",
    "IELTS",
    "TOEIC",
    "Luyện thi ĐGNL",
    "Luyện thi THPT Quốc gia",
  ];

  const cities = [
    "Hà Nội",
    "TP. Hồ Chí Minh",
    "Đà Nẵng",
    "Hải Phòng",
    "Cần Thơ",
    "Huế",
    "Nha Trang",
    "Vũng Tàu",
    "Quy Nhon",
    "Thái Nguyên",
    "Nam Định",
    "Thanh Hóa",
  ];

  const educationLevels = [
    "INDEPENDENT_LEARNER",
    "ELEMENTARY",
    "MIDDLE_SCHOOL",
    "HIGH_SCHOOL",
    "COLLEGE_UNIVERSITY",
  ];

  const headlines = [
    "Gia sư Toán - Lý chuyên nghiệp",
    "Chuyên gia tiếng Anh IELTS",
    "Gia sư Hóa học với 5 năm kinh nghiệm",
    "Thạc sĩ Ngữ văn - Phương pháp giảng dạy hiện đại",
    "Gia sư Tin học - Lập trình cho trẻ em",
    "Chuyên gia luyện thi ĐGNL",
    "Gia sư Sinh học - Phương pháp học tập hiệu quả",
    "Thạc sĩ Lịch sử - Giúp học sinh yêu thích môn học",
    "Gia sư Địa lý - Kết nối kiến thức với thực tế",
    "Chuyên gia tiếng Trung HSK",
  ];

  const bios = [
    "Tôi là gia sư có kinh nghiệm 5 năm dạy học. Tôi yêu thích việc giảng dạy và luôn tìm cách giúp học sinh hiểu bài một cách dễ dàng nhất.",
    "Với bằng thạc sĩ và kinh nghiệm giảng dạy tại các trường đại học, tôi cam kết mang đến chất lượng học tập tốt nhất cho học sinh.",
    "Tôi đã giúp nhiều học sinh đạt điểm cao trong các kỳ thi quan trọng. Phương pháp dạy của tôi tập trung vào việc phát triển tư duy logic.",
    "Là một giáo viên trẻ, năng động, tôi luôn cập nhật những phương pháp giảng dạy mới nhất để học sinh có trải nghiệm học tập tốt nhất.",
    "Với kinh nghiệm làm việc tại các trung tâm ngoại ngữ lớn, tôi tự tin có thể giúp học sinh cải thiện khả năng ngôn ngữ một cách hiệu quả.",
  ];

  const experiences = [
    "5 năm kinh nghiệm giảng dạy tại các trường THPT",
    "Thạc sĩ chuyên ngành, từng làm việc tại các trung tâm giáo dục lớn",
    "3 năm kinh nghiệm gia sư, đã giúp hơn 100 học sinh đạt kết quả tốt",
    "Tốt nghiệp loại giỏi, có chứng chỉ sư phạm và kinh nghiệm thực tế",
    "Chuyên gia trong lĩnh vực luyện thi, có nhiều học sinh đạt điểm cao",
  ];

  const generateRandomTutor = (index: number): TutorData => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const email = `${firstName.toLowerCase()}${lastName.toLowerCase()}${index}@test.com`;

    // Random subjects (1-3 subjects)
    const numSubjects = Math.floor(Math.random() * 3) + 1;
    const selectedSubjects = subjects
      .sort(() => 0.5 - Math.random())
      .slice(0, numSubjects);

    // Generate hourly rates for each subject
    const hourlyRates: { [key: string]: number } = {};
    selectedSubjects.forEach((subject) => {
      hourlyRates[subject] = Math.floor(Math.random() * 200000) + 100000; // 100k-300k
    });

    return {
      firstName,
      lastName,
      email,
      password: "123456", // Default password
      phoneNumber: `0${Math.floor(Math.random() * 900000000) + 100000000}`,
      address: cities[Math.floor(Math.random() * cities.length)],
      gender: Math.random() > 0.5 ? "MALE" : "FEMALE",
      dateOfBirth: `199${Math.floor(Math.random() * 10)}-${String(
        Math.floor(Math.random() * 12) + 1
      ).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(
        2,
        "0"
      )}`,
      educationLevel:
        educationLevels[Math.floor(Math.random() * educationLevels.length)],
      headline: headlines[Math.floor(Math.random() * headlines.length)],
      bio: bios[Math.floor(Math.random() * bios.length)],
      experience: experiences[Math.floor(Math.random() * experiences.length)],
      subjects: selectedSubjects,
      hourlyRates,
    };
  };

  const generateTutors = async () => {
    setLoading(true);
    setResult("");

    try {
      const tutors: TutorData[] = [];
      for (let i = 1; i <= count; i++) {
        tutors.push(generateRandomTutor(i));
      }

      // Send to backend API
      const response = await api.post("/admin/test/generate-tutors", {
        tutors,
        count,
      });

      setResult(
        `✅ Đã tạo thành công ${
          response.data.createdCount
        }/${count} gia sư test!\n\nChi tiết:\n${JSON.stringify(
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
          "Không thể tạo gia sư test"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const previewTutors = () => {
    const tutors: TutorData[] = [];
    for (let i = 1; i <= Math.min(count, 3); i++) {
      tutors.push(generateRandomTutor(i));
    }

    setResult(
      `📋 Preview ${Math.min(count, 3)} gia sư sẽ được tạo:\n\n${JSON.stringify(
        tutors,
        null,
        2
      )}`
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Test Data Generator
        </h1>
        <p className="text-sm text-gray-600">Tạo dữ liệu test cho hệ thống</p>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số lượng gia sư cần tạo
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 10)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={previewTutors}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Preview
            </button>

            <button
              onClick={generateTutors}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Đang tạo..." : `Tạo ${count} gia sư`}
            </button>
          </div>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Kết quả</h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
            {result}
          </pre>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 mt-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Thông tin</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • Mỗi gia sư sẽ có thông tin ngẫu nhiên: tên, email, số điện thoại,
            địa chỉ
          </li>
          <li>
            • Mỗi gia sư sẽ có 1-3 môn học ngẫu nhiên với mức phí 100k-300k/buổi
          </li>
          <li>• Tất cả gia sư sẽ có role "TUTOR" và trạng thái "ACTIVE"</li>
          <li>• Email sẽ có format: firstNameLastName{count}@test.com</li>
          <li>• Mật khẩu mặc định: 123456</li>
        </ul>
      </div>
    </div>
  );
};

export default TestDataGenerator;
