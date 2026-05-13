"""baseline_pre_rls

Revision ID: ac8fba37080b
Revises:
Create Date: 2026-05-13 16:04:19.296683

Snapshot do schema de metadados (system tables) anterior à migração RLS do M3.
- Cria todas as tabelas declaradas em ``models.py`` via ``Base.metadata.create_all``.
- Não inclui tabelas dinâmicas de tenant (``t{id}_*``) — essas são criadas
  em runtime por ``dynamic_schema.create_physical_table``.
- Em ambientes pré-existentes (SQLite local com dados), rodar
  ``alembic stamp head`` para marcar como já migrado sem reaplicar.
"""
from typing import Sequence, Union

from alembic import op


revision: str = "ac8fba37080b"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _base_metadata():
    # Import tardio: evita ciclo com env.py durante autogenerate.
    from database import Base
    import models  # noqa: F401 — registra todas as tabelas em Base.metadata

    return Base.metadata


def upgrade() -> None:
    _base_metadata().create_all(bind=op.get_bind())


def downgrade() -> None:
    _base_metadata().drop_all(bind=op.get_bind())
