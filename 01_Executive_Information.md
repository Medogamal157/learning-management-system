# Executive Information — Oman School E-Learning Platform

**Working title:** Oman School E-Learning Platform (name to be confirmed)  
**Document type:** Project charter and decision register  
**Version:** 1.0  
**Prepared:** 19 October 2026  
**Status:** Discovery complete for core model; implementation, legal, and commercial details require validation  
**Geographic focus:** Sultanate of Oman  
**Primary audience:** Business owner, product manager, engineering lead, design lead, academic operations, and finance

## 1. Project at a glance

| Field | Executive information |
|---|---|
| Product category | Multi-teacher K–12 educational marketplace integrated with an LMS |
| Target learners | Grades 1–12, beginning with the Oman Ministry of Education curriculum |
| Core value proposition | Discover an appropriate teacher/course by grade and subject; preview instruction; purchase; study recorded and live lessons; track progress |
| Commercial model | Platform-collected payments for individual courses; platform retains commission and periodically pays the teacher |
| Course pricing | Free and paid courses supported in the model; paid courses can expose free preview lessons without granting full free enrollment |
| Course ownership | One accountable teacher per course at launch; allow delegated assistance, not shared ownership |
| Instruction modes | Recorded, live, and hybrid |
| Primary account types | Student, parent/guardian, teacher, teacher-team member, administrator, administrative employee |
| Registration | Teacher application/self-registration plus administrator creation or invitation; student and guardian registration |
| Academic flexibility | A teacher may cover any allowed subset of grades and any combination of subjects |
| Guardian experience | A separate guardian account, linked to one or more students, can review authorized learning-progress information and purchase for a student |
| Teacher support | Teacher may invite assistants and delegate course-specific Q&A, conversations, and other limited responsibilities |
| Administrative delegation | Employees receive precise functional permissions and scopes; the owner retains sensitive controls |
| Initial languages | Arabic-first and RTL-ready; English-capable architecture recommended |
| Initial checkout currency | Omani rial (OMR); final gateway and settlement arrangements to be selected |
| Future extensibility | More curricula, subscriptions, bundles, additional teacher collaborations, apps, richer analytics |

## 2. The business opportunity

School learners and guardians need a structured way to find educators appropriate to the learner's **curriculum, grade, subject, and school period**. Teachers need an independent, moderated environment to publish courses, conduct live sessions, respond to enrolled learners, and monetize their teaching. The platform operator needs quality controls, student safeguards, reliable payments, auditable teacher commission calculations, and a manageable operations workflow.

**Product thesis:** A grade-first course marketplace, with built-in learning delivery and guardian oversight, offers a better discovery and retention experience than a generic catalog of videos.

## 3. Confirmed decisions

The following are user-supplied requirements, **not assumptions**:

| ID | Confirmed decision | Consequence |
|---|---|---|
| DEC-01 | Audience covers Grades 1–12 in Oman | Grades must be configurable academic entities |
| DEC-02 | Teachers may teach one/multiple subjects and a subset of grades | Many-to-many teaching qualifications; no one-grade/one-subject teacher restriction |
| DEC-03 | Each teacher creates courses specifying grade and subject | Structured academic metadata required to publish |
| DEC-04 | Paid courses may provide a free video preview | Lesson preview entitlement distinct from paid course enrollment |
| DEC-05 | Free and paid course support | Model accommodates both; paid purchase is the main launch journey |
| DEC-06 | Individual course purchases at launch | Orders and enrollments are course-specific; subscriptions deferred |
| DEC-07 | Recorded and live instruction are supported | Live-session schedule, attendance and recording workflow |
| DEC-08 | Enrolled students are notified about live sessions and newly published recordings | Audience targeting by active course access; publish-triggered notification events |
| DEC-09 | Students have separate accounts; parents can track linked children | Guardian–student many-to-many link and consent/verification workflows |
| DEC-10 | Teachers may apply; admins may approve, create or invite them | Teacher application and approval state machine |
| DEC-11 | One accountable teacher per course initially | `courses.owner_teacher_id`; assistants are delegated members |
| DEC-12 | Teacher may have a team for student questions/messages | Scoped team membership and shared inbox/Q&A |
| DEC-13 | Platform admin may delegate to employees | Staff RBAC with least privilege and audit history |
| DEC-14 | Platform collects all course payments, retains commission, pays teachers | Central checkout, commission ledger, payout operations, reconciliation |

## 4. Recommendations (not yet business-owner approvals)

| ID | Recommendation | Rationale |
|---|---|---|
| REC-01 | Launch with Oman MOE curriculum; make academic taxonomy multi-curriculum capable | Lower launch complexity without a redesign later |
| REC-02 | Grade → Subject → Course as primary discovery | Matches school learner/guardian mental model |
| REC-03 | One mandatory course owner plus scoped team members | Accountability and clean access rights |
| REC-04 | Admin review before first publication and material edits | Quality control and student safeguards |
| REC-05 | Separate enrollment, entitlement/access grant, and purchase records | Supports gifts/guardian buying, refunds and future subscriptions |
| REC-06 | Monthly payout batches with configurable holds, subject to owner approval | Simpler initial reconciliation and dispute handling |
| REC-07 | Modular-monolith backend and relational database | Clear domains with manageable deployment complexity |
| REC-08 | Arabic-first responsive web app, with English-capable data model | Primary market fit and extensibility |
| REC-09 | In-app and email alerts at launch; push later if feasible | Dependable initial notification experience |
| REC-10 | Avoid open-ended direct adult-to-minor messaging | Moderation, reporting, role-scoped support and auditability |

## 5. Minimum viable launch capabilities

1. Public discovery by curriculum, grade, subject and teacher; search and course detail pages.
2. Student/guardian registration and verified guardian–student links.
3. Teacher applications, admin approval and teacher profile management.
4. Teacher course builder: metadata, units, lessons, video/resources, previews and publish workflow.
5. Recorded lessons, live-session scheduling/joining, session recordings and learning notifications.
6. Student enrollment, progress tracking and basic assessments; guardian progress dashboard.
7. In-course Q&A, teacher support team membership and scoped shared inbox.
8. Platform-collected checkout, provider-confirmed access grants, commissions, refunds, earnings and basic teacher payouts.
9. Admin staffing/RBAC, content moderation, audit trails, financial reconciliation and essential reporting.
10. Security, accessibility, privacy, consent, reliability and operational monitoring appropriate to a minors-focused product.

## 6. Success measures (define targets during discovery)

| Dimension | Example KPI |
|---|---|
| Acquisition | Course-page viewers, teacher applications, student/guardian registrations |
| Conversion | Free-preview-to-purchase conversion; checkout completion; paid enrollments |
| Learning | Lesson completion, active learners, quiz participation, live attendance |
| Support | First response time, unanswered questions, resolved course inquiries |
| Teacher supply | Approved teachers, published courses, active course creators |
| Financial | Gross sales, net platform commissions, refunds/chargebacks, overdue teacher payouts |
| Safety/quality | Report resolution time, authorization failures, content-review backlog |

Do not invent KPI targets before baseline usage data exists.

## 7. Open decisions requiring business-owner approval

| Priority | Decision | Default drafting assumption until approved |
|---|---|---|
| Critical | Legal merchant/service-provider model (principal seller vs collection agent) | Unresolved; obtain Oman legal/tax advice |
| Critical | Payment gateway, teacher-settlement permissions and supported payout rails | Provider-neutral integration; verify commercial fit |
| Critical | VAT treatment of courses, commissions and invoices | Configurable taxes; no blanket exemption assumed |
| High | Platform commission default and teacher overrides | Configurable; no specific rate presumed |
| High | Course access duration and expiration | Explicit course-level policy |
| High | Refund eligibility, dispute and payout-hold policy | Configurable; do not hard-code period |
| High | Teacher earnings transfer frequency/minimum | Monthly proposed, not approved |
| High | Guardian verification and underage account rules | Require privacy/legal sign-off |
| High | Live-session provider and recording/storage policy | Provider-neutral adapter |
| Medium | Coupon funding and discount attribution | Must be explicit per promotion |
| Medium | Whether teachers can enroll students for free | Admin-controlled complimentary access, if approved |
| Medium | Rating/review availability and moderation | Defer to post-MVP if not essential |
| Medium | Notifications channels and parental preferences | In-app baseline, preferences by role |

## 8. Out of initial scope (unless specifically approved)

Subscription products; native iOS/Android apps; shared course ownership; enterprise/school district tenancy; unlimited public social messaging; external curriculum catalogs beyond launch; AI grading/tutoring; advanced adaptive learning; teacher assistants' separate payouts through the platform.

## 9. Sources and verification notes

**Video references provided for original inspiration:**
- First ~4–5 minutes: https://www.youtube.com/watch?v=xqoYkX4hfwg
- Entire second video: https://www.youtube.com/watch?v=g4kJvoTnOKM

**Verification limit:** Video audio/transcripts were not reliably retrieved. This package reflects the user's explicit requirements and architectural recommendations, **not a verified analysis of those videos**.

Useful official references checked 19 October 2026:
- Oman Ministry of Education — Basic Education: https://moe.gov.om/portal/sitebuilder/sites/eps/English/MOE/BasicEducation.aspx (basic-education cycles 1–4 and 5–10; post-basic 11–12 addressed in MOE materials).
- Oman Ministry of Education — Education structure discussion: https://home.moe.gov.om/en/topics/0/show/2157?GetLang=en (also discusses school organizational groupings of 1–4, 5–8, 9–12; do not conflate with basic-education cycles).
- Ministry of Transport, Communications and Information Technology — Royal Decree 68/2026 amendment overview: https://www.mtcit.gov.om/library-3/legislations-policies-8/laws-75/royal-decree-68-2026-amending-some-provisions-of-the-personal-data-protection-law-1481
- Central Bank of Oman — Payment operating rules: https://cbo.gov.om/Pages/Payment-Systems-Operating-Rules.aspx

These sources are context, not a substitute for formal commercial, educational, financial or legal review.

## 10. Companion documents

- [Executive Summary](02_Executive_Summary.md)
- [Information Architecture](03_Information_Architecture.md)
- [Product & Technical Blueprint](04_Platform_Blueprint.md)
