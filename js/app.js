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
 * Convert 24-hour time string (HH:MM) to 12-hour format (h:MM AM/PM)
 * @param {string} time24 - Time in HH:MM format
 * @returns {string} Time in h:MM AM/PM format
 */
function formatTime12(time24) {
    if (!time24) return '';
    const [hourStr, minute] = time24.split(':');
    let hour = parseInt(hourStr, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${period}`;
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

    document.getElementById('userName').textContent = userData.name || userData.email || 'Student';
    document.getElementById('userAvatar').textContent = (userData.name || userData.email || 'S')[0].toUpperCase();
    const roleEl = document.getElementById('userRole');
    if (roleEl) roleEl.textContent = userData.email || 'Student Account';

    loadDashboardData();
    loadTutors();
}

// ── Shared Global Booking Store ─────────────────────────────────────
// All bookings (from students AND tutors) live in one global array so
// both sides can read/update the same records.
const GLOBAL_BOOKINGS_KEY = 'tutify_all_bookings';

function getGlobalBookings() {
    return JSON.parse(localStorage.getItem(GLOBAL_BOOKINGS_KEY) || '[]');
}
function saveGlobalBookings(bookings) {
    localStorage.setItem(GLOBAL_BOOKINGS_KEY, JSON.stringify(bookings));
}
// Helpers to filter by perspective
function getStudentBookings(email) {
    return getGlobalBookings().filter(b => b.studentEmail === email);
}
function getTutorBookings(tutorName) {
    return getGlobalBookings().filter(b => b.tutorName === tutorName);
}

function loadDashboardData() {
    const user = getCurrentUser();
    if (!user) return;
    const bookings = getStudentBookings(user.email);
    const total = bookings.length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    // count confirmed + pending as upcoming
    const upcoming = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length;
    const rated = bookings.filter(b => b.rating && b.rating > 0);
    const avg = rated.length
        ? (rated.reduce((s, b) => s + b.rating, 0) / rated.length).toFixed(1)
        : '—';
    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setEl('totalSessions', total);
    setEl('completedSessions', completed);
    setEl('upcomingSessions', upcoming);
    setEl('avgRating', avg);
}

function loadTutors() {
    const tutors = [
        { id: 1, name: 'Dr. Sarah Johnson', subject: 'Mathematics', experience: '10 years', rating: 4.8, sessions: 150, availability: 'Available', rate: 50, description: 'Expert in Advanced Mathematics and Calculus' },
        { id: 2, name: 'Prof. Michael Chen', subject: 'Physics', experience: '8 years', rating: 4.9, sessions: 120, availability: 'Available', rate: 55, description: 'Specialized in Quantum Physics and Mechanics' },
        { id: 3, name: 'Ms. Emily Davis', subject: 'Chemistry', experience: '5 years', rating: 4.7, sessions: 90, availability: 'Busy', rate: 45, description: 'Organic Chemistry and Lab Techniques' },
        { id: 4, name: 'Dr. Robert Brown', subject: 'Biology', experience: '12 years', rating: 4.9, sessions: 200, availability: 'Available', rate: 60, description: 'Molecular Biology and Genetics Expert' },
        { id: 5, name: 'Ms. Lisa Anderson', subject: 'English', experience: '6 years', rating: 4.6, sessions: 85, availability: 'Available', rate: 40, description: 'Literature and Advanced Writing Skills' },
        { id: 6, name: 'Mr. David Wilson', subject: 'Computer Science', experience: '7 years', rating: 4.8, sessions: 110, availability: 'Available', rate: 50, description: 'Programming and Data Structures' },
        { id: 7, name: 'Dr. Priya Sharma', subject: 'Mathematics', experience: '9 years', rating: 4.7, sessions: 130, availability: 'Available', rate: 48, description: 'Algebra, Geometry and IB Math' },
        { id: 8, name: 'Mr. Carlos Ruiz', subject: 'History', experience: '4 years', rating: 4.5, sessions: 60, availability: 'Busy', rate: 38, description: 'World History and AP History prep' },
        { id: 9, name: 'Ms. Hannah Park', subject: 'Computer Science', experience: '5 years', rating: 4.8, sessions: 95, availability: 'Available', rate: 45, description: 'Python, Java and Web Development' }
    ];

    window.allTutors = tutors;
    // Clear any browser-autofilled value before rendering so the email never
    // leaks into the search field and wipes out the tutor list.
    const searchEl = document.getElementById('searchTutor');
    if (searchEl) searchEl.value = '';
    filterTutors();
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
        const isBusy = tutor.availability === 'Busy';
        const rate = tutor.rate ? '$' + tutor.rate + '/hr' : '$40/hr';
        const availColor = isBusy ? 'var(--warning-color)' : 'var(--success-color)';
        const availIcon = isBusy ? '⏰' : '✅';
        const btnClass = isBusy ? 'book-btn book-btn-busy' : 'book-btn';
        const btnLabel = isBusy ? '⏰ Request Session' : '📅 Book Session';
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
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top: 10px;">
                    <p style="font-weight:600; color:${availColor};">${availIcon} ${tutor.availability}</p>
                    <span class="tutor-rate">💰 ${rate}</span>
                </div>
            </div>
            <button class="${btnClass}" onclick="bookSessionNow(${tutor.id}, '${tutor.name}')">${btnLabel}</button>
        `;
        grid.appendChild(card);
    });
}

function filterTutors() {
    // Guard: if tutors haven't been loaded yet, load them first and let loadTutors call filterTutors
    if (!window.allTutors || window.allTutors.length === 0) {
        if (typeof loadTutors === 'function') loadTutors();
        return;
    }
    const subject = document.getElementById('subjectFilter').value.toLowerCase();
    const search = (document.getElementById('searchTutor')?.value || '').toLowerCase();
    const minRating = parseFloat(document.getElementById('ratingFilter').value) || 0;
    const availability = document.getElementById('availabilityFilter').value.toLowerCase();

    const filtered = (window.allTutors || []).filter(tutor => {
        const matchesSubject = !subject || tutor.subject.toLowerCase() === subject;
        const matchesSearch = !search || tutor.name.toLowerCase().includes(search);
        const matchesRating = tutor.rating >= minRating;
        const matchesAvailability = !availability || tutor.availability.toLowerCase() === availability;
        return matchesSubject && matchesSearch && matchesRating && matchesAvailability;
    });

    displayTutors(filtered);
    updateFilterBadge(filtered.length, availability);

    // Show suggestions only when there is typed text
    if (search.length > 0) {
        renderSuggestions(filtered.slice(0, 6));
    } else {
        const box = document.getElementById('tutorSuggestions');
        if (box) box.style.display = 'none';
    }
}

function updateFilterBadge(count, availability) {
    const el = document.getElementById('filterResults');
    if (!el) return;
    const label = availability === 'available' ? 'available' : '';
    const color = count > 0 ? 'var(--success-color)' : 'var(--error-color)';
    el.innerHTML = `<span style="color:${color}; font-weight:600; font-size:0.9em;">
        ${count === 0 ? '😕 No tutors found' : `✅ ${count} ${label} tutor${count !== 1 ? 's' : ''} found`}
    </span>`;
}

function renderSuggestions(tutors) {
    const box = document.getElementById('tutorSuggestions');
    if (!box) return;
    if (tutors.length === 0) { box.style.display = 'none'; return; }

    box.innerHTML = tutors.map(t => `
        <div class="suggestion-item" onmousedown="selectSuggestion(${t.id}, '${t.name}')">
            <div class="suggestion-avatar">${t.name[0]}</div>
            <div class="suggestion-details">
                <strong>${t.name}</strong>
                <span>${t.subject} &nbsp;·&nbsp; ⭐ ${t.rating}</span>
            </div>
            <span class="suggestion-tag ${t.availability === 'Available' ? 'tag-available' : 'tag-busy'}">
                ${t.availability === 'Available' ? '✅' : '⏰'} ${t.availability}
            </span>
        </div>
    `).join('');
    box.style.display = 'block';
}

function selectSuggestion(id, name) {
    const input = document.getElementById('searchTutor');
    if (input) input.value = name;
    const box = document.getElementById('tutorSuggestions');
    if (box) box.style.display = 'none';
    filterTutors();
    // Scroll to the matching card
    setTimeout(() => {
        const cards = document.querySelectorAll('.tutor-card');
        cards.forEach(card => {
            if (card.querySelector('h3')?.textContent === name) {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                card.classList.add('highlight-card');
                setTimeout(() => card.classList.remove('highlight-card'), 2000);
            }
        });
    }, 100);
}

function showSuggestions() {
    const search = (document.getElementById('searchTutor')?.value || '').toLowerCase();
    if (search.length > 0) filterTutors();
}

function hideSuggestionsDelayed() {
    setTimeout(() => {
        const box = document.getElementById('tutorSuggestions');
        if (box) box.style.display = 'none';
    }, 200);
}

function bookSessionNow(tutorId, tutorName) {
    const tutor = (window.allTutors || []).find(t => t.id === tutorId);
    const subject = tutor?.subject || 'General';
    const rate = tutor?.rate ? `$${tutor.rate}/hr` : '$40/hr';
    const isBusy = tutor?.availability === 'Busy';

    // Pre-fill modal
    document.getElementById('modalTutorName').value = tutorName;
    document.getElementById('modalSubject').value = subject;
    document.getElementById('modalTopic').value = '';
    document.getElementById('modalMessage').value = '';
    const rateEl = document.getElementById('modalRateDisplay');
    if (rateEl) rateEl.textContent = rate;
    const levelEl = document.getElementById('modalLevel');
    if (levelEl) levelEl.value = 'Beginner';
    // Update modal header hint if tutor is busy
    const modalHint = document.getElementById('modalBusyHint');
    if (modalHint) modalHint.style.display = isBusy ? 'block' : 'none';

    // Default date = 3 days from today, time = 10:00
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 3);
    document.getElementById('modalDate').value = defaultDate.toISOString().split('T')[0];
    document.getElementById('modalDate').min = new Date().toISOString().split('T')[0];
    document.getElementById('modalTime').value = '10:00';
    document.getElementById('modalDuration').value = '2 hours';

    // Store tutorId for submit
    document.getElementById('bookingForm').dataset.tutorId = tutorId;
    document.getElementById('bookingForm').dataset.tutorName = tutorName;

    // Show modal
    document.getElementById('bookingModal').style.display = 'flex';
}

function closeBookingModal() {
    document.getElementById('bookingModal').style.display = 'none';
}

function submitStudentBooking(event) {
    event.preventDefault();
    const form = document.getElementById('bookingForm');
    const tutorName = form.dataset.tutorName;
    const user = getCurrentUser();

    const booking = {
        id: Date.now(),
        studentName: user ? (user.name || user.email) : 'Student',
        studentEmail: user ? user.email : '',
        tutorName: tutorName,
        subject: document.getElementById('modalSubject').value,
        topic: document.getElementById('modalTopic').value,
        date: document.getElementById('modalDate').value,
        time: formatTime12(document.getElementById('modalTime').value),
        duration: document.getElementById('modalDuration').value,
        message: document.getElementById('modalMessage').value,
        rate: (() => { const t = (window.allTutors || []).find(x => x.id === parseInt(form.dataset.tutorId)); return t?.rate ? `$${t.rate}` : '$40'; })(),
        level: document.getElementById('modalLevel')?.value || 'Beginner',
        status: 'pending',   // tutor must accept
        bookedBy: 'student',
        rating: 0,
        createdAt: new Date().toISOString()
    };

    const all = getGlobalBookings();
    all.push(booking);
    saveGlobalBookings(all);

    closeBookingModal();
    loadDashboardData();
    showToast(`📩 Request sent to ${tutorName}! Waiting for confirmation.`, 'info');
}

function showSection(section) {
    const sections = ['dashboard', 'bookings', 'settings'];
    sections.forEach(s => {
        const el = document.getElementById(s + '-section');
        if (el) el.style.display = 'none';
    });
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    const navEl = document.getElementById('nav-' + section);
    if (navEl) navEl.classList.add('active');

    if (section === 'bookings') {
        document.getElementById('bookings-section').style.display = 'block';
        const user = getCurrentUser();
        if (user && user.role === 'tutor') {
            loadTutorBookingsSection();
        } else {
            loadBookings(); // student default = pending tab
        }
    } else if (section === 'settings') {
        document.getElementById('settings-section').style.display = 'block';
        loadSettings();
    } else {
        const dashEl = document.getElementById('dashboard-section');
        if (dashEl) dashEl.style.display = 'block';
        // Always clear any autofilled/stale search value before re-rendering
        const searchEl = document.getElementById('searchTutor');
        if (searchEl) searchEl.value = '';
        // Always re-render tutors when returning to dashboard so Book buttons are never missing
        if (window.allTutors && window.allTutors.length > 0) {
            filterTutors();
        } else {
            loadTutors();
        }
    }
    return false;
}

// ── Student booking tabs ─────────────────────────────────────────────
function showBookingTab(tab, btnEl) {
    document.querySelectorAll('#bookings-section .tab-btn').forEach(t => t.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    if (tab === 'doubts') {
        loadStudentDoubts();
    } else {
        loadBookingsByTab(tab);
    }
}

function loadBookings() {
    loadBookingsByTab('pending');
}

function loadBookingsByTab(tab) {
    const bookingsList = document.getElementById('bookings-list');
    if (!bookingsList) return;
    const user = getCurrentUser();
    if (!user) return;

    const filtered = getStudentBookings(user.email).filter(b => b.status === tab);
    bookingsList.innerHTML = '';

    if (filtered.length === 0) {
        const labels = { pending: 'pending', confirmed: 'confirmed', completed: 'completed', cancelled: 'cancelled' };
        bookingsList.innerHTML = `
            <div class="empty-state">
                <div style="font-size:2.5em; margin-bottom:10px;">📭</div>
                <p style="color:var(--text-secondary-day);">No ${labels[tab] || tab} bookings found.</p>
            </div>`;
        return;
    }

    filtered.forEach(booking => {
        const isConfirmed = booking.status === 'confirmed';
        const isPending = booking.status === 'pending';
        const isCompleted = booking.status === 'completed';
        const isCancelled = booking.status === 'cancelled';

        const statusMap = {
            pending: { label: '⏳ Awaiting Tutor', cls: 'status-pending' },
            confirmed: { label: '✅ Confirmed', cls: 'status-confirmed' },
            completed: { label: '📚 Completed', cls: 'status-completed' },
            cancelled: { label: '❌ Cancelled', cls: 'status-cancelled' }
        };
        const s = statusMap[booking.status] || { label: booking.status, cls: '' };

        // Tutor feedback display for completed bookings
        const tfb = booking.tutorFeedback;
        const tfbHtml = isCompleted
            ? (tfb
                ? '<div style="margin-top:12px; padding:14px; background:rgba(91,124,250,0.07); border-left:4px solid var(--primary-color); border-radius:8px;">'
                + '<p style="font-weight:700; color:var(--primary-color); margin-bottom:8px;">📝 Tutor Feedback:</p>'
                + (tfb.strengths ? '<p style="margin-bottom:4px;"><strong>💪 Strengths:</strong> ' + tfb.strengths + '</p>' : '')
                + (tfb.improvements ? '<p style="margin-bottom:4px;"><strong>📈 Improve:</strong> ' + tfb.improvements + '</p>' : '')
                + '<p style="margin-bottom:4px;"><strong>📋 Notes:</strong> ' + tfb.notes + '</p>'
                + '<p><strong>🎯 Performance:</strong> ' + '⭐'.repeat(tfb.rating) + '</p>'
                + '</div>'
                : '<p style="font-size:0.85em; color:var(--text-secondary-day); margin-top:8px; padding:4px 2px;">⏳ Awaiting tutor feedback...</p>')
            : '';
        const reviewBtn = booking.rating
            ? '<span style="color:var(--warning-color); font-weight:600;">⭐ ' + booking.rating + '/5 — Rating submitted</span>'
            : '<button class="btn-primary" onclick="leaveReview(' + booking.id + ', \'' + booking.tutorName + '\')">\u2b50 Leave Review</button>';
        const actions = isPending ? `
            <div class="booking-actions">
                <button class="btn-danger" onclick="cancelStudentBooking(${booking.id})">❌ Cancel Request</button>
            </div>` :
            isConfirmed ? `
            <div class="booking-actions">
                <button class="btn-danger" onclick="cancelStudentBooking(${booking.id})">❌ Cancel Session</button>
            </div>` :
                isCompleted ? '<div class="booking-actions">' + reviewBtn + '</div>' + tfbHtml : '';

        const div = document.createElement('div');
        div.className = 'booking-card';
        div.innerHTML = `
            <div class="booking-card-header">
                <div class="booking-info">
                    <h4>📚 ${booking.subject}${booking.topic ? ' — ' + booking.topic : ''}</h4>
                    <p><strong>👨‍🏫 Tutor:</strong> ${booking.tutorName}</p>
                    <p><strong>📅 Date:</strong> ${booking.date} at ${booking.time}</p>
                    <p><strong>⏱️ Duration:</strong> ${booking.duration}&nbsp;|&nbsp;<strong>💰 Rate:</strong> ${booking.rate}/hr${booking.level ? `&nbsp;|&nbsp;<strong>🎯 Level:</strong> ${booking.level}` : ''}</p>
                    ${booking.message ? `<p style="margin-top:8px;"><strong>📝 Note:</strong> ${booking.message}</p>` : ''}
                </div>
                <span class="status-badge ${s.cls}">${s.label}</span>
            </div>
            ${actions}
        `;
        bookingsList.appendChild(div);
    });
}

function cancelStudentBooking(id) {
    if (!confirm('Cancel this booking?')) return;
    const all = getGlobalBookings();
    const idx = all.findIndex(b => b.id === id);
    if (idx !== -1) all[idx].status = 'cancelled';
    saveGlobalBookings(all);
    loadDashboardData();
    loadBookingsByTab('pending');
    showToast('✅ Booking cancelled.', 'info');
}

function leaveReview(id, tutorName) {
    const stars = prompt(`Rate your session with ${tutorName} (1–5):`);
    if (!stars || isNaN(stars) || stars < 1 || stars > 5) return;
    const feedback = prompt('Share your experience (optional):') || '';
    const all = getGlobalBookings();
    const idx = all.findIndex(b => b.id === id);
    if (idx !== -1) { all[idx].rating = parseInt(stars); all[idx].feedback = feedback; }
    saveGlobalBookings(all);
    loadDashboardData();
    showToast('⭐ Thank you for your review!', 'success');
    loadBookingsByTab('completed');
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

    document.getElementById('userName').textContent = userData.name || userData.email || 'Tutor';
    document.getElementById('userAvatar').textContent = (userData.name || userData.email || 'T')[0].toUpperCase();
    const roleEl = document.getElementById('userRole');
    if (roleEl) roleEl.textContent = userData.email || 'Tutor Account';
    document.getElementById('tutorName').textContent = userData.name || 'Dr. Sarah Johnson';
    document.getElementById('profileAvatar').textContent = (userData.name || 'T')[0].toUpperCase();

    loadStudents();
    loadAvailableStudents();
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
            <div style="display:flex; gap:8px; margin-top:10px;">
                <button class="update-btn" style="flex:1;" onclick="updateProgress('${student.name}')">
                    📝 Update Progress
                </button>
                <button class="connect-btn" style="flex:1;" onclick="openTutorBookingModal('${student.name}', '${student.subject}')">
                    📅 Book Session
                </button>
            </div>
        `;
        studentList.appendChild(card);
    });
}

function loadAvailableStudents() {
    const container = document.getElementById('availableStudentsList');
    if (!container) return;

    const students = [
        { name: 'Ava Thompson', subject: 'Mathematics', level: 'Grade 11', goal: 'Improve Calculus for college entrance', avatar: 'A', joined: '2 days ago' },
        { name: 'Liam Patel', subject: 'Physics', level: 'Grade 12', goal: 'Ace AP Physics exam', avatar: 'L', joined: '1 day ago' },
        { name: 'Sofia Nguyen', subject: 'Chemistry', level: 'Grade 10', goal: 'Understand organic chemistry basics', avatar: 'S', joined: '3 hours ago' },
        { name: 'Noah Garcia', subject: 'Computer Science', level: 'Grade 9', goal: 'Learn Python from scratch', avatar: 'N', joined: '5 hours ago' },
        { name: 'Emma Wilson', subject: 'English', level: 'Grade 12', goal: 'Essay writing for college apps', avatar: 'E', joined: 'Just now' },
        { name: 'Oliver Kim', subject: 'Biology', level: 'Grade 11', goal: 'Genetics and cell biology help', avatar: 'O', joined: '1 hour ago' }
    ];

    container.innerHTML = '';
    students.forEach(s => {
        const card = document.createElement('div');
        card.className = 'available-student-card';
        card.innerHTML = `
            <div class="as-header">
                <div class="as-avatar">${s.avatar}</div>
                <div class="as-info">
                    <h4>${s.name}</h4>
                    <span class="as-level">${s.level}</span>
                </div>
                <span class="as-time">${s.joined}</span>
            </div>
            <div class="as-body">
                <span class="as-subject">${s.subject}</span>
                <p class="as-goal">🎯 ${s.goal}</p>
            </div>
            <button class="connect-btn" onclick="connectStudent('${s.name}', '${s.subject}')">
                📅 Book Session
            </button>
        `;
        container.appendChild(card);
    });
}

function connectStudent(name, subject) {
    openTutorBookingModal(name, subject);
}

function openTutorBookingModal(studentName, prefillSubject) {
    const modal = document.getElementById('tutorBookingModal');
    if (!modal) return;

    document.getElementById('tModalStudentName').value = studentName;
    document.getElementById('tModalTopic').value = '';
    document.getElementById('tModalNotes').value = '';

    // Pre-select subject if provided
    const subjectSel = document.getElementById('tModalSubject');
    if (prefillSubject) {
        for (let i = 0; i < subjectSel.options.length; i++) {
            if (subjectSel.options[i].value === prefillSubject) {
                subjectSel.selectedIndex = i;
                break;
            }
        }
    } else {
        subjectSel.selectedIndex = 0;
    }

    // Default date = tomorrow, time = 10:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('tModalDate').value = tomorrow.toISOString().split('T')[0];
    document.getElementById('tModalDate').min = new Date().toISOString().split('T')[0];
    document.getElementById('tModalTime').value = '10:00';
    document.getElementById('tModalDuration').value = '2 hours';

    document.getElementById('tutorBookingForm').dataset.studentName = studentName;
    modal.style.display = 'flex';
}

function closeTutorBookingModal() {
    const modal = document.getElementById('tutorBookingModal');
    if (modal) modal.style.display = 'none';
}

function submitTutorBooking(event) {
    event.preventDefault();
    const form = document.getElementById('tutorBookingForm');
    const studentName = form.dataset.studentName;
    const user = getCurrentUser();
    const subject = document.getElementById('tModalSubject').value;
    const topic = document.getElementById('tModalTopic').value;
    const date = document.getElementById('tModalDate').value;
    const time = formatTime12(document.getElementById('tModalTime').value);
    const duration = document.getElementById('tModalDuration').value;
    const notes = document.getElementById('tModalNotes').value;

    const booking = {
        id: Date.now(),
        studentName: studentName,
        studentEmail: '',          // tutor-initiated; student email not known here
        tutorName: user ? (user.name || user.email) : 'Tutor',
        subject, topic, date, time, duration,
        message: notes,
        rate: '$40',
        status: 'confirmed',    // tutor-initiated = auto-confirmed
        bookedBy: 'tutor',
        rating: 0,
        createdAt: new Date().toISOString()
    };

    const all = getGlobalBookings();
    all.push(booking);
    saveGlobalBookings(all);

    closeTutorBookingModal();
    loadTutorBookingsSection();
    showToast(`✅ Session scheduled with ${studentName} on ${date} at ${time}!`, 'success');
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
// All data lives in the shared global store (GLOBAL_BOOKINGS_KEY).

// Called when tutor opens the "Session Bookings" section.
function loadTutorBookingsSection() {
    // Activate the Requests (pending) tab by default
    const firstBtn = document.querySelector('#bookings-section .tab-btn');
    document.querySelectorAll('#bookings-section .tab-btn').forEach(b => b.classList.remove('active'));
    if (firstBtn) firstBtn.classList.add('active');
    loadTutorBookingsByTab('pending');
}

// Tab switcher for tutor booking tabs
function showTutorBookingTab(tab, btnEl) {
    document.querySelectorAll('#bookings-section .tab-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    if (tab === 'doubts') {
        loadTutorDoubts();
    } else {
        loadTutorBookingsByTab(tab);
    }
}

function loadTutorBookingsByTab(tab) {
    const list = document.getElementById('bookings-list');
    if (!list) return;
    const user = getCurrentUser();
    if (!user) return;

    const tutorName = user.name || user.email;
    const all = getTutorBookings(tutorName);
    const items = all.filter(b => b.status === tab);

    list.innerHTML = '';

    if (items.length === 0) {
        const emptyMsg = {
            pending: 'No pending requests from students.',
            confirmed: 'No confirmed sessions yet.',
            completed: 'No completed sessions.',
            cancelled: 'No cancelled sessions.'
        };
        list.innerHTML = `
            <div class="empty-state">
                <div style="font-size:2.5em; margin-bottom:10px;">${tab === 'pending' ? '📩' : '📭'}</div>
                <p style="color:var(--text-secondary-day);">${emptyMsg[tab] || 'Nothing here.'}</p>
            </div>`;
        return;
    }

    items.forEach(booking => {
        const div = document.createElement('div');
        div.className = `booking-item booking-${tab}`;

        const statusMap = {
            pending: '<span class="booking-status status-pending">⏳ Awaiting Response</span>',
            confirmed: '<span class="booking-status status-confirmed">✅ Confirmed</span>',
            completed: '<span class="booking-status status-completed">📚 Completed</span>',
            cancelled: '<span class="booking-status status-rejected">❌ Cancelled</span>'
        };
        const badge = statusMap[booking.status] || '';

        let actions = '';
        if (tab === 'pending') {
            actions = `
                <div class="booking-actions">
                    <button class="accept-btn" onclick="acceptBooking(${booking.id}, '${booking.studentName}')">
                        ✅ Accept
                    </button>
                    <button class="reject-btn" onclick="rejectBooking(${booking.id}, '${booking.studentName}')">
                        ❌ Reject
                    </button>
                </div>`;
        } else if (tab === 'confirmed') {
            actions = `
                <div class="booking-actions">
                    <button class="complete-btn" onclick="completeBooking(${booking.id}, '${booking.studentName}')">
                        ✔️ Mark Complete
                    </button>
                </div>`;
        }

        const displayDate = (() => {
            try { return new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); }
            catch { return booking.date; }
        })();

        div.innerHTML = `
            <div class="booking-header">
                <div class="student-details">
                    <div class="student-avatar">${booking.studentName ? booking.studentName[0] : '?'}</div>
                    <div>
                        <div class="booking-title">${booking.studentName}</div>
                        <p style="color:var(--text-secondary-day); margin:5px 0;">
                            ${booking.subject}${booking.topic ? ' — ' + booking.topic : ''}
                        </p>
                    </div>
                </div>
                ${badge}
            </div>
            <div class="booking-details">
                <div class="detail-item"><span>📅</span><span>${displayDate}</span></div>
                <div class="detail-item"><span>🕒</span><span>${booking.time}</span></div>
                <div class="detail-item"><span>⏱️</span><span>${booking.duration}</span></div>
                <div class="detail-item"><span>💰</span><span>${booking.rate}/hr</span></div>
            </div>
            ${booking.message ? `<p style="padding:12px; background:rgba(91,124,250,0.05); border-radius:8px; margin-top:10px;">
                <strong>📝 Student Note:</strong> ${booking.message}</p>` : ''}
            ${booking.feedback ? `<p style="padding:12px; background:rgba(16,185,129,0.1); border-radius:8px; margin-top:10px;">
                <strong>Rating:</strong> ${'\u2b50'.repeat(booking.rating)}<br>
                <strong>Feedback:</strong> ${booking.feedback}</p>` : ''}
            ${booking.rejectionReason ? `<p style="padding:12px; background:rgba(239,68,68,0.1); border-radius:8px; margin-top:10px;">
                <strong>Rejection Reason:</strong> ${booking.rejectionReason}</p>` : ''}
            ${actions}
        `;
        list.appendChild(div);
    });
}

function acceptBooking(id, studentName) {
    if (!confirm(`Accept booking request from ${studentName}?`)) return;
    const all = getGlobalBookings();
    const idx = all.findIndex(b => b.id === id);
    if (idx !== -1) all[idx].status = 'confirmed';
    saveGlobalBookings(all);
    loadTutorBookingsByTab('pending');
    showToast(`✅ Booking accepted! ${studentName} will see it as Confirmed.`, 'success');
}

function rejectBooking(id, studentName) {
    const reason = prompt(`Reason for rejecting ${studentName}'s request (required):`);
    if (!reason) return;
    const all = getGlobalBookings();
    const idx = all.findIndex(b => b.id === id);
    if (idx !== -1) {
        all[idx].status = 'cancelled';
        all[idx].rejectionReason = reason;
    }
    saveGlobalBookings(all);
    loadTutorBookingsByTab('pending');
    showToast(`🗭 Booking rejected. ${studentName} has been notified.`, 'info');
}

function completeBooking(id, studentName) {
    if (!confirm(`Mark session with ${studentName} as complete? You will be able to leave feedback for the student.`)) return;
    // Mark completed first, then open feedback modal
    const all = getGlobalBookings();
    const idx = all.findIndex(b => b.id === id);
    if (idx !== -1) all[idx].status = 'completed';
    saveGlobalBookings(all);
    loadTutorBookingsByTab('confirmed');
    showToast(`📚 Session with ${studentName} marked as completed!`, 'success');
    // Open feedback modal
    openTutorFeedbackModal(id, studentName);
}

// ── TUTOR FEEDBACK (after session complete) ────────────────────────────
function openTutorFeedbackModal(bookingId, studentName) {
    const modal = document.getElementById('tutorFeedbackModal');
    if (!modal) return;
    const nameEl = document.getElementById('tfStudentName');
    if (nameEl) nameEl.textContent = studentName;
    document.getElementById('tfFeedbackForm').dataset.bookingId = bookingId;
    document.getElementById('tfRating').value = '5';
    document.getElementById('tfStrengths').value = '';
    document.getElementById('tfImprovements').value = '';
    document.getElementById('tfNotes').value = '';
    modal.style.display = 'flex';
}

function closeTutorFeedbackModal() {
    const modal = document.getElementById('tutorFeedbackModal');
    if (modal) modal.style.display = 'none';
}

function skipTutorFeedback() {
    closeTutorFeedbackModal();
    showToast('ℹ️ Feedback skipped. You can still add it later from Completed tab.', 'info');
}

function submitTutorFeedback(event) {
    event.preventDefault();
    const form = document.getElementById('tfFeedbackForm');
    const id = parseInt(form.dataset.bookingId);
    const rating = parseInt(document.getElementById('tfRating').value);
    const strengths = document.getElementById('tfStrengths').value.trim();
    const improvements = document.getElementById('tfImprovements').value.trim();
    const notes = document.getElementById('tfNotes').value.trim();

    const all = getGlobalBookings();
    const idx = all.findIndex(b => b.id === id);
    if (idx !== -1) {
        all[idx].tutorFeedback = { rating, strengths, improvements, notes, sentAt: new Date().toISOString() };
    }
    saveGlobalBookings(all);
    closeTutorFeedbackModal();
    const studentName = all[idx]?.studentName || 'student';
    showToast(`📤 Feedback sent to ${studentName}!`, 'success');
}

// ── DOUBT / QnA SYSTEM ─────────────────────────────────────────────────
const DOUBTS_KEY = 'tutify_doubts';
function getDoubts() { return JSON.parse(localStorage.getItem(DOUBTS_KEY) || '[]'); }
function saveDoubts(d) { localStorage.setItem(DOUBTS_KEY, JSON.stringify(d)); }
function getStudentDoubts(email) { return getDoubts().filter(d => d.studentEmail === email); }
function getTutorDoubts(tutorName) { return getDoubts().filter(d => d.tutorName === tutorName); }

function submitDoubt(event) {
    event.preventDefault();
    const user = getCurrentUser();
    const tutorName = document.getElementById('doubtTutor').value;
    const subject = document.getElementById('doubtSubject').value;
    const question = document.getElementById('doubtQuestion').value.trim();
    const urgency = document.getElementById('doubtUrgency').value;
    if (!tutorName || !subject || !question) return;
    const doubt = {
        id: Date.now(),
        studentName: user ? (user.name || user.email) : 'Student',
        studentEmail: user ? user.email : '',
        tutorName,
        subject,
        question,
        urgency,
        status: 'open',
        createdAt: new Date().toISOString(),
        reply: null,
        repliedAt: null
    };
    const all = getDoubts();
    all.push(doubt);
    saveDoubts(all);
    document.getElementById('doubtQuestion').value = '';
    loadStudentDoubts();
    showToast('❓ Doubt submitted! Your tutor will respond soon.', 'info');
}

function loadStudentDoubts() {
    const user = getCurrentUser();
    if (!user) return;
    const container = document.getElementById('bookings-list');
    if (!container) return;
    const doubts = [...getStudentDoubts(user.email)].reverse();
    const tutorOptions = (window.allTutors || []).map(t =>
        '<option value="' + t.name + '">' + t.name + ' (' + t.subject + ')</option>'
    ).join('');
    const urgIcon = { Normal: '🟢', High: '🟡', Urgent: '🔴' };

    const doubtCards = doubts.map(d => {
        const replyHtml = d.reply
            ? '<div style="margin-top:12px; padding:12px; background:rgba(16,185,129,0.08); border-left:4px solid var(--success-color); border-radius:8px;">'
            + '<p style="font-weight:700; color:var(--success-color); margin-bottom:4px;">💬 Tutor Reply:</p>'
            + '<p>' + d.reply + '</p>'
            + '<p style="font-size:0.78em; color:var(--text-secondary-day); margin-top:4px;">' + new Date(d.repliedAt).toLocaleString() + '</p>'
            + '</div>'
            : '<p style="font-size:0.83em; color:var(--text-secondary-day); margin-top:6px;">⏳ Waiting for tutor reply...</p>';
        const urgHtml = d.urgency !== 'Normal'
            ? '<p style="font-size:0.83em; font-weight:600; margin-top:4px;">' + (urgIcon[d.urgency] || '') + ' Priority: ' + d.urgency + '</p>'
            : '';
        const badge = d.status === 'answered'
            ? '<span class="status-badge status-confirmed" style="white-space:nowrap;">✅ Answered</span>'
            : '<span class="status-badge status-pending" style="white-space:nowrap;">⏳ Open</span>';
        return '<div class="booking-card" style="margin-bottom:12px;">'
            + '<div class="booking-card-header">'
            + '<div class="booking-info">'
            + '<h4>❓ ' + d.question + '</h4>'
            + '<p><strong>👨‍🏫 Tutor:</strong> ' + d.tutorName + ' &nbsp;|&nbsp; <strong>📚 Subject:</strong> ' + d.subject + '</p>'
            + '<p style="font-size:0.82em; color:var(--text-secondary-day);">' + new Date(d.createdAt).toLocaleString() + '</p>'
            + '</div>' + badge + '</div>'
            + urgHtml + replyHtml + '</div>';
    }).join('');

    container.innerHTML =
        '<div style="margin-bottom:20px; padding:18px; background:rgba(91,124,250,0.05); border-radius:12px; border:2px solid rgba(91,124,250,0.15);">'
        + '<h4 style="color:var(--primary-color); margin-bottom:14px;">🙋 Ask a Doubt</h4>'
        + '<form onsubmit="submitDoubt(event)" style="display:flex; flex-direction:column; gap:10px;">'
        + '<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">'
        + '<select id="doubtTutor" class="setting-input" required><option value="">— Select Tutor —</option>' + tutorOptions + '</select>'
        + '<select id="doubtSubject" class="setting-input" required>'
        + '<option value="">— Subject —</option>'
        + '<option value="Mathematics">📐 Mathematics</option>'
        + '<option value="Physics">⚛️ Physics</option>'
        + '<option value="Chemistry">🧪 Chemistry</option>'
        + '<option value="Biology">🔬 Biology</option>'
        + '<option value="English">📖 English</option>'
        + '<option value="Computer Science">💻 Computer Science</option>'
        + '<option value="History">📚 History</option>'
        + '</select></div>'
        + '<select id="doubtUrgency" class="setting-input">'
        + '<option value="Normal">🟢 Normal</option>'
        + '<option value="High">🟡 High Priority</option>'
        + '<option value="Urgent">🔴 Urgent</option>'
        + '</select>'
        + '<textarea id="doubtQuestion" class="setting-input" rows="3" placeholder="Describe your doubt clearly... (e.g. I don&#39;t understand integration by parts)" required style="padding:10px; resize:vertical;"></textarea>'
        + '<button type="submit" class="btn-primary" style="align-self:flex-end; padding:10px 24px;">📤 Submit Doubt</button>'
        + '</form></div>'
        + (doubts.length === 0
            ? '<div class="empty-state"><div style="font-size:2.5em; margin-bottom:10px;">💬</div><p style="color:var(--text-secondary-day);">No doubts yet. Ask your first question above!</p></div>'
            : '<h4 style="font-weight:700; margin-bottom:12px;">📋 My Doubts (' + doubts.length + ')</h4>' + doubtCards);
}

function loadTutorDoubts() {
    const user = getCurrentUser();
    if (!user) return;
    const container = document.getElementById('bookings-list');
    if (!container) return;
    const tutorName = user.name || user.email;
    const doubts = [...getTutorDoubts(tutorName)].reverse();
    const urgIcon = { Normal: '🟢', High: '🟡', Urgent: '🔴' };

    if (doubts.length === 0) {
        container.innerHTML = '<div class="empty-state"><div style="font-size:2.5em; margin-bottom:10px;">💬</div>'
            + '<p style="color:var(--text-secondary-day);">No student doubts received yet.</p></div>';
        return;
    }

    const cards = doubts.map(d => {
        const replyHtml = d.reply
            ? '<div style="margin-top:10px; padding:10px; background:rgba(16,185,129,0.08); border-left:4px solid var(--success-color); border-radius:8px;">'
            + '<strong style="color:var(--success-color);">Your reply:</strong> ' + d.reply
            + '<p style="font-size:0.78em; color:var(--text-secondary-day); margin-top:4px;">' + new Date(d.repliedAt).toLocaleString() + '</p></div>'
            : '<div class="booking-actions" style="margin-top:10px;">'
            + '<button class="accept-btn" onclick="replyToDoubt(' + d.id + ')">💬 Reply to Student</button></div>';
        const urgHtml = d.urgency !== 'Normal'
            ? '<p style="font-size:0.83em; font-weight:600; margin-top:4px;">' + (urgIcon[d.urgency] || '') + ' ' + d.urgency + ' Priority</p>'
            : '';
        const badge = d.status === 'answered'
            ? '<span class="status-badge status-confirmed">✅ Answered</span>'
            : '<span class="status-badge status-pending">⏳ Open</span>';
        return '<div class="booking-item" style="margin-bottom:12px;">'
            + '<div class="booking-header">'
            + '<div class="student-details">'
            + '<div class="student-avatar">' + (d.studentName[0] || '?') + '</div>'
            + '<div><div class="booking-title">' + d.studentName + '</div>'
            + '<p style="color:var(--text-secondary-day); margin:4px 0;">❓ ' + d.question + '</p>'
            + '<p style="font-size:0.82em; color:var(--text-secondary-day);">'
            + '📚 ' + d.subject + ' &nbsp;|&nbsp; ' + new Date(d.createdAt).toLocaleString() + '</p></div></div>'
            + badge + '</div>'
            + urgHtml + replyHtml + '</div>';
    }).join('');

    container.innerHTML = '<h4 style="font-weight:700; margin-bottom:14px;">📩 Student Doubts (' + doubts.length + ')</h4>' + cards;
}

function replyToDoubt(id) {
    const reply = prompt('Enter your reply for the student:');
    if (!reply || !reply.trim()) return;
    const all = getDoubts();
    const idx = all.findIndex(d => d.id === id);
    if (idx !== -1) {
        all[idx].reply = reply.trim();
        all[idx].status = 'answered';
        all[idx].repliedAt = new Date().toISOString();
    }
    saveDoubts(all);
    loadTutorDoubts();
    showToast('✅ Reply sent to student!', 'success');
}

// Legacy shim — tutor/bookings.html still calls loadTutorBookings on load
function loadTutorBookings() {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (!userData.email || userData.role !== 'tutor') {
        window.location.href = '../login.html';
        return;
    }
    loadTutorBookingsByTab('pending');
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

// Close any open booking modal when Escape is pressed
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        const studentModal = document.getElementById('bookingModal');
        const tutorModal = document.getElementById('tutorBookingModal');
        if (studentModal && studentModal.style.display !== 'none') closeBookingModal();
        if (tutorModal && tutorModal.style.display !== 'none') closeTutorBookingModal();
    }
});
