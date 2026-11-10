# Belaways Intelligence: sistema visual

- Paleta: rosa da marca (`--pink #e0399f`, hover `#c92a8b`), acento de texto `rgb(200 30 134)` no claro e `rgb(255 120 200)` no escuro. Fundos neutros quentes. Sem gradientes roxos.
- Tokens em `src/index.css` (`:root` e `:root.dark`), expostos no Tailwind como `bg`, `ink`, `muted`, `faint`, `line`, `chip`, `accent`, `pos`, `neg`, `warn`, `info`, `pink`. Não usar `zinc-*`/`brand-*` nas telas.
- Superfícies: `.glass` (vidro com blur e borda de luz), campos `.field`, botão principal `.btn-primary` (pílula rosa sólida). Fundo com `Ambient` (manchas desfocadas).
- Fontes: Hanken Grotesk (texto), Bricolage Grotesque (títulos, `font-display`), IBM Plex Mono.
- Navegação: sidebar de vidro flutuante, pílula ativa rosa animada (framer-motion `layoutId`), grupos Operação e Administração.
- Controles com altura mínima de 44px (h-11). Tabelas com cabeçalho fixo e `max-h-[65vh]`.
- Tema claro/escuro via classe `dark` em `<html>`, salvo em `localStorage['belaways.theme']`.
