import asyncio
from logging.config import fileConfig
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import pool
from alembic import context
from app.core.config import settings
from app.database import Base

# Import all models so Alembic can detect them
from app.models import user, job, application

config = context.config
fileConfig(config.config_file_name)
target_metadata = Base.metadata

# Remove sslmode from URL
DATABASE_URL = settings.DATABASE_URL
if "?" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.split("?")[0]

def run_migrations_offline():
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection):
    context.configure(
        connection=connection,
        target_metadata=target_metadata
    )
    with context.begin_transaction():
        context.run_migrations()

async def run_migrations_online():
    connectable = create_async_engine(
        DATABASE_URL,
        poolclass=pool.NullPool,
        connect_args={
            "ssl": "require",
            "server_settings": {"jit": "off"}
        }
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()

if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())