import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './components/Navigation/Header';
import VideoDisplay from './pages/api/video';
import Recipes from './pages/Recipies';
import RecipeDetail from './components/Recipes/RecipeDetail';
import ZumbaPage from './pages/Zumba';
import YogaPage from './pages/Yoga';
import WeightTrainingPage from './pages/WeightTraiing';

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
          <Route path="/zumba" element={<ZumbaPage />} />
          <Route path="/yoga" element={<YogaPage />} />
          <Route path="/weight-training" element={<WeightTrainingPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
