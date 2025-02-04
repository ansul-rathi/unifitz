import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './components/Navigation/Navbar';
import VideoDisplay from './pages/api/video';

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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
