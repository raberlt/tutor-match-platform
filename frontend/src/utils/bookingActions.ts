/**
 * Logic xác định hành động có thể thực hiện với booking
 * Dựa trên trạng thái booking, thời gian và payment status
 */

export interface BookingActionConfig {
  // Nút cơ bản
  showPayment: boolean;
  showMessage: boolean;
  showViewDetail: boolean;

  // Nút quản lý lịch học
  showBookNew: boolean;
  showReschedule: boolean;
  showCancel: boolean;

  // Nút sau hoàn thành
  showRating: boolean;
  showTip: boolean;
  showRequestRefund: boolean;

  // Nút hoàn tiền
  showRefund: boolean;

  // Trạng thái disable
  rescheduleDisabled: boolean;
  cancelDisabled: boolean;
  refundDisabled: boolean;

  // Messages cho user
  rescheduleMessage?: string;
  cancelMessage?: string;
  refundMessage?: string;
}

/**
 * Tính toán số giờ còn lại đến buổi học
 */
export const getHoursUntilSession = (
  sessionDate: string,
  sessionTime: string
): number => {
  // Validate inputs
  if (!sessionDate || !sessionTime) {
    console.warn("Invalid session date or time:", { sessionDate, sessionTime });
    return 0;
  }

  try {
    const [startTime] = sessionTime.split("-");
    if (!startTime) {
      console.warn("Invalid session time format:", sessionTime);
      return 0;
    }

    const sessionDateTime = new Date(`${sessionDate}T${startTime}:00`);
    const now = new Date();
    const diffMs = sessionDateTime.getTime() - now.getTime();
    return diffMs / (1000 * 60 * 60); // Convert to hours
  } catch (error) {
    console.error("Error calculating hours until session:", error);
    return 0;
  }
};

/**
 * Tính toán số giờ kể từ khi buổi học kết thúc
 */
export const getHoursSinceSessionEnd = (
  sessionDate: string,
  sessionTime: string
): number => {
  // Validate inputs
  if (!sessionDate || !sessionTime) {
    console.warn("Invalid session date or time:", { sessionDate, sessionTime });
    return 0;
  }

  try {
    const [, endTime] = sessionTime.split("-");
    if (!endTime) {
      console.warn("Invalid session time format:", sessionTime);
      return 0;
    }

    const sessionDateTime = new Date(`${sessionDate}T${endTime}:00`);
    const now = new Date();
    const diffMs = now.getTime() - sessionDateTime.getTime();
    return diffMs / (1000 * 60 * 60); // Convert to hours
  } catch (error) {
    console.error("Error calculating hours since session end:", error);
    return 0;
  }
};

/**
 * Xác định tỷ lệ hoàn tiền dựa trên thời gian hủy
 */
export const getRefundPercentage = (hoursUntilSession: number): number => {
  if (hoursUntilSession >= 48) return 100;
  if (hoursUntilSession >= 24) return 50;
  return 0;
};

/**
 * Xác định các hành động có thể thực hiện với booking
 */
export const getBookingActions = (booking: any): BookingActionConfig => {
  // Validate booking object
  if (!booking) {
    console.warn("Invalid booking object:", booking);
    return {
      showPayment: false,
      showMessage: false,
      showViewDetail: true,
      showBookNew: false,
      showReschedule: false,
      showCancel: false,
      showRating: false,
      showTip: false,
      showRequestRefund: false,
      showRefund: false,
      rescheduleDisabled: false,
      cancelDisabled: false,
      refundDisabled: false,
    };
  }

  const status = booking.status;
  const paymentStatus = booking.payment?.paymentStatus || booking.paymentStatus;

  // Handle missing date/time gracefully
  const sessionDate = booking.date || booking.sessionDate || "";
  const sessionTime =
    booking.time || booking.sessionTime || (booking.fromTime && booking.toTime)
      ? `${booking.fromTime}-${booking.toTime}`
      : "";

  const hoursUntilSession = getHoursUntilSession(sessionDate, sessionTime);
  const hoursSinceEnd = getHoursSinceSessionEnd(sessionDate, sessionTime);

  const config: BookingActionConfig = {
    // Default values
    showPayment: false,
    showMessage: false,
    showViewDetail: true,
    showBookNew: false,
    showReschedule: false,
    showCancel: false,
    showRating: false,
    showTip: false,
    showRequestRefund: false,
    showRefund: false,
    rescheduleDisabled: false,
    cancelDisabled: false,
    refundDisabled: false,
  };

  // Nút nhắn tin - luôn hiển thị trừ khi booking bị hủy hoặc từ chối
  config.showMessage = !["CANCELLED", "TUTOR_REJECTED"].includes(status);

  switch (status) {
    case "PAYMENT_PENDING":
    case "PENDING":
      // Chờ thanh toán - chỉ hiển thị nút thanh toán
      config.showPayment = paymentStatus !== "COMPLETED";
      break;

    case "PAYMENT_COMPLETED":
    case "CONFIRMED":
    case "TUTOR_APPROVED":
      // Đã thanh toán và xác nhận - hiển thị các nút quản lý
      config.showReschedule = true;
      config.showCancel = true;

      // Logic disable dựa trên thời gian
      if (hoursUntilSession < 48) {
        config.rescheduleDisabled = true;
        config.rescheduleMessage = "Chỉ có thể đổi lịch trước 48 giờ";
      }

      // Nút hủy luôn có thể bấm nhưng tỷ lệ hoàn tiền khác nhau
      const refundPercentage = getRefundPercentage(hoursUntilSession);
      if (refundPercentage === 100) {
        config.cancelMessage = "Hủy lịch và nhận 100% hoàn tiền hoặc đổi lịch";
      } else if (refundPercentage === 50) {
        config.cancelMessage = "Hủy lịch và nhận 50% hoàn tiền";
      } else {
        config.cancelMessage = "Hủy lịch (không hoàn tiền)";
      }
      break;

    case "IN_PROGRESS":
      // Đang diễn ra - không thể hủy hoặc đổi lịch
      config.showCancel = false;
      config.showReschedule = false;
      break;

    case "COMPLETED":
      // Hoàn thành - hiển thị các nút đánh giá, tip, đặt mới
      config.showBookNew = true;
      config.showRating = true;
      config.showTip = true;

      // Nút yêu cầu hoàn tiền chỉ trong 48 giờ sau khi kết thúc
      if (hoursSinceEnd <= 48) {
        config.showRequestRefund = true;
      } else {
        config.refundDisabled = true;
        config.refundMessage =
          "Chỉ có thể yêu cầu hoàn tiền trong 48 giờ sau buổi học";
      }
      break;

    case "CANCELLED":
      // Đã hủy - hiển thị nút đặt mới và hoàn tiền (nếu có)
      config.showBookNew = true;

      // Logic hoàn tiền dựa trên thời gian hủy
      const cancelledRefundPercentage = getRefundPercentage(hoursUntilSession);
      if (cancelledRefundPercentage > 0) {
        config.showRefund = true;
      } else {
        config.refundDisabled = true;
        config.refundMessage = "Không đủ điều kiện hoàn tiền";
      }
      break;

    case "TUTOR_REJECTED":
      // Giảng viên từ chối - hiển thị nút đặt mới và hoàn tiền 100%
      config.showBookNew = true;
      config.showRefund = true;
      break;

    case "REFUNDED":
      // Đã hoàn tiền - chỉ hiển thị nút đặt mới
      config.showBookNew = true;
      break;

    default:
      // Trạng thái khác - chỉ hiển thị nút xem chi tiết
      break;
  }

  return config;
};

/**
 * Xác định màu sắc cho trạng thái booking
 */
export const getBookingStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PAYMENT_PENDING: "bg-orange-100 text-orange-800",
    PAYMENT_COMPLETED: "bg-blue-100 text-blue-800",
    CONFIRMED: "bg-green-100 text-green-800",
    TUTOR_APPROVED: "bg-green-100 text-green-800",
    IN_PROGRESS: "bg-purple-100 text-purple-800",
    COMPLETED: "bg-gray-100 text-gray-800",
    CANCELLED: "bg-red-100 text-red-800",
    TUTOR_REJECTED: "bg-red-100 text-red-800",
    REFUNDED: "bg-indigo-100 text-indigo-800",
  };

  return statusColors[status] || "bg-gray-100 text-gray-800";
};

/**
 * Lấy tên hiển thị cho trạng thái booking
 */
export const getBookingStatusDisplayName = (status: string): string => {
  const statusNames: Record<string, string> = {
    PENDING: "Chờ xử lý",
    PAYMENT_PENDING: "Chờ thanh toán",
    PAYMENT_COMPLETED: "Đã thanh toán",
    CONFIRMED: "Đã xác nhận",
    TUTOR_APPROVED: "Giảng viên chấp nhận",
    IN_PROGRESS: "Đang diễn ra",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
    TUTOR_REJECTED: "Giảng viên từ chối",
    REFUNDED: "Đã hoàn tiền",
  };

  return statusNames[status] || status;
};
