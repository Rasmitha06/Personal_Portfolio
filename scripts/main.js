// Cursor
const cursor=document.getElementById('cursor'),ring=document.getElementById('cursorRing');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cursor.style.left=mx+'px';cursor.style.top=my+'px';});
(function animRing(){rx+=(mx-rx)*0.12;ry+=(my-ry)*0.12;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(animRing);})();
document.querySelectorAll('a,button,input,.project-card').forEach(el=>{
  el.addEventListener('mouseenter',()=>{ring.style.width='54px';ring.style.height='54px';});
  el.addEventListener('mouseleave',()=>{ring.style.width='34px';ring.style.height='34px';});
});

// Neural net canvas
const canvas=document.getElementById('bg-canvas'),ctx=canvas.getContext('2d');
let W,H,nodes=[];
function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;}
resize();window.addEventListener('resize',resize);
function makeNodes(n){nodes=[];for(let i=0;i<n;i++)nodes.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,r:Math.random()*2+1});}
makeNodes(70);
function drawNet(){
  ctx.clearRect(0,0,W,H);
  const maxDist=160;
  for(let i=0;i<nodes.length;i++){
    for(let j=i+1;j<nodes.length;j++){
      const dx=nodes[i].x-nodes[j].x,dy=nodes[i].y-nodes[j].y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<maxDist){ctx.beginPath();ctx.moveTo(nodes[i].x,nodes[i].y);ctx.lineTo(nodes[j].x,nodes[j].y);ctx.strokeStyle=`rgba(0,180,255,${(1-d/maxDist)*.22})`;ctx.lineWidth=.6;ctx.stroke();}
    }
    ctx.beginPath();ctx.arc(nodes[i].x,nodes[i].y,nodes[i].r,0,Math.PI*2);ctx.fillStyle='rgba(0,212,255,0.45)';ctx.fill();
    nodes[i].x+=nodes[i].vx;nodes[i].y+=nodes[i].vy;
    if(nodes[i].x<0||nodes[i].x>W)nodes[i].vx*=-1;
    if(nodes[i].y<0||nodes[i].y>H)nodes[i].vy*=-1;
  }
  requestAnimationFrame(drawNet);
}
drawNet();

// Typing
const phrases=['ML · Computer Vision · NLP','Python · TensorFlow · OpenCV','Building systems that understand humans','Available May 2026'];
let pi=0,ci=0,deleting=false,pauseCount=0;
const el=document.getElementById('typed');
function type(){
  const phrase=phrases[pi];
  if(!deleting&&ci<=phrase.length){el.textContent=phrase.slice(0,ci++);}
  else if(deleting&&ci>=0){el.textContent=phrase.slice(0,ci--);}
  if(ci>phrase.length){deleting=true;if(pauseCount++<18)return;pauseCount=0;}
  if(ci<0){deleting=false;pi=(pi+1)%phrases.length;ci=0;}
  setTimeout(type,deleting?38:72);
}
type();


// Scroll reveal
const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');}),{threshold:0.12});
document.querySelectorAll('.reveal').forEach(r=>obs.observe(r));
document.addEventListener("DOMContentLoaded", () => {

  const toggleBtns = document.querySelectorAll('[data-toggle-btn]');

  const skillLists = [
    document.querySelector('.languages-list'),
    document.querySelector('.cloud-list'),
    document.querySelector('.data-list'),
    document.querySelector('.machine-learning-list'),
    document.querySelector('.tools-list')
  ];

  skillLists.forEach((list, index) => {
    if (!list) return;
    list.style.display = index === 0 ? 'grid' : 'none';
  });

  toggleBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {

      toggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      skillLists.forEach((list, i) => {
        if (!list) return;
        list.style.display = i === index ? 'grid' : 'none';
      });

    });
  });

});
// Terminal
const output=document.getElementById('tw-output'),input=document.getElementById('tw-input');
const cmds={
  help:()=>`<span class="tw-output">Available commands:</span><br><span class="tw-output">  about · projects · skills · contact · hire · clear</span>`,
  about:()=>`<span class="tw-output">Rasmitha Chinthalapally — MSc CS @ USF · GPA 3.89 · Tampa, FL</span><br><span class="tw-output">Focus: ML pipelines, CV, NLP, inference optimization</span>`,
  projects:()=>`<span class="tw-output">1. Sign Language Recognition   → 93% acc, &lt;20ms</span><br><span class="tw-output">2. Malicious URL Detection      → published JST 2023</span><br><span class="tw-output">3. Speech Emotion Recognition   → 91% F1-score</span><br><span class="tw-output">4. CCTV Activity Detection      → 90% acc, ResNet</span>`,
  skills:()=>`<span class="tw-output">Python · TensorFlow · Keras · Scikit-learn · OpenCV · MediaPipe</span><br><span class="tw-output">Azure · AWS · SQL · MongoDB · Power BI · Git</span>`,
  contact:()=>`<span class="tw-output">rasmitha@usf.edu · linkedin.com/in/rasmithach03 · github.com/Rasmitha06</span>`,
  hire:()=>`<span class="tw-output">🎉 Excellent decision. Available May 2026 · Open to relocation</span>`,
  clear:()=>{output.innerHTML='';return null;}
};
function addLine(html){if(html===null)return;const d=document.createElement('div');d.className='tw-line';d.innerHTML=html;output.appendChild(d);output.scrollTop=output.scrollHeight;}
addLine(`<span class="tw-prompt">Initializing rasmitha.dev...</span>`);
addLine(`<span class="tw-output">System ready. Type 'help' for commands.</span>`);
input.addEventListener('keydown',e=>{
  if(e.key==='Enter'){
    const v=input.value.trim().toLowerCase();
        addLine(`<span class="tw-prompt">$ </span>${input.value}`);
    if(cmds[v])addLine(cmds[v]());
    else addLine(`<span class="tw-error">command not found: ${v}. Try 'help'.</span>`);
    input.value='';
  }
});


// ─── THEME TOGGLE ───
const themeToggle = document.getElementById('theme-toggle');
let isLight = false;

function applyTheme(light) {
  isLight = light;
  document.body.classList.toggle('light', isLight);
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

themeToggle.addEventListener('click', () => applyTheme(!isLight));

if (localStorage.getItem('theme') === 'light') applyTheme(true);

