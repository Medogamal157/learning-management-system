import { t, L, esc, money, dateTime } from '../core/i18n.js';
import { select, COURSE_STEPS, TEAM_CAPABILITIES, TEAM_ROLES, LESSON_TYPES, LESSON_STATES, TEACHER_PREFS, INVITE_DAYS } from '../core/store.js';
import { pageHeader, statCard, badge, tabs, table, emptyState, notice, button, avatar, formField, progressBar, modal, drawer, courseCard, showToast, openOverlay, closeOverlay } from '../core/ui.js';
import { icon } from '../core/icons.js';
import { courseCover } from '../core/media.js';
import { mountCharts } from '../core/charts.js';
import { fallback } from '../core/layout.js';
import { DEMO_NOW } from '../core/data.js';
import { weekDays, dayKey } from './student.js';

// Teacher portal (SPEC §5 Teacher). Every view reads `teacher.*` selectors that resolve the acting persona
// and re-check single ownership; all mutations go through store reducers that repeat those checks.
const label = (key, params) => t('p6.' + key, params);
const enc = encodeURIComponent;
const qs = query => { const q = new URLSearchParams(Object.entries(query).filter(([, v]) => v != null && v !== '')); return q.size ? '?' + q : ''; };
function url(ctx, changes = {}, path = ctx.path) { const q = new URLSearchParams(ctx.query); for (const [k, v] of Object.entries(changes)) { if (v == null || v === '') q.delete(k); else q.set(k, v); } return '#' + path + (q.size ? '?' + q : ''); }
const workspaceLink = (id, query = {}) => '#/teacher/course/' + enc(id) + qs(query);
const editLink = (id, step = null) => (id ? '#/teacher/courses/' + enc(id) + '/edit' : '#/teacher/courses/new') + qs({ step });
const fmt = (iso, opts) => new Intl.DateTimeFormat(select('preferences').lang === 'ar' ? 'ar-OM' : 'en-OM', { timeZone: 'Asia/Muscat', ...opts }).format(new Date(iso));
const day = iso => iso ? fmt(iso, { dateStyle: 'medium' }) : '—';
const clock = iso => fmt(iso, { timeStyle: 'short' });
const when = iso => iso ? `<bdi>${esc(dateTime(iso))}</bdi>` : '—';
const omr = baisa => `<bdi>${esc(money(baisa))}</bdi>`;
const pct = bps => `<bdi>${esc((bps / 100).toFixed(bps % 100 ? 2 : 0))}%</bdi>`;
const minutes = seconds => t('duration', { count: Math.max(1, Math.round(seconds / 60)) });
const safeHash = href => typeof href === 'string' && /^#\/[\w\-/?=&.]*$/.test(href);
const chip = (text, tone = 'neutral', iconName = null) => `<span class="chip text-sm tone-${tone}">${iconName ? icon(iconName, { size: 14 }) : ''}<span>${esc(text)}</span></span>`;
const sectionTitle = (id, title, extra = '') => `<div class="flex items-center justify-between gap-3 flex-wrap mb-4"><h2 id="${id}" class="text-xl">${esc(title)}</h2>${extra}</div>`;
const submit = (key, variant = 'primary', attrs = '') => `<button type="submit" class="btn btn-${variant}" ${attrs}>${esc(label(key))}</button>`;
const denied = (status, ctx) => fallback(status === 'missing' ? 'missing' : 'resourceDenied', ctx);
const formState = name => select('teacher.form', { name });
const fe = (form, name) => form.fieldErrors[name] ? t(form.fieldErrors[name]) : '';
const fv = (form, name, value = '') => form.values[name] ?? value;
const hasErrors = form => Object.keys(form.fieldErrors).length > 0;
const dirField = (html, dir) => html.replace('class="field"', `class="field" dir="${dir}"`);
const withValue = (html, name, value) => html.replace(`name="${name}"`, `name="${esc(name)}" value="${esc(value)}"`);
const localInput = iso => new Date(Date.parse(iso) + 4 * 3600000).toISOString().slice(0, 16);
const pairName = p => `${L(p.grade?.name)} · ${L(p.display_name ?? p.subject?.name)}`;
const gradeSubject = c => `${L(c.grade?.name)} · ${L(c.subject?.name)}`;
const priceText = c => c.price_type === 'free' ? t('free') : money(c.price_baisa);
const TYPE_ICONS = { video: 'play', reading: 'book', quiz: 'clipboard', assignment: 'edit' };
const STEP_ICONS = { identity: 'fileText', academics: 'graduationCap', content: 'book', assessments: 'clipboard', live: 'calendar', access: 'creditCard', review: 'checkCircle' };
const COURSE_STATES = ['Draft', 'Submitted', 'ChangesRequested', 'Published', 'Unpublished', 'Archived'];
const QUEUE = ['open', 'assigned', 'waiting', 'escalated', 'resolved'];
const revisionChip = c => c.revision ? chip(label('revision.' + c.revision.status), c.revision.status === 'ChangesRequested' ? 'warning' : c.revision.status === 'Submitted' ? 'info' : 'neutral', 'edit') : '';
const feedbackChip = c => c.feedback ? chip(label('feedbackChip'), 'warning', 'flag') : '';
const thumb = (c, size = 'h-14 w-20') => `<img class="${size} rounded-xl object-cover shrink-0" src="${courseCover(c.id, c.subject?.id ?? 'math')}" alt="">`;
const reopenAttr = (form, name) => hasErrors(form) ? `data-reopen="${esc(name)}"` : '';
const holdText = h => typeof h === 'object' && h ? L(h) : h === 'demo_hold_until_manual_release' ? label('holdDemo') : h === 'recovery_after_payout' ? label('holdRecovery') : '';
const auditLabel = action => t(`p6.audit.${action}`) === t('unknown') ? action : label('audit.' + action);
const choiceButtons = (key, value, text, prefs) => `<button type="button" class="btn ${prefs[key] === value ? 'btn-primary' : 'btn-secondary'} flex-1" data-action="shell.${key}" data-${key}="${value}" aria-pressed="${prefs[key] === value}">${esc(text)}</button>`;

// ---------------------------------------------------------------- dashboard
export const dashboard = {
  render(ctx) {
    const d = select('teacher.dashboard'); if (!d) return fallback('resourceDenied', ctx);
    const header = pageHeader({ title: label('welcome', { name: L(d.teacher.name).split(' ')[0] }), subtitle: `${label('dashIntro')} · ${t('footer.demoDate')}`, actions: button({ label: label('createCourse'), href: '#/teacher/courses/new' }) + button({ label: label('allCourses'), href: '#/teacher/courses', variant: 'secondary' }) });
    const alerts = d.feedback.map(c => `<section class="panel mb-4 border-s-4" style="border-inline-start-color:var(--accent)" aria-label="${esc(label('feedbackAlert', { title: L(c.title) }))}"><div class="flex items-start gap-3 flex-wrap"><span class="work-icon">${icon('flag', { size: 18 })}</span><div class="min-w-0 flex-1"><h2 class="text-base">${esc(label('feedbackAlert', { title: L(c.title) }))}</h2><p class="text-sm mt-1" dir="auto">${esc(L(c.feedback) || label('feedbackNone'))}</p></div>${button({ label: label('fixCourse'), href: editLink(c.id, 'review'), variant: 'secondary' })}</div></section>`).join('');
    const stats = `<div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 mb-6">${statCard({ label: label('statCourses'), value: d.total, icon: 'book' })}${statCard({ label: label('statPublished'), value: d.counts.Published, icon: 'checkCircle' })}${statCard({ label: label('statReview'), value: d.counts.Submitted, icon: 'clock' })}${statCard({ label: label('statDrafts'), value: d.counts.Draft + d.counts.ChangesRequested, icon: 'edit' })}${statCard({ label: label('statLearners'), value: d.learners, icon: 'users' })}</div>`;
    const statuses = `<section class="panel" aria-labelledby="status-title">${sectionTitle('status-title', label('byStatus'), button({ label: t('all'), href: '#/teacher/courses', variant: 'ghost' }))}<ul class="grid gap-2 sm:grid-cols-2">${COURSE_STATES.map(k => `<li><a class="work-row" href="#/teacher/courses?status=${k}">${badge(k, { domain: 'course' })}<strong class="ms-auto"><bdi>${d.counts[k]}</bdi></strong></a></li>`).join('')}</ul></section>`;
    const queue = `<section class="panel" aria-labelledby="queue-title">${sectionTitle('queue-title', label('inboxQueue'), button({ label: t('all'), href: '#/teacher/inbox', variant: 'ghost' }))}<div class="grid grid-cols-2 gap-2 mb-4">${['open', 'assigned', 'waiting', 'escalated'].map(k => `<a class="work-row" href="#/teacher/inbox?status=${k}"><span class="min-w-0 flex-1 text-sm">${esc(t('status.conversation.' + k))}</span><strong><bdi>${d.queue[k]}</bdi></strong></a>`).join('')}</div>${d.attention.length ? `<ul class="space-y-2">${d.attention.map(q => `<li><a class="work-row" href="#/teacher/inbox/${esc(enc(q.id))}"><span class="work-icon">${icon(q.kind === 'lesson_qa' ? 'helpCircle' : 'messageCircle', { size: 18 })}</span><span class="min-w-0 flex-1"><span class="block font-medium" dir="auto">${esc(L(q.subject))}</span><span class="block text-sm muted">${esc(L(q.course_title))}</span></span>${badge(q.state, { domain: 'conversation' })}</a></li>`).join('')}</ul>` : `<p class="muted">${esc(label('queueClear'))}</p>`}</section>`;
    const l = d.ledger;
    const finance = `<section class="panel stack" aria-labelledby="finance-title">${sectionTitle('finance-title', label('salesPayables'), button({ label: label('openEarnings'), href: '#/teacher/earnings', variant: 'ghost' }))}<dl class="grid grid-cols-2 gap-3">${[['gross', l.gross], ['commission', l.commission], ['pending', l.pending], ['available', l.available], ['reserved', l.reserved], ['paid', l.paid]].map(([k, v]) => `<div class="rounded-xl bg-sand p-3 min-w-0"><dt class="text-sm muted">${esc(label('money.' + k))}</dt><dd class="font-semibold mt-1">${omr(v)}</dd></div>`).join('')}</dl><p class="text-sm muted">${esc(label('ledgerNote'))}</p></section>`;
    const weekLabel = w => label('weekEnding', { date: fmt(w.end, { day: 'numeric', month: 'short' }) });
    const chart = `<figure class="panel min-w-0" aria-labelledby="activity-title"><p class="eyebrow">${esc(label('activityEyebrow'))}</p><h2 id="activity-title" class="text-xl mt-1">${esc(label('activityTitle'))}</h2><p class="muted text-sm mt-1">${esc(label('activitySub'))}</p><div class="chart-box mt-4"><canvas data-chart="teacher-activity" role="img" aria-label="${esc(label('activitySub'))}" aria-describedby="teacher-activity-summary"></canvas></div><figcaption class="mt-4"><p class="sr-only">${esc(t('p4.chartFallback'))}</p><ul id="teacher-activity-summary" class="cycle-summary">${d.weeks.map(w => `<li><span class="flex-1 min-w-0">${esc(weekLabel(w))}</span><span class="text-sm">${esc(label('weekCounts', { sales: w.sales, lessons: w.lessons, questions: w.questions }))}</span></li>`).join('')}</ul></figcaption></figure>`;
    const live = `<section class="panel" aria-labelledby="live-title">${sectionTitle('live-title', label('upcomingLive'), button({ label: t('route./teacher/calendar'), href: '#/teacher/calendar', variant: 'ghost' }))}${d.upcoming.length ? `<ul class="space-y-2">${d.upcoming.map(x => `<li><a class="work-row" href="${esc(workspaceLink(x.course_id, { tab: 'live' }))}"><span class="work-icon">${icon('calendar', { size: 18 })}</span><span class="min-w-0 flex-1"><span class="block font-medium" dir="auto">${esc(L(x.title))}</span><span class="block text-sm muted">${esc(L(x.course_title))} · ${when(x.starts_at)}</span></span>${badge(x.status, { domain: 'live' })}</a></li>`).join('')}</ul>` : `<p class="muted">${esc(label('noUpcoming'))}</p>`}</section>`;
    return header + alerts + stats + `<div class="dash-grid"><div class="stack min-w-0">${chart}${statuses}</div><div class="stack min-w-0">${queue}${finance}${live}</div></div>`;
  },
  mount(root, ctx) {
    const d = select('teacher.dashboard'); if (!d) return () => {};
    const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#0F766E';
    const sets = [['sales', primary], ['lessons', '#B7834A'], ['questions', '#5B8FA8']];
    return mountCharts(root, { 'teacher-activity': { type: 'bar', data: { labels: d.weeks.map(w => label('weekEnding', { date: fmt(w.end, { day: 'numeric', month: 'short' }) })), datasets: sets.map(([key, color]) => ({ label: label('series.' + key), data: d.weeks.map(w => w[key]), backgroundColor: color, borderRadius: 8, maxBarThickness: 28 })) }, options: { plugins: { legend: { display: true, position: 'bottom' } } } } }, ctx);
  },
};

// ---------------------------------------------------------------- my courses
function teachingCard(c) {
  const href = workspaceLink(c.id);
  return `<article class="panel course-card flex flex-col min-w-0"><a href="${esc(href)}" tabindex="-1" aria-hidden="true" class="block relative"><img class="cover" src="${courseCover(c.id, c.subject?.id)}" alt="" loading="lazy"><span class="cover-tag">${icon({ live: 'calendar', hybrid: 'clock' }[c.mode] ?? 'play', { size: 14 })}${esc(t('mode.' + c.mode))}</span></a>
  <div class="p-4 flex flex-col flex-1 min-w-0 gap-3"><p class="text-xs font-semibold text-primary">${esc(gradeSubject(c))}</p><h3 class="text-base"><a href="${esc(href)}">${esc(L(c.title))}</a></h3>
  <div class="flex-row">${badge(c.status, { domain: 'course' })}${revisionChip(c)}${feedbackChip(c)}</div>
  <p class="text-sm muted">${esc(label('cardMeta', { learners: c.learners, lessons: c.lessons }))} · <bdi>${esc(priceText(c))}</bdi></p>
  <div class="flex-row mt-auto pt-2">${button({ label: label('workspace'), href })}${c.status === 'Archived' ? '' : button({ label: label('edit'), href: editLink(c.id), variant: 'secondary' })}</div></div></article>`;
}
export const courses = {
  render(ctx) {
    const all = select('teacher.courses'), status = COURSE_STATES.includes(ctx.query.get('status')) ? ctx.query.get('status') : 'all', view = ctx.query.get('view') === 'table' ? 'table' : 'cards';
    const rows = status === 'all' ? all : all.filter(c => c.status === status);
    const filter = tabs([{ id: 'all', label: t('all'), href: url(ctx, { status: null }), count: all.length }, ...COURSE_STATES.map(k => ({ id: k, label: t('status.course.' + k), href: url(ctx, { status: k }), count: all.filter(c => c.status === k).length }))], status, { label: label('statusFilter'), id: 'course-status' });
    const toggle = `<div class="flex-row mt-4" role="group" aria-label="${esc(label('viewToggle'))}">${['cards', 'table'].map(v => `<a class="btn ${v === view ? 'btn-primary' : 'btn-secondary'}" href="${esc(url(ctx, { view: v === 'cards' ? null : v }))}" ${v === view ? 'aria-current="page"' : ''}>${icon(v === 'cards' ? 'book' : 'menu', { size: 16 })}<span>${esc(label('view.' + v))}</span></a>`).join('')}</div>`;
    const empty = emptyState({ icon: 'book', title: label('noCourses'), description: label('noCoursesBody'), action: { label: label('createCourse'), href: '#/teacher/courses/new' } });
    const body = !rows.length ? empty : view === 'cards' ? `<div class="grid-cards grid-three">${rows.map(teachingCard).join('')}</div>`
      : table([{ key: 'title', label: label('course'), render: c => `<span class="flex items-center gap-3 min-w-0">${thumb(c, 'hidden sm:block h-10 w-14')}<span class="min-w-0"><a class="font-medium hover:text-primary" href="${esc(workspaceLink(c.id))}">${esc(L(c.title))}</a><span class="block text-xs muted">${esc(gradeSubject(c))}</span></span></span>` }, { key: 'status', label: t('p3.status'), render: c => `<span class="flex-row">${badge(c.status, { domain: 'course' })}${revisionChip(c)}${feedbackChip(c)}</span>` }, { key: 'learners', label: label('learners'), align: 'end', render: c => `<bdi>${c.learners}</bdi>` }, { key: 'price', label: label('price'), align: 'end', render: c => `<bdi>${esc(priceText(c))}</bdi>` }], rows, { caption: label('coursesCaption'), actions: c => `<div class="flex-row">${button({ label: label('workspace'), href: workspaceLink(c.id), variant: 'secondary' })}${c.status === 'Archived' ? '' : button({ label: label('edit'), href: editLink(c.id), variant: 'ghost' })}</div>` });
    return pageHeader({ title: t('route./teacher/courses'), subtitle: label('coursesIntro'), actions: button({ label: label('createCourse'), href: '#/teacher/courses/new' }) }) + filter + toggle + `<div class="mt-6">${body}</div>`;
  },
};

// ---------------------------------------------------------------- shared authoring pieces
const saveFirst = d => emptyState({ icon: 'edit', title: label('saveFirstTitle'), description: label('saveFirstBody'), action: { label: label('step.identity'), href: editLink(null, d.course.title ? 'academics' : 'identity') } });
const lockNotice = key => key ? `<div class="mb-4">${notice({ title: label('lockedTitle'), message: t(key), tone: 'warning' })}</div>` : '';
function lessonItem(l, j, count, d, ctx) {
  const locked = !!d.contentLocked, title = L(l.title);
  const move = (dir, disabled) => `<button type="button" class="move-btn" data-action="teacher.moveLesson" data-id="${esc(l.id)}" data-value="${dir}" aria-label="${esc(label(dir === 'up' ? 'moveUp' : 'moveDown', { title }))}" ${disabled || locked ? `disabled title="${esc(locked ? t(d.contentLocked) : label('cannotMoveHint'))}"` : ''}><span aria-hidden="true">${dir === 'up' ? '▲' : '▼'}</span></button>`;
  const previewToggle = ['video', 'reading'].includes(l.type) && !locked ? `<button type="button" class="btn btn-secondary text-sm" data-action="teacher.togglePreview" data-id="${esc(l.id)}" aria-pressed="${l.preview}">${icon(l.preview ? 'lock' : 'play', { size: 16 })}<span>${esc(label(l.preview ? 'previewOff' : 'previewMake'))}</span></button>` : '';
  return `<li class="outline-row"><div class="flex flex-col gap-1">${move('up', j === 0)}${move('down', j === count - 1)}</div><span class="work-icon">${icon(TYPE_ICONS[l.type] ?? 'fileText', { size: 18 })}</span><div class="min-w-0 flex-1"><p class="font-medium" dir="auto">${esc(title)}</p><p class="text-xs muted">${esc(label('type.' + l.type))} · ${esc(minutes(l.duration_seconds))} · <bdi>${esc(l.id)}</bdi></p><div class="flex-row mt-1">${badge(l.state, { domain: 'content' })}${l.preview ? chip(label('previewOn'), 'info', 'play') : ''}</div></div><div class="flex-row">${previewToggle}${locked ? '' : `<a class="btn btn-ghost text-sm" href="${esc(url(ctx, { lesson: l.id }))}">${icon('edit', { size: 16 })}<span>${esc(label('edit'))}</span></a>`}</div></li>`;
}
function lessonFieldsMarkup(prefix, form, l = null, withType = false) {
  const kind = l?.type, content = !l || ['video', 'reading'].includes(kind);
  return `<div class="grid gap-4 sm:grid-cols-2">${['ar', 'en'].map(lg => dirField(formField({ id: `${prefix}-title-${lg}`, name: 'title_' + lg, label: label('field.lessonTitle.' + lg), required: true, value: fv(form, 'title_' + lg, l?.title?.[lg] ?? ''), error: fe(form, 'title_' + lg) }), lg === 'ar' ? 'rtl' : 'ltr')).join('')}</div>
   <div class="grid gap-4 sm:grid-cols-3">${withType ? formField({ id: prefix + '-type', name: 'type', label: label('lessonType'), type: 'select', value: fv(form, 'type', 'video'), options: LESSON_TYPES.map(v => ({ value: v, label: label('type.' + v) })), error: fe(form, 'type') }) : ''}${formField({ id: prefix + '-duration', name: 'duration', label: label('durationMinutes'), type: 'number', min: 1, max: 180, step: 1, value: fv(form, 'duration', l ? Math.round(l.duration_seconds / 60) : 8), error: fe(form, 'duration') })}${formField({ id: prefix + '-state', name: 'state', label: label('publishState'), type: 'select', value: fv(form, 'state', l?.state ?? 'ready'), options: LESSON_STATES.map(v => ({ value: v, label: t('status.content.' + v) })), hint: label('publishStateHint'), error: fe(form, 'state') })}</div>
   ${content ? formField({ id: prefix + '-preview', name: 'preview', label: label('previewField'), type: 'checkbox', value: form.values.preview !== undefined ? form.values.preview === 'on' : !!l?.preview, hint: label('previewHint') }) : ''}
   ${content ? formField({ id: prefix + '-body', name: 'body', label: label('lessonBody'), type: 'textarea', rows: 4, required: true, value: fv(form, 'body', L(l?.body) ?? ''), error: fe(form, 'body') }) : notice({ message: label('assessmentLessonNote') })}`;
}
function lessonEditor(d, ctx) {
  const l = d.modules.flatMap(m => m.lessons).find(x => x.id === ctx.query.get('lesson'));
  if (!l || d.contentLocked) return '';
  const form = formState('lesson:' + l.id);
  return `<form class="panel stack mb-6" data-action="teacher.updateLesson" data-id="${esc(l.id)}" novalidate aria-labelledby="edit-lesson-title"><div class="flex items-center justify-between gap-3 flex-wrap"><h2 id="edit-lesson-title" class="text-lg">${esc(label('editLesson', { title: L(l.title) }))}</h2>${badge(l.state, { domain: 'content' })}</div>${lessonFieldsMarkup('edit-' + l.id, form, l)}<div class="flex-row">${submit('saveLesson')}${button({ label: label('cancel'), href: url(ctx, { lesson: null }), variant: 'ghost' })}</div></form>`;
}
function outlineEditor(d, ctx) {
  const modules = d.modules.map((m, i) => {
    const form = formState('lesson-add:' + m.id);
    const add = d.contentLocked ? '' : `<details class="rounded-xl border border-border p-3" ${hasErrors(form) ? 'open' : ''}><summary class="font-medium text-primary cursor-pointer min-h-11 flex items-center gap-2">${icon('plus', { size: 18 })}<span>${esc(label('addLessonTo', { n: i + 1 }))}</span></summary><form class="stack mt-3" data-action="teacher.addLesson" data-id="${esc(m.id)}" data-course-id="${esc(m.course_id)}" novalidate>${lessonFieldsMarkup('add-' + m.id, form, null, true)}<div class="flex-row">${submit('addLesson')}</div></form></details>`;
    return `<section class="panel stack" aria-labelledby="mod-${esc(m.id)}"><div class="flex items-center justify-between gap-3 flex-wrap"><h3 id="mod-${esc(m.id)}" class="text-base">${esc(label('moduleN', { n: i + 1 }))} · <span dir="auto">${esc(L(m.title))}</span></h3><span class="text-sm muted">${esc(label('lessonCount', { count: m.lessons.length }))}</span></div>${m.lessons.length ? `<ol class="stack">${m.lessons.map((l, j) => lessonItem(l, j, m.lessons.length, d, ctx)).join('')}</ol>` : `<p class="muted text-sm">${esc(label('noLessonsYet'))}</p>`}${add}</section>`;
  }).join('');
  const form = formState('module-add:' + d.course.id);
  const addModule = d.contentLocked ? '' : `<details class="panel" ${hasErrors(form) ? 'open' : ''}><summary class="font-medium text-primary cursor-pointer min-h-11 flex items-center gap-2">${icon('plus', { size: 18 })}<span>${esc(label('addModule'))}</span></summary><form class="stack mt-3" data-action="teacher.addModule" data-course-id="${esc(d.course.id)}" novalidate><div class="grid gap-4 sm:grid-cols-2">${['ar', 'en'].map(lg => dirField(formField({ id: 'module-title-' + lg, name: 'title_' + lg, label: label('field.moduleTitle.' + lg), required: true, value: fv(form, 'title_' + lg), error: fe(form, 'title_' + lg) }), lg === 'ar' ? 'rtl' : 'ltr')).join('')}</div><div class="flex-row">${submit('addModule')}</div></form></details>`;
  return `<div class="stack">${notice({ message: label('outlineNote') })}${modules || emptyState({ icon: 'book', title: label('noModules') })}${addModule}</div>`;
}
const moduleOptions = d => d.modules.map((m, i) => ({ value: m.id, label: `${label('moduleN', { n: i + 1 })} · ${L(m.title)}` }));
function quizCreateForm(d) {
  const form = formState('quiz-create:' + d.course.id);
  const question = n => `<fieldset class="rounded-xl border border-border p-4 stack"><legend class="font-medium px-1">${esc(label('questionN', { n: n + 1 }))}${n ? ` · ${esc(label('optional'))}` : ''}</legend>
    ${formField({ id: `quiz-q${n}-prompt`, name: `q${n}_prompt`, label: label('questionPrompt'), required: !n, value: fv(form, `q${n}_prompt`), error: fe(form, `q${n}_prompt`) })}
    <div class="grid gap-3 sm:grid-cols-3">${[0, 1, 2].map(c => formField({ id: `quiz-q${n}-c${c}`, name: `q${n}_c${c}`, label: label('choiceN', { letter: 'ABC'[c] }), required: !n, value: fv(form, `q${n}_c${c}`) })).join('')}</div>${fe(form, `q${n}_choices`) ? `<p class="text-sm text-accent">${esc(fe(form, `q${n}_choices`))}</p>` : ''}
    ${formField({ id: `quiz-q${n}-correct`, name: `q${n}_correct`, label: label('correctChoice'), type: 'radio', value: fv(form, `q${n}_correct`), options: [0, 1, 2].map(c => ({ value: String(c), label: label('choiceN', { letter: 'ABC'[c] }) })), error: fe(form, `q${n}_correct`) })}</fieldset>`;
  return `<details class="panel" ${hasErrors(form) ? 'open' : ''}><summary class="font-medium text-primary cursor-pointer min-h-11 flex items-center gap-2">${icon('plus', { size: 18 })}<span>${esc(label('createQuiz'))}</span></summary><form class="stack mt-3" data-action="teacher.createQuiz" data-course-id="${esc(d.course.id)}" novalidate>
    <div class="grid gap-4 sm:grid-cols-3">${formField({ id: 'quiz-title', name: 'title', label: label('quizTitle'), required: true, value: fv(form, 'title'), error: fe(form, 'title') })}${formField({ id: 'quiz-module', name: 'moduleId', label: label('module'), type: 'select', required: true, value: fv(form, 'moduleId', d.modules[0]?.id ?? ''), options: moduleOptions(d), error: fe(form, 'moduleId') })}${formField({ id: 'quiz-pass', name: 'pass_score', label: label('passScore'), type: 'number', min: 0, max: 100, step: 1, value: fv(form, 'pass_score', 60), error: fe(form, 'pass_score') })}</div>
    ${question(0)}${question(1)}<p class="text-sm muted">${esc(label('quizNote'))}</p><div class="flex-row">${submit('createQuiz')}</div></form></details>`;
}
function assignmentFormFields(prefix, form, a = null, d = null) {
  return `<div class="grid gap-4 sm:grid-cols-2">${formField({ id: prefix + '-title', name: 'title', label: label('assignmentTitle'), required: true, value: fv(form, 'title', L(a?.title) ?? ''), error: fe(form, 'title') })}${d ? formField({ id: prefix + '-module', name: 'moduleId', label: label('module'), type: 'select', required: true, value: fv(form, 'moduleId', d.modules[0]?.id ?? ''), options: moduleOptions(d), error: fe(form, 'moduleId') }) : ''}</div>
    ${formField({ id: prefix + '-instructions', name: 'instructions', label: label('instructions'), type: 'textarea', rows: 3, required: true, value: fv(form, 'instructions', L(a?.instructions) ?? ''), error: fe(form, 'instructions') })}
    <div class="grid gap-4 sm:grid-cols-2">${formField({ id: prefix + '-due', name: 'due', label: label('dueDate'), type: 'date', required: true, min: DEMO_NOW.slice(0, 10), value: fv(form, 'due', a?.due_at?.slice(0, 10) ?? '2026-11-05'), error: fe(form, 'due') })}${formField({ id: prefix + '-max', name: 'max_score', label: label('maxScore'), type: 'number', min: 1, max: 100, step: 1, value: fv(form, 'max_score', a?.max_score ?? 100), error: fe(form, 'max_score') })}</div>`;
}
function assessmentsManager(d, ctx) {
  const item = ctx.query.get('item'), quiz = d.quizzes.find(q => q.id === item), assignment = d.assignments.find(a => a.id === item);
  let edit = '';
  if (quiz && !d.contentLocked) { const form = formState('quiz:' + quiz.id); edit = `<form class="panel stack mb-6" data-action="teacher.updateQuiz" data-id="${esc(quiz.id)}" novalidate><h2 class="text-lg">${esc(label('editQuiz'))}</h2><div class="grid gap-4 sm:grid-cols-2">${formField({ id: 'edit-quiz-title', name: 'title', label: label('quizTitle'), required: true, value: fv(form, 'title', L(quiz.title)), error: fe(form, 'title') })}${formField({ id: 'edit-quiz-pass', name: 'pass_score', label: label('passScore'), type: 'number', min: 0, max: 100, step: 1, value: fv(form, 'pass_score', quiz.pass_score), error: fe(form, 'pass_score') })}</div><p class="text-sm muted">${esc(label('quizEditNote'))}</p><div class="flex-row">${submit('saveChanges')}${button({ label: label('cancel'), href: url(ctx, { item: null }), variant: 'ghost' })}</div></form>`; }
  if (assignment && !d.contentLocked) { const form = formState('assignment:' + assignment.id); edit = `<form class="panel stack mb-6" data-action="teacher.updateAssignment" data-id="${esc(assignment.id)}" novalidate><h2 class="text-lg">${esc(label('editAssignment'))}</h2>${assignmentFormFields('edit-asg', form, assignment)}<div class="flex-row">${submit('saveChanges')}${button({ label: label('cancel'), href: url(ctx, { item: null }), variant: 'ghost' })}</div></form>`; }
  const editLinkFor = id => d.contentLocked ? '' : button({ label: label('edit'), href: url(ctx, { item: id }), variant: 'ghost' });
  const quizzes = d.quizzes.map(q => `<article class="panel activity-card"><span class="work-icon">${icon('clipboard', { size: 20 })}</span><div class="min-w-0 flex-1"><p class="text-xs muted">${esc(label('type.quiz'))} · <bdi>${esc(q.id)}</bdi></p><h3 class="text-base" dir="auto">${esc(L(q.title))}</h3><div class="flex-row mt-2">${badge(q.lesson?.state, { domain: 'content' })}${chip(label('questionsCount', { count: q.questions.length }), 'neutral')}${chip(label('passAt', { score: q.pass_score }), 'neutral', 'checkCircle')}${chip(label('attemptsCount', { count: q.attempts }), 'neutral')}</div></div>${editLinkFor(q.id)}</article>`).join('');
  const assignments = d.assignments.map(a => `<article class="panel activity-card"><span class="work-icon">${icon('edit', { size: 20 })}</span><div class="min-w-0 flex-1"><p class="text-xs muted">${esc(label('type.assignment'))} · <bdi>${esc(a.id)}</bdi></p><h3 class="text-base" dir="auto">${esc(L(a.title))}</h3><div class="flex-row mt-2">${badge(a.lesson?.state, { domain: 'content' })}${chip(label('dueOn', { date: day(a.due_at) }), 'neutral', 'calendar')}${chip(label('outOf', { score: a.max_score }), 'neutral')}${chip(label('submissionsCount', { count: a.submissions }), 'neutral')}</div></div>${editLinkFor(a.id)}</article>`).join('');
  const create = d.contentLocked ? '' : `${quizCreateForm(d)}${(() => { const form = formState('assignment-create:' + d.course.id); return `<details class="panel" ${hasErrors(form) ? 'open' : ''}><summary class="font-medium text-primary cursor-pointer min-h-11 flex items-center gap-2">${icon('plus', { size: 18 })}<span>${esc(label('createAssignment'))}</span></summary><form class="stack mt-3" data-action="teacher.createAssignment" data-course-id="${esc(d.course.id)}" novalidate>${assignmentFormFields('new-asg', form, null, d)}<div class="flex-row">${submit('createAssignment')}</div></form></details>`; })()}`;
  return `${edit}<div class="stack">${quizzes || assignments ? `<div class="grid gap-4 md:grid-cols-2">${quizzes}${assignments}</div>` : emptyState({ icon: 'clipboard', title: label('noAssessments'), description: label('noAssessmentsBody') })}${notice({ message: label('assessmentNote') })}${create}</div>`;
}
function sessionActions(x) {
  const reschedule = (key = 'reschedule') => { const form = formState('move:' + x.id); return `<details class="w-full" ${hasErrors(form) ? 'open' : ''}><summary class="btn btn-secondary">${icon('clock', { size: 16 })}<span>${esc(label(key))}</span></summary><form class="stack mt-3" data-action="teacher.reschedule" data-id="${esc(x.id)}" novalidate>${formField({ id: 'move-' + x.id, name: 'starts_at', label: label('newTime'), type: 'datetime-local', required: true, value: fv(form, 'starts_at', localInput(x.starts_at > DEMO_NOW ? x.starts_at : '2026-10-27T13:00:00Z')), hint: label('muscatHint'), error: fe(form, 'starts_at') })}<div class="flex-row">${submit('confirmMove')}</div></form></details>`; };
  if (['scheduled', 'rescheduled'].includes(x.status)) return `<div class="flex-row">${button({ label: label('cancelSession'), action: 'overlay.open', data: { id: 'cancel-' + x.id }, variant: 'danger' })}</div>${reschedule()}`;
  if (x.status === 'live') return chip(label('inProgress'), 'info', 'play');
  if (x.status === 'ended') { const form = formState('upload:' + x.id); return `<form class="stack w-full" data-action="teacher.uploadRecording" data-id="${esc(x.id)}" novalidate>${formField({ id: 'upload-' + x.id, name: 'filename', label: label('recordingFile'), value: fv(form, 'filename', 'class-recording.mp4'), hint: label('recordingFileHint'), error: fe(form, 'filename') })}<div class="flex-row"><button type="submit" class="btn btn-primary">${icon('upload', { size: 16 })}<span>${esc(label('uploadRecording'))}</span></button></div></form>`; }
  if (x.status === 'recording_processing' && x.recording) return `${notice({ message: label('processingBody') })}<div class="flex-row"><button type="button" class="btn btn-secondary" data-action="teacher.completeRecording" data-id="${esc(x.recording.id)}">${icon('refresh', { size: 16 })}<span>${esc(label('finishProcessing'))}</span></button></div>`;
  if (x.status === 'recording_ready' && x.recording) return `${notice({ message: label('readyBody') })}<div class="flex-row"><button type="button" class="btn btn-primary" data-action="teacher.publishRecording" data-id="${esc(x.recording.id)}">${icon('upload', { size: 16 })}<span>${esc(label('publishRecording'))}</span></button></div>`;
  if (x.status === 'recording_published' && x.recording) return chip(label('publishedOn', { date: day(x.recording.published_at) }), 'success', 'checkCircle');
  if (x.status === 'cancelled') return `<p class="text-sm muted">${esc(label('cancelledNote'))}</p>`;
  if (x.status === 'failed') return `${notice({ title: label('failedTitle'), message: label('failedBody'), tone: 'danger' })}<div class="flex-row">${button({ label: t('p4.getHelp'), href: '#/help?tab=contact', variant: 'ghost' })}</div>${reschedule('retrySession')}`;
  return '';
}
const cancelDialog = x => modal({ id: 'cancel-' + x.id, title: label('cancelTitle', { title: L(x.title) }), body: notice({ title: label('cancelWarnTitle'), message: label('cancelWarn'), tone: 'danger' }), footer: button({ label: label('confirmCancel'), action: 'teacher.cancelSession', data: { id: x.id }, variant: 'danger' }) + button({ label: label('keepSession'), action: 'overlay.close', data: { id: 'cancel-' + x.id }, variant: 'ghost' }) });
function scheduleFields(form, courses = null) {
  return `${courses ? formField({ id: 'schedule-course', name: 'courseId', label: label('course'), type: 'select', required: true, value: fv(form, 'courseId'), options: [{ value: '', label: label('chooseCourse') }, ...courses.map(c => ({ value: c.id, label: L(c.title) }))], error: fe(form, 'courseId') }) : ''}
    ${formField({ id: 'schedule-title', name: 'title', label: label('sessionTitle'), required: true, value: fv(form, 'title'), error: fe(form, 'title') })}
    <div class="grid gap-4 sm:grid-cols-2">${formField({ id: 'schedule-start', name: 'starts_at', label: label('startsAt'), type: 'datetime-local', required: true, value: fv(form, 'starts_at', '2026-10-26T17:00'), hint: label('muscatHint'), error: fe(form, 'starts_at') })}${formField({ id: 'schedule-duration', name: 'duration', label: label('durationMinutes'), type: 'number', min: 15, max: 180, step: 5, value: fv(form, 'duration', 60), error: fe(form, 'duration') })}</div>`;
}
function liveManager(d) {
  const form = formState('schedule:' + d.course.id), archived = d.raw?.status === 'Archived';
  const scheduleForm = archived ? notice({ message: t('p6.lockedArchived') }) : `<form class="panel stack" data-action="teacher.schedule" data-course-id="${esc(d.course.id)}" novalidate><h2 class="text-lg">${esc(label('scheduleTitle'))}</h2><p class="text-sm muted">${esc(label('scheduleNote'))}</p>${scheduleFields(form)}<div class="flex-row">${submit('scheduleSession')}</div></form>`;
  const sessions = d.sessions.filter(x => x.status !== 'draft');
  const list = sessions.length ? sessions.map(x => `<article class="panel session-card"><div class="date-tile" aria-hidden="true"><span>${esc(fmt(x.starts_at, { day: 'numeric' }))}</span><small>${esc(fmt(x.starts_at, { month: 'short' }))}</small></div><div class="min-w-0 flex-1 stack"><div class="flex items-start justify-between gap-3 flex-wrap"><h3 class="text-base" dir="auto">${esc(L(x.title))}</h3>${badge(x.status, { domain: 'live' })}</div><p class="text-sm"><bdi>${esc(dateTime(x.starts_at))} – ${esc(clock(x.ends_at))}</bdi> <span class="muted">${esc(t('p4.muscat'))}</span></p><p class="text-sm muted">${esc(label('attendedCount', { count: x.attendance ?? 0 }))}${x.join_generation > 1 ? ` · ${esc(label('generation', { n: x.join_generation }))}` : ''}</p>${sessionActions(x)}</div></article>${['scheduled', 'rescheduled'].includes(x.status) ? cancelDialog(x) : ''}`).join('') : emptyState({ icon: 'calendar', title: label('noSessions') });
  return `<p class="text-sm muted mb-4">${esc(t('footer.demoDate'))} · ${esc(t('p4.muscatNote'))}</p><div class="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"><section class="stack min-w-0" aria-labelledby="sessions-title"><h2 id="sessions-title" class="text-xl">${esc(label('sessions'))}</h2>${notice({ message: label('recordingFlow') })}${list}</section><div class="min-w-0">${scheduleForm}</div></div>`;
}
// Shared with the administration review queue (links=false: staff cannot open the owner's wizard).
export function checklistMarkup(d, compact = false, { links = true } = {}) {
  return `<ul class="stack">${d.checklist.map(x => `<li class="check-row ${x.ok ? '' : x.blocking ? 'tone-danger' : 'tone-warning'}"><span class="shrink-0">${icon(x.ok ? 'checkCircle' : x.blocking ? 'x' : 'helpCircle', { size: 20 })}</span><div class="min-w-0 flex-1"><p class="font-medium">${esc(label('check.' + x.id))}</p>${compact ? '' : `<p class="text-sm mt-1">${esc(label('check.' + x.id + (x.ok ? 'Ok' : 'Todo')))}</p>`}<div class="flex-row mt-1"><span class="text-xs">${esc(label(x.ok ? 'checkPassed' : x.blocking ? 'checkRequired' : 'checkAdvisory'))}</span>${x.ok || x.step === 'review' || !links ? '' : `<a class="text-sm font-medium underline" href="${esc(editLink(d.course.id, x.step))}">${esc(label('goToStep', { step: label('step.' + x.step) }))}</a>`}</div></div></li>`).join('')}</ul>`;
}
function publishActions(d) {
  const c = d.course, blocked = d.checklist.some(x => x.blocking && !x.ok), reason = label('fixBlocking');
  const submitBtn = key => `<button type="button" class="btn btn-primary" data-action="teacher.submitCourse" data-id="${esc(c.id)}" ${blocked ? `disabled title="${esc(reason)}"` : ''}>${icon('upload', { size: 16 })}<span>${esc(label(key))}</span></button>${blocked ? `<small class="muted block w-full">${esc(reason)}</small>` : ''}`;
  if (['Draft', 'ChangesRequested'].includes(c.status)) return submitBtn(c.status === 'ChangesRequested' ? 'resubmit' : 'submitReview');
  if (c.status === 'Submitted') return notice({ title: label('inReviewTitle'), message: label('inReviewBody') });
  if (c.status === 'Published') {
    if (c.revision?.status === 'Submitted') return notice({ title: label('revisionInReview'), message: label('revisionInReviewBody') });
    if (c.revision) return submitBtn('submitRevision');
    return `<button type="button" class="btn btn-secondary" data-action="teacher.requestRevision" data-id="${esc(c.id)}">${icon('edit', { size: 16 })}<span>${esc(label('startRevision'))}</span></button>`;
  }
  return notice({ message: label('statusHelp.' + c.status) });
}

// ---------------------------------------------------------------- create / edit wizard
function stepState(d, step) {
  if (d.isNew) return step === 'identity' ? (d.course.title ? 'done' : 'todo') : step === 'academics' ? 'todo' : 'locked';
  if (step === 'review') return 'todo';
  const check = d.checklist.find(x => x.step === step && x.blocking) ?? d.checklist.find(x => x.step === step);
  return !check ? 'todo' : check.ok ? 'done' : check.blocking ? 'attention' : 'todo';
}
function stepperNav(d, current) {
  return `<nav aria-label="${esc(label('wizardSteps'))}" class="wizard-stepper-wrap mb-6"><ol class="wizard-steps">${COURSE_STEPS.map((s, i) => {
    const state = stepState(d, s), inner = `<span class="wizard-num">${state === 'done' ? icon('check', { size: 16 }) : `<bdi>${i + 1}</bdi>`}</span><span class="min-w-0"><span class="block font-semibold text-sm">${esc(label('step.' + s))}</span><span class="block text-xs muted">${esc(label('stepState.' + (s === current ? 'current' : state)))}</span></span>`;
    return `<li>${state === 'locked' ? `<span class="wizard-step is-locked" aria-disabled="true" title="${esc(label('saveFirstBody'))}">${inner}</span>` : `<a class="wizard-step is-${state}" href="${esc(editLink(d.isNew ? null : d.course.id, s))}" ${s === current ? 'aria-current="step"' : ''}>${inner}</a>`}</li>`;
  }).join('')}</ol></nav>`;
}
function saveBar(d, step) {
  const prev = COURSE_STEPS[COURSE_STEPS.indexOf(step) - 1], lock = d.locked ? `disabled title="${esc(t(d.locked))}"` : '';
  const status = d.isNew ? label('notSavedYet') : d.course.status === 'Published' ? label('savesToRevision') : label('savesToDraft');
  return `<div class="save-bar" role="group" aria-label="${esc(label('saveBar'))}"><p class="text-sm muted min-w-0 flex items-center gap-2">${icon('fileText', { size: 16 })}<span>${esc(status)}</span></p><div class="flex-row">${prev ? button({ label: label('back'), href: editLink(d.isNew ? null : d.course.id, prev), variant: 'ghost' }) : ''}<button type="submit" name="intent" value="save" class="btn btn-secondary" ${lock}>${esc(label('saveDraft'))}</button><button type="submit" name="intent" value="next" class="btn btn-primary" ${lock}>${esc(label('saveContinue'))}</button></div></div>`;
}
function navBar(d, step) {
  const i = COURSE_STEPS.indexOf(step), prev = COURSE_STEPS[i - 1], next = COURSE_STEPS[i + 1], id = d.isNew ? null : d.course.id;
  return `<div class="save-bar" role="group" aria-label="${esc(label('saveBar'))}"><p class="text-sm muted min-w-0 flex items-center gap-2">${icon('checkCircle', { size: 16 })}<span>${esc(label('autoSaved'))}</span></p><div class="flex-row">${prev ? button({ label: label('back'), href: editLink(id, prev), variant: 'ghost' }) : ''}${next ? button({ label: label('continueTo', { step: label('step.' + next) }), href: editLink(id, next) }) : button({ label: label('openWorkspace'), href: workspaceLink(id), variant: 'secondary' })}</div></div>`;
}
const stepForm = (d, step, body) => `<form class="stack" data-action="teacher.saveStep" data-step="${step}" data-id="${esc(d.isNew ? '' : d.course.id)}" novalidate>${body}${saveBar(d, step)}</form>`;
function identityStep(d, form) {
  const c = d.course;
  const pair = (key, type = 'text', rows = 3, required = true) => `<div class="grid gap-4 sm:grid-cols-2">${['ar', 'en'].map(lg => dirField(formField({ id: `f-${key}-${lg}`, name: `${key}_${lg}`, label: label(`field.${key}.${lg}`), type, rows, required, value: fv(form, `${key}_${lg}`, c[key]?.[lg] ?? ''), error: fe(form, `${key}_${lg}`) }), lg === 'ar' ? 'rtl' : 'ltr')).join('')}</div>`;
  return stepForm(d, 'identity', `<section class="panel stack" aria-labelledby="identity-title"><h2 id="identity-title" class="text-lg">${esc(label('identityTitle'))}</h2><p class="text-sm muted">${esc(label('identityIntro'))}</p>${pair('title')}${pair('summary', 'textarea', 3)}${pair('description', 'textarea', 5)}</section><section class="panel stack" aria-labelledby="optional-title"><h2 id="optional-title" class="text-lg">${esc(label('optionalTitle'))}</h2><p class="text-sm muted">${esc(label('optionalIntro'))}</p>${pair('outcomes', 'textarea', 3, false)}${pair('prerequisites', 'textarea', 3, false)}</section>`);
}
function academicsStep(d, form) {
  const c = d.course, years = d.years;
  const options = {
    curriculum_version_id: d.versions.map(v => ({ value: v.id, label: L(v.name) + (v.active ? '' : ` · ${label('inactive')}`), disabled: !v.active })),
    grade_subject_id: [{ value: '', label: label('choosePair') }, ...d.pairs.map(p => ({ value: p.id, label: pairName(p) }))],
    academic_year_id: years.map(y => ({ value: y.id, label: L(y.name) })),
    semester_id: d.semesters.map(s => ({ value: s.id, label: `${L(s.name)} · ${L(years.find(y => y.id === s.academic_year_id)?.name)}` })),
    language: ['ar', 'en'].map(v => ({ value: v, label: label('lang.' + v) })),
    mode: ['recorded', 'live', 'hybrid'].map(v => ({ value: v, label: t('mode.' + v) })),
  };
  const defaults = { curriculum_version_id: c.curriculum_version_id ?? 'CV-001', grade_subject_id: c.grade_subject_id ?? '', academic_year_id: c.academic_year_id ?? 'AY-002', semester_id: c.semester_id ?? 'SEM-003', language: c.language ?? 'ar', mode: c.mode ?? 'recorded' };
  const field = (name, hint = '') => formField({ id: 'f-' + name, name, label: label('field.' + name), type: 'select', required: true, value: fv(form, name, defaults[name]), options: options[name], hint, error: fe(form, name) });
  return stepForm(d, 'academics', `<section class="panel stack" aria-labelledby="academics-title"><h2 id="academics-title" class="text-lg">${esc(label('academicsTitle'))}</h2>${notice({ title: label('qualifiedOnly'), message: label('qualifiedOnlyBody', { count: d.pairs.length }) })}<div class="grid gap-4 sm:grid-cols-2">${field('curriculum_version_id', label('versionHint'))}${field('grade_subject_id', label('pairHint'))}${field('academic_year_id')}${field('semester_id')}${field('language')}${field('mode')}</div><p class="text-sm"><a class="text-primary underline" href="#/teacher/settings?tab=qualifications">${esc(label('requestMore'))}</a></p></section>`);
}
function accessStep(d, form) {
  if (d.isNew) return saveFirst(d);
  const c = d.course;
  return stepForm(d, 'access', `<section class="panel stack" aria-labelledby="access-title"><h2 id="access-title" class="text-lg">${esc(label('accessTitle'))}</h2>
    <div class="grid gap-6 sm:grid-cols-2">${formField({ id: 'f-price-type', name: 'price_type', label: label('priceType'), type: 'radio', value: fv(form, 'price_type', c.price_type ?? 'free'), options: [{ value: 'free', label: t('free') }, { value: 'paid', label: label('paid') }], error: fe(form, 'price_type') })}
    ${formField({ id: 'f-price', name: 'price', label: label('priceOmr'), value: fv(form, 'price', c.price_type === 'paid' ? (c.price_baisa / 1000).toFixed(3) : ''), hint: label('priceHint'), error: fe(form, 'price') }).replace('type="text"', 'type="text" inputmode="decimal" dir="ltr"')}</div>
    <div class="grid gap-6 sm:grid-cols-2">${formField({ id: 'f-access-kind', name: 'access_kind', label: label('accessPolicy'), type: 'radio', value: fv(form, 'access_kind', c.access_policy?.kind ?? 'academic_year'), options: [{ value: 'academic_year', label: label('accessYear') }, { value: 'fixed_end', label: label('accessFixed') }], error: fe(form, 'access_kind') })}
    ${formField({ id: 'f-access-end', name: 'access_end', label: label('accessEnd'), type: 'date', min: DEMO_NOW.slice(0, 10), value: fv(form, 'access_end', c.access_policy?.kind === 'fixed_end' ? c.access_policy.end_at.slice(0, 10) : ''), hint: label('accessEndHint'), error: fe(form, 'access_end') })}</div>
    ${notice({ title: label('policyOpenTitle'), message: label('policyOpen'), tone: 'warning' })}</section>`);
}
function reviewStep(d) {
  if (d.isNew) return saveFirst(d);
  const c = d.course, preview = courseCard(c, { href: c.public ? '#/course/' + enc(c.id) : workspaceLink(c.id) });
  return `<div class="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]"><section class="panel stack min-w-0" aria-labelledby="checklist-title"><h2 id="checklist-title" class="text-lg">${esc(label('checklistTitle'))}</h2><p class="text-sm muted">${esc(label('checklistIntro'))}</p>${checklistMarkup(d)}</section>
    <div class="stack min-w-0"><section class="panel stack" aria-labelledby="publish-title"><h2 id="publish-title" class="text-lg">${esc(label('publishTitle'))}</h2><div class="flex-row">${badge(c.status, { domain: 'course' })}${revisionChip(c)}</div>${c.feedback ? notice({ title: label('feedbackTitle'), message: L(c.feedback), tone: 'warning' }) : ''}<p class="text-sm muted">${esc(label('statusHelp.' + c.status))}</p><div class="flex-row">${publishActions(d)}</div></section>
    <section aria-labelledby="card-preview"><h2 id="card-preview" class="text-lg mb-3">${esc(label('cardPreview'))}</h2><div class="max-w-sm">${preview}</div>${c.public && c.revision ? `<p class="text-sm muted mt-3">${esc(label('publicKeepsSnapshot'))}</p>` : ''}</section></div></div>${navBar(d, 'review')}`;
}
function wizard(ctx, id) {
  const d = select('teacher.editor', { id }); if (d.status !== 'ok') return denied(d.status, ctx);
  const step = COURSE_STEPS.includes(ctx.query.get('step')) ? ctx.query.get('step') : 'identity', c = d.course;
  const form = formState(`wizard:${d.isNew ? 'new' : c.id}:${step}`);
  const routeTitle = t(d.isNew ? 'route./teacher/courses/new' : 'route./teacher/courses/:id/edit');
  const header = pageHeader({ title: d.isNew ? label('newCourse') : L(c.title), subtitle: d.isNew ? label('newIntro') : `${routeTitle} · ${gradeSubject(c)}`, breadcrumbs: [{ label: t('route./teacher/courses'), href: '#/teacher/courses' }, ...(d.isNew ? [] : [{ label: L(c.title), href: workspaceLink(c.id) }]), { label: routeTitle }], actions: d.isNew ? '' : button({ label: label('openWorkspace'), href: workspaceLink(c.id), variant: 'secondary' }) + (c.public ? button({ label: label('publicPage'), href: '#/course/' + enc(c.id), variant: 'ghost' }) : '') });
  const strip = d.isNew ? `<div class="mb-4">${notice({ message: label('newNote') })}</div>` : `<div class="flex-row mb-4">${badge(c.status, { domain: 'course' })}${revisionChip(c)}${feedbackChip(c)}<span class="text-sm muted"><bdi>${esc(c.id)}</bdi></span></div>${c.status === 'Published' ? `<div class="mb-4">${notice({ title: label('revisionTitle'), message: label('revisionBody') })}</div>` : ''}${c.feedback && step !== 'review' ? `<div class="mb-4">${notice({ title: label('feedbackTitle'), message: L(c.feedback), tone: 'warning' })}</div>` : ''}`;
  let body;
  if (step === 'identity') body = lockNotice(d.locked) + identityStep(d, form);
  else if (step === 'academics') body = lockNotice(d.locked) + academicsStep(d, form);
  else if (step === 'access') body = lockNotice(d.locked) + accessStep(d, form);
  else if (step === 'review') body = reviewStep(d);
  else if (d.isNew) body = saveFirst(d);
  else if (step === 'content') body = lockNotice(d.contentLocked) + lessonEditor(d, ctx) + outlineEditor(d, ctx) + navBar(d, step);
  else if (step === 'assessments') body = lockNotice(d.contentLocked) + assessmentsManager(d, ctx) + navBar(d, step);
  else body = liveManager(select('teacher.workspace', { id: c.id })) + navBar(d, step);
  return header + strip + stepperNav(d, step) + `<section aria-label="${esc(label('step.' + step))}">${body}</section>`;
}
export const createCourse = { render: ctx => wizard(ctx, null), mount: (root, ctx) => reopen(root, ctx) };
export const editCourse = { render: ctx => wizard(ctx, ctx.params.id), mount: (root, ctx) => reopen(root, ctx) };

// ---------------------------------------------------------------- course workspace
const WS_TABS = ['details', 'lessons', 'resources', 'live', 'learners', 'questions', 'analytics'];
function detailsTab(w) {
  const c = w.course, year = w.years.find(y => y.id === c.academic_year_id), semester = w.semesters.find(s => s.id === c.semester_id);
  const unpublish = c.status === 'Published' && !c.unpublish_request ? button({ label: label('requestUnpublish'), action: 'overlay.open', data: { id: 'unpublish-dialog' }, variant: 'ghost' }) : '';
  const form = formState('unpublish:' + c.id);
  const dialog = c.status === 'Published' && !c.unpublish_request ? modal({ id: 'unpublish-dialog', title: label('unpublishTitle', { title: L(c.title) }), body: `<form class="stack" data-action="teacher.requestUnpublish" data-id="${esc(c.id)}" novalidate>${notice({ message: label('unpublishNote'), tone: 'warning' })}${formField({ id: 'unpublish-reason', name: 'reason', label: label('reason'), type: 'textarea', rows: 3, required: true, value: fv(form, 'reason'), error: fe(form, 'reason') })}<div class="flex-row">${submit('sendRequest')}</div></form>` }).replace('<dialog ', `<dialog ${reopenAttr(form, 'unpublish:' + c.id)} `) : '';
  const facts = [[label('gradeSubject'), esc(gradeSubject(c))], [label('periodLabel'), `${esc(L(year?.name))} · ${esc(L(semester?.name))}`], [label('field.language'), esc(label('lang.' + c.language))], [label('field.mode'), esc(t('mode.' + c.mode))], [label('price'), `<bdi>${esc(priceText(c))}</bdi>`], [label('accessUntil'), `<bdi>${esc(day(c.access_policy?.end_at))}</bdi>`], [label('owner'), esc(L(c.teacher?.name))]];
  const history = w.history.length ? `<ol class="stack">${w.history.map(e => `<li class="flex items-start gap-3"><span class="dot dot-read" aria-hidden="true"></span><div class="min-w-0"><p class="font-medium">${esc(auditLabel(e.action))}</p><p class="text-sm muted">${esc(L(e.actor) || label('system'))} · ${when(e.created_at)}</p>${e.reason ? `<p class="text-sm mt-1" dir="auto">${esc(e.reason)}</p>` : ''}</div></li>`).join('')}</ol>` : `<p class="muted">${esc(label('noHistory'))}</p>`;
  return `<div class="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]"><div class="stack min-w-0">
    <section class="panel stack" aria-labelledby="pub-title"><h2 id="pub-title" class="text-lg">${esc(label('publishTitle'))}</h2><div class="flex-row">${badge(c.status, { domain: 'course' })}${revisionChip(c)}${c.unpublish_request ? chip(label('unpublishRequested'), 'warning', 'clock') : ''}</div><p class="text-sm muted">${esc(label('statusHelp.' + c.status))}</p>${c.feedback ? notice({ title: label('feedbackTitle'), message: L(c.feedback), tone: 'warning' }) : ''}${c.revision ? notice({ title: label('revisionTitle'), message: label('revisionFields', { fields: c.revision.fields.map(f => label('fieldName.' + f)).join(select('preferences').lang === 'ar' ? '، ' : ', ') || label('none') }) }) : ''}<div class="flex-row">${publishActions(w)}${c.status !== 'Archived' ? button({ label: label('edit'), href: editLink(c.id), variant: 'secondary' }) : ''}${unpublish}</div></section>
    <section class="panel stack" aria-labelledby="check-title"><h2 id="check-title" class="text-lg">${esc(label('checklistTitle'))}</h2>${checklistMarkup(w, true)}</section>
    <section class="panel stack" aria-labelledby="history-title"><h2 id="history-title" class="text-lg">${esc(label('history'))}</h2>${history}</section></div>
    <div class="stack min-w-0"><section class="panel stack" aria-labelledby="facts-title"><h2 id="facts-title" class="text-lg">${esc(label('facts'))}</h2><dl class="meta-list">${facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join('')}</dl></section>
    <section class="panel stack" aria-labelledby="team-title"><h2 id="team-title" class="text-lg">${esc(label('courseTeam'))}</h2>${w.team.length ? `<ul class="stack">${w.team.map(m => `<li class="flex items-start gap-3">${avatar({ id: m.member_id, name: m.name }, { size: 36 })}<div class="min-w-0"><p class="font-medium">${esc(L(m.name))}</p><p class="flex-row mt-1">${m.capabilities.map(x => chip(label('cap.' + x), 'neutral')).join('')}</p></div></li>`).join('')}</ul>` : `<p class="muted text-sm">${esc(label('noTeam'))}</p>`}${button({ label: label('manageTeam'), href: '#/teacher/team?tab=access', variant: 'secondary' })}</section></div></div>${dialog}`;
}
function gradingQueue(w) {
  if (!w.submissions.length) return `<p class="muted">${esc(label('noSubmissions'))}</p>`;
  return `<ul class="stack">${w.submissions.map(x => {
    const form = formState('grade:' + x.id), released = x.state === 'released';
    const gradeForm = released ? '' : `<form class="grid gap-3 sm:grid-cols-[120px_minmax(0,1fr)_auto] items-end" data-action="teacher.grade" data-id="${esc(x.id)}" novalidate>${formField({ id: 'score-' + x.id, name: 'score', label: label('scoreOutOf', { max: x.assignment.max_score }), type: 'number', min: 0, max: x.assignment.max_score, step: 1, required: true, value: fv(form, 'score', x.grade?.score ?? ''), error: fe(form, 'score') })}${formField({ id: 'feedback-' + x.id, name: 'feedback', label: label('feedback'), required: true, value: fv(form, 'feedback', x.grade?.feedback ?? ''), error: fe(form, 'feedback') })}<div>${submit(x.grade ? 'updateGrade' : 'saveGrade', 'secondary')}</div></form>`;
    return `<li class="panel stack"><div class="flex items-start justify-between gap-3 flex-wrap"><div class="flex items-center gap-3 min-w-0">${avatar(x.student, { size: 36 })}<div class="min-w-0"><p class="font-semibold">${esc(L(x.student.name))}</p><p class="text-sm muted" dir="auto">${esc(L(x.assignment.title))} · ${when(x.submitted_at)}</p></div></div><div class="flex-row">${badge(x.state, { domain: 'submission' })}${x.grade ? chip(`${x.grade.score} / ${x.assignment.max_score}`, 'neutral', 'chart') : ''}</div></div><p class="text-sm whitespace-pre-line rounded-xl bg-sand p-3" dir="auto">${esc(x.text)}</p>${x.filename ? `<p class="text-sm">${icon('fileText', { size: 16 })} <bdi>${esc(x.filename)}</bdi></p>` : ''}${gradeForm}${x.state === 'graded' ? `<div class="flex-row"><button type="button" class="btn btn-primary" data-action="teacher.release" data-id="${esc(x.id)}">${icon('upload', { size: 16 })}<span>${esc(label('releaseResult'))}</span></button><span class="text-sm muted">${esc(label('releaseNote'))}</span></div>` : released ? `<p class="text-sm">${chip(label('releasedOn', { date: day(x.grade?.released_at) }), 'success', 'checkCircle')}</p>` : ''}</li>`;
  }).join('')}</ul>`;
}
function resourcesTab(w, ctx) {
  const lessons = w.modules.flatMap(m => m.lessons);
  const form = formState('resource-add:' + w.course.id);
  const list = w.resources.length ? `<ul class="grid gap-4 md:grid-cols-2">${w.resources.map(r => { const f = formState('resource:' + r.id); return `<li class="panel stack"><div class="flex items-start gap-3 min-w-0"><span class="work-icon">${icon(r.kind === 'worksheet' ? 'clipboard' : 'fileText', { size: 18 })}</span><div class="min-w-0 flex-1"><h3 class="text-base" dir="auto">${esc(L(r.title))}</h3><p class="text-sm muted"><bdi>${esc(r.filename)}</bdi> · ${esc(t('p4.bytes', { count: r.byte_size }))} · ${esc(t('p4.kind.' + r.kind))}</p><p class="text-xs muted mt-1">${esc(t('p4.fromLesson', { title: L(r.lesson?.title) }))}</p></div></div>${w.contentLocked ? '' : `<details ${hasErrors(f) ? 'open' : ''}><summary class="text-sm font-medium text-primary cursor-pointer min-h-11 flex items-center">${esc(label('edit'))}</summary><form class="stack mt-2" data-action="teacher.updateResource" data-id="${esc(r.id)}" novalidate>${formField({ id: 'res-title-' + r.id, name: 'title', label: label('resourceTitle'), required: true, value: fv(f, 'title', L(r.title)), error: fe(f, 'title') })}${formField({ id: 'res-body-' + r.id, name: 'body', label: label('resourceBody'), type: 'textarea', rows: 4, required: true, value: fv(f, 'body', L(r.body)), error: fe(f, 'body') })}<div class="flex-row">${submit('saveChanges', 'secondary')}</div></form></details>`}</li>`; }).join('')}</ul>` : `<p class="muted">${esc(label('noResources'))}</p>`;
  const add = w.contentLocked || !lessons.length ? '' : `<details class="panel" ${hasErrors(form) ? 'open' : ''}><summary class="font-medium text-primary cursor-pointer min-h-11 flex items-center gap-2">${icon('plus', { size: 18 })}<span>${esc(label('addResource'))}</span></summary><form class="stack mt-3" data-action="teacher.addResource" novalidate><div class="grid gap-4 sm:grid-cols-2">${formField({ id: 'res-lesson', name: 'lessonId', label: label('lesson'), type: 'select', required: true, value: fv(form, 'lessonId'), options: [{ value: '', label: label('chooseLesson') }, ...lessons.map(l => ({ value: l.id, label: L(l.title) }))], error: fe(form, 'lessonId') })}${formField({ id: 'res-kind', name: 'kind', label: label('resourceKind'), type: 'select', required: true, value: fv(form, 'kind', 'worksheet'), options: ['worksheet', 'pdf'].map(v => ({ value: v, label: t('p4.kind.' + v) })), error: fe(form, 'kind') })}${formField({ id: 'res-title', name: 'title', label: label('resourceTitle'), required: true, value: fv(form, 'title'), error: fe(form, 'title') })}${formField({ id: 'res-file', name: 'filename', label: label('resourceFile'), required: true, value: fv(form, 'filename', 'worksheet.txt'), hint: label('resourceFileHint'), error: fe(form, 'filename') })}</div>${formField({ id: 'res-body', name: 'body', label: label('resourceBody'), type: 'textarea', rows: 4, required: true, value: fv(form, 'body'), error: fe(form, 'body') })}<div class="flex-row">${submit('addResource')}</div></form></details>`;
  return `<div class="stack"><section aria-labelledby="grading-title">${sectionTitle('grading-title', label('gradingQueue'))}${notice({ message: label('gradingNote') })}<div class="mt-4">${gradingQueue(w)}</div></section>
    <section aria-labelledby="res-title-h" class="stack">${sectionTitle('res-title-h', label('resources'))}${list}${add}</section>
    <section aria-labelledby="assess-title" class="stack">${sectionTitle('assess-title', label('assessments'))}${assessmentsManager(w, ctx)}</section></div>`;
}
function learnersTab(w) {
  return `<p class="text-sm muted mb-4">${esc(label('learnersNote'))}</p>` + table([
    { key: 'student', label: label('learner'), render: r => `<span class="flex items-center gap-3 min-w-0">${avatar(r.student, { size: 32 })}<span class="min-w-0"><span class="block font-medium">${esc(L(r.student.name))}</span><span class="block text-xs muted">${esc(L(r.student.grade?.name))}</span></span></span>` },
    { key: 'percent', label: t('progress'), render: r => progressBar(r.percent, { label: t('p4.lessonsDone', { done: r.done, total: r.total }) }) },
    { key: 'access', label: label('access'), render: r => badge(r.access === 'none' ? 'expired' : r.access, { domain: 'access' }) },
    { key: 'last', label: label('lastActivity'), render: r => r.last_activity ? `<bdi>${esc(day(r.last_activity))}</bdi>` : esc(label('none')) },
  ], w.learners, { caption: label('learnersCaption'), actions: r => button({ label: label('openRecord'), href: '#/teacher/students' + qs({ course: r.course_id, record: r.student.id }), variant: 'ghost' }), empty: emptyState({ icon: 'users', title: label('noLearners') }) });
}
function questionsTab(w) {
  const form = formState('announce:' + w.course.id);
  const convs = w.conversations.length ? `<ul class="stack">${w.conversations.map(q => `<li><a class="panel card-link thread-row" href="#/teacher/inbox/${esc(enc(q.id))}"><span class="work-icon">${icon(q.kind === 'lesson_qa' ? 'helpCircle' : 'messageCircle', { size: 20 })}</span><span class="min-w-0 flex-1"><span class="flex items-center justify-between gap-3 flex-wrap"><span class="font-semibold" dir="auto">${esc(L(q.subject))}</span>${badge(q.state, { domain: 'conversation' })}</span><span class="block text-sm muted">${esc(L(q.student_name))} · ${esc(t('p4.kind.' + q.kind))}${q.assignee ? ` · ${esc(label('assignedTo', { name: L(q.assignee) }))}` : ''}</span><span class="block text-xs muted mt-1">${when(q.last_message_at)}</span></span></a></li>`).join('')}</ul>` : `<p class="muted">${esc(label('noQuestions'))}</p>`;
  const post = w.raw.status === 'Archived' ? '' : `<form class="panel stack" data-action="teacher.announce" data-course-id="${esc(w.course.id)}" novalidate><h3 class="text-lg">${esc(label('postAnnouncement'))}</h3><p class="text-sm muted">${esc(label('announceNote', { count: w.analytics.active }))}</p>${formField({ id: 'ann-title', name: 'title', label: label('announcementTitle'), required: true, value: fv(form, 'title'), error: fe(form, 'title') })}${formField({ id: 'ann-body', name: 'body', label: label('announcementBody'), type: 'textarea', rows: 4, required: true, value: fv(form, 'body'), error: fe(form, 'body') })}<div class="flex-row">${submit('publishAnnouncement')}</div></form>`;
  const anns = w.announcements.length ? `<ol class="stack">${w.announcements.map(a => `<li class="panel"><p class="text-xs muted">${when(a.published_at)}</p><h3 class="mt-1" dir="auto">${esc(L(a.title))}</h3><p class="mt-2 leading-relaxed" dir="auto">${esc(L(a.body))}</p></li>`).join('')}</ol>` : `<p class="muted">${esc(t('p4.noAnnouncements'))}</p>`;
  return `<div class="grid gap-6 lg:grid-cols-2"><section class="stack min-w-0" aria-labelledby="cq-title"><h2 id="cq-title" class="text-xl">${esc(label('courseQuestions'))}</h2><p class="text-sm muted">${esc(label('courseQuestionsNote'))}</p>${convs}</section><section class="stack min-w-0" aria-labelledby="an-title"><h2 id="an-title" class="text-xl">${esc(label('announcements'))}</h2>${post}${anns}</section></div>`;
}
function analyticsTab(w) {
  const a = w.analytics;
  const stats = `<div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">${statCard({ label: label('activeLearners'), value: a.active, icon: 'users' })}${statCard({ label: label('avgProgress'), value: `${a.average}%`, icon: 'chart' })}${statCard({ label: label('questionsAsked'), value: a.questions, icon: 'messageCircle' })}${statCard({ label: label('quizAttempts'), value: a.attempts, icon: 'clipboard' })}</div>`;
  const chart = `<figure class="panel min-w-0" aria-labelledby="eng-title"><h2 id="eng-title" class="text-xl">${esc(label('engagementTitle'))}</h2><p class="muted text-sm mt-1">${esc(label('engagementSub'))}</p>${a.completions.length ? `<div class="chart-box mt-4"><canvas data-chart="engagement" role="img" aria-label="${esc(label('engagementSub'))}" aria-describedby="engagement-table"></canvas></div>` : ''}<figcaption class="mt-4" id="engagement-table">${table([{ key: 'title', label: label('lesson'), render: r => `<span dir="auto">${esc(L(r.title))}</span>` }, { key: 'started', label: label('started'), align: 'end', render: r => `<bdi>${r.started}</bdi>` }, { key: 'done', label: label('completed'), align: 'end', render: r => `<bdi>${r.done}</bdi>` }], a.completions, { caption: label('engagementCaption'), empty: `<p class="muted">${esc(label('noPublishedLessons'))}</p>` })}</figcaption></figure>`;
  return `<div class="stack">${notice({ message: label('analyticsNote') })}${stats}${chart}</div>`;
}
export const workspace = {
  render(ctx) {
    const w = select('teacher.workspace', { id: ctx.params.id }); if (w.status !== 'ok') return denied(w.status, ctx);
    const c = w.course, tab = WS_TABS.includes(ctx.query.get('tab')) ? ctx.query.get('tab') : 'details';
    const counts = { lessons: w.modules.reduce((n, m) => n + m.lessons.length, 0), resources: w.resources.length + w.quizzes.length + w.assignments.length, live: w.sessions.filter(x => x.status !== 'draft').length, learners: w.learners.length, questions: w.conversations.length };
    const header = pageHeader({ title: L(c.title), subtitle: `${gradeSubject(c)} · ${t('mode.' + c.mode)}`, breadcrumbs: [{ label: t('route./teacher/courses'), href: '#/teacher/courses' }, { label: L(c.title) }], actions: (c.status !== 'Archived' ? button({ label: label('editCourse'), href: editLink(c.id) }) : '') + (c.public ? button({ label: label('publicPage'), href: '#/course/' + enc(c.id), variant: 'secondary' }) : '') });
    const strip = `<section class="panel flex flex-col sm:flex-row sm:items-center gap-4 mb-6 min-w-0">${thumb(c, 'w-full sm:w-28 aspect-[16/10] h-auto')}<div class="min-w-0 flex-1 stack"><div class="flex-row">${badge(c.status, { domain: 'course' })}${revisionChip(c)}${feedbackChip(c)}<span class="text-sm muted"><bdi>${esc(c.id)}</bdi></span></div><p class="text-sm muted">${esc(label('cardMeta', { learners: c.learners, lessons: c.lessons }))} · <bdi>${esc(priceText(c))}</bdi></p></div></section>`;
    const nav = tabs(WS_TABS.map(id => ({ id, label: label('ws.' + id), href: workspaceLink(c.id, { tab: id }), count: counts[id] })), tab, { label: label('wsTabs'), id: 'ws-tabs' });
    const body = { details: () => detailsTab(w), lessons: () => lockNotice(w.contentLocked) + lessonEditor(w, ctx) + outlineEditor(w, ctx), resources: () => lockNotice(w.contentLocked) + resourcesTab(w, ctx), live: () => liveManager(w), learners: () => learnersTab(w), questions: () => questionsTab(w), analytics: () => analyticsTab(w) }[tab]();
    return header + strip + `<div class="room-tabs">${nav}</div><section class="mt-6" aria-labelledby="ws-tabs-${tab}">${body}</section>`;
  },
  mount(root, ctx) {
    const stopDialog = reopen(root, ctx);
    if (!root.querySelector('canvas[data-chart="engagement"]')) return stopDialog;
    const w = select('teacher.workspace', { id: ctx.params.id }); if (w.status !== 'ok') return stopDialog;
    const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#0F766E';
    const rows = w.analytics.completions;
    const stopCharts = mountCharts(root, { engagement: { type: 'bar', data: { labels: rows.map((r, i) => label('lessonShort', { n: i + 1 })), datasets: [{ label: label('started'), data: rows.map(r => r.started), backgroundColor: '#B7834A', borderRadius: 6, maxBarThickness: 22 }, { label: label('completed'), data: rows.map(r => r.done), backgroundColor: primary, borderRadius: 6, maxBarThickness: 22 }] }, options: { plugins: { legend: { display: true, position: 'bottom' } } } } }, ctx);
    return () => { stopDialog(); stopCharts(); };
  },
};

// ---------------------------------------------------------------- students
function studentRecord(id, ctx) {
  const r = select('teacher.student', { id }); if (r.status !== 'ok') return { missing: notice({ title: label(r.status === 'missing' ? 'recordMissing' : 'recordDenied'), message: label('recordUnavailable'), tone: 'warning' }) };
  const body = `<div class="flex items-center gap-4 min-w-0">${avatar(r.student, { size: 56 })}<div class="min-w-0"><p class="font-semibold text-lg">${esc(L(r.student.name))}</p><p class="text-sm muted">${esc(L(r.student.grade?.name))}</p></div></div>${notice({ message: label('noGuardianData') })}${r.rows.map(row => `<section class="rounded-xl border border-border p-4 stack"><div class="flex items-start justify-between gap-3 flex-wrap"><h3 class="text-base" dir="auto">${esc(L(row.course_title))}</h3>${badge(row.access === 'none' ? 'expired' : row.access, { domain: 'access' })}</div>${progressBar(row.percent, { label: t('p4.lessonsDone', { done: row.done, total: row.total }) })}<p class="text-sm muted">${esc(label('lastActivity'))}: ${row.last_activity ? `<bdi>${esc(day(row.last_activity))}</bdi>` : esc(label('none'))}</p>${row.quizzes.length ? `<div><p class="text-sm font-medium">${esc(label('quizResults'))}</p><ul class="text-sm mt-1 space-y-1">${row.quizzes.map(q => `<li class="flex justify-between gap-3"><span dir="auto">${esc(L(q.title))}</span><span>${q.best === null ? esc(t('p4.notAttempted')) : `<bdi>${q.best}%</bdi> · ${esc(label('attemptsCount', { count: q.attempts }))}`}</span></li>`).join('')}</ul></div>` : ''}${row.assignments.length ? `<div><p class="text-sm font-medium">${esc(label('assignmentResults'))}</p><ul class="text-sm mt-1 space-y-1">${row.assignments.map(a => `<li class="flex justify-between gap-3 flex-wrap"><span dir="auto">${esc(L(a.title))}</span><span class="flex-row">${badge(a.state, { domain: 'submission' })}${a.score !== null ? `<bdi>${a.score} / ${a.max_score}</bdi>` : ''}</span></li>`).join('')}</ul></div>` : ''}${button({ label: label('workspace'), href: workspaceLink(row.course_id, { tab: 'learners' }), variant: 'ghost' })}</section>`).join('')}`;
  return { drawer: drawer({ id: 'student-record', title: L(r.student.name), body, side: 'end' }) };
}
export const students = {
  render(ctx) {
    const d = select('teacher.students', { courseId: ctx.query.get('course') }); if (!d) return fallback('resourceDenied', ctx);
    const filter = `<form class="panel flex flex-col sm:flex-row sm:items-end gap-3 mb-6" data-action="teacher.filterStudents" novalidate><div class="flex-1 min-w-0">${formField({ id: 'students-course', name: 'course', label: label('courseFilter'), type: 'select', value: d.courseId ?? '', options: [{ value: '', label: label('allCourses') }, ...d.courses.map(c => ({ value: c.id, label: L(c.title) }))] })}</div>${submit('apply', 'secondary')}</form>`;
    const record = ctx.query.get('record') ? studentRecord(ctx.query.get('record'), ctx) : null;
    const list = table([
      { key: 'student', label: label('learner'), render: r => `<span class="flex items-center gap-3 min-w-0">${avatar(r.student, { size: 32 })}<span class="min-w-0"><span class="block font-medium">${esc(L(r.student.name))}</span><span class="block text-xs muted">${esc(L(r.student.grade?.name))}</span></span></span>` },
      { key: 'course', label: label('course'), render: r => `<span dir="auto">${esc(L(r.course_title))}</span>` },
      { key: 'percent', label: t('progress'), render: r => progressBar(r.percent, { label: t('p4.lessonsDone', { done: r.done, total: r.total }) }) },
      { key: 'access', label: label('access'), render: r => badge(r.access === 'none' ? 'expired' : r.access, { domain: 'access' }) },
    ], d.rows, { caption: label('studentsCaption', { count: d.rows.length }), actions: r => button({ label: label('openRecord'), href: url(ctx, { record: r.student.id }), variant: 'ghost' }), empty: emptyState({ icon: 'users', title: label('noLearners') }) });
    return pageHeader({ title: t('route./teacher/students'), subtitle: label('studentsIntro') }) + (record?.missing ? `<div class="mb-6">${record.missing}</div>` : '') + filter + `<section class="panel min-w-0">${list}</section><p class="text-sm muted mt-4">${esc(label('noGuardianData'))}</p>` + (record?.drawer ?? '');
  },
  mount(root, ctx) { return recordDrawer(root, ctx, 'student-record'); },
};

// ---------------------------------------------------------------- inbox
const assignForm = (q, compact = false) => {
  if (q.state === 'resolved') return '';
  const me = select('actor'), options = [{ value: me.user_id, label: label('assignSelf') }, ...q.members.map(m => ({ value: m.user_id, label: L(m.name) }))];
  return `<form class="flex flex-col sm:flex-row sm:items-end gap-2" data-action="teacher.assign" data-id="${esc(q.id)}" novalidate><div class="flex-1 min-w-0">${formField({ id: `assign-${q.id}${compact ? '-c' : ''}`, name: 'assignee', label: label('assignTo'), type: 'select', value: q.assigned_user_id ?? me.user_id, options, hint: compact ? '' : label('assignHint') })}</div>${submit('assign', 'secondary')}</form>`;
};
export const inbox = {
  render(ctx) {
    const status = QUEUE.includes(ctx.query.get('status')) ? ctx.query.get('status') : null, d = select('teacher.inbox', { status }); if (!d) return fallback('resourceDenied', ctx);
    const nav = tabs([{ id: 'all', label: t('all'), href: url(ctx, { status: null }), count: d.all.length }, ...QUEUE.map(k => ({ id: k, label: t('status.conversation.' + k), href: url(ctx, { status: k }), count: d.counts[k] }))], status ?? 'all', { label: label('inboxFilter'), id: 'inbox-filter' });
    const rows = d.rows.length ? `<ul class="stack mt-6">${d.rows.map(q => `<li class="panel stack"><div class="flex items-start gap-3 min-w-0"><span class="work-icon">${icon(q.kind === 'lesson_qa' ? 'helpCircle' : 'messageCircle', { size: 20 })}</span><div class="min-w-0 flex-1"><div class="flex items-start justify-between gap-3 flex-wrap"><h2 class="text-base"><a class="hover:text-primary" href="#/teacher/inbox/${esc(enc(q.id))}" dir="auto">${esc(L(q.subject))}</a></h2>${badge(q.state, { domain: 'conversation' })}</div><p class="text-sm muted">${esc(L(q.course_title))} · ${esc(L(q.student_name))} · ${esc(t('p4.kind.' + q.kind))}</p>${q.last_text ? `<p class="text-sm mt-1 clamp-2" dir="auto">${esc(q.last_text)}</p>` : ''}<p class="text-xs muted mt-1">${when(q.last_message_at)}${q.assignee ? ` · ${esc(label('assignedTo', { name: L(q.assignee) }))}` : ` · ${esc(label('unassigned'))}`}</p></div></div><div class="flex flex-col lg:flex-row lg:items-end gap-3 border-t border-border pt-3"><div class="flex-1 min-w-0">${assignForm(q, true)}</div>${button({ label: label('openThread'), href: '#/teacher/inbox/' + enc(q.id), variant: 'ghost' })}</div></li>`).join('')}</ul>` : `<div class="mt-6">${emptyState({ icon: 'messageCircle', title: label('inboxEmpty'), description: label('inboxEmptyBody') })}</div>`;
    return pageHeader({ title: t('route./teacher/inbox'), subtitle: label('inboxIntro') }) + notice({ message: label('safeguarding') }) + `<div class="mt-6">${nav}</div>` + rows;
  },
};
function reportDialog() {
  return modal({ id: 'report-dialog', title: t('p4.reportTitle'), body: `<form class="stack" data-action="teacher.report" novalidate><input type="hidden" name="messageId" value="">${formField({ id: 'teacher-report-reason', name: 'reason', label: t('p4.reportReason'), type: 'radio', value: '', required: true, options: ['unsafe', 'inappropriate', 'privacy', 'other'].map(value => ({ value, label: t('p4.reason.' + value) })) })}<p class="text-sm muted">${esc(label('reportNote'))}</p><button type="submit" class="btn btn-danger">${esc(t('p4.reportSubmit'))}</button></form>` });
}
export const thread = {
  render(ctx) {
    const d = select('teacher.thread', { id: ctx.params.id }); if (d.status !== 'ok') return denied(d.status, ctx);
    const q = d.conversation, replyForm = formState('reply:' + q.id), noteForm = formState('note:' + q.id);
    const who = m => m.own ? label('you') : `${L(m.author_name) || label('unknownPerson')} · ${label('role.' + m.author_role)}`;
    const messages = d.messages.map(m => `<li class="msg ${m.own ? 'msg-own' : ''} ${m.internal ? 'msg-internal' : ''}"><div class="flex items-center justify-between gap-3 flex-wrap"><span class="flex items-center gap-2 min-w-0">${avatar({ id: m.author_user_id, name: m.author_name ?? { ar: who(m), en: who(m) } }, { size: 28 })}<strong class="text-sm">${esc(who(m))}</strong></span><span class="text-xs muted">${when(m.created_at)}</span></div>${m.internal ? `<p class="mt-2">${chip(label('internalNote'), 'warning', 'lock')}</p>` : ''}<p class="mt-2 whitespace-pre-line" dir="auto">${esc(m.text)}</p><div class="flex-row mt-1">${m.moderation_state === 'flagged' ? chip(t('p4.underReview'), 'warning', 'shield') : ''}${m.own || m.internal ? '' : d.reported.has(m.id) ? chip(t('p4.reported'), 'warning', 'flag') : `<button type="button" class="btn btn-ghost text-sm min-h-11" data-action="teacher.reportOpen" data-id="${esc(m.id)}">${icon('flag', { size: 16 })}<span>${esc(t('p4.report'))}</span></button>`}</div></li>`).join('');
    const statusButtons = d.next.length ? `<div class="flex-row">${d.next.map(s => `<button type="button" class="btn ${s === 'resolved' ? 'btn-primary' : 'btn-secondary'}" data-action="teacher.setStatus" data-id="${esc(q.id)}" data-value="${s}">${esc(label('moveTo', { state: t('status.conversation.' + s) }))}</button>`).join('')}</div>` : `<p class="text-sm muted">${esc(label(q.state === 'open' ? 'openHint' : 'resolvedHint'))}</p>`;
    const trail = d.trail.length ? `<ol class="stack">${d.trail.map(e => `<li class="text-sm"><p class="font-medium">${esc(auditLabel(e.action))}${e.detail ? ` · <span dir="auto">${esc(typeof e.detail === 'object' ? L(e.detail) : e.detail)}</span>` : ''}</p><p class="muted">${esc(L(e.actor) || label('system'))} · ${when(e.at)}${e.status && e.status !== 'active' ? ` · ${esc(label('superseded'))}` : ''}</p></li>`).join('')}</ol>` : `<p class="muted text-sm">${esc(label('noHistory'))}</p>`;
    return pageHeader({ title: L(q.subject), subtitle: L(d.course.title), breadcrumbs: [{ label: t('route./teacher/inbox'), href: '#/teacher/inbox' }, { label: L(q.subject) }] })
      + `<div class="flex-row mb-6">${badge(q.state, { domain: 'conversation' })}${chip(t('p4.kind.' + q.kind), 'neutral', q.kind === 'lesson_qa' ? 'helpCircle' : 'lock')}${d.lesson ? chip(L(d.lesson.title), 'neutral', 'book') : ''}${chip(L(d.student.name), 'neutral', 'user')}${button({ label: label('workspace'), href: workspaceLink(d.course.id, { tab: 'questions' }), variant: 'ghost' })}</div>
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]"><section class="min-w-0 stack" aria-labelledby="thread-title"><h2 id="thread-title" class="sr-only">${esc(t('p4.messages'))}</h2><ol class="stack">${messages}</ol>
      <form class="panel stack" data-action="teacher.reply" novalidate><h3 class="text-base">${esc(label('publicReply'))}</h3>${formField({ id: 'reply-text', name: 'text', label: label('replyLabel'), type: 'textarea', rows: 3, required: true, value: fv(replyForm, 'text'), hint: label('replyHint'), error: fe(replyForm, 'text') })}<div class="flex-row">${submit('sendReply')}</div></form>
      <form class="panel stack msg-internal" data-action="teacher.note" novalidate><h3 class="text-base flex items-center gap-2">${icon('lock', { size: 16 })}<span>${esc(label('internalNote'))}</span></h3>${formField({ id: 'note-text', name: 'text', label: label('noteLabel'), type: 'textarea', rows: 2, required: true, value: fv(noteForm, 'text'), hint: label('noteHint'), error: fe(noteForm, 'text') })}<div class="flex-row">${submit('addNote', 'secondary')}</div></form></section>
      <aside class="stack min-w-0"><section class="panel stack" aria-labelledby="assign-title"><h2 id="assign-title" class="text-lg">${esc(label('assignment'))}</h2><p class="text-sm">${esc(d.assignee ? label('assignedTo', { name: L(d.assignee) }) : label('unassigned'))}</p>${assignForm({ ...q, members: d.members })}${d.members.length ? '' : `<p class="text-sm muted">${esc(label('noMembersForCourse'))}</p>`}</section>
      <section class="panel stack" aria-labelledby="status-title"><h2 id="status-title" class="text-lg">${esc(label('statusTitle'))}</h2>${statusButtons}<button type="button" class="btn btn-ghost" data-action="teacher.reportOpen" data-id="">${icon('flag', { size: 16 })}<span>${esc(label('reportConversation'))}</span></button>${d.reported.has('conversation:' + q.id) ? chip(t('p4.reported'), 'warning', 'flag') : ''}</section>
      <section class="panel stack" aria-labelledby="trail-title"><h2 id="trail-title" class="text-lg">${esc(label('auditTrail'))}</h2>${trail}</section></aside></div>${reportDialog()}`;
  },
  mount: (root, ctx) => reopen(root, ctx),
};

// ---------------------------------------------------------------- calendar
export const calendar = {
  render(ctx) {
    const c = select('teacher.calendar'); if (!c) return fallback('resourceDenied', ctx);
    const view = ctx.query.get('view') === 'list' ? 'list' : 'week', offset = Math.max(-12, Math.min(12, Number.parseInt(ctx.query.get('week'), 10) || 0)), today = dayKey(DEMO_NOW);
    const form = formState('schedule:calendar');
    const createDialog = modal({ id: 'schedule-dialog', title: label('scheduleTitle'), size: 'lg', body: `<form class="stack" data-action="teacher.schedule" novalidate><p class="text-sm muted">${esc(label('scheduleNote'))}</p>${scheduleFields(form, c.courses)}<div class="flex-row">${submit('scheduleSession')}</div></form>` }).replace('<dialog ', `<dialog ${reopenAttr(form, 'schedule:calendar')} `);
    const movable = c.sessions.filter(x => ['scheduled', 'rescheduled', 'failed'].includes(x.status));
    const moveDialogs = movable.map(x => { const f = formState('move:' + x.id); return modal({ id: 'move-' + x.id, title: label('moveTitle', { title: L(x.title) }), body: `<form class="stack" data-action="teacher.reschedule" data-id="${esc(x.id)}" novalidate>${formField({ id: 'cal-move-' + x.id, name: 'starts_at', label: label('newTime'), type: 'datetime-local', required: true, value: fv(f, 'starts_at', localInput(x.starts_at > DEMO_NOW ? x.starts_at : '2026-10-27T13:00:00Z')), hint: label('muscatHint'), error: fe(f, 'starts_at') })}${notice({ message: label('moveNote') })}<div class="flex-row">${submit('confirmMove')}</div></form>` }).replace('<dialog ', `<dialog ${reopenAttr(f, 'move:' + x.id)} `); }).join('') + movable.filter(x => x.status !== 'failed').map(cancelDialog).join('');
    const actions = x => `<div class="flex-row mt-2">${['scheduled', 'rescheduled', 'failed'].includes(x.status) ? button({ label: label(x.status === 'failed' ? 'retrySession' : 'move'), action: 'overlay.open', data: { id: 'move-' + x.id }, variant: 'secondary' }) : ''}${['scheduled', 'rescheduled'].includes(x.status) ? button({ label: label('cancelSession'), action: 'overlay.open', data: { id: 'cancel-' + x.id }, variant: 'ghost' }) : ''}<a class="text-sm font-medium text-primary underline min-h-11 inline-flex items-center" href="${esc(workspaceLink(x.course_id, { tab: 'live' }))}">${esc(label('liveTab'))}</a></div>`;
    const toggle = tabs([{ id: 'week', label: t('p4.weekView'), href: url(ctx, { view: null }) }, { id: 'list', label: t('p4.listView'), href: url(ctx, { view: 'list', week: null }) }], view, { label: t('p4.calendarView'), id: 'cal-view' });
    let body;
    if (view === 'week') {
      const days = weekDays(offset), keys = days.map(dayKey);
      const nav = `<div class="flex items-center justify-between gap-3 flex-wrap mt-6"><div class="flex-row">${button({ label: t('p4.prevWeek'), href: url(ctx, { week: offset - 1 }), variant: 'secondary' })}${button({ label: t('p4.thisWeek'), href: url(ctx, { week: null }), variant: 'ghost' })}${button({ label: t('p4.nextWeek'), href: url(ctx, { week: offset + 1 }), variant: 'secondary' })}</div><p class="font-semibold"><bdi>${esc(fmt(days[0], { day: 'numeric', month: 'short', timeZone: 'UTC' }))} – ${esc(fmt(days[6], { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }))}</bdi></p></div>`;
      const count = keys.reduce((n, k) => n + c.sessions.filter(x => dayKey(x.starts_at) === k).length, 0);
      body = nav + `<ol class="week-grid mt-4" aria-label="${esc(t('p4.weekView'))}">${days.map((d, i) => { const k = keys[i], s = c.sessions.filter(x => dayKey(x.starts_at) === k); return `<li class="week-day ${k === today ? 'is-today' : ''}" ${k === today ? 'aria-current="date"' : ''}><p class="week-day-head"><span>${esc(fmt(d, { weekday: 'short', timeZone: 'UTC' }))}</span><bdi>${esc(fmt(d, { day: 'numeric', timeZone: 'UTC' }))}</bdi>${k === today ? `<span class="sr-only">${esc(t('p4.today'))}</span>` : ''}</p>${s.map(x => `<div class="cal-event cal-${x.status}"><p class="text-xs muted"><bdi>${esc(clock(x.starts_at))}</bdi></p><p class="text-sm font-medium" dir="auto">${esc(L(x.title))}</p><p class="text-xs muted">${esc(L(x.course_title))}</p><div class="flex-row mt-1">${badge(x.status, { domain: 'live' })}</div>${actions(x)}</div>`).join('')}${s.length ? '' : `<p class="text-xs muted">${esc(t('p4.noEvents'))}</p>`}</li>`; }).join('')}</ol>${count ? '' : `<p class="muted mt-4">${esc(label('emptyWeek'))}</p>`}`;
    } else {
      const up = c.sessions.filter(x => x.ends_at > DEMO_NOW), past = c.sessions.filter(x => x.ends_at <= DEMO_NOW).reverse();
      const group = (rows, key) => `<section class="stack mt-6" aria-labelledby="cal-${key}"><h2 id="cal-${key}" class="text-xl">${esc(t('p4.' + key))}</h2>${rows.length ? rows.map(x => `<article class="panel session-card"><div class="date-tile" aria-hidden="true"><span>${esc(fmt(x.starts_at, { day: 'numeric' }))}</span><small>${esc(fmt(x.starts_at, { month: 'short' }))}</small></div><div class="min-w-0 flex-1"><div class="flex items-start justify-between gap-3 flex-wrap"><h3 class="text-base" dir="auto">${esc(L(x.title))}</h3>${badge(x.status, { domain: 'live' })}</div><p class="text-sm muted">${esc(L(x.course_title))}</p><p class="text-sm"><bdi>${esc(dateTime(x.starts_at))} – ${esc(clock(x.ends_at))}</bdi></p>${actions(x)}</div></article>`).join('') : `<p class="muted">${esc(t('p4.' + (key === 'upcoming' ? 'noUpcoming' : 'noPast')))}</p>`}</section>`;
      body = group(up, 'upcoming') + group(past, 'past');
    }
    return pageHeader({ title: t('route./teacher/calendar'), subtitle: `${t('footer.demoDate')} · ${t('p4.muscatNote')}`, actions: button({ label: label('scheduleSession'), action: 'overlay.open', data: { id: 'schedule-dialog' } }) }) + toggle + body + createDialog + moveDialogs;
  },
  mount: (root, ctx) => reopen(root, ctx),
};

// ---------------------------------------------------------------- team
const TEAM_TABS = ['members', 'invitations', 'access'];
function revokeDialog(m) {
  const name = L(m.user?.name);
  return modal({ id: 'revoke-' + m.id, title: label(m.status === 'invited' ? 'cancelInviteTitle' : 'revokeTitle', { name }), body: notice({ title: label('revokeWarnTitle'), message: label(m.status === 'invited' ? 'cancelInviteWarn' : 'revokeWarn', { name, count: m.assignments.length }), tone: 'danger' }), footer: button({ label: label(m.status === 'invited' ? 'confirmCancelInvite' : 'confirmRevoke'), action: 'teacher.revokeMember', data: { id: m.id }, variant: 'danger' }) + button({ label: label('cancel'), action: 'overlay.close', data: { id: 'revoke-' + m.id }, variant: 'ghost' }) });
}
function memberCard(m) {
  return `<article class="panel stack min-w-0"><div class="flex items-center gap-3 min-w-0">${avatar(m.user, { size: 48 })}<div class="min-w-0 flex-1"><h3 class="text-base">${esc(L(m.user?.name))}</h3><p class="text-sm muted"><bdi>${esc(m.user?.email ?? '')}</bdi></p></div>${badge(m.status, { domain: 'account' })}</div><dl class="meta-list"><div><dt>${esc(label('teamRole'))}</dt><dd>${esc(label('teamRole.' + m.team_role))}</dd></div><div><dt>${esc(label(m.status === 'invited' ? 'invitedOn' : 'memberSince'))}</dt><dd><bdi>${esc(day(m.invited_at))}</bdi></dd></div><div><dt>${esc(label('expires'))}</dt><dd><bdi>${esc(day(m.expires_at))}</bdi>${m.expired ? ` ${chip(label('expired'), 'danger', 'clock')}` : ''}</dd></div></dl>${m.status === 'active' ? `<div><p class="text-sm font-medium mb-2">${esc(label('assignedCourses'))}</p>${m.assignments.length ? `<ul class="stack">${m.assignments.map(a => `<li class="text-sm"><span class="font-medium" dir="auto">${esc(L(a.course_title))}</span><span class="flex-row mt-1">${a.capabilities.map(x => chip(label('cap.' + x), 'neutral')).join('')}</span></li>`).join('')}</ul>` : `<p class="text-sm muted">${esc(label('noAssignments'))}</p>`}</div>` : ''}<div class="flex-row border-t border-border pt-4 mt-auto">${m.status === 'active' ? button({ label: label('editAccess'), href: '#/teacher/team?tab=access', variant: 'secondary' }) : ''}${button({ label: label(m.status === 'invited' ? 'cancelInvite' : 'revoke'), action: 'overlay.open', data: { id: 'revoke-' + m.id }, variant: 'danger' })}</div></article>${revokeDialog(m)}`;
}
export const team = {
  render(ctx) {
    const d = select('teacher.team'); if (!d) return fallback('resourceDenied', ctx);
    const tab = TEAM_TABS.includes(ctx.query.get('tab')) ? ctx.query.get('tab') : 'members';
    const nav = tabs(TEAM_TABS.map(id => ({ id, label: label('team.' + id), href: url(ctx, { tab: id }), count: id === 'members' ? d.members.length : id === 'invitations' ? d.invitations.length : undefined })), tab, { label: label('teamTabs') });
    const form = formState('invite');
    const invite = modal({ id: 'invite-dialog', title: label('inviteTitle'), body: `<form class="stack" data-action="teacher.invite" novalidate>${formField({ id: 'invite-email', name: 'email', label: label('inviteEmail'), type: 'email', required: true, value: fv(form, 'email'), hint: label('inviteEmailHint'), error: fe(form, 'email') })}<div class="grid gap-4 sm:grid-cols-2">${formField({ id: 'invite-role', name: 'team_role', label: label('teamRole'), type: 'select', required: true, value: fv(form, 'team_role', 'assistant'), options: TEAM_ROLES.map(v => ({ value: v, label: label('teamRole.' + v) })), error: fe(form, 'team_role') })}${formField({ id: 'invite-days', name: 'days', label: label('inviteExpiry'), type: 'select', required: true, value: fv(form, 'days', '14'), options: INVITE_DAYS.map(v => ({ value: v, label: label('days', { count: v }) })), error: fe(form, 'days') })}</div>${notice({ message: label('inviteNote') })}<div class="flex-row">${submit('sendInvite')}</div></form>` }).replace('<dialog ', `<dialog ${reopenAttr(form, 'invite')} `);
    let body;
    if (tab === 'members') body = (d.members.length ? `<div class="grid-cards grid-three">${d.members.map(memberCard).join('')}</div>` : emptyState({ icon: 'users', title: label('noMembers'), description: label('noMembersBody') })) + (d.former.length ? `<section class="mt-8" aria-labelledby="former-title"><h2 id="former-title" class="text-lg mb-3">${esc(label('formerMembers'))}</h2><ul class="stack">${d.former.map(m => `<li class="work-row">${avatar(m.user, { size: 32 })}<span class="min-w-0 flex-1">${esc(L(m.user?.name))}</span>${badge(m.status, { domain: 'account' })}</li>`).join('')}</ul></section>` : '');
    else if (tab === 'invitations') body = d.invitations.length ? `<div class="grid-cards grid-three">${d.invitations.map(memberCard).join('')}</div>` : emptyState({ icon: 'mail', title: label('noInvitations'), action: { label: label('inviteMember'), action: 'overlay.open', data: { id: 'invite-dialog' } } });
    else body = notice({ message: label('matrixNote') }) + (d.members.length ? d.members.map(m => `<form class="panel stack mt-6" data-action="teacher.saveAccess" data-id="${esc(m.id)}" aria-labelledby="matrix-${esc(m.id)}"><div class="flex items-center gap-3 min-w-0">${avatar(m.user, { size: 40 })}<h2 id="matrix-${esc(m.id)}" class="text-lg min-w-0">${esc(L(m.user?.name))}</h2></div>${d.courses.map(c => { const caps = m.assignments.find(a => a.course_id === c.id)?.capabilities ?? []; return `<fieldset class="rounded-xl border border-border p-3" data-course-id="${esc(c.id)}"><legend class="font-medium px-1" dir="auto">${esc(L(c.title))} <span class="text-xs muted">· ${esc(t('status.course.' + c.status))}</span></legend><div class="grid gap-1 sm:grid-cols-2 lg:grid-cols-4">${TEAM_CAPABILITIES.map(cap => `<label class="flex items-center gap-2 min-h-11 cursor-pointer"><input type="checkbox" name="cap:${esc(c.id)}" value="${cap}" ${caps.includes(cap) ? 'checked' : ''} class="h-5 w-5 shrink-0"><span class="text-sm">${esc(label('cap.' + cap))}</span></label>`).join('')}</div></fieldset>`; }).join('')}<div class="save-bar"><p class="text-sm muted min-w-0">${esc(label('matrixSaveNote'))}</p>${submit('saveAccess')}</div></form>`).join('') : `<div class="mt-6">${emptyState({ icon: 'users', title: label('noMembers'), description: label('noMembersBody') })}</div>`);
    return pageHeader({ title: t('route./teacher/team'), subtitle: label('teamIntro'), actions: button({ label: label('inviteMember'), action: 'overlay.open', data: { id: 'invite-dialog' } }) }) + `<div class="mb-6">${notice({ title: label('noPayoutsTitle'), message: label('noPayouts') })}</div>` + nav + `<div class="mt-6">${body}</div>` + invite;
  },
  mount: (root, ctx) => reopen(root, ctx),
};

// ---------------------------------------------------------------- earnings
const EARN_TABS = ['sales', 'payables', 'payouts', 'destination'];
function payoutDrawer(e, id) {
  const p = e.payouts.find(x => x.id === id); if (!p) return { missing: notice({ title: label('recordMissing'), message: label('recordUnavailable'), tone: 'warning' }) };
  const steps = ['Draft', 'UnderReview', 'Approved', 'Processing', 'Paid'], at = steps.indexOf(p.batch.state);
  const body = `<div class="flex-row">${badge(p.batch.state, { domain: 'payout_batch' })}<strong class="text-xl">${omr(p.amount_baisa)}</strong></div>
    <ol class="stack">${steps.map((s, i) => `<li class="flex items-center gap-3"><span class="wizard-num ${i < at || (i === at && s === 'Paid') ? 'is-done-num' : ''}" aria-hidden="true">${i < at || (i === at && s === 'Paid') ? icon('check', { size: 14 }) : `<bdi>${i + 1}</bdi>`}</span><span class="${i === at ? 'font-semibold' : 'muted'}">${esc(t('status.payout_batch.' + s))}</span>${i === at ? `<span class="sr-only">${esc(t('current'))}</span>` : ''}</li>`).join('')}${['Failed', 'Rejected'].includes(p.batch.state) ? `<li>${badge(p.batch.state, { domain: 'payout_batch' })}</li>` : ''}</ol>
    ${p.batch.state === 'Failed' ? notice({ title: label('payoutFailedTitle'), message: label('payoutFailedBody'), tone: 'danger' }) : ''}
    <dl class="meta-list"><div><dt>${esc(label('period'))}</dt><dd>${esc(L(p.batch.period_label))}</dd></div><div><dt>${esc(label('submittedOn'))}</dt><dd>${when(p.batch.submitted_at)}</dd></div><div><dt>${esc(label('approvedOn'))}</dt><dd>${when(p.batch.approved_at)}</dd></div><div><dt>${esc(label('reference'))}</dt><dd><bdi>${esc(p.provider_ref ?? '—')}</bdi></dd></div><div><dt>${esc(label('reconciled'))}</dt><dd>${when(p.reconciled_at)}</dd></div><div><dt>${esc(label('destination'))}</dt><dd><bdi>${esc(p.batch.destination?.masked_iban ?? '—')}</bdi></dd></div></dl>
    <div><p class="text-sm font-medium">${esc(label('allocationsIncluded'))}</p><ul class="text-sm mt-1">${p.allocation_ids.length ? p.allocation_ids.map(a => `<li><bdi>${esc(a)}</bdi></li>`).join('') : `<li class="muted">${esc(label('none'))}</li>`}</ul></div>${notice({ message: label('payoutApprovalNote') })}`;
  return { drawer: drawer({ id: 'payout-record', title: label('payoutTitle', { id: p.id }), body, side: 'end' }) };
}
export const earnings = {
  render(ctx) {
    const e = select('teacher.earnings'); if (!e) return fallback('resourceDenied', ctx);
    const tab = EARN_TABS.includes(ctx.query.get('tab')) ? ctx.query.get('tab') : 'sales', l = e.ledger;
    const cards = `<div class="grid gap-4 grid-cols-1 sm:grid-cols-3 xl:grid-cols-6 mb-6">${[['gross', l.gross, 'receipt'], ['commission', l.commission, 'creditCard'], ['pending', l.pending, 'clock'], ['available', l.available, 'checkCircle'], ['reserved', l.reserved, 'lock'], ['paid', l.paid, 'banknote']].map(([k, v, i]) => statCard({ label: label('money.' + k), value: money(v), icon: i })).join('')}</div>${l.in_payout || l.recoverable ? `<div class="flex-row mb-6">${l.in_payout ? chip(label('inPayoutAmount', { amount: money(l.in_payout) }), 'info', 'refresh') : ''}${l.recoverable ? chip(label('recoverableAmount', { amount: money(l.recoverable) }), 'danger', 'flag') : ''}</div>` : ''}`;
    const nav = tabs(EARN_TABS.map(id => ({ id, label: label('earn.' + id), href: url(ctx, { tab: id, record: null }) })), tab, { label: label('earnTabs') });
    let body, record = null;
    if (tab === 'sales') {
      const sales = table([
        { key: 'created_at', label: label('date'), render: x => `<bdi>${esc(day(x.created_at))}</bdi>` },
        { key: 'item', label: label('saleItem'), render: x => `<span class="block font-medium" dir="auto">${esc(L(x.title_snapshot))}</span><span class="block text-xs muted"><bdi>${esc(x.id)}</bdi> · <bdi>${esc(x.order_id)}</bdi></span>` },
        { key: 'base', label: label('base'), align: 'end', render: x => omr(x.commission_snapshot.base_baisa) },
        { key: 'rate', label: label('rate'), align: 'end', render: x => `${pct(x.commission_snapshot.rate_bps)} <span class="text-xs muted"><bdi>${esc(x.commission_snapshot.rule_id)} v${esc(x.commission_snapshot.version)}</bdi></span>` },
        { key: 'platform', label: label('platformShare'), align: 'end', render: x => omr(x.commission_snapshot.platform_baisa) },
        { key: 'teacher', label: label('teacherShare'), align: 'end', render: x => `<strong>${omr(x.commission_snapshot.teacher_baisa)}</strong>` },
        { key: 'state', label: t('p3.status'), render: x => `<span class="flex-row">${x.allocation ? badge(x.allocation.state, { domain: 'earning' }) : ''}${badge(x.order_state, { domain: 'order' })}${x.refund ? badge(x.refund.state, { domain: 'refund' }) : ''}</span>` },
      ], e.sales, { caption: label('salesCaption'), empty: emptyState({ icon: 'receipt', title: label('noSales') }) });
      const adjustments = e.adjustments.length ? `<ul class="stack">${e.adjustments.map(a => `<li class="panel stack" style="border-inline-start:4px solid var(--accent)"><div class="flex items-start justify-between gap-3 flex-wrap"><div class="min-w-0"><p class="font-semibold">${esc(label('adjustmentTitle', { id: a.id }))}</p>${a.reason ? `<p class="text-sm muted" dir="auto">${esc(L(a.reason))}</p>` : ''}</div><strong class="text-lg">${omr(a.signed_amount_baisa)}</strong></div>${a.item && a.original ? `<div class="rounded-xl bg-sand p-3 text-sm"><p class="font-medium">${esc(label('linkedSale', { item: a.item.id }))} · <span dir="auto">${esc(L(a.item.title_snapshot))}</span></p><p class="mt-1">${esc(label('originalSnapshot'))}: ${label('snapshotLine', { base: money(a.original.snapshot.base_baisa), rate: (a.original.snapshot.rate_bps / 100).toFixed(0), teacher: money(a.original.snapshot.teacher_baisa) }).split('|').map(x => `<bdi>${esc(x)}</bdi>`).join(' · ')}</p><p class="mt-1">${esc(label('originalAllocation', { id: a.original.id }))} ${badge(a.original.state, { domain: 'earning' })}</p></div>` : ''}<p class="text-xs muted">${when(a.created_at)}</p></li>`).join('')}</ul>` : `<p class="muted">${esc(label('noAdjustments'))}</p>`;
      body = `${notice({ message: label('snapshotNote') })}<section class="panel min-w-0 mt-6">${sales}</section><section class="mt-8 stack" aria-labelledby="adj-title"><h2 id="adj-title" class="text-xl">${esc(label('adjustments'))}</h2><p class="text-sm muted">${esc(label('adjustmentsNote'))}</p>${adjustments}</section>`;
    } else if (tab === 'payables') {
      const states = ['pending', 'available', 'reserved', 'in_payout', 'paid'];
      const rows = states.map(k => ({ id: k, ledger: l[k], allocations: e.byState[k] }));
      const summary = table([{ key: 'id', label: label('earningState'), render: r => badge(r.id, { domain: 'earning' }) }, { key: 'ledger', label: label('ledgerBalance'), align: 'end', render: r => omr(r.ledger) }, { key: 'allocations', label: label('allocationTotal'), align: 'end', render: r => omr(r.allocations) }, { key: 'match', label: label('reconciliation'), render: r => r.ledger === r.allocations ? chip(label('matches'), 'success', 'check') : chip(label('mismatch'), 'danger', 'x') }, { key: 'help', label: label('meaning'), render: r => `<span class="text-sm">${esc(label('stateHelp.' + r.id))}</span>` }], rows, { caption: label('payablesCaption') });
      const allocations = table([{ key: 'id', label: label('allocation'), render: a => `<bdi class="font-medium">${esc(a.id)}</bdi><span class="block text-xs muted"><bdi>${esc(a.order_item_id)}</bdi></span>` }, { key: 'amount', label: label('amount'), align: 'end', render: a => omr(a.amount_baisa) }, { key: 'state', label: t('p3.status'), render: a => badge(a.state, { domain: 'earning' }) }, { key: 'eligible', label: label('eligibleOn'), render: a => `<bdi>${esc(day(a.eligible_at))}</bdi>` }, { key: 'hold', label: label('note'), render: a => `<span class="text-sm">${esc(holdText(a.hold_reason) || (a.original_allocation_id ? label('linkedTo', { id: a.original_allocation_id }) : '—'))}</span>` }], e.allocations, { caption: label('allocationsCaption'), empty: `<p class="muted">${esc(label('noAllocations'))}</p>` });
      body = `${notice({ message: label('payablesNote', { entries: l.entries, journals: l.journals }) })}<section class="panel min-w-0 mt-6">${summary}</section><section class="panel min-w-0 mt-6">${allocations}</section>`;
    } else if (tab === 'payouts') {
      record = ctx.query.get('record') ? payoutDrawer(e, ctx.query.get('record')) : null;
      body = (record?.missing ? `<div class="mb-6">${record.missing}</div>` : '') + notice({ message: label('payoutsNote') }) + `<section class="panel min-w-0 mt-6">${table([{ key: 'id', label: label('payout'), render: p => `<bdi class="font-medium">${esc(p.id)}</bdi><span class="block text-xs muted">${esc(L(p.batch.period_label))}</span>` }, { key: 'amount', label: label('amount'), align: 'end', render: p => omr(p.amount_baisa) }, { key: 'state', label: t('p3.status'), render: p => badge(p.batch.state, { domain: 'payout_batch' }) }, { key: 'ref', label: label('reference'), render: p => `<bdi>${esc(p.provider_ref ?? '—')}</bdi>` }], e.payouts, { caption: label('payoutsCaption'), actions: p => button({ label: label('details'), href: url(ctx, { record: p.id }), variant: 'ghost' }), empty: emptyState({ icon: 'banknote', title: label('noPayouts2') }) })}</section>`;
    } else {
      const a = e.account, form = formState('payout-change'), cr = a?.change_request;
      body = !a ? emptyState({ icon: 'banknote', title: label('noAccount') }) : `<div class="grid gap-6 lg:grid-cols-2"><section class="panel stack" aria-labelledby="dest-title"><h2 id="dest-title" class="text-lg">${esc(label('verifiedDestination'))}</h2><dl class="meta-list"><div><dt>${esc(label('beneficiary'))}</dt><dd>${esc(L(a.beneficiary_name))}</dd></div><div><dt>${esc(label('account'))}</dt><dd><bdi dir="ltr">${esc(a.masked_iban)}</bdi></dd></div><div><dt>${esc(t('p3.status'))}</dt><dd>${a.verification_state === 'verified' ? chip(label('verifiedDest'), 'success', 'checkCircle') : chip(label('unverifiedDest'), 'warning', 'clock')}</dd></div><div><dt>${esc(label('changedOn'))}</dt><dd><bdi>${esc(day(a.changed_at))}</bdi></dd></div></dl>${notice({ message: label('maskedNote') })}</section>
        <section class="panel stack" aria-labelledby="change-title"><h2 id="change-title" class="text-lg">${esc(label('changeRequest'))}</h2>${cr ? `${notice({ title: label('changePendingTitle'), message: label('changePending', { date: day(cr.requested_at) }), tone: 'warning' })}<dl class="meta-list"><div><dt>${esc(label('beneficiary'))}</dt><dd>${esc(L(cr.beneficiary_name))}</dd></div><div><dt>${esc(label('account'))}</dt><dd><bdi dir="ltr">${esc(cr.masked_iban)}</bdi></dd></div></dl>` : `<p class="text-sm muted">${esc(label('changeIntro'))}</p><form class="stack" data-action="teacher.requestPayoutChange" novalidate>${formField({ id: 'pc-name', name: 'beneficiaryName', label: label('beneficiary'), required: true, value: fv(form, 'beneficiaryName'), error: fe(form, 'beneficiaryName') })}${formField({ id: 'pc-ref', name: 'accountRef', label: label('accountRef'), required: true, value: fv(form, 'accountRef'), hint: label('accountRefHint'), error: fe(form, 'accountRef') }).replace('type="text"', 'type="text" inputmode="numeric" maxlength="4" dir="ltr"')}${formField({ id: 'pc-consent', name: 'consent', label: label('changeConsent'), type: 'checkbox', value: false, required: true, error: fe(form, 'consent') })}<div class="flex-row">${submit('sendRequest')}</div></form>`}</section></div>`;
    }
    return pageHeader({ title: t('route./teacher/earnings'), subtitle: label('earningsIntro') }) + cards + nav + `<div class="mt-6">${body}</div>` + (record?.drawer ?? '');
  },
  mount(root, ctx) { return recordDrawer(root, ctx, 'payout-record'); },
};

// ---------------------------------------------------------------- notifications
export const notifications = {
  render(ctx) {
    const filter = ctx.query.get('filter') === 'unread' ? 'unread' : 'all', all = [...select('notifications')].sort((a, b) => b.created_at.localeCompare(a.created_at)), unread = all.filter(n => !n.read_at), rows = filter === 'unread' ? unread : all;
    const nav = tabs([{ id: 'all', label: t('p4.filterAll'), href: url(ctx, { filter: null }), count: all.length }, { id: 'unread', label: t('p4.filterUnread'), href: url(ctx, { filter: 'unread' }), count: unread.length }], filter, { label: t('p4.notificationFilter') });
    const list = rows.length ? `<ul class="stack mt-6">${rows.map(n => `<li class="panel notification-row ${n.read_at ? '' : 'is-unread'}"><span class="dot ${n.read_at ? 'dot-read' : ''}" aria-hidden="true"></span><div class="min-w-0 flex-1"><div class="flex items-start justify-between gap-3 flex-wrap"><h2 class="text-base">${esc(L(n.title))}</h2><span class="text-xs muted">${when(n.created_at)}</span></div><p class="text-sm muted mt-1">${esc(L(n.body))}</p><div class="flex-row mt-3">${n.read_at ? chip(t('status.delivery.read'), 'neutral', 'check') : chip(t('p4.unreadChip'), 'warning', 'bell')}${safeHash(n.href) ? button({ label: t('p4.openNotice'), href: n.href, variant: 'secondary' }) : ''}${n.read_at ? '' : `<button type="button" class="btn btn-ghost" data-action="teacher.markRead" data-id="${esc(n.id)}">${esc(t('p4.markRead'))}</button>`}</div></div></li>`).join('')}</ul>` : `<div class="mt-6">${emptyState({ icon: 'bell', title: t(filter === 'unread' ? 'p4.noUnread' : 'p4.noNotifications') })}</div>`;
    return pageHeader({ title: t('route./teacher/notifications'), subtitle: label('notificationsIntro'), actions: button({ label: t('p4.markAllRead'), action: 'teacher.markAllRead', variant: 'secondary', disabled: !unread.length, disabledReason: t('p4.noUnread') }) }) + nav + list;
  },
};

// ---------------------------------------------------------------- settings
const SETTINGS_TABS = ['profile', 'qualifications', 'account', 'notifications'];
export const settings = {
  render(ctx) {
    const s = select('teacher.settings'); if (!s) return fallback('resourceDenied', ctx);
    const tab = SETTINGS_TABS.includes(ctx.query.get('tab')) ? ctx.query.get('tab') : 'profile', prefs = select('preferences');
    const nav = tabs(SETTINGS_TABS.map(id => ({ id, label: label('settings.' + id), href: url(ctx, { tab: id }) })), tab, { label: label('settingsTabs') });
    let body;
    if (tab === 'profile') {
      const form = formState('profile');
      body = `<section class="panel flex flex-col sm:flex-row sm:items-center gap-4">${avatar(s.teacher, { size: 72 })}<div class="min-w-0 flex-1"><h2 class="text-xl">${esc(L(s.teacher.name))}</h2><div class="flex-row mt-1">${badge(s.teacher.application_status, { domain: 'teacher_application' })}${s.teacher.credentials.filter(c => c.verified).map(c => chip(L(c.label), 'success', 'checkCircle')).join('')}</div><p class="text-sm muted mt-2 clamp-3" dir="auto">${esc(L(s.teacher.bio))}</p></div>${button({ label: label('viewPublic'), href: '#/teacher/' + enc(s.teacher.id), variant: 'secondary' })}</section>
        <form class="panel stack" data-action="teacher.saveProfile" novalidate><h2 class="text-lg">${esc(label('bioTitle'))}</h2><p class="text-sm muted">${esc(label('bioIntro'))}</p>${['ar', 'en'].map(lg => dirField(formField({ id: 'bio-' + lg, name: 'bio_' + lg, label: label('field.bio.' + lg), type: 'textarea', rows: 4, required: true, value: fv(form, 'bio_' + lg, s.teacher.bio[lg]), error: fe(form, 'bio_' + lg) }), lg === 'ar' ? 'rtl' : 'ltr')).join('')}<div class="flex-row">${submit('saveProfile')}${button({ label: label('viewPublic'), href: '#/teacher/' + enc(s.teacher.id), variant: 'ghost' })}</div></form>`;
    } else if (tab === 'qualifications') {
      const form = formState('qualification');
      body = `<section class="panel stack"><h2 class="text-lg">${esc(label('verifiedQualifications'))}</h2><p class="text-sm muted">${esc(label('qualificationsIntro'))}</p><ul class="flex flex-wrap gap-2" aria-label="${esc(label('verifiedQualifications'))}">${s.verified.map(p => `<li>${chip(pairName(p), 'success', 'checkCircle')}</li>`).join('')}</ul></section>
        <section class="panel stack"><h2 class="text-lg">${esc(label('pendingQualifications'))}</h2>${s.pending.length ? `<ul class="flex flex-wrap gap-2">${s.pending.map(p => `<li>${chip(`${pairName(p)} · ${label('pendingVerification')}`, 'warning', 'clock')}</li>`).join('')}</ul>` : `<p class="muted text-sm">${esc(label('noPendingQualifications'))}</p>`}</section>
        <form class="panel stack" data-action="teacher.requestQualification" novalidate><h2 class="text-lg">${esc(label('requestQualification'))}</h2>${formField({ id: 'qual-pair', name: 'gradeSubjectId', label: label('field.grade_subject_id'), type: 'select', required: true, value: fv(form, 'gradeSubjectId'), options: [{ value: '', label: label('choosePair') }, ...s.requestable.map(p => ({ value: p.id, label: pairName(p) }))], error: fe(form, 'gradeSubjectId') })}${formField({ id: 'qual-note', name: 'note', label: label('qualificationNote'), type: 'textarea', rows: 2, value: fv(form, 'note'), hint: label('qualificationNoteHint') })}${notice({ message: label('qualificationReview') })}<div class="flex-row">${submit('sendRequest')}</div></form>`;
    } else if (tab === 'account') {
      body = `<section class="panel stack"><h2 class="text-lg">${esc(t('p4.accountInfo'))}</h2><dl class="meta-list"><div><dt>${esc(t('p2.name'))}</dt><dd>${esc(L(s.teacher.name))}</dd></div><div><dt>${esc(t('p2.email'))}</dt><dd><bdi>${esc(s.user?.email ?? '')}</bdi></dd></div><div><dt>${esc(label('accountStatus'))}</dt><dd>${badge(s.teacher.account_status, { domain: 'account' })}</dd></div><div><dt>${esc(label('applicationStatus'))}</dt><dd>${badge(s.teacher.application_status, { domain: 'teacher_application' })}</dd></div></dl>${notice({ message: t('p4.passwordNote') })}</section>
        <section class="panel stack"><h2 class="text-lg">${esc(t('p4.displayPrefs'))}</h2><p class="font-medium">${esc(t('language'))}</p><div class="flex gap-2">${choiceButtons('lang', 'ar', 'العربية', prefs)}${choiceButtons('lang', 'en', 'English', prefs)}</div><p class="font-medium">${esc(t('theme'))}</p><div class="flex gap-2">${choiceButtons('theme', 'light', t('light'), prefs)}${choiceButtons('theme', 'dark', t('dark'), prefs)}</div></section>`;
    } else body = `<form class="panel stack" data-action="teacher.savePrefs"><h2 class="text-lg">${esc(t('p4.notifyPrefs'))}</h2><p class="text-sm muted">${esc(t('p4.notifyNote'))}</p>${TEACHER_PREFS.map(k => formField({ id: 'tpref-' + k, name: k, label: label('pref.' + k), type: 'checkbox', value: s.prefs[k] })).join('')}<div class="flex-row">${submit('savePrefs')}</div></form>`;
    return pageHeader({ title: t('route./teacher/settings'), subtitle: label('settingsIntro') }) + nav + `<div class="stack max-w-3xl mt-6">${body}</div>`;
  },
};

// ---------------------------------------------------------------- overlay helpers
// A dialog whose form failed validation reopens after the rerender; closing it discards that stale form state.
// Listeners are removed before the router disposes overlays, so route changes never trigger extra dispatches.
function reopen(root, ctx) {
  const d = root.querySelector('dialog[data-reopen]'); if (!d) return () => {};
  openOverlay(d.id);
  const clear = () => ctx.dispatch('teacher.clearForm', { name: d.dataset.reopen });
  d.addEventListener('close', clear);
  return () => d.removeEventListener('close', clear);
}
// ?record= detail drawers open on mount; closing them returns to the list URL.
function recordDrawer(root, ctx, id) {
  const dialog = root.querySelector('#' + id); if (!dialog) return () => {};
  openOverlay(id);
  const onClose = () => ctx.navigate(url(ctx, { record: null }));
  dialog.addEventListener('close', onClose);
  return () => dialog.removeEventListener('close', onClose);
}

// ---------------------------------------------------------------- actions
function report(r, okKey, params) { showToast(r.ok ? label(okKey, params) : t(Object.values(r.fieldErrors ?? {})[0] ?? r.errorKey), { tone: r.ok ? 'success' : 'error' }); return r.ok; }
const strings = fd => Object.fromEntries([...fd.entries()].filter(([, v]) => typeof v === 'string'));
// Dispatch a form-backed action; on failure keep typed values and field errors in transient form state.
function formAction(ctx, name, type, payload, okKey, values) {
  const r = ctx.dispatch(type, payload);
  if (!r.ok) { if (Object.keys(r.fieldErrors ?? {}).length) ctx.dispatch('teacher.saveForm', { name, values, fieldErrors: r.fieldErrors }); showToast(t(Object.values(r.fieldErrors ?? {})[0] ?? r.errorKey), { tone: 'error' }); return r; }
  ctx.dispatch('teacher.clearForm', { name }); if (okKey) showToast(label(okKey), { tone: 'success' }); return r;
}
const onSubmit = fn => (event, el, ctx) => { if (event.type !== 'submit') return; fn(event, el, ctx, new FormData(el)); };
export function registerActions(register) {
  register('teacher', {
    saveStep: onSubmit((event, el, ctx, fd) => {
      const step = el.dataset.step, id = el.dataset.id || null, intent = event.submitter?.value === 'next' ? 'next' : 'save', values = strings(fd);
      const name = `wizard:${id ?? 'new'}:${step}`, r = formAction(ctx, name, 'course.saveDraft', { courseId: id, step, values }, id ? 'saved' : null, values);
      if (!r.ok) return;
      if (r.data.created) { showToast(label('created', { id: r.data.id }), { tone: 'success' }); ctx.navigate(editLink(r.data.id, intent === 'next' ? 'content' : step)); return; }
      if (!id) { showToast(label('draftStep'), { tone: 'success' }); ctx.navigate(editLink(null, r.data.next)); return; }
      if (intent === 'next') ctx.navigate(editLink(id, COURSE_STEPS[COURSE_STEPS.indexOf(step) + 1]));
    }),
    submitCourse: (_e, el, ctx) => report(ctx.dispatch('course.submit', { courseId: el.dataset.id }), 'submitted'),
    requestRevision: (_e, el, ctx) => { if (report(ctx.dispatch('course.requestRevision', { courseId: el.dataset.id }), 'revisionStarted')) ctx.navigate(editLink(el.dataset.id)); },
    requestUnpublish: onSubmit((_e, el, ctx, fd) => { if (formAction(ctx, 'unpublish:' + el.dataset.id, 'course.requestUnpublish', { courseId: el.dataset.id, reason: fd.get('reason') }, 'unpublishSent', strings(fd)).ok) closeOverlay('unpublish-dialog'); }),
    addModule: onSubmit((_e, el, ctx, fd) => formAction(ctx, 'module-add:' + el.dataset.courseId, 'module.add', { courseId: el.dataset.courseId, ...strings(fd) }, 'moduleAdded', strings(fd))),
    addLesson: onSubmit((_e, el, ctx, fd) => formAction(ctx, 'lesson-add:' + el.dataset.id, 'lesson.add', { courseId: el.dataset.courseId, moduleId: el.dataset.id, ...strings(fd), preview: fd.get('preview') === 'on' }, 'lessonAdded', { ...strings(fd), preview: fd.get('preview') === 'on' ? 'on' : 'off' })),
    updateLesson: onSubmit((_e, el, ctx, fd) => {
      const values = strings(fd), payload = { lessonId: el.dataset.id, ...values };
      if (el.querySelector('[name="preview"]')) payload.preview = fd.get('preview') === 'on';
      if (formAction(ctx, 'lesson:' + el.dataset.id, 'lesson.update', payload, 'lessonSaved', { ...values, preview: fd.get('preview') === 'on' ? 'on' : 'off' }).ok) ctx.navigate(url(ctx, { lesson: null }));
    }),
    moveLesson: (_e, el, ctx) => { const r = ctx.dispatch('lesson.move', { lessonId: el.dataset.id, direction: el.dataset.value }); if (!r.ok) showToast(t(r.errorKey), { tone: 'error' }); },
    togglePreview: (_e, el, ctx) => report(ctx.dispatch('lesson.update', { lessonId: el.dataset.id, preview: el.getAttribute('aria-pressed') !== 'true' }), 'previewUpdated'),
    createQuiz: onSubmit((_e, el, ctx, fd) => {
      const v = strings(fd), questions = [0, 1].map(n => ({ prompt: v[`q${n}_prompt`] ?? '', choices: [0, 1, 2].map(c => v[`q${n}_c${c}`] ?? ''), correct: v[`q${n}_correct`] ?? '' }));
      formAction(ctx, 'quiz-create:' + el.dataset.courseId, 'quiz.create', { courseId: el.dataset.courseId, title: v.title, moduleId: v.moduleId, pass_score: v.pass_score, questions }, 'quizCreated', v);
    }),
    updateQuiz: onSubmit((_e, el, ctx, fd) => { if (formAction(ctx, 'quiz:' + el.dataset.id, 'quiz.update', { quizId: el.dataset.id, ...strings(fd) }, 'saved', strings(fd)).ok) ctx.navigate(url(ctx, { item: null })); }),
    createAssignment: onSubmit((_e, el, ctx, fd) => formAction(ctx, 'assignment-create:' + el.dataset.courseId, 'assignment.create', { courseId: el.dataset.courseId, ...strings(fd) }, 'assignmentCreated', strings(fd))),
    updateAssignment: onSubmit((_e, el, ctx, fd) => { if (formAction(ctx, 'assignment:' + el.dataset.id, 'assignment.update', { assignmentId: el.dataset.id, ...strings(fd) }, 'saved', strings(fd)).ok) ctx.navigate(url(ctx, { item: null })); }),
    addResource: onSubmit((_e, el, ctx, fd) => formAction(ctx, 'resource-add:' + ctx.params.id, 'resource.add', strings(fd), 'resourceAdded', strings(fd))),
    updateResource: onSubmit((_e, el, ctx, fd) => formAction(ctx, 'resource:' + el.dataset.id, 'resource.update', { resourceId: el.dataset.id, ...strings(fd) }, 'saved', strings(fd))),
    grade: onSubmit((_e, el, ctx, fd) => formAction(ctx, 'grade:' + el.dataset.id, 'submission.grade', { submissionId: el.dataset.id, ...strings(fd) }, 'graded', strings(fd))),
    release: (_e, el, ctx) => report(ctx.dispatch('submission.release', { submissionId: el.dataset.id }), 'released'),
    schedule: onSubmit((_e, el, ctx, fd) => {
      const v = strings(fd), courseId = el.dataset.courseId ?? v.courseId, name = el.dataset.courseId ? 'schedule:' + courseId : 'schedule:calendar';
      if (!courseId) { ctx.dispatch('teacher.saveForm', { name, values: v, fieldErrors: { courseId: 'error.required' } }); showToast(t('error.required'), { tone: 'error' }); return; }
      if (formAction(ctx, name, 'live.schedule', { courseId, ...v }, 'scheduled', v).ok) closeOverlay('schedule-dialog');
    }),
    reschedule: onSubmit((_e, el, ctx, fd) => { if (formAction(ctx, 'move:' + el.dataset.id, 'live.reschedule', { sessionId: el.dataset.id, starts_at: fd.get('starts_at') }, 'rescheduled', strings(fd)).ok) closeOverlay('move-' + el.dataset.id); }),
    cancelSession: (_e, el, ctx) => { if (report(ctx.dispatch('live.cancel', { sessionId: el.dataset.id }), 'sessionCancelled')) closeOverlay('cancel-' + el.dataset.id); },
    uploadRecording: onSubmit((_e, el, ctx, fd) => formAction(ctx, 'upload:' + el.dataset.id, 'recording.upload', { sessionId: el.dataset.id, filename: fd.get('filename') }, 'uploaded', strings(fd))),
    completeRecording: (_e, el, ctx) => report(ctx.dispatch('recording.complete', { recordingId: el.dataset.id }), 'recordingReady'),
    publishRecording: (_e, el, ctx) => { const r = ctx.dispatch('recording.publish', { recordingId: el.dataset.id }); report(r, r.data?.existing ? 'alreadyPublished' : 'recordingPublished'); },
    announce: onSubmit((_e, el, ctx, fd) => formAction(ctx, 'announce:' + el.dataset.courseId, 'announcement.post', { courseId: el.dataset.courseId, ...strings(fd) }, 'announced', strings(fd))),
    assign: onSubmit((_e, el, ctx, fd) => report(ctx.dispatch('conversation.assign', { conversationId: el.dataset.id, assigneeUserId: fd.get('assignee') }), 'assigned')),
    reply: onSubmit((_e, el, ctx, fd) => formAction(ctx, 'reply:' + ctx.params.id, 'conversation.reply', { conversationId: ctx.params.id, text: fd.get('text') }, 'replySent', strings(fd))),
    note: onSubmit((_e, el, ctx, fd) => formAction(ctx, 'note:' + ctx.params.id, 'conversation.note', { conversationId: ctx.params.id, text: fd.get('text') }, 'noteAdded', strings(fd))),
    setStatus: (_e, el, ctx) => report(ctx.dispatch('conversation.setStatus', { conversationId: el.dataset.id, status: el.dataset.value }), 'statusChanged'),
    reportOpen: (_e, el) => { const dialog = document.getElementById('report-dialog'); if (!dialog) return; dialog.querySelector('form').reset(); dialog.querySelector('input[name="messageId"]').value = el.dataset.id ?? ''; openOverlay('report-dialog'); },
    report: onSubmit((_e, el, ctx, fd) => { const r = ctx.dispatch('conversation.report', { conversationId: ctx.params.id, messageId: fd.get('messageId') || null, reason: fd.get('reason') }); if (r.ok) closeOverlay('report-dialog'); report(r, r.data?.existing ? 'alreadyReported' : 'reportSent'); }),
    invite: onSubmit((_e, el, ctx, fd) => { if (formAction(ctx, 'invite', 'team.invite', strings(fd), 'invited', strings(fd)).ok) { closeOverlay('invite-dialog'); ctx.navigate('#/teacher/team?tab=invitations'); } }),
    saveAccess: onSubmit((_e, el, ctx, fd) => report(ctx.dispatch('team.assign', { memberId: el.dataset.id, assignments: Object.fromEntries([...el.querySelectorAll('fieldset[data-course-id]')].map(f => [f.dataset.courseId, fd.getAll('cap:' + f.dataset.courseId)])) }), 'accessSaved')),
    revokeMember: (_e, el, ctx) => { if (report(ctx.dispatch('team.revoke', { memberId: el.dataset.id }), 'memberRevoked')) closeOverlay('revoke-' + el.dataset.id); },
    requestPayoutChange: onSubmit((_e, el, ctx, fd) => formAction(ctx, 'payout-change', 'payoutAccount.requestChange', { beneficiaryName: fd.get('beneficiaryName'), accountRef: fd.get('accountRef'), consent: fd.get('consent') }, 'changeRequested', { beneficiaryName: String(fd.get('beneficiaryName') ?? ''), accountRef: String(fd.get('accountRef') ?? '') })),
    saveProfile: onSubmit((_e, el, ctx, fd) => formAction(ctx, 'profile', 'teacher.updateProfile', strings(fd), 'profileSaved', strings(fd))),
    requestQualification: onSubmit((_e, el, ctx, fd) => formAction(ctx, 'qualification', 'qualification.request', strings(fd), 'qualificationRequested', strings(fd))),
    savePrefs: onSubmit((_e, el, ctx, fd) => report(ctx.dispatch('teacher.updateSettings', { prefs: Object.fromEntries(TEACHER_PREFS.map(k => [k, fd.get(k) === 'on'])) }), 'prefsSaved')),
    filterStudents: onSubmit((_e, el, ctx, fd) => ctx.navigate('#/teacher/students' + qs({ course: fd.get('course') }))),
    markRead: (_e, el, ctx) => ctx.dispatch('notifications.markRead', { id: el.dataset.id }),
    markAllRead: (_e, _el, ctx) => report(ctx.dispatch('notifications.markAllRead', {}), 'allRead'),
  });
}
// Shared staff-workspace helpers reused by the assistant portal (views/assistant.js) for the same look and form flow.
export { chip, when, day, url, sectionTitle, submit, formState, fe, fv, hasErrors, safeHash, auditLabel, choiceButtons, formAction, onSubmit, strings };
