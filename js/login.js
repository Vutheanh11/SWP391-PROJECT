// Electric Transport Login Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const loginBtn = document.getElementById('loginBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    
    // Error message elements
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    
    // Social login buttons
    const googleBtn = document.querySelector('.google-btn');
    const appleBtn = document.querySelector('.apple-btn');
    const signupLink = document.getElementById('signupLink');
    
    // Password visibility toggle
    togglePasswordBtn.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        const icon = this.querySelector('i');
        if (type === 'text') {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
    
    // Input validation functions
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function validatePassword(password) {
        return password.length >= 6;
    }
    
    function showError(errorElement, message) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
    
    function hideError(errorElement) {
        errorElement.classList.remove('show');
        errorElement.textContent = '';
    }
    
    // Real-time validation
    emailInput.addEventListener('blur', function() {
        const email = this.value.trim();
        if (email && !validateEmail(email)) {
            showError(emailError, 'Please enter a valid email address');
        } else {
            hideError(emailError);
        }
    });
    
    emailInput.addEventListener('input', function() {
        if (emailError.classList.contains('show')) {
            hideError(emailError);
        }
    });
    
    passwordInput.addEventListener('blur', function() {
        const password = this.value;
        if (password && !validatePassword(password)) {
            showError(passwordError, 'Password must be at least 6 characters long');
        } else {
            hideError(passwordError);
        }
    });
    
    passwordInput.addEventListener('input', function() {
        if (passwordError.classList.contains('show')) {
            hideError(passwordError);
        }
    });
    
    // Form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const rememberMe = rememberMeCheckbox.checked;
        
        // Reset errors
        hideError(emailError);
        hideError(passwordError);
        
        let isValid = true;
        
        // Validate email
        if (!email) {
            showError(emailError, 'Email is required');
            isValid = false;
        } else if (!validateEmail(email)) {
            showError(emailError, 'Please enter a valid email address');
            isValid = false;
        }
        
        // Validate password
        if (!password) {
            showError(passwordError, 'Password is required');
            isValid = false;
        } else if (!validatePassword(password)) {
            showError(passwordError, 'Password must be at least 6 characters long');
            isValid = false;
        }
        
        if (isValid) {
            performLogin(email, password, rememberMe);
        }
    });
    
    // Login function
    function performLogin(email, password, rememberMe) {
        console.log('performLogin called with:', email, password);
        
        // Show loading state
        loginBtn.classList.add('loading');
        loginBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            console.log('API simulation timeout completed');
            
            // Mock authentication logic
            const mockUsers = [
                { email: 'demo@electromove.com', password: 'demo123' },
                { email: 'user@test.com', password: 'password' },
                { email: 'minhduc@gmail.com', password: '123456789' }
            ];
            
            const user = mockUsers.find(u => u.email === email && u.password === password);
            console.log('User found:', user);
            
            if (user) {
                // Success
                console.log('Login successful, showing success message...');
                showSuccessMessage('Login successful! Redirecting...');
                
                // Store authentication in localStorage (admin.js checks localStorage)
                localStorage.setItem('adminToken', 'mock-token-' + Date.now());
                localStorage.setItem('userEmail', email);
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('loginTime', new Date().toISOString());
                
                // Store login info if remember me is checked
                if (rememberMe) {
                    localStorage.setItem('rememberedEmail', email);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }
                
                console.log('✅ Authentication stored in localStorage:', {
                    adminToken: localStorage.getItem('adminToken'),
                    userEmail: localStorage.getItem('userEmail'),
                    isLoggedIn: localStorage.getItem('isLoggedIn')
                });
                
                // Redirect to admin dashboard immediately
                console.log('🔄 Redirecting to admin.html...');
                setTimeout(() => {
                    console.log('Executing redirect...');
                    window.location.href = 'admin.html';
                }, 500);
            } else {
                // Failed login
                showError(passwordError, 'Invalid email or password. Please try again.');
                resetLoadingState();
            }
        }, 1500); // Simulate network delay
    }
    
    function showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        // Add success message styles
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 500;
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(successDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            successDiv.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (successDiv.parentNode) {
                    successDiv.parentNode.removeChild(successDiv);
                }
            }, 300);
        }, 3000);
    }
    
    function resetLoadingState() {
        loginBtn.classList.remove('loading');
        loginBtn.disabled = false;
    }
    
    function resetForm() {
        loginForm.reset();
        hideError(emailError);
        hideError(passwordError);
        resetLoadingState();
    }
    
    // Social login handlers
    googleBtn.addEventListener('click', function() {
        showTemporaryMessage('Google login would be integrated here');
    });
    
    appleBtn.addEventListener('click', function() {
        showTemporaryMessage('Apple login would be integrated here');
    });
    
    signupLink.addEventListener('click', function(e) {
        e.preventDefault();
        showTemporaryMessage('Signup page would open here');
    });
    
    function showTemporaryMessage(message) {
        const tempMsg = document.createElement('div');
        tempMsg.textContent = message;
        tempMsg.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 212, 255, 0.9);
            color: white;
            padding: 20px 30px;
            border-radius: 12px;
            font-weight: 500;
            z-index: 1000;
            backdrop-filter: blur(10px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        `;
        
        document.body.appendChild(tempMsg);
        
        setTimeout(() => {
            if (tempMsg.parentNode) {
                tempMsg.parentNode.removeChild(tempMsg);
            }
        }, 2000);
    }
    
    // Load remembered email
    function loadRememberedEmail() {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            emailInput.value = rememberedEmail;
            rememberMeCheckbox.checked = true;
        }
    }
    
    // Initialize
    loadRememberedEmail();
    
    // Add smooth animations for form interactions
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.target.closest('form')) {
            emailInput.focus();
        }
    });
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .form-group.focused label {
            color: var(--electric-blue);
        }
        
        .form-group.focused input {
            border-color: var(--electric-blue);
            box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
        }
        
        .success-message {
            animation: slideInRight 0.3s ease;
        }
    `;
    document.head.appendChild(style);
});

// Demo credentials helper
console.log('🚗 ElectroMove Login Demo');
console.log('📧 Email: demo@electromove.com');
console.log('🔑 Password: demo123');
console.log('---');
console.log('Alternative credentials:');
console.log('📧 Email: user@test.com');
console.log('🔑 Password: password');