import { useState, useRef, useCallback, useEffect } from 'react';

export function useAudio() {
  const [audioFile, setAudioFile] = useState(null);   // { name, url, duration }
  const [waveformData, setWaveformData] = useState([]); // normalized samples for display
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);

  const loadAudio = useCallback(async (file) => {
    const url = URL.createObjectURL(file);
    // Decode to get waveform
    const arrayBuffer = await file.arrayBuffer();
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = audioCtx;
    const decoded = await audioCtx.decodeAudioData(arrayBuffer);

    // Downsample to ~200 points for waveform display
    const rawData = decoded.getChannelData(0);
    const samples = 200;
    const blockSize = Math.floor(rawData.length / samples);
    const waveform = [];
    for (let i = 0; i < samples; i++) {
      let sum = 0;
      for (let j = 0; j < blockSize; j++) sum += Math.abs(rawData[i * blockSize + j]);
      waveform.push(sum / blockSize);
    }
    // Normalize
    const max = Math.max(...waveform);
    const normalized = waveform.map(v => v / max);

    setWaveformData(normalized);
    setAudioFile({ name: file.name, url, duration: decoded.duration });

    // Set up HTMLAudioElement for playback
    if (audioRef.current) audioRef.current.src = url;
  }, []);

  const removeAudio = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
    if (audioFile?.url) URL.revokeObjectURL(audioFile.url);
    setAudioFile(null);
    setWaveformData([]);
  }, [audioFile]);

  // Sync audio with timeline
  const syncToTime = useCallback((time, isPlaying) => {
    const audio = audioRef.current;
    if (!audio || !audioFile) return;
    if (Math.abs(audio.currentTime - time) > 0.2) audio.currentTime = time;
    if (isPlaying && audio.paused) audio.play().catch(() => {});
    else if (!isPlaying && !audio.paused) audio.pause();
  }, [audioFile]);

  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audioRef.current = audio;
    return () => { audio.pause(); };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  return { audioFile, waveformData, isMuted, setIsMuted, volume, setVolume, loadAudio, removeAudio, syncToTime };
}
