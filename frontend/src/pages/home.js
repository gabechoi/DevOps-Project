import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [movies, setMovies] = useState([]);
  const placeHolder = 'https://fastly.picsum.photos/id/237/200/300.jpg?hmac=TmmQSbShHz9CdQm0NkEjx1Dyh_Y984R9LpNrpvH2D_U';
  const navigate = useNavigate();
  const USER_ID = 'user123';

  const fetchMovies = async (query) => {
    try {
      const response = await fetch(`http://localhost:8000/movies/?query=${query}`)
      const data = await response.json();
      console.log(data);
      setMovies(data);
    } catch(error){
      console.error(error);
    }
  };

  const addToFavorites = async (movieId) => {
    try {
      const response = await fetch('http://localhost:8000/favorites/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movie_id: movieId,
          user_id: USER_ID
        })
      });

      if (response.ok) {
        alert('Movie added to favorites!');
      } else {
        const errorData = await response.json();
        alert(errorData.detail);
      }
    } catch(error) {
      console.error('Error adding to favorites:', error);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      fetchMovies(searchTerm);
    } else {
      setMovies([]);
    }
  }, [searchTerm]);

  return (
    <div className='container'>
      <div className='main-content'>
        <h1>Movies</h1>
        <div className='searchBar'>
          <label>Search</label>
          <input
            type='text'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search movies..."
          />
          <button onClick={() => navigate('/favorites')}>
            Go to Favorites
          </button>
        </div>
        <div className='moviesContainer'>
          {movies.length === 0 ? (
            <p>No movies found</p>
          ) : (
            movies.slice(0,12).map((movie) => (
              <div key={movie.id} className="movieTile">
                <img src={movie.poster || placeHolder} alt={movie.title} />
                <h3>{movie.title}</h3>
                <button onClick={() => addToFavorites(movie.id)}>
                  Add to Favorites
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;