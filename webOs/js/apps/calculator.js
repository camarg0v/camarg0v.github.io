/* calculator.js - Lógica da calculadora */

const calcApp = {
    display: null,
    currentValue: '0',
    previousValue: null,
    operator: null,
    newNumber: true,

    init: function() {
        this.display = document.getElementById('calc-display');
    },

    updateDisplay: function() {
        if (!this.display) this.init();
        this.display.value = this.currentValue;
    },

    num: function(n) {
        if (this.newNumber) {
            this.currentValue = String(n);
            this.newNumber = false;
        } else {
            if (this.currentValue === '0') {
                this.currentValue = String(n);
            } else {
                this.currentValue += String(n);
            }
        }
        this.updateDisplay();
    },

    dot: function() {
        if (this.newNumber) {
            this.currentValue = '0.';
            this.newNumber = false;
        } else if (!this.currentValue.includes('.')) {
            this.currentValue += '.';
        }
        this.updateDisplay();
    },

    op: function(o) {
        if (this.operator && !this.newNumber) {
            this.calculate();
        }
        this.previousValue = this.currentValue;
        this.operator = o;
        this.newNumber = true;
    },

    eq: function() {
        if (this.operator && !this.newNumber) {
            this.calculate();
            this.operator = null;
        }
    },

    calculate: function() {
        let prev = parseFloat(this.previousValue);
        let current = parseFloat(this.currentValue);
        let result = 0;

        switch(this.operator) {
            case '+': result = prev + current; break;
            case '-': result = prev - current; break;
            case '*': result = prev * current; break;
            case '/': 
                if (current === 0) {
                    result = 'Error';
                } else {
                    result = prev / current; 
                }
                break;
        }
        
        // Handling JS floating point issues
        if (result !== 'Error') {
            result = Math.round(result * 10000000) / 10000000;
        }
        
        this.currentValue = String(result);
        this.newNumber = true;
        this.updateDisplay();
    },

    clear: function() {
        this.currentValue = '0';
        this.previousValue = null;
        this.operator = null;
        this.newNumber = true;
        this.updateDisplay();
    },

    clearEntry: function() {
        this.currentValue = '0';
        this.newNumber = true;
        this.updateDisplay();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    calcApp.init();
});
