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
            tileColor: 'green',
            boardOrientation: 'vertical',
            colorTheme: 'blue'
        };
        
        this.tileColors = {
            green: '#a8e6cf',
            blue: '#88d8ff',
            red: '#ffaaa5',
            yellow: '#fff3b0',
            orange: '#ffcc99',
            teal: '#81e6d9',
            purple: '#dbb2ff',
            pink: '#ffc0cb'
        };
        
        this.difficulties = {
            beginner: { width: 9, height: 9, mines: 10 },
            intermediate: { width: 16, height: 16, mines: 40 },
            expert: { width: 30, height: 16, mines: 99 }
        };
        
        this.currentDifficulty = 'beginner';
        this.boardConfig = this.difficulties[this.currentDifficulty];
        
        this.gameHistory = {
            beginner: [],
            intermediate: [],
            expert: []
        };
        
        this.showStartScreen = true;
        this.deferredPrompt = null;
        
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.loadGameHistory();
        this.setupEventListeners();
        this.setupPWAInstallation();
        this.applyTheme();
        this.applyTileColor();
        this.applyColorTheme();
        
        if (this.showStartScreen) {
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
        document.querySelector(`input[name="tile-color"][value="${this.settings.tileColor}"]`).checked = true;
        document.querySelector(`input[name="board-orientation"][value="${this.settings.boardOrientation}"]`).checked = true;
        document.querySelector(`input[name="color-theme"][value="${this.settings.colorTheme}"]`).checked = true;
        document.getElementById('hold-delay').value = this.settings.holdDelay;
        document.getElementById('delay-value').textContent = this.settings.holdDelay;
        this.applyTileColor();
        this.applyBoardOrientation();
        this.applyColorTheme();
        this.updateToggleButton();
    }
    
    applyTheme() {
        document.body.setAttribute('data-theme', this.settings.theme);
        const themeColor = this.settings.theme === 'dark' ? '#000000' : '#ffffff';
        document.querySelector('meta[name="theme-color"]').setAttribute('content', themeColor);
    }
    
    applyTileColor() {
        const color = this.tileColors[this.settings.tileColor];
        document.documentElement.style.setProperty('--selected-tile-color', color);
    }
    
    applyBoardOrientation() {
        this.renderBoard();
    }
    
    applyColorTheme() {
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${this.settings.colorTheme}`);
    }
    
    updateToggleButton() {
        const toggleBtn = document.getElementById('flag-toggle-btn');
        
        if (this.settings.primaryAction === 'flag') {
            toggleBtn.classList.add('active');
            toggleBtn.textContent = '🚩';
            toggleBtn.title = 'Modo: Bandeira (primário), Revelar (secundário)';
        } else {
            toggleBtn.classList.remove('active');
            toggleBtn.textContent = '💣';
            toggleBtn.title = 'Modo: Revelar (primário), Bandeira (secundário)';
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
                this.saveSettings();
            });
        });
        
        document.getElementById('hold-delay').addEventListener('input', (e) => {
            this.settings.holdDelay = parseInt(e.target.value);
            document.getElementById('delay-value').textContent = this.settings.holdDelay;
            this.saveSettings();
        });
        
        document.querySelectorAll('input[name="tile-color"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.settings.tileColor = e.target.value;
                this.applyTileColor();
                this.saveSettings();
            });
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
                this.applyColorTheme();
                this.saveSettings();
            });
        });
        
        document.getElementById('flag-toggle-btn').addEventListener('click', () => {
            this.settings.primaryAction = this.settings.primaryAction === 'reveal' ? 'flag' : 'reveal';
            this.updateToggleButton();
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
            neighborMines: 0
        })));
        
        this.renderBoard();
    }
    
    placeMines(excludeX, excludeY) {
        const width = this.actualWidth;
        const height = this.actualHeight;
        const mines = this.boardConfig.mines;
        const positions = [];
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (x !== excludeX || y !== excludeY) {
                    positions.push({ x, y });
                }
            }
        }
        
        for (let i = 0; i < mines; i++) {
            const randomIndex = Math.floor(Math.random() * positions.length);
            const { x, y } = positions.splice(randomIndex, 1)[0];
            this.board[y][x].isMine = true;
        }
        
        this.calculateNeighborMines();
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
        
        tile.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (e.touches.length === 1) {
                isHolding = false;
                holdTimeout = setTimeout(() => {
                    isHolding = true;
                    handleSecondaryAction();
                    this.triggerVibration();
                }, this.settings.holdDelay);
            }
        });
        
        tile.addEventListener('touchend', (e) => {
            e.preventDefault();
            clearTimeout(holdTimeout);
            if (!isHolding && e.touches.length === 0) {
                handlePrimaryAction();
            }
        });
        
        tile.addEventListener('touchmove', (e) => {
            clearTimeout(holdTimeout);
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
            this.gameOver(false);
            return;
        }
        
        cell.isRevealed = true;
        this.updateTile(x, y);
        
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
        
        cell.isFlagged = !cell.isFlagged;
        this.minesRemaining += cell.isFlagged ? -1 : 1;
        this.updateTile(x, y);
        this.updateDisplay();
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
        this.updateHistoryDisplay('beginner');
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