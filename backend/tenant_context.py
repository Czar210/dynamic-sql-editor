"""Tenant context helpers.

Centraliza a lógica de "qual tenant_id se aplica a este request?".
Qualquer código novo que precise dessa resposta deve passar por aqui —
nunca inlinar `user.id`, `user.parent_id` ou `f"t{...}_..."`.
"""
from sqlalchemy.orm import Session
from sqlalchemy import text

import models


def resolve_tenant_id(user: models.User) -> int | None:
    """tenant_id (= admin id) aplicável a este usuário.

    - master    → None (master não tem tenant fixo; escolha caso-a-caso).
    - admin     → o próprio id.
    - moderator → parent_id (o admin dono).

    Moderador sem parent_id é tratado como bug-fatal: melhor 500
    do que vazar dados de outro tenant ou do master.
    """
    if user.role == "master":
        return None
    if user.role == "admin":
        return user.id
    if user.role == "moderator":
        if user.parent_id is None:
            raise RuntimeError(
                f"Moderador órfão detectado (user_id={user.id}). "
                "Acesso negado para evitar vazamento de tenant."
            )
        return user.parent_id
    raise RuntimeError(f"Role desconhecida: {user.role!r}")


def tenant_schema_name(tenant_id: int) -> str:
    """Nome do schema Postgres para um tenant. Ex: 5 → 'tenant_5'."""
    return f"tenant_{tenant_id}"


def tenant_table_prefix(tenant_id: int) -> str:
    """Prefixo legado para SQLite (fallback). Remover na Fase 8 quando SQLite sair de prod."""
    return f"t{tenant_id}_"


def set_tenant_for_session(db: Session, tenant_id: int | None) -> None:
    """Em Postgres, seta `app.tenant_id` na sessão para RLS.

    No-op em SQLite. Chamar no início de toda request autenticada que
    vá tocar em dados dinâmicos. `tenant_id=None` (master) usa sentinela
    0 + flag `app.is_master=true` que as policies da Fase 3 vão reconhecer.
    """
    if db.bind is None or db.bind.dialect.name != "postgresql":
        return

    if tenant_id is None:
        db.execute(text("SELECT set_config('app.tenant_id', '0', true)"))
        db.execute(text("SELECT set_config('app.is_master', 'true', true)"))
    else:
        db.execute(
            text("SELECT set_config('app.tenant_id', :tid, true)"),
            {"tid": str(tenant_id)},
        )
        db.execute(text("SELECT set_config('app.is_master', 'false', true)"))
