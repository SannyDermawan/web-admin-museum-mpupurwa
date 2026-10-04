export interface BookingItem {
  id: string;
  institution: string;
  contact: string;
  phone: string;
  date: string;
  participants: number;
  submittedAt: string;
  notes: string;
  status: "pending" | "confirmed" | "rejected";
}

export const bookingsData: BookingItem[] = [
  {
    id: "sdn1",
    institution: "SDN Merjosari 1 Malang",
    contact: "Dewi Saraswati",
    phone: "0813-2456-7890",
    date: "29 Sep 2026",
    participants: 65,
    submittedAt: "22 Sep 2026, 10:14",
    notes: "Butuh pemandu untuk siswa SD",
    status: "pending",
  },
  {
    id: "smpn4",
    institution: "SMPN 4 Malang",
    contact: "Budi Hartono",
    phone: "0812-3456-7891",
    date: "02 Okt 2026",
    participants: 48,
    submittedAt: "23 Sep 2026, 14:20",
    notes: "Kunjungan edukasi sejarah",
    status: "pending",
  },
  {
    id: "tk",
    institution: "TK Tunas Bangsa",
    contact: "Sri Wahyuni",
    phone: "0815-6789-0123",
    date: "05 Okt 2026",
    participants: 20,
    submittedAt: "24 Sep 2026, 09:00",
    notes: "Siswa PAUD dan pendamping",
    status: "pending",
  },
  {
    id: "ub",
    institution: "Universitas Brawijaya — Prodi Sejarah",
    contact: "Anisa Rahma",
    phone: "0821-9876-5432",
    date: "25 Sep 2026",
    participants: 30,
    submittedAt: "18 Sep 2026, 11:30",
    notes: "Penelitian lapangan",
    status: "confirmed",
  },
  {
    id: "sman1",
    institution: "SMAN 1 Batu",
    contact: "Rudi Setiawan",
    phone: "0857-1234-5678",
    date: "20 Sep 2026",
    participants: 55,
    submittedAt: "15 Sep 2026, 08:45",
    notes: "- ",
    status: "rejected",
  },
];