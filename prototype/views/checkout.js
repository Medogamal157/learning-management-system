import { select } from '../core/store.js';
import { t, L, esc, money, dateTime } from '../core/i18n.js';
import { icon } from '../core/icons.js';
import { pageHeader, card, courseCard, stepper, formField, notice, table, button, badge, avatar, showToast } from '../core/ui.js';
import { fallback } from '../core/layout.js';
const label=k=>t('p3.'+k);
const orderLink=(id,step)=>'#/checkout/order/'+encodeURIComponent(id)+'/'+step;
const courseLink=(id,step,student)=>'#/checkout/'+encodeURIComponent(id)+'/'+step+(student?'?student='+encodeURIComponent(student):'');
const accessLink=(ctx,courseId,studentId)=>ctx.role==='student'?'#/student/course/'+encodeURIComponent(courseId):'#/guardian/child/'+encodeURIComponent(studentId);
const goAccess=(ctx,courseId,studentId)=>button({label:label(ctx.role==='student'?'goCourse':'goChild'),href:accessLink(ctx,courseId,studentId)});
const denied=(d,ctx)=>d.status!=='ok'?fallback(d.status==='missing'?'notFound':'resourceDenied',ctx):null;
// Beneficiary comes from the hash only as a candidate; the selector re-validates it against verified purchase links.
const context=ctx=>select('checkout.context',{courseId:ctx.params.courseId,studentId:ctx.query.get('student')??ctx.query.get('child')??undefined});
const STEPS=['beneficiary','review','payment','result'];
// The current step is filled teal; completed steps carry a check icon (from ui.stepper), so state never relies on color alone.
function heading(step,{breadcrumbs=[]}={}) {return pageHeader({title:label(step),subtitle:label('intro'),breadcrumbs})+`<div class="no-print mb-6 overflow-hidden [&_ol]:gap-2 [&_li]:min-h-11 [&_li]:px-4 [&_li[aria-current=step]]:bg-primary [&_li[aria-current=step]]:text-[color:var(--on-primary)] [&_li[aria-current=step]]:font-semibold">${stepper(STEPS.map(id=>({id,label:label(id)})),step,{label:label('steps')})}</div>`;}
function party(key,person,note='') {return `<div class="rounded-xl border border-border p-4 min-w-0"><p class="eyebrow flex items-center gap-2">${icon(key==='buyer'?'creditCard':'graduationCap',{size:16})}<span>${esc(label(key))}</span></p><div class="flex items-center gap-3 mt-3 min-w-0">${person?avatar(person,{size:40,showName:true}):`<span class="muted" data-learner-name>${esc(label('notSelected'))}</span>`}</div>${note?`<p class="text-sm muted mt-2">${esc(note)}</p>`:''}</div>`;}
function parties(buyer,student,note='') {return `<div class="grid gap-3 sm:grid-cols-2 min-w-0">${party('buyer',buyer)}${party('learner',student,note)}</div>`;}
function totals(o) {return `<dl class="stack">${[['price',o.subtotal_baisa],['discount',o.discount_baisa],['tax',o.tax_baisa],['total',o.total_baisa]].map(([k,v])=>`<div class="flex items-center justify-between gap-3 ${k==='total'?'border-t border-border pt-4 text-xl font-semibold':''}"><dt>${esc(label(k))}${k==='discount'||k==='tax'?` <span class="chip text-xs tone-neutral">${esc(label('demoInput'))}</span>`:''}</dt><dd><bdi>${esc(money(v))}</bdi></dd></div>`).join('')}</dl><p class="text-sm muted mt-4">${esc(label('demoInputs'))}</p>`;}
function summary(c) {return `<aside class="purchase-card min-w-0 stack">${courseCard(c)}<section class="panel"><p class="muted text-sm">${esc(label('total'))}</p><p class="text-2xl font-semibold mt-1"><bdi>${esc(money(c.price_type==='free'?0:c.price_baisa))}</bdi></p></section></aside>`;}
const submit=key=>`<button type="submit" class="btn btn-primary w-full">${esc(label(key))}</button>`;
function already(d,ctx) {return notice({title:label('already'),message:label('alreadyBody'),tone:'success'})+`<div class="flex-row">${goAccess(ctx,d.course.id,d.student.id)}</div>`;}
function childLabel(s) {return s.grade?`${L(s.name)} · ${L(s.grade)}`:L(s.name);}
export const beneficiary={render(ctx){
 const d=context(ctx),error=denied(d,ctx);if(error)return error;
 const guardian=ctx.role==='guardian',chooser=guardian&&d.children.length?`<div class="[&_fieldset_label]:rounded-xl [&_fieldset_label]:border [&_fieldset_label]:border-border [&_fieldset_label]:px-4 [&_fieldset_label]:mb-2 [&_fieldset_label:has(:checked)]:border-primary [&_fieldset_label:has(:checked)]:bg-[color:var(--primary-soft)]">${formField({id:'checkout-student',name:'student',label:label('chooseStudent'),type:'radio',value:d.student?.id??'',required:true,options:d.children.map(s=>({value:s.id,label:childLabel(s)})),hint:label('verifiedOnly')})}</div>`:'';
 const body=!guardian?notice({message:label('self')}):d.children.length?chooser:notice({title:label('noChildren'),message:label('noChildrenBody'),tone:'warning'});
 const action=d.hasAccess?already(d,ctx):guardian&&!d.children.length?'':submit('continue');
 return heading('beneficiary',{breadcrumbs:[{label:L(d.course.title),href:'#/course/'+d.course.id},{label:label('beneficiary')}]})+`<div class="course-layout"><section class="panel stack min-w-0">${parties(d.buyer,d.student,guardian?label('learnerNote'):label('self'))}<form class="stack" data-action="checkout.choose">${body}${action}</form>${guardian?`<p class="text-sm muted">${esc(label('linkHint'))}</p>${button({label:label('linkChild'),href:'#/guardian/children/link',variant:'secondary'})}`:''}</section>${summary(d.course)}</div>`;
},mount(root){
 // Mirror the chosen child into the learner card without navigating, so radio keyboard focus is preserved.
 const change=event=>{const input=event.target;if(!input.matches?.('input[name="student"]'))return;const slot=root.querySelector('[data-learner-name]');if(slot)slot.textContent=input.closest('label')?.textContent.trim()??'';};
 root.addEventListener('change',change);return ()=>root.removeEventListener('change',change);
}};
export const review={render(ctx){
 const d=context(ctx),error=denied(d,ctx);if(error)return error;
 if(!d.student)return heading('review')+`<section class="panel stack">${notice({message:label('chooseStudent'),tone:'warning'})}<div class="flex-row">${button({label:label('beneficiary'),href:courseLink(d.course.id,'beneficiary')})}</div></section>`;
 const price=d.course.price_type==='free'?0:d.course.price_baisa;
 const form=`<form class="stack" data-action="checkout.confirm">${formField({id:'checkout-consent',name:'consent',label:label('consent'),type:'checkbox',value:false,required:true})}${submit(price===0?'activate':'confirm')}</form>`;
 const body=d.hasAccess?already(d,ctx):`<section class="stack"><h2 class="text-lg">${esc(label('orderSummary'))}</h2>${totals({subtotal_baisa:price,discount_baisa:0,tax_baisa:0,total_baisa:price})}</section>${price===0?notice({message:label('freeBody'),tone:'success'}):''}${notice({title:label('accessTerms'),message:label('accessBody')+' '+dateTime(d.accessEnd)})}<p class="flex-row text-sm">${icon('shield',{size:16})}<a class="text-primary font-medium underline" href="#/legal/refunds">${esc(t('refunds'))}</a></p>${form}`;
 return heading('review',{breadcrumbs:[{label:L(d.course.title),href:'#/course/'+d.course.id},{label:label('review')}]})+`<div class="course-layout"><section class="panel stack min-w-0">${parties(d.buyer,d.student)}${body}<div class="flex-row">${button({label:label('changeLearner'),href:courseLink(d.course.id,'beneficiary',ctx.role==='guardian'?d.student.id:null),variant:'ghost'})}</div></section>${summary(d.course)}</div>`;
}};
const orderData=ctx=>select('checkout.order',{orderId:ctx.params.orderId});
function itemTable(d) {return table([{key:'title_snapshot',label:label('course')},{key:'beneficiary_name',label:label('learner')},{key:'total_baisa',label:label('total'),align:'end',render:i=>`<bdi>${esc(money(i.total_baisa))}</bdi>`}],d.items,{caption:label('items')});}
function attempts(d) {return d.transactions.length?table([{key:'attempt_no',label:label('attempt'),render:x=>`<bdi>${esc(x.attempt_no)}</bdi>`},{key:'provider_ref',label:label('reference'),render:x=>`<bdi class="break-words">${esc(x.provider_ref)}</bdi>`},{key:'state',label:label('status'),render:x=>badge(x.state,{domain:'payment'})}],d.transactions,{caption:label('attempts')}):'';}
function meta(rows) {return `<dl class="grid gap-3 sm:grid-cols-2">${rows.map(([k,v])=>`<div class="min-w-0"><dt class="text-sm muted">${esc(label(k))}</dt><dd class="font-medium break-words">${v}</dd></div>`).join('')}</dl>`;}
const beneficiaryOf=d=>({id:d.items[0].beneficiary_student_id,name:d.items[0].beneficiary_name});
export const provider={render(ctx){
 const d=orderData(ctx),error=denied(d,ctx);if(error)return error;
 const tx=d.transaction,state=d.order.state,replay=tx&&select('checkout.event',{orderId:d.order.id,replay:true});
 let main;
 if(!tx)main=notice({message:label('freeBody'),tone:'success'})+`<div class="flex-row">${button({label:label('result'),href:orderLink(d.order.id,'result')})}</div>`;
 else if(state==='paid')main=notice({title:label('success'),message:label('paidNote'),tone:'success'})+`<div class="flex-row">${button({label:label('result'),href:orderLink(d.order.id,'result')})}</div>`;
 else if(state==='failed')main=notice({title:label('failure'),message:label('failureBody'),tone:'danger'})+`<div class="flex-row">${button({label:label('retry'),action:'checkout.retry'})}</div>`;
 else if(['draft','pending'].includes(state))main=`<form class="stack" data-action="checkout.pay">${formField({id:'payment-outcome',name:'outcome',label:label('outcome'),type:'radio',value:'success',options:['success','pending','failure'].map(value=>({value,label:label(value)})),required:true,hint:label('outcomeHint')})}${submit('pay')}${button({label:label('confirmStay'),action:'checkout.confirmStay',variant:'secondary'})}</form>`;
 else main=notice({title:label('historical'),message:label('historicalBody')});
 const tools=tx?card({title:label('tools'),subtitle:label('toolsBody'),body:`<div class="flex-row">${button({label:label('replay'),action:'checkout.replay',variant:'secondary',disabled:!replay,disabledReason:label('noEvent')})}${button({label:label('tamper'),action:'checkout.tamper',variant:'ghost'})}</div>`}):'';
 const header=`<div class="flex items-start gap-3">${icon('shield',{size:28,className:'text-primary shrink-0'})}<div class="min-w-0"><p class="eyebrow">${esc(label('providerName'))}</p><h2 class="text-lg">${esc(label('provider'))}</h2><p class="muted text-sm mt-1">${esc(label('providerBody'))}</p></div></div>`;
 const info=meta([['orderId',`<bdi>${esc(d.order.id)}</bdi>`],['reference',tx?`<bdi>${esc(tx.provider_ref)}</bdi> · ${esc(label('attempt'))} <bdi>${esc(tx.attempt_no)}</bdi>`:esc(label('noPayment'))],['orderStatus',badge(state,{domain:'order'})],['paymentStatus',tx?badge(tx.state,{domain:'payment'}):esc(label('noPayment'))]]);
 return heading('payment')+`<div class="course-layout"><div class="stack min-w-0"><section class="panel stack border-2 border-dashed min-w-0">${header}${info}${main}</section>${tools}</div><aside class="panel purchase-card stack min-w-0">${parties(d.buyer,beneficiaryOf(d))}${totals(d.order)}</aside></div>`;
}};
const RESULT={success:['checkCircle','success','successBody','success'],failure:['x','failure','failureBody','danger'],pending:['clock','pending','pendingBody','warning'],initiated:['clock','initiated','pendingBody','info']};
export const result={render(ctx){
 // Outcome comes from the stored order/transaction only; query strings such as ?status=success are ignored.
 const d=select('checkout.result',{orderId:ctx.params.orderId}),error=denied(d,ctx);if(error)return error;
 const [iconName,title,message,tone]=RESULT[d.outcome]??['fileText','historical','historicalBody','info'];
 const free=!d.transaction,actions=d.outcome==='success'?d.items.map(i=>goAccess(ctx,i.course_id,i.beneficiary_student_id)).join('')
  :d.outcome==='failure'?button({label:label('retry'),action:'checkout.retry'})
  :d.outcome in RESULT?button({label:label('check'),action:'checkout.check'})+button({label:label('toProvider'),href:orderLink(d.order.id,'provider'),variant:'secondary'}):'';
 const status=`<div class="flex items-start gap-4 rounded-xl p-5 tone-${tone}">${icon(iconName,{size:32,className:'shrink-0'})}<div class="min-w-0"><h2 class="text-xl">${esc(label(title))}</h2><p class="mt-1">${esc(label(free&&d.outcome==='success'?'freeDone':message))}</p></div></div>`;
 const hint=d.outcome==='success'&&ctx.role==='guardian'?`<p class="text-sm muted">${esc(label('switchHint'))}</p>`:'';
 return heading('result')+`<div class="course-layout"><div class="stack min-w-0">${card({className:'stack',body:`${status}${meta([['orderId',`<bdi>${esc(d.order.id)}</bdi>`],['orderStatus',badge(d.order.state,{domain:'order'})]])}${itemTable(d)}${hint}`,actions:actions+button({label:label('receipt'),href:orderLink(d.order.id,'receipt'),variant:'secondary'})})}${free?'':card({title:label('attempts'),body:attempts(d)})}</div><aside class="panel purchase-card stack min-w-0">${parties(d.buyer,beneficiaryOf(d))}${totals(d.order)}</aside></div>`;
}};
export const receipt={render(ctx){
 const d=orderData(ctx),error=denied(d,ctx);if(error)return error;
 const tx=d.transactions.find(x=>x.state==='succeeded')??d.transaction;
 const access=d.order.state==='paid'?d.items.map(i=>goAccess(ctx,i.course_id,i.beneficiary_student_id)).join(''):'';
 return `<article class="print-receipt panel stack min-w-0 max-w-3xl mx-auto print:bg-white print:text-black print:border-0">
<header class="flex items-start justify-between gap-4 flex-wrap"><div class="min-w-0"><p class="eyebrow">${esc(t('brand'))}</p><h1 tabindex="-1" class="mt-1">${esc(label('receipt'))}</h1></div><div class="flex-row"><span class="chip tone-warning">${icon('receipt',{size:14})}<span>${esc(label('demoReceipt'))}</span></span>${badge(d.order.state,{domain:'order'})}</div></header>
${meta([['orderId',`<bdi>${esc(d.order.id)}</bdi>`],['date',`<bdi>${esc(dateTime(d.order.created_at))}</bdi>`],['buyer',esc(L(d.buyer.name))],['reference',tx?`<bdi>${esc(tx.provider_ref)}</bdi>`:esc(label('noPayment'))],['paymentStatus',tx?badge(tx.state,{domain:'payment'}):esc(label('noPayment'))]])}
${itemTable(d)}<section class="ms-auto w-full sm:max-w-sm">${totals(d.order)}</section>
<div class="no-print flex-row border-t border-border pt-4">${button({label:label('print'),action:'checkout.print'})}${access}${button({label:label('result'),href:orderLink(d.order.id,'result'),variant:'secondary'})}</div></article>`;
}};
function report(r){if(!r.ok)showToast(t(r.errorKey),{tone:'error'});return r.ok;}
function send(ctx,{outcome='success',replay=false,tamper=false,redirect=false}={}) {
 const event=select('checkout.event',{orderId:ctx.params.orderId,outcome,replay});if(!event){showToast(label('noEvent'),{tone:'error'});return;}
 // The tampered copy keeps the real event shape but changes the amount; the reducer must reject it untouched.
 const payload=structuredClone(event);if(tamper)payload.payload.amount_baisa+=1000;
 const r=ctx.dispatch('payment.processEvent',payload);
 if(!report(r))return;
 if(redirect)ctx.navigate(orderLink(ctx.params.orderId,'result'));
 else showToast(label(r.data.replayed?'replayed':r.data.settled?'paidNote':'processed'),{tone:'success'});
}
const chosenOutcome=el=>{const value=el?.closest?.('form')?.querySelector('input[name="outcome"]:checked')?.value;return ['success','pending','failure'].includes(value)?value:'success';};
export function registerActions(register){register('checkout',{
 choose:(event,el,ctx)=>{if(event.type!=='submit')return;const sid=ctx.role==='student'?ctx.actor.record_id:new FormData(el).get('student');const d=select('checkout.context',{courseId:ctx.params.courseId,studentId:sid||undefined});
  if(d.status!=='ok'||!d.student){showToast(label('chooseStudent'),{tone:'error'});return;}
  // An existing entitlement blocks the purchase; show the beneficiary page with its Go to course recovery.
  ctx.navigate(courseLink(ctx.params.courseId,d.hasAccess?'beneficiary':'review',ctx.role==='guardian'?sid:null));},
 confirm:(event,el,ctx)=>{if(event.type!=='submit')return;const d=context(ctx);if(d.status!=='ok'||!d.student)return;const free=d.course.price_type==='free',r=ctx.dispatch(free?'checkout.activateFree':'checkout.createOrder',{courseId:d.course.id,studentId:d.student.id,consent:new FormData(el).get('consent')});if(report(r))ctx.navigate(orderLink(r.data.orderId,free?'result':'provider'));},
 pay:(event,el,ctx)=>{if(event.type==='submit')send(ctx,{outcome:chosenOutcome(el.querySelector('input')),redirect:true});},
 replay:(_e,_el,ctx)=>send(ctx,{replay:true}),
 confirmStay:(_e,el,ctx)=>send(ctx,{outcome:chosenOutcome(el)}),
 tamper:(_e,_el,ctx)=>send(ctx,{tamper:true}),
 retry:(_e,_el,ctx)=>{const r=ctx.dispatch('payment.retry',{orderId:ctx.params.orderId});if(report(r))ctx.navigate(orderLink(ctx.params.orderId,'provider'));},
 check:(_e,_el,ctx)=>{ctx.navigate(orderLink(ctx.params.orderId,'result'));showToast(label('checked'));},
 print:()=>window.print()
});}
