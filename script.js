// ===== CONFIG =====
const LOGO_TOKEN = 'pk_Kaw8UJfoTXOmvt_DWkqBnA';

// ===== WEB3FORMS =====
// Obtenha sua chave gratuita em: https://web3forms.com
// Cole a chave abaixo para ativar o envio real do formulário.
const WEB3FORMS_KEY = '28d9b331-0e5a-4076-baac-21e07359b6f4';

// ===== ESTADO =====
let tools = [];
let favs = new Set(JSON.parse(localStorage.getItem('tidev_favs') || '[]'));
let favFilter = 'all';
let activeCat = 'all';
let activePrice = 'all';
let activeSub = 'all';

// ===== SUBCATEGORIAS =====
const CAT_SUBS = {
  ti:     [{v:'all',l:'Todas'},{v:'seguranca',l:'🔒 Segurança'},{v:'performance',l:'⚡ Performance'},{v:'analise',l:'📊 Análise'}],
  dev:    [{v:'all',l:'Todas'},{v:'ferramentas',l:'🔧 Ferramentas'},{v:'nocode',l:'🪄 No-Code'},{v:'backend',l:'🗄️ Backend & API'},{v:'hospedagem',l:'🌐 Hospedagem'},{v:'ecommerce',l:'🛒 E-commerce'}],
  ia:     [{v:'all',l:'Todas'},{v:'llm',l:'🧠 Assistentes'},{v:'escrita',l:'✍️ Escrita'},{v:'imagem',l:'🖼️ Imagem'},{v:'voz',l:'🎙️ Voz & Áudio'},{v:'musica',l:'🎵 Música'},{v:'codigo',l:'💻 Código'},{v:'automacao',l:'⚙️ Automação'},{v:'pesquisa',l:'🔍 Pesquisa'},{v:'social',l:'📱 Social'},{v:'vendas',l:'💰 Vendas'},{v:'dados',l:'📊 Dados'},{v:'avatar',l:'👤 Avatares'},{v:'3d',l:'🎲 3D'},{v:'rh',l:'🧑 RH'},{v:'juridico',l:'⚖️ Jurídico'},{v:'educacao',l:'🎓 Educação'},{v:'plataforma',l:'🌐 Plataformas'}],
  video:  [{v:'all',l:'Todas'},{v:'editor',l:'✂️ Editor'},{v:'gerador',l:'🎬 Gerador'},{v:'avatar',l:'👤 Avatar & Presenter'},{v:'dublagem',l:'🗣️ Dublagem & Legenda'}],
  design: [{v:'all',l:'Todas'},{v:'criacao',l:'🎨 Criação'},{v:'uidesign',l:'🖍️ UI & Protótipo'},{v:'logo',l:'🏷️ Logo & Marca'},{v:'recursos',l:'📸 Recursos'}],
  prod:   [{v:'all',l:'Todas'},{v:'gestao',l:'📋 Gestão'},{v:'reunioes',l:'🎥 Reuniões'},{v:'marketing',l:'📣 Marketing & CRM'},{v:'dados',l:'📊 Dados & Relatórios'}]
};

// ===== LABELS =====
const subMap = {llm:'LLM',escrita:'Escrita',imagem:'Imagem',voz:'Voz',musica:'Musica',codigo:'Codigo',automacao:'Automacao',pesquisa:'Pesquisa',plataforma:'Plataformas',social:'Social',vendas:'Vendas',dados:'Dados',avatar:'Avatares',rh:'RH',juridico:'Juridico',educacao:'Educacao','3d':'3D',ferramentas:'Ferramentas',nocode:'No-Code',backend:'Backend',hospedagem:'Hospedagem',ecommerce:'E-commerce',seguranca:'Seguranca',performance:'Performance',analise:'Analise',editor:'Editor',gerador:'Gerador',dublagem:'Dublagem',criacao:'Criacao',uidesign:'UI Design',logo:'Logo',recursos:'Recursos',gestao:'Gestao',reunioes:'Reunioes',marketing:'Marketing'};
const subIcon = {llm:'🧠',escrita:'✍️',imagem:'🖼️',voz:'🎙️',musica:'🎵',codigo:'💻',automacao:'⚙️',pesquisa:'🔍',plataforma:'🌐',social:'📱',vendas:'💰',dados:'📊',avatar:'👤',rh:'🧑',juridico:'⚖️',educacao:'🎓','3d':'🎲',ferramentas:'🔧',nocode:'🪄',backend:'🗄️',hospedagem:'🌐',ecommerce:'🛒',seguranca:'🔒',performance:'⚡',analise:'📊',editor:'✂️',gerador:'🎬',dublagem:'🗣️',criacao:'🎨',uidesign:'🖍️',logo:'🏷️',recursos:'📸',gestao:'📋',reunioes:'🎥',marketing:'📣'};

function catLabel(c) {
  return {ia:'IA',video:'Vídeo',design:'Design',dev:'Dev',ti:'TI',prod:'Produtividade'}[c] || c;
}

// ===== STATS DINÂMICOS =====
function updateStats() {
  const totalEl = document.getElementById('stat-total');
  const iaCatEl = document.getElementById('stat-ia-cats');
  const freeEl  = document.getElementById('stat-free');
  if (!totalEl) return;

  const iaCats = new Set(tools.filter(t => t.cat === 'ia').map(t => t.sub)).size;
  const freeCount = tools.filter(t => t.price === 'free').length;

  totalEl.innerHTML = tools.length + '<span>+</span>';
  iaCatEl.innerHTML = iaCats + '<span>+</span>';
  freeEl.innerHTML  = freeCount + '<span>+</span>';
}

// ===== FAVORITOS =====
function saveFavs() {
  localStorage.setItem('tidev_favs', JSON.stringify([...favs]));
  updateFavBar();
}

function toggleFav(name, btn) {
  if (favs.has(name)) {
    favs.delete(name);
    btn.textContent = '☆';
    btn.classList.remove('active');
  } else {
    favs.add(name);
    btn.textContent = '⭐';
    btn.classList.add('active');
  }
  saveFavs();
  if (favFilter === 'fav') applyFilters();
}

function setFavFilter(mode) {
  favFilter = mode;
  document.getElementById('favAllBtn').classList.toggle('active', mode === 'all');
  document.getElementById('favOnlyBtn').classList.toggle('active', mode === 'fav');
  applyFilters();
}

function clearFavs() {
  if (!confirm('Limpar todos os favoritos?')) return;
  favs.clear();
  saveFavs();
  if (favFilter === 'fav') {
    favFilter = 'all';
    document.getElementById('favAllBtn').classList.add('active');
    document.getElementById('favOnlyBtn').classList.remove('active');
  }
  applyFilters();
}

function updateFavBar() {
  const bar   = document.getElementById('favBar');
  const count = document.getElementById('favCount');
  const n = favs.size;
  count.textContent = n;
  bar.classList.toggle('visible', n > 0 || favFilter === 'fav');
}

// ===== FILTROS =====
function setCat(btn) {
  document.querySelectorAll('[data-cat]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeCat = btn.dataset.cat;
  activeSub = 'all';
  const subRow  = document.getElementById('subRow');
  const subBtns = document.getElementById('subBtns');
  const subLabel = document.getElementById('subLabel');
  if (activeCat !== 'all' && CAT_SUBS[activeCat]) {
    subRow.style.display = 'flex';
    subLabel.textContent = 'Tipo';
    subBtns.innerHTML = CAT_SUBS[activeCat].map(s =>
      `<button class="filter-btn${s.v === 'all' ? ' active' : ''}" data-sub="${s.v}" onclick="setSub(this)">${s.l}</button>`
    ).join('');
  } else {
    subRow.style.display = 'none';
    subBtns.innerHTML = '';
  }
  applyFilters();
}

function setSub(btn) {
  document.querySelectorAll('#subBtns .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeSub = btn.dataset.sub;
  applyFilters();
}

function setPrice(btn) {
  document.querySelectorAll('[data-price]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activePrice = btn.dataset.price;
  applyFilters();
}

// ===== CATÁLOGO =====
function applyFilters() {
  const q       = document.getElementById('searchInput').value.toLowerCase();
  const grid    = document.getElementById('toolsGrid');
  const noRes   = document.getElementById('noResults');
  const countEl = document.getElementById('catalogCount');

  const filtered = tools.filter(t => {
    const matchCat   = activeCat === 'all' || t.cat === activeCat;
    const matchSub   = activeSub === 'all' || t.sub === activeSub;
    const matchPrice = activePrice === 'all' || t.price === activePrice;
    const matchQ     = !q || t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.tags.some(tag => tag.includes(q));
    const matchFav   = favFilter !== 'fav' || favs.has(t.name);
    return matchCat && matchSub && matchPrice && matchQ && matchFav;
  });

  const seen = new Set();
  const unique = filtered.filter(t => {
    if (seen.has(t.name)) return false;
    seen.add(t.name);
    return true;
  });

  grid.innerHTML = unique.map(t => renderCard(t)).join('');
  noRes.style.display = unique.length === 0 ? 'block' : 'none';
  if (countEl) countEl.textContent = `Mostrando ${unique.length} de ${tools.length} ferramentas`;
}

function renderCard(t) {
  const priceMap   = {free:'Gratuito',freemium:'Freemium',paid:'Pago',affiliate:'Afiliado'};
  const priceClass = {free:'price-free',freemium:'price-freemium',paid:'price-paid',affiliate:'price-affiliate'};
  const subLabel   = (t.sub && subMap[t.sub]) ? (subIcon[t.sub] || '') + ' ' + subMap[t.sub] : '';
  const subBadge   = subLabel ? `<span class="tool-tag" style="background:rgba(127,119,221,.15);color:#AFA9EC;border-color:#534AB7">${subLabel}</span>` : '';
  const catDisplay = subLabel ? catLabel(t.cat) + ' · ' + subLabel : catLabel(t.cat);
  const aff        = t.affiliate ? `<span class="affiliate-mark">💰 ${t.commission}</span>` : '';
  const isFav      = favs.has(t.name);
  const tags       = t.tags.map(tag => `<span class="tool-tag">${tag}</span>`).join('');
  const domain     = t.url.replace(/https?:\/\//, '').replace(/\/.*/, '').replace(/^www\./, '');
  const logoUrl    = `https://img.logo.dev/${domain}?token=${LOGO_TOKEN}&size=40&format=png`;
  const initials   = t.name.replace(/[^a-zA-Z0-9]/g, ' ').trim().split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  const safeName   = t.name.replace(/'/g, "\\'");

  return `<div class="tool-card ${t.cat}">
    <button class="fav-btn${isFav ? ' active' : ''}" onclick="toggleFav('${safeName}',this)" title="Favoritar">${isFav ? '⭐' : '☆'}</button>
    ${aff}
    <div class="tool-top">
      <div>
        <div class="tool-icon">
          <img src="${logoUrl}" alt="${t.name}" loading="lazy" onerror="this.style.display='none';this.nextSibling.style.display='flex'" />
          <span class="tool-icon-fallback" style="display:none">${initials}</span>
        </div>
        <div class="tool-name">${t.name}</div>
        <div class="tool-cat">${catDisplay}</div>
      </div>
      <span class="price-badge ${priceClass[t.price] || ''}">${priceMap[t.price] || t.price}</span>
    </div>
    <p class="tool-desc">${t.desc}</p>
    <div class="tool-bottom">
      <div class="tool-tags">${subBadge}${tags}</div>
      <a href="${t.url}" target="_blank" rel="noopener" class="tool-link">Acessar &#x2192;</a>
    </div>
  </div>`;
}

// ===== RECÉM ADICIONADAS =====
function buildRecem() {
  const scroll = document.getElementById('recemScroll');
  if (!scroll) return;
  const recent = tools.slice().reverse().slice(0, 30);
  scroll.innerHTML = recent.map(t => {
    const sub    = t.sub ? ' · ' + t.sub : '';
    const domain = t.url.replace(/https?:\/\//, '').replace(/\/.*/, '').replace(/^www\./, '');
    const logo   = `https://img.logo.dev/${domain}?token=${LOGO_TOKEN}&size=40&format=png`;
    const init   = t.name.replace(/[^a-zA-Z0-9]/g, ' ').trim().split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
    return `<div class="new-card ${t.cat}">
      <span class="new-badge">NOVO</span>
      <div class="new-card-icon">
        <img src="${logo}" alt="${t.name}" loading="lazy" onerror="this.style.display='none';this.nextSibling.style.display='flex'" />
        <span class="tool-icon-fallback" style="display:none;width:100%;height:100%;border-radius:10px">${init}</span>
      </div>
      <div class="new-card-name">${t.name}</div>
      <div class="new-card-cat">${catLabel(t.cat)}${sub}</div>
      <div class="new-card-desc">${t.desc}</div>
      <a href="${t.url}" target="_blank" class="new-card-link">Acessar &#x2192;</a>
    </div>`;
  }).join('');
}

// ===== FORMULÁRIO — WEB3FORMS =====
async function submitTool() {
  const name  = document.getElementById('ft-name').value.trim();
  const url   = document.getElementById('ft-url').value.trim();
  const cat   = document.getElementById('ft-cat').value;
  const desc  = document.getElementById('ft-desc').value.trim();

  if (!name || !url || !cat || !desc) {
    alert('Preencha os campos obrigatórios: nome, URL, categoria e descrição.');
    return;
  }

  const price = document.getElementById('ft-price').value;
  const email = document.getElementById('ft-email').value.trim();
  const btn   = document.querySelector('.form-btn');

  // Fallback: se a chave não foi configurada, abre mailto
  if (!WEB3FORMS_KEY || WEB3FORMS_KEY === 'SUA_CHAVE_AQUI') {
    const subject = encodeURIComponent('Sugestão de ferramenta — tidev.ia');
    const body = encodeURIComponent(
      `Nome: ${name}\nURL: ${url}\nCategoria: ${cat}\nPreço: ${price}\nDescrição: ${desc}` +
      (email ? `\n\nMeu contato: ${email}` : '')
    );
    window.open(`mailto:contato@tidev.ia.br?subject=${subject}&body=${body}`, '_blank');
    showFormSuccess();
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Enviando...';

  try {
    const data = new FormData();
    data.append('access_key', WEB3FORMS_KEY);
    data.append('subject', 'Sugestão de ferramenta — tidev.ia');
    data.append('from_name', 'tidev.ia Hub');
    data.append('nome_ferramenta', name);
    data.append('url', url);
    data.append('categoria', cat);
    data.append('preco', price);
    data.append('descricao', desc);
    if (email) data.append('email_indicador', email);

    const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: data });
    const json = await res.json();

    if (json.success) {
      showFormSuccess();
    } else {
      throw new Error(json.message || 'Erro ao enviar');
    }
  } catch (err) {
    alert('Não foi possível enviar. Tente novamente ou envie para contato@tidev.ia.br');
    console.error(err);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Enviar sugestão →';
  }
}

function showFormSuccess() {
  document.getElementById('formSuccess').style.display = 'block';
  ['ft-name','ft-url','ft-cat','ft-desc','ft-email'].forEach(id => {
    document.getElementById(id).value = '';
  });
}

// ===== NAV MOBILE =====
function toggleNav() {
  document.getElementById('mobileNav').classList.toggle('open');
}
document.addEventListener('click', e => {
  const nav = document.getElementById('mobileNav');
  if (nav.classList.contains('open') && !nav.contains(e.target) && !document.querySelector('.nav-burger').contains(e.target)) {
    nav.classList.remove('open');
  }
});

// ===== REVEAL ON SCROLL =====
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

// ===== NAV BORDER ON SCROLL =====
window.addEventListener('scroll', () => {
  document.querySelector('nav').style.borderBottomColor = scrollY > 30 ? 'rgba(83,74,183,0.25)' : '';
});

// ===== INIT — carrega tools.json e inicializa tudo =====
fetch('tools.json')
  .then(r => r.json())
  .then(data => {
    tools = data;
    updateStats();
    applyFilters();
    updateFavBar();
    buildRecem();
  })
  .catch(err => {
    console.error('Erro ao carregar tools.json:', err);
    document.getElementById('toolsGrid').innerHTML =
      '<p style="color:var(--muted);font-family:var(--mono);padding:40px;text-align:center">Erro ao carregar ferramentas.</p>';
  });
