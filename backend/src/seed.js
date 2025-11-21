const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const ParkingLot = require('./models/ParkingLot');
const ParkingSlot = require('./models/ParkingSlot');

const connectDB = require('./config/db');

const seedData = async () => {
  try {
    await connectDB();
    
    await User.deleteMany({});
    await ParkingSlot.deleteMany({});
    await ParkingLot.deleteMany({});
    
    console.log('Cleared existing data');

    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: adminPassword,
      role: 'ADMIN'
    });

    const userPassword = await bcrypt.hash('user123', 10);
    const user = await User.create({
      name: 'Regular User',
      email: 'user@example.com',
      passwordHash: userPassword,
      role: 'USER'
    });

    console.log('Created users');

    const lot1 = await ParkingLot.create({
      name: 'Mall Parking',
      capacity: 20
    });

    const lot2 = await ParkingLot.create({
      name: 'Office Building',
      capacity: 15
    });

    const lot3 = await ParkingLot.create({
      name: 'Airport Terminal',
      capacity: 30
    });

    console.log('Created parking lots');

    const mallSlots = [];
    for (let i = 1; i <= 20; i++) {
      mallSlots.push({
        lot: lot1._id,
        code: `A${i}`,
        status: i <= 5 ? 'OCCUPIED' : 'AVAILABLE' 
      });
    }
    await ParkingSlot.insertMany(mallSlots);

    const officeSlots = [];
    for (let i = 1; i <= 15; i++) {
      officeSlots.push({
        lot: lot2._id,
        code: `B${i}`,
        status: i <= 3 ? 'OCCUPIED' : 'AVAILABLE' 
      });
    }
    await ParkingSlot.insertMany(officeSlots);

    const airportSlots = [];
    for (let i = 1; i <= 30; i++) {
      airportSlots.push({
        lot: lot3._id,
        code: `C${i}`,
        status: i <= 10 ? 'OCCUPIED' : 'AVAILABLE' 
      });
    }
    await ParkingSlot.insertMany(airportSlots);

    console.log('Created parking slots');

    console.log('\n=== SEED DATA CREATED ===');
    console.log('Admin: admin@example.com / admin123');
    console.log('User: user@example.com / user123');
    console.log('Parking Lots: 3 lots with slots created');
    console.log('========================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();