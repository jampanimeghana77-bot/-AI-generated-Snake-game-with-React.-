import { useState } from 'react';
import MusicPlayer from './components/MusicPlayer';
import SnakeGame from './components/SnakeGame';

export default function App() {
  const [score, setScore] = useState(0);

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-4 font-sans selection:bg-cyan-500/30 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black z-[-1]" />
      
      <header className="w-full max-w-4xl flex justify-between items-center py-4">
        <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 neon-text uppercase tracking-widest leading-normal pb-2">
          Neon Serpent
        </h1>
        <div className="text-xl sm:text-2xl font-mono text-cyan-400 neon-text">
          SCORE: {score.toString().padStart(4, '0')}
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center w-full my-4">
        <SnakeGame score={score} setScore={setScore} />
      </main>

      <footer className="w-full max-w-4xl py-4 pb-8">
        <MusicPlayer />
      </footer>
    </div>
  );
}
