let jsonData = JSON.parse(localStorage.grades)
let classData = {}
for(let i of jsonData){
    classData[i.Title] = i
}
console.log(jsonData)
const assignmentTemp = {
  Measure:"New Assignment",
  Type:"All Tasks / Assessments",
  Points:"0 / 0",
  Letter:"N/A"
}

for(let data of jsonData){
  let key = data.Title;
  classData[key] = data
}

const gradeColorDict = {
  "A":"greenyellow",
  "B":"deepskyblue",
  "C":"yellow",
  "D":"orange",
  "E":"red",
  "N/A":""
}

let assWeights = {}

for(let period of jsonData){
  let title = period.Title
  let assignmentWeights = {}
  let weights = period.Marks.Mark.GradeCalculationSummary.AssignmentGradeCalc
  for(let weight of weights){

    assignmentWeights[weight.Type]=String(weight.Weight).split("%").shift()
  }
  assWeights[title] = assignmentWeights
}

let FullClassName = jsonData[0].Title

const dropButton = document.querySelector('.navDrop')
const calcButton = document.querySelector('.calculateButton')
const addRowButton = document.querySelector('.addRowButton')
const logOutButton = document.querySelector('.logOutButton')
const removeRowButton = document.querySelector('.removeRowButton')
const dropMenu = document.querySelector('.dropMenu')
generateDropDown(dropMenu, jsonData)
const mainTable = document.querySelector('.gradeTable')
const finalGradeTable = document.querySelector('.finalGrade')
const resetGradeButton = document.querySelector('.resetButton')
const allLinks = document.querySelectorAll('.dropThing')

generateTable(mainTable, FullClassName)
readTable(mainTable)
//takes a string
function roundGrade(grade){
  let gradeLength = String(grade.length)
  if(gradeLength<6){
    return grade
  }
  if(Number(grade[grade.length - 1])>=5){
    let newGrade = grade.split('')
    newGrade[grade.length -2] = String(Number(grade[grade.length-2])+1)
    return newGrade.join('').slice(0,5)
  }
  else{
    return grade.slice(0,5)
  }
}
function generateDropDown(menu, classes){
  classes.forEach((item)=>{
    let a = document.createElement('a')
    let li = document.createElement('li');
    a.href = ""
    a.id = item.Title
    a.className = "dropdown-item dropThing"
    let classTitle = item.Title.replace(/ *\([^)]*\) */g, "")
    a.innerHTML = `${item.Marks.Mark.CalculatedScoreRaw} - ${classTitle}`
    a.id =  item.Title
    a.style.color = gradeColorDict[item.Marks.Mark.CalculatedScoreString]
    li.className = `dropLink`
    li.append(a)
    menu.appendChild(li)
    menu.style.border = "2px solid #000"
  })
  menu.setAttribute("aria-labelledby","btnGroupDrop1")
}
function getLetterGrade(grade){
  let gradeArray = grade.split('/')
  if(gradeArray[0] == "- "){
      return "N/A"
  }
  if(gradeArray[0].replace(/\s/g,'') == "0" && gradeArray[1].replace(/\s/g,'') == "0"){
    return "N/A"
  }
  let actGrade = Number(gradeArray[0])/Number(gradeArray[1])
  if(actGrade >= .895){
    return "A"
  }
  else if(actGrade >= .795){
    return "B"
  }
  else if(actGrade >=.695){
    return "C"
  }
  else if(actGrade >=.595){
    return "D"
  }
  else{
    return "E"
  }
}
function checkIfGrade(grade){
    let possibleGrade = grade.replace(/\//g, '').replace(/\s/g, '').replace(/\./g, '')
    return !isNaN(Number(possibleGrade))
  }
function generateTable(table, fullClassName){
    let className = document.querySelector('.className')
    className.innerHTML = `${fullClassName.replace(/ *\([^)]*\) */g, "")} - ${classData[fullClassName].Staff}`
    let keys = ["Assignment", "Weight", "Score", "Letter"]
    let header = table.createTHead()
    let keyRow = header.insertRow()
    let bold = document.createElement('strong')
    let hiddenKeys = ['Measure', "Type", "Points", "Letter"]
    for(let keyName of keys){
        let keyCell = keyRow.insertCell()
        let keyText = document.createTextNode(keyName)
        bold.append(keyText)
        keyCell.appendChild(keyText)
    }
    header.className = "tableHead"
    let marks = classData[fullClassName].Marks.Mark.Assignments.Assignment
    let tbody = document.createElement('tbody')
    tbody.className = 'gradeBody'
    for(let element of marks){
        let row = tbody.insertRow()
        let rowGrade
        let textNode
        let rowDrop = document.createElement("FORM")
        let rowSelect=  document.createElement("SELECT")
        for(let key of hiddenKeys){
            let cell = row.insertCell()
            if(key == "Points"){
                textNode = element[key]
                if(textNode.includes('Points Possible')){
                textNode = textNode.replace(/[^\d.]+/g,'');
                textNode = "- / " + textNode
                }
                textNode = textNode.slice(0, textNode.length-2)
                rowGrade = getLetterGrade(textNode)
            }
            else if(key =="Measure"){
                textNode = element[key]
            }
            else if(key == "Type"){
                rowDrop.action = ""
                rowDrop.name = "WeightDrop"
                //rowDrop.className = "dropWeight"
                rowSelect.className = "form-control dropWeight"
                for(let weight of classData[fullClassName].Marks.Mark.GradeCalculationSummary.AssignmentGradeCalc){
                    if(weight.Type != "TOTAL"){
                        let option = document.createElement("option")
                        option.value = weight.Type
                        option.innerHTML = weight.Type
                        rowSelect.add(option)
                    }
                    rowSelect.value = element[key]
                }
                rowDrop.appendChild(rowSelect)
            }
            else{
                textNode = rowGrade
            }

            if(key == "Type"){
                cell.appendChild(rowDrop)
            }
            else{
                let text = document.createTextNode(textNode);
                cell.appendChild(text);
            }
            cell.style.padding = "1vw"
            cell.id = key
            if(key == "Points"){
                cell.contentEditable = "true"
            }
        }
        row.className = "gradeRow ogGrade"
        row.style.color = gradeColorDict[rowGrade]
    }
    table.appendChild(tbody)
    calcButton.id = `${classData.Title}`
}
function readTable(table){
    let gBody = document.querySelector('.gradeBody')
    let rows = gBody.rows
    let totGrade = {}
    for(let weight of classData[FullClassName].Marks.Mark.GradeCalculationSummary.AssignmentGradeCalc){
      let tempWeight = {
        "topScore":0,
        "botScore":0,
        "weight":Number(weight.Weight.replace("%",""))
      }
      if(weight.Type != "TOTAL"){
        totGrade[weight.Type] = tempWeight
      }
    }

    for(let row of rows){
      for(let cell of row.cells){
        if(cell.id == "Type"){
          cellWeight = cell.childNodes[0].childNodes[0].value
        }
        else if(cell.id == "Points"){
          cellGrade = cell.innerHTML
          if(!isNaN(Number(cell.innerHTML.split('/')[0]) && !isNaN(Number(cell.innerHTML.split('/')[1])))){
            totGrade[cellWeight].topScore += Number(cell.innerHTML.split('/')[0])
            totGrade[cellWeight].botScore += Number(cell.innerHTML.split('/')[1])
          }
        }
        else if(cell.id == "Letter"){
          let letterGrade = getLetterGrade(cellGrade)
          row.style.color = gradeColorDict[letterGrade]
          cell.innerHTML = letterGrade
        }
      }
    }
    let unroundedFinal = 0
    for(partialGrade in totGrade){
      unroundedFinal += (totGrade[partialGrade].topScore/totGrade[partialGrade].botScore) * totGrade[partialGrade].weight
    }

    let finalGrade = roundGrade(String(unroundedFinal))

    let fLoc = document.querySelector("#finalGradeLocation")
    let fLocBot = document.querySelector('#finalGradeLocationBot')
    fLoc.innerHTML = finalGrade
    fLocBot.innerHTML = finalGrade
}


allLinks.forEach(link =>{
  link.onclick = function(event){
    event.preventDefault()
    mainTable.innerHTML = ""
    FullClassName = link.id
    generateTable(mainTable, FullClassName) 
    let fLoc = document.querySelector("#finalGradeLocation")
    let fLocBot = document.querySelector('#finalGradeLocationBot')
    fLoc.innerHTML = classData[FullClassName].Marks.Mark.CalculatedScoreRaw
    fLocBot.innerHTML = classData[FullClassName].Marks.Mark.CalculatedScoreRaw
  }

  return false
})

calcButton.addEventListener("click", (event)=>{
  event.preventDefault();
  readTable(mainTable)
})

addRowButton.addEventListener("click", (event)=>{
  event.preventDefault();
  let row = mainTable.insertRow()
  for(let key in assignmentTemp){
    let cell = row.insertCell()
    
    if(key != "Type"){
      let text = document.createTextNode(assignmentTemp[key]);
      cell.appendChild(text);
    }
    if(key == "Points"){
      cell.contentEditable = "true"
    }
    else if(key =="Type"){

      let rowDrop = document.createElement("FORM")
      let rowSelect=  document.createElement("SELECT")
      rowDrop.action = ""
      rowDrop.name = "WeightDrop"
      //rowDrop.className = "dropWeight"
      rowSelect.className = "form-control dropWeight"
        for(let weight of classData[FullClassName].Marks.Mark.GradeCalculationSummary.AssignmentGradeCalc){
            if(weight.Type != "TOTAL"){
                let option = document.createElement("option")
                option.value = weight.Type
                option.innerHTML = weight.Type
                rowSelect.add(option)
            }
            rowSelect.value = classData[FullClassName].Marks.Mark.GradeCalculationSummary.AssignmentGradeCalc[0].Type
        }
      rowDrop.appendChild(rowSelect)
      cell.appendChild(rowDrop)
    }
    cell.style.padding = "1vw"
    cell.id = key
  }
  row.className = "gradeRow addedRow"
})

removeRowButton.addEventListener("click", (event)=>{
  event.preventDefault();
  let tableBody = document.querySelector('.gradeBody')
  let bodyRowLen = tableBody.rows.length
  if(tableBody.rows[bodyRowLen -1].className != "gradeRow ogGrade"){
    tableBody.deleteRow(bodyRowLen - 1)
  }
})

resetGradeButton.addEventListener("click", (event)=>{
  event.preventDefault();
  mainTable.innerHTML = ""
  generateTable(mainTable, FullClassName)
})

logOutButton.addEventListener("click", (event)=>{
  event.preventDefault();
  window.location.href = "index.html"
  localStorage.grades = NaN
})

