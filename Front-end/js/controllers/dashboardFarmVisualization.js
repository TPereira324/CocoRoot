(function () {
    let scene, camera, renderer, controls, clock;
    let plots = [], initialized = false, cachedIds = '';

    const PLOT_SIZE = 3.2, SPACING = 3.9, GROW_SEC = 3;
    const LABELS = ['Terra vazia', 'Semente', 'A nascer', 'Planta média', 'Crescida 🌿'];

    const makeCanvasTexture = (size, draw, { repeat = 1, colorEncoding = true } = {}) => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        draw(ctx, size);
        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(repeat, repeat);
        tex.anisotropy = 4;
        if (colorEncoding && 'sRGBEncoding' in THREE) tex.encoding = THREE.sRGBEncoding;
        tex.needsUpdate = true;
        return tex;
    };

    const rand = (seed) => {
        let s = seed | 0;
        return () => {
            s = (s * 1664525 + 1013904223) | 0;
            return ((s >>> 0) / 4294967296);
        };
    };

    const hashText = (text) => {
        const s = String(text || '');
        let h = 0;
        for (let i = 0; i < s.length; i += 1) h = ((h << 5) - h) + s.charCodeAt(i);
        return Math.abs(h);
    };

    const SOIL_TEX = (() => {
        const base = makeCanvasTexture(256, (ctx, size) => {
            ctx.fillStyle = '#6b4426';
            ctx.fillRect(0, 0, size, size);
            const r = rand(1337);
            for (let i = 0; i < 4800; i += 1) {
                const x = Math.floor(r() * size);
                const y = Math.floor(r() * size);
                const a = 0.08 + r() * 0.14;
                const c = 40 + Math.floor(r() * 40);
                ctx.fillStyle = `rgba(${c},${c - 12},${c - 22},${a})`;
                ctx.fillRect(x, y, 1, 1);
            }
            for (let i = 0; i < 220; i += 1) {
                const x = Math.floor(r() * size);
                const y = Math.floor(r() * size);
                const w = 2 + Math.floor(r() * 3);
                const h = 2 + Math.floor(r() * 3);
                ctx.fillStyle = `rgba(18,12,8,${0.06 + r() * 0.10})`;
                ctx.fillRect(x, y, w, h);
            }
        }, { repeat: 2, colorEncoding: true });

        const bump = makeCanvasTexture(256, (ctx, size) => {
            ctx.fillStyle = '#808080';
            ctx.fillRect(0, 0, size, size);
            const r = rand(7331);
            for (let i = 0; i < 5200; i += 1) {
                const x = Math.floor(r() * size);
                const y = Math.floor(r() * size);
                const v = 110 + Math.floor(r() * 90);
                ctx.fillStyle = `rgb(${v},${v},${v})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }, { repeat: 2, colorEncoding: false });

        return { map: base, bumpMap: bump };
    })();

    const WOOD_TEX = (() => {
        const map = makeCanvasTexture(256, (ctx, size) => {
            ctx.fillStyle = '#3f2a1a';
            ctx.fillRect(0, 0, size, size);
            const r = rand(2021);
            for (let y = 0; y < size; y += 1) {
                const t = y / size;
                const wobble = Math.sin(t * Math.PI * 8) * 6;
                const c = 52 + Math.floor(18 * Math.sin(t * Math.PI * 5) + r() * 14);
                ctx.fillStyle = `rgb(${c},${c - 18},${c - 28})`;
                ctx.fillRect(0, y + wobble * 0.02, size, 1);
            }
            for (let i = 0; i < 260; i += 1) {
                const x = Math.floor(r() * size);
                const y = Math.floor(r() * size);
                ctx.fillStyle = `rgba(0,0,0,${0.08 + r() * 0.10})`;
                ctx.fillRect(x, y, 1, 3 + Math.floor(r() * 5));
            }
        }, { repeat: 1, colorEncoding: true });
        const bumpMap = makeCanvasTexture(256, (ctx, size) => {
            ctx.fillStyle = '#808080';
            ctx.fillRect(0, 0, size, size);
            const r = rand(99);
            for (let y = 0; y < size; y += 1) {
                const v = 120 + Math.floor(30 * Math.sin((y / size) * Math.PI * 10) + r() * 18);
                ctx.fillStyle = `rgb(${v},${v},${v})`;
                ctx.fillRect(0, y, size, 1);
            }
        }, { repeat: 1, colorEncoding: false });
        return { map, bumpMap };
    })();

    const GRASS_TEX = (() => {
        const map = makeCanvasTexture(256, (ctx, size) => {
            ctx.fillStyle = '#4f9a3a';
            ctx.fillRect(0, 0, size, size);
            const r = rand(777);
            for (let i = 0; i < 5200; i += 1) {
                const x = Math.floor(r() * size);
                const y = Math.floor(r() * size);
                const g = 120 + Math.floor(r() * 70);
                const rr = 50 + Math.floor(r() * 30);
                const b = 50 + Math.floor(r() * 30);
                ctx.fillStyle = `rgba(${rr},${g},${b},${0.10 + r() * 0.12})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }, { repeat: 6, colorEncoding: true });
        const bumpMap = makeCanvasTexture(256, (ctx, size) => {
            ctx.fillStyle = '#808080';
            ctx.fillRect(0, 0, size, size);
            const r = rand(888);
            for (let i = 0; i < 6000; i += 1) {
                const x = Math.floor(r() * size);
                const y = Math.floor(r() * size);
                const v = 120 + Math.floor(r() * 70);
                ctx.fillStyle = `rgb(${v},${v},${v})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }, { repeat: 6, colorEncoding: false });
        return { map, bumpMap };
    })();

    const mat = {
        soil: new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: SOIL_TEX.map,
            bumpMap: SOIL_TEX.bumpMap,
            bumpScale: 0.12,
            roughness: 0.98,
            metalness: 0.0,
        }),
        wood: new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: WOOD_TEX.map,
            bumpMap: WOOD_TEX.bumpMap,
            bumpScale: 0.10,
            roughness: 0.92,
            metalness: 0.0,
        }),
        grass: new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: GRASS_TEX.map,
            bumpMap: GRASS_TEX.bumpMap,
            bumpScale: 0.08,
            roughness: 0.95,
            metalness: 0.0,
        }),
        stone: new THREE.MeshStandardMaterial({
            color: 0x8a8f94,
            roughness: 0.85,
            metalness: 0.0,
        }),
    };

    const pmat = (c, { roughness = 0.75, metalness = 0 } = {}) =>
        new THREE.MeshStandardMaterial({ color: c, roughness, metalness });

    const buildPlant = (fCol) => {
        const g = new THREE.Group();
        const seed = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), pmat(0xd4a017, { roughness: 0.65 }));
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 1.0, 12), pmat(0x2d6e1e, { roughness: 0.85 }));
        const leafA = new THREE.Mesh(new THREE.SphereGeometry(0.30, 14, 14), pmat(0x4ec93a, { roughness: 0.8 }));
        const leafB = new THREE.Mesh(new THREE.SphereGeometry(0.30, 14, 14), pmat(0x38b22a, { roughness: 0.82 }));
        const leafC = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 14), pmat(0x62de4c, { roughness: 0.78 }));
        const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.36, 18, 18), pmat(fCol, { roughness: 0.55 }));
        const flwr = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 14), pmat(0xfff060, { roughness: 0.5 }));
        seed.position.y = 0.12;
        stem.position.y = 0.50;
        leafA.position.set(0.44, 0.54, 0.08);
        leafB.position.set(-0.44, 0.54, 0.08);
        leafC.position.set(0.00, 0.54, 0.44);
        fruit.position.y = 1.15;
        flwr.position.y = 1.60;
        [seed, stem, leafA, leafB, leafC, fruit, flwr].forEach(m => {
            m.scale.setScalar(0.01);
            m.castShadow = true;
        });
        g.add(seed, stem, leafA, leafB, leafC, fruit, flwr);
        return { g, seed, stem, leafA, leafB, leafC, fruit, flwr };
    };

    const fruitColor = (parcela) => {
        try {
            const cat = pickCultivoCategory(getCultivoLabel(parcela));
            if (cat === 'raizes') return 0xee7711;
            if (cat === 'folhosas') return 0x33cc11;
            if (cat === 'ervas') return 0x11cc99;
        } catch (_) { }
        return 0xee2222;
    };

    const createPlot = (x, z, parcela) => {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bed = new THREE.Mesh(new THREE.BoxGeometry(PLOT_SIZE, 0.24, PLOT_SIZE), mat.grass);
        bed.position.y = 0.12; bed.receiveShadow = true; bed.castShadow = true;
        root.add(bed);

        const soil = new THREE.Mesh(new THREE.BoxGeometry(PLOT_SIZE - 0.26, 0.14, PLOT_SIZE - 0.26), mat.soil);
        soil.position.y = 0.20;
        root.add(soil);

        const hs = PLOT_SIZE / 2;
        [[0, -hs, 0], [0, hs, 0], [-hs, 0, Math.PI / 2], [hs, 0, Math.PI / 2]].forEach(([dx, dz, ry]) => {
            const e = new THREE.Mesh(new THREE.BoxGeometry(PLOT_SIZE + 0.04, 0.72, 0.24), mat.wood);
            e.position.set(dx, 0.36, dz);
            e.rotation.y = ry;
            e.castShadow = true;
            root.add(e);
        });

        const stoneGeo = new THREE.SphereGeometry(0.045, 10, 10);
        const stones = new THREE.InstancedMesh(stoneGeo, mat.stone, 14);
        stones.castShadow = true;
        stones.receiveShadow = true;
        const r = rand(hashText(String(parcela?.nome || parcela?.id || `${x},${z}`)));
        const m = new THREE.Matrix4();
        for (let i = 0; i < 14; i += 1) {
            const px = (r() - 0.5) * (PLOT_SIZE - 0.6);
            const pz = (r() - 0.5) * (PLOT_SIZE - 0.6);
            const py = 0.27 + r() * 0.02;
            const s = 0.65 + r() * 0.7;
            m.compose(
                new THREE.Vector3(px, py, pz),
                new THREE.Quaternion().setFromEuler(new THREE.Euler(r() * 0.6, r() * Math.PI, r() * 0.6)),
                new THREE.Vector3(s, s * (0.7 + r() * 0.5), s)
            );
            stones.setMatrixAt(i, m);
        }
        stones.instanceMatrix.needsUpdate = true;
        root.add(stones);

        const plant = buildPlant(fruitColor(parcela));
        plant.g.position.y = 0.24;
        root.add(plant.g);

        const ring = new THREE.Mesh(
            new THREE.RingGeometry(1.54, 1.82, 32),
            new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.26;
        root.add(ring);

        root.userData = { parcela, state: 0, elapsed: 0, progress: 0, active: false, targetState: 0, plant, bed, ring };
        scene.add(root);
        return root;
    };

    const applyVisual = (plot) => {
        const { state, progress, plant: { seed, stem, leafA, leafB, leafC, fruit, flwr } } = plot.userData;
        seed.visible = state === 1;
        stem.visible = state >= 2;
        [leafA, leafB, leafC].forEach(m => { m.visible = state >= 3; });
        [fruit, flwr].forEach(m => { m.visible = state >= 4; });
        const s = (v) => Math.max(0.01, v);
        if (state === 1) {
            seed.scale.setScalar(s(0.22 + progress * 0.78));
        } else if (state === 2) {
            const h = s(0.14 + progress * 0.66);
            stem.scale.set(1, h, 1);
            stem.position.y = 0.08 + h * 0.5;
            [leafA, leafB, leafC, fruit, flwr].forEach(m => m.scale.setScalar(0.01));
        } else if (state === 3) {
            stem.scale.set(1, 0.80, 1); stem.position.y = 0.5;
            [leafA, leafB, leafC].forEach(m => m.scale.setScalar(s(progress * 0.95)));
            [fruit, flwr].forEach(m => m.scale.setScalar(0.01));
        } else if (state === 4) {
            stem.scale.set(1, 0.88, 1); stem.position.y = 0.5;
            [leafA, leafB, leafC].forEach(m => m.scale.setScalar(0.95));
            [fruit, flwr].forEach(m => m.scale.setScalar(s(progress)));
        } else {
            [seed, stem, leafA, leafB, leafC, fruit, flwr].forEach(m => m.scale.setScalar(0.01));
        }
    };

    const buildGrid = (parcelas) => {
        plots.forEach(p => scene.remove(p)); plots = [];
        const list = Array.isArray(parcelas) ? parcelas : [];
        const infoEl = document.getElementById('farm-viz-info');
        if (list.length === 0) {
            if (infoEl) infoEl.textContent = 'Sem parcelas registadas';
            return;
        }
        const cols = Math.min(4, list.length), half = ((cols - 1) * SPACING) / 2;
        list.forEach((p, i) => {
            const plot = createPlot((i % cols) * SPACING - half, Math.floor(i / cols) * SPACING, p);
            const ts = deriveState(p);
            if (ts > 0) startGrow(plot, ts);
            plots.push(plot);
        });
    };

    const deriveState = (p) => {
        const e = String(p?.estado || p?.par_estado || '').toLowerCase();
        try { if (!getCultivoLabel(p)) return 0; } catch (_) { return 0; }
        if (e.includes('inat')) return 0;
        if (e.includes('critic')) return 1;
        if (e.includes('aten')) return 2;
        return 4;
    };

    const startGrow = (plot, target) => {
        Object.assign(plot.userData, { state: 1, progress: 0, active: true, targetState: Math.max(1, target) });
        applyVisual(plot);
    };

    const infoText = (plot) => {
        const p = plot.userData.parcela;
        const label = (window.getParcelaLabel ? getParcelaLabel(p) : null) || p?.nome || 'Parcela';
        const cultivo = window.getCultivoLabel ? getCultivoLabel(p) : '';
        const area = Number(p?.area_m2);
        return `${label}${cultivo ? ' · 🌱 ' + cultivo : ''} · ${LABELS[plot.userData.state]}${Number.isFinite(area) ? ' · ' + area.toFixed(0) + 'm²' : ''}`;
    };

    const selectPlot = (plot) => {
        if (!plot) return;
        plots.forEach(p => { p.userData.ring.material.opacity = 0; });
        plot.userData.ring.material.opacity = 0.92;
        controls.target.set(plot.position.x, 0.5, plot.position.z);
        const infoEl = document.getElementById('farm-viz-info');
        if (infoEl) infoEl.textContent = infoText(plot);
        if (!plot.userData.active && plot.userData.state === 0) startGrow(plot, 4);
    };

    const resize = () => {
        const c = document.getElementById('farm-viz-container');
        if (!c || !renderer) return;
        const w = c.clientWidth, h = c.clientHeight;
        if (w < 2 || h < 2) return;
        renderer.setSize(w, h);
        if (camera) { camera.aspect = w / h; camera.updateProjectionMatrix(); }
    };

    const tick = () => {
        requestAnimationFrame(tick);
        if (!renderer) return;
        const dt = Math.min(clock.getDelta(), 0.04);
        const t = clock.elapsedTime;
        const infoEl = document.getElementById('farm-viz-info');
        plots.forEach(plot => {
            const ud = plot.userData;
            if (ud.active) {
                ud.elapsed += dt;
                ud.state = Math.max(ud.state, Math.min(ud.targetState, Math.floor(ud.elapsed / GROW_SEC) + 1));
                ud.progress = Math.min(1, (ud.elapsed % GROW_SEC) / GROW_SEC);
                if (ud.state >= ud.targetState && ud.elapsed >= ud.targetState * GROW_SEC) {
                    ud.state = ud.targetState; ud.progress = 1; ud.active = false;
                }
                applyVisual(plot);
                if (ud.ring.material.opacity > 0 && infoEl) infoEl.textContent = infoText(plot);
            }
            if (!ud.active && ud.state >= 3) {
                [ud.plant.stem, ud.plant.leafA, ud.plant.leafB, ud.plant.leafC].forEach((m, i) => {
                    if (m.visible) m.rotation.z = Math.sin(t * 1.1 + i * 1.3) * 0.05;
                });
            }
        });
        controls.update();
        renderer.render(scene, camera);
    };

    const init = () => {
        if (initialized) return;
        const container = document.getElementById('farm-viz-container');
        const canvas = document.getElementById('farm-viz-canvas');
        if (!container || !canvas || typeof THREE === 'undefined') return;
        initialized = true;

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xbfe7ff);
        scene.fog = new THREE.FogExp2(0xbfe7ff, 0.016);

        const w = Math.max(container.clientWidth, 100);
        const h = Math.max(container.clientHeight, 100);

        renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.physicallyCorrectLights = true;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.02;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setSize(w, h);

        camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 120);
        camera.position.set(7.8, 11.3, 7.8);
        camera.lookAt(0, 0, 0);

        controls = new THREE.OrbitControls(camera, canvas);
        controls.enableDamping = true;
        controls.dampingFactor = 0.07;
        controls.minDistance = 4;
        controls.maxDistance = 26;
        controls.minPolarAngle = Math.PI / 7;
        controls.maxPolarAngle = Math.PI / 2.05;
        controls.target.set(0, 0.5, 0);
        controls.update();

        scene.add(new THREE.HemisphereLight(0xe8f4ff, 0x2a3a22, 0.75));
        const sun = new THREE.DirectionalLight(0xfff0d6, 2.35);
        sun.position.set(14, 22, 10);
        sun.castShadow = true;
        sun.shadow.mapSize.set(2048, 2048);
        sun.shadow.camera.left = sun.shadow.camera.bottom = -22;
        sun.shadow.camera.right = sun.shadow.camera.top = 22;
        sun.shadow.bias = -0.00025;
        sun.shadow.normalBias = 0.02;
        scene.add(sun);
        const fill = new THREE.DirectionalLight(0xdff7e4, 0.45);
        fill.position.set(-10, 10, -6);
        scene.add(fill);

        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(80, 80),
            mat.grass
        );
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
        container.addEventListener('pointerdown', (e) => {
            const rect = container.getBoundingClientRect();
            pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(pointer, camera);
            const hits = raycaster.intersectObjects(plots.map(p => p.userData.bed), false);
            if (hits.length) {
                const hit = plots.find(p => p.userData.bed === hits[0].object);
                if (hit) selectPlot(hit);
            }
        });

        clock = new THREE.Clock();
        buildGrid([]);
        tick();
        window.addEventListener('resize', () => requestAnimationFrame(resize));
    };

    window.cocoRootFarmVisualizationShow = (parcelas, parcelaId) => {
        init();
        const ids = parcelas.map(p => window.getParcelaId ? getParcelaId(p) : String(p?.id || '')).join(',');
        if (ids !== cachedIds) { buildGrid(parcelas); cachedIds = ids; }
        const idx = parcelas.findIndex(p => (window.getParcelaId ? getParcelaId(p) : String(p?.id || '')) === parcelaId);
        selectPlot(plots[idx >= 0 ? idx : 0] || plots[0]);
        requestAnimationFrame(resize);
    };

    window.cocoRootFarmVisualizationResize = () => {
        if (!initialized) { init(); } else { requestAnimationFrame(resize); }
    };
})();
