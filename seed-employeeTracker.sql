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

SELECT * FROM department;
SELECT * FROM role;
SELECT * FROM employee;