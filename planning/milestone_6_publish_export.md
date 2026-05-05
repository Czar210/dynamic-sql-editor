# 📤 Milestone 6 — Publish & Export

> **Status:** 📋 Proposta — aguardando aprovação do Diretor
> **Predecessora obrigatória:** M5 (Atlas Redesign) precisa estar 100% mergeado.
> **Recomendada (não obrigatória):** M3 (RLS/Postgres) — sem ela, "publicar" continua sendo SQLite local.
> **Alvo de entrega:** ~2-3 semanas
> **Objetivo:** transformar a página `/admin/publish` (hoje mock visual) em um fluxo real de publicação. Permitir que o admin escolha **quais tabelas** vão pro site público, **qual tema visual**, e gere uma **URL pública** (`/{slug}` hoje, `slug.atlas.app` no futuro) ou **exportação estática** (ZIP com HTML+JSON).

---

## 🎯 Por que estamos fazendo isso

Hoje:
- `is_public` é toggle binário **por tabela** — ou aparece em `/explore` e `/{slug}`, ou não.
- `/{slug}` lista **todas** as tabelas públicas — sem ordem, sem curadoria, sem tema customizado.
- `/admin/publish` (Theme Studio) é **mock visual** com botões disabled. Ver `// TODO(M6)` markers.
- Não há concept de "deploy" ou "snapshot" — qualquer mudança no DB reflete imediatamente no público.

**Problema:** Diretor quer compartilhar o database como uma "publicação". Hoje só dá pra mandar o link `/{slug}` que mostra tudo cru. Falta:
- Seleção curada (quais tabelas, em que ordem)
- Tema próprio (cores, fontes, layout do site público — não do admin)
- Snapshot estável (publicação = freeze, não live)
- Export pra hospedar fora (Vercel/Netlify estático, ou ZIP pra arquivar)

---

## 📐 Arquitetura alvo

### Conceito: "Publication"
Uma **publication** é um snapshot configurado de um workspace. Ela contém:
- `id`, `slug`, `version`, `created_at`, `published_at`
- `theme_config` JSON (preset + overrides de cor/font)
- `tables` JSON (lista ordenada de table_ids selecionadas, cada uma com layout hint: "hero", "list", "grid", "ensaio")
- `snapshot_url` (S3 ou file system) com JSON dump completo dos dados na hora da publicação
- `is_active` (uma publication ativa por workspace)

### Tabela nova: `_publications`
```sql
CREATE TABLE _publications (
  id INTEGER PRIMARY KEY,
  workspace_id INTEGER REFERENCES users(id),
  slug VARCHAR NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  theme_config JSON,
  tables_config JSON,      -- [{table_id, position, layout: 'hero|list|grid|ensaio'}]
  snapshot_path VARCHAR,   -- caminho do dump congelado
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  published_at TIMESTAMP,
  UNIQUE(workspace_id, slug, version)
);
```

### Endpoints novos
| Método | Path | O que faz |
|---|---|---|
| `POST` | `/api/publish/preview` | Gera preview sem persistir — mostra como ficaria o site |
| `POST` | `/api/publish/snapshot` | Cria nova `_publication` com snapshot do estado atual |
| `POST` | `/api/publish/{id}/activate` | Marca publication como ativa (substitui a anterior) |
| `GET` | `/api/publish/history` | Lista publications anteriores |
| `POST` | `/api/publish/{id}/rollback` | Restaura publication anterior |
| `POST` | `/api/publish/{id}/export` | Gera ZIP com HTML+JSON |
| `GET` | `/api/public/site/{slug}` | Serve dados da publication ativa (substitui `/api/public/tables`) |

### Routing público
```
/{slug}                    → atualmente lista raw das tabelas públicas
/{slug}                    → após M6: serve da publication ativa, com tema e ordem definidos
/{slug}/{table_name}       → drill-down de uma tabela específica (já existe parcial)
slug.atlas.app             → fase 5 (subdomain), opcional
```

---

## 🧭 Fases

| Fase | Entrega | Duração |
|---|---|---|
| **Fase 0** | Pré-requisitos: M5 mergeado, Theme Studio refs revisitadas | 1 dia |
| **Fase 1** | Modelo `_publications` + migration Alembic + endpoints CRUD básicos | 2-3 dias |
| **Fase 2** | Theme Studio frontend wired (preview + presets reais) | 3-4 dias |
| **Fase 3** | Seletor de tabelas com layout hints (hero/list/grid/ensaio) | 2-3 dias |
| **Fase 4** | Snapshot + activation + history/rollback | 2-3 dias |
| **Fase 5** | Export estático (ZIP com HTML pré-renderizado + JSON) | 3 dias |
| **Fase 6** | (Opcional) Subdomain routing `slug.atlas.app` via Vercel rewrites | 2 dias |
| **Fase 7** | TestSprite + smoke manual | 2-3 dias |

**Total:** ~15-20 dias úteis.

---

## 🎨 Fase 2 detalhada — Theme Studio

A página `/admin/publish` já existe como mock. Esta fase wired ela:

### Presets visuais (3 iniciais)
1. **Editorial** (default) — Mora Parchment + Fraunces + magazine layout
2. **Minimalista** — neutros + sans-serif + grid simples
3. **Bold** — accent forte + display typography + grandes blocos

Cada preset é um JSON com:
```json
{
  "name": "editorial",
  "tokens": {
    "bg-page": "#FAEFD9",
    "fg-primary": "#212842",
    "accent": "#DAA63E",
    "font-display": "Fraunces"
  },
  "layout_defaults": {
    "hero": "magazine",
    "table_card": "editorial"
  }
}
```

### Tabs de customização
- **Tipografia:** select de display font (Fraunces / Playfair / Times New Roman) + body font (Plex Sans / Inter / system-ui)
- **Cor:** color picker pro accent + toggle dark/light pro modo padrão do site
- **Layout:** densidade (compact/regular/loose) + ordem de seções (drag-drop futuro)

### Preview iframe
- Abre `/admin/publish/preview/{workspace_slug}` em iframe lateral
- Aplica tokens via query params ou postMessage
- Live-update conforme tabs mudam

---

## 📤 Fase 5 detalhada — Export

Exportar gera um ZIP com:
```
publication_{slug}_v{version}.zip
├── index.html          (página inicial do site, pré-renderizada)
├── _data/
│   ├── tables.json     (índice das tabelas)
│   ├── {table}.json    (uma por tabela)
│   └── relations.json  (FKs)
├── _assets/
│   ├── styles.css      (tokens + layout do tema escolhido)
│   └── fonts/          (web fonts subset)
└── README.md           (como hospedar — Netlify drop, GitHub Pages, etc.)
```

### Implementação
- Backend: `POST /api/publish/{id}/export` → roda render server-side com Next.js render API ou template engine simples (Jinja2)
- Empacota com `zipfile` (Python stdlib)
- Retorna Blob streamable
- Frontend: download direto do response

---

## ⚠️ Decisões em aberto (perguntar ao Diretor antes de começar)

1. **Subdomain ou path-based?** `puczaras.atlas.app` ou `atlas.app/puczaras`?
   - Path: simples, sem DNS configuration. Custo: SEO perde ranking individual por workspace.
   - Subdomain: profissional, indexação separada. Custo: precisa wildcard DNS + Vercel config.
   - **Recomendação:** começar path-based (`/{slug}`), migrar pra subdomain quando tiver demanda real.

2. **Snapshot ou live?** Publication é freeze do momento ou reflete mudanças do DB?
   - Freeze: estável, previsível, mas precisa "publicar" toda vez que muda.
   - Live: zero overhead pro admin, mas qualquer bug no admin vaza pro público.
   - **Recomendação:** **freeze** com botão "Publicar mudanças" — menos surpresa, maior controle.

3. **Storage do snapshot:** S3? Filesystem local? Supabase Storage?
   - Local: simples, mas não escala em multi-server.
   - **Recomendação:** Supabase Storage (gratuito até 1GB, integra com M3).

4. **Versioning:** quantas publications passadas guardar?
   - Disk grows. Sugiro 10 últimas + última de cada mês.

5. **Custom domain (cliente traz seu domínio):** suportar `centrobudista.com.br` apontando pro Atlas?
   - Cool feature, mas DNS verification + SSL provisioning é um projeto à parte.
   - **Recomendação:** fora de M6, fica pra M6.5 ou backlog.

---

## 🧾 Critério de aceite

- [ ] Admin consegue selecionar 5 tabelas, escolher preset "Editorial", clicar "Publicar"
- [ ] URL `/{slug}` mostra essas 5 tabelas com tema aplicado
- [ ] Mudanças posteriores no DB **não** vazam pro público até nova publish
- [ ] Botão "Exportar pacote" gera ZIP que abre como site estático localmente
- [ ] Histórico mostra publicações anteriores; botão "Restaurar" volta pra versão antiga
- [ ] Site público continua funcionando se backend cair (snapshot servido de cache)
- [ ] `pytest -q` passa em backend (novos testes pra `_publications`, snapshot, rollback)
- [ ] Smoke manual: 2 admins diferentes publicam workspaces diferentes, não vazam dados

---

## 🔗 Dependências

- **Bloqueia:** nenhum milestone direto.
- **Bloqueado por:** M5 fechar (Theme Studio mock precisa virar real).
- **Sinergia com:** M3 (Supabase Storage natural pra snapshots), M9 (audit log de publish events).
