# Especificação de Design (Desktop-first)

## Tokens e estilos globais

* Layout: Grid/Flex híbrido. Contêiner central com largura máxima (ex.: 1200px) e gutters consistentes.

* Breakpoints (referência):

  * Desktop: ≥ 1024px (primário)

  * Tablet: 768–1023px (colapsar colunas)

  * Mobile: ≤ 767px (stack vertical)

* Cores (tokens):

  * \--bg: #0B1220 (background)

  * \--surface: #101A2E (cards)

  * \--text: #E6EAF2

  * \--muted: #9AA4B2

  * \--primary: #5B8CFF

  * \--border: rgba(255,255,255,0.08)

  * \--success: #2ECC71

  * \--danger: #FF5B6E

* Tipografia:

  * Base 16px; escala: 12/14/16/20/24/32

  * Heading: semibold; corpo: regular

* Componentes base:

  * Botão primário: fundo --primary, texto branco; hover: escurecer 6–10%

  * Botão secundário: surface + borda --border; hover: elevar sombra leve

  * Input/textarea: background --surface, borda --border; focus: outline --primary

  * Links: cor --primary; hover: underline

* Estados:

  * Loading: skeleton em listas/cards

  * Empty state: mensagem + ação sugerida (ex.: limpar filtros)

  * Error state: banner no topo da área de conteúdo

***

## Página: Dashboard

### Layout

* Sistema: CSS Grid com 2 colunas (conteúdo principal + lateral) em desktop.

* Responsivo:

  * Tablet/Mobile: virar 1 coluna, sidebar abaixo.

### Meta information

* Title: "Dashboard"

* Description: "Visão geral e atalhos para navegar na comunidade."

* Open Graph:

  * og:title: "Dashboard"

  * og:description: "Visão geral e atalhos para navegar na comunidade."

### Estrutura da página

1. **Top App Bar (fixa ou sticky)**

   * Logo/Nome do produto (esquerda)

   * Links: Dashboard (ativo), Comunidade

   * Área de usuário (placeholder: avatar/nome) — opcional, sem exigir login na UI
2. **Conteúdo (Grid)**

   * **Coluna principal**

     * Seção "Visão geral"

       * Cards (2–4) com resumo simples (ex.: “Atividade recente”, “Posts recentes”)

     * Seção "Últimos posts/itens"

       * Lista de cards clicáveis (título + trecho + data)

       * Clique abre o Detalhe do Post

   * **Coluna lateral**

     * Card "Atalhos"

       * Botão/Link primário: "Ir para Comunidade"

       * Links rápidos adicionais (se necessário) mantendo mínimo

### Interações

* Cards/lista: hover com elevação e cursor pointer.

* Navegação: estado ativo destacado (underline/badge).

***

## Página: Comunidade (lista com abas/filtros)

### Layout

* Sistema: Flex coluna com header + barra de controles + lista.

* Lista: cards em coluna única (desktop) com espaçamento 12–16px.

### Meta information

* Title: "Comunidade"

* Description: "Explore posts por abas e filtros."

* Open Graph:

  * og:title: "Comunidade"

  * og:description: "Explore posts por abas e filtros."

### Estrutura da página

1. **Top App Bar**

   * Links: Dashboard, Comunidade (ativo)
2. **Header da página**

   * Título: "Comunidade"

   * Subtexto curto (muted) explicando o feed
3. **Abas (Tabs)**

   * Tabs horizontais: "Recentes", "Em alta", "Seguindo" (labels curtas)

   * Indicador visual: underline + cor --primary
4. **Barra de filtros**

   * Campo de busca (placeholder: "Buscar posts")

   * Select de ordenação (ex.: "Mais recentes" / "Mais relevantes" — se aplicável)

   * Botão "Limpar" (aparece quando houver filtro aplicado)
5. **Lista de posts**

   * Card do post:

     * Título (H3)

     * Metadados (autor, data) em texto muted

     * Trecho do corpo (2–3 linhas com ellipsis)

     * Indicador de quantidade de respostas (se disponível)

   * Paginação/Carregar mais:

     * Preferência: botão "Carregar mais" no final para simplicidade
6. **Estados**

   * Loading skeleton (cards)

   * Empty: "Nenhum post encontrado" + botão "Limpar filtros"

### Interações

* Trocar aba: atualiza lista e reseta paginação.

* Busca: debounce (ex.: 300–500ms) e indicador de carregamento.

* Clique no card: navega para Detalhe do Post.

***

## Página: Detalhe do Post (respostas e enviar resposta)

### Layout

* Sistema: Grid 2 colunas em desktop (conteúdo do post + painel de ações/resumo).

* Responsivo:

  * Tablet/Mobile: 1 coluna; painel vira seção abaixo.

### Meta information

* Title: "Detalhe do post"

* Description: "Leia o post e participe respondendo."

* Open Graph:

  * og:title: "Detalhe do post"

  * og:description: "Leia o post e participe respondendo."

### Estrutura da página

1. **Top App Bar**

   * Links: Dashboard, Comunidade

   * Breadcrumb simples abaixo do header (opcional): "Comunidade > Post"
2. **Conteúdo do post (coluna principal)**

   * Card "Post"

     * Título

     * Metadados (autor, data)

     * Corpo do post (texto completo)
3. **Respostas (thread)**

   * Título da seção: "Respostas"

   * Lista vertical:

     * Item de resposta: autor + data (linha 1), corpo (linha 2+)

     * Separadores leves por borda --border
4. **Enviar resposta**

   * Card fixo na base do conteúdo (ou logo acima da lista, conforme UX)

   * Textarea (mín. 3 linhas, auto-expand opcional)

   * Ações:

     * Botão primário "Enviar"

     * Estado "Enviando..." desabilita inputs

   * Validação:

     * Bloquear envio vazio e mostrar helper text
5. **Painel lateral (desktop)**

   * Card "Ações"

     * Botão "Voltar para Comunidade"

     * (Opcional) mostrar contagem de respostas

### Interações

* Ao enviar: inserir a nova resposta no topo/fim conforme ordenação definida e scroll suave até a resposta (opcional).

* Erro ao enviar: toast/banner no card de envio com opção "Tentar novamente".

