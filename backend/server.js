require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const habitationRoutes = require('./routes/habitations');
app.use('/api/habitations', habitationRoutes);

const PORT = 5000;
mongoose.connect('mongodb://127.0.0.1:27017/abhaya')
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));
