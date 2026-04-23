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
    if (!API_KEY) {
      console.error("LOG: API_KEY TIDAK DITEMUKAN DI ENV VERCEL");
      return res.status(500).json({ advice: "Kuncinya (API KEY) gak ada di brankas Vercel, Puh!" });
    }

    // 3. Rakit prompt sesuai gaya lo
    const budgetInfo = budgets.map(b =>
      `- ${b.category?.name}: Terpakai ${Math.round(b.percent)}% (Sisa Rp ${(b.amount - b.used).toLocaleString('id-ID')})`
    ).join('\n');

    const prompt = `
      Kamu adalah "Sepuh Keuangan" yang bijak tapi galak dan sarkas.
      Gunakan bahasa gaul Indonesia (lo, gue, dikit-dikit, dll).
      Tugasmu adalah memberikan komentar pedas dan singkat tentang pengeluaran user.
      Jangan gunakan bullet points. Maksimal 3 kalimat.

      Data Budget Kritis User:
      ${budgetInfo}

      Berikan komentar yang bikin user mikir dua kali buat jajan lagi!
    `;

    // 4. Panggil Gemini
    const googleResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-3-flash:generateContent?key=${API_KEY}`, {
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
          maxOutputTokens: 300
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