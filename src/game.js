import { Game, STAGES } from './engine.js';
import { Renderer } from './render.js';
const $=id=>document.getElementById(id);
const canvas=$('game'),game=new Game(),renderer=new Renderer(canvas);
const keys=new Set(),touch=new Set();
let pendingJumpPress=false,pendingJumpRelease=false;
let jumpDown=false,lastState='',lastStage=-1,accumulator=0,last=performance.now(),announceTimer;
let muted=false,audio,musicStep=0,nextNote=0,best=0;
try{best=Number(localStorage.getItem('tesla-bros-best'))||0;muted=localStorage.getItem('tesla-bros-muted')==='true';}catch{}
game.best=best;
// An original 64-step chiptune: syncopated lead, walking bass, offbeat
// arpeggios, and tiny percussion accents. Each stage shifts its color and pace.
const musicLead=[
  76,0,79,81,83,0,81,79,76,74,76,0,72,74,76,79,
  81,0,84,83,81,79,76,0,74,76,79,74,72,0,72,0,
  76,0,79,81,83,0,86,84,83,81,79,0,76,79,81,0,
  84,83,81,79,76,0,74,76,79,0,76,74,72,0,72,0,
];
const musicBass=[
  48,0,55,0,48,55,48,0,45,0,52,0,45,52,45,0,
  41,0,48,0,41,48,41,0,43,0,50,0,43,50,43,0,
  48,0,55,0,48,55,48,0,45,0,52,0,45,52,45,0,
  41,0,48,0,41,48,41,0,43,0,50,0,43,50,43,0,
];
const musicRoots=[60,57,65,67,60,57,65,67];
const stageMusic=[
  {transpose:0,step:.135,wave:'square'},
  {transpose:-5,step:.15,wave:'triangle'},
  {transpose:2,step:.128,wave:'square'},
  {transpose:-7,step:.145,wave:'sawtooth'},
];
function unlockAudio(){if(muted)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();}catch{}}
function tone(freq,duration=.08,type='square',volume=.025,delay=0,slide){if(!audio||muted)return;const t=audio.currentTime+delay,o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+duration);g.gain.setValueAtTime(volume,t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g).connect(audio.destination);o.start(t);o.stop(t+duration+.01);}
let jetNoise;
function jetHiss(){
  if(!audio||muted)return;
  const duration=.38,t=audio.currentTime;
  if(!jetNoise){
    jetNoise=audio.createBuffer(1,Math.ceil(audio.sampleRate*duration),audio.sampleRate);
    const samples=jetNoise.getChannelData(0);
    for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;
  }
  const source=audio.createBufferSource(),high=audio.createBiquadFilter(),low=audio.createBiquadFilter(),hiss=audio.createGain();
  source.buffer=jetNoise;
  high.type='highpass';high.frequency.value=700;high.Q.value=.5;
  low.type='lowpass';low.Q.value=.5;
  low.frequency.setValueAtTime(8500,t);low.frequency.exponentialRampToValueAtTime(2800,t+duration);
  // A sharp valve opening, a strong air rush, then falling tank pressure.
  hiss.gain.setValueAtTime(.0001,t);
  hiss.gain.exponentialRampToValueAtTime(.38,t+.006);
  hiss.gain.exponentialRampToValueAtTime(.24,t+.07);
  hiss.gain.exponentialRampToValueAtTime(.08,t+.23);
  hiss.gain.exponentialRampToValueAtTime(.0001,t+duration);
  source.connect(high).connect(low).connect(hiss).connect(audio.destination);
  // A brief lower-frequency puff gives the jet weight without a pitched tone.
  const body=audio.createBiquadFilter(),puff=audio.createGain();
  body.type='bandpass';body.frequency.value=420;body.Q.value=.65;
  puff.gain.setValueAtTime(.0001,t);
  puff.gain.exponentialRampToValueAtTime(.18,t+.008);
  puff.gain.exponentialRampToValueAtTime(.0001,t+.14);
  source.connect(body).connect(puff).connect(audio.destination);
  source.onended=()=>{for(const node of [source,high,low,hiss,body,puff])node.disconnect();};
  source.start(t);source.stop(t+duration);
}
function sound(type){switch(type){case'jump':jetHiss();break;case'coin':tone(950,.07,'square',.035);tone(1425,.12,'square',.025,.07);break;case'stomp':tone(210,.09,'square',.045,0,75);break;case'bump':tone(110,.06,'triangle',.07);break;case'death':[420,370,310,220,145].forEach((f,i)=>tone(f,.18,'triangle',.07,i*.12));break;case'clear':[523,659,784,1047,784,1047].forEach((f,i)=>tone(f,.22,'square',.04,i*.13));break;case'shield':case'checkpoint':case'life':case'boss':[440,554,659,880].forEach((f,i)=>tone(f,.16,'triangle',.06,i*.08));break;case'shieldbreak':tone(560,.25,'sawtooth',.04,0,90);break;case'powerup':tone(250,.35,'triangle',.04,0,900);}}
const midiFrequency=midi=>440*2**((midi-69)/12);
function music(){
  if(!audio||muted||game.state!=='playing')return;
  const now=audio.currentTime,style=stageMusic[game.stage];
  if(nextNote<now-.5)nextNote=now;
  while(nextNote<now+.15){
    const step=musicStep%musicLead.length,delay=nextNote-now;
    const lead=musicLead[step],bass=musicBass[step];
    if(lead)tone(midiFrequency(lead+style.transpose),style.step*.72,style.wave,step%8===0?.034:.027,delay);
    if(bass)tone(midiFrequency(bass+style.transpose),style.step*.82,'triangle',.029,delay);
    // A bright offbeat arpeggio answers the lead and keeps the loop moving.
    if(step%8===2||step%8===6){
      const root=musicRoots[Math.floor(step/8)]+style.transpose;
      const interval=step%8===2?7:12;
      tone(midiFrequency(root+interval),style.step*.42,'square',.011,delay);
    }
    // Lightweight kick and high tick add momentum without drowning game sounds.
    if(step%8===0||step%8===4)tone(92,style.step*.45,'triangle',.025,delay,52);
    if(step%2===1)tone(1700,style.step*.12,'square',.004,delay);
    nextNote+=style.step;
    musicStep++;
  }
}
function updateSound(){ $('sound-label').textContent=muted?'Sound off':'Sound on';$('sound-icon').textContent=muted?'◖×':'◖))';$('sound-button').setAttribute('aria-pressed',String(!muted)); }
function toggleSound(){muted=!muted;try{localStorage.setItem('tesla-bros-muted',muted);}catch{}unlockAudio();updateSound();if(game.state==='playing')canvas.focus({preventScroll:true});}
updateSound();
function announce(text){$('announcement').textContent=text;$('announcement').classList.add('show');clearTimeout(announceTimer);announceTimer=setTimeout(()=>$('announcement').classList.remove('show'),2600);}
function clearControls(){keys.clear();touch.clear();jumpDown=false;pendingJumpPress=false;pendingJumpRelease=false;document.querySelectorAll('[data-control]').forEach(b=>b.style.opacity='');}
function start(){clearControls();unlockAudio();game.start();canvas.focus({preventScroll:true});}
$('start-button').addEventListener('click',start);
$('sound-button').addEventListener('click',toggleSound);
$('pause-button').addEventListener('click',()=>{clearControls();game.pause();if(game.state==='playing')canvas.focus({preventScroll:true});});
function restart(){clearControls();unlockAudio();game.restart();announce('NEW RUN · WORLD 1–1');canvas.focus({preventScroll:true});}
$('restart-button').addEventListener('click',restart);
$('fullscreen-button').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if($('arcade').requestFullscreen)await $('arcade').requestFullscreen();else announce('FULLSCREEN IS NOT AVAILABLE IN THIS BROWSER');}catch{announce('FULLSCREEN IS NOT AVAILABLE IN THIS BROWSER');}});
document.addEventListener('fullscreenchange',()=>{$('fullscreen-button').setAttribute('aria-label',document.fullscreenElement?'Exit fullscreen':'Enter fullscreen');});
const dialog=$('help-dialog');let helpWasPlaying=false;
$('help-button').addEventListener('click',()=>{helpWasPlaying=game.state==='playing';if(helpWasPlaying)game.pause();clearControls();dialog.showModal();});
function closeHelp(){dialog.close();if(helpWasPlaying&&game.state==='paused')game.pause();helpWasPlaying=false;if(game.state==='playing')canvas.focus({preventScroll:true});}
$('close-help').addEventListener('click',closeHelp);$('got-it').addEventListener('click',closeHelp);
dialog.addEventListener('cancel',e=>{e.preventDefault();closeHelp();});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeHelp();}});
window.addEventListener('keydown',e=>{
  if(dialog.open)return;
  const control=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','KeyA','KeyD','KeyW','ShiftLeft','ShiftRight','KeyP','Escape','Enter','KeyR','KeyM'];
  if(!control.includes(e.code))return;
  // Leave keyboard activation of focused buttons to the browser.
  if((e.code==='Enter'||e.code==='Space')&&document.activeElement?.tagName==='BUTTON')return;
  e.preventDefault();if(e.repeat)return;
  if(e.code==='Enter'){start();return;}
  if(e.code==='KeyP'||e.code==='Escape'){clearControls();game.pause();return;}
  if(e.code==='KeyR'){restart();return;}
  if(e.code==='KeyM'){toggleSound();return;}
  keys.add(e.code);unlockAudio();
});
window.addEventListener('keyup',e=>{keys.delete(e.code);});
window.addEventListener('blur',()=>{clearControls();if(game.state==='playing')game.pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearControls();if(game.state==='playing')game.pause();}});
for(const button of document.querySelectorAll('[data-control]')){
  button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);touch.add(button.dataset.control);button.style.opacity='.6';unlockAudio();});
  const end=e=>{e.preventDefault();touch.delete(button.dataset.control);button.style.opacity='';};button.addEventListener('pointerup',end);button.addEventListener('pointercancel',end);button.addEventListener('lostpointercapture',()=>{touch.delete(button.dataset.control);button.style.opacity='';});
}
function resize(){const narrow=window.matchMedia('(max-width:700px)').matches;canvas.width=narrow?576:960;game.viewWidth=canvas.width;}
resize();window.addEventListener('resize',resize);
function overlay(){
  const state=game.state;
  $('game-screen').classList.toggle('is-playing',state==='playing');
  $('pause-button').disabled=!['playing','paused'].includes(state);$('pause-button').innerHTML=state==='paused'?'▶ <span>RESUME</span>':'Ⅱ <span>PAUSE</span>';$('pause-button').setAttribute('aria-label',state==='paused'?'Resume game':'Pause game');
  if(state==='playing'||state==='dying'){$('overlay').classList.add('hidden');return;}
  $('overlay').classList.remove('hidden');$('overlay-tag').style.display=state==='ready'?'':'none';
  const states={
    ready:['READY FOR LIFTOFF?','LESS ROAD.<br>MORE ROADSTER.','Fire up your cold-gas thrusters.<br>The first flight starts here.','START ENGINE','or press Enter to start'],
    paused:['TAKE A BREATHER.','PARKED.<br>NOT FINISHED.','Your charge is safe.<br>The high road can wait.','RESUME RUN','or press P / Enter to resume'],
    stageclear:[`WORLD 1–${game.stage+1} COMPLETE`,`STAGE CLEAR.<br>CHARGE ON.`,`Next up: ${STAGES[Math.min(3,game.stage+1)].name.toLowerCase()}.<br>One step closer to the high road.`,'NEXT STAGE','or press Enter to continue'],
    gameover:['OUT OF CHARGE.','ONE MORE<br>ROAD TRIP?',`Run score: ${String(game.score).padStart(6,'0')}<br>Best score: ${String(Math.max(best,game.best)).padStart(6,'0')}`,'TRY AGAIN','or press Enter for a fresh start'],
    won:['WORLD ONE / MISSION COMPLETE','THE HIGH ROAD.<br>CONQUERED.',`All four stages. One electric adventure.<br>Final score: ${String(game.score).padStart(6,'0')}`,'PLAY AGAIN','World 1 complete · Thanks for driving'],
  };
  const s=states[state]||states.ready;$('overlay-eyebrow').textContent=s[0];$('overlay-title').innerHTML=s[1];$('overlay-description').innerHTML=s[2];$('start-button').innerHTML=`${s[3]} <span>↗</span>`;$('start-hint').textContent=s[4];
}
function ui(){
  $('score').textContent=String(game.score).padStart(6,'0');$('coins').textContent=String(game.cells).padStart(2,'0');$('lives').textContent=`× ${String(game.lives).padStart(2,'0')}`;$('time').textContent=String(Math.ceil(game.time)).padStart(3,'0');
  const pressure=Math.round(game.player.pressure),progress=Math.min(100,Math.max(0,Math.round((game.player.x-100)/(game.level.goal-100)*100)));
  $('pressure-value').textContent=`${pressure}%`;$('pressure-bar').style.width=`${pressure}%`;$('pressure-bar').style.background=pressure<25?'#e9503c':'#82a450';$('progress-bar').style.width=`${progress}%`;$('progress-value').textContent=`${String(progress).padStart(2,'0')}%`;
  $('drive-status').textContent=game.player.shield?'ION SHIELD ACTIVE':game.player.thrust?'VERTICAL THRUST ACTIVE':pressure<95&&game.player.grounded?'REPRESSURIZING':game.state==='paused'?'SYSTEMS ON STANDBY':'THRUSTERS READY';
  if(lastStage!==game.stage){lastStage=game.stage;$('stage-name').textContent=`01—${game.stage+1} / ${game.level.name}`;document.querySelectorAll('[data-stage]').forEach((el,i)=>{el.classList.toggle('current',i===game.stage);el.classList.toggle('done',i<game.stage);});}
  if(lastState!==game.state){lastState=game.state;overlay();if(game.state==='won'||game.state==='gameover'){best=Math.max(best,game.best);try{localStorage.setItem('tesla-bros-best',best);}catch{}}}
}
function events(){for(const e of game.events){sound(e.type);if(e.text)announce(e.text);if(e.type==='spark')renderer.puff(e.x,e.y,'#ffe9a0',5);if(e.type==='stomp')renderer.puff(e.x,e.y,'#dfc893',12);if(e.type==='block')renderer.puff(e.x,e.y,'#ffe18b',8);}game.events.length=0;}
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;accumulator+=dt;
  const jump=keys.has('Space')||keys.has('ArrowUp')||keys.has('KeyW')||touch.has('jump');pendingJumpPress ||= jump&&!jumpDown;pendingJumpRelease ||= !jump&&jumpDown;jumpDown=jump;
  while(accumulator>=1/120){game.step(1/120,{left:keys.has('ArrowLeft')||keys.has('KeyA')||touch.has('left'),right:keys.has('ArrowRight')||keys.has('KeyD')||touch.has('right'),run:keys.has('ShiftLeft')||keys.has('ShiftRight')||touch.has('run'),jump,jumpPressed:pendingJumpPress,jumpReleased:pendingJumpRelease});pendingJumpPress=false;pendingJumpRelease=false;accumulator-=1/120;}
  events();renderer.render(game,dt);ui();music();requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
