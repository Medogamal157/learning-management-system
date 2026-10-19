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

export function esc(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
export function L(value) { if (value == null) return ''; if (typeof value !== 'object') return String(value); const lang=getState().preferences.lang; return value[lang] ?? value.en ?? value.ar ?? ''; }
export function t(key, params={}) { return L(dictionary[key] ?? dictionary.unknown).replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`)); }
export function money(baisa) { const n=new Intl.NumberFormat('en-OM',{minimumFractionDigits:3,maximumFractionDigits:3,useGrouping:true}).format((Number.isFinite(baisa)?baisa:0)/1000); return getState().preferences.lang==='ar' ? `${n} ر.ع.` : `OMR ${n}`; }
export function dateTime(iso) { const d=new Date(iso); return Number.isNaN(d.valueOf()) ? t('unknown') : new Intl.DateTimeFormat(getState().preferences.lang==='ar'?'ar-OM':'en-OM',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Muscat'}).format(d); }
export function setLang(lang) { return dispatch('preferences.set',{lang}); }
