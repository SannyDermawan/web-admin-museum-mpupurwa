// API types used by the backend.
// These mirror frontend/types/index.ts: when you change a response shape here,
// change it there too (they are the API contract between the two apps).

export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
};

export type ApiError = {
  success: false;
  message: string;
};

// ---------- Auth ----------

export type UserRole = "super_admin" | "admin";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

// ---------- Visitors ----------

export type EducationLevel = "Mahasiswa" | "Pelajar" | "Umum";

export type Visitor = {
  id: string;
  name: string;
  domicile: string;
  /** null when the visitor has no school / institution ("Umum") */
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
  newAccounts: number;
  totalCollections: number;
};

export type PendingBookingSummary = {
  id: string;
  institutionName: string;
  participantCount: number;
  /** ISO date (YYYY-MM-DD) */
  visitDate: string;
  /** ISO timestamp the booking was submitted */
  createdAt: string;
};

/** Time ranges of the dashboard charts: last 24 hours, 7 days and 30 days */
export type DashboardRange = "24h" | "7d" | "30d";

/** The visitor chart uses the same ranges (24h is per hour, 7d and 30d are per day) */
export type VisitorTrendRange = DashboardRange;

/** One point of the visitor chart */
export type VisitorTrendPoint = {
  /** Axis label: "13.00" (24h), "Senin" (7d) or "12 Sep" (30d) */
  label: string;
  visitors: number;
};

/** GET /api/dashboard/visitor-trend?range=... (oldest point first) */
export type VisitorTrendData = {
  range: VisitorTrendRange;
  points: VisitorTrendPoint[];
};

/** Number of group bookings per status (the donut on the dashboard) */
export type BookingStatusCounts = {
  confirmed: number;
  pending: number;
  completed: number;
  rejected: number;
};

/** GET /api/dashboard/booking-status?range=... */
export type BookingStatusData = {
  range: DashboardRange;
  counts: BookingStatusCounts;
};

export type DashboardData = {
  stats: DashboardStats;
  recentVisitors: Visitor[];
  pendingBookings: PendingBookingSummary[];
};

// Account management (Manajemen Akun) types live in their own file.
export * from "./accounts";
