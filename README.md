# Admin Web · Museum Mpu Purwa

Panel admin untuk aplikasi mobile Museum Mpu Purwa. Repositori ini berisi dua aplikasi terpisah yang berkomunikasi lewat HTTP.

| Bagian | Teknologi | Alamat (development) |
|---|---|---|
| `frontend/` | Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 | http://localhost:3000 |
| `backend/` | Express.js 5 + TypeScript | http://localhost:5000 |

Data masih **dummy** (UTS). Frontend tidak pernah membaca data dummy langsung; semuanya lewat API backend:

```
Next.js (:3000)  --HTTP-->  Express (:5000)  -->  data dummy (backend/src/data)
```

## Menjalankan

Jalankan dua terminal.

```bash
cd backend
npm install
cp .env.example .env     # lalu isi SESSION_SECRET (untuk development boleh string apa saja)
npm run dev              # http://localhost:5000
```

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev              # http://localhost:3000
```

Buka http://localhost:3000 dan masuk dengan akun dummy:

- Email: `admin@mpupurwa.test`
- Kata sandi: `admin123`

Perintah lain: `npm run build` dan `npx tsc --noEmit` di kedua folder; `npm run lint` di `frontend/`; `npm start` di `backend/` menjalankan hasil build (`dist/`).

## Variabel environment

File `.env` dan `.env.local` **tidak masuk Git**; yang masuk hanya file `.env.example`.

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
| `NEXT_PUBLIC_API_URL` | Alamat backend (`http://localhost:5000`). Dibaca satu kali di `frontend/lib/config.ts` |

## Struktur

```
frontend/
  app/            halaman: (auth)/ login & lupa sandi, (admin)/ halaman admin (sidebar + navbar otomatis)
  components/     ui/ (Button, Input, Card, Table, Badge, Modal, ...), layout/, auth/, dashboard/, visitors/
  hooks/          use-api-data.ts
  lib/            api.ts (fetch ke backend), config.ts (API_URL), auth-storage.ts, navigation.ts, utils.ts
  types/          tipe bersama (kontrak API)
backend/
  src/
    server.ts     aplikasi Express: CORS, JSON, pemasangan route
    config.ts     membaca .env
    routes/       auth, dashboard, visitors
    controllers/  logika tiap endpoint
    data/         data dummy (auth, dashboard, visitors)
    middleware/   requireAuth, errorHandler
    utils/        response (format JSON), session (cookie bertanda tangan)
    types/        tipe API (salinan dari frontend/types, jaga tetap sama)
```

## Format respons API

```json
{ "success": true, "data": {} }
{ "success": false, "message": "..." }
```

## Endpoint

| Endpoint | Login | Keterangan |
|---|---|---|
| `POST /api/auth/login` | tidak | Body `{ email, password, remember? }`. Mengisi cookie sesi `httpOnly`, mengembalikan `{ user }`. |
| `POST /api/auth/forgot-password` | tidak | Body `{ email }`. Tidak mengirim email sungguhan. |
| `POST /api/auth/logout` | tidak | Menghapus cookie sesi. |
| `GET /api/dashboard` | ya | Statistik, pengunjung terbaru, booking menunggu. |
| `GET /api/visitors/today?q=` | ya | Pengunjung hari ini. `q` (opsional) memfilter nama, domisili, institusi, jenjang. |

Endpoint yang butuh login membalas `401` bila cookie sesi tidak ada atau tidak valid.

## Cara login bekerja

1. Frontend memanggil `POST /api/auth/login`. Backend memeriksa akun dummy dan mengirim cookie `mpu_session` (`httpOnly`, ditandatangani).
2. Frontend menyimpan data user (nama, peran) di `localStorage` hanya untuk tampilan dan untuk memutuskan perlu ke `/login` atau tidak.
3. Setiap request frontend memakai `credentials: "include"`, sehingga cookie ikut terkirim. Backend yang memutuskan akses.
4. Jika backend membalas `401`, frontend menghapus data user dan kembali ke `/login`.

Frontend (`:3000`) dan backend (`:5000`) sama-sama berhost `localhost`, jadi cookie dikirim di antara keduanya. Bila nanti dipasang di domain berbeda, opsi cookie di `backend/src/utils/session.ts` perlu disesuaikan.
