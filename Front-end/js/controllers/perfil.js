/* Perfil: controlador. */

document.addEventListener('DOMContentLoaded', async () => {
    const api = window.CocoRootApi;
    if (!api) return;

    const user = api.requireLoggedUser();
    if (!user) return;

    const preferencesKey = `cocoRootProfilePrefs:${String(user.id ?? 'anon')}`;
    const interestsKey = `cocoRootProfileInterests:${String(user.id ?? 'anon')}`;
    const avatarColorKey = `cocoRootAvatarColor:${String(user.id ?? 'anon')}`;
    const extProfileKey = `cocoRootExtProfile:${String(user.id ?? 'anon')}`;

    const INTERESTS = ['Folhosas', 'Frutíferas', 'Ervas', 'Raízes', 'Hidroponia', 'Flores'];
    const AVATAR_COLORS = [
        'linear-gradient(135deg,rgba(47,143,61,0.95),rgba(47,111,59,0.72))',
        'linear-gradient(135deg,rgba(37,99,235,0.90),rgba(29,78,216,0.72))',
        'linear-gradient(135deg,rgba(217,119,6,0.90),rgba(180,83,9,0.72))',
        'linear-gradient(135deg,rgba(147,51,234,0.90),rgba(109,40,217,0.72))',
        'linear-gradient(135deg,rgba(220,38,38,0.90),rgba(185,28,28,0.72))',
        'linear-gradient(135deg,rgba(6,182,212,0.90),rgba(8,145,178,0.72))',
    ];

    let liveUser = { ...user };
    let isDirty = false;

    const inputName = document.getElementById('profile-input-name');
    const inputEmail = document.getElementById('profile-input-email');
    const saveBtn = document.getElementById('profile-save-btn');
    const saveStatus = document.getElementById('profile-save-status');
    const unsavedBadge = document.getElementById('profile-unsaved');
    const avatar = document.getElementById('profile-avatar');
    const uploadBtn = document.getElementById('profile-upload-btn');
    const uploadIcon = document.getElementById('profile-upload-icon');
    const profileName = document.getElementById('profile-name');
    const profileRole = document.getElementById('profile-role');
    const statParcelas = document.getElementById('profile-stat-parcelas');
    const statPendentes = document.getElementById('profile-stat-pendentes');
    const statModulos = document.getElementById('profile-stat-modulos');
    const progressFill = document.getElementById('profile-progress-fill');
    const progressText = document.getElementById('profile-progress-text');
    const progressTrack = document.querySelector('.profile-progress-track');
    const chipsRoot = document.getElementById('profile-chips');
    const chipsCount = document.getElementById('profile-chips-count');
    const activityRoot = document.getElementById('profile-activity');
    const prefAlertas = document.getElementById('pref-alertas');
    const prefResumo = document.getElementById('pref-resumo');
    const prefComunidade = document.getElementById('pref-comunidade');

    const pwdToggleBtn = document.getElementById('profile-pwd-toggle-btn');
    const pwdForm = document.getElementById('profile-pwd-form');
    const pwdHint = document.getElementById('profile-pwd-hint');
    const pwdAtual = document.getElementById('profile-pwd-atual');
    const pwdNova = document.getElementById('profile-pwd-nova');
    const pwdConfirmar = document.getElementById('profile-pwd-confirmar');
    const pwdStatus = document.getElementById('profile-pwd-status');
    const pwdCancelBtn = document.getElementById('profile-pwd-cancel-btn');
    const pwdSaveBtn = document.getElementById('profile-pwd-save-btn');

    const fetchOptional = async (path) => {
        try { return await api.fetchJson(path); } catch { return null; }
    };

    const markDirty = () => {
        isDirty = true;
        if (unsavedBadge) unsavedBadge.hidden = false;
    };
    const markClean = () => {
        isDirty = false;
        if (unsavedBadge) unsavedBadge.hidden = true;
    };
    [inputName, inputEmail].forEach((el) => {
        el?.addEventListener('input', markDirty);
    });

    let colorIdx = readJson(avatarColorKey, 0);

    const applyAvatarColor = (idx) => {
        const ext = readJson(extProfileKey, {});
        const fotoCaminho = ext.foto || liveUser.foto;
        const fotoBase64 = ext.fotoBase64;

        if (avatar) {
            if (fotoBase64 || fotoCaminho) {
                let baseUrl = '../Back-end/';
                if (['5500', '3000', '5501'].includes(window.location.port)) {
                    baseUrl = 'http://localhost/CocoRoot/Back-end/';
                } else if (!window.location.pathname.includes('/Front-end/')) {
                    baseUrl = '/Back-end/';
                }

                const finalUrl = fotoBase64 ? fotoBase64 : `${baseUrl}${fotoCaminho}?t=${Date.now()}`;
                avatar.style.backgroundImage = `url("${finalUrl}")`;
                avatar.style.backgroundPosition = 'center';
                avatar.style.backgroundSize = 'cover';
                avatar.style.backgroundRepeat = 'no-repeat';
                avatar.textContent = '';
            } else {
                avatar.style.background = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                const initials = String(liveUser.nome || 'U')
                    .split(' ').filter(Boolean).slice(0, 2)
                    .map((w) => w[0]?.toUpperCase() || '').join('');
                avatar.textContent = initials || 'U';
            }
        }
    };

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/jpeg, image/png, image/webp, image/gif';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (avatar) avatar.style.opacity = '0.5';
        try {
            const compressedFile = await new Promise((resolve, reject) => {
                const img = new Image();
                const url = URL.createObjectURL(file);
                img.onload = () => {
                    URL.revokeObjectURL(url);
                    const canvas = document.createElement('canvas');
                    const MAX_SIZE = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height && width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    } else if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            const compressed = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
                            const reader = new FileReader();
                            reader.onload = () => resolve({ file: compressed, base64: reader.result });
                            reader.readAsDataURL(blob);
                        } else {
                            reject(new Error('Erro ao comprimir imagem.'));
                        }
                    }, 'image/jpeg', 0.85);
                };
                img.onerror = () => reject(new Error('Erro ao ler a imagem.'));
                img.src = url;
            });

            const formData = new FormData();
            formData.append('foto', compressedFile.file);

            avatar.style.backgroundImage = `url("${compressedFile.base64}")`;
            avatar.style.backgroundPosition = 'center';
            avatar.style.backgroundSize = 'cover';
            avatar.style.backgroundRepeat = 'no-repeat';
            avatar.textContent = '';

            const data = await api.fetchJson(`usuarios/upload-foto/${liveUser.id}`, {
                method: 'POST',
                body: formData
            });

            if (data && data.data && data.data.foto) {
                const ext = readJson(extProfileKey, {});
                ext.foto = data.data.foto;
                ext.fotoBase64 = compressedFile.base64;
                writeJson(extProfileKey, ext);
                liveUser.foto = data.data.foto;
                applyAvatarColor(colorIdx);
                if (window.CocoRootToast) window.CocoRootToast('Perfil', 'Foto atualizada com sucesso!');
            } else throw new Error(data.message || 'Erro ao carregar a foto.');
        } catch (err) {
            console.error(err);
            alert(err.message || 'Não foi possível atualizar a foto.');
        } finally {
            fileInput.value = '';
            if (avatar) avatar.style.opacity = '1';
        }
    });

    document.querySelectorAll('button, a, span, p, label, i').forEach(el => {
        const text = (el.textContent || '').trim().toLowerCase();
        if (text.length > 50) return;

        const isIcon = el.classList && (
            el.classList.contains('bi-camera') || el.classList.contains('bi-upload') ||
            el.classList.contains('fa-camera') || el.classList.contains('fa-upload') ||
            el.id === 'profile-upload-icon'
        );

        if (text.includes('alterar foto')) {
            el.style.display = 'none';
        } else if ((text.includes('carregar foto') || isIcon) && !el.dataset.uploadBound) {
            el.dataset.uploadBound = '1';
            el.style.cursor = 'pointer';
            el.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); fileInput.click(); });
        }
    });

    if (avatar) {
        avatar.style.pointerEvents = 'none';
        avatar.removeAttribute('title');
        avatar.removeAttribute('onclick');
    }

    const updateIdentityUI = () => {
        const ext = readJson(extProfileKey, {});
        if (inputName) inputName.value = liveUser.nome || '';
        if (inputEmail) inputEmail.value = liveUser.email || '';

        applyAvatarColor(colorIdx);

        if (profileName) profileName.textContent = liveUser.nome || 'Utilizador';
        if (profileRole) profileRole.textContent = liveUser.role === 'admin' ? 'Administrador' : 'Produtor CocoRoot';
    };

    const initIdentity = () => {
        liveUser = toUserShape(liveUser, liveUser);
        updateIdentityUI();
    };

    const initPreferences = () => {
        const prefs = readJson(preferencesKey, { alertas: true, resumo: true, comunidade: true });
        if (prefAlertas) prefAlertas.checked = prefs.alertas !== false;
        if (prefResumo) prefResumo.checked = prefs.resumo !== false;
        if (prefComunidade) prefComunidade.checked = prefs.comunidade !== false;

        [prefAlertas, prefResumo, prefComunidade].forEach((el) => {
            el?.addEventListener('change', () => {
                writeJson(preferencesKey, {
                    alertas: !!prefAlertas?.checked,
                    resumo: !!prefResumo?.checked,
                    comunidade: !!prefComunidade?.checked,
                });
                if (window.CocoRootToast) window.CocoRootToast('Perfil', 'Preferências atualizadas');
            });
        });
    };

    const initInterests = () => {
        const selected = new Set(readJson(interestsKey, ['Folhosas', 'Frutíferas']));
        const updateCount = () => {
            if (chipsCount) chipsCount.textContent = `${selected.size} interesse${selected.size !== 1 ? 's' : ''} seleccionado${selected.size !== 1 ? 's' : ''}`;
        };
        if (!chipsRoot) return;
        chipsRoot.innerHTML = '';
        INTERESTS.forEach((name) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `profile-chip${selected.has(name) ? ' active' : ''}`;
            btn.textContent = name;
            btn.addEventListener('click', () => {
                if (selected.has(name)) selected.delete(name);
                else selected.add(name);
                writeJson(interestsKey, Array.from(selected));
                btn.classList.toggle('active', selected.has(name));
                updateCount();
            });
            chipsRoot.appendChild(btn);
        });
        updateCount();
    };

    const renderActivity = (items) => {
        if (!activityRoot) return;
        if (!Array.isArray(items) || items.length === 0) {
            activityRoot.innerHTML = `<div class="profile-activity-empty">📭 Sem atividade recente para mostrar.</div>`;
            return;
        }
        activityRoot.innerHTML = items.map((item) => `
            <article class="profile-activity-item">
                <div class="profile-activity-dot${item.urgent ? ' is-urgent' : ''}"></div>
                <div>
                    <div class="profile-activity-title">${item.icon || '📋'} ${item.title}</div>
                    <div class="profile-activity-meta">${item.meta}</div>
                </div>
            </article>`).join('');
    };

    const loadStats = async () => {
        const userId = String(liveUser.id ?? user.id ?? 'anon');
        const completedModulesStore = readJson('cocoRootCompletedModules', {});
        const localTasksStore = readJson('cocoRootTasks', {});

        const [perfilResponse, parcelasResponse, tarefasResponse, alertasResponse] = await Promise.all([
            fetchOptional(`usuarios/perfil/${liveUser.id}`),
            fetchOptional(`parcelas/listar/${liveUser.id}`),
            fetchOptional(`tarefas/listar/${liveUser.id}`),
            fetchOptional(`alertas/listar/${liveUser.id}`),
        ]);

        const remoteProfile = perfilResponse?.data || perfilResponse?.user || null;
        if (remoteProfile) {
            liveUser = toUserShape(remoteProfile, liveUser);
            /* Atualiza a sessão (localStorage). */
            localStorage.setItem('user', JSON.stringify(liveUser));
            updateIdentityUI();
            markClean();
        }

        const parcelas = Array.isArray(parcelasResponse?.data) ? parcelasResponse.data : [];
        const serverTasks = Array.isArray(tarefasResponse?.data) ? tarefasResponse.data : [];
        const localTasks = Array.isArray(localTasksStore[userId]) ? localTasksStore[userId] : [];
        const allTasks = serverTasks.length > 0 ? serverTasks : localTasks;
        const pending = allTasks.filter((t) => !String(t?.estado || '').toLowerCase().includes('conclu')).length;
        const completedModulesList = Array.isArray(completedModulesStore[userId]) ? completedModulesStore[userId] : [];
        const completedModules = completedModulesList.length;

        if (statParcelas) statParcelas.textContent = String(parcelas.length);
        if (statPendentes) statPendentes.textContent = String(pending);
        if (statModulos) statModulos.textContent = String(completedModules);

        const statPendentesCard = statPendentes?.closest('.profile-mini-stat');
        if (statPendentesCard) statPendentesCard.style.setProperty('--cr-tt', `"Tens ${pending} tarefas por completar"`);

        const progress = calcProgress(parcelas.length, pending, completedModules);
        if (progressFill) progressFill.style.width = `${progress}%`;
        const missingCount = Math.max(0, 4 - completedModules);
        if (progressText) progressText.textContent = `${progress}% · ${missingCount} módulo${missingCount !== 1 ? 's' : ''} em falta`;

        if (progressTrack) {
            const missingIds = [1, 2, 3, 4].filter((id) => !completedModulesList.includes(id));
            const ttText = missingIds.length === 0
                ? 'Progresso completo!'
                : `Completa o${missingIds.length > 1 ? 's' : ''} Módulo${missingIds.length > 1 ? 's' : ''} ${missingIds.join(' e ')} para terminar`;
            progressTrack.style.setProperty('--cr-tt', `"${ttText}"`);
        }

        const alerts = Array.isArray(alertasResponse?.data) ? alertasResponse.data : [];
        const activities = [];
        allTasks.slice(0, 3).forEach((task) => {
            const isPending = !String(task?.estado || '').toLowerCase().includes('conclu');
            activities.push({
                title: task?.titulo || 'Tarefa',
                meta: `${task?.parcela_nome || 'Sem parcela'} · ${task?.estado || 'Pendente'}`,
                icon: '📋',
                urgent: isPending,
            });
        });
        alerts.slice(0, 2).forEach((alert) => {
            activities.push({
                title: alert?.titulo || 'Alerta do sistema',
                meta: alert?.mensagem || alert?.message || 'Nova notificação recebida',
                icon: '⚠️',
                urgent: true,
            });
        });
        if (activities.length === 0) {
            activities.push({ title: 'Perfil criado', meta: 'Completa os teus dados para personalizar a experiência.', icon: '👤' });
        }
        renderActivity(activities);
    };

    const showSaveStatus = (msg, isError = false) => {
        if (!saveStatus) return;
        saveStatus.hidden = false;
        saveStatus.textContent = msg;
        saveStatus.style.color = isError ? 'rgba(180,35,24,0.9)' : 'rgba(47,111,59,0.92)';
        setTimeout(() => { saveStatus.hidden = true; }, 3000);
    };

    const saveProfile = async () => {
        const nome = inputName?.value.trim() || '';
        const email = inputEmail?.value.trim() || '';

        if (!nome) throw new Error('O nome é obrigatório.');
        if (!email) throw new Error('O email é obrigatório.');

        const response = await api.fetchJson(`usuarios/atualizar/${liveUser.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email }),
        });
        if (response?.success === false) throw new Error(response?.message || 'Erro ao guardar.');

        liveUser = toUserShape({ ...liveUser, nome, email }, liveUser);
        /* Atualiza a sessão (localStorage). */
        localStorage.setItem('user', JSON.stringify(liveUser));
        updateIdentityUI();
        markClean();
    };

    saveBtn?.addEventListener('click', async () => {
        const original = saveBtn.textContent;
        saveBtn.disabled = true;
        saveBtn.classList.add('is-loading');
        saveBtn.textContent = 'A guardar…';
        saveStatus && (saveStatus.hidden = true);
        try {
            await saveProfile();
            saveBtn.classList.remove('is-loading');
            saveBtn.textContent = '✓ Guardado';
            showSaveStatus('Perfil atualizado com sucesso.');
            if (window.CocoRootToast) window.CocoRootToast('Perfil', 'Dados guardados');
            setTimeout(() => { if (saveBtn.textContent === '✓ Guardado') saveBtn.textContent = original; }, 2200);
        } catch (err) {
            saveBtn.classList.remove('is-loading');
            saveBtn.textContent = original;
            showSaveStatus(friendlyError(err, 'Não foi possível guardar o perfil.'), true);
            if (window.CocoRootToast) window.CocoRootToast('Perfil', 'Erro ao guardar dados');
        } finally {
            saveBtn.disabled = false;
        }
    });

    const setPwdStatus = (msg, isError = false) => {
        if (!pwdStatus) return;
        pwdStatus.hidden = !msg;
        pwdStatus.textContent = msg;
        pwdStatus.style.color = isError ? 'rgba(180,35,24,0.9)' : 'rgba(47,111,59,0.92)';
    };

    const openPwdForm = () => {
        if (pwdForm) pwdForm.hidden = false;
        if (pwdHint) pwdHint.hidden = true;
        if (pwdToggleBtn) pwdToggleBtn.hidden = true;
        setPwdStatus('');
        pwdAtual?.focus();
    };

    const closePwdForm = () => {
        if (pwdForm) pwdForm.hidden = true;
        if (pwdHint) pwdHint.hidden = false;
        if (pwdToggleBtn) pwdToggleBtn.hidden = false;
        [pwdAtual, pwdNova, pwdConfirmar].forEach((el) => { if (el) el.value = ''; });
        setPwdStatus('');
    };

    pwdToggleBtn?.addEventListener('click', openPwdForm);
    pwdCancelBtn?.addEventListener('click', closePwdForm);

    pwdSaveBtn?.addEventListener('click', async () => {
        const atual = pwdAtual?.value || '';
        const nova = pwdNova?.value || '';
        const confirmar = pwdConfirmar?.value || '';

        if (!atual) { setPwdStatus('Introduz a password atual.', true); return; }
        if (!nova) { setPwdStatus('Introduz a nova password.', true); return; }
        if (nova.length < 6) { setPwdStatus('A nova password deve ter pelo menos 6 caracteres.', true); return; }
        if (nova !== confirmar) { setPwdStatus('As passwords não coincidem.', true); return; }

        const original = pwdSaveBtn.textContent;
        pwdSaveBtn.disabled = true;
        pwdSaveBtn.textContent = 'A guardar…';
        setPwdStatus('');

        try {
            const response = await api.fetchJson(`usuarios/alterar-password/${liveUser.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password_atual: atual, password_nova: nova }),
            });
            if (response?.success === false) throw new Error(response?.message || 'Erro ao alterar password.');
            setPwdStatus('Password alterada com sucesso!');
            if (window.CocoRootToast) window.CocoRootToast('Perfil', 'Password alterada');
            setTimeout(closePwdForm, 1800);
        } catch (err) {
            setPwdStatus(friendlyError(err, 'Não foi possível alterar a password.'), true);
        } finally {
            pwdSaveBtn.disabled = false;
            pwdSaveBtn.textContent = original;
        }
    });

    initIdentity();
    initPreferences();
    initInterests();
    try { await loadStats(); } catch { }
});


