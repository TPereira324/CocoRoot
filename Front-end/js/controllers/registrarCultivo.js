(() => {
    const form = document.querySelector('[data-cultivo-form]');
    if (!form) return;
    const api = window.CocoRootApi;
    const alertsStorageKey = 'cocoRootDashboardAlerts';

    const stepMeta = document.querySelector('[data-step-meta]');
    const progressBar = document.querySelector('[data-cultivo-progress]');
    const steps = Array.from(document.querySelectorAll('[data-step]'));
    const errorBox = document.querySelector('[data-cultivo-error]');

    const btnPrev = document.querySelector('[data-step-prev]');
    const btnNext = document.querySelector('[data-step-next]');
    const btnSave = document.querySelector('[data-step-save]');

    const summaryTipo = document.querySelector('[data-summary-tipo]');
    const summaryLargura = document.querySelector('[data-summary-largura]');
    const summaryComprimento = document.querySelector('[data-summary-comprimento]');
    const summaryProfundidade = document.querySelector('[data-summary-profundidade]');
    const summarySubstrato = document.querySelector('[data-summary-substrato]');
    const summaryMetodo = document.querySelector('[data-summary-metodo]');

    const substratePreview = document.querySelector('[data-substrate-preview]');
    const substrateLitrosEl = document.querySelector('[data-substrate-litros]');

    const state = {
        step: 1,
        largura: '',
        comprimento: '',
        profundidade: '',
        tipo: '',
        objetivo: 'Consumo próprio',
        metodo: 'Hidroponia',
    };

    const el = {
        largura: form.querySelector('[name="largura"]'),
        comprimento: form.querySelector('[name="comprimento"]'),
        profundidade: form.querySelector('[name="profundidade"]'),
        tipo: form.querySelector('[name="tipo"]'),
        metodo: form.querySelector('[name="metodo"]'),
    };

    const fieldErrors = {
        largura: document.querySelector('[data-field-error="largura"]'),
        comprimento: document.querySelector('[data-field-error="comprimento"]'),
        profundidade: document.querySelector('[data-field-error="profundidade"]'),
    };

    const setError = (msg) => {
        if (!errorBox) return;
        if (!msg) { errorBox.hidden = true; errorBox.textContent = ''; return; }
        errorBox.hidden = false;
        errorBox.textContent = msg;
    };

    const setFieldError = (field, msg) => {
        const hint = fieldErrors[field];
        if (hint) { hint.textContent = msg || ''; hint.hidden = !msg; }
        if (el[field]) el[field].classList.toggle('field-invalid', !!msg);
    };

    const clearFieldErrors = () => {
        Object.keys(fieldErrors).forEach((f) => setFieldError(f, ''));
    };

    const readAlertsStore = () => {
        try { const raw = localStorage.getItem(alertsStorageKey); return raw ? JSON.parse(raw) : {}; } catch { return {}; }
    };

    const writeAlertsStore = (store) => {
        localStorage.setItem(alertsStorageKey, JSON.stringify(store || {}));
    };

    const persistLocalAlert = (userId, alerta) => {
        const store = readAlertsStore();
        const current = Array.isArray(store?.[userId]) ? store[userId] : [];
        store[userId] = [alerta, ...current].slice(0, 20);
        writeAlertsStore(store);
    };

    const getNumber = (input) => {
        if (!input) return NaN;
        const v = String(input.value || '').trim().replace(',', '.');
        const n = Number(v);
        return Number.isFinite(n) ? n : NaN;
    };

    const calcSubstrateLitros = () => {
        const l = getNumber(el.largura);
        const c = getNumber(el.comprimento);
        const p = getNumber(el.profundidade);
        if ([l, c, p].every((n) => Number.isFinite(n) && n > 0)) return Math.round(l * c * p * 1000);
        return null;
    };

    const updateSubstratePreview = () => {
        const litros = calcSubstrateLitros();
        if (substratePreview) substratePreview.hidden = litros === null;
        if (substrateLitrosEl && litros !== null) substrateLitrosEl.textContent = litros;
    };

    const syncState = () => {
        state.largura = (el.largura?.value || '').trim();
        state.comprimento = (el.comprimento?.value || '').trim();
        state.profundidade = (el.profundidade?.value || '').trim();
        state.tipo = el.tipo?.value || '';
        state.objetivo = 'Consumo próprio';
        state.metodo = (el.metodo?.value || 'Hidroponia') || 'Hidroponia';
    };

    const validateStep = (step) => {
        syncState();
        if (step === 1 && !state.tipo) return 'Seleciona o tipo de cultivo.';
        if (step === 2) {
            clearFieldErrors();
            const largura = getNumber(el.largura);
            const comprimento = getNumber(el.comprimento);
            const profundidade = getNumber(el.profundidade);
            const erros = [];
            if (!Number.isFinite(largura) || largura <= 0) {
                setFieldError('largura', 'Largura deve ser maior que 0.');
                erros.push('Largura');
            }
            if (!Number.isFinite(comprimento) || comprimento <= 0) {
                setFieldError('comprimento', 'Comprimento deve ser maior que 0.');
                erros.push('Comprimento');
            }
            if (!Number.isFinite(profundidade) || profundidade <= 0) {
                setFieldError('profundidade', 'Profundidade deve ser maior que 0.');
                erros.push('Profundidade');
            }
            if (erros.length > 0) return `Corrija os campos: ${erros.join(', ')}.`;
        }
        if (step === 3 && !state.metodo) return 'Método de cultivo indisponível.';
        return '';
    };

    const renderSummary = () => {
        syncState();
        const litros = calcSubstrateLitros();
        if (summaryTipo) summaryTipo.textContent = state.tipo || '—';
        if (summaryLargura) summaryLargura.textContent = state.largura || '—';
        if (summaryComprimento) summaryComprimento.textContent = state.comprimento || '—';
        if (summaryProfundidade) summaryProfundidade.textContent = state.profundidade || '—';
        if (summarySubstrato) summarySubstrato.textContent = litros !== null ? `~${litros} L` : '—';
        if (summaryMetodo) summaryMetodo.textContent = state.metodo || 'Hidroponia';
    };

    const showStep = (n) => {
        const max = steps.length || 5;
        const clamped = Math.max(1, Math.min(max, n));
        state.step = clamped;

        steps.forEach((s) => s.classList.toggle('active', Number(s.dataset.step) === clamped));

        if (stepMeta) stepMeta.textContent = `Passo ${clamped} de ${max}`;
        if (progressBar) progressBar.style.width = `${(clamped / max) * 100}%`;

        if (btnPrev) { btnPrev.hidden = clamped === 1; btnPrev.style.display = clamped === 1 ? 'none' : ''; }
        if (btnNext) { btnNext.hidden = clamped === max; btnNext.style.display = clamped === max ? 'none' : ''; }
        if (btnSave) { btnSave.hidden = clamped !== max; btnSave.style.display = clamped === max ? '' : 'none'; }

        if (clamped === max) renderSummary();
        setError('');
        clearFieldErrors();
    };

    const next = () => {
        const activeEl = document.querySelector('.cultivo-step.active[data-step]');
        const activeStep = Number(activeEl?.dataset?.step || state.step || 1);
        state.step = Number.isFinite(activeStep) ? activeStep : state.step;
        const err = validateStep(state.step);
        if (err) { setError(err); return; }
        showStep(state.step + 1);
    };

    const prev = () => {
        const activeEl = document.querySelector('.cultivo-step.active[data-step]');
        const activeStep = Number(activeEl?.dataset?.step || state.step || 1);
        state.step = Number.isFinite(activeStep) ? activeStep : state.step;
        showStep(state.step - 1);
    };

    const save = async () => {
        const err = validateStep(1) || validateStep(2) || validateStep(3);
        if (err) {
            if (String(err).includes('Largura') || String(err).includes('Comprimento') || String(err).includes('Profundidade')) showStep(2);
            else showStep(1);
            setError(err);
            return;
        }
        syncState();
        const user = api?.requireLoggedUser?.();
        if (!user) return;

        const largura = Number(String(state.largura).replace(',', '.'));
        const comprimento = Number(String(state.comprimento).replace(',', '.'));
        const profundidade = Number(String(state.profundidade).replace(',', '.'));
        const substrato_litros = Math.round(largura * comprimento * profundidade * 1000);
        const payload = {
            ut_id: user.id,
            par_nome: `${state.tipo || 'Cultivo'} ${new Date().toLocaleDateString('pt-PT')}`,
            par_estado: 'Saudável',
            largura,
            comprimento,
            profundidade,
            substrato_litros,
            tipo: state.tipo,
            objetivo: state.objetivo || 'Consumo próprio',
            metodo: state.metodo || 'Hidroponia',
        };

        try {
            setError('');
            if (btnSave) btnSave.disabled = true;
            await api.fetchJson('parcelas/adicionar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            persistLocalAlert(String(user.id), {
                id: `local_alert_${Date.now()}`,
                nivel: 'info',
                categoria: 'Parcela',
                titulo: 'Nova parcela registada',
                mensagem: `A parcela "${payload.par_nome}" foi criada com sucesso e já está disponível no dashboard.`,
                parcela_nome: payload.par_nome,
                created_at: new Date().toISOString(),
                local_only: true,
            });
            window.location.href = 'dashboard.html';
        } catch (error) {
            setError(error.message || 'Não foi possível salvar o cultivo no banco de dados.');
        } finally {
            if (btnSave) btnSave.disabled = false;
        }
    };

    el.tipo?.addEventListener('change', () => {
        setError('');
    });

    const bindMeasureInput = (input, fieldName) => {
        if (!input) return;
        input.addEventListener('input', () => {
            setError('');
            setFieldError(fieldName, '');
            updateSubstratePreview();
        });
    };

    bindMeasureInput(el.largura, 'largura');
    bindMeasureInput(el.comprimento, 'comprimento');
    bindMeasureInput(el.profundidade, 'profundidade');

    btnPrev?.addEventListener('click', (e) => { e.preventDefault(); prev(); });
    btnNext?.addEventListener('click', (e) => { e.preventDefault(); next(); });
    btnSave?.addEventListener('click', (e) => { e.preventDefault(); save(); });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (state.step < steps.length) next();
        else save();
    });

    showStep(1);
})();
