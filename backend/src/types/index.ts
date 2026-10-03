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
