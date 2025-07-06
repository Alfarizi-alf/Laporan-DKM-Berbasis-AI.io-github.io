// Import modul Firebase dari CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot, collection, query, where, addDoc, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Pastikan semua pustaka global sudah dimuat sebelum menjalankan aplikasi
function startApp() {
    // Destructure pustaka yang dimuat secara global dari window object
    const { useState, useCallback, useEffect } = React;
    const { useDropzone } = window.ReactDropzone;
    const { UploadCloud, FileText, BrainCircuit, LoaderCircle, AlertTriangle, ChevronRight, CheckCircle, ArrowRight, Download, Lightbulb, Zap, XCircle } = lucide;

    // Fungsi pembantu untuk memuat skrip XLSX secara dinamis dari CDN (sebagai fallback)
    const loadXlsxScript = () => {
      return new Promise((resolve, reject) => {
        if (window.XLSX) return resolve(window.XLSX);
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        script.onload = () => resolve(window.XLSX);
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
    function App() {
      const [apiKey, setApiKey] = useState('');
      const [rawData, setRawData] = useState(null);
      const [groupedData, setGroupedData] = useState(null);
      const [fileName, setFileName] = useState('');
      const [error, setError] = useState('');
      const [loadingStates, setLoadingStates] = useState({});
      const [isProcessingFile, setIsProcessingFile] = useState(false);
      const [downloadFormat, setDownloadFormat] = useState('xlsx');
      const [openStates, setOpenStates] = useState({});
      const [aiSummary, setAiSummary] = useState('');
      const [isSummaryLoading, setIsSummaryLoading] = useState(false);
      const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0, message: '' });
      const [documentInventory, setDocumentInventory] = useState(null);
      const [groupedDocumentsByTypeForDisplay, setGroupedDocumentsByTypeForDisplay] = useState(null);
      const [isApiKeyInvalid, setIsApiKeyInvalid] = useState(false);
      const [showDocumentInventory, setShowDocumentInventory] = useState(false);
      const [showDocumentGrouping, setShowDocumentGrouping] = useState(false);
      const [modalMessage, setModalMessage] = useState({ message: '', type: '' });
      const [batchResult, setBatchResult] = useState(null);
      const [db, setDb] = useState(null);
      const [userId, setUserId] = useState(null);
      const [isAuthReady, setIsAuthReady] = useState(false);

      // --- Inisialisasi dan Otentikasi Firebase ---
      useEffect(() => {
        try {
          // __firebase_config disediakan secara global di index.html
          const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
          if (!firebaseConfig || !firebaseConfig.apiKey || firebaseConfig.apiKey.includes("GANTI_DENGAN")) {
            console.error("Konfigurasi Firebase tidak valid atau belum diatur di index.html.");
            setModalMessage({ message: "Konfigurasi Firebase tidak ditemukan atau tidak valid. Fitur penyimpanan data tidak akan berfungsi. Harap perbarui file index.html.", type: 'error' });
            setIsAuthReady(true);
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
              try {
                // __initial_auth_token disediakan secara global di index.html
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                  await signInWithCustomToken(auth, __initial_auth_token);
                } else {
                  await signInAnonymously(auth);
                }
              } catch (authError) {
                console.error("Kesalahan Otentikasi Firebase:", authError);
                setModalMessage({ message: `Gagal otentikasi Firebase: ${authError.message}`, type: 'error' });
              }
            }
            setIsAuthReady(true);
          });

          return () => unsubscribe();
        } catch (e) {
          console.error("Kesalahan saat menginisialisasi Firebase:", e);
          setModalMessage({ message: `Gagal menginisialisasi Firebase: ${e.message}`, type: 'error' });
          setIsAuthReady(true);
        }
      }, []);

      // --- Penyimpanan Data Firestore ---
      const saveToFirestore = useCallback(async (dataToSave, currentFileName, currentUserId) => {
        if (!db || !currentUserId || !currentFileName) return;
        if (Object.keys(dataToSave).length === 0 && !aiSummary) return;
        
        // __app_id disediakan secara global di index.html
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const docRef = doc(db, `artifacts/${appId}/users/${currentUserId}/pps_data`, currentFileName);
        
        try {
          await setDoc(docRef, {
            groupedData: dataToSave,
            aiSummary: aiSummary,
            timestamp: new Date(),
          }, { merge: true });
          console.log("Data berhasil disimpan ke Firestore!");
        } catch (e) {
          console.error("Kesalahan saat menyimpan ke Firestore:", e);
          setError(`Gagal menyimpan ke cloud: ${e.message}`);
        }
      }, [db, aiSummary]);

      // Efek untuk memicu penyimpanan
      useEffect(() => {
        if (isAuthReady && userId && fileName && groupedData) {
          const handler = setTimeout(() => {
            saveToFirestore(groupedData, fileName, userId);
          }, 1500);
          return () => clearTimeout(handler);
        }
      }, [groupedData, aiSummary, userId, fileName, isAuthReady, saveToFirestore]);

      const toggleOpen = (id) => setOpenStates(prev => ({ ...prev, [id]: !prev[id] }));

      // Fungsi untuk memproses data mentah menjadi hierarki terstruktur
      const processData = (data) => {
        const groups = {};
        data.forEach((row, index) => {
          const cleanedRow = Object.keys(row).reduce((acc, key) => {
              acc[key.trim().toLowerCase().replace(/\s+/g, '')] = row[key];
              return acc;
          }, {});
          
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
          
          const [bab, standar, kriteria, ...epParts] = parts;
          const ep = epParts.join('.');

          if (!groups[bab]) groups[bab] = { title: `BAB ${bab}`, standards: {} };
          if (!groups[bab].standards[standar]) groups[bab].standards[standar] = { title: `Standar ${standar}`, criterias: {} };
          if (!groups[bab].standards[standar].criterias[kriteria]) {
            groups[bab].standards[standar].criterias[kriteria] = { title: `Kriteria ${kriteria}`, items: [] };
          }
          
          const itemData = {
            id: `${code}-${index}`,
            kode_ep: code,
            uraian_ep: cleanedRow['uraianelemenpenilaian'] || '',
            rekomendasi_survey: cleanedRow['rekomendasihasilsurvey'] || '',
            rencana_perbaikan: cleanedRow['rencanaperbaikan'] || '',
            indikator: cleanedRow['indikatorpencapaian'] || cleanedRow['indikator'] || '',
            sasaran: cleanedRow['sasaran'] || '',
            waktu: cleanedRow['waktupenyelesaian'] || cleanedRow['waktu'] || '',
            pj: cleanedRow['penanggungjawab'] || cleanedRow['pj'] || '',
            keterangan: "Klik 'Buat Keterangan'",
          };
          groups[bab].standards[standar].criterias[kriteria].items.push(itemData);
        });
        return groups;
      };

      const onDrop = useCallback(async (acceptedFiles) => {
        setError(''); setRawData(null); setGroupedData(null); setFileName(''); setAiSummary(''); setDocumentInventory(null); setGroupedDocumentsByTypeForDisplay(null); setIsApiKeyInvalid(false); setShowDocumentInventory(false); setShowDocumentGrouping(false); setModalMessage({ message: '', type: '' }); setBatchResult(null);
        setIsProcessingFile(true);
        const file = acceptedFiles[0];
        if (!file) { setModalMessage({ message: "File tidak valid.", type: 'error' }); setIsProcessingFile(false); return; }
        setFileName(file.name);

        try {
          const XLSX = await loadXlsxScript();
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const workbook = XLSX.read(event.target.result, { type: 'binary' });
              const sheetName = workbook.SheetNames[0];
              const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {defval: ""});
              if(jsonData.length === 0) { 
                setModalMessage({ message: "File Excel kosong atau formatnya tidak bisa dibaca.", type: 'error' }); 
                setRawData(null);
                return; 
              }
              setRawData(jsonData); 
            } catch (e) { 
              setModalMessage({ message: "Terjadi kesalahan saat memproses file Excel. Pastikan format file benar.", type: 'error' });
              console.error("Kesalahan pemprosesan file:", e);
            } finally { 
              setIsProcessingFile(false); 
            }
          };
          reader.onerror = () => { 
            setModalMessage({ message: "Gagal membaca file.", type: 'error' }); 
            setIsProcessingFile(false); 
          }
          reader.readAsBinaryString(file);
        } catch (err) { 
          setModalMessage({ message: err.message, type: 'error' }); 
          setIsProcessingFile(false); 
        }
      }, []);

      const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'text/csv': ['.csv'] }, disabled: isProcessingFile });

      useEffect(() => {
        const loadAndProcess = async () => {
          if (!rawData || !isAuthReady || !userId || !db || !fileName) return;
          
          setGenerationProgress({ current: 0, total: 0, message: 'Memproses data dan memuat dari cloud...' });
          setError('');

          try {
            let processedData = processData(rawData);
            if (Object.keys(processedData).length === 0) {
                setError("Data tidak dapat diproses. Pastikan file Anda memiliki kolom kode hierarki yang valid.");
                setRawData(null); 
                setGenerationProgress({ current: 0, total: 0, message: '' });
                return;
            }
            
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            const docRef = doc(db, `artifacts/${appId}/users/${userId}/pps_data`, fileName);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              console.log("Memuat data dari Firestore untuk file:", fileName);
              const savedData = docSnap.data();
              const savedGroupedData = savedData.groupedData;
              const savedAiSummary = savedData.aiSummary;

              for (const babKey in processedData) {
                if (savedGroupedData && savedGroupedData[babKey]) {
                  for (const stdKey in processedData[babKey].standards) {
                    if (savedGroupedData[babKey].standards[stdKey]) {
                      for (const kriKey in processedData[babKey].standards[stdKey].criterias) {
                        if (savedGroupedData[babKey].standards[stdKey].criterias[kriKey]) {
                          processedData[babKey].standards[stdKey].criterias[kriKey].items = 
                            processedData[babKey].standards[stdKey].criterias[kriKey].items.map(newItem => {
                              const existingItem = savedGroupedData[babKey].standards[stdKey].criterias[kriKey].items.find(si => si.id === newItem.id);
                              return existingItem ? { ...newItem, ...existingItem } : newItem;
                            });
                        }
                      }
                    }
                  }
                }
              }
              setAiSummary(savedAiSummary || '');
            }
            setGroupedData(processedData);
            setGenerationProgress({ current: 0, total: 0, message: '' });
          } catch (e) { 
            setError("Terjadi kesalahan saat membuat hierarki atau memuat data dari cloud."); 
            console.error("Kesalahan pemprosesan hierarki atau pemuatan Firestore:", e);
            setGenerationProgress({ current: 0, total: 0, message: '' });
          }
        };
        loadAndProcess();
      }, [rawData, userId, db, isAuthReady, fileName]);

      const updateItemState = useCallback((itemId, field, value) => {
        setGroupedData(prev => {
          if (!prev) return prev;
          const newGroupedData = JSON.parse(JSON.stringify(prev));
          for (const babKey in newGroupedData) {
            for (const stdKey in newGroupedData[babKey].standards) {
              for (const kriKey in newGroupedData[babKey].standards[stdKey].criterias) {
                const criteria = newGroupedData[babKey].standards[stdKey].criterias[kriKey];
                const itemIndex = criteria.items.findIndex(i => i.id === itemId);
                if (itemIndex > -1) {
                  criteria.items[itemIndex][field] = value;
                  return newGroupedData;
                }
              }
            }
          }
          return prev;
        });
      }, []);

      const callAiApi = async (prompt) => {
        if (!apiKey) {
          setIsApiKeyInvalid(true);
          throw new Error("API_KEY_MISSING");
        }
        setIsApiKeyInvalid(false);
        
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
        let response;
        try {
            response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(payload) 
            });
        } catch (networkError) {
            console.error("Kesalahan Jaringan:", networkError);
            throw new Error("NETWORK_ERROR");
        }

        if (!response.ok) {
          const errorBody = await response.json();
          if (response.status === 429) return 'RATE_LIMIT';
          if (response.status === 400 && errorBody?.error?.message.includes("API key not valid")) {
            setIsApiKeyInvalid(true);
            throw new Error("API_KEY_INVALID");
          }
          throw new Error(`Kesalahan HTTP: ${response.status} - ${errorBody?.error?.message || 'Tidak dikenal'}`);
        }
        const result = await response.json();
        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
            return result.candidates[0].content.parts[0].text.trim().replace(/^"|"$/g, '');
        }
        return "Respons AI tidak valid.";
      };

      const handleApiError = (e) => {
        let message = `Gagal menghubungi AI: ${e.message}`;
        if (e.message === "API_KEY_INVALID") message = "Kunci API tidak valid. Periksa kembali dan coba lagi.";
        else if (e.message === "API_KEY_MISSING") message = "Harap masukkan Kunci API Google AI Anda.";
        else if (e.message === "NETWORK_ERROR") message = "Gagal terhubung ke server AI. Periksa koneksi internet Anda.";
        setModalMessage({ message, type: 'error' });
        console.error("Kesalahan API:", e);
      };

      const cleanAiInput = (text) => {
        if (typeof text !== 'string') text = String(text || '');
        const cleaned = text.trim();
        const placeholders = ['Klik \'Buat Keterangan\'', 'Gagal diproses', 'Input data tidak siap', 'Batas permintaan AI tercapai', 'Data tidak cukup', 'Gagal setelah beberapa percobaan'];
        if (placeholders.some(p => cleaned.includes(p))) return '';
        return cleaned;
      };

      const createAIGenerationHandler = (config) => async (item) => {
        const { field, loadingKey, promptTemplate, requiredFields } = config;
        
        const inputs = requiredFields.map(rf => cleanAiInput(item[rf]));
        if (inputs.every(input => !input)) {
          updateItemState(item.id, field, 'Input data tidak siap');
          return;
        }

        setLoadingStates(prev => ({ ...prev, [loadingKey(item.id)]: true }));
        const prompt = promptTemplate(inputs);

        let success = false;
        for (let attempts = 0; attempts < 3; attempts++) {
            try {
                const generatedText = await callAiApi(prompt);
                if (generatedText === 'RATE_LIMIT') {
                    updateItemState(item.id, field, `Batas permintaan AI tercapai, mencoba lagi...`);
                    await new Promise(resolve => setTimeout(resolve, 2000 * (attempts + 1)));
                    continue;
                }
                updateItemState(item.id, field, generatedText);
                success = true;
                break;
            } catch (e) {
                handleApiError(e);
                updateItemState(item.id, field, `Gagal diproses: ${e.message}`);
                success = true; // Stop retrying on non-rate-limit errors
                break;
            }
        }
        if (!success) {
            updateItemState(item.id, field, 'Gagal setelah beberapa percobaan.');
        }
        setLoadingStates(prev => ({ ...prev, [loadingKey(item.id)]: false }));
      };
      
      const handleGenerateKeterangan = createAIGenerationHandler({
        field: 'keterangan',
        loadingKey: id => `${id}_ket`,
        requiredFields: ['rencana_perbaikan', 'indikator', 'sasaran'],
        promptTemplate: ([rtl, ind, sas]) => `PERAN: Anda adalah auditor akreditasi. TUGAS: Buatkan satu judul DOKUMEN BUKTI IMPLEMENTASI yang konkret. DATA: - Rencana Perbaikan: "${rtl}" - Indikator: "${ind}" - Sasaran: "${sas}". ATURAN: Jawaban harus satu frasa/kalimat tunggal, spesifik, format nama dokumen resmi.`
      });

      const handleGenerateRTL = createAIGenerationHandler({
        field: 'rencana_perbaikan',
        loadingKey: id => `${id}_rtl`,
        requiredFields: ['uraian_ep', 'rekomendasi_survey'],
        promptTemplate: ([uraian, rekomen]) => `PERAN: Anda adalah konsultan mutu. TUGAS: Buatkan satu kalimat RENCANA PERBAIKAN (RTL) yang operasional. DATA: - Uraian EP: "${uraian}" - Rekomendasi Awal: "${rekomen}". ATURAN: Jawaban harus kalimat tindakan yang jelas.`
      });

      const handleGenerateIndikator = createAIGenerationHandler({
        field: 'indikator',
        loadingKey: id => `${id}_indikator`,
        requiredFields: ['uraian_ep', 'rencana_perbaikan'],
        promptTemplate: ([uraian, rtl]) => `PERAN: Anda adalah perencana mutu. TUGAS: Buatkan satu poin INDIKATOR PENCAPAIAN yang spesifik & terukur. DATA: - Uraian EP: "${uraian}" - Rencana Perbaikan: "${rtl}". ATURAN: Jawaban harus frasa indikator yang jelas.`
      });

      const handleGenerateSasaran = createAIGenerationHandler({
        field: 'sasaran',
        loadingKey: id => `${id}_sasaran`,
        requiredFields: ['uraian_ep', 'rencana_perbaikan'],
        promptTemplate: ([uraian, rtl]) => `PERAN: Anda adalah manajer strategi. TUGAS: Buatkan satu poin SASARAN yang jelas & berorientasi hasil. DATA: - Uraian EP: "${uraian}" - Rencana Perbaikan: "${rtl}". ATURAN: Jawaban harus kalimat sasaran yang ringkas.`
      });

      const createMassGenerationHandler = (handler, requiredFields, fieldName) => async () => {
          if (!groupedData || !apiKey) {
              setModalMessage({ message: `Harap ${!groupedData ? 'unggah file' : 'masukkan Kunci API'}.`, type: 'error' });
              if (!apiKey) setIsApiKeyInvalid(true);
              return;
          }

          const allItems = Object.values(groupedData).flatMap(bab => Object.values(bab.standards).flatMap(std => Object.values(std.criterias).flatMap(kri => kri.items)));
          const itemsToProcess = allItems.filter(item => {
              const hasRequiredData = requiredFields.some(rf => cleanAiInput(item[rf]));
              const isFieldEmpty = !cleanAiInput(item[fieldName]);
              return hasRequiredData && isFieldEmpty;
          });

          if (itemsToProcess.length === 0) {
              setModalMessage({ message: `Tidak ada item yang perlu diproses untuk '${fieldName}'.`, type: 'info' });
              return;
          }

          setGenerationProgress({ current: 0, total: itemsToProcess.length, message: `Memulai proses 'Buat Semua ${fieldName}'...` });
          
          let successful = 0, failed = 0;
          const CHUNK_SIZE = 5;
          for (let i = 0; i < itemsToProcess.length; i += CHUNK_SIZE) {
              const chunk = itemsToProcess.slice(i, i + CHUNK_SIZE);
              await Promise.all(chunk.map(async (item) => {
                  try {
                      await handler(item);
                      successful++;
                  } catch {
                      failed++;
                  }
                  setGenerationProgress(prev => ({ ...prev, current: prev.current + 1 }));
              }));
              if (i + CHUNK_SIZE < itemsToProcess.length) {
                  await new Promise(resolve => setTimeout(resolve, 1500));
              }
          }
          
          setBatchResult({ success: successful, failed: failed, field: fieldName });
          setGenerationProgress({ current: 0, total: 0, message: '' });
      };

      const handleGenerateAllKeterangan = createMassGenerationHandler(handleGenerateKeterangan, ['rencana_perbaikan', 'indikator', 'sasaran'], 'keterangan');
      const handleGenerateAllRTL = createMassGenerationHandler(handleGenerateRTL, ['uraian_ep', 'rekomendasi_survey'], 'rencana_perbaikan');
      const handleGenerateAllIndikator = createMassGenerationHandler(handleGenerateIndikator, ['uraian_ep', 'rencana_perbaikan'], 'indikator');
      const handleGenerateAllSasaran = createMassGenerationHandler(handleGenerateSasaran, ['uraian_ep', 'rencana_perbaikan'], 'sasaran');


      const prepareDocumentInventoryData = useCallback(() => {
        if (!groupedData) return [];
        const inventoryMap = new Map();
        Object.values(groupedData).forEach(bab => 
          Object.values(bab.standards).forEach(std => 
            Object.values(std.criterias).forEach(kri => 
              kri.items.forEach(item => {
                const docTitle = cleanAiInput(item.keterangan);
                if (docTitle) {
                  if (!inventoryMap.has(docTitle)) inventoryMap.set(docTitle, { kode_ep_list: new Set(), uraian_ep_list: new Set() });
                  inventoryMap.get(docTitle).kode_ep_list.add(item.kode_ep);
                  inventoryMap.get(docTitle).uraian_ep_list.add(item.uraian_ep);
                }
              })
            )
          )
        );
        return Array.from(inventoryMap).map(([docTitle, data]) => ({
          'Judul Dokumen (Keterangan)': docTitle,
          'Kode Elemen Penilaian Terkait': Array.from(data.kode_ep_list).sort().join(', '),
          'Uraian Elemen Penilaian Terkait': Array.from(data.uraian_ep_list).sort().join('; '),
        }));
      }, [groupedData]);

      const getDocumentType = (keterangan) => {
          const lower = keterangan.toLowerCase();
          if (lower.startsWith('sk ')) return 'SK (Surat Keputusan)';
          if (lower.startsWith('sop ') || lower.includes('standar operasional prosedur')) return 'SOP';
          if (lower.includes('notulen') || lower.includes('risalah rapat')) return 'Notulen Rapat';
          if (lower.includes('laporan')) return 'Laporan';
          if (lower.includes('pedoman')) return 'Pedoman';
          if (lower.includes('panduan')) return 'Panduan';
          if (lower.includes('kak') || lower.includes('kerangka acuan')) return 'KAK';
          return 'Dokumen Lain-lain';
      };

      const prepareGroupedDocumentDataForDisplay = useCallback(() => {
        if (!groupedData) return {};
        const groupedByType = {};
        Object.values(groupedData).forEach(bab => 
          Object.values(bab.standards).forEach(std => 
            Object.values(std.criterias).forEach(kri => 
              kri.items.forEach(item => {
                const docTitle = cleanAiInput(item.keterangan);
                if (docTitle) {
                  const type = getDocumentType(docTitle);
                  if (!groupedByType[type]) groupedByType[type] = [];
                  groupedByType[type].push({ ...item, 'Judul Dokumen': docTitle });
                }
              })
            )
          )
        );
        return groupedByType;
      }, [groupedData]);
      
      const prepareGroupedDocumentDataForExcel = useCallback(() => {
        if (!groupedData) return [];
        const flattened = [];
        Object.values(groupedData).forEach(bab => 
          Object.values(bab.standards).forEach(std => 
            Object.values(std.criterias).forEach(kri => 
              kri.items.forEach(item => {
                const docTitle = cleanAiInput(item.keterangan);
                if (docTitle) {
                  flattened.push({
                    'Tipe Dokumen': getDocumentType(docTitle),
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
              })
            )
          )
        );
        return flattened.sort((a, b) => a['Tipe Dokumen'].localeCompare(b['Tipe Dokumen']));
      }, [groupedData]);


      useEffect(() => {
        setDocumentInventory(prepareDocumentInventoryData());
        setGroupedDocumentsByTypeForDisplay(prepareGroupedDocumentDataForDisplay());
      }, [groupedData, prepareDocumentInventoryData, prepareGroupedDocumentDataForDisplay]);

      const handleGenerateSummary = async () => {
        if (!groupedData || !apiKey) {
            setModalMessage({ message: `Harap ${!groupedData ? 'unggah file' : 'masukkan Kunci API'}.`, type: 'error' });
            if (!apiKey) setIsApiKeyInvalid(true);
            return;
        }
        setIsSummaryLoading(true);
        setAiSummary('');

        const allItemsText = Object.values(groupedData).flatMap(bab => Object.values(bab.standards).flatMap(std => Object.values(std.criterias).flatMap(kri => kri.items.filter(item => cleanAiInput(item.rencana_perbaikan)).map(item => `Elemen ${item.kode_ep}: ${cleanAiInput(item.rencana_perbaikan)}`)))).join('\n');

        if (!allItemsText.trim()) {
            setAiSummary('Tidak ada Rencana Perbaikan yang cukup untuk dibuat kesimpulan.');
            setIsSummaryLoading(false);
            return;
        }

        const prompt = `PERAN: Anda adalah manajer mutu senior. TUGAS: Analisis semua rencana perbaikan (RTL) yang diberikan. Kelompokkan Elemen Penilaian (EP) yang relevan ke dalam kategori kegiatan strategis (Audit Mutu, Sosialisasi, Konsultasi Eksternal, Monev Rutin, Kegiatan Lain). DATA RTL:\n${allItemsText}\n\nATURAN: Berikan jawaban dalam format Markdown. Gunakan heading untuk setiap kategori. Di bawah setiap heading, sebutkan kode EP yang relevan.`;
        
        try {
            const generatedText = await callAiApi(prompt);
            setAiSummary(generatedText);
        } catch (e) {
            handleApiError(e);
            setAiSummary(`**Terjadi Kesalahan:** Gagal membuat kesimpulan. ${e.message}`);
        } finally {
            setIsSummaryLoading(false);
        }
      };
      
      const handleDownloadTemplate = async () => {
        try {
          const XLSX = await loadXlsxScript();
          const wb = XLSX.utils.book_new();
          const headers = ['Kode EP', 'Uraian Elemen Penilaian', 'Rekomendasi Hasil Survey', 'Rencana Perbaikan', 'Indikator Pencapaian', 'Sasaran', 'Waktu Penyelesaian', 'Penanggung Jawab', 'Keterangan'];
          const ws = XLSX.utils.aoa_to_sheet([headers]);
          XLSX.utils.book_append_sheet(wb, ws, "Template PPS");
          const xlsxData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          const blob = new Blob([xlsxData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Template PPS - ${new Date().toISOString().slice(0,10)}.xlsx`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
          setModalMessage({ message: "Template Excel berhasil diunduh!", type: 'info' });
        } catch (e) {
          setModalMessage({ message: `Gagal mengunduh template: ${e.message}`, type: 'error' });
        }
      };
      
      const handleDownload = async () => {
        if (!groupedData) {
            setModalMessage({ message: "Tidak ada data untuk diunduh.", type: 'info' });
            return;
        }
        const XLSX = await loadXlsxScript();
        const outputFilename = `Hasil PPS - ${fileName.replace(/\.[^/.]+$/, "")} - ${new Date().toISOString().slice(0,10)}`;
        
        const wb = XLSX.utils.book_new();
        
        // Sheet 1: Data PPS Lengkap
        const flattenedData = Object.values(groupedData).flatMap(bab => Object.values(bab.standards).flatMap(std => Object.values(std.criterias).flatMap(kri => kri.items.map(item => {
            const [babNum, stdNum, kriNum, ...epParts] = item.kode_ep.split('.');
            return { 'BAB': babNum, 'STANDAR': stdNum, 'KRITERIA': kriNum, 'ELEMEN PENILAIAN': epParts.join('.'), 'RENCANA PERBAIKAN': item.rencana_perbaikan, 'INDIKATOR': item.indikator, 'SASARAN': item.sasaran, 'WAKTU': item.waktu, 'PJ': item.pj, 'KETERANGAN': item.keterangan };
        }))));
        const wsData = XLSX.utils.json_to_sheet(flattenedData);
        XLSX.utils.book_append_sheet(wb, wsData, "Data PPS");

        // Sheet 2: Inventaris Dokumen
        const docInventoryData = prepareDocumentInventoryData();
        if (docInventoryData.length > 0) {
            const wsDocInventory = XLSX.utils.json_to_sheet(docInventoryData);
            XLSX.utils.book_append_sheet(wb, wsDocInventory, "Inventaris Dokumen");
        }

        // Sheet 3: Pengelompokan Dokumen
        const groupedDocDataForExcel = prepareGroupedDocumentDataForExcel();
        if (groupedDocDataForExcel.length > 0) {
            const wsGroupedDocs = XLSX.utils.json_to_sheet(groupedDocDataForExcel);
            XLSX.utils.book_append_sheet(wb, wsGroupedDocs, "Pengelompokan Dokumen");
        }

        // Sheet 4: Kesimpulan AI
        if (aiSummary) {
            const summaryText = aiSummary.replace(/\*\*(.*?)\*\*/g, '$1').replace(/###\s/g, '');
            const summaryRows = summaryText.split('\n').map(line => [line]);
            const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
            wsSummary['!cols'] = [{ wch: 100 }];
            XLSX.utils.book_append_sheet(wb, wsSummary, "Kesimpulan AI");
        }

        const xlsxData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([xlsxData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${outputFilename}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        setModalMessage({ message: "File Excel berhasil diunduh!", type: 'info' });
      };

      // JSX Rendering
      return (
        <div className="bg-slate-900 min-h-screen text-white font-sans p-4 sm:p-6 lg:p-8">
           <MessageModal message={modalMessage.message} type={modalMessage.type} onClose={() => setModalMessage({ message: '', type: '' })} />
           {batchResult && (
             <MessageModal
               message={`Proses 'Buat Semua ${batchResult.field}' selesai:\nBerhasil: ${batchResult.success}\nGagal: ${batchResult.failed}`}
               type={batchResult.failed > 0 ? 'error' : 'info'}
               onClose={() => setBatchResult(null)}
             />
           )}
           {(generationProgress.total > 0 || !isAuthReady || isProcessingFile) && (
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
              <LoaderCircle className="w-16 h-16 text-cyan-500 mb-4 animate-spin" />
              <p className="text-white text-xl mt-4">
                {!isAuthReady ? "Menyiapkan aplikasi..." : isProcessingFile ? "Memproses file..." : generationProgress.message}
              </p>
              {generationProgress.total > 0 && (
                <div className="w-1/2 mt-4">
                    <p className="text-slate-400 text-center">{generationProgress.current} dari {generationProgress.total}</p>
                    <div className="bg-slate-700 rounded-full h-2.5 mt-2">
                        <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${(generationProgress.current / generationProgress.total) * 100}%` }}></div>
                    </div>
                </div>
              )}
            </div>
          )}
          <div className="max-w-7xl mx-auto">
            <header className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-cyan-400">Rencana Perbaikan Akreditasi Berbasis AI</h1>
                <p className="text-slate-400 mt-2">Unggah file Excel, biarkan AI bekerja, lalu unduh hasilnya.</p>
            </header>
            
            <div className="bg-slate-800 rounded-xl p-6 mb-8 shadow-lg">
               <label htmlFor="apiKey" className="block text-sm font-medium text-slate-300 mb-2">Kunci API Google AI</label>
               <input id="apiKey" type="password" value={apiKey} onChange={(e) => { setApiKey(e.target.value); setIsApiKeyInvalid(false); }} placeholder="Masukkan Kunci API Anda dari Google AI Studio..." className={`w-full bg-slate-700 border rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${isApiKeyInvalid ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 focus:ring-cyan-500'}`} />
               <div className="mt-4">
                  <button onClick={() => setOpenStates(prev => ({...prev, isHelpOpen: !prev.isHelpOpen}))} className="text-sm font-medium text-cyan-400 cursor-pointer hover:text-cyan-300 list-none flex items-center gap-1">
                      Bagaimana cara mendapatkan Kunci API?
                      <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${openStates.isHelpOpen ? 'rotate-90' : ''}`} />
                  </button>
                  {openStates.isHelpOpen && (
                    <div className="mt-2 text-sm text-slate-400 bg-slate-900/50 p-4 rounded-md border border-slate-700">
                        <ol className="list-decimal list-inside space-y-2">
                            <li>Buka <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">Google AI Studio</a>.</li>
                            <li>Klik <span className="font-semibold text-slate-300">"Create API key"</span>.</li>
                            <li>Salin kunci API yang muncul, lalu tempel ke kolom di atas.</li>
                        </ol>
                    </div>
                  )}
               </div>
            </div>

            {!groupedData && (
                <div className="flex flex-col items-center justify-center gap-4">
                    <div {...getRootProps()} className={`w-full p-10 border-2 border-dashed rounded-xl transition-all duration-300 ${isProcessingFile ? 'cursor-wait bg-slate-800' : 'cursor-pointer hover:border-cyan-500 hover:bg-slate-800'} ${isDragActive ? 'border-cyan-400 bg-slate-700' : 'border-slate-600'}`}>
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center justify-center text-center">
                            <UploadCloud className="w-12 h-12 text-slate-500 mb-4" />
                            <p className="text-lg font-semibold text-slate-300">{isDragActive ? "Lepaskan file di sini..." : "Seret & lepas file Excel di sini"}</p>
                            <p className="text-sm text-slate-400 mt-1">atau klik untuk memilih file</p>
                        </div>
                    </div>
                    <button onClick={handleDownloadTemplate} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-500 transition-all duration-200">
                        <Download className="w-5 h-5" /> <span>Unduh Template Kosong</span>
                    </button>
                </div>
            )}
            
            {groupedData && (
              <div className="animate-fade-in">
                 <div className="my-6 p-4 bg-slate-800/50 rounded-lg flex flex-wrap gap-4 justify-center items-center">
                    <button onClick={handleGenerateAllRTL} disabled={generationProgress.total > 0 || !apiKey} className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white font-semibold rounded-md hover:bg-yellow-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors">
                        <Zap className="w-5 h-5" /><span>Buat Semua RTL</span>
                    </button>
                    <button onClick={handleGenerateAllIndikator} disabled={generationProgress.total > 0 || !apiKey} className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors">
                        <Zap className="w-5 h-5" /><span>Buat Semua Indikator</span>
                    </button>
                    <button onClick={handleGenerateAllSasaran} disabled={generationProgress.total > 0 || !apiKey} className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors">
                        <Zap className="w-5 h-5" /><span>Buat Semua Sasaran</span>
                    </button>
                    <button onClick={handleGenerateAllKeterangan} disabled={generationProgress.total > 0 || !apiKey} className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors">
                        <Zap className="w-5 h-5" /><span>Buat Semua Keterangan</span>
                    </button>
                </div>
                
                <div className="my-4 flex flex-col sm:flex-row justify-center gap-4">
                    <button onClick={() => setShowDocumentInventory(p => !p)} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-white font-semibold rounded-md hover:bg-slate-600">
                        {showDocumentInventory ? 'Sembunyikan' : 'Tampilkan'} Inventaris Dokumen <ChevronRight className={`w-4 h-4 transition-transform ${showDocumentInventory ? 'rotate-90' : ''}`} />
                    </button>
                    <button onClick={() => setShowDocumentGrouping(p => !p)} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-white font-semibold rounded-md hover:bg-slate-600">
                        {showDocumentGrouping ? 'Sembunyikan' : 'Tampilkan'} Pengelompokan Dokumen <ChevronRight className={`w-4 h-4 transition-transform ${showDocumentGrouping ? 'rotate-90' : ''}`} />
                    </button>
                </div>

                {/* Main Data Hierarchy */}
                <div className="space-y-2 mt-8">
                  {Object.values(groupedData).map(bab => (
                      <div key={bab.title} className="bg-slate-800 rounded-lg shadow-md">
                        <div onClick={() => toggleOpen(bab.title)} className="flex justify-between items-center bg-slate-700/50 px-6 py-3 cursor-pointer hover:bg-slate-700">
                          <h2 className="text-xl font-bold text-cyan-400">{bab.title}</h2>
                          <ChevronRight className={`w-6 h-6 text-cyan-400 transition-transform ${openStates[bab.title] ? 'rotate-90' : ''}`} />
                        </div>
                        {openStates[bab.title] && (
                            <div className="p-2 md:p-4 space-y-3">
                            {Object.values(bab.standards).map(standard => (
                                <div key={standard.title} className="bg-slate-900/70 rounded-md">
                                  <div onClick={() => toggleOpen(standard.title)} className="flex justify-between items-center px-5 py-3 cursor-pointer hover:bg-slate-800/80">
                                    <h3 className="text-lg font-semibold text-teal-300">{standard.title}</h3>
                                    <ChevronRight className={`w-5 h-5 text-teal-300 transition-transform ${openStates[standard.title] ? 'rotate-90' : ''}`} />
                                  </div>
                                  {openStates[standard.title] && (
                                    <div className="p-1 md:p-3 space-y-2">
                                      {Object.values(standard.criterias).map(criteria => (
                                          <div key={criteria.title} className="bg-slate-800/60 rounded">
                                            <div onClick={() => toggleOpen(criteria.title)} className="flex justify-between items-center px-4 py-2 cursor-pointer hover:bg-slate-700/70">
                                              <h4 className="font-semibold text-amber-300">{criteria.title}</h4>
                                              <ChevronRight className={`w-5 h-5 text-amber-300 transition-transform ${openStates[criteria.title] ? 'rotate-90' : ''}`} />
                                            </div>
                                            {openStates[criteria.title] && (
                                              <div className="p-2 md:p-4 space-y-4">
                                                {criteria.items.map(item => (
                                                  <div key={item.id} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                                                    <p className="font-bold text-cyan-500 mb-2">{item.kode_ep}</p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-sm">
                                                      {/* Fields with AI generation buttons */}
                                                      {[
                                                        {label: 'Rencana Perbaikan', field: 'rencana_perbaikan', handler: handleGenerateRTL, loadingKey: `${item.id}_rtl`, color: 'yellow'},
                                                        {label: 'Indikator', field: 'indikator', handler: handleGenerateIndikator, loadingKey: `${item.id}_indikator`, color: 'green'},
                                                        {label: 'Sasaran', field: 'sasaran', handler: handleGenerateSasaran, loadingKey: `${item.id}_sasaran`, color: 'blue'},
                                                      ].map(({label, field, handler, loadingKey, color}) => (
                                                        <div key={field} className="flex items-start gap-2">
                                                          <strong className="text-slate-400 whitespace-nowrap">{label}:</strong>
                                                          <span className="flex-grow">{item[field]}</span>
                                                          <button onClick={() => handler(item)} disabled={loadingStates[loadingKey] || !apiKey} className={`flex-shrink-0 p-1 bg-${color}-500/20 rounded-full hover:bg-${color}-500/40 disabled:bg-slate-600 disabled:cursor-not-allowed`} title={`Buat ${label} dengan AI`}>
                                                            {loadingStates[loadingKey] ? <LoaderCircle className={`w-4 h-4 text-${color}-400 animate-spin`}/> : <Lightbulb className={`w-4 h-4 text-${color}-400`}/>}
                                                          </button>
                                                        </div>
                                                      ))}
                                                      <div><strong className="text-slate-400">Waktu:</strong> {item.waktu}</div>
                                                      <div><strong className="text-slate-400">PJ:</strong> {item.pj}</div>
                                                    </div>
                                                    <div className="mt-4 pt-4 border-t border-slate-600">
                                                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                        <div><strong className="text-slate-300 flex items-center gap-2 mb-1"><FileText size={16} /> Keterangan / Bukti:</strong><p className="text-cyan-300 pl-2">{item.keterangan}</p></div>
                                                        <button onClick={() => handleGenerateKeterangan(item)} disabled={loadingStates[`${item.id}_ket`] || !apiKey} className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-500 disabled:bg-slate-600">
                                                          {loadingStates[`${item.id}_ket`] ? <LoaderCircle className="animate-spin w-5 h-5" /> : <BrainCircuit className="w-5 h-5" />}
                                                          <span>Buat Keterangan</span>
                                                        </button>
                                                      </div>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                            ))}
                          </div>
                        )}
                    </div>
                  ))}
                </div>

                {showDocumentInventory && (
                  <div className="mt-8 p-6 bg-slate-800/70 rounded-xl">
                    <h3 className="text-xl font-bold text-cyan-400 mb-4">Inventaris Dokumen</h3>
                    {documentInventory?.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-slate-700/50">
                          <thead>
                            <tr className="bg-slate-600/70 text-slate-200 uppercase text-sm">
                              <th className="py-3 px-6 text-left">Judul Dokumen</th>
                              <th className="py-3 px-6 text-left">Kode EP Terkait</th>
                            </tr>
                          </thead>
                          <tbody className="text-slate-300 text-sm">
                            {documentInventory.map((doc, index) => (
                              <tr key={index} className="border-b border-slate-600 hover:bg-slate-700/60">
                                <td className="py-3 px-6 text-left whitespace-normal">{doc['Judul Dokumen (Keterangan)']}</td>
                                <td className="py-3 px-6 text-left whitespace-normal">{doc['Kode Elemen Penilaian Terkait']}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : <p className="text-slate-500 italic">Tidak ada dokumen untuk diinventarisasi.</p>}
                  </div>
                )}

                {showDocumentGrouping && (
                  <div className="mt-8 p-6 bg-slate-800/70 rounded-xl">
                    <h3 className="text-xl font-bold text-cyan-400 mb-4">Pengelompokan Dokumen</h3>
                    {groupedDocumentsByTypeForDisplay && Object.keys(groupedDocumentsByTypeForDisplay).length > 0 ? (
                      <div className="space-y-4">
                        {Object.keys(groupedDocumentsByTypeForDisplay).sort().map(type => (
                          <div key={type} className="bg-slate-900/70 rounded-md">
                            <div onClick={() => toggleOpen(`docType-${type}`)} className="flex justify-between items-center px-5 py-3 cursor-pointer hover:bg-slate-800/80">
                              <h4 className="text-lg font-semibold text-teal-300">{type} ({groupedDocumentsByTypeForDisplay[type].length})</h4>
                              <ChevronRight className={`w-5 h-5 text-teal-300 transition-transform ${openStates[`docType-${type}`] ? 'rotate-90' : ''}`} />
                            </div>
                            {openStates[`docType-${type}`] && (
                              <ul className="p-3 list-disc list-inside text-sm">
                                {groupedDocumentsByTypeForDisplay[type].map((docItem, itemIndex) => (
                                  <li key={itemIndex} className="p-2 hover:bg-slate-800 rounded">{docItem['Judul Dokumen']} <span className="text-xs text-slate-400">({docItem.kode_ep})</span></li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-slate-500 italic">Tidak ada dokumen untuk dikelompokkan.</p>}
                  </div>
                )}

                <div className="mt-8 p-6 bg-slate-800/70 rounded-xl">
                  <h3 className="text-xl font-bold text-cyan-400 mb-4">Kesimpulan & Saran Strategis AI</h3>
                  {!aiSummary && !isSummaryLoading && (
                    <div className="text-center">
                        <button onClick={handleGenerateSummary} disabled={!apiKey} className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-500 disabled:bg-slate-600">
                            <BrainCircuit className="w-5 h-5" /><span>Buat Kesimpulan AI</span>
                        </button>
                    </div>
                  )}
                  {isSummaryLoading && <div className="flex justify-center"><LoaderCircle className="w-8 h-8 text-purple-400 animate-spin" /></div>}
                  {aiSummary && <div className="prose prose-invert max-w-none text-slate-300" dangerouslySetInnerHTML={{ __html: aiSummary.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />}
                </div>

                <div className="mt-8 p-6 bg-slate-800/70 rounded-xl">
                  <h3 className="text-xl font-bold text-cyan-400 mb-4">Unduh Hasil</h3>
                  <div className="flex items-center gap-4">
                      <button onClick={handleDownload} className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-500">
                          <Download className="w-5 h-5" /> <span>Unduh sebagai Excel (.xlsx)</span>
                      </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    const container = document.getElementById('root');
    const root = ReactDOM.createRoot(container);
    root.render(<App />);
}

// Jalankan aplikasi setelah halaman dimuat sepenuhnya
window.onload = startApp;
