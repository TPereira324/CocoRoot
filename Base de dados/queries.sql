SELECT COUNT(*) AS total_parcelas FROM parcela;

SELECT COUNT(*) AS parcelas_saudaveis
FROM parcela
WHERE
    par_estado = 'Saudável';

SELECT COUNT(*) AS parcelas_atencao
FROM parcela
WHERE
    par_estado = 'Atenção';

SELECT * FROM tarefa WHERE tar_estado = 'Pendente';

SELECT COUNT(*) AS tarefas_pendentes
FROM tarefa
WHERE
    tar_estado = 'Pendente';

SELECT t.tar_titulo, t.tar_estado, t.tar_prioridade
FROM tarefa t
    JOIN utilizador u ON t.tar_ut_id = u.ut_id
WHERE
    u.ut_nome = 'Ana Silva';

SELECT n.not_mensagem, n.not_data
FROM notificacao n
    JOIN utilizador u ON n.not_ut_id = u.ut_id
WHERE
    u.ut_nome = 'Ana Silva';

SELECT u.ut_nome, p.par_nome
FROM parcela p
    JOIN utilizador u ON p.par_ut_id = u.ut_id;