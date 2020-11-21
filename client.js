const form = document.querySelector('form');
//const API_URL = 'http://localhost:5000/done'
const API_URL ='https://mcpshelper-server.herokuapp.com/done' 

const loadingElement = document.querySelector('.loading')
loadingElement.style.display = "none"

form.addEventListener('submit', (event)=>{
    event.preventDefault();
    let formData = new FormData(form); 
    let name = formData.get('username');
    let password = formData.get('password');

    if(name == "benji0908" && password == "hugewang42069"){
        window.location.href = "qwertyuiop1234567890.html"
    }
    else if(name == "rick" && password == "roll"){
        window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstleyV"
    }

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
            sessionStorage.grades = JSON.stringify(gradeJson)
            sessionStorage.setItem('status', 'loggedIn')
            loadingElement.style.display = "none"
            window.location.href = "grades.html"
        }
});

});