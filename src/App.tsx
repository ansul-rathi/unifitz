import { FC, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const Day21Challenge = lazy(() => import('./pages/21-days'));

const App: FC = () => {
  return (
    <Router>
      <div className="App min-h-screen">
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[#180d2c] text-white font-lexend">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/21-days" element={<Day21Challenge />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
};

export default App;