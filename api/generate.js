export const config = {
    runtime: 'edge',
};

export default async function (req) {
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

    try {
        const { topic, tone, platform, image } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) return new Response(JSON.stringify({ result: "API Key missing" }), { status: 500 });

        const modelId = "gemini-3-flash-preview"; 
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

        // Menyiapkan bagian konten (teks dan gambar jika ada)
        const parts = [
            { text: `Write a viral social media caption for ${platform}. Topic: ${topic}. Tone: ${tone}. Language: Automatically detect the language of the topic and reply in the same language. If an image is provided, analyze the visual elements to make the caption more relevant. Include emojis and viral hashtags.` }
        ];

        // Jika ada gambar, masukkan ke dalam request
        if (image) {
            parts.push({
                inline_data: {
                    mime_type: "image/jpeg",
                    data: image.split(',')[1] // Mengambil base64 saja
                }
            });
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: parts }]
            })
        });

        const data = await response.json();

        if (data.error) {
            return new Response(JSON.stringify({ result: "Google AI Error: " + data.error.message }), { status: 500 });
        }

        const resultText = data.candidates[0].content.parts[0].text;
        return new Response(JSON.stringify({ result: resultText }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ result: "System Error: " + error.message }), { status: 500 });
    }
}