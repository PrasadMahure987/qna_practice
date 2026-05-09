const express = require('express');
const Database = require('better-sqlite3');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// SQLite DB
const db = new Database('/app/data/qa.db');

// Create table
// (No subcategory, fixed category dropdown)
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

.primary {
  background: #001f3f;
  color: white;
}

.secondary {
  background: #e5e7eb;
}

.danger {
  background: #dc2626;
  color: white;
}

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
</style>
</head>

<body>

<h1>Q&A Practice App</h1>

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

  <button class="primary" onclick="showAnswer()">
    Show Answer
  </button>

  <button class="secondary" onclick="previousQuestion()">
    Previous
  </button>

  <button class="secondary" onclick="nextQuestion()">
    Next
  </button>
</div>


<!-- ADD / EDIT -->
<div class="card">
  <h2>Add / Edit Question</h2>

  <form id="qaForm">
    <input type="hidden" id="editId" />

    <select id="category" required>
      <option value="">Select Category</option>
      <option value="Linux">Linux</option>
      <option value="Kubernetes">Kubernetes</option>
      <option value="Docker">Docker</option>
      <option value="Jenkins">Jenkins</option>
      <option value="DevOps">DevOps</option>
      <option value="CiCd">CiCd</option>
      <option value="Git">Git</option>
      <option value="Ansible">Ansible</option>
      <option value="Terraform">Terraform</option>
      <option value="Azure">Azure</option>
      <option value="AWS">AWS</option>
      <option value="Cloud">Cloud</option>
      <option value="AD">AD</option>
      <option value="IT">IT</option>
      <option value="Network">Network</option>
    </select>

    <input
      id="question"
      placeholder="Enter Question"
      required
    />

    <textarea
      id="answer"
      rows="4"
      placeholder="Enter Answer"
      required
    ></textarea>

    <button type="submit" class="primary">
      Save
    </button>

    <button
      type="button"
      class="secondary"
      onclick="resetForm()">
      Cancel
    </button>
  </form>

  <p id="saveMsg"></p>
</div>


<!-- ALL QUESTIONS TABLE -->
<div class="card">
  <h2>All Questions</h2>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Category</th>
        <th>Question</th>
        <th>Answer</th>
        <th>Action</th>
      </tr>
    </thead>

    <tbody id="questionTableBody"></tbody>
  </table>
</div>


<script>
let allQuestions = [];
let questions = [];
let currentIndex = 0;

async function loadQuestions() {
  const res = await fetch('/api/questions');
  allQuestions = await res.json();

  renderTable();
  populateCategory();
  applyFilter();
}

function populateCategory() {
  const select = document.getElementById('filterCategory');
  const selectedValue = select.value;

  const categories = [...new Set(allQuestions.map(q => q.category))];

  select.innerHTML = '<option value="">All Categories</option>';

  categories.forEach(cat => {
    select.innerHTML += '<option value="' + cat + '">' + cat + '</option>';
  });

  select.value = selectedValue;
}

function applyFilter() {
  const selectedCategory = document.getElementById('filterCategory').value;

  questions = allQuestions.filter(q =>
    !selectedCategory || q.category === selectedCategory
  );

  currentIndex = 0;
  renderPractice();
}

function renderPractice() {
  if (questions.length === 0) {
    document.getElementById('categoryBox').innerText = 'No Questions Found';
    document.getElementById('questionBox').innerText = '';
    document.getElementById('answerBox').innerText = '';
    return;
  }

  const q = questions[currentIndex];

  document.getElementById('categoryBox').innerText =
    'Question ' + (currentIndex + 1) +
    ' of ' + questions.length +
    ' | Category: ' + q.category;

  document.getElementById('questionBox').innerText = q.question;
  document.getElementById('answerBox').innerText = q.answer;
  document.getElementById('answerBox').style.display = 'none';
}

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

function renderTable() {
  const tbody = document.getElementById('questionTableBody');
  tbody.innerHTML = '';

  allQuestions.forEach((q, i) => {
    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${q.category}</td>
        <td>${q.question}</td>
        <td>${q.answer}</td>
        <td>
          <button
            class="secondary small-btn"
            onclick="editQuestion(${q.id})">
            Edit
          </button>

          <button
            class="danger small-btn"
            onclick="deleteQuestion(${q.id})">
            Delete
          </button>
        </td>
      </tr>
    `;
  });
}

function editQuestion(id) {
  const q = allQuestions.find(item => item.id === id);

  document.getElementById('editId').value = q.id;
  document.getElementById('category').value = q.category;
  document.getElementById('question').value = q.question;
  document.getElementById('answer').value = q.answer;
}

async function deleteQuestion(id) {
  if (!confirm('Delete this question?')) return;

  await fetch('/api/questions/' + id, {
    method: 'DELETE'
  });

  await loadQuestions();
}

function resetForm() {
  document.getElementById('editId').value = '';
  document.getElementById('category').value = '';
  document.getElementById('question').value = '';
  document.getElementById('answer').value = '';
  document.getElementById('saveMsg').innerText = '';
}

document.getElementById('qaForm')
.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('editId').value;

  const data = {
    category: document.getElementById('category').value.trim(),
    question: document.getElementById('question').value.trim(),
    answer: document.getElementById('answer').value.trim()
  };

  let url = '/api/questions';
  let method = 'POST';

  if (id) {
    url = '/api/questions/' + id;
    method = 'PUT';
  }

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  const result = await res.json();

  document.getElementById('saveMsg').innerText =
    result.message || 'Saved Successfully';

  resetForm();
  await loadQuestions();
});

loadQuestions();
</script>

</body>
</html>
  `);
});


// APIs
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

  res.json({
    message: 'Question saved successfully!'
  });
});

app.put('/api/questions/:id', (req, res) => {
  const { id } = req.params;
  const { category, question, answer } = req.body;

  db.prepare(`
    UPDATE questions
    SET category = ?, question = ?, answer = ?
    WHERE id = ?
  `).run(category, question, answer, id);

  res.json({
    message: 'Question updated successfully!'
  });
});

app.delete('/api/questions/:id', (req, res) => {
  db.prepare(`
    DELETE FROM questions
    WHERE id = ?
  `).run(req.params.id);

  res.json({
    message: 'Question deleted successfully!'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});