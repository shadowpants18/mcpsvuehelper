const form = document.querySelector('form');
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/done' : 'https://mcpshelper-server.herokuapp.com/'

form.addEventListener('submit', (event)=>{
    event.preventDefault();
    let formData = new FormData(form); 
    let name = formData.get('username');
    let password = formData.get('password');

    let loginData = {
        name, 
        password
    };

    fetch(API_URL, {
        method:'POST',
        body:JSON.stringify(loginData),
        headers:{
            'content-type':'application/json'
        }
    }).then(response => response.json()).then(createdCreds =>{
        let gradeJson = createdCreds
        if(gradeJson.message) {
            alert(gradeJson.message)
            return
        }else{
            localStorage.grades = JSON.stringify(gradeJson)
            window.location.href = "grades.html"
        }
});

});