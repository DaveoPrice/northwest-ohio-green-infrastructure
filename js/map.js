// Initialize the map and base layers
let map;
let baseLayers = {};
let overlayLayers = {};
let layerControl;
let currentBasemap = 'osm';

function initMap() {
    // Create the map
    map = L.map('map', {
        center: CONFIG.map.center,
        zoom: CONFIG.map.zoom,
        minZoom: CONFIG.map.minZoom,
        maxZoom: CONFIG.map.maxZoom,
        maxBounds: CONFIG.map.maxBounds,
        zoomControl: false
    });
    
    // Add zoom control to the top-right
    L.control.zoom({
        position: 'topright'
    }).addTo(map);
    
    // Add scale control
    L.control.scale({
        position: 'bottomleft',
        imperial: true,
        metric: true
    }).addTo(map);
    
    // Initialize basemaps
    initBasemaps();
    
    // Add geolocation control
    addGeolocationControl();
}

function initBasemaps() {
    // Create basemap layers
    Object.keys(CONFIG.basemaps).forEach(key => {
        const basemap = CONFIG.basemaps[key];
        baseLayers[basemap.name] = L.tileLayer(basemap.url, {
            attribution: basemap.attribution,
            maxZoom: CONFIG.map.maxZoom
        });
    });
    
    // Add the default basemap to the map
    baseLayers[CONFIG.basemaps[currentBasemap].name].addTo(map);
    
    // Add layer control
    layerControl = L.control.layers(baseLayers, overlayLayers, {
        position: 'topright',
        collapsed: true
    }).addTo(map);
}

function addGeolocationControl() {
    // Create a custom geolocation control
    const locationControl = L.Control.extend({
        options: {
            position: 'topright'
        },
        
        onAdd: function() {
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
            const button = L.DomUtil.create('a', 'leaflet-control-locate', container);
            
            button.innerHTML = '<i class="fas fa-location-arrow"></i>';
            button.title = 'Show my location';
            button.href = '#';
            
            L.DomEvent.on(button, 'click', function(e) {
                L.DomEvent.stopPropagation(e);
                L.DomEvent.preventDefault(e);
                locateUser();
            });
            
            return container;
        }
    });
    
    // Add the control to the map
    map.addControl(new locationControl());
}

function locateUser() {
    map.locate({
        setView: true,
        maxZoom: 16,
        enableHighAccuracy: true
    });
    
    // Handle location found event
    map.on('locationfound', function(e) {
        // Remove existing location marker if present
        if (window.locationMarker) {
            map.removeLayer(window.locationMarker);
        }
        if (window.locationCircle) {
            map.removeLayer(window.locationCircle);
        }
        
        // Add a marker at the location
        window.locationMarker = L.marker(e.latlng).addTo(map)
            .bindPopup('You are within ' + Math.round(e.accuracy) + ' meters of this point').openPopup();
        
        // Add a circle showing the accuracy radius
        window.locationCircle = L.circle(e.latlng, {
            radius: e.accuracy,
            color: '#3388ff',
            fillColor: '#3388ff',
            fillOpacity: 0.15
        }).addTo(map);
    });
    
    // Handle location error
    map.on('locationerror', function(e) {
        alert("Location access denied or unavailable. " + e.message);
    });
}

// Function to fit map to a GeoJSON layer
function fitMapToLayer(layer) {
    if (layer.getBounds) {
        map.fitBounds(layer.getBounds(), {
            padding: [50, 50]
        });
    }
}

// Export map functions
window.mapFunctions = {
    initMap,
    fitMapToLayer,
    locateUser
};
