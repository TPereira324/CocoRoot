document.addEventListener('DOMContentLoaded', async () => {
    const api = window.CocoRootApi;
    if (!api) return;

    // ── DOM refs ──────────────────────────────────────────────────────────────
    const statsRoot = document.getElementById('community-stats');
    const postsRoot = document.getElementById('posts');
    const errorBox = document.getElementById('community-error');
    const searchInput = document.getElementById('community-search');
    const tabs = Array.from(document.querySelectorAll('.tab[data-cat]'));
    const sortBtns = Array.from(document.querySelectorAll('.sort-pill[data-sort]'));

    // ── State ─────────────────────────────────────────────────────────────────
    let allPosts = [];
    let currentCategory = 'todos';
    let currentSort = 'recentes';
    let searchQuery = '';

    // ── Seed posts (mostrados quando a API não retorna dados) ─────────────────
    const SEED_POSTS = [
        {
            id: 'seed-1',
            titulo: 'Manchas brancas no substrato — fungo ou misélio?',
            conteudo: 'Há 3 dias comecei a notar manchas brancas no meu substrato de fibra de coco. As plantas (alface) ainda parecem saudáveis mas estou preocupado. Alguém já passou por isto? Vale a pena tratar com peróxido de hidrogênio diluído ou é melhor trocar o substrato todo?',
            categoria: 'duvidas',
            autor: { nome: 'Miguel Ferreira' },
            data: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            comentarios: 7,
            likes: 3,
        },
        {
            id: 'seed-2',
            titulo: 'Dica: lavar bem a fibra antes de usar poupa muito trabalho depois',
            conteudo: 'Aprendi da forma difícil. A fibra de coco comercial tem muito sal acumulado da origem. Se não lavar com água abundante antes de usar, as raízes sofrem logo nos primeiros dias. Hoje lavo sempre 3 vezes até o pH da água de saída estabilizar. Morango e mirtilo agradecem bastante.',
            categoria: 'dicas',
            autor: { nome: 'Ana Costa' },
            data: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
            comentarios: 12,
            likes: 24,
        },
        {
            id: 'seed-3',
            titulo: 'Primeira colheita de tomate cherry em coco — 4.2 kg por planta',
            conteudo: 'Depois de 3 meses a acompanhar pelo CocoRoot, consegui a minha primeira colheita de tomate cherry em fibra de coco. A monitorização de pH e EC fez mesmo diferença. Os frutos ficaram muito mais doces do que no solo. Deixo aqui as minhas configurações caso alguém queira replicar.',
            categoria: 'experiencias',
            autor: { nome: 'João Rodrigues' },
            data: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            comentarios: 19,
            likes: 41,
        },
        {
            id: 'seed-4',
            titulo: 'Qual o pH ideal para cannabis em substrato de coco?',
            conteudo: 'Estou a começar o meu primeiro cultivo de cannabis medicinal em fibra de coco. Li que o pH ideal fica entre 5.8 e 6.2, mas alguns dizem 5.5 a 6.0. Qual é a vossa experiência? Estou a usar um sistema de rega por gotejamento e tenho dificuldade em estabilizar.',
            categoria: 'duvidas',
            autor: { nome: 'Pedro Alves' },
            data: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            comentarios: 8,
            likes: 11,
        },
        {
            id: 'seed-5',
            titulo: 'Como reutilizar a fibra de coco no 2.º e 3.º ciclo',
            conteudo: 'Depois de um ciclo completo, a fibra de coco não vai para o lixo cá em casa. Esterilizo com vapor de água a 80°C durante 30 minutos, deixo secar, ajusto EC e pH, e reutilizo. Já estou no 3.º ciclo com o mesmo substrato e os resultados continuam consistentes. Poupa muito dinheiro.',
            categoria: 'dicas',
            autor: { nome: 'Carla Santos' },
            data: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            comentarios: 5,
            likes: 33,
        },
        {
            id: 'seed-6',
            titulo: 'Morango em fibra de coco — dois anos de experiência real',
            conteudo: 'Cultivo morangos em coco há 2 anos e a gestão da rega é sem dúvida o fator mais crítico. O coco seca rápido e o morango é muito sensível a variações de humidade. Uso sensores simples e rego sempre que o substrato passa de 60% de water content. Os frutos ficam muito mais doces do que no solo.',
            categoria: 'experiencias',
            autor: { nome: 'Susana Lima' },
            data: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            comentarios: 22,
            likes: 56,
        },
        {
            id: 'seed-7',
            titulo: 'EC ideal para microgreens em coco — alguém tem experiência?',
            conteudo: 'Estou a testar microgreens (rabanete e girassol) em fibra de coco fina. Li que o EC deve ser muito baixo, entre 0.8 e 1.2 mS/cm, mas não tenho certeza se devo fazer alguma adubação na fase inicial ou deixar o substrato puro até à germinação.',
            categoria: 'duvidas',
            autor: { nome: 'Ricardo Neves' },
            data: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            comentarios: 0,
            likes: 6,
        },
        {
            id: 'seed-8',
            titulo: 'Mirtilo em coco: resultado surpreendente após ajuste de pH',
            conteudo: 'Tinha os mirtilos com crescimento estagnado há semanas. Decidi medir o pH do substrato e estava em 6.4 — muito alto para mirtilo. Baixei para 5.2 com ácido cítrico ao longo de 10 dias e a diferença foi imediata. Em 3 semanas tinham novos ramos e a floração começou. Não subestimem o pH no mirtilo.',
            categoria: 'experiencias',
            autor: { nome: 'Filipa Martins' },
            data: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            comentarios: 14,
            likes: 38,
        },
    ];

    // ── Category meta ─────────────────────────────────────────────────────────
    const CAT_META = {
        duvidas: { label: 'Dúvida', icon: '❓', color: '#2563eb', bg: 'rgba(37,99,235,0.09)', border: 'rgba(37,99,235,0.28)' },
        dicas: { label: 'Dica', icon: '💡', color: '#16a34a', bg: 'rgba(22,163,74,0.09)', border: 'rgba(22,163,74,0.28)' },
        experiencias: { label: 'Experiência', icon: '🌟', color: '#d97706', bg: 'rgba(217,119,6,0.09)', border: 'rgba(217,119,6,0.30)' },
    };

    // ── Likes (localStorage) ──────────────────────────────────────────────────
    const LIKES_KEY = 'cocoRootPostLikes';
    const readLikes = () => { try { return JSON.parse(localStorage.getItem(LIKES_KEY) || '{}'); } catch { return {}; } };
    const writeLikes = (obj) => localStorage.setItem(LIKES_KEY, JSON.stringify(obj));
    const isLiked = (id) => !!readLikes()[String(id)];
    const toggleLike = (id) => {
        const likes = readLikes();
        const key = String(id);
        if (likes[key]) { delete likes[key]; writeLikes(likes); return false; }
        likes[key] = true; writeLikes(likes); return true;
    };
    const getEffectiveLikes = (post) => {
        const base = Number(post.likes || post.curtidas || 0);
        return isLiked(post.id) ? base + 1 : base;
    };

    // ── Helpers ───────────────────────────────────────────────────────────────
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

    const isNewPost = (post) => (Date.now() - new Date(post?.data || 0).getTime()) < 24 * 60 * 60 * 1000;
    const isTrendingPost = (post) => Number(post.likes || 0) >= 10 || Number(post.comentarios || 0) >= 10;

    const normalizeSearch = (str) =>
        String(str || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

    // ── Filter + Sort ─────────────────────────────────────────────────────────
    const getFilteredSorted = () => {
        let list = allPosts.slice();
        if (currentCategory !== 'todos') list = list.filter((p) => p.categoria === currentCategory);
        if (searchQuery.trim()) {
            const q = normalizeSearch(searchQuery.trim());
            list = list.filter((p) =>
                normalizeSearch(p.titulo).includes(q) ||
                normalizeSearch(p.conteudo).includes(q) ||
                normalizeSearch(p.autor?.nome).includes(q)
            );
        }
        if (currentSort === 'recentes') {
            list.sort((a, b) => new Date(b.data || 0).getTime() - new Date(a.data || 0).getTime());
        } else if (currentSort === 'populares') {
            list.sort((a, b) =>
                (Number(b.likes || 0) + Number(b.comentarios || 0) * 2) -
                (Number(a.likes || 0) + Number(a.comentarios || 0) * 2)
            );
        } else if (currentSort === 'sem-resposta') {
            list.sort((a, b) => {
                const aHas = Number(a.comentarios || 0) > 0 ? 1 : 0;
                const bHas = Number(b.comentarios || 0) > 0 ? 1 : 0;
                if (aHas !== bHas) return aHas - bHas;
                return new Date(b.data || 0).getTime() - new Date(a.data || 0).getTime();
            });
        }
        return list;
    };

    // ── Skeleton ──────────────────────────────────────────────────────────────
    const renderSkeleton = () => {
        if (!postsRoot) return;
        postsRoot.innerHTML = Array.from({ length: 5 }, () => `
            <div class="community-post skel-post" aria-hidden="true">
                <div class="post-link-wrap">
                    <div class="skel-avatar skel-pulse"></div>
                    <div class="post-body" style="gap:8px;">
                        <div class="skel-line skel-pulse" style="width:38%;height:11px;"></div>
                        <div class="skel-line skel-pulse" style="width:76%;height:16px;margin-top:2px;"></div>
                        <div class="skel-line skel-pulse" style="width:55%;height:11px;"></div>
                        <div class="skel-line skel-pulse" style="width:28%;height:10px;margin-top:6px;"></div>
                    </div>
                </div>
                <div style="width:52px;border-left:1px solid rgba(27,27,27,0.07);"></div>
            </div>`).join('');
    };

    // ── Stats ─────────────────────────────────────────────────────────────────
    const renderStats = (posts) => {
        if (!statsRoot) return;
        const c = {
            todos: posts.length,
            duvidas: posts.filter((p) => p.categoria === 'duvidas').length,
            dicas: posts.filter((p) => p.categoria === 'dicas').length,
            experiencias: posts.filter((p) => p.categoria === 'experiencias').length,
        };
        statsRoot.innerHTML = `
            <div class="cstat-item">
                <span class="cstat-icon" aria-hidden="true">💬</span>
                <div class="cstat-body"><span class="cstat-num">${c.todos}</span><span class="cstat-label">Publicações</span></div>
            </div>
            <div class="cstat-item cstat-duvidas">
                <span class="cstat-icon" aria-hidden="true">❓</span>
                <div class="cstat-body"><span class="cstat-num">${c.duvidas}</span><span class="cstat-label">Dúvidas</span></div>
            </div>
            <div class="cstat-item cstat-dicas">
                <span class="cstat-icon" aria-hidden="true">💡</span>
                <div class="cstat-body"><span class="cstat-num">${c.dicas}</span><span class="cstat-label">Dicas</span></div>
            </div>
            <div class="cstat-item cstat-experiencias">
                <span class="cstat-icon" aria-hidden="true">🌟</span>
                <div class="cstat-body"><span class="cstat-num">${c.experiencias}</span><span class="cstat-label">Experiências</span></div>
            </div>
        `;
    };

    // ── Posts ─────────────────────────────────────────────────────────────────
    const renderPosts = () => {
        if (!postsRoot) return;
        const list = getFilteredSorted();
        if (list.length === 0) {
            postsRoot.innerHTML = `
                <div class="community-empty">
                    <span class="community-empty-icon" aria-hidden="true">📭</span>
                    <div class="community-empty-text">${searchQuery.trim() ? 'Nenhum resultado para essa pesquisa.' : 'Sem publicações nesta categoria.'}</div>
                    <div class="community-empty-sub">${searchQuery.trim() ? 'Tenta com outros termos.' : 'Sê o primeiro a partilhar!'}</div>
                </div>`;
            return;
        }

        postsRoot.innerHTML = list.map((post) => {
            const cat = CAT_META[post.categoria] || { label: 'Outro', icon: '💬', color: '#6b7280', bg: 'rgba(107,114,128,0.09)', border: 'rgba(107,114,128,0.24)' };
            const author = String(post?.autor?.nome || 'Utilizador');
            const initials = getInitials(author);
            const timeText = formatRelativeTime(post?.data);
            const replies = Number(post?.comentarios ?? post?.respostas ?? 0);
            const likeCount = getEffectiveLikes(post);
            const liked = isLiked(post.id);
            const newPost = isNewPost(post);
            const trending = isTrendingPost(post);
            const rawExcerpt = String(post.conteudo || '').trim();
            const excerpt = rawExcerpt.length > 160 ? `${rawExcerpt.slice(0, 160).trim()}…` : rawExcerpt;
            return `
                <div class="community-post cat-${post.categoria || 'outros'}${trending ? ' post-trending' : ''}">
                    <a class="post-link-wrap" href="comunidade-post.html?id=${post.id}" aria-label="Ver: ${post.titulo || ''}">
                        <div class="post-avatar" aria-hidden="true" style="background:${cat.color};">${initials}</div>
                        <div class="post-body">
                            <div class="post-meta-row">
                                <span class="post-author">${author}</span>
                                <span class="post-badge" style="background:${cat.bg};border-color:${cat.border};color:${cat.color};">
                                    <span aria-hidden="true">${cat.icon}</span> ${cat.label}
                                </span>
                                ${newPost ? '<span class="post-new-badge">Novo</span>' : ''}
                                ${trending ? '<span class="post-trending-badge">🔥 Em destaque</span>' : ''}
                                ${timeText ? `<span class="post-time">${timeText}</span>` : ''}
                            </div>
                            <div class="post-title">${post.titulo || 'Sem título'}</div>
                            ${excerpt ? `<div class="post-excerpt">${excerpt}</div>` : ''}
                            <div class="post-footer">
                                <span class="post-replies">
                                    <span aria-hidden="true">💬</span>
                                    ${replies === 0 ? 'Sem respostas' : `${replies} resposta${replies !== 1 ? 's' : ''}`}
                                </span>
                                <span class="post-read-more">Ler mais →</span>
                            </div>
                        </div>
                    </a>
                    <button type="button" class="post-like-btn${liked ? ' is-liked' : ''}"
                        data-post-id="${post.id}"
                        aria-label="${liked ? 'Remover gosto' : 'Dar gosto'}"
                        aria-pressed="${liked}">
                        <span class="heart-icon" aria-hidden="true">${liked ? '♥' : '♡'}</span>
                        <span class="post-like-count">${likeCount}</span>
                    </button>
                </div>`;
        }).join('');

        postsRoot.querySelectorAll('.post-like-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const id = btn.dataset.postId;
                const nowLiked = toggleLike(id);
                const post = allPosts.find((p) => String(p.id) === String(id));
                if (!post) return;
                const newCount = getEffectiveLikes(post);
                btn.classList.toggle('is-liked', nowLiked);
                btn.setAttribute('aria-pressed', String(nowLiked));
                btn.setAttribute('aria-label', nowLiked ? 'Remover gosto' : 'Dar gosto');
                btn.querySelector('.post-like-count').textContent = String(newCount);
                const heart = btn.querySelector('.heart-icon');
                if (heart) heart.textContent = nowLiked ? '♥' : '♡';
                btn.classList.add('like-pulse');
                setTimeout(() => btn.classList.remove('like-pulse'), 300);
            });
        });
    };

    // ── Publish form ──────────────────────────────────────────────────────────
    const publishToggleBtn = document.getElementById('publish-toggle-btn');
    const publishFormSection = document.getElementById('publish-form-section');
    const publishForm = document.getElementById('community-publish-form');
    const publishCancelBtn = document.getElementById('publish-cancel-btn');
    const publishSubmitBtn = document.getElementById('publish-submit-btn');
    const publishErrorEl = document.getElementById('publish-error');
    const conteudoTextarea = document.getElementById('publish-conteudo');
    const charCounter = document.getElementById('publish-char-counter');

    const MAX_CHARS = 1200;

    const setError = (message) => {
        if (!errorBox) return;
        errorBox.hidden = !message;
        errorBox.textContent = message || '';
    };

    const setPublishError = (message) => {
        if (!publishErrorEl) return;
        publishErrorEl.hidden = !message;
        publishErrorEl.textContent = message || '';
    };

    const updateCharCounter = () => {
        if (!charCounter || !conteudoTextarea) return;
        const len = conteudoTextarea.value.length;
        charCounter.textContent = `${len} / ${MAX_CHARS}`;
        charCounter.classList.toggle('char-limit-near', len > MAX_CHARS * 0.8 && len < MAX_CHARS);
        charCounter.classList.toggle('char-limit-over', len >= MAX_CHARS);
    };

    conteudoTextarea?.addEventListener('input', updateCharCounter);

    const openPublishForm = () => {
        const user = api.getLoggedUser();
        if (!user?.id) {
            setError('Precisas de iniciar sessão para participar na comunidade.');
            if (window.CocoRootToast) window.CocoRootToast('Comunidade', 'Inicia sessão para publicar');
            return;
        }
        if (publishFormSection) publishFormSection.hidden = false;
        if (publishToggleBtn) publishToggleBtn.hidden = true;
        updateCharCounter();
        document.getElementById('publish-titulo')?.focus();
    };

    const closePublishForm = () => {
        if (publishFormSection) publishFormSection.hidden = true;
        if (publishToggleBtn) publishToggleBtn.hidden = false;
        if (publishForm) publishForm.reset();
        updateCharCounter();
        setPublishError('');
    };

    publishToggleBtn?.addEventListener('click', openPublishForm);
    publishCancelBtn?.addEventListener('click', closePublishForm);

    publishForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = api.getLoggedUser();
        if (!user?.id) { setPublishError('Precisas de iniciar sessão para publicar.'); return; }

        const titulo = String(document.getElementById('publish-titulo')?.value || '').trim();
        const conteudo = String(conteudoTextarea?.value || '').trim();
        const categoria = String(document.getElementById('publish-categoria')?.value || 'outros');

        if (!titulo) { setPublishError('O título é obrigatório.'); return; }
        if (!conteudo) { setPublishError('O conteúdo é obrigatório.'); return; }
        if (conteudo.length > MAX_CHARS) { setPublishError(`O conteúdo não pode ter mais de ${MAX_CHARS} caracteres.`); return; }

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
            const apiPosts = Array.isArray(response?.data) ? response.data : [];
            allPosts = apiPosts.length > 0 ? apiPosts : SEED_POSTS;
            renderStats(allPosts);
            renderPosts();
        } catch (err) {
            setPublishError(err.message || 'Não foi possível publicar.');
        } finally {
            if (publishSubmitBtn) publishSubmitBtn.disabled = false;
        }
    });

    // ── Tabs ──────────────────────────────────────────────────────────────────
    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            currentCategory = tab.dataset.cat;
            tabs.forEach((t) => t.classList.toggle('active', t.dataset.cat === currentCategory));
            renderPosts();
        });
    });

    // ── Sort ──────────────────────────────────────────────────────────────────
    sortBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            currentSort = btn.dataset.sort;
            sortBtns.forEach((b) => b.classList.toggle('active', b.dataset.sort === currentSort));
            renderPosts();
        });
    });

    // ── Search ────────────────────────────────────────────────────────────────
    let searchTimeout;
    searchInput?.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchQuery = searchInput.value;
            renderPosts();
        }, 220);
    });

    // ── Initial load ──────────────────────────────────────────────────────────
    renderSkeleton();
    try {
        const response = await api.fetchJson('forum/listar');
        const apiPosts = Array.isArray(response?.data) ? response.data : [];
        allPosts = apiPosts.length > 0 ? apiPosts : SEED_POSTS;
        renderStats(allPosts);
        renderPosts();
        setError('');
    } catch {
        allPosts = SEED_POSTS;
        renderStats(allPosts);
        renderPosts();
    }
});
