const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema(
  {
    lot: { type: mongoose.Schema.Types.ObjectId, ref: "ParkingLot" },
    code: String,
    status: { type: String, default: "AVAILABLE" },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    bookingExpiry: Date,
  },
  { timestamps: true }
);


module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);
