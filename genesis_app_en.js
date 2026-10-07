'use strict';
const $=id=>document.getElementById(id),cv=$('world'),ctx=cv.getContext('2d');
let world=new Genesis.World({seed:7807}).advance(1600),selected=46,trackedFamily=46,watchedScar=null;
let playing=true,speed=1,last=0,acc=0,screen=[],view={w:900,h:600,cx:450,cy:285,R:250},zoom=1,zoomTarget=1;
selected=world.agents.find(a=>a.id===46)?.id||world.agents[0]?.id;trackedFamily=world.agents.find(a=>a.id===selected)?.family;
let report=null,exporting=false,autoTrack=true,storyUntil=world.tick+280,lastEventKey='',pulseVisual=[];
const TAU=Math.PI*2,clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t;
const hues=[171,41,203,285,338,99];
const names=['Lumen','Neri','Vega','Lyra','Talis','Aura','Kai','Mira','Eira','Noa','Echo','Iris'];
function nick(a){return names[(a.family-1)%names.length];}
function colour(f,a=1){return `hsla(${hues[(f-1)%hues.length]},73%,72%,${a})`;}
function notify(text){$('toast').textContent=text;$('toast').style.display='block';clearTimeout(notify.timer);notify.timer=setTimeout(()=>$('toast').style.display='none',4000);}
function story(tag,title,text,hold=250){$('storyTag').textContent=tag;$('storyTitle').textContent=title;$('storyText').textContent=text;storyUntil=world.tick+hold;}
function download(blob,name){const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}
function dimensions(){const r=cv.getBoundingClientRect(),d=Math.min(window.devicePixelRatio||1,2);cv.width=r.width*d;cv.height=r.height*d;ctx.setTransform(d,0,0,d,0,0);view.w=r.width;view.h=r.height;view.cx=r.width/2;view.cy=r.height*.46;view.R=Math.min(r.width*.44,r.height*.40);}
new ResizeObserver(()=>{dimensions();render();}).observe(cv);dimensions();
function point(a,scar=false){
 let r=a.r,ang=a.theta;
 // Same orbital state for the body; a short birth morph starts at its stored scar.
 if(!scar&&a.age<60&&a.originScar){let t=clamp(a.age/60,0,1);r=mix(a.originR,r,t);let da=((ang-a.originTheta+Math.PI)%TAU+TAU)%TAU-Math.PI;ang=a.originTheta+da*t;}
 let rr=view.R*(.18+.68*Math.sqrt(clamp(r/26,0,1.3))+.075*Math.sin(TAU*a.site/world.N));
 return {x:view.cx+rr*Math.cos(ang),y:view.cy+rr*Math.sin(ang)*.91,rr,angle:ang};
}
function glowy(x,y,r,c,alpha=.5){ctx.save();ctx.globalAlpha=alpha;const grad=ctx.createRadialGradient(x,y,0,x,y,r);grad.addColorStop(0,c);grad.addColorStop(1,'transparent');ctx.fillStyle=grad;ctx.fillRect(x-r,y-r,2*r,2*r);ctx.restore();}
function drawField(){
 const {w,h,cx,cy,R}=view;const t=world.tick;
 const bg=ctx.createRadialGradient(cx,cy,10,cx,cy,Math.max(w,h)*.68);bg.addColorStop(0,'#173038');bg.addColorStop(.48,'#0b2027');bg.addColorStop(1,'#030b10');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
 // Quiet dust; positions derive from seed, never alter the simulation.
 for(let i=0;i<170;i++){let x=Genesis.rand(world.seed,0,i,801)*w,y=Genesis.rand(world.seed,0,i,802)*h;let b=.1+.12*Math.sin(t*.008+i);ctx.fillStyle=`rgba(156,196,184,${b})`;ctx.beginPath();ctx.arc(x,y,.5+Genesis.rand(world.seed,0,i,803)*.9,0,TAU);ctx.fill();}
 // A living annulus: actual field amplitude displaces its visual membrane.
 for(let band=0;band<20;band++){
  const fr=.77+band*.016;ctx.beginPath();
  for(let j=0;j<=world.N;j+=2){const i=j%world.N,ang=j/world.N*TAU;const a=world.phi[i];let radial=R*(fr+.012*Math.tanh(a)*Math.sin(band*.6)+.018*Math.tanh(a/2));let x=cx+radial*Math.cos(ang),y=cy+radial*Math.sin(ang)*.92; if(j===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
  ctx.closePath();ctx.strokeStyle=`rgba(${band%3===0?'177,201,145':'70,159,155'},${.055+.035*Math.sin(band*.4)**2})`;ctx.lineWidth=.65;ctx.stroke();
 }
 // Thin, branching connections carry excitation from substrate to organisms.
 for(const a of world.agents){let p=point(a),i=a.site,ang=i/world.N*TAU;let end={x:cx+R*.87*Math.cos(ang),y:cy+R*.8*Math.sin(ang)};ctx.strokeStyle=colour(a.family,.07);ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.bezierCurveTo(p.x+(cx-p.x)*.3,p.y+(cy-p.y)*.3,end.x,end.y,end.x,end.y);ctx.stroke();}
 // Centre is intentionally open: generations migrate inward in the model.
 glowy(cx,cy,R*.27,'#5e9d86',.07);
 ctx.save();ctx.textAlign='center';ctx.fillStyle='rgba(181,210,191,.22)';ctx.font='10px system-ui';ctx.letterSpacing='3px';ctx.fillText('T H E   F I E L D   R E M E M B E R S',cx,cy);ctx.restore();
}
function drawScar(s){
 let p=point(s,true);const age=world.tick-s.tick,fresh=Math.exp(-age/100);let r=18+6*Math.sqrt(Math.max(0,s.talent));
 const selectedScar=s.id===watchedScar;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(s.theta);
 glowy(0,0,52,'#cea454',(.07+.17*fresh)*s.strength);
 ctx.strokeStyle=`rgba(229,192,115,${s.strength*(selectedScar?.6:.24)})`;ctx.lineWidth=.7;
 for(let j=0;j<10;j++){
  let a=j*TAU/10+Genesis.rand(world.seed,0,s.id,j)*.25;let l=r*(.7+Genesis.rand(world.seed,0,j,s.id)*.8);
  ctx.beginPath();ctx.moveTo(Math.cos(a)*4,Math.sin(a)*4);ctx.lineTo(Math.cos(a)*l,Math.sin(a)*l);ctx.lineTo(Math.cos(a+.16)*l*1.23,Math.sin(a+.16)*l*1.23);ctx.stroke();
  ctx.beginPath();ctx.moveTo(Math.cos(a)*l*.63,Math.sin(a)*l*.63);ctx.lineTo(Math.cos(a-.3)*l*.93,Math.sin(a-.3)*l*.93);ctx.stroke();
 }
 ctx.setLineDash([1,5]);ctx.beginPath();ctx.arc(0,0,r*.68,0,TAU);ctx.stroke();ctx.setLineDash([]);
 if(fresh>.03){ctx.strokeStyle=`rgba(224,202,130,${fresh*.4})`;ctx.beginPath();ctx.arc(0,0,r+age*.13,0,TAU);ctx.stroke();}
 ctx.restore();
 if(selectedScar){ctx.save();ctx.font='10px system-ui';ctx.fillStyle='#dcc47f';ctx.textAlign='center';ctx.fillText(s.used?'legacy inherited':'scar remains',p.x,p.y+r+15);ctx.restore();}
 if(s.childId){const child=world.agents.find(a=>a.id===s.childId);if(child){const q=point(child);ctx.save();ctx.strokeStyle=colour(child.family,.24);ctx.setLineDash([2,4]);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.quadraticCurveTo(view.cx,view.cy,q.x,q.y);ctx.stroke();ctx.restore();}}
}
function organism(a){
 const p=point(a),t=world.tick,sel=a.id===selected;
 const birth=clamp(a.age/42,.05,1),experience=clamp(a.talent,0,2);
 const s=(17+5*a.coherence+3*experience+2*Math.min(a.generation,3))*birth;
 screen.push({id:a.id,x:p.x,y:p.y,r:s+12});
 const hue=hues[(a.family-1)%hues.length],fill=`hsla(${hue},72%,64%,.10)`;
 ctx.save();ctx.translate(p.x,p.y);ctx.rotate(a.theta+a.K*.03);
 glowy(0,0,s*2.7,`hsl(${hue},70%,56%)`,sel?.17:.08);
 const breath=1+.045*Math.sin(t*.05+a.id);const lobes=3+Math.floor(a.K*2)%4;
 // Outer membrane: coherence, age and memory genuinely select its appearance.
 ctx.beginPath();for(let j=0;j<=96;j++){let q=j/96*TAU;let rad=s*breath*(1+.11*Math.sin(lobes*q+a.K)+.05*(1-a.coherence)*Math.sin(q*11+t*.03));let x=rad*Math.cos(q),y=rad*Math.sin(q);j?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();
 const shell=ctx.createRadialGradient(-s*.25,-s*.3,s*.08,0,0,s*1.14);
 shell.addColorStop(0,`hsla(${hue},58%,80%,.58)`);shell.addColorStop(.42,`hsla(${hue},62%,39%,.6)`);shell.addColorStop(.84,`hsla(${hue},61%,23%,.84)`);shell.addColorStop(1,`hsla(${hue},80%,69%,.45)`);
 ctx.fillStyle=shell;ctx.fill();ctx.strokeStyle=colour(a.family,.95);ctx.lineWidth=1;ctx.shadowColor=colour(a.family);ctx.shadowBlur=sel?11:6;ctx.stroke();ctx.shadowBlur=0;
 // Granular interior: artistic anatomy derived from this agent, not external imagery.
 for(let k=0;k<20;k++){const ang=Genesis.rand(world.seed,0,a.id,k+900)*TAU+t*.001,rr=s*.78*Math.sqrt(Genesis.rand(world.seed,0,a.id,k+950));ctx.fillStyle=colour(a.family,.28);ctx.beginPath();ctx.arc(rr*Math.cos(ang),rr*Math.sin(ang),.45+Genesis.rand(world.seed,0,a.id,k+980)*.9,0,TAU);ctx.fill();}
 // Living internal mesh, not a static icon.
 for(let k=0;k<3;k++){
  ctx.beginPath();for(let j=0;j<=64;j++){let q=j/64*TAU,rot=k*TAU/3+t*.008*(.8+a.coherence),r=s*(.42+.08*Math.sin(q*3+a.K));let x=r*Math.cos(q+rot),y=r*.55*Math.sin(q+rot)+s*.13*Math.sin(q*2+rot);j?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.strokeStyle=colour(a.family,.45);ctx.lineWidth=.75;ctx.stroke();
 }
 // Fine cilia and luminous organelles.
 for(let k=0;k<14;k++){
  let q=k*TAU/14+a.K*.1;let r=s*(1+.11*Math.sin(lobes*q+a.K));ctx.strokeStyle=colour(a.family,.24);ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(r*Math.cos(q),r*Math.sin(q));ctx.quadraticCurveTo((r+5)*Math.cos(q+.07*Math.sin(t*.025+k)),(r+5)*Math.sin(q+.07*Math.sin(t*.025+k)),(r+8)*Math.cos(q+.09*Math.sin(t*.03+k)),(r+8)*Math.sin(q+.09*Math.sin(t*.03+k)));ctx.stroke();
 }
 for(let k=0;k<3+Math.min(a.generation,4);k++){let q=k*TAU/(3+Math.min(a.generation,4))+t*.015*(.6+a.K*.2);ctx.fillStyle=colour(a.family,.85);ctx.beginPath();ctx.arc(s*.35*Math.cos(q),s*.35*Math.sin(q),1.3+experience*.3,0,TAU);ctx.fill();}
 ctx.fillStyle='#e9f1d5';ctx.beginPath();ctx.arc(0,0,2+experience*.4,0,TAU);ctx.fill();
 ctx.restore();
 if(sel){ctx.save();ctx.strokeStyle='rgba(233,216,154,.5)';ctx.lineWidth=.7;ctx.setLineDash([2,5]);ctx.beginPath();ctx.arc(p.x,p.y,s+12,0,TAU);ctx.stroke();ctx.setLineDash([]);ctx.font='11px system-ui';ctx.textAlign='center';ctx.fillStyle='#f0e3b4';ctx.fillText(`${nick(a)} · ${a.generation+1}`,p.x,p.y-s-20);ctx.restore();}
}
function render(){
 ctx.save();screen=[];drawField();
 for(const s of world.scars)drawScar(s);
 const ordered=[...world.agents].sort((a,b)=>point(a).y-point(b).y);for(const a of ordered)organism(a);
 for(const p of pulseVisual){const age=world.tick-p.tick;if(age>180)continue;let ang=p.site/world.N*TAU,x=view.cx+view.R*.9*Math.cos(ang),y=view.cy+view.R*.83*Math.sin(ang);ctx.strokeStyle=`rgba(223,211,149,${.5*Math.exp(-age/45)})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,6+age*.5,0,TAU);ctx.stroke();}
 pulseVisual=pulseVisual.filter(p=>world.tick-p.tick<180);
 if(exporting){ctx.fillStyle='#e4d7a4';ctx.font='20px Georgia';ctx.fillText('GENESIS / THE WORLD REMEMBERS',24,view.h-53);ctx.fillStyle='#a4bfb8';ctx.font='11px system-ui';ctx.fillText(`Nicolae Pascal · Organism 11 · ${world.agents.length} agents · ${world.scars.length} scars · artificial-life model`,24,view.h-30);}
 ctx.restore();
}
function eventText(e){let id='#'+String(e.id||0).padStart(3,'0');if(e.type==='inherit')return `${id} inherited scar #${e.parentId} · generation ${e.generation+1}`;if(e.type==='death')return `${id} returned to the field. Its experience remains.`;if(e.type==='birth')return `${id} was born from the excited field.`;if(e.type==='pulse')return 'A pulse changed the field.';if(e.type==='erase')return `Scars erased: ${e.count}. Field and agents preserved.`;return e.type;}
function update(){
 const st=world.stats();$('living').textContent=st.living;$('generation').textContent=st.generation+1;$('traces').textContent=st.scars;
 const latest=world.events.slice(-6).reverse();$('log').replaceChildren(...latest.map(e=>{const d=document.createElement('div');d.className='entry';d.textContent=eventText(e);return d;}));
 const a=world.agents.find(a=>a.id===selected);
 if(!a && autoTrack && !watchedScar){const s=world.scars.find(s=>s.agentId===selected);if(s)watchedScar=s.id;}
 if(a){$('name').textContent=nick(a);$('identity').textContent=`#${String(a.id).padStart(3,'0')} · generation ${a.generation+1} · family #${a.family}`;$('age').textContent=Math.min(100,Math.round(100*a.age/a.maxAge))+'%';$('ageBar').style.width=clamp(100*a.age/a.maxAge,0,100)+'%';$('kval').textContent=a.K.toFixed(3);$('talent').textContent=a.talent.toFixed(3);$('lineage').textContent=a.parentId?`#${a.parentId} → #${a.id} · inherited experience`:'First generation. Its history starts here.';$('release').disabled=false;$('releaseMain').disabled=false;}
 else{$('name').textContent='A scar remains';$('identity').textContent=selected?`Agent #${String(selected).padStart(3,'0')} returned to the field`:'Select an agent';$('age').textContent='completed';$('ageBar').style.width='100%';$('release').disabled=true;$('releaseMain').disabled=true;}
 if(autoTrack&&watchedScar){const s=world.scars.find(s=>s.id===watchedScar);if(s&&s.childId&&selected!==s.childId){const c=world.agents.find(a=>a.id===s.childId);if(c){selected=c.id;trackedFamily=c.family;story('THE LEGACY CONTINUES',`From the scar of #${s.agentId} a new agent was born.`,`#${c.id} inherited part of K and 60% of experience. Its own history begins.`,500);update();return;}}}
 const key=world.events.length?`${world.events.at(-1).tick}:${world.events.at(-1).id}:${world.events.at(-1).type}`:'';
 if(world.tick>storyUntil&&key!==lastEventKey){
  const e=world.events.at(-1);if(e&&e.type==='inherit')story('A NEW GENERATION',`#${e.parentId} disappeared. Its experience continues in #${e.id}.`,'The birth occurred in the field; its parameters depend on the scar.',160);
  else if(e&&e.type==='death')story('THE FIELD HOLDS A MEMORY',`Agent #${e.id} completed its life cycle.`,'The glowing trace retains its experience and lineage.',160);
  lastEventKey=key;
 }
 $('paused').style.display=playing?'none':'block';$('pause').textContent=playing?'Ⅱ':'▶';
}
function advance(n){world.advance(n);update();render();}
function setPause(){playing=!playing;acc=0;update();}
$('pause').onclick=setPause;
$('speed').onclick=()=>{speed=speed===1?3:speed===3?.5:1;$('speed').textContent='×'+speed;};
function release(){const a=world.agents.find(a=>a.id===selected);if(!a)return;const s=world.retire(a.id,'user');watchedScar=s.id;trackedFamily=a.family;autoTrack=true;story('THE AGENT IS GONE. ITS LEGACY REMAINS.',`${nick(a)} returned to the field.`,`Watch the gold trace. A descendant may appear; it is not scheduled.`,700);update();render();}
$('release').onclick=release;$('releaseMain').onclick=release;
$('pulse').onclick=()=>{const a=world.agents.find(a=>a.id===selected);const site=a?a.site:Math.floor(Genesis.rand(world.seed,world.tick,801,8)*world.N);world.pulse(site);pulseVisual.push({site,tick:world.tick});story('YOUR INTERVENTION','The field received a pulse.','Field excitation, internal responses and possible births will change.',180);update();render();};
cv.addEventListener('pointerup',e=>{
 const b=cv.getBoundingClientRect(),x=e.clientX-b.left,y=e.clientY-b.top;
 let best=null,dd=Infinity;for(const p of screen){const d=Math.hypot(x-p.x,y-p.y);if(d<p.r&&d<dd){best=p;dd=d;}}
 if(best){selected=best.id;watchedScar=null;autoTrack=false;const a=world.agents.find(a=>a.id===selected);trackedFamily=a.family;story('SELECTED',`${nick(a)} · generation ${a.generation+1}`,a.parentId?`Inherited the scar of #${a.parentId}. Now it develops its own history.`:'Press “Leave a scar” to observe what follows.',300);}
 else{let ang=wrap(Math.atan2((y-view.cy)/.91,x-view.cx),TAU),site=Math.floor(ang/TAU*world.N);world.pulse(site);pulseVisual.push({site,tick:world.tick});story('A PULSE IN THE ENVIRONMENT','You changed the field, not a drawn agent.','Births depend on the field and retained scars.',180);}
 update();render();
});
function wrap(x,n){return((x%n)+n)%n;}
$('focus').onclick=()=>{selected=null;watchedScar=null;autoTrack=false;story('THE WHOLE ECOLOGY','Some agents are born. Others leave a memory.','Click an agent to follow its history.',300);update();render();};
$('compare').onclick=()=>{
 if(!world.scars.length){notify('Press “Leave a scar” first: the comparison needs existing memory.');return;}
 const button=$('compare');button.disabled=true;button.textContent='Computing two futures…';const snapshot=world.clone();
 setTimeout(()=>{try{report=Genesis.memoryTrial(snapshot,1800);$('trial').style.display='block';$('keptNum').textContent=report.kept.newInheritances;$('erasedNum').textContent=report.erased.newInheritances;
 $('trialText').textContent=(report.stateDifferent?'The future states differ. ':'The states match in this run. ')+`New agents: ${report.kept.newBirths} and ${report.erased.newBirths}. Only ${report.initialScars} existing scars were erased; new ones remain enabled in both.`;
 story('TESTING MEMORY',report.stateDifferent?'One present. Two different continuations.':'No difference detected in this window.','Same initial agents and field, same external noise. Only existing scars differ.',400);
 }catch(e){notify(e.message);}finally{button.disabled=false;button.textContent='Compare again';update();}},30);
};
$('report').onclick=()=>report&&download(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}),'GENESIS_memory_test.json');
$('shot').onclick=()=>{exporting=true;render();cv.toBlob(b=>{if(b)download(b,'GENESIS_world.png');exporting=false;render();},'image/png');};
$('save').onclick=()=>download(new Blob([JSON.stringify(world.snapshot())],{type:'application/json'}),'GENESIS_world.json');
$('load').onclick=()=>$('file').click();$('file').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const raw=JSON.parse(await f.text());world=Genesis.World.fromSnapshot(raw);selected=world.agents[0]?.id||null;watchedScar=null;report=null;$('trial').style.display='none';story('WORLD RESTORED','Continuing the saved history.','Field, agents, scars and lineage restored.',240);update();render();}catch(err){notify('Could not load: '+err.message);}e.target.value='';};
$('restart').onclick=()=>{if(!confirm('Create a new world? Use “Save world” to keep the current one first.'))return;world=new Genesis.World({seed:(world.seed+47)>>>0}).advance(420);selected=world.agents[2]?.id||null;watchedScar=null;autoTrack=true;report=null;$('trial').style.display='none';story('ANOTHER BEGINNING','Same rules. A different history.','Select an agent and leave its scar.',300);update();render();};
$('about').onclick=()=>$('modal').classList.add('open');$('close').onclick=()=>$('modal').classList.remove('open');$('modal').onclick=e=>{if(e.target.id==='modal')$('modal').classList.remove('open');};
addEventListener('keydown',e=>{if(e.code==='Space'&&!['INPUT','BUTTON'].includes(document.activeElement.tagName)) {e.preventDefault();setPause();}if(e.code==='Escape')$('modal').classList.remove('open');});
function frame(now){if(!last)last=now;const elapsed=Math.min(.1,(now-last)/1000);last=now;if(playing&&!document.hidden){acc+=elapsed*60*speed;let n=Math.min(18,Math.floor(acc));if(n){world.advance(n);acc-=n;update();}}render();requestAnimationFrame(frame);}
// Inspectable hooks; also used by independent browser tests. No network calls.
window.genesisApp={get world(){return world;},advance,render,pause:()=>{playing=false;update();},play:()=>{playing=true;update();},select:id=>{selected=id;update();render();},release,trial:()=>Genesis.memoryTrial(world,1800),capture:()=>{exporting=true;render();},normal:()=>{exporting=false;render();}};
update();render();requestAnimationFrame(frame);
