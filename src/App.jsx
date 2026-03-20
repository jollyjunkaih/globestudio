import { useCallback, useRef, useState, useEffect } from 'react';
import GlobeRenderer from './components/Globe/GlobeRenderer';
import Toolbar from './components/UI/Toolbar';
import SkinBar from './components/UI/SkinBar';
import PropertiesPanel from './components/UI/PropertiesPanel';
import TimelineEditor from './components/Timeline/TimelineEditor';
import CameraControls from './components/Camera/CameraControls';
import ExportPanel from './components/Export/ExportPanel';
import MarkersPanel from './components/Markers/MarkersPanel';
import ArcsPanel from './components/Arcs/ArcsPanel';
import AudioPanel from './components/Audio/AudioPanel';
import MarkersLayer from './components/Markers/MarkersLayer';
import ArcsLayer from './components/Arcs/ArcsLayer';
import { useGlobe } from './hooks/useGlobe';
import { useTimeline } from './hooks/useTimeline';
import { useCameraKeyframes } from './hooks/useCameraKeyframes';
import { useExport } from './hooks/useExport';
import { useMarkers } from './hooks/useMarkers';
import { useArcs } from './hooks/useArcs';
import { useAudio } from './hooks/useAudio';
import './App.css';

export default function App() {
  const { activeSkin, setActiveSkin, currentSkin, selectedCountries, selectCountry, highlightedCountries, highlightCountry, clearHighlights, autoRotate, setAutoRotate } = useGlobe();
  const { tracks, duration, setDuration, currentTime, setCurrentTime, isPlaying, togglePlayPause, addTrack, removeTrack, updateTrack } = useTimeline();
  const { keyframes, easing, setEasing, recordKeyframe, removeKeyframe, clearKeyframes, getCameraAtTime } = useCameraKeyframes();
  const { isExporting, exportProgress, exportError, exportFormat, setExportFormat, exportResolution, setExportResolution, exportFps, setExportFps, exportVideo, cancelExport } = useExport();
  const { markers, addMarker, updateMarker, removeMarker, clearMarkers } = useMarkers();
  const { arcs, addArc, updateArc, removeArc, clearArcs } = useArcs();
  const { audioFile, waveformData, isMuted, volume, setVolume, setIsMuted, loadAudio, removeAudio, syncToTime } = useAudio();

  const threeRef = useRef(null);
  const mountRef = useRef(null);
  const [currentCameraState, setCurrentCameraState] = useState({ rotX: 0, rotY: 0, zoom: 2.8 });
  const [rightTab, setRightTab] = useState('properties');

  const handleRendererReady = useCallback((obj) => {
    threeRef.current = obj;
  }, []);

  const handleCameraChange = useCallback((state) => setCurrentCameraState(state), []);
  const cameraOverride = isPlaying && keyframes.length > 0 ? getCameraAtTime(currentTime) : null;

  // Sync audio with timeline
  useEffect(() => {
    syncToTime(currentTime, isPlaying);
  }, [currentTime, isPlaying, syncToTime]);

  const handleExport = useCallback(() => {
    if (!threeRef.current) return;
    const { renderer, scene, camera } = threeRef.current;
    exportVideo({
      threeRenderer: renderer, duration,
      onSeek: (time) => {
        setCurrentTime(time);
        const s = getCameraAtTime(time);
        if (s && threeRef.current) {
          threeRef.current.globe.rotation.x = s.rotX;
          threeRef.current.globe.rotation.y = s.rotY;
          camera.position.z = s.zoom;
        }
      },
      onRenderFrame: () => { if (threeRef.current) renderer.render(scene, camera); },
    });
  }, [exportVideo, duration, getCameraAtTime, setCurrentTime]);

  // Get the mount element for CSS2DRenderer
  const [mountEl, setMountEl] = useState(null);
  const viewportRef = useCallback((el) => { if (el) setMountEl(el); }, []);

  const TABS = [
    { id: 'properties', label: 'Properties' },
    { id: 'markers', label: '📍 Markers' },
    { id: 'arcs', label: '✈️ Arcs' },
    { id: 'camera', label: '🎥 Camera' },
    { id: 'audio', label: '🎵 Audio' },
    { id: 'export', label: '⬇ Export' },
  ];

  return (
    <div className="app">
      <Toolbar autoRotate={autoRotate} onToggleAutoRotate={() => setAutoRotate(r => !r)} onClearHighlights={clearHighlights} onExportClick={() => setRightTab('export')} />
      <div className="app-body">
        <div className="app-viewport" ref={viewportRef}>
          <GlobeRenderer
            skin={currentSkin}
            selectedCountries={selectedCountries}
            highlightedCountries={highlightedCountries}
            onCountryClick={selectCountry}
            autoRotate={autoRotate && !isPlaying}
            onRendererReady={handleRendererReady}
            onCameraChange={handleCameraChange}
            cameraOverride={cameraOverride}
          />
          {threeRef.current && mountEl && (
            <>
              <MarkersLayer
                markers={markers}
                globeGroup={threeRef.current.globe}
                camera={threeRef.current.camera}
                mountEl={mountEl}
              />
              <ArcsLayer
                arcs={arcs}
                globeGroup={threeRef.current.globe}
              />
            </>
          )}
          <SkinBar activeSkin={activeSkin} onSkinChange={setActiveSkin} />
        </div>

        <div className="right-panel">
          <div className="right-panel-tabs">
            {TABS.map(t => (
              <button key={t.id} className={`rpanel-tab ${rightTab === t.id ? 'active' : ''}`} onClick={() => setRightTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="right-panel-content">
            {rightTab === 'properties' && <PropertiesPanel selectedCountries={selectedCountries} highlightedCountries={highlightedCountries} onHighlightCountry={highlightCountry} onClearHighlights={clearHighlights} />}
            {rightTab === 'markers' && <MarkersPanel markers={markers} onAddMarker={addMarker} onUpdateMarker={updateMarker} onRemoveMarker={removeMarker} onClearMarkers={clearMarkers} />}
            {rightTab === 'arcs' && <ArcsPanel arcs={arcs} onAddArc={addArc} onUpdateArc={updateArc} onRemoveArc={removeArc} onClearArcs={clearArcs} />}
            {rightTab === 'camera' && <CameraControls keyframes={keyframes} currentTime={currentTime} easing={easing} onSetEasing={setEasing} onRecordKeyframe={recordKeyframe} onRemoveKeyframe={removeKeyframe} onClearKeyframes={clearKeyframes} currentCameraState={currentCameraState} />}
            {rightTab === 'audio' && <AudioPanel audioFile={audioFile} waveformData={waveformData} isMuted={isMuted} volume={volume} onVolumeChange={setVolume} onMuteToggle={() => setIsMuted(m => !m)} onLoadAudio={loadAudio} onRemoveAudio={removeAudio} duration={duration} />}
            {rightTab === 'export' && <ExportPanel isExporting={isExporting} exportProgress={exportProgress} exportError={exportError} exportFormat={exportFormat} exportResolution={exportResolution} exportFps={exportFps} onFormatChange={setExportFormat} onResolutionChange={setExportResolution} onFpsChange={setExportFps} onExport={handleExport} onCancel={cancelExport} duration={duration} />}
          </div>
        </div>
      </div>
      <TimelineEditor tracks={tracks} duration={duration} currentTime={currentTime} isPlaying={isPlaying} onTimeChange={setCurrentTime} onPlayPause={togglePlayPause} onTrackUpdate={updateTrack} onAddTrack={addTrack} onRemoveTrack={removeTrack} onDurationChange={setDuration} />
    </div>
  );
}
