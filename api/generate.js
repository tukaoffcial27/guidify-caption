export const config = {
    runtime: 'edge', // Agar super cepat (Vercel Edge Function)
};

export default async function (req) {
    // 1. Cek Metode Request (Harus POST)
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        // 2. Ambil Data dari HTML (Topik, Gaya, Platform)
        const { topic, tone, platform } = await req.json();

        // 3. Cek Apakah API Key Sudah Ada (Nanti kita set di Vercel)
        const apiKey = process.env.OPENAI_API_KEY; 
        
        if (!apiKey) {
            // Mode Simulasi (Jika belum bayar OpenAI, tetap jalan tapi dummy)
            return new Response(JSON.stringify({ 
                result: `[MODE SIMULASI] Karena API Key belum aktif, ini contoh hasil:\n\nTopik: ${topic}\nGaya: ${tone}\nPlatform: ${platform}\n\nKeren kan? Nanti kalau sudah bayar, ini isinya beneran dari AI!` 
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 4. Prompt Engineering (Perintah ke AI)
        const prompt = `Buatkan caption sosial media untuk platform ${platform}.
        Topik: "${topic}"
        Gaya Bahasa: ${tone}
        Bahasa: Indonesia (Gaul dan Menarik).
        Sertakan emoji yang relevan dan 5-10 hashtag populer di akhir.
        Jangan pakai tanda kutip di awal/akhir.`;

        // 5. Kirim ke OpenAI
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo', // Model murah & cepat
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7, // Kreativitas
                max_tokens: 500,
            })
        });

        const data = await response.json();

        // Cek jika ada error dari OpenAI (Misal saldo habis)
        if (data.error) {
            throw new Error(data.error.message);
        }

        // 6. Kirim Balik Hasil ke HTML
        return new Response(JSON.stringify({ result: data.choices[0].message.content }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ result: "Error: " + error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}