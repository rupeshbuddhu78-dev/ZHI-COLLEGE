// security.js - Master Auth Guard for ZHI Portal

// 1. Check if user is logged in for THIS tab
const userDataString = sessionStorage.getItem('loggedInUser');

if (!userDataString) {
    alert("Session Expired or Unauthorized Access! Please login.");
    window.location.href = 'index.html'; 
}

// 2. Parse the data so any page can use it easily
const currentUser = JSON.parse(userDataString);

// 3. Role-Based Access Guard
function checkPageAccess(allowedRoles) {
    if (!allowedRoles.includes(currentUser.role)) {
        alert("Security Alert: Access Denied for your role!");
        
        // Redirect back to their correct dashboard
        if (currentUser.role === 'director') window.location.href = 'admin_dashboard.html';
        else if (currentUser.role === 'accountant') window.location.href = 'accountant_dashboard.html';
        else if (currentUser.role === 'hod') window.location.href = 'academic_dashboard.html';
        else if (currentUser.role === 'staff') window.location.href = 'staff_dashboard.html';
        else if (currentUser.role === 'teacher') window.location.href = 'teacher_dashboard.html';
        else window.location.href = 'index.html';
    }
}

// 4. Global Logout Function
function logoutUser() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}
