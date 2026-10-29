import { SchoolLevel, MathTopic, AdventureStage, Badge, Question } from '../types';

export const SCHOOL_LEVELS: { id: SchoolLevel; group: string; label: string; ageRange: string }[] = [
  { id: 'Primary 1', group: 'Lower Primary', label: 'Primary 1', ageRange: '5 - 6 years' },
  { id: 'Primary 2', group: 'Lower Primary', label: 'Primary 2', ageRange: '6 - 7 years' },
  { id: 'Primary 3', group: 'Lower Primary', label: 'Primary 3', ageRange: '7 - 8 years' },
  { id: 'Primary 4', group: 'Upper Primary', label: 'Primary 4', ageRange: '8 - 9 years' },
  { id: 'Primary 5', group: 'Upper Primary', label: 'Primary 5', ageRange: '9 - 10 years' },
  { id: 'Primary 6', group: 'Upper Primary', label: 'Primary 6', ageRange: '10 - 11 years' },
  { id: 'JSS 1', group: 'Junior Secondary', label: 'JSS 1 (Basic 7)', ageRange: '11 - 12 years' },
  { id: 'JSS 2', group: 'Junior Secondary', label: 'JSS 2 (Basic 8)', ageRange: '12 - 13 years' },
  { id: 'JSS 3', group: 'Junior Secondary', label: 'JSS 3 (Basic 9)', ageRange: '13 - 14 years' },
  { id: 'SS 1', group: 'Senior Secondary', label: 'SS 1', ageRange: '14 - 15 years' },
  { id: 'SS 2', group: 'Senior Secondary', label: 'SS 2', ageRange: '15 - 16 years' },
  { id: 'SS 3', group: 'Senior Secondary', label: 'SS 3 (WAEC/JAMB)', ageRange: '16+ years' }
];

export const MATH_TOPICS: { id: MathTopic; icon: string; description: string }[] = [
  { id: 'Numbers & Counting', icon: '🔢', description: 'Place values, Roman numerals, even/odd, and prime numbers' },
  { id: 'Addition & Subtraction', icon: '➕', description: 'Mental math, multi-digit operations, and carrying over' },
  { id: 'Multiplication & Division', icon: '✖️', description: 'Times tables, long division, factors, and multiples' },
  { id: 'Fractions, Decimals & %', icon: '🍕', description: 'Equivalent fractions, mixed numbers, percentages, and decimals' },
  { id: 'Money & Naira Maths', icon: '₦', description: 'Naira & Kobo (₦), buying, selling, change, and budget math' },
  { id: 'Word Problems', icon: '📖', description: 'Relatable Nigerian real-world stories, markets, and travel' },
  { id: 'Algebra & Equations', icon: '🔤', description: 'Linear equations, indices, polynomials, and expressions' },
  { id: 'Geometry & Shapes', icon: '📐', description: '2D/3D shapes, angles, triangles, polygons, and symmetry' },
  { id: 'Perimeter, Area & Volume', icon: '📏', description: 'Fields, rooms, cylindrical tanks, and composite shapes' },
  { id: 'Statistics & Probability', icon: '📊', description: 'Mean, median, mode, pie charts, and dice/coins probability' },
  { id: 'Business Maths', icon: '💼', description: 'Profit & loss, simple interest, discount, tax, and commissions' }
];

export const ADVENTURE_STAGES: AdventureStage[] = [
  {
    id: 1,
    name: "Mona's Addition Island",
    landmark: 'Fruit Counting Shores',
    city: 'Mona Adventure Bay',
    topic: 'Addition & Subtraction',
    description: 'Help Mona the Maths Hero collect golden pineapples, mangos, and star coconuts along the sunny shores!',
    bgGradient: 'from-emerald-600 via-teal-600 to-cyan-700',
    bossName: 'Captain Crab Numbers',
    bossAvatar: '🦀',
    bossHp: 80
  },
  {
    id: 2,
    name: 'Balogun Market Hustle',
    landmark: 'Balogun Market',
    city: 'Lagos Island, Lagos',
    topic: 'Money & Naira Maths',
    description: 'Join Mona and Mama Nkechi to tally fabric sales, calculate change in Naira, and master market bargaining!',
    bgGradient: 'from-amber-600 via-orange-600 to-red-700',
    bossName: 'The Shrewd Trader',
    bossAvatar: '👨🏾‍💼',
    bossHp: 100
  },
  {
    id: 3,
    name: 'Subtraction Enchanted Forest',
    landmark: 'Whispering Canopy',
    city: 'Mona Woodland Realm',
    topic: 'Addition & Subtraction',
    description: 'Rescue baby animals trapped behind tricky subtraction gates with Professor Owl by your side!',
    bgGradient: 'from-green-700 via-emerald-800 to-teal-900',
    bossName: 'The Forest Riddle Owl',
    bossAvatar: '🦉',
    bossHp: 110
  },
  {
    id: 4,
    name: 'Olumo Rock Ascent',
    landmark: 'Olumo Rock',
    city: 'Abeokuta, Ogun State',
    topic: 'Numbers & Counting',
    description: 'Climb the ancient 137-meter granite fortress by calculating the steps, altitudes, and time gaps before sunset!',
    bgGradient: 'from-amber-700 via-yellow-700 to-orange-800',
    bossName: 'The Granite Golem',
    bossAvatar: '🗿',
    bossHp: 120
  },
  {
    id: 5,
    name: 'Multiplication Mountain',
    landmark: 'Snowy Peak of Times Tables',
    city: 'Mona Highlands',
    topic: 'Multiplication & Division',
    description: 'Scale the steep icy summit by mastering the 2-12 multiplication tables and boulder jumps!',
    bgGradient: 'from-indigo-700 via-blue-700 to-purple-800',
    bossName: 'The Peak Boulder Bot',
    bossAvatar: '🤖',
    bossHp: 140
  },
  {
    id: 6,
    name: 'National Stadium Cup Final',
    landmark: 'National Stadium Surulere',
    city: 'Lagos',
    topic: 'Multiplication & Division',
    description: 'Score the winning goal by calculating stadium ticket sales, formation angles, and Super Eagles match stats!',
    bgGradient: 'from-blue-700 via-indigo-700 to-purple-800',
    bossName: 'The Iron Goalkeeper',
    bossAvatar: '🧤',
    bossHp: 150
  },
  {
    id: 7,
    name: 'Division Magic Castle',
    landmark: 'Tower of Equal Shares',
    city: 'Mona Royal Citadel',
    topic: 'Multiplication & Division',
    description: 'Unlock the secret royal treasury by dividing royal jewels and fair portions among the citizens!',
    bgGradient: 'from-purple-700 via-fuchsia-800 to-pink-900',
    bossName: 'The Royal Chancellor',
    bossAvatar: '🧙🏾‍♂️',
    bossHp: 160
  },
  {
    id: 8,
    name: 'Mystery of Zuma Rock',
    landmark: 'Zuma Rock Monolith',
    city: 'Niger State / Abuja Border',
    topic: 'Algebra & Equations',
    description: 'Decode the secret symbols etched on the monolith by solving for x and balancing the ancient equation scales!',
    bgGradient: 'from-purple-800 via-violet-900 to-slate-900',
    bossName: 'The Algebraic Sphinx',
    bossAvatar: '🦅',
    bossHp: 170
  },
  {
    id: 9,
    name: 'Fraction & Percentage Fair',
    landmark: 'Carnival of Math Wonders',
    city: 'Mona Festival Park',
    topic: 'Fractions, Decimals & %',
    description: 'Slice giant pizzas, discount toy stalls, and recharge solar batteries with fraction accuracy!',
    bgGradient: 'from-rose-600 via-pink-700 to-amber-700',
    bossName: 'Professor Fraction',
    bossAvatar: '🎪',
    bossHp: 180
  },
  {
    id: 10,
    name: 'River Niger Bridge Crossing',
    landmark: 'Niger River Bridge',
    city: 'Onitsha, Anambra State',
    topic: 'Statistics & Probability',
    description: 'Navigate the busy trade corridor connecting eastern and western commerce with speed and probability math!',
    bgGradient: 'from-rose-700 via-red-800 to-neutral-900',
    bossName: 'The Matrix Overlord',
    bossAvatar: '👑',
    bossHp: 200
  }
];

export const BADGES: Badge[] = [
  {
    id: 'first_win',
    title: 'First Step to Greatness',
    description: 'Completed your very first Maths Quest game mode!',
    icon: '🌟',
    category: 'general'
  },
  {
    id: 'speed_demon',
    title: 'Naira Speedster',
    description: 'Answered 10+ questions correctly in a single Speed Challenge!',
    icon: '⚡',
    category: 'speed'
  },
  {
    id: 'combo_fire',
    title: '5x Fire Combo',
    description: 'Reached a blazing 5x combo streak without a single mistake!',
    icon: '🔥',
    category: 'speed'
  },
  {
    id: 'market_master',
    title: 'Balogun Market Wizard',
    description: 'Conquered Stage 1 in Maths Adventure with 3 perfect stars!',
    icon: '💰',
    category: 'adventure'
  },
  {
    id: 'swish_king',
    title: 'Basketball MVP',
    description: 'Scored 5 consecutive hoops in Maths Basketball shootout!',
    icon: '🏀',
    category: 'general'
  },
  {
    id: 'ninja_slasher',
    title: 'Master Number Ninja',
    description: 'Sliced 15 correct targets without striking a single bomb!',
    icon: '⚔️',
    category: 'ninja'
  },
  {
    id: 'classroom_escape',
    title: 'Great Classroom Escaper',
    description: 'Unlocked all 4 digital locks and escaped before the school bell!',
    icon: '🔓',
    category: 'escape'
  },
  {
    id: 'boss_slayer',
    title: 'Titan Defeater',
    description: 'Vanquished an almighty Boss Monster in Boss Battle!',
    icon: '🐉',
    category: 'boss'
  },
  {
    id: 'streak_star',
    title: 'Dedicated Scholar',
    description: 'Maintained a 3-day continuous daily quest streak!',
    icon: '📅',
    category: 'general'
  },
  {
    id: 'custom_creator',
    title: 'Master Game Architect',
    description: 'Created and saved your own custom mathematics game!',
    icon: '🛠️',
    category: 'general'
  }
];

export const AVATARS = [
  { id: 'mona_hero', emoji: '👧🏾', name: 'Mona the Maths Hero', cost: 0 },
  { id: 'scholar_boy', emoji: '🧑🏾‍🎓', name: 'Eagle Scholar', cost: 0 },
  { id: 'scholar_girl', emoji: '👩🏾‍🎓', name: 'Queen Mathematician', cost: 0 },
  { id: 'prof_owl', emoji: '🦉', name: 'Professor Owl', cost: 100 },
  { id: 'robo_bot', emoji: '🤖', name: 'Robo-Mathbot', cost: 120 },
  { id: 'ninja_math', emoji: '🥷🏾', name: 'Calcu-Ninja', cost: 150 },
  { id: 'football_star', emoji: '⚽', name: 'Super Eagle 10', cost: 200 },
  { id: 'wizard', emoji: '🧙🏾‍♂️', name: 'Naira Sorcerer', cost: 300 },
  { id: 'astro', emoji: '👨🏾‍🚀', name: 'Galaxy Pilot', cost: 400 },
  { id: 'crown_ruler', emoji: '👑', name: 'Imperial Chancellor', cost: 500 }
];

export const FALLBACK_QUESTIONS: Question[] = [
  // Primary Level
  {
    question: "Kola had ₦200. He bought a bottle of cold malt for ₦120. How much change does he get?",
    options: ["₦60", "₦70", "₦80", "₦90"],
    correctAnswer: "₦80",
    explanation: "Subtract the cost from Kola's total: ₦200 - ₦120 = ₦80 change.",
    hint: "Subtract 120 from 200.",
    topic: "Money & Naira Maths",
    level: "Primary 3",
    difficulty: "Easy"
  },
  {
    question: "Tolu buys 3 packs of puff-puff. Each pack contains 6 pieces. How many puff-puffs does Tolu have?",
    options: ["12", "15", "18", "21"],
    correctAnswer: "18",
    explanation: "Multiply the number of packs by the pieces per pack: 3 × 6 = 18 puff-puffs.",
    hint: "3 multiplied by 6.",
    topic: "Multiplication & Division",
    level: "Primary 3",
    difficulty: "Easy"
  },
  {
    question: "What is 3/4 of ₦400?",
    options: ["₦100", "₦200", "₦300", "₦350"],
    correctAnswer: "₦300",
    explanation: "1/4 of 400 is 100. Then 3 × 100 = ₦300.",
    hint: "Divide 400 by 4, then multiply by 3.",
    topic: "Fractions, Decimals & %",
    level: "Primary 5",
    difficulty: "Medium"
  },
  {
    question: "A Danfo bus leaves Yaba with 12 passengers. At Maryland, 5 passengers get off and 7 new passengers board. How many passengers are now in the bus?",
    options: ["10", "12", "14", "16"],
    correctAnswer: "14",
    explanation: "Start with 12. 12 - 5 = 7 passengers remaining. Then 7 + 7 = 14 passengers.",
    hint: "12 minus 5, then add 7.",
    topic: "Word Problems",
    level: "Primary 4",
    difficulty: "Easy"
  },
  {
    question: "What is the Roman numeral for 45?",
    options: ["XXXXV", "XLV", "LV", "LX"],
    correctAnswer: "XLV",
    explanation: "XL represents 40 (50 - 10) and V represents 5. Together, XLV is 45.",
    hint: "40 is 10 before 50 (XL), then add 5 (V).",
    topic: "Numbers & Counting",
    level: "Primary 5",
    difficulty: "Medium"
  },
  // JSS Level
  {
    question: "Solve for y in the linear equation: 4y + 8 = 32",
    options: ["y = 4", "y = 6", "y = 8", "y = 10"],
    correctAnswer: "y = 6",
    explanation: "Subtract 8 from both sides: 4y = 24. Divide both sides by 4: y = 24 / 4 = 6.",
    hint: "Subtract 8 first, then divide by 4.",
    topic: "Algebra & Equations",
    level: "JSS 1",
    difficulty: "Medium"
  },
  {
    question: "A classroom rectangular whiteboard in Unity High School measures 3 meters by 2 meters. What is its perimeter?",
    options: ["5m", "6m²", "10m", "12m"],
    correctAnswer: "10m",
    explanation: "Perimeter = 2 × (Length + Width) = 2 × (3 + 2) = 2 × 5 = 10 meters.",
    hint: "Add length and width together, then double the sum.",
    topic: "Perimeter, Area & Volume",
    level: "JSS 1",
    difficulty: "Easy"
  },
  {
    question: "A trader sells a school bag for ₦6,000, making a profit of ₦1,200. What was the cost price of the bag?",
    options: ["₦4,500", "₦4,800", "₦5,000", "₦7,200"],
    correctAnswer: "₦4,800",
    explanation: "Cost Price = Selling Price - Profit = ₦6,000 - ₦1,200 = ₦4,800.",
    hint: "Cost Price = Selling Price minus Profit.",
    topic: "Business Maths",
    level: "JSS 2",
    difficulty: "Medium"
  },
  {
    question: "What is the sum of angles inside any triangle?",
    options: ["90°", "180°", "270°", "360°"],
    correctAnswer: "180°",
    explanation: "The interior angles of any planar Euclidean triangle always sum up to exactly 180 degrees.",
    hint: "A straight line angle is 180°.",
    topic: "Geometry & Shapes",
    level: "JSS 2",
    difficulty: "Easy"
  },
  {
    question: "Find the median of the following test scores: 12, 15, 17, 20, 25, 29, 31",
    options: ["17", "20", "21", "25"],
    correctAnswer: "20",
    explanation: "The 7 numbers are already sorted in ascending order. The middle (4th) number is 20.",
    hint: "Since there are 7 numbers, find the middle (4th) value.",
    topic: "Statistics & Probability",
    level: "JSS 3",
    difficulty: "Easy"
  },
  // SS Level
  {
    question: "Solve the quadratic equation: x² - 5x + 6 = 0",
    options: ["x = 1 or 6", "x = 2 or 3", "x = -2 or -3", "x = 3 or 4"],
    correctAnswer: "x = 2 or 3",
    explanation: "Factorise: (x - 2)(x - 3) = 0. Therefore, x = 2 or x = 3.",
    hint: "Find two numbers whose product is 6 and sum is -5: they are -2 and -3.",
    topic: "Algebra & Equations",
    level: "SS 1",
    difficulty: "Medium"
  },
  {
    question: "Calculate the simple interest on a loan of ₦50,000 borrowed for 3 years at an annual interest rate of 8%.",
    options: ["₦8,000", "₦10,000", "₦12,000", "₦15,000"],
    correctAnswer: "₦12,000",
    explanation: "Simple Interest = (Principal × Rate × Time) / 100 = (50,000 × 8 × 3) / 100 = ₦12,000.",
    hint: "Formula is (P × R × T) / 100.",
    topic: "Business Maths",
    level: "SS 1",
    difficulty: "Medium"
  },
  {
    question: "If sin(θ) = 3/5 in a right-angled triangle, what is the value of cos(θ)?",
    options: ["4/5", "3/4", "5/4", "1/2"],
    correctAnswer: "4/5",
    explanation: "In a 3-4-5 right triangle, opposite = 3, hypotenuse = 5, adjacent = √(5² - 3²) = 4. Therefore cos(θ) = adjacent/hypotenuse = 4/5.",
    hint: "Use Pythagoras theorem: 3² + 4² = 5².",
    topic: "Geometry & Shapes",
    level: "SS 2",
    difficulty: "Hard"
  },
  {
    question: "A bag contains 5 green marbles, 3 white marbles, and 2 orange marbles (representing the Nigerian flag colours). What is the probability of picking a white marble?",
    options: ["1/10", "3/10", "1/2", "3/7"],
    correctAnswer: "3/10",
    explanation: "Total marbles = 5 + 3 + 2 = 10. Number of white marbles = 3. Probability = 3/10 (30%).",
    hint: "White marbles (3) divided by total marbles (10).",
    topic: "Statistics & Probability",
    level: "SS 2",
    difficulty: "Easy"
  }
];
