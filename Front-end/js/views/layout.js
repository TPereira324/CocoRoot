/* Layout: scripts comuns. */

document.addEventListener("DOMContentLoaded", () => {
    const currentPath = window.location.pathname.split('/').pop() || 'principal.html';
    /* Sessão do utilizador (localStorage). */
    const user = JSON.parse(localStorage.getItem('user'));
    const isInPages = window.location.pathname.includes('/pages/');
    const assetPrefix = isInPages ? '../' : '';

    const ensureHeadAssets = () => {
        const head = document.head;
        if (!head) return;

        const ensureMeta = (key, value, attr = 'name') => {
            const selector = attr === 'property' ? `meta[property="${key}"]` : `meta[name="${key}"]`;
            let el = head.querySelector(selector);
            if (!el) {
                el = document.createElement('meta');
                el.setAttribute(attr, key);
                head.appendChild(el);
            }
            el.setAttribute('content', value);
        };

        const ensureLink = (rel, href, extra = {}) => {
            let el = head.querySelector(`link[rel="${rel}"]`);
            if (!el) {
                el = document.createElement('link');
                el.setAttribute('rel', rel);
                head.appendChild(el);
            }
            el.setAttribute('href', href);
            Object.entries(extra).forEach(([k, v]) => el.setAttribute(k, v));
        };

        ensureLink('icon', `${assetPrefix}image/logo-256w.jpeg`, { type: 'image/jpeg' });
        ensureMeta('description', 'CocoRoot: plataforma de agricultura digital para gerir, monitorizar e otimizar cultivos em fibra de coco.');
        ensureMeta('og:site_name', 'CocoRoot', 'property');
        ensureMeta('og:title', document.title || 'CocoRoot', 'property');
        ensureMeta('og:description', 'Ferramentas para decidir melhor, todos os dias.', 'property');
        ensureMeta('og:type', 'website', 'property');
        ensureMeta('og:url', window.location.href, 'property');
        ensureMeta('og:image', `${assetPrefix}image/logo-256w.jpeg`, 'property');
    };

    ensureHeadAssets();

    const headerHTML = `
    <nav class="nav" data-cr-nav>
        <a href="principal.html" class="nav-logo" aria-label="CocoRoot">
            <img src="${assetPrefix}image/logo-256w.jpeg"
                width="28"
                height="28"
                alt="CocoRoot"
                class="nav-brand"
                loading="eager"
                decoding="async"
                fetchpriority="high">
            <span class="nav-title">CocoRoot</span>
        </a>
        <button class="nav-btn nav-toggle" type="button" aria-controls="cr-nav-collapse" aria-expanded="false"
            aria-label="Menu" data-cr-nav-toggle>
            <span class="nav-burger" aria-hidden="true">
                <span></span><span></span><span></span>
            </span>
        </button>
        <div class="cr-nav-collapse" id="cr-nav-collapse" data-cr-nav-menu>
            <div class="nav-links">
                <a href="noticias.html" class="nav-link ${currentPath.includes('noticias') || currentPath.includes('post') ? 'active' : ''}">Notícias</a>
                <a href="dashboard.html" class="nav-link ${currentPath.includes('dashboard') || currentPath.includes('registrar-cultivo') ? 'active' : ''}">Dashboard</a>
                <a href="comunidade.html" class="nav-link ${currentPath.includes('comunidade') ? 'active' : ''}">Comunidade</a>
                <a href="comecar.html" class="nav-link ${currentPath.includes('comecar') ? 'active' : ''}">Começar do Zero</a>
                <a href="sobre.html" class="nav-link ${currentPath.includes('sobre') ? 'active' : ''}">Sobre nós</a>
                ${user && user.role === 'admin' ? '<a href="dashboard.html?admin=true" class="nav-link active">Admin</a>' : ''}
                <span class="nav-indicator" aria-hidden="true"></span>
            </div>
            <div class="nav-right">
                ${user ? `
                    <a href="perfil.html" class="nav-link ${currentPath.includes('perfil') ? 'active' : ''}" style="display:inline-flex;align-items:center;gap:6px;"><i class="bi bi-person-circle" aria-hidden="true"></i> ${user.nome}</a>
                    <a href="#" id="logout-btn" class="nav-link nav-logout"><i class="bi bi-box-arrow-right" aria-hidden="true"></i> Sair</a>
                ` : `
                    <a href="login.html" class="btn outline nav-cta cr-tooltip cr-tt-login"><i class="bi bi-box-arrow-in-right" aria-hidden="true"></i> Entrar</a>
                    <a href="registo.html" class="btn outline cr-tooltip cr-tt-registo"><i class="bi bi-person-plus" aria-hidden="true"></i> Criar Conta</a>
                `}
            </div>
        </div>
        <div class="nav-overlay" aria-hidden="true" data-cr-nav-overlay></div>
    </nav>
    `;

    const footerHTML = `
    <footer class="footer">
        <div class="footer-inner">
            <div>
                <div class="footer-brand">
                    <img src="${assetPrefix}image/logo-256w.jpeg"
                        width="28"
                        height="28"
                        alt="CocoRoot"
                        class="nav-brand"
                        loading="lazy"
                        decoding="async">
                    <div class="footer-brand-name">CocoRoot</div>
                </div>
            </div>
            <div>
                <div class="footer-col-title">Produto</div>
                <div class="footer-links">
                    <a href="comecar.html">Começar do zero</a>
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

    const syncNavAriaCurrent = () => {
        const links = Array.from(document.querySelectorAll('.nav .nav-link'));
        links.forEach((a) => a.removeAttribute('aria-current'));
        const active = document.querySelector('.nav .nav-link.active');
        if (active) active.setAttribute('aria-current', 'page');
    };
    syncNavAriaCurrent();

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

    const setupMobileNav = () => {
        const nav = document.querySelector('[data-cr-nav]');
        const toggle = document.querySelector('[data-cr-nav-toggle]');
        const menu = document.querySelector('[data-cr-nav-menu]');
        const overlay = document.querySelector('[data-cr-nav-overlay]');
        if (!nav || !toggle || !menu) return;

        const close = () => {
            nav.classList.remove('nav--open');
            toggle.setAttribute('aria-expanded', 'false');
        };

        const open = () => {
            nav.classList.add('nav--open');
            toggle.setAttribute('aria-expanded', 'true');
        };

        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            if (nav.classList.contains('nav--open')) close();
            else open();
        });

        (overlay || menu).addEventListener('click', (e) => {
            if (e.target && e.target.closest && e.target.closest('.cr-nav-collapse')) return;
            close();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            close();
        });

        menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
            if (window.innerWidth > 768) return;
            close();
        }));

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) close();
        });
    };

    const setupNavIndicator = () => {
        const linksRoot = document.querySelector('.nav-links');
        const indicator = linksRoot ? linksRoot.querySelector('.nav-indicator') : null;
        if (!linksRoot || !indicator) return;

        const set = (link) => {
            if (!(link instanceof Element)) {
                linksRoot.style.setProperty('--cr-ind-o', '0');
                return;
            }
            const rootRect = linksRoot.getBoundingClientRect();
            const rect = link.getBoundingClientRect();
            const x = rect.left - rootRect.left + 10;
            const w = Math.max(0, rect.width - 20);
            linksRoot.style.setProperty('--cr-ind-x', `${x}px`);
            linksRoot.style.setProperty('--cr-ind-s', `${w}`);
            linksRoot.style.setProperty('--cr-ind-o', '1');
        };

        const active = linksRoot.querySelector('.nav-link.active');
        if (active) set(active);

        const onHover = (e) => {
            const link = e.target && e.target.closest ? e.target.closest('.nav-link') : null;
            if (!link) return;
            set(link);
        };

        if (window.matchMedia && window.matchMedia('(hover: hover)').matches) {
            linksRoot.addEventListener('pointerenter', onHover, true);
            linksRoot.addEventListener('pointermove', onHover, true);
            linksRoot.addEventListener('pointerleave', () => set(active), true);
        }

        window.addEventListener('resize', () => set(active));
    };

    setupMobileNav();
    setupNavIndicator();

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

    window.CocoRootToast = (title, text, type = 'success') => {
        const root = ensureToastRoot();
        const toast = document.createElement('div');
        const kind = ['success', 'error', 'info', 'loading'].includes(String(type)) ? String(type) : 'success';
        toast.className = `toast toast--${kind}`;
        const icon = kind === 'error' ? 'bi-exclamation-triangle'
            : kind === 'info' ? 'bi-info-circle'
                : kind === 'loading' ? 'bi-arrow-repeat'
                    : 'bi-bell';
        toast.innerHTML = `
            <div class="toast-icon"><i class="bi ${icon}" aria-hidden="true"></i></div>
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

    const createScrollBus = () => {
        let ticking = false;
        const subs = new Set();
        const run = () => {
            ticking = false;
            const y = window.scrollY || 0;
            subs.forEach((fn) => fn(y));
        };
        const request = () => {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(run);
        };
        window.addEventListener('scroll', request, { passive: true });
        window.addEventListener('resize', request);
        return {
            subscribe: (fn) => {
                subs.add(fn);
                fn(window.scrollY || 0);
                return () => subs.delete(fn);
            },
            request,
        };
    };

    const scrollBus = createScrollBus();

    const setupHomeImageVariation = () => {
        if (!document.body.classList.contains('home-page')) return;
        const hero = document.querySelector('.hero');
        const aside = document.querySelector('.porque-right.img-ph');
        if (!hero && !aside) return;

        const heroPick = `${assetPrefix}image/planta-1024w.jpeg`;
        const asidePick = `${assetPrefix}image/image%2013-1024w.png`;

        if (hero) hero.style.setProperty('--hero-image', `url('${heroPick}')`);
        if (aside) aside.style.backgroundImage = `url('${asidePick}')`;
    };

    const setupHeroEffects = () => {
        if (!document.body.classList.contains('home-page')) return;
        const hero = document.querySelector('.hero');
        if (!reduceMotion && hero) {
            const update = () => {
                const y = Math.min(80, Math.max(0, window.scrollY * 0.15));
                hero.style.setProperty('--hero-parallax', `${y}px`);
            };
            update();
            scrollBus.subscribe(() => update());
        }
    };

    const initImageFade = (root = document) => {
        const images = Array.from(root.querySelectorAll ? root.querySelectorAll('img') : []);
        images.forEach((img) => {
            if (!(img instanceof HTMLImageElement)) return;
            if (!img.hasAttribute('decoding')) img.decoding = 'async';
            if (!img.hasAttribute('loading') && !img.closest('.nav-logo')) img.loading = 'lazy';
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
    setupHeroEffects();

    const setupScrollProgress = () => {
        const doc = document.documentElement;
        const update = () => {
            const scrollTop = doc.scrollTop || document.body.scrollTop || 0;
            const max = (doc.scrollHeight || 0) - (doc.clientHeight || 0);
            const progress = max > 0 ? Math.min(1, Math.max(0, scrollTop / max)) : 0;
            doc.style.setProperty('--cr-scroll', String(progress));
        };
        update();
        scrollBus.subscribe(() => update());
    };

    if (!reduceMotion) {
        setupScrollProgress();
    }

    const setupBackToTop = () => {
        if (document.body.classList.contains('auth-page')) return;
        if (document.querySelector('.cr-to-top')) return;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cr-to-top';
        btn.setAttribute('aria-label', 'Voltar ao topo');
        btn.innerHTML = '<i class="bi bi-arrow-up" aria-hidden="true"></i>';
        document.body.appendChild(btn);

        const update = () => {
            btn.classList.toggle('cr-to-top--show', window.scrollY > 600);
        };
        update();
        scrollBus.subscribe(() => update());

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        });
    };

    setupBackToTop();

    const setupNavbarScroll = () => {
        const nav = document.querySelector('.nav');
        if (!nav) return;
        const update = () => {
            nav.classList.toggle('nav--scrolled', window.scrollY > 50);
        };
        update();
        scrollBus.subscribe(() => update());
    };

    setupNavbarScroll();

    const setupRovingKeyNav = (root = document) => {
        const lists = Array.from(root.querySelectorAll ? root.querySelectorAll('[role="tablist"]') : []);
        lists.forEach((list) => {
            if (!(list instanceof Element)) return;
            if (list.dataset.crKeys === '1') return;
            list.dataset.crKeys = '1';
            const tabs = Array.from(list.querySelectorAll('button, [role="tab"]')).filter((b) => b instanceof HTMLElement);
            if (tabs.length < 2) return;

            const sync = () => {
                const active = tabs.find((t) => t.classList.contains('active')) || tabs[0];
                tabs.forEach((t) => t.setAttribute('tabindex', t === active ? '0' : '-1'));
            };
            sync();
            tabs.forEach((t) => t.addEventListener('click', sync));

            list.addEventListener('keydown', (e) => {
                const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
                if (!keys.includes(e.key)) return;
                const current = document.activeElement;
                const idx = tabs.findIndex((t) => t === current);
                if (idx < 0) return;
                e.preventDefault();
                const dir = (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ? -1 : 1;
                let next = idx;
                if (e.key === 'Home') next = 0;
                else if (e.key === 'End') next = tabs.length - 1;
                else next = (idx + dir + tabs.length) % tabs.length;
                const target = tabs[next];
                target.focus();
                target.click();
            });
        });

        const groups = Array.from(root.querySelectorAll ? root.querySelectorAll('[role="group"]') : []);
        groups.forEach((group) => {
            if (!(group instanceof Element)) return;
            if (group.dataset.crKeys === '1') return;
            const btns = Array.from(group.querySelectorAll('button')).filter((b) => b instanceof HTMLElement);
            if (btns.length < 2) return;
            group.dataset.crKeys = '1';
            group.addEventListener('keydown', (e) => {
                const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
                if (!keys.includes(e.key)) return;
                const current = document.activeElement;
                const idx = btns.findIndex((t) => t === current);
                if (idx < 0) return;
                e.preventDefault();
                const dir = (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ? -1 : 1;
                let next = idx;
                if (e.key === 'Home') next = 0;
                else if (e.key === 'End') next = btns.length - 1;
                else next = (idx + dir + btns.length) % btns.length;
                const target = btns[next];
                target.focus();
                target.click();
            });
        });
    };

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
            }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' })
            : null;

        const applyStagger = (root = document) => {
            const containers = new Set();
            containerSelectors.forEach((sel) => {
                Array.from(root.querySelectorAll(sel)).forEach((c) => containers.add(c));
            });
            Array.from(root.querySelectorAll('.stagger-children')).forEach((c) => containers.add(c));

            containers.forEach((container) => {
                const items = Array.from(container.children).filter((child) => child instanceof Element && child.classList.contains('animate-on-scroll'));
                if (items.length < 2) return;
                items.forEach((item, idx) => {
                    item.setAttribute('data-delay', String(idx));
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
                    setupRovingKeyNav(node);
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

    setupRovingKeyNav(document);

    setupScrollAnimations();
    setupCounters();
});


