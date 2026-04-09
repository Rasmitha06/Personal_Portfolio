const MODEL = 'gemini-2.5-flash-lite';
const MAX_HISTORY = 4;
const replyCache = new Map();
const CACHE_LIMIT = 100;
const SYSTEM_PROMPT = [
  "You are Rasmitha Chinthalapally's portfolio assistant.",
  'Answer only from the portfolio context you are given.',
  'Be warm, concise, and helpful.',
  'Keep most replies between 2 and 5 sentences.',
  'For project questions, explain the problem, tech used, how it works, and the outcome.',
  'If details are uncertain, say so instead of inventing facts.',
  'Knowledge:',
  'Rasmitha is a Computer Science graduate student at the University of South Florida in Tampa, Florida, expected to graduate in May 2026 with a 3.89 GPA.',
  'She completed a B.Tech in Computer Science and Engineering at Malla Reddy Engineering College for Women with a 9.22 GPA.',
  'At USF as a Student Assistant since January 2025, she reviewed 20+ ML and analytics projects, built a Python automation framework for preprocessing 500+ datasets that saved 20+ hours per week, and streamlined lab workflows for 30+ students using Copilot-assisted debugging, reducing support queries by 25%.',
  'Core strengths include Python, Java, SQL, JavaScript, backend systems, full-stack development, data pipelines, machine learning, NLP, computer vision, Azure, AWS, Databricks, Snowflake, TensorFlow, OpenCV, and Scikit-learn.',
  'Main projects:',
  'Portfolio Assistant Chatbot: AI assistant built into the portfolio using Gemini API, JavaScript, HTML, CSS, and prompt engineering to answer visitor questions in real time.',
  'Real-Time Sign Language Interpretation: OpenCV, MediaPipe, CNNs, and Python; 26 ASL classes; 93% accuracy; sub-20ms latency at 30+ FPS; 2,500-sample custom dataset.',
  'Malicious URL Detection System: real-time web app using lexical features with Logistic Regression and SVM; 9% accuracy improvement; under 50ms inference; related publication in JST.',
  'Emotional Cue Recognition in Speech: CNN model using MFCC, chroma, and mel-spectrogram features on 1,400+ RAVDESS audio samples; 91% F1-score across 5 emotions.',
  'Suspicious Activity Detection from CCTV: ResNet-based classifier; 90% accuracy; 40% reduction in processed frames; GUI alert tool improved response time by 30%.',
  'Publication: "Enhanced Malicious URL Detection System with Machine Learning Algorithms", Journal of Science and Technology, Volume 8, Issue 07, July 2023, DOI 10.46243.',
  'If someone asks about contact, email, LinkedIn, resume, availability, or hiring, direct them to rasmitha@usf.edu and linkedin.com/in/rasmithach03 and note that she is open to software engineering, data, and machine learning opportunities.'
].join(' ');

function getLatestUserText(messages = []) {
  const latestUserMessage = [...messages].reverse().find((message) => message.role === 'user');
  return (latestUserMessage?.content || '').trim();
}

function includesAny(text, patterns) {
  return patterns.some((pattern) => text.includes(pattern));
}

function getCommonReply(text) {
  const normalized = text.toLowerCase();
  const wantsStepByStep = includesAny(normalized, ['step by step', 'how does it work', 'how it works', 'how did she build', 'explain']);

  if (!normalized) return null;

  if (normalized === 'projects' || normalized.includes('all projects')) {
    return 'Rasmitha’s main projects include a Portfolio Assistant Chatbot, Real-Time Sign Language Interpretation, Malicious URL Detection, Emotional Cue Recognition in Speech, and Suspicious Activity Detection from CCTV. Together, they reflect her strengths in software engineering, machine learning, and real-time intelligent systems.';
  }

  if (normalized === 'skills & tech' || normalized === 'skills and tech') {
    return 'Rasmitha works across Python, Java, SQL, JavaScript, HTML, CSS, Azure, AWS, Databricks, Snowflake, TensorFlow, OpenCV, Scikit-learn, NLP, CNNs, backend systems, full-stack development, and data pipelines.';
  }

  if (normalized === 'education') {
    return 'Rasmitha is pursuing an M.S. in Computer Science at the University of South Florida and completed her B.Tech in Computer Science and Engineering at Malla Reddy Engineering College for Women.';
  }

  if (normalized === 'contact') {
    return 'You can reach Rasmitha at rasmitha@usf.edu, and she is also available on LinkedIn at linkedin.com/in/rasmithach03.';
  }

  if (normalized === 'about rasmitha') {
    return 'Rasmitha is a Computer Science graduate student at USF focused on software engineering, machine learning, backend systems, and data-driven products. She enjoys building scalable, real-world applications across AI, analytics, and full-stack development.';
  }

  if (includesAny(normalized, ['portfolio assistant', 'chatbot project', 'portfolio chatbot', 'project 5', 'fifth project', 'last project'])) {
    return wantsStepByStep
      ? 'Step by step, the Portfolio Assistant Chatbot works like this: it captures a visitor question in the portfolio UI, sends the recent chat context to the Gemini API, receives a generated reply, and displays that answer back inside the embedded assistant. From a software engineering perspective, it combines JavaScript, HTML, CSS, prompt design, and API integration to turn the portfolio into an interactive experience.'
      : 'The Portfolio Assistant Chatbot is an AI feature built directly into Rasmitha’s portfolio. It uses the Gemini API, JavaScript, HTML, and CSS to answer questions about her skills, projects, and experience in real time, making the portfolio more interactive and visitor-friendly.';
  }

  if (includesAny(normalized, ['sign language', 'asl', 'real-time sign language', 'project 1', 'first project'])) {
    return wantsStepByStep
      ? 'Step by step, the Real-Time Sign Language Interpretation system captures live hand frames, extracts hand landmarks with MediaPipe, feeds those features into a CNN model, and predicts one of 26 ASL gesture classes in real time. It was built with OpenCV, MediaPipe, CNNs, and Python, and it achieved 93% accuracy with sub-20ms latency at 30+ FPS on a 2,500-sample custom dataset.'
      : 'The Real-Time Sign Language Interpretation project uses OpenCV, MediaPipe, CNNs, and Python to classify 26 ASL gestures from live hand landmarks. It reached 93% accuracy with sub-20ms latency at 30+ FPS using a 2,500-sample custom dataset.';
  }

  if (includesAny(normalized, ['malicious url', 'url detection', 'project 2', 'second project'])) {
    return wantsStepByStep
      ? 'Step by step, the Malicious URL Detection System takes a URL, extracts lexical features from it, sends those features through trained Logistic Regression and SVM models, and returns a risk prediction in real time. It improved detection accuracy by 9% through tuning and delivers inference in under 50ms as an end-to-end web app.'
      : 'The Malicious URL Detection System is an end-to-end web app for real-time URL risk assessment. It uses lexical feature extraction with Logistic Regression and SVM models, improved accuracy by 9% through tuning, and delivers inference in under 50ms.';
  }

  if (includesAny(normalized, ['emotional cue', 'speech emotion', 'ravdess', 'project 3', 'third project'])) {
    return wantsStepByStep
      ? 'Step by step, the Emotional Cue Recognition project converts speech clips into MFCC, chroma, and mel-spectrogram features, feeds those representations into a CNN model, and classifies the emotional category. It used more than 1,400 RAVDESS audio samples and achieved a 91% F1-score across 5 emotions.'
      : 'The Emotional Cue Recognition in Speech project uses CNNs on MFCC, chroma, and mel-spectrogram features from more than 1,400 RAVDESS audio samples. It achieved a 91% F1-score across 5 emotional categories.';
  }

  if (includesAny(normalized, ['suspicious activity', 'cctv', 'project 4', 'fourth project'])) {
    return wantsStepByStep
      ? 'Step by step, the Suspicious Activity Detection system processes CCTV frames, evaluates them with a ResNet-based classifier, flags risky activity when confidence crosses the threshold, and surfaces alerts through a GUI tool. It achieved 90% accuracy, reduced processed frames by 40%, and improved response time by 30%.'
      : 'The Suspicious Activity Detection project uses a ResNet-based classifier on CCTV imagery to detect risky events. It achieved 90% accuracy, reduced processed frames by 40%, and used a GUI alert tool that improved response time by 30%.';
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

  if (includesAny(normalized, ['skills', 'tech stack', 'languages', 'programming languages', 'frameworks', 'libraries', 'tools', 'tooling', 'cloud', 'platforms', 'databases', 'database', 'ml stack', 'machine learning stack'])) {
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages = [] } = req.body || {};

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Missing GEMINI_API_KEY in environment' });
    }

    const latestUserText = getLatestUserText(messages);
    if (latestUserText.length < 2) {
      return res.status(200).json({
        reply: 'Could you ask a slightly more specific question about Rasmitha, her work, or her projects?',
        source: 'guard'
      });
    }

    const cacheKey = latestUserText.toLowerCase().trim();
    if (replyCache.has(cacheKey)) {
      return res.status(200).json({ reply: replyCache.get(cacheKey), source: 'cache' });
    }

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

    if (replyCache.size >= CACHE_LIMIT) {
      const firstKey = replyCache.keys().next().value;
      replyCache.delete(firstKey);
    }
    replyCache.set(cacheKey, reply);

    return res.status(200).json({ reply, source: 'model' });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
