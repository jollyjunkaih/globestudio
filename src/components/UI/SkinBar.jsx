import { SKINS, SKIN_ORDER } from '../../data/skins';
import './SkinBar.css';
const ICONS = { satellite:'🛰', cleanLight:'☀️', darkMatter:'🌑', nightLights:'🌃', political:'🗺', wireframe:'📡', topographic:'🏔' };
export default function SkinBar({ activeSkin, onSkinChange }) {
  return (
    <div className="skin-bar">
      <span className="skin-bar-label">SKIN</span>
      {SKIN_ORDER.map(id => (
        <button key={id} className={`skin-btn ${activeSkin === id ? 'active' : ''}`} onClick={() => onSkinChange(id)} title={SKINS[id].label}>
          <span>{ICONS[id]}</span><span>{SKINS[id].label}</span>
        </button>
      ))}
    </div>
  );
}
