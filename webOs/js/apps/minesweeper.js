/* minesweeper.js - Lógica do Campo Minado */

const mineApp = {
    gridElement: null,
    rows: 9,
    cols: 9,
    mineCountTotal: 10,
    
    board: [],
    mines: [],
    revealedCount: 0,
    flagsCount: 0,
    
    gameOver: false,
    firstClick: true,
    timer: null,
    seconds: 0,
    
    containerElement: null,
    resizeTimeout: null,

    init: function() {
        this.gridElement = document.getElementById('ms-grid');
        this.containerElement = document.querySelector('.ms-grid-container');
        
        // Setup Resize Observer for dynamically scaling the grid
        const resizeObserver = new ResizeObserver(() => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.updateGridDimensions();
            }, 300); // 300ms debounce to avoid spamming resets while dragging
        });
        
        if (this.containerElement) {
            resizeObserver.observe(this.containerElement);
        }
        
        this.updateGridDimensions();
    },
    
    updateGridDimensions: function() {
        if (!this.containerElement) return;
        
        let containerWidth = this.containerElement.clientWidth;
        let containerHeight = this.containerElement.clientHeight;
        
        console.log(`Minesweeper resize event: ${containerWidth}x${containerHeight}`);
        
        if (containerWidth === 0 || containerHeight === 0) return; // Prevent 0-state overrides
        
        // Subtract 4px for the padding inside .ms-grid-container
        let availableWidth = containerWidth - 4;
        let availableHeight = containerHeight - 4;
        
        // Verifica se a janela em si esta com classe maximized, para forçar dinamicidade real
        const isMaximized = document.getElementById('window-minesweeper').classList.contains('maximized');
        
        let newCols = 9;
        let newRows = 9;
        
        // Se a gente maxizou, basear matematicamente pelo tamanho real
        if (isMaximized || containerWidth > 320 || containerHeight > 380) {
            newCols = Math.floor(availableWidth / 20);
            newRows = Math.floor(availableHeight / 20);
        } else {
            // Force shrink if the window is restored and near base sizes
            this.gridElement.style.width = '180px'; // 9 * 20
            this.gridElement.style.height = '180px'; // 9 * 20
        }
        
        // Set minimum boundaries
        if (newCols < 9) newCols = 9;
        if (newRows < 9) newRows = 9;
        
        console.log(`Calculated logic: ${newCols} cols, ${newRows} rows. Previous: ${this.cols}x${this.rows}`);
        
        // Only reset if dimensions actually changed
        if (this.cols !== newCols || this.rows !== newRows) {
            console.log("Applying new grid size and resetting game.");
            this.cols = newCols;
            this.rows = newRows;
            
            // Standard ratio is around ~15% mines (e.g. 9x9=81 cells, 10 mines is ~12.3%)
            this.mineCountTotal = Math.floor((this.cols * this.rows) * 0.15);
            
            this.gridElement.style.gridTemplateColumns = `repeat(${this.cols}, 20px)`;
            this.gridElement.style.gridTemplateRows = `repeat(${this.rows}, 20px)`;
            
            this.reset();
        }
    },

    reset: function() {
        this.board = [];
        this.mines = [];
        this.revealedCount = 0;
        this.flagsCount = 0;
        this.gameOver = false;
        this.firstClick = true;
        this.seconds = 0;
        
        clearInterval(this.timer);
        this.updateUI();
        document.getElementById('ms-face').innerText = '🙂';
        
        this.gridElement.innerHTML = '';
        
        for (let r = 0; r < this.rows; r++) {
            let row = [];
            for (let c = 0; c < this.cols; c++) {
                let cellData = {
                    r: r, c: c,
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    neighborMines: 0,
                    element: document.createElement('div')
                };
                
                cellData.element.className = 'ms-cell';
                
                // Mousedown para mudar o rosto (Opcional W95 feição de 'uhh')
                cellData.element.addEventListener('mousedown', (e) => {
                    if (!this.gameOver && e.button === 0) {
                        document.getElementById('ms-face').innerText = '😮';
                    }
                });
                
                // Eventos de click
                cellData.element.addEventListener('mouseup', (e) => {
                    document.getElementById('ms-face').innerText = '🙂';
                    if (this.gameOver) return;
                    
                    if (e.button === 0) { // Left Click
                        this.revealCell(r, c);
                    } else if (e.button === 2) { // Right Click
                        this.toggleFlag(r, c);
                    }
                });
                
                this.gridElement.appendChild(cellData.element);
                row.push(cellData);
            }
            this.board.push(row);
        }
    },

    placeMines: function(excludeR, excludeC) {
        let placed = 0;
        while (placed < this.mineCountTotal) {
            let r = Math.floor(Math.random() * this.rows);
            let c = Math.floor(Math.random() * this.cols);
            
            // Não colocar bomba no primeiro clique nem onde já tem
            if ((r === excludeR && c === excludeC) || this.board[r][c].isMine) {
                continue;
            }
            
            this.board[r][c].isMine = true;
            this.mines.push({r, c});
            placed++;
        }
        
        // Calculate neighbors
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (!this.board[r][c].isMine) {
                    this.board[r][c].neighborMines = this.countNeighbors(r, c);
                }
            }
        }
        
        // Inciar timer
        this.timer = setInterval(() => {
            if (this.seconds < 999) this.seconds++;
            this.updateUI();
        }, 1000);
    },

    countNeighbors: function(r, c) {
        let count = 0;
        for (let rOff = -1; rOff <= 1; rOff++) {
            for (let cOff = -1; cOff <= 1; cOff++) {
                let nr = r + rOff;
                let nc = c + cOff;
                if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
                    if (this.board[nr][nc].isMine) count++;
                }
            }
        }
        return count;
    },

    revealCell: function(r, c) {
        let cell = this.board[r][c];
        
        if (cell.isRevealed || cell.isFlagged) return;

        if (this.firstClick) {
            this.firstClick = false;
            this.placeMines(r, c);
        }

        cell.isRevealed = true;
        cell.element.classList.add('revealed');
        this.revealedCount++;

        if (cell.isMine) {
            cell.element.classList.add('mine');
            cell.element.innerText = '💣';
            this.triggerLoss();
            return;
        }

        if (cell.neighborMines > 0) {
            cell.element.innerText = cell.neighborMines;
            cell.element.setAttribute('data-val', cell.neighborMines);
        } else {
            // Se for luz (0 vizinhos), flood fill
            for (let rOff = -1; rOff <= 1; rOff++) {
                for (let cOff = -1; cOff <= 1; cOff++) {
                    let nr = r + rOff;
                    let nc = c + cOff;
                    if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
                        this.revealCell(nr, nc);
                    }
                }
            }
        }

        this.checkWin();
    },

    toggleFlag: function(r, c) {
        let cell = this.board[r][c];
        if (cell.isRevealed) return;

        if (!cell.isFlagged) {
            if (this.flagsCount < this.mineCountTotal) {
                cell.isFlagged = true;
                this.flagsCount++;
                cell.element.innerText = '🚩';
            }
        } else {
            cell.isFlagged = false;
            this.flagsCount--;
            cell.element.innerText = '';
        }
        this.updateUI();
    },

    triggerLoss: function() {
        this.gameOver = true;
        clearInterval(this.timer);
        document.getElementById('ms-face').innerText = '😵';
        
        // Show all mines
        this.mines.forEach(m => {
            let cell = this.board[m.r][m.c];
            if (!cell.isRevealed) {
                cell.element.classList.add('revealed');
                if (!cell.isFlagged) {
                    cell.element.innerText = '💣';
                }
            }
        });
    },

    checkWin: function() {
        if (this.revealedCount === (this.rows * this.cols - this.mineCountTotal)) {
            this.gameOver = true;
            clearInterval(this.timer);
            document.getElementById('ms-face').innerText = '😎';
            // Auto flag remaining mines
            this.flagsCount = this.mineCountTotal;
            this.updateUI();
        }
    },

    updateUI: function() {
        let minesLeft = this.mineCountTotal - this.flagsCount;
        document.getElementById('ms-mines-count').innerText = minesLeft.toString().padStart(3, '0');
        document.getElementById('ms-timer').innerText = this.seconds.toString().padStart(3, '0');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    mineApp.init();
});
