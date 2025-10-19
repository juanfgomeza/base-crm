import logging
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import SessionLocal
from app.core.config import settings
from faker import Faker

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

fake = Faker("es_ES")


def init_db(db: Session) -> None:
    # Create first superuser
    user = crud.user.get_by_email(db, email=settings.FIRST_SUPERUSER_EMAIL)
    if not user:
        user_in = schemas.UserCreate(
            email=settings.FIRST_SUPERUSER_EMAIL,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            nombres=settings.FIRST_SUPERUSER_NOMBRES,
            apellidos=settings.FIRST_SUPERUSER_APELLIDOS,
            is_superuser=True,
        )
        user = crud.user.create(db, obj_in=user_in)
        logger.info(f"Created superuser: {user.email}")
    else:
        logger.info(f"Superuser already exists: {user.email}")

    # Create sample contacts
    existing_contacts = crud.contact.get_multi(db, skip=0, limit=1)
    if not existing_contacts[0]:  # No contacts exist
        logger.info("Creating sample contacts...")
        estados = ["prospecto", "calificado", "cliente", "inactivo"]

        for i in range(20):
            contact_in = schemas.ContactCreate(
                nombres=fake.first_name(),
                apellidos=f"{fake.last_name()} {fake.last_name()}",
                nombre_completo=fake.name(),
                email=fake.email(),
                telefono=fake.phone_number(),
                estado=fake.random_element(estados),
                cedula=fake.bothify(text="##########"),
                ciudad=fake.city(),
                pais="Colombia",
                notas=fake.text(max_nb_chars=200),
            )
            crud.contact.create(db, obj_in=contact_in)

        logger.info("Created 20 sample contacts")
    else:
        logger.info("Contacts already exist, skipping sample data creation")


def main() -> None:
    logger.info("Creating initial data")
    db = SessionLocal()
    init_db(db)
    logger.info("Initial data created")


if __name__ == "__main__":
    main()
