import { createSeed, PERSONAS, DEMO_NOW } from './data.js';
const roles=Object.keys(PERSONAS);
const valid={role:roles,lang:['ar','en'],theme:['light','dark']};
function preference(key, fallback) { try { const v=globalThis.localStorage?.getItem(key); return valid[key].includes(v)?v:fallback; } catch { return fallback; } }
function freeze(value) { if(value && typeof value==='object' && !Object.isFrozen(value)) { Object.freeze(value); Object.values(value).forEach(freeze); } return value; }
let state=freeze({...createSeed(),preferences:{role:preference('role','visitor'),lang:preference('lang','ar'),theme:preference('theme','light')},transient:{}});
const listeners=new Set();
export function getState() { return state; }
export function subscribe(fn) { listeners.add(fn); return ()=>listeners.delete(fn); }
function notify() { for(const fn of [...listeners]) fn(state); }
export function resetDemoData() { state=freeze({...createSeed(),preferences:{...state.preferences},transient:{}}); notify(); return {ok:true,data:null,errorKey:null,fieldErrors:{}}; }
const ok=data=>({ok:true,data,errorKey:null,fieldErrors:{}});
const fail=errorKey=>({ok:false,data:null,errorKey,fieldErrors:{}});
const failFields=(fieldErrors,errorKey='error.form',data=null)=>({ok:false,data,errorKey,fieldErrors});
// ---- P2 validation helpers (public + auth). Field errors are i18n keys rendered by the views.
const EMAIL=/^[^\s@<>()"']+@[^\s@<>()"']+\.[A-Za-z]{2,}$/;
const PHONE=/^\+?[\d\s-]{7,20}$/;
const FILENAME=/^[\w؀-ۿ][\w؀-ۿ .()-]{0,75}\.(pdf|png|jpe?g)$/i;
const text=(v,max=2000)=>typeof v==='string'?v.trim().slice(0,max):'';
const lengthError=(v,min)=>!v?'error.required':v.length<min?'error.tooShort':null;
const pick=errors=>Object.fromEntries(Object.entries(errors).filter(([,v])=>v));
const nextId=(rows,prefix)=>`${prefix}-${String(Math.max(0,...rows.map(r=>Number(r.id.slice(prefix.length+1))).filter(Number.isFinite))+1).padStart(3,'0')}`;
const isPublic=(s,c)=>{ const teacher=s.teachers.find(x=>x.id===c.owner_teacher_id);return c.status==='Published' && teacher?.application_status==='approved' && teacher.account_status==='active'; };
const activeGrantIn=(s,studentId,courseId)=>s.access_grants.find(g=>g.student_id===studentId && g.course_id===courseId && g.status==='active' && g.starts_at<=DEMO_NOW && g.ends_at>DEMO_NOW && s.enrollments.find(e=>e.id===g.enrollment_id)?.status==='active');
// Sign-in return targets: internal hashes only, limited to public/checkout sections and the persona's own workspace.
const PUBLIC_RETURN=/^\/(?:explore(?:\/grade\/[A-Za-z0-9-]+(?:\/subject\/[A-Za-z0-9-]+)?)?|course\/[A-Za-z0-9-]+|teacher\/[A-Za-z0-9-]+|teachers|become-teacher|about|help|legal\/(?:privacy|terms|refunds))$/;
export function safeReturn(value,role) {
 if(typeof value!=='string')return null;
 const v=value.startsWith('#')?value.slice(1):value, m=v.match(/^\/([A-Za-z0-9\-/]*)(\?[A-Za-z0-9=&%._-]*)?$/);
 if(!m || v.includes('//'))return null;
 const path=v.split('?')[0], first=m[1].split('/')[0];
 const checkout=['student','guardian'].includes(role)&&/^\/checkout\/[A-Za-z0-9-]+\/(?:beneficiary|review)$/.test(path);
 return path==='/' || PUBLIC_RETURN.test(path) || checkout || (['student','guardian'].includes(role)&&first===role) ? '#'+v : null;
}
// Applicant-side teacher application transitions (SPEC §3.1); reviewer transitions belong to administration.
export const APPLICANT_TRANSITIONS=Object.freeze({draft_application:'submitted',submitted:'submitted',more_info_required:'submitted'});
const APPLICANT_TEACHER='T-004', APPLICATION_STEPS=['identity','qualifications','credentials'];
const FORMS=['sign-in','reset-password','register-student','register-guardian','contact','application','guardian-link','guardian-ticket'];
const TOPICS=['account','course','payment','other'];
function applicationData(s) {
 if(s.transient.application)return s.transient.application;
 const app=s.teacher_applications.find(a=>a.teacher_id===APPLICANT_TEACHER),teacher=s.teachers.find(x=>x.id===APPLICANT_TEACHER),lang=s.preferences.lang;
 return { ...(app.applicant_identity ?? {name:teacher.name[lang],email:s.users.find(u=>u.id===teacher.user_id).email,phone:'',bio:teacher.bio[lang]}), pairs:[...app.declared_grade_subject_ids], credentials:app.credential_labels.map((label,i)=>({label:label[lang],filename:app.credential_files?.[i]??''})) };
}
function validateApplicationStep(s,step,v) {
 if(step==='identity') { const values={name:text(v.name,80),email:text(v.email,120),phone:text(v.phone,20),bio:text(v.bio,600)};return {values,errors:pick({name:lengthError(values.name,3),email:!values.email?'error.required':EMAIL.test(values.email)?null:'error.email',phone:values.phone&&!PHONE.test(values.phone)?'error.phone':null,bio:values.bio&&values.bio.length<20?'error.bioShort':lengthError(values.bio,20)})}; }
 if(step==='qualifications') { const pairs=[...new Set((Array.isArray(v.pairs)?v.pairs:[]).filter(x=>typeof x==='string'))];return {values:{pairs},errors:pick({pairs:!pairs.length?'error.pairs':pairs.length>12||pairs.some(id=>!s.grade_subjects.some(g=>g.id===id&&g.active))?'error.pairsInvalid':null})}; }
 const rows=(Array.isArray(v.credentials)?v.credentials:[]).slice(0,2).map(r=>({label:text(r?.label,80),filename:text(r?.filename,80).split(/[\\/]/).pop()})).filter((r,i)=>i===0||r.label||r.filename);
 if(!rows.length)rows.push({label:'',filename:''});
 const errors={};rows.forEach((r,i)=>Object.assign(errors,pick({['label'+i]:lengthError(r.label,3),['file'+i]:!r.filename?'error.required':FILENAME.test(r.filename)?null:'error.filename'})));
 return {values:{credentials:rows},errors};
}
function applicantGate(s) { const app=s.teacher_applications.find(a=>a.teacher_id===APPLICANT_TEACHER);if(s.preferences.role!=='visitor')return 'error.applicantVisitor';if(!app)return 'missing';return Object.hasOwn(APPLICANT_TRANSITIONS,app.state)?null:'error.applicationLocked'; }
const saveForm=(s,form,entry)=>{ (s.transient.forms??={})[form]=entry; };
const clearForm=(s,form)=>{ if(s.transient.forms)delete s.transient.forms[form]; };
// Reducer registry keyed by action type. Later phases add one entry per mutation here.
// Each reducer receives (draft, payload, {actor, can}) and validates actor/scope/transition
// before mutating its private draft; only successful results replace the immutable state.
const reducers={
 'preferences.set': (draft,payload)=>{
  if(!Object.keys(payload).length || Object.keys(payload).some(k=>!valid[k]?.includes(payload[k])))return fail('invalidPreference');
  if(payload.role && payload.role!==draft.preferences.role)draft.transient={};
  Object.assign(draft.preferences,payload);return ok({...draft.preferences});
 },
 // Transient form state (values + field error keys) so validation survives rerenders. Passwords are never kept.
 'form.save': (draft,payload)=>{
  if(!FORMS.includes(payload.form))return fail('invalidAction');
  const values=Object.fromEntries(Object.entries(payload.values??{}).filter(([k,v])=>!/password/i.test(k)&&typeof v==='string').map(([k,v])=>[k,v.slice(0,2000)]));
  const fieldErrors=Object.fromEntries(Object.entries(payload.fieldErrors??{}).filter(([k,v])=>/^\w+$/.test(k)&&typeof v==='string'&&/^error\.\w+$/.test(v)));
  saveForm(draft,payload.form,{values,fieldErrors,done:false});return ok(null);
 },
 'form.clear': (draft,payload)=>{ if(!FORMS.includes(payload.form))return fail('invalidAction');clearForm(draft,payload.form);return ok(null); },
 // Demo sign-in validates an email-shaped address and a fixed persona; nothing is stored or authenticated.
 'auth.signIn': (draft,payload)=>{
  const email=text(payload.email,120);
  const errors=pick({email:!email?'error.required':EMAIL.test(email)?null:'error.email',password:typeof payload.password==='string'&&payload.password?null:'error.required',persona:['student','guardian'].includes(payload.persona)?null:'error.persona'});
  if(Object.keys(errors).length)return failFields(errors);
  clearForm(draft,'sign-in');return ok({role:payload.persona,hash:safeReturn(payload.returnTo,payload.persona)??'#'+PERSONAS[payload.persona].home});
 },
 'auth.resetPassword': (draft,payload)=>{ const email=text(payload.email,120);if(!EMAIL.test(email))return failFields({email:email?'error.email':'error.required'});saveForm(draft,'reset-password',{values:{},fieldErrors:{},done:true});return ok(null); },
 'auth.registerStudent': (draft,payload)=>{
  const name=text(payload.name,80),email=text(payload.email,120);
  const errors=pick({name:lengthError(name,3),grade:draft.grades.some(g=>g.id===payload.grade)?null:'error.grade',email:!email?'error.required':EMAIL.test(email)?null:'error.email',consent:payload.consent===true||payload.consent==='on'?null:'error.consent'});
  if(Object.keys(errors).length)return failFields(errors);
  saveForm(draft,'register-student',{values:{name},fieldErrors:{},done:true});return ok({name});
 },
 'auth.registerGuardian': (draft,payload)=>{
  const name=text(payload.name,80),contact=text(payload.contact,120);
  const errors=pick({name:lengthError(name,3),contact:!contact?'error.required':EMAIL.test(contact)||PHONE.test(contact)?null:'error.contact',consent:payload.consent===true||payload.consent==='on'?null:'error.consent'});
  if(Object.keys(errors).length)return failFields(errors);
  saveForm(draft,'register-guardian',{values:{name},fieldErrors:{},done:true});return ok({name});
 },
 // Teacher application wizard: steps validate into a transient draft; submit writes the T-004 applicant fixture.
 'application.saveStep': (draft,payload)=>{
  const gate=applicantGate(draft);if(gate)return fail(gate);
  if(!APPLICATION_STEPS.includes(payload.step))return fail('invalidAction');
  const {values,errors}=validateApplicationStep(draft,payload.step,payload.values??{});
  if(Object.keys(errors).length)return failFields(errors);
  draft.transient.application={...applicationData(draft),...values};clearForm(draft,'application');return ok(values);
 },
 'application.submit': (draft,payload)=>{
  const gate=applicantGate(draft);if(gate)return fail(gate);
  const data=applicationData(draft),errors={};let firstStep=null;
  for(const step of APPLICATION_STEPS) { const r=validateApplicationStep(draft,step,data);if(Object.keys(r.errors).length&&!firstStep)firstStep=step;Object.assign(errors,r.errors); }
  if(payload.consent!==true&&payload.consent!=='on')errors.consent='error.consent';
  if(Object.keys(errors).length)return failFields(errors,'error.applicationIncomplete',{step:firstStep??'review'});
  const app=draft.teacher_applications.find(a=>a.teacher_id===APPLICANT_TEACHER),teacher=draft.teachers.find(x=>x.id===APPLICANT_TEACHER),from=app.state,to=APPLICANT_TRANSITIONS[from];
  const own=v=>({ar:v,en:v});// Applicant text is kept as typed, not translated.
  Object.assign(app,{state:to,declared_grade_subject_ids:data.pairs,credential_labels:data.credentials.map(c=>own(c.label)),credential_files:data.credentials.map(c=>c.filename),applicant_identity:{name:data.name,email:data.email,phone:data.phone,bio:data.bio},updated_at:DEMO_NOW});
  app.history.push({state:to,actor_id:teacher.user_id,at:DEMO_NOW});
  Object.assign(teacher,{application_status:to,bio:own(data.bio),credentials:data.credentials.map(c=>({label:own(c.label),verified:false})),verification_state:'pending',updated_at:DEMO_NOW});
  delete draft.transient.application;return ok({id:app.id,from,state:to});
 },
 // Help contact: signed-in personas get a scoped ticket; visitors get an anonymous confirmation with no record.
 'support.createTicket': (draft,payload,{actor})=>{
  const topic=text(payload.topic,20),subject=text(payload.subject,120),body=text(payload.body,2000),email=text(payload.email,120),courseId=text(payload.courseId,12);
  const errors=pick({topic:TOPICS.includes(topic)?null:'error.topic',subject:lengthError(subject,3),body:body&&body.length<10?'error.messageShort':lengthError(body,10),email:actor.user_id?null:!email?'error.required':EMAIL.test(email)?null:'error.email',courseId:!courseId||draft.courses.some(c=>c.id===courseId&&isPublic(draft,c))?null:'error.course'});
  if(Object.keys(errors).length)return failFields(errors);
  let ticketId=null;
  if(actor.user_id) { ticketId=nextId(draft.support_tickets,'ST');draft.support_tickets.push({id:ticketId,requester_user_id:actor.user_id,course_id:courseId||null,topic,subject:{ar:subject,en:subject},body:{ar:body,en:body},state:'open',assigned_staff_id:null,resolution:'',created_at:DEMO_NOW,updated_at:DEMO_NOW}); }
  saveForm(draft,'contact',{values:{},fieldErrors:{},done:true,ticketId});return ok({ticketId});
 },
 // Free enrollment: one active enrollment + complimentary grant per student/course; repeats return the existing pair.
 'enrollment.enrollFree': (draft,payload,{actor})=>{
  if(draft.preferences.role!=='student')return fail('error.enrollStudentOnly');
  const course=draft.courses.find(c=>c.id===payload.courseId);
  if(!course||!isPublic(draft,course))return fail('error.courseUnavailable');
  if((course.published_snapshot??course).price_type!=='free')return fail('error.enrollNotFree');
  const sid=actor.record_id,existing=activeGrantIn(draft,sid,course.id);
  if(existing)return ok({enrollment_id:existing.enrollment_id,grant_id:existing.id,existing:true});
  let enrollment=draft.enrollments.find(e=>e.student_id===sid&&e.course_id===course.id);
  if(enrollment&&enrollment.status!=='active')return fail('error.enrollmentSuspended');
  if(!enrollment) { enrollment={id:nextId(draft.enrollments,'EN'),student_id:sid,course_id:course.id,status:'active',started_at:DEMO_NOW,historical_grade_id:draft.students.find(x=>x.id===sid).current_grade_id,created_at:DEMO_NOW,updated_at:DEMO_NOW};draft.enrollments.push(enrollment); }
  const grant={id:nextId(draft.access_grants,'AG'),student_id:sid,course_id:course.id,enrollment_id:enrollment.id,origin:'complimentary',source_id:null,starts_at:DEMO_NOW,ends_at:(course.published_snapshot??course).access_policy.end_at,status:'active',created_at:DEMO_NOW,updated_at:DEMO_NOW};
  draft.access_grants.push(grant);return ok({enrollment_id:enrollment.id,grant_id:grant.id,existing:false});
 },
};
export function dispatch(type,payload={}) {
 if(type==='demo.reset')return resetDemoData();
 if(!Object.hasOwn(reducers,type))return fail('invalidAction');
 const draft=structuredClone(state); const result=reducers[type](draft,payload,{actor:PERSONAS[state.preferences.role],can});
 if(!result.ok)return result;
 state=freeze(draft);
 if(type==='preferences.set')for(const [k,v] of Object.entries(payload))try{globalThis.localStorage?.setItem(k,v);}catch{/* Storage is optional. */}
 notify();return result;
}
const find=(collection,id)=>state[collection].find(x=>x.id===id);
function activeGrant(studentId,courseId) { return state.access_grants.some(g=>g.student_id===studentId && g.course_id===courseId && g.status==='active' && g.starts_at<=DEMO_NOW && g.ends_at>DEMO_NOW && find('enrollments',g.enrollment_id)?.status==='active'); }
function publicCourse(c) { return isPublic(state,c); }
function assistantAssignment(courseId) { return state.course_team_assignments.find(a=>a.course_id===courseId && a.status==='active' && state.teacher_team_members.some(m=>m.id===a.team_member_id && m.user_id===PERSONAS.assistant.user_id && m.status==='active' && (!m.expires_at || m.expires_at>DEMO_NOW))); }
export function can(action,resource={}) {
 const role=state.preferences.role, actor=PERSONAS[role];
 let r=typeof resource==='string' ? (Object.values(state).filter(Array.isArray).flat().find(x=>x.id===resource) ?? {module:resource}) : resource ?? {};
 const course=r.course_id?find('courses',r.course_id):r.owner_teacher_id?r:null;
 const module=r.module ?? (action.startsWith('finance.')?'finance':action.startsWith('people.')?'people':null);
 if(action==='public.read')return course?publicCourse(course):true;
 if(role==='visitor')return false;
 if(action==='order.read'&&['student','guardian'].includes(role))return r.buyer_user_id===actor.user_id;
 if(module) {
  if(!['finance','people','academics','courses','support','cms','settings','notifications','reports'].includes(module))return false;
  if(role==='super_admin' || (role==='admin_finance' && module==='finance'))return !action.includes('approve_payout') || r.prepared_by!==actor.user_id;
  return role==='admin_moderation' && ['people','courses','support'].includes(module) && r.type!=='employees';
 }
 if(action==='approve_payout')return ['admin_finance','super_admin'].includes(role) && !!r.prepared_by && r.prepared_by!==actor.user_id;
 if(role==='guardian') { const sid=r.student_id ?? (state.students.some(s=>s.id===r.id)?r.id:null);const scope=({ 'child.read':'progress','read_progress':'progress','read_results':'results','read_attendance':'attendance','purchase':'purchase' })[action];return !!scope && state.guardian_student_links.some(l=>l.guardian_id===actor.record_id && l.student_id===sid && l.state==='verified' && l.scopes.includes(scope)); }
 if(role==='student') {
  if(action==='purchase')return !r.student_id || r.student_id===actor.record_id;
  if(r.buyer_user_id)return r.buyer_user_id===actor.user_id && action==='order.read';
  if(!course)return r.id===actor.record_id && action==='profile.read';
  return ['read_content','course.read','conversation.read'].includes(action) && activeGrant(actor.record_id,course.id) && (!r.student_id || r.student_id===actor.record_id);
 }
 if(role==='teacher')return !!course && course.owner_teacher_id===actor.record_id && ['course.read','read_content','edit_content','grade_assignment','reply_conversation','conversation.read','earnings.read'].includes(action) && find('teachers',actor.record_id)?.account_status==='active';
 if(role==='assistant') {
  const a=course && assistantAssignment(course.id);if(!a)return false;
  if(r.kind==='lesson_qa' || r.kind==='private_support') { if(!state.conversation_assignments.some(ca=>ca.conversation_id===r.id && ca.assignee_user_id===actor.user_id && ca.status==='active'))return false; }
  if(action==='course.read'||action==='conversation.read')action='read_content';
  return a.capabilities.includes(action);
 }
 return false;
}
function decorateCourse(c) { const gs=find('grade_subjects',c.grade_subject_id);return {...c,grade:find('grades',gs.grade_id),subject:find('subjects',gs.subject_id),teacher:find('teachers',c.owner_teacher_id)}; }
// Verified qualifications grouped per subject with a grade range, e.g. "Mathematics · Grades 1–6".
function qualificationLabels(teacherId) {
 const bySubject=new Map();
 for(const q of state.teacher_grade_subjects.filter(x=>x.teacher_id===teacherId && x.verification_state==='verified')) { const gs=find('grade_subjects',q.grade_subject_id);bySubject.set(gs.subject_id,[...(bySubject.get(gs.subject_id)??[]),find('grades',gs.grade_id).number]); }
 return [...bySubject].map(([subjectId,numbers])=>{ const name=find('grade_subjects',state.teacher_grade_subjects.find(x=>x.teacher_id===teacherId && find('grade_subjects',x.grade_subject_id).subject_id===subjectId).grade_subject_id).display_name,sorted=numbers.sort((a,b)=>a-b),one=sorted.length===1,range=one?`${sorted[0]}`:sorted.at(-1)-sorted[0]===sorted.length-1?`${sorted[0]}–${sorted.at(-1)}`:sorted.join('، ');return {ar:`${name.ar} · ${one?'الصف':'الصفوف'} ${range}`,en:`${name.en} · ${one?'Grade':'Grades'} ${range.replaceAll('،',',')}`}; });
}
// ---- P2 public catalog. Public views read the approved published snapshot, never pending revisions,
// and locked lessons expose outline metadata only (no body/transcript/media).
const byPosition=(a,b)=>a.position-b.position;
const publicView=c=>{ const {published_snapshot,pending_revision,review_feedback,...visible}=c;return decorateCourse({...visible,...(published_snapshot??{})}); };
const publicTeachers=()=>state.teachers.filter(t=>t.application_status==='approved' && t.account_status==='active').map(t=>({...t,credentials:t.credentials.filter(c=>c.verified),qualifications:qualificationLabels(t.id),published_course_count:state.courses.filter(c=>c.owner_teacher_id===t.id && publicCourse(c)).length}));
const activeVersion=gs=>{ const v=find('curriculum_versions',gs.curriculum_version_id);return gs.active && v?.active && find('curricula',v.curriculum_id)?.active; };
const upcomingLive=courseId=>state.live_sessions.some(s=>s.course_id===courseId && ['scheduled','rescheduled','live'].includes(s.status) && s.ends_at>DEMO_NOW);
const courseLessons=courseId=>state.modules.filter(m=>m.course_id===courseId).sort(byPosition).flatMap(m=>state.lessons.filter(l=>l.module_id===m.id && l.state==='published').sort(byPosition));
export const CATALOG_FILTERS=['q','curriculum','year','grade','subject','teacher','semester','language','mode','price','max','availability'];
function catalogSearch(a) {
 const q=String(a.q??'').trim().toLowerCase(),max=Number(a.max);
 return state.courses.filter(publicCourse).filter(c=>{
  const gs=find('grade_subjects',c.grade_subject_id),version=find('curriculum_versions',gs.curriculum_version_id),teacher=find('teachers',c.owner_teacher_id),shown={...c,...(c.published_snapshot??{})};
  return (!a.grade||gs.grade_id===a.grade) && (!a.subject||gs.subject_id===a.subject) && (!a.curriculum||version?.curriculum_id===a.curriculum)
   && (!a.year||c.academic_year_id===a.year) && (!a.semester||c.semester_id===a.semester) && (!a.teacher||c.owner_teacher_id===a.teacher)
   && (!a.language||c.language===a.language) && (!a.mode||shown.mode===a.mode) && (!a.price||shown.price_type===a.price) && (!a.max||!Number.isFinite(max)||shown.price_baisa<=max)
   && (a.availability!=='preview'||courseLessons(c.id).some(l=>l.preview)) && (a.availability!=='live'||upcomingLive(c.id))
   && (!q||[shown.title.ar,shown.title.en,shown.summary.ar,shown.summary.en,teacher.name.ar,teacher.name.en].some(s=>s.toLowerCase().includes(q)));
 }).sort((x,y)=>find('grades',find('grade_subjects',x.grade_subject_id).grade_id).number-find('grades',find('grade_subjects',y.grade_subject_id).grade_id).number || x.id.localeCompare(y.id)).map(publicView);
}
function publicCourseDetail(id) {
 const c=find('courses',id);if(!c||!publicCourse(c))return null;
 const teacher=publicTeachers().find(t=>t.id===c.owner_teacher_id),gs=find('grade_subjects',c.grade_subject_id),version=find('curriculum_versions',gs.curriculum_version_id);
 const modules=state.modules.filter(m=>m.course_id===c.id).sort(byPosition).map(m=>({...m,lessons:state.lessons.filter(l=>l.module_id===m.id && l.state==='published').sort(byPosition).map(l=>l.preview?l:{id:l.id,module_id:l.module_id,title:l.title,type:l.type,position:l.position,duration_seconds:l.duration_seconds,preview:false})}));
 return {...publicView(c),teacher,modules,grade_subject:gs,curriculum:version&&find('curricula',version.curriculum_id),year:find('academic_years',c.academic_year_id),semester:find('semesters',c.semester_id),
  live_sessions:state.live_sessions.filter(s=>s.course_id===c.id && s.status!=='draft').sort((a,b)=>a.starts_at.localeCompare(b.starts_at)).map(({id:sid,title,starts_at,ends_at,timezone,status})=>({id:sid,title,starts_at,ends_at,timezone,status})),
  reviews_enabled:state.platform_settings[0]?.reviews_enabled===true};
}
// What the current persona can do on a public course page (no protected content).
function courseViewer(id,actor) {
 const role=state.preferences.role;
 if(role==='student') { const own=state.access_grants.filter(g=>g.student_id===actor.record_id && g.course_id===id),active=activeGrantIn(state,actor.record_id,id),last=own.filter(g=>g!==active).sort((a,b)=>a.ends_at.localeCompare(b.ends_at)).at(-1);return {role,active:!!active,grant:active??null,lapsed:!active&&last?{status:last.status==='active'?'expired':last.status,ends_at:last.ends_at}:null}; }
 if(role==='guardian')return {role,children:state.students.filter(s=>can('purchase',s)).map(s=>({id:s.id,name:s.name}))};
 return {role};
}
function applicationView() {
 const app=state.teacher_applications.find(a=>a.teacher_id===APPLICANT_TEACHER);if(!app)return null;
 return {application:app,teacher:find('teachers',APPLICANT_TEACHER),data:applicationData(state),editable:state.preferences.role==='visitor' && Object.hasOwn(APPLICANT_TRANSITIONS,app.state),visitorOnly:state.preferences.role!=='visitor'};
}
// Modules that own presentation registries (e.g. layout's role navigation) expose them as
// read-only selectors here instead of importing each other.
const extraSelectors=new Map();
export function registerSelectors(map) { for(const [name,fn] of Object.entries(map)) { if(extraSelectors.has(name))throw new Error(`Selector already registered: ${name}`);extraSelectors.set(name,fn); } }
export function select(selector,args={}) {
 const actor=PERSONAS[state.preferences.role];
 if(extraSelectors.has(selector))return extraSelectors.get(selector)(state,args,{actor,can});
 switch(selector) {
 case 'personas': return PERSONAS;
 case 'actor': return actor;
 case 'preferences': return state.preferences;
 case 'grades': return state.grades;
 case 'subjects': return state.subjects;
 case 'curricula': return state.curricula.filter(c=>c.active);
 case 'catalog': case 'publishedCatalog': return state.courses.filter(publicCourse).filter(c=>!args.gradeId || find('grade_subjects',c.grade_subject_id).grade_id===args.gradeId).filter(c=>!args.subjectId || find('grade_subjects',c.grade_subject_id).subject_id===args.subjectId).slice(0,args.limit??Infinity).map(publicView);
 case 'featuredCourses': { const featured=state.cms_pages.find(p=>p.slug==='home')?.sections.find(s=>s.kind==='featured')?.course_ids??[];const picked=featured.map(id=>find('courses',id)).filter(c=>c&&publicCourse(c));return (picked.length?picked:state.courses.filter(publicCourse)).slice(0,args.limit??4).map(publicView); }
 case 'homeBanner': return state.cms_pages.find(p=>p.slug==='home')?.sections.find(s=>s.kind==='banner')??null;
 case 'cycles': { const published=state.courses.filter(publicCourse);return [...new Set(state.grades.map(g=>g.cycle_key))].map(key=>{const grades=state.grades.filter(g=>g.cycle_key===key);return {key,label:grades[0].cycle_label,grades,course_count:published.filter(c=>grades.some(g=>g.id===find('grade_subjects',c.grade_subject_id).grade_id)).length};}); }
 case 'featuredTeachers': return state.teachers.filter(t=>t.application_status==='approved' && t.account_status==='active').map(t=>({...t,qualifications:qualificationLabels(t.id),published_course_count:state.courses.filter(c=>c.owner_teacher_id===t.id && publicCourse(c)).length})).filter(t=>!args.withCourses || t.published_course_count>0).slice(0,args.limit??Infinity);
 // Assistants keep course-linked notices only while that course assignment is active (revocation hides them).
 case 'notifications': return state.notifications.filter(n=>n.recipient_user_id===actor.user_id&&guardianNoticeVisible(state,actor,n)&&(state.preferences.role!=='assistant'||!n.related_course_id||!!assistantAssignment(n.related_course_id)));
 case 'notifications.count': return select('notifications').filter(n=>!n.read_at).length;
 case 'guardian.children': return state.students.filter(s=>can('child.read',s));
 case 'scopedCourses': return state.courses.filter(c=>can('course.read',c)).map(decorateCourse);
 case 'scopedConversations': return state.conversations.filter(c=>can('conversation.read',c));
 case 'catalog.search': return catalogSearch(args);
 case 'catalog.facets': return {curricula:state.curricula.filter(c=>c.active),years:state.academic_years,semesters:state.semesters.map(s=>({...s,year:find('academic_years',s.academic_year_id)})),teachers:publicTeachers().filter(t=>t.published_course_count>0),languages:['ar','en'],modes:['recorded','live','hybrid']};
 case 'course.public': return publicCourseDetail(args.id);
 case 'course.viewer': return courseViewer(args.id,actor);
 case 'gradeLanding': { const grade=find('grades',args.gradeId);if(!grade)return null;const courses=catalogSearch({grade:grade.id});return {grade,courses,subjects:state.grade_subjects.filter(gs=>gs.grade_id===grade.id && activeVersion(gs)).map(gs=>({...find('subjects',gs.subject_id),display_name:gs.display_name,course_count:courses.filter(c=>c.subject.id===gs.subject_id).length}))}; }
 case 'gradeSubject': { const gs=state.grade_subjects.find(x=>x.grade_id===args.gradeId && x.subject_id===args.subjectId && activeVersion(x));return gs?{...gs,grade:find('grades',gs.grade_id),subject:find('subjects',gs.subject_id)}:null; }
 case 'gradeSubjects.byGrade': return state.grades.map(g=>({...g,pairs:state.grade_subjects.filter(gs=>gs.grade_id===g.id && activeVersion(gs)).map(gs=>({...gs,subject:find('subjects',gs.subject_id)}))}));
 case 'teacherDirectory': return publicTeachers().filter(t=>(!args.grade&&!args.subject) || state.teacher_grade_subjects.some(q=>{ const gs=find('grade_subjects',q.grade_subject_id);return q.teacher_id===t.id && q.verification_state==='verified' && (!args.grade||gs.grade_id===args.grade) && (!args.subject||gs.subject_id===args.subject); }));
 case 'teacher.public': { const teacher=publicTeachers().find(t=>t.id===args.id);return teacher?{...teacher,courses:catalogSearch({teacher:teacher.id})}:null; }
 case 'cmsPage': return ['about','help','privacy','terms','refunds'].includes(args.slug)?state.cms_pages.find(p=>p.slug===args.slug)??null:null;
 case 'faqs': { const q=String(args.q??'').trim().toLowerCase();return (state.cms_pages.find(p=>p.slug==='help')?.sections??[]).filter(s=>s.kind==='faq' && (!q||[s.title.ar,s.title.en,s.body.ar,s.body.en].some(x=>x.toLowerCase().includes(q)))); }
 case 'form': return state.transient.forms?.[args.name] ?? {values:{},fieldErrors:{},done:false};
 case 'application.current': return applicationView();
 case 'resource': { const allowed=['courses','students','teachers','conversations','orders','payout_batches','grades','subjects'];if(!allowed.includes(args.collection))return {status:'missing',record:null};const record=find(args.collection,args.id);if(!record)return {status:'missing',record:null};if(!can(args.action??'course.read',record))return {status:'denied',record:null};return {status:'ok',record}; }
 default: throw new Error(`Unknown selector: ${selector}`);
 }
}

// P3 checkout: integer-baisa snapshots and append-only fulfillment records.
const ACCESS_END='2027-07-31T19:59:59Z';
function purchaseStudent(s,actor,id) {
 if(s.preferences.role==='student')return id===actor.record_id;
 return s.preferences.role==='guardian' && s.guardian_student_links.some(l=>l.guardian_id===actor.record_id&&l.student_id===id&&l.state==='verified'&&l.scopes.includes('purchase'));
}
function checkoutContext(s,{courseId,studentId},{actor}) {
 const course=s.courses.find(c=>c.id===courseId);
 if(!course||!isPublic(s,course))return {status:'missing'};
 if(!['student','guardian'].includes(s.preferences.role))return {status:'denied'};
 const children=s.students.filter(x=>purchaseStudent(s,actor,x.id)).map(x=>({id:x.id,name:x.name,grade:s.grades.find(g=>g.id===x.current_grade_id)?.name??null}));
 const sid=studentId??(s.preferences.role==='student'?actor.record_id:null);
 if(sid&&!purchaseStudent(s,actor,sid))return {status:'denied'};
 const student=children.find(x=>x.id===sid)??null;
 return {status:'ok',course:publicView(course),buyer:s.users.find(u=>u.id===actor.user_id),children,student,hasAccess:!!student&&!!activeGrantIn(s,sid,courseId),accessEnd:ACCESS_END};
}
function ownedOrder(s,id,actor) {
 const order=s.orders.find(o=>o.id===id);
 if(!order)return {status:'missing'};
 if(!['student','guardian'].includes(s.preferences.role)||order.buyer_user_id!==actor.user_id)return {status:'denied'};
 const items=s.order_items.filter(i=>i.order_id===id).map(i=>({...i,beneficiary_name:i.beneficiary_name_snapshot??s.students.find(x=>x.id===i.beneficiary_student_id)?.name}));
 const transactions=s.payment_transactions.filter(x=>x.order_id===id).sort((a,b)=>a.attempt_no-b.attempt_no);
 return {status:'ok',order,items,transactions,transaction:transactions.at(-1)??null,buyer:s.users.find(u=>u.id===actor.user_id),outcome:order.state==='paid'?'success':order.state==='failed'?'failure':order.state==='pending'?'pending':order.state==='draft'?'initiated':order.state};
}
function commission(s,c,base) {
 const priority={campaign:3,teacher:2,default:1};
 const rule=s.commission_rules.filter(r=>r.active&&r.active_from<=DEMO_NOW&&(!r.active_until||r.active_until>DEMO_NOW)&&(!r.course_id||r.course_id===c.id)&&(!r.teacher_id||r.teacher_id===c.owner_teacher_id)).sort((a,b)=>(priority[b.scope]??0)-(priority[a.scope]??0)||b.version-a.version||b.active_from.localeCompare(a.active_from))[0];
 if(!rule||!Number.isInteger(rule.rate_bps)||rule.rate_bps<0||rule.rate_bps>10000)return null;
 const platform=Math.round(base*rule.rate_bps/10000);
 return {rule_id:rule.id,version:rule.version,base_baisa:base,rate_bps:rule.rate_bps,platform_baisa:platform,teacher_baisa:base-platform};
}
function newAttempt(s,order) {
 const attempts=s.payment_transactions.filter(x=>x.order_id===order.id),id=nextId(s.payment_transactions,'PAY');
 const tx={id,order_id:order.id,provider_ref:'DEMO-'+id,attempt_no:Math.max(0,...attempts.map(x=>x.attempt_no))+1,state:'initiated',amount_baisa:order.total_baisa,currency:order.currency,confirmed_at:null,verified_demo:false,created_at:DEMO_NOW,updated_at:DEMO_NOW};
 s.payment_transactions.push(tx);return tx;
}
function fulfill(s,order,item,free=false) {
 // A settled item is never fulfilled again, even after its grant expires or is refunded.
 if(s.access_grants.some(g=>g.source_id===item.id)||s.earning_allocations.some(a=>a.order_item_id===item.id))return;
 const student=s.students.find(x=>x.id===item.beneficiary_student_id);
 let enrollment=s.enrollments.find(e=>e.student_id===student.id&&e.course_id===item.course_id);
 if(!enrollment){enrollment={id:nextId(s.enrollments,'EN'),student_id:student.id,course_id:item.course_id,status:'active',started_at:DEMO_NOW,historical_grade_id:student.current_grade_id,created_at:DEMO_NOW,updated_at:DEMO_NOW};s.enrollments.push(enrollment);}
 s.access_grants.push({id:nextId(s.access_grants,'AG'),student_id:student.id,course_id:item.course_id,enrollment_id:enrollment.id,origin:free?'complimentary':'one_time_purchase',source_id:item.id,starts_at:DEMO_NOW,ends_at:item.access_end_snapshot??ACCESS_END,status:'active',created_at:DEMO_NOW,updated_at:DEMO_NOW});
 if(!free){
  const snap=item.commission_snapshot;
  s.earning_allocations.push({id:nextId(s.earning_allocations,'EA'),order_item_id:item.id,teacher_id:item.owner_teacher_id_snapshot,snapshot:structuredClone(snap),amount_baisa:snap.teacher_baisa,state:'pending',original_allocation_id:null,hold_reason:{ar:'فترة انتظار تجريبية',en:'Demo hold'},eligible_at:'2026-10-26T08:00:00Z',created_at:DEMO_NOW,updated_at:DEMO_NOW});
  for(const [account,debit,credit] of [['provider_clearing',item.total_baisa,0],['platform_commission',0,snap.platform_baisa],['teacher_pending',0,snap.teacher_baisa]])s.financial_ledger_entries.push({id:nextId(s.financial_ledger_entries,'LE'),journal_id:'J-SALE-'+item.id,account,teacher_id:item.owner_teacher_id_snapshot,source_type:'order_item',source_id:item.id,debit_baisa:debit,credit_baisa:credit,currency:'OMR',created_at:DEMO_NOW,reversal_of:null});
 }
 for(const recipient of new Set([order.buyer_user_id,student.user_id])){
  const n={id:nextId(s.notifications,'N'),recipient_user_id:recipient,event_id:'checkout-'+item.id,type:'enrollment',title:{ar:'تم تفعيل الوصول للدورة',en:'Course access activated'},body:structuredClone(item.title_snapshot),href:recipient===student.user_id?'#/student/course/'+item.course_id:'#/guardian/child/'+student.id,read_at:null,related_course_id:item.course_id,created_at:DEMO_NOW};s.notifications.push(n);
  s.delivery_attempts.push({id:nextId(s.delivery_attempts,'DA'),notification_id:n.id,channel:'in_app',state:'sent',attempts:1,last_error:null,created_at:DEMO_NOW,updated_at:DEMO_NOW});
 }
}
function createCheckout(s,p,{actor},free=false) {
 const c=checkoutContext(s,p,{actor});
 if(c.status!=='ok')return fail(c.status==='missing'?'error.courseUnavailable':'resourceDenied');
 if(!c.student)return fail('p3.chooseStudent');
 if(p.consent!==true&&p.consent!=='on')return fail('error.consent');
 if((c.course.price_type==='free')!==free)return fail('p3.invalidCheckout');
 // Repeated confirmation reuses this buyer's unsettled order, or the settled order behind current access.
 // A paid order whose access has lapsed is history; it never blocks a new purchase.
 const previous=s.orders.filter(o=>o.buyer_user_id===actor.user_id&&(c.hasAccess?o.state==='paid':['draft','pending','failed'].includes(o.state))&&s.order_items.some(i=>i.order_id===o.id&&i.course_id===p.courseId&&i.beneficiary_student_id===c.student.id&&(!c.hasAccess||s.access_grants.some(g=>g.source_id===i.id&&g.status==='active')))).at(-1);
 if(previous)return ok({orderId:previous.id});
 if(c.hasAccess)return fail('p3.already');
 const enrollment=s.enrollments.find(e=>e.student_id===c.student.id&&e.course_id===p.courseId);
 if(enrollment&&enrollment.status!=='active')return fail('error.enrollmentSuspended');
 const price=free?0:c.course.price_baisa,snapshot=commission(s,c.course,price);
 if(!snapshot||!Number.isInteger(price)||price<0||(!free&&price===0))return fail('p3.invalidCheckout');
 const order={id:nextId(s.orders,'O'),buyer_user_id:actor.user_id,state:free?'paid':'draft',currency:'OMR',subtotal_baisa:price,discount_baisa:0,tax_baisa:0,total_baisa:price,created_at:DEMO_NOW,updated_at:DEMO_NOW};
 const item={id:nextId(s.order_items,'OI'),order_id:order.id,course_id:c.course.id,beneficiary_student_id:c.student.id,beneficiary_name_snapshot:structuredClone(c.student.name),title_snapshot:structuredClone(c.course.title),owner_teacher_id_snapshot:c.course.owner_teacher_id,price_baisa:price,discount_baisa:0,tax_baisa:0,total_baisa:price,commission_snapshot:snapshot,access_end_snapshot:ACCESS_END,created_at:DEMO_NOW};
 s.orders.push(order);s.order_items.push(item);
 if(free)fulfill(s,order,item,true);else newAttempt(s,order);
 return ok({orderId:order.id});
}
Object.assign(reducers,{
 'checkout.createOrder':(s,p,ctx)=>createCheckout(s,p,ctx),
 'checkout.activateFree':(s,p,ctx)=>createCheckout(s,p,ctx,true),
 'payment.retry':(s,p,{actor})=>{
  const d=ownedOrder(s,p.orderId,actor);if(d.status!=='ok')return fail(d.status==='missing'?'missing':'resourceDenied');
  if(d.transaction?.state==='initiated')return ok({transactionId:d.transaction.id,orderId:d.order.id});
  if(d.order.state!=='failed'||d.transaction?.state!=='failed')return fail('p3.invalidCheckout');
  const tx=newAttempt(s,d.order);d.order.state='draft';d.order.updated_at=DEMO_NOW;return ok({transactionId:tx.id,orderId:d.order.id});
 },
 'payment.processEvent':(s,event,{actor})=>{
  const tx=s.payment_transactions.find(x=>x.id===event.payment_transaction_id),p=event.payload;
  if(!tx||!p||typeof event.event_id!=='string'||!/^DEMO-[A-Za-z0-9-]{1,100}$/.test(event.event_id))return fail('p3.eventRejected');
  const d=ownedOrder(s,tx.order_id,actor);if(d.status!=='ok')return fail('resourceDenied');
  const ids=d.items.map(i=>i.beneficiary_student_id).sort();
  if(p.order_id!==tx.order_id||p.currency!=='OMR'||p.currency!==tx.currency||!Number.isInteger(p.amount_baisa)||p.amount_baisa!==tx.amount_baisa||p.amount_baisa!==d.order.total_baisa||!Array.isArray(p.beneficiary_ids)||JSON.stringify([...p.beneficiary_ids].sort())!==JSON.stringify(ids)||!['success','pending','failure'].includes(p.outcome))return fail('p3.eventRejected');
  const old=s.provider_events.find(e=>e.event_id===event.event_id);
  if(old)return old.payment_transaction_id===tx.id&&JSON.stringify(old.payload)===JSON.stringify(p)?ok({orderId:d.order.id,replayed:true}):fail('p3.eventRejected');
  // Historical refunded orders cannot be resurrected by the simulator.
  if(!['draft','pending','failed','paid'].includes(d.order.state))return fail('p3.invalidCheckout');
  // A failed attempt is final: only a retry (new transaction) may carry further outcomes.
  if(tx.state==='failed')return fail('p3.retryFirst');
  s.provider_events.push({id:nextId(s.provider_events,'PE'),event_id:event.event_id,payment_transaction_id:tx.id,payload:structuredClone(p),verified_demo:true,processed_at:DEMO_NOW,created_at:DEMO_NOW});
  if(d.order.state==='paid'||tx.state==='succeeded')return ok({orderId:d.order.id,settled:true});
  if(p.outcome==='success'){
   d.order.state='paid';tx.state='succeeded';tx.confirmed_at=DEMO_NOW;
   for(const item of d.items)fulfill(s,d.order,item);
  }else if(tx.id===d.transaction.id){d.order.state=p.outcome==='pending'?'pending':'failed';tx.state=d.order.state;}
  tx.verified_demo=true;tx.updated_at=DEMO_NOW;d.order.updated_at=DEMO_NOW;
  return ok({orderId:d.order.id});
 }
});
registerSelectors({
 'checkout.context':checkoutContext,
 'checkout.order':(s,a,{actor})=>ownedOrder(s,a.orderId,actor),
 'checkout.result':(s,a,{actor})=>ownedOrder(s,a.orderId,actor),
 'checkout.ledger':(s,a,{actor})=>{const d=ownedOrder(s,a.orderId,actor);return d.status==='ok'?s.financial_ledger_entries.filter(e=>e.source_type==='order_item'&&d.items.some(i=>i.id===e.source_id)):[];},
 'checkout.event':(s,a,{actor})=>{
  const d=ownedOrder(s,a.orderId,actor);if(d.status!=='ok'||!d.transaction)return null;
  if(a.replay)return s.provider_events.filter(e=>e.payment_transaction_id===d.transaction.id).at(-1)??null;
  return {event_id:'DEMO-CHECKOUT-'+nextId(s.provider_events,'PE'),payment_transaction_id:d.transaction.id,payload:{order_id:d.order.id,beneficiary_ids:d.items.map(i=>i.beneficiary_student_id),amount_baisa:d.order.total_baisa,currency:d.order.currency,outcome:a.outcome}};
 }
});

// ---- P4 student learning. The acting student always comes from the persona, never from payload IDs;
// course content requires an active grant (valid window + active enrollment), checked on read and write.
const DAY=86400000;
const REPORT_REASONS={unsafe:{ar:'محتوى غير آمن',en:'Unsafe content'},inappropriate:{ar:'لغة غير لائقة',en:'Inappropriate language'},privacy:{ar:'مشاركة معلومات خاصة',en:'Private information shared'},other:{ar:'سبب آخر',en:'Other reason'}};
export const STUDENT_PREFS=['in_app','email_digest','live_reminders','qa_replies','results'];
const SUBMISSION_FILE=/^[\w؀-ۿ][\w؀-ۿ .()-]{0,75}\.(txt|pdf|docx?|png|jpe?g)$/i;
const JOINABLE=['scheduled','rescheduled','live'];
const studentOf=(s,actor)=>s.preferences.role==='student'?s.students.find(x=>x.id===actor.record_id)??null:null;
const lessonsIn=(s,courseId)=>s.modules.filter(m=>m.course_id===courseId).sort(byPosition).flatMap(m=>s.lessons.filter(l=>l.module_id===m.id&&l.state==='published').sort(byPosition));
const lessonCourse=(s,lesson)=>s.modules.find(m=>m.id===lesson?.module_id)?.course_id??null;
const ownProgress=(s,sid,courseId)=>{const ids=new Set(lessonsIn(s,courseId).map(l=>l.id));return s.lesson_progress.filter(p=>p.student_id===sid&&ids.has(p.lesson_id));};
const percentOf=(done,total)=>total?Math.round(done*100/total):0;
const userName=(s,id)=>s.users.find(u=>u.id===id)?.name??null;
function accessOf(s,sid,courseId) {
 const active=activeGrantIn(s,sid,courseId);if(active)return {state:'active',grant:active};
 const last=s.access_grants.filter(g=>g.student_id===sid&&g.course_id===courseId).sort((a,b)=>a.ends_at.localeCompare(b.ends_at)||a.updated_at.localeCompare(b.updated_at)).at(-1);
 if(!last)return {state:'none',grant:null};
 const suspended=s.enrollments.find(e=>e.id===last.enrollment_id)?.status!=='active';
 return {state:last.status==='revoked'||suspended?'revoked':'expired',grant:last};
}
// Students only see the live states that concern them; unpublished recording pipeline states read as ended.
const studentLiveStatus=status=>['recording_processing','recording_ready'].includes(status)?'ended':status;
function courseRow(s,sid,courseId) {
 const c=s.courses.find(x=>x.id===courseId);if(!c)return null;
 const lessons=lessonsIn(s,courseId),progress=ownProgress(s,sid,courseId),done=progress.filter(p=>p.status==='done').length,access=accessOf(s,sid,courseId);
 const next=lessons.find(l=>progress.find(p=>p.lesson_id===l.id)?.status!=='done')??null,percent=percentOf(done,lessons.length);
 return {course:publicView(c),status:c.status,access,done,total:lessons.length,percent,next,purchasable:isPublic(s,c),
  enrollment:s.enrollments.find(e=>e.student_id===sid&&e.course_id===courseId)??null,
  last_activity:progress.map(p=>p.updated_at).sort().at(-1)??null,
  tab:access.state!=='active'?'expired':percent===100?'completed':'active'};
}
function studentCourses(s,sid) { return [...new Set([...s.enrollments,...s.access_grants].filter(r=>r.student_id===sid).map(r=>r.course_id))].map(id=>courseRow(s,sid,id)).filter(Boolean); }
const activeCourseIds=(s,sid)=>new Set(studentCourses(s,sid).filter(r=>r.access.state==='active').map(r=>r.course.id));
function quizView(s,sid,q) {
 const attempts=s.attempts.filter(a=>a.quiz_id===q.id&&a.student_id===sid).sort((a,b)=>a.submitted_at.localeCompare(b.submitted_at)||a.id.localeCompare(b.id));
 // Correct answers stay in the store; the learner sees them only through their own submitted snapshot.
 const questions=q.question_ids.map(id=>s.questions.find(x=>x.id===id)).filter(Boolean).map(({correct_choice_id,...x})=>x);
 const best=attempts.length?Math.max(...attempts.map(a=>a.score)):null;
 return {...q,kind:'quiz',questions,attempts,best,last:attempts.at(-1)??null,remaining:Math.max(0,q.attempt_limit-attempts.length),passed:best!==null&&best>=q.pass_score};
}
function assignmentView(s,sid,a) {
 const submission=s.submissions.find(x=>x.assignment_id===a.id&&x.student_id===sid)??null;
 const grade=submission&&s.assessment_grades.find(g=>g.submission_id===submission.id&&g.released_at&&g.released_at<=DEMO_NOW);
 // Graded-but-unreleased work still reads as submitted to the learner.
 const state=!submission?'not_submitted':grade?'released':'submitted';
 return {...a,kind:'assignment',submission,state,grade:grade?{score:grade.score,feedback:grade.feedback,released_at:grade.released_at}:null,late:!submission&&a.due_at<DEMO_NOW,late_submission:!!submission&&submission.submitted_at>a.due_at};
}
function studentWork(s,sid) {
 const ids=activeCourseIds(s,sid),published=id=>s.lessons.find(l=>l.id===id)?.state==='published',title=id=>publicView(s.courses.find(c=>c.id===id)).title;
 const assignments=s.assignments.filter(a=>ids.has(a.course_id)&&published(a.lesson_id)).map(a=>({...assignmentView(s,sid,a),course_title:title(a.course_id)})).sort((a,b)=>a.due_at.localeCompare(b.due_at));
 const quizzes=s.quizzes.filter(q=>ids.has(q.course_id)&&published(q.lesson_id)).map(q=>({...quizView(s,sid,q),course_title:title(q.course_id)}));
 return {assignments,quizzes};
}
function sessionView(s,sid,x) { const attendance=s.attendance.find(a=>a.live_session_id===x.id&&a.student_id===sid)??null;return {...x,student_status:studentLiveStatus(x.status),attendance,joinable:JOINABLE.includes(x.status)&&x.ends_at>DEMO_NOW}; }
function visibleMessages(s,conversationId,sid) {
 const student=s.students.find(x=>x.id===sid);
 return s.messages.filter(m=>m.conversation_id===conversationId&&!m.internal&&m.moderation_state!=='removed').sort((a,b)=>a.created_at.localeCompare(b.created_at)).map(m=>{
  const mine=m.author_user_id===student?.user_id,learner=s.students.find(x=>x.user_id===m.author_user_id),teacher=s.teachers.find(x=>x.user_id===m.author_user_id);
  // Other learners stay anonymous ("Classmate"); staff replies keep their attribution.
  return {id:m.id,text:m.text,lang:m.lang,created_at:m.created_at,flagged:m.moderation_state==='flagged',own:mine,author_role:mine?'self':learner?'classmate':teacher?'teacher':s.teacher_team_members.some(x=>x.user_id===m.author_user_id)?'assistant':'staff',author_name:mine||learner?null:userName(s,m.author_user_id)};
 });
}
function learningRoom(s,{courseId},{actor}) {
 const st=studentOf(s,actor);if(!st)return {status:'denied'};
 const c=s.courses.find(x=>x.id===courseId);if(!c)return {status:'missing'};
 const access=accessOf(s,st.id,c.id);
 // Without a grant: public courses show purchase recovery, own lapsed history shows its recovery, anything else is a scoped denial.
 if(access.state!=='active')return access.state==='none'&&!isPublic(s,c)?{status:'denied'}:{status:'locked',course:publicView(c),access,purchasable:isPublic(s,c)};
 const progress=new Map(ownProgress(s,st.id,c.id).map(p=>[p.lesson_id,p]));
 const modules=s.modules.filter(m=>m.course_id===c.id).sort(byPosition).map(m=>({id:m.id,title:m.title,position:m.position,lessons:s.lessons.filter(l=>l.module_id===m.id&&l.state==='published').sort(byPosition).map(l=>({...l,progress:progress.get(l.id)??null,status:progress.get(l.id)?.status??'not_started'}))}));
 const lessons=modules.flatMap(m=>m.lessons),lessonIds=new Set(lessons.map(l=>l.id)),done=lessons.filter(l=>l.status==='done').length;
 const conversations=s.conversations.filter(q=>q.course_id===c.id&&(q.student_id===st.id||q.kind==='lesson_qa')).sort((a,b)=>b.last_message_at.localeCompare(a.last_message_at)).map(q=>({...q,own:q.student_id===st.id,lesson:lessons.find(l=>l.id===q.lesson_id)??null,messages:visibleMessages(s,q.id,st.id)}));
 return {status:'ok',student:st,course:publicView(c),archived:c.status!=='Published',access,enrollment:s.enrollments.find(e=>e.id===access.grant.enrollment_id),
  modules,lessons,done,total:lessons.length,percent:percentOf(done,lessons.length),next:lessons.find(l=>l.status!=='done')??null,
  teacher:s.teachers.find(x=>x.id===c.owner_teacher_id),
  resources:s.lesson_resources.filter(r=>lessonIds.has(r.lesson_id)).map(r=>({...r,lesson:lessons.find(l=>l.id===r.lesson_id)})),
  quizzes:s.quizzes.filter(q=>q.course_id===c.id&&lessonIds.has(q.lesson_id)).map(q=>quizView(s,st.id,q)),
  assignments:s.assignments.filter(a=>a.course_id===c.id&&lessonIds.has(a.lesson_id)).map(a=>assignmentView(s,st.id,a)),
  sessions:s.live_sessions.filter(x=>x.course_id===c.id&&x.status!=='draft').sort((a,b)=>a.starts_at.localeCompare(b.starts_at)).map(x=>sessionView(s,st.id,x)),
  recordings:s.recordings.filter(r=>r.course_id===c.id&&r.state==='published'),
  conversations,reported:new Set(s.safety_reports.filter(r=>r.reporter_user_id===st.user_id).map(r=>r.message_id)),
  announcements:s.announcements.filter(a=>a.course_id===c.id&&a.published_at<=DEMO_NOW).sort((a,b)=>b.published_at.localeCompare(a.published_at)).map(a=>({...a,author:s.users.find(u=>u.id===a.author_user_id)??null}))};
}
// Four weekly buckets ending at the demo clock, counted from the learner's own records (student + guardian views).
function weeklyActivity(s,sid) {
 const now=Date.parse(DEMO_NOW),events=[
  ...s.lesson_progress.filter(p=>p.student_id===sid&&p.status==='done').map(p=>['lessons',p.completed_at]),
  ...s.attempts.filter(a=>a.student_id===sid).map(a=>['assessments',a.submitted_at]),
  ...s.submissions.filter(x=>x.student_id===sid).map(x=>['assessments',x.submitted_at]),
  ...s.attendance.filter(a=>a.student_id===sid&&a.status==='present').map(a=>['live',a.joined_at])];
 const weeks=[3,2,1,0].map(i=>{const end=now-i*7*DAY,start=end-7*DAY,hit=events.filter(([,at])=>{const time=Date.parse(at);return time>start&&time<=end;});return {start:new Date(start+DAY).toISOString(),end:new Date(end).toISOString(),lessons:hit.filter(e=>e[0]==='lessons').length,assessments:hit.filter(e=>e[0]==='assessments').length,live:hit.filter(e=>e[0]==='live').length};});
 return {events,weeks};
}
function dashboard(s,_a,{actor}) {
 const st=studentOf(s,actor);if(!st)return null;
 const rows=studentCourses(s,st.id),active=rows.filter(r=>r.access.state==='active'),ids=new Set(active.map(r=>r.course.id));
 const current=s.lesson_progress.filter(p=>p.student_id===st.id&&p.status==='in_progress').map(p=>({progress:p,lesson:s.lessons.find(l=>l.id===p.lesson_id)})).filter(x=>x.lesson?.state==='published'&&ids.has(lessonCourse(s,x.lesson))).sort((a,b)=>b.progress.updated_at.localeCompare(a.progress.updated_at))[0];
 const resume=current?{lesson:current.lesson,progress:current.progress,row:active.find(r=>r.course.id===lessonCourse(s,current.lesson))}:active.filter(r=>r.next).map(r=>({lesson:r.next,progress:null,row:r}))[0]??null;
 const {events,weeks}=weeklyActivity(s,st.id);
 const work=studentWork(s,st.id);
 const due=[...work.assignments.filter(a=>a.state==='not_submitted').map(a=>({...a,sort:a.due_at})),...work.quizzes.filter(q=>!q.attempts.length).map(q=>({...q,sort:'9999'}))].sort((a,b)=>a.sort.localeCompare(b.sort));
 const sessions=s.live_sessions.filter(x=>ids.has(x.course_id)).map(x=>sessionView(s,st.id,x)).filter(x=>x.joinable).sort((a,b)=>a.starts_at.localeCompare(b.starts_at));
 const notifications=s.notifications.filter(n=>n.recipient_user_id===st.user_id).sort((a,b)=>b.created_at.localeCompare(a.created_at));
 return {student:st,grade:s.grades.find(g=>g.id===st.current_grade_id),active,resume,weeks,due,next_live:sessions[0]?{...sessions[0],course:publicView(s.courses.find(c=>c.id===sessions[0].course_id))}:null,
  unread:notifications.filter(n=>!n.read_at),recommended:catalogSearch({grade:st.current_grade_id}).filter(c=>!ids.has(c.id)).slice(0,4),
  totals:{courses:active.length,lessons:events.filter(e=>e[0]==='lessons').length,completed:rows.filter(r=>r.tab==='completed').length}};
}
function calendar(s,_a,{actor}) {
 const st=studentOf(s,actor);if(!st)return null;const ids=activeCourseIds(s,st.id),title=id=>publicView(s.courses.find(c=>c.id===id)).title;
 return {sessions:s.live_sessions.filter(x=>ids.has(x.course_id)&&x.status!=='draft').map(x=>({...sessionView(s,st.id,x),course_title:title(x.course_id)})).sort((a,b)=>a.starts_at.localeCompare(b.starts_at)),
  deadlines:studentWork(s,st.id).assignments.map(a=>({id:a.id,course_id:a.course_id,title:a.title,course_title:a.course_title,due_at:a.due_at,state:a.state,late:a.late}))};
}
function ownConversation(s,id,st) { const q=s.conversations.find(x=>x.id===id);return q&&q.student_id===st.id&&activeGrantIn(s,st.id,q.course_id)?q:null; }
function conversationList(s,_a,{actor}) {
 const st=studentOf(s,actor);if(!st)return [];
 return s.conversations.filter(q=>ownConversation(s,q.id,st)).sort((a,b)=>b.last_message_at.localeCompare(a.last_message_at)).map(q=>{const messages=visibleMessages(s,q.id,st.id);return {...q,course_title:publicView(s.courses.find(c=>c.id===q.course_id)).title,count:messages.length,last:messages.at(-1)??null};});
}
function thread(s,{id},{actor}) {
 const st=studentOf(s,actor);if(!st)return {status:'denied'};const q=s.conversations.find(x=>x.id===id);if(!q)return {status:'missing'};
 if(!ownConversation(s,id,st))return {status:'denied'};
 return {status:'ok',conversation:q,course:publicView(s.courses.find(c=>c.id===q.course_id)),lesson:s.lessons.find(l=>l.id===q.lesson_id)??null,messages:visibleMessages(s,q.id,st.id),reported:new Set(s.safety_reports.filter(r=>r.reporter_user_id===st.user_id).map(r=>r.message_id))};
}
function profile(s,_a,{actor}) {
 const st=studentOf(s,actor);if(!st)return null;const rows=studentCourses(s,st.id);
 return {student:st,user:s.users.find(u=>u.id===st.user_id),grade:s.grades.find(g=>g.id===st.current_grade_id),interests:st.interests.map(id=>s.subjects.find(x=>x.id===id)).filter(Boolean),
  history:rows.map(r=>({...r,historical_grade:s.grades.find(g=>g.id===r.enrollment?.historical_grade_id)??null})).sort((a,b)=>(b.enrollment?.started_at??'').localeCompare(a.enrollment?.started_at??'')),
  stats:{active:rows.filter(r=>r.access.state==='active').length,completed:rows.filter(r=>r.tab==='completed').length,lessons:s.lesson_progress.filter(p=>p.student_id===st.id&&p.status==='done').length,quizzes:s.attempts.filter(a=>a.student_id===st.id).length,submissions:s.submissions.filter(x=>x.student_id===st.id).length,live:s.attendance.filter(a=>a.student_id===st.id&&a.status==='present').length}};
}
function settings(s,_a,{actor}) {
 const st=studentOf(s,actor);if(!st)return null;
 return {student:st,user:s.users.find(u=>u.id===st.user_id),prefs:Object.fromEntries(STUDENT_PREFS.map(k=>[k,st.notification_prefs?.[k]??true])),
  guardians:s.guardian_student_links.filter(l=>l.student_id===st.id&&l.state==='verified').map(l=>({id:l.id,relationship:l.relationship,scopes:l.scopes,verified_at:l.verified_at,guardian:s.guardians.find(g=>g.id===l.guardian_id)}))};
}
function resourceFor(s,{id},{actor}) { const st=studentOf(s,actor),r=s.lesson_resources.find(x=>x.id===id),lesson=s.lessons.find(l=>l.id===r?.lesson_id);return st&&lesson?.state==='published'&&activeGrantIn(s,st.id,lessonCourse(s,lesson))?r:null; }
registerSelectors({
 'student.courses':(s,_a,{actor})=>{const st=studentOf(s,actor);return st?studentCourses(s,st.id):[];},
 'student.room':learningRoom,'student.dashboard':dashboard,'student.calendar':calendar,
 'student.work':(s,_a,{actor})=>{const st=studentOf(s,actor);return st?studentWork(s,st.id):{assignments:[],quizzes:[]};},
 'student.conversations':conversationList,'student.thread':thread,'student.profile':profile,'student.settings':settings,'student.resource':resourceFor,
 'student.entitledCourses':(s,_a,{actor})=>{const st=studentOf(s,actor);return st?studentCourses(s,st.id).filter(r=>r.access.state==='active').map(r=>r.course):[];},
});
// Shared reducer guard: acting student + existing course + active grant.
function learner(s,actor,courseId) {
 const student=studentOf(s,actor);if(!student)return {error:'p4.studentOnly'};
 if(!s.courses.some(c=>c.id===courseId))return {error:'missing'};
 const grant=activeGrantIn(s,student.id,courseId);return grant?{student,grant}:{error:'p4.noAccess'};
}
function lessonGuard(s,actor,lessonId) {
 const lesson=s.lessons.find(l=>l.id===lessonId&&l.state==='published');if(!lesson)return {error:'missing'};
 const g=learner(s,actor,lessonCourse(s,lesson));return g.error?g:{...g,lesson};
}
function progressRecord(s,g,lesson,basis) {
 let p=s.lesson_progress.find(x=>x.student_id===g.student.id&&x.lesson_id===lesson.id);
 if(!p){p={id:nextId(s.lesson_progress,'LP'),enrollment_id:g.grant.enrollment_id,student_id:g.student.id,lesson_id:lesson.id,status:'in_progress',position_seconds:0,completion_basis:basis,completed_at:null,created_at:DEMO_NOW,updated_at:DEMO_NOW};s.lesson_progress.push(p);}
 return p;
}
function complete(p,basis) { if(p.status==='done')return false;Object.assign(p,{status:'done',completion_basis:basis,completed_at:DEMO_NOW,updated_at:DEMO_NOW});return true; }
function notifyUser(s,recipient,{event,type,title,body,href,courseId}) {
 if(!recipient||s.notifications.some(n=>n.recipient_user_id===recipient&&n.event_id===event))return;
 const n={id:nextId(s.notifications,'N'),recipient_user_id:recipient,event_id:event,type,title,body,href,read_at:null,related_course_id:courseId,created_at:DEMO_NOW,updated_at:DEMO_NOW};s.notifications.push(n);
 s.delivery_attempts.push({id:nextId(s.delivery_attempts,'DA'),notification_id:n.id,channel:'in_app',state:'sent',attempts:1,last_error:null,created_at:DEMO_NOW,updated_at:DEMO_NOW});
}
const typed=v=>({ar:v,en:v});// Learner-authored text is stored as typed, never translated.
Object.assign(reducers,{
 // Reading lessons complete manually; video lessons through the explicit "Finish demo lesson" control.
 // Quizzes and assignments complete only through their submit reducers.
 'student.completeLesson':(s,p,{actor})=>{
  const g=lessonGuard(s,actor,p.lessonId);if(g.error)return fail(g.error);
  if(!['reading','video'].includes(g.lesson.type))return fail('p4.completeBySubmit');
  const basis=g.lesson.type==='reading'?'manual':'demo_finish',rec=progressRecord(s,g,g.lesson,basis);
  if(g.lesson.type==='video')rec.position_seconds=g.lesson.duration_seconds;
  return ok({lessonId:g.lesson.id,completed:complete(rec,basis)});
 },
 // Resume position for simulated video; reaching 90% of the duration completes the lesson.
 'student.savePosition':(s,p,{actor})=>{
  const g=lessonGuard(s,actor,p.lessonId);if(g.error)return fail(g.error);
  if(g.lesson.type!=='video')return fail('invalidAction');
  const position=Math.round(Number(p.position));if(!Number.isFinite(position))return fail('invalidAction');
  const rec=progressRecord(s,g,g.lesson,'video_90_percent');
  rec.position_seconds=Math.min(g.lesson.duration_seconds,Math.max(0,position));rec.updated_at=DEMO_NOW;
  const completed=rec.position_seconds>=g.lesson.duration_seconds*0.9&&complete(rec,'video_90_percent');
  return ok({lessonId:g.lesson.id,position:rec.position_seconds,completed,done:rec.status==='done'});
 },
 'quiz.submit':(s,p,{actor})=>{
  const quiz=s.quizzes.find(q=>q.id===p.quizId);if(!quiz)return fail('missing');
  const g=learner(s,actor,quiz.course_id);if(g.error)return fail(g.error);
  const lesson=s.lessons.find(l=>l.id===quiz.lesson_id&&l.state==='published');if(!lesson)return fail('missing');
  const attempts=s.attempts.filter(a=>a.quiz_id===quiz.id&&a.student_id===g.student.id);
  if(attempts.length>=quiz.attempt_limit)return fail('p4.attemptLimit');
  const questions=quiz.question_ids.map(id=>s.questions.find(q=>q.id===id)),answers={},errors={};
  for(const q of questions){const v=p.answers?.[q.id];if(q.choices.some(c=>c.id===v))answers[q.id]=v;else errors[q.id]='p4.answerRequired';}
  if(Object.keys(errors).length)return failFields(errors,'p4.answerAll');
  const total=questions.reduce((n,q)=>n+q.points,0),earned=questions.reduce((n,q)=>n+(answers[q.id]===q.correct_choice_id?q.points:0),0),score=total?Math.round(earned*100/total):0;
  const attempt={id:nextId(s.attempts,'ATTEMPT'),quiz_id:quiz.id,student_id:g.student.id,answers,question_snapshot:structuredClone(questions),score,submitted_at:DEMO_NOW,created_at:DEMO_NOW};
  s.attempts.push(attempt);complete(progressRecord(s,g,lesson,'quiz_submit'),'quiz_submit');
  return ok({attemptId:attempt.id,score,passed:score>=quiz.pass_score,remaining:quiz.attempt_limit-attempts.length-1});
 },
 'assignment.submit':(s,p,{actor})=>{
  const a=s.assignments.find(x=>x.id===p.assignmentId);if(!a)return fail('missing');
  const g=learner(s,actor,a.course_id);if(g.error)return fail(g.error);
  const lesson=s.lessons.find(l=>l.id===a.lesson_id&&l.state==='published');if(!lesson)return fail('missing');
  if(s.submissions.some(x=>x.assignment_id===a.id&&x.student_id===g.student.id))return fail('p4.alreadySubmitted');
  const body=text(p.text,4000),filename=text(p.filename,120).split(/[\\/]/).pop();
  const errors=pick({text:body&&body.length<10?'error.messageShort':lengthError(body,10),filename:filename&&!SUBMISSION_FILE.test(filename)?'p4.filename':null});
  if(Object.keys(errors).length)return failFields(errors);
  const sub={id:nextId(s.submissions,'SUB'),assignment_id:a.id,student_id:g.student.id,text:body,filename:filename||null,state:'submitted',submitted_at:DEMO_NOW,created_at:DEMO_NOW,updated_at:DEMO_NOW};
  s.submissions.push(sub);complete(progressRecord(s,g,lesson,'assignment_submit'),'assignment_submit');
  return ok({submissionId:sub.id});
 },
 // Demo join: verifies the grant and session state, then records attendance once.
 'live.join':(s,p,{actor})=>{
  const x=s.live_sessions.find(v=>v.id===p.sessionId&&v.status!=='draft');if(!x)return fail('missing');
  const g=learner(s,actor,x.course_id);if(g.error)return fail(g.error);
  if(x.status==='cancelled')return fail('p4.joinCancelled');
  if(x.status==='failed')return fail('p4.joinFailed');
  if(!JOINABLE.includes(x.status)||x.ends_at<=DEMO_NOW)return fail('p4.joinClosed');
  const existing=s.attendance.find(a=>a.live_session_id===x.id&&a.student_id===g.student.id);
  if(existing?.status==='present')return ok({attendanceId:existing.id,existing:true});
  if(existing){Object.assign(existing,{status:'present',joined_at:DEMO_NOW,updated_at:DEMO_NOW});return ok({attendanceId:existing.id,existing:false});}
  const att={id:nextId(s.attendance,'ATT'),live_session_id:x.id,student_id:g.student.id,joined_at:DEMO_NOW,left_at:null,minutes:0,status:'present',created_at:DEMO_NOW,updated_at:DEMO_NOW};
  s.attendance.push(att);return ok({attendanceId:att.id,existing:false});
 },
 // New course question: a lesson_qa conversation in the owning course scope; only the course owner is notified.
 'qa.ask':(s,p,{actor})=>{
  const g=learner(s,actor,p.courseId);if(g.error)return fail(g.error);
  const subject=text(p.subject,120),body=text(p.text,2000),lessonId=text(p.lessonId,12)||null;
  const errors=pick({subject:lengthError(subject,3),text:body&&body.length<10?'error.messageShort':lengthError(body,10),lessonId:lessonId&&!lessonsIn(s,p.courseId).some(l=>l.id===lessonId)?'p4.lessonInvalid':null});
  if(Object.keys(errors).length)return failFields(errors);
  const q={id:nextId(s.conversations,'Q'),course_id:p.courseId,lesson_id:lessonId,student_id:g.student.id,kind:'lesson_qa',subject:typed(subject),state:'open',assigned_user_id:null,last_message_at:DEMO_NOW,created_at:DEMO_NOW,updated_at:DEMO_NOW};
  s.conversations.push(q);
  s.messages.push({id:nextId(s.messages,'MSG'),conversation_id:q.id,author_user_id:g.student.user_id,text:body,lang:s.preferences.lang,internal:false,moderation_state:'visible',created_at:DEMO_NOW,updated_at:DEMO_NOW});
  const course=s.courses.find(c=>c.id===p.courseId),owner=s.teachers.find(x=>x.id===course.owner_teacher_id);
  notifyUser(s,owner?.account_status==='active'?owner.user_id:null,{event:'qa-'+q.id,type:'qa_question',title:{ar:'سؤال جديد في دورتك',en:'New question in your course'},body:typed(subject),href:'#/teacher/inbox/'+q.id,courseId:course.id});
  return ok({conversationId:q.id});
 },
 'message.reply':(s,p,{actor})=>{
  const st=studentOf(s,actor);if(!st)return fail('p4.studentOnly');
  const q=s.conversations.find(x=>x.id===p.conversationId);if(!q)return fail('missing');
  if(!ownConversation(s,q.id,st))return fail('resourceDenied');
  const body=text(p.text,2000),error=lengthError(body,2);if(error)return failFields({text:error});
  s.messages.push({id:nextId(s.messages,'MSG'),conversation_id:q.id,author_user_id:st.user_id,text:body,lang:s.preferences.lang,internal:false,moderation_state:'visible',created_at:DEMO_NOW,updated_at:DEMO_NOW});
  const reopened=q.state==='resolved';if(reopened)q.state='open';
  Object.assign(q,{last_message_at:DEMO_NOW,updated_at:DEMO_NOW});return ok({conversationId:q.id,reopened});
 },
 'message.resolve':(s,p,{actor})=>{
  const st=studentOf(s,actor);if(!st)return fail('p4.studentOnly');
  const q=s.conversations.find(x=>x.id===p.conversationId);if(!q)return fail('missing');
  if(!ownConversation(s,q.id,st))return fail('resourceDenied');
  if(q.state!=='resolved')Object.assign(q,{state:'resolved',updated_at:DEMO_NOW});return ok({conversationId:q.id});
 },
 // Reports go to the moderation safety queue once per reporter and message; internal notes are never reportable.
 'message.report':(s,p,{actor})=>{
  const st=studentOf(s,actor);if(!st)return fail('p4.studentOnly');
  const m=s.messages.find(x=>x.id===p.messageId&&!x.internal&&x.moderation_state!=='removed');if(!m)return fail('missing');
  const q=s.conversations.find(x=>x.id===m.conversation_id);
  if(!activeGrantIn(s,st.id,q.course_id)||(q.student_id!==st.id&&q.kind!=='lesson_qa'))return fail('resourceDenied');
  if(m.author_user_id===st.user_id)return fail('p4.reportOwn');
  if(!Object.hasOwn(REPORT_REASONS,p.reason))return failFields({reason:'p4.reasonRequired'});
  const existing=s.safety_reports.find(r=>r.reporter_user_id===st.user_id&&r.message_id===m.id);
  if(existing)return ok({reportId:existing.id,existing:true});
  const report={id:nextId(s.safety_reports,'SR'),reporter_user_id:st.user_id,message_id:m.id,course_id:q.course_id,reason:structuredClone(REPORT_REASONS[p.reason]),state:'open',restricted_note:'',assigned_staff_id:null,created_at:DEMO_NOW,updated_at:DEMO_NOW};
  s.safety_reports.push(report);if(m.moderation_state==='visible')Object.assign(m,{moderation_state:'flagged',updated_at:DEMO_NOW});
  return ok({reportId:report.id,existing:false});
 },
 'notifications.markRead':(s,p,{actor})=>{
  const n=s.notifications.find(x=>x.id===p.id);if(!n)return fail('missing');
  if(!actor.user_id||n.recipient_user_id!==actor.user_id)return fail('resourceDenied');
  if(!n.read_at)Object.assign(n,{read_at:DEMO_NOW,updated_at:DEMO_NOW});return ok({id:n.id});
 },
 'notifications.markAllRead':(s,_p,{actor})=>{
  if(!actor.user_id)return fail('resourceDenied');let count=0;
  for(const n of s.notifications)if(n.recipient_user_id===actor.user_id&&!n.read_at){Object.assign(n,{read_at:DEMO_NOW,updated_at:DEMO_NOW});count++;}
  return ok({count});
 },
 // Changing the current grade never touches historical enrollments or grants.
 'student.updateProfile':(s,p,{actor})=>{
  const st=studentOf(s,actor);if(!st)return fail('p4.studentOnly');
  const interests=[...new Set((Array.isArray(p.interests)?p.interests:[]).filter(id=>s.subjects.some(x=>x.id===id)))];
  if(!s.grades.some(g=>g.id===p.gradeId))return failFields({gradeId:'error.grade'});
  Object.assign(st,{current_grade_id:p.gradeId,interests,updated_at:DEMO_NOW});return ok({gradeId:p.gradeId});
 },
 'student.updateSettings':(s,p,{actor})=>{
  const st=studentOf(s,actor);if(!st)return fail('p4.studentOnly');
  st.notification_prefs=Object.fromEntries(STUDENT_PREFS.map(k=>[k,p.prefs?.[k]===true||p.prefs?.[k]==='on']));st.updated_at=DEMO_NOW;return ok({...st.notification_prefs});
 },
});

// ---- P5 guardian portal. The acting guardian always comes from the persona; every read and action
// re-evaluates the verified link and its scopes, so verification and revocation take effect immediately.
// A link never exposes paid lesson bodies, submissions or private conversations, only summaries.
export const LINK_SCOPES=['progress','results','attendance','purchase'];
export const GUARDIAN_PREFS=['in_app','email_digest','weekly_summary','payments','live_reminders'];
const RELATIONSHIPS={mother:{ar:'أم',en:'Mother'},father:{ar:'أب',en:'Father'},grandparent:{ar:'جد أو جدة',en:'Grandparent'},aunt:{ar:'خالة أو عمة',en:'Aunt'},uncle:{ar:'خال أو عم',en:'Uncle'},other:{ar:'ولي أمر آخر',en:'Other guardian'}};
export const LINK_RELATIONSHIPS=Object.keys(RELATIONSHIPS);
// Synthetic invitation token: ASCII only, issued per learner (e.g. OMAN-S003). Never a name search.
const INVITE=/^OMAN-S(\d{3})$/;
const guardianOf=(s,actor)=>s.preferences.role==='guardian'?s.guardians.find(g=>g.id===actor.record_id)??null:null;
const verifiedLink=(s,gid,sid)=>s.guardian_student_links.find(l=>l.guardian_id===gid&&l.student_id===sid&&l.state==='verified')??null;
const moderators=s=>s.role_assignments.filter(r=>r.role==='admin_moderation'&&r.status==='active').map(r=>r.user_id);
// Child-summary notices disappear with the link that authorized them; payment notices stay with the buyer.
function guardianNoticeVisible(s,actor,n) {
 if(s.preferences.role!=='guardian')return true;
 const m=/^#\/guardian\/child\/([\w-]+)/.exec(n.href??'');
 return !m||!!verifiedLink(s,actor.record_id,m[1]);
}
function linkAudit(s,actor,link,action,before,after,reason) { s.audit_events.push({id:nextId(s.audit_events,'AUD'),actor_user_id:actor.user_id,action,resource_type:'guardian_student_link',resource_id:link.id,before_summary:before,after_summary:after,reason,created_at:DEMO_NOW}); }
const childOf=s=>x=>({id:x.id,name:x.name,profile_color:x.profile_color,grade:s.grades.find(g=>g.id===x.current_grade_id)??null});
const courseTitle=(s,id)=>publicView(s.courses.find(c=>c.id===id)).title;
// Scope-gated summary of one verified child: progress => courses/activity, results => released results and due work,
// attendance => live schedule and attendance. Missing scopes yield empty sections plus an explicit flag.
function childView(s,link) {
 const st=s.students.find(x=>x.id===link.student_id),has=Object.fromEntries(LINK_SCOPES.map(k=>[k,link.scopes.includes(k)]));
 const active=studentCourses(s,st.id).filter(r=>r.access.state==='active'),ids=new Set(active.map(r=>r.course.id));
 const courses=has.progress?active.map(r=>({id:r.course.id,course:r.course,percent:r.percent,done:r.done,total:r.total,next_title:r.next?.title??null,last_activity:r.last_activity,access_end:r.access.grant.ends_at,archived:r.status!=='Published'})):[];
 const done=courses.reduce((n,r)=>n+r.done,0),total=courses.reduce((n,r)=>n+r.total,0);
 const work=has.results?studentWork(s,st.id):{assignments:[],quizzes:[]};
 const assignments=work.assignments.map(a=>({id:a.id,course_id:a.course_id,title:a.title,course_title:a.course_title,due_at:a.due_at,max_score:a.max_score,state:a.state,late:a.late,score:a.grade?.score??null,released_at:a.grade?.released_at??null}));
 const quizzes=work.quizzes.filter(q=>q.attempts.length).map(q=>({id:q.id,course_id:q.course_id,title:q.title,course_title:q.course_title,best:q.best,attempts:q.attempts.length,limit:q.attempt_limit,pass_score:q.pass_score,passed:q.passed,last_at:q.last.submitted_at}));
 const released=[...assignments.filter(a=>a.released_at).map(a=>({kind:'assignment',id:a.id,title:a.title,course_title:a.course_title,score:a.score,max:a.max_score,at:a.released_at})),...quizzes.map(q=>({kind:'quiz',id:q.id,title:q.title,course_title:q.course_title,score:q.best,max:100,at:q.last_at}))].sort((a,b)=>b.at.localeCompare(a.at));
 const sessions=has.attendance?s.live_sessions.filter(x=>ids.has(x.course_id)&&x.status!=='draft').map(x=>{const v=sessionView(s,st.id,x);return {id:v.id,course_id:v.course_id,title:v.title,course_title:courseTitle(s,v.course_id),starts_at:v.starts_at,ends_at:v.ends_at,status:v.student_status,joinable:v.joinable,attended:v.attendance?.status??null};}).sort((a,b)=>a.starts_at.localeCompare(b.starts_at)):[];
 const attendance=has.attendance?s.attendance.filter(a=>a.student_id===st.id).map(a=>{const x=s.live_sessions.find(v=>v.id===a.live_session_id);return {id:a.id,title:x.title,course_title:courseTitle(s,x.course_id),starts_at:x.starts_at,status:a.status,minutes:a.minutes};}).sort((a,b)=>b.starts_at.localeCompare(a.starts_at)):[];
 const weeks=has.progress?weeklyActivity(s,st.id).weeks.map(w=>has.attendance?w:{...w,live:null}):[];
 return {child:childOf(s)(st),link:{id:link.id,relationship:link.relationship,scopes:[...link.scopes],verified_at:link.verified_at,scope_request:link.scope_request??null},has,
  courses,done,total,percent:percentOf(done,total),assignments,quizzes,released,latest:released[0]??null,
  due:assignments.filter(a=>a.state==='not_submitted'&&a.due_at>DEMO_NOW),
  upcoming:sessions.filter(x=>x.ends_at>DEMO_NOW),next_live:sessions.find(x=>x.joinable&&x.ends_at>DEMO_NOW)??null,attendance,weeks,
  present:attendance.filter(a=>a.status==='present').length};
}
const ownLinks=(s,g)=>s.guardian_student_links.filter(l=>l.guardian_id===g.id);
const verifiedChildren=(s,g)=>ownLinks(s,g).filter(l=>l.state==='verified'&&l.scopes.some(x=>x!=='purchase')).map(l=>childView(s,l));
const ownOrders=(s,actor)=>s.orders.filter(o=>o.buyer_user_id===actor.user_id).sort((a,b)=>b.created_at.localeCompare(a.created_at)).map(o=>ownedOrder(s,o.id,actor)).filter(d=>d.status==='ok');
// Unverified requests are status-only: no learner name, grade or progress.
const requestRow=l=>({id:l.id,state:l.state,relationship:l.relationship,evidence_ref:l.evidence_ref,requested_at:l.requested_at,revoked_at:l.revoked_at});
function guardianChild(s,{id},{actor}) {
 const g=guardianOf(s,actor);if(!g)return {status:'denied'};
 if(!s.students.some(x=>x.id===id))return {status:'missing'};
 const link=verifiedLink(s,g.id,id);
 return link&&link.scopes.some(x=>x!=='purchase')?{status:'ok',...childView(s,link)}:{status:'denied'};
}
function ownTicket(s,id,actor) {
 const ticket=s.support_tickets.find(x=>x.id===id);if(!ticket)return {status:'missing'};
 if(!actor.user_id||ticket.requester_user_id!==actor.user_id)return {status:'denied'};
 return {status:'ok',ticket:{...ticket,replies:ticket.replies??[]},course:ticket.course_id?publicView(s.courses.find(c=>c.id===ticket.course_id)):null};
}
registerSelectors({
 'guardian.dashboard':(s,_a,{actor})=>{
  const g=guardianOf(s,actor);if(!g)return null;
  const children=verifiedChildren(s,g),requests=ownLinks(s,g).filter(l=>l.state!=='verified');
  const upcoming=children.flatMap(c=>[...c.upcoming.filter(x=>JOINABLE.includes(x.status)).map(x=>({kind:'live',id:x.id,at:x.starts_at,title:x.title,course_title:x.course_title,status:x.status,child:c.child})),...c.due.map(a=>({kind:'assignment',id:a.id,at:a.due_at,title:a.title,course_title:a.course_title,status:a.state,child:c.child}))]).sort((a,b)=>a.at.localeCompare(b.at));
  return {guardian:g,children,upcoming,orders:ownOrders(s,actor).slice(0,3),requests:{total:requests.length,...Object.fromEntries(['requested','pending_verification','rejected','revoked'].map(k=>[k,requests.filter(l=>l.state===k).length]))}};
 },
 'guardian.notifications':(s,_a,{actor})=>s.notifications.filter(n=>n.recipient_user_id===actor.user_id&&guardianNoticeVisible(s,actor,n)).sort((a,b)=>b.created_at.localeCompare(a.created_at)),
 'guardian.childrenPage':(s,_a,{actor})=>{const g=guardianOf(s,actor);return g?{children:verifiedChildren(s,g),requests:ownLinks(s,g).filter(l=>l.state!=='verified').sort((a,b)=>b.requested_at.localeCompare(a.requested_at)).map(requestRow)}:null;},
 'guardian.child':guardianChild,
 'guardian.purchaseChildren':(s,_a,{actor})=>guardianOf(s,actor)?s.students.filter(x=>purchaseStudent(s,actor,x.id)).map(childOf(s)):[],
 'guardian.orders':(s,_a,{actor})=>guardianOf(s,actor)?ownOrders(s,actor):[],
 'guardian.linkResult':(s,_a,{actor})=>{const g=guardianOf(s,actor),f=s.transient.forms?.['guardian-link'];const link=g&&f?.done&&s.guardian_student_links.find(l=>l.id===f.linkId&&l.guardian_id===g.id);return link?{...requestRow(link),reused:f.reused}:null;},
 'guardian.settings':(s,_a,{actor})=>{
  const g=guardianOf(s,actor);if(!g)return null;
  return {guardian:g,user:s.users.find(u=>u.id===g.user_id),prefs:Object.fromEntries(GUARDIAN_PREFS.map(k=>[k,g.notification_prefs?.[k]??true])),
   links:ownLinks(s,g).filter(l=>l.state==='verified').map(l=>({id:l.id,relationship:l.relationship,scopes:[...l.scopes],verified_at:l.verified_at,scope_request:l.scope_request??null,child:childOf(s)(s.students.find(x=>x.id===l.student_id))})),
   pending:ownLinks(s,g).filter(l=>l.state!=='verified').length};
 },
 'support.tickets':(s,_a,{actor})=>actor.user_id?s.support_tickets.filter(x=>x.requester_user_id===actor.user_id).sort((a,b)=>b.updated_at.localeCompare(a.updated_at)).map(x=>({...x,replies:x.replies??[]})):[],
 'support.ticket':(s,{id},{actor})=>ownTicket(s,id,actor),
});
Object.assign(reducers,{
 // Submitting the token creates (or reuses) a pending_verification request; access waits for moderation.
 'guardian.requestLink':(s,p,{actor})=>{
  const g=guardianOf(s,actor);if(!g)return fail('p5.guardianOnly');
  const code=text(p.code,40).toUpperCase(),m=INVITE.exec(code),relationship=text(p.relationship,20),student=m&&s.students.find(x=>x.id==='S-'+m[1]);
  const errors=pick({code:!code?'error.required':student?null:'p5.codeInvalid',relationship:Object.hasOwn(RELATIONSHIPS,relationship)?null:'p5.relationshipRequired',consent:p.consent===true||p.consent==='on'?null:'error.consent'});
  if(Object.keys(errors).length)return failFields(errors);
  let link=ownLinks(s,g).find(l=>l.student_id===student.id&&['requested','pending_verification','verified'].includes(l.state));const reused=!!link;
  if(!link) {
   link={id:nextId(s.guardian_student_links,'GL'),guardian_id:g.id,student_id:student.id,relationship:structuredClone(RELATIONSHIPS[relationship]),state:'pending_verification',scopes:[...(s.platform_settings[0]?.guardian_scope_defaults??LINK_SCOPES)],evidence_ref:'DEMO-EVIDENCE-'+student.id,requested_at:DEMO_NOW,verified_at:null,revoked_at:null,verified_by:null,created_at:DEMO_NOW,updated_at:DEMO_NOW};
   s.guardian_student_links.push(link);linkAudit(s,actor,link,'guardian_link.request','','pending_verification','Invitation token and consent submitted');
   for(const m of moderators(s))notifyUser(s,m,{event:'guardian-link-'+link.id,type:'guardian_link',title:{ar:'طلب ربط بانتظار التحقق',en:'Guardian link awaiting verification'},body:{ar:'طلب ربط جديد يحتاج مراجعة الأدلة التجريبية.',en:'A new link request needs synthetic evidence review.'},href:'#/admin/people/guardian-links',courseId:null});
  } else if(link.state==='requested') Object.assign(link,{state:'pending_verification',updated_at:DEMO_NOW});
  saveForm(s,'guardian-link',{values:{},fieldErrors:{},done:true,linkId:link.id,reused});
  return ok({linkId:link.id,reused,state:link.state});
 },
 'guardian.revokeLink':(s,p,{actor})=>{
  const g=guardianOf(s,actor);if(!g)return fail('p5.guardianOnly');
  const link=s.guardian_student_links.find(l=>l.id===p.linkId);if(!link)return fail('missing');
  if(link.guardian_id!==g.id)return fail('resourceDenied');
  if(link.state!=='verified')return fail('p5.notVerified');
  Object.assign(link,{state:'revoked',revoked_at:DEMO_NOW,scope_request:null,updated_at:DEMO_NOW});
  linkAudit(s,actor,link,'guardian_link.revoke','verified','revoked','Revoked by guardian');
  return ok({linkId:link.id});
 },
 // Scope changes are requests for moderator review; the current scopes stay in force until then.
 'guardian.requestScopeChange':(s,p,{actor})=>{
  const g=guardianOf(s,actor);if(!g)return fail('p5.guardianOnly');
  const link=s.guardian_student_links.find(l=>l.id===p.linkId);if(!link)return fail('missing');
  if(link.guardian_id!==g.id)return fail('resourceDenied');
  if(link.state!=='verified')return fail('p5.notVerified');
  const scopes=LINK_SCOPES.filter(k=>Array.isArray(p.scopes)&&p.scopes.includes(k));
  if(!scopes.length)return failFields({scopes:'p5.scopesRequired'});
  if(scopes.join()===LINK_SCOPES.filter(k=>link.scopes.includes(k)).join())return failFields({scopes:'p5.scopesUnchanged'});
  link.scope_request={scopes,state:'pending_verification',requested_at:DEMO_NOW};link.updated_at=DEMO_NOW;
  linkAudit(s,actor,link,'guardian_link.request_scope_change',link.scopes.join(','),scopes.join(','),'Scope change requested by guardian');
  for(const m of moderators(s))notifyUser(s,m,{event:'guardian-scope-'+link.id+'-'+scopes.join('-'),type:'guardian_link',title:{ar:'طلب تعديل صلاحيات ربط',en:'Link permission change requested'},body:{ar:'يحتاج طلب تعديل صلاحيات ولي أمر إلى مراجعة.',en:'A guardian permission change needs review.'},href:'#/admin/people/guardian-links',courseId:null});
  return ok({linkId:link.id,scopes});
 },
 // Staff-only verification (moderation UI lands in P8); guardians can never verify their own requests.
 'guardianLink.verify':(s,p,{actor,can})=>{
  if(!can('people.verify_guardian_link',{module:'people'}))return fail('resourceDenied');
  const link=s.guardian_student_links.find(l=>l.id===p.linkId);if(!link)return fail('missing');
  if(!['requested','pending_verification'].includes(link.state))return fail('p5.invalidTransition');
  const before=link.state;Object.assign(link,{state:'verified',verified_at:DEMO_NOW,verified_by:actor.user_id,updated_at:DEMO_NOW});
  linkAudit(s,actor,link,'guardian_link.verify',before,'verified',text(p.reason,200)||'Synthetic evidence matched');
  const guardian=s.guardians.find(x=>x.id===link.guardian_id),student=s.students.find(x=>x.id===link.student_id);
  notifyUser(s,guardian?.user_id,{event:'guardian-link-verified-'+link.id,type:'link_verified',title:{ar:'تم توثيق ربط الطالب',en:'Learner link verified'},body:structuredClone(student.name),href:'#/guardian/child/'+student.id,courseId:null});
  return ok({linkId:link.id,state:'verified'});
 },
 // Requester-only replies on own tickets; replying to a resolved ticket reopens it.
 'support.reply':(s,p,{actor})=>{
  const d=ownTicket(s,p.ticketId,actor);if(d.status!=='ok')return fail(d.status==='missing'?'missing':'resourceDenied');
  const body=text(p.text,2000),error=lengthError(body,2);if(error)return failFields({text:error});
  const ticket=s.support_tickets.find(x=>x.id===p.ticketId);
  (ticket.replies??=[]).push({id:`${ticket.id}-R${ticket.replies.length+1}`,author_user_id:actor.user_id,text:body,lang:s.preferences.lang,created_at:DEMO_NOW});
  const reopened=ticket.state==='resolved';if(reopened)ticket.state='open';ticket.updated_at=DEMO_NOW;
  return ok({ticketId:ticket.id,reopened});
 },
 'guardian.updateSettings':(s,p,{actor})=>{
  const g=guardianOf(s,actor);if(!g)return fail('p5.guardianOnly');
  g.notification_prefs=Object.fromEntries(GUARDIAN_PREFS.map(k=>[k,p.prefs?.[k]===true||p.prefs?.[k]==='on']));g.updated_at=DEMO_NOW;return ok({...g.notification_prefs});
 },
});

// ---- P6 teacher portal. The acting teacher always comes from the persona (never from payload IDs);
// every read and mutation re-checks single ownership, so forged course, lesson, session or conversation
// IDs fail closed. Published course metadata edits live in pending_revision until moderation approves.
export const COURSE_STEPS=['identity','academics','content','assessments','live','access','review'];
export const TEAM_CAPABILITIES=['reply_conversation','read_content','grade_assignment','edit_content'];
export const TEAM_ROLES=['assistant','grader','content_editor'];
export const LESSON_TYPES=['video','reading'];
export const LESSON_STATES=['draft','ready','published'];
export const TEACHER_PREFS=['in_app','email_digest','qa_alerts','review_updates','payout_updates'];
export const INVITE_DAYS=['7','14','30'];
const COURSE_MODES=['recorded','live','hybrid'];
const COURSE_STATES=['Draft','Submitted','ChangesRequested','Published','Unpublished','Archived'];
const EARNING_STATES=['pending','available','reserved','in_payout','paid','adjusted'];
const SNAPSHOT_FIELDS=['title','summary','description','outcomes','prerequisites','price_type','price_baisa','mode','access_policy'];
const BILINGUAL_FIELDS=['title','summary','description','outcomes','prerequisites'];
const RECORDING_FILE=/^[\w؀-ۿ][\w؀-ۿ .()-]{0,75}\.(mp4|mov|webm)$/i;
const RESOURCE_FILE=/^[\w؀-ۿ][\w؀-ۿ .()-]{0,75}\.(txt|pdf)$/i;
// Conversation transitions (SPEC §3.1); open → assigned only through an explicit assignment or a staff reply.
const CONVERSATION_NEXT={assigned:['waiting','resolved','escalated'],waiting:['assigned','resolved'],escalated:['assigned','resolved']};
const teacherOf=(s,actor)=>s.preferences.role==='teacher'?s.teachers.find(x=>x.id===actor.record_id&&x.account_status==='active'&&x.application_status==='approved')??null:null;
function ownedCourse(s,actor,courseId) {
 const teacher=teacherOf(s,actor);if(!teacher)return {error:'p6.teacherOnly'};
 const course=s.courses.find(c=>c.id===courseId);if(!course)return {error:'missing'};
 return course.owner_teacher_id===teacher.id?{teacher,course}:{error:'resourceDenied'};
}
const qualifiedPairs=(s,teacherId)=>new Set(s.teacher_grade_subjects.filter(q=>q.teacher_id===teacherId&&q.verification_state==='verified'&&s.grade_subjects.some(g=>g.id===q.grade_subject_id&&g.active)).map(q=>q.grade_subject_id));
const editView=c=>({...c,...(c.pending_revision?.fields??{})});
const metaLock=c=>c.status==='Submitted'||c.pending_revision?.status==='Submitted'?'p6.lockedInReview':c.status==='Archived'?'p6.lockedArchived':null;
const contentLock=c=>c.status==='Submitted'?'p6.lockedInReview':c.status==='Archived'?'p6.lockedArchived':null;
const courseOfModule=(s,moduleId)=>s.courses.find(c=>c.id===s.modules.find(m=>m.id===moduleId)?.course_id)??null;
function audit(s,actor,action,type,id,before,after,reason='') { s.audit_events.push({id:nextId(s.audit_events,'AUD'),actor_user_id:actor.user_id,action,resource_type:type,resource_id:id,before_summary:before,after_summary:after,reason,created_at:DEMO_NOW}); }
const entitled=(s,courseId)=>s.students.filter(st=>activeGrantIn(s,st.id,courseId));
function notifyLearners(s,courseId,{event,type,title,body,href}) { for(const st of entitled(s,courseId))notifyUser(s,st.user_id,{event,type,title,body,href,courseId}); }
const userRoleIds=(s,role)=>s.role_assignments.filter(r=>r.role===role&&r.status==='active').map(r=>r.user_id);
const parseOmr=v=>{ const m=/^(\d{1,4})(?:\.(\d{1,3}))?$/.exec(String(v??'').trim());return m?Number(m[1])*1000+Number((m[2]??'').padEnd(3,'0')):null; };
// datetime-local input in Muscat time (UTC+4, no daylight saving) → UTC ISO; rolled-over dates are rejected.
function muscatToUtc(v) {
 const m=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(String(v??''));if(!m)return null;
 const ms=Date.UTC(+m[1],+m[2]-1,+m[3],+m[4]-4,+m[5]),back=new Date(ms+4*3600000);
 return back.getUTCDate()===+m[3]&&back.getUTCMonth()===+m[2]-1&&back.getUTCHours()===+m[4]?new Date(ms).toISOString().replace('.000Z','Z'):null;
}
const dateEnd=v=>{ const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v??''));if(!m)return null;const d=new Date(Date.UTC(+m[1],+m[2]-1,+m[3]));return d.getUTCDate()===+m[3]&&d.getUTCMonth()===+m[2]-1?`${m[1]}-${m[2]}-${m[3]}T19:59:59Z`:null; };
const intIn=(v,min,max)=>{ const n=Number(v);return v!==''&&v!=null&&Number.isInteger(n)&&n>=min&&n<=max?n:null; };
const pairText=(v,min,max)=>{ const ar=text(v?.ar,max),en=text(v?.en,max);return {value:{ar,en},errors:{ar:lengthError(ar,min),en:lengthError(en,min)}}; };
const identityValues=c=>Object.fromEntries(BILINGUAL_FIELDS.flatMap(k=>[[k+'_ar',c[k]?.ar??''],[k+'_en',c[k]?.en??'']]));
// Step validators shared by the wizard, the submit checklist and moderation (one source of truth).
function validateCourseStep(s,teacher,step,v) {
 const errors={},values={};
 if(step==='identity') {
  for(const [key,min,max] of [['title',5,120],['summary',10,300],['description',20,2000]]){const r=pairText({ar:v[key+'_ar'],en:v[key+'_en']},min,max);values[key]=r.value;errors[key+'_ar']=r.errors.ar;errors[key+'_en']=r.errors.en;}
  for(const key of ['outcomes','prerequisites']){values[key]={ar:text(v[key+'_ar'],600),en:text(v[key+'_en'],600)};if(!values[key].ar!==!values[key].en)errors[key+(values[key].ar?'_en':'_ar')]='p6.bilingualPair';}
 } else if(step==='academics') {
  const version=s.curriculum_versions.find(x=>x.id===v.curriculum_version_id&&x.active),gs=s.grade_subjects.find(x=>x.id===v.grade_subject_id),year=s.academic_years.find(x=>x.id===v.academic_year_id),semester=s.semesters.find(x=>x.id===v.semester_id);
  Object.assign(errors,{curriculum_version_id:version?null:'p6.versionInvalid',grade_subject_id:!v.grade_subject_id?'error.required':!gs||!teacher||!qualifiedPairs(s,teacher.id).has(gs.id)?'p6.notQualified':version&&gs.curriculum_version_id!==version.id?'p6.versionMismatch':null,academic_year_id:year?null:'error.required',semester_id:!semester?'error.required':semester.academic_year_id!==year?.id?'p6.semesterMismatch':null,language:['ar','en'].includes(v.language)?null:'error.required',mode:COURSE_MODES.includes(v.mode)?null:'error.required'});
  Object.assign(values,{grade_subject_id:gs?.id,academic_year_id:year?.id,semester_id:semester?.id,track_id:gs?.track_id??null,language:v.language,mode:v.mode});
 } else if(step==='access') {
  const type=v.price_type,price=type==='paid'?parseOmr(v.price):0,kind=v.access_kind,end=kind==='academic_year'?ACCESS_END:dateEnd(v.access_end);
  Object.assign(errors,{price_type:['free','paid'].includes(type)?null:'error.required',price:type==='paid'&&(!price||price>1000000)?'p6.pricePositive':null,access_kind:['academic_year','fixed_end'].includes(kind)?null:'error.required',access_end:kind==='fixed_end'&&(!end||end<=DEMO_NOW)?'p6.endFuture':null});
  Object.assign(values,{price_type:type,price_baisa:price??0,access_policy:{kind,end_at:end}});
 }
 return {values,errors:pick(errors)};
}
// Review checklist: blocking items gate submission and approval; advisory items guide the teacher.
function courseChecklist(s,c) {
 const owner=s.teachers.find(x=>x.id===c.owner_teacher_id),v=editView(c),gs=s.grade_subjects.find(x=>x.id===v.grade_subject_id);
 const lessons=s.modules.filter(m=>m.course_id===c.id).flatMap(m=>s.lessons.filter(l=>l.module_id===m.id&&['ready','published'].includes(l.state)));
 const identity=!Object.keys(validateCourseStep(s,owner,'identity',identityValues(v)).errors).length;
 const academics=!Object.keys(validateCourseStep(s,owner,'academics',{curriculum_version_id:gs?.curriculum_version_id,grade_subject_id:v.grade_subject_id,academic_year_id:v.academic_year_id,semester_id:v.semester_id,language:v.language,mode:v.mode}).errors).length;
 const access=(v.price_type==='free'?v.price_baisa===0:v.price_type==='paid'&&Number.isInteger(v.price_baisa)&&v.price_baisa>0)&&!!v.access_policy?.end_at&&v.access_policy.end_at>DEMO_NOW;
 return [
  {id:'identity',step:'identity',ok:identity,blocking:true},{id:'academics',step:'academics',ok:academics,blocking:true},
  {id:'owner',step:'review',ok:owner?.application_status==='approved'&&owner.account_status==='active',blocking:true},
  {id:'access',step:'access',ok:access,blocking:true},{id:'content',step:'content',ok:lessons.length>0,blocking:true},
  {id:'preview',step:'content',ok:lessons.some(l=>l.preview),blocking:false},
  {id:'assessments',step:'assessments',ok:s.quizzes.some(q=>q.course_id===c.id)||s.assignments.some(a=>a.course_id===c.id),blocking:false},
  {id:'live',step:'live',ok:v.mode==='recorded'||s.live_sessions.some(x=>x.course_id===c.id&&['scheduled','rescheduled','live'].includes(x.status)),blocking:false},
 ];
}
const checklistBlocked=(s,c)=>courseChecklist(s,c).some(x=>x.blocking&&!x.ok);
const snapshotOf=c=>structuredClone(Object.fromEntries(SNAPSHOT_FIELDS.map(k=>[k,c[k]])));
function lessonGuardTeacher(s,actor,lessonId) { const lesson=s.lessons.find(l=>l.id===lessonId);if(!lesson)return {error:'missing'};const g=ownedCourse(s,actor,courseOfModule(s,lesson.module_id)?.id);return g.error?g:{...g,lesson}; }
function lessonGuardAssistant(s,lessonId,can) { const lesson=s.lessons.find(l=>l.id===lessonId);if(!lesson)return {error:'missing'};const course=courseOfModule(s,lesson.module_id);return can('edit_content',course)?{course,lesson}:{error:'resourceDenied'}; }
function lessonFields(v,partial,type) {
 const values={},errors={},has=k=>!partial||k in v;
 if(has('title_ar')||has('title_en')){const r=pairText({ar:v.title_ar,en:v.title_en},3,120);values.title=r.value;errors.title_ar=r.errors.ar;errors.title_en=r.errors.en;}
 if(!partial){values.type=v.type;errors.type=LESSON_TYPES.includes(v.type)?null:'error.required';}
 if(has('duration')){values.duration_seconds=(intIn(v.duration,1,180)??0)*60;errors.duration=values.duration_seconds?null:'p6.durationRange';}
 if(has('state')){values.state=v.state;errors.state=LESSON_STATES.includes(v.state)?null:'error.required';}
 if(has('preview'))values.preview=v.preview===true||v.preview==='on'||v.preview==='true';
 if(has('body')&&!['quiz','assignment'].includes(type)){const body=text(v.body,4000);values.body=typed(body);errors.body=body&&body.length<10?'error.messageShort':lengthError(body,10);}
 return {values,errors:pick(errors)};
}
function publishLessonAlert(s,course,lesson) {
 if(course.status!=='Published'||lesson.state!=='published')return;
 notifyLearners(s,course.id,{event:'lesson-published-'+lesson.id,type:'lesson_published',title:{ar:'درس جديد في دورتك',en:'New lesson in your course'},body:structuredClone(lesson.title),href:`#/student/course/${course.id}?tab=lessons&lesson=${lesson.id}`});
}
function newLesson(s,module,{title,type,duration_seconds,state,preview,body}) {
 const id=nextId(s.lessons,'L'),position=Math.max(0,...s.lessons.filter(l=>l.module_id===module.id).map(l=>l.position))+1;
 const lesson={id,module_id:module.id,title,type,position,duration_seconds,preview:!!preview,state,body:body??typed(''),transcript:type==='video'?structuredClone(body):typed(''),simulated_media_ref:type==='video'?'demo-video-'+id:null,completion_basis:{video:'video_90_percent',reading:'manual',quiz:'quiz_submit',assignment:'assignment_submit'}[type],created_at:DEMO_NOW,updated_at:DEMO_NOW};
 s.lessons.push(lesson);return lesson;
}
function quizFields(v) {
 const title=text(v.title,120),pass=intIn(v.pass_score,0,100),questions=(Array.isArray(v.questions)?v.questions:[]).slice(0,5).filter((q,i)=>i===0||text(q?.prompt,300)||(q?.choices??[]).some(c=>text(c,160)));
 const errors={title:lengthError(title,3),pass_score:pass===null?'p6.passRange':null};
 if(!questions.length)errors.q0_prompt='error.required';
 const rows=questions.map((q,i)=>{const prompt=text(q?.prompt,300),choices=[0,1,2].map(c=>text(q?.choices?.[c],160)),correct=intIn(q?.correct,0,2);Object.assign(errors,{[`q${i}_prompt`]:lengthError(prompt,3),[`q${i}_choices`]:choices.every(Boolean)?null:'p6.choicesRequired',[`q${i}_correct`]:correct===null?'p6.correctRequired':null});return {prompt,choices,correct};});
 return {values:{title,pass_score:pass,questions:rows},errors:pick(errors)};
}
function assignmentFields(v) {
 const title=text(v.title,120),instructions=text(v.instructions,2000),due=dateEnd(v.due),max=intIn(v.max_score,1,100);
 return {values:{title,instructions,due_at:due?due.replace('19:59:59Z','15:59:59Z'):null,max_score:max},errors:pick({title:lengthError(title,3),instructions:instructions&&instructions.length<10?'error.messageShort':lengthError(instructions,10),due:!due?'error.required':due<=DEMO_NOW?'p6.dueFuture':null,max_score:max===null?'p6.maxRange':null})};
}
function sessionGuard(s,actor,sessionId) { const x=s.live_sessions.find(v=>v.id===sessionId);if(!x)return {error:'missing'};const g=ownedCourse(s,actor,x.course_id);return g.error?g:{...g,session:x}; }
const liveAlert=(s,x,kind,title)=>notifyLearners(s,x.course_id,{event:`live-${kind}-${x.id}-${x.join_generation}`,type:'live_'+kind,title,body:structuredClone(x.title),href:`#/student/course/${x.course_id}?tab=live`});
function conversationGuard(s,actor,id,capability,can) {
 const q=s.conversations.find(x=>x.id===id);if(!q)return {error:'missing'};
 if(!actor.user_id||!can(capability,q))return {error:'resourceDenied'};
 return {conversation:q,course:s.courses.find(c=>c.id===q.course_id)};
}
// Active members of the owner's team holding reply_conversation on this exact course.
function replyMembers(s,courseId) {
 const c=s.courses.find(x=>x.id===courseId);if(!c)return [];
 return s.teacher_team_members.filter(m=>m.teacher_id===c.owner_teacher_id&&m.status==='active'&&(!m.expires_at||m.expires_at>DEMO_NOW)&&s.course_team_assignments.some(a=>a.team_member_id===m.id&&a.course_id===courseId&&a.status==='active'&&a.capabilities.includes('reply_conversation'))).map(m=>({member_id:m.id,user_id:m.user_id,name:userName(s,m.user_id)}));
}
function postMessage(s,q,actor,body,internal) {
 const m={id:nextId(s.messages,'MSG'),conversation_id:q.id,author_user_id:actor.user_id,text:body,lang:s.preferences.lang,internal,moderation_state:'visible',created_at:DEMO_NOW,updated_at:DEMO_NOW};
 s.messages.push(m);if(!internal)q.last_message_at=DEMO_NOW;q.updated_at=DEMO_NOW;return m;
}
// Membership revocation shared by the owner (team.revoke) and staff oversight (team.adminRevoke). With courseIds,
// only those course assignments (and their conversation assignments) end; otherwise the whole membership does.
function revokeTeamMember(s,m,courseIds=null) {
 const owned=new Set(s.courses.filter(c=>c.owner_teacher_id===m.teacher_id).map(c=>c.id)),ids=courseIds?new Set([...courseIds].filter(id=>owned.has(id))):owned;
 if(!courseIds)Object.assign(m,{status:'deactivated',updated_at:DEMO_NOW});
 for(const a of s.course_team_assignments.filter(x=>x.team_member_id===m.id&&x.status==='active'&&ids.has(x.course_id)))Object.assign(a,{status:'revoked',updated_at:DEMO_NOW});
 for(const a of s.conversation_assignments.filter(x=>x.assignee_user_id===m.user_id&&x.status==='active'&&ids.has(s.conversations.find(q=>q.id===x.conversation_id)?.course_id)))Object.assign(a,{status:'revoked',updated_at:DEMO_NOW});
 for(const q of s.conversations.filter(x=>ids.has(x.course_id)&&x.assigned_user_id===m.user_id))Object.assign(q,{assigned_user_id:null,state:q.state==='resolved'?'resolved':'open',updated_at:DEMO_NOW});
}
function teamMember(s,actor,memberId) { const teacher=teacherOf(s,actor);if(!teacher)return {error:'p6.teacherOnly'};const m=s.teacher_team_members.find(x=>x.id===memberId);if(!m)return {error:'missing'};return m.teacher_id===teacher.id?{teacher,member:m}:{error:'resourceDenied'}; }
const ownedIds=(s,teacher)=>new Set(s.courses.filter(c=>c.owner_teacher_id===teacher.id).map(c=>c.id));
const courseTitleOf=(s,id)=>editView(s.courses.find(c=>c.id===id)).title;
function learnerRows(s,courseIds) {
 return s.enrollments.filter(x=>courseIds.has(x.course_id)).map(e=>{
  const st=s.students.find(x=>x.id===e.student_id),total=lessonsIn(s,e.course_id).length,progress=ownProgress(s,st.id,e.course_id),done=progress.filter(p=>p.status==='done').length;
  return {id:`${st.id}:${e.course_id}`,student:{id:st.id,name:st.name,grade:s.grades.find(g=>g.id===st.current_grade_id)??null},course_id:e.course_id,course_title:courseTitleOf(s,e.course_id),enrollment:{id:e.id,status:e.status,started_at:e.started_at},access:accessOf(s,st.id,e.course_id).state,done,total,percent:percentOf(done,total),last_activity:progress.map(p=>p.updated_at).sort().at(-1)??null};
 }).sort((a,b)=>a.student.id.localeCompare(b.student.id)||a.course_id.localeCompare(b.course_id));
}
// Teacher balances come only from ledger accounts; allocations are shown alongside so both reconcile.
function teacherLedger(s,teacherId) {
 const rows=s.financial_ledger_entries.filter(e=>e.teacher_id===teacherId),journals=new Map();
 for(const e of rows){if(!journals.has(e.journal_id))journals.set(e.journal_id,[]);journals.get(e.journal_id).push(e);}
 const sum=(list,account,side)=>list.filter(e=>e.account===account).reduce((n,e)=>n+e[side],0),bal=account=>sum(rows,account,'credit_baisa')-sum(rows,account,'debit_baisa');
 const sales=[...journals.values()].filter(j=>j.some(e=>e.source_type==='order_item'&&e.account==='teacher_pending'&&e.credit_baisa>0)).flat();
 const paid=[...journals.values()].filter(j=>j.some(e=>e.account==='provider_clearing'&&e.credit_baisa>0)&&j.some(e=>e.account==='teacher_in_payout'&&e.debit_baisa>0)).flat();
 return {gross:sum(sales,'provider_clearing','debit_baisa'),commission:sum(sales,'platform_commission','credit_baisa'),teacher_share:sum(sales,'teacher_pending','credit_baisa'),
  pending:bal('teacher_pending'),available:bal('teacher_available'),reserved:bal('teacher_reserved'),in_payout:bal('teacher_in_payout'),paid:sum(paid,'teacher_in_payout','debit_baisa'),
  recoverable:sum(rows,'teacher_recovery','debit_baisa')-sum(rows,'teacher_recovery','credit_baisa'),entries:rows.length,journals:journals.size};
}
function weekBuckets(events) {
 const now=Date.parse(DEMO_NOW);
 return [3,2,1,0].map(i=>{const end=now-i*7*DAY,start=end-7*DAY,hit=events.filter(([,at])=>{const time=Date.parse(at);return time>start&&time<=end;});return {end:new Date(end).toISOString(),sales:hit.filter(e=>e[0]==='sale').length,lessons:hit.filter(e=>e[0]==='lesson').length,questions:hit.filter(e=>e[0]==='question').length};});
}
function teacherCourseCard(s,c) {
 const v=editView(c),gs=s.grade_subjects.find(x=>x.id===v.grade_subject_id);
 return {...v,status:c.status,grade:s.grades.find(g=>g.id===gs?.grade_id)??null,subject:s.subjects.find(x=>x.id===gs?.subject_id)??null,teacher:s.teachers.find(x=>x.id===c.owner_teacher_id),
  revision:c.pending_revision?{status:c.pending_revision.status,feedback:c.pending_revision.feedback??null,fields:Object.keys(c.pending_revision.fields)}:null,unpublish_request:c.unpublish_request??null,
  feedback:c.status==='ChangesRequested'||c.pending_revision?.status==='ChangesRequested'?(c.pending_revision?.feedback??c.review_feedback):null,
  live_title:c.title,learners:entitled(s,c.id).length,lessons:lessonsIn(s,c.id).length,public:isPublic(s,c)};
}
function editorView(s,{id},{actor}) {
 const teacher=teacherOf(s,actor);if(!teacher)return {status:'denied'};
 const pairs=[...qualifiedPairs(s,teacher.id)].map(gid=>{const gs=s.grade_subjects.find(g=>g.id===gid);return {...gs,grade:s.grades.find(g=>g.id===gs.grade_id),subject:s.subjects.find(x=>x.id===gs.subject_id)};}).sort((a,b)=>a.grade.number-b.grade.number||a.subject_id.localeCompare(b.subject_id));
 const options={pairs,versions:s.curriculum_versions,years:s.academic_years,semesters:s.semesters};
 if(!id)return {status:'ok',isNew:true,teacher,course:{...(s.transient.courseDraft??{}),status:'Draft'},modules:[],quizzes:[],assignments:[],sessions:[],checklist:[],locked:null,contentLocked:null,...options};
 const g=ownedCourse(s,actor,id);if(g.error)return {status:g.error==='missing'?'missing':'denied'};
 const c=g.course,v=editView(c),gs=s.grade_subjects.find(x=>x.id===v.grade_subject_id);
 return {status:'ok',isNew:false,teacher,course:{...teacherCourseCard(s,c),curriculum_version_id:gs?.curriculum_version_id??null},raw:c,
  modules:s.modules.filter(m=>m.course_id===c.id).sort(byPosition).map(m=>({...m,lessons:s.lessons.filter(l=>l.module_id===m.id).sort(byPosition)})),
  quizzes:s.quizzes.filter(q=>q.course_id===c.id).map(q=>({...q,lesson:s.lessons.find(l=>l.id===q.lesson_id),questions:q.question_ids.map(x=>s.questions.find(y=>y.id===x)).filter(Boolean),attempts:s.attempts.filter(a=>a.quiz_id===q.id).length})),
  assignments:s.assignments.filter(a=>a.course_id===c.id).map(a=>({...a,lesson:s.lessons.find(l=>l.id===a.lesson_id),submissions:s.submissions.filter(x=>x.assignment_id===a.id).length})),
  sessions:s.live_sessions.filter(x=>x.course_id===c.id).sort((a,b)=>a.starts_at.localeCompare(b.starts_at)),
  checklist:courseChecklist(s,c),locked:metaLock(c),contentLocked:contentLock(c),...options};
}
function workspaceView(s,a,ctx) {
 const d=editorView(s,a,ctx);if(d.status!=='ok'||d.isNew)return d;
 const c=d.raw,lessons=d.modules.flatMap(m=>m.lessons),ids=new Set(lessons.map(l=>l.id)),learners=learnerRows(s,new Set([c.id])),recordings=s.recordings.filter(r=>r.course_id===c.id);
 const submissions=s.submissions.filter(x=>d.assignments.some(a=>a.id===x.assignment_id)).map(x=>{const st=s.students.find(y=>y.id===x.student_id);return {...x,assignment:d.assignments.find(a=>a.id===x.assignment_id),student:{id:st.id,name:st.name},grade:s.assessment_grades.find(g=>g.submission_id===x.id)??null};}).sort((a,b)=>(a.state==='released')-(b.state==='released')||a.submitted_at.localeCompare(b.submitted_at));
 const completions=lessons.filter(l=>l.state==='published').map(l=>({id:l.id,title:l.title,done:s.lesson_progress.filter(p=>p.lesson_id===l.id&&p.status==='done').length,started:s.lesson_progress.filter(p=>p.lesson_id===l.id).length}));
 return {...d,learners,submissions,
  resources:s.lesson_resources.filter(r=>ids.has(r.lesson_id)).map(r=>({...r,lesson:lessons.find(l=>l.id===r.lesson_id)})),
  sessions:d.sessions.map(x=>({...x,recording:recordings.find(r=>r.live_session_id===x.id)??null,attendance:s.attendance.filter(t=>t.live_session_id===x.id&&t.status==='present').length})),
  conversations:s.conversations.filter(q=>q.course_id===c.id).sort((a,b)=>b.last_message_at.localeCompare(a.last_message_at)).map(q=>({...q,student_name:s.students.find(x=>x.id===q.student_id)?.name??null,assignee:userName(s,q.assigned_user_id)})),
  announcements:s.announcements.filter(x=>x.course_id===c.id).sort((a,b)=>b.published_at.localeCompare(a.published_at)),
  history:s.audit_events.filter(e=>e.resource_type==='course'&&e.resource_id===c.id).sort((a,b)=>b.created_at.localeCompare(a.created_at)).map(e=>({...e,actor:userName(s,e.actor_user_id)})),
  team:s.teacher_team_members.filter(m=>m.teacher_id===c.owner_teacher_id&&m.status==='active').map(m=>({member_id:m.id,name:userName(s,m.user_id),capabilities:s.course_team_assignments.find(x=>x.team_member_id===m.id&&x.course_id===c.id&&x.status==='active')?.capabilities??[]})).filter(m=>m.capabilities.length),
  analytics:{completions,active:learners.filter(r=>r.access==='active').length,average:learners.length?Math.round(learners.reduce((n,r)=>n+r.percent,0)/learners.length):0,questions:s.conversations.filter(q=>q.course_id===c.id).length,attempts:s.attempts.filter(x=>d.quizzes.some(q=>q.id===x.quiz_id)).length}};
}
// Staff-side thread parts shared by the owner (P6) and assigned assistant (P7) views; internal notes included.
function staffMessages(s,q,actor) {
 const st=s.students.find(x=>x.id===q.student_id);
 const author=uid=>uid===st?.user_id?'student':s.teachers.some(x=>x.user_id===uid)?'teacher':s.teacher_team_members.some(x=>x.user_id===uid)?'assistant':'staff';
 return s.messages.filter(m=>m.conversation_id===q.id&&m.moderation_state!=='removed').sort((a,b)=>a.created_at.localeCompare(b.created_at)).map(m=>({...m,author_role:author(m.author_user_id),author_name:userName(s,m.author_user_id),own:m.author_user_id===actor.user_id}));
}
const ownReports=(s,actor)=>new Set(s.safety_reports.filter(r=>r.reporter_user_id===actor.user_id).map(r=>r.message_id??'conversation:'+r.conversation_id));
function conversationTrail(s,q) {
 return [...s.conversation_assignments.filter(x=>x.conversation_id===q.id).map(x=>({id:x.id,at:x.created_at,action:'conversation.assign',actor:userName(s,x.assigned_by),detail:userName(s,x.assignee_user_id),status:x.status})),...s.audit_events.filter(e=>e.resource_type==='conversation'&&e.resource_id===q.id&&e.action!=='conversation.assign').map(e=>({id:e.id,at:e.created_at,action:e.action,actor:userName(s,e.actor_user_id),detail:e.after_summary,status:null}))].sort((a,b)=>b.at.localeCompare(a.at));
}
function threadView(s,{id},{actor}) {
 const teacher=teacherOf(s,actor);if(!teacher)return {status:'denied'};
 const q=s.conversations.find(x=>x.id===id);if(!q)return {status:'missing'};
 const c=s.courses.find(x=>x.id===q.course_id);if(c?.owner_teacher_id!==teacher.id)return {status:'denied'};
 const st=s.students.find(x=>x.id===q.student_id);
 return {status:'ok',conversation:q,course:teacherCourseCard(s,c),lesson:s.lessons.find(l=>l.id===q.lesson_id)??null,student:{id:st.id,name:st.name},
  messages:staffMessages(s,q,actor),
  assignee:userName(s,q.assigned_user_id),members:replyMembers(s,c.id),next:(CONVERSATION_NEXT[q.state]??[]).filter(x=>x!=='assigned'||q.assigned_user_id),
  reported:ownReports(s,actor),trail:conversationTrail(s,q)};
}
registerSelectors({
 'teacher.me':(s,_a,{actor})=>{const teacher=teacherOf(s,actor);return teacher?{teacher,user:s.users.find(u=>u.id===teacher.user_id)}:null;},
 'teacher.dashboard':(s,_a,{actor})=>{
  const teacher=teacherOf(s,actor);if(!teacher)return null;
  const owned=s.courses.filter(c=>c.owner_teacher_id===teacher.id),ids=new Set(owned.map(c=>c.id)),convs=s.conversations.filter(q=>ids.has(q.course_id));
  const items=s.order_items.filter(i=>i.owner_teacher_id_snapshot===teacher.id&&s.earning_allocations.some(a=>a.order_item_id===i.id));
  const events=[...items.map(i=>['sale',i.created_at]),...s.lesson_progress.filter(p=>p.status==='done'&&ids.has(lessonCourse(s,s.lessons.find(l=>l.id===p.lesson_id)))).map(p=>['lesson',p.completed_at]),...convs.map(q=>['question',q.created_at])];
  return {teacher,counts:Object.fromEntries(COURSE_STATES.map(k=>[k,owned.filter(c=>c.status===k).length])),total:owned.length,
   learners:new Set(owned.flatMap(c=>entitled(s,c.id).map(st=>st.id))).size,
   queue:Object.fromEntries(['open','assigned','waiting','escalated','resolved'].map(k=>[k,convs.filter(q=>q.state===k).length])),
   attention:convs.filter(q=>['open','escalated'].includes(q.state)).sort((a,b)=>b.last_message_at.localeCompare(a.last_message_at)).slice(0,5).map(q=>({...q,course_title:courseTitleOf(s,q.course_id)})),
   ledger:teacherLedger(s,teacher.id),weeks:weekBuckets(events),
   feedback:owned.filter(c=>c.status==='ChangesRequested'||c.pending_revision?.status==='ChangesRequested').map(c=>teacherCourseCard(s,c)),
   upcoming:s.live_sessions.filter(x=>ids.has(x.course_id)&&JOINABLE.includes(x.status)&&x.ends_at>DEMO_NOW).sort((a,b)=>a.starts_at.localeCompare(b.starts_at)).slice(0,3).map(x=>({...x,course_title:courseTitleOf(s,x.course_id)}))};
 },
 'teacher.courses':(s,_a,{actor})=>{const teacher=teacherOf(s,actor);return teacher?s.courses.filter(c=>c.owner_teacher_id===teacher.id).map(c=>teacherCourseCard(s,c)):[];},
 'teacher.editor':editorView,'teacher.workspace':workspaceView,'teacher.thread':threadView,
 'teacher.form':(s,{name})=>s.transient.teacherForms?.[name]??{values:{},fieldErrors:{}},
 'teacher.students':(s,{courseId},{actor})=>{const teacher=teacherOf(s,actor);if(!teacher)return null;const ids=ownedIds(s,teacher),scoped=courseId&&ids.has(courseId)?courseId:null;return {courses:s.courses.filter(c=>ids.has(c.id)).map(c=>({id:c.id,title:editView(c).title})),rows:learnerRows(s,scoped?new Set([scoped]):ids),courseId:scoped};},
 // A learner record is visible only through an enrollment in an owned course; no guardian data is attached.
 'teacher.student':(s,{id},{actor})=>{
  const teacher=teacherOf(s,actor);if(!teacher)return {status:'denied'};const st=s.students.find(x=>x.id===id);if(!st)return {status:'missing'};
  const ids=new Set([...ownedIds(s,teacher)].filter(cid=>s.enrollments.some(e=>e.student_id===st.id&&e.course_id===cid)));if(!ids.size)return {status:'denied'};
  return {status:'ok',student:{id:st.id,name:st.name,grade:s.grades.find(g=>g.id===st.current_grade_id)??null},rows:learnerRows(s,ids).filter(r=>r.student.id===st.id).map(r=>({...r,
   quizzes:s.quizzes.filter(q=>q.course_id===r.course_id).map(q=>{const at=s.attempts.filter(x=>x.quiz_id===q.id&&x.student_id===st.id);return {id:q.id,title:q.title,attempts:at.length,best:at.length?Math.max(...at.map(x=>x.score)):null};}),
   assignments:s.assignments.filter(a=>a.course_id===r.course_id).map(a=>{const sub=s.submissions.find(x=>x.assignment_id===a.id&&x.student_id===st.id),grade=sub?s.assessment_grades.find(g=>g.submission_id===sub.id):null;return {id:a.id,title:a.title,max_score:a.max_score,state:!sub?'not_submitted':grade?.released_at?'released':grade?'graded':'submitted',score:grade?.score??null};})}))};
 },
 'teacher.inbox':(s,{status},{actor})=>{
  const teacher=teacherOf(s,actor);if(!teacher)return null;const ids=ownedIds(s,teacher);
  const all=s.conversations.filter(q=>ids.has(q.course_id)).sort((a,b)=>b.last_message_at.localeCompare(a.last_message_at)).map(q=>{const last=s.messages.filter(m=>m.conversation_id===q.id&&!m.internal&&m.moderation_state!=='removed').sort((a,b)=>a.created_at.localeCompare(b.created_at)).at(-1);return {...q,course_title:courseTitleOf(s,q.course_id),student_name:s.students.find(x=>x.id===q.student_id)?.name??null,assignee:userName(s,q.assigned_user_id),last_text:last?.text??'',members:replyMembers(s,q.course_id)};});
  return {all,rows:status?all.filter(q=>q.state===status):all,counts:Object.fromEntries(['open','assigned','waiting','escalated','resolved'].map(k=>[k,all.filter(q=>q.state===k).length]))};
 },
 'teacher.calendar':(s,_a,{actor})=>{const teacher=teacherOf(s,actor);if(!teacher)return null;const ids=ownedIds(s,teacher);return {courses:s.courses.filter(c=>ids.has(c.id)&&c.status!=='Archived').map(c=>({id:c.id,title:editView(c).title})),sessions:s.live_sessions.filter(x=>ids.has(x.course_id)&&x.status!=='draft').sort((a,b)=>a.starts_at.localeCompare(b.starts_at)).map(x=>({...x,course_title:courseTitleOf(s,x.course_id)}))};},
 'teacher.team':(s,_a,{actor})=>{
  const teacher=teacherOf(s,actor);if(!teacher)return null;const ids=ownedIds(s,teacher);
  const rows=s.teacher_team_members.filter(m=>m.teacher_id===teacher.id).map(m=>({...m,user:s.users.find(u=>u.id===m.user_id),expired:!!m.expires_at&&m.expires_at<=DEMO_NOW,assignments:s.course_team_assignments.filter(a=>a.team_member_id===m.id&&a.status==='active'&&ids.has(a.course_id)).map(a=>({...a,course_title:courseTitleOf(s,a.course_id)}))}));
  return {members:rows.filter(m=>m.status==='active'),invitations:rows.filter(m=>m.status==='invited'),former:rows.filter(m=>!['active','invited'].includes(m.status)),courses:s.courses.filter(c=>ids.has(c.id)&&c.status!=='Archived').map(c=>({id:c.id,title:editView(c).title,status:c.status}))};
 },
 'teacher.earnings':(s,_a,{actor})=>{
  const teacher=teacherOf(s,actor);if(!teacher)return null;
  const allocations=s.earning_allocations.filter(a=>a.teacher_id===teacher.id),items=s.order_items.filter(i=>i.owner_teacher_id_snapshot===teacher.id&&allocations.some(a=>a.order_item_id===i.id));
  const sales=items.map(i=>({...i,order_state:s.orders.find(o=>o.id===i.order_id)?.state,allocation:allocations.find(a=>a.order_item_id===i.id&&!a.original_allocation_id)??null,refund:s.refunds.find(r=>r.order_item_id===i.id)??null})).sort((a,b)=>b.created_at.localeCompare(a.created_at));
  const linked=a=>({original:a,item:items.find(i=>i.id===a?.order_item_id)??null});
  const adjustments=[...s.adjustments.filter(x=>allocations.some(a=>a.id===x.original_allocation_id)).map(x=>({id:x.id,signed_amount_baisa:x.signed_amount_baisa,reason:x.reason,created_at:x.created_at,...linked(allocations.find(a=>a.id===x.original_allocation_id))})),
   ...allocations.filter(a=>a.original_allocation_id&&!s.adjustments.some(x=>x.original_allocation_id===a.original_allocation_id)).map(a=>({id:a.id,signed_amount_baisa:a.amount_baisa,reason:null,created_at:a.created_at,...linked(allocations.find(x=>x.id===a.original_allocation_id))}))].sort((a,b)=>b.created_at.localeCompare(a.created_at));
  const byState=Object.fromEntries(EARNING_STATES.map(k=>[k,allocations.filter(a=>a.state===k).reduce((n,a)=>n+a.amount_baisa,0)]));
  const payouts=s.teacher_payouts.filter(p=>p.teacher_id===teacher.id).map(p=>{const b=s.payout_batches.find(x=>x.id===p.batch_id);return {...p,batch:{id:b.id,state:b.state,period_label:b.period_label,submitted_at:b.submitted_at,approved_at:b.approved_at,failure_reason:b.failure_reason,destination:b.destination_snapshots.find(d=>d.teacher_id===teacher.id)??null}};}).sort((a,b)=>b.created_at.localeCompare(a.created_at));
  return {teacher,ledger:teacherLedger(s,teacher.id),sales,allocations,adjustments,byState,payouts,account:s.teacher_payout_accounts.find(a=>a.teacher_id===teacher.id)??null};
 },
 'teacher.settings':(s,_a,{actor})=>{
  const teacher=teacherOf(s,actor);if(!teacher)return null;const held=s.teacher_grade_subjects.filter(q=>q.teacher_id===teacher.id);
  const pair=id=>{const gs=s.grade_subjects.find(g=>g.id===id);return {id,grade:s.grades.find(g=>g.id===gs.grade_id),subject:s.subjects.find(x=>x.id===gs.subject_id),display_name:gs.display_name};};
  return {teacher,user:s.users.find(u=>u.id===teacher.user_id),prefs:Object.fromEntries(TEACHER_PREFS.map(k=>[k,teacher.notification_prefs?.[k]??true])),
   verified:held.filter(q=>q.verification_state==='verified').map(q=>pair(q.grade_subject_id)).sort((a,b)=>a.grade.number-b.grade.number),pending:held.filter(q=>q.verification_state!=='verified').map(q=>({...pair(q.grade_subject_id),state:q.verification_state,requested_at:q.created_at})),
   requestable:s.grade_subjects.filter(g=>g.active&&!held.some(q=>q.grade_subject_id===g.id)).map(g=>pair(g.id)).sort((a,b)=>a.grade.number-b.grade.number)};
 },
});
Object.assign(reducers,{
 // Transient wizard/form state so inline validation survives rerenders (teacher-authored strings only).
 // Also backs the P7 assistant forms (same transient store, cleared on role switch).
 'teacher.saveForm':(s,p,{actor})=>{
  if((!teacherOf(s,actor)&&!assistantOf(s,actor))||typeof p.name!=='string'||!/^[\w:-]{1,60}$/.test(p.name))return fail('invalidAction');
  const values=Object.fromEntries(Object.entries(p.values??{}).filter(([k,v])=>/^\w{1,40}$/.test(k)&&typeof v==='string').map(([k,v])=>[k,v.slice(0,4000)]));
  const fieldErrors=Object.fromEntries(Object.entries(p.fieldErrors??{}).filter(([k,v])=>/^\w{1,40}$/.test(k)&&typeof v==='string'&&/^(?:error|p4|p6|p7)\.\w+$/.test(v)));
  (s.transient.teacherForms??={})[p.name]={values,fieldErrors};return ok(null);
 },
 'teacher.clearForm':(s,p)=>{ if(s.transient.teacherForms&&typeof p.name==='string')delete s.transient.teacherForms[p.name];return ok(null); },
 // Wizard save. A new course is created (Draft, generated ID) once identity and academics are both valid;
 // a Published course keeps its live fields and stores the edit as pending_revision.
 'course.saveDraft':(s,p,{actor})=>{
  const teacher=teacherOf(s,actor);if(!teacher)return fail('p6.teacherOnly');
  if(!['identity','academics','access'].includes(p.step))return fail('invalidAction');
  let course=null;
  if(p.courseId){const g=ownedCourse(s,actor,p.courseId);if(g.error)return fail(g.error);course=g.course;const lock=metaLock(course);if(lock)return fail(lock);}
  const {values,errors}=validateCourseStep(s,teacher,p.step,p.values??{});
  if(Object.keys(errors).length)return failFields(errors,'error.form',{step:p.step});
  if(!course) {
   if(p.step==='access')return fail('p6.saveFirst');
   const draft={...(s.transient.courseDraft??{}),...values};
   if(!draft.title||!draft.grade_subject_id){s.transient.courseDraft=draft;return ok({id:null,created:false,next:draft.title?'academics':'identity'});}
   const id=nextId(s.courses,'C');
   course={id,owner_teacher_id:teacher.id,grade_subject_id:draft.grade_subject_id,academic_year_id:draft.academic_year_id,semester_id:draft.semester_id,track_id:draft.track_id,title:draft.title,summary:draft.summary,description:draft.description,outcomes:draft.outcomes,prerequisites:draft.prerequisites,language:draft.language,mode:draft.mode,status:'Draft',price_type:'free',price_baisa:0,access_policy:{kind:'academic_year',end_at:ACCESS_END},
    support_summary:{ar:'أسئلة الدروس داخل الدورة بإشراف المعلم.',en:'Teacher-moderated lesson Q&A inside the course.'},cover_seed:s.courses.length+1,published_snapshot:null,pending_revision:null,review_feedback:{ar:'',en:''},created_at:DEMO_NOW,updated_at:DEMO_NOW};
   s.courses.push(course);s.modules.push({id:nextId(s.modules,'MOD'),course_id:id,title:{ar:'الوحدة الأولى',en:'Module 1'},position:1,created_at:DEMO_NOW,updated_at:DEMO_NOW});
   delete s.transient.courseDraft;audit(s,actor,'course.create','course',id,'','Draft');
   return ok({id,created:true});
  }
  if(course.status==='Published') {
   const prev=course.pending_revision;
   course.pending_revision={status:prev?.status==='ChangesRequested'?'ChangesRequested':'Draft',fields:{...(prev?.fields??{}),...structuredClone(values)},feedback:prev?.feedback??null,started_at:prev?.started_at??DEMO_NOW,updated_at:DEMO_NOW};
   if(!prev)audit(s,actor,'course.start_revision','course',course.id,'Published','pending_revision');
   return ok({id:course.id,created:false,revision:true});
  }
  Object.assign(course,structuredClone(values),{updated_at:DEMO_NOW});return ok({id:course.id,created:false,revision:false});
 },
 'course.requestRevision':(s,p,{actor})=>{
  const g=ownedCourse(s,actor,p.courseId);if(g.error)return fail(g.error);
  if(g.course.status!=='Published')return fail('p6.invalidTransition');
  if(g.course.pending_revision)return ok({id:g.course.id,existing:true});
  g.course.pending_revision={status:'Draft',fields:{},feedback:null,started_at:DEMO_NOW,updated_at:DEMO_NOW};
  audit(s,actor,'course.start_revision','course',g.course.id,'Published','pending_revision');return ok({id:g.course.id,existing:false});
 },
 'course.submit':(s,p,{actor})=>{
  const g=ownedCourse(s,actor,p.courseId);if(g.error)return fail(g.error);const c=g.course,rev=c.pending_revision;
  if(c.status==='Submitted'||rev?.status==='Submitted')return ok({id:c.id,existing:true});
  const fresh=['Draft','ChangesRequested'].includes(c.status),revision=c.status==='Published'&&!!rev&&['Draft','ChangesRequested'].includes(rev.status);
  if(!fresh&&!revision)return fail('p6.invalidTransition');
  if(checklistBlocked(s,c))return fail('p6.checklistIncomplete');
  const before=revision?'revision:'+rev.status:c.status;
  if(revision)Object.assign(rev,{status:'Submitted',submitted_at:DEMO_NOW,updated_at:DEMO_NOW});else Object.assign(c,{status:'Submitted',updated_at:DEMO_NOW});
  audit(s,actor,'course.submit','course',c.id,before,revision?'revision:Submitted':'Submitted');
  for(const m of moderators(s))notifyUser(s,m,{event:`course-submitted-${c.id}-${s.audit_events.length}`,type:'course_review',title:{ar:'دورة بانتظار المراجعة',en:'Course awaiting review'},body:structuredClone(editView(c).title),href:'#/admin/courses/review',courseId:c.id});
  return ok({id:c.id,existing:false,revision});
 },
 // Staff-only moderation decision (the review queue UI lands in P8). Approval re-validates the owner's
 // verified qualifications, so a forged classification can never be published.
 'course.review':(s,p,{actor,can})=>{
  if(!can('courses.moderate',{module:'courses'}))return fail('resourceDenied');
  const c=s.courses.find(x=>x.id===p.courseId);if(!c)return fail('missing');
  const revision=c.status==='Published'&&c.pending_revision?.status==='Submitted';
  if(c.status!=='Submitted'&&!revision)return fail('p6.invalidTransition');
  const owner=s.teachers.find(x=>x.id===c.owner_teacher_id),before=revision?'revision:Submitted':'Submitted';
  const note={event:`course-review-${c.id}-${s.audit_events.length}`,href:`#/teacher/course/${c.id}?tab=details`,courseId:c.id,body:structuredClone(editView(c).title)};
  if(p.decision==='requestChanges') {
   const feedback=text(p.feedback,1000),error=feedback&&feedback.length<10?'error.messageShort':lengthError(feedback,10);if(error)return failFields({feedback:error});
   if(revision)Object.assign(c.pending_revision,{status:'ChangesRequested',feedback:typed(feedback),updated_at:DEMO_NOW});else c.status='ChangesRequested';
   Object.assign(c,{review_feedback:typed(feedback),updated_at:DEMO_NOW});audit(s,actor,'course.request_changes','course',c.id,before,revision?'revision:ChangesRequested':'ChangesRequested',feedback);
   notifyUser(s,owner?.user_id,{...note,type:'review_feedback',title:{ar:'تعديلات مطلوبة على دورتك',en:'Changes requested on your course'}});
   return ok({id:c.id,status:c.status});
  }
  if(p.decision!=='approve')return fail('invalidAction');
  if(!qualifiedPairs(s,c.owner_teacher_id).has(editView(c).grade_subject_id))return fail('p6.notQualified');
  if(checklistBlocked(s,c))return fail('p6.checklistIncomplete');
  if(revision)Object.assign(c,structuredClone(c.pending_revision.fields));
  else { c.status='Published';for(const l of s.lessons.filter(l=>l.state==='ready'&&s.modules.some(m=>m.id===l.module_id&&m.course_id===c.id)))Object.assign(l,{state:'published',updated_at:DEMO_NOW}); }
  Object.assign(c,{published_snapshot:snapshotOf(c),pending_revision:null,review_feedback:{ar:'',en:''},updated_at:DEMO_NOW});
  audit(s,actor,'course.approve','course',c.id,before,'Published',text(p.feedback,1000)||'Checklist complete');
  notifyUser(s,owner?.user_id,{...note,type:'review_approved',title:{ar:'تم اعتماد دورتك',en:'Your course was approved'}});
  return ok({id:c.id,status:'Published'});
 },
 'course.requestUnpublish':(s,p,{actor})=>{
  const g=ownedCourse(s,actor,p.courseId);if(g.error)return fail(g.error);const c=g.course;
  if(c.status!=='Published')return fail('p6.invalidTransition');
  if(c.unpublish_request)return ok({id:c.id,existing:true});
  const reason=text(p.reason,600),error=reason&&reason.length<10?'error.messageShort':lengthError(reason,10);if(error)return failFields({reason:error});
  c.unpublish_request={state:'requested',reason:typed(reason),requested_at:DEMO_NOW};c.updated_at=DEMO_NOW;
  audit(s,actor,'course.request_unpublish','course',c.id,'Published','unpublish_requested',reason);
  for(const m of moderators(s))notifyUser(s,m,{event:'course-unpublish-'+c.id,type:'course_review',title:{ar:'طلب إلغاء نشر دورة',en:'Course unpublish request'},body:structuredClone(c.title),href:'#/admin/courses/catalog',courseId:c.id});
  return ok({id:c.id,existing:false});
 },
 'module.add':(s,p,{actor})=>{
  const g=ownedCourse(s,actor,p.courseId);if(g.error)return fail(g.error);const lock=contentLock(g.course);if(lock)return fail(lock);
  const r=pairText({ar:p.title_ar,en:p.title_en},3,120),errors=pick({title_ar:r.errors.ar,title_en:r.errors.en});if(Object.keys(errors).length)return failFields(errors);
  const m={id:nextId(s.modules,'MOD'),course_id:g.course.id,title:r.value,position:Math.max(0,...s.modules.filter(x=>x.course_id===g.course.id).map(x=>x.position))+1,created_at:DEMO_NOW,updated_at:DEMO_NOW};
  s.modules.push(m);return ok({moduleId:m.id});
 },
 'lesson.add':(s,p,{actor})=>{
  const g=ownedCourse(s,actor,p.courseId);if(g.error)return fail(g.error);const lock=contentLock(g.course);if(lock)return fail(lock);
  const module=s.modules.find(m=>m.id===p.moduleId&&m.course_id===g.course.id);
  const {values,errors}=lessonFields(p,false,p.type);if(!module)errors.moduleId='error.required';if(Object.keys(errors).length)return failFields(errors);
  const lesson=newLesson(s,module,values);publishLessonAlert(s,g.course,lesson);g.course.updated_at=DEMO_NOW;return ok({lessonId:lesson.id});
 },
 // Owner edits any lesson field; an assistant holding edit_content on this exact course may revise
 // title/text only (state, preview and duration stay owner publishing decisions) and every edit is audited.
 'lesson.update':(s,p,{actor,can})=>{
  const assistant=s.preferences.role==='assistant';
  const g=assistant?lessonGuardAssistant(s,p.lessonId,can):lessonGuardTeacher(s,actor,p.lessonId);if(g.error)return fail(g.error);const lock=contentLock(g.course);if(lock)return fail(lock);
  if(assistant&&['duration','state','preview'].some(k=>k in p))return fail('p7.ownerOnlyField');
  const fields=Object.fromEntries(Object.entries(p).filter(([k])=>['title_ar','title_en','duration','state','preview','body'].includes(k)));
  if(!Object.keys(fields).length)return fail('invalidAction');
  const {values,errors}=lessonFields(fields,true,g.lesson.type);if(Object.keys(errors).length)return failFields(errors);
  const was=g.lesson.state;Object.assign(g.lesson,values,{updated_at:DEMO_NOW});
  if(values.body&&g.lesson.type==='video')g.lesson.transcript=structuredClone(values.body);
  if(assistant)audit(s,actor,'lesson.assistant_edit','course',g.course.id,'',g.lesson.id,Object.keys(values).join('+'));
  if(was!=='published')publishLessonAlert(s,g.course,g.lesson);return ok({lessonId:g.lesson.id});
 },
 'lesson.move':(s,p,{actor})=>{
  const g=lessonGuardTeacher(s,actor,p.lessonId);if(g.error)return fail(g.error);const lock=contentLock(g.course);if(lock)return fail(lock);
  const siblings=s.lessons.filter(l=>l.module_id===g.lesson.module_id).sort(byPosition),i=siblings.indexOf(g.lesson),j=p.direction==='up'?i-1:p.direction==='down'?i+1:-1;
  if(j<0||j>=siblings.length)return fail('p6.cannotMove');
  const other=siblings[j];[g.lesson.position,other.position]=[other.position,g.lesson.position];g.lesson.updated_at=other.updated_at=DEMO_NOW;
  return ok({lessonId:g.lesson.id,position:g.lesson.position});
 },
 'quiz.create':(s,p,{actor})=>{
  const g=ownedCourse(s,actor,p.courseId);if(g.error)return fail(g.error);const lock=contentLock(g.course);if(lock)return fail(lock);
  const module=s.modules.find(m=>m.id===p.moduleId&&m.course_id===g.course.id);
  const {values,errors}=quizFields(p);if(!module)errors.moduleId='error.required';if(Object.keys(errors).length)return failFields(errors);
  const lesson=newLesson(s,module,{title:typed(values.title),type:'quiz',duration_seconds:600,state:'ready',preview:false,body:typed('')});
  const id=nextId(s.quizzes,'QUIZ'),qids=values.questions.map(q=>{const qid=nextId(s.questions,'QUESTION');s.questions.push({id:qid,quiz_id:id,version:1,prompt:typed(q.prompt),choices:q.choices.map((c,i)=>({id:'abc'[i],text:typed(c)})),correct_choice_id:'abc'[q.correct],points:10,created_at:DEMO_NOW,updated_at:DEMO_NOW});return qid;});
  s.quizzes.push({id,course_id:g.course.id,lesson_id:lesson.id,title:typed(values.title),pass_score:values.pass_score,attempt_limit:2,question_ids:qids,created_at:DEMO_NOW,updated_at:DEMO_NOW});
  return ok({quizId:id,lessonId:lesson.id});
 },
 'quiz.update':(s,p,{actor})=>{
  const q=s.quizzes.find(x=>x.id===p.quizId);if(!q)return fail('missing');const g=ownedCourse(s,actor,q.course_id);if(g.error)return fail(g.error);const lock=contentLock(g.course);if(lock)return fail(lock);
  const title=text(p.title,120),pass=intIn(p.pass_score,0,100),errors=pick({title:lengthError(title,3),pass_score:pass===null?'p6.passRange':null});if(Object.keys(errors).length)return failFields(errors);
  Object.assign(q,{title:typed(title),pass_score:pass,updated_at:DEMO_NOW});Object.assign(s.lessons.find(l=>l.id===q.lesson_id),{title:typed(title),updated_at:DEMO_NOW});return ok({quizId:q.id});
 },
 'assignment.create':(s,p,{actor})=>{
  const g=ownedCourse(s,actor,p.courseId);if(g.error)return fail(g.error);const lock=contentLock(g.course);if(lock)return fail(lock);
  const module=s.modules.find(m=>m.id===p.moduleId&&m.course_id===g.course.id);
  const {values,errors}=assignmentFields(p);if(!module)errors.moduleId='error.required';if(Object.keys(errors).length)return failFields(errors);
  const lesson=newLesson(s,module,{title:typed(values.title),type:'assignment',duration_seconds:900,state:'ready',preview:false,body:typed(values.instructions)});
  const a={id:nextId(s.assignments,'ASG'),course_id:g.course.id,lesson_id:lesson.id,title:typed(values.title),instructions:typed(values.instructions),due_at:values.due_at,max_score:values.max_score,created_at:DEMO_NOW,updated_at:DEMO_NOW};
  s.assignments.push(a);return ok({assignmentId:a.id,lessonId:lesson.id});
 },
 'assignment.update':(s,p,{actor})=>{
  const a=s.assignments.find(x=>x.id===p.assignmentId);if(!a)return fail('missing');const g=ownedCourse(s,actor,a.course_id);if(g.error)return fail(g.error);const lock=contentLock(g.course);if(lock)return fail(lock);
  const {values,errors}=assignmentFields(p);if(Object.keys(errors).length)return failFields(errors);
  Object.assign(a,{title:typed(values.title),instructions:typed(values.instructions),due_at:values.due_at,max_score:values.max_score,updated_at:DEMO_NOW});Object.assign(s.lessons.find(l=>l.id===a.lesson_id),{title:typed(values.title),body:typed(values.instructions),updated_at:DEMO_NOW});
  return ok({assignmentId:a.id});
 },
 'resource.add':(s,p,{actor})=>{
  const g=lessonGuardTeacher(s,actor,p.lessonId);if(g.error)return g.error==='missing'?failFields({lessonId:'error.required'}):fail(g.error);const lock=contentLock(g.course);if(lock)return fail(lock);
  const title=text(p.title,120),filename=text(p.filename,80).split(/[\\/]/).pop(),body=text(p.body,4000);
  const errors=pick({title:lengthError(title,3),kind:['worksheet','pdf'].includes(p.kind)?null:'error.required',filename:!filename?'error.required':RESOURCE_FILE.test(filename)?null:'p6.resourceFileInvalid',body:body&&body.length<10?'error.messageShort':lengthError(body,10)});
  if(Object.keys(errors).length)return failFields(errors);
  const r={id:nextId(s.lesson_resources,'RES'),lesson_id:g.lesson.id,title:typed(title),kind:p.kind,filename,byte_size:new TextEncoder().encode(body).length,body:typed(body),created_at:DEMO_NOW,updated_at:DEMO_NOW};
  s.lesson_resources.push(r);return ok({resourceId:r.id});
 },
 'resource.update':(s,p,{actor})=>{
  const r=s.lesson_resources.find(x=>x.id===p.resourceId);if(!r)return fail('missing');const g=lessonGuardTeacher(s,actor,r.lesson_id);if(g.error)return fail(g.error);const lock=contentLock(g.course);if(lock)return fail(lock);
  const title=text(p.title,120),body=text(p.body,4000),errors=pick({title:lengthError(title,3),body:body&&body.length<10?'error.messageShort':lengthError(body,10)});if(Object.keys(errors).length)return failFields(errors);
  Object.assign(r,{title:typed(title),body:typed(body),byte_size:new TextEncoder().encode(body).length,updated_at:DEMO_NOW});return ok({resourceId:r.id});
 },
 // Grading is capability-scoped (owner, or an assistant holding grade_assignment on this course).
 'submission.grade':(s,p,{actor,can})=>{
  const sub=s.submissions.find(x=>x.id===p.submissionId);if(!sub)return fail('missing');const a=s.assignments.find(x=>x.id===sub.assignment_id),c=s.courses.find(x=>x.id===a.course_id);
  if(!actor.user_id||!can('grade_assignment',c))return fail('resourceDenied');
  if(sub.state==='released')return fail('p6.alreadyReleased');
  const score=intIn(p.score,0,a.max_score),feedback=text(p.feedback,1000),errors=pick({score:score===null?'p6.scoreRange':null,feedback:lengthError(feedback,2)});if(Object.keys(errors).length)return failFields(errors);
  let grade=s.assessment_grades.find(x=>x.submission_id===sub.id);
  if(grade)Object.assign(grade,{grader_user_id:actor.user_id,score,feedback,updated_at:DEMO_NOW});
  else {grade={id:nextId(s.assessment_grades,'GRADE'),submission_id:sub.id,grader_user_id:actor.user_id,score,feedback,released_at:null,created_at:DEMO_NOW,updated_at:DEMO_NOW};s.assessment_grades.push(grade);}
  Object.assign(sub,{state:'graded',updated_at:DEMO_NOW});return ok({gradeId:grade.id});
 },
 'submission.release':(s,p,{actor,can})=>{
  const sub=s.submissions.find(x=>x.id===p.submissionId);if(!sub)return fail('missing');const a=s.assignments.find(x=>x.id===sub.assignment_id),c=s.courses.find(x=>x.id===a.course_id);
  if(!actor.user_id||!can('grade_assignment',c))return fail('resourceDenied');
  const grade=s.assessment_grades.find(x=>x.submission_id===sub.id);if(!grade)return fail('p6.gradeFirst');
  if(grade.released_at)return ok({gradeId:grade.id,existing:true});
  Object.assign(grade,{released_at:DEMO_NOW,updated_at:DEMO_NOW});Object.assign(sub,{state:'released',updated_at:DEMO_NOW});
  const st=s.students.find(x=>x.id===sub.student_id);
  notifyUser(s,st?.user_id,{event:'grade-released-'+grade.id,type:'grade_released',title:{ar:'نُشرت نتيجة مهمتك',en:'Your task result is released'},body:structuredClone(a.title),href:`#/student/course/${c.id}?tab=assessments&activity=${a.id}`,courseId:c.id});
  audit(s,actor,'submission.release','submission',sub.id,'graded','released');
  return ok({gradeId:grade.id,existing:false});
 },
 // Live lifecycle: one notification per entitled learner per event (join_generation keys reschedules).
 'live.schedule':(s,p,{actor})=>{
  const g=ownedCourse(s,actor,p.courseId);if(g.error)return fail(g.error);if(g.course.status==='Archived')return fail('p6.lockedArchived');
  const title=text(p.title,120),start=muscatToUtc(p.starts_at),minutes=intIn(p.duration,15,180);
  const errors=pick({title:lengthError(title,3),starts_at:!start?'error.required':start<=DEMO_NOW?'p6.startFuture':null,duration:minutes===null?'p6.durationLive':null});if(Object.keys(errors).length)return failFields(errors);
  const x={id:nextId(s.live_sessions,'LS'),course_id:g.course.id,host_teacher_id:g.teacher.id,title:typed(title),starts_at:start,ends_at:new Date(Date.parse(start)+minutes*60000).toISOString().replace('.000Z','Z'),timezone:'Asia/Muscat',status:'scheduled',provider_ref:'demo',join_generation:1,recording_disclosure:{ar:'قد تُسجَّل هذه الحصة التجريبية ليشاهدها المسجلون في الدورة فقط.',en:'This simulated class may be recorded for enrolled learners only.'},created_at:DEMO_NOW,updated_at:DEMO_NOW};
  s.live_sessions.push(x);liveAlert(s,x,'scheduled',{ar:'حصة مباشرة جديدة',en:'New live class scheduled'});return ok({sessionId:x.id});
 },
 'live.reschedule':(s,p,{actor})=>{
  const g=sessionGuard(s,actor,p.sessionId);if(g.error)return fail(g.error);const x=g.session;
  if(!['scheduled','rescheduled','failed'].includes(x.status))return fail('p6.invalidTransition');
  const start=muscatToUtc(p.starts_at);if(!start||start<=DEMO_NOW)return failFields({starts_at:start?'p6.startFuture':'error.required'});
  const length=Date.parse(x.ends_at)-Date.parse(x.starts_at);
  Object.assign(x,{starts_at:start,ends_at:new Date(Date.parse(start)+length).toISOString().replace('.000Z','Z'),status:'rescheduled',join_generation:x.join_generation+1,updated_at:DEMO_NOW});
  liveAlert(s,x,'rescheduled',{ar:'تغيير موعد حصة',en:'Class rescheduled'});return ok({sessionId:x.id});
 },
 'live.cancel':(s,p,{actor})=>{
  const g=sessionGuard(s,actor,p.sessionId);if(g.error)return fail(g.error);const x=g.session;
  if(x.status==='cancelled')return ok({sessionId:x.id,existing:true});
  if(!['scheduled','rescheduled'].includes(x.status))return fail('p6.invalidTransition');
  Object.assign(x,{status:'cancelled',updated_at:DEMO_NOW});liveAlert(s,x,'cancelled',{ar:'أُلغيت حصة مباشرة',en:'Live class cancelled'});return ok({sessionId:x.id,existing:false});
 },
 'recording.upload':(s,p,{actor})=>{
  const g=sessionGuard(s,actor,p.sessionId);if(g.error)return fail(g.error);const x=g.session;
  const existing=s.recordings.find(r=>r.live_session_id===x.id);if(existing)return ok({recordingId:existing.id,existing:true});
  if(x.status!=='ended')return fail('p6.invalidTransition');
  const filename=text(p.filename,80).split(/[\\/]/).pop();if(!RECORDING_FILE.test(filename))return failFields({filename:filename?'p6.recordingFileInvalid':'error.required'});
  const r={id:nextId(s.recordings,'REC'),live_session_id:x.id,course_id:x.course_id,title:{ar:`تسجيل: ${x.title.ar}`,en:`Recording: ${x.title.en}`},state:'processing',duration_seconds:Math.round((Date.parse(x.ends_at)-Date.parse(x.starts_at))/1000),published_at:null,simulated_media_ref:'demo-recording-'+filename,created_at:DEMO_NOW,updated_at:DEMO_NOW};
  s.recordings.push(r);Object.assign(x,{status:'recording_processing',updated_at:DEMO_NOW});return ok({recordingId:r.id,existing:false});
 },
 // Simulated processing completion: a ready recording stays private and alerts nobody.
 'recording.complete':(s,p,{actor})=>{
  const r=s.recordings.find(x=>x.id===p.recordingId);if(!r)return fail('missing');const g=sessionGuard(s,actor,r.live_session_id);if(g.error)return fail(g.error);
  if(r.state!=='processing')return ok({recordingId:r.id,existing:true});
  Object.assign(r,{state:'ready',updated_at:DEMO_NOW});Object.assign(g.session,{status:'recording_ready',updated_at:DEMO_NOW});return ok({recordingId:r.id,existing:false});
 },
 'recording.publish':(s,p,{actor})=>{
  const r=s.recordings.find(x=>x.id===p.recordingId);if(!r)return fail('missing');const g=sessionGuard(s,actor,r.live_session_id);if(g.error)return fail(g.error);
  if(r.state==='published')return ok({recordingId:r.id,existing:true});
  if(r.state!=='ready')return fail('p6.recordingNotReady');
  Object.assign(r,{state:'published',published_at:DEMO_NOW,updated_at:DEMO_NOW});Object.assign(g.session,{status:'recording_published',updated_at:DEMO_NOW});
  notifyLearners(s,r.course_id,{event:'recording-published-'+r.id,type:'recording',title:{ar:'تسجيل جديد متاح',en:'New recording available'},body:structuredClone(r.title),href:`#/student/course/${r.course_id}?tab=live&recording=${r.id}`});
  return ok({recordingId:r.id,existing:false});
 },
 'announcement.post':(s,p,{actor})=>{
  const g=ownedCourse(s,actor,p.courseId);if(g.error)return fail(g.error);if(g.course.status==='Archived')return fail('p6.lockedArchived');
  const title=text(p.title,120),body=text(p.body,2000),errors=pick({title:lengthError(title,3),body:body&&body.length<10?'error.messageShort':lengthError(body,10)});if(Object.keys(errors).length)return failFields(errors);
  const a={id:nextId(s.announcements,'ANN'),course_id:g.course.id,author_user_id:actor.user_id,title:typed(title),body:typed(body),published_at:DEMO_NOW,created_at:DEMO_NOW};
  s.announcements.push(a);notifyLearners(s,g.course.id,{event:'announcement-'+a.id,type:'announcement',title:{ar:'إعلان جديد',en:'New announcement'},body:typed(title),href:`#/student/course/${g.course.id}?tab=announcements`});
  return ok({announcementId:a.id});
 },
 // Inbox. Only the owner assigns; assignees must be active members holding reply_conversation on this course.
 'conversation.assign':(s,p,{actor})=>{
  const q=s.conversations.find(x=>x.id===p.conversationId);if(!q)return fail('missing');
  const g=ownedCourse(s,actor,q.course_id);if(g.error)return fail(g.error);
  if(q.state==='resolved')return fail('p6.invalidTransition');
  const self=p.assigneeUserId===actor.user_id,member=replyMembers(s,q.course_id).find(m=>m.user_id===p.assigneeUserId);
  if(!self&&!member)return failFields({assigneeUserId:'p6.assigneeInvalid'});
  if(q.assigned_user_id===p.assigneeUserId&&q.state==='assigned')return ok({conversationId:q.id,existing:true});
  for(const a of s.conversation_assignments.filter(x=>x.conversation_id===q.id&&x.status==='active'))Object.assign(a,{status:'revoked',updated_at:DEMO_NOW});
  const a={id:nextId(s.conversation_assignments,'QA'),conversation_id:q.id,assignee_user_id:p.assigneeUserId,assigned_by:actor.user_id,status:'active',created_at:DEMO_NOW,updated_at:DEMO_NOW};s.conversation_assignments.push(a);
  const before=q.state;Object.assign(q,{assigned_user_id:p.assigneeUserId,state:'assigned',updated_at:DEMO_NOW});
  audit(s,actor,'conversation.assign','conversation',q.id,before,'assigned');
  if(!self)notifyUser(s,p.assigneeUserId,{event:'conversation-assigned-'+a.id,type:'assigned_conversation',title:{ar:'أُسند إليك سؤال',en:'Question assigned to you'},body:structuredClone(q.subject),href:'#/assistant/inbox/'+q.id,courseId:q.course_id});
  return ok({conversationId:q.id,assignmentId:a.id,existing:false});
 },
 'conversation.reply':(s,p,{actor,can})=>{
  const g=conversationGuard(s,actor,p.conversationId,'reply_conversation',can);if(g.error)return fail(g.error);const q=g.conversation;
  const body=text(p.text,2000),error=lengthError(body,2);if(error)return failFields({text:error});
  const m=postMessage(s,q,actor,body,false);
  if(q.state==='open')Object.assign(q,{assigned_user_id:q.assigned_user_id??actor.user_id,state:'assigned'});
  const st=s.students.find(x=>x.id===q.student_id);
  notifyUser(s,st?.user_id,{event:'reply-'+m.id,type:'qa_reply',title:{ar:'رد جديد على سؤالك',en:'New reply to your question'},body:structuredClone(q.subject),href:'#/student/messages/'+q.id,courseId:q.course_id});
  return ok({conversationId:q.id,messageId:m.id});
 },
 // Internal notes are staff-only: never notified, never returned by learner or guardian selectors.
 'conversation.note':(s,p,{actor,can})=>{
  const g=conversationGuard(s,actor,p.conversationId,'reply_conversation',can);if(g.error)return fail(g.error);
  const body=text(p.text,2000),error=lengthError(body,2);if(error)return failFields({text:error});
  const m=postMessage(s,g.conversation,actor,body,true);audit(s,actor,'conversation.note','conversation',g.conversation.id,'','internal_note');return ok({conversationId:g.conversation.id,messageId:m.id});
 },
 'conversation.setStatus':(s,p,{actor,can})=>{
  const g=conversationGuard(s,actor,p.conversationId,'reply_conversation',can);if(g.error)return fail(g.error);const q=g.conversation;
  if(q.state===p.status)return ok({conversationId:q.id,existing:true});
  if(!(CONVERSATION_NEXT[q.state]??[]).includes(p.status)||(p.status==='assigned'&&!q.assigned_user_id))return fail('p6.invalidTransition');
  if(q.state==='escalated'&&g.course.owner_teacher_id!==teacherOf(s,actor)?.id)return fail('p6.ownerOnly');
  const before=q.state;Object.assign(q,{state:p.status,updated_at:DEMO_NOW});audit(s,actor,'conversation.status','conversation',q.id,before,p.status);
  const owner=s.teachers.find(x=>x.id===g.course.owner_teacher_id);
  if(p.status==='escalated'&&owner?.user_id!==actor.user_id)notifyUser(s,owner?.user_id,{event:`conversation-escalated-${q.id}-${s.audit_events.length}`,type:'escalation',title:{ar:'سؤال مصعّد إليك',en:'Question escalated to you'},body:structuredClone(q.subject),href:'#/teacher/inbox/'+q.id,courseId:q.course_id});
  return ok({conversationId:q.id,state:q.state});
 },
 'conversation.report':(s,p,{actor,can})=>{
  const g=conversationGuard(s,actor,p.conversationId,'reply_conversation',can);if(g.error)return fail(g.error);const q=g.conversation;
  const m=p.messageId?s.messages.find(x=>x.id===p.messageId&&x.conversation_id===q.id&&x.moderation_state!=='removed'):null;if(p.messageId&&!m)return fail('missing');
  if(!Object.hasOwn(REPORT_REASONS,p.reason))return failFields({reason:'p4.reasonRequired'});
  const existing=s.safety_reports.find(r=>r.reporter_user_id===actor.user_id&&(m?r.message_id===m.id:!r.message_id&&r.conversation_id===q.id));
  if(existing)return ok({reportId:existing.id,existing:true});
  const r={id:nextId(s.safety_reports,'SR'),reporter_user_id:actor.user_id,message_id:m?.id??null,conversation_id:q.id,course_id:q.course_id,reason:structuredClone(REPORT_REASONS[p.reason]),state:'open',restricted_note:'',assigned_staff_id:null,created_at:DEMO_NOW,updated_at:DEMO_NOW};
  s.safety_reports.push(r);if(m?.moderation_state==='visible')Object.assign(m,{moderation_state:'flagged',updated_at:DEMO_NOW});
  audit(s,actor,'conversation.report','conversation',q.id,'',r.id,p.reason);return ok({reportId:r.id,existing:false});
 },
 // Teaching team: synthetic invitations, per-course capability matrix and immediate revocation.
 'team.invite':(s,p,{actor})=>{
  const teacher=teacherOf(s,actor);if(!teacher)return fail('p6.teacherOnly');
  const email=text(p.email,120).toLowerCase(),days=INVITE_DAYS.includes(String(p.days))?Number(p.days):null;
  const errors=pick({email:!email?'error.required':!EMAIL.test(email)?'error.email':!email.endsWith('@example.test')?'p6.syntheticEmail':null,team_role:TEAM_ROLES.includes(p.team_role)?null:'error.required',days:days?null:'error.required'});
  const existingUser=errors.email?null:s.users.find(u=>u.email===email);
  if(existingUser&&(existingUser.id===actor.user_id||s.teacher_team_members.some(m=>m.teacher_id===teacher.id&&m.user_id===existingUser.id&&['active','invited'].includes(m.status))))errors.email='p6.alreadyMember';
  else if(existingUser&&s.role_assignments.some(r=>r.user_id===existingUser.id&&r.role!=='assistant'))errors.email='p6.notInvitable';
  if(Object.keys(errors).length)return failFields(errors);
  let user=existingUser;
  if(!user){user={id:nextId(s.users.filter(u=>u.id.startsWith('U-INV-')),'U-INV'),name:typed(email.split('@')[0]),email,status:'invited',locale:'ar',created_at:DEMO_NOW,updated_at:DEMO_NOW};s.users.push(user);}
  const m={id:nextId(s.teacher_team_members,'TM'),teacher_id:teacher.id,user_id:user.id,status:'invited',team_role:p.team_role,invited_at:DEMO_NOW,expires_at:new Date(Date.parse(DEMO_NOW)+days*DAY).toISOString().replace('.000Z','Z'),created_at:DEMO_NOW,updated_at:DEMO_NOW};
  s.teacher_team_members.push(m);audit(s,actor,'team.invite','teacher_team_member',m.id,'','invited',p.team_role);return ok({memberId:m.id});
 },
 'team.assign':(s,p,{actor})=>{
  const g=teamMember(s,actor,p.memberId);if(g.error)return fail(g.error);if(g.member.status!=='active')return fail('p6.memberNotActive');
  const matrix=p.assignments&&typeof p.assignments==='object'?p.assignments:{};
  for(const [courseId,caps] of Object.entries(matrix)){const c=s.courses.find(x=>x.id===courseId);if(!c)return fail('missing');if(c.owner_teacher_id!==g.teacher.id)return fail('resourceDenied');if(c.status==='Archived')return fail('p6.lockedArchived');if(!Array.isArray(caps)||caps.some(x=>!TEAM_CAPABILITIES.includes(x)))return fail('invalidAction');}
  const summary=[];
  for(const [courseId,caps] of Object.entries(matrix)) {
   const list=TEAM_CAPABILITIES.filter(x=>caps.includes(x)),row=s.course_team_assignments.find(a=>a.team_member_id===g.member.id&&a.course_id===courseId);
   if(row)Object.assign(row,{capabilities:list,status:list.length?'active':'revoked',updated_at:DEMO_NOW});
   else if(list.length)s.course_team_assignments.push({id:nextId(s.course_team_assignments,'CTA'),team_member_id:g.member.id,course_id:courseId,capabilities:list,status:'active',created_at:DEMO_NOW,updated_at:DEMO_NOW});
   summary.push(`${courseId}:${list.join('+')||'none'}`);
  }
  audit(s,actor,'team.assign','teacher_team_member',g.member.id,'',summary.join(' '));return ok({memberId:g.member.id});
 },
 'team.revoke':(s,p,{actor})=>{
  const g=teamMember(s,actor,p.memberId);if(g.error)return fail(g.error);const m=g.member;
  if(!['active','invited'].includes(m.status))return ok({memberId:m.id,existing:true});
  const before=m.status;revokeTeamMember(s,m);
  audit(s,actor,'team.revoke','teacher_team_member',m.id,before,'deactivated');return ok({memberId:m.id,existing:false});
 },
 // Destination changes are requests only: finance verifies before anything changes; only a masked tail is kept.
 'payoutAccount.requestChange':(s,p,{actor})=>{
  const teacher=teacherOf(s,actor);if(!teacher)return fail('p6.teacherOnly');
  const account=s.teacher_payout_accounts.find(a=>a.teacher_id===teacher.id);if(!account)return fail('missing');
  if(account.change_request?.state==='pending_verification')return ok({accountId:account.id,existing:true});
  const name=text(p.beneficiaryName,120),tail=text(p.accountRef,8);
  const errors=pick({beneficiaryName:lengthError(name,3),accountRef:/^\d{4}$/.test(tail)?null:'p6.accountRefInvalid',consent:p.consent===true||p.consent==='on'?null:'error.consent'});if(Object.keys(errors).length)return failFields(errors);
  account.change_request={state:'pending_verification',beneficiary_name:typed(name),masked_iban:`OM•• •••• •••• DEMO ${tail}`,requested_at:DEMO_NOW};account.updated_at=DEMO_NOW;
  audit(s,actor,'payout_account.request_change','teacher_payout_account',account.id,account.masked_iban,'change_requested');
  for(const u of userRoleIds(s,'admin_finance'))notifyUser(s,u,{event:'payout-account-change-'+account.id,type:'payout_account',title:{ar:'طلب تغيير حساب صرف',en:'Payout destination change request'},body:structuredClone(teacher.name),href:'#/admin/finance/payouts?tab=accounts',courseId:null});
  return ok({accountId:account.id,existing:false});
 },
 'teacher.updateProfile':(s,p,{actor})=>{
  const teacher=teacherOf(s,actor);if(!teacher)return fail('p6.teacherOnly');
  const r=pairText({ar:p.bio_ar,en:p.bio_en},20,600),errors=pick({bio_ar:r.errors.ar&&(r.value.ar?'error.bioShort':'error.required'),bio_en:r.errors.en&&(r.value.en?'error.bioShort':'error.required')});
  if(Object.keys(errors).length)return failFields(errors);
  Object.assign(teacher,{bio:r.value,updated_at:DEMO_NOW});return ok({teacherId:teacher.id});
 },
 'qualification.request':(s,p,{actor})=>{
  const teacher=teacherOf(s,actor);if(!teacher)return fail('p6.teacherOnly');
  const gs=s.grade_subjects.find(g=>g.id===p.gradeSubjectId&&g.active);if(!gs)return failFields({gradeSubjectId:'error.required'});
  const held=s.teacher_grade_subjects.find(q=>q.teacher_id===teacher.id&&q.grade_subject_id===gs.id);if(held)return held.verification_state==='verified'?failFields({gradeSubjectId:'p6.alreadyQualified'}):ok({id:held.id,existing:true});
  const row={id:nextId(s.teacher_grade_subjects,'TGS'),teacher_id:teacher.id,grade_subject_id:gs.id,verification_state:'pending',note:text(p.note,300),created_at:DEMO_NOW,updated_at:DEMO_NOW};
  s.teacher_grade_subjects.push(row);audit(s,actor,'qualification.request','teacher_grade_subject',row.id,'','pending',row.note);
  for(const m of moderators(s))notifyUser(s,m,{event:'qualification-'+row.id,type:'qualification',title:{ar:'طلب مؤهل تدريس جديد',en:'Teaching qualification request'},body:structuredClone(teacher.name),href:'#/admin/people/teachers',courseId:null});
  return ok({id:row.id,existing:false});
 },
 'teacher.updateSettings':(s,p,{actor})=>{
  const teacher=teacherOf(s,actor);if(!teacher)return fail('p6.teacherOnly');
  teacher.notification_prefs=Object.fromEntries(TEACHER_PREFS.map(k=>[k,p.prefs?.[k]===true||p.prefs?.[k]==='on']));teacher.updated_at=DEMO_NOW;return ok({...teacher.notification_prefs});
 },
});

// ---- P7 assistant workspace. Scope is re-derived on every read and action: an active team membership plus an
// active course_team_assignment per course (see can()); each action needs its own capability, and conversations
// additionally need an explicit active conversation_assignment. team.revoke therefore empties every selector at
// once. Mutations reuse the P6 reducers (conversation.*, submission.*, lesson.update) whose guards call can().
// No finance, guardian, enrollment export or learner contact data is returned — learner display names only.
export const ASSISTANT_PREFS=['in_app','email_digest','assigned_alerts','task_alerts'];
export const TASK_CAPABILITY=Object.freeze({grading:'grade_assignment',content:'edit_content'});
const TASK_NEXT={open:['in_progress','done'],in_progress:['done']};
const assistantOf=(s,actor)=>s.preferences.role==='assistant'?s.teacher_team_members.find(m=>m.id===actor.record_id&&m.user_id===actor.user_id&&m.status==='active'&&(!m.expires_at||m.expires_at>DEMO_NOW))??null:null;
function assistantScope(s,actor) {
 const m=assistantOf(s,actor);
 return new Map(m?s.course_team_assignments.filter(a=>a.team_member_id===m.id&&a.status==='active'&&a.capabilities.length&&s.courses.some(c=>c.id===a.course_id)).map(a=>[a.course_id,TEAM_CAPABILITIES.filter(x=>a.capabilities.includes(x))]):[]);
}
const assignedConversations=(s,actor,scope)=>s.conversations.filter(q=>scope.get(q.course_id)?.includes('reply_conversation')&&s.conversation_assignments.some(a=>a.conversation_id===q.id&&a.assignee_user_id===actor.user_id&&a.status==='active')).sort((a,b)=>b.last_message_at.localeCompare(a.last_message_at));
// Escalated threads belong to the owner until they reassign or resolve them.
const assistantNext=q=>q.state==='escalated'?[]:(CONVERSATION_NEXT[q.state]??[]).filter(x=>x!=='assigned'||q.assigned_user_id);
const ownerOf=(s,courseId)=>s.teachers.find(x=>x.id===s.courses.find(c=>c.id===courseId)?.owner_teacher_id)??null;
const liveTitle=(s,courseId)=>s.courses.find(c=>c.id===courseId).title;
function assistantRow(s,q) {
 const visible=s.messages.filter(m=>m.conversation_id===q.id&&!m.internal&&m.moderation_state!=='removed').sort((a,b)=>a.created_at.localeCompare(b.created_at));
 return {...q,course_title:liveTitle(s,q.course_id),student_name:s.students.find(x=>x.id===q.student_id)?.name??null,lesson_title:s.lessons.find(l=>l.id===q.lesson_id)?.title??null,last_text:visible.at(-1)?.text??'',message_count:visible.length,next:assistantNext(q)};
}
function assistantTasks(s,actor,scope) {
 return s.tasks.filter(x=>x.assignee_user_id===actor.user_id&&scope.has(x.course_id)).sort((a,b)=>(a.state==='done')-(b.state==='done')||a.due_at.localeCompare(b.due_at)).map(x=>{
  const allowed=scope.get(x.course_id).includes(TASK_CAPABILITY[x.kind]),lesson=x.kind==='content'?s.lessons.find(l=>l.id===x.target_id):null,sub=x.kind==='grading'?s.submissions.find(v=>v.id===x.target_id):null;
  const target=!allowed?null:lesson?{id:lesson.id,title:lesson.title,type:lesson.type,state:lesson.state,body:lesson.body}:sub?{id:sub.id,state:sub.state,title:s.assignments.find(a=>a.id===sub.assignment_id)?.title??null,student_name:s.students.find(v=>v.id===sub.student_id)?.name??null}:null;
  return {...x,course_title:liveTitle(s,x.course_id),allowed,capability:TASK_CAPABILITY[x.kind],target,next:allowed?TASK_NEXT[x.state]??[]:[]};
 });
}
function assistantCourseCard(s,actor,scope,courseId) {
 const c=s.courses.find(x=>x.id===courseId),gs=s.grade_subjects.find(x=>x.id===c.grade_subject_id),one=new Map([[courseId,scope.get(courseId)]]);
 return {id:c.id,title:c.title,status:c.status,mode:c.mode,grade:s.grades.find(g=>g.id===gs?.grade_id)??null,subject:s.subjects.find(x=>x.id===gs?.subject_id)??null,owner:ownerOf(s,c.id)?.name??null,capabilities:scope.get(courseId),
  lessons:lessonsIn(s,c.id).length,open:assignedConversations(s,actor,one).filter(q=>q.state!=='resolved').length,tasks:assistantTasks(s,actor,one).filter(x=>x.state!=='done').length};
}
const courseOutline=(s,courseId)=>s.modules.filter(m=>m.course_id===courseId).sort(byPosition).map(m=>({id:m.id,title:m.title,position:m.position,lessons:s.lessons.filter(l=>l.module_id===m.id).sort(byPosition).map(l=>({id:l.id,title:l.title,type:l.type,state:l.state,preview:l.preview,duration_seconds:l.duration_seconds,body:l.body}))}));
function assistantSubmissions(s,courseId) {
 const assignments=s.assignments.filter(a=>a.course_id===courseId);
 return s.submissions.filter(x=>assignments.some(a=>a.id===x.assignment_id)).map(x=>{
  const a=assignments.find(v=>v.id===x.assignment_id),st=s.students.find(v=>v.id===x.student_id),g=s.assessment_grades.find(v=>v.submission_id===x.id);
  return {id:x.id,text:x.text,filename:x.filename,state:x.state,submitted_at:x.submitted_at,assignment:{id:a.id,title:a.title,max_score:a.max_score},student:{id:st.id,name:st.name},grade:g?{score:g.score,feedback:g.feedback,released_at:g.released_at,grader:userName(s,g.grader_user_id)}:null};
 }).sort((a,b)=>(a.state==='released')-(b.state==='released')||a.submitted_at.localeCompare(b.submitted_at));
}
registerSelectors({
 'assistant.overview':(s,_a,{actor})=>{
  const member=assistantOf(s,actor),scope=assistantScope(s,actor),open=assignedConversations(s,actor,scope).filter(q=>q.state!=='resolved').map(q=>assistantRow(s,q)),tasks=assistantTasks(s,actor,scope).filter(x=>x.state!=='done');
  return {active:!!member,owner:member?s.teachers.find(x=>x.id===member.teacher_id)?.name??null:null,courses:[...scope.keys()].map(id=>assistantCourseCard(s,actor,scope,id)),
   counts:{courses:scope.size,open:open.length,due:tasks.length},queue:open.slice(0,5),tasks:tasks.slice(0,4)};
 },
 'assistant.courses':(s,_a,{actor})=>{const scope=assistantScope(s,actor);return {active:!!assistantOf(s,actor),courses:[...scope.keys()].map(id=>assistantCourseCard(s,actor,scope,id))};},
 'assistant.course':(s,{id},{actor})=>{
  const c=s.courses.find(x=>x.id===id);if(!c)return {status:'missing'};
  const scope=assistantScope(s,actor),caps=scope.get(id);if(!caps)return {status:'denied'};
  const read=caps.includes('read_content');
  return {status:'ok',course:assistantCourseCard(s,actor,scope,id),canRead:read,canEdit:caps.includes('edit_content'),contentLocked:contentLock(c),modules:read?courseOutline(s,id):[],tasks:assistantTasks(s,actor,new Map([[id,caps]]))};
 },
 'assistant.inbox':(s,{tab,waiting},{actor})=>{
  const all=assignedConversations(s,actor,assistantScope(s,actor)).map(q=>assistantRow(s,q));
  const TAB={open:q=>q.state==='open',assigned:q=>['assigned','waiting'].includes(q.state),escalated:q=>q.state==='escalated',resolved:q=>q.state==='resolved'};
  return {active:!!assistantOf(s,actor),rows:all.filter(TAB[tab]??TAB.open).filter(q=>!waiting||q.state==='waiting'),counts:{...Object.fromEntries(Object.entries(TAB).map(([k,f])=>[k,all.filter(f).length])),waiting:all.filter(q=>q.state==='waiting').length}};
 },
 'assistant.thread':(s,{id},{actor})=>{
  const q=s.conversations.find(x=>x.id===id);if(!q)return {status:'missing'};
  if(!assignedConversations(s,actor,assistantScope(s,actor)).includes(q))return {status:'denied'};
  return {status:'ok',conversation:assistantRow(s,q),owner:ownerOf(s,q.course_id)?.name??null,messages:staffMessages(s,q,actor),reported:ownReports(s,actor),trail:conversationTrail(s,q)};
 },
 'assistant.qa':(s,_a,{actor})=>{
  const scope=assistantScope(s,actor),rows=assignedConversations(s,actor,scope).filter(q=>q.kind==='lesson_qa').map(q=>assistantRow(s,q));
  return {active:!!assistantOf(s,actor),courses:[...scope].filter(([,caps])=>caps.includes('reply_conversation')).map(([id])=>({id,title:liveTitle(s,id),questions:rows.filter(q=>q.course_id===id)})),reported:ownReports(s,actor)};
 },
 'assistant.tasks':(s,_a,{actor})=>{
  const scope=assistantScope(s,actor),tasks=assistantTasks(s,actor,scope);
  const per=kind=>[...scope].map(([id,caps])=>{const allowed=caps.includes(TASK_CAPABILITY[kind]);return {id,title:liveTitle(s,id),allowed,capability:TASK_CAPABILITY[kind],contentLocked:contentLock(s.courses.find(c=>c.id===id)),tasks:tasks.filter(x=>x.course_id===id&&x.kind===kind),submissions:kind==='grading'&&allowed?assistantSubmissions(s,id):[]};});
  return {active:!!assistantOf(s,actor),grading:per('grading'),content:per('content')};
 },
 'assistant.settings':(s,_a,{actor})=>{
  const user=s.preferences.role==='assistant'?s.users.find(u=>u.id===actor.user_id):null;if(!user)return null;
  const member=assistantOf(s,actor),scope=assistantScope(s,actor);
  return {user:{id:user.id,name:user.name,email:user.email},active:!!member,member:member?{id:member.id,team_role:member.team_role,since:member.created_at,expires_at:member.expires_at}:null,owner:member?s.teachers.find(x=>x.id===member.teacher_id)?.name??null:null,
   courses:[...scope].map(([id,caps])=>({id,title:liveTitle(s,id),capabilities:caps})),prefs:Object.fromEntries(ASSISTANT_PREFS.map(k=>[k,user.notification_prefs?.[k]??true]))};
 },
});
Object.assign(reducers,{
 // Tasks: only the assignee, holding the capability the task kind needs on that course; grading tasks close
 // only after the target submission is graded. Completion notifies the owner once.
 'task.setState':(s,p,{actor,can})=>{
  const task=s.tasks.find(x=>x.id===p.taskId);if(!task)return fail('missing');
  if(!actor.user_id||task.assignee_user_id!==actor.user_id||!can(TASK_CAPABILITY[task.kind],s.courses.find(c=>c.id===task.course_id)))return fail('resourceDenied');
  if(task.state===p.state)return ok({taskId:task.id,state:task.state,existing:true});
  if(!(TASK_NEXT[task.state]??[]).includes(p.state))return fail('p6.invalidTransition');
  if(p.state==='done'&&task.kind==='grading'&&!['graded','released'].includes(s.submissions.find(x=>x.id===task.target_id)?.state))return fail('p7.gradeFirst');
  const before=task.state;Object.assign(task,{state:p.state,updated_at:DEMO_NOW});audit(s,actor,'task.state','task',task.id,before,p.state);
  const owner=ownerOf(s,task.course_id);
  if(p.state==='done'&&owner&&owner.user_id!==actor.user_id)notifyUser(s,owner.user_id,{event:'task-done-'+task.id,type:'task_done',title:{ar:'أُنجزت مهمة مسندة',en:'Assigned task completed'},body:structuredClone(liveTitle(s,task.course_id)),href:`#/teacher/course/${task.course_id}?tab=${task.kind==='grading'?'resources':'lessons'}`,courseId:task.course_id});
  return ok({taskId:task.id,state:task.state,existing:false});
 },
 // Personal preferences only; capabilities and roles are never editable by the assistant.
 'assistant.updateSettings':(s,p,{actor})=>{
  if(s.preferences.role!=='assistant')return fail('resourceDenied');const user=s.users.find(u=>u.id===actor.user_id);if(!user)return fail('missing');
  user.notification_prefs=Object.fromEntries(ASSISTANT_PREFS.map(k=>[k,p.prefs?.[k]===true||p.prefs?.[k]==='on']));user.updated_at=DEMO_NOW;return ok({...user.notification_prefs});
 },
});

// ---- P8a administration (all modules except finance). Each selector and reducer re-derives the staff module
// scope through can(): admin_moderation holds people (never employees), courses and support; super_admin holds
// every module; admin_finance holds none of these. Sensitive reads (student profile, guardian evidence, support
// threads, reported messages) require a typed reason, append an audit event and unlock only for this persona
// session (transient state is cleared on every role switch).
export const ADMIN_MODULES=['people','courses','support','academics','cms','notifications','reports','settings'];
export const STAFF_ROLES=['admin_finance','admin_moderation','super_admin'];
export const INVITE_ROLES=['admin_finance','admin_moderation'];
export const STAFF_EXPIRY_DAYS=['30','90','365'];
export const SENSITIVE_TYPES=Object.freeze({student:['people','students'],guardian_link:['people','guardian_student_links'],ticket:['support','support_tickets'],safety_report:['support','safety_reports'],message:['support','messages']});
const staffCan=(can,module,type)=>can(module+'.manage',type?{module,type}:{module});
const revealed=(s,type,id)=>!!s.transient.sensitive?.[type+':'+id];
const reasonOf=v=>{ const value=text(v,600);return {value,error:!value?'p8.reasonRequired':value.length<5?'p8.reasonShort':null}; };
const roleOfUser=(s,uid)=>s.role_assignments.find(r=>r.user_id===uid&&r.status!=='deactivated')?.role??null;
const gradeOfCourse=(s,c)=>s.grades.find(g=>g.id===s.grade_subjects.find(x=>x.id===c.grade_subject_id)?.grade_id)??null;
const isMessageReport=r=>!!(r.message_id||r.conversation_id);
const RESOURCE_MODULE={teacher_application:'people',guardian_student_link:'people',student:'people',teacher:'people',teacher_invitation:'people',teacher_team_member:'people',user:'people',
 course:'courses',access_grant:'courses',live_session:'courses',submission:'courses',task:'courses',
 support_ticket:'support',safety_report:'support',message:'support',conversation:'support',
 curriculum:'academics',curriculum_version:'academics',track:'academics',grade:'academics',subject:'academics',grade_subject:'academics',academic_year:'academics',semester:'academics',translation:'academics',
 cms_page:'cms',notification_template:'notifications',delivery_attempt:'notifications',role_assignment:'settings',security:'settings',integration:'settings'};
const ACADEMIC_TYPES=['curriculum','curriculum_version','track','grade','subject','grade_subject','academic_year','semester','translation'];
const ENUM_LINK=['requested','pending_verification','verified','rejected','revoked'];
const L2=v=>v&&typeof v==='object'?`${v.ar??''} ${v.en??''}`:String(v??'');
const auditRow=s=>e=>({...e,actor:userName(s,e.actor_user_id)});
const byNewest=(a,b)=>b.created_at.localeCompare(a.created_at)||b.id.localeCompare(a.id);
const auditFor=(s,match)=>s.audit_events.filter(match).sort(byNewest).map(auditRow(s));
function financeSummary(s) {
 const per=s.teachers.map(x=>teacherLedger(s,x.id)),sum=k=>per.reduce((n,l)=>n+l[k],0);
 return {gross:sum('gross'),commission:sum('commission'),payables:sum('pending')+sum('available')+sum('reserved')+sum('in_payout'),paid:sum('paid'),refunds:s.refunds.filter(r=>r.state==='succeeded').reduce((n,r)=>n+r.amount_baisa,0),openRefunds:s.refunds.filter(r=>!['succeeded','rejected','failed'].includes(r.state)).length};
}
function adminCourse(s,c) {
 const card=teacherCourseCard(s,c),revision=c.status==='Published'&&c.pending_revision?.status==='Submitted';
 return {...card,raw_status:c.status,kind:revision?'revision':'new',owner:s.teachers.find(x=>x.id===c.owner_teacher_id)?.name??null,
  submitted_at:revision?c.pending_revision.submitted_at??c.pending_revision.updated_at:s.audit_events.filter(e=>e.resource_type==='course'&&e.resource_id===c.id&&e.action==='course.submit').map(e=>e.created_at).sort().at(-1)??c.updated_at,
  restriction:c.content_restriction??null,enrolled:s.enrollments.filter(e=>e.course_id===c.id).length};
}
const invitationState=x=>x.status==='invited'&&x.expires_at<=DEMO_NOW?'expired':x.status;
const notePerson=(s,uid,{event,type,title,body,href=null,courseId=null})=>notifyUser(s,uid,{event,type,title,body,href,courseId});
const courseName=(s,id)=>{ const c=s.courses.find(x=>x.id===id);return c?editView(c).title:null; };
registerSelectors({
 'admin.form':(s,{name})=>s.transient.adminForms?.[name]??{values:{},fieldErrors:{}},
 'admin.scope':(s,_a,{can})=>Object.fromEntries([...ADMIN_MODULES.map(m=>[m,staffCan(can,m)]),['employees',staffCan(can,'people','employees')],['finance',can('finance.read',{module:'finance'})]]),
 'admin.dashboard':(s,_a,{can,actor})=>{
  if(!staffCan(can,'people')||!staffCan(can,'courses'))return null;
  const queues={applications:s.teacher_applications.filter(a=>['submitted','under_review'].includes(a.state)).length,
   guardianLinks:s.guardian_student_links.filter(l=>['requested','pending_verification'].includes(l.state)||l.scope_request?.state==='pending_verification').length,
   courseReview:s.courses.filter(c=>c.status==='Submitted'||c.pending_revision?.status==='Submitted').length,
   unpublishRequests:s.courses.filter(c=>c.unpublish_request?.state==='requested'&&c.status==='Published').length,
   contentReports:s.safety_reports.filter(r=>!isMessageReport(r)&&r.state!=='resolved').length,
   communications:s.safety_reports.filter(r=>isMessageReport(r)&&r.state!=='resolved').length,
   flagged:s.messages.filter(m=>m.moderation_state==='flagged').length,
   tickets:s.support_tickets.filter(x=>x.state!=='resolved').length,
   liveIssues:s.live_sessions.filter(x=>x.status==='failed').length};
  const academic=staffCan(can,'academics')?{curricula:s.curricula.filter(x=>x.active).length,versions:s.curriculum_versions.filter(x=>x.active).length,subjects:s.subjects.length,mappings:s.grade_subjects.filter(x=>x.active).length,grades:s.grades.length,teachers:s.teachers.filter(x=>x.application_status==='approved'&&x.account_status==='active').length,courses:Object.fromEntries(COURSE_STATES.map(k=>[k,s.courses.filter(c=>c.status===k).length]))}:null;
  const finance=can('finance.read',{module:'finance'})?financeSummary(s):null;
  const mods=new Set(ADMIN_MODULES.filter(m=>staffCan(can,m)));
  const pending=[...s.teacher_applications.filter(a=>['submitted','under_review'].includes(a.state)).map(a=>({kind:'application',id:a.id,title:s.teachers.find(x=>x.id===a.teacher_id).name,state:a.state,domain:'teacher_application',href:'#/admin/people/teachers?tab=applications&record='+a.id})),
   ...s.guardian_student_links.filter(l=>['requested','pending_verification'].includes(l.state)).map(l=>({kind:'guardian',id:l.id,title:s.guardians.find(g=>g.id===l.guardian_id).name,state:l.state,domain:'guardian_link',href:'#/admin/people/guardian-links?record='+l.id})),
   ...s.courses.filter(c=>c.status==='Submitted'||c.pending_revision?.status==='Submitted').map(c=>({kind:'course',id:c.id,title:editView(c).title,state:'Submitted',domain:'course',href:'#/admin/courses/review?record='+c.id}))];
  return {actor,queues,academic,finance,pending,activity:auditFor(s,e=>mods.has(RESOURCE_MODULE[e.resource_type])).slice(0,6)};
 },
 // People
 'admin.students':(s,{q='',grade='',status=''},{can})=>{
  if(!staffCan(can,'people'))return null;const needle=String(q??'').trim().toLowerCase();
  const rows=s.students.map(st=>{const u=s.users.find(x=>x.id===st.user_id);return {id:st.id,user_id:u.id,name:st.name,grade:s.grades.find(g=>g.id===st.current_grade_id)??null,status:u.status,courses:studentCourses(s,st.id).filter(r=>r.access.state==='active').length,links:s.guardian_student_links.filter(l=>l.student_id===st.id&&l.state==='verified').length};});
  return {rows:rows.filter(r=>(!needle||[r.id,r.name.ar,r.name.en].some(x=>x.toLowerCase().includes(needle)))&&(!grade||r.grade?.id===grade)&&(!status||r.status===status)),total:rows.length};
 },
 'admin.student':(s,{id},{can})=>{
  if(!staffCan(can,'people'))return {status:'denied'};const st=s.students.find(x=>x.id===id);if(!st)return {status:'missing'};
  const u=s.users.find(x=>x.id===st.user_id),base={id:st.id,user_id:u.id,name:st.name,grade:s.grades.find(g=>g.id===st.current_grade_id)??null,status:u.status};
  const history=auditFor(s,e=>(e.resource_type==='student'&&e.resource_id===st.id)||e.resource_id===u.id);
  if(!revealed(s,'student',id))return {status:'ok',locked:true,student:base,history};
  return {status:'ok',locked:false,history,student:{...base,email:u.email,locale:u.locale,interests:st.interests.map(x=>s.subjects.find(y=>y.id===x)?.name).filter(Boolean)},
   courses:studentCourses(s,st.id).map(r=>({id:r.course.id,title:r.course.title,status:r.status,access:r.access.state,origin:r.access.grant?.origin??null,percent:r.percent,enrollment:r.enrollment?.status??null})),
   guardians:s.guardian_student_links.filter(l=>l.student_id===st.id).map(l=>({id:l.id,state:l.state,relationship:l.relationship,guardian:s.guardians.find(g=>g.id===l.guardian_id)?.name??null,scopes:[...l.scopes]})),
   tickets:s.support_tickets.filter(x=>x.requester_user_id===u.id).map(x=>({id:x.id,subject:x.subject,state:x.state}))};
 },
 'admin.guardianLinks':(s,{state=''},{can})=>{
  if(!staffCan(can,'people'))return null;
  const rows=s.guardian_student_links.map(l=>({id:l.id,state:l.state,guardian:s.guardians.find(g=>g.id===l.guardian_id)?.name??null,student_id:l.student_id,relationship:l.relationship,requested_at:l.requested_at,verified_at:l.verified_at,scopes:[...l.scopes],scope_request:l.scope_request??null})).sort((a,b)=>b.requested_at.localeCompare(a.requested_at)||a.id.localeCompare(b.id));
  const queue=r=>['requested','pending_verification'].includes(r.state)||r.scope_request?.state==='pending_verification';
  return {rows:!state||state==='queue'?rows.filter(queue):rows.filter(r=>r.state===state),counts:{queue:rows.filter(queue).length,...Object.fromEntries(ENUM_LINK.map(k=>[k,rows.filter(r=>r.state===k).length]))}};
 },
 'admin.guardianLink':(s,{id},{can})=>{
  if(!staffCan(can,'people'))return {status:'denied'};const l=s.guardian_student_links.find(x=>x.id===id);if(!l)return {status:'missing'};
  const guardian=s.guardians.find(g=>g.id===l.guardian_id),st=s.students.find(x=>x.id===l.student_id);
  const link={id:l.id,state:l.state,guardian:guardian?.name??null,relationship:l.relationship,requested_at:l.requested_at,verified_at:l.verified_at,revoked_at:l.revoked_at,verified_by:userName(s,l.verified_by),scopes:[...l.scopes],scope_request:l.scope_request??null,student_id:l.student_id};
  const history=auditFor(s,e=>e.resource_type==='guardian_student_link'&&e.resource_id===l.id);
  if(!revealed(s,'guardian_link',id))return {status:'ok',locked:true,link,history};
  // Synthetic evidence fixture only: invitation token, consent flag, relationship declaration and learner match.
  return {status:'ok',locked:false,link,history,evidence:{ref:l.evidence_ref,token:'OMAN-'+l.student_id.replace('-',''),consent:true,match:!!st,guardian_email:s.users.find(u=>u.id===guardian?.user_id)?.email??'',student:st?{id:st.id,name:st.name,grade:s.grades.find(g=>g.id===st.current_grade_id)?.name??null}:null}};
 },
 'admin.teachers':(s,{q=''},{can})=>{
  if(!staffCan(can,'people'))return null;const needle=String(q??'').trim().toLowerCase();
  const teachers=s.teachers.map(x=>({id:x.id,name:x.name,email:s.users.find(u=>u.id===x.user_id)?.email??'',application_status:x.application_status,account_status:x.account_status,verification_state:x.verification_state,owned:s.courses.filter(c=>c.owner_teacher_id===x.id).length,published:s.courses.filter(c=>c.owner_teacher_id===x.id&&isPublic(s,c)).length,qualifications:qualifiedPairs(s,x.id).size})).filter(r=>!needle||[r.id,r.name.ar,r.name.en,r.email].some(v=>v.toLowerCase().includes(needle)));
  const order=['submitted','under_review','more_info_required','draft_application','approved','rejected'];
  const applications=s.teacher_applications.map(a=>({id:a.id,teacher_id:a.teacher_id,name:s.teachers.find(x=>x.id===a.teacher_id)?.name??null,state:a.state,pairs:a.declared_grade_subject_ids.length,updated_at:a.updated_at,reviewer:userName(s,a.reviewer_id)})).sort((a,b)=>order.indexOf(a.state)-order.indexOf(b.state)||a.id.localeCompare(b.id));
  const invitations=s.teacher_invitations.map(x=>({...x,state:invitationState(x),inviter:userName(s,x.invited_by),teacher:x.teacher_id?s.teachers.find(t=>t.id===x.teacher_id)?.name??null:null})).sort(byNewest);
  return {teachers,applications,invitations};
 },
 'admin.application':(s,{id},{can})=>{
  if(!staffCan(can,'people'))return {status:'denied'};const a=s.teacher_applications.find(x=>x.id===id);if(!a)return {status:'missing'};
  const x=s.teachers.find(t=>t.id===a.teacher_id);
  const pairs=a.declared_grade_subject_ids.map(gid=>{const gs=s.grade_subjects.find(g=>g.id===gid);return gs?{id:gid,grade:s.grades.find(g=>g.id===gs.grade_id),display_name:gs.display_name,active:gs.active,verified:s.teacher_grade_subjects.some(q=>q.teacher_id===x.id&&q.grade_subject_id===gid&&q.verification_state==='verified')}:null;}).filter(Boolean);
  return {status:'ok',application:{...a,history:a.history.map(h=>({...h,actor:userName(s,h.actor_id)}))},teacher:{id:x.id,name:x.name,bio:x.bio,credentials:x.credentials,verification_state:x.verification_state,account_status:x.account_status,application_status:x.application_status},
   files:a.credential_files??[],pairs,decidable:['submitted','under_review'].includes(a.state),history:auditFor(s,e=>e.resource_type==='teacher_application'&&e.resource_id===a.id)};
 },
 'admin.teacher':(s,{id},{can})=>{
  if(!staffCan(can,'people'))return {status:'denied'};const x=s.teachers.find(t=>t.id===id);if(!x)return {status:'missing'};
  return {status:'ok',teacher:{...x,email:s.users.find(u=>u.id===x.user_id)?.email??''},qualifications:qualificationLabels(x.id),courses:s.courses.filter(c=>c.owner_teacher_id===x.id).map(c=>({id:c.id,title:editView(c).title,status:c.status})),
   history:auditFor(s,e=>(e.resource_type==='teacher'&&e.resource_id===x.id)||(e.resource_type==='teacher_application'&&s.teacher_applications.some(a=>a.id===e.resource_id&&a.teacher_id===x.id)))};
 },
 'admin.employees':(s,_a,{can,actor})=>{
  if(!staffCan(can,'people','employees'))return null;
  return {rows:s.role_assignments.filter(r=>STAFF_ROLES.includes(r.role)).map(r=>{const u=s.users.find(x=>x.id===r.user_id);return {id:r.id,user_id:r.user_id,name:u?.name??null,email:u?.email??'',role:r.role,status:r.status,effective_at:r.effective_at,expires_at:r.expires_at,permissions:r.permissions.length,own:r.user_id===actor.user_id,mfa:u?.mfa_state??'enrolled'};}),
   history:auditFor(s,e=>e.resource_type==='role_assignment')};
 },
 'admin.teams':(s,{q=''},{can})=>{
  if(!staffCan(can,'people'))return null;const needle=String(q??'').trim().toLowerCase();
  return {rows:s.teacher_team_members.map(m=>({id:m.id,teacher_id:m.teacher_id,teacher:s.teachers.find(x=>x.id===m.teacher_id)?.name??null,member:userName(s,m.user_id),email:s.users.find(u=>u.id===m.user_id)?.email??'',status:m.status,team_role:m.team_role,invited_at:m.invited_at,expires_at:m.expires_at,
   assignments:s.course_team_assignments.filter(a=>a.team_member_id===m.id).map(a=>({id:a.id,course_id:a.course_id,title:courseName(s,a.course_id),capabilities:[...a.capabilities],status:a.status})),
   conversations:s.conversation_assignments.filter(a=>a.assignee_user_id===m.user_id&&a.status==='active').length,
   history:auditFor(s,e=>e.resource_type==='teacher_team_member'&&e.resource_id===m.id)})).filter(r=>!needle||[r.id,L2(r.teacher),L2(r.member),r.email].some(v=>v.toLowerCase().includes(needle)))};
 },
 // Academics (super_admin only)
 'admin.academics':(s,_a,{can})=>{
  if(!staffCan(can,'academics'))return null;
  return {curricula:s.curricula.map(c=>({...c,versions:s.curriculum_versions.filter(v=>v.curriculum_id===c.id).length})),
   versions:s.curriculum_versions.map(v=>({...v,curriculum:s.curricula.find(c=>c.id===v.curriculum_id)?.name??null,mappings:s.grade_subjects.filter(g=>g.curriculum_version_id===v.id).length,tracks:s.tracks.filter(t=>t.curriculum_version_id===v.id).length})).sort((a,b)=>b.effective_year-a.effective_year||a.id.localeCompare(b.id)),
   tracks:s.tracks.map(t=>({...t,version:s.curriculum_versions.find(v=>v.id===t.curriculum_version_id)?.name??null,courses:s.courses.filter(c=>c.track_id===t.id).length})),
   grades:s.grades.map(g=>({...g,mappings:s.grade_subjects.filter(x=>x.grade_id===g.id).length,students:s.students.filter(x=>x.current_grade_id===g.id).length,courses:s.courses.filter(c=>gradeOfCourse(s,c)?.id===g.id).length})),
   subjects:s.subjects.map(x=>({...x,mappings:s.grade_subjects.filter(g=>g.subject_id===x.id&&g.active).length,courses:s.courses.filter(c=>s.grade_subjects.find(g=>g.id===c.grade_subject_id)?.subject_id===x.id).length})),
   mappings:s.grade_subjects.map(g=>({...g,courses:s.courses.filter(c=>c.grade_subject_id===g.id).length})),
   years:s.academic_years.map(y=>({...y,semesters:s.semesters.filter(x=>x.academic_year_id===y.id).length,courses:s.courses.filter(c=>c.academic_year_id===y.id).length})),
   semesters:s.semesters.map(x=>({...x,year:s.academic_years.find(y=>y.id===x.academic_year_id)?.name??null,courses:s.courses.filter(c=>c.semester_id===x.id).length})).sort((a,b)=>a.starts_at.localeCompare(b.starts_at)),
   history:auditFor(s,e=>ACADEMIC_TYPES.includes(e.resource_type))};
 },
 // Course operations
 'admin.reviewQueue':(s,_a,{can})=>staffCan(can,'courses')?s.courses.filter(c=>c.status==='Submitted'||c.pending_revision?.status==='Submitted').map(c=>adminCourse(s,c)).sort((a,b)=>a.submitted_at.localeCompare(b.submitted_at)):null,
 'admin.course':(s,{id},{can})=>{
  if(!staffCan(can,'courses'))return {status:'denied'};const c=s.courses.find(x=>x.id===id);if(!c)return {status:'missing'};
  return {status:'ok',course:adminCourse(s,c),checklist:courseChecklist(s,c),qualified:qualifiedPairs(s,c.owner_teacher_id).has(editView(c).grade_subject_id),
   revision:c.pending_revision?Object.entries(c.pending_revision.fields).map(([field,after])=>({field,before:c[field],after})):[],pending:c.pending_revision?{status:c.pending_revision.status,feedback:c.pending_revision.feedback}:null,
   published:c.published_snapshot?{title:c.published_snapshot.title,summary:c.published_snapshot.summary}:null,unpublish_request:c.unpublish_request??null,
   lessons:lessonsIn(s,c.id).length,modules:s.modules.filter(m=>m.course_id===c.id).length,previews:lessonsIn(s,c.id).filter(l=>l.preview).length,
   reports:s.safety_reports.filter(r=>r.course_id===c.id&&!isMessageReport(r)).map(r=>({id:r.id,state:r.state,reason:r.reason})),
   history:auditFor(s,e=>e.resource_type==='course'&&e.resource_id===c.id)};
 },
 'admin.catalog':(s,{tab='published',q=''},{can})=>{
  if(!staffCan(can,'courses'))return null;const needle=String(q??'').trim().toLowerCase();
  const TAB={published:['Published'],draft:['Draft','Submitted','ChangesRequested'],archived:['Archived'],unpublished:['Unpublished']};
  const all=s.courses.map(c=>adminCourse(s,c));
  return {rows:all.filter(c=>(TAB[tab]??TAB.published).includes(c.raw_status)&&(!needle||[c.id,c.title.ar,c.title.en,L2(c.owner)].some(v=>v.toLowerCase().includes(needle)))),counts:Object.fromEntries(Object.entries(TAB).map(([k,v])=>[k,all.filter(c=>v.includes(c.raw_status)).length]))};
 },
 'admin.contentReports':(s,{state=''},{can})=>{
  if(!staffCan(can,'courses'))return null;
  return {rows:s.safety_reports.filter(r=>!isMessageReport(r)&&(!state||r.state===state)).map(r=>{const c=s.courses.find(x=>x.id===r.course_id);return {id:r.id,state:r.state,reason:r.reason,course_id:r.course_id,course_title:c?editView(c).title:null,course_status:c?.status??null,restriction:c?.content_restriction?.report_id===r.id?c.content_restriction:null,reporter_role:roleOfUser(s,r.reporter_user_id),created_at:r.created_at,resolution:r.resolution??'',
   history:auditFor(s,e=>(e.resource_type==='safety_report'&&e.resource_id===r.id)||(e.resource_type==='course'&&e.resource_id===r.course_id&&['course.unpublish','course.archive','course.republish','course.restrict'].includes(e.action)))};}).sort((a,b)=>(a.state==='resolved')-(b.state==='resolved')||b.created_at.localeCompare(a.created_at))};
 },
 'admin.access':(s,{q='',origin='',status=''},{can})=>{
  if(!staffCan(can,'courses'))return null;const needle=String(q??'').trim().toLowerCase();
  const name=id=>s.students.find(x=>x.id===id)?.name;
  const match=r=>!needle||[r.id,r.student_id,r.course_id,L2(name(r.student_id)),L2(courseName(s,r.course_id))].some(v=>v.toLowerCase().includes(needle));
  const effective=g=>g.status==='active'&&g.ends_at<=DEMO_NOW?'expired':g.status;
  return {enrollments:s.enrollments.filter(match).filter(e=>!status||e.status===status).map(e=>({...e,student:name(e.student_id),course_title:courseName(s,e.course_id),access:accessOf(s,e.student_id,e.course_id).state,grants:s.access_grants.filter(g=>g.enrollment_id===e.id).length})),
   grants:s.access_grants.filter(match).filter(g=>(!origin||g.origin===origin)&&(!status||effective(g)===status)).map(g=>({...g,student:name(g.student_id),course_title:courseName(s,g.course_id),effective:effective(g),granted_by_name:userName(s,g.granted_by),revoked_by_name:userName(s,g.revoked_by)})),
   students:s.students.map(x=>({id:x.id,name:x.name})),courses:s.courses.filter(c=>['Published','Unpublished','Archived'].includes(c.status)).map(c=>({id:c.id,title:editView(c).title,status:c.status}))};
 },
 'admin.live':(s,{status=''},{can})=>{
  if(!staffCan(can,'courses'))return null;
  const GROUP={upcoming:['draft','scheduled','rescheduled'],live:['live'],ended:['ended','recording_processing','recording_ready','recording_published'],cancelled:['cancelled'],failed:['failed']};
  const all=s.live_sessions.map(x=>({...x,course_title:courseName(s,x.course_id),host:s.teachers.find(t=>t.id===x.host_teacher_id)?.name??null,present:s.attendance.filter(a=>a.live_session_id===x.id&&a.status==='present').length,recording:s.recordings.find(r=>r.live_session_id===x.id)??null,incidents:(x.incident_notes??[]).map(n=>({...n,author:userName(s,n.author_user_id)}))})).sort((a,b)=>a.starts_at.localeCompare(b.starts_at));
  return {rows:Object.hasOwn(GROUP,status)?all.filter(x=>GROUP[status].includes(x.status)):all,counts:Object.fromEntries(Object.entries(GROUP).map(([k,v])=>[k,all.filter(x=>v.includes(x.status)).length])),total:all.length};
 },
 // Support and safety
 'admin.tickets':(s,{state=''},{can})=>{
  if(!staffCan(can,'support'))return null;
  return {rows:s.support_tickets.filter(x=>!state||x.state===state).map(x=>({id:x.id,subject:x.subject,state:x.state,requester:userName(s,x.requester_user_id),requester_role:roleOfUser(s,x.requester_user_id),course_title:x.course_id?courseName(s,x.course_id):null,assignee:userName(s,x.assigned_staff_id),updated_at:x.updated_at,replies:(x.replies??[]).length})).sort((a,b)=>(a.state==='resolved')-(b.state==='resolved')||b.updated_at.localeCompare(a.updated_at))};
 },
 'admin.ticket':(s,{id},{can})=>{
  if(!staffCan(can,'support'))return {status:'denied'};const x=s.support_tickets.find(v=>v.id===id);if(!x)return {status:'missing'};
  const ticket={id:x.id,subject:x.subject,state:x.state,requester:userName(s,x.requester_user_id),requester_role:roleOfUser(s,x.requester_user_id),assignee:userName(s,x.assigned_staff_id),created_at:x.created_at,updated_at:x.updated_at,resolution:x.resolution};
  const history=auditFor(s,e=>e.resource_type==='support_ticket'&&e.resource_id===x.id);
  if(!revealed(s,'ticket',id))return {status:'ok',locked:true,ticket,history};
  return {status:'ok',locked:false,ticket:{...ticket,body:x.body,course_title:x.course_id?courseName(s,x.course_id):null},replies:(x.replies??[]).map(r=>({...r,author:userName(s,r.author_user_id),staff:STAFF_ROLES.includes(roleOfUser(s,r.author_user_id))})),history};
 },
 'admin.flags':(s,_a,{can})=>{
  if(!staffCan(can,'support'))return null;
  const row=m=>{const q=s.conversations.find(x=>x.id===m.conversation_id),open=revealed(s,'message',m.id);return {id:m.id,state:m.moderation_state,conversation_id:m.conversation_id,course_title:q?courseName(s,q.course_id):null,author_role:roleOfUser(s,m.author_user_id),created_at:m.created_at,reports:s.safety_reports.filter(r=>r.message_id===m.id).length,open,text:open?m.text:null};};
  return {flagged:s.messages.filter(m=>m.moderation_state==='flagged').map(row),removed:s.messages.filter(m=>m.moderation_state==='removed').map(row),log:auditFor(s,e=>['message','safety_report'].includes(e.resource_type))};
 },
 'admin.communications':(s,{state=''},{can})=>{
  if(!staffCan(can,'support'))return null;
  return {rows:s.safety_reports.filter(r=>isMessageReport(r)&&(!state||r.state===state)).map(r=>({id:r.id,state:r.state,reason:r.reason,course_title:courseName(s,r.course_id),kind:r.message_id?'message':'conversation',reporter_role:roleOfUser(s,r.reporter_user_id),assignee:userName(s,r.assigned_staff_id),created_at:r.created_at})).sort((a,b)=>(a.state==='resolved')-(b.state==='resolved')||b.created_at.localeCompare(a.created_at))};
 },
 // Reported thread context only: the reported message and its immediate neighbours (or the latest messages of a
 // reported thread), never internal notes and never another conversation.
 'admin.communication':(s,{id},{can})=>{
  if(!staffCan(can,'support'))return {status:'denied'};const r=s.safety_reports.find(x=>x.id===id&&isMessageReport(x));if(!r)return {status:'missing'};
  const m=s.messages.find(x=>x.id===r.message_id),q=s.conversations.find(x=>x.id===(r.conversation_id??m?.conversation_id));
  const report={id:r.id,state:r.state,reason:r.reason,course_title:courseName(s,r.course_id),reporter_role:roleOfUser(s,r.reporter_user_id),created_at:r.created_at,kind:r.message_id?'message':'conversation',notes:(r.review_notes??[]).map(n=>({...n,author:userName(s,n.author_user_id)})),next:SAFETY_NEXT[r.state]??[]};
  const history=auditFor(s,e=>e.resource_type==='safety_report'&&e.resource_id===r.id);
  if(!revealed(s,'safety_report',id))return {status:'ok',locked:true,report,history};
  const thread=q?s.messages.filter(x=>x.conversation_id===q.id&&!x.internal).sort((a,b)=>a.created_at.localeCompare(b.created_at)):[];
  const at=m?thread.findIndex(x=>x.id===m.id):-1,window=at>=0?thread.slice(Math.max(0,at-2),at+3):thread.slice(-5);
  return {status:'ok',locked:false,report:{...report,restricted_note:r.restricted_note},history,subject:q?.subject??null,messages:window.map(x=>({id:x.id,text:x.text,lang:x.lang,state:x.moderation_state,reported:x.id===r.message_id,author_role:roleOfUser(s,x.author_user_id),created_at:x.created_at}))};
 },
 // CMS, notifications, reports and settings (super_admin only)
 'admin.cms':(s,_a,{can})=>{
  if(!staffCan(can,'cms'))return null;const home=s.cms_pages.find(p=>p.slug==='home');
  return {pages:s.cms_pages.map(p=>({...p,policy:['privacy','terms','refunds'].includes(p.slug)})),banner:home?.sections.find(x=>x.kind==='banner')??null,featured:home?.sections.find(x=>x.kind==='featured')?.course_ids??[],
   faqs:(s.cms_pages.find(p=>p.slug==='help')?.sections??[]).filter(x=>x.kind==='faq'),courses:s.courses.filter(c=>isPublic(s,c)).map(c=>publicView(c)),promotions:s.promotions,settings:s.platform_settings[0],
   history:auditFor(s,e=>e.resource_type==='cms_page')};
 },
 'admin.notifications':(s,{state='',channel=''},{can})=>{
  if(!staffCan(can,'notifications'))return null;
  const attempts=s.delivery_attempts.map(a=>{const n=s.notifications.find(x=>x.id===a.notification_id);return {...a,event_id:n?.event_id??'',type:n?.type??'',title:n?.title??null,recipient:userName(s,n?.recipient_user_id),recipient_role:roleOfUser(s,n?.recipient_user_id)};}).sort(byNewest);
  return {templates:s.notification_templates,attempts:attempts.filter(a=>(!state||a.state===state)&&(!channel||a.channel===channel)),counts:Object.fromEntries(['queued','sent','failed','read'].map(k=>[k,attempts.filter(a=>a.state===k).length])),total:attempts.length};
 },
 'admin.reports':(s,a,{can})=>{
  if(!staffCan(can,'reports'))return null;
  let from=datePart(a.from)??'2026-08-01',to=datePart(a.to)??DEMO_NOW.slice(0,10);if(from>to)[from,to]=[to,from];
  const start=from+'T00:00:00Z',end=to+'T23:59:59Z',inRange=iso=>!!iso&&iso>=start&&iso<=end;
  const grade=s.grades.some(g=>g.id===a.grade)?a.grade:'',courseId=s.courses.some(c=>c.id===a.course)?a.course:'';
  const scoped=s.courses.filter(c=>(!grade||gradeOfCourse(s,c)?.id===grade)&&(!courseId||c.id===courseId)),ids=new Set(scoped.map(c=>c.id));
  const enrollments=s.enrollments.filter(e=>ids.has(e.course_id)&&inRange(e.started_at));
  const weeks=[];for(let t=Date.parse(start);t<=Date.parse(end);t+=7*DAY)weeks.push(new Date(t).toISOString().slice(0,10));
  const weekly=weeks.slice(-12).map((w,i,list)=>{const s0=w+'T00:00:00Z',s1=list[i+1]?list[i+1]+'T00:00:00Z':end;return {week:w,enrollments:enrollments.filter(e=>e.started_at>=s0&&e.started_at<s1).length,completions:s.lesson_progress.filter(p=>p.status==='done'&&p.completed_at&&p.completed_at>=s0&&p.completed_at<s1&&ids.has(lessonCourse(s,s.lessons.find(l=>l.id===p.lesson_id)))).length};});
  const learning=scoped.filter(c=>s.enrollments.some(e=>e.course_id===c.id)).map(c=>{const rows=learnerRows(s,new Set([c.id]));return {id:c.id,title:editView(c).title,learners:rows.length,active:rows.filter(r=>r.access==='active').length,average:rows.length?Math.round(rows.reduce((n,r)=>n+r.percent,0)/rows.length):0};});
  const orders=s.orders.filter(o=>inRange(o.created_at)&&s.order_items.some(i=>i.order_id===o.id&&ids.has(i.course_id)));
  const settled=orders.filter(o=>['paid','partially_refunded','refunded'].includes(o.state)).length,STATES=['open','assigned','waiting','resolved','escalated'];
  return {filters:{from,to,grade,course:courseId},weekly,learning,catalog:Object.fromEntries(COURSE_STATES.map(k=>[k,scoped.filter(c=>c.status===k).length])),
   conversion:{...Object.fromEntries(['draft','pending','paid','failed','cancelled','partially_refunded','refunded'].map(k=>[k,orders.filter(o=>o.state===k).length])),started:orders.length,settled,rate:orders.length?Math.round(settled*100/orders.length):0},
   support:{tickets:Object.fromEntries(STATES.map(k=>[k,s.support_tickets.filter(x=>x.state===k&&inRange(x.created_at)).length])),reports:Object.fromEntries(STATES.map(k=>[k,s.safety_reports.filter(x=>x.state===k&&inRange(x.created_at)).length]))},
   totals:{enrollments:enrollments.length,courses:scoped.length,published:scoped.filter(c=>c.status==='Published').length,completions:weekly.reduce((n,w)=>n+w.completions,0)},grades:s.grades,courses:s.courses.map(c=>({id:c.id,title:editView(c).title}))};
 },
 'admin.roles':(s,_a,{can,actor})=>{
  if(!staffCan(can,'settings'))return null;
  const rows=s.role_assignments.map(r=>({...r,name:userName(s,r.user_id),own:r.user_id===actor.user_id,staff:STAFF_ROLES.includes(r.role)}));
  return {rows,permissions:s.permissions,matrix:[...new Set(rows.map(r=>r.role))].map(role=>({role,permissions:[...new Set(rows.filter(r=>r.role===role&&r.status==='active').flatMap(r=>r.permissions))]})),history:auditFor(s,e=>e.resource_type==='role_assignment')};
 },
 'admin.security':(s,{actor:who='',action='',type='',q=''},{can,actor})=>{
  if(!staffCan(can,'settings'))return null;const needle=String(q??'').trim().toLowerCase();
  const events=auditFor(s,()=>true);
  return {staff:s.role_assignments.filter(r=>STAFF_ROLES.includes(r.role)).map(r=>{const u=s.users.find(x=>x.id===r.user_id);return {id:u.id,assignment_id:r.id,name:u.name,role:r.role,status:r.status,mfa:u.mfa_state??'enrolled',sessions_revoked_at:u.sessions_revoked_at??null,own:u.id===actor.user_id};}),
   events:events.filter(e=>(!who||e.actor_user_id===who)&&(!action||e.action===action)&&(!type||e.resource_type===type)&&(!needle||[e.id,e.resource_id,e.reason,e.action].some(v=>String(v??'').toLowerCase().includes(needle)))),
   facets:{actors:[...new Set(events.map(e=>e.actor_user_id))].map(id=>({id,name:userName(s,id)})),actions:[...new Set(events.map(e=>e.action))].sort(),types:[...new Set(events.map(e=>e.resource_type))].sort()},total:events.length};
 },
 'admin.integrations':(s,_a,{can})=>{
  if(!staffCan(can,'settings'))return null;const set=s.platform_settings[0];
  return {rows:Object.entries(set.integration_statuses).map(([key,status])=>({key,status,last:set.integration_tests?.[key]??null})),history:auditFor(s,e=>e.resource_type==='integration')};
 },
 'admin.policies':(s,_a,{can})=>staffCan(can,'settings')?{settings:s.platform_settings[0]}:null,
});
const APPLICATION_DECISIONS={approve:'approved',requestInfo:'more_info_required',reject:'rejected',startReview:'under_review'};
const APPLICATION_AUDIT={approve:'approve',requestInfo:'request_info',reject:'reject',startReview:'start_review'};
const COURSE_MODERATION={unpublish:{from:['Published'],to:'Unpublished'},archive:{from:['Published','Draft'],to:'Archived'},republish:{from:['Unpublished'],to:'Published'}};
const SAFETY_NEXT={open:['assigned','escalated','resolved'],assigned:['waiting','escalated','resolved'],waiting:['assigned','resolved'],escalated:['assigned','resolved']};
const datePart=v=>{ const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v??''));if(!m)return null;const d=new Date(Date.UTC(+m[1],+m[2]-1,+m[3]));return d.getUTCDate()===+m[3]&&d.getUTCMonth()===+m[2]-1?m[0]:null; };
const bilingual=(p,key,min,max)=>{ const r=pairText({ar:p[key+'_ar'],en:p[key+'_en']},min,max);return {value:r.value,errors:{[key+'_ar']:r.errors.ar,[key+'_en']:r.errors.en}}; };
const placeholders=v=>[...new Set([...String(v).matchAll(/\{(\w+)\}/g)].map(m=>m[1]))].sort().join();
const later=days=>new Date(Date.parse(DEMO_NOW)+days*DAY).toISOString().replace('.000Z','Z');
function publishedDependants(s,kind,id) {
 return s.courses.filter(c=>c.status==='Published').some(c=>{const gs=s.grade_subjects.find(g=>g.id===c.grade_subject_id),v=s.curriculum_versions.find(x=>x.id===gs?.curriculum_version_id);return kind==='curriculum'?v?.curriculum_id===id:kind==='version'?gs?.curriculum_version_id===id:c.track_id===id||gs?.track_id===id;});
}
// Shared create/update for academic records: edits keep the record (and every reference to it) and audit a
// before/after summary (the history tab); creation appends a new record.
function saveRecord(s,actor,{collection,prefix,type,id,values,summary,extra={}}) {
 const existing=id?s[collection].find(x=>x.id===id):null;if(id&&!existing)return fail('missing');
 if(existing){const before=summary(existing);Object.assign(existing,values,{updated_at:DEMO_NOW});audit(s,actor,type+'.update',type,existing.id,before,summary(existing));return ok({id:existing.id,created:false});}
 const row={id:nextId(s[collection],prefix),...extra,...values,created_at:DEMO_NOW,updated_at:DEMO_NOW};s[collection].push(row);audit(s,actor,type+'.create',type,row.id,'',summary(row));return ok({id:row.id,created:true});
}
Object.assign(reducers,{
 'admin.saveForm':(s,p,{can})=>{
  if(!ADMIN_MODULES.some(m=>staffCan(can,m))||typeof p.name!=='string'||!/^[\w:-]{1,60}$/.test(p.name))return fail('invalidAction');
  const values=Object.fromEntries(Object.entries(p.values??{}).filter(([k,v])=>/^\w{1,40}$/.test(k)&&typeof v==='string').map(([k,v])=>[k,v.slice(0,4000)]));
  const fieldErrors=Object.fromEntries(Object.entries(p.fieldErrors??{}).filter(([k,v])=>/^\w{1,40}$/.test(k)&&typeof v==='string'&&/^(?:error|p5|p6|p8)\.\w+$/.test(v)));
  (s.transient.adminForms??={})[p.name]={values,fieldErrors};return ok(null);
 },
 'admin.clearForm':(s,p)=>{ if(s.transient.adminForms&&typeof p.name==='string')delete s.transient.adminForms[p.name];return ok(null); },
 'admin.sensitiveRead':(s,p,{actor,can})=>{
  const spec=Object.hasOwn(SENSITIVE_TYPES,p.type)?SENSITIVE_TYPES[p.type]:null;if(!spec)return fail('invalidAction');
  if(!staffCan(can,spec[0]))return fail('resourceDenied');
  const record=s[spec[1]].find(x=>x.id===p.id);if(!record)return fail('missing');
  const r=reasonOf(p.reason);if(r.error)return failFields({reason:r.error});
  if(revealed(s,p.type,p.id))return ok({type:p.type,id:record.id,existing:true});
  (s.transient.sensitive??={})[p.type+':'+p.id]=true;
  audit(s,actor,'support.sensitive_read',{ticket:'support_ticket',guardian_link:'guardian_student_link'}[p.type]??p.type,record.id,'','viewed',r.value);
  return ok({type:p.type,id:record.id,existing:false});
 },
 'people.setAccountStatus':(s,p,{actor,can})=>{
  if(!staffCan(can,'people'))return fail('resourceDenied');
  if(!['active','suspended'].includes(p.status))return fail('invalidAction');
  const target=p.kind==='teacher'?s.teachers.find(v=>v.id===p.id):p.kind==='student'?s.students.find(v=>v.id===p.id):undefined;
  if(target===undefined)return fail('invalidAction');if(!target)return fail('missing');
  const r=reasonOf(p.reason);if(r.error)return failFields({reason:r.error});
  // Account status is independent of the teacher application state.
  const record=p.kind==='teacher'?target:s.users.find(v=>v.id===target.user_id),key=p.kind==='teacher'?'account_status':'status';
  if(record[key]===p.status)return ok({id:target.id,existing:true});
  const before=record[key];Object.assign(record,{[key]:p.status,updated_at:DEMO_NOW});audit(s,actor,p.kind+'.account_status',p.kind,target.id,before,p.status,r.value);return ok({id:target.id,status:p.status});
 },
 // Staff decisions on guardian links. Verification reuses guardianLink.verify; a reason is always required here.
 'guardianLink.decide':(s,p,ctx)=>{
  const {actor,can}=ctx;if(!staffCan(can,'people'))return fail('resourceDenied');
  const link=s.guardian_student_links.find(l=>l.id===p.linkId);if(!link)return fail('missing');
  const r=reasonOf(p.reason);if(r.error)return failFields({reason:r.error});
  const guardian=s.guardians.find(g=>g.id===link.guardian_id),note=(event,title)=>notePerson(s,guardian?.user_id,{event,type:'guardian_link',title,body:{ar:'راجع حالة الربط في صفحة أبنائي.',en:'Review the link status on My children.'},href:'#/guardian/children'});
  if(p.decision==='verify')return reducers['guardianLink.verify'](s,{linkId:link.id,reason:r.value},ctx);
  if(p.decision==='reject') {
   if(!['requested','pending_verification'].includes(link.state))return fail('p5.invalidTransition');
   const before=link.state;Object.assign(link,{state:'rejected',updated_at:DEMO_NOW});linkAudit(s,actor,link,'guardian_link.reject',before,'rejected',r.value);
   note('guardian-link-rejected-'+link.id,{ar:'لم يُقبل طلب ربط الطالب',en:'Learner link request not approved'});return ok({linkId:link.id,state:'rejected'});
  }
  if(p.decision==='revoke') {
   if(link.state!=='verified')return fail('p5.invalidTransition');
   Object.assign(link,{state:'revoked',revoked_at:DEMO_NOW,scope_request:null,updated_at:DEMO_NOW});linkAudit(s,actor,link,'guardian_link.revoke','verified','revoked',r.value);
   note('guardian-link-revoked-'+link.id,{ar:'أُلغي ربط طالب',en:'A learner link was revoked'});return ok({linkId:link.id,state:'revoked'});
  }
  if(p.decision==='approveScope'||p.decision==='rejectScope') {
   if(link.state!=='verified'||link.scope_request?.state!=='pending_verification')return fail('p8.noScopeRequest');
   const before=link.scopes.join(','),requested=link.scope_request.scopes;
   if(p.decision==='approveScope')link.scopes=LINK_SCOPES.filter(k=>requested.includes(k));
   Object.assign(link,{scope_request:null,updated_at:DEMO_NOW});
   linkAudit(s,actor,link,p.decision==='approveScope'?'guardian_link.scope_approve':'guardian_link.scope_reject',before,link.scopes.join(','),r.value);
   note(`guardian-scope-${p.decision}-${link.id}-${s.audit_events.length}`,p.decision==='approveScope'?{ar:'اعتُمد تعديل صلاحيات الربط',en:'Link permission change approved'}:{ar:'لم يُعتمد تعديل صلاحيات الربط',en:'Link permission change declined'});
   return ok({linkId:link.id,scopes:[...link.scopes]});
  }
  return fail('invalidAction');
 },
 // Reviewer transitions (SPEC §3.1): submitted → under_review → approved/rejected/more_info_required. A decision on a
 // submitted application records the implicit under_review step. Approval verifies the declared qualifications and
 // credentials only — it never creates courses; account status stays a separate control.
 'application.review':(s,p,{actor,can})=>{
  if(!staffCan(can,'people'))return fail('resourceDenied');
  const a=s.teacher_applications.find(x=>x.id===p.applicationId);if(!a)return fail('missing');
  const to=Object.hasOwn(APPLICATION_DECISIONS,p.decision)?APPLICATION_DECISIONS[p.decision]:null;if(!to)return fail('invalidAction');
  if(!['submitted','under_review'].includes(a.state)||(p.decision==='startReview'&&a.state!=='submitted'))return fail('p8.applicationNotPending');
  const feedback=text(p.feedback,1000);
  if(['requestInfo','reject'].includes(p.decision)){const error=feedback&&feedback.length<10?'error.messageShort':lengthError(feedback,10);if(error)return failFields({feedback:error});}
  if(p.decision==='approve'&&a.declared_grade_subject_ids.some(id=>!s.grade_subjects.some(g=>g.id===id&&g.active)))return fail('p8.pairsInactive');
  const teacher=s.teachers.find(x=>x.id===a.teacher_id),before=a.state;
  if(a.state==='submitted'&&p.decision!=='startReview')a.history.push({state:'under_review',actor_id:actor.user_id,at:DEMO_NOW});
  a.history.push({state:to,actor_id:actor.user_id,at:DEMO_NOW});
  Object.assign(a,{state:to,reviewer_id:actor.user_id,updated_at:DEMO_NOW});
  if(p.decision!=='startReview')a.feedback=feedback?typed(feedback):p.decision==='approve'?{ar:'تم التحقق من المؤهلات التجريبية.',en:'Synthetic credentials verified.'}:a.feedback;
  Object.assign(teacher,{application_status:to,updated_at:DEMO_NOW});
  if(p.decision==='approve') {
   Object.assign(teacher,{verification_state:'verified',credentials:teacher.credentials.map(c=>({...c,verified:true}))});
   for(const gid of a.declared_grade_subject_ids){const held=s.teacher_grade_subjects.find(q=>q.teacher_id===teacher.id&&q.grade_subject_id===gid);if(held)Object.assign(held,{verification_state:'verified',updated_at:DEMO_NOW});else s.teacher_grade_subjects.push({id:nextId(s.teacher_grade_subjects,'TGS'),teacher_id:teacher.id,grade_subject_id:gid,verification_state:'verified',created_at:DEMO_NOW,updated_at:DEMO_NOW});}
  }
  if(p.decision==='reject')teacher.verification_state='rejected';
  audit(s,actor,'teacher_application.'+APPLICATION_AUDIT[p.decision],'teacher_application',a.id,before,to,feedback);
  if(p.decision!=='startReview')notePerson(s,teacher.user_id,{event:`application-${a.id}-${a.history.length}`,type:'application',title:{approve:{ar:'تم اعتماد طلب التدريس',en:'Teaching application approved'},requestInfo:{ar:'مطلوب معلومات إضافية لطلبك',en:'More information needed for your application'},reject:{ar:'لم يُقبل طلب التدريس',en:'Teaching application not approved'}}[p.decision],body:structuredClone(a.feedback),href:'#/auth/teacher-application?step=review'});
  return ok({id:a.id,state:to});
 },
 'people.inviteTeacher':(s,p,{actor,can})=>{
  if(!staffCan(can,'people'))return fail('resourceDenied');
  const email=text(p.email,120).toLowerCase(),days=INVITE_DAYS.includes(String(p.days))?Number(p.days):null;
  const errors=pick({email:!email?'error.required':!EMAIL.test(email)?'error.email':!email.endsWith('@example.test')?'p6.syntheticEmail':s.teacher_invitations.some(x=>x.email===email&&invitationState(x)==='invited')?'p8.inviteExists':s.teachers.some(x=>s.users.find(u=>u.id===x.user_id)?.email===email)?'p8.alreadyTeacher':null,days:days?null:'error.required'});
  if(Object.keys(errors).length)return failFields(errors);
  const x={id:nextId(s.teacher_invitations,'TI'),email,teacher_id:null,invited_by:actor.user_id,status:'invited',expires_at:later(days),created_at:DEMO_NOW,updated_at:DEMO_NOW};
  s.teacher_invitations.push(x);audit(s,actor,'teacher_invitation.create','teacher_invitation',x.id,'','invited',email);return ok({invitationId:x.id});
 },
 'people.revokeInvite':(s,p,{actor,can})=>{
  if(!staffCan(can,'people'))return fail('resourceDenied');
  const x=s.teacher_invitations.find(v=>v.id===p.invitationId);if(!x)return fail('missing');
  if(invitationState(x)!=='invited')return fail('p8.inviteNotOpen');
  const r=reasonOf(p.reason);if(r.error)return failFields({reason:r.error});
  Object.assign(x,{status:'revoked',updated_at:DEMO_NOW});audit(s,actor,'teacher_invitation.revoke','teacher_invitation',x.id,'invited','revoked',r.value);return ok({invitationId:x.id});
 },
 'people.inviteEmployee':(s,p,{actor,can})=>{
  if(!staffCan(can,'people','employees'))return fail('resourceDenied');
  const email=text(p.email,120).toLowerCase(),name=text(p.name,80),days=STAFF_EXPIRY_DAYS.includes(String(p.days))?Number(p.days):null;
  const errors=pick({name:lengthError(name,3),email:!email?'error.required':!EMAIL.test(email)?'error.email':!email.endsWith('@example.test')?'p6.syntheticEmail':s.users.some(u=>u.email===email)?'p8.emailTaken':null,role:INVITE_ROLES.includes(p.role)?null:'error.required',days:days?null:'error.required'});
  if(Object.keys(errors).length)return failFields(errors);
  const user={id:nextId(s.users.filter(u=>u.id.startsWith('U-STAFF-')),'U-STAFF'),name:typed(name),email,status:'invited',locale:'ar',mfa_state:'pending',created_at:DEMO_NOW,updated_at:DEMO_NOW};s.users.push(user);
  const perms=s.permissions.map(x=>x.key).filter(k=>p.role==='admin_finance'?k.startsWith('finance.'):k.startsWith('people.')||k.startsWith('courses.'));
  const ra={id:nextId(s.role_assignments,'RA'),user_id:user.id,role:p.role,permissions:perms,scope:p.role==='admin_finance'?{module:'finance'}:{modules:['people','courses','support']},effective_at:DEMO_NOW,expires_at:later(days),status:'invited',created_at:DEMO_NOW,updated_at:DEMO_NOW};
  s.role_assignments.push(ra);audit(s,actor,'role_assignment.invite','role_assignment',ra.id,'','invited',p.role);return ok({assignmentId:ra.id,userId:user.id});
 },
 // Staff status/expiry. The acting owner's own assignment is protected so one accountable controller always remains.
 'people.updateEmployee':(s,p,{actor,can})=>{
  if(!staffCan(can,'people','employees'))return fail('resourceDenied');
  const ra=s.role_assignments.find(r=>r.id===p.assignmentId&&STAFF_ROLES.includes(r.role));if(!ra)return fail('missing');
  if(ra.user_id===actor.user_id)return fail('p8.ownerProtected');
  const status=['active','invited','suspended','deactivated'].includes(p.status)?p.status:null,expires=p.expires?datePart(p.expires):null,r=reasonOf(p.reason);
  const errors=pick({status:status?null:'error.required',expires:p.expires&&(!expires||expires+'T19:59:59Z'<=DEMO_NOW)?'p8.dateFuture':null,reason:r.error});
  if(Object.keys(errors).length)return failFields(errors);
  const summary=()=>`${ra.status} · ${ra.expires_at?.slice(0,10)??'—'}`,before=summary();
  Object.assign(ra,{status,expires_at:expires?expires+'T19:59:59Z':ra.expires_at,updated_at:DEMO_NOW});
  const u=s.users.find(x=>x.id===ra.user_id);if(u)Object.assign(u,{status:['suspended','deactivated'].includes(status)?status:status==='active'?'active':u.status,updated_at:DEMO_NOW});
  audit(s,actor,'role_assignment.update','role_assignment',ra.id,before,summary(),r.value);return ok({assignmentId:ra.id});
 },
 'team.adminRevoke':(s,p,{actor,can})=>{
  if(!staffCan(can,'people'))return fail('resourceDenied');
  const m=s.teacher_team_members.find(x=>x.id===p.memberId);if(!m)return fail('missing');
  const assignment=p.courseId?s.course_team_assignments.find(a=>a.team_member_id===m.id&&a.course_id===p.courseId&&a.status==='active'):null;
  if(p.courseId&&!assignment)return fail('p8.assignmentNotActive');
  if(!p.courseId&&!['active','invited'].includes(m.status))return fail('p8.memberNotActive');
  const r=reasonOf(p.reason);if(r.error)return failFields({reason:r.error});
  const before=assignment?`${p.courseId}:${assignment.capabilities.join('+')}`:m.status;
  revokeTeamMember(s,m,assignment?[p.courseId]:null);
  audit(s,actor,'team.admin_revoke','teacher_team_member',m.id,before,assignment?`${p.courseId}:revoked`:'deactivated',r.value);
  notePerson(s,s.teachers.find(x=>x.id===m.teacher_id)?.user_id,{event:`team-admin-revoke-${m.id}-${s.audit_events.length}`,type:'team',title:{ar:'ألغت الإدارة صلاحية عضو في فريقك',en:'Administration revoked a team member’s access'},body:typed(r.value),href:'#/teacher/team'});
  return ok({memberId:m.id});
 },
 // Academic taxonomy. Records are edited in place with an audited before/after trail (history), never deleted while
 // referenced, and deactivation is refused while Published courses depend on the record.
 'academics.saveCurriculum':(s,p,{actor,can})=>{
  if(!staffCan(can,'academics'))return fail('resourceDenied');
  const code=text(p.code,20).toUpperCase(),n=bilingual(p,'name',3,120);
  const errors=pick({code:!/^[A-Z0-9-]{2,20}$/.test(code)?'p8.codeInvalid':s.curricula.some(c=>c.code===code&&c.id!==p.id)?'p8.codeTaken':null,...n.errors});
  if(Object.keys(errors).length)return failFields(errors);
  return saveRecord(s,actor,{collection:'curricula',prefix:'CUR',type:'curriculum',id:p.id,values:{code,name:n.value},extra:{active:false},summary:x=>`${x.code} · ${x.name.en}`});
 },
 'academics.saveVersion':(s,p,{actor,can})=>{
  if(!staffCan(can,'academics'))return fail('resourceDenied');
  const existing=p.id?s.curriculum_versions.find(v=>v.id===p.id):null;if(p.id&&!existing)return fail('missing');
  const n=bilingual(p,'name',3,120),year=intIn(p.effective_year,2000,2100),curriculum=s.curricula.find(c=>c.id===(existing?.curriculum_id??p.curriculum_id));
  const errors=pick({...n.errors,effective_year:year===null?'p8.yearInvalid':null,curriculum_id:curriculum?null:'error.required'});if(Object.keys(errors).length)return failFields(errors);
  return saveRecord(s,actor,{collection:'curriculum_versions',prefix:'CV',type:'curriculum_version',id:p.id,values:{name:n.value,effective_year:year},extra:{curriculum_id:curriculum.id,active:false},summary:x=>`${x.name.en} · ${x.effective_year}`});
 },
 'academics.saveTrack':(s,p,{actor,can})=>{
  if(!staffCan(can,'academics'))return fail('resourceDenied');
  const existing=p.id?s.tracks.find(v=>v.id===p.id):null;if(p.id&&!existing)return fail('missing');
  const n=bilingual(p,'name',3,120),version=s.curriculum_versions.find(v=>v.id===(existing?.curriculum_version_id??p.curriculum_version_id));
  const errors=pick({...n.errors,curriculum_version_id:version?null:'error.required'});if(Object.keys(errors).length)return failFields(errors);
  return saveRecord(s,actor,{collection:'tracks',prefix:'TR',type:'track',id:p.id,values:{name:n.value},extra:{curriculum_version_id:version.id,active:false},summary:x=>x.name.en});
 },
 'academics.setActive':(s,p,{actor,can})=>{
  if(!staffCan(can,'academics'))return fail('resourceDenied');
  const kind={curriculum:['curricula','curriculum'],version:['curriculum_versions','curriculum_version'],track:['tracks','track']}[p.kind];if(!kind)return fail('invalidAction');
  const row=s[kind[0]].find(x=>x.id===p.id);if(!row)return fail('missing');
  const active=p.active===true||p.active==='true';if(row.active===active)return ok({id:row.id,active,existing:true});
  if(!active&&publishedDependants(s,p.kind,row.id))return fail('p8.inUsePublished');
  Object.assign(row,{active,updated_at:DEMO_NOW});audit(s,actor,active?'academics.activate':'academics.deactivate',kind[1],row.id,active?'inactive':'active',active?'active':'inactive');
  return ok({id:row.id,active});
 },
 'academics.updateGrade':(s,p,{actor,can})=>{
  if(!staffCan(can,'academics'))return fail('resourceDenied');
  const g=s.grades.find(x=>x.id===p.id);if(!g)return fail('missing');
  const n=bilingual(p,'name',3,60),c=bilingual(p,'cycle',3,80),errors=pick({...n.errors,...c.errors});if(Object.keys(errors).length)return failFields(errors);
  const before=`${g.name.en} · ${g.cycle_label.en}`;Object.assign(g,{name:n.value,updated_at:DEMO_NOW});
  // Cycle labels are shared by every grade in the same official cycle.
  for(const x of s.grades.filter(v=>v.cycle_key===g.cycle_key))Object.assign(x,{cycle_label:structuredClone(c.value),updated_at:DEMO_NOW});
  audit(s,actor,'grade.update','grade',g.id,before,`${n.value.en} · ${c.value.en}`);return ok({id:g.id});
 },
 'academics.deleteGrade':(s,p,{actor,can})=>{
  if(!staffCan(can,'academics'))return fail('resourceDenied');
  const g=s.grades.find(x=>x.id===p.id);if(!g)return fail('missing');
  if(s.grade_subjects.some(x=>x.grade_id===g.id)||s.students.some(x=>x.current_grade_id===g.id)||s.enrollments.some(x=>x.historical_grade_id===g.id))return fail('p8.gradeReferenced');
  s.grades=s.grades.filter(x=>x.id!==g.id);audit(s,actor,'grade.delete','grade',g.id,g.name.en,'deleted');return ok({id:g.id});
 },
 'academics.updateSubject':(s,p,{actor,can})=>{
  if(!staffCan(can,'academics'))return fail('resourceDenied');
  if(!s.subjects.some(v=>v.id===p.id))return fail('missing');
  const n=bilingual(p,'name',2,60),d=bilingual(p,'description',10,300),errors=pick({...n.errors,...d.errors});if(Object.keys(errors).length)return failFields(errors);
  return saveRecord(s,actor,{collection:'subjects',type:'subject',id:p.id,values:{name:n.value,description:d.value},summary:x=>x.name.en});
 },
 // Mapping toggles never reclassify courses: existing grade_subject_id references stay as they are.
 'academics.toggleMapping':(s,p,{actor,can})=>{
  if(!staffCan(can,'academics'))return fail('resourceDenied');
  const g=s.grades.find(x=>x.id===p.gradeId),x=s.subjects.find(v=>v.id===p.subjectId),version=s.curriculum_versions.find(v=>v.id===(p.versionId||'CV-001'));
  if(!g||!x||!version)return fail('missing');
  const row=s.grade_subjects.find(v=>v.curriculum_version_id===version.id&&v.grade_id===g.id&&v.subject_id===x.id);
  if(row){Object.assign(row,{active:!row.active,updated_at:DEMO_NOW});audit(s,actor,row.active?'grade_subject.activate':'grade_subject.deactivate','grade_subject',row.id,row.active?'inactive':'active',row.active?'active':'inactive');return ok({id:row.id,active:row.active,courses:s.courses.filter(c=>c.grade_subject_id===row.id).length});}
  const id=version.id==='CV-001'?`GS-${g.id}-${x.id}`:`GS-${version.id}-${g.id}-${x.id}`;
  s.grade_subjects.push({id,curriculum_version_id:version.id,grade_id:g.id,subject_id:x.id,track_id:null,display_name:structuredClone(x.name),active:true,created_at:DEMO_NOW,updated_at:DEMO_NOW});
  audit(s,actor,'grade_subject.create','grade_subject',id,'','active');return ok({id,active:true,courses:0});
 },
 'academics.saveYear':(s,p,{actor,can})=>{
  if(!staffCan(can,'academics'))return fail('resourceDenied');
  const n=bilingual(p,'name',4,60),start=datePart(p.starts),end=datePart(p.ends);
  const errors=pick({...n.errors,starts:start?null:'error.required',ends:!end?'error.required':start&&end<=start?'p8.dateOrder':null});if(Object.keys(errors).length)return failFields(errors);
  return saveRecord(s,actor,{collection:'academic_years',prefix:'AY',type:'academic_year',id:p.id,values:{name:n.value,starts_at:start+'T00:00:00Z',ends_at:end+'T19:59:59Z'},summary:x=>`${x.name.en} · ${x.starts_at.slice(0,10)}–${x.ends_at.slice(0,10)}`});
 },
 'academics.saveSemester':(s,p,{actor,can})=>{
  if(!staffCan(can,'academics'))return fail('resourceDenied');
  const existing=p.id?s.semesters.find(v=>v.id===p.id):null;if(p.id&&!existing)return fail('missing');
  const year=s.academic_years.find(y=>y.id===(existing?.academic_year_id??p.academic_year_id)),n=bilingual(p,'name',3,60),sequence=intIn(p.sequence,1,4),start=datePart(p.starts),end=datePart(p.ends);
  const inYear=v=>!year||(v+'T19:59:59Z'>=year.starts_at&&v+'T00:00:00Z'<=year.ends_at);
  const errors=pick({...n.errors,academic_year_id:year?null:'error.required',sequence:sequence===null?'p8.sequenceInvalid':null,starts:!start?'error.required':!inYear(start)?'p8.outsideYear':null,ends:!end?'error.required':start&&end<=start?'p8.dateOrder':!inYear(end)?'p8.outsideYear':null});
  if(Object.keys(errors).length)return failFields(errors);
  return saveRecord(s,actor,{collection:'semesters',prefix:'SEM',type:'semester',id:p.id,values:{name:n.value,sequence,starts_at:start+'T00:00:00Z',ends_at:end+'T19:59:59Z'},extra:{academic_year_id:year.id},summary:x=>`${x.name.en} · ${x.starts_at.slice(0,10)}–${x.ends_at.slice(0,10)}`});
 },
 // Side-by-side AR/EN labels for subjects and grade-subject mappings; any missing label rejects the whole save.
 'academics.saveTranslations':(s,p,{actor,can})=>{
  if(!staffCan(can,'academics'))return fail('resourceDenied');
  const subjects=p.subjects&&typeof p.subjects==='object'?Object.entries(p.subjects):[],mappings=p.mappings&&typeof p.mappings==='object'?Object.entries(p.mappings):[],errors={},changes=[];
  if(!subjects.length&&!mappings.length)return fail('invalidAction');
  const label=(key,v)=>{const ar=text(v?.ar,60),en=text(v?.en,60);if(!ar)errors[key+'_ar']='p8.labelMissing';if(!en)errors[key+'_en']='p8.labelMissing';return {ar,en};};
  const rows=[...subjects.map(([id,v])=>[s.subjects.find(x=>x.id===id),'name',label('s_'+id.replace(/-/g,'_'),v)]),...mappings.map(([id,v])=>[s.grade_subjects.find(x=>x.id===id),'display_name',label('m_'+id.replace(/-/g,'_'),v)])];
  if(rows.some(([row])=>!row))return fail('missing');
  if(Object.keys(errors).length)return failFields(errors,'p8.labelsMissing');
  for(const [row,key,v] of rows)if(row[key].ar!==v.ar||row[key].en!==v.en){changes.push(row.id);Object.assign(row,{[key]:v,updated_at:DEMO_NOW});}
  if(changes.length)audit(s,actor,'translation.update','translation',changes.length===1?changes[0]:`${changes.length} labels`,'',changes.join(', '));
  return ok({changed:changes.length});
 },
 // Course operations: unpublish/archive/explicit moderated republish, each reasoned, audited and notified to the owner.
 'course.moderate':(s,p,{actor,can})=>{
  if(!staffCan(can,'courses'))return fail('resourceDenied');
  const c=s.courses.find(x=>x.id===p.courseId);if(!c)return fail('missing');
  const rule=Object.hasOwn(COURSE_MODERATION,p.action)?COURSE_MODERATION[p.action]:null;if(!rule)return fail('invalidAction');
  if(c.status===rule.to)return ok({id:c.id,status:c.status,existing:true});
  if(!rule.from.includes(c.status))return fail('p6.invalidTransition');
  const r=reasonOf(p.reason);if(r.error)return failFields({reason:r.error});
  if(p.action==='republish'){if(!qualifiedPairs(s,c.owner_teacher_id).has(c.grade_subject_id))return fail('p6.notQualified');if(checklistBlocked(s,c))return fail('p6.checklistIncomplete');}
  const before=c.status;Object.assign(c,{status:rule.to,updated_at:DEMO_NOW});
  if(c.unpublish_request?.state==='requested'&&rule.to!=='Published')c.unpublish_request={...c.unpublish_request,state:'resolved',resolved_at:DEMO_NOW};
  audit(s,actor,'course.'+p.action,'course',c.id,before,rule.to,r.value);
  notePerson(s,s.teachers.find(x=>x.id===c.owner_teacher_id)?.user_id,{event:`course-moderate-${c.id}-${s.audit_events.length}`,type:'course_moderation',title:{unpublish:{ar:'أُلغي نشر دورتك',en:'Your course was unpublished'},archive:{ar:'أُرشفت دورتك',en:'Your course was archived'},republish:{ar:'أُعيد نشر دورتك',en:'Your course was republished'}}[p.action],body:structuredClone(editView(c).title),href:`#/teacher/course/${c.id}?tab=details`,courseId:c.id});
  return ok({id:c.id,status:c.status});
 },
 // Content reports: restrict records a moderation hold on the course pending review (shown to staff), unpublish takes
 // the course down, resolve closes the report and lifts this report's hold. Each needs a reason and is audited.
 'report.act':(s,p,ctx)=>{
  const {actor,can}=ctx;if(!staffCan(can,'courses'))return fail('resourceDenied');
  const rep=s.safety_reports.find(x=>x.id===p.reportId&&!isMessageReport(x));if(!rep)return fail('missing');
  if(!['restrict','unpublish','resolve'].includes(p.action))return fail('invalidAction');
  if(rep.state==='resolved')return fail('p8.reportResolved');
  const r=reasonOf(p.reason);if(r.error)return failFields({reason:r.error});
  const c=s.courses.find(x=>x.id===rep.course_id),before=rep.state;
  if(p.action==='restrict'){Object.assign(c,{content_restriction:{report_id:rep.id,reason:typed(r.value),at:DEMO_NOW,by:actor.user_id},updated_at:DEMO_NOW});Object.assign(rep,{state:'escalated',assigned_staff_id:actor.user_id,updated_at:DEMO_NOW});audit(s,actor,'course.restrict','course',c.id,'','restricted',r.value);}
  else {
   if(p.action==='unpublish'){const res=reducers['course.moderate'](s,{courseId:c.id,action:'unpublish',reason:r.value},ctx);if(!res.ok)return res;}
   if(c.content_restriction?.report_id===rep.id)c.content_restriction=null;
   Object.assign(rep,{state:'resolved',resolution:r.value,assigned_staff_id:actor.user_id,updated_at:DEMO_NOW});
  }
  audit(s,actor,'report.'+p.action,'safety_report',rep.id,before,rep.state,r.value);return ok({reportId:rep.id,state:rep.state});
 },
 // Explicit staff entitlement: admin_grant origin with a stated validity window; orders and payments are never touched.
 'access.adminGrant':(s,p,{actor,can})=>{
  if(!staffCan(can,'courses'))return fail('resourceDenied');
  const st=s.students.find(x=>x.id===p.studentId),c=s.courses.find(x=>x.id===p.courseId),end=p.ends?datePart(p.ends):null,r=reasonOf(p.reason);
  const errors=pick({studentId:st?null:'error.required',courseId:!c?'error.required':!['Published','Unpublished','Archived'].includes(c.status)?'p8.courseNotGrantable':st&&activeGrantIn(s,st.id,c.id)?'p8.grantExists':null,ends:!end?'error.required':end+'T19:59:59Z'<=DEMO_NOW?'p8.dateFuture':null,reason:r.error});
  if(Object.keys(errors).length)return failFields(errors);
  let e=s.enrollments.find(x=>x.student_id===st.id&&x.course_id===c.id);
  if(e&&e.status!=='active')return failFields({studentId:'error.enrollmentSuspended'});
  if(!e){e={id:nextId(s.enrollments,'EN'),student_id:st.id,course_id:c.id,status:'active',started_at:DEMO_NOW,historical_grade_id:st.current_grade_id,created_at:DEMO_NOW,updated_at:DEMO_NOW};s.enrollments.push(e);}
  const g={id:nextId(s.access_grants,'AG'),student_id:st.id,course_id:c.id,enrollment_id:e.id,origin:'admin_grant',source_id:null,starts_at:DEMO_NOW,ends_at:end+'T19:59:59Z',status:'active',granted_by:actor.user_id,reason:r.value,created_at:DEMO_NOW,updated_at:DEMO_NOW};
  s.access_grants.push(g);audit(s,actor,'access_grant.create','access_grant',g.id,'','active',r.value);
  notePerson(s,st.user_id,{event:'admin-grant-'+g.id,type:'enrollment',title:{ar:'تم منحك وصولاً إلى دورة',en:'You were granted course access'},body:structuredClone(editView(c).title),href:'#/student/course/'+c.id,courseId:c.id});
  return ok({grantId:g.id,enrollmentId:e.id});
 },
 'access.revokeGrant':(s,p,{actor,can})=>{
  if(!staffCan(can,'courses'))return fail('resourceDenied');
  const g=s.access_grants.find(x=>x.id===p.grantId);if(!g)return fail('missing');
  if(g.status!=='active')return fail('p8.grantNotActive');
  const r=reasonOf(p.reason);if(r.error)return failFields({reason:r.error});
  Object.assign(g,{status:'revoked',revoked_by:actor.user_id,revoke_reason:r.value,updated_at:DEMO_NOW});audit(s,actor,'access_grant.revoke','access_grant',g.id,'active','revoked',r.value);return ok({grantId:g.id});
 },
 'live.addIncident':(s,p,{actor,can})=>{
  if(!staffCan(can,'courses'))return fail('resourceDenied');
  const x=s.live_sessions.find(v=>v.id===p.sessionId);if(!x)return fail('missing');
  const note=text(p.note,600),error=note&&note.length<10?'error.messageShort':lengthError(note,10);if(error)return failFields({note:error});
  const list=x.incident_notes??=[];list.push({id:`${x.id}-INC-${list.length+1}`,text:note,author_user_id:actor.user_id,created_at:DEMO_NOW});x.updated_at=DEMO_NOW;
  audit(s,actor,'live_session.incident','live_session',x.id,x.status,'incident_note',note);return ok({sessionId:x.id});
 },
 // Support desk. Responding requires a prior reasoned read of the thread; resolution requires its own reason.
 'support.staffRespond':(s,p,{actor,can})=>{
  if(!staffCan(can,'support'))return fail('resourceDenied');
  const x=s.support_tickets.find(v=>v.id===p.ticketId);if(!x)return fail('missing');
  if(!revealed(s,'ticket',x.id))return fail('p8.reasonFirst');
  if(x.state==='resolved')return fail('p8.ticketResolved');
  const body=text(p.text,2000),error=lengthError(body,2);if(error)return failFields({text:error});
  (x.replies??=[]).push({id:`${x.id}-R${x.replies.length+1}`,author_user_id:actor.user_id,text:body,lang:s.preferences.lang,created_at:DEMO_NOW});
  const before=x.state;Object.assign(x,{state:'waiting',assigned_staff_id:actor.user_id,updated_at:DEMO_NOW});
  audit(s,actor,'support.respond','support_ticket',x.id,before,'waiting');
  notePerson(s,x.requester_user_id,{event:`ticket-reply-${x.id}-${x.replies.length}`,type:'support',title:{ar:'رد فريق الدعم على طلبك',en:'Support replied to your request'},body:structuredClone(x.subject),href:roleOfUser(s,x.requester_user_id)==='guardian'?'#/guardian/support?record='+x.id:null});
  return ok({ticketId:x.id});
 },
 'support.resolveTicket':(s,p,{actor,can})=>{
  if(!staffCan(can,'support'))return fail('resourceDenied');
  const x=s.support_tickets.find(v=>v.id===p.ticketId);if(!x)return fail('missing');
  if(x.state==='resolved')return ok({ticketId:x.id,existing:true});
  const r=reasonOf(p.reason);if(r.error)return failFields({reason:r.error});
  const before=x.state;Object.assign(x,{state:'resolved',resolution:r.value,assigned_staff_id:x.assigned_staff_id??actor.user_id,updated_at:DEMO_NOW});
  audit(s,actor,'support.resolve','support_ticket',x.id,before,'resolved',r.value);
  notePerson(s,x.requester_user_id,{event:`ticket-resolved-${x.id}-${s.audit_events.length}`,type:'support',title:{ar:'تم حل طلب الدعم',en:'Support request resolved'},body:structuredClone(x.subject),href:roleOfUser(s,x.requester_user_id)==='guardian'?'#/guardian/support?record='+x.id:null});
  return ok({ticketId:x.id});
 },
 'safety.setState':(s,p,{actor,can})=>{
  if(!staffCan(can,'support'))return fail('resourceDenied');
  const rep=s.safety_reports.find(x=>x.id===p.reportId&&isMessageReport(x));if(!rep)return fail('missing');
  if(!(SAFETY_NEXT[rep.state]??[]).includes(p.state))return fail('p6.invalidTransition');
  const r=reasonOf(p.reason);if(r.error)return failFields({reason:r.error});
  const before=rep.state;(rep.review_notes??=[]).push({id:`${rep.id}-N${rep.review_notes.length+1}`,text:r.value,state:p.state,author_user_id:actor.user_id,created_at:DEMO_NOW});
  Object.assign(rep,{state:p.state,assigned_staff_id:actor.user_id,updated_at:DEMO_NOW,...(p.state==='resolved'?{resolution:r.value}:{})});
  audit(s,actor,'safety.'+p.state,'safety_report',rep.id,before,p.state,r.value);
  if(p.state==='escalated')for(const u of userRoleIds(s,'super_admin'))if(u!==actor.user_id)notePerson(s,u,{event:`safety-escalated-${rep.id}-${s.audit_events.length}`,type:'safety',title:{ar:'بلاغ تواصل مصعّد',en:'Communication report escalated'},body:structuredClone(rep.reason),href:'#/admin/support/communications?record='+rep.id});
  return ok({reportId:rep.id,state:rep.state});
 },
 'message.moderate':(s,p,{actor,can})=>{
  if(!staffCan(can,'support'))return fail('resourceDenied');
  const m=s.messages.find(x=>x.id===p.messageId);if(!m)return fail('missing');
  const from={remove:['visible','flagged'],restore:['removed'],clear:['flagged']}[p.decision];if(!from)return fail('invalidAction');
  if(!from.includes(m.moderation_state))return fail('p6.invalidTransition');
  const r=reasonOf(p.reason);if(r.error)return failFields({reason:r.error});
  const before=m.moderation_state;Object.assign(m,{moderation_state:p.decision==='remove'?'removed':'visible',updated_at:DEMO_NOW});
  audit(s,actor,'message.'+p.decision,'message',m.id,before,m.moderation_state,r.value);return ok({messageId:m.id,state:m.moderation_state});
 },
 // CMS. Saved copy is exactly what the public selectors (homeBanner, featuredCourses, cmsPage, faqs) read.
 'cms.saveHome':(s,p,{actor,can})=>{
  if(!staffCan(can,'cms'))return fail('resourceDenied');
  const home=s.cms_pages.find(x=>x.slug==='home');if(!home)return fail('missing');
  const t1=bilingual(p,'title',5,120),b1=bilingual(p,'body',10,300),featured=[...new Set(Array.isArray(p.featured)?p.featured.filter(x=>typeof x==='string'):[])];
  const errors=pick({...t1.errors,...b1.errors,featured:!featured.length?'p8.featuredRequired':featured.length>8?'p8.featuredMax':featured.some(id=>{const c=s.courses.find(x=>x.id===id);return !c||!isPublic(s,c);})?'p8.featuredInvalid':null});
  if(Object.keys(errors).length)return failFields(errors);
  const banner=home.sections.find(x=>x.kind==='banner'),before=banner?.title.en??'';
  if(banner)Object.assign(banner,{title:t1.value,body:b1.value});else home.sections.unshift({kind:'banner',title:t1.value,body:b1.value});
  const f=home.sections.find(x=>x.kind==='featured');if(f)f.course_ids=featured;else home.sections.push({kind:'featured',course_ids:featured});
  home.updated_at=DEMO_NOW;audit(s,actor,'cms.update_home','cms_page',home.id,before,`${t1.value.en} · ${featured.join(',')}`);return ok({pageId:home.id});
 },
 'cms.savePage':(s,p,{actor,can})=>{
  if(!staffCan(can,'cms'))return fail('resourceDenied');
  const page=s.cms_pages.find(x=>x.slug===p.slug&&x.slug!=='home');if(!page)return fail('missing');
  const t1=bilingual(p,'title',3,120),b1=bilingual(p,'body',10,1000),errors=pick({...t1.errors,...b1.errors});if(Object.keys(errors).length)return failFields(errors);
  const before=page.title.en;Object.assign(page,{title:t1.value,body:b1.value,updated_at:DEMO_NOW});
  // Policy copy can never become "approved" from the demo editor.
  if(['privacy','terms','refunds'].includes(page.slug))page.status='draft';
  audit(s,actor,'cms.update_page','cms_page',page.id,before,t1.value.en);return ok({pageId:page.id,status:page.status});
 },
 'cms.saveFaq':(s,p,{actor,can})=>{
  if(!staffCan(can,'cms'))return fail('resourceDenied');
  const help=s.cms_pages.find(x=>x.slug==='help'),faqs=help.sections.filter(x=>x.kind==='faq'),fresh=p.index===''||p.index==null,index=fresh?null:intIn(p.index,0,faqs.length-1);
  if(!fresh&&index===null)return fail('missing');
  const t1=bilingual(p,'title',5,160),b1=bilingual(p,'body',10,600),errors=pick({...t1.errors,...b1.errors});if(Object.keys(errors).length)return failFields(errors);
  if(fresh)help.sections.push({kind:'faq',title:t1.value,body:b1.value});else Object.assign(faqs[index],{title:t1.value,body:b1.value});
  help.updated_at=DEMO_NOW;audit(s,actor,fresh?'cms.add_faq':'cms.update_faq','cms_page',help.id,'',t1.value.en);return ok({index:fresh?faqs.length:index});
 },
 'cms.removeFaq':(s,p,{actor,can})=>{
  if(!staffCan(can,'cms'))return fail('resourceDenied');
  const help=s.cms_pages.find(x=>x.slug==='help'),faqs=help.sections.filter(x=>x.kind==='faq'),index=intIn(p.index,0,faqs.length-1);if(index===null)return fail('missing');
  const target=faqs[index];help.sections=help.sections.filter(x=>x!==target);help.updated_at=DEMO_NOW;audit(s,actor,'cms.remove_faq','cms_page',help.id,target.title.en,'removed');return ok({index});
 },
 'template.save':(s,p,{actor,can})=>{
  if(!staffCan(can,'notifications'))return fail('resourceDenied');
  const x=s.notification_templates.find(v=>v.id===p.templateId);if(!x)return fail('missing');
  const sub=bilingual(p,'subject',3,120),body=bilingual(p,'body',10,600),errors=pick({...sub.errors,...body.errors});
  // Both languages must keep the template's placeholders so delivery data still fills them.
  const expected=placeholders(x.body.en);
  if(!errors.body_ar&&placeholders(body.value.ar)!==expected)errors.body_ar='p8.placeholderMismatch';
  if(!errors.body_en&&placeholders(body.value.en)!==expected)errors.body_en='p8.placeholderMismatch';
  if(Object.keys(errors).length)return failFields(errors);
  const enabled=p.enabled===true||p.enabled==='on',summary=()=>`${x.subject.en} · ${x.enabled?'on':'off'}`,before=summary();
  Object.assign(x,{subject:sub.value,body:body.value,enabled,updated_at:DEMO_NOW});audit(s,actor,'notification_template.update','notification_template',x.id,before,summary());return ok({templateId:x.id});
 },
 // Simulated redelivery of the same notification: its event ID (deduplication key) and record are reused, never
 // re-created; an attempt that is already delivered returns success without change.
 'delivery.retry':(s,p,{actor,can})=>{
  if(!staffCan(can,'notifications'))return fail('resourceDenied');
  const a=s.delivery_attempts.find(x=>x.id===p.attemptId);if(!a)return fail('missing');
  const n=s.notifications.find(x=>x.id===a.notification_id);
  if(['sent','read'].includes(a.state))return ok({attemptId:a.id,eventId:n?.event_id??null,existing:true});
  const before=a.state;Object.assign(a,{state:'sent',attempts:a.attempts+1,last_error:'',retried_at:DEMO_NOW,updated_at:DEMO_NOW});
  audit(s,actor,'delivery.retry','delivery_attempt',a.id,before,'sent',n?.event_id??'');return ok({attemptId:a.id,eventId:n?.event_id??null,existing:false});
 },
 // Roles: audited demo changes. The acting owner's settings.manage_roles and the independent payout approval rule
 // (approver ≠ preparer, enforced in can()) cannot be removed here.
 'roles.save':(s,p,{actor,can})=>{
  if(!staffCan(can,'settings'))return fail('resourceDenied');
  if(p.independentApproval===false||p.independentApproval==='false')return fail('p8.independentLocked');
  const ra=s.role_assignments.find(r=>r.id===p.assignmentId);if(!ra)return fail('missing');
  const keys=s.permissions.map(x=>x.key);if(!Array.isArray(p.permissions)||p.permissions.some(k=>!keys.includes(k)))return fail('invalidAction');
  const permissions=keys.filter(k=>p.permissions.includes(k)),expires=p.expires?datePart(p.expires):null,r=reasonOf(p.reason);
  const errors=pick({permissions:!permissions.length?'p8.permissionRequired':ra.user_id===actor.user_id&&!permissions.includes('settings.manage_roles')?'p8.ownerCoreControl':null,expires:p.expires&&(!expires||expires+'T19:59:59Z'<=DEMO_NOW)?'p8.dateFuture':null,reason:r.error});
  if(Object.keys(errors).length)return failFields(errors);
  const summary=()=>`${ra.permissions.length} · ${ra.expires_at?.slice(0,10)??'—'}`,before=summary();
  Object.assign(ra,{permissions,expires_at:expires?expires+'T19:59:59Z':ra.expires_at,updated_at:DEMO_NOW});
  audit(s,actor,'role_assignment.update','role_assignment',ra.id,before,summary(),r.value);return ok({assignmentId:ra.id});
 },
 // Mock MFA/session controls; nothing here claims real authentication.
 'security.update':(s,p,{actor,can})=>{
  if(!staffCan(can,'settings'))return fail('resourceDenied');
  const u=s.users.find(x=>x.id===p.userId&&s.role_assignments.some(r=>r.user_id===x.id&&STAFF_ROLES.includes(r.role)));if(!u)return fail('missing');
  if(!['resetMfa','markEnrolled','revokeSessions'].includes(p.action))return fail('invalidAction');
  if(u.id===actor.user_id&&p.action!=='revokeSessions')return fail('p8.ownerProtected');
  const r=reasonOf(p.reason);if(r.error)return failFields({reason:r.error});
  const before=u.mfa_state??'enrolled';
  if(p.action==='revokeSessions')u.sessions_revoked_at=DEMO_NOW;else u.mfa_state=p.action==='resetMfa'?'pending':'enrolled';
  u.updated_at=DEMO_NOW;audit(s,actor,'security.'+p.action,'security',u.id,before,p.action==='revokeSessions'?'sessions_revoked':u.mfa_state,r.value);return ok({userId:u.id});
 },
 'integration.test':(s,p,{actor,can})=>{
  if(!staffCan(can,'settings'))return fail('resourceDenied');
  const set=s.platform_settings[0];if(typeof p.key!=='string'||!Object.hasOwn(set.integration_statuses,p.key))return fail('missing');
  const n=(set.integration_tests?.[p.key]?.run??0)+1;
  (set.integration_tests??={})[p.key]={run:n,at:DEMO_NOW,outcome:'simulated_ok',latency_ms:120+Object.keys(set.integration_statuses).indexOf(p.key)*37+n*3,reference:`SIM-${p.key.toUpperCase()}-${String(n).padStart(3,'0')}`};
  audit(s,actor,'integration.test','integration',p.key,'','simulated_ok');return ok({...set.integration_tests[p.key]});
 },
});
