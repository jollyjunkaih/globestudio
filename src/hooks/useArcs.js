import { useState, useCallback } from 'react';

export const ARC_STYLES = {
  arc: { label: 'Arc', icon: '〜' },
  dashed: { label: 'Dashed', icon: '╌' },
  flow: { label: 'Flow', icon: '→' },
  pulse: { label: 'Pulse', icon: '◉' },
};

let nextArcId = 1;

export function useArcs() {
  const [arcs, setArcs] = useState([]);

  const addArc = useCallback((arc) => {
    setArcs(prev => [...prev, {
      id: `arc-${nextArcId++}`,
      fromLat: 0, fromLng: 0,
      toLat: 0, toLng: 0,
      fromLabel: '', toLabel: '',
      style: 'arc',
      color: '#64b4ff',
      width: 1.5,
      speed: 1,
      bidirectional: false,
      glow: true,
      ...arc,
    }]);
  }, []);

  const updateArc = useCallback((id, changes) => {
    setArcs(prev => prev.map(a => a.id === id ? { ...a, ...changes } : a));
  }, []);

  const removeArc = useCallback((id) => {
    setArcs(prev => prev.filter(a => a.id !== id));
  }, []);

  const clearArcs = useCallback(() => setArcs([]), []);

  return { arcs, addArc, updateArc, removeArc, clearArcs };
}
