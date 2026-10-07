/* GENESIS 11 — World memory / Nicolae Pascal, 2026.
 * Browser adaptation of Organism-9-ciastica2/organism_unified.py.
 * Preserves: ring sine-Gordon substrate, threshold births, K/coherence,
 * fast/slow memory, tension/talent/fear, prime landscape and lineages.
 * New: persistent environmental scars and delayed, field-mediated inheritance.
 * No fixed attraction of K to the golden ratio. No claim of biological life
 * or verified topological solitons. All thresholds are model rules.
 */
(function(root){
'use strict';
const TAU = 2 * Math.PI, PHI=(1+Math.sqrt(5))/2;
const LEGACY_THRESHOLD=2*(2.8-1.2)/Math.PI;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const wrap=(x,n)=>((x%n)+n)%n;
function rand(seed,t,a=0,b=0){
 let x=(seed ^ Math.imul(t+1,0x9e3779b1)^Math.imul(a+11,0x85ebca6b)^Math.imul(b+23,0xc2b2ae35))>>>0;
 x=Math.imul(x^(x>>>16),0x7feb352d);x=Math.imul(x^(x>>>15),0x846ca68b);x=(x^(x>>>16))>>>0;
 return (x+.5)/4294967296;
}
const dist=(a,b,n)=>Math.min(wrap(a-b,n),wrap(b-a,n));
function divisors(n){let k=0;for(let i=1;i*i<=n;i++)if(n%i===0)k+=i*i===n?1:2;return k;}
const divCache=Array.from({length:1001},(_,i)=>divisors(Math.max(1,i)));
function potential(r){const a=clamp(Math.floor(Math.abs(r)*10),1,1000),b=clamp(Math.floor(Math.abs(r)),1,1000);return Math.log(divCache[a]+1)+Math.log(divCache[b]+1);}
class World{
 constructor(options={}){
  this.seed=(options.seed===undefined?7807:options.seed)>>>0;
  this.N=options.N||600; this.dt=.05;this.g=1.4;this.damping=.0015;
  this.noise=options.noise===undefined?.0008:options.noise;
  this.maxAgents=options.maxAgents||48;this.memoryEnabled=options.memoryEnabled!==false;
  this.tick=0;this.phi=new Float64Array(this.N);this.prev=new Float64Array(this.N);this.next=new Float64Array(this.N);
  this.trace=new Float64Array(this.N);this.agents=[];this.scars=[];this.events=[];this.archive=[];
  this.nextId=1;this.nextScar=1;this.births=0;this.deaths=0;this.inheritances=0;this.pulses=0;this.erased=0;
  if(options.seedField!==false){for(let j=0;j<40;j++){let i=Math.floor(rand(this.seed,0,j,1)*this.N);this.phi[i]=2+3*rand(this.seed,0,j,2);}this.prev.set(this.phi);}
 }
 event(type,details){this.events.push({tick:this.tick,type,...details});if(this.events.length>100)this.events.shift();}
 localMemory(site){
  let m=0,best=null,bestWeight=0;
  if(this.memoryEnabled)for(const s of this.scars){let d=dist(site,s.site,this.N);if(d>28)continue;let w=s.strength*Math.exp(-d*d/128);m+=w;
   if(!s.used && w>bestWeight && this.tick-s.tick>=12){best=s;bestWeight=w;}}
  return {strength:Math.min(2.5,m),echo:bestWeight>.1?best:null};
 }
 birthThreshold(site){return LEGACY_THRESHOLD/(1+.42*this.localMemory(site).strength);}
 inject(site,amplitude=1.5,width=5){
  for(let j=-Math.ceil(3*width);j<=Math.ceil(3*width);j++){
   const i=wrap(Math.round(site)+j,this.N),v=amplitude*Math.exp(-j*j/(2*width*width));
   this.phi[i]+=v;this.prev[i]+=v; // displacement, not an unbounded impulse in velocity
  }
 }
 pulse(site,amplitude=2.8){
  site=wrap(Math.round(site),this.N);this.inject(site,amplitude,5);
  for(const a of this.agents)if(dist(a.site,site,this.N)<20){a.fear+=.35;a.talent+=.045;}
  this.pulses++;this.event('pulse',{site});
 }
 birth(site){
  const id=this.nextId++,mem=this.localMemory(site),echo=mem.echo;
  const amp=Math.abs(this.phi[site]);
  let k=clamp(amp,LEGACY_THRESHOLD,13),talent=0,generation=0,family=id,parentId=null;
  let theta=rand(this.seed,this.tick,id,21)*TAU;
  if(echo){
   const inherit=clamp(.45+.25*echo.strength,0,.75);
   k=clamp(inherit*echo.K+(1-inherit)*k,.5,13);
   talent=echo.talent*.6; generation=echo.generation+1;family=echo.family;parentId=echo.agentId;
   theta=echo.theta;echo.used=true;echo.childId=id;this.inheritances++;
  }
  const r=Math.max(2,20/(generation+1)+2*rand(this.seed,this.tick,id,22)-1);
  const a={id,site,K:k,birthK:k,fast:.5,slow:.5,bias:.5,tension:0,talent,fear:0,
   age:0,maxAge:1000+Math.floor(rand(this.seed,this.tick,id,23)*500),generation,family,parentId,
   theta,r,pr:0,L:.3+.4*rand(this.seed,this.tick,id,24),coherence:.5,
   originScar:echo?echo.id:null,born:this.tick,
   originR:echo?echo.r:r,originTheta:echo?echo.theta:theta};
  this.agents.push(a);this.births++;
  this.event(echo?'inherit':'birth',{id,site,family,generation,parentId,K:k,scarId:echo?echo.id:null});
  return a;
 }
 retire(id,reason='age'){
  const i=this.agents.findIndex(a=>a.id===id);if(i<0)return null;
  const a=this.agents[i];this.agents.splice(i,1);this.deaths++;
  this.inject(a.site,1.5,5);
  const record={id:this.nextScar++,agentId:a.id,family:a.family,generation:a.generation,
   site:a.site,K:a.K,talent:a.talent,theta:a.theta,r:a.r,strength:1,
   tick:this.tick,used:false,childId:null,reason};
  if(this.memoryEnabled){this.scars.push(record);if(this.scars.length>220)this.scars.shift();}
  this.archive.push({...record,life:a.age});if(this.archive.length>1000)this.archive.shift();
  this.event('death',{id:a.id,site:a.site,family:a.family,generation:a.generation,scarId:record.id,reason,theta:a.theta,r:a.r});
  return record;
 }
 eraseScars(){const count=this.scars.length;this.scars=[];this.trace.fill(0);this.erased++;this.event('erase',{count});return count;}
 step(){
  this.tick++;
  const n=this.N,dt2=this.dt*this.dt;
  this.trace.fill(0);
  for(const s of this.scars){s.strength*=.99975;
   if(this.memoryEnabled)for(let j=-18;j<=18;j++)this.trace[wrap(s.site+j,n)]+=s.strength*Math.exp(-j*j/100);}
  this.scars=this.scars.filter(s=>s.strength>.06);
  for(let i=0;i<n;i++){
   const p=this.phi[i],lap=this.phi[(i+1)%n]-2*p+this.phi[(i+n-1)%n];
   // common random forcing keyed only by field seed, cell and tick
   const u=rand(this.seed,this.tick,i,0),v=rand(this.seed,this.tick,i,1);
   const noise=this.noise*Math.sqrt(-2*Math.log(u))*Math.cos(TAU*v);
   this.next[i]=(2-this.damping)*p-(1-this.damping)*this.prev[i]+dt2*(lap-this.g*Math.sin(p))+noise;
   if(!Number.isFinite(this.next[i])||Math.abs(this.next[i])>1e5)throw Error('Поле вышло из численного диапазона');
  }
  const temp=this.prev;this.prev=this.phi;this.phi=this.next;this.next=temp;
  // Only peaks already present in the substrate can birth an agent.
  // Scars change local threshold and the parameters of a field-mediated birth.
  if(this.agents.length<this.maxAgents){
   let candidates=[];let total=0;
   for(let i=0;i<n;i++){
    let a=Math.abs(this.phi[i]),m=this.memoryEnabled?Math.min(2.5,this.trace[i]):0;
    if(a<=LEGACY_THRESHOLD/(1+.42*m)||a<Math.abs(this.phi[(i+1)%n])||a<Math.abs(this.phi[(i+n-1)%n]))continue;
    if(this.agents.some(x=>dist(x.site,i,n)<10))continue;
    const weight=1+3*m;total+=weight;candidates.push([i,total]);
   }
   if(candidates.length && rand(this.seed,this.tick,0,10)<.12){
    let pick=rand(this.seed,this.tick,0,11)*total;
    let site=candidates.find(c=>c[1]>=pick)[0];this.birth(site);
   }
  }
  const lost=[];
  for(const a of this.agents){
   a.age++;
   let re=0,im=0;
   for(let j=-2;j<=2;j++){let p=wrap(this.phi[wrap(a.site+j,n)]*a.K,1)*TAU;re+=Math.cos(p);im+=Math.sin(p);}
   const c=Math.hypot(re,im)/5;a.coherence=c;
   a.fast=.9*a.fast+.1*c;a.slow=.995*a.slow+.005*c;
   a.bias=.999*a.bias+.001*a.fast;
   a.tension=.98*a.tension+.02*(Math.abs(a.fast-a.bias)+Math.abs(a.fast-a.slow));
   if(a.tension>.25){a.K+=.1*(a.fast-a.bias);a.talent+=.005;}
   // Deliberately NO K += gain*(PHI-K).
   if(a.tension>.6)a.fear+=.02;else a.fear*=.98;
   a.K=clamp(a.K,.5,13);
   const le=a.L*Math.exp(-.1*a.generation);
   const derivative=(potential(a.r+.001)-potential(a.r-.001))/.002;
   a.pr+=(-1.5*derivative+le*le/(a.r*a.r*a.r+1e-6))*this.dt;
   a.pr*=.95;a.r=clamp(a.r+a.pr*this.dt,.5,50);
   a.theta=wrap(a.theta+le/(a.r*a.r+1e-6),TAU);
   if(a.fear>1.2 || a.age>a.maxAge)lost.push(a.id);
  }
  for(const id of lost)this.retire(id,'cycle');
 }
 advance(n){if(!Number.isInteger(n)||n<0||n>1e6)throw Error('Invalid step count');for(let i=0;i<n;i++)this.step();return this;}
 snapshot(){return {version:11,seed:this.seed,N:this.N,dt:this.dt,g:this.g,damping:this.damping,noise:this.noise,maxAgents:this.maxAgents,memoryEnabled:this.memoryEnabled,tick:this.tick,phi:Array.from(this.phi),prev:Array.from(this.prev),agents:this.agents,scars:this.scars,events:this.events,archive:this.archive,nextId:this.nextId,nextScar:this.nextScar,births:this.births,deaths:this.deaths,inheritances:this.inheritances,pulses:this.pulses,erased:this.erased};}
 static fromSnapshot(s){
  if(!s||s.version!==11||!Number.isInteger(s.N)||s.N<16||s.N>3000||s.phi.length!==s.N||s.prev.length!==s.N)throw Error('Неподходящий файл мира');
  const w=new World({seed:s.seed,N:s.N,seedField:false});
  const fields=['dt','g','damping','noise','maxAgents','memoryEnabled','tick','nextId','nextScar','births','deaths','inheritances','pulses','erased'];
  for(const k of fields)w[k]=s[k];
  for(const k of ['agents','scars','events','archive'])w[k]=JSON.parse(JSON.stringify(s[k]));
  w.phi.set(s.phi);w.prev.set(s.prev);
  if([...w.phi,...w.prev].some(v=>!Number.isFinite(v)))throw Error('Некорректное поле');
  return w;
 }
 clone(){return World.fromSnapshot(this.snapshot());}
 stats(){return {tick:this.tick,living:this.agents.length,births:this.births,deaths:this.deaths,inheritances:this.inheritances,scars:this.scars.length,generation:Math.max(0,...this.agents.map(a=>a.generation)),meanK:this.agents.length?this.agents.reduce((a,x)=>a+x.K,0)/this.agents.length:0};}
}
function memoryTrial(world,steps=700){
 const a=world.clone(),b=world.clone();b.eraseScars();
 const startA=a.births,startB=b.births,inheritA=a.inheritances,inheritB=b.inheritances;
 // Both inherit identical present fields and agents. Only current scars differ.
 for(let i=0;i<steps;i++){a.step();b.step();}
 let l2=0;for(let i=0;i<a.N;i++)l2+=(a.phi[i]-b.phi[i])**2;
 const sig=w=>w.agents.map(a=>[a.id,a.site,+a.K.toFixed(8),a.generation]);
 return {startTick:world.tick,steps,initialScars:world.scars.length,
  kept:{...a.stats(),newBirths:a.births-startA,newInheritances:a.inheritances-inheritA},
  erased:{...b.stats(),newBirths:b.births-startB,newInheritances:b.inheritances-inheritB},
  stateDifferent:JSON.stringify(sig(a))!==JSON.stringify(sig(b)),fieldRmsDifference:Math.sqrt(l2/a.N),
  protocol:'Same snapshot, same counter-based field forcing; erase only existing scars in one copy. Future scars remain enabled in both.'};
}
const API={World,memoryTrial,rand,dist,PHI,LEGACY_THRESHOLD};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.Genesis=API;
})(typeof window!=='undefined'?window:globalThis);
