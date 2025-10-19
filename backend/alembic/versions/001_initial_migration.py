"""Initial migration

Revision ID: 001
Revises:
Create Date: 2025-01-18

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("nombres", sa.String(), nullable=False),
        sa.Column("apellidos", sa.String(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("is_superuser", sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)

    # Create contacts table
    op.create_table(
        "contacts",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("nombres", sa.String(), nullable=False),
        sa.Column("apellidos", sa.String(), nullable=False),
        sa.Column("nombre_completo", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("telefono", sa.String(), nullable=False),
        sa.Column(
            "estado",
            sa.Enum(
                "PROSPECTO", "CALIFICADO", "CLIENTE", "INACTIVO", name="contactstatus"
            ),
            nullable=False,
        ),
        sa.Column("cedula", sa.String(), nullable=True),
        sa.Column("ciudad", sa.String(), nullable=True),
        sa.Column("pais", sa.String(), nullable=True),
        sa.Column("notas", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_contacts_apellidos"), "contacts", ["apellidos"], unique=False
    )
    op.create_index(op.f("ix_contacts_ciudad"), "contacts", ["ciudad"], unique=False)
    op.create_index(op.f("ix_contacts_email"), "contacts", ["email"], unique=True)
    op.create_index(op.f("ix_contacts_estado"), "contacts", ["estado"], unique=False)
    op.create_index(op.f("ix_contacts_id"), "contacts", ["id"], unique=False)
    op.create_index(
        op.f("ix_contacts_nombre_completo"),
        "contacts",
        ["nombre_completo"],
        unique=False,
    )
    op.create_index(op.f("ix_contacts_nombres"), "contacts", ["nombres"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_contacts_nombres"), table_name="contacts")
    op.drop_index(op.f("ix_contacts_nombre_completo"), table_name="contacts")
    op.drop_index(op.f("ix_contacts_id"), table_name="contacts")
    op.drop_index(op.f("ix_contacts_estado"), table_name="contacts")
    op.drop_index(op.f("ix_contacts_email"), table_name="contacts")
    op.drop_index(op.f("ix_contacts_ciudad"), table_name="contacts")
    op.drop_index(op.f("ix_contacts_apellidos"), table_name="contacts")
    op.drop_table("contacts")

    op.drop_index(op.f("ix_users_id"), table_name="users")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")

    sa.Enum(name="contactstatus").drop(op.get_bind(), checkfirst=True)
