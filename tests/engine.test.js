import test from 'node:test';
import assert from 'node:assert/strict';
import { Game, makeLevel, STAGES, FLOOR } from '../src/engine.js';
const step=(g,n,input={})=>{for(let i=0;i<n;i++)g.step(1/120,{...input,jumpPressed:i===0&&input.jumpPressed});};
const fresh=()=>{const g=new Game();g.start();g.level.enemies=[];return g;};

test('a held jet jump rises higher than a tap, consumes pressure, and recharges on landing',()=>{
  const jump=hold=>{const g=fresh();let top=g.player.y;for(let i=0;i<240;i++){g.step(1/120,{jump:i<hold,jumpPressed:i===0,jumpReleased:i===hold});top=Math.min(top,g.player.y);if(i===15)assert.ok(g.player.pressure<100);}assert.equal(g.player.grounded,true);assert.equal(g.player.pressure,100);return FLOOR-top;};
  assert.ok(jump(40)>jump(8)+40);
});
test('the Roadster lands on platforms without sinking and cannot drive through a charger',()=>{
  const g=fresh();g.player.x=950;step(g,100,{right:true});assert.equal(g.player.x,1024-g.player.w);assert.equal(g.player.y,FLOOR-g.player.h);
  step(g,70,{right:true,jump:true,jumpPressed:true});assert.ok(g.player.x>1024);assert.ok(g.player.y<=FLOOR-g.player.h);
});
test('question crates only dispense their reward once when struck from below',()=>{
  const g=fresh(),b=g.level.solids.find(b=>b.type==='question');g.player.x=b.x;step(g,60,{jump:true,jumpPressed:true});assert.equal(b.used,true);const rewards=g.cells+g.level.pickups.length;assert.equal(rewards,1);g.hitBlock(b);assert.equal(g.cells+g.level.pickups.length,1);
});
test('collectibles grant score and every 50 cells grants a life',()=>{const g=fresh();for(let i=0;i<50;i++)g.collect();assert.equal(g.score,5000);assert.equal(g.lives,4);});
test('a shield absorbs one hit; subsequent contact consumes one life',()=>{const g=fresh();g.player.invincible=0;g.player.shield=true;g.hit();assert.equal(g.lives,3);assert.equal(g.player.shield,false);g.player.invincible=0;g.hit();assert.equal(g.lives,2);assert.equal(g.state,'dying');g.hit();assert.equal(g.lives,2);});
test('stomping a bot defeats it and gives the player a bounce',()=>{const g=fresh();const e={x:220,y:327,w:28,h:25,vx:0,min:200,max:260,alive:true,kind:'bot',hp:1,t:0};g.level.enemies=[e];Object.assign(g.player,{x:215,y:301,vy:180,grounded:false,invincible:0});step(g,4);assert.equal(e.alive,false);assert.ok(g.player.vy<0);assert.equal(g.score,200);});
test('checkpoint death respawns at the checkpoint while preserving collected score',()=>{const g=fresh();g.player.x=g.level.checkpoint+3;step(g,1);assert.equal(g.level.checkpointReached,true);const score=g.score;g.die();step(g,140);assert.equal(g.state,'playing');assert.equal(g.lives,2);assert.ok(g.player.x>=g.level.checkpoint);assert.equal(g.score,score);});
test('pause freezes time and movement; game over can start a fresh run',()=>{const g=fresh();g.pause();const time=g.time,x=g.player.x;step(g,120,{right:true});assert.equal(g.time,time);assert.equal(g.player.x,x);g.pause();g.lives=1;g.die();step(g,140);assert.equal(g.state,'gameover');g.start();assert.equal(g.state,'playing');assert.equal(g.lives,3);assert.equal(g.stage,0);});
test('clearing four stages ends World 1 and the fortress requires its sentinel to be defeated',()=>{const g=fresh();for(let i=0;i<4;i++){if(i===3){const boss=g.level.enemies.find(e=>e.kind==='boss');g.player.x=g.level.goal;step(g,1);assert.equal(g.state,'playing');boss.alive=false;}g.player.x=g.level.goal;step(g,1);assert.equal(g.state,i===3?'won':'stageclear');if(i<3)g.start();}assert.equal(g.stage,3);assert.ok(g.score>10000);});
test('all four authored stages have checkpoints, charge cells, obstacles and reachable finishes',()=>{assert.equal(STAGES.length,4);for(let i=0;i<4;i++){const l=makeLevel(i);assert.ok(l.checkpoint>100&&l.checkpoint<l.goal);assert.ok(l.coins.length>15);assert.ok(l.solids.some(b=>b.type==='question'));assert.ok(l.solids.some(b=>b.type==='ground'&&b.x<=l.goal&&b.x+b.w>l.goal));}});

test('every stage terrain can be completed using only ordinary drive and jet-jump inputs',async()=>{
  const {readFile}=await import('node:fs/promises');
  // Deterministic recorded routes exercise every gap and obstacle, without enemies.
  const routes=JSON.parse(await readFile(new URL('./terrain-routes.json',import.meta.url),'utf8'));
  for(let stage=0;stage<4;stage++){
    const g=new Game();g.stage=stage;g.level=makeLevel(stage);g.level.enemies=[];g.spawn();g.state='playing';let held=false;
    for(const action of routes[stage]){const jump=action===1||action===3;for(let f=0;f<16;f++)g.step(1/120,{right:action<2,run:true,jump,jumpPressed:f===0&&jump&&!held,jumpReleased:f===0&&!jump&&held});held=jump;}
    assert.equal(g.state,stage===3?'won':'stageclear',`World 1–${stage+1} must be traversable`);assert.equal(g.lives,3);
  }
});
test('the fortress sentinel requires three successful stomps',()=>{
  const g=new Game();g.stage=3;g.level=makeLevel(3);g.spawn();g.state='playing';const boss=g.level.enemies.find(e=>e.kind==='boss');
  for(let i=0;i<3;i++){Object.assign(g.player,{x:boss.x+10,y:boss.y-26,vy:180,vx:0,grounded:false,invincible:0});step(g,4);assert.equal(boss.hp,2-i);assert.equal(boss.alive,i<2);}
  assert.equal(g.lives,3);assert.equal(g.score,1750);
});
test('timeout consumes one life and respawn restores the clock for a playable attempt',()=>{const g=fresh();g.time=.001;step(g,1);assert.equal(g.state,'dying');step(g,140);assert.equal(g.lives,2);assert.equal(g.state,'playing');assert.ok(g.time>299);});

test('short and held jet jumps each complete one barrel roll before landing upright',()=>{
  for(const hold of [1,8,40]){
    const g=fresh();let previous=0,airborneFrames=0;
    for(let i=0;i<180;i++){
      g.step(1/120,{jump:i<hold,jumpPressed:i===0,jumpReleased:i===hold});
      assert.ok(g.player.roll>=previous,'roll must advance in one direction');
      assert.ok(g.player.roll<=Math.PI*2,'each jump rolls only once');
      previous=g.player.roll;
      if(!g.player.grounded)airborneFrames++;
      else if(i>0)break;
    }
    assert.ok(airborneFrames>15);assert.equal(g.player.roll,Math.PI*2);assert.equal(g.player.rolling,false);
    g.step(1/120,{jump:true,jumpPressed:true});assert.equal(g.player.rolling,true);assert.ok(g.player.roll<.3,'a new jump starts a new roll');
  }
});
test('a crate-interrupted jump lands upright and pausing freezes its roll',()=>{
  const g=fresh();g.player.x=480;step(g,8,{jump:true,jumpPressed:true});const roll=g.player.roll;
  g.pause();step(g,20);assert.equal(g.player.roll,roll);g.pause();step(g,130);
  assert.equal(g.player.grounded,true);assert.equal(g.player.roll,Math.PI*2);assert.equal(g.player.rolling,false);
});
test('barrel-roll projection leaves the nose-to-tail axis fixed while roof and wheels invert',async()=>{
  const {projectRoadsterPoint:project}=await import('../src/roadster.js');
  for(const angle of [0,Math.PI/2,Math.PI,Math.PI*1.5,Math.PI*2]){
    for(const x of [-25,26]){const point=project([x,0,0],angle);assert.equal(point.x,x);assert.ok(Math.abs(point.y)<1e-10);assert.ok(Math.abs(point.depth)<1e-10);}
  }
  assert.ok(project([0,10,0],0).y<0);assert.ok(project([0,10,0],Math.PI).y>0);
  const upright=project([8,10,5],0),complete=project([8,10,5],Math.PI*2);
  assert.ok(Math.abs(upright.x-complete.x)<1e-10&&Math.abs(upright.y-complete.y)<1e-10);
});
