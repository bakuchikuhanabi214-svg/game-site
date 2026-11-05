// =====================================================================
//  ★ゲームの住所はここだけ変えればOK★  url を空 '' にすると「近日公開」表示
// =====================================================================
const GAMES = {
  'emoji-clash':  { url: 'https://emojiclash.com/' },
  'soba':         { url: 'https://soba.emojiclash.com/' },
  'hitokata':     { url: 'https://hitokata.emojiclash.com/' },
};

(function(){
  // ---- 言語 ----
  const html = document.documentElement;
  let lang;
  try{ lang = localStorage.getItem('bh_lang'); }catch(e){}
  if (!lang) lang = (navigator.language || 'ja').toLowerCase().startsWith('ja') ? 'ja' : 'en';
  function setLang(l){
    lang = l; html.lang = l;
    try{ localStorage.setItem('bh_lang', l); }catch(e){}
    document.querySelectorAll('.lang button').forEach(b => b.setAttribute('aria-pressed', b.dataset.l === l));
    const t = document.querySelector('meta[name="title-' + l + '"]');
    if (t) document.title = t.content;
  }
  document.querySelectorAll('.lang button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.l)));
  setLang(lang);

  // ---- 遊ぶボタン ----
  document.querySelectorAll('[data-play]').forEach(a => {
    const g = GAMES[a.dataset.play];
    if (g && g.url){ a.href = g.url; }
    else {
      a.removeAttribute('href'); a.classList.remove('play'); a.classList.add('soon');
      a.setAttribute('aria-disabled', 'true');
      a.innerHTML = '<span class="ja">近日公開</span><span class="en">Coming soon</span>';
    }
  });
  document.querySelectorAll('[data-lamp]').forEach(el => {
    const g = GAMES[el.dataset.lamp]; if (g && g.url) el.remove();
  });

  // ---- 花火（読み込み時に一度だけ。空をタップするともう一発） ----
  const cv = document.getElementById('sky');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const COLORS = ['#ffc94a','#ff7a8a','#3fd2c0','#f6f1ff','#b98cff'];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W, H, parts = [], rockets = [], running = false;
  function size(){ const r = cv.getBoundingClientRect(), d = devicePixelRatio || 1; W = r.width; H = r.height; cv.width = W*d; cv.height = H*d; ctx.setTransform(d,0,0,d,0,0); }
  size(); addEventListener('resize', () => { size(); if (reduce) still(); });
  // 星
  const stars = Array.from({length: 70}, () => ({x: Math.random(), y: Math.random()*.7, r: Math.random()*1.2 + .3}));
  function bg(){
    ctx.clearRect(0,0,W,H); ctx.globalCompositeOperation='source-over';
    ctx.fillStyle = '#f6f1ff';
    stars.forEach(s => { ctx.globalAlpha = .5; ctx.beginPath(); ctx.arc(s.x*W, s.y*H, s.r, 0, 7); ctx.fill(); });
    ctx.globalAlpha = 1;
  }
  function burst(x, y, big){
    const c1 = COLORS[Math.floor(Math.random()*COLORS.length)], c2 = COLORS[Math.floor(Math.random()*COLORS.length)];
    const n = big ? 130 : 80, sp = big ? 5.2 : 3.8;
    for (let i=0;i<n;i++){
      const a = i/n*Math.PI*2, v = sp*(.55 + Math.random()*.45);
      parts.push({x, y, vx: Math.cos(a)*v, vy: Math.sin(a)*v, life: 1, c: i%3 ? c1 : c2});
    }
  }
  function launch(tx, ty, delay, big){
    setTimeout(() => { rockets.push({x: tx, y: H, ty, big}); if (!running) loop(); }, delay);
  }
  function loop(){
    running = true;
    bg();
    rockets = rockets.filter(r => {
      r.y -= 9; ctx.fillStyle = '#ffc94a'; ctx.fillRect(r.x-1, r.y, 2, 10);
      if (r.y <= r.ty){ burst(r.x, r.y, r.big); return false; } return true;
    });
    parts = parts.filter(p => {
      p.x += p.vx; p.y += p.vy; p.vx *= .965; p.vy = p.vy*.965 + .05; p.life -= .011;
      ctx.globalAlpha = Math.max(0, p.life); ctx.strokeStyle = p.c; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(p.x - p.vx*4, p.y - p.vy*4); ctx.lineTo(p.x, p.y); ctx.stroke();
      return p.life > 0;
    });
    ctx.globalAlpha = 1;
    if (parts.length || rockets.length) requestAnimationFrame(loop);
    else { running = false; bg(); }
  }
  function still(){ // 動きを減らす設定の人には止まった花火を描く
    ctx.clearRect(0,0,W,H); bg();
    const cx = W*.78, cy = H*.32;
    for (let i=0;i<90;i++){ const a = i/90*Math.PI*2, d = 40 + (i%3)*22;
      ctx.fillStyle = COLORS[i%COLORS.length]; ctx.beginPath(); ctx.arc(cx + Math.cos(a)*d, cy + Math.sin(a)*d, 2, 0, 7); ctx.fill(); }
  }
  if (reduce){ still(); return; }
  bg();
  launch(W*.30, H*.22, 300, true);
  launch(W*.62, H*.16, 850, false);
  launch(W*.88, H*.30, 1300, true);
  cv.addEventListener('pointerdown', e => {
    const r = cv.getBoundingClientRect();
    launch(e.clientX - r.left, Math.min(e.clientY - r.top, H*.6), 0, true);
  });
})();
