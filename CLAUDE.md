# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository state

Documentation-only. No source code, build, lint or test tooling exists yet, and the tech stack is **not selected** (blueprint §2.1 lists directions only; no vendor or framework is mandatory). Do not assume a stack or invent commands. Update this file once code and tooling land.

The repo holds the planning package for a teacher-led Oman K–12 (Grades 1–12) e-learning marketplace + LMS. Read in order:

1. `01_Executive_Information.md` — fact sheet, decision register (DEC-xx confirmed, REC-xx recommended), open decisions, MVP scope, out-of-scope list.
2. `02_Executive_Summary.md` — business rationale and commercial model.
3. `03_Information_Architecture.md` — sitemaps per audience, academic taxonomy, journeys, course room, access visibility matrix, illustrative URL patterns.
4. `04_Platform_Blueprint.md` — bounded contexts, conceptual ERD, permissions, payment/commission/payout state machines, NFRs, QA scenarios, open questions, risks.

Diagrams are fenced `mermaid` blocks.

## Status labels (keep consistent when editing docs)

- **[CONFIRMED]** — stakeholder-specified. Do not change without explicit stakeholder instruction.
- **[PROPOSED] / Recommended** — suggested implementation.
- **[OPEN]** — needs product, commercial, legal or regulatory decision. Do not resolve these by assumption (e.g. commission rate, VAT, refund window, payout frequency, gateway, live-video provider, principal-vs-agent model).

The two inspiration YouTube videos were never verifiably analyzed; don't claim content from them.

## Architecture (proposed)

Modular monolith, one deployable backend with domain modules over a relational DB (PostgreSQL or equivalent), background job queue + outbox, private media storage, and provider adapters for payments, live video, and email/push. Domain modules:

Identity/Guardians/RBAC · Academic Catalog · Teacher Onboarding & Teams · Courses & Content · Enrollments/Learning/Assessments · Live Sessions/Q&A/Notifications · Checkout/Ledger/Payouts · Moderation/Admin/Analytics.

Frontend: Arabic-first RTL responsive web, English-ready; server-renderable public pages. Surfaces: Public, Student, Guardian, Teacher, Assistant, Admin.

## Domain invariants that cut across modules

- **Single course owner:** `courses.owner_teacher_id` mandatory and singular. Assistants act via `course_team_assignments` (per-course scope), never as co-owners. Team membership does not imply access to all of a teacher's courses.
- **Academic taxonomy:** curriculum → curriculum_version → grade_subject (grade × subject) classifies courses. Oman MOE first, but schema must be multi-curriculum. Teachers teach any many-to-many subset of grades/subjects.
- **Six separate financial concepts:** catalog course, order, payment, access grant (entitlement), earning allocation/ledger, payout. Never collapse into flags like `course.is_paid` or `user.balance`.
- **Buyer ≠ learner:** order buyer (e.g. guardian) is separate from beneficiary student per order item. Access and progress belong to the student; guardian visibility comes only from a verified `guardian_student_links` record with scopes.
- **Access via entitlements:** lesson access checks active `access_grants` by origin (`one_time_purchase`, `complimentary`, `admin_grant`, future `subscription`), not `order_item_id`. Free preview lessons are a lesson-level flag, separate from enrollment.
- **Payments:** never trust browser redirect; verify provider signature, amount, currency, order, beneficiary. Handlers idempotent (at-least-once events). Pending/failed never grant access. Commission terms snapshotted immutably per order item (default rate → teacher override → campaign/contract).
- **Ledger:** teacher balances derived from immutable ledger entries. Earning states: `pending → available → reserved/in_payout → paid`, plus `adjusted`. Refunds after payout create adjustments, never rewrite history.
- **Payout batches:** Draft → UnderReview → Approved → Processing → Paid/Failed, with separation of duties (preparer cannot approve own batch).
- **Authorization:** role + permission + resource scope (e.g. `assistant:reply_conversation` on course C-123), evaluated with membership/account state. Users can hold multiple personas. Staff RBAC least-privilege, MFA, audited.
- **Minors safeguarding:** no open-ended direct adult-to-minor messaging; communication is course-scoped, moderated, auditable.
- Ownership transfer, suspension and refunds handled by policy, not data deletion.

## Out of initial scope

Subscriptions, native apps, shared course ownership, school/district tenancy, open social messaging, extra curricula catalogs, AI grading/tutoring, adaptive learning, assistant payouts.
