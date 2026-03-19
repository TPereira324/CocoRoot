handleRegister(e) {
    e.preventDefault();
    const nome = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('password').value;
    const nome_fazenda = document.getElementById('farmname').value;
    const agricultor_iniciante = document.getElementById('is_beginner').checked ? 1 : 0;

    const response = await this.model.register(nome, email, senha, nome_fazenda, agricultor_iniciante);
    
}