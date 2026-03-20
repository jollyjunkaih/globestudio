import './ExportPanel.css';
import { EXPORT_FORMATS, EXPORT_RESOLUTIONS, EXPORT_FPS_OPTIONS } from '../../hooks/useExport';
export default function ExportPanel({ isExporting, exportProgress, exportError, exportFormat, exportResolution, exportFps, onFormatChange, onResolutionChange, onFpsChange, onExport, onCancel, duration }) {
  const res = EXPORT_RESOLUTIONS[exportResolution];
  const totalFrames = Math.ceil(duration * exportFps);
  return (
    <div className="export-panel">
      <div className="export-header"><span className="export-title">⬇ Export Video</span></div>
      {!isExporting ? (
        <>
          <div className="export-field">
            <label className="export-label">Format</label>
            <div className="export-options">
              {Object.entries(EXPORT_FORMATS).map(([k,f]) => <button key={k} className={`export-opt-btn ${exportFormat===k?'active':''}`} onClick={()=>onFormatChange(k)}>{f.label}</button>)}
            </div>
          </div>
          <div className="export-field">
            <label className="export-label">Resolution</label>
            <div className="export-options">
              {Object.entries(EXPORT_RESOLUTIONS).map(([k,r]) => <button key={k} className={`export-opt-btn ${exportResolution===k?'active':''}`} onClick={()=>onResolutionChange(k)}>{r.label}</button>)}
            </div>
          </div>
          <div className="export-field">
            <label className="export-label">Frame Rate</label>
            <div className="export-options">
              {EXPORT_FPS_OPTIONS.map(fps => <button key={fps} className={`export-opt-btn ${exportFps===fps?'active':''}`} onClick={()=>onFpsChange(fps)}>{fps} fps</button>)}
            </div>
          </div>
          <div className="export-summary">{res.width}×{res.height} · {exportFps}fps · {duration}s · ~{totalFrames} frames</div>
          {exportError && <div className="export-error">⚠ {exportError}</div>}
          <button className="export-go-btn" onClick={onExport}>⬇ Export {EXPORT_FORMATS[exportFormat].ext.toUpperCase()}</button>
        </>
      ) : (
        <div className="export-progress-area">
          <div className="export-progress-label">{exportProgress<60?'Capturing frames...':exportProgress<95?'Encoding video...':'Finalising...'}</div>
          <div className="export-progress-bar"><div className="export-progress-fill" style={{width:`${exportProgress}%`}} /></div>
          <div className="export-progress-pct">{exportProgress}%</div>
          <button className="export-cancel-btn" onClick={onCancel}>Cancel</button>
        </div>
      )}
    </div>
  );
}
