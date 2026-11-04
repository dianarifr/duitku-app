export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Metode tidak diizinkan. Gunakan POST.' });
  }

  let budgetsForLog = null;

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { budgets } = body;
    budgetsForLog = budgets;

    if (!budgets || !Array.isArray(budgets)) {
      return res.status(400).json({ advice: 'Data anggaran tidak ditemukan pada permintaan.' });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    const API_URL = process.env.GEMINI_API_URL;
    if (!API_URL || !API_KEY) {
      throw new Error('Konfigurasi GEMINI_API_KEY dan GEMINI_API_URL belum lengkap.');
    }

    const budgetInfo = budgets.map(b => {
      const name = b.name || 'Kategori tanpa nama';
      const used = b.used || 0;
      const budget = b.budget || 0;
      const percent = Math.round(b.percent || 0);

      return `- ${name}: Terpakai ${percent}% (Budget: Rp ${budget.toLocaleString('id-ID')}, Terpakai: Rp ${used.toLocaleString('id-ID')})`;
    }).join('\n');

    const prompt = `
      Anda adalah "Penasihat Keuangan Duitku", asisten yang memberikan nasihat keuangan secara profesional, tenang, dan membangun.

      Tugas Anda:
      1. Ingatkan pengguna secara halus mengenai kategori pengeluaran dengan pemakaian anggaran tertinggi. Nama kategori wajib disebutkan.
      2. Berikan satu saran praktis agar pengeluaran pada kategori tersebut lebih terkendali.
      3. Sertakan satu kutipan singkat atau pepatah yang relevan dengan kondisi keuangan pengguna.

      Aturan penulisan:
      - Maksimal 3 kalimat, singkat dan bermakna.
      - Jangan gunakan bullet points, daftar bernomor, atau heading.
      - Jangan gunakan basa-basi pembuka.
      - Bungkus hanya nama kategori dengan penanda bold **seperti ini**. Dilarang memakai penanda markdown lain seperti italic, tautan, atau kode.

      Contoh keluaran yang diharapkan:
      - "Pengeluaran pada kategori **Makanan & Minuman** sudah mencapai batas yang perlu diperhatikan. Sebaiknya susun menu harian dan tetapkan batas belanja agar anggaran tetap terkendali. Ingatlah bahwa pengelolaan keuangan yang bijak dimulai dari pengeluaran kecil yang terukur."
      - "Kategori **Hiburan** menyerap anggaran cukup besar periode ini. Pertimbangkan untuk memilih satu jenis hiburan utama dan menunda sisanya ke periode berikutnya. Keuangan yang sehat terbentuk dari keputusan kecil yang konsisten."

      Data anggaran kritis pengguna:
      ${budgetInfo}

      Tuliskan nasihat untuk pengguna sekarang.
    `;

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

    if (data.error) {
      console.error("Kesalahan dari Gemini:", data.error.message);
      throw new Error(data.error.message);
    }

    if (!data.candidates || data.candidates.length === 0) {
      console.log("Respons Gemini tanpa kandidat:", JSON.stringify(data));
      throw new Error('Model tidak mengembalikan hasil.');
    }

    const advice = data.candidates[0].content.parts[0].text;

    return res.status(200).json({ advice });

  } catch (error) {
    console.error("Kegagalan pemrosesan saran keuangan:", error.message);
    console.log("Anggaran yang diterima saat gagal:", budgetsForLog);
    console.log("Status GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "TERSEDIA" : "KOSONG");

    return res.status(500).json({ advice: 'Saran keuangan belum dapat dimuat. Silakan coba beberapa saat lagi.' });
  }
}
