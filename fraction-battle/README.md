# Fraction Battle — Game Edukasi Pecahan Senilai (100% Static Client-Side)

**Fraction Battle** adalah game edukasi matematika interaktif bertema *battle/turn-based* untuk siswa Sekolah Dasar (khususnya Kelas 4 SD) dalam mempelajari konsep **Pecahan Senilai**. 

Aplikasi ini dirancang dengan arsitektur **100% Static Single-Page Application (Client-Side)**. Seluruh logika permainan berjalan murni di dalam browser pengguna (HTML + CSS + TypeScript/React), **tanpa ketergantungan pada backend server, database eksternal, atau Gemini API saat dimainkan**.

---

## 🎯 Fitur Utama & Logika Lokal

1. **Generator Soal Pecahan Lokal**:
   - Menghasilkan target pecahan dasar secara algoritmik dari *pool* kurikulum SD.
   - Menghitung pecahan senilai melalui kelipatan terstruktur: `(numerator × k) / (denominator × k)`.
2. **Generator Distraktor Matematis**:
   - Menghasilkan kartu pengecoh khusus SD (pengecoh selisih penjumlahan $a+k/b+k$, kelipatan pembilang tanpa kelipatan penyebut, dan pecahan acak non-ekuivalen).
3. **Validasi Pecahan Murni di Browser**:
   - Menggunakan metode perkalian silang: `a * d === b * c`.
4. **Randomisasi Fisher-Yates**:
   - Mengacak posisi kartu di grid, urutan pemain, dan urutan soal secara lokal tanpa data statis yang dapat ditebak.
5. **Multi-Level Grid Ukuran**:
   - **Level 1 (Mudah)**: Grid $8 \times 8$ (64 kartu) — Timer 30 detik.
   - **Level 2 (Sedang)**: Grid $10 \times 10$ (100 kartu) — Timer 25 detik.
   - **Level 3 (Tantangan)**: Grid $12 \times 12$ (144 kartu) — Timer 20 detik.
6. **Turn-Based Multiplayer (1–8 Pemain)**:
   - Manajemen giliran (*pass-and-play*) dengan jeda pergantian pemain yang menjaga kerahasiaan papan soal.
7. **Sistem Penilaian & Leaderboard Real-Time**:
   - Skor benar (+10), salah (-5), bonus sapu bersih (+10), bonus ketelitian 100% (+10), dan streak multiplier.
   - Klasemen peringkat dihitung dan diurutkan otomatis dari state browser.
8. **Refleksi & Pembahasan Edukatif**:
   - Memberikan penjelasan langkah demi langkah mengapa suatu pecahan senilai atau tidak senilai sesuai kaidah matematika dasar.
9. **Asesmen & Ekspor Data Guru**:
   - Kategori penguasaan (*Sangat Baik*, *Baik*, *Mulai Menguasai*, *Perlu Latihan*).
   - Ekspor rekap nilai siswa ke format CSV/Excel langsung dari memori browser (Blob URL).
10. **Audio Synthesizer Mandiri**:
    - Efek suara interaktif dibangkitkan langsung melalui **Web Audio API** bawaan browser tanpa perlu mengunduh file audio MP3/WAV eksternal.

---

## 🚀 Panduan Penggunaan & Deployment

### 1. Cara Menjalankan Game (Development Mode)

Pastikan **Node.js** (versi 18 ke atas) telah terpasang di komputer Anda.

```bash
# 1. Install dependencies
npm install

# 2. Jalankan development server lokal
npm run dev
```

Buka browser di alamat: **`http://localhost:3000`** (atau URL yang ditampilkan di terminal).

---

### 2. Cara Melakukan Build (Static Production Build)

Untuk menghasilkan file statis siap hosting:

```bash
npm run build
```

Perintah di atas akan mengompilasi seluruh kode TypeScript, React, dan Tailwind CSS ke dalam folder **`dist/`** yang berisi file HTML, JS, dan CSS murni yang telah di-minifikasi.

---

### 3. Folder/File yang Diperlukan untuk Deployment

Untuk meng-hosting aplikasi di server statis mana pun, Anda **HANYA MEMERLUKAN** isi dari folder:

```
dist/
├── index.html        # Entry point utama aplikasi
└── assets/           # File bundle JavaScript dan CSS statis
```

> **Catatan**: Folder `src/`, `node_modules/`, `package.json`, dsb. **TIDAK PERLU** diunggah ke server hosting publik. Cukup unggah isi folder `dist/`.

---

### 4. Cara Menjalankan Hasil Build sebagai Static Website

Anda dapat meng-hosting atau menjalankan folder `dist/` menggunakan opsi hosting statis apa pun:

#### A. Menjalankan secara Lokal / Preview
```bash
# Opsi 1: Menggunakan Vite Preview
npm run preview

# Opsi 2: Menggunakan npx serve
npx serve dist -p 3000

# Opsi 3: Menggunakan Python built-in server
cd dist && python3 -m http.server 8080
```

#### B. Hosting Gratis di Platform Static Web:
- **Vercel**: Hubungkan repository GitHub dan pilih Framework: *Vite* (Output Directory: `dist`).
- **Netlify**: *Drag and drop* folder `dist/` ke dashboard Netlify atau atur Publish Directory ke `dist`.
- **GitHub Pages**: Konfigurasikan GitHub Actions untuk men-deploy folder `dist/`.
- **Cloudflare Pages**: Pilih preset *Vite* dengan Build command `npm run build` dan Output directory `dist`.
- **Firebase Hosting**: Jalankan `firebase deploy` dengan public directory diarahkan ke `dist`.
- **Nginx / Apache**: Salin seluruh isi folder `dist/*` ke root directory web server (misal `/var/www/html/`).

---

## 🔒 Konfigurasi & Keamanan (Zero-API Key)

- **Tidak Memerlukan API Key**: Tidak ada file `.env`, token rahasia, atau kredensial yang dibutuhkan untuk menjalankan gameplay.
- **Offline Capable**: Game dapat berjalan penuh meskipun koneksi internet terputus setelah aset web awal berhasil dimuat di browser.
