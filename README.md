# DevIAHub

Curadoria aberta de mais de 600 ferramentas de IA, desenvolvimento, design,
vídeo e produtividade, separadas por categoria e preço.

🌐 https://hugobastoss.github.io/deviahub/

## Sugerir uma ferramenta

Use o [formulário de sugestão](https://github.com/hugobastoss/deviahub/issues/new?template=sugerir-item.yml)
ou veja o [guia de contribuição](CONTRIBUTING.md) para abrir um pull request.

## Estrutura

```
index.html              # página do catálogo
favicon.svg
assets/
  styles.css
  app.js                # lê data/itens.json e monta os cards, a busca, os filtros, os favoritos e o sorteio
data/
  itens.json            # categorias e todas as ferramentas do catálogo
scripts/
  validar-itens.mjs     # valida o formato de data/itens.json
.github/
  ISSUE_TEMPLATE/       # formulário de sugestão
  workflows/            # validação do catálogo em pull requests
```

HTML, CSS e JavaScript estáticos, sem build. Publicado pelo GitHub Pages a
partir da branch `main`.

## Rodar localmente

O catálogo é carregado com `fetch`, então abra a pasta por um servidor:

```bash
python -m http.server 8000
```

Depois acesse http://localhost:8000.

## Validar o catálogo

```bash
node scripts/validar-itens.mjs
```

---

Um projeto da [HVCB App&Games](https://hugobastoss.github.io/hvcb-appgames/).
