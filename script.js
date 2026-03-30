// ===== GOOGLE ANALYTICS 4 =====
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-MY3DPLNT9P');

// ===== UTILS =====
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ===== CONFIG =====
const LOGO_TOKEN = 'pk_Kaw8UJfoTXOmvt_DWkqBnA';

// ===== SAFE URL =====
function safeUrl(url) {
  return /^https?:\/\//.test(url) ? url : '#';
}

// ===== HELPERS DE ÍCONE =====
function buildLogoUrl(url) {
  const domain = url.replace(/https?:\/\//, '').replace(/\/.*/, '').replace(/^www\./, '');
  return `https://img.logo.dev/${domain}?token=${LOGO_TOKEN}&size=40&format=png`;
}

function buildInitials(name) {
  return name.replace(/[^a-zA-Z0-9]/g, ' ').trim().split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

// ===== GOOGLE SHEETS =====
// Cole aqui a URL gerada ao implantar o apps-script.js no Google Sheets.
// Instruções completas em: apps-script.js
const SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbz7NlRP1IYDMUWFomFupVc3N18-mpyeriXz2w7dge39m_5eJhRZzvXdqZou-ihZ67Da9A/exec';

// ===== ESTADO =====
const PAGE_SIZE = 30;

let tools = [];
let filteredTools = [];
let currentPage = 0;
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
  const btn = document.querySelector('.fav-clear');
  if (btn.dataset.confirming) {
    favs.clear();
    saveFavs();
    delete btn.dataset.confirming;
    btn.textContent = 'Limpar favoritos';
    if (favFilter === 'fav') {
      favFilter = 'all';
      document.getElementById('favAllBtn').classList.add('active');
      document.getElementById('favOnlyBtn').classList.remove('active');
    }
    applyFilters();
  } else {
    btn.dataset.confirming = '1';
    btn.textContent = 'Tem certeza? Clique para confirmar';
    setTimeout(() => {
      if (btn.dataset.confirming) {
        delete btn.dataset.confirming;
        btn.textContent = 'Limpar favoritos';
      }
    }, 3000);
  }
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
      `<button class="filter-btn${s.v === 'all' ? ' active' : ''}" data-sub="${s.v}">${s.l}</button>`
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
  const q = document.getElementById('searchInput').value.toLowerCase();

  const filtered = tools.filter(t => {
    const matchCat   = activeCat === 'all' || t.cat === activeCat;
    const matchSub   = activeSub === 'all' || t.sub === activeSub;
    const matchPrice = activePrice === 'all' || t.price === activePrice;
    const matchQ     = !q || t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.tags.some(tag => tag.includes(q));
    const matchFav   = favFilter !== 'fav' || favs.has(t.name);
    return matchCat && matchSub && matchPrice && matchQ && matchFav;
  });

  const seen = new Set();
  filteredTools = filtered.filter(t => {
    if (seen.has(t.name)) return false;
    seen.add(t.name);
    return true;
  });

  currentPage = 0;
  document.getElementById('toolsGrid').innerHTML = '';
  renderPage();
}

function renderPage() {
  const grid    = document.getElementById('toolsGrid');
  const noRes   = document.getElementById('noResults');
  const countEl = document.getElementById('catalogCount');
  const wrap    = document.getElementById('loadMoreWrap');
  const info    = document.getElementById('loadMoreInfo');

  const start = currentPage * PAGE_SIZE;
  const slice = filteredTools.slice(start, start + PAGE_SIZE);

  if (currentPage === 0) {
    grid.innerHTML = slice.map(t => renderCard(t)).join('');
  } else {
    grid.insertAdjacentHTML('beforeend', slice.map(t => renderCard(t)).join(''));
  }

  const shown = Math.min((currentPage + 1) * PAGE_SIZE, filteredTools.length);
  noRes.style.display = filteredTools.length === 0 ? 'block' : 'none';
  if (countEl) countEl.textContent = `Mostrando ${shown} de ${filteredTools.length} ferramentas`;

  const hasMore = shown < filteredTools.length;
  wrap.style.display = hasMore ? 'block' : 'none';
  if (hasMore && info) info.textContent = `${filteredTools.length - shown} ferramentas restantes`;
}

function loadMore() {
  currentPage++;
  renderPage();
}

function renderCard(t) {
  const priceMap   = {free:'Gratuito',freemium:'Freemium',paid:'Pago',affiliate:'Afiliado'};
  const priceClass = {free:'price-free',freemium:'price-freemium',paid:'price-paid',affiliate:'price-affiliate'};
  const subLabel   = (t.sub && subMap[t.sub]) ? (subIcon[t.sub] || '') + ' ' + subMap[t.sub] : '';
  const subBadge   = subLabel ? `<span class="tool-tag" style="background:rgba(127,119,221,.15);color:#AFA9EC;border-color:#534AB7">${escapeHtml(subLabel)}</span>` : '';
  const catDisplay = subLabel ? catLabel(t.cat) + ' · ' + subLabel : catLabel(t.cat);
  const aff        = t.affiliate ? `<span class="affiliate-mark">💰 ${escapeHtml(t.commission)}</span>` : '';
  const isFav      = favs.has(t.name);
  const tags       = t.tags.map(tag => `<span class="tool-tag">${escapeHtml(tag)}</span>`).join('');
  const logoUrl    = buildLogoUrl(t.url);
  const initials   = buildInitials(t.name);

  return `<article class="tool-card ${escapeHtml(t.cat)}">
    <button class="fav-btn${isFav ? ' active' : ''}" data-fav="${escapeHtml(t.name)}" title="Favoritar">${isFav ? '⭐' : '☆'}</button>
    ${aff}
    <div class="tool-top">
      <div>
        <div class="tool-icon">
          <img src="${logoUrl}" alt="${escapeHtml(t.name)}" loading="lazy" class="logo-img" />
          <span class="tool-icon-fallback" aria-hidden="true">${escapeHtml(initials)}</span>
        </div>
        <div class="tool-name">${escapeHtml(t.name)}</div>
        <div class="tool-cat">${escapeHtml(catDisplay)}</div>
      </div>
      <span class="price-badge ${priceClass[t.price] || ''}">${priceMap[t.price] || escapeHtml(t.price)}</span>
    </div>
    <p class="tool-desc">${escapeHtml(t.desc)}</p>
    <div class="tool-bottom">
      <div class="tool-tags">${subBadge}${tags}</div>
      <a href="${safeUrl(t.url)}" target="_blank" rel="noopener" class="tool-link"
         data-tool-name="${escapeHtml(t.name)}" data-tool-cat="${escapeHtml(t.cat)}" data-tool-price="${escapeHtml(t.price)}">Acessar &#x2192;</a>
    </div>
  </article>`;
}

// ===== RECÉM ADICIONADAS =====
function buildRecem() {
  const scroll = document.getElementById('recemScroll');
  if (!scroll) return;
  const recent = tools.slice().reverse().slice(0, 30);
  scroll.innerHTML = recent.map(t => {
    const sub    = t.sub ? ' · ' + t.sub : '';
    const logo   = buildLogoUrl(t.url);
    const init   = buildInitials(t.name);
    return `<article class="new-card ${escapeHtml(t.cat)}">
      <span class="new-badge">NOVO</span>
      <div class="new-card-icon">
        <img src="${logo}" alt="${escapeHtml(t.name)}" loading="lazy" class="logo-img" />
        <span class="tool-icon-fallback" aria-hidden="true" style="width:100%;height:100%;border-radius:10px">${escapeHtml(init)}</span>
      </div>
      <div class="new-card-name">${escapeHtml(t.name)}</div>
      <div class="new-card-cat">${escapeHtml(catLabel(t.cat) + sub)}</div>
      <div class="new-card-desc">${escapeHtml(t.desc)}</div>
      <a href="${safeUrl(t.url)}" target="_blank" rel="noopener" class="new-card-link">Acessar &#x2192;</a>
    </article>`;
  }).join('');
}

// ===== FORMULÁRIO =====
// Envia para Google Sheets (primário) e Web3Forms (backup por e-mail).
async function submitTool() {
  const name  = document.getElementById('ft-name').value.trim();
  const url   = document.getElementById('ft-url').value.trim();
  const cat   = document.getElementById('ft-cat').value;
  const desc  = document.getElementById('ft-desc').value.trim();

  if (!name || !url || !cat || !desc) {
    alert('Preencha os campos obrigatórios: nome, URL, categoria e descrição.');
    return;
  }

  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error();
  } catch {
    alert('URL inválida. Use o formato: https://site.com');
    document.getElementById('ft-url').focus();
    return;
  }

  const price = document.getElementById('ft-price').value || 'free';
  const email = document.getElementById('ft-email').value.trim();
  const btn   = document.querySelector('.form-btn');

  btn.disabled = true;
  btn.textContent = 'Enviando...';

  try {
    if (SHEETS_ENDPOINT) {
      const params = new URLSearchParams({ nome: name, url, categoria: cat, preco: price, descricao: desc, email });
      fetch(SHEETS_ENDPOINT, { method: 'POST', mode: 'no-cors', body: params });
    }

    showFormSuccess();
  } catch (err) {
    alert('Não foi possível enviar. Tente novamente ou envie para contato@tidev.ia.br');
    console.error(err);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Enviar sugestão →';
  }
}

// ===== FERRAMENTA ALEATÓRIA =====
let lastRandomPool = [];

function discoverRandom() {
  // Respeita os filtros ativos — sorteia dentro do conjunto visível
  const pool = tools.filter(t => {
    const matchCat   = activeCat === 'all' || t.cat === activeCat;
    const matchSub   = activeSub === 'all' || t.sub === activeSub;
    const matchPrice = activePrice === 'all' || t.price === activePrice;
    return matchCat && matchSub && matchPrice;
  });

  if (pool.length === 0) return;

  // Evita repetir a mesma ferramenta duas vezes seguidas
  const candidates = pool.length > 1 ? pool.filter(t => t !== lastRandomPool[0]) : pool;
  const tool = candidates[Math.floor(Math.random() * candidates.length)];
  lastRandomPool = [tool];

  // Monta texto de contexto dos filtros ativos
  const parts = [];
  if (activeCat !== 'all') parts.push(catLabel(activeCat));
  if (activeSub !== 'all' && subMap[activeSub]) parts.push(subMap[activeSub]);
  if (activePrice !== 'all') {
    const priceLabel = {free:'gratuitas',freemium:'freemium',paid:'pagas',affiliate:'afiliadas'}[activePrice];
    if (priceLabel) parts.push(priceLabel);
  }
  const context = parts.length > 0
    ? `sorteando entre ${pool.length} ferramentas de ${parts.join(' · ')}`
    : `sorteando entre ${pool.length} ferramentas`;

  openModal(tool, context);
}

let _modalTrigger = null;
let _modalFocusTrap = null;

function openModal(t, context = '') {
  const priceMap   = {free:'Gratuito',freemium:'Freemium',paid:'Pago',affiliate:'Afiliado'};
  const priceClass = {free:'price-free',freemium:'price-freemium',paid:'price-paid',affiliate:'price-affiliate'};
  const subLabel   = (t.sub && subMap[t.sub]) ? (subIcon[t.sub] || '') + ' ' + subMap[t.sub] : '';
  const catDisplay = subLabel ? catLabel(t.cat) + ' · ' + subLabel : catLabel(t.cat);
  const logoUrl    = buildLogoUrl(t.url);
  const initials   = buildInitials(t.name);
  const tags       = t.tags.map(tag => `<span class="tool-tag">${tag}</span>`).join('');

  document.getElementById('modal-icon-img').src = logoUrl;
  document.getElementById('modal-icon-img').alt = t.name;
  document.getElementById('modal-icon-img').onerror = function() {
    this.style.display = 'none';
    document.getElementById('modal-icon-fallback').style.display = 'flex';
    document.getElementById('modal-icon-fallback').textContent = initials;
  };
  document.getElementById('modal-icon-fallback').style.display = 'none';
  document.getElementById('modal-name').textContent = t.name;
  document.getElementById('modal-cat').textContent = catDisplay;
  document.getElementById('modal-price').textContent = priceMap[t.price] || t.price;
  document.getElementById('modal-price').className = 'price-badge ' + (priceClass[t.price] || '');
  document.getElementById('modal-desc').textContent = t.desc;
  document.getElementById('modal-tags').innerHTML = tags;
  document.getElementById('modal-link').href = safeUrl(t.url);

  const ctxEl = document.getElementById('modal-context');
  if (ctxEl) { ctxEl.textContent = context; ctxEl.style.display = context ? 'block' : 'none'; }

  const modal = document.getElementById('randomModal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Guarda foco anterior e move foco para dentro do modal
  _modalTrigger = document.activeElement;
  requestAnimationFrame(() => modal.querySelector('.modal-close').focus());

  // Prende o Tab dentro do modal
  _modalFocusTrap = e => {
    if (e.key !== 'Tab') return;
    const focusable = [...modal.querySelectorAll('a[href], button:not([disabled])')];
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  };
  modal.addEventListener('keydown', _modalFocusTrap);
}

function closeModal() {
  const modal = document.getElementById('randomModal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
  if (_modalFocusTrap) { modal.removeEventListener('keydown', _modalFocusTrap); _modalFocusTrap = null; }
  if (_modalTrigger)   { _modalTrigger.focus(); _modalTrigger = null; }
}


function showFormSuccess() {
  const el = document.getElementById('formSuccess');
  el.style.display = 'block';
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  ['ft-name','ft-url','ft-cat','ft-desc','ft-email'].forEach(id => {
    document.getElementById(id).value = '';
  });
}

// ===== NAV MOBILE =====
function toggleNav() {
  document.getElementById('mobileNav').classList.toggle('open');
}

// ===== REVEAL ON SCROLL =====
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

// ===== EVENT LISTENERS =====
function initEventListeners() {
  // Nav mobile
  document.querySelector('.nav-burger').addEventListener('click', toggleNav);
  document.querySelectorAll('.mobile-nav a').forEach(a => a.addEventListener('click', toggleNav));
  document.addEventListener('click', e => {
    const nav = document.getElementById('mobileNav');
    if (nav.classList.contains('open') && !nav.contains(e.target) && !document.querySelector('.nav-burger').contains(e.target)) {
      nav.classList.remove('open');
    }
  });

  // Busca
  document.getElementById('searchInput').addEventListener('input', applyFilters);

  // Filtros de categoria e preço
  document.querySelectorAll('[data-cat]').forEach(btn => btn.addEventListener('click', () => setCat(btn)));
  document.querySelectorAll('[data-price]').forEach(btn => btn.addEventListener('click', () => setPrice(btn)));

  // Subcategorias — delegação (botões gerados dinamicamente em setCat)
  document.getElementById('subBtns').addEventListener('click', e => {
    const btn = e.target.closest('[data-sub]');
    if (btn) setSub(btn);
  });

  // Favoritos
  document.getElementById('favAllBtn').addEventListener('click', () => setFavFilter('all'));
  document.getElementById('favOnlyBtn').addEventListener('click', () => setFavFilter('fav'));
  document.querySelector('.fav-clear').addEventListener('click', clearFavs);

  // Catálogo — delegação para fav-btn e tool-link (cards gerados dinamicamente)
  document.getElementById('toolsGrid').addEventListener('click', e => {
    const favBtn = e.target.closest('.fav-btn');
    if (favBtn) { toggleFav(favBtn.dataset.fav, favBtn); return; }

    const toolLink = e.target.closest('.tool-link');
    if (toolLink && typeof gtag !== 'undefined') {
      gtag('event', 'clique_ferramenta', {
        tool_name: toolLink.dataset.toolName,
        tool_cat: toolLink.dataset.toolCat,
        tool_price: toolLink.dataset.toolPrice
      });
    }
  });

  // Carregar mais
  document.getElementById('loadMoreBtn').addEventListener('click', loadMore);

  // Ferramenta aleatória
  document.querySelector('.btn-random').addEventListener('click', discoverRandom);
  document.querySelector('#randomModal .btn-secondary').addEventListener('click', discoverRandom);

  // Modal
  document.querySelector('.modal-close').addEventListener('click', closeModal);
  document.addEventListener('click', e => { if (e.target.id === 'randomModal') closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // Formulário
  document.querySelector('.form-btn').addEventListener('click', submitTool);

  // Logo fallback — onerror não funciona com CSP sem unsafe-inline
  document.addEventListener('error', e => {
    if (e.target.tagName === 'IMG' && e.target.classList.contains('logo-img')) {
      e.target.style.display = 'none';
      const fallback = e.target.nextElementSibling;
      if (fallback && fallback.classList.contains('tool-icon-fallback')) {
        fallback.style.display = 'flex';
      }
    }
  }, true);

  // Nav border on scroll
  window.addEventListener('scroll', () => {
    document.querySelector('nav').style.borderBottomColor = scrollY > 30 ? 'rgba(83,74,183,0.25)' : '';
  });
}

initEventListeners();

// ===== SKELETON LOADER =====
function showSkeleton(n = 6) {
  document.getElementById('toolsGrid').innerHTML = Array.from({ length: n }, () => `
    <div class="tool-card skeleton">
      <div class="skel-row">
        <div class="skel skel-icon"></div>
        <div class="skel-lines">
          <div class="skel skel-title"></div>
          <div class="skel skel-sub"></div>
        </div>
      </div>
      <div class="skel skel-desc"></div>
      <div class="skel skel-desc-short"></div>
      <div class="skel skel-footer"></div>
    </div>
  `).join('');
}

// ===== VALIDAÇÃO DE TOOLS.JSON =====
function validateTools(data) {
  const required = ['name', 'cat', 'sub', 'price', 'desc', 'tags', 'url'];
  data.forEach((t, i) => {
    required.forEach(field => {
      if (t[field] === undefined || t[field] === null || t[field] === '') {
        console.warn(`tools.json [${i}] "${t.name || '?'}": campo "${field}" ausente ou vazio`);
      }
    });
    if (t.url && !/^https?:\/\//.test(t.url)) {
      console.warn(`tools.json [${i}] "${t.name}": URL inválida — "${t.url}"`);
    }
  });
}

// ===== INIT — carrega tools.json e inicializa tudo =====
showSkeleton();
fetch('tools.json')
  .then(r => r.json())
  .then(data => {
    validateTools(data);
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
