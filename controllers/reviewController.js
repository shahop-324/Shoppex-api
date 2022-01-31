const catchAsync = require('../utils/catchAsync')
const apiFeatures = require('../utils/apiFeatures')
const Review = require('../model/reviewModel')

exports.fetchReviews = catchAsync(async (req, res, next) => {
  const query = Review.find({ store: req.store._id })

  const features = new apiFeatures(query, req.query).textFilter()
  const reviews = await features.query

  res.status(200).json({
    status: 'success',
    message: 'Reviews found successfully!',
    data: reviews,
  })
})

exports.createReview = catchAsync(async (req, res, next) => {
  const newReview = await Review.create({
    store: req.store._id,
    ...req.body,
    createdAt: Date.now(),
  })

  res.status(200).json({
    status: 'success',
    data: newReview,
    message: 'Review created successfully!',
  })
})

exports.updateReview = catchAsync(async (req, res, next) => {
  const updatedReview = await Review.findByIdAndUpdate(req.params.id, {
    ...req.body,
    updatedAt: Date.now(),
  })

  res.status(200).json({
    status: 'success',
    data: updatedReview,
    message: 'Review updated successfully!',
  })
})

exports.deleteReview = catchAsync(async (req, res, next) => {
  await Review.findByIdAndDelete(req.params.id)

  res.status(200).json({
    status: 'success',
    message: 'Review deleted successfully!',
  })
})