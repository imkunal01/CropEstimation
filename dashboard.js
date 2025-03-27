// Global variables
let map;
let currentMarker = null;
let darkModeLayer;
let lightModeLayer;
let currentTheme;

// OpenWeatherMap API key - Replace with your own valid API key
const apiKey = '6b0fc993c594246132651c506344e0f3';

// Initialize the map once DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    getUrlParameters();
    getUserLocation();
    loadLastLocation();
    setupThemeListener();
});

// Initialize map with appropriate theme
function initMap() {
    // Create the map
    map = L.map('map', {
        zoomControl: false,
        attributionControl: false
    }).setView([20, 0], 2);
    
    // Add zoom control to top-right corner
    L.control.zoom({
        position: 'topright'
    }).addTo(map);
    
    // Add attribution control to bottom-right
    L.control.attribution({
        position: 'bottomright',
        prefix: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    
    // Define tile layers for different themes
    lightModeLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    });
    
    darkModeLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, © <a href="https://carto.com/attributions">CARTO</a>'
    });
    
    // Get current theme and set appropriate layer
    currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    setMapTheme(currentTheme);
    
    // Map click event - MOVED HERE from outside
    map.on('click', function (e) {
        console.log("Map clicked at:", e.latlng.lat, e.latlng.lng);
        addMarker(e.latlng.lat, e.latlng.lng);
    });
    
    // Add nice animation when panning
    map.on('movestart', function() {
        document.getElementById('map').style.transition = 'transform 0.3s';
    });
}

// Listen for theme changes
function setupThemeListener() {
    // Watch for theme changes from the toggle button
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'data-theme') {
                const newTheme = document.documentElement.getAttribute('data-theme');
                if (newTheme !== currentTheme) {
                    currentTheme = newTheme;
                    setMapTheme(newTheme);
                }
            }
        });
    });
    
    observer.observe(document.documentElement, { attributes: true });
}

// Switch map theme based on current website theme
function setMapTheme(theme) {
    if (theme === 'dark') {
        if (map.hasLayer(lightModeLayer)) {
            map.removeLayer(lightModeLayer);
        }
        if (!map.hasLayer(darkModeLayer)) {
            darkModeLayer.addTo(map);
        }
    } else {
        if (map.hasLayer(darkModeLayer)) {
            map.removeLayer(darkModeLayer);
        }
        if (!map.hasLayer(lightModeLayer)) {
            lightModeLayer.addTo(map);
        }
    }
    
    // Update marker if it exists
    if (currentMarker) {
        updateMarkerStyle();
    }
}

// Update marker style based on theme
function updateMarkerStyle() {
    if (!currentMarker) return;
    
    const iconOptions = {
        icon: L.divIcon({
            className: 'custom-marker',
            html: `<div class="marker-pin ${currentTheme}"><i class="fas fa-map-marker-alt"></i></div>`,
            iconSize: [30, 42],
            iconAnchor: [15, 42]
        })
    };
    
    currentMarker.setIcon(iconOptions.icon);
}

// Get URL parameters
function getUrlParameters() {
    const params = new URLSearchParams(window.location.search);
    const lat = parseFloat(params.get('lat'));
    const lng = parseFloat(params.get('lng'));

    if (!isNaN(lat) && !isNaN(lng)) {
        map.setView([lat, lng], 12);
        addMarker(lat, lng);
    }
}

// Add marker + fetch weather
function addMarker(lat, lng) {
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }

    // Create custom marker with animation
    const iconOptions = {
        icon: L.divIcon({
            className: 'custom-marker',
            html: `<div class="marker-pin ${currentTheme}"><i class="fas fa-map-marker-alt"></i></div>`,
            iconSize: [30, 42],
            iconAnchor: [15, 42]
        })
    };

    currentMarker = L.marker([lat, lng], iconOptions).addTo(map);
    
    // Add a pop-up with a nice animation
    const popupContent = `
        <div class="popup-content">
            <h4><i class="fas fa-seedling"></i> Your Crop Location</h4>
            <p><i class="fas fa-map-pin"></i> Latitude: ${lat.toFixed(6)}</p>
            <p><i class="fas fa-map-pin"></i> Longitude: ${lng.toFixed(6)}</p>
        </div>
    `;
    
    currentMarker.bindPopup(popupContent, {
        className: 'custom-popup',
        closeButton: false,
        autoClose: false,
        closeOnClick: false
    }).openPopup();

    fetchWeatherData(lat, lng);
    localStorage.setItem('lastLocation', JSON.stringify({ lat, lng }));
    
    // Add pulse animation effect
    const pulseCircle = L.circleMarker([lat, lng], {
        color: '#4ecca3',
        fillColor: '#4ecca3',
        fillOpacity: 0.3,
        radius: 0
    }).addTo(map);
    
    // Animate the pulse
    let count = 0;
    const pulseAnimation = setInterval(() => {
        pulseCircle.setRadius(count);
        pulseCircle.setStyle({
            fillOpacity: Math.max(0, 0.5 - count / 60)
        });
        count += 1;
        if (count > 30) {
            clearInterval(pulseAnimation);
            map.removeLayer(pulseCircle);
        }
    }, 20);
}

// Fetch weather data
async function fetchWeatherData(lat, lng) {
    const weatherContainer = document.getElementById('weather-data');
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        weatherContainer.innerHTML = `<p class="error">Invalid coordinates selected.</p>`;
        return;
    }

    weatherContainer.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Fetching weather data...</p>
        </div>
    `;

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`;
    console.log("Fetching weather data from:", apiUrl);

    try {
        const res = await fetch(apiUrl);
        if (!res.ok) {
            const errorText = await res.text();
            console.error("API Error:", res.status, errorText);
            throw new Error(res.status === 429 ? "API rate limit exceeded" : `Failed to fetch weather data (${res.status})`);
        }

        const data = await res.json();
        console.log("Weather data received:", data);
        displayWeatherData(data);
    } catch (error) {
        console.error("Weather API Error:", error);
        weatherContainer.innerHTML = `<p class="error"><i class="fas fa-exclamation-circle"></i> Error: ${error.message}</p>`;
    }
}

// Display weather data
function displayWeatherData(data) {
    const container = document.getElementById('weather-data');
    const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
    
    const rainfall = data.rain 
        ? `${data.rain['1h'] || data.rain['3h'] || 0} mm predicted` 
        : "No rainfall predicted";
    
    // Calculate weather-dependent CSS classes
    const tempClass = data.main.temp > 30 ? 'temp-hot' : 
                      data.main.temp < 10 ? 'temp-cold' : 'temp-moderate';
    
    const windClass = data.wind.speed > 10 ? 'wind-strong' : 
                      data.wind.speed > 5 ? 'wind-moderate' : 'wind-light';
    
    // Format the HTML with animations and classes
    const html = `
        <div class="weather-card animated-card">
            <div class="weather-header">
                <div class="weather-icon-container">
                    <img src="${iconUrl}" alt="${data.weather[0].description}" class="weather-icon">
                </div>
                <h3>${data.name ? data.name : 'Selected Location'}</h3>
            </div>
            <div class="weather-details">
                <p class="temperature ${tempClass}">${Math.round(data.main.temp)}°C</p>
                <p class="feels-like">Feels like: ${Math.round(data.main.feels_like)}°C</p>
                <p class="weather-desc">${data.weather[0].description}</p>
                <div class="weather-info">
                    <div class="weather-info-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <p><strong>Coordinates:</strong> ${data.coord.lat.toFixed(2)}, ${data.coord.lon.toFixed(2)}</p>
                    </div>
                    <div class="weather-info-item">
                        <i class="fas fa-tint"></i>
                        <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
                    </div>
                    <div class="weather-info-item ${windClass}">
                        <i class="fas fa-wind"></i>
                        <p><strong>Wind Speed:</strong> ${data.wind.speed} m/s</p>
                    </div>
                    <div class="weather-info-item">
                        <i class="fas fa-compress-arrows-alt"></i>
                        <p><strong>Pressure:</strong> ${data.main.pressure} hPa</p>
                    </div>
                    <div class="weather-info-item">
                        <i class="fas fa-cloud-rain"></i>
                        <p><strong>Rainfall:</strong> ${rainfall}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    container.innerHTML = html;
    
    // Add animation after rendering
    setTimeout(() => {
        const card = document.querySelector('.animated-card');
        if (card) card.classList.add('show');
    }, 100);
}

// Get user location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                const urlParams = new URLSearchParams(window.location.search);
                if (!urlParams.has('lat') && !urlParams.has('lng') && !localStorage.getItem('lastLocation')) {
                    map.setView([latitude, longitude], 10);
                    addMarker(latitude, longitude);
                }
            },
            error => {
                console.log("Geolocation error:", error);
            }
        );
    }
}

// Load last marker from localStorage
function loadLastLocation() {
    const last = localStorage.getItem('lastLocation');
    if (last && !new URLSearchParams(window.location.search).has('lat')) {
        const { lat, lng } = JSON.parse(last);
        map.setView([lat, lng], 12);
        addMarker(lat, lng);
    }
}
