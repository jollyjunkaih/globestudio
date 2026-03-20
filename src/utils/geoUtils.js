export function latLngToVector3(lat, lng, radius = 1) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return {
    x: -(radius * Math.sin(phi) * Math.cos(theta)),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  };
}
export function getFeatureCentroid(feature) {
  let lngs = [], lats = [];
  if (feature.geometry.type === 'Polygon') {
    feature.geometry.coordinates[0].forEach(c => { lngs.push(c[0]); lats.push(c[1]); });
  } else if (feature.geometry.type === 'MultiPolygon') {
    feature.geometry.coordinates.forEach(poly => poly[0].forEach(c => { lngs.push(c[0]); lats.push(c[1]); }));
  }
  return {
    lng: lngs.reduce((a,b) => a+b, 0) / lngs.length,
    lat: lats.reduce((a,b) => a+b, 0) / lats.length,
  };
}
