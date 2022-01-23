const Product = require('../model/productModel')
// Add, Edit, Delete, Get => Product
const catchAsync = require('../utils/catchAsync')

exports.addProduct = catchAsync(async (req, res, next) => {
  const {
    coins,
    name,
    category,
    price,
    discountedPrice,
    wholesalePrice,
    minWholesalePrice,
    type,
    description,
    COD,
    images,
    productUnit,
    minimumQuantitySold,
    SKU,
    quantityInStock,
    weight,
    variants,
    colors,
    addOns,
    compulsoryAddon,
    metaTitle,
    metaKeywords,
    metaDescription,
  } = req.body

  const newProduct = await Product.create({
    coins,
    store: req.params.id,
    shopCategory: req.params.categoryId,
    name,
    category,
    price,
    discountedPrice,
    wholesalePrice,
    minWholesalePrice,
    type,
    description,
    COD,
    images,
    productUnit,
    minimumQuantitySold,
    SKU,
    quantityInStock,
    weight,
    variants,
    colors,
    addOns,
    compulsoryAddon,
    metaTitle,
    metaKeywords,
    metaDescription,
  })
  
  res.status(200).json({
    status: 'success',
    message: 'Product Added successfully!',
    data: newProduct,
  })
})

exports.updateProduct = catchAsync(async (req, res, next) => {
  const { id, categoryId, productId } = req.params

  const {
    coins,
    name,
    category,
    price,
    discountedPrice,
    wholesalePrice,
    minWholesalePrice,
    type,
    description,
    COD,
    images,
    productUnit,
    minimumQuantitySold,
    SKU,
    quantityInStock,
    weight,
    variants,
    colors,
    addOns,
    compulsoryAddon,
    metaTitle,
    metaKeywords,
    metaDescription,
  } = req.body

  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    {
      coins,
      store: id,
      shopCategory: categoryId,
      name,
      category,
      price,
      discountedPrice,
      wholesalePrice,
      minWholesalePrice,
      type,
      description,
      COD,
      images,
      productUnit,
      minimumQuantitySold,
      SKU,
      quantityInStock,
      weight,
      variants,
      colors,
      addOns,
      compulsoryAddon,
      metaTitle,
      metaKeywords,
      metaDescription,
    },
    { new: true, validateModifiedOnly: true },
  )

  res.status(200).json({
    status: 'success',
    message: 'Product updated successfully!',
    data: updatedProduct,
  })
})

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const { id, categoryId, productId } = req.params

  await Product.findByIdAndDelete(productId)
  // Remove this product from its category

  res.status(200).json({
    status: 'success',
    message: 'Product deleted successfully!',
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

  const { id } = req.params

  const products = await Product.find({ store: id })

  res.status(200).json({
    status: 'success',
    data: products,
    message: 'Products found successfully!',
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