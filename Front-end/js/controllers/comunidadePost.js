document.addEventListener('DOMContentLoaded', async () => {
    const api = window.CocoRootApi;
    if (!api) return;

    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');

    const titleEl = document.getElementById('c-title');
    const badgeEl = document.getElementById('c-badge');
    const metaEl = document.getElementById('c-meta');
    const bodyEl = document.getElementById('c-body');
    const commentsEl = document.getElementById('community-comments');
    const commentsTitleEl = document.getElementById('community-comments-title');
    const errorEl = document.getElementById('community-post-error');
    const form = document.getElementById('community-comment-form');
    const textarea = document.getElementById('community-comment-input');

    let currentPost = null;
    let currentComments = [];

    const setError = (message) => {
        if (!errorEl) return;
        errorEl.hidden = !message;
        errorEl.textContent = message || '';
    };

    const formatDate = (value) => {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        return new Intl.DateTimeFormat('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const deleteComment = async (commentId) => {
        if (!confirm('Tem a certeza que deseja apagar este comentário?')) {
            return;
        }

        const user = api.getLoggedUser();
        if (!user?.id) {
            setError('Precisas de iniciar sessão.');
            return;
        }

        try {
            await api.fetchJsonDelete(`forum/deletarComentario/${commentId}`, {
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ut_id: user.id,
                }),
            });
            setError('');
            await loadPost();
        } catch (error) {
            setError(error.message || 'Não foi possível apagar o comentário.');
        }
    };

    const deletePost = async () => {
        if (!confirm('Tem a certeza que deseja apagar esta publicação? Esta ação não pode ser desfeita.')) {
            return;
        }

        const user = api.getLoggedUser();
        if (!user?.id) {
            setError('Precisas de iniciar sessão.');
            return;
        }

        try {
            await api.fetchJsonDelete(`forum/deletarPublicacao/${postId}`, {
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ut_id: user.id,
                }),
            });
            window.location.href = 'comunidade.html';
        } catch (error) {
            setError(error.message || 'Não foi possível apagar a publicação.');
        }
    };

    const renderComments = (comments) => {
        if (!commentsEl) return;
        currentComments = comments;
        if (commentsTitleEl) {
            commentsTitleEl.textContent = `${Array.isArray(comments) ? comments.length : 0} Respostas`;
        }
        if (!Array.isArray(comments) || comments.length === 0) {
            commentsEl.innerHTML = '<div class="card"><div style="color:var(--muted);line-height:1.6;">Ainda não existem respostas para esta publicação.</div></div>';
            return;
        }

        const user = api.getLoggedUser();
        commentsEl.innerHTML = comments.map((comment) => {
            const isAuthor = user?.id === comment.autor?.id;
            const deleteButton = isAuthor ? `<button class="community-reply-delete" onclick="if (window.deleteComment) window.deleteComment(${comment.id})" title="Apagar comentário"><i class="bi bi-trash" aria-hidden="true"></i></button>` : '';

            return `
            <div class="community-reply">
                <div class="community-reply-avatar"><i class="bi bi-person" aria-hidden="true"></i></div>
                <div class="community-reply-content">
                    <div class="community-reply-text">${comment.conteudo || ''}</div>
                    <div class="community-reply-meta">${comment.autor?.nome || 'Utilizador'} • ${formatDate(comment.data)}</div>
                </div>
                <div class="community-reply-actions">
                    <div class="community-reply-like"><i class="bi bi-heart" aria-hidden="true"></i></div>
                    ${deleteButton}
                </div>
            </div>
        `}).join('');

        // Make deleteComment available to inline onclick
        window.deleteComment = deleteComment;
    };

    const loadPost = async () => {
        if (!postId) {
            setError('Publicação inválida.');
            return;
        }

        try {
            const [postResponse, commentsResponse] = await Promise.all([
                api.fetchJson(`forum/detalhe/${postId}`),
                api.fetchJson(`forum/comentarios/${postId}`),
            ]);

            const post = postResponse?.data;
            if (!post) {
                setError('Publicação não encontrada.');
                return;
            }

            currentPost = post;
            const user = api.getLoggedUser();
            const isAuthor = user?.id === post.autor?.id;

            if (titleEl) titleEl.textContent = post.titulo || 'Sem título';
            if (badgeEl) badgeEl.textContent = post.categoria_label || 'Outro';

            // Render meta with delete button if author
            if (metaEl) {
                const deleteBtn = isAuthor ? `<button class="community-delete-post-btn" onclick="if (window.deletePost) window.deletePost()" title="Apagar publicação"><i class="bi bi-trash" aria-hidden="true"></i> Apagar</button>` : '';
                metaEl.innerHTML = `${post?.autor?.nome || 'Utilizador'} ${deleteBtn}`;
            }

            if (bodyEl) bodyEl.textContent = post.conteudo || 'Sem conteúdo.';
            document.title = `${post.titulo || 'Publicação'} - CocoRoot`;

            renderComments(Array.isArray(commentsResponse?.data) ? commentsResponse.data : []);

            // Show/hide comment form
            if (form) {
                form.hidden = !user?.id;
            }

            setError('');
        } catch (error) {
            renderComments([]);
            setError(error.message || 'Não foi possível carregar esta publicação.');
        }
    };

    form?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const user = api.getLoggedUser();
        const content = String(textarea?.value || '').trim();

        if (!user?.id) {
            setError('Precisas de iniciar sessão para comentar.');
            return;
        }
        if (!content) {
            setError('Escreve uma resposta antes de enviar.');
            return;
        }

        try {
            await api.fetchJson(`forum/comentar/${postId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ut_id: user.id,
                    conteudo: content,
                }),
            });
            if (textarea) textarea.value = '';
            await loadPost();
        } catch (error) {
            setError(error.message || 'Não foi possível enviar o comentário.');
        }
    });

    // Make deletePost available to inline onclick
    window.deletePost = deletePost;

    await loadPost();
});
