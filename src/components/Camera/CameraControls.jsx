import './CameraControls.css';
import { EASING } from '../../hooks/useCameraKeyframes';
export default function CameraControls({ keyframes, currentTime, easing, onSetEasing, onRecordKeyframe, onRemoveKeyframe, onClearKeyframes, currentCameraState }) {
  const nearby = keyframes.find(kf => Math.abs(kf.time - currentTime) < 0.1);
  return (
    <div className="camera-controls">
      <div className="camera-header">
        <span className="camera-title">🎥 Camera Keyframes</span>
        <span className="camera-count">{keyframes.length} keyframe{keyframes.length!==1?'s':''}</span>
      </div>
      <div className="camera-actions">
        <button className={`cam-btn cam-btn-record ${nearby?'overwrite':''}`} onClick={() => onRecordKeyframe(currentTime, currentCameraState)}>
          {nearby?'⟳ Overwrite':'⏺ Record'} @ {currentTime.toFixed(1)}s
        </button>
        {nearby && <button className="cam-btn cam-btn-remove" onClick={() => onRemoveKeyframe(currentTime)}>🗑 Remove</button>}
      </div>
      <div className="camera-easing">
        <label className="cam-label">Easing</label>
        <div className="easing-options">
          {Object.keys(EASING).map(e => (
            <button key={e} className={`easing-btn ${easing===e?'active':''}`} onClick={() => onSetEasing(e)}>
              {e==='linear'?'↗':e==='easeInOut'?'⌒':'✦'} {e}
            </button>
          ))}
        </div>
      </div>
      {keyframes.length > 0 ? (
        <div className="camera-keyframe-list">
          {keyframes.map(kf => (
            <div key={kf.time} className={`kf-item ${Math.abs(kf.time-currentTime)<0.1?'active':''}`}>
              <span className="kf-diamond">◆</span>
              <span className="kf-time">{kf.time.toFixed(1)}s</span>
              <span className="kf-info">zoom {kf.zoom?.toFixed(1)}</span>
              <button className="kf-remove" onClick={() => onRemoveKeyframe(kf.time)}>×</button>
            </div>
          ))}
          <button className="cam-btn cam-btn-clear" onClick={onClearKeyframes}>Clear All</button>
        </div>
      ) : (
        <div className="camera-hint">Drag the globe to a position, then click ⏺ Record to save a keyframe.</div>
      )}
    </div>
  );
}
