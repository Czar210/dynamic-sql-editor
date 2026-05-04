# 🗺️ Roadmap Atlas — Visão de Longo Prazo

> **Última atualização:** 2026-05-04
> **Mantido por:** Diretor + Claude (Programador)
> **Convenção:** ✅ done · 🔵 in progress · 📋 planejado · 🧊 congelado · 💭 ideia

Este documento é o mapa estratégico de tudo que está construído, em construção, ou planejado para o Atlas. Para cada milestone existe (ou existirá) um plano técnico detalhado em `planning/milestone_N_*.md`.

---

## Onde estamos hoje

| Milestone | Status | Resumo |
|---|---|---|
| **M1** Estabilização + CRUD básico | ✅ done | CRUD dinâmico testado, conftest refatorado, patch notes 1.0.x |
| **M2** Foreign Keys + SQL Import + Admin UI | ✅ done | FKs funcionais, dry-run de SQL, CRUD completo, 38 testes verdes |
| **M5** Atlas Redesign / Mora Editorial | 🔵 fase 4 polish | Tokens + 15 telas redesenhadas + Tweaks Panel + polish editorial |
| **M3** RLS / Supabase-Native | 📋 planejado | Schema-per-tenant + RLS, prep pra deploy real |
| **M4** Auth Unification | 🧊 congelado | Esperando M3 fechar |

---

## Próximos 6 meses

Em ordem de **prioridade sugerida** (a definir com Diretor):

### 🟢 Faixa 1 — Logo após M5
Cada um destes pode ser próximo. Diretor decide ordem.

#### **M3** — RLS / Supabase-Native (backend)
- **Por quê:** sair do SQLite com prefixo `t{id}_` pra Postgres com schema-per-tenant + RLS. Pré-requisito pra deploy real (Vercel + Supabase + Railway).
- **Escopo:** 8 fases (~4-6 semanas), Alembic + dual-engine + RLS policies + migration script.
- **Dependências:** nenhuma — pode começar a qualquer momento.
- **Plano:** [milestone_3_rls_migration.md](./milestone_3_rls_migration.md)
- **Risco:** alto — refactor sensível com cinto-e-suspensórios.

#### **M6** — Publish & Export (publicação real do site)
- **Por quê:** hoje só existe toggle `is_public` por tabela. Falta fluxo completo: selecionar tabelas pro site, escolher tema, publicar como `slug.atlas.app` ou exportar pacote estático.
- **Escopo:** 5 fases (~2-3 semanas), backend `/api/publish/*` + frontend wire de Theme Studio + subdomain routing.
- **Dependências:** M5 fechado (Theme Studio é mock atualmente). Não depende de M3.
- **Plano:** [milestone_6_publish_export.md](./milestone_6_publish_export.md) ← **NOVO**
- **Risco:** médio — subdomain routing tem pegadinhas.

#### **M7** — Schema Visualizer (painelzão ER)
- **Por quê:** Diretor pediu — visualizar como as tabelas se conectam via FKs. Hoje só dá pra ver relação tabela-por-tabela. Em databases grandes vira impossível mentalizar.
- **Escopo:** 3 fases (~1-2 semanas), nova rota `/admin/schema`, react-flow + auto-layout, drag-drop opcional.
- **Dependências:** nenhuma — só usa o `_relations` que já existe.
- **Plano:** [milestone_7_schema_visualizer.md](./milestone_7_schema_visualizer.md) ← **NOVO**
- **Risco:** baixo — feature autocontida.

### 🟡 Faixa 2 — Médio prazo (depois de Faixa 1)

#### **M8** — Media Library + File Uploads
- **Por quê:** colunas tipo `image`, `file`, `attachment` não existem. Hoje admin que quer subir foto tem que colocar URL externa.
- **Escopo:** novo column type, storage backend (S3-compatible ou local), thumbnail generator, UI de upload.
- **Dependências:** M3 (Supabase Storage é caminho natural).

#### **M9** — Webhooks + API Keys + Audit Log
- **Por quê:** integração com sistemas externos (Zapier, n8n, scripts). Audit log pra compliance/debugging ("quem mudou o quê quando").
- **Escopo:** 
  - Tabela `_webhooks` com triggers (on_create/update/delete por tabela)
  - Tabela `_api_keys` com scopes (read/write por tabela)
  - Tabela `_audit_log` com tudo gravado
- **Dependências:** M3 (RLS facilita audit).

### 🔵 Faixa 3 — Longo prazo (1+ ano)

#### **M10** — Real-time + Collaborative Editing
- **Por quê:** múltiplos admins editando a mesma tabela ao mesmo tempo. Vê quem está vendo, evita conflict.
- **Escopo:** WebSocket subscription via Supabase Realtime, presence indicators, optimistic UI.
- **Dependências:** M3 obrigatório (Supabase Realtime).

#### **M11** — AI Helpers (LLM-powered)
- **Por quê:** "Crie uma tabela de clientes com email único e telefone" → schema gerado. "Quantos clientes não compraram nos últimos 30 dias?" → query SQL gerada e executada.
- **Escopo:** integração com Claude API, prompt engineering pra schema synthesis e NL→SQL, validation layer.
- **Dependências:** M3 + dataset com schemas reais pra calibrar.

#### **M12** — Mobile Companion App
- **Por quê:** hoje QR auth funciona mas é improviso. App nativo pra autorizar QR + fazer edições leves on-the-go.
- **Escopo:** React Native ou Expo, scope reduzido (só QR + view + edit simples).
- **Dependências:** M3 + M9 (API keys).

---

## Backlog de ideias (sem ordem)

Coisas que podem virar milestones se ganharem tração:

| Ideia | Justificativa |
|---|---|
| **Computed/Formula columns** | Coluna `total = preco * quantidade` calculada server-side |
| **Saved views / queries** | Salvar filtros + ordenação como "view" reusável |
| **Bulk operations** | Editar/deletar 100 rows de uma vez via checkbox |
| **i18n da interface** | Inglês/espanhol além de PT-BR |
| **Marketplace de templates** | Galeria de schemas prontos (ecommerce, CRM, blog, etc.) |
| **Snapshot/Backup** | Botão "exportar tudo deste tenant" → ZIP com SQL + JSON |
| **Search global cross-table** | Busca única que olha todas as tabelas (precisa de Postgres FTS) |
| **Validation rules customizadas** | Regex/range/lookup constraints além das do SQL |
| **Soft-delete + recovery** | "Lixeira" com restore antes de purge definitivo |
| **Slack/Discord/Email integrations** | Notificações nativas em mudanças importantes |

---

## Princípios de priorização

Quando decidir o próximo milestone, em ordem:

1. **Bloqueio técnico** — o que está travando deploy real ou fluxo crítico? (Hoje: M3.)
2. **Pedido explícito do Diretor** — features que vieram da visão do produto. (Hoje: M6, M7.)
3. **Risco operacional** — backup, audit, security são divida que cresce. (M9.)
4. **Diferenciação competitiva** — o que outros CMS dinâmicos não fazem? (M11 IA.)
5. **Quality of life** — coisas que somam mas não bloqueiam. (Backlog.)

**Regra de ouro:** uma milestone por vez no foco principal. Pode haver paralelo (como M5 rodou paralelo a M3 docs), mas só se for área completamente diferente.

---

## Como este doc evolui

- **Após cada milestone fechar:** mover de "🔵 in progress" pra "✅ done", adicionar link pro patch_notes.
- **Quando uma ideia virar milestone:** mover do backlog pra Faixa 2/3, criar `milestone_N_*.md`.
- **Trimestral:** revisar prioridades com Diretor — pode reordenar tudo.
- **Não delete histórico** — milestones canceladas viram 🧊 com motivo, não somem.
