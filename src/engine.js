export const W = 960, H = 432, FLOOR = 352;
export const STAGES = [
  { name: 'GREENLINE RUN', theme: 'day', width: 6784, goal: 6460, checkpoint: 3250 },
  { name: 'UNDER THE GRID', theme: 'cave', width: 6208, goal: 5910, checkpoint: 3050 },
  { name: 'SKYWAY SPRINT', theme: 'sunset', width: 5952, goal: 5660, checkpoint: 3000 },
  { name: 'THE GIGA FORTRESS', theme: 'fortress', width: 6528, goal: 6200, checkpoint: 3300 },
];
export const overlaps = (a,b) => a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
export function makeLevel(index) {
  const cfg = STAGES[index];
  const level = { ...cfg, index, solids: [], coins: [], enemies: [], hazards: [], pickups: [], projectiles: [], checkpointReached: false };
  const ground = (x,end) => level.solids.push({x,y:FLOOR,w:end-x,h:110,type:'ground'});
  const platform = (x,y,w=128,type='platform') => level.solids.push({x,y,w,h:24,type});
  const block = (x,y=248,type='brick',content=null) => level.solids.push({x,y,w:32,h:32,type,content,used:false,bump:0});
  const blocks = (x,y,pattern) => [...pattern].forEach((c,i)=>block(x+i*32,y,c==='?'?'question':'brick',c==='?'?(i%3===1?'shield':'coins'):null));
  const pipe = (x,h=64) => level.solids.push({x,y:FLOOR-h,w:64,h,type:'charger'});
  const coins = (x,y,n=5,step=28) => { for(let i=0;i<n;i++)level.coins.push({x:x+i*step,y,w:14,h:19,taken:false}); };
  const arc = (x,y,n=5) => {for(let i=0;i<n;i++)level.coins.push({x:x+i*29,y:y-Math.sin(i/(n-1)*Math.PI)*37,w:14,h:19,taken:false});};
  const bot = (x,min=x-85,max=x+110,kind='bot') => level.enemies.push({x,y:FLOOR-25,w:28,h:25,vx:-38-index*5,min,max,alive:true,kind,hp:kind==='boss'?3:1,t:0,grounded:true});
  const spikes = (x,w=64,y=FLOOR-16) => level.hazards.push({x,y,w,h:16,type:'spikes'});
  if(index===0){
    [[0,1600],[1728,2912],[3040,4320],[4480,5408],[5536,cfg.width]].forEach(a=>ground(...a));
    blocks(480,248,'?'); blocks(672,248,'#?#?#'); coins(680,203,5); pipe(1024,64); pipe(1320,96); bot(850,770,970); bot(1470,1400,1550);
    arc(1555,233,7); blocks(1888,248,'#?#'); blocks(2112,160,'#?#'); pipe(2272,64); bot(2060,1980,2180); coins(2390,285,6);
    platform(2600,264,128); blocks(2728,168,'?#'); arc(2860,230,7); bot(3160,3070,3230); blocks(3424,248,'#?##?'); coins(3435,204,5);
    pipe(3820,96); bot(4000,3920,4170); bot(4080,3920,4170); platform(4190,272,100); arc(4280,227,8);
    blocks(4690,248,'#?#'); platform(4896,272,96); platform(5056,208,96); coins(4900,233,3); coins(5060,169,3); pipe(5280,64); arc(5360,231,7);
    for(let i=0;i<5;i++)level.solids.push({x:5770+i*42,y:FLOOR-(i+1)*30,w:42,h:(i+1)*30,type:'step'});
    coins(5782,252,6); bot(5640,5580,5720);
  } else if(index===1){
    [[0,1320],[1448,2560],[2720,4064],[4192,5120],[5248,cfg.width]].forEach(a=>ground(...a));
    blocks(400,248,'#?#?'); pipe(760,64); coins(900,290,6); bot(1050,920,1230); arc(1260,235,7);
    platform(1600,272,128); platform(1810,200,128); coins(1610,231,4); coins(1820,158,4); blocks(2090,248,'?#?#'); bot(2310,2220,2490); arc(2500,235,8);
    pipe(2900,96); blocks(3240,248,'#?#'); bot(3510,3420,3690); spikes(3760,64); platform(3712,256,144); coins(3740,213,4); arc(4010,235,7);
    blocks(4384,248,'?#?'); pipe(4704,64); bot(4900,4810,5040); arc(5080,230,7); coins(5410,285,8); blocks(5520,216,'#?##');
  } else if(index===2){
    [[0,1056],[1280,1696],[1888,2368],[2592,3264],[3456,4000],[4224,4800],[4992,cfg.width]].forEach(a=>ground(...a));
    blocks(400,248,'#?#'); pipe(784,64); platform(1030,284,96); platform(1180,258,100); arc(1030,210,7);
    bot(1460,1350,1630); platform(1670,272,100); arc(1660,214,7); blocks(2048,248,'#?#'); platform(2336,282,100); platform(2480,248,100); arc(2320,204,8);
    blocks(2820,248,'?#?'); bot(3100,3010,3210); platform(3220,284,96); platform(3360,248,128); coins(3350,203,4); bot(3630,3530,3800); pipe(3840,80);
    platform(3980,274,96); platform(4120,234,128); arc(3960,190,9); blocks(4416,248,'#?#'); bot(4630,4510,4730); platform(4770,282,100); platform(4900,250,100); arc(4760,200,8); coins(5180,286,7);
  } else {
    [[0,1376],[1536,2688],[2848,4288],[4448,cfg.width]].forEach(a=>ground(...a));
    blocks(400,248,'#?#'); spikes(800,64); platform(752,256,160); coins(780,212,4); bot(1120,1020,1290); arc(1320,234,8);
    blocks(1760,248,'#?#'); spikes(2080,96); platform(2048,256,160); bot(2370,2260,2570); arc(2630,233,8);
    pipe(3008,64); blocks(3392,248,'?#?'); spikes(3744,96); platform(3712,256,160); coins(3740,213,4); bot(4020,3930,4200); arc(4220,228,8);
    blocks(4672,248,'#?##?'); pipe(5056,64); spikes(5320,64); platform(5280,256,160); coins(5308,213,4);
    const boss = {x:5840,y:FLOOR-54,w:64,h:54,vx:-46,min:5660,max:6020,alive:true,kind:'boss',hp:3,t:0,grounded:true}; level.enemies.push(boss);
  }
  return level;
}
export class Game {
  constructor(){this.best=0;this.events=[];this.reset();}
  reset(){this.stage=0;this.score=0;this.cells=0;this.lives=3;this.level=makeLevel(0);this.time=300;this.state='ready';this.camera=0;this.elapsed=0;this.deathTimer=0;this.spawn();}
  spawn(){this.player={x:this.level.checkpointReached?this.level.checkpoint+12:100,y:FLOOR-24,w:42,h:24,vx:0,vy:0,grounded:true,coyote:.1,buffer:0,pressure:100,jet:0,facing:1,invincible:2,shield:false};this.camera=Math.max(0,this.player.x-270);}
  start(){if(this.state==='ready'){this.state='playing';this.events.push({type:'start'});}else if(this.state==='paused')this.state='playing';else if(this.state==='stageclear')this.next();else if(this.state==='gameover'||this.state==='won'){this.reset();this.state='playing';}}
  pause(){if(this.state==='playing')this.state='paused';else if(this.state==='paused')this.state='playing';}
  restart(){this.reset();this.state='playing';this.events.push({type:'start'});}
  next(){if(this.stage>=3)return;this.stage++;this.level=makeLevel(this.stage);this.time=300;this.spawn();this.state='playing';this.events.push({type:'stage',text:`WORLD 1–${this.stage+1} · ${this.level.name}`});}
  hit(){if(this.player.invincible>0)return;if(this.player.shield){this.player.shield=false;this.player.invincible=2;this.events.push({type:'shieldbreak'});return;}this.die();}
  die(){if(this.state!=='playing')return;this.lives--;this.state='dying';this.deathTimer=1.1;this.player.vy=-260;this.player.thrust=false;this.events.push({type:'death'});}
  reward(n){this.score+=n;this.best=Math.max(this.best,this.score);}
  collect(){this.cells++;this.reward(100);if(this.cells%50===0){this.lives++;this.events.push({type:'life',text:'50 CHARGE CELLS · EXTRA LIFE'});}else this.events.push({type:'coin'});}
  hitBlock(b){if(b.type==='question'&&!b.used){b.used=true;b.bump=.2;if(b.content==='shield'){this.level.pickups.push({x:b.x+4,y:b.y-24,w:24,h:24});this.events.push({type:'powerup'});}else{this.collect();this.events.push({type:'block',x:b.x+16,y:b.y});}}else if(b.type==='brick'){b.bump=.16;this.reward(10);this.events.push({type:'bump'});}}
  step(dt,input={}){
    dt=Math.min(dt,1/30);
    if(this.state==='dying'){this.deathTimer-=dt;this.player.vy+=1100*dt;this.player.y+=this.player.vy*dt;if(this.deathTimer<=0){if(this.lives<=0){this.state='gameover';}else{this.spawn();this.time=300;this.state='playing';this.events.push({type:'respawn'});}}return;}
    if(this.state!=='playing')return;
    this.elapsed+=dt;this.time-=dt;
    if(this.time<=0){this.time=0;this.die();return;}
    const p=this.player,l=this.level;
    p.invincible=Math.max(0,p.invincible-dt);p.coyote=p.grounded?.11:Math.max(0,p.coyote-dt);p.buffer=input.jumpPressed?.14:Math.max(0,p.buffer-dt);
    const direction=(input.right?1:0)-(input.left?1:0), maxSpeed=input.run?310:222;
    const target=direction*maxSpeed,accel=p.grounded?1900:1100;
    p.vx+=Math.max(-accel*dt,Math.min(accel*dt,target-p.vx));
    if(direction)p.facing=direction;
    if(p.buffer>0&&p.coyote>0&&p.pressure>=18){p.vy=-452;p.grounded=false;p.coyote=0;p.buffer=0;p.pressure-=18;p.jet=.24;this.events.push({type:'jump'});}
    const thrust=input.jump&&p.jet>0&&p.pressure>0&&p.vy<0;
    p.jet=Math.max(0,p.jet-dt);
    p.thrust=!!thrust;
    if(thrust)p.pressure=Math.max(0,p.pressure-48*dt);
    if(input.jumpReleased&&p.vy<-170){p.vy=-170;p.jet=0;}
    if(p.grounded)p.pressure=Math.min(100,p.pressure+65*dt);
    p.vy=Math.min(650,p.vy+(thrust?390:1250)*dt);
    const oldBottom=p.y+p.h;
    p.x+=p.vx*dt;
    for(const b of l.solids){if(overlaps(p,b)){if(p.vx>0)p.x=b.x-p.w;else if(p.vx<0)p.x=b.x+b.w;p.vx=0;}}
    p.x=Math.max(0,Math.min(l.width-p.w,p.x));
    p.y+=p.vy*dt;p.grounded=false;
    for(const b of l.solids){b.bump=Math.max(0,(b.bump||0)-dt);if(overlaps(p,b)){if(p.vy>=0){p.y=b.y-p.h;p.vy=0;p.grounded=true;p.jet=0;}else{p.y=b.y+b.h;p.vy=0;p.jet=0;this.hitBlock(b);}}}
    for(const c of l.coins)if(!c.taken&&overlaps(p,c)){c.taken=true;this.collect();this.events.push({type:'spark',x:c.x,y:c.y});}
    for(const s of l.pickups)if(!s.taken&&overlaps(p,s)){s.taken=true;p.shield=true;this.reward(500);this.events.push({type:'shield',text:'ION SHIELD · ONE FREE HIT'});}
    if(!l.checkpointReached&&p.x>=l.checkpoint){l.checkpointReached=true;this.reward(250);this.events.push({type:'checkpoint',text:'CHECKPOINT · CHARGE SAVED'});}
    for(const e of l.enemies){
      if(!e.alive)continue;e.t+=dt;
      if(Math.abs(e.x-p.x)<800){
        e.x+=e.vx*dt;if(e.x<e.min||e.x>e.max)e.vx*=-1;
        if(e.kind==='boss'&&e.t>2.5){e.t=0;l.projectiles.push({x:e.x-8,y:e.y+24,w:16,h:12,vx:-185,life:4});this.events.push({type:'fire'});}
      }
      if(overlaps(p,e)&&p.invincible<1.8){if(p.vy>0&&oldBottom<=e.y+14){e.hp--;p.vy=-330;p.jet=0;p.invincible=.28;this.reward(e.kind==='boss'?500:200);this.events.push({type:'stomp',x:e.x+e.w/2,y:e.y});if(e.hp<=0){e.alive=false;if(e.kind==='boss')this.events.push({type:'boss',text:'SENTINEL OFFLINE · ROAD IS CLEAR'});}}else this.hit();}
    }
    for(const h of l.hazards)if(overlaps(p,{x:h.x+5,y:h.y+5,w:h.w-10,h:h.h-5}))this.hit();
    for(const fire of l.projectiles){fire.x+=fire.vx*dt;fire.life-=dt;if(overlaps(p,fire))this.hit();}l.projectiles=l.projectiles.filter(f=>f.life>0);
    if(p.y>H+90)this.die();
    if(p.x>=l.goal&&this.state==='playing'){
      const boss=l.enemies.find(e=>e.kind==='boss'&&e.alive);
      if(!boss){this.reward(Math.ceil(this.time)*10+1000);this.state=this.stage===3?'won':'stageclear';this.events.push({type:'clear'});}else{p.x=l.goal-5;this.events.push({type:'gate',text:'DEFEAT THE SENTINEL TO FINISH'});}
    }
    const vw=this.viewWidth||W;this.camera=Math.max(0,Math.min(l.width-vw,this.camera+(p.x-vw*.34-this.camera)*Math.min(1,dt*7)));
  }
}
