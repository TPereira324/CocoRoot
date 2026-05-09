document.addEventListener('DOMContentLoaded', async () => {
    const api = window.CocoRootApi;
    if (!api) return;

    const statsRoot = document.getElementById('community-stats');
    const postsRoot = document.getElementById('posts');
    const errorBox = document.getElementById('community-error');
    const tabs = Array.from(document.querySelectorAll('.tab[data-cat]'));

    const setError = (message) => {
        if (!errorBox) return;
        errorBox.hidden = !message;
        errorBox.textContent = message || '';
    };

    const CAT_META = {
        duvidas: { label: 'Dúvida', icon: 'bi-question-circle', color: '#2563eb', bg: 'rgba(37,99,235,0.09)', border: 'rgba(37,99,235,0.28)' },
        dicas: { label: 'Dica', icon: 'bi-lightbulb', color: '#16a34a', bg: 'rgba(22,163,74,0.09)', border: 'rgba(22,163,74,0.28)' },
        experiencias: { label: 'Experiência', icon: 'bi-stars', color: '#d97706', bg: 'rgba(217,119,6,0.09)', border: 'rgba(217,119,6,0.30)' },
    };

    const getInitials = (name) => {
        const parts = String(name || 'U').trim().split(/\s+/);
        if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        return String(name || 'U').slice(0, 2).toUpperCase();
    };

    const formatRelativeTime = (dateValue) => {
        if (!dateValue) return '';
        const date = new Date(dateValue);
        if (Number.isNaN(date.getTime())) return '';
        const diffMs = Date.now() - date.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        const diffH = Math.floor(diffMin / 60);
        const diffD = Math.floor(diffH / 24);
        if (diffMin < 2) return 'Agora mesmo';
        if (diffMin < 60) return `Há ${diffMin} min`;
        if (diffH < 24) return `Há ${diffH}h`;
        if (diffD < 7) return `Há ${diffD} dia${diffD !== 1 ? 's' : ''}`;
        return new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(date);
    };

    const renderStats = (posts) => {
        if (!statsRoot) return;
        const counts = {
            todos: posts.length,
            duvidas: posts.filter((p) => p.categoria === 'duvidas').length,
            dicas: posts.filter((p) => p.categoria === 'dicas').length,
            experiencias: posts.filter((p) => p.categoria === 'experiencias').length,
        };

        statsRoot.innerHTML = `
            <div class="cstat-item">
                <i class="bi bi-chat-square-text cstat-icon" aria-hidden="true"></i>
                <div class="cstat-body">
                    <span class="cstat-num">${counts.todos}</span>
                    <span class="cstat-label">Publicações</span>
                </div>
            </div>
            <div class="cstat-item cstat-duvidas">
                <i class="bi bi-question-circle cstat-icon" aria-hidden="true"></i>
                <div class="cstat-body">
                    <span class="cstat-num">${counts.duvidas}</span>
                    <span class="cstat-label">Dúvidas</span>
                </div>
            </div>
            <div class="cstat-item cstat-dicas">
                <i class="bi bi-lightbulb cstat-icon" aria-hidden="true"></i>
                <div class="cstat-body">
                    <span class="cstat-num">${counts.dicas}</span>
                    <span class="cstat-label">Dicas</span>
                </div>
            </div>
            <div class="cstat-item cstat-experiencias">
                <i class="bi bi-stars cstat-icon" aria-hidden="true"></i>
                <div class="cstat-body">
                    <span class="cstat-num">${counts.experiencias}</span>
                    <span class="cstat-label">Experiências</span>
                </div>
            </div>
        `;
    };

    const renderPosts = (posts, activeCategory) => {
        if (!postsRoot) return;
        const filtered = activeCategory === 'todos'
            ? posts
            : posts.filter((post) => post.categoria === activeCategory);

        if (filtered.length === 0) {
            postsRoot.innerHTML = `
                <div class="community-empty">
                    <i class="bi bi-inbox community-empty-icon" aria-hidden="true"></i>
                    <div class="community-empty-text">Sem publicações nesta categoria.</div>
                    <div class="community-empty-sub">Sê o primeiro a partilhar!</div>
                </div>`;
            return;
        }

        postsRoot.innerHTML = filtered.map((post) => {
            const cat = CAT_META[post.categoria] || { label: 'Outro', icon: 'bi-chat', color: '#6b7280', bg: 'rgba(107,114,128,0.09)', border: 'rgba(107,114,128,0.24)' };
            const author = String(post?.autor?.nome || 'Utilizador');
            const initials = getInitials(author);
            const timeText = formatRelativeTime(post?.data);
            const replies = Number(post?.comentarios ?? post?.respostas ?? 0);
            const excerpt = String(post.conteudo || '').slice(0, 160).trim();
            const excerptText = excerpt.length < String(post.conteudo || '').trim().length ? `${excerpt}…` : excerpt;
            return `
                <a class="community-post cat-${post.categoria || 'outros'}" href="comunidade-post.html?id=${post.id}">
                    <div class="post-avatar" aria-hidden="true" style="background:${cat.color};">${initials}</div>
                    <div class="post-body">
                        <div class="post-meta-row">
                            <span class="post-author">${author}</span>
                            <span class="post-badge ${post.categoria || 'outros'}" style="background:${cat.bg};border-color:${cat.border};color:${cat.color};">
                                <i class="bi ${cat.icon}" aria-hidden="true"></i> ${cat.label}
                            </span>
                            ${timeText ? `<span class="post-time">${timeText}</span>` : ''}
                        </div>
                        <div class="post-title">${post.titulo || 'Sem título'}</div>
                        ${excerptText ? `<div class="post-excerpt">${excerptText}</div>` : ''}
                        <div class="post-footer">
                            <span class="post-replies">
                                <i class="bi bi-chat" aria-hidden="true"></i>
                                ${replies === 0 ? 'Sem respostas' : `${replies} resposta${replies !== 1 ? 's' : ''}`}
                            </span>
                            <span class="post-read-more">Ler mais <i class="bi bi-arrow-right" aria-hidden="true"></i></span>
                        </div>
                    </div>
                </a>`;
        }).join('');
    };

    const publishToggleBtn = document.getElementById('publish-toggle-btn');
    const publishFormSection = document.getElementById('publish-form-section');
    const publishForm = document.getElementById('community-publish-form');
    const publishCancelBtn = document.getElementById('publish-cancel-btn');
    const publishSubmitBtn = document.getElementById('publish-submit-btn');
    const publishErrorEl = document.getElementById('publish-error');

    const setPublishError = (message) => {
        if (!publishErrorEl) return;
        publishErrorEl.hidden = !message;
        publishErrorEl.textContent = message || '';
    };

    const openPublishForm = () => {
        const user = api.getLoggedUser();
        if (!user?.id) {
            setPublishError('Precisas de iniciar sessão para fazer perguntas ou partilhar dicas.');
            setError('Precisas de iniciar sessão para participar na comunidade.');
            if (window.CocoRootToast) {
                window.CocoRootToast('Comunidade', 'Inicia sessão para publicar uma pergunta');
            }
            return;
        }
        if (publishFormSection) publishFormSection.hidden = false;
        if (publishToggleBtn) publishToggleBtn.hidden = true;
        document.getElementById('publish-titulo')?.focus();
    };

    const closePublishForm = () => {
        if (publishFormSection) publishFormSection.hidden = true;
        if (publishToggleBtn) publishToggleBtn.hidden = false;
        if (publishForm) publishForm.reset();
        setPublishError('');
    };

    publishToggleBtn?.addEventListener('click', openPublishForm);
    publishCancelBtn?.addEventListener('click', closePublishForm);

    publishForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = api.getLoggedUser();
        if (!user?.id) {
            setPublishError('Precisas de iniciar sessão para publicar.');
            return;
        }

        const titulo = String(document.getElementById('publish-titulo')?.value || '').trim();
        const conteudo = String(document.getElementById('publish-conteudo')?.value || '').trim();
        const categoria = String(document.getElementById('publish-categoria')?.value || 'outros');

        if (!titulo) { setPublishError('O título é obrigatório.'); return; }
        if (!conteudo) { setPublishError('O conteúdo é obrigatório.'); return; }

        try {
            setPublishError('');
            if (publishSubmitBtn) publishSubmitBtn.disabled = true;
            await api.fetchJson('forum/publicar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ut_id: user.id, titulo, conteudo, categoria }),
            });
            closePublishForm();
            const response = await api.fetchJson('forum/listar');
            posts = Array.isArray(response?.data) ? response.data : [];
            renderStats(posts);
            renderPosts(posts, currentCategory);
        } catch (error) {
            setPublishError(error.message || 'Não foi possível publicar.');
        } finally {
            if (publishSubmitBtn) publishSubmitBtn.disabled = false;
        }
    });

    let currentCategory = 'todos';
    let posts = [];

    const activateTab = (category) => {
        currentCategory = category;
        tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.cat === category));
        renderPosts(posts, currentCategory);
    };

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => activateTab(tab.dataset.cat));
    });

    try {
        const response = await api.fetchJson('forum/listar');
        posts = Array.isArray(response?.data) ? response.data : [];
        renderStats(posts);
        renderPosts(posts, currentCategory);
        setError('');
    } catch (error) {
        renderStats([]);
        renderPosts([], currentCategory);
        setError(error.message || 'Não foi possível carregar a comunidade.');
    }
});
