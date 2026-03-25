import circle from '@turf/circle';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

const AREAS_KEY = 'milan-areas';

// ─── Circle buffers (Turf.js) ───────────────────────────────

export function initCircleLayers(map) {
  map.addSource('poi-circles', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  });

  map.addLayer({
    id: 'poi-circles-fill',
    type: 'fill',
    source: 'poi-circles',
    paint: {
      'fill-color': ['get', 'color'],
      'fill-opacity': 0.1,
    },
  });

  map.addLayer({
    id: 'poi-circles-outline',
    type: 'line',
    source: 'poi-circles',
    paint: {
      'line-color': ['get', 'color'],
      'line-width': 2,
      'line-dasharray': [4, 3],
    },
  });
}

export function updateCircles(map, pois) {
  const features = pois
    .filter((p) => p.radius > 0)
    .map((p) =>
      circle(p.coordinates, p.radius, {
        units: 'kilometers',
        properties: { color: p.color },
      })
    );

  map.getSource('poi-circles').setData({
    type: 'FeatureCollection',
    features,
  });
}

// ─── Drawn areas (Mapbox GL Draw) ───────────────────────────

function loadAreas() {
  try {
    return JSON.parse(localStorage.getItem(AREAS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveAreas(features) {
  localStorage.setItem(AREAS_KEY, JSON.stringify(features));
}

export function initDrawControl(map) {
  const draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: { polygon: true, trash: true },
    styles: [
      // Filled polygon (active + inactive)
      {
        id: 'gl-draw-polygon-fill',
        type: 'fill',
        filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
        paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.15 },
      },
      {
        id: 'gl-draw-polygon-fill-static',
        type: 'fill',
        filter: ['all', ['==', '$type', 'Polygon'], ['==', 'mode', 'static']],
        paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.12 },
      },
      // Polygon outline
      {
        id: 'gl-draw-polygon-stroke',
        type: 'line',
        filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
        paint: { 'line-color': '#3b82f6', 'line-width': 2.5 },
      },
      {
        id: 'gl-draw-polygon-stroke-static',
        type: 'line',
        filter: ['all', ['==', '$type', 'Polygon'], ['==', 'mode', 'static']],
        paint: { 'line-color': '#3b82f6', 'line-width': 2, 'line-dasharray': [3, 2] },
      },
      // Vertex points while drawing
      {
        id: 'gl-draw-polygon-midpoint',
        type: 'circle',
        filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
        paint: { 'circle-radius': 4, 'circle-color': '#3b82f6' },
      },
      {
        id: 'gl-draw-vertex',
        type: 'circle',
        filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'vertex']],
        paint: { 'circle-radius': 5, 'circle-color': '#fff', 'circle-stroke-color': '#3b82f6', 'circle-stroke-width': 2 },
      },
    ],
  });

  map.addControl(draw, 'top-left');

  // Restore previously saved areas
  const saved = loadAreas();
  if (saved.length) {
    draw.add({ type: 'FeatureCollection', features: saved });
  }

  function persist() {
    saveAreas(draw.getAll().features);
  }

  map.on('draw.create', persist);
  map.on('draw.update', persist);
  map.on('draw.delete', persist);

  return draw;
}
