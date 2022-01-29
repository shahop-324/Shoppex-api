const Discount = require('../model/DiscountModel')
const apiFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync')

exports.addDiscount = catchAsync(async (req, res, next) => {
  const newDiscount = await Discount.create({
    store: req.store._id,
    ...req.body,
  })

  res.status(200).json({
    status: 'success',
    message: 'Discount Coupon created successfully!',
    data: newDiscount,
  })
})

exports.updateDiscount = catchAsync(async (req, res, next) => {
  const { discountId } = req.params

  const updatedDiscount = await Discount.findByIdAndUpdate(
    discountId,
    {
      ...req.body,
      updatedAt: Date.now(),
    },
    { new: true, validateModifiedOnly: true },
  )

  res.status(200).json({
    status: 'success',
    data: updatedDiscount,
    message: 'Discount Code updated successfully!',
  })
})

exports.deleteDiscount = catchAsync(async (req, res, next) => {
  const { discountId } = req.params

  await Discount.findByIdAndDelete(discountId)

  res.status(200).json({
    status: 'success',
    message: 'Discount coupon deleted successfully',
  })
})

exports.getDiscounts = catchAsync(async (req, res, next) => {
  const query = Discount.find({ store: req.store._id })
  const features = new apiFeatures(query, req.query).textFilter()

  const discounts = await features.query

  res.status(200).json({
    status: 'success',
    data: discounts,
    message: 'Discount codes found successfully!',
  })
})