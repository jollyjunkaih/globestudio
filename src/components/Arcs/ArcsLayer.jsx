import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const GLOBE_R = 1;

function latLngToVec3(lat, lng, r = GLOBE_R) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

// Build a geodesic arc curve between two lat/lng points
function buildArcCurve(fromLat, fromLng, toLat, toLng, segments = 60) {
  const start = latLngToVec3(fromLat, fromLng);
  const end = latLngToVec3(toLat, toLng);
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    // Slerp between the two vectors for geodesic path
    const p = new THREE.Vector3().copy(start).lerp(end, t).normalize();
    // Lift the arc above the surface (more in the middle)
    const lift = 1 + 0.4 * Math.sin(Math.PI * t);
    p.multiplyScalar(lift);
    points.push(p);
  }
  return points;
}

function createArcLine(arc, time) {
  const points = buildArcCurve(arc.fromLat, arc.fromLng, arc.toLat, arc.toLng);
  const color = new THREE.Color(arc.color || '#64b4ff');
  const group = new THREE.Group();
  group.userData.arcId = arc.id;

  if (arc.style === 'arc') {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color, linewidth: arc.width || 1.5, transparent: true, opacity: arc.glow ? 0.85 : 1 });
    group.add(new THREE.Line(geo, mat));
    if (arc.glow) {
      const glowMat = new THREE.LineBasicMaterial({ color, linewidth: (arc.width || 1.5) * 3, transparent: true, opacity: 0.15 });
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), glowMat));
    }
  }

  else if (arc.style === 'dashed') {
    // Draw dashed by skipping every other segment
    const dashLen = 5;
    for (let i = 0; i < points.length - dashLen; i += dashLen * 2) {
      const seg = points.slice(i, i + dashLen);
      if (seg.length < 2) continue;
      const geo = new THREE.BufferGeometry().setFromPoints(seg);
      group.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 })));
    }
  }

  else if (arc.style === 'flow') {
    // Static arc + animated "flow dot" along the arc
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    group.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.3 })));

    // Flow dots — place several along the path offset by time
    const numDots = 5;
    for (let d = 0; d < numDots; d++) {
      const t = ((time * (arc.speed || 1) * 0.3 + d / numDots) % 1 + 1) % 1;
      const idx = Math.floor(t * (points.length - 1));
      const pt = points[idx];
      if (!pt) continue;
      const dotGeo = new THREE.SphereGeometry(0.012, 8, 8);
      const dotMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 - d / numDots });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(pt);
      group.add(dot);
    }
  }

  else if (arc.style === 'pulse') {
    // Pulsing arc — opacity oscillates
    const opacity = 0.5 + 0.5 * Math.sin(time * (arc.speed || 1) * 3);
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    group.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity })));
    // Ripple dot at origin
    const scale = 1 + 0.5 * Math.sin(time * (arc.speed || 1) * 3);
    const rippleGeo = new THREE.SphereGeometry(0.025 * scale, 8, 8);
    const rippleMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 });
    const ripple = new THREE.Mesh(rippleGeo, rippleMat);
    ripple.position.copy(points[0]);
    group.add(ripple);
  }

  return group;
}

export default function ArcsLayer({ arcs, globeGroup }) {
  const arcGroupsRef = useRef(new Map()); // arcId -> THREE.Group
  const timeRef = useRef(0);
  const frameRef = useRef(null);

  // Animation loop — rebuild animated arcs each frame
  useEffect(() => {
    if (!globeGroup) return;
    const animate = () => {
      timeRef.current += 0.016;
      rebuildArcs(timeRef.current);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [arcs, globeGroup]);

  const rebuildArcs = (time) => {
    if (!globeGroup) return;

    // Remove old arc groups
    arcGroupsRef.current.forEach((group) => globeGroup.remove(group));
    arcGroupsRef.current.clear();

    // Rebuild
    arcs.forEach(arc => {
      const group = createArcLine(arc, time);
      globeGroup.add(group);
      arcGroupsRef.current.set(arc.id, group);

      // Bidirectional — reverse arc
      if (arc.bidirectional) {
        const revArc = { ...arc, id: arc.id + '_rev', fromLat: arc.toLat, fromLng: arc.toLng, toLat: arc.fromLat, toLng: arc.fromLng };
        const revGroup = createArcLine(revArc, time + 0.5);
        revGroup.userData.arcId = arc.id + '_rev';
        globeGroup.add(revGroup);
        arcGroupsRef.current.set(arc.id + '_rev', revGroup);
      }
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (globeGroup) arcGroupsRef.current.forEach(g => globeGroup.remove(g));
    };
  }, [globeGroup]);

  return null;
}
