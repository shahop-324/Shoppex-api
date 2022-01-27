const Product = require('../model/productModel')
const Catalouge = require('../model/catalougeModel')
// Add, Edit, Delete, Get => Product
const catchAsync = require('../utils/catchAsync')
const apiFeatures = require('../utils/apiFeatures')

const filterObj = (obj, ...allowedFields) => {
  const newObj = {}
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el]
  })
  return newObj
}

exports.addProduct = catchAsync(async (req, res, next) => {
  console.log(req.body)

  const newProduct = await Product.create({
    ...req.body,
    store: req.store._id,
  })

  newProduct.updatedAt = Date.now()
  await newProduct.save({ new: true, validateModifiedOnly: true })

  // Add this product to its category

  await Catalouge.create({
    ...req.body,
    store: req.store._id,
  })

  // Update corresponding category

  res.status(200).json({
    status: 'success',
    message: 'Product Added successfully!',
    data: newProduct,
  })
})

exports.updateProduct = catchAsync(async (req, res, next) => {
  console.log(req.body)
  const productDoc = await Product.findById(req.params.productId)

  // exclude images that needs to be excluded

  productDoc.images = productDoc.images.filter(
    (el) => !req.body.excludedImages.includes(el),
  )

  // exclude videos that needs to be excluded
  productDoc.videos = productDoc.videos.filter(
    (el) => !req.body.excludedVideos.includes(el),
  )

  // add videos that are added freshly

  for (let element of req.body.videoKeys) {
    productDoc.videos.push(element)
  }

  // add images that are added freshly
  for (let element of req.body.imageKeys) {
    productDoc.images.push(element)
  }

  productDoc.updatedAt = Date.now()

  // then update rest of the things

  await productDoc.save({ new: true, validateModifiedOnly: true })

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.productId,
    { ...req.body },
    { new: true, validateModifiedOnly: true },
  )

  res.status(200).json({
    status: 'success',
    message: 'Product updated successfully!',
    data: updatedProduct,
  })
})

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const { productId } = req.params

  // Remove all products in this category
  await Product.findByIdAndDelete(productId)

  // Remove this product from its category
  res.status(200).json({
    status: 'success',
    message: 'Product deleted successfully!',
  })
})

exports.deleteMultipleProduct = catchAsync(async (req, res, next) => {
  for (let element of req.body.productIds) {
    // Remove all products in this category
    await Product.findByIdAndDelete(element)
    // Remove this product from its category
  }
  res.status(200).json({
    status: 'success',
    message: 'Products deleted successfully!',
  })
})

exports.getProduct = catchAsync(async (req, res, next) => {
  const { productId } = req.params

  const productDoc = await Product.findById(productId)

  res.status(200).json({
    status: 'success',
    message: 'Product Found successfully!',
    data: productDoc,
  })
})

exports.getProducts = catchAsync(async (req, res, next) => {
  // Get all products of a store

  const query = Product.find({ store: req.store._id })

  const features = new apiFeatures(query, req.query).textFilter()
  const products = await features.query

  res.status(200).json({
    status: 'success',
    message: 'Products found successfully!',
    data: products,
  })
})

exports.getLowInStockProducts = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const lowInStockProducts = await Product.find({
    $and: [{ store: id }, { quantityInStock: { $lte: 5 } }],
  })

  res.status(200).json({
    status: 'success',
    data: lowInStockProducts,
    message: 'Low in stcok products found successfully!',
  })
})

exports.getProductsByCategory = catchAsync(async (req, res, next) => {
  const { id, categoryId } = req.params

  const products = await Product.find({
    $and: [{ store: id }, { shopCategory: categoryId }],
  })

  res.status(200).json({
    status: 'success',
    data: products,
    message: 'Products found successfully!',
  })
})

exports.bulkUploadProducts = catchAsync(async (req, res, next) => {
  const { products } = req.body

  await Product.insertMany(products)
    .then((docs) => {
      res.status(200).json({
        status: 'success',
        message: 'Successfully uploaded products!',
        data: docs,
      })
    })
    .catch((err) => {
      res.status(400).json({
        status: 'error',
        message: 'Failed to upload products.',
      })
    })
})

exports.reorderProducts = catchAsync(async (req, res, next) => {
  // Delete all products and arrange them

  await Product.deleteMany({ store: req.store._id })

  const newProducts = await Product.insertMany(req.body.products)

  res.status(200).json({
    message: 'Reordered successfully!',
    data: newProducts,
    status: 'success',
  })
})
