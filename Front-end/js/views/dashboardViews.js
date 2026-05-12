function renderEmpty(container, message) {
    if (!container) return;
    container.innerHTML = `<div class="card"><div style="color:var(--muted);line-height:1.6;">${message}</div></div>`;
}

function renderSkeleton(container, count = 3) {
    if (!container) return;
    const blocks = Array.from({ length: Math.max(1, count) }).map(() => `
        <div class="card" aria-hidden="true">
            <div class="txt-block">
                <div class="txt-line title w65"></div>
                <div class="txt-line w80"></div>
                <div class="txt-line w50"></div>
            </div>
        </div>
    `).join('');
    container.innerHTML = blocks;
}

function renderParcelasSkeleton(parcelasContainer) {
    if (!parcelasContainer) return;
    const cards = Array.from({ length: 2 }).map(() => `
        <article class="dash-cultivo-card" aria-hidden="true">
            <div class="txt-block">
                <div class="txt-line title w50"></div>
                <div class="txt-line w65"></div>
                <div class="txt-line w40"></div>
            </div>
        </article>
    `).join('');
    parcelasContainer.innerHTML = `${cards}<a href="registrar-cultivo.html" class="dash-add-card"><span class="dash-add-icon" aria-hidden="true">+</span><span>Adicionar cultivo</span></a>`;
}

function renderTasksSkeleton(tarefasContainer) {
    renderSkeleton(tarefasContainer, 2);
}

function renderMonitorSkeleton(monitorizacaoContainer) {
    renderSkeleton(monitorizacaoContainer, 2);
}

function renderClimaSkeleton(climaContainer) {
    renderSkeleton(climaContainer, 1);
}

function renderParcelas(parcelas, parcelasContainer) {
    if (!parcelasContainer) return;
    const list = Array.isArray(parcelas) ? parcelas : [];
    if (list.length === 0) {
        parcelasContainer.innerHTML = `
            <div class="dash-empty-card"><div style="color:var(--muted);line-height:1.6;">Ainda não existem parcelas registadas.</div></div>
            <a href="registrar-cultivo.html" class="dash-add-card"><span class="dash-add-icon" aria-hidden="true">+</span><span>Adicionar cultivo</span></a>`;
        return;
    }
    const cards = list.map((parcela, index) => {
        const cultivos = Array.isArray(parcela.cultivos) ? parcela.cultivos : [];
        const cultivo = cultivos[0];
        const cultivoNome = String(cultivo?.nome ?? parcela?.tipo ?? parcela?.cultivo ?? parcela?.cultivo_nome ?? parcela?.nome ?? '').trim();
        const cultivoNorm = normalizeText(cultivoNome);
        const has = (...words) => words.some((w) => cultivoNorm.includes(normalizeText(w)));
        const iconClass = (has('tomate') || has('morango')) ? 'dash-cultivo-icon--frutiferas'
            : has('manjericão', 'manjericao') ? 'dash-cultivo-icon--ervas'
                : 'dash-cultivo-icon--geral';
        const cultivoIcon = (() => {
            if (!cultivoNome) return 'C';
            if (has('morango')) return '🍓';
            if (has('tomate')) return '🍅';
            if (has('manjericão', 'manjericao')) return '🌿';
            if (iconClass === 'dash-cultivo-icon--frutiferas') return '🍅';
            if (iconClass === 'dash-cultivo-icon--ervas') return '🌿';
            return cultivoNome.slice(0, 1).toUpperCase();
        })();
        const area = Number(parcela?.area_m2 || 0);
        const estado = String(parcela?.estado || parcela?.par_estado || 'Ativo');
        const areaText = area > 0 ? `${area.toFixed(0)}m²` : 'Sem área';
        return `
            <article class="dash-cultivo-card" data-parcela-id="${getParcelaId(parcela)}">
                <div class="dash-cultivo-top">
                    <div class="dash-cultivo-icon ${iconClass}" aria-hidden="true">${cultivoIcon}</div>
                    <span class="dash-cultivo-badge">${estado}</span>
                </div>
                <div class="dash-cultivo-name">${cultivoNome || cultivo?.nome || 'Cultivo'}</div>
                <div class="dash-cultivo-meta">${parcela.nome || 'Parcela'} · ${areaText}</div>
                <div class="dash-cultivo-info">Tipo de cultivo: <strong>${cultivoNome || '—'}</strong></div>
                <button type="button" class="dash-cultivo-link" data-parcela-id="${getParcelaId(parcela)}">Ver detalhes</button>
            </article>`;
    }).join('');
    parcelasContainer.innerHTML = `${cards}<a href="registrar-cultivo.html" class="dash-add-card"><span class="dash-add-icon" aria-hidden="true">+</span><span>Adicionar cultivo</span></a>`;
}

function renderClima(clima, climaContainer) {
    if (!climaContainer) return;
    if (!clima) { renderEmpty(climaContainer, 'A integração de clima ainda não está disponível no servidor atual.'); return; }
    const temp = Number(clima.temperatura);
    const humidade = Number(clima.humidade);
    const ventoHoje = Number(clima?.previsao?.[0]?.vento_max);
    const chuvaHoje = Number(clima?.previsao?.[0]?.chuva_probabilidade);
    const icon = weatherCodeToIcon(clima.weather_code);
    const forecast = Array.isArray(clima.previsao) ? clima.previsao.slice(0, 5) : [];
    climaContainer.innerHTML = `
        <div class="weather-shell">
            <div class="weather-hero">
                <div class="weather-hero-main">
                    <div class="weather-hero-label">Hoje${clima?.cidade ? ` · ${clima.cidade}` : ''}</div>
                    <div class="weather-hero-temp">${Number.isFinite(temp) ? `${Math.round(temp)}°C` : '—'}</div>
                    <div class="weather-hero-desc">${clima.descricao || 'Sem descrição'}</div>
                </div>
                <div class="weather-hero-icon"><i class="bi ${icon}" aria-hidden="true"></i></div>
                <div class="weather-hero-stats">
                    <div><span>Humidade</span><strong>${Number.isFinite(humidade) ? `${Math.round(humidade)}%` : '—'}</strong></div>
                    <div><span>Vento</span><strong>${Number.isFinite(ventoHoje) ? `${Math.round(ventoHoje)} km/h` : '12 km/h'}</strong></div>
                    <div><span>Chuva</span><strong>${Number.isFinite(chuvaHoje) ? `${Math.round(chuvaHoje)}%` : '0%'}</strong></div>
                </div>
            </div>
            <div class="weather-forecast-grid">
                ${forecast.map((dia) => {
        const max = Number(dia?.temp_max), min = Number(dia?.temp_min);
        const chuva = Number(dia?.chuva_probabilidade), vento = Number(dia?.vento_max);
        const iconName = weatherCodeToIcon(dia?.weather_code);
        const baseTemp = Number.isFinite(max) ? Math.round(max) : (Number.isFinite(min) ? Math.round(min) : null);
        return `<article class="weather-day-card">
                        <div class="weather-day-name">${formatWeekdayShort(dia?.data)}</div>
                        <div class="weather-day-icon"><i class="bi ${iconName}" aria-hidden="true"></i></div>
                        <div class="weather-day-temp">${baseTemp !== null ? `${baseTemp}°C` : '—'}</div>
                        <div class="weather-day-desc">${weatherCodeToText(dia?.weather_code)}</div>
                        <div class="weather-day-meta">
                            <span><i class="bi bi-moisture" aria-hidden="true"></i> ${Number.isFinite(chuva) ? `${Math.round(chuva)}%` : '0%'}</span>
                            <span><i class="bi bi-wind" aria-hidden="true"></i> ${Number.isFinite(vento) ? `${Math.round(vento)} km/h` : '0 km/h'}</span>
                        </div>
                    </article>`;
    }).join('')}
            </div>
        </div>`;
}

function renderTasks(tasks, options, tarefasContainer) {
    if (!tarefasContainer) return;
    const sections = classifyTasks(tasks);
    const showOnlyToday = options.onlyToday === true;
    const interactive = options.interactive !== false;
    const visibleNow = showOnlyToday ? sections.overdueOrToday : sections.pending;
    if (sections.pending.length === 0) { renderEmpty(tarefasContainer, 'Sem tarefas pendentes. Quando registares ou planeares novos cultivos, as tarefas aparecem aqui.'); return; }
    const summaryText = sections.overdueOrToday.length > 0
        ? `Tens ${sections.overdueOrToday.length} tarefa(s) para tratar até hoje e ${sections.upcoming.length} próxima(s) a seguir.`
        : `Não tens tarefas para hoje, mas ainda existem ${sections.upcoming.length} tarefa(s) pendente(s) agendada(s).`;
    const blocks = [];
    if (visibleNow.length > 0) blocks.push(`<section class="dash-task-section"><div class="dash-task-section-title">${formatTaskSectionTitle(showOnlyToday ? 'Para hoje e em atraso' : 'Pendentes', visibleNow)}</div>${visibleNow.map((t) => createTaskRowMarkup(t, interactive)).join('')}</section>`);
    if (!showOnlyToday && sections.upcoming.length > 0) blocks.push(`<section class="dash-task-section"><div class="dash-task-section-title">${formatTaskSectionTitle('Próximas', sections.upcoming)}</div>${sections.upcoming.map((t) => createTaskRowMarkup(t, interactive)).join('')}</section>`);
    else if (showOnlyToday && sections.upcoming.length > 0) blocks.push(`<section class="dash-task-section"><div class="dash-task-section-title">${formatTaskSectionTitle('Próximas', sections.upcoming.slice(0, 4))}</div>${sections.upcoming.slice(0, 4).map((t) => createTaskRowMarkup(t, interactive)).join('')}</section>`);
    if (sections.unscheduled.length > 0) blocks.push(`<section class="dash-task-section"><div class="dash-task-section-title">${formatTaskSectionTitle('Sem data definida', sections.unscheduled)}</div>${sections.unscheduled.map((t) => createTaskRowMarkup(t, interactive)).join('')}</section>`);
    tarefasContainer.innerHTML = `<div class="dash-task-summary">${summaryText}</div><div class="dash-task-sections">${blocks.join('')}</div>`;
}
