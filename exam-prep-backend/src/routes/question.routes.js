
const express = require('express');
const router = express.Router();
const questionController = require('../controllers/question.controller');

router.post('/', questionController.createQuestion);
router.get('/', questionController.getQuestions);
router.put('/:id', questionController.updateQuestion);
router.delete('/:id', questionController.deleteQuestion);

module.exports = router;
