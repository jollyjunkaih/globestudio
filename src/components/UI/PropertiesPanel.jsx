import { useState } from 'react';
import './PropertiesPanel.css';
const COLORS = ['#ff6600','#0088ff','#00cc66','#ff2244','#ffcc00','#9944ff','#ff44aa','#00ccff'];
export default function PropertiesPanel({ selectedCountries, highlightedCountries, onHighlightCountry, onClearHighlights }) {
  const [color, setColor] = useState('#ff6600');
  const selected = [...selectedCountries];
  const highlighted = [...(highlightedCountries?.entries() || [])];
  return (
    <div className="properties-panel">
      <div className="panel-section">
        <div className="panel-section-title">PROPERTIES</div>
        {selected.length === 0 ? (
          <div className="panel-empty"><div className="panel-empty-icon">🖱️</div><div className="panel-empty-text">Click a country<br/>to select it</div></div>
        ) : (
          <>
            <div className="panel-field">
              <label className="panel-label">Selected</label>
              <div className="selected-countries">{selected.map(id => <span key={id} className="country-chip">{id}</span>)}</div>
            </div>
            <div className="panel-field">
              <label className="panel-label">Highlight Color</label>
              <div className="color-swatches">{COLORS.map(c => <button key={c} className={`color-swatch ${color===c?'active':''}`} style={{backgroundColor:c}} onClick={() => setColor(c)} />)}</div>
            </div>
            <button className="panel-action-btn" onClick={() => selected.forEach(id => onHighlightCountry(id, color))}>✨ Apply Highlight</button>
          </>
        )}
      </div>
      {highlighted.length > 0 && (
        <div className="panel-section">
          <div className="panel-section-title">HIGHLIGHTED ({highlighted.length})</div>
          <div className="highlighted-list">{highlighted.map(([id, c]) => (
            <div key={id} className="highlighted-item">
              <span className="highlighted-dot" style={{backgroundColor:c}} />
              <span className="highlighted-name">{id}</span>
              <button className="highlighted-remove" onClick={() => onHighlightCountry(id, c)}>×</button>
            </div>
          ))}</div>
          <button className="panel-clear-btn" onClick={onClearHighlights}>🗑 Clear All</button>
        </div>
      )}
      <div className="panel-section panel-section-info">
        <div className="panel-section-title">CONTROLS</div>
        <div className="controls-list">
          <div className="control-item"><kbd>Drag</kbd> Rotate globe</div>
          <div className="control-item"><kbd>Scroll</kbd> Zoom</div>
          <div className="control-item"><kbd>Click</kbd> Select country</div>
        </div>
      </div>
    </div>
  );
}
