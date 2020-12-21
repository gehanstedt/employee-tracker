var mysql = require("mysql");
var inquirer = require("inquirer");
var cTable = require('console.table');


// Constant definitions
const mainChoices = [
    {
        name: "View All Employees",
        value: "viewall"
    },
    {
        name: "View All Employees by Department",
        value: "viewallbydepartment"
    },
    {
        name: "View All Employees by Manager",
        value: "viewallbymanager"
    },
    {
        name: "Add an Employee",
        value: "addemployee"
    },
    {
        name: "Remove an Employee",
        value: "removeemployee"
    },
    {
        name: "Update Employee Role",
        value: "removeemployee"
    },
    {
        name: "Update Employee Manager",
        value: "removeemployee"
    },
    {
        name: "View All Roles",
        value: "removeemployee"
    },
    {
        name: "Add Role",
        value: "removeemployee"
    },
    {
        name: "Remove Role",
        value: "removeemployee"
    },
    {
        name: `I am finshed`,
        value: "None"
    }
];



// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "bobby",
  database: "employee_tracker_db"
});


// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  start();
});

// function which prompts the user for what action they should take
function start() {
    console.log ("");

    inquirer
        .prompt({
        name: "choice",
        type: "list",
        message: "Welcome to Employee Manager.  What would you like to do?",
        choices: mainChoices
        })
        .then(function(answer) {
        // based on their answer, either call the bid or the post functions
        switch (answer.choice) {
            case "viewall":
                doViewAll ();
                console.log ("All employees - arranged by employee ID");
                break;

            case "viewallbydepartment":
                console.log ("All employees - arranged by department");
                doViewAllByDepartment ();
                break;
    
            case "viewallbymanager":
                console.log (`All employees - by manager`);
                doViewAllByManager ();
                break;

            case "addemployee":
                console.log (`Add an employee`);
                doAddEmployee ();
                break;
            
            default:
                console.log (`Case ${answer.choise} not handled.`);
                start ();

            case "None":
                connection.end ();
                break;
        }
    });
}

function doAddEmployee () {
    const roleQuery = `
        SELECT title AS name, id AS value 
        FROM role 
        ORDER BY title ASC;`;
    const managerQuery = `
        SELECT CONCAT (first_name, " ", last_name) AS name, id AS value
        FROM employee
        ORDER BY last_name ASC;
    `;

    connection.query(roleQuery, function(err, roleResults) {
        if (err) throw err;

        connection.query(managerQuery, function(err, managerResults) {
            if (err) throw err;

            managerResults.unshift ({
                name: `(None)`,
                value: -1
            })

            inquirer .prompt([
                {
                    name: "firstName",
                    type: "input",
                    message: "Employee's first name: ",
                },
                {
                    name: "lastName",
                    type: "input",
                    message: "Employee's last name: ",
                },
                {
                    name: "roleID",
                    type: "list",
                    message: "Select Role",
                    choices: roleResults
                },
                {
                    name: "managerID",
                    type: "list",
                    message: "Select Manager",
                    choices: managerResults
                },
                ])
                .then(function(answer) {
                    managerID = answer.managerID;
                    if (managerID === -1) {
                        managerID = null;
                    }
                    const insertStatement = `
                        INSERT INTO employee (first_name, last_name, role_id, manager_id)
                        VALUES ("${answer.firstName}", "${answer.lastName}", ${answer.roleID}, ${managerID})`;

                    connection.query(insertStatement, function(err, insertResult) {
                        if (err) throw err;
                        console.log (`Employee ${answer.firstName} ${answer.lastName} added.`);
                        start ();
                    });
                });
        });
    });




}

function doViewAll () {
    const query = `
        SELECT e.id as ID, e.first_name AS "First Name", e.last_name AS "Last Name", role.title as Title, CONCAT ("$", FORMAT (role.salary, 2)) as Salary, 
        department.name as Department, CONCAT (m.first_name," ", m.last_name) as Manager
        FROM employee e LEFT JOIN employee m on m.id = e.manager_id
        LEFT JOIN role ON e.role_id=role.id
        LEFT JOIN department ON role.department_id=department.id
        ORDER BY e.id ASC;`;

    finishSelect (query);
}

function doViewAllByDepartment () {
    const query = `
        SELECT e.id as ID, e.first_name AS "First Name", e.last_name AS "Last Name", role.title as Title, CONCAT ("$", FORMAT (role.salary, 2)) as Salary, 
        department.name as Department, CONCAT (m.first_name," ", m.last_name) as Manager
        FROM employee e LEFT JOIN employee m on m.id = e.manager_id
        LEFT JOIN role ON e.role_id=role.id
        LEFT JOIN department ON role.department_id=department.id
        ORDER BY department.name ASC;`;

    finishSelect (query);
}

function doViewAllByManager () {
    const query = `
        SELECT e.id as ID, e.first_name AS "First Name", e.last_name AS "Last Name", role.title as Title, CONCAT ("$", FORMAT (role.salary, 2)) as Salary, 
        department.name as Department, CONCAT (m.first_name," ", m.last_name) as Manager
        FROM employee e LEFT JOIN employee m on m.id = e.manager_id
        LEFT JOIN role ON e.role_id=role.id
        LEFT JOIN department ON role.department_id=department.id
        ORDER BY m.last_name ASC, m.first_name ASC;`;

    finishSelect (query);
}


function finishSelect (query) {
    connection.query(query, function(err, results) {
        if (err) throw err;
        console.table (results);
        start ();
    });
}


  