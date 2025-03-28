import pandas as pd
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from fastapi.middleware.cors import CORSMiddleware
import os

# Set Up Database connection
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Define models
class Movie(Base):
    __tablename__ = "movies"
    id = Column(Integer, primary_key=True, index=True)
    #tmdb_id = Column(Integer, unique=True, index=True)
    title = Column(String, index=True)
    genre = Column(String)
    date = Column(String)
    rating = Column(Float)
    poster = Column(String)

class Favorite(Base):
    __tablename__ = "favorites"
    id = Column(Integer, primary_key=True, index=True)
    movie_id = Column(Integer, ForeignKey('movies.id'))
    user_id = Column(String)
    movie = relationship("Movie", back_populates="favorites")

Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def load_movie_data(filepath, db):
    df = pd.read_csv(filepath,
                     usecols=["id", "title", "release_date", "genres", "vote_average", "poster_path"],
                     dtype=str)
    df = df[df["release_date"] != "\\N"]
    df = df[df["poster_path"] != "\\N"]

    movies = [
        Movie(
            #tmdb_id=int(row["id"]),
            title=row["title"],
            date=row["release_date"],
            genre=row["genres"],
            rating=float(row["vote_average"]) if row["vote_average"] != "\\N" else None,
            poster=f"https://image.tmdb.org/t/p/w500{row['poster_path']}"
        )
        for _, row in df.iterrows()
    ]
    db.bulk_save_objects(movies)
    db.commit()

@app.post("/import-tmdb/")
def import_tmdb(db: Session = Depends(get_db)):
    try:
        load_movie_data("/app/data/TMDB_movie_dataset_v11.clean.csv", db)
        return {"message": "TMDB data imported successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# endpoints
@app.get("/movies/")
def search_movies(query: str, db: Session = Depends(get_db)):
    movies = db.query(Movie).filter(Movie.title.ilike(f"%{query}")).all()
    return movies


@app.post("/favorites/add")
def add_to_favorites(movie_id: int, user_id: str, db: Session = Depends(get_db)):
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    # Check if already favorited
    existing_favorite = db.query(Favorite).filter(
        Favorite.movie_id == movie_id,
        Favorite.user_id == user_id
    ).first()

    if existing_favorite:
        raise HTTPException(status_code=400, detail="Movie already in favorites")

    # Create new favorite
    new_favorite = Favorite(movie_id=movie_id, user_id=user_id)
    db.add(new_favorite)
    db.commit()
    db.refresh(new_favorite)

    return {"message": "Movie added to favorites"}


@app.get("/favorites/")
def get_favorites(user_id: str, db: Session = Depends(get_db)):
    favorites = db.query(Favorite).filter(Favorite.user_id == user_id).all()

    favorite_movies = [
        {
            "id": favorite.movie.id,
            "title": favorite.movie.title,
            "poster": favorite.movie.poster,
            "genre": favorite.movie.genre,
            "date": favorite.movie.date,
            "rating": favorite.movie.rating
        }
        for favorite in favorites
    ]

    return favorite_movies


@app.delete("/favorites/remove")
def remove_from_favorites(movie_id: int, user_id: str, db: Session = Depends(get_db)):
    favorite = db.query(Favorite).filter(
        Favorite.movie_id == movie_id,
        Favorite.user_id == user_id
    ).first()

    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite not found")

    db.delete(favorite)
    db.commit()

    return {"message": "Movie removed from favorites"}