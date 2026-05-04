export default async function handler(req, res) {
  // 1. CORS Headers (Tetep stay biar localhost aman)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Harus pake POST, Puh!' });
  }

  // Siapkan variabel di luar try biar bisa dibaca di catch kalau error
  let budgetsForLog = null;

  try {
    // 2. SAFE PARSING (Gak bakal meledak kalau body udah object)
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { budgets } = body;
    budgetsForLog = budgets; // Simpan buat log kalau nanti error

    if (!budgets || !Array.isArray(budgets)) {
      return res.status(400).json({ advice: "Datanya mana, Puh? Kosong nih." });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    const API_URL = process.env.GEMINI_API_URL;
    if (!API_URL || !API_KEY) {
      throw new Error("Konfigurasi ENV belum lengkap, Puh!");
    }

    // 3. Rakit prompt sesuai gaya lo
    const budgetInfo = budgets.map(b => {
      const name = b.name || 'Kategori Misterius';
      const used = b.used || 0;
      const budget = b.budget || 0;
      const percent = Math.round(b.percent || 0);

      return `- ${name}: Terpakai ${percent}% (Budget: Rp ${budget.toLocaleString('id-ID')}, Terpakai: Rp ${used.toLocaleString('id-ID')})`;
    }).join('\n');

    const prompt = `
      Kamu adalah "Penasihat Keuangan Berkah" yang gayanya adem, bijak, dan selalu mengingatkan soal amanah harta dengan bahasa yang santai.
      Gunakan bahasa gaul yang sopan dan islami (ges, barakah, mubadzir, amanah, ana, antum, dll).

      Tugas lo:
      1. Ingatkan user secara halus tentang kategori pengeluaran yang paling besar agar tidak terjatuh dalam sifat mubadzir. WAJIB sebutkan nama kategorinya!
      2. Berikan satu saran islami yang masuk akal agar pengeluaran tersebut lebih terjaga dan membawa keberkahan.
      3. Berikan quote atau nasihat singkat yang relevan dengan kondisi keuangan user, boleh dari Al-Qur'an, Hadits, atau kata-kata bijak para ulama.

      Aturan main, PENTING!!!
      - Maksimal 3 kalimat, buat pesannya singkat tapi bermakna.
      - Dilarang keras pakai bullet points atau list.
      - Jangan pakai basa-basi, langsung ke intinya.

      Ini contoh output yang gue mau:
      - "Kategori Makanan & Minuman antum sepertinya sudah mulai berlebihan ges, ingatlah kalau harta itu amanah yang akan ditanya pertanggungjawabannya. Saran ana, coba mulai gaya hidup sederhana dan jangan lupa sedekah subuh agar sisa harta makin barakah."
      - "Jangan sampai pengeluaran untuk Hiburan bikin kantong bolong, ges. Coba deh alihkan ke hobi yang lebih bermanfaat seperti datang ke kajian dan jangan lupa baca doa sebelum keluar rumah biar rezeki makin lancar."
      - "Wah, Pengeluaran untuk Transportasi sudah cukup besar nih, ges. Coba pertimbangkan untuk lebih sering jalan kaki atau naik sepeda agar lebih sehat dan hemat. Ingat, 'Sesungguhnya pemborosan itu saudara dari syaitan' (QS. Al-Isra: 27)."

      Data Budget Kritis User:
      ${budgetInfo}

      Berikan nasihat lo sekarang!
    `;

    // 4. Panggil Gemini
    const googleResponse = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 1000,
        }
      })
    });

    const data = await googleResponse.json();

    // 5. Cek Error Spesifik dari Google (Penting!)
    if (data.error) {
      console.error("LOG ERROR GOOGLE:", data.error.message);
      throw new Error(data.error.message);
    }

    if (!data.candidates || data.candidates.length === 0) {
      console.log("ISI DATA DARI GOOGLE:", JSON.stringify(data));
      throw new Error("Otaknya lagi bengong bentar puh!");
    }

    const advice = data.candidates[0].content.parts[0].text;

    return res.status(200).json({ advice });

  } catch (error) {
    // 6. Log yang jujur di Vercel, tapi user tetep dapet pesan cakep lo
    console.error("ALASAN ASLI RUSAK:", error.message);
    console.log("Budget yang diterima saat error:", budgetsForLog);
    console.log("Kondisi API Key:", !!process.env.GEMINI_API_KEY ? "ADA" : "KOSONG");

    // Pesan default lo yang cakep
    return res.status(500).json({ advice: "Duh, otaknya lagi konslet Puh. Coba lagi nanti!" });
  }
}