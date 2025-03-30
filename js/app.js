// Main application initialization for the RGIN web map application

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Initialize the map
        window.mapFunctions.initMap();
        
        // Load data
        const data = await window.dataFunctions.loadData();
        if (!data) {
            throw new Error('Failed to load data');
        }
        
        // Initialize layers
        await window.layerFunctions.initLayers();
        
        // Initialize search functionality
        window.searchFunctions.initSearch();
        
        // Initialize filters
        window.filterFunctions.initFilters();
        
        // Initialize analysis tools
        window.analysisFunctions.initAnalysis();
        
        // Add event listeners
        addEventListeners();
        
        // Hide loading indicator if exists
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.classList.add('hidden');
        }
        
        console.log('RGIN web map application initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
        alert('There was an error initializing the application. Please try refreshing the page.');
    }
});

// Add global event listeners
function addEventListeners() {
    // Close feature info panel when clicking outside
    document.addEventListener('click', function(e) {
        const featureInfo = document.getElementById('feature-info');
        const clickedInsideFeatureInfo = featureInfo.contains(e.target);
        const clickedOnPopup = e.target.closest('.leaflet-popup');
        
        if (!clickedInsideFeatureInfo && !clickedOnPopup && !featureInfo.classList.contains('hidden')) {
            featureInfo.classList.add('hidden');
        }
    });
    
    // Close button for feature info panel
    document.getElementById('close-feature-info').addEventListener('click', function() {
        document.getElementById('feature-info').classList.add('hidden');
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        // Adjust UI for mobile/desktop
        adjustForScreenSize();
    });
    
    // Initial adjustment for screen size
    adjustForScreenSize();
}

// Adjust UI based on screen size
function adjustForScreenSize() {
    const isMobile = window.innerWidth < 768;
    const sidebar = document.getElementById('sidebar');
    
    if (isMobile) {
        // Mobile adjustments
        sidebar.classList.add('mobile');
        
        // Create toggle button for sidebar if it doesn't exist
        if (!document.getElementById('sidebar-toggle')) {
            const toggleButton = document.createElement('button');
            toggleButton.id = 'sidebar-toggle';
            toggleButton.className = 'sidebar-toggle';
            toggleButton.innerHTML = '<i class="fas fa-bars"></i>';
            
            toggleButton.addEventListener('click', function() {
                sidebar.classList.toggle('expanded');
                this.innerHTML = sidebar.classList.contains('expanded') 
                    ? '<i class="fas fa-times"></i>' 
                    : '<i class="fas fa-bars"></i>';
            });
            
            document.getElementById('map-container').appendChild(toggleButton);
        }
    } else {
        // Desktop adjustments
        sidebar.classList.remove('mobile');
        sidebar.classList.remove('expanded');
        
        // Remove toggle button if exists
        const toggleButton = document.getElementById('sidebar-toggle');
        if (toggleButton) {
            toggleButton.remove();
        }
    }
}

// Handle errors
window.onerror = function(message, source, lineno, colno, error) {
    console.error('Global error:', message, source, lineno, colno, error);
    
    // Show error message to user for critical errors
    if (!document.getElementById('error-message')) {
        const errorDiv = document.createElement('div');
        errorDiv.id = 'error-message';
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="error-content">
                <h3>An error occurred</h3>
                <p>Something went wrong with the application. Try refreshing the page.</p>
                <button id="dismiss-error">Dismiss</button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        document.getElementById('dismiss-error').addEventListener('click', function() {
            errorDiv.remove();
        });
    }
    
    return false;
};
