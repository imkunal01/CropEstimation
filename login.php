<?php
// Start session
session_start();

// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "farming_app";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Process login
if (isset($_POST['action']) && $_POST['action'] == 'login') {
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $password = $_POST['password'];
    
    // Validate input
    if (empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Please fill in all fields']);
        exit;
    }
    
    // Prepare SQL query
    $stmt = $conn->prepare("SELECT id, name, email, password, profile_image, user_type FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows == 1) {
        $user = $result->fetch_assoc();
        
        // Verify password
        if (password_verify($password, $user['password'])) {
            // Update last login
            $updateStmt = $conn->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
            $updateStmt->bind_param("i", $user['id']);
            $updateStmt->execute();
            $updateStmt->close();
            
            // Set session variables
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['name'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['user_image'] = $user['profile_image'];
            $_SESSION['user_type'] = $user['user_type'];
            
            echo json_encode([
                'success' => true, 
                'message' => 'Login successful',
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'profile_image' => $user['profile_image'],
                    'user_type' => $user['user_type']
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid password']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'User not found']);
    }
    
    $stmt->close();
}

// Process registration
if (isset($_POST['action']) && $_POST['action'] == 'register') {
    $name = filter_var($_POST['name'], FILTER_SANITIZE_STRING);
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $password = $_POST['password'];
    $confirm_password = $_POST['confirm_password'];
    
    // Validate input
    if (empty($name) || empty($email) || empty($password) || empty($confirm_password)) {
        echo json_encode(['success' => false, 'message' => 'Please fill in all fields']);
        exit;
    }
    
    if ($password !== $confirm_password) {
        echo json_encode(['success' => false, 'message' => 'Passwords do not match']);
        exit;
    }
    
    // Check if email already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Email already registered']);
        $stmt->close();
        exit;
    }
    
    // Hash password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert new user
    $stmt = $conn->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $name, $email, $hashed_password);
    
    if ($stmt->execute()) {
        $user_id = $conn->insert_id;
        
        // Set session variables
        $_SESSION['user_id'] = $user_id;
        $_SESSION['user_name'] = $name;
        $_SESSION['user_email'] = $email;
        $_SESSION['user_type'] = 'regular';
        
        echo json_encode([
            'success' => true, 
            'message' => 'Registration successful',
            'user' => [
                'id' => $user_id,
                'name' => $name,
                'email' => $email,
                'user_type' => 'regular'
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Registration failed: ' . $conn->error]);
    }
    
    $stmt->close();
}

// Google login/registration
if (isset($_POST['action']) && $_POST['action'] == 'google_auth') {
    $name = filter_var($_POST['name'], FILTER_SANITIZE_STRING);
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $profile_image = filter_var($_POST['profile_image'], FILTER_SANITIZE_URL);
    
    // Check if user exists
    $stmt = $conn->prepare("SELECT id, name, email, profile_image, user_type FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        // User exists, update profile if needed and login
        $user = $result->fetch_assoc();
        
        // Update profile image if changed
        if ($profile_image != $user['profile_image']) {
            $updateStmt = $conn->prepare("UPDATE users SET profile_image = ?, last_login = NOW() WHERE id = ?");
            $updateStmt->bind_param("si", $profile_image, $user['id']);
            $updateStmt->execute();
            $updateStmt->close();
        } else {
            // Just update last login
            $updateStmt = $conn->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
            $updateStmt->bind_param("i", $user['id']);
            $updateStmt->execute();
            $updateStmt->close();
        }
        
        // Set session variables
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_image'] = $profile_image;
        $_SESSION['user_type'] = $user['user_type'];
        
        echo json_encode([
            'success' => true, 
            'message' => 'Login successful',
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'profile_image' => $profile_image,
                'user_type' => $user['user_type']
            ]
        ]);
    } else {
        // New user, create account
        $stmt = $conn->prepare("INSERT INTO users (name, email, profile_image, password) VALUES (?, ?, ?, ?)");
        
        // Generate a random password for Google users
        $random_password = bin2hex(random_bytes(16));
        $hashed_password = password_hash($random_password, PASSWORD_DEFAULT);
        
        $stmt->bind_param("ssss", $name, $email, $profile_image, $hashed_password);
        
        if ($stmt->execute()) {
            $user_id = $conn->insert_id;
            
            // Set session variables
            $_SESSION['user_id'] = $user_id;
            $_SESSION['user_name'] = $name;
            $_SESSION['user_email'] = $email;
            $_SESSION['user_image'] = $profile_image;
            $_SESSION['user_type'] = 'regular';
            
            echo json_encode([
                'success' => true, 
                'message' => 'Registration successful',
                'user' => [
                    'id' => $user_id,
                    'name' => $name,
                    'email' => $email,
                    'profile_image' => $profile_image,
                    'user_type' => 'regular'
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Registration failed: ' . $conn->error]);
        }
    }
    
    $stmt->close();
}

// Check login status
if (isset($_GET['action']) && $_GET['action'] == 'status') {
    if (isset($_SESSION['user_id'])) {
        echo json_encode([
            'success' => true, 
            'logged_in' => true,
            'user' => [
                'id' => $_SESSION['user_id'],
                'name' => $_SESSION['user_name'],
                'email' => $_SESSION['user_email'],
                'profile_image' => $_SESSION['user_image'] ?? null,
                'user_type' => $_SESSION['user_type']
            ]
        ]);
    } else {
        echo json_encode(['success' => true, 'logged_in' => false]);
    }
}

// Logout
if (isset($_GET['action']) && $_GET['action'] == 'logout') {
    // Destroy all session data
    session_unset();
    session_destroy();
    
    echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
}

$conn->close();
?> 