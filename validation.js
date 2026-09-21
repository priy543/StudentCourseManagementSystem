function validateLogin(){

    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value;

    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(email==""){
        alert("Email is required");
        return false;
    }

    if(!emailPattern.test(email)){
        alert("Enter a valid email");
        return false;
    }

    if(password==""){
        alert("Password is required");
        return false;
    }

    return true;
}
function validateRegister(){

    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirmPassword").value;
    let department = document.getElementById("department").value.trim();
    let course = document.getElementById("course").value;

    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let namePattern = /^[A-Za-z ]+$/;

    if(name==""){
        alert("Full Name is required");
        return false;
    }

    if(!namePattern.test(name)){
        alert("Name should contain only letters");
        return false;
    }

    if(!emailPattern.test(email)){
        alert("Enter a valid Email Address");
        return false;
    }

    if(password.length < 8){
        alert("Password must contain at least 8 characters");
        return false;
    }

    if(password != confirmPassword){
        alert("Passwords do not match");
        return false;
    }

    if(department==""){
        alert("Department is required");
        return false;
    }

    if(course==""){
        alert("Please select a Course Interest");
        return false;
    }

    return true;
}

function registerUser(){

    if(validateRegister()){

        let student={

            name:document.getElementById("name").value.trim(),

            email:document.getElementById("email").value.trim(),

            password:document.getElementById("password").value,

            department:document.getElementById("department").value.trim(),

            course:document.getElementById("course").value

        };

        saveStudent(student);

        alert("Registration Successful!");

        window.location.href="login.html";

    }

}
function validateForgotPassword(){

    let email = document.getElementById("resetEmail").value.trim();

    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(email==""){
        alert("Email Address is required");
        return false;
    }

    if(!emailPattern.test(email)){
        alert("Enter a valid Email Address");
        return false;
    }

    return true;
}

function sendResetLink(){

    if(validateForgotPassword()){
        alert("Password Reset Link Sent Successfully!");
        window.location.href="reset-password.html";
    }

}
function validateResetPassword(){

    let newPassword = document.getElementById("newPassword").value;
    let confirmPassword = document.getElementById("confirmPassword").value;

    if(newPassword==""){
        alert("New Password is required");
        return false;
    }

    if(newPassword.length < 8){
        alert("Password must be at least 8 characters");
        return false;
    }

    if(confirmPassword==""){
        alert("Confirm Password is required");
        return false;
    }

    if(newPassword != confirmPassword){
        alert("Passwords do not match");
        return false;
    }

    return true;
}

function resetPassword(){

    if(validateResetPassword()){
        alert("Password Updated Successfully!");
        window.location.href="login.html";
    }

}
function validateCourse(){

    let courseName = document.getElementById("courseName").value.trim();
    let instructor = document.getElementById("instructor").value.trim();
    let duration = document.getElementById("duration").value.trim();
    let category = document.getElementById("category").value;
    let description = document.getElementById("description").value.trim();

    let namePattern = /^[A-Za-z ]+$/;

    if(courseName==""){
        alert("Course Name is required");
        return false;
    }

    if(instructor==""){
        alert("Instructor Name is required");
        return false;
    }

    if(!namePattern.test(instructor)){
        alert("Instructor Name should contain only letters");
        return false;
    }

    if(duration==""){
        alert("Course Duration is required");
        return false;
    }

    if(category==""){
        alert("Please select a Course Category");
        return false;
    }

    if(description.length < 20){
        alert("Course Description should contain at least 20 characters");
        return false;
    }

    return true;
}

function addCourse(event){

    event.preventDefault();

    if(validateCourse()){

        alert("Course Added Successfully!");

        window.location.href="admin-dashboard.html";

    }

}