// stats.js
function loadStats(){
  const seen = JSON.parse(localStorage.getItem('kz_seen') || '{}');
  const known = JSON.parse(localStorage.getItem('kz_known') || '{}');
  const hard = JSON.parse(localStorage.getItem('kz_hard') || '{}');
  const quiz_correct = Number(localStorage.getItem('kz_quiz_correct')) || 0;
  const quiz_total = Number(localStorage.getItem('kz_quiz_total')) || 0;

  document.getElementById('stat-seen').textContent = Object.keys(seen).length;
  document.getElementById('stat-known').textContent = Object.keys(known).length;
  document.getElementById('stat-hard').textContent = Object.keys(hard).length;
  const accuracy = quiz_total ? Math.round((quiz_correct/quiz_total)*100) : 0;
  document.getElementById('stat-accuracy').textContent = `${accuracy}%`;

  // Draw small history chart
  const history = JSON.parse(localStorage.getItem('kz_history') || '[]');
  drawHistoryChart(history.map(h => ({x: new Date(h.date), accuracy: h.total ? (h.correct / h.total) * 100 : 0})));
}

function drawHistoryChart(data){
  const c = document.getElementById('historyChart');
  const ctx = c.getContext('2d');
  ctx.clearRect(0,0,c.width,c.height);
  if(!data.length){
    ctx.fillStyle='#999';
    ctx.font='14px sans-serif';
    ctx.fillText('Pas d\'historique encore — fais quelques quiz !', 20, c.height/2);
    return;
  }
  // simple line chart
  const padding = 30;
  const w = c.width - padding*2;
  const h = c.height - padding*2;
  // x positions
  const xs = data.map((_,i)=> padding + (i/(data.length-1 || 1))*w);
  const ys = data.map(d => padding + (1 - d.accuracy/100)*h);
  // axes
  ctx.strokeStyle='#e3efe8'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(padding,padding); ctx.lineTo(padding,c.height-padding); ctx.lineTo(c.width-padding,c.height-padding); ctx.stroke();
  // line
  ctx.strokeStyle='#3b7a6b'; ctx.lineWidth=2; ctx.beginPath();
  xs.forEach((x,i)=>{ if(i===0) ctx.moveTo(x,ys[i]); else ctx.lineTo(x,ys[i]); });
  ctx.stroke();
  // dots
  ctx.fillStyle='#7aa89a';
  xs.forEach((x,i)=>{ ctx.beginPath(); ctx.arc(x,ys[i],4,0,Math.PI*2); ctx.fill(); });
  // labels
  ctx.fillStyle='#2a2a26'; ctx.font='12px sans-serif';
  ctx.fillText('Taux de réussite (%)', 8, 14);
}

document.getElementById('resetAll').addEventListener('click', ()=>{
  if(confirm('Réinitialiser toutes les données locales ?')){
    localStorage.clear();
    loadStats();
    alert('Données réinitialisées.');
  }
});

loadStats();
