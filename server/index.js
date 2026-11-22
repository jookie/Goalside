const express = require('express');
const app = express();
app.use(require('cors')());
app.use(require('express').json());

// Health check MUST come FIRST before :table routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend API running' });
});

app.delete('/api/:table/:id', (req, res) => {
  res.json({ table: req.params.table, id: req.params.id, message: 'Delete record' });
});

app.post('/api/:table', (req, res) => {
  res.json({ table: req.params.table, message: 'Create record', data: req.body });
});

app.put('/api/:table/:id', (req, res) => {
  res.json({ table: req.params.table, id: req.params.id, message: 'Update record' });
});

app.get('/api/:table/:id', (req, res) => {
  res.json({ table: req.params.table, id: req.params.id, message: 'Get record' });
});

app.get('/api/:table', (req, res) => {
  res.json({ table: req.params.table, message: 'List all records' });
});

const PORT = 4000;
app.listen(PORT, () => { console.log('Server on ' + PORT); });
