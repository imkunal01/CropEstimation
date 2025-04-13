# Crop Monitoring System

A comprehensive web application for farmers to monitor crops, estimate yields, track pests, and plan crop rotations.

## Features

- **Weather Dashboard**: Get real-time weather data for your farm locations
- **Crop Estimation**: Calculate and track expected crop yields
- **Pest Tracker**: Monitor and report pest sightings
- **Crop Rotation Planner**: Plan optimal crop rotations
- **User Authentication**: Secure login and user management
- **Profile Management**: User profiles with customization options
- **Dark/Light Theme**: Choose your preferred theme

## Setup Instructions

### Prerequisites

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Web server (Apache, Nginx, etc.)
- Modern web browser

### Installation

1. Clone this repository to your web server's document root
2. Create the necessary databases using the provided SQL script:
   ```
   mysql -u root < setup_database.sql
   ```
3. Configure your web server to serve the application
4. Access the application via your web browser

### Default Login

A test user is created during setup:
- Email: test@example.com
- Password: password123

## Database Structure

The application uses two main databases:

### farming_app

- **users**: User accounts and authentication
  - id, name, email, password, profile_image, user_type, created_at, last_login

### crop_estimation

- **estimates**: Crop yield estimates
  - id, crop_name, area, yield, total_estimate, latitude, longitude, user_id
- **users**: User accounts (reference table)
- **community_posts**: Community forum posts
- **community_topics**: Community forum topics
- **pest_reports**: Pest sighting reports

## Technologies Used

- PHP for backend logic
- MySQL for data storage
- JavaScript for interactive features
- HTML5 and CSS3 for structure and styling
- LocalStorage for client-side data persistence

## Usage Instructions

1. Register a new account or use the default test account
2. Navigate through the different modules using the navigation menu
3. Update your profile information and settings on the profile page
4. Use the Crop Estimation tool to calculate expected yields
5. Report pest sightings using the Pest Tracker
6. Plan your crop rotations with the Crop Rotation Planner
7. Check weather forecasts on the Weather Dashboard

## File Structure

- **index.html**: Main landing page
- **dashboard.html**: Weather monitoring dashboard
- **main.html**: Crop estimation interface
- **login.html**: User authentication page
- **profile.html**: User profile management
- **styles.css**: Main stylesheet
- **login.css**: Login page specific styles
- **profile.css**: Profile page specific styles
- **chatbot.js**: Floating AI chatbot functionality
- **index.js**: Homepage and shared functionality
- **login.js**: Authentication handling
- **profile.js**: Profile management functionality
- **dashboard.js**: Weather monitoring functionality
- **setup_database.sql**: Database setup script
- **crop_estimation.sql**: Crop estimation database schema
- **pest_tracker/**: Pest tracking module
- **crop_planner/**: Crop rotation planning module

## Screenshots

(Screenshots will be added here)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [OpenWeatherMap API](https://openweathermap.org/api) for weather data
- [Font Awesome](https://fontawesome.com/) for icons
- [Google Fonts](https://fonts.google.com/) for typography 