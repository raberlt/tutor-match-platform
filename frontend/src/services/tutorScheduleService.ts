import api from "./api";

export interface TutorSchedule {
  dayOfWeek: string;
  fromTime: string;
  toTime: string;
}

export interface TutorSubject {
  id: number;
  name: string;
  fees: number;
}

export const tutorScheduleService = {
  // Lấy lịch trình của gia sư
  async getTutorSchedules(tutorId: number): Promise<TutorSchedule[]> {
    try {
      const response = await api.get(`/tutors/${tutorId}/schedules`);
      return response.data;
    } catch (error) {
      console.error("Error fetching tutor schedules:", error);
      throw error;
    }
  },

  // Lấy danh sách môn học của gia sư
  async getTutorSubjects(tutorId: number): Promise<TutorSubject[]> {
    try {
      const response = await api.get(`/tutors/${tutorId}/subjects`);
      return response.data;
    } catch (error) {
      console.error("Error fetching tutor subjects:", error);
      throw error;
    }
  },

  // Lấy khung giờ trống của gia sư trong ngày cụ thể
  async getAvailableTimeSlots(
    tutorId: number,
    date: string
  ): Promise<string[]> {
    try {
      const response = await api.get(`/tutors/${tutorId}/available-slots`, {
        params: { date },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching available time slots:", error);
      throw error;
    }
  },

  // Kiểm tra điều kiện học thử
  async checkTrialEligibility(
    studentId: number,
    tutorId: number
  ): Promise<boolean> {
    try {
      const response = await api.get("/trial/check-eligibility", {
        params: { studentId, tutorId },
      });
      return response.data.canTakeTrial;
    } catch (error) {
      console.error("Error checking trial eligibility:", error);
      return false; // Fallback to false if API fails
    }
  },

  // Tính phí học thử
  async calculateTrialFee(originalFee: number): Promise<number> {
    try {
      const response = await api.get("/trial/calculate-trial-fee", {
        params: { originalFee },
      });
      return response.data.trialFee;
    } catch (error) {
      console.error("Error calculating trial fee:", error);
      return originalFee * 0.5; // Fallback to 50%
    }
  },

  // Tính phí gói học
  async calculatePackageFee(
    originalFee: number,
    totalSessions: number
  ): Promise<number> {
    try {
      const response = await api.get("/trial/calculate-package-fee", {
        params: { originalFee, totalSessions },
      });
      return response.data.packageFee;
    } catch (error) {
      console.error("Error calculating package fee:", error);
      // Fallback calculation
      const discountSessions = Math.floor(totalSessions / 12);
      const totalFee = originalFee * totalSessions;
      const discountAmount = originalFee * 0.5 * discountSessions;
      return totalFee - discountAmount;
    }
  },
};
