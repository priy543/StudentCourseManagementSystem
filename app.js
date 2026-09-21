function loginUser(){

    if(validateLogin()){

        let email=document.getElementById("email").value.trim();

        let password=document.getElementById("password").value;

        let student=getStudent();

        if(student==null){

            alert("No Registered User Found!");

            return;

        }

        if(student.email==email && student.password==password){

            saveLogin(email);

            loginStudent(student.name,email);

            alert("Login Successful!");

            goToStudentDashboard();

        }
        else{

            alert("Invalid Email or Password");

        }

    }

}