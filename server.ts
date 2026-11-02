import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Helper to get GoogleGenAI client dynamically with API key from environment
function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Timeout helper to prevent requests from hanging
async function withTimeout<T>(promise: Promise<T>, ms: number = 6000): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

// Smart algorithmic math problem solver & curriculum coach for Mr Helton
function solveMathProblemLocally(
  question: string,
  studentAnswer: string | null | undefined,
  correctAnswer: string | null | undefined,
  level: string = 'JSS 1'
): string {
  const qClean = (question || '').trim();
  const lower = qClean.toLowerCase();

  // 1. Check for basic arithmetic expressions like "45 + 23", "120 * 5", "500 - 180", "144 / 12"
  const arithMatch = qClean.match(/(\d+(?:\.\d+)?)\s*([\+\-\*\/x×÷])\s*(\d+(?:\.\d+)?)/i);
  if (arithMatch) {
    const n1 = parseFloat(arithMatch[1]);
    const op = arithMatch[2];
    const n2 = parseFloat(arithMatch[3]);
    let result = 0;
    let opName = '';
    let explanationSteps = '';

    if (op === '+' || op === 'plus') {
      result = n1 + n2;
      opName = 'Addition';
      explanationSteps = `1. Line up the numbers by place value.\n2. Add them: ${n1} + ${n2} = **${result}**.`;
    } else if (op === '-' || op === 'minus') {
      result = n1 - n2;
      opName = 'Subtraction';
      explanationSteps = `1. Start with the starting quantity: ${n1}.\n2. Take away ${n2}: ${n1} - ${n2} = **${result}**.`;
    } else if (op === '*' || op === 'x' || op === '×' || op === 'times') {
      result = n1 * n2;
      opName = 'Multiplication';
      explanationSteps = `1. Break down the factors or use the times table.\n2. Multiply: ${n1} × ${n2} = **${result}**.`;
    } else if (op === '/' || op === '÷' || op === 'divided by') {
      result = n2 !== 0 ? Math.round((n1 / n2) * 100) / 100 : 0;
      opName = 'Division';
      explanationSteps = `1. Share ${n1} into ${n2} equal parts.\n2. ${n1} ÷ ${n2} = **${result}**.`;
    }

    return `Hello champion! I am Mr Helton, your Mathematics Coach. Let's solve this together!\n\n` +
      `**Problem:** ${qClean}\n` +
      `**Topic:** ${opName}\n\n` +
      `**Step-by-Step Solution:**\n` +
      `${explanationSteps}\n\n` +
      `**Final Answer:** **${result}**\n\n` +
      `💡 **Mr Helton's Pro-Tip:** Double-check your calculation using the reverse operation! Keep up the brilliant effort!`;
  }

  // 2. Linear equation like "3x - 15 = 45" or "2x + 8 = 20"
  const eqMatch = qClean.match(/(\d+)\s*([a-z])\s*([\+\-])\s*(\d+)\s*=\s*(\d+)/i);
  if (eqMatch) {
    const a = parseFloat(eqMatch[1]);
    const variable = eqMatch[2];
    const sign = eqMatch[3];
    const b = parseFloat(eqMatch[4]);
    const c = parseFloat(eqMatch[5]);
    const rhsAfterMove = sign === '-' ? c + b : c - b;
    const finalVal = a !== 0 ? Math.round((rhsAfterMove / a) * 100) / 100 : 0;
    const oppositeSignWord = sign === '-' ? `Add ${b}` : `Subtract ${b}`;

    return `Hello! Mr Helton here. Equations are just balancing scales! Let's solve for **${variable}** step-by-step:\n\n` +
      `**Given Equation:** ${qClean}\n\n` +
      `**Step 1:** Isolate the variable term (${a}${variable}).\n` +
      `• ${oppositeSignWord} to both sides: ${a}${variable} = ${c} ${sign === '-' ? '+' : '-'} ${b} = ${rhsAfterMove}\n\n` +
      `**Step 2:** Divide both sides by the coefficient ${a}:\n` +
      `• ${variable} = ${rhsAfterMove} ÷ ${a} = **${finalVal}**\n\n` +
      `**Final Answer:** **${variable} = ${finalVal}**\n\n` +
      `💡 **Mr Helton's Pro-Tip:** Substitute ${finalVal} back into the equation: ${a}(${finalVal}) ${sign} ${b} = ${c}. It balances!`;
  }

  // 3. Percentage question (e.g., "20% of 5000" or "discount of 15% on 4000")
  const pctMatch = qClean.match(/(\d+(?:\.\d+)?)\s*%\s*(?:of|on)?\s*(?:₦|naira)?\s*(\d+(?:\.\d+)?)/i);
  if (pctMatch) {
    const pct = parseFloat(pctMatch[1]);
    const total = parseFloat(pctMatch[2]);
    const val = (pct / 100) * total;
    return `Hello there! Mr Helton is ready to help you with percentages.\n\n` +
      `**Question:** Find ${pct}% of ₦${total.toLocaleString()}\n\n` +
      `**Step-by-Step Calculation:**\n` +
      `1. Remember that "percent" means "out of 100", so ${pct}% = ${pct} / 100 = ${pct / 100}.\n` +
      `2. Multiply this fraction by the total amount:\n` +
      `   (${pct} ÷ 100) × ${total} = **₦${val.toLocaleString()}**\n\n` +
      `**Final Answer:** **₦${val.toLocaleString()}**\n\n` +
      `💡 **Mr Helton's Pro-Tip:** To find 10% quickly, simply shift the decimal point one digit to the left!`;
  }

  // 4. Perimeter or Area of Rectangle / Sports pitch
  if (lower.includes('perimeter') && (lower.includes('rectangle') || lower.includes('pitch') || lower.includes('field') || lower.includes('stadium'))) {
    return `Hello! Mr Helton is here. Let's find the perimeter!\n\n` +
      `**Formula:** Perimeter = 2 × (Length + Width) or (L + W + L + W)\n\n` +
      `**Step-by-Step:**\n` +
      `1. Identify the Length (L) and Width (W) of the shape.\n` +
      `2. Add Length and Width together: (L + W).\n` +
      `3. Multiply the sum by 2.\n\n` +
      `💡 **Mr Helton's Pro-Tip:** Perimeter is the total distance walked all the way around the outer boundary!`;
  }

  // 5. Area of rectangle / square
  if (lower.includes('area') && (lower.includes('rectangle') || lower.includes('square') || lower.includes('triangle') || lower.includes('circle'))) {
    return `Greetings! Mr Helton here to guide you through calculating Area!\n\n` +
      `**Common Area Formulas:**\n` +
      `• **Rectangle:** Length × Width (L × W)\n` +
      `• **Square:** Side × Side (S²)\n` +
      `• **Triangle:** ½ × Base × Height (½ × b × h)\n` +
      `• **Circle:** π × r² (where π ≈ 22/7 or 3.142)\n\n` +
      `**Step-by-Step:**\n` +
      `1. Note down your given dimensions.\n` +
      `2. Multiply following the formula.\n` +
      `3. Always state your answer in square units (cm², m²).\n\n` +
      `💡 **Mr Helton's Pro-Tip:** Area measures the flat surface enclosed inside the boundary.`;
  }

  // 6. Fractions guidance
  if (lower.includes('fraction') || lower.includes('numerator') || lower.includes('denominator')) {
    return `Hello! Mr Helton here. Fractions are simply parts of a whole!\n\n` +
      `**Key Parts of a Fraction:**\n` +
      `• **Numerator (Top):** How many parts you have.\n` +
      `• **Denominator (Bottom):** Total number of equal parts in the whole.\n\n` +
      `**Golden Rules:**\n` +
      `1. **Addition/Subtraction:** Denominators must be identical (find LCM first).\n` +
      `2. **Multiplication:** Multiply straight across (top × top, bottom × bottom).\n` +
      `3. **Division:** Keep the first, change ÷ to ×, flip the second fraction (reciprocal)!\n\n` +
      `💡 **Mr Helton's Pro-Tip:** Always simplify your final answer to lowest terms using the Highest Common Factor (HCF)!`;
  }

  // 7. General question with correctAnswer provided
  if (correctAnswer && correctAnswer !== 'undefined') {
    return `Well done for giving this problem your best shot! I am Mr Helton, and I am proud of your effort.\n\n` +
      `**Question:** ${qClean}\n` +
      (studentAnswer ? `**Your Answer:** ${studentAnswer}\n` : '') +
      `**Correct Solution:** **${correctAnswer}**\n\n` +
      `**Step-by-Step Method:**\n` +
      `1. Identify the given values and what is being asked.\n` +
      `2. Select the appropriate operation (+, -, ×, ÷) or mathematical formula.\n` +
      `3. Calculate methodically step-by-step and double-check your arithmetic.\n\n` +
      `💡 **Mr Helton's Pro-Tip:** Use your Scratchpad to write out your workings line by line. Every maths champion practices step-by-step!`;
  }

  // 8. General open-ended greeting / question
  return `Hello champion! I am Mr Helton, your Mathematics Coach.\n\n` +
    `Regarding your question: "${qClean}"\n\n` +
    `**How to solve this in Maths (${level}):**\n` +
    `1. Break the problem into clear, simple steps.\n` +
    `2. Write down your numbers, operations, or formulas.\n` +
    `3. Perform your calculation and verify with the reverse check.\n\n` +
    `💡 **Mr Helton's Pro-Tip:** You can ask me to solve specific arithmetic (e.g., **"35 * 18"**), solve equations (e.g., **"3x - 15 = 45"**), or explain percentages (e.g., **"20% of ₦5,000"**)!`;
}

// Fallback question generator with Nigerian context
function generateFallbackQuestion(level: string, topic: string, difficulty: string) {
  const isPrimary = level.toLowerCase().includes('primary');
  const isJSS = level.toLowerCase().includes('jss');

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

  return {
    ...picked,
    difficulty: difficulty || 'Medium',
    level: level
  };
}

// API: Generate questions with Gemini AI or verified fallback
app.post('/api/generate-questions', async (req: Request, res: Response) => {
  const { level = 'Primary 5', topic = 'Money & Naira Maths', difficulty = 'Medium', count = 3, gameMode = 'Maths Adventure' } = req.body;

  const ai = getAIClient();
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
2. Involve relatable Nigerian and African daily life:
   - Currency: Naira (₦) and Kobo
   - Places: Balogun Market Lagos, Ariaria Market Aba, Bodija Market Ibadan, Yankari Game Reserve, Zuma Rock, National Stadium, Lekki Tollgate, Onitsha Main Market.
   - Food/snacks: Puff-puff, chin-chin, jollof rice, suya, akara, plantain chips, roasted corn.
   - Daily activities: Danfo bus fares, Super Eagles football, inter-house sports, market transactions.
3. Provide 4 unique multiple-choice options with exactly ONE correct answer.
4. Provide a friendly hint and a clear step-by-step explanation.

Return ONLY a valid JSON array of question objects.`;

      const response = await withTimeout(
        ai.models.generateContent({
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
        }),
        7000
      );

      const responseText = response.text || '[]';
      const parsed = JSON.parse(responseText);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return res.json({ success: true, questions: parsed, source: 'gemini' });
      }
    } catch (err: any) {
      console.warn('Gemini question generation failed, using verified fallback:', err?.message || err);
    }
  }

  // Fallback generation
  const fallbackList = [];
  for (let i = 0; i < count; i++) {
    fallbackList.push(generateFallbackQuestion(level, topic, difficulty));
  }
  return res.json({ success: true, questions: fallbackList, source: 'fallback' });
});

// API: AI Math Tutor / Ask Mr Helton
app.post('/api/tutor-explain', async (req: Request, res: Response) => {
  const { question, studentAnswer, correctAnswer, level = 'JSS 1', userQuery } = req.body;
  const actualQuestion = userQuery || question || 'How do I solve this maths problem?';

  const ai = getAIClient();
  if (ai) {
    try {
      const prompt = `You are "Mr Helton" (also called Teacher Helton), an encouraging, brilliant Nigerian mathematics coach and teacher on Maths Quest.
A student in ${level} has asked you for help:
Question / Topic: "${actualQuestion}"
${studentAnswer ? `Student's attempted answer: "${studentAnswer}"` : ''}
${correctAnswer && correctAnswer !== 'undefined' ? `Expected correct answer: "${correctAnswer}"` : ''}

Provide a kind, energetic, step-by-step coaching explanation (3-4 paragraphs max):
1. A warm personal greeting from Mr Helton celebrating their curiosity (e.g., "Hello champion! I am Mr Helton, let's solve this together!").
2. Crystal-clear, line-by-line mathematical workings with bolded answers.
3. A memorable "Mr Helton's Pro-Tip" or memory trick for next time.
Keep lines clean, warm, and easy for students to understand.`;

      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt
        }),
        6000
      );

      if (response && response.text) {
        return res.json({ success: true, explanation: response.text, source: 'gemini' });
      }
    } catch (err: any) {
      console.warn('Gemini tutor call timed out or failed, using smart local solver:', err?.message || err);
    }
  }

  // Smart local math solver fallback
  const explanation = solveMathProblemLocally(actualQuestion, studentAnswer, correctAnswer, level);
  return res.json({
    success: true,
    explanation,
    source: 'local-solver'
  });
});

// API: Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    aiEnabled: !!getAIClient(),
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
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    const distIndex = path.join(distPath, 'index.html');
    if (fs.existsSync(distIndex)) {
      app.use(express.static(distPath));
      app.get('*', (req: Request, res: Response, next) => {
        if (req.originalUrl.startsWith('/api')) return next();
        res.sendFile(distIndex);
      });
    } else {
      // Fallback if dist has not been created yet
      app.use(express.static(__dirname));
      app.get('*', (req: Request, res: Response, next) => {
        if (req.originalUrl.startsWith('/api')) return next();
        res.sendFile(path.resolve(__dirname, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Maths Quest server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
