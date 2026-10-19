import { t, L, esc } from '../core/i18n.js';
import { select } from '../core/store.js';
import { courseCard, teacherCard, button } from '../core/ui.js';
import { icon } from '../core/icons.js';
import { courseCover } from '../core/media.js';
import { mountCharts } from '../core/charts.js';

// P1 delivers only the home view; the remaining public routes resolve to the router's phase placeholder until P2.
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
    // Only rendered when more than one curriculum is active (SPEC §5 `/`).
    curriculum: (event, element, ctx) => { if (event.type === 'change') ctx.navigate('#/explore?curriculum=' + encodeURIComponent(element.value)); },
  });
}
