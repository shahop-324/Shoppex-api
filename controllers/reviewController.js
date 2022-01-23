const Review = require('../model/reviewModel')
const catchAsync = require('../utils/catchAsync')

exports.getReveiwsForStore = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const reviews = await Review.find({ store: id })

  res.status(200).json({
    status: 'success',
    message: 'Reviews found successfully!',
    data: reviews,
  })
})

exports.getReviewsForUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params

  const reviews = await Review.find({ user: userId })

  res.status(200).json({
    status: 'success',
    message: 'Reviews found successfully!',
    data: reviews,
  })
})

exports.updateReview = catchAsync(async (req, res, next) => {
  const { reviewComment, rating, keywords, media } = req.body

  const newReview = await Review.create({
    product: productId,
    user: userId,
    comment: reviewComment,
    rating,
    keywords,
    media,
    createdAt: Date.now(),
  })

  res.status(200).json({
    status: 'success',
    message: 'Review created successfully!',
    data: newReview,
  })
})

exports.createReview = catchAsync(async (req, res, next) => {
  const { productId, userId, reviewComment, rating, keywords, media } = req.body

  const newReview = await Review.create({
    product: productId,
    user: userId,
    comment: reviewComment,
    rating,
    keywords,
    media,
    createdAt: Date.now(),
  })

  res.status(200).json({
    status: 'success',
    message: 'Review created successfully!',
    data: newReview,
  })
})
