// Student Dashboard JavaScript
// Check if user is logged in
window.addEventListener('load', function () {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (!userData.email || userData.role !== 'student') {
        window.location.href = '../login.html';
        return;
    }

    document.getElementById('userName').textContent = userData.name || 'Student';
    document.getElementById('userAvatar').textContent = (userData.name || 'S')[0].toUpperCase();

    loadDashboardData();
    loadTutors();
});

function loadDashboardData() {
    // Simulate loading dashboard stats
    setTimeout(() => {
        document.getElementById('totalSessions').textContent = '12';
        document.getElementById('completedSessions').textContent = '8';
        document.getElementById('upcomingSessions').textContent = '4';
        document.getElementById('avgRating').textContent = '4.5';
    }, 500);
}

function loadTutors() {
    // Sample tutor data - In production, this would come from API
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
    window.allTutors = tutors; // Store for filtering
}

function displayTutors(tutors) {
    const grid = document.getElementById('tutorGrid');
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
            <button class="book-btn" onclick="bookSession(${tutor.id}, '${tutor.name}')">
                📅 Book Session
            </button>
        `;
        grid.appendChild(card);
    });
}

function filterTutors() {
    const subject = document.getElementById('subjectFilter').value.toLowerCase();
    const search = document.getElementById('searchTutor').value.toLowerCase();

    const filtered = window.allTutors.filter(tutor => {
        const matchesSubject = !subject || tutor.subject.toLowerCase() === subject;
        const matchesSearch = !search || tutor.name.toLowerCase().includes(search);
        return matchesSubject && matchesSearch;
    });

    displayTutors(filtered);
}

function bookSession(tutorId, tutorName) {
    if (confirm(`Book a session with ${tutorName}?`)) {
        // In production, this would call the API
        alert(`Session booking request sent to ${tutorName}! You will be notified once confirmed.`);

        // Update stats
        const current = parseInt(document.getElementById('totalSessions').textContent);
        document.getElementById('totalSessions').textContent = current + 1;
        const upcoming = parseInt(document.getElementById('upcomingSessions').textContent);
        document.getElementById('upcomingSessions').textContent = upcoming + 1;
    }
}

function showSection(section) {
    alert(`${section.charAt(0).toUpperCase() + section.slice(1)} section - Coming soon!`);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('user');
        window.location.href = '../login.html';
    }
}
