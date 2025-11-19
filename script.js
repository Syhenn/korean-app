// script.js
let words = [];
let filteredWords = [];
let index = 0;

// Statistiques stockées localement
const stats = {
  seen: JSON.parse(localStorage.getItem('kz_seen')) || {},
  known: JSON.parse(localStorage.getItem('kz_known')) || {},
  hard: JSON.parse(localStorage.getItem('kz_hard')) || {},
  quiz: { correct: Number(localStorage.getItem('kz_quiz_correct')) || 0, total: Number(localStorage.getItem('kz_quiz_total')) || 0 }
};

async function loadWords() {
  try {
    const res = await fetch('words.json');
    words = await res.json();
  } catch (e) {
    console.error('Impossible de charger words.json — utilise un serveur local', e);
    alert('Erreur : impossible de charger words.json. Lancez un serveur local (ex: python -m http.server).');
    return;
  }

  populateCategories();
  filteredWords = [...words];
  shuffleArray(filteredWords);
  index = 0;
  renderCard();
  updateSidebar();
}

function populateCategories(){
  const catSelect = document.getElementById('category');
  const set = new Set(words.map(w=>w.category));
  set.forEach(c=>{
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = capitalize(c);
    catSelect.appendChild(opt);
  });
}

function renderCard(){
  if(!filteredWords.length){
    document.getElementById('korean').textContent = 'Aucun mot';
    document.getElementById('romanization').textContent = '';
    document.getElementById('french').textContent = '';
    return;
  }
  const w = filteredWords[index];
  document.getElementById('korean').textContent = w.korean;
  document.getElementById('romanization').textContent = w.romanization;
  document.getElementById('french').textContent = 'Clique pour voir la traduction';
  markSeen(w);
}

function markSeen(w){
  stats.seen[w.korean] = (stats.seen[w.korean] || 0) + 1;
  localStorage.setItem('kz_seen', JSON.stringify(stats.seen));
  updateSidebar();
}

function updateSidebar(){
  document.getElementById('seen').textContent = Object.keys(stats.seen).length;
  document.getElementById('knownCount').textContent = Object.keys(stats.known).length;
  document.getElementById('hardCount').textContent = Object.keys(stats.hard).length;
}

function capitalize(s){ return s.charAt(0).toUpperCase()+s.slice(1) }
function shuffleArray(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]] } }

// Events
document.addEventListener('click', (e)=>{
  const card = document.getElementById('card');
  if(card.contains(e.target)){
    const frenchDiv = document.getElementById('french');
    const w = filteredWords[index];
    if(frenchDiv.textContent === 'Clique pour voir la traduction') {
      frenchDiv.textContent = w.french;
    } else {
      nextCard();
    }
  }
});

document.getElementById('category').addEventListener('change',(e)=>{
  const v = e.target.value;
  filteredWords = v === 'all' ? [...words] : words.filter(w=>w.category === v);
  index = 0;
  shuffleArray(filteredWords);
  renderCard();
});

document.getElementById('shuffle').addEventListener('click', ()=>{
  shuffleArray(filteredWords);
  index = 0;
  renderCard();
});

document.getElementById('next').addEventListener('click', nextCard);
document.getElementById('prev').addEventListener('click', ()=>{
  index = (index - 1 + filteredWords.length) % filteredWords.length;
  renderCard();
});

function nextCard(){
  index = (index + 1) % filteredWords.length;
  renderCard();
}

document.getElementById('speak').addEventListener('click', ()=>{
  if(!filteredWords.length) return;
  const word = filteredWords[index].korean;
  speak(word);
});

document.getElementById('mark-known').addEventListener('click',()=>{
  const w = filteredWords[index];
  stats.known[w.korean] = (stats.known[w.korean] || 0) + 1;
  localStorage.setItem('kz_known', JSON.stringify(stats.known));
  updateSidebar();
});
document.getElementById('mark-hard').addEventListener('click',()=>{
  const w = filteredWords[index];
  stats.hard[w.korean] = (stats.hard[w.korean] || 0) + 1;
  localStorage.setItem('kz_hard', JSON.stringify(stats.hard));
  updateSidebar();
});

// Speech synthesis
function speak(text){
  if(!('speechSynthesis' in window)){
    alert('Synthèse vocale non disponible dans ce navigateur.');
    return;
  }
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ko-KR';
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

// Init
loadWords();
