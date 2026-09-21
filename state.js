let appState = {

    isLoggedIn:false,

    studentName:"",

    email:"",

    currentCourse:""

};

function loginStudent(name,email){

    appState.isLoggedIn=true;

    appState.studentName=name;

    appState.email=email;

}

function logoutStudent(){

    appState.isLoggedIn=false;

    appState.studentName="";

    appState.email="";

    appState.currentCourse="";

}

function selectCourse(course){

    appState.currentCourse=course;

}