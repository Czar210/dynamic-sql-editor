"""add_tenant_fields_to_tables

Revision ID: ee6d25417ad7
Revises: ac8fba37080b
Create Date: 2026-05-13 17:06:20.243533

Adiciona 3 colunas em `_tables` (M3 Fase 2):
- tenant_id    NOT NULL — backfill = owner_id (admin dono).
- schema_name  NULL — preenchido só em Postgres pelas Fases 3-4.
- physical_name NULL — backfill = name (mesmo valor durante a transição).

Estratégia: adiciona como nullable, faz backfill via UPDATE, depois fixa NOT NULL.
Funciona em SQLite e Postgres.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "ee6d25417ad7"
down_revision: Union[str, Sequence[str], None] = "ac8fba37080b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("_tables", sa.Column("tenant_id", sa.Integer(), nullable=True))
    op.add_column("_tables", sa.Column("schema_name", sa.String(), nullable=True))
    op.add_column("_tables", sa.Column("physical_name", sa.String(), nullable=True))

    op.execute("UPDATE _tables SET tenant_id = owner_id WHERE tenant_id IS NULL")
    op.execute("UPDATE _tables SET physical_name = name WHERE physical_name IS NULL")

    # SQLite via batch p/ alter column (não suporta ALTER COLUMN nativo)
    with op.batch_alter_table("_tables") as batch_op:
        batch_op.alter_column("tenant_id", existing_type=sa.Integer(), nullable=False)
        batch_op.create_index("ix__tables_tenant_id", ["tenant_id"])


def downgrade() -> None:
    with op.batch_alter_table("_tables") as batch_op:
        batch_op.drop_index("ix__tables_tenant_id")
        batch_op.drop_column("physical_name")
        batch_op.drop_column("schema_name")
        batch_op.drop_column("tenant_id")
