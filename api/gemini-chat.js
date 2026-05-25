export default async function handler(req, res) {
  // 1. CORS Headers (Biar di Linux Mint lo aman tanpa hambatan)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Harus pake POST, ges!' });
  }

  try {
    // Safe Parsing Body
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { prompt, context } = body;

    if (!prompt) {
      return res.status(400).json({ advice: "Mau nanya apa, ges? Ketikannya kosong nih." });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    const API_URL = process.env.GEMINI_API_URL;
    if (!API_URL || !API_KEY) {
      throw new Error("Konfigurasi ENV belum lengkap, ges!");
    }

    // Parse data transaksi dari frontend (jika ada)
    let transactionData = [];
    if (context) {
      transactionData = typeof context === 'string' ? JSON.parse(context) : context;
    }

    // Olah data transaksi menjadi ringkasan teks biar hemat token & AI gampang baca
    const transactionSummary = transactionData.length > 0
      ? transactionData.map(t => {
          const catName = t.category?.name || 'Lain-lain';
          return `- Tanggal: ${t.date}, Kategori: ${catName}, Tipe: ${t.type}, Jumlah: Rp ${t.amount.toLocaleString('id-ID')}, Catatan: ${t.note || '-'}`;
        }).join('\n')
      : 'Tidak ada data transaksi yang tersedia untuk rentang waktu ini.';

    const systemInstruction = `
        Kamu adalah "AI Coach Duitku", penasihat keuangan pribadi yang gayanya adem, bijak, tapi santai dan solutif.
        Gunakan bahasa gaul yang sopan dan islami (barakah, mubadzir, amanah, ana, antum, dll).

        Aturan penting dalam menjawab:
        1. Jawab pertanyaan user berdasarkan 'Data Transaksi Nyata' yang dilampirkan di bawah. Jangan mengargarang data!
        2. Jika user menanyakan pengeluaran terbanyak/boros, lakukan analisis singkat dari data yang ada, WAJIB sebutkan nama kategorinya dan JUMLAH NOMINAL RUPIAHNYA (Contoh: Rp 850.000). Ingatkan agar tidak mubadzir.
        3. Berikan saran keuangan yang konkret, islami, dan membawa keberkahan.
        4. Jaga jawaban agar tetap padat, ringkas, maksimal 3-4 kalimat. Jangan gunakan bullet points atau daftar list!
        5. PENTING!!! Gunakan format tag HTML <b>...</b> untuk menebalkan kata penting (seperti nama kategori atau nominal uang). DILARANG keras menggunakan format markdown bintang-bintang (**).
        `;

    const fullPrompt = `
      ${systemInstruction}

      === DATA TRANSAKSI NYATA USER (HANYA BISA DIAUDIT, READ-ONLY) ===
      ${transactionSummary}
      ===================================================================

      Pertanyaan User: "${prompt}"

      Berikan jawaban antum sekarang langsung ke intinya:
    `;

    // Panggil Gemini
    const googleResponse = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        }
      })
    });

    const data = await googleResponse.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const advice = data.candidates[0].content.parts[0].text;
    return res.status(200).json({ advice });

  } catch (error) {
    console.error("ALASAN ASLI CHAT ERROR:", error.message);
    return res.status(500).json({ advice: "Duh, otak AI-nya lagi konslet ges. Coba tanya lagi bentar!" });
  }
}