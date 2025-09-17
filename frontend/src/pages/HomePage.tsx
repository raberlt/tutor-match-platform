import React from "react";
import { Link } from "react-router-dom";

export const HomePage: React.FC = () => {
  const subjects = [
    { name: "Tiếng Anh", icon: "🇬🇧" },
    { name: "Toán", icon: "📊" },
    { name: "Ngữ văn", icon: "📝" },
    { name: "IELTS", icon: "🎯" },
    { name: "Tiếng Trung", icon: "🇨🇳" },
    { name: "Tiếng Hàn", icon: "🇰🇷" },
    { name: "Hóa học", icon: "🧪" },
    { name: "Vật lý", icon: "⚡" },
    { name: "Luyện thi ĐGNL", icon: "🎓" },
  ];

  const testimonials = [
    {
      name: "Minh Giang",
      role: "Học sinh lớp 12 THPT Lương Thế Vinh",
      content:
        "Em đã học với cô trên TutorMatch và giải đích được kết quả 8.5 IELTS. Cô rất nhiệt tình và phương pháp dạy dễ hiểu. TutorMatch thực sự giúp em rất nhiều!",
      avatar: "👨‍🎓",
    },
    {
      name: "Đức Duy",
      role: "Gia sư IELTS",
      content:
        "Tôi đã sử dụng TutorMatch từ năm ngoái và thấy rất hài lòng. Nền tảng giúp tôi kết nối với nhiều học viên chất lượng và tăng thu nhập đáng kể.",
      avatar: "👨‍🏫",
    },
    {
      name: "Cô Yến",
      role: "Phụ huynh học sinh",
      content:
        "Tôi đã tìm được gia sư phù hợp cho con thông qua TutorMatch. Việc đặt lịch học rất thuận tiện và con học rất hiệu quả.",
      avatar: "👩‍💼",
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section - Dựa trên thiết kế từ hình ảnh */}
      <section className="bg-gradient-to-r from-blue-400 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/3 lg:pr-12">
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Học giỏi hơn với gia sư phù hợp nhất!
              </h1>

              {/* Search Form */}
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Môn học
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-700">
                      <option value="">Chọn môn học</option>
                      <option value="toan">Toán</option>
                      <option value="van">Ngữ văn</option>
                      <option value="anh">Tiếng Anh</option>
                      <option value="ly">Vật lý</option>
                      <option value="hoa">Hóa học</option>
                      <option value="sinh">Sinh học</option>
                      <option value="su">Lịch sử</option>
                      <option value="dia">Địa lý</option>
                      <option value="ielts">IELTS</option>
                      <option value="toeic">TOEIC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Học phí/buổi (100,000đ - 500,000đ)
                    </label>
                    <input
                      type="range"
                      min="100000"
                      max="500000"
                      step="50000"
                      defaultValue="300000"
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>100,000đ</span>
                      <span>500,000đ</span>
                    </div>
                  </div>
                </div>
                <Link
                  to="/tutors"
                  className="w-full bg-gray-800 text-white py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors flex items-center justify-center"
                >
                  Bắt đầu tìm gia sư →
                </Link>
              </div>
            </div>

            <div className="lg:w-2/3 mt-8 lg:mt-0">
              {/* Steps */}
              <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                <div className="flex items-center space-x-3 text-center">
                  <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-semibold">Tìm gia sư</p>
                    <p className="text-sm opacity-90">
                      Theo đúng ý bạn và đặt lịch học thử
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-center">
                  <div className="w-10 h-10 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-semibold">Thanh toán</p>
                    <p className="text-sm opacity-90">
                      An toàn và dễ dàng với mã QR
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-center">
                  <div className="w-10 h-10 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-semibold">Bắt đầu học</p>
                    <p className="text-sm opacity-90">
                      Gia sư đến tư gia hoặc học online qua ứng dụng
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Các môn học phổ biến
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {subjects.map((subject, index) => (
              <Link
                key={index}
                to={`/tutors?subject=${subject.name}`}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center group"
              >
                <div className="text-3xl mb-3">{subject.icon}</div>
                <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                  {subject.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Benefits */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-12">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                alt="Online learning"
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="lg:w-1/2 mt-8 lg:mt-0">
              <h2 className="text-3xl font-bold mb-6 text-gray-900">
                Học tập dễ dàng, tiến bộ nhanh chóng!
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                TutorMatch kết nối học viên với đội ngũ gia sư chuyên nghiệp
                trên khắp cả nước. Chúng tôi mang đến trải nghiệm học tập cá
                nhân hóa với lịch học linh hoạt, gia sư được kiểm duyệt kỹ lưỡng
                và phương pháp giảng dạy phù hợp với từng nhu cầu.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
              >
                Tìm hiểu thêm →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Đánh giá 5 sao tiêu biểu
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-3">{testimonial.avatar}</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">
                      ⭐
                    </span>
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {testimonial.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources & Blog */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Tài liệu và kiến thức
            </h2>
            <Link
              to="/resources"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Xem thêm
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                alt="Study tips"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <span className="text-xs text-blue-600 font-medium">
                  5 ngày trước • 2025-01-07 05:37:27 UTC
                </span>
                <h3 className="font-semibold text-gray-900 mt-2 mb-2">
                  5 địa chỉ tìm gia sư tốt 12 ở Luyện thi Đại học uy tín...
                </h3>
                <p className="text-gray-600 text-sm">
                  Hãy tìm gia sư tốt ở dạ quen thông gần gia đình. Cách chọng
                  gia sư kinh nghiệm tốt...
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                alt="Online learning"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <span className="text-xs text-blue-600 font-medium">
                  7 ngày trước • 2025-01-05 09:37:27 UTC
                </span>
                <h3 className="font-semibold text-gray-900 mt-2 mb-2">
                  Có nên thuê gia sư Toán online không? Ưu và nhược...
                </h3>
                <p className="text-gray-600 text-sm">
                  Học Toán online có nhiều ưu điểm như tiết kiệm chi phí, linh
                  hoạt thời gian...
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                alt="Group study"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <span className="text-xs text-blue-600 font-medium">
                  10 ngày trước • 2025-01-02 14:37:27 UTC
                </span>
                <h3 className="font-semibold text-gray-900 mt-2 mb-2">
                  5 địa chỉ tìm gia sư tốt 9 ở Luyện thi vào lớp 10 uy tín...
                </h3>
                <p className="text-gray-600 text-sm">
                  Ký năng thi vào 10 là một thời điểm quan trọng ảnh hưởng lớn
                  đến tương lai của học sinh...
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Bắt đầu hành trình học tập của bạn
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Tìm gia sư phù hợp hoặc trở thành gia sư để chia sẻ kiến thức và
            kiếm thêm thu nhập
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/find-tutor"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Tìm gia sư ngay
            </Link>
            <Link
              to="/become-tutor"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Trở thành gia sư
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
