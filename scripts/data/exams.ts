export type SeedExam = {
  name: string;
  slug: string;
  group: string;
  category: "defence-police" | "ssc";
  shortDescription: string;
  overview: string;
  examPattern: string;
  syllabus: string;
  eligibility: string;
  languages: string[];
  level: string;
  icon: string;
  faqs: { q: string; a: string }[];
};

export const detailedExams: SeedExam[] = [
  {
    name: "AFCAT",
    slug: "afcat",
    group: "Indian Air Force",
    category: "defence-police",
    shortDescription:
      "Air Force Common Admission Test for commissioned officer entry into the Flying, Ground Duty (Technical) and Ground Duty (Non-Technical) branches of the IAF.",
    overview: `<p>The Air Force Common Admission Test (AFCAT) is conducted by the Indian Air Force twice a year, usually in February and August. It selects graduates for Short Service Commission in the Flying branch and for Permanent or Short Service Commission in the Ground Duty (Technical and Non-Technical) branches.</p>
<h3>Selection process</h3>
<ul>
<li>Online AFCAT written test, plus the Engineering Knowledge Test (EKT) for technical branches</li>
<li>Five-day AFSB interview: Officer Intelligence Rating, Picture Perception &amp; Discussion, psychological tests, GTO tasks and personal interview</li>
<li>Computerised Pilot Selection System (CPSS) for Flying branch candidates</li>
<li>Medical examination and final merit list</li>
</ul>
<p>Patterns, age limits and vacancies can change between cycles, so always verify the details against the latest official notification on afcat.cdac.in.</p>`,
    examPattern: `<table>
<thead><tr><th>Section</th><th>Questions</th><th>Marks</th><th>Duration</th></tr></thead>
<tbody>
<tr><td>General Awareness</td><td>25</td><td>75</td><td rowspan="4">2 hours (combined)</td></tr>
<tr><td>Verbal Ability in English</td><td>30</td><td>90</td></tr>
<tr><td>Numerical Ability</td><td>20</td><td>60</td></tr>
<tr><td>Reasoning &amp; Military Aptitude</td><td>25</td><td>75</td></tr>
<tr><td><strong>Total</strong></td><td><strong>100</strong></td><td><strong>300</strong></td><td><strong>120 minutes</strong></td></tr>
</tbody>
</table>
<ul>
<li>+3 for each correct answer, −1 for each wrong answer, no marks for unattempted questions</li>
<li>EKT (technical branch only): 50 questions, 150 marks, 45 minutes, same marking scheme</li>
<li>Section-wise numbers are indicative; the total of 100 questions and 300 marks is fixed</li>
</ul>`,
    syllabus: `<h3>General Awareness</h3>
<ul><li>History, geography, polity and economy of India</li><li>Basic science, sports, art and culture</li><li>Defence and current affairs</li></ul>
<h3>Verbal Ability in English</h3>
<ul><li>Comprehension and error detection</li><li>Sentence completion, synonyms and antonyms</li><li>Idioms, phrases and vocabulary</li></ul>
<h3>Numerical Ability</h3>
<ul><li>Decimals, fractions, simplification</li><li>Ratio and proportion, average, percentage</li><li>Profit and loss, simple and compound interest, time and work, speed and distance</li></ul>
<h3>Reasoning &amp; Military Aptitude</h3>
<ul><li>Verbal skills and analogies</li><li>Spatial ability: figure completion, embedded figures, pattern rotation</li><li>Dot situation and hidden figures</li></ul>`,
    eligibility: `<ul>
<li>Nationality: Indian citizen</li>
<li>Age: 20–24 years for Flying branch; 20–26 years for Ground Duty branches</li>
<li>Flying: graduation with 60% and 50% each in Maths and Physics at 10+2, or BE/BTech with 60%</li>
<li>Ground Duty (Technical): BE/BTech in a relevant discipline with 60%</li>
<li>Ground Duty (Non-Technical): graduation with 60% (stream rules vary by branch)</li>
<li>Unmarried at the time of commencement of training</li>
</ul>`,
    languages: ["English"],
    level: "Graduate",
    icon: "Plane",
    faqs: [
      { q: "How many times is AFCAT conducted in a year?", a: "AFCAT is held twice a year, generally in February and August. The notification is released about three months before the exam." },
      { q: "Is there negative marking in AFCAT?", a: "Yes. Each correct answer earns 3 marks and each wrong answer deducts 1 mark. Unattempted questions carry no marks." },
      { q: "What is a good AFCAT score?", a: "Cut-offs usually fall between 150 and 170 out of 300. Aim for 180 or above in mocks to stay comfortably safe." },
      { q: "Who has to take the EKT?", a: "Only candidates applying for the Ground Duty (Technical) branch take the Engineering Knowledge Test, in addition to the main AFCAT paper." },
      { q: "Can women apply for AFCAT?", a: "Yes. Women are eligible for all branches, including the Flying branch, under the same entry conditions." },
    ],
  },
  {
    name: "UPSC NDA",
    slug: "upsc-nda",
    group: "UPSC NDA",
    category: "defence-police",
    shortDescription:
      "National Defence Academy and Naval Academy entrance exam by UPSC for 10+2 candidates aiming at the Army, Navy and Air Force.",
    overview: `<p>The NDA &amp; NA examination is conducted by the Union Public Service Commission twice a year, in April and September. Successful candidates train at the National Defence Academy, Khadakwasla (Pune), for three years before moving to their service academies, or join the 10+2 Cadet Entry at the Indian Naval Academy, Ezhimala.</p>
<h3>Selection process</h3>
<ul>
<li>Written examination: Mathematics and General Ability Test (900 marks)</li>
<li>SSB interview over five days (900 marks)</li>
<li>Medical examination and final merit list</li>
</ul>
<p>Check the latest UPSC notification for exact dates, vacancies and any change in eligibility before you apply.</p>`,
    examPattern: `<table>
<thead><tr><th>Section</th><th>Questions</th><th>Marks</th><th>Duration</th></tr></thead>
<tbody>
<tr><td>Mathematics</td><td>120</td><td>300</td><td>2 hours 30 minutes</td></tr>
<tr><td>General Ability Test – English</td><td>50</td><td>200</td><td rowspan="2">2 hours 30 minutes</td></tr>
<tr><td>General Ability Test – General Knowledge</td><td>100</td><td>400</td></tr>
<tr><td><strong>Total (written)</strong></td><td><strong>270</strong></td><td><strong>900</strong></td><td><strong>5 hours</strong></td></tr>
</tbody>
</table>
<ul>
<li>Negative marking: one-third of the marks for that question are deducted for each wrong answer</li>
<li>SSB interview carries a further 900 marks</li>
</ul>`,
    syllabus: `<h3>Mathematics</h3>
<ul><li>Algebra, matrices and determinants</li><li>Trigonometry, analytical geometry of two and three dimensions</li><li>Differential and integral calculus, differential equations</li><li>Vector algebra, statistics and probability</li></ul>
<h3>English</h3>
<ul><li>Grammar and usage, vocabulary</li><li>Comprehension and cohesion in extended text</li></ul>
<h3>General Knowledge</h3>
<ul><li>Physics, chemistry and general science</li><li>History, freedom movement, geography</li><li>Current events and defence affairs</li></ul>`,
    eligibility: `<ul>
<li>Unmarried Indian citizens (men and women)</li>
<li>Age: 16.5 to 19.5 years on the date notified for the course</li>
<li>Army wing: 12th pass in any stream</li>
<li>Air Force, Navy and Naval Academy: 12th pass with Physics, Chemistry and Mathematics</li>
<li>Candidates appearing in Class 12 can also apply</li>
</ul>`,
    languages: ["English", "Hindi"],
    level: "10+2",
    icon: "Shield",
    faqs: [
      { q: "How many times is NDA held in a year?", a: "UPSC conducts the NDA & NA exam twice a year, normally in April (NDA I) and September (NDA II)." },
      { q: "Can Class 12 students apply for NDA?", a: "Yes. Candidates currently studying in Class 12 can apply, provided they submit proof of passing within the time UPSC specifies." },
      { q: "Is there sectional qualifying in NDA?", a: "Yes. UPSC sets a minimum in each paper (generally around 25%) along with an overall cut-off for the written exam." },
      { q: "Can girls join NDA?", a: "Yes. Women have been eligible for NDA since 2021 and are selected through the same exam and SSB process." },
      { q: "Which is harder, Maths or GAT?", a: "It depends on your background. Maths has fewer marks but decides most selections, so practise it daily with full-length mocks." },
    ],
  },
  {
    name: "UPSC CDS",
    slug: "upsc-cds",
    group: "UPSC CDS",
    category: "defence-police",
    shortDescription:
      "Combined Defence Services exam by UPSC for graduates seeking entry to IMA, INA, AFA and OTA.",
    overview: `<p>The Combined Defence Services (CDS) examination is held by UPSC twice a year. It is the graduate entry route to the Indian Military Academy (Dehradun), Indian Naval Academy (Ezhimala), Air Force Academy (Dundigal) and Officers' Training Academy (Chennai).</p>
<h3>Selection process</h3>
<ul>
<li>Written examination (three papers for IMA/INA/AFA, two for OTA)</li>
<li>SSB interview, with CPSS for Air Force Academy candidates</li>
<li>Medical examination and merit list</li>
</ul>
<p>Confirm the latest notification on upsc.gov.in for dates, vacancies and academy-wise eligibility.</p>`,
    examPattern: `<table>
<thead><tr><th>Section</th><th>Questions</th><th>Marks</th><th>Duration</th></tr></thead>
<tbody>
<tr><td>English</td><td>120</td><td>100</td><td>2 hours</td></tr>
<tr><td>General Knowledge</td><td>120</td><td>100</td><td>2 hours</td></tr>
<tr><td>Elementary Mathematics (IMA/INA/AFA only)</td><td>100</td><td>100</td><td>2 hours</td></tr>
<tr><td><strong>Total</strong></td><td><strong>340</strong></td><td><strong>300 (200 for OTA)</strong></td><td><strong>6 hours</strong></td></tr>
</tbody>
</table>
<ul>
<li>Negative marking: one-third of the marks for that question for each wrong answer</li>
<li>SSB interview: 300 marks for IMA/INA/AFA and 200 marks for OTA</li>
</ul>`,
    syllabus: `<h3>English</h3>
<ul><li>Spotting errors, sentence improvement, ordering of sentences</li><li>Synonyms, antonyms, idioms</li><li>Comprehension passages</li></ul>
<h3>General Knowledge</h3>
<ul><li>Current events, history, geography, polity, economy</li><li>General science and defence awareness</li></ul>
<h3>Elementary Mathematics</h3>
<ul><li>Arithmetic: number system, percentage, time and work, profit and loss</li><li>Algebra and trigonometry</li><li>Geometry, mensuration and statistics</li></ul>`,
    eligibility: `<ul>
<li>IMA and OTA: graduation from a recognised university</li>
<li>INA: BE/BTech</li>
<li>AFA: graduation with Physics and Maths at 10+2, or BE/BTech</li>
<li>Age: about 19–24 years for IMA and AFA, 19–22 for INA and 19–25 for OTA (varies by course)</li>
<li>Final-year students can apply</li>
</ul>`,
    languages: ["English", "Hindi"],
    level: "Graduate",
    icon: "Medal",
    faqs: [
      { q: "Which academies can I join through CDS?", a: "CDS leads to IMA Dehradun, INA Ezhimala, AFA Dundigal and OTA Chennai. You choose your preferences in the application form." },
      { q: "Why does OTA have only two papers?", a: "OTA candidates write English and General Knowledge only. Elementary Mathematics is not part of the OTA paper." },
      { q: "Is there negative marking in CDS?", a: "Yes. One-third of the marks assigned to a question are deducted for each wrong answer." },
      { q: "Can final-year students apply?", a: "Yes. They must submit proof of passing the degree before the course begins." },
      { q: "Can women apply for CDS?", a: "Women are eligible for OTA entry through CDS. Check each notification for any expanded entries." },
    ],
  },
  {
    name: "IAF Agniveervayu",
    slug: "iaf-agniveervayu",
    group: "Indian Air Force",
    category: "defence-police",
    shortDescription:
      "Online test for enrolment as Agniveervayu in the Indian Air Force under the Agnipath scheme.",
    overview: `<p>Agniveervayu is the Indian Air Force's enrolment under the Agnipath scheme for a four-year engagement. The Central Airmen Selection Board conducts an online test, followed by a physical fitness test, adaptability tests and a medical examination.</p>
<h3>Selection process</h3>
<ul>
<li>Phase I: online test (Science, Other than Science, or both)</li>
<li>Phase II: Physical Fitness Test, Adaptability Test I and II</li>
<li>Phase III: medical examination</li>
</ul>
<p>Pattern and age rules are set in each intake notification on agnipathvayu.cdac.in, so verify before you apply.</p>`,
    examPattern: `<table>
<thead><tr><th>Section</th><th>Questions</th><th>Marks</th><th>Duration</th></tr></thead>
<tbody>
<tr><td>Science: English, Physics, Mathematics</td><td>70</td><td>70</td><td>60 minutes</td></tr>
<tr><td>Other than Science: English, Reasoning &amp; General Awareness</td><td>50</td><td>50</td><td>45 minutes</td></tr>
<tr><td>Both: English, Physics, Mathematics, RAGA</td><td>100</td><td>100</td><td>85 minutes</td></tr>
</tbody>
</table>
<ul>
<li>+1 for each correct answer, −0.25 for each wrong answer</li>
<li>Physics and Mathematics follow the CBSE 10+2 syllabus</li>
</ul>`,
    syllabus: `<h3>English</h3>
<ul><li>Comprehension, grammar, vocabulary</li></ul>
<h3>Physics</h3>
<ul><li>Units and measurement, kinematics, laws of motion</li><li>Work, energy, power; gravitation; thermodynamics</li><li>Electricity, magnetism, optics, modern physics</li></ul>
<h3>Mathematics</h3>
<ul><li>Sets, functions, trigonometry, complex numbers</li><li>Matrices, calculus, vectors, probability</li></ul>
<h3>Reasoning &amp; General Awareness</h3>
<ul><li>Verbal and non-verbal reasoning</li><li>General science, current events, history, geography</li></ul>`,
    eligibility: `<ul>
<li>Age: 17.5 to 21 years</li>
<li>Science: 10+2 with Maths, Physics and English, 50% aggregate and 50% in English, or a 3-year engineering diploma</li>
<li>Other than Science: 10+2 in any stream with 50% aggregate and 50% in English</li>
<li>Unmarried, and meeting IAF medical and physical standards</li>
</ul>`,
    languages: ["English", "Hindi"],
    level: "10+2",
    icon: "Wind",
    faqs: [
      { q: "What is the service period for Agniveervayu?", a: "The engagement is four years, including training. Up to 25% of each batch may be selected for regular cadre afterwards." },
      { q: "Is there negative marking?", a: "Yes. A quarter mark is deducted for each wrong answer, while a correct answer earns one mark." },
      { q: "Can I appear in both Science and Other than Science?", a: "Yes, if you are eligible for both. You then take a single combined paper of 100 questions in 85 minutes." },
      { q: "What does the Physical Fitness Test include?", a: "A timed 1.6 km run, followed by push-ups, sit-ups and squats within set limits. Female candidates have separate standards." },
      { q: "Which syllabus should I follow for Physics and Maths?", a: "Follow the CBSE Class 11 and 12 syllabus. Drona's topic-wise tests are mapped to the same chapters." },
    ],
  },
  {
    name: "Indian Military Academy (IMA)",
    slug: "ima",
    group: "Indian Army",
    category: "defence-police",
    shortDescription:
      "Graduate entry to the Indian Military Academy, Dehradun, mainly through the UPSC CDS examination.",
    overview: `<p>The Indian Military Academy in Dehradun trains officer cadets for permanent commission in the Indian Army. Graduates enter mainly through the UPSC CDS examination; technical graduates can also join through the Technical Graduate Course (TGC), which is selected directly through SSB.</p>
<h3>Selection process</h3>
<ul>
<li>UPSC CDS written exam: English, General Knowledge and Elementary Mathematics</li>
<li>SSB interview at a Services Selection Board</li>
<li>Medical examination and final merit</li>
<li>About 18 months of training at IMA, then commission as Lieutenant</li>
</ul>
<p>Refer to the current CDS notification for the exact course dates and vacancies.</p>`,
    examPattern: `<table>
<thead><tr><th>Section</th><th>Questions</th><th>Marks</th><th>Duration</th></tr></thead>
<tbody>
<tr><td>English</td><td>120</td><td>100</td><td>2 hours</td></tr>
<tr><td>General Knowledge</td><td>120</td><td>100</td><td>2 hours</td></tr>
<tr><td>Elementary Mathematics</td><td>100</td><td>100</td><td>2 hours</td></tr>
<tr><td><strong>Total</strong></td><td><strong>340</strong></td><td><strong>300</strong></td><td><strong>6 hours</strong></td></tr>
</tbody>
</table>
<ul>
<li>One-third negative marking for each wrong answer</li>
<li>SSB interview: 300 marks</li>
</ul>`,
    syllabus: `<h3>English</h3>
<ul><li>Error spotting, sentence improvement, comprehension, vocabulary</li></ul>
<h3>General Knowledge</h3>
<ul><li>Current affairs, Indian history, geography, polity, economy, science</li></ul>
<h3>Elementary Mathematics</h3>
<ul><li>Arithmetic, algebra, trigonometry, geometry, mensuration, statistics</li></ul>`,
    eligibility: `<ul>
<li>Unmarried male graduates from a recognised university</li>
<li>Age: 19–24 years for the course</li>
<li>Final-year students may apply</li>
</ul>`,
    languages: ["English", "Hindi"],
    level: "Graduate",
    icon: "Swords",
    faqs: [
      { q: "How do I join IMA after graduation?", a: "Clear the UPSC CDS exam with IMA as a preference, then clear the SSB interview and medicals." },
      { q: "How long is training at IMA?", a: "Direct entry gentleman cadets train for about 18 months before being commissioned as Lieutenants." },
      { q: "Is there a non-UPSC route to IMA?", a: "Yes. Engineers can apply for the Technical Graduate Course, where shortlisting is based on marks and selection is through SSB." },
      { q: "What is the IMA motto?", a: "The IMA motto is 'Veerta aur Vivek', meaning valour and wisdom." },
      { q: "Which Drona tests should I practise for IMA?", a: "Use the CDS full mocks and the IMA paper-wise tests: English, GK and Elementary Maths." },
    ],
  },
  {
    name: "Territorial Army Officer",
    slug: "territorial-army-officer",
    group: "Territorial Army",
    category: "defence-police",
    shortDescription:
      "Part-time commissioned officer entry for gainfully employed civilians who want to serve in the Territorial Army.",
    overview: `<p>The Territorial Army (TA) is a part of the regular Army in which gainfully employed citizens serve as part-time officers. Officer selection starts with a written examination conducted by the Territorial Army, followed by a Preliminary Interview Board (PIB), SSB and medicals.</p>
<h3>Selection process</h3>
<ul>
<li>Written examination: two papers</li>
<li>Preliminary Interview Board</li>
<li>SSB interview and medical examination</li>
</ul>
<p>Check the latest TA notification for exam dates and any update to the pattern.</p>`,
    examPattern: `<table>
<thead><tr><th>Section</th><th>Questions</th><th>Marks</th><th>Duration</th></tr></thead>
<tbody>
<tr><td>Paper I – Reasoning</td><td>50</td><td>50</td><td rowspan="2">2 hours</td></tr>
<tr><td>Paper I – Elementary Mathematics</td><td>50</td><td>50</td></tr>
<tr><td>Paper II – General Knowledge</td><td>50</td><td>50</td><td rowspan="2">2 hours</td></tr>
<tr><td>Paper II – English</td><td>50</td><td>50</td></tr>
<tr><td><strong>Total</strong></td><td><strong>200</strong></td><td><strong>200</strong></td><td><strong>4 hours</strong></td></tr>
</tbody>
</table>
<ul>
<li>Minimum 40% in each part and in the aggregate</li>
<li>Negative marking applies as per the notification</li>
</ul>`,
    syllabus: `<h3>Reasoning</h3>
<ul><li>Verbal and non-verbal reasoning, series, analogies, coding</li></ul>
<h3>Elementary Mathematics</h3>
<ul><li>Arithmetic, algebra, trigonometry, geometry, mensuration, statistics (matriculation level)</li></ul>
<h3>General Knowledge</h3>
<ul><li>Current events, history, geography, polity, science</li></ul>
<h3>English</h3>
<ul><li>Grammar, vocabulary, comprehension</li></ul>`,
    eligibility: `<ul>
<li>Indian citizens (male), age 18–42 years</li>
<li>Graduate from a recognised university</li>
<li>Gainfully employed in a central or state government, a private firm, or self-employed</li>
<li>Serving members of the regular forces, police and paramilitary are not eligible</li>
</ul>`,
    languages: ["English", "Hindi"],
    level: "Graduate",
    icon: "Flag",
    faqs: [
      { q: "Is Territorial Army a full-time job?", a: "No. TA officers serve part-time and keep their civilian employment. Units are embodied for training and duty as required." },
      { q: "Do I need to be employed to apply?", a: "Yes. Being gainfully employed is a basic eligibility condition for the TA officer entry." },
      { q: "What is the minimum qualifying score?", a: "You need at least 40% in each part of both papers and 40% in the aggregate." },
      { q: "Is there an SSB for Territorial Army?", a: "Yes. Candidates who clear the PIB are sent to an SSB, the same as regular Army entries." },
      { q: "What is the upper age limit?", a: "The upper age limit is 42 years on the closing date of applications." },
    ],
  },
  {
    name: "Delhi Police MTS",
    slug: "delhi-police-mts",
    group: "Delhi Police",
    category: "defence-police",
    shortDescription:
      "Multi-Tasking Staff (Civilian) recruitment in Delhi Police through a computer-based test.",
    overview: `<p>Delhi Police recruits Multi-Tasking Staff (Civilian) for support roles across its units. Selection is through a computer-based examination followed by a trade test or skill test where applicable, and document verification.</p>
<h3>Selection process</h3>
<ul>
<li>Computer-based examination</li>
<li>Trade or skill test (qualifying, where applicable)</li>
<li>Document verification and medical examination</li>
</ul>
<p>The pattern below is indicative and based on recent recruitment cycles; verify it against the latest official notification before you plan your preparation.</p>`,
    examPattern: `<table>
<thead><tr><th>Section</th><th>Questions</th><th>Marks</th><th>Duration</th></tr></thead>
<tbody>
<tr><td>General Awareness</td><td>25</td><td>25</td><td rowspan="4">90 minutes (combined)</td></tr>
<tr><td>Reasoning</td><td>25</td><td>25</td></tr>
<tr><td>Numerical Ability</td><td>25</td><td>25</td></tr>
<tr><td>Computer Fundamentals</td><td>25</td><td>25</td></tr>
<tr><td><strong>Total</strong></td><td><strong>100</strong></td><td><strong>100</strong></td><td><strong>90 minutes</strong></td></tr>
</tbody>
</table>
<ul><li>Negative marking: 0.25 marks for each wrong answer</li></ul>`,
    syllabus: `<h3>General Awareness</h3>
<ul><li>Current affairs, Indian history, geography, polity, Delhi-specific GK</li></ul>
<h3>Reasoning</h3>
<ul><li>Analogies, series, coding-decoding, directions, blood relations</li></ul>
<h3>Numerical Ability</h3>
<ul><li>Number system, percentage, ratio, average, time and work</li></ul>
<h3>Computer Fundamentals</h3>
<ul><li>MS Word, Excel, internet, email, basic hardware and software</li></ul>`,
    eligibility: `<ul>
<li>10th pass from a recognised board (higher qualification for some trades)</li>
<li>Age: 18–25 years, with relaxation for reserved categories as per rules</li>
<li>Indian citizen</li>
</ul>`,
    languages: ["English", "Hindi"],
    level: "10th",
    icon: "BadgeCheck",
    faqs: [
      { q: "Is Delhi Police MTS a uniformed post?", a: "No. MTS (Civilian) is a non-uniformed support post within Delhi Police." },
      { q: "What is the minimum qualification?", a: "Class 10 pass is the basic requirement. Some trades ask for an ITI certificate or experience." },
      { q: "Is the exam bilingual?", a: "Yes. The computer-based test is offered in both English and Hindi." },
      { q: "Is there negative marking?", a: "Recent cycles deducted a quarter mark for each wrong answer. Confirm this in your notification." },
      { q: "How should I prepare?", a: "Take one full mock every two days, revise Delhi GK and computer basics weekly, and review every wrong answer." },
    ],
  },
  {
    name: "UP Police Constable",
    slug: "up-police-constable",
    group: "UP Police",
    category: "defence-police",
    shortDescription:
      "Uttar Pradesh Police Constable recruitment by UPPRPB: written exam, physical tests and document verification.",
    overview: `<p>The Uttar Pradesh Police Recruitment and Promotion Board (UPPRPB) recruits civil police constables through a written examination, document verification, a physical standard test and a physical efficiency test.</p>
<h3>Selection process</h3>
<ul>
<li>Written examination (300 marks)</li>
<li>Document verification and Physical Standard Test</li>
<li>Physical Efficiency Test: 4.8 km run for men and 2.4 km for women (qualifying)</li>
<li>Medical examination</li>
</ul>
<p>Always confirm the current pattern and age relaxations in the official UPPRPB notification.</p>`,
    examPattern: `<table>
<thead><tr><th>Section</th><th>Questions</th><th>Marks</th><th>Duration</th></tr></thead>
<tbody>
<tr><td>General Knowledge</td><td>38</td><td>76</td><td rowspan="4">2 hours (combined)</td></tr>
<tr><td>General Hindi</td><td>37</td><td>74</td></tr>
<tr><td>Numerical &amp; Mental Ability</td><td>38</td><td>76</td></tr>
<tr><td>Mental Aptitude, IQ &amp; Reasoning</td><td>37</td><td>74</td></tr>
<tr><td><strong>Total</strong></td><td><strong>150</strong></td><td><strong>300</strong></td><td><strong>120 minutes</strong></td></tr>
</tbody>
</table>
<ul><li>+2 for each correct answer, −0.5 for each wrong answer</li></ul>`,
    syllabus: `<h3>General Knowledge</h3>
<ul><li>Indian history, constitution, geography, economy</li><li>Uttar Pradesh: culture, administration, geography</li><li>Current affairs, cyber crime, women's safety laws</li></ul>
<h3>General Hindi</h3>
<ul><li>संधि, समास, पर्यायवाची, विलोम, मुहावरे और लोकोक्तियाँ</li></ul>
<h3>Numerical &amp; Mental Ability</h3>
<ul><li>Number system, simplification, percentage, profit and loss, time and distance</li></ul>
<h3>Mental Aptitude, IQ &amp; Reasoning</h3>
<ul><li>Public interest, law and order, communal harmony</li><li>Analogies, series, coding, blood relations, directions</li></ul>`,
    eligibility: `<ul>
<li>10+2 pass from a recognised board</li>
<li>Age: 18–22 years for men and 18–25 years for women, with relaxation as per state rules</li>
<li>Physical standards for height and chest as notified</li>
</ul>`,
    languages: ["Hindi", "English"],
    level: "10+2",
    icon: "ShieldCheck",
    faqs: [
      { q: "How many questions are in the UP Police Constable exam?", a: "The written exam has 150 objective questions for 300 marks, to be completed in 2 hours." },
      { q: "Is there negative marking?", a: "Yes. Half a mark is deducted for each wrong answer, and each correct answer earns 2 marks." },
      { q: "Is the physical test qualifying?", a: "Yes. The PET is qualifying only. Final merit is based on written exam marks." },
      { q: "Which language is the paper in?", a: "The paper is bilingual in Hindi and English, except the General Hindi section." },
      { q: "Does Drona cover UP-specific GK?", a: "Yes. Topic-wise tests include Uttar Pradesh GK, and the daily quizzes mix in state questions." },
    ],
  },
  {
    name: "SSC CHSL",
    slug: "ssc-chsl",
    group: "CHSL",
    category: "ssc",
    shortDescription:
      "Combined Higher Secondary Level exam by SSC for LDC, JSA, PA/SA and DEO posts in central government offices.",
    overview: `<p>The Staff Selection Commission conducts the Combined Higher Secondary Level (CHSL) examination every year to recruit 12th-pass candidates as Lower Division Clerk / Junior Secretariat Assistant, Postal Assistant / Sorting Assistant and Data Entry Operator.</p>
<h3>Selection process</h3>
<ul>
<li>Tier 1: computer-based exam (qualifying)</li>
<li>Tier 2: computer-based exam (merit), including a skill test or typing test</li>
<li>Document verification</li>
</ul>
<p>Verify cut-off dates and post details in the latest SSC notification on ssc.gov.in.</p>`,
    examPattern: `<table>
<thead><tr><th>Section</th><th>Questions</th><th>Marks</th><th>Duration</th></tr></thead>
<tbody>
<tr><td>English Language</td><td>25</td><td>50</td><td rowspan="4">60 minutes (combined)</td></tr>
<tr><td>General Intelligence</td><td>25</td><td>50</td></tr>
<tr><td>Quantitative Aptitude</td><td>25</td><td>50</td></tr>
<tr><td>General Awareness</td><td>25</td><td>50</td></tr>
<tr><td><strong>Tier 1 total</strong></td><td><strong>100</strong></td><td><strong>200</strong></td><td><strong>60 minutes</strong></td></tr>
</tbody>
</table>
<ul>
<li>−0.5 for each wrong answer in Tier 1</li>
<li>Tier 2 has Session I (Maths, Reasoning, English, GA, Computer Knowledge) and Session II (skill or typing test)</li>
</ul>`,
    syllabus: `<h3>English Language</h3>
<ul><li>Error spotting, fill in the blanks, synonyms, antonyms, cloze test, comprehension</li></ul>
<h3>General Intelligence</h3>
<ul><li>Analogies, classification, series, coding-decoding, Venn diagrams, mirror images</li></ul>
<h3>Quantitative Aptitude</h3>
<ul><li>Arithmetic, algebra, geometry, mensuration, trigonometry, data interpretation</li></ul>
<h3>General Awareness</h3>
<ul><li>Static GK, history, polity, geography, economics, science, current affairs</li></ul>`,
    eligibility: `<ul>
<li>12th pass from a recognised board</li>
<li>Age: 18–27 years, with relaxation for reserved categories</li>
<li>DEO posts in some departments need 12th with Science and Mathematics</li>
</ul>`,
    languages: ["English", "Hindi"],
    level: "10+2",
    icon: "FileText",
    faqs: [
      { q: "Is Tier 1 counted in the final merit?", a: "No. Under the current pattern, Tier 1 is qualifying and the final merit is based on Tier 2." },
      { q: "What typing speed is needed?", a: "35 words per minute in English or 30 words per minute in Hindi on a computer for LDC/JSA posts." },
      { q: "How much negative marking is there?", a: "Half a mark is deducted for each wrong answer in Tier 1." },
      { q: "Can I choose the exam language?", a: "Yes. The paper is available in English and Hindi, and SSC also offers several regional languages for some sections." },
      { q: "How many mocks should I take?", a: "Aim for at least 25 full mocks before the exam, with sectional tests for your weakest areas." },
    ],
  },
  {
    name: "SSC CGL",
    slug: "ssc-cgl",
    group: "CGL",
    category: "ssc",
    shortDescription:
      "Combined Graduate Level exam by SSC for Group B and C posts such as ASO, Inspector, Auditor and Tax Assistant.",
    overview: `<p>SSC CGL is one of India's largest graduate-level recruitment exams. It fills Group B and Group C posts across central ministries and departments, including Assistant Section Officer, Income Tax Inspector, CBI Sub-Inspector, Auditor and Tax Assistant.</p>
<h3>Selection process</h3>
<ul>
<li>Tier 1: computer-based exam (qualifying)</li>
<li>Tier 2: computer-based exam, Paper I for all posts, with additional papers for JSO and AAO</li>
<li>Skill tests (DEST/CPT) and document verification</li>
</ul>
<p>Read the latest notification on ssc.gov.in for posts, age limits and the current scheme.</p>`,
    examPattern: `<table>
<thead><tr><th>Section</th><th>Questions</th><th>Marks</th><th>Duration</th></tr></thead>
<tbody>
<tr><td>General Intelligence &amp; Reasoning</td><td>25</td><td>50</td><td rowspan="4">60 minutes (combined)</td></tr>
<tr><td>General Awareness</td><td>25</td><td>50</td></tr>
<tr><td>Quantitative Aptitude</td><td>25</td><td>50</td></tr>
<tr><td>English Comprehension</td><td>25</td><td>50</td></tr>
<tr><td><strong>Tier 1 total</strong></td><td><strong>100</strong></td><td><strong>200</strong></td><td><strong>60 minutes</strong></td></tr>
</tbody>
</table>
<ul>
<li>−0.5 for each wrong answer in Tier 1</li>
<li>Tier 2 Paper I covers Maths, Reasoning, English, GA and Computer Knowledge, plus a data entry speed test</li>
</ul>`,
    syllabus: `<h3>General Intelligence &amp; Reasoning</h3>
<ul><li>Analogies, classification, series, syllogism, coding, puzzles, non-verbal reasoning</li></ul>
<h3>General Awareness</h3>
<ul><li>History, polity, geography, economy, science, current affairs</li></ul>
<h3>Quantitative Aptitude</h3>
<ul><li>Arithmetic, algebra, geometry, mensuration, trigonometry, statistics, data interpretation</li></ul>
<h3>English Comprehension</h3>
<ul><li>Reading comprehension, cloze test, error spotting, vocabulary, sentence rearrangement</li></ul>`,
    eligibility: `<ul>
<li>Bachelor's degree from a recognised university</li>
<li>Age: 18–32 years depending on the post, with relaxation for reserved categories</li>
<li>Some posts need specific qualifications, such as Statistics for JSO</li>
</ul>`,
    languages: ["English", "Hindi"],
    level: "Graduate",
    icon: "Landmark",
    faqs: [
      { q: "Is Tier 1 marks counted in CGL final merit?", a: "Under the current scheme, Tier 1 is qualifying. Final merit is drawn from Tier 2." },
      { q: "What is the age limit for SSC CGL?", a: "It varies by post, generally 18–27, 18–30 or 20–30, and up to 32 for some posts. Check the post-wise table in the notification." },
      { q: "Can final-year students apply?", a: "Yes, if they complete their degree by the cut-off date SSC specifies." },
      { q: "Is there sectional timing?", a: "Tier 1 has a single 60-minute window. Tier 2 Paper I uses section-wise timings." },
      { q: "How do Drona mocks help with CGL?", a: "Each mock reports your All-India rank and topic-wise accuracy, so you can target the weak topics before the next attempt." },
    ],
  },
];

export const lightExams: SeedExam[] = [
  {
    name: "AFCAT EKT Computer Science",
    slug: "afcat-ekt-cs",
    group: "Indian Air Force",
    category: "defence-police",
    shortDescription: "Engineering Knowledge Test for Computer Science candidates applying to IAF Ground Duty (Technical) branches.",
    overview: `<p>The EKT for Computer Science is taken right after the main AFCAT paper by candidates opting for the Aeronautical Engineering (Electronics) branch with a CS or IT background. It tests core engineering concepts at the BE/BTech level.</p>`,
    examPattern: `<table><thead><tr><th>Section</th><th>Questions</th><th>Marks</th><th>Duration</th></tr></thead><tbody><tr><td>Computer Science &amp; Engineering</td><td>50</td><td>150</td><td>45 minutes</td></tr></tbody></table>`,
    syllabus: `<ul><li>Data structures and algorithms</li><li>Operating systems, DBMS, computer networks</li><li>Digital logic, computer organisation</li><li>Programming in C and C++</li></ul>`,
    eligibility: `<ul><li>BE/BTech in Computer Science or IT with at least 60%</li><li>Age: 20–26 years</li></ul>`,
    languages: ["English"],
    level: "Graduate",
    icon: "Cpu",
    faqs: [
      { q: "Is the EKT marking the same as AFCAT?", a: "Yes. +3 for a correct answer and −1 for a wrong answer." },
      { q: "When is the EKT held?", a: "On the same day as AFCAT, immediately after the main paper." },
    ],
  },
  {
    name: "AFCAT EKT EE",
    slug: "afcat-ekt-ee",
    group: "Indian Air Force",
    category: "defence-police",
    shortDescription: "Engineering Knowledge Test for Electrical and Electronics candidates in the IAF technical branch.",
    overview: `<p>The Electrical &amp; Electronics EKT is for engineering graduates applying to the Aeronautical Engineering (Electronics) branch. It covers core circuits, machines and communication systems.</p>`,
    examPattern: `<table><thead><tr><th>Section</th><th>Questions</th><th>Marks</th><th>Duration</th></tr></thead><tbody><tr><td>Electrical &amp; Electronics</td><td>50</td><td>150</td><td>45 minutes</td></tr></tbody></table>`,
    syllabus: `<ul><li>Network theory, electrical machines</li><li>Analog and digital electronics</li><li>Signals and systems, control systems</li><li>Communication engineering, power systems</li></ul>`,
    eligibility: `<ul><li>BE/BTech in Electrical, Electronics or allied disciplines with at least 60%</li><li>Age: 20–26 years</li></ul>`,
    languages: ["English"],
    level: "Graduate",
    icon: "Zap",
    faqs: [
      { q: "Which branch does EKT EE lead to?", a: "Aeronautical Engineering (Electronics) in the Ground Duty (Technical) branch." },
      { q: "Is there negative marking?", a: "Yes. One mark is deducted for each wrong answer." },
    ],
  },
  {
    name: "AFCAT EKT ME",
    slug: "afcat-ekt-me",
    group: "Indian Air Force",
    category: "defence-police",
    shortDescription: "Engineering Knowledge Test for Mechanical and Aeronautical candidates in the IAF technical branch.",
    overview: `<p>The Mechanical EKT is taken by engineering graduates applying to the Aeronautical Engineering (Mechanical) branch. It focuses on thermodynamics, mechanics and manufacturing.</p>`,
    examPattern: `<table><thead><tr><th>Section</th><th>Questions</th><th>Marks</th><th>Duration</th></tr></thead><tbody><tr><td>Mechanical Engineering</td><td>50</td><td>150</td><td>45 minutes</td></tr></tbody></table>`,
    syllabus: `<ul><li>Engineering mechanics, strength of materials</li><li>Thermodynamics, fluid mechanics</li><li>Theory of machines, machine design</li><li>Manufacturing and industrial engineering</li></ul>`,
    eligibility: `<ul><li>BE/BTech in Mechanical, Aeronautical or allied disciplines with at least 60%</li><li>Age: 20–26 years</li></ul>`,
    languages: ["English"],
    level: "Graduate",
    icon: "Cog",
    faqs: [
      { q: "Which branch does EKT ME lead to?", a: "Aeronautical Engineering (Mechanical) in the Ground Duty (Technical) branch." },
      { q: "How long is the test?", a: "45 minutes for 50 questions." },
    ],
  },
  {
    name: "Air Force X & Y Group",
    slug: "air-force-x-y-group",
    group: "Indian Air Force",
    category: "defence-police",
    shortDescription: "Airmen technical (X) and non-technical (Y) trades, now recruited through the Agniveervayu online test.",
    overview: `<p>X Group (technical) and Y Group (non-technical) airmen trades are now filled through the Agniveervayu intake. The online test follows the same Science, Other than Science and combined pattern, so preparation for either is identical.</p>`,
    examPattern: `<table><thead><tr><th>Section</th><th>Questions</th><th>Marks</th><th>Duration</th></tr></thead><tbody><tr><td>X Group: English, Physics, Maths</td><td>70</td><td>70</td><td>60 minutes</td></tr><tr><td>Y Group: English, RAGA</td><td>50</td><td>50</td><td>45 minutes</td></tr></tbody></table>`,
    syllabus: `<ul><li>English: grammar, vocabulary, comprehension</li><li>Physics and Mathematics at CBSE 10+2 level (X Group)</li><li>Reasoning and general awareness (Y Group)</li></ul>`,
    eligibility: `<ul><li>10+2 with at least 50% aggregate and 50% in English</li><li>X Group needs Physics and Maths, or a 3-year engineering diploma</li><li>Age: 17.5–21 years</li></ul>`,
    languages: ["English", "Hindi"],
    level: "10+2",
    icon: "Plane",
    faqs: [
      { q: "Are X and Y Group still separate exams?", a: "No. Both are covered by the Agniveervayu online test, using the Science and Other than Science papers." },
      { q: "What is the marking scheme?", a: "+1 for a correct answer and −0.25 for a wrong answer." },
    ],
  },
  {
    name: "Air Force Group C",
    slug: "air-force-group-c",
    group: "Indian Air Force",
    category: "defence-police",
    shortDescription: "Civilian Group C posts (MTS, LDC, Cook, Store Keeper and more) at Indian Air Force stations.",
    overview: `<p>Air Force stations recruit civilians for Group C posts such as Multi-Tasking Staff, Lower Division Clerk, Cook, Hindi Typist and Store Keeper. Selection is by a written test followed by a skill or practical test. The pattern below is indicative and can vary between stations.</p>`,
    examPattern: `<table><thead><tr><th>Section</th><th>Questions</th><th>Marks</th><th>Duration</th></tr></thead><tbody><tr><td>General Intelligence &amp; Reasoning</td><td>50</td><td>50</td><td rowspan="4">2 hours (combined)</td></tr><tr><td>Numerical Aptitude</td><td>25</td><td>25</td></tr><tr><td>General English</td><td>50</td><td>50</td></tr><tr><td>General Awareness</td><td>25</td><td>25</td></tr></tbody></table>`,
    syllabus: `<ul><li>Reasoning: analogies, series, coding, directions</li><li>Numerical aptitude: arithmetic at Class 10 level</li><li>General English and general awareness</li></ul>`,
    eligibility: `<ul><li>10th or 12th pass depending on the post</li><li>Age: 18–25 years, with relaxation as per government rules</li></ul>`,
    languages: ["English", "Hindi"],
    level: "10th / 10+2",
    icon: "Building2",
    faqs: [
      { q: "Is Group C a uniformed post?", a: "No. These are civilian posts at Air Force units." },
      { q: "How do I apply?", a: "Applications are usually sent offline to the respective Air Force station, as advertised in Employment News." },
    ],
  },
];
