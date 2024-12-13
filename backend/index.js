require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise'); 
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Database Connection
let db;
async function connectToDatabase() {
    try {
        db = await mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'dhiraj',
            password: process.env.DB_PASS || 'dhiraj',
            database: process.env.DB_NAME || 'employee_db',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });
        console.log('Connected to the database.');
    } catch (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
}
connectToDatabase();

// Middleware to authenticate token
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access Denied: No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'secretkey', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden: Invalid Token' });
        }
        req.user = user;
        next();
    });
}

// Admin login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === 'admin' && password === 'password123') {
        const token = jwt.sign({ username, isAdmin: true }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' });
        return res.json({ token });
    }

    res.status(400).json({ message: 'Invalid username or password' });
});

// Employee login route
app.post('/employee-login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const [results] = await db.query('SELECT * FROM employees WHERE username = ?', [username]);
        if (results.length === 0 || !bcrypt.compareSync(password, results[0].password)) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign({ username, isAdmin: false }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).json({ message: 'Database query error' });
    }
});

// Admin add employee route
app.post('/admin/add-employee', authenticateToken, async (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
    }

    const { name, position, salary, username, password } = req.body;
    if (!name || !position || !salary || !username || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const hashedPassword = bcrypt.hashSync(password, 10);

        const query = `
            INSERT INTO employees (name, position, salary, username, password)
            VALUES (?, ?, ?, ?, ?)
        `;
        await db.execute(query, [name, position, salary, username, hashedPassword]);
        res.status(201).json({ message: 'Employee added successfully' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ message: 'Username already exists' });
        } else {
            console.error('Database insertion error:', err);
            res.status(500).json({ message: 'Database insertion error' });
        }
    }
});



// Admin add employee route
app.patch('/admin/update-employee', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
  }

  const { name, position, salary, username } = req.body;

  try {
    const query = `
    UPDATE employees
    SET name = ?, position = ?, salary = ?
    WHERE username = ?
`;
      await db.execute(query, [name, position, salary, username]);
      res.status(201).json({ message: 'Employee updated successfully' });
  } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
          res.status(400).json({ message: 'Username already exists' });
      } else {
          console.error('Database insertion error:', err);
          res.status(500).json({ message: 'Database insertion error' });
      }
  }
});

// Employee dashboard route
app.get('/employee-dashboard', authenticateToken, async (req, res) => {
    const username = req.user.username;

    try {
        const [results] = await db.query('SELECT name, position, salary FROM employees WHERE username = ?', [username]);
        if (results.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json(results[0]);
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).json({ message: 'Database query error' });
    }
});

// Admin get employee list route
app.get('/admin/employee-list', authenticateToken, async (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
    }

    try {
        const [results] = await db.query('SELECT * FROM employees');
        res.json(results);
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).json({ message: 'Database query error' });
    }
});

// Admin delete employee route
app.delete('/admin/delete-employee/:id', authenticateToken, async (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
    }

    const employeeId = req.params.id;

    try {
        const [result] = await db.query('DELETE FROM employees WHERE id = ?', [employeeId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json({ message: 'Employee deleted successfully' });
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).json({ message: 'Database query error' });
    }
});



// Admin get by employee list route
app.get('/admin/employee-list', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
  }

  try {
      const [results] = await db.query('SELECT * FROM employees');
      res.json(results);
  } catch (err) {
      console.error('Database query error:', err);
      res.status(500).json({ message: 'Database query error' });
  }
});

// Admin get employee by ID route
app.get('/admin/employee/:id', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
  }

  const { id } = req.params;  // Extract the 'id' from the request parameters

  try {
      // Query the database for the employee with the given ID
      const [results] = await db.query('SELECT * FROM employees WHERE id = ?', [id]);

      // If no employee is found, return an error
      if (results.length === 0) {
          return res.status(404).json({ message: 'Employee not found' });
      }

      // Return the employee data
      res.json(results[0]);
  } catch (err) {
      console.error('Database query error:', err);
      res.status(500).json({ message: 'Database query error' });
  }
});

// Admin update employee route
app.put('/admin/update-employee/:id', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
  }

  const { id } = req.params;  // Extract the employee ID from the request params
  const { name, position, salary, username, password } = req.body;  // Get the updated details from the request body

  try {
      // Check if employee exists before updating
      const [employeeResults] = await db.query('SELECT * FROM employees WHERE id = ?', [id]);
      if (employeeResults.length === 0) {
          return res.status(404).json({ message: 'Employee not found' });
      }

      // Update the employee details
      const updateQuery = `
        UPDATE employees 
        SET name = ?, position = ?, salary = ?, username = ?
        WHERE id = ?
      `;

      // Execute the update query
      const [updateResult] = await db.query(updateQuery, [name, position, salary, username, id]);

      // If the update was successful, send a success message
      if (updateResult.affectedRows > 0) {
        console.log(updateResult);
          return res.json({ message: 'Employee updated successfully' });
      } else {
          return res.status(400).json({ message: 'Failed to update employee' });
      }
  } catch (err) {
      console.error('Database query error:', err);
      res.status(500).json({ message: 'Database query error' });
  }
});


// Catch-all route for 404 errors
app.use((req, res, next) => {
    res.status(404).send('404 Not Found');
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
