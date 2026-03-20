import { useCallback, useRef, useState } from 'react';
import GlobeRenderer from './components/Globe/GlobeRenderer';
import Toolbar from './components/UI/Toolbar';
import SkinBar from './components/UI/SkinBar';
import PropertiesPanel from './components/UI/PropertiesPanel';
import TimelineEditor from './components/Timeline/TimelineEditor';
import CameraControls from './components/Camera/CameraControls';
import ExportPanel from './components/Export/ExportPanel';
import { useGlobe } from './hooks/useGlobe';
import { useTimeline } from './hooks/useTimeline';
import { useCameraKeyframes } from './hooks/useCameraKeyframes';
import { useExport } from './hooks/useExport';
import './App.css';

export default function App() {
  const { activeSkin, setActiveSkin, currentSkin, selectedCountries, selectCountry, highlightedCountries, highlightCountry, clearHighlights, autoRotate, setAutoRotate } = useGlobe();
  const { tracks, duration, setDuration, currentTime, setCurrentTime, isPlaying, togglePlayPause, addTrack, removeTrack, updateTrack } = useTimeline();
  const { keyframes, easing, setEasing, recordKeyframe, removeKeyframe, clearKeyframes, getCameraAtTime } = useCameraKeyframes();
  const { isExporting, exportProgress, exportError, exportFormat, setExportFormat, exportResolution, setExportResolution, exportFps, setExportFps, exportVideo, cancelExport } = useExport();
  const threeRef = useRef(null);
  const [currentCameraState, setCurrentCameraState] = useState({ rotX: 0, rotY: 0, zoom: 2.8 });
  const [rightTab, setRightTab] = useState('properties');

  const handleRendererReady = useCallback((obj) => { threeRef.current = obj; }, []);
  const handleCameraChange = useCallback((state) => setCurrentCameraState(state), []);
  const cameraOverride = isPlaying && keyframes.length > 0 ? getCameraAtTime(currentTime) : null;

  const handleExport = useCallback(() => {
    if (!threeRef.current) return;
    const { renderer, scene, camera } = threeRef.current;
    exportVideo({
      threeRenderer: renderer, duration,
      onSeek: (time) => {
        setCurrentTime(time);
        const s = getCameraAtTime(time);
        if (s && threeRef.current) { threeRef.current.globe.rotation.x = s.rotX; threeRef.current.globe.rotation.y = s.rotY; camera.position.z = s.zoom; }
      },
      onRenderFrame: () => { if (threeRef.current) renderer.render(scene, camera); },
    });
  }, [exportVideo, duration, getCameraAtTime, setCurrentTime]);

  return (
    <div className="app">
      <Toolbar autoRotate={autoRotate} onToggleAutoRotate={() => setAutoRotate(r => !r)} onClearHighlights={clearHighlights} onExportClick={() => setRightTab('export')} />
      <div className="app-body">
        <div className="app-viewport">
          <GlobeRenderer skin={currentSkin} selectedCountries={selectedCountries} highlightedCountries={highlightedCountries} onCountryClick={selectCountry} autoRotate={autoRotate && !isPlaying} onRendererReady={handleRendererReady} onCameraChange={handleCameraChange} cameraOverride={cameraOverride} />
          <SkinBar activeSkin={activeSkin} onSkinChange={setActiveSkin} />
        </div>
        <div className="right-panel">
          <div className="right-panel-tabs">
            <button className={`rpanel-tab ${rightTab==='properties'?'active':''}`} onClick={() => setRightTab('properties')}>Properties</button>
            <button className={`rpanel-tab ${rightTab==='camera'?'active':''}`} onClick={() => setRightTab('camera')}>Camera</button>
            <button className={`rpanel-tab ${rightTab==='export'?'active':''}`} onClick={() => setRightTab('export')}>Export</button>
          </div>
          <div className="right-panel-content">
            {rightTab === 'properties' && <PropertiesPanel selectedCountries={selectedCountries} highlightedCountries={highlightedCountries} onHighlightCountry={highlightCountry} onClearHighlights={clearHighlights} />}
            {rightTab === 'camera' && <CameraControls keyframes={keyframes} currentTime={currentTime} easing={easing} onSetEasing={setEasing} onRecordKeyframe={recordKeyframe} onRemoveKeyframe={removeKeyframe} onClearKeyframes={clearKeyframes} currentCameraState={currentCameraState} />}
            {rightTab === 'export' && <ExportPanel isExporting={isExporting} exportProgress={exportProgress} exportError={exportError} exportFormat={exportFormat} exportResolution={exportResolution} exportFps={exportFps} onFormatChange={setExportFormat} onResolutionChange={setExportResolution} onFpsChange={setExportFps} onExport={handleExport} onCancel={cancelExport} duration={duration} />}
          </div>
        </div>
      </div>
      <TimelineEditor tracks={tracks} duration={duration} currentTime={currentTime} isPlaying={isPlaying} onTimeChange={setCurrentTime} onPlayPause={togglePlayPause} onTrackUpdate={updateTrack} onAddTrack={addTrack} onRemoveTrack={removeTrack} onDurationChange={setDuration} />
    </div>
  );
}
