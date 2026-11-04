# Duitku - Pencatatan Keuangan Pribadi (PWA)

Aplikasi pencatatan keuangan pribadi berbasis web yang berfokus pada kecepatan input, pemantauan anggaran, dan pengelolaan transaksi rutin.

## Tech Stack

- **Framework:** React 19 (Vite 8)
- **Database & Autentikasi:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS 4
- **PWA:** vite-plugin-pwa 2
- **Manajemen State:** React Hooks (useState, useEffect, useRef)

## Skema Database (Supabase)

### 1. `category`

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `name` | text | Nama kategori |
| `type` | text | `pemasukan` atau `pengeluaran` |
| `icon` | text | Emoji ikon kategori |
| `color` | text | Warna identitas |
| `budget` | numeric | Batas anggaran bulanan |
| `deleted_at` | timestamp | Nullable, penanda hapus lunak |

### 2. `transaction`

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `amount` | numeric | Nominal transaksi |
| `category_id` | uuid | Foreign key ke `category` |
| `note` | text | Catatan, nullable |
| `date` | date | Tanggal transaksi |
| `type` | text | `pemasukan`, `pengeluaran`, atau `mutasi` |
| `payment_method` | text | `cash` atau `transfer` |
| `related_id` | uuid | Penghubung dua sisi transaksi mutasi |
| `deleted_at` | timestamp | Nullable, penanda hapus lunak |

### 3. `recurring_transactions`

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `billing_date` | int | Tanggal tagihan, 1-31 |
| `amount` | numeric | Nominal tagihan |
| `note` | text | Nama tagihan |
| `last_processed_at` | text | Format `YYYY-MM` |

### 4. `profiles`

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | uuid | Primary key, terhubung ke pengguna Supabase |
| `payday` | int | Tanggal gajian, 1-31 |

## Fitur Utama

- **Input transaksi terpadu:** Satu komponen menangani pencatatan dan pengubahan transaksi.
- **Dashboard:** Ringkasan saldo, monitoring anggaran kritis, dan progres siklus gajian.
- **Pengingat tagihan rutin:** Dialog otomatis untuk tagihan bulanan yang jatuh tempo.
- **Laporan:** Filter rentang tanggal, kategori, metode pembayaran, dan pencarian catatan.
- **Statistik:** Proporsi per kategori, rata-rata harian, dan kategori terbesar.
- **Penasihat keuangan:** Saran otomatis berbasis anggaran kritis melalui Gemini API.
- **Keamanan data:** Row Level Security Supabase memisahkan data antar pengguna.

## Instalasi

```bash
npm install
```

Buat berkas `.env.local` dan isi variabel berikut:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_APP_API_URL=
```

Untuk fungsi penasihat keuangan, tambahkan juga pada environment server:

```
GEMINI_API_KEY=
GEMINI_API_URL=
```

Jalankan aplikasi:

```bash
npm run dev
```

## Perintah Tersedia

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan server pengembangan |
| `npm run build` | Membuat bundel produksi |
| `npm run preview` | Melihat hasil bundel produksi |
| `npm run lint` | Menjalankan ESLint |
