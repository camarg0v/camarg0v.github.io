/* pixelart.js - Lógica base para o Paint Pixel Edition */

const pixelArtApp = {
    canvas: null,
    palette: null,
    currentColor: '#000000',
    isDrawing: false,
    
    // Cores clássicas predefinidas
    colors: [
        '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080',
        '#ffffff', '#c0c0c0', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff'
    ],

    init: function() {
        this.canvas = document.getElementById('pa-canvas');
        this.palette = document.getElementById('pa-palette');
        
        this.setupPalette();
        this.initCanvas(32); // Default 32x32
        
        // Controle de pressão do mouse (global pra n engasgar se o mouse sair rápido do grid)
        document.addEventListener('mousedown', () => this.isDrawing = true);
        document.addEventListener('mouseup', () => this.isDrawing = false);
    },

    setupPalette: function() {
        this.palette.innerHTML = '';
        this.colors.forEach((color, i) => {
            const btn = document.createElement('div');
            btn.className = 'color-btn' + (i === 0 ? ' selected' : '');
            btn.style.backgroundColor = color;
            btn.onclick = () => this.setColor(color, btn);
            this.palette.appendChild(btn);
        });
    },

    setColor: function(color, btnElement) {
        this.currentColor = color;
        // Update UI
        document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
        if (btnElement) btnElement.classList.add('selected');
        
        // Desativa estado do botão de borracha se ativo
        document.getElementById('btn-eraser').classList.remove('active-tool');
    },

    setEraser: function() {
        this.currentColor = 'transparent'; // Fundo branco na div base
        document.getElementById('btn-eraser').classList.add('active-tool');
        document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
    },

    initCanvas: function(size) {
        const numSize = parseInt(size);
        this.canvas.innerHTML = '';
        
        // Define o css grid dinamicamente
        this.canvas.style.gridTemplateColumns = `repeat(${numSize}, 1fr)`;
        this.canvas.style.gridTemplateRows = `repeat(${numSize}, 1fr)`;
        
        // Fixa um tamanho estático no CSS baseado no grid (ex: cada px = 10x10)
        let pixelSize = numSize === 16 ? 20 : 10;
        this.canvas.style.width = (numSize * pixelSize) + 'px';
        this.canvas.style.height = (numSize * pixelSize) + 'px';

        for (let i = 0; i < numSize * numSize; i++) {
            const cell = document.createElement('div');
            cell.className = 'pixel-cell';
            
            // Eventos de pintura
            cell.addEventListener('mousedown', (e) => {
                e.preventDefault(); // Evita drag do HTML
                this.paintCell(cell);
            });
            
            cell.addEventListener('mouseover', () => {
                if (this.isDrawing) this.paintCell(cell);
            });
            
            this.canvas.appendChild(cell);
        }
    },

    paintCell: function(cell) {
        cell.style.backgroundColor = this.currentColor;
    },

    clearCanvas: function() {
        const cells = document.querySelectorAll('.pixel-cell');
        cells.forEach(c => c.style.backgroundColor = 'transparent');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    pixelArtApp.init();
});
