# 🎓 Tutify – Personalized Tutoring Platform

Tutify is a web-based personalized tutoring platform designed to connect students with tutors based on subject expertise and learning needs. The platform provides a structured workflow for tutor discovery, session booking, progress tracking, and feedback to enhance personalized learning experiences.

---

## 🧩 Problem Statement

Students often struggle to find the right tutor for specific subjects, and existing systems lack personalization, progress tracking, and structured feedback. This leads to inefficient learning experiences and unorganized tutoring workflows.

---

## 💡 Proposed Solution

Tutify solves this problem by providing a centralized platform where:
- Students can search and connect with tutors based on subject needs
- Tutors can manage session requests and track student progress
- Personalized learning is achieved through structured workflows and feedback

---

## 👥 Targeted Users

- **Students:** School and college students seeking personalized academic support  
- **Tutors:** Educators and subject experts offering tutoring services  
- **Educational Institutions (Future):** Schools and coaching centers

---

## ⚙️ System Workflow (4 Steps)

1. **Student Onboarding:**  
   Student registers and logs in. Selects subject and learning level.

2. **Tutor Discovery:**  
   Tutors register with subject expertise. Students search tutors by subject.

3. **Session Booking:**  
   Student books a tutoring session. Tutor accepts or rejects the request.

4. **Progress & Feedback:**  
   Tutor updates learning progress. Student provides feedback and rating.

---

## ✨ Key Features (Planned in 24 Hours)

- Role-based authentication (Student / Tutor)  
- Subject-based tutor search  
- Tutor profile and availability management  
- Session booking and approval system  
- Learning progress tracking  
- Feedback and rating system  
- Simple and user-friendly UI  

---

## 🛠️ Tech Stack

**Frontend**
- HTML
- CSS
- JavaScript

**Backend**
- PHP

**Database**
- MySQL

---

## 🧱 Project Structure

```text
Tutify/
├── index.html
├── login.html
├── register.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── api/
│   ├── db.php
│   ├── login.php
│   ├── register.php
│   ├── get_tutors.php
│   ├── book_session.php
│   ├── update_progress.php
│   └── add_feedback.php
├── student/
│   ├── dashboard.html
│   └── progress.html
├── tutor/
│   ├── dashboard.html
│   └── bookings.html
└── README.md
