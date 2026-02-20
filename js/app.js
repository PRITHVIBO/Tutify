// Tutify - Shared JavaScript Utilities
// Author: Tutify Team
// Description: Common functions for API calls, authentication, and UI helpers

// API Base URL Configuration
const API_BASE_URL = '/api';

// ===== Authentication Utilities =====

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is logged in
 */
function isAuthenticated() {
    const user = localStorage.getItem('user');
    return user !== null && user !== undefined;
}

/**
 * Get current user data from localStorage
 * @returns {Object|null} User object or null
 */
function getCurrentUser() {
    try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    } catch (e) {
        console.error('Error parsing user data:', e);
        return null;
    }
}

/**
 * Save user data to localStorage
 * @param {Object} userData - User data object
 */
function setCurrentUser(userData) {
    localStorage.setItem('user', JSON.stringify(userData));
}

/**
 * Clear user session and redirect to home
 */
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('user');
        window.location.href = '../index.html';
    }
}

/**
 * Check user role and redirect if unauthorized
 * @param {string} requiredRole - Required role ('student' or 'tutor')
 */
function requireRole(requiredRole) {
    const user = getCurrentUser();
    if (!user || user.role !== requiredRole) {
        alert('Access denied. Please login with appropriate credentials.');
        window.location.href = '/login.html';
    }
}

// ===== API Call Utilities =====

/**
 * Make an API call with error handling
 * @param {string} endpoint - API endpoint (e.g., 'login.php')
 * @param {Object} options - Fetch options (method, body, etc.)
 * @returns {Promise<Object>} API response data
 */
async function apiCall(endpoint, options = {}) {
    try {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            ...defaultOptions,
            ...options
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
}

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User data
 */
async function loginUser(email, password) {
    return await apiCall('login.php', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
}

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Registration response
 */
async function registerUser(userData) {
    return await apiCall('register.php', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
}

/**
 * Get list of tutors with optional filters
 * @param {Object} filters - Filter criteria (subject, rating, etc.)
 * @returns {Promise<Array>} List of tutors
 */
async function getTutors(filters = {}) {
    const queryString = new URLSearchParams(filters).toString();
    return await apiCall(`get_tutors.php?${queryString}`);
}

/**
 * Book a tutoring session
 * @param {Object} bookingData - Booking details
 * @returns {Promise<Object>} Booking confirmation
 */
async function bookSession(bookingData) {
    return await apiCall('book_session.php', {
        method: 'POST',
        body: JSON.stringify(bookingData)
    });
}

/**
 * Update student progress
 * @param {Object} progressData - Progress update data
 * @returns {Promise<Object>} Update confirmation
 */
async function updateProgress(progressData) {
    return await apiCall('update_progress.php', {
        method: 'POST',
        body: JSON.stringify(progressData)
    });
}

/**
 * Add feedback for a session
 * @param {Object} feedbackData - Feedback details
 * @returns {Promise<Object>} Feedback confirmation
 */
async function addFeedback(feedbackData) {
    return await apiCall('add_feedback.php', {
        method: 'POST',
        body: JSON.stringify(feedbackData)
    });
}

// ===== UI Helper Functions =====

/**
 * Show loading spinner
 * @param {string} elementId - ID of element to show spinner in
 */
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="loading-spinner">⏳ Loading...</div>';
    }
}

/**
 * Hide loading spinner
 * @param {string} elementId - ID of element to hide spinner from
 */
function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        const spinner = element.querySelector('.loading-spinner');
        if (spinner) {
            spinner.remove();
        }
    }
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast ('success', 'error', 'warning', 'info')
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Format time to readable string
 * @param {string} time - Time to format
 * @returns {string} Formatted time string
 */
function formatTime(time) {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Strength object with level and message
 */
function validatePassword(password) {
    if (password.length < 6) {
        return { level: 'weak', message: 'Password must be at least 6 characters' };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;

    if (strength === 4 && password.length >= 8) {
        return { level: 'strong', message: 'Strong password' };
    } else if (strength >= 2) {
        return { level: 'medium', message: 'Medium strength password' };
    } else {
        return { level: 'weak', message: 'Weak password. Add uppercase, numbers, or special characters' };
    }
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Generate avatar initials from name
 * @param {string} name - Full name
 * @returns {string} Initials (e.g., "JD" from "John Doe")
 */
function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Calculate time ago from date
 * @param {string|Date} date - Date to calculate from
 * @returns {string} Time ago string (e.g., "2 hours ago")
 */
function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';

    return Math.floor(seconds) + ' seconds ago';
}

// ===== Form Validation Helpers =====

/**
 * Show error message for form field
 * @param {string} fieldId - Field element ID
 * @param {string} message - Error message
 */
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    field.classList.add('input-error');

    let errorDiv = field.nextElementSibling;
    if (!errorDiv || !errorDiv.classList.contains('error-message')) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        field.parentNode.insertBefore(errorDiv, field.nextSibling);
    }

    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

/**
 * Clear error message for form field
 * @param {string} fieldId - Field element ID
 */
function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    field.classList.remove('input-error');

    const errorDiv = field.nextElementSibling;
    if (errorDiv && errorDiv.classList.contains('error-message')) {
        errorDiv.style.display = 'none';
    }
}

/**
 * Validate form fields
 * @param {Object} fields - Object with field IDs and validation rules
 * @returns {boolean} True if all fields are valid
 */
function validateForm(fields) {
    let isValid = true;

    for (const [fieldId, rules] of Object.entries(fields)) {
        const field = document.getElementById(fieldId);
        if (!field) continue;

        const value = field.value.trim();

        if (rules.required && !value) {
            showFieldError(fieldId, `${rules.label || 'This field'} is required`);
            isValid = false;
            continue;
        }

        if (rules.email && value && !isValidEmail(value)) {
            showFieldError(fieldId, 'Please enter a valid email address');
            isValid = false;
            continue;
        }

        if (rules.minLength && value.length < rules.minLength) {
            showFieldError(fieldId, `${rules.label || 'This field'} must be at least ${rules.minLength} characters`);
            isValid = false;
            continue;
        }

        if (rules.match) {
            const matchField = document.getElementById(rules.match);
            if (matchField && value !== matchField.value) {
                showFieldError(fieldId, rules.matchMessage || 'Fields do not match');
                isValid = false;
                continue;
            }
        }

        clearFieldError(fieldId);
    }

    return isValid;
}

// ===== Animation Helpers =====

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .loading-spinner {
        text-align: center;
        padding: 40px;
        font-size: 1.2em;
        color: var(--text-secondary-day);
    }
    
    .error-message {
        color: var(--error-color);
        font-size: 0.85em;
        margin-top: 5px;
        display: none;
    }
`;
document.head.appendChild(style);

// ===== Export for module usage =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isAuthenticated,
        getCurrentUser,
        setCurrentUser,
        logout,
        requireRole,
        apiCall,
        loginUser,
        registerUser,
        getTutors,
        bookSession,
        updateProgress,
        addFeedback,
        showLoading,
        hideLoading,
        showToast,
        formatDate,
        formatTime,
        isValidEmail,
        validatePassword,
        debounce,
        getInitials,
        timeAgo,
        showFieldError,
        clearFieldError,
        validateForm
    };
}

console.log('✅ Tutify app.js loaded successfully');

// ===== STUDENT DASHBOARD FUNCTIONS =====

function loadStudentDashboard() {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (!userData.email || userData.role !== 'student') {
        window.location.href = '../login.html';
        return;
    }

    document.getElementById('userName').textContent = userData.name || 'Student';
    document.getElementById('userAvatar').textContent = (userData.name || 'S')[0].toUpperCase();

    loadDashboardData();
    loadTutors();
}

function loadDashboardData() {
    setTimeout(() => {
        document.getElementById('totalSessions').textContent = '12';
        document.getElementById('completedSessions').textContent = '8';
        document.getElementById('upcomingSessions').textContent = '4';
        document.getElementById('avgRating').textContent = '4.5';
    }, 500);
}

function loadTutors() {
    const tutors = [
        {
            id: 1,
            name: 'Dr. Sarah Johnson',
            subject: 'Mathematics',
            experience: '10 years',
            rating: 4.8,
            sessions: 150,
            availability: 'Available',
            description: 'Expert in Advanced Mathematics and Calculus'
        },
        {
            id: 2,
            name: 'Prof. Michael Chen',
            subject: 'Physics',
            experience: '8 years',
            rating: 4.9,
            sessions: 120,
            availability: 'Available',
            description: 'Specialized in Quantum Physics and Mechanics'
        },
        {
            id: 3,
            name: 'Ms. Emily Davis',
            subject: 'Chemistry',
            experience: '5 years',
            rating: 4.7,
            sessions: 90,
            availability: 'Busy',
            description: 'Organic Chemistry and Lab Techniques'
        },
        {
            id: 4,
            name: 'Dr. Robert Brown',
            subject: 'Biology',
            experience: '12 years',
            rating: 4.9,
            sessions: 200,
            availability: 'Available',
            description: 'Molecular Biology and Genetics Expert'
        },
        {
            id: 5,
            name: 'Ms. Lisa Anderson',
            subject: 'English',
            experience: '6 years',
            rating: 4.6,
            sessions: 85,
            availability: 'Available',
            description: 'Literature and Advanced Writing Skills'
        },
        {
            id: 6,
            name: 'Mr. David Wilson',
            subject: 'Computer Science',
            experience: '7 years',
            rating: 4.8,
            sessions: 110,
            availability: 'Available',
            description: 'Programming and Data Structures'
        }
    ];

    displayTutors(tutors);
    window.allTutors = tutors;
}

function displayTutors(tutors) {
    const grid = document.getElementById('tutorGrid');
    if (!grid) return;

    grid.innerHTML = '';

    if (tutors.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary-day); grid-column: 1/-1;">No tutors found matching your criteria.</p>';
        return;
    }

    tutors.forEach(tutor => {
        const card = document.createElement('div');
        card.className = 'tutor-card';
        card.innerHTML = `
            <div class="tutor-header">
                <div class="tutor-avatar">${tutor.name[0]}</div>
                <div class="tutor-info">
                    <h3>${tutor.name}</h3>
                    <p>${tutor.experience} experience</p>
                </div>
            </div>
            <div class="tutor-details">
                <span class="tutor-subject">${tutor.subject}</span>
                <div class="rating">⭐ ${tutor.rating} (${tutor.sessions} sessions)</div>
                <p style="color: var(--text-secondary-day); font-size: 0.9em; margin-top: 10px;">${tutor.description}</p>
                <p style="margin-top: 10px; font-weight: 600; color: ${tutor.availability === 'Available' ? 'var(--success-color)' : 'var(--warning-color)'};">
                    ${tutor.availability === 'Available' ? '✅' : '⏰'} ${tutor.availability}
                </p>
            </div>
            <button class="book-btn" onclick="bookSessionNow(${tutor.id}, '${tutor.name}')">
                📅 Book Session
            </button>
        `;
        grid.appendChild(card);
    });
}

function filterTutors() {
    const subject = document.getElementById('subjectFilter').value.toLowerCase();
    const search = document.getElementById('searchTutor').value.toLowerCase();
    const minRating = parseFloat(document.getElementById('ratingFilter').value) || 0;
    const availability = document.getElementById('availabilityFilter').value.toLowerCase();

    const filtered = window.allTutors.filter(tutor => {
        const matchesSubject = !subject || tutor.subject.toLowerCase() === subject;
        const matchesSearch = !search || tutor.name.toLowerCase().includes(search);
        const matchesRating = tutor.rating >= minRating;
        const matchesAvailability = !availability || tutor.availability.toLowerCase() === availability;
        return matchesSubject && matchesSearch && matchesRating && matchesAvailability;
    });

    displayTutors(filtered);
}

function bookSessionNow(tutorId, tutorName) {
    if (confirm(`Book a session with ${tutorName}?`)) {
        alert(`Session booking request sent to ${tutorName}! You will be notified once confirmed.`);
        const current = parseInt(document.getElementById('totalSessions').textContent);
        document.getElementById('totalSessions').textContent = current + 1;
        const upcoming = parseInt(document.getElementById('upcomingSessions').textContent);
        document.getElementById('upcomingSessions').textContent = upcoming + 1;
    }
}

function showSection(section) {
    // Hide all sections
    const sections = ['dashboard', 'bookings', 'settings'];
    sections.forEach(s => {
        const el = document.getElementById(s + '-section');
        if (el) el.style.display = 'none';
    });

    // Update active nav link
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    const navEl = document.getElementById('nav-' + section);
    if (navEl) navEl.classList.add('active');

    // Show requested section
    if (section === 'bookings') {
        document.getElementById('bookings-section').style.display = 'block';
        loadBookings();
    } else if (section === 'settings') {
        document.getElementById('settings-section').style.display = 'block';
        loadSettings();
    } else {
        const dashEl = document.getElementById('dashboard-section');
        if (dashEl) dashEl.style.display = 'block';
    }
    return false;
}

function showBookingTab(tab, btnEl) {
    // Update active tab button
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(t => t.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    loadBookingsByTab(tab);
}

function loadBookings() {
    const bookingsList = document.getElementById('bookings-list');
    const bookings = [
        { id: 1, tutor: 'Dr. Sarah Johnson', subject: 'Mathematics', date: '2026-02-25', time: '2:00 PM', status: 'upcoming' },
        { id: 2, tutor: 'Prof. Michael Chen', subject: 'Physics', date: '2026-02-18', time: '3:30 PM', status: 'completed' },
        { id: 3, tutor: 'Ms. Emily Davis', subject: 'Chemistry', date: '2026-02-10', time: '1:00 PM', status: 'cancelled' }
    ];

    loadBookingsByTab('upcoming');
}

function loadBookingsByTab(tab) {
    const bookingsList = document.getElementById('bookings-list');
    if (!bookingsList) return;

    const userData = getCurrentUser();
    const isTutor = userData && userData.role === 'tutor';

    const studentBookings = [
        { id: 1, person: 'Dr. Sarah Johnson', subject: 'Mathematics', date: '2026-02-25', time: '2:00 PM', status: 'upcoming', duration: '1 hour', rate: '$40' },
        { id: 2, person: 'Prof. Michael Chen', subject: 'Physics', date: '2026-02-18', time: '3:30 PM', status: 'completed', duration: '1.5 hours', rate: '$50' },
        { id: 3, person: 'Ms. Emily Davis', subject: 'Chemistry', date: '2026-02-10', time: '1:00 PM', status: 'cancelled', duration: '1 hour', rate: '$35' }
    ];
    const tutorBookings = [
        { id: 1, person: 'Alex Turner', subject: 'Mathematics', date: '2026-02-25', time: '2:00 PM', status: 'upcoming', duration: '1 hour', rate: '$40' },
        { id: 2, person: 'Jamie Lee', subject: 'Statistics', date: '2026-02-18', time: '3:30 PM', status: 'completed', duration: '1.5 hours', rate: '$50' },
        { id: 3, person: 'Sam Rivera', subject: 'Calculus', date: '2026-02-10', time: '1:00 PM', status: 'cancelled', duration: '1 hour', rate: '$40' }
    ];

    const allBookings = isTutor ? tutorBookings : studentBookings;
    const personLabel = isTutor ? 'Student' : 'Tutor';
    const filtered = allBookings.filter(b => b.status === tab);
    bookingsList.innerHTML = '';

    if (filtered.length === 0) {
        bookingsList.innerHTML = `<div class="empty-state"><p>📭 No ${tab} sessions found.</p></div>`;
        return;
    }

    filtered.forEach(booking => {
        const bookingDiv = document.createElement('div');
        bookingDiv.className = 'booking-card';
        bookingDiv.innerHTML = `
            <div class="booking-card-header">
                <div class="booking-info">
                    <h4>📚 ${booking.subject}</h4>
                    <p><strong>${personLabel}:</strong> ${booking.person}</p>
                    <p><strong>📅 Date:</strong> ${booking.date} at ${booking.time}</p>
                    <p><strong>⏱️ Duration:</strong> ${booking.duration} &nbsp;|&nbsp; <strong>💰 Rate:</strong> ${booking.rate}/hr</p>
                </div>
                <span class="status-badge status-${booking.status}">${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
            </div>
            ${booking.status === 'upcoming' ? `
                <div class="booking-actions">
                    <button class="btn-primary" onclick="alert('Reschedule request sent!')">📅 Reschedule</button>
                    <button class="btn-danger" onclick="cancelBooking(${booking.id})">❌ Cancel</button>
                </div>
            ` : booking.status === 'completed' ? `
                <div class="booking-actions">
                    <button class="btn-primary" onclick="alert('Review submitted!')">⭐ Leave Review</button>
                </div>
            ` : ''}
        `;
        bookingsList.appendChild(bookingDiv);
    });
}

function cancelBooking(id) {
    if (confirm('Are you sure you want to cancel this session?')) {
        alert('✅ Session cancelled successfully.');
        loadBookingsByTab('upcoming');
    }
}

function loadSettings() {
    const userData = getCurrentUser();
    if (!userData) return;

    // Student settings fields
    const nameField = document.getElementById('settingsName');
    const emailField = document.getElementById('settingsEmail');
    const phoneField = document.getElementById('settingsPhone');

    // Tutor settings fields
    const tutorNameField = document.getElementById('settingName');
    const specialtiesField = document.getElementById('settingSpecialties');
    const bioField = document.getElementById('settingBio');
    const rateField = document.getElementById('settingRate');

    if (nameField) nameField.value = userData.name || '';
    if (emailField) emailField.value = userData.email || '';
    if (phoneField) phoneField.value = userData.phone || '';
    if (tutorNameField) tutorNameField.value = userData.name || '';
    if (specialtiesField) specialtiesField.value = userData.subjects || '';
    if (bioField) bioField.value = userData.bio || '';
    if (rateField) rateField.value = userData.hourly_rate || '';
}

function saveProfileSettings() {
    // Support both student (settingsName) and tutor (settingName) field IDs
    const nameInput = document.getElementById('settingsName') || document.getElementById('settingName');
    const phoneInput = document.getElementById('settingsPhone');
    const bioInput = document.getElementById('settingBio');
    const rateInput = document.getElementById('settingRate');
    const specialtiesInput = document.getElementById('settingSpecialties');

    const name = nameInput ? nameInput.value : '';

    if (!name.trim()) {
        alert('❌ Name cannot be empty!');
        return;
    }

    const userData = getCurrentUser();
    userData.name = name;
    if (phoneInput) userData.phone = phoneInput.value;
    if (bioInput) userData.bio = bioInput.value;
    if (rateInput) userData.hourly_rate = rateInput.value;
    if (specialtiesInput) userData.subjects = specialtiesInput.value;
    setCurrentUser(userData);

    alert('✅ Profile settings saved successfully!');
    const userNameEl = document.getElementById('userName');
    const userAvatarEl = document.getElementById('userAvatar');
    if (userNameEl) userNameEl.textContent = name;
    if (userAvatarEl) userAvatarEl.textContent = name[0].toUpperCase();
}

function changePassword() {
    const current = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmPassword').value;

    if (!current || !newPass || !confirm) {
        alert('❌ All fields are required!');
        return;
    }

    if (newPass.length < 6) {
        alert('❌ New password must be at least 6 characters!');
        return;
    }

    if (newPass !== confirm) {
        alert('❌ Passwords do not match!');
        return;
    }

    alert('✅ Password changed successfully!');
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

function savePreferences() {
    alert('✅ Preferences saved successfully!');
}

// ===== STUDENT PROGRESS FUNCTIONS =====

function loadStudentProgress() {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (!userData.email || userData.role !== 'student') {
        window.location.href = '../login.html';
        return;
    }

    loadSessionHistory();
}

function loadSessionHistory() {
    const sessions = [
        {
            id: 1,
            tutor: 'Dr. Sarah Johnson',
            subject: 'Mathematics',
            topic: 'Advanced Calculus',
            date: '2026-02-15',
            duration: '2 hours',
            status: 'completed',
            rating: 5,
            feedback: 'Excellent session! Very clear explanation.'
        },
        {
            id: 2,
            tutor: 'Prof. Michael Chen',
            subject: 'Physics',
            topic: 'Quantum Mechanics',
            date: '2026-02-18',
            duration: '1.5 hours',
            status: 'completed',
            rating: 4,
            feedback: 'Good session, need more practice problems.'
        },
        {
            id: 3,
            tutor: 'Ms. Emily Davis',
            subject: 'Chemistry',
            topic: 'Organic Reactions',
            date: '2026-02-22',
            duration: '2 hours',
            status: 'upcoming',
            rating: null,
            feedback: null
        },
        {
            id: 4,
            tutor: 'Mr. David Wilson',
            subject: 'Computer Science',
            topic: 'Data Structures',
            date: '2026-02-12',
            duration: '3 hours',
            status: 'completed',
            rating: 5,
            feedback: 'Amazing tutor! Very knowledgeable and patient.'
        }
    ];

    const sessionList = document.getElementById('sessionList');
    if (!sessionList) return;

    sessionList.innerHTML = '';

    sessions.forEach(session => {
        const sessionDiv = document.createElement('div');
        sessionDiv.className = 'session-item';

        let statusClass = 'status-completed';
        let statusText = 'Completed';
        if (session.status === 'upcoming') {
            statusClass = 'status-upcoming';
            statusText = 'Upcoming';
        } else if (session.status === 'cancelled') {
            statusClass = 'status-cancelled';
            statusText = 'Cancelled';
        }

        sessionDiv.innerHTML = `
            <div class="session-header">
                <div class="session-title">${session.subject} - ${session.topic}</div>
                <span class="session-status ${statusClass}">${statusText}</span>
            </div>
            <div class="session-details">
                <p><strong>Tutor:</strong> ${session.tutor}</p>
                <p><strong>Date:</strong> ${new Date(session.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Duration:</strong> ${session.duration}</p>
            </div>
            ${session.status === 'completed' ? `
                <div class="feedback-section">
                    ${session.feedback ? `
                        <p><strong>Your Rating:</strong> ${'⭐'.repeat(session.rating)}</p>
                        <p><strong>Feedback:</strong> ${session.feedback}</p>
                    ` : `
                        <button class="add-feedback-btn" onclick="addFeedback(${session.id}, '${session.tutor}')">
                            ⭐ Add Feedback
                        </button>
                    `}
                </div>
            ` : ''}
        `;

        sessionList.appendChild(sessionDiv);
    });
}

function addFeedback(sessionId, tutorName) {
    const rating = prompt(`Rate your session with ${tutorName} (1-5 stars):`);
    if (rating && rating >= 1 && rating <= 5) {
        const feedback = prompt('Share your experience:');
        if (feedback) {
            alert('Thank you for your feedback! It helps us improve.');
            loadSessionHistory();
        }
    }
}

// ===== TUTOR DASHBOARD FUNCTIONS =====

function loadTutorDashboard() {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (!userData.email || userData.role !== 'tutor') {
        window.location.href = '../login.html';
        return;
    }

    document.getElementById('userName').textContent = userData.name || 'Tutor';
    document.getElementById('userAvatar').textContent = (userData.name || 'T')[0].toUpperCase();
    document.getElementById('tutorName').textContent = userData.name || 'Dr. Sarah Johnson';
    document.getElementById('profileAvatar').textContent = (userData.name || 'T')[0].toUpperCase();

    loadStudents();
}

function loadStudents() {
    const students = [
        {
            name: 'John Doe',
            subject: 'Advanced Calculus',
            progress: 85,
            sessions: 12,
            lastSession: '2026-02-15'
        },
        {
            name: 'Emily Smith',
            subject: 'Algebra',
            progress: 72,
            sessions: 8,
            lastSession: '2026-02-18'
        },
        {
            name: 'Michael Brown',
            subject: 'Trigonometry',
            progress: 90,
            sessions: 15,
            lastSession: '2026-02-19'
        },
        {
            name: 'Sarah Wilson',
            subject: 'Statistics',
            progress: 68,
            sessions: 6,
            lastSession: '2026-02-17'
        },
        {
            name: 'David Lee',
            subject: 'Geometry',
            progress: 78,
            sessions: 10,
            lastSession: '2026-02-20'
        },
        {
            name: 'Lisa Anderson',
            subject: 'Calculus II',
            progress: 95,
            sessions: 18,
            lastSession: '2026-02-20'
        }
    ];

    const studentList = document.getElementById('studentList');
    if (!studentList) return;

    studentList.innerHTML = '';

    students.forEach(student => {
        const card = document.createElement('div');
        card.className = 'student-card';
        card.innerHTML = `
            <div class="student-header">
                <div class="student-avatar">${student.name[0]}</div>
                <div class="student-info">
                    <h3>${student.name}</h3>
                    <p style="color: var(--text-secondary-day); font-size: 0.9em;">${student.subject}</p>
                </div>
            </div>
            <div class="progress-indicator">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="font-size: 0.9em;">Progress</span>
                    <span style="font-weight: 600; color: var(--primary-color);">${student.progress}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${student.progress}%"></div>
                </div>
            </div>
            <p style="font-size: 0.85em; color: var(--text-secondary-day); margin-top: 10px;">
                📅 ${student.sessions} sessions | Last: ${new Date(student.lastSession).toLocaleDateString()}
            </p>
            <button class="update-btn" onclick="updateProgress('${student.name}')">
                📝 Update Progress
            </button>
        `;
        studentList.appendChild(card);
    });
}

function updateProgress(studentName) {
    const progress = prompt(`Update progress for ${studentName} (0-100):`);
    if (progress !== null && progress >= 0 && progress <= 100) {
        const notes = prompt('Add session notes:');
        if (notes) {
            alert(`Progress updated for ${studentName}! Student will be notified.`);
            loadStudents();
        }
    }
}

function editProfile() {
    alert('Profile editing feature - Coming soon!');
}

// ===== TUTOR BOOKINGS FUNCTIONS =====

let currentBookingTab = 'pending';

const bookingsData = {
    pending: [
        {
            id: 1,
            student: 'Alex Johnson',
            subject: 'Advanced Mathematics',
            topic: 'Calculus Integration',
            date: '2026-02-25',
            time: '10:00 AM',
            duration: '2 hours',
            level: 'Advanced',
            message: 'Need help with integration techniques'
        },
        {
            id: 2,
            student: 'Maria Garcia',
            subject: 'Statistics',
            topic: 'Probability Theory',
            date: '2026-02-26',
            time: '2:00 PM',
            duration: '1.5 hours',
            level: 'Intermediate',
            message: 'Struggling with conditional probability'
        },
        {
            id: 3,
            student: 'James Lee',
            subject: 'Algebra',
            topic: 'Quadratic Equations',
            date: '2026-02-27',
            time: '4:00 PM',
            duration: '1 hour',
            level: 'Beginner',
            message: 'First time learning quadratics'
        }
    ],
    confirmed: [
        {
            id: 4,
            student: 'Emma Wilson',
            subject: 'Trigonometry',
            topic: 'Sin, Cos, Tan Functions',
            date: '2026-02-22',
            time: '3:00 PM',
            duration: '2 hours',
            level: 'Intermediate'
        },
        {
            id: 5,
            student: 'Oliver Brown',
            subject: 'Geometry',
            topic: 'Circle Theorems',
            date: '2026-02-23',
            time: '11:00 AM',
            duration: '1.5 hours',
            level: 'Intermediate'
        }
    ],
    completed: [
        {
            id: 6,
            student: 'Sophia Davis',
            subject: 'Calculus',
            topic: 'Derivatives',
            date: '2026-02-15',
            time: '1:00 PM',
            duration: '2 hours',
            level: 'Advanced',
            rating: 5,
            feedback: 'Excellent session! Very helpful.'
        }
    ],
    rejected: [
        {
            id: 7,
            student: 'Noah Martinez',
            subject: 'Advanced Calculus',
            topic: 'Differential Equations',
            date: '2026-02-20',
            time: '9:00 AM',
            duration: '3 hours',
            level: 'Advanced',
            reason: 'Schedule conflict'
        }
    ]
};

function loadTutorBookings() {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (!userData.email || userData.role !== 'tutor') {
        window.location.href = '../login.html';
        return;
    }

    showTab('pending');
}

function showTab(tab) {
    currentBookingTab = tab;

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    loadBookings(tab);
}

function loadBookings(status) {
    const bookingList = document.getElementById('bookingList');
    if (!bookingList) return;

    const bookings = bookingsData[status] || [];

    if (bookings.length === 0) {
        bookingList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <h3>No ${status} bookings</h3>
                <p>You don't have any ${status} session bookings at the moment.</p>
            </div>
        `;
        return;
    }

    bookingList.innerHTML = '';

    bookings.forEach(booking => {
        const bookingDiv = document.createElement('div');
        bookingDiv.className = `booking-item booking-${status}`;

        let statusBadge = '';
        let actions = '';

        if (status === 'pending') {
            statusBadge = '<span class="booking-status status-pending">⏳ Pending</span>';
            actions = `
                <div class="booking-actions">
                    <button class="accept-btn" onclick="acceptBooking(${booking.id}, '${booking.student}')">
                        ✅ Accept
                    </button>
                    <button class="reject-btn" onclick="rejectBooking(${booking.id}, '${booking.student}')">
                        ❌ Reject
                    </button>
                </div>
            `;
        } else if (status === 'confirmed') {
            statusBadge = '<span class="booking-status status-confirmed">✅ Confirmed</span>';
            actions = `
                <div class="booking-actions">
                    <button class="complete-btn" onclick="completeBooking(${booking.id}, '${booking.student}')">
                        ✔️ Mark as Complete
                    </button>
                </div>
            `;
        } else if (status === 'completed') {
            statusBadge = '<span class="booking-status status-completed">📚 Completed</span>';
        } else if (status === 'rejected') {
            statusBadge = '<span class="booking-status status-rejected">❌ Rejected</span>';
        }

        bookingDiv.innerHTML = `
            <div class="booking-header">
                <div class="student-details">
                    <div class="student-avatar">${booking.student[0]}</div>
                    <div>
                        <div class="booking-title">${booking.student}</div>
                        <p style="color: var(--text-secondary-day); margin: 5px 0;">${booking.subject} - ${booking.topic}</p>
                    </div>
                </div>
                ${statusBadge}
            </div>

            <div class="booking-details">
                <div class="detail-item">
                    <span>📅</span>
                    <span>${new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                </div>
                <div class="detail-item">
                    <span>🕒</span>
                    <span>${booking.time}</span>
                </div>
                <div class="detail-item">
                    <span>⏱️</span>
                    <span>${booking.duration}</span>
                </div>
                <div class="detail-item">
                    <span>📊</span>
                    <span>${booking.level} Level</span>
                </div>
            </div>

            ${booking.message ? `<p style="padding: 12px; background: rgba(91, 124, 250, 0.05); border-radius: 8px; margin-top: 10px;"><strong>Message:</strong> ${booking.message}</p>` : ''}
            ${booking.feedback ? `<p style="padding: 12px; background: rgba(16, 185, 129, 0.1); border-radius: 8px; margin-top: 10px;"><strong>Rating:</strong> ${'⭐'.repeat(booking.rating)}<br><strong>Feedback:</strong> ${booking.feedback}</p>` : ''}
            ${booking.reason ? `<p style="padding: 12px; background: rgba(239, 68, 68, 0.1); border-radius: 8px; margin-top: 10px;"><strong>Rejection Reason:</strong> ${booking.reason}</p>` : ''}
            
            ${actions}
        `;

        bookingList.appendChild(bookingDiv);
    });
}

function acceptBooking(id, student) {
    if (confirm(`Accept booking request from ${student}?`)) {
        alert(`Booking accepted! ${student} will be notified.`);
        showTab('confirmed');
    }
}

function rejectBooking(id, student) {
    const reason = prompt(`Provide a reason for rejecting ${student}'s booking:`);
    if (reason) {
        alert(`Booking rejected. ${student} will be notified with your reason.`);
        showTab('rejected');
    }
}

function completeBooking(id, student) {
    if (confirm(`Mark session with ${student} as complete?`)) {
        const progress = prompt('Update student progress (0-100):');
        if (progress !== null) {
            const notes = prompt('Add session notes:');
            if (notes) {
                alert(`Session marked as complete! Progress updated for ${student}.`);
                showTab('completed');
            }
        }
    }
}

// ===== Landing/Login/Register Page Logic =====

function initLandingPage() {
    const cards = document.querySelectorAll('.card');
    if (cards.length) {
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.animation = `fadeIn 0.6s ease-out ${index * 0.1}s forwards`;
        });
    }

    document.querySelectorAll('section.buttons a').forEach(btn => {
        btn.addEventListener('click', function () {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 100);
        });
    });
}

function initLoginPage() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const role = document.getElementById('role');
    const alertContainer = document.getElementById('alertContainer');

    const isValidEmailLocal = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    email.addEventListener('blur', function () {
        if (this.value && !isValidEmailLocal(this.value)) {
            showErrorField(email, 'Please enter a valid email address');
        } else {
            clearErrorField(email);
        }
    });

    email.addEventListener('input', function () {
        if (this.value) {
            clearErrorField(this);
        }
    });

    password.addEventListener('input', function () {
        if (this.value) {
            clearErrorField(this);
        }
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        alertContainer.innerHTML = '';

        let isValid = true;

        if (!email.value.trim()) {
            showErrorField(email, 'Email is required');
            isValid = false;
        } else if (!isValidEmailLocal(email.value)) {
            showErrorField(email, 'Please enter a valid email');
            isValid = false;
        }

        if (!password.value) {
            showErrorField(password, 'Password is required');
            isValid = false;
        }

        if (!role.value) {
            showErrorField(role, 'Please select a role');
            isValid = false;
        }

        if (isValid) {
            showSuccessMessage(alertContainer, '🔐 Logging in...');

            // Prepare JSON data instead of FormData
            const loginData = {
                email: email.value.trim(),
                password: password.value,
                role: role.value
            };

            // Submit via AJAX to handle JSON response and redirect
            fetch('api/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Show success alert
                        alert(`✅ Login Successful!\n\nWelcome back, ${data.data.user.name}!\nRedirecting to your dashboard...`);

                        // Store user data in localStorage
                        localStorage.setItem('user', JSON.stringify(data.data.user));

                        // Redirect to appropriate dashboard
                        const dashboard = data.data.user.role === 'tutor'
                            ? 'tutor/dashboard.html'
                            : 'student/dashboard.html';

                        setTimeout(() => {
                            window.location.href = dashboard;
                        }, 1000);
                    } else {
                        // Show error alert
                        alert(`❌ Login Failed\n\n${data.message || 'Invalid email or password. Please try again.'}`);
                        showErrorField(form, data.message || 'Login failed');
                    }
                })
                .catch(error => {
                    alert(`❌ Error\n\n${error.message}`);
                    showErrorField(form, 'Error: ' + error.message);
                });
        }
    });

    applyInputFocusEffects();
}

function initRegisterPage() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const role = document.getElementById('role');
    const alertContainer = document.getElementById('alertContainer');
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');

    const isValidEmailLocal = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    name.addEventListener('blur', function () {
        if (this.value && this.value.trim().length < 3) {
            showErrorField(this, 'Name must be at least 3 characters');
        } else {
            clearErrorField(this);
        }
    });

    name.addEventListener('input', function () {
        if (this.value.trim().length >= 3) {
            clearErrorField(this);
        }
    });

    email.addEventListener('blur', function () {
        if (this.value && !isValidEmailLocal(this.value)) {
            showErrorField(this, 'Please enter a valid email address');
        } else {
            clearErrorField(this);
        }
    });

    email.addEventListener('input', function () {
        if (this.value && isValidEmailLocal(this.value)) {
            clearErrorField(this);
        }
    });

    password.addEventListener('input', function () {
        const strength = getPasswordStrengthLocal(this.value);
        updatePasswordStrengthLocal(strength);

        if (this.value) {
            clearErrorField(this);
        }

        if (confirmPassword.value) {
            checkPasswordMatch();
        }
    });

    confirmPassword.addEventListener('input', function () {
        checkPasswordMatch();
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        alertContainer.innerHTML = '';

        let isValid = true;

        if (!name.value.trim()) {
            showErrorField(name, 'Full name is required');
            isValid = false;
        } else if (name.value.trim().length < 3) {
            showErrorField(name, 'Name must be at least 3 characters');
            isValid = false;
        }

        if (!email.value.trim()) {
            showErrorField(email, 'Email is required');
            isValid = false;
        } else if (!isValidEmailLocal(email.value)) {
            showErrorField(email, 'Please enter a valid email');
            isValid = false;
        }

        if (!password.value) {
            showErrorField(password, 'Password is required');
            isValid = false;
        } else if (password.value.length < 6) {
            showErrorField(password, 'Password must be at least 6 characters');
            isValid = false;
        }

        if (!confirmPassword.value) {
            showErrorField(confirmPassword, 'Please confirm your password');
            isValid = false;
        } else if (password.value !== confirmPassword.value) {
            showErrorField(confirmPassword, 'Passwords do not match');
            isValid = false;
        }

        if (!role.value) {
            showErrorField(role, 'Please select a role');
            isValid = false;
        }

        if (isValid) {
            showSuccessMessage(alertContainer, '✨ Creating your account...');

            // Prepare JSON data instead of FormData
            const registerData = {
                name: name.value.trim(),
                email: email.value.trim(),
                password: password.value,
                role: role.value
            };

            // Submit via AJAX to handle JSON response and redirect
            fetch('api/register.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registerData)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Show success alert
                        alert(`✅ Registration Successful!\n\nWelcome ${data.data.user.name}!\nYour account has been created successfully.\n\nRedirecting to dashboard...`);

                        // Store user data in localStorage
                        const userData = {
                            id: data.data.user.id,
                            name: data.data.user.name,
                            email: data.data.user.email,
                            role: data.data.user.role
                        };
                        localStorage.setItem('user', JSON.stringify(userData));

                        // Redirect to appropriate dashboard
                        const dashboard = data.data.user.role === 'tutor'
                            ? 'tutor/dashboard.html'
                            : 'student/dashboard.html';

                        setTimeout(() => {
                            window.location.href = dashboard;
                        }, 1000);
                    } else {
                        // Show error alert
                        alert(`❌ Registration Failed\n\n${data.message || 'An error occurred during registration. Please try again.'}`);
                        showErrorField(form, data.message || 'Registration failed');
                    }
                })
                .catch(error => {
                    alert(`❌ Error\n\n${error.message}`);
                    showErrorField(form, 'Error: ' + error.message);
                });
        }
    });

    function getPasswordStrengthLocal(pwd) {
        let strength = 'Weak';
        let score = 0;

        if (pwd.length >= 6) score++;
        if (pwd.length >= 8) score++;
        if (pwd.length >= 12) score++;
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^a-zA-Z0-9]/.test(pwd)) score++;

        if (score >= 4) strength = 'Strong';
        else if (score >= 2) strength = 'Medium';

        return strength;
    }

    function updatePasswordStrengthLocal(strength) {
        strengthBar.className = 'password-strength-bar';
        strengthText.style.color = '#666';

        if (strength === 'Weak') {
            strengthBar.classList.add('strength-weak');
            strengthText.textContent = '⚠️ Weak password';
            strengthText.style.color = '#ef4444';
        } else if (strength === 'Medium') {
            strengthBar.classList.add('strength-medium');
            strengthText.textContent = '📊 Medium password';
            strengthText.style.color = '#f59e0b';
        } else if (strength === 'Strong') {
            strengthBar.classList.add('strength-strong');
            strengthText.textContent = '✅ Strong password';
            strengthText.style.color = '#10b981';
        }
    }

    function checkPasswordMatch() {
        if (password.value && confirmPassword.value) {
            if (password.value !== confirmPassword.value) {
                showErrorField(confirmPassword, 'Passwords do not match');
            } else {
                clearErrorField(confirmPassword);
            }
        }
    }

    applyInputFocusEffects();
}

function showErrorField(element, message) {
    element.classList.add('input-error');
    let errorDiv = element.parentElement.querySelector('.error-text');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-text';
        element.parentElement.insertBefore(errorDiv, element.nextSibling);
    }
    errorDiv.textContent = '❌ ' + message;
}

function clearErrorField(element) {
    element.classList.remove('input-error');
    const errorDiv = element.parentElement.querySelector('.error-text');
    if (errorDiv) {
        errorDiv.remove();
    }
}

function showSuccessMessage(container, message) {
    const alert = document.createElement('div');
    alert.className = 'success-message';
    alert.innerHTML = message;
    container.appendChild(alert);
}

function applyInputFocusEffects() {
    document.querySelectorAll('form input, form select').forEach(input => {
        input.addEventListener('focus', function () {
            this.classList.add('input-focus');
        });

        input.addEventListener('blur', function () {
            this.classList.remove('input-focus');
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initLandingPage();
    initLoginPage();
    initRegisterPage();
});
