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
// Reducer registry keyed by action type. Later phases add one entry per mutation here.
// Each reducer receives (draft, payload, {actor, can}) and validates actor/scope/transition
// before mutating its private draft; only successful results replace the immutable state.
const reducers={
 'preferences.set': (draft,payload)=>{
  if(!Object.keys(payload).length || Object.keys(payload).some(k=>!valid[k]?.includes(payload[k])))return fail('invalidPreference');
  if(payload.role && payload.role!==draft.preferences.role)draft.transient={};
  Object.assign(draft.preferences,payload);return ok({...draft.preferences});
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
function publicCourse(c) { const teacher=find('teachers',c.owner_teacher_id);return c.status==='Published' && teacher?.application_status==='approved' && teacher.account_status==='active'; }
function assistantAssignment(courseId) { return state.course_team_assignments.find(a=>a.course_id===courseId && a.status==='active' && state.teacher_team_members.some(m=>m.id===a.team_member_id && m.user_id===PERSONAS.assistant.user_id && m.status==='active' && (!m.expires_at || m.expires_at>DEMO_NOW))); }
export function can(action,resource={}) {
 const role=state.preferences.role, actor=PERSONAS[role];
 let r=typeof resource==='string' ? (Object.values(state).filter(Array.isArray).flat().find(x=>x.id===resource) ?? {module:resource}) : resource ?? {};
 const course=r.course_id?find('courses',r.course_id):r.owner_teacher_id?r:null;
 const module=r.module ?? (action.startsWith('finance.')?'finance':action.startsWith('people.')?'people':null);
 if(action==='public.read')return course?publicCourse(course):true;
 if(role==='visitor')return false;
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
 case 'catalog': case 'publishedCatalog': return state.courses.filter(publicCourse).filter(c=>!args.gradeId || find('grade_subjects',c.grade_subject_id).grade_id===args.gradeId).filter(c=>!args.subjectId || find('grade_subjects',c.grade_subject_id).subject_id===args.subjectId).slice(0,args.limit??Infinity).map(decorateCourse);
 case 'featuredCourses': { const featured=state.cms_pages.find(p=>p.slug==='home')?.sections.find(s=>s.kind==='featured')?.course_ids??[];const picked=featured.map(id=>find('courses',id)).filter(c=>c&&publicCourse(c));return (picked.length?picked:state.courses.filter(publicCourse)).slice(0,args.limit??4).map(decorateCourse); }
 case 'homeBanner': return state.cms_pages.find(p=>p.slug==='home')?.sections.find(s=>s.kind==='banner')??null;
 case 'cycles': { const published=state.courses.filter(publicCourse);return [...new Set(state.grades.map(g=>g.cycle_key))].map(key=>{const grades=state.grades.filter(g=>g.cycle_key===key);return {key,label:grades[0].cycle_label,grades,course_count:published.filter(c=>grades.some(g=>g.id===find('grade_subjects',c.grade_subject_id).grade_id)).length};}); }
 case 'featuredTeachers': return state.teachers.filter(t=>t.application_status==='approved' && t.account_status==='active').map(t=>({...t,qualifications:qualificationLabels(t.id),published_course_count:state.courses.filter(c=>c.owner_teacher_id===t.id && publicCourse(c)).length})).filter(t=>!args.withCourses || t.published_course_count>0).slice(0,args.limit??Infinity);
 case 'notifications': return state.notifications.filter(n=>n.recipient_user_id===actor.user_id);
 case 'notifications.count': return select('notifications').filter(n=>!n.read_at).length;
 case 'guardian.children': return state.students.filter(s=>can('child.read',s));
 case 'scopedCourses': return state.courses.filter(c=>can('course.read',c)).map(decorateCourse);
 case 'scopedConversations': return state.conversations.filter(c=>can('conversation.read',c));
 case 'resource': { const allowed=['courses','students','teachers','conversations','orders','payout_batches','grades','subjects'];if(!allowed.includes(args.collection))return {status:'missing',record:null};const record=find(args.collection,args.id);if(!record)return {status:'missing',record:null};if(!can(args.action??'course.read',record))return {status:'denied',record:null};return {status:'ok',record}; }
 default: throw new Error(`Unknown selector: ${selector}`);
 }
}
