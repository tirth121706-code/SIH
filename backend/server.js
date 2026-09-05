require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Existing Habitation Routes
const habitationRoutes = require('./routes/habitations');
app.use('/api/habitations', habitationRoutes);

// ----------------------------------------------------
// Emergency Facilities Model & Route (Nationwide Safe Havens)
// ----------------------------------------------------
const facilitySchema = new mongoose.Schema({
  id: String,
  name: { type: String, required: true },
  category: { type: String, enum: ['Relocation Center', 'Hospital', 'Medic Post'], required: true },
  coords: { type: [Number], required: true },
  capacity: String,
  medicalSupport: String,
  contact: String,
  doctorCount: Number,
  bedsAvailable: Number,
  state: String
});

const EmergencyFacility = mongoose.models.EmergencyFacility || mongoose.model('EmergencyFacility', facilitySchema);

// GET: Fetch all seeded emergency facilities
app.get('/api/facilities', async (req, res) => {
  try {
    const facilities = await EmergencyFacility.find();
    res.json(facilities);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch facilities' });
  }
});

// ----------------------------------------------------
// Citizen Emergency SOS Model & Routes
// ----------------------------------------------------
const sosSchema = new mongoose.Schema({
  victimName: { type: String, required: true },
  phone: { type: String, required: true },
  calamity: { type: String, required: true },
  aidList: [{ type: String }],
  coords: { type: [Number], required: true }, // [latitude, longitude]
  status: { type: String, default: 'Pending Dispatch' },
  createdAt: { type: Date, default: Date.now }
});

const SosRequest = mongoose.models.SosRequest || mongoose.model('SosRequest', sosSchema);

// GET: Fetch all active distress signals (newest first)
app.get('/api/sos', async (req, res) => {
  try {
    const requests = await SosRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch SOS requests' });
  }
});

// POST: Save a new citizen SOS distress call
app.post('/api/sos', async (req, res) => {
  try {
    const { victimName, phone, calamity, aidList, coords } = req.body;
    const newSos = new SosRequest({
      victimName,
      phone,
      calamity,
      aidList,
      coords
    });
    const saved = await newSos.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: 'Failed to save SOS request' });
  }
});

// PATCH: Ground worker status updates (Pending -> En Route -> Resolved)
app.patch('/api/sos/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await SosRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update status' });
  }
});

// DELETE: Permanently delete an SOS request from MongoDB
app.delete('/api/sos/:id', async (req, res) => {
  try {
    const deleted = await SosRequest.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'SOS record not found' });
    }
    res.json({ success: true, message: 'SOS record deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete SOS record' });
  }
});

// ----------------------------------------------------
// MongoDB Connection & Server Initialization
// ----------------------------------------------------
const PORT = 5000;
mongoose.connect('mongodb://127.0.0.1:27017/abhaya')
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));