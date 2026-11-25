# Kontrak API publik (aplikasi mobile ↔ backend)

Dokumen ini untuk sesi/anggota yang mengerjakan **aplikasi mobile** (`mobile-mpupurwa`). Isinya semua endpoint
`/api/public/*`, termasuk dua hal baru dari dokumen serah terima: **QR check-in** dan **login pengunjung dengan OTP**.
Semua balasan berbentuk `{ "success": true, "data": ... }` atau `{ "success": false, "message": "..." }`.

Base URL: lokal `http://localhost:5000`, produksi alamat backend di Vercel. Semua endpoint di bawah **tanpa cookie**
(CORS terbuka). Login pengunjung memakai header `Authorization: Bearer <token>`.

## 1. Yang sudah ada (dari sesi mobile)

| Endpoint | Fungsi |
|---|---|
| `GET /api/public/collections`, `GET /api/public/collections/:id` | Koleksi |
| `GET /api/public/collections/:id/similar` | Hingga 4 koleksi lain yang paling mirip |
| `POST /api/public/bookings`, `GET /api/public/bookings?ids=...` | Ajukan dan baca status booking |
| `POST /api/public/visits` | Catat check-in (lihat bagian 2 dan 3 untuk tambahan) |

### `GET /api/public/collections/:id/similar`

Mengembalikan maksimal **4 koleksi lain** yang paling mirip dengan koleksi `:id` berdasarkan kesamaan era, material, dan kata penting pada makna/sejarah (diurutkan skor tertinggi lalu `id` menaik).

Balasan 200:

```json
{
  "success": true,
  "data": [
    {
      "id": 4,
      "name": "Makara Gapura",
      "era": "Singosari",
      "material": "Batu andesit",
      "photoUrl": null
    }
  ]
}
```

Status lain: **400** id tidak valid, **404** koleksi tidak ditemukan. Skor: era sama +5, material sama +3, tiap kata penting `meaning` yang sama +1 (maksimal 6); skor sama diurutkan menurut `id`.

## 2. QR check-in (baru)

Admin membuka **Pengunjung Hari Ini**; di sana ada kartu **QR check-in hari ini** (bisa diunduh PNG dan dicetak atau
ditampilkan di layar pintu masuk). Isi QR:

```
MPUPURWA:2026-11-23:WFCkoh7rSbJAYA8L1tHgp4
         tanggal      tanda tangan (HMAC)
```

- Berlaku **hanya pada tanggal di dalamnya** (zona Asia/Jakarta). QR kemarin ditolak.
- Aplikasi **tidak perlu memahami** isinya: pindai QR, ambil teks mentahnya, kirim apa adanya.

`POST /api/public/visits` menerima field tambahan **`qrToken`** (teks mentah dari QR):

```json
{ "qrToken": "MPUPURWA:2026-11-23:WFCkoh7rSbJAYA8L1tHgp4", "name": "...", "domicile": "...", "educationLevel": "Umum" }
```

| Keadaan | Balasan |
|---|---|
| `qrToken` benar dan masih hari ini | 201 `{ id, alreadyRecorded: false }` |
| `qrToken` salah format / tanda tangan palsu | 400 "QR check-in tidak valid." |
| `qrToken` tanggalnya bukan hari ini | 400 "QR sudah kedaluwarsa. Pindai QR yang dipasang hari ini." |
| `qrToken` tidak dikirim | diterima **selama** `CHECKIN_QR_REQUIRED=false` (bawaan, supaya "Simulasikan Scan" lama tetap jalan); jika `true` → 400 "Pindai QR di pintu masuk museum untuk check-in." |

**Tugas mobile:** ganti "Simulasikan Scan (Demo)" dengan pemindai QR sungguhan (mis. paket `mobile_scanner`, izin kamera),
kirim `qrToken`. Setelah itu backend produksi diubah ke `CHECKIN_QR_REQUIRED=true`.

## 3. Login pengunjung dengan OTP (baru)

Tanpa kata sandi: pengunjung mendaftar atau masuk dengan email, lalu memasukkan **kode 6 digit** yang dikirim ke emailnya.

```
register ──► (kode dikirim ke email) ──► verify-otp ──► token ──► dipakai di Authorization: Bearer
login    ──►            "              ──► verify-otp ──► token
```

### `POST /api/public/auth/register`

```json
{ "name": "Amanda Putri", "email": "amanda@gmail.com", "phone": "081234567890",
  "domicile": "Surabaya", "institution": "Univ. Airlangga", "educationLevel": "Mahasiswa" }
```

`institution` opsional; `educationLevel` salah satu `Mahasiswa | Pelajar | Umum` (bawaan `Umum`).
Balasan 201: `{ email, otpSent: true, expiresInSeconds: 600, resendAfterSeconds: 60 }`.

| Status | Arti |
|---|---|
| 400 | Isian tidak valid (pesan menyebut field-nya) |
| 409 | Email sudah terdaftar dan terverifikasi, arahkan ke **Masuk** |
| 429 | Minta kode baru terlalu cepat (tunggu 60 detik) atau terlalu banyak permintaan dari satu IP |
| 503 / 502 | Server belum bisa mengirim email / pengiriman email gagal |

Mendaftar ulang dengan email yang **belum diverifikasi** diperbolehkan (data diperbarui, kode baru dikirim).

### `POST /api/public/auth/login`  `{ "email": "..." }`

Balasan 200 selalu berbentuk sama (`otpSent: true`), baik emailnya terdaftar atau tidak, supaya daftar pengguna tidak
bisa ditebak. Jika emailnya tidak terdaftar, tidak ada kode yang dikirim; aplikasi akan melihatnya saat verifikasi gagal.

### `POST /api/public/auth/verify-otp`  `{ "email": "...", "code": "123456" }`

Balasan 200:

```json
{ "token": "vs1.xxxxx.yyyyy", "expiresAt": "2026-12-23T16:34:35.000Z",
  "account": { "id": "ACC-007", "name": "...", "email": "...", "phone": "...", "domicile": "...",
               "institution": null, "educationLevel": "Umum", "verified": true } }
```

| Status | Arti |
|---|---|
| 400 | Kode salah / kedaluwarsa / sudah dipakai (satu pesan untuk semuanya), atau format kode bukan 6 digit |
| 429 | Lebih dari 5 tebakan salah pada kode itu. **Minta kode baru** (kode lama sudah mati) |

Aturan kode: berlaku 10 menit, sekali pakai, hanya kode terbaru yang berlaku, minta ulang paling cepat tiap 60 detik.

### `GET /api/public/auth/me`  (header `Authorization: Bearer <token>`)

Balasan 200 `{ account }`; **401** jika token tidak ada, rusak, kedaluwarsa (30 hari), atau akunnya sudah dihapus admin.
Jika dapat 401, hapus token di perangkat dan arahkan ke layar masuk.

### Check-in sebagai pengunjung yang login

Kirim token di `POST /api/public/visits`. Server memakai **identitas dari akun** (nama, domisili, institusi, jenjang),
mengabaikan isian `name`/`domicile` di body, menghubungkan check-in ke akun, dan mencegah check-in ganda per hari per
akun. Token yang dikirim tapi tidak berlaku dibalas **401** "Sesi sudah berakhir. Silakan masuk lagi."
Tanpa token, check-in anonim tetap diterima seperti sebelumnya.

## 4. Mode pengembangan (tanpa email sungguhan)

Saat `NODE_ENV` bukan `production` dan `OTP_DEV_ECHO` tidak `false`, balasan register/login ikut memuat
**`devCode`** (kode OTP-nya) dan kode dicatat di log server. Ini hanya untuk uji lokal; **di production `devCode` tidak
pernah dikirim**, dan tanpa `RESEND_API_KEY` register/login dibalas 503.

## 5. Variabel environment yang berkaitan (backend)

| Variabel | Fungsi |
|---|---|
| `CHECKIN_QR_REQUIRED` | `true` = check-in wajib QR (aktifkan setelah aplikasi bisa memindai) |
| `CHECKIN_QR_SECRET` | Kunci tanda tangan QR; kosong = diturunkan dari `SESSION_SECRET` (mengganti kunci memutus semua QR lama) |
| `RESEND_API_KEY`, `MAIL_FROM` | Pengiriman email OTP lewat Resend (domain pengirim harus diverifikasi di Resend) |
| `OTP_DEV_ECHO` | Hanya development: sertakan `devCode` di balasan |

## 6. Daftar tugas untuk sisi mobile

1. Layar **Daftar** dan **Masuk** memanggil `register`/`login`, layar **OTP** memanggil `verify-otp`; simpan `token` di penyimpanan aman.
2. Ganti login lokal (kode 4 digit apa pun diterima) dengan alur di atas; semua panggilan setelah masuk membawa header Bearer.
3. Pemindai QR sungguhan; kirim `qrToken` ke `POST /api/public/visits`.
4. Tangani 401 (sesi habis), 409 (email sudah terdaftar), 429 (terlalu cepat / lock kode).
5. Setelah 1-4 selesai: minta Sanny mengaktifkan `CHECKIN_QR_REQUIRED=true` di produksi.
