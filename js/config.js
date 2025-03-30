// Configuration settings for the RGIN web map application

const CONFIG = {
    // Map configuration
    map: {
        center: [41.4822, -83.6952], // Center on Northwest Ohio (Toledo area)
        zoom: 9,
        minZoom: 7,
        maxZoom: 18,
        maxBounds: [
            [40.5, -85.0], // Southwest corner
            [42.5, -82.0]  // Northeast corner
        ]
    },
    
    // Basemap layers
    basemaps: {
        osm: {
            name: "OpenStreetMap",
            url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        },
        satellite: {
            name: "Satellite",
            url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        },
        terrain: {
            name: "Terrain",
            url: "https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png",
            attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
    },
    
    // Counties in the study area
    counties: ["Wood", "Lucas", "Ottawa"],
    
    // Infrastructure types with colors
    infrastructureTypes: {
        parks: {
            name: "Parks & Recreation Areas",
            color: "#27ae60",
            icon: "tree"
        },
        trails: {
            name: "Trails & Greenways",
            color: "#8e44ad",
            icon: "hiking"
        },
        wetlands: {
            name: "Wetlands & Water Features",
            color: "#3498db",
            icon: "water"
        },
        corridors: {
            name: "Ecological Corridors",
            color: "#f39c12",
            icon: "leaf"
        },
        conservation: {
            name: "Conservation Areas",
            color: "#16a085",
            icon: "seedling"
        }
    },
    
    // Filter categories
    filters: {
        county: {
            name: "County",
            options: ["All", "Wood", "Lucas", "Ottawa"]
        },
        type: {
            name: "Infrastructure Type",
            options: ["All", "Parks & Recreation", "Trails & Greenways", "Wetlands", "Ecological Corridors", "Conservation Areas"]
        },
        status: {
            name: "Conservation Status",
            options: ["All", "Protected", "Unprotected", "Partially Protected"]
        }
    },
    
    // Analysis tools settings
    analysis: {
        buffer: {
            minRadius: 100,  // meters
            maxRadius: 5000, // meters
            defaultRadius: 1000 // meters
        }
    },
    
    // Data sources
    dataSources: {
        infrastructure: "data/infrastructure.geojson",
        counties: "data/counties.geojson"
    }
};
