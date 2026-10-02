document.addEventListener('DOMContentLoaded',()=>{
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;e.target.classList.add('show');
  if(e.target.dataset.to){const el=e.target,to=+el.dataset.to,t0=performance.now();(function f(t){const p=Math.min((t-t0)/1500,1);el.textContent=Math.floor(to*p).toLocaleString()+(el.dataset.s||'');if(p<1)requestAnimationFrame(f)})(t0)}
  io.unobserve(e.target)}),{threshold:.2});
 document.querySelectorAll('.rv,[data-to]').forEach(el=>io.observe(el));
 const g=document.getElementById('go');if(g)g.onclick=()=>location.href='listing.html';
});