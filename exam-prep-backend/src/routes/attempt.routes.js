
const express = require('express');
const router = express.Router();
const attemptController = require('../controllers/attempt.controller');

router.post('/', attemptController.saveAttempt);
router.get('/history/:userId', attemptController.getAttemptHistory);

module.exports = router;
