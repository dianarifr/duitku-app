export default async function handler(req, res) {
  // Hanya izinkan metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { budgets } = JSON.parse(req.body);
  const API_KEY = process.env.GEMINI_API_KEY; // Diambil dari brankas Vercel

  // 1. Rakit "Bisikan" buat Gemini (Prompt Engineering)
  const budgetInfo = budgets.map(b =>
    `- Kategori ${b.category?.name}: Terpakai ${Math.round(b.percent)}% (Sisa Rp ${(b.amount - b.used).toLocaleString('id-ID')})`
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

  try {
    // 2. Kirim ke API Gemini 1.5 Flash (Kenceng & Gratis)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    const advice = data.candidates[0].content.parts[0].text;

    // 3. Kirim hasil omelan balik ke Frontend
    return res.status(200).json({ advice });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ advice: "Duh, otaknya lagi konslet Puh. Coba lagi nanti!" });
  }
}