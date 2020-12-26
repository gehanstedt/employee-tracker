// Requirements
var mysql = require("mysql");
var inquirer = require("inquirer");
var cTable = require('console.table');


// Constant definitions
const mainChoices = [
    {
        name: "Add an Employee",
        value: "addemployee"
    },
    {
        name: "View All Employees by ID",
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
        name: "Update an Employee's Manager",
        value: "updatemanager"
    },
    {
        name: "Remove an Employee",
        value: "removeemployee"
    },
    {
        name: "Add Role",
        value: "addrole"
    },
    {
        name: "View All Roles",
        value: "viewroles"
    },
    {
        name: "Remove Role",
        value: "removerole"
    },
    {
        name: "Add Department",
        value: "adddepartment"
    },
    {
        name: "View Departments",
        value: "viewdepartments"
    },
    {
        name: "Remove Department",
        value: "removedepartment"
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

// Main function that controls all input - tihs will be called multiple times to restart process
function start() {
    console.log ("");

    // Use inquirer to prompt user for their choice of action.  Choices are defined above by const mainChoices.
    inquirer
        .prompt({
        name: "choice",
        type: "list",
        message: "Welcome to Employee Manager.  What would you like to do?",
        choices: mainChoices
        })
        .then(function(answer) {
        // Call appropriate child function based on what user selected
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

// Function to add an employee - this is the most complex add function since it first has to retrieve all
// roles and departments
function doAddEmployee () {
    // Build queries to select all roles and managers
    const roleQuery = `
        SELECT title AS name, id AS value 
        FROM role 
        ORDER BY title ASC;`;
    const managerQuery = `
        SELECT CONCAT (first_name, " ", last_name) AS name, id AS value
        FROM employee
        ORDER BY last_name ASC;
    `;

    // Connect to database and execute manager query
    connection.query(roleQuery, function(err, roleResults) {
        if (err) throw err;


        // Connect to database and execute 
        connection.query(managerQuery, function(err, managerResults) {
            if (err) throw err;

            // Inject a manager "(None)" into the manager list to allow user to select
            // No manager for the user.
            managerResults.unshift ({
                name: `(None)`,
                value: null
            })

            // Using Inquirer, prompt user for new employee's values - first name, last name,
            // role and manager
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
                // Build query to insert to employee into employee table
                const insertStatement = `
                    INSERT INTO employee (first_name, last_name, role_id, manager_id)
                    VALUES ("${answer.firstName}", "${answer.lastName}", ${answer.roleID}, ${answer.managerID})`;

                // Execute the insert statement.  If successful, call start () to start over.
                connection.query(insertStatement, function(err, insertResult) {
                    if (err) throw err;
                    console.log (`Employee ${answer.firstName} ${answer.lastName} added.`);
                    start ();
                });
            });
        });
    });
}

// Function to update an employee's manager
function doUpdateManager () {
    // Build all employee query
    const employeeQuery = `
        SELECT CONCAT (E.first_name, " ", E.last_name) AS name, E.id AS value, E.manager_id as manager_id, CONCAT (M.first_name, " ", M.last_name) AS manager_name
        FROM employee e LEFT JOIN employee m on m.id = e.manager_id
        ORDER BY E.last_name ASC;`;

    // Run employee query
    connection.query(employeeQuery, function(err, employeeResults) {
        if (err) throw err;

        // Prompt user to select the employee to be updated
        inquirer .prompt([
        {
            name: "employeeID",
            type: "list",
            message: "Select Employee",
            choices: employeeResults
        },
        ])
        .then(function(answer) {
            // Now we use employeeResults query as a list of managers, but first Inject a null manager into this list
            employeeResults.unshift ({
                name: `(None)`,
                value: null
            });

            // Set some constants to make things easier
            const employeeID = answer.employeeID;
            const employeeIndex = employeeResults.findIndex(obj => obj.value == employeeID);
            const managerIndex = employeeResults.findIndex(obj => obj.value == employeeResults[employeeIndex].manager_id)

            // Display previous manager
            console.log (`Previous manager was ${employeeResults [managerIndex].name}`);

            // Use inquirer to prompt user to select a new manager for the selected employee
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
                // Build update statement to set the employee's new manager
                const updateStatement = `
                UPDATE employee SET manager_id = ${managerAnswer.managerID} 
                WHERE id = ${employeeID};`;

                // Execute update
                connection.query(updateStatement, function(err, updateResult) {
                    if (err) throw err;
                    console.log (`Employee updated.`);
                    start ();
                });
            });
        });
    });
}

// Function add role
function doAddRole () {
    // Build query to select all departments
    const departmentQuery = `
        SELECT name AS name, id AS value 
        FROM department 
        ORDER BY name ASC;`;

    // Execute database query to select all departments
    connection.query(departmentQuery, function(err, departmentResults) {
        if (err) throw err;

        // Use inquirer to prompt user for role title, salary and department
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
            // Build insert statement to add new role
            const insertStatement = `
                INSERT INTO role (title, salary, department_id)
                VALUES ("${answer.title}", ${answer.salary}, ${answer.departmentID});`;

            // Execute insert statement and then restart with start ()
            connection.query(insertStatement, function(err, insertResult) {
                if (err) throw err;
                console.log (`Role ${answer.title} - Salary ${answer.salary} added.`);
                start ();
            });
        });
    });
}

// Function add department
function doAddDepartment () {
    // Get new department name from user via inquirer
    inquirer .prompt([
    {
        name: "departmentName",
        type: "input",
        message: "Department name: ",
    },
    ])
    .then(function(answer) {
        // Build insert statement to add new department
        const insertStatement = `
            INSERT INTO department (name)
            VALUES ("${answer.departmentName}");`;

        // Execute insert statement and then restart with start ()
        connection.query(insertStatement, function(err, insertResult) {
            if (err) throw err;
            console.log (`Department ${answer.departmentName} added.`);
            start ();
        });
    });
}

// Function remove employee
function doRemoveEmployee () {
    // Build query to select all employee's first and last names
    const query = `
        SELECT CONCAT (first_name, " ", last_name) as name, id as value
        FROM employee
        ORDER BY last_name ASC;`;

    // Call generic remove function to complete removal from database
    finishRemove (query,
                 "employee",
                 "Select employee to remove");
}

// Function remove department
function doRemoveDepartment () {
    // Build query to select all departments
    const query = `
        SELECT name as name, id as value
        FROM department
        ORDER BY name ASC;`;

    // Call generic remove function to complete removal from database
    finishRemove (query,
                 "department",
                 "Select department to remove");
}

// Function remove all
function doRemoveRole () {
    // Build query to select all roles
    const query = `
        SELECT title as name, id as value
        FROM role
        ORDER BY name ASC;`;

    // Call generic remove function to complete removal from database
    finishRemove (query,
                 "role",
                 "Select role to remove");
}

// Function to view all employees - just ordered by employee ID
function doViewAll () {
    // Build query to select all employees, their managers, roles, departments - order by employee ID
    const query = `
        SELECT e.id as ID, e.first_name AS "First Name", e.last_name AS "Last Name", role.title as Title, CONCAT ("$", FORMAT (role.salary, 2)) as Salary, 
        department.name as Department, CONCAT (m.first_name," ", m.last_name) as Manager
        FROM employee e LEFT JOIN employee m on m.id = e.manager_id
        LEFT JOIN role ON e.role_id=role.id
        LEFT JOIN department ON role.department_id=department.id
        ORDER BY e.id ASC;`;

    // Call generic select finish function to retrieve and then display information
    finishSelect (query);
}

// Function to view all employees - just ordered by department
function doViewAllByDepartment () {
    // Build query to select all employees, their managers, roles, departments - order by department name
    const query = `
        SELECT e.id as ID, e.first_name AS "First Name", e.last_name AS "Last Name", role.title as Title, CONCAT ("$", FORMAT (role.salary, 2)) as Salary, 
        department.name as Department, CONCAT (m.first_name," ", m.last_name) as Manager
        FROM employee e LEFT JOIN employee m on m.id = e.manager_id
        LEFT JOIN role ON e.role_id=role.id
        LEFT JOIN department ON role.department_id=department.id
        ORDER BY department.name ASC;`;

    // Call generic select finish function to retrieve and then display information
    finishSelect (query);
}

// Function to view all employees - just ordered by manager
function doViewAllByManager () {
    // Build query to select all employees, their managers, roles, departments - order by manager last name, then first name
    const query = `
        SELECT e.id as ID, e.first_name AS "First Name", e.last_name AS "Last Name", role.title as Title, CONCAT ("$", FORMAT (role.salary, 2)) as Salary, 
        department.name as Department, CONCAT (m.first_name," ", m.last_name) as Manager
        FROM employee e LEFT JOIN employee m on m.id = e.manager_id
        LEFT JOIN role ON e.role_id=role.id
        LEFT JOIN department ON role.department_id=department.id
        ORDER BY m.last_name ASC, m.first_name ASC;`;

    // Call generic select finish function to retrieve and then display information
    finishSelect (query);
}

// Function to view all departments
function doViewDepartments () {
    // Build query to view all departments
    const query = `SELECT id as ID, name as Name FROM department ORDER BY ID ASC;`;

    // Call generic select finish function to retrieve and then display information
    finishSelect (query);
}

// Function to veiw all roles
function doViewRoles () {
    // Build query to view all roles
    const query = `
    SELECT role.id AS ID, role.title AS Title, role.salary AS Salary, department.name AS "Department Name" 
    FROM role
    LEFT JOIN department ON role.department_id=department.id
    ORDER BY role.id ASC;`;

    // Call generic select finish function to retrieve and then display information
    finishSelect (query);
}

// Function to generically finish view queries and display via console.table
function finishSelect (query) {
    // Execute database query passed in from calling function
    connection.query(query, function(err, results) {
        if (err) throw err;
        // Display results using console.table
        console.table (results);
        // Restart prompting using start ()
        start ();
    });
}

// Function to complete removal of employee, role or department
function finishRemove (query, table, question) {
    // Execute query build by calling function to select employees, roles or departments (referred to as object going forward)
    connection.query(query, function(err, results) {
        if (err) throw err;

        // Use inquirer to have user select object to be deleted
        inquirer .prompt([
        {
            name: "id",
            type: "list",
            message: question,
            choices: results
        },
        ])
        .then(function(answer) {
            // Build delete statemetn to remove the object user selected
            const deleteStatement = `
            DELETE FROM ${table}
            WHERE id = ${answer.id};`;

            // Call database to execute delete statement
            connection.query(deleteStatement, function(err, updateResult) {
                if (err) throw err;
                console.log (`Deleted.`);
                // Restart user prompting by calling the start () function
                start ();
            });
        });
    });
}