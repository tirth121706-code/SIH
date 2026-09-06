import React, { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE = 'http://localhost:5000/api/habitations';
const SOS_API = 'http://localhost:5000/api/sos';
const FACILITIES_API = 'http://localhost:5000/api/facilities';
const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjZiZDk1Y2ZiNWYwYzRmNWQ4OWU0Zjc1YWUzMGQzYTE0IiwiaCI6Im11cm11cjY0In0=';

const HABITATION_COORDS = {
  'Kotla Basti': [25.3176, 82.9739],
  'Chandpur Colony': [25.5941, 85.1376],
  'Rampur Nagar': [30.3165, 78.0322],
  'Gopalpur': [19.2600, 84.9000],
  'Sundarban Ghat': [21.9497, 88.9007],
  'Vasant Vihar': [17.6868, 83.2185]
};

const INITIAL_FACILITIES = [
  // --- 1. KOTLA BASTI (Varanasi, Uttar Pradesh) ---
  {
    id: 'fac-up-1',
    name: 'Sir Sunderlal Hospital (BHU)',
    category: 'Hospital',
    coords: [25.2750, 82.9980],
    capacity: '1,500 beds',
    medicalSupport: 'Level-1 Trauma & Critical Care Unit',
    contact: '108 / 0542-2307500',
    doctorCount: 75,
    bedsAvailable: 110
  },
  {
    id: 'fac-up-2',
    name: 'Varanasi District Flood Relief Shelter',
    category: 'Relocation Center',
    coords: [25.3280, 82.9850],
    capacity: '3,000 evacuees',
    medicalSupport: 'Community Kitchen & Relief Camp',
    contact: '1077',
    doctorCount: 5,
    bedsAvailable: 600
  },
  {
    id: 'fac-up-3',
    name: 'Chowk Urban Primary Health Centre',
    category: 'Medic Post',
    coords: [25.3120, 83.0100],
    capacity: '200 patients/day',
    medicalSupport: 'First-Aid & Epidemic Prevention',
    contact: '102',
    doctorCount: 6,
    bedsAvailable: 25
  },

  // --- 2. CHANDPUR COLONY (Patna, Bihar) ---
  {
    id: 'fac-br-1',
    name: 'PMCH Emergency Wing (Patna Medical College)',
    category: 'Hospital',
    coords: [25.6200, 85.1580],
    capacity: '2,000 beds',
    medicalSupport: 'Flood Inundation Trauma & Surgery',
    contact: '108 / 0612-2300080',
    doctorCount: 90,
    bedsAvailable: 140
  },
  {
    id: 'fac-br-2',
    name: 'Patna State Evacuation Complex (Kankarbagh)',
    category: 'Relocation Center',
    coords: [25.6020, 85.1480],
    capacity: '4,500 evacuees',
    medicalSupport: 'SDRF Relief Unit & Clean Water Station',
    contact: '1070',
    doctorCount: 8,
    bedsAvailable: 800
  },
  {
    id: 'fac-br-3',
    name: 'Rajendra Nagar Urban Health Clinic',
    category: 'Medic Post',
    coords: [25.5980, 85.1520],
    capacity: '180 patients/day',
    medicalSupport: 'ORS, Triage & First-Aid',
    contact: '102',
    doctorCount: 5,
    bedsAvailable: 20
  },

  // --- 3. RAMPUR NAGAR (Dehradun, Uttarakhand) ---
  {
    id: 'fac-uk-1',
    name: 'Doon Govt Medical College & Hospital',
    category: 'Hospital',
    coords: [30.3210, 78.0380],
    capacity: '800 beds',
    medicalSupport: 'Mountain Debris Trauma & Orthopedic Care',
    contact: '108 / 0135-2726020',
    doctorCount: 45,
    bedsAvailable: 70
  },
  {
    id: 'fac-uk-2',
    name: 'State Landslide Evacuation Center (Rajpur Rd)',
    category: 'Relocation Center',
    coords: [30.3250, 78.0400],
    capacity: '2,000 evacuees',
    medicalSupport: 'NDRF Base, Emergency Bedding & Heating',
    contact: '1070',
    doctorCount: 7,
    bedsAvailable: 350
  },
  {
    id: 'fac-uk-3',
    name: 'Karanpur Mountain Emergency Clinic',
    category: 'Medic Post',
    coords: [30.3280, 78.0490],
    capacity: '150 patients/day',
    medicalSupport: 'Hypothermia & Fracture Stabilization',
    contact: '102',
    doctorCount: 4,
    bedsAvailable: 15
  },

  // --- 4. GOPALPUR (Ganjam, Odisha) ---
  {
    id: 'fac-od-1',
    name: 'MKCG Govt Medical College (Berhampur)',
    category: 'Hospital',
    coords: [19.3100, 84.7950],
    capacity: '1,100 beds',
    medicalSupport: 'Coastal Trauma, Critical Care & Surgery',
    contact: '108 / 0680-2292746',
    doctorCount: 55,
    bedsAvailable: 95
  },
  {
    id: 'fac-od-2',
    name: 'Gopalpur Multi-Purpose Cyclone Shelter',
    category: 'Relocation Center',
    coords: [19.2620, 84.8990],
    capacity: '4,000 evacuees',
    medicalSupport: 'Reinforced Cyclone Bunker & Water Tanks',
    contact: '1077',
    doctorCount: 6,
    bedsAvailable: 700
  },
  {
    id: 'fac-od-3',
    name: 'Gopalpur Port Primary Health Centre',
    category: 'Medic Post',
    coords: [19.2680, 84.9050],
    capacity: '120 patients/day',
    medicalSupport: 'Coastal Emergency Triage',
    contact: '102',
    doctorCount: 4,
    bedsAvailable: 18
  },

  // --- 5. SUNDARBAN GHAT (South 24 Parganas, West Bengal) ---
  {
    id: 'fac-wb-1',
    name: 'Canning Sub-Divisional Emergency Hospital',
    category: 'Hospital',
    coords: [22.3106, 88.6582],
    capacity: '450 beds',
    medicalSupport: 'Snakebite, Waterborne Trauma & ICU',
    contact: '108 / 03218-255255',
    doctorCount: 28,
    bedsAvailable: 85
  },
  {
    id: 'fac-wb-2',
    name: 'Gosaba Multipurpose Cyclone Shelter',
    category: 'Relocation Center',
    coords: [22.1652, 88.8072],
    capacity: '3,500 evacuees',
    medicalSupport: 'High-Plinth Flood Refuge & First-Aid',
    contact: '03218-236203 / 1077',
    doctorCount: 5,
    bedsAvailable: 420
  },
  {
    id: 'fac-wb-3',
    name: 'Basanti Block Primary Health Centre',
    category: 'Medic Post',
    coords: [22.1920, 88.7180],
    capacity: '150 patients/day',
    medicalSupport: 'Triage & Rapid Antivenom Administration',
    contact: '102',
    doctorCount: 6,
    bedsAvailable: 24
  },

  // --- 6. VASANT VIHAR (Visakhapatnam, Andhra Pradesh) ---
  {
    id: 'fac-ap-1',
    name: 'King George Govt Hospital (Vizag)',
    category: 'Hospital',
    coords: [17.7080, 83.2950],
    capacity: '1,200 beds',
    medicalSupport: 'Level-1 Coastal Trauma & Critical Care',
    contact: '108 / 0891-2564891',
    doctorCount: 60,
    bedsAvailable: 110
  },
  {
    id: 'fac-ap-2',
    name: 'Gajuwaka Cyclone Relief Shelter',
    category: 'Relocation Center',
    coords: [17.6950, 83.2120],
    capacity: '2,500 evacuees',
    medicalSupport: 'Disaster Shelter & High-Plinth Hall',
    contact: '1077',
    doctorCount: 6,
    bedsAvailable: 450
  },
  {
    id: 'fac-ap-3',
    name: 'Steel Plant Primary Health (Medic)',
    category: 'Medic Post',
    coords: [17.6750, 83.1850],
    capacity: '350 patients/day',
    medicalSupport: 'Industrial & Urban Triage Center',
    contact: '102',
    doctorCount: 8,
    bedsAvailable: 35
  },

  // --- 7. VADODARA CONTROL BASE (Gujarat) ---
  {
    id: 'fac-gj-1',
    name: 'SSG Hospital & Trauma Center (Vadodara)',
    category: 'Hospital',
    coords: [22.3122, 73.1920],
    capacity: '1,500 beds',
    medicalSupport: 'Level-1 Trauma, Burn Unit & ICU',
    contact: '108 / 0265-2424848',
    doctorCount: 85,
    bedsAvailable: 120
  },
  {
    id: 'fac-gj-2',
    name: 'Vadodara Central Emergency Shelter',
    category: 'Relocation Center',
    coords: [22.3072, 73.1812],
    capacity: '5,000 evacuees',
    medicalSupport: 'Community Kitchen & SDRF Base Unit',
    contact: '1070 / 0265-2422106',
    doctorCount: 12,
    bedsAvailable: 850
  },
  {
    id: 'fac-gj-3',
    name: 'Akota Urban Emergency Clinic',
    category: 'Medic Post',
    coords: [22.2980, 73.1750],
    capacity: '250 patients/day',
    medicalSupport: 'Heatstroke Hydration & Triage',
    contact: '102',
    doctorCount: 10,
    bedsAvailable: 30
  }
];

const FACILITY_THEMES = {
  'Relocation Center': { color: '#059669', icon: '🛡️', badgeBg: '#ecfdf5', badgeColor: '#047857' },
  'Hospital': { color: '#2563eb', icon: '🏥', badgeBg: '#eff6ff', badgeColor: '#1d4ed8' },
  'Medic Post': { color: '#0891b2', icon: '⚕️', badgeBg: '#ecfeff', badgeColor: '#0e7490' }
};

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function HazardMap({ habitations, sosRequests, facilities = INITIAL_FACILITIES, isFull = false }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);

  const habitationsLayerRef = useRef(null);
  const facilitiesLayerRef = useRef(null);
  const sosLayerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const abortControllerRef = useRef(null);

  const [activeFacilityFilter, setActiveFacilityFilter] = useState('All');
  const [mapStyle, setMapStyle] = useState('streets');
  const [routeInfo, setRouteInfo] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  const activeFacilityFilterRef = useRef(activeFacilityFilter);

  useEffect(() => {
    activeFacilityFilterRef.current = activeFacilityFilter;
  }, [activeFacilityFilter]);

  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const tileUrl = mapStyle === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

    const newTileLayer = window.L.tileLayer(tileUrl, {
      maxZoom: 19,
      crossOrigin: true,
      attribution: mapStyle === 'satellite'
        ? 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    newTileLayer.addTo(mapInstanceRef.current);
    tileLayerRef.current = newTileLayer;
  }, [mapStyle]);

  const findNearestFacility = useCallback((lat, lng, targetCategory = 'All') => {
    const pool = targetCategory === 'All' 
      ? facilities 
      : facilities.filter(f => f.category === targetCategory);

    if (!pool || pool.length === 0) return null;

    let nearest = pool[0];
    let minDist = getDistanceKm(lat, lng, nearest.coords[0], nearest.coords[1]);

    for (let i = 1; i < pool.length; i++) {
      const d = getDistanceKm(lat, lng, pool[i].coords[0], pool[i].coords[1]);
      if (d < minDist) {
        minDist = d;
        nearest = pool[i];
      }
    }
    return { facility: nearest, distanceKm: minDist.toFixed(1) };
  }, [facilities]);

  const drawRouteToFacility = useCallback(async (startLat, startLng, destCoords, label, category) => {
    const map = mapInstanceRef.current;
    if (!map || !window.L) return;

    if (map.closePopup) map.closePopup();
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    setIsLoadingRoute(true);

    try {
      let coords = [];
      let distanceKm = 0;
      let durationMins = 0;

      // Primary: OpenRouteService
      try {
        const orsRes = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': ORS_API_KEY
          },
          body: JSON.stringify({
            coordinates: [
              [startLng, startLat],
              [destCoords[1], destCoords[0]]
            ]
          }),
          signal: abortControllerRef.current.signal
        });

        if (orsRes.ok) {
          const data = await orsRes.json();
          const feature = data.features?.[0];
          coords = feature.geometry.coordinates.map(c => [c[1], c[0]]);
          distanceKm = (feature.properties.summary.distance / 1000).toFixed(1);
          durationMins = Math.round(feature.properties.summary.duration / 60);
        }
      } catch (e) {
        // Fallback to OSRM
      }

      // Fallback: Public OSRM
      if (coords.length === 0) {
        const osrmRes = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${destCoords[1]},${destCoords[0]}?overview=full&geometries=geojson`,
          { signal: abortControllerRef.current.signal }
        );
        const osrmData = await osrmRes.json();
        const route = osrmData.routes?.[0];
        if (route) {
          coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
          distanceKm = (route.distance / 1000).toFixed(1);
          durationMins = Math.round(route.duration / 60);
        }
      }

      if (coords.length > 0) {
        if (routeLayerRef.current) routeLayerRef.current.clearLayers();

        const routePolyline = window.L.polyline(coords, {
          color: FACILITY_THEMES[category]?.color || '#2563eb',
          weight: 6,
          opacity: 0.95,
          dashArray: '10, 10',
          lineCap: 'round',
          lineJoin: 'round'
        });

        routeLayerRef.current.addLayer(routePolyline);
        map.fitBounds(routePolyline.getBounds(), { padding: [50, 50], maxZoom: 14 });

        setRouteInfo({
          targetName: label,
          category: category || 'Evacuation Route',
          distance: distanceKm,
          duration: durationMins,
          contact: '1070 / 108'
        });
      }
    } catch (err) {
      if (err.name !== 'AbortError') console.error('Routing failed:', err);
    } finally {
      setIsLoadingRoute(false);
    }
  }, []);

  const handleSetUserLocation = useCallback((lat, lng, label = 'Chosen Location') => {
    const map = mapInstanceRef.current;
    if (!map || !window.L) return;

    if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);

    const userMarker = window.L.circleMarker([lat, lng], {
      radius: 8,
      fillColor: '#4f46e5',
      color: '#ffffff',
      weight: 3,
      fillOpacity: 1
    }).addTo(map);

    userMarker.bindPopup(`<strong>📍 ${label}</strong>`).openPopup();
    userMarkerRef.current = userMarker;

    const res = findNearestFacility(lat, lng, activeFacilityFilterRef.current);
    if (res?.facility) {
      drawRouteToFacility(lat, lng, res.facility.coords, res.facility.name, res.facility.category);
    }
  }, [findNearestFacility, drawRouteToFacility]);

  const resetMapView = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.L) return;
    const points = [
      ...Object.values(HABITATION_COORDS),
      ...facilities.map(f => f.coords)
    ];
    if (points.length > 0) {
      map.fitBounds(window.L.latLngBounds(points), { padding: isFull ? [40, 40] : [10, 10] });
    }
  }, [facilities, isFull]);

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    let resizeObserver = null;

    const initMap = () => {
      if (!window.L || !mapContainerRef.current) return;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = window.L.map(mapContainerRef.current, {
        zoomControl: false,
        scrollWheelZoom: isFull,
        dragging: isFull
      });

      if (isFull) {
        window.L.control.zoom({ position: 'bottomright' }).addTo(map);
        map.on('click', e => {
          handleSetUserLocation(e.latlng.lat, e.latlng.lng, 'Selected Point');
        });
      }

      mapInstanceRef.current = map;

      const tileLayer = window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        crossOrigin: true,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      habitationsLayerRef.current = window.L.layerGroup().addTo(map);
      facilitiesLayerRef.current = window.L.layerGroup().addTo(map);
      sosLayerRef.current = window.L.layerGroup().addTo(map);
      routeLayerRef.current = window.L.layerGroup().addTo(map);

      resetMapView();

      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 200);
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 500);
    };

    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = initMap;
      document.body.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isFull, handleSetUserLocation, resetMapView]);

  useEffect(() => {
    const handleFocus = (event) => {
      const sos = event.detail;
      const map = mapInstanceRef.current;
      if (!map || !sos) return;

      map.invalidateSize();
      map.flyTo(sos.coords, 15, { animate: true, duration: 1.2 });
      
      const nearestHaven = findNearestFacility(sos.coords[0], sos.coords[1], 'Hospital');
      const baseCoords = nearestHaven ? nearestHaven.facility.coords : [22.3072, 73.1812];
      drawRouteToFacility(baseCoords[0], baseCoords[1], sos.coords, `Dispatch to ${sos.victimName}`, 'Hospital');
    };

    window.addEventListener('focus-sos-beacon', handleFocus);
    return () => window.removeEventListener('focus-sos-beacon', handleFocus);
  }, [findNearestFacility, drawRouteToFacility]);

  // Habitations Markers
  useEffect(() => {
    if (!habitationsLayerRef.current || !window.L) return;
    habitationsLayerRef.current.clearLayers();

    habitations.forEach(hab => {
      const coords = HABITATION_COORDS[hab.name] || [21.0, 78.0];
      const isCrit = hab.riskLevel === 'Critical';

      const iconHtml = `<div class="${isCrit ? 'marker-critical animate-pulse-crit' : 'marker-high'}"></div>`;
      const marker = window.L.marker(coords, {
        icon: window.L.divIcon({ className: 'custom-div-icon', html: iconHtml, iconSize: [20, 20], iconAnchor: [10, 10] })
      });

      let popupContent = `
        <div style="font-family: inherit; min-width: 200px; padding: 2px;">
          <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700;">${hab.name}</h4>
          <p style="margin: 0 0 2px; font-size: 11px;"><strong>Zone:</strong> ${hab.district} (${hab.hazardType})</p>
          <p style="margin: 0 0 6px; font-size: 11px;"><strong>Risk:</strong> <span style="color:${isCrit ? '#dc2626' : '#f97316'}; font-weight:700;">${hab.riskLevel}</span></p>
      `;

      if (isFull) {
        popupContent += `
          <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 6px;">
            <button id="btn-shelter-${hab.name.replace(/\s+/g, '')}" style="background: #059669; color: #fff; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 600;">
              🛡️ Route to Nearest Shelter
            </button>
            <button id="btn-hospital-${hab.name.replace(/\s+/g, '')}" style="background: #2563eb; color: #fff; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 600;">
              🏥 Route to Nearest Hospital
            </button>
            <button id="btn-clinic-${hab.name.replace(/\s+/g, '')}" style="background: #0891b2; color: #fff; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 600;">
              ⚕️ Route to Nearest Clinic
            </button>
          </div>
        `;
      }
      popupContent += `</div>`;

      marker.bindPopup(popupContent, { maxWidth: 230 });

      if (isFull) {
        marker.on('popupopen', () => {
          const btnShelter = document.getElementById(`btn-shelter-${hab.name.replace(/\s+/g, '')}`);
          const btnHosp = document.getElementById(`btn-hospital-${hab.name.replace(/\s+/g, '')}`);
          const btnClinic = document.getElementById(`btn-clinic-${hab.name.replace(/\s+/g, '')}`);

          if (btnShelter) {
            btnShelter.onclick = () => {
              const res = findNearestFacility(coords[0], coords[1], 'Relocation Center');
              if (res?.facility) {
                drawRouteToFacility(coords[0], coords[1], res.facility.coords, res.facility.name, res.facility.category);
              }
            };
          }
          if (btnHosp) {
            btnHosp.onclick = () => {
              const res = findNearestFacility(coords[0], coords[1], 'Hospital');
              if (res?.facility) {
                drawRouteToFacility(coords[0], coords[1], res.facility.coords, res.facility.name, res.facility.category);
              }
            };
          }
          if (btnClinic) {
            btnClinic.onclick = () => {
              const res = findNearestFacility(coords[0], coords[1], 'Medic Post');
              if (res?.facility) {
                drawRouteToFacility(coords[0], coords[1], res.facility.coords, res.facility.name, res.facility.category);
              }
            };
          }
        });
      }

      habitationsLayerRef.current.addLayer(marker);
    });
  }, [habitations, isFull, findNearestFacility, drawRouteToFacility]);

  // Facilities Markers
  useEffect(() => {
    if (!facilitiesLayerRef.current || !window.L || !isFull) return;
    facilitiesLayerRef.current.clearLayers();

    const displayList = activeFacilityFilter === 'All' 
      ? facilities 
      : facilities.filter(f => f.category === activeFacilityFilter);

    displayList.forEach(fac => {
      const theme = FACILITY_THEMES[fac.category] || FACILITY_THEMES['Hospital'];
      const facIconHtml = `<div class="marker-facility" style="background-color: ${theme.color};">${theme.icon}</div>`;

      const facMarker = window.L.marker(fac.coords, {
        icon: window.L.divIcon({ className: 'custom-div-icon', html: facIconHtml, iconSize: [26, 26], iconAnchor: [13, 13] })
      });

      facMarker.bindPopup(`
        <div style="font-family: inherit; min-width: 200px;">
          <span style="font-size: 9px; background: ${theme.badgeBg}; color: ${theme.badgeColor}; font-weight: 700; padding: 2px 5px; border-radius: 4px; text-transform: uppercase;">
            ${fac.category}
          </span>
          <h4 style="margin: 5px 0 4px 0; font-size: 13px; font-weight: 700;">${fac.name}</h4>
          <p style="margin: 0 0 2px; font-size: 11px;"><strong>Capacity:</strong> ${fac.capacity}</p>
          <p style="margin: 0 0 6px; font-size: 11px;"><strong>Helpline:</strong> ${fac.contact}</p>
          <button id="btn-direct-${fac.id || fac._id}" style="background: ${theme.color}; color: #fff; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 600; width: 100%;">
            🚗 Evacuate Here
          </button>
        </div>
      `, { maxWidth: 230 });

      facMarker.on('popupopen', () => {
        const btn = document.getElementById(`btn-direct-${fac.id || fac._id}`);
        if (btn) {
          btn.onclick = () => {
            const userLatLng = userMarkerRef.current ? userMarkerRef.current.getLatLng() : { lat: fac.coords[0] - 0.04, lng: fac.coords[1] - 0.04 };
            drawRouteToFacility(userLatLng.lat, userLatLng.lng, fac.coords, fac.name, fac.category);
          };
        }
      });

      facilitiesLayerRef.current.addLayer(facMarker);
    });
  }, [facilities, activeFacilityFilter, isFull, drawRouteToFacility]);

  // SOS Distress Pins
  useEffect(() => {
    if (!sosLayerRef.current || !window.L || !isFull) return;
    sosLayerRef.current.clearLayers();

    sosRequests.forEach(sos => {
      const isResolved = sos.status === 'Resolved';
      const sosIconHtml = `
        <div class="marker-sos-beacon ${isResolved ? 'sos-resolved' : 'animate-pulse-sos'}">
          ${isResolved ? '✅' : '🚨'}
        </div>
      `;

      const sosMarker = window.L.marker(sos.coords, {
        icon: window.L.divIcon({ className: 'custom-div-icon', html: sosIconHtml, iconSize: [28, 28], iconAnchor: [14, 14] })
      });

      sosMarker.bindPopup(`
        <div style="font-family: inherit; min-width: 220px; padding: 2px;">
          <span style="font-size: 10px; background: ${isResolved ? '#ecfdf5' : '#fee2e2'}; color: ${isResolved ? '#047857' : '#b91c1c'}; font-weight: 800; padding: 2px 6px; border-radius: 4px;">
            ${isResolved ? 'RESCUE COMPLETED' : 'EMERGENCY SOS ACTIVE'}
          </span>
          <h4 style="margin: 6px 0 2px 0; font-size: 14px;">${sos.victimName}</h4>
          <p style="margin: 0 0 2px; font-size: 11px;"><strong>Phone:</strong> <a href="tel:${sos.phone}">${sos.phone}</a></p>
          <p style="margin: 0 0 2px; font-size: 11px;"><strong>Calamity:</strong> <span style="color:#dc2626; font-weight:700;">${sos.calamity}</span></p>
          <p style="margin: 0 0 4px; font-size: 11px;"><strong>Aid Required:</strong> ${sos.aidList?.join(', ')}</p>
          ${!isResolved ? `
            <button id="btn-dispatch-${sos._id || sos.id}" style="background: #dc2626; color: #fff; border: none; padding: 6px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 700; width: 100%;">
              👷 Dispatch Worker / Route Here
            </button>
          ` : ''}
        </div>
      `, { maxWidth: 240 });

      sosMarker.on('popupopen', () => {
        const btn = document.getElementById(`btn-dispatch-${sos._id || sos.id}`);
        if (btn) {
          btn.onclick = () => {
            const nearestBase = findNearestFacility(sos.coords[0], sos.coords[1], 'Hospital');
            const origin = nearestBase ? nearestBase.facility.coords : [22.3072, 73.1812];
            drawRouteToFacility(origin[0], origin[1], sos.coords, `Victim: ${sos.victimName}`, 'Hospital');
          };
        }
      });

      sosLayerRef.current.addLayer(sosMarker);
    });
  }, [sosRequests, isFull, findNearestFacility, drawRouteToFacility]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => handleSetUserLocation(pos.coords.latitude, pos.coords.longitude, 'Your GPS Position'),
      () => {
        alert('Could not retrieve GPS. Using local base.');
        handleSetUserLocation(22.3072, 73.1812, 'Base Location');
      },
      { timeout: 6000, enableHighAccuracy: true }
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        .marker-critical { background-color: #dc2626; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; }
        .animate-pulse-crit { animation: pulse-crit 1.5s infinite; }
        @keyframes pulse-crit {
          0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
          70% { box-shadow: 0 0 0 12px rgba(220, 38, 38, 0); }
          100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
        }
        .marker-high { background-color: #f97316; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; }
        .marker-facility {
          display: flex; align-items: center; justify-content: center;
          width: 26px; height: 26px; border-radius: 50%; border: 2px solid white;
          color: white; font-size: 13px; box-shadow: 0 3px 6px rgba(0,0,0,0.3);
        }
        .marker-sos-beacon {
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 50%; background: #ef4444;
          color: white; font-size: 14px; border: 2px solid white; cursor: pointer;
        }
        .marker-sos-beacon.sos-resolved {
          background: #10b981;
          animation: none;
        }
        .animate-pulse-sos { animation: pulse-sos 1.2s infinite; }
        @keyframes pulse-sos {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.8); }
          70% { box-shadow: 0 0 0 14px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .custom-div-icon { background: none; border: none; }
      `}</style>

      {isFull && (
        <div style={{
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 14px',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          zIndex: 10,
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TARGET HAVEN:</span>
            <select
              value={activeFacilityFilter}
              onChange={e => setActiveFacilityFilter(e.target.value)}
              style={{ background: '#f8fafc', color: '#0f172a', padding: '6px 10px', fontSize: '12px', fontWeight: 600, border: '1px solid #cbd5e1', borderRadius: '6px' }}
            >
              <option value="All">All Emergency Sites ({facilities.length})</option>
              <option value="Relocation Center">🛡️ Relocation Centers</option>
              <option value="Hospital">🏥 Emergency Hospitals</option>
              <option value="Medic Post">⚕️ Medic Clinics</option>
            </select>

            <select
              value={mapStyle}
              onChange={e => setMapStyle(e.target.value)}
              style={{ background: '#f8fafc', color: '#0f172a', padding: '6px 10px', fontSize: '12px', fontWeight: 600, border: '1px solid #cbd5e1', borderRadius: '6px' }}
            >
              <option value="streets">🗺️ OpenStreetMap Streets</option>
              <option value="satellite">🛰️ Public Satellite (Esri)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={resetMapView} style={{ background: '#f8fafc', color: '#334155', padding: '6px 12px', fontSize: '12px', fontWeight: 600, border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}>🔄 Reset View</button>
            <button onClick={handleLocateMe} style={{ background: '#2563eb', color: '#ffffff', padding: '6px 14px', fontSize: '12px', fontWeight: 700, border: 'none', borderRadius: '6px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(37,99,235,0.3)' }}>📍 Evacuate From My Location</button>
          </div>
        </div>
      )}

      <div style={{ flex: 1, minHeight: 0, position: 'relative', width: '100%' }}>
        {isFull && routeInfo && (
          <div style={{
            position: 'absolute', bottom: 12, left: 12, zIndex: 1000, background: '#ffffff',
            padding: '12px 16px', borderRadius: '6px', boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
            borderLeft: `5px solid ${FACILITY_THEMES[routeInfo.category]?.color || '#2563eb'}`, maxWidth: '290px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', fontSize: '10px' }}>
                {routeInfo.category}
              </span>
              <button onClick={() => { setRouteInfo(null); if (routeLayerRef.current) routeLayerRef.current.clearLayers(); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 700, fontSize: '14px' }}>✕</button>
            </div>
            <h3 style={{ margin: '4px 0 2px 0', fontSize: '13px', fontWeight: 700 }}>{routeInfo.targetName}</h3>
            <div style={{ display: 'flex', gap: '10px', margin: '4px 0', color: '#475569', fontSize: '12px' }}>
              <span><strong>Dist:</strong> {routeInfo.distance} km</span>
              <span><strong>Est:</strong> {routeInfo.duration} mins</span>
            </div>
            <p style={{ margin: '3px 0 0 0', color: '#b91c1c', fontWeight: 700, fontSize: '12px' }}>Control Helpline: {routeInfo.contact}</p>
          </div>
        )}

        {isFull && isLoadingRoute && (
          <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: '#0f172a', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
            Calculating safest road path...
          </div>
        )}

        <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />
      </div>
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [habitations, setHabitations] = useState([]);
  const [stats, setStats] = useState({ totalHabitations: 0, criticalZones: 0, populationAtRisk: 0, relocationsFlagged: 0 });
  const [priorities, setPriorities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [hazardFilter, setHazardFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');

  const [facilities, setFacilities] = useState(INITIAL_FACILITIES);
  const [sosRequests, setSosRequests] = useState([]);

  const [showSosModal, setShowSosModal] = useState(false);
  const [victimName, setVictimName] = useState('');
  const [victimPhone, setVictimPhone] = useState('');
  const [victimCalamity, setVictimCalamity] = useState('Flood');
  const [selectedAids, setSelectedAids] = useState(['Food & Clean Water']);

  const aidOptions = [
    '🍲 Food & Clean Water',
    '🚑 Medical Aid / Paramedic',
    '🛟 Search & Rescue / Evacuation',
    '👕 Clothing & Blankets',
    '⛺ Temporary Shelter'
  ];

  const toggleAid = aid => {
    if (selectedAids.includes(aid)) {
      setSelectedAids(selectedAids.filter(a => a !== aid));
    } else {
      setSelectedAids([...selectedAids, aid]);
    }
  };

  useEffect(() => {
    fetch(API_BASE).then(res => res.json()).then(data => setHabitations(data)).catch(err => console.error(err));
    fetch(`${API_BASE}/stats`).then(res => res.json()).then(data => setStats(data)).catch(err => console.error(err));
    fetch(`${API_BASE}/priorities`).then(res => res.json()).then(data => setPriorities(data)).catch(err => console.error(err));

    fetch(SOS_API)
      .then(res => res.json())
      .then(data => setSosRequests(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed to load SOS records:', err));

    fetch(FACILITIES_API)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setFacilities(data);
        }
      })
      .catch(err => console.error('Failed to load facilities from DB:', err));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch(SOS_API)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setSosRequests(data);
        })
        .catch(() => {});
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (sosId, newStatus) => {
    try {
      const res = await fetch(`${SOS_API}/${sosId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Status update failed');

      const updated = await res.json();
      setSosRequests(prev => prev.map(item => item._id === sosId ? updated : item));
    } catch (err) {
      console.error(err);
      alert('Could not update status on the server.');
    }
  };

  // DELETE SOS Distress Request Handler
  const handleDeleteSos = async (sosId) => {
    if (!window.confirm('Are you sure you want to permanently delete this emergency distress call?')) return;
    try {
      const res = await fetch(`${SOS_API}/${sosId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Delete failed');

      setSosRequests(prev => prev.filter(item => (item._id || item.id) !== sosId));
    } catch (err) {
      console.error(err);
      alert('Could not delete SOS request from server. Check that backend DELETE route is set up.');
    }
  };

  const handleVictimSubmit = e => {
    e.preventDefault();
    if (!victimName || !victimPhone) {
      alert('Please provide your name and phone number.');
      return;
    }

    const dispatchSos = async (coords) => {
      const payload = {
        victimName,
        phone: victimPhone,
        calamity: victimCalamity,
        aidList: selectedAids,
        coords: coords
      };

      try {
        const res = await fetch(SOS_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Server returned an error');

        const savedRecord = await res.json();
        setSosRequests(prev => [savedRecord, ...prev]);

        setShowSosModal(false);
        setVictimName('');
        setVictimPhone('');
        setCurrentView('map');

        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('focus-sos-beacon', { detail: savedRecord }));
        }, 350);
      } catch (err) {
        console.error('Submission error:', err);
        alert('Could not save SOS request. Please ensure the backend is running.');
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => dispatchSos([pos.coords.latitude, pos.coords.longitude]),
        () => dispatchSos([22.3072 + (Math.random() - 0.5) * 0.02, 73.1812 + (Math.random() - 0.5) * 0.02]),
        { timeout: 4000 }
      );
    } else {
      dispatchSos([22.3072, 73.1812]);
    }
  };

  const filteredHabitations = habitations.filter(hab => {
    const matchesSearch = hab.name?.toLowerCase().includes(searchQuery.toLowerCase()) || hab.district?.toLowerCase().includes(searchQuery.toLowerCase()) || hab.hazardType?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHazard = hazardFilter === 'all' || hab.hazardType?.toLowerCase().includes(hazardFilter.toLowerCase());
    const matchesRisk = riskFilter === 'all' || hab.riskLevel?.toLowerCase() === riskFilter.toLowerCase();
    return matchesSearch && matchesHazard && matchesRisk;
  });

  const activeSosCount = sosRequests.filter(s => s.status !== 'Resolved').length;

  const viewMeta = {
    dashboard: { title: 'Command Dashboard', subtitle: 'Overview of hazard exposure, nearest relocation shelters, and hospital network' },
    map: { title: 'Hazard & Evacuation Route Map', subtitle: 'Interactive live navigation to government relief hubs, trauma hospitals, and active SOS beacons' },
    habitations: { title: 'All Habitations', subtitle: 'Comprehensive inventory of settlements and infrastructure exposure' },
    groundworker: { title: 'Ground Worker SOS Response Feed', subtitle: 'Live feed of distress calls, victim locations, and dispatch routing' },
    relocation: { title: 'Relocation Priority Ranking', subtitle: 'High-risk habitations scheduled for relocation and emergency response transfers' },
    about: { title: 'How Scoring Works', subtitle: 'Composite risk formulation and weighting criteria' }
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">अ</span>
          <div className="brand-text">
            <span className="brand-name">ABHAYA</span>
            <span className="brand-sub">Hazard &amp; Vulnerability System</span>
          </div>
        </div>

        <div style={{ padding: '0 12px 14px' }}>
          <button
            onClick={() => setShowSosModal(true)}
            style={{
              width: '100%',
              background: '#dc2626',
              color: '#ffffff',
              padding: '10px 8px',
              fontSize: '12px',
              fontWeight: 800,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)'
            }}
          >
            🚨 VICTIM SOS: REQUEST AID
          </button>
        </div>

        <nav className="nav">
          <button className={`nav-item ${currentView === 'dashboard' ? 'is-active' : ''}`} onClick={() => setCurrentView('dashboard')}>
            <span className="nav-dot"></span>Dashboard
          </button>
          <button className={`nav-item ${currentView === 'map' ? 'is-active' : ''}`} onClick={() => setCurrentView('map')}>
            <span className="nav-dot"></span>Hazard Map
          </button>
          <button className={`nav-item ${currentView === 'groundworker' ? 'is-active' : ''}`} onClick={() => setCurrentView('groundworker')}>
            <span className="nav-dot" style={{ background: '#dc2626' }}></span>Ground Worker Feed ({activeSosCount})
          </button>
          <button className={`nav-item ${currentView === 'habitations' ? 'is-active' : ''}`} onClick={() => setCurrentView('habitations')}>
            <span className="nav-dot"></span>Habitations
          </button>
          <button className={`nav-item ${currentView === 'relocation' ? 'is-active' : ''}`} onClick={() => setCurrentView('relocation')}>
            <span className="nav-dot"></span>Relocation Priority
          </button>
          <button className={`nav-item ${currentView === 'about' ? 'is-active' : ''}`} onClick={() => setCurrentView('about')}>
            <span className="nav-dot"></span>How Scoring Works
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="status-pill"><span className="pulse"></span>Live data · Connected</div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar-title">
            <h1 id="view-title">{viewMeta[currentView].title}</h1>
            <p id="view-subtitle">{viewMeta[currentView].subtitle}</p>
          </div>
          <div className="topbar-actions">
            <div className="search">
              <input type="text" placeholder="Search habitation, district, hazard type…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <button className="btn btn-outline" onClick={() => window.print()}>Export Report</button>
            <div className="avatar">DM</div>
          </div>
        </header>

        {currentView === 'dashboard' && (
          <section className="view is-active" id="view-dashboard">
            <div className="stat-grid">
              <div className="stat-card"><span className="stat-label">Habitations Monitored</span><span className="stat-value">{stats.totalHabitations}</span><span className="stat-trend">active records</span></div>
              <div className="stat-card stat-card--dark"><span className="stat-label">Critical Risk Zones</span><span className="stat-value">{stats.criticalZones}</span><span className="stat-trend">requires immediate review</span></div>
              <div className="stat-card"><span className="stat-label">Active SOS Distress Calls</span><span className="stat-value" style={{ color: '#dc2626' }}>{activeSosCount}</span><span className="stat-trend">victims awaiting response</span></div>
              <div className="stat-card"><span className="stat-label">Relocation Priority List</span><span className="stat-value">{stats.relocationsFlagged}</span><span className="stat-trend">settlements flagged this cycle</span></div>
            </div>

            <div className="panel-grid">
              <div className="panel panel-map">
                <div className="panel-head">
                  <h2>Hazard Exposure Zones</h2>
                  <div className="legend">
                    <span><i className="sw sw-4"></i>Critical (Pulsing)</span>
                    <span><i className="sw sw-3"></i>High Risk</span>
                  </div>
                </div>
                <div style={{ height: '360px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                  <HazardMap habitations={habitations} sosRequests={sosRequests} facilities={facilities} isFull={false} />
                </div>
              </div>

              <div className="panel panel-list">
                <div className="panel-head"><h2>Top Relocation Priorities</h2></div>
                <ol className="priority-list">
                  {priorities.map((item, idx) => (
                    <li key={item._id || idx}><span className="rank">0{idx + 1}</span><span className="name">{item.name}</span><span className="score">{(item.vulnerabilityScore / 10).toFixed(1)}</span></li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="panel panel-table">
              <div className="panel-head">
                <h2>Habitation Risk Register</h2>
                <div className="filters">
                  <select value={hazardFilter} onChange={e => setHazardFilter(e.target.value)}>
                    <option value="all">All hazard types</option>
                    <option value="flood">Flood</option>
                    <option value="landslide">Landslide</option>
                    <option value="cyclone">Cyclone</option>
                    <option value="erosion">River Erosion</option>
                  </select>
                  <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)}>
                    <option value="all">All risk levels</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="moderate">Moderate</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <table className="data-table" id="riskTable">
                <thead><tr><th>Habitation</th><th>District</th><th>Hazard Type</th><th>Population</th><th>Vulnerability Score</th><th>Risk Level</th></tr></thead>
                <tbody>
                  {filteredHabitations.map((hab, idx) => (
                    <tr key={hab._id || idx}>
                      <td>{hab.name}</td><td>{hab.district}</td><td>{hab.hazardType}</td><td>{hab.population?.toLocaleString()}</td>
                      <td><div className="bar"><span style={{ width: `${hab.vulnerabilityScore}%` }}></span></div></td>
                      <td><span className={`badge badge-${hab.riskLevel?.toLowerCase()}`}>{hab.riskLevel}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {currentView === 'map' && (
          <section className="view is-active" id="view-map">
            <div className="panel panel-full" style={{ paddingBottom: '16px' }}>
              <div className="panel-head">
                <h2>Emergency Safe Havens &amp; SOS Distress Beacons</h2>
                <div className="legend">
                  <span><i className="sw" style={{ background: '#ef4444' }}></i>🚨 Victim SOS</span>
                  <span><i className="sw" style={{ background: '#059669' }}></i>🛡️ Shelter</span>
                  <span><i className="sw" style={{ background: '#2563eb' }}></i>🏥 Hospital</span>
                  <span><i className="sw" style={{ background: '#0891b2' }}></i>⚕️ Clinic</span>
                </div>
              </div>
              
              <div style={{ height: '640px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                <HazardMap habitations={habitations} sosRequests={sosRequests} facilities={facilities} isFull={true} />
              </div>

              <p className="hint" style={{ marginTop: '12px' }}>
                Click any settlement marker or 🚨 SOS beacon to plot safe road routes to the closest haven.
              </p>
            </div>
          </section>
        )}

        {currentView === 'groundworker' && (
          <section className="view is-active" id="view-groundworker">
            <div className="panel panel-full">
              <div className="panel-head">
                <h2>Active Citizen SOS Distress Signals ({sosRequests.length})</h2>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Victim Name</th>
                    <th>Contact Phone</th>
                    <th>Calamity / Hazard</th>
                    <th>Required Emergency Aid</th>
                    <th>Reported</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sosRequests.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                        No active emergency distress calls reported.
                      </td>
                    </tr>
                  ) : (
                    sosRequests.map(sos => (
                      <tr key={sos._id || sos.id}>
                        <td><strong>{sos.victimName}</strong></td>
                        <td><a href={`tel:${sos.phone}`}>{sos.phone}</a></td>
                        <td><span style={{ color: '#dc2626', fontWeight: 700 }}>{sos.calamity}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {sos.aidList?.map((aid, i) => (
                              <span key={i} style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>
                                {aid}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>{new Date(sos.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Recent'}</td>
                        <td>
                          <select
                            value={sos.status || 'Pending Dispatch'}
                            onChange={e => handleUpdateStatus(sos._id, e.target.value)}
                            style={{
                              padding: '4px 8px',
                              fontSize: '11px',
                              fontWeight: 700,
                              borderRadius: '12px',
                              border: '1px solid #cbd5e1',
                              background: sos.status === 'Resolved' ? '#ecfdf5' : sos.status === 'En Route' ? '#eff6ff' : '#fee2e2',
                              color: sos.status === 'Resolved' ? '#047857' : sos.status === 'En Route' ? '#1d4ed8' : '#b91c1c'
                            }}
                          >
                            <option value="Pending Dispatch">Pending Dispatch</option>
                            <option value="En Route">En Route</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <button
                              onClick={() => {
                                setCurrentView('map');
                                setTimeout(() => {
                                  window.dispatchEvent(new CustomEvent('focus-sos-beacon', { detail: sos }));
                                }, 350);
                              }}
                              style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
                            >
                              🗺️ View & Route
                            </button>
                            <button
                              onClick={() => handleDeleteSos(sos._id || sos.id)}
                              style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}
                              title="Delete SOS record"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {currentView === 'habitations' && (
          <section className="view is-active" id="view-habitations">
            <div className="panel panel-full">
              <div className="panel-head"><h2>All Monitored Habitations</h2></div>
              <table className="data-table">
                <thead><tr><th>Habitation</th><th>District</th><th>Population</th><th>Households</th><th>Hazard Distance</th><th>Carrying Capacity</th></tr></thead>
                <tbody>
                  {habitations.map((hab, idx) => (
                    <tr key={hab._id || idx}><td>{hab.name}</td><td>{hab.district}</td><td>{hab.population?.toLocaleString()}</td><td>{hab.households}</td><td>{hab.hazardDistance}</td><td>{hab.carryingCapacityStatus}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {currentView === 'relocation' && (
          <section className="view is-active" id="view-relocation">
            <div className="panel panel-full">
              <div className="panel-head"><h2>Relocation Priority Ranking</h2></div>
              <ol className="priority-list priority-list--wide">
                {priorities.map((item, idx) => (
                  <li key={item._id || idx}><span className="rank">0{idx + 1}</span><span className="name">{item.name} — {item.district} ({item.hazardType})</span><span className="score">{(item.vulnerabilityScore / 10).toFixed(1)}</span></li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {currentView === 'about' && (
          <section className="view is-active" id="view-about">
            <div className="panel panel-full panel-about">
              <div className="panel-head"><h2>How the Risk &amp; Vulnerability Score Works</h2></div>
              <div className="about-grid">
                <div className="about-card"><span className="about-step">01</span><h3>Hazard Layer</h3><p>Flood, landslide, cyclone, and erosion probability surfaces are derived from terrain slope, rainfall, and historical events.</p></div>
                <div className="about-card"><span className="about-step">02</span><h3>Exposure Layer</h3><p>Habitation boundaries and population counts are overlaid on hazard surfaces to measure assets inside each zone.</p></div>
                <div className="about-card"><span className="about-step">03</span><h3>Vulnerability Layer</h3><p>Housing quality and infrastructure access adjust raw exposure into a composite vulnerability index.</p></div>
                <div className="about-card"><span className="about-step">04</span><h3>Carrying Capacity</h3><p>Land stability and resource limits are compared against current population to flag overextended habitations.</p></div>
              </div>
            </div>
          </section>
        )}
      </main>

      {showSosModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', width: '100%', maxWidth: '480px', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#dc2626', margin: 0 }}>🚨 Citizen Emergency SOS</h2>
              <button onClick={() => setShowSosModal(false)} style={{ border: 'none', background: 'transparent', fontSize: '18px', cursor: 'pointer', fontWeight: 700 }}>✕</button>
            </div>

            <form onSubmit={handleVictimSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Your Name:</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={victimName}
                  onChange={e => setVictimName(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Mobile Phone Number:</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={victimPhone}
                  onChange={e => setVictimPhone(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Choose Current Calamity / Hazard:</label>
                <select
                  value={victimCalamity}
                  onChange={e => setVictimCalamity(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600 }}
                >
                  <option value="Flood">🌊 Flood / Inundation</option>
                  <option value="Heavy Rain">🌧️ Heavy Torrential Rain</option>
                  <option value="Heatwave (Loo)">☀️ Extreme Heatwave / Severe Loo</option>
                  <option value="Earthquake">🏚️ Earthquake Tremors</option>
                  <option value="Cyclone / Tsunami">🌪️ Cyclone / Coastal Surge</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Select Required Aid:</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {aidOptions.map(aid => (
                    <label key={aid} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedAids.includes(aid)}
                        onChange={() => toggleAid(aid)}
                      />
                      {aid}
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  background: '#dc2626',
                  color: '#ffffff',
                  padding: '12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(220, 38, 38, 0.4)'
                }}
              >
                🚨 TRANSMIT EMERGENCY SOS TO GROUND TEAMS
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}