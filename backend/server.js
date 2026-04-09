require('dotenv').config({ path: [`${__dirname}/.env`, '.env'] });

const express = require('express');
const cors = require('cors');

const MODEL = 'gemini-2.5-flash-lite';
const MAX_HISTORY = 6;
const SYSTEM_PROMPT = [
  "You are Rasmitha Chinthalapally's portfolio assistant.",
  'Answer only from the portfolio context you are given.',
  'Be warm, concise, and helpful.',
  'Keep most replies between 2 and 5 sentences.',
  'For project questions, explain the problem, tech used, how it works, and the outcome.',
  'If details are uncertain, say so instead of inventing facts.'
].join(' ');

function getLatestUserText(messages = []) {
  const latestUserMessage = [...messages].reverse().find((message) => message.role === 'user');
  return (latestUserMessage?.content || '').trim();
}

function getCommonReply(text) {
  const normalized = text.toLowerCase();

  if (!normalized) return null;

  if (normalized.includes('portfolio assistant') || normalized.includes('chatbot project') || normalized.includes('portfolio chatbot')) {
    return 'The Portfolio Assistant Chatbot is an AI feature built directly into Rasmitha’s portfolio. It uses the Gemini API, JavaScript, HTML, and CSS to answer questions about her skills, projects, and experience in real time, making the portfolio more interactive and visitor-friendly.';
  }

  if (normalized.includes('sign language') || normalized.includes('asl') || normalized.includes('real-time sign language')) {
    return 'The Real-Time Sign Language Interpretation project uses OpenCV, MediaPipe, CNNs, and Python to classify 26 ASL gestures from live hand landmarks. It reached 93% accuracy with sub-20ms latency at 30+ FPS using a 2,500-sample custom dataset.';
  }

  if (normalized.includes('malicious url') || normalized.includes('url detection')) {
    return 'The Malicious URL Detection System is an end-to-end web app for real-time URL risk assessment. It uses lexical feature extraction with Logistic Regression and SVM models, improved accuracy by 9% through tuning, and delivers inference in under 50ms.';
  }

  if (normalized.includes('emotional cue') || normalized.includes('speech emotion') || normalized.includes('ravdess')) {
    return 'The Emotional Cue Recognition in Speech project uses CNNs on MFCC, chroma, and mel-spectrogram features from more than 1,400 RAVDESS audio samples. It achieved a 91% F1-score across 5 emotional categories.';
  }

  if (normalized.includes('suspicious activity') || normalized.includes('cctv')) {
    return 'The Suspicious Activity Detection project uses a ResNet-based classifier on CCTV imagery to detect risky events. It achieved 90% accuracy, reduced processed frames by 40%, and used a GUI alert tool that improved response time by 30%.';
  }

  if (normalized.includes('email') || normalized.includes('contact') || normalized.includes('reach out')) {
    return 'You can reach Rasmitha at rasmitha@usf.edu, and she is also available on LinkedIn at linkedin.com/in/rasmithach03.';
  }

  if (normalized.includes('linkedin')) {
    return 'Rasmitha’s LinkedIn is linkedin.com/in/rasmithach03, which is the best place to connect professionally.';
  }

  if (normalized.includes('github')) {
    return 'You can explore Rasmitha’s work on GitHub at github.com/Rasmitha06.';
  }

  if (normalized.includes('resume') || normalized.includes('open to work') || normalized.includes('available')) {
    return 'Rasmitha is actively interested in software engineering, data, and machine learning opportunities. You can contact her by email or LinkedIn for resume and hiring conversations.';
  }

  if (normalized.includes('where') && (normalized.includes('located') || normalized.includes('based'))) {
    return 'Rasmitha is based in Tampa, Florida, and is studying at the University of South Florida.';
  }

  if (normalized.includes('education') || normalized.includes('study') || normalized.includes('university')) {
    return 'Rasmitha is pursuing an M.S. in Computer Science at the University of South Florida and previously completed a B.Tech in Computer Science and Engineering at Malla Reddy Engineering College for Women.';
  }

  if (normalized.includes('skills') || normalized.includes('tech stack')) {
    return 'Rasmitha’s core strengths include Python, Java, SQL, JavaScript, machine learning, NLP, computer vision, data pipelines, backend systems, and full-stack development.';
  }

  if (normalized.includes('who is rasmitha') || normalized.includes('about rasmitha') || normalized === 'rasmitha') {
    return 'Rasmitha is a Computer Science graduate student at USF focused on software engineering, machine learning, backend systems, and data-driven products. She enjoys building scalable, real-world applications across AI, analytics, and full-stack development.';
  }

  return null;
}

function buildGeminiContents(messages = []) {
  return messages.slice(-MAX_HISTORY).map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }]
  }));
}

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'portfolio-chat-backend',
    routes: ['POST /chat', 'POST /api/chat']
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post(['/chat', '/api/chat'], async (req, res) => {
  try {
    const { messages = [] } = req.body || {};

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Missing GEMINI_API_KEY in environment' });
    }

    const latestUserText = getLatestUserText(messages);
    const commonReply = getCommonReply(latestUserText);
    if (commonReply) {
      return res.status(200).json({ reply: commonReply, source: 'rule' });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }]
          },
          contents: buildGeminiContents(messages)
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', data);

      const errorMessage = data.error?.message || 'Gemini API request failed';
      if (errorMessage.toLowerCase().includes('quota')) {
        return res.status(200).json({
          reply: "I'm receiving too many requests right now. Please wait a few seconds and try again."
        });
      }

      return res.status(response.status).json({ error: errorMessage });
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't generate a response.";

    return res.json({ reply, source: 'model' });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
