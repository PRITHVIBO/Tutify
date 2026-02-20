// Student Progress JavaScript
window.addEventListener('load', function () {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (!userData.email || userData.role !== 'student') {
        window.location.href = '../login.html';
        return;
    }

    loadSessionHistory();
});

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
