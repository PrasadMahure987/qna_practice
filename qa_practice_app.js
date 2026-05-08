// Q&A Practice App using Node.js + Express + better-sqlite3
// Features:
// 1. Add Questions + Answers and store in SQLite DB
// 2. Practice mode: show question first
// 3. Click "Show Answer" to reveal answer
// 4. Click "Next" to move to next question
//
// Run locally:
// npm init -y
// npm install express body-parser better-sqlite3
// node qa_practice_app.js
//
// Open:
// http://localhost:3000

const express = require('express');
const Database = require('better-sqlite3');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database setup
// Using /tmp because it works better inside Docker/Kubernetes
const db = new Database('/tmp/qa.db');

// Create table if not exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL
  )
`).run();


// Home Page
app.get('/', (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>Q&A Practice App</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        max-width: 900px;
        margin: 40px auto;
        padding: 20px;
      }

      .card {
        border: 1px solid #ddd;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      }

      input, textarea {
        width: 100%;
        padding: 10px;
        margin: 8px 0;
        border: 1px solid #ccc;
        border-radius: 8px;
      }

      button {
        padding: 10px 18px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        margin-right: 10px;
      }

      .primary {
        background: #111827;
        color: white;
      }

      .secondary {
        background: #e5e7eb;
      }

      #answerBox {
        margin-top: 15px;
        padding: 15px;
        background: #f9fafb;
        border-radius: 8px;
        display: none;
      }
    </style>
  </head>
  <body>

    <h1>Q&A Practice App</h1>

    <!-- Add Question Section -->
    <div class="card">
      <h2>Add Question & Answer</h2>

      <form id="qaForm">
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
      </form>

      <p id="saveMsg"></p>
    </div>


    <!-- Practice Section -->
    <div class="card">
      <h2>Practice Session</h2>

      <h3 id="questionBox">
        Loading question...
      </h3>

      <div id="answerBox"></div>

      <br/>

      <button
        class="primary"
        onclick="showAnswer()"
      >
        Show Answer
      </button>

      <button
        class="secondary"
        onclick="nextQuestion()"
      >
        Next
      </button>
    </div>


    <script>
      let questions = [];
      let currentIndex = 0;

      async function loadQuestions() {
        const res = await fetch('/api/questions');
        questions = await res.json();

        if (questions.length === 0) {
          document.getElementById('questionBox').innerText =
            'No questions found. Please add some first.';
          return;
        }

        renderQuestion();
      }

      function renderQuestion() {
        const q = questions[currentIndex];

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

        renderQuestion();
      }

      document
        .getElementById('qaForm')
        .addEventListener('submit', async (e) => {
          e.preventDefault();

          const question =
            document.getElementById('question').value;

          const answer =
            document.getElementById('answer').value;

          const res = await fetch('/api/questions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              question,
              answer
            })
          });

          const data = await res.json();

          document.getElementById('saveMsg').innerText =
            data.message;

          document.getElementById('question').value = '';
          document.getElementById('answer').value = '';

          await loadQuestions();
        });

      loadQuestions();
    </script>

  </body>
  </html>
  `);
});


// GET all questions
app.get('/api/questions', (req, res) => {
  try {
    const rows = db.prepare(
      'SELECT * FROM questions ORDER BY id ASC'
    ).all();

    res.json(rows);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});


// POST new question
app.post('/api/questions', (req, res) => {
  const { question, answer } = req.body;

  if (!question || !answer) {
    return res.status(400).json({
      message: 'Question and Answer are required'
    });
  }

  try {
    const stmt = db.prepare(
      'INSERT INTO questions (question, answer) VALUES (?, ?)'
    );

    stmt.run(question, answer);

    res.json({
      message: 'Question saved successfully!'
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(
    \`Server running at http://localhost:\${PORT}\`
  );
});