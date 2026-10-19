# Executive Summary — Oman School E-Learning Platform

**Version:** 1.0 · **Date:** 19 October 2026 · **Decision status:** Core business model confirmed; implementation policy pending

## The proposal

Build a **mobile-friendly, Arabic-first educational marketplace and learning management platform for school learners in Oman (Grades 1–12)**. Instead of distributing disconnected videos or operating as a single school, the platform aggregates independently managed teacher-led courses in one trusted environment. Students and parents discover an appropriate course by **curriculum → grade → subject → teacher/course**, preview how the teacher teaches, then purchase the course and study recorded lessons, live sessions, worksheets and assessments.

Teachers manage their own catalog and classes. Parents monitor the progress of their linked children. Platform employees moderate content, verify teachers, support users and operate the commercial system under tightly scoped permissions.

## Why this product

The proposed user journey addresses four needs simultaneously:

1. **Students:** A structured way to find and study an appropriate curriculum and grade-specific course.
2. **Parents and guardians:** Confidence in teacher selection, a consolidated way to pay for multiple children, and visibility into learning progress.
3. **Teachers:** An independently managed course storefront, recorded/live teaching tools, student support, analytics and transparent earnings.
4. **Platform operator:** Centralized quality control, flexible course commerce, revenue sharing, delegated operations and measurable learning activity.

## Business and revenue model

At launch, the core commercial unit is an **individual course purchase**. A course may be free or paid, but paid courses can expose teacher-selected introductory video lessons as **free previews**. A preview does not grant an enrollment into the paid course.

**Centralized collection model:** The platform processes the customer's course payment, verifies it through an authorized payment provider, grants course access to the designated student, records the agreed platform commission, and recognizes an amount payable to the teacher. Payouts are made through a controlled and reconciled settlement process. Refunds, discounts, gateway fees, taxes and chargebacks are tracked separately.

This is not a consumer stored-value wallet. Financial balance labels represent accounting positions; actual movement of money depends on bank/provider settlements and applicable contractual/regulatory requirements.

Future subscriptions should be possible by extending the **entitlement/access grant** mechanism rather than reworking lessons or enrollments.

## Product experience

| Experience | Value delivered |
|---|---|
| Public website | Grade-first browsing, teacher directory, course details, introductory preview, teacher applications |
| Student portal | Purchased courses, recorded/video lessons, live classes, coursework, Q&A, progress, results and alerts |
| Guardian portal | Link/verify children, purchase on their behalf, see progress, assignments and upcoming activities |
| Teacher portal | Build/publish courses for one or multiple grades/subjects, manage live sessions and content, view earnings |
| Teacher team workspace | Delegate course-level Q&A, messages, assignment support or content tasks without exposing financial controls |
| Administration portal | Academic catalog, approvals, users, employees, finance, teacher payouts, content review, reports and platform settings |

## Recommended launch scope

**Curriculum:** Start with the Oman Ministry of Education curriculum, while designing the catalog to accommodate other national/international curricula later. Academic configuration must support curriculum-specific grades, subjects, academic years, semesters and tracks. Grade selection is the primary consumer navigation; official Oman basic-education cycles may provide secondary grouping.

**Learning:** Support recorded, live and hybrid courses. Eligible enrolled students are notified when new live sessions are scheduled, rescheduled or cancelled, and when recordings or lessons are published. The system should preserve past learning records across academic-year changes.

**Organization:** One teacher owns each course at launch. That teacher can grant assistants narrowly scoped access to assigned courses or conversations. Admin can approve new teachers and add staff with explicit functional permissions; sensitive financial actions have separate approval controls.

**Safety:** Because school-age minors are users, guardian-link verification, communications moderation, privacy, audit trails and staff least-privilege are launch-level requirements, not optional enhancements.

## Architecture recommendation

Implement an **API-centered modular monolith** backed by a relational database and private learning-media storage. Separate functional modules for identity/permissions, academics, teacher onboarding, courses, learning, live sessions, Q&A, commerce, accounting/payouts, notifications, moderation and reporting. Use provider adapters for checkout, meetings/video and message delivery.

The three most important separations are:

- **Course publication vs access:** Public preview rules are not equivalent to paid enrollment.
- **Buyer vs learner:** A guardian can pay while an individual child receives the access grant.
- **Sale vs accounting vs payout:** Successful payment may cause an enrollment, an earning allocation and, later, an independently approved teacher transfer.

## Delivery approach

| Workstream | Key deliverables |
|---|---|
| Foundation | Accounts, roles, permissions, verified guardian links, academic taxonomy |
| Supply | Teacher applications, course builder, review/publishing, teacher teams |
| Commerce | Checkout, orders, provider verification, access grants, commissions, refunds |
| Learning | Recorded lessons, progress, basic assessments, guardian dashboard |
| Engagement | Live classes, recordings, notifications, moderated course Q&A |
| Operations | Admin staff scopes, reconciliation, payouts, reporting, audit logs, production hardening |

These workstreams may overlap; all essential workflows must be integrated and tested before commercial launch.

## Executive decisions required before production

1. Confirm **who is legally the seller of the educational service** and whether the platform is collecting as principal or agent for teachers.
2. Choose the Oman-compatible **payment acceptance and payout arrangements**; verify merchant eligibility and regulatory responsibilities.
3. Approve **commission schedules, course access duration, refund policy, payout holds, payout cadence and tax rules**.
4. Approve **guardian consent/verification, moderation, communications, retention and data protection policies**.
5. Choose live-meeting, recording/video-hosting and operational notification providers.

No commission rate, delivery timeline, financial forecast or payment-provider guarantee is asserted here without a validated business case.

## Recommended success dashboard

Measure teacher applications/approvals; published course supply by grade and subject; course preview engagement; preview-to-purchase conversion; successful payments; refund rates; learner retention and completion; live-session participation; guardian engagement; support-response times; teacher earnings; outstanding payables; overdue payouts and content/safety escalations.

## Executive conclusion

Proceed with a **grade-first, multi-teacher learning marketplace** and centralized course checkout, but build it as a governed platform: teachers control educational content, staff have delegated and auditable permissions, guardians have authorized oversight, and every payment is tracked from purchase through entitlement, teacher earning and payout. This foundation provides a practical MVP while keeping the business open to more curricula, subscriptions and additional revenue models.

### Related documents

- [Executive Information and decision register](01_Executive_Information.md)
- [Information Architecture and navigation specification](03_Information_Architecture.md)
- [Product and Technical Blueprint](04_Platform_Blueprint.md)

### Source notes

The educational system reference is the Oman Ministry of Education: https://moe.gov.om/portal/sitebuilder/sites/eps/English/MOE/BasicEducation.aspx. The 2026 PDPL amendment summary is published by Oman's MTCIT: https://www.mtcit.gov.om/library-3/legislations-policies-8/laws-75/royal-decree-68-2026-amending-some-provisions-of-the-personal-data-protection-law-1481. Payment systems are subject to the Central Bank of Oman framework: https://cbo.gov.om/Pages/Payment-Systems-Operating-Rules.aspx. Platform design and legal recommendations remain subject to project-specific review.

**Video-reference limitation:** The original YouTube videos' transcripts were not verified; the requirements here derive from the owner's confirmed decisions, not a claim about the videos' contents.
