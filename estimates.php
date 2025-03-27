<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "crop_estimation";

// Check if we need to process form data
$formSubmitted = false;
$crop_name = $area = $yield = $total_estimate = $lat = $lng = "";
$insertSuccess = false;
$errorMessage = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $formSubmitted = true;
    
    // Connect to database
    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        $errorMessage = "Connection failed: " . $conn->connect_error;
    } else {
        $crop_name = htmlspecialchars($_POST['crop_name']);
        $area = floatval($_POST['area']);
        $yield = floatval($_POST['yield']);
        $total_estimate = $area * $yield;
        $lat = floatval($_POST['lat']);
        $lng = floatval($_POST['lng']);

        $stmt = $conn->prepare("INSERT INTO estimates (crop_name, area, yield, total_estimate, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("sddddd", $crop_name, $area, $yield, $total_estimate, $lat, $lng);

        if ($stmt->execute()) {
            $insertSuccess = true;
        } else {
            $errorMessage = "Error: " . $stmt->error;
        }

        $stmt->close();
        $conn->close();
    }
}

// HTML output starts here
?>
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Crop Estimation Results</title>
    <link rel="stylesheet" href="styles.css">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <!-- Theme Toggle Button -->
    <button class="theme-toggle" id="theme-toggle" aria-label="Toggle dark mode">
        <i class="fas fa-moon"></i>
    </button>
    
    <div class="container">
        <header>
            <h1><i class="fas fa-clipboard-check"></i> Crop Estimation Results</h1>
            <nav>
                <a href="index.html"><i class="fas fa-home"></i> Home</a>
                <a href="dashboard.html"><i class="fas fa-cloud-sun-rain"></i> Weather Dashboard</a>
                <a href="main.html"><i class="fas fa-plus-circle"></i> New Estimation</a>
            </nav>
        </header>

        <main>
            <?php if ($formSubmitted): ?>
                <section class="result-container">
                    <?php if ($insertSuccess): ?>
                        <div class="success-message">
                            <h2><i class="fas fa-check-circle"></i> Estimation Completed Successfully</h2>
                            <div class="result-details">
                                <div class="result-item">
                                    <strong><i class="fas fa-seedling"></i> Crop:</strong> <?php echo $crop_name; ?>
                                </div>
                                <div class="result-item">
                                    <strong><i class="fas fa-draw-polygon"></i> Area:</strong> <?php echo $area; ?> acres
                                </div>
                                <div class="result-item">
                                    <strong><i class="fas fa-chart-line"></i> Expected Yield per Acre:</strong> <?php echo $yield; ?> tons
                                </div>
                                <div class="result-item highlight">
                                    <strong><i class="fas fa-tractor"></i> Total Estimated Yield:</strong> <?php echo $total_estimate; ?> tons
                                </div>
                                <div class="result-item">
                                    <strong><i class="fas fa-map-marker-alt"></i> Location:</strong> Latitude: <?php echo $lat; ?>, Longitude: <?php echo $lng; ?>
                                </div>
                            </div>
                            
                            <div class="action-buttons">
                                <a href="dashboard.html?lat=<?php echo $lat; ?>&lng=<?php echo $lng; ?>" class="btn primary-btn">
                                    <i class="fas fa-cloud"></i> Check Weather for This Location
                                </a>
                                <a href="main.html" class="btn secondary-btn">
                                    <i class="fas fa-plus"></i> Create New Estimate
                                </a>
                            </div>
                        </div>
                    <?php else: ?>
                        <div class="error-message">
                            <h2><i class="fas fa-exclamation-triangle"></i> Error</h2>
                            <p><?php echo $errorMessage; ?></p>
                            <a href="main.html" class="btn secondary-btn"><i class="fas fa-redo"></i> Try Again</a>
                        </div>
                    <?php endif; ?>
                </section>
            <?php else: ?>
                <section class="error-container">
                    <h2><i class="fas fa-exclamation-circle"></i> No Data Submitted</h2>
                    <p>Please submit the estimation form to see results.</p>
                    <a href="main.html" class="btn primary-btn"><i class="fas fa-arrow-right"></i> Go to Estimation Form</a>
                </section>
            <?php endif; ?>
        </main>
    </div>
    
    <!-- Theme Toggle JavaScript -->
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const themeToggle = document.getElementById('theme-toggle');
            const themeIcon = themeToggle.querySelector('i');
            
            // Check for saved theme preference or use device preference
            const savedTheme = localStorage.getItem('theme') || 
                (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            
            // Apply saved theme
            document.documentElement.setAttribute('data-theme', savedTheme);
            updateIcon(savedTheme);
            
            // Toggle theme
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                updateIcon(newTheme);
            });
            
            // Update icon based on theme
            function updateIcon(theme) {
                if (theme === 'dark') {
                    themeIcon.classList.remove('fa-moon');
                    themeIcon.classList.add('fa-sun');
                } else {
                    themeIcon.classList.remove('fa-sun');
                    themeIcon.classList.add('fa-moon');
                }
            }
        });
    </script>
</body>
</html>
