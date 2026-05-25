/* Dashboard: controlador principal. */

document.addEventListener('DOMContentLoaded', async () => {
    const api = window.CocoRootApi;
    if (!api) return;
    const user = api.requireLoggedUser();
    if (!user) return;

    let currentParcelas = [];

    const greetingName = document.getElementById('dashboard-user-name');
    const greetingText = document.getElementById('dashboard-greeting-text');
    const parcelasCount = document.getElementById('dashboard-parcelas-count');
    const tarefasCount = document.getElementById('dashboard-tarefas-count');
    const tarefasLabel = document.getElementById('dashboard-tarefas-label');
    const alertasCount = document.getElementById('dashboard-alertas-count');
    const alertasLabel = document.getElementById('dashboard-alertas-label');
    const parcelasContainer = document.getElementById('dashboard-parcelas-list');
    const tarefasContainer = document.getElementById('dashboard-tarefas-list');
    const monitorizacaoContainer = document.getElementById('dashboard-monitorizacao');
    const climaContainer = document.getElementById('dashboard-clima');
    const errorBox = document.getElementById('dashboard-error');
    const detailsModal = document.getElementById('dash-details-modal');
    const detailsTitle = document.getElementById('dash-detail-title');
    const detailsSub = document.getElementById('dash-detail-sub');
    const detailsPlanted = document.getElementById('dash-detail-planted');
    const detailsRemaining = document.getElementById('dash-detail-remaining');

    if (greetingName) greetingName.textContent = user.nome || 'utilizador';
    if (greetingText) greetingText.textContent = 'Bem-vindo ao dashboard da sua exploração agrícola, onde encontra tudo num só sítio!';

    const setError = (message) => {
        if (!errorBox) return;
        errorBox.hidden = !message;
        errorBox.textContent = message || '';
    };

    const fetchOptional = async (path) => { try { return await api.fetchJson(path); } catch { return null; } };

    const updateTaskSummary = (tasks) => {
        const sections = classifyTasks(tasks);
        if (tarefasCount) tarefasCount.textContent = String(sections.pending.length);
        if (tarefasLabel) tarefasLabel.textContent = sections.pending.length === 0 ? 'Tudo em dia' : `${sections.overdueOrToday.length} até hoje · ${sections.upcoming.length} próximas`;
    };

    const updateAlertsSummary = (alerts) => {
        const list = Array.isArray(alerts) ? alerts : [];
        if (alertasCount) alertasCount.textContent = String(list.length);
        if (alertasLabel) {
            if (list.length === 0) { alertasLabel.textContent = 'Sem alertas'; return; }
            alertasLabel.textContent = `${getAlertCategory(list[0])} · ${getAlertTitle(list[0])}`;
        }
    };

    renderParcelasSkeleton(parcelasContainer);
    renderTasksSkeleton(tarefasContainer);
    renderMonitorSkeleton(monitorizacaoContainer);
    renderClimaSkeleton(climaContainer);

    const userId = String(user.id ?? 'anon');
    const normalizeParcelasList = (raw) => {
        const list = Array.isArray(raw) ? raw : [];
        const uid = String(user.id);
        const filtered = list.filter((p) => {
            const candidates = [p?.ut_id, p?.user_id, p?.usuario_id, p?.id_usuario, p?.utilizador_id];
            const any = candidates.some((v) => v !== undefined && v !== null && String(v) !== '');
            if (!any) return true;
            return candidates.some((v) => String(v) === uid);
        });
        const seen = new Set();
        const out = [];
        for (const p of filtered) {
            const id = window.getParcelaId ? getParcelaId(p) : String(p?.id || '');
            const key = String(id || '');
            if (!key) { out.push(p); continue; }
            if (seen.has(key)) continue;
            seen.add(key);
            out.push(p);
        }
        return out;
    };

    const plantKey = `cocoRootParcelaPlanting:${userId}`;
    /* Datas de plantio por parcela (localStorage). */
    const readPlantStore = () => { try { const raw = localStorage.getItem(plantKey); return raw ? JSON.parse(raw) : {}; } catch { return {}; } };
    const writePlantStore = (store) => { try { localStorage.setItem(plantKey, JSON.stringify(store || {})); } catch { } };

    const parseDate = (value) => {
        if (!value) return null;
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return null;
        return d;
    };

    const getParcelaPlantedAt = (parcela) => {
        const parcelaId = window.getParcelaId ? getParcelaId(parcela) : String(parcela?.id || '');
        const store = readPlantStore();
        const candidates = [
            parcela?.plantado_em,
            parcela?.planted_at,
            parcela?.data_plantio,
            parcela?.plantio,
            parcela?.criado_em,
            parcela?.created_at,
            parcela?.par_created_at,
        ];
        for (const c of candidates) {
            const parsed = parseDate(c);
            if (parsed) return parsed;
        }
        const stored = parseDate(store?.[parcelaId]);
        if (stored) return stored;
        const now = new Date();
        store[parcelaId] = now.toISOString();
        writePlantStore(store);
        return now;
    };

    const harvestDaysForCultivo = (cultivoLabel) => {
        const t = normalizeText(cultivoLabel);
        if (t.includes('tomate')) return 80;
        if (t.includes('morango')) return 90;
        if (t.includes('manjericao') || t.includes('manjericão')) return 35;
        return 60;
    };

    const buildRemainingText = (parcela) => {
        const cultivo = window.getCultivoLabel ? getCultivoLabel(parcela) : String(parcela?.tipo || '');
        const plantedAt = getParcelaPlantedAt(parcela);
        const totalDays = harvestDaysForCultivo(cultivo);
        const diffMs = Date.now() - plantedAt.getTime();
        const daysSince = Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1000)));
        const remaining = Math.max(0, totalDays - daysSince);
        if (remaining <= 0) return { plantedAt, text: 'Pronto para colheita' };
        return { plantedAt, text: `${remaining} dia(s) restantes` };
    };

    const closeDetails = () => {
        if (!detailsModal) return;
        detailsModal.hidden = true;
    };

    const openDetails = (parcelaId) => {
        if (!detailsModal) return;
        const parcela = currentParcelas.find((p) => (window.getParcelaId ? getParcelaId(p) : String(p?.id || '')) === String(parcelaId));
        if (!parcela) return;
        const label = window.getParcelaLabel ? getParcelaLabel(parcela) : String(parcela?.nome || 'Parcela');
        const cultivo = window.getCultivoLabel ? getCultivoLabel(parcela) : String(parcela?.tipo || '');
        const { plantedAt, text } = buildRemainingText(parcela);
        if (detailsTitle) detailsTitle.textContent = label || 'Detalhes';
        if (detailsSub) detailsSub.textContent = cultivo ? `Cultivo: ${cultivo}` : '';
        if (detailsPlanted) detailsPlanted.textContent = typeof formatDate === 'function' ? formatDate(plantedAt) : plantedAt.toISOString().slice(0, 10);
        if (detailsRemaining) detailsRemaining.textContent = text;
        detailsModal.hidden = false;
    };

    if (detailsModal && !detailsModal.dataset.bound) {
        detailsModal.dataset.bound = '1';
        detailsModal.addEventListener('click', (e) => {
            const inside = e.target?.closest?.('.dash-detail-shell');
            if (!inside) closeDetails();
        });
        document.querySelector('[data-dash-details-close]')?.addEventListener('click', closeDetails);
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeDetails();
        });
    }

    if (parcelasContainer && !parcelasContainer.dataset.detailsBound) {
        parcelasContainer.dataset.detailsBound = '1';
        parcelasContainer.addEventListener('click', (e) => {
            const detailsBtn = e.target?.closest?.('.dash-cultivo-link[data-parcela-id]');
            if (detailsBtn) {
                const parcelaId = detailsBtn.getAttribute('data-parcela-id');
                openDetails(parcelaId);
                return;
            }
            const card = e.target?.closest?.('.dash-cultivo-card[data-parcela-id]');
            const parcelaId = card?.getAttribute?.('data-parcela-id');
            if (!parcelaId) return;
            window.cocoRootFarmVisualizationShow?.(currentParcelas, parcelaId);
        });
    }

    const cacheKey = `cocoRootDashCache:${userId}`;
    /* Cache do dashboard (localStorage, ~10 min). */
    const readCache = () => {
        try {
            const raw = localStorage.getItem(cacheKey);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object') return null;
            if (Date.now() - Number(parsed.ts || 0) > 10 * 60 * 1000) return null;
            return parsed;
        } catch {
            return null;
        }
    };
    const writeCache = (data) => {
        try { localStorage.setItem(cacheKey, JSON.stringify({ ...data, ts: Date.now() })); } catch { }
    };

    const cached = readCache();
    if (cached) {
        const parcelas = normalizeParcelasList(cached.parcelas);
        currentParcelas = parcelas;
        const tarefas = Array.isArray(cached.tarefas) ? cached.tarefas : [];
        const alertas = Array.isArray(cached.alertas) ? cached.alertas : [];
        if (parcelasCount) parcelasCount.textContent = String(parcelas.length);
        renderParcelas(parcelas, parcelasContainer);
        const firstParcelaId = parcelas[0] ? (window.getParcelaId ? getParcelaId(parcelas[0]) : String(parcelas[0]?.id || '')) : '';
        if (firstParcelaId) window.cocoRootFarmVisualizationShow?.(parcelas, firstParcelaId);
        else window.cocoRootFarmVisualizationResize?.();
        updateTaskSummary(tarefas);
        renderTasks(tarefas, { onlyToday: false, interactive: false }, tarefasContainer);
        updateAlertsSummary(alertas);
    }

    try {
        const [parcelasResponse, tarefasResponse, alertasResponse, userProfileResponse] = await Promise.all([
            api.fetchJson(`parcelas/listar/${user.id}`),
            fetchOptional(`tarefas/listar/${user.id}`),
            fetchOptional(`alertas/listar/${user.id}`),
            fetchOptional(`usuarios/perfil/${user.id}`),
        ]);

        const parcelas = normalizeParcelasList(parcelasResponse?.data);
        const serverTarefas = Array.isArray(tarefasResponse?.data) ? tarefasResponse.data : [];
        const serverAlertas = Array.isArray(alertasResponse?.data) ? alertasResponse.data : [];
        const userProfile = userProfileResponse?.data || null;
        const localAlertas = getUserLocalAlerts(userId);
        const { defaultClima: clima, weatherByParcelaId } = await fetchWeatherByLocations(api, parcelas, userProfile, user);

        currentParcelas = parcelas;
        if (parcelasCount) parcelasCount.textContent = String(parcelas.length);
        renderParcelas(parcelas, parcelasContainer);

        const firstParcelaId = parcelas[0] ? (window.getParcelaId ? getParcelaId(parcelas[0]) : String(parcelas[0]?.id || '')) : '';
        if (firstParcelaId) window.cocoRootFarmVisualizationShow?.(parcelas, firstParcelaId);
        else window.cocoRootFarmVisualizationResize?.();

        const hasServerTasks = serverTarefas.length > 0;
        let tarefas = hasServerTasks ? serverTarefas : [];

        if (!hasServerTasks) {
            const { store, tasks } = getUserTasks(userId);
            const merged = mergeGeneratedTasks(tasks, parcelas);
            tarefas = merged;
            setUserTasks(store, userId, merged);

            const refreshComputedSections = (currentTasks) => {
                updateTaskSummary(currentTasks);
                const generatedAlertas = generateAlerts({ parcelas, tarefas: currentTasks, clima });
                const mergedAlertas = mergeAlerts(serverAlertas, localAlertas, generatedAlertas);
                updateAlertsSummary(mergedAlertas);
                renderMonitorizacao(parcelas, clima, mergedAlertas, weatherByParcelaId, monitorizacaoContainer);
                return mergedAlertas;
            };

            if (tarefasContainer && !tarefasContainer.dataset.tasksBound) {
                tarefasContainer.dataset.tasksBound = '1';
                tarefasContainer.addEventListener('click', (e) => {
                    const btn = e.target?.closest?.('[data-task-id]');
                    const taskId = btn?.getAttribute?.('data-task-id');
                    if (!taskId) return;
                    const { store: currentStore, tasks: currentTasks } = getUserTasks(userId);
                    const nextTasks = currentTasks.map((t) => String(t.id) !== String(taskId) ? t : { ...t, estado: 'Concluída', concluida_em: new Date().toISOString() });
                    setUserTasks(currentStore, userId, nextTasks);
                    renderTasks(nextTasks, { onlyToday: true }, tarefasContainer);
                    refreshComputedSections(nextTasks);
                });
            }
            refreshComputedSections(tarefas);
        }

        if (hasServerTasks) {
            updateTaskSummary(tarefas);
            renderTasks(tarefas, { onlyToday: false, interactive: false }, tarefasContainer);
        } else {
            renderTasks(tarefas, { onlyToday: true }, tarefasContainer);
        }

        const generatedAlertas = generateAlerts({ parcelas, tarefas, clima });
        const alertas = mergeAlerts(serverAlertas, localAlertas, generatedAlertas);
        updateTaskSummary(tarefas);
        updateAlertsSummary(alertas);
        renderMonitorizacao(parcelas, clima, alertas, weatherByParcelaId, monitorizacaoContainer);
        renderClima(clima, climaContainer);
        setError('');

        writeCache({ parcelas, tarefas, alertas });
    } catch (error) {
        if (parcelasCount) parcelasCount.textContent = '0';
        if (tarefasCount) tarefasCount.textContent = '0';
        if (alertasCount) alertasCount.textContent = '0';
        if (tarefasLabel) tarefasLabel.textContent = 'Sem tarefas';
        if (alertasLabel) alertasLabel.textContent = 'Sem alertas';
        renderEmpty(parcelasContainer, 'Não foi possível carregar as parcelas da base de dados.');
        renderEmpty(tarefasContainer, 'As tarefas não puderam ser carregadas.');
        renderEmpty(monitorizacaoContainer, 'O monitoramento não está disponível.');
        renderEmpty(climaContainer, 'O clima não está disponível.');
        setError(error.message || 'Erro ao carregar o dashboard.');
    }
});


