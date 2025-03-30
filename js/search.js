// Search functionality for the RGIN web map application

// Initialize search functionality
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    
    // Add event listener for search button
    searchButton.addEventListener('click', function() {
        performSearch(searchInput.value);
    });
    
    // Add event listener for enter key in search input
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch(this.value);
        }
    });
}

// Perform search based on input value
function performSearch(searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
        return;
    }
    
    // Update active filters with search term
    activeFilters.searchTerm = searchTerm.trim();
    
    // Update layers based on new filter
    window.layerFunctions.updateLayers();
    
    // Show search results count
    const filteredFeatures = window.dataFunctions.filterInfrastructureData(activeFilters);
    showSearchResults(filteredFeatures, searchTerm);
}

// Display search results
function showSearchResults(features, searchTerm) {
    // Create a temporary container for search results
    let searchResultsContainer = document.getElementById('search-results');
    
    // If it doesn't exist, create it
    if (!searchResultsContainer) {
        searchResultsContainer = document.createElement('div');
        searchResultsContainer.id = 'search-results';
        searchResultsContainer.className = 'search-results';
        
        // Insert after search container
        const searchContainer = document.getElementById('search-container');
        searchContainer.parentNode.insertBefore(searchResultsContainer, searchContainer.nextSibling);
    }
    
    // Clear previous results
    searchResultsContainer.innerHTML = '';
    
    // If no results, show message
    if (features.length === 0) {
        searchResultsContainer.innerHTML = `
            <div class="search-results-header">
                <p>No results found for "${searchTerm}"</p>
                <button id="clear-search" class="clear-search-btn">
                    <i class="fas fa-times"></i> Clear Search
                </button>
            </div>
        `;
    } else {
        // Show results count and clear button
        searchResultsContainer.innerHTML = `
            <div class="search-results-header">
                <p>Found ${features.length} results for "${searchTerm}"</p>
                <button id="clear-search" class="clear-search-btn">
                    <i class="fas fa-times"></i> Clear Search
                </button>
            </div>
        `;
        
        // If there are many results, show only the first 10
        const displayFeatures = features.length > 10 ? features.slice(0, 10) : features;
        
        // Create results list
        const resultsList = document.createElement('ul');
        resultsList.className = 'search-results-list';
        
        // Add each result to the list
        displayFeatures.forEach(feature => {
            const props = feature.properties;
            const typeKey = props.typeKey;
            const typeConfig = CONFIG.infrastructureTypes[typeKey];
            
            const listItem = document.createElement('li');
            listItem.className = 'search-result-item';
            listItem.innerHTML = `
                <div class="result-icon" style="color: ${typeConfig.color}">
                    <i class="fas fa-${typeConfig.icon}"></i>
                </div>
                <div class="result-info">
                    <div class="result-name">${props.name || "Unnamed Feature"}</div>
                    <div class="result-type">${typeConfig.name}</div>
                </div>
            `;
            
            // Add click event to zoom to feature
            listItem.addEventListener('click', function() {
                window.layerFunctions.zoomToFeature(props.id);
                window.layerFunctions.showFeatureDetails(props.id);
            });
            
            resultsList.appendChild(listItem);
        });
        
        searchResultsContainer.appendChild(resultsList);
        
        // If there are more results, show a message
        if (features.length > 10) {
            const moreResults = document.createElement('div');
            moreResults.className = 'more-results';
            moreResults.textContent = `Showing 10 of ${features.length} results. Refine your search for more specific results.`;
            searchResultsContainer.appendChild(moreResults);
        }
    }
    
    // Add event listener for clear search button
    document.getElementById('clear-search').addEventListener('click', clearSearch);
}

// Clear search results and reset filters
function clearSearch() {
    // Clear search input
    document.getElementById('search-input').value = '';
    
    // Remove search term from filters
    activeFilters.searchTerm = '';
    
    // Update layers
    window.layerFunctions.updateLayers();
    
    // Remove search results container
    const searchResultsContainer = document.getElementById('search-results');
    if (searchResultsContainer) {
        searchResultsContainer.remove();
    }
}

// Export search functions
window.searchFunctions = {
    initSearch,
    performSearch,
    clearSearch
};
