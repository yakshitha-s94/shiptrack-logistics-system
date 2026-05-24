const mongoose = require('mongoose');// connection of mongoose

// Defining how "Shipment"  should look like in my database
const shipmentSchema = new mongoose.Schema({
  trackingId: { type: String, required: true, unique: true }, //  I receive Auto-generated ID 
  itemName: { type: String, required: true },
  senderName: { type: String, required: true }, // Matches Customer Company Name 
  source: { type: String, required: true },
  destination: { type: String, required: true },
  currentStatus: { 
    type: String, 
    enum: ['Pending', 'In Transit', 'Out for Delivery', 'Delivered'], 
    default: 'Pending' 
  }, // Status flow 
  history: [{
    status: String,
    timestamp: { type: Date, default: Date.now }
  }] // Full status history with timestamps is shown
});

module.exports = mongoose.model('Shipment', shipmentSchema);