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
const FORMS=['sign-in','reset-password','register-student','register-guardian','contact','application'];
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
 case 'notifications': return state.notifications.filter(n=>n.recipient_user_id===actor.user_id);
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
function dashboard(s,_a,{actor}) {
 const st=studentOf(s,actor);if(!st)return null;
 const rows=studentCourses(s,st.id),active=rows.filter(r=>r.access.state==='active'),ids=new Set(active.map(r=>r.course.id));
 const current=s.lesson_progress.filter(p=>p.student_id===st.id&&p.status==='in_progress').map(p=>({progress:p,lesson:s.lessons.find(l=>l.id===p.lesson_id)})).filter(x=>x.lesson?.state==='published'&&ids.has(lessonCourse(s,x.lesson))).sort((a,b)=>b.progress.updated_at.localeCompare(a.progress.updated_at))[0];
 const resume=current?{lesson:current.lesson,progress:current.progress,row:active.find(r=>r.course.id===lessonCourse(s,current.lesson))}:active.filter(r=>r.next).map(r=>({lesson:r.next,progress:null,row:r}))[0]??null;
 // Four weekly buckets ending at the demo clock, counted from the learner's own records.
 const now=Date.parse(DEMO_NOW),events=[
  ...s.lesson_progress.filter(p=>p.student_id===st.id&&p.status==='done').map(p=>['lessons',p.completed_at]),
  ...s.attempts.filter(a=>a.student_id===st.id).map(a=>['assessments',a.submitted_at]),
  ...s.submissions.filter(x=>x.student_id===st.id).map(x=>['assessments',x.submitted_at]),
  ...s.attendance.filter(a=>a.student_id===st.id&&a.status==='present').map(a=>['live',a.joined_at])];
 const weeks=[3,2,1,0].map(i=>{const end=now-i*7*DAY,start=end-7*DAY,hit=events.filter(([,at])=>{const time=Date.parse(at);return time>start&&time<=end;});return {start:new Date(start+DAY).toISOString(),end:new Date(end).toISOString(),lessons:hit.filter(e=>e[0]==='lessons').length,assessments:hit.filter(e=>e[0]==='assessments').length,live:hit.filter(e=>e[0]==='live').length};});
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
