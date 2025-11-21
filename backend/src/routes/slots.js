const express = require('express');
const router = express.Router();
const slotController = require('../controllers/slotController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

router.get('/lot/:lotId', slotController.getSlotsByLot);

router.post('/lot/:lotId', auth, role('ADMIN'), slotController.createSlotsForLot);

router.put('/:slotId/book', auth, slotController.bookSlot);

router.put('/:slotId/occupy', auth, role('ADMIN'), slotController.occupySlot);

router.put('/:slotId', auth, role('ADMIN'), slotController.updateSlotStatus);

router.put('/:slotId/clear', auth, role('ADMIN'), slotController.clearSlot);

module.exports = router;
