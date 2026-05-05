# 🧬 Milestone 7 — Schema Visualizer (painelzão ER)

> **Status:** 📋 Proposta — aguardando aprovação do Diretor
> **Predecessora:** M5 (Atlas Redesign) idealmente fechado pra usar primitivos editoriais.
> **Alvo de entrega:** ~1-2 semanas
> **Objetivo:** dar ao admin uma visão **diagramática** de todas as tabelas do workspace e como elas se conectam via foreign keys. Resolver a fadiga mental de "eu tenho 20 tabelas, qual referencia qual?".

---

## 🎯 Por que estamos fazendo isso

Hoje:
- Em `/admin/tables/create` cada coluna pode virar FK, mas a relação fica "escondida" no DB
- A tela de edição mostra FKs como `<select>` mas você não vê o **mapa completo**
- Em databases com 10+ tabelas, mentalizar conexões via texto é impraticável

Diretor pediu literalmente: *"o projetar já esta ok eu só adicionaria um jeit da pessoa poder ver como as tabelas se conectam e afins sabe um painelzão seria bom"*.

**O que isso entrega:**
- Diagrama ER (Entity-Relationship) com cada tabela como um node
- Edges (linhas) entre tabelas representando FKs, com label da coluna
- Drag-drop pra reorganizar, com auto-layout inicial
- Click na tabela → abre lateral com detalhes/edição rápida
- Export como PNG/SVG pra documentação ou apresentações

---

## 📐 Arquitetura

### Stack proposto
- **`@xyflow/react`** (anteriormente react-flow) — biblioteca battle-tested pra diagramas interativos
  - Já usada por Supabase, Stripe, Whimsical
  - 30+ exemplos de ERD prontos
  - Custom nodes via React (perfeito pra estilização Mora editorial)
- **`dagre`** ou **`elk.js`** — auto-layout algorithm (decisão na Fase 1)
- **`html-to-image`** — export PNG/SVG

### Custom node Mora
Cada tabela = card editorial com:
```
┌─ tenant_5.clientes ─────────────────┐
│ 03                          PRIVADO │   ← SectionNum + Pill
├─────────────────────────────────────┤
│ 🔑 id              INT PRIMARY      │   ← colunas com badges
│    nome            TEXT             │
│    email           VARCHAR(120)     │
│ 🔗 grupo_id        INT → grupos     │   ← FK indicada inline
│    created_at      DATETIME         │
└─────────────────────────────────────┘
   ↓ 12 registros · 5 colunas · 1 FK
```

Edges:
- FK = linha sólida com label da coluna
- Tabelas sem FK = isoladas no canvas
- Direção: `from_table.column → to_table.column`

### Rota nova
`/admin/schema` ou `/admin/diagram` — decidir na Fase 0.

### Endpoint reusado
`GET /tables/` já retorna `columns` + `relations` (via M2 + M5). Não precisa de backend novo.

---

## 🧭 Fases

### Fase 0 — Prep + decisão de stack (1 dia)
- [ ] Spike: testar `@xyflow/react` + `dagre` em sandbox
- [ ] Validar que custom node Mora cabe no estilo editorial (sem quebrar layout dos primitivos)
- [ ] Definir rota: `/admin/schema` (mais descritivo)
- [ ] Adicionar `@xyflow/react` + `dagre` ao `frontend/package.json`

### Fase 1 — Renderização básica (2-3 dias)
- [ ] Criar `frontend/src/app/admin/schema/page.tsx`
- [ ] Fetch `/tables/` no mount → transformar em `nodes[]` + `edges[]`
- [ ] Render `<ReactFlow>` com layout dagre auto
- [ ] Custom node component em `frontend/src/components/schema/TableNode.tsx`
- [ ] Edges com label de coluna FK
- [ ] Pan + zoom + fit-view inicial

### Fase 2 — Interação (3-4 dias)
- [ ] Click em node → drawer lateral direito com detalhes da tabela
- [ ] Drawer mostra: stats (rows/cols/rels), lista de colunas full, lista de FKs in/out
- [ ] Botões no drawer: "Ver dados", "Editar schema", "Tornar pública"
- [ ] Drag-drop persistente: posições salvas em `localStorage.schema-layout-{workspace_slug}`
- [ ] Botão "Auto-layout" pra resetar dagre
- [ ] Highlight: hover num node ilumina suas edges + nodes conectados

### Fase 3 — Filtros + export + polish (2 dias)
- [ ] Search bar: filtra nodes que matcham o termo
- [ ] Toggle: "só com FKs" / "todas" / "só públicas"
- [ ] Export: botão "Baixar PNG/SVG" via `html-to-image`
- [ ] Minimap canto inferior direito
- [ ] Toolbar: zoom in/out/fit, density toggle

### Fase 4 — Polish editorial (1 dia)
- [ ] Aplicar tokens Mora no canvas: fundo `var(--bg-page)`, edges `var(--rule)`, accent FK `var(--accent)`
- [ ] Hover/focus com `var(--ease-editorial)`
- [ ] Eyebrow "MAPA DE TABELAS · {workspace_name}" no header
- [ ] Hairline strong separando header do canvas
- [ ] Drawer com `<Card>` + tokens

### Fase 5 — Tests + docs (1 dia)
- [ ] Testar em workspace com 1 tabela, 5 tabelas, 20 tabelas, 50 tabelas
- [ ] Performance: render < 500ms até 100 tabelas
- [ ] Update [planning/patch_notes.md](./patch_notes.md)

**Total:** ~9-12 dias.

---

## 🎨 Design proposto (mock textual)

```
┌─ ATLAS · MAPA DE TABELAS · puczaras ──────────────────────────┐
│                                              [🔍 buscar...]   │
│ 23 TABELAS · 14 RELAÇÕES · 312 COLUNAS                        │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│   ┌─ admins ─┐     ┌─ database_groups ─┐     ┌─ moderators ─┐│
│   │ id PK    │     │ id PK             │     │ id PK         ││
│   │ username │←────│ owner_id (FK)     │←────│ parent_id (FK)││
│   │ email    │     │ name              │     │ username      ││
│   └──────────┘     └───────────────────┘     └───────────────┘│
│                            ↑                                  │
│                            │                                  │
│                    ┌─ moderator_perms ─┐                      │
│                    │ id PK              │                      │
│                    │ moderator_id (FK)  │                      │
│                    │ group_id (FK)      │                      │
│                    └────────────────────┘                      │
│                                                               │
│ [Auto-layout] [Densa] [Cards]              [📥 PNG] [📥 SVG]   │
└───────────────────────────────────────────────────────────────┘
```

---

## ⚠️ Decisões em aberto

1. **Tabelas de sistema (`_tables`, `_columns`, `users`) aparecem ou não?**
   - Aparecer: completo, mas polui pro admin que só quer ver SUAS tabelas
   - **Recomendação:** toggle "Mostrar tabelas do sistema" off por default

2. **Edges com cardinality (1:1 / 1:N / N:N)?**
   - Mais correto, mas precisa inferir do schema
   - **Recomendação:** versão 1 sem cardinality (todos como 1:N por simplicidade), iterar depois

3. **Edição inline?** Click numa coluna pra renomear direto no diagrama?
   - Cool mas perigoso (rename quebra dados)
   - **Recomendação:** versão 1 só leitura + drawer; edição fica no Schema Editor

4. **Salvar layout por workspace ou por user?**
   - User: cada admin organiza do seu jeito
   - Workspace: time inteiro vê o mesmo layout
   - **Recomendação:** localStorage por user, opção "Salvar como layout do workspace" pra teams (futuro)

5. **Ferramenta vs `@xyflow/react`:**
   - Alternativas: D3, Cytoscape, mermaid (read-only)
   - **Recomendação:** `@xyflow/react` ganha por DX (custom nodes em React) + ecosystem

---

## 🧾 Critério de aceite

- [ ] `/admin/schema` carrega em < 500ms com 20 tabelas
- [ ] Cada tabela mostra colunas + PK + FK indicators
- [ ] Edges conectam FKs corretamente, com label da coluna
- [ ] Click em tabela abre drawer com detalhes + ações
- [ ] Drag-drop salva posição em localStorage
- [ ] "Auto-layout" reseta com dagre
- [ ] Search filtra nodes
- [ ] Export PNG funciona
- [ ] Visual coerente com identidade Mora (Fraunces, tokens, hairlines)
- [ ] Sidebar nav admin tem item novo "Mapa" / "Schema" linkando aqui
- [ ] `npm run build` passa
- [ ] Smoke: workspace com 0 tabelas mostra empty state editorial

---

## 🔗 Dependências

- **Bloqueia:** nenhum milestone.
- **Bloqueado por:** M5 (primitivos UI maduros).
- **Sinergia com:** M2 (relações já existem no DB), M11 (futuramente IA pode sugerir FKs faltando vendo o diagrama).

---

## 💡 Inspirações

- **Supabase Database Visualizer** — `@xyflow/react`, custom nodes elegantes
- **dbdiagram.io** — text-to-diagram, foco em ERDs
- **drawSQL** — ERD colaborativo, custom nodes ricos
- **Linear's roadmap view** — usa react-flow com cards editoriais

Estes podem servir de referência visual. O nosso será **mais editorial** (Fraunces, hairlines, paper-texture sutil no canvas) e menos "técnico/SaaS-genérico".
