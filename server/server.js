const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Shipment = require('./models/Shipment');

const app = express();
app.use(cors());
app.use(express.json());

//  LOGISTICS STAFF - For Creating a new shipment 
app.post('/api/shipments', async (req, res) => {
  const trackingId = 'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase();
  const newShipment = new Shipment({ 
    ...req.body, 
    trackingId, 
    history: [{ status: 'Pending' }] 
  });
  await newShipment.save();
  res.json(newShipment);
});

// 1. LOGISTICS STAFF - For Updating status 
app.patch('/api/shipments/:id', async (req, res) => {
  const shipment = await Shipment.findById(req.params.id);
  shipment.currentStatus = req.body.status;
  shipment.history.push({ status: req.body.status });
  await shipment.save();
  res.json(shipment);
});

// LOGISTICS STAFF - See all shipments 
app.get('/api/staff/shipments', async (req, res) => {
  const shipments = await Shipment.find();
  res.json(shipments);
});

// 2: CUSTOMER - Search by Company Name
app.get('/api/customer/shipments', async (req, res) => {
  const { companyName } = req.query;
  if (!companyName || !companyName.trim()) {
    return res.status(400).json({ error: 'companyName query parameter is required' });
  }

  const companyRegex = new RegExp(`^${companyName.trim()}$`, 'i');
  const result = await Shipment.find({ senderName: companyRegex });
  res.json(result);
});

//Connecting Mongobd Database
const dbURI = 'mongodb+srv://yakshithasreddy49_db_user:Qm9tFNzE1nderOHd@cluster0.12q0y9y.mongodb.net/?appName=Cluster0';

// 2. Using the variable to connect
mongoose.connect(dbURI)
  .then(() => console.log("Cloud Database Connected Successfully"))
  .catch(err => console.log("Connection Error: ", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});