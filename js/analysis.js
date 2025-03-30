// Analysis tools for the RGIN web map application

// Global variables for analysis
let analysisLayers = {
    buffer: null,
    intersection: null,
    results: null
};
let drawControl = null;
let drawnItems = null;
let currentAnalysisType = null;
let currentAnalysisFeatureId = null;
let currentBufferRadius = CONFIG.analysis.buffer.defaultRadius;

// Initialize analysis tools
function initAnalysis() {
    // Add event listeners to analysis tool buttons
    document.getElementById('buffer-tool').addEventListener('click', function() {
        startBufferAnalysis();
    });
    
    document.getElementById('intersection-tool').addEventListener('click', function() {
        startIntersectionAnalysis();
    });
    
    // Add event listener to close analysis panel
    document.getElementById('close-analysis').addEventListener('click', function() {
        closeAnalysisPanel();
    });
    
    // Initialize drawn items layer group
    drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
}

// Start buffer analysis
function startBufferAnalysis(featureId = null) {
    // Set current analysis type
    currentAnalysisType = 'buffer';
    currentAnalysisFeatureId = featureId;
    
    // Show analysis panel
    const analysisPanel = document.getElementById('analysis-panel');
    const analysisTitle = document.getElementById('analysis-title');
    const analysisContent = document.getElementById('analysis-content');
    
    analysisTitle.textContent = 'Buffer Analysis';
    
    // Create buffer analysis controls
    let contentHTML = `
        <div class="analysis-form">
            <div class="form-group">
                <label for="buffer-center">Buffer Center:</label>
                <div class="buffer-center-options">
    `;
    
    if (featureId) {
        // If a feature ID is provided, use that feature as the center
        const feature = window.dataFunctions.getFeatureById(featureId);
        if (feature) {
            contentHTML += `
                <div class="center-option selected">
                    <input type="radio" id="center-feature" name="buffer-center" value="feature" checked>
                    <label for="center-feature">Selected Feature: ${feature.properties.name || 'Unnamed Feature'}</label>
                </div>
            `;
        }
    }
    
    contentHTML += `
                <div class="center-option ${!featureId ? 'selected' : ''}">
                    <input type="radio" id="center-click" name="buffer-center" value="click" ${!featureId ? 'checked' : ''}>
                    <label for="center-click">Click on Map</label>
                </div>
                <div class="center-option">
                    <input type="radio" id="center-location" name="buffer-center" value="location">
                    <label for="center-location">Current Location</label>
                </div>
            </div>
        </div>
        
        <div class="form-group">
            <label for="buffer-radius">Buffer Radius: <span id="radius-value">${currentBufferRadius}</span> meters</label>
            <input type="range" id="buffer-radius" min="${CONFIG.analysis.buffer.minRadius}" max="${CONFIG.analysis.buffer.maxRadius}" step="100" value="${currentBufferRadius}">
        </div>
        
        <div class="form-group">
            <label for="buffer-type">Filter Results by Type:</label>
            <select id="buffer-type">
                <option value="All">All Types</option>
    `;
    
    // Add options for each infrastructure type
    Object.keys(CONFIG.infrastructureTypes).forEach(typeKey => {
        const typeConfig = CONFIG.infrastructureTypes[typeKey];
        contentHTML += `<option value="${typeKey}">${typeConfig.name}</option>`;
    });
    
    contentHTML += `
            </select>
        </div>
        
        <button id="run-buffer-analysis" class="analysis-run-btn">Run Buffer Analysis</button>
    </div>
    `;
    
    analysisContent.innerHTML = contentHTML;
    analysisPanel.classList.remove('hidden');
    
    // Add event listeners to buffer controls
    document.getElementById('buffer-radius').addEventListener('input', function() {
        currentBufferRadius = parseInt(this.value);
        document.getElementById('radius-value').textContent = currentBufferRadius;
    });
    
    document.getElementById('run-buffer-analysis').addEventListener('click', runBufferAnalysis);
    
    // If click on map is selected, set up map click handler
    if (!featureId) {
        setupMapClickHandler();
    }
}

// Set up map click handler for selecting buffer center
function setupMapClickHandler() {
    // Remove any existing click handlers
    map.off('click', onMapClick);
    
    // Clear any existing drawn items
    drawnItems.clearLayers();
    
    // Add new click handler
    map.on('click', onMapClick);
    
    // Show instruction message
    const message = L.DomUtil.create('div', 'map-click-message');
    message.id = 'map-click-message';
    message.innerHTML = 'Click on the map to set buffer center';
    document.getElementById('map-container').appendChild(message);
}

// Handle map click for buffer center selection
function onMapClick(e) {
    // Remove instruction message
    const message = document.getElementById('map-click-message');
    if (message) {
        message.remove();
    }
    
    // Clear any existing drawn items
    drawnItems.clearLayers();
    
    // Add marker at clicked location
    const marker = L.marker(e.latlng).addTo(drawnItems);
    
    // Store the latlng for buffer analysis
    window.bufferCenter = e.latlng;
    
    // Remove click handler
    map.off('click', onMapClick);
}

// Run buffer analysis
function runBufferAnalysis() {
    // Clear any existing analysis layers
    clearAnalysisLayers();
    
    // Get buffer parameters
    const centerType = document.querySelector('input[name="buffer-center"]:checked').value;
    const radius = currentBufferRadius;
    const typeFilter = document.getElementById('buffer-type').value;
    
    let bufferCenter;
    
    // Determine buffer center based on selected option
    if (centerType === 'feature' && currentAnalysisFeatureId) {
        const feature = window.dataFunctions.getFeatureById(currentAnalysisFeatureId);
        if (!feature) {
            alert('Selected feature not found.');
            return;
        }
        
        // Use feature centroid or first coordinate
        if (feature.geometry.type === 'Point') {
            bufferCenter = L.latLng(
                feature.geometry.coordinates[1],
                feature.geometry.coordinates[0]
            );
        } else {
            // For non-point features, use turf.js to find centroid
            const centroid = turf.centroid(feature);
            bufferCenter = L.latLng(
                centroid.geometry.coordinates[1],
                centroid.geometry.coordinates[0]
            );
        }
    } else if (centerType === 'click') {
        if (!window.bufferCenter) {
            alert('Please click on the map to set a buffer center.');
            setupMapClickHandler();
            return;
        }
        bufferCenter = window.bufferCenter;
    } else if (centerType === 'location') {
        // Use geolocation
        map.locate({setView: false, maxZoom: 16, enableHighAccuracy: true});
        
        map.once('locationfound', function(e) {
            bufferCenter = e.latlng;
            continueBufferAnalysis(bufferCenter, radius, typeFilter);
        });
        
        map.once('locationerror', function(e) {
            alert('Location access denied or unavailable. ' + e.message);
        });
        
        return; // Will continue after location is found
    }
    
    continueBufferAnalysis(bufferCenter, radius, typeFilter);
}

// Continue buffer analysis with center point
function continueBufferAnalysis(center, radius, typeFilter) {
    // Create buffer using turf.js
    const point = turf.point([center.lng, center.lat]);
    const buffered = turf.buffer(point, radius / 1000, {units: 'kilometers'});
    
    // Create buffer layer
    analysisLayers.buffer = L.geoJSON(buffered, {
        style: {
            color: '#3388ff',
            weight: 2,
            opacity: 0.8,
            fillColor: '#3388ff',
            fillOpacity: 0.2
        }
    }).addTo(map);
    
    // Find features within buffer
    const allFeatures = window.dataFunctions.filterInfrastructureData({
        type: typeFilter !== 'All' ? CONFIG.infrastructureTypes[typeFilter].name : 'All'
    });
    
    const featuresInBuffer = allFeatures.filter(feature => {
        return turf.booleanIntersects(buffered, feature);
    });
    
    // Create results layer
    if (featuresInBuffer.length > 0) {
        const resultsCollection = {
            type: 'FeatureCollection',
            features: featuresInBuffer
        };
        
        analysisLayers.results = L.geoJSON(resultsCollection, {
            pointToLayer: function(feature, latlng) {
                const typeKey = feature.properties.typeKey;
                const typeConfig = CONFIG.infrastructureTypes[typeKey];
                
                return L.marker(latlng, {
                    icon: L.divIcon({
                        html: `<i class="fas fa-${typeConfig.icon}" style="color: ${typeConfig.color}"></i>`,
                        className: 'feature-icon',
                        iconSize: [30, 30],
                        iconAnchor: [15, 15]
                    })
                });
            },
            style: function(feature) {
                const typeKey = feature.properties.typeKey;
                const typeConfig = CONFIG.infrastructureTypes[typeKey];
                
                return {
                    color: typeConfig.color,
                    weight: 3,
                    opacity: 0.8,
                    fillColor: typeConfig.color,
                    fillOpacity: 0.3
                };
            },
            onEachFeature: function(feature, layer) {
                // Bind popup with basic info
                const props = feature.properties;
                const popupContent = `
                    <div class="feature-popup">
                        <h3>${props.name || "Unnamed Feature"}</h3>
                        <p>${props.description || ""}</p>
                        <button class="popup-details-btn" data-id="${props.id}">View Details</button>
                    </div>
                `;
                layer.bindPopup(popupContent);
            }
        }).addTo(map);
    }
    
    // Display results
    displayAnalysisResults(featuresInBuffer);
    
    // Enable export button
    const exportButton = document.getElementById('export-results');
    exportButton.classList.remove('disabled');
    exportButton.addEventListener('click', function() {
        exportAnalysisResults(featuresInBuffer);
    });
    
    // Fit map to buffer
    map.fitBounds(analysisLayers.buffer.getBounds());
}

// Start intersection analysis
function startIntersectionAnalysis() {
    // Set current analysis type
    currentAnalysisType = 'intersection';
    
    // Show analysis panel
    const analysisPanel = document.getElementById('analysis-panel');
    const analysisTitle = document.getElementById('analysis-title');
    const analysisContent = document.getElementById('analysis-content');
    
    analysisTitle.textContent = 'Intersection Analysis';
    
    // Create intersection analysis controls
    let contentHTML = `
        <div class="analysis-form">
            <div class="form-group">
                <label>Draw Area on Map:</label>
                <button id="start-drawing" class="draw-btn">
                    <i class="fas fa-draw-polygon"></i> Draw Polygon
                </button>
            </div>
            
            <div class="form-group">
                <label for="intersection-type">Filter Results by Type:</label>
                <select id="intersection-type">
                    <option value="All">All Types</option>
    `;
    
    // Add options for each infrastructure type
    Object.keys(CONFIG.infrastructureTypes).forEach(typeKey => {
        const typeConfig = CONFIG.infrastructureTypes[typeKey];
        contentHTML += `<option value="${typeKey}">${typeConfig.name}</option>`;
    });
    
    contentHTML += `
                </select>
            </div>
            
            <button id="run-intersection-analysis" class="analysis-run-btn" disabled>Run Intersection Analysis</button>
        </div>
    `;
    
    analysisContent.innerHTML = contentHTML;
    analysisPanel.classList.remove('hidden');
    
    // Add event listener to drawing button
    document.getElementById('start-drawing').addEventListener('click', startDrawing);
    
    // Add event listener to run analysis button
    document.getElementById('run-intersection-analysis').addEventListener('click', runIntersectionAnalysis);
}

// Start drawing polygon for intersection analysis
function startDrawing() {
    // Clear any existing drawn items
    drawnItems.clearLayers();
    
    // Remove any existing draw control
    if (drawControl) {
        map.removeControl(drawControl);
    }
    
    // Add draw control
    drawControl = new L.Control.Draw({
        draw: {
            polyline: false,
            polygon: {
                allowIntersection: false,
                drawError: {
                    color: '#e1e100',
                    message: '<strong>Error:</strong> Polygon edges cannot cross!'
                },
                shapeOptions: {
                    color: '#3388ff'
                }
            },
            circle: false,
            rectangle: true,
            marker: false,
            circlemarker: false
        },
        edit: {
            featureGroup: drawnItems
        }
    });
    
    map.addControl(drawControl);
    
    // Handle created layers
    map.on(L.Draw.Event.CREATED, function(e) {
        const layer = e.layer;
        drawnItems.addLayer(layer);
        
        // Enable run analysis button
        document.getElementById('run-intersection-analysis').disabled = false;
    });
    
    // Handle deleted layers
    map.on(L.Draw.Event.DELETED, function(e) {
        if (drawnItems.getLayers().length === 0) {
            // Disable run analysis button if no layers
            document.getElementById('run-intersection-analysis').disabled = true;
        }
    });
    
    // Show instruction message
    const message = L.DomUtil.create('div', 'map-draw-message');
    message.id = 'map-draw-message';
    message.innerHTML = 'Use the drawing tools to create a polygon or rectangle';
    document.getElementById('map-container').appendChild(message);
}

// Run intersection analysis
function runIntersectionAnalysis() {
    // Clear any existing analysis layers except drawn items
    if (analysisLayers.buffer) {
        map.removeLayer(analysisLayers.buffer);
        analysisLayers.buffer = null;
    }
    
    if (analysisLayers.results) {
        map.removeLayer(analysisLayers.results);
        analysisLayers.results = null;
    }
    
    // Get drawn polygon
    if (drawnItems.getLayers().length === 0) {
        alert('Please draw an area on the map first.');
        return;
    }
    
    // Get the drawn layer
    const drawnLayer = drawnItems.getLayers()[0];
    
    // Convert to GeoJSON
    const drawnGeoJSON = drawnLayer.toGeoJSON();
    
    // Get type filter
    const typeFilter = document.getElementById('intersection-type').value;
    
    // Find features that intersect with the drawn polygon
    const allFeatures = window.dataFunctions.filterInfrastructureData({
        type: typeFilter !== 'All' ? CONFIG.infrastructureTypes[typeFilter].name : 'All'
    });
    
    const intersectingFeatures = allFeatures.filter(feature => {
        return turf.booleanIntersects(drawnGeoJSON, feature);
    });
    
    // Create results layer
    if (intersectingFeatures.length > 0) {
        const resultsCollection = {
            type: 'FeatureCollection',
            features: intersectingFeatures
        };
        
        analysisLayers.results = L.geoJSON(resultsCollection, {
            pointToLayer: function(feature, latlng) {
                const typeKey = feature.properties.typeKey;
                const typeConfig = CONFIG.infrastructureTypes[typeKey];
                
                return L.marker(latlng, {
                    icon: L.divIcon({
                        html: `<i class="fas fa-${typeConfig.icon}" style="color: ${typeConfig.color}"></i>`,
                        className: 'feature-icon',
                        iconSize: [30, 30],
                        iconAnchor: [15, 15]
                    })
                });
            },
            style: function(feature) {
                const typeKey = feature.properties.typeKey;
                const typeConfig = CONFIG.infrastructureTypes[typeKey];
                
                return {
                    color: typeConfig.color,
                    weight: 3,
                    opacity: 0.8,
                    fillColor: typeConfig.color,
                    fillOpacity: 0.3
                };
            },
            onEachFeature: function(feature, layer) {
                // Bind popup with basic info
                const props = feature.properties;
                const popupContent = `
                    <div class="feature-popup">
                        <h3>${props.name || "Unnamed Feature"}</h3>
                        <p>${props.description || ""}</p>
                        <button class="popup-details-btn" data-id="${props.id}">View Details</button>
                    </div>
                `;
                layer.bindPopup(popupContent);
            }
        }).addTo(map);
    }
    
    // Display results
    displayAnalysisResults(intersectingFeatures);
    
    // Enable export button
    const exportButton = document.getElementById('export-results');
    exportButton.classList.remove('disabled');
    exportButton.addEventListener('click', function() {
        exportAnalysisResults(intersectingFeatures);
    });
    
    // Remove draw control
    if (drawControl) {
        map.removeControl(drawControl);
        drawControl = null;
    }
    
    // Remove instruction message
    const message = document.getElementById('map-draw-message');
    if (message) {
        message.remove();
    }
}

// Display analysis results
function displayAnalysisResults(features) {
    const resultsContainer = document.getElementById('analysis-results');
    
    // Clear previous results
    resultsContainer.innerHTML = '';
    
    // If no results, show message
    if (features.length === 0) {
        resultsContainer.innerHTML = '<p>No features found in the selected area.</p>';
        return;
    }
    
    // Show results count
    resultsContainer.innerHTML = `<p>Found ${features.length} features in the selected area:</p>`;
    
    // Group features by type
    const featuresByType = {};
    
    features.forEach(feature => {
        const typeKey = feature.properties.typeKey;
        if (!featuresByType[typeKey]) {
            featuresByType[typeKey] = [];
        }
        featuresByType[typeKey].push(feature);
    });
    
    // Create results list grouped by type
    const resultsList = document.createElement('div');
    resultsList.className = 'results-by-type';
    
    Object.keys(featuresByType).forEach(typeKey => {
        const typeFeatures = featuresByType[typeKey];
        const typeConfig = CONFIG.infrastructureTypes[typeKey];
        
        const typeGroup = document.createElement('div');
        typeGroup.className = 'type-group';
        
        const typeHeader = document.createElement('div');
        typeHeader.className = 'type-header';
        typeHeader.innerHTML = `
            <div class="type-icon" style="color: ${typeConfig.color}">
                <i class="fas fa-${typeConfig.icon}"></i>
            </div>
            <div class="type-name">${typeConfig.name} (${typeFeatures.length})</div>
        `;
        
        typeGroup.appendChild(typeHeader);
        
        // Create list of features
        const featureList = document.createElement('ul');
        featureList.className = 'feature-list';
        
        typeFeatures.forEach(feature => {
            const props = feature.properties;
            
            const listItem = document.createElement('li');
            listItem.className = 'feature-item';
            listItem.textContent = props.name || 'Unnamed Feature';
            
            // Add click event to zoom to feature
            listItem.addEventListener('click', function() {
                window.layerFunctions.zoomToFeature(props.id);
                window.layerFunctions.showFeatureDetails(props.id);
            });
            
            featureList.appendChild(listItem);
        });
        
        typeGroup.appendChild(featureList);
        resultsList.appendChild(typeGroup);
    });
    
    resultsContainer.appendChild(resultsList);
}

// Export analysis results
function exportAnalysisResults(features) {
    if (features.length === 0) {
        alert('No features to export.');
        return;
    }
    
    // Create GeoJSON feature collection
    const featureCollection = {
        type: 'FeatureCollection',
        features: features
    };
    
    // Convert to string
    const geoJSONString = JSON.stringify(featureCollection, null, 2);
    
    // Create blob and download link
    const blob = new Blob([geoJSONString], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `rgin_analysis_results_${new Date().toISOString().slice(0, 10)}.geojson`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}

// Clear analysis layers
function clearAnalysisLayers() {
    // Remove buffer layer
    if (analysisLayers.buffer) {
        map.removeLayer(analysisLayers.buffer);
        analysisLayers.buffer = null;
    }
    
    // Remove intersection layer
    if (analysisLayers.intersection) {
        map.removeLayer(analysisLayers.intersection);
        analysisLayers.intersection = null;
    }
    
    // Remove results layer
    if (analysisLayers.results) {
        map.removeLayer(analysisLayers.results);
        analysisLayers.results = null;
    }
    
    // Clear drawn items
    drawnItems.clearLayers();
    
    // Remove draw control if exists
    if (drawControl) {
        map.removeControl(drawControl);
        drawControl = null;
    }
    
    // Remove any messages
    const clickMessage = document.getElementById('map-click-message');
    if (clickMessage) {
        clickMessage.remove();
    }
    
    const drawMessage = document.getElementById('map-draw-message');
    if (drawMessage) {
        drawMessage.remove();
    }
}

// Close analysis panel
function closeAnalysisPanel() {
    // Hide panel
    document.getElementById('analysis-panel').classList.add('hidden');
    
    // Clear analysis layers
    clearAnalysisLayers();
    
    // Remove map click handler
    map.off('click', onMapClick);
    
    // Reset current analysis type
    currentAnalysisType = null;
    currentAnalysisFeatureId = null;
}

// Export analysis functions
window.analysisFunctions = {
    initAnalysis,
    startBufferAnalysis,
    startIntersectionAnalysis,
    clearAnalysisLayers,
    closeAnalysisPanel
};
