// Data handling functions for the RGIN web map application

// Global variables to store loaded data
let infrastructureData = null;
let countiesData = null;

// Load all required data
async function loadData() {
    try {
        // Load infrastructure data
        const infraResponse = await fetch(CONFIG.dataSources.infrastructure);
        if (!infraResponse.ok) {
            throw new Error(`Failed to load infrastructure data: ${infraResponse.status}`);
        }
        infrastructureData = await infraResponse.json();
        
        // Load counties data
        const countiesResponse = await fetch(CONFIG.dataSources.counties);
        if (!countiesResponse.ok) {
            throw new Error(`Failed to load counties data: ${countiesResponse.status}`);
        }
        countiesData = await countiesResponse.json();
        
        // Process and prepare data
        processInfrastructureData();
        
        return {
            infrastructure: infrastructureData,
            counties: countiesData
        };
    } catch (error) {
        console.error("Error loading data:", error);
        alert("Failed to load map data. Please try refreshing the page.");
        return null;
    }
}

// Process infrastructure data to ensure it has all required properties
function processInfrastructureData() {
    if (!infrastructureData || !infrastructureData.features) {
        return;
    }
    
    // Add a unique ID to each feature if not present
    infrastructureData.features.forEach((feature, index) => {
        if (!feature.properties.id) {
            feature.properties.id = `infra_${index}`;
        }
        
        // Ensure all features have a type property
        if (!feature.properties.type) {
            // Try to determine type from other properties
            if (feature.properties.category) {
                feature.properties.type = feature.properties.category;
            } else {
                feature.properties.type = "unknown";
            }
        }
        
        // Normalize type values to match our configuration
        feature.properties.typeKey = normalizeTypeValue(feature.properties.type);
    });
}

// Normalize type values to match our configuration keys
function normalizeTypeValue(typeValue) {
    const typeValue_lower = typeValue.toLowerCase();
    
    if (typeValue_lower.includes("park") || typeValue_lower.includes("recreation")) {
        return "parks";
    } else if (typeValue_lower.includes("trail") || typeValue_lower.includes("greenway") || typeValue_lower.includes("path")) {
        return "trails";
    } else if (typeValue_lower.includes("wetland") || typeValue_lower.includes("water") || typeValue_lower.includes("lake") || typeValue_lower.includes("river")) {
        return "wetlands";
    } else if (typeValue_lower.includes("corridor") || typeValue_lower.includes("connection")) {
        return "corridors";
    } else if (typeValue_lower.includes("conservation") || typeValue_lower.includes("preserve") || typeValue_lower.includes("protected")) {
        return "conservation";
    } else {
        return "parks"; // Default to parks if unknown
    }
}

// Filter infrastructure data based on criteria
function filterInfrastructureData(filters = {}) {
    if (!infrastructureData || !infrastructureData.features) {
        return [];
    }
    
    return infrastructureData.features.filter(feature => {
        const props = feature.properties;
        
        // Filter by county
        if (filters.county && filters.county !== "All") {
            if (!props.county || !props.county.includes(filters.county)) {
                return false;
            }
        }
        
        // Filter by type
        if (filters.type && filters.type !== "All") {
            const typeKey = normalizeTypeValue(props.type);
            const filterTypeKey = Object.keys(CONFIG.infrastructureTypes).find(key => 
                CONFIG.infrastructureTypes[key].name === filters.type
            );
            
            if (typeKey !== filterTypeKey) {
                return false;
            }
        }
        
        // Filter by conservation status
        if (filters.status && filters.status !== "All") {
            if (!props.status || props.status !== filters.status) {
                return false;
            }
        }
        
        // Filter by search term
        if (filters.searchTerm && filters.searchTerm.length > 0) {
            const searchTerm = filters.searchTerm.toLowerCase();
            const nameMatch = props.name && props.name.toLowerCase().includes(searchTerm);
            const descMatch = props.description && props.description.toLowerCase().includes(searchTerm);
            
            if (!nameMatch && !descMatch) {
                return false;
            }
        }
        
        return true;
    });
}

// Get a feature by ID
function getFeatureById(id) {
    if (!infrastructureData || !infrastructureData.features) {
        return null;
    }
    
    return infrastructureData.features.find(feature => 
        feature.properties.id === id
    );
}

// Get counties data
function getCountiesData() {
    return countiesData;
}

// Export data functions
window.dataFunctions = {
    loadData,
    filterInfrastructureData,
    getFeatureById,
    getCountiesData
};
