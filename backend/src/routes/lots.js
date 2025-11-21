const express = require('express');
const router = express.Router();
const lotController = require('../controllers/lotController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

// Public
router.get('/', lotController.getLots);

// Admin only
router.post('/', auth, role('ADMIN'), lotController.createLot);
router.put('/:lotId', auth, role('ADMIN'), lotController.updateLot);
router.delete('/:lotId', auth, role('ADMIN'), lotController.deleteLot);

module.exports = router;
