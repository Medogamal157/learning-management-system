import { t, L, esc } from '../core/i18n.js';
import { select, TEAM_CAPABILITIES, ASSISTANT_PREFS } from '../core/store.js';
import { pageHeader, statCard, badge, tabs, table, emptyState, notice, button, avatar, formField, modal, showToast, openOverlay, closeOverlay } from '../core/ui.js';
import { icon } from '../core/icons.js';
import { courseCover } from '../core/media.js';
import { fallback } from '../core/layout.js';
import { chip, when, day, sectionTitle, submit, formState, fe, fv, hasErrors, safeHash, auditLabel, choiceButtons, formAction, onSubmit, strings } from './teacher.js';

// Assistant workspace (SPEC §5 Assistant). Every view reads `assistant.*` selectors that re-derive scope from the
// active membership, per-course capabilities and explicit conversation assignments; mutations reuse the P6
// reducers, which repeat the same checks, so forged data-id values are rejected by the store.
const label = (key, params) => t('p7.' + key, params);
const p6 = (key, params) => t('p6.' + key, params);
const enc = encodeURIComponent;
const threadLink = id => '#/assistant/inbox/' + enc(id);
const courseLink = (id, tab = null) => '#/assistant/course/' + enc(id) + (tab ? '?tab=' + tab : '');
const gradeSubject = c => `${L(c.grade?.name)} · ${L(c.subject?.name)}`;
const thumb = (c, size = 'h-14 w-20') => `<img class="${size} rounded-xl object-cover shrink-0" src="${courseCover(c.id, c.subject?.id ?? 'math')}" alt="">`;
const denied = (status, ctx) => fallback(status === 'missing' ? 'missing' : 'resourceDenied', ctx);
const dirField = (html, dir) => html.replace('class="field"', `class="field" dir="${dir}"`);
const TYPE_ICONS = { video: 'play', reading: 'book', quiz: 'clipboard', assignment: 'edit' };
const KIND_ICONS = { grading: 'clipboard', content: 'edit' };
const INBOX_TABS = ['open', 'assigned', 'escalated', 'resolved'];
const COURSE_TABS = ['overview', 'content', 'tasks'];
const TASK_TABS = ['grading', 'content'];
const capChips = caps => `<ul class="flex flex-wrap gap-2" aria-label="${esc(label('capabilities'))}">${caps.map(x => `<li>${chip(p6('cap.' + x), 'success', 'check')}</li>`).join('')}</ul>`;
const capDenied = cap => notice({ title: label('capDeniedTitle', { cap: p6('cap.' + cap) }), message: label('capDeniedBody'), tone: 'warning' });
// Revoked membership or no assignment: explain the state without naming any course or learner.
const noAccess = (withAction = true) => emptyState({ icon: 'lock', title: label('noAccessTitle'), description: label('noAccessBody'), action: withAction ? { label: label('backToOverview'), href: '#/assistant' } : null });

function convRow(q, h = 'h2') {
  return `<li class="panel stack"><div class="flex items-start gap-3 min-w-0"><span class="work-icon">${icon(q.kind === 'lesson_qa' ? 'helpCircle' : 'messageCircle', { size: 20 })}</span><div class="min-w-0 flex-1"><div class="flex items-start justify-between gap-3 flex-wrap"><${h} class="text-base"><a class="hover:text-primary" href="${threadLink(q.id)}" dir="auto">${esc(L(q.subject))}</a></${h}>${badge(q.state, { domain: 'conversation' })}</div><p class="text-sm muted">${esc(L(q.course_title))} · ${esc(L(q.student_name))} · ${esc(t('p4.kind.' + q.kind))}</p>${q.last_text ? `<p class="text-sm mt-1 clamp-2" dir="auto">${esc(q.last_text)}</p>` : ''}<p class="text-xs muted mt-1">${when(q.last_message_at)}</p></div></div></li>`;
}
function taskCard(x, h = 'h3', editor = '') {
  const steps = x.next.map(s => `<button type="button" class="btn ${s === 'done' ? 'btn-primary' : 'btn-secondary'}" data-action="assistant.taskState" data-id="${esc(x.id)}" data-value="${s}">${icon(s === 'done' ? 'checkCircle' : 'clock', { size: 16 })}<span>${esc(label('taskTo.' + s))}</span></button>`).join('');
  return `<li class="panel stack"><div class="flex items-start gap-3 min-w-0"><span class="work-icon">${icon(KIND_ICONS[x.kind], { size: 20 })}</span><div class="min-w-0 flex-1"><div class="flex items-start justify-between gap-3 flex-wrap"><${h} class="text-base" dir="auto">${esc(x.target ? L(x.target.title) : label('task.' + x.kind))}</${h}>${badge(x.state, { domain: 'task' })}</div><p class="text-sm muted">${esc(label('task.' + x.kind))} · ${esc(L(x.course_title))}${x.target?.student_name ? ` · ${esc(L(x.target.student_name))}` : ''}</p><p class="text-xs muted mt-1">${esc(label('dueOn', { date: day(x.due_at) }))}</p></div></div>${x.allowed ? '' : capDenied(x.capability)}${editor}${steps ? `<div class="flex-row">${steps}</div>` : ''}</li>`;
}
function courseItem(c, h = 'h3') {
  return `<li class="panel stack min-w-0"><div class="flex items-start gap-3 min-w-0">${thumb(c)}<div class="min-w-0 flex-1"><${h} class="text-base" dir="auto"><a class="hover:text-primary" href="${courseLink(c.id)}">${esc(L(c.title))}</a></${h}><p class="text-sm muted">${esc(gradeSubject(c))}</p><p class="text-xs muted mt-1">${esc(label('ownerLine', { name: L(c.owner) }))}</p></div></div>${capChips(c.capabilities)}<p class="text-sm muted">${esc(label('cardMeta', { lessons: c.lessons, open: c.open, tasks: c.tasks }))}</p><div class="flex-row">${button({ label: label('openWorkspace'), href: courseLink(c.id) })}${c.capabilities.includes('reply_conversation') ? button({ label: label('openInbox'), href: '#/assistant/inbox?tab=assigned', variant: 'secondary' }) : ''}</div></li>`;
}

// ---------------------------------------------------------------- overview
export const overview = {
  render() {
    const d = select('assistant.overview'), me = select('actor');
    const header = pageHeader({ title: label('welcome', { name: L(me.name).split(' ')[0] }), subtitle: d.active ? label('overviewIntro', { owner: L(d.owner) }) : label('overviewRevoked'), actions: d.courses.length ? button({ label: t('route./assistant/inbox'), href: '#/assistant/inbox' }) + button({ label: t('route./assistant/tasks'), href: '#/assistant/tasks', variant: 'secondary' }) : '' });
    if (!d.courses.length) return header + noAccess(false);
    const stats = `<div class="grid gap-4 grid-cols-1 sm:grid-cols-3 mb-6">${statCard({ label: label('statCourses'), value: d.counts.courses, icon: 'book' })}${statCard({ label: label('statOpen'), value: d.counts.open, icon: 'mail' })}${statCard({ label: label('statDue'), value: d.counts.due, icon: 'clipboard' })}</div>`;
    const queue = `<section class="panel stack min-w-0" aria-labelledby="queue-title">${sectionTitle('queue-title', label('myQueue'), button({ label: t('all'), href: '#/assistant/inbox', variant: 'ghost' }))}${d.queue.length ? `<ul class="stack">${d.queue.map(q => convRow(q, 'h3')).join('')}</ul>` : `<p class="muted">${esc(label('queueEmpty'))}</p>`}</section>`;
    const due = `<section class="panel stack min-w-0" aria-labelledby="due-title">${sectionTitle('due-title', label('dueTasks'), button({ label: t('all'), href: '#/assistant/tasks', variant: 'ghost' }))}${d.tasks.length ? `<ul class="stack">${d.tasks.map(x => `<li><a class="work-row" href="#/assistant/tasks?tab=${x.kind}"><span class="work-icon">${icon(KIND_ICONS[x.kind], { size: 18 })}</span><span class="min-w-0 flex-1"><span class="block font-medium" dir="auto">${esc(x.target ? L(x.target.title) : label('task.' + x.kind))}</span><span class="block text-xs muted">${esc(L(x.course_title))} · ${esc(label('dueOn', { date: day(x.due_at) }))}</span></span>${badge(x.state, { domain: 'task' })}</a></li>`).join('')}</ul>` : `<p class="muted">${esc(label('noDueTasks'))}</p>`}</section>`;
    const shortcuts = `<section class="mt-6" aria-labelledby="courses-title">${sectionTitle('courses-title', label('courseShortcuts'), button({ label: t('all'), href: '#/assistant/courses', variant: 'ghost' }))}<ul class="grid gap-4 md:grid-cols-2">${d.courses.map(c => courseItem(c)).join('')}</ul></section>`;
    return header + stats + `<div class="grid gap-6 lg:grid-cols-2">${queue}${due}</div>` + shortcuts + `<div class="mt-6">${notice({ message: label('scopeNote') })}</div>`;
  },
};

// ---------------------------------------------------------------- courses
export const courses = {
  render() {
    const d = select('assistant.courses');
    const header = pageHeader({ title: t('route./assistant/courses'), subtitle: label('coursesIntro') });
    if (!d.courses.length) return header + noAccess();
    return header + notice({ message: label('membershipNote') }) + `<ul class="grid gap-4 md:grid-cols-2 mt-6">${d.courses.map(c => courseItem(c, 'h2')).join('')}</ul>`;
  },
};

// ---------------------------------------------------------------- course workspace
function lessonForm(l, prefix) {
  const f = formState('alesson:' + l.id), text = ['reading', 'video'].includes(l.type);
  const title = lg => dirField(formField({ id: `${prefix}-title-${lg}-${l.id}`, name: 'title_' + lg, label: label('field.title_' + lg), required: true, value: fv(f, 'title_' + lg, l.title[lg]), error: fe(f, 'title_' + lg) }), lg === 'ar' ? 'rtl' : 'ltr');
  const body = text ? formField({ id: `${prefix}-body-${l.id}`, name: 'body', label: label('field.body'), type: 'textarea', rows: 5, required: true, value: fv(f, 'body', L(l.body)), error: fe(f, 'body') }) : '';
  return `<form class="stack mt-3" data-action="assistant.saveLesson" data-id="${esc(l.id)}" novalidate><div class="grid gap-4 sm:grid-cols-2">${title('ar')}${title('en')}</div>${body}<p class="text-sm muted">${esc(label('editScopeHint'))}</p><div class="flex-row">${submit('saveChanges')}</div></form>`;
}
function lessonItem(l, d) {
  const editable = d.canEdit && !d.contentLocked, f = formState('alesson:' + l.id);
  const detail = editable
    ? `<details ${hasErrors(f) ? 'open' : ''}><summary class="text-sm font-medium text-primary cursor-pointer min-h-11 flex items-center gap-2">${icon('edit', { size: 16 })}<span>${esc(label('editLesson'))}</span></summary>${lessonForm(l, 'content')}</details>`
    : ['reading', 'video'].includes(l.type) ? `<details><summary class="text-sm font-medium text-primary cursor-pointer min-h-11 flex items-center">${esc(label('viewText'))}</summary><p class="text-sm whitespace-pre-line rounded-xl bg-sand p-3 mt-2" dir="auto">${esc(L(l.body))}</p></details>` : '';
  return `<li class="rounded-xl border border-border p-3 stack"><div class="flex items-start gap-3 min-w-0"><span class="work-icon">${icon(TYPE_ICONS[l.type] ?? 'book', { size: 18 })}</span><div class="min-w-0 flex-1"><p class="font-medium" dir="auto">${esc(L(l.title))}</p><p class="flex-row mt-1 text-sm muted">${badge(l.state, { domain: 'content' })}<span>${esc(t('duration', { count: Math.max(1, Math.round(l.duration_seconds / 60)) }))}</span>${l.preview ? chip(label('preview'), 'info', 'play') : ''}</p></div></div>${detail}</li>`;
}
function overviewTab(d) {
  const c = d.course;
  const caps = `<ul class="stack">${TEAM_CAPABILITIES.map(x => { const has = c.capabilities.includes(x); return `<li class="work-row"><span class="work-icon">${icon(has ? 'checkCircle' : 'lock', { size: 18 })}</span><span class="min-w-0 flex-1"><span class="block font-medium">${esc(p6('cap.' + x))}</span><span class="block text-xs muted">${esc(label('capHelp.' + x))}</span></span>${chip(label(has ? 'granted' : 'notGranted'), has ? 'success' : 'neutral')}</li>`; }).join('')}</ul>`;
  const facts = [[label('owner'), esc(L(c.owner))], [p6('gradeSubject'), esc(gradeSubject(c))], [p6('field.mode'), esc(t('mode.' + c.mode))], [label('courseStatus'), badge(c.status, { domain: 'course' })], [label('lessonsCount'), `<bdi>${c.lessons}</bdi>`], [label('openAssigned'), `<bdi>${c.open}</bdi>`], [label('openTasks'), `<bdi>${c.tasks}</bdi>`]];
  return `<div class="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"><section class="panel stack min-w-0" aria-labelledby="caps-title"><h2 id="caps-title" class="text-lg">${esc(label('capabilities'))}</h2><p class="text-sm muted">${esc(label('capsIntro'))}</p>${caps}</section>
    <div class="stack min-w-0"><section class="panel stack" aria-labelledby="facts-title"><h2 id="facts-title" class="text-lg">${esc(p6('facts'))}</h2><dl class="meta-list">${facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join('')}</dl></section>${notice({ title: label('boundariesTitle'), message: label('boundaries') })}</div></div>`;
}
function contentTab(d) {
  if (!d.canRead) return capDenied('read_content');
  const intro = d.canEdit ? (d.contentLocked ? notice({ message: t(d.contentLocked), tone: 'warning' }) : notice({ title: label('editTitle'), message: label('editNote') })) : notice({ title: label('readOnlyTitle'), message: label('readOnlyNote') });
  return `<div class="stack">${intro}${d.modules.map(m => `<section class="panel stack" aria-labelledby="mod-${esc(m.id)}"><h2 id="mod-${esc(m.id)}" class="text-lg" dir="auto">${esc(L(m.title))}</h2>${m.lessons.length ? `<ul class="stack">${m.lessons.map(l => lessonItem(l, d)).join('')}</ul>` : `<p class="muted text-sm">${esc(label('noLessons'))}</p>`}</section>`).join('')}</div>`;
}
function tasksTab(d) {
  return `<div class="stack">${d.tasks.length ? `<ul class="stack">${d.tasks.map(x => taskCard(x, 'h2')).join('')}</ul>` : emptyState({ icon: 'clipboard', title: label('noCourseTasks') })}<div class="flex-row">${TASK_TABS.map(k => button({ label: label('openTasks.' + k), href: '#/assistant/tasks?tab=' + k, variant: 'secondary' })).join('')}</div></div>`;
}
export const course = {
  render(ctx) {
    const d = select('assistant.course', { id: ctx.params.id }); if (d.status !== 'ok') return denied(d.status, ctx);
    const c = d.course, tab = COURSE_TABS.includes(ctx.query.get('tab')) ? ctx.query.get('tab') : 'overview';
    const header = pageHeader({ title: L(c.title), subtitle: `${gradeSubject(c)} · ${t('mode.' + c.mode)}`, breadcrumbs: [{ label: t('route./assistant/courses'), href: '#/assistant/courses' }, { label: L(c.title) }] });
    const strip = `<section class="panel flex flex-col sm:flex-row sm:items-center gap-4 mb-6 min-w-0">${thumb(c, 'w-full sm:w-28 aspect-[16/10] h-auto')}<div class="min-w-0 flex-1 stack"><div class="flex-row">${badge(c.status, { domain: 'course' })}<span class="text-sm muted">${esc(label('ownerLine', { name: L(c.owner) }))}</span></div>${capChips(c.capabilities)}</div></section>`;
    const counts = { content: d.canRead ? d.modules.reduce((n, m) => n + m.lessons.length, 0) : undefined, tasks: d.tasks.length };
    const nav = tabs(COURSE_TABS.map(id => ({ id, label: label('ws.' + id), href: courseLink(c.id, id), count: counts[id] })), tab, { label: label('wsTabs'), id: 'aws-tabs' });
    const body = { overview: () => overviewTab(d), content: () => contentTab(d), tasks: () => tasksTab(d) }[tab]();
    return header + strip + `<div class="room-tabs">${nav}</div><section class="mt-6" aria-labelledby="aws-tabs-${tab}">${body}</section>`;
  },
};

// ---------------------------------------------------------------- inbox and thread
export const inbox = {
  render(ctx) {
    const header = pageHeader({ title: t('route./assistant/inbox'), subtitle: label('inboxIntro') });
    if (!select('assistant.courses').courses.some(c => c.capabilities.includes('reply_conversation'))) return header + noAccess();
    const asked = ctx.query.get('tab'), probe = select('assistant.inbox', { tab: 'open' });
    // No tab in the URL: open the first queue that has work; an invalid tab is normalised to "open" by the router.
    const tab = INBOX_TABS.includes(asked) ? asked : INBOX_TABS.find(k => probe.counts[k]) ?? 'open';
    const waiting = tab === 'assigned' && ctx.query.get('filter') === 'waiting', d = select('assistant.inbox', { tab, waiting });
    const nav = tabs(INBOX_TABS.map(id => ({ id, label: t('status.conversation.' + id), href: '#/assistant/inbox?tab=' + id, count: d.counts[id] })), tab, { label: label('inboxTabs'), id: 'inbox-tabs' });
    const filter = tab === 'assigned' ? `<div class="mt-3">${tabs([{ id: 'all', label: label('allAssigned'), href: '#/assistant/inbox?tab=assigned', count: d.counts.assigned }, { id: 'waiting', label: t('status.conversation.waiting'), href: '#/assistant/inbox?tab=assigned&filter=waiting', count: d.counts.waiting }], waiting ? 'waiting' : 'all', { label: label('waitingFilter'), id: 'waiting-filter' })}</div>` : '';
    const rows = d.rows.length ? `<ul class="stack">${d.rows.map(q => convRow(q)).join('')}</ul>` : emptyState({ icon: 'mail', title: label('inboxEmpty.' + (waiting ? 'waiting' : tab)), description: label('inboxEmptyBody') });
    return header + notice({ message: p6('safeguarding') }) + `<div class="mt-6">${nav}${filter}</div><section class="mt-6" aria-labelledby="inbox-tabs-${tab}">${rows}</section>`;
  },
};
function reportDialog() {
  return modal({ id: 'assistant-report', title: t('p4.reportTitle'), body: `<form class="stack" data-action="assistant.report" novalidate><input type="hidden" name="conversationId" value=""><input type="hidden" name="messageId" value="">${formField({ id: 'assistant-report-reason', name: 'reason', label: t('p4.reportReason'), type: 'radio', value: '', required: true, options: ['unsafe', 'inappropriate', 'privacy', 'other'].map(value => ({ value, label: t('p4.reason.' + value) })) })}<p class="text-sm muted">${esc(p6('reportNote'))}</p><button type="submit" class="btn btn-danger">${esc(t('p4.reportSubmit'))}</button></form>` });
}
const statusButton = (q, s, text) => `<button type="button" class="btn ${s === 'resolved' ? 'btn-primary' : 'btn-secondary'}" data-action="assistant.setStatus" data-id="${esc(q.id)}" data-value="${s}">${icon(s === 'escalated' ? 'flag' : s === 'resolved' ? 'checkCircle' : 'clock', { size: 16 })}<span>${esc(text)}</span></button>`;
const statusText = (s, owner) => s === 'escalated' ? label('escalateTo', { name: L(owner) }) : p6('moveTo', { state: t('status.conversation.' + s) });
const reportButton = (conversationId, messageId = '') => `<button type="button" class="btn btn-ghost text-sm min-h-11" data-action="assistant.reportOpen" data-id="${esc(messageId)}" data-conversation-id="${esc(conversationId)}">${icon('flag', { size: 16 })}<span>${esc(messageId ? t('p4.report') : p6('reportConversation'))}</span></button>`;
function statusHint(q, owner) {
  if (q.state === 'escalated') return notice({ title: label('escalatedTitle'), message: label('escalatedNote', { name: L(owner) }), tone: 'warning' });
  if (q.state === 'open') return `<p class="text-sm muted">${esc(label('openHint'))}</p>`;
  if (q.state === 'resolved') return `<p class="text-sm muted">${esc(p6('resolvedHint'))}</p>`;
  return '';
}
export const thread = {
  render(ctx) {
    const d = select('assistant.thread', { id: ctx.params.id }); if (d.status !== 'ok') return denied(d.status, ctx);
    const q = d.conversation, replyForm = formState('areply:' + q.id), noteForm = formState('anote:' + q.id);
    const who = m => m.own ? p6('you') : `${L(m.author_name) || p6('unknownPerson')} · ${p6('role.' + m.author_role)}`;
    const messages = d.messages.map(m => `<li class="msg ${m.own ? 'msg-own' : ''} ${m.internal ? 'msg-internal' : ''}"><div class="flex items-center justify-between gap-3 flex-wrap"><span class="flex items-center gap-2 min-w-0">${avatar({ id: m.author_user_id, name: m.author_name ?? { ar: who(m), en: who(m) } }, { size: 28 })}<strong class="text-sm">${esc(who(m))}</strong></span><span class="text-xs muted">${when(m.created_at)}</span></div>${m.internal ? `<p class="mt-2">${chip(p6('internalNote'), 'warning', 'lock')}</p>` : ''}<p class="mt-2 whitespace-pre-line" dir="auto">${esc(m.text)}</p><div class="flex-row mt-1">${m.moderation_state === 'flagged' ? chip(t('p4.underReview'), 'warning', 'shield') : ''}${m.own || m.internal ? '' : d.reported.has(m.id) ? chip(t('p4.reported'), 'warning', 'flag') : reportButton(q.id, m.id)}</div></li>`).join('');
    const trail = d.trail.length ? `<ol class="stack">${d.trail.map(e => `<li class="text-sm"><p class="font-medium">${esc(auditLabel(e.action))}${e.detail ? ` · <span dir="auto">${esc(typeof e.detail === 'object' ? L(e.detail) : e.detail)}</span>` : ''}</p><p class="muted">${esc(L(e.actor) || p6('system'))} · ${when(e.at)}${e.status && e.status !== 'active' ? ` · ${esc(p6('superseded'))}` : ''}</p></li>`).join('')}</ol>` : `<p class="muted text-sm">${esc(p6('noHistory'))}</p>`;
    const context = [[label('course'), `<a class="text-primary" href="${courseLink(q.course_id)}" dir="auto">${esc(L(q.course_title))}</a>`], [label('lesson'), q.lesson_title ? `<span dir="auto">${esc(L(q.lesson_title))}</span>` : esc(label('noLesson'))], [label('learner'), esc(L(q.student_name))], [label('owner'), esc(L(d.owner))]];
    return pageHeader({ title: L(q.subject), subtitle: L(q.course_title), breadcrumbs: [{ label: t('route./assistant/inbox'), href: '#/assistant/inbox' }, { label: L(q.subject) }] })
      + `<div class="flex-row mb-6">${badge(q.state, { domain: 'conversation' })}${chip(t('p4.kind.' + q.kind), 'neutral', q.kind === 'lesson_qa' ? 'helpCircle' : 'lock')}${chip(label('assignedToYou'), 'info', 'user')}</div>
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]"><section class="min-w-0 stack" aria-labelledby="thread-title"><h2 id="thread-title" class="sr-only">${esc(t('p4.messages'))}</h2><ol class="stack">${messages}</ol>
      <form class="panel stack" data-action="assistant.reply" data-id="${esc(q.id)}" novalidate><h3 class="text-base">${esc(p6('publicReply'))}</h3>${formField({ id: 'reply-text', name: 'text', label: p6('replyLabel'), type: 'textarea', rows: 3, required: true, value: fv(replyForm, 'text'), hint: p6('replyHint'), error: fe(replyForm, 'text') })}<div class="flex-row">${submit('sendReply')}</div></form>
      <form class="panel stack msg-internal" data-action="assistant.note" data-id="${esc(q.id)}" novalidate><h3 class="text-base flex items-center gap-2">${icon('lock', { size: 16 })}<span>${esc(p6('internalNote'))}</span></h3>${formField({ id: 'note-text', name: 'text', label: p6('noteLabel'), type: 'textarea', rows: 2, required: true, value: fv(noteForm, 'text'), hint: p6('noteHint'), error: fe(noteForm, 'text') })}<div class="flex-row">${submit('addNote', 'secondary')}</div></form></section>
      <aside class="stack min-w-0"><section class="panel stack" aria-labelledby="status-title"><h2 id="status-title" class="text-lg">${esc(p6('statusTitle'))}</h2>${statusHint(q, d.owner)}${q.next.length ? `<div class="flex-row">${q.next.map(s => statusButton(q, s, statusText(s, d.owner))).join('')}</div>` : ''}${d.reported.has('conversation:' + q.id) ? chip(t('p4.reported'), 'warning', 'flag') : reportButton(q.id)}</section>
      <section class="panel stack" aria-labelledby="context-title"><h2 id="context-title" class="text-lg">${esc(label('context'))}</h2><dl class="meta-list">${context.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join('')}</dl><p class="text-xs muted">${esc(label('noContactData'))}</p></section>
      <section class="panel stack" aria-labelledby="trail-title"><h2 id="trail-title" class="text-lg">${esc(p6('auditTrail'))}</h2>${trail}</section></aside></div>${reportDialog()}`;
  },
};

// ---------------------------------------------------------------- lesson Q&A
function qaCard(q, reported) {
  const f = formState('areply:' + q.id);
  const answer = q.state === 'resolved' ? `<p class="text-sm muted">${esc(p6('resolvedHint'))}</p>` : `<form class="stack" data-action="assistant.reply" data-id="${esc(q.id)}" novalidate>${formField({ id: 'qa-answer-' + q.id, name: 'text', label: label('answer'), type: 'textarea', rows: 2, required: true, value: fv(f, 'text'), hint: p6('replyHint'), error: fe(f, 'text') })}<div class="flex-row">${submit('sendReply')}${q.next.includes('escalated') ? statusButton(q, 'escalated', label('escalate')) : ''}</div></form>`;
  return `<li class="panel stack"><div class="flex items-start justify-between gap-3 flex-wrap"><p class="font-semibold min-w-0" dir="auto"><a class="hover:text-primary" href="${threadLink(q.id)}">${esc(L(q.subject))}</a></p>${badge(q.state, { domain: 'conversation' })}</div><p class="text-sm muted">${esc(L(q.student_name))} · ${esc(t('p4.messagesCount', { count: q.message_count }))} · ${when(q.last_message_at)}</p>${q.last_text ? `<blockquote class="text-sm rounded-xl bg-sand p-3 clamp-2" dir="auto">${esc(q.last_text)}</blockquote>` : ''}${answer}<div class="flex-row border-t border-border pt-3">${button({ label: p6('openThread'), href: threadLink(q.id), variant: 'ghost' })}${reported.has('conversation:' + q.id) ? chip(t('p4.reported'), 'warning', 'flag') : reportButton(q.id)}</div></li>`;
}
export const qa = {
  render() {
    const d = select('assistant.qa');
    const header = pageHeader({ title: t('route./assistant/qa'), subtitle: label('qaIntro') });
    if (!d.courses.length) return header + noAccess();
    const sections = d.courses.map(c => {
      const groups = new Map();
      for (const q of c.questions) { const key = q.lesson_id ?? ''; if (!groups.has(key)) groups.set(key, { title: q.lesson_title, rows: [] }); groups.get(key).rows.push(q); }
      const body = groups.size ? [...groups.values()].map((g, i) => `<div class="stack"><h3 class="text-base flex items-center gap-2" id="qa-${esc(c.id)}-${i}">${icon('book', { size: 16 })}<span dir="auto">${esc(g.title ? L(g.title) : label('noLesson'))}</span></h3><ul class="stack" aria-labelledby="qa-${esc(c.id)}-${i}">${g.rows.map(q => qaCard(q, d.reported)).join('')}</ul></div>`).join('') : `<p class="muted">${esc(label('qaEmpty'))}</p>`;
      return `<section class="stack mt-6" aria-labelledby="qa-${esc(c.id)}">${sectionTitle('qa-' + esc(c.id), L(c.title), button({ label: label('openWorkspace'), href: courseLink(c.id), variant: 'ghost' }))}${body}</section>`;
    }).join('');
    return header + notice({ message: label('qaScope') }) + sections + reportDialog();
  },
};

// ---------------------------------------------------------------- tasks
function gradeCard(x) {
  const form = formState('agrade:' + x.id), released = x.state === 'released';
  const gradeForm = released ? '' : `<form class="grid gap-3 sm:grid-cols-[120px_minmax(0,1fr)_auto] items-end" data-action="assistant.grade" data-id="${esc(x.id)}" novalidate>${formField({ id: 'score-' + x.id, name: 'score', label: p6('scoreOutOf', { max: x.assignment.max_score }), type: 'number', min: 0, max: x.assignment.max_score, step: 1, required: true, value: fv(form, 'score', x.grade?.score ?? ''), error: fe(form, 'score') })}${formField({ id: 'feedback-' + x.id, name: 'feedback', label: p6('feedback'), required: true, value: fv(form, 'feedback', x.grade?.feedback ?? ''), error: fe(form, 'feedback') })}<div>${submit(x.grade ? 'updateGrade' : 'saveGrade', 'secondary')}</div></form>`;
  const release = x.state === 'graded' ? `<div class="flex-row"><button type="button" class="btn btn-primary" data-action="assistant.release" data-id="${esc(x.id)}">${icon('upload', { size: 16 })}<span>${esc(p6('releaseResult'))}</span></button><span class="text-sm muted">${esc(p6('releaseNote'))}</span></div>` : released ? `<p class="text-sm">${chip(p6('releasedOn', { date: day(x.grade?.released_at) }), 'success', 'checkCircle')}</p>` : '';
  return `<li class="panel stack"><div class="flex items-start justify-between gap-3 flex-wrap"><div class="flex items-center gap-3 min-w-0">${avatar(x.student, { size: 36 })}<div class="min-w-0"><p class="font-semibold">${esc(L(x.student.name))}</p><p class="text-sm muted" dir="auto">${esc(L(x.assignment.title))} · ${when(x.submitted_at)}</p></div></div><div class="flex-row">${badge(x.state, { domain: 'submission' })}${x.grade ? chip(`${x.grade.score} / ${x.assignment.max_score}`, 'neutral', 'chart') : ''}</div></div><p class="text-sm whitespace-pre-line rounded-xl bg-sand p-3" dir="auto">${esc(x.text)}</p>${x.filename ? `<p class="text-sm">${icon('fileText', { size: 16 })} <bdi>${esc(x.filename)}</bdi></p>` : ''}${x.grade?.grader ? `<p class="text-xs muted">${esc(label('gradedBy', { name: L(x.grade.grader) }))}</p>` : ''}${gradeForm}${release}</li>`;
}
function taskSection(c, kind) {
  const head = `<div class="flex items-center justify-between gap-3 flex-wrap"><h2 id="tasks-${esc(c.id)}" class="text-xl" dir="auto">${esc(L(c.title))}</h2>${chip(c.allowed ? label('granted') + ' · ' + p6('cap.' + c.capability) : label('notGranted') + ' · ' + p6('cap.' + c.capability), c.allowed ? 'success' : 'neutral', c.allowed ? 'check' : 'lock')}</div>`;
  if (!c.allowed) return `<section class="panel stack" aria-labelledby="tasks-${esc(c.id)}">${head}${capDenied(c.capability)}</section>`;
  const editor = x => kind === 'content' && x.target && x.next.length ? (c.contentLocked ? notice({ message: t(c.contentLocked), tone: 'warning' }) : `<details class="rounded-xl border border-border p-3" ${hasErrors(formState('alesson:' + x.target.id)) ? 'open' : ''}><summary class="text-sm font-medium text-primary cursor-pointer min-h-11 flex items-center gap-2">${icon('edit', { size: 16 })}<span>${esc(label('editLesson'))}</span></summary>${lessonForm(x.target, 'task')}</details>`) : '';
  const list = c.tasks.length ? `<ul class="stack">${c.tasks.map(x => taskCard(x, 'h3', editor(x))).join('')}</ul>` : `<p class="muted text-sm">${esc(label('noTasksHere'))}</p>`;
  const subs = kind === 'grading' ? `<h3 class="text-lg mt-2">${esc(label('submissions'))}</h3><p class="text-sm muted">${esc(p6('gradingNote'))}</p>${c.submissions.length ? `<ul class="stack">${c.submissions.map(gradeCard).join('')}</ul>` : `<p class="muted">${esc(p6('noSubmissions'))}</p>`}` : '';
  return `<section class="panel stack" aria-labelledby="tasks-${esc(c.id)}">${head}${list}${subs}</section>`;
}
export const tasks = {
  render(ctx) {
    const d = select('assistant.tasks'), tab = TASK_TABS.includes(ctx.query.get('tab')) ? ctx.query.get('tab') : 'grading';
    const header = pageHeader({ title: t('route./assistant/tasks'), subtitle: label('tasksIntro') });
    if (!d.grading.length) return header + noAccess();
    const open = kind => d[kind].reduce((n, c) => n + c.tasks.filter(x => x.state !== 'done').length, 0);
    const nav = tabs(TASK_TABS.map(id => ({ id, label: label('tasksTab.' + id), href: '#/assistant/tasks?tab=' + id, count: open(id) })), tab, { label: label('tasksTabs'), id: 'tasks-tabs' });
    return header + nav + `<section class="stack mt-6" aria-labelledby="tasks-tabs-${tab}">${notice({ message: label('tasksNote.' + tab) })}${d[tab].map(c => taskSection(c, tab)).join('')}</section>`;
  },
};

// ---------------------------------------------------------------- notifications and settings
export const notifications = {
  render(ctx) {
    const filter = ctx.query.get('filter') === 'unread' ? 'unread' : 'all', all = [...select('notifications')].sort((a, b) => b.created_at.localeCompare(a.created_at)), unread = all.filter(n => !n.read_at), rows = filter === 'unread' ? unread : all;
    const nav = tabs([{ id: 'all', label: t('p4.filterAll'), href: '#/assistant/notifications', count: all.length }, { id: 'unread', label: t('p4.filterUnread'), href: '#/assistant/notifications?filter=unread', count: unread.length }], filter, { label: t('p4.notificationFilter') });
    const list = rows.length ? `<ul class="stack mt-6">${rows.map(n => `<li class="panel notification-row ${n.read_at ? '' : 'is-unread'}"><span class="dot ${n.read_at ? 'dot-read' : ''}" aria-hidden="true"></span><div class="min-w-0 flex-1"><div class="flex items-start justify-between gap-3 flex-wrap"><h2 class="text-base">${esc(L(n.title))}</h2><span class="text-xs muted">${when(n.created_at)}</span></div><p class="text-sm muted mt-1">${esc(L(n.body))}</p><div class="flex-row mt-3">${n.read_at ? chip(t('status.delivery.read'), 'neutral', 'check') : chip(t('p4.unreadChip'), 'warning', 'bell')}${safeHash(n.href) ? button({ label: t('p4.openNotice'), href: n.href, variant: 'secondary' }) : ''}${n.read_at ? '' : `<button type="button" class="btn btn-ghost" data-action="assistant.markRead" data-id="${esc(n.id)}">${esc(t('p4.markRead'))}</button>`}</div></div></li>`).join('')}</ul>` : `<div class="mt-6">${emptyState({ icon: 'bell', title: t(filter === 'unread' ? 'p4.noUnread' : 'p4.noNotifications') })}</div>`;
    return pageHeader({ title: t('route./assistant/notifications'), subtitle: label('notificationsIntro'), actions: button({ label: t('p4.markAllRead'), action: 'assistant.markAllRead', variant: 'secondary', disabled: !unread.length, disabledReason: t('p4.noUnread') }) }) + nav + list;
  },
};
export const settings = {
  render(ctx) {
    const s = select('assistant.settings'); if (!s) return fallback('resourceDenied', ctx);
    const prefs = select('preferences');
    const profile = `<section class="panel flex flex-col sm:flex-row sm:items-center gap-4">${avatar(s.user, { size: 72 })}<div class="min-w-0 flex-1"><h2 class="text-xl">${esc(L(s.user.name))}</h2><div class="flex-row mt-1">${chip(p6('teamRole.' + (s.member?.team_role ?? 'assistant')), 'neutral', 'user')}${badge(s.active ? 'active' : 'deactivated', { domain: 'account' })}</div><p class="text-sm muted mt-2">${esc(s.active ? label('ownerLine', { name: L(s.owner) }) : label('membershipEnded'))}</p></div></section>`;
    const account = `<section class="panel stack"><h2 class="text-lg">${esc(t('p4.accountInfo'))}</h2><dl class="meta-list"><div><dt>${esc(t('p2.name'))}</dt><dd>${esc(L(s.user.name))}</dd></div><div><dt>${esc(t('p2.email'))}</dt><dd><bdi>${esc(s.user.email)}</bdi></dd></div>${s.member ? `<div><dt>${esc(p6('memberSince'))}</dt><dd><bdi>${esc(day(s.member.since))}</bdi></dd></div><div><dt>${esc(p6('expires'))}</dt><dd><bdi>${esc(day(s.member.expires_at))}</bdi></dd></div>` : ''}</dl>${notice({ message: label('nameNote') })}</section>`;
    const display = `<section class="panel stack"><h2 class="text-lg">${esc(t('p4.displayPrefs'))}</h2><p class="font-medium">${esc(t('language'))}</p><div class="flex gap-2">${choiceButtons('lang', 'ar', 'العربية', prefs)}${choiceButtons('lang', 'en', 'English', prefs)}</div><p class="font-medium">${esc(t('theme'))}</p><div class="flex gap-2">${choiceButtons('theme', 'light', t('light'), prefs)}${choiceButtons('theme', 'dark', t('dark'), prefs)}</div></section>`;
    const notify = `<form class="panel stack" data-action="assistant.savePrefs"><h2 class="text-lg">${esc(t('p4.notifyPrefs'))}</h2><p class="text-sm muted">${esc(t('p4.notifyNote'))}</p>${ASSISTANT_PREFS.map(k => formField({ id: 'apref-' + k, name: k, label: label('pref.' + k), type: 'checkbox', value: s.prefs[k] })).join('')}<div class="flex-row">${submit('savePrefs')}</div></form>`;
    const mark = (row, cap) => row.capabilities.includes(cap) ? chip(label('granted'), 'success', 'check') : chip(label('notGranted'), 'neutral', 'lock');
    const caps = `<section class="panel stack min-w-0"><h2 class="text-lg">${esc(label('assignedCapabilities'))}</h2><p class="text-sm muted">${esc(label('capsReadOnly'))}</p>${table([{ key: 'title', label: label('course'), render: r => `<span dir="auto">${esc(L(r.title))}</span>` }, ...TEAM_CAPABILITIES.map(cap => ({ key: cap, label: p6('cap.' + cap), render: r => mark(r, cap) }))], s.courses, { caption: label('assignedCapabilities'), empty: `<p class="muted">${esc(label('noAccessBody'))}</p>` })}${notice({ title: label('noEscalationTitle'), message: label('noEscalation'), tone: 'warning' })}</section>`;
    return pageHeader({ title: t('route./assistant/settings'), subtitle: label('settingsIntro') }) + `<div class="stack max-w-4xl">${profile}${account}${caps}${display}${notify}</div>`;
  },
};

// ---------------------------------------------------------------- actions
function done(r, key) { showToast(r.ok ? t(key) : t(Object.values(r.fieldErrors ?? {})[0] ?? r.errorKey), { tone: r.ok ? 'success' : 'error' }); return r.ok; }
export function registerActions(register) {
  register('assistant', {
    reply: onSubmit((_e, el, ctx, fd) => formAction(ctx, 'areply:' + el.dataset.id, 'conversation.reply', { conversationId: el.dataset.id, text: fd.get('text') }, 'replySent', strings(fd))),
    note: onSubmit((_e, el, ctx, fd) => formAction(ctx, 'anote:' + el.dataset.id, 'conversation.note', { conversationId: el.dataset.id, text: fd.get('text') }, 'noteAdded', strings(fd))),
    setStatus: (_e, el, ctx) => done(ctx.dispatch('conversation.setStatus', { conversationId: el.dataset.id, status: el.dataset.value }), el.dataset.value === 'escalated' ? 'p7.escalated' : 'p6.statusChanged'),
    reportOpen: (_e, el) => { const dialog = document.getElementById('assistant-report'); if (!dialog) return; dialog.querySelector('form').reset(); dialog.querySelector('input[name="conversationId"]').value = el.dataset.conversationId ?? ''; dialog.querySelector('input[name="messageId"]').value = el.dataset.id ?? ''; openOverlay('assistant-report'); },
    report: onSubmit((_e, el, ctx, fd) => { const r = ctx.dispatch('conversation.report', { conversationId: fd.get('conversationId'), messageId: fd.get('messageId') || null, reason: fd.get('reason') }); if (r.ok) closeOverlay('assistant-report'); done(r, r.data?.existing ? 'p6.alreadyReported' : 'p6.reportSent'); }),
    grade: onSubmit((_e, el, ctx, fd) => formAction(ctx, 'agrade:' + el.dataset.id, 'submission.grade', { submissionId: el.dataset.id, ...strings(fd) }, 'graded', strings(fd))),
    release: (_e, el, ctx) => done(ctx.dispatch('submission.release', { submissionId: el.dataset.id }), 'p6.released'),
    saveLesson: onSubmit((_e, el, ctx, fd) => formAction(ctx, 'alesson:' + el.dataset.id, 'lesson.update', { lessonId: el.dataset.id, ...strings(fd) }, 'lessonSaved', strings(fd))),
    taskState: (_e, el, ctx) => done(ctx.dispatch('task.setState', { taskId: el.dataset.id, state: el.dataset.value }), el.dataset.value === 'done' ? 'p7.taskDone' : 'p7.taskStarted'),
    savePrefs: onSubmit((_e, el, ctx, fd) => done(ctx.dispatch('assistant.updateSettings', { prefs: Object.fromEntries(ASSISTANT_PREFS.map(k => [k, fd.get(k) === 'on'])) }), 'p6.prefsSaved')),
    markRead: (_e, el, ctx) => ctx.dispatch('notifications.markRead', { id: el.dataset.id }),
    markAllRead: (_e, _el, ctx) => done(ctx.dispatch('notifications.markAllRead', {}), 'p6.allRead'),
  });
}
