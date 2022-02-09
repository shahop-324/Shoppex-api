const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const questionController = require('../controllers/questionsController')

router.get('/getAll', authController.protect, questionController.fetchQuestions)

router.patch(
  '/update/:id',
  authController.protect,
  questionController.updateQuestion,
)

router.delete('/delete/:id', authController.protect, questionController.deleteQuestion)

module.exports = router
