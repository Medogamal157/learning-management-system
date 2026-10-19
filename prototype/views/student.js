import { t, L, esc, dateTime } from '../core/i18n.js';
import { select, STUDENT_PREFS } from '../core/store.js';
import { pageHeader, statCard, badge, tabs, table, emptyState, notice, button, avatar, formField, progressBar, progressRing, modal, drawer, simulatedPlayer, togglePlayer, toggleCaptions, mountPlayer, showToast, openOverlay, closeOverlay } from '../core/ui.js';
import { icon } from '../core/icons.js';
import { courseCover } from '../core/media.js';
import { mountCharts } from '../core/charts.js';
import { fallback } from '../core/layout.js';
import { DEMO_NOW } from '../core/data.js';
import { results } from './public.js';

// Student portal (SPEC §5 Student). Every view reads scoped `student.*` selectors that resolve the
// acting persona; protected lesson content renders only from an active-grant learning room.
const label = (key, params) => t('p4.' + key, params);
const enc = encodeURIComponent;
const roomLink = (id, query = {}) => { const q = new URLSearchParams(Object.entries(query).filter(([, v]) => v != null && v !== '')); return '#/student/course/' + enc(id) + (q.size ? '?' + q : ''); };
function url(ctx, changes = {}, path = ctx.path) { const q = new URLSearchParams(ctx.query); for (const [k, v] of Object.entries(changes)) { if (v == null || v === '') q.delete(k); else q.set(k, v); } return '#' + path + (q.size ? '?' + q : ''); }
const lang = () => select('preferences').lang;
const fmt = (iso, opts) => new Intl.DateTimeFormat(lang() === 'ar' ? 'ar-OM' : 'en-OM', { timeZone: 'Asia/Muscat', ...opts }).format(new Date(iso));
const day = iso => fmt(iso, { dateStyle: 'medium' });
const clock = iso => fmt(iso, { timeStyle: 'short' });
const when = iso => `<bdi>${esc(dateTime(iso))}</bdi>`;
const span = (start, end) => `<bdi>${esc(dateTime(start))} – ${esc(clock(end))}</bdi> <span class="muted">${esc(label('muscat'))}</span>`;
const mmss = seconds => `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, '0')}`;
const minutes = seconds => t('duration', { count: Math.max(1, Math.round(seconds / 60)) });
const safeHash = href => typeof href === 'string' && /^#\/[\w\-/?=&.]*$/.test(href);
const TYPE_ICONS = { video: 'play', reading: 'book', quiz: 'clipboard', assignment: 'edit' };
const sectionTitle = (id, title, extra = '') => `<div class="flex items-center justify-between gap-3 flex-wrap mb-4"><h2 id="${id}" class="text-xl">${esc(title)}</h2>${extra}</div>`;
const chip = (text, tone = 'neutral', iconName = null) => `<span class="chip text-sm tone-${tone}">${iconName ? icon(iconName, { size: 14 }) : ''}<span>${esc(text)}</span></span>`;
const denied = (status, ctx) => fallback(status === 'missing' ? 'missing' : 'resourceDenied', ctx);
const submit = (key, variant = 'primary') => `<button type="submit" class="btn btn-${variant}">${esc(label(key))}</button>`;
const nameOf = person => L(person?.name) || label('unknownPerson');

// ---------------------------------------------------------------- shared pieces
function courseThumb(course, size = 'h-16 w-24') { return `<img class="${size} rounded-xl object-cover shrink-0" src="${courseCover(course.id, course.subject?.id ?? 'math')}" alt="">`; }
function accessBadge(access) { return badge(access.state === 'none' ? 'expired' : access.state, { domain: 'access' }); }
function recovery(row) {
  const { access, course, purchasable } = row, free = course.price_type === 'free';
  const support = button({ label: label('contactSupport'), href: '#/help?tab=contact', variant: access.state === 'revoked' || !purchasable ? 'primary' : 'secondary' });
  if (!access.grant) return { message: label('lockedBody'), actions: purchasable ? button({ label: label(free ? 'enrollNow' : 'buyNow'), href: '#/course/' + enc(course.id) }) : support };
  if (access.state === 'revoked') return { message: label('revokedBody'), actions: support + (purchasable ? button({ label: label('viewCourse'), href: '#/course/' + enc(course.id), variant: 'ghost' }) : '') };
  if (!purchasable) return { message: label('expiredClosedBody', { date: day(access.grant.ends_at) }), actions: support };
  return { message: label('expiredBody', { date: day(access.grant.ends_at) }), actions: button({ label: label(free ? 'enrollAgain' : 'buyAgain'), href: '#/course/' + enc(course.id) }) + support };
}
function progressCard(row) {
  const c = row.course, active = row.access.state === 'active', href = roomLink(c.id, active && row.next ? { tab: 'lessons', lesson: row.next.id } : {});
  const rec = active ? null : recovery(row);
  const cta = active ? button({ label: label(row.percent === 100 ? 'review' : row.done ? 'continue' : 'start'), href }) : rec.actions;
  return `<article class="panel course-card flex flex-col min-w-0">
  <div class="relative">${active ? `<a href="${esc(href)}" tabindex="-1" aria-hidden="true">` : ''}<img class="cover ${active ? '' : 'grayscale opacity-70'}" src="${courseCover(c.id, c.subject?.id)}" alt="">${active ? '</a>' : ''}<span class="cover-tag">${icon(active ? 'book' : 'lock', { size: 14 })}${esc(t('mode.' + c.mode))}</span></div>
  <div class="p-4 flex flex-col flex-1 min-w-0 gap-3">
    <p class="text-xs font-semibold text-primary">${esc(L(c.grade?.name))} · ${esc(L(c.subject?.name))}</p>
    <h3 class="text-base">${active ? `<a href="${esc(href)}">${esc(L(c.title))}</a>` : esc(L(c.title))}</h3>
    <p class="text-sm muted">${esc(L(c.teacher?.name))}</p>
    <div class="flex-row">${accessBadge(row.access)}${row.status === 'Archived' && active ? chip(label('archivedValid', { date: day(row.access.grant.ends_at) }), 'info', 'clock') : ''}</div>
    ${active ? `${progressBar(row.percent, { label: label('lessonsDone', { done: row.done, total: row.total }) })}${row.next ? `<p class="text-sm muted">${esc(label('nextUp'))}: <span class="text-ink">${esc(L(row.next.title))}</span></p>` : `<p class="text-sm text-primary font-medium">${esc(label('allDone'))}</p>`}` : `<p class="text-sm">${esc(rec.message)}</p>`}
    <div class="flex-row mt-auto pt-2">${cta}</div>
  </div></article>`;
}
function reportDialog() {
  return modal({ id: 'report-dialog', title: label('reportTitle'), body: `<form class="stack" data-action="student.report"><input type="hidden" name="messageId" value="">${formField({ id: 'report-reason', name: 'reason', label: label('reportReason'), type: 'radio', value: '', required: true, options: ['unsafe', 'inappropriate', 'privacy', 'other'].map(value => ({ value, label: label('reason.' + value) })) })}<p class="text-sm muted">${esc(label('reportNote'))}</p><button type="submit" class="btn btn-danger">${esc(label('reportSubmit'))}</button></form>` });
}
function messageItem(m, reported) {
  const who = m.own ? label('you') : m.author_role === 'classmate' ? label('classmate') : `${nameOf({ name: m.author_name })} · ${label('author.' + m.author_role)}`;
  const report = m.own ? '' : reported.has(m.id) ? chip(label('reported'), 'warning', 'flag') : `<button type="button" class="btn btn-ghost text-sm min-h-11" data-action="student.reportOpen" data-id="${esc(m.id)}">${icon('flag', { size: 16 })}<span>${esc(label('report'))}</span></button>`;
  return `<li class="msg ${m.own ? 'msg-own' : ''}"><div class="flex items-center justify-between gap-3 flex-wrap"><span class="flex items-center gap-2 min-w-0">${avatar({ id: m.own ? 'self' : m.author_role, name: { ar: who, en: who } }, { size: 28 })}<strong class="text-sm">${esc(who)}</strong></span><span class="text-xs muted">${when(m.created_at)}</span></div><p class="mt-2 whitespace-pre-line" dir="auto">${esc(m.text)}</p><div class="flex-row mt-1">${m.flagged ? chip(label('underReview'), 'warning', 'shield') : ''}${report}</div></li>`;
}

// ---------------------------------------------------------------- dashboard
export const dashboard = {
  render(ctx) {
    const d = select('student.dashboard'); if (!d) return fallback('resourceDenied', ctx);
    const first = L(d.student.name).split(' ')[0];
    const resume = d.resume ? (() => {
      const { lesson, progress, row } = d.resume, c = row.course, pct = progress && lesson.duration_seconds ? Math.round(progress.position_seconds * 100 / lesson.duration_seconds) : 0;
      return `<section class="panel resume-card" aria-labelledby="resume-title"><div class="flex flex-col sm:flex-row gap-5 min-w-0">${courseThumb(c, 'w-full sm:w-48 aspect-[16/10] h-auto')}<div class="flex-1 min-w-0 stack"><p class="eyebrow">${esc(label('continueLearning'))}</p><h2 id="resume-title" class="text-xl">${esc(L(lesson.title))}</h2><p class="muted text-sm">${esc(L(c.title))} · ${esc(label('type.' + lesson.type))} · ${esc(minutes(lesson.duration_seconds))}</p>${progressBar(row.percent, { label: label('courseProgress') })}${lesson.type === 'video' && progress?.position_seconds ? `<p class="text-sm muted">${esc(label('resumeAt', { time: mmss(progress.position_seconds), percent: pct }))}</p>` : ''}<div class="flex-row">${button({ label: label(progress ? 'resume' : 'start'), href: roomLink(c.id, { tab: 'lessons', lesson: lesson.id }) })}${button({ label: label('openRoom'), href: roomLink(c.id), variant: 'ghost' })}</div></div></div></section>`;
    })() : emptyState({ icon: 'book', title: label('noActive'), description: label('noActiveBody'), action: { label: label('browse'), href: '#/student/explore' } });
    const weeks = d.weeks.map(w => ({ ...w, label: fmt(w.end, { day: 'numeric', month: 'short' }) }));
    const chart = `<figure class="panel min-w-0" aria-labelledby="activity-title"><p class="eyebrow">${esc(label('activityEyebrow'))}</p><h2 id="activity-title" class="text-xl mt-1">${esc(label('activity'))}</h2><p class="muted text-sm mt-1">${esc(label('activitySub'))}</p><div class="chart-box mt-4"><canvas data-chart="activity" role="img" aria-label="${esc(label('activitySub'))}" aria-describedby="activity-summary"></canvas></div><figcaption class="mt-4"><p class="sr-only">${esc(label('chartFallback'))}</p><ul id="activity-summary" class="cycle-summary">${weeks.map(w => `<li><span class="flex-1 min-w-0">${esc(label('weekEnding', { date: w.label }))}</span><span class="text-sm">${esc(label('weekCounts', { lessons: w.lessons, assessments: w.assessments, live: w.live }))}</span></li>`).join('')}</ul></figcaption></figure>`;
    const due = `<section class="panel" aria-labelledby="due-title">${sectionTitle('due-title', label('dueWork'), button({ label: t('all'), href: '#/student/assignments', variant: 'ghost' }))}${d.due.length ? `<ul class="space-y-2">${d.due.slice(0, 5).map(w => `<li><a class="work-row" href="${esc(roomLink(w.course_id, { tab: 'assessments', activity: w.id }))}"><span class="work-icon">${icon(w.kind === 'quiz' ? 'clipboard' : 'edit', { size: 18 })}</span><span class="min-w-0 flex-1"><span class="block font-medium">${esc(L(w.title))}</span><span class="block text-sm muted">${esc(L(w.course_title))}</span></span><span class="text-sm text-end shrink-0">${w.kind === 'assignment' ? `${w.late ? chip(label('late'), 'danger', 'clock') : `<bdi>${esc(day(w.due_at))}</bdi>`}` : chip(label('notAttempted'), 'info')}</span></a></li>`).join('')}</ul>` : `<p class="muted">${esc(label('allCaughtUp'))}</p>`}</section>`;
    const live = d.next_live ? `<section class="panel stack" aria-labelledby="live-title"><p class="eyebrow">${esc(label('nextLive'))}</p><h2 id="live-title" class="text-lg">${esc(L(d.next_live.title))}</h2><p class="text-sm muted">${esc(L(d.next_live.course.title))}</p><p class="text-sm">${span(d.next_live.starts_at, d.next_live.ends_at)}</p><div class="flex-row">${badge(d.next_live.student_status, { domain: 'live' })}${d.next_live.attendance?.status === 'present' ? chip(label('joined'), 'success', 'check') : ''}</div><div class="flex-row">${d.next_live.attendance?.status === 'present' ? button({ label: label('reopenClass'), href: roomLink(d.next_live.course_id, { tab: 'live', session: d.next_live.id }) }) : `<button type="button" class="btn btn-primary" data-action="student.join" data-id="${esc(d.next_live.id)}" data-course-id="${esc(d.next_live.course_id)}">${icon('play', { size: 16 })}<span>${esc(label('startJoin'))}</span></button>`}${button({ label: label('calendar'), href: '#/student/calendar', variant: 'ghost' })}</div></section>`
      : `<section class="panel stack" aria-labelledby="live-title"><p class="eyebrow">${esc(label('nextLive'))}</p><h2 id="live-title" class="text-lg">${esc(label('noLive'))}</h2><p class="text-sm muted">${esc(label('noLiveBody'))}</p>${button({ label: label('calendar'), href: '#/student/calendar', variant: 'secondary' })}</section>`;
    const unread = `<section class="panel" aria-labelledby="notes-title">${sectionTitle('notes-title', label('unreadTitle', { count: d.unread.length }), button({ label: t('all'), href: '#/student/notifications', variant: 'ghost' }))}${d.unread.length ? `<ul class="space-y-2">${d.unread.slice(0, 3).map(n => `<li class="flex items-start gap-3"><span class="dot" aria-hidden="true"></span><span class="min-w-0"><span class="block font-medium">${safeHash(n.href) ? `<a class="hover:text-primary" href="${esc(n.href)}">${esc(L(n.title))}</a>` : esc(L(n.title))}</span><span class="block text-sm muted">${esc(L(n.body))}</span></span></li>`).join('')}</ul>` : `<p class="muted">${esc(label('noUnread'))}</p>`}</section>`;
    const stats = `<div class="grid gap-4 grid-cols-1 sm:grid-cols-3">${statCard({ label: label('statCourses'), value: d.totals.courses, icon: 'book' })}${statCard({ label: label('statLessons'), value: d.totals.lessons, icon: 'checkCircle' })}${statCard({ label: label('statUnread'), value: d.unread.length, icon: 'bell' })}</div>`;
    const recommended = `<section aria-labelledby="rec-title" class="mt-10">${sectionTitle('rec-title', label('recommended', { grade: L(d.grade?.name) }), button({ label: label('browse'), href: '#/student/explore', variant: 'ghost' }))}${d.recommended.length ? `<div class="grid-cards">${d.recommended.map(c => courseCardFor(c)).join('')}</div>` : `<p class="muted">${esc(label('noRecommended'))}</p>`}</section>`;
    return pageHeader({ title: label('welcome', { name: first }), subtitle: `${L(d.grade?.name)} · ${t('footer.demoDate')}` }) + `<div class="dash-grid"><div class="stack min-w-0">${resume}${stats}${chart}</div><div class="stack min-w-0">${live}${due}${unread}</div></div>${recommended}`;
  },
  mount(root, ctx) {
    const d = select('student.dashboard'); if (!d) return () => {};
    const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const sets = [['lessons', css('--primary') || '#0F766E'], ['assessments', '#B7834A'], ['live', '#5B8FA8']];
    return mountCharts(root, { activity: { type: 'bar', data: { labels: d.weeks.map(w => label('weekEnding', { date: fmt(w.end, { day: 'numeric', month: 'short' }) })), datasets: sets.map(([key, color]) => ({ label: label('series.' + key), data: d.weeks.map(w => w[key]), backgroundColor: color, borderRadius: 8, maxBarThickness: 28 })) }, options: { plugins: { legend: { display: true, position: 'bottom' } } } } }, ctx);
  },
};
function courseCardFor(c) {
  return `<article class="panel card-link course-card flex flex-col min-w-0"><a href="#/course/${esc(enc(c.id))}" tabindex="-1" aria-hidden="true"><img class="cover" src="${courseCover(c.id, c.subject?.id)}" alt="" loading="lazy"></a><div class="p-4 flex flex-col flex-1 min-w-0"><p class="text-xs font-semibold text-primary">${esc(L(c.grade?.name))} · ${esc(L(c.subject?.name))}</p><h3 class="text-base mt-2"><a href="#/course/${esc(enc(c.id))}">${esc(L(c.title))}</a></h3><p class="text-sm muted mt-2">${esc(L(c.teacher?.name))}</p><p class="mt-auto pt-4 text-sm font-medium text-primary">${esc(label('seeCourse'))}</p></div></article>`;
}

// ---------------------------------------------------------------- my courses
export const courses = {
  render(ctx) {
    const rows = select('student.courses'), active = ctx.query.get('tab') || 'active';
    const items = ['active', 'completed', 'expired'].map(id => ({ id, label: label('tab.' + id), href: url(ctx, { tab: id }), count: rows.filter(r => r.tab === id).length }));
    const shown = rows.filter(r => r.tab === active).sort((a, b) => (b.last_activity ?? '').localeCompare(a.last_activity ?? ''));
    const empty = emptyState({ icon: active === 'expired' ? 'clock' : 'book', title: label('empty.' + active), description: label('empty.' + active + 'Body'), action: { label: label('browse'), href: '#/student/explore' } });
    return pageHeader({ title: t('route./student/courses'), subtitle: label('coursesIntro'), actions: button({ label: label('browse'), href: '#/student/explore', variant: 'secondary' }) })
      + tabs(items, active, { label: label('courseTabs') })
      + `<div class="mt-6">${active === 'expired' && shown.length ? notice({ message: label('expiredIntro') }) + '<div class="mt-6"></div>' : ''}${shown.length ? `<div class="grid-cards grid-three">${shown.map(progressCard).join('')}</div>` : empty}</div>`;
  },
};

// ---------------------------------------------------------------- learning room
const ROOM_TABS = ['overview', 'lessons', 'resources', 'assessments', 'live', 'qa', 'announcements'];
function lockedRoom(r, ctx) {
  const c = r.course, state = r.access.state;
  let title = label('lockedTitle'), message = label('lockedBody'), actions = button({ label: label(c.price_type === 'free' ? 'enrollNow' : 'buyNow'), href: '#/course/' + enc(c.id) }) + button({ label: label('myCourses'), href: '#/student/courses', variant: 'ghost' });
  if (state !== 'none') { const rec = recovery({ access: r.access, course: c, purchasable: r.purchasable }); title = label(state === 'revoked' ? 'revokedTitle' : 'expiredTitle'); message = rec.message; actions = rec.actions; }
  return pageHeader({ title: L(c.title), subtitle: `${L(c.grade?.name)} · ${L(c.subject?.name)}`, breadcrumbs: [{ label: t('route./student/courses'), href: '#/student/courses' }, { label: L(c.title) }] })
    + `<section class="panel locked-room text-center" aria-labelledby="locked-title"><span class="fallback-icon">${icon('lock', { size: 32 })}</span><h2 id="locked-title">${esc(title)}</h2><p class="muted mt-3 max-w-xl mx-auto">${esc(message)}</p><div class="flex-row justify-center mt-6">${actions}</div><p class="text-sm muted mt-6">${esc(label('lockedNote'))}</p></section>`;
}
function roomHeader(r) {
  const c = r.course;
  return `<section class="room-header" aria-label="${esc(label('courseProgress'))}"><div class="flex items-center gap-4 min-w-0">${courseThumb(c, 'hidden sm:block h-14 w-20')}<div class="min-w-0 flex-1"><p class="text-xs font-semibold text-primary truncate">${esc(L(c.grade?.name))} · ${esc(L(c.subject?.name))}${r.archived ? ` · ${esc(label('archived'))}` : ''}</p><h1 tabindex="-1" class="room-title">${esc(L(c.title))}</h1></div><div class="room-progress">${progressBar(r.percent, { label: label('lessonsDone', { done: r.done, total: r.total }) })}</div></div></section>`;
}
function outline(r, active, idPrefix) {
  return r.modules.map((m, i) => `<section class="outline-module" aria-labelledby="${idPrefix}-m${i}"><h3 id="${idPrefix}-m${i}" class="outline-heading"><span class="min-w-0">${esc(label('module', { n: i + 1 }))} · ${esc(L(m.title))}</span><bdi class="text-xs muted shrink-0">${m.lessons.filter(l => l.status === 'done').length}/${m.lessons.length}</bdi></h3><ol>${m.lessons.map(l => `<li><a class="outline-lesson" href="${esc(roomLink(r.course.id, { tab: 'lessons', lesson: l.id }))}" ${l.id === active ? 'aria-current="page"' : ''}><span class="lesson-check lesson-${l.status}">${icon(l.status === 'done' ? 'check' : TYPE_ICONS[l.type] ?? 'fileText', { size: 14 })}</span><span class="min-w-0 flex-1"><span class="block text-sm font-medium">${esc(L(l.title))}</span><span class="block text-xs muted">${esc(label('type.' + l.type))} · ${esc(minutes(l.duration_seconds))}</span></span><span class="sr-only">${esc(t('status.lesson_progress.' + l.status))}</span></a></li>`).join('')}</ol></section>`).join('');
}
function overviewTab(r) {
  const g = r.access.grant, teacher = r.teacher;
  const modules = r.modules.map((m, i) => { const done = m.lessons.filter(l => l.status === 'done').length; return `<li>${progressBar(m.lessons.length ? done * 100 / m.lessons.length : 0, { label: `${label('module', { n: i + 1 })} · ${L(m.title)}` })}</li>`; }).join('');
  return `<div class="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]"><div class="stack min-w-0">
    <section class="panel"><div class="flex flex-col sm:flex-row items-center gap-6">${progressRing(r.percent, { label: label('courseProgress'), size: 120 })}<div class="min-w-0 flex-1 stack text-center sm:text-start"><h2 class="text-xl">${esc(label('progressTitle'))}</h2><p class="muted">${esc(label('lessonsDone', { done: r.done, total: r.total }))}</p>${r.next ? `<p class="text-sm">${esc(label('nextUp'))}: <strong>${esc(L(r.next.title))}</strong></p><div class="flex-row justify-center sm:justify-start">${button({ label: label(r.done ? 'continue' : 'start'), href: roomLink(r.course.id, { tab: 'lessons', lesson: r.next.id }) })}</div>` : notice({ message: label('allDone'), tone: 'success' })}</div></div></section>
    <section class="panel"><h2 class="text-lg mb-4">${esc(label('modulesProgress'))}</h2><ul class="space-y-4">${modules}</ul></section>
    <section class="panel stack"><h2 class="text-lg">${esc(label('about'))}</h2><p class="muted leading-relaxed">${esc(L(r.course.summary))}</p></section>
  </div><div class="stack min-w-0">
    <section class="panel stack"><h2 class="text-lg">${esc(label('access'))}</h2><dl class="meta-list"><div><dt>${esc(label('accessStatus'))}</dt><dd>${accessBadge(r.access)}</dd></div><div><dt>${esc(label('origin'))}</dt><dd>${esc(label('origin.' + g.origin))}</dd></div><div><dt>${esc(label('validUntil'))}</dt><dd><bdi>${esc(day(g.ends_at))}</bdi></dd></div><div><dt>${esc(label('enrolledSince'))}</dt><dd><bdi>${esc(day(r.enrollment?.started_at ?? g.starts_at))}</bdi></dd></div></dl>${r.archived ? notice({ message: label('archivedNote', { date: day(g.ends_at) }) }) : ''}<p class="text-sm muted">${esc(label('accessNote'))}</p></section>
    <section class="panel stack"><h2 class="text-lg">${esc(label('teacher'))}</h2><a class="flex items-center gap-3 min-w-0 hover:text-primary" href="#/teacher/${esc(enc(teacher.id))}">${avatar(teacher, { size: 48, showName: true })}</a><p class="text-sm muted">${esc(label('teacherNote'))}</p>${button({ label: label('askQuestion'), href: roomLink(r.course.id, { tab: 'qa' }), variant: 'secondary' })}</section>
  </div></div>`;
}
function lessonsTab(r, ctx) {
  const lesson = r.lessons.find(l => l.id === ctx.query.get('lesson')) ?? r.next ?? r.lessons[0];
  if (!lesson) return emptyState({ icon: 'book', title: label('noLessons') });
  const index = r.lessons.indexOf(lesson), prev = r.lessons[index - 1], next = r.lessons[index + 1], module = r.modules.find(m => m.lessons.includes(lesson));
  const done = lesson.status === 'done', pos = lesson.progress?.position_seconds ?? 0, pct = lesson.duration_seconds ? Math.round(pos * 100 / lesson.duration_seconds) : 0;
  let body = '';
  if (lesson.type === 'video') {
    const finish = done ? '' : `<button type="button" class="btn btn-secondary" data-action="student.finish" data-id="${esc(lesson.id)}">${icon('checkCircle', { size: 16 })}<span>${esc(label('finishDemo'))}</span></button>`;
    body = `<div data-lesson-player data-id="${esc(lesson.id)}" data-done="${done}">${simulatedPlayer({ title: L(lesson.title), caption: L(lesson.transcript) || L(lesson.body), transcript: L(lesson.transcript), position: done ? 0 : pct, namespace: 'student', timelineLabel: label('timeline'), extra: finish })}</div>
      ${done ? notice({ title: label('lessonDone'), message: label('lessonDoneBody', { date: day(lesson.progress.completed_at) }), tone: 'success' }) : notice({ message: pos ? label('videoResume', { time: mmss(pos), percent: pct }) : label('videoRule') })}
      <section class="panel stack"><h3>${esc(label('lessonNotes'))}</h3><p class="leading-relaxed">${esc(L(lesson.body))}</p></section>`;
  } else if (lesson.type === 'reading') {
    const files = r.resources.filter(x => x.lesson_id === lesson.id);
    body = `<article class="panel reading stack"><p class="text-lg leading-loose">${esc(L(lesson.body))}</p>${files.length ? `<div class="stack border-t border-border pt-4"><h3>${esc(label('lessonFiles'))}</h3>${files.map(resourceRow).join('')}</div>` : ''}</article>
      ${done ? notice({ title: label('lessonDone'), message: label('lessonDoneBody', { date: day(lesson.progress.completed_at) }), tone: 'success' }) : `<div class="panel flex items-center justify-between gap-4 flex-wrap"><p class="text-sm muted flex-1 min-w-0">${esc(label('readingRule'))}</p><button type="button" class="btn btn-primary" data-action="student.complete" data-id="${esc(lesson.id)}">${icon('check', { size: 16 })}<span>${esc(label('markComplete'))}</span></button></div>`}`;
  } else {
    const activity = (lesson.type === 'quiz' ? r.quizzes : r.assignments).find(x => x.lesson_id === lesson.id);
    body = `<section class="panel stack"><p class="muted">${esc(label(lesson.type === 'quiz' ? 'quizLessonBody' : 'assignmentLessonBody'))}</p><p class="leading-relaxed">${esc(L(lesson.body))}</p>${activity ? `<div class="flex-row">${button({ label: label(lesson.type === 'quiz' ? 'openQuiz' : 'openAssignment'), href: roomLink(r.course.id, { tab: 'assessments', activity: activity.id }) })}</div>` : ''}</section>`;
  }
  const navButton = (target, key) => target ? `<a class="lesson-nav" href="${esc(roomLink(r.course.id, { tab: 'lessons', lesson: target.id }))}" rel="${key === 'prevLesson' ? 'prev' : 'next'}">${key === 'prevLesson' ? icon('chevronStart', { size: 18 }) : ''}<span class="min-w-0"><span class="block text-xs muted">${esc(label(key))}</span><span class="block font-medium truncate">${esc(L(target.title))}</span></span>${key === 'nextLesson' ? icon('chevronEnd', { size: 18 }) : ''}</a>` : '<span></span>';
  return `<div class="room-layout">
    <aside class="outline-desktop" aria-label="${esc(label('outline'))}">${outline(r, lesson.id, 'outline')}</aside>
    <section class="stack min-w-0" aria-labelledby="lesson-title">
      <div class="outline-mobile">${button({ label: label('outlineOpen'), action: 'overlay.open', data: { id: 'outline-drawer' }, variant: 'secondary' })}</div>
      <header class="flex items-start justify-between gap-3 flex-wrap"><div class="min-w-0"><p class="eyebrow">${esc(label('module', { n: r.modules.indexOf(module) + 1 }))} · ${esc(L(module.title))}</p><h2 id="lesson-title" class="text-2xl mt-1">${esc(L(lesson.title))}</h2></div><div class="flex-row">${chip(label('type.' + lesson.type), 'neutral', TYPE_ICONS[lesson.type])}${chip(minutes(lesson.duration_seconds), 'neutral', 'clock')}${badge(lesson.status, { domain: 'lesson_progress' })}</div></header>
      ${body}
      <nav class="lesson-pager" aria-label="${esc(label('lessonNav'))}">${navButton(prev, 'prevLesson')}${navButton(next, 'nextLesson')}</nav>
    </section></div>${drawer({ id: 'outline-drawer', title: label('outline'), body: outline(r, lesson.id, 'drawer') })}`;
}
function resourceRow(x) {
  return `<article class="resource-row"><div class="flex items-start gap-3 min-w-0"><span class="work-icon">${icon(x.kind === 'worksheet' ? 'clipboard' : 'fileText', { size: 18 })}</span><div class="min-w-0 flex-1"><h3 class="text-base">${esc(L(x.title))}</h3><p class="text-sm muted"><bdi>${esc(x.filename)}</bdi> · ${esc(label('bytes', { count: x.byte_size }))} · ${esc(label('kind.' + x.kind))}</p>${x.lesson ? `<p class="text-xs muted mt-1">${esc(label('fromLesson', { title: L(x.lesson.title) }))}</p>` : ''}</div></div><details class="mt-3"><summary class="text-sm font-medium text-primary cursor-pointer min-h-11 flex items-center">${esc(label('preview'))}</summary><pre class="resource-preview" dir="auto">${esc(L(x.body))}</pre></details><div class="flex-row mt-2"><button type="button" class="btn btn-secondary" data-action="student.download" data-id="${esc(x.id)}">${icon('download', { size: 16 })}<span>${esc(label('download'))}</span></button></div></article>`;
}
function resourcesTab(r) {
  if (!r.resources.length) return emptyState({ icon: 'fileText', title: label('noResources') });
  return notice({ message: label('resourcesNote') }) + `<div class="grid gap-4 md:grid-cols-2 mt-6">${r.resources.map(x => `<div class="panel">${resourceRow(x)}</div>`).join('')}</div>`;
}
function quizDetail(q, r, ctx) {
  const retry = ctx.query.get('retry') === '1' && q.remaining > 0, showResult = q.last && !retry;
  let body;
  if (showResult) {
    const a = q.last, passed = a.score >= q.pass_score;
    body = `<section class="panel stack"><div class="flex items-center gap-5 flex-wrap">${progressRing(a.score, { label: label('score'), size: 96 })}<div class="min-w-0 stack"><h3 class="text-xl">${esc(label(passed ? 'passed' : 'notPassed'))}</h3><p class="muted">${esc(label('scoreLine', { score: a.score, pass: q.pass_score }))}</p>${chip(passed ? label('passed') : label('notPassed'), passed ? 'success' : 'warning', passed ? 'checkCircle' : 'refresh')}</div></div>
      <ol class="stack">${a.question_snapshot.map((x, i) => { const chosen = x.choices.find(c => c.id === a.answers[x.id]), right = a.answers[x.id] === x.correct_choice_id; return `<li class="answer-review ${right ? 'answer-right' : 'answer-wrong'}"><p class="font-medium">${i + 1}. ${esc(L(x.prompt))}</p><p class="text-sm mt-1">${esc(label('yourAnswer'))}: ${esc(L(chosen?.text))} · ${chip(label(right ? 'correct' : 'incorrect'), right ? 'success' : 'danger', right ? 'check' : 'x')}</p>${right ? '' : `<p class="text-sm muted mt-1">${esc(label('correctAnswer'))}: ${esc(L(x.choices.find(c => c.id === x.correct_choice_id)?.text))}</p>`}</li>`; }).join('')}</ol>
      <div class="flex-row">${q.remaining ? button({ label: label('retry', { count: q.remaining }), href: url(ctx, { retry: '1' }) }) : notice({ message: label('attemptLimitReached'), tone: 'warning' })}</div></section>`;
  } else if (q.remaining) {
    body = `<form class="panel stack" data-action="student.quiz" data-id="${esc(q.id)}">${q.questions.map((x, i) => formField({ id: `quiz-${q.id}-${x.id}`, name: x.id, label: `${i + 1}. ${L(x.prompt)}`, type: 'radio', value: '', required: true, options: x.choices.map(c => ({ value: c.id, label: L(c.text) })) })).join('')}<p class="text-sm muted">${esc(label('attemptsLeft', { count: q.remaining, limit: q.attempt_limit }))}</p><div class="flex-row">${submit('submitQuiz')}${q.last ? button({ label: label('cancelRetry'), href: url(ctx, { retry: null }), variant: 'ghost' }) : ''}</div></form>`;
  } else body = notice({ message: label('attemptLimitReached'), tone: 'warning' });
  const history = q.attempts.length ? `<section class="panel"><h3 class="mb-3">${esc(label('attemptHistory'))}</h3><ul class="space-y-2">${q.attempts.map((a, i) => `<li class="flex items-center justify-between gap-3 flex-wrap"><span>${esc(label('attemptN', { n: i + 1 }))} · ${when(a.submitted_at)}</span><strong><bdi>${a.score}%</bdi></strong></li>`).join('')}</ul></section>` : '';
  return `<header class="stack"><p class="eyebrow">${esc(label('quiz'))}</p><h2 class="text-2xl">${esc(L(q.title))}</h2><div class="flex-row">${chip(label('passScore', { score: q.pass_score }), 'neutral', 'checkCircle')}${chip(label('attemptsUsed', { used: q.attempts.length, limit: q.attempt_limit }), 'neutral', 'refresh')}</div></header>${body}${history}`;
}
function assignmentDetail(a) {
  const sub = a.submission;
  const result = a.grade ? `<section class="panel stack tone-success"><h3>${esc(label('resultReleased'))}</h3><p class="text-3xl font-semibold"><bdi>${a.grade.score} / ${a.max_score}</bdi></p><p dir="auto">${esc(a.grade.feedback)}</p><p class="text-sm"><bdi>${esc(day(a.grade.released_at))}</bdi></p></section>` : sub ? notice({ title: label('awaitingResult'), message: label('awaitingResultBody') }) : '';
  const form = sub ? `<section class="panel stack"><h3>${esc(label('yourSubmission'))}</h3><p class="whitespace-pre-line" dir="auto">${esc(sub.text)}</p>${sub.filename ? `<p class="text-sm">${icon('fileText', { size: 16 })} <bdi>${esc(sub.filename)}</bdi></p>` : ''}<p class="text-sm muted">${esc(label('submittedAt'))}: ${when(sub.submitted_at)}${a.late_submission ? ` · ${esc(label('lateSubmission'))}` : ''}</p></section>`
    : `<form class="panel stack" data-action="student.assignment" data-id="${esc(a.id)}" novalidate>${formField({ id: 'assignment-text', name: 'text', label: label('answer'), type: 'textarea', rows: 6, required: true, hint: label('answerHint') })}${formField({ id: 'assignment-file', name: 'file', label: label('attachment'), type: 'file', hint: label('attachmentHint') })}<div class="flex-row">${submit('submitAssignment')}</div></form>`;
  return `<header class="stack"><p class="eyebrow">${esc(label('assignment'))}</p><h2 class="text-2xl">${esc(L(a.title))}</h2><div class="flex-row">${badge(a.state, { domain: 'submission' })}${chip(label('dueOn', { date: day(a.due_at) }), a.late ? 'danger' : 'neutral', 'calendar')}${a.late ? chip(label('late'), 'danger', 'clock') : ''}${chip(label('maxScore', { score: a.max_score }), 'neutral', 'chart')}</div></header><section class="panel stack"><h3>${esc(label('instructions'))}</h3><p class="leading-relaxed">${esc(L(a.instructions))}</p></section>${form}${result}`;
}
function assessmentsTab(r, ctx) {
  const id = ctx.query.get('activity'), quiz = r.quizzes.find(q => q.id === id), assignment = r.assignments.find(a => a.id === id);
  if (quiz || assignment) return `<div class="stack max-w-3xl">${button({ label: label('backToAssessments'), href: url(ctx, { activity: null, retry: null }), variant: 'ghost' })}${quiz ? quizDetail(quiz, r, ctx) : assignmentDetail(assignment)}</div>`;
  const quizzes = r.quizzes.map(q => `<a class="panel card-link activity-card" href="${esc(url(ctx, { activity: q.id, retry: null }))}"><span class="work-icon">${icon('clipboard', { size: 20 })}</span><span class="min-w-0 flex-1"><span class="block text-xs muted">${esc(label('quiz'))}</span><span class="block font-semibold">${esc(L(q.title))}</span><span class="flex-row mt-2">${q.attempts.length ? chip(label('bestScore', { score: q.best }), q.passed ? 'success' : 'warning') : chip(label('notAttempted'), 'info')}${chip(label('attemptsUsed', { used: q.attempts.length, limit: q.attempt_limit }), 'neutral')}</span></span>${icon('chevronEnd', { size: 18 })}</a>`).join('');
  const assignments = r.assignments.map(a => `<a class="panel card-link activity-card" href="${esc(url(ctx, { activity: a.id, retry: null }))}"><span class="work-icon">${icon('edit', { size: 20 })}</span><span class="min-w-0 flex-1"><span class="block text-xs muted">${esc(label('assignment'))}</span><span class="block font-semibold">${esc(L(a.title))}</span><span class="flex-row mt-2">${badge(a.state, { domain: 'submission' })}${a.late ? chip(label('late'), 'danger', 'clock') : chip(label('dueOn', { date: day(a.due_at) }), 'neutral', 'calendar')}</span></span>${icon('chevronEnd', { size: 18 })}</a>`).join('');
  return quizzes || assignments ? `<div class="grid gap-4 md:grid-cols-2">${quizzes}${assignments}</div>` : emptyState({ icon: 'clipboard', title: label('noAssessments') });
}
function sessionCard(x, courseId) {
  const date = new Date(x.starts_at), joined = x.attendance?.status === 'present';
  let actions = '';
  if (x.joinable) actions = joined ? button({ label: label('reopenClass'), href: roomLink(courseId, { tab: 'live', session: x.id }) }) : `<button type="button" class="btn btn-primary" data-action="student.join" data-id="${esc(x.id)}" data-course-id="${esc(courseId)}">${icon('play', { size: 16 })}<span>${esc(label('startJoin'))}</span></button><small class="muted block w-full">${esc(label('joinNote'))}</small>`;
  else if (x.status === 'cancelled') actions = button({ label: label('startJoin'), disabled: true, disabledReason: label('cancelledReason') });
  else if (x.status === 'failed') actions = notice({ title: label('failedTitle'), message: label('failedBody'), tone: 'danger' }) + `<div class="flex-row">${button({ label: label('getHelp'), href: '#/help?tab=contact', variant: 'secondary' })}</div>`;
  const attendance = x.attendance ? chip(label(x.attendance.status === 'present' ? 'attended' : 'absent', { time: x.attendance.joined_at ? clock(x.attendance.joined_at) : '' }), x.attendance.status === 'present' ? 'success' : 'neutral', x.attendance.status === 'present' ? 'check' : 'x') : '';
  return `<article class="panel session-card"><div class="date-tile" aria-hidden="true"><span>${esc(fmt(date.toISOString(), { day: 'numeric' }))}</span><small>${esc(fmt(date.toISOString(), { month: 'short' }))}</small></div><div class="min-w-0 flex-1 stack"><div class="flex items-start justify-between gap-3 flex-wrap"><h3 class="text-base">${esc(L(x.title))}</h3>${badge(x.student_status, { domain: 'live' })}</div><p class="text-sm">${span(x.starts_at, x.ends_at)}</p>${x.status === 'rescheduled' ? `<p class="text-sm muted">${esc(label('rescheduledNote'))}</p>` : ''}<div class="flex-row">${attendance}</div><div class="flex-row">${actions}</div></div></article>`;
}
function meeting(x, r) {
  const teacher = r.teacher;
  return `<section class="stack" aria-labelledby="meeting-title">${notice({ title: label('meetingSimTitle'), message: label('meetingSim') })}<div class="meeting"><div class="meeting-top"><span class="live-dot" aria-hidden="true"></span><h2 id="meeting-title" class="text-lg">${esc(L(x.title))}</h2><output class="ms-auto" data-meeting-clock aria-label="${esc(label('elapsed'))}"><bdi>00:00</bdi></output></div><div class="meeting-grid"><div class="meeting-tile">${avatar(teacher, { size: 72 })}<span>${esc(L(teacher.name))} · ${esc(label('author.teacher'))}</span></div><div class="meeting-tile">${avatar(r.student, { size: 72 })}<span>${esc(label('you'))}</span></div></div><p class="text-sm opacity-80">${esc(L(x.recording_disclosure))}</p></div><div class="flex-row">${chip(label('attended', { time: clock(x.attendance.joined_at) }), 'success', 'check')}${button({ label: label('leaveClass'), href: roomLink(r.course.id, { tab: 'live' }), variant: 'danger' })}</div></section>`;
}
function liveTab(r, ctx) {
  const session = r.sessions.find(x => x.id === ctx.query.get('session') && x.attendance?.status === 'present' && x.joinable);
  if (session) return meeting(session, r);
  const recording = r.recordings.find(x => x.id === ctx.query.get('recording'));
  const now = DEMO_NOW, upcoming = r.sessions.filter(x => x.ends_at > now), past = r.sessions.filter(x => x.ends_at <= now).reverse();
  const player = recording ? `<section class="stack">${notice({ message: label('recordingNote') })}${simulatedPlayer({ title: L(recording.title), caption: L(recording.title), namespace: 'student', timelineLabel: label('timeline') })}<div class="flex-row">${button({ label: label('closeRecording'), href: url(ctx, { recording: null }), variant: 'ghost' })}</div></section>` : '';
  const recordings = `<section aria-labelledby="rec-list" class="stack"><h2 id="rec-list" class="text-xl">${esc(label('recordings'))}</h2>${r.recordings.length ? `<ul class="space-y-2">${r.recordings.map(x => `<li><a class="work-row" href="${esc(url(ctx, { recording: x.id, session: null }))}" ${x.id === recording?.id ? 'aria-current="true"' : ''}><span class="work-icon">${icon('play', { size: 18 })}</span><span class="min-w-0 flex-1"><span class="block font-medium">${esc(L(x.title))}</span><span class="block text-sm muted">${esc(minutes(x.duration_seconds))} · <bdi>${esc(day(x.published_at))}</bdi></span></span></a></li>`).join('')}</ul>` : `<p class="muted">${esc(label('noRecordings'))}</p>`}</section>`;
  const list = (rows, key) => `<section aria-labelledby="live-${key}" class="stack"><h2 id="live-${key}" class="text-xl">${esc(label(key))}</h2>${rows.length ? rows.map(x => sessionCard(x, r.course.id)).join('') : `<p class="muted">${esc(label(key === 'upcoming' ? 'noUpcoming' : 'noPast'))}</p>`}</section>`;
  return `${player}<p class="text-sm muted">${esc(t('footer.demoDate'))} · ${esc(label('muscatNote'))}</p><div class="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] mt-4"><div class="stack min-w-0">${list(upcoming, 'upcoming')}${list(past, 'past')}</div><div class="min-w-0">${recordings}</div></div>`;
}
function askForm(lessons, courseId = null, entitled = null) {
  const courseField = entitled ? formField({ id: 'ask-course', name: 'course', label: label('course'), type: 'select', required: true, options: [{ value: '', label: label('chooseCourse') }, ...entitled.map(c => ({ value: c.id, label: L(c.title) }))], hint: label('courseHint') }) : '';
  const lessonField = lessons ? formField({ id: 'ask-lesson', name: 'lessonId', label: label('lessonOptional'), type: 'select', options: [{ value: '', label: label('generalQuestion') }, ...lessons.map(l => ({ value: l.id, label: L(l.title) }))] }) : '';
  return `<form class="panel stack" data-action="student.ask" ${courseId ? `data-course-id="${esc(courseId)}"` : ''} novalidate><h2 class="text-lg">${esc(label('askTitle'))}</h2><p class="text-sm muted">${esc(label('askNote'))}</p>${courseField}${lessonField}${formField({ id: 'ask-subject', name: 'subject', label: label('subject'), required: true })}${formField({ id: 'ask-text', name: 'text', label: label('question'), type: 'textarea', rows: 4, required: true })}<div class="flex-row">${submit('sendQuestion')}</div></form>`;
}
function qaTab(r) {
  const items = r.conversations.map(q => `<article class="panel stack"><div class="flex items-start justify-between gap-3 flex-wrap"><div class="min-w-0"><h3 class="text-base" dir="auto">${esc(L(q.subject))}</h3><p class="text-sm muted">${esc(q.own ? label('yourQuestion') : label('classmateQuestion'))}${q.lesson ? ` · ${esc(L(q.lesson.title))}` : ''} · ${when(q.last_message_at)}</p></div><div class="flex-row">${q.kind === 'private_support' ? chip(label('private'), 'neutral', 'lock') : ''}${badge(q.state, { domain: 'conversation' })}</div></div>${q.own ? `<div class="flex-row">${button({ label: label('openThread'), href: '#/student/messages/' + enc(q.id), variant: 'secondary' })}<span class="text-sm muted">${esc(label('messagesCount', { count: q.messages.length }))}</span></div>` : `<details><summary class="text-sm font-medium text-primary cursor-pointer min-h-11 flex items-center">${esc(label('showAnswers', { count: q.messages.length }))}</summary><ul class="stack mt-3">${q.messages.map(m => messageItem(m, r.reported)).join('')}</ul></details>`}</article>`).join('');
  return `<div class="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"><section class="stack min-w-0" aria-labelledby="qa-list"><h2 id="qa-list" class="text-xl">${esc(label('courseQa'))}</h2><p class="text-sm muted">${esc(label('qaNote'))}</p>${items || `<p class="muted">${esc(label('noQuestions'))}</p>`}</section><div class="min-w-0">${askForm(r.lessons, r.course.id)}</div></div>${reportDialog()}`;
}
function announcementsTab(r) {
  if (!r.announcements.length) return emptyState({ icon: 'bell', title: label('noAnnouncements') });
  return `<ol class="stack max-w-3xl">${r.announcements.map(a => `<li class="panel"><div class="flex items-center gap-3 min-w-0">${a.author ? avatar(a.author, { size: 40 }) : ''}<div class="min-w-0"><p class="font-semibold">${esc(nameOf(a.author))}</p><p class="text-xs muted">${when(a.published_at)}</p></div></div><h3 class="mt-4">${esc(L(a.title))}</h3><p class="mt-2 leading-relaxed">${esc(L(a.body))}</p></li>`).join('')}</ol>`;
}
export const room = {
  render(ctx) {
    const r = select('student.room', { courseId: ctx.params.id });
    if (r.status === 'missing' || r.status === 'denied') return denied(r.status, ctx);
    if (r.status === 'locked') return lockedRoom(r, ctx);
    const active = ROOM_TABS.includes(ctx.query.get('tab')) ? ctx.query.get('tab') : 'overview';
    const counts = { lessons: r.total, resources: r.resources.length, assessments: r.quizzes.length + r.assignments.length, live: r.sessions.length + r.recordings.length, qa: r.conversations.length, announcements: r.announcements.length };
    const nav = tabs(ROOM_TABS.map(id => ({ id, label: label('room.' + id), href: roomLink(r.course.id, { tab: id }), count: counts[id] })), active, { label: label('roomTabs'), id: 'room-tabs' });
    const body = { overview: overviewTab, lessons: lessonsTab, resources: resourcesTab, assessments: assessmentsTab, live: liveTab, qa: qaTab, announcements: announcementsTab }[active](r, ctx);
    return `<nav aria-label="${esc(t('breadcrumb'))}" class="text-sm muted mb-3"><a class="hover:text-primary" href="#/student/courses">${esc(t('route./student/courses'))}</a></nav>${roomHeader(r)}<div class="room-tabs">${nav}</div><section class="mt-6" aria-labelledby="room-tabs-${active}">${body}</section>`;
  },
  mount(root, ctx) {
    const stops = [], wrap = root.querySelector('[data-lesson-player]');
    if (wrap) {
      const lesson = select('student.room', { courseId: ctx.params.id }).lessons?.find(l => l.id === wrap.dataset.id);
      let sent = wrap.dataset.done === 'true';
      // Reaching 90% of the simulated timeline records completion once (SPEC §4.3 Learning).
      stops.push(mountPlayer(wrap, { onTick: pct => { if (sent || pct < 90 || !lesson) return; sent = true; const r = ctx.dispatch('student.savePosition', { lessonId: lesson.id, position: Math.ceil(lesson.duration_seconds * pct / 100) }); if (r.ok && r.data.completed) showToast(label('videoDone'), { tone: 'success' }); }, onEnd: () => {} }));
    } else stops.push(mountPlayer(root));
    const meetingClock = root.querySelector('[data-meeting-clock]');
    if (meetingClock) { let seconds = 0; const timer = setInterval(() => { seconds++; meetingClock.innerHTML = `<bdi>${mmss(seconds).padStart(5, '0')}</bdi>`; }, 1000); stops.push(() => clearInterval(timer)); }
    return () => stops.forEach(stop => stop());
  },
};

// ---------------------------------------------------------------- explore (portal-wrapped shared catalog)
export const explore = {
  render(ctx) {
    const p = select('student.profile'), grade = select('grades').find(g => g.id === p?.student.current_grade_id);
    const query = new URLSearchParams(ctx.query);
    const defaulted = grade && !query.has('grade') && !query.has('all');
    if (defaulted) query.set('grade', grade.id);
    const scope = defaulted ? notice({ message: label('gradeDefault', { grade: L(grade.name) }) }) + `<div class="flex-row mt-3">${button({ label: label('allGrades'), href: '#/student/explore?all=1', variant: 'secondary' })}</div>` : notice({ message: label('allGradesNote') }) + (grade ? `<div class="flex-row mt-3">${button({ label: label('myGradeOnly', { grade: L(grade.name) }), href: '#/student/explore', variant: 'secondary' })}</div>` : '');
    return pageHeader({ title: t('route./student/explore'), subtitle: label('exploreIntro') }) + scope + results({ ...ctx, query });
  },
};

// ---------------------------------------------------------------- calendar
export const dayKey = iso => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Muscat', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso));
export function weekDays(offset) {
  const [y, m, d] = dayKey(DEMO_NOW).split('-').map(Number), base = new Date(Date.UTC(y, m - 1, d, 12));
  base.setUTCDate(base.getUTCDate() - base.getUTCDay() + offset * 7);// Weeks start on Sunday (Oman school week).
  return Array.from({ length: 7 }, (_, i) => { const x = new Date(base); x.setUTCDate(base.getUTCDate() + i); return x.toISOString(); });
}
export const calendar = {
  render(ctx) {
    const c = select('student.calendar'); if (!c) return fallback('resourceDenied', ctx);
    const view = ctx.query.get('view') === 'list' ? 'list' : 'week', offset = Math.max(-12, Math.min(12, Number.parseInt(ctx.query.get('week'), 10) || 0)), today = dayKey(DEMO_NOW);
    const toggle = tabs([{ id: 'week', label: label('weekView'), href: url(ctx, { view: null }) }, { id: 'list', label: label('listView'), href: url(ctx, { view: 'list', week: null }) }], view, { label: label('calendarView'), id: 'cal-view' });
    const sessionLine = x => `<div class="cal-event cal-${x.student_status}"><p class="text-xs muted"><bdi>${esc(clock(x.starts_at))}</bdi></p><p class="text-sm font-medium" dir="auto">${esc(L(x.title))}</p><p class="text-xs muted">${esc(L(x.course_title))}</p><div class="flex-row mt-1">${badge(x.student_status, { domain: 'live' })}${x.attendance ? chip(label(x.attendance.status === 'present' ? 'attended' : 'absent', { time: x.attendance.joined_at ? clock(x.attendance.joined_at) : '' }), x.attendance.status === 'present' ? 'success' : 'neutral') : ''}</div>${x.joinable ? `<div class="mt-2">${x.attendance?.status === 'present' ? button({ label: label('reopenClass'), href: roomLink(x.course_id, { tab: 'live', session: x.id }), variant: 'secondary' }) : `<button type="button" class="btn btn-primary w-full" data-action="student.join" data-id="${esc(x.id)}" data-course-id="${esc(x.course_id)}">${esc(label('startJoin'))}</button>`}</div>` : x.status === 'failed' ? `<p class="text-xs mt-1"><a class="text-primary underline" href="#/help?tab=contact">${esc(label('getHelp'))}</a></p>` : ''}</div>`;
    const deadlineLine = x => `<a class="cal-event cal-deadline block" href="${esc(roomLink(x.course_id, { tab: 'assessments', activity: x.id }))}"><p class="text-xs muted">${esc(label('due'))} · <bdi>${esc(clock(x.due_at))}</bdi></p><p class="text-sm font-medium">${esc(L(x.title))}</p><p class="text-xs muted">${esc(L(x.course_title))}</p><div class="mt-1">${badge(x.state, { domain: 'submission' })}</div></a>`;
    let body;
    if (view === 'week') {
      const days = weekDays(offset), keys = days.map(dayKey);
      const nav = `<div class="flex items-center justify-between gap-3 flex-wrap mt-6"><div class="flex-row">${button({ label: label('prevWeek'), href: url(ctx, { week: offset - 1 }), variant: 'secondary' })}${button({ label: label('thisWeek'), href: url(ctx, { week: null }), variant: 'ghost' })}${button({ label: label('nextWeek'), href: url(ctx, { week: offset + 1 }), variant: 'secondary' })}</div><p class="font-semibold"><bdi>${esc(fmt(days[0], { day: 'numeric', month: 'short', timeZone: 'UTC' }))} – ${esc(fmt(days[6], { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }))}</bdi></p></div>`;
      const events = keys.reduce((n, k) => n + c.sessions.filter(x => dayKey(x.starts_at) === k).length + c.deadlines.filter(x => dayKey(x.due_at) === k).length, 0);
      body = nav + `<ol class="week-grid mt-4" aria-label="${esc(label('weekView'))}">${days.map((d, i) => { const k = keys[i], s = c.sessions.filter(x => dayKey(x.starts_at) === k), dl = c.deadlines.filter(x => dayKey(x.due_at) === k); return `<li class="week-day ${k === today ? 'is-today' : ''}" ${k === today ? 'aria-current="date"' : ''}><p class="week-day-head"><span>${esc(fmt(d, { weekday: 'short', timeZone: 'UTC' }))}</span><bdi>${esc(fmt(d, { day: 'numeric', timeZone: 'UTC' }))}</bdi>${k === today ? `<span class="sr-only">${esc(label('today'))}</span>` : ''}</p>${s.map(sessionLine).join('')}${dl.map(deadlineLine).join('')}${s.length || dl.length ? '' : `<p class="text-xs muted">${esc(label('noEvents'))}</p>`}</li>`; }).join('')}</ol>${events ? '' : `<p class="muted mt-4">${esc(label('emptyWeek'))}</p>`}`;    } else {
      const now = DEMO_NOW, up = c.sessions.filter(x => x.ends_at > now), past = c.sessions.filter(x => x.ends_at <= now).reverse();
      const group = (rows, key) => `<section class="stack mt-6" aria-labelledby="cal-${key}"><h2 id="cal-${key}" class="text-xl">${esc(label(key))}</h2>${rows.length ? rows.map(x => `<div><p class="text-xs muted mb-1">${esc(L(x.course_title))}</p>${sessionCard(x, x.course_id)}</div>`).join('') : `<p class="muted">${esc(label(key === 'upcoming' ? 'noUpcoming' : 'noPast'))}</p>`}</section>`;
      body = group(up, 'upcoming') + group(past, 'past');
    }
    return pageHeader({ title: t('route./student/calendar'), subtitle: `${t('footer.demoDate')} · ${label('muscatNote')}` }) + toggle + body;
  },
};

// ---------------------------------------------------------------- assignments and results
export const assignments = {
  render(ctx) {
    const w = select('student.work'), active = ctx.query.get('tab') || 'assignments';
    const released = w.assignments.filter(a => a.grade);
    const items = [{ id: 'assignments', count: w.assignments.length }, { id: 'quizzes', count: w.quizzes.length }, { id: 'results', count: released.length + w.quizzes.reduce((n, q) => n + q.attempts.length, 0) }].map(x => ({ ...x, label: label('work.' + x.id), href: url(ctx, { tab: x.id }) }));
    const open = x => button({ label: label('open'), href: roomLink(x.course_id, { tab: 'assessments', activity: x.id }), variant: 'secondary' });
    const titleCell = x => `<span class="block font-medium">${esc(L(x.title))}</span><span class="block text-sm muted">${esc(L(x.course_title))}</span>`;
    let body;
    if (active === 'assignments') body = table([{ key: 'title', label: label('item'), render: titleCell }, { key: 'due_at', label: label('due'), render: a => `<bdi>${esc(day(a.due_at))}</bdi>${a.late ? ' ' + chip(label('late'), 'danger', 'clock') : ''}` }, { key: 'state', label: t('p3.status'), render: a => badge(a.state, { domain: 'submission' }) }], w.assignments, { caption: label('work.assignments'), actions: open, empty: emptyState({ icon: 'clipboard', title: label('noAssignments'), action: { label: label('myCourses'), href: '#/student/courses' } }) });
    else if (active === 'quizzes') body = table([{ key: 'title', label: label('item'), render: titleCell }, { key: 'attempts', label: label('attempts'), render: q => `<bdi>${q.attempts.length} / ${q.attempt_limit}</bdi>` }, { key: 'best', label: label('best'), render: q => q.best === null ? esc(label('notAttempted')) : `<bdi>${q.best}%</bdi> ${chip(label(q.passed ? 'passed' : 'notPassed'), q.passed ? 'success' : 'warning')}` }], w.quizzes, { caption: label('work.quizzes'), actions: open, empty: emptyState({ icon: 'clipboard', title: label('noQuizzes') }) });
    else {
      const rows = [...released.map(a => ({ id: a.id, course_id: a.course_id, title: a.title, course_title: a.course_title, kind: 'assignment', score: `${a.grade.score} / ${a.max_score}`, at: a.grade.released_at, feedback: a.grade.feedback })), ...w.quizzes.flatMap(q => q.attempts.map((x, i) => ({ id: q.id, course_id: q.course_id, title: q.title, course_title: q.course_title, kind: 'quiz', score: `${x.score}%`, at: x.submitted_at, feedback: label('attemptN', { n: i + 1 }), rowId: x.id })))].sort((a, b) => b.at.localeCompare(a.at));
      body = notice({ message: label('releasedOnly') }) + `<div class="mt-4">${table([{ key: 'title', label: label('item'), render: titleCell }, { key: 'kind', label: label('kindLabel'), render: x => esc(label(x.kind)) }, { key: 'score', label: label('score'), render: x => `<strong><bdi>${esc(x.score)}</bdi></strong>` }, { key: 'feedback', label: label('feedback'), render: x => `<span dir="auto">${esc(x.feedback)}</span>` }, { key: 'at', label: label('date'), render: x => `<bdi>${esc(day(x.at))}</bdi>` }], rows.map(x => ({ ...x, id: x.rowId ?? x.id })), { caption: label('work.results'), empty: emptyState({ icon: 'chart', title: label('noResults') }) })}</div>`;
    }
    return pageHeader({ title: t('route./student/assignments'), subtitle: label('workIntro') }) + tabs(items, active, { label: label('workTabs') }) + `<div class="mt-6">${body}</div>`;
  },
};

// ---------------------------------------------------------------- messages
export const messages = {
  render(ctx) {
    const all = select('student.conversations'), active = ctx.query.get('tab') || 'conversations';
    const rows = active === 'questions' ? all.filter(q => q.kind === 'lesson_qa') : all;
    const items = ['conversations', 'questions'].map(id => ({ id, label: label('msg.' + id), href: url(ctx, { tab: id }), count: (id === 'questions' ? all.filter(q => q.kind === 'lesson_qa') : all).length }));
    const list = rows.length ? `<ul class="stack">${rows.map(q => `<li><a class="panel card-link thread-row" href="#/student/messages/${esc(enc(q.id))}"><span class="work-icon">${icon(q.kind === 'lesson_qa' ? 'helpCircle' : 'messageCircle', { size: 20 })}</span><span class="min-w-0 flex-1"><span class="flex items-center justify-between gap-3 flex-wrap"><span class="font-semibold" dir="auto">${esc(L(q.subject))}</span>${badge(q.state, { domain: 'conversation' })}</span><span class="block text-sm muted">${esc(L(q.course_title))} · ${esc(label('kind.' + q.kind))}</span>${q.last ? `<span class="block text-sm mt-1 clamp-2" dir="auto">${esc(q.last.own ? label('you') : q.last.author_role === 'classmate' ? label('classmate') : nameOf({ name: q.last.author_name }))}: ${esc(q.last.text)}</span>` : ''}<span class="block text-xs muted mt-1">${when(q.last_message_at)} · ${esc(label('messagesCount', { count: q.count }))}</span></span></a></li>`).join('')}</ul>` : emptyState({ icon: 'messageCircle', title: label('noConversations'), description: label('noConversationsBody') });
    const entitled = select('student.entitledCourses');
    const side = active === 'questions' ? (entitled.length ? askForm(null, null, entitled) : notice({ message: label('askNeedsCourse') })) : `<section class="panel stack"><h2 class="text-lg">${esc(label('safeTitle'))}</h2><p class="text-sm muted">${esc(label('safeBody'))}</p>${button({ label: label('newQuestion'), href: url(ctx, { tab: 'questions' }), variant: 'secondary' })}</section>`;
    return pageHeader({ title: t('route./student/messages'), subtitle: label('messagesIntro') }) + tabs(items, active, { label: label('msgTabs') }) + `<div class="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] mt-6"><div class="min-w-0">${list}</div><div class="min-w-0">${side}</div></div>`;
  },
};
export const thread = {
  render(ctx) {
    const d = select('student.thread', { id: ctx.params.id }); if (d.status !== 'ok') return denied(d.status, ctx);
    const q = d.conversation, resolved = q.state === 'resolved';
    return pageHeader({ title: L(q.subject), subtitle: L(d.course.title), breadcrumbs: [{ label: t('route./student/messages'), href: '#/student/messages' }, { label: L(q.subject) }], actions: resolved ? '' : `<button type="button" class="btn btn-secondary" data-action="student.resolve">${icon('checkCircle', { size: 16 })}<span>${esc(label('markResolved'))}</span></button>` })
      + `<div class="flex-row mb-6">${badge(q.state, { domain: 'conversation' })}${chip(label('kind.' + q.kind), 'neutral', q.kind === 'lesson_qa' ? 'helpCircle' : 'lock')}${d.lesson ? chip(L(d.lesson.title), 'neutral', 'book') : ''}${button({ label: label('openRoom'), href: roomLink(d.course.id, { tab: 'qa' }), variant: 'ghost' })}</div>
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]"><section class="min-w-0 stack" aria-labelledby="thread-messages"><h2 id="thread-messages" class="sr-only">${esc(label('messages'))}</h2><ol class="stack">${d.messages.map(m => messageItem(m, d.reported)).join('')}</ol>
      <form class="panel stack" data-action="student.reply" novalidate>${formField({ id: 'reply-text', name: 'text', label: label('reply'), type: 'textarea', rows: 3, required: true, hint: resolved ? label('reopenHint') : '' })}<div class="flex-row">${submit('sendReply')}</div></form></section>
      <aside class="min-w-0"><section class="panel stack"><h2 class="text-lg">${esc(label('safeTitle'))}</h2><p class="text-sm muted">${esc(label('safeBody'))}</p></section></aside></div>${reportDialog()}`;
  },
};

// ---------------------------------------------------------------- notifications
export const notifications = {
  render(ctx) {
    const filter = ctx.query.get('filter') === 'unread' ? 'unread' : 'all', all = [...select('notifications')].sort((a, b) => b.created_at.localeCompare(a.created_at)), unread = all.filter(n => !n.read_at);
    const rows = filter === 'unread' ? unread : all;
    const nav = tabs([{ id: 'all', label: label('filterAll'), href: url(ctx, { filter: null }), count: all.length }, { id: 'unread', label: label('filterUnread'), href: url(ctx, { filter: 'unread' }), count: unread.length }], filter, { label: label('notificationFilter') });
    const list = rows.length ? `<ul class="stack mt-6">${rows.map(n => `<li class="panel notification-row ${n.read_at ? '' : 'is-unread'}"><span class="dot ${n.read_at ? 'dot-read' : ''}" aria-hidden="true"></span><div class="min-w-0 flex-1"><div class="flex items-start justify-between gap-3 flex-wrap"><h2 class="text-base">${esc(L(n.title))}</h2><span class="text-xs muted">${when(n.created_at)}</span></div><p class="text-sm muted mt-1">${esc(L(n.body))}</p><div class="flex-row mt-3">${n.read_at ? chip(t('status.delivery.read'), 'neutral', 'check') : chip(label('unreadChip'), 'warning', 'bell')}${safeHash(n.href) ? button({ label: label('openNotice'), href: n.href, variant: 'secondary' }) : ''}${n.read_at ? '' : `<button type="button" class="btn btn-ghost" data-action="student.markRead" data-id="${esc(n.id)}">${esc(label('markRead'))}</button>`}</div></div></li>`).join('')}</ul>` : `<div class="mt-6">${emptyState({ icon: 'bell', title: label(filter === 'unread' ? 'noUnread' : 'noNotifications') })}</div>`;
    return pageHeader({ title: t('route./student/notifications'), subtitle: label('notificationsIntro'), actions: button({ label: label('markAllRead'), action: 'student.markAllRead', variant: 'secondary', disabled: !unread.length, disabledReason: label('noUnread') }) }) + nav + list;
  },
};

// ---------------------------------------------------------------- profile
export const profile = {
  render(ctx) {
    const p = select('student.profile'); if (!p) return fallback('resourceDenied', ctx);
    const stats = [['statCourses', p.stats.active, 'book'], ['statLessons', p.stats.lessons, 'checkCircle'], ['statQuizzes', p.stats.quizzes, 'clipboard'], ['statSubmissions', p.stats.submissions, 'edit'], ['statLive', p.stats.live, 'calendar'], ['statCompleted', p.stats.completed, 'graduationCap']];
    const form = `<form class="panel stack" data-action="student.saveProfile" novalidate><h2 class="text-lg">${esc(label('editProfile'))}</h2>${formField({ id: 'profile-grade', name: 'gradeId', label: label('currentGrade'), type: 'select', value: p.student.current_grade_id, required: true, options: select('grades').map(g => ({ value: g.id, label: L(g.name) })), hint: label('gradeHint') })}<fieldset class="stack"><legend class="font-medium mb-2">${esc(label('interests'))}</legend><div class="grid gap-1 sm:grid-cols-2">${select('subjects').map(s => formField({ id: 'interest-' + s.id, name: 'interests', label: L(s.name), type: 'checkbox', value: p.student.interests.includes(s.id) }).replace('name="interests"', `name="interests" value="${esc(s.id)}"`)).join('')}</div></fieldset><div class="flex-row">${submit('saveProfile')}</div></form>`;
    const history = table([{ key: 'course', label: label('course'), render: r => `<span class="block font-medium">${esc(L(r.course.title))}</span><span class="block text-xs muted">${esc(L(r.course.grade?.name))} · ${esc(L(r.course.subject?.name))}</span>` }, { key: 'grade', label: label('gradeAtEnrollment'), render: r => esc(L(r.historical_grade?.name) || '—') }, { key: 'started', label: label('enrolledSince'), render: r => r.enrollment ? `<bdi>${esc(day(r.enrollment.started_at))}</bdi>` : '—' }, { key: 'access', label: label('accessStatus'), render: r => accessBadge(r.access) }, { key: 'percent', label: t('progress'), align: 'end', render: r => `<bdi>${r.percent}%</bdi>` }], p.history.map(r => ({ ...r, id: r.course.id })), { caption: label('history'), empty: emptyState({ icon: 'book', title: label('noHistory') }) });
    return pageHeader({ title: t('route./student/profile'), subtitle: label('profileIntro') })
      + `<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]"><div class="stack min-w-0"><section class="panel"><div class="flex items-center gap-4 min-w-0">${avatar(p.student, { size: 72 })}<div class="min-w-0"><h2 class="text-xl">${esc(L(p.student.name))}</h2><p class="muted"><bdi>${esc(p.user?.email ?? '')}</bdi></p><p class="text-sm font-semibold text-primary mt-1">${esc(L(p.grade?.name))}</p></div></div><ul class="flex flex-wrap gap-2 mt-4" aria-label="${esc(label('interests'))}">${p.interests.map(s => `<li class="chip">${esc(L(s.name))}</li>`).join('') || `<li class="muted text-sm">${esc(label('noInterests'))}</li>`}</ul></section>${form}</div>
      <div class="stack min-w-0"><div class="grid gap-4 grid-cols-2 xl:grid-cols-3">${stats.map(([key, value, iconName]) => statCard({ label: label(key), value, icon: iconName })).join('')}</div><section class="panel">${notice({ message: label('historyNote') })}<div class="mt-4">${history}</div></section></div></div>`;
  },
};

// ---------------------------------------------------------------- settings
export const settings = {
  render(ctx) {
    const s = select('student.settings'); if (!s) return fallback('resourceDenied', ctx);
    const active = ctx.query.get('tab') || 'account', prefs = select('preferences');
    const nav = tabs(['account', 'privacy', 'notifications'].map(id => ({ id, label: label('settings.' + id), href: url(ctx, { tab: id }) })), active, { label: label('settingsTabs') });
    const choice = (key, value, text) => `<button type="button" class="btn ${prefs[key] === value ? 'btn-primary' : 'btn-secondary'} flex-1" data-action="shell.${key}" data-${key}="${value}" aria-pressed="${prefs[key] === value}">${esc(text)}</button>`;
    let body;
    if (active === 'account') body = `<section class="panel stack"><h2 class="text-lg">${esc(label('accountInfo'))}</h2><dl class="meta-list"><div><dt>${esc(t('p2.name'))}</dt><dd>${esc(L(s.student.name))}</dd></div><div><dt>${esc(t('p2.email'))}</dt><dd><bdi>${esc(s.user?.email ?? '')}</bdi></dd></div><div><dt>${esc(label('locale'))}</dt><dd>${esc(label('locale.' + (s.user?.locale === 'en' ? 'en' : 'ar')))}</dd></div></dl>${notice({ message: label('passwordNote') })}</section>
      <section class="panel stack"><h2 class="text-lg">${esc(label('displayPrefs'))}</h2><p class="font-medium">${esc(t('language'))}</p><div class="flex gap-2">${choice('lang', 'ar', 'العربية')}${choice('lang', 'en', 'English')}</div><p class="font-medium">${esc(t('theme'))}</p><div class="flex gap-2">${choice('theme', 'light', t('light'))}${choice('theme', 'dark', t('dark'))}</div></section>`;
    else if (active === 'privacy') body = `<section class="panel stack"><h2 class="text-lg">${esc(label('consentTitle'))}</h2><p class="muted leading-relaxed">${esc(label('consentBody'))}</p><div class="flex-row">${button({ label: t('privacy'), href: '#/legal/privacy', variant: 'secondary' })}${button({ label: t('help'), href: '#/help?tab=contact', variant: 'ghost' })}</div></section>
      <section class="panel stack"><h2 class="text-lg">${esc(label('guardiansTitle'))}</h2><p class="text-sm muted">${esc(label('guardiansBody'))}</p>${s.guardians.length ? `<ul class="stack">${s.guardians.map(g => `<li class="rounded-xl border border-border p-4"><div class="flex items-center justify-between gap-3 flex-wrap"><span class="flex items-center gap-3 min-w-0">${avatar(g.guardian, { size: 40 })}<span class="min-w-0"><span class="block font-semibold">${esc(nameOf(g.guardian))}</span><span class="block text-sm muted">${esc(L(g.relationship))} · <bdi>${esc(day(g.verified_at))}</bdi></span></span></span>${badge('verified', { domain: 'guardian_link' })}</div><ul class="flex flex-wrap gap-2 mt-3" aria-label="${esc(label('scopes'))}">${g.scopes.map(x => `<li class="chip text-xs">${esc(label('scope.' + x))}</li>`).join('')}</ul></li>`).join('')}</ul>` : `<p class="muted">${esc(label('noGuardians'))}</p>`}${notice({ message: label('guardianLimits') })}</section>`;
    else body = `<form class="panel stack" data-action="student.saveSettings"><h2 class="text-lg">${esc(label('notifyPrefs'))}</h2><p class="text-sm muted">${esc(label('notifyNote'))}</p>${STUDENT_PREFS.map(k => formField({ id: 'pref-' + k, name: k, label: label('pref.' + k), type: 'checkbox', value: s.prefs[k] })).join('')}<div class="flex-row">${submit('savePrefs')}</div></form>`;
    return pageHeader({ title: t('route./student/settings'), subtitle: label('settingsIntro') }) + nav + `<div class="stack max-w-3xl mt-6">${body}</div>`;
  },
};

// ---------------------------------------------------------------- actions
function report(r, okKey) { showToast(r.ok ? label(okKey) : t(Object.values(r.fieldErrors ?? {})[0] ?? r.errorKey), { tone: r.ok ? 'success' : 'error' }); return r.ok; }
function download(resource) {
  // Generated client-side so every listed file exists; plain text keeps the demo dependency-free.
  const blob = new Blob([`${L(resource.title)}\n\n${L(resource.body)}\n\n— ${t('brand')} · ${t('demo')}\n`], { type: 'text/plain;charset=utf-8' }), href = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = href; a.download = resource.filename; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(href), 1000);
}
export function registerActions(register) {
  register('student', {
    play: (_e, el, ctx) => {
      const playing = togglePlayer(el), wrap = el.closest('[data-lesson-player]');
      // Pausing stores the resume position; the reducer applies the 90% completion rule.
      if (playing || !wrap) return;
      const lesson = select('student.room', { courseId: ctx.params.id }).lessons?.find(l => l.id === wrap.dataset.id);
      if (lesson) ctx.dispatch('student.savePosition', { lessonId: lesson.id, position: Math.round(lesson.duration_seconds * (Number(wrap.querySelector('[data-player]').dataset.position) || 0) / 100) });
    },
    captions: (_e, el) => toggleCaptions(el),
    finish: (_e, el, ctx) => report(ctx.dispatch('student.completeLesson', { lessonId: el.dataset.id }), 'lessonCompleted'),
    complete: (_e, el, ctx) => report(ctx.dispatch('student.completeLesson', { lessonId: el.dataset.id }), 'lessonCompleted'),
    download: (_e, el) => { const r = select('student.resource', { id: el.dataset.id }); if (!r) { showToast(t('p4.noAccess'), { tone: 'error' }); return; } download(r); showToast(label('downloaded', { name: r.filename }), { tone: 'success' }); },
    quiz: (event, el, ctx) => {
      if (event.type !== 'submit') return;
      const fd = new FormData(el), answers = Object.fromEntries([...fd.entries()].filter(([, v]) => typeof v === 'string'));
      const r = ctx.dispatch('quiz.submit', { quizId: el.dataset.id, answers });
      if (!report(r, 'quizSubmitted')) return;
      if (ctx.query.has('retry')) ctx.navigate(url(ctx, { retry: null }));
    },
    assignment: (event, el, ctx) => {
      if (event.type !== 'submit') return;
      const fd = new FormData(el), file = fd.get('file');
      report(ctx.dispatch('assignment.submit', { assignmentId: el.dataset.id, text: fd.get('text'), filename: typeof file === 'string' ? file : file?.name ?? '' }), 'assignmentSubmitted');
    },
    join: (_e, el, ctx) => { const r = ctx.dispatch('live.join', { sessionId: el.dataset.id }); if (!r.ok) { showToast(t(r.errorKey), { tone: 'error' }); return; } ctx.navigate(roomLink(el.dataset.courseId, { tab: 'live', session: el.dataset.id })); },
    ask: (event, el, ctx) => {
      if (event.type !== 'submit') return;
      const fd = new FormData(el), r = ctx.dispatch('qa.ask', { courseId: el.dataset.courseId ?? fd.get('course'), lessonId: fd.get('lessonId') ?? '', subject: fd.get('subject'), text: fd.get('text') });
      if (!r.ok) { showToast(r.errorKey === 'p4.noAccess' || r.errorKey === 'missing' ? t('p4.chooseCourseError') : t(Object.values(r.fieldErrors)[0] ?? r.errorKey), { tone: 'error' }); return; }
      ctx.navigate('#/student/messages/' + enc(r.data.conversationId));
    },
    reply: (event, el, ctx) => { if (event.type !== 'submit') return; report(ctx.dispatch('message.reply', { conversationId: ctx.params.id, text: new FormData(el).get('text') }), 'replySent'); },
    resolve: (_e, _el, ctx) => report(ctx.dispatch('message.resolve', { conversationId: ctx.params.id }), 'resolved'),
    reportOpen: (_e, el) => { const dialog = document.getElementById('report-dialog'); if (!dialog) return; dialog.querySelector('form').reset(); dialog.querySelector('input[name="messageId"]').value = el.dataset.id; openOverlay('report-dialog'); },
    report: (event, el, ctx) => { if (event.type !== 'submit') return; const fd = new FormData(el), r = ctx.dispatch('message.report', { messageId: fd.get('messageId'), reason: fd.get('reason') }); if (r.ok) closeOverlay('report-dialog'); report(r, r.data?.existing ? 'alreadyReported' : 'reportSent'); },
    markRead: (_e, el, ctx) => ctx.dispatch('notifications.markRead', { id: el.dataset.id }),
    markAllRead: (_e, _el, ctx) => report(ctx.dispatch('notifications.markAllRead', {}), 'allRead'),
    saveProfile: (event, el, ctx) => { if (event.type !== 'submit') return; const fd = new FormData(el); report(ctx.dispatch('student.updateProfile', { gradeId: fd.get('gradeId'), interests: fd.getAll('interests') }), 'profileSaved'); },
    saveSettings: (event, el, ctx) => { if (event.type !== 'submit') return; const fd = new FormData(el); report(ctx.dispatch('student.updateSettings', { prefs: Object.fromEntries(STUDENT_PREFS.map(k => [k, fd.get(k) === 'on'])) }), 'prefsSaved'); },
  });
}
