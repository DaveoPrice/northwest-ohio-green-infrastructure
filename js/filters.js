// Filter functionality for the RGIN web map application

// Initialize filter controls
function initFilters() {
    const filterControlsContainer = document.getElementById('filter-controls');
    filterControlsContainer.innerHTML = '';
    
    // Create filter groups for each filter category
    Object.keys(CONFIG.filters).forEach(filterKey => {
        const filterConfig = CONFIG.filters[filterKey];
        
        const filterGroup = document.createElement('div');
        filterGroup.className = 'filter-group';
        
        const label = document.createElement('label');
        label.htmlFor = `filter-${filterKey}`;
        label.textContent = filterConfig.name;
        
        const select = document.createElement('select');
        select.id = `filter-${filterKey}`;
        select.name = filterKey;
        
        // Add options
        filterConfig.options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
        });
        
        // Add change event listener
        select.addEventListener('change', function() {
            updateFilter(filterKey, this.value);
        });
        
        filterGroup.appendChild(label);
        filterGroup.appendChild(select);
        
        filterControlsContainer.appendChild(filterGroup);
    });
    
    // Add apply and reset buttons
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'filter-buttons';
    
    const resetButton = document.createElement('button');
    resetButton.className = 'filter-reset-btn';
    resetButton.textContent = 'Reset Filters';
    resetButton.addEventListener('click', resetFilters);
    
    buttonGroup.appendChild(resetButton);
    filterControlsContainer.appendChild(buttonGroup);
}

// Update a specific filter
function updateFilter(filterKey, value) {
    // Update active filters
    activeFilters[filterKey] = value;
    
    // Update layers based on new filters
    window.layerFunctions.updateLayers();
}

// Reset all filters to default values
function resetFilters() {
    // Reset active filters
    activeFilters = {
        county: "All",
        type: "All",
        status: "All",
        searchTerm: activeFilters.searchTerm // Keep search term
    };
    
    // Reset filter controls
    Object.keys(CONFIG.filters).forEach(filterKey => {
        const select = document.getElementById(`filter-${filterKey}`);
        if (select) {
            select.value = "All";
        }
    });
    
    // Update layers based on reset filters
    window.layerFunctions.updateLayers();
}

// Export filter functions
window.filterFunctions = {
    initFilters,
    updateFilter,
    resetFilters
};
