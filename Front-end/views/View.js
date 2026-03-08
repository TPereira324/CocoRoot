class View {
    constructor() {
        this.app = document.getElementById('app');
    }

    displayMessage(message, isError = false) {
        const messageDiv = document.getElementById('login-message');
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.className = isError ? 'message error' : 'message success';
        }
    }
}