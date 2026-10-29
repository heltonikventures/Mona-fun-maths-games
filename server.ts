import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google GenAI client if GEMINI_API_KEY is available
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Fallback question generator with Nigerian context
function generateFallbackQuestion(level: string, topic: string, difficulty: string) {
  const isPrimary = level.toLowerCase().includes('primary');
  const isJSS = level.toLowerCase().includes('jss');
  
  // Diverse questions with Nigerian cultural touches (Naira, markets, snacks, sports)
  const questionPool = [
    {
      level: 'Primary 1-3',
      question: "Amara has ₦50 and buys sweet puff-puff for ₦20. How much money does she have left?",
      options: ["₦20", "₦30", "₦40", "₦70"],
      correctAnswer: "₦30",
      explanation: "Subtract ₦20 from ₦50: 50 - 20 = 30 naira remaining.",
      hint: "Count backwards from 50 by 20.",
      topic: "Money & Naira Maths"
    },
    {
      level: 'Primary 1-3',
      question: "Chidi bought 4 chin-chin bags on Monday and 5 bags on Tuesday. How many bags in total?",
      options: ["7", "8", "9", "10"],
      correctAnswer: "9",
      explanation: "Add the two amounts: 4 + 5 = 9 bags of chin-chin.",
      hint: "Add 4 and 5 together.",
      topic: "Addition & Subtraction"
    },
    {
      level: 'Primary 4-6',
      question: "In Balogun Market, 1 basket of ripe tomatoes costs ₦1,500. How much will 4 baskets cost?",
      options: ["₦4,500", "₦5,000", "₦6,000", "₦7,500"],
      correctAnswer: "₦6,000",
      explanation: "Multiply the price per basket by 4: ₦1,500 × 4 = ₦6,000.",
      hint: "Multiply 1500 by 4, or calculate (1000 × 4) + (500 × 4).",
      topic: "Multiplication & Division"
    },
    {
      level: 'Primary 4-6',
      question: "A Danfo bus carries 14 passengers. If the fare from Ikeja to CMS is ₦400 per person, how much does the conductor collect from 5 passengers?",
      options: ["₦1,500", "₦2,000", "₦2,500", "₦3,000"],
      correctAnswer: "₦2,000",
      explanation: "5 passengers × ₦400 = ₦2,000.",
      hint: "Multiply 5 by 400.",
      topic: "Money & Naira Maths"
    },
    {
      level: 'Primary 4-6',
      question: "What is 2/5 of ₦1,000 note?",
      options: ["₦200", "₦400", "₦500", "₦600"],
      correctAnswer: "₦400",
      explanation: "1/5 of 1000 is 200. Then 2 × 200 = ₦400.",
      hint: "Divide 1000 by 5 first, then multiply the result by 2.",
      topic: "Fractions, Decimals & Percentages"
    },
    {
      level: 'JSS 1-3',
      question: "Solve for x in the equation: 3x - 15 = 45",
      options: ["x = 10", "x = 15", "x = 20", "x = 25"],
      correctAnswer: "x = 20",
      explanation: "Add 15 to both sides: 3x = 60. Then divide both sides by 3: x = 20.",
      hint: "Isolate 3x first by adding 15 to 45.",
      topic: "Algebra & Equations"
    },
    {
      level: 'JSS 1-3',
      question: "The Super Eagles played a match in Abuja. A ticket seller had a 20% discount on a ₦5,000 VIP ticket. What was the discounted price?",
      options: ["₦3,500", "₦4,000", "₦4,200", "₦4,500"],
      correctAnswer: "₦4,000",
      explanation: "20% of ₦5,000 = (20/100) × 5000 = ₦1,000 discount. Discounted price = 5000 - 1000 = ₦4,000.",
      hint: "Calculate 20% of 5000 and subtract it from 5000.",
      topic: "Business Maths"
    },
    {
      level: 'JSS 1-3',
      question: "A football pitch at the National Stadium Lagos has a length of 100m and width of 60m. What is its perimeter?",
      options: ["160m", "320m", "6,000m²", "240m"],
      correctAnswer: "320m",
      explanation: "Perimeter of rectangle = 2 × (Length + Width) = 2 × (100 + 60) = 2 × 160 = 320m.",
      hint: "Perimeter is 2 × (length + width).",
      topic: "Measurement, Perimeter & Area"
    },
    {
      level: 'SS 1-3',
      question: "If log₁₀(x) = 3, what is the value of x?",
      options: ["30", "100", "300", "1,000"],
      correctAnswer: "1,000",
      explanation: "By logarithmic definition, log₁₀(x) = 3 implies x = 10³ = 1,000.",
      hint: "Convert from log form to index form: base 10 raised to power 3.",
      topic: "Algebra & Equations"
    },
    {
      level: 'SS 1-3',
      question: "A trader in Onitsha Main Market bought goods for ₦40,000 and sold them for ₦52,000. Calculate the percentage profit.",
      options: ["25%", "30%", "33.3%", "40%"],
      correctAnswer: "30%",
      explanation: "Profit = ₦52,000 - ₦40,000 = ₦12,000. Percentage profit = (12,000 / 40,000) × 100% = 30%.",
      hint: "Profit = Selling Price - Cost Price. Then (Profit / Cost Price) × 100%.",
      topic: "Business Maths"
    },
    {
      level: 'SS 1-3',
      question: "In an inter-house sports race with 8 runners, what is the probability that a runner chosen at random finishes in the top 2?",
      options: ["1/8", "1/4", "1/2", "3/8"],
      correctAnswer: "1/4",
      explanation: "Favourable outcomes = 2. Total outcomes = 8. Probability = 2/8 = 1/4 (25%).",
      hint: "Number of favourable positions (2) divided by total number of runners (8).",
      topic: "Statistics, Mean/Median & Probability"
    }
  ];

  // Try matching level or pick random
  let filtered = questionPool;
  if (isPrimary) {
    filtered = questionPool.filter(q => q.level.includes('Primary'));
  } else if (isJSS) {
    filtered = questionPool.filter(q => q.level.includes('JSS'));
  } else {
    filtered = questionPool.filter(q => q.level.includes('SS'));
  }
  
  if (filtered.length === 0) filtered = questionPool;
  const picked = filtered[Math.floor(Math.random() * filtered.length)];

  // Add random variety by generating dynamic number variations
  const mult = Math.floor(Math.random() * 3) + 1;
  return {
    ...picked,
    difficulty: difficulty || 'Medium',
    level: level
  };
}

// API: Generate questions with Gemini AI or verified fallback
app.post('/api/generate-questions', async (req: Request, res: Response) => {
  const { level = 'Primary 5', topic = 'Money & Naira Maths', difficulty = 'Medium', count = 3, gameMode = 'Maths Adventure' } = req.body;

  if (ai) {
    try {
      const prompt = `You are a warm, engaging Nigerian mathematics teacher and game master creating questions for "MATHS QUEST – Learn Maths Through Games".
Target Audience:
- School Level: ${level} (Nigerian curriculum: Primary 1-6, JSS 1-3, or SS 1-3)
- Topic: ${topic}
- Difficulty: ${difficulty}
- Game Mode Context: ${gameMode}
- Number of questions: ${count}

Instructions:
1. Make problems mathematically rigorous and 100% accurate.
2. Involve relatable Nigerian and African culture, daily life, and landmarks:
   - Currency: Naira (₦) and Kobo
   - Places: Balogun Market Lagos, Ariaria Market Aba, Bodija Market Ibadan, Yankari Game Reserve, Zuma Rock, National Stadium, Lekki Tollgate, Onitsha Main Market.
   - Food/snacks: Puff-puff, chin-chin, jollof rice, suya, akara, plantain chips, roasted corn.
   - Life: Danfo bus fares, football / Super Eagles matches, inter-house sports, school assembly, market stalls, savings clubs (Esusu).
3. Provide 4 unique multiple-choice options with exactly ONE correct answer. Options must be clear strings.
4. Provide a friendly hint and a clear step-by-step explanation.

Return ONLY a valid JSON array of question objects.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING, description: 'The math question text' },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Four multiple choice options'
                },
                correctAnswer: { type: Type.STRING, description: 'The exact correct answer matching one of the options' },
                explanation: { type: Type.STRING, description: 'Step by step explanation of the solution' },
                hint: { type: Type.STRING, description: 'A helpful hint for struggling students' },
                topic: { type: Type.STRING, description: 'Topic name' }
              },
              required: ['question', 'options', 'correctAnswer', 'explanation', 'hint']
            }
          }
        }
      });

      const responseText = response.text || '[]';
      const parsed = JSON.parse(responseText);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return res.json({ success: true, questions: parsed, source: 'gemini' });
      }
    } catch (err: any) {
      console.warn('Gemini API call failed, using verified fallback generator:', err?.message || err);
    }
  }

  // Fallback generation if no API key or on error
  const fallbackList = [];
  for (let i = 0; i < count; i++) {
    fallbackList.push(generateFallbackQuestion(level, topic, difficulty));
  }
  return res.json({ success: true, questions: fallbackList, source: 'fallback' });
});

// API: AI Math Tutor / Step-by-Step explanation
app.post('/api/tutor-explain', async (req: Request, res: Response) => {
  const { question, studentAnswer, correctAnswer, level = 'JSS 1' } = req.body;

  if (ai) {
    try {
      const prompt = `You are "Teacher Folake", an encouraging, brilliant Nigerian mathematics teacher on Maths Quest.
A student in ${level} is asking for help with this problem:
Question: "${question}"
Student's answer: "${studentAnswer || 'Not answered yet'}"
Correct answer: "${correctAnswer}"

Give a kind, energetic explanation (max 3-4 short paragraphs):
1. Acknowledge their effort with a warm Nigerian teaching expression (e.g., "Well done for trying!", "Oya, let's break this down step-by-step!", "Maths is fun when you see the pattern!").
2. Show the crystal-clear calculation step-by-step.
3. Give one quick pro-tip or memory trick to remember for next time.
Keep formatting clean with clear lines.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      });

      return res.json({ success: true, explanation: response.text });
    } catch (err: any) {
      console.warn('AI Tutor call failed, returning smart fallback:', err?.message || err);
    }
  }

  // Fallback tutor explanation
  return res.json({
    success: true,
    explanation: `Well done for giving it your best shot! Let's solve it together:
    
The correct answer is **${correctAnswer}**.
When approaching this question, first identify what values are given and what is being asked. Work through the calculation carefully: check your units, watch for plus/minus signs, and double check your arithmetic.

Keep your chin up and keep practicing! Every maths champion solved thousands of problems to become great!`
  });
});

// API: Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    aiEnabled: !!ai,
    timestamp: new Date().toISOString()
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.get('*', async (req: Request, res: Response, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      try {
        const fs = await import('fs');
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Maths Quest server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
