💸 Dompet Pro - Personal Finance PWA

Aplikasi pencatatan keuangan pribadi berbasis web yang fokus pada kecepatan input, pemantauan budget, dan pengelolaan transaksi rutin.
🚀 Tech Stack

    Framework: React 18 (Vite)

    Database & Auth: Supabase (PostgreSQL)

    Styling: Tailwind CSS

    PWA: vite-plugin-pwa (Support Offline & Installable)

    State Management: React Hooks (useState, useEffect, useRef)

🛠️ Database Schema (Supabase)
1. category

    id (uuid, PK)

    name (text)

    type (text: 'pemasukan' / 'pengeluaran')

    icon (text)

    color (text)

    budget (numeric)

    deleted_at (timestamp, nullable)

2. transaction

    id (uuid, PK)

    amount (numeric)

    category_id (uuid, FK)

    note (text, nullable)

    date (date)

    type (text)

    payment_method (text: 'cash' / 'transfer')

    deleted_at (timestamp, nullable)

3. recurring_transactions

    id (uuid, PK)

    billing_date (int: 1-31)

    amount (numeric)

    note (text)

    last_processed_at (text: YYYY-MM)

✨ Core Features

    [x] Single-Gate Transaction: Sistem input dan edit dalam satu komponen (DRY Principle).

    [x] Smart Dashboard: Pantauan budget kritis (>70%) dan ringkasan saldo bank vs dompet.

    [x] Recurring Alerts: Pop-up modal otomatis untuk tagihan bulanan (Netflix, Kos, dll).

    [x] Pro Report: Filter preset tanggal (7 hari, bulan ini, bulan lalu) & Global Search berdasarkan catatan.

    [x] Secure RLS: Row Level Security di Supabase untuk memastikan data antar user tidak bocor.

📦 Installation

    npm install

    Buat file .env dan masukkan VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY.

    npm run dev

Kenapa README ini penting menurut sepuh?

    Database Tracking: Kalau lo mau bikin fitur baru, lo nggak perlu buka Dashboard Supabase cuma buat ngecek nama kolom.

    Onboarding: Kalau suatu saat lo mau share kode ini atau kerja bareng orang lain, mereka langsung paham alur aplikasinya.

    PWA Ready: Gue cantumkan info PWA biar lo inget kalau aplikasi ini bisa di-install di HP kayak aplikasi native.