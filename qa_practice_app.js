/* Replace your full <style> section with this fancy attractive UI */

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Arial, sans-serif;
  max-width: 1250px;
  margin: 0 auto;
  padding: 30px;
  background: linear-gradient(135deg, #0f172a, #001f3f, #0a2540);
  min-height: 100vh;
  color: white;
}

h1 {
  text-align: center;
  margin-bottom: 35px;
  font-size: 42px;
  font-weight: 700;
  letter-spacing: 1px;
  background: linear-gradient(to right, #ffffff, #93c5fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

h2 {
  margin-bottom: 18px;
  color: #0f172a;
  font-size: 24px;
}

h3 {
  font-size: 24px;
  line-height: 1.6;
  color: #111827;
  margin-top: 10px;
}

.card {
  background: rgba(255,255,255,0.96);
  color: #111827;
  border-radius: 20px;
  padding: 28px;
  margin-bottom: 30px;
  box-shadow:
    0 10px 30px rgba(0,0,0,0.18),
    0 4px 10px rgba(0,0,0,0.08);
  border: 1px solid rgba(255,255,255,0.4);
  transition: 0.3s;
}

.card:hover {
  transform: translateY(-2px);
}

label {
  font-weight: 600;
  color: #1e293b;
  display: block;
  margin-top: 10px;
}

input,
textarea,
select {
  width: 100%;
  padding: 14px;
  margin: 10px 0 16px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 15px;
  background: #f8fafc;
  transition: 0.3s;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: #2563eb;
  background: white;
  box-shadow: 0 0 0 4px rgba(37,99,235,0.08);
}

button {
  padding: 12px 22px;
  margin-right: 10px;
  margin-top: 8px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: 0.25s;
}

button:hover {
  transform: translateY(-1px);
}

.primary {
  background: linear-gradient(to right, #1d4ed8, #2563eb);
  color: white;
  box-shadow: 0 4px 12px rgba(37,99,235,0.25);
}

.primary:hover {
  box-shadow: 0 8px 20px rgba(37,99,235,0.35);
}

.secondary {
  background: #e2e8f0;
  color: #111827;
}

.secondary:hover {
  background: #cbd5e1;
}

.danger {
  background: linear-gradient(to right, #dc2626, #ef4444);
  color: white;
}

.danger:hover {
  box-shadow: 0 8px 20px rgba(239,68,68,0.25);
}

.category-box {
  background: linear-gradient(to right, #dbeafe, #eff6ff);
  padding: 16px;
  margin-bottom: 18px;
  border-radius: 14px;
  font-weight: 700;
  color: #0f172a;
  border-left: 6px solid #2563eb;
  font-size: 15px;
}

#answerBox {
  display: none;
  margin-top: 18px;
  background: #f8fafc;
  padding: 20px;
  border-radius: 14px;
  border-left: 6px solid #16a34a;
  font-size: 16px;
  line-height: 1.7;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 18px;
  overflow: hidden;
  border-radius: 14px;
}

table th,
table td {
  padding: 15px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  vertical-align: top;
}

table th {
  background: #eff6ff;
  color: #0f172a;
  font-weight: 700;
}

table tr:nth-child(even) {
  background: #f8fafc;
}

table tr:hover {
  background: #f1f5f9;
}

.small-btn {
  padding: 8px 14px;
  font-size: 13px;
}

#saveMsg {
  margin-top: 15px;
  font-weight: 600;
  color: #16a34a;
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

  button {
    width: 100%;
    margin-bottom: 10px;
  }

  table {
    font-size: 13px;
  }
}
</style>