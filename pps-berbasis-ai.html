import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
// We will load XLSX library dynamically from a CDN to resolve the import error.
import { UploadCloud, FileText, BrainCircuit, LoaderCircle, AlertTriangle, ChevronRight, CheckCircle, ArrowRight, Download, Lightbulb, Zap, XCircle } from 'lucide-react';

// Impor modul Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, onSnapshot, collection, query, where, addDoc, getDocs, updateDoc } from 'firebase/firestore';


// Fungsi pembantu untuk memuat skrip XLSX secara dinamis dari CDN
const loadXlsxScript = () => {
  return new Promise((resolve, reject) => {
    if (window.XLSX) return resolve();
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Gagal memuat pustaka Excel. Periksa koneksi internet Anda.'));
    document.head.appendChild(script);
  });
};

// Custom Alert/Message Modal Component (Menggantikan window.alert)
const MessageModal = ({ message, type, onClose }) => {
  if (!message) return null;

  const bgColor = type === 'error' ? 'bg-red-800' : 'bg-blue-800';
  const textColor = type === 'error' ? 'text-red-100' : 'text-blue-100';
  const borderColor = type === 'error' ? 'border-red-700' : 'border-blue-700';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-lg shadow-xl p-6 border ${bgColor} ${borderColor} max-w-sm w-full mx-auto animate-fade-in`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-lg font-bold ${textColor}`}>Pesan</h3>
          <button onClick={onClose} className="text-white hover:text-gray-300">
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        <p className={`text-sm ${textColor} mb-4`}>{message}</p>
        <div className="text-right">
          <button onClick={onClose} className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500 transition-colors duration-200">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};


// Komponen Aplikasi Utama
export default function App() {
  const [apiKey, setApiKey] = useState('');
  const [rawData, setRawData] = useState(null);
  const [groupedData, setGroupedData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState(''); // Untuk pesan kesalahan umum di UI
  const [loadingStates, setLoadingStates] = useState({}); // Untuk indikator loading per item/fungsi
  const [isProcessingFile, setIsProcessingFile] = useState(false); // Untuk indikator loading file
  const [downloadFormat, setDownloadFormat] = useState('xlsx');
  const [openStates, setOpenStates] = useState({}); // Untuk mengontrol status buka/tutup bagian UI
  const [aiSummary, setAiSummary] = useState(''); // Untuk ringkasan AI
  const [isSummaryLoading, setIsSummaryLoading] = useState(false); // Untuk indikator loading ringkasan AI
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0, message: '' }); // Untuk progress bar generasi massal
  const [documentInventory, setDocumentInventory] = useState(null); // Status untuk inventaris dokumen yang diratakan
  const [groupedDocumentsByTypeForDisplay, setGroupedDocumentsByTypeForDisplay] = useState(null); // Status untuk tampilan UI dokumen yang dikelompokkan
  const [isApiKeyInvalid, setIsApiKeyInvalid] = useState(false); // Status baru untuk kesalahan validasi Kunci API

  // Status baru untuk mengontrol visibilitas inventaris dan dokumen yang dikelompokkan
  const [showDocumentInventory, setShowDocumentInventory] = useState(false);
  const [showDocumentGrouping, setShowDocumentGrouping] = useState(false);
  const [modalMessage, setModalMessage] = useState({ message: '', type: '' }); // State untuk pesan modal (menggantikan alert)
  const [batchResult, setBatchResult] = useState(null); // State untuk menampilkan hasil batch generate (sukses/gagal)

  // Status Firebase
  const [db, setDb] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false); // Untuk melacak status otentikasi Firebase


  // --- Inisialisasi dan Otentikasi Firebase ---
  useEffect(() => {
    try {
      const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
      if (!firebaseConfig) {
        console.error("Konfigurasi Firebase tidak ditemukan. Persistensi tidak akan berfungsi.");
        setModalMessage({ message: "Konfigurasi Firebase tidak ditemukan. Fitur penyimpanan data tidak akan berfungsi.", type: 'error' });
        setIsAuthReady(true); // Tandai sebagai siap meskipun ada kesalahan konfigurasi
        return;
      }

      const app = initializeApp(firebaseConfig);
      const firestoreDb = getFirestore(app);
      const auth = getAuth(app);

      setDb(firestoreDb);

      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setUserId(user.uid);
          console.log("Pengguna terautentikasi:", user.uid);
        } else {
          // Masuk secara anonim jika tidak ada pengguna yang ditemukan dan tidak ada token awal yang diberikan
          try {
            const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
            if (initialAuthToken) {
              await signInWithCustomToken(auth, initialAuthToken);
              console.log("Masuk dengan token kustom.");
            } else {
              await signInAnonymously(auth);
              console.log("Masuk secara anonim.");
            }
          } catch (authError) {
            console.error("Kesalahan Otentikasi Firebase:", authError);
            setModalMessage({ message: `Gagal otentikasi Firebase: ${authError.message}`, type: 'error' });
          }
        }
        setIsAuthReady(true); // Upaya otentikasi selesai
      });

      return () => unsubscribe(); // Cleanup listener saat komponen di-unmount
    } catch (e) {
      console.error("Kesalahan saat menginisialisasi Firebase:", e);
      setModalMessage({ message: `Gagal menginisialisasi Firebase: ${e.message}`, type: 'error' });
      setIsAuthReady(true);
    }
  }, []); // Jalankan sekali saat komponen dipasang

  // --- Penyimpanan Data Firestore (Debounced) ---
  const saveToFirestore = useCallback(async (dataToSave, currentFileName, currentUserId) => {
    if (!db || !currentUserId || !currentFileName) {
      console.warn("Melewatkan penyimpanan: Firebase belum siap, pengguna tidak dikenal, atau nama file hilang.");
      return;
    }
    // Mencegah penyimpanan jika tidak ada data yang berarti atau jika itu adalah status awal kosong
    if (Object.keys(dataToSave).length === 0 && !aiSummary) {
      return;
    }
    
    // Menggunakan __app_id untuk koleksi tingkat atas yang spesifik untuk aplikasi ini
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    // Path: /artifacts/{appId}/users/{userId}/{your_collection_name}/{documentId}
    const docRef = doc(db, `artifacts/${appId}/users/${currentUserId}/pps_data`, currentFileName);
    
    try {
      await setDoc(docRef, {
        groupedData: dataToSave,
        aiSummary: aiSummary, // Juga simpan ringkasan AI
        timestamp: new Date(),
      }, { merge: true }); // Gunakan merge untuk menghindari penimpaan bidang lain jika ada
      console.log("Data berhasil disimpan ke Firestore!");
    } catch (e) {
      console.error("Kesalahan saat menyimpan ke Firestore:", e);
      // Opsional, atur status kesalahan di sini, tetapi jangan blokir UI
      setError(`Gagal menyimpan ke cloud: ${e.message}`);
    }
  }, [db, aiSummary]); // Ketergantungan pada db dan aiSummary

  // Efek untuk memicu penyimpanan saat groupedData atau aiSummary berubah dan Firebase siap
  useEffect(() => {
    if (isAuthReady && userId && fileName && groupedData) {
      // Debounce operasi penyimpanan untuk menghindari terlalu banyak penulisan
      const handler = setTimeout(() => {
        saveToFirestore(groupedData, fileName, userId);
      }, 1000); // Simpan 1 detik setelah groupedData stabil

      return () => {
        clearTimeout(handler);
      };
    }
  }, [groupedData, aiSummary, userId, fileName, isAuthReady, saveToFirestore]);


  const toggleOpen = (id) => setOpenStates(prev => ({ ...prev, [id]: !prev[id] }));

  // Fungsi untuk memproses data mentah menjadi hierarki terstruktur
  const processData = (data) => {
    const groups = {};
    data.forEach((row, index) => {
      // Membersihkan nama kolom dan mengubahnya menjadi huruf kecil
      const cleanedRow = Object.keys(row).reduce((acc, key) => {
          acc[key.trim().toLowerCase().replace(/\s+/g, '')] = row[key];
          return acc;
      }, {});
      
      // Mencari kunci kolom yang berisi kode hierarki
      const codeKey = Object.keys(cleanedRow).find(k => k.includes('babstandarkriteriaelemenpenilaian') || k.includes('kodeep') || k.includes('kode'));
      if (!codeKey || !cleanedRow[codeKey]) {
        console.warn(`Melewatkan baris ${index}: Kolom kode hierarki tidak ditemukan atau kosong.`);
        return;
      }

      const code = String(cleanedRow[codeKey]);
      const parts = code.split('.');
      if (parts.length < 4) {
        console.warn(`Melewatkan baris ${index}: Kode hierarki tidak valid (kurang dari 4 bagian): ${code}`);
        return;
      }
      
      // Memecah kode hierarki menjadi bagian-bagian
      const [bab, standar, kriteria, ...epParts] = parts;
      const ep = epParts.join('.'); // Menggabungkan kembali bagian EP

      // Membangun struktur hierarki
      if (!groups[bab]) groups[bab] = { title: `BAB ${bab}`, standards: {} };
      if (!groups[bab].standards[standar]) groups[bab].standards[standar] = { title: `Standar ${standar}`, criterias: {} };
      if (!groups[bab].standards[standar].criterias[kriteria]) {
        groups[bab].standards[standar].criterias[kriteria] = { title: `Kriteria ${kriteria}`, items: [] };
      }
      
      // Mengisi data item dari baris Excel
      const itemData = {
        id: `${code}-${index}`, // ID unik untuk setiap item
        kode_ep: code,
        uraian_ep: cleanedRow['uraianelemenpenilaian'] || '',
        rekomendasi_survey: cleanedRow['rekomendasihasilsurvey'] || '',
        rencana_perbaikan: cleanedRow['rencanaperbaikan'] || '',
        indikator: cleanedRow['indikatorpencapaian'] || cleanedRow['indikator'] || '',
        sasaran: cleanedRow['sasaran'] || '',
        waktu: cleanedRow['waktupenyelesaian'] || cleanedRow['waktu'] || '',
        pj: cleanedRow['penanggungjawab'] || cleanedRow['pj'] || '',
        keterangan: "Klik 'Buat Keterangan'", // Placeholder default
      };
      groups[bab].standards[standar].criterias[kriteria].items.push(itemData);
    });
    return groups;
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    setError(''); setRawData(null); setGroupedData(null); setFileName(''); setAiSummary(''); setDocumentInventory(null); setGroupedDocumentsByTypeForDisplay(null); setIsApiKeyInvalid(false); setShowDocumentInventory(false); setShowDocumentGrouping(false); setModalMessage({ message: '', type: '' }); setBatchResult(null); // Bersihkan semua status sebelumnya
    setIsProcessingFile(true);
    const file = acceptedFiles[0];
    if (!file) { setModalMessage({ message: "File tidak valid.", type: 'error' }); setIsProcessingFile(false); return; }
    setFileName(file.name); // Atur nama file segera

    try {
      await loadXlsxScript(); // Pastikan pustaka XLSX dimuat
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const workbook = window.XLSX.read(event.target.result, { type: 'binary' });
          const sheetName = workbook.SheetNames[0]; // Ambil nama sheet pertama
          const jsonData = window.XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {defval: ""}); // Konversi sheet ke JSON
          if(jsonData.length === 0) { 
            setModalMessage({ message: "File Excel kosong atau formatnya tidak bisa dibaca.", type: 'error' }); 
            setRawData(null); // Pastikan rawData direset
            return; 
          }
          setRawData(jsonData); 
          // handleViewHierarchy akan dipanggil oleh efek saat rawData diatur, termasuk pemuatan dari Firestore.
        } catch (e) { 
          setModalMessage({ message: "Terjadi kesalahan saat memproses file Excel. Pastikan format file benar.", type: 'error' });
          console.error("Kesalahan pemprosesan file:", e);
        } finally { 
          setIsProcessingFile(false); 
        }
      };
      reader.onerror = () => { 
        setModalMessage({ message: "Gagal membaca file. Izin mungkin tidak diberikan atau file rusak.", type: 'error' }); 
        setIsProcessingFile(false); 
      }
      reader.readAsBinaryString(file);
    } catch (err) { 
      setModalMessage({ message: err.message, type: 'error' }); 
      setIsProcessingFile(false); 
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'text/csv': ['.csv'] }, disabled: isProcessingFile });

  // Efek ini akan berjalan saat rawData, userId, db, atau isAuthReady berubah
  // Ini bertanggung jawab untuk memproses data dan memuat data yang ada dari Firestore
  useEffect(() => {
    const loadAndProcess = async () => {
      // Pastikan semua prasyarat terpenuhi sebelum memproses dan memuat dari Firestore
      if (!rawData || !isAuthReady || !userId || !db || !fileName) {
        console.log("Melewatkan pemuatan dan pemprosesan dari Firestore: prasyarat tidak terpenuhi.", { rawData, isAuthReady, userId, db, fileName });
        return;
      }

      setGenerationProgress({ current: 0, total: 0, message: 'Memproses data dan memuat dari cloud...' });
      setError(''); // Hapus kesalahan sebelumnya

      try {
        let processedData = processData(rawData);
        if (Object.keys(processedData).length === 0) {
            setError("Data tidak dapat diproses. Pastikan file Anda memiliki kolom kode hierarki yang valid.");
            setRawData(null); 
            setGenerationProgress({ current: 0, total: 0, message: '' });
            return;
        }

        // Coba memuat data yang ada dari Firestore untuk file dan pengguna ini
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const docRef = doc(db, `artifacts/${appId}/users/${userId}/pps_data`, fileName);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log("Data yang ada ditemukan di Firestore untuk file:", fileName);
          const savedData = docSnap.data();
          const savedGroupedData = savedData.groupedData;
          const savedAiSummary = savedData.aiSummary;
          console.log("Ringkasan AI dimuat dari Firestore:", savedAiSummary);

          // Gabungkan data yang disimpan ke dalam data yang baru diproses
          // Kami hanya akan menimpa bidang yang disimpan jika ada di data yang baru diproses
          for (const babKey in processedData) {
            if (savedGroupedData && savedGroupedData[babKey]) {
              for (const stdKey in processedData[babKey].standards) {
                if (savedGroupedData[babKey].standards[stdKey]) {
                  for (const kriKey in processedData[babKey].standards[stdKey].criterias) {
                    if (savedGroupedData[babKey].standards[stdKey].criterias[kriKey]) {
                      processedData[babKey].standards[stdKey].criterias[kriKey].items = 
                        processedData[babKey].standards[stdKey].criterias[kriKey].items.map(newItem => {
                          const existingItem = savedGroupedData[babKey].standards[stdKey].criterias[kriKey].items.find(si => si.id === newItem.id);
                          // Gabungkan hanya bidang yang diinginkan dari existingItem jika ada
                          if (existingItem) {
                            return { 
                              ...newItem, // Pertahankan data asli dari file
                              rencana_perbaikan: existingItem.rencana_perbaikan || newItem.rencana_perbaikan,
                              indikator: existingItem.indikator || newItem.indikator,
                              sasaran: existingItem.sasaran || newItem.sasaran,
                              keterangan: existingItem.keterangan || newItem.keterangan,
                              waktu: existingItem.waktu || newItem.waktu, // Pastikan waktu dan PJ juga digabungkan
                              pj: existingItem.pj || newItem.pj,
                            };
                          }
                          return newItem;
                        });
                    }
                  }
                }
              }
            }
          }
          setAiSummary(savedAiSummary || ''); // Muat ringkasan yang disimpan
        } else {
          console.log("Tidak ada data yang ada ditemukan di Firestore untuk file:", fileName);
          setAiSummary(''); // Hapus ringkasan jika tidak ada data yang disimpan
        }
        setGroupedData(processedData); // Atur data yang sudah diproses atau digabungkan
        setGenerationProgress({ current: 0, total: 0, message: '' });
      } catch (e) { 
        setError("Terjadi kesalahan saat membuat hierarki atau memuat data dari cloud."); 
        console.error("Kesalahan pemprosesan hierarki atau pemuatan Firestore:", e);
        setGenerationProgress({ current: 0, total: 0, message: '' });
      }
    };

    if (rawData && isAuthReady && userId && db && fileName) {
      loadAndProcess();
    }
  }, [rawData, userId, db, isAuthReady, fileName]); // Ketergantungan penting

  // Fungsi untuk memperbarui status item dalam groupedData (immutable update)
  const updateItemState = useCallback((itemId, field, value) => {
    setGroupedData(prevGroupedData => {
      // Pastikan prevGroupedData tidak null atau undefined
      if (!prevGroupedData) return prevGroupedData;

      // Membuat salinan mendalam (deep copy) dari groupedData agar perubahan tidak mempengaruhi objek aslinya
      const newGroupedData = JSON.parse(JSON.stringify(prevGroupedData));

      for (const babKey in newGroupedData) {
        const bab = newGroupedData[babKey];
        
        for (const stdKey in bab.standards) {
          const standard = bab.standards[stdKey];
          
          for (const kriKey in standard.criterias) {
            const criteria = standard.criterias[kriKey];
            
            const itemIndex = criteria.items.findIndex(i => i.id === itemId);
            if (itemIndex > -1) {
              criteria.items[itemIndex][field] = value;
              return newGroupedData; // Mengembalikan state yang diperbarui
            }
          }
        }
      }
      // Jika item tidak ditemukan, kembalikan state sebelumnya
      return prevGroupedData;
    });
  }, []); // Dependensi kosong karena fungsi ini hanya memodifikasi state melalui setGroupedData

  // Fungsi untuk memanggil Google AI API
  const callAiApi = async (prompt) => {
    if (!apiKey) {
      setIsApiKeyInvalid(true); // Atur status kunci API tidak valid untuk visual feedback
      throw new Error("API_KEY_MISSING"); // Lempar error untuk ditangkap di atas
    }
    setIsApiKeyInvalid(false); // Setel ulang status tidak valid jika kunci API ada
    
    // Log 4 karakter terakhir dari API Key untuk debugging (jangan pernah log seluruh key)
    console.log("Mencoba memanggil AI API dengan kunci (4 karakter terakhir):", apiKey.slice(-4));
    const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
    let response;
    try {
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, { 
            method: 'POST', 
            mode: 'cors', // Penting untuk permintaan lintas-asal
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(payload) 
        });
    } catch (networkError) {
        console.error("Kesalahan Jaringan selama fetch:", networkError);
        throw new Error("NETWORK_ERROR"); // Lempar error jaringan
    }

    if (!response.ok) {
      const errorBody = await response.json();
      if (response.status === 429) return 'RATE_LIMIT'; // Indikasikan batas kecepatan
      if (response.status === 400) {
        // Cek pesan kesalahan spesifik untuk kunci API tidak valid
        if (errorBody?.error?.message.includes("API key not valid")) {
          setIsApiKeyInvalid(true); // Atur status kunci API tidak valid
          throw new Error("API_KEY_INVALID"); // Lempar error spesifik
        }
        throw new Error(`Permintaan Buruk (400): ${errorBody?.error?.message || 'Permintaan tidak valid.'}`);
      }
      throw new Error(`Kesalahan HTTP! status: ${response.status} - ${errorBody?.error?.message || 'Tidak dikenal.'}`);
    }
    const result = await response.json();
    if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
        return result.candidates[0].content.parts[0].text.trim().replace(/^"|"$/g, ''); // Hapus tanda kutip di awal/akhir
    }
    return "Respons AI tidak valid."; // Jika struktur respons tidak seperti yang diharapkan
  };

  // Fungsi untuk menampilkan pesan kesalahan menggunakan modal kustom
  const handleApiError = (e) => {
    let message = `Gagal menghubungi AI: ${e.message}`;
    if (e.message === "API_KEY_INVALID") {
        message = "Kunci API tidak valid. Harap periksa kembali kunci API dari Google AI Studio dan coba lagi.";
        setIsApiKeyInvalid(true); // Pastikan status diatur agar input berwarna merah
    } else if (e.message === "API_KEY_MISSING") {
        message = "Harap masukkan Kunci API Google AI Anda terlebih dahulu.";
        setIsApiKeyInvalid(true); // Pastikan status diatur
    } else if (e.message === "NETWORK_ERROR") {
        message = "Gagal terhubung ke server AI. Mohon periksa koneksi internet Anda dan pastikan tidak ada pemblokir iklan (ad-blocker) atau firewall yang aktif.";
    } else if (e.message.includes("HTTP error!")) {
        message = `Kesalahan server AI: ${e.message}. Coba lagi nanti.`;
    }
    setModalMessage({ message, type: 'error' }); // Tampilkan kesalahan menggunakan modal
    console.error("Kesalahan API yang ditangani:", e); // Log kesalahan ke konsol
  };

  // Pembantu untuk membersihkan string input AI dari placeholder atau pesan kesalahan
  const cleanAiInput = (text) => {
    if (typeof text !== 'string' && text !== null && text !== undefined) {
      text = String(text); // Konversi ke string jika bukan string
    }
    if (!text) return ''; // Tangani null, undefined, string kosong setelah konversi
    const cleaned = text.trim();
    // Hapus pesan placeholder/kesalahan yang mungkin dihasilkan AI sebelumnya
    if (cleaned.includes('Klik \'Buat Keterangan\'') || 
        cleaned.includes('Gagal diproses') || 
        cleaned.includes('Input data tidak siap') ||
        cleaned.includes('Batas permintaan AI tercapai') ||
        cleaned.includes('Data tidak cukup') ||
        cleaned.includes('Gagal setelah beberapa percobaan')) {
        return '';
    }
    return cleaned;
  };

  // Fungsi untuk membuat Keterangan (Bukti Implementasi) menggunakan AI
  const handleGenerateKeterangan = async (item) => {
    // Sanitasi input sebelum dikirim ke AI
    const cleanedRencanaPerbaikan = cleanAiInput(item.rencana_perbaikan);
    const cleanedIndikator = cleanAiInput(item.indikator);
    const cleanedSasaran = cleanAiInput(item.sasaran);

    if (!cleanedRencanaPerbaikan && !cleanedIndikator && !cleanedSasaran) {
        // Perbarui status item langsung di UI untuk memberikan feedback instan
        updateItemState(item.id, 'keterangan', 'Input data tidak siap (isi RTL/Indikator/Sasaran)');
        return;
    }
    // Set status loading untuk item spesifik ini
    setLoadingStates(prev => ({ ...prev, [item.id + '_ket']: true }));
    const prompt = `PERAN: Anda adalah auditor akreditasi. TUGAS: Buatkan satu judul DOKUMEN BUKTI IMPLEMENTASI yang konkret berdasarkan data berikut. DATA: - Rencana Perbaikan: "${cleanedRencanaPerbaikan}" - Indikator: "${cleanedIndikator}" - Sasaran: "${cleanedSasaran}". ATURAN: Jawaban harus berupa satu frasa/kalimat tunggal, spesifik, dan dalam format nama dokumen resmi (contoh: "SK Rektor tentang...", "Notulensi Rapat...", "Laporan Hasil...").`;
    
    let success = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 3;
    const RETRY_DELAY_MS = 2000; // 2 detik delay untuk retry

    while (!success && attempts < MAX_ATTEMPTS) {
        try {
            const generatedText = await callAiApi(prompt);
            if (generatedText === 'RATE_LIMIT') {
                attempts++;
                updateItemState(item.id, 'keterangan', `Batas permintaan AI tercapai, mencoba lagi... (percobaan ${attempts}/${MAX_ATTEMPTS})`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
                continue; // Lanjutkan ke percobaan berikutnya
            }
            updateItemState(item.id, 'keterangan', generatedText);
            success = true; // Berhasil, keluar dari loop
        } catch (e) {
            handleApiError(e); // Tampilkan kesalahan API global melalui modal
            updateItemState(item.id, 'keterangan', `Gagal diproses: ${e.message}`); // Perbarui item dengan pesan kesalahan
            success = true; // Berhenti mencoba jika itu bukan kesalahan batas kecepatan
        }
    }

    if (!success) {
        updateItemState(item.id, 'keterangan', 'Gagal setelah beberapa percobaan (Rate Limit)'); // Pesan akhir jika semua percobaan gagal
    }
    setLoadingStates(prev => ({ ...prev, [item.id + '_ket']: false })); // Hapus status loading
  };

  // Fungsi untuk membuat Rencana Perbaikan (RTL) menggunakan AI
  const handleGenerateRTL = async (item) => {
     const cleanedUraianEp = cleanAiInput(item.uraian_ep);
     const cleanedRekomendasiSurvey = cleanAiInput(item.rekomendasi_survey);

     if (!cleanedUraianEp && !cleanedRekomendasiSurvey) {
        updateItemState(item.id, 'rencana_perbaikan', 'Data tidak cukup untuk ide RTL');
        return;
    }
    setLoadingStates(prev => ({ ...prev, [item.id + '_rtl']: true }));
    const prompt = `PERAN: Anda adalah konsultan mutu. TUGAS: Buatkan satu kalimat RENCANA PERBAIKAN (RTL) yang operasional dan terukur. DATA: - Uraian Elemen Penilaian: "${cleanedUraianEp}" - Rekomendasi Awal: "${cleanedRekomendasiSurvey}". ATURAN: Jawaban harus berupa kalimat tindakan yang jelas. Contoh: "Melakukan sosialisasi SOP pendaftaran pasien baru kepada seluruh petugas pendaftaran."`;
    
    let success = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 3;
    const RETRY_DELAY_MS = 2000;

    while (!success && attempts < MAX_ATTEMPTS) {
        try {
            const generatedText = await callAiApi(prompt);
            if (generatedText === 'RATE_LIMIT') {
                attempts++;
                updateItemState(item.id, 'rencana_perbaikan', `Batas permintaan AI tercapai, mencoba lagi... (percobaan ${attempts}/${MAX_ATTEMPTS})`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
                continue;
            }
            updateItemState(item.id, 'rencana_perbaikan', generatedText);
            success = true;
        } catch (e) {
            handleApiError(e);
            updateItemState(item.id, 'rencana_perbaikan', `Gagal diproses: ${e.message}`);
            success = true;
        } 
    }
    if (!success) {
        updateItemState(item.id, 'rencana_perbaikan', 'Gagal setelah beberapa percobaan (Rate Limit)');
    }
    setLoadingStates(prev => ({ ...prev, [item.id + '_rtl']: false }));
  };

  // Fungsi untuk membuat Indikator menggunakan AI
  const handleGenerateIndikator = async (item) => {
    const cleanedUraianEp = cleanAiInput(item.uraian_ep);
    const cleanedRencanaPerbaikan = cleanAiInput(item.rencana_perbaikan);

    if (!cleanedUraianEp && !cleanedRencanaPerbaikan) {
      updateItemState(item.id, 'indikator', 'Data tidak cukup untuk indikator');
      return;
    }
    setLoadingStates(prev => ({ ...prev, [item.id + '_indikator']: true }));
    const prompt = `PERAN: Anda adalah seorang perencana mutu. TUGAS: Buatkan satu poin indikator pencapaian yang spesifik, terukur, dan relevan untuk rencana perbaikan berikut. DATA: - Uraian Elemen Penilaian: "${cleanedUraianEp}" - Rencana Perbaikan: "${cleanedRencanaPerbaikan}". ATURAN: Jawaban harus berupa frasa indikator yang jelas (contoh: "Persentase pasien yang mendapatkan edukasi sesuai standar").`;
    
    let success = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 3;
    const RETRY_DELAY_MS = 2000;

    while (!success && attempts < MAX_ATTEMPTS) {
      try {
        const generatedText = await callAiApi(prompt);
        if (generatedText === 'RATE_LIMIT') {
          attempts++;
          updateItemState(item.id, 'indikator', `Batas permintaan AI tercapai, mencoba lagi... (percobaan ${attempts}/${MAX_ATTEMPTS})`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
          continue;
        }
        updateItemState(item.id, 'indikator', generatedText);
        success = true;
      } catch (e) { 
        handleApiError(e);
        updateItemState(item.id, 'indikator', `Gagal diproses: ${e.message}`);
        success = true;
      } 
    }
    if (!success) {
      updateItemState(item.id, 'indikator', 'Gagal setelah beberapa percobaan (Rate Limit)');
    }
    setLoadingStates(prev => ({ ...prev, [item.id + '_indikator']: false }));
  };

  // Fungsi untuk membuat Sasaran menggunakan AI
  const handleGenerateSasaran = async (item) => {
    const cleanedUraianEp = cleanAiInput(item.uraian_ep);
    const cleanedRencanaPerbaikan = cleanAiInput(item.rencana_perbaikan);

    if (!cleanedUraianEp && !cleanedRencanaPerbaikan) {
      updateItemState(item.id, 'sasaran', 'Data tidak cukup untuk sasaran');
      return;
    }
    setLoadingStates(prev => ({ ...prev, [item.id + '_sasaran']: true }));
    const prompt = `PERAN: Anda adalah seorang manajer strategi. TUGAS: Buatkan satu poin sasaran yang jelas dan berorientasi hasil untuk rencana perbaikan berikut. DATA: - Uraian Elemen Penilaian: "${cleanedUraianEp}" - Rencana Perbaikan: "${cleanedRencanaPerbaikan}". ATURAN: Jawaban harus berupa kalimat sasaran yang ringkas (contoh: "Meningkatnya kepuasan pasien terhadap pelayanan pendaftaran.").`;
    
    let success = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 3;
    const RETRY_DELAY_MS = 2000;

    while (!success && attempts < MAX_ATTEMPTS) {
      try {
        const generatedText = await callAiApi(prompt);
        if (generatedText === 'RATE_LIMIT') {
          attempts++;
          updateItemState(item.id, 'sasaran', `Batas permintaan AI tercapai, mencoba lagi... (percobaan ${attempts}/${MAX_ATTEMPTS})`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
          continue;
        }
        updateItemState(item.id, 'sasaran', generatedText);
        success = true;
      } catch (e) {
        handleApiError(e);
        updateItemState(item.id, 'sasaran', `Gagal diproses: ${e.message}`);
        success = true;
      } 
    }
    if (!success) {
      updateItemState(item.id, 'sasaran', 'Gagal setelah beberapa percobaan (Rate Limit)');
    }
    setLoadingStates(prev => ({ ...prev, [item.id + '_sasaran']: false }));
  };
  
  // Fungsi untuk menyiapkan data inventaris dokumen yang diratakan (untuk daftar umum)
  const prepareDocumentInventoryData = useCallback(() => {
    if (!groupedData) return [];

    const inventoryMap = new Map(); // Peta untuk menyimpan dokumen unik dan EP terkait

    Object.values(groupedData).forEach(bab => {
      Object.values(bab.standards).forEach(standard => {
        Object.values(standard.criterias).forEach(criteria => {
          criteria.items.forEach(item => {
            const docTitle = cleanAiInput(item.keterangan); // Bersihkan sebelum menggunakan
            if (docTitle) { // Hanya tambahkan jika judul yang dibersihkan tidak kosong
              if (!inventoryMap.has(docTitle)) {
                inventoryMap.set(docTitle, { kode_ep_list: new Set(), uraian_ep_list: new Set() });
              }
              inventoryMap.get(docTitle).kode_ep_list.add(item.kode_ep);
              inventoryMap.get(docTitle).uraian_ep_list.add(item.uraian_ep);
            }
          });
        });
      });
    });

    // Mengkonversi Set ke Array dan mengurutkan sebelum menggabungkan
    const flattenedInventory = Array.from(inventoryMap).map(([docTitle, data]) => ({
      'Judul Dokumen (Keterangan)': docTitle,
      'Kode Elemen Penilaian Terkait': Array.from(data.kode_ep_list).sort().join(', '),
      'Uraian Elemen Penilaian Terkait': Array.from(data.uraian_ep_list).sort().join('; '),
    }));

    return flattenedInventory;
  }, [groupedData]);

  // BARU: Fungsi untuk menyiapkan dokumen yang dikelompokkan berdasarkan jenis (untuk tampilan UI)
  const prepareGroupedDocumentDataForDisplay = useCallback(() => {
    if (!groupedData) return {};

    const groupedByType = {};

    const getDocumentType = (keterangan) => {
        const lowerKeterangan = keterangan.toLowerCase();
        // Logika identifikasi jenis dokumen yang lebih komprehensif
        if (lowerKeterangan.startsWith('sk ')) return 'SK (Surat Keputusan)';
        if (lowerKeterangan.startsWith('sop ') || lowerKeterangan.includes('standar operasional prosedur')) return 'SOP (Standar Operasional Prosedur)';
        if (lowerKeterangan.includes('notulen') || lowerKeterangan.includes('notulensi') || lowerKeterangan.includes('risalah rapat')) return 'Notulen Rapat';
        if (lowerKeterangan.includes('laporan')) return 'Laporan';
        if (lowerKeterangan.includes('pedoman')) return 'Pedoman';
        if (lowerKeterangan.includes('panduan')) return 'Panduan';
        if (lowerKeterangan.includes('kak') || lowerKeterangan.includes('kerangka acuan kegiatan')) return 'KAK (Kerangka Acuan Kegiatan)';
        if (lowerKeterangan.includes('bukti evaluasi') || lowerKeterangan.includes('hasil evaluasi') || lowerKeterangan.includes('hasil penilaian')) return 'Bukti Evaluasi/Penilaian';
        if (lowerKeterangan.includes('bukti tindak lanjut') || lowerKeterangan.includes('laporan tindak lanjut')) return 'Bukti Tindak Lanjut';
        if (lowerKeterangan.includes('daftar hadir')) return 'Daftar Hadir';
        if (lowerKeterangan.includes('form') || lowerKeterangan.includes('formulir') || lowerKeterangan.includes('lembar')) return 'Formulir/Lembar Kerja';
        if (lowerKeterangan.includes('surat edaran') || lowerKeterangan.includes('memo') || lowerKeterangan.includes('instruksi kerja')) return 'Surat Edaran/Internal';
        if (lowerKeterangan.includes('profil') || lowerKeterangan.includes('data program')) return 'Profil/Data Program';
        if (lowerKeterangan.includes('bukti sosialisasi') || lowerKeterangan.includes('materi sosialisasi')) return 'Bukti Sosialisasi';
        if (lowerKeterangan.includes('bukti pelaksanaan') || lowerKeterangan.includes('dokumentasi kegiatan')) return 'Bukti Pelaksanaan Kegiatan';
        
        return 'Dokumen Umum / Lain-lain'; // Kategori default yang lebih jelas
    };

    Object.values(groupedData).forEach(bab => {
        Object.values(bab.standards).forEach(standard => {
            Object.values(standard.criterias).forEach(criteria => {
                criteria.items.forEach(item => {
                    const docTitle = cleanAiInput(item.keterangan); // Bersihkan sebelum menggunakan
                    if (docTitle) { // Hanya tambahkan jika judul yang dibersihkan tidak kosong
                        const type = getDocumentType(docTitle);
                        if (!groupedByType[type]) {
                            groupedByType[type] = [];
                        }
                        groupedByType[type].push({
                            'Judul Dokumen': docTitle,
                            'Kode EP Terkait': item.kode_ep,
                            'Uraian EP Terkait': item.uraian_ep,
                            'Rencana Perbaikan': item.rencana_perbaikan, // Sertakan mentah untuk tampilan, dibersihkan untuk prompt AI
                            'Indikator': item.indikator,
                            'Sasaran': item.sasaran,
                            'Waktu': item.waktu,
                            'PJ': item.pj,
                        });
                    }
                });
            });
        });
    });
    return groupedByType;
  }, [groupedData]);

  // BARU: Fungsi untuk menyiapkan dokumen yang dikelompokkan berdasarkan jenis, diratakan untuk ekspor Excel
  const prepareGroupedDocumentDataForExcel = useCallback(() => {
    if (!groupedData) return [];

    const flattenedForExcel = [];

    // Menggunakan fungsi getDocumentType yang sama untuk konsistensi
    const getDocumentType = (keterangan) => {
      const lowerKeterangan = keterangan.toLowerCase();
      if (lowerKeterangan.startsWith('sk ')) return 'SK (Surat Keputusan)';
      if (lowerKeterangan.startsWith('sop ') || lowerKeterangan.includes('standar operasional prosedur')) return 'SOP (Standar Operasional Prosedur)';
      if (lowerKeterangan.includes('notulen') || lowerKeterangan.includes('notulensi') || lowerKeterangan.includes('risalah rapat')) return 'Notulen Rapat';
      if (lowerKeterangan.includes('laporan')) return 'Laporan';
      if (lowerKeterangan.includes('pedoman')) return 'Pedoman';
      if (lowerKeterangan.includes('panduan')) return 'Panduan';
      if (lowerKeterangan.includes('kak') || lowerKeterangan.includes('kerangka acuan kegiatan')) return 'KAK (Kerangka Acuan Kegiatan)';
      if (lowerKeterangan.includes('bukti evaluasi') || lowerKeterangan.includes('hasil evaluasi') || lowerKeterangan.includes('hasil penilaian')) return 'Bukti Evaluasi/Penilaian';
      if (lowerKeterangan.includes('bukti tindak lanjut') || lowerKeterangan.includes('laporan tindak lanjut')) return 'Bukti Tindak Lanjut';
      if (lowerKeterangan.includes('daftar hadir')) return 'Daftar Hadir';
      if (lowerKeterangan.includes('form') || lowerKeterangan.includes('formulir') || lowerKeterangan.includes('lembar')) return 'Formulir/Lembar Kerja';
      if (lowerKeterangan.includes('surat edaran') || lowerKeterangan.includes('memo') || lowerKeterangan.includes('instruksi kerja')) return 'Surat Edaran/Internal';
      if (lowerKeterangan.includes('profil') || lowerKeterangan.includes('data program')) return 'Profil/Data Program';
      if (lowerKeterangan.includes('bukti sosialisasi') || lowerKeterangan.includes('materi sosialisasi')) return 'Bukti Sosialisasi';
      if (lowerKeterangan.includes('bukti pelaksanaan') || lowerKeterangan.includes('dokumentasi kegiatan')) return 'Bukti Pelaksanaan Kegiatan';
      return 'Dokumen Umum / Lain-lain';
    };

    Object.values(groupedData).forEach(bab => {
        Object.values(bab.standards).forEach(standard => {
            Object.values(standard.criterias).forEach(criteria => {
                criteria.items.forEach(item => {
                    const docTitle = cleanAiInput(item.keterangan); // Bersihkan sebelum menggunakan
                    if (docTitle) { // Hanya tambahkan jika judul yang dibersihkan tidak kosong
                        const type = getDocumentType(docTitle);
                        flattenedForExcel.push({
                            'Tipe Dokumen': type, // Kolom baru untuk jenis
                            'Judul Dokumen': docTitle,
                            'Kode EP Terkait': item.kode_ep,
                            'Uraian EP Terkait': item.uraian_ep,
                            'Rencana Perbaikan': item.rencana_perbaikan, 
                            'Indikator': item.indikator,
                            'Sasaran': item.sasaran,
                            'Waktu': item.waktu,
                            'PJ': item.pj,
                        });
                    }
                });
            });
        });
    });
    // Urutkan berdasarkan jenis dokumen untuk organisasi yang lebih baik di Excel
    return flattenedForExcel.sort((a, b) => a['Tipe Dokumen'].localeCompare(b['Tipe Dokumen']));
  }, [groupedData]);


  // Efek untuk memperbarui inventaris dokumen dan dokumen yang dikelompokkan saat groupedData berubah
  useEffect(() => {
    setDocumentInventory(prepareDocumentInventoryData());
    setGroupedDocumentsByTypeForDisplay(prepareGroupedDocumentDataForDisplay()); // Perbarui status baru untuk UI
  }, [groupedData, prepareDocumentInventoryData, prepareGroupedDocumentDataForDisplay]);

  // --- FUNGSI GENERASI AI MASSAL BARU ---

  // Fungsi pembantu generik untuk proses generasi AI massal
  const handleGenerateAllField = async (fieldToGenerate, promptRole, promptTask, itemFilterCondition, targetField, getPromptData) => {
    if (!groupedData) { setModalMessage({ message: "Harap tampilkan hierarki terlebih dahulu.", type: 'info' }); return; }
    if (!apiKey) { setModalMessage({ message: "Harap masukkan Kunci API Google AI Anda.", type: 'error' }); setIsApiKeyInvalid(true); return; }
    setIsApiKeyInvalid(false); // Reset status tidak valid jika kunci API ada

    const allItems = Object.values(groupedData).flatMap(bab => Object.values(bab.standards).flatMap(std => Object.values(std.criterias).flatMap(kri => kri.items)));
    
    // Filter item yang memenuhi kondisi dan belum diisi
    const itemsToProcess = allItems.filter(item => {
        const isFieldReady = cleanAiInput(item[targetField]) !== '';
        return itemFilterCondition(item) && !isFieldReady;
    });
    
    if (itemsToProcess.length === 0) {
        setModalMessage({ message: `Tidak ada item yang perlu diproses untuk '${fieldToGenerate}'. Pastikan item memiliki data input yang dibutuhkan dan kolom target masih kosong atau berisi pesan kesalahan.`, type: 'info' });
        return;
    }

    setGenerationProgress({ current: 0, total: itemsToProcess.length, message: `Memulai proses 'Buat Semua ${fieldToGenerate}'...` });
    setError(''); // Hapus kesalahan umum di UI sebelum memulai proses batch baru

    let successfulGenerations = 0;
    let failedGenerations = 0;
    
    const CHUNK_SIZE = 5;
    const DELAY_BETWEEN_CHUNKS = 1500;
    const RETRY_DELAY_MS = 3000;

    try {
        let processedCount = 0;
        for (let i = 0; i < itemsToProcess.length; i += CHUNK_SIZE) {
            setGenerationProgress(prev => ({ ...prev, message: `Memproses kumpulan ${Math.floor(i / CHUNK_SIZE) + 1} dari ${Math.ceil(itemsToProcess.length / CHUNK_SIZE)} untuk '${fieldToGenerate}'...` }));
            const chunk = itemsToProcess.slice(i, i + CHUNK_SIZE);
            
            const processChunkItem = async (item) => {
                const promptData = getPromptData(item); // Dapatkan data prompt spesifik untuk item dan bidang ini
                const prompt = `PERAN: ${promptRole}. TUGAS: ${promptTask}. DATA: ${promptData}.`;
                
                let attempts = 0;
                const MAX_ATTEMPTS = 3;
                while (attempts < MAX_ATTEMPTS) {
                    try {
                        const generatedText = await callAiApi(prompt);
                        if (generatedText === 'RATE_LIMIT') {
                            attempts++;
                            // Gunakan updateItemState global
                            updateItemState(item.id, targetField, `Batas permintaan AI tercapai, mencoba lagi... (percobaan ${attempts}/${MAX_ATTEMPTS})`);
                            setLoadingStates(prev => ({ ...prev, [`${item.id}_${fieldToGenerate}`]: true }));
                            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
                            continue;
                        }
                        updateItemState(item.id, targetField, generatedText); 
                        setLoadingStates(prev => ({ ...prev, [`${item.id}_${fieldToGenerate}`]: false }));
                        successfulGenerations++; // Tambah hitungan sukses
                        return { id: item.id, success: true };
                    } catch (error) {
                        handleApiError(error);
                        updateItemState(item.id, targetField, `Gagal diproses: ${error.message}`); 
                        setLoadingStates(prev => ({ ...prev, [`${item.id}_${fieldToGenerate}`]: false }));
                        failedGenerations++; // Tambah hitungan gagal
                        return { id: item.id, success: false };
                    }
                }
                updateItemState(item.id, targetField, 'Gagal setelah beberapa percobaan (Batas Kecepatan)'); 
                setLoadingStates(prev => ({ ...prev, [`${item.id}_${fieldToGenerate}`]: false }));
                failedGenerations++; // Tambah hitungan gagal jika semua percobaan gagal
                return { id: item.id, success: false };
            };

            await Promise.all(chunk.map(processChunkItem));

            processedCount += chunk.length;
            setGenerationProgress(prev => ({ ...prev, current: processedCount }));
            
            if (i + CHUNK_SIZE < itemsToProcess.length && !error) {
                await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_CHUNKS));
            }
        }
        setError('');
        setBatchResult({ success: successfulGenerations, failed: failedGenerations, field: fieldToGenerate }); // Set hasil batch
    } catch (e) {
        console.error(`Kesalahan fatal selama 'Buat Semua ${fieldToGenerate}':`, e);
        setModalMessage({ message: `Terjadi kesalahan fatal selama 'Buat Semua ${fieldToGenerate}': ${e.message}`, type: 'error' });
    } finally { 
        setGenerationProgress({ current: 0, total: 0, message: '' }); 
    }
  };

  // Implementasi spesifik untuk Generate All RTL
  const handleGenerateAllRTL = () => {
    const itemFilterCondition = (item) => cleanAiInput(item.uraian_ep) || cleanAiInput(item.rekomendasi_survey);
    const getPromptData = (item) => `- Uraian Elemen Penilaian: "${cleanAiInput(item.uraian_ep)}" - Rekomendasi Awal: "${cleanAiInput(item.rekomendasi_survey)}". ATURAN: Jawaban harus berupa kalimat tindakan yang jelas. Contoh: "Melakukan sosialisasi SOP pendaftaran pasien baru kepada seluruh petugas pendaftaran."`;
    handleGenerateAllField('Rencana Perbaikan', 'Anda adalah konsultan mutu', 'Buatkan satu kalimat RENCANA PERBAIKAN (RTL) yang operasional dan terukur', itemFilterCondition, 'rencana_perbaikan', getPromptData);
  };

  // Implementasi spesifik untuk Generate All Indikator
  const handleGenerateAllIndikator = () => {
    const itemFilterCondition = (item) => cleanAiInput(item.uraian_ep) || cleanAiInput(item.rencana_perbaikan);
    const getPromptData = (item) => `- Uraian Elemen Penilaian: "${cleanAiInput(item.uraian_ep)}" - Rencana Perbaikan: "${cleanAiInput(item.rencana_perbaikan)}". ATURAN: Jawaban harus berupa frasa indikator yang jelas (contoh: "Persentase pasien yang mendapatkan edukasi sesuai standar").`;
    handleGenerateAllField('Indikator', 'Anda adalah seorang perencana mutu', 'Buatkan satu poin indikator pencapaian yang spesifik, terukur, dan relevan', itemFilterCondition, 'indikator', getPromptData);
  };

  // Implementasi spesifik untuk Generate All Sasaran
  const handleGenerateAllSasaran = () => {
    const itemFilterCondition = (item) => cleanAiInput(item.uraian_ep) || cleanAiInput(item.rencana_perbaikan);
    const getPromptData = (item) => `- Uraian Elemen Penilaian: "${cleanAiInput(item.uraian_ep)}" - Rencana Perbaikan: "${cleanAiInput(item.rencana_perbaikan)}". ATURAN: Jawaban harus berupa kalimat sasaran yang ringkas (contoh: "Meningkatnya kepuasan pasien terhadap pelayanan pendaftaran.").`;
    handleGenerateAllField('Sasaran', 'Anda adalah seorang manajer strategi', 'Buatkan satu poin sasaran yang jelas dan berorientasi hasil', itemFilterCondition, 'sasaran', getPromptData);
  };

  // Fungsi yang ada untuk Generate All Keterangan
  const handleGenerateAllKeterangan = async () => {
    if (!groupedData) { setModalMessage({ message: "Harap tampilkan hierarki terlebih dahulu.", type: 'info' }); return; }
    if (!apiKey) { setModalMessage({ message: "Harap masukkan Kunci API Google AI Anda.", type: 'error' }); setIsApiKeyInvalid(true); return; }
    setIsApiKeyInvalid(false); // Setel ulang status tidak valid jika kunci API ada
    
    const allItems = Object.values(groupedData).flatMap(bab => Object.values(bab.standards).flatMap(std => Object.values(std.criterias).flatMap(kri => kri.items)));
    // Filter item yang memiliki cukup data (dibersihkan) untuk pembuatan Keterangan DAN belum berhasil diproses
    const itemsToProcess = allItems.filter(item => {
        const cleanedRTL = cleanAiInput(item.rencana_perbaikan);
        const cleanedIndikator = cleanAiInput(item.indikator);
        const cleanedSasaran = cleanAiInput(item.sasaran);
        const isKeteranganReady = cleanAiInput(item.keterangan) !== ''; // Keterangan sudah terisi/valid

        return (cleanedRTL || cleanedIndikator || cleanedSasaran) && !isKeteranganReady;
    });
    
    if (itemsToProcess.length === 0) {
        setModalMessage({ message: "Tidak ada item yang perlu diproses. Pastikan item memiliki Rencana Perbaikan, Indikator, atau Sasaran yang terisi, dan kolom Keterangan masih kosong atau berisi pesan kesalahan.", type: 'info' });
        return;
    }

    setGenerationProgress({ current: 0, total: itemsToProcess.length, message: 'Memulai proses...' });
    setError(''); // Hapus kesalahan umum di UI sebelum memulai proses batch baru

    let successfulGenerations = 0;
    let failedGenerations = 0;
    
    const CHUNK_SIZE = 5; // Jumlah item yang diproses per batch
    const DELAY_BETWEEN_CHUNKS = 1500; // Delay antara batch untuk menghindari rate limit
    const RETRY_DELAY_MS = 3000; // Delay untuk retry jika ada rate limit

    try {
        let processedCount = 0;
        for (let i = 0; i < itemsToProcess.length; i += CHUNK_SIZE) {
            setGenerationProgress(prev => ({ ...prev, message: `Memproses kumpulan ${Math.floor(i / CHUNK_SIZE) + 1} dari ${Math.ceil(itemsToProcess.length / CHUNK_SIZE)}...` }));
            const chunk = itemsToProcess.slice(i, i + CHUNK_SIZE);
            
            // Fungsi untuk memproses satu item dalam batch
            const processChunkItem = async (item) => {
                const cleanedRencanaPerbaikan = cleanAiInput(item.rencana_perbaikan);
                const cleanedIndikator = cleanAiInput(item.indikator);
                const cleanedSasaran = cleanAiInput(item.sasaran);

                const prompt = `PERAN: Anda adalah auditor akreditasi. TUGAS: Buatkan satu judul DOKUMEN BUKTI IMPLEMENTASI yang konkret berdasarkan data berikut. DATA: - Rencana Perbaikan: "${cleanedRencanaPerbaikan}" - Indikator: "${cleanedIndikator}" - Sasaran: "${cleanedSasaran}". ATURAN: Jawaban harus berupa satu frasa/kalimat tunggal, spesifik, dan dalam format nama dokumen resmi (contoh: "SK Rektor tentang...", "Notulensi Rapat...", "Laporan Hasil...").`;
                
                let attempts = 0;
                const MAX_ATTEMPTS = 3;
                while (attempts < MAX_ATTEMPTS) {
                    try {
                        const generatedText = await callAiApi(prompt);
                        if (generatedText === 'RATE_LIMIT') {
                            attempts++;
                            // Tampilkan pesan percobaan ulang di item, jangan modal global
                            updateItemState(item.id, 'keterangan', `Batas permintaan AI tercapai, mencoba lagi... (percobaan ${attempts}/${MAX_ATTEMPTS})`);
                            setLoadingStates(prev => ({ ...prev, [item.id + '_ket']: true })); // Biarkan pemuatan tetap benar untuk percobaan ulang
                            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
                            continue; // Lanjutkan percobaan berikutnya
                        }
                        updateItemState(item.id, 'keterangan', generatedText); 
                        setLoadingStates(prev => ({ ...prev, [item.id + '_ket']: false })); 
                        successfulGenerations++; // Tambah hitungan sukses
                        return { id: item.id, success: true }; // Berhasil memproses item ini
                    } catch (error) {
                        handleApiError(error); // Tampilkan kesalahan API global melalui modal
                        updateItemState(item.id, 'keterangan', `Gagal diproses: ${error.message}`); 
                        setLoadingStates(prev => ({ ...prev, [item.id + '_ket']: false })); 
                        failedGenerations++; // Tambah hitungan gagal
                        return { id: item.id, success: false }; // Gagal memproses item ini
                    }
                }
                updateItemState(item.id, 'keterangan', 'Gagal setelah beberapa percobaan (Batas Kecepatan)'); 
                setLoadingStates(prev => ({ ...prev, [item.id + '_ket']: false }));
                failedGenerations++; // Tambah hitungan gagal jika semua percobaan gagal
                return { id: item.id, success: false }; // Gagal setelah semua percobaan
            };

            await Promise.all(chunk.map(processChunkItem)); // Tunggu semua item di bagian selesai diproses

            processedCount += chunk.length;
            setGenerationProgress(prev => ({ ...prev, current: processedCount }));
            
            if (i + CHUNK_SIZE < itemsToProcess.length && !error) { // Periksa juga status error global
                await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_CHUNKS));
            }
        }
        setError(''); 
        setBatchResult({ success: successfulGenerations, failed: failedGenerations, field: 'Keterangan' }); // Set hasil batch
    } catch (e) {
        console.error("Kesalahan fatal selama pembuatan massal:", e);
        setModalMessage({ message: `Terjadi kesalahan fatal selama pembuatan massal: ${e.message}`, type: 'error' });
    } finally { 
        setGenerationProgress({ current: 0, total: 0, message: '' }); 
    }
  };

  // Fungsi untuk membuat ringkasan strategis menggunakan AI
  const handleGenerateSummary = async () => {
    if (!groupedData) { setModalMessage({ message: "Harap tampilkan hierarki terlebih dahulu.", type: 'info' }); return; }
    if (!apiKey) { setModalMessage({ message: "Harap masukkan Kunci API Google AI Anda.", type: 'error' }); setIsApiKeyInvalid(true); return; }
    setIsApiKeyInvalid(false); // Setel ulang status tidak valid jika kunci API ada

    setIsSummaryLoading(true);
    setAiSummary(''); // Bersihkan ringkasan sebelumnya

    // Kumpulkan semua rencana perbaikan yang sudah dibersihkan untuk prompt ringkasan
    const allItemsText = Object.values(groupedData).flatMap(bab => 
        Object.values(bab.standards).flatMap(std => 
            Object.values(std.criterias).flatMap(kri => 
                kri.items.filter(item => cleanAiInput(item.rencana_perbaikan)).map(item => `Elemen ${item.kode_ep}: ${cleanAiInput(item.rencana_perbaikan)}`)
            )
        )
    ).join('\n');

    if (!allItemsText.trim()) { // Periksa setelah trim
        setAiSummary('Tidak ada Rencana Perbaikan yang cukup untuk dibuat kesimpulan.');
        setIsSummaryLoading(false);
        return;
    }

    const prompt = `PERAN: Anda adalah seorang manajer mutu senior. 
    TUGAS: Analisis semua rencana perbaikan (RTL) yang diberikan. Kelompokkan Elemen Penilaian (EP) yang relevan ke dalam kategori kegiatan strategis berikut:
    1.  **Audit Mutu Internal**: EP yang perlu diperiksa kepatuhan dan pelaksanaannya secara internal (misal: audit dokumen, audit kepatuhan SOP).
    2.  **Sosialisasi & Pelatihan Internal**: EP yang membutuhkan peningkatan pemahaman atau pelatihan untuk staf di dalam Puskesmas.
    3.  **Konsultasi & Bimbingan Teknis Eksternal (contoh: Dinkes)**: EP yang secara spesifik membutuhkan arahan, bimbingan teknis, koordinasi, atau konsultasi dari pihak eksternal seperti Dinas Kesehatan.
    4.  **Peningkatan Monev Internal Rutin**: EP yang hasilnya perlu dipantau secara berkala (misal: monitoring capaian indikator mingguan/bulanan).
    5.  **Kegiatan Lainnya**: Kelompokkan EP lain ke dalam kegiatan spesifik yang Anda identifikasi (contoh: 'Pengembangan/Revisi Dokumen SOP', 'Perbaikan Sarana & Prasarana').

    DATA RTL:\n${allItemsText}\n\nATURAN: Berikan jawaban dalam format Markdown. Gunakan heading untuk setiap kategori. Di bawah setiap heading, sebutkan kode EP yang relevan.`;
    
    let success = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 3;
    const RETRY_DELAY_MS = 5000; // 5 detik delay untuk retry ringkasan

    while(!success && attempts < MAX_ATTEMPTS) {
        try {
            const generatedText = await callAiApi(prompt);
            if (generatedText === 'RATE_LIMIT') {
                attempts++;
                setAiSummary(`Batas permintaan AI tercapai. Mencoba lagi dalam ${RETRY_DELAY_MS / 1000} detik... (percobaan ${attempts}/${MAX_ATTEMPTS})`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
                continue;
            }
            setAiSummary(generatedText);
            success = true;
        } catch (e) {
            handleApiError(e); // Tampilkan kesalahan di area pesan khusus
            setAiSummary(`**Terjadi Kesalahan:**\n\nGagal membuat kesimpulan. ${e.message}`);
            success = true; // Berhenti mencoba jika itu bukan kesalahan batas kecepatan
        }
    }
    if (!success) {
        setAiSummary('Gagal membuat kesimpulan setelah beberapa percobaan (Batas Kecepatan).');
    }
    setIsSummaryLoading(false);
  };

  // Fungsi baru untuk menangani pengunduhan template kosong
  const handleDownloadTemplate = async () => {
    try {
      await loadXlsxScript(); // Pastikan pustaka XLSX dimuat
      const wb = window.XLSX.utils.book_new();
      const headers = [
        'Kode EP',
        'Uraian Elemen Penilaian',
        'Rekomendasi Hasil Survey',
        'Rencana Perbaikan',
        'Indikator Pencapaian',
        'Sasaran',
        'Waktu Penyelesaian',
        'Penanggung Jawab',
        'Keterangan'
      ];
      
      const ws = window.XLSX.utils.aoa_to_sheet([headers]); // Buat sheet hanya dengan header
      window.XLSX.utils.book_append_sheet(wb, ws, "Template PPS");

      const xlsxData = window.XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([xlsxData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Template PPS - ${new Date().toISOString().slice(0,10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setModalMessage({ message: "Template Excel berhasil diunduh!", type: 'info' }); // Pesan sukses
    } catch (e) {
      setModalMessage({ message: `Gagal mengunduh template: ${e.message}`, type: 'error' }); // Pesan error via modal
      console.error("Kesalahan pengunduhan template:", e);
    }
  };
  
  // Fungsi untuk menangani pengunduhan seluruh data
  const handleDownload = () => {
    if (!groupedData) { setModalMessage({ message: "Tidak ada data untuk diunduh.", type: 'info' }); return; }
    
    const flattenedData = [];
    // Header untuk sheet "Data PPS"
    const headers = ['BAB', 'STANDAR', 'KRITERIA', 'ELEMEN PENILAIAN', 'RENCANA PERBAIKAN', 'INDIKATOR', 'SASARAN', 'WAKTU', 'PJ', 'KETERANGAN'];
    Object.values(groupedData).forEach(bab => {
        Object.values(bab.standards).forEach(standard => {
            Object.values(standard.criterias).forEach(criteria => {
                criteria.items.forEach(item => {
                    const [babNum, stdNum, kriNum, ...epParts] = item.kode_ep.split('.');
                    const epNum = epParts.join('.');
                    flattenedData.push({ 'BAB': babNum, 'STANDAR': stdNum, 'KRITERIA': kriNum, 'ELEMEN PENILAIAN': epNum, 'RENCANA PERBAIKAN': item.rencana_perbaikan, 'INDIKATOR': item.indikator, 'SASARAN': item.sasaran, 'WAKTU': item.waktu, 'PJ': item.pj, 'KETERANGAN': item.keterangan });
                });
            });
        });
    });

    const triggerDownload = (blob, filename) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
    };
    const outputFilename = `Hasil PPS - ${new Date().toISOString().slice(0,10)}`;

    if (downloadFormat === 'xlsx') {
        const wb = window.XLSX.utils.book_new();
        const wsData = window.XLSX.utils.json_to_sheet(flattenedData);
        window.XLSX.utils.book_append_sheet(wb, wsData, "Data PPS");
        
        // Tambahkan sheet Inventaris Dokumen
        const docInventoryData = prepareDocumentInventoryData();
        if (docInventoryData.length > 0) {
            const wsDocInventory = window.XLSX.utils.json_to_sheet(docInventoryData);
            window.XLSX.utils.book_append_sheet(wb, wsDocInventory, "Inventaris Dokumen");
        }

        // Tambahkan sheet Dokumen yang Dikelompokkan berdasarkan Jenis
        const groupedDocDataForExcel = prepareGroupedDocumentDataForExcel(); // Gunakan fungsi baru untuk Excel
        if (groupedDocDataForExcel.length > 0) {
            const groupedDocHeaders = ['Tipe Dokumen', 'Judul Dokumen', 'Kode EP Terkait', 'Uraian EP Terkait', 'Rencana Perbaikan', 'Indikator', 'Sasaran', 'Waktu', 'PJ'];
            const wsGroupedDocs = window.XLSX.utils.json_to_sheet(groupedDocDataForExcel, { header: groupedDocHeaders });
            window.XLSX.utils.book_append_sheet(wb, wsGroupedDocs, "Pengelompokan Dokumen");
        }

        if (aiSummary) {
            // Hapus format markdown untuk sheet Excel
            const summaryText = aiSummary.replace(/\*\*(.*?)\*\*/g, '$1'); 
            const summaryRows = summaryText.split('\n').map(line => [line]);
            const wsSummary = window.XLSX.utils.aoa_to_sheet(summaryRows);
            wsSummary['!cols'] = [{ wch: 100 }]; // Atur lebar kolom untuk ringkasan
            window.XLSX.utils.book_append_sheet(wb, wsSummary, "Kesimpulan AI");
        }
        const xlsxData = window.XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([xlsxData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        triggerDownload(blob, `${outputFilename}.xlsx`);
        setModalMessage({ message: "File Excel berhasil diunduh!", type: 'info' });
    } else { 
        let content;
        let fileExtension;
        let mimeType;

        if (downloadFormat === 'csv' || downloadFormat === 'txt') {
            const delimiter = downloadFormat === 'csv' ? ',' : '\t';
            content = headers.join(delimiter) + '\n';
            flattenedData.forEach(row => {
                const values = headers.map(header => {
                    let cell = row[header] ? String(row[header]) : '';
                    cell = cell.replace(/"/g, '""');
                    if (cell.includes(delimiter) || cell.includes('"') || cell.includes('\n')) { cell = `"${cell}"`; }
                    return cell;
                });
                content += values.join(delimiter) + '\n';
            });
            
            // Tambahkan inventaris dokumen ke output teks/csv
            const docInventoryData = prepareDocumentInventoryData();
            if (docInventoryData.length > 0) {
              content += `\n\n\nINVENTARIS DOKUMEN\n\n`;
              content += Object.keys(docInventoryData[0]).join(delimiter) + '\n';
              docInventoryData.forEach(row => {
                const values = Object.values(row).map(value => {
                  let cell = value ? String(value) : '';
                  cell = cell.replace(/"/g, '""');
                  if (cell.includes(delimiter) || cell.includes('"') || cell.includes('\n')) { cell = `"${cell}"`; }
                  return cell;
                });
                content += values.join(delimiter) + '\n';
              });
            }

            // Tambahkan dokumen yang dikelompokkan berdasarkan jenis ke output teks/csv
            const groupedDocDataForExcel = prepareGroupedDocumentDataForExcel(); // Gunakan fungsi persiapan Excel
            if (groupedDocDataForExcel.length > 0) {
                content += `\n\n\nPENGELOMPOKAN DOKUMEN BERDASARKAN TIPE\n\n`;
                const groupedDocHeaders = ['Tipe Dokumen', 'Judul Dokumen', 'Kode EP Terkait', 'Uraian EP Terkait', 'Rencana Perbaikan', 'Indikator', 'Sasaran', 'Waktu', 'PJ'];
                content += groupedDocHeaders.join(delimiter) + '\n';
                groupedDocDataForExcel.forEach(docItem => {
                  const values = groupedDocHeaders.map(header => {
                    let cell = docItem[header] ? String(docItem[header]) : '';
                    cell = cell.replace(/"/g, '""');
                    if (cell.includes(delimiter) || cell.includes('"') || cell.includes('\n')) { cell = `"${cell}"`; }
                    return cell;
                  });
                  content += values.join(delimiter) + '\n';
                });
            }

            if (aiSummary) {
                // Hapus format markdown untuk CSV/TXT
                content += `\n\n\nKESIMPULAN & SARAN STRATEGIS AI\n\n${aiSummary.replace(/\*\*/g, '')}`;
            }
            fileExtension = downloadFormat;
            mimeType = `text/${downloadFormat};charset=utf-8;`;
            triggerDownload(blob, `${outputFilename}.${fileExtension}`);
            setModalMessage({ message: `File ${downloadFormat.toUpperCase()} berhasil diunduh!`, type: 'info' });
        } else if (downloadFormat === 'docx') {
            content = `<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Hasil PPS</title><style>table, th, td { border: 1px solid black; border-collapse: collapse; padding: 5px; } h1, h2 { font-family: sans-serif; }</style></head><body><h1>Data Perencanaan Perbaikan Strategis</h1><table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>`;
            flattenedData.forEach(row => {
                content += '<tr>';
                headers.forEach(h => { content += `<td>${row[h] || ''}</td>`; });
                content += '</tr>';
            });
            content += '</tbody></table>';

            // Tambahkan Inventaris Dokumen ke output DOCX
            const docInventoryData = prepareDocumentInventoryData();
            if (docInventoryData.length > 0) {
              content += `<h2>Inventaris Dokumen</h2><table><thead><tr>${Object.keys(docInventoryData[0]).map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>`;
              docInventoryData.forEach(row => {
                const values = Object.values(row).map(value => {
                  return value || ''; // Pastikan nilai bukan nol untuk ditampilkan
                });
                content += '<tr>';
                values.forEach(value => { content += `<td>${value}</td>`; });
                content += '</tr>';
              });
              content += '</tbody></table>';
            }

            // Tambahkan Dokumen yang Dikelompokkan berdasarkan Jenis ke output DOCX
            const groupedDocDataForExcel = prepareGroupedDocumentDataForExcel(); // Gunakan fungsi persiapan Excel
            if (groupedDocDataForExcel.length > 0) {
                content += `<h2>Pengelompokan Dokumen Berdasarkan Tipe</h2>`;
                const groupedDocHeaders = ['Tipe Dokumen', 'Judul Dokumen', 'Kode EP Terkait', 'Uraian EP Terkait', 'Rencana Perbaikan', 'Indikator', 'Sasaran', 'Waktu', 'PJ'];
                content += `<table><thead><tr>${groupedDocHeaders.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>`;
                groupedDocDataForExcel.forEach(docItem => {
                    content += '<tr>';
                    groupedDocHeaders.forEach(header => {
                      content += `<td>${docItem[header] || ''}</td>`;
                    });
                    content += '</tr>';
                });
                content += '</tbody></table>';
            }


            if (aiSummary) {
                // Pertahankan beberapa format HTML dasar untuk DOCX
                content += `<h2>Kesimpulan & Saran Strategis AI</h2><div>${aiSummary.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>`;
            }
            content += '</body></html>';
            fileExtension = 'doc';
            mimeType = 'application/vnd.ms-word';
            triggerDownload(blob, `${outputFilename}.${fileExtension}`);
            setModalMessage({ message: "File Word (.doc) berhasil diunduh!", type: 'info' });
        }
    }
  };


  return (
    <div className="bg-slate-900 min-h-screen text-white font-sans p-4 sm:p-6 lg:p-8">
       {/* Modal Pesan untuk error/info */}
       <MessageModal 
         message={modalMessage.message} 
         type={modalMessage.type} 
         onClose={() => setModalMessage({ message: '', type: '' })} 
       />

       {/* Modal untuk menampilkan hasil generate batch */}
       {batchResult && (
         <MessageModal
           message={`Proses 'Buat Semua ${batchResult.field}' selesai:\nBerhasil: ${batchResult.success}\nGagal: ${batchResult.failed}`}
           type={batchResult.failed > 0 ? 'error' : 'info'}
           onClose={() => setBatchResult(null)}
         />
       )}

       {/* Indikator pemuatan/kemajuan global */}
       {(generationProgress.total > 0 || !isAuthReady || isProcessingFile) && ( // Tambahkan isProcessingFile ke kondisi loading global
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <LoaderCircle className="w-16 h-16 text-cyan-500 mb-4 animate-spin" />
          {!isAuthReady ? (
            <p className="text-white text-xl mt-4">Memuat aplikasi dan otentikasi Firebase...</p>
          ) : isProcessingFile ? (
            <p className="text-white text-xl mt-4">Memproses file Excel...</p>
          ) : (
            <>
              <p className="text-white text-xl mt-4">AI sedang membuat semua keterangan...</p>
              <p className="text-slate-400 mt-2">{generationProgress.message}</p>
              <p className="text-slate-400 mt-2">Memproses {generationProgress.current} dari {generationProgress.total}</p>
              <div className="w-1/2 bg-slate-700 rounded-full h-2.5 mt-4">
                <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${(generationProgress.current / generationProgress.total) * 100}%` }}></div>
              </div>
            </>
          )}
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8"> <h1 className="text-3xl sm:text-4xl font-bold text-cyan-400">Rencana Perbaikan Akreditasi Berbasis AI</h1> <p className="text-slate-400 mt-2">Unggah file, AI akan mengisi keterangan, lalu unduh hasilnya.</p> </header>
        <div className="bg-slate-800 rounded-xl p-6 mb-8 shadow-lg">
           <label htmlFor="apiKey" className="block text-sm font-medium text-slate-300 mb-2">Kunci API Google AI</label>
           <input id="apiKey" type="password" value={apiKey} onChange={(e) => { setApiKey(e.target.value); setIsApiKeyInvalid(false); setError(''); }} placeholder="Masukkan Kunci API Anda di sini..." className={`w-full bg-slate-700 border rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${isApiKeyInvalid ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 focus:ring-cyan-500'}`} />
           <p className="text-xs text-slate-500 mt-2">Kunci API Anda tidak disimpan. Hanya digunakan untuk sesi ini.</p>
           {isApiKeyInvalid && (
              <p className="text-sm text-red-400 mt-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1"/> Kunci API tidak valid atau belum dimasukkan. Harap periksa dan coba lagi.
              </p>
           )}
           <div className="mt-4">
              <button onClick={() => setOpenStates(prev => ({...prev, isHelpOpen: !prev.isHelpOpen}))} className="text-sm font-medium text-cyan-400 cursor-pointer hover:text-cyan-300 list-none flex items-center gap-1">
                  Bagaimana cara mendapatkan Kunci API?
                  <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${openStates.isHelpOpen ? 'rotate-90' : ''}`} />
              </button>
              {openStates.isHelpOpen && (
                <div className="mt-2 text-sm text-slate-400 bg-slate-900/50 p-4 rounded-md border border-slate-700">
                    <ol className="list-decimal list-inside space-y-2">
                        <li>Buka situs <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">Google AI Studio</a>.</li>
                        <li>Masuk dengan akun Google Anda.</li>
                        <li>Klik tombol <span className="font-semibold text-slate-300">"Buat kunci API"</span>.</li>
                        <li>Salin (copy) kunci API yang baru dibuat.</li>
                        <li>Tempel (paste) kunci API tersebut ke kolom di atas.</li>
                    </ol>
                </div>
              )}
           </div>
        </div>
        {!rawData && !groupedData && (
            <div className="flex flex-col items-center justify-center gap-4">
                <div {...getRootProps()} className={`w-full p-10 border-2 border-dashed rounded-xl transition-all duration-300 ${isProcessingFile ? 'cursor-wait bg-slate-800' : 'cursor-pointer hover:border-cyan-500 hover:bg-slate-800'} ${isDragActive ? 'border-cyan-400 bg-slate-700' : 'border-slate-600'}`}>
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center text-center">
                        {isProcessingFile ? (
                            <>
                                <LoaderCircle className="w-12 h-12 text-cyan-500 mb-4 animate-spin" />
                                <p className="text-lg font-semibold text-slate-300">Memproses file...</p>
                            </>
                        ) : (
                            <>
                                <UploadCloud className="w-12 h-12 text-slate-500 mb-4" />
                                {isDragActive ?
                                    <p className="text-lg font-semibold text-cyan-400">Lepaskan file di sini...</p> :
                                    <><p className="text-lg font-semibold text-slate-300">Seret & lepas file .xlsx atau .csv di sini</p><p className="text-sm text-slate-400 mt-1">Pastikan ada 1 kolom kode hierarki (misal: "Kode EP")</p></>
                                }
                            </>
                        )}
                    </div>
                </div>
                <button onClick={handleDownloadTemplate} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-500 transition-all duration-200 transform hover:scale-105">
                    <Download className="w-5 h-5" /> <span>Unduh Template Excel</span>
                </button>
            </div>
        )}
        {/* Perbaiki kondisi tampilan: jika rawData ada TAPI groupedData BELUM ada, itu berarti siap diproses menjadi hierarki. */}
        {rawData && !groupedData && ( 
          <div className="bg-slate-800 rounded-xl p-8 text-center shadow-lg animate-fade-in"> 
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" /> 
            <h2 className="text-2xl font-bold text-white">File Berhasil Dibaca!</h2> 
            <div className="inline-flex items-center bg-slate-700/50 text-slate-300 rounded-full px-4 py-2 my-4"> 
              <FileText className="w-5 h-5 mr-2 text-cyan-400" /> 
              <span className="font-medium">{fileName}</span> 
            </div> 
            <p className="text-slate-400 mb-6">File Anda siap diproses. Hierarki akan ditampilkan secara otomatis setelah data dimuat.</p> 
            <button 
              onClick={() => { /* Efek samping sekarang ditangani oleh useEffect */ }} 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-500 transition-all duration-200 transform hover:scale-105" 
              disabled={true} // Nonaktifkan tombol karena proses otomatis
            > 
              Tampilkan Hierarki (PPS) <ArrowRight className="w-5 h-5" /> 
            </button> 
          </div> 
        )}
        {error && (<div className="mt-4 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg flex items-center"><AlertTriangle className="w-5 h-5 mr-3"/><span>{error}</span></div>)}
        
        {groupedData && ( // Tampilkan bagian ini hanya jika groupedData sudah ada
          <div className="animate-fade-in">
             <div className="my-6 p-4 bg-slate-800/50 rounded-lg flex flex-col sm:flex-row gap-4 justify-between items-center">
                <h3 className="text-lg font-bold text-white">Panel Aksi</h3>
                {/* Tombol Generate All Keterangan */}
                <button onClick={handleGenerateAllKeterangan} disabled={generationProgress.total > 0 || !apiKey || isApiKeyInvalid} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors">
                    <Zap className="w-5 h-5" />
                    <span>Buat Semua Keterangan</span>
                </button>
                {/* Tombol Generate All RTL */}
                <button onClick={handleGenerateAllRTL} disabled={generationProgress.total > 0 || !apiKey || isApiKeyInvalid} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white font-semibold rounded-md hover:bg-yellow-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors">
                    <Zap className="w-5 h-5" />
                    <span>Buat Semua RTL</span>
                </button>
                {/* Tombol Generate All Indikator */}
                <button onClick={handleGenerateAllIndikator} disabled={generationProgress.total > 0 || !apiKey || isApiKeyInvalid} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors">
                    <Zap className="w-5 h-5" />
                    <span>Buat Semua Indikator</span>
                </button>
                {/* Tombol Generate All Sasaran */}
                <button onClick={handleGenerateAllSasaran} disabled={generationProgress.total > 0 || !apiKey || isApiKeyInvalid} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors">
                    <Zap className="w-5 h-5" />
                    <span>Buat Semua Sasaran</span>
                </button>
            </div>
            {/* Tombol baru untuk mengalihkan visibilitas bagian dokumen */}
            <div className="my-4 flex flex-col sm:flex-row justify-center gap-4">
                <button
                    onClick={() => setShowDocumentInventory(prev => !prev)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-white font-semibold rounded-md hover:bg-slate-600 transition-colors"
                >
                    {showDocumentInventory ? 'Sembunyikan' : 'Tampilkan'} Inventaris Dokumen
                    <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${showDocumentInventory ? 'rotate-90' : ''}`} />
                </button>
                <button
                    onClick={() => setShowDocumentGrouping(prev => !prev)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-white font-semibold rounded-md hover:bg-slate-600 transition-colors"
                >
                    {showDocumentGrouping ? 'Sembunyikan' : 'Tampilkan'} Pengelompokan Dokumen
                    <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${openStates.showDocumentGrouping ? 'rotate-90' : ''}`} />
                </button>
            </div>


            <div className="space-y-2 mt-8">
              {Object.values(groupedData).map(bab => (
                  <div key={bab.title} className="bg-slate-800 rounded-lg shadow-md overflow-hidden">
                    <div onClick={() => toggleOpen(bab.title)} className="flex justify-between items-center bg-slate-700/50 px-6 py-3 cursor-pointer hover:bg-slate-700">
                      <h2 className="text-xl font-bold text-cyan-400">{bab.title}</h2>
                      <ChevronRight className={`w-6 h-6 text-cyan-400 transition-transform duration-300 ${openStates[bab.title] ? 'rotate-90' : ''}`} />
                    </div>
                    {openStates[bab.title] && (
                        <div className="p-4 space-y-3">
                        {Object.values(bab.standards).map(standard => {
                          const standardId = `${bab.title}-${standard.title}`;
                          return (
                            <div key={standardId} className="bg-slate-900/70 rounded-md">
                              <div onClick={() => toggleOpen(standardId)} className="flex justify-between items-center px-5 py-3 cursor-pointer hover:bg-slate-800/80 border-b border-slate-700">
                                <h3 className="text-lg font-semibold text-teal-300">{standard.title}</h3>
                                <ChevronRight className={`w-5 h-5 text-teal-300 transition-transform duration-300 ${openStates[standardId] ? 'rotate-90' : ''}`} />
                              </div>
                              {openStates[standardId] && (
                                <div className="p-3 space-y-2">
                                  {Object.values(standard.criterias).map(criteria => {
                                    const criteriaId = `${standardId}-${criteria.title}`;
                                    return (
                                      <div key={criteriaId} className="bg-slate-800/60 rounded">
                                        <div onClick={() => toggleOpen(criteriaId)} className="flex justify-between items-center px-4 py-2 cursor-pointer hover:bg-slate-700/70 border-b border-slate-700/50">
                                          <h4 className="font-semibold text-amber-300">{criteria.title}</h4>
                                          <ChevronRight className={`w-5 h-5 text-amber-300 transition-transform duration-300 ${openStates[criteriaId] ? 'rotate-90' : ''}`} />
                                        </div>
                                        {openStates[criteriaId] && (
                                          <div className="p-4 space-y-4">
                                            {criteria.items.map(item => (
                                              <div key={item.id} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                                                <p className="font-bold text-cyan-500 mb-2">{item.kode_ep}</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                                                  <div className="flex items-start gap-2">
                                                    <strong className="text-slate-400 whitespace-nowrap">Rencana Perbaikan:</strong> 
                                                    <span>{item.rencana_perbaikan}</span>
                                                    {(!item.rencana_perbaikan || cleanAiInput(item.rencana_perbaikan) === '') && ( // Tampilkan tombol jika kosong atau dibersihkan kosong
                                                      <button onClick={() => handleGenerateRTL(item)} disabled={loadingStates[item.id + '_rtl'] || isApiKeyInvalid || !apiKey} className="relative group flex-shrink-0 ml-2 p-1 bg-yellow-500/20 rounded-full hover:bg-yellow-500/40 disabled:bg-slate-600 disabled:cursor-not-allowed" title="Mau ide dari AI?">
                                                         {loadingStates[item.id + '_rtl'] ? <LoaderCircle className="w-4 h-4 text-yellow-400 animate-spin"/> : <Lightbulb className="w-4 h-4 text-yellow-400"/>}
                                                      </button>
                                                    )}
                                                  </div>
                                                  <div className="flex items-start gap-2"> {/* Ditambahkan untuk Indikator */}
                                                    <strong className="text-slate-400 whitespace-nowrap">Indikator:</strong> 
                                                    <span>{item.indikator}</span>
                                                    {(!item.indikator || cleanAiInput(item.indikator) === '') && ( // Tampilkan tombol jika kosong atau dibersihkan kosong
                                                      <button onClick={() => handleGenerateIndikator(item)} disabled={loadingStates[item.id + '_indikator'] || isApiKeyInvalid || !apiKey} className="relative group flex-shrink-0 ml-2 p-1 bg-green-500/20 rounded-full hover:bg-green-500/40 disabled:bg-slate-600 disabled:cursor-not-allowed" title="Mau ide dari AI?">
                                                         {loadingStates[item.id + '_indikator'] ? <LoaderCircle className="w-4 h-4 text-green-400 animate-spin"/> : <Lightbulb className="w-4 h-4 text-green-400"/>}
                                                      </button>
                                                    )}
                                                  </div>
                                                  <div className="flex items-start gap-2"> {/* Ditambahkan untuk Sasaran */}
                                                    <strong className="text-slate-400 whitespace-nowrap">Sasaran:</strong> 
                                                    <span>{item.sasaran}</span>
                                                    {(!item.sasaran || cleanAiInput(item.sasaran) === '') && ( // Tampilkan tombol jika kosong atau dibersihkan kosong
                                                      <button onClick={() => handleGenerateSasaran(item)} disabled={loadingStates[item.id + '_sasaran'] || isApiKeyInvalid || !apiKey} className="relative group flex-shrink-0 ml-2 p-1 bg-blue-500/20 rounded-full hover:bg-blue-500/40 disabled:bg-slate-600 disabled:cursor-not-allowed" title="Mau ide dari AI?">
                                                         {loadingStates[item.id + '_sasaran'] ? <LoaderCircle className="w-4 h-4 text-blue-400 animate-spin"/> : <Lightbulb className="w-4 h-4 text-blue-400"/>}
                                                      </button>
                                                    )}
                                                  </div>
                                                  <div><strong className="text-slate-400">Waktu:</strong> {item.waktu}</div>
                                                  <div><strong className="text-slate-400">PJ:</strong> {item.pj}</div>
                                                </div>
                                                <div className="mt-4 pt-4 border-t border-slate-600">
                                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                    <div><strong className="text-slate-300 flex items-center gap-2 mb-1"><FileText size={16} /> Keterangan / Bukti Implementasi:</strong><p className="text-cyan-300 pl-2">{item.keterangan}</p></div>
                                                    {(!item.keterangan || cleanAiInput(item.keterangan) === '') && ( // Tampilkan tombol jika belum dihasilkan atau dibersihkan kosong
                                                      <button onClick={() => handleGenerateKeterangan(item)} disabled={loadingStates[item.id + '_ket'] || isApiKeyInvalid || !apiKey} className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200">
                                                        {loadingStates[item.id + '_ket'] ? <LoaderCircle className="animate-spin w-5 h-5" /> : <BrainCircuit className="w-5 h-5" />}
                                                        <span>{loadingStates[item.id + '_ket'] ? 'Memproses...' : 'Buat Keterangan'}</span>
                                                      </button>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                </div>
              ))}
            </div>
            
            {/* Bagian Inventaris Dokumen (Sekarang dialihkan oleh tombol) */}
            {showDocumentInventory && (
              <div className="mt-8 p-6 bg-slate-800/70 rounded-xl shadow-lg border border-slate-700 animate-fade-in">
                <h3 className="text-xl font-bold text-cyan-400 mb-4">Inventaris Dokumen (Daftar Global)</h3>
                <p className="text-slate-400 mb-4">Daftar unik dokumen yang teridentifikasi beserta elemen penilaian terkait:</p>
                {documentInventory && documentInventory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-slate-700/50 rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-slate-600/70 text-slate-200 uppercase text-sm leading-normal">
                          <th className="py-3 px-6 text-left">Judul Dokumen (Keterangan)</th>
                          <th className="py-3 px-6 text-left">Kode Elemen Penilaian Terkait</th>
                          <th className="py-3 px-6 text-left">Uraian Elemen Penilaian Terkait</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-300 text-sm font-light">
                        {documentInventory.map((doc, index) => (
                          <tr key={index} className="border-b border-slate-600 hover:bg-slate-700/60">
                            <td className="py-3 px-6 text-left whitespace-normal break-words w-1/3">{doc['Judul Dokumen (Keterangan)']}</td>
                            <td className="py-3 px-6 text-left whitespace-normal break-words w-1/4">{doc['Kode Elemen Penilaian Terkait']}</td>
                            <td className="py-3 px-6 text-left whitespace-normal break-words w-auto">{doc['Uraian Elemen Penilaian Terkait']}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-slate-500 italic">Tidak ada dokumen yang ditemukan untuk inventarisasi. Pastikan kolom 'Keterangan' sudah terisi dengan data yang valid.</p>
                )}
              </div>
            )}

            {/* Bagian Dokumen yang Dikelompokkan berdasarkan Jenis (Sekarang dialihkan oleh tombol) */}
            {showDocumentGrouping && (
              <div className="mt-8 p-6 bg-slate-800/70 rounded-xl shadow-lg border border-slate-700 animate-fade-in">
                <h3 className="text-xl font-bold text-cyan-400 mb-4">Pengelompokan Dokumen Berdasarkan Tipe</h3>
                <p className="text-slate-400 mb-4">Dokumen yang teridentifikasi, dikelompokkan berdasarkan tipenya:</p>
                {groupedDocumentsByTypeForDisplay && Object.keys(groupedDocumentsByTypeForDisplay).length > 0 ? (
                  <div className="space-y-4">
                    {Object.keys(groupedDocumentsByTypeForDisplay).sort().map(type => (
                      <div key={type} className="bg-slate-900/70 rounded-md overflow-hidden">
                        <div onClick={() => toggleOpen(`docType-${type}`)} className="flex justify-between items-center px-5 py-3 cursor-pointer hover:bg-slate-800/80 border-b border-slate-700">
                          <h4 className="text-lg font-semibold text-teal-300">{type} ({groupedDocumentsByTypeForDisplay[type].length} dokumen)</h4>
                          <ChevronRight className={`w-5 h-5 text-teal-300 transition-transform duration-300 ${openStates[`docType-${type}`] ? 'rotate-90' : ''}`} />
                        </div>
                        {openStates[`docType-${type}`] && (
                          <div className="p-3 overflow-x-auto">
                            <table className="min-w-full bg-slate-800/60 rounded-lg">
                              <thead>
                                <tr className="bg-slate-700/50 text-slate-200 uppercase text-xs leading-normal">
                                  <th className="py-2 px-4 text-left">Judul Dokumen</th>
                                  <th className="py-2 px-4 text-left">Kode EP Terkait</th>
                                  <th className="py-2 px-4 text-left">Uraian EP Terkait</th>
                                  <th className="py-2 px-4 text-left">Rencana Perbaikan</th>
                                  <th className="py-2 px-4 text-left">Indikator</th>
                                  <th className="py-2 px-4 text-left">Sasaran</th>
                                  <th className="py-2 px-4 text-left">Waktu</th>
                                  <th className="py-2 px-4 text-left">PJ</th>
                                </tr>
                              </thead>
                              <tbody className="text-slate-300 text-xs font-light">
                                {groupedDocumentsByTypeForDisplay[type].map((docItem, itemIndex) => (
                                  <tr key={itemIndex} className="border-b border-slate-700 hover:bg-slate-700/70">
                                    <td className="py-2 px-4 whitespace-normal break-words">{docItem['Judul Dokumen']}</td>
                                    <td className="py-2 px-4 whitespace-normal break-words">{docItem['Kode EP Terkait']}</td>
                                    <td className="py-2 px-4 whitespace-normal break-words">{docItem['Uraian EP Terkait']}</td>
                                    <td className="py-2 px-4 whitespace-normal break-words">{docItem['Rencana Perbaikan']}</td>
                                    <td className="py-2 px-4 whitespace-normal break-words">{docItem['Indikator']}</td>
                                    <td className="py-2 px-4 whitespace-normal break-words">{docItem['Sasaran']}</td>
                                    <td className="py-2 px-4 whitespace-normal break-words">{docItem['Waktu']}</td>
                                    <td className="py-2 px-4 whitespace-normal break-words">{docItem['PJ']}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">Tidak ada dokumen yang ditemukan untuk dikelompokkan. Pastikan kolom 'Keterangan' sudah terisi dengan data yang valid.</p>
                )}
              </div>
            )}

            <div className="mt-8 p-6 bg-slate-800/70 rounded-xl shadow-lg border border-slate-700">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">Kesimpulan & Saran Strategis AI</h3>
              {!aiSummary && !isSummaryLoading && (
                <div className="text-center">
                    <p className="text-slate-400 mb-4">Klik tombol di bawah untuk meminta AI menganalisis seluruh data dan memberikan saran pengelompokan kegiatan.</p>
                    <button onClick={handleGenerateSummary} disabled={!apiKey || isApiKeyInvalid} className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors">
                        <BrainCircuit className="w-5 h-5" />
                        <span>Buat Kesimpulan & Saran AI</span>
                    </button>
                </div>
              )}
              {isSummaryLoading && (
                <div className="flex flex-col items-center justify-center text-center">
                    <LoaderCircle className="w-8 h-8 text-purple-400 animate-spin mb-3" />
                    <p className="text-slate-300">AI sedang menganalisis dan membuat kesimpulan...</p>
                </div>
              )}
              {aiSummary && (
                <div className="prose prose-invert max-w-none text-slate-300" dangerouslySetInnerHTML={{ __html: aiSummary.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              )}
            </div>

            <div className="mt-8 p-6 bg-slate-800/70 rounded-xl shadow-lg border border-slate-700">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">Unduh Hasil</h3>
              <p className="text-slate-400 mb-4">Pilih format file untuk mengunduh data yang telah diproses.</p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                  <select onChange={(e) => setDownloadFormat(e.target.value)} value={downloadFormat} className="w-full sm:w-auto bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                      <option value="xlsx">Excel (.xlsx)</option> <option value="csv">CSV (.csv)</option> <option value="txt">Teks (.txt)</option> <option value="docx">Word (.doc)</option>
                  </select>
                  <button onClick={handleDownload} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2 bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-500 transition-colors duration-200">
                      <Download className="w-5 h-5" /> <span>Unduh File</span>
                  </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
