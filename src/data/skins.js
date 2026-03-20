export const SKINS = {
  satellite: {
    id: 'satellite', label: 'Satellite',
    globeColor: '#1a3a5c', countryFill: 'rgba(255,255,255,0.05)', countryBorder: '#4a90d9', borderWidth: 0.5,
    atmosphere: true, atmosphereColor: '#1e90ff',
    textureUrl: 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
    background: '#000011', starfield: true,
  },
  cleanLight: {
    id: 'cleanLight', label: 'Clean Light',
    globeColor: '#e8e8e8', countryFill: '#f5f5f5', countryBorder: '#cccccc', borderWidth: 0.8,
    atmosphere: false, textureUrl: null, background: '#ffffff', starfield: false,
  },
  darkMatter: {
    id: 'darkMatter', label: 'Dark Matter',
    globeColor: '#0a0a1a', countryFill: 'rgba(100,200,255,0.05)', countryBorder: '#00ffff', borderWidth: 1.0,
    atmosphere: true, atmosphereColor: '#0066ff', textureUrl: null, background: '#000000', starfield: true,
  },
  nightLights: {
    id: 'nightLights', label: 'Night Lights',
    globeColor: '#000011', countryFill: 'rgba(255,200,50,0.03)', countryBorder: '#333333', borderWidth: 0.3,
    atmosphere: true, atmosphereColor: '#ff6600',
    textureUrl: 'https://unpkg.com/three-globe/example/img/earth-night.jpg',
    background: '#000000', starfield: true,
  },
  political: {
    id: 'political', label: 'Political',
    globeColor: '#c8d8f0', countryFill: '#e8f4d0', countryBorder: '#888888', borderWidth: 0.8,
    atmosphere: false, textureUrl: null, background: '#aaccff', starfield: false,
  },
  wireframe: {
    id: 'wireframe', label: 'Wireframe',
    globeColor: '#001122', countryFill: 'rgba(0,255,150,0.05)', countryBorder: '#00ff96', borderWidth: 0.6,
    atmosphere: false, textureUrl: null, background: '#000a14', starfield: true, wireframe: true,
  },
  topographic: {
    id: 'topographic', label: 'Topographic',
    globeColor: '#5a8a3c', countryFill: 'rgba(255,255,200,0.1)', countryBorder: '#888866', borderWidth: 0.5,
    atmosphere: true, atmosphereColor: '#88aaff',
    textureUrl: 'https://unpkg.com/three-globe/example/img/earth-topology.png',
    background: '#001133', starfield: false,
  },
};
export const SKIN_ORDER = ['satellite','cleanLight','darkMatter','nightLights','political','wireframe','topographic'];
