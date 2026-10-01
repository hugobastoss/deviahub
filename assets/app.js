// Renders the catalog from data/itens.json. Items arrive through community
// pull requests, so text is always set with textContent and only https links
// are turned into anchors.
(() => {
  const POR_PAGINA = 30;
  const PRECOS = { gratuito: 'Gratuito', freemium: 'Freemium', pago: 'Pago' };
  const LOGO_TOKEN = 'pk_Kaw8UJfoTXOmvt_DWkqBnA';
  const CHAVE_FAVORITOS = 'deviahub:favoritos';
  const SVG = 'http://www.w3.org/2000/svg';
  const estado = { categoria: '', sub: '', preco: '', busca: '', soFavoritos: false, visiveis: POR_PAGINA };
  let categorias = {};
  let itens = [];
  let lista = [];
  let indice = new Map();
  let favoritos = new Set();
  let ultimoSorteado = null;

  const $ = (id) => document.getElementById(id);

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  const linkSeguro = (url) => (typeof url === 'string' && /^https:\/\//.test(url) ? url : null);
  const normalizar = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const nomeCategoria = (c) => categorias[c].nome;
  const nomeSub = (c, s) => categorias[c].subcategorias[s];

  // Favorites live only in this browser. Storage can be missing or blocked
  // (private windows), so they then last for the visit only.
  function lerFavoritos() {
    try {
      const salvos = JSON.parse(localStorage.getItem(CHAVE_FAVORITOS) || '[]');
      return new Set(Array.isArray(salvos) ? salvos.filter((id) => typeof id === 'string') : []);
    } catch {
      return new Set();
    }
  }

  function salvarFavoritos() {
    try {
      localStorage.setItem(CHAVE_FAVORITOS, JSON.stringify([...favoritos]));
    } catch {
      // Sem storage: os favoritos valem só nesta visita.
    }
  }

  function lerUrl() {
    const p = new URLSearchParams(location.search);
    const categoria = p.get('categoria') ?? '';
    estado.categoria = Object.hasOwn(categorias, categoria) ? categoria : '';
    const sub = p.get('sub') ?? '';
    estado.sub = estado.categoria && Object.hasOwn(categorias[estado.categoria].subcategorias, sub) ? sub : '';
    const preco = p.get('preco') ?? '';
    estado.preco = Object.hasOwn(PRECOS, preco) ? preco : '';
    estado.busca = p.get('q') || '';
  }

  function salvarUrl() {
    const p = new URLSearchParams();
    if (estado.categoria) p.set('categoria', estado.categoria);
    if (estado.sub) p.set('sub', estado.sub);
    if (estado.preco) p.set('preco', estado.preco);
    if (estado.busca) p.set('q', estado.busca);
    const qs = p.toString();
    history.replaceState(null, '', `${location.pathname}${qs ? `?${qs}` : ''}${location.hash}`);
  }

  function icone(d, className) {
    const svg = document.createElementNS(SVG, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    if (className) svg.setAttribute('class', className);
    const path = document.createElementNS(SVG, 'path');
    path.setAttribute('d', d);
    svg.append(path);
    return svg;
  }

  const CORACAO = 'M12 20.5s-7.5-4.6-9.2-9.4C1.6 7.6 3.9 4 7.4 4c2 0 3.6 1.1 4.6 2.7C13 5.1 14.6 4 16.6 4c3.5 0 5.8 3.6 4.6 7.1-1.7 4.8-9.2 9.4-9.2 9.4Z';

  function iniciais(nome) {
    return nome.replace(/[^\p{L}\p{N}]+/gu, ' ').trim().split(' ').filter(Boolean)
      .slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?';
  }

  // Logos come from logo.dev by domain. When one fails to load, the initials
  // take its place.
  function logo(item) {
    const caixa = el('div', 'logo');
    const letras = el('span', 'logo-iniciais', iniciais(item.nome));
    letras.setAttribute('aria-hidden', 'true');
    const href = linkSeguro(item.link);
    if (href) {
      const img = document.createElement('img');
      img.alt = '';
      img.width = 40;
      img.height = 40;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.addEventListener('error', () => { img.remove(); letras.hidden = false; }, { once: true });
      img.src = `https://img.logo.dev/${new URL(href).hostname.replace(/^www\./, '')}?token=${LOGO_TOKEN}&size=80&format=png`;
      letras.hidden = true;
      caixa.append(img);
    }
    caixa.append(letras);
    return caixa;
  }

  function botaoFavorito(item) {
    const botao = el('button', 'favorito');
    botao.type = 'button';
    botao.dataset.favorito = item.id;
    botao.setAttribute('aria-label', `Favoritar ${item.nome}`);
    botao.setAttribute('aria-pressed', String(favoritos.has(item.id)));
    botao.append(icone(CORACAO));
    return botao;
  }

  function card(item) {
    const art = el('article', 'item');

    const cabeca = el('div', 'item-cabeca');
    const titulo = el('div', 'item-titulo');
    titulo.append(
      el('h3', 'item-nome', item.nome),
      el('p', 'item-cat', `${nomeCategoria(item.categoria)} · ${nomeSub(item.categoria, item.subcategoria)}`),
    );
    cabeca.append(logo(item), titulo, botaoFavorito(item));
    art.append(cabeca, el('p', 'item-desc', item.descricao));

    if (item.porque) {
      const porque = el('div', 'porque');
      porque.append(el('p', 'bloco-rotulo', 'Por que recomendamos'), el('p', null, item.porque));
      art.append(porque);
    }
    if (item.tags?.length) {
      const tags = el('ul', 'tags');
      item.tags.slice(0, 3).forEach((t) => tags.append(el('li', null, `#${t}`)));
      art.append(tags);
    }

    const pe = el('div', 'item-pe');
    const selos = el('div', 'selos');
    selos.append(el('span', `preco preco--${item.preco}`, PRECOS[item.preco]));
    if (item.afiliado) {
      const selo = el('span', 'afiliado', 'Afiliado');
      selo.title = 'Link de afiliado: a indicação pode gerar comissão.';
      selos.append(selo);
    }
    pe.append(selos);
    const href = linkSeguro(item.link);
    if (href) {
      const a = el('a', 'acessar', 'Acessar →');
      a.href = href;
      a.target = '_blank';
      a.rel = item.afiliado ? 'sponsored noopener' : 'noopener';
      a.setAttribute('aria-label', `Acessar ${item.nome} (abre em nova aba)`);
      pe.append(a);
    }
    art.append(pe);
    return art;
  }

  function filtrar() {
    const termo = normalizar(estado.busca.trim());
    return itens.filter((i) =>
      (!estado.categoria || i.categoria === estado.categoria) &&
      (!estado.sub || i.subcategoria === estado.sub) &&
      (!estado.preco || i.preco === estado.preco) &&
      (!estado.soFavoritos || favoritos.has(i.id)) &&
      (!termo || indice.get(i).includes(termo)));
  }

  function pilula(texto, chave, valor) {
    const botao = el('button', null, texto);
    botao.type = 'button';
    botao.dataset[chave] = valor;
    return botao;
  }

  function renderCategorias() {
    $('filtro-categoria').replaceChildren(
      pilula('Todas as categorias', 'categoria', ''),
      ...Object.keys(categorias).map((c) => pilula(nomeCategoria(c), 'categoria', c)),
    );
  }

  function renderSubcategorias() {
    const grupo = $('filtro-sub');
    grupo.hidden = !estado.categoria;
    if (!estado.categoria) return;
    if (grupo.dataset.categoria !== estado.categoria) {
      grupo.dataset.categoria = estado.categoria;
      const subs = Object.entries(categorias[estado.categoria].subcategorias);
      grupo.replaceChildren(
        pilula(`Todas em ${nomeCategoria(estado.categoria)}`, 'sub', ''),
        ...subs.map(([s, nome]) => pilula(nome, 'sub', s)),
      );
    }
  }

  const marcar = (seletor, chave, valor) => document.querySelectorAll(seletor)
    .forEach((b) => b.setAttribute('aria-pressed', String(b.dataset[chave] === valor)));

  function totalFavoritos() {
    return itens.reduce((n, i) => n + (favoritos.has(i.id) ? 1 : 0), 0);
  }

  function atualizarMais() {
    const restantes = lista.length - estado.visiveis;
    $('mais-area').hidden = restantes <= 0;
    $('mais').textContent = `Mostrar mais (${restantes} ${restantes === 1 ? 'restante' : 'restantes'})`;
  }

  function render(manterPagina = false) {
    if (!manterPagina) estado.visiveis = POR_PAGINA;
    lista = filtrar();
    $('grade').replaceChildren(...lista.slice(0, estado.visiveis).map(card));

    const favoritosVazios = estado.soFavoritos && totalFavoritos() === 0;
    $('vazio').hidden = lista.length > 0;
    $('vazio-texto').textContent = favoritosVazios ? 'Você ainda não favoritou nenhuma ferramenta.' : 'Nenhuma ferramenta encontrada.';
    $('contagem').textContent = `${lista.length} de ${itens.length} ferramentas`;
    $('total-favoritos').textContent = `(${totalFavoritos()})`;
    $('so-favoritos').setAttribute('aria-pressed', String(estado.soFavoritos));
    $('sortear').disabled = lista.length === 0;
    atualizarMais();

    renderSubcategorias();
    marcar('#filtro-categoria button', 'categoria', estado.categoria);
    marcar('#filtro-sub button', 'sub', estado.sub);
    marcar('#filtro-preco button', 'preco', estado.preco);
    salvarUrl();
  }

  function mostrarMais() {
    const inicio = estado.visiveis;
    estado.visiveis += POR_PAGINA;
    $('grade').append(...lista.slice(inicio, estado.visiveis).map(card));
    atualizarMais();
  }

  function alternarFavorito(id) {
    if (favoritos.has(id)) favoritos.delete(id);
    else favoritos.add(id);
    salvarFavoritos();
    document.querySelectorAll('.favorito').forEach((b) => {
      if (b.dataset.favorito === id) b.setAttribute('aria-pressed', String(favoritos.has(id)));
    });
    if (estado.soFavoritos) render(true);
    else $('total-favoritos').textContent = `(${totalFavoritos()})`;
  }

  function contextoSorteio(total) {
    const partes = [total === 1 ? 'Só 1 ferramenta com estes filtros' : `Sorteando entre ${total} ferramentas`];
    if (estado.categoria) partes.push(nomeCategoria(estado.categoria));
    if (estado.sub) partes.push(nomeSub(estado.categoria, estado.sub));
    if (estado.preco) partes.push(PRECOS[estado.preco]);
    if (estado.soFavoritos) partes.push('Favoritos');
    if (estado.busca.trim()) partes.push(`“${estado.busca.trim()}”`);
    return partes.join(' · ');
  }

  // Draws from the list the visitor is looking at, so every active filter
  // applies, and avoids repeating the previous draw when there is a choice.
  function sortear() {
    if (lista.length === 0) return;
    const opcoes = lista.length > 1 ? lista.filter((i) => i !== ultimoSorteado) : lista;
    const item = opcoes[Math.floor(Math.random() * opcoes.length)];
    ultimoSorteado = item;
    $('sorteio-contexto').textContent = contextoSorteio(lista.length);
    $('sorteio-card').replaceChildren(card(item));
    $('sortear-outra').disabled = lista.length < 2;
    const dialogo = $('sorteio');
    if (!dialogo.open) dialogo.showModal();
  }

  function aoClicarGrupo(id, aplicar) {
    $(id).addEventListener('click', (e) => {
      const botao = e.target.closest('button');
      if (!botao) return;
      aplicar(botao);
      render();
    });
  }

  async function iniciar() {
    favoritos = lerFavoritos();
    let dados;
    try {
      const resposta = await fetch('data/itens.json', { cache: 'no-cache' });
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
      dados = await resposta.json();
    } catch {
      $('contagem').textContent = 'Não foi possível carregar o catálogo.';
      return;
    }

    categorias = dados.categorias ?? {};
    // The CI validates the catalog; this only keeps one bad entry from
    // breaking the whole page.
    itens = (dados.itens ?? []).filter((i) =>
      Object.hasOwn(categorias, i.categoria ?? '') &&
      Object.hasOwn(categorias[i.categoria].subcategorias ?? {}, i.subcategoria ?? '') &&
      Object.hasOwn(PRECOS, i.preco ?? ''));
    indice = new Map(itens.map((i) => [i, normalizar([
      i.nome, i.descricao, i.porque ?? '', ...(i.tags ?? []),
      nomeCategoria(i.categoria), nomeSub(i.categoria, i.subcategoria),
    ].join(' '))]));

    lerUrl();
    $('busca').value = estado.busca;
    renderCategorias();
    render();

    aoClicarGrupo('filtro-categoria', (b) => { estado.categoria = b.dataset.categoria; estado.sub = ''; });
    aoClicarGrupo('filtro-sub', (b) => { estado.sub = b.dataset.sub; });
    aoClicarGrupo('filtro-preco', (b) => { estado.preco = b.dataset.preco; });
    $('busca').addEventListener('input', (e) => {
      estado.busca = e.target.value;
      render();
    });
    $('so-favoritos').addEventListener('click', () => {
      estado.soFavoritos = !estado.soFavoritos;
      render();
    });
    $('limpar').addEventListener('click', () => {
      Object.assign(estado, { categoria: '', sub: '', preco: '', busca: '', soFavoritos: false });
      $('busca').value = '';
      render();
    });
    $('mais').addEventListener('click', mostrarMais);
    $('sortear').addEventListener('click', sortear);
    $('sortear-outra').addEventListener('click', sortear);

    // One listener serves the hearts in the grid and in the draw dialog.
    document.addEventListener('click', (e) => {
      const botao = e.target.closest('.favorito');
      if (botao) alternarFavorito(botao.dataset.favorito);
    });
    // A click on the backdrop lands on the <dialog> itself, not on its content.
    $('sorteio').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) e.currentTarget.close();
    });
  }

  document.addEventListener('DOMContentLoaded', iniciar);
})();
