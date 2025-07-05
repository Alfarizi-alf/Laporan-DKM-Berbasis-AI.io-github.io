/// This script contains the full application logic for the SKM Report Builder.
// It handles file uploads, data processing, AI integration, and report generation.

let reportData = {};
let trendChartInstance = null;
let unsurChartInstance = null;

// Element references
const fileUpload = document.getElementById('file-upload');
const processButton = document.getElementById('process-button');
const downloadTemplateButton = document.getElementById('download-template-button');
const loadingSpinner = document.getElementById('loading-spinner');
const phase1 = document.getElementById('phase-1');
const mainControlPanel = document.getElementById('main-control-panel');
const generateAiButton = document.getElementById('generate-ai-button');
const apiKeyInput = document.getElementById('api-key-input'); // Added for API Key
const aiLoadingSpinner = document.getElementById('ai-loading-spinner');
const aiResults = document.getElementById('ai-results');
const downloadPdfButton = document.getElementById('download-pdf-button');
const analisisTextarea = document.getElementById('analisis-textarea');
const kesimpulanTextarea = document.getElementById('kesimpulan-textarea');
const resetButton = document.getElementById('reset-button');
const alertModal = document.getElementById('alert-modal');
const modalMessage = document.getElementById('modal-message');
const modalCloseButton = document.getElementById('modal-close-button');
const modalTitle = document.getElementById('modal-title');
const modalIconContainer = document.getElementById('modal-icon-container');

// Event Listeners
processButton.addEventListener('click', handleFileUpload);
downloadTemplateButton.addEventListener('click', downloadExcelTemplate);
generateAiButton.addEventListener('click', generateAIAnalysis);
downloadPdfButton.addEventListener('click', generatePdf);
resetButton.addEventListener('click', resetApplication);

analisisTextarea.addEventListener('input', () => {
    if (reportData.analisis_utama !== undefined) {
        reportData.analisis_utama = analisisTextarea.value;
        updatePreview();
    }
});
kesimpulanTextarea.addEventListener('input', () => {
    if (reportData.kesimpulan !== undefined) {
        try {
            // Attempt to parse JSON for structured updates
            const parsed = JSON.parse(kesimpulanTextarea.value);
            reportData.kesimpulan = parsed;
        } catch (e) {
            // If parsing fails, treat it as a plain text update for the main part
            reportData.kesimpulan = {
                utama: kesimpulanTextarea.value,
                saran: reportData.kesimpulan.saran || '',
                penutup: reportData.kesimpulan.penutup || ''
            };
        }
        updatePreview();
    }
});

modalCloseButton.addEventListener('click', () => alertModal.classList.add('hidden'));

/**
 * Displays a modal with a message.
 * @param {string} message - The message to display.
 * @param {string} type - 'error' or 'success'.
 */
function showModal(message, type = 'error') {
    modalMessage.textContent = message;
    if (type === 'error') {
        modalTitle.textContent = 'Peringatan';
        modalIconContainer.className = 'mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100';
        modalIconContainer.innerHTML = `<svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`;
        modalCloseButton.className = 'px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300';
    } else {
        modalTitle.textContent = 'Informasi';
        modalIconContainer.className = 'mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100';
        modalIconContainer.innerHTML = `<svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
        modalCloseButton.className = 'px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300';
    }
    alertModal.classList.remove('hidden');
}

/**
 * Resets the application to its initial state.
 */
function resetApplication() {
    reportData = {};
    if (trendChartInstance) {
        trendChartInstance.destroy();
        trendChartInstance = null;
    }
    if (unsurChartInstance) {
        unsurChartInstance.destroy();
        unsurChartInstance = null;
    }
    fileUpload.value = '';
    apiKeyInput.value = '';
    phase1.classList.remove('hidden');
    mainControlPanel.classList.add('hidden');
    loadingSpinner.classList.add('hidden');
    aiLoadingSpinner.classList.add('hidden');
    aiResults.classList.add('hidden');
    analisisTextarea.value = '';
    kesimpulanTextarea.value = '';
    document.getElementById('report-preview-content').innerHTML = `<i>Silakan unggah dan proses file Excel untuk melihat pratinjau laporan.</i>`;
}

/**
 * Generates and downloads the Excel template file.
 */
function downloadExcelTemplate() {
    const infoUmumData = [
        ["Parameter", "Isi Data"],
        ["Nama Dinas/Badan", "Contoh: Dinas Kependudukan dan Pencatatan Sipil"],
        ["Nama UPTD/Kelurahan", ""],
        ["Periode Survei", "I"],
        ["Tahun Survei", new Date().getFullYear()],
        ["Jenis-jenis Layanan yang Ada (pisahkan dengan koma)", "Layanan KTP, Layanan KK, Layanan Akta"],
        ["Jumlah Populasi Penerima Layanan (N)", 2400],
        ["Penanggung Jawab", "Nama Kepala Dinas"],
        ["NIP Penanggung Jawab", "19..."],
        ["Tanggal FKP", "2025-07-04"],
        ["Tren SKM Tahun 2023", 78.20],
        ["Tren SKM Tahun 2024", 80.10],
    ];

    const waktuPelaksanaanData = [
        ["No.", "Kegiatan", "Waktu Pelaksanaan", "Jumlah Hari Kerja"],
        [1, "Persiapan", "Januari 2025", 8],
        [2, "Pengumpulan Data", "Februari-April 2025", 60],
        [3, "Pengolahan Data dan Analisis Hasil", "Mei 2025", 10],
        [4, "Penyusunan dan Pelaporan Hasil", "Mei-Juni 2025", 15]
    ];

    const dataSurveiData = [
        ["No", "Jenis Kelamin (L/P)", "Pendidikan Terakhir", "Pekerjaan", "Jenis Layanan", "U1 (Persyaratan)", "U2 (Prosedur)", "U3 (Waktu)", "U4 (Biaya)", "U5 (Produk)", "U6 (Kompetensi)", "U7 (Perilaku)", "U8 (Sarana & Prasarana)", "U9 (Pengaduan)", "Saran / Masukan (Teks)"],
        [1, "P", "S-1", "SWASTA", "Layanan KTP", 3, 2, 2, 4, 4, 3, 2, 3, 4, "Waktu pelayanan terlalu lama, harus bolak-balik."],
        [2, "L", "SLTA", "WIRAUSAHA", "Layanan KK", 4, 3, 3, 4, 4, 4, 3, 4, 4, "Petugas sudah ramah dan membantu, tapi loket perlu ditambah."],
        [3, "P", "S-2", "PNS", "Layanan Akta", 3, 2, 2, 3, 3, 3, 2, 3, 3, "Prosedur online masih agak membingungkan, perlu sosialisasi."]
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(infoUmumData), "Info_Umum");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(waktuPelaksanaanData), "Waktu_Pelaksanaan");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(dataSurveiData), "Data_Survei_Mentah");
    XLSX.writeFile(wb, "Template_SKM_v10_Lengkap.xlsx");
}

/**
 * Handles the file upload event and initiates processing.
 */
function handleFileUpload() {
    const file = fileUpload.files[0];
    if (!file) {
        showModal("Silakan pilih file Excel terlebih dahulu.");
        return;
    }
    phase1.classList.add('hidden');
    loadingSpinner.classList.remove('hidden');
    mainControlPanel.classList.add('hidden');
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {
                type: 'array'
            });
            processData(workbook);
            updatePreview();
            loadingSpinner.classList.add('hidden');
            mainControlPanel.classList.remove('hidden');
        } catch (error) {
            console.error("Error processing file:", error);
            showModal("Gagal memproses file. Pastikan formatnya sesuai dengan templat. Error: " + error.message);
            resetApplication();
        }
    };
    reader.readAsArrayBuffer(file);
}

/**
 * Processes the data from the workbook.
 * @param {Object} workbook - The XLSX workbook object.
 */
function processData(workbook) {
    reportData = {};
    const infoSheet = workbook.Sheets['Info_Umum'];
    if (!infoSheet) throw new Error("Sheet 'Info_Umum' tidak ditemukan.");
    const infoJson = XLSX.utils.sheet_to_json(infoSheet, {
        header: 1
    });
    reportData.info = {};
    reportData.trends = {};
    infoJson.slice(1).forEach(row => {
        const key = (row[0] || '').toString().trim();
        const value = row[1];
        if (key.startsWith('Tren SKM Tahun')) {
            const year = key.replace('Tren SKM Tahun ', '');
            reportData.trends[year] = value;
        } else if (key) {
            reportData.info[key] = value;
        }
    });

    const waktuSheet = workbook.Sheets['Waktu_Pelaksanaan'];
    reportData.waktu = waktuSheet ? XLSX.utils.sheet_to_json(waktuSheet) : [];

    const dataSheet = workbook.Sheets['Data_Survei_Mentah'];
    if (!dataSheet) throw new Error("Sheet 'Data_Survei_Mentah' tidak ditemukan.");
    const dataJson = XLSX.utils.sheet_to_json(dataSheet);
    if (!dataJson || dataJson.length === 0) throw new Error("Sheet 'Data_Survei_Mentah' kosong.");
    reportData.respondents = dataJson;

    const totalRespondents = reportData.respondents.length;
    reportData.demographics = {
        total: totalRespondents,
        gender: countAndPercentage(dataJson, 'Jenis Kelamin (L/P)'),
        education: countAndPercentage(dataJson, 'Pendidikan Terakhir'),
        work: countAndPercentage(dataJson, 'Pekerjaan'),
        service: countAndPercentage(dataJson, 'Jenis Layanan')
    };

    const unsurKeys = ['U1 (Persyaratan)', 'U2 (Prosedur)', 'U3 (Waktu)', 'U4 (Biaya)', 'U5 (Produk)', 'U6 (Kompetensi)', 'U7 (Perilaku)', 'U8 (Sarana & Prasarana)', 'U9 (Pengaduan)'];
    reportData.ikm = {
        unsur: {}
    };
    let totalNilaiTertimbang = 0;
    const bobot = 1 / unsurKeys.length;
    unsurKeys.forEach(key => {
        if (dataJson.length > 0 && dataJson[0][key] === undefined) throw new Error(`Kolom '${key}' tidak ditemukan di sheet 'Data_Survei_Mentah'.`);
        const sum = dataJson.reduce((acc, curr) => acc + (Number(curr[key]) || 0), 0);
        const avg = sum / totalRespondents;
        reportData.ikm.unsur[key] = {
            avg: avg,
            nilaiKonversi: avg * 25,
            mutu: getMutu(avg * 25).grade
        };
        totalNilaiTertimbang += avg * bobot;
    });
    reportData.ikm.total = totalNilaiTertimbang * 25;
    reportData.ikm.mutu = getMutu(reportData.ikm.total);

    reportData.saran = dataJson.map(r => r['Saran / Masukan (Teks)']).filter(s => s && s.trim() !== '').join('; ');

    const populasi = reportData.info['Jumlah Populasi Penerima Layanan (N)'] || 0;
    reportData.info.sampel = getKrejcieMorganSample(populasi);
}

/**
 * Gets the minimum sample size using Krejcie & Morgan table.
 * @param {number} population - The total population size.
 * @returns {number} The minimum sample size.
 */
function getKrejcieMorganSample(population) {
    const table = [{p: 10,s: 10}, {p: 15,s: 14}, {p: 20,s: 19}, {p: 25,s: 24}, {p: 30,s: 28}, {p: 35,s: 32}, {p: 40,s: 36}, {p: 45,s: 40}, {p: 50,s: 44}, {p: 55,s: 48}, {p: 60,s: 52}, {p: 65,s: 56}, {p: 70,s: 59}, {p: 75,s: 63}, {p: 80,s: 66}, {p: 85,s: 70}, {p: 90,s: 73}, {p: 95,s: 76}, {p: 100,s: 80}, {p: 110,s: 86}, {p: 120,s: 92}, {p: 130,s: 97}, {p: 140,s: 103}, {p: 150,s: 108}, {p: 160,s: 113}, {p: 170,s: 118}, {p: 180,s: 123}, {p: 190,s: 127}, {p: 200,s: 132}, {p: 210,s: 136}, {p: 220,s: 140}, {p: 230,s: 144}, {p: 240,s: 148}, {p: 250,s: 152}, {p: 260,s: 155}, {p: 270,s: 159}, {p: 280,s: 162}, {p: 290,s: 165}, {p: 300,s: 169}, {p: 320,s: 175}, {p: 340,s: 181}, {p: 360,s: 186}, {p: 380,s: 191}, {p: 400,s: 196}, {p: 420,s: 201}, {p: 440,s: 205}, {p: 460,s: 210}, {p: 480,s: 214}, {p: 500,s: 217}, {p: 550,s: 226}, {p: 600,s: 234}, {p: 650,s: 242}, {p: 700,s: 248}, {p: 750,s: 254}, {p: 800,s: 260}, {p: 850,s: 265}, {p: 900,s: 269}, {p: 950,s: 274}, {p: 1000,s: 278}, {p: 1100,s: 285}, {p: 1200,s: 291}, {p: 1300,s: 297}, {p: 1400,s: 302}, {p: 1500,s: 306}, {p: 1600,s: 310}, {p: 1700,s: 313}, {p: 1800,s: 317}, {p: 1900,s: 320}, {p: 2000,s: 322}, {p: 2200,s: 327}, {p: 2400,s: 331}, {p: 2600,s: 335}, {p: 2800,s: 338}, {p: 3000,s: 341}, {p: 3500,s: 346}, {p: 4000,s: 351}, {p: 4500,s: 354}, {p: 5000,s: 357}, {p: 6000,s: 361}, {p: 7000,s: 364}, {p: 8000,s: 367}, {p: 9000,s: 368}, {p: 10000,s: 370}, {p: 15000,s: 375}, {p: 20000,s: 377}, {p: 30000,s: 379}, {p: 40000,s: 380}, {p: 50000,s: 381}, {p: 75000,s: 382}, {p: 1000000,s: 384}];
    if (population <= 10) return population;
    const entry = table.find(t => population <= t.p);
    return entry ? entry.s : 384;
}

/**
 * Counts occurrences and calculates percentages for a given key.
 * @param {Array} data - The array of respondent data.
 * @param {string} key - The key to analyze.
 * @returns {Object} An object with counts and percentages.
 */
function countAndPercentage(data, key) {
    const counts = data.reduce((acc, curr) => {
        const value = curr[key] ? String(curr[key]).toUpperCase().trim() : 'TIDAK DIKETAHUI';
        if (value) acc[value] = (acc[value] || 0) + 1;
        return acc;
    }, {});
    const percentages = {};
    for (const k in counts) {
        percentages[k] = {
            count: counts[k],
            percentage: ((counts[k] / data.length) * 100).toFixed(1)
        };
    }
    return percentages;
}

/**
 * Determines the service quality based on the score.
 * @param {number} nilai - The IKM score.
 * @returns {Object} An object with the quality text and grade.
 */
function getMutu(nilai) {
    if (nilai > 88.31) return {
        text: "Sangat Baik",
        grade: "A"
    };
    if (nilai > 76.61) return {
        text: "Baik",
        grade: "B"
    };
    if (nilai > 65.00) return {
        text: "Kurang Baik",
        grade: "C"
    };
    return {
        text: "Tidak Baik",
        grade: "D"
    };
}

/**
 * Generates analysis, RTL, and conclusion using AI.
 */
async function generateAIAnalysis() {
    if (!reportData.ikm) {
        showModal("Silakan proses data terlebih dahulu.");
        return;
    }

    // PERBAIKAN: Mengambil API Key dari input pengguna
    const apiKey = apiKeyInput.value;
    if (!apiKey) {
        showModal("Silakan masukkan Gemini API Key Anda terlebih dahulu.");
        return;
    }

    aiLoadingSpinner.classList.remove('hidden');
    generateAiButton.classList.add('disabled-section');
    aiResults.classList.add('hidden');

    const sortedUnsur = Object.entries(reportData.ikm.unsur).sort(([, a], [, b]) => a.avg - b.avg);
    const terendah = sortedUnsur.slice(0, 3).map(([key, val]) => `${key.split('(')[0].trim()} (nilai: ${val.nilaiKonversi.toFixed(2)})`).join(', ');
    const tertinggi = sortedUnsur.slice(-3).reverse().map(([key, val]) => `${key.split('(')[0].trim()} (nilai: ${val.nilaiKonversi.toFixed(2)})`).join(', ');

    const trendYears = Object.keys(reportData.trends).sort();
    const trendDataString = trendYears.map(year => `Tahun ${year}: ${Number(reportData.trends[year]).toFixed(2)}`).join('; ');
    const currentYear = reportData.info['Tahun Survei'];
    const currentIKM = reportData.ikm.total.toFixed(2);

    const prompt = `Anda adalah seorang analis kebijakan publik ahli yang bertugas membuat draf laporan Survei Kepuasan Masyarakat (SKM) untuk sebuah instansi, sesuai templat resmi.
        Tugas Anda adalah membuat draf untuk beberapa bagian laporan berdasarkan data berikut:

        DATA SKM:
        - Nama Instansi: ${reportData.info['Nama Dinas/Badan']}
        - Nilai IKM Unit Layanan Saat Ini (${currentYear}): ${currentIKM} (Kategori: ${reportData.ikm.mutu.text})
        - 3 Unsur Nilai Terendah: ${terendah}
        - 3 Unsur Nilai Tertinggi: ${tertinggi}
        - Data Tren SKM Sebelumnya: ${trendDataString || 'Tidak ada data tren.'}
        - Rekapitulasi Kritik & Saran dari Masyarakat: "${reportData.saran || 'Tidak ada saran spesifik yang diberikan.'}"

        INSTRUKSI:
        1.  **Buat Analisis Utama (Untuk Sub-bab 4.1):** Tulis paragraf untuk "Analisis Permasalahan/Kelemahan dan Kelebihan Unsur Layanan". Analisis ini harus fokus pada: a. Sorotan unsur terendah sebagai area prioritas perbaikan dan unsur tertinggi sebagai kekuatan yang harus dipertahankan. b. Kaitan antara analisis unsur dengan kritik dan saran spesifik yang diberikan masyarakat.
        2.  **Buat Analisis Tren (Untuk Sub-bab 4.3):** Tulis paragraf terpisah khusus untuk "Analisis Tren Nilai SKM". Bandingkan nilai IKM tahun ini (${currentIKM}) dengan data tren sebelumnya. Jelaskan secara eksplisit apakah ada peningkatan, penurunan, atau stagnasi kinerja, dan berikan interpretasi mendalam mengenai kemungkinan penyebabnya.
        3.  **Buat Rencana Tindak Lanjut (RTL) (BAB IV):** Buat rencana tindak lanjut dalam format array JSON. Fokus pada 3 unsur dengan nilai terendah. Untuk setiap unsur, berikan satu program/kegiatan perbaikan yang konkret dan realistis. Untuk kolom "waktu", gunakan format "TW I/II/III/IV".
        4.  **Buat Kesimpulan (BAB V):** Buat draf untuk BAB V yang terstruktur. Format output untuk kesimpulan HARUS berupa OBJEK JSON dengan tiga kunci: "utama", "saran", dan "penutup".
            - **utama**: Berisi kesimpulan utama (nilai akhir SKM, kategori, 3 unsur terendah dan tertinggi).
            - **saran**: Berisi saran dan rekomendasi berdasarkan rangkuman kritik/saran masyarakat.
            - **penutup**: Berisi kalimat penutup formal yang menyatakan laporan ini akan menjadi acuan perbaikan.

        Format output HARUS berupa JSON yang valid seperti ini, tanpa teks tambahan sebelum atau sesudah JSON:
        {
          "analisis_utama": "Teks analisis utama di sini...",
          "analisis_tren": "Teks analisis tren di sini...",
          "rtl": [
            {
              "prioritas_unsur": "Nama Unsur Terendah 1",
              "program_kegiatan": "Deskripsi program/kegiatan perbaikan.",
              "waktu": "TW III",
              "penanggung_jawab": "Bagian Terkait"
            }
          ],
          "kesimpulan": {
            "utama": "Teks kesimpulan utama di sini...",
            "saran": "Teks saran dan rekomendasi di sini...",
            "penutup": "Teks paragraf penutup di sini..."
          }
        }`;
    try {
        const payload = {
            contents: [{
                role: "user",
                parts: [{
                    text: prompt
                }]
            }]
        };
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        if (result.candidates && result.candidates.length > 0) {
            const text = result.candidates[0].content.parts[0].text;
            const cleanJsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const aiData = JSON.parse(cleanJsonString);

            reportData.analisis_utama = aiData.analisis_utama;
            reportData.analisis_tren = aiData.analisis_tren;
            reportData.rtl = aiData.rtl;
            reportData.kesimpulan = aiData.kesimpulan;

            analisisTextarea.value = reportData.analisis_utama;
            kesimpulanTextarea.value = JSON.stringify(reportData.kesimpulan, null, 2);

            aiResults.classList.remove('hidden');
            updatePreview();
        } else {
            throw new Error("Respons AI tidak valid atau kosong.");
        }
    } catch (error) {
        console.error("AI Generation Error:", error);
        showModal("Gagal menghasilkan analisis dari AI. Pastikan API Key valid dan coba lagi. Error: " + error.message);
    } finally {
        aiLoadingSpinner.classList.add('hidden');
        generateAiButton.classList.remove('disabled-section');
    }
}

/**
 * Renders the trend chart on the canvas.
 */
function renderTrendChart() {
    if (trendChartInstance) {
        trendChartInstance.destroy();
    }
    const trendCanvas = document.getElementById('trendChart');
    if (!trendCanvas || !reportData.trends) return;
    const ctx = trendCanvas.getContext('2d');
    const trendYears = Object.keys(reportData.trends).sort();
    const trendData = trendYears.map(year => Number(reportData.trends[year]).toFixed(2));
    const currentYear = reportData.info['Tahun Survei'].toString();
    const currentIkm = reportData.ikm.total.toFixed(2);
    const labels = [...trendYears, currentYear];
    const data = [...trendData, currentIkm];
    trendChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Nilai IKM',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    suggestedMin: Math.min(...data) - 5,
                    suggestedMax: 100
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: `Grafik Tren Nilai SKM ${reportData.info['Nama Dinas/Badan']}`,
                    font: {
                        size: 14,
                        family: "'Times New Roman', Times, serif"
                    }
                }
            }
        }
    });
}

/**
 * Renders the service element chart on the canvas.
 */
function renderUnsurChart() {
    if (unsurChartInstance) {
        unsurChartInstance.destroy();
    }
    const unsurCanvas = document.getElementById('unsurChart');
    if (!unsurCanvas || !reportData.ikm) return;
    const ctx = unsurCanvas.getContext('2d');
    const labels = Object.keys(reportData.ikm.unsur).map(k => k.substring(0, 2));
    const data = Object.values(reportData.ikm.unsur).map(u => u.nilaiKonversi.toFixed(2));
    unsurChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Nilai Konversi per Unsur',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)',
                    'rgba(199, 199, 199, 0.2)', 'rgba(83, 109, 254, 0.2)', 'rgba(40, 180, 99, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)',
                    'rgba(199, 199, 199, 1)', 'rgba(83, 109, 254, 1)', 'rgba(40, 180, 99, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Grafik Capaian per Unsur Pelayanan',
                    font: {
                        size: 14,
                        family: "'Times New Roman', Times, serif"
                    }
                }
            }
        }
    });
}

/**
 * Assembles the full HTML content for the report preview.
 * @returns {string} The complete HTML string for the report.
 */
function getFullReportHTML() {
    if (!reportData.info) return '';

    const {
        info,
        demographics,
        ikm,
        trends,
        analisis_utama,
        analisis_tren,
        kesimpulan,
        waktu
    } = reportData;
    const rtl = reportData.rtl || [];

    // Extract and format data for the report
    const namaDinas = info['Nama Dinas/Badan'] || '[Nama Dinas]';
    const namaUptd = info['Nama UPTD/Kelurahan'] || '';
    const periode = info['Periode Survei'] || '[Periode]';
    const tahun = info['Tahun Survei'] || '[Tahun]';
    const populasi = info['Jumlah Populasi Penerima Layanan (N)'] || '[Populasi]';
    const jenisLayananText = info['Jenis-jenis Layanan yang Ada (pisahkan dengan koma)'] || '[Jenis Layanan Belum Ditentukan]';
    const sampelMinimal = info.sampel || '[Sampel]';
    const sampelAktual = demographics.total;
    const statusSampel = sampelAktual >= sampelMinimal ? 'Sesuai' : 'Belum Sesuai';
    const penanggungJawab = info['Penanggung Jawab'] || '(NAMA LENGKAP)';
    const nip = info['NIP Penanggung Jawab'] || '..................................';
    const tglFkp = info['Tanggal FKP'] ? new Date(info['Tanggal FKP'] + 'T00:00:00').toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }) : '[Tanggal FKP]';

    // Build demographics table
    let demoTable = `<table class="report-table">
        <thead>
            <tr>
                <th style="text-align:center">No.</th>
                <th style="text-align:center">KARAKTERISTIK</th>
                <th style="text-align:center">INDIKATOR</th>
                <th style="text-align:center">JUMLAH</th>
                <th style="text-align:center">PERSENTASE</th>
            </tr>
        </thead>
        <tbody>`;

    const buildCharacteristicRows = (charNumber, charTitle, charData, order = null) => {
        const keys = order ? order.filter(k => charData[k]) : Object.keys(charData);
        if (keys.length === 0) return '';

        let rowsHtml = '';
        keys.forEach((key, index) => {
            const item = charData[key];
            const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();

            if (index === 0) {
                rowsHtml += `<tr>
                    <td rowspan="${keys.length}" style="text-align:center; vertical-align: middle;">${charNumber}</td>
                    <td rowspan="${keys.length}" style="vertical-align: middle;">${charTitle}</td>
                    <td>${formattedKey}</td>
                    <td style="text-align:center;">${item.count}</td>
                    <td style="text-align:center;">${item.percentage}%</td>
                </tr>`;
            } else {
                rowsHtml += `<tr>
                    <td>${formattedKey}</td>
                    <td style="text-align:center;">${item.count}</td>
                    <td style="text-align:center;">${item.percentage}%</td>
                </tr>`;
            }
        });
        return rowsHtml;
    };

    const eduOrder = ['SD KE BAWAH', 'SLTP', 'SLTA', 'D-III', 'S-1', 'S-2', 'S-3'];
    const workOrder = ['PNS', 'TNI', 'SWASTA', 'WIRAUSAHA', 'LAINNYA'];

    demoTable += buildCharacteristicRows(1, 'JENIS KELAMIN', demographics.gender);
    demoTable += buildCharacteristicRows(2, 'PENDIDIKAN', demographics.education, eduOrder);
    demoTable += buildCharacteristicRows(3, 'PEKERJAAN', demographics.work, workOrder);
    demoTable += buildCharacteristicRows(4, 'JENIS LAYANAN', demographics.service);
    demoTable += `</tbody></table>`;

    // Build IKM table
    let ikmTable = `<table class="report-table">
        <thead>
            <tr>
                <th style="text-align:center; width: 5%;">No.</th>
                <th>UNSUR PELAYANAN</th>
                <th style="text-align:center;">NILAI IKM KONVERSI</th>
                <th style="text-align:center;">MUTU PELAYANAN</th>
            </tr>
        </thead>
        <tbody>`;

    const unsurMapping = {
        "U1 (Persyaratan)": "U1. Persyaratan",
        "U2 (Prosedur)": "U2. Sistem, Mekanisme, dan Prosedur",
        "U3 (Waktu)": "U3. Waktu Penyelesaian",
        "U4 (Biaya)": "U4. Biaya/Tarif",
        "U5 (Produk)": "U5. Produk Spesifikasi Jenis Pelayanan",
        "U6 (Kompetensi)": "U6. Kompetensi Pelaksana",
        "U7 (Perilaku)": "U7. Perilaku Pelaksana",
        "U8 (Sarana & Prasarana)": "U8. Sarana dan Prasarana",
        "U9 (Pengaduan)": "U9. Penanganan Pengaduan, Saran, dan Masukan"
    };
    Object.entries(ikm.unsur).forEach(([key, val], index) => {
        ikmTable += `<tr>
            <td style="text-align:center;">${index + 1}</td>
            <td>${unsurMapping[key] || key}</td>
            <td style="text-align:center;">${val.nilaiKonversi.toFixed(2)}</td>
            <td style="text-align:center;">${val.mutu}</td>
        </tr>`;
    });
    ikmTable += `
        <tr>
            <td colspan="2" style="text-align:center; font-weight:bold;">NILAI IKM UNIT PELAYANAN</td>
            <td style="text-align:center; font-weight:bold;">${ikm.total.toFixed(2)}</td>
            <td style="text-align:center; font-weight:bold;">${ikm.mutu.grade}</td>
        </tr>
        </tbody></table>`;

    // Build timeline table
    let waktuTable = `<p class="no-indent"><i>Data rincian waktu pelaksanaan tidak ditemukan dalam file Excel.</i></p>`;
    if (waktu && waktu.length > 0) {
        waktuTable = `<table class="report-table"><thead><tr><th style="text-align:center">No.</th><th>Kegiatan</th><th>Waktu Pelaksanaan</th><th style="text-align:center">Jumlah Hari Kerja</th></tr></thead><tbody>`;
        waktu.forEach(item => {
            waktuTable += `<tr><td style="text-align:center">${item['No.']}</td><td>${item['Kegiatan']}</td><td>${item['Waktu Pelaksanaan']}</td><td style="text-align:center">${item['Jumlah Hari Kerja']}</td></tr>`;
        });
        waktuTable += `</tbody></table>`;
    }

    // Build RTL table
    let rtlTable = `<p class="no-indent"><i>Rencana Tindak Lanjut akan muncul di sini setelah dihasilkan oleh AI.</i></p>`;
    if (rtl && rtl.length > 0) {
        rtlTable = `<table class="report-table"><thead><tr><th style="text-align:center">No.</th><th>Prioritas Unsur</th><th>Program / Kegiatan</th><th style="text-align:center">Waktu</th><th>Penanggung Jawab</th></tr></thead><tbody>`;
        rtl.forEach((item, index) => {
            rtlTable += `<tr><td style="text-align:center">${index+1}</td><td>${item.prioritas_unsur}</td><td>${item.program_kegiatan}</td><td style="text-align:center">${item.waktu}</td><td>${item.penanggung_jawab}</td></tr>`;
        });
        rtlTable += `</tbody></table>`;
    }

    // Build trend section
    let trendContent = `<p class="no-indent"><i>Data tren tidak tersedia.</i></p>`;
    const trendYears = Object.keys(trends).sort();
    if (trendYears.length > 0) {
        let trendTable = `<table class="report-table"><thead><tr><th style="text-align:center;">Tahun</th><th style="text-align:center;">Nilai IKM</th></tr></thead><tbody>`;
        trendYears.forEach(year => {
            trendTable += `<tr><td style="text-align:center;">${year}</td><td style="text-align:center;">${Number(trends[year]).toFixed(2)}</td></tr>`;
        });
        trendTable += `<tr><td style="text-align:center;">${tahun}</td><td style="text-align:center;">${ikm.total.toFixed(2)}</td></tr></tbody></table>`;

        trendContent = `
            <p>${analisis_tren ? analisis_tren.replace(/\n/g, '</p><p>') : '<i>Analisis tren akan muncul di sini setelah dihasilkan oleh AI.</i>'}</p>
            ${trendTable}
            <div class="chart-container" style="width: 100%; max-width: 550px; margin: 2rem auto; height: 280px;">
                <p class="no-indent" style="text-align:center; font-weight:bold;">Grafik Tren Nilai SKM</p>
                <canvas id="trendChart"></canvas>
            </div>
        `;
    }

    // Static text for chapters
    const bab1LatarBelakang = `<p>Undang-undang Nomor 25 Tahun 2009 tentang Pelayanan Publik dan Peraturan Pemerintah Nomor 96 Tahun 2012 tentang Pelaksanaan Undang-undang Nomor 25 Tahun 2009 tentang Pelayanan Publik, mengamanatkan penyelenggara wajib mengikutsertakan masyarakat dalam penyelenggaraan Pelayanan Publik sebagai upaya membangun sistem penyelenggaraan Pelayanan Publik yang adil, transparan, dan akuntabel. Pelibatan masyarakat ini menjadi penting seiring dengan adanya konsep pembangunan berkelanjutan. Serta adanya pelibatan masyarakat juga dapat mendorong kebijakan penyelenggaraan pelayanan publik lebih tepat sasaran.</p><p>Dalam mengamanatkan UU No. 25 tahun 2009 maupun PP No. 96 Tahun 2012 maka disusun Peraturan Menteri PANRB No. 14 Tahun 2017 tentang Pedoman Penyusunan Survei Kepuasan Masyarakat (SKM) Unit Penyelenggara Pelayanan Publik. Pedoman ini memberikan gambaran bagi penyelenggara pelayanan untuk melibatkan masyarakat dalam penilaian kinerja pelayanan publik guna meningkatkan kualitas pelayanan yang diberikan. Penilaian masyarakat atas penyelenggaraan pelayanan publik akan diukur berdasarkan 9 (sembilan) unsur yang berkaitan dengan standar pelayanan, sarana prasarana, serta konsultasi pengaduan.</p><p>Untuk mengetahui sejauh mana kualitas pelayanan ${namaDinas} sebagai salah satu penyedia layanan publik, maka perlu diselenggarakan survei atau jajak pendapat tentang penilaian pengguna layanan publik terhadap pelayanan yang diterima. Dengan berpedoman pada Peraturan Menteri PANRB No. 14 Tahun 2017, maka telah dilakukan pengukuran atas kepuasan masyarakat. Hasil SKM yang didapat merangkum data dan informasi tentang tingkat kepuasan masyarakat. Dengan elaborasi metode pengukuran secara kuantitatif dan kualitatif atas pendapat masyarakat, maka akan didapatkan kualitas data yang akurat dan komprehensif.</p><p>Hasil survei ini akan digunakan sebagai bahan evaluasi dan bahan masukan bagi penyelenggara layanan publik untuk terus-menerus melakukan perbaikan sehingga kualitas pelayanan prima dapat segera dicapai. Dengan tercapainya pelayanan prima maka harapan dan tuntutan masyarakat atas hak-hak mereka sebagai warga negara dapat terpenuhi.</p>`;
    const bab1Dasar = `<p class="no-indent">1. Undang-undang Nomor 25 Tahun 2009 tentang Pelayanan Publik.<br>2. Peraturan Pemerintah Nomor 96 Tahun 2012 tentang Pelaksanaan Undang- Undang Nomor 25 Tahun 2009 tentang Pelayanan Publik.<br>3. Peraturan Menteri PANRB Nomor 14 Tahun 2017 tentang Pedoman Penyusunan Survei Kepuasan Masyarakat Unit Penyelenggara Pelayanan Publik.</p>`;
    const bab1Tujuan = `<p>Tujuan pelaksanaan SKM adalah untuk mengetahui gambaran kepuasan masyarakat yang diperoleh dari hasil pengukuran atas pendapat masyarakat, terhadap mutu dan kualitas pelayanan administrasi yang telah diberikan oleh ${namaDinas}.</p><p class="no-indent">Adapun sasaran dilakukannya SKM adalah:</p><ol type="a"><li>Mendorong partisipasi masyarakat sebagai pengguna layanan dalam menilai kinerja penyelenggara pelayanan;</li><li>Mendorong penyelenggara pelayanan publik untuk meningkatkan kualitas pelayanan publik;</li><li>Mendorong penyelenggara pelayanan publik untuk menjadi lebih inovatif dalam menyelenggarakan pelayanan publik;</li><li>Mengukur kecenderungan tingkat kepuasan masyarakat terhadap pelayanan publik yang diberikan.</li></ol><p class="no-indent">Dengan dilakukan SKM dapat diperoleh manfaat, antara lain:</p><ol type="a"><li>Diketahui kelemahan atau kekurangan dari masing-masing unsur dalam penyelenggara pelayanan publik;</li><li>Diketahui kinerja penyelenggara pelayanan yang telah dilaksanakan oleh unit pelayanan publik secara periodik;</li><li>Sebagai bahan penetapan kebijakan yang perlu diambil dan upaya tindak lanjut yang perlu dilakukan atas hasil Survei Kepuasan Masyarakat;</li><li>Diketahui indeks kepuasan masyarakat secara menyeluruh terhadap hasil pelaksanaan pelayanan publik pada lingkup Pemerintah Pusat dan Daerah;</li><li>Memacu persaingan positif, antar unit penyelenggara pelayanan pada lingkup Pemerintah Pusat dan Daerah dalam upaya peningkatan kinerja pelayanan;</li><li>Bagi masyarakat dapat diketahui gambaran tentang kinerja unit pelayanan.</li></ol>`;

    const morganTable = `<table class="report-table" style="font-size: 9pt; text-align: center;">
        <thead><tr><th>Populasi (N)</th><th>Sampel (n)</th><th>Populasi (N)</th><th>Sampel (n)</th><th>Populasi (N)</th><th>Sampel (n)</th></tr></thead>
        <tbody>
            <tr><td>10</td><td>10</td><td>220</td><td>140</td><td>1200</td><td>291</td></tr>
            <tr><td>15</td><td>14</td><td>230</td><td>144</td><td>1300</td><td>297</td></tr>
            <tr><td>20</td><td>19</td><td>240</td><td>148</td><td>1400</td><td>302</td></tr>
            <tr><td>25</td><td>24</td><td>250</td><td>152</td><td>1500</td><td>306</td></tr>
            <tr><td>30</td><td>28</td><td>260</td><td>155</td><td>1600</td><td>310</td></tr>
            <tr><td>35</td><td>32</td><td>270</td><td>159</td><td>1700</td><td>313</td></tr>
            <tr><td>40</td><td>36</td><td>280</td><td>162</td><td>1800</td><td>317</td></tr>
            <tr><td>45</td><td>40</td><td>290</td><td>165</td><td>1900</td><td>320</td></tr>
            <tr><td>50</td><td>44</td><td>300</td><td>169</td><td>2000</td><td>322</td></tr>
            <tr><td>55</td><td>48</td><td>320</td><td>175</td><td>2200</td><td>327</td></tr>
            <tr><td>60</td><td>52</td><td>340</td><td>181</td><td>2400</td><td>331</td></tr>
            <tr><td>65</td><td>56</td><td>360</td><td>186</td><td>2600</td><td>335</td></tr>
            <tr><td>70</td><td>59</td><td>380</td><td>191</td><td>2800</td><td>338</td></tr>
            <tr><td>75</td><td>63</td><td>400</td><td>196</td><td>3000</td><td>341</td></tr>
            <tr><td>80</td><td>66</td><td>420</td><td>201</td><td>3500</td><td>346</td></tr>
            <tr><td>85</td><td>70</td><td>440</td><td>205</td><td>4000</td><td>351</td></tr>
            <tr><td>90</td><td>73</td><td>460</td><td>210</td><td>4500</td><td>354</td></tr>
            <tr><td>95</td><td>76</td><td>480</td><td>214</td><td>5000</td><td>357</td></tr>
            <tr><td>100</td><td>80</td><td>500</td><td>217</td><td>6000</td><td>361</td></tr>
            <tr><td>110</td><td>86</td><td>550</td><td>226</td><td>7000</td><td>364</td></tr>
            <tr><td>120</td><td>92</td><td>600</td><td>234</td><td>8000</td><td>367</td></tr>
            <tr><td>130</td><td>97</td><td>650</td><td>242</td><td>9000</td><td>368</td></tr>
            <tr><td>140</td><td>103</td><td>700</td><td>248</td><td>10000</td><td>370</td></tr>
            <tr><td>150</td><td>108</td><td>750</td><td>254</td><td>15000</td><td>375</td></tr>
            <tr><td>160</td><td>113</td><td>800</td><td>260</td><td>20000</td><td>377</td></tr>
            <tr><td>170</td><td>118</td><td>850</td><td>265</td><td>30000</td><td>379</td></tr>
            <tr><td>180</td><td>123</td><td>900</td><td>269</td><td>40000</td><td>380</td></tr>
            <tr><td>190</td><td>127</td><td>950</td><td>274</td><td>50000</td><td>381</td></tr>
            <tr><td>200</td><td>132</td><td>1000</td><td>278</td><td>75000</td><td>382</td></tr>
            <tr><td>210</td><td>136</td><td>1100</td><td>285</td><td>1000000</td><td>384</td></tr>
        </tbody>
    </table>`;

    // Build conclusion section from AI data
    let kesimpulanHtml = '<i>Kesimpulan akan muncul di sini setelah dihasilkan oleh AI.</i>';
    if (kesimpulan && typeof kesimpulan === 'object') {
        kesimpulanHtml = `
            <h4 class="sub-bab-title">A. Kesimpulan</h4>
            <p>${kesimpulan.utama ? kesimpulan.utama.replace(/\n/g, '</p><p>') : ''}</p>
            <h4 class="sub-bab-title">B. Saran dan Rekomendasi</h4>
            <p>${kesimpulan.saran ? kesimpulan.saran.replace(/\n/g, '</p><p>') : ''}</p>
            <h4 class="sub-bab-title">C. Penutup</h4>
            <p>${kesimpulan.penutup ? kesimpulan.penutup.replace(/\n/g, '</p><p>') : ''}</p>
        `;
    }

    const coverPage = `<div id="cover-page">
            <div style="text-align:center; padding-top: 4cm;">
                <h2 class="cover-title">LAPORAN</h2>
                <h2 class="cover-title">PELAKSANAAN</h2>
                <h2 class="cover-title">SURVEI KEPUASAN MASYARAKAT</h2>
                <h2 class="cover-title">(SKM)</h2>
                <br><br>
                <h3 class="cover-title" style="margin-top: 5rem;">${namaDinas.toUpperCase()}</h3>
                ${namaUptd ? `<h3 class="cover-title">${namaUptd.toUpperCase()}</h3>` : ''}
                <h3 class="cover-title">PERIODE ${periode} TAHUN ${tahun}</h3>
            </div>
        </div>`;

    const tocPage = `<div class="page-break"><h3 class="bab-title">DAFTAR ISI</h3><table class="toc-table" style="width:100%; line-height: 2;">
        <tr><td>DAFTAR ISI</td><td class="toc-dots"></td><td></td></tr>
        <tr><td>BAB I PENDAHULUAN</td><td class="toc-dots"></td><td></td></tr>
        <tr><td style="padding-left:1.5em;">1.1 Latar Belakang</td><td class="toc-dots"></td><td></td></tr>
        <tr><td style="padding-left:1.5em;">1.2 Dasar Pelaksanaan Survei Kepuasan Masyarakat</td><td class="toc-dots"></td><td></td></tr>
        <tr><td style="padding-left:1.5em;">1.3 Maksud dan Tujuan</td><td class="toc-dots"></td><td></td></tr>
        <tr><td>BAB II PENGUMPULAN DATA SKM</td><td class="toc-dots"></td><td></td></tr>
        <tr><td style="padding-left:1.5em;">2.1 Pelaksana SKM</td><td class="toc-dots"></td><td></td></tr>
        <tr><td style="padding-left:1.5em;">2.2 Metode Pengumpulan Data</td><td class="toc-dots"></td><td></td></tr>
        <tr><td style="padding-left:1.5em;">2.3 Lokasi Pengumpulan Data</td><td class="toc-dots"></td><td></td></tr>
        <tr><td style="padding-left:1.5em;">2.4 Waktu Pelaksanaan SKM</td><td class="toc-dots"></td><td></td></tr>
        <tr><td style="padding-left:1.5em;">2.5 Penentuan Jumlah Responden</td><td class="toc-dots"></td><td></td></tr>
        <tr><td>BAB III HASIL PENGOLAHAN DATA SKM</td><td class="toc-dots"></td><td></td></tr>
        <tr><td style="padding-left:1.5em;">3.1 Jumlah Responden SKM</td><td class="toc-dots"></td><td></td></tr>
        <tr><td style="padding-left:1.5em;">3.2 Indeks Kepuasan Masyarakat</td><td class="toc-dots"></td><td></td></tr>
        <tr><td>BAB IV ANALISIS HASIL SKM</td><td class="toc-dots"></td><td></td></tr>
        <tr><td style="padding-left:1.5em;">4.1 Analisis Permasalahan/Kelemahan dan Kelebihan</td><td class="toc-dots"></td><td></td></tr>
        <tr><td style="padding-left:1.5em;">4.2 Rencana Tindak Lanjut</td><td class="toc-dots"></td><td></td></tr>
        <tr><td style="padding-left:1.5em;">4.3 Tren Nilai SKM</td><td class="toc-dots"></td><td></td></tr>
        <tr><td>BAB V PENUTUP</td><td class="toc-dots"></td><td></td></tr>
        </table></div>`;

    const bab1Page = `<div class="page-break"><h3 class="bab-title">BAB I<br>PENDAHULUAN</h3><h4 class="sub-bab-title">1.1 Latar Belakang</h4>${bab1LatarBelakang}<h4 class="sub-bab-title">1.2 Dasar Pelaksanaan Survei Kepuasan Masyarakat</h4>${bab1Dasar}<h4 class="sub-bab-title">1.3 Maksud dan Tujuan</h4>${bab1Tujuan}</div>`;

    const bab2Page = `<div class="page-break"><h3 class="bab-title">BAB II<br>PENGUMPULAN DATA SKM</h3><h4 class="sub-bab-title">2.1 Pelaksana SKM</h4><p>Survei Kepuasan Masyarakat dilakukan secara mandiri pada ${namaDinas} dengan membentuk tim pelaksana kegiatan Survei Kepuasan Masyarakat.</p><h4 class="sub-bab-title">2.2 Metode Pengumpulan Data</h4><p>Pelaksanaan SKM menggunakan kuesioner yang disebarkan kepada pengguna layanan. Kuesioner terdiri atas 9 pertanyaan sesuai dengan jumlah unsur pengukuran kepuasan masyarakat terhadap pelayanan yang diterima berdasarkan Peraturan Menteri PAN dan RB Nomor 14 Tahun 2017, yaitu: Persyaratan; Sistem, mekanisme dan prosedur; Waktu penyelesaian; Biaya/tarif; Produk spesifikasi jenis pelayanan; Kompetensi pelaksana; Perilaku pelaksana; Penanganan pengaduan, saran dan masukan; serta Sarana dan prasarana.</p><h4 class="sub-bab-title">2.3 Lokasi Pengumpulan Data</h4><p>Lokasi dan waktu pengumpulan data dilakukan di lokasi unit pelayanan pada waktu jam layanan sedang sibuk. Sedangkan pengisian kuesioner dilakukan sendiri oleh responden sebagai penerima layanan dan hasilnya dikumpulkan di tempat yang telah disediakan.</p><h4 class="sub-bab-title">2.4 Waktu Pelaksanaan SKM</h4><p class="no-indent">Survei dilakukan secara periodik dengan jangka waktu (periode) tertentu yaitu 1 (satu) semester. Penyusunan indeks kepuasan masyarakat memerlukan waktu dengan rincian sebagai berikut:</p>${waktuTable}<h4 class="sub-bab-title">2.5 Penentuan Jumlah Responden</h4><p>Dalam penentuan responden, terlebih dahulu ditentukan jumlah populasi penerima layanan dari seluruh jenis pelayanan pada ${namaDinas} (${jenisLayananText}). Jika dilihat dari perkiraan jumlah penerima layanan, maka populasi penerima layanan pada ${namaDinas} dalam kurun waktu satu tahun adalah sebanyak ${populasi} orang. Berdasarkan Tabel Krejcie and Morgan, jumlah minimum sampel responden yang harus dikumpulkan dalam satu periode SKM adalah ${sampelMinimal} orang. Adapun jumlah responden yang berhasil dikumpulkan dalam periode survei ini adalah sebanyak ${sampelAktual} orang. Dengan demikian, jumlah sampel yang diperoleh dinilai <b>${statusSampel}</b>.</p><p class="no-indent"><b>Tabel Krejcie dan Morgan</b></p>${morganTable}</div>`;

    const bab3Page = `<div class="page-break"><h3 class="bab-title">BAB III<br>HASIL PENGOLAHAN DATA SKM</h3><h4 class="sub-bab-title">3.1 Jumlah Responden SKM</h4><p class="no-indent">Berdasarkan hasil pengumpulan data, jumlah responden penerima layanan yang diperoleh yaitu ${demographics.total} orang responden, dengan rincian sebagai berikut:</p>${demoTable}<h4 class="sub-bab-title">3.2 Indeks Kepuasan Masyarakat (Unit Layanan dan Per Unsur Layanan)</h4><p class="no-indent">Pengolahan data SKM menggunakan metode yang ditetapkan dan diperoleh hasil sebagai berikut:</p>${ikmTable}<div class="chart-container" style="width: 100%; max-width: 550px; margin: 2rem auto; height: 350px;"><canvas id="unsurChart"></canvas></div></div>`;

    const bab4Page = `<div class="page-break"><h3 class="bab-title">BAB IV<br>ANALISIS HASIL SKM</h3><h4 class="sub-bab-title">4.1 Analisis Permasalahan/Kelemahan dan Kelebihan Unsur Layanan</h4><p>${analisis_utama ? analisis_utama.replace(/\n/g, '</p><p>') : '<i>Analisis akan muncul di sini setelah dihasilkan oleh AI.</i>'}</p><h4 class="sub-bab-title">4.2 Rencana Tindak Lanjut</h4><p class="no-indent">Pembahasan rencana tindak lanjut hasil SKM dilakukan melalui Forum Konsultasi Publik (FKP) bersama perwakilan pengguna layanan pada tanggal ${tglFkp}. Rencana tindak lanjut perbaikan hasil SKM dituangkan dalam tabel berikut:</p>${rtlTable}<h4 class="sub-bab-title">4.3 Tren Nilai SKM</h4>${trendContent}</div>`;

    const bab5Page = `<div class="page-break"><h3 class="bab-title">BAB V<br>PENUTUP</h3>${kesimpulanHtml}<br><br><br><table class="no-border-table" style="width: 50%; margin-left: 50%;"><tr><td style="text-align:left;">Kuningan, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td></tr><tr><td style="text-align:left;">Kepala ${namaDinas},</td></tr><tr><td style="height: 80px;"></td></tr><tr><td style="text-align:left;"><strong>${penanggungJawab.toUpperCase()}</strong></td></tr><tr><td style="text-align:left;">NIP. ${nip}</td></tr></table></div>`;

    return coverPage + tocPage + bab1Page + bab2Page + bab3Page + bab4Page + bab5Page;
}

/**
 * Updates the preview pane with the latest report content.
 */
function updatePreview() {
    const previewDiv = document.getElementById('report-preview-content');
    const fullHtml = getFullReportHTML();
    if (!fullHtml) {
        previewDiv.innerHTML = `<i>Silakan unggah dan proses file Excel untuk melihat pratinjau laporan.</i>`;
        return;
    }
    previewDiv.innerHTML = fullHtml;

    // Render charts after the HTML is in the DOM
    setTimeout(() => {
        renderTrendChart();
        renderUnsurChart();
    }, 100);
}

/**
 * Prepares the HTML content for export by converting charts to images.
 * @returns {Promise<string>} A promise that resolves with the export-ready HTML string.
 */
async function generateExportContent() {
    const fullHtml = getFullReportHTML();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = fullHtml;

    // Replace canvas charts with static images for export
    const canvases = tempDiv.querySelectorAll('canvas');
    for (const canvas of canvases) {
        const chartInstance = canvas.id === 'trendChart' ? trendChartInstance : unsurChartInstance;
        if (chartInstance) {
            const img = new Image();
            // Ensure chart background is not transparent for better export quality
            const ctx = canvas.getContext('2d');
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            img.src = chartInstance.toBase64Image('image/png', 1);
            await new Promise(resolve => {
                img.onload = resolve;
            });
            img.style.width = '100%';
            img.style.maxWidth = '600px';
            img.style.height = 'auto';
            canvas.parentNode.replaceChild(img, canvas);
        }
    }
    return tempDiv.innerHTML;
}

/**
 * Generates and downloads the final report as a PDF file.
 */
async function generatePdf() {
    if (!reportData.info) {
        showModal("Tidak ada data untuk dibuat PDF. Silakan proses file terlebih dahulu.");
        return;
    }

    const reportElement = document.createElement('div');
    reportElement.innerHTML = await generateExportContent();

    const pdfStyles = `
        <style>
            body { 
                font-family: 'Times New Roman', Times, serif; 
                font-size: 12pt; 
                line-height: 1.5;
            }
            .cover-title {
                font-size: 18pt !important;
                font-weight: bold !important;
                margin: 0.5em 0 !important;
            }
            .bab-title {
                text-align: center !important;
                font-weight: bold !important;
                font-size: 14pt;
                margin-top: 0;
            }
            .sub-bab-title {
                text-align: left !important;
                font-weight: bold !important;
                font-size: 12pt;
            }
            p {
                text-align: justify !important;
                text-indent: 2em;
            }
            p.no-indent {
                text-indent: 0;
            }
            .page-break {
                page-break-before: always;
            }
            #cover-page {
                page-break-after: always;
            }
            h3, h4 {
                 page-break-after: avoid !important;
            }
            p, li, tr, .chart-container, table {
                page-break-inside: avoid !important;
            }
            table.report-table th, table.report-table td {
                border: 1px solid black !important; /* Memastikan border selalu ada */
            }
            .no-border-table td, .no-border-table th, .toc-table td, .toc-table th {
                border: none !important;
            }
        </style>
    `;

    const fullHtmlForPdf = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            ${pdfStyles}
        </head>
        <body>
            ${reportElement.innerHTML}
        </body>
        </html>
    `;

    const options = {
        margin: [2.5, 2.0, 2.5, 2.5],
        filename: `Laporan_SKM_${reportData.info['Nama Dinas/Badan'] || 'Instansi'}_final.pdf`,
        pagebreak: {
            mode: ['css', 'legacy']
        },
        image: {
            type: 'jpeg',
            quality: 0.98
        },
        html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false
        },
        jsPDF: {
            unit: 'cm',
            format: 'a4',
            orientation: 'portrait'
        }
    };

    html2pdf().from(fullHtmlForPdf).set(options).save().then(() => {
        showModal('PDF versi final berhasil dibuat dan diunduh.', 'success');
    }).catch(error => {
        console.error('Gagal membuat PDF:', error);
        showModal('Terjadi kesalahan saat membuat PDF: ' + error.message);
    });
}
    </script>
</body>
</html>ur code goes here
