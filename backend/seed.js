const mongoose = require('mongoose');
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
