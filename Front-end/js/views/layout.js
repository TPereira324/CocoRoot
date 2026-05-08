document.addEventListener("DOMContentLoaded", () => {
    const currentPath = window.location.pathname.split('/').pop() || 'principal.html';
    const user = JSON.parse(localStorage.getItem('user'));
    const isInPages = window.location.pathname.includes('/pages/');
    const assetPrefix = isInPages ? '../' : '';

    const headerHTML = `
    <nav class="nav">
        <a href="principal.html" class="nav-logo" aria-label="CocoRoot">
            <img src="${assetPrefix}image/logo.jpeg" alt="" class="nav-brand">
            <span class="nav-title">CocoRoot</span>
        </a>
        <div class="nav-links">
            <a href="noticias.html" class="nav-link ${currentPath.includes('noticias') || currentPath.includes('post') ? 'active' : ''}">Notícias</a>
            <a href="dashboard.html" class="nav-link ${currentPath.includes('dashboard') || currentPath.includes('registrar-cultivo') ? 'active' : ''}">Dashboard</a>
            <a href="relatorios.html" class="nav-link ${currentPath.includes('relatorios') ? 'active' : ''}">Relatórios</a>
            <a href="comunidade.html" class="nav-link ${currentPath.includes('comunidade') ? 'active' : ''}">Comunidade</a>
            <a href="comecar.html" class="nav-link ${currentPath.includes('comecar') ? 'active' : ''}">Começar do Zero</a>
            <a href="sobre.html" class="nav-link ${currentPath.includes('sobre') ? 'active' : ''}">Sobre nós</a>
            ${user && user.role === 'admin' ? '<a href="dashboard.html?admin=true" class="nav-link active">Admin</a>' : ''}
        </div>
        <div class="nav-right">
            ${user ? `
                <a href="perfil.html" class="nav-link ${currentPath.includes('perfil') ? 'active' : ''}" style="display:inline-flex;align-items:center;gap:6px;"><i class="bi bi-person-circle" aria-hidden="true"></i> ${user.nome}</a>
                <a href="#" id="logout-btn" class="nav-link nav-logout"><i class="bi bi-box-arrow-right" aria-hidden="true"></i> Sair</a>
            ` : `
                <a href="login.html" class="btn outline cr-tooltip cr-tt-login"><i class="bi bi-box-arrow-in-right" aria-hidden="true"></i> Entrar</a>
                <a href="registo.html" class="btn outline cr-tooltip cr-tt-registo"><i class="bi bi-person-plus" aria-hidden="true"></i> Criar Conta</a>
            `}
        </div>
    </nav>
    `;

    const footerHTML = `
    <footer class="footer">
        <div class="footer-inner">
            <div>
                <div class="footer-brand">
                    <img src="${assetPrefix}image/logo.jpeg" alt="" class="nav-brand">
                    <div class="footer-brand-name">CocoRoot</div>
                </div>
            </div>
            <div>
                <div class="footer-col-title">Produto</div>
                <div class="footer-links">
                    <a href="comecar.html">Começar do zero</a>
                    <a href="relatorios.html">Relatórios</a>
                    <a href="principal.html#funcionalidades">Funcionalidades</a>
                    <a href="principal.html#como-funciona">Como funciona</a>
                </div>
            </div>
            <div>
                <div class="footer-col-title">Contacto</div>
                <div class="footer-links">
                    <a href="mailto:contacto@cocoroot.pt">contacto@cocoroot.pt</a>
                    <a href="sobre.html">Sobre nós</a>
                    <a href="dashboard.html">Dashboard</a>
                    <a href="perfil.html">Perfil</a>
                </div>
            </div>
            <div>
                <div class="footer-col-title">Redes sociais</div>
                <div class="footer-links">
                    <a href="#">Instagram</a>
                    <a href="#">Facebook</a>
                    <a href="#">YouTube</a>
                </div>
            </div>
        </div>
    </footer>
    `;


    if (!document.body.classList.contains('auth-page') && !document.querySelector('.nav')) {
        document.body.insertAdjacentHTML('afterbegin', headerHTML);
    } else if (document.querySelector('.nav')) {
        document.querySelector('.nav').outerHTML = headerHTML;
    }


    if (!document.body.classList.contains('auth-page')) {
        if (document.querySelector('.footer')) {
            document.querySelector('.footer').outerHTML = footerHTML;
        } else {
            document.body.insertAdjacentHTML('beforeend', footerHTML);
        }
    }


    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('user');
            window.location.href = 'principal.html';
        });
    }

    const ensureToastRoot = () => {
        let root = document.querySelector('.toast-root');
        if (!root) {
            root = document.createElement('div');
            root.className = 'toast-root';
            root.setAttribute('aria-live', 'polite');
            document.body.appendChild(root);
        }
        return root;
    };

    window.CocoRootToast = (title, text) => {
        const root = ensureToastRoot();
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <div class="toast-icon"><i class="bi bi-bell" aria-hidden="true"></i></div>
            <div style="flex:1;">
                <div class="toast-title">${title || 'Notificação'}</div>
                <div class="toast-text">${text || ''}</div>
                <div class="toast-bar"><div style="animation-duration: 2600ms;"></div></div>
            </div>
        `;
        root.appendChild(toast);
        window.setTimeout(() => toast.remove(), 2700);
    };

    const reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    const hashText = (text) => {
        const s = String(text || '');
        let h = 0;
        for (let i = 0; i < s.length; i += 1) h = ((h << 5) - h) + s.charCodeAt(i);
        return Math.abs(h);
    };

    const pickFrom = (list, seed) => {
        const arr = Array.isArray(list) ? list : [];
        if (arr.length === 0) return null;
        return arr[hashText(seed) % arr.length];
    };

    const setupHomeImageVariation = () => {
        if (!document.body.classList.contains('home-page')) return;
        const hero = document.querySelector('.hero');
        const aside = document.querySelector('.porque-right.img-ph');
        if (!hero && !aside) return;

        const heroPick = `${assetPrefix}image/planta.jpeg`;
        const asidePick = `${assetPrefix}image/image%2013.png`;

        if (hero) hero.style.backgroundImage = `url('${heroPick}')`;
        if (aside) aside.style.backgroundImage = `url('${asidePick}')`;
    };

    const initImageFade = (root = document) => {
        const images = Array.from(root.querySelectorAll ? root.querySelectorAll('img') : []);
        images.forEach((img) => {
            if (!(img instanceof HTMLImageElement)) return;
            if (img.classList.contains('cr-img')) return;
            img.classList.add('cr-img');

            const markLoaded = () => img.classList.add('cr-img-loaded');
            if (img.complete && img.naturalWidth > 0) {
                markLoaded();
                return;
            }

            img.addEventListener('load', markLoaded, { once: true });
            img.addEventListener('error', markLoaded, { once: true });
        });
    };

    initImageFade(document);
    setupHomeImageVariation();

    const setupScrollProgress = () => {
        const doc = document.documentElement;
        let ticking = false;

        const update = () => {
            ticking = false;
            const scrollTop = doc.scrollTop || document.body.scrollTop || 0;
            const max = (doc.scrollHeight || 0) - (doc.clientHeight || 0);
            const progress = max > 0 ? Math.min(1, Math.max(0, scrollTop / max)) : 0;
            doc.style.setProperty('--cr-scroll', String(progress));
        };

        const requestUpdate = () => {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(update);
        };

        window.addEventListener('scroll', requestUpdate, { passive: true });
        window.addEventListener('resize', requestUpdate);
        update();
    };

    if (!reduceMotion) {
        setupScrollProgress();
    }

    const setupNavbarScroll = () => {
        const nav = document.querySelector('.nav');
        if (!nav) return;
        let ticking = false;
        const update = () => {
            ticking = false;
            nav.classList.toggle('nav--scrolled', window.scrollY > 60);
        };
        const requestUpdate = () => {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(update);
        };
        window.addEventListener('scroll', requestUpdate, { passive: true });
        window.addEventListener('resize', requestUpdate);
        update();
    };

    setupNavbarScroll();

    const setupScrollAnimations = () => {
        const hasIO = 'IntersectionObserver' in window;
        const selectors = [
            '.section-title',
            '.section-kicker',
            '.hero-title',
            '.hero-subtitle',
            '.cta-title',
            '.cta-subtitle',
            '.community-title',
            '.community-subtitle',
            '.dash-hello',
            '.dash-sub',
            '.dash-stat-card',
            '.dash-add-card',
            '.card',
            '.dash-card',
            '.news-stat',
            '.article-item',
            '.about-box',
            '.about-card',
            '.team-box',
            '.team-member',
            '.module-card',
            '.module-item',
            '.guide-shell',
            '.step',
            '.checklist li',
            '.step-checklist li',
            '.materials-list li',
            '.tab',
            '.filter-tab',
            '.profile-card',
            '.profile-mini-stat',
            '.profile-chip',
            'img'
        ].join(',');

        const containerSelectors = [
            '.card-grid',
            '.steps-row',
            '.dash-stats-grid',
            '.grid-auto',
            '.panel-grid',
            '.stack',
            '.community-posts',
            '.tabs',
            '.stats-row',
            '.footer-links',
            '.footer-inner',
            '.dash-actions',
            '.dash-cultivos-grid',
            '.step-checklist',
            '.materials-list',
            '.profile-mini-stats',
            '.profile-chips',
            '.about-metrics'
        ];

        const isOffscreen = (el) => {
            const rect = el.getBoundingClientRect();
            return rect.bottom <= 0 || rect.top >= window.innerHeight;
        };

        const animateIn = (el) => {
            if (!(el instanceof Element)) return;
            el.style.setProperty('--a', '1');
        };

        const observer = hasIO
            ? new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const el = entry.target;
                    animateIn(el);
                    observer.unobserve(el);
                });
            }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' })
            : null;

        const applyStagger = (root = document) => {
            const containers = new Set();
            containerSelectors.forEach((sel) => {
                Array.from(root.querySelectorAll(sel)).forEach((c) => containers.add(c));
            });

            containers.forEach((container) => {
                const items = Array.from(container.children).filter((child) => child instanceof Element && child.classList.contains('animate-on-scroll'));
                if (items.length < 2) return;
                items.forEach((item, idx) => {
                    item.style.setProperty('--d', `${idx * 70}ms`);
                });
            });
        };

        const apply = (root = document) => {
            const elements = Array.from(root.querySelectorAll(selectors));
            elements.forEach((el) => {
                if (!(el instanceof Element)) return;
                if (el.classList.contains('animate-on-scroll')) return;
                if (el.closest('.toast-root')) return;

                el.classList.add('animate-on-scroll');
                if (reduceMotion) {
                    animateIn(el);
                    return;
                }
                if (!isOffscreen(el)) {
                    animateIn(el);
                    return;
                }
                if (observer) observer.observe(el);
                else animateIn(el);
            });
            applyStagger(root);
        };

        apply(document);

        const mo = new MutationObserver((mutations) => {
            mutations.forEach((m) => {
                m.addedNodes.forEach((node) => {
                    if (!(node instanceof Element)) return;
                    initImageFade(node);
                    apply(node);
                });
            });
        });
        mo.observe(document.body, { childList: true, subtree: true });
    };

    const setupCounters = () => {
        if (reduceMotion) return;
        if (!('IntersectionObserver' in window)) return;

        const numberSelector = [
            '.news-stat-value',
            '.dash-value',
            '.profile-mini-stat strong',
            '#profile-progress-text',
            '.reports-stat-value',
            '#reports-donut-value',
            '.stat-num'
        ].join(',');

        const parseFirstNumber = (text) => {
            const match = String(text || '').match(/(\d+)/);
            return match ? Number(match[1]) : null;
        };

        const renderWithNumber = (original, value) => {
            const s = String(original || '');
            const match = s.match(/(\d+)/);
            if (!match) return s;
            return s.replace(match[1], String(value));
        };

        const isNumberReady = (el) => {
            const n = parseFirstNumber(el.textContent || '');
            return n != null && !Number.isNaN(n);
        };

        const stateByEl = new WeakMap();

        const stopAnimation = (el) => {
            const state = stateByEl.get(el);
            if (!state) return;
            if (state.rafId) window.cancelAnimationFrame(state.rafId);
            state.rafId = 0;
            state.token = '';
            try {
                el.removeAttribute('data-cr-count-token');
                el.removeAttribute('data-cr-count-internal');
            } catch { }
        };

        const startAnimation = (el, fromValue, toValue, template) => {
            stopAnimation(el);
            const state = stateByEl.get(el) || {};
            const token = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
            state.token = token;
            state.template = template;
            state.lastNumber = toValue;
            stateByEl.set(el, state);
            el.setAttribute('data-cr-count-token', token);

            const startTime = performance.now();
            const duration = 1200;
            const start = Number.isFinite(fromValue) ? fromValue : 0;
            const target = Number.isFinite(toValue) ? toValue : 0;

            const tick = (now) => {
                const activeToken = el.getAttribute('data-cr-count-token') || '';
                if (activeToken !== token) return;

                const t = Math.min(1, (now - startTime) / duration);
                const eased = 1 - Math.pow(1 - t, 3);
                const value = Math.round(start + (target - start) * eased);
                el.setAttribute('data-cr-count-internal', token);
                el.textContent = renderWithNumber(state.template || template || '', value);
                if (t < 1) {
                    state.rafId = window.requestAnimationFrame(tick);
                } else {
                    stopAnimation(el);
                }
            };

            state.rafId = window.requestAnimationFrame(tick);
        };

        const handleTextChange = (el, reason = 'external') => {
            if (!(el instanceof Element)) return;
            const state = stateByEl.get(el) || {};
            const text = el.textContent || '';
            const next = parseFirstNumber(text);
            if (next == null || Number.isNaN(next)) return;
            state.template = text;
            stateByEl.set(el, state);
            if (!state.inView) return;

            const prev = Number.isFinite(state.prevAnimated) ? state.prevAnimated : 0;
            state.prevAnimated = next;
            stateByEl.set(el, state);
            startAnimation(el, prev, next, text);
        };

        const bind = (el) => {
            if (!(el instanceof Element)) return;
            if (stateByEl.has(el)) return;
            stateByEl.set(el, { inView: false, template: el.textContent || '', lastNumber: null, token: '', rafId: 0, prevAnimated: 0 });

            const mo = new MutationObserver(() => {
                const token = el.getAttribute('data-cr-count-token') || '';
                const internal = el.getAttribute('data-cr-count-internal') || '';
                if (token && internal === token) {
                    el.setAttribute('data-cr-count-internal', '');
                    return;
                }
                stopAnimation(el);
                handleTextChange(el, 'external');
            });

            mo.observe(el, { childList: true, characterData: true, subtree: true });
        };

        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const el = entry.target;
                if (!(el instanceof Element)) return;
                const state = stateByEl.get(el) || {};
                state.inView = !!entry.isIntersecting;
                stateByEl.set(el, state);
                if (!entry.isIntersecting) return;
                if (!isNumberReady(el)) return;
                handleTextChange(el, 'enter');
            });
        }, { threshold: 0.4 });

        const observeAll = (root = document) => {
            Array.from(root.querySelectorAll(numberSelector)).forEach((el) => {
                if (!(el instanceof Element)) return;
                bind(el);
                io.observe(el);
            });
        };

        observeAll(document);

        const root = document.body;
        if (!root) return;
        if (root.dataset.crCountersBound) return;
        root.dataset.crCountersBound = '1';
        const domObserver = new MutationObserver((mutations) => {
            mutations.forEach((m) => {
                Array.from(m.addedNodes || []).forEach((node) => {
                    if (!(node instanceof Element)) return;
                    if (node.matches?.(numberSelector)) {
                        bind(node);
                        io.observe(node);
                    }
                    observeAll(node);
                });
            });
        });
        domObserver.observe(root, { childList: true, subtree: true });
    };

    setupScrollAnimations();
    setupCounters();
});
