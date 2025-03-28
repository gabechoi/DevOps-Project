import './App.css';
import Home from './pages/home';
import Header from './components/header';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Favorites from './pages/favorites';

function App() {
  return (
    <Router>
    <div className="App">
        <Header/>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Favorites" element={<Favorites/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;