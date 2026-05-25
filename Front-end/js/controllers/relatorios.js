/* Relatórios: controlador. */

document.addEventListener('DOMContentLoaded', async () => {
    const api = window.CocoRootApi;
    if (!api) return;
    const user = api.requireLoggedUser();
    if (!user) return;

    const periodSelect = document.getElementById('reports-period');
    const focusSelect = document.getElementById('reports-focus');
    const refreshBtn = document.getElementById('reports-refresh');
    const statProd = document.getElementById('stat-productividade');
    const statRega = document.getElementById('stat-rega');
    const statTasks = document.getElementById('stat-tarefas');
    const barsRoot = document.getElementById('reports-bars');
    const lineWave = document.getElementById('reports-line-wave');
    const lineChart = document.getElementById('reports-line-chart');
    const linePointsRoot = document.getElementById('reports-line-points');
    const lineTooltip = document.getElementById('reports-line-tooltip');
    const donut = document.getElementById('reports-donut');
    const donutValue = document.getElementById('reports-donut-value');
    const donutLabel = document.getElementById('reports-donut-label');
    const summaryCopy = document.getElementById('reports-summary-copy');
    const summaryList = document.getElementById('reports-summary-list');
    const loadingPills = Array.from(document.querySelectorAll('.reports-loading-pill'));
    const els = { statProd, statRega, statTasks, barsRoot, lineWave, lineChart, linePointsRoot, lineTooltip, donut, donutValue, donutLabel, summaryCopy, summaryList, loadingPills, refreshBtn };

    /* Store de tarefas (fallback local). */
    const tasksStorageKey = 'cocoRootTasks';
    /* Preferências dos relatórios por utilizador (localStorage). */
    const reportsPrefsKey = `cocoRootReportsPrefs:${String(user.id ?? 'anon')}`;
    const daysByPeriod = { '7d': 7, '30d': 30, '90d': 90 };
    let sourceData = { parcelas: [], tarefas: [], alertas: [] };
    let loadError = '';
    let currentDataset = null;

    const fetchOptional = async (path) => { try { return await api.fetchJson(path); } catch { return null; } };

    /* Lê/grava preferências no localStorage. */
    const readPreferences = () => { try { const raw = localStorage.getItem(reportsPrefsKey); return raw ? JSON.parse(raw) : {}; } catch { return {}; } };
    const writePreferences = () => localStorage.setItem(reportsPrefsKey, JSON.stringify({ period: periodSelect?.value || '30d', focus: focusSelect?.value || 'geral' }));

    const applySavedPreferences = () => {
        const prefs = readPreferences();
        if (periodSelect && daysByPeriod[prefs?.period]) periodSelect.value = prefs.period;
        if (focusSelect && ['geral', 'rega', 'tarefas'].includes(prefs?.focus)) focusSelect.value = prefs.focus;
    };

    const computeDataset = () => relComputeDataset(sourceData, periodSelect?.value || '30d', focusSelect?.value || 'geral', daysByPeriod);

    const setLoading = (active) => relSetLoading(active, els);

    const renderDataset = (data) => {
        relRenderDatasetView(data, els);
        setLoading(false);
        currentDataset = data;
    };

    const applyDataWithDelay = () => {
        setLoading(true);
        if (summaryCopy) summaryCopy.textContent = 'A atualizar estatísticas reais para o período selecionado...';
        if (summaryList) summaryList.innerHTML = '<li class="reports-loading-line"></li><li class="reports-loading-line"></li><li class="reports-loading-line"></li>';
        const data = computeDataset();
        window.setTimeout(() => {
            if (currentDataset) relAnimateDatasetTransition(currentDataset, data, els, () => { setLoading(false); currentDataset = data; });
            else renderDataset(data);
        }, 220);
    };

    const loadSources = async () => {
        const [parcelasResponse, tarefasResponse, alertasResponse] = await Promise.all([
            fetchOptional(`parcelas/listar/${user.id}`),
            fetchOptional(`tarefas/listar/${user.id}`),
            fetchOptional(`alertas/listar/${user.id}`),
        ]);
        const serverTasks = Array.isArray(tarefasResponse?.data) ? tarefasResponse.data : [];
        const fallbackTasks = relGetLocalTasks(tasksStorageKey, String(user.id ?? 'anon'));
        const buildTaskKey = (task) => {
            const explicitId = String(task?.id || '').trim();
            if (explicitId) return `id:${explicitId}`;
            return `sig:${relNormalizeTaskText(task?.titulo)}::${relNormalizeTaskText(task?.parcela_nome || task?.parcela || task?.parcela_id)}::${String(task?.data_inicio || task?.dueDate || task?.created_at || '').slice(0, 10)}`;
        };
        const mergeTasksPreferLocal = (server, local) => {
            const mergedMap = new Map();
            (Array.isArray(server) ? server : []).forEach((task) => mergedMap.set(buildTaskKey(task), { ...task }));
            (Array.isArray(local) ? local : []).forEach((localTask) => {
                const key = buildTaskKey(localTask);
                const base = mergedMap.get(key);
                if (!base) { mergedMap.set(key, { ...localTask }); return; }
                if (relIsTaskDone(localTask) && !relIsTaskDone(base)) {
                    mergedMap.set(key, { ...base, ...localTask, estado: localTask.estado || 'Concluída', concluida_em: localTask.concluida_em || localTask.concluidaEm || new Date().toISOString() });
                    return;
                }
                mergedMap.set(key, { ...base, ...localTask });
            });
            return Array.from(mergedMap.values());
        };
        sourceData = {
            parcelas: Array.isArray(parcelasResponse?.data) ? parcelasResponse.data : [],
            tarefas: mergeTasksPreferLocal(serverTasks, fallbackTasks),
            alertas: Array.isArray(alertasResponse?.data) ? alertasResponse.data : [],
        };
    };

    try { await loadSources(); } catch (error) { loadError = error?.message || 'Sem ligação ao servidor.'; }
    if (loadError && summaryCopy) summaryCopy.textContent = `${loadError} A mostrar dados locais quando disponíveis.`;

    applySavedPreferences();
    periodSelect?.addEventListener('change', () => { writePreferences(); applyDataWithDelay(); });
    focusSelect?.addEventListener('change', () => { writePreferences(); applyDataWithDelay(); });
    refreshBtn?.addEventListener('click', async () => { setLoading(true); await loadSources().catch(() => null); applyDataWithDelay(); });
    applyDataWithDelay();
});


