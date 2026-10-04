// Shared types for the admin web. Teammates: add your own module types in a
// new file under /types and re-export here, instead of editing existing ones.

// ---------- API envelope ----------

export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
};

export type ApiError = {
  success: false;
  message: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ---------- Auth ----------

export type UserRole = "super_admin" | "admin";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type LoginRequest = {
  email: string;
  password: string;
  /** "Ingat saya di perangkat ini" */
  remember?: boolean;
};

export type LoginData = {
  user: User;
};

export type ForgotPasswordRequest = {
  email: string;
};

// ---------- Visitors ----------

export type EducationLevel = "Mahasiswa" | "Pelajar" | "Umum";

export type Visitor = {
  id: string;
  name: string;
  /** City of origin, e.g. "Malang" */
  domicile: string;
  /** School / institution; null when the visitor has none ("Umum") */
  institution: string | null;
  educationLevel: EducationLevel;
  /** 24h time, "HH:mm" */
  checkInTime: string;
};

export type TodayVisitorsData = {
  /** ISO date (YYYY-MM-DD) the list belongs to */
  date: string;
  visitors: Visitor[];
};

// ---------- Dashboard ----------

export type DashboardStats = {
  todayVisitors: number;
  /** Change vs. yesterday, in percent */
  todayVisitorsChangePercent: number;
  pendingBookings: number;
  totalAccounts: number;
  /** New accounts in the current period */
  newAccounts: number;
  totalCollections: number;
};

/** Short form of a booking, used on the dashboard. The full Booking type belongs to the booking module. */
export type PendingBookingSummary = {
  id: string;
  institutionName: string;
  participantCount: number;
  /** ISO date (YYYY-MM-DD) */
  visitDate: string;
};

/** Visitors on one day of the "7 hari terakhir" chart */
export type VisitorTrendPoint = {
  /** Day name shown on the chart axis, e.g. "Senin" */
  day: string;
  visitors: number;
};

/** Number of group bookings per status (the donut on the dashboard) */
export type BookingStatusCounts = {
  confirmed: number;
  pending: number;
  completed: number;
  rejected: number;
};

export type DashboardData = {
  stats: DashboardStats;
  /** Oldest day first, 7 entries */
  visitorTrend: VisitorTrendPoint[];
  bookingStatus: BookingStatusCounts;
  recentVisitors: Visitor[];
  pendingBookings: PendingBookingSummary[];
};

// Account management (Manajemen Akun) types live in their own file.
export * from "./accounts";
