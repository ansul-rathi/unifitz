import { FC, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Lazy load the main page
const Day21Challenge = lazy(() => import('./pages/21-days'));

const App: FC = () => {
  return (
    <Router>
      <div className="App min-h-screen">
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Day21Challenge />} />
            <Route path="*" element={<Day21Challenge />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
};

export default App;