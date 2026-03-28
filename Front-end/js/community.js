(function () {
    const api = typeof CocoCommunityData !== 'undefined' ? CocoCommunityData : null;
    if (!api) return;

    function formatDate(iso) {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return '';
        return d.toLocaleDateString('pt-PT', { year: '2-digit', month: '2-digit', day: '2-digit' });
    }

    function el(tag, className) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        return node;
    }

    function setText(node, text) {
        node.textContent = text;
        return node;
    }

    function getQueryParam(name) {
        const url = new URL(window.location.href);
        return url.searchParams.get(name);
    }

    function showBanner(bannerEl, message) {
        if (!bannerEl) return;
        if (!message) {
            bannerEl.style.display = 'none';
            bannerEl.textContent = '';
            return;
        }
        bannerEl.style.display = '';
        bannerEl.textContent = message;
    }

    function debounce(fn, wait) {
        let t = null;
        return function (...args) {
            if (t) window.clearTimeout(t);
            t = window.setTimeout(() => fn.apply(this, args), wait);
        };
    }

    function renderPostRow(container, post) {
        const card = el('a', 'card border-0 shadow-sm post-card text-decoration-none');
        card.href = `post.html?id=${encodeURIComponent(post.id)}`;

        const body = el('div', 'card-body');
        const title = el('div', 'h5 mb-1 text-dark');
        setText(title, post.title);
        const meta = el('div', 'text-muted small mb-2 d-flex flex-wrap gap-2');
        const metaAuthor = el('span');
        setText(metaAuthor, post.authorName);
        const metaSep = el('span');
        setText(metaSep, '•');
        const metaDate = el('span');
        setText(metaDate, formatDate(post.createdAt));
        const metaReplies = el('span', 'badge text-bg-light text-dark ms-auto');
        setText(metaReplies, `${post.replyCount} respostas`);

        meta.append(metaAuthor, metaSep, metaDate, metaReplies);

        const excerpt = el('div', 'text-muted');
        setText(excerpt, post.body);
        excerpt.style.display = '-webkit-box';
        excerpt.style.webkitLineClamp = '3';
        excerpt.style.webkitBoxOrient = 'vertical';
        excerpt.style.overflow = 'hidden';

        body.append(title, meta, excerpt);
        card.append(body);
        container.append(card);
    }

    function renderSkeletonList(container, count) {
        container.innerHTML = '';
        for (let i = 0; i < count; i += 1) {
            const card = el('div', 'card border-0 shadow-sm');
            const body = el('div', 'card-body');
            const ph = el('div', 'placeholder-glow');

            const line1 = el('span', 'placeholder col-8');
            const line2 = el('span', 'placeholder col-4');
            const line3 = el('span', 'placeholder col-11');
            const line4 = el('span', 'placeholder col-9');

            ph.append(line1, el('span', 'placeholder col-12 d-block'), line2, el('span', 'placeholder col-12 d-block'), line3, el('span', 'placeholder col-12 d-block'), line4);
            body.append(ph);
            card.append(body);
            container.append(card);
        }
    }

    function initDashboard() {
        const totals = api.getTotals();
        const postsCountEl = document.getElementById('dash-posts-count');
        const repliesCountEl = document.getElementById('dash-replies-count');
        if (postsCountEl) postsCountEl.textContent = String(totals.posts);
        if (repliesCountEl) repliesCountEl.textContent = String(totals.replies);

        const latestEl = document.getElementById('dash-latest-posts');
        const emptyEl = document.getElementById('dash-latest-empty');
        if (!latestEl) return;

        const res = api.queryPosts({ tab: 'recentes', q: '', sort: 'recent', offset: 0, limit: 3 });
        latestEl.innerHTML = '';
        if (!res.items.length) {
            if (emptyEl) emptyEl.style.display = '';
            return;
        }
        if (emptyEl) emptyEl.style.display = 'none';
        for (const p of res.items) {
            const row = el('a', 'list-group-item list-group-item-action rounded border post-mini');
            row.href = `post.html?id=${encodeURIComponent(p.id)}`;
            const top = el('div', 'd-flex align-items-center justify-content-between gap-2');
            const t = el('div', 'fw-semibold text-dark');
            setText(t, p.title);
            const meta = el('div', 'text-muted small');
            setText(meta, formatDate(p.createdAt));
            top.append(t, meta);
            const sub = el('div', 'text-muted small mt-1');
            setText(sub, p.body);
            sub.style.display = '-webkit-box';
            sub.style.webkitLineClamp = '2';
            sub.style.webkitBoxOrient = 'vertical';
            sub.style.overflow = 'hidden';
            row.append(top, sub);
            latestEl.append(row);
        }
    }

    function initCommunity() {
        const banner = document.getElementById('community-banner');
        const tabs = document.getElementById('community-tabs');
        const listEl = document.getElementById('community-list');
        const emptyEl = document.getElementById('community-empty');
        const loadMoreBtn = document.getElementById('community-load-more');
        const qInput = document.getElementById('community-search');
        const sortSel = document.getElementById('community-sort');
        const clearBtn = document.getElementById('community-clear');
        const emptyClearBtn = document.getElementById('community-empty-clear');

        if (!tabs || !listEl || !qInput || !sortSel || !clearBtn || !loadMoreBtn || !emptyEl) return;

        const counts = api.getTabCounts();
        document.querySelectorAll('[data-count]').forEach((node) => {
            const key = node.getAttribute('data-count');
            if (key && Object.prototype.hasOwnProperty.call(counts, key)) {
                node.textContent = String(counts[key]);
            }
        });

        const state = {
            tab: 'recentes',
            q: '',
            sort: 'recent',
            offset: 0,
            limit: 6,
        };

        function updateClearState() {
            const has = !!state.q;
            clearBtn.disabled = !has;
        }

        function applyDefaultSortForTab() {
            if (state.tab === 'em-alta') {
                state.sort = 'replies';
            } else {
                state.sort = sortSel.value || 'recent';
            }
            sortSel.value = state.sort;
        }

        function render(reset) {
            showBanner(banner, '');
            updateClearState();

            if (reset) {
                state.offset = 0;
                renderSkeletonList(listEl, 4);
            }

            window.setTimeout(() => {
                try {
                    const res = api.queryPosts(state);
                    if (reset) listEl.innerHTML = '';

                    for (const p of res.items) {
                        renderPostRow(listEl, p);
                    }

                    const hasAny = (reset ? res.items.length : listEl.childElementCount) > 0;
                    emptyEl.style.display = hasAny ? 'none' : '';
                    loadMoreBtn.style.display = res.hasMore ? '' : 'none';
                } catch {
                    showBanner(banner, 'Falha ao carregar posts.');
                }
            }, 160);
        }

        function setActiveTab(tabKey) {
            state.tab = tabKey;
            state.offset = 0;
            applyDefaultSortForTab();
            tabs.querySelectorAll('button[data-tab]').forEach((btn) => {
                const key = btn.getAttribute('data-tab');
                btn.classList.toggle('active', key === tabKey);
            });
            render(true);
        }

        tabs.addEventListener('click', (e) => {
            const btn = e.target && e.target.closest && e.target.closest('button[data-tab]');
            if (!btn) return;
            const tabKey = btn.getAttribute('data-tab');
            if (!tabKey || tabKey === state.tab) return;
            setActiveTab(tabKey);
        });

        const onSearch = debounce(() => {
            state.q = (qInput.value || '').trim();
            render(true);
        }, 350);
        qInput.addEventListener('input', onSearch);

        sortSel.addEventListener('change', () => {
            state.sort = sortSel.value || 'recent';
            render(true);
        });

        clearBtn.addEventListener('click', () => {
            qInput.value = '';
            state.q = '';
            render(true);
        });
        if (emptyClearBtn) {
            emptyClearBtn.addEventListener('click', () => {
                qInput.value = '';
                sortSel.value = 'recent';
                state.q = '';
                state.sort = 'recent';
                setActiveTab('recentes');
            });
        }

        loadMoreBtn.addEventListener('click', () => {
            state.offset += state.limit;
            render(false);
        });

        applyDefaultSortForTab();
        render(true);
    }

    function initPostDetail() {
        const banner = document.getElementById('post-banner');
        const card = document.getElementById('post-card');
        const repliesList = document.getElementById('replies-list');
        const repliesEmpty = document.getElementById('replies-empty');
        const repliesCount = document.getElementById('replies-count');
        const form = document.getElementById('reply-form');
        const bodyInput = document.getElementById('reply-body');
        const errorEl = document.getElementById('reply-error');
        const submitBtn = document.getElementById('reply-submit');
        const toastEl = document.getElementById('post-toast');
        const toastBody = document.getElementById('post-toast-body');

        if (!card || !repliesList || !repliesEmpty || !repliesCount || !form || !bodyInput || !errorEl || !submitBtn) return;

        const postId = getQueryParam('id');
        if (!postId) {
            showBanner(banner, 'Post inválido.');
            card.innerHTML = '';
            return;
        }

        const post = api.getPostById(postId);
        if (!post) {
            showBanner(banner, 'Post não encontrado.');
            card.innerHTML = '';
            return;
        }

        showBanner(banner, '');

        card.innerHTML = '';
        const title = el('div', 'h4 mb-2');
        setText(title, post.title);
        const meta = el('div', 'text-muted small mb-3 d-flex flex-wrap gap-2');
        setText(meta, `${post.authorName} • ${formatDate(post.createdAt)}`);
        const content = el('div', 'text-muted');
        content.style.whiteSpace = 'pre-wrap';
        setText(content, post.body);
        card.append(title, meta, content);

        function renderReplies() {
            const replies = api.getReplies(postId);
            repliesList.innerHTML = '';
            repliesCount.textContent = String(replies.length);
            repliesEmpty.style.display = replies.length ? 'none' : '';

            for (const r of replies) {
                const wrap = el('div', 'border rounded p-3');
                const top = el('div', 'd-flex align-items-center justify-content-between gap-2 mb-1');
                const author = el('div', 'fw-semibold');
                setText(author, r.authorName);
                const dt = el('div', 'text-muted small');
                setText(dt, formatDate(r.createdAt));
                top.append(author, dt);
                const body = el('div', 'text-muted');
                body.style.whiteSpace = 'pre-wrap';
                setText(body, r.body);
                wrap.append(top, body);
                repliesList.append(wrap);
            }
        }

        function setFormState(isSending) {
            submitBtn.disabled = isSending;
            bodyInput.disabled = isSending;
            submitBtn.textContent = isSending ? 'Enviando…' : 'Enviar';
        }

        function showFormError(msg) {
            if (!msg) {
                errorEl.style.display = 'none';
                errorEl.textContent = '';
                return;
            }
            errorEl.style.display = '';
            errorEl.textContent = msg;
        }

        function showToast(msg) {
            if (!toastEl || !toastBody || typeof bootstrap === 'undefined' || !bootstrap.Toast) return;
            toastBody.textContent = msg;
            const t = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 2200 });
            t.show();
        }

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = (bodyInput.value || '').trim();
            if (!text) {
                showFormError('A resposta não pode estar vazia.');
                return;
            }
            showFormError('');
            setFormState(true);

            window.setTimeout(() => {
                const res = api.addReply(postId, text, 'Você');
                setFormState(false);
                if (!res.ok) {
                    showFormError(res.error || 'Falha ao enviar.');
                    return;
                }
                bodyInput.value = '';
                renderReplies();
                showToast('Resposta enviada.');
            }, 200);
        });

        renderReplies();
    }

    document.addEventListener('DOMContentLoaded', () => {
        const page = document.body && document.body.getAttribute('data-page');
        if (page === 'community') initCommunity();
        if (page === 'post-detail') initPostDetail();

        const hasDash = document.getElementById('dash-latest-posts');
        if (hasDash) initDashboard();
    });
})();
