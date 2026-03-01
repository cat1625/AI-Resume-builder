"""Create admin user. Run: python -m scripts.create_admin"""
import sys
sys.path.insert(0, '.')

from app.database import SessionLocal
from app.models.user import User, UserRole
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def main():
    db = SessionLocal()
    email = input("Admin email: ")
    password = input("Admin password: ")
    if db.query(User).filter(User.email == email).first():
        print("User exists. Updating role to admin.")
        user = db.query(User).filter(User.email == email).first()
        user.role = UserRole.ADMIN.value
    else:
        user = User(
            email=email,
            hashed_password=pwd_context.hash(password),
            full_name="Admin",
            role=UserRole.ADMIN.value,
        )
        db.add(user)
    db.commit()
    print("Admin user ready.")

if __name__ == "__main__":
    main()
