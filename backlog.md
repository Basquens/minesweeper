# Features
1. Implementar GIT se ainda não está sendo usado e passar criar um branch para cada funcionaldiade, após a implementação da funcionalidade commitar e fazer o merge para a master. Se for uma correção de bug, criar uma branch como bug e incrementar a versão apenas como minor update
1. Alterar o layout para bater melhor com o esperado, utilizar o arquivo layout_guide.md como modelo
1. Adicionar uma opção para salvar o app como um app no celular que fique salvo como WPA
1. Mudar o relógio para mostrar os valores em minutos:segundos
1. Adicionar um toggle de Bomba / Bandeira em baixo do relógio que muda entre a opção primaria e secundaria
1. Adicionar vibração no final do long press da ação secundaria no celular
1. Registrar o histórico dos jogos anteriores, qual foi o tempo de conclusão e em qual data.
1. Usar a visualização na vertical como padrão
1. Adicionar uma tela de inicio que permite selecionar qual a dificuldade que será jogada
    1. Exibir uma preview do board que será gerado
    1. Em baixo do board, exibir o nome da dificuldade com uma seta em cada lado que permite ir para a próxima dificuldade ou para a anterior.
    1. Em cima deve mostrar a quantidade de bombas com o modelo: [icon de bomba] [número]
    1. No celular deve ser possível selecionar entre as dificuldades deslizando o dedo para os lados, deve haver uma seta do lado do nome 
    1. Essa tela deve ter um botão de acesso às configurações


# V2
1. Implementar marcação com ponto de interrogação (?) nos tiles
   - Adicionar um terceiro estado para os tiles além de bandeira e não marcado
   - Sequência de estados: Normal → Bandeira (🚩) → Ponto de interrogação (❓) → Normal
   - Para ativar o ponto de interrogação: usar ação secundária em um tile já com bandeira
   - Funcionalidade:
     - Tile normal + ação secundária = Bandeira
     - Tile com bandeira + ação secundária = Ponto de interrogação
     - Tile com ponto de interrogação + ação secundária = Normal
   - O ponto de interrogação serve para marcar tiles duvidosos
   - Tiles com ponto de interrogação podem ser revelados com ação primária
   - Não afeta o contador de minas restantes (apenas bandeiras fazem isso)
   - Salvar preferência nas configurações se o usuário quer usar ponto de interrogação
   - Adicionar nas instruções de jogo a explicação da funcionalidade

2. Implementar modo "No Guess" (sem adivinhação)
   - Garantir que todos os jogos gerados possam ser resolvidos usando apenas lógica
   - Algoritmo para validar se o tabuleiro gerado é solucionável sem adivinhação
   - Se o tabuleiro não for solucionável, regenerar automaticamente
   - Configuração opcional nas settings para ativar/desativar o modo "No Guess"
   - Indicador visual quando o modo está ativo (ex: ícone especial no header)
   - Funcionalidade:
     - Analisa todas as possibilidades lógicas antes de gerar o tabuleiro final
     - Usa algoritmos de satisfação de restrições (CSP) para validar
     - Garante que sempre há pelo menos uma jogada lógica disponível
     - Evita situações onde o jogador precisa "chutar" para continuar
   - Pode impactar ligeiramente o tempo de geração do jogo
   - Especialmente útil para jogadores que preferem puzzles puramente lógicos
   - Adicionar explicação nas instruções sobre o que é o modo "No Guess"

3. Atualizar tema visual para design minimalista
   - Redesenhar todos os botões para estilo minimalista
   - Botões devem seguir a cor do tema selecionado como cor primária
   - Remover bordas excessivas e usar design mais limpo
   - Funcionalidade:
     - Botões do header (voltar, configurações, tema) com design minimalista
     - Botões do footer (bomba, bandeira) com estilo mais sutil
     - Botões de configurações seguindo a mesma linguagem visual
     - Botões da tela inicial com design consistente
   - Adicionar transparência no menu superior (header)
     - Background do header com transparência (ex: rgba com alpha 0.85-0.95)
     - Efeito de glassmorphism sutil
     - Backdrop blur para melhor legibilidade
   - Manter acessibilidade e contraste adequados
   - Transições suaves entre estados (hover, active, focus)
   - Design responsivo que funciona bem em todas as telas
   - Temas escuro e claro devem ter tratamento adequado da transparência