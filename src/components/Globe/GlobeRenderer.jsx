import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import './GlobeRenderer.css';

const R = 1;
const GEOJSON_URL = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';

function createStarfield() {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(6000 * 3);
  for (let i = 0; i < pos.length; i++) pos[i] = (Math.random() - 0.5) * 400;
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.15 }));
}

function createAtmosphere(color) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.15, 64, 64),
    new THREE.MeshPhongMaterial({ color: new THREE.Color(color), side: THREE.BackSide, transparent: true, opacity: 0.15 })
  );
}

function latLngToVec3(lat, lng, r = R) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

function pointInPolygon([x, y], polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i], [xj, yj] = polygon[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export default function GlobeRenderer({ skin, selectedCountries, highlightedCountries, onCountryClick, autoRotate, onRendererReady, onCameraChange, cameraOverride }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const globeRef = useRef(null);
  const countryMeshesRef = useRef(new Map());
  const countryFeaturesRef = useRef([]);
  const frameRef = useRef(null);
  const mouseRef = useRef({ isDown: false, lastX: 0, lastY: 0, moved: false });
  const atmRef = useRef(null);
  const starsRef = useRef(null);
  const texLoaderRef = useRef(new THREE.TextureLoader());

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.z = 2.8;
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dl = new THREE.DirectionalLight(0xffffff, 0.8);
    dl.position.set(5, 3, 5); scene.add(dl);
    const group = new THREE.Group(); scene.add(group); globeRef.current = group;
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 64), new THREE.MeshPhongMaterial({ color: 0x1a3a5c }));
    sphere.userData.isGlobe = true; group.add(sphere); group.userData.sphere = sphere;
    const handleResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', handleResize);
    const animate = () => { frameRef.current = requestAnimationFrame(animate); renderer.render(scene, camera); };
    animate();
    if (onRendererReady) onRendererReady({ renderer, scene, camera, globe: group });
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  // Load GeoJSON once
  useEffect(() => {
    fetch(GEOJSON_URL).then(r => r.json()).then(geo => {
      countryFeaturesRef.current = geo.features;
      rebuildCountries();
    }).catch(console.error);
  }, []);

  const rebuildCountries = useCallback(() => {
    if (!globeRef.current || !skin) return;
    const globe = globeRef.current;
    countryMeshesRef.current.forEach(({ borders, fill }) => {
      if (borders) globe.remove(borders);
      if (fill) globe.remove(fill);
    });
    countryMeshesRef.current.clear();
    countryFeaturesRef.current.forEach(feature => {
      const id = feature.properties.ISO_A3 || feature.properties.name;
      const isHighlighted = highlightedCountries?.has(id);
      const isSelected = selectedCountries?.has(id);
      const polys = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
      const borderGroup = new THREE.Group();
      polys.forEach(poly => poly.forEach(ring => {
        const pts = ring.map(([lng, lat]) => latLngToVec3(lat, lng, R * 1.001));
        borderGroup.add(new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(pts),
          new THREE.LineBasicMaterial({ color: new THREE.Color(skin.countryBorder) })
        ));
      }));
      borderGroup.userData.countryId = id;
      globe.add(borderGroup);
      let fill = null;
      if (isHighlighted || isSelected) {
        const color = isHighlighted ? (highlightedCountries.get(id) || '#ff6600') : '#ff6600';
        fill = new THREE.Group();
        polys.forEach(poly => {
          const ring = poly[0];
          const pts = ring.map(([lng, lat]) => latLngToVec3(lat, lng, R * 1.0005));
          const centroid = pts.reduce((a, p) => a.add(p), new THREE.Vector3()).divideScalar(pts.length).normalize().multiplyScalar(R * 1.0005);
          const verts = [];
          for (let i = 0; i < pts.length - 1; i++) verts.push(...centroid.toArray(), ...pts[i].toArray(), ...pts[i+1].toArray());
          const geo = new THREE.BufferGeometry();
          geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
          fill.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color(color), transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false })));
        });
        globe.add(fill);
      }
      countryMeshesRef.current.set(id, { borders: borderGroup, fill, feature });
    });
  }, [skin, selectedCountries, highlightedCountries]);

  useEffect(() => { if (countryFeaturesRef.current.length > 0) rebuildCountries(); }, [rebuildCountries]);

  // Skin
  useEffect(() => {
    if (!globeRef.current || !skin || !sceneRef.current) return;
    const sphere = globeRef.current.userData.sphere;
    sceneRef.current.background = new THREE.Color(skin.background || '#000011');
    if (skin.textureUrl) {
      texLoaderRef.current.load(skin.textureUrl, tex => { sphere.material.map = tex; sphere.material.color.set(0xffffff); sphere.material.needsUpdate = true; });
    } else { sphere.material.map = null; sphere.material.color.set(new THREE.Color(skin.globeColor)); sphere.material.needsUpdate = true; }
    sphere.material.wireframe = !!skin.wireframe;
    if (atmRef.current) sceneRef.current.remove(atmRef.current);
    if (skin.atmosphere) { const a = createAtmosphere(skin.atmosphereColor); sceneRef.current.add(a); atmRef.current = a; }
    if (starsRef.current) sceneRef.current.remove(starsRef.current);
    if (skin.starfield) { const s = createStarfield(); sceneRef.current.add(s); starsRef.current = s; }
  }, [skin]);

  // Auto-rotate
  useEffect(() => {
    let id;
    const rotate = () => {
      if (autoRotate && globeRef.current && !mouseRef.current.isDown) globeRef.current.rotation.y += 0.002;
      id = requestAnimationFrame(rotate);
    };
    id = requestAnimationFrame(rotate);
    return () => cancelAnimationFrame(id);
  }, [autoRotate]);

  // Camera override
  useEffect(() => {
    if (!cameraOverride || !globeRef.current || !cameraRef.current) return;
    globeRef.current.rotation.x = cameraOverride.rotX;
    globeRef.current.rotation.y = cameraOverride.rotY;
    cameraRef.current.position.z = cameraOverride.zoom;
  }, [cameraOverride]);

  const onMouseDown = useCallback((e) => {
    mouseRef.current = { isDown: true, lastX: e.clientX, lastY: e.clientY, moved: false };
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!mouseRef.current.isDown || !globeRef.current) return;
    const dx = e.clientX - mouseRef.current.lastX, dy = e.clientY - mouseRef.current.lastY;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) mouseRef.current.moved = true;
    globeRef.current.rotation.y += dx * 0.005;
    globeRef.current.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, globeRef.current.rotation.x + dy * 0.005));
    mouseRef.current.lastX = e.clientX; mouseRef.current.lastY = e.clientY;
    if (onCameraChange) onCameraChange({ rotX: globeRef.current.rotation.x, rotY: globeRef.current.rotation.y, zoom: cameraRef.current.position.z });
  }, [onCameraChange]);

  const onMouseUp = useCallback((e) => {
    const moved = mouseRef.current.moved;
    mouseRef.current.isDown = false;
    if (!moved) handleClick(e);
  }, []);

  const handleClick = useCallback((e) => {
    if (!rendererRef.current || !cameraRef.current || !globeRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(((e.clientX - rect.left) / rect.width)*2-1, -((e.clientY - rect.top) / rect.height)*2+1);
    const ray = new THREE.Raycaster(); ray.setFromCamera(mouse, cameraRef.current);
    const hits = ray.intersectObject(globeRef.current.userData.sphere, false);
    if (!hits.length) return;
    const n = hits[0].point.clone().normalize();
    const lat = 90 - Math.acos(n.y) * (180/Math.PI);
    const lng = Math.atan2(n.z, -n.x) * (180/Math.PI) - 180;
    let found = null;
    for (const feature of countryFeaturesRef.current) {
      const polys = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
      for (const poly of polys) {
        if (pointInPolygon([lng, lat], poly[0])) { found = feature.properties.ISO_A3 || feature.properties.name; break; }
      }
      if (found) break;
    }
    if (found && onCountryClick) onCountryClick(found);
  }, [onCountryClick]);

  const onWheel = useCallback((e) => {
    if (!cameraRef.current) return;
    cameraRef.current.position.z = Math.max(1.5, Math.min(6, cameraRef.current.position.z + e.deltaY * 0.002));
    if (onCameraChange) onCameraChange({ rotX: globeRef.current?.rotation.x||0, rotY: globeRef.current?.rotation.y||0, zoom: cameraRef.current.position.z });
  }, [onCameraChange]);

  return (
    <div ref={mountRef} className="globe-renderer"
      onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}
      onMouseLeave={() => { mouseRef.current.isDown = false; }} onWheel={onWheel}
    />
  );
}
