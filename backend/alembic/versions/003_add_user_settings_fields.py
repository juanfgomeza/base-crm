"""add user settings fields

Revision ID: 003
Revises: 002
Create Date: 2025-10-18

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add reset_token, reset_token_expires, and theme_preference to users table
    op.add_column("users", sa.Column("reset_token", sa.String(), nullable=True))
    op.add_column(
        "users", sa.Column("reset_token_expires", sa.DateTime(), nullable=True)
    )
    op.add_column(
        "users",
        sa.Column(
            "theme_preference", sa.String(), nullable=False, server_default="light"
        ),
    )


def downgrade() -> None:
    # Remove reset_token, reset_token_expires, and theme_preference from users table
    op.drop_column("users", "theme_preference")
    op.drop_column("users", "reset_token_expires")
    op.drop_column("users", "reset_token")
