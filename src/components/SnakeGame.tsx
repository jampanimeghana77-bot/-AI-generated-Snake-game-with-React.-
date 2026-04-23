import { useState, useEffect, useCallback, useRef } from 'react';

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;

type Point = { x: number; y: number };

export default function SnakeGame({ score, setScore }: { score: number, setScore: (s: number) => void }) {
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Point>({ x: 0, y: -1 });
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  const directionRef = useRef(direction);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      if (!currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection({ x: 0, y: -1 });
    directionRef.current = { x: 0, y: -1 };
    setFood(generateFood([{ x: 10, y: 10 }]));
    setGameOver(false);
    setScore(0);
    setHasStarted(true);
    setIsPaused(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scroll behavior for arrow keys
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].indexOf(e.key) > -1) {
          e.preventDefault();
      }
      
      if (e.key === ' ' && hasStarted && !gameOver) {
        setIsPaused(p => !p);
        return;
      }

      if (gameOver && e.key === 'Enter') {
        resetGame();
        return;
      }
      
      const currentDir = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (currentDir.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
          if (currentDir.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
          if (currentDir.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
          if (currentDir.x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, hasStarted, isPaused, generateFood]); // GenerateFood is stable

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    if (!hasStarted || isPaused || gameOver) return;

    const moveSnake = () => {
      setSnake(prev => {
        const head = prev[0];
        const newHead = { x: head.x + directionRef.current.x, y: head.y + directionRef.current.y };

        // Collision with walls
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          setGameOver(true);
          return prev;
        }

        // Collision with self
        if (prev.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prev;
        }

        const newSnake = [newHead, ...prev];

        // Eating food
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(score + 10);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const speed = Math.max(50, INITIAL_SPEED - Math.floor(score / 50) * 10);
    gameLoopRef.current = setInterval(moveSnake, speed);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [direction, food, gameOver, hasStarted, isPaused, score, setScore, generateFood]);

  return (
    <div className="relative p-2 bg-zinc-900/50 rounded-lg neon-box backdrop-blur-sm">
      <div 
        className="grid gap-[1px] bg-zinc-800/80 border border-zinc-700/50"
        style={{ 
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          width: 'min(80vw, 400px)',
          height: 'min(80vw, 400px)'
        }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);
          const isSnake = snake.some(s => s.x === x && s.y === y);
          const isHead = snake[0].x === x && snake[0].y === y;
          const isFood = food.x === x && food.y === y;

          return (
            <div 
              key={i} 
              className={`w-full h-full ${
                isHead ? 'bg-cyan-400 shadow-[0_0_8px_theme(colors.cyan.400)] z-10 scale-110 rounded-sm' :
                isSnake ? 'neon-snake rounded-sm' : 
                isFood ? 'neon-food' : 
                'bg-zinc-950/40'
              }`}
            />
          );
        })}
      </div>

      {(!hasStarted || gameOver || isPaused) && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg">
          <div className="text-center p-6 border neon-box bg-zinc-900/80 rounded-xl">
            {gameOver ? (
              <>
                <h2 className="text-3xl font-bold text-pink-500 mb-2 neon-text">SYSTEM FAILURE</h2>
                <p className="text-zinc-300 mb-4 font-mono text-sm">FINAL SCORE: {score}</p>
                <button 
                  onClick={resetGame}
                  className="px-6 py-2 bg-pink-500/20 text-pink-400 border border-pink-500 hover:bg-pink-500 hover:text-white transition-all duration-300 font-bold tracking-widest neon-text font-mono cursor-pointer"
                >
                  REBOOT
                </button>
              </>
            ) : !hasStarted ? (
              <>
                <h2 className="text-3xl font-bold text-cyan-400 mb-4 neon-text">INITIALIZE</h2>
                <p className="text-zinc-400 mb-4 font-mono text-xs">Use WASD or Arrows to move.<br/>Space to pause.</p>
                <button 
                  onClick={resetGame}
                  className="px-6 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500 hover:bg-cyan-500 hover:text-white transition-all duration-300 font-bold tracking-widest neon-text font-mono cursor-pointer"
                >
                  START
                </button>
              </>
            ) : isPaused ? (
                <>
                <h2 className="text-3xl font-bold text-yellow-400 mb-4 neon-text">PAUSED</h2>
                <button 
                  onClick={() => setIsPaused(false)}
                  className="px-6 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500 hover:bg-yellow-500 hover:text-white transition-all duration-300 font-bold tracking-widest neon-text font-mono cursor-pointer"
                >
                  RESUME
                </button>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
