/**
 * Advanced JavaScript Mapping - UI Controls Module
 * Handles user interface interactions, filters, and control panels
 */

console.log('🎛️ Advanced JavaScript Mapping - Loading UI controls module...');

// UI State management
let uiState = {
    sidebarExpanded: true,
    resultsExpanded: true,
    instructionsShown: false,
    activeFilter: null,
    filterValues: {},
    theme: 'light'
};

// Filter configurations
const FILTER_CONFIGS = {
    population: {
        min: 0,
        max: 20000000,
        step: 100000,
        format: (value) => value.toLocaleString()
    },
    area: {
        min: 0,
        max: 10000,
        step: 100,
        format: (value) => `${value} km²`
    },
    density: {
        min: 0,
        max: 50000,
        step: 100,
        format: (value) => `${value}/km²`
    }
};

/**
 * Initialize UI controls and event handlers
 */
function initializeUIControls() {
    console.log('🔄 Initializing UI controls...');
    
    try {
        // Setup sidebar controls
        setupSidebarControls();
        
        // Setup filter controls
        setupFilterControls();
        
        // Setup view controls
        setupViewControls();
        
        // Setup keyboard shortcuts
        setupKeyboardShortcuts();
        
        // Setup responsive behavior
        setupResponsiveBehavior();
        
        // Load saved preferences
        loadUserPreferences();
        
        // Initialize tooltips
        initializeTooltips();
        
        console.log('✅ UI controls initialized');
        
    } catch (error) {
        console.error('❌ Failed to initialize UI controls:', error);
    }
}

/**
 * Setup sidebar controls and interactions
 */
function setupSidebarControls() {
    console.log('🔄 Setting up sidebar controls...');
    
    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    // Sidebar tabs
    const tabButtons = document.querySelectorAll('[data-tab-target]');
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const targetTab = e.target.dataset.tabTarget;
            switchTab(targetTab);
        });
    });
    
    // Panel toggles
    const panelToggles = document.querySelectorAll('.panel-toggle');
    panelToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            const panelId = e.target.closest('.control-panel').id;
            togglePanel(panelId);
        });
    });
    
    // Clear all button
    const clearAllBtn = document.getElementById('clearAll');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', clearAllData);
    }
    
    // Help button
    const helpBtn = document.getElementById('helpButton');
    if (helpBtn) {
        helpBtn.addEventListener('click', showHelp);
    }
    
    // Apply filters button
    const applyFiltersBtn = document.getElementById('applyFilters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', handleApplyFilters);
    }
    
    console.log('✅ Sidebar controls setup complete');
}

/**
 * Setup filter controls and sliders
 */
function setupFilterControls() {
    console.log('🔄 Setting up filter controls...');
    
    // Population range slider
    setupRangeSlider('populationRange', 'minPopulation', 'maxPopulation', FILTER_CONFIGS.population);
    
    // Area range slider
    setupRangeSlider('areaRange', 'minArea', 'maxArea', FILTER_CONFIGS.area);
    
    // Density range slider
    setupRangeSlider('densityRange', 'minDensity', 'maxDensity', FILTER_CONFIGS.density);
    
    // City type filter
    setupCityTypeFilter();
    
    // Country filter
    setupCountryFilter();
    
    // Filter reset button
    const resetFiltersBtn = document.getElementById('resetFilters');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetAllFilters);
    }
    
    // Auto-apply filters checkbox
    const autoApplyCheckbox = document.getElementById('autoApplyFilters');
    if (autoApplyCheckbox) {
        autoApplyCheckbox.addEventListener('change', (e) => {
            uiState.autoApplyFilters = e.target.checked;
            saveUserPreferences();
        });
    }
    
    console.log('✅ Filter controls setup complete');
}

/**
 * Setup range slider with dual handles
 */
function setupRangeSlider(sliderId, minInputId, maxInputId, config) {
    const slider = document.getElementById(sliderId);
    const minInput = document.getElementById(minInputId);
    const maxInput = document.getElementById(maxInputId);
    
    if (!slider || !minInput || !maxInput) return;
    
    // Initialize slider values
    slider.min = config.min;
    slider.max = config.max;
    slider.step = config.step;
    
    // Create dual range slider effect
    let minVal = config.min;
    let maxVal = config.max;
    
    // Update display function
    const updateDisplay = () => {
        minInput.placeholder = config.format(minVal);
        maxInput.placeholder = config.format(maxVal);
        
        // Update slider background to show selected range
        const percent1 = ((minVal - config.min) / (config.max - config.min)) * 100;
        const percent2 = ((maxVal - config.min) / (config.max - config.min)) * 100;
        slider.style.background = `linear-gradient(to right, 
            #e9ecef 0%, 
            #e9ecef ${percent1}%, 
            #667eea ${percent1}%, 
            #667eea ${percent2}%, 
            #e9ecef ${percent2}%, 
            #e9ecef 100%)`;
    };
    
    // Input change handlers
    minInput.addEventListener('input', (e) => {
        const value = parseInt(e.target.value) || config.min;
        minVal = Math.max(config.min, Math.min(value, maxVal));
        updateDisplay();
        updateFilterValues();
    });
    
    maxInput.addEventListener('input', (e) => {
        const value = parseInt(e.target.value) || config.max;
        maxVal = Math.min(config.max, Math.max(value, minVal));
        updateDisplay();
        updateFilterValues();
    });
    
    // Initialize display
    updateDisplay();
}

/**
 * Setup city type filter dropdown
 */
function setupCityTypeFilter() {
    const cityTypeFilter = document.getElementById('cityTypeFilter');
    if (!cityTypeFilter) return;
    
    // Add change handler
    cityTypeFilter.addEventListener('change', updateFilterValues);
    
    // Populate with dynamic options if needed
    // This would typically be populated from API data
}

/**
 * Setup country filter with search capability
 */
function setupCountryFilter() {
    const countryFilter = document.getElementById('countryFilter');
    if (!countryFilter) return;
    
    // Add change handler
    countryFilter.addEventListener('change', updateFilterValues);
    
    // Add search functionality
    const countrySearch = document.getElementById('countrySearch');
    if (countrySearch) {
        countrySearch.addEventListener('input', (e) => {
            filterCountryOptions(e.target.value);
        });
    }
}

/**
 * Filter country dropdown options based on search
 */
function filterCountryOptions(searchTerm) {
    const countryFilter = document.getElementById('countryFilter');
    if (!countryFilter) return;
    
    const options = countryFilter.querySelectorAll('option');
    const term = searchTerm.toLowerCase();
    
    options.forEach(option => {
        if (option.value === '') return; // Keep "All Countries" option
        
        const countryName = option.textContent.toLowerCase();
        if (countryName.includes(term)) {
            option.style.display = '';
        } else {
            option.style.display = 'none';
        }
    });
}

/**
 * Setup view and layer controls
 */
function setupViewControls() {
    console.log('🔄 Setting up view controls...');
    
    // Layer visibility checkboxes
    const layerControls = document.querySelectorAll('.layer-control input[type="checkbox"]');
    layerControls.forEach(control => {
        control.addEventListener('change', (e) => {
            const layerName = e.target.dataset.layer;
            toggleLayer(layerName, e.target.checked);
        });
    });
    
    // Map style selector
    const mapStyleSelect = document.getElementById('mapStyle');
    if (mapStyleSelect) {
        mapStyleSelect.addEventListener('change', (e) => {
            changeMapStyle(e.target.value);
        });
    }
    
    // Zoom controls
    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    const resetViewBtn = document.getElementById('resetView');
    
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => map.zoomIn());
    }
    
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => map.zoomOut());
    }
    
    if (resetViewBtn) {
        resetViewBtn.addEventListener('click', resetMapView);
    }
    
    // Fullscreen toggle
    const fullscreenBtn = document.getElementById('toggleFullscreen');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
    }
    
    console.log('✅ View controls setup complete');
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    console.log('🔄 Setting up keyboard shortcuts...');
    
    document.addEventListener('keydown', (e) => {
        // Don't trigger shortcuts when typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch (e.key) {
            case 'Escape':
                // Close modals, overlays, or cancel drawing
                if (document.getElementById('instructionsOverlay').classList.contains('active')) {
                    document.getElementById('instructionsOverlay').classList.remove('active');
                } else if (document.getElementById('resultsPanel').classList.contains('active')) {
                    hideResultsPanel();
                }
                break;
                
            case 'h':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    showHelp();
                }
                break;
                
            case 's':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    toggleSidebar();
                }
                break;
                
            case 'd':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    enableDrawing();
                }
                break;
                
            case 'c':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    clearAllData();
                }
                break;
                
            case 'f':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    toggleFullscreen();
                }
                break;
        }
    });
    
    console.log('✅ Keyboard shortcuts setup complete');
}

/**
 * Setup responsive behavior
 */
function setupResponsiveBehavior() {
    console.log('🔄 Setting up responsive behavior...');
    
    // Mobile breakpoint handler
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    
    const handleResponsive = (e) => {
        if (e.matches) {
            // Mobile view
            uiState.sidebarExpanded = false;
            updateSidebarState();
            
            // Adjust map controls
            adjustMobileControls(true);
        } else {
            // Desktop view
            uiState.sidebarExpanded = true;
            updateSidebarState();
            
            // Restore desktop controls
            adjustMobileControls(false);
        }
    };
    
    // Initial check
    handleResponsive(mediaQuery);
    
    // Listen for changes
    mediaQuery.addListener(handleResponsive);
    
    // Window resize handler
    window.addEventListener('resize', debounce(() => {
        if (map) {
            map.invalidateSize();
        }
        adjustUILayout();
    }, 250));
    
    console.log('✅ Responsive behavior setup complete');
}

/**
 * Toggle sidebar visibility
 */
function toggleSidebar() {
    uiState.sidebarExpanded = !uiState.sidebarExpanded;
    updateSidebarState();
    saveUserPreferences();
    
    // Trigger map resize
    setTimeout(() => {
        if (map) {
            map.invalidateSize();
        }
    }, 300);
}

/**
 * Update sidebar visual state
 */
function updateSidebarState() {
    const sidebar = document.getElementById('sidebar');
    const mapContainer = document.getElementById('map');
    const toggleBtn = document.getElementById('sidebarToggle');
    
    if (sidebar && mapContainer) {
        if (uiState.sidebarExpanded) {
            sidebar.classList.add('expanded');
            mapContainer.classList.add('sidebar-expanded');
            if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        } else {
            sidebar.classList.remove('expanded');
            mapContainer.classList.remove('sidebar-expanded');
            if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        }
    }
}

/**
 * Switch between sidebar tabs
 */
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('[data-tab-target]').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab-target="${tabName}"]`)?.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName)?.classList.add('active');
    
    console.log(`📋 Switched to ${tabName} tab`);
}

/**
 * Toggle panel expansion
 */
function togglePanel(panelId) {
    const panel = document.getElementById(panelId);
    if (!panel) return;
    
    const body = panel.querySelector('.panel-body');
    const toggle = panel.querySelector('.panel-toggle');
    
    if (body && toggle) {
        const isExpanded = !body.classList.contains('collapsed');
        
        if (isExpanded) {
            body.classList.add('collapsed');
            toggle.innerHTML = '<i class="fas fa-chevron-down"></i>';
        } else {
            body.classList.remove('collapsed');
            toggle.innerHTML = '<i class="fas fa-chevron-up"></i>';
        }
    }
}

/**
 * Get filter values from UI components
 */
function getFilterValues() {
    const filters = {};
    
    // Population filters
    const minPop = document.getElementById('minPopulation')?.value;
    const maxPop = document.getElementById('maxPopulation')?.value;
    if (minPop && minPop !== '') filters.min_population = parseInt(minPop);
    if (maxPop && maxPop !== '') filters.max_population = parseInt(maxPop);
    
    // City type filters (checkboxes)
    const cityTypes = [];
    const typeCheckboxes = ['typeCapital', 'typeMajor', 'typeMedium', 'typeSmall'];
    typeCheckboxes.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox && checkbox.checked) {
            cityTypes.push(checkbox.value);
        }
    });
    if (cityTypes.length > 0) filters.city_types = cityTypes;
    
    // Country filter (multi-select)
    const countrySelect = document.getElementById('countryFilter');
    if (countrySelect && countrySelect.value && countrySelect.value.length > 0) {
        filters.countries = Array.from(countrySelect.selectedOptions).map(option => option.value);
    }
    
    // Economic filters
    const minGdp = document.getElementById('minGdp')?.value;
    if (minGdp && minGdp !== '') filters.min_gdp = parseFloat(minGdp);
    
    const maxUnemployment = document.getElementById('maxUnemployment')?.value;
    if (maxUnemployment && maxUnemployment !== '') filters.max_unemployment = parseFloat(maxUnemployment);
    
    console.log('🎛️ Current filter values:', filters);
    return filters;
}

/**
 * Handle Apply Filters button click
 */
function handleApplyFilters() {
    console.log('🔍 Apply filters button clicked');
    
    try {
        // Update filter values
        updateFilterValues();
        
        // If there's a current polygon, trigger search
        if (currentPolygon) {
            const geoJSON = currentPolygon.toGeoJSON();
            if (window.SpatialAnalysis && typeof window.SpatialAnalysis.performSpatialSearch === 'function') {
                window.SpatialAnalysis.performSpatialSearch(geoJSON.geometry);
            }
        } else {
            // Show message that polygon is needed
            if (window.AdvancedMapping && typeof window.AdvancedMapping.showInfoMessage === 'function') {
                window.AdvancedMapping.showInfoMessage('Please draw a polygon on the map first to search for cities');
            }
        }
    } catch (error) {
        console.error('❌ Error applying filters:', error);
        if (window.AdvancedMapping && typeof window.AdvancedMapping.showErrorMessage === 'function') {
            window.AdvancedMapping.showErrorMessage('Error applying filters. Please try again.');
        }
    }
}

/**
 * Update filter values and trigger search if auto-apply is enabled
 */
function updateFilterValues() {
    // Collect all filter values
    uiState.filterValues = getFilterValues();
    
    // Show filter indicator
    updateFilterIndicator();
    
    // Auto-apply if enabled
    if (uiState.autoApplyFilters && currentPolygon) {
        debounce(() => {
            const geoJSON = currentPolygon.toGeoJSON();
            if (window.SpatialAnalysis && typeof window.SpatialAnalysis.performSpatialSearch === 'function') {
                window.SpatialAnalysis.performSpatialSearch(geoJSON.geometry);
            }
        }, 1000)();
    }
    
    console.log('🎛️ Filter values updated:', uiState.filterValues);
}

/**
 * Update filter indicator badge
 */
function updateFilterIndicator() {
    const filterBadge = document.getElementById('filterBadge');
    if (!filterBadge) return;
    
    const activeFilters = Object.values(uiState.filterValues).filter(value => 
        value !== null && value !== undefined && value !== ''
    ).length;
    
    if (activeFilters > 0) {
        filterBadge.textContent = activeFilters;
        filterBadge.style.display = 'block';
    } else {
        filterBadge.style.display = 'none';
    }
}

/**
 * Reset all filters to default values
 */
function resetAllFilters() {
    console.log('🔄 Resetting all filters...');
    
    // Reset input fields
    document.querySelectorAll('.filter-input').forEach(input => {
        if (input.type === 'checkbox') {
            input.checked = false;
        } else {
            input.value = '';
        }
    });
    
    // Reset dropdowns
    document.querySelectorAll('.filter-select').forEach(select => {
        select.selectedIndex = 0;
    });
    
    // Update filter values
    updateFilterValues();
    
    showSuccessMessage('All filters reset');
}

/**
 * Toggle layer visibility
 */
function toggleLayer(layerName, visible) {
    console.log(`🔄 Toggling layer ${layerName}: ${visible}`);
    
    switch (layerName) {
        case 'cities':
            if (visible) {
                map.addLayer(citiesLayer);
            } else {
                map.removeLayer(citiesLayer);
            }
            break;
            
        case 'results':
            if (visible) {
                map.addLayer(resultsLayer);
            } else {
                map.removeLayer(resultsLayer);
            }
            break;
            
        case 'polygons':
            if (visible) {
                map.addLayer(drawnItems);
            } else {
                map.removeLayer(drawnItems);
            }
            break;
    }
}

/**
 * Change map base layer style
 */
function changeMapStyle(style) {
    console.log(`🎨 Changing map style to: ${style}`);
    
    // Remove current base layer
    map.eachLayer(layer => {
        if (layer instanceof L.TileLayer) {
            map.removeLayer(layer);
        }
    });
    
    // Add new base layer
    let newLayer;
    switch (style) {
        case 'osm':
            newLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            });
            break;
            
        case 'satellite':
            newLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: '© Esri'
            });
            break;
            
        case 'terrain':
            newLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenTopoMap contributors'
            });
            break;
            
        default:
            newLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            });
    }
    
    newLayer.addTo(map);
    showSuccessMessage(`Map style changed to ${style}`);
}

/**
 * Reset map to initial view
 */
function resetMapView() {
    console.log('🔄 Resetting map view...');
    
    map.setView(MAP_CONFIG.center, MAP_CONFIG.zoom);
    showSuccessMessage('Map view reset');
}

/**
 * Toggle fullscreen mode
 */
function toggleFullscreen() {
    console.log('🔄 Toggling fullscreen...');
    
    const mapContainer = document.getElementById('mapContainer');
    if (!mapContainer) return;
    
    if (!document.fullscreenElement) {
        mapContainer.requestFullscreen().then(() => {
            // Adjust map size after entering fullscreen
            setTimeout(() => {
                if (map) {
                    map.invalidateSize();
                }
            }, 100);
        });
    } else {
        document.exitFullscreen();
    }
}

/**
 * Clear all data and reset application
 */
function clearAllData() {
    console.log('🧹 Clearing all application data...');
    
    // Confirm action
    if (!confirm('Are you sure you want to clear all polygons and results? This action cannot be undone.')) {
        return;
    }
    
    // Clear map layers
    clearAllPolygons();
    
    // Reset filters
    resetAllFilters();
    
    // Reset UI state
    uiState.filterValues = {};
    updateFilterIndicator();
    
    // Hide panels
    hideResultsPanel();
    
    showSuccessMessage('All data cleared');
}

/**
 * Show help modal or overlay
 */
function showHelp() {
    console.log('❓ Showing help...');
    
    const instructionsOverlay = document.getElementById('instructionsOverlay');
    if (instructionsOverlay) {
        instructionsOverlay.classList.add('active');
    }
}

/**
 * Adjust mobile controls
 */
function adjustMobileControls(isMobile) {
    const controls = document.querySelectorAll('.leaflet-control');
    
    controls.forEach(control => {
        if (isMobile) {
            control.style.transform = 'scale(1.2)';
        } else {
            control.style.transform = 'scale(1)';
        }
    });
}

/**
 * Adjust UI layout based on screen size
 */
function adjustUILayout() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Adjust results panel height on mobile
    const resultsPanel = document.getElementById('resultsPanel');
    if (resultsPanel && width < 768) {
        resultsPanel.style.maxHeight = `${height * 0.5}px`;
    }
}

/**
 * Initialize tooltips
 */
function initializeTooltips() {
    // Initialize Bootstrap tooltips if available
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    }
}

/**
 * Save user preferences to localStorage
 */
function saveUserPreferences() {
    try {
        const preferences = {
            sidebarExpanded: uiState.sidebarExpanded,
            autoApplyFilters: uiState.autoApplyFilters,
            theme: uiState.theme,
            mapStyle: document.getElementById('mapStyle')?.value || 'osm'
        };
        
        localStorage.setItem('advancedMapping_preferences', JSON.stringify(preferences));
        console.log('💾 User preferences saved');
        
    } catch (error) {
        console.warn('⚠️ Failed to save preferences:', error);
    }
}

/**
 * Load user preferences from localStorage
 */
function loadUserPreferences() {
    try {
        const saved = localStorage.getItem('advancedMapping_preferences');
        if (saved) {
            const preferences = JSON.parse(saved);
            
            // Apply preferences
            uiState.sidebarExpanded = preferences.sidebarExpanded !== false;
            uiState.autoApplyFilters = preferences.autoApplyFilters === true;
            uiState.theme = preferences.theme || 'light';
            
            // Update UI
            updateSidebarState();
            
            const autoApplyCheckbox = document.getElementById('autoApplyFilters');
            if (autoApplyCheckbox) {
                autoApplyCheckbox.checked = uiState.autoApplyFilters;
            }
            
            const mapStyleSelect = document.getElementById('mapStyle');
            if (mapStyleSelect && preferences.mapStyle) {
                mapStyleSelect.value = preferences.mapStyle;
            }
            
            console.log('📁 User preferences loaded');
        }
    } catch (error) {
        console.warn('⚠️ Failed to load preferences:', error);
    }
}

/**
 * Show city details modal
 */
function showCityDetails(cityData) {
    console.log('🏙️ Showing city details:', cityData);
    
    // Create or update modal content
    let modal = document.getElementById('cityDetailsModal');
    if (!modal) {
        modal = createCityDetailsModal();
        document.body.appendChild(modal);
    }
    
    // Populate modal with city data
    populateCityDetailsModal(modal, cityData);
    
    // Show modal
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    } else {
        modal.style.display = 'block';
        modal.classList.add('show');
    }
}

/**
 * Create city details modal
 */
function createCityDetailsModal() {
    const modal = document.createElement('div');
    modal.id = 'cityDetailsModal';
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">City Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body" id="cityDetailsContent">
                    <!-- Content will be populated dynamically -->
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    `;
    return modal;
}

/**
 * Populate city details modal
 */
function populateCityDetailsModal(modal, cityData) {
    const content = modal.querySelector('#cityDetailsContent');
    
    content.innerHTML = `
        <div class="city-details-header">
            <h4><i class="fas fa-city me-2"></i>${cityData.name}, ${cityData.country}</h4>
        </div>
        
        <div class="city-details-stats">
            <div class="row g-3">
                <div class="col-md-6">
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-users"></i></div>
                        <div class="stat-info">
                            <div class="stat-value">${(cityData.population || 0).toLocaleString()}</div>
                            <div class="stat-label">Population</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-chart-area"></i></div>
                        <div class="stat-info">
                            <div class="stat-value">${cityData.area_km2} km²</div>
                            <div class="stat-label">Area</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-compress-arrows-alt"></i></div>
                        <div class="stat-info">
                            <div class="stat-value">${(cityData.population_density || 0).toLocaleString()}</div>
                            <div class="stat-label">Density (/km²)</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-dollar-sign"></i></div>
                        <div class="stat-info">
                            <div class="stat-value">$${(cityData.gdp_per_capita || 0).toLocaleString()}</div>
                            <div class="stat-label">GDP per Capita</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="city-details-location mt-4">
            <h6><i class="fas fa-map-marker-alt me-2"></i>Location</h6>
            <p>Latitude: ${cityData.latitude}°<br>
               Longitude: ${cityData.longitude}°</p>
        </div>
        
        <div class="city-details-actions mt-4">
            <button class="btn btn-primary me-2" onclick="zoomToCity([${cityData.latitude}, ${cityData.longitude}])">
                <i class="fas fa-crosshairs me-1"></i>
                Zoom to City
            </button>
            <button class="btn btn-outline-secondary" onclick="exportCityData(${JSON.stringify(cityData).replace(/"/g, '&quot;')})">
                <i class="fas fa-download me-1"></i>
                Export Data
            </button>
        </div>
    `;
}

/**
 * Export individual city data
 */
function exportCityData(cityData) {
    console.log('📄 Exporting city data:', cityData);
    
    try {
        const blob = new Blob([JSON.stringify(cityData, null, 2)], 
            { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${cityData.name}_${cityData.country}_data.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        showSuccessMessage('City data exported successfully');
        
    } catch (error) {
        console.error('❌ Export failed:', error);
        showErrorMessage('Failed to export city data');
    }
}

/**
 * Debounce function for performance optimization
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize UI controls when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎛️ DOM loaded, initializing UI controls...');
    
    // Initialize UI controls
    initializeUIControls();
    
    // Set up initial state
    updateSidebarState();
});

// Export functions for global access
window.UIControls = {
    toggleSidebar,
    switchTab,
    resetAllFilters,
    clearAllData,
    showHelp,
    showCityDetails,
    exportCityData,
    saveUserPreferences,
    loadUserPreferences
};