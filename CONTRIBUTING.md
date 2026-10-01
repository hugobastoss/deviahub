# Como contribuir

O DevIAHub é uma curadoria. Cada ferramenta sugerida precisa ter sido usada ou
testada por quem sugere, e a sugestão deve explicar por que ela vale a pena.

## Duas formas de sugerir

### 1. Pelo formulário (mais simples)

Abra uma [sugestão](https://github.com/hugobastoss/deviahub/issues/new?template=sugerir-item.yml).
Se ela for aprovada, a curadoria adiciona a ferramenta ao catálogo.

### 2. Por pull request

1. Faça um fork do repositório.
2. Adicione a ferramenta ao final da lista `itens` em `data/itens.json`.
3. Rode `node scripts/validar-itens.mjs` para conferir o formato.
4. Abra o pull request. A mesma validação roda automaticamente nele.

## Campos de cada ferramenta

| Campo | Obrigatório | Descrição |
|---|---|---|
| `id` | sim | Identificador único em kebab-case, ex.: `eleven-labs` |
| `nome` | sim | Nome exibido no card |
| `categoria` | sim | Uma das chaves de `categorias`: `ia`, `dev`, `design`, `video`, `prod` ou `ti` |
| `subcategoria` | sim | Uma das subcategorias da categoria escolhida, ex.: `voz` em `ia` |
| `preco` | sim | `gratuito`, `freemium` ou `pago` |
| `afiliado` | não | `true` quando o link é de afiliado. Definido pela curadoria |
| `descricao` | sim | O que faz, em até 220 caracteres |
| `porque` | não | Por que você recomenda, em até 320 caracteres |
| `link` | sim | URL `https` do site oficial. Não pode repetir o link de outra ferramenta |
| `tags` | não | Palavras-chave curtas |
| `adicionado` | sim | Data no formato AAAA-MM-DD |

Para criar uma subcategoria nova, adicione-a em `categorias` no mesmo arquivo.

Exemplo:

```json
{
  "id": "minha-ferramenta",
  "nome": "Minha Ferramenta",
  "categoria": "ia",
  "subcategoria": "voz",
  "preco": "freemium",
  "descricao": "O que a ferramenta faz, em uma ou duas frases.",
  "porque": "Como você usa e o que ganhou com isso.",
  "link": "https://minhaferramenta.com",
  "tags": ["voz", "dublagem"],
  "adicionado": "2026-10-01"
}
```

## O que a curadoria avalia

- **Uso real:** o campo `porque` conta uma experiência concreta, e não só repete a descrição.
- **Link oficial:** o link leva ao site da própria ferramenta, sem redirecionamentos de terceiros.
- **Preço correto:** o modelo de preço confere com o site da ferramenta.
- **Ativa:** a ferramenta está no ar e é mantida.
- **Sem duplicatas:** a ferramenta ainda não está no catálogo.
