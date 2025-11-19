// dictation.js
let dictWords = [];
let dictCurrent = null;
let dictCorrect = Number(localStorage.getItem('kz_dict_correct')) || 0;
let dictTotal = Number(localStorage.getItem('kz_dict_total')) || 0;

async function loadDict(){
  const res = await fetch('words.json');
  dictWords = await res.json();
  populateDifficulty();
  newDictWord();
  updateDictStats();
}

function populateDifficulty(){
  const sel = document.getElementById('difficulty');
  const cats = Array.from(new Set(dictWords.map(w=>w.category)));
  cats.forEach(c=>{
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    sel.appendChild(opt);
  });
}

function choosePool(){
  const diff = document.getElementById('difficulty').value;
  return diff === 'all' ? dictWords : dictWords.filter(w=>w.category===diff);
}

function newDictWord(){
  const pool = choosePool();
  if(!pool.length) return;
  dictCurrent = pool[Math.floor(Math.random()*pool.length)];
  document.getElementById('dict-input').value = '';
  document.getElementById('dict-feedback').textContent = '';
  speak(dictCurrent.korean);
}

function speak(text){
  if(!('speechSynthesis' in window)){ alert('Synthèse vocale indisponible.'); return; }
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ko-KR';
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

document.getElementById('playWord').addEventListener('click', ()=> speak(dictCurrent.korean));
document.getElementById('replay').addEventListener('click', ()=> speak(dictCurrent.korean));
document.getElementById('newWord').addEventListener('click', newDictWord);

document.getElementById('check').addEventListener('click', ()=>{
  const val = document.getElementById('dict-input').value.trim();
  dictTotal++;
  localStorage.setItem('kz_dict_total', dictTotal);
  if(val === dictCurrent.korean){
    dictCorrect++;
    localStorage.setItem('kz_dict_correct', dictCorrect);
    document.getElementById('dict-feedback').textContent = '✔️ Exact !';
    // mark known
    const known = JSON.parse(localStorage.getItem('kz_known') || '{}');
    known[dictCurrent.korean] = (known[dictCurrent.korean]||0)+1;
    localStorage.setItem('kz_known', JSON.stringify(known));
  } else {
    document.getElementById('dict-feedback').textContent = `❌ Faux — ${dictCurrent.korean}`;
  }
  updateDictStats();
  setTimeout(newDictWord, 900);
});

function updateDictStats(){
  document.getElementById('dict-correct').textContent = dictCorrect;
  document.getElementById('dict-total').textContent = dictTotal;
}

loadDict();
