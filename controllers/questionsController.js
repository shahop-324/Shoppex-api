const catchAsync = require('../utils/catchAsync')
const apiFeatures = require('../utils/apiFeatures')
const Question = require('../model/QuestionModel')

exports.fetchQuestions = catchAsync(async (req, res, next) => {
  const query = Question.find({ store: req.store._id })

  const features = new apiFeatures(query, req.query).textFilter()
  const questions = await features.query

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
  const updatedQuestion = await Question.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedAt: Date.now() },
    { new: true, validateModifiedOnly: true },
  )

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