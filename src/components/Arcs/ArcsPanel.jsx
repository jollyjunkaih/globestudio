import { useState } from 'react';
import { ARC_STYLES } from '../../hooks/useArcs';
import './ArcsPanel.css';

const PRESET_ROUTES = [
  { label: 'NY → London', fromLat: 40.71, fromLng: -74.01, toLat: 51.51, toLng: -0.13, fromLabel: 'New York', toLabel: 'London' },
  { label: 'London → Dubai', fromLat: 51.51, fromLng: -0.13, toLat: 25.20, toLng: 55.27, fromLabel: 'London', toLabel: 'Dubai' },
  { label: 'Dubai → Singapore', fromLat: 25.20, fromLng: 55.27, toLat: 1.35, toLng: 103.82, fromLabel: 'Dubai', toLabel: 'Singapore' },
  { label: 'Singapore → Tokyo', fromLat: 1.35, fromLng: 103.82, toLat: 35.68, toLng: 139.69, fromLabel: 'Singapore', toLabel: 'Tokyo' },
  { label: 'NY → São Paulo', fromLat: 40.71, fromLng: -74.01, toLat: -23.55, toLng: -46.63, fromLabel: 'New York', toLabel: 'São Paulo' },
];

const ARC_COLORS = ['#64b4ff','#ff6600','#00cc66','#ff2244','#ffcc00','#9944ff','#ff44aa','#00ffcc'];

export default function ArcsPanel({ arcs, onAddArc, onUpdateArc, onRemoveArc, onClearArcs }) {
  const [form, setForm] = useState({
    fromLat: 40.71, fromLng: -74.01, fromLabel: 'New York',
    toLat: 51.51, toLng: -0.13, toLabel: 'London',
    style: 'arc', color: '#64b4ff', width: 1.5, speed: 1,
    bidirectional: false, glow: true,
  });

  const handlePreset = (route) => setForm(f => ({ ...f, ...route }));

  return (
    <div className="arcs-panel">
      <div className="arcs-section">
        <div className="arcs-section-title">ADD CONNECTION</div>

        <div className="arcs-field">
          <label className="arcs-label">Quick routes</label>
          <div className="preset-routes">
            {PRESET_ROUTES.map(r => (
              <button key={r.label} className="preset-route-btn" onClick={() => handlePreset(r)}>{r.label}</button>
            ))}
          </div>
        </div>

        <div className="arcs-two-col">
          <div>
            <div className="arcs-field">
              <label className="arcs-label">From label</label>
              <input className="arcs-input" value={form.fromLabel} onChange={e => setForm(f => ({ ...f, fromLabel: e.target.value }))} placeholder="Origin" />
            </div>
            <div className="arcs-row">
              <div className="arcs-field">
                <label className="arcs-label">Lat</label>
                <input className="arcs-input" type="number" value={form.fromLat} step="0.1" onChange={e => setForm(f => ({ ...f, fromLat: parseFloat(e.target.value)||0 }))} />
              </div>
              <div className="arcs-field">
                <label className="arcs-label">Lng</label>
                <input className="arcs-input" type="number" value={form.fromLng} step="0.1" onChange={e => setForm(f => ({ ...f, fromLng: parseFloat(e.target.value)||0 }))} />
              </div>
            </div>
          </div>
          <div className="arcs-arrow">→</div>
          <div>
            <div className="arcs-field">
              <label className="arcs-label">To label</label>
              <input className="arcs-input" value={form.toLabel} onChange={e => setForm(f => ({ ...f, toLabel: e.target.value }))} placeholder="Destination" />
            </div>
            <div className="arcs-row">
              <div className="arcs-field">
                <label className="arcs-label">Lat</label>
                <input className="arcs-input" type="number" value={form.toLat} step="0.1" onChange={e => setForm(f => ({ ...f, toLat: parseFloat(e.target.value)||0 }))} />
              </div>
              <div className="arcs-field">
                <label className="arcs-label">Lng</label>
                <input className="arcs-input" type="number" value={form.toLng} step="0.1" onChange={e => setForm(f => ({ ...f, toLng: parseFloat(e.target.value)||0 }))} />
              </div>
            </div>
          </div>
        </div>

        <div className="arcs-field">
          <label className="arcs-label">Style</label>
          <div className="arc-style-btns">
            {Object.entries(ARC_STYLES).map(([k, v]) => (
              <button key={k} className={`arc-style-btn ${form.style === k ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, style: k }))}>
                {v.icon} {v.label}
              </button>
            ))}
          </div>
        </div>

        <div className="arcs-field">
          <label className="arcs-label">Color</label>
          <div className="arc-colors">
            {ARC_COLORS.map(c => <button key={c} className={`arc-color ${form.color === c ? 'active' : ''}`} style={{ backgroundColor: c }} onClick={() => setForm(f => ({ ...f, color: c }))} />)}
          </div>
        </div>

        <div className="arcs-field">
          <label className="arcs-label">Speed: {form.speed}x</label>
          <input type="range" min={0.2} max={3} step={0.2} value={form.speed} onChange={e => setForm(f => ({ ...f, speed: parseFloat(e.target.value) }))} className="arcs-slider" />
        </div>

        <div className="arcs-toggles">
          <label className="arcs-toggle">
            <input type="checkbox" checked={form.bidirectional} onChange={e => setForm(f => ({ ...f, bidirectional: e.target.checked }))} />
            Bidirectional
          </label>
          <label className="arcs-toggle">
            <input type="checkbox" checked={form.glow} onChange={e => setForm(f => ({ ...f, glow: e.target.checked }))} />
            Glow
          </label>
        </div>

        <button className="arcs-add-btn" onClick={() => onAddArc({ ...form })}>+ Add Connection</button>
      </div>

      {arcs.length > 0 && (
        <div className="arcs-section">
          <div className="arcs-section-title">CONNECTIONS ({arcs.length})</div>
          <div className="arcs-list">
            {arcs.map(a => (
              <div key={a.id} className="arc-item">
                <span className="arc-item-dot" style={{ backgroundColor: a.color }} />
                <span className="arc-item-label">{a.fromLabel || '?'} → {a.toLabel || '?'}</span>
                <span className="arc-item-style">{ARC_STYLES[a.style]?.icon}</span>
                <button className="arc-item-remove" onClick={() => onRemoveArc(a.id)}>×</button>
              </div>
            ))}
          </div>
          <button className="arcs-clear-btn" onClick={onClearArcs}>Clear All</button>
        </div>
      )}
    </div>
  );
}
