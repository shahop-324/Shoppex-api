const catchAsync = require('../utils/catchAsync')
const apiFeatures = require('../utils/apiFeatures')
const Question = require('../model/QuestionModel')

exports.fetchQuestions = catchAsync(async (req, res, next) => {
  let questions = await Question.find({ store: req.store._id })

  if (req.query.text) {
    switch (req.query.text) {
      case 'Answered':
        questions = questions.filter((el) => el.answer)
        break
      case 'Unanswered':
        questions = questions.filter((el) => !el.answer)
        break
      case 'Featured':
        questions = questions.filter((el) => el.featured)
        break
      case 'Hidden':
        questions = questions.filter((el) => el.hidden)
        break
      case 'Pinned':
        questions = questions.filter((el) => el.pinned)
        break

      default:
        break
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Questions found successfully!',
    data: questions,
  })
})

exports.createQuestion = catchAsync(async (req, res, next) => {
  const newQuestion = await Question.create({
    store: req.store._id,
    ...req.body,
    createdAt: Date.now(),
  })

  res.status(200).json({
    status: 'success',
    data: newQuestion,
    message: 'Question posted successfully!',
  })
})

exports.updateQuestion = catchAsync(async (req, res, next) => {
  let updatedQuestion = await Question.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedAt: Date.now() },
    { new: true, validateModifiedOnly: true },
  )

  if (req.body.answer) {
    updatedQuestion.answeredBy = req.user._id
    updatedQuestion.answeredAt = Date.now()
    updatedQuestion = await updatedQuestion.save({
      new: true,
      validateModifiedOnly: true,
    })
  }

  res.status(200).json({
    status: 'success',
    data: updatedQuestion,
    message: 'Question updated successfully!',
  })
})

exports.deleteQuestion = catchAsync(async (req, res, next) => {
  await Question.findByIdAndDelete(req.params.id)

  res.status(200).json({
    status: 'success',
    message: 'Question deleted successfully!',
  })
})
