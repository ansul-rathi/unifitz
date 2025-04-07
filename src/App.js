import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './components/Navigation/Navbar';
import VideoDisplay from './pages/api/video';
import Recipes from './pages/Recipies';
import RecipeDetail from './components/Recipes/RecipeDetail';
// import Soumya from './pages/soumya';
import Birthday from './pages/Birthday';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <Router>
      <div>
        <Navbar /> {/* Navigation component */}
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/register" element={<ClientForm />} /> */}
          <Route path="/videos" element={<VideoDisplay />} />
          {/* Add more routes as needed */}
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/happy-birthday/sona" element={<Birthday />} />
          <Route path="*" element={<NotFound />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
