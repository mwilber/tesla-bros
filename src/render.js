import { FLOOR, H } from './engine.js';
import { drawRoadster } from './roadster.js';
// Midtones preserve scenery detail under the stronger display contrast.
const palettes = {
  day: {sky:'#7abacb',horizon:'#d1dfa4',far:'#809fbd',mountain:'#5a9f99',forest:'#4b865e',grass:'#8db64c',dirt:'#b78064',dark:'#825d4b'},
  cave: {sky:'#536080',horizon:'#709da4',far:'#5b758f',mountain:'#5a9e9c',forest:'#487c85',grass:'#a3b5b9',dirt:'#7b7c9f',dark:'#555e7e'},
  sunset: {sky:'#bc91b3',horizon:'#ebba87',far:'#aa89b3',mountain:'#828cae',forest:'#63768c',grass:'#a2a358',dirt:'#b3826c',dark:'#7e5960'},
  fortress: {sky:'#665d83',horizon:'#bc877e',far:'#7c6b91',mountain:'#967a80',forest:'#64647b',grass:'#b69b64',dirt:'#8d7c82',dark:'#635d73'},
};
export class Renderer {
  constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.particles=[];this.clock=0;}
  rect(x,y,w,h,color){this.ctx.fillStyle=color;this.ctx.fillRect(Math.round(x),Math.round(y),w,h);}
  poly(points,color){const c=this.ctx;c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill();}
  text(s,x,y,size=10,color='#ffffdf',align='left'){this.ctx.fillStyle=color;this.ctx.font=`bold ${size}px monospace`;this.ctx.textAlign=align;this.ctx.fillText(s,Math.round(x),Math.round(y));}
  puff(x,y,color='#f4f5df',n=9){for(let i=0;i<n;i++)this.particles.push({x,y,vx:(Math.random()-.5)*95,vy:-Math.random()*90,life:.6+Math.random()*.2,color,size:2+Math.random()*4});}
  cloud(x,y,s=1){const c=this.ctx;c.save();c.translate(Math.round(x),y);c.scale(s,s);this.rect(0,12,92,16,'#e6efd5');this.rect(14,2,26,28,'#e6efd5');this.rect(38,-8,25,34,'#e6efd5');this.rect(62,5,20,20,'#e6efd5');this.rect(3,27,86,5,'#d7e5c0');c.restore();}
  pine(x,y,s,color){const c=this.ctx;c.save();c.translate(Math.round(x),y);c.scale(s,s);this.rect(-3,-20,6,20,color);this.poly([[0,-94],[-18,-60],[-11,-60],[-29,-32],[-19,-32],[-37,-8],[37,-8],[19,-32],[29,-32],[11,-60],[18,-60]],color);c.restore();}
  background(g){
    const c=this.ctx,vw=this.canvas.width,p=palettes[g.level.theme],cam=g.camera;
    const grad=c.createLinearGradient(0,0,0,352);grad.addColorStop(0,p.sky);grad.addColorStop(1,p.horizon);c.fillStyle=grad;c.fillRect(0,0,vw,H);
    if(g.level.theme==='cave'){
      for(let i=-1;i<vw/120+2;i++){const x=i*120-(cam*.15)%120;this.poly([[x,0],[x+52,0],[x+38,60+(i%3)*15],[x+20,39]],'#172f3b');}
      for(let i=0;i<35;i++){const x=((i*127-cam*.1)%(vw+100)+vw+100)%(vw+100);this.rect(x,110+(i*47)%193,2,2,'#95d8cf');}
      for(let i=-1;i<vw/240+2;i++){let x=i*240-(cam*.25)%240;this.poly([[x,352],[x+55,160],[x+125,352]],p.mountain);this.poly([[x+40,352],[x+105,238],[x+190,352]],p.far);}
    }else{
      const sx=vw*.76-cam*.035;this.rect(sx-24,115,48,48,g.level.theme==='sunset'?'#f9dda0':'#e7efbb');this.rect(sx-31,123,62,32,g.level.theme==='sunset'?'#f9dda0':'#e7efbb');
      for(let i=-1;i<vw/340+2;i++)this.cloud(i*340-(cam*.10)%340+40,90+(i%3)*27,.65+(i%2)*.15);
      for(let i=-1;i<vw/440+2;i++){const x=i*440-(cam*.17)%440;this.poly([[x-40,352],[x+72,221],[x+107,221],[x+140,185],[x+164,185],[x+228,270],[x+260,270],[x+360,352]],p.far);this.poly([[x+80,352],[x+222,244],[x+265,244],[x+282,224],[x+310,224],[x+432,352]],p.mountain);}
      for(let i=-2;i<vw/70+4;i++)this.pine(i*70-(cam*.33)%70,352,.55+((i+30)%4)*.15,p.mountain);
      for(let i=-1;i<vw/230+2;i++)this.pine(i*230-(cam*.48)%230+55,352,1.1+(i%2)*.15,p.forest);
      this.rect(0,333,vw,19,p.forest);this.rect(0,347,vw,5,'#66834e');
      for(let i=0;i<vw;i+=47)this.rect(i,337+(i%3)*4,19,2,p.mountain);
    }
    if(g.level.theme==='fortress'){
      for(let i=-1;i<vw/240+2;i++){const x=i*240-(cam*.28)%240;this.rect(x,232,145,120,'#3a4241');this.rect(x+12,216,121,16,'#3a4241');this.rect(x+24,205,23,20,'#3a4241');this.rect(x+96,205,23,20,'#3a4241');for(let j=0;j<4;j++)this.rect(x+18+j*31,246,10,23,'#9c7952');}
    }
  }
  ground(b,p){const x=b.x,y=b.y;this.rect(x,y,b.w,b.h,p.dirt);this.rect(x,y,b.w,5,p.grass);this.rect(x,y+5,b.w,5,'#526e3b');this.rect(x,y+10,b.w,3,'#d3a066');this.rect(x,y+13,b.w,5,p.dark);for(let tx=Math.floor(x/32)*32;tx<x+b.w;tx+=32){for(let ty=y+18;ty<y+b.h;ty+=24){this.rect(tx+(ty%48===10?12:0),ty,2,24,p.dark);this.rect(tx,ty+22,32,2,p.dark);this.rect(tx+7,ty+6,5,3,'#cf9665');this.rect(tx+21,ty+14,3,2,'#98603f');}}for(let tx=x+5;tx<x+b.w;tx+=27){this.rect(tx,y-3,2,5,p.grass);this.rect(tx+3,y-1,5,2,p.grass);}}
  charger(b){const {x,y,w,h}=b;this.rect(x+5,y+8,w-10,h-8,'#c9dac0');this.rect(x+9,y+12,8,h-12,'#e7eed9');this.rect(x+w-15,y+12,8,h-12,'#7eaa8a');this.rect(x,y,w,13,'#e6efcf');this.rect(x,y+11,w,4,'#79a479');this.rect(x+4,y+2,w-8,3,'#f1f4db');this.rect(x+24,y+22,17,h-27,'#3b715b');this.rect(x+28,y+25,9,Math.min(h-34,26),'#8ec77d');this.rect(x+27,y+h-6,14,6,'#53785b');if(h>=60)this.text('ϟ',x+32,y+42,19,'#e0eeac','center');}
  block(b){const x=b.x,y=b.y-Math.sin((b.bump||0)/.2*Math.PI)*6;const question=b.type==='question';const color=question?(b.used?'#8a9270':'#d1a052'):'#b16d46';this.rect(x,y,32,32,question&&!b.used?'#685640':'#5b6344');this.rect(x+1,y+1,30,29,color);this.rect(x+2,y+2,28,3,question?(b.used?'#b2b795':'#f1c682'):'#d79c61');this.rect(x+2,y+27,28,3,question?(b.used?'#a18544':'#9a6e41'):'#885036');if(question){if(!b.used){this.text('?',x+16,y+24,22,'#ffffff','center');this.rect(x+3,y+5,2,2,'#9b6e3c');this.rect(x+27,y+24,2,2,'#9b6e3c');}else this.rect(x+13,y+12,5,5,'#718063');}else{this.rect(x,y+14,32,2,'#7b5237');this.rect(x+14,y+3,2,11,'#7b5237');this.rect(x+6,y+16,2,11,'#7b5237');this.rect(x+25,y+16,2,11,'#7b5237');}}
  coin(c,t){const width=Math.max(3,Math.abs(Math.cos(t*3+c.x*.01))*11),x=c.x+7-width/2,y=c.y+Math.sin(t*3+c.x)*2;this.rect(x,y,width,19,'#a47d26');this.rect(x-2,y+3,width+4,13,'#f6d55d');this.rect(x,y+2,width,14,'#ffe68b');if(width>6){this.poly([[x+width*.6,y+3],[x+width*.2,y+10],[x+width*.55,y+10],[x+width*.35,y+15],[x+width*.85,y+8],[x+width*.52,y+8]],'#c29434');}}
  car(p,ready){
    const c=this.ctx,x=Math.round(ready?420:p.x),y=Math.round(p.y);
    if(p.invincible>0&&!ready&&Math.floor(this.clock*14)%2)return;
    const centerX=x+p.w/2, centerY=y+p.h-11;
    this.rect(x-4,y+p.h-2,50,3,'#193d3230');
    if(p.shield){c.strokeStyle='#ceffff';c.lineWidth=2;c.strokeRect(x-9,y-5,60,34);this.rect(x-11,y+6,2,12,'#89ecdb');}
    if(p.boosting&&!ready){
      const rearX=centerX-p.facing*27,len=14+Math.sin(this.clock*52)*4,start=p.facing>0?rearX-len:rearX;
      this.rect(start,centerY-3,len,6,'#d6f3ef');
      this.rect(p.facing>0?start-6:rearX+len,centerY-1,7,3,'#f5fff0');
      if(Math.random()<.8)this.particles.push({x:rearX-p.facing*(len+2),y:centerY+(Math.random()-.5)*6,vx:-p.facing*(75+Math.random()*70),vy:(Math.random()-.5)*24,life:.28,color:Math.random()<.5?'#e9fff7':'#c6e8e5',size:2+Math.random()*3});
    }
    drawRoadster(c,{x:centerX,y:centerY,facing:p.facing,roll:ready?0:(p.roll||0)});
    if(p.thrust&&!ready){
      // Stabilizing jets continue to push down as the body rolls around them.
      for(const offset of [-17,17]){const len=10+Math.sin(this.clock*45+offset)*5;this.rect(centerX+offset-1,y+24,3,len,'#f2f9e5');this.rect(centerX+offset-2,y+27+len,5,4,'#d5f0ea');}
      if(Math.random()<.65)this.particles.push({x:centerX+(Math.random()-.5)*36,y:y+30,vx:(Math.random()-.5)*35,vy:65,life:.3,color:'#f2f6df',size:3});
    }
  }
  enemy(e){const x=Math.round(e.x),y=e.y+(e.kind==='boss'?0:Math.sin(this.clock*9)*1);if(e.kind==='boss'){this.rect(x+6,y,52,8,'#adb1a0');this.rect(x,y+8,64,37,'#8b6756');this.rect(x+5,y+10,54,26,'#b38b63');this.rect(x+9,y+13,46,12,'#344440');this.rect(x+14,y+16,12,6,'#f09456');this.rect(x+39,y+16,12,6,'#f09456');this.rect(x+7,y+39,15,15,'#273f3c');this.rect(x+43,y+39,15,15,'#273f3c');this.rect(x-5,y+24,12,12,'#5d6755');for(let i=0;i<3;i++)this.rect(x+9+i*17,y-14,12,4,i<e.hp?'#f3a961':'#5d5d50');}else{this.rect(x+3,y,22,5,'#7c5e3a');this.rect(x,y+5,28,15,'#b59358');this.rect(x+2,y+6,24,4,'#d0b479');this.rect(x+5,y+12,18,6,'#314e40');this.rect(x+7,y+13,4,3,'#e6edb5');this.rect(x+18,y+13,4,3,'#e6edb5');this.rect(x+1+(Math.floor(this.clock*7)%2)*2,y+20,8,5,'#3b5142');this.rect(x+19-(Math.floor(this.clock*7)%2)*2,y+20,8,5,'#3b5142');this.rect(x+12,y-3,4,4,'#779a65');}}
  gate(g){const x=g.level.goal,y=FLOOR;this.rect(x-16,y-128,14,128,'#dde6cf');this.rect(x+64,y-128,14,128,'#87a48a');this.rect(x-16,y-134,94,15,'#edf1db');this.rect(x-16,y-119,94,5,'#b1c3a5');this.rect(x-5,y-112,5,101,'#c6d6bb');this.rect(x+69,y-112,4,101,'#d0dfc0');this.rect(x+13,y-154,37,18,'#436e4b');this.text('ϟ',x+32,y-140,17,'#d4ed9f','center');this.rect(x-24,y-4,110,4,'#e8e7b8');for(let i=0;i<5;i++)this.rect(x-22+i*22,y-4,11,4,'#576b45');}
  render(g,dt){this.clock+=dt;const c=this.ctx,cam=g.camera,vw=this.canvas.width,pal=palettes[g.level.theme];c.imageSmoothingEnabled=false;this.background(g);c.save();c.translate(-Math.floor(cam),0);
    for(let i=0;i<g.level.width;i+=430){if(i<cam-120||i>cam+vw+120)continue;if(g.level.theme!=='cave'){this.rect(i+104,331,3,21,'#728557');this.rect(i+90,308,33,23,'#e8e9bc');this.rect(i+93,311,27,17,'#789664');this.text('→',i+107,325,17,'#e7edbf','center');}for(let j=0;j<3;j++){this.rect(i+195+j*13,346-j%2*3,2,6,'#608d4e');this.rect(i+194+j*13,343-j%2*3,4,3,j%2?'#df92c1':'#b39bd7');}}
    const cp=g.level.checkpoint;this.rect(cp,FLOOR-99,4,99,'#e7e8bf');this.poly([[cp+4,FLOOR-98],[cp+40,FLOOR-98],[cp+31,FLOOR-85],[cp+40,FLOOR-73],[cp+4,FLOOR-73]],g.level.checkpointReached?'#d6ee71':'#f4e6ba');this.text('ϟ',cp+18,FLOOR-79,17,'#769a50');
    for(const b of g.level.solids){if(b.x+b.w<cam-40||b.x>cam+vw+40)continue;if(b.type==='ground'){c.save();c.beginPath();c.rect(b.x,b.y,b.w,b.h);c.clip();this.ground(b,pal);c.restore();this.rect(b.x,b.y-3,b.w,3,pal.grass);}else if(b.type==='charger')this.charger(b);else if(b.type==='brick'||b.type==='question')this.block(b);else if(b.type==='step'){this.rect(b.x,b.y,b.w,b.h,'#9aa071');this.rect(b.x,b.y,b.w,4,'#d4d5a2');this.rect(b.x,b.y+4,4,b.h-4,'#bec08c');this.rect(b.x+b.w-4,b.y+4,4,b.h-4,'#6e7e54');for(let j=0;j<b.h;j+=30)this.rect(b.x,b.y+j+28,b.w,2,'#7d895b');}else{this.rect(b.x,b.y,b.w,7,'#d5d8a5');this.rect(b.x,b.y+7,b.w,6,'#719067');this.rect(b.x+4,b.y+13,b.w-8,10,'#49735a');for(let j=0;j<b.w;j+=22)this.rect(b.x+j+7,b.y+16,7,4,'#769779');}}
    if(g.level.theme==='fortress'){for(let i=0;i<g.level.solids.length;i++){const a=g.level.solids[i],b=g.level.solids[i+1];if(a.type==='ground'&&b?.type==='ground'&&b.x>a.x+a.w){this.rect(a.x+a.w,FLOOR+26,b.x-(a.x+a.w),80,'#b85d3c');for(let x=a.x+a.w;x<b.x;x+=16)this.rect(x,FLOOR+27+Math.sin(this.clock*4+x)*4,12,5,'#f1b65c');}}}
    for(const coin of g.level.coins)if(!coin.taken&&coin.x>cam-20&&coin.x<cam+vw+20)this.coin(coin,this.clock);
    for(const s of g.level.pickups)if(!s.taken){this.rect(s.x,s.y,24,24,'#d5f0d4');this.rect(s.x+3,s.y+3,18,18,'#63c5d6');this.text('ϟ',s.x+12,s.y+19,20,'#edffda','center');}
    for(const h of g.level.hazards)for(let x=h.x;x<h.x+h.w;x+=16)this.poly([[x,h.y+16],[x+8,h.y],[x+16,h.y+16]],'#d5d6b5');
    this.gate(g);for(const e of g.level.enemies)if(e.alive&&e.x>cam-80&&e.x<cam+vw+80)this.enemy(e);
    for(const fire of g.level.projectiles){this.rect(fire.x,fire.y,16,12,'#eeae5d');this.rect(fire.x+3,fire.y+3,9,6,'#fff0ae');this.rect(fire.x+16,fire.y+4,9,4,'#b76f49');}
    this.car(g.player,g.state==='ready');
    for(const p of this.particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;this.rect(p.x,p.y,p.size,p.size,p.color);}this.particles=this.particles.filter(p=>p.life>0);
    c.restore();
    // A subtle pixel scan pattern keeps the scene feeling like a tiny CRT world.
    c.fillStyle='#143b2406';for(let y=0;y<H;y+=3)c.fillRect(0,y,vw,1);
  }
}
