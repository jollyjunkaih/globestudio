import './Toolbar.css';
export default function Toolbar({ autoRotate, onToggleAutoRotate, onClearHighlights, onExportClick }) {
  return (
    <div className="toolbar">
      <div className="toolbar-logo">
        <span className="toolbar-logo-icon">🌍</span>
        <span className="toolbar-logo-text">GlobeStudio</span>
      </div>
      <div className="toolbar-actions">
        <button className={`toolbar-btn ${autoRotate ? 'active' : ''}`} onClick={onToggleAutoRotate}>
          {autoRotate ? '⏸ Pause Rotate' : '▶ Auto Rotate'}
        </button>
        <button className="toolbar-btn" onClick={onClearHighlights}>🗑 Clear All</button>
        <button className="toolbar-btn toolbar-btn-export" onClick={onExportClick}>⬇ Export</button>
      </div>
    </div>
  );
}
