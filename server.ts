import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

// API route for asking doubts with Gemini
app.post('/api/ask-doubt', async (req, res) => {
  try {
    const { question, language, lessonId, stepId, stepCaption, screenName, phase, mistakes } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    const langName = language === 'ta' ? 'Tamil' : language === 'hi' ? 'Hindi' : 'English';

    if (!apiKey) {
      console.warn('[api] GEMINI_API_KEY not found in environment.');
      const fallback =
        language === 'ta'
          ? 'மன்னிக்கவும், AI இணைப்பு தற்போது கிடைக்கவில்லை. திரையில் உள்ள வழிகாட்டலின்படி தொடரலாம்.'
          : language === 'hi'
          ? 'माफ़ कीजिए, AI सेवा अभी उपलब्ध नहीं है। कृपया स्क्रीन पर दिए गए निर्देश का पालन करें।'
          : 'The assistant is temporarily offline. Please follow the instructions on screen.';
      return res.status(200).json({ answer: fallback });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemPrompt = `You are Selvi, a patient guide helping first-time Indian users learn payments and chat in a practice sandbox. Answer in the learner's language, in plain words, in 1 to 3 short sentences, using the step context. Never ask for or accept a real PIN, OTP, card or bank details; if the learner shares one, tell them not to. If the question is off topic or unsafe, gently steer back to the lesson. If you are not sure, say so. Do not invent features that are not on screen.`;

    const userPrompt = `Learner Context:
- Language: ${langName} (${language || 'ta'})
- Lesson ID: ${lessonId || 'lesson_1_send_money'}
- Current Step ID: ${stepId || 'step_1'}
- Current Step Caption: ${stepCaption || 'None'}
- Current Screen Name: ${screenName || 'HOME'}
- Phase: ${phase || 'demo'}
- Mistakes so far: ${mistakes ?? 0}

Learner Question: "${question}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const answer =
      response.text?.trim() ||
      (language === 'ta'
        ? 'திரையில் காட்டப்பட்டுள்ள பொத்தானைத் தொட்டு பயிற்சியைத் தொடரவும்.'
        : language === 'hi'
        ? 'स्क्रीन पर दिखाए गए बटन को दबाकर अभ्यास जारी रखें।'
        : 'Please continue following the highlighted target on screen.');

    res.json({ answer });
  } catch (error) {
    console.error('Error in /api/ask-doubt:', error);
    const lang = req.body?.language;
    res.status(200).json({
      answer:
        lang === 'ta'
          ? 'கவலைப்பட வேண்டாம், பயிற்சியை தொடர்ந்து செய்யலாம்.'
          : lang === 'hi'
          ? 'कोई बात नहीं, कृपया अभ्यास जारी रखें।'
          : 'Do not worry, you can continue your practice.',
    });
  }
});

// Mount Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
