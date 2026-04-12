import { useState } from 'react';
import { X, ChevronLeft, Plus, Trash2, FolderOpen, Code, FileText, Gamepad2, Zap, Palette, BarChart3, HelpCircle, Sparkles } from 'lucide-react';
import type { Project } from '../lib/projects';
import { streamChat } from '../lib/api';

type Tab = 'categories' | 'games' | 'creative' | 'projects' | 'prompts' | 'apps-websites' | 'documents' | 'productivity-tools' | 'quiz-survey';

const ARTIFACT_CATEGORIES = [
  { id: 'apps-websites', label: 'Apps and websites', icon: Code, color: 'bg-blue-500/10 text-blue-400' },
  { id: 'documents', label: 'Documents and templates', icon: FileText, color: 'bg-purple-500/10 text-purple-400' },
  { id: 'games', label: 'Games', icon: Gamepad2, color: 'bg-pink-500/10 text-pink-400' },
  { id: 'productivity-tools', label: 'Productivity tools', icon: Zap, color: 'bg-yellow-500/10 text-yellow-400' },
  { id: 'creative', label: 'Creative projects', icon: Palette, color: 'bg-green-500/10 text-green-400' },
  { id: 'quiz-survey', label: 'Quiz or survey', icon: BarChart3, color: 'bg-indigo-500/10 text-indigo-400' },
  { id: 'scratch', label: 'Start from scratch', icon: HelpCircle, color: 'bg-slate-500/10 text-slate-400' },
];

const GAMES = [
  {
    title: 'Tic-Tac-Toe',
    emoji: '⭕',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{background:#0f0f1a;display:flex;flex-direction:column;align-items:center;padding:20px;margin:0;font-family:sans-serif;color:#fff}.board{display:grid;grid-template-columns:repeat(3,72px);gap:6px;margin:10px 0}.cell{width:72px;height:72px;background:#1a1a2e;border:2px solid #2a2a4a;font-size:1.8em;cursor:pointer;display:flex;align-items:center;justify-content:center;border-radius:8px;transition:.15s}.cell:hover{background:#252545}#msg{font-size:13px;margin:6px 0}button{padding:6px 16px;background:#6366f1;border:none;color:#fff;border-radius:6px;cursor:pointer;font-size:13px}</style></head><body><h3 style="margin:0 0 4px;font-size:15px">Tic-Tac-Toe</h3><div id="msg">X's turn</div><div class="board" id="b"></div><button onclick="init()">Reset</button><script>let g=Array(9).fill(''),p='X',done=false;const W=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];function render(){document.getElementById('b').innerHTML=g.map((v,i)=>'<div class="cell" onclick="go('+i+')">'+v+'</div>').join('')}function go(i){if(g[i]||done)return;g[i]=p;let w=W.find(r=>r.every(x=>g[x]===p));if(w){document.getElementById('msg').textContent=p+' wins! 🎉';done=true}else if(g.every(v=>v)){document.getElementById('msg').textContent='Draw!';done=true}else{p=p==='X'?'O':'X';document.getElementById('msg').textContent=p+"'s turn"}render()}function init(){g=Array(9).fill('');p='X';done=false;document.getElementById('msg').textContent="X's turn";render()}init();</script></body></html>`,
  },
  {
    title: 'Snake',
    emoji: '🐍',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{background:#0f0f1a;display:flex;flex-direction:column;align-items:center;padding:14px;margin:0;font-family:sans-serif;color:#fff}canvas{border:2px solid #6366f1;border-radius:4px;display:block}#s{font-size:12px;margin:4px 0}button{padding:5px 14px;background:#6366f1;border:none;color:#fff;border-radius:6px;cursor:pointer;margin-top:6px;font-size:12px}</style></head><body><div id="s">Score: 0 — Arrow keys / WASD</div><canvas id="c" width="220" height="220"></canvas><button onclick="start()">Start</button><script>const C=document.getElementById('c'),ctx=C.getContext('2d'),N=20,SZ=11;let s,d,nd,f,sc,iv;function start(){s=[{x:10,y:10}];d={x:1,y:0};nd={x:1,y:0};f=rnd();sc=0;clearInterval(iv);iv=setInterval(step,130);draw()}function rnd(){return{x:Math.floor(Math.random()*N),y:Math.floor(Math.random()*N)}}function step(){d=nd;let h={x:s[0].x+d.x,y:s[0].y+d.y};if(h.x<0||h.x>=N||h.y<0||h.y>=N||s.some(p=>p.x===h.x&&p.y===h.y)){clearInterval(iv);ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(0,0,220,220);ctx.fillStyle='#fff';ctx.font='16px sans-serif';ctx.textAlign='center';ctx.fillText('Game Over: '+sc,110,110);return}s.unshift(h);if(h.x===f.x&&h.y===f.y){sc++;f=rnd();document.getElementById('s').textContent='Score: '+sc}else s.pop();draw()}function draw(){ctx.fillStyle='#0f0f1a';ctx.fillRect(0,0,220,220);ctx.fillStyle='#22c55e';s.forEach(p=>{ctx.fillRect(p.x*SZ,p.y*SZ,SZ-1,SZ-1)});ctx.fillStyle='#f87171';ctx.fillRect(f.x*SZ,f.y*SZ,SZ-1,SZ-1)}document.addEventListener('keydown',e=>{const k={ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1},ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0},KeyW:{x:0,y:-1},KeyS:{x:0,y:1},KeyA:{x:-1,y:0},KeyD:{x:1,y:0}};if(k[e.code]&&!(k[e.code].x===-d.x&&k[e.code].y===-d.y)){nd=k[e.code];e.preventDefault()}});</script></body></html>`,
  },
  {
    title: 'Pong',
    emoji: '🏓',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;color:#fff;font-family:sans-serif}canvas{border:1px solid #222;display:block}p{margin:4px 0;font-size:11px;color:#666}</style></head><body><canvas id="c" width="280" height="190"></canvas><p>Move mouse over canvas to control left paddle</p><script>const c=document.getElementById('c'),ctx=c.getContext('2d');let b={x:140,y:95,vx:2.5,vy:1.5},p1=65,p2=65,s1=0,s2=0;c.addEventListener('mousemove',e=>{const r=c.getBoundingClientRect();p1=Math.min(130,Math.max(0,e.clientY-r.top-30))});function frame(){ctx.fillStyle='#000';ctx.fillRect(0,0,280,190);ctx.fillStyle='#fff';ctx.fillRect(8,p1,7,55);ctx.fillRect(265,p2,7,55);ctx.beginPath();ctx.arc(b.x,b.y,5,0,Math.PI*2);ctx.fill();ctx.font='15px monospace';ctx.textAlign='center';ctx.fillText(s1+':'+s2,140,15);b.x+=b.vx;b.y+=b.vy;if(b.y<5||b.y>185)b.vy*=-1;if(b.x<20&&b.y>p1&&b.y<p1+55){b.vx=Math.abs(b.vx)+.1;b.vy+=(b.y-p1-27)*.05}if(b.x>260&&b.y>p2&&b.y<p2+55){b.vx=-(Math.abs(b.vx)+.1);b.vy+=(b.y-p2-27)*.05}if(b.x<0){s2++;reset()}if(b.x>280){s1++;reset()}p2+=(b.y-p2-27)*.06;p2=Math.min(130,Math.max(0,p2));requestAnimationFrame(frame)}function reset(){b={x:140,y:95,vx:2.5*(Math.random()>.5?1:-1),vy:1.5*(Math.random()>.5?1:-1)}}frame();</script></body></html>`,
  },
  {
    title: 'Memory',
    emoji: '🃏',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{background:#0f0f1a;display:flex;flex-direction:column;align-items:center;padding:14px;margin:0;font-family:sans-serif;color:#fff}.grid{display:grid;grid-template-columns:repeat(4,56px);gap:5px;margin:10px 0}.card{width:56px;height:56px;background:#1a1a2e;border:2px solid #2a2a4a;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.6em;transition:.2s}.card.flip{background:#252560;border-color:#6366f1}.card.match{background:#1a3a1a;border-color:#22c55e;pointer-events:none}#msg{font-size:12px}button{padding:5px 13px;background:#6366f1;border:none;color:#fff;border-radius:6px;cursor:pointer;font-size:12px}</style></head><body><h3 style="margin:0 0 3px;font-size:14px">Memory Match</h3><div id="msg">Find all pairs!</div><div class="grid" id="g"></div><button onclick="init()">Reset</button><script>const EM=['🐱','🐶','🦊','🐸','🦁','🐯','🐻','🦄'];let cards,flipped,matched,lock;function init(){const e=[...EM,...EM].sort(()=>Math.random()-.5);cards=e.map((em,i)=>({id:i,em,fl:false,mt:false}));flipped=[];matched=0;lock=false;render();document.getElementById('msg').textContent='Find all pairs!'}function render(){document.getElementById('g').innerHTML=cards.map((c,i)=>'<div class="card'+(c.fl?' flip':'')+(c.mt?' match':'')+'" onclick="flip('+i+')">'+(c.fl||c.mt?c.em:'')+'</div>').join('')}function flip(i){if(lock||cards[i].fl||cards[i].mt)return;cards[i].fl=true;flipped.push(i);render();if(flipped.length===2){lock=true;setTimeout(()=>{const[a,b]=flipped;if(cards[a].em===cards[b].em){cards[a].mt=cards[b].mt=true;matched++;if(matched===8)document.getElementById('msg').textContent='You won! 🎉'}else{cards[a].fl=cards[b].fl=false}flipped=[];lock=false;render()},700)}}init();</script></body></html>`,
  },
  {
    title: 'Flappy Bird',
    emoji: '🐦',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{background:#0f0f1a;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif;color:#fff}canvas{border:2px solid #6366f1;display:block;background:linear-gradient(to bottom,#87CEEB,#E0F6FF)}#s{position:absolute;top:10px;font-size:20px;font-weight:bold}</style></head><body><div id="s">Score: 0</div><canvas id="c" width="320" height="480"></canvas><script>const c=document.getElementById('c'),ctx=c.getContext('2d');let p={x:50,y:240,w:30,h:30,v:0},pipes=[],g=0.4,s=0,gameOver=false;const pipeW=60,pipeGap=120;function draw(){ctx.clearRect(0,0,320,480);ctx.fillStyle='#FFD700';ctx.fillRect(p.x,p.y,p.w,p.h);ctx.fillStyle='#228B22';pipes.forEach(pipe=>{ctx.fillRect(pipe.x,0,pipeW,pipe.top);ctx.fillRect(pipe.x,pipe.top+pipeGap,pipeW,480-pipe.top-pipeGap)});if(gameOver){ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,320,480);ctx.fillStyle='#fff';ctx.font='30px bold';ctx.textAlign='center';ctx.fillText('Game Over!',160,200);ctx.font='20px';ctx.fillText('Score: '+s,160,240)}}function update(){if(gameOver)return;p.v+=g;p.y+=p.v;if(p.y+p.h>480||p.y<0)gameOver=true;pipes.forEach((pipe,i)=>{pipe.x-=5;if(pipe.x+pipeW<0)pipes.splice(i,1);if(p.x<pipe.x+pipeW&&p.x+p.w>pipe.x&&(p.y<pipe.top||p.y+p.h>pipe.top+pipeGap))gameOver=true;if(pipe.x===p.x)s++,document.getElementById('s').textContent='Score: '+s});if(pipes.length===0||pipes[pipes.length-1].x<200)pipes.push({x:320,top:Math.random()*250+50});draw()}function frame(){update();requestAnimationFrame(frame)}document.addEventListener('keydown',e=>{if(e.code==='Space'){p.v=-8;if(gameOver){gameOver=false;p={x:50,y:240,w:30,h:30,v:0};pipes=[];s=0}}});frame();</script></body></html>`,
  },
  {
    title: '2048',
    emoji: '🎰',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{background:#0f0f1a;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;font-family:sans-serif;color:#fff;padding:10px}.grid{display:grid;grid-template-columns:repeat(4,70px);gap:10px;margin:20px 0;background:#1a1a2e;padding:10px;border-radius:8px}.tile{width:70px;height:70px;display:flex;align-items:center;justify-content:center;background:#252545;border-radius:6px;font-size:32px;font-weight:bold}.tile[data-value="2"]{background:#e74c3c}.tile[data-value="4"]{background:#e67e22}.tile[data-value="8"]{background:#f39c12}.tile[data-value="16"]{background:#d4af37}.tile[data-value="32"]{background:#c792ea}.tile[data-value="2048"]{background:#6366f1}button{padding:8px 16px;background:#6366f1;border:none;color:#fff;border-radius:6px;cursor:pointer;font-size:14px}</style></head><body><h2 style="margin:0">2048</h2><p id="s">Score: 0</p><div class="grid" id="g"></div><button onclick="init()">New Game</button><script>let tiles=[],s=0;function init(){tiles=Array(16).fill(0);s=0;addTile();addTile();render();document.getElementById('s').textContent='Score: 0'}function addTile(){let empty=[];for(let i=0;i<16;i++)if(tiles[i]===0)empty.push(i);if(empty.length>0){let idx=empty[Math.floor(Math.random()*empty.length)];tiles[idx]=Math.random()<0.1?4:2}}function move(dir){let moved=false;let newTiles=[...tiles];if(dir==='left'||dir==='right'){for(let i=0;i<4;i++){let row=newTiles.slice(i*4,i*4+4);if(dir==='right')row.reverse();row=row.filter(t=>t>0);for(let j=0;j<row.length-1;j++){if(row[j]===row[j+1]){row[j]*=2;s+=row[j];row.splice(j+1,1)}}while(row.length<4)row.push(0);if(dir==='right')row.reverse();for(let j=0;j<4;j++){let idx=i*4+j;if(newTiles[idx]!==row[j])moved=true;newTiles[idx]=row[j]}}}if(dir==='up'||dir==='down'){for(let i=0;i<4;i++){let col=[newTiles[i],newTiles[i+4],newTiles[i+8],newTiles[i+12]];if(dir==='down')col.reverse();col=col.filter(t=>t>0);for(let j=0;j<col.length-1;j++){if(col[j]===col[j+1]){col[j]*=2;s+=col[j];col.splice(j+1,1)}}while(col.length<4)col.push(0);if(dir==='down')col.reverse();for(let j=0;j<4;j++){let idx=i+j*4;if(newTiles[idx]!==col[j])moved=true;newTiles[idx]=col[j]}}}if(moved){tiles=newTiles;addTile();render();document.getElementById('s').textContent='Score: '+s}}function render(){let html='';for(let i=0;i<16;i++){html+='<div class="tile" data-value="'+(tiles[i]||'')+'">'+tiles[i]+'</div>'}document.getElementById('g').innerHTML=html}document.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')move('left');if(e.key==='ArrowRight')move('right');if(e.key==='ArrowUp')move('up');if(e.key==='ArrowDown')move('down')});init();</script></body></html>`,
  },
  {
    title: 'Wordle',
    emoji: '📝',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{background:#0f0f1a;display:flex;flex-direction:column;align-items:center;padding:20px;margin:0;font-family:sans-serif;color:#fff}.grid{display:grid;grid-template-columns:repeat(5,40px);gap:6px;margin:20px 0}.tile{width:40px;height:40px;background:#1a1a2e;border:2px solid #333;display:flex;align-items:center;justify-content:center;font-weight:bold;border-radius:4px}.tile.green{background:#22c55e;border-color:#22c55e}.tile.yellow{background:#f59e0b;border-color:#f59e0b}.tile.gray{background:#6b7280;border-color:#6b7280}input{width:200px;padding:10px;background:#1a1a2e;border:2px solid #333;color:#fff;border-radius:6px;font-size:16px;text-transform:uppercase}button{padding:8px 16px;background:#6366f1;border:none;color:#fff;border-radius:6px;cursor:pointer;margin-top:10px}</style></head><body><h2 style="margin:0 0 20px">Wordle</h2><div class="grid" id="g"></div><p id="msg" style="margin:10px 0;text-align:center;min-height:20px">Guess the word!</p><input id="inp" type="text" maxlength="5" placeholder="Type guess..."><button onclick="guess()">Guess</button><script>const words=['REACT','JAVASCRIPT','FUNCTION','PROMISE','CODING','COMPUTER','WEBSITE','LIBRARY','PYTHON','TYPESCRIPT'];let word=words[Math.floor(Math.random()*words.length)],guesses=[],gameOver=false;function guess(){let g=document.getElementById('inp').value.toUpperCase();if(g.length!==5)return;if(gameOver)return;document.getElementById('inp').value='';guesses.push(g);render();if(g===word){document.getElementById('msg').textContent='You won! 🎉';gameOver=true}else if(guesses.length===6){document.getElementById('msg').textContent='Game Over! Word: '+word;gameOver=true}else{document.getElementById('msg').textContent='Attempt '+(guesses.length)+'/6'}}function render(){let html='';for(let row=0;row<6;row++){for(let col=0;col<5;col++){let char=guesses[row]?guesses[row][col]:'';let cls='';if(guesses[row]){if(guesses[row][col]===word[col])cls='green';else if(word.includes(guesses[row][col]))cls='yellow';else cls='gray'}html+='<div class="tile '+cls+'">'+char+'</div>'}}document.getElementById('g').innerHTML=html}document.addEventListener('keydown',e=>{if(e.key==='Enter')guess()});render();</script></body></html>`,
  },
  {
    title: 'Breakout',
    emoji: '🧱',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{background:#0f0f1a;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif;color:#fff}canvas{border:2px solid #6366f1;display:block;background:#000}#s{font-size:18px;margin:10px 0}</style></head><body><div id="s">Score: 0 | Move: Arrow Keys</div><canvas id="c" width="400" height="300"></canvas><script>const c=document.getElementById('c'),ctx=c.getContext('2d');let p={x:175,w:50,h:10,y:280},b={x:190,y:260,r:5,vx:2,vy:-3},bricks=[],s=0,gameOver=false;for(let i=0;i<6;i++)for(let j=0;j<8;j++)bricks.push({x:j*45+10,y:i*20+20,w:40,h:15});document.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'&&p.x>0)p.x-=15;if(e.key==='ArrowRight'&&p.x<350)p.x+=15});function collideRect(bx,by,bw,bh){if(b.x+b.r>bx&&b.x-b.r<bx+bw&&b.y+b.r>by&&b.y-b.r<by+bh)return true}function update(){if(gameOver)return;b.x+=b.vx;b.y+=b.vy;if(b.x-b.r<0||b.x+b.r>400)b.vx*=-1;if(b.y-b.r<0)b.vy*=-1;if(collideRect(p.x,p.y,p.w,p.h))b.vy*=-1;for(let i=0;i<bricks.length;i++){if(collideRect(bricks[i].x,bricks[i].y,bricks[i].w,bricks[i].h)){b.vy*=-1;bricks.splice(i,1);s+=10;document.getElementById('s').textContent='Score: '+s;break}}if(b.y-b.r>300)gameOver=true}function draw(){ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,400,300);ctx.fillStyle='#6366f1';ctx.fillRect(p.x,p.y,p.w,p.h);ctx.fillStyle='#FFD700';ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#22c55e';bricks.forEach(b=>{ctx.fillRect(b.x,b.y,b.w,b.h)});if(gameOver){ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,400,300);ctx.fillStyle='#fff';ctx.font='30px bold';ctx.textAlign='center';ctx.fillText('Game Over!',200,150);ctx.font='20px';ctx.fillText('Final Score: '+s,200,190)}}function frame(){update();draw();requestAnimationFrame(frame)}frame();</script></body></html>`,
  },
  {
    title: 'Connect 4',
    emoji: '🔴',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{background:#0f0f1a;display:flex;flex-direction:column;align-items:center;padding:20px;margin:0;font-family:sans-serif;color:#fff}.board{display:grid;grid-template-columns:repeat(7,50px);gap:4px;margin:20px 0;background:#1a1a2e;padding:10px;border-radius:8px}.cell{width:50px;height:50px;background:#0a0a14;border-radius:50%;cursor:pointer;border:2px solid #333}#msg{font-size:16px;margin:10px 0}button{padding:8px 16px;background:#6366f1;border:none;color:#fff;border-radius:6px;cursor:pointer}</style></head><body><h2 style="margin:0 0 10px">Connect 4</h2><p id="msg">Red's turn</p><div class="board" id="b"></div><button onclick="init()">New Game</button><script>let board=Array(42).fill(0),turn=1;function render(){let html='';for(let i=0;i<42;i++){let col=idx%7>board[i]?'backgroundColor:#FFD700;cursor:pointer':board[i]===1?'backgroundColor:#FF0000':'backgroundColor:#FFD700';html+='<div class="cell" style="'+col+'" onclick="play('+i+')"></div>'}document.getElementById('b').innerHTML=html}function play(idx){let col=idx%7;let row=0;while(row<6&&board[col+row*7]!==0)row++;if(row===6)return;board[col+row*7]=turn;if(checkWin(col,row*7)){document.getElementById('msg').textContent=(turn===1?'Red':'Yellow')+' wins!'}else{turn=turn===1?2:1;document.getElementById('msg').textContent=(turn===1?'Red':'Yellow')+"'s turn"}render()}function checkWin(x,y){let dirs=[[1,0],[0,1],[1,1],[1,-1]];for(let[dx,dy] of dirs){let cnt=1;for(let i=1;i<4;i++){let nx=x+dx*i,ny=(y+dy*i);if(nx>=0&&nx<7&&ny>=0&&ny<42&&board[nx+ny]===turn)cnt++;else break}for(let i=1;i<4;i++){let nx=x-dx*i,ny=(y-dy*i);if(nx>=0&&nx<7&&ny>=0&&ny<42&&board[nx+ny]===turn)cnt++;else break}if(cnt>=4)return true}return false}function init(){board=Array(42).fill(0);turn=1;document.getElementById('msg').textContent="Red's turn";render()}init();</script></body></html>`,
  },
];

const CREATIVE = [
  {
    title: 'Color Picker',
    emoji: '🎨',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{background:#0f0f1a;display:flex;flex-direction:column;align-items:center;padding:20px;margin:0;font-family:sans-serif;color:#fff;gap:10px}#prev{width:150px;height:70px;border-radius:10px;border:2px solid #333;transition:.3s}input[type=range]{width:150px;accent-color:#6366f1}.row{display:flex;align-items:center;gap:8px}label{font-size:12px;width:14px}#hex{font-size:13px;letter-spacing:1px;padding:5px 10px;background:#1a1a2e;border:1px solid #333;border-radius:6px;color:#fff;text-align:center;width:90px}button{padding:5px 14px;background:#6366f1;border:none;color:#fff;border-radius:6px;cursor:pointer;font-size:12px}</style></head><body><h3 style="margin:0;font-size:14px">Color Picker</h3><div id="prev"></div><input id="hex" readonly value="#6366f1"><div class="row"><label>R</label><input type="range" id="r" min="0" max="255" value="99" oninput="upd()"></div><div class="row"><label>G</label><input type="range" id="g" min="0" max="255" value="102" oninput="upd()"></div><div class="row"><label>B</label><input type="range" id="b" min="0" max="255" value="241" oninput="upd()"></div><button onclick="copy()">Copy Hex</button><script>function upd(){const r=+document.getElementById('r').value,g=+document.getElementById('g').value,b=+document.getElementById('b').value;const h='#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');document.getElementById('prev').style.background=h;document.getElementById('hex').value=h}function copy(){navigator.clipboard?.writeText(document.getElementById('hex').value).then(()=>{const b=document.querySelector('button');b.textContent='Copied!';setTimeout(()=>b.textContent='Copy Hex',1500)})}upd();</script></body></html>`,
  },
  {
    title: 'Analog Clock',
    emoji: '🕐',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{background:#0f0f1a;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif;color:#fff}</style></head><body><canvas id="c" width="200" height="200"></canvas><script>const c=document.getElementById('c'),ctx=c.getContext('2d');function draw(){const now=new Date(),h=now.getHours()%12,m=now.getMinutes(),s=now.getSeconds();ctx.clearRect(0,0,200,200);ctx.save();ctx.translate(100,100);ctx.beginPath();ctx.arc(0,0,88,0,Math.PI*2);ctx.fillStyle='#1a1a2e';ctx.fill();ctx.strokeStyle='#6366f1';ctx.lineWidth=3;ctx.stroke();for(let i=0;i<12;i++){ctx.save();ctx.rotate(i*Math.PI/6);ctx.fillStyle='#444';ctx.fillRect(-1,-88,2,8);ctx.restore()}ctx.save();ctx.rotate((h+m/60)*Math.PI/6);ctx.strokeStyle='#c3e88d';ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,8);ctx.lineTo(0,-52);ctx.stroke();ctx.restore();ctx.save();ctx.rotate((m+s/60)*Math.PI/30);ctx.strokeStyle='#c792ea';ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,10);ctx.lineTo(0,-72);ctx.stroke();ctx.restore();ctx.save();ctx.rotate(s*Math.PI/30);ctx.strokeStyle='#f07178';ctx.lineWidth=1.5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,14);ctx.lineTo(0,-80);ctx.stroke();ctx.restore();ctx.beginPath();ctx.arc(0,0,4,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.restore()}setInterval(draw,1000);draw();</script></body></html>`,
  },
  {
    title: 'Calculator',
    emoji: '🔢',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{background:#0f0f1a;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}.calc{background:#1a1a2e;border-radius:14px;padding:16px;width:210px}#disp{background:#0a0a14;color:#c3e88d;font-size:1.3em;text-align:right;padding:8px 10px;border-radius:7px;margin-bottom:10px;min-height:1.8em;word-break:break-all;font-family:monospace}.btns{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}button{padding:10px;border:none;border-radius:7px;cursor:pointer;font-size:.9em;font-weight:600;transition:.1s}.n{background:#252545;color:#fff}.n:hover{background:#303060}.o{background:#6366f1;color:#fff}.e{background:#c792ea;color:#fff}.c{background:#f07178;color:#fff}</style></head><body><div class="calc"><div id="disp">0</div><div class="btns"><button class="c" onclick="clr()">C</button><button class="o" onclick="app('±')">±</button><button class="o" onclick="app('%')">%</button><button class="o" onclick="app('/')">÷</button><button class="n" onclick="app('7')">7</button><button class="n" onclick="app('8')">8</button><button class="n" onclick="app('9')">9</button><button class="o" onclick="app('*')">×</button><button class="n" onclick="app('4')">4</button><button class="n" onclick="app('5')">5</button><button class="n" onclick="app('6')">6</button><button class="o" onclick="app('-')">−</button><button class="n" onclick="app('1')">1</button><button class="n" onclick="app('2')">2</button><button class="n" onclick="app('3')">3</button><button class="o" onclick="app('+')">+</button><button class="n" style="grid-column:span 2" onclick="app('0')">0</button><button class="n" onclick="app('.')">.</button><button class="e" onclick="calc()">=</button></div></div><script>let x='';const d=document.getElementById('disp');function app(v){if(v==='±'){try{x=String(-eval(x))}catch{}d.textContent=x||'0';return}if(v==='%'){try{x=String(eval(x)/100)}catch{}d.textContent=x||'0';return}x+=v;d.textContent=x}function clr(){x='';d.textContent='0'}function calc(){try{x=String(eval(x.replace('÷','/').replace('×','*').replace('−','-')));d.textContent=x}catch{d.textContent='Err';x=''}}</script></body></html>`,
  },
  {
    title: 'Gradient Gen',
    emoji: '🌈',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{background:#0f0f1a;display:flex;flex-direction:column;align-items:center;padding:16px;margin:0;font-family:sans-serif;color:#fff;gap:8px}#prev{width:200px;height:80px;border-radius:10px;border:2px solid #333;transition:.4s}.row{display:flex;align-items:center;gap:8px;font-size:12px}input[type=color]{width:36px;height:28px;border:none;background:none;cursor:pointer;border-radius:4px}select{background:#1a1a2e;color:#fff;border:1px solid #333;padding:3px 6px;border-radius:5px;font-size:12px}#css{font-size:10px;background:#1a1a2e;padding:6px 8px;border-radius:6px;color:#c3e88d;width:200px;word-break:break-all;text-align:center}button{padding:4px 12px;background:#6366f1;border:none;color:#fff;border-radius:6px;cursor:pointer;font-size:12px}</style></head><body><h3 style="margin:0;font-size:14px">Gradient Gen</h3><div id="prev"></div><div class="row"><input type="color" id="c1" value="#6366f1" oninput="upd()"><span>→</span><input type="color" id="c2" value="#c792ea" oninput="upd()"><select id="dir" onchange="upd()"><option>to right</option><option>to bottom right</option><option>to bottom</option><option>135deg</option></select></div><div id="css"></div><button onclick="copy()">Copy CSS</button><script>function upd(){const c1=document.getElementById('c1').value,c2=document.getElementById('c2').value,dir=document.getElementById('dir').value;const g='linear-gradient('+dir+', '+c1+', '+c2+')';document.getElementById('prev').style.background=g;document.getElementById('css').textContent='background: '+g}function copy(){navigator.clipboard?.writeText(document.getElementById('css').textContent)}upd();</script></body></html>`,
  },
];

const PROMPTS = [
  { label: '🧠 Explain like I\'m 5', text: 'Explain this topic like I\'m 5 years old: ' },
  { label: '💻 Write code for', text: 'Write code for: ' },
  { label: '🐛 Debug this code', text: 'Help me debug this code:\n```\n\n```' },
  { label: '📝 Summarize this', text: 'Summarize the following:\n\n' },
  { label: '✍️ Improve my writing', text: 'Improve the style and clarity of this text:\n\n' },
  { label: '🔍 Compare X vs Y', text: 'Compare and contrast: ' },
  { label: '📋 Create a plan for', text: 'Create a step-by-step plan for: ' },
  { label: '🌐 Translate to Tamil', text: 'Translate the following to Tamil:\n\n' },
];

interface ArtifactPanelProps {
  onClose: () => void;
  projects: Project[];
  activeProjectId: string | null;
  onLoadProject: (id: string) => void;
  onCreateProject: () => void;
  onDeleteProject: (id: string) => void;
  onPromptSelect: (text: string) => void;
}

export function ArtifactPanel({
  onClose, projects, activeProjectId, onLoadProject, onCreateProject, onDeleteProject, onPromptSelect,
}: ArtifactPanelProps) {
  const [tab, setTab] = useState<Tab>('categories');
  const [openItem, setOpenItem] = useState<{ title: string; html: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const items = tab === 'games' ? GAMES : CREATIVE;

  const TABS: { id: Tab; label: string }[] = [
    { id: 'categories', label: '⚡ Artifacts' },
    { id: 'games', label: '🎮 Games' },
    { id: 'creative', label: '🎨 Creative' },
    { id: 'prompts', label: '💬 Prompts' },
    { id: 'projects', label: '📁 Projects' },
  ];

  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === 'scratch') {
      onClose();
    } else if (['apps-websites', 'documents', 'productivity-tools', 'quiz-survey'].includes(categoryId)) {
      setSelectedCategory(categoryId);
      setSuggestions([]);
    } else {
      setTab(categoryId as Tab);
    }
  };

  const fetchSuggestions = async (categoryId: string) => {
    setLoadingSuggestions(true);
    const categoryNames: Record<string, string> = {
      'apps-websites': 'web applications and websites',
      'documents': 'documents and templates',
      'productivity-tools': 'productivity tools',
      'quiz-survey': 'quizzes or surveys',
    };
    const categoryName = categoryNames[categoryId] || categoryId;

    try {
      const msgHistory = [
        { role: 'system', content: 'You are a creative assistant. Generate exactly 3 unique and specific project ideas for the user. Return ONLY a numbered list with no additional text or formatting. Each line should start with a number.' },
        { role: 'user', content: `Suggest 3 specific ideas for building ${categoryName}. Be concise and creative. Format: 1. Idea\n2. Idea\n3. Idea` },
      ];

      const stream = await streamChat('meta-llama/llama-3.2-90b-vision-instruct:free', msgHistory, {
        temperature: 0.8,
        topP: 1,
        maxTokens: 300,
      });

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content ?? '';
            if (delta) fullResponse += delta;
          } catch {
            // ignore JSON parsing errors
          }
        }
      }

      // Parse suggestions from numbered list
      const suggestionArray = fullResponse
        .split('\n')
        .filter(line => /^\d+\./.test(line.trim()))
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(line => line.length > 0)
        .slice(0, 3);

      setSuggestions(suggestionArray.length > 0 ? suggestionArray : ['Try clicking the button again']);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions(['Click the button again to try']);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Full-page Modal */}
      <div className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:rounded-2xl border-0 sm:border border-border bg-surface shadow-2xl flex flex-col animate-fade-in overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        {openItem ? (
          <button
            onClick={() => setOpenItem(null)}
            className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ChevronLeft size={15} />
            Back
          </button>
        ) : tab !== 'categories' ? (
          <button
            onClick={() => setTab('categories')}
            className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ChevronLeft size={15} />
            Back
          </button>
        ) : (
          <span className="text-sm font-semibold text-text-primary">⚡ Artifacts</span>
        )}
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-2 text-text-muted hover:text-text-primary transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      {/* Full iframe when item open */}
      {openItem ? (
        <div className="flex-1 flex flex-col overflow-hidden w-full h-full">
          <div className="px-4 py-2 border-b border-border flex-shrink-0">
            <span className="text-sm font-medium text-text-primary">{openItem.title}</span>
          </div>
          <iframe
            srcDoc={openItem.html}
            sandbox="allow-scripts allow-same-origin"
            className="flex-1 border-0 w-full"
            title={openItem.title}
          />
        </div>
      ) : tab === 'categories' ? (
        <div className="flex-1 flex flex-col overflow-hidden w-full h-full">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 w-full">
            <div className="max-w-2xl mx-auto">
              {selectedCategory ? (
                <>
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setSuggestions([]);
                    }}
                    className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors"
                  >
                    <ChevronLeft size={15} />
                    Back to categories
                  </button>
                  <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-4">
                    {ARTIFACT_CATEGORIES.find(c => c.id === selectedCategory)?.label}
                  </h2>

                  {suggestions.length > 0 ? (
                    <div className="space-y-3">
                      {suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            onPromptSelect(`Create a ${suggestion}: `);
                            onClose();
                          }}
                          className="w-full text-left px-4 py-3 rounded-lg border border-border bg-surface-2 hover:bg-surface-3 transition-colors"
                        >
                          <p className="text-sm text-text-primary">{suggestion}</p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={() => fetchSuggestions(selectedCategory)}
                      disabled={loadingSuggestions}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-accent text-white hover:bg-accent/90 disabled:opacity-50 transition-colors"
                    >
                      <Sparkles size={16} />
                      {loadingSuggestions ? 'Getting suggestions...' : 'Get AI Suggestions'}
                    </button>
                  )}
                </>
              ) : (
                <>
                  <h2 className="text-center text-lg sm:text-xl font-semibold text-text-primary mb-6 sm:mb-8">
                    Let's get cooking! Pick an artifact category or start building your idea from scratch.
                  </h2>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {ARTIFACT_CATEGORIES.map(category => {
                      const Icon = category.icon;
                      return (
                        <button
                          key={category.id}
                          onClick={() => handleCategoryClick(category.id)}
                          className={`flex flex-col items-center justify-center gap-3 p-4 sm:p-6 rounded-xl border border-border hover:border-accent/50 transition-all hover:bg-surface-2 ${category.color}`}
                        >
                          <Icon size={28} className="sm:w-8 sm:h-8" />
                          <span className="text-sm sm:text-base font-medium text-text-primary text-center">{category.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Tabs - only show when not in categories view */}
          {tab !== 'categories' && (
            <div className="flex border-b border-border flex-shrink-0 overflow-x-auto">
              <button
                onClick={() => setTab('categories')}
                className={`px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                  tab === 'categories'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                ⚡ Home
              </button>
              {[
                { id: 'games' as const, label: '🎮 Games' },
                { id: 'creative' as const, label: '🎨 Creative' },
                { id: 'prompts' as const, label: '💬 Prompts' },
                { id: 'projects' as const, label: '📁 Projects' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                    tab === t.id
                      ? 'border-accent text-accent'
                      : 'border-transparent text-text-muted hover:text-text-secondary'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3 w-full">
            {(tab === 'games' || tab === 'creative') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 auto-rows-max">
                {items.map(item => (
                  <button
                    key={item.title}
                    onClick={() => setOpenItem(item)}
                    className="flex flex-col rounded-xl border border-border bg-surface-2 hover:bg-surface-3 overflow-hidden transition-colors text-left h-48 sm:h-56"
                  >
                    <div className="relative w-full flex-1 overflow-hidden">
                      <iframe
                        srcDoc={item.html}
                        sandbox="allow-scripts allow-same-origin"
                        className="absolute inset-0 w-full h-full border-0 pointer-events-none"
                        title={item.title}
                        style={{ transform: 'scale(0.6)', transformOrigin: 'top left', width: '167%', height: '167%' }}
                      />
                    </div>
                    <div className="px-2 py-1.5 flex-shrink-0">
                      <span className="text-xs font-medium text-text-primary">{item.emoji} {item.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {tab === 'prompts' && (
              <div className="space-y-1.5">
                <p className="text-xs text-text-muted mb-3">Click to paste into chat</p>
                {PROMPTS.map(p => (
                  <button
                    key={p.label}
                    onClick={() => { onPromptSelect(p.text); onClose(); }}
                    className="w-full text-left px-3 py-2.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border transition-colors"
                  >
                    <span className="text-xs text-text-primary">{p.label}</span>
                  </button>
                ))}
              </div>
            )}

            {tab === 'projects' && (
              <div className="space-y-2">
                <button
                  onClick={onCreateProject}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-border text-text-muted hover:border-accent hover:text-accent transition-colors text-xs"
                >
                  <Plus size={13} />
                  New Project
                </button>
                {projects.length === 0 ? (
                  <p className="text-xs text-text-muted text-center py-6">No projects yet</p>
                ) : projects.map(proj => (
                  <div
                    key={proj.id}
                    className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-colors cursor-pointer ${
                      activeProjectId === proj.id
                        ? 'border-accent bg-accent/10'
                        : 'border-border bg-surface-2 hover:bg-surface-3'
                    }`}
                    onClick={() => onLoadProject(proj.id)}
                  >
                    <FolderOpen size={13} className={activeProjectId === proj.id ? 'text-accent' : 'text-text-muted'} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text-primary truncate">{proj.name}</p>
                      {proj.systemPrompt && (
                        <p className="text-[10px] text-text-muted truncate">{proj.systemPrompt}</p>
                      )}
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); onDeleteProject(proj.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-red-400 text-text-muted transition-all flex-shrink-0"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
      </div>
    </div>
  );
}
