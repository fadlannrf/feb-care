# FEB CARE

**Complaints, Assistance, Response & Engagement**  
Suara Mahasiswa, Aksi Nyata FEB.

Aplikasi layanan mahasiswa dengan halaman publik, pengiriman laporan, pelacakan privat, dashboard enam peran, dan administrasi. Proyek berdiri sendiri; tidak mengubah web portofolio.

## Menjalankan

Node.js 22.13+ dan pnpm, lalu `pnpm install` dan `pnpm dev`.

Buka **http://localhost:3002**. Halaman **Masuk → Jelajahi demo** menyediakan Mahasiswa, Petugas FEB CARE, Petugas unit, Petugas perlindungan, Pimpinan, dan Administrator. Data contoh ditandai sebagai simulasi. Kode akses tiket contoh: `DEMO-CARE-2026`; nomor tiket dapat dilihat di dashboard.

Mode bawaan **light**, dapat diganti melalui ikon bulan/matahari. Preferensi tersimpan di perangkat, tidak mengikuti tema sistem secara otomatis. Animasi mengikuti preferensi reduced motion.

## Fitur yang berjalan

- Formulir tiga tahap, 12 kategori, prioritas, lampiran PDF/JPG/PNG/WebP, persetujuan, pilihan anonim atau rahasia.
- Nomor tiket unik dari sequence database; kode akses rahasia hanya ditampilkan saat pembuatan, disimpan sebagai hash, tidak dimasukkan dalam URL.
- Verifikasi, penugasan unit, kebutuhan informasi tambahan, penanganan, konfirmasi mahasiswa, dan penilaian.
- Diskusi dua arah; catatan internal terpisah dan tidak ditampilkan ke pelapor.
- Pembatasan akses server per peran/unit; laporan sensitif khusus petugas perlindungan. Pimpinan/admin hanya mendapatkan rekap agregat, bukan isi pengaduan.
- Pencarian, filter, pagination, statistik dari database, tren, rekap unit, ekspor CSV agregat.
- Notifikasi internal, antrean email dengan retry, eskalasi SLA, jejak audit, akun/unit/kategori/SLA.
- Validasi server, session cookie HttpOnly, hash kata sandi scrypt, origin check, rate limit, upload privat, optimistic locking.

## Database dan penyimpanan

**Produksi: PostgreSQL server**, melalui `DATABASE_URL`. **Preview lokal: PGlite** (PostgreSQL embedded) di memori secara default; isi `DATA_DIR` bila ingin menyimpan database ke disk. PGlite hanya untuk pengembangan satu proses, bukan deployment berskala besar.

Lampiran lokal berada di `data/uploads`, tidak di folder publik. Driver S3-compatible privat tersedia melalui `STORAGE_DRIVER=s3` beserta konfigurasi `.env.example`. Driver S3 belum diuji terhadap bucket nyata karena kredensial belum disediakan.

## Produksi

1. Salin `.env.example` ke `.env.local`; gunakan PostgreSQL terpisah dan `APP_URL` HTTPS sesuai domain.
2. Isi `ADMIN_EMAIL` dan kata sandi awal kuat `ADMIN_PASSWORD`, lalu hapus konfigurasi bootstrap setelah akun dibuat. Atur akun petugas melalui administrator.
3. Jalankan `pnpm build`, kemudian `pnpm start` di belakang reverse proxy HTTPS. `start` mendengarkan localhost:3002. Jangan membuka dev server ke publik.
4. Jalankan `pnpm worker` sebagai layanan terpisah dengan `NODE_ENV=production`, env dan versi rilis yang sama. Worker wajib memakai PostgreSQL server; jangan membuka file PGlite dari dua proses.
5. Konfigurasi penyimpanan privat, backup terenkripsi, pemulihan, monitoring, dan kanal notifikasi.

Demo otomatis **nonaktif di production**. Production menolak startup layanan database tanpa `DATABASE_URL`. Untuk preview non-demo: `DISABLE_DEMO=true` (database demo lama tetap berisi data simulasi; gunakan database baru untuk produksi).

Email: `EMAIL_WEBHOOK_URL` HTTPS dan `EMAIL_WEBHOOK_TOKEN` digunakan worker untuk mengirim `{to,subject,text,idempotencyKey}`. Penerima webhook harus benar-benar mengirim email serta menghormati idempotency key. Tanpa konfigurasi, notifikasi internal tetap bekerja, tetapi **email tidak terkirim**. WhatsApp dan SSO belum diintegrasikan.

## Pengujian

`pnpm typecheck` · `pnpm test` · `pnpm test:integration` · `pnpm build`

Integrasi berjalan di localhost:3102, memakai database baru `data/integration-*` dan output `.next-test`. Tidak memakai database preview utama. Data pengujian disimpan agar kegagalan bisa diperiksa. Jangan menjalankan dua pengujian integrasi bersamaan.

## Batas penerapan saat ini

Ini fondasi aplikasi fungsional untuk pengembangan/pilot, **belum persetujuan untuk memproses pengaduan nyata berskala besar**. Masih perlu: SSO/verifikasi email dan pemulihan akun, pemindaian malware upload, kebijakan retensi dan persetujuan resmi kampus, prosedur insiden/pendampingan, uji beban PostgreSQL, backup-restore drill, serta security review independen. Akun mahasiswa lokal belum memverifikasi afiliasi kampus. Jangan masukkan data pribadi nyata dalam lingkungan demo.

Detail rancangan dan jalur peningkatan kapasitas: [ARCHITECTURE.md](ARCHITECTURE.md).
