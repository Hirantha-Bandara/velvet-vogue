// Admin login function
function adminLogin(username, password) {
    // Simple admin credentials (in production, use database)
    const adminCredentials = {
        username: 'admin@velvetvogue.com',
        password: 'admin123'
    };
    
    if (username === adminCredentials.username && password === adminCredentials.password) {
        const adminUser = {
            id: 'ADMIN001',
            name: 'Admin User',
            email: 'admin@velvetvogue.com',
            role: 'Administrator',
            token: 'admin-token-' + Date.now()
        };
        
        localStorage.setItem('velvetVogueAdmin', JSON.stringify(adminUser));
        localStorage.setItem('isAdminLoggedIn', 'true');
        
        return true;
    }
    return false;
}

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Check for admin login
    if (email === 'admin@velvetvogue.com' && password === 'admin123') {
        if (adminLogin(email, password)) {
            showNotification('Admin login successful!', 'success');
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1000);
            return false;
        }
    }
    
    // Regular user login (simulated)
    if (email && password) {
        const user = {
            id: 'USER' + Date.now(),
            email: email,
            name: email.split('@')[0],
            token: 'user-token-' + Date.now()
        };
        
        localStorage.setItem('velvetVogueUser', JSON.stringify(user));
        localStorage.setItem('isUserLoggedIn', 'true');
        
        if (rememberMe) {
            localStorage.setItem('rememberEmail', email);
        }
        
        showNotification('Login successful!', 'success');
        setTimeout(() => {
            const redirect = new URLSearchParams(window.location.search).get('redirect');
            window.location.href = redirect ? redirect + '.html' : 'index.html';
        }, 1000);
    } else {
        showNotification('Please enter valid credentials', 'error');
    }
    
    return false;
}

// Handle registration form submission
function handleRegister(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const termsAccept = document.getElementById('termsAccept').checked;
    
    // Validation
    if (!firstName || !lastName || !email || !password) {
        showNotification('Please fill in all required fields', 'error');
        return false;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return false;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return false;
    }
    
    if (!termsAccept) {
        showNotification('Please accept the terms and conditions', 'error');
        return false;
    }
    
    // Create user
    const user = {
        id: 'USER' + Date.now(),
        firstName: firstName,
        lastName: lastName,
        email: email,
        name: firstName + ' ' + lastName,
        token: 'user-token-' + Date.now()
    };
    
    localStorage.setItem('velvetVogueUser', JSON.stringify(user));
    localStorage.setItem('isUserLoggedIn', 'true');
    
    showNotification('Account created successfully!', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
    
    return false;
}

// Handle forgot password form submission
function handleForgotPassword(event) {
    event.preventDefault();
    
    const email = document.getElementById('resetEmail').value.trim();
    
    if (!email) {
        showNotification('Please enter your email address', 'error');
        return false;
    }
    
    // Simulate password reset
    showNotification('Password reset link sent to ' + email, 'success');
    setTimeout(() => {
        showLoginForm();
    }, 2000);
    
    return false;
}

// Show login form
function showLoginForm() {
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('registerForm').classList.remove('active');
    document.getElementById('forgotPasswordForm').classList.remove('active');
}

// Show register form
function showRegisterForm() {
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('registerForm').classList.add('active');
    document.getElementById('forgotPasswordForm').classList.remove('active');
}

// Show forgot password form
function showForgotPassword() {
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('registerForm').classList.remove('active');
    document.getElementById('forgotPasswordForm').classList.add('active');
}

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

// Social login (simulated)
function socialLogin(provider) {
    showNotification('Redirecting to ' + provider + ' login...', 'info');
    // In real app, integrate with OAuth providers
}

// Close modal
function closeModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'none';
    }
}