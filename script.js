(() => {

  const btn = document.getElementById('menuButton');
  const links = document.getElementById('navLinks');
  function closeMenu(){links.classList.remove('open'); btn.setAttribute('aria-expanded','false'); btn.setAttribute('aria-label','Abrir menu');}
  btn.addEventListener('click', () => { const open = links.classList.toggle('open'); btn.setAttribute('aria-expanded',String(open)); btn.setAttribute('aria-label',open?'Fechar menu':'Abrir menu'); });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => {if(e.key==='Escape') closeMenu();});

  const navLinks = Array.from(document.querySelectorAll('[data-nav]'));
  const sections = ['inicio','sobre','portfolio','contato'].map(id => document.getElementById(id));
  const navObserver = new IntersectionObserver(entries => {
    const nearest = entries.filter(e => e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(nearest){ navLinks.forEach(a=>a.classList.toggle('active',a.dataset.nav === nearest.target.id)); }
  },{rootMargin:'-18% 0px -55% 0px',threshold:[0,.01,.1,.3]});
  sections.forEach(s=>s && navObserver.observe(s));

  const filterButtons = document.querySelectorAll('[data-filter]');
  const cards = Array.from(document.querySelectorAll('.project-card'));
  function applyFilter(key){
    filterButtons.forEach(b=>{const active=b.dataset.filter===key; b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active));});
    cards.forEach(card=>{
      const show=key==='all'||card.dataset.category===key;
      card.hidden=!show;
      card.classList.remove('filter-enter');
      if(show){
        card.classList.add('is-visible');
        void card.offsetWidth;
        card.classList.add('filter-enter');
      }
    });
  }
  filterButtons.forEach(button=>button.addEventListener('click',()=>applyFilter(button.dataset.filter)));
  document.querySelectorAll('[data-quick-filter]').forEach(a=>a.addEventListener('click',()=>applyFilter(a.dataset.quickFilter)));

  const modal = document.getElementById('projectModal');
  const art = document.getElementById('modalArt');
  const link = document.getElementById('modalLink');
  function openProject(card){
    document.getElementById('modalTitle').textContent = card.dataset.title;
    document.getElementById('modalKind').textContent = card.dataset.kind;
    document.getElementById('modalInfo').textContent = card.dataset.info;
    art.replaceChildren();
    const visual=card.querySelector('.project-media').cloneNode(true);
    visual.querySelector('.project-badge')?.remove();
    art.appendChild(visual);
    if(card.dataset.link){link.hidden=false;link.href=card.dataset.link;}else{link.hidden=true;link.removeAttribute('href');}
    document.body.classList.add('modal-open'); modal.showModal();
  }
  function closeProject(){if(modal.open) modal.close(); document.body.classList.remove('modal-open');}
  cards.forEach(card=>{card.querySelector('button.details-btn').addEventListener('click',()=>openProject(card));card.addEventListener('click', e=>{if(e.target.closest('button,a'))return;openProject(card);});card.setAttribute('tabindex','0');card.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target===card){e.preventDefault();openProject(card);}});});
  document.getElementById('modalClose').addEventListener('click',closeProject);
  document.getElementById('modalBack').addEventListener('click',closeProject);
  modal.addEventListener('click',e=>{if(e.target===modal)closeProject();});
  modal.addEventListener('close',()=>document.body.classList.remove('modal-open'));

  document.getElementById('contactForm').addEventListener('submit',e=>{
    e.preventDefault(); const form = e.currentTarget; if(!form.reportValidity()) return;
    const name=form.elements.name.value.trim(), service=form.elements.service.value, details=form.elements.details.value.trim();
    if(!name || !service || !details) return;
    const msg=`Olá, Pedro! Meu nome é ${name}.\n\nTenho interesse em: ${service}.\n\nSobre meu projeto:\n${details}\n\nVi seu portfólio e gostaria de conversar.`;
    window.open(`https://wa.me/5561993148848?text=${encodeURIComponent(msg)}`,'_blank','noopener,noreferrer');
  });
})();
