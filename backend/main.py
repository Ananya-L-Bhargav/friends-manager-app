from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from database import engine, Base, get_db
import models

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI application
app = FastAPI(title="Friends Manager API", version="1.0.0")

# -------------------------
# CORS Configuration
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Request Models
# -------------------------
class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    password: str

class FriendCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = ""
    role: Optional[str] = ""
    bio: Optional[str] = ""
    hobbies: Optional[str] = ""
    image_url: Optional[str] = ""
    date_joined: Optional[str] = ""

class FriendUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    bio: Optional[str] = None
    hobbies: Optional[str] = None
    image_url: Optional[str] = None
    date_joined: Optional[str] = None

# -------------------------
# Authentication APIs
# -------------------------
@app.post("/api/login")
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        models.User.username == login_data.username.strip()
    ).first()

    if not user or user.password != login_data.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    return {
        "success": True,
        "message": "Login successful",
        "username": user.username,
        "token": f"token-{user.id}-{user.username}"
    }

@app.post("/api/register")
def register(register_data: RegisterRequest, db: Session = Depends(get_db)):
    if not register_data.username.strip() or not register_data.password.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username and password cannot be empty"
        )

    existing = db.query(models.User).filter(
        models.User.username == register_data.username.strip()
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )

    new_user = models.User(
        username=register_data.username.strip(),
        password=register_data.password.strip()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "success": True,
        "message": "User registered successfully",
        "username": new_user.username,
        "token": f"token-{new_user.id}-{new_user.username}"
    }

# -------------------------
# Get All Friends API
# -------------------------
@app.get("/api/friends")
def get_friends(db: Session = Depends(get_db)):
    friends = db.query(models.Friend).order_by(models.Friend.id.desc()).all()
    return friends

# -------------------------
# Get Friend By ID API
# -------------------------
@app.get("/api/friends/{friend_id}")
def get_friend(friend_id: int, db: Session = Depends(get_db)):
    friend = db.query(models.Friend).filter(
        models.Friend.id == friend_id
    ).first()

    if not friend:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Friend not found"
        )

    return friend

# -------------------------
# Create New Friend API
# -------------------------
@app.post("/api/friends", status_code=status.HTTP_201_CREATED)
def create_friend(friend_data: FriendCreate, db: Session = Depends(get_db)):
    if not friend_data.name or not friend_data.name.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name is required"
        )

    if not friend_data.email or not friend_data.email.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required"
        )

    new_friend = models.Friend(
        name=friend_data.name.strip(),
        email=friend_data.email.strip(),
        phone=friend_data.phone.strip() if friend_data.phone else "",
        role=friend_data.role.strip() if friend_data.role else "Friend",
        bio=friend_data.bio.strip() if friend_data.bio else "",
        hobbies=friend_data.hobbies.strip() if friend_data.hobbies else "",
        image_url=friend_data.image_url.strip() if friend_data.image_url else "",
        date_joined=friend_data.date_joined.strip() if friend_data.date_joined else ""
    )

    db.add(new_friend)
    db.commit()
    db.refresh(new_friend)

    return {
        "success": True,
        "message": "Friend added successfully",
        "friend": new_friend
    }

# -------------------------
# Update Friend API
# -------------------------
@app.put("/api/friends/{friend_id}")
def update_friend(friend_id: int, update_data: FriendUpdate, db: Session = Depends(get_db)):
    friend = db.query(models.Friend).filter(
        models.Friend.id == friend_id
    ).first()

    if not friend:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Friend not found"
        )

    if update_data.name is not None:
        if not update_data.name.strip():
            raise HTTPException(status_code=400, detail="Name cannot be empty")
        friend.name = update_data.name.strip()

    if update_data.email is not None:
        if not update_data.email.strip():
            raise HTTPException(status_code=400, detail="Email cannot be empty")
        friend.email = update_data.email.strip()

    if update_data.phone is not None:
        friend.phone = update_data.phone.strip()

    if update_data.role is not None:
        friend.role = update_data.role.strip()

    if update_data.bio is not None:
        friend.bio = update_data.bio.strip()

    if update_data.hobbies is not None:
        friend.hobbies = update_data.hobbies.strip()

    if update_data.image_url is not None:
        friend.image_url = update_data.image_url.strip()

    if update_data.date_joined is not None:
        friend.date_joined = update_data.date_joined.strip()

    db.commit()
    db.refresh(friend)

    return {
        "success": True,
        "message": "Friend updated successfully",
        "friend": friend
    }

# -------------------------
# Delete Friend API
# -------------------------
@app.delete("/api/friends/{friend_id}")
def delete_friend(friend_id: int, db: Session = Depends(get_db)):
    friend = db.query(models.Friend).filter(
        models.Friend.id == friend_id
    ).first()

    if not friend:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Friend not found"
        )

    db.delete(friend)
    db.commit()

    return {
        "success": True,
        "message": "Friend deleted successfully",
        "deleted_id": friend_id
    }

# -------------------------
# Root Health Check
# -------------------------
@app.get("/")
def home():
    return {
        "name": "Friends Manager API",
        "status": "healthy",
        "version": "1.0.0"
    }