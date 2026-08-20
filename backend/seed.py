import os
import sys

# Ensure backend directory is in sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from database import SessionLocal, engine, Base
import models
from models import User, Friend

# Ensure tables are created in SQLite
Base.metadata.create_all(bind=engine)

db = SessionLocal()


# -------------------------
# Create Test User
# -------------------------

existing_user = db.query(User).filter(
    User.username == "ananya"
).first()


if not existing_user:
    user = User(
        username="ananya",
        password="123456"
    )

    db.add(user)
    print("Test user created successfully!")

else:
    print("Test user already exists.")


# -------------------------
# Create Sample Friends
# -------------------------

existing_friends = db.query(Friend).count()


if existing_friends == 0:

    friends = [
        Friend(
            name="Rahul Sharma",
            email="rahul@example.com",
            phone="9876543210",
            role="Software Developer",
            bio="Full-stack developer and technology enthusiast.",
            hobbies="Cricket, Coding",
            image_url="https://i.pravatar.cc/150?img=12",
            date_joined="2026-01-15"
        ),

        Friend(
            name="Priya Singh",
            email="priya@example.com",
            phone="9876543211",
            role="UI/UX Designer",
            bio="Creative designer who loves building beautiful interfaces.",
            hobbies="Design, Photography",
            image_url="https://i.pravatar.cc/150?img=47",
            date_joined="2026-02-10"
        ),

        Friend(
            name="Arjun Kumar",
            email="arjun@example.com",
            phone="9876543212",
            role="Data Analyst",
            bio="Loves working with data and finding useful insights.",
            hobbies="Football, Data Science",
            image_url="https://i.pravatar.cc/150?img=33",
            date_joined="2026-03-05"
        )
    ]

    db.add_all(friends)

    print("Sample friends created successfully!")

else:
    print("Friends already exist.")


# Save everything
db.commit()

# Close database connection
db.close()

print("Database setup completed!")