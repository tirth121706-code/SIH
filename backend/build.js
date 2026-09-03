const fs = require('fs');

if (!fs.existsSync('models')) fs.mkdirSync('models');
if (!fs.existsSync('routes')) fs.mkdirSync('routes');

// 1. Generate server.js
fs.writeFileSync('server.js', `require('dotenv').config();
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
    app.listen(PORT, () => console.log(\`🚀 Server running on http://localhost:\${PORT}\`));
  })
  .catch(err => console.error('MongoDB connection error:', err));
`);

// 2. Generate models/Habitation.js
fs.writeFileSync('models/Habitation.js', `const mongoose = require('mongoose');

const HabitationSchema = new mongoose.Schema({
  name: String,
  district: String,
  hazardType: String,
  population: Number,
  households: Number,
  hazardDistance: String,
  carryingCapacityStatus: String,
  vulnerabilityScore: Number,
  riskLevel: String
});

module.exports = mongoose.model('Habitation', HabitationSchema);
`);

// 3. Generate routes/habitations.js
fs.writeFileSync('routes/habitations.js', `const express = require('express');
const router = express.Router();
const Habitation = require('../models/Habitation');

router.get('/', async (req, res) => {
  try {
    const habitations = await Habitation.find();
    res.json(habitations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/priorities', async (req, res) => {
  try {
    const priorities = await Habitation.find().sort({ vulnerabilityScore: -1 }).limit(6);
    res.json(priorities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const totalHabitations = await Habitation.countDocuments();
    const criticalZones = await Habitation.countDocuments({ riskLevel: 'Critical' });
    const allHabitations = await Habitation.find();
    const populationAtRisk = allHabitations.reduce((sum, hab) => sum + hab.population, 0);

    res.json({
      totalHabitations,
      criticalZones,
      populationAtRisk,
      relocationsFlagged: criticalZones
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
`);

// 4. Generate seed.js
fs.writeFileSync('seed.js', `const mongoose = require('mongoose');
const Habitation = require('./models/Habitation');

mongoose.connect('mongodb://127.0.0.1:27017/abhaya')
  .then(async () => {
    console.log('Connected to MongoDB. Clearing old data...');
    await Habitation.deleteMany({});

    const dummyData = [
      { name: 'Kotla Basti', district: 'Riverside', hazardType: 'Flood', population: 4120, households: 812, hazardDistance: '0.4 km', carryingCapacityStatus: 'Exceeded', vulnerabilityScore: 94, riskLevel: 'Critical' },
      { name: 'Chandpur Colony', district: 'Riverside', hazardType: 'River Erosion', population: 3860, households: 765, hazardDistance: '0.2 km', carryingCapacityStatus: 'Exceeded', vulnerabilityScore: 91, riskLevel: 'Critical' },
      { name: 'Rampur Nagar', district: 'Hillside', hazardType: 'Landslide', population: 2910, households: 540, hazardDistance: '0.6 km', carryingCapacityStatus: 'Near limit', vulnerabilityScore: 86, riskLevel: 'High' },
      { name: 'Gopalpur', district: 'Coastal', hazardType: 'Cyclone', population: 5430, households: 1120, hazardDistance: '1.1 km', carryingCapacityStatus: 'Near limit', vulnerabilityScore: 79, riskLevel: 'High' },
      { name: 'Sundarban Ghat', district: 'Riverside', hazardType: 'Flood', population: 1780, households: 349, hazardDistance: '1.8 km', carryingCapacityStatus: 'Within limit', vulnerabilityScore: 68, riskLevel: 'Moderate' },
      { name: 'Vasant Vihar', district: 'Coastal', hazardType: 'Cyclone', population: 960, households: 201, hazardDistance: '3.2 km', carryingCapacityStatus: 'Within limit', vulnerabilityScore: 31, riskLevel: 'Low' }
    ];

    await Habitation.insertMany(dummyData);
    console.log('✅ Seed data inserted successfully!');
    process.exit();
  })
  .catch(err => {
    console.error('Error seeding data:', err);
    process.exit(1);
  });
`);

console.log('✅ All files generated successfully with local MongoDB URL!');