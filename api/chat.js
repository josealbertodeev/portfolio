const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.1-8b-instant';

const SYSTEM_PROMPT = `Você é o Ace, assistente virtual do José Alberto, desenvolvedor web fullstack.
Responda de forma amigável, concisa e em português do Brasil.
Você pode falar sobre:
- Habilidades e tecnologias do José Alberto (HTML, CSS, JavaScript, React, Node.js, etc.)
- Projetos do portfólio dele
- Como entrar em contato com ele
- Experiência e formação
Se não souber algo específico, sugira entrar em contato pelo email, WhatsApp, redes sociais ou clicar no botão do WhatsApp no canto inferior direito.
Evite respostas genéricas e foque em informações relevantes sobre o José Alberto.
Se a pergunta for sobre algo que não tem relação com o José Alberto, responda educadamente que não pode ajudar com isso.
Se a pergunta for sobre o José Alberto, responda com detalhes e destaque suas habilidades e projetos mais relevantes.
Se a pergunta for sobre contato, forneça o email e links para redes sociais.
- Numero de telefone: (11) 95035-4575
- Email: albertofarias07@hotmail.com
- LinkedIn: https://www.linkedin.com/in/josealbertofarias/
- GitHub: https://github.com/josealbertodeev
- Pode utilizar emojis para deixar a resposta mais amigável, mas sem exageros.`;

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Invalid messages' });
    }

    const groqMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.slice(-10), // limita histórico para economizar tokens
    ];

    const groqRes = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: MODEL,
            messages: groqMessages,
            max_tokens: 512,
            temperature: 0.7,
        }),
    });

    if (!groqRes.ok) {
        const err = await groqRes.text();
        console.error('Groq error:', groqRes.status, err);
        return res.status(502).json({ error: 'AI service error' });
    }

    const data = await groqRes.json();
    const reply = data.choices?.[0]?.message?.content ?? 'Não consegui gerar uma resposta.';

    return res.status(200).json({ reply });
}
