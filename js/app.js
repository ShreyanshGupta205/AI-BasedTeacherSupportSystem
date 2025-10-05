/* --- In-memory resource store and sample data --- */
const resources = [];

/* Utility functions */
function copyToClipboard(id){
  const el = document.getElementById(id);
  navigator.clipboard.writeText(el.innerText).then(()=>alert('Copied to clipboard'))
}
function printArea(id){
  const content = document.getElementById(id).innerText;
  const w = window.open('','_blank');
  w.document.write('<pre style="font-family:Inter,Arial;white-space:pre-wrap">'+escapeHtml(content)+'</pre>');
  w.document.close();
  w.print();
}
function escapeHtml(text){ return text.replace(/[&<>\"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','\\':'\\\\','"':'&quot;'}[c]; }); }

/* --- Lesson Planner (template-based generator) --- */
function generateLesson(){
  const topic = document.getElementById('lp-topic').value.trim() || 'Untitled Topic';
  const grade = document.getElementById('lp-grade').value;
  const duration = parseInt(document.getElementById('lp-duration').value) || 45;
  const focus = document.getElementById('lp-focus').value || '';

  // Simple heuristic: split into 5 parts (intro, teach, activity, assessment, recap)
  const parts = [
    {title:'Hook & Objectives',perc:10},
    {title:'Direct Instruction',perc:35},
    {title:'Guided Practice',perc:25},
    {title:'Formative Assessment',perc:20},
    {title:'Recap & Homework',perc:10}
  ];

  // Adjust durations
  const plan = parts.map(p=>({title:p.title,time:Math.max(1,Math.round(duration*p.perc/100))}));

  // Generate activities & assessment using keywords from topic/focus
  const keywords = extractKeywords(topic + ' ' + focus);
  const activity = keywords.length? `Activity idea: Group students to create a poster explaining ${keywords.slice(0,2).join(' and ')}.` : 'Activity idea: Think-pair-share on the topic.';
  const assessment = keywords.length? `Quick quiz: 3 short questions on ${keywords[0]}.` : 'Quick quiz: 3 short recall questions.';

  // Compose output
  let out = `Lesson Plan — ${topic}\nGrade / Level: ${grade}\nDuration: ${duration} minutes\n\nObjectives:\n`;
  out += `- By the end of this lesson, students will be able to ${focus || 'demonstrate understanding of the topic.'}\n\n`;
  plan.forEach((p,idx)=>{
    out += `${idx+1}. ${p.title} — ~${p.time} min\n`;
    if(p.title === 'Hook & Objectives') out += `   - Hook: Ask a relatable question or show a short image/video.\n`;
    if(p.title === 'Direct Instruction') out += `   - Teach: Explain the core concept using diagrams and examples.\n`;
    if(p.title === 'Guided Practice') out += `   - ${activity}\n`;
    if(p.title === 'Formative Assessment') out += `   - ${assessment}\n`;
    if(p.title === 'Recap & Homework') out += `   - Homework: Short worksheet + reflection prompt.\n`;
  });

  out += `\nMaterials & Resources:\n- Slides / images / short video (search recommended)\n- Worksheet (create from quiz builder)\n\nDifferentiation:\n- Provide simplified notes for struggling learners, extension task for advanced learners.\n\nNotes:\n- Teacher review required for accuracy. This is an AI-assisted template to speed planning.`;

  document.getElementById('lesson-output').innerText = out;
}

function extractKeywords(text){
  // super-simple keyword extractor: split by space, filter common words
  const stop = new Set(['the','and','a','of','to','in','for','on','with','is','are','by','this','that']);
  return text.toLowerCase().split(/[^a-z0-9]+/).filter(w=>w && !stop.has(w)).slice(0,6);
}

/* --- Quiz Builder (rule-based) --- */
function generateQuiz(){
  const topic = document.getElementById('q-topic').value.trim() || 'General Topic';
  const count = parseInt(document.getElementById('q-count').value) || 5;
  const diff = document.getElementById('q-diff').value;

  const k = extractKeywords(topic);
  const out = [];
  for(let i=1;i<=count;i++){
    const base = k[i%k.length] || topic.split(' ')[0];
    const q = {
      id:i,
      question: makeQuestion(base,diff,i),
      options: makeOptions(base,diff),
      answer: 1
    };
    out.push(q);
  }

  renderQuiz(out);
  // Save to window for grading
  window._lastQuiz = out;
}

function makeQuestion(base,diff,i){
  if(diff==='Easy') return `What is the main idea related to ${base}?`;
  if(diff==='Hard') return `Explain in detail the process involving ${base} and its role.`;
  return `Which statement best describes ${base}?`;
}
function makeOptions(base,diff){
  return [
    `Correct explanation about ${base}`,
    `Partially correct statement about ${base}`,
    `Irrelevant statement`,
    `Incorrect opposite statement`
  ];
}

function renderQuiz(quiz){
  const el = document.getElementById('quiz-output');
  let html = '';
  quiz.forEach(q=>{
    html += `${q.id}. ${q.question}\n`;
    q.options.forEach((opt,idx)=> html += `   ${String.fromCharCode(65+idx)}. ${opt}\n`);
    html += `\n`;
  });
  el.innerText = html;
}

function gradeSampleAnswers(){
  // very simple demo grading: assume student answered A for all
  const quiz = window._lastQuiz || [];
  if(!quiz.length){alert('Generate a quiz first');return}
  let correct = 0;
  quiz.forEach(q=>{ if(q.answer===1) correct++; });
  const score = Math.round((correct/quiz.length)*100);
  const feedback = `Sample Student Score: ${score}%\nCorrect: ${correct} / ${quiz.length}\nTeacher tip: Review questions where students chose B/C.`;
  document.getElementById('quiz-output').innerText += '\n' + feedback;
}

/* --- Chatbot (simple template replies + memory of doubts) --- */
const doubtLog = [];
function chatAsk(){
  const q = document.getElementById('chat-input').value.trim();
  if(!q){alert('Type a question');return}
  const ans = generateChatReply(q);
  doubtLog.push({q,ans,time:new Date().toLocaleString()});
  renderChat();
}
function generateChatReply(q){
  const kw = extractKeywords(q);
  if(kw.includes('stomata')) return 'Stomata are tiny pores on leaves that allow gas exchange. They help plants breathe and control water loss.';
  if(kw.includes('photosynthesis')) return 'Photosynthesis is the process where plants use sunlight to turn carbon dioxide and water into glucose and oxygen.';
  if(kw.includes('what')||kw.includes('define')) return 'Short answer: ' + q;
  return 'Good question! Here is a concise explanation: ' + q + '\n\n(Teachers: consider adding a short example and a 1-minute activity.)';
}
function renderChat(){
  const el = document.getElementById('chat-output');
  el.innerHTML = '';
  doubtLog.slice().reverse().forEach(d=>{
    el.innerHTML += `<div style=\"margin-bottom:8px\"><strong>Q:</strong> ${escapeHtml(d.q)}<br/><strong>A:</strong> ${escapeHtml(d.ans)}<div class=\"muted\">${d.time}</div></div>`;
  });
}
function summarizeDoubts(){
  if(!doubtLog.length){alert('No doubts yet');return}
  // teacher summary: top 3 repeated keywords
  const all = doubtLog.map(d=>d.q).join(' ');
  const kws = extractKeywords(all);
  const summary = `Teacher Summary:\n- Total doubts: ${doubtLog.length}\n- Top keywords: ${kws.slice(0,5).join(', ')}\n- Suggestion: Include a 10-min recap on ${kws[0] || 'key topic'}.`;
  document.getElementById('chat-output').innerText = summary;
}

/* --- Resource Hub --- */
function addResource(){
  const title = document.getElementById('res-title').value.trim();
  const tags = document.getElementById('res-tags').value.split(',').map(s=>s.trim()).filter(Boolean);
  if(!title){alert('Add a title');return}
  resources.push({title,tags,added:new Date().toLocaleString()});
  renderResources();
}
function renderResources(){
  const el = document.getElementById('res-list');
  if(!resources.length){el.innerHTML='<div class="muted">No resources added yet.</div>';return}
  el.innerHTML = resources.map((r,i)=>`<div style="padding:8px;border-radius:8px;margin-bottom:6px;background:#f8fafc">${i+1}. <strong>${escapeHtml(r.title)}</strong><div class=\"muted\">Tags: ${escapeHtml(r.tags.join(', '))} • ${r.added}</div></div>`).join('');
}
function suggestResources(){
  const topic = prompt('Enter topic to suggest resources for','Photosynthesis') || '';
  if(!topic) return;
  const kws = extractKeywords(topic);
  const matches = resources.filter(r=>r.tags.some(t=>kws.includes(t.toLowerCase())));
  if(matches.length){
    alert('Suggested resources:\n' + matches.map(m=>m.title).join('\n'));
  } else alert('No exact matches — try adding resources tagged with topic keywords.');
}

/* --- Dashboard exports & utilities --- */
function downloadCSV(){
  // sample CSV from dummy data
  const rows = [
    ['student','topic','score','lastActive'],
    ['Aman','Photosynthesis','62','2025-09-20'],
    ['Priya','Photosynthesis','45','2025-09-18'],
    ['Rahul','Fractions','78','2025-09-25']
  ];
  const csv = rows.map(r=>r.join(',')).join('\n');
  const blob = new Blob([csv],{type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');a.href=url;a.download='sample_report.csv';a.click();URL.revokeObjectURL(url);
}

function downloadPitch(){
  // simple generated pitch text as a .txt for demo (replace with real PPT in production)
  const pitch = `AI-Based Teacher Support — Pitch\n\nProblem: Teachers spend hours planning and grading.\nSolution: AI assistant for lesson planning, quizzes, analytics, and doubt assistance.\nMVP: Live lesson planner, quiz builder, demo dashboard.\nContact: YourTeam@example.com`;
  const blob = new Blob([pitch],{type:'text/plain'});
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='pitch.txt'; a.click(); URL.revokeObjectURL(url);
}

// Initialize
renderResources();
