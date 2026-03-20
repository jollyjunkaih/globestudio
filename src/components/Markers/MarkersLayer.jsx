import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import './MarkersLayer.css';

const R = 1.015; // slightly above globe surface

function latLngToVec3(lat, lng, r = R) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

function createMarkerElement(marker) {
  const el = document.createElement('div');
  el.className = `globe-marker globe-marker--${marker.type}`;
  el.style.setProperty('--marker-color', marker.color || '#64b4ff');
  el.style.setProperty('--marker-size', `${(marker.size || 1) * 10}px`);

  if (marker.type === 'cityDot') {
    el.innerHTML = `<div class="city-dot"></div>${marker.label ? `<span class="marker-label">${marker.label}</span>` : ''}`;
  } else if (marker.type === 'textLabel') {
    el.innerHTML = `<div class="text-label">${marker.label || 'Label'}</div>`;
  } else if (marker.type === 'iconMarker') {
    el.innerHTML = `<div class="icon-marker">${marker.icon || '📍'}</div>${marker.label ? `<span class="marker-label">${marker.label}</span>` : ''}`;
  } else if (marker.type === 'dataBubble') {
    el.innerHTML = `<div class="data-bubble"><span class="data-value">${marker.value || '0'}</span><span class="data-label">${marker.label || ''}</span></div>`;
  }

  return el;
}

export default function MarkersLayer({ markers, globeGroup, camera, mountEl }) {
  const css2dRendererRef = useRef(null);
  const css2dObjectsRef = useRef(new Map());
  const sceneRef = useRef(null);

  // Init CSS2DRenderer once
  useEffect(() => {
    if (!mountEl) return;
    const renderer = new CSS2DRenderer();
    renderer.setSize(mountEl.clientWidth, mountEl.clientHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.pointerEvents = 'none';
    mountEl.appendChild(renderer.domElement);
    css2dRendererRef.current = renderer;

    const handleResize = () => renderer.setSize(mountEl.clientWidth, mountEl.clientHeight);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountEl.contains(renderer.domElement)) mountEl.removeChild(renderer.domElement);
    };
  }, [mountEl]);

  // Sync markers to CSS2D objects on globeGroup
  useEffect(() => {
    if (!globeGroup) return;
    const existing = new Set(css2dObjectsRef.current.keys());

    markers.forEach(marker => {
      if (css2dObjectsRef.current.has(marker.id)) {
        // Update position
        const obj = css2dObjectsRef.current.get(marker.id);
        const pos = latLngToVec3(marker.lat, marker.lng);
        obj.position.set(pos.x, pos.y, pos.z);
        // Rebuild element
        const el = createMarkerElement(marker);
        obj.element.replaceWith(el);
        obj.element = el;
      } else {
        // Create new
        const el = createMarkerElement(marker);
        const obj = new CSS2DObject(el);
        const pos = latLngToVec3(marker.lat, marker.lng);
        obj.position.set(pos.x, pos.y, pos.z);
        obj.userData.markerId = marker.id;
        globeGroup.add(obj);
        css2dObjectsRef.current.set(marker.id, obj);
      }
      existing.delete(marker.id);
    });

    // Remove stale markers
    existing.forEach(id => {
      const obj = css2dObjectsRef.current.get(id);
      if (obj) { globeGroup.remove(obj); obj.element?.remove(); }
      css2dObjectsRef.current.delete(id);
    });
  }, [markers, globeGroup]);

  // Render loop for CSS2DRenderer
  useEffect(() => {
    if (!css2dRendererRef.current || !camera || !globeGroup) return;
    let id;
    const render = () => {
      id = requestAnimationFrame(render);
      const scene = globeGroup?.parent;
      if (scene && css2dRendererRef.current && camera) {
        css2dRendererRef.current.render(scene, camera);
      }
    };
    render();
    return () => cancelAnimationFrame(id);
  }, [camera, globeGroup]);

  return null; // renders via CSS2DRenderer
}
