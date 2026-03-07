class View {
    constructor() {
        this.app = document.getElementById('app');
    }

    render(data) {
        this.app.innerHTML = `
            <h1>Front-end MVC</h1>
            <p>Conteúdo do Model: ${data}</p>
        `;
    }
}