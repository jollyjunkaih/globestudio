import { useState } from 'react';
import { MARKER_TYPES, ICON_OPTIONS } from '../../hooks/useMarkers';
import './MarkersPanel.css';

const PRESET_CITIES = [
  { label: 'New York', lat: 40.71, lng: -74.01 },
  { label: 'London', lat: 51.51, lng: -0.13 },
  { label: 'Tokyo', lat: 35.68, lng: 139.69 },
  { label: 'Singapore', lat: 1.35, lng: 103.82 },
  { label: 'Dubai', lat: 25.20, lng: 55.27 },
  { label: 'Sydney', lat: -33.87, lng: 151.21 },
  { label: 'Paris', lat: 48.86, lng: 2.35 },
  { label: 'São Paulo', lat: -23.55, lng: -46.63 },
];

const COLORS = ['#64b4ff','#ff6600','#00cc66','#ff2244','#ffcc00','#9944ff','#ff44aa','#00ccff','#ffffff'];

export default function MarkersPanel({ markers, onAddMarker, onUpdateMarker, onRemoveMarker, onClearMarkers }) {
  const [form, setForm] = useState({ type: 'cityDot', lat: 0, lng: 0, label: '', icon: '📍', color: '#64b4ff', size: 1, value: '' });
  const [selectedId, setSelectedId] = useState(null);

  const handleAdd = () => {
    onAddMarker({ ...form });
  };

  const handlePreset = (city) => {
    setForm(f => ({ ...f, label: city.label, lat: city.lat, lng: city.lng }));
  };

  const selected = markers.find(m => m.id === selectedId);

  return (
    <div className="markers-panel">
      <div className="markers-section">
        <div className="markers-section-title">📍 ADD MARKER</div>

        <div className="markers-field">
          <label className="markers-label">Type</label>
          <div className="marker-type-btns">
            {Object.entries(MARKER_TYPES).map(([k, v]) => (
              <button key={k} className={`marker-type-btn ${form.type === k ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, type: k }))}>
                {v.icon} {v.label}
              </button>
            ))}
          </div>
        </div>

        <div className="markers-field">
          <label className="markers-label">Quick add city</label>
          <div className="preset-cities">
            {PRESET_CITIES.map(c => (
              <button key={c.label} className="preset-city-btn" onClick={() => handlePreset(c)}>{c.label}</button>
            ))}
          </div>
        </div>

        <div className="markers-row">
          <div className="markers-field">
            <label className="markers-label">Lat</label>
            <input className="markers-input" type="number" value={form.lat} step="0.1" onChange={e => setForm(f => ({ ...f, lat: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div className="markers-field">
            <label className="markers-label">Lng</label>
            <input className="markers-input" type="number" value={form.lng} step="0.1" onChange={e => setForm(f => ({ ...f, lng: parseFloat(e.target.value) || 0 }))} />
          </div>
        </div>

        <div className="markers-field">
          <label className="markers-label">Label</label>
          <input className="markers-input full" placeholder="e.g. New York" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} />
        </div>

        {form.type === 'dataBubble' && (
          <div className="markers-field">
            <label className="markers-label">Value</label>
            <input className="markers-input full" placeholder="e.g. 8.3M" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} />
          </div>
        )}

        {form.type === 'iconMarker' && (
          <div className="markers-field">
            <label className="markers-label">Icon</label>
            <div className="icon-grid">
              {ICON_OPTIONS.map(ic => (
                <button key={ic} className={`icon-btn ${form.icon === ic ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, icon: ic }))}>{ic}</button>
              ))}
            </div>
          </div>
        )}

        <div className="markers-field">
          <label className="markers-label">Color</label>
          <div className="color-row">
            {COLORS.map(c => (
              <button key={c} className={`mcolor-swatch ${form.color === c ? 'active' : ''}`} style={{ backgroundColor: c }} onClick={() => setForm(f => ({ ...f, color: c }))} />
            ))}
          </div>
        </div>

        <div className="markers-field">
          <label className="markers-label">Size: {form.size}x</label>
          <input type="range" min={0.5} max={3} step={0.5} value={form.size} onChange={e => setForm(f => ({ ...f, size: parseFloat(e.target.value) }))} className="markers-slider" />
        </div>

        <button className="markers-add-btn" onClick={handleAdd}>+ Add Marker</button>
      </div>

      {markers.length > 0 && (
        <div className="markers-section">
          <div className="markers-section-title">PLACED ({markers.length})</div>
          <div className="markers-list">
            {markers.map(m => (
              <div key={m.id} className={`marker-item ${selectedId === m.id ? 'active' : ''}`} onClick={() => setSelectedId(selectedId === m.id ? null : m.id)}>
                <span className="marker-item-icon">{MARKER_TYPES[m.type]?.icon}</span>
                <span className="marker-item-label">{m.label || m.type}</span>
                <span className="marker-item-coords">{m.lat.toFixed(1)}, {m.lng.toFixed(1)}</span>
                <button className="marker-item-remove" onClick={(e) => { e.stopPropagation(); onRemoveMarker(m.id); }}>×</button>
              </div>
            ))}
          </div>
          <button className="markers-clear-btn" onClick={onClearMarkers}>🗑 Clear All</button>
        </div>
      )}
    </div>
  );
}
