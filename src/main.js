import './style.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { initMap } from './map.js';
import { initModal, openModal } from './modal.js';
import { loadPOIs, savePOIs, generateId } from './store.js';
import { addMarker, removeMarker, updateMarker } from './markers.js';

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

if (!TOKEN) {
  document.querySelector('#app').innerHTML = `
    <div class="token-error">
      <h2>Mapbox token missing</h2>
      <p>Create a <code>.env</code> file in the project root with:</p>
      <pre>VITE_MAPBOX_TOKEN=your_token_here</pre>
      <p>Get a free token at <a href="https://account.mapbox.com" target="_blank">mapbox.com</a></p>
    </div>
  `;
  throw new Error('VITE_MAPBOX_TOKEN is not set');
}

document.querySelector('#app').innerHTML = `
  <div id="map"></div>
  <div class="map-hint">Click anywhere on the map to add a point of interest</div>
`;

initModal();

const map = initMap(TOKEN);
let pois = loadPOIs();

function onEdit(id) {
  const poi = pois.find((p) => p.id === id);
  if (!poi) return;

  openModal({
    title: poi.title,
    description: poi.description,
    icon: poi.icon,
    color: poi.color,
    editMode: true,
  }).then((result) => {
    if (result.action === 'save') {
      Object.assign(poi, {
        title: result.title,
        description: result.description,
        icon: result.icon,
        color: result.color,
      });
      savePOIs(pois);
      updateMarker(map, poi, onEdit);
    } else if (result.action === 'delete') {
      pois = pois.filter((p) => p.id !== id);
      savePOIs(pois);
      removeMarker(id);
    }
  });
}

map.on('load', () => {
  pois.forEach((poi) => addMarker(map, poi, onEdit));

  map.on('click', (e) => {
    // Ignore clicks on markers (they stop propagation)
    const coordinates = [e.lngLat.lng, e.lngLat.lat];

    openModal().then((result) => {
      if (result.action !== 'save') return;

      const poi = {
        id: generateId(),
        coordinates,
        title: result.title,
        description: result.description,
        icon: result.icon,
        color: result.color,
      };

      pois.push(poi);
      savePOIs(pois);
      addMarker(map, poi, onEdit);
    });
  });
});
