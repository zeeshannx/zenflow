import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, SkipForward, SkipBack, Shuffle, Repeat, ListMusic, X } from 'lucide-react';
import { TRACKS } from './constants.ts';
import { Track } from './types.ts';
import { formatTime } from './utils/time.ts';
import { Background } from './components/Background.tsx';

function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track>(TRACKS[0]);
  const [seconds, setSeconds] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isShuffle, setIsShuffle] = useState(true);
  const [isLoop, setIsLoop] = useState(true);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

  // Core navigation logic
  const nextTrack = () => {
    const idx = TRACKS.findIndex(t => t.id === currentTrack.id);
    if (isShuffle && TRACKS.length > 1) {
      let nextIdx;
      do {
        nextIdx = Math.floor(Math.random() * TRACKS.length);
      } while (nextIdx === idx);
      setCurrentTrack(TRACKS[nextIdx]);
    } else {
      setCurrentTrack(TRACKS[(idx + 1) % TRACKS.length]);
    }
  };

  // Ref to keep nextTrack logic current in event listeners without re-attaching
  const nextTrackRef = useRef(nextTrack);
  useEffect(() => {
    nextTrackRef.current = nextTrack;
  }, [nextTrack, isShuffle, currentTrack]);

  const prevTrack = () => {
    const idx = TRACKS.findIndex(t => t.id === currentTrack.id);
    setCurrentTrack(TRACKS[(idx - 1 + TRACKS.length) % TRACKS.length]);
  };

  const selectTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsLibraryOpen(false);
    setIsPlaying(true);
  };

  // Initialize Audio
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      const handleEnded = () => {
        // Only trigger next track if the current track isn't natively looping
        if (audioRef.current && !audioRef.current.loop) {
          nextTrackRef.current();
        }
      };
      
      audioRef.current.addEventListener('ended', handleEnded);
      
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('ended', handleEnded);
        }
      };
    }
  }, []);

  // Sync state to audio element
  useEffect(() => {
    if (audioRef.current) {
      if (audioRef.current.src !== currentTrack.src) {
        audioRef.current.src = currentTrack.src;
      }
      audioRef.current.volume = volume;
      audioRef.current.loop = isLoop;

      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentTrack, isLoop]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying]);

  // Persistent Timer: 'seconds' never resets during the session
  useEffect(() => {
    if (isPlaying && hasStarted) {
      timerRef.current = window.setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, hasStarted]);

  const handleStart = () => {
    setHasStarted(true);
    setIsPlaying(true);
  };

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-black text-zinc-100 selection:bg-white/10">
      <Background gradientClass={currentTrack.gradient} />

      <AnimatePresence mode="wait">
        {!hasStarted ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(40px)" }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-24"
          >
            <div className="text-center space-y-6">
              <h1 className="text-8xl md:text-[10rem] font-thin tracking-tighter text-white/95">
                ZenFlow
              </h1>
              <p className="text-sm text-white/20 font-light tracking-[0.8em] uppercase">
                Step into the flow
              </p>
            </div>

            <motion.button
              onClick={handleStart}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="group relative w-32 h-32 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 hover:bg-white/10 transition-all duration-700"
            >
              <div className="absolute inset-0 rounded-full border border-white/5 animate-[ping_5s_ease-in-out_infinite]" />
              <Play size={40} className="ml-1.5 fill-white text-white opacity-60 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2.5 }}
            className="flex flex-col items-center justify-between h-full py-16 w-full max-w-7xl px-8 z-10"
          >
            <div className="w-full flex justify-between items-center">
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-[10px] font-medium tracking-[0.8em] text-white/20 uppercase"
              >
                Deep Work Session
              </motion.div>
              <motion.button
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                onClick={() => setIsLibraryOpen(true)}
                className="p-2 text-white/20 hover:text-white transition-colors"
                aria-label="Open Library"
              >
                <ListMusic size={20} strokeWidth={1} />
              </motion.button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-8">
               <motion.div 
                  key={seconds === 0 ? 'init' : 'active'}
                  className="font-variant-numeric text-9xl md:text-[16rem] font-thin tracking-tighter text-white/90 drop-shadow-[0_0_100px_rgba(255,255,255,0.05)]"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 2, ease: "easeOut" }}
               >
                 {formatTime(seconds)}
               </motion.div>
               <motion.div 
                 key={currentTrack.id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 }}
                 className="px-6 py-2 rounded-full bg-white/[0.03] backdrop-blur-md border border-white/5 text-[11px] font-light text-white/40 tracking-[0.4em] uppercase"
               >
                 {currentTrack.name}
               </motion.div>
            </div>

            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex flex-col items-center gap-8 group/controls"
            >
              <div className="flex items-center gap-10">
                <button 
                  onClick={prevTrack} 
                  className="text-white/20 hover:text-white transition-all transform hover:scale-110 active:scale-90"
                  aria-label="Previous track"
                >
                  <SkipBack size={24} strokeWidth={1} />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-28 h-28 rounded-full flex items-center justify-center bg-white/5 backdrop-blur-2xl border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-500 shadow-2xl active:scale-95"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause size={40} strokeWidth={1} className="fill-white/80 text-white/80" />
                  ) : (
                    <Play size={40} strokeWidth={1} className="fill-white/80 text-white/80 pl-1" />
                  )}
                </button>

                <button 
                  onClick={nextTrack} 
                  className="text-white/20 hover:text-white transition-all transform hover:scale-110 active:scale-90"
                  aria-label="Next track"
                >
                  <SkipForward size={24} strokeWidth={1} />
                </button>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 mr-4">
                  <button
                    onClick={() => setIsShuffle(!isShuffle)}
                    className={`transition-all duration-300 transform hover:scale-110 active:scale-95 ${isShuffle ? 'text-white' : 'text-white/20 hover:text-white/40'}`}
                    aria-label="Toggle Shuffle"
                    title="Shuffle"
                  >
                    <Shuffle size={18} strokeWidth={isShuffle ? 2 : 1.5} />
                  </button>

                  <button
                    onClick={() => setIsLoop(!isLoop)}
                    className={`transition-all duration-300 transform hover:scale-110 active:scale-95 ${isLoop ? 'text-white' : 'text-white/20 hover:text-white/40'}`}
                    aria-label="Toggle Repeat One"
                    title="Repeat One"
                  >
                    <Repeat size={18} strokeWidth={isLoop ? 2 : 1.5} />
                  </button>
                </div>

                <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-white/[0.02] border border-white/5 backdrop-blur-sm opacity-60 hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setVolume(v => v === 0 ? 0.5 : 0)} 
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-24 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLibraryOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLibraryOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[100]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 h-[70vh] bg-zinc-900/90 border-t border-white/5 z-[101] flex flex-col rounded-t-[3rem]"
            >
              <div className="p-8 flex items-center justify-between border-b border-white/5">
                <div>
                  <h2 className="text-2xl font-light tracking-tight">Sound Library</h2>
                  <p className="text-xs text-white/20 uppercase tracking-widest mt-1">17 Focus Landscapes</p>
                </div>
                <button 
                  onClick={() => setIsLibraryOpen(false)}
                  className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X size={20} strokeWidth={1} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-4xl mx-auto">
                  {TRACKS.map((track) => (
                    <button
                      key={track.id}
                      onClick={() => selectTrack(track)}
                      className={`group flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
                        currentTrack.id === track.id 
                        ? 'bg-white/10 border-white/10' 
                        : 'hover:bg-white/5 border-transparent'
                      } border`}
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${track.gradient} shadow-lg flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity`}>
                        {currentTrack.id === track.id && isPlaying && (
                          <div className="flex gap-0.5 items-end h-3">
                            <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-white/80 rounded-full" />
                            <motion.div animate={{ height: [8, 4, 8] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-white/80 rounded-full" />
                            <motion.div animate={{ height: [6, 10, 6] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-1 bg-white/80 rounded-full" />
                          </div>
                        )}
                      </div>
                      <div className="text-left">
                        <div className={`text-sm font-medium ${currentTrack.id === track.id ? 'text-white' : 'text-white/60 group-hover:text-white/90'}`}>
                          {track.name}
                        </div>
                        <div className="text-[10px] text-white/20 uppercase tracking-widest mt-0.5">Focus Mode</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

export default App;