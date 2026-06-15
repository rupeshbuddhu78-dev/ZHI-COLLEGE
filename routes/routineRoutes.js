const express = require('express');
const router = express.Router();
const routineController = require('../controllers/routineController');

router.post('/', routineController.setRoutine);
router.get('/', routineController.getRoutine);

module.exports = router;
