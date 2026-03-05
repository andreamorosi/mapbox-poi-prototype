import mapboxgl from 'mapbox-gl';

const MILAN_CENTER = [9.19, 45.4641];

// Bounds encompassing Milan municipality + buffer
const MILAN_BOUNDS = [
  [8.98, 45.35], // SW
  [9.36, 45.58], // NE
];

export function initMap(token) {
  mapboxgl.accessToken = token;

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: MILAN_CENTER,
    zoom: 12,
    minZoom: 10.5,
    maxZoom: 18,
    maxBounds: MILAN_BOUNDS,
  });

  map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
  map.getCanvas().style.cursor = 'crosshair';

  return map;
}
