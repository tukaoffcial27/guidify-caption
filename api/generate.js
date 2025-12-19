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
            return new Response(JSON.stringify({ result: "Missing API Key" }), { status: 500 });
        }

        // MENGGUNAKAN MODEL LATEST UNTUK STABILITAS
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Write a viral social media caption for ${platform}. Topic: ${topic}. Tone: ${tone}. Language: English.` }] }]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            return new Response(JSON.stringify({ result: "API Error: " + data.error.message }), { status: 500 });
        }

        const resultText = data.candidates[0].content.parts[0].text;
        return new Response(JSON.stringify({ result: resultText }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ result: "System Error: " + error.message }), { status: 500 });
    }
}