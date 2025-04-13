# Pest & Disease Tracker

A comprehensive web application for farmers and gardeners to track, report, and analyze pest and disease outbreaks on their crops. This tool helps in early identification of potential infestations and enables data-driven pest management decisions.

## Features

- **Pest & Disease Reporting**: Report new sightings with detailed information including type, severity, location, and images
- **Interactive Map**: Visual representation of all reported sightings with location markers and details
- **Trend Analysis**: Charts showing pest and disease trends over time
- **Data Insights**: Automated insights generated based on collected data
- **Searchable Reports**: Filter and search through past reports
- **Image Upload**: Attach multiple images to document pest identification
- **Mobile Responsive**: Works on both desktop and mobile devices

## Setup Instructions

1. Clone or download the repository
2. No installation required - this is a client-side application using local storage
3. Open the `index.html` file in a web browser

For proper functionality, you will need:
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for loading map tiles)
- Location access (optional, for auto-detection of your location)

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (vanilla)
- **Storage**: Browser's localStorage for data persistence
- **Maps**: Leaflet.js with OpenStreetMap
- **Charts**: Chart.js for data visualization
- **Icons**: Font Awesome

## Usage Guide

### Adding a New Report

1. Fill out the "Report New Sighting" form with:
   - Pest/Disease name
   - Category (Insect, Disease, Other)
   - Description of what you observed
   - Affected crops or plants
   - Severity level
   - Date observed
   - Location (use map selector for precise coordinates)
   - Optional images and treatment information

2. Click "Submit Report" to save the data

### Viewing Reports

1. Navigate to the "Reports" tab to see all submitted reports
2. Use the search box to find reports by keyword
3. Filter reports by category using the dropdown menu

### Analyzing Trends

1. Go to the "Trends & Insights" tab to see charts of pest/disease occurrences over time
2. View automatically generated insights based on your data
3. Use this information to identify patterns and plan preventative measures

### Using the Map

1. The "Sightings Map" tab shows a geographical view of all reported issues
2. Click on markers to view details about each report
3. Different colors indicate different categories of pests or diseases

## Data Privacy

All data is stored locally in your browser's localStorage. Nothing is sent to external servers. If you clear your browser cache/data, the reports will be deleted.

## Extending the Application

Ideas for future development:
- Server-side storage for sharing data across devices
- Community features for regional reporting
- Integration with weather data for correlation analysis
- Notifications for new outbreaks in your area
- Export/import functionality for data backup

## License

MIT License - Feel free to use, modify, and distribute this code for personal or commercial projects. 