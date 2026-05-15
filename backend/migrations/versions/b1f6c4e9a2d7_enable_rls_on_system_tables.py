"""enable_rls_on_system_tables

Revision ID: b1f6c4e9a2d7
Revises: ac8fba37080b
Create Date: 2026-05-15 19:30:00.000000

Habilita Row Level Security nas tabelas de sistema (schema `public`).

**Por quê:** o Supabase expõe `public.*` automaticamente via PostgREST
com a chave `anon` (frequentemente embutida no frontend). Sem RLS, essa
chave dá leitura/escrita direta em `users`, `_tables`, `qr_login_sessions`,
etc — pulando completamente o JWT do backend.

Usamos `ENABLE` (sem `FORCE`): RLS bloqueia `anon` e `authenticated` (roles
que o PostgREST usa), mas owners/superusers — incluindo o role `postgres`
com o qual o backend conecta — continuam bypassando. Nenhuma policy é
adicionada de propósito: o acesso fica restrito a service_role/superuser.

Em SQLite é no-op (não suporta RLS).
"""
from typing import Sequence, Union

from alembic import op


revision: str = "b1f6c4e9a2d7"
down_revision: Union[str, Sequence[str], None] = "ac8fba37080b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


SYSTEM_TABLES = (
    "users",
    "database_groups",
    "moderator_permissions",
    "_tables",
    "_columns",
    "_relations",
    "qr_login_sessions",
    "alembic_version",
)


def _is_postgres() -> bool:
    return op.get_bind().dialect.name == "postgresql"


def upgrade() -> None:
    if not _is_postgres():
        return
    for tbl in SYSTEM_TABLES:
        op.execute(f'ALTER TABLE "{tbl}" ENABLE ROW LEVEL SECURITY')


def downgrade() -> None:
    if not _is_postgres():
        return
    for tbl in SYSTEM_TABLES:
        op.execute(f'ALTER TABLE "{tbl}" DISABLE ROW LEVEL SECURITY')
