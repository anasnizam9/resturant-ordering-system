// Minimal interactivity: search and category filter
document.addEventListener('DOMContentLoaded', ()=>{
  const search = document.getElementById('menuSearch');
  const pills = Array.from(document.querySelectorAll('.pill'));
  const cards = Array.from(document.querySelectorAll('.menu-card'));

  function filter(){
    const q = search.value.trim().toLowerCase();
    const activeCat = pills.find(p=>p.classList.contains('active')).dataset.cat;

    cards.forEach(card=>{
      const title = card.querySelector('h3').textContent.toLowerCase();
      const desc = card.querySelector('.muted').textContent.toLowerCase();
      const cat = card.dataset.cat;
      const matchesQ = q === '' || title.includes(q) || desc.includes(q);
      const matchesCat = activeCat === 'all' || cat === activeCat;
      card.style.display = (matchesQ && matchesCat) ? '' : 'none';
    })
  }

  search.addEventListener('input', filter);

  pills.forEach(p=>p.addEventListener('click', ()=>{
    pills.forEach(x=>x.classList.remove('active'));
    p.classList.add('active');
    filter();
  }));

  // theme toggle (simple demonstration)
  const themeToggle = document.getElementById('themeToggle');
  let dark = true;
  themeToggle.addEventListener('click', ()=>{
    dark = !dark;
    if(!dark){
      document.documentElement.style.setProperty('--bg', '#ffffff');
      document.documentElement.style.setProperty('--card', '#f7f7f7');
      document.documentElement.style.setProperty('--muted', '#6c6c6c');
      document.documentElement.style.setProperty('--accent', '#ff7a1a');
      document.body.style.color = '#111';
      themeToggle.textContent = '🌙';
    } else {
      document.documentElement.style.setProperty('--bg', '#131212');
      document.documentElement.style.setProperty('--card', '#1e1a1a');
      document.documentElement.style.setProperty('--muted', '#bdb5b5');
      document.body.style.color = '#f2efe9';
      themeToggle.textContent = '☀️';
    }
  });

});