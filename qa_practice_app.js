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
  'CiCd',
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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Arial, sans-serif;
  background: linear-gradient(135deg, #0f172a, #1e3a8a, #0f172a);
  min-height: 100vh;
  padding: 30px;
  color: white;
}

.container {
  max-width: 1200px;
  margin: auto;
}

h1 {
  text-align: center;
  font-size: 42px;
  font-weight: 700;
  margin-bottom: 30px;
  color: white;
  text-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

h2 {
  margin-bottom: 18px;
  color: #0f172a;
  font-size: 24px;
}

h3 {
  margin-top: 15px;
  font-size: 22px;
  color: #111827;
  line-height: 1.6;
}

.card {
  background: rgba(255,255,255,0.96);
  color: black;
  border-radius: 20px;
  padding: 28px;
  margin-bottom: 28px;
  box-shadow:
    0 10px 30px rgba(0,0,0,0.18),
    0 2px 10px rgba(0,0,0,0.08);
  backdrop-filter: blur(10px);
  transition: 0.3s;
}

.card:hover {
  transform: translateY(-2px);
}

label {
  font-weight: 600;
  display: block;
  margin-bottom: 8px;
  margin-top: 10px;
  color: #1f2937;
}

input,
textarea,
select {
  width: 100%;
  padding: 14px 16px;
  margin-bottom: 14px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 15px;
  background: #f9fafb;
  transition: 0.2s;
}

input:focus,
textarea:focus,
select:focus {
  border-color: #2563eb;
  outline: none;
  background: white;
  box-shadow: 0 0 0 4px rgba(37,99,235,0.08);
}

button {
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  margin-right: 10px;
  margin-top: 10px;
  transition: 0.25s;
}

button:hover {
  transform: translateY(-1px);
}

.primary {
  background: linear-gradient(to right, #2563eb, #1d4ed8);
  color: white;
}

.primary:hover {
  box-shadow: 0 8px 20px rgba(37,99,235,0.25);
}

.secondary {
  background: #e5e7eb;
  color: #111827;
}

.secondary:hover {
  background: #d1d5db;
}

.danger {
  background: linear-gradient(to right, #dc2626, #b91c1c);
  color: white;
}

.danger:hover {
  box-shadow: 0 8px 20px rgba(220,38,38,0.22);
}

.category-box {
  background: linear-gradient(to right, #dbeafe, #eff6ff);
  color: #1e3a8a;
  padding: 16px;
  border-radius: 14px;
  font-weight: 700;
  margin-top: 12px;
  margin-bottom: 18px;
  border-left: 6px solid #2563eb;
}

#answerBox {
  display: none;
  margin-top: 18px;
  background: #f8fafc;
  border: 1px solid #dbeafe;
  border-left: 6px solid #2563eb;
  padding: 18px;
  border-radius: 14px;
  color: #111827;
  font-size: 15px;
  line-height: 1.7;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 18px;
  border-radius: 14px;
  overflow: hidden;
}

table thead {
  background: #eff6ff;
}

table th {
  padding: 16px;
  text-align: left;
  font-size: 14px;
  color: #1e3a8a;
  font-weight: 700;
}

table td {
  padding: 15px;
  border-top: 1px solid #e5e7eb;
  vertical-align: top;
  font-size: 14px;
  line-height: 1.6;
}

table tr:hover {
  background: #f8fafc;
}

.small-btn {
  padding: 8px 14px;
  font-size: 13px;
  margin-bottom: 6px;
}

#saveMsg {
  margin-top: 15px;
  font-weight: 600;
  color: #059669;
}

@media (max-width: 768px) {
  body {
    padding: 15px;
  }

  h1 {
    font-size: 30px;
  }

  .card {
    padding: 18px;
  }

  table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }

  button {
    width: 100%;
    margin-bottom: 10px;
  }
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

  <button
    class="primary"
    onclick="showAnswer()">
    Show Answer
  </button>

  <button
    class="secondary"
    onclick="previousQuestion()">
    Previous
  </button>

  <button
    class="secondary"
    onclick="nextQuestion()">
    Next
  </button>
</div>


<!-- ADD / EDIT -->
<div class="card">
  <h2>Add / Edit Question</h2>

  <form id="qaForm">
    <input
      type="hidden"
      id="editId"
    />

    <label>Select Category</label>
    <select id="category" required>
      <option value="">Select Category</option>
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

    <button
      type="submit"
      class="primary">
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

const fixedCategories = [
  'Linux',
  'Kubernetes',
  'Docker',
  'Jenkins',
  'DevOps',
  'CiCd',
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


// Load category dropdown for Add/Edit form
function loadFormCategories() {
  const select = document.getElementById('category');

  select.innerHTML =
    '<option value="">Select Category</option>';

  fixedCategories.forEach(cat => {
    select.innerHTML +=
      '<option value="' + cat + '">' + cat + '</option>';
  });
}


// LOAD QUESTIONS
async function loadQuestions() {
  const res = await fetch('/api/questions');
  allQuestions = await res.json();

  renderTable();
  populatePracticeCategory();
  applyFilter();
}


// CATEGORY DROPDOWN FOR PRACTICE SESSION
function populatePracticeCategory() {
  const select =
    document.getElementById('filterCategory');

  const selectedValue = select.value;

  select.innerHTML =
    '<option value="">All Categories</option>';

  fixedCategories.forEach(cat => {
    select.innerHTML +=
      '<option value="' + cat + '">' + cat + '</option>';
  });

  select.value = selectedValue;
}


// FILTER ONLY PRACTICE SESSION
function applyFilter() {
  const selectedCategory =
    document.getElementById('filterCategory').value;

  questions = allQuestions.filter(q =>
    !selectedCategory || q.category === selectedCategory
  );

  currentIndex = 0;

  renderPractice();
}


// PRACTICE BOX
function renderPractice() {
  if (questions.length === 0) {
    document.getElementById('categoryBox').innerText =
      'No Questions Found';

    document.getElementById('questionBox').innerText =
      '';

    document.getElementById('answerBox').innerText =
      '';

    return;
  }

  const q = questions[currentIndex];

  document.getElementById('categoryBox').innerText =
    'Question ' + (currentIndex + 1) +
    ' of ' + questions.length +
    ' | Category: ' + q.category;

  document.getElementById('questionBox').innerText =
    q.question;

  document.getElementById('answerBox').innerText =
    q.answer;

  document.getElementById('answerBox').style.display =
    'none';
}


// SHOW ANSWER
function showAnswer() {
  if (questions.length > 0) {
    document.getElementById('answerBox').style.display =
      'block';
  }
}


// NEXT
function nextQuestion() {
  if (questions.length === 0) return;

  currentIndex =
    (currentIndex + 1) % questions.length;

  renderPractice();
}


// PREVIOUS
function previousQuestion() {
  if (questions.length === 0) return;

  currentIndex =
    (currentIndex - 1 + questions.length) % questions.length;

  renderPractice();
}


// TABLE ALWAYS SHOWS ALL QUESTIONS
function renderTable() {
  const tbody =
    document.getElementById('questionTableBody');

  tbody.innerHTML = '';

  allQuestions.forEach((q, i) => {
    tbody.innerHTML += \`
      <tr>
        <td>\${i + 1}</td>
        <td>\${q.category}</td>
        <td>\${q.question}</td>
        <td>\${q.answer}</td>
        <td>
          <button
            class="secondary small-btn"
            onclick="editQuestion(\${q.id})">
            Edit
          </button>

          <button
            class="danger small-btn"
            onclick="deleteQuestion(\${q.id})">
            Delete
          </button>
        </td>
      </tr>
    \`;
  });
}


// EDIT
function editQuestion(id) {
  const q =
    allQuestions.find(item => item.id === id);

  document.getElementById('editId').value =
    q.id;

  document.getElementById('category').value =
    q.category;

  document.getElementById('question').value =
    q.question;

  document.getElementById('answer').value =
    q.answer;
}


// DELETE
async function deleteQuestion(id) {
  if (!confirm('Delete this question?')) return;

  await fetch('/api/questions/' + id, {
    method: 'DELETE'
  });

  await loadQuestions();
}


// RESET FORM
function resetForm() {
  document.getElementById('editId').value = '';
  document.getElementById('category').value = '';
  document.getElementById('question').value = '';
  document.getElementById('answer').value = '';
  document.getElementById('saveMsg').innerText = '';
}


// SAVE / UPDATE
document
  .getElementById('qaForm')
  .addEventListener('submit', async (e) => {
    e.preventDefault();

    const id =
      document.getElementById('editId').value;

    const data = {
      category:
        document.getElementById('category').value.trim(),

      question:
        document.getElementById('question').value.trim(),

      answer:
        document.getElementById('answer').value.trim()
    };

    let url = '/api/questions';
    let method = 'POST';

    if (id) {
      url = '/api/questions/' + id;
      method = 'PUT';
    }

    try {
      const res = await fetch(url, {
        method: method,
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

    } catch (err) {
      console.error(err);

      document.getElementById('saveMsg').innerText =
        'Error saving question';
    }
  });


// INITIAL LOAD
loadFormCategories();
loadQuestions();
</script>

</body>
</html>
  `);
});


// ================= APIs =================

// GET ALL
app.get('/api/questions', (req, res) => {
  const rows = db.prepare(`
    SELECT id, category, question, answer
    FROM questions
    ORDER BY id ASC
  `).all();

  res.json(rows);
});


// ADD
app.post('/api/questions', (req, res) => {
  const {
    category,
    question,
    answer
  } = req.body;

  db.prepare(`
    INSERT INTO questions
    (category, question, answer)
    VALUES (?, ?, ?)
  `).run(
    category,
    question,
    answer
  );

  res.json({
    message: 'Question saved successfully!'
  });
});


// UPDATE
app.put('/api/questions/:id', (req, res) => {
  const { id } = req.params;

  const {
    category,
    question,
    answer
  } = req.body;

  db.prepare(`
    UPDATE questions
    SET
      category = ?,
      question = ?,
      answer = ?
    WHERE id = ?
  `).run(
    category,
    question,
    answer,
    id
  );

  res.json({
    message: 'Question updated successfully!'
  });
});


// DELETE
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