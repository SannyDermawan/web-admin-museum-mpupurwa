// Data demo untuk development. Jalankan dengan: npm run db:seed
//
// PERINGATAN: seed MENGHAPUS isi semua tabel lalu mengisinya ulang. Pakai hanya untuk database development.
// Setelah seed, login dengan: admin@mpupurwa.test / admin123 (Super Admin).

import { PrismaClient } from "@prisma/client";
import type { EducationLevel } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const MUSEUM_TIMEZONE = "Asia/Jakarta";
const DAY_MS = 24 * 60 * 60 * 1000;

/** "Hari ini" di zona waktu museum, sebagai Date pada tengah malam UTC (cara Prisma menyimpan kolom DATE). */
function todayDate(): Date {
  const iso = new Intl.DateTimeFormat("en-CA", { timeZone: MUSEUM_TIMEZONE }).format(new Date());
  return new Date(`${iso}T00:00:00Z`);
}

function daysFrom(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

/** "09:14" -> kolom TIME (Date pada 1970-01-01). */
function time(hhmm: string): Date {
  return new Date(`1970-01-01T${hhmm}:00Z`);
}

async function main() {
  const today = todayDate();
  const passwordHash = bcrypt.hashSync("admin123", 10);

  // Urutan hapus: tabel yang punya foreign key lebih dulu.
  await prisma.visit.deleteMany();
  await prisma.visitorAccount.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.admin.deleteMany();

  // ---------- admins (kata sandi ketiganya: admin123) ----------
  await prisma.admin.createMany({
    data: [
      { id: "ADM-001", name: "Rizal Pradana", email: "admin@mpupurwa.test", passwordHash, role: "super_admin", status: "active", lastLoginAt: new Date() },
      { id: "ADM-002", name: "Dewi Anggraini", email: "dewi@mpupurwa.id", passwordHash, role: "admin", status: "active", lastLoginAt: new Date(Date.now() - DAY_MS) },
      { id: "ADM-003", name: "Hadi Kurniawan", email: "hadi@mpupurwa.id", passwordHash, role: "admin", status: "inactive", lastLoginAt: new Date(Date.now() - 30 * DAY_MS) },
    ],
  });

  // ---------- visitor_accounts ----------
  await prisma.visitorAccount.createMany({
    data: [
      { id: "ACC-001", name: "Amanda Putri", phone: "0812-xxxx-3421", email: "amanda@gmail.com", domicile: "Surabaya", institution: "Univ. Airlangga", educationLevel: "Mahasiswa", registeredAt: daysFrom(today, -80) },
      { id: "ACC-002", name: "Bagas Pratama", phone: "0813-xxxx-1092", email: "bagas@gmail.com", domicile: "Malang", institution: "SMAN 3 Malang", educationLevel: "Pelajar", registeredAt: daysFrom(today, -70) },
      { id: "ACC-003", name: "Citra Ayu Lestari", phone: "0857-xxxx-4433", email: "citra@gmail.com", domicile: "Malang", institution: "Univ. Brawijaya", educationLevel: "Mahasiswa", registeredAt: daysFrom(today, -55) },
      { id: "ACC-004", name: "Dimas Setiawan", phone: "0895-xxxx-7765", email: "dimas@gmail.com", domicile: "Blitar", institution: null, educationLevel: "Umum", registeredAt: daysFrom(today, -20) },
      { id: "ACC-005", name: "Eka Nur Fadila", phone: "0821-xxxx-9012", email: "eka@gmail.com", domicile: "Malang", institution: "SDN Merjosari 1", educationLevel: "Pelajar", registeredAt: daysFrom(today, -12) },
      { id: "ACC-006", name: "Fajar Ramadhan", phone: "0812-xxxx-5541", email: "fajar@gmail.com", domicile: "Kediri", institution: "Univ. Brawijaya", educationLevel: "Mahasiswa", registeredAt: daysFrom(today, -3) },
    ],
  });

  // ---------- visits ----------
  // Hari ini: 10 check-in bernama (6 punya akun, 4 tidak).
  const todayVisits = [
    { id: "VIS-00001", account: "ACC-001", name: "Amanda Putri", domicile: "Surabaya", institution: "Univ. Airlangga", level: "Mahasiswa", at: "09:14" },
    { id: "VIS-00002", account: "ACC-002", name: "Bagas Pratama", domicile: "Malang", institution: "SMAN 3 Malang", level: "Pelajar", at: "09:42" },
    { id: "VIS-00003", account: "ACC-003", name: "Citra Ayu Lestari", domicile: "Malang", institution: "Univ. Brawijaya", level: "Mahasiswa", at: "10:05" },
    { id: "VIS-00004", account: "ACC-004", name: "Dimas Setiawan", domicile: "Blitar", institution: null, level: "Umum", at: "10:20" },
    { id: "VIS-00005", account: "ACC-005", name: "Eka Nur Fadila", domicile: "Malang", institution: "SDN Merjosari 1", level: "Pelajar", at: "10:35" },
    { id: "VIS-00006", account: "ACC-006", name: "Fajar Ramadhan", domicile: "Kediri", institution: "Univ. Brawijaya", level: "Mahasiswa", at: "11:02" },
    { id: "VIS-00007", account: null, name: "Gita Anjani", domicile: "Surabaya", institution: null, level: "Umum", at: "11:15" },
    { id: "VIS-00008", account: null, name: "Hendra Wijaya", domicile: "Malang", institution: "SMPN 1 Malang", level: "Pelajar", at: "11:40" },
    { id: "VIS-00009", account: null, name: "Intan Permatasari", domicile: "Batu", institution: "Univ. Negeri Malang", level: "Mahasiswa", at: "12:10" },
    { id: "VIS-00010", account: null, name: "Joko Susilo", domicile: "Malang", institution: null, level: "Umum", at: "13:05" },
  ] as const;

  await prisma.visit.createMany({
    data: todayVisits.map((visit) => ({
      id: visit.id,
      visitorAccountId: visit.account,
      visitorName: visit.name,
      domicile: visit.domicile,
      institution: visit.institution,
      educationLevel: visit.level as EducationLevel,
      visitDate: today,
      checkInTime: time(visit.at),
    })),
  });

  // 29 hari sebelumnya: riwayat untuk grafik 7 dan 30 hari. Museum buka Senin-Jumat 08.00-16.00,
  // jadi Sabtu dan Minggu tidak ada check-in. Jumlah per hari mengikuti pola hari dalam seminggu.
  const visitorsByWeekday = [0, 42, 58, 67, 51, 73, 0]; // Minggu dulu
  const hourWeights = [3, 7, 11, 14, 9, 12, 10, 7]; // jam 08 sampai 15
  const guests: Array<{ name: string; domicile: string; institution: string | null; level: EducationLevel }> = [
    { name: "Pengunjung Malang", domicile: "Malang", institution: "Univ. Brawijaya", level: "Mahasiswa" },
    { name: "Pengunjung Batu", domicile: "Batu", institution: "SMAN 1 Batu", level: "Pelajar" },
    { name: "Pengunjung Surabaya", domicile: "Surabaya", institution: null, level: "Umum" },
    { name: "Pengunjung Blitar", domicile: "Blitar", institution: "SDN Merjosari 1", level: "Pelajar" },
    { name: "Pengunjung Kediri", domicile: "Kediri", institution: null, level: "Umum" },
  ];

  const history: Array<{
    id: string;
    visitorName: string;
    domicile: string;
    institution: string | null;
    educationLevel: EducationLevel;
    visitDate: Date;
    checkInTime: Date;
  }> = [];
  let counter = todayVisits.length;

  /** Satu check-in tambahan pada `date`; jam dipilih menurut bobot, menit disebar rata. */
  const addVisit = (date: Date, i: number) => {
    counter += 1;
    let pick = (i * 37) % hourWeights.reduce((a, b) => a + b, 0);
    let hourIndex = 0;
    while (pick >= hourWeights[hourIndex]) {
      pick -= hourWeights[hourIndex];
      hourIndex += 1;
    }
    const guest = guests[counter % guests.length];
    history.push({
      id: `VIS-${String(counter).padStart(5, "0")}`,
      visitorName: guest.name,
      domicile: guest.domicile,
      institution: guest.institution,
      educationLevel: guest.level,
      visitDate: date,
      checkInTime: time(`${String(8 + hourIndex).padStart(2, "0")}:${String((i * 13) % 60).padStart(2, "0")}`),
    });
  };

  for (let back = 29; back >= 1; back--) {
    const date = daysFrom(today, -back);
    const typical = visitorsByWeekday[date.getUTCDay()];
    if (typical === 0) continue;

    const total = typical + (((back * 7) % 11) - 5); // sedikit variasi yang selalu sama
    for (let i = 0; i < total; i++) addVisit(date, i);
  }

  // Hari ini: lengkapi 10 check-in bernama di atas dengan check-in lain, supaya totalnya sedikit di atas kemarin
  // (kartu dashboard menampilkan kenaikan, bukan penurunan tajam). Akhir pekan: museum tutup, jadi tidak ditambah.
  const yesterday = daysFrom(today, -1).getTime();
  const yesterdayTotal = history.filter((visit) => visit.visitDate.getTime() === yesterday).length;
  const todayTarget = Math.round(yesterdayTotal * 1.12);
  for (let i = 0; i < todayTarget - todayVisits.length; i++) addVisit(today, i);
  await prisma.visit.createMany({ data: history });

  // ---------- bookings (waktu pengajuan dihitung mundur dari sekarang) ----------
  const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000);
  await prisma.booking.createMany({
    data: [
      { id: "sdn1", institution: "SDN Merjosari 1 Malang", contactName: "Dewi Saraswati", phone: "0813-2456-7890", visitDate: daysFrom(today, 7), participantCount: 65, notes: "Butuh pemandu untuk siswa SD", status: "pending", createdAt: hoursAgo(6 * 24) },
      { id: "smpn4", institution: "SMPN 4 Malang", contactName: "Budi Hartono", phone: "0812-3456-7891", visitDate: daysFrom(today, 10), participantCount: 48, notes: "Kunjungan edukasi sejarah", status: "pending", createdAt: hoursAgo(3 * 24) },
      { id: "tk", institution: "TK Tunas Bangsa", contactName: "Sri Wahyuni", phone: "0815-6789-0123", visitDate: daysFrom(today, 13), participantCount: 20, notes: "Siswa PAUD dan pendamping", status: "pending", createdAt: hoursAgo(5) },
      { id: "ub", institution: "Universitas Brawijaya — Prodi Sejarah", contactName: "Anisa Rahma", phone: "0821-9876-5432", visitDate: daysFrom(today, 3), participantCount: 30, notes: "Penelitian lapangan", status: "confirmed", createdAt: hoursAgo(12 * 24) },
      { id: "sman1", institution: "SMAN 1 Batu", contactName: "Rudi Setiawan", phone: "0857-1234-5678", visitDate: daysFrom(today, -2), participantCount: 55, notes: null, status: "rejected", createdAt: hoursAgo(25 * 24) },
    ],
  });

  // ---------- collections (alamat video dan PDF di bawah hanya PENGISI contoh) ----------
  await prisma.collection.createMany({
    data: [
      { name: "Arca Ganesya Tikus", era: "Singosari", material: "Batu andesit", origin: "Malang Raya", period: "Abad 13", videoUrl: "https://youtu.be/example-ganesya", pdfUrl: "https://example.com/pdf/arca-ganesya-tikus.pdf" },
      { name: "Arca Brahma", era: "Kanjuruhan", material: "Batu andesit", videoUrl: "https://youtu.be/example-brahma", pdfUrl: "https://example.com/pdf/arca-brahma.pdf" },
      { name: "Siwa Catur Muka", era: "Tumapel", material: "Batu andesit", pdfUrl: "https://example.com/pdf/siwa-catur-muka.pdf" },
      { name: "Makara Gapura", era: "Singosari", material: "Batu andesit", videoUrl: "https://youtu.be/example-makara", pdfUrl: "https://example.com/pdf/makara-gapura.pdf" },
      { name: "Prasasti Kanjuruhan", era: "Prasasti", material: "Batu andesit", videoUrl: "https://youtu.be/example-prasasti" },
      { name: "Arca Nandi", era: "Tumapel", material: "Batu andesit" },
    ],
  });

  const counts = await Promise.all([
    prisma.admin.count(),
    prisma.visitorAccount.count(),
    prisma.visit.count(),
    prisma.booking.count(),
    prisma.collection.count(),
  ]);
  console.log(`Seed selesai: ${counts[0]} admin, ${counts[1]} akun pengunjung, ${counts[2]} check-in, ${counts[3]} booking, ${counts[4]} koleksi.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
