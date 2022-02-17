const catchAsync = require('../utils/catchAsync')
const apiFeatures = require('../utils/apiFeatures')
const Review = require('../model/reviewModel')

exports.fetchReviews = catchAsync(async (req, res, next) => {
  let reviews = await Review.find({ store: req.store._id })

  if (req.query.text) {
    switch (req.query.text) {
      case 'Accepted':
        reviews = reviews.filter((el) => el.accepted)
        break
      case 'Rejected':
        reviews = reviews.filter((el) => !el.accepted)
        break
      case 'Featured':
        reviews = reviews.filter((el) => el.featured)
        break
      case 'Hidden':
        reviews = reviews.filter((el) => el.hidden)
        break
      case 'Pinned':
        reviews = reviews.filter((el) => el.pinned)
        break

      default:
        break
    }
  }

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
  let updatedReview = await Review.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      updatedAt: Date.now(),
    },
    { new: true, validateModifiedOnly: true },
  )

  if (req.body.accepted) {
    updatedReview.audited = true
    updatedReview = await updatedReview.save({
      new: true,
      validateModifiedOnly: true,
    })
  }

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
