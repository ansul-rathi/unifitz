import { FC } from 'react';
import Hero from '../components/21-days/Hero';
import Sessions from '../components/21-days/Sessions';

const Day21Challenge: FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <Sessions />
    </div>
  );
}

export default Day21Challenge;
