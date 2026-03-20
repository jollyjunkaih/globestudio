import { useState, useCallback } from 'react';
import { SKINS } from '../data/skins';

export function useGlobe() {
  const [activeSkin, setActiveSkin] = useState('satellite');
  const [selectedCountries, setSelectedCountries] = useState(new Set());
  const [highlightedCountries, setHighlightedCountries] = useState(new Map());
  const [autoRotate, setAutoRotate] = useState(true);

  const selectCountry = useCallback((countryId) => {
    setSelectedCountries(prev => {
      const next = new Set(prev);
      if (next.has(countryId)) next.delete(countryId); else next.add(countryId);
      return next;
    });
  }, []);

  const highlightCountry = useCallback((countryId, color = '#ff6600') => {
    setHighlightedCountries(prev => {
      const next = new Map(prev);
      if (next.has(countryId)) next.delete(countryId); else next.set(countryId, color);
      return next;
    });
  }, []);

  const clearHighlights = useCallback(() => {
    setHighlightedCountries(new Map());
    setSelectedCountries(new Set());
  }, []);

  return {
    activeSkin, setActiveSkin, currentSkin: SKINS[activeSkin],
    selectedCountries, selectCountry,
    highlightedCountries, highlightCountry, clearHighlights,
    autoRotate, setAutoRotate,
  };
}
