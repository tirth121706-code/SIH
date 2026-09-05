/* =========================================================
   ABHAYA — Dashboard interactivity
   Pure vanilla JS, no dependencies / no build step.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1. Sidebar navigation (view switching) ---------- */
  const navItems = document.querySelectorAll('.nav-item');
  const views = document.querySelectorAll('.view');
  const titleEl = document.getElementById('view-title');
  const subtitleEl = document.getElementById('view-subtitle');

  const viewMeta = {
    dashboard:   { title: 'Command Dashboard',      sub: 'Overview of hazard exposure and habitation vulnerability across monitored districts' },
    map:         { title: 'Hazard Map',             sub: 'Geo-visualisation of hazard-prone zones and habitation exposure' },
    habitations: { title: 'Habitations',             sub: 'Registry of monitored settlements and carrying-capacity status' },
    relocation:  { title: 'Relocation Priority',     sub: 'Ranked list of habitations recommended for planned relocation' },
    about:       { title: 'How Scoring Works',       sub: 'A plain-language walkthrough of the risk and vulnerability model' },
  };

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const target = item.dataset.view;

      navItems.forEach(n => n.classList.remove('is-active'));
      item.classList.add('is-active');

      views.forEach(v => v.classList.remove('is-active'));
      document.getElementById(`view-${target}`).classList.add('is-active');

      if (viewMeta[target]) {
        titleEl.textContent = viewMeta[target].title;
        subtitleEl.textContent = viewMeta[target].sub;
      }
    });
  });

  /* ---------- 2. Risk register table filters ---------- */
  const hazardFilter = document.getElementById('hazardFilter');
  const riskFilter = document.getElementById('riskFilter');
  const tableRows = document.querySelectorAll('#riskTable tbody tr');

  function applyFilters() {
    const hazardVal = hazardFilter.value;
    const riskVal = riskFilter.value;

    tableRows.forEach(row => {
      const matchesHazard = hazardVal === 'all' || row.dataset.hazard === hazardVal;
      const matchesRisk = riskVal === 'all' || row.dataset.risk === riskVal;
      row.classList.toggle('is-hidden', !(matchesHazard && matchesRisk));
    });
  }

  if (hazardFilter && riskFilter) {
    hazardFilter.addEventListener('change', applyFilters);
    riskFilter.addEventListener('change', applyFilters);
  }

  /* ---------- 3. Search box (filters risk table by habitation/district) ---------- */
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      tableRows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const matchesSearch = q === '' || text.includes(q);
        row.style.display = matchesSearch ? '' : 'none';
      });
    });
  }

  /* ---------- 4. Real India map (Leaflet + OpenStreetMap/CARTO tiles) ---------- */

  // Habitations with real, approximate coordinates spread across India,
  // matching each one's hazard type (riverside / hillside / coastal).
  const HABITATIONS = [
    { name: 'Kotla Basti',      district: 'Riverside (Delhi–Yamuna)', hazard: 'Flood',         risk: 4, lat: 28.6139, lng: 77.2610 },
    { name: 'Chandpur Colony',  district: 'Riverside (Patna–Ganga)',  hazard: 'River Erosion',  risk: 4, lat: 25.5941, lng: 85.1376 },
    { name: 'Rampur Nagar',     district: 'Hillside (Chamoli, UK)',   hazard: 'Landslide',      risk: 3, lat: 30.4000, lng: 79.3200 },
    { name: 'Gopalpur',         district: 'Coastal (Odisha)',         hazard: 'Cyclone',        risk: 3, lat: 19.2647, lng: 84.9006 },
    { name: 'Sundarban Ghat',   district: 'Riverside (Sundarbans, WB)', hazard: 'Flood',        risk: 2, lat: 21.9497, lng: 88.9468 },
    { name: 'Vasant Vihar',     district: 'Coastal (Goa)',            hazard: 'Cyclone',        risk: 1, lat: 15.2993, lng: 73.9382 },
  ];

  const RISK_LABEL = { 1: 'Low', 2: 'Moderate', 3: 'High', 4: 'Critical' };
  const INDIA_CENTER = [22.9734, 78.6569];

  function buildMarkers(map) {
    const markers = [];
    HABITATIONS.forEach(h => {
      const icon = L.divIcon({
        className: '',
        html: `<div class="risk-pin risk-pin-${h.risk}" style="width:16px;height:16px;"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      const marker = L.marker([h.lat, h.lng], { icon }).addTo(map);
      marker.bindTooltip(`${h.name} — ${RISK_LABEL[h.risk]} risk`, {
        className: 'abhaya-tooltip',
        direction: 'top',
        offset: [0, -10],
      });
      markers.push(marker);
    });
    return markers;
  }

  function addBaseTiles(map) {
    // CARTO's "Positron" basemap — a light, near-grayscale style that keeps
    // the whole dashboard monochrome; a CSS grayscale filter (see style.css)
    // removes the last trace of colour from labels/water.
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);
  }

  let compactMap = null;
  let fullMap = null;

  const compactEl = document.getElementById('mapCompact');
  if (compactEl && window.L) {
    compactMap = L.map('mapCompact', {
      zoomControl: false,
      scrollWheelZoom: false,
      attributionControl: true,
    }).setView(INDIA_CENTER, 4);
    addBaseTiles(compactMap);
    buildMarkers(compactMap);
  }

  // The full map view lives inside a hidden tab on page load, so Leaflet
  // is only initialised (and resized) the first time that tab is opened.
  function ensureFullMap() {
    if (fullMap || !window.L) return;
    fullMap = L.map('mapFull', { zoomControl: true, scrollWheelZoom: true })
      .setView(INDIA_CENTER, 4.3);
    addBaseTiles(fullMap);
    buildMarkers(fullMap);
    setTimeout(() => fullMap.invalidateSize(), 50);
  }

  navItems.forEach(item => {
    if (item.dataset.view === 'map') {
      item.addEventListener('click', ensureFullMap);
    }
  });

});
