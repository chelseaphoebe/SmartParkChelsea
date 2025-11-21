const ParkingLot = require('../models/ParkingLot');
const ParkingSlot = require('../models/ParkingSlot');

exports.getStatistics = async (req, res) => {
  try {
    const lots = await ParkingLot.find().lean();
    
    const lotStatistics = await Promise.all(
      lots.map(async (lot) => {
        const totalSlots = await ParkingSlot.countDocuments({ lot: lot._id });
        const occupiedSlots = await ParkingSlot.countDocuments({ 
          lot: lot._id, 
          status: 'OCCUPIED' 
        });
        const availableSlots = await ParkingSlot.countDocuments({ 
          lot: lot._id, 
          status: 'AVAILABLE' 
        });
        
        const occupancyPercentage = totalSlots > 0 ? 
          Math.round((occupiedSlots / totalSlots) * 100) : 0;
        
        return {
          lotId: lot._id,
          lotName: lot.name,
          totalSlots,
          occupiedSlots,
          availableSlots,
          occupancyPercentage
        };
      })
    );

    // Overall statistics
    const totalSlotsOverall = await ParkingSlot.countDocuments();
    const totalOccupied = await ParkingSlot.countDocuments({ status: 'OCCUPIED' });
    const totalAvailable = await ParkingSlot.countDocuments({ status: 'AVAILABLE' });
    const overallOccupancyPercentage = totalSlotsOverall > 0 ? 
      Math.round((totalOccupied / totalSlotsOverall) * 100) : 0;

    res.json({
      lotStatistics,
      overallStatistics: {
        totalSlots: totalSlotsOverall,
        totalOccupied,
        totalAvailable,
        occupancyPercentage: overallOccupancyPercentage
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};