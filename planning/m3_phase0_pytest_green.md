# M3 Fase 0.1 — pytest verde antes do refactor

> **DoD:** snapshot da suíte verde antes de qualquer mudança da Fase 1+.
> Plano: [milestone_3_rls_migration.md §0.1](./milestone_3_rls_migration.md).

## Comando
```powershell
cd backend
.\venv\Scripts\python.exe -m pytest -q
```

## Resultado (2026-05-13)
```
47 passed, 133 warnings in 44.72s
```

- ✅ 47/47 testes passando.
- ⚠️ 133 warnings — não falham a suíte; majoritariamente deprecations de SQLAlchemy/pydantic/etc. Investigação fica fora do escopo do M3 (anotada como dívida técnica baixa).

## Próximo gate
- Fase 0.2: Postgres local via Docker (pendente — Diretor).
- Fase 0.3: cleanup de scratches ✅ feito neste mesmo PR.
- Após Fase 0 fechar: abrir Fase 1 (Alembic + dual-engine).
