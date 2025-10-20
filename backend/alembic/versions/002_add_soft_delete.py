"""add soft delete

Revision ID: 002
Revises: 001
Create Date: 2025-10-18

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add is_deleted column to contacts table
    op.add_column(
        "contacts",
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default="false"),
    )
    op.create_index(
        op.f("ix_contacts_is_deleted"), "contacts", ["is_deleted"], unique=False
    )

    # Add is_deleted column to users table
    op.add_column(
        "users",
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default="false"),
    )
    op.create_index(op.f("ix_users_is_deleted"), "users", ["is_deleted"], unique=False)


def downgrade() -> None:
    # Remove is_deleted column from users table
    op.drop_index(op.f("ix_users_is_deleted"), table_name="users")
    op.drop_column("users", "is_deleted")

    # Remove is_deleted column from contacts table
    op.drop_index(op.f("ix_contacts_is_deleted"), table_name="contacts")
    op.drop_column("contacts", "is_deleted")
