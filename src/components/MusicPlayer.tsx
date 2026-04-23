import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';

const PLAYLIST = [
  {
    title: "Synthwave Alpha",
    artist: "AI Gen Protocol 01",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    title: "Neon Outrun",
    artist: "AI Gen Protocol 02",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    title: "Cybernetic Horizon",
    artist: "AI Gen Protocol 03",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  }
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = PLAYLIST[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
      if (isPlaying && audioRef.current) {
        audioRef.current.play().catch(e => {
            console.error("Audio playback failed", e);
            setIsPlaying(false);
        });
      }
  }, [currentTrackIndex]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Audio playback failed", e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
  };

  const handleEnded = () => {
    handleNext();
  };

  return (
    <div className="bg-zinc-900 border border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.3)] rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 w-full backdrop-blur-md relative overflow-hidden group transition-all hover:border-pink-400">
        {/* Visualizer effect background */}
        {isPlaying && (
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-violet-500/10 to-cyan-500/5 animate-pulse z-0 pointer-events-none" />
        )}
        
      <div className="flex items-center gap-4 z-10 w-full md:w-auto overflow-hidden">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-violet-500 flex items-center justify-center shadow-[0_0_10px_theme(colors.pink.500)] shrink-0" style={{ animation: isPlaying ? 'spin 4s linear infinite' : 'none' }}>
            <div className="w-4 h-4 rounded-full bg-black" />
        </div>
        <div className="min-w-0 flex-1 lg:w-48 xl:w-64">
          <h3 className="font-bold text-pink-400 truncate neon-text font-mono text-sm md:text-base">{currentTrack.title}</h3>
          <p className="text-zinc-400 text-xs truncate">by {currentTrack.artist}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 z-10">
        <button onClick={handlePrev} className="text-zinc-400 hover:text-pink-400 transition-colors cursor-pointer">
          <SkipBack size={20} />
        </button>
        <button 
          onClick={togglePlay} 
          className="w-10 h-10 rounded-full bg-pink-500/20 border border-pink-500 flex items-center justify-center text-pink-400 hover:bg-pink-500 hover:text-white transition-all shadow-[0_0_8px_theme(colors.pink.500)] cursor-pointer"
        >
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
        </button>
        <button onClick={handleNext} className="text-zinc-400 hover:text-pink-400 transition-colors cursor-pointer">
          <SkipForward size={20} />
        </button>
      </div>

      <div className="hidden md:flex items-center gap-2 z-10 w-32 shrink-0">
        <button onClick={() => setIsMuted(!isMuted)} className="text-zinc-400 hover:text-cyan-400 cursor-pointer">
          {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={isMuted ? 0 : volume}
          onChange={(e) => {
            setVolume(parseFloat(e.target.value));
            if (isMuted) setIsMuted(false);
          }}
          className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
      </div>

      <audio 
        ref={audioRef} 
        src={currentTrack.url} 
        onEnded={handleEnded} 
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </div>
  );
}
