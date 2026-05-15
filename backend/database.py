import os
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./dynamic_template.db")


def _engine_kwargs(url: str) -> dict:
    if url.startswith("sqlite"):
        return {"connect_args": {"check_same_thread": False}}
    # Postgres: pool_pre_ping evita conexões mortas após idle/restart do servidor.
    return {"pool_pre_ping": True, "pool_size": 5, "max_overflow": 10}


engine = create_engine(DATABASE_URL, **_engine_kwargs(DATABASE_URL))


# Em Supabase, o role `postgres` herda search_path que inclui `auth` antes de
# `public`. Como `auth.users` existe (Supabase Auth) e nosso `public.users`
# também, consultas não-qualificadas `FROM users` resolvem pra `auth.users`
# e quebram. Forçamos `search_path = public` em toda conexão nova do pool.
if engine.dialect.name == "postgresql":
    @event.listens_for(engine, "connect")
    def _set_search_path(dbapi_conn, connection_record):
        cur = dbapi_conn.cursor()
        cur.execute("SET search_path TO public")
        cur.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def is_postgres() -> bool:
    return engine.dialect.name == "postgresql"
