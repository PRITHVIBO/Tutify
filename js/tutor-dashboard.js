// Tutor Dashboard JavaScript
window.addEventListener('load', function () {
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
});

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

function showSection(section) {
    alert(`${section.charAt(0).toUpperCase() + section.slice(1)} section - Coming soon!`);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('user');
        window.location.href = '../login.html';
    }
}
