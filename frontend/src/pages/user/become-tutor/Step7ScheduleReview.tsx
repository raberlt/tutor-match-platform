import React from "react";

type TimeSlot = { start: string; end: string };

interface Props {
  dayTimeSlots: Record<string, TimeSlot[]>;
  setFormData: React.Dispatch<
    React.SetStateAction<{
      [key: string]: any;
    }>
  >;
  summary: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    province: string;
    subjects: Array<{ name: string; hourlyRate: string }>;
    headline: string;
    bio: string;
    teachingAudiences: string[];
  };
}

const days: string[] = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ nhật",
];

function getKeyByIndex(index: number): string {
  // Map to stable english keys used in formData.dayTimeSlots
  const map = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];
  return map[index] || "MONDAY";
}

export const Step7ScheduleReview: React.FC<Props> = ({
  dayTimeSlots,
  setFormData,
  summary,
}) => {
  const addSlot = (dayKey: string) => {
    setFormData((prev) => {
      const prevSlots = (prev.dayTimeSlots?.[dayKey] as TimeSlot[]) || [];
      const nextSlots = [...prevSlots, { start: "08:00", end: "09:00" }];
      return {
        ...prev,
        dayTimeSlots: { ...prev.dayTimeSlots, [dayKey]: nextSlots },
      };
    });
  };

  const updateSlot = (
    dayKey: string,
    index: number,
    field: keyof TimeSlot,
    value: string
  ) => {
    setFormData((prev) => {
      const prevSlots = (prev.dayTimeSlots?.[dayKey] as TimeSlot[]) || [];
      const nextSlots = [...prevSlots];
      nextSlots[index] = { ...nextSlots[index], [field]: value } as TimeSlot;
      return {
        ...prev,
        dayTimeSlots: { ...prev.dayTimeSlots, [dayKey]: nextSlots },
      };
    });
  };

  const removeSlot = (dayKey: string, index: number) => {
    setFormData((prev) => {
      const prevSlots = (prev.dayTimeSlots?.[dayKey] as TimeSlot[]) || [];
      const nextSlots = prevSlots.filter((_, i) => i !== index);
      return {
        ...prev,
        dayTimeSlots: { ...prev.dayTimeSlots, [dayKey]: nextSlots },
      };
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-3">Thiết lập lịch dạy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {days.map((dayLabel, idx) => {
            const key = getKeyByIndex(idx);
            const slots: TimeSlot[] = (dayTimeSlots?.[key] as TimeSlot[]) || [];
            return (
              <div key={key} className="border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-800">{dayLabel}</span>
                  <button
                    type="button"
                    onClick={() => addSlot(key)}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
                  >
                    + Thêm khung giờ
                  </button>
                </div>
                {slots.length === 0 && (
                  <p className="text-sm text-gray-500">Chưa có khung giờ</p>
                )}
                <div className="space-y-2">
                  {slots.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={s.start}
                        onChange={(e) =>
                          updateSlot(key, i, "start", e.target.value)
                        }
                        className="px-2 py-1 border border-gray-300 rounded-lg"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="time"
                        value={s.end}
                        onChange={(e) =>
                          updateSlot(key, i, "end", e.target.value)
                        }
                        className="px-2 py-1 border border-gray-300 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeSlot(key, i)}
                        className="px-2 py-1 text-xs rounded-lg border border-red-300 text-red-700 hover:bg-red-50"
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Xem lại thông tin</h3>
        <div className="bg-white border rounded-xl p-4 space-y-2">
          <p className="text-sm">
            <span className="font-medium">Họ tên:</span> {summary.firstName}{" "}
            {summary.lastName}
          </p>
          <p className="text-sm">
            <span className="font-medium">Email:</span> {summary.email} —{" "}
            <span className="font-medium">SĐT:</span> {summary.phone}
          </p>
          <p className="text-sm">
            <span className="font-medium">Tỉnh/TP:</span> {summary.province}
          </p>
          <p className="text-sm">
            <span className="font-medium">Tiêu đề:</span> {summary.headline}
          </p>
          <p className="text-sm">
            <span className="font-medium">Giới thiệu:</span> {summary.bio}
          </p>
          <p className="text-sm">
            <span className="font-medium">Đối tượng:</span>{" "}
            {summary.teachingAudiences.join(", ") || "(chưa chọn)"}
          </p>
          <div>
            <span className="text-sm font-medium">Môn học & học phí:</span>
            <ul className="list-disc list-inside text-sm text-gray-700">
              {summary.subjects.length > 0 ? (
                summary.subjects.map((s, i) => (
                  <li key={i}>
                    {s.name} —{" "}
                    {s.hourlyRate ? `${s.hourlyRate} đ/giờ` : "(chưa đặt)"}
                  </li>
                ))
              ) : (
                <li>(chưa chọn)</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step7ScheduleReview;




