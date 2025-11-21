require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const ParkingLot = require('./models/ParkingLot');
const ParkingSlot = require('./models/ParkingSlot');

const restoreData = async () => {
  try {
    await connectDB();

    // Check if admin user exists, if not create one
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const adminPass = await bcrypt.hash('admin123', salt);
      const admin = new User({ 
        name: 'Admin', 
        email: 'admin@example.com', 
        passwordHash: adminPass, 
        role: 'ADMIN' 
      });
      await admin.save();
      console.log('Admin user created');
    }

    // Check if regular user exists, if not create one
    const existingUser = await User.findOne({ email: 'user@example.com' });
    if (!existingUser) {
      const salt = await bcrypt.genSalt(10);
      const userPass = await bcrypt.hash('user123', salt);
      const user = new User({ 
        name: 'User', 
        email: 'user@example.com', 
        passwordHash: userPass, 
        role: 'USER' 
      });
      await user.save();
      console.log('Regular user created');
    }

    // Check if parking lots exist, if not create sample ones
    const existingLots = await ParkingLot.find();
    if (existingLots.length === 0) {
      const lotA = new ParkingLot({ 
        name: 'Mall A - Floor 1', 
        capacity: 15, 
        description: 'Mall A basement floor' 
      });
      const lotB = new ParkingLot({ 
        name: 'Mall B - Ground', 
        capacity: 12, 
        description: 'Mall B ground floor' 
      });
      await lotA.save();
      await lotB.save();

      // Create slots for the new lots
      const slots = [];
      for (let i = 1; i <= 15; i++) {
        slots.push({ 
          lot: lotA._id, 
          code: `A${i}`, 
          status: i % 7 === 0 ? 'OCCUPIED' : 'AVAILABLE' 
        });
      }
      for (let i = 1; i <= 12; i++) {
        slots.push({ 
          lot: lotB._id, 
          code: `B${i}`, 
          status: i % 5 === 0 ? 'RESERVED' : 'AVAILABLE' 
        });
      }

      await ParkingSlot.insertMany(slots);
      console.log('Sample parking lots and slots created');
    } else {
      console.log(`Found ${existingLots.length} existing parking lots - keeping them`);
    }

    console.log('Data restoration completed.');
    console.log('Admin login -> admin@example.com / admin123');
    console.log('User login  -> user@example.com / user123');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

restoreData();