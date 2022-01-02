const catchAsync = require('../utils/catchAsync')
const product = require('./../model/productModel')

exports.createNewProduct = catchAsync(async (req, res, next) => {
  console.log(req.body) // {name: "Shampoo", price: "150", currency: "INR"}

  const { name, price, currency } = req.body

  await product.create({
    name: name,
    price: price,
    currency: currency,
  })

  console.log('I just reached inside create product')

  res.status(200).json({
    status: 'success',
  })
})

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const products = await product.findById({})

  res.status(200).json({
    status: 'success',
    data: products,
  })
})

exports.updateProduct = catchAsync(async (req, res, next) => {
  const updatedProduct = await product.findByIdAndUpdate(
    '61d1d30e58b11787a17bc1d1',
    {
      name: 'Laptop',
      price: 1250000,
    },
    { new: true, validateModifiedOnly: true },
  )

  res.status(200).json({
    status: 'success',
    data: updatedProduct,
  })
})

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const deletedProduct = await product.findByIdAndDelete(
    '61d1d30e58b11787a17bc1d1',
  )

  res.status(200).json({
    status: 'success',
  })
})

// * DONE POST
// * DONE GET
// * DONE PATCH
// * DONE DELETE
