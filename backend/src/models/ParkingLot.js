const mongoose = require('mongoose');

const parkingLotSchema = new mongoose.Schema({
  name: { type: String, required: true },
  capacity: { type: Number, default: 0 },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ParkingLot', parkingLotSchema);
