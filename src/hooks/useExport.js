import { useState, useRef, useCallback } from 'react';

export const EXPORT_FORMATS = {
  mp4: { label: 'MP4 (H.264)', ext: 'mp4', mime: 'video/mp4' },
  webm: { label: 'WebM (VP9)', ext: 'webm', mime: 'video/webm' },
  gif: { label: 'GIF', ext: 'gif', mime: 'image/gif' },
};
export const EXPORT_RESOLUTIONS = {
  '720p': { width: 1280, height: 720, label: '720p HD' },
  '1080p': { width: 1920, height: 1080, label: '1080p Full HD' },
  '4k': { width: 3840, height: 2160, label: '4K UHD' },
};
export const EXPORT_FPS_OPTIONS = [24, 30, 60];

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportError, setExportError] = useState(null);
  const [exportFormat, setExportFormat] = useState('mp4');
  const [exportResolution, setExportResolution] = useState('1080p');
  const [exportFps, setExportFps] = useState(30);
  const abortRef = useRef(false);

  const exportVideo = useCallback(async ({ threeRenderer, duration, onSeek, onRenderFrame }) => {
    setIsExporting(true); setExportProgress(0); setExportError(null); abortRef.current = false;
    const { width, height } = EXPORT_RESOLUTIONS[exportResolution];
    const fps = exportFps;
    const totalFrames = Math.ceil(duration * fps);
    const frames = [];
    try {
      const origW = threeRenderer.domElement.width, origH = threeRenderer.domElement.height;
      threeRenderer.setSize(width, height);
      for (let i = 0; i < totalFrames; i++) {
        if (abortRef.current) throw new Error('Export cancelled');
        onSeek(i / fps); onRenderFrame();
        const canvas = threeRenderer.domElement;
        const off = document.createElement('canvas'); off.width = width; off.height = height;
        off.getContext('2d').drawImage(canvas, 0, 0, width, height);
        const blob = await new Promise(r => off.toBlob(r, 'image/png'));
        frames.push(new Uint8Array(await blob.arrayBuffer()));
        setExportProgress(Math.round((i/totalFrames)*60));
      }
      threeRenderer.setSize(origW, origH);
      setExportProgress(65);
      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      const { toBlobURL } = await import('@ffmpeg/util');
      const ffmpeg = new FFmpeg();
      ffmpeg.on('progress', ({ progress }) => setExportProgress(65 + Math.round(progress*30)));
      const base = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      for (let i = 0; i < frames.length; i++) await ffmpeg.writeFile(`frame${String(i).padStart(5,'0')}.png`, frames[i]);
      setExportProgress(80);
      const out = `output.${EXPORT_FORMATS[exportFormat].ext}`;
      const args = exportFormat === 'mp4'
        ? ['-framerate',String(fps),'-i','frame%05d.png','-c:v','libx264','-pix_fmt','yuv420p','-crf','23',out]
        : ['-framerate',String(fps),'-i','frame%05d.png','-c:v','libvpx-vp9','-b:v','0','-crf','30',out];
      await ffmpeg.exec(args);
      setExportProgress(95);
      const data = await ffmpeg.readFile(out);
      const url = URL.createObjectURL(new Blob([data.buffer], { type: EXPORT_FORMATS[exportFormat].mime }));
      Object.assign(document.createElement('a'), { href: url, download: `globestudio.${EXPORT_FORMATS[exportFormat].ext}` }).click();
      URL.revokeObjectURL(url);
      setExportProgress(100);
    } catch (err) { setExportError(err.message); } finally { setIsExporting(false); }
  }, [exportFormat, exportResolution, exportFps]);

  const cancelExport = useCallback(() => { abortRef.current = true; }, []);

  return { isExporting, exportProgress, exportError, exportFormat, setExportFormat, exportResolution, setExportResolution, exportFps, setExportFps, exportVideo, cancelExport };
}
