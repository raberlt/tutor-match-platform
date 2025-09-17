import React, { useState } from "react";

interface ScheduleEvent {
  id: string;
  studentName: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "online" | "offline";
  status: "scheduled" | "completed" | "cancelled";
  location?: string;
  notes?: string;
  price: number;
}

export const Schedule: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("week");
  
  const [events] = useState<ScheduleEvent[]>([
    {
      id: "1",
      studentName: "Nguyễn Minh An",
      subject: "Tiếng Anh",
      date: "2025-01-15",
      startTime: "19:00",
      endTime: "20:30",
      type: "online",
      status: "scheduled",
      notes: "Ôn tập grammar: Present Perfect",
      price: 300000,
    },
    {
      id: "2",
      studentName: "Trần Thị Bình",
      subject: "IELTS",
      date: "2025-01-16",
      startTime: "16:00",
      endTime: "17:30",
      type: "offline",
      status: "scheduled",
      location: "123 Nguyễn Huệ, Q.1",
      price: 400000,
    },
    {
      id: "3",
      studentName: "Lê Văn Cường",
      subject: "Tiếng Anh",
      date: "2025-01-17",
      startTime: "18:30",
      endTime: "20:00",
      type: "online",
      status: "scheduled",
      price: 300000,
    },
    {
      id: "4",
      studentName: "Phạm Thị Dung",
      subject: "IELTS Speaking",
      date: "2025-01-12",
      startTime: "14:00",
      endTime: "15:30",
      type: "online",
      status: "completed",
      price: 350000,
    },
  ]);

  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const getDaysInWeek = (date: Date) => {
    const week = [];
    const startDate = new Date(date);
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    startDate.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };

  const formatTime = (time: string) => {
    return time;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7));
    setCurrentDate(newDate);
  };

  const weekDays = getDaysInWeek(currentDate);

  const handleEventClick = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const timeSlots = Array.from({ length: 15 }, (_, i) => {
    const hour = 6 + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Lịch dạy của tôi</h1>
        <div className="flex space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {["week", "month", "day"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`px-3 py-1 text-sm rounded-md ${
                  viewMode === mode
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {mode === "week" ? "Tuần" : mode === "month" ? "Tháng" : "Ngày"}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Thêm lịch
          </button>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateWeek("prev")}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              ←
            </button>
            <h2 className="text-lg font-semibold">
              {weekDays[0].toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => navigateWeek("next")}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              →
            </button>
          </div>
          
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Hôm nay
          </button>
        </div>

        {/* Week View */}
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Day Headers */}
            <div className="grid grid-cols-8 border-b bg-gray-50">
              <div className="p-3 text-center text-sm font-medium text-gray-500">Giờ</div>
              {weekDays.map((day, index) => (
                <div key={index} className="p-3 text-center border-l">
                  <div className="text-sm font-medium text-gray-900">
                    {day.toLocaleDateString('vi-VN', { weekday: 'short' })}
                  </div>
                  <div className={`text-lg ${
                    day.toDateString() === new Date().toDateString()
                      ? "text-blue-600 font-bold"
                      : "text-gray-900"
                  }`}>
                    {day.getDate()}
                  </div>
                </div>
              ))}
            </div>

            {/* Time Slots */}
            <div className="grid grid-cols-8">
              {timeSlots.map((time, timeIndex) => (
                <React.Fragment key={timeIndex}>
                  <div className="p-2 text-center text-sm text-gray-500 border-b border-r bg-gray-50">
                    {time}
                  </div>
                  {weekDays.map((day, dayIndex) => {
                    const dayEvents = getEventsForDate(day);
                    const eventsAtTime = dayEvents.filter(event => 
                      event.startTime.startsWith(time.split(':')[0])
                    );

                    return (
                      <div key={dayIndex} className="p-1 border-b border-l min-h-[60px] relative">
                        {eventsAtTime.map((event) => (
                          <div
                            key={event.id}
                            onClick={() => handleEventClick(event)}
                            className={`absolute inset-x-1 top-1 p-2 rounded text-xs cursor-pointer hover:shadow-md transition-shadow ${
                              event.type === "online" ? "bg-blue-100 border-l-4 border-blue-500" : "bg-orange-100 border-l-4 border-orange-500"
                            }`}
                            style={{
                              height: `${Math.max(40, (parseInt(event.endTime.split(':')[0]) - parseInt(event.startTime.split(':')[0])) * 60)}px`
                            }}
                          >
                            <div className="font-medium text-gray-900 truncate">
                              {event.studentName}
                            </div>
                            <div className="text-gray-600 truncate">
                              {event.subject}
                            </div>
                            <div className="text-gray-500">
                              {formatTime(event.startTime)}-{formatTime(event.endTime)}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Buổi học tuần này</h3>
        </div>
        <div className="divide-y">
          {events
            .filter(event => {
              const eventDate = new Date(event.date);
              const weekStart = weekDays[0];
              const weekEnd = weekDays[6];
              return eventDate >= weekStart && eventDate <= weekEnd;
            })
            .map((event) => (
              <div key={event.id} className="p-4 hover:bg-gray-50 cursor-pointer"
                   onClick={() => handleEventClick(event)}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-900">
                        {event.subject} - {event.studentName}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {event.status === "scheduled" ? "Đã lên lịch" : 
                         event.status === "completed" ? "Hoàn thành" : "Đã hủy"}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        event.type === "online" ? "bg-blue-100 text-blue-800" : "bg-orange-100 text-orange-800"
                      }`}>
                        {event.type === "online" ? "Online" : "Tại nhà"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>📅 {new Date(event.date).toLocaleDateString('vi-VN')}</span>
                      <span>🕐 {formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                      <span className="text-green-600 font-medium">{formatPrice(event.price)}</span>
                    </div>
                    {event.notes && (
                      <p className="text-sm text-gray-600 mt-1">📝 {event.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Chi tiết buổi học</h3>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Học viên</label>
                  <p className="text-gray-900">{selectedEvent.studentName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Môn học</label>
                  <p className="text-gray-900">{selectedEvent.subject}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ngày</label>
                    <p className="text-gray-900">{new Date(selectedEvent.date).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Thời gian</label>
                    <p className="text-gray-900">{selectedEvent.startTime} - {selectedEvent.endTime}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hình thức</label>
                  <p className="text-gray-900">
                    {selectedEvent.type === "online" ? "🌐 Online" : "🏠 Tại nhà"}
                  </p>
                </div>
                
                {selectedEvent.location && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Địa điểm</label>
                    <p className="text-gray-900">{selectedEvent.location}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Học phí</label>
                  <p className="text-gray-900 font-medium text-green-600">{formatPrice(selectedEvent.price)}</p>
                </div>
                
                {selectedEvent.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
                    <p className="text-gray-900">{selectedEvent.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Đóng
                </button>
                {selectedEvent.status === "scheduled" && (
                  <>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700">
                      Chỉnh sửa
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
                      Bắt đầu học
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Thêm buổi học mới</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Học viên</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                    <option>Chọn học viên</option>
                    <option>Nguyễn Minh An</option>
                    <option>Trần Thị Bình</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Môn học</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Ví dụ: Tiếng Anh, IELTS..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ngày</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian</label>
                    <div className="flex space-x-2">
                      <input
                        type="time"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                      <span className="flex items-center">-</span>
                      <input
                        type="time"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hình thức</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                    <option value="online">Online</option>
                    <option value="offline">Tại nhà</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    rows={3}
                    placeholder="Nội dung bài học, chủ đề..."
                  />
                </div>
              </form>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    alert("Thêm lịch học thành công!");
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Thêm lịch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
