# DevIAHub: redesign do TiDev-IA no padrão DevSkillsHub / DevStacksHub

Data: 2026-10-01 · Branch: `feat/deviahub`

## Objetivo

Transformar o site tidev.ia (catálogo de ~617 ferramentas de TI, Dev e IA) no
**DevIAHub**, o terceiro hub da família da HVCB App&Games, ao lado do
[DevSkillsHub](https://github.com/hugobastoss/devskillshub) e do
[DevStacksHub](https://devstackshub.base44.app/). Ele deve ter o mesmo design e
a mesma construção do DevSkillsHub e uma cor de destaque própria.

**Sucesso significa:**
- Quem abrir os três hubs reconhece a mesma família: topo, hero, catálogo, cards,
  bloco de sugestão e rodapé.
- O repositório tem a mesma organização do devskillshub: HTML, CSS e JS
  estáticos, sem build, catálogo em JSON validado no CI e sugestões por issue.
- O site está publicado no GitHub Pages, como o devskillshub.

## Decisões tomadas

| Tema | Decisão |
|---|---|
| Propósito | Só curadoria. Sai a seção comercial ("Pronto para resolver?", orçamento, e-mail e Instagram da tidev.ia) |
| Sugestões | Formulário de issue no GitHub + PR. Saem o Google Sheets e o `apps-script.js` |
| Recursos mantidos | Busca, filtros (categoria, subcategoria, preço), favoritos, ferramenta aleatória |
| Recursos removidos | "Recém adicionadas", Google Analytics 4, animações de entrada, skeleton, emojis nos filtros |
| Cor de destaque | Laranja âmbar: `#FB923C` (escuro) / `#C2410C` (claro) |
| Abordagem | Porte completo para o modelo do devskillshub (estrutura, schema em português, JS reescrito) |
| Hospedagem | GitHub Pages (`hugobastoss.github.io/deviahub`). Revisado: a primeira versão previa Vercel com redirect da Netlify |
| Repositório | Renomear `hugobastoss/TiDev-IA` para `hugobastoss/deviahub` |

## 1. Estrutura e dados

### Arquivos

```
index.html
favicon.svg
assets/
  styles.css
  app.js                  # lê data/itens.json e monta cards, busca, filtros, favoritos e sorteio
data/
  itens.json              # taxonomia de categorias + todos os itens
scripts/
  validar-itens.mjs       # valida o formato de data/itens.json
.github/
  ISSUE_TEMPLATE/sugerir-item.yml
  pull_request_template.md
  workflows/validar-itens.yml
README.md
CONTRIBUTING.md
.nojekyll
sitemap.xml
.gitignore
```

**Removidos:** `netlify.toml`, `robots.txt`, `script.js`, `style.css`, `tools.json`, `apps-script.js`, `img/`,
`tidev-ia-icon.svg` e `.claude/worktrees/` (cópia antiga do site versionada por
engano; `.claude/` vai para o `.gitignore`).

Não há `estrelas.json` nem a action de estrelas: as ferramentas são produtos e
sites, não repositórios do GitHub.

### Formato de `data/itens.json`

```json
{
  "categorias": {
    "ia": {
      "nome": "IA",
      "subcategorias": { "llm": "Assistentes", "escrita": "Escrita" }
    }
  },
  "itens": [
    {
      "id": "chatgpt",
      "nome": "ChatGPT",
      "categoria": "ia",
      "subcategoria": "llm",
      "preco": "freemium",
      "descricao": "Assistente de IA da OpenAI: textos, código, análises e raciocínio avançado.",
      "link": "https://chatgpt.com",
      "tags": ["openai", "textos", "código"],
      "adicionado": "2026-10-01"
    }
  ]
}
```

| Campo | Obrigatório | Regra |
|---|---|---|
| `id` | sim | kebab-case, único. Na migração, gerado do nome sem acentos (`Copy.ai` → `copy-ai`) |
| `nome` | sim | texto |
| `categoria` | sim | chave existente em `categorias` |
| `subcategoria` | sim | chave existente em `categorias[categoria].subcategorias` |
| `preco` | sim | `gratuito`, `freemium` ou `pago` |
| `afiliado` | não | `true` quando o link é de afiliado; ausente equivale a `false` |
| `descricao` | sim | até 220 caracteres |
| `porque` | não | até 320 caracteres; quando existe, o card mostra "Por que recomendamos" |
| `link` | sim | URL `https`, única no catálogo |
| `tags` | não | lista de textos curtos |
| `adicionado` | sim | `AAAA-MM-DD` |

Qualquer campo fora dessa lista é erro.

**Taxonomia.** A ordem das chaves define a ordem das pílulas na página:

| Chave | Nome | Subcategorias (chave: nome) |
|---|---|---|
| `ia` | IA | llm: Assistentes · escrita: Escrita · imagem: Imagem · voz: Voz e áudio · musica: Música · codigo: Código · automacao: Automação · pesquisa: Pesquisa · social: Social · vendas: Vendas · dados: Dados · avatar: Avatares · 3d: 3D · rh: RH · juridico: Jurídico · educacao: Educação · plataforma: Plataformas |
| `dev` | Dev | ferramentas: Ferramentas · nocode: No-code · backend: Backend e API · hospedagem: Hospedagem · ecommerce: E-commerce |
| `design` | Design | criacao: Criação · uidesign: UI e protótipo · logo: Logo e marca · recursos: Recursos |
| `video` | Vídeo | editor: Editor · gerador: Gerador · avatar: Avatar e apresentador · dublagem: Dublagem e legenda |
| `prod` | Produtividade | gestao: Gestão · reunioes: Reuniões · marketing: Marketing e CRM · dados: Dados e relatórios |
| `ti` | TI | seguranca: Segurança · performance: Performance · analise: Análise |

**Ordem dos itens:** a ordem do arquivo é mantida, e a curadoria deixa os
principais primeiro. Diferente do DevSkillsHub, não há ordenação alfabética:
com ~609 itens, ela colocaria nomes pouco conhecidos no topo.

### Migração de `tools.json`

Um script avulso (fora do repositório, no scratchpad) converte `tools.json` em
`data/itens.json`:

- Campos: `name`→`nome`, `cat`→`categoria`, `sub`→`subcategoria`,
  `desc`→`descricao`, `url`→`link`, `tags`→`tags`. Os preços `free`, `freemium`
  e `paid` viram `gratuito`, `freemium` e `pago`. `adicionado` = `2026-10-01`.
- Saem `icon` (emoji) e `commission`. A comissão continua no histórico do git.
- As 16 afiliadas (`price: "affiliate"`) recebem `afiliado: true` e um preço
  real. **Confira esta lista:**

  | Ferramenta | Preço atribuído |
  |---|---|
  | Copy.ai | freemium |
  | Jasper | pago |
  | Make | freemium |
  | Zapier | freemium |
  | Manychat | freemium |
  | Webflow | freemium |
  | Bitdefender | freemium |
  | Backblaze | pago |
  | 1Password | pago |
  | ActiveCampaign | pago |
  | GetResponse | freemium |
  | HubSpot | freemium |
  | Calendly | freemium |
  | Shopify | pago |
  | Nuvemshop | freemium |
  | Hostinger | pago |

**Limpeza:**

- **Duplicatas juntadas.** Fica o item listado primeiro abaixo, com as tags dos dois:
  - "GitHub Copilot" absorve "Copilot".
  - "Perplexity" absorve "Perplexity AI".
  - "Otter.ai" (ia/voz) absorve "Otter AI".
  - "You.com" absorve "You" e passa para ia/pesquisa.
  - "Vidyo.ai" (video/editor) absorve "Vidyo".
  - "Designs.ai" (design/criacao) absorve "Designs AI". Esta sexta duplicata
    apareceu na implementação: as URLs só diferiam pela barra final.
- **Links corrigidos.** Produtos diferentes que dividiam a mesma URL ganham a
  página específica:
  - Whisper → `https://github.com/openai/whisper`
  - Shumai (Meta) → `https://github.com/facebookresearch/shumai`
  - Notion AI → `https://www.notion.com/product/ai`
  - Canva Text to Image → `https://www.canva.com/ai-image-generator/`
  - Topaz Photo AI → `https://www.topazlabs.com/topaz-photo-ai`
  - Topaz Video AI → `https://www.topazlabs.com/topaz-video-ai`

  Cada link novo é conferido com uma requisição antes de entrar no catálogo. Se
  algum não responder 2xx/3xx, entra a página oficial equivalente que responder,
  e a troca é registrada no commit.
- **Removidos.** Detect GPT e ChatGPT Chrome Extension apontam para a raiz da
  Chrome Web Store e não têm um link oficial confiável.
- **`https`.** O link `http://patterned.ai/` vira `https://patterned.ai/`.
- **Resultado:** 609 itens.

### Validador (`scripts/validar-itens.mjs`)

Usa as mesmas regras e a mesma saída do devskillshub ("OK: N itens válidos." ou
a lista de problemas com `itens[i] (id)`, saindo com código 1). Além disso:

- `categorias` é um objeto, e cada categoria tem `nome` e `subcategorias`.
- `categoria` e `subcategoria` de cada item existem na taxonomia.
- `preco` é um dos três valores, e `afiliado`, quando existe, é booleano.
- `link` é `https` e não se repete no catálogo. A comparação ignora o
  protocolo, o `www.` e a barra final.
- Aceita um caminho opcional (`node scripts/validar-itens.mjs arquivo.json`),
  usado para testar o validador contra cópias com erros.

O CI (`.github/workflows/validar-itens.yml`) roda o validador em PRs e em pushes
na `main` que mexem em `data/**` ou no próprio script, igual ao devskillshub.

## 2. Visual e página

### Tokens

Iguais aos do DevSkillsHub; só o destaque muda.

| Token | Escuro | Claro |
|---|---|---|
| `--bg` | `#0B0C0F` | `#F6F7F9` |
| `--surface` | `#13151A` | `#FFFFFF` |
| `--surface-2` | `#1A1D23` | `#F0F2F5` |
| `--line` | `#262A31` | `#E1E4EA` |
| `--ink` | `#ECEDEF` | `#14161A` |
| `--muted` | `#9BA1AB` | `#5B616B` |
| `--accent` | `#FB923C` | `#C2410C` |
| `--accent-ink` | `#431407` | `#FFFFFF` |
| `--accent-soft` | `rgba(251,146,60,.1)` | `rgba(194,65,12,.08)` |
| `--gratuito` | `#34D399` | `#047857` |
| `--freemium` | `#818CF8` | `#4F46E5` |
| `--pago` | `#9BA1AB` | `#5B616B` |

- **Fontes:** Space Grotesk 600/700 (títulos), Inter 400/500/600 (texto) e
  JetBrains Mono 400/500 (detalhes), do Google Fonts.
- **Tema:** o claro e o escuro seguem `prefers-color-scheme`, como nos irmãos;
  não há botão de troca.
- **Contraste:** o `--accent` passa de 4.5:1 sobre `--bg` nos dois temas, e o
  `--accent-ink` sobre `--accent` passa de 4.5:1.

### Ícone

Quadrado com cantos arredondados (`rx=8`) em `--accent` e glifo em `#431407`:
três nós ligados, uma rede neural simplificada que herda os nós do hero atual.
O mesmo SVG serve de `favicon.svg` e do ícone do topo.

### Seções

1. **Topo fixo e translúcido:** ícone + "DevIAHub". Menu: Catálogo, Sugerir e
   GitHub. Em telas com menos de 26rem, "Catálogo" some, como no irmão.
2. **Hero:**
   - Grade de fundo com máscara radial e sem selo acima do título (o "Curadoria aberta" foi removido a pedido do dono).
   - Título: "Ferramentas de IA certas para o seu **trabalho.**", com
     "trabalho." em `--accent`.
   - Texto de apoio: "Mais de 600 ferramentas de IA, desenvolvimento, design,
     vídeo e produtividade, separadas por categoria e preço."
   - Botões: "Explorar o catálogo" (cheio) e "Sugerir uma ferramenta" (contorno).
3. **Catálogo** (`#catalogo`):
   - Título "Catálogo" e a contagem "N de 609 ferramentas" (`aria-live="polite"`).
   - Busca que ignora acentos e maiúsculas, nos campos `nome`, `descricao`,
     `porque`, `tags` e nos nomes de categoria e subcategoria.
   - Grupos de pílulas com `aria-pressed`:
     - **Categoria:** "Todas" + as 6 categorias.
     - **Subcategoria:** aparece só com uma categoria escolhida; "Todas" + as
       da categoria.
     - **Preço:** "Todos", "Gratuito", "Freemium" e "Pago".
   - Linha de ações:
     - **"Só favoritos (n)"**: um toggle com `aria-pressed`.
     - **"Descobrir ferramenta"**: abre o sorteio.
   - Estado na URL com `history.replaceState`: `?categoria=ia&sub=escrita&preco=gratuito&q=voz`.
     Valores inválidos são ignorados, e `sub` só vale junto com a `categoria`
     dela. Os favoritos não entram na URL.
   - **Paginação:** mostra 30 cards; o botão "Mostrar mais (N restantes)"
     adiciona mais 30. Qualquer mudança de filtro volta para os 30 primeiros.
   - **Vazio:** "Nenhuma ferramenta encontrada." com o botão "Limpar filtros".
     Com o toggle de favoritos ligado e nenhum favorito, aparece "Você ainda não
     favoritou nenhuma ferramenta."
   - **`noscript`:** aviso com link para `data/itens.json` no GitHub.
4. **Card** (`article.item`):
   - **Cabeça:**
     - Logo de 2.5rem: `https://img.logo.dev/{domínio}?token=…&size=80&format=png`.
       Em caso de erro, mostra as iniciais sobre `--surface-2` (listener
       `error` no próprio `img`, sem `onerror` inline).
     - Nome (`h3`, Space Grotesk) e a linha "IA · Escrita" em `--muted`.
     - Botão de coração à direita, com `aria-pressed` e `aria-label="Favoritar {nome}"`.
   - **Corpo:** a descrição e, se houver `porque`, o bloco "Por que recomendamos"
     com borda esquerda em `--accent`, igual ao irmão.
   - **Pé:**
     - Selo de preço com a cor do token.
     - Selo "Afiliado" quando `afiliado`.
     - Até 3 tags (`#tag`).
     - Link "Acessar →", com `target="_blank"`, `rel="noopener"` (mais
       `sponsored` se for afiliado) e `aria-label="Acessar {nome}"`.
   - Todo texto vem de `textContent`; só links `https` viram `href`.
5. **Ferramenta aleatória:**
   - Um `<dialog>` nativo aberto com `showModal()`. Ele já cuida do foco, do Esc
     e do fundo (`::backdrop`).
   - **Sorteio:** usa a lista filtrada atual (filtros, busca e toggle de
     favoritos) e não repete a anterior quando há mais de uma opção. Com a lista
     vazia, o botão fica desabilitado.
   - **Conteúdo:**
     - A linha de contexto "Sorteando entre 112 ferramentas · IA · Gratuito".
     - O card da ferramenta, que já traz o coração e o "Acessar →".
     - O botão "Sortear outra".
     - O botão fechar (×).
6. **Sugerir** (`#sugerir`):
   - Uma caixa com o título "Conhece uma ferramenta que merece estar aqui?".
   - Três passos: abrir uma sugestão no GitHub pelo formulário; contar por que
     recomenda; a curadoria revisa e, se aprovado, a ferramenta entra no
     catálogo.
   - O botão "Sugerir pelo formulário" e o link "Prefere abrir um pull request?",
     que leva ao CONTRIBUTING.
7. **Rodapé:** "DevIAHub · um projeto da HVCB App&Games" (link
   `https://hugobastoss.github.io/hvcb-appgames/`) e "Cada ferramenta pertence
   aos seus criadores. Links marcados como afiliado podem gerar comissão."

### Favoritos

- Ficam em `localStorage['deviahub:favoritos']` como uma lista de `id`s.
- Leitura e escrita vão em `try/catch`; sem storage, os favoritos valem só
  durante a visita.
- Os favoritos do domínio antigo não migram (outra origem).

### Metadados

- `<title>`: "DevIAHub — Ferramentas de IA, desenvolvimento e produtividade".
- `description`, `og:*`, `canonical` e `og:url` apontam para
  `https://hugobastoss.github.io/deviahub/`.
- `theme-color` é `#0B0C0F` e `color-scheme` é `dark light`.
- Sem `og:image`, como no irmão.
- `sitemap.xml` é atualizado para a URL nova.
- A CSP vai numa `<meta http-equiv>` (ver parte 3).

### Formulário de issue (`sugerir-item.yml`)

- Campos:
  - nome;
  - link (https);
  - categoria (dropdown com as 6);
  - subcategoria (texto livre);
  - preço (dropdown Gratuito/Freemium/Pago);
  - o que faz;
  - por que você recomenda (obrigatório);
  - tags.
- Confirmação obrigatória: "Usei ou testei esta ferramenta."
- O label é `sugestão`.

## 3. Deploy e migração

> Revisado em 2026-10-01: a hospedagem mudou da Vercel para o **GitHub Pages**,
> como no devskillshub. A Netlify foi descartada sem redirect (o projeto lá será
> excluído pelo dono), então os links para `tidevia.netlify.app` deixam de
> funcionar.

### GitHub Pages

- Publicado a partir da branch `main`, pasta raiz, em
  `https://hugobastoss.github.io/deviahub/`.
- `.nojekyll` na raiz, como no irmão.
- **Cache:** o GitHub Pages usa `max-age=600` para tudo. Isso corrige o
  problema antigo: o CSS tinha `max-age=31536000, immutable` sem mudar de nome,
  e quem já visitou podia ficar com o CSS antigo por um ano.
- **Segurança:** o Pages não aceita cabeçalhos próprios. A CSP vai numa
  `<meta http-equiv>` logo após o `charset`:
  ```
  default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com;
  font-src https://fonts.gstatic.com; img-src 'self' https://img.logo.dev data:;
  connect-src 'self'; base-uri 'self'; form-action 'self'
  ```
  A `<meta>` não suporta `frame-ancestors`, e o `X-Frame-Options` não pode ser
  definido. Por isso o site pode ser embutido em iframe por terceiros. O risco é
  baixo para um catálogo sem login, e o devskillshub tem a mesma limitação.
- **Versão dos assets:** a página referencia CSS e JS com `?v=<hash do
  conteúdo>` (`scripts/versionar-assets.mjs`; o CI confere com `--verificar`),
  para o cache de 10 minutos não juntar uma página nova com um script antigo.
  Adicionado depois de o DevStacksHub ficar com o catálogo vazio por esse motivo.
- Sem `robots.txt`: dentro de uma subpasta (`/deviahub/`) ele não tem efeito.
  O `sitemap.xml` continua e pode ser enviado ao Search Console.

### Ordem de execução

1. Implementar tudo na branch `feat/deviahub` (esta spec é o primeiro commit).
2. **Renomear o repositório:** `gh repo rename deviahub` e
   `git remote set-url origin https://github.com/hugobastoss/deviahub.git`.
   O GitHub redireciona as URLs antigas do repositório.
3. **Merge na `main`** (fast-forward) e push.
4. **Ativar o Pages** pela API (`main`, `/`) e esperar a primeira publicação.
5. Criar o label `sugestão`, usado pelo formulário de issue, e atualizar a
   descrição e o site do repositório.
6. Conferir o site publicado.

## Verificação

- `node scripts/validar-itens.mjs` imprime "OK: 609 itens válidos.".
- **O validador reprova** uma cópia temporária do catálogo com erros
  conhecidos:
  - id repetido;
  - categoria inexistente;
  - subcategoria de outra categoria;
  - preço inválido;
  - link `http`;
  - link repetido;
  - campo desconhecido.
- **No Edge headless**, servindo o site localmente:
  - screenshots no desktop (1366px) e no celular (390px), nos temas escuro e
    claro, sem rolagem horizontal;
  - filtros combinados, URL com parâmetros (carregar `?categoria=ia&sub=escrita`
    restaura o estado), "Mostrar mais", favoritos (persistem após recarregar),
    toggle de favoritos, sorteio (abre, sorteia outra, fecha com Esc) e
    "Limpar filtros";
  - nenhum erro no console, inclusive violações da CSP da `<meta>`.
- **No site publicado**, depois do merge: o mesmo teste do navegador roda contra
  `https://hugobastoss.github.io/deviahub/`, e o workflow de validação passa
  no push da `main`.

## Fora do escopo

- Domínio próprio para o DevIAHub.
- Atualizar o site da HVCB App&Games para listar o DevIAHub.
- Escrever `porque` para os itens migrados.
- Analytics de qualquer tipo.
