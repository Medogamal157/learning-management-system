export function mountCharts(root,configs,ctx) {
 const instances=[];const Chart=globalThis.Chart;if(!Chart)return ()=>{};
 const lang=document.documentElement.lang,dark=document.documentElement.classList.contains('dark');
 const color=getComputedStyle(document.documentElement).getPropertyValue('--muted').trim();
 try { for(const canvas of root.querySelectorAll('canvas[data-chart]')) { const config=configs[canvas.dataset.chart];if(!config)continue;const base=typeof config==='function'?config(ctx):config;instances.push(new Chart(canvas,{...base,options:{responsive:true,maintainAspectRatio:false,locale:lang==='ar'?'ar-OM':'en-OM',animation:matchMedia('(prefers-reduced-motion: reduce)').matches?false:{duration:300},color, ...base.options,plugins:{...base.options?.plugins,legend:{display:false,labels:{color,font:{family:'IBM Plex Sans Arabic'}},...base.options?.plugins?.legend},tooltip:{rtl:lang==='ar',textDirection:lang==='ar'?'rtl':'ltr',...base.options?.plugins?.tooltip}},scales:base.type==='doughnut'?{}:{x:{ticks:{color,font:{family:'IBM Plex Sans Arabic'}},grid:{display:false}},y:{beginAtZero:true,ticks:{color,precision:0},grid:{color:dark?'#38504D':'#D6E2DE'}},...base.options?.scales}}}));} }catch{instances.forEach(c=>c.destroy());instances.length=0;}
 return ()=>{instances.forEach(c=>c.destroy());instances.length=0;};
}
