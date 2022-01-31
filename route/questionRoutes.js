const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const questionController = require('../controllers/questionsController')

router.get(
  '/questions/getAll',
  authController.protect,
  questionController.fetchQuestions,
)

module.exports = router