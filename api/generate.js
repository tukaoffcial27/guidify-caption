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
                result: "Error: API Key is missing in Vercel settings." 
            }), { status: 500 });
        }

        const prompt = `Write a viral social media caption for ${platform}.
        Topic: "${topic}"
        Tone: ${tone}
        Language: English (Engaging & Trendy).
        Include relevant emojis and 5-10 hashtags at the end. Do not use quotes.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        const resultText = data.candidates[0].content.parts[0].text;

        return new Response(JSON.stringify({ result: resultText }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ result: "Error: " + error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}