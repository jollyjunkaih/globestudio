import { useState, useEffect, useRef, useCallback } from 'react';

const DEFAULT_TRACKS = [
  { id: 'globe-rotation', label: 'Globe Rotation', icon: '🌍', start: 0, end: 10, color: '#2d6fa8', locked: true },
];
let nextId = 10;

export function useTimeline() {
  const [tracks, setTracks] = useState(DEFAULT_TRACKS);
  const [duration, setDuration] = useState(12);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const rafRef = useRef(null);
  const lastTickRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      lastTickRef.current = performance.now();
      const tick = (now) => {
        const dt = (now - lastTickRef.current) / 1000;
        lastTickRef.current = now;
        setCurrentTime(prev => {
          const next = prev + dt;
          if (next >= duration) { setIsPlaying(false); return 0; }
          return next;
        });
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isPlaying, duration]);

  const togglePlayPause = useCallback(() => setIsPlaying(p => !p), []);
  const addTrack = useCallback(() => {
    const id = `track-${nextId++}`;
    const colors = ['#3a7bd5','#9944ff','#ff6600','#00cc66','#ff2244','#ffcc00'];
    setTracks(prev => [...prev, {
      id, label: `Track ${nextId-1}`, icon: '📍',
      start: 0, end: Math.min(duration, 6),
      color: colors[Math.floor(Math.random()*colors.length)],
    }]);
  }, [duration]);
  const removeTrack = useCallback((id) => setTracks(prev => prev.filter(t => t.id !== id || t.locked)), []);
  const updateTrack = useCallback((id, changes) => setTracks(prev => prev.map(t => t.id === id ? {...t,...changes} : t)), []);

  return { tracks, duration, setDuration, currentTime, setCurrentTime, isPlaying, togglePlayPause, addTrack, removeTrack, updateTrack };
}
