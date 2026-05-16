const express = require('express');
const Database = require('better-sqlite3');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt.js');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'devops-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000
  }
}));

const db = new Database('/app/data/qa.db');

const CATEGORY_OPTIONS = [
  'Linux', 'Kubernetes', 'Docker', 'Jenkins', 'DevOps',
  'CI/CD', 'Git', 'Ansible', 'Terraform', 'Azure',
  'AWS', 'Cloud', 'AD', 'IT', 'Network'
];

// Questions table
 db.prepare(`
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL DEFAULT 'General',
    question TEXT NOT NULL,
    answer TEXT NOT NULL
  )
`).run();

// Users table
 db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user'
  )
`).run();

// Create default admin user if not exists
const adminExists = db.prepare(`SELECT * FROM users WHERE username = ?`).get('admin');
if (!adminExists) {
  const hashedPassword = bcrypt.hashSync('Admin@123', 10);
  db.prepare(`
    INSERT INTO users (username, password, role)
    VALUES (?, ?, ?)
  `).run('admin', hashedPassword, 'admin');
}

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).send('Access denied');
  }
  next();
}

app.get('/login', (req, res) => {
  res.send(`
  <html>
  <head>
    <title>Login</title>
    <style>
      body {
        font-family: Arial;
        background: #001f3f;
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
      }
      .box {
        background: white;
        color: black;
        padding: 30px;
        border-radius: 12px;
        width: 400px;
      }
      input {
        width: 100%;
        padding: 10px;
        margin: 10px 0;
        border: 1px solid #ccc;
        border-radius: 8px;
      }
      button {
        width: 100%;
        padding: 12px;
        background: #001f3f;
        color: white;
        border: none;
        border-radius: 8px;
      }
    </style>
  </head>
  <body>
    <div class="box">
      <h2>Login</h2>
      <form method="POST" action="/login">
        <input name="username" placeholder="Username" required />
        <input name="password" type="password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
      <p>Default Admin Login:</p>
      <p><b>Username:</b> admin</p>
      <p><b>Password:</b> Admin@123</p>
    </div>
  </body>
  </html>
  `);
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = db.prepare(`SELECT * FROM users WHERE username = ?`).get(username);

  if (!user) {
    return res.send('Invalid username or password');
  }

  const validPassword = bcrypt.compareSync(password, user.password);

  if (!validPassword) {
    return res.send('Invalid username or password');
  }

  req.session.user = {
    id: user.id,
    username: user.username,
    role: user.role
  };

  res.redirect('/');
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

app.get('/', requireLogin, (req, res) => {
  res.send(`
    <html>
    <head>
      <title>DevOps Q&A Practice App</title>
      <style>
        body {
          font-family: Arial;
          background: #001f3f;
          color: white;
          padding: 40px;
          max-width: 1000px;
          margin: auto;
        }
        .card {
          background: white;
          color: black;
          padding: 20px;
          border-radius: 12px;
        }
        a {
          float: right;
          color: white;
        }
      </style>
    </head>
    <body>
      <h1>
        DevOps Q&A Practice App
        <a href="/logout">Logout</a>
      </h1>

      <div class="card">
        <h2>Welcome, ${req.session.user.username}</h2>
        <p>Role: ${req.session.user.role}</p>
        <p>Your secured application is now protected with login functionality.</p>
        <p>You can now continue integrating your existing Q&A CRUD page here.</p>
      </div>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
