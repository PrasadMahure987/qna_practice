// Q&A Practice App using Node.js + Express + better-sqlite3
// Features:
// 1. Previous + Next question
// 2. Category + Sub Category support
// 3. Category/Subcategory dropdown filter in Practice Session
// 4. Add/Edit/Delete Question
// 5. Serial numbers
// 6. Navy blue background
// 7. Persistent SQLite DB using PVC path

const express = require('express');
const Database = require('better-sqlite3');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = new Database('/app/data/qa.db');


// CREATE TABLE
db.prepare(`
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL DEFAULT 'General',
    subcategory TEXT NOT NULL DEFAULT 'General',
    question TEXT NOT NULL,
    answer TEXT NOT NULL
  )
`).run();


// ADD category/subcategory columns if old DB exists
try {
  db.prepare(`
    ALTER TABLE questions
    ADD COLUMN category TEXT NOT NULL DEFAULT 'General'
  `).run();
} catch (err) {}

try {
  db.prepare(`
    ALTER TABLE questions
    ADD COLUMN subcategory TEXT NOT NULL DEFAULT 'General'
  `).run();
} catch (err) {}


// HOME PAGE
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Q&A Practice App</title>

  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 1200px;
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
      font-size: 14px;
    }

    button {
      padding: 10px 18px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      margin-right: 10px;
      margin-top: 8px;
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
      padding: 10px;
      border-radius: 8px;
      font-weight: bold;
      margin-bottom: 15px;
      color: #111827;
    }

    #answerBox {
      margin-top: 15px;
      padding: 15px;
      background: #f3f4f6;
      border-radius: 8px;
      display: none;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
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

  <label>Select Sub Category</label>
  <select id="filterSubcategory" onchange="applyFilter()">
    <option value="">All Sub Categories</option>
  </select>

  <div class="category-box" id="categoryBox">
    Category: Loading...
  </div>

  <h3 id="questionBox">
    Loading question...
  </h3>

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
  <h2>Add / Edit Question & Answer</h2>

  <form id="qaForm">

    <input type="hidden" id="editId" />

    <input
      type="text"
      id="category"
      placeholder="Enter Category (Example: Azure)"
      required
    />

    <input
      type="text"
      id="subcategory"
      placeholder="Enter Sub Category (Example: Networking)"
      required
    />

    <input
      type="text"
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

    <button class="primary" type="submit">
      Save
    </button>

    <button
      type="button"
      class="secondary"
      onclick="resetForm()">
      Cancel Edit
    </button>

  </form>

  <p id="saveMsg"></p>
</div>


<!-- QUESTION LIST -->
<div class="card">
  <h2>All Questions</h2>

  <table>
    <thead>
      <tr>
        <th>Sr No.</th>
        <th>Category</th>
        <th>Sub Category</th>
        <th>Question</th>
        <th>Answer</th>
        <th>Actions</th>
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

  populateCategoryDropdown();
  applyFilter();
  renderQuestionTable();
}


function populateCategoryDropdown() {
  const categorySelect =
    document.getElementById('filterCategory');

  const categories =
    [...new Set(allQuestions.map(q => q.category))];

  categorySelect.innerHTML =
    '<option value="">All Categories</option>';

  categories.forEach(cat => {
    categorySelect.innerHTML +=
      '<option value="' + cat + '">' + cat + '</option>';
  });
}


function populateSubcategoryDropdown(selectedCategory) {
  const subSelect =
    document.getElementById('filterSubcategory');

  let filtered = allQuestions;

  if (selectedCategory) {
    filtered = allQuestions.filter(
      q => q.category === selectedCategory
    );
  }

  const subs =
    [...new Set(filtered.map(q => q.subcategory))];

  subSelect.innerHTML =
    '<option value="">All Sub Categories</option>';

  subs.forEach(sub => {
    subSelect.innerHTML +=
      '<option value="' + sub + '">' + sub + '</option>';
  });
}


function applyFilter() {
  const selectedCategory =
    document.getElementById('filterCategory').value;

  populateSubcategoryDropdown(selectedCategory);

  const selectedSub =
    document.getElementById('filterSubcategory').value;

  questions = allQuestions.filter(q => {
    const categoryMatch =
      !selectedCategory || q.category === selectedCategory;

    const subMatch =
      !selectedSub || q.subcategory === selectedSub;

    return categoryMatch && subMatch;
  });

  currentIndex = 0;

  renderQuestionTable();
  renderPracticeQuestion();
}


function renderPracticeQuestion() {
  if (questions.length === 0) {
    document.getElementById('categoryBox').innerText =
      'No matching questions found';

    document.getElementById('questionBox').innerText =
      'Please select another category/subcategory';

    document.getElementById('answerBox').innerText = '';
    return;
  }

  const q = questions[currentIndex];

  document.getElementById('categoryBox').innerText =
    'Category: ' + q.category +
    ' | Sub Category: ' + q.subcategory;

  document.getElementById('questionBox').innerText =
    q.question;

  document.getElementById('answerBox').innerText =
    q.answer;

  document.getElementById('answerBox').style.display =
    'none';
}


function showAnswer() {
  if (questions.length > 0) {
    document.getElementById('answerBox').style.display =
      'block';
  }
}


function nextQuestion() {
  if (questions.length === 0) return;

  currentIndex =
    (currentIndex + 1) % questions.length;

  renderPracticeQuestion();
}


function previousQuestion() {
  if (questions.length === 0) return;

  currentIndex =
    (currentIndex - 1 + questions.length) % questions.length;

  renderPracticeQuestion();
}


function renderQuestionTable() {
  const tbody =
    document.getElementById('questionTableBody');

  tbody.innerHTML = '';

  allQuestions.forEach((q, index) => {
    tbody.innerHTML += \`
      <tr>
        <td>\${index + 1}</td>
        <td>\${q.category}</td>
        <td>\${q.subcategory}</td>
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


function editQuestion(id) {
  const q = allQuestions.find(item => item.id === id);

  document.getElementById('editId').value = q.id;
  document.getElementById('category').value = q.category;
  document.getElementById('subcategory').value = q.subcategory;
  document.getElementById('question').value = q.question;
  document.getElementById('answer').value = q.answer;
}


async function deleteQuestion(id) {
  if (!confirm('Delete this question?')) return;

  await fetch('/api/questions/' + id, {
    method: 'DELETE'
  });

  loadQuestions();
}


function resetForm() {
  document.getElementById('editId').value = '';
  document.getElementById('category').value = '';
  document.getElementById('subcategory').value = '';
  document.getElementById('question').value = '';
  document.getElementById('answer').value = '';
  document.getElementById('saveMsg').innerText = '';
}


document.getElementById('qaForm')
.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id =
    document.getElementById('editId').value;

  const category =
    document.getElementById('category').value;

  const subcategory =
    document.getElementById('subcategory').value;

  const question =
    document.getElementById('question').value;

  const answer =
    document.getElementById('answer').value;

  let url = '/api/questions';
  let method = 'POST';

  if (id) {
    url = '/api/questions/' + id;
    method = 'PUT';
  }

  const res = await fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      category,
      subcategory,
      question,
      answer
    })
  });

  const data = await res.json();

  document.getElementById('saveMsg').innerText =
    data.message;

  resetForm();
  loadQuestions();
});

loadQuestions();
</script>

</body>
</html>
  `);
});


// GET ALL
app.get('/api/questions', (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM questions
    ORDER BY id ASC
  `).all();

  res.json(rows);
});


// ADD
app.post('/api/questions', (req, res) => {
  const {
    category,
    subcategory,
    question,
    answer
  } = req.body;

  db.prepare(`
    INSERT INTO questions
    (category, subcategory, question, answer)
    VALUES (?, ?, ?, ?)
  `).run(
    category,
    subcategory,
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
    subcategory,
    question,
    answer
  } = req.body;

  db.prepare(`
    UPDATE questions
    SET
      category = ?,
      subcategory = ?,
      question = ?,
      answer = ?
    WHERE id = ?
  `).run(
    category,
    subcategory,
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
  const { id } = req.params;

  db.prepare(`
    DELETE FROM questions
    WHERE id = ?
  `).run(id);

  res.json({
    message: 'Question deleted successfully!'
  });
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});