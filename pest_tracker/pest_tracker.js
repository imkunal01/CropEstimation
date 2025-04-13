// Pest & Disease Tracker JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const reportForm = document.getElementById('report-form');
    const useMapBtn = document.getElementById('use-map-btn');
    const mapModal = document.getElementById('map-modal');
    const closeMapModal = document.getElementById('close-map-modal');
    const confirmLocation = document.getElementById('confirm-location');
    const locationInput = document.getElementById('location');
    const latitudeInput = document.getElementById('latitude');
    const longitudeInput = document.getElementById('longitude');
    const imageUpload = document.getElementById('image-upload');
    const imagePreview = document.getElementById('image-preview');
    const searchReports = document.getElementById('search-reports');
    const filterType = document.getElementById('filter-type');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const aiSolutionBtn = document.getElementById('ai-solution-btn');
    const aiSolutionContainer = document.getElementById('ai-solution-container');
    const aiSolutionContent = document.getElementById('ai-solution-content');
    
    // Initialize image storage
    let uploadedImages = [];
    
    // Initialize pest reports storage
    let pestReports = JSON.parse(localStorage.getItem('pest_reports') || '[]');
    
    // Initialize maps
    let sightingsMap = null;
    let locationSelectionMap = null;
    let currentMarker = null;
    
    // Initialize charts
    let trendsChart = null;
    
    // Set today's date as default
    document.getElementById('date-observed').valueAsDate = new Date();
    
    // AI Solution Button
    if (aiSolutionBtn) {
        aiSolutionBtn.addEventListener('click', getAISolution);
    }
    
    // Tab navigation
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show selected tab content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${tabId}-tab`).classList.add('active');
            
            // Initialize map or chart if necessary
            if (tabId === 'map' && !sightingsMap) {
                initSightingsMap();
            } else if (tabId === 'trends' && !trendsChart) {
                initTrendsChart();
            }
        });
    });
    
    // Map selection modal
    useMapBtn.addEventListener('click', openMapModal);
    closeMapModal.addEventListener('click', closeMapModal);
    confirmLocation.addEventListener('click', setLocationFromMap);
    
    // Image upload handler
    imageUpload.addEventListener('change', handleImageUpload);
    
    // Form submission
    reportForm.addEventListener('submit', handleFormSubmit);
    
    // Search and filter functionality
    searchReports.addEventListener('input', filterReports);
    filterType.addEventListener('change', filterReports);
    
    // Initialize reports display
    displayReports();
    
    // Initialize maps if needed
    if (document.getElementById('map-tab').classList.contains('active')) {
        initSightingsMap();
    }
    
    // Initialize charts if needed
    if (document.getElementById('trends-tab').classList.contains('active')) {
        initTrendsChart();
    }
    
    // Function to open map modal
    function openMapModal() {
        mapModal.style.display = 'flex';
        
        // Initialize map if not already done
        if (!locationSelectionMap) {
            locationSelectionMap = L.map('location-map').setView([20, 0], 2);
            
            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(locationSelectionMap);
            
            // Map click event
            locationSelectionMap.on('click', function(e) {
                setMapMarker(e.latlng.lat, e.latlng.lng);
            });
            
            // Try to get user's location
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    function(position) {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        locationSelectionMap.setView([lat, lng], 13);
                    },
                    function(error) {
                        console.error("Error getting location:", error);
                    }
                );
            }
        } else {
            // Refresh map size
            setTimeout(() => {
                locationSelectionMap.invalidateSize();
            }, 100);
        }
    }
    
    // Function to close map modal
    function closeMapModal() {
        mapModal.style.display = 'none';
    }
    
    // Function to set marker on map
    function setMapMarker(lat, lng) {
        // Remove existing marker
        if (currentMarker) {
            locationSelectionMap.removeLayer(currentMarker);
        }
        
        // Create new marker
        currentMarker = L.marker([lat, lng]).addTo(locationSelectionMap);
        
        // Update hidden inputs
        latitudeInput.value = lat;
        longitudeInput.value = lng;
    }
    
    // Function to set location from map
    function setLocationFromMap() {
        // Check if marker is set
        if (!currentMarker) {
            alert('Please select a location on the map');
            return;
        }
        
        // Get coordinates from marker
        const position = currentMarker.getLatLng();
        
        // Reverse geocode to get location name (simplified)
        locationInput.value = `Selected Location (${position.lat.toFixed(6)}, ${position.lng.toFixed(6)})`;
        
        // Close modal
        closeMapModal();
    }
    
    // Function to handle image upload
    function handleImageUpload(e) {
        const files = e.target.files;
        
        // Clear preview
        imagePreview.innerHTML = '';
        uploadedImages = [];
        
        // Process each file
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Check if image
            if (!file.type.match('image.*')) {
                continue;
            }
            
            // Read file
            const reader = new FileReader();
            reader.onload = function(e) {
                // Add to uploaded images array
                uploadedImages.push({
                    name: file.name,
                    data: e.target.result
                });
                
                // Create preview element
                const preview = document.createElement('div');
                preview.className = 'preview-image';
                preview.style.backgroundImage = `url(${e.target.result})`;
                preview.style.backgroundSize = 'cover';
                preview.style.backgroundPosition = 'center';
                
                // Add remove button
                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-image';
                removeBtn.innerHTML = '<i class="fas fa-times"></i>';
                removeBtn.dataset.index = uploadedImages.length - 1;
                removeBtn.addEventListener('click', function() {
                    const index = parseInt(this.dataset.index);
                    uploadedImages.splice(index, 1);
                    this.parentElement.remove();
                    
                    // Update indexes of remaining buttons
                    document.querySelectorAll('.remove-image').forEach((btn, i) => {
                        btn.dataset.index = i;
                    });
                });
                
                preview.appendChild(removeBtn);
                imagePreview.appendChild(preview);
            };
            
            reader.readAsDataURL(file);
        }
    }
    
    // Function to handle form submission
    function handleFormSubmit(e) {
        e.preventDefault();
        
        // Get form values
        const pestType = document.getElementById('pest-type').value;
        const pestName = document.getElementById('pest-name').value;
        const cropAffected = document.getElementById('crop-affected').value;
        const severity = document.getElementById('severity').value;
        const dateObserved = document.getElementById('date-observed').value;
        const location = document.getElementById('location').value;
        const symptoms = document.getElementById('symptoms').value;
        const treatment = document.getElementById('treatment').value;
        const latitude = document.getElementById('latitude').value;
        const longitude = document.getElementById('longitude').value;
        
        // Validate required fields
        if (!pestType || !pestName || !cropAffected || !dateObserved || !location) {
            alert('Please fill all required fields');
            return;
        }
        
        // Create report object
        const report = {
            id: Date.now(),
            type: pestType,
            name: pestName,
            cropAffected: cropAffected,
            severity: parseInt(severity),
            dateObserved: dateObserved,
            location: location,
            symptoms: symptoms,
            treatment: treatment,
            latitude: latitude,
            longitude: longitude,
            images: uploadedImages,
            timestamp: new Date().toISOString()
        };
        
        // Get category (insect, disease, other)
        if (pestType.includes('aphids') || pestType.includes('beetles') || 
            pestType.includes('caterpillars') || pestType.includes('grasshoppers') || 
            pestType.includes('thrips') || pestType.includes('whiteflies') || 
            pestType.includes('other_insect')) {
            report.category = 'insect';
        } else if (pestType.includes('blight') || pestType.includes('mildew') || 
                  pestType.includes('rust') || pestType.includes('leaf_spot') || 
                  pestType.includes('wilt') || pestType.includes('rot') || 
                  pestType.includes('virus') || pestType.includes('other_disease')) {
            report.category = 'disease';
        } else {
            report.category = 'other';
        }
        
        // Add to reports array
        pestReports.unshift(report);
        
        // Save to localStorage
        localStorage.setItem('pest_reports', JSON.stringify(pestReports));
        
        // Update display
        displayReports();
        
        // Reset form
        reportForm.reset();
        document.getElementById('date-observed').valueAsDate = new Date();
        imagePreview.innerHTML = '';
        uploadedImages = [];
        
        // Show success message
        alert('Pest report saved successfully!');
    }
    
    // Function to display reports
    function displayReports() {
        const reportsContainer = document.getElementById('reports-container');
        
        // Check if there are reports
        if (pestReports.length === 0) {
            reportsContainer.innerHTML = '<p class="no-data-message">No pest reports yet. Use the form to report your first sighting.</p>';
            return;
        }
        
        // Clear container
        reportsContainer.innerHTML = '';
        
        // Filter reports if needed
        const searchTerm = searchReports.value.toLowerCase();
        const filterValue = filterType.value;
        
        // Apply filters
        const filteredReports = pestReports.filter(report => {
            // Text search
            const matchesSearch = searchTerm === '' || 
                report.name.toLowerCase().includes(searchTerm) || 
                report.cropAffected.toLowerCase().includes(searchTerm) || 
                report.location.toLowerCase().includes(searchTerm);
            
            // Type filter
            const matchesType = filterValue === 'all' || report.category === filterValue;
            
            return matchesSearch && matchesType;
        });
        
        // Check if there are filtered reports
        if (filteredReports.length === 0) {
            reportsContainer.innerHTML = '<p class="no-data-message">No reports match your filter criteria.</p>';
            return;
        }
        
        // Create report cards
        filteredReports.forEach(report => {
            const reportCard = document.createElement('div');
            reportCard.className = 'report-card';
            
            // Format date
            const reportDate = new Date(report.dateObserved);
            const formattedDate = reportDate.toLocaleDateString();
            
            // Get severity class
            let severityClass = '';
            let severityText = '';
            
            if (report.severity <= 2) {
                severityClass = 'severity-low';
                severityText = 'Low';
            } else if (report.severity <= 4) {
                severityClass = 'severity-medium';
                severityText = 'Medium';
            } else {
                severityClass = 'severity-high';
                severityText = 'High';
            }
            
            // Get category icon
            let categoryIcon = '';
            if (report.category === 'insect') {
                categoryIcon = '<i class="fas fa-bug"></i>';
            } else if (report.category === 'disease') {
                categoryIcon = '<i class="fas fa-virus"></i>';
            } else {
                categoryIcon = '<i class="fas fa-exclamation-circle"></i>';
            }
            
            reportCard.innerHTML = `
                <div class="report-header">
                    <div>
                        <div class="report-title">${categoryIcon} ${report.name}</div>
                        <div class="report-meta">
                            <span class="meta-item"><i class="fas fa-calendar"></i> ${formattedDate}</span>
                            <span class="meta-item"><i class="fas fa-seedling"></i> ${report.cropAffected}</span>
                            <span class="meta-item"><i class="fas fa-map-marker-alt"></i> ${report.location}</span>
                        </div>
                    </div>
                    <span class="severity-badge ${severityClass}">${severityText} Severity</span>
                </div>
                <div class="report-content">
                    ${report.symptoms ? `<p><strong>Symptoms:</strong> ${report.symptoms}</p>` : ''}
                    ${report.treatment ? `<p><strong>Treatment:</strong> ${report.treatment}</p>` : ''}
                </div>
            `;
            
            // Add images if any
            if (report.images && report.images.length > 0) {
                const imagesContainer = document.createElement('div');
                imagesContainer.className = 'report-images';
                
                report.images.forEach(image => {
                    const img = document.createElement('img');
                    img.src = image.data;
                    img.className = 'report-image';
                    img.alt = 'Pest image';
                    img.addEventListener('click', function() {
                        // Open larger image view (could be implemented as a modal)
                        window.open(image.data, '_blank');
                    });
                    
                    imagesContainer.appendChild(img);
                });
                
                reportCard.appendChild(imagesContainer);
            }
            
            // Add action buttons
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'report-actions';
            
            // Edit button
            const editBtn = document.createElement('button');
            editBtn.className = 'btn secondary-btn btn-sm';
            editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
            editBtn.addEventListener('click', function() {
                // Edit functionality (could be implemented)
                alert('Edit functionality not implemented in this demo');
            });
            
            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn warning-btn btn-sm';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
            deleteBtn.addEventListener('click', function() {
                if (confirm('Are you sure you want to delete this report?')) {
                    deleteReport(report.id);
                }
            });
            
            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(deleteBtn);
            
            reportCard.appendChild(actionsDiv);
            reportsContainer.appendChild(reportCard);
        });
        
        // Update map and charts
        if (sightingsMap) {
            updateSightingsMap();
        }
        
        if (trendsChart) {
            updateTrendsChart();
        }
    }
    
    // Function to filter reports
    function filterReports() {
        displayReports();
    }
    
    // Function to delete report
    function deleteReport(id) {
        // Find report index
        const index = pestReports.findIndex(report => report.id === id);
        
        // Remove report
        if (index !== -1) {
            pestReports.splice(index, 1);
            
            // Save to localStorage
            localStorage.setItem('pest_reports', JSON.stringify(pestReports));
            
            // Update display
            displayReports();
        }
    }
    
    // Function to initialize sightings map
    function initSightingsMap() {
        // Create map
        sightingsMap = L.map('sightings-map').setView([20, 0], 2);
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(sightingsMap);
        
        // Update map with markers
        updateSightingsMap();
    }
    
    // Function to update sightings map
    function updateSightingsMap() {
        // Check if map exists
        if (!sightingsMap) return;
        
        // Clear existing markers
        sightingsMap.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                sightingsMap.removeLayer(layer);
            }
        });
        
        // Add markers for reports with location data
        const reportsWithLocation = pestReports.filter(report => report.latitude && report.longitude);
        
        // Check if there are reports with location
        if (reportsWithLocation.length === 0) {
            return;
        }
        
        // Add markers
        const bounds = L.latLngBounds();
        
        reportsWithLocation.forEach(report => {
            const lat = parseFloat(report.latitude);
            const lng = parseFloat(report.longitude);
            
            if (isNaN(lat) || isNaN(lng)) return;
            
            // Create custom marker
            const markerEl = document.createElement('div');
            markerEl.className = `map-marker marker-${report.category}`;
            markerEl.innerHTML = '<i class="fas fa-bug"></i>';
            
            if (report.category === 'disease') {
                markerEl.innerHTML = '<i class="fas fa-virus"></i>';
            } else if (report.category === 'other') {
                markerEl.innerHTML = '<i class="fas fa-exclamation"></i>';
            }
            
            const icon = L.divIcon({
                className: 'custom-marker',
                html: markerEl.outerHTML,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });
            
            // Create marker
            const marker = L.marker([lat, lng], { icon: icon }).addTo(sightingsMap);
            
            // Add popup
            marker.bindPopup(`
                <div class="marker-popup">
                    <h4>${report.name}</h4>
                    <p><strong>Crop:</strong> ${report.cropAffected}</p>
                    <p><strong>Date:</strong> ${new Date(report.dateObserved).toLocaleDateString()}</p>
                    <p><strong>Severity:</strong> ${report.severity}/5</p>
                </div>
            `);
            
            // Add to bounds
            bounds.extend([lat, lng]);
        });
        
        // Fit map to bounds
        if (bounds.isValid()) {
            sightingsMap.fitBounds(bounds, {
                padding: [50, 50]
            });
        }
    }
    
    // Function to initialize trends chart
    function initTrendsChart() {
        const ctx = document.getElementById('pest-trends-chart').getContext('2d');
        
        // Create chart
        trendsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Insect Pests',
                        backgroundColor: '#f39c12',
                        data: []
                    },
                    {
                        label: 'Diseases',
                        backgroundColor: '#e74c3c',
                        data: []
                    },
                    {
                        label: 'Other',
                        backgroundColor: '#3498db',
                        data: []
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true,
                        title: {
                            display: true,
                            text: 'Month'
                        }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Reports'
                        },
                        ticks: {
                            precision: 0
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Pest & Disease Reports by Month'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                }
            }
        });
        
        // Update chart data
        updateTrendsChart();
    }
    
    // Function to update trends chart
    function updateTrendsChart() {
        // Check if chart exists
        if (!trendsChart) return;
        
        // Check if there are reports
        if (pestReports.length === 0) {
            document.getElementById('insights-container').style.display = 'none';
            return;
        }
        
        // Get data for last 6 months
        const now = new Date();
        const months = [];
        const insectData = [];
        const diseaseData = [];
        const otherData = [];
        
        // Create months array
        for (let i = 5; i >= 0; i--) {
            const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push(month.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }));
        }
        
        // Count reports by month and category
        for (let i = 5; i >= 0; i--) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
            
            const insectCount = pestReports.filter(report => {
                const reportDate = new Date(report.dateObserved);
                return reportDate >= monthStart && reportDate <= monthEnd && report.category === 'insect';
            }).length;
            
            const diseaseCount = pestReports.filter(report => {
                const reportDate = new Date(report.dateObserved);
                return reportDate >= monthStart && reportDate <= monthEnd && report.category === 'disease';
            }).length;
            
            const otherCount = pestReports.filter(report => {
                const reportDate = new Date(report.dateObserved);
                return reportDate >= monthStart && reportDate <= monthEnd && report.category === 'other';
            }).length;
            
            insectData.push(insectCount);
            diseaseData.push(diseaseCount);
            otherData.push(otherCount);
        }
        
        // Update chart data
        trendsChart.data.labels = months;
        trendsChart.data.datasets[0].data = insectData;
        trendsChart.data.datasets[1].data = diseaseData;
        trendsChart.data.datasets[2].data = otherData;
        
        // Update chart
        trendsChart.update();
        
        // Generate insights
        generateInsights(insectData, diseaseData, otherData);
    }
    
    // Function to generate insights
    function generateInsights(insectData, diseaseData, otherData) {
        const insightsContainer = document.getElementById('insights-container');
        
        // Check if data is empty
        const totalReports = insectData.reduce((sum, val) => sum + val, 0) + 
                            diseaseData.reduce((sum, val) => sum + val, 0) + 
                            otherData.reduce((sum, val) => sum + val, 0);
        
        if (totalReports === 0) {
            document.querySelector('.trend-insights .no-data-message').style.display = 'block';
            insightsContainer.style.display = 'none';
            return;
        }
        
        // Show insights container
        document.querySelector('.trend-insights .no-data-message').style.display = 'none';
        insightsContainer.style.display = 'block';
        
        // Clear insights container
        insightsContainer.innerHTML = '';
        
        // Calculate trends
        const insectTrend = insectData[5] - insectData[0];
        const diseaseTrend = diseaseData[5] - diseaseData[0];
        
        // Create insights
        const insights = [];
        
        // Most common category
        const currentInsects = insectData[5];
        const currentDiseases = diseaseData[5];
        const currentOther = otherData[5];
        
        const maxCategory = Math.max(currentInsects, currentDiseases, currentOther);
        
        if (maxCategory > 0) {
            if (maxCategory === currentInsects) {
                insights.push({
                    title: 'Insect Pests Dominate',
                    content: `Insect pests are currently your most reported pest type (${currentInsects} reports in the current month). Monitor crops closely and consider implementing insect control measures.`,
                    icon: 'fa-bug'
                });
            } else if (maxCategory === currentDiseases) {
                insights.push({
                    title: 'Disease Pressure High',
                    content: `Diseases are currently your most reported pest type (${currentDiseases} reports in the current month). Consider fungicide applications and improving air circulation.`,
                    icon: 'fa-virus'
                });
            }
        }
        
        // Trends
        if (insectTrend > 0) {
            insights.push({
                title: 'Increasing Insect Activity',
                content: `Insect pest reports have increased by ${insectTrend} over the past 6 months. This could be seasonal or indicate a growing problem that needs attention.`,
                icon: 'fa-chart-line'
            });
        } else if (insectTrend < 0) {
            insights.push({
                title: 'Declining Insect Activity',
                content: `Insect pest reports have decreased by ${Math.abs(insectTrend)} over the past 6 months. Your control measures may be working effectively.`,
                icon: 'fa-chart-line'
            });
        }
        
        if (diseaseTrend > 0) {
            insights.push({
                title: 'Increasing Disease Pressure',
                content: `Disease reports have increased by ${diseaseTrend} over the past 6 months. Check for environmental factors like excessive moisture or poor airflow.`,
                icon: 'fa-chart-line'
            });
        } else if (diseaseTrend < 0) {
            insights.push({
                title: 'Improving Disease Control',
                content: `Disease reports have decreased by ${Math.abs(diseaseTrend)} over the past 6 months. Your disease management practices appear to be effective.`,
                icon: 'fa-chart-line'
            });
        }
        
        // Add seasonal message
        const currentMonth = new Date().getMonth();
        
        if (currentMonth >= 2 && currentMonth <= 4) { // Spring
            insights.push({
                title: 'Spring Pest Management',
                content: 'Spring is a critical time for pest management. Focus on early detection and intervention to prevent population buildup throughout the growing season.',
                icon: 'fa-seedling'
            });
        } else if (currentMonth >= 5 && currentMonth <= 7) { // Summer
            insights.push({
                title: 'Summer Pest Pressure',
                content: 'Summer heat often increases insect reproduction rates. Monitor more frequently and ensure proper irrigation to minimize heat stress on plants.',
                icon: 'fa-sun'
            });
        } else if (currentMonth >= 8 && currentMonth <= 10) { // Fall
            insights.push({
                title: 'Fall Pest Preparations',
                content: 'As temperatures cool, focus on preventing overwintering pests and clearing crop debris that could harbor diseases for next season.',
                icon: 'fa-leaf'
            });
        } else { // Winter
            insights.push({
                title: 'Winter Planning',
                content: 'Use this time to analyze pest patterns from the past year and develop an integrated pest management strategy for the coming season.',
                icon: 'fa-snowflake'
            });
        }
        
        // Display insights
        insights.slice(0, 3).forEach(insight => {
            const insightCard = document.createElement('div');
            insightCard.className = 'insight-card';
            
            insightCard.innerHTML = `
                <div class="insight-title">
                    <i class="fas ${insight.icon}"></i>
                    ${insight.title}
                </div>
                <div class="insight-content">
                    ${insight.content}
                </div>
            `;
            
            insightsContainer.appendChild(insightCard);
        });
    }
    
    // Function to get AI solution for pest/disease
    function getAISolution() {
        // Get form data
        const pestName = document.getElementById('pest-name').value.trim();
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value.trim();
        const affectedCrops = document.getElementById('affected-crops').value.trim();
        const severity = document.getElementById('severity').value;
        
        // Validate basic inputs
        if (!pestName || !category || !description) {
            alert('Please fill in pest name, category, and description to get AI recommendations');
            return;
        }
        
        // Show loading state
        aiSolutionContent.innerHTML = `
            <div class="loading-indicator">
                <i class="fas fa-spinner fa-spin"></i> Analyzing your pest problem...
            </div>
        `;
        aiSolutionContainer.style.display = 'block';
        
        // In a real implementation, this would be an API call to an AI service
        // For this demo, we'll simulate the AI response with predefined responses
        setTimeout(() => {
            let aiResponse = generateAIPestSolution(pestName, category, affectedCrops, severity, description);
            
            // Display the AI response
            aiSolutionContent.innerHTML = aiResponse;
            
            // Scroll to the solution
            aiSolutionContainer.scrollIntoView({ behavior: 'smooth' });
        }, 1500);
    }
    
    // Generate AI solution based on pest information
    function generateAIPestSolution(pestName, category, crops, severity, description) {
        // Convert to lowercase for easier matching
        const pestNameLower = pestName.toLowerCase();
        const descriptionLower = description.toLowerCase();
        
        // Predefined solutions for common pests
        let solution = '';
        
        // Check for common pests
        if (pestNameLower.includes('aphid')) {
            solution = `
                <h4>Management Strategy for Aphids</h4>
                <p>Aphids are small sap-sucking insects that can rapidly reproduce and damage crops.</p>
                
                <h5>Recommended Control Methods:</h5>
                <ul>
                    <li><strong>Biological Control:</strong> Introduce beneficial insects like ladybugs, lacewings, or parasitic wasps.</li>
                    <li><strong>Organic Sprays:</strong> Use insecticidal soap, neem oil, or a mixture of water with a few drops of dish soap.</li>
                    <li><strong>Cultural Practices:</strong> Remove heavily infested plant parts, use reflective mulches, or plant trap crops.</li>
                    ${severity === 'high' ? '<li><strong>Chemical Control:</strong> In severe cases, consider specific aphid insecticides, following all label instructions and safety precautions.</li>' : ''}
                </ul>
                
                <h5>Prevention:</h5>
                <ul>
                    <li>Monitor plants regularly for early detection</li>
                    <li>Avoid excessive nitrogen fertilization</li>
                    <li>Maintain healthy plants with proper watering and nutrition</li>
                    <li>Plant aphid-repelling companions like garlic, onions, or marigolds</li>
                </ul>
            `;
        } else if (pestNameLower.includes('powdery mildew') || (category === 'disease' && descriptionLower.includes('white') && descriptionLower.includes('powder'))) {
            solution = `
                <h4>Management Strategy for Powdery Mildew</h4>
                <p>Powdery mildew is a fungal disease that appears as white powdery spots on leaves and stems.</p>
                
                <h5>Recommended Control Methods:</h5>
                <ul>
                    <li><strong>Cultural Control:</strong> Improve air circulation by proper spacing and pruning.</li>
                    <li><strong>Organic Treatments:</strong> Spray with a solution of 1 tablespoon baking soda, 1 teaspoon mild liquid soap, and 1 gallon of water.</li>
                    <li><strong>Milk Spray:</strong> Diluted milk (1:10 with water) can be effective against powdery mildew.</li>
                    ${severity === 'high' ? '<li><strong>Fungicides:</strong> For severe infections, use sulfur-based fungicides or specific powdery mildew formulations.</li>' : ''}
                </ul>
                
                <h5>Prevention:</h5>
                <ul>
                    <li>Plant resistant varieties when available</li>
                    <li>Avoid overhead watering and water in the morning</li>
                    <li>Remove and destroy infected plant parts</li>
                    <li>Rotate crops and clean tools between uses</li>
                </ul>
            `;
        } else if ((pestNameLower.includes('beetle') || pestNameLower.includes('weevil')) && category === 'insect') {
            solution = `
                <h4>Management Strategy for Beetles/Weevils</h4>
                <p>Beetles and weevils are common insect pests that can cause significant damage by feeding on leaves, fruits, or roots.</p>
                
                <h5>Recommended Control Methods:</h5>
                <ul>
                    <li><strong>Physical Removal:</strong> Handpick beetles from plants when populations are low.</li>
                    <li><strong>Barriers:</strong> Use row covers or protective mesh to prevent adult beetles from reaching plants.</li>
                    <li><strong>Biological Control:</strong> Encourage natural predators like birds, beneficial nematodes, or predatory insects.</li>
                    ${severity === 'high' ? '<li><strong>Insecticides:</strong> For severe infestations, consider botanical insecticides like pyrethrin or specific beetle-targeting products.</li>' : ''}
                </ul>
                
                <h5>Prevention:</h5>
                <ul>
                    <li>Practice crop rotation to break pest cycles</li>
                    <li>Delay planting until after peak beetle emergence</li>
                    <li>Keep garden clean of debris and weeds</li>
                    <li>Use trap crops to lure beetles away from main crops</li>
                </ul>
            `;
        } else if ((category === 'disease' && (descriptionLower.includes('spot') || descriptionLower.includes('lesion')))) {
            solution = `
                <h4>Management Strategy for Leaf Spot Disease</h4>
                <p>Leaf spot diseases are caused by various fungi or bacteria and appear as distinct spots or lesions on leaves.</p>
                
                <h5>Recommended Control Methods:</h5>
                <ul>
                    <li><strong>Cultural Control:</strong> Remove and destroy infected leaves and debris.</li>
                    <li><strong>Watering Management:</strong> Avoid wetting leaves when watering, especially in late afternoon or evening.</li>
                    <li><strong>Organic Options:</strong> Copper-based fungicides or compost tea applications can help control spread.</li>
                    ${severity === 'high' ? '<li><strong>Chemical Control:</strong> For severe infections, consider appropriate fungicides based on the specific pathogen.</li>' : ''}
                </ul>
                
                <h5>Prevention:</h5>
                <ul>
                    <li>Improve air circulation around plants</li>
                    <li>Use drip irrigation or soaker hoses instead of overhead watering</li>
                    <li>Practice crop rotation</li>
                    <li>Select resistant varieties when available</li>
                </ul>
            `;
        } else {
            // Generic response for unrecognized pests
            solution = `
                <h4>Management Strategy for ${pestName}</h4>
                <p>Based on your description of a ${severity} severity ${category} affecting ${crops || 'your crops'}, here are some general recommendations:</p>
                
                <h5>Recommended Control Methods:</h5>
                <ul>
                    <li><strong>Identification:</strong> Confirm the exact species/pathogen for targeted control. Consider consulting with a local extension office or agricultural expert.</li>
                    <li><strong>Cultural Controls:</strong> Modify the growing environment to reduce pest pressure through spacing, pruning, or adjusting irrigation practices.</li>
                    <li><strong>Biological Controls:</strong> Introduce or encourage natural enemies appropriate for this ${category}.</li>
                    <li><strong>Physical Controls:</strong> Use barriers, traps, or manual removal when possible.</li>
                    ${severity === 'high' ? '<li><strong>Chemical Controls:</strong> As a last resort, select appropriate pesticides based on the specific pest and follow all safety guidelines.</li>' : ''}
                </ul>
                
                <h5>Integrated Pest Management Approach:</h5>
                <p>For the most effective control, combine multiple strategies in an integrated approach, starting with the least toxic methods first.</p>
                
                <p><em>Note: For more specific recommendations, consider providing detailed photos and consulting with a local agricultural extension service.</em></p>
            `;
        }
        
        return solution;
    }
}); 