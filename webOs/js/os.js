/* os.js - Kernel do nosso Web OS 95 */

const os = {
    highestZIndex: 100,
    openApps: [],

    init: function() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
        this.setupWindows();
        
        // Clicar fora do menu iniciar o fecha
        document.addEventListener('mousedown', (e) => {
            const startMenu = document.getElementById('start-menu');
            const startBtn = document.getElementById('start-button');
            if (startMenu.classList.contains('show') && !startMenu.contains(e.target) && !startBtn.contains(e.target)) {
                this.toggleStartMenu();
            }
        });
    },

    updateClock: function() {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        hours = hours % 12;
        hours = hours ? hours : 12; 
        minutes = minutes < 10 ? '0' + minutes : minutes;
        
        document.getElementById('os-clock').innerText = hours + ':' + minutes + ' ' + ampm;
    },

    toggleStartMenu: function() {
        const menu = document.getElementById('start-menu');
        const btn = document.getElementById('start-button');
        menu.classList.toggle('show');
        btn.classList.toggle('active');
    },

    openApp: function(appId) {
        const win = document.getElementById('window-' + appId);
        if (!win) return;

        if (win.style.display === 'none') {
            win.style.display = 'flex';
            this.openApps.push(appId);
            this.renderTaskbar();
            
            // Centraliza se for a primeira vez
            if (!win.dataset.opened) {
                win.style.top = (window.innerHeight / 2 - win.offsetHeight / 2) + Math.random() * 40 - 20 + 'px';
                win.style.left = (window.innerWidth / 2 - win.offsetWidth / 2) + Math.random() * 40 - 20 + 'px';
                win.dataset.opened = "true";
            }
        }
        this.focusWindow(win);
    },

    openApp: function(appId) {
        let win = document.getElementById('window-' + appId);
        if (win) {
            win.style.display = 'flex';
            
            // Se estivesse minimizada, tira classe de minimizado
            if (win.classList.contains('minimized')) {
                win.classList.remove('minimized');
            }
            
            this.focusWindow(win);
            this.updateTaskbar();
            
            if (this.isStartMenuOpen) {
                this.toggleStartMenu();
            }
        }
    },

    closeApp: function(appId) {
        let win = document.getElementById('window-' + appId);
        if (win) {
            win.style.display = 'none';
            win.classList.remove('minimized');
            win.classList.remove('maximized'); // reset
            this.updateTaskbar();
        }
    },

    minimizeApp: function(appId) {
        let win = document.getElementById('window-' + appId);
        if (win && !win.classList.contains('minimized')) {
            win.style.display = 'none';
            win.classList.add('minimized');
            this.updateTaskbar();
        } else if (win && win.classList.contains('minimized')) {
            // Restore from minimize
            win.style.display = 'flex';
            win.classList.remove('minimized');
            this.focusWindow(win);
            this.updateTaskbar();
        }
    },

    maximizeApp: function(appId) {
        let win = document.getElementById('window-' + appId);
        if (!win) return;
        
        let taskbarHeight = document.querySelector('.taskbar').offsetHeight || 30;

        if (win.classList.contains('maximized')) {
            // Restore to original size
            win.classList.remove('maximized');
            win.style.top = win.dataset.prevTop || '50px';
            win.style.left = win.dataset.prevLeft || '50px';
            win.style.width = win.dataset.prevWidth || '400px';
            win.style.height = win.dataset.prevHeight || '300px';
        } else {
            // Save current size to restore later
            win.dataset.prevTop = win.style.top;
            win.dataset.prevLeft = win.style.left;
            win.dataset.prevWidth = win.style.width;
            win.dataset.prevHeight = win.style.height;
            
            // Maximize
            win.classList.add('maximized');
            win.style.top = '0px';
            win.style.left = '0px';
            win.style.width = '100vw';
            win.style.height = `calc(100vh - ${taskbarHeight}px)`;
        }
    },
    
    focusWindow: function(winElement) {
        this.highestZIndex++;
        winElement.style.zIndex = this.highestZIndex;
        
        // Remove active state from all, add to target
        document.querySelectorAll('.window').forEach(w => w.classList.add('inactive'));
        winElement.classList.remove('inactive');
        
        // Update taskbar visual state
        const appId = winElement.id.replace('window-', '');
        document.querySelectorAll('.taskbar-btn').forEach(b => b.classList.remove('active'));
        const btn = document.getElementById('taskitem-' + appId);
        if(btn) btn.classList.add('active');
    },

    // Renamed from renderTaskbar to updateTaskbar and updated logic
    updateTaskbar: function() {
        const container = document.getElementById('taskbar-tasks');
        container.innerHTML = '';
        
        const windows = document.querySelectorAll('.window');
        let activeZIndex = 0;
        let activeAppId = null;

        // Determine the currently active window based on z-index
        windows.forEach(win => {
            if (win.style.display !== 'none' && !win.classList.contains('minimized')) {
                const currentZIndex = parseInt(win.style.zIndex || 0);
                if (currentZIndex > activeZIndex) {
                    activeZIndex = currentZIndex;
                    activeAppId = win.id.replace('window-', '');
                }
            }
        });

        windows.forEach(win => {
            const appId = win.id.replace('window-', '');
            const isMinimized = win.classList.contains('minimized');
            
            if (win.style.display !== 'none' || isMinimized) {
                let taskBtn = document.createElement('button');
                taskBtn.className = 'taskbar-app-btn';
                
                // Fetch App Name from title bar
                let title = win.querySelector('.title-bar-text').innerText;
                taskBtn.innerText = title;

                // Visual feedback if Active vs Inactive vs Minimized
                let isActive = (appId === activeAppId) && !isMinimized;
                
                if (isActive) {
                    taskBtn.classList.add('active');
                }

                taskBtn.onclick = () => {
                    if (isActive) {
                        this.minimizeApp(appId);
                    } else {
                        this.openApp(appId);
                    }
                };
                container.appendChild(taskBtn);
            }
        });
    },

    setupWindows: function() {
        const windows = document.querySelectorAll('.window');
        
        windows.forEach(win => {
            // Focar janela ao clicar em qualquer parte
            win.addEventListener('mousedown', () => this.focusWindow(win));
            
            // Drag and Drop
            const titlebar = win.querySelector('.title-bar');
            if (titlebar) {
                let isDragging = false;
                let startX, startY, initialX, initialY;

                titlebar.addEventListener('mousedown', (e) => {
                    // Prevenir arraste se clicar nos botões de controle
                    if (e.target.closest('.title-bar-controls')) return;
                    if (win.classList.contains('maximized')) return; // Prevent drag if maximized
                    
                    isDragging = true;
                    startX = e.clientX;
                    startY = e.clientY;
                    initialX = win.offsetLeft;
                    initialY = win.offsetTop;
                    this.focusWindow(win);
                    
                    // Previne o cursor de selecionar textos por baixo
                    e.preventDefault(); 
                });

                document.addEventListener('mousemove', (e) => {
                    if (!isDragging) return;
                    
                    const dx = e.clientX - startX;
                    const dy = e.clientY - startY;
                    
                    // Limites de tela simples (evitar sumir pra cima)
                    let newY = initialY + dy;
                    if (newY < 0) newY = 0;
                    
                    win.style.left = initialX + dx + 'px';
                    win.style.top = newY + 'px';
                });

                document.addEventListener('mouseup', () => {
                    isDragging = false;
                });
            }

            // Legacy Window Resizing (bottom-right handle)
            const resizeHandle = win.querySelector('.resize-handle');
            if (resizeHandle) {
                this.attachResizeLogic(resizeHandle, win, 'se'); // Treats classic handle as SE
            }

            // Advanced 8-Direction Resizing
            const resizeEdges = win.querySelectorAll('.resize-edge');
            resizeEdges.forEach(edge => {
                const dir = edge.getAttribute('data-dir');
                this.attachResizeLogic(edge, win, dir);
            });
        });
    },

    attachResizeLogic: function(handleElem, win, direction) {
        let isResizing = false;
        let startX, startY, startWidth, startHeight, startTop, startLeft;

        handleElem.addEventListener('mousedown', (e) => {
            if (win.classList.contains('maximized')) return; // previne resize maximizado
            
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            
            const styles = document.defaultView.getComputedStyle(win);
            startWidth = parseInt(styles.width, 10);
            startHeight = parseInt(styles.height, 10);
            startTop = parseInt(styles.top, 10);
            startLeft = parseInt(styles.left, 10);
            
            this.focusWindow(win);
            e.preventDefault();
            e.stopPropagation();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            
            let dx = e.clientX - startX;
            let dy = e.clientY - startY;
            
            let newWidth = startWidth;
            let newHeight = startHeight;
            let newTop = startTop;
            let newLeft = startLeft;

            const minWidth = 150;
            const minHeight = 100;

            // Horizontal calcs
            if (direction.includes('e')) {
                newWidth = startWidth + dx;
            } else if (direction.includes('w')) {
                newWidth = startWidth - dx;
                if (newWidth > minWidth) newLeft = startLeft + dx;
            }

            // Vertical calcs
            if (direction.includes('s')) {
                newHeight = startHeight + dy;
            } else if (direction.includes('n')) {
                newHeight = startHeight - dy;
                if (newHeight > minHeight) newTop = startTop + dy;
            }
            
            // Constrain & Apply
            if (newWidth > minWidth) {
                win.style.width = newWidth + 'px';
                win.style.left = newLeft + 'px';
            }
            if (newHeight > minHeight) {
                win.style.height = newHeight + 'px';
                win.style.top = newTop + 'px';
            }
        });

        document.addEventListener('mouseup', () => {
            isResizing = false;
        });
    }
};

// Start OS
document.addEventListener('DOMContentLoaded', () => {
    os.init();
});
