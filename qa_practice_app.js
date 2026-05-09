const express = require('express');
const Database = require('better-sqlite3');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// SQLite DB
const db = new Database('/app/data/qa.db');

// Fixed category list
const CATEGORY_OPTIONS = [
  'Linux',
  'Kubernetes',
  'Docker',
  'Jenkins',
  'DevOps',
  'CI/CD',
  'Git',
  'Ansible',
  'Terraform',
  'Azure',
  'AWS',
  'Cloud',
  'AD',
  'IT',
  'Network'
];

// Create table
db.prepare(`
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL DEFAULT 'General',
    question TEXT NOT NULL,
    answer TEXT NOT NULL
  )
`).run();


// HOME PAGE
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<title>Q&A Practice App</title>

<style>
body {
  font-family: Arial;
  max-width: 1100px;
  margin: 40px auto;
  padding: 20px;
  background: #001f3f;
  color: white;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}

.card {
  background: white;
  color: black;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 25px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
}

input, textarea, select {
  width: 100%;
  padding: 10px;
  margin: 8px 0;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-sizing: border-box;
}

button {
  padding: 8px 14px;
  margin-right: 8px;
  cursor: pointer;
  border: none;
  border-radius: 8px;
}

.primary { background: #001f3f; color: white; }
.secondary { background: #e5e7eb; }
.danger { background: #dc2626; color: white; }

.category-box {
  background: #dbeafe;
  padding: 12px;
  margin-bottom: 10px;
  border-radius: 8px;
  font-weight: bold;
  color: black;
}

#answerBox {
  display: none;
  margin-top: 10px;
  background: #f3f4f6;
  padding: 15px;
  border-radius: 8px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

table th,
table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
  vertical-align: top;
}

table th {
  background: #f3f4f6;
}

.small-btn {
  padding: 6px 12px;
  font-size: 13px;
}

/* ================= FLOATING SCROLL BUTTON ================= */
#topBtn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 9999;

  background: #ff9800;
  color: white;
  border: none;
  padding: 14px 16px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;

  display: none;

  box-shadow: 0 5px 12px rgba(0,0,0,0.3);
  transition: 0.3s;
}

#topBtn:hover {
  background: #e68900;
  transform: scale(1.15);
}
/* ========================================================= */

</style>
</head>

<body>

<h1>Q&A Practice App</h1>

<!-- FLOATING BUTTON -->
<button id="topBtn" onclick="scrollToTop()">⬆</button>

<!-- PRACTICE SESSION -->
<div class="card">
  <h2>Practice Session</h2>

  <label>Select Category</label>
  <select id="filterCategory" onchange="applyFilter()">
    <option value="">All Categories</option>
  </select>

  <div class="category-box" id="categoryBox">
    Loading...
  </div>

  <h3 id="questionBox"></h3>

  <div id="answerBox"></div>

  <br>

  <button class="primary" onclick="showAnswer()">Show Answer</button>
  <button class="secondary" onclick="previousQuestion()">Previous</button>
  <button class="secondary" onclick="nextQuestion()">Next</button>
</div>

<script>
let allQuestions = [];
let questions = [];
let currentIndex = 0;

/* ================= SCROLL BUTTON LOGIC ================= */
const topBtn = document.getElementById("topBtn");

window.onscroll = function () {
  if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
    topBtn.style.display = "block";
  } else {
    topBtn.style.display = "none";
  }
};

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}
/* ======================================================= */

function showAnswer() {
  if (questions.length > 0) {
    document.getElementById('answerBox').style.display = 'block';
  }
}

function nextQuestion() {
  if (questions.length === 0) return;
  currentIndex = (currentIndex + 1) % questions.length;
  renderPractice();
}

function previousQuestion() {
  if (questions.length === 0) return;
  currentIndex = (currentIndex - 1 + questions.length) % questions.length;
  renderPractice();
}

function renderPractice() {
  if (questions.length === 0) return;

  const q = questions[currentIndex];

  document.getElementById('categoryBox').innerText =
    'Question ' + (currentIndex + 1) +
    ' of ' + questions.length +
    ' | Category: ' + q.category;

  document.getElementById('questionBox').innerText = q.question;
  document.getElementById('answerBox').innerText = q.answer;
  document.getElementById('answerBox').style.display = 'none';
}

async function loadQuestions() {
  const res = await fetch('/api/questions');
  allQuestions = await res.json();
  questions = allQuestions;
  renderPractice();
}

loadQuestions();
</script>

</body>
</html>
  `);
});


// ================= APIs =================

app.get('/api/questions', (req, res) => {
  const rows = db.prepare(`
    SELECT id, category, question, answer
    FROM questions
    ORDER BY id ASC
  `).all();

  res.json(rows);
});

app.post('/api/questions', (req, res) => {
  const { category, question, answer } = req.body;

  db.prepare(`
    INSERT INTO questions (category, question, answer)
    VALUES (?, ?, ?)
  `).run(category, question, answer);

  res.json({ message: 'Question saved successfully!' });
});

app.put('/api/questions/:id', (req, res) => {
  const { id } = req.params;
  const { category, question, answer } = req.body;

  db.prepare(`
    UPDATE questions
    SET category = ?, question = ?, answer = ?
    WHERE id = ?
  `).run(category, question, answer, id);

  res.json({ message: 'Question updated successfully!' });
});

app.delete('/api/questions/:id', (req, res) => {
  db.prepare(`
    DELETE FROM questions WHERE id = ?
  `).run(req.params.id);

  res.json({ message: 'Question deleted successfully!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});