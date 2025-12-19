export const config = {
    runtime: 'edge',
};

export default async function (req) {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const { topic, tone, platform } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY; 

        if (!apiKey) {
            return new Response(JSON.stringify({ 
                result: "Error: GEMINI_API_KEY is missing in Vercel." 
            }), { status: 500 });
        }

        // Menggunakan URL v1 yang lebih stabil
        const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Write a viral social media caption for ${platform}. 
                        Topic: "${topic}". 
                        Tone: ${tone}. 
                        Language: English. 
                        Include 5-10 hashtags and emojis.`
                    }]
                }]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message);
        }

        // Mengambil hasil teks dari struktur data Google
        const resultText = data.candidates[0].content.parts[0].text;

        return new Response(JSON.stringify({ result: resultText }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ result: "AI Error: " + error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}