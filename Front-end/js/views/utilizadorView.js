class UtilizadorView {
    constructor() {
        this.registerForm = document.getElementById('register-form');
        this.steps = document.querySelectorAll('.register-step');
        this.messageEl = document.getElementById('register-message');
    }

    showStep(stepNumber) {
        this.steps.forEach((step, index) => {
            if (index === stepNumber - 1) {
                step.classList.remove('hidden');
            } else {
                step.classList.add('hidden');
            }
        });
    }

    displayMessage(message, isError = false) {
        const text = String(message || '').trim();
        if (this.messageEl) {
            this.messageEl.hidden = !text;
            this.messageEl.textContent = text;
            this.messageEl.style.borderColor = isError ? 'rgba(180,35,24,0.18)' : 'rgba(47,143,61,0.18)';
            this.messageEl.style.background = isError ? 'rgba(180,35,24,0.08)' : 'rgba(47,143,61,0.10)';
            this.messageEl.style.color = isError ? 'rgba(138,31,17,0.96)' : 'rgba(31,60,19,0.92)';
        }
        if (window.CocoRootToast) {
            window.CocoRootToast(isError ? 'Registo' : 'Conta', text || (isError ? 'Erro' : 'Feito'), isError ? 'error' : 'success');
        }
    }
}
