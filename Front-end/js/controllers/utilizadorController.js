class UtilizadorController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.currentStep = 1;
        this.maxStep = 6;
    }

    init() {
        if (this.view.steps && this.view.steps.length > 0) {
            this.view.showStep(this.currentStep);
        }

        this.bindEvents();
    }

    bindEvents() {
        const nextButtons = document.querySelectorAll('.next-step');
        const prevButtons = document.querySelectorAll('.prev-step');

        nextButtons.forEach((btn) => {
            btn.addEventListener('click', () => this.nextStep());
        });

        prevButtons.forEach((btn) => {
            btn.addEventListener('click', () => this.prevStep());
        });

        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
    }

    validateCurrentStep() {
        const currentStepEl = document.getElementById(`step-${this.currentStep}`);
        if (!currentStepEl) return true;

        const showFieldError = (field, message) => {
            if (!field) return;
            field.classList.add('is-invalid');
            const err = currentStepEl.querySelector(`.field-error[data-for="${field.id}"]`);
            if (err) {
                err.textContent = message || 'Campo inválido.';
                err.classList.add('is-show');
            }
        };

        const clearFieldError = (field) => {
            if (!field) return;
            field.classList.remove('is-invalid');
            const err = currentStepEl.querySelector(`.field-error[data-for="${field.id}"]`);
            if (err) {
                err.textContent = '';
                err.classList.remove('is-show');
            }
        };

        const fields = Array.from(currentStepEl.querySelectorAll('input, select'))
            .filter((f) => f instanceof HTMLElement && f.type !== 'hidden');

        fields.forEach((f) => clearFieldError(f));
        if (this.view && typeof this.view.displayMessage === 'function') this.view.displayMessage('');

        for (const field of fields) {
            const id = field.id || '';
            const value = (field.value || '').trim();

            if (id === 'phone') {
                const validPhonePattern = /^[0-9]{9}$/;
                if (!validPhonePattern.test(value)) {
                    showFieldError(field, 'O número deve ter exatamente 9 dígitos.');
                    field.focus();
                    return false;
                }
            }

            if (!field.checkValidity()) {
                showFieldError(field, field.validationMessage || 'Campo inválido.');
                field.focus();
                return false;
            }
        }

        return true;
    }

    nextStep() {
        if (!this.validateCurrentStep()) return;
        if (this.currentStep >= this.maxStep) return;

        this.currentStep += 1;
        this.view.showStep(this.currentStep);
    }

    prevStep() {
        if (this.currentStep <= 1) return;

        this.currentStep -= 1;
        this.view.showStep(this.currentStep);
    }

    async handleRegister(event) {
        event.preventDefault();

        if (!this.validateCurrentStep()) return;

        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm_password');

        const password = passwordInput ? passwordInput.value : '';
        const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';

        if (password !== confirmPassword) {
            const passwordInputEl = document.getElementById('password');
            const confirmInputEl = document.getElementById('confirm_password');
            if (passwordInputEl) passwordInputEl.classList.add('is-invalid');
            if (confirmInputEl) confirmInputEl.classList.add('is-invalid');
            const stepEl = document.getElementById(`step-${this.currentStep}`);
            const err = stepEl ? stepEl.querySelector(`.field-error[data-for="confirm_password"]`) : null;
            if (err) {
                err.textContent = 'As palavras-passe não coincidem.';
                err.classList.add('is-show');
            }
            this.view.displayMessage('As palavras-passe não coincidem.', true);
            return;
        }

        const formData = new FormData(event.target);
        const userData = Object.fromEntries(formData.entries());
        const submitBtn = event?.target?.querySelector?.('button[type="submit"]') || document.querySelector('#register-form button[type="submit"]');

        try {
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.classList.add('is-loading');
            }
            if (userData.country_code && userData.phone) {
                userData.phone = `${userData.country_code}${String(userData.phone).trim()}`;
                delete userData.country_code;
            }
            if (this.model && typeof this.model.register === 'function') {
                const result = await this.model.register(userData);
                if (!result || result.success !== true) {
                    this.view.displayMessage(result?.message || 'Falha ao registrar.', true);
                    return;
                }
            }

            this.view.displayMessage('Cadastro concluído com sucesso!');
            window.location.href = 'login.html';
        } catch (e) {
            this.view.displayMessage('Falha ao registrar.', true);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('is-loading');
            }
        }
    }
}
