// Save student details
function saveStudent(student){

    localStorage.setItem("student", JSON.stringify(student));

}

// Get student details
function getStudent(){

    return JSON.parse(localStorage.getItem("student"));

}

// Save login session
function saveLogin(email){

    localStorage.setItem("loggedInUser", email);

}

// Get logged-in user
function getLoggedInUser(){

    return localStorage.getItem("loggedInUser");

}

// Logout
function logoutUser(){

    localStorage.removeItem("loggedInUser");

    window.location.href="login.html";

}