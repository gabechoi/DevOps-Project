import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';

function Favorites() {
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState([]);
  const placeHolder = 'https://fastly.picsum.photos/id/237/200/300.jpg?hmac=TmmQSbShHz9CdQm0NkEjx1Dyh_Y984R9LpNrpvH2D_U';
  const navigate = useNavigate();
  const USER_ID = 'user123';

  const fetchFavorites = async () => {
    try {
      const response = await fetch(`http://localhost:8000/favorites/?user_id=${USER_ID}`);
      const data = await response.json();
      setFavorites(data);
    } catch(error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const removeFromFavorites = async (movieId) => {
    try {
      const response = await fetch(`http://localhost:8000/favorites/remove?movie_id=${movieId}&user_id=${USER_ID}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh favorites after removal
        fetchFavorites();
      } else {
        const errorData = await response.json();
        alert(errorData.detail);
      }
    } catch(error) {
      console.error('Error removing from favorites:', error);
    }
  };

  // Fetch favorites when component mounts
  useEffect(() => {
    fetchFavorites();
  }, []);

  // Search Filter
  const filteredMovies = favorites.filter(movie =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='container'>
      <div className='main-content'>
        <h1>Favorite Movies</h1>
        <div className='searchBar'>
          <label>Search</label>
          <input
            type='text'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search favorite movies..."
          />
          <button onClick={() => navigate('/')}>
            Back to Movies
          </button>
        </div>
        <div className='moviesContainer'>
          {filteredMovies.length === 0 ? (
            <p>No favorite movies found</p>
          ) : (
            filteredMovies.map(movie => (
              <div key={movie.id} className="movieTile">
                <img src={movie.poster || placeHolder} alt={movie.title} />
                <h3>{movie.title}</h3>
                <button onClick={() => removeFromFavorites(movie.id)}>
                  Remove from Favorites
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Favorites;