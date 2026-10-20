import { t, L, esc, money, dictionary } from '../core/i18n.js';
import { select, LINK_SCOPES, TEAM_CAPABILITIES, INVITE_DAYS, INVITE_ROLES, STAFF_EXPIRY_DAYS } from '../core/store.js';
import { pageHeader, badge, tabs, table, emptyState, notice, formField, modal, drawer, showToast, openOverlay, closeOverlay } from '../core/ui.js';
import { icon } from '../core/icons.js';
import { mountCharts } from '../core/charts.js';
import { fallback } from '../core/layout.js';
import { chip, when, day, url, sectionTitle, fe, fv, hasErrors, auditLabel, onSubmit, strings, checklistMarkup } from './teacher.js';

// Administration (SPEC §5 Administration, P8a: every module except finance). Views read `admin.*` selectors, which
// re-check the staff module scope through can(); every mutation goes through a store reducer that repeats the check,
// so admin_moderation cannot reach employees/academics/CMS/settings and admin_finance none of these, even by forged
// hashes or data-id values. Record details open as ?record= drawers; reasoned actions share one reason dialog.
const label = (key, params) => t('p8.' + key, params);
const val = (ctx, key) => ctx.query.get(key) ?? '';
const tabOf = (ctx, list) => list.includes(ctx.query.get('tab')) ? ctx.query.get('tab') : list[0];
const num = n => `<bdi>${esc(n)}</bdi>`;
const omr = baisa => `<bdi>${esc(money(baisa))}</bdi>`;
const person = (name, id) => `<span class="font-medium" dir="auto">${esc(L(name) || label('unknownPerson'))}</span>${id ? ` <span class="text-xs muted"><bdi>${esc(id)}</bdi></span>` : ''}`;
const gs = c => `${L(c.grade?.name)} · ${L(c.subject?.name)}`;
const active = on => chip(label(on ? 'active' : 'inactive'), on ? 'success' : 'neutral', on ? 'checkCircle' : 'x');
const dirField = (html, dir) => html.replace('class="field"', `class="field" dir="${dir}"`);
const aform = name => select('admin.form', { name });
const auditName = action => Object.hasOwn(dictionary, 'p8.audit.' + action) ? label('audit.' + action) : auditLabel(action);
const roleName = role => role ? t('role.' + role) : label('unknownPerson');
const opt = (value, text) => ({ value, label: text });
const allOpt = () => opt('', t('all'));
const go = (key, variant = 'primary', attrs = '') => `<button type="submit" class="btn btn-${variant}" ${attrs}>${esc(label(key))}</button>`;
const head = (ctx, actions = '') => pageHeader({ title: L(ctx.route?.title), subtitle: label('intro.' + ctx.route?.path), actions });
const link = (href, text, variant = 'secondary') => `<a class="btn btn-${variant}" href="${esc(href)}">${esc(text)}</a>`;
const openLink = (ctx, id, text = label('open')) => `<a class="btn btn-secondary" href="${esc(url(ctx, { record: id }))}" aria-label="${esc(text + ' · ' + id)}">${esc(text)}</a>`;
const panel = (id, title, body, extra = '') => `<section class="panel stack min-w-0" aria-labelledby="${id}">${sectionTitle(id, title, extra)}${body}</section>`;
const facts = rows => `<dl class="meta-list">${rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd class="min-w-0">${v}</dd></div>`).join('')}</dl>`;
const sub = text => `<h3 class="text-base mt-2">${esc(text)}</h3>`;
const recordDrawer = (title, body) => drawer({ id: 'record-drawer', title, body, side: 'end' });
const missingDrawer = () => recordDrawer(label('missingRecord'), notice({ message: label('missingRecordBody'), tone: 'warning' }));
const empty = (key = 'noMatches') => emptyState({ title: label(key), description: label('noMatchesBody') });
const navTabs = (ctx, ids, current, counts = {}, key = 'tab') => tabs(ids.map(id => ({ id, label: label('tab.' + id), href: url(ctx, { [key]: id, record: null, q: null, status: null, origin: null }), count: counts[id] })), current, { label: label('tabsLabel'), id: 'admin-tabs' });
const tabBody = (current, body) => `<section class="mt-6 stack" aria-labelledby="admin-tabs-${current}">${body}</section>`;
const askBtn = (op, id, text, { extra = '', variant = 'secondary', iconName = null } = {}) => `<button type="button" class="btn btn-${variant}" data-action="admin.ask" data-op="${esc(op)}" data-id="${esc(id)}" data-extra="${esc(extra)}" data-label="${esc(text)}">${iconName ? icon(iconName, { size: 16 }) : ''}<span>${esc(text)}</span></button>`;
const locked = (type, id) => `<div class="rounded-xl border border-border p-4 stack">${notice({ title: label('restrictedTitle'), message: label('restrictedBody.' + type), tone: 'warning' })}<div class="flex-row">${askBtn('reveal', id, label('reveal'), { extra: type, variant: 'primary', iconName: 'lock' })}</div></div>`;
function field(form, id, name, text, opts = {}) { const html = formField({ ...opts, id, name, label: text, value: fv(form, name, opts.value ?? ''), error: fe(form, name) }); return opts.dir ? dirField(html, opts.dir) : html; }
// AR/EN side-by-side inputs named `${key}_ar` / `${key}_en`, the shape every bilingual reducer reads.
function pair(form, prefix, key, value = {}, { type = 'text', rows = 3, required = true } = {}) {
  return `<div class="grid gap-4 sm:grid-cols-2">${['ar', 'en'].map(lg => field(form, `${prefix}-${key}-${lg}`, `${key}_${lg}`, `${label('field.' + key)} · ${label('lang.' + lg)}`, { type, rows, required, value: value?.[lg] ?? '', dir: lg === 'ar' ? 'rtl' : 'ltr' })).join('')}</div>`;
}
function auditList(rows, limit = 12) {
  if (!rows.length) return `<p class="muted text-sm">${esc(label('noHistory'))}</p>`;
  return `<ol class="stack">${rows.slice(0, limit).map(e => `<li class="rounded-xl border border-border p-3 text-sm"><div class="flex items-start justify-between gap-3 flex-wrap"><p class="font-medium">${esc(auditName(e.action))}</p><span class="text-xs muted">${when(e.created_at)}</span></div><p class="muted mt-1">${esc(L(e.actor) || label('unknownPerson'))} · <bdi>${esc(e.resource_id)}</bdi>${e.before_summary || e.after_summary ? ` · <bdi dir="ltr">${esc(e.before_summary || '—')} → ${esc(e.after_summary || '—')}</bdi>` : ''}</p>${e.reason ? `<p class="mt-1" dir="auto">${esc(label('reasonShown', { reason: e.reason }))}</p>` : ''}</li>`).join('')}</ol>`;
}
// Search/filter form whose values live in the hash query (shareable, Back/Forward safe).
function filterForm(ctx, fields) {
  return `<form class="panel grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end mb-6" data-action="admin.filter" role="search" aria-label="${esc(t('filters'))}">${fields.map(f => formField({ ...f, id: 'filter-' + f.name, value: val(ctx, f.name) })).join('')}<div class="flex-row">${go('applyFilters')}${link(url(ctx, Object.fromEntries([...fields.map(f => [f.name, null]), ['record', null]])), t('resetFilters'), 'ghost')}</div></form>`;
}
function reasonDialog() {
  return modal({ id: 'reason-dialog', title: label('reasonTitle'), body: `<p class="text-sm muted" data-reason-target>${esc(label('reasonIntro'))}</p><form class="stack" data-action="admin.reason" novalidate><input type="hidden" name="op" value=""><input type="hidden" name="id" value=""><input type="hidden" name="extra" value="">${formField({ id: 'reason-text', name: 'reason', label: label('reasonLabel'), type: 'textarea', rows: 3, required: true, hint: label('reasonHint') })}<p class="text-sm text-accent" data-reason-error role="alert" hidden></p><div class="flex-row">${go('confirm')}<button type="button" class="btn btn-ghost" data-action="overlay.close" data-id="reason-dialog">${esc(t('cancel'))}</button></div></form>` });
}
const screen = (ctx, body, record = '') => body + record + reasonDialog();
function mountRecord(root, ctx) {
  const dialog = root.querySelector('#record-drawer'); if (!dialog) return () => {};
  openOverlay('record-drawer');
  const onClose = () => ctx.navigate(url(ctx, { record: null }));
  dialog.addEventListener('close', onClose);
  return () => dialog.removeEventListener('close', onClose);
}

// ---------------------------------------------------------------- dashboard
const QUEUES = [['applications', 'userPlus', '/admin/people/teachers?tab=applications'], ['guardianLinks', 'users', '/admin/people/guardian-links'], ['courseReview', 'book', '/admin/courses/review'], ['unpublishRequests', 'book', '/admin/courses/catalog?tab=published'], ['contentReports', 'flag', '/admin/courses/reports'], ['communications', 'shield', '/admin/support/communications'], ['flagged', 'flag', '/admin/support/tickets?tab=flags'], ['tickets', 'helpCircle', '/admin/support/tickets'], ['liveIssues', 'calendar', '/admin/courses/live?status=failed']];
const tile = (text, value, iconName, href) => `<li class="min-w-0"><a class="panel flex items-center gap-3 min-h-11 h-full" href="#${esc(href)}"><span class="work-icon">${icon(iconName, { size: 20 })}</span><span class="min-w-0 flex-1"><span class="block text-sm muted">${esc(text)}</span><strong class="block text-2xl mt-1">${value}</strong></span>${icon('chevronEnd', { size: 16 })}</a></li>`;
export const dashboard = {
  render(ctx) {
    const d = select('admin.dashboard'); if (!d) return fallback('resourceDenied', ctx);
    const header = pageHeader({ title: label('welcome', { name: L(d.actor.name) }), subtitle: `${label('intro./admin')} · ${t('footer.demoDate')}` });
    const queues = panel('queues-title', label('queuesTitle'), `<ul class="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">${QUEUES.map(([k, i, h]) => tile(label('queue.' + k), num(d.queues[k]), i, h)).join('')}</ul>`);
    const pending = panel('pending-title', label('pendingTitle'), d.pending.length ? `<ul class="stack">${d.pending.map(x => `<li><a class="work-row" href="${esc(x.href)}"><span class="work-icon">${icon({ application: 'userPlus', guardian: 'users', course: 'book' }[x.kind], { size: 18 })}</span><span class="min-w-0 flex-1"><span class="block font-medium" dir="auto">${esc(L(x.title))}</span><span class="block text-xs muted">${esc(label('kind.' + x.kind))} · <bdi>${esc(x.id)}</bdi></span></span>${badge(x.state, { domain: x.domain })}</a></li>`).join('')}</ul>` : `<p class="muted">${esc(label('pendingEmpty'))}</p>`);
    const academic = d.academic ? panel('academic-title', label('academicTitle'), `<ul class="grid gap-3 grid-cols-2 lg:grid-cols-3">${[['curricula', '/admin/academics/curricula'], ['versions', '/admin/academics/curricula?tab=versions'], ['grades', '/admin/academics/grades'], ['subjects', '/admin/academics/subjects'], ['mappings', '/admin/academics/subjects?tab=mappings'], ['teachers', '/admin/people/teachers']].map(([k, h]) => tile(label('academic.' + k), num(d.academic[k]), 'graduationCap', h)).join('')}</ul><ul class="grid gap-2 sm:grid-cols-2">${Object.entries(d.academic.courses).map(([k, n]) => `<li><a class="work-row" href="#/admin/courses/catalog?tab=${{ Published: 'published', Unpublished: 'unpublished', Archived: 'archived' }[k] ?? 'draft'}">${badge(k, { domain: 'course' })}<strong class="ms-auto">${num(n)}</strong></a></li>`).join('')}</ul>`) : '';
    const finance = d.finance ? panel('finance-title', label('financeTitle'), `<dl class="grid grid-cols-2 gap-3">${['gross', 'commission', 'payables', 'paid', 'refunds'].map(k => `<div class="rounded-xl bg-sand p-3 min-w-0"><dt class="text-sm muted">${esc(label('money.' + k))}</dt><dd class="font-semibold mt-1">${omr(d.finance[k])}</dd></div>`).join('')}<div class="rounded-xl bg-sand p-3 min-w-0"><dt class="text-sm muted">${esc(label('money.openRefunds'))}</dt><dd class="font-semibold mt-1">${num(d.finance.openRefunds)}</dd></div></dl><p class="text-sm muted">${esc(label('financeNote'))}</p>`, link('#/admin/finance', label('openFinance'), 'ghost')) : '';
    const scopeNote = d.finance ? '' : notice({ title: label('scopeTitle'), message: label('scopeModeration') });
    const activity = panel('activity-title', label('recentActivity'), auditList(d.activity, 6), select('admin.scope').settings ? link('#/admin/settings/security?tab=audit', label('fullAudit'), 'ghost') : '');
    return header + `<div class="stack">${queues}<div class="dash-grid"><div class="stack min-w-0">${pending}${academic}</div><div class="stack min-w-0">${finance}${scopeNote}${activity}</div></div></div>`;
  },
};

// ---------------------------------------------------------------- people: students
export const students = {
  render(ctx) {
    const d = select('admin.students', { q: val(ctx, 'q'), grade: val(ctx, 'grade'), status: val(ctx, 'status') }); if (!d) return fallback('resourceDenied', ctx);
    const filters = filterForm(ctx, [{ name: 'q', label: label('search') }, { name: 'grade', label: label('col.grade'), type: 'select', options: [allOpt(), ...select('grades').map(g => opt(g.id, L(g.name)))] }, { name: 'status', label: label('col.status'), type: 'select', options: [allOpt(), ...['active', 'suspended'].map(v => opt(v, t('status.account.' + v)))] }]);
    const cols = [{ key: 'name', label: label('col.student'), render: r => person(r.name, r.id) }, { key: 'grade', label: label('col.grade'), render: r => esc(L(r.grade?.name)) }, { key: 'status', label: label('col.status'), render: r => badge(r.status, { domain: 'account' }) }, { key: 'courses', label: label('col.activeCourses'), align: 'end', render: r => num(r.courses) }, { key: 'links', label: label('col.verifiedLinks'), align: 'end', render: r => num(r.links) }];
    const list = panel('list-title', label('resultsCount', { count: d.rows.length, total: d.total }), table(cols, d.rows, { caption: L(ctx.route.title), empty: empty(), actions: r => openLink(ctx, r.id) }));
    const id = val(ctx, 'record');
    return screen(ctx, head(ctx) + `<div class="mb-6">${notice({ message: label('sensitiveNote') })}</div>` + filters + list, id ? studentDrawer(id) : '');
  },
  mount: mountRecord,
};
function studentDrawer(id) {
  const d = select('admin.student', { id }); if (d.status !== 'ok') return missingDrawer();
  const x = d.student, next = x.status === 'suspended' ? 'active' : 'suspended';
  const base = facts([[label('col.id'), num(x.id)], [label('col.grade'), esc(L(x.grade?.name))], [label('col.status'), badge(x.status, { domain: 'account' })]]);
  const account = `<div class="flex-row">${askBtn('studentStatus', x.id, label(next === 'suspended' ? 'suspendAccount' : 'reactivateAccount'), { extra: next, variant: next === 'suspended' ? 'danger' : 'primary' })}</div><p class="text-sm muted">${esc(label('studentStatusNote'))}</p>`;
  const detail = d.locked ? locked('student', x.id) : `${notice({ message: label('revealedNote'), tone: 'success' })}${facts([[label('col.email'), `<bdi>${esc(x.email)}</bdi>`], [label('col.locale'), esc(label('lang.' + x.locale))], [label('col.interests'), esc(x.interests.map(v => L(v)).join(' · ') || '—')]])}
    ${sub(label('enrollments'))}${d.courses.length ? `<ul class="stack">${d.courses.map(c => `<li class="rounded-xl border border-border p-3 stack"><p class="font-medium" dir="auto">${esc(L(c.title))}</p><div class="flex-row">${c.access === 'none' ? chip(label('noAccess'), 'neutral') : badge(c.access, { domain: 'access' })}${c.origin ? chip(label('origin.' + c.origin), 'info') : ''}${badge(c.status, { domain: 'course' })}<span class="text-sm muted">${esc(label('percentDone', { percent: c.percent }))}</span></div></li>`).join('')}</ul>` : `<p class="muted text-sm">${esc(label('noEnrollments'))}</p>`}
    ${sub(label('guardianLinksTitle'))}${d.guardians.length ? `<ul class="stack">${d.guardians.map(g => `<li class="work-row"><span class="min-w-0 flex-1"><span class="block font-medium" dir="auto">${esc(L(g.guardian))}</span><span class="block text-xs muted">${esc(L(g.relationship))} · <bdi>${esc(g.id)}</bdi></span></span>${badge(g.state, { domain: 'guardian_link' })}</li>`).join('')}</ul>` : `<p class="muted text-sm">${esc(label('noLinks'))}</p>`}
    ${sub(label('ticketsTitle'))}${d.tickets.length ? `<ul class="stack">${d.tickets.map(k => `<li class="work-row"><span class="min-w-0 flex-1" dir="auto">${esc(L(k.subject))}</span>${badge(k.state, { domain: 'conversation' })}</li>`).join('')}</ul>` : `<p class="muted text-sm">${esc(label('noTickets'))}</p>`}`;
  return recordDrawer(L(x.name), `${base}${account}${detail}${sub(label('history'))}${auditList(d.history)}`);
}

// ---------------------------------------------------------------- people: guardian links
const LINK_TABS = ['queue', 'verified', 'rejected', 'revoked'];
export const guardianLinks = {
  render(ctx) {
    const state = LINK_TABS.includes(val(ctx, 'state')) ? val(ctx, 'state') : 'queue', d = select('admin.guardianLinks', { state }); if (!d) return fallback('resourceDenied', ctx);
    const nav = navTabs(ctx, LINK_TABS, state, d.counts, 'state');
    const cols = [{ key: 'id', label: label('col.request'), render: r => num(r.id) }, { key: 'guardian', label: label('col.guardian'), render: r => person(r.guardian) }, { key: 'relationship', label: label('col.relationship'), render: r => esc(L(r.relationship)) }, { key: 'state', label: label('col.status'), render: r => badge(r.state, { domain: 'guardian_link' }) + (r.scope_request?.state === 'pending_verification' ? ' ' + chip(label('scopeRequested'), 'warning', 'clock') : '') }, { key: 'requested_at', label: label('col.requested'), render: r => when(r.requested_at) }];
    const id = val(ctx, 'record');
    return screen(ctx, head(ctx) + `<div class="mb-6">${notice({ message: label('linkNote') })}</div>` + nav + tabBody(state, panel('list-title', label('tab.' + state), table(cols, d.rows, { caption: label('tab.' + state), empty: empty('queueEmpty'), actions: r => openLink(ctx, r.id, label('review')) }))), id ? linkDrawer(id) : '');
  },
  mount: mountRecord,
};
function linkDrawer(id) {
  const d = select('admin.guardianLink', { id }); if (d.status !== 'ok') return missingDrawer();
  const l = d.link, scopes = list => `<span class="flex flex-wrap gap-2">${list.map(k => chip(t('p5.scope.' + k), 'info')).join('')}</span>`;
  const info = facts([[label('col.guardian'), person(l.guardian)], [label('col.relationship'), esc(L(l.relationship))], [label('col.status'), badge(l.state, { domain: 'guardian_link' })], [label('col.requested'), when(l.requested_at)], [label('col.verified'), l.verified_at ? `${when(l.verified_at)} · ${esc(L(l.verified_by) || '—')}` : '—'], [label('col.scopes'), scopes(l.scopes)]]);
  const scopeRequest = l.scope_request?.state === 'pending_verification' ? `<div class="rounded-xl border border-border p-3 stack">${notice({ title: label('scopeRequested'), message: label('scopeRequestBody'), tone: 'warning' })}${scopes(l.scope_request.scopes)}<div class="flex-row">${askBtn('link', l.id, label('approveScope'), { extra: 'approveScope', variant: 'primary' })}${askBtn('link', l.id, label('rejectScope'), { extra: 'rejectScope' })}</div></div>` : '';
  const evidence = d.locked ? locked('guardian_link', l.id) : `${notice({ title: label('evidenceTitle'), message: label('evidenceSynthetic') })}${facts([[label('evidence.ref'), num(d.evidence.ref)], [label('evidence.token'), num(d.evidence.token)], [label('evidence.consent'), chip(label(d.evidence.consent ? 'yes' : 'no'), d.evidence.consent ? 'success' : 'danger')], [label('evidence.match'), d.evidence.student ? `${person(d.evidence.student.name, d.evidence.student.id)} · ${esc(L(d.evidence.student.grade))}` : chip(label('no'), 'danger')], [label('evidence.email'), `<bdi>${esc(d.evidence.guardian_email)}</bdi>`]])}`;
  const actions = ['requested', 'pending_verification'].includes(l.state) ? `<div class="flex-row">${askBtn('link', l.id, label('verify'), { extra: 'verify', variant: 'primary', iconName: 'checkCircle' })}${askBtn('link', l.id, label('reject'), { extra: 'reject', variant: 'danger' })}</div>` : l.state === 'verified' ? `<div class="flex-row">${askBtn('link', l.id, label('revokeLink'), { extra: 'revoke', variant: 'danger' })}</div>` : `<p class="text-sm muted">${esc(label('linkClosed'))}</p>`;
  return recordDrawer(label('linkTitle', { id: l.id }), `${info}${scopeRequest}${sub(label('evidenceTitle'))}${evidence}${sub(label('decision'))}${actions}${sub(label('history'))}${auditList(d.history)}`);
}

// ---------------------------------------------------------------- people: teachers, applications, invitations
const TEACHER_TABS = ['teachers', 'applications', 'invitations'];
export const teachers = {
  render(ctx) {
    const tab = tabOf(ctx, TEACHER_TABS), d = select('admin.teachers', { q: val(ctx, 'q') }); if (!d) return fallback('resourceDenied', ctx);
    const nav = navTabs(ctx, TEACHER_TABS, tab, { teachers: d.teachers.length, applications: d.applications.length, invitations: d.invitations.filter(x => x.state === 'invited').length });
    const body = {
      teachers: () => filterForm(ctx, [{ name: 'q', label: label('search') }]) + panel('list-title', label('tab.teachers'), table([{ key: 'name', label: label('col.teacher'), render: r => person(r.name, r.id) }, { key: 'email', label: label('col.email'), render: r => `<bdi>${esc(r.email)}</bdi>` }, { key: 'application_status', label: label('col.application'), render: r => badge(r.application_status, { domain: 'teacher_application' }) }, { key: 'account_status', label: label('col.account'), render: r => badge(r.account_status, { domain: 'account' }) }, { key: 'published', label: label('col.courses'), align: 'end', render: r => num(`${r.published} / ${r.owned}`) }, { key: 'qualifications', label: label('col.qualifications'), align: 'end', render: r => num(r.qualifications) }], d.teachers, { caption: label('tab.teachers'), empty: empty(), actions: r => openLink(ctx, r.id) })),
      applications: () => panel('list-title', label('tab.applications'), table([{ key: 'id', label: label('col.application'), render: r => num(r.id) }, { key: 'name', label: label('col.applicant'), render: r => person(r.name, r.teacher_id) }, { key: 'state', label: label('col.status'), render: r => badge(r.state, { domain: 'teacher_application' }) }, { key: 'pairs', label: label('col.declared'), align: 'end', render: r => num(r.pairs) }, { key: 'updated_at', label: label('col.updated'), render: r => when(r.updated_at) }, { key: 'reviewer', label: label('col.reviewer'), render: r => esc(L(r.reviewer) || '—') }], d.applications, { caption: label('tab.applications'), empty: empty('queueEmpty'), actions: r => openLink(ctx, r.id, label('review')) })),
      invitations: () => `${notice({ message: label('invitationNote') })}` + panel('list-title', label('tab.invitations'), table([{ key: 'email', label: label('col.email'), render: r => `<bdi>${esc(r.email)}</bdi>` }, { key: 'state', label: label('col.status'), render: r => badge(r.state, { domain: 'invitation' }) }, { key: 'inviter', label: label('col.invitedBy'), render: r => esc(L(r.inviter) || '—') }, { key: 'expires_at', label: label('col.expires'), render: r => when(r.expires_at) }, { key: 'teacher', label: label('col.teacher'), render: r => r.teacher ? person(r.teacher, r.teacher_id) : esc('—') }], d.invitations, { caption: label('tab.invitations'), empty: empty(), actions: r => r.state === 'invited' ? askBtn('revokeInvite', r.id, label('revokeInvite'), { variant: 'ghost' }) : '' }), link(url(ctx, { record: 'new' }), label('inviteTeacher'), 'primary')),
    }[tab]();
    const id = val(ctx, 'record');
    const record = !id ? '' : tab === 'applications' ? applicationDrawer(id) : tab === 'invitations' ? (id === 'new' ? inviteDrawer() : missingDrawer()) : teacherDrawer(id);
    return screen(ctx, head(ctx, link(url(ctx, { tab: 'invitations', record: 'new' }), label('inviteTeacher'), 'primary')) + nav + tabBody(tab, body), record);
  },
  mount: mountRecord,
};
function applicationDrawer(id) {
  const d = select('admin.application', { id }); if (d.status !== 'ok') return missingDrawer();
  const a = d.application, x = d.teacher, f = aform('app:' + a.id);
  const info = facts([[label('col.applicant'), person(x.name, x.id)], [label('col.status'), badge(a.state, { domain: 'teacher_application' })], [label('col.account'), badge(x.account_status, { domain: 'account' })]]);
  const pairs = `<ul class="flex flex-wrap gap-2">${d.pairs.map(p => `<li>${chip(`${L(p.grade?.name)} · ${L(p.display_name)}`, p.verified ? 'success' : p.active ? 'info' : 'danger', p.verified ? 'checkCircle' : null)}</li>`).join('')}</ul>`;
  const creds = `<ul class="stack">${x.credentials.map((c, i) => `<li class="work-row"><span class="work-icon">${icon('fileText', { size: 18 })}</span><span class="min-w-0 flex-1"><span class="block font-medium" dir="auto">${esc(L(c.label))}</span><span class="block text-xs muted"><bdi>${esc(d.files[i] || label('noFile'))}</bdi></span></span>${chip(label(c.verified ? 'verifiedCred' : 'unverifiedCred'), c.verified ? 'success' : 'warning')}</li>`).join('')}</ul>`;
  const timeline = `<ol class="stack">${a.history.map(h => `<li class="flex items-center gap-3 flex-wrap text-sm">${badge(h.state, { domain: 'teacher_application' })}<span class="muted">${esc(L(h.actor) || label('unknownPerson'))} · ${when(h.at)}</span></li>`).join('')}</ol>`;
  const decision = d.decidable ? `<form class="stack" data-action="admin.decideApplication" data-id="${esc(a.id)}" novalidate>${field(f, 'app-feedback', 'feedback', label('feedback'), { type: 'textarea', rows: 3, hint: label('feedbackHint') })}${notice({ message: label('approvalNoCourses') })}<div class="flex-row">${go('approve', 'primary', 'name="decision" value="approve"')}${go('requestInfo', 'secondary', 'name="decision" value="requestInfo"')}${go('reject', 'danger', 'name="decision" value="reject"')}</div></form>${a.state === 'submitted' ? `<div class="flex-row"><button type="button" class="btn btn-ghost" data-action="admin.startReview" data-id="${esc(a.id)}">${esc(label('startReview'))}</button></div>` : ''}` : notice({ message: label('notDecidable', { state: t('status.teacher_application.' + a.state) }) });
  const feedback = L(a.feedback) ? `<blockquote class="rounded-xl bg-sand p-3 text-sm" dir="auto">${esc(L(a.feedback))}</blockquote>` : '';
  return recordDrawer(label('applicationTitle', { name: L(x.name) }), `${info}<p class="text-sm" dir="auto">${esc(L(x.bio))}</p>${sub(label('declaredPairs'))}${pairs}${sub(label('credentials'))}${creds}${sub(label('timeline'))}${timeline}${feedback}${sub(label('decision'))}${decision}${sub(label('history'))}${auditList(d.history)}`);
}
function teacherDrawer(id) {
  const d = select('admin.teacher', { id }); if (d.status !== 'ok') return missingDrawer();
  const x = d.teacher, next = x.account_status === 'suspended' ? 'active' : 'suspended';
  const info = facts([[label('col.email'), `<bdi>${esc(x.email)}</bdi>`], [label('col.application'), badge(x.application_status, { domain: 'teacher_application' })], [label('col.account'), badge(x.account_status, { domain: 'account' })]]);
  const quals = d.qualifications.length ? `<ul class="flex flex-wrap gap-2">${d.qualifications.map(q => `<li>${chip(L(q), 'success', 'checkCircle')}</li>`).join('')}</ul>` : `<p class="muted text-sm">${esc(label('noQualifications'))}</p>`;
  const courses = d.courses.length ? `<ul class="stack">${d.courses.map(c => `<li class="work-row"><span class="min-w-0 flex-1" dir="auto">${esc(L(c.title))} <span class="text-xs muted"><bdi>${esc(c.id)}</bdi></span></span>${badge(c.status, { domain: 'course' })}</li>`).join('')}</ul>` : `<p class="muted text-sm">${esc(label('noCoursesYet'))}</p>`;
  const account = `<div class="flex-row">${askBtn('teacherStatus', x.id, label(next === 'suspended' ? 'suspendAccount' : 'reactivateAccount'), { extra: next, variant: next === 'suspended' ? 'danger' : 'primary' })}${x.application_status === 'approved' ? link('#/teacher/' + encodeURIComponent(x.id), label('publicProfile'), 'ghost') : ''}</div><p class="text-sm muted">${esc(label('accountSeparate'))}</p>`;
  return recordDrawer(L(x.name), `${info}${account}${sub(label('qualificationsTitle'))}${quals}${sub(label('ownedCourses'))}${courses}${sub(label('history'))}${auditList(d.history)}`);
}
function inviteDrawer() {
  const f = aform('invite-teacher');
  return recordDrawer(label('inviteTeacher'), `<form class="stack" data-action="admin.inviteTeacher" novalidate>${field(f, 'invite-email', 'email', label('col.email'), { type: 'email', required: true, hint: label('syntheticEmail') })}${field(f, 'invite-days', 'days', label('validFor'), { type: 'select', value: '14', options: INVITE_DAYS.map(v => opt(v, label('days', { count: v }))) })}${notice({ message: label('invitationNote') })}<div class="flex-row">${go('sendInvite')}</div></form>`);
}

// ---------------------------------------------------------------- people: employees (super_admin only)
export const employees = {
  render(ctx) {
    const d = select('admin.employees'); if (!d) return fallback('resourceDenied', ctx);
    const cols = [{ key: 'name', label: label('col.employee'), render: r => person(r.name, r.user_id) + (r.own ? ' ' + chip(label('you'), 'info', 'user') : '') }, { key: 'email', label: label('col.email'), render: r => `<bdi>${esc(r.email)}</bdi>` }, { key: 'role', label: label('col.role'), render: r => esc(roleName(r.role)) }, { key: 'status', label: label('col.status'), render: r => badge(r.status, { domain: 'account' }) }, { key: 'effective_at', label: label('col.effective'), render: r => esc(day(r.effective_at)) }, { key: 'expires_at', label: label('col.expires'), render: r => esc(day(r.expires_at)) }, { key: 'mfa', label: label('col.mfa'), render: r => badge(r.mfa, { domain: 'mfa' }) }];
    const id = val(ctx, 'record'), row = d.rows.find(r => r.id === id);
    const record = !id ? '' : id === 'new' ? employeeInvite() : row ? employeeDrawer(row, d.history) : missingDrawer();
    return screen(ctx, head(ctx, link(url(ctx, { record: 'new' }), label('inviteEmployee'), 'primary') + link('#/admin/settings/roles', label('openRoles'))) + `<div class="mb-6">${notice({ message: label('employeesNote') })}</div>` + panel('list-title', label('staffList'), table(cols, d.rows, { caption: label('staffList'), empty: empty(), actions: r => openLink(ctx, r.id, label('manage')) })) + `<div class="mt-6">${panel('history-title', label('history'), auditList(d.history))}</div>`, record);
  },
  mount: mountRecord,
};
function employeeInvite() {
  const f = aform('invite-employee');
  return recordDrawer(label('inviteEmployee'), `<form class="stack" data-action="admin.inviteEmployee" novalidate>${field(f, 'emp-name', 'name', label('col.employee'), { required: true })}${field(f, 'emp-email', 'email', label('col.email'), { type: 'email', required: true, hint: label('syntheticEmail') })}${field(f, 'emp-role', 'role', label('col.role'), { type: 'select', required: true, options: [opt('', label('chooseRole')), ...INVITE_ROLES.map(r => opt(r, roleName(r)))] })}${field(f, 'emp-days', 'days', label('validFor'), { type: 'select', value: '90', options: STAFF_EXPIRY_DAYS.map(v => opt(v, label('days', { count: v }))) })}${notice({ message: label('employeeScopeNote') })}<div class="flex-row">${go('sendInvite')}</div></form>`);
}
function employeeDrawer(r, history) {
  const f = aform('employee:' + r.id);
  const form = r.own ? notice({ title: label('ownerProtectedTitle'), message: t('p8.ownerProtected'), tone: 'warning' }) : `<form class="stack" data-action="admin.updateEmployee" data-id="${esc(r.id)}" novalidate>${field(f, 'emp-status', 'status', label('col.status'), { type: 'select', value: r.status, options: ['active', 'invited', 'suspended', 'deactivated'].map(v => opt(v, t('status.account.' + v))) })}${field(f, 'emp-expires', 'expires', label('col.expires'), { type: 'date', value: r.expires_at?.slice(0, 10) ?? '' })}${field(f, 'emp-reason', 'reason', label('reasonLabel'), { type: 'textarea', rows: 2, required: true, hint: label('reasonHint') })}<div class="flex-row">${go('saveChanges')}</div></form>`;
  return recordDrawer(L(r.name), `${facts([[label('col.role'), esc(roleName(r.role))], [label('col.status'), badge(r.status, { domain: 'account' })], [label('col.permissions'), num(r.permissions)], [label('col.mfa'), badge(r.mfa, { domain: 'mfa' })]])}${link('#/admin/settings/roles?record=' + encodeURIComponent(r.id), label('editScope'))}${form}${sub(label('history'))}${auditList(history.filter(e => e.resource_id === r.id))}`);
}

// ---------------------------------------------------------------- people: teams oversight
export const teams = {
  render(ctx) {
    const d = select('admin.teams', { q: val(ctx, 'q') }); if (!d) return fallback('resourceDenied', ctx);
    const cols = [{ key: 'member', label: label('col.member'), render: r => person(r.member, r.id) }, { key: 'teacher', label: label('col.owner'), render: r => person(r.teacher, r.teacher_id) }, { key: 'status', label: label('col.status'), render: r => badge(r.status, { domain: 'account' }) }, { key: 'team_role', label: label('col.role'), render: r => esc(t('p6.teamRole.' + r.team_role)) }, { key: 'expires_at', label: label('col.expires'), render: r => esc(day(r.expires_at)) }, { key: 'assignments', label: label('col.courses'), align: 'end', render: r => num(r.assignments.filter(a => a.status === 'active').length) }];
    const id = val(ctx, 'record'), row = d.rows.find(r => r.id === id);
    return screen(ctx, head(ctx) + `<div class="mb-6">${notice({ message: label('teamsNote') })}</div>` + filterForm(ctx, [{ name: 'q', label: label('search') }]) + panel('list-title', label('teamMembers'), table(cols, d.rows, { caption: label('teamMembers'), empty: empty(), actions: r => openLink(ctx, r.id, label('review')) })), id ? (row ? teamDrawer(row) : missingDrawer()) : '');
  },
  mount: mountRecord,
};
function teamDrawer(m) {
  const assignments = m.assignments.length ? `<ul class="stack">${m.assignments.map(a => `<li class="rounded-xl border border-border p-3 stack"><div class="flex items-start justify-between gap-3 flex-wrap"><p class="font-medium" dir="auto">${esc(L(a.title))} <span class="text-xs muted"><bdi>${esc(a.course_id)}</bdi></span></p>${badge(a.status, { domain: 'access' })}</div><div class="flex flex-wrap gap-2">${TEAM_CAPABILITIES.map(c => chip(t('p6.cap.' + c), a.capabilities.includes(c) ? 'success' : 'neutral', a.capabilities.includes(c) ? 'check' : 'lock')).join('')}</div>${a.status === 'active' ? `<div class="flex-row">${askBtn('teamRevoke', m.id, label('revokeCourseAccess'), { extra: a.course_id, variant: 'ghost' })}</div>` : ''}</li>`).join('')}</ul>` : `<p class="muted text-sm">${esc(label('noAssignments'))}</p>`;
  const revoke = ['active', 'invited'].includes(m.status) ? `<div class="flex-row">${askBtn('teamRevoke', m.id, label('revokeMembership'), { variant: 'danger' })}</div>` : `<p class="text-sm muted">${esc(label('membershipEnded'))}</p>`;
  return recordDrawer(L(m.member) || m.id, `${facts([[label('col.owner'), person(m.teacher, m.teacher_id)], [label('col.email'), `<bdi>${esc(m.email)}</bdi>`], [label('col.status'), badge(m.status, { domain: 'account' })], [label('col.invited'), esc(day(m.invited_at))], [label('col.expires'), esc(day(m.expires_at))], [label('col.assignedConversations'), num(m.conversations)]])}${notice({ message: label('teamScopeNote') })}${sub(label('courseAccess'))}${assignments}${revoke}${sub(label('history'))}${auditList(m.history)}`);
}

// ---------------------------------------------------------------- academics (super_admin only)
const CURRICULA_TABS = ['curricula', 'versions', 'tracks'];
const toggleBtn = (kind, row) => `<button type="button" class="btn btn-ghost" data-action="admin.setActive" data-kind="${kind}" data-id="${esc(row.id)}" data-value="${row.active ? 'false' : 'true'}">${esc(label(row.active ? 'deactivate' : 'activate'))}</button>`;
export const curricula = {
  render(ctx) {
    const tab = tabOf(ctx, CURRICULA_TABS), d = select('admin.academics'); if (!d) return fallback('resourceDenied', ctx);
    const nav = navTabs(ctx, CURRICULA_TABS, tab, { curricula: d.curricula.length, versions: d.versions.length, tracks: d.tracks.length });
    const kind = { curricula: 'curriculum', versions: 'version', tracks: 'track' }[tab];
    const actions = r => openLink(ctx, r.id, label('edit')) + toggleBtn(kind, r);
    const body = {
      curricula: () => table([{ key: 'code', label: label('col.code'), render: r => num(r.code) }, { key: 'name', label: label('col.name'), render: r => esc(L(r.name)) }, { key: 'versions', label: label('tab.versions'), align: 'end', render: r => num(r.versions) }, { key: 'active', label: label('col.status'), render: r => active(r.active) }], d.curricula, { caption: label('tab.curricula'), actions }),
      versions: () => table([{ key: 'name', label: label('col.name'), render: r => esc(L(r.name)) }, { key: 'curriculum', label: label('tab.curricula'), render: r => esc(L(r.curriculum)) }, { key: 'effective_year', label: label('col.effectiveYear'), render: r => num(r.effective_year) }, { key: 'mappings', label: label('tab.mappings'), align: 'end', render: r => num(r.mappings) }, { key: 'active', label: label('col.status'), render: r => active(r.active) }], d.versions, { caption: label('tab.versions'), actions }),
      tracks: () => table([{ key: 'name', label: label('col.name'), render: r => esc(L(r.name)) }, { key: 'version', label: label('tab.versions'), render: r => esc(L(r.version)) }, { key: 'courses', label: label('col.courses'), align: 'end', render: r => num(r.courses) }, { key: 'active', label: label('col.status'), render: r => active(r.active) }], d.tracks, { caption: label('tab.tracks'), actions }),
    }[tab]();
    const id = val(ctx, 'record'), rows = { curricula: d.curricula, versions: d.versions, tracks: d.tracks }[tab], row = rows.find(r => r.id === id);
    const record = !id ? '' : id === 'new' || row ? curriculumDrawer(tab, row ?? null, d) : missingDrawer();
    const history = d.history.filter(e => ['curriculum', 'curriculum_version', 'track'].includes(e.resource_type));
    return screen(ctx, head(ctx, link(url(ctx, { record: 'new' }), label('add.' + tab), 'primary')) + `<div class="mb-6">${notice({ message: label('curriculaNote') })}</div>` + nav + tabBody(tab, panel('list-title', label('tab.' + tab), body) + panel('history-title', label('versionHistory'), auditList(history))), record);
  },
  mount: mountRecord,
};
function curriculumDrawer(tab, row, d) {
  const f = aform(`${tab}:${row?.id ?? 'new'}`), id = row?.id ?? '';
  const fields = {
    curricula: () => field(f, 'cur-code', 'code', label('col.code'), { required: true, value: row?.code ?? '', hint: label('codeHint') }) + pair(f, 'cur', 'name', row?.name),
    versions: () => (row ? '' : field(f, 'ver-cur', 'curriculum_id', label('tab.curricula'), { type: 'select', required: true, options: d.curricula.map(c => opt(c.id, L(c.name))) })) + pair(f, 'ver', 'name', row?.name) + field(f, 'ver-year', 'effective_year', label('col.effectiveYear'), { type: 'number', min: 2000, max: 2100, step: 1, required: true, value: row?.effective_year ?? '' }),
    tracks: () => (row ? '' : field(f, 'trk-ver', 'curriculum_version_id', label('tab.versions'), { type: 'select', required: true, options: d.versions.map(v => opt(v.id, L(v.name))) })) + pair(f, 'trk', 'name', row?.name),
  }[tab]();
  return recordDrawer(row ? label('editRecord', { name: L(row.name) }) : label('add.' + tab), `<form class="stack" data-action="admin.saveAcademic" data-kind="${tab}" data-id="${esc(id)}" novalidate>${fields}${notice({ message: label(row ? 'editKeepsHistory' : 'newInactive') })}<div class="flex-row">${go('saveChanges')}</div></form>`);
}
export const grades = {
  render(ctx) {
    const d = select('admin.academics'); if (!d) return fallback('resourceDenied', ctx);
    const used = g => g.mappings + g.students + g.courses > 0;
    const cols = [{ key: 'number', label: label('col.number'), render: r => num(r.number) }, { key: 'name', label: label('col.name'), render: r => esc(L(r.name)) }, { key: 'cycle', label: label('col.cycle'), render: r => esc(L(r.cycle_label)) }, { key: 'mappings', label: label('tab.mappings'), align: 'end', render: r => num(r.mappings) }, { key: 'students', label: label('col.students'), align: 'end', render: r => num(r.students) }, { key: 'courses', label: label('col.courses'), align: 'end', render: r => num(r.courses) }];
    const actions = r => openLink(ctx, r.id, label('edit')) + (used(r) ? `<button type="button" class="btn btn-ghost" disabled title="${esc(label('gradeInUse'))}">${esc(label('delete'))}</button><small class="muted block">${esc(label('gradeInUse'))}</small>` : `<button type="button" class="btn btn-danger" data-action="admin.deleteGrade" data-id="${esc(r.id)}">${esc(label('delete'))}</button>`);
    const id = val(ctx, 'record'), row = d.grades.find(g => g.id === id);
    return screen(ctx, head(ctx) + `<div class="mb-6">${notice({ message: label('gradesNote') })}</div>` + panel('list-title', L(ctx.route.title), table(cols, d.grades, { caption: L(ctx.route.title), actions })) + `<div class="mt-6">${panel('history-title', label('history'), auditList(d.history.filter(e => e.resource_type === 'grade')))}</div>`, id ? (row ? gradeDrawer(row) : missingDrawer()) : '');
  },
  mount: mountRecord,
};
function gradeDrawer(g) {
  const f = aform('grade:' + g.id);
  return recordDrawer(label('editRecord', { name: L(g.name) }), `<form class="stack" data-action="admin.saveGrade" data-id="${esc(g.id)}" novalidate>${pair(f, 'grade', 'name', g.name)}${pair(f, 'grade', 'cycle', g.cycle_label)}${notice({ message: label('cycleShared') })}<div class="flex-row">${go('saveChanges')}</div></form>`);
}
const SUBJECT_TABS = ['subjects', 'mappings'];
export const subjects = {
  render(ctx) {
    const tab = tabOf(ctx, SUBJECT_TABS), d = select('admin.academics'); if (!d) return fallback('resourceDenied', ctx);
    const version = d.versions.some(v => v.id === val(ctx, 'version')) ? val(ctx, 'version') : 'CV-001';
    const nav = navTabs(ctx, SUBJECT_TABS, tab, { subjects: d.subjects.length, mappings: d.mappings.filter(m => m.active && m.curriculum_version_id === version).length });
    let body;
    if (tab === 'subjects') body = panel('list-title', label('tab.subjects'), table([{ key: 'code', label: label('col.code'), render: r => num(r.code) }, { key: 'name', label: label('col.name'), render: r => esc(L(r.name)) }, { key: 'description', label: label('field.description'), render: r => `<span class="text-sm clamp-2">${esc(L(r.description))}</span>` }, { key: 'mappings', label: label('tab.mappings'), align: 'end', render: r => num(r.mappings) }, { key: 'courses', label: label('col.courses'), align: 'end', render: r => num(r.courses) }], d.subjects, { caption: label('tab.subjects'), actions: r => openLink(ctx, r.id, label('edit')) }));
    else {
      const cell = (g, s) => { const m = d.mappings.find(x => x.curriculum_version_id === version && x.grade_id === g.id && x.subject_id === s.id), on = !!m?.active; return `<button type="button" class="btn ${on ? 'btn-primary' : 'btn-secondary'} text-sm" data-action="admin.toggleMapping" data-id="${esc(g.id)}" data-target="${esc(s.id)}" data-value="${esc(version)}" aria-pressed="${on}" aria-label="${esc(label('mappingAria', { grade: L(g.name), subject: L(s.name), state: label(on ? 'mapped' : 'notMapped') }))}">${icon(on ? 'check' : 'plus', { size: 14 })}<span>${esc(label(on ? 'mapped' : 'notMapped'))}</span>${m?.courses ? ` <bdi>(${esc(m.courses)})</bdi>` : ''}</button>`; };
      body = filterForm(ctx, [{ name: 'version', label: label('tab.versions'), type: 'select', options: d.versions.map(v => opt(v.id, L(v.name))) }]) + `<div class="mb-6">${notice({ message: label('mappingNote') })}</div>` + panel('list-title', label('mappingMatrix'), table([{ key: 'name', label: label('col.grade'), render: g => esc(L(g.name)) }, ...d.subjects.map(s => ({ key: s.id, label: L(s.name), render: g => cell(g, s) }))], d.grades, { caption: label('mappingMatrix') }));
    }
    const id = val(ctx, 'record'), row = d.subjects.find(s => s.id === id);
    return screen(ctx, head(ctx) + nav + tabBody(tab, body + panel('history-title', label('history'), auditList(d.history.filter(e => ['subject', 'grade_subject'].includes(e.resource_type))))), tab === 'subjects' && id ? (row ? subjectDrawer(row) : missingDrawer()) : '');
  },
  mount: mountRecord,
};
function subjectDrawer(s) {
  const f = aform('subject:' + s.id);
  return recordDrawer(label('editRecord', { name: L(s.name) }), `<form class="stack" data-action="admin.saveSubject" data-id="${esc(s.id)}" novalidate>${pair(f, 'subject', 'name', s.name)}${pair(f, 'subject', 'description', s.description, { type: 'textarea' })}${notice({ message: label('subjectPublicNote') })}<div class="flex-row">${go('saveChanges')}</div></form>`);
}
const PERIOD_TABS = ['years', 'semesters'];
export const periods = {
  render(ctx) {
    const tab = tabOf(ctx, PERIOD_TABS), d = select('admin.academics'); if (!d) return fallback('resourceDenied', ctx);
    const nav = navTabs(ctx, PERIOD_TABS, tab, { years: d.years.length, semesters: d.semesters.length });
    const range = r => `<bdi>${esc(day(r.starts_at))} – ${esc(day(r.ends_at))}</bdi>`;
    const body = tab === 'years'
      ? table([{ key: 'name', label: label('col.name'), render: r => esc(L(r.name)) }, { key: 'range', label: label('col.dates'), render: range }, { key: 'semesters', label: label('tab.semesters'), align: 'end', render: r => num(r.semesters) }, { key: 'courses', label: label('col.courses'), align: 'end', render: r => num(r.courses) }], d.years, { caption: label('tab.years'), actions: r => openLink(ctx, r.id, label('edit')) })
      : table([{ key: 'name', label: label('col.name'), render: r => esc(L(r.name)) }, { key: 'year', label: label('col.year'), render: r => esc(L(r.year)) }, { key: 'sequence', label: label('col.sequence'), render: r => num(r.sequence) }, { key: 'range', label: label('col.dates'), render: range }, { key: 'courses', label: label('col.courses'), align: 'end', render: r => num(r.courses) }], d.semesters, { caption: label('tab.semesters'), actions: r => openLink(ctx, r.id, label('edit')) });
    const id = val(ctx, 'record'), row = (tab === 'years' ? d.years : d.semesters).find(r => r.id === id);
    const record = !id ? '' : id === 'new' || row ? periodDrawer(tab, row ?? null, d) : missingDrawer();
    return screen(ctx, head(ctx, link(url(ctx, { record: 'new' }), label('add.' + tab), 'primary')) + nav + tabBody(tab, panel('list-title', label('tab.' + tab), body) + panel('history-title', label('history'), auditList(d.history.filter(e => ['academic_year', 'semester'].includes(e.resource_type))))), record);
  },
  mount: mountRecord,
};
function periodDrawer(tab, row, d) {
  const f = aform(`${tab}:${row?.id ?? 'new'}`), dates = field(f, 'per-starts', 'starts', label('col.starts'), { type: 'date', required: true, value: row?.starts_at.slice(0, 10) ?? '' }) + field(f, 'per-ends', 'ends', label('col.ends'), { type: 'date', required: true, value: row?.ends_at.slice(0, 10) ?? '' });
  const extra = tab === 'semesters' ? (row ? '' : field(f, 'per-year', 'academic_year_id', label('col.year'), { type: 'select', required: true, options: d.years.map(y => opt(y.id, L(y.name))) })) + field(f, 'per-seq', 'sequence', label('col.sequence'), { type: 'number', min: 1, max: 4, step: 1, required: true, value: row?.sequence ?? '' }) : '';
  return recordDrawer(row ? label('editRecord', { name: L(row.name) }) : label('add.' + tab), `<form class="stack" data-action="admin.savePeriod" data-kind="${tab}" data-id="${esc(row?.id ?? '')}" novalidate>${extra}${pair(f, 'per', 'name', row?.name)}<div class="grid gap-4 sm:grid-cols-2">${dates}</div>${notice({ message: label('editKeepsHistory') })}<div class="flex-row">${go('saveChanges')}</div></form>`);
}
// Side-by-side AR/EN labels for subjects (public filters) and the selected grade's mappings (grade landing).
const keyOf = (kind, id) => `${kind === 'subjects' ? 's' : 'm'}_${id.replace(/-/g, '_')}`;
export const translations = {
  render(ctx) {
    const d = select('admin.academics'); if (!d) return fallback('resourceDenied', ctx);
    const grade = d.grades.some(g => g.id === val(ctx, 'grade')) ? val(ctx, 'grade') : '4', f = aform('translations:' + grade);
    const mappings = d.mappings.filter(m => m.grade_id === grade && m.curriculum_version_id === 'CV-001');
    const row = (kind, id, value, title) => { const key = keyOf(kind, id); return `<fieldset class="rounded-xl border border-border p-3 stack"><legend class="font-medium px-1">${esc(title)} <span class="text-xs muted"><bdi>${esc(id)}</bdi></span></legend><div class="grid gap-3 sm:grid-cols-2">${['ar', 'en'].map(lg => dirField(formField({ id: `tr-${key}-${lg}`, name: `${key}_${lg}`, label: label('lang.' + lg), value: fv(f, `${key}_${lg}`, value[lg]), error: fe(f, `${key}_${lg}`), required: true }), lg === 'ar' ? 'rtl' : 'ltr').replace('<input ', `<input data-kind="${kind}" data-id="${esc(id)}" data-lang="${lg}" `)).join('')}</div></fieldset>`; };
    const missing = [...d.subjects.map(s => s.name), ...d.mappings.map(m => m.display_name)].filter(v => !v?.ar || !v?.en).length;
    const form = `<form class="stack" data-action="admin.saveTranslations" novalidate>${panel('subjects-title', label('subjectLabels'), `<p class="text-sm muted">${esc(label('subjectLabelsNote'))}</p>${d.subjects.map(s => row('subjects', s.id, s.name, L(s.name))).join('')}`)}${panel('mappings-title', label('mappingLabels', { grade: L(d.grades.find(g => g.id === grade)?.name) }), `<p class="text-sm muted">${esc(label('mappingLabelsNote'))}</p>${mappings.map(m => row('mappings', m.id, m.display_name, L(d.subjects.find(s => s.id === m.subject_id)?.name))).join('')}`)}<div class="flex-row">${go('saveTranslations')}${link('#/explore?tab=subjects', label('previewPublic'), 'ghost')}</div></form>`;
    const status = missing ? notice({ title: label('labelsMissingTitle'), message: label('labelsMissingCount', { count: missing }), tone: 'warning' }) : notice({ message: label('labelsComplete'), tone: 'success' });
    return screen(ctx, head(ctx) + `<div class="stack mb-6">${status}${hasErrors(f) ? notice({ message: t('p8.labelsMissing'), tone: 'danger' }) : ''}</div>` + filterForm(ctx, [{ name: 'grade', label: label('col.grade'), type: 'select', options: d.grades.map(g => opt(g.id, L(g.name))) }]) + form + `<div class="mt-6">${panel('history-title', label('history'), auditList(d.history.filter(e => e.resource_type === 'translation')))}</div>`);
  },
};

// ---------------------------------------------------------------- course operations
const fieldValue = (field, v) => v == null || v === '' ? '—' : field === 'price_baisa' ? money(v) : field === 'price_type' ? (v === 'free' ? t('free') : label('paid')) : field === 'mode' ? t('mode.' + v) : field === 'language' ? label('lang.' + v) : field === 'access_policy' ? `${label('accessKind.' + v.kind)} · ${day(v.end_at)}` : typeof v === 'object' ? L(v) : String(v);
const fieldName = f => Object.hasOwn(dictionary, 'p8.field.' + f) ? label('field.' + f) : f;
const courseCols = () => [{ key: 'title', label: label('col.course'), render: r => `<span class="font-medium" dir="auto">${esc(L(r.title))}</span> <span class="text-xs muted"><bdi>${esc(r.id)}</bdi></span>` }, { key: 'owner', label: label('col.owner'), render: r => esc(L(r.owner)) }, { key: 'gs', label: label('col.gradeSubject'), render: r => esc(gs(r)) }];
export const review = {
  render(ctx) {
    const rows = select('admin.reviewQueue'); if (!rows) return fallback('resourceDenied', ctx);
    const cols = [...courseCols(), { key: 'kind', label: label('col.kind'), render: r => chip(label('reviewKind.' + r.kind), r.kind === 'revision' ? 'info' : 'warning', r.kind === 'revision' ? 'edit' : 'book') }, { key: 'submitted_at', label: label('col.submitted'), render: r => when(r.submitted_at) }];
    const id = val(ctx, 'record');
    return screen(ctx, head(ctx) + `<div class="mb-6">${notice({ message: label('reviewNote') })}</div>` + panel('list-title', label('queueTitle', { count: rows.length }), table(cols, rows, { caption: L(ctx.route.title), empty: emptyState({ icon: 'checkCircle', title: label('reviewEmpty'), description: label('reviewEmptyBody') }), actions: r => openLink(ctx, r.id, label('review')) })), id ? reviewDrawer(id) : '');
  },
  mount: mountRecord,
};
function courseFacts(x) {
  const c = x.course;
  return facts([[label('col.owner'), esc(L(c.owner))], [label('col.gradeSubject'), esc(gs(c))], [label('field.mode'), esc(t('mode.' + c.mode))], [label('field.price_baisa'), `<bdi>${esc(c.price_type === 'free' ? t('free') : money(c.price_baisa))}</bdi>`], [label('col.status'), badge(c.raw_status, { domain: 'course' })], [label('col.content'), esc(label('contentCounts', { modules: x.modules, lessons: x.lessons, previews: x.previews }))], [label('col.qualification'), x.qualified ? chip(label('qualified'), 'success', 'checkCircle') : chip(t('p6.notQualified'), 'danger', 'x')], [label('col.enrolled'), num(c.enrolled)]]);
}
function reviewDrawer(id) {
  const x = select('admin.course', { id }); if (x.status !== 'ok') return missingDrawer();
  const c = x.course, f = aform('review:' + c.id), revision = c.raw_status === 'Published' && x.pending?.status === 'Submitted', decidable = c.raw_status === 'Submitted' || revision;
  const diff = revision ? `${sub(label('revisionDiff'))}${notice({ message: label('snapshotNote') })}${table([{ key: 'field', label: label('col.field'), render: r => esc(fieldName(r.field)) }, { key: 'before', label: label('col.published'), render: r => `<span dir="auto">${esc(fieldValue(r.field, r.before))}</span>` }, { key: 'after', label: label('col.proposed'), render: r => `<span dir="auto">${esc(fieldValue(r.field, r.after))}</span>` }], x.revision, { caption: label('revisionDiff'), rowKey: 'field', empty: `<p class="muted text-sm">${esc(label('noFieldChanges'))}</p>` })}` : '';
  const decision = decidable ? `<form class="stack" data-action="admin.reviewCourse" data-id="${esc(c.id)}" novalidate>${field(f, 'review-feedback', 'feedback', label('feedback'), { type: 'textarea', rows: 3, hint: label('reviewFeedbackHint') })}<div class="flex-row">${go('approvePublish', 'primary', 'name="decision" value="approve"')}${go('requestChanges', 'secondary', 'name="decision" value="requestChanges"')}</div><p class="text-sm muted">${esc(label('ownerNotified'))}</p></form>` : notice({ message: label('notInQueue') });
  return recordDrawer(L(c.title), `${courseFacts(x)}<p class="text-sm" dir="auto">${esc(L(c.summary))}</p>${diff}${sub(t('p6.checklistTitle'))}${checklistMarkup({ course: { id: c.id }, checklist: x.checklist }, false, { links: false })}${sub(label('decision'))}${decision}${sub(label('history'))}${auditList(x.history)}`);
}
const CATALOG_TABS = ['published', 'draft', 'archived', 'unpublished'];
export const catalog = {
  render(ctx) {
    const tab = tabOf(ctx, CATALOG_TABS), d = select('admin.catalog', { tab, q: val(ctx, 'q') }); if (!d) return fallback('resourceDenied', ctx);
    const cols = [...courseCols(), { key: 'status', label: label('col.status'), render: r => badge(r.raw_status, { domain: 'course' }) + (r.revision ? ' ' + chip(t('p6.revision.' + r.revision.status), 'info', 'edit') : '') + (r.unpublish_request?.state === 'requested' ? ' ' + chip(label('unpublishRequested'), 'warning', 'flag') : '') + (r.restriction ? ' ' + chip(label('restricted'), 'danger', 'shield') : '') }, { key: 'enrolled', label: label('col.enrolled'), align: 'end', render: r => num(r.enrolled) }];
    const id = val(ctx, 'record');
    return screen(ctx, head(ctx, link('#/admin/courses/review', label('openReviewQueue'))) + navTabs(ctx, CATALOG_TABS, tab, d.counts) + tabBody(tab, filterForm(ctx, [{ name: 'q', label: label('search') }]) + panel('list-title', label('tab.' + tab), table(cols, d.rows, { caption: label('tab.' + tab), empty: empty(), actions: r => openLink(ctx, r.id, label('inspect')) }))), id ? catalogDrawer(id) : '');
  },
  mount: mountRecord,
};
function catalogDrawer(id) {
  const x = select('admin.course', { id }); if (x.status !== 'ok') return missingDrawer();
  const c = x.course, s = c.raw_status;
  const ops = s === 'Published' ? askBtn('courseOp', c.id, label('unpublish'), { extra: 'unpublish', variant: 'danger' }) + askBtn('courseOp', c.id, label('archive'), { extra: 'archive' }) : s === 'Draft' ? askBtn('courseOp', c.id, label('archive'), { extra: 'archive' }) : s === 'Unpublished' ? askBtn('courseOp', c.id, label('republish'), { extra: 'republish', variant: 'primary' }) : '';
  const hint = s === 'Submitted' ? notice({ message: label('submittedHint') }) + link('#/admin/courses/review?record=' + encodeURIComponent(c.id), label('openReview'), 'primary') : s === 'Unpublished' ? notice({ message: label('republishHint') }) : s === 'Archived' ? notice({ message: label('archivedHint') }) : s === 'ChangesRequested' ? notice({ message: label('changesHint') }) : '';
  const request = x.unpublish_request?.state === 'requested' ? notice({ title: label('unpublishRequested'), message: L(x.unpublish_request.reason), tone: 'warning' }) : '';
  const restriction = c.restriction ? notice({ title: label('restricted'), message: L(c.restriction.reason), tone: 'danger' }) : '';
  const reports = x.reports.length ? `<ul class="stack">${x.reports.map(r => `<li><a class="work-row" href="#/admin/courses/reports?record=${esc(encodeURIComponent(r.id))}"><span class="min-w-0 flex-1" dir="auto">${esc(L(r.reason))}</span>${badge(r.state, { domain: 'conversation' })}</a></li>`).join('')}</ul>` : `<p class="muted text-sm">${esc(label('noReports'))}</p>`;
  return recordDrawer(L(c.title), `${courseFacts(x)}${request}${restriction}${hint}${ops ? `<div class="flex-row">${ops}</div><p class="text-sm muted">${esc(label('moderationNote'))}</p>` : ''}${c.public ? link('#/course/' + encodeURIComponent(c.id), label('viewPublic'), 'ghost') : ''}${sub(label('contentReports'))}${reports}${sub(label('history'))}${auditList(x.history)}`);
}
export const contentReports = {
  render(ctx) {
    const d = select('admin.contentReports', {}); if (!d) return fallback('resourceDenied', ctx);
    const cols = [{ key: 'id', label: label('col.report'), render: r => num(r.id) }, { key: 'course_title', label: label('col.course'), render: r => `<span dir="auto">${esc(L(r.course_title))}</span>` }, { key: 'reason', label: label('col.reason'), render: r => `<span dir="auto">${esc(L(r.reason))}</span>` }, { key: 'state', label: label('col.status'), render: r => badge(r.state, { domain: 'conversation' }) + (r.restriction ? ' ' + chip(label('restricted'), 'danger', 'shield') : '') }, { key: 'created_at', label: label('col.reported'), render: r => when(r.created_at) }];
    const id = val(ctx, 'record'), row = d.rows.find(r => r.id === id);
    return screen(ctx, head(ctx) + `<div class="mb-6">${notice({ message: label('reportsNote') })}</div>` + panel('list-title', label('contentReports'), table(cols, d.rows, { caption: label('contentReports'), empty: empty('queueEmpty'), actions: r => openLink(ctx, r.id, label('review')) })), id ? (row ? reportDrawer(row) : missingDrawer()) : '');
  },
  mount: mountRecord,
};
function reportDrawer(r) {
  const actions = r.state === 'resolved' ? notice({ title: label('resolvedTitle'), message: r.resolution || label('resolvedTitle'), tone: 'success' }) : `<div class="flex-row">${r.restriction ? '' : askBtn('reportOp', r.id, label('restrict'), { extra: 'restrict', iconName: 'shield' })}${r.course_status === 'Published' ? askBtn('reportOp', r.id, label('unpublish'), { extra: 'unpublish', variant: 'danger' }) : ''}${askBtn('reportOp', r.id, label('resolve'), { extra: 'resolve', variant: 'primary' })}</div><p class="text-sm muted">${esc(label('reportActionsNote'))}</p>`;
  return recordDrawer(label('reportTitle', { id: r.id }), `${facts([[label('col.course'), `<a class="text-primary" href="#/admin/courses/catalog?tab=${{ Published: 'published', Unpublished: 'unpublished', Archived: 'archived' }[r.course_status] ?? 'draft'}&record=${esc(encodeURIComponent(r.course_id))}" dir="auto">${esc(L(r.course_title))}</a>`], [label('col.courseStatus'), badge(r.course_status, { domain: 'course' })], [label('col.reason'), `<span dir="auto">${esc(L(r.reason))}</span>`], [label('col.reporter'), esc(roleName(r.reporter_role))], [label('col.status'), badge(r.state, { domain: 'conversation' })]])}${r.restriction ? notice({ title: label('restricted'), message: L(r.restriction.reason), tone: 'danger' }) : ''}${sub(label('decision'))}${actions}${sub(label('appealHistory'))}${auditList(r.history)}`);
}
const ACCESS_TABS = ['enrollments', 'grants'];
const ORIGINS = ['one_time_purchase', 'complimentary', 'admin_grant', 'subscription'];
export const access = {
  render(ctx) {
    const tab = tabOf(ctx, ACCESS_TABS), d = select('admin.access', { q: val(ctx, 'q'), origin: tab === 'grants' ? val(ctx, 'origin') : '', status: val(ctx, 'status') }); if (!d) return fallback('resourceDenied', ctx);
    const statuses = tab === 'grants' ? ['active', 'expired', 'revoked'].map(v => opt(v, t('status.access.' + v))) : ['active', 'completed', 'suspended'].map(v => opt(v, t('status.enrollment.' + v)));
    const filters = filterForm(ctx, [{ name: 'q', label: label('searchAccess') }, { name: 'status', label: label('col.status'), type: 'select', options: [allOpt(), ...statuses] }, ...(tab === 'grants' ? [{ name: 'origin', label: label('col.origin'), type: 'select', options: [allOpt(), ...ORIGINS.map(o => opt(o, label('origin.' + o)))] }] : [])]);
    const who = [{ key: 'student', label: label('col.student'), render: r => person(r.student, r.student_id) }, { key: 'course_title', label: label('col.course'), render: r => `<span dir="auto">${esc(L(r.course_title))}</span> <span class="text-xs muted"><bdi>${esc(r.course_id)}</bdi></span>` }];
    const body = tab === 'enrollments'
      ? table([...who, { key: 'status', label: label('col.enrollment'), render: r => badge(r.status, { domain: 'enrollment' }) }, { key: 'access', label: label('col.access'), render: r => r.access === 'none' ? chip(label('noAccess'), 'neutral') : badge(r.access, { domain: 'access' }) }, { key: 'grants', label: label('col.grants'), align: 'end', render: r => num(r.grants) }, { key: 'started_at', label: label('col.started'), render: r => esc(day(r.started_at)) }], d.enrollments, { caption: label('tab.enrollments'), empty: empty() })
      : table([{ key: 'id', label: label('col.grant'), render: r => num(r.id) }, ...who, { key: 'origin', label: label('col.origin'), render: r => chip(label('origin.' + r.origin), r.origin === 'admin_grant' ? 'warning' : 'info') }, { key: 'validity', label: label('col.validity'), render: r => `<bdi>${esc(day(r.starts_at))} – ${esc(day(r.ends_at))}</bdi>` }, { key: 'effective', label: label('col.status'), render: r => badge(r.effective, { domain: 'access' }) }, { key: 'by', label: label('col.by'), render: r => esc(L(r.revoked_by_name ?? r.granted_by_name) || '—') }], d.grants, { caption: label('tab.grants'), empty: empty(), actions: r => r.effective === 'active' ? askBtn('revokeGrant', r.id, label('revokeGrant'), { variant: 'ghost' }) : '' });
    const id = val(ctx, 'record');
    return screen(ctx, head(ctx, link(url(ctx, { tab: 'grants', record: 'new' }), label('grantAccess'), 'primary')) + `<div class="mb-6">${notice({ message: label('accessNote') })}</div>` + navTabs(ctx, ACCESS_TABS, tab, { enrollments: d.enrollments.length, grants: d.grants.length }) + tabBody(tab, filters + panel('list-title', label('tab.' + tab), body)), id === 'new' ? grantDrawer(d) : id ? missingDrawer() : '');
  },
  mount: mountRecord,
};
function grantDrawer(d) {
  const f = aform('grant');
  return recordDrawer(label('grantAccess'), `<form class="stack" data-action="admin.grant" novalidate>${field(f, 'grant-student', 'studentId', label('col.student'), { type: 'select', required: true, options: [opt('', label('chooseStudent')), ...d.students.map(s => opt(s.id, `${L(s.name)} · ${s.id}`))] })}${field(f, 'grant-course', 'courseId', label('col.course'), { type: 'select', required: true, options: [opt('', label('chooseCourse')), ...d.courses.map(c => opt(c.id, `${L(c.title)} · ${c.id}`))] })}${field(f, 'grant-ends', 'ends', label('col.ends'), { type: 'date', required: true, value: '2027-07-31' })}${field(f, 'grant-reason', 'reason', label('reasonLabel'), { type: 'textarea', rows: 2, required: true, hint: label('reasonHint') })}${notice({ message: label('grantNote') })}<div class="flex-row">${go('grantAccess')}</div></form>`);
}
const LIVE_TABS = ['all', 'upcoming', 'live', 'ended', 'cancelled', 'failed'];
export const live = {
  render(ctx) {
    const status = LIVE_TABS.includes(val(ctx, 'status')) ? val(ctx, 'status') : 'all', d = select('admin.live', { status }); if (!d) return fallback('resourceDenied', ctx);
    const nav = tabs(LIVE_TABS.map(id => ({ id, label: label('liveTab.' + id), href: url(ctx, { status: id === 'all' ? null : id, record: null }), count: id === 'all' ? d.total : d.counts[id] })), status, { label: label('tabsLabel'), id: 'admin-tabs' });
    const cols = [{ key: 'title', label: label('col.session'), render: r => `<span class="font-medium" dir="auto">${esc(L(r.title))}</span> <span class="text-xs muted"><bdi>${esc(r.id)}</bdi></span>` }, { key: 'course_title', label: label('col.course'), render: r => `<span dir="auto">${esc(L(r.course_title))}</span>` }, { key: 'host', label: label('col.host'), render: r => esc(L(r.host)) }, { key: 'starts_at', label: label('col.starts'), render: r => when(r.starts_at) }, { key: 'status', label: label('col.status'), render: r => badge(r.status, { domain: 'live' }) }, { key: 'present', label: label('col.attendance'), align: 'end', render: r => num(r.present) }, { key: 'recording', label: label('col.recording'), render: r => r.recording ? badge(r.recording.state, { domain: 'content' }) : esc('—') }, { key: 'incidents', label: label('col.incidents'), align: 'end', render: r => num(r.incidents.length) }];
    const id = val(ctx, 'record'), row = d.rows.find(r => r.id === id) ?? select('admin.live', {}).rows.find(r => r.id === id);
    return screen(ctx, head(ctx) + `<div class="mb-6">${notice({ message: label('liveNote') })}</div>` + nav + tabBody(status, panel('list-title', label('liveTab.' + status), table(cols, d.rows, { caption: label('liveTab.' + status), empty: empty(), actions: r => openLink(ctx, r.id, label('incidents')) }))), id ? (row ? liveDrawer(row) : missingDrawer()) : '');
  },
  mount: mountRecord,
};
function liveDrawer(x) {
  const f = aform('incident:' + x.id);
  const list = x.incidents.length ? `<ol class="stack">${x.incidents.map(n => `<li class="rounded-xl border border-border p-3 text-sm"><p dir="auto">${esc(n.text)}</p><p class="text-xs muted mt-1">${esc(L(n.author) || label('unknownPerson'))} · ${when(n.created_at)}</p></li>`).join('')}</ol>` : `<p class="muted text-sm">${esc(label('noIncidents'))}</p>`;
  return recordDrawer(L(x.title), `${facts([[label('col.course'), `<span dir="auto">${esc(L(x.course_title))}</span>`], [label('col.host'), esc(L(x.host))], [label('col.starts'), when(x.starts_at)], [label('col.status'), badge(x.status, { domain: 'live' })], [label('col.attendance'), num(x.present)], [label('col.recording'), x.recording ? badge(x.recording.state, { domain: 'content' }) : esc('—')], [label('col.provider'), esc(label('providerDemo'))]])}${x.status === 'failed' ? notice({ message: label('failedSessionNote'), tone: 'warning' }) : ''}${sub(label('incidents'))}${list}<form class="stack" data-action="admin.addIncident" data-id="${esc(x.id)}" novalidate>${field(f, 'incident-note', 'note', label('incidentNote'), { type: 'textarea', rows: 3, required: true, hint: label('incidentHint') })}<div class="flex-row">${go('addIncident')}</div></form>`);
}

// ---------------------------------------------------------------- support and safety
const SUPPORT_TABS = ['tickets', 'flags', 'moderation'];
export const tickets = {
  render(ctx) {
    const tab = tabOf(ctx, SUPPORT_TABS), d = select('admin.tickets', {}), fl = select('admin.flags'); if (!d || !fl) return fallback('resourceDenied', ctx);
    const msgCols = [{ key: 'id', label: label('col.message'), render: r => num(r.id) }, { key: 'course_title', label: label('col.course'), render: r => `<span dir="auto">${esc(L(r.course_title))}</span>` }, { key: 'author_role', label: label('col.author'), render: r => esc(roleName(r.author_role)) }, { key: 'text', label: label('col.text'), render: r => r.open ? `<span dir="auto">${esc(r.text)}</span>` : chip(label('restrictedTitle'), 'warning', 'lock') }, { key: 'reports', label: label('col.reports'), align: 'end', render: r => num(r.reports) }, { key: 'created_at', label: label('col.created'), render: r => when(r.created_at) }];
    const body = {
      tickets: () => panel('list-title', label('tab.tickets'), table([{ key: 'subject', label: label('col.subject'), render: r => `<span class="font-medium" dir="auto">${esc(L(r.subject))}</span> <span class="text-xs muted"><bdi>${esc(r.id)}</bdi></span>` }, { key: 'requester_role', label: label('col.requester'), render: r => esc(roleName(r.requester_role)) }, { key: 'state', label: label('col.status'), render: r => badge(r.state, { domain: 'conversation' }) }, { key: 'assignee', label: label('col.assignee'), render: r => esc(L(r.assignee) || '—') }, { key: 'updated_at', label: label('col.updated'), render: r => when(r.updated_at) }, { key: 'replies', label: label('col.replies'), align: 'end', render: r => num(r.replies) }], d.rows, { caption: label('tab.tickets'), empty: empty('queueEmpty'), actions: r => openLink(ctx, r.id) })),
      flags: () => panel('list-title', label('tab.flags'), table(msgCols, fl.flagged, { caption: label('tab.flags'), empty: empty('queueEmpty'), actions: r => `<div class="flex-row">${r.open ? '' : askBtn('reveal', r.id, label('reveal'), { extra: 'message', iconName: 'lock' })}${askBtn('message', r.id, label('removeMessage'), { extra: 'remove', variant: 'danger' })}${askBtn('message', r.id, label('clearFlag'), { extra: 'clear', variant: 'ghost' })}</div>` })),
      moderation: () => panel('list-title', label('removedMessages'), table(msgCols, fl.removed, { caption: label('removedMessages'), empty: empty(), actions: r => `<div class="flex-row">${r.open ? '' : askBtn('reveal', r.id, label('reveal'), { extra: 'message', iconName: 'lock' })}${askBtn('message', r.id, label('restoreMessage'), { extra: 'restore' })}</div>` })) + panel('log-title', label('moderationLog'), auditList(fl.log)),
    }[tab]();
    const id = val(ctx, 'record');
    return screen(ctx, head(ctx) + `<div class="mb-6">${notice({ message: label('supportNote') })}</div>` + navTabs(ctx, SUPPORT_TABS, tab, { tickets: d.rows.filter(x => x.state !== 'resolved').length, flags: fl.flagged.length, moderation: fl.removed.length }) + tabBody(tab, body), tab === 'tickets' && id ? ticketDrawer(id) : '');
  },
  mount: mountRecord,
};
function ticketDrawer(id) {
  const d = select('admin.ticket', { id }); if (d.status !== 'ok') return missingDrawer();
  const x = d.ticket, f = aform('ticket:' + x.id), open = x.state !== 'resolved';
  const info = facts([[label('col.requester'), `${esc(L(x.requester) || '—')} · ${esc(roleName(x.requester_role))}`], [label('col.status'), badge(x.state, { domain: 'conversation' })], [label('col.assignee'), esc(L(x.assignee) || '—')], [label('col.created'), when(x.created_at)]]);
  const thread = d.locked ? locked('ticket', x.id) : `${notice({ message: label('revealedNote'), tone: 'success' })}${x.course_title ? `<p class="text-sm muted" dir="auto">${esc(label('relatedCourse', { title: L(x.course_title) }))}</p>` : ''}<blockquote class="rounded-xl bg-sand p-3" dir="auto">${esc(L(x.body))}</blockquote>${d.replies.length ? `<ol class="stack">${d.replies.map(r => `<li class="msg ${r.staff ? 'msg-own' : ''}"><div class="flex items-center justify-between gap-3 flex-wrap"><strong class="text-sm">${esc(L(r.author) || label('unknownPerson'))}${r.staff ? ' · ' + esc(label('staff')) : ''}</strong><span class="text-xs muted">${when(r.created_at)}</span></div><p class="mt-2 whitespace-pre-line" dir="auto">${esc(r.text)}</p></li>`).join('')}</ol>` : ''}${open ? `<form class="stack" data-action="admin.respond" data-id="${esc(x.id)}" novalidate>${field(f, 'ticket-reply', 'text', label('replyLabel'), { type: 'textarea', rows: 3, required: true })}<div class="flex-row">${go('sendReply')}</div></form>` : ''}`;
  const resolve = open ? `<div class="flex-row">${askBtn('resolveTicket', x.id, label('resolveTicket'), { variant: 'primary', iconName: 'checkCircle' })}</div>` : notice({ title: label('resolvedTitle'), message: x.resolution || label('resolvedTitle'), tone: 'success' });
  return recordDrawer(L(x.subject), `${info}${sub(label('thread'))}${thread}${sub(label('decision'))}${resolve}${sub(label('history'))}${auditList(d.history)}`);
}
export const communications = {
  render(ctx) {
    const d = select('admin.communications', {}); if (!d) return fallback('resourceDenied', ctx);
    const cols = [{ key: 'id', label: label('col.report'), render: r => num(r.id) }, { key: 'course_title', label: label('col.course'), render: r => `<span dir="auto">${esc(L(r.course_title))}</span>` }, { key: 'kind', label: label('col.kind'), render: r => esc(label('reportKind.' + r.kind)) }, { key: 'reason', label: label('col.reason'), render: r => `<span dir="auto">${esc(L(r.reason))}</span>` }, { key: 'state', label: label('col.status'), render: r => badge(r.state, { domain: 'conversation' }) }, { key: 'assignee', label: label('col.assignee'), render: r => esc(L(r.assignee) || '—') }, { key: 'created_at', label: label('col.reported'), render: r => when(r.created_at) }];
    const id = val(ctx, 'record');
    return screen(ctx, head(ctx) + `<div class="mb-6">${notice({ title: label('noDirectoryTitle'), message: label('noDirectory') })}</div>` + panel('list-title', label('commReports'), table(cols, d.rows, { caption: label('commReports'), empty: empty('queueEmpty'), actions: r => openLink(ctx, r.id, label('review')) })), id ? commDrawer(id) : '');
  },
  mount: mountRecord,
};
function commDrawer(id) {
  const d = select('admin.communication', { id }); if (d.status !== 'ok') return missingDrawer();
  const r = d.report;
  const info = facts([[label('col.course'), `<span dir="auto">${esc(L(r.course_title))}</span>`], [label('col.kind'), esc(label('reportKind.' + r.kind))], [label('col.reason'), `<span dir="auto">${esc(L(r.reason))}</span>`], [label('col.reporter'), esc(roleName(r.reporter_role))], [label('col.status'), badge(r.state, { domain: 'conversation' })], [label('col.reported'), when(r.created_at)]]);
  const context = d.locked ? locked('safety_report', r.id) : `${notice({ message: label('contextOnly'), tone: 'info' })}${r.restricted_note ? `<p class="text-sm rounded-xl bg-sand p-3">${icon('lock', { size: 14 })} ${esc(r.restricted_note)}</p>` : ''}${d.subject ? `<p class="font-medium" dir="auto">${esc(L(d.subject))}</p>` : ''}<ol class="stack">${d.messages.map(m => `<li class="msg ${m.reported ? 'msg-internal' : ''}"><div class="flex items-center justify-between gap-3 flex-wrap"><strong class="text-sm">${esc(roleName(m.author_role))}</strong><span class="flex-row">${m.reported ? chip(label('reportedMessage'), 'warning', 'flag') : ''}${badge(m.state, { domain: 'moderation' })}</span></div><p class="mt-2 whitespace-pre-line" dir="auto">${esc(m.text)}</p>${m.reported && m.state !== 'removed' ? `<div class="flex-row mt-2">${askBtn('message', m.id, label('removeMessage'), { extra: 'remove', variant: 'danger' })}</div>` : ''}</li>`).join('')}</ol>`;
  const notes = r.notes.length ? `<ol class="stack">${r.notes.map(n => `<li class="rounded-xl border border-border p-3 text-sm msg-internal"><div class="flex-row">${badge(n.state, { domain: 'conversation' })}<span class="muted">${esc(L(n.author) || label('unknownPerson'))} · ${when(n.created_at)}</span></div><p class="mt-1" dir="auto">${esc(n.text)}</p></li>`).join('')}</ol>` : `<p class="muted text-sm">${esc(label('noNotes'))}</p>`;
  const moves = r.next.length ? `<div class="flex-row">${r.next.map(s => askBtn('safety', r.id, label('moveTo.' + s), { extra: s, variant: s === 'resolved' ? 'primary' : s === 'escalated' ? 'danger' : 'secondary' })).join('')}</div>` : notice({ message: label('reportClosed'), tone: 'success' });
  return recordDrawer(label('reportTitle', { id: r.id }), `${info}${sub(label('reportedContext'))}${context}${sub(label('internalReview'))}${notes}${moves}${sub(label('history'))}${auditList(d.history)}`);
}

// ---------------------------------------------------------------- CMS (super_admin only)
export const cmsHome = {
  render(ctx) {
    const d = select('admin.cms'); if (!d) return fallback('resourceDenied', ctx);
    const f = aform('cms-home'), chosen = new Set(hasErrors(f) && f.values.featured != null ? f.values.featured.split(',') : d.featured);
    const form = `<form class="stack" data-action="admin.saveHome" novalidate>${panel('banner-title', label('bannerEditor'), pair(f, 'home', 'title', d.banner?.title) + pair(f, 'home', 'body', d.banner?.body, { type: 'textarea' }))}${panel('featured-title', label('featuredCourses'), `<p class="text-sm muted">${esc(label('featuredHint'))}</p>${fe(f, 'featured') ? `<p class="text-sm text-accent">${esc(fe(f, 'featured'))}</p>` : ''}<fieldset><legend class="sr-only">${esc(label('featuredCourses'))}</legend><ul class="grid gap-2 sm:grid-cols-2">${d.courses.map(c => `<li><label class="work-row cursor-pointer"><input type="checkbox" name="featured" value="${esc(c.id)}" ${chosen.has(c.id) ? 'checked' : ''}><span class="min-w-0 flex-1"><span class="block font-medium" dir="auto">${esc(L(c.title))}</span><span class="block text-xs muted">${esc(gs(c))} · <bdi>${esc(c.id)}</bdi></span></span></label></li>`).join('')}</ul></fieldset>`)}<div class="flex-row">${go('saveHome')}${link('#/', label('viewHome'), 'ghost')}</div></form>`;
    const preview = `<section class="panel stack" aria-labelledby="preview-title"><p class="eyebrow">${esc(label('livePreview'))}</p><h2 id="preview-title" class="text-xl">${esc(L(d.banner?.title))}</h2><p class="muted">${esc(L(d.banner?.body))}</p><ol class="stack">${d.featured.map(id => d.courses.find(c => c.id === id)).filter(Boolean).map(c => `<li class="work-row"><span class="work-icon">${icon('book', { size: 16 })}</span><span class="min-w-0 flex-1" dir="auto">${esc(L(c.title))}</span></li>`).join('')}</ol><p class="text-xs muted">${esc(label('previewNote'))}</p></section>`;
    return screen(ctx, head(ctx) + `<div class="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]"><div class="min-w-0">${form}</div><div class="stack min-w-0">${preview}${panel('history-title', label('history'), auditList(d.history.filter(e => e.action === 'cms.update_home')))}</div></div>`);
  },
};
const PAGE_TABS = ['pages', 'faqs'];
const PAGE_HREF = { home: '#/', about: '#/about', help: '#/help', privacy: '#/legal/privacy', terms: '#/legal/terms', refunds: '#/legal/refunds' };
export const cmsPages = {
  render(ctx) {
    const tab = tabOf(ctx, PAGE_TABS), d = select('admin.cms'); if (!d) return fallback('resourceDenied', ctx);
    const body = tab === 'pages'
      ? table([{ key: 'slug', label: label('col.page'), render: r => `<span class="font-medium" dir="auto">${esc(L(r.title))}</span> <span class="text-xs muted"><bdi>/${esc(r.slug)}</bdi></span>` }, { key: 'status', label: label('col.status'), render: r => badge(r.status, { domain: 'content' }) + (r.policy ? ' ' + chip(label('policyDraft'), 'warning', 'flag') : '') }, { key: 'updated_at', label: label('col.updated'), render: r => when(r.updated_at) }], d.pages, { caption: label('tab.pages'), actions: r => `<div class="flex-row">${r.slug === 'home' ? link('#/admin/cms/home', label('edit')) : openLink(ctx, r.slug, label('edit'))}${link(PAGE_HREF[r.slug] ?? '#/', label('preview'), 'ghost')}</div>` })
      : `<ul class="stack">${d.faqs.map((q, i) => `<li class="rounded-xl border border-border p-3 stack"><p class="font-medium" dir="auto">${esc(L(q.title))}</p><p class="text-sm muted" dir="auto">${esc(L(q.body))}</p><div class="flex-row">${openLink(ctx, 'faq-' + i, label('edit'))}<button type="button" class="btn btn-ghost" data-action="admin.removeFaq" data-id="${i}">${esc(label('remove'))}</button></div></li>`).join('')}</ul><div class="flex-row">${link(url(ctx, { record: 'faq-new' }), label('addFaq'), 'primary')}${link('#/help', label('preview'), 'ghost')}</div>`;
    const id = val(ctx, 'record');
    let record = '';
    if (tab === 'pages' && id) { const p = d.pages.find(x => x.slug === id && x.slug !== 'home'); record = p ? pageDrawer(p) : missingDrawer(); }
    if (tab === 'faqs' && id) { const i = id === 'faq-new' ? null : Number(id.replace('faq-', '')); record = i === null || d.faqs[i] ? faqDrawer(i, i === null ? null : d.faqs[i]) : missingDrawer(); }
    return screen(ctx, head(ctx) + `<div class="mb-6">${notice({ title: label('policyDraftTitle'), message: label('policyDraftNote'), tone: 'warning' })}</div>` + navTabs(ctx, PAGE_TABS, tab, { pages: d.pages.length, faqs: d.faqs.length }) + tabBody(tab, panel('list-title', label('tab.' + tab), body) + panel('history-title', label('history'), auditList(d.history.filter(e => e.action !== 'cms.update_home')))), record);
  },
  mount: mountRecord,
};
function pageDrawer(p) {
  const f = aform('page:' + p.slug);
  return recordDrawer(label('editRecord', { name: L(p.title) }), `<form class="stack" data-action="admin.savePage" data-id="${esc(p.slug)}" novalidate>${p.policy ? notice({ message: label('policyDraftNote'), tone: 'warning' }) : ''}${pair(f, 'page', 'title', p.title)}${pair(f, 'page', 'body', p.body, { type: 'textarea', rows: 5 })}<div class="flex-row">${go('saveChanges')}${link(PAGE_HREF[p.slug] ?? '#/', label('preview'), 'ghost')}</div></form>`);
}
function faqDrawer(i, q) {
  const f = aform('faq:' + (i ?? 'new'));
  return recordDrawer(q ? label('editRecord', { name: L(q.title) }) : label('addFaq'), `<form class="stack" data-action="admin.saveFaq" data-id="${i ?? ''}" novalidate>${pair(f, 'faq', 'title', q?.title)}${pair(f, 'faq', 'body', q?.body, { type: 'textarea' })}${notice({ message: label('faqNote') })}<div class="flex-row">${go('saveChanges')}</div></form>`);
}
export const promotions = {
  render(ctx) {
    const d = select('admin.cms'); if (!d) return fallback('resourceDenied', ctx);
    const cards = d.promotions.map(p => `<section class="panel stack" aria-labelledby="promo-${esc(p.id)}"><div class="flex items-start justify-between gap-3 flex-wrap"><h2 id="promo-${esc(p.id)}" class="text-lg"><bdi>${esc(p.code)}</bdi></h2>${chip(label('configuredOff'), 'neutral', 'lock')}</div><p class="text-sm muted" dir="auto">${esc(L(p.label))}</p>${facts([[label('col.rate'), `<bdi>${esc((p.rate_bps / 100).toFixed(0))}%</bdi>`], [label('col.funding'), chip(label('fundingUnresolved'), 'warning', 'flag')], [label('col.status'), chip(label(p.active ? 'active' : 'inactive'), 'neutral')]])}<div class="grid gap-3 sm:grid-cols-2">${formField({ id: 'promo-code-' + p.id, name: 'code', label: label('col.code'), value: p.code, disabled: true })}${formField({ id: 'promo-rate-' + p.id, name: 'rate', label: label('col.rate'), type: 'number', value: p.rate_bps / 100, disabled: true })}</div><button type="button" class="btn btn-secondary" disabled title="${esc(label('fundingMissing'))}">${esc(label('enablePromotion'))}</button><small class="muted block">${esc(label('fundingMissing'))}</small></section>`).join('');
    return head(ctx) + `<div class="stack max-w-3xl">${notice({ title: label('promotionsOffTitle'), message: label('promotionsOff'), tone: 'warning' })}${cards}${notice({ message: label('noRedemption') })}</div>`;
  },
};

// ---------------------------------------------------------------- notifications (super_admin only)
const NOTIFY_TABS = ['templates', 'delivery'];
const fill = text => String(text).replace(/\{(\w+)\}/g, (_, k) => Object.hasOwn(dictionary, 'p8.sample.' + k) ? label('sample.' + k) : k);
export const notificationsAdmin = {
  render(ctx) {
    const tab = tabOf(ctx, NOTIFY_TABS), d = select('admin.notifications', { state: val(ctx, 'state'), channel: val(ctx, 'channel') }); if (!d) return fallback('resourceDenied', ctx);
    const body = tab === 'templates'
      ? `<ul class="grid gap-4 lg:grid-cols-2">${d.templates.map(x => `<li class="panel stack min-w-0"><div class="flex items-start justify-between gap-3 flex-wrap"><h2 class="text-base">${esc(label('event.' + x.event_type))}</h2><span class="flex-row">${chip(label('channel.' + x.channel), 'info', x.channel === 'email' ? 'mail' : 'bell')}${active(x.enabled)}</span></div><div class="grid gap-3 sm:grid-cols-2">${['ar', 'en'].map(lg => `<div class="rounded-xl bg-sand p-3 min-w-0" dir="${lg === 'ar' ? 'rtl' : 'ltr'}" lang="${lg}"><p class="text-xs muted">${esc(label('lang.' + lg))}</p><p class="font-medium mt-1">${esc(x.subject[lg])}</p><p class="text-sm mt-1">${esc(fill(x.body[lg]))}</p></div>`).join('')}</div><div class="flex-row">${openLink(ctx, x.id, label('edit'))}</div></li>`).join('')}</ul>`
      : filterForm(ctx, [{ name: 'state', label: label('col.status'), type: 'select', options: [allOpt(), ...['queued', 'sent', 'failed', 'read'].map(v => opt(v, t('status.delivery.' + v)))] }, { name: 'channel', label: label('col.channel'), type: 'select', options: [allOpt(), ...['in_app', 'email'].map(v => opt(v, label('channel.' + v)))] }]) + panel('list-title', label('deliveryAttempts', { count: d.attempts.length, total: d.total }), table([{ key: 'id', label: label('col.attempt'), render: r => num(r.id) }, { key: 'event_id', label: label('col.eventId'), render: r => `<bdi class="text-xs">${esc(r.event_id)}</bdi>` }, { key: 'title', label: label('col.notification'), render: r => `<span dir="auto">${esc(L(r.title))}</span>` }, { key: 'recipient_role', label: label('col.recipient'), render: r => esc(roleName(r.recipient_role)) }, { key: 'channel', label: label('col.channel'), render: r => esc(label('channel.' + r.channel)) }, { key: 'state', label: label('col.status'), render: r => badge(r.state, { domain: 'delivery' }) }, { key: 'attempts', label: label('col.attempts'), align: 'end', render: r => num(r.attempts) }, { key: 'last_error', label: label('col.lastError'), render: r => r.last_error ? esc(label('error.' + r.last_error)) : esc('—') }], d.attempts, { caption: label('tab.delivery'), empty: empty(), actions: r => ['failed', 'queued'].includes(r.state) ? `<button type="button" class="btn btn-secondary" data-action="admin.retry" data-id="${esc(r.id)}">${icon('refresh', { size: 16 })}<span>${esc(label('retry'))}</span></button>` : '' }));
    const id = val(ctx, 'record'), row = d.templates.find(x => x.id === id);
    return screen(ctx, head(ctx) + `<div class="mb-6">${notice({ message: label('notificationsNote') })}</div>` + navTabs(ctx, NOTIFY_TABS, tab, { templates: d.templates.length, delivery: d.counts.failed + d.counts.queued }) + tabBody(tab, body), tab === 'templates' && id ? (row ? templateDrawer(row) : missingDrawer()) : '');
  },
  mount: mountRecord,
};
function templateDrawer(x) {
  const f = aform('template:' + x.id);
  return recordDrawer(label('event.' + x.event_type), `<form class="stack" data-action="admin.saveTemplate" data-id="${esc(x.id)}" novalidate>${pair(f, 'tpl', 'subject', x.subject)}${pair(f, 'tpl', 'body', x.body, { type: 'textarea' })}<p class="text-sm muted">${esc(label('placeholdersHint', { list: [...new Set([...x.body.en.matchAll(/\{(\w+)\}/g)].map(m => '{' + m[1] + '}'))].join(' ') }))}</p>${formField({ id: 'tpl-enabled', name: 'enabled', label: label('templateEnabled'), type: 'checkbox', value: x.enabled })}<div class="flex-row">${go('saveChanges')}</div></form>`);
}

// ---------------------------------------------------------------- analytics and reports (super_admin only)
function reportData(ctx) { return select('admin.reports', { from: val(ctx, 'from'), to: val(ctx, 'to'), grade: val(ctx, 'grade'), course: val(ctx, 'course') }); }
export const analytics = {
  render(ctx) {
    const d = reportData(ctx); if (!d) return fallback('resourceDenied', ctx);
    const filters = `<form class="panel grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end mb-6" data-action="admin.filter" role="search" aria-label="${esc(t('filters'))}">${formField({ id: 'rep-from', name: 'from', label: label('col.from'), type: 'date', value: d.filters.from })}${formField({ id: 'rep-to', name: 'to', label: label('col.to'), type: 'date', value: d.filters.to })}${formField({ id: 'rep-grade', name: 'grade', label: label('col.grade'), type: 'select', value: d.filters.grade, options: [allOpt(), ...d.grades.map(g => opt(g.id, L(g.name)))] })}${formField({ id: 'rep-course', name: 'course', label: label('col.course'), type: 'select', value: d.filters.course, options: [allOpt(), ...d.courses.map(c => opt(c.id, `${L(c.title)} · ${c.id}`))] })}<div class="flex-row">${go('applyFilters')}${link(url(ctx, { from: null, to: null, grade: null, course: null }), t('resetFilters'), 'ghost')}</div></form>`;
    const stats = `<ul class="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-6">${[['enrollments', d.totals.enrollments], ['completions', d.totals.completions], ['courses', d.totals.courses], ['conversion', d.conversion.rate + '%']].map(([k, v]) => `<li class="panel min-w-0"><p class="text-sm muted">${esc(label('metric.' + k))}</p><p class="text-2xl font-semibold mt-1">${num(v)}</p></li>`).join('')}</ul>`;
    const kv = (title, obj, domain) => `<h3 class="text-base">${esc(title)}</h3><ul class="cycle-summary">${Object.entries(obj).map(([k, n]) => `<li><span class="flex-1 min-w-0">${domain ? esc(t(`status.${domain}.${k}`)) : esc(k)}</span><strong>${num(n)}</strong></li>`).join('')}</ul>`;
    const chart = (id, title, summary) => `<figure class="panel min-w-0" aria-labelledby="${id}-title"><h2 id="${id}-title" class="text-xl">${esc(title)}</h2><div class="chart-box mt-4"><canvas data-chart="${id}" role="img" aria-label="${esc(title)}" aria-describedby="${id}-summary"></canvas></div><figcaption class="mt-4"><p class="sr-only">${esc(t('p4.chartFallback'))}</p><div id="${id}-summary" class="stack">${summary}</div></figcaption></figure>`;
    const weekly = chart('weekly', label('chart.weekly'), `<ul class="cycle-summary">${d.weekly.map(w => `<li><span class="flex-1 min-w-0"><bdi>${esc(day(w.week + 'T08:00:00Z'))}</bdi></span><span class="text-sm">${esc(label('weekCounts', { enrollments: w.enrollments, completions: w.completions }))}</span></li>`).join('')}</ul>`);
    const catalog = chart('catalog', label('chart.catalog'), kv(label('chart.catalog'), d.catalog, 'course'));
    const learning = panel('learning-title', label('learningTitle'), table([{ key: 'title', label: label('col.course'), render: r => `<span dir="auto">${esc(L(r.title))}</span>` }, { key: 'learners', label: label('col.learners'), align: 'end', render: r => num(r.learners) }, { key: 'active', label: label('col.activeAccess'), align: 'end', render: r => num(r.active) }, { key: 'average', label: label('col.averageProgress'), align: 'end', render: r => num(r.average + '%') }], d.learning, { caption: label('learningTitle'), empty: empty() }));
    const { started, settled, rate, ...orderStates } = d.conversion;
    const conversion = panel('conversion-title', label('conversionTitle'), `<p class="text-sm muted">${esc(label('conversionNote', { started, settled, rate }))}</p>${kv(label('orderStates'), orderStates, 'order')}`);
    const support = panel('support-title', label('supportTitle'), kv(label('tab.tickets'), d.support.tickets, 'conversation') + kv(label('commReports'), d.support.reports, 'conversation'));
    return head(ctx, `<button type="button" class="btn btn-secondary" data-action="admin.exportCsv">${icon('download', { size: 16 })}<span>${esc(label('exportCsv'))}</span></button>`) + `<div class="mb-6">${notice({ message: label('reportsNoteFinance') })}</div>` + filters + stats + `<div class="grid gap-6 lg:grid-cols-2">${weekly}${catalog}</div><div class="grid gap-6 lg:grid-cols-2 mt-6">${learning}<div class="stack min-w-0">${conversion}${support}</div></div>`;
  },
  mount(root, ctx) {
    const d = reportData(ctx); if (!d) return () => {};
    const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#0F766E';
    return mountCharts(root, {
      weekly: { type: 'bar', data: { labels: d.weekly.map(w => day(w.week + 'T08:00:00Z')), datasets: [{ label: label('metric.enrollments'), data: d.weekly.map(w => w.enrollments), backgroundColor: primary, borderRadius: 6, maxBarThickness: 24 }, { label: label('metric.completions'), data: d.weekly.map(w => w.completions), backgroundColor: '#B7834A', borderRadius: 6, maxBarThickness: 24 }] }, options: { plugins: { legend: { display: true, position: 'bottom' } } } },
      catalog: { type: 'bar', data: { labels: Object.keys(d.catalog).map(k => t('status.course.' + k)), datasets: [{ label: label('chart.catalog'), data: Object.values(d.catalog), backgroundColor: '#5B8FA8', borderRadius: 6, maxBarThickness: 28 }] }, options: { indexAxis: 'y' } },
    }, ctx);
  },
};
// Synthetic CSV built from the same scoped selector the page shows; quoted to keep commas and Arabic text intact.
export function reportCsv(d) {
  const rows = [[label('csv.section'), label('csv.metric'), label('csv.value')], ...d.weekly.flatMap(w => [[label('chart.weekly'), `${w.week} ${label('metric.enrollments')}`, w.enrollments], [label('chart.weekly'), `${w.week} ${label('metric.completions')}`, w.completions]]), ...Object.entries(d.catalog).map(([k, n]) => [label('chart.catalog'), t('status.course.' + k), n]), ...d.learning.map(r => [label('learningTitle'), L(r.title), r.average + '%']), [label('conversionTitle'), label('metric.conversion'), d.conversion.rate + '%'], ...Object.entries(d.support.tickets).map(([k, n]) => [label('tab.tickets'), t('status.conversation.' + k), n])];
  return '﻿' + rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n') + '\r\n';
}

// ---------------------------------------------------------------- settings (super_admin only)
const PROTECTED = ['settings.manage_roles'];
export const roles = {
  render(ctx) {
    const d = select('admin.roles'); if (!d) return fallback('resourceDenied', ctx);
    const matrix = table([{ key: 'key', label: label('col.permission'), render: p => `<span class="font-medium">${esc(L(p.description))}</span> <span class="text-xs muted"><bdi>${esc(p.allowed_resource_type)}</bdi></span>` }, ...d.matrix.map(m => ({ key: m.role, label: roleName(m.role), render: p => m.permissions.includes(p.key) ? chip(label('granted'), 'success', 'check') : `<span class="muted" aria-label="${esc(label('notGranted'))}">—</span>` }))], d.permissions, { caption: label('matrix') });
    const staff = d.rows.filter(r => r.staff);
    const cols = [{ key: 'name', label: label('col.employee'), render: r => person(r.name, r.user_id) + (r.own ? ' ' + chip(label('you'), 'info', 'user') : '') }, { key: 'role', label: label('col.role'), render: r => esc(roleName(r.role)) }, { key: 'scope', label: label('col.scope'), render: r => esc(scopeText(r.scope)) }, { key: 'permissions', label: label('col.permissions'), align: 'end', render: r => num(r.permissions.length) }, { key: 'expires_at', label: label('col.expires'), render: r => esc(day(r.expires_at)) }, { key: 'status', label: label('col.status'), render: r => badge(r.status, { domain: 'account' }) }];
    const id = val(ctx, 'record'), row = staff.find(r => r.id === id);
    const rules = `<ul class="stack">${['ownerCore', 'independentApproval'].map(k => `<li class="work-row"><span class="work-icon">${icon('lock', { size: 18 })}</span><span class="min-w-0 flex-1"><span class="block font-medium">${esc(label('rule.' + k))}</span><span class="block text-xs muted">${esc(label('rule.' + k + 'Body'))}</span></span>${chip(label('locked'), 'warning', 'lock')}</li>`).join('')}</ul>`;
    return screen(ctx, head(ctx, link('#/admin/people/employees', label('openEmployees'))) + `<div class="stack">${panel('rules-title', label('protectedRules'), rules)}${panel('staff-title', label('staffScopes'), table(cols, staff, { caption: label('staffScopes'), actions: r => openLink(ctx, r.id, label('editScope')) }))}${panel('matrix-title', label('matrix'), matrix)}${panel('history-title', label('history'), auditList(d.history))}</div>`, id ? (row ? roleDrawer(row, d.permissions) : missingDrawer()) : '');
  },
  mount: mountRecord,
};
const scopeText = s => s?.module ? label('module.' + s.module) : s?.modules ? s.modules.map(m => label('module.' + m)).join(' · ') : s?.course_ids ? s.course_ids.join(', ') : label('allModules');
function roleDrawer(r, permissions) {
  const f = aform('role:' + r.id);
  const boxes = permissions.map(p => { const lockedOwn = r.own && PROTECTED.includes(p.key); return `<li><label class="flex-row min-h-11"><input type="checkbox" name="perm" value="${esc(p.key)}" ${r.permissions.includes(p.key) ? 'checked' : ''} ${lockedOwn ? 'disabled' : ''}><span class="min-w-0">${esc(L(p.description))}${lockedOwn ? ` <small class="muted">${esc(label('ownerCoreLocked'))}</small>` : ''}</span></label>${lockedOwn ? `<input type="hidden" name="perm" value="${esc(p.key)}">` : ''}</li>`; }).join('');
  return recordDrawer(label('editScopeFor', { name: L(r.name) }), `${facts([[label('col.role'), esc(roleName(r.role))], [label('col.scope'), esc(scopeText(r.scope))], [label('col.effective'), esc(day(r.effective_at))]])}<form class="stack" data-action="admin.saveRole" data-id="${esc(r.id)}" novalidate><fieldset class="stack"><legend class="font-medium">${esc(label('col.permissions'))}</legend>${fe(f, 'permissions') ? `<p class="text-sm text-accent">${esc(fe(f, 'permissions'))}</p>` : ''}<ul class="grid gap-1 sm:grid-cols-2">${boxes}</ul></fieldset><label class="flex-row min-h-11"><input type="checkbox" checked disabled><span>${esc(label('rule.independentApproval'))} <small class="muted">${esc(label('locked'))}</small></span></label>${field(f, 'role-expires', 'expires', label('col.expires'), { type: 'date', value: r.expires_at?.slice(0, 10) ?? '' })}${field(f, 'role-reason', 'reason', label('reasonLabel'), { type: 'textarea', rows: 2, required: true, hint: label('reasonHint') })}<div class="flex-row">${go('saveAudited')}</div></form>`);
}
const SECURITY_TABS = ['security', 'audit'];
export const security = {
  render(ctx) {
    const tab = tabOf(ctx, SECURITY_TABS), d = select('admin.security', { actor: val(ctx, 'actor'), action: val(ctx, 'action'), type: val(ctx, 'type'), q: val(ctx, 'q') }); if (!d) return fallback('resourceDenied', ctx);
    const body = tab === 'security'
      ? notice({ title: label('mockTitle'), message: label('mockMfa'), tone: 'warning' }) + panel('list-title', label('staffSecurity'), table([{ key: 'name', label: label('col.employee'), render: r => person(r.name, r.id) + (r.own ? ' ' + chip(label('you'), 'info', 'user') : '') }, { key: 'role', label: label('col.role'), render: r => esc(roleName(r.role)) }, { key: 'mfa', label: label('col.mfa'), render: r => badge(r.mfa, { domain: 'mfa' }) }, { key: 'sessions', label: label('col.sessions'), render: r => r.sessions_revoked_at ? esc(label('sessionsRevokedAt', { date: day(r.sessions_revoked_at) })) : esc(label('sessionsActive')) }], d.staff, { caption: label('staffSecurity'), actions: r => `<div class="flex-row">${r.own ? '' : askBtn('security', r.id, label(r.mfa === 'enrolled' ? 'resetMfa' : 'markEnrolled'), { extra: r.mfa === 'enrolled' ? 'resetMfa' : 'markEnrolled' })}${askBtn('security', r.id, label('revokeSessions'), { extra: 'revokeSessions', variant: 'ghost' })}</div>` }))
      : notice({ message: label('appendOnly') }) + filterForm(ctx, [{ name: 'q', label: label('search') }, { name: 'actor', label: label('col.actor'), type: 'select', options: [allOpt(), ...d.facets.actors.map(a => opt(a.id, L(a.name) || a.id))] }, { name: 'action', label: label('col.action'), type: 'select', options: [allOpt(), ...d.facets.actions.map(a => opt(a, auditName(a)))] }, { name: 'type', label: label('col.resource'), type: 'select', options: [allOpt(), ...d.facets.types.map(a => opt(a, label('resource.' + a)))] }]) + panel('list-title', label('auditCount', { count: d.events.length, total: d.total }), table([{ key: 'created_at', label: label('col.when'), render: e => when(e.created_at) }, { key: 'actor', label: label('col.actor'), render: e => esc(L(e.actor) || label('unknownPerson')) }, { key: 'action', label: label('col.action'), render: e => esc(auditName(e.action)) }, { key: 'resource', label: label('col.resource'), render: e => `${esc(label('resource.' + e.resource_type))} · <bdi>${esc(e.resource_id)}</bdi>` }, { key: 'change', label: label('col.change'), render: e => `<bdi dir="ltr" class="text-xs">${esc(e.before_summary || '—')} → ${esc(e.after_summary || '—')}</bdi>` }, { key: 'reason', label: label('col.reason'), render: e => `<span dir="auto">${esc(e.reason || '—')}</span>` }], d.events, { caption: label('tab.audit'), empty: empty() }));
    return screen(ctx, head(ctx) + navTabs(ctx, SECURITY_TABS, tab, { audit: d.total }) + tabBody(tab, body));
  },
};
export const integrations = {
  render(ctx) {
    const d = select('admin.integrations'); if (!d) return fallback('resourceDenied', ctx);
    const cards = d.rows.map(r => `<li class="panel stack min-w-0"><div class="flex items-start justify-between gap-3 flex-wrap"><h2 class="text-lg">${esc(label('integration.' + r.key))}</h2>${badge(r.status, { domain: 'integration' })}</div><p class="text-sm muted">${esc(label('integrationBody.' + r.key))}</p>${r.last ? notice({ title: label('testResult'), message: label('testOutcome', { reference: r.last.reference, latency: r.last.latency_ms, run: r.last.run }), tone: 'success' }) : `<p class="text-sm muted">${esc(label('neverTested'))}</p>`}<div class="flex-row"><button type="button" class="btn btn-secondary" data-action="admin.testIntegration" data-id="${esc(r.key)}">${icon('refresh', { size: 16 })}<span>${esc(label('testConnection'))}</span></button></div></li>`).join('');
    return head(ctx) + `<div class="stack">${notice({ title: label('noKeysTitle'), message: label('noKeys'), tone: 'warning' })}<ul class="grid gap-4 md:grid-cols-3">${cards}</ul>${panel('history-title', label('history'), auditList(d.history))}</div>`;
  },
};
// Policy register: CONFIRMED items cite the stakeholder decision register; OPEN items are never resolved here.
const POLICIES = [['gradesScope', 'confirmed', 'DEC-01'], ['guardianLinks', 'confirmed', 'DEC-09'], ['teacherApproval', 'confirmed', 'DEC-10'], ['singleOwner', 'confirmed', 'DEC-11'], ['staffDelegation', 'confirmed', 'DEC-13'], ['centralPayments', 'confirmed', 'DEC-14'], ['accessGrants', 'proposed', ''], ['independentPayout', 'proposed', ''], ['sensitiveReads', 'proposed', ''], ['accessDuration', 'open', ''], ['refundWindow', 'open', ''], ['commissionRate', 'open', ''], ['payoutCadence', 'open', ''], ['taxTreatment', 'open', ''], ['guardianVisibility', 'open', ''], ['dataRetention', 'open', '']];
export const policies = {
  render(ctx) {
    const d = select('admin.policies'); if (!d) return fallback('resourceDenied', ctx);
    const counts = Object.fromEntries(['confirmed', 'proposed', 'open'].map(k => [k, POLICIES.filter(p => p[1] === k).length]));
    const rows = POLICIES.map(([key, status, ref]) => ({ id: key, status, ref }));
    return head(ctx) + `<div class="stack">${notice({ title: L(d.settings.policy_labels), message: label('policiesNote'), tone: 'warning' })}<ul class="grid gap-3 grid-cols-3">${Object.entries(counts).map(([k, n]) => `<li class="panel min-w-0 text-center">${badge(k, { domain: 'policy' })}<p class="text-2xl font-semibold mt-2">${num(n)}</p></li>`).join('')}</ul>${panel('list-title', label('policyRegister'), table([{ key: 'id', label: label('col.policy'), render: r => `<span class="font-medium">${esc(label('policy.' + r.id))}</span><span class="block text-sm muted">${esc(label('policyBody.' + r.id))}</span>` }, { key: 'status', label: label('col.status'), render: r => badge(r.status, { domain: 'policy' }) }, { key: 'ref', label: label('col.reference'), render: r => r.ref ? num(r.ref) : esc(label('noReference')) }], rows, { caption: label('policyRegister') }))}</div>`;
  },
};

// ---------------------------------------------------------------- finance (P8b: admin_finance and super_admin)
// Every figure is read from `finance.*` selectors derived from ledger journals and allocations; every action goes
// through a store reducer that re-checks the finance scope, the specific permission and (for approval) that the
// approver is not the preparer. Disabled controls always explain why next to the control.
const F = (key, params) => t('p8.fin.' + key, params);
const pct = bps => `<bdi>${esc((bps / 100).toFixed(bps % 100 ? 2 : 0))}%</bdi>`;
const code = v => `<bdi class="break-all">${esc(v ?? '—')}</bdi>`;
const omrOrDash = v => v === null || v === undefined ? `<span class="muted">${esc(F('unconfirmed'))}</span>` : omr(v);
const finDenied = ctx => fallback('resourceDenied', ctx);
const matchChip = okay => okay ? chip(F('matches'), 'success', 'check') : chip(F('mismatch'), 'danger', 'x');
const ORDER_STATES = ['draft', 'pending', 'paid', 'failed', 'cancelled', 'partially_refunded', 'refunded'];
const PAYMENT_STATES = ['initiated', 'pending', 'succeeded', 'failed', 'refunded', 'partially_refunded'];
const STATE_TONES = { pending: 'warning', available: 'success', reserved: 'warning', in_payout: 'info', paid: 'success' };
// Direct (unreasoned) finance action; a disabled control carries its reason visibly and as a title.
function act(op, id, text, { variant = 'secondary', disabled = '', iconName = null, extra = '' } = {}) {
  const button = `<button type="button" class="btn btn-${variant}" data-action="admin.fin" data-op="${esc(op)}" data-id="${esc(id)}"${extra ? ` data-extra="${esc(extra)}"` : ''}${disabled ? ` disabled title="${esc(disabled)}"` : ''}>${iconName ? icon(iconName, { size: 16 }) : ''}<span>${esc(text)}</span></button>`;
  return disabled ? `<span class="inline-flex flex-col gap-1 min-w-0">${button}<small class="muted">${esc(disabled)}</small></span>` : button;
}
const reasonAct = (op, id, text, { variant = 'secondary', disabled = '', iconName = null, extra = '' } = {}) => disabled ? act(op, id, text, { variant, disabled, iconName }) : askBtn(op, id, text, { extra, variant, iconName });
const snapLine = sn => `${pct(sn.rate_bps)} · ${omr(sn.platform_baisa)} / ${omr(sn.teacher_baisa)} <span class="text-xs muted">${code(sn.rule_id)} v${num(sn.version)}</span>`;
const sourceLink = j => j.href ? `<a class="underline" href="${esc(j.href)}">${esc(F('source.' + j.source_type))} · ${code(j.source_id)}</a>` : `${esc(F('source.' + j.source_type))} · ${code(j.source_id)}`;
function journalsBlock(list, limit = 40) {
  if (!list.length) return `<p class="muted text-sm">${esc(F('noJournals'))}</p>`;
  return `<ol class="stack">${list.slice(0, limit).map(j => `<li class="rounded-xl border border-border p-3 stack min-w-0"><div class="flex items-start justify-between gap-3 flex-wrap"><div class="min-w-0"><p class="font-medium">${esc(F('journal.' + j.kind))} ${j.reversal ? chip(F('reversal'), 'warning', 'refresh') : ''}</p><p class="text-xs muted mt-1">${code(j.id)} · ${sourceLink(j)} · ${when(j.created_at)}${j.teacher ? ` · <span dir="auto">${esc(L(j.teacher))}</span>` : ''}</p></div>${j.balanced ? chip(F('balanced'), 'success', 'check') : chip(F('unbalanced'), 'danger', 'x')}</div>
    <table class="w-full text-sm"><caption class="sr-only">${esc(F('journalLines', { id: j.id }))}</caption><thead><tr><th scope="col" class="text-start">${esc(F('col.account'))}</th><th scope="col" class="text-end">${esc(F('col.debit'))}</th><th scope="col" class="text-end">${esc(F('col.credit'))}</th></tr></thead><tbody>${j.lines.map(e => `<tr><td class="text-start">${esc(F('account.' + e.account))}</td><td class="text-end">${e.debit_baisa ? omr(e.debit_baisa) : '—'}</td><td class="text-end">${e.credit_baisa ? omr(e.credit_baisa) : '—'}</td></tr>`).join('')}</tbody></table></li>`).join('')}</ol>${list.length > limit ? `<p class="text-sm muted">${esc(F('moreJournals', { count: list.length - limit }))}</p>` : ''}`;
}
const chartFigure = (id, title, summary) => `<figure class="panel min-w-0" aria-labelledby="${id}-title"><h2 id="${id}-title" class="text-xl">${esc(title)}</h2><div class="chart-box mt-4"><canvas data-chart="${id}" role="img" aria-label="${esc(title)}" aria-describedby="${id}-summary"></canvas></div><figcaption class="mt-4"><p class="sr-only">${esc(t('p4.chartFallback'))}</p><div id="${id}-summary" class="stack min-w-0">${summary}</div></figcaption></figure>`;
const dueRow = (iconName, text, count, href, tone = 'warning') => `<li><a class="work-row" href="${esc(href)}"><span class="work-icon">${icon(iconName, { size: 18 })}</span><span class="min-w-0 flex-1 font-medium">${esc(text)}</span>${chip(F('countShort', { count }), count ? tone : 'neutral')}</a></li>`;
const finScreen = (ctx, body, record = '') => screen(ctx, `<div class="mb-6">${notice({ message: F('demoMoney') })}</div>` + body, record);

// ---------------------------------------------------------------- finance: dashboard
export const financeHome = {
  render(ctx) {
    const d = select('finance.dashboard'); if (!d) return finDenied(ctx);
    const s = d.summary;
    const tiles = `<ul class="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">${[
      ['gross', omr(s.gross), 'receipt', '/admin/finance/orders'], ['commission', omr(s.commission), 'creditCard', '/admin/finance/commissions'], ['payables', omr(s.payables), 'banknote', '/admin/finance/earnings'],
      ['paidOut', omr(s.paid), 'checkCircle', '/admin/finance/payouts?tab=batches'], ['refunded', omr(d.refunds.succeeded), 'refresh', '/admin/finance/refunds'], ['exceptions', num(d.exceptions.length), 'flag', '/admin/finance/reconciliation'],
    ].map(([k, v, i, h]) => tile(F('metric.' + k), v, i, h)).join('')}</ul>`;
    const payables = chartFigure('payables', F('payablesTitle'), table([{ key: 'state', label: F('col.state'), render: r => badge(r.state, { domain: 'earning' }) }, { key: 'ledger', label: F('col.ledger'), align: 'end', render: r => omr(r.ledger) }, { key: 'allocations', label: F('col.allocations'), align: 'end', render: r => omr(r.allocations) }, { key: 'match', label: F('col.match'), render: r => matchChip(r.ledger === r.allocations) }], d.payables.map(p => ({ ...p, id: p.state })), { caption: F('payablesTitle') }) + (d.recoverable ? `<p class="text-sm">${esc(F('recoverableNote'))} ${omr(d.recoverable)}</p>` : ''));
    const due = d.due, own = due.UnderReview.filter(b => !b.can_approve).length;
    const actions = panel('due-title', F('dueTitle'), `<ul class="stack">${[
      ['checkCircle', F('due.approve'), due.UnderReview.length - own, '#/admin/finance/payouts?tab=approvals'], ['banknote', F('due.release'), due.Approved.length, '#/admin/finance/payouts?tab=batches'],
      ['refresh', F('due.confirm'), due.Processing.length, '#/admin/finance/payouts?tab=batches', 'info'], ['flag', F('due.failed'), due.Failed.length, '#/admin/finance/payouts?tab=batches', 'danger'],
      ['edit', F('due.drafts'), due.Draft.length, '#/admin/finance/payouts?tab=batches', 'neutral'], ['clock', F('due.holds'), due.holds, '#/admin/finance/earnings'], ['plus', F('due.available'), due.available, '#/admin/finance/payouts?tab=batches', 'info'],
      ['shield', F('due.accounts'), due.accounts, '#/admin/finance/payouts?tab=accounts'], ['receipt', F('due.refunds'), due.refunds, '#/admin/finance/refunds'], ['flag', F('due.disputes'), due.disputes, '#/admin/finance/refunds?tab=disputes'],
    ].map(r => dueRow(...r)).join('')}</ul>${own ? `<p class="text-sm muted">${esc(F('ownBatchesNote', { count: own }))}</p>` : ''}`);
    const exceptions = panel('exceptions-title', F('exceptionsTitle'), d.exceptions.length ? `<ul class="stack">${d.exceptions.slice(0, 6).map(l => `<li><a class="work-row" href="#/admin/finance/reconciliation?record=${esc(encodeURIComponent(l.key))}"><span class="work-icon">${icon('flag', { size: 18 })}</span><span class="min-w-0 flex-1"><span class="block font-medium">${esc(F('kind.' + l.kind))} · ${code(l.id)}</span><span class="block text-xs muted">${esc(F('reason.' + l.reason))}</span></span>${omrOrDash(l.provider_baisa)}</a></li>`).join('')}</ul>` : `<p class="muted">${esc(F('noExceptions'))}</p>`, link('#/admin/finance/reconciliation', F('openReconciliation'), 'ghost'));
    const integrity = notice({ title: F('integrityTitle'), message: F('integrityBody', { count: d.journals, unbalanced: d.unbalanced }) + ' ' + F(d.reconciled ? 'statesReconciled' : 'statesMismatch'), tone: d.unbalanced || !d.reconciled ? 'danger' : 'success' });
    return pageHeader({ title: L(ctx.route.title), subtitle: `${label('intro./admin/finance')} · ${t('footer.demoDate')}` }) + `<div class="stack">${notice({ message: F('demoMoney') })}${tiles}<div class="dash-grid"><div class="stack min-w-0">${payables}${integrity}</div><div class="stack min-w-0">${actions}${exceptions}</div></div></div>`;
  },
  mount(root) {
    const d = select('finance.dashboard'); if (!d) return () => {};
    const css = getComputedStyle(document.documentElement), primary = css.getPropertyValue('--primary').trim() || '#0F766E';
    return mountCharts(root, { payables: { type: 'bar', data: { labels: d.payables.map(p => t('status.earning.' + p.state)), datasets: [{ label: F('col.ledger'), data: d.payables.map(p => p.ledger / 1000), backgroundColor: [primary, '#5B8FA8', '#B7834A', '#7C6FB0', '#3F8F5F'], borderRadius: 6, maxBarThickness: 36 }] }, options: { plugins: { tooltip: { callbacks: { label: c => money(Math.round(c.raw * 1000)) } } } } } });
  },
};

// ---------------------------------------------------------------- finance: orders and transactions
const ORDER_TABS = ['orders', 'transactions'];
export const financeOrders = {
  render(ctx) {
    const tab = tabOf(ctx, ORDER_TABS), d = select('finance.orders', { q: val(ctx, 'q'), state: val(ctx, 'state') }); if (!d) return finDenied(ctx);
    const states = tab === 'orders' ? ORDER_STATES.map(v => opt(v, t('status.order.' + v))) : PAYMENT_STATES.map(v => opt(v, t('status.payment.' + v)));
    const filters = filterForm(ctx, [{ name: 'q', label: F('searchOrders') }, { name: 'state', label: label('col.status'), type: 'select', options: [allOpt(), ...states] }]);
    const body = tab === 'orders'
      ? panel('list-title', label('resultsCount', { count: d.rows.length, total: d.total }), table([
        { key: 'id', label: F('col.order'), render: o => `${code(o.id)}<span class="block text-xs muted">${when(o.created_at)}</span>` },
        { key: 'buyer', label: F('col.buyer'), render: o => person(o.buyer) + `<span class="block text-xs muted">${esc(roleName(o.buyer_role))}</span>` },
        { key: 'items', label: F('col.beneficiaries'), render: o => `<ul class="stack">${o.items.map(i => `<li class="text-sm"><span dir="auto">${esc(L(i.beneficiary_name))}</span> · <span class="muted" dir="auto">${esc(L(i.title_snapshot))}</span></li>`).join('')}</ul>` },
        { key: 'total', label: F('total'), align: 'end', render: o => omr(o.total_baisa) }, { key: 'commission', label: F('metric.commission'), align: 'end', render: o => omr(o.commission) },
        { key: 'state', label: label('col.status'), render: o => badge(o.state, { domain: 'order' }) + (o.mismatch ? ' ' + chip(F('mismatch'), 'danger', 'x') : '') },
        { key: 'attempts', label: F('col.attempts'), align: 'end', render: o => num(o.transactions.length) }], d.rows, { caption: label('tab.orders'), empty: empty(), actions: o => openLink(ctx, o.id, F('trace')) }))
      : panel('list-title', label('resultsCount', { count: d.transactions.length, total: d.transactions.length }), table([
        { key: 'id', label: F('col.transaction'), render: x => `${code(x.id)}<span class="block text-xs muted">${when(x.created_at)}</span>` }, { key: 'order', label: F('col.order'), render: x => code(x.order_id) },
        { key: 'attempt', label: F('col.attempt'), align: 'end', render: x => num(x.attempt_no) }, { key: 'amount', label: F('col.amount'), align: 'end', render: x => omr(x.amount_baisa) },
        { key: 'state', label: label('col.status'), render: x => badge(x.state, { domain: 'payment' }) }, { key: 'ref', label: F('col.reference'), render: x => code(x.provider_ref) },
        { key: 'events', label: F('col.events'), align: 'end', render: x => num(x.events.length) }, { key: 'check', label: F('col.match'), render: x => matchChip(!x.mismatch) }], d.transactions, { caption: label('tab.transactions'), empty: empty(), actions: x => openLink(ctx, x.id, F('trace')) }));
    const id = val(ctx, 'record');
    return finScreen(ctx, head(ctx) + navTabs(ctx, ORDER_TABS, tab, { orders: d.total, transactions: d.transactions.length }) + tabBody(tab, filters + body), id ? traceDrawer(id) : '');
  },
  mount: mountRecord,
};
function traceDrawer(id) {
  const d = select('finance.trace', { id }); if (d.status !== 'ok') return missingDrawer();
  const o = d.order;
  const items = `<ul class="stack">${o.items.map(i => `<li class="rounded-xl border border-border p-3 stack min-w-0"><div class="flex items-start justify-between gap-3 flex-wrap"><p class="font-medium min-w-0" dir="auto">${esc(L(i.title_snapshot))}</p>${code(i.id)}</div>${facts([[F('beneficiary'), person(i.beneficiary_name, i.beneficiary_student_id)], [F('owner'), person(i.teacher_name, i.owner_teacher_id_snapshot)], [F('total'), omr(i.total_baisa)], [F('snapshot'), snapLine(i.commission_snapshot)], [F('allocation'), i.allocation ? `${code(i.allocation.id)} ${badge(i.allocation.state, { domain: 'earning' })}` : '—'], [F('grant'), i.grant ? `${code(i.grant.id)} ${badge(i.grant.status, { domain: 'access' })}` : '—'], [F('refund'), i.refund ? `${code(i.refund.id)} ${badge(i.refund.state, { domain: 'refund' })}` : '—']])}</li>`).join('')}</ul>`;
  const txs = `<ol class="stack">${o.transactions.map(x => `<li class="rounded-xl border border-border p-3 stack min-w-0 ${x.id === d.focus ? 'tone-info' : ''}"><div class="flex items-start justify-between gap-3 flex-wrap"><p class="font-medium">${esc(F('attemptN', { n: x.attempt_no }))} · ${code(x.id)}</p>${badge(x.state, { domain: 'payment' })}</div><p class="text-sm">${omr(x.amount_baisa)} · ${code(x.provider_ref)} · ${when(x.confirmed_at ?? x.created_at)}</p>${x.events.length ? `<ul class="stack">${x.events.map(e => `<li class="text-sm rounded-lg bg-sand p-2"><span class="font-medium">${code(e.event_id)}</span> · ${esc(F('outcome.' + e.payload.outcome))} · ${omr(e.payload.amount_baisa)} · <bdi>${esc(e.payload.currency)}</bdi> ${chip(F('simulatedVerification'), 'info', 'shield')}</li>`).join('')}</ul>` : `<p class="text-sm muted">${esc(F('noEvents'))}</p>`}${x.mismatch ? chip(F('mismatch'), 'danger', 'x') : ''}</li>`).join('')}</ol>`;
  const totals = facts([[F('col.buyer'), person(o.buyer, o.buyer_user_id)], [label('col.status'), badge(o.state, { domain: 'order' })], [F('subtotal'), omr(o.subtotal_baisa)], [F('discount'), omr(o.discount_baisa)], [F('tax'), omr(o.tax_baisa)], [F('total'), `<strong>${omr(o.total_baisa)}</strong>`], [F('created'), when(o.created_at)]]);
  const extra = (d.refunds.length ? sub(label('tab.refunds')) + `<ul class="stack">${d.refunds.map(r => `<li class="work-row"><span class="min-w-0 flex-1">${code(r.id)} · ${code(r.order_item_id)} · ${omr(r.amount_baisa)}</span>${badge(r.state, { domain: 'refund' })}</li>`).join('')}</ul>` : '')
    + (d.adjustments.length ? sub(F('adjustments')) + `<ul class="stack">${d.adjustments.map(a => `<li class="work-row"><span class="min-w-0 flex-1">${code(a.id)} → ${code(a.original_allocation_id)} <span class="text-xs muted" dir="auto">${esc(L(a.reason))}</span></span><strong>${omr(a.signed_amount_baisa)}</strong></li>`).join('')}</ul>` : '');
  return recordDrawer(F('traceTitle', { id: o.id }), `${notice({ message: F('traceReadOnly') })}${totals}${sub(F('items'))}${items}${sub(F('attempts'))}${txs}${extra}${sub(F('journals'))}${journalsBlock(d.journals)}`);
}

// ---------------------------------------------------------------- finance: refunds, disputes, chargebacks
const REFUND_TABS = ['refunds', 'disputes', 'chargebacks'];
const itemCell = i => i ? `<span class="block font-medium" dir="auto">${esc(L(i.title_snapshot))}</span><span class="block text-xs muted">${code(i.id)} · ${code(i.order_id)} · <span dir="auto">${esc(L(i.beneficiary_name))}</span></span>` : '—';
const itemOption = i => opt(i.id, `${i.id} · ${L(i.title_snapshot)} · ${L(i.beneficiary_name)} · ${money(i.total_baisa)}`);
function refundActions(r, perms) {
  const no = perms.refund ? '' : F('noPermission.refund');
  if (['requested', 'under_review'].includes(r.state)) return `<div class="flex-row">${act('refundApprove', r.id, F('approve'), { variant: 'primary', disabled: no })}${reasonAct('refundReject', r.id, F('reject'), { variant: 'ghost', disabled: no })}</div>`;
  if (['approved', 'failed'].includes(r.state)) return `<div class="flex-row">${act('refundSuccess', r.id, F('simulateSuccess'), { variant: 'primary', disabled: no, iconName: 'check' })}${act('refundFailure', r.id, F('simulateFailure'), { variant: 'ghost', disabled: no, iconName: 'x' })}</div>`;
  return '';
}
function disputeActions(x, perms) {
  const no = perms.refund ? '' : F('noPermission.refund');
  if (!['open', 'under_review'].includes(x.state)) return '';
  return `<div class="flex-row">${x.state === 'open' ? act('disputeReview', x.id, F('startReview'), { disabled: no }) : ''}${reasonAct('disputeWon', x.id, F('disputeWon'), { variant: 'primary', disabled: no })}${reasonAct('disputeLost', x.id, F('disputeLost'), { variant: 'danger', disabled: no })}</div>`;
}
export const financeRefunds = {
  render(ctx) {
    const tab = tabOf(ctx, REFUND_TABS), d = select('finance.refunds'); if (!d) return finDenied(ctx);
    const id = val(ctx, 'record');
    let body, record = '';
    if (tab === 'refunds') {
      const f = aform('refund-request');
      const form = d.perms.refund ? panel('request-title', F('requestRefund'), `<form class="grid gap-3 md:grid-cols-2 items-end" data-action="admin.finRefundRequest" novalidate>${field(f, 'refund-item', 'orderItemId', F('orderItem'), { type: 'select', required: true, options: [opt('', F('chooseItem')), ...d.refundable.map(itemOption)] })}${field(f, 'refund-reason', 'reason', label('reasonLabel'), { type: 'textarea', rows: 2, required: true, hint: label('reasonHint') })}<div class="flex-row">${go('fin.submitRequest')}</div></form><p class="text-sm muted">${esc(F('itemLevelNote'))}</p>`) : notice({ message: F('noPermission.refund'), tone: 'warning' });
      body = form + panel('list-title', label('tab.refunds'), table([{ key: 'id', label: F('col.refund'), render: r => `${code(r.id)}<span class="block text-xs muted">${when(r.created_at)}</span>` }, { key: 'item', label: F('orderItem'), render: r => itemCell(r.item) }, { key: 'amount', label: F('col.amount'), align: 'end', render: r => omr(r.amount_baisa) }, { key: 'state', label: label('col.status'), render: r => badge(r.state, { domain: 'refund' }) }, { key: 'order', label: F('col.orderState'), render: r => r.order_state ? badge(r.order_state, { domain: 'order' }) : '—' }], d.refunds, { caption: label('tab.refunds'), empty: empty(), actions: r => `<div class="flex-row">${refundActions(r, d.perms)}${openLink(ctx, r.id)}</div>` }));
      if (id) { const r = d.refunds.find(x => x.id === id); record = r ? refundDrawer(r, d.perms) : missingDrawer(); }
    } else if (tab === 'disputes') {
      const f = aform('dispute-open');
      const form = d.perms.refund ? panel('dispute-title', F('openDispute'), `<form class="grid gap-3 md:grid-cols-2 items-end" data-action="admin.finDisputeOpen" novalidate>${field(f, 'dispute-item', 'orderItemId', F('orderItem'), { type: 'select', required: true, options: [opt('', F('chooseItem')), ...d.disputable.map(itemOption)] })}${field(f, 'dispute-reason', 'reason', label('reasonLabel'), { type: 'textarea', rows: 2, required: true, hint: label('reasonHint') })}<div class="flex-row">${go('fin.openDisputeBtn')}</div></form><p class="text-sm muted">${esc(F('disputeHoldNote'))}</p>`) : notice({ message: F('noPermission.refund'), tone: 'warning' });
      body = form + panel('list-title', label('tab.disputes'), table([{ key: 'id', label: F('col.dispute'), render: x => `${code(x.id)}<span class="block text-xs muted">${when(x.created_at)}</span>` }, { key: 'item', label: F('orderItem'), render: x => itemCell(x.item) }, { key: 'state', label: label('col.status'), render: x => badge(x.state, { domain: 'dispute' }) }, { key: 'held', label: F('col.held'), render: x => x.held.length ? x.held.map(a => `${code(a.id)} ${badge(a.state, { domain: 'earning' })}`).join(' ') : `<span class="muted text-sm">${esc(F('nothingHeld'))}</span>` }], d.disputes, { caption: label('tab.disputes'), empty: empty(), actions: x => `<div class="flex-row">${disputeActions(x, d.perms)}${openLink(ctx, x.id)}</div>` }));
      if (id) { const x = d.disputes.find(v => v.id === id); record = x ? disputeDrawer(x, d.perms) : missingDrawer(); }
    } else {
      const lost = d.disputes.filter(x => x.state === 'lost');
      body = notice({ message: F('chargebackNote') }) + panel('chargebacks-title', F('lostDisputes'), table([{ key: 'id', label: F('col.dispute'), render: x => code(x.id) }, { key: 'item', label: F('orderItem'), render: x => itemCell(x.item) }, { key: 'reason', label: label('col.reason'), render: x => `<span dir="auto" class="text-sm">${esc(L(x.reason))}</span>` }, { key: 'adj', label: F('adjustment'), align: 'end', render: x => x.adjustment ? omr(x.adjustment.signed_amount_baisa) : '—' }], lost, { caption: F('lostDisputes'), empty: empty() }))
        + panel('adjustments-title', F('adjustments'), table([{ key: 'id', label: F('adjustment'), render: a => `${code(a.id)}<span class="block text-xs muted">${when(a.created_at)}</span>` }, { key: 'orig', label: F('allocation'), render: a => `<a class="underline" href="#/admin/finance/earnings?record=${esc(a.original_allocation_id)}">${code(a.original_allocation_id)}</a>` }, { key: 'source', label: F('col.source'), render: a => esc(F(a.refund_id ? 'adjSource.refund' : a.dispute_id ? 'adjSource.dispute' : 'adjSource.manual')) + ' ' + code(a.refund_id ?? a.dispute_id ?? '') }, { key: 'teacher', label: label('col.teacher'), render: a => person(a.teacher) }, { key: 'amount', label: F('col.amount'), align: 'end', render: a => `<strong>${omr(a.signed_amount_baisa)}</strong>` }, { key: 'journal', label: F('col.journal'), render: a => code(a.journal_id) }], d.adjustments, { caption: F('adjustments'), empty: empty() }));
    }
    return finScreen(ctx, head(ctx) + navTabs(ctx, REFUND_TABS, tab, { refunds: d.refunds.length, disputes: d.disputes.length }) + tabBody(tab, body), record);
  },
  mount: mountRecord,
};
function refundDrawer(r, perms) {
  const siblings = r.siblings.length ? `<ul class="stack">${r.siblings.map(i => `<li class="rounded-xl border border-border p-3 stack"><p class="font-medium" dir="auto">${esc(L(i.title_snapshot))} · ${code(i.id)}</p><div class="flex-row text-sm">${esc(F('beneficiary'))}: <span dir="auto">${esc(L(i.beneficiary_name))}</span> ${i.grant ? badge(i.grant.status, { domain: 'access' }) : ''} ${i.allocation ? badge(i.allocation.state, { domain: 'earning' }) : ''}</div></li>`).join('')}</ul><p class="text-sm muted">${esc(F('siblingsNote'))}</p>` : `<p class="text-sm muted">${esc(F('noSiblings'))}</p>`;
  const adj = r.adjustment ? facts([[F('adjustment'), code(r.adjustment.id)], [F('col.amount'), `<strong>${omr(r.adjustment.signed_amount_baisa)}</strong>`], [F('allocation'), code(r.adjustment.original_allocation_id)], [F('col.journal'), code(r.adjustment.journal_id)]]) : `<p class="text-sm muted">${esc(F('noAdjustmentYet'))}</p>`;
  return recordDrawer(F('refundTitle', { id: r.id }), `${facts([[F('orderItem'), itemCell(r.item)], [F('col.amount'), omr(r.amount_baisa)], [label('col.status'), badge(r.state, { domain: 'refund' })], [F('col.orderState'), r.order_state ? badge(r.order_state, { domain: 'order' }) : '—'], [F('requestedBy'), person(r.requester)], [F('approvedBy'), person(r.approver)], [label('col.reason'), `<span dir="auto">${esc(L(r.reason))}</span>`]])}
    ${notice({ title: F('refundEffectTitle'), message: F('refundEffect') })}<div class="flex-row">${refundActions(r, perms)}</div>${sub(F('adjustment'))}${adj}${sub(F('siblings'))}${siblings}${sub(label('history'))}${auditList(r.history)}`);
}
function disputeDrawer(x, perms) {
  return recordDrawer(F('disputeTitle', { id: x.id }), `${facts([[F('orderItem'), itemCell(x.item)], [label('col.status'), badge(x.state, { domain: 'dispute' })], [label('col.reason'), `<span dir="auto">${esc(L(x.reason))}</span>`], [F('col.held'), x.held.length ? x.held.map(a => `${code(a.id)} ${badge(a.state, { domain: 'earning' })} ${omr(a.amount_baisa)}`).join('<br>') : esc(F('nothingHeld'))], [F('adjustment'), x.adjustment ? `${code(x.adjustment.id)} · ${omr(x.adjustment.signed_amount_baisa)}` : '—']])}
    ${notice({ message: F('disputeHoldNote') })}<div class="flex-row">${disputeActions(x, perms)}</div>${sub(label('history'))}${auditList(x.history)}`);
}

// ---------------------------------------------------------------- finance: commission rules
const ruleTarget = r => r.scope === 'default' ? F('allCourses') : r.scope === 'teacher' ? L(r.teacher) : `${L(r.course_title)} · ${r.course_id}`;
const ruleState = r => r.effective ? chip(F('effective'), 'success', 'checkCircle') : r.active ? chip(F('scheduled'), 'warning', 'clock') : chip(label('inactive'), 'neutral', 'x');
export const financeCommissions = {
  render(ctx) {
    const d = select('finance.commissions'); if (!d) return finDenied(ctx);
    const precedence = panel('precedence-title', F('precedenceTitle'), `<ol class="grid gap-3 md:grid-cols-3">${['campaign', 'teacher', 'default'].map((k, i) => `<li class="rounded-xl border border-border p-3 stack min-w-0"><div class="flex items-center gap-2"><span class="wizard-num" aria-hidden="true"><bdi>${i + 1}</bdi></span><span class="font-medium">${esc(F('scope.' + k))}</span></div><p class="text-sm muted">${esc(F('precedence.' + k))}</p></li>`).join('')}</ol>${notice({ title: F('snapshotTitle'), message: F('snapshotBody') })}`);
    const cols = [{ key: 'label', label: F('col.rule'), render: r => `<span class="block font-medium" dir="auto">${esc(L(r.label))}</span><span class="block text-xs muted">${code(r.id)} · v${num(r.version)}</span>` }, { key: 'scope', label: F('col.scope'), render: r => chip(F('scope.' + r.scope), 'info') }, { key: 'target', label: F('col.target'), render: r => `<span dir="auto">${esc(ruleTarget(r))}</span>` }, { key: 'rate', label: F('col.rate'), align: 'end', render: r => `<strong>${pct(r.rate_bps)}</strong>` }, { key: 'from', label: F('col.activeFrom'), render: r => esc(day(r.active_from)) }, { key: 'state', label: label('col.status'), render: ruleState }, { key: 'snaps', label: F('col.snapshots'), align: 'end', render: r => num(r.snapshots) }];
    const current = panel('rules-title', F('currentRules'), table(cols, d.current, { caption: F('currentRules'), actions: r => openLink(ctx, r.id, F('editRule')) }));
    const history = panel('versions-title', F('versionHistory'), table([{ key: 'id', label: F('col.rule'), render: r => `${code(r.id)} · v${num(r.version)}` }, { key: 'scope', label: F('col.scope'), render: r => esc(F('scope.' + r.scope)) }, { key: 'rate', label: F('col.rate'), align: 'end', render: r => pct(r.rate_bps) }, { key: 'until', label: F('col.until'), render: r => esc(day(r.active_until)) }, { key: 'next', label: F('col.supersededBy'), render: r => code(r.superseded_by) }, { key: 'snaps', label: F('col.snapshots'), align: 'end', render: r => num(r.snapshots) }], d.history, { caption: F('versionHistory'), empty: `<p class="muted text-sm">${esc(F('noVersions'))}</p>` }));
    const snaps = panel('snapshots-title', F('recentSnapshots'), table([{ key: 'item', label: F('orderItem'), render: x => `<span class="block font-medium" dir="auto">${esc(L(x.title))}</span><span class="block text-xs muted">${code(x.id)} · ${code(x.order_id)} · ${when(x.created_at)}</span>` }, { key: 'teacher', label: label('col.teacher'), render: x => person(x.teacher) }, { key: 'base', label: F('col.base'), align: 'end', render: x => omr(x.snapshot.base_baisa) }, { key: 'snap', label: F('snapshot'), render: x => snapLine(x.snapshot) }], d.snapshots, { caption: F('recentSnapshots') }));
    const id = val(ctx, 'record'), rule = d.current.find(r => r.id === id);
    const record = !id ? '' : id === 'new' ? ruleDrawer(null, d) : rule ? ruleDrawer(rule, d) : missingDrawer();
    return finScreen(ctx, head(ctx, d.teachers.length ? link(url(ctx, { record: 'new' }), F('newOverride'), 'primary') : '') + `<div class="stack">${precedence}${current}${snaps}${history}${panel('history-title', label('history'), auditList(d.audit))}</div>`, record);
  },
  mount: mountRecord,
};
function ruleDrawer(r, d) {
  const f = aform('rule:' + (r?.id ?? 'new'));
  const target = r ? facts([[F('col.scope'), esc(F('scope.' + r.scope))], [F('col.target'), `<span dir="auto">${esc(ruleTarget(r))}</span>`], [F('col.version'), num(r.version)], [F('col.rate'), pct(r.rate_bps)], [label('col.status'), ruleState(r)]]) : field(f, 'rule-teacher', 'teacherId', label('col.teacher'), { type: 'select', required: true, options: [opt('', F('chooseTeacher')), ...d.teachers.map(x => opt(x.id, `${L(x.name)} · ${x.id}`))] });
  return recordDrawer(r ? F('editRuleTitle', { id: r.id }) : F('newOverride'), `${notice({ message: F('versionNote') })}<form class="stack" data-action="admin.finCommission" data-id="${esc(r?.id ?? '')}" novalidate>${target}${field(f, 'rule-rate', 'rate', F('ratePercent'), { required: true, value: r ? String(r.rate_bps / 100) : '', hint: F('rateHint') })}${formField({ id: 'rule-active', name: 'active', label: F('ruleActive'), type: 'checkbox', value: f.values.active ? f.values.active === 'on' : r ? r.active : true, error: fe(f, 'active'), hint: r?.scope === 'default' ? F('defaultRequired') : '' })}${field(f, 'rule-reason', 'reason', label('reasonLabel'), { type: 'textarea', rows: 2, required: true, hint: label('reasonHint') })}<div class="flex-row">${go('fin.saveVersion')}</div></form>`);
}

// ---------------------------------------------------------------- finance: earnings and ledger
const EARNING_TABS = ['earnings', 'ledger'];
const holdNote = a => a.dispute_id ? F('heldByDispute', { id: a.dispute_id }) : a.batch_id ? F('inBatch', { id: a.batch_id }) : a.hold_reason === 'demo_hold_until_manual_release' || (a.state === 'pending' && !a.hold_reason) ? F('demoHold') : a.hold_reason === 'recovery_after_payout' ? F('recoveryNote') : a.hold_reason === 'manual_adjustment' ? F('manualNote') : typeof a.hold_reason === 'object' && a.hold_reason ? L(a.hold_reason) : a.original_allocation_id ? F('linkedTo', { id: a.original_allocation_id }) : '—';
export const financeEarnings = {
  render(ctx) {
    const tab = tabOf(ctx, EARNING_TABS), d = select('finance.earnings', { teacher: val(ctx, 'teacher'), kind: val(ctx, 'kind') }); if (!d) return finDenied(ctx);
    const teacherOpts = [allOpt(), ...d.statements.map(r => opt(r.id, `${L(r.name)} · ${r.id}`))];
    let body;
    if (tab === 'earnings') {
      const st = panel('statements-title', F('perTeacher'), table([{ key: 'name', label: label('col.teacher'), render: r => person(r.name, r.id) }, ...['pending', 'available', 'reserved', 'in_payout', 'paid'].map(k => ({ key: k, label: t('status.earning.' + k), align: 'end', render: r => omr(r.ledger[k]) })), { key: 'recoverable', label: F('recoverable'), align: 'end', render: r => omr(r.ledger.recoverable) }, { key: 'ok', label: F('col.match'), render: r => matchChip(r.reconciled) }], d.statements, { caption: F('perTeacher') }) + `<p class="text-sm muted">${esc(F('statementNote'))}</p>`);
      const allocs = panel('allocations-title', F('allocations'), table([{ key: 'id', label: F('allocation'), render: a => `${code(a.id)}<span class="block text-xs muted">${code(a.order_item_id)}</span>` }, { key: 'title', label: F('orderItem'), render: a => `<span dir="auto">${esc(L(a.title))}</span>` }, { key: 'teacher', label: label('col.teacher'), render: a => person(a.teacher) }, { key: 'amount', label: F('col.amount'), align: 'end', render: a => omr(a.amount_baisa) }, { key: 'state', label: label('col.status'), render: a => badge(a.state, { domain: 'earning' }) }, { key: 'note', label: F('col.note'), render: a => `<span class="text-sm">${esc(holdNote(a))}</span>` }], d.allocations, { caption: F('allocations'), empty: empty(), actions: a => `<div class="flex-row">${a.state === 'pending' ? act('releaseHold', a.id, F('releaseHold'), { variant: 'primary', disabled: d.perms.reconcile ? '' : F('noPermission.reconcile'), iconName: 'clock' }) : ''}${openLink(ctx, a.id)}</div>` }));
      body = filterForm(ctx, [{ name: 'teacher', label: label('col.teacher'), type: 'select', options: teacherOpts }]) + notice({ message: F('holdExplain') }) + st + allocs;
    } else {
      const kinds = [allOpt(), ...['SALE', 'RELEASE', 'HOLD', 'UNHOLD', 'RESERVE', 'UNRESERVE', 'PROCESS', 'PAID', 'REVERSE', 'REFUND', 'DISPUTE', 'ADJUST'].map(k => opt(k, F('journal.' + k)))];
      body = filterForm(ctx, [{ name: 'teacher', label: label('col.teacher'), type: 'select', options: teacherOpts }, { name: 'kind', label: F('col.journalType'), type: 'select', options: kinds }]) + notice({ title: F('integrityTitle'), message: F('integrityBody', { count: d.total, unbalanced: d.unbalanced }), tone: d.unbalanced ? 'danger' : 'success' }) + panel('journals-title', F('journalCount', { count: d.journals.length, total: d.total }), journalsBlock(d.journals, 60));
    }
    const id = val(ctx, 'record');
    return finScreen(ctx, head(ctx) + navTabs(ctx, EARNING_TABS, tab, { ledger: d.total }) + tabBody(tab, body), id ? allocationDrawer(id, d.perms) : '');
  },
  mount: mountRecord,
};
function allocationDrawer(id, perms) {
  const d = select('finance.allocation', { id }); if (d.status !== 'ok') return missingDrawer();
  const a = d.allocation, f = aform('adjust:' + a.id);
  const form = a.original_allocation_id ? notice({ message: F('adjustOnOriginal', { id: a.original_allocation_id }) }) : perms.reconcile ? `<form class="stack" data-action="admin.finAdjust" data-id="${esc(a.id)}" novalidate>${field(f, 'adj-amount', 'amount', F('signedAmount'), { required: true, hint: F('signedHint'), dir: 'ltr' })}${field(f, 'adj-reason', 'reason', label('reasonLabel'), { type: 'textarea', rows: 2, required: true, hint: label('reasonHint') })}<div class="flex-row">${go('fin.addAdjustment')}</div></form>` : notice({ message: F('noPermission.reconcile'), tone: 'warning' });
  return recordDrawer(F('allocationTitle', { id: a.id }), `${facts([[label('col.teacher'), person(a.teacher, a.teacher_id)], [F('orderItem'), d.item ? itemCell(d.item) : '—'], [F('col.amount'), `<strong>${omr(a.amount_baisa)}</strong>`], [label('col.status'), badge(a.state, { domain: 'earning' })], [F('snapshot'), snapLine(a.snapshot)], [F('col.note'), esc(holdNote(a))], [F('eligible'), esc(day(a.eligible_at))]])}
    ${a.state === 'pending' ? `<div class="flex-row">${act('releaseHold', a.id, F('releaseHold'), { variant: 'primary', disabled: perms.reconcile ? '' : F('noPermission.reconcile'), iconName: 'clock' })}</div>` : ''}${sub(F('manualAdjustment'))}<p class="text-sm muted">${esc(F('manualAdjustmentNote'))}</p>${form}
    ${d.adjustments.length ? sub(F('adjustments')) + `<ul class="stack">${d.adjustments.map(x => `<li class="work-row"><span class="min-w-0 flex-1">${code(x.id)} <span class="text-xs muted" dir="auto">${esc(L(x.reason))}</span></span><strong>${omr(x.signed_amount_baisa)}</strong></li>`).join('')}</ul>` : ''}${sub(F('journals'))}${journalsBlock(d.journals)}${sub(label('history'))}${auditList(d.history)}`);
}

// ---------------------------------------------------------------- finance: payout accounts, batches and approvals
const PAYOUT_TABS = ['accounts', 'batches', 'approvals'];
const approveBlock = b => b.can_approve ? '' : !b.independent ? F('samePreparerReason') : F('noPermission.approve');
function allocationPicker(list, checked = [], name = 'alloc') {
  if (!list.length) return `<p class="muted text-sm">${esc(F('noAvailable'))}</p>`;
  return `<ul class="stack">${list.map(a => `<li><label class="work-row min-h-11 cursor-pointer"><input type="checkbox" name="${name}" value="${esc(a.id)}" ${checked.includes(a.id) ? 'checked' : ''} ${a.verified === false ? 'disabled' : ''}><span class="min-w-0 flex-1"><span class="block font-medium">${code(a.id)} · <span dir="auto">${esc(L(a.teacher))}</span></span><span class="block text-xs muted" dir="auto">${esc(L(a.title))}${a.verified === false ? ' · ' + esc(F('accountNotVerified')) : ''}</span></span><strong>${omr(a.amount_baisa)}</strong></label></li>`).join('')}</ul>`;
}
const batchLink = b => `<a class="font-medium underline" href="#/admin/finance/payouts/${esc(b.id)}">${code(b.id)}</a>`;
export const financePayouts = {
  render(ctx) {
    const tab = tabOf(ctx, PAYOUT_TABS), d = select('finance.payouts'); if (!d) return finDenied(ctx);
    let body;
    if (tab === 'accounts') {
      body = notice({ message: F('maskedNote') }) + panel('accounts-title', label('tab.accounts'), table([{ key: 'teacher', label: label('col.teacher'), render: a => person(a.teacher, a.teacher_id) }, { key: 'beneficiary', label: F('beneficiaryName'), render: a => `<span dir="auto">${esc(L(a.beneficiary_name))}</span>` }, { key: 'iban', label: F('maskedIban'), render: a => `<bdi dir="ltr">${esc(a.masked_iban)}</bdi>` }, { key: 'state', label: label('col.status'), render: a => a.verification_state === 'verified' ? chip(F('verified'), 'success', 'checkCircle') : chip(F('unverified'), 'warning', 'clock') }, { key: 'change', label: F('changeRequest'), render: a => a.change_request ? `${chip(F('changePending'), 'warning', 'clock')}<span class="block text-sm mt-1"><span dir="auto">${esc(L(a.change_request.beneficiary_name))}</span> · <bdi dir="ltr">${esc(a.change_request.masked_iban)}</bdi></span><span class="block text-xs muted">${when(a.change_request.requested_at)}</span>` : `<span class="muted text-sm">${esc(F('noChange'))}</span>` }, { key: 'batches', label: F('openBatches'), render: a => a.batches.length ? a.batches.map(code).join(' ') : '—' }], d.accounts, { caption: label('tab.accounts'), actions: a => a.change_request ? `<div class="flex-row">${askBtn('accountApprove', a.id, F('verifyChange'), { variant: 'primary', iconName: 'check' })}${askBtn('accountReject', a.id, F('rejectChange'), { variant: 'ghost' })}</div>` : '' }) + `<p class="text-sm muted">${esc(F('changeInvalidates'))}</p>`);
    } else if (tab === 'batches') {
      const f = aform('batch-create');
      const prepare = d.perms.prepare ? panel('prepare-title', F('prepareTitle'), `<p class="text-sm muted">${esc(F('prepareIntro'))}</p><form class="stack" data-action="admin.finCreateBatch" novalidate><fieldset class="stack"><legend class="font-medium">${esc(F('availableAllocations'))}</legend>${fe(f, 'allocations') ? `<p class="text-sm text-accent" role="alert">${esc(fe(f, 'allocations'))}</p>` : ''}${allocationPicker(d.available)}</fieldset><div class="flex-row">${d.available.length ? go('fin.prepareDraft') : ''}</div></form>`) : notice({ message: F('noPermission.prepare'), tone: 'warning' });
      body = prepare + panel('batches-title', label('tab.batches'), table([{ key: 'id', label: F('col.batch'), render: b => `${batchLink(b)}<span class="block text-xs muted">${esc(L(b.period_label))}</span>` }, { key: 'state', label: label('col.status'), render: b => badge(b.state, { domain: 'payout_batch' }) }, { key: 'total', label: F('total'), align: 'end', render: b => omr(b.total_baisa) }, { key: 'items', label: F('col.items'), align: 'end', render: b => num(b.allocation_ids.length) }, { key: 'preparer', label: F('preparedBy'), render: b => person(b.preparer, b.prepared_by) + (b.preparer_is_actor ? ' ' + chip(label('you'), 'info', 'user') : '') }, { key: 'approver', label: F('approvedBy'), render: b => b.approved_by ? person(b.approver, b.approved_by) : '—' }], d.batches, { caption: label('tab.batches'), actions: b => link('#/admin/finance/payouts/' + b.id, F('openBatch')) }));
    } else {
      body = notice({ title: F('independenceTitle'), message: F('independenceBody') }) + (d.approvals.length ? `<ul class="grid gap-4 md:grid-cols-2">${d.approvals.map(b => `<li class="panel stack min-w-0"><div class="flex items-start justify-between gap-3 flex-wrap"><h2 class="text-lg">${batchLink(b)}</h2>${badge(b.state, { domain: 'payout_batch' })}</div>${facts([[F('total'), `<strong>${omr(b.total_baisa)}</strong>`], [F('col.items'), num(b.allocation_ids.length)], [F('preparedBy'), person(b.preparer, b.prepared_by)], [F('submitted'), when(b.submitted_at)]])}${b.preparer_is_actor ? notice({ title: F('youPreparedTitle'), message: F('youPrepared'), tone: 'warning' }) : ''}${b.problem ? notice({ message: t(b.problem), tone: 'danger' }) : ''}<div class="flex-row">${act('approve', b.id, F('approve'), { variant: 'primary', disabled: approveBlock(b), iconName: 'check' })}${link('#/admin/finance/payouts/' + b.id, F('openBatch'))}</div></li>`).join('')}</ul>` : empty('fin.noApprovals'));
    }
    return finScreen(ctx, head(ctx) + navTabs(ctx, PAYOUT_TABS, tab, { accounts: d.accounts.filter(a => a.change_request).length || undefined, batches: d.batches.length, approvals: d.approvals.length }) + tabBody(tab, body));
  },
};
const TIMELINE_AT = { Draft: ['created_at', 'prepared_by'], UnderReview: ['submitted_at', 'submitted_by'], Approved: ['approved_at', 'approved_by'], Processing: ['released_at', 'released_by'], Paid: ['paid_at', 'confirmed_by'], Failed: ['failed_at', null], Rejected: ['updated_at', 'rejected_by'] };
// Visual batch lifecycle: Draft → UnderReview → Approved → Processing → Paid, with Failed and Rejected branches.
function timeline(b) {
  const branch = b.state === 'Failed' ? 'Failed' : b.state === 'Rejected' ? 'Rejected' : null;
  const steps = branch === 'Rejected' ? ['Draft', 'UnderReview', 'Rejected'] : ['Draft', 'UnderReview', 'Approved', 'Processing', branch ?? 'Paid'];
  const current = steps.indexOf(b.state), name = id => L(b.events.find(e => e.actor_user_id === id)?.actor) || (id === b.prepared_by ? L(b.preparer) : id === b.approved_by ? L(b.approver) : '');
  const items = steps.map((s, i) => {
    const done = i < current || (i === current && s === 'Paid'), now = i === current && s !== 'Paid', bad = now && ['Failed', 'Rejected'].includes(s);
    const ev = [...b.events].reverse().find(e => e.after_summary === s), [atKey, byKey] = TIMELINE_AT[s], at = ev?.created_at ?? (i <= current ? b[atKey] : null), by = ev ? L(ev.actor) : byKey && i <= current ? name(b[byKey]) : '';
    const tone = bad ? 'tone-danger' : now ? 'tone-info' : done ? 'tone-success' : 'tone-neutral';
    return `<li class="rounded-xl p-3 min-w-0 ${tone}" ${now || (i === current) ? 'aria-current="step"' : ''}><div class="flex items-center gap-2"><span class="wizard-num ${done ? 'is-done-num' : ''}" aria-hidden="true">${done ? icon('check', { size: 14 }) : bad ? icon('x', { size: 14 }) : `<bdi>${i + 1}</bdi>`}</span><span class="font-semibold">${esc(t('status.payout_batch.' + s))}</span></div><p class="text-xs mt-1"><span class="sr-only">${esc(F(done ? 'stepDone' : now ? 'stepCurrent' : 'stepUpcoming'))} · </span>${at ? when(at) : esc(F(done || now ? 'noTimestamp' : 'stepUpcoming'))}${by ? ` · <span dir="auto">${esc(by)}</span>` : ''}</p></li>`;
  }).join('');
  return `<ol class="grid gap-3 grid-cols-1 sm:grid-cols-${steps.length === 3 ? '3' : '5'}" aria-label="${esc(F('timeline'))}">${items}</ol>${branch === 'Rejected' ? `<p class="text-sm muted mt-2">${esc(F('rejectedBranch'))}</p>` : ''}${branch === 'Failed' ? `<p class="text-sm muted mt-2">${esc(F('failedBranch'))}</p>` : ''}`;
}
function batchActions(b) {
  const p = b.perms, noPrepare = p.prepare ? '' : F('noPermission.prepare'), noRelease = p.release ? '' : F('noPermission.release');
  const rejectBlock = !b.independent ? F('samePreparerReason') : p.approve ? '' : F('noPermission.approve');
  switch (b.state) {
    case 'Draft': return act('submit', b.id, F('submitReview'), { variant: 'primary', disabled: noPrepare || (b.allocation_ids.length ? '' : F('selectFirst')), iconName: 'upload' });
    case 'UnderReview': return act('approve', b.id, F('approve'), { variant: 'primary', disabled: approveBlock(b) || (b.problem ? t(b.problem) : ''), iconName: 'check' }) + reasonAct('batchReject', b.id, F('returnForChanges'), { variant: 'ghost', disabled: rejectBlock });
    case 'Approved': return act('release', b.id, F('release'), { variant: 'primary', disabled: noRelease, iconName: 'banknote' });
    case 'Processing': return act('confirm', b.id, F('simulateConfirm'), { variant: 'primary', disabled: noRelease, iconName: 'checkCircle' }) + act('fail', b.id, F('simulateFail'), { variant: 'danger', disabled: noRelease, iconName: 'x' });
    case 'Failed': return act('revalidate', b.id, F('revalidate'), { variant: 'primary', disabled: noRelease, iconName: 'refresh' });
    case 'Rejected': return act('reopen', b.id, F('reopen'), { variant: 'primary', disabled: noPrepare, iconName: 'edit' });
    default: return `<p class="text-sm">${esc(F('paidFinal'))}</p>`;
  }
}
export const financeBatch = {
  render(ctx) {
    const d = select('finance.batch', { id: ctx.params.id }); if (d.status !== 'ok') return fallback(d.status === 'missing' ? 'missing' : 'resourceDenied', ctx);
    const b = d.batch, editable = ['UnderReview', 'Approved'].includes(b.state) && b.perms.prepare;
    const header = pageHeader({ title: F('batchTitle', { id: b.id }), subtitle: `${L(b.period_label)} · ${label('intro./admin/finance/payouts/:id')}`, breadcrumbs: [{ label: t('route./admin/finance'), href: '#/admin/finance' }, { label: t('route./admin/finance/payouts'), href: '#/admin/finance/payouts?tab=batches' }, { label: b.id }], actions: badge(b.state, { domain: 'payout_batch', size: 'lg' }) });
    const independence = b.state === 'UnderReview' ? (b.preparer_is_actor ? notice({ title: F('youPreparedTitle'), message: F('youPrepared'), tone: 'warning' }) : notice({ title: F('independenceTitle'), message: F('independentOk', { name: L(b.preparer) }), tone: 'success' })) : '';
    const warnings = [b.approval_invalidated ? notice({ title: F('approvalInvalidatedTitle'), message: t(b.approval_invalidated), tone: 'warning' }) : '', b.state === 'Failed' ? notice({ title: F('failedTitle'), message: F('failedBody'), tone: 'danger' }) : '', b.last_failure && b.state !== 'Failed' ? notice({ message: F('revalidatedNote'), tone: 'info' }) : '', b.state === 'Paid' ? notice({ title: F('paidTitle'), message: F('paidBody'), tone: 'success' }) : '', b.problem ? notice({ message: t(b.problem), tone: 'danger' }) : ''].join('');
    const overview = panel('timeline-title', F('timeline'), timeline(b) + facts([[F('preparedBy'), person(b.preparer, b.prepared_by)], [F('approvedBy'), b.approved_by ? person(b.approver, b.approved_by) : `<span class="muted">${esc(F('notApproved'))}</span>`], [F('total'), `<strong>${omr(b.total_baisa)}</strong>`], [F('col.items'), num(b.allocation_ids.length)], [F('transfers'), b.transfer_attempt_ids.length ? b.transfer_attempt_ids.map(code).join('<br>') : '—'], [F('failure'), b.failure_reason || b.last_failure ? esc(F('failureReason.' + (b.failure_reason || b.last_failure))) : '—']]) + independence + `<div class="flex-row">${batchActions(b)}</div>`);
    const items = panel('items-title', F('items'), b.state === 'Draft' && b.perms.prepare
      ? `<form class="stack" data-action="admin.finUpdateDraft" data-id="${esc(b.id)}" novalidate><p class="text-sm muted">${esc(F('draftEditNote'))}</p>${allocationPicker([...b.items.map(i => ({ id: i.id, teacher: i.teacher, title: i.title, amount_baisa: i.amount_baisa })), ...d.available], b.allocation_ids)}<div class="flex-row">${go('fin.saveSelection', 'secondary')}</div></form>`
      : table([{ key: 'id', label: F('allocation'), render: i => `<a class="underline" href="#/admin/finance/earnings?record=${esc(i.id)}">${code(i.id)}</a>` }, { key: 'title', label: F('orderItem'), render: i => `<span dir="auto">${esc(L(i.title))}</span> <span class="text-xs muted">${code(i.item_id)}</span>` }, { key: 'teacher', label: label('col.teacher'), render: i => person(i.teacher) }, { key: 'amount', label: F('col.amount'), align: 'end', render: i => omr(i.amount_baisa) }, { key: 'state', label: label('col.status'), render: i => badge(i.state, { domain: 'earning' }) }], b.items, { caption: F('items'), empty: `<p class="muted text-sm">${esc(F('emptyBatch'))}</p>`, actions: editable ? i => askBtn('removeItem', b.id, F('removeItem'), { extra: i.id, variant: 'ghost' }) : null }) + (editable && b.state === 'Approved' ? `<p class="text-sm muted">${esc(F('removeInvalidates'))}</p>` : ''));
    const dest = panel('dest-title', F('destinations'), table([{ key: 'teacher', label: label('col.teacher'), render: x => person(x.teacher, x.teacher_id) }, { key: 'name', label: F('beneficiaryName'), render: x => `<span dir="auto">${esc(L(x.beneficiary_name))}</span>` }, { key: 'snap', label: F('snapshotIban'), render: x => `<bdi dir="ltr">${esc(x.masked_iban)}</bdi>` }, { key: 'current', label: F('currentIban'), render: x => x.current ? `<bdi dir="ltr">${esc(x.current.masked_iban)}</bdi>` : '—' }, { key: 'ok', label: F('col.match'), render: x => matchChip(x.matches) }], b.destinations.map(x => ({ ...x, id: x.payout_account_id })), { caption: F('destinations'), empty: `<p class="muted text-sm">${esc(F('noDestinations'))}</p>` }) + `<p class="text-sm muted">${esc(F('maskedNote'))}</p>`);
    const payouts = panel('payouts-title', F('teacherPayouts'), table([{ key: 'id', label: F('col.payout'), render: p => code(p.id) }, { key: 'teacher', label: label('col.teacher'), render: p => person(p.teacher, p.teacher_id) }, { key: 'amount', label: F('col.amount'), align: 'end', render: p => omr(p.amount_baisa) }, { key: 'state', label: label('col.status'), render: p => badge(p.state, { domain: 'payout_batch' }) }, { key: 'ref', label: F('col.reference'), render: p => code(p.provider_ref) }, { key: 'rec', label: F('reconciled'), render: p => when(p.reconciled_at) }], b.payouts, { caption: F('teacherPayouts'), empty: `<p class="muted text-sm">${esc(F('noPayouts'))}</p>` }));
    return screen(ctx, header + `<div class="stack">${warnings}${overview}<div class="grid gap-6 lg:grid-cols-2">${items}${dest}</div>${payouts}${panel('journals-title', F('journals'), journalsBlock(d.journals))}${panel('history-title', label('history'), auditList([...b.events].reverse()))}</div>`);
  },
};

// ---------------------------------------------------------------- finance: reconciliation and reports
const RECON_TABS = ['reconciliation', 'reports'];
const lineStatus = l => l.status === 'matched' ? chip(F('matched'), 'success', 'check') : l.status === 'matched_manual' ? chip(F('matchedManual'), 'info', 'checkCircle') : chip(F('exception'), 'danger', 'flag');
export const financeReconciliation = {
  render(ctx) {
    const tab = tabOf(ctx, RECON_TABS), d = select('finance.reconciliation'); if (!d) return finDenied(ctx);
    let body, actions;
    if (tab === 'reconciliation') {
      actions = act('csv', 'recon', F('exportRecon'), { iconName: 'download' });
      const totals = `<ul class="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">${[['provider', omr(d.provider), 'creditCard'], ['internal', omr(d.internal), 'banknote'], ['difference', omr(d.provider - d.internal), 'refresh'], ['exceptions', num(d.exceptions), 'flag']].map(([k, v, i]) => `<li class="panel flex items-center gap-3 min-w-0"><span class="work-icon">${icon(i, { size: 20 })}</span><span class="min-w-0"><span class="block text-sm muted">${esc(F('recon.' + k))}</span><strong class="block text-xl mt-1">${v}</strong></span></li>`).join('')}</ul>`;
      const kinds = panel('kinds-title', F('byKind'), table([{ key: 'kind', label: F('col.kind'), render: k => esc(F('kind.' + k.kind)) }, { key: 'count', label: F('col.lines'), align: 'end', render: k => num(k.count) }, { key: 'provider', label: F('recon.provider'), align: 'end', render: k => omr(k.provider) }, { key: 'internal', label: F('recon.internal'), align: 'end', render: k => omr(k.internal) }, { key: 'exceptions', label: F('recon.exceptions'), align: 'end', render: k => num(k.exceptions) }], d.kinds.map(k => ({ ...k, id: k.kind })), { caption: F('byKind') }));
      const integrity = notice({ title: F('integrityTitle'), message: F('journalTotals', { count: d.journals.count, balanced: d.journals.balanced, debit: money(d.journals.debit), credit: money(d.journals.credit) }), tone: d.journals.balanced === d.journals.count ? 'success' : 'danger' });
      const lines = panel('lines-title', F('lines'), table([{ key: 'key', label: F('col.line'), render: l => `<span class="block font-medium">${esc(F('kind.' + l.kind))}</span>${code(l.id)}` }, { key: 'ref', label: F('col.reference'), render: l => code(l.reference) }, { key: 'provider', label: F('recon.provider'), align: 'end', render: l => omrOrDash(l.provider_baisa) }, { key: 'internal', label: F('recon.internal'), align: 'end', render: l => omr(l.internal_baisa) }, { key: 'status', label: label('col.status'), render: l => lineStatus(l) + (l.reason ? `<span class="block text-xs muted mt-1">${esc(F('reason.' + l.reason))}</span>` : '') }], d.lines.map(l => ({ ...l, id: l.key })), { caption: F('lines'), actions: l => `<div class="flex-row">${l.status === 'exception' ? reasonAct('reconMark', l.key, F('markMatched'), { variant: 'primary', disabled: d.perms.reconcile ? '' : F('noPermission.reconcile') }) : ''}${openLink(ctx, l.key, F('drill'))}</div>` }));
      body = totals + integrity + kinds + lines + panel('history-title', label('history'), auditList(d.history));
    } else {
      actions = `<div class="flex-row">${act('csv', 'statements', F('exportStatements'), { iconName: 'download' })}${act('csv', 'ledger', F('exportLedger'), { iconName: 'download', variant: 'ghost' })}</div>`;
      const s = d.summary;
      body = `<ul class="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">${[['gross', s.gross], ['commission', s.commission], ['payables', s.payables], ['paidOut', s.paid]].map(([k, v]) => `<li class="panel min-w-0"><p class="text-sm muted">${esc(F('metric.' + k))}</p><p class="text-xl font-semibold mt-1">${omr(v)}</p></li>`).join('')}</ul>`
        + panel('statements-title', F('perTeacher'), table([{ key: 'name', label: label('col.teacher'), render: r => person(r.name, r.id) }, { key: 'gross', label: F('metric.gross'), align: 'end', render: r => omr(r.ledger.gross) }, { key: 'commission', label: F('metric.commission'), align: 'end', render: r => omr(r.ledger.commission) }, { key: 'share', label: F('teacherShare'), align: 'end', render: r => omr(r.ledger.teacher_share) }, { key: 'open', label: F('metric.payables'), align: 'end', render: r => omr(r.ledger.pending + r.ledger.available + r.ledger.reserved + r.ledger.in_payout) }, { key: 'paid', label: F('metric.paidOut'), align: 'end', render: r => omr(r.ledger.paid) }, { key: 'rec', label: F('recoverable'), align: 'end', render: r => omr(r.ledger.recoverable) }, { key: 'ok', label: F('col.match'), render: r => matchChip(r.reconciled) }], d.statements, { caption: F('perTeacher') }))
        + panel('kinds-title', F('journalsByKind'), `<ul class="cycle-summary">${d.journals.byKind.map(k => `<li><span class="flex-1 min-w-0">${esc(F('journal.' + k.kind))}</span><strong>${num(k.count)}</strong></li>`).join('')}</ul>`) + notice({ message: F('reportsNote') });
    }
    const key = val(ctx, 'record');
    return finScreen(ctx, head(ctx, actions) + navTabs(ctx, RECON_TABS, tab, { reconciliation: d.exceptions || undefined }) + tabBody(tab, body), key ? reconDrawer(key, d.perms) : '');
  },
  mount: mountRecord,
};
function reconDrawer(key, perms) {
  const d = select('finance.reconLine', { key }); if (d.status !== 'ok') return missingDrawer();
  const l = d.line, trace = d.order_id ? link('#/admin/finance/orders?record=' + d.order_id, F('openTrace')) : d.batch_id ? link('#/admin/finance/payouts/' + d.batch_id, F('openBatch')) : '';
  return recordDrawer(F('lineTitle', { kind: F('kind.' + l.kind), id: l.id }), `${facts([[F('col.reference'), code(l.reference)], [F('recon.provider'), omrOrDash(l.provider_baisa)], [F('recon.internal'), omr(l.internal_baisa)], [F('recon.difference'), l.diff === null ? esc(F('unconfirmed')) : omr(l.diff)], [label('col.status'), lineStatus(l)], [F('col.reasonCode'), esc(l.reason ? F('reason.' + l.reason) : '—')]])}
    ${l.mark ? notice({ title: F('evidenceTitle'), message: F('evidenceBody', { note: l.mark.note, name: L(d.marker) || label('unknownPerson') }), tone: 'info' }) : ''}<div class="flex-row">${l.status === 'exception' ? reasonAct('reconMark', l.key, F('markMatched'), { variant: 'primary', disabled: perms.reconcile ? '' : F('noPermission.reconcile') }) : ''}${trace}</div>
    ${d.events.length ? sub(F('providerEvents')) + `<ul class="stack">${d.events.map(e => `<li class="text-sm rounded-lg bg-sand p-2">${code(e.event_id)} · ${esc(F('outcome.' + e.payload.outcome))} · ${omr(e.payload.amount_baisa)} ${chip(F('simulatedVerification'), 'info', 'shield')}</li>`).join('')}</ul>` : ''}${sub(F('journals'))}${journalsBlock(d.journals)}`);
}
// Synthetic CSV files built from the same scoped selectors the pages show (quoted, BOM-prefixed for Arabic text).
const csvText = rows => '﻿' + rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n') + '\r\n';
const omrPlain = baisa => (baisa / 1000).toFixed(3);
export function financeCsv(kind, d) {
  if (kind === 'recon') return csvText([[F('col.line'), F('col.kind'), F('col.reference'), F('recon.provider'), F('recon.internal'), F('recon.difference'), label('col.status')], ...d.lines.map(l => [l.id, F('kind.' + l.kind), l.reference, l.provider_baisa === null ? F('unconfirmed') : omrPlain(l.provider_baisa), omrPlain(l.internal_baisa), l.diff === null ? '' : omrPlain(l.diff), F(l.status === 'matched' ? 'matched' : l.status === 'matched_manual' ? 'matchedManual' : 'exception')])]);
  if (kind === 'statements') return csvText([[label('col.teacher'), F('metric.gross'), F('metric.commission'), ...['pending', 'available', 'reserved', 'in_payout', 'paid'].map(k => t('status.earning.' + k)), F('recoverable'), F('col.match')], ...d.statements.map(r => [`${L(r.name)} (${r.id})`, omrPlain(r.ledger.gross), omrPlain(r.ledger.commission), ...['pending', 'available', 'reserved', 'in_payout', 'paid'].map(k => omrPlain(r.ledger[k])), omrPlain(r.ledger.recoverable), F(r.reconciled ? 'matches' : 'mismatch')])]);
  return csvText([[F('col.journal'), F('col.journalType'), F('col.source'), F('col.account'), F('col.debit'), F('col.credit'), F('created')], ...d.journals.flatMap(j => j.lines.map(e => [j.id, F('journal.' + j.kind), `${e.source_type}:${e.source_id}`, F('account.' + e.account), omrPlain(e.debit_baisa), omrPlain(e.credit_baisa), e.created_at]))]);
}

// ---------------------------------------------------------------- finance: tax and invoice demo configuration
const TAX_TABS = ['tax', 'invoices'];
export const financeTax = {
  render(ctx) {
    const tab = tabOf(ctx, TAX_TABS), d = select('finance.tax'); if (!d) return finDenied(ctx);
    const f = aform('tax:' + tab), v = (k, saved) => f.values[k] ?? saved ?? '';
    const warning = notice({ title: F('taxUnconfirmedTitle'), message: F('taxUnconfirmedBody'), tone: 'warning' });
    const buttons = `<div class="flex-row"><button type="submit" class="btn btn-secondary" name="intent" value="preview">${esc(F('preview'))}</button><button type="submit" class="btn btn-primary" name="intent" value="save">${esc(F('saveDemo'))}</button></div>`;
    let form, preview;
    const sample = d.sample, sub0 = sample?.price_baisa ?? 0;
    if (tab === 'tax') {
      const c = d.tax, rate = percentOf(v('rate', c.rate_bps != null ? String(c.rate_bps / 100) : '0'));
      form = `<form class="stack" data-action="admin.finTax" data-extra="tax" novalidate>${pair(f, 'tax', 'tax_label', { ar: v('tax_label_ar', c.label?.ar ?? 'ضريبة توضيحية'), en: v('tax_label_en', c.label?.en ?? 'Illustrative tax') }, { rows: 1 })}${field(f, 'tax-rate', 'rate', F('illustrativeRate'), { value: v('rate', c.rate_bps != null ? String(c.rate_bps / 100) : '0'), hint: F('rateHint'), dir: 'ltr' })}${field(f, 'tax-reg', 'registration', F('registrationRef'), { value: v('registration', c.registration ?? ''), hint: F('registrationHint'), dir: 'ltr' })}${formField({ id: 'tax-inclusive', name: 'inclusive', label: F('pricesInclusive'), type: 'checkbox', value: f.values.intent ? f.values.inclusive === 'on' : !!c.inclusive })}${buttons}</form>`;
      const label0 = select('preferences').lang === 'ar' ? v('tax_label_ar', c.label?.ar ?? 'ضريبة توضيحية') : v('tax_label_en', c.label?.en ?? 'Illustrative tax');
      preview = facts([[F('previewItem'), `<span dir="auto">${esc(L(sample?.title_snapshot))}</span>`], [F('subtotal'), omr(sub0)], [`${label0} (${rate === null ? '—' : (rate / 100).toFixed(2)}%)`, `${omr(rate === null ? 0 : Math.round(sub0 * rate / 10000))} <span class="text-xs muted">${esc(F('notApplied'))}</span>`], [F('appliedTax'), omr(sample?.tax_baisa ?? 0)], [F('statusLabel'), chip(F('status.' + c.status), 'warning', 'clock')]]);
    } else {
      const c = d.invoice, prefix = v('prefix', c.prefix ?? 'DEMO'), next = v('next_number', String(c.next_number ?? 1));
      form = `<form class="stack" data-action="admin.finTax" data-extra="invoices" novalidate>${field(f, 'inv-prefix', 'prefix', F('invoicePrefix'), { value: prefix, hint: F('prefixHint'), dir: 'ltr' })}${field(f, 'inv-next', 'next_number', F('nextNumber'), { type: 'number', min: 1, max: 999999, value: next, dir: 'ltr' })}${pair(f, 'inv', 'issuer', { ar: v('issuer_ar', c.issuer?.ar ?? 'جهة إصدار توضيحية'), en: v('issuer_en', c.issuer?.en ?? 'Illustrative issuer') }, { rows: 1 })}${pair(f, 'inv', 'footer', { ar: v('footer_ar', c.footer?.ar ?? 'فاتورة تجريبية — ليست مستنداً ضريبياً.'), en: v('footer_en', c.footer?.en ?? 'Demo invoice — not a tax document.') }, { type: 'textarea', rows: 2 })}${buttons}</form>`;
      const lang = select('preferences').lang;
      preview = `<article class="rounded-xl border border-border p-4 stack"><div class="flex items-start justify-between gap-3 flex-wrap"><strong dir="auto">${esc(v('issuer_' + lang, c.issuer?.[lang] ?? (lang === 'ar' ? 'جهة إصدار توضيحية' : 'Illustrative issuer')))}</strong><bdi dir="ltr">${esc(`${String(prefix).toUpperCase()}-${String(next).padStart(6, '0')}`)}</bdi></div>${facts([[F('previewItem'), `<span dir="auto">${esc(L(sample?.title_snapshot))}</span>`], [F('subtotal'), omr(sub0)], [F('tax'), omr(sample?.tax_baisa ?? 0)], [F('total'), `<strong>${omr(sample?.total_baisa ?? 0)}</strong>`]])}<p class="text-xs muted" dir="auto">${esc(v('footer_' + lang, c.footer?.[lang] ?? (lang === 'ar' ? 'فاتورة تجريبية — ليست مستنداً ضريبياً.' : 'Demo invoice — not a tax document.')))}</p>${chip(F('status.' + c.status), 'warning', 'clock')}</article>`;
    }
    return finScreen(ctx, head(ctx) + warning + navTabs(ctx, TAX_TABS, tab) + tabBody(tab, `<div class="grid gap-6 lg:grid-cols-2">${panel('form-title', F('configTitle.' + tab), form)}${panel('preview-title', F('previewTitle'), `${f.values.intent === 'preview' ? `<p class="text-sm muted">${esc(F('previewUnsaved'))}</p>` : ''}${preview}`)}</div>${panel('history-title', label('history'), auditList(d.history))}`));
  },
};
function percentOf(v) { const m = /^(\d{1,3})(?:\.(\d{1,2}))?$/.exec(String(v ?? '').trim()); const n = m ? Number(m[1]) * 100 + Number((m[2] ?? '').padEnd(2, '0')) : null; return n !== null && n <= 10000 ? n : null; }

// ---------------------------------------------------------------- actions
const OPS = {
  reveal: (id, type) => ['admin.sensitiveRead', { type, id }, 'revealed'],
  studentStatus: (id, status) => ['people.setAccountStatus', { kind: 'student', id, status }, 'statusSaved'],
  teacherStatus: (id, status) => ['people.setAccountStatus', { kind: 'teacher', id, status }, 'statusSaved'],
  link: (id, decision) => ['guardianLink.decide', { linkId: id, decision }, 'link.' + decision],
  revokeInvite: id => ['people.revokeInvite', { invitationId: id }, 'inviteRevoked'],
  teamRevoke: (id, courseId) => ['team.adminRevoke', { memberId: id, courseId: courseId || null }, 'teamRevoked'],
  courseOp: (id, action) => ['course.moderate', { courseId: id, action }, 'course.' + action],
  reportOp: (id, action) => ['report.act', { reportId: id, action }, 'report.' + action],
  revokeGrant: id => ['access.revokeGrant', { grantId: id }, 'grantRevoked'],
  resolveTicket: id => ['support.resolveTicket', { ticketId: id }, 'ticketResolved'],
  safety: (id, state) => ['safety.setState', { reportId: id, state }, 'safetyMoved'],
  message: (id, decision) => ['message.moderate', { messageId: id, decision }, 'message.' + decision],
  security: (id, action) => ['security.update', { userId: id, action }, 'securitySaved'],
  batchReject: id => ['payout.reject', { batchId: id }, 'fin.batchRejected'],
  removeItem: (id, allocationId) => ['payout.removeItem', { batchId: id, allocationId }, 'fin.itemRemoved'],
  refundReject: id => ['refund.decide', { refundId: id, decision: 'reject' }, 'fin.refundRejected'],
  disputeWon: id => ['dispute.decide', { disputeId: id, decision: 'won' }, 'fin.disputeWon'],
  disputeLost: id => ['dispute.decide', { disputeId: id, decision: 'lost' }, 'fin.disputeLost'],
  accountApprove: id => ['payoutAccount.decide', { accountId: id, decision: 'approve' }, 'fin.accountVerified'],
  accountReject: id => ['payoutAccount.decide', { accountId: id, decision: 'reject' }, 'fin.accountRejected'],
  reconMark: id => ['reconciliation.mark', { key: id }, 'fin.marked'],
};
// Unreasoned finance actions (data-op): the store still validates scope, permission, independence and transition.
const FIN_OPS = {
  approve: id => ['payout.approve', { batchId: id }, 'fin.approved'], submit: id => ['payout.submit', { batchId: id }, 'fin.submitted'],
  release: id => ['payout.release', { batchId: id }, 'fin.released'], confirm: id => ['payout.confirm', { batchId: id }, 'fin.confirmed'],
  fail: id => ['payout.fail', { batchId: id }, 'fin.failed'], revalidate: id => ['payout.revalidate', { batchId: id }, 'fin.revalidated'], reopen: id => ['payout.reopen', { batchId: id }, 'fin.reopened'],
  releaseHold: id => ['earning.releaseHold', { allocationId: id }, 'fin.holdReleased'],
  refundApprove: id => ['refund.decide', { refundId: id, decision: 'approve' }, 'fin.refundApproved'],
  refundSuccess: id => ['refund.simulate', { refundId: id, outcome: 'success' }, 'fin.refundSucceeded'], refundFailure: id => ['refund.simulate', { refundId: id, outcome: 'failure' }, 'fin.refundFailed'],
  disputeReview: id => ['dispute.decide', { disputeId: id, decision: 'review' }, 'fin.disputeReview'],
};
const CSV_SOURCES = { recon: ['finance.reconciliation', 'reconciliation'], statements: ['finance.reconciliation', 'teacher-statements'], ledger: ['finance.earnings', 'ledger-journals'] };
const errorText = r => t(Object.values(r.fieldErrors ?? {})[0] ?? r.errorKey);
function done(r, okKey) { showToast(r.ok ? label('ok.' + okKey) : errorText(r), { tone: r.ok ? 'success' : 'error' }); return r.ok; }
// Dispatch a form-backed action; on failure keep typed values and field errors in transient admin form state.
function formAct(ctx, name, type, payload, okKey, values) {
  const r = ctx.dispatch(type, payload);
  if (!r.ok) { if (Object.keys(r.fieldErrors ?? {}).length) ctx.dispatch('admin.saveForm', { name, values, fieldErrors: r.fieldErrors }); showToast(errorText(r), { tone: 'error' }); return r; }
  ctx.dispatch('admin.clearForm', { name }); showToast(label('ok.' + okKey), { tone: 'success' }); return r;
}
function download(text, filename) {
  const href = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' })), a = document.createElement('a');
  a.href = href; a.download = filename; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(href), 1000);
}
export function registerActions(register) {
  register('admin', {
    filter: onSubmit((_e, el, ctx, fd) => ctx.navigate(url(ctx, { ...strings(fd), record: null }))),
    ask: (_e, el) => {
      const dialog = document.getElementById('reason-dialog'); if (!dialog || !OPS[el.dataset.op]) return;
      const form = dialog.querySelector('form'); form.reset();
      for (const k of ['op', 'id', 'extra']) form.querySelector(`input[name="${k}"]`).value = el.dataset[k] ?? '';
      dialog.querySelector('h2').textContent = el.dataset.label ?? label('reasonTitle');
      dialog.querySelector('[data-reason-target]').textContent = label('reasonFor', { id: el.dataset.id ?? '' });
      const error = dialog.querySelector('[data-reason-error]'); error.hidden = true; error.textContent = '';
      form.querySelector('textarea').removeAttribute('aria-invalid');
      openOverlay('reason-dialog');
    },
    reason: onSubmit((_e, el, ctx, fd) => {
      const op = OPS[fd.get('op')]; if (!op) return;
      const [type, payload, okKey] = op(fd.get('id'), fd.get('extra'));
      const r = ctx.dispatch(type, { ...payload, reason: fd.get('reason') });
      if (!r.ok) { const error = el.querySelector('[data-reason-error]'), area = el.querySelector('textarea'); error.textContent = errorText(r); error.hidden = false; area.setAttribute('aria-invalid', 'true'); area.focus(); return; }
      closeOverlay('reason-dialog'); showToast(label('ok.' + okKey), { tone: 'success' });
    }),
    decideApplication: onSubmit((event, el, ctx, fd) => formAct(ctx, 'app:' + el.dataset.id, 'application.review', { applicationId: el.dataset.id, decision: event.submitter?.value ?? fd.get('decision'), feedback: fd.get('feedback') }, 'application.' + (event.submitter?.value ?? 'approve'), strings(fd))),
    startReview: (_e, el, ctx) => done(ctx.dispatch('application.review', { applicationId: el.dataset.id, decision: 'startReview' }), 'application.startReview'),
    inviteTeacher: onSubmit((_e, el, ctx, fd) => { if (formAct(ctx, 'invite-teacher', 'people.inviteTeacher', strings(fd), 'invited', strings(fd)).ok) ctx.navigate(url(ctx, { tab: 'invitations', record: null })); }),
    inviteEmployee: onSubmit((_e, el, ctx, fd) => { if (formAct(ctx, 'invite-employee', 'people.inviteEmployee', strings(fd), 'invited', strings(fd)).ok) ctx.navigate(url(ctx, { record: null })); }),
    updateEmployee: onSubmit((_e, el, ctx, fd) => formAct(ctx, 'employee:' + el.dataset.id, 'people.updateEmployee', { assignmentId: el.dataset.id, ...strings(fd) }, 'saved', strings(fd))),
    saveAcademic: onSubmit((_e, el, ctx, fd) => {
      const kind = el.dataset.kind, id = el.dataset.id || null, type = { curricula: 'academics.saveCurriculum', versions: 'academics.saveVersion', tracks: 'academics.saveTrack' }[kind];
      if (type && formAct(ctx, `${kind}:${id ?? 'new'}`, type, { id, ...strings(fd) }, 'saved', strings(fd)).ok) ctx.navigate(url(ctx, { record: null }));
    }),
    setActive: (_e, el, ctx) => done(ctx.dispatch('academics.setActive', { kind: el.dataset.kind, id: el.dataset.id, active: el.dataset.value === 'true' }), 'saved'),
    saveGrade: onSubmit((_e, el, ctx, fd) => { if (formAct(ctx, 'grade:' + el.dataset.id, 'academics.updateGrade', { id: el.dataset.id, ...strings(fd) }, 'saved', strings(fd)).ok) ctx.navigate(url(ctx, { record: null })); }),
    deleteGrade: (_e, el, ctx) => done(ctx.dispatch('academics.deleteGrade', { id: el.dataset.id }), 'deleted'),
    saveSubject: onSubmit((_e, el, ctx, fd) => { if (formAct(ctx, 'subject:' + el.dataset.id, 'academics.updateSubject', { id: el.dataset.id, ...strings(fd) }, 'saved', strings(fd)).ok) ctx.navigate(url(ctx, { record: null })); }),
    toggleMapping: (_e, el, ctx) => { const r = ctx.dispatch('academics.toggleMapping', { gradeId: el.dataset.id, subjectId: el.dataset.target, versionId: el.dataset.value }); done(r, r.ok && !r.data.active && r.data.courses ? 'mappingOffKept' : 'saved'); },
    savePeriod: onSubmit((_e, el, ctx, fd) => { const kind = el.dataset.kind, id = el.dataset.id || null; if (formAct(ctx, `${kind}:${id ?? 'new'}`, kind === 'years' ? 'academics.saveYear' : 'academics.saveSemester', { id, ...strings(fd) }, 'saved', strings(fd)).ok) ctx.navigate(url(ctx, { record: null })); }),
    saveTranslations: onSubmit((_e, el, ctx) => {
      const payload = { subjects: {}, mappings: {} }, values = {};
      for (const input of el.querySelectorAll('input[data-kind]')) { (payload[input.dataset.kind][input.dataset.id] ??= {})[input.dataset.lang] = input.value; values[input.name] = input.value; }
      formAct(ctx, 'translations:' + (ctx.query.get('grade') || '4'), 'academics.saveTranslations', payload, 'translationsSaved', values);
    }),
    reviewCourse: onSubmit((event, el, ctx, fd) => { const decision = event.submitter?.value ?? 'approve'; if (formAct(ctx, 'review:' + el.dataset.id, 'course.review', { courseId: el.dataset.id, decision, feedback: fd.get('feedback') }, 'review.' + decision, strings(fd)).ok) ctx.navigate(url(ctx, { record: null })); }),
    grant: onSubmit((_e, el, ctx, fd) => { if (formAct(ctx, 'grant', 'access.adminGrant', strings(fd), 'granted', strings(fd)).ok) ctx.navigate(url(ctx, { record: null })); }),
    addIncident: onSubmit((_e, el, ctx, fd) => formAct(ctx, 'incident:' + el.dataset.id, 'live.addIncident', { sessionId: el.dataset.id, note: fd.get('note') }, 'incidentAdded', strings(fd))),
    respond: onSubmit((_e, el, ctx, fd) => formAct(ctx, 'ticket:' + el.dataset.id, 'support.staffRespond', { ticketId: el.dataset.id, text: fd.get('text') }, 'replied', strings(fd))),
    saveHome: onSubmit((_e, el, ctx, fd) => formAct(ctx, 'cms-home', 'cms.saveHome', { ...strings(fd), featured: fd.getAll('featured') }, 'homeSaved', { ...strings(fd), featured: fd.getAll('featured').join(',') })),
    savePage: onSubmit((_e, el, ctx, fd) => { if (formAct(ctx, 'page:' + el.dataset.id, 'cms.savePage', { slug: el.dataset.id, ...strings(fd) }, 'pageSaved', strings(fd)).ok) ctx.navigate(url(ctx, { record: null })); }),
    saveFaq: onSubmit((_e, el, ctx, fd) => { if (formAct(ctx, 'faq:' + (el.dataset.id || 'new'), 'cms.saveFaq', { index: el.dataset.id, ...strings(fd) }, 'saved', strings(fd)).ok) ctx.navigate(url(ctx, { record: null })); }),
    removeFaq: (_e, el, ctx) => done(ctx.dispatch('cms.removeFaq', { index: el.dataset.id }), 'deleted'),
    saveTemplate: onSubmit((_e, el, ctx, fd) => { if (formAct(ctx, 'template:' + el.dataset.id, 'template.save', { templateId: el.dataset.id, ...strings(fd), enabled: fd.get('enabled') === 'on' }, 'saved', strings(fd)).ok) ctx.navigate(url(ctx, { record: null })); }),
    retry: (_e, el, ctx) => { const r = ctx.dispatch('delivery.retry', { attemptId: el.dataset.id }); showToast(r.ok ? label('ok.retried', { event: r.data.eventId ?? '—' }) : errorText(r), { tone: r.ok ? 'success' : 'error' }); },
    exportCsv: (_e, _el, ctx) => { const d = reportData(ctx); if (!d) return; download(reportCsv(d), `oman-demo-report-${d.filters.from}-${d.filters.to}.csv`); showToast(label('ok.exported'), { tone: 'success' }); },
    saveRole: onSubmit((_e, el, ctx, fd) => formAct(ctx, 'role:' + el.dataset.id, 'roles.save', { assignmentId: el.dataset.id, permissions: fd.getAll('perm'), expires: fd.get('expires'), reason: fd.get('reason'), independentApproval: true }, 'roleSaved', { expires: String(fd.get('expires') ?? ''), reason: String(fd.get('reason') ?? '') })),
    testIntegration: (_e, el, ctx) => { const r = ctx.dispatch('integration.test', { key: el.dataset.id }); showToast(r.ok ? label('ok.tested', { reference: r.data.reference }) : errorText(r), { tone: r.ok ? 'success' : 'error' }); },
    fin: (_e, el, ctx) => {
      if (el.dataset.op === 'csv') { const [name, file] = CSV_SOURCES[el.dataset.id] ?? []; const d = name && select(name, {}); if (!d) return; download(financeCsv(el.dataset.id, d), `oman-demo-${file}.csv`); showToast(label('ok.exported'), { tone: 'success' }); return; }
      const op = FIN_OPS[el.dataset.op]; if (!op) return;
      const [type, payload, okKey] = op(el.dataset.id), r = ctx.dispatch(type, payload);
      showToast(r.ok ? (r.data?.invalidated ? F('approvalInvalidatedTitle') + ' · ' + t(r.data.invalidated) : r.data?.existing ? F('alreadyDone') : label('ok.' + okKey)) : errorText(r), { tone: r.ok ? (r.data?.invalidated ? 'warning' : 'success') : 'error' });
    },
    finCreateBatch: onSubmit((_e, el, ctx, fd) => { const r = formAct(ctx, 'batch-create', 'payout.create', { allocationIds: fd.getAll('alloc') }, 'fin.prepared', {}); if (r.ok) ctx.navigate('#/admin/finance/payouts/' + r.data.batchId); }),
    finUpdateDraft: onSubmit((_e, el, ctx, fd) => done(ctx.dispatch('payout.updateDraft', { batchId: el.dataset.id, allocationIds: fd.getAll('alloc') }), 'fin.selectionSaved')),
    finRefundRequest: onSubmit((_e, el, ctx, fd) => formAct(ctx, 'refund-request', 'refund.request', strings(fd), 'fin.refundRequested', strings(fd))),
    finDisputeOpen: onSubmit((_e, el, ctx, fd) => formAct(ctx, 'dispute-open', 'dispute.open', strings(fd), 'fin.disputeOpened', strings(fd))),
    finCommission: onSubmit((_e, el, ctx, fd) => { const values = { ...strings(fd), active: fd.get('active') === 'on' ? 'on' : 'off' }; if (formAct(ctx, 'rule:' + (el.dataset.id || 'new'), 'commission.save', { ruleId: el.dataset.id || null, teacherId: fd.get('teacherId'), rate: fd.get('rate'), active: fd.get('active') === 'on', reason: fd.get('reason') }, 'fin.ruleSaved', values).ok) ctx.navigate(url(ctx, { record: null })); }),
    finAdjust: onSubmit((_e, el, ctx, fd) => formAct(ctx, 'adjust:' + el.dataset.id, 'earning.adjust', { allocationId: el.dataset.id, amount: fd.get('amount'), reason: fd.get('reason') }, 'fin.adjusted', strings(fd))),
    finTax: onSubmit((event, el, ctx, fd) => {
      const section = el.dataset.extra, values = { ...strings(fd), inclusive: fd.get('inclusive') === 'on' ? 'on' : 'off' };
      if ((event.submitter?.value ?? 'save') === 'preview') { ctx.dispatch('admin.saveForm', { name: 'tax:' + section, values: { ...values, intent: 'preview' } }); showToast(F('previewUpdated'), { tone: 'info' }); return; }
      formAct(ctx, 'tax:' + section, 'finance.saveTaxConfig', { section, ...strings(fd), inclusive: fd.get('inclusive') === 'on' }, 'fin.taxSaved', values);
    }),
  });
}
