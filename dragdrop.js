// dragdrop.js
let dragWords = [];
let dragPool = [];
let dragCorrect = 0;
let dragTotal = 0;

async function loadDrag(){
  const res = await fetch('words.json');
  dragWords = await res.json();
  populateDragCats();
  document.getElementById('start-drag').addEventListener('click', startDrag);
}

function populateDragCats(){
  const sel = document.getElementById('drag-cat');
  const cats = Array.from(new Set(dragWords.map(w=>w.category)));
  cats.forEach(c=>{
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    sel.appendChild(opt);
  });
}

function startDrag(){
  const cat = document.getElementById('drag-cat').value;
  dragPool = cat === 'all' ? [...dragWords] : dragWords.filter(w=>w.category===cat);
  if(dragPool.length < 4){
    alert('Pas assez de mots pour jouer dans cette catégorie (min 4).');
    return;
  }
  // pick up to 6 pairs
  shuffleArray(dragPool);
  dragPool = dragPool.slice(0, Math.min(6, dragPool.length));
  renderDrag();
  dragCorrect = 0; dragTotal = dragPool.length;
  updateDragStats();
}

function renderDrag(){
  const left = document.getElementById('left-col');
  const right = document.getElementById('right-col');
  left.innerHTML = ''; right.innerHTML = '';
  // left = 한글, right = français (shuffled)
  const leftItems = dragPool.map(w=>({id:w.korean, text:w.korean}));
  const rightItems = dragPool.map(w=>({id:w.korean, text:w.french}));
  shuffleArray(leftItems);
  shuffleArray(rightItems);

  leftItems.forEach(it=>{
    const div = document.createElement('div');
    div.className = 'card-item';
    div.draggable = true;
    div.dataset.id = it.id;
    div.textContent = it.text;
    div.addEventListener('dragstart', dragStart);
    left.appendChild(div);
  });

  rightItems.forEach(it=>{
    const div = document.createElement('div');
    div.className = 'placeholder';
    div.dataset.id = it.id; // the target id
    div.textContent = it.text;
    div.addEventListener('dragover', dragOver);
    div.addEventListener('drop', drop);
    right.appendChild(div);
  });

  document.getElementById('drag-feedback').textContent = '';
}

function dragStart(e){
  e.dataTransfer.setData('text/plain', e.target.dataset.id);
  e.target.classList.add('dragging');
}
function dragOver(e){ e.preventDefault(); }
function drop(e){
  e.preventDefault();
  const draggedId = e.dataTransfer.getData('text/plain');
  const targetId = e.currentTarget.dataset.id;
  // find element dragged
  const draggedEl = document.querySelector(`.card-item[data-id="${draggedId}"]`);
  if(!draggedEl) return;
  if(draggedId === targetId){
    // correct
    e.currentTarget.classList.add('matched');
    e.currentTarget.innerHTML = '✅ ' + e.currentTarget.innerHTML;
    draggedEl.remove();
    dragCorrect++;
    updateDragStats();
    checkFinish();
  } else {
    // incorrect - small feedback
    e.currentTarget.animate([{background:'#ffecec'},{background:'#fafcf9'}], {duration:300});
  }
  if(draggedEl) draggedEl.classList.remove('dragging');
}
function checkFinish(){
  if(dragCorrect === dragTotal){
    document.getElementById('drag-feedback').textContent = 'Bravo — tout est associé !';
    // store minimal stats
    const prev = JSON.parse(localStorage.getItem('kz_drag_stats')||'{"games":0,"last":0}');
    prev.games = (prev.games||0)+1; prev.last = Date.now();
    localStorage.setItem('kz_drag_stats', JSON.stringify(prev));
  }
}
function updateDragStats(){
  document.getElementById('drag-correct').textContent = dragCorrect;
  document.getElementById('drag-total').textContent = dragTotal;
}
function shuffleArray(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]] } }

loadDrag();
