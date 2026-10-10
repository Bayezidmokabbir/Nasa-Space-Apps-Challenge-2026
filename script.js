const missions = [
  {id:'rocket', title:'Rocket Launch', emoji:'🚀', art:'rocket', level:'Beginner', xp:30, desc:'Prepare a rocket for a safe launch by completing each pre-flight check.', steps:['Fuel the rocket','Check launch systems','Start the countdown','Launch successfully']},
  {id:'rover', title:'Mars Rover', emoji:'🤖', art:'rover', level:'Intermediate', xp:40, desc:'Guide a rover across the Martian surface and reach the target without hitting obstacles.', steps:['Check the rover map','Choose a safe route','Avoid rocky obstacles','Reach the target']},
  {id:'quiz', title:'Space Quiz', emoji:'🪐', art:'quiz', level:'Beginner', xp:20, desc:'Test your knowledge about planets, astronauts, and our solar system.', steps:['Read the question','Choose your answer','Review the explanation','Complete the quiz']},
  {id:'satellite', title:'Satellite Mission', emoji:'🛰️', art:'satellite', level:'Challenge', xp:50, desc:'Learn how satellites observe Earth and collect information from orbit.', steps:['Choose an observation goal','Set satellite orbit','Collect Earth data','Send data to mission control']}
];
let activeMission = 'rocket';
let stepIndex = 0;
let completed = new Set();
let xp = 0;
let quizAnswered = false;

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

function showPage(page){
  $$('.page').forEach(p=>p.classList.toggle('active',p.id===page));
  $$('.nav-link').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
  window.scrollTo({top:0,behavior:'smooth'});
}
document.addEventListener('click',e=>{
  const pageBtn=e.target.closest('[data-page]');
  if(pageBtn){e.preventDefault();showPage(pageBtn.dataset.page);}
  const missionBtn=e.target.closest('[data-mission]');
  if(missionBtn) selectMission(missionBtn.dataset.mission);
  const learnBtn=e.target.closest('[data-topic]');
  if(learnBtn) showTopic(learnBtn.dataset.topic);
  if(e.target.closest('[data-quiz]')) startQuiz();
});

function renderMissionCards(target){
  $(target).innerHTML=missions.map(m=>`
    <article class="mission-card">
      <div class="mission-art art-${m.art}"><span>${m.emoji}</span></div>
      <div class="mission-content"><div class="card-meta"><span class="tag">${m.level}</span><span>⭐ ${m.xp} XP</span></div>
      <h3>${m.title}</h3><p>${m.desc}</p>
      <button class="btn primary" data-mission="${m.id}">${completed.has(m.id)?'Play Again':'Start Mission'} →</button></div>
    </article>`).join('');
}
function selectMission(id){
  activeMission=id;stepIndex=0;
  const m=missions.find(x=>x.id===id);
  $('#missionTitle').textContent=m.title;
  $('#missionDescription').textContent=m.desc;
  $('#simStatus').textContent=id==='rocket'?'Ready for launch?':id==='rover'?'Rover awaiting commands':id==='quiz'?'Quiz systems ready':'Satellite awaiting orbit';
  $('.sim-rocket').textContent=m.emoji;
  $('.sim-rocket').style.transform='translateY(0) rotate(0)';
  $('#simVisual').style.background=id==='rover'?'linear-gradient(#bd7652,#a84d34 72%,#5c302d)':id==='satellite'?'linear-gradient(#07102e,#153d7a 75%,#07102e)':'linear-gradient(#09234e,#1a6d9e 70%,#d18a58)';
  $('#nextStep').textContent='Start mission →';
  $('#stepHint').textContent='Follow the checklist in order.';
  renderSteps();
  $('#missionWorkspace').scrollIntoView({behavior:'smooth',block:'start'});
  showToast(m.title+' selected. Mission control is ready!');
}
function renderSteps(){
  const m=missions.find(x=>x.id===activeMission);
  $('#missionSteps').innerHTML=m.steps.map((s,i)=>`<div class="step ${i<stepIndex?'done':''}"><span class="step-num">${i<stepIndex?'✓':i+1}</span><span>${s}</span></div>`).join('');
}
$('#nextStep').addEventListener('click',()=>{
  const m=missions.find(x=>x.id===activeMission);
  if(stepIndex<m.steps.length){
    const current=m.steps[stepIndex];
    $('#simStatus').textContent=current+' ✓';
    stepIndex++;
    if(activeMission==='rocket') $('.sim-rocket').style.transform=`translateY(-${stepIndex*42}px) rotate(${stepIndex===4?10:0}deg)`;
    if(activeMission==='rover') $('.sim-rocket').style.transform=`translate(${stepIndex*30}px, -${stepIndex*10}px)`;
    if(activeMission==='satellite') $('.sim-rocket').style.transform=`translate(${stepIndex*18}px, -${stepIndex*17}px) rotate(${stepIndex*25}deg)`;
    renderSteps();
    if(stepIndex<m.steps.length){$('#nextStep').textContent='Next step →';$('#stepHint').textContent=`Step ${stepIndex} of ${m.steps.length} complete.`;}
    else{
      $('#simStatus').textContent='MISSION COMPLETE! ✨';
      $('#nextStep').textContent='Play again ↻';
      $('#stepHint').textContent=`Great work! You earned ${m.xp} XP.`;
      if(!completed.has(activeMission)){completed.add(activeMission);xp+=m.xp;updateProgress();showToast(`Mission complete! +${m.xp} XP earned`);}
      else showToast('Mission replay complete!');
    }
  }else{stepIndex=0;$('.sim-rocket').style.transform='translateY(0)';$('#simStatus').textContent='Ready for another run?';$('#nextStep').textContent='Start mission →';renderSteps();}
});
function updateProgress(){
  $('#xpTotal').textContent=xp;$('#completedCount').textContent=completed.size;
  const level=Math.floor(xp/100)+1, remaining=xp%100;
  $('#level').textContent=level;$('#xpFill').style.width=remaining+'%';$('#xpText').textContent=`${remaining} / 100 XP to next level`;
  const badgeData=[['🚀','First Launch','Complete Rocket Launch','rocket'],['🤖','Mars Explorer','Complete Mars Rover','rover'],['🧠','Space Quiz Master','Complete Space Quiz','quiz'],['🛰️','Orbit Observer','Complete Satellite Mission','satellite']];
  $('#badges').innerHTML=badgeData.map(b=>`<div class="badge-item ${completed.has(b[3])?'earned':''}"><span class="badge-emoji">${b[0]}</span><strong>${b[1]}</strong><small>${completed.has(b[3])?'Unlocked':'Locked'}</small></div>`).join('');
  $('#missionLog').innerHTML=completed.size?missions.filter(m=>completed.has(m.id)).map(m=>`<div class="log-row"><strong>${m.emoji} ${m.title}</strong><span>Completed · +${m.xp} XP</span></div>`).join(''):'No missions completed yet. Choose a mission and start exploring!';
  renderMissionCards('#featuredMissions');renderMissionCards('#allMissions');
}
const topics={
  planets:{emoji:'🪐',title:'Meet the planets',text:'Our solar system has eight planets orbiting the Sun. Mars is called the Red Planet because iron minerals in its soil give the surface a rusty color. Earth is the only planet currently known to support life.',fact:'SPACE FACT: A day on Mars is about 24.6 hours.'},
  rockets:{emoji:'🚀',title:'How rockets fly',text:'A rocket moves forward by pushing hot gas backward. This is an example of Newton’s third law: every action has an equal and opposite reaction. Rockets need enough thrust to overcome gravity and travel into space.',fact:'SPACE FACT: Rockets carry both fuel and oxidizer.'},
  rovers:{emoji:'🤖',title:'Robots on Mars',text:'Mars rovers are robotic explorers. They use cameras, scientific instruments, and onboard computers to study rocks, soil, and the environment. Engineers on Earth send commands, and the rover returns data.',fact:'SPACE FACT: Perseverance collected samples on Mars.'},
  astronauts:{emoji:'👩‍🚀',title:'Life as an astronaut',text:'Astronauts train to work safely in microgravity, operate spacecraft systems, perform experiments, and cooperate with their crew. Teamwork, careful planning, and problem-solving are essential in every mission.',fact:'SPACE FACT: Astronauts exercise in space to help keep their muscles strong.'}
};
function showTopic(topic){
  $$('.learn-tab').forEach(b=>b.classList.toggle('active',b.dataset.topic===topic));
  const t=topics[topic];$('#learnCard').innerHTML=`<div class="learn-emoji">${t.emoji}</div><div><p class="eyebrow">MISSION KNOWLEDGE</p><h2>${t.title}</h2><p>${t.text}</p><span class="fact-pill">${t.fact}</span></div>`;
}
const questions=[
  {q:'Which planet is known as the Red Planet?',opts:['Earth','Mars','Jupiter','Venus'],answer:1,why:'Mars looks reddish because iron minerals in its soil have oxidized, or rusted.'},
  {q:'What force keeps planets in orbit around the Sun?',opts:['Magnetism','Friction','Gravity','Sound'],answer:2,why:'Gravity attracts objects with mass and helps keep planets in orbit.'},
  {q:'What does a rover do?',opts:['Explore a surface','Carry people to school','Make oxygen instantly','Orbit like a moon'],answer:0,why:'A rover is a robotic vehicle that explores the surface of another world.'}
];
let qIndex=0, quizScore=0;
function startQuiz(){
  qIndex=0;quizScore=0;quizAnswered=false;
  $('#quizBox').classList.remove('hidden');renderQuestion();
  $('#quizBox').scrollIntoView({behavior:'smooth',block:'center'});
}
function renderQuestion(){
  const q=questions[qIndex];
  $('#quizBox').innerHTML=`<p class="eyebrow">SPACE QUIZ · QUESTION ${qIndex+1}/${questions.length}</p><h3>${q.q}</h3><div class="quiz-options">${q.opts.map((o,i)=>`<button class="quiz-option" data-answer="${i}">${String.fromCharCode(65+i)}. ${o}</button>`).join('')}</div><p id="quizFeedback" class="mission-log"></p><button id="quizNext" class="btn primary hidden">${qIndex===questions.length-1?'Finish quiz':'Next question →'}</button>`;
  $$('#quizBox [data-answer]').forEach(btn=>btn.addEventListener('click',()=>{
    if(quizAnswered)return;quizAnswered=true;
    const picked=Number(btn.dataset.answer);
    $$('#quizBox [data-answer]').forEach((b,i)=>{b.disabled=true;if(i===q.answer)b.classList.add('correct');if(i===picked&&picked!==q.answer)b.classList.add('wrong');});
    if(picked===q.answer)quizScore++;
    $('#quizFeedback').textContent=(picked===q.answer?'Correct! ':'Not quite. ')+q.why;
    $('#quizNext').classList.remove('hidden');
  }));
  $('#quizNext').addEventListener('click',()=>{
    if(qIndex<questions.length-1){qIndex++;quizAnswered=false;renderQuestion();}
    else{
      const earned=quizScore*10;xp+=earned;completed.add('quiz');updateProgress();
      $('#quizBox').innerHTML=`<p class="eyebrow">QUIZ COMPLETE</p><h3>You scored ${quizScore} / ${questions.length} 🎉</h3><p class="mission-log">You earned ${earned} XP. Keep learning and try again to improve your score.</p><button class="btn primary" id="retryQuiz">Try again ↻</button>`;
      $('#retryQuiz').addEventListener('click',startQuiz);showToast(`Quiz complete! +${earned} XP`);
    }
  });
}
function showToast(message){const t=$('#toast');t.textContent=message;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2400);}
renderMissionCards('#featuredMissions');renderMissionCards('#allMissions');renderSteps();showTopic('planets');updateProgress();
