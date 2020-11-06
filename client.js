const form = document.querySelector('form');
const API_URL = 'http://localhost:5000/done'
//const API_URL ='https://mcpshelper-server.herokuapp.com/done' 

const loadingElement = document.querySelector('.loading')
loadingElement.style.display = "none"

form.addEventListener('submit', (event)=>{
    event.preventDefault();
    let formData = new FormData(form); 
    let name = formData.get('username');
    let password = formData.get('password');

    let loginData = {
        name, 
        password
    };
    console.log('Fetching...')
    loadingElement.style.display = "block"
    fetch(API_URL, {
        method:'POST',
        body:JSON.stringify(loginData),
        headers:{
            'content-type':'application/json',
        }   
    }).then(response => response.json()).then(createdCreds =>{
        let gradeJson = createdCreds
        if(gradeJson.message) {
            alert(gradeJson.message)
            loadingElement.style.display = "none"
            return
        }else{
            loadingElement.style.display = "none"
            localStorage.grades = JSON.stringify(gradeJson)
            window.location.href = "grades.html"
        }
});

});