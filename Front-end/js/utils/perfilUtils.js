/* Perfil: utilitários simples. */

/* Lê JSON do localStorage e devolve fallback se falhar. */
function readJson(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

/* Guarda JSON no localStorage. */
function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

/* Devolve uma mensagem amigável para erros comuns de rede. */
function friendlyError(error, fallback) {
    const text = String(error?.message || '').toLowerCase();
    if (text.includes('failed to fetch') || text.includes('networkerror') || text.includes('load failed')) {
        return 'Sem ligação ao servidor neste momento. Tente novamente em alguns segundos.';
    }
    return error?.message || fallback;
}

/* Normaliza o objeto do utilizador (vários nomes de campo possíveis). */
function toUserShape(raw, liveUser) {
    const source = raw && typeof raw === 'object' ? raw : {};
    return {
        id: source.id ?? source.ut_id ?? source.user_id ?? liveUser.id,
        role: source.role ?? source.ut_role ?? liveUser.role,
        nome: source.nome ?? source.ut_nome ?? source.name ?? liveUser.nome ?? '',
        email: source.email ?? source.ut_email ?? liveUser.email ?? '',
    };
}

/* Calcula progresso do perfil (percentagem por módulos concluídos). */
function calcProgress(parcelas, tarefasPendentes, modulosConcluidos) {
    const totalModules = 4;
    const completedModules = Math.max(0, Math.min(totalModules, modulosConcluidos));
    return Math.round((completedModules / totalModules) * 100);
}


