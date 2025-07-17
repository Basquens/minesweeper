# Minesweeper Game - Layout Guide

## 🌗 Temas Suportados
- **Dark Mode** (default): base na primeira imagem
- **Light Mode**: base na segunda imagem
- Ambos os modos compartilham a mesma estrutura de layout e controles

---

## 🎨 Paleta de Cores

### 🎯 Tema Azul (padrão no dark mode)
- Bloco aberto: `#5D91B3`
- Controle ativo: `#2D8FBA`

### 🌱 Tema Verde
- Bloco aberto: `#5EBB8F`
- Controle ativo: `#3BA66C`

### 🔥 Tema Vermelho
- Bloco aberto: `#D95D5D`
- Controle ativo: `#BA3F3F`

### 🍊 Tema Laranja
- Bloco aberto: `#D88A4D`
- Controle ativo: `#B86E2E`

### 🪻 Tema Roxo
- Bloco aberto: `#9D71C7`
- Controle ativo: `#805AD5`

---

## 🖥️ Light Mode

### 🔲 Bloco Fechado
- Cor de fundo: `#F0F0F0`
- Borda: sutil, `#DCDCDC`

### 🪖 Bloco com Bandeira
- Ícone: Bandeira cinza (`#888`)
- Fundo: igual ao bloco fechado (`#F0F0F0`)

### 🔳 Bloco Aberto
- Cor de fundo: `#FFFFFF`
- Número:
  - 1: `#5B9BD5` (azul claro)
  - 2: `#6BAE75` (verde suave)
  - 3: `#C75B5B` (vermelho claro)
  - 4: `#A881C3` (roxo pastel)
  - 5+: `#C48A4D` (laranja queimado)

### 💣 Bloco com mina acionada
- Fundo: `#E69595` (vermelho claro rosado)
- Cruz central: linhas finas, opacas

---

## 🌒 Dark Mode

### 🔲 Bloco Fechado
- Cor de fundo: `#2F3A49`
- Borda: tom mais escuro

### 🪖 Bloco com Bandeira
- Ícone: Bandeira preta
- Fundo: igual ao bloco fechado

### 🔳 Bloco Aberto
- Cor de fundo: `#5D91B3` (ou cor do tema)
- Número:
  - 1: `#63B3ED`
  - 2: `#68D391`
  - 3: `#F56565`
  - 4: `#B794F4`
  - 5+: `#ED8936`

---

## 🧭 Interface de Jogo

### 🕒 Topo
- Esquerda: Botão de voltar (ícone de seta ←)
- Centro:
  - Ícone de engrenagem (número de bandeiras colocadas)
  - Timer (`{minutos}M {segundos}S`) Ex.: `10M 50S`
- Direita: Ícone de paleta de cores para trocar o tema

### ⚙️ Rodapé
- Em uma caixa em formato de pilula, adicionar 2 botões redondos com:
  - Engrenagem à esquerda (configurações)
  - Bandeira à direita (modo de marcação)
- Cor do botão muda com o tema ativo
- Ícones centralizados, com proporção de ~60% do botão

---

## 🔧 Considerações Técnicas
- `display: grid` para o campo
- `gap: 2px` entre blocos
- Blocos com `width` e `height` fixos (~32px)
- Interface deve ser responsiva
- Suporte a toque e clique com transições suaves