import { t, L, esc, dateTime } from './i18n.js';
import { select, dispatch, registerSelectors } from './store.js';
import { PERSONAS } from './data.js';
import { icon } from './icons.js';
import { button, iconButton, breadcrumb, drawer, modal, avatar, openOverlay, closeOverlay, disposeOverlays } from './ui.js';
export const ROLE_NAV = {
  "visitor": [
    {
      "path": "/",
      "icon": "home",
      "group": "general"
    },
    {
      "path": "/explore",
      "icon": "search",
      "group": "general"
    },
    {
      "path": "/teachers",
      "icon": "graduationCap",
      "group": "general"
    },
    {
      "path": "/become-teacher",
      "icon": "userPlus",
      "group": "general"
    },
    {
      "path": "/help",
      "icon": "helpCircle",
      "group": "general"
    },
    {
      "path": "/auth/sign-in",
      "icon": "user",
      "group": "general"
    }
  ],
  "student": [
    {
      "path": "/student",
      "icon": "home",
      "group": "general"
    },
    {
      "path": "/student/courses",
      "icon": "book",
      "group": "general"
    },
    {
      "path": "/student/explore",
      "icon": "search",
      "group": "general"
    },
    {
      "path": "/student/calendar",
      "icon": "calendar",
      "group": "general"
    },
    {
      "path": "/student/assignments",
      "icon": "clipboard",
      "group": "general"
    },
    {
      "path": "/student/messages",
      "icon": "messageCircle",
      "group": "general"
    },
    {
      "path": "/student/notifications",
      "icon": "bell",
      "group": "general"
    },
    {
      "path": "/student/profile",
      "icon": "user",
      "group": "general"
    },
    {
      "path": "/student/settings",
      "icon": "settings",
      "group": "general"
    }
  ],
  "guardian": [
    {
      "path": "/guardian",
      "icon": "home",
      "group": "general"
    },
    {
      "path": "/guardian/children",
      "icon": "users",
      "group": "general"
    },
    {
      "path": "/guardian/explore",
      "icon": "search",
      "group": "general"
    },
    {
      "path": "/guardian/orders",
      "icon": "receipt",
      "group": "general"
    },
    {
      "path": "/guardian/notifications",
      "icon": "bell",
      "group": "general"
    },
    {
      "path": "/guardian/support",
      "icon": "helpCircle",
      "group": "general"
    },
    {
      "path": "/guardian/settings",
      "icon": "settings",
      "group": "general"
    }
  ],
  "teacher": [
    {
      "path": "/teacher",
      "icon": "home",
      "group": "general"
    },
    {
      "path": "/teacher/courses",
      "icon": "book",
      "group": "general"
    },
    {
      "path": "/teacher/students",
      "icon": "users",
      "group": "general"
    },
    {
      "path": "/teacher/inbox",
      "icon": "messageCircle",
      "group": "general"
    },
    {
      "path": "/teacher/calendar",
      "icon": "calendar",
      "group": "general"
    },
    {
      "path": "/teacher/team",
      "icon": "users",
      "group": "general"
    },
    {
      "path": "/teacher/earnings",
      "icon": "banknote",
      "group": "general"
    },
    {
      "path": "/teacher/notifications",
      "icon": "bell",
      "group": "general"
    },
    {
      "path": "/teacher/settings",
      "icon": "settings",
      "group": "general"
    }
  ],
  "assistant": [
    {
      "path": "/assistant",
      "icon": "home",
      "group": "general"
    },
    {
      "path": "/assistant/courses",
      "icon": "book",
      "group": "general"
    },
    {
      "path": "/assistant/inbox",
      "icon": "mail",
      "group": "general"
    },
    {
      "path": "/assistant/qa",
      "icon": "messageCircle",
      "group": "general"
    },
    {
      "path": "/assistant/tasks",
      "icon": "clipboard",
      "group": "general"
    },
    {
      "path": "/assistant/notifications",
      "icon": "bell",
      "group": "general"
    },
    {
      "path": "/assistant/settings",
      "icon": "settings",
      "group": "general"
    }
  ],
  "admin_finance": [
    {
      "path": "/admin/finance",
      "icon": "chart",
      "group": "general"
    },
    {
      "path": "/admin/finance/orders",
      "icon": "receipt",
      "group": "general"
    },
    {
      "path": "/admin/finance/refunds",
      "icon": "refresh",
      "group": "general"
    },
    {
      "path": "/admin/finance/commissions",
      "icon": "creditCard",
      "group": "general"
    },
    {
      "path": "/admin/finance/earnings",
      "icon": "banknote",
      "group": "general"
    },
    {
      "path": "/admin/finance/payouts",
      "icon": "banknote",
      "group": "general"
    },
    {
      "path": "/admin/finance/reconciliation",
      "icon": "checkCircle",
      "group": "general"
    },
    {
      "path": "/admin/finance/tax",
      "icon": "fileText",
      "group": "general"
    }
  ],
  "admin_moderation": [
    {
      "path": "/admin",
      "icon": "home",
      "group": "general"
    },
    {
      "path": "/admin/people/students",
      "icon": "users",
      "group": "people"
    },
    {
      "path": "/admin/people/guardian-links",
      "icon": "users",
      "group": "people"
    },
    {
      "path": "/admin/people/teachers",
      "icon": "users",
      "group": "people"
    },
    {
      "path": "/admin/people/teams",
      "icon": "users",
      "group": "people"
    },
    {
      "path": "/admin/courses/review",
      "icon": "book",
      "group": "courses"
    },
    {
      "path": "/admin/courses/catalog",
      "icon": "book",
      "group": "courses"
    },
    {
      "path": "/admin/courses/reports",
      "icon": "book",
      "group": "courses"
    },
    {
      "path": "/admin/courses/access",
      "icon": "book",
      "group": "courses"
    },
    {
      "path": "/admin/courses/live",
      "icon": "book",
      "group": "courses"
    },
    {
      "path": "/admin/support/tickets",
      "icon": "shield",
      "group": "support"
    },
    {
      "path": "/admin/support/communications",
      "icon": "shield",
      "group": "support"
    }
  ],
  "super_admin": [
    {
      "path": "/admin",
      "icon": "home",
      "group": "general"
    },
    {
      "path": "/admin/people/students",
      "icon": "users",
      "group": "people"
    },
    {
      "path": "/admin/people/guardian-links",
      "icon": "users",
      "group": "people"
    },
    {
      "path": "/admin/people/teachers",
      "icon": "users",
      "group": "people"
    },
    {
      "path": "/admin/people/employees",
      "icon": "users",
      "group": "people"
    },
    {
      "path": "/admin/people/teams",
      "icon": "users",
      "group": "people"
    },
    {
      "path": "/admin/academics/curricula",
      "icon": "graduationCap",
      "group": "academics"
    },
    {
      "path": "/admin/academics/grades",
      "icon": "graduationCap",
      "group": "academics"
    },
    {
      "path": "/admin/academics/subjects",
      "icon": "graduationCap",
      "group": "academics"
    },
    {
      "path": "/admin/academics/periods",
      "icon": "graduationCap",
      "group": "academics"
    },
    {
      "path": "/admin/academics/translations",
      "icon": "graduationCap",
      "group": "academics"
    },
    {
      "path": "/admin/courses/review",
      "icon": "book",
      "group": "courses"
    },
    {
      "path": "/admin/courses/catalog",
      "icon": "book",
      "group": "courses"
    },
    {
      "path": "/admin/courses/reports",
      "icon": "book",
      "group": "courses"
    },
    {
      "path": "/admin/courses/access",
      "icon": "book",
      "group": "courses"
    },
    {
      "path": "/admin/courses/live",
      "icon": "book",
      "group": "courses"
    },
    {
      "path": "/admin/finance",
      "icon": "banknote",
      "group": "finance"
    },
    {
      "path": "/admin/finance/orders",
      "icon": "banknote",
      "group": "finance"
    },
    {
      "path": "/admin/finance/refunds",
      "icon": "banknote",
      "group": "finance"
    },
    {
      "path": "/admin/finance/commissions",
      "icon": "banknote",
      "group": "finance"
    },
    {
      "path": "/admin/finance/earnings",
      "icon": "banknote",
      "group": "finance"
    },
    {
      "path": "/admin/finance/payouts",
      "icon": "banknote",
      "group": "finance"
    },
    {
      "path": "/admin/finance/reconciliation",
      "icon": "banknote",
      "group": "finance"
    },
    {
      "path": "/admin/finance/tax",
      "icon": "banknote",
      "group": "finance"
    },
    {
      "path": "/admin/support/tickets",
      "icon": "shield",
      "group": "support"
    },
    {
      "path": "/admin/support/communications",
      "icon": "shield",
      "group": "support"
    },
    {
      "path": "/admin/cms/home",
      "icon": "edit",
      "group": "cms"
    },
    {
      "path": "/admin/cms/pages",
      "icon": "edit",
      "group": "cms"
    },
    {
      "path": "/admin/cms/promotions",
      "icon": "edit",
      "group": "cms"
    },
    {
      "path": "/admin/notifications",
      "icon": "bell",
      "group": "general"
    },
    {
      "path": "/admin/reports",
      "icon": "chart",
      "group": "general"
    },
    {
      "path": "/admin/settings/roles",
      "icon": "settings",
      "group": "settings"
    },
    {
      "path": "/admin/settings/security",
      "icon": "settings",
      "group": "settings"
    },
    {
      "path": "/admin/settings/integrations",
      "icon": "settings",
      "group": "settings"
    },
    {
      "path": "/admin/settings/policies",
      "icon": "settings",
      "group": "settings"
    }
  ]
};
export const QUICK_JUMPS = {
  "visitor": [
    "/",
    "/explore/grade/4",
    "/course/C-001",
    "/auth/sign-in"
  ],
  "student": [
    "/student",
    "/student/course/C-002",
    "/student/calendar",
    "/student/assignments"
  ],
  "guardian": [
    "/guardian",
    "/guardian/child/S-001",
    "/guardian/children/link",
    "/guardian/orders"
  ],
  "teacher": [
    "/teacher",
    "/teacher/courses/new",
    "/teacher/course/C-001",
    "/teacher/earnings"
  ],
  "assistant": [
    "/assistant",
    "/assistant/inbox",
    "/assistant/qa",
    "/assistant/tasks"
  ],
  "admin_finance": [
    "/admin/finance",
    "/admin/finance/orders",
    "/admin/finance/payouts",
    "/admin/finance/reconciliation"
  ],
  "admin_moderation": [
    "/admin",
    "/admin/people/teachers?tab=applications",
    "/admin/courses/review",
    "/admin/people/guardian-links"
  ],
  "super_admin": [
    "/admin",
    "/admin/finance/payouts?tab=approvals",
    "/admin/settings/roles",
    "/admin/settings/security?tab=audit"
  ]
};
export const ROLE_HOMES = Object.fromEntries(Object.entries(PERSONAS).map(([r,p])=>[r,p.home]));
registerSelectors({
  nav: state => ROLE_NAV[state.preferences.role] ?? [],
  quickJumps: state => QUICK_JUMPS[state.preferences.role] ?? [],
});

const GROUP_ICONS = { people: 'users', academics: 'graduationCap', courses: 'book', finance: 'banknote', support: 'shield', cms: 'edit', settings: 'settings' };
const NOTIFICATION_ROUTES = { student: '/student/notifications', guardian: '/guardian/notifications', teacher: '/teacher/notifications', assistant: '/assistant/notifications', super_admin: '/admin/notifications' };
const PROFILE_ROUTES = { student: '/student/profile', guardian: '/guardian/settings', teacher: '/teacher/settings', assistant: '/assistant/settings' };
const isAdmin = role => role.startsWith('admin') || role === 'super_admin';
const safeHash = href => typeof href === 'string' && /^#\/[\w\-/?=&.]*$/.test(href);

const brand = () => `<a href="#/" class="brand"><span class="brand-mark">${icon('graduationCap', { size: 24 })}</span><span class="brand-label">${esc(t('brand'))}</span></a>`;
const demoBadge = () => `<span class="demo-badge">${icon('play', { size: 14 })}<span>${esc(t('demo'))}</span></span>`;
const skipLink = () => `<a class="skip-link" href="#main-content" data-action="shell.skip">${esc(t('skipToContent'))}</a>`;
const PUBLIC_LINKS = [['explore', '/explore', 'search'], ['teachers', '/teachers', 'graduationCap'], ['become', '/become-teacher', 'userPlus'], ['help', '/help', 'helpCircle']];
const publicLinks = ctx => PUBLIC_LINKS.map(([key, path, iconName]) => {
  const current = ctx.path === path || ctx.path.startsWith(path + '/');
  return `<a class="nav-pill" href="#${path}" ${current ? 'aria-current="page"' : ''}>${icon(iconName, { size: 18 })}<span>${esc(t(key))}</span></a>`;
}).join('');

export function publicLayout(body, ctx) {
  const signed = ctx.role !== 'visitor';
  const account = signed
    ? button({ label: t('workspace'), href: '#' + ROLE_HOMES[ctx.role], variant: 'secondary' })
    : button({ label: t('signIn'), href: '#/auth/sign-in' });
  const footerColumns = [
    ['footer.discover', [['explore', '/explore'], ['teachers', '/teachers'], ['become', '/become-teacher']]],
    ['footer.platform', [['about', '/about'], ['help', '/help']]],
    ['footer.policies', [['privacy', '/legal/privacy'], ['terms', '/legal/terms'], ['refunds', '/legal/refunds']]],
  ];
  return `${skipLink()}
<header class="public-header">
  <div class="container flex items-center justify-between gap-3 py-3">
    ${brand()}
    <nav class="public-links items-center gap-1" aria-label="${esc(t('mainNav'))}">${publicLinks(ctx)}</nav>
    <div class="flex items-center gap-2 shrink-0">
      ${demoBadge()}
      <div class="hidden lg:flex">${account}</div>
      <span class="mobile-nav-trigger">${iconButton({ label: t('menu'), icon: 'menu', action: 'overlay.open', data: { id: 'public-nav' }, expanded: false, controls: 'public-nav' })}</span>
    </div>
  </div>
</header>
<main id="main-content" tabindex="-1">${body}</main>
<footer class="public-footer">
  <div class="container grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
    <div class="stack max-w-sm">${brand()}<p class="muted text-sm">${esc(t('demoNote'))}</p></div>
    ${footerColumns.map(([title, links]) => `<nav aria-label="${esc(t(title))}"><h2 class="footer-title">${esc(t(title))}</h2><ul class="mt-3 space-y-1">${links.map(([key, path]) => `<li><a class="footer-link" href="#${path}">${esc(t(key))}</a></li>`).join('')}</ul></nav>`).join('')}
  </div>
  <div class="container mt-10 pt-6 border-t border-border text-sm muted flex flex-wrap gap-2 justify-between"><span>${esc(t('footer.synthetic'))}</span><span>${esc(t('footer.demoDate'))}</span></div>
</footer>
${drawer({ id: 'public-nav', title: t('menu'), body: `<nav class="drawer-nav" aria-label="${esc(t('mainNav'))}"><a class="nav-link" href="#/">${icon('home')}<span>${esc(t('route./'))}</span></a>${PUBLIC_LINKS.map(([key, path, iconName]) => `<a class="nav-link" href="#${path}">${icon(iconName)}<span>${esc(t(key))}</span></a>`).join('')}</nav><div class="mt-6">${account}</div>` })}`;
}

// Consecutive items with the same group render as one collapsible section, so the
// sidebar keeps the order of the role registry in SPEC §6.
function navMarkup(ctx, idPrefix) {
  const runs = [];
  for (const item of select('nav')) {
    const last = runs.at(-1);
    if (last && last.group === item.group) last.items.push(item); else runs.push({ group: item.group, items: [item] });
  }
  const home = ROLE_HOMES[ctx.role];
  const link = item => {
    const current = ctx.path === item.path || (item.path !== home && ctx.path.startsWith(item.path + '/'));
    return `<a class="nav-link" href="#${item.path}" ${current ? 'aria-current="page"' : ''}>${icon(item.icon)}<span class="min-w-0">${esc(t('route.' + item.path))}</span></a>`;
  };
  return runs.map(({ group, items }, index) => {
    if (group === 'general') return items.map(link).join('');
    const open = ctx.role === 'admin_moderation' || items.some(item => ctx.path === item.path || ctx.path.startsWith(item.path + '/'));
    return `<details class="nav-group" ${open ? 'open' : ''}><summary id="${idPrefix}-group-${index}">${icon(GROUP_ICONS[group] ?? 'menu')}<span>${esc(t('group.' + group))}</span>${icon('chevronEnd', { size: 16, className: 'nav-caret ms-auto' })}</summary><div role="group" aria-labelledby="${idPrefix}-group-${index}">${items.map(link).join('')}</div></details>`;
  }).join('');
}

function notificationList(ctx) {
  const items = select('notifications');
  if (!items.length) return `<p class="muted">${esc(t('notifications.empty'))}</p>`;
  return `<ul class="space-y-2">${items.map(n => {
    const content = `<span class="flex items-start gap-3"><span class="dot ${n.read_at ? 'dot-read' : ''}" aria-hidden="true"></span><span class="min-w-0"><strong class="block">${esc(L(n.title))}</strong><span class="block text-sm muted">${esc(L(n.body))}</span><span class="block text-xs muted mt-1"><bdi>${esc(dateTime(n.created_at))}</bdi>${n.read_at ? '' : ` · ${esc(t('notifications.unreadLabel'))}`}</span></span></span>`;
    return `<li>${safeHash(n.href) ? `<a class="notification-item" href="${esc(n.href)}">${content}</a>` : `<div class="notification-item">${content}</div>`}</li>`;
  }).join('')}</ul>${NOTIFICATION_ROUTES[ctx.role] ? `<div class="mt-6">${button({ label: t('notifications.viewAll'), href: '#' + NOTIFICATION_ROUTES[ctx.role], variant: 'secondary' })}</div>` : ''}`;
}

export function portalLayout(body, ctx) {
  const unread = select('notifications.count');
  const admin = isAdmin(ctx.role);
  const persona = ctx.actor;
  const crumbs = ctx.route && ctx.route.path !== ROLE_HOMES[ctx.role]
    ? [{ label: t('workspace'), href: '#' + ROLE_HOMES[ctx.role] }, { label: L(ctx.route.title) }]
    : [{ label: ctx.route ? L(ctx.route.title) : t('notFound') }];
  const prefs = select('preferences');
  const choice = (action, key, value, label) => `<button type="button" class="btn ${prefs[key] === value ? 'btn-primary' : 'btn-secondary'} flex-1" data-action="${action}" data-${key}="${value}" aria-pressed="${prefs[key] === value}">${esc(label)}</button>`;
  const userBody = `<div class="flex items-center gap-4">${avatar(persona, { size: 56 })}<div class="min-w-0"><p class="font-semibold">${esc(L(persona.name))}</p><p class="text-sm muted">${esc(t('role.' + ctx.role))}</p></div></div>
    <p class="text-sm muted">${esc(t('demoPersonaNote'))}</p>
    <div class="grid gap-3">
      ${admin ? button({ label: t('preferences'), action: 'shell.preferences', variant: 'secondary' }) : button({ label: t('profileSettings'), href: '#' + PROFILE_ROUTES[ctx.role], variant: 'secondary' })}
      ${button({ label: t('signOut'), action: 'shell.signOut', variant: 'ghost' })}
    </div>`;
  return `${skipLink()}
<div class="portal">
  <aside class="sidebar" aria-label="${esc(t('sidebar'))}">
    <div class="sidebar-inner">
      ${brand()}
      <div class="persona-card">${avatar(persona, { size: 40 })}<div class="min-w-0"><p class="font-semibold text-sm truncate">${esc(L(persona.name))}</p><p class="text-xs muted">${esc(t('role.' + ctx.role))}</p></div></div>
      <nav aria-label="${esc(t('workspaceNav'))}" class="sidebar-nav">${navMarkup(ctx, 'side')}</nav>
      <a class="nav-link mt-4" href="#/explore">${icon('globe')}<span>${esc(t('publicSite'))}</span></a>
    </div>
  </aside>
  <div class="portal-content">
    <header class="topbar">
      <div class="flex items-center gap-2 min-w-0">
        <span class="mobile-nav-trigger">${iconButton({ label: t('menu'), icon: 'menu', action: 'overlay.open', data: { id: 'portal-nav' }, expanded: false, controls: 'portal-nav' })}</span>
        <div class="min-w-0 hidden sm:block font-semibold truncate">${esc(crumbs.at(-1)?.label ?? '')}</div>
      </div>
      <div class="flex items-center gap-1 shrink-0">
        <span class="hidden sm:inline-flex me-2">${demoBadge()}</span>
        <button type="button" class="icon-btn relative hover:bg-sand" data-action="overlay.open" data-id="own-notifications" aria-controls="own-notifications" aria-expanded="false" aria-label="${esc(t('notifications') + ' · ' + t('unread', { count: unread }))}">${icon('bell')}${unread ? `<span class="count-badge" aria-hidden="true">${unread}</span>` : ''}</button>
        <button type="button" class="icon-btn hover:bg-sand" data-action="overlay.open" data-id="user-menu" aria-controls="user-menu" aria-expanded="false" aria-label="${esc(t('userMenu'))}">${avatar(persona, { size: 32 })}</button>
      </div>
    </header>
    <main class="container page-main" id="main-content" tabindex="-1"><div class="sm:hidden mb-4">${demoBadge()}</div>${body}</main>
  </div>
</div>
${drawer({ id: 'portal-nav', title: t('menu'), body: `<div class="persona-card">${avatar(persona, { size: 40 })}<div class="min-w-0"><p class="font-semibold text-sm">${esc(L(persona.name))}</p><p class="text-xs muted">${esc(t('role.' + ctx.role))}</p></div></div><nav aria-label="${esc(t('workspaceNav'))}">${navMarkup(ctx, 'drawer')}</nav><a class="nav-link mt-4" href="#/explore">${icon('globe')}<span>${esc(t('publicSite'))}</span></a>` })}
${drawer({ id: 'own-notifications', title: t('notifications'), side: 'end', body: notificationList(ctx) })}
${modal({ id: 'user-menu', title: t('userMenu'), body: userBody })}
${modal({ id: 'own-preferences', title: t('preferences'), body: `<p class="font-medium">${esc(t('language'))}</p><div class="flex gap-2">${choice('shell.lang', 'lang', 'ar', 'العربية')}${choice('shell.lang', 'lang', 'en', 'English')}</div><p class="font-medium">${esc(t('theme'))}</p><div class="flex gap-2">${choice('shell.theme', 'theme', 'light', t('light'))}${choice('shell.theme', 'theme', 'dark', t('dark'))}</div>` })}`;
}

// Fallback views are not registered routes (SPEC §5): 404, role denial, scoped denial, missing record, view error.
export function fallback(kind, ctx, { roles = [] } = {}) {
  const [title, body, iconName] = {
    notFound: ['notFound', 'notFoundBody', 'search'],
    missing: ['missing', 'missingBody', 'search'],
    roleDenied: ['denied', 'deniedBody', 'shield'],
    resourceDenied: ['resourceDenied', 'resourceDeniedBody', 'lock'],
    viewError: ['viewError', 'viewErrorBody', 'flag'],
  }[kind] ?? ['notFound', 'notFoundBody', 'search'];
  const home = button({ label: t('goHome'), href: '#' + ROLE_HOMES[ctx.role], variant: kind === 'roleDenied' ? 'ghost' : 'primary' });
  let actions = home;
  if (kind === 'notFound') actions = home + button({ label: t('back'), action: 'shell.back', variant: 'secondary' });
  if (kind === 'viewError') actions = button({ label: t('retry'), action: 'shell.retry' }) + button({ label: t('reset'), action: 'shell.reset', variant: 'secondary' });
  const roleChoices = kind === 'roleDenied'
    ? `<div class="mt-8 text-start"><h2 class="text-base font-semibold">${esc(t('switchToAllowed'))}</h2><ul class="role-choices mt-3">${roles.map(role => `<li><button type="button" class="role-choice" data-action="shell.retryRole" data-role="${esc(role)}"><span class="text-primary">${icon('user')}</span><span class="min-w-0 flex-1"><span class="block font-semibold">${esc(t('role.' + role))}</span><span class="block text-sm muted">${esc(L(PERSONAS[role].name))}</span></span>${icon('chevronEnd', { size: 16 })}</button></li>`).join('')}</ul></div>`
    : '';
  return `<section class="fallback panel" aria-labelledby="fallback-title"><span class="fallback-icon">${icon(iconName, { size: 32 })}</span><h1 id="fallback-title" tabindex="-1">${esc(t(title))}</h1><p class="muted mt-3">${esc(t(body))}</p>${roleChoices}<div class="flex-row justify-center mt-6">${actions}</div></section>`;
}

export function registerActions(register) {
  register('shell', {
    skip: event => { event.preventDefault(); document.getElementById('main-content')?.focus(); },
    signOut: (_event, _el, ctx) => { disposeOverlays({ keepToasts: true }); dispatch('preferences.set', { role: 'visitor' }); ctx.navigate('#/'); },
    preferences: () => { closeOverlay('user-menu'); openOverlay('own-preferences'); },
    lang: (_event, el) => dispatch('preferences.set', { lang: el.dataset.lang }),
    theme: (_event, el) => dispatch('preferences.set', { theme: el.dataset.theme }),
    // Role denial: switch to an allowed persona, then retry the same route.
    retryRole: (_event, el, ctx) => {
      const role = el.dataset.role;
      if (!PERSONAS[role] || !ctx.route?.roles.includes(role)) return;
      disposeOverlays({ keepToasts: true });
      dispatch('preferences.set', { role });
      ctx.navigate(ctx.hash);
    },
    retry: (_event, _el, ctx) => ctx.navigate(ctx.hash),
    back: (_event, _el, ctx) => { if (history.length > 1) history.back(); else ctx.navigate('#/'); },
    reset: () => document.querySelector('#switcher-root [data-switcher="reset"]')?.click(),
  });
}
