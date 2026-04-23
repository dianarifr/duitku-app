export default async function handler(req, res) {
  // 1. CORS Headers (Biar localhost bisa nembak domain live)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle Preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Harus pake POST, Puh!' });
  }

  try {
    // 2. SAFE PARSING (Biar nggak gampang Invocation Failed)
    // Cek apakah body perlu di-parse atau sudah jadi object
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { budgets } = body;

    if (!budgets || !Array.isArray(budgets)) {
      return res.status(400).json({ advice: "Datanya mana, Puh? Kosong nih." });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ advice: "Kuncinya (API KEY) gak ada di brankas Vercel, Puh!" });
    }

    // 3. Rakit "Bisikan" buat Gemini
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
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    // Cek respon dari Google
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("Otalnya lagi bengong bentar puh!");
    }

    const advice = data.candidates[0].content.parts[0].text;

    // 5. Kirim balik ke Frontend
    return res.status(200).json({ advice });

  } catch (error) {
    console.error("Error Detail:", error.message);
    return res.status(500).json({ advice: "Duh, otaknya lagi konslet Puh. Coba lagi nanti!" });
  }
}