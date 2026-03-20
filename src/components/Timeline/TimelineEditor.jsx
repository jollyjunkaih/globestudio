import { useRef, useCallback } from 'react';
import './TimelineEditor.css';

function fmt(s) { return `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toFixed(1).padStart(4,'0')}`; }

export default function TimelineEditor({ tracks, duration, currentTime, isPlaying, onTimeChange, onPlayPause, onTrackUpdate, onAddTrack, onRemoveTrack, onDurationChange }) {
  const rulerRef = useRef(null);
  const dragRef = useRef(null);

  const t2p = useCallback((t) => (t/duration)*100, [duration]);
  const x2t = useCallback((x, w) => Math.max(0, Math.min(duration, (x/w)*duration)), [duration]);

  const onRulerClick = useCallback((e) => {
    const r = e.currentTarget.getBoundingClientRect();
    onTimeChange(x2t(e.clientX - r.left, r.width));
  }, [x2t, onTimeChange]);

  const onPlayheadDown = useCallback((e) => {
    e.stopPropagation();
    const mv = (ev) => { const r = rulerRef.current?.getBoundingClientRect(); if(r) onTimeChange(x2t(ev.clientX-r.left, r.width)); };
    const up = () => { window.removeEventListener('mousemove',mv); window.removeEventListener('mouseup',up); };
    window.addEventListener('mousemove',mv); window.addEventListener('mouseup',up);
  }, [x2t, onTimeChange]);

  const onBlockDown = useCallback((e, id, type) => {
    e.stopPropagation();
    const track = tracks.find(t=>t.id===id); if(!track) return;
    dragRef.current = { id, type, startX: e.clientX, origStart: track.start, origEnd: track.end };
    const mv = (ev) => {
      const d = dragRef.current; if(!d) return;
      const r = rulerRef.current?.getBoundingClientRect(); if(!r) return;
      const dt = ((ev.clientX-d.startX)/r.width)*duration;
      const len = d.origEnd - d.origStart;
      let ns = d.origStart, ne = d.origEnd;
      if(d.type==='move') { ns=Math.max(0,Math.min(duration-len,d.origStart+dt)); ne=ns+len; }
      else if(d.type==='start') { ns=Math.max(0,Math.min(d.origEnd-0.5,d.origStart+dt)); }
      else { ne=Math.max(d.origStart+0.5,Math.min(duration,d.origEnd+dt)); }
      onTrackUpdate(d.id, { start:parseFloat(ns.toFixed(2)), end:parseFloat(ne.toFixed(2)) });
    };
    const up = () => { dragRef.current=null; window.removeEventListener('mousemove',mv); window.removeEventListener('mouseup',up); };
    window.addEventListener('mousemove',mv); window.addEventListener('mouseup',up);
  }, [tracks, duration, onTrackUpdate]);

  const ticks = Array.from({length: Math.ceil(duration)+1}, (_,i)=>i);

  return (
    <div className="timeline-editor">
      <div className="timeline-transport">
        <button className="transport-btn" onClick={onPlayPause}>{isPlaying?'⏸':'▶'}</button>
        <span className="transport-time">{fmt(currentTime)}</span>
        <span className="transport-sep">/</span>
        <span className="transport-duration">{fmt(duration)}</span>
        <div className="transport-spacer" />
        <label className="transport-label">Duration</label>
        <input type="range" min={2} max={60} value={duration} onChange={e=>onDurationChange(Number(e.target.value))} className="transport-duration-slider" />
        <span className="transport-dur-val">{duration}s</span>
        <button className="transport-btn add-track-btn" onClick={onAddTrack}>+ Track</button>
      </div>
      <div className="timeline-body">
        <div className="timeline-labels">
          <div className="timeline-ruler-spacer" />
          {tracks.map(t => (
            <div key={t.id} className="track-label" style={{height:36}}>
              <span>{t.icon}</span>
              <span className="track-label-text">{t.label}</span>
              {!t.locked && <button className="track-remove-btn" onClick={()=>onRemoveTrack(t.id)}>×</button>}
            </div>
          ))}
        </div>
        <div className="timeline-tracks-area">
          <div className="timeline-ruler" ref={rulerRef} onClick={onRulerClick}>
            {ticks.map(t => (
              <div key={t} className="ruler-tick" style={{left:`${t2p(t)}%`}}>
                <div className="ruler-tick-line" /><div className="ruler-tick-label">{t}s</div>
              </div>
            ))}
            <div className="playhead" style={{left:`${t2p(currentTime)}%`}} onMouseDown={onPlayheadDown}>
              <div className="playhead-head" /><div className="playhead-line" />
            </div>
          </div>
          {tracks.map(t => (
            <div key={t.id} className="track-row" style={{height:36}}>
              <div className="track-block" style={{left:`${t2p(t.start)}%`,width:`${t2p(t.end-t.start)}%`,backgroundColor:t.color||'#3a7bd5'}}
                onMouseDown={e=>onBlockDown(e,t.id,'move')}>
                <div className="track-block-resize track-block-resize-start" onMouseDown={e=>onBlockDown(e,t.id,'start')} />
                <span className="track-block-label">{t.label}</span>
                <div className="track-block-resize track-block-resize-end" onMouseDown={e=>onBlockDown(e,t.id,'end')} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
