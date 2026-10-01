// Validates data/itens.json. Runs in CI on every pull request that touches the
// catalog, and locally with: node scripts/validar-itens.mjs [caminho]
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const PRECOS = ['gratuito', 'freemium', 'pago'];
const CAMPOS = new Set(['id', 'nome', 'categoria', 'subcategoria', 'preco', 'afiliado', 'descricao', 'porque', 'link', 'tags', 'adicionado']);

const arquivo = process.argv[2] ? resolve(process.argv[2]) : new URL('../data/itens.json', import.meta.url);
let dados;
try {
  dados = JSON.parse(readFileSync(arquivo, 'utf8'));
} catch (e) {
  console.error(`data/itens.json não é um JSON válido: ${e.message}`);
  process.exit(1);
}

const texto = (v) => typeof v === 'string' && v.trim().length > 0;
const listaDeTextos = (v) => Array.isArray(v) && v.length > 0 && v.every(texto);
const objeto = (v) => v != null && typeof v === 'object' && !Array.isArray(v);
// Two links count as the same page regardless of protocol, "www." or a trailing slash.
const normalizarLink = (url) => url.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, '');
const erros = [];

const categorias = dados.categorias;
if (!objeto(categorias) || Object.keys(categorias).length === 0) {
  erros.push('"categorias" precisa ser um objeto com pelo menos uma categoria');
} else {
  for (const [chave, cat] of Object.entries(categorias)) {
    if (!texto(cat?.nome)) erros.push(`categorias.${chave}: "nome" é obrigatório`);
    if (!objeto(cat?.subcategorias) || !Object.values(cat.subcategorias).every(texto)) {
      erros.push(`categorias.${chave}: "subcategorias" precisa ser um objeto de nomes`);
    }
  }
}

if (!Array.isArray(dados.itens)) {
  console.error(['data/itens.json precisa ter a lista "itens".', ...erros].join('\n- '));
  process.exit(1);
}

const ids = new Set();
const links = new Map();

dados.itens.forEach((item, i) => {
  const onde = `itens[${i}]${texto(item.id) ? ` (${item.id})` : ''}`;
  const erro = (msg) => erros.push(`${onde}: ${msg}`);

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(item.id ?? '')) erro('"id" deve estar em kebab-case, ex.: "minha-ferramenta"');
  else if (ids.has(item.id)) erro('"id" repetido');
  else ids.add(item.id);

  for (const campo of ['nome', 'descricao']) {
    if (!texto(item[campo])) erro(`"${campo}" é obrigatório`);
  }

  const cat = objeto(categorias) ? categorias[item.categoria] : undefined;
  if (!cat) erro(`"categoria" deve ser uma de: ${Object.keys(categorias ?? {}).join(', ')}`);
  else if (!objeto(cat.subcategorias) || !Object.hasOwn(cat.subcategorias, item.subcategoria ?? '')) {
    erro(`"subcategoria" deve ser uma de ${item.categoria}: ${Object.keys(cat.subcategorias ?? {}).join(', ')}`);
  }

  if (!PRECOS.includes(item.preco)) erro(`"preco" deve ser ${PRECOS.join(', ')}`);
  if (item.afiliado != null && typeof item.afiliado !== 'boolean') erro('"afiliado" deve ser true ou false');

  if (!/^https:\/\/\S+$/.test(item.link ?? '')) erro('"link" deve ser uma URL https');
  else {
    const chave = normalizarLink(item.link);
    if (links.has(chave)) erro(`"link" repetido (já usado por ${links.get(chave)})`);
    else links.set(chave, item.id);
  }

  if (item.tags != null && !listaDeTextos(item.tags)) erro('"tags" deve ser uma lista de textos');
  if (item.porque != null && !texto(item.porque)) erro('"porque" deve ser um texto');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(item.adicionado ?? '')) erro('"adicionado" deve ser uma data AAAA-MM-DD');
  if (texto(item.descricao) && item.descricao.length > 220) erro('"descricao" deve ter no máximo 220 caracteres');
  if (texto(item.porque) && item.porque.length > 320) erro('"porque" deve ter no máximo 320 caracteres');
  Object.keys(item).filter((k) => !CAMPOS.has(k)).forEach((k) => erro(`campo desconhecido "${k}"`));
});

if (erros.length) {
  console.error(`Encontrei ${erros.length} problema(s) em data/itens.json:\n- ${erros.join('\n- ')}`);
  process.exit(1);
}
console.log(`OK: ${dados.itens.length} itens válidos.`);
