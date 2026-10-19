import { t, L, esc, money, dateTime } from '../core/i18n.js';
import { select } from '../core/store.js';
import { courseCard, teacherCard, button, avatar, badge, breadcrumb, emptyState, filterBar, formField, lessonRow, modal, notice, pageHeader, pagination, tabs, showToast, simulatedPlayer, togglePlayer, toggleCaptions, mountPlayer } from '../core/ui.js';
import { icon } from '../core/icons.js';
import { courseCover } from '../core/media.js';
import { mountCharts } from '../core/charts.js';

// Public marketplace views (SPEC §5 "Public"). Every list reads public selectors only:
// Published courses of active approved teachers, published snapshots, outline metadata for locked lessons.
const CYCLE_COLORS = ['#0F766E', '#B7834A', '#5B8FA8'];
const sectionHeader = (id, title, subtitle, href) => `<header class="section-header"><div class="min-w-0"><h2 id="${id}">${esc(title)}</h2><p class="muted mt-2">${esc(subtitle)}</p></div>${href ? button({ label: t('all'), href, variant: 'ghost' }) : ''}</header>`;

function hero(courses, cycles, curricula) {
  const banner = select('homeBanner');
  const [first, second] = courses;
  const stats = [
    [select('publishedCatalog').length, t('home.statCourses')],
    [select('featuredTeachers', { withCourses: true }).length, t('home.statTeachers')],
    [select('grades').length, t('home.statGrades')],
  ];
  return `<section class="hero" aria-labelledby="home-title">
  <div class="container hero-grid">
    <div class="min-w-0">
      ${banner ? `<p class="hero-banner">${icon('graduationCap', { size: 16 })}<span>${esc(L(banner.title))}</span></p>` : ''}
      <h1 id="home-title" tabindex="-1" class="hero-title">${esc(t('home.headline'))}</h1>
      <p class="hero-intro">${esc(t('home.intro'))}</p>
      ${banner ? `<p class="text-sm muted mt-3">${esc(L(banner.body))}</p>` : ''}
      <div class="grade-picker" role="group" aria-labelledby="grade-picker-title">
        <div class="flex items-center gap-2"><span class="text-primary">${icon('search', { size: 20 })}</span><h2 id="grade-picker-title" class="text-lg">${esc(t('home.grade'))}</h2></div>
        <p class="text-sm muted mt-1">${esc(t('home.gradeHint'))}</p>
        ${curricula.length > 1 ? `<label class="block mt-4 text-sm font-medium" for="home-curriculum">${esc(t('home.curriculum'))}</label><select id="home-curriculum" class="field mt-1" data-action="public.curriculum">${curricula.map(c => `<option value="${esc(c.id)}">${esc(L(c.name))}</option>`).join('')}</select>` : ''}
        <div class="cycle-groups">${cycles.map((cycle, index) => `<div class="min-w-0"><h3 class="cycle-label"><span class="cycle-dot" style="background:${CYCLE_COLORS[index]}"></span>${esc(L(cycle.label))}</h3><nav class="grade-links" aria-label="${esc(L(cycle.label))}">${cycle.grades.map(g => `<a href="#/explore/grade/${encodeURIComponent(g.id)}" aria-label="${esc(L(g.name))}" title="${esc(L(g.name))}"><bdi>${g.number}</bdi></a>`).join('')}</nav></div>`).join('')}</div>
      </div>
      <dl class="hero-stats">${stats.map(([value, label]) => `<div><dt class="sr-only">${esc(label)}</dt><dd><strong><bdi>${value}</bdi></strong><span>${esc(label)}</span></dd></div>`).join('')}</dl>
    </div>
    <div class="collage" aria-hidden="true">
      ${first ? `<div class="collage-card collage-main"><img class="cover" src="${courseCover(first.id, first.subject.id)}" alt=""><div class="p-3"><p class="text-xs text-primary font-semibold">${esc(L(first.grade.name))} · ${esc(L(first.subject.name))}</p><p class="font-semibold mt-1 clamp-2">${esc(L(first.title))}</p></div></div>` : ''}
      ${second ? `<div class="collage-card collage-side"><img class="cover" src="${courseCover(second.id, second.subject.id)}" alt=""><div class="p-3"><p class="font-semibold text-sm clamp-2">${esc(L(second.title))}</p></div></div>` : ''}
      <div class="collage-note collage-note-top">${icon('play', { size: 18 })}<span>${esc(t('home.collageLesson'))}</span></div>
      <div class="collage-note collage-note-bottom"><span class="collage-note-icon">${icon('calendar', { size: 18 })}</span><span><strong class="block text-sm">${esc(t('home.collage'))}</strong><span class="block text-xs muted">${esc(t('home.collageLive'))}</span></span></div>
    </div>
  </div>
</section>`;
}

function subjectsSection(courses) {
  return `<section class="container section" aria-labelledby="home-subjects">
  ${sectionHeader('home-subjects', t('home.subjects'), t('home.subjectsSub'), '#/explore?tab=subjects')}
  <ul class="subject-grid">${select('subjects').map(s => {
    const n = courses.filter(c => c.subject.id === s.id).length;
    return `<li><a href="#/explore?tab=courses&amp;subject=${encodeURIComponent(s.id)}" class="subject-tile card-link"><span class="subject-icon" style="color:${esc(s.color)};background:color-mix(in srgb, ${esc(s.color)} 14%, transparent)">${icon(s.icon, { size: 24 })}</span><span class="min-w-0"><span class="block font-semibold">${esc(L(s.name))}</span><span class="block text-xs muted mt-1">${esc(n ? t('home.subjectCourses', { count: n }) : t('home.subjectSoon'))}</span></span></a></li>`;
  }).join('')}</ul>
</section>`;
}

function howSection(cycles) {
  return `<section class="container section" aria-labelledby="home-how">
  <div class="grid gap-8 lg:grid-cols-[1.1fr_1fr] items-start">
    <div class="min-w-0">
      <p class="eyebrow">${esc(t('home.howEyebrow'))}</p>
      <h2 id="home-how" class="mt-1 mb-6">${esc(t('home.how'))}</h2>
      <ol class="steps">${[1, 2, 3, 4].map(n => `<li class="step"><span class="step-number"><bdi>${n}</bdi></span><div class="min-w-0"><h3>${esc(t('home.step' + n))}</h3><p class="muted mt-1">${esc(t('home.step' + n + 'body'))}</p></div></li>`).join('')}</ol>
    </div>
    <figure class="panel min-w-0" aria-labelledby="cycle-chart-title">
      <p class="eyebrow">${esc(t('home.chartEyebrow'))}</p>
      <h2 id="cycle-chart-title" class="mt-1 text-xl">${esc(t('home.chart'))}</h2>
      <p class="muted text-sm mt-1">${esc(t('home.chartSub'))}</p>
      <div class="chart-box mt-5"><canvas data-chart="cycles" role="img" aria-label="${esc(t('home.chartSub'))}" aria-describedby="cycle-summary"></canvas></div>
      <figcaption class="mt-4"><p class="sr-only">${esc(t('home.chartFallback'))}</p><ul id="cycle-summary" class="cycle-summary">${cycles.map((c, i) => `<li><span class="cycle-dot" style="background:${CYCLE_COLORS[i]}"></span><span class="flex-1 min-w-0">${esc(L(c.label))}</span><strong><bdi>${c.course_count}</bdi></strong></li>`).join('')}</ul></figcaption>
    </figure>
  </div>
</section>`;
}

export const home = {
  render() {
    const courses = select('featuredCourses', { limit: 4 });
    const catalog = select('publishedCatalog');
    const teachers = select('featuredTeachers', { withCourses: true, limit: 3 });
    const cycles = select('cycles');
    const curricula = select('curricula');
    return `${hero(courses, cycles, curricula)}
${subjectsSection(catalog)}
<section class="band" aria-labelledby="home-courses"><div class="container section">
  ${sectionHeader('home-courses', t('home.courses'), t('home.coursesSub'), '#/explore?tab=courses')}
  <div class="grid-cards">${courses.map(c => courseCard(c)).join('')}</div>
</div></section>
<section class="container section" aria-labelledby="home-teachers">
  ${sectionHeader('home-teachers', t('home.teachers'), t('home.teachersSub'), '#/teachers')}
  <div class="grid-cards grid-three">${teachers.map(teacher => teacherCard(teacher)).join('')}</div>
</section>
${howSection(cycles)}
<section class="container section pt-0" aria-labelledby="home-cta">
  <div class="cta-band">
    <div class="min-w-0"><p class="eyebrow cta-eyebrow">${esc(t('home.ctaEyebrow'))}</p><h2 id="home-cta" class="mt-1">${esc(t('home.cta'))}</h2><p class="mt-3 cta-body">${esc(t('home.ctabody'))}</p></div>
    <div class="flex-row">${button({ label: t('become'), href: '#/become-teacher' })}${button({ label: t('explore'), href: '#/explore', variant: 'secondary' })}</div>
  </div>
</section>`;
  },
  mount(root, ctx) {
    const cycles = select('cycles');
    return mountCharts(root, {
      cycles: {
        type: 'bar',
        data: {
          labels: cycles.map(c => L(c.label)),
          datasets: [{ label: t('home.chartSub'), data: cycles.map(c => c.course_count), backgroundColor: CYCLE_COLORS, borderRadius: 10, maxBarThickness: 56 }],
        },
      },
    }, ctx);
  },
};

export function registerActions(register) {
  register('public', {
    filter: (event,el,ctx)=>{if(event.type!=='submit')return;const values=Object.fromEntries(new FormData(el));ctx.navigate(url(ctx,{...values,page:null}));},
    resetFilters: (_e,_el,ctx)=>ctx.navigate('#'+ctx.path+(ctx.query.has('tab')?'?tab='+encodeURIComponent(ctx.query.get('tab')):'')),
    page: (_e,el,ctx)=>ctx.navigate(url(ctx,{page:el.dataset.page})),
    enroll: (_e,el,ctx)=>{const r=ctx.dispatch('enrollment.enrollFree',{courseId:el.dataset.id});showToast(r.ok?label('enrolled'):t(r.errorKey),{tone:r.ok?'success':'error'});},
    play: (_e,el)=>togglePlayer(el),
    captions: (_e,el)=>toggleCaptions(el),
    contact: (event,el,ctx)=>{if(event.type!=='submit')return;const values=Object.fromEntries(new FormData(el)),r=ctx.dispatch('support.createTicket',values);if(!r.ok)ctx.dispatch('form.save',{form:'contact',values,fieldErrors:r.fieldErrors});},
    // Only rendered when more than one curriculum is active (SPEC §5 `/`).
    curriculum: (event, element, ctx) => { if (event.type === 'change') ctx.navigate('#/explore?curriculum=' + encodeURIComponent(element.value)); },
  });
}

const label = key => t('p2.' + key);
const para = value => `<p class="muted leading-relaxed">${esc(value)}</p>`;
const missing = () => pageHeader({title:t('notFound')}) + emptyState({title:label('missing'),description:label('missingBody'),action:{label:t('explore'),href:'#/explore'}});
function url(ctx, changes={}, path=ctx.path) { const q=new URLSearchParams(ctx.query);for(const [k,v] of Object.entries(changes)) { if(v==null||v==='')q.delete(k);else q.set(k,v); }return '#'+path+(q.size?'?'+q:''); }
function navTabs(ctx,items,active) { return tabs(items.map(id=>({id,label:label(id),href:url(ctx,{tab:id,page:null})})),active,{label:label('sections')}); }
function cards(courses,cardOptions=null) { return courses.length?`<div class="grid-cards">${courses.map(c=>courseCard(c,cardOptions?.(c)??{})).join('')}</div>`:emptyState({title:label('empty'),description:label('emptyBody'),action:{label:t('resetFilters'),action:'public.resetFilters'}}); }
function fields() {
 const f=select('catalog.facets'),opts=rows=>[{value:'',label:t('all')},...rows.map(x=>({value:x.id,label:L(x.name)}))];
 return [{name:'q',label:label('search')},...Object.entries({curriculum:f.curricula,year:f.years,grade:select('grades'),subject:select('subjects'),teacher:f.teachers,semester:f.semesters}).map(([name,rows])=>({name,label:label(name),type:'select',options:opts(rows)})),...Object.entries({language:['ar','en'],mode:f.modes,price:['free','paid'],availability:['preview','live']}).map(([name,values])=>({name,label:label(name),type:'select',options:[{value:'',label:t('all')},...values.map(value=>({value,label:label(value)}))]})),{name:'max',label:label('max'),type:'number',min:0,step:1000}];
}
// Shared catalog body (filters, count, cards, pagination); student and guardian portals reuse it inside their shell.
// Optional cardOptions(course) supplies courseCard options, e.g. the guardian's buy-for-child CTA.
export function results(ctx, fixed={}, cardOptions=null) {
 const values={...Object.fromEntries(ctx.query),...fixed},rows=select('catalog.search',values),page=Math.max(1,Math.min(Math.ceil(rows.length/6)||1,Number.parseInt(ctx.query.get('page'),10)||1));
 return `<div class="catalog-layout"><aside class="min-w-0">${filterBar(fields().filter(f=>!Object.hasOwn(fixed,f.name)),values)}</aside><section class="min-w-0 stack">${para(t('results',{count:rows.length}))}${cards(rows.slice((page-1)*6,page*6),cardOptions)}${pagination({page,total:rows.length,pageSize:6})}</section></div>`;
}
export const explore={render(ctx) {
 const active=ctx.query.get('tab')||'grades',rows=select('catalog.search',Object.fromEntries(ctx.query));
 let browse='';
 if(active==='grades')browse=`<div class="subject-grid">${select('grades').map(g=>`<a class="panel card-link" href="#/explore/grade/${esc(g.id)}"><h2>${esc(L(g.name))}</h2>${para(t('results',{count:rows.filter(c=>c.grade.id===g.id).length}))}</a>`).join('')}</div>`;
 if(active==='subjects')browse=`<div class="subject-grid">${select('subjects').map(s=>`<a class="panel card-link" href="${esc(url(ctx,{tab:'courses',subject:s.id,page:null}))}"><h2>${esc(L(s.name))}</h2>${para(t('results',{count:rows.filter(c=>c.subject.id===s.id).length}))}</a>`).join('')}</div>`;
 return pageHeader({title:t('explore'),subtitle:label('catalogIntro'),actions:button({label:t('teachers'),href:'#/teachers',variant:'secondary'})})+navTabs(ctx,['grades','subjects','courses'],active)+browse+results(ctx);
}};
export const grade={render(ctx) {const g=select('gradeLanding',{gradeId:ctx.params.gradeId});if(!g)return missing();return pageHeader({title:L(g.grade.name),subtitle:label('catalogIntro')})+`<div class="subject-grid mb-8">${g.subjects.map(s=>`<a class="panel card-link" href="#/explore/grade/${esc(g.grade.id)}/subject/${esc(s.id)}"><h2>${esc(L(s.display_name))}</h2>${para(t('results',{count:s.course_count}))}</a>`).join('')}</div>`+cards(g.courses);}};
export const subject={render(ctx) {const pair=select('gradeSubject',ctx.params);if(!pair)return missing();return pageHeader({title:L(pair.display_name),subtitle:L(pair.grade.name),breadcrumbs:[{label:t('explore'),href:'#/explore'},{label:L(pair.grade.name),href:'#/explore/grade/'+pair.grade.id}]})+results(ctx,{grade:pair.grade_id,subject:pair.subject_id});}};
function purchase(c,ctx) {
 const viewer=select('course.viewer',{id:c.id});
 if(viewer.active)return button({label:label('goCourse'),href:'#/student/course/'+c.id});
 const target='#/checkout/'+c.id+'/beneficiary';
 const href=ctx.role==='visitor'?'#/auth/sign-in?return='+encodeURIComponent(target):'#/checkout/'+c.id+'/beneficiary';
 return button({label:label(c.price_type==='free'?'enroll':'buy'),href});
}
function outline(c,ctx) {return c.modules.map(m=>`<details class="panel" open><summary class="font-semibold">${esc(L(m.title))}</summary><ul>${m.lessons.map(l=>lessonRow(l,{locked:!l.preview,preview:l.preview,href:url(ctx,{tab:'preview',lesson:l.id})})).join('')}</ul></details>`).join('');}
export const course={render(ctx) {
 const c=select('course.public',{id:ctx.params.id});if(!c)return missing();const active=ctx.query.get('tab')||'overview',lessons=c.modules.flatMap(m=>m.lessons),sample=lessons.find(l=>l.id===ctx.query.get('lesson'))??lessons.find(l=>l.preview),viewer=select('course.viewer',{id:c.id});
 let body='';
 if(active==='overview')body=para(L(c.description))+`<h2>${esc(label('prerequisites'))}</h2>`+para(L(c.prerequisites))+teacherCard(c.teacher);
 if(active==='outcomes')body=para(L(c.outcomes));
 if(active==='syllabus')body=outline(c,ctx);
 if(active==='preview')body=sample?.preview?`${notice({message:label('simulated')})}${simulatedPlayer({title:L(sample.title),caption:L(sample.transcript)||L(sample.body),transcript:L(sample.transcript)||L(sample.body)})}${outline(c,ctx)}`:notice({message:label('lockedBody')})+outline(c,ctx);
 if(active==='schedule')body=para(label(c.mode))+para(t('footer.demoDate'))+(c.live_sessions.length?c.live_sessions.map(s=>`<article class="panel"><h2>${esc(L(s.title))}</h2>${badge(s.status,{domain:'live'})}<p><bdi>${esc(dateTime(s.starts_at))} — ${esc(dateTime(s.ends_at))}</bdi></p></article>`).join(''):notice({message:label('noLive')}));
 if(active==='access')body=notice({message:label('accessBody')})+para(dateTime(c.access_policy.end_at))+button({label:t('refunds'),href:'#/legal/refunds',variant:'secondary'});
 if(active==='reviews')body=notice({message:label('reviewsBody')});
 return `<div class="course-hero panel"><div><p class="eyebrow">${esc(L(c.grade.name))} · ${esc(L(c.subject.name))}</p>${pageHeader({title:L(c.title),subtitle:L(c.summary)})}<a class="flex-row" href="#/teacher/${esc(c.teacher.id)}">${avatar(c.teacher)}${esc(L(c.teacher.name))}</a><div class="flex-row mt-4"><span class="chip">${esc(label(c.mode))}</span><span class="chip">${esc(t('duration',{count:Math.round(lessons.reduce((n,l)=>n+l.duration_seconds,0)/60)}))}</span></div></div><img class="cover rounded-xl" src="${courseCover(c.id,c.subject.id)}" alt=""></div><div class="course-layout"><section class="min-w-0">${navTabs(ctx,['overview','outcomes','syllabus','preview','schedule','access','reviews'],active)}<div class="stack panel">${body}</div></section><aside class="panel purchase-card stack"><p class="text-3xl font-bold"><bdi>${esc(c.price_type==='free'?t('free'):money(c.price_baisa))}</bdi></p>${purchase(c,ctx)}${para(label('accessBody'))}<p><bdi>${esc(dateTime(c.access_policy.end_at))}</bdi></p>${viewer.lapsed?notice({message:label('lapsed')}):''}${button({label:t('refunds'),href:'#/legal/refunds',variant:'ghost'})}</aside></div><div class="mobile-purchase"><bdi>${esc(c.price_type==='free'?t('free'):money(c.price_baisa))}</bdi>${purchase(c,ctx)}</div>`;
},mount(root) { return mountPlayer(root); }};
export const teachers={render(ctx){const rows=select('teacherDirectory',Object.fromEntries(ctx.query));return pageHeader({title:t('teachers'),subtitle:label('teacherIntro')})+filterBar(fields().filter(f=>['grade','subject'].includes(f.name)),Object.fromEntries(ctx.query))+`<div class="grid-cards mt-6">${rows.map(x=>teacherCard(x)).join('')}</div>`+(rows.length?'':emptyState({title:label('empty')}));}};
export const teacher={render(ctx){const x=select('teacher.public',{id:ctx.params.id});if(!x)return missing();const active=ctx.query.get('tab')||'about';return pageHeader({title:L(x.name),subtitle:label('teacherIntro')})+navTabs(ctx,['about','courses'],active)+(active==='about'?teacherCard(x)+`<div class="panel mt-6">${para(L(x.bio))}${x.credentials.map(c=>`<p>${esc(L(c.label))}</p>`).join('')}</div>`:cards(x.courses));}};
export const become={render(){return pageHeader({title:t('become'),subtitle:label('becomeIntro')})+`<div class="grid-cards">${['benefits','process','checklist'].map(k=>`<section class="panel stack"><h2>${esc(label(k))}</h2>${para(label(k+'Body'))}</section>`).join('')}</div><div class="cta-band mt-8"><h2>${esc(label('applyTitle'))}</h2>${button({label:label('applyTitle'),href:'#/auth/teacher-application'})}</div>`;}};
function cms(slug){const p=select('cmsPage',{slug});if(!p)return missing();return pageHeader({title:L(p.title),subtitle:L(p.body)})+`<div class="stack">${p.sections.map(s=>`<section class="panel"><h2>${esc(L(s.title))}</h2>${para(L(s.body))}</section>`).join('')}</div>`;}
export const about={render:()=>cms('about')};
export const legal={render(ctx){const p=ctx.params.page;if(!['privacy','terms','refunds'].includes(p))return missing();return cms(p)+notice({message:label('policyNotice'),tone:'warning'})+`<section class="panel stack mt-6"><h2>${esc(label(p+'Title'))}</h2>${para(label(p+'Body'))}${button({label:t('help'),href:'#/help?tab=contact',variant:'secondary'})}</section>`;}};
export const help={render(ctx){const active=ctx.query.get('tab')||'faq',form=select('form',{name:'contact'});let body;
 if(active==='faq'){const rows=select('faqs',{q:ctx.query.get('q')});body=`<form data-action="public.filter" class="stack">${formField({id:'faq-query',name:'q',label:label('search'),value:ctx.query.get('q')??''})}<button class="btn btn-primary" type="submit">${esc(label('search'))}</button></form><div class="stack mt-6">${rows.map(f=>`<details class="panel"><summary>${esc(L(f.title))}</summary>${para(L(f.body))}</details>`).join('')||emptyState({title:label('empty')})}</div>`;}
 else if(form.done)body=notice({message:label(form.ticketId?'ticketDone':'anonymousDone')+(form.ticketId?' · '+form.ticketId:''),tone:'success'});
 else body=`<form data-action="public.contact" class="panel stack" novalidate>${[{name:'email',type:'email'},{name:'topic',type:'select',options:['account','course','payment','other'].map(value=>({value,label:label(value)}))},{name:'subject'},{name:'body',type:'textarea'}].map(f=>formField({...f,id:'contact-'+f.name,label:label(f.name),value:form.values[f.name]??'',error:form.fieldErrors[f.name]?t(form.fieldErrors[f.name]):'',required:true})).join('')}<button type="submit" class="btn btn-primary">${esc(label('send'))}</button></form>`;
 return pageHeader({title:t('help'),subtitle:label('helpIntro')})+navTabs(ctx,['faq','contact'],active)+body;
}};
