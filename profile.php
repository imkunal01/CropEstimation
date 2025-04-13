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

// Check if user is logged in
function checkAuth() {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Not authenticated']);
        exit;
    }
    return $_SESSION['user_id'];
}

// Handle profile operations
$response = ['success' => false, 'message' => 'Invalid request'];

// Get profile data
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    if (isset($_GET['action']) && $_GET['action'] == 'get_profile') {
        $user_id = checkAuth();
        
        $stmt = $conn->prepare("SELECT id, name, email, profile_image, user_type, created_at, last_login FROM users WHERE id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows == 1) {
            $user = $result->fetch_assoc();
            $response = [
                'success' => true,
                'user' => $user
            ];
        } else {
            $response = ['success' => false, 'message' => 'User not found'];
        }
        
        $stmt->close();
    }
}

// Update profile data
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (isset($_POST['action']) && $_POST['action'] == 'update_profile') {
        $user_id = checkAuth();
        
        // Get form data
        $name = filter_var($_POST['name'], FILTER_SANITIZE_STRING);
        $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
        
        // Check if email already exists for another user
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
        $stmt->bind_param("si", $email, $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $response = ['success' => false, 'message' => 'Email already in use by another account'];
            $stmt->close();
        } else {
            // Update user profile
            $stmt->close();
            
            $stmt = $conn->prepare("UPDATE users SET name = ?, email = ? WHERE id = ?");
            $stmt->bind_param("ssi", $name, $email, $user_id);
            
            if ($stmt->execute()) {
                // Update session variables
                $_SESSION['user_name'] = $name;
                $_SESSION['user_email'] = $email;
                
                $response = [
                    'success' => true,
                    'message' => 'Profile updated successfully',
                    'user' => [
                        'id' => $user_id,
                        'name' => $name,
                        'email' => $email
                    ]
                ];
            } else {
                $response = ['success' => false, 'message' => 'Failed to update profile: ' . $conn->error];
            }
            
            $stmt->close();
        }
    }
    
    // Upload profile image
    if (isset($_POST['action']) && $_POST['action'] == 'upload_image') {
        $user_id = checkAuth();
        
        if (isset($_FILES['profile_image']) && $_FILES['profile_image']['error'] == 0) {
            $allowed = ['jpg', 'jpeg', 'png', 'gif'];
            $filename = $_FILES['profile_image']['name'];
            $fileExt = pathinfo($filename, PATHINFO_EXTENSION);
            
            // Validate file extension
            if (in_array(strtolower($fileExt), $allowed)) {
                // Create unique filename
                $newFilename = 'profile_' . $user_id . '_' . time() . '.' . $fileExt;
                $uploadDir = 'uploads/profiles/';
                
                // Create directory if it doesn't exist
                if (!file_exists($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }
                
                $uploadPath = $uploadDir . $newFilename;
                
                // Move uploaded file
                if (move_uploaded_file($_FILES['profile_image']['tmp_name'], $uploadPath)) {
                    // Update database with new image path
                    $stmt = $conn->prepare("UPDATE users SET profile_image = ? WHERE id = ?");
                    $stmt->bind_param("si", $uploadPath, $user_id);
                    
                    if ($stmt->execute()) {
                        // Update session variable
                        $_SESSION['user_image'] = $uploadPath;
                        
                        $response = [
                            'success' => true,
                            'message' => 'Profile image updated successfully',
                            'profile_image' => $uploadPath
                        ];
                    } else {
                        $response = ['success' => false, 'message' => 'Failed to update profile image in database'];
                    }
                    
                    $stmt->close();
                } else {
                    $response = ['success' => false, 'message' => 'Failed to upload image'];
                }
            } else {
                $response = ['success' => false, 'message' => 'Invalid file format. Allowed formats: jpg, jpeg, png, gif'];
            }
        } else {
            $response = ['success' => false, 'message' => 'No image uploaded or upload error'];
        }
    }
    
    // Change password
    if (isset($_POST['action']) && $_POST['action'] == 'change_password') {
        $user_id = checkAuth();
        
        $current_password = $_POST['current_password'];
        $new_password = $_POST['new_password'];
        $confirm_password = $_POST['confirm_password'];
        
        // Validate input
        if (empty($current_password) || empty($new_password) || empty($confirm_password)) {
            $response = ['success' => false, 'message' => 'Please fill in all password fields'];
        } else if ($new_password !== $confirm_password) {
            $response = ['success' => false, 'message' => 'New passwords do not match'];
        } else {
            // Get current password from database
            $stmt = $conn->prepare("SELECT password FROM users WHERE id = ?");
            $stmt->bind_param("i", $user_id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows == 1) {
                $user = $result->fetch_assoc();
                
                // Verify current password
                if (password_verify($current_password, $user['password'])) {
                    // Hash new password
                    $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
                    
                    // Update password
                    $stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
                    $stmt->bind_param("si", $hashed_password, $user_id);
                    
                    if ($stmt->execute()) {
                        $response = ['success' => true, 'message' => 'Password updated successfully'];
                    } else {
                        $response = ['success' => false, 'message' => 'Failed to update password: ' . $conn->error];
                    }
                } else {
                    $response = ['success' => false, 'message' => 'Current password is incorrect'];
                }
            } else {
                $response = ['success' => false, 'message' => 'User not found'];
            }
            
            $stmt->close();
        }
    }
    
    // Delete account
    if (isset($_POST['action']) && $_POST['action'] == 'delete_account') {
        $user_id = checkAuth();
        
        $confirmation = $_POST['confirmation'];
        
        if ($confirmation !== 'DELETE') {
            $response = ['success' => false, 'message' => 'Invalid confirmation'];
        } else {
            $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
            $stmt->bind_param("i", $user_id);
            
            if ($stmt->execute()) {
                // Destroy session
                session_unset();
                session_destroy();
                
                $response = ['success' => true, 'message' => 'Account deleted successfully'];
            } else {
                $response = ['success' => false, 'message' => 'Failed to delete account: ' . $conn->error];
            }
            
            $stmt->close();
        }
    }
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);

$conn->close();
?> 