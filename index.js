document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    initTheme();
    
    // Initialize user profile in navigation
    initNavigationProfile();
    
    // Update auth buttons based on login status
    updateAuthButtons();
    
    // Initialize onboarding
    initOnboarding();
    
    // Initialize stat counters
    initStatCounters();
    
    // Initialize scroll animations
    initScrollAnimations();
    
    // Initialize tabs
    initTabs();
    
    // Theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        
        // Set initial icon state
        updateThemeIcon();
    }
    
    // Initialize theme from localStorage
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }
    
    // Toggle theme
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        updateThemeIcon();
    }
    
    // Update theme icon
    function updateThemeIcon() {
        const themeIcon = document.querySelector('.theme-toggle i');
        if (themeIcon) {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            
            if (currentTheme === 'dark') {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            } else {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
        }
    }
    
    // Initialize user profile in navigation
    function initNavigationProfile() {
        const profileAvatar = document.querySelector('.profile-avatar');
        const navProfileImg = document.getElementById('nav-profile-img');
        
        if (!profileAvatar && !navProfileImg) return;
        
        fetch('login.php?action=status')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.logged_in) {
                // Update profile image if available
                if (data.user.profile_image) {
                    if (navProfileImg) {
                        navProfileImg.src = data.user.profile_image;
                        navProfileImg.style.display = 'block';
                    }
                    
                    // Also update avatar icon if it exists
                    if (profileAvatar) {
                        const avatarImg = profileAvatar.querySelector('img');
                        const avatarIcon = profileAvatar.querySelector('i');
                        
                        if (avatarImg) {
                            avatarImg.src = data.user.profile_image;
                            avatarImg.style.display = 'block';
                        }
                        
                        if (avatarIcon) {
                            avatarIcon.style.display = 'none';
                        }
                    }
                }
            } else {
                // User not logged in
                if (profileAvatar) {
                    const avatarImg = profileAvatar.querySelector('img');
                    const avatarIcon = profileAvatar.querySelector('i');
                    
                    if (avatarImg) {
                        avatarImg.style.display = 'none';
                    }
                    
                    if (avatarIcon) {
                        avatarIcon.style.display = 'block';
                    }
                }
            }
        })
        .catch(error => {
            console.error('Error checking login status:', error);
        });
    }
    
    // Update the auth buttons based on login status
    function updateAuthButtons() {
        const authButtonsContainer = document.getElementById('auth-buttons');
        const profileIcon = document.querySelector('.user-profile-icon');
        
        if (!authButtonsContainer && !profileIcon) return;
        
        // Check login status from server
        fetch('login.php?action=status')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.logged_in) {
                // User is logged in
                if (authButtonsContainer) {
                    authButtonsContainer.style.display = 'none';
                }
                
                // Show profile icon with user's image
                if (profileIcon) {
                    profileIcon.style.display = 'block';
                    
                    // Update profile image if available
                    const profileImg = profileIcon.querySelector('img');
                    const profileIconPlaceholder = profileIcon.querySelector('i');
                    
                    if (data.user.profile_image && profileImg) {
                        profileImg.src = data.user.profile_image;
                        profileImg.style.display = 'block';
                        
                        if (profileIconPlaceholder) {
                            profileIconPlaceholder.style.display = 'none';
                        }
                    }
                }
            } else {
                // User is not logged in
                if (authButtonsContainer) {
                    authButtonsContainer.innerHTML = `
                        <a href="login.html" class="btn secondary-btn btn-sm login-btn">
                            <i class="fas fa-sign-in-alt"></i> Login
                        </a>
                        <a href="login.html" class="btn primary-btn btn-sm signup-btn">
                            <i class="fas fa-user-plus"></i> Sign Up
                        </a>
                    `;
                    authButtonsContainer.style.display = 'flex';
                }
                
                // Hide profile icon
                if (profileIcon) {
                    profileIcon.style.display = 'none';
                }
            }
        })
        .catch(error => {
            console.error('Error checking login status:', error);
            
            // Show login buttons as fallback
            if (authButtonsContainer) {
                authButtonsContainer.innerHTML = `
                    <a href="login.html" class="btn secondary-btn btn-sm login-btn">
                        <i class="fas fa-sign-in-alt"></i> Login
                    </a>
                    <a href="login.html" class="btn primary-btn btn-sm signup-btn">
                        <i class="fas fa-user-plus"></i> Sign Up
                    </a>
                `;
                authButtonsContainer.style.display = 'flex';
            }
            
            // Hide profile icon
            if (profileIcon) {
                profileIcon.style.display = 'none';
            }
        });
    }
    
    // Initialize onboarding overlay functionality
    function initOnboarding() {
        const onboardingOverlay = document.getElementById('onboarding-overlay');
        const skipOnboarding = document.getElementById('skip-onboarding');
        const nextStep = document.getElementById('next-step');
        const prevStep = document.getElementById('prev-step');
        const steps = document.querySelectorAll('.onboarding-step');
        const dots = document.querySelectorAll('.step-dot');
        
        if (onboardingOverlay && skipOnboarding && nextStep && prevStep) {
            let currentStep = 1;
            
            // Check if onboarding was already shown
            if (localStorage.getItem('onboardingShown')) {
                onboardingOverlay.style.display = 'none';
            } else {
                onboardingOverlay.style.display = 'flex';
            }
            
            skipOnboarding.addEventListener('click', () => {
                onboardingOverlay.style.display = 'none';
                localStorage.setItem('onboardingShown', 'true');
            });
            
            nextStep.addEventListener('click', () => {
                if (currentStep < steps.length) {
                    showStep(currentStep + 1);
                } else {
                    onboardingOverlay.style.display = 'none';
                    localStorage.setItem('onboardingShown', 'true');
                }
            });
            
            prevStep.addEventListener('click', () => {
                if (currentStep > 1) {
                    showStep(currentStep - 1);
                }
            });
            
            dots.forEach(dot => {
                dot.addEventListener('click', () => {
                    const step = parseInt(dot.getAttribute('data-step'));
                    showStep(step);
                });
            });
            
            function showStep(step) {
                currentStep = step;
                
                steps.forEach(s => {
                    s.style.display = 'none';
                });
                
                dots.forEach(d => {
                    d.classList.remove('active');
                });
                
                const currentStepEl = document.querySelector(`.onboarding-step[data-step="${step}"]`);
                const currentDot = document.querySelector(`.step-dot[data-step="${step}"]`);
                
                if (currentStepEl) {
                    currentStepEl.style.display = 'block';
                }
                
                if (currentDot) {
                    currentDot.classList.add('active');
                }
                
                // Update button states
                prevStep.disabled = step === 1;
                
                if (step === steps.length) {
                    nextStep.textContent = 'Get Started';
                } else {
                    nextStep.textContent = 'Next';
                }
            }
        }
    }
    
    // Initialize stat counters with animation
    function initStatCounters() {
        const counters = document.querySelectorAll('.stat-counter');
        
        if (counters.length === 0) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.getAttribute('data-target'));
                    const duration = 2000; // ms
                    let start = 0;
                    const step = timestamp => {
                        if (!start) start = timestamp;
                        const progress = Math.min((timestamp - start) / duration, 1);
                        counter.textContent = Math.floor(progress * target);
                        if (progress < 1) {
                            window.requestAnimationFrame(step);
                        } else {
                            counter.textContent = target;
                        }
                    };
                    window.requestAnimationFrame(step);
                    observer.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });
        
        counters.forEach(counter => {
            observer.observe(counter);
        });
    }
    
    // Initialize scroll animations
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        
        if (animatedElements.length === 0) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });
        
        animatedElements.forEach(element => {
            observer.observe(element);
        });
    }
    
    // Initialize tabs functionality
    function initTabs() {
        const tabs = document.querySelectorAll('.tab');
        
        if (tabs.length === 0) return;
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                
                // Remove active class from all tabs and content
                document.querySelectorAll('.tab').forEach(t => {
                    t.classList.remove('active');
                });
                
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                // Add active class to current tab and content
                tab.classList.add('active');
                const tabContentElement = document.getElementById(tabId);
                if (tabContentElement) {
                    tabContentElement.classList.add('active');
                }
            });
        });
    }
}); 