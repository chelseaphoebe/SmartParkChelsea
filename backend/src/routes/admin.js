const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

router.get('/statistics', auth, role('ADMIN'), adminController.getStatistics);

module.exports = router;