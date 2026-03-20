import { useRef } from 'react';
import './AudioPanel.css';

export default function AudioPanel({ audioFile, waveformData, isMuted, volume, onVolumeChange, onMuteToggle, onLoadAudio, onRemoveAudio, duration }) {
  const fileInputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) onLoadAudio(file);
  };

  return (
    <div className="audio-panel">
      <div className="audio-section">
        <div className="audio-section-title">🎵 AUDIO TRACK</div>

        {!audioFile ? (
          <div className="audio-upload-area" onClick={() => fileInputRef.current?.click()}>
            <div className="audio-upload-icon">🎵</div>
            <div className="audio-upload-text">Click to upload audio</div>
            <div className="audio-upload-hint">MP3, WAV, AAC supported</div>
            <input ref={fileInputRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={handleFile} />
          </div>
        ) : (
          <>
            <div className="audio-file-info">
              <span className="audio-file-icon">🎵</span>
              <div className="audio-file-details">
                <div className="audio-file-name">{audioFile.name}</div>
                <div className="audio-file-dur">{audioFile.duration.toFixed(1)}s</div>
              </div>
              <button className="audio-remove-btn" onClick={onRemoveAudio} title="Remove audio">×</button>
            </div>

            <div className="audio-controls">
              <button className={`audio-mute-btn ${isMuted ? 'muted' : ''}`} onClick={onMuteToggle} title={isMuted ? 'Unmute' : 'Mute'}>
                {isMuted ? '🔇' : '🔊'}
              </button>
              <input type="range" min={0} max={1} step={0.05} value={volume} onChange={e => onVolumeChange(parseFloat(e.target.value))} className="audio-volume-slider" />
              <span className="audio-vol-pct">{Math.round(volume * 100)}%</span>
            </div>
          </>
        )}
      </div>

      {waveformData.length > 0 && (
        <div className="audio-section">
          <div className="audio-section-title">WAVEFORM</div>
          <div className="audio-waveform">
            {waveformData.map((v, i) => (
              <div key={i} className="waveform-bar" style={{ height: `${Math.max(2, v * 100)}%` }} />
            ))}
          </div>
          <div className="audio-waveform-hint">Waveform synced to timeline · {audioFile?.duration.toFixed(1)}s</div>
        </div>
      )}

      <div className="audio-section audio-section-info">
        <div className="audio-section-title">NOTES</div>
        <div className="audio-notes">
          <div className="audio-note">🎬 Audio is embedded in exported MP4/WebM</div>
          <div className="audio-note">⏱ Playback syncs with timeline scrub</div>
          <div className="audio-note">🔇 Mute during authoring, unmute for export</div>
        </div>
      </div>
    </div>
  );
}
