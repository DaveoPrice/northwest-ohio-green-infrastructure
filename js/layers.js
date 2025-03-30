// Layer management for the RGIN web map application

// Global variables for layers
let infrastructureLayers = {};
let countyLayer = null;
let clusterGroups = {};
let activeFilters = {
    county: "All",
    type: "All",
    status: "All",
    searchTerm: ""
};

// Initialize all map layers
async function initLayers() {
    // Create county boundaries layer
    createCountyLayer();
    
    // Create infrastructure layers
    createInfrastructureLayers();
    
    // Initialize layer controls in the sidebar
    initLayerControls();
}

// Create county boundaries layer
function createCountyLayer() {
    const countiesData = window.dataFunctions.getCountiesData();
    
    if (!countiesData) {
        console.error("Counties data not available");
        return;
    }
    
    countyLayer = L.geoJSON(countiesData, {
        style: {
            color: "#7f8c8d",
            weight: 2,
            opacity: 0.7,
            fillColor: "#ecf0f1",
            fillOpacity: 0.1
        },
        onEachFeature: function(feature, layer) {
            if (feature.properties && feature.properties.name) {
                layer.bindTooltip(feature.properties.name, {
                    permanent: false,
                    direction: "center",
                    className: "county-tooltip"
                });
            }
        }
    });
    
    // Add county layer to the map
    countyLayer.addTo(map);
    
    // Add to overlay layers control
    overlayLayers["County Boundaries"] = countyLayer;
    layerControl.addOverlay(countyLayer, "County Boundaries");
}

// Create infrastructure layers grouped by type
function createInfrastructureLayers() {
    // Clear existing layers
    Object.keys(infrastructureLayers).forEach(key => {
        if (map.hasLayer(infrastructureLayers[key])) {
            map.removeLayer(infrastructureLayers[key]);
        }
        if (layerControl) {
            layerControl.removeLayer(infrastructureLayers[key]);
        }
    });
    
    infrastructureLayers = {};
    clusterGroups = {};
    
    // Get filtered data
    const filteredFeatures = window.dataFunctions.filterInfrastructureData(activeFilters);
    
    // Group features by type
    const featuresByType = {};
    
    Object.keys(CONFIG.infrastructureTypes).forEach(typeKey => {
        featuresByType[typeKey] = [];
    });
    
    filteredFeatures.forEach(feature => {
        const typeKey = feature.properties.typeKey;
        if (featuresByType[typeKey]) {
            featuresByType[typeKey].push(feature);
        }
    });
    
    // Create a layer for each type
    Object.keys(CONFIG.infrastructureTypes).forEach(typeKey => {
        const typeConfig = CONFIG.infrastructureTypes[typeKey];
        const features = featuresByType[typeKey];
        
        // Create a GeoJSON feature collection
        const featureCollection = {
            type: "FeatureCollection",
            features: features
        };
        
        // Create a cluster group for this type
        clusterGroups[typeKey] = L.markerClusterGroup({
            showCoverageOnHover: false,
            maxClusterRadius: 50,
            iconCreateFunction: function(cluster) {
                return L.divIcon({
                    html: `<div class="cluster-icon" style="background-color: ${typeConfig.color}">${cluster.getChildCount()}</div>`,
                    className: 'marker-cluster',
                    iconSize: L.point(40, 40)
                });
            }
        });
        
        // Create the GeoJSON layer
        const layer = L.geoJSON(featureCollection, {
            pointToLayer: function(feature, latlng) {
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
                
                // Add click handler to show feature details
                layer.on('click', function() {
                    // The popup will show automatically
                });
                
                // Store the feature ID on the layer for reference
                layer.feature_id = props.id;
            }
        });
        
        // Add the layer to the cluster group
        clusterGroups[typeKey].addLayer(layer);
        
        // Store the layer
        infrastructureLayers[typeKey] = clusterGroups[typeKey];
        
        // Add to map if it should be visible
        if (document.getElementById(`layer-${typeKey}`) && document.getElementById(`layer-${typeKey}`).checked) {
            map.addLayer(clusterGroups[typeKey]);
        }
        
        // Add to layer control
        overlayLayers[typeConfig.name] = clusterGroups[typeKey];
        layerControl.addOverlay(clusterGroups[typeKey], typeConfig.name);
    });
    
    // Add popup detail button click handler
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('popup-details-btn')) {
            const featureId = e.target.getAttribute('data-id');
            showFeatureDetails(featureId);
        }
    });
}

// Initialize layer controls in the sidebar
function initLayerControls() {
    const layerControlsContainer = document.getElementById('layer-controls');
    layerControlsContainer.innerHTML = '';
    
    // Add layer controls for each infrastructure type
    Object.keys(CONFIG.infrastructureTypes).forEach(typeKey => {
        const typeConfig = CONFIG.infrastructureTypes[typeKey];
        
        const layerControl = document.createElement('div');
        layerControl.className = 'layer-control';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `layer-${typeKey}`;
        checkbox.checked = true; // Default to visible
        
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                if (infrastructureLayers[typeKey]) {
                    map.addLayer(infrastructureLayers[typeKey]);
                }
            } else {
                if (infrastructureLayers[typeKey]) {
                    map.removeLayer(infrastructureLayers[typeKey]);
                }
            }
        });
        
        const colorSpan = document.createElement('span');
        colorSpan.className = 'layer-color';
        colorSpan.style.backgroundColor = typeConfig.color;
        
        const label = document.createElement('label');
        label.htmlFor = `layer-${typeKey}`;
        label.appendChild(document.createTextNode(typeConfig.name));
        
        layerControl.appendChild(checkbox);
        layerControl.appendChild(colorSpan);
        layerControl.appendChild(label);
        
        layerControlsContainer.appendChild(layerControl);
    });
    
    // Add county layer control
    const countyLayerControl = document.createElement('div');
    countyLayerControl.className = 'layer-control';
    
    const countyCheckbox = document.createElement('input');
    countyCheckbox.type = 'checkbox';
    countyCheckbox.id = 'layer-counties';
    countyCheckbox.checked = true; // Default to visible
    
    countyCheckbox.addEventListener('change', function() {
        if (this.checked) {
            if (countyLayer) {
                map.addLayer(countyLayer);
            }
        } else {
            if (countyLayer) {
                map.removeLayer(countyLayer);
            }
        }
    });
    
    const countyColorSpan = document.createElement('span');
    countyColorSpan.className = 'layer-color';
    countyColorSpan.style.backgroundColor = '#7f8c8d';
    
    const countyLabel = document.createElement('label');
    countyLabel.htmlFor = 'layer-counties';
    countyLabel.appendChild(document.createTextNode('County Boundaries'));
    
    countyLayerControl.appendChild(countyCheckbox);
    countyLayerControl.appendChild(countyColorSpan);
    countyLayerControl.appendChild(countyLabel);
    
    layerControlsContainer.appendChild(countyLayerControl);
    
    // Initialize legend
    initLegend();
}

// Initialize the map legend
function initLegend() {
    const legendContainer = document.getElementById('map-legend');
    legendContainer.innerHTML = '';
    
    // Add legend items for each infrastructure type
    Object.keys(CONFIG.infrastructureTypes).forEach(typeKey => {
        const typeConfig = CONFIG.infrastructureTypes[typeKey];
        
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        
        const colorSpan = document.createElement('span');
        colorSpan.className = 'legend-color';
        colorSpan.style.backgroundColor = typeConfig.color;
        
        const label = document.createElement('span');
        label.appendChild(document.createTextNode(typeConfig.name));
        
        legendItem.appendChild(colorSpan);
        legendItem.appendChild(label);
        
        legendContainer.appendChild(legendItem);
    });
}

// Show detailed information for a feature
function showFeatureDetails(featureId) {
    const feature = window.dataFunctions.getFeatureById(featureId);
    
    if (!feature) {
        console.error("Feature not found:", featureId);
        return;
    }
    
    const props = feature.properties;
    const typeKey = props.typeKey;
    const typeConfig = CONFIG.infrastructureTypes[typeKey];
    
    // Populate the feature info panel
    const featureInfoPanel = document.getElementById('feature-info');
    const featureTitle = document.getElementById('feature-title');
    const featureContent = document.getElementById('feature-content');
    
    featureTitle.textContent = props.name || "Unnamed Feature";
    
    // Build the content HTML
    let contentHTML = `
        <div class="feature-type">
            <span class="feature-icon" style="color: ${typeConfig.color}">
                <i class="fas fa-${typeConfig.icon}"></i>
            </span>
            <span>${typeConfig.name}</span>
        </div>
    `;
    
    if (props.description) {
        contentHTML += `<div class="feature-description">${props.description}</div>`;
    }
    
    contentHTML += '<div class="feature-properties">';
    
    if (props.county) {
        contentHTML += `<div class="property"><strong>County:</strong> ${props.county}</div>`;
    }
    
    if (props.status) {
        contentHTML += `<div class="property"><strong>Status:</strong> ${props.status}</div>`;
    }
    
    if (props.area) {
        contentHTML += `<div class="property"><strong>Area:</strong> ${props.area} acres</div>`;
    }
    
    if (props.length) {
        contentHTML += `<div class="property"><strong>Length:</strong> ${props.length} miles</div>`;
    }
    
    if (props.managing_entity) {
        contentHTML += `<div class="property"><strong>Managing Entity:</strong> ${props.managing_entity}</div>`;
    }
    
    if (props.year_established) {
        contentHTML += `<div class="property"><strong>Year Established:</strong> ${props.year_established}</div>`;
    }
    
    contentHTML += '</div>';
    
    // Add buttons for analysis
    contentHTML += `
        <div class="feature-actions">
            <button class="action-button buffer-btn" data-id="${featureId}">
                <i class="fas fa-circle"></i> Buffer Analysis
            </button>
            <button class="action-button zoom-btn" data-id="${featureId}">
                <i class="fas fa-search-plus"></i> Zoom to Feature
            </button>
        </div>
    `;
    
    featureContent.innerHTML = contentHTML;
    
    // Show the panel
    featureInfoPanel.classList.remove('hidden');
    
    // Add event listeners for the buttons
    document.querySelector('.buffer-btn').addEventListener('click', function() {
        const featureId = this.getAttribute('data-id');
        window.analysisFunctions.startBufferAnalysis(featureId);
    });
    
    document.querySelector('.zoom-btn').addEventListener('click', function() {
        const featureId = this.getAttribute('data-id');
        zoomToFeature(featureId);
    });
    
    // Add close button event listener
    document.getElementById('close-feature-info').addEventListener('click', function() {
        featureInfoPanel.classList.add('hidden');
    });
}

// Zoom to a specific feature
function zoomToFeature(featureId) {
    const feature = window.dataFunctions.getFeatureById(featureId);
    
    if (!feature) {
        console.error("Feature not found:", featureId);
        return;
    }
    
    // Create a temporary layer for the feature
    const tempLayer = L.geoJSON(feature);
    
    // Fit the map to the feature bounds
    window.mapFunctions.fitMapToLayer(tempLayer);
}

// Update layers based on filter changes
function updateLayers() {
    createInfrastructureLayers();
}

// Export layer functions
window.layerFunctions = {
    initLayers,
    updateLayers,
    showFeatureDetails,
    zoomToFeature
};
