# Serah terima: integrasi Aplikasi Mobile ↔ Web Admin

Dokumen ini ditulis oleh sesi Claude Code yang mengerjakan **aplikasi mobile**
(`mobile-mpupurwa`) untuk sesi yang mengerjakan **Web Admin**
(`website-admin-museum-mpu-purwa`). Salinan yang sama ada di kedua repositori.
Terakhir diperbarui: 23 November 2026 (data demo sudah dihapus dari DB lokal, lihat bagian 3).

```
Aplikasi Flutter ──HTTP /api/public/*──►  Express (:5000) ──Prisma──► MySQL
(mobile-mpupurwa)                         (website-admin…/backend)
                                          ▲
Next.js admin (:3000) ──/api/* + cookie───┘  (khusus admin, tidak berubah)
```

## 1. Yang sudah jadi

### Backend (repo Web Admin) — semua BERKAS BARU kecuali `app.ts`

| Berkas | Isi |
|---|---|
| `backend/src/routes/public.routes.ts` | Router publik + CORS terbuka (`*`) + pembatas laju untuk endpoint tulis |
| `backend/src/controllers/public.controller.ts` | Logika & validasi semua endpoint publik |
| `backend/src/app.ts` | **2 baris** ditambah: impor `publicRoutes` dan `app.use("/api/public", express.json(...), publicRoutes)` **sebelum** `cors(frontendUrl)` |
| `backend/prisma/import-koleksi.ts` | Impor 13 arca asli ke tabel `collections` |
| `backend/prisma/data/koleksi-asli.json` | Data 13 arca untuk skrip impor |

Endpoint (tanpa login; balasan `{ success, data, message? }`):

| Endpoint | Fungsi |
|---|---|
| `GET /api/public/collections` | Semua koleksi, kolom lengkap |
| `GET /api/public/collections/:id` | Satu koleksi |
| `POST /api/public/bookings` | Ajukan booking rombongan (status awal `pending`). Body: `institution, contactName, phone, participants, visitDate (YYYY-MM-DD), notes?, email?`. Balikan memuat `id` acak `bk-<12 hex>` |
| `GET /api/public/bookings?ids=bk-…,bk-…` | Status booking milik pengunjung. Hanya id yang dipegang pengunjung yang bisa dibaca (id acak, bukan nomor urut) |
| `POST /api/public/visits` | Catat check-in. Body: `name, domicile, institution?, educationLevel (Mahasiswa/Pelajar/Umum)`. Satu (nama, domisili) hanya sekali per hari: yang kedua dibalas `alreadyRecorded: true` |

Sengaja **tidak ada** endpoint ubah/hapus publik. Endpoint admin lama (`/api/collections`,
`/api/bookings`, dst.) tidak diubah dan tetap butuh cookie login.

Diuji manual end-to-end terhadap MySQL lokal: validasi menolak input salah, booking dan check-in
masuk ke tabel `bookings` / `visits` (terlihat di dashboard admin), status yang diubah admin
muncul di aplikasi, preflight CORS dari `localhost:8101` berhasil, dan `GET /api/collections`
tanpa cookie tetap `401`. `npx tsc --noEmit` bersih.

### Aplikasi mobile (repo `mobile-mpupurwa`)

- **Koleksi**: `ApiKoleksiRepository` membaca `/api/public/collections`. Data bawaan
  `assets/data/koleksi.json` jadi cadangan bila server mati/kosong, dan pelengkap per arca:
  foto bawaan dipakai bila admin belum mengunggah foto; id bawaan (`brahma`, `ganesha-1`, …)
  dipakai bila **nama arca sama persis** (kunci rekomendasi "Koleksi serupa").
- **Booking**: `ApiBookingRepository` (kirim + baca status). Id booking disimpan di perangkat
  (`SessionStorage`). Layar Status Booking memuat ulang saat dibuka dan bisa ditarik ke bawah.
  Bila pengiriman gagal, pengajuan dikeluarkan dari daftar dan pengguna melihat pesan error.
- **Check-in**: `ApiVisitRepository` mengirim profil pengunjung saat kunjungan dicatat.
- **Beranda** kini dari data sungguhan (`KoleksiHomeRepository`): jumlah koleksi, 3 koleksi
  unggulan (berfoto, era berbeda). Kartu unggulan sekarang benar-benar membuka Detail
  (rute `/koleksi/:id` dengan `KoleksiDetailLoader`; dulu jatuh ke Katalog).
- **Katalog**: chip era hanya untuk era yang punya koleksi (`Majapahit` sekarang dikenali).
- **Detail Koleksi**: kalimat di bawah judul disusun dari era + periode (dulu teks tetap
  "berkendaraan tikus" yang salah).
- Memakai `ApiClient` (dio) dan `ApiConfig` yang sudah ada; ditambah `getJson`/`postJson`
  yang membuka amplop `{ success, data }`.
- 81 tes lolos (`flutter test`), termasuk `test/api_integration_test.dart` (respons server
  ditiru, tanpa jaringan).

## 2. Cara menjalankan

```text
# 1) Backend (butuh MySQL jalan & backend/.env terisi)
cd backend
npx tsx prisma/import-koleksi.ts            # sekali: tambah 13 arca asli (aman diulang)
npm run dev                                 # http://localhost:5000

# 2) Aplikasi (alamat backend diberikan lewat dart-define)
flutter run -d chrome --dart-define=API_BASE_URL=http://localhost:5000
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:5000     # emulator Android
```

Tanpa `API_BASE_URL` aplikasi memakai data bawaan sepenuhnya dan tidak memanggil server
(inilah mode yang dipakai tes).

## 3. Keadaan database lokal saat ini

`import-koleksi.ts` sudah dijalankan pada MySQL lokal dan **5 data demo bawaan seed sudah dihapus**
(`--hapus-demo`). Isi `collections` sekarang **14 baris**: 13 arca asli + 1 baris `Testing` milik
pemilik proyek (punya foto/PDF di Vercel Blob; sengaja tidak saya hapus lewat skrip karena file
Blob-nya tidak ikut terhapus; hapus lewat halaman Manajemen Koleksi). `Testing` masih tampil di
Katalog aplikasi dan bisa terpilih sebagai koleksi unggulan di Beranda sampai dihapus.

Menjalankan ulang `import-koleksi.ts` aman (arca dicocokkan lewat nama; foto yang sudah diunggah
lewat admin tidak ditimpa). Skrip seed (`npm run db:seed`) **menghapus semua tabel dan mengisi
ulang dengan data demo**, jadi jangan dijalankan lagi kecuali ingin kembali ke data demo, lalu
jalankan impor lagi.

Data uji yang saya buat saat pengujian (2 booking, 2 check-in) sudah saya hapus lagi.

## 4. Batasan & hal yang perlu diputuskan

1. **Foto 13 arca belum di Vercel Blob.** `photoUrl` di DB `NULL` untuk arca asli; aplikasi
   memakai foto bawaan. Di halaman admin foto kosong. Unggah lewat Manajemen Koleksi (file ada di
   `mobile-mpupurwa/assets/images/arca_*.jpg`).
2. **`pdfUrl` arca asli berisi tautan Google Drive**, bukan Vercel Blob. Validasi `PATCH
   /api/collections/:id` mensyaratkan host Blob untuk `pdfUrl`, jadi **mengedit arca lewat form
   admin akan menolak PDF Drive** sampai PDF diunggah ulang (atau validasinya dilonggarkan).
3. **Rekomendasi "Koleksi serupa" dihitung offline** (`mobile-mpupurwa/ml/build_serupa.py`),
   bukan oleh server, dan dikunci pada id bawaan. Arca baru dari admin tidak punya rekomendasi
   sampai skrip dijalankan ulang lalu `assets/data/koleksi_serupa.json` diperbarui dan aplikasi
   dirilis ulang. Ide lanjutan: sajikan JSON itu dari server (`GET /api/public/similar`).
4. **Login pengunjung belum terhubung.** Tidak ada tabel/endpoint pendaftaran dan verifikasi
   kode untuk pengunjung; aplikasi masih memakai login lokal (kode 4 digit apa pun diterima,
   profil di perangkat). `VisitorAccount` di DB belum terisi dari aplikasi. Karena itu check-in
   mengirim snapshot nama/domisili, bukan `visitorAccountId`.
5. **Scan QR belum nyata.** Halaman Scan masih menawarkan "Simulasikan Scan (Demo)"; belum ada
   paket kamera/izin. Check-in ke server terjadi saat simulasi itu ditekan. Perlu: paket pemindai
   (mis. `mobile_scanner`), izin kamera, dan keputusan isi QR pintu masuk (usul: tanda tangan/
   token yang dicek `POST /api/public/visits` agar tidak bisa dipalsukan).
6. **Check-in offline tidak diantre.** Jika server tak terjangkau, kunjungan tetap tampil
   tercatat di aplikasi tetapi tidak sampai ke admin, dan tidak diulang otomatis.
7. **Jam masuk** disimpan dengan zona Asia/Jakarta (kolom `TIME`), konsisten dengan pembaca
   `toHourMinute` di dashboard.
8. **Booking**: id acak disimpan di perangkat; ganti perangkat/hapus data aplikasi berarti riwayat
   status tidak terlihat lagi (data di server tetap ada). Nomor HP tidak dipakai sebagai kunci
   agar orang lain tidak bisa mengintip booking.
9. **Keamanan produksi**: `/api/public/*` tanpa autentikasi. Pembatas laju 60 permintaan/15
   menit/IP hanya di endpoint tulis. Pastikan `trust proxy` di Vercel benar agar batas ini per
   pengunjung, bukan per proxy. Perlu ditinjau lagi sebelum dibuka ke publik.
10. Era di aplikasi diperkirakan dari isi PDF (lihat `mobile-mpupurwa/ml/README.md`); era valid di
    admin: `Kanjuruhan, Tumapel, Singosari, Majapahit, Prasasti`.

## 5. Catatan untuk sesi Web Admin

- Repo Web Admin saat saya kerjakan **punya perubahan belum di-commit milik sesi lain** (helmet,
  logger, vercel.json, error pages, dll.). Agar tidak ikut mengunci perubahan yang belum selesai,
  bagian saya di-commit lewat *git worktree* terpisah pada branch **`feat/api-publik-mobile`**
  (dari `main` 24ab850) dan di-push; branch `main` dan working tree Anda tidak disentuh.
  Commit itu berisi: 3 berkas baru di `backend/src`, `backend/prisma/import-koleksi.ts`,
  `backend/prisma/data/koleksi-asli.json`, README, dokumen ini, dan **hanya 2 baris saya** di
  `app.ts` (tanpa helmet/logger Anda).
- **Sebelum merge branch itu ke branch Anda**: salinan berkas saya masih ada di working tree Anda
  sebagai *untracked* (`public.*`, `import-koleksi.ts`, dll.) dan `app.ts` Anda sudah memuat 2 baris
  yang sama. Hapus salinan untracked itu (atau `git stash -u`) dan siap menyelesaikan konflik kecil
  di `app.ts` (letak mount `/api/public` di antara `helmet()` dan `cors()`; versi Anda: tetap
  `/api/public` sebelum `cors`).
- Urutan middleware di `app.ts` penting: `/api/public` harus **sebelum** `cors({ origin:
  frontendUrl })`, kalau tidak preflight dijawab CORS khusus admin dan aplikasi web gagal.
- Jika menambah endpoint publik baru, daftarkan di `public.routes.ts` dan jangan taruh di balik
  `requireAuth`.
- README Web Admin sudah saya tambahi tabel endpoint publik.
- `backend/prisma/import-koleksi.ts` memakai `__dirname` (backend CommonJS); jalankan dengan `tsx`.

## 6. Pekerjaan berikutnya yang disarankan (urut prioritas)

1. Bersihkan data demo/`Testing`, unggah 13 foto + PDF ke Blob (butuh `BLOB_READ_WRITE_TOKEN`).
2. Longgarkan atau samakan validasi `pdfUrl` admin dengan data yang ada.
3. Scan QR sungguhan + token QR pintu masuk.
4. Pendaftaran/verifikasi pengunjung (`VisitorAccount`) agar check-in terikat akun.
5. Sajikan rekomendasi "Koleksi serupa" dari server atau tombol "hitung ulang" di admin.
6. Deploy backend (Vercel) lalu isi `API_BASE_URL` produksi pada build aplikasi.
