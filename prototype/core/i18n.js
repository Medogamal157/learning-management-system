import { getState, dispatch } from './store.js';
export const dictionary = {
  "route./": {
    "ar": "الرئيسية",
    "en": "Home"
  },
  "route./explore": {
    "ar": "استكشف الدورات",
    "en": "Explore courses"
  },
  "route./explore/grade/:gradeId": {
    "ar": "دورات الصف",
    "en": "Grade courses"
  },
  "route./explore/grade/:gradeId/subject/:subjectId": {
    "ar": "دورات المادة",
    "en": "Subject courses"
  },
  "route./course/:id": {
    "ar": "تفاصيل الدورة",
    "en": "Course details"
  },
  "route./teachers": {
    "ar": "المعلمون",
    "en": "Teachers"
  },
  "route./teacher/:id": {
    "ar": "ملف المعلم",
    "en": "Teacher profile"
  },
  "route./become-teacher": {
    "ar": "انضم معلماً",
    "en": "Become a teacher"
  },
  "route./about": {
    "ar": "عن المنصة",
    "en": "About"
  },
  "route./help": {
    "ar": "المساعدة والتواصل",
    "en": "Help and contact"
  },
  "route./legal/:page": {
    "ar": "السياسات",
    "en": "Policies"
  },
  "route./auth/sign-in": {
    "ar": "تسجيل الدخول",
    "en": "Sign in"
  },
  "route./auth/reset-password": {
    "ar": "استعادة كلمة المرور",
    "en": "Reset password"
  },
  "route./auth/register/student": {
    "ar": "تسجيل طالب",
    "en": "Student registration"
  },
  "route./auth/register/guardian": {
    "ar": "تسجيل ولي أمر",
    "en": "Guardian registration"
  },
  "route./auth/teacher-application": {
    "ar": "طلب الانضمام للتدريس",
    "en": "Teacher application"
  },
  "route./checkout/:courseId/beneficiary": {
    "ar": "اختيار الطالب",
    "en": "Select student"
  },
  "route./checkout/:courseId/review": {
    "ar": "مراجعة الطلب",
    "en": "Order review"
  },
  "route./checkout/order/:orderId/provider": {
    "ar": "الدفع التجريبي",
    "en": "Demo payment"
  },
  "route./checkout/order/:orderId/result": {
    "ar": "نتيجة الدفع",
    "en": "Payment result"
  },
  "route./checkout/order/:orderId/receipt": {
    "ar": "إيصال الطلب",
    "en": "Order receipt"
  },
  "route./student": {
    "ar": "لوحة الطالب",
    "en": "Student dashboard"
  },
  "route./student/courses": {
    "ar": "دوراتي",
    "en": "My courses"
  },
  "route./student/course/:id": {
    "ar": "غرفة التعلم",
    "en": "Learning room"
  },
  "route./student/explore": {
    "ar": "اكتشف دورات",
    "en": "Browse courses"
  },
  "route./student/calendar": {
    "ar": "الجدول والحصص المباشرة",
    "en": "Calendar and live classes"
  },
  "route./student/assignments": {
    "ar": "الواجبات والنتائج",
    "en": "Assignments and results"
  },
  "route./student/messages": {
    "ar": "الرسائل والأسئلة",
    "en": "Messages and questions"
  },
  "route./student/messages/:id": {
    "ar": "المحادثة",
    "en": "Conversation"
  },
  "route./student/notifications": {
    "ar": "الإشعارات",
    "en": "Notifications"
  },
  "route./student/profile": {
    "ar": "الملف التعليمي",
    "en": "Learning profile"
  },
  "route./student/settings": {
    "ar": "الحساب والخصوصية",
    "en": "Account and privacy"
  },
  "route./guardian": {
    "ar": "لوحة ولي الأمر",
    "en": "Guardian dashboard"
  },
  "route./guardian/children": {
    "ar": "أبنائي",
    "en": "My children"
  },
  "route./guardian/children/link": {
    "ar": "ربط طالب والتحقق",
    "en": "Link and verify child"
  },
  "route./guardian/child/:id": {
    "ar": "متابعة الطالب",
    "en": "Child dashboard"
  },
  "route./guardian/explore": {
    "ar": "شراء دورة لطالب",
    "en": "Explore for a child"
  },
  "route./guardian/orders": {
    "ar": "الطلبات والإيصالات",
    "en": "Orders and receipts"
  },
  "route./guardian/notifications": {
    "ar": "الإشعارات",
    "en": "Notifications"
  },
  "route./guardian/support": {
    "ar": "الدعم",
    "en": "Support"
  },
  "route./guardian/settings": {
    "ar": "الإعدادات وصلاحيات الربط",
    "en": "Settings and link permissions"
  },
  "route./teacher": {
    "ar": "لوحة المعلم",
    "en": "Teacher dashboard"
  },
  "route./teacher/courses": {
    "ar": "دوراتي التعليمية",
    "en": "My teaching courses"
  },
  "route./teacher/courses/new": {
    "ar": "إنشاء دورة",
    "en": "Create course"
  },
  "route./teacher/courses/:id/edit": {
    "ar": "تحرير الدورة",
    "en": "Edit course"
  },
  "route./teacher/course/:id": {
    "ar": "مساحة الدورة",
    "en": "Course workspace"
  },
  "route./teacher/students": {
    "ar": "الطلاب",
    "en": "Students"
  },
  "route./teacher/inbox": {
    "ar": "الوارد والأسئلة",
    "en": "Inbox and Q&A"
  },
  "route./teacher/inbox/:id": {
    "ar": "تفاصيل المحادثة",
    "en": "Conversation details"
  },
  "route./teacher/calendar": {
    "ar": "جدول التدريس",
    "en": "Teaching calendar"
  },
  "route./teacher/team": {
    "ar": "فريق التدريس",
    "en": "Teaching team"
  },
  "route./teacher/earnings": {
    "ar": "الأرباح والمستحقات",
    "en": "Earnings and payables"
  },
  "route./teacher/notifications": {
    "ar": "الإشعارات",
    "en": "Notifications"
  },
  "route./teacher/settings": {
    "ar": "الملف العام والإعدادات",
    "en": "Public profile and settings"
  },
  "route./assistant": {
    "ar": "العمل المسند",
    "en": "Assigned work overview"
  },
  "route./assistant/courses": {
    "ar": "الدورات المسندة",
    "en": "Assigned courses"
  },
  "route./assistant/course/:id": {
    "ar": "مساحة الدورة المسندة",
    "en": "Assigned course workspace"
  },
  "route./assistant/inbox": {
    "ar": "صندوق الوارد",
    "en": "Inbox"
  },
  "route./assistant/inbox/:id": {
    "ar": "المحادثة والملاحظات",
    "en": "Conversation and notes"
  },
  "route./assistant/qa": {
    "ar": "أسئلة الدروس",
    "en": "Lesson Q&A"
  },
  "route./assistant/tasks": {
    "ar": "مهام التصحيح والمحتوى",
    "en": "Grading and content tasks"
  },
  "route./assistant/notifications": {
    "ar": "الإشعارات",
    "en": "Notifications"
  },
  "route./assistant/settings": {
    "ar": "الإعدادات الشخصية",
    "en": "Personal settings"
  },
  "route./admin": {
    "ar": "لوحة العمليات",
    "en": "Operational dashboard"
  },
  "route./admin/people/students": {
    "ar": "الطلاب",
    "en": "Students"
  },
  "route./admin/people/guardian-links": {
    "ar": "روابط أولياء الأمور",
    "en": "Guardian links"
  },
  "route./admin/people/teachers": {
    "ar": "المعلمون وطلبات الانضمام",
    "en": "Teachers and applications"
  },
  "route./admin/people/employees": {
    "ar": "الموظفون الإداريون",
    "en": "Admin employees"
  },
  "route./admin/people/teams": {
    "ar": "الإشراف على فرق التدريس",
    "en": "Teacher team oversight"
  },
  "route./admin/academics/curricula": {
    "ar": "المناهج والإصدارات والمسارات",
    "en": "Curricula, versions and tracks"
  },
  "route./admin/academics/grades": {
    "ar": "الصفوف والمراحل",
    "en": "Grades and stage labels"
  },
  "route./admin/academics/subjects": {
    "ar": "المواد وربطها بالصفوف",
    "en": "Subjects and grade mappings"
  },
  "route./admin/academics/periods": {
    "ar": "الأعوام والفصول الدراسية",
    "en": "Academic years and semesters"
  },
  "route./admin/academics/translations": {
    "ar": "تسميات المواد والترجمة",
    "en": "Subject labels and translations"
  },
  "route./admin/courses/review": {
    "ar": "مراجعة الدورات",
    "en": "Course approval queue"
  },
  "route./admin/courses/catalog": {
    "ar": "إدارة الدورات",
    "en": "Course operations"
  },
  "route./admin/courses/reports": {
    "ar": "بلاغات المحتوى والإزالة",
    "en": "Content reports and takedowns"
  },
  "route./admin/courses/access": {
    "ar": "التسجيلات وصلاحيات الوصول",
    "en": "Enrollments and entitlements"
  },
  "route./admin/courses/live": {
    "ar": "الإشراف على الحصص المباشرة",
    "en": "Live session oversight"
  },
  "route./admin/finance": {
    "ar": "لوحة المالية",
    "en": "Finance dashboard"
  },
  "route./admin/finance/orders": {
    "ar": "الطلبات ومعاملات الدفع",
    "en": "Orders and transactions"
  },
  "route./admin/finance/refunds": {
    "ar": "الاستردادات والنزاعات",
    "en": "Refunds and disputes"
  },
  "route./admin/finance/commissions": {
    "ar": "العمولات والاستثناءات",
    "en": "Commission rules and overrides"
  },
  "route./admin/finance/earnings": {
    "ar": "مستحقات المعلمين والقيود",
    "en": "Teacher earnings and ledgers"
  },
  "route./admin/finance/payouts": {
    "ar": "حسابات ودفعات الصرف",
    "en": "Payout accounts and batches"
  },
  "route./admin/finance/payouts/:id": {
    "ar": "تفاصيل دفعة الصرف",
    "en": "Payout batch details"
  },
  "route./admin/finance/reconciliation": {
    "ar": "المطابقة والتقارير المالية",
    "en": "Reconciliation and financial reports"
  },
  "route./admin/finance/tax": {
    "ar": "إعدادات الضرائب والفواتير",
    "en": "Tax and invoice configuration"
  },
  "route./admin/support/tickets": {
    "ar": "الدعم والبلاغات",
    "en": "Tickets, flags and moderation"
  },
  "route./admin/support/communications": {
    "ar": "بلاغات التواصل والتصعيد",
    "en": "Communication reports and escalations"
  },
  "route./admin/cms/home": {
    "ar": "الرئيسية واللافتات",
    "en": "Homepage and banners"
  },
  "route./admin/cms/pages": {
    "ar": "الصفحات والأسئلة الشائعة",
    "en": "Static pages and FAQs"
  },
  "route./admin/cms/promotions": {
    "ar": "القسائم والعروض",
    "en": "Coupons and promotions"
  },
  "route./admin/notifications": {
    "ar": "قوالب الإشعارات وتسليمها",
    "en": "Notification templates and delivery"
  },
  "route./admin/reports": {
    "ar": "التحليلات والتقارير",
    "en": "Analytics and reports"
  },
  "route./admin/settings/roles": {
    "ar": "الأدوار والصلاحيات والنطاق",
    "en": "Roles, permissions and scope"
  },
  "route./admin/settings/security": {
    "ar": "الأمان وسجل التدقيق",
    "en": "Security and audit log"
  },
  "route./admin/settings/integrations": {
    "ar": "التكاملات",
    "en": "Integrations"
  },
  "route./admin/settings/policies": {
    "ar": "سياسات المنصة",
    "en": "Platform policies"
  },
  "status.teacher_application.draft_application": {
    "ar": "مسودة",
    "en": "Draft"
  },
  "status.teacher_application.submitted": {
    "ar": "مقدّم",
    "en": "Submitted"
  },
  "status.teacher_application.under_review": {
    "ar": "قيد المراجعة",
    "en": "Under review"
  },
  "status.teacher_application.approved": {
    "ar": "معتمد",
    "en": "Approved"
  },
  "status.teacher_application.rejected": {
    "ar": "مرفوض",
    "en": "Rejected"
  },
  "status.teacher_application.more_info_required": {
    "ar": "معلومات إضافية مطلوبة",
    "en": "More information required"
  },
  "status.account.active": {
    "ar": "نشط",
    "en": "Active"
  },
  "status.account.invited": {
    "ar": "مدعو",
    "en": "Invited"
  },
  "status.account.suspended": {
    "ar": "موقوف",
    "en": "Suspended"
  },
  "status.account.deactivated": {
    "ar": "غير مفعل",
    "en": "Deactivated"
  },
  "status.course.Draft": {
    "ar": "مسودة",
    "en": "Draft"
  },
  "status.course.Submitted": {
    "ar": "مقدّم للمراجعة",
    "en": "Submitted"
  },
  "status.course.ChangesRequested": {
    "ar": "تعديلات مطلوبة",
    "en": "Changes requested"
  },
  "status.course.Published": {
    "ar": "منشور",
    "en": "Published"
  },
  "status.course.Unpublished": {
    "ar": "غير منشور",
    "en": "Unpublished"
  },
  "status.course.Archived": {
    "ar": "مؤرشف",
    "en": "Archived"
  },
  "status.order.draft": {
    "ar": "مسودة",
    "en": "Draft"
  },
  "status.order.pending": {
    "ar": "بانتظار الدفع",
    "en": "Pending payment"
  },
  "status.order.paid": {
    "ar": "مدفوع",
    "en": "Paid"
  },
  "status.order.failed": {
    "ar": "فشل الدفع",
    "en": "Failed"
  },
  "status.order.cancelled": {
    "ar": "ملغى",
    "en": "Cancelled"
  },
  "status.order.partially_refunded": {
    "ar": "مسترد جزئياً",
    "en": "Partially refunded"
  },
  "status.order.refunded": {
    "ar": "مسترد",
    "en": "Refunded"
  },
  "status.payment.initiated": {
    "ar": "بدأ الدفع",
    "en": "Initiated"
  },
  "status.payment.pending": {
    "ar": "قيد الانتظار",
    "en": "Pending"
  },
  "status.payment.succeeded": {
    "ar": "ناجح",
    "en": "Succeeded"
  },
  "status.payment.failed": {
    "ar": "فاشل",
    "en": "Failed"
  },
  "status.payment.refunded": {
    "ar": "مسترد",
    "en": "Refunded"
  },
  "status.payment.partially_refunded": {
    "ar": "مسترد جزئياً",
    "en": "Partially refunded"
  },
  "status.earning.pending": {
    "ar": "معلّق",
    "en": "Pending"
  },
  "status.earning.available": {
    "ar": "متاح للصرف",
    "en": "Available"
  },
  "status.earning.reserved": {
    "ar": "محجوز",
    "en": "Reserved"
  },
  "status.earning.in_payout": {
    "ar": "قيد الصرف",
    "en": "In payout"
  },
  "status.earning.paid": {
    "ar": "مدفوع",
    "en": "Paid"
  },
  "status.earning.adjusted": {
    "ar": "معدّل",
    "en": "Adjusted"
  },
  "status.payout_batch.Draft": {
    "ar": "مسودة",
    "en": "Draft"
  },
  "status.payout_batch.UnderReview": {
    "ar": "قيد المراجعة",
    "en": "Under review"
  },
  "status.payout_batch.Approved": {
    "ar": "معتمد",
    "en": "Approved"
  },
  "status.payout_batch.Processing": {
    "ar": "قيد المعالجة",
    "en": "Processing"
  },
  "status.payout_batch.Paid": {
    "ar": "مدفوع",
    "en": "Paid"
  },
  "status.payout_batch.Failed": {
    "ar": "فاشل",
    "en": "Failed"
  },
  "status.payout_batch.Rejected": {
    "ar": "معاد للتعديل",
    "en": "Returned for changes"
  },
  "status.conversation.open": {
    "ar": "مفتوح",
    "en": "Open"
  },
  "status.conversation.assigned": {
    "ar": "مسند",
    "en": "Assigned"
  },
  "status.conversation.waiting": {
    "ar": "بانتظار الرد",
    "en": "Waiting"
  },
  "status.conversation.resolved": {
    "ar": "محلول",
    "en": "Resolved"
  },
  "status.conversation.escalated": {
    "ar": "مصعّد",
    "en": "Escalated"
  },
  "status.guardian_link.requested": {
    "ar": "طلب ربط",
    "en": "Requested"
  },
  "status.guardian_link.pending_verification": {
    "ar": "بانتظار التحقق",
    "en": "Pending verification"
  },
  "status.guardian_link.verified": {
    "ar": "موثّق",
    "en": "Verified"
  },
  "status.guardian_link.rejected": {
    "ar": "مرفوض",
    "en": "Rejected"
  },
  "status.guardian_link.revoked": {
    "ar": "ملغى",
    "en": "Revoked"
  },
  "status.access.active": {
    "ar": "ساري",
    "en": "Active"
  },
  "status.access.expired": {
    "ar": "منتهي",
    "en": "Expired"
  },
  "status.access.revoked": {
    "ar": "ملغى",
    "en": "Revoked"
  },
  "status.enrollment.active": {
    "ar": "نشط",
    "en": "Active"
  },
  "status.enrollment.completed": {
    "ar": "مكتمل",
    "en": "Completed"
  },
  "status.enrollment.suspended": {
    "ar": "معلّق",
    "en": "Suspended"
  },
  "status.lesson_progress.not_started": {
    "ar": "لم يبدأ",
    "en": "Not started"
  },
  "status.lesson_progress.in_progress": {
    "ar": "قيد التعلم",
    "en": "In progress"
  },
  "status.lesson_progress.done": {
    "ar": "مكتمل",
    "en": "Done"
  },
  "status.content.draft": {
    "ar": "مسودة",
    "en": "Draft"
  },
  "status.content.processing": {
    "ar": "قيد التجهيز",
    "en": "Processing"
  },
  "status.content.ready": {
    "ar": "جاهز",
    "en": "Ready"
  },
  "status.content.published": {
    "ar": "منشور",
    "en": "Published"
  },
  "status.content.failed": {
    "ar": "فاشل",
    "en": "Failed"
  },
  "status.live.draft": {
    "ar": "مسودة",
    "en": "Draft"
  },
  "status.live.scheduled": {
    "ar": "مجدول",
    "en": "Scheduled"
  },
  "status.live.rescheduled": {
    "ar": "أعيدت جدولته",
    "en": "Rescheduled"
  },
  "status.live.live": {
    "ar": "مباشر",
    "en": "Live"
  },
  "status.live.ended": {
    "ar": "انتهى",
    "en": "Ended"
  },
  "status.live.recording_processing": {
    "ar": "تجهيز التسجيل",
    "en": "Recording processing"
  },
  "status.live.recording_ready": {
    "ar": "التسجيل جاهز",
    "en": "Recording ready"
  },
  "status.live.recording_published": {
    "ar": "التسجيل منشور",
    "en": "Recording published"
  },
  "status.live.cancelled": {
    "ar": "ملغى",
    "en": "Cancelled"
  },
  "status.live.failed": {
    "ar": "تعذر الاتصال",
    "en": "Unavailable"
  },
  "status.submission.not_submitted": {
    "ar": "لم يسلّم",
    "en": "Not submitted"
  },
  "status.submission.submitted": {
    "ar": "مسلّم",
    "en": "Submitted"
  },
  "status.submission.graded": {
    "ar": "مصحح",
    "en": "Graded"
  },
  "status.submission.released": {
    "ar": "النتيجة منشورة",
    "en": "Result released"
  },
  "status.refund.requested": {
    "ar": "مطلوب",
    "en": "Requested"
  },
  "status.refund.under_review": {
    "ar": "قيد المراجعة",
    "en": "Under review"
  },
  "status.refund.approved": {
    "ar": "معتمد",
    "en": "Approved"
  },
  "status.refund.processing": {
    "ar": "قيد المعالجة",
    "en": "Processing"
  },
  "status.refund.succeeded": {
    "ar": "مسترد",
    "en": "Refunded"
  },
  "status.refund.rejected": {
    "ar": "مرفوض",
    "en": "Rejected"
  },
  "status.refund.failed": {
    "ar": "فاشل",
    "en": "Failed"
  },
  "status.dispute.open": {
    "ar": "مفتوح",
    "en": "Open"
  },
  "status.dispute.under_review": {
    "ar": "قيد المراجعة",
    "en": "Under review"
  },
  "status.dispute.won": {
    "ar": "لصالح المنصة",
    "en": "Won"
  },
  "status.dispute.lost": {
    "ar": "استرداد قسري",
    "en": "Lost"
  },
  "status.task.open": {
    "ar": "مفتوحة",
    "en": "Open"
  },
  "status.task.in_progress": {
    "ar": "قيد التنفيذ",
    "en": "In progress"
  },
  "status.task.done": {
    "ar": "مكتملة",
    "en": "Done"
  },
  "status.delivery.queued": {
    "ar": "في الطابور",
    "en": "Queued"
  },
  "status.delivery.sent": {
    "ar": "مرسل",
    "en": "Sent"
  },
  "status.delivery.failed": {
    "ar": "فاشل",
    "en": "Failed"
  },
  "status.delivery.read": {
    "ar": "مقروء",
    "en": "Read"
  },
  "brand": {
    "ar": "منصة عُمان التعليمية",
    "en": "Oman Learning Platform"
  },
  "demo": {
    "ar": "تجربة تفاعلية",
    "en": "Interactive demo"
  },
  "demoNote": {
    "ar": "بيانات توضيحية، وآفاق حقيقية للتعلم",
    "en": "Illustrative data. Real possibilities for learning."
  },
  "home.eyebrow": {
    "ar": "لكل طالب، بداية تلائمه",
    "en": "A starting point for every learner"
  },
  "home.headline": {
    "ar": "معرفة تنمو معك.\nومستقبل يبدأ اليوم.",
    "en": "Grow your curiosity.\nStart your next chapter."
  },
  "home.intro": {
    "ar": "من صفك الدراسي إلى ما تطمح إليه. اكتشف دورات واضحة وممتعة، مع معلمين يرافقون كل خطوة.",
    "en": "From your school grade to your next ambition. Discover thoughtful courses with teachers who guide every step."
  },
  "home.grade": {
    "ar": "اختر صفك، وابدأ رحلتك",
    "en": "Choose your grade. Find your path."
  },
  "home.subjects": {
    "ar": "مساحات جديدة للاكتشاف",
    "en": "Room for discovery"
  },
  "home.subjectsSub": {
    "ar": "من سؤال صغير، يبدأ فهم كبير.",
    "en": "Big understanding begins with a small question."
  },
  "home.courses": {
    "ar": "خطوتك التالية تبدأ هنا",
    "en": "Your next step starts here"
  },
  "home.coursesSub": {
    "ar": "دورات مختارة لتتعلم بوضوح وثقة.",
    "en": "Selected courses for clarity and confidence."
  },
  "home.teachers": {
    "ar": "خبرة تُلهم، واهتمام يصنع الفرق",
    "en": "Knowledge shared with care"
  },
  "home.teachersSub": {
    "ar": "تعرّف إلى المعلمين الذين يرافقون رحلتك.",
    "en": "Meet the teachers who will guide your learning."
  },
  "home.how": {
    "ar": "طريق واضح إلى التعلم",
    "en": "A clear path to learning"
  },
  "home.step1": {
    "ar": "ابدأ من صفك",
    "en": "Start with your grade"
  },
  "home.step1body": {
    "ar": "اختر المواد المناسبة لمرحلتك واهتماماتك.",
    "en": "Find subjects that fit your stage and interests."
  },
  "home.step2": {
    "ar": "تعرّف إلى دورتك",
    "en": "Find your course"
  },
  "home.step2body": {
    "ar": "استكشف المحتوى والمعلم وطريقة التعلم.",
    "en": "Explore the lessons, teacher and learning format."
  },
  "home.step3": {
    "ar": "تعلّم، وطبّق، وتقدّم",
    "en": "Learn, practice, grow"
  },
  "home.step3body": {
    "ar": "خطوات صغيرة تبني فهماً يدوم.",
    "en": "Small steps build understanding that lasts."
  },
  "home.cta": {
    "ar": "للمعرفة أثر. شارك معرفتك.",
    "en": "Knowledge makes a difference. Share yours."
  },
  "home.ctabody": {
    "ar": "مساحة تجمع شغف المعلم بفضول الطالب.",
    "en": "A place where a teacher’s passion meets a learner’s curiosity."
  },
  "home.chart": {
    "ar": "فرص التعلم في كل مرحلة",
    "en": "Learning across every stage"
  },
  "home.chartSub": {
    "ar": "الدورات المنشورة حسب الحلقة الدراسية",
    "en": "Published courses by education cycle"
  },
  "home.collage": {
    "ar": "اكتشف. جرّب. افهم.",
    "en": "Explore. Practice. Understand."
  },
  "home.collageSub": {
    "ar": "التعلم أقرب مما تتخيل",
    "en": "Your next discovery is closer than you think"
  },
  "home.curriculum": {
    "ar": "المنهج الدراسي",
    "en": "Curriculum"
  },
  "explore": {
    "ar": "استكشف الدورات",
    "en": "Explore courses"
  },
  "teachers": {
    "ar": "المعلمون",
    "en": "Teachers"
  },
  "become": {
    "ar": "انضم معلماً",
    "en": "Become a teacher"
  },
  "help": {
    "ar": "المساعدة",
    "en": "Help"
  },
  "signIn": {
    "ar": "تسجيل الدخول",
    "en": "Sign in"
  },
  "workspace": {
    "ar": "مساحتي",
    "en": "My workspace"
  },
  "about": {
    "ar": "عن المنصة",
    "en": "About"
  },
  "privacy": {
    "ar": "الخصوصية",
    "en": "Privacy"
  },
  "terms": {
    "ar": "الشروط",
    "en": "Terms"
  },
  "refunds": {
    "ar": "الاسترداد",
    "en": "Refunds"
  },
  "all": {
    "ar": "عرض الكل",
    "en": "View all"
  },
  "close": {
    "ar": "إغلاق",
    "en": "Close"
  },
  "back": {
    "ar": "رجوع",
    "en": "Back"
  },
  "home": {
    "ar": "الرئيسية",
    "en": "Home"
  },
  "retry": {
    "ar": "إعادة المحاولة",
    "en": "Retry"
  },
  "reset": {
    "ar": "إعادة ضبط التجربة",
    "en": "Reset demo data"
  },
  "resetTitle": {
    "ar": "هل تريد بدء تجربة جديدة؟",
    "en": "Start a fresh demo?"
  },
  "resetBody": {
    "ar": "ستُحذف تغييرات هذه الجلسة وتعود البيانات الأصلية. تبقى اللغة والمظهر والدور كما اخترتها.",
    "en": "This session’s changes will be removed and the original data restored. Your role, language and theme stay selected."
  },
  "cancel": {
    "ar": "إلغاء",
    "en": "Cancel"
  },
  "switcher": {
    "ar": "إعدادات التجربة",
    "en": "Demo controls"
  },
  "roles": {
    "ar": "اختر مساحة العمل",
    "en": "Choose a workspace"
  },
  "language": {
    "ar": "اللغة",
    "en": "Language"
  },
  "theme": {
    "ar": "المظهر",
    "en": "Appearance"
  },
  "light": {
    "ar": "فاتح",
    "en": "Light"
  },
  "dark": {
    "ar": "داكن",
    "en": "Dark"
  },
  "quick": {
    "ar": "انتقل بسرعة",
    "en": "Quick jumps"
  },
  "preferences": {
    "ar": "تفضيلاتي",
    "en": "My preferences"
  },
  "signOut": {
    "ar": "خروج تجريبي",
    "en": "Demo sign out"
  },
  "notifications": {
    "ar": "الإشعارات",
    "en": "Notifications"
  },
  "unread": {
    "ar": "غير مقروءة: {count}",
    "en": "Unread: {count}"
  },
  "menu": {
    "ar": "القائمة",
    "en": "Navigation"
  },
  "userMenu": {
    "ar": "قائمة المستخدم",
    "en": "User menu"
  },
  "breadcrumb": {
    "ar": "مسار الصفحة",
    "en": "Breadcrumb"
  },
  "coming": {
    "ar": "متاح في المرحلة P{phase}",
    "en": "Coming in phase P{phase}"
  },
  "comingBody": {
    "ar": "هذه الوجهة مسجلة ضمن التصور. ستُضاف وظائفها في المرحلة المحددة؛ يمكنك الآن استكشاف الرئيسية والتنقل بين الأدوار.",
    "en": "This destination is part of the concept. Its functionality arrives in the indicated phase; explore the home page and role navigation today."
  },
  "notFound": {
    "ar": "الصفحة غير موجودة",
    "en": "Page not found"
  },
  "missing": {
    "ar": "السجل غير موجود",
    "en": "Record not found"
  },
  "missingBody": {
    "ar": "قد تكون بيانات جلسة سابقة. عد إلى مساحتك للمتابعة.",
    "en": "This may be a record from a previous session. Return to your workspace to continue."
  },
  "denied": {
    "ar": "لا توجد صلاحية",
    "en": "No permission"
  },
  "deniedBody": {
    "ar": "هذه الصفحة متاحة للأدوار التالية. اختر دوراً لإعادة فتحها.",
    "en": "This page is available to the following roles. Choose a role to retry it."
  },
  "resourceDenied": {
    "ar": "هذا السجل خارج نطاق صلاحياتك",
    "en": "This record is outside your scope"
  },
  "resourceDeniedBody": {
    "ar": "عد إلى مساحتك للوصول إلى السجلات المسموح بها.",
    "en": "Return to your workspace to access permitted records."
  },
  "viewError": {
    "ar": "تعذر عرض الصفحة",
    "en": "Unable to display this page"
  },
  "viewErrorBody": {
    "ar": "أعد المحاولة أو ابدأ تجربة جديدة.",
    "en": "Try again or reset the demo."
  },
  "unknown": {
    "ar": "غير معروف",
    "en": "Unknown"
  },
  "free": {
    "ar": "مجانية",
    "en": "Free"
  },
  "details": {
    "ar": "استكشف الدورة",
    "en": "Explore course"
  },
  "verified": {
    "ar": "مؤهلات موثّقة",
    "en": "Verified credentials"
  },
  "publishedCount": {
    "ar": "الدورات المنشورة: {count}",
    "en": "Published courses: {count}"
  },
  "progress": {
    "ar": "التقدم",
    "en": "Progress"
  },
  "preview": {
    "ar": "معاينة",
    "en": "Preview"
  },
  "locked": {
    "ar": "يتطلب التسجيل",
    "en": "Enrollment required"
  },
  "done": {
    "ar": "مكتمل",
    "en": "Complete"
  },
  "duration": {
    "ar": "المدة: {count} دقيقة",
    "en": "{count} min"
  },
  "previous": {
    "ar": "السابق",
    "en": "Previous"
  },
  "next": {
    "ar": "التالي",
    "en": "Next"
  },
  "pagination": {
    "ar": "صفحات النتائج",
    "en": "Result pages"
  },
  "results": {
    "ar": "عدد النتائج: {count}",
    "en": "Results: {count}"
  },
  "filters": {
    "ar": "الفلاتر",
    "en": "Filters"
  },
  "resetFilters": {
    "ar": "مسح الفلاتر",
    "en": "Clear filters"
  },
  "apply": {
    "ar": "تطبيق",
    "en": "Apply"
  },
  "empty": {
    "ar": "لا توجد نتائج بعد",
    "en": "No results yet"
  },
  "complete": {
    "ar": "مكتمل",
    "en": "Complete"
  },
  "current": {
    "ar": "الحالية",
    "en": "Current"
  },
  "upcoming": {
    "ar": "قادمة",
    "en": "Upcoming"
  },
  "steps": {
    "ar": "الخطوات",
    "en": "Steps"
  },
  "dismiss": {
    "ar": "إخفاء الإشعار",
    "en": "Dismiss notification"
  },
  "fileHint": {
    "ar": "محاكاة اسم ملف فقط؛ لا يتم رفع ملفات.",
    "en": "Filename simulation only; no file is uploaded."
  },
  "disabled": {
    "ar": "غير متاح في هذه المرحلة",
    "en": "Unavailable in this phase"
  },
  "invalidAction": {
    "ar": "الإجراء غير متاح",
    "en": "Action unavailable"
  },
  "invalidPreference": {
    "ar": "قيمة غير صالحة",
    "en": "Invalid preference"
  },
  "mode.recorded": {
    "ar": "مسجلة",
    "en": "Recorded"
  },
  "mode.live": {
    "ar": "مباشرة",
    "en": "Live"
  },
  "mode.hybrid": {
    "ar": "مدمجة",
    "en": "Hybrid"
  },
  "group.people": {
    "ar": "الأشخاص",
    "en": "People"
  },
  "group.academics": {
    "ar": "الدليل الأكاديمي",
    "en": "Academics"
  },
  "group.courses": {
    "ar": "الدورات",
    "en": "Courses"
  },
  "group.finance": {
    "ar": "المالية",
    "en": "Finance"
  },
  "group.support": {
    "ar": "الدعم والسلامة",
    "en": "Support and safety"
  },
  "group.cms": {
    "ar": "المحتوى",
    "en": "Content"
  },
  "group.settings": {
    "ar": "الإدارة",
    "en": "Administration"
  },
  "group.general": {
    "ar": "مساحة العمل",
    "en": "Workspace"
  },
  "role.visitor": {
    "ar": "زائر",
    "en": "Visitor"
  },
  "role.student": {
    "ar": "طالب",
    "en": "Student"
  },
  "role.guardian": {
    "ar": "ولي أمر",
    "en": "Guardian"
  },
  "role.teacher": {
    "ar": "معلم",
    "en": "Teacher"
  },
  "role.assistant": {
    "ar": "مساعد معلم",
    "en": "Assistant"
  },
  "role.admin_finance": {
    "ar": "مسؤول المالية",
    "en": "Finance administrator"
  },
  "role.admin_moderation": {
    "ar": "مسؤول الإشراف",
    "en": "Moderation administrator"
  },
  "role.super_admin": {
    "ar": "مدير المنصة",
    "en": "Platform owner"
  },
  "skipToContent": { "ar": "تخطَّ إلى المحتوى", "en": "Skip to content" },
  "mainNav": { "ar": "التنقل الرئيسي", "en": "Main navigation" },
  "workspaceNav": { "ar": "تنقل مساحة العمل", "en": "Workspace navigation" },
  "sidebar": { "ar": "الشريط الجانبي", "en": "Sidebar" },
  "publicSite": { "ar": "تصفح الموقع العام", "en": "Browse the public site" },
  "footer.discover": { "ar": "اكتشف", "en": "Discover" },
  "footer.platform": { "ar": "المنصة", "en": "Platform" },
  "footer.policies": { "ar": "السياسات", "en": "Policies" },
  "footer.synthetic": { "ar": "جميع الأسماء والسجلات في هذا التصور اصطناعية لأغراض العرض فقط.", "en": "All names and records in this concept are synthetic, for demonstration only." },
  "footer.demoDate": { "ar": "تاريخ العرض التجريبي: 19 أكتوبر 2026", "en": "Demo date: 19 October 2026" },
  "notifications.empty": { "ar": "لا توجد إشعارات لك حالياً.", "en": "You have no notifications right now." },
  "notifications.unreadLabel": { "ar": "غير مقروء", "en": "Unread" },
  "notifications.viewAll": { "ar": "عرض كل الإشعارات", "en": "View all notifications" },
  "profileSettings": { "ar": "الملف والإعدادات", "en": "Profile and settings" },
  "demoPersonaNote": { "ar": "هذه هوية تجريبية ثابتة. استخدم زر إعدادات التجربة للتبديل بين الأدوار.", "en": "This is a fixed demo persona. Use the demo controls button to switch roles." },
  "goHome": { "ar": "الذهاب إلى الصفحة الرئيسية", "en": "Go to home" },
  "switchToAllowed": { "ar": "بدّل إلى دور مسموح وأعد فتح الصفحة", "en": "Switch to an allowed role and retry" },
  "notFoundBody": { "ar": "تحقق من الرابط، أو عد إلى الصفحة الرئيسية لمتابعة التصفح.", "en": "Check the link, or return home to keep browsing." },
  "qualifications": { "ar": "المؤهلات المعتمدة", "en": "Verified qualifications" },
  "detailsFor": { "ar": "استكشف دورة {title}", "en": "Explore {title}" },
  "switcherOpen": { "ar": "فتح إعدادات التجربة", "en": "Open demo controls" },
  "switcherIntro": { "ar": "بدّل بين الأدوار والهويات التجريبية لعرض كل مساحة عمل.", "en": "Switch between demo roles and personas to see each workspace." },
  "resetConfirm": { "ar": "نعم، أعد ضبط البيانات", "en": "Yes, reset the data" },
  "home.gradeHint": { "ar": "اختر الصف لعرض المواد والدورات المتاحة له.", "en": "Pick a grade to see its subjects and courses." },
  "home.statCourses": { "ar": "دورات منشورة", "en": "Published courses" },
  "home.statTeachers": { "ar": "معلمون بمؤهلات موثّقة", "en": "Teachers with verified credentials" },
  "home.statGrades": { "ar": "صفاً دراسياً", "en": "School grades" },
  "home.subjectCourses": { "ar": "الدورات المنشورة: {count}", "en": "Published courses: {count}" },
  "home.subjectSoon": { "ar": "لا توجد دورات منشورة بعد", "en": "No published courses yet" },
  "home.howEyebrow": { "ar": "كيف تعمل المنصة", "en": "How it works" },
  "home.step4": { "ar": "تابع وتواصل", "en": "Stay connected" },
  "home.step4body": { "ar": "حصص مباشرة وأسئلة الدروس ومتابعة ولي الأمر في مكان واحد.", "en": "Live classes, lesson Q&A and guardian follow-up in one place." },
  "home.chartEyebrow": { "ar": "نظرة على الكتالوج", "en": "Catalog at a glance" },
  "home.chartFallback": { "ar": "إن لم يظهر الرسم البياني، فالأرقام نفسها معروضة في القائمة.", "en": "If the chart does not appear, the same figures are listed here." },
  "home.ctaEyebrow": { "ar": "للمعلمين", "en": "For teachers" },
  "home.collageLesson": { "ar": "درس تجريبي مجاني", "en": "Free preview lesson" },
  "home.collageLive": { "ar": "حصة مباشرة الثلاثاء", "en": "Live class on Tuesday" }
};

Object.assign(dictionary, {
  "p2.sections": {
    "ar": "أقسام الصفحة",
    "en": "Page sections"
  },
  "p2.missing": {
    "ar": "هذه الصفحة غير متاحة",
    "en": "This page is unavailable"
  },
  "p2.missingBody": {
    "ar": "تحقق من الصف والمادة أو استكشف الدورات المنشورة.",
    "en": "Check the grade and subject, or explore published courses."
  },
  "p2.empty": {
    "ar": "لا توجد نتائج مطابقة",
    "en": "No matching results"
  },
  "p2.emptyBody": {
    "ar": "جرّب تغيير المرشحات أو إعادة ضبطها.",
    "en": "Try adjusting or resetting the filters."
  },
  "p2.search": {
    "ar": "بحث",
    "en": "Search"
  },
  "p2.curriculum": {
    "ar": "المنهج",
    "en": "Curriculum"
  },
  "p2.year": {
    "ar": "العام الدراسي",
    "en": "Academic year"
  },
  "p2.grade": {
    "ar": "الصف",
    "en": "Grade"
  },
  "p2.subject": {
    "ar": "المادة / الموضوع",
    "en": "Subject"
  },
  "p2.teacher": {
    "ar": "المعلم",
    "en": "Teacher"
  },
  "p2.semester": {
    "ar": "الفصل الدراسي",
    "en": "Semester"
  },
  "p2.language": {
    "ar": "اللغة",
    "en": "Language"
  },
  "p2.mode": {
    "ar": "نوع الدورة",
    "en": "Format"
  },
  "p2.price": {
    "ar": "مجانية أو مدفوعة",
    "en": "Free or paid"
  },
  "p2.availability": {
    "ar": "التوفر",
    "en": "Availability"
  },
  "p2.max": {
    "ar": "السعر الأقصى (بيسة)",
    "en": "Maximum price (baisa)"
  },
  "p2.ar": {
    "ar": "العربية",
    "en": "Arabic"
  },
  "p2.en": {
    "ar": "الإنجليزية",
    "en": "English"
  },
  "p2.recorded": {
    "ar": "مسجلة",
    "en": "Recorded"
  },
  "p2.live": {
    "ar": "مباشرة",
    "en": "Live"
  },
  "p2.hybrid": {
    "ar": "مدمجة",
    "en": "Hybrid"
  },
  "p2.free": {
    "ar": "مجانية",
    "en": "Free"
  },
  "p2.paid": {
    "ar": "مدفوعة",
    "en": "Paid"
  },
  "p2.preview": {
    "ar": "معاينة",
    "en": "Preview"
  },
  "p2.grades": {
    "ar": "الصفوف",
    "en": "Grades"
  },
  "p2.subjects": {
    "ar": "المواد",
    "en": "Subjects"
  },
  "p2.courses": {
    "ar": "الدورات",
    "en": "Courses"
  },
  "p2.catalogIntro": {
    "ar": "ابدأ بصفك، واختر المادة وطريقة التعلم المناسبة لك.",
    "en": "Start with your grade, then find your subject and learning format."
  },
  "p2.goCourse": {
    "ar": "اذهب إلى الدورة",
    "en": "Go to course"
  },
  "p2.enroll": {
    "ar": "التحق مجاناً",
    "en": "Enroll free"
  },
  "p2.buy": {
    "ar": "اشترِ الدورة",
    "en": "Buy course"
  },
  "p2.prerequisites": {
    "ar": "المتطلبات السابقة",
    "en": "Prerequisites"
  },
  "p2.simulated": {
    "ar": "مشغّل توضيحي متحرك؛ لا يتم بث فيديو حقيقي ولا يُسجّل تقدم دراسي.",
    "en": "Animated demo player; no real video is streamed and no learning progress is recorded."
  },
  "p2.timeline": {
    "ar": "خط المعاينة الزمني",
    "en": "Preview timeline"
  },
  "p2.play": {
    "ar": "تشغيل",
    "en": "Play"
  },
  "p2.pause": {
    "ar": "إيقاف مؤقت",
    "en": "Pause"
  },
  "p2.captions": {
    "ar": "إظهار / إخفاء الترجمة",
    "en": "Toggle captions"
  },
  "p2.transcript": {
    "ar": "النص المكتوب",
    "en": "Transcript"
  },
  "p2.lockedBody": {
    "ar": "هذا الدرس مقفل. اشترِ الدورة أو التحق بالدورة المجانية للوصول إلى المحتوى من مساحة الطالب. المعاينة لا تنشئ التحاقاً.",
    "en": "This lesson is locked. Purchase the course or enroll in a free course to access content in the student workspace. Previewing does not enroll you."
  },
  "p2.noLive": {
    "ar": "هذه الدورة لا تتضمن حصصاً مباشرة معلنة حالياً.",
    "en": "No live sessions are currently announced for this course."
  },
  "p2.accessBody": {
    "ar": "الوصول مرتبط بالطالب حتى نهاية الفترة الموضحة. الدورات المجانية تتطلب التحاقاً لتتبع التقدم.",
    "en": "Access belongs to the enrolled learner until the date shown. Free courses require enrollment to track progress."
  },
  "p2.reviewsBody": {
    "ar": "التقييمات معطّلة حتى اعتماد سياسة المراجعات. لا توجد تقييمات أو مراجعات تجريبية مصطنعة.",
    "en": "Reviews are disabled until the review policy is approved. No ratings or reviews have been invented."
  },
  "p2.lapsed": {
    "ar": "انتهى الوصول السابق أو أُلغي. راجع المساعدة لاستعادة الوصول أو تابع الشراء.",
    "en": "Previous access expired or was revoked. Contact help for recovery or continue to purchase."
  },
  "p2.overview": {
    "ar": "نظرة عامة",
    "en": "Overview"
  },
  "p2.outcomes": {
    "ar": "مخرجات التعلم",
    "en": "Learning outcomes"
  },
  "p2.syllabus": {
    "ar": "محتوى الدورة",
    "en": "Syllabus"
  },
  "p2.schedule": {
    "ar": "الجدول",
    "en": "Schedule"
  },
  "p2.access": {
    "ar": "السعر والوصول",
    "en": "Pricing and access"
  },
  "p2.reviews": {
    "ar": "التقييمات",
    "en": "Reviews"
  },
  "p2.about": {
    "ar": "نبذة",
    "en": "About"
  },
  "p2.teacherIntro": {
    "ar": "تعرف على المعلمين ومؤهلاتهم الموثقة ودوراتهم المنشورة.",
    "en": "Meet teachers, their verified qualifications and published courses."
  },
  "p2.becomeIntro": {
    "ar": "شارك خبرتك مع طلبة عُمان ضمن صفوف ومواد واضحة.",
    "en": "Share your expertise with Omani learners through clear grade and subject pathways."
  },
  "p2.benefits": {
    "ar": "علّم بأسلوبك",
    "en": "Teach your way"
  },
  "p2.benefitsBody": {
    "ar": "اجمع الدروس المسجلة والحصص المباشرة والأنشطة في مساحة تعلم واحدة.",
    "en": "Bring recorded lessons, live sessions and activities together in one learning space."
  },
  "p2.process": {
    "ar": "خطوات الانضمام",
    "en": "How to join"
  },
  "p2.processBody": {
    "ar": "أكمل بياناتك، وحدد الصفوف والمواد، ثم قدّم المؤهلات للمراجعة. الاعتماد يسبق نشر الدورات.",
    "en": "Complete your identity, choose grade-subject pairs and submit credentials for review. Approval comes before course publication."
  },
  "p2.checklist": {
    "ar": "جهّز طلبك",
    "en": "Prepare your application"
  },
  "p2.checklistBody": {
    "ar": "نبذة تعليمية، بريد تجريبي، مؤهل مناسب لكل صف ومادة، وأسماء ملفات المستندات التجريبية.",
    "en": "Prepare a teaching bio, demo email, qualifications for each grade and subject, and synthetic document filenames."
  },
  "p2.applyTitle": {
    "ar": "ابدأ طلب التدريس",
    "en": "Start a teacher application"
  },
  "p2.policyNotice": {
    "ar": "مسودة سياسة غير معتمدة. المحتوى توضيحي للمناقشة ولا يمثل شروطاً قانونية نهائية.",
    "en": "Unapproved policy draft. This content supports discussion and does not represent final legal terms."
  },
  "p2.privacyTitle": {
    "ar": "البيانات في هذا النموذج",
    "en": "Data in this prototype"
  },
  "p2.privacyBody": {
    "ar": "كل السجلات اصطناعية. التغييرات مؤقتة وتُحذف عند إعادة تحميل الصفحة. تُحفظ تفضيلات اللغة والمظهر والدور فقط. سياسة حفظ بيانات الطلبة والموافقات والإفصاح في المنتج النهائي لم تُعتمد بعد.",
    "en": "All records are synthetic. Changes are temporary and reset on reload. Only language, theme and role preferences persist. Production retention, learner consent and disclosure policies remain unapproved."
  },
  "p2.termsTitle": {
    "ar": "استخدام التجربة",
    "en": "Using the demo"
  },
  "p2.termsBody": {
    "ar": "هذا تصور تفاعلي، وليس خدمة تعليمية فعلية أو عقد شراء. الهوية والتسجيل والدفع محاكاة. شروط الحسابات وحقوق المحتوى وإدارة الوصول تحتاج إلى اعتماد قبل الإطلاق.",
    "en": "This is an interactive concept, not a live education service or purchase contract. Identity, registration and payment are simulated. Account terms, content rights and access rules require approval before launch."
  },
  "p2.refundsTitle": {
    "ar": "طلب المساعدة بشأن الاسترداد",
    "en": "Getting refund help"
  },
  "p2.refundsBody": {
    "ar": "لا تُجرى مدفوعات حقيقية هنا. مدة الاسترداد وشروط الأهلية لم تُعتمد. استخدم نموذج المساعدة لمناقشة الطلب؛ إرسال الطلب لا يضمن الاسترداد ولا يغيّر الوصول تلقائياً.",
    "en": "No real payments occur here. Refund windows and eligibility are undecided. Use the help form to discuss a request; submitting does not guarantee a refund or automatically change access."
  },
  "p2.faq": {
    "ar": "الأسئلة الشائعة",
    "en": "FAQ"
  },
  "p2.contact": {
    "ar": "التواصل",
    "en": "Contact"
  },
  "p2.helpIntro": {
    "ar": "إجابات واضحة ومساعدة في الحسابات والدورات.",
    "en": "Clear answers and help with accounts and courses."
  },
  "p2.email": {
    "ar": "البريد الإلكتروني",
    "en": "Email"
  },
  "p2.password": {
    "ar": "كلمة مرور تجريبية",
    "en": "Demo password"
  },
  "p2.passwordHint": {
    "ar": "أدخل أي نص تجريبي؛ لا تستخدم كلمة مرور حقيقية. لا تُحفظ كلمات المرور.",
    "en": "Use any demo text, never a real password. Passwords are not stored."
  },
  "p2.topic": {
    "ar": "التصنيف",
    "en": "Topic"
  },
  "p2.body": {
    "ar": "الرسالة",
    "en": "Message"
  },
  "p2.account": {
    "ar": "الحساب",
    "en": "Account"
  },
  "p2.course": {
    "ar": "الدورة",
    "en": "Course"
  },
  "p2.payment": {
    "ar": "الدفع",
    "en": "Payment"
  },
  "p2.other": {
    "ar": "أخرى",
    "en": "Other"
  },
  "p2.send": {
    "ar": "إرسال",
    "en": "Send"
  },
  "p2.ticketDone": {
    "ar": "أُنشئت تذكرة دعم تجريبية لحسابك.",
    "en": "A demo support ticket was created for your account."
  },
  "p2.anonymousDone": {
    "ar": "تمت محاكاة استلام رسالتك. لم يُنشأ حساب أو تذكرة محفوظة ولم يُرسل بريد.",
    "en": "Your anonymous message was simulated. No account or stored ticket was created and no email was sent."
  },
  "p2.enrolled": {
    "ar": "تم الالتحاق وتفعيل الوصول المجاني.",
    "en": "Enrolled with complimentary access."
  },
  "p2.authNote": {
    "ar": "تجربة بهويات ثابتة وبيانات اصطناعية؛ لا مصادقة أو حسابات حقيقية.",
    "en": "A demo with fixed personas and synthetic data; no real authentication or accounts."
  },
  "p2.signIn": {
    "ar": "دخول تجريبي",
    "en": "Demo sign in"
  },
  "p2.persona": {
    "ar": "اختر الهوية التجريبية",
    "en": "Choose a demo persona"
  },
  "p2.resetDone": {
    "ar": "تمت محاكاة طلب الاستعادة. لم يُرسل بريد ولم تُغيّر كلمة مرور.",
    "en": "Reset request simulated. No email was sent and no password was changed."
  },
  "p2.registerDone": {
    "ar": "اكتمل نموذج التسجيل التجريبي. تابع باستخدام الهوية الثابتة؛ لم يُنشأ حساب حقيقي.",
    "en": "Demo registration complete. Continue with the fixed persona; no real account was created."
  },
  "p2.continue": {
    "ar": "متابعة بالهوية التجريبية",
    "en": "Continue with demo persona"
  },
  "p2.linkChild": {
    "ar": "ربط طالب",
    "en": "Link a child"
  },
  "p2.name": {
    "ar": "الاسم",
    "en": "Name"
  },
  "p2.choose": {
    "ar": "اختر",
    "en": "Choose"
  },
  "p2.consent": {
    "ar": "أوافق على تجربة البيانات الاصطناعية وشروط الاستخدام التوضيحية.",
    "en": "I agree to the synthetic-data demo and illustrative terms."
  },
  "p2.register": {
    "ar": "تسجيل تجريبي",
    "en": "Demo registration"
  },
  "p2.identity": {
    "ar": "الهوية",
    "en": "Identity"
  },
  "p2.qualifications": {
    "ar": "الصفوف والمواد",
    "en": "Qualifications"
  },
  "p2.credentials": {
    "ar": "المستندات",
    "en": "Credentials"
  },
  "p2.review": {
    "ar": "المراجعة",
    "en": "Review"
  },
  "p2.phone": {
    "ar": "الهاتف (اختياري)",
    "en": "Phone (optional)"
  },
  "p2.bio": {
    "ar": "نبذة تعليمية",
    "en": "Teaching bio"
  },
  "p2.applicationPending": {
    "ar": "هذا طلب المعلم التجريبي T-004. تقديم الطلب لا يمنح اعتماداً أو حق نشر الدورات.",
    "en": "This is demo applicant T-004. Submitting does not grant approval or permission to publish courses."
  },
  "p2.visitorApplication": {
    "ar": "لتعديل الطلب، اختر دور الزائر من إعدادات التجربة.",
    "en": "Choose the visitor role in demo controls to edit this application."
  },
  "p2.applicationLocked": {
    "ar": "الطلب غير قابل للتعديل في حالته الحالية. راجع ملاحظات المراجع.",
    "en": "This application cannot be edited in its current state. Review the moderator feedback."
  },
  "p2.pairHint": {
    "ar": "اختر أكثر من صف ومادة حسب مؤهلاتك (حتى 12 اختياراً).",
    "en": "Select the grade-subject pairs you are qualified to teach (up to 12)."
  },
  "p2.fileHint": {
    "ar": "أسماء ملفات فقط؛ لا تُرفع أو تُقرأ ملفات من جهازك.",
    "en": "Filenames only; no files are uploaded or read from your device."
  },
  "p2.filenameHint": {
    "ar": "مثال: teaching-license.pdf",
    "en": "Example: teaching-license.pdf"
  },
  "p2.credential": {
    "ar": "مستند",
    "en": "Credential"
  },
  "p2.label0": {
    "ar": "اسم المؤهل",
    "en": "Qualification label"
  },
  "p2.label1": {
    "ar": "اسم مؤهل إضافي (اختياري)",
    "en": "Additional qualification label (optional)"
  },
  "p2.file0": {
    "ar": "اسم ملف المؤهل",
    "en": "Credential filename"
  },
  "p2.file1": {
    "ar": "اسم ملف إضافي (اختياري)",
    "en": "Additional filename (optional)"
  },
  "p2.application": {
    "ar": "طلب التدريس",
    "en": "Teacher application"
  },
  "p2.submitApplication": {
    "ar": "تقديم / تحديث الطلب",
    "en": "Submit / update application"
  },
  "p2.next": {
    "ar": "حفظ ومتابعة",
    "en": "Save and continue"
  },
  "p2.applicationDone": {
    "ar": "تم تقديم طلبك للمراجعة.",
    "en": "Your application was submitted for review."
  },
  "error.form": {
    "ar": "راجع الحقول المحددة.",
    "en": "Review the highlighted fields."
  },
  "error.required": {
    "ar": "هذا الحقل مطلوب.",
    "en": "This field is required."
  },
  "error.tooShort": {
    "ar": "أدخل نصاً أطول.",
    "en": "Enter a longer value."
  },
  "error.email": {
    "ar": "أدخل بريداً إلكترونياً صالح الشكل.",
    "en": "Enter an email-shaped address."
  },
  "error.phone": {
    "ar": "تحقق من رقم الهاتف.",
    "en": "Check the phone number."
  },
  "error.bioShort": {
    "ar": "اكتب نبذة من 20 حرفاً على الأقل.",
    "en": "Write a bio of at least 20 characters."
  },
  "error.pairs": {
    "ar": "اختر صفاً ومادة على الأقل.",
    "en": "Select at least one grade-subject pair."
  },
  "error.pairsInvalid": {
    "ar": "اختر حتى 12 زوجاً صالحاً من الصفوف والمواد.",
    "en": "Choose up to 12 valid grade-subject pairs."
  },
  "error.filename": {
    "ar": "استخدم اسم ملف PDF أو PNG أو JPG.",
    "en": "Use a PDF, PNG or JPG filename."
  },
  "error.applicantVisitor": {
    "ar": "اختر دور الزائر لتعديل الطلب.",
    "en": "Choose visitor to edit the application."
  },
  "error.applicationLocked": {
    "ar": "لا يمكن تعديل الطلب في حالته الحالية.",
    "en": "This application is not editable in its current state."
  },
  "error.persona": {
    "ar": "اختر طالباً أو ولي أمر.",
    "en": "Choose student or guardian."
  },
  "error.grade": {
    "ar": "اختر صفاً صالحاً.",
    "en": "Choose a valid grade."
  },
  "error.consent": {
    "ar": "الموافقة مطلوبة للمتابعة.",
    "en": "Consent is required to continue."
  },
  "error.contact": {
    "ar": "أدخل بريداً أو هاتفاً صالحاً.",
    "en": "Enter a valid email or phone."
  },
  "error.applicationIncomplete": {
    "ar": "أكمل خطوات الطلب قبل التقديم.",
    "en": "Complete the application steps before submitting."
  },
  "error.topic": {
    "ar": "اختر تصنيفاً صالحاً.",
    "en": "Choose a valid topic."
  },
  "error.messageShort": {
    "ar": "اكتب رسالة من 10 أحرف على الأقل.",
    "en": "Write a message of at least 10 characters."
  },
  "error.course": {
    "ar": "اختر دورة منشورة.",
    "en": "Choose a published course."
  },
  "error.enrollStudentOnly": {
    "ar": "الالتحاق المجاني يتطلب هوية الطالب.",
    "en": "Free enrollment requires the student persona."
  },
  "error.courseUnavailable": {
    "ar": "الدورة غير متاحة.",
    "en": "The course is unavailable."
  },
  "error.enrollNotFree": {
    "ar": "هذه الدورة تتطلب الشراء.",
    "en": "This course requires purchase."
  },
  "error.enrollmentSuspended": {
    "ar": "الالتحاق موقوف. تواصل مع الدعم.",
    "en": "Enrollment is suspended. Contact support."
  }
});

Object.assign(dictionary, Object.fromEntries([
 ['beneficiary','اختيار الطالب','Select learner'],['review','مراجعة الطلب','Review order'],['payment','الدفع','Payment'],['result','نتيجة الطلب','Order result'],
 ['intro','من اختيار الطالب إلى تفعيل الوصول، خطوة بخطوة.','From choosing a learner to activating access, step by step.'],['steps','خطوات إتمام الطلب الأربع','Four checkout steps'],
 ['buyer','المشتري','Buyer'],['learner','الطالب المستفيد','Learner / beneficiary'],['chooseStudent','اختر طالباً للمتابعة.','Choose a learner to continue.'],['goCourse','الذهاب للدورة','Go to course'],['goChild','متابعة الطالب','View child progress'],
 ['price','السعر','Price'],['discount','الخصم','Discount'],['tax','الضريبة','Tax'],['total','الإجمالي','Total'],['demoInputs','الخصم والضريبة مدخلات تجريبية بقيمة صفر، وليست إقراراً ضريبياً.','Discount and tax are zero demo inputs, not tax claims.'],
 ['already','لدى الطالب وصول ساري بالفعل','Learner already has access'],['alreadyBody','تابع التعلم دون شراء جديد.','Continue learning with existing access.'],['self','أنت المشتري والطالب المستفيد.','You are both buyer and learner.'],['verifiedOnly','تظهر الروابط الموثقة التي تسمح بالشراء فقط.','Only verified children with purchase permission are listed.'],['continue','متابعة إلى المراجعة','Continue to review'],['noChildren','لا يوجد طالب مرتبط بصلاحية شراء موثقة.','No verified child with purchase permission is available.'],['linkChild','ربط طالب','Link a child'],
 ['accessTerms','شروط الوصول التجريبية','Demo access terms'],['accessBody','الوصول حتى نهاية العام الدراسي التوضيحية:','Access until the illustrative academic-year end:'],['freeBody','إجمالي صفر: وصول مجاني دون مزود دفع أو أرباح.','Zero total: complimentary access without a payment provider or earnings.'],['consent','أوافق على شروط الوصول وسياسة الاسترداد التجريبية.','I accept the demo access terms and refund policy.'],['activate','تفعيل الوصول المجاني','Activate complimentary access'],['confirm','تأكيد الطلب والمتابعة للدفع','Confirm order and continue to payment'],
 ['course','الدورة','Course'],['items','عناصر الطلب والمستفيدون','Order items and beneficiaries'],['provider','مزود دفع تجريبي — لا توجد دفعة حقيقية','Demo payment provider — no real payment'],['providerBody','محاكاة داخل المتصفح فقط. اختر النتيجة لاختبار الطلب. لا تُطلب بيانات دفع.','In-browser simulation only. Choose an outcome to test the order. No payment details are needed.'],['outcome','نتيجة المحاكاة','Simulation outcome'],['success','نجاح','Success'],['pending','قيد الانتظار','Pending'],['failure','فشل','Failure'],['initiated','بانتظار تأكيد الدفع','Awaiting payment confirmation'],
 ['pay','دفع تجريبي والعودة للنتيجة','Pay — simulate return to result'],['replay','إعادة إرسال نفس الحدث','Replay same event'],['confirmStay','تأكيد دون إعادة توجيه','Confirm without redirect'],['tamper','إرسال حدث معدّل (مبلغ خاطئ)','Send tampered event (wrong amount)'],['noEvent','لا يوجد حدث سابق لإعادة إرساله.','No previous event to replay.'],['successBody','تم تفعيل الالتحاق والوصول. تابع الطالب أو ابدأ التعلم.','Enrollment and access are activated. Continue to learning or child progress.'],['failureBody','لم يتم تفعيل الوصول. أعد المحاولة بعملية دفع جديدة لنفس الطلب.','No access was activated. Retry with a new payment attempt for this order.'],['pendingBody','لا وصول قبل تأكيد حدث دفع تجريبي. فحص الحالة لا ينفّذ دفعة.','No access until a demo payment event is confirmed. Checking status does not process a payment.'],['historical','طلب سابق','Historical order'],['historicalBody','تُعرض الحالة المحفوظة لهذا الطلب.','This is the stored status of this order.'],
 ['retry','إعادة المحاولة بعملية جديدة','Retry with a new transaction'],['check','فحص الحالة','Check status'],['receipt','إيصال الطلب','Order receipt'],['demoReceipt','إيصال تجريبي — ليس فاتورة ضريبية','Demo receipt — not a tax invoice'],['orderId','رقم الطلب','Order ID'],['date','التاريخ (مسقط)','Date (Asia/Muscat)'],['reference','مرجع عملية الدفع','Transaction reference'],['noPayment','تفعيل مجاني دون عملية دفع','Complimentary activation; no payment transaction'],['print','طباعة الإيصال','Print receipt'],['processed','تمت معالجة الحدث التجريبي.','Demo event processed.'],['checked','تم تحديث العرض من حالة الطلب المحفوظة.','Refreshed from stored order state.'],['invalidCheckout','الإجراء غير متاح في حالة الطلب الحالية.','This action is unavailable for the current checkout state.'],['eventRejected','رُفض الحدث: بيانات غير مطابقة. لم يتغير الطلب.','Event rejected: payment details do not match. The order was not changed.'],
 ['notSelected','لم يتم الاختيار بعد','Not selected yet'],['learnerNote','الوصول والتقدم يخصان الطالب المختار، لا المشتري.','Access and progress belong to the selected learner, not the buyer.'],['linkHint','لا يظهر طالبك؟ الروابط قيد التحقق أو الملغاة لا تسمح بالشراء.','Child not listed? Pending or revoked links cannot be used for purchases.'],['noChildrenBody','اربط طالباً وانتظر التحقق قبل الشراء له.','Link a child and wait for verification before buying for them.'],
 ['demoInput','تجريبي','Demo'],['orderSummary','ملخص الطلب','Order summary'],['changeLearner','تغيير الطالب','Change learner'],['attempt','المحاولة','Attempt'],['attempts','محاولات الدفع','Payment attempts'],['status','الحالة','Status'],['orderStatus','حالة الطلب','Order status'],['paymentStatus','حالة الدفع','Payment status'],
 ['providerName','مزود محايد للمحاكاة','Provider-neutral simulator'],['outcomeHint','تُرسل النتيجة كحدث تجريبي يتم التحقق من مبلغه وعملته وطلبه والطالب المستفيد.','The outcome is sent as a demo event whose amount, currency, order and beneficiary are verified.'],['paidNote','الطلب مسدد. الأحداث الجديدة لا تغيّره ولا تكرر الوصول.','This order is settled. New events neither change it nor duplicate access.'],
 ['tools','أدوات اختبار السلامة','Integrity test tools'],['toolsBody','الإعادة والأحداث المعدّلة تمر بنفس التحقق؛ لا تنشئ وصولاً ثانياً ولا تغيّر طلباً موثقاً.','Replays and tampered events pass the same verification; neither creates a second access nor alters a verified order.'],['toProvider','العودة إلى مزود الدفع التجريبي','Back to demo payment provider'],
 ['freeDone','تم تفعيل وصول مجاني دون مزود دفع أو أرباح.','Complimentary access activated without a payment provider or earnings.'],['switchHint','للتجربة: بدّل إلى شخصية الطالب من زر التبديل لرؤية الدورة مفتوحة.','Demo tip: switch to the student persona from the switcher to see the course unlocked.'],['replayed','الحدث نفسه عولج سابقاً؛ لم يتغير شيء.','Same event already processed; nothing changed.'],['retryFirst','فشلت هذه المحاولة. أعد المحاولة بعملية دفع جديدة أولاً.','This attempt failed. Retry with a new payment transaction first.']
].map(([key,ar,en])=>['p3.'+key,{ar,en}])));
// P4 student portal.
Object.assign(dictionary, Object.fromEntries([
 // errors returned by student reducers
 ['studentOnly','هذا الإجراء متاح لحساب الطالب فقط.','This action is available to the student account only.'],['noAccess','لا تملك وصولاً سارياً لهذه الدورة.','You do not have active access to this course.'],['completeBySubmit','يكتمل هذا الدرس عند تسليم الاختبار أو المهمة فقط.','This lesson completes only when its quiz or task is submitted.'],
 ['attemptLimit','استنفدت عدد المحاولات المسموح بها لهذا الاختبار.','You have used every attempt allowed for this quiz.'],['answerRequired','اختر إجابة.','Choose an answer.'],['answerAll','أجب عن جميع الأسئلة قبل التسليم.','Answer every question before submitting.'],['alreadySubmitted','سلّمت هذه المهمة من قبل.','You have already submitted this task.'],['filename','استخدم اسم ملف TXT أو PDF أو DOCX أو صورة.','Use a TXT, PDF, DOCX or image filename.'],
 ['joinCancelled','أُلغيت هذه الحصة ولا يمكن الانضمام إليها.','This session was cancelled and cannot be joined.'],['joinFailed','تعذر الاتصال بمزود الحصة. لا يمكن الانضمام.','The live provider is unavailable. Joining is not possible.'],['joinClosed','انتهت هذه الحصة ولا يمكن الانضمام إليها.','This session has ended and cannot be joined.'],
 ['lessonInvalid','اختر درساً من هذه الدورة.','Choose a lesson from this course.'],['reasonRequired','اختر سبب البلاغ.','Choose a reason for the report.'],['reportOwn','لا يمكنك الإبلاغ عن رسالتك.','You cannot report your own message.'],['chooseCourseError','اختر دورة لديك وصول ساري إليها.','Choose a course you have active access to.'],
 // shared
 ['muscat','(بتوقيت مسقط)','(Muscat time)'],['muscatNote','جميع الأوقات بتوقيت مسقط.','All times are Muscat time.'],['unknownPerson','غير معروف','Unknown'],['you','أنت','You'],['classmate','زميل في الدورة','Classmate'],
 ['author.teacher','المعلم','Teacher'],['author.assistant','مساعد التدريس','Teaching assistant'],['author.staff','فريق المنصة','Platform staff'],['author.classmate','زميل','Classmate'],['author.self','أنت','You'],
 ['type.video','فيديو','Video'],['type.reading','قراءة','Reading'],['type.quiz','اختبار','Quiz'],['type.assignment','مهمة','Task'],
 ['origin.one_time_purchase','شراء لمرة واحدة','One-time purchase'],['origin.complimentary','التحاق مجاني','Free enrollment'],['origin.admin_grant','منحة من الإدارة','Granted by administration'],['origin.subscription','اشتراك','Subscription'],
 ['kind.worksheet','ورقة عمل','Worksheet'],['kind.pdf','ملخص نصي','Text summary'],['kind.link','رابط','Link'],['kind.lesson_qa','سؤال درس','Lesson question'],['kind.private_support','دعم خاص','Private support'],
 ['browse','تصفح الدورات','Browse courses'],['myCourses','دوراتي','My courses'],['openRoom','فتح غرفة التعلم','Open learning room'],['seeCourse','عرض تفاصيل الدورة','See course details'],['viewCourse','عرض صفحة الدورة','View course page'],['contactSupport','تواصل مع الدعم','Contact support'],
 ['start','ابدأ التعلم','Start learning'],['continue','تابع التعلم','Continue learning'],['resume','استئناف الدرس','Resume lesson'],['review','مراجعة الدورة','Review course'],['buyAgain','اشترِ الدورة مجدداً','Buy again'],['enrollAgain','التحق مجدداً','Enroll again'],['buyNow','عرض الدورة والشراء','View course and buy'],['enrollNow','عرض الدورة والالتحاق','View course and enroll'],
 ['late','متأخر','Late'],['due','الموعد','Due'],['dueOn','التسليم: {date}','Due {date}'],['open','فتح','Open'],['item','العنصر','Item'],['date','التاريخ','Date'],['score','الدرجة','Score'],['feedback','الملاحظات','Feedback'],['course','الدورة','Course'],['subject','الموضوع','Subject'],['question','سؤالك','Your question'],['messages','الرسائل','Messages'],
 // dashboard
 ['welcome','أهلاً {name}','Welcome back, {name}'],['continueLearning','تابع من حيث توقفت','Continue where you left off'],['courseProgress','تقدم الدورة','Course progress'],['resumeAt','توقفت عند {time} ({percent}٪).','You stopped at {time} ({percent}%).'],
 ['noActive','لا توجد دورات نشطة','No active courses'],['noActiveBody','التحق بدورة مجانية أو اشترِ دورة لتبدأ التعلم.','Enroll in a free course or buy one to start learning.'],
 ['activityEyebrow','نشاطك','Your activity'],['activity','النشاط الأسبوعي','Weekly activity'],['activitySub','الدروس المكتملة والتقييمات والحصص المباشرة في آخر أربعة أسابيع','Completed lessons, assessments and live classes over the last four weeks'],['chartFallback','الملخص النصي التالي يعرض نفس بيانات الرسم.','The text summary below lists the same data as the chart.'],
 ['weekEnding','أسبوع {date}','Week to {date}'],['weekCounts','دروس {lessons} · تقييمات {assessments} · مباشر {live}','Lessons {lessons} · Assessments {assessments} · Live {live}'],['series.lessons','دروس مكتملة','Lessons completed'],['series.assessments','تقييمات مسلّمة','Assessments submitted'],['series.live','حصص مباشرة','Live classes'],
 ['dueWork','أعمال مطلوبة','Work due'],['notAttempted','لم يُحاوَل بعد','Not attempted'],['allCaughtUp','لا توجد أعمال معلقة. أحسنت!','You are all caught up. Well done!'],
 ['nextLive','الحصة المباشرة القادمة','Next live class'],['noLive','لا توجد حصة مباشرة قادمة','No upcoming live class'],['noLiveBody','ستظهر هنا الحصص المجدولة لدوراتك.','Scheduled classes for your courses appear here.'],['calendar','الجدول','Calendar'],['joined','تم تسجيل حضورك','Attendance recorded'],
 ['unreadTitle','إشعارات غير مقروءة ({count})','Unread notifications ({count})'],['noUnread','لا توجد إشعارات غير مقروءة.','No unread notifications.'],
 ['statCourses','دورات نشطة','Active courses'],['statLessons','دروس مكتملة','Lessons completed'],['statUnread','إشعارات غير مقروءة','Unread notifications'],['statQuizzes','محاولات الاختبارات','Quiz attempts'],['statSubmissions','مهام مسلّمة','Tasks submitted'],['statLive','حصص حضرتها','Live classes attended'],['statCompleted','دورات مكتملة','Courses completed'],
 ['recommended','مقترحة لصفك: {grade}','Recommended for {grade}'],['noRecommended','لا توجد دورات إضافية منشورة لصفك حالياً.','No other published courses for your grade right now.'],
 // my courses
 ['coursesIntro','تقدمك محسوب من الدروس المكتملة، والوصول من صلاحيات الدورة السارية.','Progress comes from completed lessons; access comes from your current course entitlements.'],['courseTabs','حالة الدورات','Course status'],
 ['tab.active','نشطة','Active'],['tab.completed','مكتملة','Completed'],['tab.expired','منتهية أو ملغاة','Expired or revoked'],
 ['empty.active','لا توجد دورات نشطة','No active courses'],['empty.activeBody','ابحث عن دورة لصفك وابدأ التعلم.','Find a course for your grade and start learning.'],['empty.completed','لم تكمل أي دورة بعد','No completed courses yet'],['empty.completedBody','تظهر الدورة هنا عند إكمال جميع دروسها المنشورة.','A course appears here once all its published lessons are complete.'],['empty.expired','لا توجد دورات منتهية','No expired courses'],['empty.expiredBody','عندما ينتهي وصول دورة سيظهر هنا خيار استعادته.','When access to a course ends, its recovery options appear here.'],
 ['expiredIntro','يبقى سجل تقدمك محفوظاً. اختر طريقة الاستعادة المناسبة لكل دورة.','Your progress history is kept. Choose the recovery option for each course.'],
 ['lessonsDone','{done} من {total} دروس مكتملة','{done} of {total} lessons complete'],['nextUp','الدرس التالي','Next up'],['allDone','أكملت جميع الدروس المنشورة.','You have completed every published lesson.'],
 ['archivedValid','مؤرشفة · وصولك سارٍ حتى {date}','Archived · your access lasts until {date}'],['archived','مؤرشفة','Archived'],
 ['expiredBody','انتهى وصولك في {date}. يمكنك الشراء أو الالتحاق مجدداً من صفحة الدورة.','Your access ended on {date}. You can buy or enroll again from the course page.'],['expiredClosedBody','انتهى وصولك في {date} والدورة غير متاحة حالياً للشراء. تواصل مع الدعم للمساعدة.','Your access ended on {date} and the course is not currently available. Contact support for help.'],['revokedBody','أُلغي وصولك لهذه الدورة (مثلاً بعد استرداد). تواصل مع الدعم إذا كان ذلك غير متوقع.','Your access to this course was revoked (for example after a refund). Contact support if this is unexpected.'],
 // learning room
 ['roomTabs','أقسام غرفة التعلم','Learning room sections'],['room.overview','نظرة عامة','Overview'],['room.lessons','الدروس','Lessons'],['room.resources','الموارد','Resources'],['room.assessments','التقييمات','Assessments'],['room.live','المباشر والتسجيلات','Live and recordings'],['room.qa','الأسئلة','Q&A'],['room.announcements','الإعلانات','Announcements'],
 ['lockedTitle','هذه الدورة مقفلة','This course is locked'],['lockedBody','لا تملك وصولاً لهذه الدورة بعد. اشترِ الدورة أو التحق بها من صفحتها العامة لفتح الدروس.','You do not have access to this course yet. Buy or enroll from its public page to unlock the lessons.'],['lockedNote','لا يُعرض أي محتوى محمي قبل تفعيل الوصول.','No protected content is shown until access is active.'],['expiredTitle','انتهى وصولك لهذه الدورة','Your access to this course has ended'],['revokedTitle','أُلغي وصولك لهذه الدورة','Your access to this course was revoked'],
 ['progressTitle','تقدمك في الدورة','Your course progress'],['modulesProgress','التقدم حسب الوحدة','Progress by module'],['module','الوحدة {n}','Module {n}'],['about','عن الدورة','About this course'],
 ['access','شروط الوصول','Access terms'],['accessStatus','حالة الوصول','Access status'],['origin','مصدر الوصول','Access origin'],['validUntil','سارٍ حتى','Valid until'],['enrolledSince','تاريخ الالتحاق','Enrolled since'],['accessNote','الوصول مرتبط بك كطالب، لا بالمشتري، ويُتحقق منه عند فتح كل درس.','Access belongs to you as the learner, not the buyer, and is checked whenever a lesson opens.'],['archivedNote','أُرشفت هذه الدورة من الكتالوج، ويبقى وصولك سارياً حتى {date}.','This course was archived from the catalog; your access remains valid until {date}.'],
 ['teacher','المعلم','Teacher'],['teacherNote','للأسئلة استخدم قسم الأسئلة في الدورة؛ المحادثات خاضعة للإشراف.','Use the course Q&A for questions; conversations are moderated.'],['askQuestion','اطرح سؤالاً','Ask a question'],
 ['outline','محتوى الدورة','Course outline'],['outlineOpen','عرض محتوى الدورة','Show course outline'],['noLessons','لا توجد دروس منشورة بعد.','No published lessons yet.'],['lessonNav','التنقل بين الدروس','Lesson navigation'],['prevLesson','الدرس السابق','Previous lesson'],['nextLesson','الدرس التالي','Next lesson'],
 ['timeline','الخط الزمني للدرس','Lesson timeline'],['finishDemo','إنهاء الدرس التجريبي','Finish demo lesson'],['videoRule','مشغّل تجريبي: يكتمل الدرس عند بلوغ ٩٠٪ من المدة أو بالضغط على «إنهاء الدرس التجريبي». فتح الصفحة وحده لا يكمله.','Demo player: the lesson completes at 90% of its duration or with “Finish demo lesson”. Opening the page alone never completes it.'],['videoResume','يُستأنف من {time} ({percent}٪). يكتمل الدرس عند ٩٠٪.','Resuming from {time} ({percent}%). The lesson completes at 90%.'],['videoDone','بلغت ٩٠٪ — اكتمل الدرس.','You reached 90% — lesson complete.'],
 ['lessonDone','الدرس مكتمل','Lesson complete'],['lessonDoneBody','اكتمل في {date}.','Completed on {date}.'],['lessonNotes','ملاحظات الدرس','Lesson notes'],['lessonFiles','ملفات الدرس','Lesson files'],['readingRule','اقرأ الدرس ثم سجّله مكتملاً يدوياً.','Read the lesson, then mark it complete yourself.'],['markComplete','تحديد كمكتمل','Mark as complete'],
 ['quizLessonBody','هذا الدرس اختبار قصير. يكتمل عند تسليم إجاباتك.','This lesson is a short quiz. It completes when you submit your answers.'],['assignmentLessonBody','هذا الدرس مهمة تطبيقية. يكتمل عند تسليم عملك.','This lesson is an applied task. It completes when you submit your work.'],['openQuiz','فتح الاختبار','Open quiz'],['openAssignment','فتح المهمة','Open task'],
 ['resourcesNote','الملفات تُنشأ داخل المتصفح كنص تجريبي؛ لا تُرفع أو تُحمّل من خادم.','Files are generated in the browser as demo text; nothing is uploaded or fetched from a server.'],['noResources','لا توجد موارد لهذه الدورة.','No resources for this course.'],['bytes','{count} بايت','{count} bytes'],['fromLesson','من درس: {title}','From lesson: {title}'],['preview','معاينة سريعة','Quick preview'],['download','تنزيل','Download'],['downloaded','تم إنشاء الملف {name}.','Generated {name}.'],
 ['noAssessments','لا توجد تقييمات في هذه الدورة.','No assessments in this course.'],['backToAssessments','العودة إلى التقييمات','Back to assessments'],['quiz','اختبار','Quiz'],['assignment','مهمة','Task'],
 ['passScore','درجة النجاح {score}٪','Pass mark {score}%'],['attemptsUsed','المحاولات {used} من {limit}','Attempts {used} of {limit}'],['attemptsLeft','متبقٍ {count} من {limit} محاولات.','{count} of {limit} attempts left.'],['bestScore','أفضل درجة {score}٪','Best score {score}%'],
 ['submitQuiz','تسليم الإجابات','Submit answers'],['cancelRetry','إلغاء المحاولة','Cancel retry'],['passed','ناجح','Passed'],['notPassed','لم تبلغ درجة النجاح','Below pass mark'],['scoreLine','درجتك {score}٪ ودرجة النجاح {pass}٪.','You scored {score}%; the pass mark is {pass}%.'],
 ['yourAnswer','إجابتك','Your answer'],['correct','صحيحة','Correct'],['incorrect','غير صحيحة','Incorrect'],['correctAnswer','الإجابة الصحيحة','Correct answer'],['retry','أعد المحاولة (متبقٍ {count})','Try again ({count} left)'],['attemptLimitReached','استخدمت جميع المحاولات. تبقى نتيجتك محفوظة.','All attempts used. Your results are kept.'],['attemptHistory','سجل المحاولات','Attempt history'],['attemptN','المحاولة {n}','Attempt {n}'],
 ['instructions','التعليمات','Instructions'],['maxScore','الدرجة القصوى {score}','Max score {score}'],['answer','إجابتك','Your answer'],['answerHint','اكتب ١٠ أحرف على الأقل.','Write at least 10 characters.'],['attachment','ملف مرفق (اختياري)','Attachment (optional)'],['attachmentHint','يُحفظ اسم الملف فقط للمحاكاة؛ لا يتم رفع أي ملف.','Only the filename is kept for the simulation; no file is uploaded.'],
 ['submitAssignment','تسليم المهمة','Submit task'],['yourSubmission','ما سلّمته','Your submission'],['submittedAt','تاريخ التسليم','Submitted'],['lateSubmission','سُلّمت بعد الموعد','Submitted after the due date'],['awaitingResult','بانتظار النتيجة','Awaiting result'],['awaitingResultBody','تظهر الدرجة والملاحظات هنا فقط بعد أن ينشرها المعلم.','Your score and feedback appear here only after the teacher releases them.'],['resultReleased','النتيجة المنشورة','Released result'],
 ['upcoming','القادمة','Upcoming'],['past','السابقة','Past'],['noUpcoming','لا توجد حصص قادمة.','No upcoming sessions.'],['noPast','لا توجد حصص سابقة.','No past sessions.'],
 ['startJoin','بدء الانضمام التجريبي','Start demo join'],['joinNote','محاكاة: ساعة العرض الثابتة لا تمنع الانضمام إلى حصة مجدولة.','Simulated: the fixed demo clock does not block joining a scheduled class.'],['reopenClass','العودة إلى الحصة التجريبية','Return to demo class'],
 ['cancelledReason','أُلغيت هذه الحصة؛ الانضمام غير متاح.','This session was cancelled; joining is unavailable.'],['failedTitle','تعذر الاتصال بالحصة','Session unavailable'],['failedBody','فشل اتصال مزود الحصة التجريبي ولم يُسجَّل أي حضور. تواصل مع الدعم أو انتظر موعداً بديلاً.','The demo live provider failed and no attendance was recorded. Contact support or wait for a replacement time.'],['getHelp','طلب المساعدة','Get help'],
 ['rescheduledNote','تغير موعد هذه الحصة؛ الموعد المعروض هو الموعد الجديد.','This session was rescheduled; the time shown is the new time.'],['attended','حاضر · {time}','Present · {time}'],['absent','غائب','Absent'],
 ['meetingSimTitle','غرفة حصة تجريبية','Simulated class room'],['meetingSim','لا يوجد صوت أو فيديو حقيقي. تم تسجيل حضورك في هذه الحصة.','No real audio or video. Your attendance for this class has been recorded.'],['elapsed','الوقت المنقضي','Elapsed time'],['leaveClass','مغادرة الحصة','Leave class'],
 ['recordings','التسجيلات المنشورة','Published recordings'],['noRecordings','لا توجد تسجيلات منشورة بعد.','No published recordings yet.'],['recordingNote','تسجيل توضيحي متحرك؛ لا يتم بث فيديو حقيقي.','Animated demo recording; no real video is streamed.'],['closeRecording','إغلاق التسجيل','Close recording'],
 ['courseQa','أسئلة الدورة','Course questions'],['qaNote','أسئلة الدروس مرئية لطلاب الدورة دون أسمائهم؛ المحادثات الخاصة تظهر لك فقط.','Lesson questions are visible to course learners without names; private conversations are shown only to you.'],['noQuestions','لا توجد أسئلة بعد. كن أول من يسأل.','No questions yet. Be the first to ask.'],
 ['yourQuestion','سؤالك','Your question'],['classmateQuestion','سؤال من زميل','A classmate asked'],['private','خاص','Private'],['openThread','فتح المحادثة','Open conversation'],['messagesCount','{count} رسائل','{count} messages'],['showAnswers','عرض الرسائل ({count})','Show messages ({count})'],
 ['askTitle','اطرح سؤالاً','Ask a question'],['askNote','يصل سؤالك إلى معلم الدورة وفريقه المعتمد فقط، ويخضع للإشراف.','Your question reaches only the course teacher and their authorized team, and is moderated.'],['lessonOptional','الدرس (اختياري)','Lesson (optional)'],['generalQuestion','سؤال عام عن الدورة','General course question'],['sendQuestion','إرسال السؤال','Send question'],
 ['report','إبلاغ','Report'],['reported','تم الإبلاغ','Reported'],['underReview','قيد المراجعة','Under review'],['reportTitle','الإبلاغ عن رسالة','Report a message'],['reportReason','سبب البلاغ','Reason'],['reportNote','يذهب البلاغ إلى فريق الإشراف والسلامة فقط ولا يُرسل إلى كاتب الرسالة.','Reports go to the moderation and safety team only and are not sent to the author.'],['reportSubmit','إرسال البلاغ','Send report'],
 ['reason.unsafe','محتوى غير آمن','Unsafe content'],['reason.inappropriate','لغة غير لائقة','Inappropriate language'],['reason.privacy','مشاركة معلومات خاصة','Private information shared'],['reason.other','سبب آخر','Other reason'],
 ['noAnnouncements','لا توجد إعلانات بعد.','No announcements yet.'],
 // explore
 ['exploreIntro','نفس كتالوج المنصة، داخل مساحتك. الروابط تفتح صفحة الدورة العامة.','The platform catalog inside your workspace. Links open the public course page.'],['gradeDefault','تُعرض دورات صفك الحالي ({grade}) افتراضياً.','Showing courses for your current grade ({grade}) by default.'],['allGrades','عرض كل الصفوف','Show all grades'],['allGradesNote','تُعرض الدورات لجميع الصفوف. استخدم المرشحات لتضييق النتائج.','Showing courses for all grades. Use the filters to narrow the results.'],['myGradeOnly','صفي فقط ({grade})','My grade only ({grade})'],
 // calendar
 ['calendarView','طريقة العرض','Calendar view'],['weekView','الأسبوع','Week'],['listView','القائمة','List'],['prevWeek','الأسبوع السابق','Previous week'],['thisWeek','الأسبوع الحالي','This week'],['nextWeek','الأسبوع التالي','Next week'],['today','اليوم','Today'],['noEvents','لا شيء','Nothing'],['emptyWeek','لا توجد حصص أو مواعيد تسليم في هذا الأسبوع. جرّب أسبوعاً آخر أو عرض القائمة.','No classes or due dates this week. Try another week or the list view.'],
 // assignments
 ['workIntro','مواعيد التسليم والاختبارات، والنتائج المنشورة فقط.','Due dates, quizzes and released results only.'],['workTabs','أقسام الأعمال','Work sections'],['work.assignments','المهام','Tasks'],['work.quizzes','الاختبارات','Quizzes'],['work.results','النتائج','Results'],
 ['noAssignments','لا توجد مهام في دوراتك النشطة.','No tasks in your active courses.'],['noQuizzes','لا توجد اختبارات في دوراتك النشطة.','No quizzes in your active courses.'],['noResults','لا توجد نتائج منشورة بعد.','No released results yet.'],['attempts','المحاولات','Attempts'],['best','أفضل درجة','Best score'],['kindLabel','النوع','Type'],['releasedOnly','تظهر درجات المهام بعد أن ينشرها المعلم فقط.','Task grades appear only after the teacher releases them.'],
 // messages
 ['messagesIntro','محادثاتك وأسئلتك داخل دوراتك فقط؛ لا توجد رسائل مفتوحة بين المستخدمين.','Your conversations and questions inside your courses only; there is no open user-to-user messaging.'],['msgTabs','أقسام الرسائل','Message sections'],['msg.conversations','كل المحادثات','All conversations'],['msg.questions','أسئلة الدروس','Lesson questions'],
 ['noConversations','لا توجد محادثات','No conversations'],['noConversationsBody','اطرح سؤالاً في إحدى دوراتك ليبدأ النقاش هنا.','Ask a question in one of your courses to start a thread here.'],['newQuestion','سؤال جديد','New question'],['askNeedsCourse','تحتاج إلى وصول ساري لدورة قبل طرح سؤال.','You need active access to a course before asking a question.'],['chooseCourse','اختر دورة','Choose a course'],['courseHint','تظهر فقط الدورات التي لديك وصول ساري إليها.','Only courses you currently have access to are listed.'],
 ['safeTitle','تواصل آمن','Safe communication'],['safeBody','الرسائل مرتبطة بالدورة ويطلع عليها المعلم وفريقه المعتمد والمشرفون فقط. أبلغ عن أي رسالة تقلقك.','Messages are tied to the course and seen only by the teacher, their authorized team and moderators. Report anything that worries you.'],
 ['markResolved','تحديد كمحلول','Mark resolved'],['reply','ردك','Your reply'],['sendReply','إرسال الرد','Send reply'],['reopenHint','الرد على محادثة محلولة يعيد فتحها.','Replying to a resolved conversation reopens it.'],
 // notifications
 ['notificationsIntro','إشعاراتك فقط، مع روابط آمنة داخل المنصة.','Your notifications only, with safe in-platform links.'],['notificationFilter','تصفية الإشعارات','Filter notifications'],['filterAll','الكل','All'],['filterUnread','غير المقروءة','Unread'],['noNotifications','لا توجد إشعارات.','No notifications.'],['unreadChip','غير مقروء','Unread'],['openNotice','فتح','Open'],['markRead','تحديد كمقروء','Mark as read'],['markAllRead','تحديد الكل كمقروء','Mark all as read'],
 // profile
 ['profileIntro','بياناتك التعليمية ونشاطك. البيانات تجريبية.','Your learning details and activity. All data is synthetic.'],['editProfile','تعديل الملف','Edit profile'],['currentGrade','الصف الحالي','Current grade'],['gradeHint','يغيّر الاقتراحات فقط؛ تبقى الالتحاقات والصلاحيات السابقة كما هي.','Changes recommendations only; past enrollments and access stay as they are.'],['interests','الاهتمامات','Interests'],['noInterests','لم تُحدد اهتمامات.','No interests selected.'],['saveProfile','حفظ الملف','Save profile'],
 ['history','سجل الالتحاق','Enrollment history'],['historyNote','يحتفظ كل التحاق بالصف الذي بدأ فيه، حتى بعد تغيير صفك الحالي.','Each enrollment keeps the grade it started in, even after you change your current grade.'],['gradeAtEnrollment','الصف عند الالتحاق','Grade at enrollment'],['noHistory','لا يوجد سجل التحاق.','No enrollment history.'],
 // settings
 ['settingsIntro','تفضيلات تجريبية ومعلومات الخصوصية وروابط أولياء الأمور.','Demo preferences, privacy information and guardian links.'],['settingsTabs','أقسام الإعدادات','Settings sections'],['settings.account','الحساب','Account'],['settings.privacy','الخصوصية','Privacy'],['settings.notifications','الإشعارات','Notifications'],
 ['accountInfo','معلومات الحساب','Account information'],['locale','لغة الحساب','Account language'],['locale.ar','العربية','Arabic'],['locale.en','الإنجليزية','English'],['passwordNote','تغيير كلمة المرور غير متاح في هذا العرض التجريبي؛ لا توجد كلمات مرور حقيقية.','Password changes are not part of this demo; there are no real passwords.'],['displayPrefs','تفضيلات العرض','Display preferences'],
 ['consentTitle','الموافقة والخصوصية','Consent and privacy'],['consentBody','تُستخدم بياناتك التعليمية لتقديم الدروس وتتبع تقدمك فقط. سياسات الخصوصية والاحتفاظ النهائية قيد القرار؛ هذه بيانات اصطناعية.','Your learning data is used only to deliver lessons and track progress. Final privacy and retention policies are pending decisions; this data is synthetic.'],
 ['guardiansTitle','أولياء الأمور المرتبطون','Linked guardians'],['guardiansBody','تُعرض الروابط الموثقة فقط.','Only verified links are shown.'],['noGuardians','لا يوجد ولي أمر موثّق مرتبط بحسابك.','No verified guardian is linked to your account.'],['scopes','الصلاحيات','Permissions'],
 ['scope.progress','التقدم','Progress'],['scope.results','النتائج','Results'],['scope.attendance','الحضور','Attendance'],['scope.purchase','الشراء لك','Purchasing for you'],['guardianLimits','يرى ولي الأمر ملخصات فقط حسب الصلاحيات، ولا يرى رسائلك أو محتوى الدروس المدفوعة.','Guardians see summaries only within these permissions, never your messages or paid lesson content.'],
 ['notifyPrefs','تفضيلات الإشعارات','Notification preferences'],['notifyNote','إعدادات تجريبية؛ البريد الإلكتروني محاكى ولا يُرسل فعلياً.','Demo settings; email is simulated and never actually sent.'],['savePrefs','حفظ التفضيلات','Save preferences'],
 ['pref.in_app','إشعارات داخل المنصة','In-app notifications'],['pref.email_digest','ملخص بريد أسبوعي (محاكى)','Weekly email digest (simulated)'],['pref.live_reminders','تذكير بالحصص المباشرة','Live class reminders'],['pref.qa_replies','الردود على أسئلتي','Replies to my questions'],['pref.results','نشر النتائج','Released results'],
 // toasts
 ['lessonCompleted','تم تسجيل الدرس كمكتمل.','Lesson marked complete.'],['quizSubmitted','تم تسليم الاختبار.','Quiz submitted.'],['assignmentSubmitted','تم تسليم المهمة.','Task submitted.'],['replySent','تم إرسال ردك.','Reply sent.'],['resolved','تم تحديد المحادثة كمحلولة.','Conversation marked resolved.'],
 ['reportSent','تم إرسال البلاغ إلى فريق السلامة.','Report sent to the safety team.'],['alreadyReported','سبق أن أبلغت عن هذه الرسالة.','You already reported this message.'],['allRead','تم تحديد جميع الإشعارات كمقروءة.','All notifications marked as read.'],['profileSaved','تم حفظ الملف. لم تتغير الالتحاقات السابقة.','Profile saved. Past enrollments are unchanged.'],['prefsSaved','تم حفظ التفضيلات التجريبية.','Demo preferences saved.']
].map(([key,ar,en])=>['p4.'+key,{ar,en}])));

// P5 guardian portal.
Object.assign(dictionary, Object.fromEntries([
 // dashboard
 ['welcome','مرحباً {name}','Welcome, {name}'],['dashIntro','ملخص هادئ لتعلم أبنائك الموثّقين','A calm overview of your verified children’s learning'],['linkChild','ربط طالب','Link a child'],['exploreCta','شراء دورة','Buy a course'],
 ['noChildren','لا يوجد أبناء موثّقون بعد','No verified children yet'],['noChildrenBody','أرسل رمز الدعوة لطالب، وبعد تحقق فريق الإشراف تظهر ملخصاته هنا.','Send a learner’s invitation code; once moderation verifies it, their summaries appear here.'],
 ['allChildren','كل الأبناء','All children'],['childSwitcher','اختيار الطالب','Choose a child'],['statChildren','أبناء موثّقون','Verified children'],['statCourses','دورات نشطة','Active courses'],['statUnread','إشعارات غير مقروءة','Unread notifications'],
 ['upcoming','الأنشطة القادمة','Upcoming activity'],['noUpcoming','لا توجد حصص أو مهام قادمة.','No upcoming classes or tasks.'],['dueWork','مهمة مستحقة','Task due'],
 ['recentPurchases','آخر مشترياتك','Your recent purchases'],['noOrders','لا توجد طلبات بعد.','No orders yet.'],['receipt','الإيصال','Receipt'],['result','نتيجة الدفع','Payment result'],['completePayment','إكمال الدفع','Complete payment'],['retryPayment','إعادة محاولة الدفع','Retry payment'],
 ['requestsCount','{count} من طلبات الربط غير مفعّلة','{count} link requests are not active'],
 ['overallProgress','التقدم العام','Overall progress'],['activeCourses','دورات نشطة','Active courses'],['lessonsComplete','دروس مكتملة','Lessons complete'],['nextLive','الحصة المباشرة القادمة','Next live class'],['noLive','لا توجد حصص مباشرة قادمة.','No upcoming live classes.'],['latestResult','آخر نتيجة منشورة','Latest released result'],['noResults','لا توجد نتائج منشورة بعد.','No released results yet.'],
 ['openChild','متابعة {name}','Follow {name}'],['buyFor','شراء لـ{name}','Buy for {name}'],['enrollFor','تسجيل {name} مجاناً','Enroll {name} free'],
 // children + requests
 ['childrenIntro','الأبناء الموثّقون وحالة طلبات الربط الخاصة بك.','Your verified children and the status of your link requests.'],['verifiedChildren','الأبناء الموثّقون','Verified children'],['verifiedOn','موثّق منذ {date}','Verified {date}'],
 ['requestsTitle','طلبات الربط','Link requests'],['requestsNote','تعرض الطلبات غير الموثّقة حالتها فقط؛ لا تظهر أي بيانات أو تقدم للطالب قبل التحقق.','Unverified requests show their status only; no learner details or progress appear before verification.'],
 ['request','الطلب','Request'],['relationship','صلة القرابة','Relationship'],['requestedOn','تاريخ الطلب','Requested'],['newRequest','إرسال طلب جديد','Send a new request'],['awaitingModeration','بانتظار فريق الإشراف','Awaiting moderation'],['noRequests','لا توجد طلبات معلّقة أو مرفوضة أو ملغاة.','No pending, rejected or revoked requests.'],
 // link form
 ['linkIntro','اربط حسابك بطالب عبر رمز دعوة، ثم ينتظر الطلب تحقق فريق الإشراف.','Link a learner with an invitation code; the request then waits for moderation.'],['linkFormTitle','طلب ربط جديد','New link request'],['linkFormIntro','لا يمنح الطلب أي وصول فوري؛ يتحقق فريق الإشراف من الأدلة التجريبية أولاً.','A request never grants instant access; moderation checks the synthetic evidence first.'],
 ['code','رمز الدعوة','Invitation code'],['codeHint','رمز بأحرف وأرقام لاتينية تصدره المدرسة أو الطالب. رمز العرض التجريبي: OMAN-S003','A Latin letters-and-digits code issued by the school or learner. Demo code: OMAN-S003'],
 ['chooseRelationship','اختر صلة القرابة','Choose the relationship'],['rel.mother','أم','Mother'],['rel.father','أب','Father'],['rel.grandparent','جد أو جدة','Grandparent'],['rel.aunt','خالة أو عمة','Aunt'],['rel.uncle','خال أو عم','Uncle'],['rel.other','ولي أمر آخر','Other guardian'],
 ['consent','أؤكد أنني ولي أمر هذا الطالب أو مخوّل بمتابعته، وأوافق على مراجعة الأدلة التجريبية.','I confirm I am this learner’s guardian or authorized to follow them, and I agree to the synthetic evidence review.'],['submitLink','إرسال طلب الربط','Send link request'],['backToChildren','العودة إلى أبنائي','Back to my children'],
 ['howTitle','كيف يتم التحقق؟','How verification works'],['how1','أدخل رمز الدعوة','Enter the invitation code'],['how1Body','يُستخدم الرمز فقط؛ لا يوجد بحث بالأسماء.','Only the code is used; there is no name search.'],['how2','مراجعة الإشراف','Moderation review'],['how2Body','يطابق فريق الإشراف الأدلة التجريبية مع الطالب.','Moderators match the synthetic evidence with the learner.'],['how3','متابعة بالصلاحيات','Follow within permissions'],['how3Body','بعد التوثيق تظهر ملخصات التقدم والنتائج والحضور حسب الصلاحيات.','Once verified, progress, results and attendance summaries appear per permission.'],
 ['noNameSearch','حماية للطلاب: لا يمكن العثور على طالب بالاسم، ولا يتم أي ربط دون تحقق.','Learner safeguarding: learners cannot be found by name and nothing links without verification.'],
 ['pendingTitle','الطلب بانتظار التحقق','Request awaiting verification'],['createdBody','أُنشئ الطلب {id} وأُرسل لفريق الإشراف.','Request {id} was created and sent to moderation.'],['reusedBody','لديك طلب قائم {id} لهذا الطالب؛ أعدنا استخدامه دون إنشاء طلب مكرر.','You already have request {id} for this learner; it was reused without creating a duplicate.'],
 ['alreadyLinked','هذا الطالب مرتبط بحسابك','This learner is already linked'],['alreadyLinkedBody','الرابط {id} موثّق مسبقاً؛ لا حاجة لطلب جديد.','Link {id} is already verified; no new request is needed.'],
 ['evidence','الأدلة المرفقة','Evidence'],['synthetic','مرجع تجريبي','synthetic reference'],['noAccessYet','لا وصول قبل التحقق','No access before verification'],['noAccessYetBody','لن تظهر ملخصات الطالب أو إمكانية الشراء له حتى يتحقق فريق الإشراف.','The learner’s summaries and buying for them stay unavailable until moderation verifies the request.'],
 ['linkAnother','ربط طالب آخر','Link another learner'],['createdToast','أُرسل طلب الربط للتحقق.','Link request sent for verification.'],['reusedToast','أُعيد استخدام طلبك القائم؛ ما زال بانتظار التحقق.','Your existing request was reused; it is still awaiting verification.'],
 ['codeInvalid','رمز الدعوة غير صحيح. تحقق من الرمز وأعد المحاولة.','The invitation code is not valid. Check it and try again.'],['relationshipRequired','اختر صلة القرابة.','Choose the relationship.'],['guardianOnly','هذا الإجراء متاح لولي الأمر فقط.','This action is for guardians only.'],['notVerified','هذا الرابط غير موثّق.','This link is not verified.'],['invalidTransition','لا يمكن تغيير حالة هذا الطلب.','This request cannot change state.'],
 // child dashboard
 ['childTabs','أقسام متابعة الطالب','Child sections'],['tab.courses','الدورات والتقدم','Courses and progress'],['tab.results','المهام والنتائج','Tasks and results'],['tab.live','الحصص المباشرة','Live classes'],['tab.activity','الحضور والنشاط','Attendance and activity'],
 ['scopes','الصلاحيات','Permissions'],['scope.progress','التقدم','Progress'],['scope.results','النتائج','Results'],['scope.attendance','الحضور','Attendance'],['scope.purchase','الشراء','Purchasing'],['scopeOff','{scope}: غير مفعّل','{scope}: off'],
 ['scopeMissing','صلاحية «{scope}» غير مفعّلة لهذا الرابط','The “{scope}” permission is not part of this link'],['scopeMissingBody','يمكنك طلب تعديل الصلاحيات ليراجعه فريق الإشراف.','You can request a permission change for moderation to review.'],['managePermissions','إدارة الصلاحيات','Manage permissions'],
 ['summaryOnly','ملخصات فقط: لا محتوى دروس مدفوعة ولا رسائل خاصة.','Summaries only: no paid lesson content and no private messages.'],['noPurchaseScope','الشراء غير مفعّل لهذا الرابط.','Purchasing is off for this link.'],
 ['noCourses','لا توجد دورات نشطة','No active courses'],['noCoursesBody','عند تفعيل دورة لهذا الطالب يظهر تقدمه هنا.','When a course is activated for this learner, progress appears here.'],['courseDone','اكتملت كل الدروس.','All lessons complete.'],['lastActivity','آخر نشاط','Last activity'],['none','لا يوجد','None'],['accessUntil','الوصول حتى {date}','Access until {date}'],
 ['releasedOnly','تظهر الدرجات بعد أن ينشرها المعلم فقط، دون نص التسليم.','Scores appear only after the teacher releases them, without the submission text.'],['releasedResults','النتائج المنشورة','Released results'],['item','العنصر','Item'],['kind','النوع','Type'],['date','التاريخ','Date'],
 ['tasksStatus','حالة المهام','Task status'],['noTasks','لا توجد مهام في الدورات النشطة.','No tasks in active courses.'],['quizSummary','الاختبارات القصيرة','Quizzes'],['noQuizzes','لم تُحل اختبارات بعد.','No quizzes attempted yet.'],['attempts','المحاولات','Attempts'],['bestScore','أفضل درجة','Best score'],['passed','ناجح','Passed'],['notPassed','لم يجتز بعد','Not passed yet'],
 ['upcomingLive','الحصص القادمة','Upcoming classes'],['attendanceHistory','سجل الحضور','Attendance history'],['session','الحصة','Class'],['attendance','الحضور','Attendance'],['present','حضور','Present'],['minutes','الدقائق','Minutes'],['noAttendance','لا يوجد سجل حضور بعد.','No attendance records yet.'],['attendedChip','تم الحضور','Attended'],['noJoin','الانضمام متاح للطالب فقط.','Only the learner can join.'],
 ['activityEyebrow','آخر أربعة أسابيع','Last four weeks'],['activitySub','نشاط {name} الأسبوعي المحسوب من سجلاته','{name}’s weekly activity, counted from their records'],['lessonsFourWeeks','دروس في أربعة أسابيع','Lessons in four weeks'],['liveHidden','بيانات الحضور غير مشمولة لأن صلاحية الحضور غير مفعّلة.','Attendance data is excluded because the attendance permission is off.'],
 // explore
 ['exploreIntro','اختر الطالب أولاً، ثم الدورة؛ يبقى تأكيد المستفيد صريحاً عند الدفع.','Choose the child first, then a course; the learner is still confirmed explicitly at checkout.'],['pickChild','لمن تشتري؟','Who are you buying for?'],['pickChildHint','يظهر فقط الأبناء الموثّقون مع صلاحية الشراء.','Only verified children with the purchasing permission appear.'],
 ['childUnavailable','هذا الطالب غير متاح للشراء. اختر من القائمة.','That learner is not available for purchase. Choose from the list.'],['chooseFirst','اختر طالباً لتظهر أزرار الشراء الخاصة به.','Choose a child to show buy buttons for them.'],['buyingFor','تشتري الآن لـ{name}.','You are buying for {name}.'],
 ['gradePreset','تُعرض دورات {grade} المناسبة لـ{name}.','Showing {grade} courses for {name}.'],['allGrades','كل الصفوف','All grades'],['allGradesNote','تُعرض كل الصفوف.','Showing all grades.'],['childGradeOnly','صف الطالب فقط ({grade})','Child’s grade only ({grade})'],
 ['noPurchaseChildren','لا يوجد طالب متاح للشراء','No child available for purchase'],['noPurchaseChildrenBody','الشراء ممكن فقط لطالب موثّق مع صلاحية الشراء.','Purchases are possible only for a verified child with the purchasing permission.'],
 // orders
 ['ordersIntro','طلباتك أنت فقط مع الإيصالات وحالة الدفع.','Your own orders only, with receipts and payment status.'],['ordersCaption','طلباتي','My orders'],['order','الطلب','Order'],['courseChild','الدورة والطالب','Course and learner'],['total','الإجمالي','Total'],
 ['needsAction','{count} طلبات تحتاج إجراء','{count} orders need action'],['needsActionBody','أكمل الدفع المعلّق أو أعد محاولة الدفع الفاشل من صفحة الدفع التجريبي.','Complete pending payments or retry failed ones from the demo payment page.'],['receiptsKept','تبقى إيصالاتك متاحة حتى لو تغيّر رابط الطالب لاحقاً.','Your receipts stay available even if a learner link changes later.'],
 // notifications
 ['notificationsIntro','إشعاراتك فقط: ملخصات الأبناء الموثّقين والمدفوعات.','Your notifications only: verified children summaries and payments.'],['notificationFilter','تصفية الإشعارات','Filter notifications'],
 // support
 ['supportIntro','تذاكرك مع فريق الدعم.','Your tickets with the support team.'],['myTickets','تذاكري','My tickets'],['noTickets','لا توجد تذاكر','No tickets'],['noTicketsBody','أرسل سؤالك وسيرد فريق الدعم هنا.','Send your question and support will reply here.'],['repliesCount','{count} ردود','{count} replies'],
 ['newTicket','تذكرة جديدة','New ticket'],['message','الرسالة','Message'],['sendTicket','إرسال التذكرة','Send ticket'],['ticketCreated','أُنشئت التذكرة {id}.','Ticket {id} created.'],['ticketRef','تذكرة {id}','Ticket {id}'],
 ['supportScopeTitle','ما يمكن للدعم رؤيته','What support can see'],['supportScope','تتعلق التذاكر بحسابك؛ لا يكشف الدعم محادثات طفلك الخاصة.','Tickets concern your account; support never exposes your child’s private conversations.'],
 ['thread','المحادثة','Thread'],['you','أنت','You'],['supportTeam','فريق الدعم','Support team'],['resolution','الحل','Resolution'],['reply','ردك','Your reply'],['sendReply','إرسال الرد','Send reply'],['reopenHint','الرد على تذكرة محلولة يعيد فتحها.','Replying to a resolved ticket reopens it.'],['allTickets','كل التذاكر','All tickets'],['replySent','تم إرسال ردك.','Reply sent.'],
 // settings
 ['settingsIntro','الحساب وصلاحيات الربط والإشعارات.','Account, link permissions and notifications.'],['settingsTabs','أقسام الإعدادات','Settings sections'],['settings.account','الحساب','Account'],['settings.links','صلاحيات الربط','Link permissions'],['settings.notifications','الإشعارات','Notifications'],['role','الدور','Role'],
 ['linksIntro','لكل رابط موثّق صلاحيات محددة. أي تعديل يُراجع من فريق الإشراف، والإلغاء فوري.','Each verified link has set permissions. Changes are reviewed by moderation; revoking is immediate.'],['otherRequests','{count} طلبات غير موثّقة تظهر حالتها في','{count} unverified requests show their status in'],
 ['requestScope','طلب تعديل الصلاحيات','Request permission change'],['scopeTitle','تعديل صلاحيات {name}','Change permissions for {name}'],['scopeReview','يُرسل الطلب لفريق الإشراف؛ تبقى الصلاحيات الحالية سارية حتى الموافقة.','The request goes to moderation; current permissions stay in force until approved.'],['sendScopeRequest','إرسال الطلب','Send request'],
 ['scopesRequired','اختر صلاحية واحدة على الأقل.','Choose at least one permission.'],['scopesUnchanged','لم تتغير الصلاحيات المختارة.','The selected permissions have not changed.'],['scopeRequested','أُرسل طلب تعديل الصلاحيات للمراجعة.','Permission change sent for review.'],
 ['scopePendingTitle','طلب تعديل قيد المراجعة','Change request under review'],['scopePending','الصلاحيات المطلوبة: {scopes} · منذ {date}','Requested permissions: {scopes} · since {date}'],
 ['revoke','إلغاء الربط','Revoke link'],['revokeTitle','إلغاء ربط {name}','Revoke link with {name}'],['revokeWarnTitle','إجراء فوري','Immediate effect'],['revokeWarn','سيختفي {name} فوراً من لوحتك ومن قائمة الشراء، ولن تتمكن من فتح ملخصاته.','{name} disappears immediately from your dashboard and purchase list, and their summaries can no longer be opened.'],
 ['revokeAfter','تبقى إيصالاتك السابقة. لإعادة الربط يلزم طلب جديد وتحقق جديد.','Your past receipts remain. Restoring the link needs a new request and new verification.'],['confirmRevoke','نعم، ألغِ ربط {name}','Yes, revoke {name}'],['cancel','إلغاء','Cancel'],['revoked','تم إلغاء الربط.','Link revoked.'],
 ['notifyPrefs','تفضيلات الإشعارات','Notification preferences'],['notifyNote','إعدادات تجريبية؛ البريد الإلكتروني محاكى ولا يُرسل فعلياً.','Demo settings; email is simulated and never actually sent.'],['savePrefs','حفظ التفضيلات','Save preferences'],
 ['pref.in_app','إشعارات داخل المنصة','In-app notifications'],['pref.email_digest','ملخص بريد أسبوعي (محاكى)','Weekly email digest (simulated)'],['pref.weekly_summary','ملخص تقدم الأبناء','Children progress summary'],['pref.payments','الدفع والإيصالات','Payments and receipts'],['pref.live_reminders','تذكير بالحصص المباشرة','Live class reminders'],
].map(([key,ar,en])=>['p5.'+key,{ar,en}])));

// P6 teacher portal
Object.assign(dictionary, Object.fromEntries([
 // errors returned by teacher reducers
 ['teacherOnly','هذا الإجراء متاح لحساب المعلم المعتمد فقط.','This action is available to the approved teacher account only.'],['lockedInReview','الدورة قيد المراجعة؛ لا يمكن تعديلها حتى يصدر القرار.','The course is in review; it cannot be edited until a decision is made.'],['lockedArchived','الدورة مؤرشفة ولا تقبل تعديلات جديدة.','The course is archived and accepts no new changes.'],
 ['notQualified','اختر صفاً ومادة من مؤهلاتك الموثقة فقط.','Choose a grade and subject from your verified qualifications only.'],['versionInvalid','اختر إصدار منهج مفعلاً.','Choose an active curriculum version.'],['versionMismatch','هذا الصف والمادة لا يتبعان إصدار المنهج المختار.','This grade and subject do not belong to the chosen curriculum version.'],['semesterMismatch','الفصل الدراسي لا يتبع العام المختار.','The semester does not belong to the chosen year.'],
 ['bilingualPair','أكمل النص باللغتين أو اترك الحقلين فارغين.','Complete both languages or leave both fields empty.'],['pricePositive','أدخل سعراً موجباً بالريال العُماني بثلاث خانات عشرية كحد أقصى.','Enter a positive OMR price with at most three decimals.'],['endFuture','اختر تاريخ انتهاء بعد تاريخ العرض.','Choose an end date after the demo date.'],['saveFirst','احفظ هوية الدورة وتصنيفها أولاً.','Save the course identity and classification first.'],
 ['invalidTransition','لا يسمح بهذا الانتقال من الحالة الحالية.','This transition is not allowed from the current state.'],['checklistIncomplete','أكمل البنود المطلوبة في قائمة المراجعة قبل الإرسال.','Complete the required checklist items before submitting.'],['durationRange','المدة بين ١ و١٨٠ دقيقة.','Duration must be between 1 and 180 minutes.'],['cannotMove','لا يمكن نقل الدرس أبعد من ذلك داخل الوحدة.','The lesson cannot move further within its module.'],
 ['passRange','درجة النجاح بين ٠ و١٠٠.','Pass score must be between 0 and 100.'],['choicesRequired','أدخل الخيارات الثلاثة.','Enter all three choices.'],['correctRequired','حدد الإجابة الصحيحة.','Mark the correct answer.'],['dueFuture','اختر موعد تسليم بعد تاريخ العرض.','Choose a due date after the demo date.'],['maxRange','الدرجة القصوى بين ١ و١٠٠.','Maximum score must be between 1 and 100.'],
 ['resourceFileInvalid','استخدم اسم ملف TXT أو PDF.','Use a TXT or PDF filename.'],['alreadyReleased','نُشرت النتيجة ولا يمكن تعديلها.','The result is released and can no longer be changed.'],['scoreRange','أدخل درجة صحيحة ضمن الحد الأقصى.','Enter a whole score within the maximum.'],['gradeFirst','صحّح التسليم قبل نشر النتيجة.','Grade the submission before releasing the result.'],
 ['startFuture','اختر موعداً بعد تاريخ العرض.','Choose a time after the demo date.'],['durationLive','مدة الحصة بين ١٥ و١٨٠ دقيقة.','Class length must be between 15 and 180 minutes.'],['recordingFileInvalid','استخدم اسم ملف فيديو MP4 أو MOV أو WEBM.','Use an MP4, MOV or WEBM video filename.'],['recordingNotReady','التسجيل لم يجهز بعد للنشر.','The recording is not ready to publish yet.'],
 ['assigneeInvalid','اختر عضواً نشطاً يملك صلاحية الرد في هذه الدورة.','Choose an active member with reply access on this course.'],['ownerOnly','مالك الدورة فقط يعالج المحادثات المصعّدة.','Only the course owner handles escalated conversations.'],['syntheticEmail','استخدم بريداً تجريبياً ينتهي بـ example.test@.','Use a synthetic address ending in @example.test.'],
 ['alreadyMember','هذا الشخص عضو أو مدعو في فريقك بالفعل.','This person is already a member or invitee of your team.'],['notInvitable','لا يمكن دعوة هذا الحساب لفريق تدريس.','This account cannot be invited to a teaching team.'],['memberNotActive','يمكن منح الصلاحيات للأعضاء النشطين فقط.','Access can be granted to active members only.'],
 ['accountRefInvalid','أدخل أربعة أرقام تجريبية فقط.','Enter four synthetic digits only.'],['alreadyQualified','هذا المؤهل موثّق لديك بالفعل.','You already hold this verified qualification.'],
 // dashboard
 ['welcome','أهلاً أ. {name}','Welcome, {name}'],['dashIntro','دوراتك وطلابك ومستحقاتك في مكان واحد','Your courses, learners and payables in one place'],['createCourse','إنشاء دورة','Create course'],['allCourses','جميع الدورات','All courses'],
 ['feedbackAlert','ملاحظات المراجعة على «{title}»','Review feedback on “{title}”'],['feedbackNone','طُلبت تعديلات دون نص إضافي.','Changes were requested without extra text.'],['fixCourse','مراجعة وتعديل','Review and fix'],
 ['statCourses','الدورات المملوكة','Owned courses'],['statPublished','منشورة','Published'],['statReview','قيد المراجعة','In review'],['statDrafts','مسودات وتعديلات','Drafts and changes'],['statLearners','طلاب بوصول ساري','Learners with active access'],
 ['byStatus','الدورات حسب الحالة','Courses by status'],['inboxQueue','قائمة الوارد','Inbox queue'],['queueClear','لا توجد أسئلة مفتوحة أو مصعّدة الآن.','No open or escalated questions right now.'],
 ['salesPayables','المبيعات والمستحقات','Sales and payables'],['openEarnings','التفاصيل','Details'],['ledgerNote','الأرصدة مشتقة من قيود دفتر الأستاذ؛ ليست محفظة نقدية.','Balances are derived from ledger entries; this is not a cash wallet.'],
 ['money.gross','إجمالي المبيعات','Gross sales'],['money.commission','عمولة المنصة','Platform commission'],['money.pending','مستحق معلّق','Pending payable'],['money.available','متاح للصرف','Available payable'],['money.reserved','محجوز','Reserved'],['money.paid','مدفوع','Paid out'],
 ['activityEyebrow','آخر أربعة أسابيع','Last four weeks'],['activityTitle','المبيعات ونشاط الطلاب','Sales and learner activity'],['activitySub','مبيعات الدورات والدروس المكتملة والأسئلة الجديدة أسبوعياً','Weekly course sales, completed lessons and new questions'],
 ['weekEnding','أسبوع ينتهي {date}','Week ending {date}'],['weekCounts','{sales} مبيعات · {lessons} دروس · {questions} أسئلة','{sales} sales · {lessons} lessons · {questions} questions'],
 ['series.sales','المبيعات','Sales'],['series.lessons','دروس مكتملة','Lessons completed'],['series.questions','أسئلة جديدة','New questions'],
 ['upcomingLive','الحصص القادمة','Upcoming classes'],['noUpcoming','لا توجد حصص قادمة مجدولة.','No upcoming classes scheduled.'],
 // courses
 ['coursesIntro','كل دوراتك بجميع حالات النشر، مع ملاحظات المراجعة.','All your courses in every publication state, with review feedback.'],['statusFilter','تصفية حسب الحالة','Filter by status'],['viewToggle','طريقة العرض','View'],['view.cards','بطاقات','Cards'],['view.table','جدول','Table'],
 ['noCourses','لا توجد دورات بهذه الحالة','No courses in this state'],['noCoursesBody','أنشئ دورة جديدة من مؤهلاتك الموثقة.','Create a new course from your verified qualifications.'],['coursesCaption','دوراتي التعليمية','My teaching courses'],
 ['cardMeta','{learners} طلاب · {lessons} دروس منشورة','{learners} learners · {lessons} published lessons'],['workspace','مساحة الدورة','Workspace'],['edit','تحرير','Edit'],['course','الدورة','Course'],['learners','الطلاب','Learners'],['price','السعر','Price'],
 ['feedbackChip','ملاحظات المراجعة','Review feedback'],['revision.Draft','تعديل معلّق','Pending revision'],['revision.Submitted','تعديل قيد المراجعة','Revision in review'],['revision.ChangesRequested','تعديلات مطلوبة على التحديث','Revision changes requested'],
 // wizard
 ['newCourse','دورة جديدة','New course'],['newIntro','سبع خطوات من الهوية إلى الإرسال للمراجعة.','Seven steps from identity to review submission.'],['newNote','تُنشأ المسودة برقم جديد عند حفظ الهوية والتصنيف الأكاديمي.','The draft gets its own ID once identity and academic classification are saved.'],
 ['openWorkspace','فتح مساحة الدورة','Open workspace'],['publicPage','الصفحة العامة','Public page'],['wizardSteps','خطوات إعداد الدورة','Course setup steps'],
 ['step.identity','الهوية','Identity'],['step.academics','التصنيف الأكاديمي','Academics'],['step.content','المحتوى','Content'],['step.assessments','التقييمات','Assessments'],['step.live','الحصص المباشرة','Live classes'],['step.access','الوصول والسعر','Access and price'],['step.review','المراجعة والإرسال','Review and submit'],
 ['stepState.done','مكتملة','Complete'],['stepState.todo','لم تكتمل','To do'],['stepState.attention','تحتاج انتباهاً','Needs attention'],['stepState.locked','احفظ المسودة أولاً','Save draft first'],['stepState.current','الخطوة الحالية','Current step'],
 ['saveBar','إجراءات الحفظ','Save actions'],['saveDraft','حفظ المسودة','Save draft'],['saveContinue','حفظ ومتابعة','Save and continue'],['back','السابق','Back'],['continueTo','متابعة إلى {step}','Continue to {step}'],
 ['notSavedYet','لم تُحفظ الدورة بعد','Course not saved yet'],['savesToDraft','يُحفظ التعديل في المسودة مباشرة','Changes save directly to the draft'],['savesToRevision','يُحفظ التعديل كتحديث معلّق؛ تبقى النسخة المنشورة ظاهرة','Changes save as a pending revision; the published version stays live'],['autoSaved','تُحفظ إضافات هذه الخطوة فور تنفيذها','Changes in this step save as you make them'],
 ['saveFirstTitle','احفظ المسودة أولاً','Save the draft first'],['saveFirstBody','أكمل الهوية والتصنيف الأكاديمي لإنشاء المسودة، ثم أضف المحتوى.','Complete identity and academics to create the draft, then add content.'],['lockedTitle','التعديل غير متاح','Editing unavailable'],
 ['revisionTitle','تعديل دورة منشورة','Editing a published course'],['revisionBody','تُحفظ تغييرات البيانات كتحديث معلّق، ويبقى الطلاب والزوار على النسخة المعتمدة حتى موافقة المراجعة.','Metadata changes are saved as a pending revision; learners and visitors keep the approved version until review approves it.'],
 ['feedbackTitle','ملاحظات فريق المراجعة','Review team feedback'],
 ['identityTitle','هوية الدورة','Course identity'],['identityIntro','العنوان والملخص والوصف مطلوبة بالعربية والإنجليزية؛ اكتب كل لغة كما تريد أن تظهر.','Title, summary and description are required in Arabic and English; write each language as it should appear.'],
 ['optionalTitle','المخرجات والمتطلبات','Outcomes and prerequisites'],['optionalIntro','اختيارية، لكن إن أضفت لغة فأضف الأخرى.','Optional, but if you add one language add the other.'],
 ['field.title.ar','العنوان بالعربية','Title (Arabic)'],['field.title.en','العنوان بالإنجليزية','Title (English)'],['field.summary.ar','الملخص بالعربية','Summary (Arabic)'],['field.summary.en','الملخص بالإنجليزية','Summary (English)'],
 ['field.description.ar','الوصف بالعربية','Description (Arabic)'],['field.description.en','الوصف بالإنجليزية','Description (English)'],['field.outcomes.ar','مخرجات التعلم بالعربية','Learning outcomes (Arabic)'],['field.outcomes.en','مخرجات التعلم بالإنجليزية','Learning outcomes (English)'],
 ['field.prerequisites.ar','المتطلبات السابقة بالعربية','Prerequisites (Arabic)'],['field.prerequisites.en','المتطلبات السابقة بالإنجليزية','Prerequisites (English)'],
 ['academicsTitle','التصنيف الأكاديمي','Academic classification'],['qualifiedOnly','مؤهلاتك الموثقة فقط','Your verified qualifications only'],['qualifiedOnlyBody','تظهر {count} أزواج صف ومادة موثقة لك؛ أي تصنيف آخر يُرفض عند الحفظ والمراجعة.','{count} verified grade–subject pairs are listed; any other classification is rejected on save and review.'],
 ['field.curriculum_version_id','إصدار المنهج','Curriculum version'],['field.grade_subject_id','الصف والمادة','Grade and subject'],['field.academic_year_id','العام الدراسي','Academic year'],['field.semester_id','الفصل الدراسي','Semester'],['field.language','لغة التدريس','Teaching language'],['field.mode','نمط الدورة','Course format'],
 ['versionHint','الإصدارات غير المفعلة للعرض فقط.','Inactive versions are shown for reference only.'],['pairHint','لا يمكنك اختيار صف أو مادة خارج مؤهلاتك.','You cannot choose a grade or subject outside your qualifications.'],['choosePair','اختر الصف والمادة','Choose grade and subject'],['inactive','غير مفعل','inactive'],
 ['lang.ar','العربية','Arabic'],['lang.en','الإنجليزية','English'],['requestMore','تحتاج صفاً أو مادة أخرى؟ اطلب تحديث مؤهلاتك.','Need another grade or subject? Request a qualification update.'],
 ['outlineNote','رتّب الدروس بالأسهم، وحدد درس معاينة مجانياً، واختر حالة النشر لكل درس.','Reorder lessons with the arrows, mark a free preview lesson and choose each lesson’s publish state.'],['noModules','لا توجد وحدات بعد','No modules yet'],
 ['moduleN','الوحدة {n}','Module {n}'],['lessonCount','{count} دروس','{count} lessons'],['noLessonsYet','لا توجد دروس في هذه الوحدة بعد.','No lessons in this module yet.'],['addLessonTo','إضافة درس إلى الوحدة {n}','Add a lesson to module {n}'],['addLesson','إضافة الدرس','Add lesson'],['addModule','إضافة وحدة','Add module'],
 ['moveUp','نقل «{title}» للأعلى','Move “{title}” up'],['moveDown','نقل «{title}» للأسفل','Move “{title}” down'],['cannotMoveHint','الدرس في طرف الوحدة.','The lesson is at the edge of its module.'],
 ['previewOn','معاينة مجانية','Free preview'],['previewMake','جعله معاينة','Make preview'],['previewOff','إلغاء المعاينة','Remove preview'],
 ['type.video','فيديو','Video'],['type.reading','قراءة','Reading'],['type.quiz','اختبار قصير','Quiz'],['type.assignment','مهمة','Assignment'],
 ['field.lessonTitle.ar','عنوان الدرس بالعربية','Lesson title (Arabic)'],['field.lessonTitle.en','عنوان الدرس بالإنجليزية','Lesson title (English)'],['field.moduleTitle.ar','عنوان الوحدة بالعربية','Module title (Arabic)'],['field.moduleTitle.en','عنوان الوحدة بالإنجليزية','Module title (English)'],
 ['lessonType','نوع الدرس','Lesson type'],['durationMinutes','المدة بالدقائق','Duration (minutes)'],['publishState','حالة النشر','Publish state'],['publishStateHint','الدروس «الجاهزة» تُنشر عند اعتماد الدورة.','“Ready” lessons publish when the course is approved.'],
 ['previewField','درس معاينة مجاني','Free preview lesson'],['previewHint','يظهر للزوار دون تسجيل.','Visible to visitors without enrolling.'],['lessonBody','محتوى الدرس','Lesson content'],['assessmentLessonNote','يُدار محتوى هذا الدرس من خطوة التقييمات.','This lesson’s content is managed in the assessments step.'],
 ['editLesson','تحرير «{title}»','Edit “{title}”'],['saveLesson','حفظ الدرس','Save lesson'],['cancel','إلغاء','Cancel'],
 ['noAssessments','لا توجد تقييمات بعد','No assessments yet'],['noAssessmentsBody','أضف اختباراً قصيراً أو مهمة لتتبع فهم الطلاب.','Add a quiz or assignment to track understanding.'],['assessmentNote','ينشئ كل تقييم درساً في الوحدة المختارة بحالة «جاهز».','Each assessment creates a lesson in the chosen module in the “ready” state.'],
 ['createQuiz','إنشاء اختبار قصير','Create quiz'],['createAssignment','إنشاء مهمة','Create assignment'],['quizTitle','عنوان الاختبار','Quiz title'],['module','الوحدة','Module'],['passScore','درجة النجاح ٪','Pass score %'],
 ['questionN','السؤال {n}','Question {n}'],['optional','اختياري','optional'],['questionPrompt','نص السؤال','Question text'],['choiceN','الخيار {letter}','Choice {letter}'],['correctChoice','الإجابة الصحيحة','Correct answer'],['quizNote','يُسمح بمحاولتين لكل طالب، وتحفظ لقطة الأسئلة مع كل محاولة.','Learners get two attempts; a question snapshot is kept with every attempt.'],
 ['editQuiz','تحرير الاختبار','Edit quiz'],['quizEditNote','تعديل الأسئلة لا يغيّر محاولات الطلاب السابقة.','Editing never changes learners’ past attempts.'],['saveChanges','حفظ التغييرات','Save changes'],
 ['assignmentTitle','عنوان المهمة','Assignment title'],['instructions','التعليمات','Instructions'],['dueDate','موعد التسليم','Due date'],['maxScore','الدرجة القصوى','Maximum score'],['editAssignment','تحرير المهمة','Edit assignment'],
 ['questionsCount','{count} أسئلة','{count} questions'],['passAt','النجاح عند {score}٪','Pass at {score}%'],['attemptsCount','{count} محاولات','{count} attempts'],['dueOn','التسليم {date}','Due {date}'],['outOf','من {score}','Out of {score}'],['submissionsCount','{count} تسليمات','{count} submissions'],
 ['accessTitle','الوصول والسعر','Access and price'],['priceType','نوع السعر','Price type'],['paid','مدفوعة','Paid'],['priceOmr','السعر (ر.ع.)','Price (OMR)'],['priceHint','مثال: 25.000 — حتى ثلاث خانات عشرية.','Example: 25.000 — up to three decimals.'],
 ['accessPolicy','مدة الوصول','Access policy'],['accessYear','حتى نهاية العام الدراسي (شروط تجريبية)','Until the end of the academic year (demo terms)'],['accessFixed','حتى تاريخ محدد','Until a fixed date'],['accessEnd','تاريخ انتهاء الوصول','Access end date'],['accessEndHint','مطلوب فقط عند اختيار تاريخ محدد.','Only needed for a fixed date.'],
 ['policyOpenTitle','سياسة غير معتمدة','Policy not decided'],['policyOpen','العمولة والاسترداد ومدة الوصول الفعلية قرارات مفتوحة؛ هذه قيم تجريبية فقط.','Commission, refunds and production access duration are open decisions; these are demo values only.'],
 ['checklistTitle','قائمة المراجعة','Review checklist'],['checklistIntro','البنود المطلوبة تمنع الإرسال حتى تكتمل؛ البنود الإرشادية تساعد على جودة الدورة.','Required items block submission until complete; advisory items help course quality.'],
 ['check.identity','هوية ثنائية اللغة','Bilingual identity'],['check.identityOk','العنوان والملخص والوصف مكتملة باللغتين.','Title, summary and description are complete in both languages.'],['check.identityTodo','أكمل العنوان والملخص والوصف بالعربية والإنجليزية.','Complete title, summary and description in Arabic and English.'],
 ['check.academics','تصنيف ضمن المؤهلات','Classification within qualifications'],['check.academicsOk','الصف والمادة ضمن مؤهلاتك الموثقة ومنهج مفعل.','Grade and subject are within your verified qualifications and an active curriculum.'],['check.academicsTodo','اختر صفاً ومادة من مؤهلاتك الموثقة وفصلاً صحيحاً.','Choose a grade and subject from your verified qualifications and a valid semester.'],
 ['check.owner','مالك معتمد ونشط','Approved, active owner'],['check.ownerOk','أنت المالك الوحيد المسؤول عن الدورة.','You are the single accountable owner.'],['check.ownerTodo','حساب المالك غير معتمد أو غير نشط.','The owner account is not approved or not active.'],
 ['check.access','سعر وشروط وصول صالحة','Valid price and access terms'],['check.accessOk','السعر وشروط الوصول صالحة.','Price and access terms are valid.'],['check.accessTodo','الدورة المدفوعة تحتاج سعراً موجباً، والوصول يحتاج تاريخ انتهاء مستقبلياً.','Paid courses need a positive price, and access needs a future end date.'],
 ['check.content','محتوى جاهز للنشر','Content ready to publish'],['check.contentOk','يوجد درس واحد على الأقل جاهز أو منشور.','At least one lesson is ready or published.'],['check.contentTodo','اجعل درساً واحداً على الأقل «جاهزاً».','Mark at least one lesson as “ready”.'],
 ['check.preview','درس معاينة','Preview lesson'],['check.previewOk','يوجد درس معاينة مجاني.','A free preview lesson exists.'],['check.previewTodo','بند إرشادي للنموذج: أضف درس معاينة ليجرب الزوار الدورة.','Prototype advisory: add a preview lesson so visitors can sample the course.'],
 ['check.assessments','تقييم واحد على الأقل','At least one assessment'],['check.assessmentsOk','يوجد اختبار أو مهمة.','A quiz or assignment exists.'],['check.assessmentsTodo','إرشادي: أضف اختباراً أو مهمة.','Advisory: add a quiz or assignment.'],
 ['check.live','حصص مباشرة مجدولة','Live classes scheduled'],['check.liveOk','لا يحتاج النمط حصصاً أو توجد حصة مجدولة.','No live classes needed, or one is scheduled.'],['check.liveTodo','إرشادي: الدورات المباشرة والمدمجة تحتاج حصة مجدولة.','Advisory: live and hybrid courses should have a scheduled class.'],
 ['checkPassed','مكتمل','Complete'],['checkRequired','مطلوب للإرسال','Required to submit'],['checkAdvisory','إرشادي','Advisory'],['goToStep','الانتقال إلى {step}','Go to {step}'],
 ['publishTitle','النشر والحالة','Publishing and status'],['cardPreview','معاينة بطاقة الكتالوج','Catalog card preview'],['publicKeepsSnapshot','يعرض الكتالوج النسخة المعتمدة حتى الموافقة على التحديث.','The catalog shows the approved version until the revision is approved.'],
 ['submitReview','إرسال للمراجعة','Submit for review'],['resubmit','إعادة الإرسال للمراجعة','Resubmit for review'],['submitRevision','إرسال التحديث للمراجعة','Submit revision for review'],['startRevision','بدء تحديث للنسخة المنشورة','Start a revision'],['fixBlocking','أكمل البنود المطلوبة في قائمة المراجعة أولاً.','Complete the required checklist items first.'],
 ['inReviewTitle','قيد المراجعة','In review'],['inReviewBody','يراجع فريق الإشراف الدورة؛ سيصلك إشعار بالقرار.','Moderation is reviewing the course; you will be notified of the decision.'],['revisionInReview','التحديث قيد المراجعة','Revision in review'],['revisionInReviewBody','تبقى النسخة المنشورة ظاهرة حتى قرار المراجعة.','The published version stays live until review decides.'],
 ['statusHelp.Draft','مسودة خاصة بك؛ أكمل القائمة ثم أرسلها للمراجعة.','A private draft; complete the checklist, then submit for review.'],['statusHelp.Submitted','مرسلة للمراجعة ومقفلة للتعديل مؤقتاً.','Submitted for review and temporarily locked.'],['statusHelp.ChangesRequested','طلب فريق المراجعة تعديلات؛ عدّل ثم أعد الإرسال.','Review requested changes; edit and resubmit.'],
 ['statusHelp.Published','منشورة في الكتالوج؛ تعديلات البيانات تصبح تحديثاً معلّقاً.','Live in the catalog; metadata edits become a pending revision.'],['statusHelp.Unpublished','غير منشورة؛ إعادة النشر تتطلب موافقة الإشراف.','Not public; republishing needs moderation approval.'],['statusHelp.Archived','مؤرشفة؛ يحتفظ الطلاب الحاليون بوصولهم الساري.','Archived; existing learners keep valid access.'],
 ['created','أُنشئت المسودة {id}.','Draft {id} created.'],['draftStep','حُفظت الخطوة؛ أكمل الخطوة التالية لإنشاء المسودة.','Step saved; complete the next step to create the draft.'],['saved','حُفظت التغييرات.','Changes saved.'],['submitted','أُرسلت الدورة للمراجعة.','Course submitted for review.'],['revisionStarted','بدأ تحديث معلّق للدورة المنشورة.','A pending revision was started.'],
 // workspace
 ['editCourse','تحرير الدورة','Edit course'],['wsTabs','أقسام مساحة الدورة','Course workspace sections'],['ws.details','التفاصيل والنشر','Details'],['ws.lessons','الدروس','Lessons'],['ws.resources','الموارد والتقييمات','Resources'],['ws.live','المباشر والتسجيلات','Live'],['ws.learners','الطلاب','Learners'],['ws.questions','الأسئلة والإعلانات','Questions'],['ws.analytics','التحليلات','Analytics'],
 ['requestUnpublish','طلب إلغاء النشر','Request unpublish'],['unpublishTitle','طلب إلغاء نشر «{title}»','Request to unpublish “{title}”'],['unpublishNote','يقرر فريق الإشراف؛ يحتفظ الطلاب الحاليون بوصولهم الساري.','Moderation decides; existing learners keep their valid access.'],['reason','السبب','Reason'],['sendRequest','إرسال الطلب','Send request'],['unpublishRequested','طلب إلغاء النشر مرسل','Unpublish requested'],['unpublishSent','أُرسل طلب إلغاء النشر.','Unpublish request sent.'],
 ['revisionFields','الحقول المعدلة: {fields}','Changed fields: {fields}'],['none','لا شيء','None'],
 ['fieldName.title','العنوان','Title'],['fieldName.summary','الملخص','Summary'],['fieldName.description','الوصف','Description'],['fieldName.outcomes','المخرجات','Outcomes'],['fieldName.prerequisites','المتطلبات','Prerequisites'],['fieldName.grade_subject_id','الصف والمادة','Grade and subject'],['fieldName.academic_year_id','العام الدراسي','Academic year'],
 ['fieldName.semester_id','الفصل الدراسي','Semester'],['fieldName.track_id','المسار','Track'],['fieldName.language','اللغة','Language'],['fieldName.mode','النمط','Format'],['fieldName.price_type','نوع السعر','Price type'],['fieldName.price_baisa','السعر','Price'],['fieldName.access_policy','مدة الوصول','Access policy'],
 ['facts','بيانات الدورة','Course facts'],['gradeSubject','الصف والمادة','Grade and subject'],['periodLabel','العام والفصل','Year and semester'],['accessUntil','الوصول حتى','Access until'],['owner','المالك المسؤول','Accountable owner'],
 ['courseTeam','فريق هذه الدورة','This course’s team'],['noTeam','لا يوجد أعضاء بصلاحيات على هذه الدورة.','No team members hold access to this course.'],['manageTeam','إدارة الصلاحيات','Manage access'],['history','سجل المراجعة والنشر','Review and publishing history'],['noHistory','لا توجد أحداث مسجلة بعد.','No recorded events yet.'],['system','النظام','System'],
 ['audit.course.create','إنشاء المسودة','Draft created'],['audit.course.start_revision','بدء تحديث معلّق','Pending revision started'],['audit.course.submit','إرسال للمراجعة','Submitted for review'],['audit.course.approve','اعتماد ونشر','Approved and published'],['audit.course.request_changes','طلب تعديلات','Changes requested'],
 ['audit.course.request_unpublish','طلب إلغاء النشر','Unpublish requested'],['audit.course.unpublish','إلغاء النشر','Unpublished'],['audit.course.archive','أرشفة','Archived'],['audit.conversation.assign','إسناد','Assigned'],['audit.conversation.note','ملاحظة داخلية','Internal note'],['audit.conversation.status','تغيير الحالة','Status changed'],['audit.conversation.report','بلاغ سلامة','Safety report'],
 ['gradingQueue','قائمة التصحيح','Grading queue'],['gradingNote','الدرجات تبقى خاصة حتى «نشر النتيجة»؛ عندها يرى الطالب درجته ويصله إشعار.','Grades stay private until “Release result”; then the learner sees the score and is notified.'],['noSubmissions','لا توجد تسليمات بعد.','No submissions yet.'],
 ['scoreOutOf','الدرجة من {max}','Score out of {max}'],['feedback','ملاحظات للطالب','Feedback for the learner'],['saveGrade','حفظ الدرجة','Save grade'],['updateGrade','تحديث الدرجة','Update grade'],['releaseResult','نشر النتيجة للطالب','Release result to learner'],['releaseNote','يصل الطالب إشعار واحد.','The learner gets one notification.'],['releasedOn','نُشرت {date}','Released {date}'],
 ['graded','حُفظت الدرجة (غير منشورة بعد).','Grade saved (not released yet).'],['released','نُشرت النتيجة وأُبلغ الطالب.','Result released and learner notified.'],
 ['resources','الموارد','Resources'],['noResources','لا توجد موارد مرفقة.','No attached resources.'],['addResource','إضافة مورد','Add resource'],['lesson','الدرس','Lesson'],['chooseLesson','اختر درساً','Choose a lesson'],['resourceKind','نوع المورد','Resource type'],['resourceTitle','عنوان المورد','Resource title'],
 ['resourceFile','اسم الملف','Filename'],['resourceFileHint','اسم ملف تجريبي فقط (TXT أو PDF)؛ يُولَّد الملف داخل المتصفح.','Synthetic filename only (TXT or PDF); the file is generated in the browser.'],['resourceBody','نص المورد','Resource text'],['resourceAdded','أُضيف المورد.','Resource added.'],['assessments','التقييمات','Assessments'],
 ['quizCreated','أُنشئ الاختبار كدرس جاهز.','Quiz created as a ready lesson.'],['assignmentCreated','أُنشئت المهمة كدرس جاهز.','Assignment created as a ready lesson.'],['lessonAdded','أُضيف الدرس.','Lesson added.'],['lessonSaved','حُفظ الدرس.','Lesson saved.'],['moduleAdded','أُضيفت الوحدة.','Module added.'],['previewUpdated','حُدّثت المعاينة.','Preview updated.'],
 ['sessions','الحصص','Sessions'],['recordingFlow','بعد انتهاء الحصة: ارفع تسجيلاً تجريبياً ← قيد التجهيز ← جاهز (دون إشعار) ← نشر (إشعار واحد للطلاب).','After a class ends: upload a demo recording → processing → ready (no alert) → publish (one alert to learners).'],['noSessions','لا توجد حصص لهذه الدورة.','No sessions for this course.'],
 ['scheduleTitle','جدولة حصة مباشرة','Schedule a live class'],['scheduleNote','يصل إشعار واحد لكل طالب بوصول ساري في الدورة.','Each learner with active access receives exactly one notification.'],['sessionTitle','عنوان الحصة','Session title'],['startsAt','موعد البدء','Start time'],['muscatHint','بتوقيت مسقط.','Muscat time.'],['scheduleSession','جدولة الحصة','Schedule session'],['chooseCourse','اختر دورة','Choose a course'],
 ['attendedCount','{count} حضور مسجل','{count} attendees recorded'],['generation','الموعد رقم {n}','Timing version {n}'],['reschedule','تغيير الموعد','Reschedule'],['retrySession','إعادة الجدولة بعد التعذر','Retry with a new time'],['newTime','الموعد الجديد','New time'],['confirmMove','تأكيد الموعد الجديد','Confirm new time'],
 ['cancelSession','إلغاء الحصة','Cancel session'],['cancelTitle','إلغاء «{title}»','Cancel “{title}”'],['cancelWarnTitle','سيُبلغ الطلاب','Learners will be notified'],['cancelWarn','يتعطل زر الانضمام فوراً ويصل إشعار واحد لكل طالب مسجل. لا يمكن التراجع.','Joining is disabled immediately and each enrolled learner gets one notice. This cannot be undone.'],['confirmCancel','نعم، ألغِ الحصة','Yes, cancel the session'],['keepSession','إبقاء الحصة','Keep session'],
 ['inProgress','الحصة جارية الآن','Class in progress'],['recordingFile','اسم ملف التسجيل','Recording filename'],['recordingFileHint','اسم ملف تجريبي فقط؛ لا يُرفع أي ملف.','Synthetic filename only; nothing is uploaded.'],['uploadRecording','رفع تسجيل تجريبي','Upload demo recording'],
 ['processingBody','التسجيل قيد التجهيز (محاكاة). لا يراه الطلاب ولا يصلهم إشعار.','The recording is processing (simulated). Learners cannot see it and get no alert.'],['finishProcessing','إنهاء التجهيز (محاكاة)','Finish processing (demo)'],['readyBody','التسجيل جاهز لكنه غير ظاهر للطلاب حتى النشر.','The recording is ready but hidden from learners until published.'],['publishRecording','نشر التسجيل للطلاب','Publish recording'],['publishedOn','منشور {date}','Published {date}'],
 ['cancelledNote','أُلغيت الحصة وأُبلغ الطلاب؛ الانضمام معطل.','Cancelled and learners notified; joining is disabled.'],['failedTitle','تعذر الاتصال بمزود الحصص','Live provider unavailable'],['failedBody','لم تُسجل أي حضور. أعد جدولة الحصة أو تواصل مع الدعم.','No attendance was recorded. Reschedule the class or contact support.'],
 ['scheduled','جُدولت الحصة وأُبلغ الطلاب.','Session scheduled and learners notified.'],['rescheduled','تغير الموعد وأُبلغ الطلاب.','Session moved and learners notified.'],['sessionCancelled','أُلغيت الحصة.','Session cancelled.'],['uploaded','رُفع التسجيل وهو قيد التجهيز.','Recording uploaded and processing.'],['recordingReady','التسجيل جاهز (لا إشعارات).','Recording ready (no alerts sent).'],['recordingPublished','نُشر التسجيل وأُبلغ الطلاب.','Recording published and learners notified.'],['alreadyPublished','التسجيل منشور بالفعل؛ لم تُرسل إشعارات مكررة.','Already published; no duplicate alerts sent.'],
 ['learnersNote','طلاب هذه الدورة فقط، بلا بيانات أولياء الأمور.','Learners of this course only, without guardian data.'],['learner','الطالب','Learner'],['access','الوصول','Access'],['lastActivity','آخر نشاط','Last activity'],['learnersCaption','طلاب الدورة','Course learners'],['openRecord','عرض السجل','Open record'],['noLearners','لا يوجد طلاب مسجلون','No enrolled learners'],
 ['courseQuestions','أسئلة الدورة','Course questions'],['courseQuestionsNote','افتح المحادثة للرد أو الإسناد أو إضافة ملاحظة داخلية.','Open a conversation to reply, assign or add an internal note.'],['noQuestions','لا توجد أسئلة بعد.','No questions yet.'],['assignedTo','مسند إلى {name}','Assigned to {name}'],
 ['announcements','الإعلانات','Announcements'],['postAnnouncement','نشر إعلان','Post an announcement'],['announceNote','يصل إشعار واحد لكل طالب بوصول ساري ({count} الآن).','Each learner with active access gets one notice ({count} now).'],['announcementTitle','عنوان الإعلان','Announcement title'],['announcementBody','نص الإعلان','Announcement text'],['publishAnnouncement','نشر الإعلان','Publish announcement'],['announced','نُشر الإعلان.','Announcement published.'],
 ['analyticsNote','أرقام هذه الدورة فقط، محسوبة من سجلات التقدم.','Figures for this course only, computed from progress records.'],['activeLearners','طلاب بوصول ساري','Learners with active access'],['avgProgress','متوسط التقدم','Average progress'],['questionsAsked','الأسئلة','Questions'],['quizAttempts','محاولات الاختبارات','Quiz attempts'],
 ['engagementTitle','التفاعل حسب الدرس','Engagement by lesson'],['engagementSub','عدد الطلاب الذين بدؤوا وأكملوا كل درس منشور','Learners who started and completed each published lesson'],['engagementCaption','بيانات الرسم نصاً','Chart data as text'],['started','بدؤوا','Started'],['completed','أكملوا','Completed'],['lessonShort','د{n}','L{n}'],['noPublishedLessons','لا توجد دروس منشورة.','No published lessons.'],
 // students
 ['studentsIntro','طلاب دوراتك فقط مع التقدم والنتائج.','Learners in your courses only, with progress and results.'],['courseFilter','الدورة','Course'],['apply','تطبيق','Apply'],['studentsCaption','{count} تسجيلات','{count} enrollments'],['noGuardianData','لا تظهر بيانات أولياء الأمور أو المحادثات الخاصة بغير دوراتك.','No guardian data or conversations outside your courses are shown.'],
 ['recordMissing','السجل غير موجود','Record not found'],['recordDenied','السجل خارج نطاقك','Record outside your scope'],['recordUnavailable','لا يمكن عرض هذا السجل.','This record cannot be shown.'],['quizResults','الاختبارات','Quizzes'],['assignmentResults','المهام','Assignments'],
 // inbox and thread
 ['inboxIntro','محادثات دوراتك: إسناد ورد علني وملاحظات داخلية وتصعيد.','Your courses’ conversations: assign, reply publicly, add internal notes and escalate.'],['inboxFilter','تصفية الوارد','Inbox filter'],['safeguarding','التواصل مقيّد بنطاق الدورة ومراقب؛ لا رسائل مباشرة مفتوحة مع الطلاب القُصّر.','Communication is course-scoped and monitored; no open direct messaging with minors.'],
 ['inboxEmpty','لا محادثات بهذه الحالة','No conversations in this state'],['inboxEmptyBody','ستظهر هنا أسئلة طلاب دوراتك.','Questions from your courses’ learners appear here.'],['unassigned','غير مسند','Unassigned'],['openThread','فتح المحادثة','Open conversation'],
 ['assignTo','إسناد إلى','Assign to'],['assignSelf','أنا (المالك)','Me (owner)'],['assignHint','الأعضاء النشطون الذين يملكون صلاحية الرد في هذه الدورة فقط.','Only active members with reply access on this course.'],['assign','إسناد','Assign'],['assigned','أُسندت المحادثة.','Conversation assigned.'],
 ['you','أنت','You'],['unknownPerson','مستخدم','User'],['role.student','طالب','Learner'],['role.teacher','معلم','Teacher'],['role.assistant','مساعد','Assistant'],['role.staff','فريق المنصة','Platform staff'],
 ['internalNote','ملاحظة داخلية','Internal note'],['publicReply','رد علني','Public reply'],['replyLabel','ردك','Your reply'],['replyHint','يراه الطالب ويصله إشعار.','The learner sees it and is notified.'],['sendReply','إرسال الرد','Send reply'],['replySent','أُرسل الرد.','Reply sent.'],
 ['noteLabel','الملاحظة','Note'],['noteHint','لا تظهر أبداً للطالب أو ولي الأمر.','Never visible to the learner or guardian.'],['addNote','إضافة ملاحظة','Add note'],['noteAdded','أُضيفت الملاحظة الداخلية.','Internal note added.'],
 ['assignment','الإسناد','Assignment'],['noMembersForCourse','لا يوجد أعضاء بصلاحية الرد في هذه الدورة؛ عدّلها من الفريق.','No members have reply access on this course; change it in Team.'],['statusTitle','الحالة','Status'],['moveTo','نقل إلى «{state}»','Move to “{state}”'],
 ['openHint','أسند المحادثة أو رد عليها لتصبح «مسندة».','Assign or reply to make it “assigned”.'],['resolvedHint','محلولة؛ رد الطالب الجديد يعيد فتحها.','Resolved; a new learner reply reopens it.'],['statusChanged','تغيرت الحالة.','Status changed.'],
 ['reportConversation','الإبلاغ عن المحادثة','Report conversation'],['reportNote','يصل البلاغ إلى قائمة السلامة لدى فريق الإشراف.','The report goes to the moderation safety queue.'],['reportSent','أُرسل البلاغ.','Report sent.'],['alreadyReported','أُبلغ عنه من قبل.','Already reported.'],['auditTrail','سجل التدقيق','Audit trail'],['superseded','استُبدل','superseded'],
 // calendar
 ['move','تغيير الموعد','Move'],['moveTitle','تغيير موعد «{title}»','Move “{title}”'],['moveNote','يصل إشعار تغيير واحد لكل طالب مسجل.','Each enrolled learner gets one change notice.'],['liveTab','قسم المباشر','Live tab'],['emptyWeek','لا حصص في هذا الأسبوع.','No sessions this week.'],
 // team
 ['teamIntro','ادعُ مساعدين وامنحهم صلاحيات لكل دورة على حدة.','Invite assistants and grant capabilities course by course.'],['teamTabs','أقسام الفريق','Team sections'],['team.members','الأعضاء','Members'],['team.invitations','الدعوات','Invitations'],['team.access','الصلاحيات','Access'],
 ['noPayoutsTitle','لا مدفوعات للمساعدين','No assistant payouts'],['noPayouts','لا تدير المنصة مستحقات المساعدين؛ العضوية لا تمنح وصولاً لكل دوراتك.','The platform does not pay assistants; membership never grants access to all your courses.'],
 ['inviteMember','دعوة عضو','Invite member'],['inviteTitle','دعوة عضو للفريق','Invite a team member'],['inviteEmail','البريد الإلكتروني','Email'],['inviteEmailHint','عنوان تجريبي فقط ينتهي بـ example.test@.','Synthetic address only, ending in @example.test.'],['inviteExpiry','صلاحية الدعوة','Invitation expiry'],['days','{count} يوماً','{count} days'],
 ['inviteNote','يصبح العضو «مدعواً» حتى يقبل؛ تُمنح الصلاحيات لكل دورة بعد التفعيل.','The member stays “invited” until they accept; course capabilities are granted after activation.'],['sendInvite','إرسال الدعوة','Send invitation'],['invited','أُرسلت الدعوة التجريبية.','Demo invitation sent.'],
 ['teamRole','دور الفريق','Team role'],['teamRole.assistant','مساعد تدريس','Teaching assistant'],['teamRole.grader','مصحح','Grader'],['teamRole.content_editor','محرر محتوى','Content editor'],
 ['invitedOn','تاريخ الدعوة','Invited on'],['memberSince','عضو منذ','Member since'],['expires','تنتهي','Expires'],['expired','منتهية','Expired'],['assignedCourses','الدورات المسندة','Assigned courses'],['noAssignments','لا توجد دورات مسندة.','No assigned courses.'],['editAccess','تعديل الصلاحيات','Edit access'],
 ['revoke','إلغاء العضوية','Revoke'],['cancelInvite','إلغاء الدعوة','Cancel invitation'],['revokeTitle','إلغاء عضوية {name}','Revoke {name}'],['cancelInviteTitle','إلغاء دعوة {name}','Cancel invitation for {name}'],['revokeWarnTitle','أثر فوري','Immediate effect'],
 ['revokeWarn','يفقد {name} فوراً الوصول إلى {count} دورات وكل المحادثات المسندة إليه، وتعود المحادثات غير المحلولة إلى «مفتوح».','{name} immediately loses access to {count} courses and every assigned conversation; unresolved conversations return to “open”.'],['cancelInviteWarn','تُلغى دعوة {name} فوراً ولن يتمكن من الانضمام.','The invitation for {name} is cancelled immediately.'],
 ['confirmRevoke','نعم، ألغِ العضوية الآن','Yes, revoke now'],['confirmCancelInvite','نعم، ألغِ الدعوة','Yes, cancel invitation'],['memberRevoked','أُلغيت العضوية وسُحبت الصلاحيات.','Membership revoked and access removed.'],
 ['noMembers','لا يوجد أعضاء نشطون','No active members'],['noMembersBody','ادعُ مساعداً ثم امنحه صلاحيات على دورات محددة.','Invite an assistant, then grant access on specific courses.'],['noInvitations','لا توجد دعوات معلقة','No pending invitations'],['formerMembers','أعضاء سابقون','Former members'],
 ['matrixNote','حدد صلاحيات كل عضو لكل دورة. لا تمنح العضوية وحدها أي وصول.','Set each member’s capabilities per course. Membership alone grants no access.'],['matrixSaveNote','تسري التغييرات فوراً.','Changes apply immediately.'],['saveAccess','حفظ الصلاحيات','Save access'],['accessSaved','حُفظت الصلاحيات.','Access saved.'],
 ['cap.reply_conversation','الرد على المحادثات','Reply to conversations'],['cap.read_content','عرض المحتوى','Read content'],['cap.grade_assignment','تصحيح المهام','Grade assignments'],['cap.edit_content','تحرير المحتوى','Edit content'],
 // earnings
 ['earningsIntro','مبيعاتك ولقطات العمولة والمستحقات حسب الحالة، مشتقة من القيود.','Your sales, commission snapshots and payables by state, derived from ledger entries.'],['earnTabs','أقسام الأرباح','Earnings sections'],['earn.sales','المبيعات','Sales'],['earn.payables','المستحقات','Payables'],['earn.payouts','الصرف','Payouts'],['earn.destination','حساب الصرف','Destination'],
 ['inPayoutAmount','قيد الصرف: {amount}','In payout: {amount}'],['recoverableAmount','مبالغ مستردة مستحقة: {amount}','Recoverable adjustments: {amount}'],
 ['snapshotNote','لقطة العمولة مجمدة عند الشراء؛ تغيير القواعد لاحقاً لا يغيّر المبيعات السابقة.','The commission snapshot is frozen at purchase; later rule changes never alter past sales.'],['salesCaption','بنود المبيعات','Sale items'],['noSales','لا توجد مبيعات بعد','No sales yet'],
 ['date','التاريخ','Date'],['saleItem','البند','Item'],['base','الأساس','Base'],['rate','النسبة','Rate'],['platformShare','حصة المنصة','Platform share'],['teacherShare','حصتك','Your share'],
 ['adjustments','التسويات والاستردادات','Adjustments and refunds'],['adjustmentsNote','تُضاف كقيود مرتبطة؛ لا يُعاد كتابة البيع أو الصرف الأصلي.','Added as linked entries; the original sale or payout is never rewritten.'],['noAdjustments','لا توجد تسويات.','No adjustments.'],
 ['adjustmentTitle','تسوية {id}','Adjustment {id}'],['linkedSale','مرتبطة بالبيع {item}','Linked to sale {item}'],['originalSnapshot','اللقطة الأصلية','Original snapshot'],['snapshotLine','الأساس {base}|النسبة {rate}٪|حصة المعلم {teacher}','Base {base}|Rate {rate}%|Teacher {teacher}'],['originalAllocation','التخصيص الأصلي {id}','Original allocation {id}'],
 ['payablesNote','الأرصدة من {entries} قيداً في {journals} قيود يومية متوازنة، وتقابلها مجاميع التخصيصات.','Balances come from {entries} ledger entries in {journals} balanced journals and are matched to allocation totals.'],
 ['earningState','الحالة','State'],['ledgerBalance','رصيد الدفتر','Ledger balance'],['allocationTotal','مجموع التخصيصات','Allocation total'],['reconciliation','المطابقة','Reconciliation'],['matches','متطابق','Matches'],['mismatch','غير متطابق','Mismatch'],['meaning','المعنى','Meaning'],['payablesCaption','المستحقات حسب الحالة','Payables by state'],
 ['stateHelp.pending','فترة انتظار تجريبية قبل الإتاحة.','Demo hold before it becomes available.'],['stateHelp.available','جاهز لإدراجه في دفعة صرف.','Ready to be included in a payout batch.'],['stateHelp.reserved','محجوز في دفعة أو نزاع.','Reserved in a batch or dispute.'],['stateHelp.in_payout','قيد التحويل.','Being transferred.'],['stateHelp.paid','حُوّل وتمت مطابقته.','Transferred and reconciled.'],
 ['allocation','التخصيص','Allocation'],['amount','المبلغ','Amount'],['eligibleOn','متاح من','Eligible on'],['note','ملاحظة','Note'],['linkedTo','مرتبط بـ {id}','Linked to {id}'],['allocationsCaption','تخصيصات الأرباح','Earning allocations'],['noAllocations','لا توجد تخصيصات.','No allocations.'],
 ['holdDemo','انتظار تجريبي حتى إطلاق يدوي','Demo hold until manual release'],['holdRecovery','استرداد بعد الصرف','Recovery after payout'],
 ['payoutsNote','تعد المالية الدفعات ويعتمدها شخص آخر مستقل؛ لا تستطيع اعتماد دفعة أو تعديلها.','Finance prepares batches and an independent person approves them; you cannot approve or edit a batch.'],['payout','الصرف','Payout'],['reference','المرجع','Reference'],['details','التفاصيل','Details'],['payoutsCaption','سجل الصرف','Payout history'],['noPayouts2','لا يوجد صرف بعد','No payouts yet'],
 ['payoutTitle','تفاصيل الصرف {id}','Payout {id}'],['period','الفترة','Period'],['submittedOn','أُرسلت','Submitted'],['approvedOn','اعتُمدت','Approved'],['reconciled','المطابقة','Reconciled'],['destination','الوجهة','Destination'],['allocationsIncluded','التخصيصات المشمولة','Included allocations'],
 ['payoutFailedTitle','تعذر التحويل','Transfer failed'],['payoutFailedBody','المبلغ يبقى محجوزاً ولم يُدفع؛ ستعيد المالية التحقق.','The amount stays reserved and unpaid; finance will revalidate.'],['payoutApprovalNote','المُعدّ والمعتمد شخصان مختلفان دائماً.','The preparer and approver are always different people.'],
 ['noAccount','لا يوجد حساب صرف موثّق','No verified payout destination'],['verifiedDestination','وجهة الصرف الموثقة','Verified payout destination'],['beneficiary','اسم المستفيد','Beneficiary name'],['account','الحساب','Account'],['verifiedDest','موثّق من المالية','Verified by finance'],['unverifiedDest','بانتظار التحقق','Awaiting verification'],['changedOn','آخر تغيير','Last changed'],
 ['maskedNote','يُعرض الحساب مقنّعاً دائماً؛ لا تُخزّن أرقام حسابات حقيقية.','The account is always masked; no real account numbers are stored.'],['changeRequest','طلب تغيير الوجهة','Destination change request'],['changeIntro','لا يمكن تعديل الوجهة مباشرة؛ ترسل طلباً يتحقق منه فريق المالية.','The destination cannot be edited directly; you send a request that finance verifies.'],
 ['accountRef','آخر أربعة أرقام (تجريبية)','Last four digits (synthetic)'],['accountRefHint','لا تُدخل رقم حساب حقيقياً.','Never enter a real account number.'],['changeConsent','أؤكد أن هذه بيانات تجريبية وأن التغيير يحتاج تحقق المالية','I confirm this is synthetic data and the change needs finance verification'],
 ['changePendingTitle','الطلب بانتظار تحقق المالية','Request awaiting finance verification'],['changePending','أُرسل في {date}؛ تبقى الوجهة الحالية فعالة.','Sent on {date}; the current destination stays in effect.'],['changeRequested','أُرسل طلب التغيير للتحقق.','Change request sent for verification.'],
 // notifications and settings
 ['notificationsIntro','ملاحظات المراجعة والأسئلة الجديدة وأحداث الصرف.','Review feedback, new questions and payout events.'],['allRead','عُلّمت كل الإشعارات كمقروءة.','All notifications marked as read.'],
 ['settingsIntro','ملفك العام ومؤهلاتك وتفضيلاتك.','Your public profile, qualifications and preferences.'],['settingsTabs','أقسام الإعدادات','Settings sections'],['settings.profile','الملف العام','Public profile'],['settings.qualifications','المؤهلات','Qualifications'],['settings.account','الحساب','Account'],['settings.notifications','الإشعارات','Notifications'],
 ['viewPublic','معاينة الملف العام','Preview public profile'],['bioTitle','النبذة التعريفية','Biography'],['bioIntro','تظهر للزوار في صفحتك العامة باللغتين.','Shown to visitors on your public page in both languages.'],['field.bio.ar','النبذة بالعربية','Biography (Arabic)'],['field.bio.en','النبذة بالإنجليزية','Biography (English)'],['saveProfile','حفظ الملف','Save profile'],['profileSaved','حُفظ الملف العام.','Public profile saved.'],
 ['verifiedQualifications','المؤهلات الموثقة','Verified qualifications'],['qualificationsIntro','تحدد الصفوف والمواد التي يمكنك إنشاء دورات لها.','These define the grades and subjects you can create courses for.'],['pendingQualifications','طلبات قيد التحقق','Requests under verification'],['noPendingQualifications','لا توجد طلبات معلقة.','No pending requests.'],['pendingVerification','بانتظار التحقق','Pending verification'],
 ['requestQualification','طلب مؤهل إضافي','Request an additional qualification'],['qualificationNote','ملاحظة للمراجع','Note for the reviewer'],['qualificationNoteHint','اختياري؛ لا تُرفق وثائق حقيقية.','Optional; never attach real documents.'],['qualificationReview','يتحقق فريق الإشراف من الطلب؛ لا يمكنك استخدامه حتى التوثيق.','Moderation verifies the request; you cannot use it until verified.'],['qualificationRequested','أُرسل طلب المؤهل للتحقق.','Qualification request sent for verification.'],
 ['accountStatus','حالة الحساب','Account status'],['applicationStatus','حالة طلب الانضمام','Application status'],['savePrefs','حفظ التفضيلات','Save preferences'],['prefsSaved','حُفظت التفضيلات.','Preferences saved.'],
 ['pref.in_app','إشعارات داخل المنصة','In-app notifications'],['pref.email_digest','ملخص بريد أسبوعي (محاكى)','Weekly email digest (simulated)'],['pref.qa_alerts','الأسئلة الجديدة والتصعيد','New questions and escalations'],['pref.review_updates','قرارات مراجعة الدورات','Course review decisions'],['pref.payout_updates','أحداث الصرف','Payout events'],
].map(([key,ar,en])=>['p6.'+key,{ar,en}])));

// P7 assistant workspace.
Object.assign(dictionary, Object.fromEntries([
 // overview and courses
 ['welcome','أهلاً {name}','Welcome, {name}'],['overviewIntro','العمل المسند إليك من فريق {owner} فقط.','Only the work assigned to you by {owner}’s team.'],['overviewRevoked','لا توجد عضوية فريق نشطة.','No active team membership.'],
 ['statCourses','الدورات المسندة','Assigned courses'],['statOpen','محادثات مفتوحة مسندة','Open assigned conversations'],['statDue','مهام مستحقة','Tasks due'],
 ['myQueue','قائمتي','My queue'],['queueEmpty','لا محادثات مفتوحة مسندة إليك.','No open conversations assigned to you.'],['dueTasks','المهام المستحقة','Tasks due'],['noDueTasks','لا مهام مستحقة.','No tasks due.'],
 ['courseShortcuts','دوراتك المسندة','Your assigned courses'],['ownerLine','مالك الدورة: {name}','Course owner: {name}'],['cardMeta','الدروس المنشورة: {lessons} · المحادثات المفتوحة: {open} · المهام المفتوحة: {tasks}','Published lessons: {lessons} · Open conversations: {open} · Open tasks: {tasks}'],
 ['openWorkspace','فتح مساحة الدورة','Open workspace'],['openInbox','الوارد المسند','Assigned inbox'],
 ['scopeNote','ترى الدورات والمحادثات المسندة إليك صراحة فقط؛ لا بيانات مالية أو أولياء أمور أو طلاب آخرين.','You only see courses and conversations explicitly assigned to you; no finance, guardian or other learner data.'],
 ['coursesIntro','الدورات التي منحك مالكها صلاحيات عليها، مع الصلاحيات الممنوحة لكل دورة.','Courses whose owner granted you access, with the capabilities granted on each.'],
 ['membershipNote','عضوية الفريق وحدها لا تمنح الوصول إلى كل دورات المعلم؛ تظهر هنا الدورات المسندة فقط.','Team membership alone never grants access to all of a teacher’s courses; only assigned courses appear here.'],
 ['noAccessTitle','لا يوجد عمل مسند','No assigned access'],['noAccessBody','أُلغيت عضويتك في الفريق أو لا توجد دورة مسندة إليك حالياً. اطلب من مالك الدورة منحك الصلاحية.','Your team membership was revoked or no course is currently assigned to you. Ask the course owner to grant access.'],['backToOverview','العودة إلى العمل المسند','Back to assigned work'],
 ['capabilities','الصلاحيات','Capabilities'],['granted','ممنوحة','Granted'],['notGranted','غير ممنوحة','Not granted'],
 ['capDeniedTitle','صلاحية «{cap}» غير ممنوحة','“{cap}” is not granted'],['capDeniedBody','اطلب من مالك الدورة منحك هذه الصلاحية. يرفض النظام هذا الإجراء حتى يُمنح.','Ask the course owner to grant this permission. The system rejects this action until it is granted.'],
 // course workspace
 ['wsTabs','أقسام مساحة الدورة','Course workspace sections'],['ws.overview','نظرة عامة','Overview'],['ws.content','المحتوى','Content'],['ws.tasks','المهام','Tasks'],
 ['capsIntro','يحددها مالك الدورة لهذه الدورة وحدها.','Set by the course owner for this course only.'],
 ['capHelp.reply_conversation','الرد على المحادثات المسندة إليك وإضافة ملاحظات داخلية.','Reply to conversations assigned to you and add internal notes.'],['capHelp.read_content','عرض الدروس ونصوصها.','View lessons and their text.'],['capHelp.grade_assignment','تصحيح المهام ونشر النتائج.','Grade assignments and release results.'],['capHelp.edit_content','تعديل عناوين الدروس ونصوصها.','Edit lesson titles and text.'],
 ['owner','مالك الدورة','Course owner'],['courseStatus','حالة الدورة','Course status'],['lessonsCount','الدروس المنشورة','Published lessons'],['openAssigned','محادثاتك المفتوحة','Your open conversations'],['openTasks','مهامك المفتوحة','Your open tasks'],
 ['boundariesTitle','حدود هذه المساحة','Workspace boundaries'],['boundaries','لا قوائم طلاب أو تصدير تسجيلات أو بيانات تواصل أو أرقام مالية في هذه المساحة.','No learner lists, enrollment exports, contact details or financial figures are available here.'],
 ['editTitle','يمكنك تعديل النصوص','You can edit text'],['editNote','عدّل عناوين الدروس ونصوصها ضمن هذه الدورة؛ النشر والمعاينة والمدة تبقى قرار المالك، وكل تعديل يُسجَّل في سجل الدورة.','Edit lesson titles and text in this course; publishing, preview and duration stay with the owner, and every edit is logged in the course history.'],
 ['readOnlyTitle','عرض فقط','Read only'],['readOnlyNote','لديك صلاحية عرض المحتوى فقط في هذه الدورة. لتعديله اطلب من مالك الدورة منحك صلاحية «تحرير المحتوى».','You can only view content in this course. To edit it, ask the course owner to grant “Edit content”.'],
 ['editLesson','تعديل الدرس','Edit lesson'],['viewText','عرض النص','View text'],['preview','معاينة مجانية','Free preview'],['noLessons','لا دروس في هذه الوحدة.','No lessons in this module.'],
 ['field.title_ar','العنوان بالعربية','Title (Arabic)'],['field.title_en','العنوان بالإنجليزية','Title (English)'],['field.body','نص الدرس','Lesson text'],['editScopeHint','تُحفظ العناوين والنص فقط؛ لا تتغير حالة النشر.','Only titles and text are saved; publication state does not change.'],
 ['noCourseTasks','لا مهام مسندة إليك في هذه الدورة','No tasks assigned to you in this course'],['openTasks.grading','مهام التصحيح','Grading tasks'],['openTasks.content','مهام المحتوى','Content tasks'],
 // tasks
 ['task.grading','مهمة تصحيح','Grading task'],['task.content','مهمة محتوى','Content task'],['dueOn','الاستحقاق: {date}','Due {date}'],['taskTo.in_progress','بدء المهمة','Start task'],['taskTo.done','إكمال المهمة','Mark task done'],
 ['taskStarted','بدأت المهمة.','Task started.'],['taskDone','اكتملت المهمة وأُبلغ مالك الدورة.','Task completed and the course owner notified.'],['gradeFirst','صحّح التسليم قبل إكمال المهمة.','Grade the submission before completing the task.'],
 ['tasksIntro','صحّح وانشر النتائج أو حدّث المحتوى حسب الصلاحيات الممنوحة لكل دورة.','Grade and release results or update content, according to the capabilities granted per course.'],
 ['tasksTabs','أنواع المهام','Task types'],['tasksTab.grading','التصحيح','Grading'],['tasksTab.content','المحتوى','Content'],
 ['tasksNote.grading','تظهر التسليمات في الدورات التي تملك فيها صلاحية «تصحيح المهام» فقط. لا تظهر النتيجة للطالب حتى النشر.','Submissions appear only in courses where you hold “Grade assignments”. Learners see a result only after release.'],
 ['tasksNote.content','تعديل المحتوى متاح فقط في الدورات التي تملك فيها صلاحية «تحرير المحتوى».','Content editing is available only in courses where you hold “Edit content”.'],
 ['noTasksHere','لا مهام مسندة هنا.','No tasks assigned here.'],['submissions','التسليمات','Submissions'],['gradedBy','صححها: {name}','Graded by {name}'],
 // inbox, thread and Q&A
 ['inboxIntro','المحادثات المسندة إليك صراحة في دوراتك المسندة فقط.','Only conversations explicitly assigned to you in your assigned courses.'],['inboxTabs','صفوف الوارد','Inbox queues'],
 ['waitingFilter','تصفية المسندة','Assigned filter'],['allAssigned','كل المسندة','All assigned'],['inboxEmptyBody','يسند مالك الدورة الأسئلة الجديدة إليك من صندوقه.','The course owner assigns new questions to you from their inbox.'],
 ['inboxEmpty.open','لا محادثات مفتوحة','No open conversations'],['inboxEmpty.assigned','لا محادثات مسندة قيد العمل','No assigned conversations in progress'],['inboxEmpty.waiting','لا محادثات بانتظار رد الطالب','No conversations waiting for the learner'],['inboxEmpty.escalated','لا محادثات مصعّدة','No escalated conversations'],['inboxEmpty.resolved','لا محادثات محلولة','No resolved conversations'],
 ['assignedToYou','مسندة إليك','Assigned to you'],['escalateTo','تصعيد إلى {name}','Escalate to {name}'],['escalate','تصعيد للمالك','Escalate to owner'],['escalated','صُعّدت المحادثة إلى مالك الدورة.','Conversation escalated to the course owner.'],
 ['escalatedTitle','بانتظار مالك الدورة','Waiting for the course owner'],['escalatedNote','صُعّدت إلى {name}؛ يقرر المالك الحل أو إعادة الإسناد. يمكنك متابعة الرد والملاحظات.','Escalated to {name}; the owner resolves or reassigns it. You can still reply and add notes.'],
 ['openHint','أعاد الطالب فتح المحادثة؛ ردك يعيدها إلى «مسندة».','The learner reopened this conversation; your reply moves it back to “assigned”.'],
 ['context','السياق','Context'],['course','الدورة','Course'],['lesson','الدرس','Lesson'],['noLesson','بلا درس محدد','No specific lesson'],['learner','الطالب','Learner'],['noContactData','يظهر اسم الطالب فقط؛ لا بيانات تواصل أو أولياء أمور.','Only the learner’s name is shown; no contact or guardian details.'],
 ['qaIntro','أسئلة الدروس المسندة إليك، مجمعة حسب الدورة والدرس.','Lesson questions assigned to you, grouped by course and lesson.'],['qaScope','تظهر أسئلة الدروس المسندة إليك في الدورات التي تملك فيها صلاحية الرد فقط.','Only lesson questions assigned to you in courses where you can reply appear here.'],
 ['qaEmpty','لا أسئلة دروس مسندة إليك في هذه الدورة.','No lesson questions assigned to you in this course.'],['answer','إجابتك','Your answer'],
 // notifications and settings
 ['notificationsIntro','إسناد المحادثات والمهام والردود في دوراتك المسندة.','Conversation assignments, tasks and replies in your assigned courses.'],
 ['settingsIntro','اسمك وتفضيلاتك الشخصية؛ الصلاحيات للعرض فقط.','Your name and personal preferences; capabilities are read only.'],['membershipEnded','انتهت عضويتك في فريق التدريس.','Your teaching team membership has ended.'],
 ['nameNote','يظهر اسمك للطلاب على ردودك العلنية فقط؛ لا تُعرض بيانات تواصلك.','Your name is shown to learners on your public replies only; your contact details are never shown.'],
 ['assignedCapabilities','الصلاحيات المسندة','Assigned capabilities'],['capsReadOnly','يمنحها مالك كل دورة ويعدّلها؛ لا يمكنك تغييرها من هنا.','Each course owner grants and changes these; you cannot change them here.'],
 ['noEscalationTitle','لا ترقية للدور','No role escalation'],['noEscalation','لا يمكن للمساعد تغيير دوره أو منح نفسه صلاحيات أو الوصول إلى المالية.','An assistant cannot change their role, grant themselves capabilities or access finance.'],
 ['pref.in_app','إشعارات داخل المنصة','In-app notifications'],['pref.email_digest','ملخص بريد أسبوعي (محاكى)','Weekly email digest (simulated)'],['pref.assigned_alerts','إسناد المحادثات','Conversation assignments'],['pref.task_alerts','المهام الجديدة','New tasks'],
 ['ownerOnlyField','الحالة والمعاينة والمدة قرارات مالك الدورة.','State, preview and duration are course owner decisions.'],
].map(([key,ar,en])=>['p7.'+key,{ar,en}])));
Object.assign(dictionary, { 'p6.audit.lesson.assistant_edit': { ar: 'تعديل درس من المساعد', en: 'Lesson edited by assistant' }, 'p6.audit.task.state': { ar: 'تغيير حالة مهمة', en: 'Task state changed' } });

export function esc(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
export function L(value) { if (value == null) return ''; if (typeof value !== 'object') return String(value); const lang=getState().preferences.lang; return value[lang] ?? value.en ?? value.ar ?? ''; }
export function t(key, params={}) { return L(dictionary[key] ?? dictionary.unknown).replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`)); }
export function money(baisa) { const n=new Intl.NumberFormat('en-OM',{minimumFractionDigits:3,maximumFractionDigits:3,useGrouping:true}).format((Number.isFinite(baisa)?baisa:0)/1000); return getState().preferences.lang==='ar' ? `${n} ر.ع.` : `OMR ${n}`; }
export function dateTime(iso) { const d=new Date(iso); return Number.isNaN(d.valueOf()) ? t('unknown') : new Intl.DateTimeFormat(getState().preferences.lang==='ar'?'ar-OM':'en-OM',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Muscat'}).format(d); }
export function setLang(lang) { return dispatch('preferences.set',{lang}); }
