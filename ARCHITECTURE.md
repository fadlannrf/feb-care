# Rancangan FEB CARE

## Arsitektur awal

Modular monolith: Next.js App Router + React/TypeScript, API Node.js, PostgreSQL, private object storage, dan worker. Satu basis kode memudahkan audit transaksi dan pembatasan akses; tidak diperlukan microservices sebelum ada kebutuhan operasional yang terbukti.

Browser → web/API → PostgreSQL. Lampiran diakses melalui API terotorisasi, bukan URL publik. Worker menangani eskalasi SLA, pembersihan sesi kedaluwarsa, dan antrean notifikasi. Database outbox menjaga pencatatan notifikasi bersama transaksi tiket.

## Modul data

| Kelompok | Tabel | Fungsi |
|---|---|---|
| Identitas | users, sessions | Akun, peran, unit, sesi yang dapat dicabut |
| Organisasi | units, categories | Unit tujuan, kategori, SLA, jalur sensitif |
| Pengaduan | tickets, events, attachments | Isi laporan, riwayat, bukti privat |
| Layanan | notifications, outbox | Notifikasi internal, pengiriman email dengan retry |
| Tata kelola | audit_logs, rate_limits, app_meta | Audit akses, pembatasan, versi inisialisasi |

Sequence menghasilkan nomor unik; ticket UUID menjadi kunci internal. Kode pelacakan disimpan sebagai SHA-256. Transaksi mencakup perubahan status, event, audit, dan notifikasi. Kolom version mencegah penimpaan perubahan petugas lain. Indeks mencakup pelapor/waktu, unit/status/waktu, kategori/waktu, tenggat aktif, serta full-text GIN untuk judul dan kronologi.

## Akses

| Peran | Akses |
|---|---|
| Mahasiswa | Tiket miliknya; konfirmasi hasil dan penilaian |
| Pelapor anonim | Hanya tiket dengan nomor + kode rahasia |
| Petugas FEB CARE | Triase tiket non-sensitif, penugasan unit |
| Petugas unit | Tiket non-sensitif yang ditugaskan ke unitnya |
| Petugas perlindungan | Tiket sensitif dan penugasan jalur perlindungan |
| Pimpinan | Agregat kinerja dan ekspor tanpa isi laporan/identitas |
| Administrator | Konfigurasi, akses akun, audit, agregat; bukan isi pengaduan |

Pelaporan anonim tidak menyimpan kaitan akun pada tiket maupun aktivitas pelapor. Laporan rahasia berakun tetap terhubung ke pemilik untuk akses pribadi; identitas disamarkan pada tampilan petugas. Pengelola infrastruktur database tetap memiliki akses teknis: perlindungan ini bukan enkripsi end-to-end.

## Siklus laporan

Diterima → Diverifikasi → Ditugaskan → Ditindaklanjuti → Menunggu konfirmasi → Selesai.

Petugas dapat meminta informasi tambahan pada tahap yang diizinkan. Penolakan membutuhkan catatan. Pelapor dapat mengembalikan hasil yang belum memadai ke penanganan sebelum konfirmasi selesai. Tiket selesai bersifat hanya baca kecuali penilaian. Pembukaan kembali setelah selesai, banding formal, serta perpindahan unit setelah penugasan belum tersedia pada UI pilot.

SLA saat ini adalah **jam kalender** sejak pembuatan, berdasarkan kategori; prioritas mendesak maksimal 24 jam. Worker menandai keterlambatan sekali dan memberi notifikasi kepada koordinator/unit berwenang. Ini bukan layanan darurat 24/7; jalur darurat resmi perlu ditetapkan fakultas.

## Menangani data besar

1. Gunakan PostgreSQL managed dengan TLS, backup/PITR, pemantauan query dan PgBouncer bila jumlah instance meningkat. Ukuran pool aplikasi saat ini maksimum 10 koneksi per proses; sesuaikan dengan batas database.
2. Gunakan bucket S3-compatible privat, lifecycle/retensi, enkripsi dan pemindaian malware sebelum download diizinkan. Jangan menyimpan lampiran dalam database atau public directory.
3. Jalankan web stateless beberapa instance di belakang load balancer, worker terpisah. Migrasi skema produksi perlu dipindahkan dari inisialisasi aplikasi ke migration runner berversi yang dijalankan sekali saat rilis.
4. Untuk jutaan tiket: ganti offset pagination dengan cursor, tambahkan materialized daily aggregates untuk dashboard dan pindahkan ekspor besar ke background job. Terapkan berdasarkan hasil EXPLAIN/uji beban, bukan asumsi kapasitas.
5. Tambahkan rate limiting edge/WAF yang menghormati proxy tepercaya. Limit global saat ini konservatif untuk pilot; jangan memakai konfigurasi ini tanpa penyesuaian untuk lalu lintas kampus besar.
6. Pantau p95 latency, error rate, pool saturation, query lambat, SLA backlog, retry/dead-letter email, kapasitas storage, dan keberhasilan backup.

## Sebelum data nyata

- SSO OIDC kampus, validasi afiliasi, penonaktifan otomatis saat hak akses berubah, MFA bagi petugas sensitif, pemulihan akun.
- Threat modeling, pentest, rate-limit/load test, simulasi akses lintas unit, uji restore, kebijakan incident response.
- Ketentuan privasi/retensi resmi kampus; persetujuan, minimisasi data, aturan ekspor, redaksi isi, SOP perlindungan dan eskalasi manusia.
- Pertimbangkan suppress small cells pada agregat sensitif untuk mengurangi risiko identifikasi ulang; saat ini jumlah agregat kategori sensitif masih terlihat pimpinan.
- Malware scanning, validasi isi penuh file (saat ini magic bytes dan batas ukuran), quota per pengguna, pemisahan storage sensitif.
- CSP bernonce/hash untuk menggantikan script unsafe-inline; unsafe-eval hanya diaktifkan dalam pengembangan dan otomatis dihapus pada build produksi.

## Desain interaksi

Manrope lokal, tipografi editorial, ruang lega, satu aksen biru, dan geometri kanvas nonrepresentasional. Light sebagai bawaan; dark dengan pasangan token warna. Menu bernomor memakai dialog native, fokus keyboard, Escape, backdrop blur dan transisi bertahap. Kurva `hop` dan timeline menu mengadaptasi pola dari kode referensi yang pengguna sediakan; Lenis dipaketkan lokal untuk scroll halus, dengan reduced motion tetap dihormati. Hover diterapkan pada kartu, tombol, tautan, sidebar dan baris interaktif tanpa menggeser input. Kanvas berhenti di luar viewport. Tidak ada font atau CDN eksternal untuk menampilkan antarmuka.
