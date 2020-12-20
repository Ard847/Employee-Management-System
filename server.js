const mysql = require('mysql');
const express = require('express')
const logo = require("asciiart-logo");
const fs = require("fs")
const inquirer = require('inquirer')
const choices = require("inquirer/lib/objects/choices");
const { promises } = require('dns');
const e = require('express');
 
const server = express()
const port = 3000
 
const password =  process.argv[2];

const connection = mysql.createConnection({
    host : 'localhost',
    port: 3306,
    user:'root',
    password,
    database: 'Homework'
})

const employeUpdate = (role) => inquirer.prompt([{
    type : "list",
    name : "update",
    message: "which role you want to update?",
    choices : role  
  }
  ])

const empUpdate = (role) => inquirer.prompt([{
    type : "list",
    name : "update",
    message: "which employee you want to update?",
    choices : role  
}])

const addRole = () =>inquirer.prompt([
  {
    type: "input",
    name: "role",
    message: "What is the name of the Role?"
  },
  {
    type: "input",
    name : "dep_id",
    message: "What dep is this role?"
  },
  {
    input : "input",
    name: "salary",
    message: "What is the salary of this role?"
  }
]);

const addDep = () => inquirer.prompt([
  {
    type: "input",
    name: "dep",
    message: "What is the name of the Departmant?"
  }
]);
 
const addEmp = (role) => inquirer.prompt([
  {
    type: "input",
    name: "first",
    message: "What is employee first name?"
  },
  {
    type: "input",
    name: "last",
    message: "What is employee last name?"
  },
  {
    type: "list",
    name: "role",
    message: "What is employee role?",
    choices: role
  }
]); 
const del = (resArray) => inquirer.prompt([
  {
  type : "list",
  name : "depSel",
  message: "Which departament do you want to delete",
  choices: resArray
}
]);

  
 const database = async (data) => {
  try{
    if(data.choice ===  "View All Employees"){
      let departament,role
      await connection.query("Select * from departament", (err,res) => {
        if(res){
          departament = res
        }else{
          console.log("error")
        }
      })
      await connection.query("Select * from table_role", (err,res) => {
        if(res){
          role = res
        }else{
          console.log("error")
        }
      })

      await connection.query("Select * from employee", (err,res) => {
        if(res){
          console.log("Id  first_name         last_name title             Department                 Salary                    Manager")
          
          for(let i = 0; i < res.length; i++){
            let roleId = role.find((v) => v.id === res[i].role_id)
            let depname = departament.find((v) => v.id ===  roleId.department_id)
              let x = `${res[i].id}   ${res[i].first_name}                 ${res[i].last_name}                         ${depname._name}                        ${roleId.salary}                  Renato Pombal`
              console.log(x)
          }
        }else{
          console.log(err)
        }
        init()
      })
     
    }
    if(data.choice ===  "View All Employees"){
      connection.query("Select * from departament", (err,res) => {
        if(res){
          console.log(res)
        }else{
          console.log(err)
        }
      })
    }
    if(data.choice ===  "View All Departments"){
     await  connection.query("Select * from departament", (err,res) => {
        if(res){
          console.log(`Id  Departments`)
          for(let i = 0; i < res.length; i++){
              let x = `${res[i].id}   ${res[i]._name}`
              console.log(x)
          }
        }else{
          console.log(err)
        }
        init()
      }) 
    }
   
    if(data.choice ===  "View All Roles"){
      await  connection.query("Select * from table_role", (err,res) => {
         if(res){
           console.log(`Id       Titles               Salary        Department_id`)
          
           for(let i = 0; i < res.length; i++){
               let x = `${res[i].id}   '${res[i].title}'           ${res[i].salary}           ${res[i].department_id} `
               console.log(x)
           }
         }else{
           console.log(err)
         }
         init()
       }) 
     }

  if(data.choice === "Add Department"){
     const added = await addDep() 
    connection.query(`Insert into departament (_name) VALUES ('${added.dep}');`,(err,res) => {
      if(err){
        console.log(err)
      }else{
        console.log("Added With success")
        init()
      }
    })
     
  }
  if(data.choice === "Add Employee"){
    const rolePromissifies = () => {
      return new Promise((resolve,reject) =>{
        connection.query("Select * from table_role",(err,res) => {
          if(res){
            resolve (res)
          }else{
            reject(res)
          }
        })
      
      })
    } 
    
    rolePromissifies().then( async (role) => {
    let roleArray = []
    for(let i = 0; i < role.length;i++){
      roleArray.push(role[i].title)
    }
    const addedEmp = await addEmp(roleArray)  
    let managerId = null
    let role_id
    for(let i = 0; i < role.length; i++){
      if(addedEmp.role.toLowerCase() === role[i].title.toLowerCase()){
        role_id = role[i].id
      }
    }
    connection.query(`Insert into employee (first_name,last_name,role_id,manager_id) VALUES ('${addedEmp.first}','${addedEmp.last}',${role_id}, ${managerId});`,(err,res) => {
      if(err){
        console.log(err)
      }else{
        console.log("Added With success")
        init()
      }
      })
    }) 
  }

  if(data.choice === "Add Role"){
    const addedRole = await addRole() 
     const depPromissifies = () => {
      return new Promise((resolve,reject) =>{
        connection.query("Select * from departament",(err,res) => {
          if(res){
            resolve (res)
          }else{
            reject(res)
          }
        })
      })
    } 
    console.log(addedRole)
    depPromissifies().then((dep) =>{
      let departamentId
      for(let i = 0; i < dep.length; i++){
        if(addedRole.dep_id === dep[i]._name){
          departamentId = dep[i].id
        }
      }
       connection.query(`Insert into table_role (title,salary,department_id) VALUES ('${addedRole.role}', ${addedRole.salary} , ${departamentId});`,(err,res) => {
          if(err){
            console.log(err)
          }else{
            console.log("Added With success",)
          }
        }) 
      })
  init()
  }
  if(data.choice === "Remove Department"){
    let deleted
    const depPromissifies = () => {
      return new Promise((resolve,reject) =>{
        connection.query("Select * from departament",(err,res) => {
          if(res){
            resolve (res)
          }else{
            reject(res)
          }
        })
      })
    } 
    depPromissifies().
    then((res) => {
      let resArray = []
      
      for(let i = 0; i < res.length; i++){
        resArray.push(res[i]._name)
      }
      console.log(res)
      return {res,resArray}
    }).
    then(async ({res,resArray}) => {
      console.log(resArray)
      const d = await del(resArray)
      console.log(d.depSel)
      return d.depSel 
    }).
    then((depSel) => {
       connection.query(`Delete from departament where _name = "${depSel}";`,(err,res) => {
        if(err){
          console.log(err)
        }else{
          console.log("Deleted With success")
          init()
        } 
        }) 
    })
  }
  if(data.choice === "Remove Role"){
    let deleted
    const depPromissifies = () => {
      return new Promise((resolve,reject) =>{
        connection.query("Select * from table_role",(err,res) => {
          if(res){
            resolve (res)
          }else{
            reject(res)
          }
        })
      })
    } 
    depPromissifies().
    then((res) => {
      let resArray = []
      
      for(let i = 0; i < res.length; i++){
        resArray.push(res[i].title)
      }
      console.log(res)
      return {res,resArray}
    }).
    then(async ({res,resArray}) => {
      console.log(resArray)
      const d = await del(resArray)
      console.log(d.depSel)
      return d.depSel 
    }).
    then((depSel) => {
       connection.query(`Delete from table_role where title = "${depSel}";`,(err,res) => {
        if(err){
          console.log(err)
        }else{
          console.log("Deleted With success")
          init()
        } 
        }) 
    })
  }
  if(data.choice === "Remove Employee"){
    let deleted
    const depPromissifies = () => {
      return new Promise((resolve,reject) =>{
        connection.query("Select * from employee",(err,res) => {
          if(res){
            resolve (res)
          }else{
            reject(res)
          }
        })
      })
    } 
    depPromissifies().
    then((res) => {
      let resArray = []
      
      for(let i = 0; i < res.length; i++){
        resArray.push(`${res[i].first_name} ${res[i].last_name}`)
      }
      console.log(res)
      return {res,resArray}
    }).
    then(async ({res,resArray}) => {
      console.log(resArray)
      const d = await del(resArray)
      console.log(d.depSel)
      return d.depSel 
    }).
    then((depSel) => {
      depSel = depSel.split(" ")
      console.log(depSel)
       connection.query(`Delete from employee where first_name = "${depSel[0]}" and last_name = "${depSel[1]}";`,(err,res) => {
        if(err){
          console.log(err)
        }else{
          console.log("Deleted With success")
          init()
        } 
        }) 
    })
  }

  if(data.choice === "Remove Employee"){
    let deleted
    const depPromissifies = () => {
      return new Promise((resolve,reject) =>{
        connection.query("Select * from employee",(err,res) => {
          if(res){
            resolve (res)
          }else{
            reject(res)
          }
        })
      })
    } 
    depPromissifies().
    then((res) => {
      let resArray = []
      
      for(let i = 0; i < res.length; i++){
        resArray.push(`${res[i].first_name} ${res[i].last_name}`)
      }
      console.log(res)
      return {res,resArray}
    }).
    then(async ({res,resArray}) => {
      console.log(resArray)
      const d = await del(resArray)
      console.log(d.depSel)
      return d.depSel 
    }).
    then((depSel) => {
      depSel = depSel.split(" ")
      console.log(depSel)
       connection.query(`Delete from employee where first_name = "${depSel[0]}" and last_name = "${depSel[1]}";`,(err,res) => {
        if(err){
          console.log(err)
        }else{
          console.log("Deleted With success")
          init()
        } 
        }) 
    })
  }
  if(data.choice === "Update Employee Role"){
    let updated
    const depPromissifies = () => {
      return new Promise((resolve,reject) =>{
        connection.query("Select * from table_role",(err,res) => {
          if(res){
            resolve (res)
          }else{
            reject(res)
          }
        })
      })
    } 
    depPromissifies().
    then((res) => {
      let resArray = []
      
       for(let i = 0; i < res.length; i++){
        resArray.push(res[i].title)
      }
      console.log(res)
      return {res,resArray}
    }).
    then(async ({res,resArray}) => {
      console.log(resArray)
      const d = await employeUpdate(resArray)
      updated = d.update
     return d.update  
    }).
    then(async () => {
      const newValue =  () => inquirer.prompt([
        {
        type : "input",
        name : "update",
        message: "What is the new title ?",
      }
    ])
      const value = await newValue()
      await connection.query(`Update table_role SET title = "${value.update}" where title = "${updated}";`,(err,res) => {
        if(err){
          console.log(err)
        }else{
          console.log("Update With success")
          init()
        } 
        }) 
    })
  }

  if(data.choice === "Update Employee"){
    let updated
    const depPromissifies = () => {
      return new Promise((resolve,reject) =>{
        connection.query("Select * from employee",(err,res) => {
          if(res){
            resolve (res)
          }else{
            reject(res)
          }
        })
      })
    } 
    depPromissifies().
    then((res) => {
      let resArray = []
      
      for(let i = 0; i < res.length; i++){
        resArray.push(`${res[i].first_name} ${res[i].last_name}`)
      }
      return {res,resArray}
    }).
    then(async ({res,resArray}) => {
      console.log(resArray)
      const d = await employeUpdate(resArray)
      updated = d.update
     return d.update  
    }).
    then(async () => {
      const newValue =  () => inquirer.prompt([
        {
        type : "input",
        name : "update",
        message: "What is the fist name ?",
      },
      {
        type : "input",
        name : "update1",
        message: "What is the last name ?",
      }
    ])
      const value = await newValue()
      updated = updated.split(" ")
      await connection.query(`Update employee SET first_name = "${value.update}", last_name = "${value.update1}"  where first_name = "${updated[0]}" and last_name = "${updated[1]}";`,(err,res) => {
        if(err){
          console.log(err)
        }else{
          console.log("Update With success")
          init()
        } 
        }) 
    })
  }
}catch(e){
  console.log("Error",e)
}
} 
 
const prompt = () => inquirer.prompt([
  {
    type: "list",
    name: "choice",
    message: "What would you like to do?",
    choices: [ "View All Employees", "View All Employees By Department","View All Employees By Manager","Add Employee","Remove Employee", 
              "Update Employee Role","Update Employee","View All Roles","Add Role","Remove Role","View All Departments","Add Department",
              "Remove Department","View all Roles","Quit"]
  }
]);
 
const init = () => {
  const logoText = logo({ name: "Employee Manager" }).render();

  console.log(logoText);

  prompt().then((data) => {
    database(data)
  })
}

init();