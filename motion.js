/* PK.WEB Motion V10: queda visível depois da intro, fita/gancho sincronizados, estilingue preservado. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;
  const intro = document.querySelector('#intro');
  const skip = document.querySelector('#introSkip');
  let revealed = false;
  let startDrop = () => {};
  if (!reduced) body.classList.add('motion-wait');

  function reveal() {
    if (revealed) return;
    revealed = true;
    // A cortina leva 950ms para subir. Só depois a queda começa,
    // assim o crachá não cai escondido atrás da tela preta.
    setTimeout(() => {
      body.classList.remove('motion-wait');
      body.classList.add('motion-active');
      startDrop();
    }, 1020);
    if (intro) {
      intro.classList.add('intro-exit');
      intro.addEventListener('transitionend', e => { if (e.target === intro) intro.classList.add('intro-done'); }, {once:true});
      setTimeout(()=>intro.classList.add('intro-done'), 1350);
    }
  }
  if (reduced) { intro?.classList.add('intro-done'); revealed=true; } else {
    const introTimer = setTimeout(reveal, 2580);
    skip?.addEventListener('click', () => {clearTimeout(introTimer); reveal();});
    // Avoid locking the site in case the page is restored from bfcache.
    window.addEventListener('pageshow', e => { if(e.persisted) reveal(); });
  }

  // A self-contained canvas overlay with sparse particles near grid intersections.
  // Scroll velocity adds sway; both DPR and frame-rate are capped to protect mobile GPUs.
  const canvas = document.getElementById('ambientDots');
  if (canvas && !reduced) {
    const ctx = canvas.getContext('2d', { alpha:true });
    if (ctx) {
      let w=0,h=0,dpr=1,cols=0,rows=0,scrollForce=0,lastScroll=window.scrollY,frame=0,visible=true;
      const resize=()=>{
        w=innerWidth; h=innerHeight;
        dpr=Math.min(devicePixelRatio||1,1.5);
        canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
        canvas.style.width=w+'px';canvas.style.height=h+'px';
        ctx.setTransform(dpr,0,0,dpr,0,0);
        cols=Math.ceil(w/(w<640?54:61))+2;rows=Math.ceil(h/(w<640?54:61))+2;
      };
      const onScroll=()=>{const dy=window.scrollY-lastScroll;lastScroll=window.scrollY;scrollForce=Math.max(-18,Math.min(18,scrollForce+dy*.23));};
      addEventListener('resize',resize,{passive:true});addEventListener('scroll',onScroll,{passive:true});
      document.addEventListener('visibilitychange',()=>{visible=!document.hidden;});resize();
      let last=0;
      const draw=now=>{
        requestAnimationFrame(draw);
        if(!visible||now-last<32) return;
        last=now;frame++;
        scrollForce*=.92;
        ctx.clearRect(0,0,w,h);
        const gap=w<640?54:61,t=now*.001,impact=Math.abs(scrollForce);
        const amplitude=1.15+impact*.32;
        for(let row=0;row<rows;row++){
          for(let col=0;col<cols;col++){
            const x=col*gap+(Math.sin(t*.62+col*.89+row*.34)*amplitude),
                  y=row*gap+(Math.cos(t*.48+col*.35+row*.73)*amplitude + scrollForce*.24);
            let alpha=.12 + Math.abs(Math.sin(t*.65+row*.45+col*.8))*.09+Math.min(impact*.009,.13);
            const size=(col%3===0&&row%3===0)?1.5:0.9;
            ctx.beginPath();ctx.arc(x,y,size,0,Math.PI*2);
            ctx.fillStyle='rgba(215,217,218,'+alpha.toFixed(3)+')';ctx.fill();
            if(impact>3 && col%5===0 && row%3===0){
              ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+scrollForce*.45,y+Math.sin(t+col)*3);
              ctx.strokeStyle='rgba(244,235,0,'+Math.min(.13,impact*.005)+')';ctx.lineWidth=.75;ctx.stroke();
            }
          }
        }
      };
      requestAnimationFrame(draw);
    }
  }

  // Bidirectional reveal: elements fade IN as they enter the viewport, fade OUT
  // as they leave. Unlike a one-shot observer, they reveal again when scrolling back.
  // Native scrolling remains untouched so momentum on mobile stays smooth.
  const revealTargets = [
    ...document.querySelectorAll('.hero-copy, .badge-scene, .about .section-kicker, .about .about-copy, .about .about-aside, .specialty, .portfolio .section-kicker, .portfolio .section-title, .portfolio .section-sub, .filter-tabs, .project-card, .portfolio-note, .contact .section-kicker, .contact .section-title, .contact .section-sub, .contact-info, .contact-form')
  ];
  if (!reduced && 'IntersectionObserver' in window) {
    for (let i=0;i<revealTargets.length;i++) {
      const el=revealTargets[i];
      el.classList.add('motion-reveal');
      el.style.setProperty('--reveal-delay', el.closest('.project-grid') ? ((i % 3) * 40)+'ms' : '0ms');
    }
    // Only enable hidden states after installing the observer, to avoid a blank
    // page if a browser lacks observer support or JS is interrupted.
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.target.hidden) continue;
        e.target.classList.toggle('is-visible',e.isIntersecting && e.intersectionRatio>0);
      }
    }, {threshold:[0,.015,.07],rootMargin:'-7% 0px -8% 0px'});
    revealTargets.forEach(e=>io.observe(e));
    document.body.classList.add('motion-ready');
    window.addEventListener('pageshow',()=>{
      revealTargets.forEach(el=>{if(el.getBoundingClientRect().bottom>0&&el.getBoundingClientRect().top<innerHeight){el.classList.add('is-visible');}});
    });
  }


  // V5 - Simulação de segunda ordem, resolução independente. Uma mesma geometria liga
  // fita -> argola -> mosquetão -> furo do crachá a cada frame.
  const scene=document.getElementById('badgeScene');
  const card=document.getElementById('physicsCard');
  const turn=document.getElementById('badge3d');
  const svg=document.getElementById('strapSvg');
    if(!scene||!card||!turn||!svg)return;
  const paths=['strapEdge','strapFabric','strapHighlight','strapPath'].map(id=>document.getElementById(id));
  const hardware=document.getElementById('hardware');
  const fabric=document.getElementById('strapFabric');
  const edge=document.getElementById('strapEdge');
  const ink=document.getElementById('strapInk');
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const s={x:0,y:0,vx:0,vy:0,angle:0,va:0,flip:0,vflip:0,flipGoal:null,flipUntil:0,active:false,falling:false,drag:false,
    pointerId:null,grabX:0,grabY:0,dragMoved:false,startPointerX:0,startPointerY:0,
    inputVx:0,inputVy:0,prevPointerTime:0,lastTime:0};
  let w=0,h=0,cw=0,ch=0,restY=0,restX=0,anchorY=-160;
  const getSceneRect=()=>scene.getBoundingClientRect();
  function measure(){
    const box=getSceneRect();
    w=box.width;h=box.height;cw=card.offsetWidth;ch=card.offsetHeight;
    // The anchor is really at the top of the *document*, not in the middle of the hero.
    anchorY=-75-(box.top+scrollY);
    restX=w*.5;
    restY=parseFloat(getComputedStyle(card).top)||h*.61;
    svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
    paint();
  }
  const measureRO=new ResizeObserver(measure);measureRO.observe(scene);
  addEventListener('resize',measure,{passive:true});measure();
  function paint(){
    const a=s.angle*Math.PI/180,ca=Math.cos(a),sa=Math.sin(a);
    const cx=restX+s.x,cy=restY+s.y;
    card.style.transform=`translate(-50%,-50%) translate3d(${s.x.toFixed(2)}px,${s.y.toFixed(2)}px,0) rotate(${s.angle.toFixed(2)}deg)`;
    turn.style.transform=`rotateY(${s.flip.toFixed(2)}deg)`;
    // Quando o crachá está ficando de lado (próximo de 90°/270°),
    // desfocamos levemente a foto para esconder a distorção dura do 3D.
    const modFlip=((s.flip%180)+180)%180;
    const sideProximity=1-Math.abs(modFlip-90)/90;
    const blur=clamp(sideProximity,0,1)*4.6;
    const dim=clamp(sideProximity,0,1)*0.18;
    const sheen=clamp(sideProximity,0,1)*0.22;
    card.style.setProperty('--photo-edge-blur', `${blur.toFixed(2)}px`);
    card.style.setProperty('--photo-edge-dim', `${dim.toFixed(3)}`);
    card.style.setProperty('--photo-edge-sheen', `${sheen.toFixed(3)}`);
    // Local rigid offset: exact same offset is used for both card and metal clip.
    const connectorLength=ch*.5+51;
    const endX=cx+sa*connectorLength;
    const endY=cy-ca*connectorLength;
    const isMobile=innerWidth<=620;
    const startX=isMobile?w+16:restX;
    const dy=endY-anchorY,dx=endX-startX;
    // Smooth elastic cloth curve. Curves towards actual hardware mount, no free floating gaps.
    const cx1=isMobile?startX:startX+dx*.04;
    const cy1=anchorY+dy*(isMobile?.66:.36);
    const cx2=isMobile?endX+(startX-endX)*.55:endX-dx*.24;
    const cy2=endY-dy*(isMobile?.16:.28);
    const curve=`M${startX.toFixed(2)},${anchorY.toFixed(2)} C${cx1.toFixed(2)},${cy1.toFixed(2)} ${cx2.toFixed(2)},${cy2.toFixed(2)} ${endX.toFixed(2)},${endY.toFixed(2)}`;
    paths.forEach(p=>p?.setAttribute('d',curve));
    hardware?.setAttribute('transform',`translate(${endX.toFixed(2)} ${endY.toFixed(2)}) rotate(${s.angle.toFixed(2)})`);
    // Stretch ratio measures real extension of ribbon, including movement towards corners.
    const restLength=Math.hypot(startX-restX,restY-ch*.5-51-anchorY);
    const actualLength=Math.hypot(dx,dy);
    const stretch=clamp((actualLength-restLength)/Math.max(150,restLength*.66),0,1);
    // Cloth thins and becomes translucent only at extreme stretch (metal stays opaque).
    const width=31-15*stretch;
    edge?.setAttribute('stroke-width',(width+4).toFixed(2));
    fabric?.setAttribute('stroke-width',width.toFixed(2));
    paths.slice(0,3).forEach(p=>p?.setAttribute('opacity',(1-.45*stretch).toFixed(3)));
    if(ink)ink.setAttribute('opacity',(0.80-.48*stretch).toFixed(3));
    scene.style.setProperty('--stretch',stretch.toFixed(3));
  }
  function dropNow(){
    if(s.active)return;
    s.active=true;
    if(reduced){s.falling=false;paint();return;}
    // O cartão inteiro nasce acima da borda superior da tela, inclusive no celular.
    // A distância usa coordenadas reais do viewport, não um valor relativo fixo.
    const rect=getSceneRect();
    const cardCenterAtRest=rect.top+restY;
    s.y=-(cardCenterAtRest+ch*.65+28);
    s.x=0;s.vx=0;s.vy=0;
    s.angle=-7;s.va=0;
    s.falling=true;
    paint();
  }
  // The user must be able to skip intro without losing the badge entrance.
  const previouslyActive=revealed;
  startDrop=dropNow;
  if(previouslyActive)dropNow();
  let prev=performance.now();
  let tabVisible=true;
  document.addEventListener('visibilitychange',()=>{tabVisible=!document.hidden;prev=performance.now()});
  function tick(time){
    requestAnimationFrame(tick);
    if(!tabVisible)return;
    const delta=Math.min(.035,Math.max(0,(time-prev)/1000));prev=time;
    // A opção de acessibilidade reduz animações automáticas, mas não deve desativar
    // o retorno de um objeto que o próprio usuário arrastou com o mouse/dedo.
    // Na V5, o `!reduced` congelava o crachá exatamente onde era solto.
    if(s.active&&!s.drag){
      // Pequenos passos mantêm a física estável em celulares com FPS variável.
      const slices=Math.max(1,Math.ceil(delta/.009));const dt=delta/slices;
      for(let j=0;j<slices;j++){
        if(s.falling){
          // Queda sob gravidade: primeiro acelera, depois a fita para o cartão.
          s.vy+=2050*dt;
          s.y+=s.vy*dt;
          s.angle+=(-s.angle*1.8)*dt;
          if(s.y>=0){
            // Impacto da fita ao atingir o comprimento de repouso:
            // pequeno excesso de velocidade vira oscilação na mola.
            const impact=s.vy;
            s.y=0;
            s.vy=Math.min(780,impact*.43);
            s.vx=-100;
            s.va=95;
            s.falling=false;
          }
          continue;
        }
        // A tensioned spring & viscous damping: physically relaxes to equilibrium,
        // accelerating harder the further the card is pulled.
        // Frequência natural ~8.9 rad/s: mola firme, oscilatória e estável.
        // Antes: k=23, damping=3.05 (retorno lento e fraco).
        const k=80,damping=5.0;
        s.vx+=(-k*s.x-damping*s.vx)*dt;
        s.vy+=(-k*s.y-damping*s.vy)*dt;
        s.x+=s.vx*dt;s.y+=s.vy*dt;
        // Independent torsion from lateral motion + rotational inertia.
        const desiredAngle=clamp(s.x*.075+s.vx*.010,-42,42);
        s.va+=((desiredAngle-s.angle)*12 - s.va*3.25)*dt;
        s.angle+=s.va*dt;
        const isFlipping=performance.now()<s.flipUntil;
        if(s.flipGoal!==null){
          s.vflip+=(s.flipGoal-s.flip)*19*dt - s.vflip*4.5*dt;
        }else{
          s.vflip*=Math.exp(-1.35*dt);
          if(!isFlipping && Math.abs(s.vflip)<140){
            const front=Math.round(s.flip/360)*360;
            s.vflip+=((front-s.flip)*10-s.vflip*3.8)*dt;
          }
        }
        s.flip+=s.vflip*dt;
      }
      if(s.flipGoal!==null && Math.abs(s.flipGoal-s.flip)<1 && Math.abs(s.vflip)<5){s.flip=s.flipGoal;s.vflip=0;s.flipGoal=null;s.flipUntil=performance.now()+1100;}
      if(Math.abs(s.x)<.08&&Math.abs(s.vx)<.6){s.x=0;s.vx=0}
      if(Math.abs(s.y)<.08&&Math.abs(s.vy)<.6){s.y=0;s.vy=0}
      if(Math.abs(s.angle)<.1&&Math.abs(s.va)<.5){s.angle=0;s.va=0}
    }
    paint();
  }
  requestAnimationFrame(tick);
  function tumbleFromRelease(pull){
    const sign = s.x!==0 ? Math.sign(s.x) : Math.sign(s.vx||1);
    s.vflip = sign * clamp(240 + pull*1.25, 420, 1080);
    s.flipGoal = null;
    s.flipUntil = 0;
  }
  const finish=(id,cancelled=false)=>{
    if(!s.drag || (id!=null && id!==s.pointerId))return;
    s.drag=false;s.pointerId=null;card.classList.remove('is-dragging');
    try{if(card.hasPointerCapture(id))card.releasePointerCapture(id)}catch(_){ }
    if(!s.dragMoved){s.vx=0;s.vy=0;s.va=0;return}
    if(cancelled){s.inputVx=0;s.inputVy=0}
    const pull=Math.hypot(s.x,s.y);
    // Snap-back impulse is proportional to extension — slingshot rather than teleport.
    // Soltar significa liberar a tensão: impulso orientado ao ponto de repouso.
    // Só 12% da velocidade de arrasto é preservada, para um jogador que
    // solta parado ainda receber uma estilingada perceptível.
    const snap=1.8 + Math.min(2.1,pull*.0035);
    s.vx=clamp(s.inputVx*.12 - s.x*snap,-2300,2300);
    s.vy=clamp(s.inputVy*.12 - s.y*snap,-2300,2300);
    s.va=clamp(s.vx*.17 + s.vy*.045, -560,560);
    // At high tension, the card performs an actual 3D tumble; springs settle FRONT up.
    if(pull>Math.min(210,w*.29)){
      tumbleFromRelease(pull);
    }
  };
  card.setAttribute('draggable','false');
  card.querySelectorAll('img').forEach(e=>{e.draggable=false;e.addEventListener('dragstart',ev=>ev.preventDefault())});
  card.addEventListener('selectstart',ev=>ev.preventDefault());
  card.addEventListener('dragstart',ev=>ev.preventDefault());
  card.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse'&&e.button!==0)return;
    if(!s.active)dropNow();
    e.preventDefault();
    s.falling=false; // segurar interrompe a queda, o usuário assume controle
    s.drag=true;s.pointerId=e.pointerId;s.dragMoved=false;
    s.startPointerX=e.clientX;s.startPointerY=e.clientY;
    const box=getSceneRect();
    s.grabX=e.clientX-(box.left+restX+s.x);
    s.grabY=e.clientY-(box.top+restY+s.y);
    s.inputVx=0;s.inputVy=0;
    s.prevPointerTime=performance.now();s.vx=0;s.vy=0;s.va=0;s.vflip=0;s.flipGoal=null;
    card.classList.add('is-dragging');
    try{card.setPointerCapture(e.pointerId)}catch(_){ }
  });
  window.addEventListener('pointermove',e=>{
    if(!s.drag||e.pointerId!==s.pointerId)return;
    e.preventDefault();
    const box=getSceneRect();
    // Bounds derive from WINDOW pixels, *not* the small badge scene box.
    const globalX=clamp(e.clientX-s.grabX,cw*.23,innerWidth-cw*.23);
    const globalY=clamp(e.clientY-s.grabY,ch*.19,innerHeight-ch*.19);
    const nx=globalX-(box.left+restX);
    const ny=globalY-(box.top+restY);
    const now=performance.now();
    const seconds=clamp((now-s.prevPointerTime)/1000,.008,.08);
    s.inputVx=clamp((nx-s.x)/seconds,-1600,1600);
    s.inputVy=clamp((ny-s.y)/seconds,-1600,1600);
    s.x=nx;s.y=ny;
    s.angle=clamp(s.x*.085+s.inputVx*.009,-57,57);
    if(Math.hypot(e.clientX-s.startPointerX,e.clientY-s.startPointerY)>7)s.dragMoved=true;
    s.prevPointerTime=now;
    paint();
  },{passive:false});
  window.addEventListener('pointerup',e=>finish(e.pointerId),{passive:true});
  window.addEventListener('pointercancel',e=>finish(e.pointerId,true),{passive:true});
  card.addEventListener('lostpointercapture',()=>{if(s.drag)finish(s.pointerId,true)});
  // Se o navegador perder foco durante o arrasto, solta a mola mesmo assim.
  window.addEventListener('blur',()=>{if(s.drag)finish(s.pointerId,true)});
  paint();
})();
