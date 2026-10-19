// Synthetic records only. Money is integer baisa; timestamps are UTC.
// The seed is generated deterministically from compact fixture tables so every
// count, foreign key and ledger journal can be verified (tests/store-check.mjs).
export const DEMO_NOW = '2026-10-19T08:00:00Z';
const B = (ar, en) => ({ ar, en });
const persona = (role, user_id, record_id, ar, en, home) => ({ role, user_id, record_id, name: B(ar, en), home });
export const PERSONAS = {
  visitor: persona('visitor', null, null, 'زائر', 'Visitor', '/'),
  student: persona('student', 'U-S001', 'S-001', 'مريم البلوشية', 'Maryam Al Balushi', '/student'),
  guardian: persona('guardian', 'U-G001', 'G-001', 'عائشة البلوشية', 'Aisha Al Balushi', '/guardian'),
  teacher: persona('teacher', 'U-T001', 'T-001', 'أحمد الحارثي', 'Ahmed Al Harthi', '/teacher'),
  assistant: persona('assistant', 'U-A001', 'TM-001', 'نورة الهنائية', 'Noora Al Hinai', '/assistant'),
  admin_finance: persona('admin_finance', 'U-F001', null, 'خالد', 'Khalid', '/admin/finance'),
  admin_moderation: persona('admin_moderation', 'U-M001', null, 'سارة', 'Sara', '/admin'),
  super_admin: persona('super_admin', 'U-O001', null, 'مدير المنصة', 'Platform owner', '/admin'),
};
export const ENUMS = {
  teacher_application: ['draft_application', 'submitted', 'under_review', 'approved', 'rejected', 'more_info_required'],
  account: ['active', 'invited', 'suspended', 'deactivated'],
  course: ['Draft', 'Submitted', 'ChangesRequested', 'Published', 'Unpublished', 'Archived'],
  order: ['draft', 'pending', 'paid', 'failed', 'cancelled', 'partially_refunded', 'refunded'],
  payment: ['initiated', 'pending', 'succeeded', 'failed', 'refunded', 'partially_refunded'],
  earning: ['pending', 'available', 'reserved', 'in_payout', 'paid', 'adjusted'],
  payout_batch: ['Draft', 'UnderReview', 'Approved', 'Processing', 'Paid', 'Failed', 'Rejected'],
  conversation: ['open', 'assigned', 'waiting', 'resolved', 'escalated'],
  guardian_link: ['requested', 'pending_verification', 'verified', 'rejected', 'revoked'],
  access: ['active', 'expired', 'revoked'],
  enrollment: ['active', 'completed', 'suspended'],
  lesson_progress: ['not_started', 'in_progress', 'done'],
  content: ['draft', 'processing', 'ready', 'published', 'failed'],
  live: ['draft', 'scheduled', 'rescheduled', 'live', 'ended', 'recording_processing', 'recording_ready', 'recording_published', 'cancelled', 'failed'],
  submission: ['not_submitted', 'submitted', 'graded', 'released'],
  refund: ['requested', 'under_review', 'approved', 'processing', 'succeeded', 'rejected', 'failed'],
  dispute: ['open', 'under_review', 'won', 'lost'],
  task: ['open', 'in_progress', 'done'],
  delivery: ['queued', 'sent', 'failed', 'read'],
};

const T0 = '2026-09-01T08:00:00Z';
const YEAR_END = '2027-07-31T19:59:59Z';
const pad = (n, w = 3) => String(n).padStart(w, '0');
const stamp = (record, at = T0, updated = at) => ({ ...record, created_at: at, updated_at: updated });
const clone = value => JSON.parse(JSON.stringify(value));

// ---------------------------------------------------------------- taxonomy
const ORDINALS = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر', 'الحادي عشر', 'الثاني عشر'];
const CYCLES = {
  cycle1: B('الحلقة الأولى', 'Basic Education Cycle 1'),
  cycle2: B('الحلقة الثانية', 'Basic Education Cycle 2'),
  post_basic: B('التعليم ما بعد الأساسي', 'Post-Basic Education'),
};
const cycleOf = n => (n <= 4 ? 'cycle1' : n <= 10 ? 'cycle2' : 'post_basic');
const SUBJECTS = [
  ['math', 'MATH', 'الرياضيات', 'Mathematics', 'الأعداد والأشكال والأنماط، وطرق التفكير المنطقي في حل المسائل.', 'Numbers, shapes and patterns, with logical ways to solve problems.', 'chart', '#0F766E'],
  ['science', 'SCI', 'العلوم', 'Science', 'نلاحظ ونجرّب ونفسّر الظواهر من حولنا.', 'Observe, experiment and explain the world around us.', 'search', '#3F7D5A'],
  ['arabic', 'ARB', 'اللغة العربية', 'Arabic Language', 'القراءة والكتابة والتعبير بلغة سليمة وجميلة.', 'Reading, writing and expressing ideas in clear, beautiful Arabic.', 'book', '#8B5145'],
  ['english', 'ENG', 'اللغة الإنجليزية', 'English Language', 'مهارات الاستماع والتحدث والقراءة والكتابة.', 'Listening, speaking, reading and writing skills.', 'globe', '#425A91'],
  ['islamic', 'ISL', 'التربية الإسلامية', 'Islamic Education', 'القيم والعبادات والسيرة بأسلوب قريب من الطالب.', 'Values, worship and biography presented accessibly.', 'moon', '#665C8B'],
  ['social', 'SOC', 'الدراسات الاجتماعية', 'Social Studies', 'تاريخ عُمان وجغرافيتها وقيم المواطنة.', 'Oman’s history, geography and citizenship.', 'users', '#9B6E31'],
  ['physics', 'PHY', 'الفيزياء', 'Physics', 'القوى والطاقة والحركة بالتجربة والنمذجة.', 'Forces, energy and motion through experiment and modelling.', 'sun', '#265E7D'],
  ['chemistry', 'CHE', 'الكيمياء', 'Chemistry', 'المادة وتفاعلاتها في المختبر والحياة.', 'Matter and its reactions in the lab and in daily life.', 'filter', '#6E536E'],
];

// ---------------------------------------------------------------- people
// [id, ar, en, email local part, locale, status]
const USERS = [
  ['U-S001', 'مريم البلوشية', 'Maryam Al Balushi', 'maryam.balushi'],
  ['U-S002', 'سالم البلوشي', 'Salim Al Balushi', 'salim.balushi'],
  ['U-S003', 'حمد الرواحي', 'Hamad Al Rawahi', 'hamad.rawahi'],
  ['U-S004', 'فاطمة الكندية', 'Fatma Al Kindi', 'fatma.kindi'],
  ['U-S005', 'علي المعمري', 'Ali Al Maamari', 'ali.maamari'],
  ['U-S006', 'مزنة السيابية', 'Muzna Al Siyabi', 'muzna.siyabi', 'en'],
  ['U-G001', 'عائشة البلوشية', 'Aisha Al Balushi', 'aisha.balushi'],
  ['U-G002', 'يوسف البلوشي', 'Yusuf Al Balushi', 'yusuf.balushi'],
  ['U-T001', 'أحمد الحارثي', 'Ahmed Al Harthi', 'ahmed.harthi'],
  ['U-T002', 'خولة الشحية', 'Khawla Al Shihhi', 'khawla.shihhi', 'en'],
  ['U-T003', 'سعيد العبري', 'Said Al Abri', 'said.abri'],
  ['U-T004', 'بثينة الزدجالية', 'Buthaina Al Zadjali', 'buthaina.zadjali'],
  ['U-T005', 'مازن اليعقوبي', 'Mazin Al Yaqoubi', 'mazin.yaqoubi'],
  ['U-T006', 'أسماء الفارسية', 'Asma Al Farsi', 'asma.farsi'],
  ['U-A001', 'نورة الهنائية', 'Noora Al Hinai', 'noora.hinai'],
  ['U-A002', 'راشد الريامي', 'Rashid Al Riyami', 'rashid.riyami', 'ar', 'invited'],
  ['U-F001', 'خالد', 'Khalid', 'khalid.finance'],
  ['U-M001', 'سارة', 'Sara', 'sara.moderation'],
  ['U-O001', 'مدير المنصة', 'Platform owner', 'platform.owner'],
  ['U-F002', 'ناصر المنذري', 'Nasser Al Mundhiri', 'nasser.finance'],
];
const userName = id => { const u = USERS.find(x => x[0] === id); return B(u[1], u[2]); };
// [id, user, grade, interests, colour]
const STUDENTS = [
  ['S-001', 'U-S001', '4', ['math', 'science'], '#0F766E'],
  ['S-002', 'U-S002', '7', ['math', 'english'], '#425A91'],
  ['S-003', 'U-S003', '4', ['science', 'arabic'], '#9B6E31'],
  ['S-004', 'U-S004', '4', ['english', 'math'], '#8B5145'],
  ['S-005', 'U-S005', '11', ['physics', 'math'], '#265E7D'],
  ['S-006', 'U-S006', '12', ['english', 'chemistry'], '#6E536E'],
];
const TEACHERS = [
  { id: 'T-001', user: 'U-T001', status: 'approved', verification: 'verified',
    bio: B('معلم رياضيات وعلوم للحلقة الأولى والثانية منذ أكثر من اثني عشر عاماً. يحب أن يبدأ كل درس بسؤال من حياة الطالب اليومية في عُمان، ثم يبني الفكرة خطوة بخطوة.', 'A Cycle 1 and 2 mathematics and science teacher for over twelve years. He starts every lesson with a question from everyday life in Oman, then builds the idea step by step.'),
    credentials: [[B('بكالوريوس التربية — تخصص رياضيات', 'B.Ed. Mathematics Education'), true], [B('رخصة مزاولة التدريس', 'Teaching licence'), true]] },
  { id: 'T-002', user: 'U-T002', status: 'approved', verification: 'verified',
    bio: B('معلمة لغة إنجليزية لطلبة الدبلوم العام، تركز على الكتابة الأكاديمية ومهارات الاستعداد للجامعة.', 'An English teacher for General Diploma students, focused on academic writing and university readiness.'),
    credentials: [[B('ماجستير تدريس الإنجليزية لغير الناطقين بها', 'MA in TESOL'), true]] },
  { id: 'T-003', user: 'U-T003', status: 'approved', verification: 'verified',
    bio: B('معلم رياضيات وعلوم للمرحلة المتقدمة، يربط الجبر والفيزياء والكيمياء بتطبيقات من الهندسة والطاقة في السلطنة.', 'An upper-grade mathematics and science teacher linking algebra, physics and chemistry to engineering and energy in Oman.'),
    credentials: [[B('بكالوريوس الرياضيات', 'B.Sc. Mathematics'), true], [B('دبلوم تدريس العلوم', 'Diploma in Science Teaching'), true]] },
  { id: 'T-004', user: 'U-T004', status: 'submitted', verification: 'pending',
    bio: B('معلمة لغة عربية تقدمت للانضمام بخبرة في تنمية مهارات القراءة والتعبير.', 'An Arabic teacher applying to join, experienced in reading and writing skills.'),
    credentials: [[B('بكالوريوس اللغة العربية', 'B.A. Arabic Language'), false]] },
  { id: 'T-005', user: 'U-T005', status: 'more_info_required', verification: 'pending',
    bio: B('معلم فيزياء متقدم بطلب انضمام ينتظر استكمال الوثائق.', 'A physics teacher whose application awaits additional documents.'),
    credentials: [[B('بكالوريوس الفيزياء', 'B.Sc. Physics'), false]] },
  { id: 'T-006', user: 'U-T006', status: 'rejected', verification: 'rejected',
    bio: B('متقدمة سابقة لتدريس التربية الإسلامية.', 'A previous applicant for Islamic Education.'),
    credentials: [[B('شهادة تدريب قصيرة', 'Short training certificate'), false]] },
];
const QUALIFIED = {
  'T-001': [1, 2, 3, 4, 5, 6].flatMap(g => [`GS-${g}-math`, `GS-${g}-science`]),
  'T-002': ['GS-12-english'],
  'T-003': ['GS-7-math', 'GS-8-math', 'GS-9-math', 'GS-10-math', 'GS-11-math', 'GS-11-physics', 'GS-12-chemistry'],
};
const DECLARED = { 'T-004': ['GS-5-arabic', 'GS-6-arabic', 'GS-7-arabic'], 'T-005': ['GS-11-physics', 'GS-12-physics'], 'T-006': ['GS-3-islamic', 'GS-4-islamic'] };

// ---------------------------------------------------------------- catalog
// [id, grade, subject, owner, status, mode, price, title ar, title en, summary ar, summary en]
const COURSES = [
  ['C-001', 4, 'math', 'T-001', 'Published', 'hybrid', 30000, 'مغامرات الأعداد: رياضيات الصف الرابع', 'Number Adventures: Grade 4 Mathematics', 'الكسور والضرب والقياس بأمثلة من السوق والبيت العُماني، مع حصص مباشرة أسبوعية.', 'Fractions, multiplication and measurement through everyday Omani examples, with weekly live classes.'],
  ['C-002', 4, 'science', 'T-001', 'Published', 'recorded', 0, 'العلوم من حولنا — الصف الرابع', 'Science All Around Us · Grade 4', 'النباتات والماء والطقس عبر تجارب منزلية آمنة وممتعة.', 'Plants, water and weather through safe, enjoyable home experiments.'],
  ['C-003', 6, 'math', 'T-001', 'Draft', 'recorded', 30000, 'النسبة والتناسب بخطوات واضحة — الصف السادس', 'Ratio and Proportion Made Clear · Grade 6', 'نفهم النسبة والتناسب والنسبة المئوية من خلال الوصفات والخرائط والأسعار.', 'Understand ratio, proportion and percentages through recipes, maps and prices.'],
  ['C-004', 12, 'english', 'T-002', 'Published', 'recorded', 30000, 'الإنجليزية الأكاديمية والكتابة — الصف الثاني عشر', 'Academic English and Writing · Grade 12', 'كتابة المقال وتحليل النصوص ومهارات العرض استعداداً للجامعة.', 'Essay writing, text analysis and presentation skills for university readiness.'],
  ['C-005', 5, 'science', 'T-001', 'Published', 'recorded', 0, 'مختبر العلوم الصغير — الصف الخامس', 'Little Science Lab · Grade 5', 'المادة وحالاتها والدوائر الكهربائية البسيطة بأنشطة عملية وأوراق عمل.', 'States of matter and simple circuits through hands-on activities and worksheets.'],
  ['C-006', 1, 'math', 'T-001', 'Published', 'recorded', 20000, 'أصدقاء الأرقام — الصف الأول', 'Number Friends · Grade 1', 'العدّ والجمع والطرح حتى العشرين بالقصص والألعاب.', 'Counting, adding and subtracting to twenty with stories and games.'],
  ['C-007', 1, 'science', 'T-001', 'Published', 'recorded', 0, 'نكتشف الطبيعة — الصف الأول', 'Discovering Nature · Grade 1', 'حواسنا والحيوانات والنباتات في بيئة عُمان من الجبل إلى البحر.', 'Our senses, animals and plants in Oman from the mountains to the sea.'],
  ['C-008', 2, 'math', 'T-001', 'Draft', 'recorded', 20000, 'الجمع والطرح باللعب — الصف الثاني', 'Adding and Subtracting Through Play · Grade 2', 'القيمة المكانية والجمع والطرح حتى الألف بأنشطة مرحة.', 'Place value, addition and subtraction to one thousand through playful tasks.'],
  ['C-009', 2, 'science', 'T-001', 'Published', 'recorded', 20000, 'حواسنا والعالم — الصف الثاني', 'Our Senses and the World · Grade 2', 'نتعرف على الضوء والصوت والمواد من حولنا بالملاحظة والتجربة.', 'Explore light, sound and everyday materials through observation and experiment.'],
  ['C-010', 3, 'math', 'T-001', 'Published', 'recorded', 25000, 'جداول الضرب بثقة — الصف الثالث', 'Times Tables with Confidence · Grade 3', 'نحفظ جداول الضرب بفهم، ونطبقها في القسمة وحل المسائل.', 'Learn times tables with understanding and apply them to division and problem solving.'],
  ['C-011', 3, 'science', 'T-001', 'Published', 'recorded', 0, 'الكائنات الحية وبيئاتها — الصف الثالث', 'Living Things and Habitats · Grade 3', 'سلاسل الغذاء والموائل وكيف تتكيف الكائنات مع بيئتها.', 'Food chains, habitats and how living things adapt to their environment.'],
  ['C-012', 5, 'math', 'T-001', 'Submitted', 'live', 30000, 'الكسور العشرية في حياتنا — الصف الخامس', 'Decimals in Daily Life · Grade 5', 'الكسور العشرية والنقود والقياس في حصص مباشرة تفاعلية.', 'Decimals, money and measurement in interactive live classes.'],
  ['C-013', 6, 'science', 'T-001', 'Published', 'live', 30000, 'الطاقة والحركة — الصف السادس', 'Energy and Motion · Grade 6', 'أشكال الطاقة وتحولاتها والقوى والحركة بتجارب مباشرة.', 'Forms of energy, energy transfer, forces and motion through live experiments.'],
  ['C-014', 7, 'math', 'T-003', 'Submitted', 'live', 35000, 'مدخل إلى الجبر — الصف السابع', 'Introduction to Algebra · Grade 7', 'المتغيرات والعبارات الجبرية والمعادلات البسيطة.', 'Variables, algebraic expressions and simple equations.'],
  ['C-015', 7, 'math', 'T-003', 'Published', 'live', 35000, 'الهندسة والقياس — الصف السابع', 'Geometry and Measurement · Grade 7', 'الزوايا والمضلعات والمساحة والحجم بأمثلة من العمارة العُمانية.', 'Angles, polygons, area and volume with examples from Omani architecture.'],
  ['C-016', 8, 'math', 'T-003', 'Draft', 'live', 35000, 'المعادلات الخطية — الصف الثامن', 'Linear Equations · Grade 8', 'حل المعادلات الخطية وتمثيلها بيانياً وتطبيقها في مسائل حياتية.', 'Solve and graph linear equations and apply them to real-life problems.'],
  ['C-017', 8, 'math', 'T-003', 'Published', 'live', 35000, 'الإحصاء والاحتمالات — الصف الثامن', 'Statistics and Probability · Grade 8', 'جمع البيانات وتمثيلها وقراءة الاحتمالات بأمثلة من الرياضة والطقس.', 'Collect, represent and interpret data and probability with sport and weather examples.'],
  ['C-018', 9, 'math', 'T-003', 'ChangesRequested', 'hybrid', 40000, 'الدوال والتمثيل البياني — الصف التاسع', 'Functions and Graphs · Grade 9', 'مفهوم الدالة وتمثيلاتها وتحليل الرسوم البيانية.', 'The function concept, its representations and graph analysis.'],
  ['C-019', 9, 'math', 'T-003', 'Published', 'hybrid', 0, 'مراجعة أساسيات الرياضيات — الصف التاسع', 'Mathematics Essentials Review · Grade 9', 'مراجعة مجانية مركزة للأعداد والجبر والهندسة قبل الاختبارات.', 'A free, focused review of number, algebra and geometry before exams.'],
  ['C-020', 10, 'math', 'T-003', 'Unpublished', 'hybrid', 40000, 'حساب المثلثات — الصف العاشر', 'Trigonometry · Grade 10', 'النسب المثلثية وتطبيقاتها في القياس والملاحة.', 'Trigonometric ratios and their uses in measurement and navigation.'],
  ['C-021', 10, 'math', 'T-003', 'Published', 'hybrid', 40000, 'الهندسة التحليلية — الصف العاشر', 'Coordinate Geometry · Grade 10', 'المستقيمات والمسافات والميل في المستوى الإحداثي.', 'Lines, distance and gradient on the coordinate plane.'],
  ['C-022', 11, 'math', 'T-003', 'Archived', 'hybrid', 45000, 'التفاضل: مفاهيم أولى — الصف الحادي عشر', 'Calculus: First Concepts · Grade 11', 'النهايات ومعدل التغير ومفهوم المشتقة.', 'Limits, rates of change and the idea of the derivative.'],
  ['C-023', 11, 'physics', 'T-003', 'Published', 'hybrid', 0, 'الفيزياء: القوى والحركة — الصف الحادي عشر', 'Physics: Forces and Motion · Grade 11', 'قوانين نيوتن والحركة في بعد واحد بتجارب محاكاة.', 'Newton’s laws and one-dimensional motion with simulated experiments.'],
  ['C-024', 12, 'chemistry', 'T-003', 'Published', 'hybrid', 45000, 'الكيمياء العضوية المبسطة — الصف الثاني عشر', 'Organic Chemistry Simplified · Grade 12', 'المركبات العضوية وتسميتها وتفاعلاتها في الصناعة العُمانية.', 'Organic compounds, naming and reactions in Omani industry.'],
];
const SUBJECT_TEXT = {
  math: { name: B('الرياضيات', 'mathematics'), modules: [B('نبني الفهم', 'Building understanding'), B('نتدرب معاً', 'Practising together'), B('نطبق في حياتنا', 'Applying it in daily life')],
    lessons: [B('جولة في أفكار الوحدة', 'A tour of the unit'), B('المفردات والرموز الأساسية', 'Key vocabulary and symbols'), B('أمثلة محلولة خطوة بخطوة', 'Worked examples step by step'), B('استراتيجيات الحل', 'Problem-solving strategies'), B('أخطاء شائعة وكيف نتجنبها', 'Common mistakes and how to avoid them'), B('ورقة تدريب موجهة', 'Guided practice worksheet'), B('الرياضيات في السوق العُماني', 'Maths at the Omani souq')],
    outcomes: B('يشرح المفاهيم بلغته، ويختار استراتيجية مناسبة للحل، ويتحقق من معقولية الإجابة.', 'Explain concepts in their own words, choose a suitable strategy and check that answers make sense.') },
  science: { name: B('العلوم', 'science'), modules: [B('نلاحظ ونتساءل', 'Observe and wonder'), B('نجرب ونكتشف', 'Experiment and discover'), B('العلوم في بيئتنا', 'Science in our environment')],
    lessons: [B('ظاهرة من حولنا', 'A phenomenon around us'), B('مفاهيم علمية أساسية', 'Core science ideas'), B('كيف يعمل العلماء؟', 'How scientists work'), B('تجربة منزلية آمنة', 'A safe home experiment'), B('نسجل الملاحظات والبيانات', 'Recording observations and data'), B('نفسر النتائج', 'Explaining results'), B('من الجبال إلى البحر: أمثلة من عُمان', 'From mountains to sea: examples from Oman')],
    outcomes: B('يطرح أسئلة علمية، وينفذ تجربة آمنة، ويفسر النتائج بالأدلة.', 'Ask scientific questions, carry out a safe investigation and explain results with evidence.') },
  english: { name: B('اللغة الإنجليزية', 'English'), modules: [B('القراءة المتعمقة', 'Reading closely'), B('بناء المقال', 'Building an essay'), B('العرض والتواصل', 'Presenting and communicating')],
    lessons: [B('استراتيجيات القراءة النشطة', 'Active reading strategies'), B('تحليل النص والفكرة الرئيسية', 'Analysing texts and main ideas'), B('مفردات أكاديمية', 'Academic vocabulary'), B('جملة الأطروحة والتخطيط', 'Thesis statements and planning'), B('الفقرات والروابط', 'Paragraphs and linking words'), B('المراجعة والتحرير', 'Revising and editing'), B('العرض الشفهي بثقة', 'Presenting with confidence')],
    outcomes: B('يحلل النصوص الأكاديمية، ويكتب مقالاً منظماً، ويعرض أفكاره بوضوح.', 'Analyse academic texts, write an organised essay and present ideas clearly.') },
  physics: { name: B('الفيزياء', 'physics'), modules: [B('وصف الحركة', 'Describing motion'), B('القوى وقوانين نيوتن', 'Forces and Newton’s laws'), B('الفيزياء في التطبيق', 'Physics in practice')],
    lessons: [B('الإزاحة والسرعة', 'Displacement and velocity'), B('التسارع والرسوم البيانية', 'Acceleration and graphs'), B('معادلات الحركة', 'Equations of motion'), B('القانون الأول والقصور الذاتي', 'First law and inertia'), B('القوة والكتلة والتسارع', 'Force, mass and acceleration'), B('الفعل ورد الفعل', 'Action and reaction'), B('الفيزياء في الطرق والسلامة', 'Physics of road safety')],
    outcomes: B('يمثل الحركة بيانياً، ويطبق قوانين نيوتن، ويحل مسائل كمية.', 'Represent motion graphically, apply Newton’s laws and solve quantitative problems.') },
  chemistry: { name: B('الكيمياء', 'chemistry'), modules: [B('عالم الكربون', 'The world of carbon'), B('المجموعات الوظيفية', 'Functional groups'), B('الكيمياء والصناعة', 'Chemistry and industry')],
    lessons: [B('لماذا الكربون مميز؟', 'Why carbon is special'), B('الهيدروكربونات وتسميتها', 'Hydrocarbons and naming'), B('الصيغ والنماذج الجزيئية', 'Formulae and molecular models'), B('الكحولات والأحماض', 'Alcohols and acids'), B('الإسترات وروائحها', 'Esters and their scents'), B('أنواع التفاعلات العضوية', 'Types of organic reactions'), B('البتروكيماويات في عُمان', 'Petrochemicals in Oman')],
    outcomes: B('يسمي المركبات العضوية، ويتعرف المجموعات الوظيفية، ويربط التفاعلات بالصناعة.', 'Name organic compounds, identify functional groups and connect reactions to industry.') },
};
const QUIZ_COURSES = ['C-001', 'C-002', 'C-004', 'C-005', 'C-010', 'C-013', 'C-015', 'C-021'];
const QUESTION_BANK = {
  math: [
    [B('أي كسر يساوي النصف؟', 'Which fraction is equal to one half?'), [B('٢ / ٤', '2/4'), B('٢ / ٣', '2/3'), B('٣ / ٥', '3/5')]],
    [B('اشترت مريم ٣ علب في كل علبة ٦ تمرات. كم تمرة لديها؟', 'Maryam bought 3 boxes with 6 dates in each. How many dates does she have?'), [B('١٨', '18'), B('٩', '9'), B('١٢', '12')]],
    [B('ما أول خطوة جيدة لحل مسألة كلامية؟', 'What is a good first step for a word problem?'), [B('قراءة المعطيات وتحديد المطلوب', 'Read the information and identify the question'), B('تخمين الإجابة', 'Guess the answer'), B('نسخ الأرقام فقط', 'Copy the numbers only')]],
  ],
  science: [
    [B('ماذا تحتاج النبتة لتنمو؟', 'What does a plant need to grow?'), [B('الماء والضوء والهواء', 'Water, light and air'), B('الظلام فقط', 'Darkness only'), B('الملح', 'Salt')]],
    [B('ما الذي يجعل التجربة عادلة؟', 'What makes an investigation fair?'), [B('تغيير متغير واحد فقط', 'Changing only one variable'), B('تغيير كل شيء معاً', 'Changing everything at once'), B('عدم تسجيل النتائج', 'Not recording results')]],
    [B('عندما يتبخر الماء يتحول إلى…', 'When water evaporates it becomes…'), [B('بخار ماء', 'Water vapour'), B('جليد', 'Ice'), B('رمل', 'Sand')]],
  ],
  english: [
    [B('ما وظيفة جملة الأطروحة؟', 'What does a thesis statement do?'), [B('تعرض الفكرة الرئيسية للمقال', 'States the essay’s main argument'), B('تنهي المقال', 'Ends the essay'), B('تسرد المراجع', 'Lists references')]],
    [B('اختر رابطاً يدل على التضاد.', 'Choose a linking word that shows contrast.'), [B('However', 'However'), B('Moreover', 'Moreover'), B('Therefore', 'Therefore')]],
    [B('ما أفضل طريقة لمراجعة المسودة؟', 'What is the best way to revise a draft?'), [B('قراءتها بصوت مرتفع وتحسين الوضوح', 'Read it aloud and improve clarity'), B('حذف الفقرات كلها', 'Delete every paragraph'), B('عدم قراءتها', 'Never reread it')]],
  ],
};

function createCatalog() {
  const courses = [], modules = [], lessons = [], resources = [], quizzes = [], questions = [], assignments = [];
  COURSES.forEach(([id, grade, subject, owner, status, mode, price, tAr, tEn, sAr, sEn], index) => {
    const n = index + 1, text = SUBJECT_TEXT[subject], assessed = QUIZ_COURSES.includes(id);
    const historical = id === 'C-011';
    const course = {
      id, owner_teacher_id: owner, grade_subject_id: `GS-${grade}-${subject}`,
      academic_year_id: historical ? 'AY-001' : 'AY-002', semester_id: historical ? 'SEM-001' : 'SEM-003',
      track_id: ['physics', 'chemistry'].includes(subject) ? 'TR-002' : null,
      title: B(tAr, tEn), summary: B(sAr, sEn),
      description: B(`${sAr} صُممت الدورة لطلبة الصف ${ORDINALS[grade - 1]} وفق منهج وزارة التربية والتعليم، وتجمع بين الشرح القصير والتدريب الموجه والتغذية الراجعة من المعلم.`, `${sEn} Designed for Grade ${grade} learners following the Oman Ministry of Education curriculum, it combines short explanations, guided practice and teacher feedback.`),
      outcomes: clone(text.outcomes),
      prerequisites: B(grade === 1 ? 'لا توجد متطلبات سابقة؛ يكفي الفضول وحب التعلم.' : `إتقان أساسيات ${text.name.ar} في الصف ${ORDINALS[grade - 2]}.`, grade === 1 ? 'No prior requirements — just curiosity.' : `Comfort with Grade ${grade - 1} ${text.name.en} basics.`),
      language: subject === 'english' ? 'en' : 'ar', mode, status,
      price_type: price ? 'paid' : 'free', price_baisa: price,
      access_policy: { kind: 'academic_year', end_at: YEAR_END },
      support_summary: B(mode === 'recorded' ? 'أسئلة الدروس داخل الدورة بإشراف المعلم، والرد خلال يومي عمل.' : 'حصص مباشرة مجدولة وأسئلة الدروس داخل الدورة بإشراف المعلم.', mode === 'recorded' ? 'Teacher-moderated lesson Q&A inside the course, answered within two working days.' : 'Scheduled live classes plus teacher-moderated lesson Q&A inside the course.'),
      cover_seed: n, published_snapshot: null, pending_revision: null,
      review_feedback: status === 'ChangesRequested' ? B('يرجى إضافة مثال محلول في كل درس من الوحدة الثانية وتوضيح شروط الوصول.', 'Please add a worked example to each Module 2 lesson and clarify the access terms.') : B('', ''),
    };
    if (['Published', 'Unpublished', 'Archived'].includes(status)) {
      const { title, summary, description, outcomes, prerequisites, price_type, price_baisa, mode: m, access_policy } = course;
      course.published_snapshot = clone({ title, summary, description, outcomes, prerequisites, price_type, price_baisa, mode: m, access_policy });
    }
    courses.push(stamp(course, '2026-08-20T08:00:00Z', '2026-09-10T08:00:00Z'));
    for (let m = 1; m <= 3; m++) modules.push(stamp({ id: `MOD-${pad(3 * index + m)}`, course_id: id, title: clone(text.modules[m - 1]), position: m }));
    const types = ['video', 'reading', 'video', 'reading', 'video', 'reading', 'video', assessed ? 'quiz' : 'reading', assessed ? 'assignment' : 'video'];
    const titles = [...text.lessons, assessed ? B('اختبر فهمك', 'Check your understanding') : B('مراجعة الوحدة', 'Unit review'), assessed ? B('مهمة تطبيقية', 'Applied task') : B('خلاصة وخطوات قادمة', 'Summary and next steps')];
    types.forEach((type, j) => {
      const lessonId = `L-${pad(9 * index + j + 1)}`;
      const state = status === 'Draft' ? (j < 3 ? 'ready' : 'draft') : ['Submitted', 'ChangesRequested'].includes(status) ? 'ready' : 'published';
      lessons.push(stamp({
        id: lessonId, module_id: `MOD-${pad(3 * index + Math.floor(j / 3) + 1)}`, title: clone(titles[j]), type, position: (j % 3) + 1,
        duration_seconds: type === 'quiz' ? 600 : type === 'assignment' ? 900 : (type === 'video' ? 300 : 420) + ((n * 7 + j * 5) % 8) * 60,
        preview: j === 0, state,
        body: B(`في هذا الدرس من «${tAr}» نتناول: ${titles[j].ar}. نقرأ المثال، ونجرب بأنفسنا، ثم نلخص الفكرة في ثلاث جمل.`, `In this lesson from “${tEn}” we cover: ${titles[j].en}. Read the example, try it yourself, then summarise the idea in three sentences.`),
        transcript: type === 'video' ? B(`مرحباً بكم. سنتعرف اليوم على ${titles[j].ar} خطوة بخطوة، ونتوقف عند كل مثال لنفكر معاً.`, `Welcome. Today we explore ${titles[j].en.toLowerCase()} step by step, pausing at each example to think together.`) : B('', ''),
        simulated_media_ref: type === 'video' ? `demo-video-${lessonId}` : null,
        completion_basis: { video: 'video_90_percent', reading: 'manual', quiz: 'quiz_submit', assignment: 'assignment_submit' }[type],
      }));
    });
    [[2, 'worksheet'], [6, 'pdf']].forEach(([j, kind], k) => {
      const body = kind === 'worksheet'
        ? B(`ورقة عمل: ${titles[j - 1].ar}\n١. اقرأ المثال المحلول.\n٢. حل التمارين الثلاثة.\n٣. اكتب سؤالاً واحداً تود طرحه على المعلم.`, `Worksheet: ${titles[j - 1].en}\n1. Read the worked example.\n2. Solve the three exercises.\n3. Write one question for your teacher.`)
        : B(`ملخص الوحدة: ${text.modules[1].ar}\nأهم المفاهيم والأمثلة في صفحة واحدة للمراجعة.`, `Unit summary: ${text.modules[1].en}\nKey ideas and examples on one page for revision.`);
      resources.push(stamp({ id: `RES-${pad(2 * index + k + 1)}`, lesson_id: `L-${pad(9 * index + j)}`, title: kind === 'worksheet' ? B('ورقة عمل للتدريب', 'Practice worksheet') : B('ملخص الوحدة للمراجعة', 'Unit revision summary'), kind, filename: `${kind}-${id}-${k + 1}.txt`, byte_size: new TextEncoder().encode(body.ar + body.en).length, body }));
    });
    if (assessed) {
      const q = QUIZ_COURSES.indexOf(id) + 1, bank = QUESTION_BANK[subject] ?? QUESTION_BANK.math;
      const questionIds = bank.map((_, k) => `QUESTION-${pad(3 * (q - 1) + k + 1)}`);
      bank.forEach(([prompt, choices], k) => questions.push(stamp({ id: questionIds[k], quiz_id: `QUIZ-${pad(q)}`, version: 1, prompt: clone(prompt), choices: choices.map((text, c) => ({ id: 'abc'[c], text: clone(text) })), correct_choice_id: 'a', points: 10 })));
      quizzes.push(stamp({ id: `QUIZ-${pad(q)}`, course_id: id, lesson_id: `L-${pad(9 * index + 8)}`, title: B('اختبر فهمك', 'Check your understanding'), pass_score: 60, attempt_limit: 2, question_ids: questionIds }));
      assignments.push(stamp({ id: `ASG-${pad(q)}`, course_id: id, lesson_id: `L-${pad(9 * index + 9)}`, title: B('مهمة تطبيقية', 'Applied task'), instructions: B(`طبّق ما تعلمته في «${tAr}» على موقف من حياتك، واشرح خطواتك في فقرة قصيرة.`, `Apply what you learned in “${tEn}” to a situation from your life and explain your steps in a short paragraph.`), due_at: `2026-10-${pad(22 + (q % 6), 2)}T15:59:59Z`, max_score: 100 }));
    }
  });
  return { courses, modules, lessons, resources, quizzes, questions, assignments };
}
const lessonOf = (courseId, j) => `L-${pad(9 * (Number(courseId.slice(2)) - 1) + j)}`;

// ---------------------------------------------------------------- commerce
// [order, buyer, state, at, items: [item, course, beneficiary]]
const ORDERS = [
  ['ORD-001', 'U-S003', 'paid', '2026-09-03T10:15:00Z', [['OI-001', 'C-001', 'S-003']]],
  ['ORD-002', 'U-G001', 'paid', '2026-09-20T16:40:00Z', [['OI-002', 'C-015', 'S-002'], ['OI-003', 'C-010', 'S-001']]],
  ['ORD-003', 'U-S006', 'paid', '2026-09-04T09:05:00Z', [['OI-004', 'C-004', 'S-006']]],
  ['ORD-004', 'U-G001', 'paid', '2026-09-02T18:20:00Z', [['OI-005', 'C-001', 'S-004']]],
  ['ORD-005', 'U-S006', 'pending', '2026-10-18T17:30:00Z', [['OI-006', 'C-024', 'S-006']]],
  ['ORD-006', 'U-G001', 'failed', '2026-09-15T19:10:00Z', [['OI-007', 'C-015', 'S-002']]],
  ['ORD-007', 'U-S005', 'refunded', '2026-09-01T12:00:00Z', [['OI-008', 'C-022', 'S-005']]],
  ['ORD-008', 'U-S005', 'partially_refunded', '2026-09-05T12:30:00Z', [['OI-009', 'C-021', 'S-005']]],
];
// [transaction, order, attempt, state]
const PAYMENTS = [
  ['PAY-001', 'ORD-001', 1, 'succeeded'], ['PAY-002', 'ORD-002', 1, 'succeeded'], ['PAY-003', 'ORD-003', 1, 'succeeded'],
  ['PAY-004', 'ORD-004', 1, 'succeeded'], ['PAY-005', 'ORD-005', 1, 'pending'], ['PAY-006', 'ORD-006', 1, 'failed'],
  ['PAY-007', 'ORD-006', 2, 'failed'], ['PAY-008', 'ORD-007', 1, 'refunded'], ['PAY-009', 'ORD-008', 1, 'partially_refunded'],
];
// [allocation, item, state, batch|null]; every settled sale has exactly one allocation.
const ALLOCATIONS = [
  ['EA-AVAILABLE', 'OI-001', 'available', null],
  ['EA-002', 'OI-002', 'reserved', 'PB-003'],
  ['EA-003', 'OI-003', 'pending', null],
  ['EA-004', 'OI-004', 'in_payout', 'PB-004'],
  ['EA-005', 'OI-005', 'reserved', 'PB-002'],
  ['EA-006', 'OI-008', 'paid', 'PB-005'],
  ['EA-007', 'OI-009', 'reserved', 'PB-006'],
];
// [batch, state, preparer, approver, teacher, account, allocation|null, submitted, approved]
const BATCHES = [
  ['PB-001', 'Draft', 'U-F002', null, 'T-001', 'PA-001', null, null, null],
  ['PB-002', 'UnderReview', 'U-F002', null, 'T-001', 'PA-001', 'EA-005', '2026-10-15T07:00:00Z', null],
  ['PB-003', 'Approved', 'U-F001', 'U-O001', 'T-003', 'PA-003', 'EA-002', '2026-10-14T07:00:00Z', '2026-10-17T09:00:00Z'],
  ['PB-004', 'Processing', 'U-F002', 'U-F001', 'T-002', 'PA-002', 'EA-004', '2026-10-10T07:00:00Z', '2026-10-12T09:00:00Z'],
  ['PB-005', 'Paid', 'U-F002', 'U-O001', 'T-003', 'PA-003', 'EA-006', '2026-09-25T07:00:00Z', '2026-09-27T09:00:00Z'],
  ['PB-006', 'Failed', 'U-F001', 'U-O001', 'T-003', 'PA-003', 'EA-007', '2026-10-01T07:00:00Z', '2026-10-03T09:00:00Z'],
];

function createCommerce(courses) {
  const course = id => courses.find(c => c.id === id);
  const rules = [
    stamp({ id: 'CR-001', scope: 'default', teacher_id: null, course_id: null, version: 1, rate_bps: 2000, active_from: '2026-01-01T00:00:00Z', active: true, label: B('النسبة الافتراضية التوضيحية', 'Illustrative default rate') }),
    stamp({ id: 'CR-002', scope: 'teacher', teacher_id: 'T-002', course_id: null, version: 1, rate_bps: 1500, active_from: '2026-01-01T00:00:00Z', active: true, label: B('استثناء توضيحي للمعلمة', 'Illustrative teacher override') }),
    stamp({ id: 'CR-003', scope: 'campaign', teacher_id: null, course_id: 'C-019', version: 1, rate_bps: 1000, active_from: '2027-01-01T00:00:00Z', active: false, label: B('حملة غير مفعلة', 'Inactive campaign') }),
  ];
  const snapshotFor = (teacherId, base) => {
    const rule = teacherId === 'T-002' ? rules[1] : rules[0];
    const platform = Math.round(base * rule.rate_bps / 10000);
    return { rule_id: rule.id, version: rule.version, base_baisa: base, rate_bps: rule.rate_bps, platform_baisa: platform, teacher_baisa: base - platform };
  };
  const orders = [], items = [];
  for (const [id, buyer, state, at, lines] of ORDERS) {
    let total = 0;
    for (const [itemId, courseId, beneficiary] of lines) {
      const c = course(courseId); total += c.price_baisa;
      items.push(stamp({ id: itemId, order_id: id, course_id: courseId, beneficiary_student_id: beneficiary, title_snapshot: clone(c.title), owner_teacher_id_snapshot: c.owner_teacher_id, price_baisa: c.price_baisa, discount_baisa: 0, tax_baisa: 0, total_baisa: c.price_baisa, commission_snapshot: snapshotFor(c.owner_teacher_id, c.price_baisa) }, at));
    }
    orders.push(stamp({ id, buyer_user_id: buyer, state, currency: 'OMR', subtotal_baisa: total, discount_baisa: 0, tax_baisa: 0, total_baisa: total }, at));
  }
  const order = id => orders.find(o => o.id === id), item = id => items.find(i => i.id === id);
  const transactions = PAYMENTS.map(([id, orderId, attempt, state]) => {
    const o = order(orderId), at = new Date(Date.parse(o.created_at) + attempt * 120000).toISOString().replace('.000Z', 'Z');
    return stamp({ id, order_id: orderId, provider_ref: `DEMO-PAY-${id.slice(4)}`, attempt_no: attempt, state, amount_baisa: o.total_baisa, currency: 'OMR', confirmed_at: ['pending', 'failed'].includes(state) ? null : at, verified_demo: true }, at);
  });
  const events = transactions.map((tx, k) => ({
    id: `PE-${pad(k + 1)}`, event_id: `DEMO-EVENT-${pad(k + 1)}`, payment_transaction_id: tx.id,
    payload: { order_id: tx.order_id, beneficiary_ids: items.filter(i => i.order_id === tx.order_id).map(i => i.beneficiary_student_id), amount_baisa: tx.amount_baisa, currency: 'OMR', outcome: ['refunded', 'partially_refunded'].includes(tx.state) ? 'succeeded' : tx.state },
    verified_demo: true, processed_at: tx.created_at, created_at: tx.created_at,
  }));

  // Ledger: liabilities are credit-normal; every journal balances (debits == credits).
  const ledger = [];
  const journal = (journalId, at, sourceType, sourceId, teacherId, lines, reversalOf = null) => {
    for (const [account, debit, credit] of lines) ledger.push({ id: `LE-${pad(ledger.length + 1)}`, journal_id: journalId, account, teacher_id: teacherId, source_type: sourceType, source_id: sourceId, debit_baisa: debit, credit_baisa: credit, currency: 'OMR', created_at: at, reversal_of: reversalOf });
  };
  const allocations = [], batchOf = {};
  for (const [, , , , , , allocationId] of BATCHES) if (allocationId) batchOf[allocationId] = BATCHES.find(b => b[6] === allocationId);
  const lifecycle = ['pending', 'available', 'reserved', 'in_payout', 'paid'];
  for (const [id, itemId, state, batchId] of ALLOCATIONS) {
    const it = item(itemId), snap = it.commission_snapshot, teacher = it.owner_teacher_id_snapshot, amount = snap.teacher_baisa, at = it.created_at;
    const eligible = new Date(Date.parse(at) + 7 * 864e5).toISOString().replace('.000Z', 'Z');
    allocations.push(stamp({ id, order_item_id: itemId, teacher_id: teacher, snapshot: clone(snap), amount_baisa: amount, state, original_allocation_id: null, hold_reason: state === 'pending' ? 'demo_hold_until_manual_release' : '', eligible_at: eligible }, at));
    journal(`J-SALE-${itemId}`, at, 'order_item', itemId, teacher, [['provider_clearing', snap.base_baisa, 0], ['platform_commission', 0, snap.platform_baisa], ['teacher_pending', 0, amount]]);
    // The failed batch reached in_payout before its transfer was reversed back to reserved.
    const reached = lifecycle.indexOf(batchId === 'PB-006' ? 'in_payout' : state);
    if (reached >= 1) journal(`J-RELEASE-${id}`, eligible, 'earning_allocation', id, teacher, [['teacher_pending', amount, 0], ['teacher_available', 0, amount]]);
    const batch = batchOf[id], payoutId = batch ? `TP-${batch[0].slice(3)}` : null;
    if (reached >= 2) journal(`J-RESERVE-${id}`, batch[7], 'earning_allocation', id, teacher, [['teacher_available', amount, 0], ['teacher_reserved', 0, amount]]);
    if (reached >= 3) journal(`J-PROCESS-${id}`, batch[8], 'teacher_payout', payoutId, teacher, [['teacher_reserved', amount, 0], ['teacher_in_payout', 0, amount]]);
    if (state === 'paid') journal(`J-PAID-${id}`, '2026-09-30T10:00:00Z', 'teacher_payout', payoutId, teacher, [['teacher_in_payout', amount, 0], ['provider_clearing', 0, amount]]);
    if (batchId === 'PB-006') {
      // Failed transfer: a new reversing journal returns funds to reserved; never marked paid.
      const reversed = ledger.filter(e => e.journal_id === `J-PROCESS-${id}`);
      journal(`J-REVERSE-${id}`, '2026-10-04T08:00:00Z', 'teacher_payout', payoutId, teacher, [['teacher_in_payout', amount, 0], ['teacher_reserved', 0, amount]], reversed[1].id);
    }
  }
  // Refund after payout: original paid allocation stays paid; a linked negative allocation records recovery.
  const refunded = allocations.find(a => a.id === 'EA-006');
  allocations.push(stamp({ id: 'EA-008', order_item_id: 'OI-008', teacher_id: refunded.teacher_id, snapshot: clone(refunded.snapshot), amount_baisa: -refunded.amount_baisa, state: 'adjusted', original_allocation_id: 'EA-006', hold_reason: 'recovery_after_payout', eligible_at: '2026-10-05T09:00:00Z' }, '2026-10-05T09:00:00Z'));
  journal('J-REFUND-REF-001', '2026-10-05T09:00:00Z', 'adjustment', 'ADJ-001', refunded.teacher_id, [['platform_commission', refunded.snapshot.platform_baisa, 0], ['teacher_recovery', refunded.amount_baisa, 0], ['provider_clearing', 0, refunded.snapshot.base_baisa]]);
  const chargeback = 10000, chargebackPlatform = Math.round(chargeback * 2000 / 10000);
  journal('J-DISPUTE-DIS-001', '2026-09-28T09:00:00Z', 'adjustment', 'ADJ-002', 'T-003', [['platform_commission', chargebackPlatform, 0], ['teacher_recovery', chargeback - chargebackPlatform, 0], ['provider_clearing', 0, chargeback]]);

  const accounts = [['PA-001', 'T-001', 'أحمد الحارثي', 'Ahmed Al Harthi', '0001'], ['PA-002', 'T-002', 'خولة الشحية', 'Khawla Al Shihhi', '0002'], ['PA-003', 'T-003', 'سعيد العبري', 'Said Al Abri', '0003']]
    .map(([id, teacher, ar, en, tail]) => stamp({ id, teacher_id: teacher, beneficiary_name: B(ar, en), masked_iban: `OM•• •••• •••• DEMO ${tail}`, verification_state: 'verified', verified_by: 'U-F002', changed_at: '2026-08-25T08:00:00Z' }, '2026-08-25T08:00:00Z'));
  const batches = [], payouts = [];
  for (const [id, state, preparer, approver, teacher, accountId, allocationId, submitted, approved] of BATCHES) {
    const amount = allocationId ? allocations.find(a => a.id === allocationId).amount_baisa : 0, account = accounts.find(a => a.id === accountId);
    const transfer = ['Processing', 'Paid', 'Failed'].includes(state) ? [`DEMO-TRANSFER-${id.slice(3)}`] : [];
    batches.push(stamp({ id, state, prepared_by: preparer, approved_by: approver, period_label: B(state === 'Paid' ? 'سبتمبر ٢٠٢٦' : 'أكتوبر ٢٠٢٦', state === 'Paid' ? 'September 2026' : 'October 2026'), allocation_ids: allocationId ? [allocationId] : [], total_baisa: amount, destination_snapshots: [{ payout_account_id: account.id, teacher_id: teacher, beneficiary_name: clone(account.beneficiary_name), masked_iban: account.masked_iban, verification_state: account.verification_state }], submitted_at: submitted, approved_at: approved, failure_reason: state === 'Failed' ? 'simulated_beneficiary_name_mismatch' : '', transfer_attempt_ids: transfer }, submitted ?? '2026-10-18T07:00:00Z'));
    payouts.push(stamp({ id: `TP-${id.slice(3)}`, batch_id: id, teacher_id: teacher, payout_account_id: accountId, allocation_ids: allocationId ? [allocationId] : [], amount_baisa: amount, state, provider_ref: transfer[0] ?? null, reconciled_at: state === 'Paid' ? '2026-09-30T12:00:00Z' : null }, submitted ?? '2026-10-18T07:00:00Z'));
  }
  const refunds = [
    stamp({ id: 'REF-001', order_id: 'ORD-007', order_item_id: 'OI-008', amount_baisa: 45000, reason: B('سُجّل الطالب في الدورة بالخطأ قبل أرشفتها.', 'The learner was enrolled by mistake before the course was archived.'), state: 'succeeded', requested_by: 'U-S005', approved_by: 'U-F002', access_effect: 'revoke_purchase_grant', adjustment_id: 'ADJ-001' }, '2026-10-03T09:00:00Z', '2026-10-05T09:00:00Z'),
    stamp({ id: 'REF-002', order_id: 'ORD-003', order_item_id: 'OI-004', amount_baisa: 30000, reason: B('تطلب الطالبة الاسترداد لتغيير جدولها الدراسي.', 'The learner requests a refund because her timetable changed.'), state: 'requested', requested_by: 'U-S006', approved_by: null, access_effect: 'revoke_purchase_grant', adjustment_id: null }, '2026-10-17T11:00:00Z'),
  ];
  const disputes = [stamp({ id: 'DIS-001', order_item_id: 'OI-009', state: 'lost', reason: B('اعتراض جزئي تجريبي من مزود الدفع على مبلغ ١٠٫٠٠٠ ر.ع.', 'Simulated partial chargeback of OMR 10.000 by the payment provider.'), held_allocation_ids: [] }, '2026-09-20T09:00:00Z', '2026-09-28T09:00:00Z')];
  const adjustments = [
    stamp({ id: 'ADJ-001', original_allocation_id: 'EA-006', refund_id: 'REF-001', dispute_id: null, signed_amount_baisa: -refunded.amount_baisa, reason: B('استرداد بعد الصرف: مبلغ مستحق الاسترجاع من المعلم.', 'Refund after payout: amount recoverable from the teacher.'), journal_id: 'J-REFUND-REF-001' }, '2026-10-05T09:00:00Z'),
    stamp({ id: 'ADJ-002', original_allocation_id: 'EA-007', refund_id: null, dispute_id: 'DIS-001', signed_amount_baisa: -(chargeback - chargebackPlatform), reason: B('حصة المعلم من الاعتراض الجزئي الخاسر.', 'Teacher share of the lost partial chargeback.'), journal_id: 'J-DISPUTE-DIS-001' }, '2026-09-28T09:00:00Z'),
  ];
  return { commission_rules: rules, orders, order_items: items, payment_transactions: transactions, provider_events: events, earning_allocations: allocations, financial_ledger_entries: ledger, teacher_payout_accounts: accounts, payout_batches: batches, teacher_payouts: payouts, refunds, disputes, adjustments };
}

// ---------------------------------------------------------------- learning
// [enrollment, student, course, status, started, historical grade, grants: [id, origin, source, start, end, status]]
const ENROLLMENTS = [
  ['EN-001', 'S-001', 'C-002', 'active', '2026-09-06T15:00:00Z', '4', [['AG-001', 'complimentary', null, '2026-09-06T15:00:00Z', YEAR_END, 'active']]],
  ['EN-002', 'S-001', 'C-010', 'active', '2026-09-12T15:00:00Z', '4', [['AG-014', 'admin_grant', null, '2026-09-12T15:00:00Z', YEAR_END, 'revoked'], ['AG-002', 'one_time_purchase', 'OI-003', '2026-09-20T16:42:00Z', YEAR_END, 'active']]],
  ['EN-003', 'S-001', 'C-011', 'active', '2025-09-10T15:00:00Z', '3', [['AG-003', 'complimentary', null, '2025-09-10T15:00:00Z', '2026-07-31T19:59:59Z', 'expired']]],
  ['EN-004', 'S-002', 'C-015', 'active', '2026-09-20T16:42:00Z', '7', [['AG-004', 'one_time_purchase', 'OI-002', '2026-09-20T16:42:00Z', YEAR_END, 'active']]],
  ['EN-005', 'S-002', 'C-017', 'active', '2026-09-22T08:00:00Z', '7', [['AG-005', 'admin_grant', null, '2026-09-22T08:00:00Z', YEAR_END, 'active']]],
  ['EN-006', 'S-003', 'C-001', 'active', '2026-09-03T10:17:00Z', '4', [['AG-006', 'one_time_purchase', 'OI-001', '2026-09-03T10:17:00Z', YEAR_END, 'active']]],
  ['EN-007', 'S-003', 'C-002', 'active', '2026-09-04T16:00:00Z', '4', [['AG-007', 'complimentary', null, '2026-09-04T16:00:00Z', YEAR_END, 'active']]],
  ['EN-008', 'S-004', 'C-001', 'active', '2026-08-25T16:00:00Z', '4', [['AG-013', 'admin_grant', null, '2026-08-25T16:00:00Z', '2026-09-01T19:59:59Z', 'expired'], ['AG-008', 'one_time_purchase', 'OI-005', '2026-09-02T18:22:00Z', YEAR_END, 'active']]],
  ['EN-009', 'S-004', 'C-002', 'active', '2026-09-05T16:00:00Z', '4', [['AG-009', 'complimentary', null, '2026-09-05T16:00:00Z', YEAR_END, 'active']]],
  ['EN-010', 'S-005', 'C-022', 'suspended', '2026-09-01T12:02:00Z', '11', [['AG-010', 'one_time_purchase', 'OI-008', '2026-09-01T12:02:00Z', YEAR_END, 'revoked']]],
  ['EN-011', 'S-005', 'C-021', 'active', '2026-09-05T12:32:00Z', '11', [['AG-011', 'one_time_purchase', 'OI-009', '2026-09-05T12:32:00Z', YEAR_END, 'active']]],
  ['EN-012', 'S-006', 'C-004', 'active', '2026-09-04T09:07:00Z', '12', [['AG-012', 'one_time_purchase', 'OI-004', '2026-09-04T09:07:00Z', YEAR_END, 'active']]],
];
// [enrollment, lesson position, status]
const PROGRESS = [
  ['EN-001', 1, 'done'], ['EN-001', 2, 'done'], ['EN-001', 3, 'in_progress'], ['EN-001', 4, 'done'],
  ['EN-002', 1, 'done'], ['EN-002', 2, 'in_progress'],
  ['EN-003', 1, 'done'], ['EN-003', 2, 'done'], ['EN-003', 3, 'done'],
  ['EN-004', 1, 'done'], ['EN-004', 2, 'done'], ['EN-004', 3, 'in_progress'],
  ['EN-005', 1, 'done'],
  ['EN-006', 1, 'done'], ['EN-006', 2, 'done'], ['EN-006', 3, 'in_progress'],
  ['EN-007', 1, 'done'],
  ['EN-008', 1, 'done'], ['EN-008', 2, 'done'],
  ['EN-009', 1, 'done'], ['EN-009', 2, 'in_progress'],
  ['EN-011', 1, 'done'],
  ['EN-012', 1, 'done'], ['EN-012', 2, 'done'],
];
// [session, course, status, start, title ar, title en]
const SESSIONS = [
  ['LS-001', 'C-001', 'scheduled', '2026-10-20T13:00:00Z', 'حصة مباشرة: الكسور المتكافئة', 'Live class: equivalent fractions'],
  ['LS-002', 'C-001', 'recording_published', '2026-10-06T13:00:00Z', 'حصة مباشرة: الضرب في عددين', 'Live class: two-digit multiplication'],
  ['LS-003', 'C-002', 'recording_ready', '2026-10-08T14:00:00Z', 'لقاء علمي: دورة الماء', 'Science meet-up: the water cycle'],
  ['LS-004', 'C-002', 'ended', '2026-10-15T14:00:00Z', 'لقاء علمي: النباتات من حولنا', 'Science meet-up: plants around us'],
  ['LS-005', 'C-001', 'live', '2026-10-19T07:30:00Z', 'حصة مراجعة مباشرة: القياس', 'Live review: measurement'],
  ['LS-006', 'C-015', 'recording_processing', '2026-10-13T15:00:00Z', 'حصة مباشرة: الزوايا والمضلعات', 'Live class: angles and polygons'],
  ['LS-007', 'C-015', 'rescheduled', '2026-10-22T15:00:00Z', 'حصة مباشرة: المساحة والحجم', 'Live class: area and volume'],
  ['LS-008', 'C-017', 'cancelled', '2026-10-21T15:00:00Z', 'حصة مباشرة: تمثيل البيانات', 'Live class: representing data'],
  ['LS-009', 'C-021', 'failed', '2026-10-16T16:00:00Z', 'حصة مباشرة: معادلة المستقيم', 'Live class: equation of a line'],
  ['LS-010', 'C-022', 'recording_processing', '2026-09-15T16:00:00Z', 'حصة مباشرة: معدل التغير', 'Live class: rates of change'],
  ['LS-011', 'C-021', 'recording_published', '2026-10-02T16:00:00Z', 'حصة مباشرة: المسافة والميل', 'Live class: distance and gradient'],
  ['LS-012', 'C-004', 'recording_ready', '2026-10-09T15:00:00Z', 'ورشة كتابة مباشرة: المقدمة القوية', 'Live writing workshop: strong introductions'],
];
const ATTENDANCE = [['LS-002', 'S-004', 55], ['LS-002', 'S-003', 48], ['LS-003', 'S-001', 50], ['LS-003', 'S-004', 42], ['LS-003', 'S-003', 0], ['LS-004', 'S-001', 0], ['LS-004', 'S-004', 57], ['LS-005', 'S-004', 25], ['LS-006', 'S-002', 52], ['LS-010', 'S-005', 58], ['LS-011', 'S-005', 0], ['LS-012', 'S-006', 60]];
const RECORDINGS = [['REC-001', 'LS-002', 'published'], ['REC-002', 'LS-003', 'ready'], ['REC-003', 'LS-006', 'processing'], ['REC-004', 'LS-010', 'processing'], ['REC-005', 'LS-011', 'published'], ['REC-006', 'LS-012', 'ready']];

function createLearning(catalog) {
  const course = id => catalog.courses.find(c => c.id === id);
  const enrollments = [], grants = [];
  for (const [id, student, courseId, status, started, grade, grantRows] of ENROLLMENTS) {
    enrollments.push(stamp({ id, student_id: student, course_id: courseId, status, started_at: started, historical_grade_id: grade }, started, status === 'suspended' ? '2026-10-05T09:00:00Z' : started));
    for (const [grantId, origin, source, start, end, state] of grantRows) grants.push(stamp({ id: grantId, student_id: student, course_id: courseId, enrollment_id: id, origin, source_id: source, starts_at: start, ends_at: end, status: state }, start, state === 'revoked' ? '2026-10-05T09:00:00Z' : start));
  }
  grants.sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
  const lesson_progress = PROGRESS.map(([enrollmentId, position, status], k) => {
    const e = enrollments.find(x => x.id === enrollmentId), lessonId = lessonOf(e.course_id, position), lesson = catalog.lessons.find(l => l.id === lessonId);
    const at = new Date(Date.parse('2026-10-01T15:00:00Z') + k * 86400000 / 3).toISOString().replace('.000Z', 'Z');
    return stamp({ id: `LP-${pad(k + 1)}`, enrollment_id: enrollmentId, student_id: e.student_id, lesson_id: lessonId, status, position_seconds: status === 'done' ? lesson.duration_seconds : Math.round(lesson.duration_seconds * 0.4), completion_basis: lesson.completion_basis, completed_at: status === 'done' ? at : null }, at);
  });
  const live_sessions = SESSIONS.map(([id, courseId, status, start, ar, en]) => stamp({ id, course_id: courseId, host_teacher_id: course(courseId).owner_teacher_id, title: B(ar, en), starts_at: start, ends_at: new Date(Date.parse(start) + 3600000).toISOString().replace('.000Z', 'Z'), timezone: 'Asia/Muscat', status, provider_ref: 'demo', join_generation: status === 'rescheduled' ? 2 : 1, recording_disclosure: B('قد تُسجَّل هذه الحصة التجريبية ليشاهدها المسجلون في الدورة فقط.', 'This simulated class may be recorded for enrolled learners only.') }, '2026-09-10T08:00:00Z'));
  const attendance = ATTENDANCE.map(([sessionId, student, minutes], k) => {
    const s = live_sessions.find(x => x.id === sessionId), present = minutes > 0;
    const joined = present ? new Date(Date.parse(s.starts_at) + 120000).toISOString().replace('.000Z', 'Z') : null;
    return stamp({ id: `ATT-${pad(k + 1)}`, live_session_id: sessionId, student_id: student, joined_at: joined, left_at: present && s.status !== 'live' ? new Date(Date.parse(joined) + minutes * 60000).toISOString().replace('.000Z', 'Z') : null, minutes, status: present ? 'present' : 'absent' }, s.starts_at);
  });
  const recordings = RECORDINGS.map(([id, sessionId, state]) => { const s = live_sessions.find(x => x.id === sessionId); return stamp({ id, live_session_id: sessionId, course_id: s.course_id, title: B(`تسجيل: ${s.title.ar}`, `Recording: ${s.title.en}`), state, duration_seconds: 3300, published_at: state === 'published' ? s.ends_at : null, simulated_media_ref: `demo-recording-${id}` }, s.ends_at); });
  const quizFor = courseId => catalog.quizzes.find(q => q.course_id === courseId);
  const attemptRows = [['S-001', 'C-002', ['a', 'a', 'b']], ['S-001', 'C-010', ['a', 'b', 'a']], ['S-002', 'C-015', ['a', 'a', 'a']], ['S-003', 'C-001', ['a', 'a', 'a']], ['S-004', 'C-001', ['b', 'a', 'a']], ['S-006', 'C-004', ['a', 'a', 'a']]];
  const attempts = attemptRows.map(([student, courseId, picks], k) => {
    const quiz = quizFor(courseId), snapshot = quiz.question_ids.map(id => clone(catalog.questions.find(q => q.id === id)));
    const answers = Object.fromEntries(quiz.question_ids.map((id, i) => [id, picks[i]]));
    const score = Math.round(100 * snapshot.filter(q => answers[q.id] === q.correct_choice_id).length / snapshot.length);
    const at = `2026-10-${pad(5 + k * 2, 2)}T16:00:00Z`;
    return { id: `ATTEMPT-${pad(k + 1)}`, quiz_id: quiz.id, student_id: student, answers, question_snapshot: snapshot, score, submitted_at: at, created_at: at };
  });
  const assignmentFor = courseId => catalog.assignments.find(a => a.course_id === courseId).id;
  const submissions = [
    ['SUB-001', 'C-001', 'S-004', 'قسمت ٢٤ تمرة على ٦ أطباق بالتساوي، فكان في كل طبق ٤ تمرات. تحققت بالضرب: ٤ × ٦ = ٢٤.', 'fatma-dates.txt', 'submitted'],
    ['SUB-002', 'C-001', 'S-003', 'استخدمت الكسور لتقسيم كعكة العيد بين أفراد الأسرة.', null, 'graded'],
    ['SUB-003', 'C-002', 'S-001', 'زرعت بذرتين؛ واحدة في الضوء وأخرى في الظل، ولاحظت أن التي في الضوء نمت أسرع.', 'maryam-seeds.txt', 'released'],
    ['SUB-004', 'C-015', 'S-002', 'قست مساحة فناء المنزل بتقسيمه إلى مستطيلات.', null, 'released'],
    ['SUB-005', 'C-004', 'S-006', 'My essay argues that renewable energy can diversify Oman’s economy.', 'muzna-essay.txt', 'released'],
    ['SUB-006', 'C-010', 'S-001', 'كتبت جدول ٧ ورسمت مصفوفة توضح ٧ × ٤.', null, 'submitted'],
  ].map(([id, courseId, student, text, filename, state], k) => stamp({ id, assignment_id: assignmentFor(courseId), student_id: student, text, filename, state, submitted_at: `2026-10-${pad(8 + k, 2)}T17:00:00Z` }, `2026-10-${pad(8 + k, 2)}T17:00:00Z`));
  const assessment_grades = [
    ['GRADE-001', 'SUB-002', 'U-A001', 80, 'فكرة جميلة؛ أضف رسماً يوضح الأجزاء المتساوية.', null],
    ['GRADE-002', 'SUB-003', 'U-T001', 92, 'ملاحظة علمية دقيقة ومقارنة عادلة. أحسنتِ!', '2026-10-12T09:00:00Z'],
    ['GRADE-003', 'SUB-004', 'U-T003', 85, 'طريقة التقسيم ممتازة؛ راجع وحدات القياس.', '2026-10-14T09:00:00Z'],
    ['GRADE-004', 'SUB-005', 'U-T002', 88, 'Clear thesis and strong evidence; tighten your conclusion.', '2026-10-15T09:00:00Z'],
  ].map(([id, submission, grader, score, feedback, released]) => stamp({ id, submission_id: submission, grader_user_id: grader, score, feedback, released_at: released }, '2026-10-11T09:00:00Z', released ?? '2026-10-11T09:00:00Z'));
  return { enrollments, access_grants: grants, lesson_progress, live_sessions, attendance, recordings, attempts, submissions, assessment_grades };
}

// ---------------------------------------------------------------- communication
// [conversation, course, lesson pos|null, student, kind, state, assignee, subject ar, subject en, messages: [author, text, lang, internal?, moderation?]]
const CONVERSATIONS = [
  ['Q-001', 'C-002', 2, 'S-001', 'lesson_qa', 'assigned', 'U-A001', 'لماذا تحتاج النبتة إلى الضوء؟', 'Why does a plant need light?', [['U-S001', 'في درس المفاهيم الأساسية، لماذا ذبلت النبتة التي وضعناها في الخزانة؟', 'ar'], ['U-A001', 'سؤال رائع يا مريم! النبتة تصنع غذاءها باستخدام ضوء الشمس، لذلك ضعفت في الظلام.', 'ar'], ['U-S001', 'شكراً، سأجرب وضعها قرب النافذة وأسجل الملاحظة.', 'ar']]],
  ['Q-002', 'C-001', 4, 'S-004', 'lesson_qa', 'assigned', 'U-A001', 'كيف أختار استراتيجية الحل؟', 'How do I choose a strategy?', [['U-S004', 'لم أفهم متى أرسم نموذجاً ومتى أكتب عملية مباشرة.', 'ar'], ['U-A001', 'ملاحظة داخلية: الطالبة تحتاج مثالاً إضافياً عن النماذج الشريطية.', 'ar', true], ['U-A001', 'ارسمي نموذجاً عندما تكون المسألة طويلة أو فيها أكثر من خطوة، ثم اكتبي العملية.', 'ar']]],
  ['Q-003', 'C-001', null, 'S-003', 'private_support', 'assigned', 'U-A001', 'لا تظهر ورقة العمل', 'The worksheet is not showing', [['U-S003', 'ورقة العمل في الوحدة الثانية لا تفتح عندي.', 'ar'], ['U-A001', 'جرّب زر التنزيل أسفل الدرس، وأخبرني إن استمرت المشكلة.', 'ar'], ['U-S003', 'فتحت الآن، شكراً.', 'ar']]],
  ['Q-004', 'C-001', 7, 'S-004', 'lesson_qa', 'assigned', 'U-T001', 'سؤال عن مثال السوق', 'Question about the souq example', [['U-S004', 'في مثال السوق، لماذا ضربنا ولم نجمع؟', 'ar'], ['U-T001', 'ملاحظة داخلية: سأضيف مثالاً مقارناً في الإعلان القادم.', 'ar', true], ['U-T001', 'لأن لدينا مجموعات متساوية، والضرب طريقة سريعة للجمع المتكرر.', 'ar']]],
  ['Q-005', 'C-001', 3, 'S-003', 'lesson_qa', 'open', null, 'هل توجد طريقة أسرع؟', 'Is there a faster method?', [['U-S003', 'هل توجد طريقة أسرع لحل المثال الثالث؟', 'ar'], ['U-S003', 'جربت التقريب لكن النتيجة اختلفت.', 'ar'], ['U-S003', 'أرفقت خطواتي في الدفتر.', 'ar']]],
  ['Q-006', 'C-002', null, 'S-004', 'private_support', 'resolved', null, 'موعد اللقاء العلمي', 'Science meet-up time', [['U-S004', 'متى يبدأ اللقاء العلمي القادم؟', 'ar'], ['U-T001', 'يوم الخميس الساعة السادسة مساءً بتوقيت مسقط.', 'ar'], ['U-S004', 'تمام، شكراً أستاذ.', 'ar']]],
  ['Q-007', 'C-004', 4, 'S-006', 'lesson_qa', 'open', null, 'Thesis length', 'Thesis length', [['U-S006', 'How long should a thesis statement be?', 'en'], ['U-S006', 'Is two sentences acceptable?', 'en'], ['U-S006', 'This message was flagged for review in the demo.', 'en', false, 'flagged']]],
  ['Q-008', 'C-015', 2, 'S-002', 'lesson_qa', 'waiting', 'U-T003', 'مجموع زوايا المضلع', 'Sum of polygon angles', [['U-S002', 'كيف نحسب مجموع زوايا الشكل السداسي؟', 'ar'], ['U-T003', 'قسّم الشكل إلى مثلثات من رأس واحد. كم مثلثاً حصلت؟', 'ar'], ['U-T003', 'بانتظار إجابتك لنكمل معاً.', 'ar']]],
  ['Q-009', 'C-021', null, 'S-005', 'private_support', 'escalated', 'U-T003', 'تعذر حضور الحصة', 'Could not join the class', [['U-S005', 'لم أتمكن من دخول حصة معادلة المستقيم.', 'ar'], ['U-T003', 'نعتذر، تعذر الاتصال بمزود الحصص في العرض التجريبي. صعّدنا المشكلة للدعم.', 'ar'], ['U-T003', 'ملاحظة داخلية: تم إبلاغ فريق العمليات.', 'ar', true]]],
  ['Q-010', 'C-010', null, 'S-001', 'private_support', 'resolved', null, 'شكر للمعلم', 'Thank you note', [['U-S001', 'استمتعت كثيراً بدرس جدول السبعة!', 'ar'], ['U-T001', 'سعيد بذلك يا مريم، واصلي التدريب.', 'ar'], ['U-S001', 'سأفعل إن شاء الله.', 'ar']]],
];
// [notification, recipient, type, unread, title ar, title en, body ar, body en, href, course]
const NOTIFICATIONS = [
  ['N-001', 'U-S001', 'qa_reply', true, 'رد جديد على سؤالك', 'New reply to your question', 'ردت نورة على سؤالك في دورة العلوم.', 'Noora replied to your Science question.', '#/student/messages/Q-001', 'C-002'],
  ['N-002', 'U-S001', 'grade_released', true, 'نُشرت نتيجة مهمتك', 'Your task result is released', 'حصلتِ على ٩٢ في المهمة التطبيقية.', 'You scored 92 on the applied task.', '#/student/assignments?tab=results', 'C-002'],
  ['N-003', 'U-S001', 'recording', false, 'التسجيل جاهز قريباً', 'Recording coming soon', 'تسجيل لقاء دورة الماء قيد المراجعة قبل نشره.', 'The water cycle recording is being prepared for publishing.', '#/student/course/C-002?tab=live', 'C-002'],
  ['N-004', 'U-S001', 'announcement', false, 'إعلان جديد', 'New announcement', 'أضاف المعلم نشاطاً جديداً لهذا الأسبوع.', 'Your teacher added a new activity for this week.', '#/student/course/C-002?tab=announcements', 'C-002'],
  ['N-005', 'U-S001', 'access_expired', false, 'انتهى وصولك لدورة سابقة', 'Access to a past course ended', 'انتهت مدة الوصول لدورة الصف الثالث مع نهاية العام الدراسي.', 'Access to your Grade 3 course ended with the academic year.', '#/student/courses?tab=expired', 'C-011'],
  ['N-006', 'U-G001', 'payment_succeeded', true, 'تم الدفع بنجاح', 'Payment succeeded', 'تم تفعيل دورتين لمريم وسالم.', 'Two courses were activated for Maryam and Salim.', '#/checkout/order/ORD-002/receipt', null],
  ['N-007', 'U-G001', 'payment_failed', false, 'تعذر إتمام الدفع', 'Payment could not be completed', 'لم تكتمل محاولتا الدفع للطلب ORD-006.', 'Both payment attempts for order ORD-006 failed.', '#/checkout/order/ORD-006/result', null],
  ['N-008', 'U-G001', 'link_pending', true, 'طلب الربط قيد التحقق', 'Link request under verification', 'طلب ربط حمد بانتظار تحقق فريق الإشراف.', 'The request to link Hamad awaits moderation.', '#/guardian/children', null],
  ['N-009', 'U-G001', 'weekly_summary', false, 'ملخص الأسبوع', 'Weekly summary', 'أكملت مريم ثلاثة دروس هذا الأسبوع.', 'Maryam completed three lessons this week.', '#/guardian/child/S-001?tab=activity', null],
  ['N-010', 'U-T001', 'new_question', true, 'سؤال جديد بانتظار الإسناد', 'New question awaiting assignment', 'سأل حمد عن طريقة أسرع في دورة الرياضيات.', 'Hamad asked about a faster method in Mathematics.', '#/teacher/inbox/Q-005', 'C-001'],
  ['N-011', 'U-T001', 'review_pending', true, 'دورتك قيد المراجعة', 'Your course is in review', 'أُرسلت دورة الكسور العشرية لفريق المراجعة.', 'Decimals in Daily Life was sent for review.', '#/teacher/courses', 'C-012'],
  ['N-012', 'U-T001', 'payout_review', false, 'دفعة صرف قيد المراجعة', 'Payout batch under review', 'دفعة أكتوبر بانتظار اعتماد مستقل.', 'The October batch awaits independent approval.', '#/teacher/earnings?tab=payouts', null],
  ['N-013', 'U-T001', 'new_enrollment', false, 'تسجيل جديد', 'New enrollment', 'سُجّلت طالبة جديدة في مغامرات الأعداد.', 'A new learner joined Number Adventures.', '#/teacher/course/C-001?tab=learners', 'C-001'],
  ['N-014', 'U-A001', 'assigned_conversation', true, 'أُسند إليك سؤال', 'Question assigned to you', 'أسند إليك أحمد سؤالاً في الرياضيات.', 'Ahmed assigned you a Mathematics question.', '#/assistant/inbox/Q-002', 'C-001'],
  ['N-015', 'U-A001', 'task', true, 'مهمة تصحيح جديدة', 'New grading task', 'تسليم جديد بانتظار التصحيح في الرياضيات.', 'A new submission awaits grading in Mathematics.', '#/assistant/tasks?tab=grading', 'C-001'],
  ['N-016', 'U-A001', 'task', false, 'مهمة محتوى', 'Content task', 'تحديث شرح ورقة العمل في دورة العلوم.', 'Update the worksheet explanation in Science.', '#/assistant/tasks?tab=content', 'C-002'],
  ['N-017', 'U-F001', 'payout_failed', true, 'فشل تحويل دفعة', 'Payout transfer failed', 'فشل تحويل الدفعة PB-006 ويحتاج إعادة تحقق.', 'Batch PB-006 failed and needs revalidation.', '#/admin/finance/payouts/PB-006', null],
  ['N-018', 'U-F001', 'refund_requested', false, 'طلب استرداد جديد', 'New refund request', 'طلب استرداد على الطلب ORD-003.', 'A refund was requested on order ORD-003.', '#/admin/finance/refunds', null],
  ['N-019', 'U-M001', 'application', true, 'طلب انضمام جديد', 'New teacher application', 'قدمت بثينة الزدجالية طلباً لتدريس اللغة العربية.', 'Buthaina Al Zadjali applied to teach Arabic.', '#/admin/people/teachers?tab=applications', null],
  ['N-020', 'U-M001', 'guardian_link', false, 'طلب ربط بانتظار التحقق', 'Guardian link awaiting verification', 'طلب ربط جديد يحتاج مراجعة الأدلة التجريبية.', 'A new link request needs synthetic evidence review.', '#/admin/people/guardian-links', null],
  ['N-021', 'U-O001', 'payout_approval', true, 'دفعة بانتظار الاعتماد', 'Batch awaiting approval', 'الدفعة PB-002 بانتظار اعتماد مستقل.', 'Batch PB-002 awaits independent approval.', '#/admin/finance/payouts?tab=approvals', null],
  ['N-022', 'U-O001', 'safety_report', false, 'بلاغ سلامة جديد', 'New safety report', 'وصل بلاغ تواصل يحتاج مراجعة.', 'A communication report needs review.', '#/admin/support/communications', null],
  ['N-023', 'U-S004', 'live_reminder', true, 'حصة مباشرة الآن', 'Live class now', 'بدأت حصة مراجعة القياس.', 'The measurement review class has started.', '#/student/course/C-001?tab=live', 'C-001'],
  ['N-024', 'U-S002', 'live_rescheduled', true, 'تغيير موعد حصة', 'Class rescheduled', 'أعيدت جدولة حصة المساحة والحجم.', 'The area and volume class was rescheduled.', '#/student/calendar', 'C-015'],
];

function createCommunication(catalog) {
  const conversations = [], assignments = [], messages = [];
  CONVERSATIONS.forEach(([id, courseId, lessonPos, student, kind, state, assignee, sAr, sEn, thread], k) => {
    const start = Date.parse('2026-10-10T15:00:00Z') + k * 3 * 3600000;
    thread.forEach(([author, text, lang, internal = false, moderation = 'visible'], m) => {
      const at = new Date(start + m * 1800000).toISOString().replace('.000Z', 'Z');
      messages.push(stamp({ id: `MSG-${pad(messages.length + 1)}`, conversation_id: id, author_user_id: author, text, lang, internal, moderation_state: moderation }, at));
    });
    conversations.push(stamp({ id, course_id: courseId, lesson_id: lessonPos ? lessonOf(courseId, lessonPos) : null, student_id: student, kind, subject: B(sAr, sEn), state, assigned_user_id: assignee, last_message_at: messages.at(-1).created_at }, new Date(start).toISOString().replace('.000Z', 'Z'), messages.at(-1).created_at));
  });
  for (const id of ['Q-001', 'Q-002', 'Q-003', 'Q-004']) {
    const c = conversations.find(x => x.id === id);
    assignments.push(stamp({ id: `QA-${id.slice(2)}`, conversation_id: id, assignee_user_id: c.assigned_user_id, assigned_by: 'U-T001', status: 'active' }, c.created_at));
  }
  const announcements = [
    ['C-001', 'U-T001', 'حصة مباشرة يوم الثلاثاء', 'Live class on Tuesday', 'نلتقي الثلاثاء الساعة الخامسة مساءً لمراجعة الكسور المتكافئة. جهّزوا أسئلتكم!', 'We meet on Tuesday at 5 pm to review equivalent fractions. Bring your questions!'],
    ['C-001', 'U-T001', 'ورقة عمل جديدة', 'New worksheet', 'أضفت ورقة عمل عن مسائل السوق في الوحدة الثانية.', 'I added a souq problems worksheet to Module 2.'],
    ['C-002', 'U-T001', 'أهلاً بكم في رحلة العلوم', 'Welcome to our science journey', 'ابدؤوا بالدرس الأول وجربوا النشاط المنزلي مع أسرتكم.', 'Start with lesson one and try the home activity with your family.'],
    ['C-002', 'U-T001', 'تسجيل لقاء دورة الماء', 'Water cycle recording', 'التسجيل قيد التجهيز وسيُنشر قريباً للمسجلين.', 'The recording is being prepared and will be published for enrolled learners.'],
    ['C-004', 'U-T002', 'Essay feedback week', 'Essay feedback week', 'Submit your draft this week to receive written feedback.', 'Submit your draft this week to receive written feedback.'],
    ['C-015', 'U-T003', 'تغيير موعد الحصة', 'Class time changed', 'نُقلت حصة المساحة والحجم إلى الخميس.', 'The area and volume class moved to Thursday.'],
  ].map(([courseId, author, tAr, tEn, bAr, bEn], k) => stamp({ id: `ANN-${pad(k + 1)}`, course_id: courseId, author_user_id: author, title: B(tAr, tEn), body: B(bAr, bEn), published_at: `2026-10-${pad(3 + k * 2, 2)}T08:00:00Z` }, `2026-10-${pad(3 + k * 2, 2)}T08:00:00Z`));
  const tasks = [
    ['TASK-001', 'C-001', 'U-A001', 'grading', 'SUB-001', 'open', '2026-10-22T15:59:59Z'],
    ['TASK-002', 'C-010', 'U-T001', 'grading', 'SUB-006', 'open', '2026-10-23T15:59:59Z'],
    ['TASK-003', 'C-002', 'U-A001', 'content', lessonOf('C-002', 3), 'open', '2026-10-24T15:59:59Z'],
    ['TASK-004', 'C-003', 'U-T001', 'content', lessonOf('C-003', 2), 'in_progress', '2026-10-30T15:59:59Z'],
  ].map(([id, course_id, assignee, kind, target, state, due]) => stamp({ id, course_id, assignee_user_id: assignee, kind, target_id: target, state, due_at: due }, '2026-10-12T08:00:00Z'));
  const notifications = NOTIFICATIONS.map(([id, recipient, type, unread, tAr, tEn, bAr, bEn, href, courseId], k) => {
    const at = new Date(Date.parse('2026-10-12T08:00:00Z') + k * 6 * 3600000).toISOString().replace('.000Z', 'Z');
    return stamp({ id, recipient_user_id: recipient, event_id: `EVT-${type}-${pad(k + 1)}`, type, title: B(tAr, tEn), body: B(bAr, bEn), href, read_at: unread ? null : DEMO_NOW, related_course_id: courseId }, at);
  });
  const delivery_attempts = notifications.map((n, k) => {
    const email = k % 3 === 0, state = !email ? (n.read_at ? 'read' : 'sent') : k === 9 ? 'failed' : k === 21 ? 'queued' : 'sent';
    return stamp({ id: `DA-${pad(k + 1)}`, notification_id: n.id, channel: email ? 'email' : 'in_app', state, attempts: state === 'failed' ? 3 : state === 'queued' ? 0 : 1, last_error: state === 'failed' ? 'simulated_mailbox_unavailable' : '' }, n.created_at);
  });
  return { conversations, conversation_assignments: assignments, messages, announcements, tasks, notifications, delivery_attempts };
}

// ---------------------------------------------------------------- administration
const PERMISSIONS = [
  ['course.read', 'course', 'عرض الدورة', 'Read course'], ['read_content', 'course', 'عرض المحتوى', 'Read content'], ['edit_content', 'course', 'تحرير المحتوى', 'Edit content'],
  ['grade_assignment', 'course', 'تصحيح الواجبات', 'Grade assignments'], ['reply_conversation', 'conversation', 'الرد على المحادثات', 'Reply to conversations'], ['conversation.read', 'conversation', 'عرض المحادثة', 'Read conversation'],
  ['child.read', 'student', 'متابعة الطالب المرتبط', 'Read linked learner'], ['purchase', 'student', 'الشراء لطالب', 'Purchase for learner'], ['order.read', 'order', 'عرض الطلب', 'Read order'],
  ['earnings.read', 'teacher', 'عرض المستحقات', 'Read earnings'], ['finance.prepare_payout', 'payout_batch', 'إعداد دفعة صرف', 'Prepare payout batch'], ['finance.approve_payout', 'payout_batch', 'اعتماد دفعة صرف', 'Approve payout batch'],
  ['finance.release_payout', 'payout_batch', 'إطلاق دفعة صرف', 'Release payout batch'], ['finance.refund', 'order_item', 'معالجة الاسترداد', 'Process refunds'], ['finance.reconcile', 'payment_transaction', 'المطابقة المالية', 'Reconcile payments'],
  ['people.review_application', 'teacher_application', 'مراجعة طلبات المعلمين', 'Review teacher applications'], ['people.verify_guardian_link', 'guardian_student_link', 'التحقق من روابط أولياء الأمور', 'Verify guardian links'], ['courses.moderate', 'course', 'الإشراف على الدورات', 'Moderate courses'],
  ['settings.manage_roles', 'role_assignment', 'إدارة الأدوار', 'Manage roles'], ['cms.edit', 'cms_page', 'تحرير المحتوى العام', 'Edit public content'],
];
function createAdministration() {
  const permissions = PERMISSIONS.map(([key, type, ar, en], k) => stamp({ id: `PERM-${pad(k + 1)}`, key, description: B(ar, en), allowed_resource_type: type }));
  const keys = prefix => PERMISSIONS.map(p => p[0]).filter(k => k.startsWith(prefix));
  const role_assignments = [
    ['U-S001', 'student', ['course.read', 'read_content', 'purchase', 'order.read'], {}],
    ['U-G001', 'guardian', ['child.read', 'purchase', 'order.read'], {}],
    ['U-T001', 'teacher', ['course.read', 'read_content', 'edit_content', 'grade_assignment', 'reply_conversation', 'earnings.read'], {}],
    ['U-A001', 'assistant', ['read_content', 'reply_conversation', 'grade_assignment', 'edit_content'], { course_ids: ['C-001', 'C-002'] }],
    ['U-F001', 'admin_finance', keys('finance.'), { module: 'finance' }],
    ['U-M001', 'admin_moderation', [...keys('people.'), ...keys('courses.')], { modules: ['people', 'courses', 'support'] }],
    ['U-O001', 'super_admin', PERMISSIONS.map(p => p[0]), {}],
    ['U-F002', 'admin_finance', keys('finance.'), { module: 'finance' }],
    ['U-G002', 'guardian', ['child.read', 'purchase', 'order.read'], {}],
  ].map(([user, role, perms, scope], k) => stamp({ id: `RA-${pad(k + 1)}`, user_id: user, role, permissions: perms, scope, effective_at: '2026-08-15T00:00:00Z', expires_at: role.startsWith('admin') || role === 'super_admin' ? '2027-08-15T00:00:00Z' : null, status: 'active' }, '2026-08-15T00:00:00Z'));
  const audit_events = [
    ['U-M001', 'teacher_application.approve', 'teacher_application', 'TA-001', 'under_review', 'approved', 'Credentials verified (synthetic evidence)'],
    ['U-M001', 'teacher_application.approve', 'teacher_application', 'TA-002', 'under_review', 'approved', 'Credentials verified (synthetic evidence)'],
    ['U-M001', 'teacher_application.approve', 'teacher_application', 'TA-003', 'under_review', 'approved', 'Credentials verified (synthetic evidence)'],
    ['U-M001', 'teacher_application.request_info', 'teacher_application', 'TA-005', 'under_review', 'more_info_required', 'Teaching licence missing'],
    ['U-M001', 'teacher_application.reject', 'teacher_application', 'TA-006', 'under_review', 'rejected', 'Qualification does not match declared subjects'],
    ['U-M001', 'course.approve', 'course', 'C-001', 'Submitted', 'Published', 'Checklist complete'],
    ['U-M001', 'course.approve', 'course', 'C-002', 'Submitted', 'Published', 'Checklist complete'],
    ['U-M001', 'course.request_changes', 'course', 'C-018', 'Submitted', 'ChangesRequested', 'Worked examples missing'],
    ['U-O001', 'course.unpublish', 'course', 'C-020', 'Published', 'Unpublished', 'Teacher requested content update'],
    ['U-O001', 'course.archive', 'course', 'C-022', 'Published', 'Archived', 'Superseded by revised syllabus'],
    ['U-M001', 'guardian_link.verify', 'guardian_student_link', 'GL-001', 'pending_verification', 'verified', 'Synthetic evidence matched'],
    ['U-M001', 'guardian_link.reject', 'guardian_student_link', 'GL-006', 'pending_verification', 'rejected', 'Evidence did not match learner'],
    ['U-G001', 'guardian_link.revoke', 'guardian_student_link', 'GL-004', 'verified', 'revoked', 'Revoked by guardian'],
    ['U-M001', 'access_grant.revoke', 'access_grant', 'AG-014', 'active', 'revoked', 'Duplicate admin grant before purchase'],
    ['U-F002', 'payout_batch.submit', 'payout_batch', 'PB-002', 'Draft', 'UnderReview', 'October payables'],
    ['U-O001', 'payout_batch.approve', 'payout_batch', 'PB-003', 'UnderReview', 'Approved', 'Independent approval'],
    ['U-F001', 'payout_batch.approve', 'payout_batch', 'PB-004', 'UnderReview', 'Approved', 'Independent approval'],
    ['U-F002', 'refund.approve', 'refund', 'REF-001', 'requested', 'succeeded', 'Full-item refund after payout; recovery adjustment created'],
    ['U-M001', 'support.sensitive_read', 'student', 'S-004', '', 'viewed', 'Support ticket ST-002 investigation'],
    ['U-O001', 'role_assignment.update', 'role_assignment', 'RA-008', 'expires 2026-12-31', 'expires 2027-08-15', 'Second finance approver renewed'],
  ].map(([actor, action, type, id, before, after, reason], k) => { const at = new Date(Date.parse('2026-09-01T09:00:00Z') + k * 2 * 86400000).toISOString().replace('.000Z', 'Z'); return { id: `AUD-${pad(k + 1)}`, actor_user_id: actor, action, resource_type: type, resource_id: id, before_summary: before, after_summary: after, reason, created_at: at }; });
  const support_tickets = [
    ['ST-001', 'U-G001', null, 'open', 'U-M001', 'كيف أتابع تقدم ابنتي؟', 'How do I follow my daughter’s progress?', 'أريد معرفة أين أجد نتائج الاختبارات القصيرة لمريم.', 'Where can I find Maryam’s quiz results?', ''],
    ['ST-002', 'U-S004', 'C-001', 'assigned', 'U-M001', 'لا أستطيع رؤية التسجيل', 'I cannot see the recording', 'تسجيل حصة الضرب لا يظهر في صفحتي.', 'The multiplication class recording is not showing.', ''],
    ['ST-003', 'U-S006', 'C-004', 'waiting', 'U-M001', 'Refund timing', 'Refund timing', 'How long does a refund review usually take?', 'How long does a refund review usually take?', ''],
    ['ST-004', 'U-T003', null, 'resolved', 'U-M001', 'تحديث بيانات الحساب البنكي', 'Updating bank details', 'أرغب في تغيير حساب الصرف.', 'I would like to change my payout account.', 'Directed to the verified destination change request flow.'],
  ].map(([id, requester, courseId, state, staff, sAr, sEn, bAr, bEn, resolution], k) => stamp({ id, requester_user_id: requester, course_id: courseId, subject: B(sAr, sEn), body: B(bAr, bEn), state, assigned_staff_id: staff, resolution }, `2026-10-${pad(10 + k * 2, 2)}T10:00:00Z`));
  const safety_reports = [
    ['SR-001', 'U-S006', 'MSG-021', 'C-004', 'open', 'رسالة تحتاج مراجعة لغوية', 'Message needs moderation review'],
    ['SR-002', 'U-S003', null, 'C-001', 'assigned', 'محتوى درس يحتاج توضيحاً', 'Lesson content needs clarification'],
    ['SR-003', 'U-S004', 'MSG-016', 'C-002', 'resolved', 'سؤال عن الخصوصية في المحادثة', 'Privacy question about a conversation'],
  ].map(([id, reporter, message, courseId, state, ar, en], k) => stamp({ id, reporter_user_id: reporter, message_id: message, course_id: courseId, reason: B(ar, en), state, restricted_note: 'Synthetic safeguarding fixture — restricted to moderation staff.', assigned_staff_id: 'U-M001' }, `2026-10-${pad(11 + k * 2, 2)}T10:00:00Z`));
  const cms_pages = [
    ['home', 'published', B('الصفحة الرئيسية', 'Home page'), B('تعلّم يبدأ من صفك.', 'Learning that starts with your grade.'), [
      { kind: 'banner', title: B('عام دراسي جديد، بداية واثقة', 'A new school year, a confident start'), body: B('دورات مختارة من معلمين معتمدين لكل صف من الأول إلى الثاني عشر.', 'Courses from verified teachers for every grade from 1 to 12.') },
      { kind: 'featured', course_ids: ['C-001', 'C-002', 'C-004', 'C-015'] }]],
    ['about', 'published', B('عن منصة عُمان التعليمية', 'About Oman Learning Platform'), B('سوق تعليمي ونظام إدارة تعلم يربط الطلبة وأولياء الأمور بمعلمين معتمدين، منظم حسب الصف والمادة.', 'A learning marketplace and LMS connecting students and families with verified teachers, organised by grade and subject.'), [
      { title: B('رسالتنا', 'Our mission'), body: B('تعلم واضح وآمن وقريب من المنهج العُماني.', 'Clear, safe learning close to the Omani curriculum.') },
      { title: B('الصف أولاً', 'Grade first'), body: B('يبدأ كل شيء من الصف الدراسي ثم المادة ثم المعلم.', 'Everything starts with the grade, then the subject, then the teacher.') }]],
    ['help', 'published', B('المساعدة', 'Help'), B('إجابات سريعة عن الحسابات والدورات والدفع.', 'Quick answers about accounts, courses and payment.'), [
      { kind: 'faq', title: B('هل يمكن لولي الأمر الشراء لأكثر من طالب؟', 'Can a guardian buy for more than one learner?'), body: B('نعم، بعد التحقق من رابط كل طالب، ويُختار الطالب صراحة في كل عملية شراء.', 'Yes, once each link is verified; the learner is chosen explicitly at every purchase.') },
      { kind: 'faq', title: B('هل الدروس التجريبية مجانية؟', 'Are preview lessons free?'), body: B('نعم، يمكن مشاهدة الدرس التجريبي دون تسجيل.', 'Yes, preview lessons can be watched without enrolling.') },
      { kind: 'faq', title: B('متى يُفعّل الوصول بعد الدفع؟', 'When is access activated after payment?'), body: B('بعد تأكيد مزود الدفع، وليس عند العودة إلى الصفحة فقط.', 'After the payment provider confirms — not merely on returning to the page.') }]],
    ['privacy', 'draft', B('سياسة الخصوصية', 'Privacy policy'), B('نص توضيحي غير معتمد قانونياً.', 'Illustrative text, not legally approved.'), []],
    ['terms', 'draft', B('شروط الاستخدام', 'Terms of use'), B('نص توضيحي غير معتمد قانونياً.', 'Illustrative text, not legally approved.'), []],
    ['refunds', 'draft', B('سياسة الاسترداد', 'Refund policy'), B('سياسة الاسترداد قيد القرار؛ هذا نص توضيحي فقط.', 'Refund policy is undecided; this text is illustrative only.'), []],
  ].map(([slug, status, title, body, sections], k) => stamp({ id: `CMS-${pad(k + 1)}`, slug, title, body, status, sections }));
  const promotions = [stamp({ id: 'PROMO-001', code: 'DEMO10', active: false, rate_bps: 1000, funding: 'unresolved', label: B('عرض تجريبي غير مفعل — سياسة التمويل غير محددة', 'Disabled demo promotion — funding policy undecided') })];
  const notification_templates = [
    ['payment_succeeded', 'تم الدفع بنجاح', 'Payment succeeded', 'تم تفعيل الدورة {course} للطالب {student}.', 'Course {course} is now active for {student}.', 'email'],
    ['qa_reply', 'رد جديد', 'New reply', 'وصل رد على سؤالك في {course}.', 'There is a reply to your question in {course}.', 'in_app'],
    ['live_scheduled', 'حصة مباشرة جديدة', 'New live class', 'جُدولت حصة {session} في {time}.', '{session} is scheduled for {time}.', 'in_app'],
    ['recording_published', 'تسجيل جديد', 'New recording', 'نُشر تسجيل {session}.', 'The recording of {session} is published.', 'in_app'],
    ['grade_released', 'نُشرت النتيجة', 'Result released', 'نتيجتك في {activity} متاحة الآن.', 'Your result for {activity} is available.', 'email'],
    ['payout_paid', 'تم صرف المستحقات', 'Payout completed', 'تم تحويل {amount} إلى حسابك الموثق.', '{amount} was transferred to your verified account.', 'email'],
  ].map(([type, sAr, sEn, bAr, bEn, channel], k) => stamp({ id: `NT-${pad(k + 1)}`, event_type: type, subject: B(sAr, sEn), body: B(bAr, bEn), enabled: true, channel }));
  const platform_settings = [stamp({ id: 'SET-001', reviews_enabled: false, coupons_enabled: false, demo_clock: DEMO_NOW, policy_labels: B('سياسات توضيحية قيد القرار', 'Illustrative policies awaiting decisions'), integration_statuses: { payment: 'simulated', live: 'simulated', email: 'simulated' }, tax_config: { status: 'unconfirmed' }, invoice_config: { status: 'demo' }, payout_policy: { status: 'unconfirmed' }, guardian_scope_defaults: ['progress', 'results', 'attendance', 'purchase'] })];
  return { permissions, role_assignments, audit_events, support_tickets, safety_reports, cms_pages, promotions, notification_templates, platform_settings };
}

export function createSeed() {
  const grades = ORDINALS.map((ar, i) => stamp({ id: String(i + 1), number: i + 1, name: B(`الصف ${ar}`, `Grade ${i + 1}`), cycle_key: cycleOf(i + 1), cycle_label: clone(CYCLES[cycleOf(i + 1)]) }));
  const subjects = SUBJECTS.map(([id, code, ar, en, dAr, dEn, icon, color]) => stamp({ id, code, name: B(ar, en), description: B(dAr, dEn), icon, color }));
  const subjectName = id => clone(subjects.find(s => s.id === id).name);
  const grade_subjects = [];
  const addPair = (g, s, track = null) => grade_subjects.push(stamp({ id: `GS-${g}-${s}`, curriculum_version_id: 'CV-001', grade_id: String(g), subject_id: s, track_id: track, display_name: subjectName(s), active: true }));
  for (let g = 1; g <= 12; g++) for (const s of ['math', 'science', 'arabic', 'english']) addPair(g, s);
  for (let g = 1; g <= 4; g++) for (const s of ['islamic', 'social']) addPair(g, s);
  for (let g = 11; g <= 12; g++) for (const s of ['physics', 'chemistry']) addPair(g, s, 'TR-002');

  const users = USERS.map(([id, ar, en, email, locale = 'ar', status = 'active']) => stamp({ id, name: B(ar, en), email: `${email}@example.test`, status, locale }, '2026-08-15T08:00:00Z'));
  const students = STUDENTS.map(([id, user, grade, interests, color]) => stamp({ id, user_id: user, name: userName(user), current_grade_id: grade, interests, profile_color: color }, '2026-08-15T08:00:00Z'));
  const guardians = [['G-001', 'U-G001'], ['G-002', 'U-G002']].map(([id, user]) => stamp({ id, user_id: user, name: userName(user), verification_status: 'verified' }, '2026-08-15T08:00:00Z'));
  const guardian_student_links = [
    ['GL-001', 'G-001', 'S-001', B('أم', 'Mother'), 'verified', '2026-08-20T08:00:00Z', '2026-08-21T08:00:00Z', null],
    ['GL-002', 'G-001', 'S-002', B('أم', 'Mother'), 'verified', '2026-08-20T08:00:00Z', '2026-08-21T08:00:00Z', null],
    ['GL-003', 'G-001', 'S-003', B('خالة', 'Aunt'), 'pending_verification', '2026-10-16T08:00:00Z', null, null],
    ['GL-004', 'G-001', 'S-004', B('خالة', 'Aunt'), 'revoked', '2026-08-22T08:00:00Z', '2026-08-23T08:00:00Z', '2026-10-01T08:00:00Z'],
    ['GL-005', 'G-002', 'S-001', B('أب', 'Father'), 'verified', '2026-08-20T08:00:00Z', '2026-08-22T08:00:00Z', null],
    ['GL-006', 'G-002', 'S-005', B('قريب', 'Relative'), 'rejected', '2026-09-10T08:00:00Z', null, null],
  ].map(([id, guardian, student, relationship, state, requested, verified, revoked]) => stamp({ id, guardian_id: guardian, student_id: student, relationship, state, scopes: ['progress', 'results', 'attendance', 'purchase'], evidence_ref: `DEMO-EVIDENCE-${student}`, requested_at: requested, verified_at: verified, revoked_at: revoked, verified_by: verified ? 'U-M001' : null }, requested, revoked ?? verified ?? requested));
  const teachers = TEACHERS.map(t => stamp({ id: t.id, user_id: t.user, name: userName(t.user), bio: t.bio, application_status: t.status, credentials: t.credentials.map(([label, verified]) => ({ label, verified })), verification_state: t.verification, account_status: 'active' }, '2026-08-01T08:00:00Z', '2026-09-01T08:00:00Z'));
  const history = (teacher, state) => {
    const steps = { approved: ['submitted', 'under_review', 'approved'], submitted: ['draft_application', 'submitted'], more_info_required: ['submitted', 'under_review', 'more_info_required'], rejected: ['submitted', 'under_review', 'rejected'] }[state];
    return steps.map((s, k) => ({ state: s, actor_id: ['submitted', 'draft_application'].includes(s) ? teacher.user : 'U-M001', at: new Date(Date.parse('2026-08-01T08:00:00Z') + k * 3 * 86400000).toISOString().replace('.000Z', 'Z') }));
  };
  const teacher_applications = TEACHERS.map((t, k) => stamp({ id: `TA-${pad(k + 1)}`, teacher_id: t.id, declared_grade_subject_ids: QUALIFIED[t.id] ?? DECLARED[t.id], credential_labels: t.credentials.map(([label]) => clone(label)), state: t.status, reviewer_id: t.status === 'submitted' ? null : 'U-M001',
    feedback: { more_info_required: B('يرجى إرفاق رخصة مزاولة التدريس (اسم ملف تجريبي).', 'Please attach your teaching licence (synthetic filename).'), rejected: B('المؤهل المرفق لا يغطي المواد المعلنة.', 'The attached qualification does not cover the declared subjects.'), approved: B('تم التحقق من المؤهلات التجريبية.', 'Synthetic credentials verified.') }[t.status] ?? B('', ''),
    history: history(t, t.status) }, '2026-08-01T08:00:00Z', '2026-08-10T08:00:00Z'));
  const teacher_grade_subjects = Object.entries(QUALIFIED).flatMap(([teacher, pairs]) => pairs.map(pair => ({ teacher, pair }))).map(({ teacher, pair }, k) => stamp({ id: `TGS-${pad(k + 1)}`, teacher_id: teacher, grade_subject_id: pair, verification_state: 'verified' }));
  const teacher_invitations = [
    stamp({ id: 'TI-001', email: 'new.teacher@example.test', teacher_id: null, invited_by: 'U-M001', status: 'invited', expires_at: '2026-11-15T19:59:59Z' }, '2026-10-15T08:00:00Z'),
    stamp({ id: 'TI-002', email: 'buthaina.zadjali@example.test', teacher_id: 'T-004', invited_by: 'U-M001', status: 'accepted', expires_at: '2026-09-30T19:59:59Z' }, '2026-08-01T08:00:00Z'),
  ];
  const teacher_team_members = [
    stamp({ id: 'TM-001', teacher_id: 'T-001', user_id: 'U-A001', status: 'active', team_role: 'assistant', invited_at: '2026-08-28T08:00:00Z', expires_at: YEAR_END }, '2026-08-28T08:00:00Z'),
    stamp({ id: 'TM-002', teacher_id: 'T-001', user_id: 'U-A002', status: 'invited', team_role: 'assistant', invited_at: '2026-10-14T08:00:00Z', expires_at: '2026-10-28T19:59:59Z' }, '2026-10-14T08:00:00Z'),
  ];
  const course_team_assignments = [
    stamp({ id: 'CTA-001', team_member_id: 'TM-001', course_id: 'C-001', capabilities: ['reply_conversation', 'read_content', 'grade_assignment'], status: 'active' }, '2026-08-28T08:00:00Z'),
    stamp({ id: 'CTA-002', team_member_id: 'TM-001', course_id: 'C-002', capabilities: ['reply_conversation', 'read_content', 'edit_content'], status: 'active' }, '2026-08-28T08:00:00Z'),
  ];
  const catalog = createCatalog();
  const commerce = createCommerce(catalog.courses);
  const learning = createLearning(catalog);
  const communication = createCommunication(catalog);
  return {
    users, grades, subjects,
    curricula: [stamp({ id: 'CUR-001', code: 'OM-MOE', name: B('منهج وزارة التربية والتعليم — سلطنة عُمان', 'Oman Ministry of Education curriculum'), active: true })],
    curriculum_versions: [
      stamp({ id: 'CV-001', curriculum_id: 'CUR-001', name: B('إصدار ٢٠٢٦', '2026 edition'), effective_year: 2026, active: true }),
      stamp({ id: 'CV-002', curriculum_id: 'CUR-001', name: B('إصدار ٢٠٢٥', '2025 edition'), effective_year: 2025, active: false }, '2025-08-01T08:00:00Z'),
    ],
    tracks: [
      stamp({ id: 'TR-001', curriculum_version_id: 'CV-001', name: B('المسار العام', 'General track'), active: true }),
      stamp({ id: 'TR-002', curriculum_version_id: 'CV-001', name: B('مسار العلوم (توضيحي)', 'Science track (illustrative)'), active: true }),
    ],
    grade_subjects,
    academic_years: [
      stamp({ id: 'AY-001', name: B('٢٠٢٥–٢٠٢٦', '2025–2026'), starts_at: '2025-09-01T00:00:00Z', ends_at: '2026-07-31T19:59:59Z' }, '2025-08-01T08:00:00Z'),
      stamp({ id: 'AY-002', name: B('٢٠٢٦–٢٠٢٧', '2026–2027'), starts_at: '2026-09-01T00:00:00Z', ends_at: YEAR_END }, '2026-08-01T08:00:00Z'),
    ],
    semesters: [
      ['SEM-001', 'AY-001', 1, '2025-09-01T00:00:00Z', '2026-01-31T19:59:59Z'], ['SEM-002', 'AY-001', 2, '2026-02-01T00:00:00Z', '2026-07-31T19:59:59Z'],
      ['SEM-003', 'AY-002', 1, '2026-09-01T00:00:00Z', '2027-01-31T19:59:59Z'], ['SEM-004', 'AY-002', 2, '2027-02-01T00:00:00Z', YEAR_END],
    ].map(([id, year, sequence, start, end]) => stamp({ id, academic_year_id: year, name: B(sequence === 1 ? 'الفصل الدراسي الأول' : 'الفصل الدراسي الثاني', sequence === 1 ? 'Semester 1' : 'Semester 2'), sequence, starts_at: start, ends_at: end })),
    students, guardians, guardian_student_links, teachers, teacher_applications, teacher_grade_subjects, teacher_invitations, teacher_team_members, course_team_assignments,
    courses: catalog.courses, modules: catalog.modules, lessons: catalog.lessons, lesson_resources: catalog.resources,
    live_sessions: learning.live_sessions, attendance: learning.attendance, recordings: learning.recordings,
    enrollments: learning.enrollments, access_grants: learning.access_grants, lesson_progress: learning.lesson_progress,
    quizzes: catalog.quizzes, questions: catalog.questions, attempts: learning.attempts, assignments: catalog.assignments,
    submissions: learning.submissions, assessment_grades: learning.assessment_grades,
    ...communication,
    ...commerce,
    ...createAdministration(),
  };
}
