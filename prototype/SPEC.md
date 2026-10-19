# Oman Learning Platform — clickable prototype implementation spec

## 1. Scope and fixed delivery contract

Implement a static, clickable design concept for **منصة عُمان التعليمية / Oman Learning Platform**, a grade-first Oman K–12 marketplace plus LMS. This specification incorporates `01_Executive_Information.md`, `02_Executive_Summary.md`, `03_Information_Architecture.md` (especially §3), `04_Platform_Blueprint.md`, and `CLAUDE.md`. The static prototype requirements here override the documents' proposed production architecture only for this prototype. Implementers must preserve the domain invariants below.

- No build step, npm, framework, server API, real credentials, real payments or real student information. All records synthetic. Put a localized “Interactive demo” indicator in every layout.
- Deliver only this implementation file layout in later phases (this planning task creates only SPEC.md):
  - `prototype/index.html`
  - `prototype/core/{router,store,data,i18n,ui,icons,media,charts,switcher,layout}.js`
  - `prototype/views/{public,auth,checkout,student,guardian,teacher,assistant,admin}.js`
- Start from repository root with `python3 -m http.server 8000`, open `http://localhost:8000/prototype/`. Also support serving the **contents** of prototype at a domain root. Use relative imports/assets, hash links, no `/prototype/` assumptions, no history rewrite, no `file://` expectation.
- `index.html` owns document metadata, CSS variables/base CSS, font links, CDN scripts, `#app`, `#overlay-root`, `#toast-root`, `#switcher-root`, and `<script type="module">` bootstrap importing `./core/router.js`. No extra bootstrap or stylesheet file.
- Load Tailwind with exactly `<script src="https://cdn.tailwindcss.com/3.4.16"></script>`, followed by inline `tailwind.config` with `darkMode: 'class'`, theme colors and font extension. Load Chart.js 4.4.1 from `https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js`. Load Google Fonts **IBM Plex Sans Arabic**, weights 400/500/600/700, and use it for both languages. CDN/font availability requires Internet; chart failure must leave textual metrics usable.
- All view markup is HTML template-literal strings rendered into `#app`. ES modules only; delegated `data-action` handlers; optional `mount(root, ctx)` after render. No inline event handlers.
- Hash routing uses entries `{ path, roles, title: {ar,en}, view }`. Registered paths below omit `#`; actual links include it. Unknown paths show a localized 404. Role denial shows “No permission” with buttons to switch to an allowed role and retry that route. Normal switcher role changes always go to role home. Missing record => not-found state; existing out-of-scope record => scoped denial without leaking its name.
- All mock domain mutations are in memory in `core/store.js`; reload reseeds. Only `role`, `lang`, `theme` persist, each localStorage read/write wrapped in try/catch with validation/fallback. Reset demo data reseeds and navigates to current role home, keeping these preferences.
- One accountable owner per course. Teacher qualifications are many-to-many. Assistant team membership alone never authorizes all teacher courses. Public results include only Published courses owned by active approved teachers.
- Authorization must guard both read selectors and action reducers, including direct hashes and forged `data-id` values. This demonstrates permission behavior; client-side checks are not production security.

## 2. Design, localization and interaction conventions

### 2.1 Tokens and responsive layouts

Define these CSS variables on `:root`, override semantic surfaces/text in `html.dark`, and expose matching Tailwind names. Use literal class maps rather than computed class fragments so Play CDN sees styles.

| Token / Tailwind name | Light | Dark |
|---|---|---|
| `--primary` / primary | #0F766E | #2DD4BF |
| `--primary-strong` / primary-strong | #115E59 | #5EEAD4 |
| `--sand` / sand | #F4EFE5 | #182728 |
| `--surface` / surface | #FFFFFF | #132324 |
| `--canvas` / canvas | #FAF8F3 | #0C191A |
| `--ink` / ink | #172F31 | #EDF6F4 |
| `--muted` / muted | #526867 | #ACC1BE |
| `--border` / border | #D6E2DE | #38504D |
| `--accent` / accent | #9F2434 | #FDA4AF |

- Teal actions, sand page backgrounds, sparse deep-red accent for urgent/destructive emphasis. Statuses also use semantic success/warning/error/info palettes with text and icons; never color alone. Use dark text on bright dark-theme primary buttons and white text on light-theme primary buttons; verify contrast.
- 4px spacing grid; 16px body, 14px secondary, 24–36px headings; 12–20px card radius, restrained shadows. Touch controls at least 44px; switcher trigger exactly 56px. Content width max 1280px; public hero combines headline, grade selector and SVG course collage.
- Mobile first at 375px: single column, full-width forms/actions; cards become 2 columns at 640px and 3–4 at 1024px. Portal sidebar is 248px on desktop, drawer on mobile. Data tables become labeled record cards below 640px (do not hide essential columns/actions). No horizontal **page** overflow. Long IDs wrap; flex children use min-width:0; charts use constrained wrappers.
- Use logical spacing/positioning (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`, CSS inline/block properties). Mirror directional arrows only, not clocks/play/check icons. In learning room place outline at inline-start and player beside it; collapse outline into drawer on mobile.
- `layout.js`: `publicLayout(body, ctx)` => top nav (brand, Explore, Teachers, Become teacher, Help, sign-in/workspace), main, footer with About/legal links. `portalLayout(body, ctx)` => role sidebar, top bar (breadcrumb, notifications bell with unread count, user menu), main. User menu links profile/settings and demo sign-out. Sidebars derive from role map; never mix privileges.
- Oman times use `Intl.DateTimeFormat` with `timeZone:'Asia/Muscat'`; seed timestamps UTC. Demo clock is fixed at 2026-10-19T08:00:00Z so sessions remain meaningful on future review dates; label calendar “Demo date: 19 October 2026”. No invented KPI targets.

### 2.2 Module ownership and contracts

| Module | Exports / responsibility |
|---|---|
| data.js | `createSeed()` returns a fresh complete object; deterministic IDs and fixtures; exports `DEMO_NOW`, `PERSONAS`, enums. No mutation or DOM. |
| store.js | `getState()`, `select(selector, args={})`, `dispatch(type, payload={})`, `subscribe(fn)`, `resetDemoData()`, `can(action, resource)`. Dispatch returns `{ok,data,errorKey,fieldErrors}`; validates actor/scope/transitions before atomic state replacement and subscription notification. No direct view writes to state. |
| i18n.js | `t(key, params={})`, `L(value)`, `esc(value)`, `money(baisa)`, `dateTime(iso)`, `setLang(lang)`. `L` chooses bilingual value with fallback; `t` interpolation is text, not HTML. Both require esc at HTML boundaries. `money` always 3 decimals (30000 => `30.000 ر.ع.` in AR, `OMR 30.000` in EN); wrap formatted numeric text in bidi-isolated spans. |
| router.js | `routes`, `startRouter()`, `navigate(hash)`, `renderCurrent()`, `registerActions(namespace, handlers)`. Imports view modules, registers actions once; parses params/query, calls guarded views/layouts, disposes old mounts, manages delegated submit/click/change/input and hashchange. |
| ui.js | Pure markup helpers in §3; overlay/toast lifecycle controller exports described there. Imports i18n/icons/media and receives data; never reads private records directly. |
| icons.js | `icon(name,{size=20,className='',label=''}={})` returns inline SVG, stroke currentColor, viewBox 0 0 24 24, hand-written Lucide-style paths; decorative aria-hidden or titled accessible icon. No icon library. |
| media.js | `courseCover(courseId, subjectId)` and `initialsAvatar(name, seed)` return encoded SVG data URIs; deterministic gradient/geometric covers and initials. XML-escape names before URI encoding. No external image URLs. |
| charts.js | `mountCharts(root, configs, ctx)` returns cleanup destroying every Chart instance. `configs` keyed by canvas data-chart ID; use selected locale/theme; totals computed from scoped store selectors. SVG rings/sparklines are UI helpers. |
| switcher.js | `mountSwitcher(root)` registers persistent floating control and returns cleanup. Calls preference setters/store/router; never recreates event listeners on every route. |
| layout.js | Public/portal wrappers, role nav registry, role home mapping and shared shell actions; router selects layout from route namespace. |
| views/*.js | Export view objects `{render(ctx), mount?(root,ctx)}` plus `registerActions(register)`; all route-specific actions delegate to store. No imports from router (avoids cycle); ctx supplies navigation. |

`ctx = {params, query, role, actor, navigate, dispatch}`. A view `render(ctx)` returns HTML, reads only scoped selectors, and never changes store. `mount` returns a cleanup function (even when just clearing a player timer). Router calls cleanup before navigation, preference changes, store rerenders and reset; restores focus intelligently after mutations. Mount charts only after canvases exist. Never double-register handlers. Async-looking operations can use short in-memory delays, cancelled on disposal; no network API.

Action naming: `namespace.verb` (e.g. `public.filter`, `checkout.confirm`, `student.completeLesson`, `teacher.submitCourse`, `assistant.reply`, `admin.approveBatch`, `shell.toggleNav`). Entity IDs travel in `data-id`, `data-course-id`; filters/forms have named inputs; dispatch payloads are read and validated explicitly. Links use `href="#/..."`; buttons use `type="button"` unless submitting. `data-action` on forms handles submit with preventDefault and FormData; clicks must not also submit twice. Global delegation uses closest matching element inside the relevant root. Never eval actions or inject arbitrary HTML from text input.

Example complete view object (router registers namespace handlers once; all referenced helpers are specified above):

```js
import { t, L, esc } from '../core/i18n.js';
import { pageHeader, card, progressRing } from '../core/ui.js';
import { select } from '../core/store.js';
export const overview = {
  render(ctx) {
    const s = select('student.summary');
    return pageHeader({ title: t('student.home'), subtitle: L(s.student.name) }) +
      card({ body: `${progressRing(s.percent, { label: t('learning.progress') })}
        <p>${esc(t('learning.completed', { count: s.completed }))}</p>
        <a href="#/student/courses">${esc(t('learning.myCourses'))}</a>
        <button type="button" data-action="student.markAllRead">${esc(t('notifications.markAllRead'))}</button>` });
  }
};
export function registerActions(register) {
  register('student', {
    markAllRead: (_event, _element, ctx) => ctx.dispatch('notifications.markAllRead', {})
  });
}
```

Markup arguments (`body`, `actions`, explicit column renderers) accept only trusted component/view output. Every scalar string is escaped **inside** the component; direct template interpolation of user/content strings uses `esc(t(...))`, `esc(L(...))`, `esc(formValue)`. Do not double-escape component scalar props. URLs are generated from trusted route IDs or whitelisted hashes; SVG/media sources exclusively come from media.js. No arbitrary URL entry rendered as href. Forms preserve entered Arabic/English user text as text, not bilingual invented translations.

### 2.3 i18n, persistence and floating switcher

- Default `lang='ar'`, `dir='rtl'`; English sets `lang='en'`, `dir='ltr'` on html. Every visible label, status, validation, toast, accessible name, chart label, title and empty state has a dictionary key. Content names/descriptions are `{ar,en}`. No mixed hard-coded UI strings. Set document title to localized route title plus brand.
- Apply persisted valid theme/lang before first visible render; use html class `dark`. Default light. Storage errors never prevent navigation or mutations.
- Switcher trigger fixed `inset-inline-end:16px; inset-block-end:calc(16px + env(safe-area-inset-bottom)); width/height:56px; z-index:10000`; panel immediately above, max width min(320px, viewport minus 32px), max-height within viewport, internally scrollable. Leave bottom space in layouts so it does not cover primary actions.
- Panel contains the eight roles in specified order (visitor, student, guardian, teacher, assistant, admin_finance, admin_moderation, super_admin), AR/EN, light/dark, quick jumps for selected role, reset data. Trigger has aria-expanded and aria-controls; panel is labeled dialog with focus trap. Outside click/Escape close; restore trigger focus; Tab wraps. Background inert while open; when closed no hidden focusable items. Overlay manager handles nesting and restores underlying dialog state. Close before role navigation. Reset uses confirmation modal.
- Role switching changes actor to fixed persona, clears transient form/child/conversation selection, retains store, and goes home. Authentication return-to is a separate explicit flow, restricted to internal authorized hashes. Sign-out sets visitor/home. Reload restores preference persona but resets domain state; missing post-reload generated IDs show recoverable not-found.

## 3. Shared component API (`core/ui.js`)

All functions below return HTML strings unless explicitly marked controller. IDs must be unique per mounted page. Scalar props escape internally. `Action = {label, href?, action?, data?, variant?, disabled?, disabledReason?}`; href and action are mutually exclusive. Data keys restricted to safe known attributes. All disabled actions explain why in adjacent text/title, not color alone.

| Exact signature | Returned HTML / required behavior |
|---|---|
| `card({title='',subtitle='',body='',actions='',className=''})` | `<section>` with optional heading/subtitle, trusted body and action footer; no unnecessary clickable wrapper. |
| `statCard({label,value,delta=null,icon:iconName=null,trend=[],href=null})` | Metric article with label, value, signed delta text and optional SVG sparkline; optional explicit link. |
| `badge(status,{domain, size='sm'}={})` | Text + icon `<span>` from domain-qualified vocabulary below; unknown => neutral localized “Unknown”, never misleading success. Domain required for overlapping statuses. |
| `table(columns,rows,{caption,rowKey='id',empty=null,actions=null}={})` | Accessible captioned table with th scope, and mobile record cards rendering same values/actions. `columns=[{key,label,render?:(row)=>trustedHTML,align?:'start'|'end'}]`; default values escaped. Scoped rows supplied by caller. |
| `tabs(items,active,{label,id='tabs'}={})` | Hash-query navigation with links, active aria-current; `items=[{id,label,href,count?}]`. Navigation-style tabs, not ARIA tab widgets; content section labeled by active link. |
| `modal({id,title,body,footer='',size='md'})` | Hidden labeled `<dialog>` with close action, focusable heading, body/footer; use controller to open. Destructive actions name target and consequences. |
| `drawer({id,title,body,side='start'})` | Hidden `<dialog>` styled as inline-side sheet with backdrop/close button; mobile navigation and filters share it. |
| `emptyState({icon:iconName='search',title,description='',action=null})` | Centered status article with descriptive text and optional actionable recovery. |
| `progressBar(value,{label='',showValue=true}={})` | Clamped 0–100 track with role progressbar and aria values, visible label/percent. |
| `progressRing(value,{label='',size=80}={})` | Inline SVG circle with clamped percent, accessible title and text percent; rotate starts at top; no Chart.js. |
| `sparkline(values,{label,width=120,height=32}={})` | SVG polyline normalized over finite numbers, handles empty/flat series, title label; no axes. |
| `avatar(person,{size=40,showName=false}={})` | Initials img from media.js with optional escaped L(name); alt empty when adjacent name repeats it. |
| `courseCard(course,{href=null,progress=null,action=null}={})` | Cover, grade/subject, title, teacher, mode, three-decimal price/free, optional progress and explicit CTA. No fabricated reviews. |
| `teacherCard(teacher,{href=null}={})` | Avatar, name, verified credentials indicator only when verified, qualification chips and published course count. |
| `lessonRow(lesson,{locked=false,preview=false,done=false,active=false,href=null,action=null}={})` | List item with type icon, duration, preview/lock/check text and control; locked selection opens purchase explanation, never protected content. |
| `pagination({page,total,pageSize,action='public.page'})` | Labeled nav with previous/next and numbered buttons using data-page, current/disabled states, result count; page is 1-based. |
| `filterBar(fields,values,{action='public.filter',resetAction='public.resetFilters'}={})` | Search/filter form plus active filter chips/reset; fields use formField descriptors. Mobile collapsible drawer trigger; desktop inline. |
| `stepper(steps,current,{label}={})` | Ordered step list (`steps=[{id,label}]`, current ID), complete/current/upcoming text; current aria-current=step. |
| `toast({id,message,tone='info',action=null})` | Dismissible notification; status live region for info/success, alert for failure. Controller handles timeout; actionable/error toasts persist until dismissed. |
| `formField({id,name,label,type='text',value='',options=[],hint='',error='',required=false,disabled=false,min=null,max=null,step=null,rows=4})` | Label + input/select/textarea with error/hint IDs, aria-describedby/invalid. Types text,email,password,number,date,datetime-local,select,textarea,checkbox,radio,file. Options `{value,label,disabled?}`; radio grouped fieldset/legend, checkbox checked from boolean. File is local filename-only simulation, no upload. Password never stored. |
| `breadcrumb(items)` | Labeled nav with ordered links/text (`{label,href?}`), current aria-current; mirrored separator. |
| `pageHeader({title,subtitle='',actions='',breadcrumbs=[]})` | One h1 per page, subtitle, breadcrumb, wrapping action area. |
| `button({label,href=null,action=null,data={},variant='primary',disabled=false,disabledReason=''})` | Safe anchor or native button using Action conventions. |
| `iconButton({label,icon:iconName,action,data={},expanded=null,controls=null})` | Labeled native button with decorative SVG and optional aria-expanded/controls. |
| `notice({title='',message,tone='info'})` | Non-modal status block with icon/title/body; distinguish simulated from real provider operations. |

Controllers: `openOverlay(id,{returnFocus=document.activeElement}={})`, `closeOverlay(id)`, `showToast(message,{tone='info',action=null}={})`, `disposeOverlays()`. Open via showModal, trap focus, inert background, Escape/outside-close for non-destructive dialogs, focus return; central stack coordinates drawer/modal/switcher. Toast timers cleaned on removal; status announcements do not steal focus.

### 3.1 Status vocabulary and transitions

Use keys `status.<domain>.<state>`; paired AR / EN strings below are canonical. Tone categories: neutral for draft/inactive, info for work in progress, warning for waiting/held, success for approved/complete, danger for rejected/failed/revoked. All tables/detail views reuse badges. Transitions are enforced by store, not only buttons.

| Domain | Exact state => Arabic / English |
|---|---|
| teacher_application | `draft_application` مسودة / Draft; `submitted` مقدّم / Submitted; `under_review` قيد المراجعة / Under review; `approved` معتمد / Approved; `rejected` مرفوض / Rejected; `more_info_required` معلومات إضافية مطلوبة / More information required |
| account | `active` نشط / Active; `invited` مدعو / Invited; `suspended` موقوف / Suspended; `deactivated` غير مفعل / Deactivated |
| course | `Draft` مسودة / Draft; `Submitted` مقدّم للمراجعة / Submitted; `ChangesRequested` تعديلات مطلوبة / Changes requested; `Published` منشور / Published; `Unpublished` غير منشور / Unpublished; `Archived` مؤرشف / Archived |
| order | `draft` مسودة / Draft; `pending` بانتظار الدفع / Pending payment; `paid` مدفوع / Paid; `failed` فشل الدفع / Failed; `cancelled` ملغى / Cancelled; `partially_refunded` مسترد جزئياً / Partially refunded; `refunded` مسترد / Refunded |
| payment | `initiated` بدأ الدفع / Initiated; `pending` قيد الانتظار / Pending; `succeeded` ناجح / Succeeded; `failed` فاشل / Failed; `refunded` مسترد / Refunded; `partially_refunded` مسترد جزئياً / Partially refunded |
| earning | `pending` معلّق / Pending; `available` متاح للصرف / Available; `reserved` محجوز / Reserved; `in_payout` قيد الصرف / In payout; `paid` مدفوع / Paid; `adjusted` معدّل / Adjusted |
| payout_batch | `Draft` مسودة / Draft; `UnderReview` قيد المراجعة / Under review; `Approved` معتمد / Approved; `Processing` قيد المعالجة / Processing; `Paid` مدفوع / Paid; `Failed` فاشل / Failed; `Rejected` معاد للتعديل / Returned for changes |
| conversation | `open` مفتوح / Open; `assigned` مسند / Assigned; `waiting` بانتظار الرد / Waiting; `resolved` محلول / Resolved; `escalated` مصعّد / Escalated |
| guardian_link | `requested` طلب ربط / Requested; `pending_verification` بانتظار التحقق / Pending verification; `verified` موثّق / Verified; `rejected` مرفوض / Rejected; `revoked` ملغى / Revoked |
| access | `active` ساري / Active; `expired` منتهي / Expired; `revoked` ملغى / Revoked |
| enrollment | `active` نشط / Active; `completed` مكتمل / Completed; `suspended` معلّق / Suspended |
| lesson_progress | `not_started` لم يبدأ / Not started; `in_progress` قيد التعلم / In progress; `done` مكتمل / Done |
| content | `draft` مسودة / Draft; `processing` قيد التجهيز / Processing; `ready` جاهز / Ready; `published` منشور / Published; `failed` فاشل / Failed |
| live | `draft` مسودة / Draft; `scheduled` مجدول / Scheduled; `rescheduled` أعيدت جدولته / Rescheduled; `live` مباشر / Live; `ended` انتهى / Ended; `recording_processing` تجهيز التسجيل / Recording processing; `recording_ready` التسجيل جاهز / Recording ready; `recording_published` التسجيل منشور / Recording published; `cancelled` ملغى / Cancelled; `failed` تعذر الاتصال / Unavailable |
| submission | `not_submitted` لم يسلّم / Not submitted; `submitted` مسلّم / Submitted; `graded` مصحح / Graded; `released` النتيجة منشورة / Result released |
| refund | `requested` مطلوب / Requested; `under_review` قيد المراجعة / Under review; `approved` معتمد / Approved; `processing` قيد المعالجة / Processing; `succeeded` مسترد / Refunded; `rejected` مرفوض / Rejected; `failed` فاشل / Failed |
| dispute | `open` مفتوح / Open; `under_review` قيد المراجعة / Under review; `won` لصالح المنصة / Won; `lost` استرداد قسري / Lost |
| task | `open` مفتوحة / Open; `in_progress` قيد التنفيذ / In progress; `done` مكتملة / Done |
| delivery | `queued` في الطابور / Queued; `sent` مرسل / Sent; `failed` فاشل / Failed; `read` مقروء / Read |

- Application: draft_application → submitted → under_review → approved/rejected/more_info_required; more_info_required → submitted. Account suspension remains separate.
- Course: Draft → Submitted → Published/ChangesRequested; ChangesRequested → Submitted; Published → Unpublished/Archived; Unpublished → Published only via explicit moderated republish; Draft → Archived. Published material edits create pending_revision, preserving published_snapshot until approval.
- Order/payment: draft/initiated → pending → paid/succeeded or failed/failed; retry creates a new transaction for same immutable order items. Cancel only unsettled order. Refund states follow item-level adjustments; stale pending/failure cannot overwrite success.
- Earning: pending → available (explicit demo hold release), available → reserved (dispute or batch reservation) → in_payout (Processing) → paid (confirmed/reconciled). Reserved → available on release/rejected batch. Failed transfer remains reserved, never paid. Adjustments append linked entries; preserve original paid allocations.
- Payout: Draft → UnderReview → Approved → Processing → Paid/Failed; UnderReview → Rejected → Draft; Failed → UnderReview for revalidation. Approval requires current actor ID != prepared_by, including super_admin. Changing amount/destination invalidates approval. Retry must not duplicate allocation selection or transfer.
- Conversation: open → assigned → waiting/resolved/escalated; waiting → assigned/resolved; escalated → assigned/resolved by owner/moderator; new student reply reopens resolved to open. Internal notes never appear to learner/guardian.
- Guardian: requested → pending_verification → verified/rejected; verified → revoked. New request required after revoke. No visibility/purchase permission until verified and matching scope.

## 4. Seed schema and demo store

### 4.1 Data conventions and quantities

Each entity has stable `id`; all foreign keys must resolve. Counts below are exact initial targets unless stated otherwise. Names/titles/descriptions use `{ar,en}` (abbreviated **B**); actor-authored messages use `{text,lang}`. Times ISO UTC, monetary values integer **baisa** (1000 = 1 OMR), currency OMR, rates integer basis points, never floating-point balances. `created_at`, `updated_at` included on mutable records; append-only records retain created_at only. Do not confuse academic `grades` with assessment `assessment_grades`.

| Collection | Seed count | Required fields in addition to id |
|---|---:|---|
| users | 20 | name:B, email (example.test), status, locale; 6 student + 2 guardian + 6 teacher + 2 assistant + 4 staff identities |
| students | 6 | user_id, name:B, current_grade_id, interests:[subject_id], profile_color; S-001..S-006 |
| guardians | 2 | user_id, name:B, verification_status; G-001,G-002 |
| guardian_student_links | 6 | guardian_id, student_id, relationship:B, state, scopes:[progress,results,attendance,purchase], evidence_ref, requested_at, verified_at, revoked_at, verified_by; G-001 has S-001/S-002 verified, S-003 pending_verification, S-004 revoked; G-002 has S-001 verified independently, S-005 rejected |
| teachers | 6 | user_id, name:B, bio:B, application_status, credentials:[{label:B,verified}], verification_state, account_status; T-001..T-006 (3 approved, 1 submitted, 1 more_info_required, 1 rejected) |
| teacher_applications | 6 | teacher_id, declared_grade_subject_ids, credential_labels, state, reviewer_id, feedback:B, history:[{state,actor_id,at}] |
| teacher_grade_subjects | 20 | teacher_id, grade_subject_id, verification_state; T-001 has all Math/Science pairs grades 1–6 (12); T-002 grade12 English only (1); T-003 seven approved pairs; remaining applicants declare scope on applications, not approved qualifications |
| teacher_invitations | 2 | email, teacher_id nullable, invited_by, status, expires_at |
| teacher_team_members | 2 | teacher_id, user_id, status, team_role, invited_at, expires_at; TM-001 active for T-001, TM-002 invited |
| course_team_assignments | 2 | team_member_id, course_id, capabilities:[reply_conversation,read_content,grade_assignment,edit_content], status; TM-001 C-001 reply/read/grade, C-002 reply/read/edit only |
| curricula | 1 | code:'OM-MOE', name:B, active:true |
| curriculum_versions | 2 | curriculum_id, name:B, effective_year, active; current 2026 and historical 2025 |
| grades | 12 | number:1..12, name:B, cycle_key, cycle_label:B; 1–4 الحلقة الأولى / Basic Education Cycle 1; 5–10 الحلقة الثانية / Basic Education Cycle 2; 11–12 التعليم ما بعد الأساسي / Post-Basic Education |
| tracks | 2 | curriculum_version_id, name:B, active; general and illustrative upper-grade science track (not a claim of official current offering) |
| subjects | 8 | code, name:B, description:B, icon, color; mathematics, science, Arabic, English, Islamic studies, social studies, physics, chemistry |
| grade_subjects | 60 | curriculum_version_id, grade_id, subject_id, track_id nullable, display_name:B, active; current version: first four subjects all grades (48), Islamic/social grades1–4 (8), physics/chemistry grades11–12 (4). Illustrative availability, not exhaustive national curriculum |
| academic_years | 2 | name:B, starts_at, ends_at; 2025–26 and 2026–27 |
| semesters | 4 | academic_year_id, name:B, sequence, starts_at, ends_at |
| courses | 24 | owner_teacher_id, grade_subject_id, academic_year_id, semester_id, track_id nullable, title/summary/description/outcomes/prerequisites:B, language, mode, status, price_type, price_baisa, access_policy:{kind,end_at}, support_summary:B, cover_seed, published_snapshot, pending_revision nullable, review_feedback:B |
| modules | 72 | course_id, title:B, position; 3 per course |
| lessons | 216 | module_id, title:B, type:video/reading/quiz/assignment, position, duration_seconds, preview:boolean, state, body:B, transcript:B, simulated_media_ref, completion_basis; 3 per module |
| lesson_resources | 48 | lesson_id, title:B, kind:worksheet/pdf/link, filename, byte_size, body:B; local inline worksheet preview/download via generated Blob, no missing files |
| live_sessions | 12 | course_id, host_teacher_id, title:B, starts_at, ends_at, timezone, status, provider_ref:'demo', join_generation, recording_disclosure:B; include scheduled, live, ended, cancelled, rescheduled, failed |
| attendance | 12 | live_session_id, student_id, joined_at, left_at, minutes, status:present/absent |
| recordings | 6 | live_session_id, course_id, title:B, state:processing/ready/published, duration_seconds, published_at, simulated_media_ref; 2 each processing/ready/published |
| enrollments | 12 | student_id, course_id, status, started_at, historical_grade_id; progress calculated from lesson_progress, not copied counter |
| access_grants | 14 | student_id, course_id, enrollment_id, origin:one_time_purchase/complimentary/admin_grant/subscription, source_id nullable, starts_at, ends_at, status; 10 active, 2 expired, 2 revoked; zero subscriptions; valid window and active enrollment required |
| lesson_progress | 24 | enrollment_id, student_id, lesson_id, status, position_seconds, completion_basis, completed_at |
| quizzes | 8 | course_id, lesson_id, title:B, pass_score, attempt_limit:2, question_ids |
| questions | 24 | quiz_id, version:1, prompt:B, choices:[{id,text:B}], correct_choice_id, points |
| attempts | 6 | quiz_id, student_id, answers, question_snapshot, score, submitted_at |
| assignments | 8 | course_id, lesson_id, title:B, instructions:B, due_at, max_score |
| submissions | 6 | assignment_id, student_id, text, filename nullable, state, submitted_at |
| assessment_grades | 4 | submission_id, grader_user_id, score, feedback, released_at nullable |
| conversations | 10 | course_id, lesson_id nullable, student_id, kind:lesson_qa/private_support, subject:B, state, assigned_user_id nullable, last_message_at; 4 C-001, 2 C-002, 4 outside assistant scope |
| conversation_assignments | 4 | conversation_id, assignee_user_id, assigned_by, status; 3 assigned to assistant A-001, 1 to teacher |
| messages | 30 | conversation_id, author_user_id, text, lang, internal:boolean, moderation_state:visible/flagged/removed, created_at |
| announcements | 6 | course_id, author_user_id, title/body:B, published_at |
| tasks | 4 | course_id, assignee_user_id, kind:grading/content, target_id, state, due_at; 2 each, capabilities must match assigned course |
| orders | 8 | buyer_user_id, state, currency, subtotal_baisa, discount_baisa, tax_baisa, total_baisa, created_at; 4 paid, 1 pending, 1 failed, 1 refunded, 1 partially_refunded |
| order_items | 9 | order_id, course_id, beneficiary_student_id, title_snapshot:B, owner_teacher_id_snapshot, price_baisa, discount_baisa, tax_baisa, total_baisa, commission_snapshot:{rule_id,version,base_baisa,rate_bps,platform_baisa,teacher_baisa}; one historical two-item order exercises sibling isolation; new checkout one course/item |
| payment_transactions | 9 | order_id, provider_ref, attempt_no, state, amount_baisa, currency, confirmed_at, verified_demo:boolean; retries are distinct attempts |
| provider_events | 9 | event_id unique, payment_transaction_id, payload:{order_id,beneficiary_ids,amount_baisa,currency,outcome}, verified_demo, processed_at; never represent client simulator as genuine signature verification |
| commission_rules | 3 | scope:default/teacher/campaign, teacher_id nullable, course_id nullable, version, rate_bps, active_from, label:B; illustrative default 2000 bps, T-002 override 1500, inactive campaign 1000 |
| earning_allocations | 8 | order_item_id, teacher_id, snapshot, amount_baisa, state, original_allocation_id nullable, hold_reason, eligible_at; include all six earning states, no mutable wallet field |
| financial_ledger_entries | approximately 60; derive exact count from balanced fixture journals | journal_id, account, teacher_id nullable, source_type, source_id, debit_baisa, credit_baisa, currency, created_at, reversal_of nullable; balanced journals for every seeded sale, state transfer, payout and adjustment; never pad with disconnected entries |
| teacher_payout_accounts | 3 | teacher_id, beneficiary_name:B, masked_iban, verification_state, verified_by, changed_at; no real account numbers |
| payout_batches | 6 | state (one each Draft/UnderReview/Approved/Processing/Paid/Failed), prepared_by, approved_by nullable, period_label:B, allocation_ids, total_baisa, destination_snapshots, submitted_at, approved_at, failure_reason, transfer_attempt_ids; creator and approver distinct |
| teacher_payouts | 6 | batch_id, teacher_id, payout_account_id, allocation_ids, amount_baisa, state, provider_ref, reconciled_at; Draft batches may have empty allocation selection; active/paid allocations cannot belong to two batches |
| refunds | 2 | order_id, order_item_id, amount_baisa, reason:B, state, requested_by, approved_by, access_effect, adjustment_id nullable; one succeeded full-item, one requested |
| disputes | 1 | order_item_id, state, reason:B, held_allocation_ids |
| adjustments | 2 | original_allocation_id, refund_id nullable, dispute_id nullable, signed_amount_baisa, reason:B, journal_id |
| notifications | 24 | recipient_user_id, event_id, type, title/body:B, href, read_at, related_course_id nullable; target eligible learners only |
| delivery_attempts | 24 | notification_id, channel:in_app/email, state, attempts, last_error; email is simulated only |
| permissions | 20 | key, description:B, allowed_resource_type; explicit actions, including separate prepare/approve/release payout |
| role_assignments | 9 | user_id, role, permissions, scope:{module?,course_ids?}, effective_at, expires_at, status; four staff incl. non-switchable second finance actor for historical approvals, plus portal personas; visitor has no assignment |
| audit_events | 20 | actor_user_id, action, resource_type, resource_id, before_summary, after_summary, reason, created_at; append on sensitive read/mutation; no passwords/raw bank details |
| support_tickets | 4 | requester_user_id, course_id nullable, subject/body:B, state:conversation vocabulary, assigned_staff_id, resolution |
| safety_reports | 3 | reporter_user_id, message_id nullable, course_id, reason:B, state:conversation vocabulary, restricted_note, assigned_staff_id |
| cms_pages | 6 | slug:about/help/privacy/terms/refunds/home, title/body:B, status, sections; home includes banners; help includes FAQs |
| promotions | 1 | code:'DEMO10', active:false, rate_bps, funding:'unresolved', label:B; optional feature disabled until configured |
| notification_templates | 6 | event_type, subject/body:B, enabled, channel |
| platform_settings | 1 | reviews_enabled:false, coupons_enabled:false, demo_clock, policy_labels:B, integration_statuses, tax_config:{status:'unconfirmed'}, invoice_config:{status:'demo'}, payout_policy:{status:'unconfirmed'}, guardian_scope_defaults |

Course distribution: **16 Published, 3 Draft, 2 Submitted, 1 ChangesRequested, 1 Unpublished, 1 Archived**; **6 free/18 paid**; **10 recorded/6 live/8 hybrid**. Exactly two per grade, with grade4 both Published; use qualified owners T-001/T-002/T-003, allowing T-003's seven approved pairs to span remaining grades7–11 and additional offerings. One Published course per grade minimum except deliberately filtered empty results. Every published paid course in seed has one preview, a locked reading/video lesson, and clear access terms; free courses also require enrollment for tracked progress. Each course has three modules and nine lessons, enough content to demonstrate outline expansion. Quiz/assignment lesson types only used where corresponding records exist. Zero-star ratings/empty testimonial inventions are prohibited.

### 4.2 Fixed personas and connected anchor records

| Role | Actor / record | Home | Fixture and scope |
|---|---|---|---|
| visitor | anonymous | `/` | No protected records; preview allowed. |
| student | U-S001 / S-001, مريم البلوشية / Maryam Al Balushi | `/student` | Grade4; C-002 active complimentary grant, C-001 **not enrolled** at seed; other historical expired/refunded course fixtures. |
| guardian | U-G001 / G-001, عائشة البلوشية / Aisha Al Balushi | `/guardian` | S-001 Maryam grade4 and S-002 سالم / Salim grade7 verified; S-003 pending and S-004 revoked are status-only requests, never child dashboards. |
| teacher | U-T001 / T-001, أحمد الحارثي / Ahmed Al Harthi | `/teacher` | Approved, active; Math + Science grades1–6; owns C-001,C-002,C-003 plus other qualified courses. |
| assistant | U-A001 / TM-001, نورة الهنائية / Noora Al Hinai | `/assistant` | Assigned C-001 and C-002 only; conversation assignments Q-001,Q-002,Q-003; Q-001 C-002 question by S-001. No guardian or finance access. |
| admin_finance | U-F001, خالد / Khalid | `/admin/finance` | Finance modules only; prepare/release/reconcile/refund; approve another preparer's batch only; cannot edit role scopes. |
| admin_moderation | U-M001, سارة / Sara | `/admin` | People (except employees), applications, teacher teams oversight, course ops, support/safety only. No academic config, CMS, finance or roles. |
| super_admin | U-O001, مدير المنصة / Platform owner | `/admin` | All admin modules plus audited support inspection; no bypass of same-preparer approval restriction. |

Super_admin does not impersonate learners through student routes; administrative scoped detail drawers expose required records with reason/audit. “Sees everything” means all administrative modules/data, not a union of every persona's navigation. Switch to corresponding persona to demonstrate its workspace.

Anchor courses: C-001 grade4 Math hybrid, Published, 30000 baisa, T-001, preview L-001 and locked L-002, future live LS-001. C-002 grade4 Science recorded, Published, free, T-001, Maryam enrolled, Q-001; C-003 grade6 Math Draft owned by T-001. C-004 grade12 English Published owned by T-002, outside assistant and teacher persona scope. C-005 grade5 Science Published/free owned by T-001, not initially enrolled by Maryam, with worksheet, quiz and assignment fixtures for scenario 3. Seed an assignment on C-001 for assistant grading and a draft content task on C-002 for assistant editing. Seed pending applicant T-004 is approved in scenario 6. At least one available T-001 earning allocation EA-AVAILABLE is not in any batch. All other seed totals derived from coherent journal fixtures, not separately invented dashboard numbers.

### 4.3 Required mutations and data consistency

| Action group | Required store effect and UI result |
|---|---|
| Enrollment / access | Free enroll creates unique active enrollment + complimentary grant; paid unlock uses active time-bounded grant and enrollment, not order flag. Repeated clicks return existing result. Preview never enrolls. Archived course leaves existing valid grant intact but removes catalog/checkout. Expired/revoked grants show specific recovery. |
| Checkout | Start carries courseId and optional selected child. Student beneficiary fixed to self; guardian must explicitly pick verified purchase-scoped child. Create immutable order item snapshots only on review confirmation. Reject duplicate active entitlement with Go to course. Provider simulator choice success/pending/failure produces a demo verified event with amount/currency/order/beneficiary validation; process idempotently by event_id and order_item fulfillment key. URL success alone creates nothing. |
| Payment outcomes | Success settles order, creates enrollment/grant and pending earning/journal once, and notifies beneficiary/buyer appropriately. Pending/failure creates no access/earning. Pending can later confirm; failure offers retry/new transaction. Provider page offers “Replay same event” and “Confirm without redirect” for testability. Success result displays actual order status, never trusts query status. |
| Learning | Manual completion for reading/worksheet, simulated video completes at 90% or explicit accessible Finish demo lesson, quiz completes only on submit, assignment on submit. Resume position stored. Course percent = completed published lessons / eligible published lessons; viewing page alone does not complete. Quiz retry bounded and snapshot retained; assignment grades only appear after release. |
| Guardians | Link form uses synthetic invitation token `OMAN-S003` plus relationship/consent, producing pending verification, never name search. Moderation verifies evidence fixture. Read/purchase selectors reevaluate verified links and scopes immediately. Revocation hides child detail and blocks further purchase; historical own receipts remain, with minimal beneficiary snapshot. Guardian never opens paid player or private messages by virtue of link. |
| Authoring | Validate required bilingual metadata, valid catalog/qualification, owner, positive paid price, access terms, and published content before submit. Seed previews are required only by prototype checklist, not asserted commercial policy. Wizard saves Draft. Review feedback/request changes/approval updates history. New Published course appears in catalog. |
| Teams / Q&A | Invite synthetic member; assign course capabilities; revoke immediately. Course Q&A public to entitled course participants but private conversation only own learner/owner/explicit assignee. Assistant only assigned courses AND assigned conversations; teachers assign new questions via inbox. Reply preserves attribution; note internal; escalate to owner; report to safety queue. |
| Live / recordings | Schedule/reschedule/cancel sends one eligible-recipient notification per event. Joining verifies grant, creates attendance and simulated meeting panel; eligible scheduled sessions offer an explicitly labeled “Start demo join” so the fixed demo clock does not block walkthroughs; failed/cancelled cannot join. Recording upload => processing/ready, zero alert; publish => alert once and visible recording. Newly published lesson sends deduplicated course alert. |
| Finance | Snapshot precedence campaign/contract > teacher override > default. Change rules affects future orders only. Release illustrative holds explicitly. Prepare batch selects available allocations and reserves them; submit locks snapshot; independent approval; release transitions Processing; simulated confirm + reconciliation marks Paid and teacher notification. Fail stays unpaid; retry revalidates. Refund successful item revokes corresponding purchase grant (other valid grants unaffected), appends reversal/adjustment, preserves history. |
| Admin operations | Forms/drawers actually update their in-memory entity; approve/invite teacher, edit taxonomy labels, moderate content, grant/revoke entitlement with reason, resolve report, update CMS/templates/settings. Financial/config edits require scope and audit. Sensitive student/support reads require reason in modal. No working primary CTA may be a silent noop. |

Demo accounting: use balanced journals; sale example debit provider clearing 30000, credit platform commission 6000, credit teacher pending payable 24000. Hold release transfers pending to available; batch reservation transfers available to reserved; processing transfers reserved to in-payout; confirmed payout debits in-payout and credits provider clearing. Totals per teacher/state come from ledger accounts; allocation state reconciles to those accounts. Failed/rejected transfer reversal returns funds to reserved/available with a new journal. Refund after payout adds recoverable adjustment; never rewrites Paid history. Display gross, commission, payable, reserved and paid distinctly, never “wallet”. Taxes/fees/discounts are separate fields, zero-valued **demo inputs, not tax claims**. Seed ledger count is a planning estimate; derive its exact count from the seeded financial lifecycles and require every journal to balance. Reducers append journals as required.

## 5. Complete route table

### 5.1 Route notation and shared rules

Role aliases: **ALL** = all eight roles; **S** student; **G** guardian; **T** teacher; **A** assistant; **F** admin_finance; **M** admin_moderation; **O** super_admin. Expand aliases to literal role arrays in router. Public/auth routes are ALL. Checkout is S,G after sign-in; visitor Buy goes to sign-in with safe return hash. Other roles get the no-permission role chooser. Each table row is one registered path pattern; query choices are **not extra routes**. Literal paths precede `:id` patterns.

All tabs use hash query state (`#/student/course/C-002?tab=lessons&lesson=L-010`), preserve Back/Forward, validate allowed values and default unknown tab to first tab. Filters/search/page also in hash query, shareable and localized labels independent of stable IDs. Record details explicitly listed below are routes; other admin detail/edit dialogs use `?record=<id>` and are not separate routes. No hidden unlisted tab destinations. Every table route resolves to an exported view object in the indicated module; reuse a view with route context where appropriate.

### Public, authentication and checkout

| Path | Roles | Arabic title | English title | View module | Key content and interactions |
|---|---|---|---|---|---|
| `/` | ALL | الرئيسية | Home | public | Grade selector grouped by three cycles; curriculum selector shown only if >1 active; featured subjects/courses/teachers; How it works and CTA sections; grade links. |
| `/explore` | ALL | استكشف الدورات | Explore courses | public | Search results; `tab=grades,subjects,courses`; curriculum/year/grade/subject/teacher/semester/language/mode/free-paid/price/availability filters, count, pagination, reset and empty state. Browse by Teacher links /teachers. |
| `/explore/grade/:gradeId` | ALL | دورات الصف | Grade courses | public | Grade landing, valid subject cards, available courses; no fabricated subject mappings. |
| `/explore/grade/:gradeId/subject/:subjectId` | ALL | دورات المادة | Subject courses | public | Grade-subject results and same filter controls; invalid pair gets useful empty/not-found response. |
| `/course/:id` | ALL | تفاصيل الدورة | Course details | public | `tab=overview,outcomes,syllabus,preview,schedule,access,reviews`; overview includes teacher/profile; locked/preview outline, simulated sample player; format/live schedule, price/duration/refund link; buy/free enroll. Reviews tab shows disabled-policy explanation, no fabricated reviews. |
| `/teachers` | ALL | المعلمون | Teachers | public | Directory with grade/subject filters, verified teacher cards, empty results. |
| `/teacher/:id` | ALL | ملف المعلم | Teacher profile | public | Public bio/verified qualifications; `tab=about,courses`; filter owned Published courses; no learner identities. |
| `/become-teacher` | ALL | انضم معلماً | Become a teacher | public | Benefits, process, qualification checklist, CTA to /auth/teacher-application. |
| `/about` | ALL | عن المنصة | About | public | Mission, grade-first model, how it works; data from CMS. |
| `/help` | ALL | المساعدة والتواصل | Help and contact | public | `tab=faq,contact`; searchable FAQs, demo contact submission creates scoped ticket or anonymous confirmation. |
| `/legal/:page` | ALL | السياسات | Policies | public | `page` allowlist privacy/terms/refunds, each full localized section with unapproved-policy notice; bad value 404; title resolved to specific policy. |
| `/auth/sign-in` | ALL | تسجيل الدخول | Sign in | auth | Demo student/guardian role choices, email-shaped form, registration/reset links, validated return hash. No passwords persisted or auth claims. |
| `/auth/reset-password` | ALL | استعادة كلمة المرور | Reset password | auth | Email field, required/email validation, simulated confirmation and back link. |
| `/auth/register/student` | ALL | تسجيل طالب | Student registration | auth | Name/grade/account consent fields, demo confirmation then enters fixed student persona; no actual account creation promise. |
| `/auth/register/guardian` | ALL | تسجيل ولي أمر | Guardian registration | auth | Name/contact/consent; demo confirmation enters fixed guardian persona, link-child CTA; preserve checkout intent. |
| `/auth/teacher-application` | ALL | طلب الانضمام للتدريس | Teacher application | auth | `step=identity,qualifications,credentials,review`; selects many grade-subject pairs, fake filename metadata, submit/update T-004 application; shows pending/rejected/more-info feedback. |
| `/checkout/:courseId/beneficiary` | S,G | اختيار الطالب | Select student | checkout | Step 1: buyer displayed separately, student self or verified linked child radio list; pending link excluded; link child recovery. Free courses use zero-price review and skip provider. |
| `/checkout/:courseId/review` | S,G | مراجعة الطلب | Order review | checkout | Step 2: course, buyer, beneficiary, OMR lines, access terms, consent; validates context/beneficiary anew, creates order on confirm. No implicit first-child selection. |
| `/checkout/order/:orderId/provider` | S,G | الدفع التجريبي | Demo payment | checkout | Step 3: provider-neutral simulator, success/pending/failure radio, Pay/Replay/Confirm without redirect. No card fields. Buyer-owned orders only. |
| `/checkout/order/:orderId/result` | S,G | نتيجة الدفع | Payment result | checkout | Success/pending/failure variants from store, receipt link, learner next step; pending check status, failed retry. Guardian success links child progress; switcher student unlock demonstration. |
| `/checkout/order/:orderId/receipt` | S,G | إيصال الطلب | Order receipt | checkout | Own buyer receipt with item beneficiary, transaction reference, totals, status, print button using print styles; “Demo receipt”. Enrollment access CTA role-aware. |

### Student

| Path | Roles | Arabic title | English title | View module | Key content and interactions |
|---|---|---|---|---|---|
| `/student` | S | لوحة الطالب | Student dashboard | student | Continue-learning card, weekly activity chart, due work, next live class, unread notices and recommended grade courses. |
| `/student/courses` | S | دوراتي | My courses | student | `tab=active,completed,expired`; progress cards; distinguishes archived valid access/refunded revoked access; browse recovery. |
| `/student/course/:id` | S | غرفة التعلم | Learning room | student | `tab=overview,lessons,resources,assessments,live,qa,announcements`; overview progress; lessons outline plus video/reading player via `lesson` query; resources attachments/worksheets; assessments quizzes/assignments via `activity` query and inline submit/results; live sessions/recordings `session`/`recording`; Q&A form/report; announcements feed. Grant required for private content; locked state purchase recovery. |
| `/student/explore` | S | اكتشف دورات | Browse courses | student | Portal-wrapped shared catalog, defaults current grade; filters same as public; course links to public detail. |
| `/student/calendar` | S | الجدول والحصص المباشرة | Calendar and live classes | student | Calendar/list toggle, week navigation, join eligible session; rescheduled/cancelled/provider failure states, attendance. |
| `/student/assignments` | S | الواجبات والنتائج | Assignments and results | student | `tab=assignments,quizzes,results`; due/late status, open activity in room, released grade summaries. |
| `/student/messages` | S | الرسائل والأسئلة | Messages and questions | student | Own conversations; `tab=conversations,questions`; course selector limited to entitlements; start question routes to owning course scope. |
| `/student/messages/:id` | S | المحادثة | Conversation | student | Own message thread/reply/report/resolve status; internal notes excluded. |
| `/student/notifications` | S | الإشعارات | Notifications | student | Filter unread/all, mark read/all read, safe authorized deep links. |
| `/student/profile` | S | الملف التعليمي | Learning profile | student | Name/current grade/interests, activity and completion summary; edit current grade preserves history/grants. |
| `/student/settings` | S | الحساب والخصوصية | Account and privacy | student | `tab=account,privacy,notifications`; editable demo prefs, consent/help information and guardian-link status; no fabricated password changes. |

### Guardian

| Path | Roles | Arabic title | English title | View module | Key content and interactions |
|---|---|---|---|---|---|
| `/guardian` | G | لوحة ولي الأمر | Guardian dashboard | guardian | Verified children summary cards, child switcher, upcoming activity, recent own purchases; pending links only status count. |
| `/guardian/children` | G | أبنائي | My children | guardian | Verified child cards and separate own pending/rejected/revoked requests; link action; no progress preview on unverified requests. |
| `/guardian/children/link` | G | ربط طالب والتحقق | Link and verify child | guardian | Invitation code/relationship/consent, submit pending request; evidence/status feedback and no immediate access. |
| `/guardian/child/:id` | G | متابعة الطالب | Child dashboard | guardian | `tab=courses,results,live,activity`; scoped progress, assignment/quiz summaries, upcoming live, attendance/activity chart; course purchase CTA, no player/private messages. |
| `/guardian/explore` | G | شراء دورة لطالب | Explore for a child | guardian | Explicit verified-child picker, portal catalog with grade preset; carry child to checkout, confirmation still explicit. |
| `/guardian/orders` | G | الطلبات والإيصالات | Orders and receipts | guardian | Own orders with child/course/status, receipt/result links; payment pending/failure recoveries. |
| `/guardian/notifications` | G | الإشعارات | Notifications | guardian | Authorized child summary/payment notices only, read controls. |
| `/guardian/support` | G | الدعم | Support | guardian | Own tickets list, create topic/message, detail/reply via `record`; no child's private thread exposure. |
| `/guardian/settings` | G | الإعدادات وصلاحيات الربط | Settings and link permissions | guardian | `tab=account,links,notifications`; inspect scopes, revoke verified link with confirmation, request scope change for moderator review; never self-verify. |

### Teacher

| Path | Roles | Arabic title | English title | View module | Key content and interactions |
|---|---|---|---|---|---|
| `/teacher` | T | لوحة المعلم | Teacher dashboard | teacher | Owned course/student counts, inbox queue, sales/payables, activity/sales chart, create course. |
| `/teacher/courses` | T | دوراتي التعليمية | My teaching courses | teacher | Filter all publication states, cards/table, edit/workspace/create and feedback indicators. |
| `/teacher/courses/new` | T | إنشاء دورة | Create course | teacher | Wizard `step=identity,academics,content,assessments,live,access,review`; save generates draft ID and edit URL, qualification checks, preview checklist. |
| `/teacher/courses/:id/edit` | T | تحرير الدورة | Edit course | teacher | Same wizard for owned course; pending revision for Published material edits; save/submit, inline validation and existing content preserved. |
| `/teacher/course/:id` | T | مساحة الدورة | Course workspace | teacher | `tab=details,lessons,resources,live,learners,questions,analytics`; details/publishing; modules/lesson reorder/add/edit/preview; resources+assessments create/edit; schedule/recordings lifecycle; enrollments/progress; questions+announcements; scoped engagement chart. |
| `/teacher/students` | T | الطلاب | Students | teacher | Owned-course learners only; course filter and `record` progress/result drawer; no unrelated guardian data. |
| `/teacher/inbox` | T | الوارد والأسئلة | Inbox and Q&A | teacher | Open/assigned/waiting/escalated/resolved query filters; assign to active course member, respond, escalate. |
| `/teacher/inbox/:id` | T | تفاصيل المحادثة | Conversation details | teacher | Owned-course conversation, public reply/internal note, assignment/status/report and audit trail. |
| `/teacher/calendar` | T | جدول التدريس | Teaching calendar | teacher | Calendar/list, create/move/cancel session for owned courses; navigate course live tab. |
| `/teacher/team` | T | فريق التدريس | Teaching team | teacher | `tab=members,invitations,access`; invite modal, per-course capability matrix, expiry, revoke confirmation; no assistant payout setup. |
| `/teacher/earnings` | T | الأرباح والمستحقات | Earnings and payables | teacher | `tab=sales,payables,payouts,destination`; sale commission snapshots, pending/available/reserved balances, payout history/detail drawer, masked verified destination/change request; no cash wallet or batch approval. |
| `/teacher/notifications` | T | الإشعارات | Notifications | teacher | Review feedback/new Q&A/payout events and read controls. |
| `/teacher/settings` | T | الملف العام والإعدادات | Public profile and settings | teacher | `tab=profile,qualifications,account,notifications`; editable bio/public preview, qualified grade-subject chips, request qualification change, prefs. |

### Assistant

| Path | Roles | Arabic title | English title | View module | Key content and interactions |
|---|---|---|---|---|---|
| `/assistant` | A | العمل المسند | Assigned work overview | assistant | Assigned counts, due tasks, own queue, scoped course shortcuts. |
| `/assistant/courses` | A | الدورات المسندة | Assigned courses | assistant | Two assigned courses and permission chips; revocation immediately removes them. |
| `/assistant/course/:id` | A | مساحة الدورة المسندة | Assigned course workspace | assistant | `tab=overview,content,tasks`; authorized content only; editing/grading controls strictly match assignment capabilities; no financial/enrollment exports. |
| `/assistant/inbox` | A | صندوق الوارد | Inbox | assistant | `tab=open,assigned,escalated,resolved`, waiting filter within assigned; only assigned conversation IDs within assigned courses. |
| `/assistant/inbox/:id` | A | المحادثة والملاحظات | Conversation and notes | assistant | Assigned thread, reply/internal note, resolve/escalate to owner; denial after membership revoked. |
| `/assistant/qa` | A | أسئلة الدروس | Lesson Q&A | assistant | Lesson questions limited to assignment scope; answer/report/escalate, link to scoped conversation. |
| `/assistant/tasks` | A | مهام التصحيح والمحتوى | Grading and content tasks | assistant | `tab=grading,content`; grade/release permitted submissions, edit permitted content draft, complete task; denied capability explains need for teacher assignment. |
| `/assistant/notifications` | A | الإشعارات | Notifications | assistant | Task/assignment/reply events, read controls. |
| `/assistant/settings` | A | الإعدادات الشخصية | Personal settings | assistant | Personal name/preferences, assigned capabilities read-only, no role escalation. |

### Administration

| Path | Roles | Arabic title | English title | View module | Key content and interactions |
|---|---|---|---|---|---|
| `/admin` | M,O | لوحة العمليات | Operational dashboard | admin | Role-scoped review/safety queues; O also finance/academic totals. M never sees financial totals/charts. |
| `/admin/people/students` | M,O | الطلاب | Students | admin | Search/filter; record drawer, support reason, scoped enrollment/profile inspection, account status action. |
| `/admin/people/guardian-links` | M,O | روابط أولياء الأمور | Guardian links | admin | Requested/pending/verified queue, synthetic evidence review, verify/reject/revoke/scopes with reason. |
| `/admin/people/teachers` | M,O | المعلمون وطلبات الانضمام | Teachers and applications | admin | `tab=teachers,applications,invitations`; review qualification/credential evidence, approve/request-info/reject, create/invite, account suspension separate. |
| `/admin/people/employees` | O | الموظفون الإداريون | Admin employees | admin | Invite/list/status/expiry; scope editor links roles; never accessible to M/F. |
| `/admin/people/teams` | M,O | الإشراف على فرق التدريس | Teacher team oversight | admin | Restricted course membership/permission review, revoke with reason; no financial data. |
| `/admin/academics/curricula` | O | المناهج والإصدارات والمسارات | Curricula, versions and tracks | admin | `tab=curricula,versions,tracks`; create/edit/activate metadata; version history retained. |
| `/admin/academics/grades` | O | الصفوف والمراحل | Grades and stage labels | admin | Grades1–12, official cycle groupings, edit localized labels, prevent destructive deletion when referenced. |
| `/admin/academics/subjects` | O | المواد وربطها بالصفوف | Subjects and grade mappings | admin | `tab=subjects,mappings`; edit subject, toggle valid mapping; existing course classification retained. |
| `/admin/academics/periods` | O | الأعوام والفصول الدراسية | Academic years and semesters | admin | `tab=years,semesters`; add/edit dates/labels and history. |
| `/admin/academics/translations` | O | تسميات المواد والترجمة | Subject labels and translations | admin | AR/EN side-by-side display_name editor for mappings, missing label validation. |
| `/admin/courses/review` | M,O | مراجعة الدورات | Course approval queue | admin | Submitted/revision detail drawer, checklist, approve/request changes, feedback audit; owned teacher notified. |
| `/admin/courses/catalog` | M,O | إدارة الدورات | Course operations | admin | `tab=published,draft,archived,unpublished`; inspect status/content, archive/takedown/approved republish with reason; Submitted links review queue. |
| `/admin/courses/reports` | M,O | بلاغات المحتوى والإزالة | Content reports and takedowns | admin | Reports, reasoned restrict/unpublish/resolve actions, appeal/history context. |
| `/admin/courses/access` | M,O | التسجيلات وصلاحيات الوصول | Enrollments and entitlements | admin | `tab=enrollments,grants`; explicit admin_grant or revoke by student/course/reason, access origins and validity; no payment editing. |
| `/admin/courses/live` | M,O | الإشراف على الحصص المباشرة | Live session oversight | admin | Session lifecycle, cancelled/failed filters, recording publication status and operational incident notes. |
| `/admin/finance` | F,O | لوحة المالية | Finance dashboard | admin | Gross/commission/payables/refunds, reconciliation exceptions, payout action; no unrelated people/support widgets. |
| `/admin/finance/orders` | F,O | الطلبات ومعاملات الدفع | Orders and transactions | admin | `tab=orders,transactions`; order item buyer/beneficiary, references, mismatches, read-only payment trace and simulator retry links only if authorized buyer persona. |
| `/admin/finance/refunds` | F,O | الاستردادات والنزاعات | Refunds and disputes | admin | `tab=refunds,disputes,chargebacks`; item-level review/approve/reject/simulate result; holds/adjustments; no whole-order accidental sibling revoke. |
| `/admin/finance/commissions` | F,O | العمولات والاستثناءات | Commission rules and overrides | admin | Default/teacher/campaign precedence, versioned edit with reason; historic snapshots unchanged. |
| `/admin/finance/earnings` | F,O | مستحقات المعلمين والقيود | Teacher earnings and ledgers | admin | `tab=earnings,ledger`; per-teacher/state aggregation, journal/source trace, explicit demo hold release and reasoned adjustment. |
| `/admin/finance/payouts` | F,O | حسابات ودفعات الصرف | Payout accounts and batches | admin | `tab=accounts,batches,approvals`; masked destination verification, available allocation selection, prepare Draft/submit, approval queue with same-preparer explanation. |
| `/admin/finance/payouts/:id` | F,O | تفاصيل دفعة الصرف | Payout batch details | admin | Timeline Draft→UnderReview→Approved→Processing→Paid/Failed; preparer/approver, items/totals/snapshot, approve/reject/release/confirm/fail/retry with guards and audit. |
| `/admin/finance/reconciliation` | F,O | المطابقة والتقارير المالية | Reconciliation and financial reports | admin | `tab=reconciliation,reports`; provider vs internal totals, discrepancy drilldown, mark matched with evidence, CSV Blob download of scoped synthetic rows. |
| `/admin/finance/tax` | F,O | إعدادات الضرائب والفواتير | Tax and invoice configuration | admin | `tab=tax,invoices`; visibly unconfirmed policy, illustrative form fields + preview/save demo config, no legal/tax assertion. |
| `/admin/support/tickets` | M,O | الدعم والبلاغات | Tickets, flags and moderation | admin | `tab=tickets,flags,moderation`; scoped ticket response/resolution, content review, reasoned restricted read. |
| `/admin/support/communications` | M,O | بلاغات التواصل والتصعيد | Communication reports and escalations | admin | Reported thread context only, internal review/action, resolve/escalate and audit; no open messaging directory. |
| `/admin/cms/home` | O | الرئيسية واللافتات | Homepage and banners | admin | Localized homepage sections, featured Published course selection and banner copy editor/preview; save reflected public home. |
| `/admin/cms/pages` | O | الصفحات والأسئلة الشائعة | Static pages and FAQs | admin | `tab=pages,faqs`; edit B copy, public preview links; policy text marked draft. |
| `/admin/cms/promotions` | O | القسائم والعروض | Coupons and promotions | admin | Optional disabled-state configuration preview, funding policy missing explanation; no redemption or assumed discount allocation. |
| `/admin/notifications` | O | قوالب الإشعارات وتسليمها | Notification templates and delivery | admin | `tab=templates,delivery`; localized template preview/edit, delivery attempt filter, simulated retry preserving event deduplication. |
| `/admin/reports` | O | التحليلات والتقارير | Analytics and reports | admin | Enrollment/learning/catalog/conversion/support metrics and scoped charts; filter date/grade/course, textual alternatives, synthetic CSV export; F financial reports via reconciliation. |
| `/admin/settings/roles` | O | الأدوار والصلاحيات والنطاق | Roles, permissions and scope | admin | Role matrix and staff resource scopes/expiry; save audited demo changes; protect current owner's core control and independent payout check. |
| `/admin/settings/security` | O | الأمان وسجل التدقيق | Security and audit log | admin | `tab=security,audit`; mock MFA/session states, filters and append-only audit details; no claim of real MFA. |
| `/admin/settings/integrations` | O | التكاملات | Integrations | admin | Payment/live/notification adapters labeled simulated/unconfigured, test connection produces synthetic result; no keys collected. |
| `/admin/settings/policies` | O | سياسات المنصة | Platform policies | admin | Access/refund/payout/guardian/retention policy register: confirmed/proposed/open labels, demo configuration only; production decisions remain unresolved. |

Fallback views live in core/layout.js and are not registered paths: unknown route 404 (Home/Back), role-denied (allowed persona buttons), resource-denied (safe role home), missing record, and view-error (Retry/Reset). Route matching never defaults unknown private path to public home.

## 6. Role navigation and switcher quick jumps

Icons are these **40** hand-written names only: `home,search,book,graduationCap,users,user,userPlus,calendar,clock,play,lock,check,checkCircle,x,chevronStart,chevronEnd,menu,bell,settings,helpCircle,mail,messageCircle,fileText,clipboard,chart,creditCard,receipt,banknote,shield,flag,globe,sun,moon,refresh,filter,download,upload,edit,plus,logOut`. Use these identifiers consistently; no external sprite/font/icon runtime.

Entries below are `label [icon] → path`. Translate all labels; sidebar active state includes descendant routes. Navigation groups collapse accessibly on mobile. Every page not directly linked is reachable from its group list/tabs/actions.

| Role | Sidebar / top navigation items | Switcher quick jumps |
|---|---|---|
| visitor | Home [home] → /; Explore [search] → /explore; Teachers [graduationCap] → /teachers; Become teacher [userPlus] → /become-teacher; Help [helpCircle] → /help; Sign in [user] → /auth/sign-in. Footer About/legal. | /; /explore/grade/4; /course/C-001; /auth/sign-in |
| student | Dashboard [home] → /student; My courses [book] → /student/courses; Browse [search] → /student/explore; Calendar [calendar] → /student/calendar; Assignments [clipboard] → /student/assignments; Messages [messageCircle] → /student/messages; Notifications [bell] → /student/notifications; Profile [user] → /student/profile; Settings [settings] → /student/settings | /student; /student/course/C-002; /student/calendar; /student/assignments |
| guardian | Dashboard [home] → /guardian; Children [users] → /guardian/children; Explore [search] → /guardian/explore; Orders [receipt] → /guardian/orders; Notifications [bell] → /guardian/notifications; Support [helpCircle] → /guardian/support; Settings [settings] → /guardian/settings | /guardian; /guardian/child/S-001; /guardian/children/link; /guardian/orders |
| teacher | Dashboard [home] → /teacher; Courses [book] → /teacher/courses; Students [users] → /teacher/students; Inbox [messageCircle] → /teacher/inbox; Calendar [calendar] → /teacher/calendar; Team [users] → /teacher/team; Earnings [banknote] → /teacher/earnings; Notifications [bell] → /teacher/notifications; Profile/settings [settings] → /teacher/settings | /teacher; /teacher/courses/new; /teacher/course/C-001; /teacher/earnings |
| assistant | Overview [home] → /assistant; Courses [book] → /assistant/courses; Inbox [mail] → /assistant/inbox; Lesson Q&A [messageCircle] → /assistant/qa; Tasks [clipboard] → /assistant/tasks; Notifications [bell] → /assistant/notifications; Settings [settings] → /assistant/settings | /assistant; /assistant/inbox; /assistant/qa; /assistant/tasks |
| admin_finance | Finance home [chart] → /admin/finance; Orders [receipt] → /admin/finance/orders; Refunds [refresh] → /admin/finance/refunds; Commissions [creditCard] → /admin/finance/commissions; Earnings/ledger [banknote] → /admin/finance/earnings; Payouts [banknote] → /admin/finance/payouts; Reconciliation [checkCircle] → /admin/finance/reconciliation; Tax/invoices [fileText] → /admin/finance/tax | /admin/finance; /admin/finance/orders; /admin/finance/payouts; /admin/finance/reconciliation |
| admin_moderation | Overview [home] → /admin; People [users] children: Students → /admin/people/students, Guardian links → /admin/people/guardian-links, Teachers → /admin/people/teachers, Teams → /admin/people/teams; Courses [book] children: Review → /admin/courses/review, Catalog → /admin/courses/catalog, Reports → /admin/courses/reports, Access → /admin/courses/access, Live → /admin/courses/live; Support/safety [shield] children: Tickets → /admin/support/tickets, Communications → /admin/support/communications | /admin; /admin/people/teachers?tab=applications; /admin/courses/review; /admin/people/guardian-links |
| super_admin | Overview [home] → /admin; all M groups plus Employees [users] → /admin/people/employees; Academics [graduationCap] children: Curricula → /admin/academics/curricula, Grades → /admin/academics/grades, Subjects → /admin/academics/subjects, Periods → /admin/academics/periods, Translations → /admin/academics/translations; all F finance links; CMS [edit] children: Home → /admin/cms/home, Pages → /admin/cms/pages, Promotions → /admin/cms/promotions; Notifications [bell] → /admin/notifications; Reports [chart] → /admin/reports; Administration [settings] children: Roles → /admin/settings/roles, Security → /admin/settings/security, Integrations → /admin/settings/integrations, Policies → /admin/settings/policies | /admin; /admin/finance/payouts?tab=approvals; /admin/settings/roles; /admin/settings/security?tab=audit |

Admin top-bar bell opens **own** notification drawer; only O links full notification templates/delivery module. F/M user menu uses own-preferences dialog, not O settings routes. All admin submenu items inherit listed group icon unless their explicit icon is given. Public nav available through brand/footer Explore links from portals; role stays unchanged when visiting public pages.

## 7. Final acceptance scenarios (reset before each unless specified)

These are browser click tests, not production integration tests. Maintain exact fixture dependencies; scenario-generated IDs displayed and linkable. Run all in AR/light, then repeat main path in EN/dark; P9 covers all role shells at 375px.

1. **Guardian purchase → learner access → progress/live.** Visitor Home → grade4 → Math → C-001 → Preview → play sample → locked L-002 explains purchase (no enrollment) → Buy → sign in as guardian → beneficiary Maryam (Salim separate) → review buyer Aisha/learner Maryam/30.000 OMR → simulator Success → receipt. Switch student → My courses → C-001 unlocked → complete L-002 → course progress increases → live tab → demo Join LS-001 → attendance. Switch guardian → Maryam activity shows update, Salim courses do not include C-001. Guardian attempting player is denied; no private message disclosure.
2. **Pending, failure, replay and redirect integrity.** Guardian C-001 checkout → Pending → result shows pending/no unlock; switch student confirms locked. Back guardian → own order simulator → Failure → retry new transaction → Success; replay same success event twice. Receipt, enrollment, grant, commission allocation and sale journal exist exactly once per item. Open result hash before confirmation: cannot unlock. Repeat using Confirm without redirect: student gets access despite no result navigation; invalid amount/currency simulated event rejected with no mutation.
3. **Free study, assessment and notification.** Student → Explore → free C-005 (clear current-grade filter) → Enroll → review self/zero total → activation with complimentary origin (no provider/earning) → learning room resources → worksheet preview/download → quiz answer/submit/result → assignment text submission. Teacher → course learners → grade/release → student results/notification shows released score. Reading/player page visit alone does not increase progress. Use C-001 preseed assignment when testing fixed assistant grading scope after enrolling Maryam; assistant cannot grade C-002.
4. **Guardian verification and revocation.** Guardian Children → pending S-003 status → attempt direct child URL denied → Link with ASCII token `OMAN-S003` → pending existing request reused → switch M → Guardian links → inspect synthetic evidence → Verify → guardian sees S-003 with permitted summaries. Revoke link in guardian settings → child immediately disappears from dashboard and beneficiary list; direct hash denied. Maryam/Salim remain visible. No name-search linking.
5. **Course creation and moderation.** Teacher → New course → choose grade4 Math from qualified pairs → bilingual identity/content, preview lesson, access terms/price → Save draft → submit. Visitor catalog cannot see Submitted. Switch M → review → request changes with feedback → teacher edits/resubmits → M approves → visitor grade4 Math results includes course. Teacher edits published description → pending revision; public still shows old snapshot until approval. Invalid T-002 grade6 classification must fail qualification validation in admin inspection/demo test action as well as wizard.
6. **Teacher application lifecycle.** Visitor → Become teacher → registration/application → identity + multi-grade/subject qualifications + synthetic credential filename → submit T-004 → pending state. M → applications → more information required → applicant edits/resubmits → M approves. Teacher directory shows T-004's approved profile, zero courses empty state; approval does not fabricate published courses. M invites another synthetic teacher → invitation appears; account invited is distinct from application approved.
7. **Assistant scope, reply, escalation and revocation.** Student C-002 → Q&A → add question → teacher inbox assigns to Noora → assistant inbox → reply → internal note → escalate → teacher resolves → student sees reply/status but not note. Assistant direct C-004 course URL and unassigned conversation in C-001 both denied. Teacher Team → revoke TM-001 → assistant inbox/tasks/course URLs lose access immediately after role switch or store rerender; finance URL denied with allowed-role switch.
8. **Live scheduling and recording publication.** Teacher C-002 live tab → schedule at demo future time → student notification appears once; unrelated S-002 gets none unless entitled. Reschedule then cancel → corrected status/notice, old join disabled. Use second ended session → upload demo recording → ready, no alert → publish → student live/recordings and notification update once. Repeated publish does not duplicate alert. Failed provider session shows retry/help, never fabricated attendance.
9. **Independent payout approval and failed retry.** F → Earnings → release demo pending hold if needed → Payouts → select EA-AVAILABLE → prepare Draft → submit UnderReview. Approve own disabled with explicit reason; direct action rejected. Switch O → approvals → same batch → approve → Processing → simulate Failed (teacher not Paid) → revalidate UnderReview → independent approval → Processing → confirm and reconcile → Paid. Teacher earnings/payout history now shows amount/reference and notice; repeated confirm creates no second payout. O preparing a different batch also cannot self-approve; F can approve that batch under independent permission.
10. **Refund and historical commission integrity.** F → historical two-item paid order → one child's item → request/approve/full-item refund → simulate success. Corresponding grant revoked and earning adjusted; sibling item's grant/order amount unaffected, order partially_refunded. Teacher sees adjustment with original sale snapshot. Change commission default → existing sale remains 20%; later demo purchase uses new snapshot. Refund-after-paid fixture produces recovery adjustment while prior payout remains Paid. Reconciliation shows balanced journal trace.
11. **Staff boundaries, admin editors and fallbacks.** F direct /admin/people/students and M direct /admin/finance/orders → denial, no record/metric leak; one-click allowed-role switch returns intended route. O edits subject translation → English public filter reflects it; edits home banner → home updates; resolves safety ticket with reason → audit row; notification delivery retry preserves event ID. Unknown hash → 404; unknown record → safe not-found. Optional reviews/promotions show explanatory configured-off state.
12. **Responsive, keyboard, persistence and reset.** At 375px navigate all eight role homes, open sidebar/switcher, complete beneficiary selection and batch detail actions without page overflow. Keyboard open switcher → Tab wraps → Escape returns focus; outside click closes; role switch home correct. AR/EN flips logical layout and labels; light/dark updates charts. Reload preserves role/lang/theme but reseeds domain records; localStorage unavailable still works. Reset confirms, clears session mutations, returns role home, retains preferences. Back/Forward preserves filters/tabs; rapid navigation leaves no chart/player errors. Input `<img src=x onerror=alert(1)>` in message/course title displays literal text everywhere.

## 8. Phase plan and browser gates

Ownership is sequential. A later phase may extend core dictionaries/selectors/actions **only for its delivered feature**, preserving earlier APIs and scenarios. No parallel phase authors implied. Each phase ends with working browser routes, no dead main actions or console exceptions. In P1 register metadata for every route but use one shared “Coming in phase Pn” view resolver for not-yet-built modules; do not import nonexistent files. Replace resolver when module lands; by P8 no planned placeholder remains except explicitly disabled optional features. Missing modules must never prevent home loading.

| Phase | Files owned / permitted integration edits | Routes delivered | Browser acceptance checklist |
|---|---|---|---|
| **P1 Foundation** | index.html; all ten core/*.js; views/public.js **home only** | `/`; fallback 404/permission/resource-error views; complete route metadata and role nav | Serve under /prototype/ and domain root; CDN/font links exact; no npm/build; default AR/RTL; role/lang/theme persist under allowed and blocked storage; reset deterministic; all eight personas/scope selectors seeded; home grade/subject/teacher cards render; switcher focus/close/home navigation; all component APIs available; Chart.js sample mounts/disposes on home without leaks; unknown/denied route works. Future links show truthful phase placeholder. |
| **P2 Public + auth** | views/public.js, views/auth.js; extend i18n/store/router | All 16 public/auth patterns in §5 before checkout | Grade→subject results work; taxonomy filters/pagination reflect state and URL; locked vs preview correctly labeled; no draft listing; application validation/status; safe auth return-to; policy pages all three values; directory/profile filtering; help ticket confirmation; public and auth paths usable AR/EN/mobile. |
| **P3 Checkout** | views/checkout.js; store payment reducers, i18n, router | Five `/checkout/...` patterns | Buyer≠beneficiary visibly; verified link selection only; free bypass; correct 3-decimal totals; success/pending/failure/retry; replay idempotent; success URL alone powerless; receipt print; scoped wrong-buyer denial; scenario 2 data checks via receipt/ledger selectors. |
| **P4 Student** | views/student.js; core integration as needed | All 11 `/student...` patterns | Learning room seven tabs plus player/resources/assessments; scoped grants; C-002 usable at seed, C-001 locked until purchase; completion/resume/quiz/assignment state; calendar join and errors; messages/report; read notifications; profile grade change preserves history; charts dispose; student side of scenarios 1–3. |
| **P5 Guardian** | views/guardian.js; scoped selectors/reducers/i18n/router | All nine `/guardian...` patterns | Two verified children; pending/revoked requests no progress; four child tabs; explicit buy beneficiary; own receipts; support; link remains pending until admin; scope-aware settings/revoke immediate; direct other-child ID denied; no guardian player/private inbox. |
| **P6 Teacher** | views/teacher.js; authoring/team/learning/finance selectors and mutations, i18n/router | All 13 `/teacher...` portal patterns (public /teacher/:id already P2) | Seven-step wizard and seven workspace tabs; valid qualification filters; drafts/revisions/submission; create/reorder lesson preview flag; resources/assessments grade/release; session/recording lifecycle; scoped roster/inbox; team invite/access/revoke; four earnings tabs with derived sums/masked destination; teacher public settings. |
| **P7 Assistant** | views/assistant.js; scoped actions/i18n/router | All nine `/assistant...` patterns | Exactly assigned courses and conversations; internal notes hidden from learner; escalate/resolve; grade C-001 allowed and content edit C-002 allowed, converse capabilities denied; no finance; revoked membership immediately denies; scenario 7. |
| **P8 Administration** | views/admin.js; remaining core operations/i18n/router | All 36 `/admin...` patterns | F/M/O navigation and direct-route guards; every tab/detail/editor in table interactive; approve application/course/link, review flags/tickets; catalog/version/mapping labels; grants; complete finance state machine and independent approver; refunds/ledger/reconciliation; CMS/template updates; roles/scopes/security/audit/settings. Scenarios 4–11 end-to-end; no placeholder route. |
| **P9 Visual polish + accessibility** | index.html base styles and all existing UI/view/core files as needed; no new runtime files | Every registered route/tab plus fallback/outcome states | Check 375/768/1440px in AR/EN and light/dark; no page overflow or clipped buttons; keyboard route/forms/overlays; one h1, labeled fields, valid focus order, visible focus, readable contrast, text status alternatives, aria-live toasts; chart data summaries and CDN failure fallback; reduced-motion respected; print receipt clean; long content/empty/error states; all SVG media deterministic/no external images; no UI dictionary key leaks. |
| **P10 Full scenario run** | Correct existing files only; no new feature scope | Entire route inventory | Run scenarios 1–12 from reset with screenshots/observations shared in implementation handoff (do not add extra runtime files); every leaf in §9 checked; all registered hashes load/refresh/back/forward; query invalid/record missing/scoped denial; no console exceptions/404 module requests; journal totals, deduplication, scopes and reset verified; runtime file inventory matches fixed layout. |

## 9. Sitemap coverage audit and route counts

The §5 table accounts for every leaf in `03_Information_Architecture.md` §3. Intentional grouping follows that document's preference for a single learning room. No required functional leaf is deferred.

| Sitemap group / leaves intentionally merged | Route or named query tab/section | Reason |
|---|---|---|
| Home grade/curriculum selector, featured subjects/courses/teachers, How it works/CTA | `/` sections | One coherent home page; curriculum control conditionally visible with one active curriculum. |
| Browse Grade, Grade Landing, Subjects Available, Subject Results | `/explore?tab=grades`, `/explore/grade/:gradeId`, `/explore/grade/:gradeId/subject/:subjectId` | Nested academic discovery; grade page includes available-subject cards. |
| Browse Subject, Browse Teacher, Search/Filters | `/explore?tab=subjects`, `/teachers`, `/explore?tab=courses&q=...` | Reuse catalog and directory rather than duplicate result screens. |
| Course Overview/Teacher, Outcomes, Syllabus, Preview, Live/Recorded Format, Pricing/Access, Reviews, Buy/Enroll | `/course/:id` seven tabs and CTA | One purchasing context. Reviews surface retained but disabled until policy; no review submission implementation. |
| Teacher profile → Teacher courses | `/teacher/:id?tab=courses` | Shared public profile context. |
| Help Center/Contact and Privacy/Terms/Refund Policy | `/help?tab=faq,contact`; `/legal/privacy`, `/legal/terms`, `/legal/refunds` | Shared templates, independently deep-linkable content. |
| Teacher Registration/Application in both public and auth branches | `/become-teacher` → `/auth/teacher-application` | Public introduction plus one canonical application wizard. |
| Checkout Sign in/Create account, outcome variants, Receipt/Enrollment Access | auth routes with return-to; result route store variants; receipt plus role-aware access CTA | No duplicate authentication or fake successful-payment route. |
| Learning room Overview/Progress; Modules/Lessons; Video/Reading; Attachments/Worksheets; Quizzes/Assignments; Live/Recordings; Q&A; Announcements | `/student/course/:id?tab=overview,lessons,resources,assessments,live,qa,announcements`; player within lessons via lesson ID | Eight sitemap leaves in seven tabs, player and outline intentionally together. |
| Student Assignments/Quiz Results; Messages/Questions; Account/Privacy | student assignments/messages/settings named tabs | Related work within same user context. |
| Guardian child Courses/Progress; Assignments/Results; Upcoming Live; Attendance/Activity | `/guardian/child/:id?tab=courses,results,live,activity` | One verified child scope; no switch by leaking another child's summary. |
| Guardian Settings/Link Permissions | `/guardian/settings?tab=account,links,notifications` | Permissions editable/requestable alongside account prefs. |
| Teacher Create/Edit and workspace Details/Publishing, Modules/Lessons/Previews, Resources/Assessments, Live/Recordings, Enrollments/Progress, Questions/Announcements, Analytics | create/edit wizard; workspace seven tabs | Keeps authoring and ongoing delivery manageable without duplicated content. |
| Team Invite/Assign Access/Manage Permissions | `/teacher/team?tab=members,invitations,access` and invite dialog | Course assignment matrix houses permissions. |
| Earnings Sales/Commissions, Pending/Available, Payout History, Destination | `/teacher/earnings?tab=sales,payables,payouts,destination` | Single scoped financial context. |
| Assistant Inbox Open/Assigned/Escalated/Resolved, Conversation/Internal Notes | inbox named tabs and `/assistant/inbox/:id` | Queue filters plus detail thread; notes private. |
| Assistant Grading/Content Tasks (if permitted) | `/assistant/tasks?tab=grading,content` | Both present; action-level capability guards. |
| Admin People Teachers/Applications/Invitations | `/admin/people/teachers` three tabs | Teacher lifecycle queue; employee/team leaves have their own routes. |
| Admin Academic Curricula/Versions/Tracks, Subjects/Mappings, Years/Semesters | respective academics routes/tabs; grades and translations distinct | Every academic leaf kept; paired records edited together. |
| Admin Course Published/Draft/Archived; Enrollments/Entitlements | catalog/access tabs; review/reports/live separate | Status filter and access origin are same operational entities. |
| Admin Finance Orders/Transactions; Refunds/Disputes/Chargebacks; Earnings/Ledger; Accounts/Batches/Approvals; Reconciliation/Reports; Tax/Invoice | finance routes/tabs, payout detail route | Every finance subsection represented; role-restricted and traceable. Commission overrides on commissions route. |
| Admin Support Tickets/Flags/Moderation; Communication Reports/Escalations | two support routes with tabs/detail drawers | Restricted review queues, not general private-message access. |
| CMS Home/Banners; Pages/FAQs; Optional Coupons/Promotions | home editor, pages tabs, promotions route | Optional promotions surface retained as disabled configuration preview; redemption deferred pending funding policy. |
| Notification Templates/Delivery; Administration Security/Audit | notifications and security tabs | Shared lifecycle context; Roles/Scope, Integrations, Policies distinct routes. |

Route counts use registered **path patterns**, not individual parameter records, tabs, modals, or three legal expansions. ALL expands to 16 shared public/auth patterns. Counts below describe seed permissions; O has all 36 admin patterns and uses explicit persona switches for learner/teacher workspaces.

| Role | Own portal patterns | Checkout patterns | Shared public/auth patterns | Total allowed patterns |
|---|---:|---:|---:|---:|
| visitor | 0 | 0 | 16 | 16 |
| student | 11 | 5 | 16 | 32 |
| guardian | 9 | 5 | 16 | 30 |
| teacher | 13 | 0 | 16 | 29 |
| assistant | 9 | 0 | 16 | 25 |
| admin_finance | 9 | 0 | 16 | 25 |
| admin_moderation | 12 | 0 | 16 | 28 |
| super_admin | 36 | 0 | 16 | 52 |

Unique registered patterns: **99** (16 public/auth + 5 checkout + 11 student + 9 guardian + 13 teacher + 9 assistant + 36 admin). Fallbacks are not extra routes.

## 10. Explicit prototype assumptions and unresolved production decisions

These choices make the demo executable and do not approve business policy:

- Query-state tabs, fixed demo date, deterministic persona IDs/seed counts, single-item new checkout, simulated media player/live room, in-browser worksheet generation, illustrative academic mappings, and compact shared detail drawers are design choices of this spec.
- Player has play/pause, timeline, captions/transcript, finish demo action; animated timeline and illustrated slides stand in for actual video. Meetings are labeled simulated with join/leave and attendance. No extra media files/provider dependency are required.
- New grants use an illustrative academic-year end of 2027-07-31T19:59:59Z, shown explicitly as demo access terms; no subscription UI. Already enrolled learners keep archived-course access while grant valid. Refund simulator revokes only the refunded purchase grant; an independent valid grant still allows access.
- Default 20% commission (30.000 → 6.000 platform + 24.000 teacher), optional override fixtures, zero demo taxes/fees, manual hold release and payout confirmation are illustrative values. Commission policy, VAT/tax treatment, principal vs agent, legal seller, invoice issuer, gateway/settlement rails, refunds, payout cadence/minimum/holds and production access duration remain **OPEN**.
- Guardian demo scopes allow progress/results/attendance/purchase summaries, no paid content or private messages. Token/evidence verification is a mock workflow; legal consent, minor-account policies, retention, guardian detail visibility and communication rules remain **OPEN** for production.
- Reviews are a disabled tab, coupons a disabled configuration screen; no optional review/redemption engine. Curriculum selector is built but hidden until >1 active curriculum. No required sitemap leaf omitted. Production subscriptions/native apps/shared ownership/AI tutoring/school tenancy/assistant payouts remain outside scope.
- F can approve another actor's prepared batch, never their own; O subject to same rule. M has no employee management/finance; academic/catalog configuration and CMS reserved to O. Admin private-data reads require explicit reason and audit. These refine staff scope for the prototype.
- New student/guardian registration demonstrates validation/confirmation using fixed personas; teacher application mutates pending applicant fixture. No real login, delivery, uploads, security, banking or legal compliance is implied.

No additional decision is needed to implement this design concept. Do not silently turn its illustrative settings into production policy.
