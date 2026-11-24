# Chimera — Deploy ke URL Publik (langkah HP)

**Rekomendasi: Render (Docker), BUKAN Vercel.**
Alasan: tombol Analyze butuh Slither + solc (program Python/binary) — itu
hanya jalan di Docker. Vercel hanya bisa menampilkan halaman depan saja;
tombol Analyze di Vercel akan gagal. Jadi deploy di Render.

File deploy sudah siap di repo lokal (belum di-push ke GitHub):
`Dockerfile`, `render.yaml`, `vercel.json`, `.dockerignore` + 1 baris
patch di `app/lib/analyzer.js` (SVM_DIR bisa di-set dari env var).

## LANGKAH 0 — Push file deploy ke GitHub (minta Muse, jangan dari HP)

File-file di atas harus ada di github.com/nmhl21/chimera dulu, kalau tidak
Render tidak bisa menemukannya. Bilang ke Muse: **"push file deploy chimera"**.
Muse akan `git add + commit + push`. Setelah itu lanjut langkah 1.

## LANGKAH 1 — Akun Render (gratis, login pakai GitHub)

1. HP: buka **render.com**
2. Tap **Log In** → pilih **GitHub** → login sebagai **nmhl21** → Authorize Render.
3. Tidak perlu kartu kredit untuk plan Free.

## LANGKAH 2 — Buat Web Service dari repo

1. Dashboard Render → tap **New +** → **Blueprint**
2. Pilih repo **nmhl21/chimera** → **Connect** → tap **Apply**.
   (Render membaca `render.yaml`: Docker, plan Free, health check `/`.)
3. Kalau Blueprint tidak muncul: pakai **New + → Web Service** →
   pilih repo → **Runtime: Docker** → **Plan: Free** → **Create Web Service**.

## LANGKAH 3 — Isi API key Gemini (PENTING: jangan dari chat)

1. Masih di Render, buka service **chimera** → tab **Environment**.
2. Tap **Add Environment Variable**:
   - Key: `LLM_API_KEY`
   - Value: key Gemini kamu — ambil dari **aistudio.google.com** di HP:
     buka AI Studio → **Get API key** → copy key yang sudah ada,
     atau **Create API key** baru kalau key lama hilang.
3. Tap **Save Changes**. Render akan restart service otomatis.
4. `LLM_BASE_URL` dan `LLM_MODEL` sudah terisi otomatis dari `render.yaml`.
5. **JANGAN pernah kirim key lewat chat WhatsApp/Telegram** — copy langsung
   dari AI Studio ke kolom Render.

## LANGKAH 4 — Tunggu build + tes

1. Build pertama ~5–10 menit (Render install Slither + solc). Lihat tab **Logs**:
   sukses kalau muncul `Chimera listening on http://localhost:3000`
   (port di dalam container; URL publik beda, lihat langkah 5).
2. URL publik ada di atas halaman service, bentuknya
   `https://chimera-xxxx.onrender.com` — tap untuk buka.
3. Tes: paste alamat `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
   (ETH USDC) → tap Analyze → harus muncul **18 findings** (~15–20 detik).
4. **Catatan plan Free:** service tidur setelah 15 menit tidak dipakai —
   buka pertama setelah tidur butuh ~30–60 detik (cold start). Itu normal.
5. Kirim URL publik itu ke Muse — Muse catat untuk Devpost.

## Kalau gagal

- Logs berisi `Slither failed` → kirim screenshot log ke Muse.
- Logs berisi `triageConfigured` tapi findings tanpa AI triage →
  `LLM_API_KEY` salah/kosong — ulangi Langkah 3.
- Build gagal di `curl ... solc-static-linux` → kirim log ke Muse
  (kemungkinan GitHub release sedang tidak bisa diakses Render).

## Jalur Vercel (TIDAK disarankan)

Hanya kalau mau halaman depan statis saja (tanpa Analyze):
vercel.com → login GitHub nmhl21 → Import Project `chimera` →
**Root Directory: `app/public`** → Deploy. Tombol Analyze akan error
karena Vercel tidak bisa menjalankan Slither — jangan pakai URL ini
untuk Devpost.

## Yang harus tetap hidup

URL harus live + gratis sampai **akhir penjurian 29 Jan 2027**.
Jangan hapus service Render sebelum itu. Tidak ada biaya (plan Free,
750 jam/bulan — cukup untuk 1 service 24/7).
