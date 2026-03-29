(() => {
    const modalEl = document.getElementById('appModal');
    const iframe = document.getElementById('appModalFrame');

    if (modalEl && iframe) {
        modalEl.addEventListener('show.bs.modal', (event) => {
            const trigger = event.relatedTarget;
            const src = trigger && trigger.getAttribute('data-modal-src');
            if (src) iframe.src = src;
        });

        modalEl.addEventListener('hidden.bs.modal', () => {
            iframe.src = 'about:blank';
        });
    }

    document.querySelectorAll('a[data-scroll], button[data-scroll]').forEach((el) => {
        el.addEventListener('click', (e) => {
            const target = el.getAttribute('data-scroll');
            if (!target || !target.startsWith('#')) return;
            const node = document.querySelector(target);
            if (!node) return;
            e.preventDefault();
            node.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    const tiltNodes = document.querySelectorAll('[data-tilt]');
    const prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReduce) {
        tiltNodes.forEach((node) => {
            let raf = 0;

            const onMove = (e) => {
                const rect = node.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                const rx = (0.5 - y) * 6;
                const ry = (x - 0.5) * 10;

                cancelAnimationFrame(raf);
                raf = requestAnimationFrame(() => {
                    node.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
                });
            };

            const onLeave = () => {
                cancelAnimationFrame(raf);
                node.style.transform = '';
            };

            node.addEventListener('pointermove', onMove);
            node.addEventListener('pointerleave', onLeave);
        });
    }
})();

