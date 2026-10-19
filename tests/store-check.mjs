// Seed, scope and dictionary checks for the clickable prototype (prototype/SPEC.md §3.1, §4, §5, §9).
// Plain Node, no dependencies:  node tests/store-check.mjs
import assert from 'node:assert/strict';
import { createSeed, PERSONAS, DEMO_NOW, ENUMS } from '../prototype/core/data.js';
import { select, dispatch, can, getState, resetDemoData } from '../prototype/core/store.js';
import { dictionary, money, t, L, esc } from '../prototype/core/i18n.js';
import { routes } from '../prototype/core/router.js';

let passed = 0;
const check = (name, fn) => {
  try { fn(); passed++; } catch (error) { console.error(`FAIL ${name}\n  ${error.message}`); process.exitCode = 1; }
};
const seed = createSeed();
const byId = name => new Map(seed[name].map(r => [r.id, r]));
const ids = Object.fromEntries(Object.entries(seed).filter(([, v]) => Array.isArray(v)).map(([k, v]) => [k, new Set(v.map(r => r.id))]));

// ---------------------------------------------------------------- counts §4.1
const COUNTS = { users: 20, students: 6, guardians: 2, guardian_student_links: 6, teachers: 6, teacher_applications: 6, teacher_grade_subjects: 20, teacher_invitations: 2, teacher_team_members: 2, course_team_assignments: 2, curricula: 1, curriculum_versions: 2, grades: 12, tracks: 2, subjects: 8, grade_subjects: 60, academic_years: 2, semesters: 4, courses: 24, modules: 72, lessons: 216, lesson_resources: 48, live_sessions: 12, attendance: 12, recordings: 6, enrollments: 12, access_grants: 14, lesson_progress: 24, quizzes: 8, questions: 24, attempts: 6, assignments: 8, submissions: 6, assessment_grades: 4, conversations: 10, conversation_assignments: 4, messages: 30, announcements: 6, tasks: 4, orders: 8, order_items: 9, payment_transactions: 9, provider_events: 9, commission_rules: 3, earning_allocations: 8, teacher_payout_accounts: 3, payout_batches: 6, teacher_payouts: 6, refunds: 2, disputes: 1, adjustments: 2, notifications: 24, delivery_attempts: 24, permissions: 20, role_assignments: 9, audit_events: 20, support_tickets: 4, safety_reports: 3, cms_pages: 6, promotions: 1, notification_templates: 6, platform_settings: 1 };
for (const [name, n] of Object.entries(COUNTS)) check(`count ${name}`, () => assert.equal(seed[name]?.length, n, name));
check('ledger size is a derived planning estimate (~60)', () => assert.ok(seed.financial_ledger_entries.length >= 45 && seed.financial_ledger_entries.length <= 75, String(seed.financial_ledger_entries.length)));
check('no unexpected collections', () => assert.deepEqual(Object.keys(seed).sort(), [...Object.keys(COUNTS), 'financial_ledger_entries'].sort()));
for (const [name, set] of Object.entries(ids)) check(`unique ids ${name}`, () => assert.equal(set.size, seed[name].length));
check('createSeed returns fresh objects', () => { const a = createSeed(); a.courses[0].title.ar = 'x'; assert.notEqual(createSeed().courses[0].title.ar, 'x'); });

// ---------------------------------------------------------------- foreign keys
const FK = {
  curriculum_versions: { curriculum_id: 'curricula' }, tracks: { curriculum_version_id: 'curriculum_versions' },
  grade_subjects: { curriculum_version_id: 'curriculum_versions', grade_id: 'grades', subject_id: 'subjects', track_id: 'tracks' },
  semesters: { academic_year_id: 'academic_years' },
  students: { user_id: 'users', current_grade_id: 'grades', interests: 'subjects' }, guardians: { user_id: 'users' },
  guardian_student_links: { guardian_id: 'guardians', student_id: 'students', verified_by: 'users' }, teachers: { user_id: 'users' },
  teacher_applications: { teacher_id: 'teachers', declared_grade_subject_ids: 'grade_subjects', reviewer_id: 'users' },
  teacher_grade_subjects: { teacher_id: 'teachers', grade_subject_id: 'grade_subjects' },
  teacher_invitations: { teacher_id: 'teachers', invited_by: 'users' }, teacher_team_members: { teacher_id: 'teachers', user_id: 'users' },
  course_team_assignments: { team_member_id: 'teacher_team_members', course_id: 'courses' },
  courses: { owner_teacher_id: 'teachers', grade_subject_id: 'grade_subjects', academic_year_id: 'academic_years', semester_id: 'semesters', track_id: 'tracks' },
  modules: { course_id: 'courses' }, lessons: { module_id: 'modules' }, lesson_resources: { lesson_id: 'lessons' },
  live_sessions: { course_id: 'courses', host_teacher_id: 'teachers' }, attendance: { live_session_id: 'live_sessions', student_id: 'students' },
  recordings: { live_session_id: 'live_sessions', course_id: 'courses' },
  enrollments: { student_id: 'students', course_id: 'courses', historical_grade_id: 'grades' },
  access_grants: { student_id: 'students', course_id: 'courses', enrollment_id: 'enrollments', source_id: 'order_items' },
  lesson_progress: { enrollment_id: 'enrollments', student_id: 'students', lesson_id: 'lessons' },
  quizzes: { course_id: 'courses', lesson_id: 'lessons', question_ids: 'questions' }, questions: { quiz_id: 'quizzes' },
  attempts: { quiz_id: 'quizzes', student_id: 'students' }, assignments: { course_id: 'courses', lesson_id: 'lessons' },
  submissions: { assignment_id: 'assignments', student_id: 'students' }, assessment_grades: { submission_id: 'submissions', grader_user_id: 'users' },
  conversations: { course_id: 'courses', lesson_id: 'lessons', student_id: 'students', assigned_user_id: 'users' },
  conversation_assignments: { conversation_id: 'conversations', assignee_user_id: 'users', assigned_by: 'users' },
  messages: { conversation_id: 'conversations', author_user_id: 'users' }, announcements: { course_id: 'courses', author_user_id: 'users' },
  tasks: { course_id: 'courses', assignee_user_id: 'users' }, commission_rules: { teacher_id: 'teachers', course_id: 'courses' },
  orders: { buyer_user_id: 'users' },
  order_items: { order_id: 'orders', course_id: 'courses', beneficiary_student_id: 'students', owner_teacher_id_snapshot: 'teachers' },
  payment_transactions: { order_id: 'orders' }, provider_events: { payment_transaction_id: 'payment_transactions' },
  earning_allocations: { order_item_id: 'order_items', teacher_id: 'teachers', original_allocation_id: 'earning_allocations' },
  teacher_payout_accounts: { teacher_id: 'teachers', verified_by: 'users' },
  payout_batches: { prepared_by: 'users', approved_by: 'users', allocation_ids: 'earning_allocations' },
  teacher_payouts: { batch_id: 'payout_batches', teacher_id: 'teachers', payout_account_id: 'teacher_payout_accounts', allocation_ids: 'earning_allocations' },
  refunds: { order_id: 'orders', order_item_id: 'order_items', requested_by: 'users', approved_by: 'users', adjustment_id: 'adjustments' },
  disputes: { order_item_id: 'order_items', held_allocation_ids: 'earning_allocations' },
  adjustments: { original_allocation_id: 'earning_allocations', refund_id: 'refunds', dispute_id: 'disputes' },
  financial_ledger_entries: { teacher_id: 'teachers', reversal_of: 'financial_ledger_entries' },
  notifications: { recipient_user_id: 'users', related_course_id: 'courses' }, delivery_attempts: { notification_id: 'notifications' },
  role_assignments: { user_id: 'users' }, audit_events: { actor_user_id: 'users' },
  support_tickets: { requester_user_id: 'users', course_id: 'courses', assigned_staff_id: 'users' },
  safety_reports: { reporter_user_id: 'users', message_id: 'messages', course_id: 'courses', assigned_staff_id: 'users' },
};
// Reference-looking fields resolved by the polymorphic checks below or that are not foreign keys.
const NOT_FK = { provider_events: ['event_id'], notifications: ['event_id'], tasks: ['target_id'], financial_ledger_entries: ['journal_id', 'source_id'], adjustments: ['journal_id'], audit_events: ['resource_id'], payout_batches: ['transfer_attempt_ids'], questions: ['correct_choice_id'] };
check('every reference-looking field has a declared target', () => {
  for (const [name, rows] of Object.entries(seed)) for (const row of rows) for (const field of Object.keys(row)) {
    if (!/(_id|_ids|_by)$/.test(field) || field === 'id') continue;
    assert.ok(FK[name]?.[field] || NOT_FK[name]?.includes(field), `${name}.${field} has no FK declaration`);
  }
});
for (const [name, fields] of Object.entries(FK)) check(`foreign keys ${name}`, () => {
  for (const row of seed[name]) for (const [field, target] of Object.entries(fields)) {
    const values = Array.isArray(row[field]) ? row[field] : [row[field]];
    for (const v of values) if (v !== null && v !== undefined) assert.ok(ids[target].has(v), `${name}/${row.id}.${field} -> ${target}/${v}`);
  }
});
const journals = new Map();
for (const e of seed.financial_ledger_entries) journals.set(e.journal_id, [...(journals.get(e.journal_id) ?? []), e]);
check('polymorphic references resolve', () => {
  const sourceCollections = { order_item: 'order_items', earning_allocation: 'earning_allocations', teacher_payout: 'teacher_payouts', adjustment: 'adjustments' };
  for (const e of seed.financial_ledger_entries) assert.ok(ids[sourceCollections[e.source_type]]?.has(e.source_id), `ledger ${e.id} source`);
  const resourceCollections = { teacher_application: 'teacher_applications', course: 'courses', guardian_student_link: 'guardian_student_links', access_grant: 'access_grants', payout_batch: 'payout_batches', refund: 'refunds', student: 'students', role_assignment: 'role_assignments' };
  for (const a of seed.audit_events) assert.ok(ids[resourceCollections[a.resource_type]]?.has(a.resource_id), `audit ${a.id}`);
  for (const task of seed.tasks) assert.ok(ids[task.kind === 'grading' ? 'submissions' : 'lessons'].has(task.target_id), `task ${task.id}`);
  for (const a of seed.adjustments) assert.ok(journals.has(a.journal_id), `adjustment ${a.id} journal`);
  for (const i of seed.order_items) assert.ok(ids.commission_rules.has(i.commission_snapshot.rule_id));
  for (const a of seed.earning_allocations) assert.ok(ids.commission_rules.has(a.snapshot.rule_id));
  for (const b of seed.payout_batches) for (const d of b.destination_snapshots) assert.ok(ids.teacher_payout_accounts.has(d.payout_account_id));
  for (const q of seed.questions) assert.ok(q.choices.some(c => c.id === q.correct_choice_id));
  for (const p of seed.provider_events) assert.ok(ids.orders.has(p.payload.order_id) && p.payload.beneficiary_ids.every(s => ids.students.has(s)));
  for (const page of seed.cms_pages) for (const s of page.sections) for (const c of s.course_ids ?? []) assert.ok(ids.courses.has(c));
  assert.equal(new Set(seed.provider_events.map(e => e.event_id)).size, seed.provider_events.length, 'provider event ids unique');
});

// ---------------------------------------------------------------- ledger
check('every ledger journal balances', () => {
  for (const [id, lines] of journals) {
    const debit = lines.reduce((s, e) => s + e.debit_baisa, 0), credit = lines.reduce((s, e) => s + e.credit_baisa, 0);
    assert.equal(debit, credit, `journal ${id}`);
    for (const e of lines) { assert.ok(Number.isInteger(e.debit_baisa) && Number.isInteger(e.credit_baisa)); assert.ok((e.debit_baisa === 0) !== (e.credit_baisa === 0), `entry ${e.id} one-sided`); assert.equal(e.currency, 'OMR'); }
  }
});
check('sale journals mirror commission snapshots (30.000 => 6.000 + 24.000 example)', () => {
  for (const a of seed.earning_allocations.filter(x => !x.original_allocation_id)) {
    const item = byId('order_items').get(a.order_item_id), lines = journals.get(`J-SALE-${item.id}`);
    assert.ok(lines, `sale journal for ${item.id}`);
    assert.equal(lines.find(e => e.account === 'teacher_pending').credit_baisa, a.amount_baisa);
    assert.equal(item.commission_snapshot.platform_baisa + item.commission_snapshot.teacher_baisa, item.total_baisa);
  }
  const example = byId('order_items').get('OI-001').commission_snapshot;
  assert.deepEqual([example.base_baisa, example.platform_baisa, example.teacher_baisa], [30000, 6000, 24000]);
});
check('teacher payable accounts reconcile to allocation states', () => {
  const ledgerBalance = (teacher, account) => seed.financial_ledger_entries.filter(e => e.teacher_id === teacher && e.account === account).reduce((s, e) => s + e.credit_baisa - e.debit_baisa, 0);
  for (const teacher of ['T-001', 'T-002', 'T-003']) for (const state of ['pending', 'available', 'reserved', 'in_payout']) {
    const allocated = seed.earning_allocations.filter(a => a.teacher_id === teacher && a.state === state).reduce((s, a) => s + a.amount_baisa, 0);
    assert.equal(ledgerBalance(teacher, `teacher_${state}`), allocated, `${teacher} ${state}`);
  }
});
check('earning states, batches and separation of duties', () => {
  assert.deepEqual([...new Set(seed.earning_allocations.map(a => a.state))].sort(), [...ENUMS.earning].sort());
  assert.deepEqual(seed.payout_batches.map(b => b.state).sort(), ['Approved', 'Draft', 'Failed', 'Paid', 'Processing', 'UnderReview']);
  const used = seed.payout_batches.flatMap(b => b.allocation_ids);
  assert.equal(new Set(used).size, used.length, 'allocation in two batches');
  for (const b of seed.payout_batches) { assert.notEqual(b.prepared_by, b.approved_by); assert.equal(b.total_baisa, b.allocation_ids.reduce((s, id) => s + byId('earning_allocations').get(id).amount_baisa, 0)); }
  assert.ok(!used.includes('EA-AVAILABLE'));
  const ea = byId('earning_allocations').get('EA-AVAILABLE');
  assert.equal(ea.state, 'available'); assert.equal(ea.teacher_id, 'T-001');
  for (const a of seed.earning_allocations) assert.ok(!('balance' in a) && !('wallet' in a));
});
check('order, payment and refund states', () => {
  const states = seed.orders.map(o => o.state).sort();
  assert.deepEqual(states, ['failed', 'paid', 'paid', 'paid', 'paid', 'partially_refunded', 'pending', 'refunded']);
  assert.equal(seed.orders.filter(o => seed.order_items.filter(i => i.order_id === o.id).length === 2).length, 1, 'one two-item order');
  for (const o of seed.orders) assert.equal(o.total_baisa, seed.order_items.filter(i => i.order_id === o.id).reduce((s, i) => s + i.total_baisa, 0));
  assert.deepEqual(seed.refunds.map(r => r.state).sort(), ['requested', 'succeeded']);
  const settled = new Set(seed.orders.filter(o => !['pending', 'failed'].includes(o.state)).map(o => o.id));
  for (const i of seed.order_items) assert.equal(seed.earning_allocations.filter(a => a.order_item_id === i.id && !a.original_allocation_id).length, settled.has(i.order_id) ? 1 : 0, `allocation for ${i.id}`);
});

// ---------------------------------------------------------------- catalog §4.1 distribution
const count = (rows, key) => rows.reduce((m, r) => ({ ...m, [r[key]]: (m[r[key]] ?? 0) + 1 }), {});
const gs = byId('grade_subjects'), gradeOf = c => gs.get(c.grade_subject_id).grade_id;
check('course status distribution 16/3/2/1/1/1', () => assert.deepEqual(count(seed.courses, 'status'), { Published: 16, Draft: 3, Submitted: 2, ChangesRequested: 1, Unpublished: 1, Archived: 1 }));
check('course price distribution 6 free / 18 paid', () => {
  assert.deepEqual(count(seed.courses, 'price_type'), { paid: 18, free: 6 });
  for (const c of seed.courses) assert.ok(c.price_type === 'free' ? c.price_baisa === 0 : c.price_baisa > 0 && Number.isInteger(c.price_baisa));
});
check('course mode distribution 10/6/8', () => assert.deepEqual(count(seed.courses, 'mode'), { recorded: 10, live: 6, hybrid: 8 }));
check('two courses per grade, grade 4 both Published, one Published per grade', () => {
  for (const g of seed.grades) {
    const own = seed.courses.filter(c => gradeOf(c) === g.id);
    assert.equal(own.length, 2, `grade ${g.id}`);
    assert.ok(own.some(c => c.status === 'Published'), `published in grade ${g.id}`);
  }
  assert.ok(seed.courses.filter(c => gradeOf(c) === '4').every(c => c.status === 'Published'));
});
check('owners are qualified and single', () => {
  for (const c of seed.courses) {
    assert.ok(['T-001', 'T-002', 'T-003'].includes(c.owner_teacher_id));
    assert.ok(seed.teacher_grade_subjects.some(q => q.teacher_id === c.owner_teacher_id && q.grade_subject_id === c.grade_subject_id), `${c.id} qualification`);
  }
  assert.equal(seed.teacher_grade_subjects.filter(q => q.teacher_id === 'T-001').length, 12);
  assert.equal(seed.teacher_grade_subjects.filter(q => q.teacher_id === 'T-002').length, 1);
  assert.equal(seed.teacher_grade_subjects.filter(q => q.teacher_id === 'T-003').length, 7);
});
check('grade_subjects mapping 48 + 8 + 4', () => {
  const pairs = seed.grade_subjects.map(x => x.subject_id);
  assert.equal(pairs.filter(s => ['math', 'science', 'arabic', 'english'].includes(s)).length, 48);
  assert.equal(pairs.filter(s => ['islamic', 'social'].includes(s)).length, 8);
  assert.equal(pairs.filter(s => ['physics', 'chemistry'].includes(s)).length, 4);
});
check('grades grouped into the three Oman cycles', () => assert.deepEqual(seed.grades.map(g => g.cycle_label.en), [...Array(4).fill('Basic Education Cycle 1'), ...Array(6).fill('Basic Education Cycle 2'), ...Array(2).fill('Post-Basic Education')]));
check('three modules / nine lessons per course; preview and locked lessons', () => {
  const mods = byId('modules');
  for (const c of seed.courses) {
    const m = seed.modules.filter(x => x.course_id === c.id), l = seed.lessons.filter(x => mods.get(x.module_id).course_id === c.id);
    assert.equal(m.length, 3); assert.equal(l.length, 9);
    if (c.status === 'Published' && c.price_type === 'paid') { assert.ok(l.some(x => x.preview)); assert.ok(l.some(x => !x.preview && ['reading', 'video'].includes(x.type))); }
    for (const x of l.filter(x => x.type === 'quiz')) assert.ok(seed.quizzes.some(q => q.lesson_id === x.id), `quiz record for ${x.id}`);
    for (const x of l.filter(x => x.type === 'assignment')) assert.ok(seed.assignments.some(q => q.lesson_id === x.id), `assignment record for ${x.id}`);
  }
  for (const q of seed.quizzes) assert.equal(byId('lessons').get(q.lesson_id).type, 'quiz');
  for (const a of seed.assignments) assert.equal(byId('lessons').get(a.lesson_id).type, 'assignment');
  for (const q of seed.quizzes) assert.equal(mods.get(byId('lessons').get(q.lesson_id).module_id).course_id, q.course_id);
});
check('bilingual names everywhere', () => {
  for (const name of ['users', 'students', 'guardians', 'teachers', 'grades', 'subjects', 'courses', 'modules', 'lessons']) for (const r of seed[name]) {
    const value = r.name ?? r.title;
    assert.ok(value?.ar && value?.en, `${name}/${r.id}`);
  }
  for (const u of seed.users) assert.match(u.email, /@example\.test$/);
});

// ---------------------------------------------------------------- access and learning
check('access grants 10 active / 2 expired / 2 revoked, zero subscriptions', () => {
  assert.deepEqual(count(seed.access_grants, 'status'), { active: 10, expired: 2, revoked: 2 });
  assert.ok(!seed.access_grants.some(g => g.origin === 'subscription'));
  const enrollments = byId('enrollments');
  for (const g of seed.access_grants) {
    const e = enrollments.get(g.enrollment_id);
    assert.equal(e.student_id, g.student_id); assert.equal(e.course_id, g.course_id);
    if (g.status === 'active') { assert.equal(e.status, 'active'); assert.ok(g.starts_at <= DEMO_NOW && g.ends_at > DEMO_NOW, g.id); }
    if (g.status === 'expired') assert.ok(g.ends_at <= DEMO_NOW, g.id);
    if (g.origin === 'one_time_purchase') { const item = byId('order_items').get(g.source_id); assert.equal(item.beneficiary_student_id, g.student_id); assert.equal(item.course_id, g.course_id); }
    if (g.origin === 'complimentary') assert.equal(byId('courses').get(g.course_id).price_type, 'free');
  }
  for (const i of seed.order_items) {
    const state = byId('orders').get(i.order_id).state;
    if (['pending', 'failed'].includes(state)) assert.ok(!seed.access_grants.some(g => g.source_id === i.id), `unsettled ${i.id} grants access`);
  }
});
check('progress belongs to enrolled course lessons; Draft courses have no learners', () => {
  const mods = byId('modules'), lessons = byId('lessons'), enrollments = byId('enrollments');
  for (const p of seed.lesson_progress) { const e = enrollments.get(p.enrollment_id); assert.equal(e.student_id, p.student_id); assert.equal(mods.get(lessons.get(p.lesson_id).module_id).course_id, e.course_id); }
  for (const e of seed.enrollments) assert.ok(!['Draft', 'Submitted', 'ChangesRequested'].includes(byId('courses').get(e.course_id).status), e.id);
  for (const s of seed.live_sessions) assert.ok(['Published', 'Archived'].includes(byId('courses').get(s.course_id).status), s.id);
  for (const a of seed.attendance) assert.ok(seed.enrollments.some(e => e.student_id === a.student_id && e.course_id === byId('live_sessions').get(a.live_session_id).course_id));
  assert.ok(!seed.attendance.some(a => ['failed', 'cancelled', 'scheduled', 'rescheduled'].includes(byId('live_sessions').get(a.live_session_id).status)));
});
check('live sessions and recordings cover required states', () => {
  for (const s of ['scheduled', 'live', 'ended', 'cancelled', 'rescheduled', 'failed']) assert.ok(seed.live_sessions.some(x => x.status === s), s);
  assert.deepEqual(count(seed.recordings, 'state'), { processing: 2, ready: 2, published: 2 });
});
check('conversations: 4 C-001, 2 C-002, 4 outside; assignments 3 assistant + 1 teacher', () => {
  assert.deepEqual(count(seed.conversations, 'course_id')['C-001'], 4);
  assert.equal(seed.conversations.filter(c => c.course_id === 'C-002').length, 2);
  assert.equal(seed.conversations.filter(c => !['C-001', 'C-002'].includes(c.course_id)).length, 4);
  assert.equal(seed.conversation_assignments.filter(a => a.assignee_user_id === 'U-A001').length, 3);
  assert.equal(seed.conversation_assignments.filter(a => a.assignee_user_id === 'U-T001').length, 1);
  for (const c of seed.conversations) assert.ok(seed.enrollments.some(e => e.student_id === c.student_id && e.course_id === c.course_id), `${c.id} learner enrolled`);
  assert.equal(seed.tasks.filter(x => x.kind === 'grading').length, 2); assert.equal(seed.tasks.filter(x => x.kind === 'content').length, 2);
});
check('guardian links match fixture', () => {
  const state = (g, s) => seed.guardian_student_links.find(l => l.guardian_id === g && l.student_id === s)?.state;
  assert.deepEqual([state('G-001', 'S-001'), state('G-001', 'S-002'), state('G-001', 'S-003'), state('G-001', 'S-004'), state('G-002', 'S-001'), state('G-002', 'S-005')], ['verified', 'verified', 'pending_verification', 'revoked', 'verified', 'rejected']);
});
check('teacher application states', () => {
  assert.deepEqual(seed.teachers.map(x => x.application_status), ['approved', 'approved', 'approved', 'submitted', 'more_info_required', 'rejected']);
  assert.equal(byId('teacher_team_members').get('TM-001').status, 'active'); assert.equal(byId('teacher_team_members').get('TM-002').status, 'invited');
  assert.deepEqual(seed.course_team_assignments.map(a => [a.course_id, a.capabilities.slice().sort().join()]), [['C-001', 'grade_assignment,read_content,reply_conversation'], ['C-002', 'edit_content,read_content,reply_conversation']]);
});

// ---------------------------------------------------------------- anchors §4.2
check('anchor records', () => {
  const c = byId('courses'), l = byId('lessons');
  const c1 = c.get('C-001'); assert.deepEqual([gradeOf(c1), gs.get(c1.grade_subject_id).subject_id, c1.mode, c1.status, c1.price_baisa, c1.owner_teacher_id], ['4', 'math', 'hybrid', 'Published', 30000, 'T-001']);
  assert.equal(l.get('L-001').preview, true); assert.equal(l.get('L-002').preview, false);
  assert.equal(byId('modules').get(l.get('L-002').module_id).course_id, 'C-001');
  const ls1 = byId('live_sessions').get('LS-001'); assert.equal(ls1.course_id, 'C-001'); assert.equal(ls1.status, 'scheduled'); assert.ok(ls1.starts_at > DEMO_NOW);
  const c2 = c.get('C-002'); assert.deepEqual([gradeOf(c2), gs.get(c2.grade_subject_id).subject_id, c2.mode, c2.status, c2.price_type, c2.owner_teacher_id], ['4', 'science', 'recorded', 'Published', 'free', 'T-001']);
  const c3 = c.get('C-003'); assert.deepEqual([gradeOf(c3), gs.get(c3.grade_subject_id).subject_id, c3.status, c3.owner_teacher_id], ['6', 'math', 'Draft', 'T-001']);
  const c4 = c.get('C-004'); assert.deepEqual([gradeOf(c4), gs.get(c4.grade_subject_id).subject_id, c4.status, c4.owner_teacher_id], ['12', 'english', 'Published', 'T-002']);
  const c5 = c.get('C-005'); assert.deepEqual([gradeOf(c5), gs.get(c5.grade_subject_id).subject_id, c5.status, c5.price_type, c5.owner_teacher_id], ['5', 'science', 'Published', 'free', 'T-001']);
  assert.ok(seed.quizzes.some(q => q.course_id === 'C-005') && seed.assignments.some(a => a.course_id === 'C-005'));
  assert.ok(seed.lesson_resources.some(r => r.kind === 'worksheet' && byId('modules').get(l.get(r.lesson_id).module_id).course_id === 'C-005'));
  assert.ok(seed.assignments.some(a => a.course_id === 'C-001'), 'C-001 assignment for assistant grading');
  assert.ok(seed.tasks.some(x => x.course_id === 'C-002' && x.kind === 'content' && x.assignee_user_id === 'U-A001'), 'C-002 content task for assistant');
  const enrolled = (s, course) => seed.enrollments.some(e => e.student_id === s && e.course_id === course);
  assert.ok(!enrolled('S-001', 'C-001'), 'Maryam not enrolled in C-001'); assert.ok(!enrolled('S-001', 'C-005'));
  assert.ok(seed.access_grants.some(g => g.student_id === 'S-001' && g.course_id === 'C-002' && g.status === 'active' && g.origin === 'complimentary'));
  assert.ok(seed.access_grants.some(g => g.student_id === 'S-001' && g.status !== 'active'), 'Maryam historical grant');
  const q1 = byId('conversations').get('Q-001'); assert.deepEqual([q1.course_id, q1.student_id], ['C-002', 'S-001']);
  for (const id of ['Q-001', 'Q-002', 'Q-003']) assert.ok(seed.conversation_assignments.some(a => a.conversation_id === id && a.assignee_user_id === 'U-A001'));
  assert.equal(byId('teachers').get('T-004').application_status, 'submitted');
  assert.equal(byId('students').get('S-001').current_grade_id, '4'); assert.equal(byId('students').get('S-002').current_grade_id, '7');
  assert.ok(seed.role_assignments.some(r => r.user_id === 'U-F002' && r.role === 'admin_finance'), 'second finance actor');
});
check('personas resolve to seeded records', () => {
  assert.deepEqual(Object.keys(PERSONAS), ['visitor', 'student', 'guardian', 'teacher', 'assistant', 'admin_finance', 'admin_moderation', 'super_admin']);
  const records = { student: 'students', guardian: 'guardians', teacher: 'teachers', assistant: 'teacher_team_members' };
  for (const [role, p] of Object.entries(PERSONAS)) {
    if (role === 'visitor') { assert.equal(p.user_id, null); assert.ok(!seed.role_assignments.some(r => r.role === 'visitor')); continue; }
    const user = byId('users').get(p.user_id); assert.ok(user, role);
    assert.deepEqual(user.name, p.name, `${role} name`);
    if (records[role]) assert.equal(byId(records[role]).get(p.record_id).user_id, p.user_id, role);
    assert.ok(seed.role_assignments.some(r => r.user_id === p.user_id && r.role === role), `${role} assignment`);
  }
});

// ---------------------------------------------------------------- store scope primitives
const as = role => { const r = dispatch('preferences.set', { role }); assert.ok(r.ok, role); return getState(); };
const course = id => getState().courses.find(c => c.id === id);
const student = id => getState().students.find(s => s.id === id);
check('dispatch contract', () => {
  const bad = dispatch('nope.nothing', {}); assert.deepEqual(Object.keys(bad).sort(), ['data', 'errorKey', 'fieldErrors', 'ok']); assert.equal(bad.ok, false);
  assert.equal(dispatch('preferences.set', { role: 'root' }).ok, false);
  assert.ok(Object.isFrozen(getState()), 'state is immutable');
});
check('can(): assistant denied C-004, allowed assigned C-001/C-002 capabilities only', () => {
  as('assistant');
  for (const action of ['course.read', 'read_content', 'reply_conversation', 'grade_assignment']) assert.equal(can(action, course('C-004')), false, action);
  assert.equal(can('read_content', course('C-001')), true); assert.equal(can('grade_assignment', course('C-001')), true);
  assert.equal(can('edit_content', course('C-001')), false); assert.equal(can('grade_assignment', course('C-002')), false); assert.equal(can('edit_content', course('C-002')), true);
  assert.equal(can('finance.read', { module: 'finance' }), false); assert.equal(can('child.read', student('S-001')), false);
  const conv = id => getState().conversations.find(c => c.id === id);
  assert.equal(can('conversation.read', conv('Q-002')), true); assert.equal(can('conversation.read', conv('Q-005')), false, 'unassigned C-001 conversation');
});
check('can(): admin_moderation denied finance, admin_finance denied people', () => {
  as('admin_moderation');
  assert.equal(can('finance.read', { module: 'finance' }), false); assert.equal(can('finance.approve_payout', getState().payout_batches[1]), false);
  assert.equal(can('people.read', { module: 'people' }), true); assert.equal(can('people.read', { module: 'people', type: 'employees' }), false);
  assert.equal(can('settings.read', { module: 'settings' }), false); assert.equal(can('cms.edit', { module: 'cms' }), false);
  as('admin_finance');
  assert.equal(can('people.read', { module: 'people' }), false); assert.equal(can('support.read', { module: 'support' }), false);
  assert.equal(can('finance.read', { module: 'finance' }), true);
  const batch = id => getState().payout_batches.find(b => b.id === id);
  assert.equal(can('approve_payout', batch('PB-003')), false, 'own prepared batch'); assert.equal(can('approve_payout', batch('PB-002')), true, 'independent batch');
  as('super_admin');
  assert.equal(can('people.read', { module: 'people' }), true); assert.equal(can('finance.read', { module: 'finance' }), true); assert.equal(can('settings.read', { module: 'settings' }), true);
  assert.equal(can('approve_payout', batch('PB-002')), true);
  assert.equal(can('approve_payout', { ...batch('PB-002'), prepared_by: 'U-O001' }), false, 'super admin cannot self-approve');
});
check('can(): guardian denied S-003 child detail, allowed verified children', () => {
  as('guardian');
  assert.equal(can('child.read', student('S-003')), false); assert.equal(can('child.read', student('S-004')), false); assert.equal(can('child.read', student('S-005')), false);
  assert.equal(can('child.read', student('S-001')), true); assert.equal(can('child.read', student('S-002')), true);
  assert.equal(can('purchase', student('S-003')), false); assert.equal(can('read_content', course('C-002')), false, 'no player by link');
  assert.deepEqual(select('guardian.children').map(s => s.id), ['S-001', 'S-002']);
});
check('can(): student and teacher course scope; visitor protected', () => {
  as('student');
  assert.equal(can('read_content', course('C-002')), true); assert.equal(can('read_content', course('C-001')), false); assert.equal(can('read_content', course('C-011')), false, 'expired grant');
  as('teacher');
  assert.equal(can('course.read', course('C-001')), true); assert.equal(can('course.read', course('C-003')), true); assert.equal(can('course.read', course('C-004')), false);
  as('visitor');
  assert.equal(can('course.read', course('C-002')), false); assert.equal(can('public.read', course('C-001')), true); assert.equal(can('public.read', course('C-003')), false);
});
check('selectors used by home, layouts and switcher', () => {
  as('visitor');
  const catalog = select('publishedCatalog');
  assert.equal(catalog.length, 16); assert.ok(catalog.every(c => c.status === 'Published' && c.teacher && c.grade && c.subject));
  assert.ok(select('featuredCourses').length >= 3 && select('featuredCourses').length <= 8);
  assert.ok(select('featuredTeachers').every(t => t.application_status === 'approved' && t.published_course_count >= 1));
  assert.equal(select('grades').length, 12); assert.equal(select('subjects').length, 8); assert.equal(select('curricula').length, 1);
  assert.equal(select('cycles').length, 3);
  assert.equal(select('notifications.count'), 0);
  as('student'); assert.equal(select('notifications.count'), 2);
  as('guardian'); assert.equal(select('notifications.count'), 2);
  assert.equal(select('nav').length, 7);
  as('super_admin'); assert.ok(select('nav').length >= 30);
  as('visitor');
});
check('resetDemoData reseeds and keeps preferences', () => {
  as('teacher');
  resetDemoData();
  assert.equal(getState().preferences.role, 'teacher'); assert.equal(getState().courses.length, 24);
  as('visitor');
});

// ---------------------------------------------------------------- routes and i18n
const ALL = ['visitor', 'student', 'guardian', 'teacher', 'assistant', 'admin_finance', 'admin_moderation', 'super_admin'];
check('99 registered route patterns with literal role arrays', () => {
  assert.equal(routes.length, 99); assert.equal(new Set(routes.map(r => r.path)).size, 99);
  for (const r of routes) { assert.ok(Array.isArray(r.roles) && r.roles.length && r.roles.every(x => ALL.includes(x)), r.path); assert.ok(r.view && typeof r.view.render === 'function', r.path); }
  const totals = Object.fromEntries(ALL.map(role => [role, routes.filter(r => r.roles.includes(role)).length]));
  assert.deepEqual(totals, { visitor: 16, student: 32, guardian: 30, teacher: 29, assistant: 25, admin_finance: 25, admin_moderation: 28, super_admin: 52 });
});
check('i18n has every route title in AR and EN', () => {
  for (const r of routes) {
    const entry = dictionary[`route.${r.path}`];
    assert.ok(entry?.ar && entry?.en, r.path); assert.deepEqual(entry, r.title, `title mismatch ${r.path}`);
  }
});
const STATUS = {
  teacher_application: 'draft_application مسودة / Draft; submitted مقدّم / Submitted; under_review قيد المراجعة / Under review; approved معتمد / Approved; rejected مرفوض / Rejected; more_info_required معلومات إضافية مطلوبة / More information required',
  account: 'active نشط / Active; invited مدعو / Invited; suspended موقوف / Suspended; deactivated غير مفعل / Deactivated',
  course: 'Draft مسودة / Draft; Submitted مقدّم للمراجعة / Submitted; ChangesRequested تعديلات مطلوبة / Changes requested; Published منشور / Published; Unpublished غير منشور / Unpublished; Archived مؤرشف / Archived',
  order: 'draft مسودة / Draft; pending بانتظار الدفع / Pending payment; paid مدفوع / Paid; failed فشل الدفع / Failed; cancelled ملغى / Cancelled; partially_refunded مسترد جزئياً / Partially refunded; refunded مسترد / Refunded',
  payment: 'initiated بدأ الدفع / Initiated; pending قيد الانتظار / Pending; succeeded ناجح / Succeeded; failed فاشل / Failed; refunded مسترد / Refunded; partially_refunded مسترد جزئياً / Partially refunded',
  earning: 'pending معلّق / Pending; available متاح للصرف / Available; reserved محجوز / Reserved; in_payout قيد الصرف / In payout; paid مدفوع / Paid; adjusted معدّل / Adjusted',
  payout_batch: 'Draft مسودة / Draft; UnderReview قيد المراجعة / Under review; Approved معتمد / Approved; Processing قيد المعالجة / Processing; Paid مدفوع / Paid; Failed فاشل / Failed; Rejected معاد للتعديل / Returned for changes',
  conversation: 'open مفتوح / Open; assigned مسند / Assigned; waiting بانتظار الرد / Waiting; resolved محلول / Resolved; escalated مصعّد / Escalated',
  guardian_link: 'requested طلب ربط / Requested; pending_verification بانتظار التحقق / Pending verification; verified موثّق / Verified; rejected مرفوض / Rejected; revoked ملغى / Revoked',
  access: 'active ساري / Active; expired منتهي / Expired; revoked ملغى / Revoked',
  enrollment: 'active نشط / Active; completed مكتمل / Completed; suspended معلّق / Suspended',
  lesson_progress: 'not_started لم يبدأ / Not started; in_progress قيد التعلم / In progress; done مكتمل / Done',
  content: 'draft مسودة / Draft; processing قيد التجهيز / Processing; ready جاهز / Ready; published منشور / Published; failed فاشل / Failed',
  live: 'draft مسودة / Draft; scheduled مجدول / Scheduled; rescheduled أعيدت جدولته / Rescheduled; live مباشر / Live; ended انتهى / Ended; recording_processing تجهيز التسجيل / Recording processing; recording_ready التسجيل جاهز / Recording ready; recording_published التسجيل منشور / Recording published; cancelled ملغى / Cancelled; failed تعذر الاتصال / Unavailable',
  submission: 'not_submitted لم يسلّم / Not submitted; submitted مسلّم / Submitted; graded مصحح / Graded; released النتيجة منشورة / Result released',
  refund: 'requested مطلوب / Requested; under_review قيد المراجعة / Under review; approved معتمد / Approved; processing قيد المعالجة / Processing; succeeded مسترد / Refunded; rejected مرفوض / Rejected; failed فاشل / Failed',
  dispute: 'open مفتوح / Open; under_review قيد المراجعة / Under review; won لصالح المنصة / Won; lost استرداد قسري / Lost',
  task: 'open مفتوحة / Open; in_progress قيد التنفيذ / In progress; done مكتملة / Done',
  delivery: 'queued في الطابور / Queued; sent مرسل / Sent; failed فاشل / Failed; read مقروء / Read',
};
check('i18n has every canonical status key in AR and EN (§3.1)', () => {
  for (const [domain, spec] of Object.entries(STATUS)) {
    const states = spec.split('; ').map(part => { const [, state, ar, en] = part.match(/^(\S+) (.+) \/ (.+)$/); return [state, ar, en]; });
    assert.deepEqual(states.map(s => s[0]), ENUMS[domain], `enum ${domain}`);
    for (const [state, ar, en] of states) assert.deepEqual(dictionary[`status.${domain}.${state}`], { ar, en }, `status.${domain}.${state}`);
  }
});
check('i18n entries are complete pairs', () => { for (const [k, v] of Object.entries(dictionary)) assert.ok(typeof v.ar === 'string' && v.ar && typeof v.en === 'string' && v.en, k); });
check('money() formats 3 decimals in both languages', () => {
  dispatch('preferences.set', { lang: 'ar' });
  assert.equal(money(30000), '30.000 ر.ع.'); assert.equal(money(0), '0.000 ر.ع.'); assert.equal(money(1234567), '1,234.567 ر.ع.');
  dispatch('preferences.set', { lang: 'en' });
  assert.equal(money(30000), 'OMR 30.000'); assert.equal(money(-24000), 'OMR -24.000');
  assert.equal(t('route./'), 'Home');
  dispatch('preferences.set', { lang: 'ar' });
  assert.equal(t('route./'), 'الرئيسية');
});


// P2 behavior and rendering: no DOM or listening socket required.
check('P2 catalog filters exclude every non-public course', () => {
  resetDemoData(); as('visitor');
  for (const c of getState().courses) assert.equal(!!select('course.public',{id:c.id}),c.status==='Published');
  const rows=select('catalog.search',{grade:'4',subject:'math'});
  assert.ok(rows.length); assert.ok(rows.every(c=>c.grade.id==='4'&&c.subject.id==='math'));
  assert.ok(select('catalog.search',{price:'free'}).every(c=>c.price_type==='free'));
  assert.ok(select('catalog.search',{max:'0'}).every(c=>c.price_baisa===0));
  assert.equal(select('catalog.search',{q:'impossible-result'}).length,0);
  assert.equal(select('gradeSubject',{gradeId:'4',subjectId:'physics'}),null);
  assert.ok(select('teacher.public',{id:'T-001'}).courses.every(c=>c.status==='Published'));
  assert.equal(select('teacher.public',{id:'T-004'}),null);
  const locked=select('course.public',{id:'C-001'}).modules.flatMap(m=>m.lessons).find(l=>l.id==='L-002');
  assert.equal(select('course.public',{id:'C-001'}).pending_revision,undefined);
  assert.equal(locked.preview,false); assert.equal(locked.body,undefined); assert.equal(locked.transcript,undefined);
});
check('P2 free enrollment is scoped, atomic and idempotent', () => {
  as('visitor');assert.equal(dispatch('enrollment.enrollFree',{courseId:'C-005'}).ok,false);
  as('guardian');assert.equal(dispatch('enrollment.enrollFree',{courseId:'C-005'}).ok,false);
  as('student');
  assert.equal(dispatch('enrollment.enrollFree',{courseId:'C-001'}).ok,false);
  assert.equal(dispatch('enrollment.enrollFree',{courseId:'C-003'}).ok,false);
  const before=getState(),r=dispatch('enrollment.enrollFree',{courseId:'C-005'});assert.ok(r.ok);
  assert.equal(getState().enrollments.length,before.enrollments.length+1);
  assert.equal(getState().access_grants.length,before.access_grants.length+1);
  assert.equal(getState().access_grants.find(g=>g.id===r.data.grant_id).origin,'complimentary');
  assert.ok(can('read_content',course('C-005')));
  const twice=dispatch('enrollment.enrollFree',{courseId:'C-005'});assert.ok(twice.ok&&twice.data.existing);
  assert.equal(twice.data.grant_id,r.data.grant_id);assert.equal(getState().orders.length,before.orders.length);
  assert.equal(getState().financial_ledger_entries.length,before.financial_ledger_entries.length);
});
check('P2 contact creates an owned ticket, anonymous contact creates none',()=>{
 const values={topic:'account',subject:'Demo question',body:'A synthetic message for help.',email:'visitor@example.test'};
 as('student');const before=getState().support_tickets.length,r=dispatch('support.createTicket',values);assert.ok(r.ok);
 const ticket=getState().support_tickets.find(x=>x.id===r.data.ticketId);assert.equal(ticket.requester_user_id,'U-S001');assert.equal(ticket.state,'open');
 as('visitor');assert.ok(dispatch('support.createTicket',values).ok);assert.equal(getState().support_tickets.length,before+1);
 assert.equal(dispatch('support.createTicket',{...values,email:'bad'}).ok,false);
});
check('P2 auth validates form and rejects external or unauthorized returns',()=>{
 const values={email:'demo@example.test',password:'demo',persona:'guardian'};
 assert.equal(dispatch('auth.signIn',{...values,email:'bad'}).ok,false);
 assert.equal(dispatch('auth.signIn',{...values,returnTo:'#/checkout/C-001/beneficiary'}).data.hash,'#/checkout/C-001/beneficiary');
 for(const returnTo of ['https://example.test','#//example.test','#/admin','#/teacher/course/C-001','#/student/course/C-002','#/checkout/../admin','#/auth/sign-in'])assert.equal(dispatch('auth.signIn',{...values,returnTo}).data.hash,'#/guardian');
 assert.ok(dispatch('auth.registerGuardian',{name:'Demo Guardian',contact:'guardian@example.test',consent:true}).ok);
 assert.ok(dispatch('auth.registerStudent',{name:'Demo Student',email:'student@example.test',grade:'4',consent:true}).ok);
 assert.equal(JSON.stringify(getState().transient).includes('password'),false);
});

// Isolated seeds exercise reviewer-controlled states without introducing a P2 moderation action.
const {readFile}=await import('node:fs/promises');
const storeSource=await readFile(new URL('../prototype/core/store.js',import.meta.url),'utf8');
for(const initial of ['draft_application','submitted','more_info_required','rejected','under_review']) {
 const fixtureSource=storeSource.replace("'./data.js'",JSON.stringify(new URL('../prototype/core/data.js',import.meta.url).href)).replaceAll('...createSeed()','...fixtureSeed()')+`\nfunction fixtureSeed(){const s=createSeed();s.teacher_applications.find(a=>a.teacher_id==='T-004').state=${JSON.stringify(initial)};return s;}`;
 const isolated=await import('data:text/javascript;base64,'+Buffer.from(fixtureSource).toString('base64'));
 check('P2 application transition from '+initial,()=>{
  isolated.dispatch('preferences.set',{role:'visitor'});
  const d=(type,payload)=>isolated.dispatch(type,payload),editable=['draft_application','submitted','more_info_required'].includes(initial);
  assert.equal(d('application.saveStep',{step:'identity',values:{name:'Demo Teacher',email:'teacher@example.test',bio:'A synthetic teaching biography with experience.'}}).ok,editable);
  if(!editable){assert.equal(d('application.submit',{consent:true}).ok,false);return;}
  assert.equal(d('application.submit',{consent:true}).ok,false,'missing credentials rejected');
  assert.ok(d('application.saveStep',{step:'qualifications',values:{pairs:['GS-4-math','GS-5-science']}}).ok);
  assert.ok(d('application.saveStep',{step:'credentials',values:{credentials:[{label:'Teaching licence',filename:'license.pdf'}]}}).ok);
  const r=d('application.submit',{consent:true});assert.ok(r.ok,JSON.stringify(r));assert.equal(r.data.state,'submitted');
  assert.equal(isolated.select('application.current').application.state,'submitted');
  assert.equal(isolated.select('teacher.public',{id:'T-004'}),null);
  isolated.dispatch('preferences.set',{role:'student'});assert.equal(d('application.submit',{consent:true}).ok,false);
 });
}

let renders=0;
const unknownEntry=dictionary.unknown;
dictionary.unknown={ar:'MISSING_DICTIONARY_KEY',en:'MISSING_DICTIONARY_KEY'};
resetDemoData();
for(const role of ['visitor','student','guardian'])for(const lang of ['ar','en']) {
 dispatch('preferences.set',{role,lang});
 for(const route of routes.filter(r=>r.phase<=2)) {
  const params={gradeId:'4',subjectId:'math',id:route.path==='/teacher/:id'?'T-001':'C-001',page:'privacy'};
  const path=route.path.replace(/:(\w+)/g,(_,key)=>params[key]);
  const variants=[new URLSearchParams()];
  for(const [key,values]of Object.entries(route.queryValues))for(const value of values)variants.push(new URLSearchParams({[key]:value}));
  if(route.path==='/legal/:page')for(const page of ['terms','refunds','bad'])variants.push(new URLSearchParams({testPage:page}));
  if(route.path==='/explore')variants.push(new URLSearchParams({tab:'courses',q:'no-matches',page:'999'}));
  for(const query of variants)check(`P2 render ${role}/${lang} ${path}?${query}`,()=>{
   const ctx={role,actor:select('actor'),route,params:{...params,page:query.get('testPage')??params.page},path,query,navigate:()=>{},dispatch};
   const html=route.view.render(ctx);renders++;
   assert.ok(html.length>0);assert.doesNotMatch(html,/undefined|\[object Object\]|NaN|MISSING_DICTIONARY_KEY/);
   const visible=html.replace(/<[^>]+>/g,' ');
   assert.doesNotMatch(visible,/\b(?:p2|error|route|status)\.[\w./:-]+/);
  });
 }
}
dictionary.unknown=unknownEntry;
resetDemoData();dispatch('preferences.set',{role:'visitor',lang:'ar'});
console.log(`P2 render smoke: ${renders} renders`);

// ---------------------------------------------------------------- P3 checkout + payment invariants
const checkoutViews=await import('../prototype/views/checkout.js');
const {fallback}=await import('../prototype/core/layout.js');
const {disposeOverlays:disposeCheckoutToasts}=await import('../prototype/core/ui.js');
const p3Reset=(role='student')=>{resetDemoData();dispatch('preferences.set',{role});};
const makeOrder=(courseId='C-001',studentId='S-001',free=false)=>dispatch(free?'checkout.activateFree':'checkout.createOrder',{courseId,studentId,consent:true});
const sendPayment=(orderId,outcome)=>dispatch('payment.processEvent',select('checkout.event',{orderId,outcome}));
check('P3 pending, failure, retry and success preserve item and fulfill once',()=>{
 p3Reset('guardian');const before=getState(),created=makeOrder();assert.ok(created.ok);const id=created.data.orderId;
 assert.equal(makeOrder().data.orderId,id);
 const original=structuredClone(select('checkout.order',{orderId:id}).items[0]);
 assert.equal(original.commission_snapshot.rate_bps,2000);assert.equal(original.commission_snapshot.platform_baisa,6000);assert.equal(original.commission_snapshot.teacher_baisa,24000);
 const tx=select('checkout.order',{orderId:id}).transaction.id;
 assert.ok(sendPayment(id,'pending').ok);assert.ok(sendPayment(id,'failure').ok);
 for(const key of ['enrollments','access_grants','earning_allocations','financial_ledger_entries'])assert.equal(getState()[key].length,before[key].length);
 assert.ok(dispatch('payment.retry',{orderId:id}).ok);assert.notEqual(select('checkout.order',{orderId:id}).transaction.id,tx);
 const attempts=getState().payment_transactions.length;assert.ok(dispatch('payment.retry',{orderId:id}).ok);assert.equal(getState().payment_transactions.length,attempts);
 const event=select('checkout.event',{orderId:id,outcome:'success'});assert.ok(dispatch('payment.processEvent',event).ok);
 assert.ok(dispatch('payment.processEvent',event).ok);assert.ok(dispatch('payment.processEvent',event).ok);
 assert.ok(sendPayment(id,'success').ok);assert.ok(sendPayment(id,'pending').ok);assert.ok(sendPayment(id,'failure').ok);
 assert.equal(select('checkout.result',{orderId:id,status:'failed'}).outcome,'success');
 assert.deepEqual(select('checkout.order',{orderId:id}).items[0],original);
 assert.equal(getState().enrollments.length,before.enrollments.length+1);assert.equal(getState().access_grants.length,before.access_grants.length+1);assert.equal(getState().earning_allocations.length,before.earning_allocations.length+1);
 const journal=select('checkout.ledger',{orderId:id});assert.equal(journal.length,3);assert.equal(new Set(journal.map(x=>x.journal_id)).size,1);assert.equal(journal.reduce((n,x)=>n+x.debit_baisa-x.credit_baisa,0),0);
 assert.equal(getState().notifications.length,before.notifications.length+2);
});
check('P3 forged events reject atomically and success URLs are powerless',()=>{
 p3Reset();const id=makeOrder().data.orderId;
 assert.equal(select('checkout.result',{orderId:id,status:'success'}).outcome,'initiated');
 const event=select('checkout.event',{orderId:id,outcome:'success'});
 for(const patch of [{amount_baisa:1},{currency:'USD'},{order_id:'O-nope'},{beneficiary_ids:['S-002']}]){
  const before=getState(),bad=structuredClone(event);Object.assign(bad.payload,patch);assert.equal(dispatch('payment.processEvent',bad).ok,false);assert.equal(getState(),before);
 }
 assert.ok(dispatch('payment.processEvent',event).ok);
 const before=getState(),bad=structuredClone(event);bad.payload.outcome='failure';assert.equal(dispatch('payment.processEvent',bad).ok,false);assert.equal(getState(),before);
});
check('P3 purchase scope, explicit guardian selection, self beneficiary and buyer ownership',()=>{
 p3Reset('guardian');assert.equal(select('checkout.context',{courseId:'C-001'}).student,null);
 assert.deepEqual(select('checkout.context',{courseId:'C-001'}).children.map(s=>s.id),['S-001','S-002']);
 for(const sid of ['S-003','S-004','S-005']){assert.equal(makeOrder('C-001',sid).ok,false);assert.equal(select('checkout.context',{courseId:'C-001',studentId:sid}).status,'denied');}
 assert.equal(dispatch('checkout.createOrder',{courseId:'C-001',consent:true}).ok,false);
 const pre=routes.find(r=>r.path==='/checkout/:courseId/beneficiary').view.render({params:{courseId:'C-001'},query:new URLSearchParams('child=S-002'),role:'guardian',actor:select('actor'),dispatch,navigate:()=>{}});
 assert.match(pre,/value="S-002"\s+checked/);assert.doesNotMatch(pre,/S-003|S-004/);
 const id=makeOrder().data.orderId;dispatch('preferences.set',{role:'student'});
 assert.equal(makeOrder('C-001','S-002').ok,false);assert.equal(select('checkout.context',{courseId:'C-001'}).student.id,'S-001');
 assert.equal(select('checkout.order',{orderId:id}).status,'denied');assert.equal(dispatch('payment.retry',{orderId:id}).ok,false);
 assert.equal(select('checkout.context',{courseId:'C-003'}).status,'missing');assert.equal(makeOrder('C-003').ok,false);
 assert.equal(dispatch('checkout.createOrder',{courseId:'C-001',studentId:'S-001'}).ok,false);
});
check('P3 teacher override and free bypass',()=>{
 p3Reset();const id=makeOrder('C-004').data.orderId;assert.equal(select('checkout.order',{orderId:id}).items[0].commission_snapshot.rate_bps,1500);
 const before=getState(),free=makeOrder('C-005','S-001',true);assert.ok(free.ok);assert.equal(makeOrder('C-005','S-001',true).data.orderId,free.data.orderId);
 assert.equal(getState().payment_transactions.length,before.payment_transactions.length);assert.equal(getState().earning_allocations.length,before.earning_allocations.length);assert.equal(getState().financial_ledger_entries.length,before.financial_ledger_entries.length);
 assert.equal(select('checkout.result',{orderId:free.data.orderId}).outcome,'success');assert.equal(getState().access_grants.at(-1).origin,'complimentary');assert.equal(getState().access_grants.at(-1).ends_at,'2027-07-31T19:59:59Z');
 assert.equal(select('checkout.context',{courseId:'C-005'}).hasAccess,true);
});
check('P3 confirm without redirect action processes success and replays once',()=>{
 p3Reset();const id=makeOrder().data.orderId;let actions;checkoutViews.registerActions((_ns,a)=>{actions=a;});
 // Toast DOM is the only browser dependency of this action.
 const saved=globalThis.document;globalThis.document={getElementById:()=>null};
 try {const ctx={params:{orderId:id},dispatch,navigate:()=>assert.fail('Unexpected redirect')};actions.confirmStay(null,null,ctx);actions.confirmStay(null,null,ctx);actions.replay(null,null,ctx);}finally{disposeCheckoutToasts();globalThis.document=saved;}
 const item=select('checkout.order',{orderId:id}).items[0];assert.equal(getState().access_grants.filter(g=>g.source_id===item.id).length,1);assert.equal(getState().earning_allocations.filter(a=>a.order_item_id===item.id).length,1);
 const journal=select('checkout.ledger',{orderId:id});assert.equal(journal.length,3);assert.equal(new Set(journal.map(x=>x.journal_id)).size,1);
 assert.equal(select('course.viewer',{id:'C-001'}).active,true);
});
check('P3 failed attempt needs retry, tamper action mutates nothing, settled order is reused',()=>{
 p3Reset('guardian');const id=makeOrder().data.orderId;assert.ok(sendPayment(id,'failure').ok);
 const before=getState(),late=dispatch('payment.processEvent',select('checkout.event',{orderId:id,outcome:'success'}));
 assert.equal(late.ok,false);assert.equal(late.errorKey,'p3.retryFirst');assert.equal(getState(),before);
 assert.ok(dispatch('payment.retry',{orderId:id}).ok);assert.equal(getState().payment_transactions.filter(x=>x.order_id===id).length,2);
 let actions;checkoutViews.registerActions((_ns,a)=>{actions=a;});const saved=globalThis.document;globalThis.document={getElementById:()=>null};
 try {const ctx={params:{orderId:id},dispatch,navigate:()=>assert.fail('Unexpected redirect')};const pre=getState();actions.tamper(null,null,ctx);assert.equal(getState(),pre);actions.confirmStay(null,null,ctx);}finally{disposeCheckoutToasts();globalThis.document=saved;}
 assert.equal(select('checkout.result',{orderId:id}).outcome,'success');
 assert.equal(select('checkout.context',{courseId:'C-001',studentId:'S-001'}).hasAccess,true);
 assert.equal(makeOrder().data.orderId,id);assert.equal(getState().orders.filter(o=>o.id===id).length,1);
 assert.equal(select('checkout.context',{courseId:'C-001',studentId:'S-002'}).hasAccess,false);
 dispatch('preferences.set',{role:'student'});assert.equal(select('course.viewer',{id:'C-001'}).active,true);
});
let p3Renders=0;
dictionary.unknown={ar:'MISSING_DICTIONARY_KEY',en:'MISSING_DICTIONARY_KEY'};
for(const role of ['student','guardian'])for(const lang of ['ar','en']){
 p3Reset(role);dispatch('preferences.set',{lang});const id=makeOrder().data.orderId;
 for(const outcome of ['initiated','pending','failure','success']){
  if(outcome==='success')assert.ok(dispatch('payment.retry',{orderId:id}).ok);
  if(outcome!=='initiated')assert.ok(sendPayment(id,outcome).ok);
  for(const route of routes.filter(r=>r.module==='checkout'))check(`P3 render ${role}/${lang}/${outcome} ${route.path}`,()=>{
   const ctx={params:{courseId:'C-001',orderId:id},role,actor:select('actor'),route,query:new URLSearchParams({student:'S-001',status:'success'}),dispatch,navigate:()=>{}};
   const before=getState(),html=route.view.render(ctx);p3Renders++;assert.equal(getState(),before);assert.ok(html.length);assert.doesNotMatch(html,/undefined|NaN|\[object Object\]|MISSING_DICTIONARY_KEY/);assert.doesNotMatch(html.replace(/<[^>]+>/g,' '),/\b(?:p3|error|status|route)\.[\w./:-]+/);
  });
 }
 // Unselected guardian, free activation, another buyer's order and an unknown order.
 const other=role==='student'?(dispatch('preferences.set',{role:'guardian'}),makeOrder('C-004','S-002').data.orderId):(dispatch('preferences.set',{role:'student'}),makeOrder('C-004').data.orderId);
 dispatch('preferences.set',{role});const free=makeOrder('C-005','S-001',true).data.orderId;
 const view=path=>routes.find(r=>r.path===path);
 for(const [path,params,query,expect] of [['/checkout/:courseId/beneficiary',{courseId:'C-004'},'',null],['/checkout/:courseId/review',{courseId:'C-005'},'student=S-001',null],['/checkout/order/:orderId/result',{orderId:free},'',null],['/checkout/order/:orderId/receipt',{orderId:free},'',null],['/checkout/order/:orderId/provider',{orderId:other},'','resourceDenied'],['/checkout/order/:orderId/receipt',{orderId:other},'','resourceDenied'],['/checkout/order/:orderId/result',{orderId:'O-999'},'','notFound'],['/checkout/:courseId/beneficiary',{courseId:'C-003'},'','notFound']])check(`P3 render ${role}/${lang} ${path} ${JSON.stringify(params)}`,()=>{
  const route=view(path),ctx={params,role,actor:select('actor'),route,query:new URLSearchParams(query),dispatch,navigate:()=>{}};
  const html=route.view.render(ctx);p3Renders++;assert.doesNotMatch(html,/undefined|NaN|\[object Object\]|MISSING_DICTIONARY_KEY/);
  if(expect)assert.equal(html,fallback(expect,ctx));
  else if(role==='guardian'&&path.endsWith('beneficiary'))assert.doesNotMatch(html,/<input[^>]*\schecked/,'no implicit child');
 });
}
dictionary.unknown=unknownEntry;
resetDemoData();dispatch('preferences.set',{role:'visitor',lang:'ar'});
console.log(`P3 render smoke: ${p3Renders} renders`);

// ---------------------------------------------------------------- P4 student portal
const p4Reset=()=>{resetDemoData();dispatch('preferences.set',{role:'student',lang:'ar'});};
const progressOf=lessonId=>getState().lesson_progress.find(p=>p.student_id==='S-001'&&p.lesson_id===lessonId);
const buyC001=()=>{const id=makeOrder('C-001','S-001').data.orderId;assert.ok(sendPayment(id,'success').ok);return id;};
check('P4 viewing never completes; explicit actions do, idempotently',()=>{
 p4Reset();const before=getState();
 const room=routes.find(r=>r.path==='/student/course/:id');
 for(const lesson of ['L-012','L-014','L-015'])room.view.render({params:{id:'C-002'},query:new URLSearchParams({tab:'lessons',lesson}),role:'student',actor:select('actor'),route:room,path:'/student/course/C-002',dispatch,navigate:()=>{}});
 assert.equal(getState(),before,'render mutates nothing');assert.equal(progressOf('L-014'),undefined);assert.equal(progressOf('L-012').status,'in_progress');
 assert.equal(select('student.room',{courseId:'C-002'}).percent,33);
 const read=dispatch('student.completeLesson',{lessonId:'L-015'});assert.ok(read.ok&&read.data.completed);assert.equal(progressOf('L-015').completion_basis,'manual');
 const count=getState().lesson_progress.length;assert.ok(dispatch('student.completeLesson',{lessonId:'L-015'}).ok);assert.equal(getState().lesson_progress.length,count);
 assert.equal(dispatch('student.completeLesson',{lessonId:'L-017'}).errorKey,'p4.completeBySubmit');assert.equal(dispatch('student.completeLesson',{lessonId:'L-018'}).ok,false);
 const finish=dispatch('student.completeLesson',{lessonId:'L-016'});assert.ok(finish.ok);assert.equal(progressOf('L-016').completion_basis,'demo_finish');
 assert.equal(select('student.room',{courseId:'C-002'}).percent,56);
 assert.equal(dispatch('student.completeLesson',{lessonId:'L-002'}).errorKey,'p4.noAccess','locked course');
 assert.equal(dispatch('student.completeLesson',{lessonId:'L-020'}).errorKey,'missing','unpublished lesson');
});
check('P4 video 90% rule and resume position',()=>{
 p4Reset();
 const half=dispatch('student.savePosition',{lessonId:'L-014',position:200});assert.ok(half.ok);assert.equal(half.data.completed,false);assert.equal(progressOf('L-014').status,'in_progress');assert.equal(progressOf('L-014').position_seconds,200);
 assert.equal(dispatch('student.savePosition',{lessonId:'L-014',position:377}).data.completed,false,'just under 90% of 420s');
 const done=dispatch('student.savePosition',{lessonId:'L-014',position:378});assert.ok(done.data.completed);assert.equal(progressOf('L-014').status,'done');assert.equal(progressOf('L-014').completion_basis,'video_90_percent');
 assert.equal(dispatch('student.savePosition',{lessonId:'L-014',position:10}).data.done,true,'rewinding keeps completion');
 assert.equal(dispatch('student.savePosition',{lessonId:'L-014',position:99999}).data.position,420,'clamped to duration');
 assert.equal(dispatch('student.savePosition',{lessonId:'L-015',position:10}).ok,false,'reading has no position');
 assert.equal(dispatch('student.savePosition',{lessonId:'L-014',position:'abc'}).ok,false);
});
check('P4 quiz scoring, attempt limit 2 and retained snapshots',()=>{
 p4Reset();assert.ok(dispatch('enrollment.enrollFree',{courseId:'C-005'}).ok);
 const quiz=select('student.room',{courseId:'C-005'}).quizzes.find(q=>q.id==='QUIZ-004');
 assert.ok(quiz.questions.every(q=>!('correct_choice_id' in q)),'answers hidden before submit');
 const right=Object.fromEntries(getState().questions.filter(q=>q.quiz_id==='QUIZ-004').map(q=>[q.id,q.correct_choice_id]));
 const wrong=Object.fromEntries(getState().questions.filter(q=>q.quiz_id==='QUIZ-004').map(q=>[q.id,q.choices.find(c=>c.id!==q.correct_choice_id).id]));
 const partial=dispatch('quiz.submit',{quizId:'QUIZ-004',answers:{[Object.keys(right)[0]]:right[Object.keys(right)[0]]}});assert.equal(partial.ok,false);assert.equal(Object.keys(partial.fieldErrors).length,2);
 assert.equal(progressOf('L-044'),undefined,'invalid submit does not complete');
 const first=dispatch('quiz.submit',{quizId:'QUIZ-004',answers:wrong});assert.ok(first.ok);assert.equal(first.data.score,0);assert.equal(first.data.passed,false);assert.equal(first.data.remaining,1);
 assert.equal(progressOf('L-044').status,'done');assert.equal(progressOf('L-044').completion_basis,'quiz_submit');
 const second=dispatch('quiz.submit',{quizId:'QUIZ-004',answers:right});assert.equal(second.data.score,100);assert.ok(second.data.passed);
 const before=getState();assert.equal(dispatch('quiz.submit',{quizId:'QUIZ-004',answers:right}).errorKey,'p4.attemptLimit');assert.equal(getState(),before);
 const attempts=getState().attempts.filter(a=>a.quiz_id==='QUIZ-004'&&a.student_id==='S-001');assert.equal(attempts.length,2);
 assert.ok(attempts.every(a=>a.question_snapshot.length===3&&a.question_snapshot.every(q=>q.correct_choice_id)));
 const view=select('student.work').quizzes.find(q=>q.id==='QUIZ-004');assert.equal(view.best,100);assert.equal(view.remaining,0);
 assert.equal(dispatch('quiz.submit',{quizId:'QUIZ-001',answers:{}}).errorKey,'p4.noAccess','quiz in a course without grant');
});
check('P4 assignment submission, validation and released-only grades',()=>{
 p4Reset();assert.ok(dispatch('enrollment.enrollFree',{courseId:'C-005'}).ok);
 assert.deepEqual(dispatch('assignment.submit',{assignmentId:'ASG-004',text:'short'}).fieldErrors,{text:'error.messageShort'});
 assert.deepEqual(dispatch('assignment.submit',{assignmentId:'ASG-004',text:'My plant grew toward the window.',filename:'bad.exe'}).fieldErrors,{filename:'p4.filename'});
 const r=dispatch('assignment.submit',{assignmentId:'ASG-004',text:'My plant grew toward the window.',filename:'C:\\fakepath\\plant notes.txt'});assert.ok(r.ok);
 const sub=getState().submissions.find(x=>x.id===r.data.submissionId);assert.equal(sub.state,'submitted');assert.equal(sub.filename,'plant notes.txt');assert.equal(sub.student_id,'S-001');
 assert.equal(progressOf('L-045').completion_basis,'assignment_submit');
 assert.equal(dispatch('assignment.submit',{assignmentId:'ASG-004',text:'Another attempt at it.'}).errorKey,'p4.alreadySubmitted');
 const work=select('student.work').assignments;assert.equal(work.find(a=>a.id==='ASG-004').grade,null);
 assert.equal(work.find(a=>a.id==='ASG-002').grade.score,92,'released seed grade visible');
 assert.equal(work.find(a=>a.id==='ASG-005').state,'submitted');assert.equal(dispatch('assignment.submit',{assignmentId:'ASG-001',text:'Not entitled yet.'}).errorKey,'p4.noAccess');
});
check('P4 scoped reads: locked, denied and other learners\' conversations',()=>{
 p4Reset();
 const locked=select('student.room',{courseId:'C-001'});assert.equal(locked.status,'locked');assert.equal(locked.lessons,undefined);assert.equal(locked.modules,undefined);
 assert.equal(select('student.room',{courseId:'C-003'}).status,'denied');assert.equal(select('student.room',{courseId:'C-999'}).status,'missing');
 assert.equal(select('student.room',{courseId:'C-011'}).access.state,'expired');
 assert.equal(select('student.thread',{id:'Q-004'}).status,'denied');assert.equal(select('student.thread',{id:'Q-999'}).status,'missing');
 assert.equal(select('student.thread',{id:'Q-001'}).status,'ok');
 assert.equal(dispatch('message.reply',{conversationId:'Q-004',text:'Hello there'}).errorKey,'resourceDenied');
 assert.equal(dispatch('message.resolve',{conversationId:'Q-006'}).errorKey,'resourceDenied');
 assert.ok(select('student.conversations').every(q=>q.student_id==='S-001'));
 const qa=select('student.room',{courseId:'C-002'}).conversations;assert.ok(!qa.some(q=>q.id==='Q-006'),'other learner private support hidden');
 assert.equal(select('student.resource',{id:'RES-001'}),null,'C-001 worksheet locked');assert.ok(select('student.resource',{id:'RES-003'}));
 for(const role of ['guardian','teacher','visitor']){dispatch('preferences.set',{role});assert.equal(select('student.room',{courseId:'C-002'}).status,'denied');assert.equal(dispatch('student.completeLesson',{lessonId:'L-011'}).ok,false);assert.equal(dispatch('live.join',{sessionId:'LS-004'}).ok,false);}
});
check('P4 purchase of C-001 unlocks the room; internal notes and classmate names stay hidden',()=>{
 p4Reset();assert.equal(select('student.room',{courseId:'C-001'}).status,'locked');
 assert.equal(dispatch('live.join',{sessionId:'LS-001'}).errorKey,'p4.noAccess','non-entitled join denied');
 buyC001();const room=select('student.room',{courseId:'C-001'});assert.equal(room.status,'ok');assert.equal(room.access.grant.origin,'one_time_purchase');assert.equal(room.percent,0);
 assert.ok(select('student.courses').some(r=>r.course.id==='C-001'&&r.tab==='active'));
 const q4=room.conversations.find(q=>q.id==='Q-004');assert.ok(q4&&!q4.own);
 assert.ok(!q4.messages.some(m=>m.id==='MSG-011'),'internal note hidden');assert.ok(q4.messages.filter(m=>m.author_role==='classmate').every(m=>m.author_name===null));
 assert.ok(!room.conversations.some(q=>q.id==='Q-003'),'private support of another learner hidden');
 assert.ok(dispatch('student.completeLesson',{lessonId:'L-002'}).ok);assert.equal(select('student.room',{courseId:'C-001'}).percent,11);
});
check('P4 live join: grant, state and attendance once',()=>{
 p4Reset();buyC001();const n=getState().attendance.length;
 const r=dispatch('live.join',{sessionId:'LS-001'});assert.ok(r.ok&&!r.data.existing);assert.equal(getState().attendance.length,n+1);
 const att=getState().attendance.find(a=>a.id===r.data.attendanceId);assert.deepEqual([att.student_id,att.status,att.live_session_id],['S-001','present','LS-001']);
 assert.ok(dispatch('live.join',{sessionId:'LS-001'}).data.existing);assert.equal(getState().attendance.length,n+1);
 assert.ok(dispatch('live.join',{sessionId:'LS-005'}).ok,'live now');
 assert.equal(dispatch('live.join',{sessionId:'LS-002'}).errorKey,'p4.joinClosed');assert.equal(dispatch('live.join',{sessionId:'LS-004'}).errorKey,'p4.joinClosed');
 assert.equal(dispatch('live.join',{sessionId:'LS-008'}).errorKey,'p4.noAccess','cancelled session in a course without grant');
 const rec=select('student.room',{courseId:'C-001'}).recordings;assert.deepEqual(rec.map(x=>x.id),['REC-001']);
 assert.deepEqual(select('student.room',{courseId:'C-002'}).recordings,[],'ready/processing recordings hidden');
});
check('P4 Q&A, replies, reports and notification eligibility',()=>{
 p4Reset();const notes=getState().notifications.length;
 assert.equal(dispatch('qa.ask',{courseId:'C-001',subject:'Fractions',text:'How do fractions work?'}).errorKey,'p4.noAccess');
 assert.ok(dispatch('qa.ask',{courseId:'C-002',subject:'x',text:'short'}).fieldErrors.subject);
 assert.equal(dispatch('qa.ask',{courseId:'C-002',lessonId:'L-001',subject:'Plants',text:'Why are leaves green?'}).fieldErrors.lessonId,'p4.lessonInvalid');
 const r=dispatch('qa.ask',{courseId:'C-002',lessonId:'L-011',subject:'<img src=x onerror=alert(1)>',text:'Why are leaves green in spring?'});assert.ok(r.ok);
 const q=getState().conversations.find(x=>x.id===r.data.conversationId);assert.deepEqual([q.kind,q.state,q.student_id,q.course_id],['lesson_qa','open','S-001','C-002']);
 const added=getState().notifications.slice(notes);assert.deepEqual(added.map(n=>n.recipient_user_id),['U-T001'],'only the course owner is notified');
 assert.equal(select('student.thread',{id:q.id}).messages.length,1);
 const html=routes.find(x=>x.path==='/student/messages/:id').view.render({params:{id:q.id},query:new URLSearchParams(),role:'student',actor:select('actor'),dispatch,navigate:()=>{}});
 assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;')&&!html.includes('<img src=x'));
 assert.ok(dispatch('message.reply',{conversationId:'Q-010',text:'One more thank you!'}).data.reopened);assert.equal(getState().conversations.find(x=>x.id==='Q-010').state,'open');
 assert.ok(dispatch('message.resolve',{conversationId:'Q-010'}).ok);assert.equal(getState().conversations.find(x=>x.id==='Q-010').state,'resolved');
 const reports=getState().safety_reports.length;
 assert.equal(dispatch('message.report',{messageId:'MSG-001',reason:'other'}).errorKey,'p4.reportOwn');
 assert.ok(dispatch('message.report',{messageId:'MSG-002',reason:'x'}).fieldErrors.reason);
 const rep=dispatch('message.report',{messageId:'MSG-002',reason:'unsafe'});assert.ok(rep.ok&&!rep.data.existing);
 assert.ok(dispatch('message.report',{messageId:'MSG-002',reason:'other'}).data.existing);assert.equal(getState().safety_reports.length,reports+1);
 const sr=getState().safety_reports.at(-1);assert.deepEqual([sr.reporter_user_id,sr.message_id,sr.course_id,sr.state],['U-S001','MSG-002','C-002','open']);
 assert.equal(dispatch('message.report',{messageId:'MSG-011',reason:'unsafe'}).ok,false,'internal note never reportable');
 assert.equal(dispatch('message.report',{messageId:'MSG-010',reason:'unsafe'}).errorKey,'resourceDenied','no grant for C-001');
});
check('P4 notifications are own-only; mark read and mark all read',()=>{
 p4Reset();assert.equal(select('notifications.count'),2);
 assert.ok(dispatch('notifications.markRead',{id:'N-001'}).ok);assert.equal(select('notifications.count'),1);
 const guardianNote=getState().notifications.find(n=>n.recipient_user_id!=='U-S001');assert.equal(dispatch('notifications.markRead',{id:guardianNote.id}).errorKey,'resourceDenied');
 assert.equal(dispatch('notifications.markAllRead',{}).data.count,1);assert.equal(select('notifications.count'),0);assert.equal(dispatch('notifications.markAllRead',{}).data.count,0);
 assert.ok(getState().notifications.filter(n=>n.recipient_user_id!=='U-S001').some(n=>!n.read_at),'others untouched');
});
check('P4 profile grade change keeps enrollments and grants',()=>{
 p4Reset();const enrollments=structuredClone(getState().enrollments),grants=structuredClone(getState().access_grants);
 assert.ok(dispatch('student.updateProfile',{gradeId:'99'}).fieldErrors.gradeId);
 assert.ok(dispatch('student.updateProfile',{gradeId:'5',interests:['science','bogus','science']}).ok);
 assert.equal(getState().students.find(s=>s.id==='S-001').current_grade_id,'5');assert.deepEqual(getState().students.find(s=>s.id==='S-001').interests,['science']);
 assert.deepEqual(getState().enrollments,enrollments);assert.deepEqual(getState().access_grants,grants);
 assert.ok(select('student.dashboard').recommended.every(c=>c.grade.id==='5'));
 assert.equal(select('student.profile').history.find(h=>h.course.id==='C-011').historical_grade.id,'3');
 assert.ok(dispatch('student.updateSettings',{prefs:{in_app:true,email_digest:'on'}}).ok);assert.deepEqual(select('student.settings').prefs,{in_app:true,email_digest:true,live_reminders:false,qa_replies:false,results:false});
 assert.deepEqual(select('student.settings').guardians.map(g=>g.guardian.id),['G-001','G-002']);
});
check('P4 dashboard counts derive from the store',()=>{
 p4Reset();const d=select('student.dashboard');
 assert.equal(d.totals.courses,select('student.courses').filter(r=>r.access.state==='active').length);
 assert.equal(d.unread.length,select('notifications.count'));assert.equal(d.resume.lesson.id,'L-083');
 const before=d.weeks.at(-1).lessons;assert.ok(dispatch('student.completeLesson',{lessonId:'L-015'}).ok);assert.equal(select('student.dashboard').weeks.at(-1).lessons,before+1);
 assert.ok(dispatch('enrollment.enrollFree',{courseId:'C-005'}).ok);assert.deepEqual(select('student.dashboard').due.map(w=>w.id).sort(),['ASG-004','QUIZ-004']);
});
// Isolated fixtures for states the student cannot create: unreleased grades and cancelled/failed entitled sessions.
{
 const fixtureSource=storeSource.replace("'./data.js'",JSON.stringify(new URL('../prototype/core/data.js',import.meta.url).href)).replaceAll('...createSeed()','...fixtureSeed()')+`\nfunction fixtureSeed(){const s=createSeed();s.assessment_grades.push({id:'GRADE-900',submission_id:'SUB-006',grader_user_id:'U-T001',score:70,feedback:'x',released_at:null,created_at:'2026-10-14T09:00:00Z',updated_at:'2026-10-14T09:00:00Z'});const ls=id=>s.live_sessions.find(x=>x.id===id);Object.assign(ls('LS-003'),{status:'cancelled',starts_at:'2026-10-21T14:00:00Z',ends_at:'2026-10-21T15:00:00Z'});Object.assign(ls('LS-004'),{status:'failed',starts_at:'2026-10-22T14:00:00Z',ends_at:'2026-10-22T15:00:00Z'});return s;}`;
 const iso=await import('data:text/javascript;base64,'+Buffer.from(fixtureSource).toString('base64'));
 check('P4 unreleased grade hidden; cancelled/failed entitled sessions cannot be joined',()=>{
  iso.dispatch('preferences.set',{role:'student'});
  const asg=iso.select('student.work').assignments.find(a=>a.id==='ASG-005');assert.equal(asg.state,'submitted');assert.equal(asg.grade,null);
  assert.ok(!JSON.stringify(iso.select('student.room',{courseId:'C-010'})).includes('GRADE-900'));
  const before=iso.getState();
  assert.equal(iso.dispatch('live.join',{sessionId:'LS-003'}).errorKey,'p4.joinCancelled');assert.equal(iso.dispatch('live.join',{sessionId:'LS-004'}).errorKey,'p4.joinFailed');
  assert.equal(iso.getState(),before,'no attendance fabricated');
  const sessions=iso.select('student.room',{courseId:'C-002'}).sessions;assert.ok(sessions.every(x=>!x.joinable));
 });
}
let p4Renders=0;
dictionary.unknown={ar:'MISSING_DICTIONARY_KEY',en:'MISSING_DICTIONARY_KEY'};
const studentRoute=path=>routes.find(r=>r.path===path);
const p4Render=(path,params={},query='')=>{const route=studentRoute(path),ctx={params,query:new URLSearchParams(query),role:'student',actor:select('actor'),route,path:path.replace(':id',params.id??''),dispatch,navigate:()=>{}};for(const [key,values] of Object.entries(route.queryValues))if(ctx.query.has(key)&&!values.includes(ctx.query.get(key)))ctx.query.set(key,values[0]);return {html:route.view.render(ctx),ctx};};
for(const lang of ['ar','en']){
 p4Reset();dispatch('preferences.set',{lang});
 const cases=[['/student'],['/student/explore'],['/student/explore',{},'all=1'],['/student/explore',{},'grade=5&page=2'],['/student/calendar'],['/student/calendar',{},'week=-1'],['/student/calendar',{},'week=1'],['/student/calendar',{},'view=list'],['/student/notifications'],['/student/notifications',{},'filter=unread'],['/student/profile'],['/student/messages/:id',{id:'Q-001'}],['/student/messages/:id',{id:'Q-010'}],['/student/course/:id',{id:'C-002'},'tab=bogus']];
 for(const path of ['/student/courses','/student/assignments','/student/messages','/student/settings'])for(const tab of studentRoute(path).queryValues.tab)cases.push([path,{},'tab='+tab]);
 for(const tab of studentRoute('/student/course/:id').queryValues.tab)cases.push(['/student/course/:id',{id:'C-002'},'tab='+tab]);
 for(const lesson of ['L-010','L-011','L-012','L-015','L-017','L-018','L-999'])cases.push(['/student/course/:id',{id:'C-002'},'tab=lessons&lesson='+lesson]);
 for(const activity of ['QUIZ-002','ASG-002'])cases.push(['/student/course/:id',{id:'C-002'},'tab=assessments&activity='+activity]);
 cases.push(['/student/course/:id',{id:'C-002'},'tab=assessments&activity=QUIZ-002&retry=1']);
 const run=list=>{for(const [path,params={},query=''] of list)check(`P4 render ${lang} ${path} ${JSON.stringify(params)} ${query}`,()=>{
  const before=getState(),{html}=p4Render(path,params,query);p4Renders++;assert.equal(getState(),before,'render is read-only');assert.ok(html.length>0);
  assert.doesNotMatch(html,/undefined|NaN|\[object Object\]|MISSING_DICTIONARY_KEY/);assert.doesNotMatch(html.replace(/<[^>]+>/g,' '),/\b(?:p2|p3|p4|error|status|route)\.[\w./:-]+/);
 });};
 run(cases);
 // Locked, lapsed, denied and missing learning rooms, plus a denied thread, never show protected content.
 check(`P4 render ${lang} locked/denied states`,()=>{
  const lockedHtml=p4Render('/student/course/:id',{id:'C-001'},'tab=lessons&lesson=L-002').html,body=L(getState().lessons.find(l=>l.id==='L-002').body);
  assert.ok(!lockedHtml.includes(esc(body))&&lockedHtml.includes('#/course/C-001'));assert.ok(p4Render('/student/course/:id',{id:'C-011'}).html.includes('#/course/C-011'));
  for(const [path,params,kind] of [['/student/course/:id',{id:'C-003'},'resourceDenied'],['/student/course/:id',{id:'C-999'},'missing'],['/student/messages/:id',{id:'Q-004'},'resourceDenied'],['/student/messages/:id',{id:'Q-999'},'missing']]){const {html,ctx}=p4Render(path,params);p4Renders++;assert.equal(html,fallback(kind,ctx));assert.doesNotMatch(html,/MISSING_DICTIONARY_KEY|undefined/);}
 });
 // After purchase, enrollment, join and submissions: every remaining branch renders.
 buyC001();assert.ok(dispatch('enrollment.enrollFree',{courseId:'C-005'}).ok);assert.ok(dispatch('live.join',{sessionId:'LS-001'}).ok);
 assert.ok(dispatch('quiz.submit',{quizId:'QUIZ-001',answers:Object.fromEntries(getState().questions.filter(q=>q.quiz_id==='QUIZ-001').map(q=>[q.id,q.correct_choice_id]))}).ok);
 assert.ok(dispatch('qa.ask',{courseId:'C-001',subject:'Souq maths',text:'Why did we multiply here?'}).ok);
 run([['/student'],['/student/calendar'],['/student/calendar',{},'week=1'],['/student/assignments',{},'tab=results'],['/student/course/:id',{id:'C-001'},'tab=live'],['/student/course/:id',{id:'C-001'},'tab=live&session=LS-001'],['/student/course/:id',{id:'C-001'},'tab=live&recording=REC-001'],['/student/course/:id',{id:'C-001'},'tab=qa'],['/student/course/:id',{id:'C-001'},'tab=assessments&activity=QUIZ-001'],['/student/course/:id',{id:'C-001'},'tab=assessments&activity=ASG-001'],['/student/course/:id',{id:'C-005'},'tab=assessments&activity=QUIZ-004'],['/student/course/:id',{id:'C-005'},'tab=assessments&activity=ASG-004'],['/student/course/:id',{id:'C-005'},'tab=resources'],['/student/course/:id',{id:'C-005'},'tab=overview'],['/student/messages',{},'tab=questions']]);
}
dictionary.unknown=unknownEntry;
resetDemoData();dispatch('preferences.set',{role:'visitor',lang:'ar'});
console.log(`P4 render smoke: ${p4Renders} renders`);

// ---------------------------------------------------------------- P5 guardian portal
const p5Reset=(role='guardian')=>{resetDemoData();dispatch('preferences.set',{role,lang:'ar'});};
const guardianRoute=path=>routes.find(r=>r.path===path);
const p5Render=(path,params={},query='')=>{const route=guardianRoute(path),ctx={params,query:new URLSearchParams(query),role:getState().preferences.role,actor:select('actor'),route,path:path.replace(':id',params.id??''),dispatch,navigate:()=>{}};for(const [key,values] of Object.entries(route.queryValues))if(ctx.query.has(key)&&!values.includes(ctx.query.get(key)))ctx.query.set(key,values[0]);return {html:route.view.render(ctx),ctx};};
const childIds=()=>select('guardian.dashboard').children.map(c=>c.child.id);
const link=id=>getState().guardian_student_links.find(l=>l.id===id);
check('P5 seed: exactly S-001/S-002 verified; S-003 pending and S-004 revoked never return child detail',()=>{
 p5Reset();
 assert.deepEqual(childIds(),['S-001','S-002']);assert.deepEqual(select('guardian.childrenPage').children.map(c=>c.child.id),['S-001','S-002']);assert.deepEqual(select('guardian.children').map(s=>s.id),['S-001','S-002']);
 for(const id of ['S-003','S-004','S-005'])assert.equal(select('guardian.child',{id}).status,'denied',id);
 assert.equal(select('guardian.child',{id:'S-999'}).status,'missing');
 const requests=select('guardian.childrenPage').requests;assert.deepEqual(requests.map(r=>[r.id,r.state]),[['GL-003','pending_verification'],['GL-004','revoked']]);
 assert.ok(requests.every(r=>!('name' in r)&&!('student_id' in r)&&!('percent' in r)),'status-only requests');
 assert.ok(!JSON.stringify(requests).includes('Hamad')&&!JSON.stringify(requests).includes('Fatma'));
 assert.deepEqual(select('guardian.dashboard').requests,{total:2,requested:0,pending_verification:1,rejected:0,revoked:1});
 const maryam=select('guardian.child',{id:'S-001'});assert.equal(maryam.status,'ok');assert.ok(maryam.courses.length>0);assert.ok(maryam.courses.every(r=>r.percent>=0&&r.percent<=100));
 assert.equal(maryam.percent,Math.round(maryam.done*100/maryam.total));
 assert.deepEqual(select('guardian.purchaseChildren').map(c=>c.id),['S-001','S-002']);
});
check('P5 guardian summaries never carry paid content, submissions or private messages',()=>{
 p5Reset();const json=JSON.stringify([select('guardian.dashboard'),select('guardian.child',{id:'S-001'}),select('guardian.child',{id:'S-002'})]);
 const s=getState(),enrolled=new Set(s.enrollments.filter(e=>['S-001','S-002'].includes(e.student_id)).map(e=>e.course_id));
 const lessons=s.lessons.filter(l=>enrolled.has(s.modules.find(m=>m.id===l.module_id).course_id)&&!l.preview);
 for(const l of lessons)assert.ok(!json.includes(JSON.stringify(l.body.en).slice(1,-1)),l.id);
 for(const x of s.submissions.filter(x=>['S-001','S-002'].includes(x.student_id)))assert.ok(!json.includes(x.text),x.id);
 for(const m of s.messages)assert.ok(!json.includes(m.text),m.id);
 assert.equal(select('student.room',{courseId:'C-002'}).status,'denied');assert.equal(select('student.thread',{id:'Q-001'}).status,'denied');assert.deepEqual(select('student.conversations'),[]);
 assert.ok(!guardianRoute('/student/course/:id').roles.includes('guardian'));assert.ok(!guardianRoute('/student/messages/:id').roles.includes('guardian'));
 assert.equal(can('read_content',course('C-002')),false);assert.equal(can('conversation.read',getState().conversations.find(q=>q.id==='Q-001')),false);
});
check('P5 OMAN-S003 reuses the pending request and grants nothing; bad codes and consent fail atomically',()=>{
 p5Reset();const before=getState();
 for(const [payload,field,key] of [[{code:'OMAN-S999',relationship:'aunt',consent:true},'code','p5.codeInvalid'],[{code:'عمان-٣',relationship:'aunt',consent:true},'code','p5.codeInvalid'],[{code:'Hamad',relationship:'aunt',consent:true},'code','p5.codeInvalid'],[{code:'',relationship:'aunt',consent:true},'code','error.required'],[{code:'OMAN-S003',relationship:'boss',consent:true},'relationship','p5.relationshipRequired'],[{code:'OMAN-S003',relationship:'aunt'},'consent','error.consent']]){
  const r=dispatch('guardian.requestLink',payload);assert.equal(r.ok,false);assert.equal(r.fieldErrors[field],key,JSON.stringify(payload));assert.equal(getState(),before);
 }
 const r=dispatch('guardian.requestLink',{code:' oman-s003 ',relationship:'aunt',consent:'on'});assert.ok(r.ok);assert.deepEqual(r.data,{linkId:'GL-003',reused:true,state:'pending_verification'});
 assert.equal(getState().guardian_student_links.length,6);assert.equal(select('guardian.linkResult').id,'GL-003');
 assert.equal(select('guardian.child',{id:'S-003'}).status,'denied');assert.deepEqual(childIds(),['S-001','S-002']);assert.equal(select('checkout.context',{courseId:'C-001',studentId:'S-003'}).status,'denied');
 assert.equal(dispatch('guardianLink.verify',{linkId:'GL-003'}).errorKey,'resourceDenied','guardian never self-verifies');
 const again=dispatch('guardian.requestLink',{code:'OMAN-S004',relationship:'aunt',consent:true});assert.ok(again.ok&&!again.data.reused,'revoked link needs a new request');
 assert.equal(link(again.data.linkId).state,'pending_verification');assert.equal(link('GL-004').state,'revoked');assert.equal(select('guardian.child',{id:'S-004'}).status,'denied');
 assert.equal(getState().audit_events.at(-1).action,'guardian_link.request');
 assert.ok(dispatch('guardian.requestLink',{code:'OMAN-S001',relationship:'mother',consent:true}).data.state==='verified');
});
check('P5 staff verify (admin_moderation) makes S-003 visible; other roles cannot verify',()=>{
 p5Reset();dispatch('guardian.requestLink',{code:'OMAN-S003',relationship:'aunt',consent:true});
 for(const role of ['admin_finance','teacher','student','visitor']){dispatch('preferences.set',{role});assert.equal(dispatch('guardianLink.verify',{linkId:'GL-003'}).ok,false,role);}
 dispatch('preferences.set',{role:'admin_moderation'});const audits=getState().audit_events.length;
 const r=dispatch('guardianLink.verify',{linkId:'GL-003'});assert.ok(r.ok);assert.equal(link('GL-003').verified_by,'U-M001');assert.equal(getState().audit_events.length,audits+1);
 assert.equal(dispatch('guardianLink.verify',{linkId:'GL-003'}).errorKey,'p5.invalidTransition');assert.equal(dispatch('guardianLink.verify',{linkId:'GL-004'}).errorKey,'p5.invalidTransition','revoked cannot be re-verified');
 dispatch('preferences.set',{role:'guardian'});
 assert.deepEqual(childIds(),['S-001','S-002','S-003']);const hamad=select('guardian.child',{id:'S-003'});assert.equal(hamad.status,'ok');assert.ok(hamad.has.progress&&hamad.has.results&&hamad.has.attendance);
 assert.ok(select('checkout.context',{courseId:'C-005'}).children.some(c=>c.id==='S-003'));
 assert.ok(select('guardian.notifications').some(n=>n.href==='#/guardian/child/S-003'));
 assert.equal(p5Render('/guardian/child/:id',{id:'S-003'}).html.includes(esc(L(student('S-003').name))),true);
});
check('P5 revoking S-002 removes it everywhere immediately and appends an audit event',()=>{
 p5Reset();const audits=getState().audit_events.length;
 assert.equal(dispatch('guardian.revokeLink',{linkId:'GL-005'}).errorKey,'resourceDenied','other guardian link');assert.equal(dispatch('guardian.revokeLink',{linkId:'GL-003'}).errorKey,'p5.notVerified');
 assert.ok(dispatch('guardian.revokeLink',{linkId:'GL-002'}).ok);
 assert.deepEqual(childIds(),['S-001']);assert.deepEqual(select('checkout.context',{courseId:'C-001'}).children.map(c=>c.id),['S-001']);
 assert.equal(select('checkout.context',{courseId:'C-001',studentId:'S-002'}).status,'denied');assert.equal(makeOrder('C-001','S-002').ok,false);
 assert.equal(select('guardian.child',{id:'S-002'}).status,'denied');
 const {html,ctx}=p5Render('/guardian/child/:id',{id:'S-002'},'tab=activity');assert.equal(html,fallback('resourceDenied',ctx));assert.ok(!html.includes(esc(L(student('S-002').name))));
 const ev=getState().audit_events.at(-1);assert.equal(getState().audit_events.length,audits+1);assert.deepEqual([ev.actor_user_id,ev.action,ev.resource_id,ev.before_summary,ev.after_summary],['U-G001','guardian_link.revoke','GL-002','verified','revoked']);
 assert.equal(dispatch('guardian.revokeLink',{linkId:'GL-002'}).errorKey,'p5.notVerified');
 assert.ok(select('guardian.orders').some(d=>d.order.id==='ORD-002'),'historical receipt remains');assert.equal(select('checkout.order',{orderId:'ORD-002'}).status,'ok');
 assert.deepEqual(select('guardian.purchaseChildren').map(c=>c.id),['S-001']);
 assert.ok(dispatch('guardian.revokeLink',{linkId:'GL-001'}).ok);assert.ok(!select('guardian.notifications').some(n=>n.id==='N-009'),'revoked child summary notice hidden');
 assert.ok(select('guardian.notifications').some(n=>n.id==='N-006'),'payment notice kept');assert.equal(select('notifications.count'),select('guardian.notifications').filter(n=>!n.read_at).length);
});
check('P5 G-002 cannot see G-001-only children',()=>{
 p5Reset();const saved={...PERSONAS.guardian};Object.assign(PERSONAS.guardian,{user_id:'U-G002',record_id:'G-002'});
 try{
  assert.deepEqual(childIds(),['S-001']);for(const id of ['S-002','S-003','S-004','S-005'])assert.equal(select('guardian.child',{id}).status,'denied',id);
  assert.deepEqual(select('guardian.childrenPage').requests.map(r=>r.id),['GL-006']);assert.deepEqual(select('guardian.orders'),[]);
  assert.equal(dispatch('guardian.revokeLink',{linkId:'GL-002'}).errorKey,'resourceDenied');assert.equal(select('checkout.context',{courseId:'C-001',studentId:'S-002'}).status,'denied');
  assert.deepEqual(select('support.tickets'),[]);assert.equal(select('support.ticket',{id:'ST-001'}).status,'denied');
 }finally{Object.assign(PERSONAS.guardian,saved);}
 assert.deepEqual(childIds(),['S-001','S-002']);
});
check('P5 scope change is a moderator request; current scopes stay in force',()=>{
 p5Reset();
 assert.equal(dispatch('guardian.requestScopeChange',{linkId:'GL-001',scopes:[...['progress','results','attendance','purchase']]}).fieldErrors.scopes,'p5.scopesUnchanged');
 assert.equal(dispatch('guardian.requestScopeChange',{linkId:'GL-001',scopes:['bogus']}).fieldErrors.scopes,'p5.scopesRequired');
 assert.equal(dispatch('guardian.requestScopeChange',{linkId:'GL-003',scopes:['progress']}).errorKey,'p5.notVerified');
 const notes=getState().notifications.length,r=dispatch('guardian.requestScopeChange',{linkId:'GL-001',scopes:['results','progress']});assert.ok(r.ok);assert.deepEqual(r.data.scopes,['progress','results']);
 assert.deepEqual(link('GL-001').scopes,['progress','results','attendance','purchase']);assert.equal(link('GL-001').scope_request.state,'pending_verification');
 assert.ok(getState().notifications.slice(notes).every(n=>n.recipient_user_id==='U-M001'));assert.ok(select('guardian.child',{id:'S-001'}).has.attendance);
 assert.equal(select('guardian.settings').links.find(l=>l.id==='GL-001').scope_request.scopes.length,2);
});
check('P5 support tickets: own list, create, reply/reopen, other tickets denied',()=>{
 p5Reset();assert.deepEqual(select('support.tickets').map(x=>x.id),['ST-001']);assert.equal(select('support.ticket',{id:'ST-002'}).status,'denied');assert.equal(select('support.ticket',{id:'ST-999'}).status,'missing');
 const r=dispatch('support.createTicket',{topic:'payment',subject:'Receipt copy',body:'Please resend the receipt for my order.'});assert.ok(r.ok);
 assert.equal(select('support.ticket',{id:r.data.ticketId}).ticket.requester_user_id,'U-G001');
 assert.ok(dispatch('support.reply',{ticketId:'ST-001',text:'Thank you, any update?'}).ok);assert.equal(select('support.ticket',{id:'ST-001'}).ticket.replies.length,1);
 assert.equal(dispatch('support.reply',{ticketId:'ST-002',text:'Let me in'}).errorKey,'resourceDenied');assert.ok(dispatch('support.reply',{ticketId:'ST-001',text:''}).fieldErrors.text);
 assert.ok(dispatch('guardian.updateSettings',{prefs:{in_app:true,payments:'on'}}).ok);assert.deepEqual(select('guardian.settings').prefs,{in_app:true,email_digest:false,weekly_summary:false,payments:true,live_reminders:false});
 dispatch('preferences.set',{role:'student'});assert.equal(dispatch('guardian.requestLink',{code:'OMAN-S003',relationship:'aunt',consent:true}).errorKey,'p5.guardianOnly');assert.equal(select('guardian.dashboard'),null);
});
let p5Renders=0;
dictionary.unknown={ar:'MISSING_DICTIONARY_KEY',en:'MISSING_DICTIONARY_KEY'};
for(const lang of ['ar','en']){
 p5Reset();dispatch('preferences.set',{lang});
 const run=list=>{for(const [path,params={},query=''] of list)check(`P5 render ${lang} ${path} ${JSON.stringify(params)} ${query}`,()=>{
  const before=getState(),{html}=p5Render(path,params,query);p5Renders++;assert.equal(getState(),before,'render is read-only');assert.ok(html.length>0);
  assert.doesNotMatch(html,/undefined|NaN|\[object Object\]|MISSING_DICTIONARY_KEY/);assert.doesNotMatch(html.replace(/<[^>]+>/g,' '),/\b(?:p2|p3|p4|p5|error|status|route)\.[\w./:-]+/);
 });};
 const cases=[['/guardian'],['/guardian',{},'child=S-002'],['/guardian',{},'child=S-003'],['/guardian/children'],['/guardian/children/link'],['/guardian/explore'],['/guardian/explore',{},'child=S-001'],['/guardian/explore',{},'child=S-002&all=1'],['/guardian/explore',{},'child=S-003'],['/guardian/orders'],['/guardian/notifications'],['/guardian/notifications',{},'filter=unread'],['/guardian/support'],['/guardian/support',{},'record=ST-001'],['/guardian/child/:id',{id:'S-001'},'tab=bogus']];
 for(const tab of guardianRoute('/guardian/settings').queryValues.tab)cases.push(['/guardian/settings',{},'tab='+tab]);
 for(const id of ['S-001','S-002'])for(const tab of guardianRoute('/guardian/child/:id').queryValues.tab)cases.push(['/guardian/child/:id',{id},'tab='+tab]);
 run(cases);
 check(`P5 render ${lang} denied and missing states leak no names`,()=>{
  for(const [path,params,query,kind] of [['/guardian/child/:id',{id:'S-003'},'','resourceDenied'],['/guardian/child/:id',{id:'S-004'},'tab=results','resourceDenied'],['/guardian/child/:id',{id:'S-005'},'','resourceDenied'],['/guardian/child/:id',{id:'S-999'},'','missing'],['/guardian/support',{},'record=ST-002','resourceDenied'],['/guardian/support',{},'record=ST-999','missing']]){
   const {html,ctx}=p5Render(path,params,query);p5Renders++;assert.equal(html,fallback(kind,ctx));for(const s of getState().students.filter(x=>!['S-001','S-002'].includes(x.id)))assert.ok(!html.includes(esc(L(s.name))));
  }
  // Own historical receipts may keep a beneficiary snapshot (ORD-004 for S-004); request lists and child cards never name unverified learners.
  const children=p5Render('/guardian/children').html,dash=p5Render('/guardian').html;
  for(const s of ['S-003','S-004'])assert.ok(!children.includes(esc(L(student(s).name))),s);assert.ok(!dash.includes(esc(L(student('S-003').name))));
  const explore=p5Render('/guardian/explore',{},'child=S-001').html;assert.match(explore,/#\/checkout\/C-\d+\/beneficiary\?child=S-001/);assert.doesNotMatch(explore,/beneficiary\?child=S-00[2-6]/);
  assert.ok(!p5Render('/guardian/explore',{},'child=S-003').html.includes('beneficiary?child='),'unverified child carries nothing');
  assert.ok(!p5Render('/guardian/child/:id',{id:'S-001'},'tab=courses').html.includes('#/student/'),'no player links');
  assert.ok(p5Render('/guardian/child/:id',{id:'S-001'}).html.includes('#/guardian/explore?child=S-001'));
  assert.ok(p5Render('/guardian/orders').html.includes('#/checkout/order/ORD-006/provider'),'failed order recovery');
 });
 // Link form with errors, a reused request, verification, a scope request, a new ticket and a revocation.
 dispatch('form.save',{form:'guardian-link',values:{code:'BAD',relationship:''},fieldErrors:dispatch('guardian.requestLink',{code:'BAD'}).fieldErrors});
 run([['/guardian/children/link']]);
 dispatch('guardian.requestLink',{code:'OMAN-S003',relationship:'aunt',consent:true});dispatch('guardian.requestScopeChange',{linkId:'GL-001',scopes:['progress']});
 dispatch('support.reply',{ticketId:'ST-001',text:'Any update please?'});dispatch('preferences.set',{role:'admin_moderation'});dispatch('guardianLink.verify',{linkId:'GL-003'});dispatch('preferences.set',{role:'guardian'});
 dispatch('guardian.revokeLink',{linkId:'GL-002'});
 run([['/guardian'],['/guardian/children/link'],['/guardian/children'],['/guardian/settings',{},'tab=links'],['/guardian/support',{},'record=ST-001'],['/guardian/child/:id',{id:'S-003'},'tab=activity'],['/guardian/child/:id',{id:'S-003'},'tab=live'],['/guardian/explore',{},'child=S-003']]);
}
// A results-only link (isolated fixture) shows explicit missing-scope states rather than data.
{
 const fixtureSource=storeSource.replace("'./data.js'",JSON.stringify(new URL('../prototype/core/data.js',import.meta.url).href)).replaceAll('...createSeed()','...fixtureSeed()')+`\nfunction fixtureSeed(){const s=createSeed();s.guardian_student_links.find(l=>l.id==='GL-002').scopes=['results'];return s;}`;
 const iso=await import('data:text/javascript;base64,'+Buffer.from(fixtureSource).toString('base64'));
 check('P5 scopes gate each child section and purchase',()=>{
  iso.dispatch('preferences.set',{role:'guardian'});const c=iso.select('guardian.child',{id:'S-002'});
  assert.equal(c.status,'ok');assert.deepEqual([c.courses,c.upcoming,c.attendance,c.weeks],[[],[],[],[]]);assert.ok(c.has.results&&!c.has.progress&&!c.has.purchase);
  assert.deepEqual(iso.select('checkout.context',{courseId:'C-001'}).children.map(x=>x.id),['S-001']);assert.equal(iso.can('child.read',iso.getState().students.find(s=>s.id==='S-002')),false);
 });
}
dictionary.unknown=unknownEntry;
resetDemoData();dispatch('preferences.set',{role:'visitor',lang:'ar'});
console.log(`P5 render smoke: ${p5Renders} renders`);

// ---------------------------------------------------------------- P6 teacher portal
const p6Reset=(role='teacher')=>{resetDemoData();dispatch('preferences.set',{role,lang:'ar'});};
const teacherRoute=path=>routes.find(r=>r.path===path);
const p6Render=(path,params={},query='')=>{const route=teacherRoute(path),ctx={params,query:new URLSearchParams(query),role:getState().preferences.role,actor:select('actor'),route,path:path.replace(':id',params.id??''),dispatch,navigate:()=>{}};for(const [key,values] of Object.entries(route.queryValues))if(ctx.query.has(key)&&!values.includes(ctx.query.get(key)))ctx.query.set(key,values[0]);return {html:route.view.render(ctx),ctx};};
const IDENTITY={title_ar:'الكسور للصف الرابع',title_en:'Fractions for Grade 4',summary_ar:'ملخص قصير للدورة الجديدة',summary_en:'A short summary of the new course',description_ar:'وصف تفصيلي للدورة الجديدة يشرح المحتوى',description_en:'A detailed description of the new course content'};
const ACADEMICS={curriculum_version_id:'CV-001',grade_subject_id:'GS-4-math',academic_year_id:'AY-002',semester_id:'SEM-003',language:'ar',mode:'recorded'};
const p6Create=()=>{const a=dispatch('course.saveDraft',{step:'identity',values:IDENTITY});assert.ok(a.ok&&!a.data.created&&a.data.next==='academics',JSON.stringify(a));const b=dispatch('course.saveDraft',{step:'academics',values:ACADEMICS});assert.ok(b.ok&&b.data.created,JSON.stringify(b));return b.data.id;};
const p6Prepare=id=>{const mod=getState().modules.find(m=>m.course_id===id);assert.ok(dispatch('lesson.add',{courseId:id,moduleId:mod.id,title_ar:'درس المعاينة',title_en:'Preview lesson',type:'video',duration:'6',state:'ready',preview:true,body:'Watch the worked example first.'}).ok);assert.ok(dispatch('course.saveDraft',{courseId:id,step:'access',values:{price_type:'paid',price:'25.500',access_kind:'academic_year'}}).ok);};
const notesFor=event=>getState().notifications.filter(n=>n.event_id===event);
const asPersona=(role,patch,fn)=>{const saved={...PERSONAS[role]};Object.assign(PERSONAS[role],patch);try{fn();}finally{Object.assign(PERSONAS[role],saved);}};
check('P6 wizard: identity + academics create a Draft with generated ID; submit moves Draft → Submitted',()=>{
 p6Reset();const before=getState().courses.length,id=p6Create(),c=course(id);
 assert.equal(id,'C-025');assert.equal(getState().courses.length,before+1);assert.deepEqual([c.status,c.owner_teacher_id,c.grade_subject_id,c.price_type],['Draft','T-001','GS-4-math','free']);
 assert.equal(c.title.en,'Fractions for Grade 4');assert.equal(getState().transient.courseDraft,undefined);assert.equal(getState().modules.filter(m=>m.course_id===id).length,1);
 const pre=getState();assert.equal(dispatch('course.submit',{courseId:id}).errorKey,'p6.checklistIncomplete');assert.equal(getState(),pre);
 assert.equal(dispatch('course.saveDraft',{courseId:id,step:'access',values:{price_type:'paid',price:'0',access_kind:'academic_year'}}).fieldErrors.price,'p6.pricePositive');
 p6Prepare(id);assert.equal(course(id).price_baisa,25500);assert.ok(select('teacher.editor',{id}).checklist.filter(x=>x.blocking).every(x=>x.ok));
 const notes=getState().notifications.length,r=dispatch('course.submit',{courseId:id});assert.ok(r.ok&&!r.data.existing);assert.equal(course(id).status,'Submitted');
 assert.ok(dispatch('course.submit',{courseId:id}).data.existing,'idempotent submit');assert.equal(getState().audit_events.filter(e=>e.resource_id===id&&e.action==='course.submit').length,1);
 assert.ok(getState().notifications.slice(notes).some(n=>n.recipient_user_id==='U-M001'&&n.href==='#/admin/courses/review'));
 assert.equal(dispatch('course.saveDraft',{courseId:id,step:'identity',values:IDENTITY}).errorKey,'p6.lockedInReview');assert.equal(dispatch('lesson.add',{courseId:id,moduleId:getState().modules.find(m=>m.course_id===id).id,title_ar:'درس',title_en:'Lesson',type:'reading',duration:'5',state:'ready',body:'Body of the lesson here.'}).errorKey,'p6.lockedInReview');
 dispatch('preferences.set',{role:'visitor'});assert.equal(select('course.public',{id}),null);assert.ok(!select('catalog.search',{grade:'4',subject:'math'}).some(x=>x.id===id),'Submitted never listed');
});
check('P6 grade-subject outside verified qualifications is rejected in wizard, forged dispatch and moderation',()=>{
 p6Reset();const pre=getState();
 const forged={...ACADEMICS,grade_subject_id:'GS-12-english'};
 assert.equal(dispatch('course.saveDraft',{courseId:'C-003',step:'academics',values:forged}).fieldErrors.grade_subject_id,'p6.notQualified');
 assert.equal(dispatch('course.saveDraft',{step:'academics',values:forged}).fieldErrors.grade_subject_id,'p6.notQualified');assert.equal(getState(),pre);
 assert.equal(dispatch('course.saveDraft',{step:'academics',values:{...ACADEMICS,grade_subject_id:'GS-4-arabic'}}).fieldErrors.grade_subject_id,'p6.notQualified');
 const pairs=select('teacher.editor',{}).pairs.map(p=>p.id);assert.equal(pairs.length,12);assert.ok(pairs.every(p=>/^GS-[1-6]-(math|science)$/.test(p)));
 assert.equal(dispatch('course.saveDraft',{step:'academics',values:{...ACADEMICS,semester_id:'SEM-001'}}).fieldErrors.semester_id,'p6.semesterMismatch');
 asPersona('teacher',{user_id:'U-T002',record_id:'T-002'},()=>{
  assert.equal(dispatch('course.saveDraft',{step:'academics',values:{...ACADEMICS,grade_subject_id:'GS-6-math'}}).fieldErrors.grade_subject_id,'p6.notQualified','T-002 grade 6');
  assert.ok(dispatch('course.saveDraft',{step:'academics',values:{...ACADEMICS,grade_subject_id:'GS-12-english',language:'en'}}).ok,'T-002 own pair');
  assert.deepEqual(select('teacher.editor',{}).pairs.map(p=>p.id),['GS-12-english']);
 });
 for(const role of ['teacher','admin_finance','student']){dispatch('preferences.set',{role});assert.equal(dispatch('course.review',{courseId:'C-012',decision:'approve'}).errorKey,'resourceDenied',role);}
});
{
 const fixtureSource=storeSource.replace("'./data.js'",JSON.stringify(new URL('../prototype/core/data.js',import.meta.url).href)).replaceAll('...createSeed()','...fixtureSeed()')+`\nfunction fixtureSeed(){const s=createSeed();s.courses.find(c=>c.id==='C-012').grade_subject_id='GS-12-english';return s;}`;
 const iso=await import('data:text/javascript;base64,'+Buffer.from(fixtureSource).toString('base64'));
 check('P6 moderation re-validates qualifications: forged T-001 grade12 English cannot be approved',()=>{
  iso.dispatch('preferences.set',{role:'admin_moderation'});const r=iso.dispatch('course.review',{courseId:'C-012',decision:'approve'});
  assert.equal(r.errorKey,'p6.notQualified');assert.equal(iso.getState().courses.find(c=>c.id==='C-012').status,'Submitted');
 });
}
check('P6 scenario 5: request changes → edit/resubmit → approve → visitor grade 4 Math results include the course',()=>{
 p6Reset();const id=p6Create();p6Prepare(id);assert.ok(dispatch('course.submit',{courseId:id}).ok);
 dispatch('preferences.set',{role:'admin_moderation'});
 assert.equal(dispatch('course.review',{courseId:id,decision:'requestChanges',feedback:'short'}).fieldErrors.feedback,'error.messageShort');
 assert.ok(dispatch('course.review',{courseId:id,decision:'requestChanges',feedback:'Please add a worked example to the preview lesson.'}).ok);
 assert.equal(course(id).status,'ChangesRequested');assert.equal(course(id).review_feedback.en,'Please add a worked example to the preview lesson.');
 assert.equal(dispatch('course.review',{courseId:id,decision:'approve'}).errorKey,'p6.invalidTransition','no approval while changes requested');
 dispatch('preferences.set',{role:'teacher'});
 assert.ok(getState().notifications.some(n=>n.recipient_user_id==='U-T001'&&n.type==='review_feedback'&&n.related_course_id===id));
 assert.ok(select('teacher.dashboard').feedback.some(c=>c.id===id));assert.ok(select('teacher.courses').find(c=>c.id===id).feedback);
 assert.ok(dispatch('course.saveDraft',{courseId:id,step:'identity',values:{...IDENTITY,summary_en:'A revised summary with a worked example'}}).ok);
 assert.ok(dispatch('course.submit',{courseId:id}).ok);assert.equal(course(id).status,'Submitted');
 dispatch('preferences.set',{role:'admin_moderation'});const r=dispatch('course.review',{courseId:id,decision:'approve'});assert.ok(r.ok,JSON.stringify(r));
 const c=course(id);assert.equal(c.status,'Published');assert.equal(c.published_snapshot.summary.en,'A revised summary with a worked example');assert.deepEqual(c.review_feedback,{ar:'',en:''});
 assert.ok(getState().lessons.filter(l=>getState().modules.some(m=>m.id===l.module_id&&m.course_id===id)).every(l=>l.state==='published'));
 assert.deepEqual(getState().audit_events.filter(e=>e.resource_id===id).map(e=>e.action),['course.create','course.submit','course.request_changes','course.submit','course.approve']);
 dispatch('preferences.set',{role:'visitor'});assert.ok(select('catalog.search',{grade:'4',subject:'math'}).some(x=>x.id===id));assert.equal(select('course.public',{id}).title.en,'Fractions for Grade 4');
 assert.ok(select('course.public',{id}).modules[0].lessons.some(l=>l.preview));
});
check('P6 published edit → pending_revision; public keeps the approved snapshot until approval',()=>{
 p6Reset();const old=course('C-001').description.en,edited={...IDENTITY,...Object.fromEntries(['title','summary','description'].flatMap(k=>[[k+'_ar',course('C-001')[k].ar],[k+'_en',course('C-001')[k].en]])),description_en:'An updated description with new souq examples for fractions.'};
 assert.ok(dispatch('course.saveDraft',{courseId:'C-001',step:'identity',values:edited}).data.revision);
 const c=course('C-001');assert.equal(c.status,'Published');assert.equal(c.description.en,old,'live field untouched');assert.equal(c.pending_revision.fields.description.en,edited.description_en);assert.equal(c.pending_revision.status,'Draft');
 assert.equal(select('teacher.editor',{id:'C-001'}).course.description.en,edited.description_en);
 for(const role of ['visitor','student']){dispatch('preferences.set',{role});assert.equal(select('course.public',{id:'C-001'}).description.en,old,role);}
 dispatch('preferences.set',{role:'teacher'});assert.ok(dispatch('course.submit',{courseId:'C-001'}).data.revision);assert.equal(course('C-001').pending_revision.status,'Submitted');assert.equal(course('C-001').status,'Published');
 assert.equal(dispatch('course.saveDraft',{courseId:'C-001',step:'identity',values:edited}).errorKey,'p6.lockedInReview');
 dispatch('preferences.set',{role:'visitor'});assert.equal(select('course.public',{id:'C-001'}).description.en,old,'still old while in review');
 dispatch('preferences.set',{role:'admin_moderation'});assert.ok(dispatch('course.review',{courseId:'C-001',decision:'approve'}).ok);
 dispatch('preferences.set',{role:'visitor'});assert.equal(select('course.public',{id:'C-001'}).description.en,edited.description_en);assert.equal(course('C-001').pending_revision,null);
 dispatch('preferences.set',{role:'teacher'});assert.equal(dispatch('course.requestRevision',{courseId:'C-003'}).errorKey,'p6.invalidTransition');assert.ok(dispatch('course.requestRevision',{courseId:'C-002'}).ok);assert.ok(dispatch('course.requestRevision',{courseId:'C-002'}).data.existing);
});
check('P6 live: schedule notifies each eligible learner once; reschedule and cancel send corrected notices',()=>{
 p6Reset();const eligible=['U-S001','U-S003','U-S004'];
 assert.equal(dispatch('live.schedule',{courseId:'C-002',title:'Plant lab',starts_at:'2026-10-18T17:00',duration:'60'}).fieldErrors.starts_at,'p6.startFuture');
 assert.equal(dispatch('live.schedule',{courseId:'C-004',title:'Plant lab',starts_at:'2026-10-26T17:00',duration:'60'}).errorKey,'resourceDenied');
 const r=dispatch('live.schedule',{courseId:'C-002',title:'Plant lab',starts_at:'2026-10-26T17:00',duration:'60'});assert.ok(r.ok);const id=r.data.sessionId,x=()=>getState().live_sessions.find(s=>s.id===id);
 assert.deepEqual([x().starts_at,x().ends_at,x().status],['2026-10-26T13:00:00Z','2026-10-26T14:00:00Z','scheduled']);
 const recipients=event=>notesFor(event).map(n=>n.recipient_user_id).sort();
 assert.deepEqual(recipients(`live-scheduled-${id}-1`),eligible);assert.ok(!getState().notifications.some(n=>n.recipient_user_id==='U-S002'&&n.event_id.includes(id)));
 assert.ok(dispatch('live.reschedule',{sessionId:id,starts_at:'2026-10-27T18:30'}).ok);assert.deepEqual([x().status,x().join_generation,x().starts_at],['rescheduled',2,'2026-10-27T14:30:00Z']);
 assert.deepEqual(recipients(`live-rescheduled-${id}-2`),eligible);
 assert.ok(dispatch('live.cancel',{sessionId:id}).ok);const count=getState().notifications.length;assert.deepEqual(recipients(`live-cancelled-${id}-2`),eligible);
 assert.ok(dispatch('live.cancel',{sessionId:id}).data.existing);assert.equal(getState().notifications.length,count,'repeat cancel sends nothing');
 assert.equal(dispatch('live.reschedule',{sessionId:id,starts_at:'2026-10-28T18:30'}).errorKey,'p6.invalidTransition');
 assert.equal(dispatch('live.cancel',{sessionId:'LS-004'}).errorKey,'p6.invalidTransition','ended session');
 for(const e of eligible)assert.equal(getState().notifications.filter(n=>n.recipient_user_id===e&&n.event_id.includes(id)).length,3,e);
 dispatch('preferences.set',{role:'student'});const s=select('student.room',{courseId:'C-002'}).sessions.find(v=>v.id===id);assert.equal(s.joinable,false);assert.equal(dispatch('live.join',{sessionId:id}).errorKey,'p4.joinCancelled');
});
check('P6 recordings: upload → processing → ready (no alert) → publish alerts once, repeat publish adds nothing',()=>{
 p6Reset();const n0=getState().notifications.length;
 assert.equal(dispatch('recording.upload',{sessionId:'LS-004',filename:'notes.exe'}).fieldErrors.filename,'p6.recordingFileInvalid');
 assert.equal(dispatch('recording.upload',{sessionId:'LS-001',filename:'class.mp4'}).errorKey,'p6.invalidTransition','scheduled session');
 assert.equal(dispatch('recording.upload',{sessionId:'LS-012',filename:'class.mp4'}).errorKey,'resourceDenied','T-002 session');
 const r=dispatch('recording.upload',{sessionId:'LS-004',filename:'plants.mp4'});assert.ok(r.ok);const id=r.data.recordingId,rec=()=>getState().recordings.find(x=>x.id===id),ls=()=>getState().live_sessions.find(x=>x.id==='LS-004');
 assert.deepEqual([rec().state,ls().status],['processing','recording_processing']);assert.equal(dispatch('recording.publish',{recordingId:id}).errorKey,'p6.recordingNotReady');
 assert.ok(dispatch('recording.complete',{recordingId:id}).ok);assert.deepEqual([rec().state,ls().status],['ready','recording_ready']);assert.equal(getState().notifications.length,n0,'no alert before publish');
 dispatch('preferences.set',{role:'student'});assert.ok(!select('student.room',{courseId:'C-002'}).recordings.some(x=>x.id===id));dispatch('preferences.set',{role:'teacher'});
 assert.ok(dispatch('recording.publish',{recordingId:id}).ok);assert.deepEqual(notesFor('recording-published-'+id).map(n=>n.recipient_user_id).sort(),['U-S001','U-S003','U-S004']);
 const n1=getState().notifications.length;assert.ok(dispatch('recording.publish',{recordingId:id}).data.existing);assert.ok(dispatch('recording.upload',{sessionId:'LS-004',filename:'again.mp4'}).data.existing);assert.equal(getState().notifications.length,n1);
 dispatch('preferences.set',{role:'student'});assert.ok(select('student.room',{courseId:'C-002'}).recordings.some(x=>x.id===id));
});
check('P6 grading: grade stays private until release; release notifies the learner once',()=>{
 p6Reset('student');assert.ok(dispatch('enrollment.enrollFree',{courseId:'C-005'}).ok);assert.ok(dispatch('assignment.submit',{assignmentId:'ASG-004',text:'I separated salt from water by evaporation.'}).ok);
 const sub=getState().submissions.at(-1);dispatch('preferences.set',{role:'teacher'});
 assert.ok(select('teacher.workspace',{id:'C-005'}).submissions.some(x=>x.id===sub.id));
 assert.equal(dispatch('submission.grade',{submissionId:sub.id,score:'101',feedback:'Great'}).fieldErrors.score,'p6.scoreRange');
 assert.equal(dispatch('submission.release',{submissionId:sub.id}).errorKey,'p6.gradeFirst');
 assert.ok(dispatch('submission.grade',{submissionId:sub.id,score:'90',feedback:'Clear method, well explained.'}).ok);
 const asStudent=()=>{dispatch('preferences.set',{role:'student'});const a=select('student.room',{courseId:'C-005'}).assignments.find(x=>x.id==='ASG-004');dispatch('preferences.set',{role:'teacher'});return a;};
 assert.deepEqual([asStudent().state,asStudent().grade],['submitted',null]);
 assert.ok(dispatch('submission.release',{submissionId:sub.id}).ok);const a=asStudent();assert.deepEqual([a.state,a.grade.score,a.grade.feedback],['released',90,'Clear method, well explained.']);
 const grade=getState().assessment_grades.find(g=>g.submission_id===sub.id);assert.equal(notesFor('grade-released-'+grade.id).length,1);assert.equal(notesFor('grade-released-'+grade.id)[0].recipient_user_id,'U-S001');
 assert.ok(dispatch('submission.release',{submissionId:sub.id}).data.existing);assert.equal(notesFor('grade-released-'+grade.id).length,1);
 assert.equal(dispatch('submission.grade',{submissionId:sub.id,score:'50',feedback:'Changed'}).errorKey,'p6.alreadyReleased');
 assert.ok(dispatch('submission.release',{submissionId:'SUB-002'}).ok,'assistant-graded C-001 submission');
 assert.equal(dispatch('submission.grade',{submissionId:'SUB-005',score:'80',feedback:'Nice'}).errorKey,'resourceDenied','C-004 owned by T-002');
});
check('P6 team: capability matrix, invitation and revoke remove assistant access to C-001/C-002 immediately',()=>{
 p6Reset('assistant');assert.ok(can('read_content',course('C-001'))&&can('read_content',course('C-002')));assert.equal(can('grade_assignment',course('C-005')),false);
 const conv=id=>getState().conversations.find(q=>q.id===id);assert.ok(can('conversation.read',conv('Q-001')));
 dispatch('preferences.set',{role:'teacher'});
 assert.equal(dispatch('team.assign',{memberId:'TM-001',assignments:{'C-004':['read_content']}}).errorKey,'resourceDenied');
 assert.equal(dispatch('team.assign',{memberId:'TM-001',assignments:{'C-005':['root']}}).errorKey,'invalidAction');
 assert.equal(dispatch('team.assign',{memberId:'TM-002',assignments:{'C-005':['read_content']}}).errorKey,'p6.memberNotActive');
 assert.ok(dispatch('team.assign',{memberId:'TM-001',assignments:{'C-005':['grade_assignment','read_content']}}).ok);
 dispatch('preferences.set',{role:'assistant'});assert.ok(can('grade_assignment',course('C-005')));dispatch('preferences.set',{role:'teacher'});
 assert.equal(dispatch('team.invite',{email:'helper@gmail.com',team_role:'assistant',days:'14'}).fieldErrors.email,'p6.syntheticEmail');
 assert.equal(dispatch('team.invite',{email:'noora.hinai@example.test',team_role:'assistant',days:'14'}).fieldErrors.email,'p6.alreadyMember');
 assert.equal(dispatch('team.invite',{email:'maryam.balushi@example.test',team_role:'assistant',days:'14'}).fieldErrors.email,'p6.notInvitable');
 const inv=dispatch('team.invite',{email:'helper@example.test',team_role:'grader',days:'7'});assert.ok(inv.ok);
 const m=getState().teacher_team_members.find(x=>x.id===inv.data.memberId);assert.deepEqual([m.status,m.team_role,m.expires_at],['invited','grader','2026-10-26T08:00:00Z']);
 assert.equal(select('teacher.team').invitations.length,2);
 const audits=getState().audit_events.length;assert.ok(dispatch('team.revoke',{memberId:'TM-001'}).ok);assert.equal(getState().audit_events.at(-1).action,'team.revoke');assert.equal(getState().audit_events.length,audits+1);
 assert.ok(getState().course_team_assignments.filter(a=>a.team_member_id==='TM-001').every(a=>a.status==='revoked'));
 for(const id of ['Q-001','Q-002','Q-003'])assert.deepEqual([conv(id).assigned_user_id,conv(id).state],[null,'open'],id);
 assert.ok(dispatch('team.revoke',{memberId:'TM-001'}).data.existing);assert.equal(dispatch('team.revoke',{memberId:'TM-999'}).errorKey,'missing');
 dispatch('preferences.set',{role:'assistant'});
 for(const id of ['C-001','C-002','C-005'])for(const action of ['read_content','reply_conversation','grade_assignment','edit_content'])assert.equal(can(action,course(id)),false,id+action);
 assert.equal(can('conversation.read',conv('Q-001')),false);assert.equal(dispatch('conversation.reply',{conversationId:'Q-001',text:'Still here?'}).errorKey,'resourceDenied');
});
check('P6 teacher scope: C-004 (T-002) learners, conversations and content stay hidden and immutable',()=>{
 p6Reset();
 assert.equal(select('teacher.workspace',{id:'C-004'}).status,'denied');assert.equal(select('teacher.editor',{id:'C-004'}).status,'denied');assert.equal(select('teacher.workspace',{id:'C-999'}).status,'missing');
 const owned=new Set(getState().courses.filter(c=>c.owner_teacher_id==='T-001').map(c=>c.id));
 assert.ok(select('teacher.students',{}).rows.every(r=>owned.has(r.course_id)));assert.ok(!select('teacher.students',{courseId:'C-004'}).rows.some(r=>r.course_id==='C-004'));
 assert.equal(select('teacher.student',{id:'S-006'}).status,'denied');assert.equal(select('teacher.student',{id:'S-999'}).status,'missing');assert.equal(select('teacher.student',{id:'S-003'}).status,'ok');
 assert.ok(!select('teacher.inbox',{}).all.some(q=>q.id==='Q-007'));assert.equal(select('teacher.thread',{id:'Q-007'}).status,'denied');assert.equal(select('teacher.thread',{id:'Q-999'}).status,'missing');
 assert.ok(!select('teacher.calendar').sessions.some(x=>x.course_id==='C-004'));
 const pre=getState(),c004Lesson=getState().lessons.find(l=>getState().modules.find(m=>m.id===l.module_id).course_id==='C-004');
 for(const [type,payload] of [['conversation.reply',{conversationId:'Q-007',text:'Hello there'}],['conversation.note',{conversationId:'Q-007',text:'Note'}],['conversation.assign',{conversationId:'Q-007',assigneeUserId:'U-T001'}],['lesson.update',{lessonId:c004Lesson.id,preview:true}],['announcement.post',{courseId:'C-004',title:'Hello all',body:'An announcement body.'}],['course.submit',{courseId:'C-004'}],['course.saveDraft',{courseId:'C-004',step:'identity',values:IDENTITY}],['submission.grade',{submissionId:'SUB-005',score:'1',feedback:'ok'}]])assert.equal(dispatch(type,payload).errorKey,'resourceDenied',type);
 assert.equal(getState(),pre,'no mutation');
 const name=esc(L(course('C-004').title));for(const [path,params] of [['/teacher/course/:id',{id:'C-004'}],['/teacher/courses/:id/edit',{id:'C-004'}],['/teacher/inbox/:id',{id:'Q-007'}]]){const {html,ctx}=p6Render(path,params);assert.equal(html,fallback('resourceDenied',ctx));assert.ok(!html.includes(name));}
 const {html:missing,ctx:mctx}=p6Render('/teacher/course/:id',{id:'C-999'});assert.equal(missing,fallback('missing',mctx));
 const students=p6Render('/teacher/students',{},'record=S-006').html;assert.ok(!students.includes(esc(L(student('S-006').name))),'no out-of-scope learner name');
 dispatch('preferences.set',{role:'student'});assert.equal(select('teacher.dashboard'),null);assert.equal(dispatch('course.saveDraft',{step:'identity',values:IDENTITY}).errorKey,'p6.teacherOnly');
});
check('P6 earnings are derived from the ledger and match allocations (T-001 and T-003)',()=>{
 p6Reset();const derive=teacherId=>{const rows=getState().financial_ledger_entries.filter(e=>e.teacher_id===teacherId);return acc=>rows.filter(e=>e.account===acc).reduce((n,e)=>n+e.credit_baisa-e.debit_baisa,0);};
 const verify=teacherId=>{const e=select('teacher.earnings'),bal=derive(teacherId);
  for(const [k,acc] of [['pending','teacher_pending'],['available','teacher_available'],['reserved','teacher_reserved'],['in_payout','teacher_in_payout']]){assert.equal(e.ledger[k],bal(acc),k);assert.equal(e.ledger[k],e.byState[k],`${teacherId} ${k} ledger = allocations`);}
  assert.equal(e.ledger.paid,e.byState.paid,'paid');assert.equal(e.ledger.gross-e.ledger.commission,e.ledger.teacher_share);
  assert.equal(e.ledger.teacher_share,e.sales.reduce((n,x)=>n+x.commission_snapshot.teacher_baisa,0));assert.ok(e.sales.every(x=>x.owner_teacher_id_snapshot===teacherId));return e;};
 const t1=verify('T-001');assert.deepEqual([t1.ledger.gross,t1.ledger.commission,t1.ledger.pending,t1.ledger.available,t1.ledger.reserved,t1.ledger.paid],[85000,17000,20000,24000,24000,0]);
 assert.deepEqual(t1.payouts.map(p=>p.id).sort(),['TP-001','TP-002']);assert.equal(t1.account.masked_iban.includes('DEMO'),true);
 asPersona('teacher',{user_id:'U-T003',record_id:'T-003'},()=>{const t3=verify('T-003');assert.equal(t3.ledger.paid,36000);assert.ok(t3.adjustments.some(a=>a.id==='ADJ-001'&&a.original.id==='EA-006'&&a.item.id==='OI-008'&&a.original.snapshot.rate_bps===2000));assert.ok(t3.ledger.recoverable>0);});
 for(const tab of ['sales','payables','payouts','destination'])assert.doesNotMatch(p6Render('/teacher/earnings',{},'tab='+tab).html.toLowerCase(),/wallet|محفظة/);
 assert.equal(dispatch('payoutAccount.requestChange',{beneficiaryName:'Ahmed',accountRef:'12',consent:true}).fieldErrors.accountRef,'p6.accountRefInvalid');
 const before=getState().teacher_payout_accounts.find(a=>a.teacher_id==='T-001').masked_iban;assert.ok(dispatch('payoutAccount.requestChange',{beneficiaryName:'Ahmed Al Harthi',accountRef:'4321',consent:'on'}).ok);
 const acc=getState().teacher_payout_accounts.find(a=>a.teacher_id==='T-001');assert.equal(acc.masked_iban,before,'no direct edit');assert.equal(acc.change_request.state,'pending_verification');assert.ok(getState().notifications.some(n=>n.recipient_user_id==='U-F001'&&n.type==='payout_account'));
});
check('P6 inbox: owner assigns to active reply members; public reply, internal note hidden from learner; status transitions',()=>{
 p6Reset();const conv=id=>getState().conversations.find(q=>q.id===id);
 assert.equal(dispatch('conversation.assign',{conversationId:'Q-005',assigneeUserId:'U-A002'}).fieldErrors.assigneeUserId,'p6.assigneeInvalid','invited member');
 assert.equal(dispatch('conversation.assign',{conversationId:'Q-005',assigneeUserId:'U-S001'}).fieldErrors.assigneeUserId,'p6.assigneeInvalid');
 assert.ok(dispatch('team.assign',{memberId:'TM-001',assignments:{'C-001':['read_content','grade_assignment']}}).ok);
 assert.equal(dispatch('conversation.assign',{conversationId:'Q-005',assigneeUserId:'U-A001'}).fieldErrors.assigneeUserId,'p6.assigneeInvalid','reply capability removed');
 assert.ok(dispatch('team.assign',{memberId:'TM-001',assignments:{'C-001':['read_content','grade_assignment','reply_conversation']}}).ok);
 const r=dispatch('conversation.assign',{conversationId:'Q-005',assigneeUserId:'U-A001'});assert.ok(r.ok);assert.deepEqual([conv('Q-005').state,conv('Q-005').assigned_user_id],['assigned','U-A001']);
 assert.equal(notesFor('conversation-assigned-'+r.data.assignmentId)[0].recipient_user_id,'U-A001');
 dispatch('preferences.set',{role:'assistant'});assert.ok(can('conversation.read',conv('Q-005')),'assistant now sees assigned Q-005');dispatch('preferences.set',{role:'teacher'});
 assert.ok(dispatch('conversation.note',{conversationId:'Q-001',text:'Internal: give an extra diagram next time.'}).ok);assert.ok(dispatch('conversation.reply',{conversationId:'Q-001',text:'Great observation, keep a light diary.'}).ok);
 dispatch('preferences.set',{role:'student'});const thread=select('student.thread',{id:'Q-001'});
 assert.ok(thread.messages.some(m=>m.text==='Great observation, keep a light diary.'&&m.author_role==='teacher'));assert.ok(!JSON.stringify(thread).includes('extra diagram'),'note hidden');
 assert.ok(!JSON.stringify(select('student.room',{courseId:'C-002'})).includes('extra diagram'));assert.ok(getState().notifications.some(n=>n.recipient_user_id==='U-S001'&&n.type==='qa_reply'&&n.href==='#/student/messages/Q-001'&&n.event_id.startsWith('reply-')));
 dispatch('preferences.set',{role:'teacher'});
 assert.ok(dispatch('conversation.setStatus',{conversationId:'Q-001',status:'waiting'}).ok);assert.equal(dispatch('conversation.setStatus',{conversationId:'Q-001',status:'escalated'}).errorKey,'p6.invalidTransition');
 assert.ok(dispatch('conversation.setStatus',{conversationId:'Q-001',status:'resolved'}).ok);assert.equal(dispatch('conversation.setStatus',{conversationId:'Q-001',status:'waiting'}).errorKey,'p6.invalidTransition');
 assert.equal(dispatch('conversation.assign',{conversationId:'Q-001',assigneeUserId:'U-T001'}).errorKey,'p6.invalidTransition','resolved');
 assert.equal(dispatch('conversation.setStatus',{conversationId:'Q-005',status:'resolved'}).ok,true);
 const rep=dispatch('conversation.report',{conversationId:'Q-005',messageId:getState().messages.find(m=>m.conversation_id==='Q-005').id,reason:'privacy'});assert.ok(rep.ok&&!rep.data.existing);
 assert.ok(dispatch('conversation.report',{conversationId:'Q-005',messageId:getState().messages.find(m=>m.conversation_id==='Q-005').id,reason:'privacy'}).data.existing);
 const trail=select('teacher.thread',{id:'Q-005'}).trail.map(e=>e.action);assert.ok(trail.includes('conversation.assign')&&trail.includes('conversation.status')&&trail.includes('conversation.report'));
});
check('P6 outline: add/move lessons, preview flag, publish alert deduplicated; quiz and assignment create lessons',()=>{
 p6Reset();const mod=getState().modules.find(m=>m.course_id==='C-002'&&m.position===1),order=()=>getState().lessons.filter(l=>l.module_id===mod.id).sort((a,b)=>a.position-b.position).map(l=>l.id);
 const first=order();assert.equal(dispatch('lesson.move',{lessonId:first[0],direction:'up'}).errorKey,'p6.cannotMove');
 assert.ok(dispatch('lesson.move',{lessonId:first[0],direction:'down'}).ok);assert.deepEqual(order(),[first[1],first[0],first[2]]);
 assert.ok(dispatch('lesson.update',{lessonId:first[1],preview:true}).ok);assert.equal(getState().lessons.find(l=>l.id===first[1]).preview,true);
 assert.equal(dispatch('lesson.add',{courseId:'C-002',moduleId:mod.id,title_ar:'',title_en:'Rain',type:'reading',duration:'5',state:'ready',body:'Body text here.'}).fieldErrors.title_ar,'error.required');
 assert.equal(dispatch('lesson.add',{courseId:'C-002',moduleId:'MOD-001',title_ar:'المطر',title_en:'Rain',type:'reading',duration:'5',state:'ready',body:'Body text here.'}).fieldErrors.moduleId,'error.required','module of another course');
 const add=dispatch('lesson.add',{courseId:'C-002',moduleId:mod.id,title_ar:'المطر',title_en:'Rain',type:'reading',duration:'5',state:'draft',body:'Why does it rain in the mountains?'});assert.ok(add.ok);
 assert.equal(notesFor('lesson-published-'+add.data.lessonId).length,0,'draft lesson silent');
 assert.ok(dispatch('lesson.update',{lessonId:add.data.lessonId,state:'published'}).ok);assert.deepEqual(notesFor('lesson-published-'+add.data.lessonId).map(n=>n.recipient_user_id).sort(),['U-S001','U-S003','U-S004']);
 assert.ok(dispatch('lesson.update',{lessonId:add.data.lessonId,state:'ready'}).ok);assert.ok(dispatch('lesson.update',{lessonId:add.data.lessonId,state:'published'}).ok);assert.equal(notesFor('lesson-published-'+add.data.lessonId).length,3,'deduplicated');
 const q=dispatch('quiz.create',{courseId:'C-003',moduleId:getState().modules.find(m=>m.course_id==='C-003').id,title:'Ratio check',pass_score:'60',questions:[{prompt:'2:4 equals?',choices:['1:2','2:1','4:2'],correct:'0'},{prompt:'',choices:['','',''],correct:''}]});assert.ok(q.ok,JSON.stringify(q));
 const quiz=getState().quizzes.find(x=>x.id===q.data.quizId);assert.equal(quiz.question_ids.length,1);assert.equal(getState().lessons.find(l=>l.id===quiz.lesson_id).type,'quiz');assert.equal(getState().questions.find(x=>x.id===quiz.question_ids[0]).correct_choice_id,'a');
 assert.equal(dispatch('quiz.create',{courseId:'C-003',moduleId:'MOD-007',title:'Ratio check',pass_score:'60',questions:[{prompt:'2:4 equals?',choices:['1:2','','4:2'],correct:''}]}).fieldErrors.q0_choices,'p6.choicesRequired');
 const a=dispatch('assignment.create',{courseId:'C-003',moduleId:'MOD-007',title:'Recipe ratios',instructions:'Scale a family recipe for 6 people.',due:'2026-11-05',max_score:'20'});assert.ok(a.ok);assert.equal(getState().assignments.find(x=>x.id===a.data.assignmentId).due_at,'2026-11-05T15:59:59Z');
 assert.equal(dispatch('assignment.create',{courseId:'C-003',moduleId:'MOD-007',title:'Recipe ratios',instructions:'Scale a family recipe for 6 people.',due:'2026-10-01',max_score:'20'}).fieldErrors.due,'p6.dueFuture');
 assert.ok(dispatch('resource.add',{lessonId:first[0],kind:'worksheet',title:'Plant diary',filename:'diary.txt',body:'Record growth every day.'}).ok);assert.equal(dispatch('resource.add',{lessonId:first[0],kind:'worksheet',title:'Plant diary',filename:'diary.exe',body:'Record growth every day.'}).fieldErrors.filename,'p6.resourceFileInvalid');
 assert.ok(dispatch('announcement.post',{courseId:'C-002',title:'Bring a cup',body:'Bring a clear cup for tomorrow’s experiment.'}).ok);assert.equal(getState().notifications.filter(n=>n.type==='announcement'&&n.event_id===`announcement-${getState().announcements.at(-1).id}`).length,3);
 assert.ok(dispatch('teacher.updateProfile',{bio_ar:'نبذة جديدة عن المعلم تشرح أسلوبه في التدريس',bio_en:'A new biography explaining the teaching approach'}).ok);dispatch('preferences.set',{role:'visitor',lang:'en'});assert.equal(select('teacher.public',{id:'T-001'}).bio.en,'A new biography explaining the teaching approach');dispatch('preferences.set',{role:'teacher',lang:'ar'});
 assert.ok(dispatch('qualification.request',{gradeSubjectId:'GS-7-math',note:'Taught grade 7 for two years'}).ok);assert.equal(dispatch('qualification.request',{gradeSubjectId:'GS-4-math'}).fieldErrors.gradeSubjectId,'p6.alreadyQualified');
 assert.ok(!select('teacher.editor',{}).pairs.some(p=>p.id==='GS-7-math'),'pending qualification not usable');assert.ok(select('teacher.settings').pending.some(p=>p.id==='GS-7-math'));
});
let p6Renders=0;
dictionary.unknown={ar:'MISSING_DICTIONARY_KEY',en:'MISSING_DICTIONARY_KEY'};
for(const lang of ['ar','en']){
 p6Reset();dispatch('preferences.set',{lang});
 const run=list=>{for(const [path,params={},query=''] of list)check(`P6 render ${lang} ${path} ${JSON.stringify(params)} ${query}`,()=>{
  const before=getState(),{html}=p6Render(path,params,query);p6Renders++;assert.equal(getState(),before,'render is read-only');assert.ok(html.length>0);
  assert.doesNotMatch(html,/undefined|NaN|\[object Object\]|MISSING_DICTIONARY_KEY/);assert.doesNotMatch(html.replace(/<[^>]+>/g,' '),/\b(?:p2|p3|p4|p5|p6|error|status|route)\.[\w./:-]+/);
 });};
 const cases=[['/teacher'],['/teacher/courses'],['/teacher/courses',{},'view=table'],['/teacher/courses',{},'status=Published'],['/teacher/courses',{},'status=Archived&view=table'],['/teacher/students'],['/teacher/students',{},'course=C-001'],['/teacher/students',{},'record=S-003'],['/teacher/students',{},'record=S-999'],['/teacher/inbox'],['/teacher/inbox/:id',{id:'Q-005'}],['/teacher/inbox/:id',{id:'Q-004'}],['/teacher/inbox/:id',{id:'Q-006'}],['/teacher/calendar'],['/teacher/calendar',{},'view=list'],['/teacher/calendar',{},'week=-1'],['/teacher/notifications'],['/teacher/notifications',{},'filter=unread'],['/teacher/earnings',{},'tab=payouts&record=TP-002'],['/teacher/earnings',{},'tab=payouts&record=TP-999'],['/teacher/course/:id',{id:'C-001'},'tab=bogus']];
 for(const status of ['open','assigned','waiting','escalated','resolved'])cases.push(['/teacher/inbox',{},'status='+status]);
 for(const step of teacherRoute('/teacher/courses/new').queryValues.step){cases.push(['/teacher/courses/new',{},'step='+step]);for(const id of ['C-001','C-003','C-012','C-022'])cases.push(['/teacher/courses/:id/edit',{id},'step='+step]);}
 for(const id of ['C-001','C-002','C-003','C-012','C-022'])for(const tab of teacherRoute('/teacher/course/:id').queryValues.tab)cases.push(['/teacher/course/:id',{id},'tab='+tab]);
 for(const [path,key] of [['/teacher/team','tab'],['/teacher/earnings','tab'],['/teacher/settings','tab']])for(const tab of teacherRoute(path).queryValues[key])cases.push([path,{},'tab='+tab]);
 cases.push(['/teacher/courses/:id/edit',{id:'C-001'},'step=content&lesson=L-001'],['/teacher/courses/:id/edit',{id:'C-001'},'step=assessments&item=QUIZ-001'],['/teacher/courses/:id/edit',{id:'C-001'},'step=assessments&item=ASG-001'],['/teacher/course/:id',{id:'C-002'},'tab=lessons&lesson=L-011']);
 run(cases);
 // After authoring, grading, live and team mutations every remaining branch renders.
 dispatch('teacher.saveForm',{name:'wizard:new:identity',values:{title_ar:'x'},fieldErrors:dispatch('course.saveDraft',{step:'identity',values:{title_ar:'x'}}).fieldErrors});
 run([['/teacher/courses/new',{},'step=identity']]);
 dispatch('course.saveDraft',{step:'identity',values:IDENTITY});run([['/teacher/courses/new',{},'step=academics'],['/teacher/courses/new',{},'step=review']]);
 const id=p6Create();p6Prepare(id);dispatch('course.saveDraft',{courseId:'C-001',step:'access',values:{price_type:'paid',price:'31',access_kind:'fixed_end',access_end:'2027-06-30'}});dispatch('course.requestUnpublish',{courseId:'C-002',reason:'Updating the experiments for next term.'});
 dispatch('preferences.set',{role:'student'});dispatch('enrollment.enrollFree',{courseId:'C-005'});dispatch('assignment.submit',{assignmentId:'ASG-004',text:'My answer to the applied task.'});dispatch('preferences.set',{role:'teacher'});
 const sub=getState().submissions.at(-1).id;dispatch('submission.grade',{submissionId:sub,score:'7',feedback:'Good start'});
 const ls=dispatch('live.schedule',{courseId:'C-002',title:'Rain lab',starts_at:'2026-10-26T17:00',duration:'45'}).data.sessionId;dispatch('recording.upload',{sessionId:'LS-004',filename:'plants.mp4'});
 dispatch('conversation.note',{conversationId:'Q-005',text:'Internal follow-up'});dispatch('team.invite',{email:'helper@example.test',team_role:'content_editor',days:'30'});dispatch('payoutAccount.requestChange',{beneficiaryName:'Ahmed Al Harthi',accountRef:'4321',consent:true});dispatch('qualification.request',{gradeSubjectId:'GS-8-math'});
 dispatch('course.saveDraft',{courseId:'C-005',step:'identity',values:{...Object.fromEntries(['title','summary','description'].flatMap(k=>[[k+'_ar',course('C-005')[k].ar],[k+'_en',course('C-005')[k].en]])),summary_en:'Updated summary for a pending revision.'}});
 run([['/teacher'],['/teacher/courses'],['/teacher/courses/:id/edit',{id},'step=review'],['/teacher/courses/:id/edit',{id},'step=content'],['/teacher/course/:id',{id},'tab=details'],['/teacher/course/:id',{id:'C-005'},'tab=resources'],['/teacher/course/:id',{id:'C-005'},'tab=details'],['/teacher/course/:id',{id:'C-002'},'tab=live'],['/teacher/course/:id',{id:'C-002'},'tab=details'],['/teacher/course/:id',{id:'C-001'},'tab=details'],['/teacher/calendar'],['/teacher/inbox/:id',{id:'Q-005'}],['/teacher/team',{},'tab=invitations'],['/teacher/earnings',{},'tab=destination'],['/teacher/settings',{},'tab=qualifications']]);
 dispatch('course.submit',{courseId:'C-005'});dispatch('live.cancel',{sessionId:ls});dispatch('team.revoke',{memberId:'TM-001'});
 run([['/teacher/courses/:id/edit',{id:'C-005'},'step=identity'],['/teacher/course/:id',{id:'C-005'},'tab=details'],['/teacher/course/:id',{id:'C-002'},'tab=live'],['/teacher/team'],['/teacher/team',{},'tab=access'],['/teacher/inbox']]);
}
dictionary.unknown=unknownEntry;
resetDemoData();dispatch('preferences.set',{role:'visitor',lang:'ar'});
console.log(`P6 render smoke: ${p6Renders} renders`);

console.log(`${passed} checks passed${process.exitCode ? ' (with failures above)' : ''}`);
