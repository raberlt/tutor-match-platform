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
  login: (username: string, password: string) => Promise<any | null>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
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
  totalAmount?: number;
  sessions?: PackageSchedule[];
  paymentMethod?: string;
  studentInfo?: {
    fullName: string;
    email: string;
    phone: string;
    address?: string;
  };
  paymentNote?: string;
}

export interface PackageSchedule {
  date: string;
  fromTime: string;
  toTime: string;
}

export interface PackageInfo {
  totalDays: number;
  packageType: string;
  pricePerSession: number;
  totalPrice: number;
  discount: number;
  finalPrice: number;
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
  firstName?: string;
  lastName?: string;
  imageAvatar?: string;
  headline?: string;
  bio?: string;
  experience?: string;
  videoIntro?: string;
  fees?: number;
  teachingLevel?: string;
  city?: string;
  ratePointAverage?: number;
  totalPoint?: number;
  cvFileUrl?: string;
  enable?: boolean;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  profileSubjects?: TutorProfileSubject[];
  schedules?: Schedule[];
  educations?: Education[];
  teachingAudiences?: TeachingAudience[];
  certificates?: Certificate[];
}

export interface TutorProfileSubject {
  id: number;
  fees: number;
  subject: Subject;
  createdAt?: string;
  updatedAt?: string;
}

export interface Subject {
  id: number;
  name: string;
  description?: string;
}

export interface Schedule {
  id: number;
  dayOfWeek: string;
  fromTime: string;
  toTime: string;
  enable?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Education {
  id: number;
  schoolName: string;
  degree: string;
  major: string;
  fromTime: string;
  toTime: string;
  degreeFileName?: string;
  degreeFileUrl?: string;
  valid?: boolean;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeachingAudience {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Certificate {
  id: number;
  name: string;
  issuedBy: string;
  description?: string;
  certFileName?: string;
  certFileUrl?: string;
  valid?: boolean;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
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
  isVerified?: boolean;
  subjectNames: string[];
  user?: User;
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
  isVerified?: boolean;
  subjects?: TutorSubjectDetail[];
  schedules?: TutorSchedule[];
  profileSubjects?: TutorProfileSubject[];
}

export interface TutorProfileSubject {
  id: number;
  name: string;
  fees: number;
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
