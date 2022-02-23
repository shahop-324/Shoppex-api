const Product = require('../model/productModel')
const Catalouge = require('../model/catalougeModel')
// Add, Edit, Delete, Get => Product
const catchAsync = require('../utils/catchAsync')
const apiFeatures = require('../utils/apiFeatures')
const Store = require('../model/storeModel')
const Category = require('../model/categoryModel');
const SubCategory = require('../model/subCategoryModel')
const Division = require('../model/divisionModel')

const filterObj = (obj, ...allowedFields) => {
  const newObj = {}
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el]
  })
  return newObj
}

exports.addProduct = catchAsync(async (req, res, next) => {
  console.log(req.body)

  // Category, SubCategory & Division => Find and update them

  const shopCategory = req.body.category
  const shopSubCategory = req.body.subCategory
  const shopDivision = req.body.division

  // * DONE => Calculate if it qualifies for delivery or not
  // * DONE => Calculate lowest and highest price

  if (!req.body.discountedPrice) {
    req.body.discountedPrice = req.body.price
  }

  let prices = [req.body.price]

  req.body.customVariants.forEach((element) => {
    element.options.forEach((item) => {
      prices.push(item.price * 1)
    })
  })

  // Now prices array contains all prices => just find min and max and you will have lowest and highest prices

  lowest = prices.reduce(function (p, v) {
    return p < v ? p : v
  })

  highest = prices.reduce(function (p, v) {
    return p > v ? p : v
  })

  let qualifyForFreeDelivery = false

  const storeDoc = await Store.findById(req.store._id)
  const freeDeliveryThreshold = storeDoc.freeDeliveryAbove

  if (highest * 1 >= freeDeliveryThreshold * 1) {
    qualifyForFreeDelivery = true
  }

  const newProduct = await Product.create({
    ...req.body,
    lowestPrice: lowest,
    highestPrice: highest,
    store: req.store._id,
    freeDelivery: qualifyForFreeDelivery,
  })

  if (shopCategory) {
    newProduct.shopCategory = shopCategory
    // Add this product id to this category

    const categoryDoc = await Category.findById(shopCategory.get('value'))

    categoryDoc.products.push(newProduct._id)

    await categoryDoc.save({ new: true, validateModifiedOnly: true })
  }

  if (shopSubCategory) {
    newProduct.shopSubCategory = shopSubCategory
    // Add this product id to this subCategory

    const subCategoryDoc = await SubCategory.findById(
      shopSubCategory.get('value'),
    )

    subCategoryDoc.products.push(newProduct._id)

    await subCategoryDoc.save({ new: true, validateModifiedOnly: true })
  }

  if (shopDivision) {
    newProduct.shopDivision = shopDivision
    // Add this product id to this division

    const divisionDoc = await Division.findById(shopDivision.get('value'))

    divisionDoc.products.push(newProduct._id)

    await divisionDoc.save({ new: true, validateModifiedOnly: true })
  }

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
  // * DONE => Calculate lowest and highest price
  // * DONE => Calculate if it qualifies for delivery or not

  // Category, SubCategory & Division => Find and update them

  const shopCategory = req.body.category
  const shopSubCategory = req.body.subCategory
  const shopDivision = req.body.division

  if (!req.body.discountedPrice) {
    req.body.discountedPrice = req.body.price
  }

  let prices = [req.body.price]

  req.body.customVariants.forEach((element) => {
    element.options.forEach((item) => {
      prices.push(item.price * 1)
    })
  })

  // Now prices array contains all prices => just find min and max and you will have lowest and highest prices

  lowest = prices.reduce(function (p, v) {
    return p < v ? p : v
  })

  highest = prices.reduce(function (p, v) {
    return p > v ? p : v
  })

  console.log(req.body)
  const productDoc = await Product.findById(req.params.productId)

  if (productDoc.shopCategory) {
    // Remove this product from prev shopCategory and add to new

    const categoryDoc = await Category.findById(
      productDoc.shopCategory.get('value'),
    )

    categoryDoc.products = categoryDoc.products.filter(
      (el) => el._id.toString() !== productDoc._id.toString(),
    )

    await categoryDoc.save({ new: true, validateModifiedOnly: true })
  }

  if (productDoc.shopSubCategory) {
    // Remove this product from prev shopSubCategory and add to new

    const subCategoryDoc = await SubCategory.findById(
      productDoc.shopSubCategory.get('value'),
    )

    subCategoryDoc.products = subCategoryDoc.products.filter(
      (el) => el._id.toString() !== productDoc._id.toString(),
    )

    await subCategoryDoc.save({ new: true, validateModifiedOnly: true })
  }

  if (productDoc.shopDivision) {
    // Remove this product from prev shopDivision and add to new

    const divisionDoc = await Division.findById(
      productDoc.shopDivision.get('value'),
    )

    divisionDoc.products = divisionDoc.products.filter(
      (el) => el._id.toString() !== productDoc._id.toString(),
    )

    await divisionDoc.save({ new: true, validateModifiedOnly: true })
  }

  if (shopCategory) {
    productDoc.shopCategory = shopCategory

    const newCategoryDoc = await Category.findById(shopCategory.get('value'))

    newCategoryDoc.products.push(newProduct._id)

    await newCategoryDoc.save({ new: true, validateModifiedOnly: true })
  }

  if (shopSubCategory) {
    productDoc.shopSubCategory = shopSubCategory

    const newSubCategoryDoc = await SubCategory.findById(
      shopSubCategory.get('value'),
    )

    newSubCategoryDoc.products.push(newProduct._id)

    await newSubCategoryDoc.save({ new: true, validateModifiedOnly: true })
  }
  if (shopDivision) {
    productDoc.shopDivision = shopDivision

    const newDivisionDoc = await Division.findById(shopDivision.get('value'))

    newDivisionDoc.products.push(newProduct._id)

    await newDivisionDoc.save({ new: true, validateModifiedOnly: true })
  }

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

  const storeDoc = await Store.findById(productDoc.store)
  const freeDeliveryThreshold = storeDoc.freeDeliveryAbove

  if (highest * 1 >= freeDeliveryThreshold * 1) {
    productDoc.freeDelivery = true
  }

  // then update rest of the things

  await productDoc.save({ new: true, validateModifiedOnly: true })

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.productId,
    { ...req.body, lowestPrice: lowest, highestPrice: highest },
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

  const productDoc = await Product.findById(productId)

  if (productDoc.shopCategory) {
    // Remove this product from prev shopCategory and add to new

    const categoryDoc = await Category.findById(
      productDoc.shopCategory.get('value'),
    )

    categoryDoc.products = categoryDoc.products.filter(
      (el) => el._id.toString() !== productDoc._id.toString(),
    )

    await categoryDoc.save({ new: true, validateModifiedOnly: true })
  }

  if (productDoc.shopSubCategory) {
    // Remove this product from prev shopSubCategory and add to new

    const subCategoryDoc = await SubCategory.findById(
      productDoc.shopSubCategory.get('value'),
    )

    subCategoryDoc.products = subCategoryDoc.products.filter(
      (el) => el._id.toString() !== productDoc._id.toString(),
    )

    await subCategoryDoc.save({ new: true, validateModifiedOnly: true })
  }

  if (productDoc.shopDivision) {
    // Remove this product from prev shopDivision and add to new

    const divisionDoc = await Division.findById(
      productDoc.shopDivision.get('value'),
    )

    divisionDoc.products = divisionDoc.products.filter(
      (el) => el._id.toString() !== productDoc._id.toString(),
    )

    await divisionDoc.save({ new: true, validateModifiedOnly: true })
  }

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
    const productDoc = await Product.findById(element)

    if (productDoc.shopCategory) {
      // Remove this product from prev shopCategory and add to new

      const categoryDoc = await Category.findById(
        productDoc.shopCategory.get('value'),
      )

      categoryDoc.products = categoryDoc.products.filter(
        (el) => el._id.toString() !== productDoc._id.toString(),
      )

      await categoryDoc.save({ new: true, validateModifiedOnly: true })
    }

    if (productDoc.shopSubCategory) {
      // Remove this product from prev shopSubCategory and add to new

      const subCategoryDoc = await SubCategory.findById(
        productDoc.shopSubCategory.get('value'),
      )

      subCategoryDoc.products = subCategoryDoc.products.filter(
        (el) => el._id.toString() !== productDoc._id.toString(),
      )

      await subCategoryDoc.save({ new: true, validateModifiedOnly: true })
    }

    if (productDoc.shopDivision) {
      // Remove this product from prev shopDivision and add to new

      const divisionDoc = await Division.findById(
        productDoc.shopDivision.get('value'),
      )

      divisionDoc.products = divisionDoc.products.filter(
        (el) => el._id.toString() !== productDoc._id.toString(),
      )

      await divisionDoc.save({ new: true, validateModifiedOnly: true })
    }

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
