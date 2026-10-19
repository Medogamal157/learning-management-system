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

export function esc(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
export function L(value) { if (value == null) return ''; if (typeof value !== 'object') return String(value); const lang=getState().preferences.lang; return value[lang] ?? value.en ?? value.ar ?? ''; }
export function t(key, params={}) { return L(dictionary[key] ?? dictionary.unknown).replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`)); }
export function money(baisa) { const n=new Intl.NumberFormat('en-OM',{minimumFractionDigits:3,maximumFractionDigits:3,useGrouping:true}).format((Number.isFinite(baisa)?baisa:0)/1000); return getState().preferences.lang==='ar' ? `${n} ر.ع.` : `OMR ${n}`; }
export function dateTime(iso) { const d=new Date(iso); return Number.isNaN(d.valueOf()) ? t('unknown') : new Intl.DateTimeFormat(getState().preferences.lang==='ar'?'ar-OM':'en-OM',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Muscat'}).format(d); }
export function setLang(lang) { return dispatch('preferences.set',{lang}); }
