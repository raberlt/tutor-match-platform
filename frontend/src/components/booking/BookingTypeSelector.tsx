import React from "react";

interface BookingTypeSelectorProps {
  bookingType: "single" | "package";
  onBookingTypeChange: (type: "single" | "package") => void;
}

const BookingTypeSelector: React.FC<BookingTypeSelectorProps> = ({
  bookingType,
  onBookingTypeChange,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="grid grid-cols-2 gap-4">
        <button 
          type="button"
          onClick={() => onBookingTypeChange("single")}
          className={`p-4 border-2 rounded-lg text-center ${
            bookingType === "single"
              ? "border-sky-400 bg-sky-100 text-sky-700"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <h3 className="font-semibold mb-2">Đặt lịch đơn</h3>
          <p className="text-sm text-gray-600">Đặt một buổi học đơn lẻ</p>
        </button>
        <button
          type="button"
          onClick={() => onBookingTypeChange("package")}
          className={`p-4 border-2 rounded-lg text-center ${
            bookingType === "package"
              ? "border-sky-400 bg-sky-100 text-sky-700"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <h3 className="font-semibold mb-2">Đặt theo gói</h3>
          <p className="text-sm text-gray-600">
            Đặt nhiều buổi học với giá ưu đãi
          </p>
        </button>
      </div>
    </div>
  );
};

export default BookingTypeSelector;
