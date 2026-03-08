class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        const loginBtn = document.getElementById('btn-login');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                // Here you would normally show a login form or redirect
                console.log('Botão Entrar clicado');
            });
        }

        const registerBtn = document.getElementById('btn-register');
        if (registerBtn) {
            registerBtn.addEventListener('click', () => {
                console.log('Botão Registar-me clicado');
            });
        }
    }
}