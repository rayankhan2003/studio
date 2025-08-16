
const express = require('express');
const router = express.Router();
const testController = require('../controllers/test.controller');

router.post('/', testController.createTest);
router.get('/:id', testController.getTest);

module.exports = router;
