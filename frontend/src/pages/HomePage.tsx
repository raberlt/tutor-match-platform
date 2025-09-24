import React, { useState } from "react";
import { Link } from "react-router-dom";

export const HomePage: React.FC = () => {
  // Filter state
  const [selectedSubject, setSelectedSubject] = useState("");
  const [minFee, setMinFee] = useState(100000);
  const [maxFee, setMaxFee] = useState(500000);
  const [showPriceSlider, setShowPriceSlider] = useState(false);

  // Format price function
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

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
      {/* Hero Section - Bố cục 2/5 trái, 3/5 phải */}
      <section
        className="text-black py-20"
        style={{ backgroundColor: "#94cce6" }}
      >
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex items-center gap-8">
            {/* Bên trái - 2/5 màn hình */}
            <div className="w-2/5">
              {/* Title */}
              <div className="mb-8">
                <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-8">
                  Học giỏi hơn với
                  <br />
                  gia sư phù hợp nhất!
                </h1>
              </div>

              {/* Filter Form */}
              <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <div className="space-y-4">
                  {/* Subject & Price Filter - Same Row */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Subject Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Môn học
                      </label>
                      <div className="relative">
                        <select
                          value={selectedSubject}
                          onChange={(e) => setSelectedSubject(e.target.value)}
                          className="w-full px-3 py-3 pr-8 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#94cce6] focus:border-transparent appearance-none bg-white text-gray-700"
                        >
                          <option value="">Chọn môn học</option>
                          {subjects.map((subject) => (
                            <option key={subject.name} value={subject.name}>
                              {subject.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Price Range Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Học phí/buổi
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowPriceSlider(!showPriceSlider)}
                          className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#94cce6] focus:border-transparent bg-white text-left flex items-center justify-between text-gray-700"
                        >
                          <span className="text-sm whitespace-nowrap">
                            {formatPrice(minFee)} - {formatPrice(maxFee)}
                          </span>
                          <svg
                            className={`w-4 h-4 text-gray-400 transition-transform ${
                              showPriceSlider ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>

                        {/* Dropdown Content */}
                        {showPriceSlider && (
                          <div className="absolute top-full left-0 right-0 z-20 mt-2 bg-white border border-gray-300 rounded-xl shadow-xl p-4 min-w-[300px]">
                            <div className="space-y-4">
                              <div className="text-center">
                                <span className="text-lg font-semibold text-gray-700 whitespace-nowrap">
                                  {formatPrice(minFee)} - {formatPrice(maxFee)}
                                </span>
                              </div>

                              <div className="relative px-2">
                                <div className="dual-range-track">
                                  <div
                                    className="dual-range-progress"
                                    style={{
                                      left: `${
                                        ((minFee - 100000) /
                                          (1000000 - 100000)) *
                                        100
                                      }%`,
                                      width: `${
                                        ((maxFee - minFee) /
                                          (1000000 - 100000)) *
                                        100
                                      }%`,
                                    }}
                                  />
                                </div>

                                <div className="relative">
                                  <input
                                    type="range"
                                    min="100000"
                                    max="1000000"
                                    step="50000"
                                    value={minFee}
                                    onChange={(e) => {
                                      const value = parseInt(e.target.value);
                                      if (value < maxFee) {
                                        setMinFee(value);
                                      } else {
                                        setMinFee(value);
                                        setMaxFee(value + 50000);
                                      }
                                    }}
                                    className="absolute w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer slider min-slider z-20"
                                    style={{ background: "transparent" }}
                                  />
                                  <input
                                    type="range"
                                    min="100000"
                                    max="1000000"
                                    step="50000"
                                    value={maxFee}
                                    onChange={(e) => {
                                      const value = parseInt(e.target.value);
                                      if (value > minFee) {
                                        setMaxFee(value);
                                      } else {
                                        setMaxFee(value);
                                        setMinFee(
                                          Math.max(100000, value - 50000)
                                        );
                                      }
                                    }}
                                    className="absolute w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer slider max-slider z-10"
                                    style={{ background: "transparent" }}
                                  />
                                </div>

                                <div className="flex justify-between text-xs text-gray-500 mt-4">
                                  <span>100K</span>
                                  <span>300K</span>
                                  <span>500K</span>
                                  <span>750K</span>
                                  <span>1M+</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Search Button */}
                  <Link
                    to={`/find-tutor?subject=${selectedSubject}&minFee=${minFee}&maxFee=${maxFee}`}
                    className="w-full bg-black text-white py-3 px-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center text-lg"
                  >
                    Bắt đầu tìm gia sư →
                  </Link>
                </div>
              </div>
            </div>

            {/* Bên phải - 3/5 màn hình với hình ảnh */}
            <div className="w-3/5">
              <div className="flex items-center justify-center">
                <img
                  src="/images/3step.webp"
                  alt="3 bước tìm gia sư"
                  className="max-w-full h-auto rounded-2xl"
                  onError={(e) => {
                    // Fallback nếu không có ảnh
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = "block";
                  }}
                />
                {/* Fallback content khi chưa có ảnh */}
                <div className="hidden bg-white/20 rounded-2xl p-8 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-bold mb-4">3 Bước Đơn Giản</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs mr-3">
                          1
                        </span>
                        <span>Tìm gia sư theo đúng ý bạn</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs mr-3">
                          2
                        </span>
                        <span>Thanh toán an toàn với QR</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs mr-3">
                          3
                        </span>
                        <span>Bắt đầu học ngay</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects Grid */}
      <section
        className="py-16 shadow-lg"
        style={{ backgroundColor: "hsl(240deg 22.22% 96.47%)" }}
      >
        <div className="container mx-auto px-4">
          {/* <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Các môn học phổ biến
            </h2>
            <p className="text-xl text-gray-600">
              Tìm gia sư cho môn học bạn quan tâm
            </p>
          </div> */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {subjects.map((subject) => (
              <Link
                key={subject.name}
                to={`/find-tutor?subject=${subject.name}`}
                className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-[#94cce6] hover:scale-105"
              >
                <div className="text-4xl mb-3">{subject.icon}</div>
                <h3 className="font-medium text-gray-900">{subject.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Benefits Section */}
      <section className="py-16 shadow-lg" style={{ backgroundColor: "white" }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-12 mb-8 lg:mb-0">
              <div className="w-full h-96 rounded-2xl overflow-hidden">
                <img
                  src="/images/speedlearn.webp"
                  alt="Học tập hiệu quả"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback nếu không có ảnh
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
                {/* Fallback content khi chưa có ảnh */}
                <div
                  className="hidden w-full h-full rounded-2xl items-center justify-center"
                  style={{ backgroundColor: "#94cce6" }}
                >
                  <div className="text-center">
                    <div className="text-8xl mb-4">👩‍🎓</div>
                    <p className="text-lg text-gray-600">Học tập hiệu quả</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Học tập dễ dàng, tiến bộ nhanh chóng!
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                TutorMatch kết nối học viên với đội ngũ gia sư chuyên nghiệp
                trên khắp cả nước. Chúng tôi mang đến trải nghiệm học tập cá
                nhân hóa với lịch học linh hoạt, gia sư được kiểm duyệt kỹ lưỡng
                và phương pháp giảng dạy phù hợp với từng nhu cầu.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center mr-3"
                    style={{ backgroundColor: "#94cce6" }}
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-700">
                    Gia sư được kiểm duyệt kỹ lưỡng
                  </span>
                </div>
                <div className="flex items-center">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center mr-3"
                    style={{ backgroundColor: "#94cce6" }}
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-700">
                    Lịch học linh hoạt theo nhu cầu
                  </span>
                </div>
                <div className="flex items-center">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center mr-3"
                    style={{ backgroundColor: "#94cce6" }}
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-700">
                    Phương pháp giảng dạy cá nhân hóa
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        className="py-16 shadow-lg"
        style={{ backgroundColor: "hsl(240deg 22.22% 96.47%)" }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Mọi người nói gì về TutorMatch
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center mb-4">
                  <div className="text-4xl mr-4">{testimonial.avatar}</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700">{testimonial.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources & Blog Section */}
      <section className="py-16 shadow-lg" style={{ backgroundColor: "white" }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Tài liệu và kiến thức
            </h2>
            <p className="text-xl text-gray-600">
              Cập nhật kiến thức và phương pháp học tập hiệu quả
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              className="rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
              style={{ backgroundColor: "hsl(240deg 22.22% 96.47%)" }}
            >
              <div className="w-full h-48 rounded-lg mb-4 overflow-hidden">
                <img
                  src="/images/phuongphap.webp"
                  alt="Phương pháp học hiệu quả"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback nếu không có ảnh
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
                <div className="hidden w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg items-center justify-center">
                  <span className="text-4xl">📚</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Phương pháp học hiệu quả
              </h3>
              <p className="text-gray-600 mb-4">
                Khám phá các phương pháp học tập được chứng minh hiệu quả để
                nâng cao kết quả học tập.
              </p>
              <a
                href="#"
                className="font-medium hover:opacity-80"
                style={{ color: "#94cce6" }}
              >
                Đọc thêm →
              </a>
            </div>
            <div
              className="rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
              style={{ backgroundColor: "hsl(240deg 22.22% 96.47%)" }}
            >
              <div className="w-full h-48 rounded-lg mb-4 overflow-hidden">
                <img
                  src="/images/tip.jpg"
                  alt="Tips từ gia sư giỏi"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback nếu không có ảnh
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
                <div className="hidden w-full h-full bg-gradient-to-br from-green-100 to-green-200 rounded-lg items-center justify-center">
                  <span className="text-4xl">💡</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Tips từ gia sư giỏi
              </h3>
              <p className="text-gray-600 mb-4">
                Những bí quyết và kinh nghiệm quý báu từ các gia sư hàng đầu
                trên TutorMatch.
              </p>
              <a
                href="#"
                className="font-medium hover:opacity-80"
                style={{ color: "#94cce6" }}
              >
                Đọc thêm →
              </a>
            </div>
            <div
              className="rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
              style={{ backgroundColor: "hsl(240deg 22.22% 96.47%)" }}
            >
              <div className="w-full h-48 rounded-lg mb-4 overflow-hidden">
                <img
                  src="/images/lotrinh.jpg"
                  alt="Lộ trình học tập"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback nếu không có ảnh
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
                <div className="hidden w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg items-center justify-center">
                  <span className="text-4xl">🎯</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Lộ trình học tập
              </h3>
              <p className="text-gray-600 mb-4">
                Xây dựng lộ trình học tập cá nhân hóa phù hợp với mục tiêu và
                năng lực của bạn.
              </p>
              <a
                href="#"
                className="font-medium hover:opacity-80"
                style={{ color: "#94cce6" }}
              >
                Đọc thêm →
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
