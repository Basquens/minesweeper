# Features
1. ✅ Implementar GIT se ainda não está sendo usado e passar criar um branch para cada funcionaldiade, após a implementação da funcionalidade commitar e fazer o merge para a master. Se for uma correção de bug, criar uma branch como bug e incrementar a versão apenas como minor update
1. ✅ Alterar o layout para bater melhor com o esperado, utilizar o arquivo layout_guide.md como modelo
1. ✅ Adicionar uma opção para salvar o app como um app no celular que fique salvo como WPA
1. ✅ Mudar o relógio para mostrar os valores em minutos:segundos
1. ✅ Adicionar um toggle de Bomba / Bandeira em baixo do relógio que muda entre a opção primaria e secundaria
1. ✅ Adicionar vibração no final do long press da ação secundaria no celular
1. ✅ Registrar o histórico dos jogos anteriores, qual foi o tempo de conclusão e em qual data.
1. ✅ Usar a visualização na vertical como padrão
1. ✅ Adicionar uma tela de inicio que permite selecionar qual a dificuldade que será jogada
    1. ✅ Exibir uma preview do board que será gerado
    1. ✅ Em baixo do board, exibir o nome da dificuldade com uma seta em cada lado que permite ir para a próxima dificuldade ou para a anterior.
    1. ✅ Em cima deve mostrar a quantidade de bombas com o modelo: [icon de bomba] [número]
    1. ✅ No celular deve ser possível selecionar entre as dificuldades deslizando o dedo para os lados, deve haver uma seta do lado do nome 
    1. ✅ Essa tela deve ter um botão de acesso às configurações


# V2
1. ✅ Implementar marcação com ponto de interrogação (?) nos tiles
   - ✅ Adicionar um terceiro estado para os tiles além de bandeira e não marcado
   - ✅ Sequência de estados: Normal → Bandeira (🚩) → Ponto de interrogação (❓) → Normal
   - ✅ Para ativar o ponto de interrogação: usar ação secundária em um tile já com bandeira
   - ✅ Funcionalidade:
     - ✅ Tile normal + ação secundária = Bandeira
     - ✅ Tile com bandeira + ação secundária = Ponto de interrogação
     - ✅ Tile com ponto de interrogação + ação secundária = Normal
   - ✅ O ponto de interrogação serve para marcar tiles duvidosos
   - ✅ Tiles com ponto de interrogação podem ser revelados com ação primária
   - ✅ Não afeta o contador de minas restantes (apenas bandeiras fazem isso)
   - ✅ Salvar preferência nas configurações se o usuário quer usar ponto de interrogação
   - ✅ Adicionar nas instruções de jogo a explicação da funcionalidade

2. ✅ Implementar modo "No Guess" (sem adivinhação)
   - ✅ Garantir que todos os jogos gerados possam ser resolvidos usando apenas lógica
   - ✅ Algoritmo para validar se o tabuleiro gerado é solucionável sem adivinhação
   - ✅ Se o tabuleiro não for solucionável, regenerar automaticamente
   - ✅ Configuração opcional nas settings para ativar/desativar o modo "No Guess"
   - ✅ Indicador visual quando o modo está ativo (ex: ícone especial no header)
   - ✅ Funcionalidade:
     - ✅ Analisa todas as possibilidades lógicas antes de gerar o tabuleiro final
     - ✅ Usa algoritmos de satisfação de restrições (CSP) para validar
     - ✅ Garante que sempre há pelo menos uma jogada lógica disponível
     - ✅ Evita situações onde o jogador precisa "chutar" para continuar
   - ✅ Pode impactar ligeiramente o tempo de geração do jogo
   - ✅ Especialmente útil para jogadores que preferem puzzles puramente lógicos
   - ✅ Adicionar explicação nas instruções sobre o que é o modo "No Guess"

3. ✅ Atualizar tema visual para design minimalista
   - ✅ Redesenhar todos os botões para estilo minimalista
   - ✅ Botões devem seguir a cor do tema selecionado como cor primária
   - ✅ Remover bordas excessivas e usar design mais limpo
   - ✅ Funcionalidade:
     - ✅ Botões do header (voltar, configurações, tema) com design minimalista
     - ✅ Botões do footer (bomba, bandeira) com estilo mais sutil
     - ✅ Botões de configurações seguindo a mesma linguagem visual
     - ✅ Botões da tela inicial com design consistente
   - ✅ Adicionar transparência no menu superior (header)
     - ✅ Background do header com transparência (ex: rgba com alpha 0.85-0.95)
     - ✅ Efeito de glassmorphism sutil
     - ✅ Backdrop blur para melhor legibilidade
   - ✅ Manter acessibilidade e contraste adequados
   - ✅ Transições suaves entre estados (hover, active, focus)
   - ✅ Design responsivo que funciona bem em todas as telas
   - ✅ Temas escuro e claro devem ter tratamento adequado da transparência

4. ✅ Implementar funcionalidades de acessibilidade
   - ✅ Modo alto contraste para deficientes visuais
   - ✅ Suporte completo para leitores de tela
   - ✅ Navegação por teclado com indicadores visuais
   - ✅ Sons distintivos para diferentes ações
   - ✅ Funcionalidade:
     - ✅ Teclas de seta para navegar pelo tabuleiro
     - ✅ Enter para revelar, Espaço para bandeira
     - ✅ Anúncio por voz do conteúdo de cada tile
     - ✅ Descrição sonora das ações realizadas
     - ✅ Modo alto contraste com cores mais vibrantes
   - ✅ Configurações de acessibilidade:
     - ✅ Toggle para ativar/desativar cada funcionalidade
     - ✅ Ajuste de volume dos sons
     - ✅ Velocidade da narração
     - ✅ Escolha de voz (se disponível no sistema)
   - ✅ Compatibilidade:
     - ✅ Testar com NVDA, JAWS, VoiceOver
     - ✅ Seguir padrões WCAG 2.1
     - ✅ Atributos ARIA apropriados
     - ✅ Indicadores de foco visíveis

5. ✅ Corrigir bug do botão de voltar que não está funcionando
   - ✅ Implementar funcionalidade do botão "←" no header
   - ✅ O botão deve retornar à tela inicial de seleção de dificuldade
   - ✅ Garantir que funciona corretamente em todas as situações
   - ✅ Testar navegação entre telas
   - ✅ Verificar se o estado do jogo é preservado adequadamente

6. ✅ Garantir que o primeiro clique sempre seja em área vazia (sem minas e sem números)
   - ✅ O primeiro clique deve sempre abrir uma área clara
   - ✅ Nunca deve ser uma mina ou um número
   - ✅ Deve abrir uma região interessante para começar o jogo
   - ✅ Regenerar posicionamento de minas se necessário para garantir área vazia

7. ✅ Melhorar detecção de gestos no mobile para evitar ações acidentais
   - ✅ Distinguir entre movimentação/zoom e ações de jogo
   - ✅ Cancelar ação de revelar/bandeira se detectar movimento de drag
   - ✅ Cancelar ação se detectar pinch-to-zoom
   - ✅ Implementar threshold de movimento para evitar ativações acidentais
   - ✅ Melhorar responsividade do toque sem sacrificar precisão

# V3

1. Implementar timelapse do último jogo finalizado
   - Gravar todas as ações do jogador durante a partida
   - Armazenar sequência de movimentos com timestamps
   - Reproduzir o jogo completo em velocidade acelerada
   - Funcionalidade:
     - Capturar cada clique/toque com posição e tipo de ação
     - Salvar estado do tabuleiro após cada movimento
     - Gravar tempo decorrido de cada ação
     - Armazenar apenas o último jogo finalizado (vitória ou derrota)
   - Interface de reprodução:
     - Botão "Ver Timelapse" na tela de resultado do jogo
     - Controles de reprodução: play/pause, velocidade (1x, 2x, 4x, 8x)
     - Indicador de progresso da reprodução
     - Mostrar timer e contador de minas durante reprodução
   - Visualização:
     - Destacar o tile sendo clicado com animação
     - Mostrar tipo de ação (revelar, bandeira, etc.)
     - Transições suaves entre estados
     - Possibilidade de pausar em qualquer momento
   - Otimizações:
     - Comprimir dados de movimento para economizar espaço
     - Limitar armazenamento apenas ao último jogo
     - Reprodução eficiente sem recarregar página
   - Especialmente útil para analisar estratégias e aprender com erros
   - Funcionalidade opcional que pode ser desabilitada nas configurações

2. Implementar tabuleiro customizado
   - Permitir ao usuário definir dimensões e quantidade de bombas
   - Interface de configuração personalizada
   - Funcionalidade:
     - Sliders ou inputs para largura (5-50 tiles)
     - Sliders ou inputs para altura (5-50 tiles)
     - Slider ou input para quantidade de bombas
     - Validação automática: mínimo 1 bomba, máximo 80% dos tiles
     - Preview em tempo real das configurações
     - Cálculo automático da densidade de bombas (%)
   - Interface intuitiva:
     - Tela dedicada de "Tabuleiro Customizado" na seleção de dificuldade
     - Indicadores visuais da dificuldade estimada (Fácil/Médio/Difícil/Extremo)
     - Botão "Testar Configuração" para jogar uma partida de teste
     - Salvar configurações customizadas favoritas (até 5 presets)
     - Opção de nomear presets personalizados
   - Limitações técnicas:
     - Considerar performance em dispositivos móveis
     - Ajuste automático do tamanho dos tiles para telas pequenas
     - Limite máximo baseado na resolução da tela
     - Aviso quando configuração pode impactar performance
   - Integração com sistema existente:
     - Histórico separado para jogos customizados
     - Estatísticas específicas para cada preset customizado
     - Opção de exportar/importar configurações
   - Recursos adicionais:
     - Gerador de configuração aleatória
     - Sugestões de configurações populares
     - Calculadora de dificuldade baseada em densidade

3. Implementar sistema de seeds e análise avançada de jogos
   - Sistema de seeds para reproduzir jogos idênticos
   - Análise de eficiência de movimentos (modo assistente)
   - Análise post-mortem de jogos perdidos
   - Funcionalidade:
     - Gerar seed único para cada jogo
     - Exibir seed na tela de conclusão do jogo
     - Salvar seed no histórico de jogos
     - Opção de jogar com seed específico
     - Input para inserir seed personalizado
   - Análise de eficiência:
     - Contador de movimentos desnecessários
     - Indicador de eficiência (% de movimentos úteis)
     - Heatmap de cliques no tabuleiro
     - Tempo médio por jogada
     - Estatísticas de uso de bandeiras vs revelações
   - Análise post-mortem:
     - Analisar último jogo perdido
     - Identificar a bomba que causou a derrota
     - Mostrar qual era a melhor estratégia naquele momento
     - Destacar pistas que foram ignoradas
     - Sugerir padrões que poderiam ter sido aplicados
   - Integração com assistente:
     - Funcionalidade opcional (não afeta leaderboards)
     - Avisos quando análise está ativa
     - Opção de desativar para jogos competitivos

# V4

1. Implementar leaderboard global estilo arcade
   - Sistema de ranking com identificação de 3 letras
   - Leaderboard separado por dificuldade (Beginner, Intermediate, Expert)
   - Armazenar top 50 tempos para cada dificuldade
   - Funcionalidade:
     - Ao finalizar jogo com vitória, verificar se tempo entra no top 50
     - Se classificado, mostrar popup para inserir iniciais (3 letras)
     - Interface estilo arcade clássico para entrada de nome
     - Validação de caracteres (apenas letras A-Z)
     - Possibilidade de usar setas/teclado para selecionar letras
   - Interface do leaderboard:
     - Tela dedicada acessível pelo menu principal
     - Tabs para alternar entre dificuldades
     - Ranking numerado (#1, #2, #3, etc.)
     - Mostrar: posição, iniciais, tempo, data
     - Destacar entrada do jogador atual se estiver no ranking
     - Animação especial para top 3 posições
   - Persistência de dados:
     - Salvar leaderboard no localStorage
     - Opção de exportar/importar dados do leaderboard
     - Backup automático dos dados
   - Recursos especiais:
     - Animação de "NEW RECORD!" quando bater recorde
     - Som/vibração especial para novos recordes
     - Indicador visual quando jogador está próximo do seu recorde
     - Opção de resetar leaderboard nas configurações
   - Design nostálgico inspirado em arcades dos anos 80/90
   - Cores vibrantes e fonte pixelada para entrada de nome
   - Funcionalidade totalmente offline (sem servidor)

2. Implementar modo Tutorial/Ensino e assistente de padrões
   - Sistema de tutoriais interativos para iniciantes
   - Assistente de padrões com dicas contextuais
   - Modo de ensino que não afeta estatísticas
   - Funcionalidade:
     - Tutoriais passo-a-passo dos conceitos básicos
     - Explicação interativa dos números e padrões
     - Demonstração de técnicas avançadas (chording, etc.)
     - Lições sobre padrões comuns (1-2-1, cantos, bordas)
     - Quiz interativo ao final de cada lição
   - Assistente de padrões:
     - Detectar padrões conhecidos no tabuleiro atual
     - Destacar visualmente padrões encontrados
     - Sugerir próximas jogadas lógicas
     - Explicar o raciocínio por trás de cada sugestão
     - Modo "dica" que mostra apenas o próximo movimento
   - Restrições importantes:
     - Jogos com assistente ativo NÃO contam para leaderboards
     - Jogos com assistente NÃO contam para histórico de melhores tempos
     - Aviso claro quando assistente está ativo
     - Opção de desativar assistente durante o jogo
   - Interface dedicada:
     - Menu de tutoriais separado
     - Progresso de conclusão dos tutoriais
     - Biblioteca de padrões para consulta
     - Modo prática com diferentes cenários

# V5

1. Implementar sistema de conquistas
   - Sistema de badges e conquistas baseado em realizações
   - Conquistas variadas para diferentes estilos de jogo
   - Funcionalidade:
     - Rastreamento automático de estatísticas relevantes
     - Notificações quando conquistas são desbloqueadas
     - Galeria de conquistas com descrições
     - Indicador de progresso para conquistas incrementais
   - Tipos de conquistas:
     - Conquistas de quantidade (100 vitórias, 1000 jogos, etc.)
     - Conquistas de habilidade (ganhar sem usar bandeiras, etc.)
     - Conquistas de velocidade (terminar em menos de X segundos)
     - Conquistas de consistência (X vitórias seguidas)
     - Conquistas especiais (primeiro jogo, melhor tempo pessoal, etc.)
     - Conquistas de exploração (jogar todas as dificuldades)
   - Exemplos específicos:
     - "Primeira Vitória" - Complete seu primeiro jogo
     - "Velocista" - Complete beginner em menos de 30 segundos
     - "Sem Bandeiras" - Ganhe um jogo sem usar bandeiras
     - "Centenário" - Complete 100 jogos
     - "Streak Master" - Ganhe 10 jogos seguidos
     - "Especialista" - Ganhe em todas as dificuldades
     - "Perfeccionista" - Complete um jogo com 100% de eficiência
   - Não incluir sistema de progressão ou níveis de jogador
   - Foco apenas em marcos e realizações específicas