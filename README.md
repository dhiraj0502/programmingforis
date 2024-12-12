# Employee Management System

## Description
This is a Node.js-based RESTful API for managing employees in a MySQL database. The API supports admin and employee functionalities such as user authentication, employee management, and secure data retrieval using JWT tokens.

## Features
- Admin login and employee login functionality.
- Admin-only routes for adding, retrieving, and deleting employee records.
- Secure password storage using bcrypt.
- JWT-based authentication for secure access.
- MySQL database for employee data storage.

## Technologies Used
- **Node.js**: Server-side JavaScript runtime.
- **Express**: Web framework for Node.js.
- **MySQL2**: MySQL database client with promise support.
- **JWT (jsonwebtoken)**: Authentication and access control.
- **bcryptjs**: Password hashing.
- **dotenv**: For environment variable management.
- **cors**: Cross-origin resource sharing.

---

## Prerequisites

- Node.js (>=14.x)
- MySQL Server (>=8.x)
- npm (Node Package Manager)

---

## Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd <repository-folder>
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root and add the following:
```env
PORT=3000
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASS=your_mysql_password
DB_NAME=employee_db
JWT_SECRET=your_jwt_secret
```

### 4. Set Up the Database
1. Create a MySQL database named `employee_db` (or the name specified in the `.env` file).
2. Use the following schema to create the `employees` table:
```sql
CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    salary DECIMAL(10, 2) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);
```

### 5. Start the Server
```bash
npm start
```
The server will run on `http://localhost:3000` (or the port specified in the `.env` file).

---

## API Endpoints

### Authentication Endpoints

#### 1. Admin Login
**POST** `/login`
- **Request Body:**
  ```json
  {
      "username": "admin",
      "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
      "token": "<jwt_token>"
  }
  ```

#### 2. Employee Login
**POST** `/employee-login`
- **Request Body:**
  ```json
  {
      "username": "employee_username",
      "password": "employee_password"
  }
  ```
- **Response:**
  ```json
  {
      "token": "<jwt_token>"
  }
  ```

---

### Admin Endpoints

#### 1. Add Employee
**POST** `/admin/add-employee`
- **Headers:**
  - Authorization: `Bearer <jwt_token>`
- **Request Body:**
  ```json
  {
      "name": "John Doe",
      "position": "Software Engineer",
      "salary": 70000.00,
      "username": "johndoe",
      "password": "securepassword"
  }
  ```
- **Response:**
  ```json
  {
      "message": "Employee added successfully"
  }
  ```

#### 2. Get Employee List
**GET** `/admin/employee-list`
- **Headers:**
  - Authorization: `Bearer <jwt_token>`
- **Response:**
  ```json
  [
      {
          "id": 1,
          "name": "John Doe",
          "position": "Software Engineer",
          "salary": 70000.00,
          "username": "johndoe"
      }
  ]
  ```

#### 3. Delete Employee
**DELETE** `/admin/delete-employee/:id`
- **Headers:**
  - Authorization: `Bearer <jwt_token>`
- **Response:**
  ```json
  {
      "message": "Employee deleted successfully"
  }
  ```

---

### Employee Endpoints

#### 1. Employee Dashboard
**GET** `/employee-dashboard`
- **Headers:**
  - Authorization: `Bearer <jwt_token>`
- **Response:**
  ```json
  {
      "name": "John Doe",
      "position": "Software Engineer",
      "salary": 70000.00
  }
  ```

---

## Error Handling
- **401 Unauthorized:** Missing or invalid JWT token.
- **403 Forbidden:** User lacks permission for the requested action.
- **404 Not Found:** Resource not found.
- **500 Internal Server Error:** Database or server error.

---

## Running in Development Mode
You can use `nodemon` for auto-reloading during development:
```bash
npm install -g nodemon
nodemon index.js
```

---


