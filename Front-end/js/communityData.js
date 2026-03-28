(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.CocoCommunityData = factory();
    }
})(typeof window !== 'undefined' ? window : globalThis, function () {
    const STORAGE_KEY = 'cocoroot.community.v1';

    function safeParse(json, fallback) {
        try {
            return JSON.parse(json);
        } catch {
            return fallback;
        }
    }

    function nowIso() {
        return new Date().toISOString();
    }

    function seed() {
        const now = Date.now();
        const base = [
            {
                id: 'p1',
                title: 'Como escolher a fibra de coco ideal para iniciar?',
                body: 'Quais critérios vocês usam para selecionar fibra de coco para início de cultivo? Procuro algo com boa drenagem e consistência.',
                authorName: 'Rita',
                tabKey: 'recentes',
                createdAt: new Date(now - 1000 * 60 * 40).toISOString(),
            },
            {
                id: 'p2',
                title: 'Dúvida: como controlar a humidade sem sensores?',
                body: 'Ainda não tenho sensores. Vocês têm um método prático para estimar humidade e evitar excesso de rega?',
                authorName: 'Paulo',
                tabKey: 'recentes',
                createdAt: new Date(now - 1000 * 60 * 160).toISOString(),
            },
            {
                id: 'p3',
                title: 'Experiência: meu primeiro ciclo em fibra de coco',
                body: 'Partilho o que funcionou e o que eu faria diferente no próximo ciclo. Aceito sugestões para melhorar a produtividade.',
                authorName: 'Marta',
                tabKey: 'seguindo',
                createdAt: new Date(now - 1000 * 60 * 60 * 18).toISOString(),
            },
            {
                id: 'p4',
                title: 'Em alta: nutrientes e pH — guia rápido',
                body: 'Vamos falar de nutrientes e pH. Quais ajustes vocês fazem quando notam folhas amareladas?',
                authorName: 'Tiago',
                tabKey: 'em-alta',
                createdAt: new Date(now - 1000 * 60 * 60 * 30).toISOString(),
            },
            {
                id: 'p5',
                title: 'Dicas para organizar tarefas semanais',
                body: 'Como vocês planeiam tarefas (rega, limpeza, medição) para não se perderem? Uso checklist, mas ainda falho prazos.',
                authorName: 'Sofia',
                tabKey: 'recentes',
                createdAt: new Date(now - 1000 * 60 * 60 * 44).toISOString(),
            },
            {
                id: 'p6',
                title: 'Seguidores: melhores práticas de ventilação',
                body: 'Estou a melhorar a ventilação do ambiente. O que priorizar para reduzir fungos e manter estabilidade?',
                authorName: 'Nuno',
                tabKey: 'seguindo',
                createdAt: new Date(now - 1000 * 60 * 60 * 62).toISOString(),
            },
            {
                id: 'p7',
                title: 'Em alta: erros comuns no arranque',
                body: 'Quais os 3 erros mais comuns que vocês veem em quem começa? Quero evitar retrabalho e desperdício de água.',
                authorName: 'Carla',
                tabKey: 'em-alta',
                createdAt: new Date(now - 1000 * 60 * 60 * 90).toISOString(),
            },
        ];

        const replies = {
            p1: [
                {
                    id: 'r1',
                    postId: 'p1',
                    body: 'Eu começo verificando a granulometria e a capacidade de retenção. Se possível, faço um teste pequeno com uma planta antes de comprar em volume.',
                    authorName: 'Andreia',
                    createdAt: new Date(now - 1000 * 60 * 12).toISOString(),
                },
            ],
            p4: [
                {
                    id: 'r2',
                    postId: 'p4',
                    body: 'Quando vejo amarelecimento, primeiro confirmo pH e depois ajusto a solução gradualmente. Evito mudanças bruscas para não estressar a planta.',
                    authorName: 'João',
                    createdAt: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
                },
                {
                    id: 'r3',
                    postId: 'p4',
                    body: 'Uma coisa que ajudou foi padronizar medição e anotar tudo. Com histórico, fica fácil ver se é tendência ou caso isolado.',
                    authorName: 'Rita',
                    createdAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
                },
            ],
            p7: [
                {
                    id: 'r4',
                    postId: 'p7',
                    body: 'Erro 1: rega sem critério; 2: não medir pH; 3: não observar sinais visuais. Acompanhar de perto no início faz muita diferença.',
                    authorName: 'Marta',
                    createdAt: new Date(now - 1000 * 60 * 60 * 12).toISOString(),
                },
            ],
        };

        return { posts: base, replies };
    }

    function loadState() {
        if (typeof localStorage === 'undefined') {
            return seed();
        }
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            const initial = seed();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
            return initial;
        }
        const parsed = safeParse(raw, null);
        if (!parsed || !Array.isArray(parsed.posts) || typeof parsed.replies !== 'object') {
            const initial = seed();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
            return initial;
        }
        return parsed;
    }

    function saveState(state) {
        if (typeof localStorage === 'undefined') return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function getReplyCount(state, postId) {
        const list = state.replies[postId];
        return Array.isArray(list) ? list.length : 0;
    }

    function getPosts() {
        const state = loadState();
        return state.posts.map((p) => ({
            ...p,
            replyCount: getReplyCount(state, p.id),
        }));
    }

    function getPostById(postId) {
        const state = loadState();
        const post = state.posts.find((p) => p.id === postId) || null;
        if (!post) return null;
        return { ...post, replyCount: getReplyCount(state, post.id) };
    }

    function getReplies(postId) {
        const state = loadState();
        const list = state.replies[postId];
        const safe = Array.isArray(list) ? list : [];
        return safe.slice().sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    function addReply(postId, body, authorName) {
        const trimmed = (body || '').trim();
        if (!trimmed) {
            return { ok: false, error: 'Resposta vazia.' };
        }
        const state = loadState();
        const exists = state.posts.some((p) => p.id === postId);
        if (!exists) {
            return { ok: false, error: 'Post não encontrado.' };
        }

        const reply = {
            id: `r_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`,
            postId,
            body: trimmed,
            authorName: (authorName || 'Você').trim() || 'Você',
            createdAt: nowIso(),
        };

        const list = state.replies[postId];
        if (!Array.isArray(list)) {
            state.replies[postId] = [reply];
        } else {
            state.replies[postId] = list.concat(reply);
        }
        saveState(state);
        return { ok: true, reply };
    }

    function queryPosts(params) {
        const state = loadState();
        const tab = (params && params.tab) || 'recentes';
        const q = ((params && params.q) || '').trim().toLowerCase();
        const sort = (params && params.sort) || 'recent';
        const offset = Math.max(0, Number((params && params.offset) || 0) || 0);
        const limit = Math.max(1, Number((params && params.limit) || 6) || 6);

        let list = state.posts.slice();
        if (tab) {
            list = list.filter((p) => p.tabKey === tab);
        }
        if (q) {
            list = list.filter((p) => {
                const hay = `${p.title} ${p.body} ${p.authorName}`.toLowerCase();
                return hay.includes(q);
            });
        }

        const withCounts = list.map((p) => ({ ...p, replyCount: getReplyCount(state, p.id) }));

        const sorted = withCounts.sort((a, b) => {
            if (sort === 'replies') {
                if (b.replyCount !== a.replyCount) return b.replyCount - a.replyCount;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        const page = sorted.slice(offset, offset + limit);
        return {
            total: sorted.length,
            items: page,
            hasMore: offset + limit < sorted.length,
        };
    }

    function getTabCounts() {
        const posts = getPosts();
        const counts = { recentes: 0, 'em-alta': 0, seguindo: 0 };
        for (const p of posts) {
            if (Object.prototype.hasOwnProperty.call(counts, p.tabKey)) {
                counts[p.tabKey] += 1;
            }
        }
        return counts;
    }

    function getTotals() {
        const state = loadState();
        let replies = 0;
        for (const k of Object.keys(state.replies)) {
            const list = state.replies[k];
            if (Array.isArray(list)) replies += list.length;
        }
        return { posts: state.posts.length, replies };
    }

    return {
        getPosts,
        getPostById,
        getReplies,
        addReply,
        queryPosts,
        getTabCounts,
        getTotals,
    };
});
