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
        name: "View Departments",
        value: "viewdepartments"
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
        name: "Update an Employee's Manager",
        value: "updatemanager"
    },
    {
        name: "View All Roles",
        value: "viewroles"
    },
    {
        name: "Add Role",
        value: "addrole"
    },
    {
        name: "Add Department",
        value: "adddepartment"
    },
    {
        name: "Remove Department",
        value: "removedepartment"
    },
    {
        name: "Remove Role",
        value: "removerole"
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

            case "viewdepartments":
                console.log (`All departments`);
                doViewDepartments ();
                break;
    
            case "viewroles":
                console.log (`All roles`);
                doViewRoles ();
                break;
        
            case "addemployee":
                console.log (`Add an employee`);
                doAddEmployee ();
                break;
            
            case "removeemployee":
                console.log (`Remove an employee`);
                doRemoveEmployee ();
                break;

            case "addrole":
                console.log (`Add a role`);
                doAddRole ();
                break;
    
            case "removerole":
                console.log (`Remove a role`);
                doRemoveRole ();
                break;

            case "adddepartment":
                console.log (`Add a department`);
                doAddDepartment ();
                break;

            case "removedepartment":
                console.log (`Remove a department`);
                doRemoveDepartment ();
                break;

            case "updatemanager":
                console.log (`Update an employee's manager`);
                doUpdateManager ();
                break;
            
            case "None":
                connection.end ();
                break;

            default:
                console.log (`Case ${answer.choice} not handled.`);
                start ();

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

function doUpdateManager () {
    const employeeQuery = `
        SELECT CONCAT (E.first_name, " ", E.last_name) AS name, E.id AS value, E.manager_id as manager_id, CONCAT (M.first_name, " ", M.last_name) AS manager_name
        FROM employee e LEFT JOIN employee m on m.id = e.manager_id
        ORDER BY E.last_name ASC;`;

    connection.query(employeeQuery, function(err, employeeResults) {
        if (err) throw err;

        inquirer .prompt([
        {
            name: "employeeID",
            type: "list",
            message: "Select Employee",
            choices: employeeResults
        },
        ])
        .then(function(answer) {
            employeeResults.unshift ({
                name: `(None)`,
                value: null
            })

            const employeeID = answer.employeeID;
            const employeeIndex = employeeResults.findIndex(obj => obj.value == employeeID);
            const managerIndex = employeeResults.findIndex(obj => obj.value == employeeResults[employeeIndex].manager_id)

            console.log (`Previous manager was ${employeeResults [managerIndex].name}`);

            inquirer .prompt([
            {
                name: "managerID",
                type: "list",
                message: "Select New Manager",
                default: managerIndex,
                choices: employeeResults
            },
            ])
            .then(function(managerAnswer) {
                const updateStatement = `
                UPDATE employee SET manager_id = ${managerAnswer.managerID} 
                WHERE id = ${employeeID};`;

                connection.query(updateStatement, function(err, updateResult) {
                    if (err) throw err;
                    console.log (`Employee updated.`);
                    start ();
                });
            });
        });
    });
}


function doAddRole () {
    const departmentQuery = `
        SELECT name AS name, id AS value 
        FROM department 
        ORDER BY name ASC;`;

    connection.query(departmentQuery, function(err, departmentResults) {
        if (err) throw err;

        inquirer .prompt([
        {
            name: "title",
            type: "input",
            message: "Role's title: ",
        },
        {
            name: "salary",
            type: "input",
            message: "Role's salary: ",
        },
        {
            name: "departmentID",
            type: "list",
            message: "Select Department",
            choices: departmentResults
        },

        ])
        .then(function(answer) {
            const insertStatement = `
                INSERT INTO role (title, salary, department_id)
                VALUES ("${answer.title}", ${answer.salary}, ${answer.departmentID});`;

            connection.query(insertStatement, function(err, insertResult) {
                if (err) throw err;
                console.log (`Role ${answer.title} - Salary ${answer.salary} added.`);
                start ();
            });
        });
    });
}

function doAddDepartment () {
    inquirer .prompt([
    {
        name: "departmentName",
        type: "input",
        message: "Department name: ",
    },
    ])
    .then(function(answer) {
        const insertStatement = `
            INSERT INTO department (name)
            VALUES ("${answer.departmentName}");`;

        connection.query(insertStatement, function(err, insertResult) {
            if (err) throw err;
            console.log (`Department ${answer.departmentName} added.`);
            start ();
        });
    });
}

function doRemoveEmployee () {
    const query = `
        SELECT CONCAT (first_name, " ", last_name) as name, id as value
        FROM employee
        ORDER BY last_name ASC;`;

    finishRemove (query,
                 "employee",
                 "Select employee to remove");
}

function doRemoveDepartment () {
    const query = `
        SELECT name as name, id as value
        FROM department
        ORDER BY name ASC;`;

    finishRemove (query,
                 "department",
                 "Select department to remove");
}

function doRemoveRole () {
    const query = `
        SELECT title as name, id as value
        FROM role
        ORDER BY name ASC;`;

    finishRemove (query,
                 "role",
                 "Select role to remove");
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

function doViewDepartments () {
    const query = `SELECT id as ID, name as Name FROM department;`;

    finishSelect (query);
}

function doViewRoles () {
    const query = `
    SELECT role.id AS ID, role.title AS Title, role.salary AS Salary, department.name AS "Department Name" 
    FROM role
    LEFT JOIN department ON role.department_id=department.id
    ORDER BY role.id ASC;`;

    finishSelect (query);
}

function finishSelect (query) {
    connection.query(query, function(err, results) {
        if (err) throw err;
        console.table (results);
        start ();
    });
}

function finishRemove (query, table, question) {
    connection.query(query, function(err, results) {
        if (err) throw err;
        console.table (results);

        inquirer .prompt([
        {
            name: "id",
            type: "list",
            message: question,
            choices: results
        },
        ])
        .then(function(answer) {
            const deleteStatement = `
            DELETE FROM ${table}
            WHERE id = ${answer.id};`;
    
            connection.query(deleteStatement, function(err, updateResult) {
                if (err) throw err;
                console.log (`Deleted.`);
                start ();
            });
        });
    });
}


  