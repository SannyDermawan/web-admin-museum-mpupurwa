// Dummy check-in data (UTS). Later this comes from the mobile app's database.

import type { TodayVisitorsData, Visitor } from "../types";

export const dummyVisitors: Visitor[] = [
  { id: "VIS-001", name: "Amanda Putri", domicile: "Surabaya", institution: "Univ. Airlangga", educationLevel: "Mahasiswa", checkInTime: "09:14" },
  { id: "VIS-002", name: "Bagas Pratama", domicile: "Malang", institution: "SMAN 3 Malang", educationLevel: "Pelajar", checkInTime: "09:42" },
  { id: "VIS-003", name: "Citra Ayu Lestari", domicile: "Malang", institution: "Univ. Brawijaya", educationLevel: "Mahasiswa", checkInTime: "10:05" },
  { id: "VIS-004", name: "Dimas Setiawan", domicile: "Blitar", institution: null, educationLevel: "Umum", checkInTime: "10:20" },
  { id: "VIS-005", name: "Eka Nur Fadila", domicile: "Malang", institution: "SDN Merjosari 1", educationLevel: "Pelajar", checkInTime: "10:35" },
  { id: "VIS-006", name: "Fajar Ramadhan", domicile: "Kediri", institution: "Univ. Brawijaya", educationLevel: "Mahasiswa", checkInTime: "11:02" },
  { id: "VIS-007", name: "Gita Anjani", domicile: "Surabaya", institution: null, educationLevel: "Umum", checkInTime: "11:15" },
  { id: "VIS-008", name: "Hendra Wijaya", domicile: "Malang", institution: "SMPN 1 Malang", educationLevel: "Pelajar", checkInTime: "11:40" },
  { id: "VIS-009", name: "Intan Permatasari", domicile: "Batu", institution: "Univ. Negeri Malang", educationLevel: "Mahasiswa", checkInTime: "12:10" },
  { id: "VIS-010", name: "Joko Susilo", domicile: "Malang", institution: null, educationLevel: "Umum", checkInTime: "13:05" },
];

/** "Today" in the museum's timezone, as YYYY-MM-DD. */
function todayInMuseumTimezone(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());
}

/** Optional `query` filters by name, domicile, institution or education level. */
export function getTodayVisitors(query?: string): TodayVisitorsData {
  const needle = query?.trim().toLowerCase();
  const visitors = needle
    ? dummyVisitors.filter((visitor) =>
        [visitor.name, visitor.domicile, visitor.institution ?? "", visitor.educationLevel]
          .join(" ")
          .toLowerCase()
          .includes(needle),
      )
    : dummyVisitors;

  return { date: todayInMuseumTimezone(), visitors };
}
