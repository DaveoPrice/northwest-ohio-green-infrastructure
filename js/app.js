// Combined JavaScript file for the minimal version
// This combines all the essential functionality into a single file
// to reduce the number of HTTP requests and simplify deployment

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize the map
  initMap();
  
  // Add event listeners
  document.getElementById('parks-toggle').addEventListener('change', updateLayers);
  document.getElementById('trails-toggle').addEventListener('change', updateLayers);
  document.getElementById('wetlands-toggle').addEventListener('change', updateLayers);
  document.getElementById('corridors-toggle').addEventListener('change', updateLayers);
  document.getElementById('conservation-toggle').addEventListener('change', updateLayers);
  
  document.getElementById('county-filter').addEventListener('change', applyFilters);
  document.getElementById('type-filter').addEventListener('change', applyFilters);
  document.getElementById('status-filter').addEventListener('change', applyFilters);
  document.getElementById('reset-filters').addEventListener('click', resetFilters);
});

// Global variables
let map;
let woodParksLayer;
let lucasParksLayer;
let odnrLandsLayer;
let countiesLayer;

// Initialize the map
function initMap() {
  // Create map
  map = L.map('map', {
    center: [41.5, -83.6], // Center on Northwest Ohio
    zoom: 9,
    minZoom: 8,
    maxZoom: 18
  });
  
  // Add base map layer (OpenStreetMap)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  
  // Load data
  loadData();
}

// Load GeoJSON data
function loadData() {
  // Load counties
  fetch('data/counties.geojson')
    .then(response => response.json())
    .then(data => {
      countiesLayer = L.geoJSON(data, {
        style: {
          color: '#666',
          weight: 2,
          opacity: 0.5,
          fillOpacity: 0.1
        }
      }).addTo(map);
    })
    .catch(error => console.error('Error loading counties data:', error));
  
  // Load Wood County Parks
  fetch('data/wood_county_parks.geojson')
    .then(response => response.json())
    .then(data => {
      woodParksLayer = L.geoJSON(data, {
        style: {
          color: '#2ca25f',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.7
        },
        onEachFeature: function(feature, layer) {
          const props = feature.properties;
          const name = props.NAME || props.Name || props.name || 'Unnamed Park';
          
          layer.bindPopup(`
            <div class="feature-popup">
              <h3>${name}</h3>
              <p>Wood County Park</p>
              <p>Type: ${props.TYPE || 'Park'}</p>
              <p>Status: ${props.STATUS || 'Unknown'}</p>
              <p>Acres: ${props.ACRES || 'Unknown'}</p>
            </div>
          `);
        }
      }).addTo(map);
    })
    .catch(error => console.error('Error loading Wood County Parks data:', error));
  
  // Load Lucas County Metroparks
  fetch('data/lucas_metroparks.geojson')
    .then(response => response.json())
    .then(data => {
      lucasParksLayer = L.geoJSON(data, {
        style: {
          color: '#1f78b4',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.7
        },
        onEachFeature: function(feature, layer) {
          const props = feature.properties;
          const name = props.NAME || props.Name || props.name || 'Unnamed Park';
          
          layer.bindPopup(`
            <div class="feature-popup">
              <h3>${name}</h3>
              <p>Lucas County Metropark</p>
              <p>Type: ${props.TYPE || 'Park'}</p>
              <p>Status: ${props.STATUS || 'Unknown'}</p>
              <p>Acres: ${props.ACRES || 'Unknown'}</p>
            </div>
          `);
        }
      }).addTo(map);
    })
    .catch(error => console.error('Error loading Lucas County Metroparks data:', error));
  
  // Load ODNR Lands
  fetch('data/odnr_lands.geojson')
    .then(response => response.json())
    .then(data => {
      odnrLandsLayer = L.geoJSON(data, {
        style: {
          color: '#8856a7',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.7
        },
        onEachFeature: function(feature, layer) {
          const props = feature.properties;
          const name = props.NAME || props.Name || props.name || 'Unnamed Area';
          
          layer.bindPopup(`
            <div class="feature-popup">
              <h3>${name}</h3>
              <p>ODNR Land</p>
              <p>Type: ${props.TYPE || 'Conservation Area'}</p>
              <p>Status: ${props.STATUS || 'Unknown'}</p>
              <p>Acres: ${props.ACRES || 'Unknown'}</p>
            </div>
          `);
        }
      }).addTo(map);
    })
    .catch(error => console.error('Error loading ODNR Lands data:', error));
}

// Update layers based on toggles
function updateLayers() {
  const showParks = document.getElementById('parks-toggle').checked;
  const showTrails = document.getElementById('trails-toggle').checked;
  const showWetlands = document.getElementById('wetlands-toggle').checked;
  const showCorridors = document.getElementById('corridors-toggle').checked;
  const showConservation = document.getElementById('conservation-toggle').checked;
  
  // For this minimal version, we'll just toggle visibility of all layers
  // In a more complex version, we would filter by type
  if (woodParksLayer) {
    if (showParks) {
      map.addLayer(woodParksLayer);
    } else {
      map.removeLayer(woodParksLayer);
    }
  }
  
  if (lucasParksLayer) {
    if (showParks) {
      map.addLayer(lucasParksLayer);
    } else {
      map.removeLayer(lucasParksLayer);
    }
  }
  
  if (odnrLandsLayer) {
    if (showConservation) {
      map.addLayer(odnrLandsLayer);
    } else {
      map.removeLayer(odnrLandsLayer);
    }
  }
}

// Apply filters
function applyFilters() {
  const countyFilter = document.getElementById('county-filter').value;
  const typeFilter = document.getElementById('type-filter').value;
  const statusFilter = document.getElementById('status-filter').value;
  
  // For this minimal version, we'll just log the filters
  // In a more complex version, we would filter the layers
  console.log('Filters applied:', {
    county: countyFilter,
    type: typeFilter,
    status: statusFilter
  });
  
  // Show filter status
  const filterStatus = document.getElementById('filter-status');
  filterStatus.textContent = `Filters: County=${countyFilter}, Type=${typeFilter}, Status=${statusFilter}`;
  filterStatus.classList.remove('hidden');
}

// Reset filters
function resetFilters() {
  document.getElementById('county-filter').value = 'all';
  document.getElementById('type-filter').value = 'all';
  document.getElementById('status-filter').value = 'all';
  
  // Hide filter status
  document.getElementById('filter-status').classList.add('hidden');
  
  // Reset layers
  updateLayers();
}
