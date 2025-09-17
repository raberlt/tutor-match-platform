export type UserRole = "STUDENT" | "TUTOR" | "ADMIN";

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  imageAvatar?: string;
}

export interface AuthContextType {
  user: any | null; // User từ authService
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Booking Types - Cập nhật theo API mới
export type BookingStatus =
  | "PENDING"
  | "TUTOR_APPROVED"
  | "PAYMENT_PENDING"
  | "PAID"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

export type BookingType = "TRIAL" | "SINGLE_SESSION" | "PACKAGE";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface BookingRequestCreateDTO {
  bookingType: BookingType;
  tutorId: number;
  subjectId: number;
  date: string; // YYYY-MM-DD format
  fromTime: string; // HH:mm format
  toTime: string; // HH:mm format
  note?: string;
  sessionsPerWeek?: number; // chỉ cho PACKAGE
  contractDuration?: number; // chỉ cho PACKAGE (tháng)
}

export interface StudentProfile {
  id: number;
  user: User;
  learningGoals?: string;
  preferredSubjects?: string;
  budgetMin?: number;
  budgetMax?: number;
  learningStyle?: string;
  preferredTimeSlots?: string;
}

export interface TutorProfile {
  id: number;
  user: User;
  headline?: string;
  bio?: string;
  experience?: string;
  fees?: number;
  teachingLevel?: string;
  city?: string;
  ratePointAverage?: number;
  totalPoint?: number;
}

export interface Contract {
  id: number;
  bookingId: number;
  contractContent: string;
  status: "DRAFT" | "SIGNED" | "ACTIVE" | "EXPIRED" | "TERMINATED";
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: number;
  bookingType: BookingType;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  student: StudentProfile;
  tutor: TutorProfile;
  subject: SubjectInfo;
  amount: number;
  date: string;
  fromTime: string;
  toTime: string;
  note?: string;
  paymentMethod?: string;
  paymentReference?: string;
  paymentDate?: string;
  sessionsPerWeek?: number;
  contractDuration?: number;
  contract?: Contract;
  createdAt: string;
  updatedAt: string;
}

export interface BookingListResponse {
  content: Booking[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface BookingStats {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  trialBookings?: number;
  singleSessionBookings?: number;
  packageBookings?: number;
}

export interface BookingSystemInfo {
  systemName: string;
  version: string;
  features: string[];
  bookingFlow: Record<BookingType, string>;
  timestamp: number;
}

export interface StudentInfo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface TutorInfo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  headline?: string;
  fees?: number;
  city?: string;
}

export interface SubjectInfo {
  id: number;
  name: string;
  description?: string;
  price?: number;
  duration?: number; // minutes
}

export interface LearningGoal {
  id: number;
  name: string;
  description: string;
  category: string;
}

export interface TutorSubject {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
}

export interface AvailableSlot {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  subjectId: number;
  subjectName: string;
}

export interface TutorDetail {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  headline?: string;
  fees?: number;
  city?: string;
  subjects: TutorSubject[];
  availableTimeSlots: AvailableSlot[];
  teachingMethods: string[];
  certifications: string[];
}

export interface BookingRequestDTO {
  id: number;
  status: BookingStatus;
  bookingType: BookingType;
  date: string;
  fromTime: string;
  toTime: string;
  note?: string;
  totalAmount?: number;
  contractDuration?: number;
  sessionsPerWeek?: number;
  student: StudentInfo;
  tutor: TutorInfo;
  subject: SubjectInfo;
}

// Tutor Search Types
export interface Subject {
  id: number;
  name: string;
}

export interface TutorSearchFilters {
  keyword?: string;
  subjectId?: number;
  minFee?: number;
  maxFee?: number;
  minRating?: number;
  city?: string;
}

export interface TutorSearchResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface TutorPreviewProfile {
  id: number;
  firstName: string;
  lastName: string;
  imageAvatar?: string;
  headline?: string;
  fees?: number;
  ratePointAverage?: number;
  totalPoint?: number;
  city?: string;
  subjectNames: string[];
}

export interface TutorProfile {
  id: number;
  firstName: string;
  lastName: string;
  imageAvatar?: string;
  bio?: string;
  headline?: string;
  experience?: string;
  teachingLevel?: string;
  fees?: number;
  ratePointAverage?: number;
  totalPoint?: number;
  city?: string;
  subjects: TutorSubjectDetail[];
  schedules: TutorSchedule[];
}

export interface TutorSubjectDetail {
  id: number;
  name: string;
}

export interface TutorSchedule {
  id: number;
  dayOfWeek: string;
  fromTime: string;
  toTime: string;
}

export interface BookingListResponse {
  success: boolean;
  bookings: BookingRequestDTO[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  message?: string;
}

export interface BookingDetailResponse {
  success: boolean;
  booking: BookingRequestDTO;
  message?: string;
}

export interface BookingCreateResponse {
  success: boolean;
  message: string;
  bookingId?: number;
  status?: string;
}
