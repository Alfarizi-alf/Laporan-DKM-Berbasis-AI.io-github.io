Aplikasi Perencanaan Perbaikan Strategis (PPS) Akreditasi Berbasis AIAplikasi web ini adalah alat bantu canggih yang dirancang untuk membantu institusi (seperti Puskesmas atau fasilitas kesehatan lainnya) dalam mempersiapkan dokumen akreditasi. Aplikasi ini memanfaatkan kecerdasan buatan (AI) dari Google untuk mengisi Rencana Perbaikan (RTL), Indikator, Sasaran, hingga membuat judul dokumen bukti implementasi secara otomatis berdasarkan data yang diunggah dari file Excel.✨ Fitur UtamaUnggah File Excel: Unggah data elemen penilaian dalam format .xlsx atau .csv.Generasi Konten dengan AI: Buat Rencana Perbaikan (RTL), Indikator, Sasaran, dan Keterangan/Bukti Implementasi secara otomatis dengan satu klik.Generasi Massal: Proses semua item sekaligus untuk efisiensi maksimal, dilengkapi dengan progress bar.Inventaris & Pengelompokan Dokumen: Dapatkan daftar dokumen unik yang perlu disiapkan, lengkap dengan pengelompokan berdasarkan jenisnya (SK, SOP, Laporan, dll.).Kesimpulan & Saran Strategis AI: Minta AI untuk menganalisis seluruh data dan memberikan ringkasan strategis untuk area perbaikan.Penyimpanan Cloud: Terintegrasi dengan Google Firebase untuk menyimpan kemajuan Anda secara otomatis.Unduh Hasil: Ekspor semua data yang telah diolah ke dalam format Excel (.xlsx), Word (.doc), CSV, atau Teks.🚀 Teknologi yang DigunakanFrontend: React.js (dimuat melalui CDN)Styling: Tailwind CSS (dimuat melalui CDN)Database & Otentikasi: Google Firebase (Firestore & Authentication)AI: Google Generative AI (Gemini 2.0 Flash)Ikon: Lucide React🔧 Cara Menjalankan Secara LokalProyek ini dirancang agar bisa berjalan tanpa perlu proses build yang rumit (seperti Node.js atau Webpack).Clone Repositori:git clone [URL-REPOSITORI-ANDA]
Buka index.html:Cukup buka file index.html di browser web modern pilihan Anda (seperti Chrome, Firefox, atau Edge).⚙️ Konfigurasi Firebase (Penting)Agar fitur penyimpanan cloud berfungsi, Anda perlu mengatur konfigurasi Firebase Anda sendiri.Buat Proyek Firebase: Kunjungi Firebase Console dan buat proyek baru.Buat Aplikasi Web: Di dalam proyek Anda, buat aplikasi web baru.Dapatkan Konfigurasi: Salin objek konfigurasi Firebase (variabel firebaseConfig) yang diberikan.Aktifkan Firestore & Authentication:Di menu Build > Firestore Database, buat database baru dalam mode produksi.Di menu Build > Authentication, aktifkan metode masuk Anonymous.Perbarui Aturan Keamanan Firestore: Buka tab Rules di Firestore dan gunakan aturan berikut untuk mengizinkan pengguna yang terautentikasi untuk membaca dan menulis data mereka sendiri:rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Izinkan pengguna membaca/menulis data mereka sendiri di dalam koleksi artifacts
    match /artifacts/{appId}/users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
Masukkan Konfigurasi ke index.html:Buka file index.html dan cari baris berikut. Ganti dengan konfigurasi Firebase Anda.<!-- GANTI DENGAN KONFIGURASI FIREBASE ANDA -->
<script>
  const __firebase_config = JSON.stringify({
    apiKey: "AIza...",
    authDomain: "...",
    projectId: "...",
    storageBucket: "...",
    messagingSenderId: "...",
    appId: "..."
  });
  const __app_id = "pps-accreditation-app"; // Anda bisa mengganti ini jika mau
</script>
Penting: Variabel __initial_auth_token tidak perlu Anda isi. Aplikasi ini akan menggunakan login anonim jika token tersebut tidak tersedia.🔑 Konfigurasi Kunci API Google AIUntuk menggunakan fitur AI, setiap pengguna harus memasukkan Kunci API Google AI mereka sendiri di antarmuka aplikasi.Kunjungi Google AI Studio.Buat Kunci API baru di proyek Google Cloud Anda.Salin kunci tersebut dan tempelkan di kolom yang tersedia di dalam aplikasi.
