import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool

from alembic import context

# Garante que os módulos do backend (database, models, ...) sejam importáveis
# quando o Alembic é executado de dentro de backend/.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import Base
import models  # noqa: F401 — garante que Base.metadata enxergue todas as tabelas

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def get_url() -> str:
    """DATABASE_URL é a fonte da verdade. Em dev, default p/ SQLite local.

    `.strip()` defende contra newline/espaço acidentais no env var
    (Railway/Vercel ocasionalmente colam `\\n` no fim).
    """
    return os.environ.get("DATABASE_URL", "sqlite:///./dynamic_template.db").strip()


def run_migrations_offline() -> None:
    context.configure(
        url=get_url(),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    section = config.get_section(config.config_ini_section, {})
    section["sqlalchemy.url"] = get_url()

    connectable = engine_from_config(
        section,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
