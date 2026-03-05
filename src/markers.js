import mapboxgl from 'mapbox-gl';

// id -> { marker, element }
const instances = new Map();

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildElement(poi) {
  const el = document.createElement('div');
  el.className = 'poi-marker';
  el.style.backgroundColor = poi.color;

  const icon = document.createElement('span');
  icon.className = 'poi-marker-icon';
  icon.textContent = poi.icon || '📍';
  el.appendChild(icon);

  const tooltip = document.createElement('div');
  tooltip.className = 'poi-tooltip';
  tooltip.innerHTML = `
    <div class="poi-tooltip-title">${escapeHtml(poi.title || 'Untitled')}</div>
    ${poi.description ? `<div class="poi-tooltip-desc">${escapeHtml(poi.description)}</div>` : ''}
  `;
  el.appendChild(tooltip);

  // Elevate z-index on hover so tooltip renders above sibling markers
  el.addEventListener('mouseenter', () => {
    if (el.parentElement) el.parentElement.style.zIndex = '100';
  });
  el.addEventListener('mouseleave', () => {
    if (el.parentElement) el.parentElement.style.zIndex = '';
  });

  return el;
}

export function addMarker(map, poi, onEdit) {
  const el = buildElement(poi);

  el.addEventListener('click', (e) => {
    e.stopPropagation();
    onEdit(poi.id);
  });

  const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
    .setLngLat(poi.coordinates)
    .addTo(map);

  instances.set(poi.id, { marker, element: el });
  return marker;
}

export function removeMarker(id) {
  const inst = instances.get(id);
  if (inst) {
    inst.marker.remove();
    instances.delete(id);
  }
}

export function updateMarker(map, poi, onEdit) {
  removeMarker(poi.id);
  addMarker(map, poi, onEdit);
}

export function renderAllMarkers(map, pois, onEdit) {
  instances.forEach(({ marker }) => marker.remove());
  instances.clear();
  pois.forEach((poi) => addMarker(map, poi, onEdit));
}
