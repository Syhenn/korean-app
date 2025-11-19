// quiz.js
let quizWords = [];
let score = Number(localStorage.getItem('kz_quiz_correct')) || 0;
let total = Number(localStorage.getItem('kz_quiz_total')) || 0;

async function loadQuizWords(){
  const res = await fetch('words.json');
  quizWords = await res.json();
  document.getElementById('score').textContent = score;
  document.getElementById('total').textContent = total;
  nextQuestion();
}

function nextQuestion(){
  if(!quizWords.length) return;
  // Option "base only"
  const onlyBase = document.getElementById('onlyBase') ? document.getElementById('onlyBase').checked : false;
  const pool = onlyBase ? quizWords.filter(w=>w.category==='base') : quizWords;

  const correct = pool[Math.floor(Math.random()*pool.length)];
  let choices = [correct];
  while(choices.length < 4){
    const r = pool[Math.floor(Math.random()*pool.length)];
    if(!choices.includes(r)) choices.push(r);
  }
  choices.sort(()=>Math.random()-0.5);

  document.getElementById('question').textContent = `Que signifie : ${correct.korean} (${correct.romanization}) ?`;
  const container = document.getElementById('choices');
  container.innerHTML = '';
  choices.forEach(c=>{
    const btn = document.createElement('button');
    btn.textContent = c.french;
    btn.onclick = ()=> checkAnswer(c, correct);
    container.appendChild(btn);
  });
}

function checkAnswer(choice, correct){
  total++;
  localStorage.setItem('kz_quiz_total', total);

  if(choice === correct){
    score++;
    localStorage.setItem('kz_quiz_correct', score);
    document.getElementById('feedback').textContent = '✔️ Correct !';
  } else {
    document.getElementById('feedback').textContent = `❌ Faux — réponse : ${correct.french}`;
  }

  document.getElementById('score').textContent = score;
  document.getElementById('total').textContent = total;

  // Save brief history for stats page
  pushHistory(score, total);

  setTimeout(()=>{
    document.getElementById('feedback').textContent = '';
    nextQuestion();
  }, 900);
}

document.getElementById('next-q').addEventListener('click', nextQuestion);
document.getElementById('reset-score').addEventListener('click', ()=>{
  if(confirm('Réinitialiser la progression du quiz ?')){
    score = 0; total = 0;
    localStorage.setItem('kz_quiz_correct', 0);
    localStorage.setItem('kz_quiz_total', 0);
    document.getElementById('score').textContent = 0;
    document.getElementById('total').textContent = 0;
  }
});

// Keep a tiny history for stats (max 20 entries)
function pushHistory(corr, tot){
  const history = JSON.parse(localStorage.getItem('kz_history') || '[]');
  history.push({date: Date.now(), correct: corr, total: tot});
  while(history.length>20) history.shift();
  localStorage.setItem('kz_history', JSON.stringify(history));
}

loadQuizWords();
