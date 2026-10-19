import { t, L, esc, money, dateTime } from '../core/i18n.js';
import { select, GUARDIAN_PREFS, LINK_SCOPES, LINK_RELATIONSHIPS } from '../core/store.js';
import { pageHeader, statCard, badge, tabs, table, emptyState, notice, button, avatar, formField, progressBar, progressRing, modal, showToast, closeOverlay } from '../core/ui.js';
import { icon } from '../core/icons.js';
import { courseCover } from '../core/media.js';
import { mountCharts } from '../core/charts.js';
import { fallback } from '../core/layout.js';
import { results } from './public.js';

// Guardian portal (SPEC §5 Guardian). Every view reads `guardian.*` selectors that re-check the verified
// link and its scopes on each render; unverified requests stay status-only and never show learner details.
const label = (key, params) => t('p5.' + key, params);
const p4 = (key, params) => t('p4.' + key, params);
const enc = encodeURIComponent;
const childLink = (id, tab = null) => '#/guardian/child/' + enc(id) + (tab ? '?tab=' + tab : '');
const exploreFor = id => '#/guardian/explore?child=' + enc(id);
function url(ctx, changes = {}, path = ctx.path) { const q = new URLSearchParams(ctx.query); for (const [k, v] of Object.entries(changes)) { if (v == null || v === '') q.delete(k); else q.set(k, v); } return '#' + path + (q.size ? '?' + q : ''); }
const fmt = (iso, opts) => new Intl.DateTimeFormat(select('preferences').lang === 'ar' ? 'ar-OM' : 'en-OM', { timeZone: 'Asia/Muscat', ...opts }).format(new Date(iso));
const day = iso => fmt(iso, { dateStyle: 'medium' });
const when = iso => `<bdi>${esc(dateTime(iso))}</bdi>`;
const safeHash = href => typeof href === 'string' && /^#\/[\w\-/?=&.]*$/.test(href);
const chip = (text, tone = 'neutral', iconName = null) => `<span class="chip text-sm tone-${tone}">${iconName ? icon(iconName, { size: 14 }) : ''}<span>${esc(text)}</span></span>`;
const sectionTitle = (id, title, extra = '') => `<div class="flex items-center justify-between gap-3 flex-wrap mb-4"><h2 id="${id}" class="text-xl">${esc(title)}</h2>${extra}</div>`;
const submit = (key, variant = 'primary') => `<button type="submit" class="btn btn-${variant}">${esc(label(key))}</button>`;
const denied = (status, ctx) => fallback(status === 'missing' ? 'missing' : 'resourceDenied', ctx);
const firstName = person => L(person.name).split(' ')[0];
const gradeOf = child => L(child.grade?.name);
const fieldError = (form, name) => form.fieldErrors[name] ? t(form.fieldErrors[name]) : '';
const scopeChips = scopes => `<ul class="flex flex-wrap gap-2" aria-label="${esc(label('scopes'))}">${LINK_SCOPES.map(k => `<li>${scopes.includes(k) ? chip(label('scope.' + k), 'success', 'check') : chip(label('scopeOff', { scope: label('scope.' + k) }), 'neutral', 'x')}</li>`).join('')}</ul>`;
const scopeMissing = scope => emptyState({ icon: 'lock', title: label('scopeMissing', { scope: label('scope.' + scope) }), description: label('scopeMissingBody'), action: { label: label('managePermissions'), href: '#/guardian/settings?tab=links' } });
const joinList = items => items.join(select('preferences').lang === 'ar' ? '، ' : ', ');
const summaryNote = () => `<p class="text-sm muted flex items-center gap-2">${icon('shield', { size: 16 })}<span>${esc(label('summaryOnly'))}</span></p>`;
const orderStatus = d => badge(d.order.state, { domain: 'order' });
const orderItems = d => d.items.map(i => `<span class="block min-w-0"><span class="font-medium">${esc(L(i.title_snapshot))}</span> <span class="text-sm muted">· ${esc(L(i.beneficiary_name))}</span></span>`).join('');
const recoverable = d => ['draft', 'pending', 'failed'].includes(d.order.state);
const orderActions = d => `<div class="flex-row">${recoverable(d) ? button({ label: label(d.order.state === 'failed' ? 'retryPayment' : 'completePayment'), href: '#/checkout/order/' + enc(d.order.id) + '/provider' }) : ''}${button({ label: label('receipt'), href: '#/checkout/order/' + enc(d.order.id) + '/receipt', variant: 'secondary' })}${button({ label: label('result'), href: '#/checkout/order/' + enc(d.order.id) + '/result', variant: 'ghost' })}</div>`;

// ---------------------------------------------------------------- shared child pieces
function childHeader(c, size = 56, headingTag = 'h2') {
  return `<div class="flex items-center gap-4 min-w-0">${avatar(c.child, { size })}<div class="min-w-0 flex-1"><${headingTag} class="text-lg"><a class="hover:text-primary" href="${esc(childLink(c.child.id))}">${esc(L(c.child.name))}</a></${headingTag}><p class="text-sm muted">${esc(gradeOf(c.child))} · ${esc(L(c.link.relationship))}</p></div>${badge('verified', { domain: 'guardian_link' })}</div>`;
}
function summaryCard(c) {
  const progress = c.has.progress
    ? `<div class="flex items-center gap-5 min-w-0">${progressRing(c.percent, { label: label('overallProgress'), size: 88 })}<dl class="grid gap-2 flex-1 min-w-0"><div><dt class="text-sm muted">${esc(label('activeCourses'))}</dt><dd class="text-xl font-semibold"><bdi>${c.courses.length}</bdi></dd></div><div><dt class="text-sm muted">${esc(label('lessonsComplete'))}</dt><dd class="font-medium"><bdi>${c.done} / ${c.total}</bdi></dd></div></dl></div>`
    : `<p class="text-sm muted">${esc(label('scopeMissing', { scope: label('scope.progress') }))}</p>`;
  const live = !c.has.attendance ? esc(label('scopeMissing', { scope: label('scope.attendance') }))
    : c.next_live ? `<span class="block font-medium">${esc(L(c.next_live.title))}</span><span class="block text-sm muted"><bdi>${esc(dateTime(c.next_live.starts_at))}</bdi> ${esc(p4('muscat'))}</span>` : esc(label('noLive'));
  const result = !c.has.results ? esc(label('scopeMissing', { scope: label('scope.results') }))
    : c.latest ? `<span class="block font-medium">${esc(L(c.latest.title))}</span><span class="block text-sm muted"><bdi>${esc(c.latest.score)} / ${esc(c.latest.max)}</bdi> · <bdi>${esc(day(c.latest.at))}</bdi></span>` : esc(label('noResults'));
  const tile = (iconName, title, body, tab) => `<a class="rounded-xl border border-border p-3 min-w-0 block hover:border-primary" href="${esc(childLink(c.child.id, tab))}"><span class="eyebrow flex items-center gap-2">${icon(iconName, { size: 16 })}<span>${esc(title)}</span></span><span class="block mt-2">${body}</span></a>`;
  return `<article class="panel stack min-w-0" aria-label="${esc(L(c.child.name))}">${childHeader(c)}${progress}<div class="grid gap-3 sm:grid-cols-2">${tile('calendar', label('nextLive'), live, 'live')}${tile('chart', label('latestResult'), result, 'results')}</div><div class="flex-row border-t border-border pt-4">${button({ label: label('openChild', { name: firstName(c.child) }), href: childLink(c.child.id) })}${c.has.purchase ? button({ label: label('buyFor', { name: firstName(c.child) }), href: exploreFor(c.child.id), variant: 'secondary' }) : ''}</div></article>`;
}
function requestsLink(r) {
  if (!r.total) return '';
  const parts = ['requested', 'pending_verification', 'rejected', 'revoked'].filter(k => r[k]).map(k => `${t('status.guardian_link.' + k)} <bdi>(${r[k]})</bdi>`).join(' · ');
  return `<a class="panel card-link flex items-center gap-4 min-w-0 mb-6" href="#/guardian/children"><span class="work-icon">${icon('clock', { size: 20 })}</span><span class="min-w-0 flex-1"><span class="block font-semibold">${esc(label('requestsCount', { count: r.total }))}</span><span class="block text-sm muted">${parts}</span></span>${icon('chevronEnd', { size: 18 })}</a>`;
}

// ---------------------------------------------------------------- dashboard
export const dashboard = {
  render(ctx) {
    const d = select('guardian.dashboard'); if (!d) return fallback('resourceDenied', ctx);
    const unread = select('notifications.count');
    const header = pageHeader({ title: label('welcome', { name: firstName(d.guardian) }), subtitle: `${label('dashIntro')} · ${t('footer.demoDate')}`, actions: button({ label: label('linkChild'), href: '#/guardian/children/link', variant: 'secondary' }) + button({ label: label('exploreCta'), href: '#/guardian/explore' }) });
    if (!d.children.length) return header + requestsLink(d.requests) + emptyState({ icon: 'users', title: label('noChildren'), description: label('noChildrenBody'), action: { label: label('linkChild'), href: '#/guardian/children/link' } });
    const focus = d.children.find(c => c.child.id === ctx.query.get('child')) ?? null, shown = focus ? [focus] : d.children;
    const switcher = d.children.length > 1 ? `<div class="mb-6">${tabs([{ id: 'all', label: label('allChildren'), href: url(ctx, { child: null }) }, ...d.children.map(c => ({ id: c.child.id, label: L(c.child.name), href: url(ctx, { child: c.child.id }) }))], focus?.child.id ?? 'all', { label: label('childSwitcher'), id: 'child-switch' })}</div>` : '';
    const stats = `<div class="grid gap-4 grid-cols-1 sm:grid-cols-3 mb-6">${statCard({ label: label('statChildren'), value: d.children.length, icon: 'users' })}${statCard({ label: label('statCourses'), value: d.children.reduce((n, c) => n + c.courses.length, 0), icon: 'book' })}${statCard({ label: label('statUnread'), value: unread, icon: 'bell' })}</div>`;
    const events = d.upcoming.filter(x => !focus || x.child.id === focus.child.id);
    const upcoming = `<section class="panel" aria-labelledby="upcoming-title">${sectionTitle('upcoming-title', label('upcoming'))}<p class="text-sm muted mb-3">${esc(p4('muscatNote'))}</p>${events.length ? `<ul class="space-y-2">${events.slice(0, 6).map(x => `<li><a class="work-row" href="${esc(childLink(x.child.id, x.kind === 'live' ? 'live' : 'results'))}"><span class="work-icon">${icon(x.kind === 'live' ? 'calendar' : 'clipboard', { size: 18 })}</span><span class="min-w-0 flex-1"><span class="block font-medium">${esc(L(x.title))}</span><span class="block text-sm muted">${esc(L(x.course_title))}</span><span class="flex-row mt-1">${chip(firstName(x.child), 'neutral', 'user')}${x.kind === 'live' ? badge(x.status, { domain: 'live' }) : chip(label('dueWork'), 'warning', 'clock')}</span></span><span class="text-sm text-end shrink-0"><bdi>${esc(day(x.at))}</bdi></span></a></li>`).join('')}</ul>` : `<p class="muted">${esc(label('noUpcoming'))}</p>`}</section>`;
    const purchases = `<section class="panel" aria-labelledby="purchases-title">${sectionTitle('purchases-title', label('recentPurchases'), button({ label: t('all'), href: '#/guardian/orders', variant: 'ghost' }))}${d.orders.length ? `<ul class="space-y-3">${d.orders.map(o => `<li class="rounded-xl border border-border p-3 min-w-0"><div class="flex items-start justify-between gap-3 flex-wrap"><span class="text-sm muted"><bdi>${esc(o.order.id)}</bdi> · <bdi>${esc(day(o.order.created_at))}</bdi></span>${orderStatus(o)}</div><div class="mt-2">${orderItems(o)}</div><div class="flex items-center justify-between gap-3 flex-wrap mt-2"><strong><bdi>${esc(money(o.order.total_baisa))}</bdi></strong><a class="text-sm font-medium text-primary inline-flex items-center gap-1 min-h-11" href="#/checkout/order/${esc(enc(o.order.id))}/${recoverable(o) ? 'provider' : 'receipt'}">${esc(label(recoverable(o) ? (o.order.state === 'failed' ? 'retryPayment' : 'completePayment') : 'receipt'))}${icon('chevronEnd', { size: 16 })}</a></div></li>`).join('')}</ul>` : `<p class="muted">${esc(label('noOrders'))}</p>`}</section>`;
    return header + requestsLink(d.requests) + stats + switcher + `<div class="dash-grid"><div class="stack min-w-0">${shown.map(summaryCard).join('')}</div><div class="stack min-w-0">${upcoming}${purchases}</div></div>`;
  },
};

// ---------------------------------------------------------------- children and link requests
export const children = {
  render(ctx) {
    const d = select('guardian.childrenPage'); if (!d) return fallback('resourceDenied', ctx);
    const tiles = d.children.length ? `<div class="grid-cards grid-three">${d.children.map(c => `<article class="panel stack min-w-0">${childHeader(c, 48, 'h3')}${scopeChips(c.link.scopes)}<p class="text-sm muted">${esc(label('verifiedOn', { date: day(c.link.verified_at) }))}</p><div class="flex-row mt-auto">${button({ label: label('openChild', { name: firstName(c.child) }), href: childLink(c.child.id) })}</div></article>`).join('')}</div>`
      : emptyState({ icon: 'users', title: label('noChildren'), description: label('noChildrenBody'), action: { label: label('linkChild'), href: '#/guardian/children/link' } });
    const requests = table([
      { key: 'id', label: label('request'), render: r => `<bdi>${esc(r.id)}</bdi>` },
      { key: 'relationship', label: label('relationship'), render: r => esc(L(r.relationship)) },
      { key: 'requested_at', label: label('requestedOn'), render: r => `<bdi>${esc(day(r.requested_at))}</bdi>` },
      { key: 'state', label: t('p3.status'), render: r => badge(r.state, { domain: 'guardian_link' }) },
    ], d.requests, { caption: label('requestsTitle'), actions: r => ['rejected', 'revoked'].includes(r.state) ? button({ label: label('newRequest'), href: '#/guardian/children/link', variant: 'secondary' }) : `<span class="text-sm muted">${esc(label('awaitingModeration'))}</span>`, empty: `<p class="muted">${esc(label('noRequests'))}</p>` });
    return pageHeader({ title: t('route./guardian/children'), subtitle: label('childrenIntro'), actions: button({ label: label('linkChild'), href: '#/guardian/children/link' }) })
      + `<section aria-labelledby="verified-title">${sectionTitle('verified-title', label('verifiedChildren'))}${tiles}</section>`
      + `<section class="mt-10" aria-labelledby="requests-title">${sectionTitle('requests-title', label('requestsTitle'))}${notice({ message: label('requestsNote') })}<div class="mt-4">${requests}</div></section>`;
  },
};

export const link = {
  render() {
    const form = select('form', { name: 'guardian-link' }), result = select('guardian.linkResult');
    const steps = `<section class="panel stack" aria-labelledby="how-title"><h2 id="how-title" class="text-lg">${esc(label('howTitle'))}</h2><ol class="steps">${[1, 2, 3].map(n => `<li class="step"><span class="step-number"><bdi>${n}</bdi></span><div class="min-w-0"><h3 class="text-base">${esc(label('how' + n))}</h3><p class="muted text-sm mt-1">${esc(label('how' + n + 'Body'))}</p></div></li>`).join('')}</ol>${notice({ message: label('noNameSearch') })}</section>`;
    let main;
    if (result) {
      const verified = result.state === 'verified';
      main = `<section class="panel stack" aria-labelledby="result-title"><div class="flex items-start gap-4 rounded-xl p-5 ${verified ? 'tone-success' : 'tone-warning'}">${icon(verified ? 'checkCircle' : 'clock', { size: 32, className: 'shrink-0' })}<div class="min-w-0"><h2 id="result-title" class="text-xl">${esc(label(verified ? 'alreadyLinked' : 'pendingTitle'))}</h2><p class="mt-1">${esc(label(verified ? 'alreadyLinkedBody' : result.reused ? 'reusedBody' : 'createdBody', { id: result.id }))}</p></div></div>
        <dl class="meta-list"><div><dt>${esc(label('request'))}</dt><dd><bdi>${esc(result.id)}</bdi></dd></div><div><dt>${esc(t('p3.status'))}</dt><dd>${badge(result.state, { domain: 'guardian_link' })}</dd></div><div><dt>${esc(label('relationship'))}</dt><dd>${esc(L(result.relationship))}</dd></div><div><dt>${esc(label('evidence'))}</dt><dd><bdi class="break-words">${esc(result.evidence_ref)}</bdi> · ${esc(label('synthetic'))}</dd></div><div><dt>${esc(label('requestedOn'))}</dt><dd><bdi>${esc(day(result.requested_at))}</bdi></dd></div></dl>
        ${verified ? '' : notice({ title: label('noAccessYet'), message: label('noAccessYetBody'), tone: 'warning' })}
        <div class="flex-row">${button({ label: label('backToChildren'), href: '#/guardian/children' })}${button({ label: label('linkAnother'), action: 'guardian.linkAnother', variant: 'secondary' })}</div></section>`;
    } else {
      main = `<form class="panel stack" data-action="guardian.link" novalidate><h2 class="text-lg">${esc(label('linkFormTitle'))}</h2><p class="text-sm muted">${esc(label('linkFormIntro'))}</p>
        ${formField({ id: 'link-code', name: 'code', label: label('code'), value: form.values.code ?? '', required: true, hint: label('codeHint'), error: fieldError(form, 'code') })}
        ${formField({ id: 'link-relationship', name: 'relationship', label: label('relationship'), type: 'select', value: form.values.relationship ?? '', required: true, options: [{ value: '', label: label('chooseRelationship') }, ...LINK_RELATIONSHIPS.map(value => ({ value, label: label('rel.' + value) }))], error: fieldError(form, 'relationship') })}
        ${formField({ id: 'link-consent', name: 'consent', label: label('consent'), type: 'checkbox', value: false, required: true, error: fieldError(form, 'consent') })}
        <div class="flex-row">${submit('submitLink')}${button({ label: label('backToChildren'), href: '#/guardian/children', variant: 'ghost' })}</div></form>`;
    }
    return pageHeader({ title: t('route./guardian/children/link'), subtitle: label('linkIntro'), breadcrumbs: [{ label: t('route./guardian/children'), href: '#/guardian/children' }, { label: t('route./guardian/children/link') }] })
      + `<div class="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]"><div class="min-w-0">${main}</div><div class="min-w-0">${steps}</div></div>`;
  },
};

// ---------------------------------------------------------------- child dashboard
const CHILD_TABS = ['courses', 'results', 'live', 'activity'];
function coursesTab(c) {
  if (!c.has.progress) return scopeMissing('progress');
  if (!c.courses.length) return emptyState({ icon: 'book', title: label('noCourses'), description: label('noCoursesBody'), action: c.has.purchase ? { label: label('buyFor', { name: firstName(c.child) }), href: exploreFor(c.child.id) } : null });
  return `<div class="grid-cards grid-three">${c.courses.map(r => `<article class="panel course-card flex flex-col min-w-0"><img class="cover" src="${courseCover(r.course.id, r.course.subject?.id)}" alt=""><div class="p-4 flex flex-col flex-1 min-w-0 gap-3"><p class="text-xs font-semibold text-primary">${esc(L(r.course.grade?.name))} · ${esc(L(r.course.subject?.name))}</p><h3 class="text-base">${esc(L(r.course.title))}</h3><p class="text-sm muted">${esc(L(r.course.teacher?.name))}</p>${r.archived ? `<div class="flex-row">${chip(p4('archived'), 'info', 'clock')}</div>` : ''}${progressBar(r.percent, { label: p4('lessonsDone', { done: r.done, total: r.total }) })}<p class="text-sm muted">${r.next_title ? `${esc(p4('nextUp'))}: <span class="text-ink">${esc(L(r.next_title))}</span>` : esc(label('courseDone'))}</p><p class="text-xs muted mt-auto">${esc(label('lastActivity'))}: ${r.last_activity ? `<bdi>${esc(day(r.last_activity))}</bdi>` : esc(label('none'))} · ${esc(label('accessUntil', { date: day(r.access_end) }))}</p></div></article>`).join('')}</div>`;
}
function resultsTab(c) {
  if (!c.has.results) return scopeMissing('results');
  const titleCell = x => `<span class="block font-medium">${esc(L(x.title))}</span><span class="block text-sm muted">${esc(L(x.course_title))}</span>`;
  const released = table([{ key: 'title', label: label('item'), render: titleCell }, { key: 'kind', label: label('kind'), render: x => esc(p4(x.kind)) }, { key: 'score', label: p4('score'), render: x => `<strong><bdi>${esc(x.score)} / ${esc(x.max)}</bdi></strong>` }, { key: 'at', label: label('date'), render: x => `<bdi>${esc(day(x.at))}</bdi>` }], c.released.map(x => ({ ...x, id: x.kind + '-' + x.id })), { caption: label('releasedResults'), empty: `<p class="muted">${esc(label('noResults'))}</p>` });
  const work = table([{ key: 'title', label: label('item'), render: titleCell }, { key: 'due_at', label: p4('due'), render: a => `<bdi>${esc(day(a.due_at))}</bdi>${a.late ? ' ' + chip(p4('late'), 'danger', 'clock') : ''}` }, { key: 'state', label: t('p3.status'), render: a => badge(a.state, { domain: 'submission' }) }], c.assignments, { caption: label('tasksStatus'), empty: `<p class="muted">${esc(label('noTasks'))}</p>` });
  const quizzes = table([{ key: 'title', label: label('item'), render: titleCell }, { key: 'attempts', label: label('attempts'), render: q => `<bdi>${q.attempts} / ${q.limit}</bdi>` }, { key: 'best', label: label('bestScore'), render: q => `<bdi>${q.best}%</bdi> ${chip(label(q.passed ? 'passed' : 'notPassed'), q.passed ? 'success' : 'warning')}` }], c.quizzes, { caption: label('quizSummary'), empty: `<p class="muted">${esc(label('noQuizzes'))}</p>` });
  return notice({ message: label('releasedOnly') }) + `<div class="stack mt-6"><section class="panel min-w-0">${released}</section><div class="grid gap-6 lg:grid-cols-2"><section class="panel min-w-0">${work}</section><section class="panel min-w-0">${quizzes}</section></div></div>`;
}
function liveTab(c) {
  if (!c.has.attendance) return scopeMissing('attendance');
  const upcoming = c.upcoming.length ? `<ul class="stack">${c.upcoming.map(x => `<li class="panel session-card"><div class="date-tile" aria-hidden="true"><span>${esc(fmt(x.starts_at, { day: 'numeric' }))}</span><small>${esc(fmt(x.starts_at, { month: 'short' }))}</small></div><div class="min-w-0 flex-1 stack"><div class="flex items-start justify-between gap-3 flex-wrap"><h3 class="text-base">${esc(L(x.title))}</h3>${badge(x.status, { domain: 'live' })}</div><p class="text-sm muted">${esc(L(x.course_title))}</p><p class="text-sm"><bdi>${esc(dateTime(x.starts_at))}</bdi> ${esc(p4('muscat'))}</p>${x.attended === 'present' ? `<div class="flex-row">${chip(label('attendedChip'), 'success', 'check')}</div>` : ''}</div></li>`).join('')}</ul>` : `<p class="muted">${esc(label('noLive'))}</p>`;
  const history = table([{ key: 'title', label: label('session'), render: a => `<span class="block font-medium">${esc(L(a.title))}</span><span class="block text-sm muted">${esc(L(a.course_title))}</span>` }, { key: 'starts_at', label: label('date'), render: a => `<bdi>${esc(day(a.starts_at))}</bdi>` }, { key: 'status', label: label('attendance'), render: a => a.status === 'present' ? chip(label('present'), 'success', 'check') : chip(p4('absent'), 'neutral', 'x') }, { key: 'minutes', label: label('minutes'), align: 'end', render: a => `<bdi>${esc(a.minutes)}</bdi>` }], c.attendance, { caption: label('attendanceHistory'), empty: `<p class="muted">${esc(label('noAttendance'))}</p>` });
  return `<p class="text-sm muted mb-4">${esc(t('footer.demoDate'))} · ${esc(p4('muscatNote'))} · ${esc(label('noJoin'))}</p><div class="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"><section class="stack min-w-0" aria-labelledby="child-upcoming"><h2 id="child-upcoming" class="text-xl">${esc(label('upcomingLive'))}</h2>${upcoming}</section><section class="panel min-w-0" aria-labelledby="child-attendance"><h2 id="child-attendance" class="text-xl mb-2">${esc(label('attendanceHistory'))}</h2>${history}</section></div>`;
}
const weekLabel = w => p4('weekEnding', { date: fmt(w.end, { day: 'numeric', month: 'short' }) });
function activityTab(c) {
  if (!c.has.progress) return scopeMissing('progress');
  const lessons = c.weeks.reduce((n, w) => n + w.lessons, 0);
  const stats = `<div class="grid gap-4 grid-cols-1 sm:grid-cols-3">${statCard({ label: label('lessonsFourWeeks'), value: lessons, icon: 'checkCircle' })}${statCard({ label: label('present'), value: c.has.attendance ? c.present : '—', icon: 'calendar' })}${statCard({ label: label('releasedResults'), value: c.has.results ? c.released.length : '—', icon: 'chart' })}</div>`;
  const chart = `<figure class="panel min-w-0" aria-labelledby="child-activity-title"><p class="eyebrow">${esc(label('activityEyebrow'))}</p><h2 id="child-activity-title" class="text-xl mt-1">${esc(p4('activity'))}</h2><p class="muted text-sm mt-1">${esc(label('activitySub', { name: firstName(c.child) }))}</p><div class="chart-box mt-4"><canvas data-chart="child-activity" role="img" aria-label="${esc(label('activitySub', { name: firstName(c.child) }))}" aria-describedby="child-activity-summary"></canvas></div><figcaption class="mt-4"><p class="sr-only">${esc(p4('chartFallback'))}</p><ul id="child-activity-summary" class="cycle-summary">${c.weeks.map(w => `<li><span class="flex-1 min-w-0">${esc(weekLabel(w))}</span><span class="text-sm">${esc(p4('weekCounts', { lessons: w.lessons, assessments: w.assessments, live: w.live ?? '—' }))}</span></li>`).join('')}</ul></figcaption></figure>`;
  return `<div class="stack">${stats}${chart}${c.has.attendance ? '' : notice({ message: label('liveHidden') })}</div>`;
}
export const child = {
  render(ctx) {
    const c = select('guardian.child', { id: ctx.params.id }); if (c.status !== 'ok') return denied(c.status, ctx);
    const active = CHILD_TABS.includes(ctx.query.get('tab')) ? ctx.query.get('tab') : 'courses';
    const counts = { courses: c.courses.length, results: c.released.length, live: c.upcoming.length, activity: undefined };
    const nav = tabs(CHILD_TABS.map(id => ({ id, label: label('tab.' + id), href: childLink(c.child.id, id), count: counts[id] })), active, { label: label('childTabs'), id: 'child-tabs' });
    const body = { courses: coursesTab, results: resultsTab, live: liveTab, activity: activityTab }[active](c);
    const header = `<section class="panel flex flex-col sm:flex-row sm:items-center gap-4 mb-6 min-w-0">${avatar(c.child, { size: 72 })}<div class="min-w-0 flex-1 stack"><div><h1 tabindex="-1">${esc(L(c.child.name))}</h1><p class="muted mt-1">${esc(gradeOf(c.child))} · ${esc(L(c.link.relationship))} · ${esc(label('verifiedOn', { date: day(c.link.verified_at) }))}</p></div>${scopeChips(c.link.scopes)}</div>${c.has.progress ? progressRing(c.percent, { label: label('overallProgress'), size: 96 }) : ''}</section>`;
    const actions = `<div class="flex items-center justify-between gap-3 flex-wrap mb-6">${summaryNote()}<div class="flex-row">${c.has.purchase ? button({ label: label('buyFor', { name: firstName(c.child) }), href: exploreFor(c.child.id) }) : `<span class="text-sm muted">${esc(label('noPurchaseScope'))}</span>`}</div></div>`;
    return `<nav aria-label="${esc(t('breadcrumb'))}" class="text-sm muted mb-3"><a class="hover:text-primary" href="#/guardian/children">${esc(t('route./guardian/children'))}</a></nav>${header}${actions}<div class="room-tabs">${nav}</div><section class="mt-6" aria-labelledby="child-tabs-${active}">${body}</section>`;
  },
  mount(root, ctx) {
    const c = select('guardian.child', { id: ctx.params.id }); if (c.status !== 'ok' || !c.weeks.length || !root.querySelector('canvas[data-chart="child-activity"]')) return () => {};
    const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#0F766E';
    const sets = [['lessons', primary], ['assessments', '#B7834A'], ...(c.has.attendance ? [['live', '#5B8FA8']] : [])];
    return mountCharts(root, { 'child-activity': { type: 'bar', data: { labels: c.weeks.map(weekLabel), datasets: sets.map(([key, color]) => ({ label: p4('series.' + key), data: c.weeks.map(w => w[key]), backgroundColor: color, borderRadius: 8, maxBarThickness: 28 })) }, options: { plugins: { legend: { display: true, position: 'bottom' } } } } }, ctx);
  },
};

// ---------------------------------------------------------------- explore for a child (portal-wrapped shared catalog)
export const explore = {
  render(ctx) {
    const kids = select('guardian.purchaseChildren'), requested = ctx.query.get('child'), chosen = kids.find(k => k.id === requested) ?? null;
    const header = pageHeader({ title: t('route./guardian/explore'), subtitle: label('exploreIntro') });
    if (!kids.length) return header + emptyState({ icon: 'users', title: label('noPurchaseChildren'), description: label('noPurchaseChildrenBody'), action: { label: label('linkChild'), href: '#/guardian/children/link' } });
    const picker = `<section class="panel stack mb-6" aria-labelledby="picker-title"><h2 id="picker-title" class="text-lg">${esc(label('pickChild'))}</h2><p class="text-sm muted">${esc(label('pickChildHint'))}</p>${tabs(kids.map(k => ({ id: k.id, label: `${L(k.name)} · ${gradeOf(k)}`, href: url(ctx, { child: k.id, grade: null, all: null, page: null }) })), chosen?.id ?? '', { label: label('pickChild'), id: 'buy-for' })}${requested && !chosen ? notice({ message: label('childUnavailable'), tone: 'warning' }) : ''}${chosen ? notice({ message: label('buyingFor', { name: L(chosen.name) }), tone: 'success' }) : notice({ message: label('chooseFirst') })}</section>`;
    const query = new URLSearchParams(ctx.query), preset = chosen && !query.has('grade') && !query.has('all');
    if (preset) query.set('grade', chosen.grade.id);
    const scope = chosen ? `<div class="flex items-center justify-between gap-3 flex-wrap mb-4"><p class="text-sm muted">${esc(preset ? label('gradePreset', { grade: gradeOf(chosen), name: firstName(chosen) }) : label('allGradesNote'))}</p>${button({ label: preset ? label('allGrades') : label('childGradeOnly', { grade: gradeOf(chosen) }), href: preset ? url(ctx, { all: '1', page: null }) : url(ctx, { all: null, grade: null, page: null }), variant: 'secondary' })}</div>` : '';
    const cta = chosen ? c => ({ action: { label: label(c.price_type === 'free' ? 'enrollFor' : 'buyFor', { name: firstName(chosen) }), href: '#/checkout/' + enc(c.id) + '/beneficiary?child=' + enc(chosen.id) } }) : null;
    return header + picker + scope + results({ ...ctx, query }, {}, cta);
  },
};

// ---------------------------------------------------------------- orders
export const orders = {
  render() {
    const rows = select('guardian.orders');
    const list = table([
      { key: 'id', label: label('order'), render: d => `<bdi class="font-medium">${esc(d.order.id)}</bdi><span class="block text-xs muted"><bdi>${esc(day(d.order.created_at))}</bdi></span>` },
      { key: 'items', label: label('courseChild'), render: orderItems },
      { key: 'total', label: label('total'), align: 'end', render: d => `<bdi>${esc(money(d.order.total_baisa))}</bdi>` },
      { key: 'state', label: t('p3.status'), render: orderStatus },
    ], rows.map(d => ({ ...d, id: d.order.id })), { caption: label('ordersCaption'), actions: orderActions, empty: emptyState({ icon: 'receipt', title: label('noOrders'), action: { label: label('exploreCta'), href: '#/guardian/explore' } }) });
    const open = rows.filter(recoverable).length;
    return pageHeader({ title: t('route./guardian/orders'), subtitle: label('ordersIntro') }) + (open ? `<div class="mb-6">${notice({ title: label('needsAction', { count: open }), message: label('needsActionBody'), tone: 'warning' })}</div>` : '') + `<section class="panel min-w-0">${list}</section><p class="text-sm muted mt-4">${esc(label('receiptsKept'))}</p>`;
  },
};

// ---------------------------------------------------------------- notifications
export const notifications = {
  render(ctx) {
    const filter = ctx.query.get('filter') === 'unread' ? 'unread' : 'all', all = select('guardian.notifications'), unread = all.filter(n => !n.read_at), rows = filter === 'unread' ? unread : all;
    const nav = tabs([{ id: 'all', label: p4('filterAll'), href: url(ctx, { filter: null }), count: all.length }, { id: 'unread', label: p4('filterUnread'), href: url(ctx, { filter: 'unread' }), count: unread.length }], filter, { label: label('notificationFilter') });
    const list = rows.length ? `<ul class="stack mt-6">${rows.map(n => `<li class="panel notification-row ${n.read_at ? '' : 'is-unread'}"><span class="dot ${n.read_at ? 'dot-read' : ''}" aria-hidden="true"></span><div class="min-w-0 flex-1"><div class="flex items-start justify-between gap-3 flex-wrap"><h2 class="text-base">${esc(L(n.title))}</h2><span class="text-xs muted">${when(n.created_at)}</span></div><p class="text-sm muted mt-1">${esc(L(n.body))}</p><div class="flex-row mt-3">${n.read_at ? chip(t('status.delivery.read'), 'neutral', 'check') : chip(p4('unreadChip'), 'warning', 'bell')}${safeHash(n.href) ? button({ label: p4('openNotice'), href: n.href, variant: 'secondary' }) : ''}${n.read_at ? '' : `<button type="button" class="btn btn-ghost" data-action="guardian.markRead" data-id="${esc(n.id)}">${esc(p4('markRead'))}</button>`}</div></div></li>`).join('')}</ul>` : `<div class="mt-6">${emptyState({ icon: 'bell', title: filter === 'unread' ? p4('noUnread') : p4('noNotifications') })}</div>`;
    return pageHeader({ title: t('route./guardian/notifications'), subtitle: label('notificationsIntro'), actions: button({ label: p4('markAllRead'), action: 'guardian.markAllRead', variant: 'secondary', disabled: !unread.length, disabledReason: p4('noUnread') }) }) + nav + list;
  },
};

// ---------------------------------------------------------------- support
const TOPICS = ['account', 'course', 'payment', 'other'];
function ticketDetail(ctx, id) {
  const d = select('support.ticket', { id }); if (d.status !== 'ok') return denied(d.status, ctx);
  const x = d.ticket, own = select('actor').user_id;
  const replies = x.replies.map(r => `<li class="msg ${r.author_user_id === own ? 'msg-own' : ''}"><div class="flex items-center justify-between gap-3 flex-wrap"><strong class="text-sm">${esc(r.author_user_id === own ? label('you') : label('supportTeam'))}</strong><span class="text-xs muted">${when(r.created_at)}</span></div><p class="mt-2 whitespace-pre-line" dir="auto">${esc(r.text)}</p></li>`).join('');
  return pageHeader({ title: L(x.subject), subtitle: label('ticketRef', { id: x.id }), breadcrumbs: [{ label: t('route./guardian/support'), href: '#/guardian/support' }, { label: L(x.subject) }] })
    + `<div class="flex-row mb-6">${badge(x.state, { domain: 'conversation' })}${x.topic ? chip(t('p2.' + x.topic), 'neutral', 'helpCircle') : ''}${d.course ? chip(L(d.course.title), 'neutral', 'book') : ''}<span class="text-sm muted">${when(x.created_at)}</span></div>
    <div class="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]"><section class="stack min-w-0" aria-labelledby="ticket-thread"><h2 id="ticket-thread" class="sr-only">${esc(label('thread'))}</h2><ol class="stack"><li class="msg msg-own"><strong class="text-sm">${esc(label('you'))}</strong><p class="mt-2 whitespace-pre-line" dir="auto">${esc(L(x.body))}</p></li>${replies}</ol>
    ${x.resolution ? notice({ title: label('resolution'), message: x.resolution, tone: 'success' }) : ''}
    <form class="panel stack" data-action="guardian.reply" novalidate>${formField({ id: 'ticket-reply', name: 'text', label: label('reply'), type: 'textarea', rows: 3, required: true, hint: x.state === 'resolved' ? label('reopenHint') : '' })}<div class="flex-row">${submit('sendReply')}</div></form></section>
    <aside class="min-w-0"><section class="panel stack"><h2 class="text-lg">${esc(label('supportScopeTitle'))}</h2><p class="text-sm muted">${esc(label('supportScope'))}</p>${button({ label: label('allTickets'), href: '#/guardian/support', variant: 'secondary' })}</section></aside></div>`;
}
export const support = {
  render(ctx) {
    if (ctx.query.get('record')) return ticketDetail(ctx, ctx.query.get('record'));
    const tickets = select('support.tickets'), form = select('form', { name: 'guardian-ticket' });
    const list = tickets.length ? `<ul class="stack">${tickets.map(x => `<li><a class="panel card-link thread-row" href="#/guardian/support?record=${esc(enc(x.id))}"><span class="work-icon">${icon('helpCircle', { size: 20 })}</span><span class="min-w-0 flex-1"><span class="flex items-center justify-between gap-3 flex-wrap"><span class="font-semibold" dir="auto">${esc(L(x.subject))}</span>${badge(x.state, { domain: 'conversation' })}</span><span class="block text-sm muted"><bdi>${esc(x.id)}</bdi> · ${when(x.updated_at)} · ${esc(label('repliesCount', { count: x.replies.length }))}</span></span></a></li>`).join('')}</ul>` : emptyState({ icon: 'helpCircle', title: label('noTickets'), description: label('noTicketsBody') });
    const create = `<form class="panel stack" data-action="guardian.ticket" novalidate><h2 class="text-lg">${esc(label('newTicket'))}</h2><p class="text-sm muted">${esc(label('supportScope'))}</p>
      ${formField({ id: 'ticket-topic', name: 'topic', label: t('p2.topic'), type: 'select', value: form.values.topic ?? 'account', required: true, options: TOPICS.map(value => ({ value, label: t('p2.' + value) })), error: fieldError(form, 'topic') })}
      ${formField({ id: 'ticket-subject', name: 'subject', label: t('p2.subject'), value: form.values.subject ?? '', required: true, error: fieldError(form, 'subject') })}
      ${formField({ id: 'ticket-body', name: 'body', label: label('message'), type: 'textarea', rows: 5, value: form.values.body ?? '', required: true, error: fieldError(form, 'body') })}
      <div class="flex-row">${submit('sendTicket')}</div></form>`;
    return pageHeader({ title: t('route./guardian/support'), subtitle: label('supportIntro') }) + `<div class="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"><section class="min-w-0" aria-labelledby="tickets-title">${sectionTitle('tickets-title', label('myTickets'))}${list}</section><div class="min-w-0">${create}</div></div>`;
  },
};

// ---------------------------------------------------------------- settings and link permissions
function linkCard(l) {
  const name = L(l.child.name), pending = l.scope_request;
  const revoke = modal({ id: 'revoke-' + l.id, title: label('revokeTitle', { name }), body: `${notice({ title: label('revokeWarnTitle'), message: label('revokeWarn', { name }), tone: 'danger' })}<p class="text-sm muted">${esc(label('revokeAfter'))}</p>`, footer: button({ label: label('confirmRevoke', { name: firstName(l.child) }), action: 'guardian.revoke', data: { id: l.id }, variant: 'danger' }) + button({ label: label('cancel'), action: 'overlay.close', data: { id: 'revoke-' + l.id }, variant: 'ghost' }) });
  const scopes = modal({ id: 'scope-' + l.id, title: label('scopeTitle', { name }), body: `<form class="stack" data-action="guardian.scopeChange" data-id="${esc(l.id)}"><fieldset class="stack"><legend class="font-medium mb-2">${esc(label('scopes'))}</legend>${LINK_SCOPES.map(k => formField({ id: `scope-${l.id}-${k}`, name: 'scopes', label: label('scope.' + k), type: 'checkbox', value: (pending?.scopes ?? l.scopes).includes(k) }).replace('name="scopes"', `name="scopes" value="${k}"`)).join('')}</fieldset>${notice({ message: label('scopeReview') })}<div class="flex-row">${submit('sendScopeRequest')}</div></form>` });
  return `<article class="panel stack min-w-0"><div class="flex items-center gap-4 min-w-0">${avatar(l.child, { size: 48 })}<div class="min-w-0 flex-1"><h3 class="text-lg">${esc(name)}</h3><p class="text-sm muted">${esc(gradeOf(l.child))} · ${esc(L(l.relationship))} · ${esc(label('verifiedOn', { date: day(l.verified_at) }))}</p></div>${badge('verified', { domain: 'guardian_link' })}</div>
    ${scopeChips(l.scopes)}
    ${pending ? notice({ title: label('scopePendingTitle'), message: label('scopePending', { scopes: joinList(pending.scopes.map(k => label('scope.' + k))), date: day(pending.requested_at) }), tone: 'warning' }) : ''}
    <div class="flex-row border-t border-border pt-4">${button({ label: label('requestScope'), action: 'overlay.open', data: { id: 'scope-' + l.id }, variant: 'secondary' })}${button({ label: label('revoke'), action: 'overlay.open', data: { id: 'revoke-' + l.id }, variant: 'danger' })}</div></article>${revoke}${scopes}`;
}
export const settings = {
  render(ctx) {
    const s = select('guardian.settings'); if (!s) return fallback('resourceDenied', ctx);
    const active = ['account', 'links', 'notifications'].includes(ctx.query.get('tab')) ? ctx.query.get('tab') : 'account', prefs = select('preferences');
    const nav = tabs(['account', 'links', 'notifications'].map(id => ({ id, label: label('settings.' + id), href: url(ctx, { tab: id }), count: id === 'links' ? s.links.length : undefined })), active, { label: label('settingsTabs') });
    const choice = (key, value, text) => `<button type="button" class="btn ${prefs[key] === value ? 'btn-primary' : 'btn-secondary'} flex-1" data-action="shell.${key}" data-${key}="${value}" aria-pressed="${prefs[key] === value}">${esc(text)}</button>`;
    let body;
    if (active === 'account') body = `<section class="panel stack"><h2 class="text-lg">${esc(p4('accountInfo'))}</h2><dl class="meta-list"><div><dt>${esc(t('p2.name'))}</dt><dd>${esc(L(s.guardian.name))}</dd></div><div><dt>${esc(t('p2.email'))}</dt><dd><bdi>${esc(s.user?.email ?? '')}</bdi></dd></div><div><dt>${esc(p4('locale'))}</dt><dd>${esc(p4('locale.' + (s.user?.locale === 'en' ? 'en' : 'ar')))}</dd></div><div><dt>${esc(label('role'))}</dt><dd>${esc(t('role.guardian'))}</dd></div></dl>${notice({ message: p4('passwordNote') })}</section>
      <section class="panel stack"><h2 class="text-lg">${esc(p4('displayPrefs'))}</h2><p class="font-medium">${esc(t('language'))}</p><div class="flex gap-2">${choice('lang', 'ar', 'العربية')}${choice('lang', 'en', 'English')}</div><p class="font-medium">${esc(t('theme'))}</p><div class="flex gap-2">${choice('theme', 'light', t('light'))}${choice('theme', 'dark', t('dark'))}</div></section>`;
    else if (active === 'links') body = notice({ message: label('linksIntro') }) + (s.links.length ? s.links.map(linkCard).join('') : emptyState({ icon: 'users', title: label('noChildren'), description: label('noChildrenBody'), action: { label: label('linkChild'), href: '#/guardian/children/link' } })) + (s.pending ? `<p class="text-sm muted">${esc(label('otherRequests', { count: s.pending }))} <a class="text-primary underline" href="#/guardian/children">${esc(t('route./guardian/children'))}</a></p>` : '');
    else body = `<form class="panel stack" data-action="guardian.saveSettings"><h2 class="text-lg">${esc(label('notifyPrefs'))}</h2><p class="text-sm muted">${esc(label('notifyNote'))}</p>${GUARDIAN_PREFS.map(k => formField({ id: 'gpref-' + k, name: k, label: label('pref.' + k), type: 'checkbox', value: s.prefs[k] })).join('')}<div class="flex-row">${submit('savePrefs')}</div></form>`;
    return pageHeader({ title: t('route./guardian/settings'), subtitle: label('settingsIntro') }) + nav + `<div class="stack max-w-3xl mt-6">${body}</div>`;
  },
};

// ---------------------------------------------------------------- actions
function report(r, okKey, params) { showToast(r.ok ? label(okKey, params) : t(Object.values(r.fieldErrors ?? {})[0] ?? r.errorKey), { tone: r.ok ? 'success' : 'error' }); return r.ok; }
export function registerActions(register) {
  register('guardian', {
    link: (event, el, ctx) => {
      if (event.type !== 'submit') return;
      const fd = new FormData(el), values = { code: String(fd.get('code') ?? ''), relationship: String(fd.get('relationship') ?? '') };
      const r = ctx.dispatch('guardian.requestLink', { ...values, consent: fd.get('consent') });
      if (!r.ok) { ctx.dispatch('form.save', { form: 'guardian-link', values, fieldErrors: r.fieldErrors }); showToast(t(Object.values(r.fieldErrors ?? {})[0] ?? r.errorKey), { tone: 'error' }); return; }
      showToast(label(r.data.state === 'verified' ? 'alreadyLinked' : r.data.reused ? 'reusedToast' : 'createdToast'), { tone: r.data.state === 'verified' ? 'info' : 'success' });
    },
    linkAnother: (_e, _el, ctx) => ctx.dispatch('form.clear', { form: 'guardian-link' }),
    revoke: (_e, el, ctx) => report(ctx.dispatch('guardian.revokeLink', { linkId: el.dataset.id }), 'revoked'),
    scopeChange: (event, el, ctx) => {
      if (event.type !== 'submit') return;
      const r = ctx.dispatch('guardian.requestScopeChange', { linkId: el.dataset.id, scopes: new FormData(el).getAll('scopes') });
      if (report(r, 'scopeRequested')) closeOverlay('scope-' + el.dataset.id);
    },
    ticket: (event, el, ctx) => {
      if (event.type !== 'submit') return;
      const fd = new FormData(el), values = Object.fromEntries(['topic', 'subject', 'body'].map(k => [k, String(fd.get(k) ?? '')]));
      const r = ctx.dispatch('support.createTicket', values);
      if (!r.ok) { ctx.dispatch('form.save', { form: 'guardian-ticket', values, fieldErrors: r.fieldErrors }); showToast(t(Object.values(r.fieldErrors ?? {})[0] ?? r.errorKey), { tone: 'error' }); return; }
      // The shared ticket reducer records a help-page confirmation; this portal shows the ticket itself instead.
      ctx.dispatch('form.clear', { form: 'contact' }); ctx.dispatch('form.clear', { form: 'guardian-ticket' });
      showToast(label('ticketCreated', { id: r.data.ticketId }), { tone: 'success' });
      ctx.navigate('#/guardian/support?record=' + enc(r.data.ticketId));
    },
    reply: (event, el, ctx) => { if (event.type !== 'submit') return; report(ctx.dispatch('support.reply', { ticketId: ctx.query.get('record'), text: new FormData(el).get('text') }), 'replySent'); },
    markRead: (_e, el, ctx) => ctx.dispatch('notifications.markRead', { id: el.dataset.id }),
    markAllRead: (_e, _el, ctx) => { const r = ctx.dispatch('notifications.markAllRead', {}); showToast(r.ok ? p4('allRead') : t(r.errorKey), { tone: r.ok ? 'success' : 'error' }); },
    saveSettings: (event, el, ctx) => { if (event.type !== 'submit') return; const fd = new FormData(el); const r = ctx.dispatch('guardian.updateSettings', { prefs: Object.fromEntries(GUARDIAN_PREFS.map(k => [k, fd.get(k) === 'on'])) }); showToast(r.ok ? p4('prefsSaved') : t(r.errorKey), { tone: r.ok ? 'success' : 'error' }); },
  });
}
