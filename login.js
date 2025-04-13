// Login Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    initTheme();
    
    // DOM Elements
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginTabs = document.querySelectorAll('.login-tab');
    const formWrappers = document.querySelectorAll('.login-form-wrapper');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const modalClose = document.querySelector('.modal-close');
    const toast = document.getElementById('toast');
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    
    // Toggle between login and register forms
    loginTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            
            // Update active tab
            loginTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding form
            formWrappers.forEach(form => {
                form.classList.remove('active');
            });
            
            if (targetTab === 'login') {
                document.getElementById('loginForm').classList.add('active');
            } else if (targetTab === 'register') {
                document.getElementById('registerForm').classList.add('active');
            }
        });
    });
    
    // Toggle password visibility
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            const icon = button.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
    
    // Mock user data for demonstration
    const mockUsers = [
        {
            email: 'demo@example.com',
            password: 'Password123',
            firstName: 'Demo',
            lastName: 'User',
            userType: 'farmer'
        }
    ];
    
    // Login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('remember').checked;
        
        // Basic validation
        if (!email || !password) {
            showToast('Please fill in all fields', 'error');
            return;
        }
        
        // Check credentials against mock data
        const user = mockUsers.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Store user data in localStorage
            const userData = {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                userType: user.userType,
                isLoggedIn: true
            };
            
            localStorage.setItem('user', JSON.stringify(userData));
            
            showToast('Login successful! Redirecting...', 'success');
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showToast('Invalid email or password', 'error');
        }
    });
    
    // Register form submission
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const userType = document.getElementById('userType').value;
        const terms = document.getElementById('terms').checked;
        
        // Basic validation
        if (!firstName || !lastName || !email || !password || !confirmPassword || !userType) {
            showToast('Please fill in all fields', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }
        
        if (!terms) {
            showToast('Please agree to the Terms of Service and Privacy Policy', 'error');
            return;
        }
        
        // Check if email already exists
        if (mockUsers.some(u => u.email === email)) {
            showToast('This email is already registered', 'error');
            return;
        }
        
        // Create new user (in a real app, this would be a server call)
        const newUser = {
            email,
            password,
            firstName,
            lastName,
            userType
        };
        
        // Add to mock users (simulating database storage)
        mockUsers.push(newUser);
        
        // Store user data in localStorage
        const userData = {
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            userType: newUser.userType,
            isLoggedIn: true
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        
        showToast('Account created successfully! Redirecting...', 'success');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    });
    
    // Handle forgot password
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        forgotPasswordModal.style.display = 'flex';
    });
    
    // Close modal when clicking the X
    modalClose.addEventListener('click', function() {
        forgotPasswordModal.style.display = 'none';
    });
    
    // Close modal when clicking outside the content
    window.addEventListener('click', function(e) {
        if (e.target === forgotPasswordModal) {
            forgotPasswordModal.style.display = 'none';
        }
    });
    
    // Handle forgot password form submission
    forgotPasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('resetEmail').value;
        
        if (!email) {
            showToast('Please enter your email', 'error');
            return;
        }
        
        // Check if email exists in mock data
        const userExists = mockUsers.some(u => u.email === email);
        
        if (userExists) {
            showToast('Password reset link sent to your email', 'success');
            forgotPasswordModal.style.display = 'none';
        } else {
            showToast('Email not found in our records', 'error');
        }
    });
    
    // Theme toggle
    const themeToggleBtn = document.querySelector('.theme-toggle-btn');
    themeToggleBtn.addEventListener('click', toggleTheme);
    
    // Social login buttons (mock functionality)
    const socialButtons = document.querySelectorAll('.social-btn');
    socialButtons.forEach(button => {
        button.addEventListener('click', function() {
            const provider = this.classList.contains('google') ? 'Google' : 'Facebook';
            console.log(`Attempting to login with ${provider}`);
            showToast(`${provider} login initiated`, 'info');
            
            // In a real app, this would redirect to OAuth provider
        });
    });
    
    // Check if user is already logged in
    const checkLoggedInUser = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.isLoggedIn) {
            window.location.href = 'index.html';
        }
    };
    
    // Call the function on page load
    checkLoggedInUser();
});

// Theme functions
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-toggle-btn i');
    if (theme === 'light') {
        themeIcon.className = 'fas fa-moon';
    } else {
        themeIcon.className = 'fas fa-sun';
    }
}

// Toast notification
function showToast(message, type = 'success') {
    const toastContent = toast.querySelector('.toast-content');
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('.toast-icon');
    const toastProgress = toast.querySelector('.toast-progress');
    
    // Set message and type
    toastMessage.textContent = message;
    
    // Set appropriate icon and color
    if (type === 'success') {
        toastIcon.className = 'fas fa-check-circle toast-icon success';
        toastContent.style.backgroundColor = 'var(--success-color, #28a745)';
    } else if (type === 'error') {
        toastIcon.className = 'fas fa-exclamation-circle toast-icon error';
        toastContent.style.backgroundColor = 'var(--error-color, #dc3545)';
    } else if (type === 'warning') {
        toastIcon.className = 'fas fa-exclamation-triangle toast-icon warning';
        toastContent.style.backgroundColor = 'var(--warning-color, #ffc107)';
    } else if (type === 'info') {
        toastIcon.className = 'fas fa-info-circle toast-icon info';
        toastContent.style.backgroundColor = 'var(--info-color, #17a2b8)';
    }
    
    // Show toast
    toast.classList.add('show');
    
    // Reset and start progress bar animation
    toastProgress.style.animation = 'none';
    toastProgress.offsetHeight; // Trigger reflow
    toastProgress.style.animation = 'progress 3s linear forwards';
    
    // Auto-hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
} 