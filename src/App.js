import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './components/Navigation/Header';
import VideoDisplay from './pages/api/video';
import Recipes from './pages/Recipies';
import RecipeDetail from './components/Recipes/RecipeDetail';
// import Soumya from './pages/soumya';
import Birthday from './pages/Birthday';
import NotFound from './pages/NotFound';
import ZumbaPage from './pages/Zumba';
import YogaPage from './pages/Yoga';
import WeightTrainingPage from './pages/WeightTraiing';
import AboutUs from './pages/About';
import ContactUs from './pages/Contact';
import Challenges from './pages/Challenges';
import ChallengeDetails from './pages/ChallengeDetails';
import VideoPlayer from './components/programs/VideoPlayer';
import EnrollmentForm from './pages/Enroll';
import FitnessToolsPage from './pages/FitnessToolsPage';

const App = () => {
  return (
    <Router>
      <div className='bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700'>
        <Navbar /> {/* Navigation component */}
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/register" element={<ClientForm />} /> */}
          <Route path="/videos" element={<VideoDisplay />} />
          {/* Add more routes as needed */}
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/happy-birthday/sona" element={<Birthday />} />
          <Route path="/birthday" element={<Birthday />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/zumba" element={<ZumbaPage />} />
          <Route path="/yoga" element={<YogaPage />} />
          <Route path="/weight-training" element={<WeightTrainingPage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/enroll" element={<EnrollmentForm />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/challenges/:challengeId" element={<ChallengeDetails />} />
          <Route path="/challenges/:challengeId/:videoId" element={<VideoPlayer />} />
          <Route path="/fitness-tools" element={<FitnessToolsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
