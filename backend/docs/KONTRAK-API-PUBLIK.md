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