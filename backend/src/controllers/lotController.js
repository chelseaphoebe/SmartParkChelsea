const ParkingLot = require('../models/ParkingLot');
const ParkingSlot = require('../models/ParkingSlot');

exports.createLot = async (req, res) => {
  try {
    const { name, capacity } = req.body;

    const lot = new ParkingLot({ name, capacity });
    await lot.save();

    // create slots automatically
    const slots = [];
    for (let i = 1; i <= capacity; i++) {
      slots.push({
        lot: lot._id,
        code: `${name.split(" ")[0]}-${i}`, // contoh: MallA-1
        status: "AVAILABLE",
      });
    }

    await ParkingSlot.insertMany(slots);

    res.json(lot);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};


exports.getLots = async (req, res) => {
  try {
    const lots = await ParkingLot.find().lean();
    const lotsWithCounts = await Promise.all(
      lots.map(async (lot) => {
        const total = await ParkingSlot.countDocuments({ lot: lot._id });
        const available = await ParkingSlot.countDocuments({
          lot: lot._id,
          status: "AVAILABLE",
        });
        return { ...lot, totalSlots: total, availableSlots: available };
      })
    );

    res.set('Cache-Control', 'no-store');

    res.json(lotsWithCounts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


exports.getLotById = async (req, res) => {
  try {
    const lot = await ParkingLot.findById(req.params.id);
    if (!lot) return res.status(404).json({ error: 'Lot not found' });
    res.json(lot);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateLot = async (req, res) => {
  try {
    const { name, capacity } = req.body;
    const lotId = req.params.lotId;

    const lot = await ParkingLot.findById(lotId);
    if (!lot) return res.status(404).json({ error: "Lot not found" });

    const newCapacity = capacity !== undefined ? Number(capacity) : undefined;
    if (newCapacity !== undefined && (isNaN(newCapacity) || newCapacity < 0)) {
      return res.status(400).json({ error: "Capacity must be a non-negative number" });
    }

    // update name if provided
    if (name !== undefined) lot.name = name;

    await lot.save();

    const currentSlotCount = await ParkingSlot.countDocuments({ lot: lot._id });

    if (newCapacity !== undefined) {
      if (newCapacity > currentSlotCount) {
        const toCreate = newCapacity - currentSlotCount;
        const base = lot.name.replace(/\s+/g, "").replace(/[^a-zA-Z0-9]/g, "");
        const slots = [];
        for (let i = currentSlotCount + 1; i <= newCapacity; i++) {
          slots.push({
            lot: lot._id,
            code: `${base}-${i}`,
            status: "AVAILABLE",
          });
        }
        if (slots.length) await ParkingSlot.insertMany(slots);
      }

      if (newCapacity < currentSlotCount) {
        const toRemove = currentSlotCount - newCapacity;

        const allSlots = await ParkingSlot.find({ lot: lot._id }).lean();

        const slotsWithIndex = allSlots.map(s => {
          const match = String(s.code).match(/-([0-9]+)$/);
          const idx = match ? Number(match[1]) : null;
          return { ...s, idx };
        });

        slotsWithIndex.sort((a, b) => {
          if (a.idx !== null && b.idx !== null) return b.idx - a.idx;
          if (a.idx !== null) return -1;
          if (b.idx !== null) return 1;
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });

        const candidates = slotsWithIndex.filter(s => s.status === "AVAILABLE").slice(0, toRemove);

        if (candidates.length < toRemove) {
          return res.status(400).json({
            error: `Cannot reduce capacity: need to remove ${toRemove} AVAILABLE slots but only ${candidates.length} available. Free up or finish occupied slots first.`,
          });
        }

        const idsToDelete = candidates.map(s => s._id);
        await ParkingSlot.deleteMany({ _id: { $in: idsToDelete } });
      }

      lot.capacity = newCapacity;
      await lot.save();
    }

    const total = await ParkingSlot.countDocuments({ lot: lot._id });
    const available = await ParkingSlot.countDocuments({ lot: lot._id, status: "AVAILABLE" });

    res.json({
      message: "Lot updated",
      lot,
      totalSlots: total,
      availableSlots: available,
    });
  } catch (err) {
    console.error("updateLot error", err);
    res.status(500).json({ error: "Server error" });
  }
};



exports.deleteLot = async (req, res) => {
  try {
    console.log("DELETE LOT CALLED. LotId:", req.params.lotId);

    const lotId = req.params.lotId;

    const occupiedCount = await ParkingSlot.countDocuments({
      lot: lotId,
      status: "OCCUPIED",
    });

    console.log("Occupied count:", occupiedCount);

    if (occupiedCount > 0) {
      console.log("Cannot delete: slots occupied.");
      return res.status(400).json({
        error: "Cannot delete lot. Some slots are still occupied.",
      });
    }

    console.log("Deleting slots...");
    await ParkingSlot.deleteMany({ lot: lotId });

    console.log("Deleting lot...");
    await ParkingLot.findByIdAndDelete(lotId);

    console.log("DONE.");
    res.json({ message: "Parking lot deleted successfully." });
  } catch (err) {
    console.error("DELETE LOT ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};

