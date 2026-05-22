import { FC, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';

const Home = lazy(() => import('./pages/Home'));
const Day21Challenge = lazy(() => import('./pages/21-days'));
const StrengthChallenge = lazy(() => import('./pages/StrengthChallenge'));
const StrengthChallengeResults = lazy(() => import('./pages/StrengthChallengeResults'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const NotFound = lazy(() => import('./pages/NotFound'));

const App: FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App min-h-screen">
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[#180d2c] text-white font-lexend">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/21-days" element={<Day21Challenge />} />
              <Route path="/30-days-strength-challenge" element={<StrengthChallenge />} />
              <Route path="/30-days-strength-challenge/results" element={<StrengthChallengeResults />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;