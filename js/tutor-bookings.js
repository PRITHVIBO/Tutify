// Tutor Bookings JavaScript
let currentTab = 'pending';

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

window.addEventListener('load', function () {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (!userData.email || userData.role !== 'tutor') {
        window.location.href = '../login.html';
        return;
    }

    showTab('pending');
});

function showTab(tab) {
    currentTab = tab;

    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    loadBookings(tab);
}

function loadBookings(status) {
    const bookingList = document.getElementById('bookingList');
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
        // In production, call API here
        showTab('confirmed');
    }
}

function rejectBooking(id, student) {
    const reason = prompt(`Provide a reason for rejecting ${student}'s booking:`);
    if (reason) {
        alert(`Booking rejected. ${student} will be notified with your reason.`);
        // In production, call API here
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
                // In production, call API here
                showTab('completed');
            }
        }
    }
}
