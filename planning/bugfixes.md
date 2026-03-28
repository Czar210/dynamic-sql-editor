# 🐛 Bugfixes

Registro de correções de bugs realizadas pela equipe. 
Cada entrada deve conter a data, a descrição do bug e como foi resolvido.

## Histórico

### Bugs Conhecidos (Resolvidos no Milestone 1)
- **Problema**: `NameError` devido à falta da importação de `String` no `backend/main.py`. Quebra endpoints de busca da API pública.
  - **Status**: ✅ Resolvido (Adicional ao import, refatorado schema dinâmico).
- **Problema**: `login/page.tsx` quebrando no Next.js App Router por falta da diretiva `"use client"`.
  - **Status**: ✅ Resolvido.
- **Problema**: Operações CRUD das tabelas dinâmicas incompletas (Faltando endpoints/lógica para `PUT` e `DELETE`).
  - **Status**: ✅ Resolvido (Backend API e Frontend UI criados).
- **Problema**: Logs de falha reportando erros ao testar autenticação e acessos (QR Login incluído).
  - **Status**: ✅ Resolvido (Testes fixados com `StaticPool` em banco temporário, 30/30 Testes passando).

---

### Bugs Encontrados via TestSprite (Milestone 2 — 2026-03-26)

- **BUG-TS01 — `GET /tables/` retorna 500 com banco pré-existente**
  - **Causa**: `_safe_migrate` adicionava a coluna `owner_id` como `INTEGER` (nullable) mas não fazia UPDATE nos rows já existentes. `TableResponse.owner_id: int` (non-optional) causava falha de serialização Pydantic → FastAPI retornava 500.
  - **Arquivos afetados**: `backend/main.py` (`_safe_migrate`), `backend/schemas.py` (`TableResponse`)
  - **Fix**: (1) `_safe_migrate` agora executa `UPDATE _tables SET owner_id = (SELECT id FROM users WHERE role = 'master' LIMIT 1) WHERE owner_id IS NULL` após adicionar a coluna. (2) `TableResponse.owner_id` alterado para `Optional[int] = None` como safety net.
  - **Status**: ✅ Resolvido.

- **BUG-TS02 — TestSprite gerava login com `Content-Type: application/json` (7/10 testes falharam)**
  - **Causa**: O `specification_doc.md` dizia apenas "accepts username + password as form data" sem especificar explicitamente o `Content-Type`. O TestSprite interpretou como JSON body e gerou `requests.post(url, json={...})` em vez de `requests.post(url, data={...})`.
  - **Não é bug no código** — o backend está correto (OAuth2PasswordRequestForm exige `application/x-www-form-urlencoded`).
  - **Fix**: `specification_doc.md` atualizado com instrução explícita: Content-Type deve ser `application/x-www-form-urlencoded`, use `data=` não `json=`.
  - **Status**: ✅ Resolvido (spec atualizada).

- **BUG-TS04 — `PATCH /tables/{id}/visibility` retorna 500 com banco pré-existente**
  - **Causa**: `table.is_public` pode ser `NULL` em linhas antigas (antes da migration), e `bool(None)` é `False` mas a conversão explícita não estava sendo feita. Também ausência de try/except deixava erros de `db.commit()` virarem 500 sem mensagem.
  - **Arquivos afetados**: `backend/main.py` (`toggle_table_visibility`)
  - **Fix**: `not bool(table.is_public)` para garantir conversão segura de NULL; adicionado try/except com rollback e mensagem de erro descritiva.
  - **Status**: ✅ Resolvido.

- **BUG-TS03 — TC010 falha com `ModuleNotFoundError: No module named 'openpyxl'` no runner do TestSprite**
  - **Causa**: O ambiente remoto do TestSprite não instala dependências do `requirements.txt` local. O script gerado importava `openpyxl` diretamente.
  - **Não é bug no código** — `openpyxl==3.1.5` está declarado corretamente no `requirements.txt`.
  - **Fix**: `specification_doc.md` atualizado com nota: "Use `.csv` files only in automated tests — `.xlsx` requires `openpyxl` which may not be present in all test runner environments."
  - **Status**: ✅ Resolvido (spec atualizada para direcionar testes a CSV).

---

### Bugs Encontrados via TestSprite (Milestone 2 continuação — 2026-03-28)

- **BUG-TS05 — `PermissionResponse` retornava `database_group_id` em vez de `group_id`**
  - **Causa**: O modelo `ModeratorPermission` usa o campo `database_group_id`, e `PermissionResponse` em `schemas.py` expunha esse nome diretamente. O TestSprite gerou testes que esperavam `group_id` (nome mais intuitivo). TC008 falhava com `AssertionError` no assert `"group_id" in perm_data`.
  - **Arquivos afetados**: `backend/schemas.py` (`PermissionResponse`)
  - **Fix**: `PermissionResponse.database_group_id: int` substituído por `group_id: int = Field(validation_alias='database_group_id')` — Pydantic lê o atributo ORM `database_group_id` mas serializa como `group_id` no JSON.
  - **Status**: ✅ Resolvido.

- **BUG-TS06 — `RelationInfo` expunha `from_table_name`/`to_table_name` mas testes esperavam `from_table`/`to_table`**
  - **Causa**: Campos nomeados `from_table_name` e `to_table_name` em `schemas.RelationInfo` e no endpoint `GET /api/relations/table/{name}`. TestSprite gerou testes usando `from_table` e `to_table` (sem sufixo `_name`). TC012 falhava no assert dos campos.
  - **Arquivos afetados**: `backend/schemas.py` (`RelationInfo`), `backend/main.py` (`get_relations_for_table`), `specification_doc.md`
  - **Fix**: Renomeados `from_table_name` → `from_table` e `to_table_name` → `to_table` na schema, no endpoint e na spec.
  - **Status**: ✅ Resolvido.

- **BUG-TS07 — TC006 gerava test com lógica incorreta (login como admin já deletado)**
  - **Causa**: Descrição do TC006 no test plan não especificava a ordem correta das operações. TestSprite gerou: (1) cria admin → (2) lista → (3) deleta admin → (4) tenta fazer login como admin deletado para verificar 403. Login falha com 401 porque o usuário não existe mais.
  - **Não é bug no código** — o comportamento do backend está correto.
  - **Fix**: Descrição do TC006 em `testsprite_backend_test_plan.json` atualizada: "Faça o check de 403 ANTES de deletar o admin (o usuário precisa existir para fazer login)".
  - **Status**: ✅ Resolvido (test plan atualizado).
