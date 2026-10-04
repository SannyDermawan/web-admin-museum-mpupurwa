# Admin Web Museum Mpu Purwa

Panel admin berbasis web untuk **Museum Mpu Purwa** (Malang). Panel ini dipakai pengelola museum untuk memantau kunjungan harian, menyetujui booking rombongan, serta merawat akun dan koleksi yang tampil di aplikasi mobile museum.

> Proyek ini dikerjakan untuk **UTS Pemrograman Web**. Data yang tampil saat ini masih **dummy**; pada tahap berikutnya akan diganti dengan data sungguhan dari aplikasi mobile dan database.

## Status modul

| Modul | Status |
|---|---|
| Login | Selesai |
| Lupa kata sandi | Selesai (tanpa pengiriman email sungguhan) |
| Dashboard (kartu ringkasan, statistik pengunjung, status booking, aktivitas terbaru) | Selesai |
| Pengunjung hari ini (pencarian, unduh CSV) | Selesai |
| Manajemen akun (pengunjung dan admin) | Dalam pengembangan |
| Booking rombongan | Dalam pengembangan |
| Manajemen koleksi | Dalam pengembangan |

Menu untuk modul yang masih dikembangkan sudah ada di sidebar; halamannya masih berupa placeholder.

## Fitur yang sudah ada

- Login admin dengan sesi berbasis cookie `httpOnly` dan opsi "Ingat saya di perangkat ini".
- Halaman lupa kata sandi (simulasi, tidak mengirim email).
- **Dashboard**: empat kartu ringkasan, grafik jumlah pengunjung (pilihan 24 jam, 7 hari, atau 30 hari terakhir), diagram status booking, daftar pengunjung terbaru, dan daftar booking yang menunggu konfirmasi.
- **Pengunjung hari ini**: tabel check-in harian, kolom cari di halamannya, dan tombol **Unduh CSV**.
- **Notifikasi** (ikon lonceng di navbar): booking yang menunggu persetujuan dan akun pengunjung baru, diambil dari data yang sudah ada. Klik notifikasi untuk menandainya sudah dibaca dan membuka halaman terkait. Belum ada notifikasi sungguhan di backend.
- Tampilan responsif: sidebar menjadi menu geser di layar kecil.

## Teknologi

| Bagian | Teknologi | Alamat (development) |
|---|---|---|
| `frontend/` | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 | http://localhost:3000 |
| `backend/` | Express.js 5, TypeScript | http://localhost:5000 |

Frontend tidak pernah membaca data dummy langsung. Semua data diambil lewat API backend:

```
Next.js (:3000)  --HTTP-->  Express (:5000)  -->  data dummy (backend/src/data)
```

## Menjalankan di komputer sendiri

Prasyarat: **Node.js 20 atau lebih baru** dan npm.

```bash
git clone <url-repositori>
cd <nama-folder-repositori>
```

Buka dua terminal.

**Terminal 1: backend**

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Isi `SESSION_SECRET` di `backend/.env` dengan string acak (untuk development boleh string apa saja).

**Terminal 2: frontend**

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Buka http://localhost:3000 lalu masuk dengan akun dummy:

| | |
|---|---|
| Email | `admin@mpupurwa.test` |
| Kata sandi | `admin123` |

Akun ini hanya data uji untuk UTS. Di Windows PowerShell, ganti `cp` dengan `copy`.

### Perintah lain

| Folder | Perintah | Fungsi |
|---|---|---|
| `frontend/` | `npm run build` | Build produksi |
| `frontend/` | `npm run lint` | Cek gaya kode (ESLint) |
| `backend/` | `npm run build` lalu `npm start` | Build dan jalankan dari `dist/` |
| keduanya | `npx tsc --noEmit` | Cek tipe TypeScript |

## Variabel environment

File `.env` dan `.env.local` **tidak masuk Git**. Yang masuk hanya file `.env.example`.

`backend/.env`

| Variabel | Isi |
|---|---|
| `PORT` | Port API (`5000`) |
| `NODE_ENV` | `development` atau `production` |
| `FRONTEND_URL` | Satu-satunya origin yang diizinkan CORS (`http://localhost:3000`) |
| `SESSION_SECRET` | Kunci penanda tangan cookie login. Wajib diisi jika `NODE_ENV=production` |

`frontend/.env.local`

| Variabel | Isi |
|---|---|
| `NEXT_PUBLIC_API_URL` | Alamat backend (`http://localhost:5000`) |

## Struktur repositori

```
.
├── frontend/                 Next.js
│   ├── app/                  halaman: (auth)/ login dan lupa sandi, (admin)/ halaman admin
│   ├── components/           ui/, layout/, auth/, dashboard/, visitors/
│   ├── hooks/                use-api-data.ts
│   ├── lib/                  api.ts, config.ts, auth-storage.ts, navigation.ts, utils.ts
│   └── types/                tipe bersama (kontrak API)
├── backend/                  Express
│   └── src/
│       ├── server.ts         aplikasi Express: CORS, JSON, pemasangan route
│       ├── config.ts         membaca .env
│       ├── routes/           auth, dashboard, visitors
│       ├── controllers/      logika tiap endpoint
│       ├── data/             data dummy
│       ├── middleware/       requireAuth, errorHandler
│       ├── utils/            format respons JSON, cookie sesi
│       └── types/            tipe API (salinan dari frontend/types)
├── .gitignore
└── README.md
```

## API

Semua respons memakai format yang sama:

```json
{ "success": true, "data": {} }
{ "success": false, "message": "..." }
```

| Endpoint | Perlu login | Keterangan |
|---|---|---|
| `POST /api/auth/login` | Tidak | Body `{ email, password, remember? }`. Mengisi cookie sesi dan mengembalikan `{ user }`. |
| `POST /api/auth/forgot-password` | Tidak | Body `{ email }`. Tidak mengirim email sungguhan. |
| `POST /api/auth/logout` | Tidak | Menghapus cookie sesi. |
| `GET /api/dashboard` | Ya | `stats`, `recentVisitors`, `pendingBookings`. |
| `GET /api/dashboard/visitor-trend?range=` | Ya | Titik grafik pengunjung. `range` = `24h` (per jam), `7d` atau `30d` (per hari); bawaan `7d`. Nilai selain itu dibalas `400`. |
| `GET /api/dashboard/booking-status?range=` | Ya | Jumlah booking per status (`confirmed`, `pending`, `completed`, `rejected`) yang diajukan dalam `24h`, `7d`, atau `30d` terakhir. Dihitung dari data booking di backend. |
| `GET /api/visitors/today?q=` | Ya | Pengunjung hari ini. `q` (opsional) memfilter nama, domisili, institusi, jenjang. |

Endpoint yang butuh login membalas `401` bila cookie sesi tidak ada atau tidak valid.

## Cara login bekerja

1. Frontend memanggil `POST /api/auth/login`. Backend memeriksa akun dummy lalu mengirim cookie `mpu_session` (`httpOnly`, ditandatangani).
2. Frontend menyimpan nama dan peran user di `localStorage`, hanya untuk tampilan dan untuk memutuskan perlu ke halaman login atau tidak.
3. Setiap request memakai `credentials: "include"`, sehingga cookie ikut terkirim. Backend yang memutuskan akses.
4. Jika backend membalas `401`, frontend menghapus data user dan kembali ke halaman login.

Frontend (`:3000`) dan backend (`:5000`) sama-sama berhost `localhost`, jadi cookie dikirim di antara keduanya. Bila nanti dipasang di domain berbeda, opsi cookie di `backend/src/utils/session.ts` perlu disesuaikan.

## Catatan pengembangan

- Tipe API ada di dua tempat: `frontend/types/index.ts` dan `backend/src/types/index.ts`. Jika bentuk respons berubah, ubah keduanya.
- Warna dan font mengikuti desain di `frontend/app/globals.css` (mis. `bg-gold`, `text-ink-soft`); jangan menulis kode hex langsung di komponen.
- Menu sidebar dan judul halaman diatur di satu tempat: `frontend/lib/navigation.ts`.
- Data dummy grafik pengunjung mengikuti jam buka museum: **Senin–Jumat 08.00–16.00**, Sabtu dan Minggu tutup (0 pengunjung). Grafik 24 jam menampilkan pola per jam dari hari buka terakhir, sedangkan grafik 30 hari dihitung mundur dari hari ini. Datanya ada di `backend/src/data/dashboard.ts`.
- Data booking hanya ada satu: `backend/src/data/bookings.ts`. Booking API (`/api/bookings`) dan statistik dashboard (`/api/dashboard`, `/api/dashboard/booking-status`) sama-sama membacanya, jadi menyetujui booking di halaman Booking langsung mengubah angka dashboard. `createdAt` (waktu pengajuan, dihitung dari waktu sekarang) dipakai untuk filter 24 jam, 7 hari, dan 30 hari; `submittedAt` diturunkan darinya sehingga selalu sama. Status yang valid: `pending`, `confirmed`, `completed`, `rejected`. Semua endpoint `/api/bookings` butuh login.
