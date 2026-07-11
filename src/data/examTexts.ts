import { ExamType, Difficulty } from "../types";

export interface TypingPassage {
  id: string;
  title: string;
  text: string;
  examType: ExamType;
  difficulty: Difficulty;
}

export const EXAM_PRESETS: { [key in ExamType]: { name: string; duration: number; requiredWPM: number; requiredAccuracy: number; description: string; allowBackspace: boolean; scoringRules: string } } = {
  [ExamType.SSC_CGL]: {
    name: "SSC CGL (Data Entry Skill Test)",
    duration: 900, // 15 mins
    requiredWPM: 27, // 2000 key depressions in 15 mins is approx 27 WPM (5 key depressions = 1 word)
    requiredAccuracy: 95, // 5% error allowed for UR, 7% for others
    description: "The SSC CGL DEST requires typing a formal passage of about 2000 key depressions within 15 minutes. High accuracy is crucial.",
    allowBackspace: true,
    scoringRules: "Errors are classified as Full Errors (omission, substitution) and Half Errors (spelling, capitalization, spacing)."
  },
  [ExamType.SSC_CHSL]: {
    name: "SSC CHSL (Typing Test)",
    duration: 600, // 10 mins
    requiredWPM: 35, // 1750 key depressions in 10 mins
    requiredAccuracy: 93, // 7% error allowed
    description: "The SSC CHSL typing test requires a speed of 35 words per minute (approx. 1750 key depressions) for English in 10 minutes.",
    allowBackspace: true,
    scoringRules: "Calculated based on Net Words per Minute (gross words minus mistakes penalty) in a 10-minute sprint."
  },
  [ExamType.RRB_NTPC]: {
    name: "RRB NTPC (Typing Skill Test)",
    duration: 600, // 10 mins
    requiredWPM: 30,
    requiredAccuracy: 95, // Max 5% mistakes of total words typed are ignored, then 10 words penalty per mistake
    description: "Railways NTPC Typing Skill Test expects a minimum of 30 WPM in English. Backspace is completely disabled in the actual exam!",
    allowBackspace: false,
    scoringRules: "Backspace is disabled. Every uncorrected mistake beyond 5% of total words typed carries a severe 10-word speed penalty."
  },
  [ExamType.BANK_PO]: {
    name: "Bank PO Descriptive Test",
    duration: 1800, // 30 mins
    requiredWPM: 40,
    requiredAccuracy: 97,
    description: "Simulates the descriptive writing section of SBI PO/IBPS PO, which requires typing professional essays and letters quickly and clearly.",
    allowBackspace: true,
    scoringRules: "Evaluated on coherence, vocabulary, speed, and standard spelling/grammatical accuracy."
  },
  [ExamType.CUSTOM]: {
    name: "Custom Training Session",
    duration: 60, // Default 1 min, but customizable
    requiredWPM: 40,
    requiredAccuracy: 95,
    description: "Configure your own timer, difficulty, and text focus. Ideal for rapid skill drills and targeted typing enhancement.",
    allowBackspace: true,
    scoringRules: "Standard typing metric calculation (WPM = (Keystrokes / 5) / minutes, adjusted for accuracy)."
  }
};

export const TYPING_PASSAGES: TypingPassage[] = [
  // --- SSC CGL PASSSAGES ---
  {
    id: "ssc_cgl_1",
    title: "Socio-Economic Development and Technology",
    examType: ExamType.SSC_CGL,
    difficulty: Difficulty.MEDIUM,
    text: "India is witnessing a remarkable transformation in its socio-economic fabric, fueled by the rapid integration of digital technologies in governance. The concept of digital empowerment has transitioned from a theoretical objective to a practical reality, shaping public service delivery. Under various initiatives, the government has digitised crucial land records, tax systems, and educational services, creating transparent pathways for citizens. This digital highway has minimised intermediate steps, reducing delays and structural redundancies. Furthermore, financial inclusion has reached the grassroots level through consolidated biometric identities and mobile banking networks. Rural markets are now connected directly to urban centers, allowing farmers to obtain competitive pricing without exploitation. The expansion of high-speed broadband in remote districts ensures that digital literacy is no longer a privilege of metropolitan areas but a universal tool for growth."
  },
  {
    id: "ssc_cgl_2",
    title: "The Indian Constitution and Federal Structure",
    examType: ExamType.SSC_CGL,
    difficulty: Difficulty.MEDIUM,
    text: "The Constitution of India is the cornerstone of our democratic republic, establishing a robust framework for federalism. It carefully divides legislative and executive authorities between the Union and the States, as outlined in the Seventh Schedule. This distribution of power ensures that local regional aspirations are addressed while maintaining national integrity. The Supreme Court of India acts as the custodian of this constitutional balance, resolving disputes between different tiers of government. Historically, the Indian federal structure has been described as quasi-federal due to its strong unitary features during national emergencies. However, cooperative federalism has gained significant ground in recent decades. The establishment of the Inter-State Council and the Goods and Services Tax Council are stellar examples of collaborative decision-making, where both Center and State governments negotiate economic policy in a spirit of constructive partnership."
  },

  // --- SSC CHSL PASSAGES ---
  {
    id: "ssc_chsl_1",
    title: "Environmental Conservation and Sustainable Goals",
    examType: ExamType.SSC_CHSL,
    difficulty: Difficulty.MEDIUM,
    text: "Sustainable development is the defining challenge of our generation. As industrial output expands to meet consumer demands, the ecological balance of our planet faces unprecedented pressure. Climate change is manifested in shifting monsoon cycles, intensive heatwaves, and rising sea levels across coastal cities. To mitigate these adverse impacts, nations must rapidly transition towards renewable energy resources. Solar and wind power installations have emerged as cost-effective alternatives to fossil fuels. In addition to clean energy, reducing plastic waste is paramount. Cities are implementing strict bans on single-use plastics and promoting circular economy practices where materials are recycled systematically. Collective public participation, combined with rigorous legislative oversight, holds the key to safeguarding natural habitats for future generations."
  },
  {
    id: "ssc_chsl_2",
    title: "The Evolution of Public Education Systems",
    examType: ExamType.SSC_CHSL,
    difficulty: Difficulty.MEDIUM,
    text: "Education is a powerful catalyst for social mobility and economic progress. Historically, formal learning was restricted to specialized academies, but modern governance demands universal, accessible education for every child. Comprehensive literacy campaigns have successfully increased enrollment ratios in primary schools across developing nations. The current focus must shift from basic numerical literacy to high-quality conceptual learning. Integrating critical thinking, vocational training, and scientific experimentation in the secondary curriculum prepares students for a dynamic job market. Additionally, digital classrooms equipped with interactive modules can bridge the gap between urban public schools and remote village academies, ensuring equal cognitive development opportunities for all."
  },

  // --- RRB NTPC PASSAGES (Focus on Trains, Infrastructure, Logistics) ---
  {
    id: "rrb_ntpc_1",
    title: "Indian Railways: Lifeline of the Nation",
    examType: ExamType.RRB_NTPC,
    difficulty: Difficulty.MEDIUM,
    text: "Indian Railways is the backbone of national logistics and passenger transport. Operating one of the largest rail networks in the entire world, it connects remote hamlets to bustling industrial zones. Every single day, thousands of passenger and freight trains traverse the vast subcontinent, transporting millions of travelers and essential commodities. The modernization of railway infrastructure has become a national priority. High-speed corridors, modern signaling systems like Kavach, and station redevelopment schemes are transforming the travel experience. Electrification of tracks is progressing at an unmatched speed, drastically reducing carbon emissions. Maintaining punctual operations, securing absolute passenger safety, and keeping station platforms hygienic require meticulous coordination among thousands of dedicated station masters, traffic controllers, and technical staff."
  },
  {
    id: "rrb_ntpc_2",
    title: "Freight Transport and National Economy",
    examType: ExamType.RRB_NTPC,
    difficulty: Difficulty.MEDIUM,
    text: "Efficient freight transportation is the primary catalyst for economic expansion. Dedicated Freight Corridors have been engineered to separate passenger traffic from cargo trains, ensuring faster transit times for commercial goods. Coal, iron ore, agricultural produce, and petroleum products comprise the bulk of cargo operations. By optimizing container loads and integrating smart tracking systems, the transit costs have decreased substantially. This logistical efficiency directly boosts the competitive advantage of local manufacturers in global trade networks. As railways expand their terminal capacities and introduce modern double-decker cargo lines, the dependency on heavy road haulage will reduce, leading to lower highway congestion and a cleaner environment."
  },

  // --- BANK PO PASSAGES (Focus on Finance, Banking, Economics) ---
  {
    id: "bank_po_1",
    title: "Monetary Policy and Inflation Control",
    examType: ExamType.BANK_PO,
    difficulty: Difficulty.HARD,
    text: "Central banks perform a delicate balancing act when formulating monetary policy to manage inflationary pressures while supporting economic growth. The primary instrument for inflation control is the policy repo rate, which influences the cost of borrowing across commercial banks. When inflation exceeds the target tolerance band, the monetary policy committee typically raises interest rates to suppress aggregate demand. Conversely, during economic slowdowns, rates are lowered to encourage business capital expenditures and consumer spending. In addition to interest rates, central banks utilize reserve ratios and open market operations to regulate liquidity in the banking system. The rise of digital currencies and non-traditional fintech platforms has added a new layer of complexity, demanding proactive regulatory updates to maintain financial stability and protect consumer deposits."
  },
  {
    id: "bank_po_2",
    title: "The Digital Revolution in Commercial Banking",
    examType: ExamType.BANK_PO,
    difficulty: Difficulty.HARD,
    text: "The landscape of retail banking has undergone a paradigm shift, transitioning from physical brick-and-mortar branches to seamless mobile applications. Customer onboarding is now expedited via digital identity verification and electronic signatures, reducing processing overheads. Real-time payments, peer-to-peer transfers, and instant personal loans are standard consumer expectations. Underpinning this revolution are cloud computing frameworks and secure application programming interfaces that connect traditional banks with agile financial technology firms. However, this deep technological integration also exposes financial institutions to sophisticated cybersecurity threats. Safeguarding sensitive transaction details requires multi-factor authentication, robust encryption standards, and continuous monitoring of ledger networks using artificial intelligence algorithms to detect anomalous behavior in real-time."
  },

  // --- CUSTOM PRACTICE POOLS ---
  // EASY: Simple short words, lowercase/easy capitals, no complex punctuation
  {
    id: "custom_easy_1",
    title: "Simple Home Practice",
    examType: ExamType.CUSTOM,
    difficulty: Difficulty.EASY,
    text: "the quick brown fox jumps over the lazy dog. regular typing practice is the best way to improve your speed and accuracy. focus on keeping your fingers in the home row position. try to look at the screen instead of looking down at your hands. small steps every day will build strong muscle memory. before you know it, you will be typing fast and without mistakes. relax your shoulders and keep a steady pace."
  },
  {
    id: "custom_easy_2",
    title: "Keyboard Finger Flow",
    examType: ExamType.CUSTOM,
    difficulty: Difficulty.EASY,
    text: "good typing starts with good posture. sit up straight with your feet flat on the floor. rest your wrists lightly on the desk. use all ten fingers to type each key. each finger has a specific set of letters to press. practice typing common words like their, there, about, would, and great. when you make a mistake, do not worry. just keep moving and maintain your rhythm."
  },

  // MEDIUM: Mixed cases, commas, periods, standard length words
  {
    id: "custom_med_1",
    title: "The Art of Writing",
    examType: ExamType.CUSTOM,
    difficulty: Difficulty.MEDIUM,
    text: "Writing, much like typing, is a skill developed through consistent repetition and patience. In the early days, typing was done on mechanical typewriters, which required significant finger force and lacked any backspace capability. Today, responsive mechanical keyboards and soft laptop membranes make fast keystrokes effortless. However, the fundamental challenge remains: maintaining perfect mental clarity while translating ideas into digital text. To excel, you must sync your breathing with your typing movements, establishing a calm, steady flow."
  },

  // HARD: Heavy punctuation, numbers, tricky symbols, capitalizations
  {
    id: "custom_hard_1",
    title: "Financial Audit Report 2026",
    examType: ExamType.CUSTOM,
    difficulty: Difficulty.HARD,
    text: "The financial audit of Q4-2025 revealed an unexpected 12.8% surge in operating expenses (exceeding $4,500,000). Tax compliance regulations (under Section 80C & Section 10-A) demand that we reconcile all ledger accounts before 03/31/2026. The key ratios are: Debt-to-Equity = 1.45; Current Ratio = 2.10; and Net Margin = 8.75%. To optimize efficiency, the board proposed: (a) automating billing via secure APIs; (b) lowering interest expenses on the $1.5M short-term loan; and (c) cutting overheads by exactly 15%. Direct inquiries should be sent to admin_support@domain.org or faxed to +91-44-2394-8811."
  },
  {
    id: "custom_hard_2",
    title: "Software Syntax and Code Logic",
    examType: ExamType.CUSTOM,
    difficulty: Difficulty.HARD,
    text: "When implementing modern web apps, developers use constructs like const apiURL = 'https://api.v2.domain.io/users?limit=50'; to query backend models. If the server response status is !== 200, we catch errors using try { ... } catch (err) { console.error('[Error]:', err.message); }. Speed optimization involves debouncing resize events (approx. 250ms) and caching local queries in localStorage.getItem('user_session_id_2026'). Make sure to validate all inputs with regular expressions like /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,4}$/i before committing!"
  }
];

export function getPassagesForConfig(examType: ExamType, difficulty: Difficulty): TypingPassage[] {
  let filtered = TYPING_PASSAGES.filter(p => p.examType === examType);
  if (filtered.length === 0) {
    // Fallback to matching difficulty in custom/any pool
    filtered = TYPING_PASSAGES.filter(p => p.difficulty === difficulty);
  }
  if (filtered.length === 0) {
    filtered = TYPING_PASSAGES;
  }
  return filtered;
}

export function getRandomPassage(examType: ExamType, difficulty: Difficulty): TypingPassage {
  const passages = getPassagesForConfig(examType, difficulty);
  const randomIndex = Math.floor(Math.random() * passages.length);
  return passages[randomIndex];
}
