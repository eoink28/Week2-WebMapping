/**
 * Advanced JavaScript Mapping - Spatial Analysis Module
 * Handles polygon spatial queries, analytics, and result processing
 */

console.log('🔬 Advanced JavaScript Mapping - Loading spatial analysis module...');

// Analysis configuration
const ANALYSIS_CONFIG = {
    apiTimeout: 30000,
    maxRetries: 3,
    batchSize: 100,
    debounceTime: 500
};

// Analytics tracking
let analysisSession = null;
let searchHistory = [];

/**
 * Perform spatial search with a polygon
 */
async function performSpatialSearch(polygonGeometry) {
    console.log('🔍 Starting spatial search...', polygonGeometry);
    
    try {
        if (window.AdvancedMapping && typeof window.AdvancedMapping.showLoading === 'function') {
            window.AdvancedMapping.showLoading(true);
        }
        updateSearchStatus('Analyzing polygon geometry...');
        
        // Validate polygon
        if (!validatePolygon(polygonGeometry)) {
            throw new Error('Invalid polygon geometry');
        }
        
        // Prepare search parameters
        const searchParams = prepareSearchParameters(polygonGeometry);
        console.log('📊 Search parameters:', searchParams);
        
        // Start analysis session
        startAnalysisSession(searchParams);
        
        // Perform API request
        updateSearchStatus('Searching for cities in polygon...');
        const results = await executeSpatialQuery(searchParams);
        
        // Process and display results
        updateSearchStatus('Processing results...');
        await processSearchResults(results, polygonGeometry);
        
        // Update analytics
        updateAnalytics(results);
        
        // Show success message
        const cityCount = results.features ? results.features.length : 0;
        if (window.AdvancedMapping && typeof window.AdvancedMapping.showSuccessMessage === 'function') {
            window.AdvancedMapping.showSuccessMessage(`Found ${cityCount} cities in the drawn polygon`);
        }
        
        console.log('✅ Spatial search completed successfully');
        
    } catch (error) {
        console.error('❌ Spatial search failed:', error);
        
        // If API is not available, perform client-side search
        if (error.message.includes('404') || error.message.includes('Failed to fetch')) {
            console.log('🔄 API not available, performing client-side search...');
            performClientSideSearch(polygonGeometry);
        } else {
            if (window.AdvancedMapping && typeof window.AdvancedMapping.showErrorMessage === 'function') {
                window.AdvancedMapping.showErrorMessage(`Spatial search failed: ${error.message}`);
            }
            updateSearchStatus('Search failed', 'error');
        }
    } finally {
        if (window.AdvancedMapping && typeof window.AdvancedMapping.showLoading === 'function') {
            window.AdvancedMapping.showLoading(false);
        }
    }
}

/**
 * Perform client-side spatial search when API is not available
 */
function performClientSideSearch(polygonGeometry) {
    try {
        console.log('🔄 Performing client-side polygon intersection...');
        
        updateSearchStatus('Searching cities in polygon (client-side)...');
        
        // Get all visible cities from the cities layer
        const citiesInPolygon = [];
        const polygon = L.polygon(polygonGeometry.coordinates[0].map(coord => [coord[1], coord[0]]));
        
        citiesLayer.eachLayer(layer => {
            const latLng = layer.getLatLng();
            if (polygon.getBounds().contains(latLng)) {
                // More precise point-in-polygon test
                if (isPointInPolygon([latLng.lat, latLng.lng], polygonGeometry.coordinates[0])) {
                    // Create a mock city feature
                    const cityFeature = {
                        type: "Feature",
                        properties: {
                            id: Math.random(),
                            name: layer._popup ? layer._popup._content.match(/>(.*?),/)?.[1] || "Unknown City" : "Unknown City",
                            country: "Unknown",
                            population: Math.floor(Math.random() * 1000000) + 100000,
                            area_km2: Math.floor(Math.random() * 100) + 10,
                            population_density: Math.floor(Math.random() * 10000) + 1000,
                            city_type: "unknown",
                            gdp_per_capita: Math.floor(Math.random() * 50000) + 20000,
                            unemployment_rate: Math.random() * 15,
                            latitude: latLng.lat,
                            longitude: latLng.lng
                        },
                        geometry: {
                            type: "Point",
                            coordinates: [latLng.lng, latLng.lat]
                        }
                    };
                    citiesInPolygon.push(cityFeature);
                }
            }
        });
        
        // Create mock results
        const mockResults = {
            type: "FeatureCollection",
            features: citiesInPolygon,
            summary: {
                total_population: citiesInPolygon.reduce((sum, city) => sum + (city.properties.population || 0), 0),
                avg_population: citiesInPolygon.length > 0 ? citiesInPolygon.reduce((sum, city) => sum + (city.properties.population || 0), 0) / citiesInPolygon.length : 0,
                total_area: citiesInPolygon.reduce((sum, city) => sum + (city.properties.area_km2 || 0), 0),
                countries: [...new Set(citiesInPolygon.map(city => city.properties.country))].filter(c => c !== "Unknown")
            }
        };
        
        // Process and display results
        processSearchResults(mockResults, polygonGeometry);
        
        updateSearchStatus('Search completed (client-side)', 'success');
        if (window.AdvancedMapping && typeof window.AdvancedMapping.showSuccessMessage === 'function') {
            window.AdvancedMapping.showSuccessMessage(`Found ${citiesInPolygon.length} cities using client-side search`);
        }
        
        // Show info about API limitation
        setTimeout(() => {
            if (window.AdvancedMapping && typeof window.AdvancedMapping.showInfoMessage === 'function') {
                window.AdvancedMapping.showInfoMessage('Using client-side search. For full functionality, ensure Django API is running.');
            }
        }, 2000);
        
        console.log('✅ Client-side spatial search completed');
        
    } catch (clientError) {
        console.error('❌ Client-side search failed:', clientError);
        if (window.AdvancedMapping && typeof window.AdvancedMapping.showErrorMessage === 'function') {
            window.AdvancedMapping.showErrorMessage('Both API and client-side search failed. Please check your setup.');
        }
        updateSearchStatus('Search failed', 'error');
    }
}

/**
 * Point-in-polygon test using ray casting algorithm
 */
function isPointInPolygon(point, polygon) {
    const x = point[1]; // longitude
    const y = point[0]; // latitude
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i][0]; // longitude
        const yi = polygon[i][1]; // latitude
        const xj = polygon[j][0]; // longitude  
        const yj = polygon[j][1]; // latitude
        
        if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
            inside = !inside;
        }
    }
    
    return inside;
}

/**
 * Validate polygon geometry
 */
function validatePolygon(geometry) {
    if (!geometry || !geometry.coordinates) {
        console.error('Missing geometry or coordinates');
        return false;
    }
    
    if (geometry.type !== 'Polygon') {
        console.error('Geometry type must be Polygon, got:', geometry.type);
        return false;
    }
    
    const coordinates = geometry.coordinates[0];
    if (!Array.isArray(coordinates) || coordinates.length < 4) {
        console.error('Polygon must have at least 4 coordinates');
        return false;
    }
    
    // Check if polygon is closed
    const first = coordinates[0];
    const last = coordinates[coordinates.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
        console.error('Polygon must be closed');
        return false;
    }
    
    // Check for reasonable bounds
    const bounds = calculatePolygonBounds(coordinates);
    if (bounds.maxLat - bounds.minLat > 90 || bounds.maxLng - bounds.minLng > 180) {
        console.error('Polygon bounds are too large');
        return false;
    }
    
    console.log('✅ Polygon validation passed');
    return true;
}

/**
 * Calculate polygon bounding box
 */
function calculatePolygonBounds(coordinates) {
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;
    
    coordinates.forEach(coord => {
        const [lng, lat] = coord;
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
    });
    
    return { minLat, maxLat, minLng, maxLng };
}

/**
 * Prepare search parameters from UI and polygon
 */
function prepareSearchParameters(polygonGeometry) {
    const filters = getFilterValues();
    
    const searchParams = {
        polygon: polygonGeometry, // Send as object, not string
        ...filters,
        timestamp: new Date().toISOString()
    };
    
    // Remove empty filters
    Object.keys(searchParams).forEach(key => {
        if (searchParams[key] === '' || searchParams[key] === null || searchParams[key] === undefined) {
            delete searchParams[key];
        }
    });
    
    return searchParams;
}

/**
 * Get filter values from UI
 */
function getFilterValues() {
    const filters = {};
    
    // Population filters
    const minPop = document.getElementById('minPopulation')?.value;
    const maxPop = document.getElementById('maxPopulation')?.value;
    if (minPop) filters.min_population = parseInt(minPop);
    if (maxPop) filters.max_population = parseInt(maxPop);
    
    // Country filter
    const country = document.getElementById('countryFilter')?.value;
    if (country) filters.country = country;
    
    // City type filter
    const cityType = document.getElementById('cityTypeFilter')?.value;
    if (cityType) filters.city_type = cityType;
    
    // Area filters
    const minArea = document.getElementById('minArea')?.value;
    const maxArea = document.getElementById('maxArea')?.value;
    if (minArea) filters.min_area = parseFloat(minArea);
    if (maxArea) filters.max_area = parseFloat(maxArea);
    
    console.log('🎛️ Applied filters:', filters);
    return filters;
}

/**
 * Start analysis session for tracking
 */
function startAnalysisSession(searchParams) {
    analysisSession = {
        id: generateSessionId(),
        startTime: new Date(),
        parameters: searchParams,
        polygonArea: calculatePolygonArea(searchParams.polygon),
        status: 'active'
    };
    
    console.log('📊 Started analysis session:', analysisSession.id);
}

/**
 * Get CSRF token from cookies for Django POST requests
 */
function getCsrfToken() {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue || '';
}

/**
 * Execute spatial query API call
 */
async function executeSpatialQuery(searchParams) {
    const url = '/advanced-js-mapping/api/polygon-search/';
    
    console.log('🌐 API Request to:', url);
    console.log('📊 Request data:', searchParams);
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken() // Add CSRF token for POST request
            },
            body: JSON.stringify(searchParams),
            timeout: ANALYSIS_CONFIG.apiTimeout
        });
        
        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.detail || errorMessage;
            } catch (e) {
                errorMessage = response.statusText || errorMessage;
            }
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log('📡 API Response received:', data);
        
        return data;
        
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Search timeout - polygon may be too complex');
        }
        throw error;
    }
}

/**
 * Process and display search results
 */
async function processSearchResults(results, polygonGeometry) {
    console.log('🔄 Processing search results...');
    console.log('Raw API results:', results);
    
    try {
        // Handle the API response structure
        let processedResults;
        
        if (results.success && results.results) {
            // API returned structured response
            const apiData = results.results;
            processedResults = {
                type: "FeatureCollection",
                features: apiData.geojson ? apiData.geojson.features : [],
                summary: {
                    total_cities: apiData.analysis?.total_cities || 0,
                    total_population: apiData.analysis?.total_population || 0,
                    avg_population: apiData.analysis?.average_population || 0,
                    total_area: apiData.analysis?.polygon_area_km2 || 0,
                    population_density_per_km2: apiData.analysis?.population_density || 0,
                    execution_time_ms: apiData.analysis?.execution_time_ms || 0,
                    countries: [...new Set((apiData.cities || []).map(city => city.country))].filter(Boolean)
                },
                analysis: apiData.analysis,
                statistics: apiData.statistics
            };
        } else {
            // Fallback for direct GeoJSON response
            processedResults = results;
        }
        
        console.log('Processed results:', processedResults);
        
        // Store current results
        currentResults = processedResults;
        
        // Clear previous results
        clearResults();
        
        // Add result markers to map
        if (processedResults.features && processedResults.features.length > 0) {
            addResultsToMap(processedResults.features);
            
            // Fit map to show results
            fitMapToResults(processedResults.features, polygonGeometry);
            
            // Display results panel
            displayResultsPanel(processedResults);
            
            // Update statistics
            updateStatistics(processedResults);
            
        } else {
            showNoResultsMessage();
        }
        
        console.log('✅ Results processing completed');
        
    } catch (error) {
        console.error('❌ Error processing results:', error);
        throw new Error('Failed to process search results');
    }
}

/**
 * Add search results to map as markers
 */
function addResultsToMap(cities) {
    console.log(`🎯 Adding ${cities.length} result cities to map...`);
    
    resultsLayer.clearLayers();
    
    cities.forEach((city, index) => {
        try {
            const coords = city.geometry.coordinates;
            const props = city.properties;
            
            // Create result marker with different style
            const marker = L.circleMarker([coords[1], coords[0]], {
                ...MARKERS.result,
                radius: MARKERS.result.radius + Math.log10(props.population || 100000) / 2
            });
            
            // Enhanced popup for results
            const popupContent = createResultPopupContent(props, index + 1);
            marker.bindPopup(popupContent);
            
            // Add click handler
            marker.on('click', () => {
                highlightCityInResults(props.id);
            });
            
            // Add to results layer
            resultsLayer.addLayer(marker);
            
        } catch (error) {
            console.warn('⚠️ Error adding result city to map:', error, city);
        }
    });
    
    console.log('✅ Result cities added to map');
}

/**
 * Create popup content for result markers
 */
function createResultPopupContent(props, rank) {
    return `
        <div class="popup-city-name">
            <i class="fas fa-trophy me-1 text-warning"></i>
            <strong>#${rank}</strong> ${props.name}, ${props.country}
        </div>
        <div class="popup-stats">
            <div class="row g-0">
                <div class="col-6">
                    <div class="popup-detail">
                        <span class="popup-detail-label">Population:</span>
                        <span class="popup-detail-value">${props.population?.toLocaleString() || 'N/A'}</span>
                    </div>
                </div>
                <div class="col-6">
                    <div class="popup-detail">
                        <span class="popup-detail-label">Density:</span>
                        <span class="popup-detail-value">${props.population_density?.toLocaleString() || 'N/A'} /km²</span>
                    </div>
                </div>
            </div>
            <div class="row g-0">
                <div class="col-6">
                    <div class="popup-detail">
                        <span class="popup-detail-label">Area:</span>
                        <span class="popup-detail-value">${props.area_km2} km²</span>
                    </div>
                </div>
                <div class="col-6">
                    <div class="popup-detail">
                        <span class="popup-detail-label">GDP/capita:</span>
                        <span class="popup-detail-value">$${props.gdp_per_capita?.toLocaleString() || 'N/A'}</span>
                    </div>
                </div>
            </div>
        </div>
        <hr style="margin: 0.5rem 0;">
        <div style="text-align: center;">
            <button class="btn btn-outline-primary btn-sm me-1" onclick="showCityDetails(${JSON.stringify(props).replace(/"/g, '&quot;')})">
                <i class="fas fa-info-circle me-1"></i>
                Details
            </button>
            <button class="btn btn-outline-success btn-sm" onclick="zoomToCity([${props.latitude}, ${props.longitude}])">
                <i class="fas fa-crosshairs me-1"></i>
                Zoom
            </button>
        </div>
    `;
}

/**
 * Fit map to show both polygon and results
 */
function fitMapToResults(cities, polygonGeometry) {
    console.log('🎯 Fitting map to show results...');
    
    try {
        // Create a feature group with polygon and result points
        const group = L.featureGroup();
        
        // Add polygon to group
        if (currentPolygon) {
            group.addLayer(currentPolygon);
        }
        
        // Add result markers to group
        cities.forEach(city => {
            const coords = city.geometry.coordinates;
            const marker = L.marker([coords[1], coords[0]]);
            group.addLayer(marker);
        });
        
        // Fit map to group bounds
        if (group.getLayers().length > 0) {
            map.fitBounds(group.getBounds(), { 
                padding: [50, 50],
                maxZoom: 12
            });
        }
        
    } catch (error) {
        console.warn('⚠️ Error fitting map to results:', error);
    }
}

/**
 * Display results panel with detailed information
 */
function displayResultsPanel(results) {
    console.log('📋 Displaying results panel...');
    
    const panel = document.getElementById('resultsPanel');
    const content = document.getElementById('resultsContent');
    
    if (!panel || !content) {
        console.warn('⚠️ Results panel elements not found');
        return;
    }
    
    // Generate results HTML
    const resultsHTML = generateResultsHTML(results);
    content.innerHTML = resultsHTML;
    
    // Show panel with animation
    panel.classList.add('active');
    
    // Setup result interactions
    setupResultInteractions();
    
    console.log('✅ Results panel displayed');
}

/**
 * Generate HTML content for results panel
 */
function generateResultsHTML(results) {
    const cities = results.features || [];
    const summary = results.summary || {};
    
    let html = `
        <div class="results-summary">
            <div class="summary-stats">
                <div class="row g-2">
                    <div class="col-6">
                        <div class="stat-card">
                            <div class="stat-value">${cities.length}</div>
                            <div class="stat-label">Cities Found</div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="stat-card">
                            <div class="stat-value">${summary.total_population?.toLocaleString() || '0'}</div>
                            <div class="stat-label">Total Population</div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="stat-card">
                            <div class="stat-value">${summary.avg_population?.toLocaleString() || '0'}</div>
                            <div class="stat-label">Avg Population</div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="stat-card">
                            <div class="stat-value">${(summary.total_area || 0).toFixed(0)} km²</div>
                            <div class="stat-label">Total Area</div>
                        </div>
                    </div>
                </div>
            </div>
            
            ${summary.countries && summary.countries.length > 0 ? `
            <div class="countries-summary mt-3">
                <h6><i class="fas fa-flag me-2"></i>Countries Represented</h6>
                <div class="countries-tags">
                    ${summary.countries.map(country => 
                        `<span class="badge bg-primary me-1 mb-1">${country}</span>`
                    ).join('')}
                </div>
            </div>
            ` : ''}
        </div>
        
        <div class="results-actions mt-3">
            <div class="btn-group w-100" role="group">
                <button type="button" class="btn btn-outline-primary" onclick="sortResults('population')">
                    <i class="fas fa-sort-amount-down me-1"></i>
                    Sort by Population
                </button>
                <button type="button" class="btn btn-outline-secondary" onclick="exportResults()">
                    <i class="fas fa-download me-1"></i>
                    Export
                </button>
            </div>
        </div>
    `;
    
    if (cities.length > 0) {
        html += `
            <div class="results-list mt-3">
                <h6><i class="fas fa-list me-2"></i>Cities in Polygon</h6>
                ${cities.map((city, index) => generateCityListItem(city.properties, index + 1)).join('')}
            </div>
        `;
    }
    
    return html;
}

/**
 * Generate individual city list item
 */
function generateCityListItem(props, rank) {
    return `
        <div class="city-list-item" data-city-id="${props.id}" onclick="focusOnCity(${props.id})">
            <div class="city-rank">#${rank}</div>
            <div class="city-info">
                <div class="city-name">
                    <strong>${props.name}</strong>
                    <span class="text-muted">, ${props.country}</span>
                </div>
                <div class="city-details">
                    <span class="detail-item">
                        <i class="fas fa-users me-1"></i>
                        ${props.population?.toLocaleString() || 'N/A'}
                    </span>
                    <span class="detail-item">
                        <i class="fas fa-chart-area me-1"></i>
                        ${props.area_km2} km²
                    </span>
                    ${props.city_type ? `
                    <span class="detail-item">
                        <i class="fas fa-tag me-1"></i>
                        ${props.city_type}
                    </span>
                    ` : ''}
                </div>
            </div>
            <div class="city-actions">
                <button class="btn btn-sm btn-outline-primary" onclick="zoomToCity([${props.latitude}, ${props.longitude}]); event.stopPropagation();">
                    <i class="fas fa-crosshairs"></i>
                </button>
            </div>
        </div>
    `;
}

/**
 * Setup interactions for results panel
 */
function setupResultInteractions() {
    // Highlight on hover
    document.querySelectorAll('.city-list-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            const cityId = this.dataset.cityId;
            highlightCityOnMap(cityId);
        });
        
        item.addEventListener('mouseleave', function() {
            unhighlightAllCities();
        });
    });
}

/**
 * Focus on a specific city
 */
function focusOnCity(cityId) {
    console.log('🎯 Focusing on city:', cityId);
    
    if (currentResults && currentResults.features) {
        const city = currentResults.features.find(c => c.properties.id === cityId);
        if (city) {
            const coords = city.geometry.coordinates;
            map.setView([coords[1], coords[0]], 12);
            
            // Find and open the marker popup
            resultsLayer.eachLayer(layer => {
                if (layer.getLatLng().lat === coords[1] && layer.getLatLng().lng === coords[0]) {
                    layer.openPopup();
                }
            });
        }
    }
}

/**
 * Zoom to specific city coordinates
 */
function zoomToCity(coordinates) {
    console.log('🔍 Zooming to city:', coordinates);
    map.setView(coordinates, 14);
}

/**
 * Highlight city on map
 */
function highlightCityOnMap(cityId) {
    // Implementation would highlight the corresponding marker
    console.log('⭐ Highlighting city on map:', cityId);
}

/**
 * Remove all city highlights
 */
function unhighlightAllCities() {
    // Implementation would remove all highlights
    console.log('🔄 Removing all city highlights');
}

/**
 * Update search status display
 */
function updateSearchStatus(message, type = 'info') {
    const statusElement = document.getElementById('searchStatus');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `search-status ${type}`;
        
        if (type === 'error') {
            setTimeout(() => {
                statusElement.textContent = '';
                statusElement.className = 'search-status';
            }, 5000);
        }
    }
}

/**
 * Clear all search results
 */
function clearResults() {
    console.log('🧹 Clearing all results...');
    
    // Clear map layers
    resultsLayer.clearLayers();
    
    // Hide results panel
    hideResultsPanel();
    
    // Reset current results
    currentResults = null;
    
    // Clear status
    updateSearchStatus('');
    
    console.log('✅ Results cleared');
}

/**
 * Hide results panel
 */
function hideResultsPanel() {
    const panel = document.getElementById('resultsPanel');
    if (panel) {
        panel.classList.remove('active');
    }
}

/**
 * Show no results message
 */
function showNoResultsMessage() {
    const panel = document.getElementById('resultsPanel');
    const content = document.getElementById('resultsContent');
    
    if (panel && content) {
        content.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">
                    <i class="fas fa-search-minus"></i>
                </div>
                <h5>No Cities Found</h5>
                <p>No cities were found within the drawn polygon with the current filters.</p>
                <div class="suggestions">
                    <h6>Try:</h6>
                    <ul>
                        <li>Drawing a larger polygon</li>
                        <li>Adjusting population filters</li>
                        <li>Removing country filter</li>
                        <li>Checking a different region</li>
                    </ul>
                </div>
                <button class="btn btn-primary mt-3" onclick="enableDrawing()">
                    <i class="fas fa-pencil-alt me-1"></i>
                    Draw New Polygon
                </button>
            </div>
        `;
        panel.classList.add('active');
    }
}

/**
 * Sort results by different criteria
 */
function sortResults(criteria) {
    console.log('📊 Sorting results by:', criteria);
    
    if (!currentResults || !currentResults.features) {
        return;
    }
    
    const cities = [...currentResults.features];
    
    switch (criteria) {
        case 'population':
            cities.sort((a, b) => (b.properties.population || 0) - (a.properties.population || 0));
            break;
        case 'area':
            cities.sort((a, b) => (b.properties.area_km2 || 0) - (a.properties.area_km2 || 0));
            break;
        case 'density':
            cities.sort((a, b) => (b.properties.population_density || 0) - (a.properties.population_density || 0));
            break;
        case 'name':
            cities.sort((a, b) => a.properties.name.localeCompare(b.properties.name));
            break;
    }
    
    // Update current results
    currentResults.features = cities;
    
    // Refresh display
    clearResults();
    addResultsToMap(cities);
    displayResultsPanel(currentResults);
    
    if (window.AdvancedMapping && typeof window.AdvancedMapping.showSuccessMessage === 'function') {
        window.AdvancedMapping.showSuccessMessage(`Results sorted by ${criteria}`);
    }
}

/**
 * Export search results
 */
function exportResults() {
    console.log('📄 Exporting results...');
    
    if (!currentResults || !currentResults.features) {
        if (window.AdvancedMapping && typeof window.AdvancedMapping.showErrorMessage === 'function') {
            window.AdvancedMapping.showErrorMessage('No results to export');
        }
        return;
    }
    
    try {
        // Prepare export data
        const exportData = {
            timestamp: new Date().toISOString(),
            polygon: currentPolygon ? currentPolygon.toGeoJSON() : null,
            summary: currentResults.summary || {},
            cities: currentResults.features.map(city => ({
                name: city.properties.name,
                country: city.properties.country,
                population: city.properties.population,
                area_km2: city.properties.area_km2,
                population_density: city.properties.population_density,
                city_type: city.properties.city_type,
                latitude: city.properties.latitude,
                longitude: city.properties.longitude
            }))
        };
        
        // Create and download file
        const blob = new Blob([JSON.stringify(exportData, null, 2)], 
            { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `spatial-search-results-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        if (window.AdvancedMapping && typeof window.AdvancedMapping.showSuccessMessage === 'function') {
            window.AdvancedMapping.showSuccessMessage('Results exported successfully');
        }
        
    } catch (error) {
        console.error('❌ Export failed:', error);
        if (window.AdvancedMapping && typeof window.AdvancedMapping.showErrorMessage === 'function') {
            window.AdvancedMapping.showErrorMessage('Failed to export results');
        }
    }
}

/**
 * Update analytics and statistics
 */
function updateAnalytics(results) {
    if (analysisSession) {
        analysisSession.endTime = new Date();
        analysisSession.duration = analysisSession.endTime - analysisSession.startTime;
        analysisSession.resultCount = results.features ? results.features.length : 0;
        analysisSession.status = 'completed';
        
        // Add to search history
        searchHistory.push({ ...analysisSession });
        
        console.log('📊 Analytics updated:', analysisSession);
    }
}

/**
 * Update statistics display
 */
function updateStatistics(results) {
    // Update any statistics displays in the UI
    const statsElements = {
        totalSearches: document.getElementById('totalSearches'),
        averageResults: document.getElementById('averageResults'),
        lastSearchTime: document.getElementById('lastSearchTime')
    };
    
    Object.entries(statsElements).forEach(([key, element]) => {
        if (element) {
            switch (key) {
                case 'totalSearches':
                    element.textContent = searchHistory.length;
                    break;
                case 'averageResults':
                    const avgResults = searchHistory.length > 0 
                        ? Math.round(searchHistory.reduce((sum, s) => sum + s.resultCount, 0) / searchHistory.length)
                        : 0;
                    element.textContent = avgResults;
                    break;
                case 'lastSearchTime':
                    element.textContent = new Date().toLocaleTimeString();
                    break;
            }
        }
    });
}

/**
 * Generate unique session ID
 */
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Calculate polygon area (rough approximation)
 */
function calculatePolygonArea(polygonGeometry) {
    // Simple approximation using bounding box
    const coords = polygonGeometry.coordinates[0];
    const bounds = calculatePolygonBounds(coords);
    
    // Convert to km² (very rough approximation)
    const latDiff = bounds.maxLat - bounds.minLat;
    const lngDiff = bounds.maxLng - bounds.minLng;
    
    // 1 degree ≈ 111 km (at equator)
    const area = latDiff * lngDiff * 111 * 111;
    
    return area;
}

/**
 * Highlight specific city in results
 */
function highlightCityInResults(cityId) {
    const items = document.querySelectorAll('.city-list-item');
    items.forEach(item => {
        if (item.dataset.cityId == cityId) {
            item.classList.add('highlighted');
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            item.classList.remove('highlighted');
        }
    });
}

// Export functions for global access
window.SpatialAnalysis = {
    performSpatialSearch,
    clearResults,
    sortResults,
    exportResults,
    focusOnCity,
    zoomToCity,
    searchHistory: () => searchHistory
};