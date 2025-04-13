const express = require('express');
const cors = require('cors');

const tasksRouter = require('./routes/tasks.js');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/tasks', tasksRouter);

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app; 