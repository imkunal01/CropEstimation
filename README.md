# Crop Monitoring System

A simple web application that allows farmers to estimate crop yields and monitor real-time weather conditions for their crop locations.

## Features

- **Crop Estimation:** Calculate potential yield based on area and expected yield per acre
- **Interactive Map:** Mark crop locations on an interactive map
- **Weather Monitoring:** Get real-time weather data for crop locations
- **Responsive Design:** Works on desktop and mobile devices

## Technologies Used

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** PHP, MySQL
- **APIs:** 
  - OpenWeatherMap API for weather data
  - Leaflet.js for interactive maps

## Setup Instructions

1. **Database Setup**
   - Create a MySQL database named `crop_estimation`
   - Run the SQL commands in `crop_estimation.sql` to create the required tables

2. **API Configuration**
   - Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)
   - Replace `YOUR_OPENWEATHERMAP_API_KEY` in `dashboard.js` with your actual API key

3. **Web Server Setup**
   - Host the application in a PHP-enabled web server (XAMPP, WAMP, etc.)
   - Make sure the database credentials in `estimates.php` match your MySQL setup

## Files and Structure

- `index.html` - Landing page
- `main.html` - Crop estimation form
- `dashboard.html` - Weather monitoring dashboard
- `estimates.php` - Processes form data and displays results
- `dashboard.js` - Handles map interaction and weather API integration
- `styles.css` - Styling for the entire application
- `crop_estimation.sql` - Database structure

## Usage

1. Open the landing page in your web browser
2. Navigate to the "Crop Estimation" page to calculate potential yield
3. Use the "Weather Dashboard" to monitor weather conditions for your crop locations
4. Click anywhere on the map to set a location and view its weather data

## License

This project is open-source, free to use and modify. 