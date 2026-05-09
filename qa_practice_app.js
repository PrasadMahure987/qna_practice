const express = require('express');
const Database = require('better-sqlite3');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = new Database('/app/data/qa.db');


// TABLE (no subcategory)
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

.card {
  background: white;
  color: black;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 25px;
}

input, textarea, select {
  width: 100%;
  padding: 10px;
  margin: 8px 0;
}

button {
  padding: 8px 14px;
  margin-right: 8px;
  cursor: pointer;
}

.primary { background:#001f3f;color:white; }
.secondary { background:#e5e7eb; }
.danger { background:#dc2626;color:white; }

.category-box {
  background:#dbeafe;
  padding:10px;
  margin-bottom:10px;
}

#answerBox {
  display:none;
  margin-top:10px;
  background:#f3f4f6;
  padding:10px;
}
</style>
</head>

<body>

<h1>Q&A Practice App</h1>

<!-- PRACTICE -->
<div class="card">
<h2>Practice Session</h2>

<label>Select Category</label>
<select id="filterCategory" onchange="applyFilter()">
<option value="">All</option>
</select>

<div class="category-box" id="categoryBox"></div>

<h3 id="questionBox"></h3>
<div id="answerBox"></div>

<br>
<button class="primary" onclick="showAnswer()">Show</button>
<button class="secondary" onclick="previousQuestion()">Previous</button>
<button class="secondary" onclick="nextQuestion()">Next</button>
</div>


<!-- FORM -->
<div class="card">
<h2>Add / Edit</h2>

<form id="qaForm">
<input type="hidden" id="editId">

<input id="category" placeholder="Category" required>
<input id="question" placeholder="Question" required>
<textarea id="answer" placeholder="Answer" required></textarea>

<button class="primary">Save</button>
<button type="button" onclick="resetForm()">Cancel</button>
</form>

<p id="saveMsg"></p>
</div>


<!-- TABLE -->
<div class="card">
<h2>All Questions</h2>

<table border="1" width="100%">
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

  populateCategory();
  applyFilter();
  renderTable();
}


function populateCategory() {
  const select = document.getElementById('filterCategory');

  const cats = [...new Set(allQuestions.map(q => q.category))];

  select.innerHTML = '<option value="">All</option>';

  cats.forEach(c => {
    select.innerHTML += '<option>'+c+'</option>';
  });
}


function applyFilter() {
  const cat = document.getElementById('filterCategory').value;

  questions = allQuestions.filter(q =>
    !cat || q.category === cat
  );

  currentIndex = 0;
  renderPractice();
}


function renderPractice() {
  if (questions.length === 0) {
    document.getElementById('categoryBox').innerText = 'No Data';
    document.getElementById('questionBox').innerText = '';
    document.getElementById('answerBox').innerText = '';
    return;
  }

  const q = questions[currentIndex];

  document.getElementById('categoryBox').innerText =
    'Category: ' + q.category;

  document.getElementById('questionBox').innerText =
    q.question;

  document.getElementById('answerBox').innerText =
    q.answer;

  document.getElementById('answerBox').style.display = 'none';
}


function showAnswer() {
  document.getElementById('answerBox').style.display = 'block';
}


function nextQuestion() {
  currentIndex = (currentIndex + 1) % questions.length;
  renderPractice();
}


function previousQuestion() {
  currentIndex = (currentIndex - 1 + questions.length) % questions.length;
  renderPractice();
}


function renderTable() {
  const tbody = document.getElementById('questionTableBody');
  tbody.innerHTML = '';

  allQuestions.forEach((q,i) => {
    tbody.innerHTML += \`
    <tr>
      <td>\${i+1}</td>
      <td>\${q.category}</td>
      <td>\${q.question}</td>
      <td>\${q.answer}</td>
      <td>
        <button onclick="editQuestion(\${q.id})">Edit</button>
        <button onclick="deleteQuestion(\${q.id})">Delete</button>
      </td>
    </tr>
    \`;
  });
}


function editQuestion(id) {
  const q = allQuestions.find(x => x.id === id);

  document.getElementById('editId').value = q.id;
  document.getElementById('category').value = q.category;
  document.getElementById('question').value = q.question;
  document.getElementById('answer').value = q.answer;
}


async function deleteQuestion(id) {
  if (!confirm('Delete?')) return;

  await fetch('/api/questions/'+id,{method:'DELETE'});
  loadQuestions();
}


function resetForm() {
  document.getElementById('editId').value='';
  document.getElementById('category').value='';
  document.getElementById('question').value='';
  document.getElementById('answer').value='';
}


document.getElementById('qaForm')
.addEventListener('submit', async e => {
  e.preventDefault();

  const id = document.getElementById('editId').value;

  const data = {
    category: document.getElementById('category').value,
    question: document.getElementById('question').value,
    answer: document.getElementById('answer').value
  };

  let url='/api/questions';
  let method='POST';

  if (id) {
    url += '/' + id;
    method='PUT';
  }

  await fetch(url,{
    method,
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(data)
  });

  resetForm();
  loadQuestions();
});

loadQuestions();
</script>

</body>
</html>
  `);
});


// APIs
app.get('/api/questions', (req,res)=>{
  res.json(db.prepare('SELECT * FROM questions').all());
});

app.post('/api/questions', (req,res)=>{
  const {category,question,answer}=req.body;

  db.prepare(`
    INSERT INTO questions(category,question,answer)
    VALUES (?,?,?)
  `).run(category,question,answer);

  res.json({message:'Saved'});
});

app.put('/api/questions/:id',(req,res)=>{
  const {id}=req.params;
  const {category,question,answer}=req.body;

  db.prepare(`
    UPDATE questions
    SET category=?, question=?, answer=?
    WHERE id=?
  `).run(category,question,answer,id);

  res.json({message:'Updated'});
});

app.delete('/api/questions/:id',(req,res)=>{
  db.prepare('DELETE FROM questions WHERE id=?')
    .run(req.params.id);

  res.json({message:'Deleted'});
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});