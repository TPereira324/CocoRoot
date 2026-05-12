document.addEventListener('DOMContentLoaded', async () => {
    const api = window.CocoRootApi;
    if (!api) return;

    const statsRoot = document.getElementById('community-stats');
    const postsRoot = document.getElementById('posts');
    const errorBox = document.getElementById('community-error');
    const searchInput = document.getElementById('community-search');
    const tabs = Array.from(document.querySelectorAll('.tab[data-cat]'));
    const sortBtns = Array.from(document.querySelectorAll('.sort-pill[data-sort]'));

    let allPosts = [];
    let currentCategory = 'todos';
    let currentSort = 'recentes';
    let searchQuery = '';
    const cacheKey = (() => {
        const user = api.getLoggedUser();
        const uid = user?.id ? String(user.id) : 'anon';
        return `cocoRootCommunityCache:${uid}`;
    })();

    const SEED_POSTS = [
        {
            id: 'seed-1',
            titulo: 'Manchas brancas no substrato — fungo ou misélio?',
            conteudo: 'Há 3 dias comecei a notar manchas brancas na fibra de coco. As plantas (tomate) ainda parecem saudáveis, mas estou preocupado. Alguém já passou por isto? Vale a pena tratar com peróxido de hidrogénio diluído ou é melhor trocar o substrato?',
            categoria: 'duvidas',
            autor: { nome: 'Miguel Ferreira' },
            data: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            comentarios: 7,
            likes: 3,
        },
        {
            id: 'seed-2',
            titulo: 'Dica: lavar bem a fibra antes de usar poupa muito trabalho depois',
            conteudo: 'A fibra de coco pode trazer sais acumulados. Se não lavares antes de usar, as raízes podem sofrer logo no arranque. Eu lavo 2–3 vezes até a água de saída estabilizar e só depois ajusto pH/EC.',
            categoria: 'dicas',
            autor: { nome: 'Ana Costa' },
            data: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
            comentarios: 12,
            likes: 24,
        },
        {
            id: 'seed-3',
            titulo: 'Primeira colheita de tomate cherry em coco — 4.2 kg por planta',
            conteudo: 'Depois de 3 meses a acompanhar pelo CocoRoot, consegui a minha primeira colheita de tomate cherry em fibra de coco. A monitorização de pH e EC fez diferença. Os frutos ficaram mais consistentes e doces do que no solo.',
            categoria: 'experiencias',
            autor: { nome: 'João Rodrigues' },
            data: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            comentarios: 19,
            likes: 41,
        },
        {
            id: 'seed-4',
            titulo: 'Gotejadores a entupir no coco — como evitam?',
            conteudo: 'Estou a usar rega por gotejamento e noto entupimentos frequentes (sobretudo quando faço fertirrega). Que filtros/rotinas usam? Fazem descarga semanal? Estou a tentar manter tudo simples e evitar avarias.',
            categoria: 'duvidas',
            autor: { nome: 'Pedro Alves' },
            data: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            comentarios: 4,
            likes: 9,
        },
        {
            id: 'seed-5',
            titulo: 'Como reutilizar a fibra de coco no 2.º e 3.º ciclo',
            conteudo: 'Depois de um ciclo, não mando a fibra fora. Faço uma limpeza, deixo secar bem e volto a ajustar pH/EC antes de reutilizar. Já vou no 3.º ciclo com bons resultados e menos custos.',
            categoria: 'dicas',
            autor: { nome: 'Carla Santos' },
            data: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            comentarios: 5,
            likes: 33,
        },
        {
            id: 'seed-6',
            titulo: 'Morango em fibra de coco — dois anos de experiência real',
            conteudo: 'Cultivo morangos em coco há 2 anos e a gestão da rega é o mais crítico. O coco seca rápido e o morango é sensível a variações. Com regas curtas e frequentes, a consistência melhorou muito.',
            categoria: 'experiencias',
            autor: { nome: 'Susana Lima' },
            data: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            comentarios: 22,
            likes: 56,
        },
    ];

    const CAT_META = {
        duvidas: { label: 'Dúvida', color: '#2563eb', bg: 'rgba(37,99,235,0.09)', border: 'rgba(37,99,235,0.28)' },
        dicas: { label: 'Dica', color: '#16a34a', bg: 'rgba(22,163,74,0.09)', border: 'rgba(22,163,74,0.28)' },
        experiencias: { label: 'Experiência', color: '#d97706', bg: 'rgba(217,119,6,0.09)', border: 'rgba(217,119,6,0.30)' },
    };

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

    const HIDDEN_KEY = 'cocoRootHiddenPosts';
    const getHiddenKey = () => {
        const user = api.getLoggedUser();
        const userId = user?.id ? String(user.id) : 'anon';
        return `${HIDDEN_KEY}:${userId}`;
    };
    const readHidden = () => {
        try { return JSON.parse(localStorage.getItem(getHiddenKey()) || '[]'); } catch { return []; }
    };
    const writeHidden = (ids) => {
        try { localStorage.setItem(getHiddenKey(), JSON.stringify(Array.from(new Set(ids.map(String))))); } catch { }
    };
    const hidePostLocal = (id) => {
        const ids = readHidden();
        ids.push(String(id));
        writeHidden(ids);
    };
    const isHidden = (id) => readHidden().includes(String(id));

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

    const normalizeCategory = (post) => {
        const raw = String(post?.categoria ?? post?.category ?? post?.tipo ?? '').trim();
        const base = normalizeSearch(raw);
        if (base.includes('duvid')) return 'duvidas';
        if (base.includes('dica')) return 'dicas';
        if (base.includes('exper')) return 'experiencias';
        if (base.includes('hist')) return 'experiencias';
        if (base.includes('outro')) {
        } else if (raw) {
        }

        const titulo = normalizeSearch(post?.titulo);
        const conteudo = normalizeSearch(post?.conteudo);
        const text = `${titulo} ${conteudo}`;

        if (text.includes('dica:') || text.includes('dica ') || text.includes('dicas ')) return 'dicas';
        if (text.includes('experienc') || text.includes('experiência') || text.includes('resultado') || text.includes('colheita')) return 'experiencias';
        if (String(post?.titulo || '').includes('?') || text.includes('ajuda') || text.includes('como ') || text.includes('qual ') || text.includes('problema')) return 'duvidas';
        return 'duvidas';
    };

    const normalizePosts = (posts) => {
        const list = Array.isArray(posts) ? posts : [];
        return list.map((p) => ({ ...p, categoria: normalizeCategory(p) }));
    };

    const getPostAuthorId = (post) => {
        const raw = post?.autor?.id ?? post?.autor_id ?? post?.ut_id ?? post?.usuario_id ?? post?.user_id ?? null;
        return raw == null ? '' : String(raw);
    };

    const getFilteredSorted = () => {
        let list = allPosts.slice().filter((p) => !isHidden(p?.id));
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

    const readCache = () => {
        try {
            const raw = localStorage.getItem(cacheKey);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object') return null;
            if (Date.now() - Number(parsed.ts || 0) > 5 * 60 * 1000) return null;
            return parsed;
        } catch {
            return null;
        }
    };

    const writeCache = (posts) => {
        try { localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), posts: Array.isArray(posts) ? posts : [] })); } catch { }
    };

    const renderStats = (posts) => {
        if (!statsRoot) return;
        const visible = (Array.isArray(posts) ? posts : []).filter((p) => !isHidden(p?.id));
        const c = {
            todos: visible.length,
            duvidas: visible.filter((p) => p.categoria === 'duvidas').length,
            dicas: visible.filter((p) => p.categoria === 'dicas').length,
            experiencias: visible.filter((p) => p.categoria === 'experiencias').length,
        };
        statsRoot.innerHTML = `
            <div class="cstat-item">
                <div class="cstat-body"><span class="cstat-num">${c.todos}</span><span class="cstat-label">Publicações</span></div>
            </div>
            <div class="cstat-item cstat-duvidas">
                <div class="cstat-body"><span class="cstat-num">${c.duvidas}</span><span class="cstat-label">Dúvidas</span></div>
            </div>
            <div class="cstat-item cstat-dicas">
                <div class="cstat-body"><span class="cstat-num">${c.dicas}</span><span class="cstat-label">Dicas</span></div>
            </div>
            <div class="cstat-item cstat-experiencias">
                <div class="cstat-body"><span class="cstat-num">${c.experiencias}</span><span class="cstat-label">Experiências</span></div>
            </div>
        `;
    };

    const deletePost = async (postId) => {
        if (!confirm('Tem a certeza que deseja apagar esta publicação? Esta ação não pode ser desfeita.')) {
            return;
        }

        const user = api.getLoggedUser();
        if (!user?.id) {
            setError('Precisas de iniciar sessão.');
            return;
        }

        const idStr = String(postId);
        hidePostLocal(idStr);
        allPosts = allPosts.filter((p) => String(p.id) !== idStr);
        renderStats(allPosts);
        renderPosts();

        const payload = JSON.stringify({ ut_id: user.id });

        const tryDelete = async () => {
            await api.fetchJsonDelete(`forum/deletarPublicacao/${idStr}`, { body: payload });
            return true;
        };

        const tryPostFallback = async () => {
            await api.fetchJson(`forum/deletarPublicacao/${idStr}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: payload,
            });
            return true;
        };

        try {
            await tryDelete();
            setError('');
        } catch (error) {
            try {
                await tryPostFallback();
                setError('');
            } catch {
                setError('Não foi possível apagar no servidor (mas já não aparece para ti).');
            }
        }
    };

    const renderPosts = () => {
        if (!postsRoot) return;
        const list = getFilteredSorted();
        const user = api.getLoggedUser();

        if (list.length === 0) {
            postsRoot.innerHTML = `
                <div class="community-empty">
                    <div class="community-empty-text">${searchQuery.trim() ? 'Nenhum resultado para essa pesquisa.' : 'Sem publicações nesta categoria.'}</div>
                    <div class="community-empty-sub">${searchQuery.trim() ? 'Tenta com outros termos.' : 'Sê o primeiro a partilhar!'}</div>
                </div>`;
            return;
        }

        postsRoot.innerHTML = list.map((post) => {
            const cat = CAT_META[post.categoria] || { label: 'Outro', color: '#6b7280', bg: 'rgba(107,114,128,0.09)', border: 'rgba(107,114,128,0.24)' };
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
            const isAuthor = user?.id && String(user.id) === getPostAuthorId(post);

            return `
                <div class="community-post cat-${post.categoria || 'outros'}${trending ? ' post-trending' : ''}">
                    <a class="post-link-wrap" href="comunidade-post.html?id=${post.id}" aria-label="Ver: ${post.titulo || ''}">
                        <div class="post-avatar" aria-hidden="true" style="background:${cat.color};">${initials}</div>
                        <div class="post-body">
                            <div class="post-meta-row">
                                <span class="post-author">${author}</span>
                                <span class="post-badge" style="background:${cat.bg};border-color:${cat.border};color:${cat.color};">
                                    ${cat.label}
                                </span>
                                ${newPost ? '<span class="post-new-badge">Novo</span>' : ''}
                                ${trending ? '<span class="post-trending-badge">Em destaque</span>' : ''}
                                ${timeText ? `<span class="post-time">${timeText}</span>` : ''}
                            </div>
                            <div class="post-title">${post.titulo || 'Sem título'}</div>
                            ${excerpt ? `<div class="post-excerpt">${excerpt}</div>` : ''}
                            <div class="post-footer">
                                <span class="post-replies">
                                    ${replies === 0 ? 'Sem respostas' : `${replies} resposta${replies !== 1 ? 's' : ''}`}
                                </span>
                                <span class="post-read-more">Ler mais →</span>
                            </div>
                        </div>
                    </a>
                    <div class="post-actions">
                        <button type="button" class="post-like-btn${liked ? ' is-liked' : ''}"
                            data-post-id="${post.id}"
                            aria-label="${liked ? 'Remover gosto' : 'Dar gosto'}"
                            aria-pressed="${liked}">
                            <span class="post-like-text">${liked ? 'Gostaste' : 'Gostar'}</span>
                            <span class="post-like-count">(${likeCount})</span>
                        </button>
                        ${isAuthor ? `<button type="button" class="post-delete-btn" data-post-id="${post.id}" aria-label="Apagar publicação" title="Apagar">Apagar</button>` : ''}
                    </div>
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
                btn.querySelector('.post-like-count').textContent = `(${newCount})`;
                const textEl = btn.querySelector('.post-like-text');
                if (textEl) textEl.textContent = nowLiked ? 'Gostaste' : 'Gostar';
                btn.classList.add('like-pulse');
                setTimeout(() => btn.classList.remove('like-pulse'), 300);
            });
        });

        postsRoot.querySelectorAll('.post-delete-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = btn.dataset.postId;
                deletePost(id);
            });
        });
    };

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
        const categoria = String(document.getElementById('publish-categoria')?.value || 'duvidas');

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
            const normalizedApi = normalizePosts(apiPosts);
            allPosts = normalizedApi.length > 0 ? normalizedApi : SEED_POSTS;
            renderStats(allPosts);
            renderPosts();
        } catch (err) {
            setPublishError(err.message || 'Não foi possível publicar.');
        } finally {
            if (publishSubmitBtn) publishSubmitBtn.disabled = false;
        }
    });

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            currentCategory = tab.dataset.cat;
            tabs.forEach((t) => t.classList.toggle('active', t.dataset.cat === currentCategory));
            renderPosts();
        });
    });

    sortBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            currentSort = btn.dataset.sort;
            sortBtns.forEach((b) => b.classList.toggle('active', b.dataset.sort === currentSort));
            renderPosts();
        });
    });

    let searchTimeout;
    searchInput?.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchQuery = searchInput.value;
            renderPosts();
        }, 220);
    });

    renderSkeleton();
    const cached = readCache();
    if (cached?.posts) {
        allPosts = normalizePosts(Array.isArray(cached.posts) ? cached.posts : []);
        renderStats(allPosts);
        renderPosts();
    }
    try {
        const response = await api.fetchJson('forum/listar');
        const apiPosts = Array.isArray(response?.data) ? response.data : [];
        const normalizedApi = normalizePosts(apiPosts);
        allPosts = normalizedApi.length > 0 ? normalizedApi : SEED_POSTS;
        renderStats(allPosts);
        renderPosts();
        setError('');
        writeCache(allPosts);
    } catch {
        allPosts = SEED_POSTS;
        renderStats(allPosts);
        renderPosts();
    }
});
