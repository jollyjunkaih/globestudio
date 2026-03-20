import { useState, useCallback } from 'react';

export const EASING = {
  linear: t => t,
  easeInOut: t => t < 0.5 ? 2*t*t : -1+(4-2*t)*t,
  cinematic: t => t < 0.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1,
};

function lerp(a, b, t) { return a + (b-a)*t; }

export function useCameraKeyframes() {
  const [keyframes, setKeyframes] = useState([]);
  const [easing, setEasing] = useState('easeInOut');

  const recordKeyframe = useCallback((time, state) => {
    setKeyframes(prev => {
      const next = prev.filter(kf => Math.abs(kf.time - time) >= 0.05);
      return [...next, { time, ...state }].sort((a,b) => a.time - b.time);
    });
  }, []);

  const removeKeyframe = useCallback((time) => {
    setKeyframes(prev => prev.filter(kf => Math.abs(kf.time - time) >= 0.05));
  }, []);

  const clearKeyframes = useCallback(() => setKeyframes([]), []);

  const getCameraAtTime = useCallback((time) => {
    if (!keyframes.length) return null;
    if (keyframes.length === 1) return keyframes[0];
    if (time <= keyframes[0].time) return keyframes[0];
    if (time >= keyframes[keyframes.length-1].time) return keyframes[keyframes.length-1];
    for (let i = 0; i < keyframes.length-1; i++) {
      const a = keyframes[i], b = keyframes[i+1];
      if (time >= a.time && time <= b.time) {
        const t = EASING[easing]((time-a.time)/(b.time-a.time));
        return { rotX: lerp(a.rotX,b.rotX,t), rotY: lerp(a.rotY,b.rotY,t), zoom: lerp(a.zoom,b.zoom,t) };
      }
    }
    return null;
  }, [keyframes, easing]);

  return { keyframes, easing, setEasing, recordKeyframe, removeKeyframe, clearKeyframes, getCameraAtTime };
}
