// Verbatim from the current dronacourses.com homepage. Not written by the director; signed as on the original.
export const directorMessage = {
  title: "A letter to every aspirant",
  body: `Dear Aspiring Student,

As someone who has walked through some of life’s darkest and most uncertain days, I want to tell you something simple, but powerful: you are stronger than you think.

I am a survivor of liver cirrhosis—a battle that taught me more about life, resilience, and hope than any textbook ever could. There were days when getting out of bed felt impossible, when the future seemed too far away. But I kept going. Not because I always felt strong, but because I refused to give up.

You’re at the beginning of your own journey, and I want you to know that every effort you make, no matter how small, matters. Every late-night study session, every challenge you push through—it’s all building your future.

“Hardships often prepare ordinary people for an extraordinary destiny.”

Don’t take your opportunities for granted. Make the most of your time, invest in your mind, and be kind to yourself through the ups and downs. If I can rise from the depths of illness, you can rise to your dreams.

Believe in yourself. Keep moving forward. And when you succeed—and you will—carry your story with pride. It’s what makes you you.

With hope and strength,`,
  name: "A Survivor",
};

// Director profile. Photo is from the current site; name and story to be supplied by the client.
export const director = {
  name: "Major Gaurav [full name – confirm]",
  role: "Director, Drona",
  photo: "/brand/director.jpg",
  story: "[Major Gaurav’s story – to be added by the client]",
};

// Services exactly as listed on the current dronacourses.com homepage.
// Descriptions reuse the current site's own copy; the rest have none until the client supplies them.
export const services = [
  { title: "Test Series", text: "An extensive collection of test series covering the top exams of India, including NDA, CDS and AFCAT.", href: "/exams", icon: "ClipboardCheck", featured: true },
  { title: "Video Courses", text: "Video lessons for engaging and lucid learning.", href: "/e-library", icon: "Monitor", featured: true },
  { title: "E-Books", text: "Latest editions in the Drona E-Library.", href: "/e-library", icon: "BookOpen", featured: true },
  { title: "Mentorship", text: "Best-in-class guidance at Drona.", href: "/contact", icon: "Compass", featured: true },
  { title: "Notes", href: "/e-library", icon: "FileText" },
  { title: "Books", href: "/e-library", icon: "Library" },
  { title: "Mock Interviews", href: "/contact", icon: "Users" },
  { title: "Doubt Solving", href: "/contact", icon: "Brain" },
  { title: "Career Planning", href: "/contact", icon: "Target" },
  { title: "CBSE Competition", href: "/contact", icon: "Trophy" },
];

// E-Library collections as listed on the current site (ecatalog groups + E-Library page).
export const elibraryCollections = [
  "CDS AFCAT Books",
  "NDA Foundation Books",
  "CUET",
  "UPSC",
  "Quantitative Analysis & Reasoning",
  "उत्तराखंड सामान्य ज्ञान",
  "Daily Updates",
  "Daily Assignment",
  "Monthly Magazines",
];

export const blogPosts: {
  title: string;
  slug: string;
  type: "BLOG" | "CURRENT_AFFAIRS";
  category: string;
  body: string;
  author: string;
  tags: string[];
  readMinutes: number;
  excerpt: string;
}[] = [
  {
    title: "AFCAT 2026: Complete Preparation Strategy",
    slug: "afcat-2026-complete-preparation-strategy",
    type: "BLOG",
    category: "Defence Exams",
    author: "Drona Editorial Team",
    tags: ["AFCAT", "Strategy", "Indian Air Force"],
    readMinutes: 6,
    excerpt: "A section-by-section plan for AFCAT 2026, with a 12-week timetable and how to use mock tests to cross the cut-off with a margin.",
    body: `<p>AFCAT rewards accuracy more than speed. With +3 for a right answer and −1 for a wrong one, a candidate who attempts 75 questions with 90% accuracy will usually outscore one who attempts all 100 at 70%. Your strategy should start from that fact.</p>
<h2>Know the paper</h2>
<p>The online test has 100 questions for 300 marks in two hours, spread across General Awareness, Verbal Ability in English, Numerical Ability, and Reasoning &amp; Military Aptitude. Technical branch candidates also take the 45-minute Engineering Knowledge Test. Recent cut-offs have sat between 150 and 170, so target a steady 180 or more in your mocks.</p>
<h2>A 12-week plan</h2>
<ul>
<li><strong>Weeks 1–4: foundations.</strong> Revise arithmetic basics (percentage, ratio, time and work, speed and distance), grammar rules and one static GK subject per week.</li>
<li><strong>Weeks 5–8: topic-wise tests.</strong> Take two topic tests a day and keep an error notebook. Write down why you got each question wrong, not just the right answer.</li>
<li><strong>Weeks 9–12: full mocks.</strong> Take three full-length mocks a week under exam conditions, and spend as long analysing each mock as you spent writing it.</li>
</ul>
<h2>Section tips</h2>
<p><strong>English</strong> is the highest-scoring section for most candidates. Read one editorial daily and learn ten new words with their usage. <strong>Numerical Ability</strong> questions are short; learn squares up to 30 and common fraction–percentage conversions so you never need long calculations. <strong>Military Aptitude</strong> questions on spatial ability, such as hidden figures and pattern completion, improve quickly with practice, so do twenty every day for a month. For <strong>General Awareness</strong>, focus on defence news, awards, sports and static GK; avoid chasing obscure facts.</p>
<h2>Using mock tests well</h2>
<p>A mock test is only useful if you study the result. After each mock, sort your mistakes into three groups: concept gaps, silly errors and guesses. Concept gaps go back to topic-wise practice, silly errors need slower reading, and guesses tell you where to stop attempting. Re-attempt the same mock after a week and check that the same mistakes do not return.</p>
<h2>On exam day</h2>
<p>Begin with English and General Awareness to bank quick marks, then move to Reasoning and Numerical Ability. Skip any question that takes more than 90 seconds and mark it to come back to. Do not guess blindly; with negative marking, an educated guess between two options is fine, a wild guess is not.</p>
<p>Prepare steadily, analyse honestly and keep your fitness routine alongside your studies. The AFSB interview follows soon after the result, and the habits you build now will carry you through it.</p>`,
  },
  {
    title: "NDA Maths: 10 High-Weightage Topics",
    slug: "nda-maths-10-high-weightage-topics",
    type: "BLOG",
    category: "Defence Exams",
    author: "Drona Maths Faculty",
    tags: ["NDA", "Mathematics", "UPSC"],
    readMinutes: 5,
    excerpt: "Mathematics carries 300 marks in NDA and decides most selections. These ten topics consistently account for the bulk of the paper.",
    body: `<p>The NDA Mathematics paper has 120 questions for 300 marks in two and a half hours, with one-third negative marking. Most aspirants cannot finish every question, so the smart approach is to master the topics that appear every year and attempt them with full confidence.</p>
<h2>The ten topics</h2>
<ul>
<li><strong>Trigonometry:</strong> identities, heights and distances, inverse functions. Usually the single largest block of questions.</li>
<li><strong>Matrices and determinants:</strong> properties, adjoint, inverse and solving linear equations.</li>
<li><strong>Calculus – limits and continuity:</strong> standard limits and L'Hôpital-style reasoning.</li>
<li><strong>Differentiation:</strong> chain rule, implicit functions, maxima and minima.</li>
<li><strong>Integration:</strong> standard forms, definite integrals, area under curves.</li>
<li><strong>Differential equations:</strong> order, degree, variable separable forms.</li>
<li><strong>Sets, relations and functions:</strong> quick-scoring questions if you know the definitions.</li>
<li><strong>Complex numbers and quadratic equations:</strong> modulus, argument, cube roots of unity, nature of roots.</li>
<li><strong>Probability and statistics:</strong> mean, median, variance, conditional probability.</li>
<li><strong>Vectors and 3D geometry:</strong> dot and cross products, direction cosines, equations of lines and planes.</li>
</ul>
<h2>How to study them</h2>
<p>Pick one topic every four days. Spend the first two days on concepts and solved examples from your NCERT Class 11 and 12 books, the third day on previous year NDA questions for that topic, and the fourth on a timed topic-wise test. By the end of six weeks you will have covered all ten.</p>
<h2>Speed matters</h2>
<p>With about 75 seconds per question, there is no time to derive formulas in the exam. Keep a single formula sheet and revise it every morning. For trigonometry, learn the values at standard angles and the common identities so well that you can apply them without writing them down.</p>
<h2>Attempt strategy</h2>
<p>Aim to attempt 80 to 90 questions with high accuracy rather than all 120. First go through the paper and solve every question you are sure of. In the second round, try those where you can eliminate two options. Leave the rest. A consistent score of 150 or more in Maths, combined with a solid GAT, puts you in a strong position for the SSB.</p>
<p>Finally, write full-length mocks on the same days of the week as the real exam, at the same time. Your mind and body will be used to the routine by the time you walk into the centre.</p>`,
  },
  {
    title: "Daily Current Affairs – Defence",
    slug: "daily-current-affairs-defence",
    type: "CURRENT_AFFAIRS",
    category: "Defence",
    author: "Drona Current Affairs Desk",
    tags: ["Current Affairs", "Defence", "Sample Digest"],
    readMinutes: 4,
    excerpt: "Sample digest: the kind of defence news summary Drona publishes daily, with exam-relevant facts highlighted for quick revision.",
    body: `<p><em>This is a sample digest showing the format of Drona's daily defence current affairs. Live digests are published every morning with the day's verified news.</em></p>
<h2>Joint exercises</h2>
<p>India regularly holds bilateral and multilateral exercises with friendly nations. Exam questions usually ask for the exercise name, the partner country and the service involved. Examples to revise include Yudh Abhyas (Army, with the United States), Malabar (naval, with the US, Japan and Australia), Garuda (Air Force, with France) and Mitra Shakti (Army, with Sri Lanka).</p>
<h2>Indigenous platforms</h2>
<ul>
<li><strong>LCA Tejas:</strong> a light combat aircraft designed by ADA and built by HAL.</li>
<li><strong>INS Vikrant:</strong> India's first indigenous aircraft carrier, built at Cochin Shipyard and commissioned in 2022.</li>
<li><strong>Arjun MBT:</strong> a main battle tank developed by DRDO's CVRDE.</li>
<li><strong>Akash:</strong> a surface-to-air missile system developed by DRDO.</li>
</ul>
<h2>Important days</h2>
<p>Army Day falls on 15 January, Air Force Day on 8 October, Navy Day on 4 December and Armed Forces Flag Day on 7 December. Kargil Vijay Diwas is marked on 26 July and Vijay Diwas on 16 December.</p>
<h2>Quick revision questions</h2>
<ul>
<li>Which company builds the LCA Tejas? <strong>Hindustan Aeronautics Limited</strong></li>
<li>Exercise Garuda is held between India and which country? <strong>France</strong></li>
<li>On which date is Armed Forces Flag Day observed? <strong>7 December</strong></li>
</ul>
<p>Practise these facts in Drona's daily defence quiz. The questions are drawn from the same digest, so you can test yourself right after reading.</p>
<h2>How to use this digest</h2>
<p>Read the digest each morning in under ten minutes. Note only the facts that answer a who, what, where or when question, and revise your notes at the end of the week. Before AFCAT, CDS and NDA, the last six months of defence news is the most important window, so keep a monthly summary page that you can revise in one sitting.</p>`,
  },
  {
    title: "SSB Interview: 7 Tips from Recommended Candidates",
    slug: "ssb-interview-tips-from-recommended-candidates",
    type: "BLOG",
    category: "SSB Interview",
    author: "Drona Editorial Team",
    tags: ["SSB", "Interview", "Officer Like Qualities"],
    readMinutes: 5,
    excerpt: "Clearing the written exam is half the journey. These seven habits come up again and again when recommended candidates describe their SSB.",
    body: `<p>The Services Selection Board looks for Officer Like Qualities, not rehearsed answers. Over five days, psychologists, Group Testing Officers and the interviewing officer each assess you independently. Their reports must agree, which is why consistency matters more than any single performance.</p>
<h2>1. Know your own story</h2>
<p>Most interview questions come from your Personal Information Questionnaire. Be ready to talk honestly about your family, studies, hobbies, friends and failures. If you mention a hobby, expect detailed questions on it.</p>
<h2>2. Write naturally in psychology tests</h2>
<p>In the Thematic Apperception Test, Word Association Test and Situation Reaction Test, write what you would genuinely think and do. Memorised positive sentences are easy for assessors to spot and often contradict your other responses.</p>
<h2>3. Speak early but listen more</h2>
<p>In the Group Discussion, make a clear point within the first few minutes, then build on others' ideas. Interrupting or shouting is noticed for the wrong reasons.</p>
<h2>4. Help the group in outdoor tasks</h2>
<p>In the Progressive Group Task and Command Task, the officer watches how you work with others. Suggest ideas, carry the load and support a better plan even if it is not yours.</p>
<h2>5. Stay physically fit</h2>
<p>The individual obstacles and snake race need stamina. Running 3 to 5 km daily and basic strength training in the months before your SSB make a visible difference.</p>
<h2>6. Read the newspaper daily</h2>
<p>Expect questions on current national and international events, especially defence and your home state. Have a balanced opinion on major issues and be ready to explain it.</p>
<h2>7. Be the same person all five days</h2>
<p>Assessors compare notes. The candidate who is calm, honest and cooperative on every day stands out far more than one who tries to impress in a single test.</p>
<p>The OIR test on day one is a screening step, so keep practising verbal and non-verbal reasoning with timed tests until the day you report.</p>`,
  },
  {
    title: "Weekly Current Affairs – National & Economy",
    slug: "weekly-current-affairs-national-economy",
    type: "CURRENT_AFFAIRS",
    category: "National & Economy",
    author: "Drona Current Affairs Desk",
    tags: ["Current Affairs", "Economy", "Polity", "Sample Digest"],
    readMinutes: 4,
    excerpt: "Sample weekly digest covering the polity and economy concepts that appear most often in SSC, CDS and state police papers.",
    body: `<p><em>This is a sample weekly digest. It shows the format and the kind of concepts Drona covers each week; live editions carry the week's verified news.</em></p>
<h2>Polity essentials</h2>
<ul>
<li><strong>Fundamental Rights</strong> are in Part III (Articles 12–35). Article 32, the right to constitutional remedies, was called the "heart and soul" of the Constitution by Dr B. R. Ambedkar.</li>
<li><strong>Directive Principles</strong> are in Part IV (Articles 36–51) and are not enforceable by courts.</li>
<li><strong>Fundamental Duties</strong> were added by the 42nd Amendment in 1976 and are listed in Article 51A.</li>
<li>The <strong>President</strong> is elected by an electoral college of elected MPs and elected MLAs of states and Union Territories with legislatures.</li>
</ul>
<h2>Economy concepts</h2>
<ul>
<li>The <strong>repo rate</strong> is the rate at which the RBI lends to commercial banks; a cut usually makes loans cheaper.</li>
<li>The <strong>Monetary Policy Committee</strong> has six members and sets the policy rate, with an inflation target of 4% (±2%).</li>
<li><strong>GST</strong> was introduced on 1 July 2017 through the 101st Constitutional Amendment.</li>
<li><strong>NITI Aayog</strong> replaced the Planning Commission on 1 January 2015.</li>
</ul>
<h2>Schemes to revise</h2>
<p>Questions frequently ask about the ministry responsible, the launch year and the target group of major schemes. Keep a table of schemes such as PM Jan Dhan Yojana (financial inclusion, 2014), Ayushman Bharat (health cover, 2018) and Agnipath (armed forces recruitment, 2022).</p>
<h2>Quick revision questions</h2>
<ul>
<li>Which Article contains the Fundamental Duties? <strong>Article 51A</strong></li>
<li>What is the RBI's inflation target band? <strong>4% with a band of ±2%</strong></li>
<li>On which date was GST introduced? <strong>1 July 2017</strong></li>
</ul>
<p>Take the weekly current affairs test on Drona after reading. Your score is compared with every other aspirant who attempted it, so you can see where you stand.</p>`,
  },
  {
    title: "How to Analyse a Mock Test (and Actually Improve)",
    slug: "how-to-analyse-a-mock-test",
    type: "BLOG",
    category: "Study Strategy",
    author: "Drona Editorial Team",
    tags: ["Mock Tests", "Strategy", "Analysis"],
    readMinutes: 5,
    excerpt: "Writing mocks is easy; learning from them is where ranks are made. A simple four-step method to turn every result into progress.",
    body: `<p>Many aspirants write dozens of mock tests and still see their scores stay flat. The reason is almost always the same: they check the score, glance at a few answers and move on to the next mock. The improvement happens in the analysis, not in the test itself.</p>
<h2>Step 1: Look past the score</h2>
<p>Your total tells you where you stand. It does not tell you what to fix. Open the section-wise and topic-wise breakdown first. A score of 160 with 95% accuracy in English and 50% in Numerical Ability calls for a very different plan from the same score with even accuracy.</p>
<h2>Step 2: Sort every mistake</h2>
<p>Go through every wrong and skipped question and put it into one of four groups:</p>
<ul>
<li><strong>Concept gap:</strong> you did not know how to solve it.</li>
<li><strong>Silly error:</strong> you knew the method but misread or miscalculated.</li>
<li><strong>Time pressure:</strong> you could have solved it but ran out of time.</li>
<li><strong>Bad guess:</strong> you attempted without a clear reason.</li>
</ul>
<p>Count each group. The largest group is your next week's priority.</p>
<h2>Step 3: Fix, then re-attempt</h2>
<p>Concept gaps go to topic-wise practice. Silly errors improve when you underline key words in the question. Time pressure improves with sectional timed tests. Bad guesses stop when you set a rule, for example only guessing after eliminating two options. After a week, re-attempt the same mock. If the same questions go wrong again, the fix has not worked yet.</p>
<h2>Step 4: Track your rank, not just your score</h2>
<p>Mocks vary in difficulty, so a lower score on a harder paper can still be progress. Your All-India and state rank shows how you compare with others who took the same test. A steadily rising percentile is the most reliable sign that you are exam-ready.</p>
<h2>A simple routine</h2>
<p>For every two-hour mock, set aside at least ninety minutes for analysis. Keep one notebook for all mistakes, organised by topic, and revise it before every new mock. Drona's result page shows topic-wise accuracy, time per question and your rank automatically, so you can spend your time on the fixing rather than the counting.</p>`,
  },
];

export const pages: { slug: "about" | "privacy" | "terms" | "refund"; title: string; body: string }[] = [
  {
    slug: "about",
    title: "About Drona",
    body: `<p>Drona began with a simple observation: aspirants preparing for defence and government exams practised hard but rarely knew where they were losing marks. Drona was built as a defence officer's enterprise to change that, by giving every aspirant a real exam experience, a detailed explanation for every question and an honest picture of where they stand.</p>
<h2>Our mission</h2>
<p>We want every aspirant in India, whether in a metro or a small town, to have access to high-quality, exam-centric practice at a fair price. Our free daily quizzes and free mock tests mean no one has to pay to start.</p>
<h2>Perform · Analyse · Improve</h2>
<p>Our method is in our motto. <strong>Perform</strong> in a test that feels like the real exam. <strong>Analyse</strong> your result with topic-wise accuracy and State and All-India rank. <strong>Improve</strong> by re-attempting and fixing weak areas until they become strengths.</p>
<h2>What we offer</h2>
<ul>
<li>Full-length mock tests, topic-wise tests and previous year papers</li>
<li>Free daily quizzes and current affairs digests</li>
<li>An e-library of exam-focused books and revision notes</li>
<li>Video courses for selected exams</li>
<li>Practice in English and Hindi</li>
</ul>`,
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    body: `<p>This Privacy Policy explains how Drona ("we", "us") collects, uses and protects your information when you use our website and services. By using Drona, you agree to the practices described here.</p>
<h2>Information we collect</h2>
<ul>
<li><strong>Account details:</strong> name, email address, phone number and the exams you are interested in.</li>
<li><strong>Usage data:</strong> tests attempted, answers, scores, time taken and rank, used to generate your performance analysis.</li>
<li><strong>Payment data:</strong> order details and transaction references. Card and UPI details are processed by our payment partner and are not stored by us.</li>
<li><strong>Technical data:</strong> device type, browser, IP address and cookies needed to keep you logged in.</li>
</ul>
<h2>How we use your information</h2>
<ul>
<li>To provide tests, results, ranks and purchased content</li>
<li>To send important updates about your account, orders and exams you follow</li>
<li>To improve our questions, explanations and website</li>
<li>To respond to your queries and support requests</li>
</ul>
<h2>Sharing</h2>
<p>We do not sell your personal data. We share it only with service providers who help us run Drona (such as hosting and payment processing), or when required by law. Ranks are shown to other users without your contact details.</p>
<h2>Data security and retention</h2>
<p>Passwords are stored in hashed form and data is transmitted over encrypted connections. We keep your data for as long as your account is active, and you may ask us to delete your account at any time.</p>
<h2>Your rights</h2>
<p>You can access, correct or delete your personal data, and opt out of promotional messages. Write to <a href="mailto:dronacourses@gmail.com">dronacourses@gmail.com</a> and we will respond within 30 days.</p>
<h2>Changes</h2>
<p>We may update this policy from time to time. Significant changes will be notified on the website.</p>`,
  },
  {
    slug: "terms",
    title: "Terms of Use",
    body: `<p>These Terms of Use govern your access to Drona's website, tests and digital products. Please read them carefully before using our services.</p>
<h2>Accounts</h2>
<ul>
<li>You must provide accurate information when creating an account.</li>
<li>Your account is for personal use only. Sharing login details or purchased content is not permitted and may lead to suspension.</li>
<li>You are responsible for keeping your password confidential.</li>
</ul>
<h2>Use of content</h2>
<p>All questions, explanations, books, videos and other materials on Drona are our intellectual property or used under licence. You may use them for your personal exam preparation only. Copying, reselling, recording or redistributing any content is prohibited.</p>
<h2>Purchases and activation keys</h2>
<ul>
<li>Prices are shown in Indian Rupees and include applicable taxes unless stated otherwise.</li>
<li>Paid tests and products are available for the validity period shown at the time of purchase.</li>
<li>Activation keys can be redeemed once and are linked to the account that redeems them.</li>
</ul>
<h2>Results and ranks</h2>
<p>Scores, ranks and predictions are based on attempts made on Drona and are for guidance only. They do not guarantee any result in the actual examination.</p>
<h2>Exam information</h2>
<p>We make every effort to keep exam patterns, syllabi and eligibility details accurate, but official notifications from the conducting body always prevail.</p>
<h2>Limitation of liability</h2>
<p>Drona is not liable for any indirect loss arising from the use of our services, including service interruptions due to maintenance or technical issues.</p>
<h2>Governing law</h2>
<p>These terms are governed by the laws of India. For any questions, contact <a href="mailto:dronacourses@gmail.com">dronacourses@gmail.com</a>.</p>`,
  },
  {
    slug: "refund",
    title: "Refund & Cancellation Policy",
    body: `<p>Drona sells digital products such as mock test series, e-library books and video courses. Because these are delivered instantly and can be accessed in full immediately, all purchases are final and non-refundable, except in the cases listed below.</p>
<h2>When you are eligible for a refund</h2>
<ul>
<li><strong>Duplicate payment:</strong> you were charged more than once for the same order.</li>
<li><strong>Technical failure:</strong> the amount was debited but the content was not unlocked on your account, and our team could not resolve it.</li>
</ul>
<p>Refund requests must be raised within <strong>7 days</strong> of the payment date.</p>
<h2>How to request a refund</h2>
<p>Email <a href="mailto:dronacourses@gmail.com">dronacourses@gmail.com</a> from your registered email address with your order ID, the transaction reference and a short description of the issue. Our team will verify the request and reply within 3 working days.</p>
<h2>Processing</h2>
<p>Approved refunds are returned to the original payment method within 7–10 working days, depending on your bank or payment provider.</p>
<h2>Activation keys</h2>
<p>Activation keys are non-refundable once redeemed. Unredeemed keys purchased in error can be reviewed case by case.</p>
<h2>Cancellation</h2>
<p>As our products are not subscriptions, there is nothing to cancel. Your access simply ends when the validity period expires.</p>`,
  },
];

export const testimonials: { name: string; exam: string; rank: string; quote: string; rating: number }[] = [
  {
    name: "Aditya Rathore",
    exam: "AFCAT",
    rank: "AIR 42",
    quote: "The AFCAT mocks felt exactly like the real paper. The topic-wise report showed I was losing marks in spatial ability, and two weeks of focused practice fixed it.",
    rating: 5,
  },
  {
    name: "Sneha Kulkarni",
    exam: "CDS OTA",
    rank: "AIR 18",
    quote: "I used the daily quizzes on my commute and the full mocks on weekends. The explanations are short but clear, which is what you need when revising.",
    rating: 5,
  },
  {
    name: "Gurpreet Singh Sandhu",
    exam: "UPSC NDA",
    rank: "AIR 127",
    quote: "Maths was my weak point. Re-attempting the same mock after a week and watching the same mistakes disappear gave me real confidence before the exam.",
    rating: 5,
  },
  {
    name: "Pooja Yadav",
    exam: "UP Police Constable",
    rank: "Selected 2025",
    quote: "Hindi language support made a big difference for me. The state rank told me exactly where I stood among other UP aspirants.",
    rating: 4,
  },
  {
    name: "Arjun Nair",
    exam: "SSC CGL",
    rank: "AIR 356",
    quote: "Affordable, focused and no clutter. I took more than 30 mocks on Drona and the All-India rank trend kept me honest about my preparation.",
    rating: 5,
  },
  {
    name: "Rinchen Dorjee",
    exam: "IAF Agniveervayu",
    rank: "Selected 2025",
    quote: "Coming from a small town in Ladakh, I didn't have a coaching centre nearby. Drona's free tests were how I started, and the paid series was worth every rupee.",
    rating: 5,
  },
];

export const toppers: { name: string; exam: string; rank: string; year: number }[] = [
  { name: "Kavya Menon", exam: "AFCAT", rank: "AIR 7", year: 2025 },
  { name: "Rohit Choudhary", exam: "UPSC NDA", rank: "AIR 23", year: 2025 },
  { name: "Ananya Bhattacharya", exam: "UPSC CDS (OTA)", rank: "AIR 11", year: 2024 },
  { name: "Vikram Thakur", exam: "Territorial Army Officer", rank: "Recommended", year: 2026 },
  { name: "Saurabh Mishra", exam: "SSC CGL", rank: "AIR 89", year: 2024 },
  { name: "Harpreet Kaur", exam: "Delhi Police MTS", rank: "Rank 64", year: 2025 },
];

export const faculty: { name: string; role: string; bio: string }[] = [
  {
    name: "Col. (Retd.) Rajesh Verma",
    role: "SSB & Defence Mentor",
    bio: "Served 26 years in the Indian Army and has guided hundreds of aspirants through the SSB interview. Leads Drona's defence content and interview guidance.",
  },
  {
    name: "Meenakshi Iyer",
    role: "English & Verbal Ability",
    bio: "Postgraduate in English Literature with 12 years of teaching experience for CDS, AFCAT and SSC aspirants. Writes Drona's English question bank.",
  },
  {
    name: "Ankit Saxena",
    role: "Mathematics & Reasoning",
    bio: "Engineer turned educator who specialises in NDA Mathematics and quantitative aptitude. Known for short-cut methods that hold up under exam pressure.",
  },
  {
    name: "Farhan Qureshi",
    role: "General Awareness & Current Affairs",
    bio: "Former journalist who heads Drona's current affairs desk, turning daily news into exam-ready digests and quizzes for defence and SSC exams.",
  },
];

export const faqs: { question: string; answer: string; group: "General" }[] = [
  {
    question: "Are there free tests on Drona?",
    answer: "Yes. Daily quizzes are always free, and most exams have at least one free full-length mock test. Sign up to attempt them and see your rank.",
    group: "General",
  },
  {
    question: "How do I unlock a paid test?",
    answer: "Open the test and tap Unlock. You will see the price and exactly what is included before you pay. Once payment is complete, the test unlocks instantly on your account.",
    group: "General",
  },
  {
    question: "What is an activation key and how do I use it?",
    answer: "An activation key is a voucher code that unlocks specific tests or products. Click Activation Key in the header, enter your code and the content is added to your account immediately.",
    group: "General",
  },
  {
    question: "Can I take tests in Hindi?",
    answer: "You can switch the website to हिन्दी at any time. The language of each test is shown on its card.",
    group: "General",
  },
  {
    question: "How are my results and rank calculated?",
    answer: "Your score uses the exam's marking scheme, including negative marking. Your result also shows an estimated State and All-India rank for that test.",
    group: "General",
  },
  {
    question: "Can I re-attempt a test?",
    answer: "Yes. You can re-attempt any test you have access to. We recommend re-attempting a mock about a week after your first attempt to check whether your weak areas have improved.",
    group: "General",
  },
  {
    question: "What is your refund policy?",
    answer: "Please read our Refund Policy page, or email dronacourses@gmail.com with your order details.",
    group: "General",
  },
  {
    question: "How can I contact Drona?",
    answer: "Email us at dronacourses@gmail.com or use the contact form.",
    group: "General",
  },
];

export const announcement = {
  text: "AFCAT 2026 full mock series is live. Your first mock is free.",
  link: "/exam/afcat",
};
