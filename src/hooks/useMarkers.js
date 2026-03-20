import { useState, useCallback } from 'react';

export const MARKER_TYPES = {
  cityDot: { label: 'City Dot', icon: '🔵' },
  textLabel: { label: 'Text Label', icon: '🔤' },
  iconMarker: { label: 'Icon Marker', icon: '📍' },
  dataBubble: { label: 'Data Bubble', icon: '💬' },
};

export const ICON_OPTIONS = ['📍','⭐','🏭','👤','🏛','💰','⚡','🌊','🔥','✈️','🚢','🎯'];

let nextMarkerId = 1;

export function useMarkers() {
  const [markers, setMarkers] = useState([]);

  const addMarker = useCallback((marker) => {
    setMarkers(prev => [...prev, {
      id: `marker-${nextMarkerId++}`,
      type: 'cityDot',
      lat: 0,
      lng: 0,
      label: '',
      icon: '📍',
      color: '#64b4ff',
      size: 1,
      value: '',
      ...marker,
    }]);
  }, []);

  const updateMarker = useCallback((id, changes) => {
    setMarkers(prev => prev.map(m => m.id === id ? { ...m, ...changes } : m));
  }, []);

  const removeMarker = useCallback((id) => {
    setMarkers(prev => prev.filter(m => m.id !== id));
  }, []);

  const clearMarkers = useCallback(() => setMarkers([]), []);

  return { markers, addMarker, updateMarker, removeMarker, clearMarkers };
}
