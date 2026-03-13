/* browser.js - Lógica do Iframe Navigator */

const browserApp = {
    iframe: null,
    urlInput: null,
    btnBack: null,
    
    history: [],
    historyIndex: -1,
    isNavigationAction: false, // flag para saber se a alteracao de historico veio dos botoes

    init: function() {
        this.iframe = document.getElementById('browser-iframe');
        this.urlInput = document.getElementById('browser-url');
        this.btnBack = document.getElementById('browser-back');
        
        // Push initial state
        this.pushHistory(this.urlInput.value);

        // Bind Enter key to navigate
        this.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.navigate();
            }
        });
    },

    navigate: function() {
        let url = this.urlInput.value.trim();
        
        if (!url) return;

        // Adicionar protocolo se faltar e não for localhost relativo
        if (!/^https?:\/\//i.test(url) && !url.startsWith('.') && !url.startsWith('/')) {
            url = 'https://' + url;
        }

        this.urlInput.value = url;
        this.isNavigationAction = true;
        this.pushHistory(url);
        
        // A tentativa de setar a prop src renderiza o Iframe na hora
        this.iframe.src = url;
    },

    pushHistory: function(url) {
        // Se a gente navegou pra trás e depois foi pra um link novo, corta os links "do futuro"
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        // Nao loga 2x a mesma page em sequencia
        if (this.history[this.history.length - 1] !== url) {
            this.history.push(url);
            this.historyIndex++;
        }
        
        this.updateButtonsUI();
    },

    goBack: function() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const previousUrl = this.history[this.historyIndex];
            
            this.isNavigationAction = true;
            this.urlInput.value = previousUrl;
            this.iframe.src = previousUrl;
            
            this.updateButtonsUI();
        }
    },

    goHome: function() {
        this.urlInput.value = 'https://pt.wikipedia.org';
        this.navigate();
    },

    reload: function() {
        if (this.iframe.src) {
            // Um truque safado pra forçar reload de iframes no JS
            this.iframe.src = this.iframe.src;
        }
    },

    iframeLoaded: function() {
        // As vezes the iframe contentWindow navigates inner links (se permitido). 
        // Infelizmente, devido ao CORS, não conseguimos ler iframe.contentWindow.location.href 
        // a não ser que o domínio dentro seja igual ao host raiz. 
        // Portanto a gente atualiza a UI comendo a URL que enviamos para o src primário.
        
        console.log("Browser Page load complete");
    },
    
    updateButtonsUI: function() {
        if (this.historyIndex <= 0) {
            this.btnBack.disabled = true;
        } else {
            this.btnBack.disabled = false;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    browserApp.init();
});
