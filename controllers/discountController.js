const catchAsync = require('../utils/catchAsync')

exports.addDiscount = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const {
    code,
    usesPerCustomer,
    type,
    minOrderValue,
    maxDiscountValue,
    discountAmount,
    validForOnlyFirstPurchase,
    validForCategories,
    validForProducts,
    buyProduct,
    buyX,
    getY,
    getProduct,
    validTill,
    hidden,
    enabled,
  } = req.body

  const newDiscount = await Discount.create({
    createdAt: Date.now(),
    store: id,
    code,
    usesPerCustomer,
    type,
    minOrderValue,
    maxDiscountValue,
    discountAmount,
    validForOnlyFirstPurchase,
    validForCategories,
    validForProducts,
    buyProduct,
    buyX,
    getY,
    getProduct,
    validTill,
    hidden,
    enabled,
  })

  res.status(200).json({
    status: 'success',
    message: 'Discount Coupon created successfully!',
    data: newDiscount,
  })
})

exports.updateDiscount = catchAsync(async (req, res, next) => {
  const { discountId, id } = req.params
  const {
    code,
    usesPerCustomer,
    type,
    minOrderValue,
    maxDiscountValue,
    discountAmount,
    validForOnlyFirstPurchase,
    validForCategories,
    validForProducts,
    buyProduct,
    buyX,
    getY,
    getProduct,
    validTill,
    hidden,
    enabled,
  } = req.body

  const updatedDiscount = await Discount.findByIdAndUpdate(
    discountId,
    {
      code,
      usesPerCustomer,
      type,
      minOrderValue,
      maxDiscountValue,
      discountAmount,
      validForOnlyFirstPurchase,
      validForCategories,
      validForProducts,
      buyProduct,
      buyX,
      getY,
      getProduct,
      validTill,
      hidden,
      enabled,
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
  const { id } = req.params

  const discounts = await Discount.find({ store: id })

  res.status(200).json({
    status: 'success',
    data: discounts,
    message: 'Discount codes found successfully!',
  })
})
