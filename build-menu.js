let jsonData = JSON.parse(localStorage.grades)

let classData = {}

const assignmentTemp = {
  name:"New Assignment",
  weight:"All Tasks / Assessments",
  score:"0 / 0"
}

for(data of jsonData){
  let key = data.Title;
  classData[key] = data
}

let assWeights = {}

for(period of jsonData){
  let title = period.Title
  let assignmentWeights = {}
  let weights = period.Marks.Mark.GradeCalculationSummary.AssignmentGradeCalc
  for(weight of weights){
    let key = weight.Type.replace(/\s/g, '')

    assignmentWeights[key]=String(weight.Weight).split("%").shift()
  }
  assWeights[title] = assignmentWeights
}

const dropButton = document.querySelector('.navDrop')
const calcButton = document.querySelector('.calculateButton')
const addRowButton = document.querySelector('.addRowButton')

function generateTable(table, data){
  let className = document.querySelector('.className')
  className.innerHTML = `${data.Title} ${data.Staff}`
  let keys = ["Assignment", "Weight", "Score"]
  let header = table.createTHead()
  let keyRow = header.insertRow()

  for(keyName of keys){
      let keyCell = keyRow.insertCell()
      let keyText = document.createTextNode(keyName)
      keyCell.appendChild(keyText)
  }
  keyRow.contentEditable = "false"
  header.className = "tableHead"
  let marks = data.Marks.Mark.Assignments.Assignment

  parsedmarks = []
  for(ass of marks){
    let newobj = {
      name:ass.Measure,
      weight:ass.Type,
      score:ass.Points,
    }
    parsedmarks.push(newobj)
  }
  let body = document.createElement('tbody')
  body.className = 'gradeBody'
  for (let element of parsedmarks) {
    let row = body.insertRow();
    for (key in element) {
      let cell = row.insertCell();
      let textNode = element[key]
      
      if(textNode.includes('Points Possible')){
        textNode = textNode.replace(/[^\d.]+/g,'');
        textNode = "UNGRADED / " + textNode
      }
      let text = document.createTextNode(textNode);
      cell.appendChild(text);
      cell.style.padding = "1vw"
    }
    row.className = "gradeRow"
  }
  table.appendChild(body)
  calcButton.id = `${data.Title}`
}

function generateDropDown(menu, classes){
  classes.forEach((item)=>{
    let a = document.createElement('a')
    let li = document.createElement('li');
    a.href = ""
    a.id = item.Title
    a.className = "dropdown-item dropThing"
    a.innerHTML = item.Title
    a.id =  item.Title
    li.className = `dropLink`
    li.append(a)
    menu.appendChild(li)
  })
}

function readTable(table){
  let tableData = []

  let tableBody = document.querySelector('.gradeBody')
  let bodyRowLen = tableBody.rows.length

  for(let i=0;i<bodyRowLen;i++){
    let oCells = tableBody.rows.item(i).cells
    let oCellLen = oCells.length
    let obj = {
      assignment:'',
      weight:'',
      score:''
    }
    for(let j=0;j<oCellLen;j++){
      if(j%3 == 0){
        obj.assignment = (oCells.item(j).innerHTML)
      }
      else if(j%3 == 1){
        obj.weight = (oCells.item(j).innerHTML).replace(/\s/g,'')
      }
      else{
        obj.score = (oCells.item(j).innerHTML)
        tableData.push(obj)
      }
      
    }
  }
  return tableData
}

function generateFinalGrade(table, className){
  let period = assWeights[className]
  let gradesList = readTable(table)
  let topweightsort = {}
  let botweightsort = {}
  let miniTopGrade
  let miniBotGrade
  
  for(specAss of gradesList){
    let gradearray = specAss.score.split('/')
    gradearray[0] = Number(gradearray[0])
    gradearray[1] = Number(gradearray[1])
    if(!isNaN(gradearray[0])){
      miniTopGrade = gradearray[0]
      miniBotGrade = gradearray[1]
      if(topweightsort[specAss.weight]){
        topweightsort[specAss.weight] += miniTopGrade
        botweightsort[specAss.weight] += miniBotGrade
      }
      else{
        topweightsort[specAss.weight] = miniTopGrade
        botweightsort[specAss.weight] = miniBotGrade
      }
    }
  }
  let finaleGradeArray = []
  var size = Object.keys(topweightsort).length;
  for(i = 0; i< size; i++){
    topWeight = Number(topweightsort[Object.keys(topweightsort)[i]]) * Number(period[Object.keys(topweightsort)[i]])
    botWeight = Number(botweightsort[Object.keys(botweightsort)[i]])
    let grade = topWeight/botWeight
    finaleGradeArray.push(grade)
  }
  let finalGrade = finaleGradeArray.reduce((a,b) => a+b, 0)
  fLoc = document.querySelector("#finalGradeLocation")
  fLoc.innerHTML = String(finalGrade).slice(0,6)
}
let dropMenu = document.querySelector('.dropMenu')
generateDropDown(dropMenu, jsonData)

let table = document.querySelector('.gradeTable')
generateTable(table, jsonData[0])

let finalGradeTable = document.querySelector('.finalGrade')

let a = document.querySelectorAll('.dropThing')

a.forEach(link =>{
  link.onclick = function(event){
    event.preventDefault()
    table.innerHTML = ""
    generateTable(table, classData[link.id])
    generateFinalGrade(table, calcButton.id)
  }
  return false
})

calcButton.addEventListener("click", (event)=>{
  event.preventDefault();
  generateFinalGrade(table, calcButton.id)
})

addRowButton.addEventListener("click", (event)=>{
  event.preventDefault();
  let row = table.insertRow()
  for(key in assignmentTemp){
    let cell = row.insertCell()
    let text = document.createTextNode(assignmentTemp[key]);
    cell.appendChild(text);
    cell.style.padding = "1vw"
  }
  row.className = "gradeRow"
})

generateFinalGrade(table, "AP World History A (SOC2047A)")