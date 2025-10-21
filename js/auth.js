// Initialize Supabase client using configuration
// Note: supabase is already initialized in supabase-config.js

// Authentication state management
let currentUser = null;

// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        currentUser = user;
        updateUIForLoggedInUser();
    }
});

// Sign up function
async function signUp(email, password, fullName) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        });

        if (error) throw error;

        // Store user data locally for admin viewing
        storeUserLocally({
            id: data.user?.id || Date.now().toString(),
            email: email,
            full_name: fullName,
            created_at: new Date().toISOString()
        });

        showMessage('Sign up successful! Please check your email to verify your account.', 'success');
        return { success: true, data };
    } catch (error) {
        showMessage(error.message, 'error');
        return { success: false, error };
    }
}

// Store user data locally
function storeUserLocally(userData) {
    const users = JSON.parse(localStorage.getItem('lohobaUsers') || '[]');
    const existingUserIndex = users.findIndex(u => u.email === userData.email);
    
    if (existingUserIndex === -1) {
        users.push(userData);
        localStorage.setItem('lohobaUsers', JSON.stringify(users));
    }
}

// Sign in function
async function signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        currentUser = data.user;
        
        // Update local user data if exists
        if (currentUser) {
            storeUserLocally({
                id: currentUser.id,
                email: currentUser.email,
                full_name: currentUser.user_metadata?.full_name || '',
                created_at: currentUser.created_at
            });
        }
        
        updateUIForLoggedInUser();
        showMessage('Sign in successful!', 'success');
        return { success: true, data };
    } catch (error) {
        showMessage(error.message, 'error');
        return { success: false, error };
    }
}

// Sign out function
async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        currentUser = null;
        updateUIForLoggedOutUser();
        showMessage('Signed out successfully!', 'success');
        return { success: true };
    } catch (error) {
        showMessage(error.message, 'error');
        return { success: false, error };
    }
}

// Reset password function
async function resetPassword(email) {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password.html'
        });

        if (error) throw error;

        showMessage('Password reset email sent! Check your inbox.', 'success');
        return { success: true };
    } catch (error) {
        showMessage(error.message, 'error');
        return { success: false, error };
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    const userIcon = document.querySelector('.userIcon');
    if (userIcon) {
        userIcon.style.color = '#28a745';
        userIcon.title = `Logged in as ${currentUser.email}`;
    }
    
    // Show user menu and hide auth buttons
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const userName = document.getElementById('userName');
    
    if (authButtons) authButtons.style.display = 'none';
    if (userMenu) {
        userMenu.style.display = 'block';
        if (userName) {
            userName.textContent = currentUser.user_metadata?.full_name || currentUser.email.split('@')[0];
        }
    }
    
    // Update user page if we're on it
    if (window.location.pathname.includes('user.html')) {
        updateUserPage();
    }
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
    const userIcon = document.querySelector('.userIcon');
    if (userIcon) {
        userIcon.style.color = '';
        userIcon.title = 'User Account';
    }
    
    // Hide user menu and show auth buttons
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    
    if (authButtons) authButtons.style.display = 'flex';
    if (userMenu) userMenu.style.display = 'none';
    
    // Update user page if we're on it
    if (window.location.pathname.includes('user.html')) {
        updateUserPage();
    }
}

// Update user page content
function updateUserPage() {
    const userContainer = document.querySelector('.user-container');
    if (!userContainer) return;

    if (currentUser) {
        userContainer.innerHTML = `
            <div class="user-header">
                <i class="fas fa-user-circle" style="color: #28a745;"></i>
                <h1>Welcome Back!</h1>
                <p>Hello, ${currentUser.user_metadata?.full_name || currentUser.email}</p>
            </div>

            <div class="user-info">
                <h3>Account Information</h3>
                <p><strong>Email:</strong> ${currentUser.email}</p>
                <p><strong>Member since:</strong> ${new Date(currentUser.created_at).toLocaleDateString()}</p>
            </div>

            <div class="user-options">
                <a href="cart.html" class="user-btn">
                    <i class="fas fa-shopping-cart"></i> View Cart
                </a>
                <a href="products.html" class="user-btn">
                    <i class="fas fa-shopping-bag"></i> Browse Products
                </a>
                <a href="#" class="user-btn" onclick="signOut()">
                    <i class="fas fa-sign-out-alt"></i> Sign Out
                </a>
                <a href="index.html" class="user-btn">
                    <i class="fas fa-home"></i> Back to Home
                </a>
            </div>
        `;
    } else {
        userContainer.innerHTML = `
            <div class="user-header">
                <i class="fas fa-user-circle"></i>
                <h1>User Account</h1>
                <p>Sign in to access your Lohoba Luxury account</p>
            </div>

            <div class="auth-forms">
                <!-- Sign In Form -->
                <div class="auth-form" id="signInForm">
                    <h3>Sign In</h3>
                    <form onsubmit="handleSignIn(event)">
                        <input type="email" id="signInEmail" placeholder="Email" required>
                        <input type="password" id="signInPassword" placeholder="Password" required>
                        <button type="submit" class="auth-btn">Sign In</button>
                    </form>
                    <p class="auth-switch">Don't have an account? <a href="#" onclick="showSignUpForm()">Sign up</a></p>
                    <p class="auth-switch"><a href="#" onclick="showResetForm()">Forgot password?</a></p>
                </div>

                <!-- Sign Up Form -->
                <div class="auth-form" id="signUpForm" style="display: none;">
                    <h3>Create Account</h3>
                    <form onsubmit="handleSignUp(event)">
                        <input type="text" id="signUpName" placeholder="Full Name" required>
                        <input type="email" id="signUpEmail" placeholder="Email" required>
                        <input type="password" id="signUpPassword" placeholder="Password (min 6 characters)" required minlength="6">
                        <button type="submit" class="auth-btn">Create Account</button>
                    </form>
                    <p class="auth-switch">Already have an account? <a href="#" onclick="showSignInForm()">Sign in</a></p>
                </div>

                <!-- Reset Password Form -->
                <div class="auth-form" id="resetForm" style="display: none;">
                    <h3>Reset Password</h3>
                    <form onsubmit="handleResetPassword(event)">
                        <input type="email" id="resetEmail" placeholder="Email" required>
                        <button type="submit" class="auth-btn">Send Reset Email</button>
                    </form>
                    <p class="auth-switch"><a href="#" onclick="showSignInForm()">Back to sign in</a></p>
                </div>
            </div>

            <div class="user-options">
                <a href="cart.html" class="user-btn">
                    <i class="fas fa-shopping-cart"></i> View Cart
                </a>
                <a href="index.html" class="user-btn">
                    <i class="fas fa-home"></i> Back to Home
                </a>
            </div>
        `;
    }
}

// Form handlers
async function handleSignIn(event) {
    event.preventDefault();
    const email = document.getElementById('signInEmail').value;
    const password = document.getElementById('signInPassword').value;
    
    const result = await signIn(email, password);
    if (result.success) {
        updateUserPage();
    }
}

async function handleSignUp(event) {
    event.preventDefault();
    const fullName = document.getElementById('signUpName').value;
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;
    
    const result = await signUp(email, password, fullName);
    if (result.success) {
        showSignInForm();
    }
}

async function handleResetPassword(event) {
    event.preventDefault();
    const email = document.getElementById('resetEmail').value;
    
    const result = await resetPassword(email);
    if (result.success) {
        showSignInForm();
    }
}

// Form switching functions
function showSignInForm() {
    document.getElementById('signInForm').style.display = 'block';
    document.getElementById('signUpForm').style.display = 'none';
    document.getElementById('resetForm').style.display = 'none';
}

function showSignUpForm() {
    document.getElementById('signInForm').style.display = 'none';
    document.getElementById('signUpForm').style.display = 'block';
    document.getElementById('resetForm').style.display = 'none';
}

function showResetForm() {
    document.getElementById('signInForm').style.display = 'none';
    document.getElementById('signUpForm').style.display = 'none';
    document.getElementById('resetForm').style.display = 'block';
}

// Message display function
function showMessage(message, type) {
    // For modal messages
    const modal = document.querySelector('.auth-modal');
    if (modal) {
        const existingMessage = modal.querySelector('.modal-message');
        if (existingMessage) existingMessage.remove();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `modal-message ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
            text-align: center;
            font-size: 14px;
            ${type === 'success' ? 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;' : 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'}
        `;
        
        const form = modal.querySelector('form');
        form.parentNode.insertBefore(messageDiv, form);
        
        setTimeout(() => messageDiv.remove(), 5000);
        return;
    }
    
    // For user page messages
    const existingMessage = document.querySelector('.auth-message');
    if (existingMessage) existingMessage.remove();

    const messageDiv = document.createElement('div');
    messageDiv.className = `auth-message ${type}`;
    messageDiv.textContent = message;
    
    const userContainer = document.querySelector('.user-container');
    if (userContainer) {
        userContainer.insertBefore(messageDiv, userContainer.firstChild);
        setTimeout(() => messageDiv.remove(), 5000);
    }
}

// Add event listeners for auth buttons with retry mechanism
function initializeAuthButtons() {
    // Header buttons
    const headerSignUpBtn = document.getElementById('signUpBtn');
    const headerSignInBtn = document.getElementById('signInBtn');
    if (headerSignUpBtn) headerSignUpBtn.addEventListener('click', showSignUpModal);
    if (headerSignInBtn) headerSignInBtn.addEventListener('click', showSignInModal);
    
    // Footer buttons
    const footerSignUpBtn = document.getElementById('footerSignUpBtn');
    const footerSignInBtn = document.getElementById('footerSignInBtn');
    if (footerSignUpBtn) footerSignUpBtn.addEventListener('click', showSignUpModal);
    if (footerSignInBtn) footerSignInBtn.addEventListener('click', showSignInModal);
}

// Initialize auth buttons with retry
document.addEventListener('DOMContentLoaded', () => {
    initializeAuthButtons();
    // Retry after content loads
    setTimeout(initializeAuthButtons, 500);
    setTimeout(initializeAuthButtons, 1000);
});

// Show sign up modal
function showSignUpModal() {
    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.innerHTML = `
        <div class="auth-modal-content">
            <span class="close-modal">&times;</span>
            <h2>Create Account</h2>
            <form id="modalSignUpForm">
                <input type="text" id="modalSignUpName" placeholder="Full Name" required>
                <input type="email" id="modalSignUpEmail" placeholder="Email" required>
                <input type="password" id="modalSignUpPassword" placeholder="Password (min 6 characters)" required minlength="6">
                <button type="submit" class="modal-auth-btn">Create Account</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal events
    modal.querySelector('.close-modal').onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    
    // Form submit
    modal.querySelector('#modalSignUpForm').onsubmit = async (e) => {
        e.preventDefault();
        const name = document.getElementById('modalSignUpName').value;
        const email = document.getElementById('modalSignUpEmail').value;
        const password = document.getElementById('modalSignUpPassword').value;
        
        const result = await signUp(email, password, name);
        if (result.success) {
            modal.remove();
        }
    };
}

// Show sign in modal
function showSignInModal() {
    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.innerHTML = `
        <div class="auth-modal-content">
            <span class="close-modal">&times;</span>
            <h2>Sign In</h2>
            <form id="modalSignInForm">
                <input type="email" id="modalSignInEmail" placeholder="Email" required>
                <input type="password" id="modalSignInPassword" placeholder="Password" required>
                <button type="submit" class="modal-auth-btn">Sign In</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal events
    modal.querySelector('.close-modal').onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    
    // Form submit
    modal.querySelector('#modalSignInForm').onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('modalSignInEmail').value;
        const password = document.getElementById('modalSignInPassword').value;
        
        const result = await signIn(email, password);
        if (result.success) {
            modal.remove();
        }
    };
}

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        currentUser = session.user;
        updateUIForLoggedInUser();
    } else if (event === 'SIGNED_OUT') {
        currentUser = null;
        updateUIForLoggedOutUser();
    }
});