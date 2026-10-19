// Seed, scope and dictionary checks for the clickable prototype (prototype/SPEC.md §3.1, §4, §5, §9).
// Plain Node, no dependencies:  node tests/store-check.mjs
import assert from 'node:assert/strict';
import { createSeed, PERSONAS, DEMO_NOW, ENUMS } from '../prototype/core/data.js';
import { select, dispatch, can, getState, resetDemoData } from '../prototype/core/store.js';
import { dictionary, money, t } from '../prototype/core/i18n.js';
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

console.log(`${passed} checks passed${process.exitCode ? ' (with failures above)' : ''}`);
