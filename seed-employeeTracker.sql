USE employee_tracker_db;

INSERT INTO department (name)
VALUES ("Information Technology"),
       ("Sourcing"),
       ("Marketing");


INSERT INTO role (title, salary, department_id)
VALUES ("Systems Architect", 100000, 1),
       ("Operations Engineer", 80000, 1),
       ("Getter of Stuff", 75000, 2),
       ("Marketing I", 50000, 3),
       ("Marketing II", 55000, 3),
       ("Marketing III", 60000, 3);


INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Manager", "Guy", 1, NULL),
       ("Bill", "Richards", 1, 1),
       ("Jim", "Brown", 2, 1),
       ("Manager", "Sourcing", 3, NULL),
       ("Sourcing", "Guy", 3, 4),
       ("Manager", "Marketing", 4, NULL),
       ("Bill", "Marketing", 4, 6),
       ("Anna", "Marketing", 5, 6),
       ("Lisa", "Marketing", 6, 6);


CREATE TABLE employee(
  id INT NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(30),
  last_name VARCHAR(30),
  role_id INT,
  manager_id INT,
  PRIMARY KEY (id)
);

CREATE TABLE role(
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(30),
  salary DECIMAL,
  department_id INT,
  PRIMARY KEY (id)
);

CREATE TABLE department(
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(30),
  PRIMARY KEY (id)
);


SELECT employee.first_name, employee.last_name, role.title, role.salary, department.name
FROM employee
INNER JOIN role ON employee.role_id = role.id
INNER JOIN department ON role.department_id = department.id


SELECT
m.employee.first_name, m.employee.last_name, m.role.title, m.role.salary, m.department.name AS Manager,
e.employee.first_name, e.employee.last_name, e.role.title, e.role.salary, e.department.name AS Direct
FROM employee e
INNER JOIN employee m ON m.id = e.manager_id
INNER JOIN employee ON employee.role_id = role.id
INNER JOIN department ON role.department_id = department.id;