const Category = require('../model/categoryModel')
const Product = require('../model/productModel')
const catchAsync = require('../utils/catchAsync')
const apiFeatures = require('../utils/apiFeatures')
// Add, Edit, Delete, Get => Category

const filterObj = (obj, ...allowedFields) => {
  const newObj = {}
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el]
  })
  return newObj
}

exports.addCategory = catchAsync(async (req, res, next) => {
  const { name, image } = req.body

  const newCategory = await Category.create({
    store: req.store._id,
    name,
    image,
  })

  res.status(200).json({
    status: 'success',
    message: 'New category added successfully!',
    data: newCategory,
  })
})

exports.updateCategory = catchAsync(async (req, res, next) => {
  const { categoryId } = req.params

  const filteredBody = filterObj(
    req.body,
    'name',
    'image',
    'outOfStock',
    'hidden',
  )

  const updatedCategory = await Category.findByIdAndUpdate(
    categoryId,
    filteredBody,
    { new: true, validateModifiedOnly: true },
  )

  res.status(200).json({
    status: 'success',
    message: 'Category updated successfully!',
    data: updatedCategory,
  })
})

exports.deleteCategory = catchAsync(async (req, res, next) => {
  const { categoryId } = req.params

  // Remove all products in this category
  await Product.deleteMany({ shopCategory: categoryId })

  // Remove this category
  await Category.findByIdAndDelete(categoryId)

  res.status(200).json({
    status: 'success',
    message: 'Category deleted successfully!',
  })
})

exports.deleteMultipleCategory = catchAsync(async (req, res, next) => {
  for (let element of req.body.categoryIds) {
    // Remove all products in this category
    await Product.deleteMany({ shopCategory: element })

    // Remove this category
    await Category.findByIdAndDelete(element)
  }
  res.status(200).json({
    status: 'success',
    message: 'Categories deleted successfully!',
  })
})

exports.getCategories = catchAsync(async (req, res, next) => {
  // Also send total no. of products, total sales using aggregation pipeline

  console.log(req.params)

  const query = Category.find({ store: req.store._id })

  const features = new apiFeatures(query, req.query).textFilter()
  const categories = await features.query

  res.status(200).json({
    status: 'success',
    message: 'Categories found successfully!',
    data: categories,
  })
})

exports.reorderCategories = catchAsync(async (req, res, next) => {
  // Delete all of prev categories and create new ones

  await Category.deleteMany({ store: req.store._id })

  const newCategories = await Category.insertMany(req.body.categories)

  res.status(200).json({
    message: 'Reordered successfully!',
    data: newCategories,
    status: 'success',
  })
})
