class MinesweeperGame {
    constructor() {
        this.board = [];
        this.mines = [];
        this.gameState = 'playing';
        this.firstMove = true;
        this.timer = 0;
        this.timerInterval = null;
        this.minesRemaining = 0;
        this.scale = 1;
        this.settings = {
            theme: 'light',
            primaryAction: 'reveal',
            holdDelay: 500,
            boardOrientation: 'vertical',
            colorTheme: 'blue',
            enableQuestionMarks: false,
            enableNoGuess: false,
            enableKeyboardNavigation: true,
            enableSounds: false,
            highContrast: false
        };
        
        this.themeMapping = {
            blue: { primary: '#5D91B3', tile: '#88d8ff' },
            green: { primary: '#5EBB8F', tile: '#a8e6cf' },
            red: { primary: '#D95D5D', tile: '#ffaaa5' },
            orange: { primary: '#D88A4D', tile: '#ffcc99' },
            purple: { primary: '#9D71C7', tile: '#dbb2ff' }
        };
        
        this.difficulties = {
            easy: { width: 10, height: 7, mines: 10 },
            medium: { width: 22, height: 12, mines: 40 },
            hard: { width: 32, height: 18, mines: 100 },
            huge: { width: 48, height: 27, mines: 220 },
            extreme: { width: 32, height: 18, mines: 150 }
        };
        
        this.currentDifficulty = 'easy';
        this.boardConfig = this.difficulties[this.currentDifficulty];
        
        this.gameHistory = {
            easy: [],
            medium: [],
            hard: [],
            huge: [],
            extreme: []
        };
        
        this.shouldShowStartScreen = true;
        this.deferredPrompt = null;
        
        // Acessibilidade - navegação por teclado
        this.keyboardNavigation = {
            enabled: true,
            currentX: 0,
            currentY: 0,
            focusVisible: false
        };
        
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.loadGameHistory();
        this.setupEventListeners();
        this.setupKeyboardNavigation();
        this.setupPWAInstallation();
        this.applyTheme();
        this.applyUnifiedTheme();
        
        if (this.shouldShowStartScreen) {
            this.displayStartScreen();
        } else {
            this.newGame();
        }
    }
    
    loadSettings() {
        const saved = localStorage.getItem('minesweeper-settings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
        this.applySettings();
    }
    
    saveSettings() {
        localStorage.setItem('minesweeper-settings', JSON.stringify(this.settings));
    }
    
    loadGameHistory() {
        const saved = localStorage.getItem('minesweeper-history');
        if (saved) {
            this.gameHistory = { ...this.gameHistory, ...JSON.parse(saved) };
        }
    }
    
    
    saveGameHistory() {
        localStorage.setItem('minesweeper-history', JSON.stringify(this.gameHistory));
    }
    
    addToHistory(difficulty, time, won) {
        const historyEntry = {
            time: time,
            won: won,
            date: new Date().toISOString(),
            difficulty: difficulty
        };
        
        if (!this.gameHistory[difficulty]) {
            this.gameHistory[difficulty] = [];
        }
        
        this.gameHistory[difficulty].push(historyEntry);
        
        this.gameHistory[difficulty].sort((a, b) => {
            if (a.won && !b.won) return -1;
            if (!a.won && b.won) return 1;
            if (a.won && b.won) return a.time - b.time;
            return 0;
        });
        
        this.gameHistory[difficulty] = this.gameHistory[difficulty].slice(0, 50);
        
        this.saveGameHistory();
    }
    
    getTopTimes(difficulty, limit = 10) {
        if (!this.gameHistory[difficulty]) return [];
        
        return this.gameHistory[difficulty]
            .filter(entry => entry.won)
            .slice(0, limit);
    }
    
    getStatistics(difficulty) {
        if (!this.gameHistory[difficulty]) {
            return {
                totalGames: 0,
                gamesWon: 0,
                winRate: 0,
                bestTime: null,
                averageTime: null
            };
        }
        
        const games = this.gameHistory[difficulty];
        const wonGames = games.filter(g => g.won);
        
        const stats = {
            totalGames: games.length,
            gamesWon: wonGames.length,
            winRate: games.length > 0 ? Math.round((wonGames.length / games.length) * 100) : 0,
            bestTime: wonGames.length > 0 ? wonGames[0].time : null,
            averageTime: wonGames.length > 0 ? Math.round(wonGames.reduce((sum, g) => sum + g.time, 0) / wonGames.length) : null
        };
        
        return stats;
    }
    
    applySettings() {
        document.querySelector(`input[name="theme"][value="${this.settings.theme}"]`).checked = true;
        document.querySelector(`input[name="primary-action"][value="${this.settings.primaryAction}"]`).checked = true;
        document.querySelector(`input[name="board-orientation"][value="${this.settings.boardOrientation}"]`).checked = true;
        document.querySelector(`input[name="color-theme"][value="${this.settings.colorTheme}"]`).checked = true;
        document.getElementById('enable-question-marks').checked = this.settings.enableQuestionMarks;
        document.getElementById('enable-no-guess').checked = this.settings.enableNoGuess;
        document.getElementById('enable-keyboard-nav').checked = this.settings.enableKeyboardNavigation;
        document.getElementById('enable-sounds').checked = this.settings.enableSounds;
        document.getElementById('high-contrast').checked = this.settings.highContrast;
        document.getElementById('hold-delay').value = this.settings.holdDelay;
        document.getElementById('delay-value').textContent = this.settings.holdDelay;
        
        this.keyboardNavigation.enabled = this.settings.enableKeyboardNavigation;
        this.applyUnifiedTheme();
        this.applyBoardOrientation();
        this.updateActionButtons();
        this.applyHighContrast();
    }
    
    applyHighContrast() {
        if (this.settings.highContrast) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
    }
    
    applyTheme() {
        document.body.setAttribute('data-theme', this.settings.theme);
        const themeColor = this.settings.theme === 'dark' ? '#000000' : '#ffffff';
        document.querySelector('meta[name="theme-color"]').setAttribute('content', themeColor);
    }
    
    applyUnifiedTheme() {
        const theme = this.themeMapping[this.settings.colorTheme];
        if (theme) {
            document.documentElement.style.setProperty('--selected-tile-color', theme.tile);
        }
        
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${this.settings.colorTheme}`);
    }
    
    applyBoardOrientation() {
        this.renderBoard();
    }
    
    updateActionButtons() {
        const revealBtn = document.getElementById('reveal-btn');
        const flagBtn = document.getElementById('flag-btn');
        
        // Remover classe active de ambos os botões
        revealBtn.classList.remove('active');
        flagBtn.classList.remove('active');
        
        // Adicionar classe active ao botão da ação primária
        if (this.settings.primaryAction === 'flag') {
            flagBtn.classList.add('active');
            revealBtn.title = 'Revelar (secundário - segurar)';
            flagBtn.title = 'Bandeira (primário - tocar)';
        } else {
            revealBtn.classList.add('active');
            revealBtn.title = 'Revelar (primário - tocar)';
            flagBtn.title = 'Bandeira (secundário - segurar)';
        }
        
        // Atualizar também o input correspondente nas configurações
        const primaryActionInputs = document.querySelectorAll('input[name="primary-action"]');
        primaryActionInputs.forEach(input => {
            if (input.value === this.settings.primaryAction) {
                input.checked = true;
            }
        });
    }
    
    triggerVibration() {
        if (navigator.vibrate) {
            // 50ms vibration with medium intensity
            navigator.vibrate(50);
        }
    }
    
    playSound(type) {
        if (!this.settings.enableSounds) return;
        
        // Criar contexto de áudio se não existir
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                return; // Áudio não suportado
            }
        }
        
        // Se contexto estiver suspenso, tentar reativar
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Configurar som baseado no tipo
        switch (type) {
            case 'reveal':
                oscillator.frequency.setValueAtTime(800, now);
                oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.1);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                oscillator.stop(now + 0.1);
                break;
            case 'flag':
                oscillator.frequency.setValueAtTime(1000, now);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                oscillator.stop(now + 0.05);
                break;
            case 'mine':
                oscillator.frequency.setValueAtTime(200, now);
                oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.5);
                gainNode.gain.setValueAtTime(0.2, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                oscillator.stop(now + 0.5);
                break;
            case 'win':
                // Som de vitória com frequências ascendentes
                oscillator.frequency.setValueAtTime(523, now); // C5
                oscillator.frequency.setValueAtTime(659, now + 0.1); // E5
                oscillator.frequency.setValueAtTime(784, now + 0.2); // G5
                oscillator.frequency.setValueAtTime(1047, now + 0.3); // C6
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                oscillator.stop(now + 0.4);
                break;
            case 'move':
                oscillator.frequency.setValueAtTime(400, now);
                gainNode.gain.setValueAtTime(0.05, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
                oscillator.stop(now + 0.03);
                break;
        }
        
        oscillator.start(now);
    }
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (!this.keyboardNavigation.enabled || this.shouldShowStartScreen || this.gameState !== 'playing') {
                return;
            }
            
            const { currentX, currentY } = this.keyboardNavigation;
            const width = this.actualWidth;
            const height = this.actualHeight;
            
            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    if (currentY > 0) {
                        this.keyboardNavigation.currentY--;
                        this.updateKeyboardFocus();
                        this.playSound('move');
                    }
                    break;
                    
                case 'ArrowDown':
                    e.preventDefault();
                    if (currentY < height - 1) {
                        this.keyboardNavigation.currentY++;
                        this.updateKeyboardFocus();
                        this.playSound('move');
                    }
                    break;
                    
                case 'ArrowLeft':
                    e.preventDefault();
                    if (currentX > 0) {
                        this.keyboardNavigation.currentX--;
                        this.updateKeyboardFocus();
                        this.playSound('move');
                    }
                    break;
                    
                case 'ArrowRight':
                    e.preventDefault();
                    if (currentX < width - 1) {
                        this.keyboardNavigation.currentX++;
                        this.updateKeyboardFocus();
                        this.playSound('move');
                    }
                    break;
                    
                case 'Enter':
                    e.preventDefault();
                    this.revealTile(currentX, currentY);
                    break;
                    
                case ' ':
                    e.preventDefault();
                    this.toggleFlag(currentX, currentY);
                    break;
                    
                case 'Escape':
                    e.preventDefault();
                    this.keyboardNavigation.focusVisible = false;
                    this.updateKeyboardFocus();
                    break;
            }
        });
        
        // Mostrar foco quando usar teclado
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                this.keyboardNavigation.focusVisible = true;
                this.updateKeyboardFocus();
            }
        });
        
        // Esconder foco quando usar mouse
        document.addEventListener('mousedown', () => {
            this.keyboardNavigation.focusVisible = false;
            this.updateKeyboardFocus();
        });
    }
    
    updateKeyboardFocus() {
        // Remover foco anterior
        document.querySelectorAll('.tile.keyboard-focus').forEach(tile => {
            tile.classList.remove('keyboard-focus');
        });
        
        if (this.keyboardNavigation.focusVisible) {
            const { currentX, currentY } = this.keyboardNavigation;
            const tile = document.querySelector(`[data-x="${currentX}"][data-y="${currentY}"]`);
            if (tile) {
                tile.classList.add('keyboard-focus');
            }
        }
    }

    setupEventListeners() {
        document.getElementById('new-game-btn').addEventListener('click', () => this.newGame());
        document.getElementById('difficulty-select').addEventListener('change', (e) => this.changeDifficulty(e.target.value));
        document.getElementById('settings-btn').addEventListener('click', () => this.openSettings());
        document.getElementById('close-settings').addEventListener('click', () => this.closeSettings());
        document.getElementById('play-again-btn').addEventListener('click', () => this.newGame());
        document.getElementById('view-board-btn').addEventListener('click', () => this.hideOverlay());
        document.getElementById('back-btn').addEventListener('click', () => this.showStartScreen());
        document.getElementById('settings-start-btn').addEventListener('click', () => this.openSettings());
        
        document.querySelectorAll('.difficulty-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const difficulty = e.currentTarget.dataset.difficulty;
                this.startNewGame(difficulty);
            });
        });
        
        document.querySelectorAll('input[name="theme"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.settings.theme = e.target.value;
                this.applyTheme();
                this.saveSettings();
            });
        });
        
        document.querySelectorAll('input[name="primary-action"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.settings.primaryAction = e.target.value;
                this.updateActionButtons();
                this.saveSettings();
            });
        });
        
        document.getElementById('hold-delay').addEventListener('input', (e) => {
            this.settings.holdDelay = parseInt(e.target.value);
            document.getElementById('delay-value').textContent = this.settings.holdDelay;
            this.saveSettings();
        });
        
        document.querySelectorAll('input[name="board-orientation"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.settings.boardOrientation = e.target.value;
                this.applyBoardOrientation();
                this.saveSettings();
            });
        });
        
        document.querySelectorAll('input[name="color-theme"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.settings.colorTheme = e.target.value;
                this.applyUnifiedTheme();
                this.saveSettings();
            });
        });
        
        document.getElementById('enable-question-marks').addEventListener('change', (e) => {
            this.settings.enableQuestionMarks = e.target.checked;
            this.saveSettings();
        });
        
        document.getElementById('enable-no-guess').addEventListener('change', (e) => {
            this.settings.enableNoGuess = e.target.checked;
            this.saveSettings();
        });
        
        document.getElementById('enable-keyboard-nav').addEventListener('change', (e) => {
            this.settings.enableKeyboardNavigation = e.target.checked;
            this.keyboardNavigation.enabled = e.target.checked;
            this.saveSettings();
        });
        
        document.getElementById('enable-sounds').addEventListener('change', (e) => {
            this.settings.enableSounds = e.target.checked;
            this.saveSettings();
        });
        
        document.getElementById('high-contrast').addEventListener('change', (e) => {
            this.settings.highContrast = e.target.checked;
            this.saveSettings();
            this.applyHighContrast();
        });
        
        document.getElementById('reveal-btn').addEventListener('click', () => {
            this.settings.primaryAction = 'reveal';
            this.updateActionButtons();
            this.saveSettings();
        });
        
        document.getElementById('flag-btn').addEventListener('click', () => {
            this.settings.primaryAction = 'flag';
            this.updateActionButtons();
            this.saveSettings();
        });
        
        document.getElementById('theme-btn').addEventListener('click', () => {
            this.settings.theme = this.settings.theme === 'light' ? 'dark' : 'light';
            this.applyTheme();
            this.saveSettings();
        });
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.updateHistoryDisplay(e.target.dataset.difficulty);
            });
        });
        
        document.getElementById('clear-history-btn').addEventListener('click', () => {
            const difficulty = document.querySelector('.tab-btn.active').dataset.difficulty;
            if (confirm(`Clear all ${difficulty} game history?`)) {
                this.gameHistory[difficulty] = [];
                this.saveGameHistory();
                this.updateHistoryDisplay(difficulty);
            }
        });

        document.getElementById('clear-cache-btn').addEventListener('click', () => {
            this.clearCacheAndReload();
        });
        
        this.setupZoomControls();
    }
    
    setupPWAInstallation() {
        const installBtn = document.getElementById('install-pwa-btn');
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            installBtn.classList.remove('hidden');
        });
        
        installBtn.addEventListener('click', async () => {
            if (!this.deferredPrompt) {
                return;
            }
            
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('PWA installed');
            }
            
            this.deferredPrompt = null;
            installBtn.classList.add('hidden');
        });
        
        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            installBtn.classList.add('hidden');
        });
        
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('Running as installed PWA');
            installBtn.classList.add('hidden');
        }
    }
    
    setupZoomControls() {
        const boardContainer = document.querySelector('.game-board-container');
        const gameMain = document.querySelector('.game-main');
        let isDragging = false;
        let startX, startY, startTranslateX = 0, startTranslateY = 0;
        let translateX = 0, translateY = 0;
        let dragStartTime = 0;
        let hasMoved = false;
        
        boardContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            this.scale = Math.max(0.5, Math.min(3, this.scale + delta));
            this.updateTransform();
        });
        
        const handleMouseDown = (e) => {
            if (e.button === 0) {
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                startTranslateX = translateX;
                startTranslateY = translateY;
                dragStartTime = Date.now();
                hasMoved = false;
                gameMain.style.cursor = 'grabbing';
                e.preventDefault();
            }
        };
        
        boardContainer.addEventListener('mousedown', handleMouseDown);
        gameMain.addEventListener('mousedown', handleMouseDown);
        
        const handleMouseMove = (e) => {
            if (isDragging) {
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                
                if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
                    hasMoved = true;
                    translateX = startTranslateX + deltaX;
                    translateY = startTranslateY + deltaY;
                    this.updateTransform();
                }
            }
        };
        
        boardContainer.addEventListener('mousemove', handleMouseMove);
        gameMain.addEventListener('mousemove', handleMouseMove);
        
        const handleMouseUp = (e) => {
            if (isDragging) {
                isDragging = false;
                gameMain.style.cursor = 'grab';
                
                if (!hasMoved && Date.now() - dragStartTime < 200) {
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
            }
        };
        
        boardContainer.addEventListener('mouseup', handleMouseUp);
        gameMain.addEventListener('mouseup', handleMouseUp);
        
        const handleMouseLeave = (e) => {
            if (isDragging) {
                isDragging = false;
                gameMain.style.cursor = 'grab';
            }
        };
        
        boardContainer.addEventListener('mouseleave', handleMouseLeave);
        gameMain.addEventListener('mouseleave', handleMouseLeave);
        
        gameMain.style.cursor = 'grab';
        
        let touches = {};
        let lastDistance = 0;
        
        boardContainer.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                lastDistance = Math.sqrt(
                    Math.pow(touch2.clientX - touch1.clientX, 2) +
                    Math.pow(touch2.clientY - touch1.clientY, 2)
                );
            } else if (e.touches.length === 1) {
                isDragging = true;
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                startTranslateX = translateX;
                startTranslateY = translateY;
                dragStartTime = Date.now();
                hasMoved = false;
            }
        });
        
        boardContainer.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const distance = Math.sqrt(
                    Math.pow(touch2.clientX - touch1.clientX, 2) +
                    Math.pow(touch2.clientY - touch1.clientY, 2)
                );
                
                if (lastDistance > 0) {
                    const deltaScale = (distance - lastDistance) * 0.01;
                    this.scale = Math.max(0.5, Math.min(3, this.scale + deltaScale));
                    this.updateTransform();
                }
                lastDistance = distance;
            } else if (e.touches.length === 1 && isDragging) {
                const deltaX = e.touches[0].clientX - startX;
                const deltaY = e.touches[0].clientY - startY;
                
                if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
                    hasMoved = true;
                    e.preventDefault();
                    translateX = startTranslateX + deltaX;
                    translateY = startTranslateY + deltaY;
                    this.updateTransform();
                }
            }
        });
        
        boardContainer.addEventListener('touchend', (e) => {
            if (e.touches.length === 0) {
                isDragging = false;
                lastDistance = 0;
                hasMoved = false;
            }
        });
        
        this.updateTransform = () => {
            boardContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${this.scale})`;
        };
    }
    
    changeDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        this.boardConfig = this.difficulties[difficulty];
        this.newGame();
    }
    
    newGame() {
        this.gameState = 'playing';
        this.firstMove = true;
        this.timer = 0;
        this.minesRemaining = this.boardConfig.mines;
        this.clearTimer();
        this.updateDisplay();
        this.generateBoard();
        this.hideOverlay();
        
        // Inicializar navegação por teclado no centro
        this.keyboardNavigation.currentX = Math.floor(this.actualWidth / 2);
        this.keyboardNavigation.currentY = Math.floor(this.actualHeight / 2);
        this.keyboardNavigation.focusVisible = false;
        
        document.getElementById('difficulty-select').value = this.currentDifficulty;
    }
    
    generateBoard() {
        let { width, height } = this.boardConfig;
        
        // Apply orientation to internal board structure
        if (this.settings.boardOrientation === 'horizontal') {
            if (height > width) {
                [width, height] = [height, width];
            }
        } else if (this.settings.boardOrientation === 'vertical') {
            if (width > height) {
                [width, height] = [height, width];
            }
        }
        
        // Store the actual dimensions being used
        this.actualWidth = width;
        this.actualHeight = height;
        
        this.board = Array(height).fill().map(() => Array(width).fill().map(() => ({
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            isQuestioned: false,
            neighborMines: 0
        })));
        
        this.renderBoard();
    }
    
    placeMines(excludeX, excludeY) {
        const width = this.actualWidth;
        const height = this.actualHeight;
        const mines = this.boardConfig.mines;
        
        // console.log('=== PLACING MINES ===');
        // console.log('No Guess mode enabled:', this.settings.enableNoGuess);
        // console.log('Excluding position:', excludeX, excludeY);
        
        // Se modo No Guess está ativo, tentar várias vezes até encontrar um layout válido
        let maxAttempts = this.settings.enableNoGuess ? 100 : 1;
        let validLayout = false;
        
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            if (attempt % 10 === 0) console.log('Attempt', attempt + 1, 'of', maxAttempts);
            
            // Resetar o tabuleiro
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    this.board[y][x].isMine = false;
                }
            }
            
            // Colocar minas aleatoriamente
            this.placeRandomMines(excludeX, excludeY, width, height, mines);
            this.calculateNeighborMines();
            
            // Se No Guess não está ativo ou o layout é válido, aceitar
            if (!this.settings.enableNoGuess || this.validateNoGuessLayout()) {
                validLayout = true;
                console.log('Valid layout found on attempt', attempt + 1);
                break;
            } else {
                console.log('Layout rejected, trying again...');
            }
        }
        
        // Se não conseguiu encontrar um layout válido, usar o último gerado
        if (!validLayout && this.settings.enableNoGuess) {
            console.warn('Could not generate a No-Guess layout after', maxAttempts, 'attempts. Using random layout.');
        }
        
        // console.log('=== MINES PLACED ===');
        
        // Mostrar/esconder indicador
        this.updateNoGuessIndicator();
    }
    
    placeRandomMines(excludeX, excludeY, width, height, mines) {
        const positions = [];
        
        // Se modo No Guess está ativo, excluir uma área maior ao redor do primeiro clique
        const excludeRadius = this.settings.enableNoGuess ? 2 : 0;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Verificar se está na área excluída
                const distance = Math.max(Math.abs(x - excludeX), Math.abs(y - excludeY));
                if (distance > excludeRadius) {
                    positions.push({ x, y });
                }
            }
        }
        
        for (let i = 0; i < mines; i++) {
            const randomIndex = Math.floor(Math.random() * positions.length);
            const { x, y } = positions.splice(randomIndex, 1)[0];
            this.board[y][x].isMine = true;
        }
    }
    
    updateNoGuessIndicator() {
        const indicator = document.getElementById('no-guess-indicator');
        if (this.settings.enableNoGuess) {
            indicator.classList.remove('hidden');
            indicator.title = 'No Guess mode active - Solvable using logic only';
        } else {
            indicator.classList.add('hidden');
        }
    }
    
    validateNoGuessLayout() {
        // Implementação básica de validação No-Guess
        // Esta é uma versão simplificada que verifica padrões básicos
        const width = this.actualWidth;
        const height = this.actualHeight;
        
        console.log('=== VALIDATING NO GUESS LAYOUT ===');
        console.log('Board dimensions:', width, 'x', height);
        
        // Simular o processo de solução usando apenas lógica básica
        const testBoard = this.createTestBoard();
        const revealed = Array(height).fill().map(() => Array(width).fill(false));
        const flagged = Array(height).fill().map(() => Array(width).fill(false));
        
        // Tentar múltiplas posições para o primeiro clique
        const testPositions = [
            { x: Math.floor(width / 2), y: Math.floor(height / 2) }, // Centro
            { x: Math.floor(width / 3), y: Math.floor(height / 3) }, // Canto superior esquerdo interno
            { x: Math.floor(2 * width / 3), y: Math.floor(height / 3) }, // Canto superior direito interno
            { x: Math.floor(width / 3), y: Math.floor(2 * height / 3) }, // Canto inferior esquerdo interno
            { x: Math.floor(2 * width / 3), y: Math.floor(2 * height / 3) } // Canto inferior direito interno
        ];
        
        let bestPosition = null;
        let maxRevealed = 0;
        
        for (const pos of testPositions) {
            const testRevealed = Array(height).fill().map(() => Array(width).fill(false));
            if (this.simulateFirstClick(pos.x, pos.y, testBoard, testRevealed)) {
                let revealedCount = 0;
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        if (testRevealed[y][x]) revealedCount++;
                    }
                }
                if (revealedCount > maxRevealed) {
                    maxRevealed = revealedCount;
                    bestPosition = pos;
                    // Copiar o melhor resultado para o array principal
                    for (let y = 0; y < height; y++) {
                        for (let x = 0; x < width; x++) {
                            revealed[y][x] = testRevealed[y][x];
                        }
                    }
                }
            }
        }
        
        console.log('Best first click position:', bestPosition);
        console.log('Cells revealed by best first click:', maxRevealed);
        
        // Começar com o primeiro clique (não há mina no primeiro clique)
        let hasProgress = true;
        let iterations = 0;
        const maxIterations = width * height * 2;
        
        while (hasProgress && iterations < maxIterations) {
            hasProgress = false;
            iterations++;
            
            // Aplicar regras básicas de Minesweeper
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    if (revealed[y][x] && testBoard[y][x] > 0) {
                        hasProgress = this.applyBasicRules(x, y, testBoard, revealed, flagged) || hasProgress;
                    }
                }
            }
        }
        
        // Verificar se conseguimos revelar todas as células não-mina
        let totalRevealed = 0;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (revealed[y][x]) totalRevealed++;
            }
        }
        
        const totalSafeCells = width * height - this.boardConfig.mines;
        
        // Critério mais flexível baseado no tamanho do tabuleiro
        let requiredPercentage = 0.3; // 30% base
        if (totalSafeCells < 50) requiredPercentage = 0.5; // Tabuleiros pequenos: 50%
        else if (totalSafeCells < 200) requiredPercentage = 0.4; // Tabuleiros médios: 40%
        
        const requiredRevealed = Math.max(10, Math.floor(totalSafeCells * requiredPercentage));
        const isValid = totalRevealed >= requiredRevealed;
        
        console.log('Total safe cells:', totalSafeCells);
        console.log('Cells revealed by simulation:', totalRevealed);
        console.log('Required to pass (' + (requiredPercentage * 100) + '%):', requiredRevealed);
        console.log('Layout is valid:', isValid);
        console.log('=== END VALIDATION ===');
        
        return isValid;
    }
    
    createTestBoard() {
        const width = this.actualWidth;
        const height = this.actualHeight;
        const testBoard = Array(height).fill().map(() => Array(width).fill(0));
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (this.board[y][x].isMine) {
                    testBoard[y][x] = -1; // -1 representa mina
                } else {
                    testBoard[y][x] = this.board[y][x].neighborMines;
                }
            }
        }
        
        return testBoard;
    }
    
    simulateFirstClick(x, y, testBoard, revealed) {
        const width = this.actualWidth;
        const height = this.actualHeight;
        
        console.log('simulateFirstClick called at:', x, y);
        console.log('Cell value:', testBoard[y][x]);
        
        // Se a célula tem mina, não é um layout válido para No Guess
        if (testBoard[y][x] === -1) {
            console.log('REJECTED: First click would hit a mine!');
            return false;
        }
        
        // Revelar a célula clicada
        revealed[y][x] = true;
        console.log('Revealed center cell');
        
        // Se tem valor 0, fazer flood fill
        if (testBoard[y][x] === 0) {
            console.log('Starting flood fill from center (value 0)');
            this.floodFillSimulation(x, y, testBoard, revealed);
        } else {
            console.log('No flood fill needed, center has value:', testBoard[y][x]);
        }
        
        // Contar quantas células foram reveladas pelo primeiro clique
        let revealedCount = 0;
        for (let yy = 0; yy < height; yy++) {
            for (let xx = 0; xx < width; xx++) {
                if (revealed[yy][xx]) revealedCount++;
            }
        }
        console.log('Cells revealed by first click:', revealedCount);
        
        return true;
    }
    
    floodFillSimulation(x, y, testBoard, revealed) {
        const width = this.actualWidth;
        const height = this.actualHeight;
        
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                
                if (nx >= 0 && nx < width && ny >= 0 && ny < height && !revealed[ny][nx]) {
                    if (testBoard[ny][nx] !== -1) { // Não é mina
                        revealed[ny][nx] = true;
                        
                        // Se também é 0, continuar flood fill
                        if (testBoard[ny][nx] === 0) {
                            this.floodFillSimulation(nx, ny, testBoard, revealed);
                        }
                    }
                }
            }
        }
    }
    
    applyBasicRules(x, y, testBoard, revealed, flagged) {
        const width = this.actualWidth;
        const height = this.actualHeight;
        const cellValue = testBoard[y][x];
        let progress = false;
        
        if (cellValue <= 0) return false;
        
        // Contar vizinhos flaggados e não revelados
        let flaggedNeighbors = 0;
        let unrevealedNeighbors = [];
        
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                
                const nx = x + dx;
                const ny = y + dy;
                
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    if (flagged[ny][nx]) {
                        flaggedNeighbors++;
                    } else if (!revealed[ny][nx]) {
                        unrevealedNeighbors.push({ x: nx, y: ny });
                    }
                }
            }
        }
        
        // Regra 1: Se número de bandeiras = valor da célula, revelar resto
        if (flaggedNeighbors === cellValue) {
            for (const neighbor of unrevealedNeighbors) {
                if (!flagged[neighbor.y][neighbor.x]) {
                    revealed[neighbor.y][neighbor.x] = true;
                    progress = true;
                }
            }
        }
        
        // Regra 2: Se não revelados + flaggados = valor, flaggar todos não revelados
        if (flaggedNeighbors + unrevealedNeighbors.length === cellValue) {
            for (const neighbor of unrevealedNeighbors) {
                if (!flagged[neighbor.y][neighbor.x]) {
                    flagged[neighbor.y][neighbor.x] = true;
                    progress = true;
                }
            }
        }
        
        return progress;
    }
    
    
    calculateNeighborMines() {
        const width = this.actualWidth;
        const height = this.actualHeight;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (!this.board[y][x].isMine) {
                    let count = 0;
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            const ny = y + dy;
                            const nx = x + dx;
                            if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                                if (this.board[ny][nx].isMine) count++;
                            }
                        }
                    }
                    this.board[y][x].neighborMines = count;
                }
            }
        }
    }
    
    renderBoard() {
        const width = this.actualWidth;
        const height = this.actualHeight;
        const gameBoard = document.getElementById('game-board');
        
        gameBoard.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
        gameBoard.innerHTML = '';
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.dataset.x = x;
                tile.dataset.y = y;
                
                this.setupTileEvents(tile);
                gameBoard.appendChild(tile);
            }
        }
    }
    
    setupTileEvents(tile) {
        const x = parseInt(tile.dataset.x);
        const y = parseInt(tile.dataset.y);
        
        let holdTimeout;
        let isHolding = false;
        
        const handlePrimaryAction = () => {
            if (this.gameState !== 'playing') return;
            
            const cell = this.board[y][x];
            if (cell.isRevealed && cell.neighborMines > 0) {
                this.chordClick(x, y);
            } else if (this.settings.primaryAction === 'reveal') {
                this.revealTile(x, y);
            } else {
                this.toggleFlag(x, y);
            }
        };
        
        const handleSecondaryAction = () => {
            if (this.gameState !== 'playing') return;
            
            if (this.settings.primaryAction === 'reveal') {
                this.toggleFlag(x, y);
            } else {
                this.revealTile(x, y);
            }
        };
        
        tile.addEventListener('click', (e) => {
            e.preventDefault();
            if (!isHolding) {
                handlePrimaryAction();
            }
        });
        
        tile.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            handleSecondaryAction();
        });
        
        // Melhor detecção de gestos mobile
        let touchStartPos = null;
        let touchStartTime = null;
        const MOVEMENT_THRESHOLD = 10; // pixels
        const TAP_TIME_THRESHOLD = 300; // ms
        
        tile.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                touchStartPos = { x: touch.clientX, y: touch.clientY };
                touchStartTime = Date.now();
                isHolding = false;
                
                holdTimeout = setTimeout(() => {
                    if (touchStartPos) { // Ainda tocando
                        isHolding = true;
                        handleSecondaryAction();
                        this.triggerVibration();
                    }
                }, this.settings.holdDelay);
            } else {
                // Multi-touch detectado - cancelar ação
                clearTimeout(holdTimeout);
                touchStartPos = null;
                isHolding = false;
            }
        });
        
        tile.addEventListener('touchmove', (e) => {
            if (touchStartPos && e.touches.length === 1) {
                const touch = e.touches[0];
                const deltaX = Math.abs(touch.clientX - touchStartPos.x);
                const deltaY = Math.abs(touch.clientY - touchStartPos.y);
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                
                // Se movimento exceder threshold, cancelar ação
                if (distance > MOVEMENT_THRESHOLD) {
                    clearTimeout(holdTimeout);
                    touchStartPos = null;
                    isHolding = false;
                }
            } else {
                // Multi-touch ou perda de referência - cancelar
                clearTimeout(holdTimeout);
                touchStartPos = null;
                isHolding = false;
            }
        });
        
        tile.addEventListener('touchend', (e) => {
            e.preventDefault();
            clearTimeout(holdTimeout);
            
            if (touchStartPos && !isHolding && e.touches.length === 0) {
                const touchEndTime = Date.now();
                const touchDuration = touchEndTime - touchStartTime;
                
                // Verificar se foi um tap rápido
                if (touchDuration <= TAP_TIME_THRESHOLD) {
                    handlePrimaryAction();
                }
            }
            
            touchStartPos = null;
            isHolding = false;
        });
        
        tile.addEventListener('touchcancel', (e) => {
            clearTimeout(holdTimeout);
            touchStartPos = null;
            isHolding = false;
        });
    }
    
    revealTile(x, y) {
        const cell = this.board[y][x];
        
        if (cell.isRevealed || cell.isFlagged) return;
        
        if (this.firstMove) {
            this.placeMines(x, y);
            this.firstMove = false;
            this.startTimer();
        }
        
        if (cell.isMine) {
            this.playSound('mine');
            this.gameOver(false);
            return;
        }
        
        cell.isRevealed = true;
        this.updateTile(x, y);
        this.playSound('reveal');
        
        if (cell.neighborMines === 0) {
            this.floodFill(x, y);
        }
        
        this.checkWin();
    }
    
    floodFill(x, y) {
        const width = this.actualWidth;
        const height = this.actualHeight;
        
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    const neighbor = this.board[ny][nx];
                    if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.isMine) {
                        neighbor.isRevealed = true;
                        this.updateTile(nx, ny);
                        
                        if (neighbor.neighborMines === 0) {
                            this.floodFill(nx, ny);
                        }
                    }
                }
            }
        }
    }
    
    toggleFlag(x, y) {
        const cell = this.board[y][x];
        
        if (cell.isRevealed) return;
        
        if (this.settings.enableQuestionMarks) {
            // Sistema de 3 estados: Normal → Bandeira → Ponto de Interrogação → Normal
            if (!cell.isFlagged && !cell.isQuestioned) {
                // Normal → Bandeira
                cell.isFlagged = true;
                this.minesRemaining--;
            } else if (cell.isFlagged && !cell.isQuestioned) {
                // Bandeira → Ponto de Interrogação
                cell.isFlagged = false;
                cell.isQuestioned = true;
                this.minesRemaining++;
            } else if (!cell.isFlagged && cell.isQuestioned) {
                // Ponto de Interrogação → Normal
                cell.isQuestioned = false;
            }
        } else {
            // Sistema de 2 estados tradicional: Normal ↔ Bandeira
            cell.isFlagged = !cell.isFlagged;
            this.minesRemaining += cell.isFlagged ? -1 : 1;
        }
        
        this.updateTile(x, y);
        this.updateDisplay();
        this.playSound('flag');
    }
    
    chordClick(x, y) {
        const cell = this.board[y][x];
        const width = this.actualWidth;
        const height = this.actualHeight;
        
        if (!cell.isRevealed || cell.neighborMines === 0) return;
        
        let flagCount = 0;
        let unrevealedCount = 0;
        const neighbors = [];
        const unrevealedNeighbors = [];
        
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                
                const nx = x + dx;
                const ny = y + dy;
                
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    const neighbor = this.board[ny][nx];
                    neighbors.push({ x: nx, y: ny, cell: neighbor });
                    
                    if (neighbor.isFlagged) {
                        flagCount++;
                    } else if (!neighbor.isRevealed) {
                        unrevealedCount++;
                        unrevealedNeighbors.push({ x: nx, y: ny, cell: neighbor });
                    }
                }
            }
        }
        
        if (flagCount === cell.neighborMines && unrevealedCount > 0) {
            let hitMine = false;
            
            for (const neighbor of unrevealedNeighbors) {
                const { x: nx, y: ny, cell: neighborCell } = neighbor;
                
                if (neighborCell.isMine) {
                    hitMine = true;
                    this.gameOver(false);
                    break;
                } else {
                    neighborCell.isRevealed = true;
                    this.updateTile(nx, ny);
                    
                    if (neighborCell.neighborMines === 0) {
                        this.floodFill(nx, ny);
                    }
                }
            }
            
            if (!hitMine) {
                this.checkWin();
            }
        } else if (unrevealedCount === cell.neighborMines - flagCount && unrevealedCount > 0) {
            for (const neighbor of unrevealedNeighbors) {
                const { x: nx, y: ny, cell: neighborCell } = neighbor;
                
                if (!neighborCell.isFlagged) {
                    neighborCell.isFlagged = true;
                    this.minesRemaining--;
                    this.updateTile(nx, ny);
                }
            }
            
            this.updateDisplay();
        }
    }
    
    updateTile(x, y) {
        const cell = this.board[y][x];
        const tile = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
        
        tile.className = 'tile';
        tile.textContent = '';
        
        if (cell.isFlagged) {
            tile.classList.add('flagged');
            tile.textContent = '🚩';
        } else if (cell.isQuestioned) {
            tile.classList.add('questioned');
            tile.textContent = '❓';
        } else if (cell.isRevealed) {
            tile.classList.add('revealed');
            if (cell.isMine) {
                tile.classList.add('mine');
                tile.textContent = '💣';
            } else if (cell.neighborMines > 0) {
                tile.textContent = cell.neighborMines;
                tile.setAttribute('data-mines', cell.neighborMines);
            }
        }
    }
    
    gameOver(won) {
        this.gameState = won ? 'won' : 'lost';
        this.clearTimer();
        
        if (!won) {
            this.board.forEach((row, y) => {
                row.forEach((cell, x) => {
                    if (cell.isMine) {
                        const tile = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
                        if (!cell.isFlagged) {
                            tile.classList.add('mine');
                            tile.textContent = '💣';
                        }
                    }
                });
            });
        }
        
        this.addToHistory(this.currentDifficulty, this.timer, won);
        this.showGameResult(won);
    }
    
    checkWin() {
        const width = this.actualWidth;
        const height = this.actualHeight;
        let revealedCount = 0;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (this.board[y][x].isRevealed) {
                    revealedCount++;
                }
            }
        }
        
        const totalCells = width * height;
        const safeCells = totalCells - this.boardConfig.mines;
        
        if (revealedCount === safeCells) {
            this.playSound('win');
            this.gameOver(true);
        }
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateDisplay();
        }, 1000);
    }
    
    clearTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    updateDisplay() {
        document.getElementById('mines-remaining').textContent = this.minesRemaining;
        document.getElementById('timer-display').textContent = this.formatTime(this.timer);
    }
    
    openSettings() {
        document.getElementById('settings-panel').classList.remove('hidden');
        this.updateHistoryDisplay('easy');
    }
    
    updateHistoryDisplay(difficulty) {
        const stats = this.getStatistics(difficulty);
        const topTimes = this.getTopTimes(difficulty);
        
        document.getElementById('total-games').textContent = stats.totalGames;
        document.getElementById('games-won').textContent = stats.gamesWon;
        document.getElementById('win-rate').textContent = `${stats.winRate}%`;
        document.getElementById('best-time').textContent = stats.bestTime ? this.formatTime(stats.bestTime) : '--:--';
        document.getElementById('average-time').textContent = stats.averageTime ? this.formatTime(stats.averageTime) : '--:--';
        
        const timesList = document.getElementById('top-times-list');
        
        if (topTimes.length === 0) {
            timesList.innerHTML = '<div class="no-times">No completed games yet</div>';
        } else {
            timesList.innerHTML = topTimes.map((entry, index) => {
                const date = new Date(entry.date).toLocaleDateString();
                return `
                    <div class="time-entry">
                        <span class="time-rank">#${index + 1}</span>
                        <span class="time-value">${this.formatTime(entry.time)}</span>
                        <span class="time-date">${date}</span>
                    </div>
                `;
            }).join('');
        }
    }
    
    closeSettings() {
        document.getElementById('settings-panel').classList.add('hidden');
    }
    
    showGameResult(won) {
        const overlay = document.getElementById('game-overlay');
        const title = document.getElementById('result-title');
        const message = document.getElementById('result-message');
        
        if (won) {
            title.textContent = 'Congratulations!';
            message.textContent = `You won in ${this.formatTime(this.timer)}!`;
            overlay.classList.remove('hidden');
        } else {
            title.textContent = 'Game Over';
            message.textContent = 'Click to continue viewing the board or start a new game';
            overlay.classList.remove('hidden');
            
            // Auto-hide overlay after 3 seconds to allow board viewing
            setTimeout(() => {
                overlay.classList.add('hidden');
            }, 3000);
        }
    }
    
    hideOverlay() {
        document.getElementById('game-overlay').classList.add('hidden');
    }
    
    displayStartScreen() {
        document.getElementById('start-screen').classList.remove('hidden');
        this.updateStartScreenBestTimes();
    }
    
    hideStartScreen() {
        document.getElementById('start-screen').classList.add('hidden');
    }
    
    showStartScreen() {
        // Limpar timer se estiver rodando
        this.clearTimer();
        
        // Resetar estado do jogo
        this.gameState = 'playing';
        this.timer = 0;
        
        // Esconder overlay se estiver visível
        this.hideOverlay();
        
        // Mostrar tela inicial
        this.displayStartScreen();
    }
    
    updateStartScreenBestTimes() {
        Object.keys(this.difficulties).forEach(difficulty => {
            const stats = this.getStatistics(difficulty);
            const element = document.getElementById(`best-${difficulty}`);
            if (element) {
                element.textContent = stats.bestTime ? `Best: ${this.formatTime(stats.bestTime)}` : 'Best: --:--';
            }
        });
    }
    
    
    startNewGame(difficulty) {
        this.currentDifficulty = difficulty;
        this.boardConfig = this.difficulties[difficulty];
        this.hideStartScreen();
        this.newGame();
    }
    
    async clearCacheAndReload() {
        const confirmed = confirm(
            'This will clear all cached data and reload the page to ensure you have the latest version.\n\n' +
            'Your game settings and history will be preserved.\n\n' +
            'Continue?'
        );
        
        if (!confirmed) return;
        
        try {
            // Clear service worker caches
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
                console.log('All caches cleared');
            }
            
            // Unregister service worker
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                await Promise.all(
                    registrations.map(registration => registration.unregister())
                );
                console.log('Service workers unregistered');
            }
            
            // Add cache-busting timestamp to force reload
            const currentUrl = new URL(window.location);
            currentUrl.searchParams.set('v', Date.now().toString());
            
            // Show loading indicator
            const button = document.getElementById('clear-cache-btn');
            const originalText = button.innerHTML;
            button.innerHTML = '⏳ Clearing cache...';
            button.disabled = true;
            
            // Small delay to ensure cleanup completes
            setTimeout(() => {
                window.location.replace(currentUrl.toString());
            }, 1000);
            
        } catch (error) {
            console.error('Error clearing cache:', error);
            alert('Failed to clear cache. Please try reloading the page manually.');
            
            // Reset button
            const button = document.getElementById('clear-cache-btn');
            button.innerHTML = '🔄 Clear Cache & Reload';
            button.disabled = false;
        }
    }
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

const game = new MinesweeperGame();