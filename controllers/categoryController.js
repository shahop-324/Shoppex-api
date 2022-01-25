const Category = require('../model/CategoryModel')
const Product = require('../model/productModel')
const catchAsync = require('../utils/catchAsync')
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
  const { categoryId } = req.params;

  const filteredBody = filterObj(req.body, 'name', 'image', 'outOfStock', 'hidden');

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

exports.getCategories = catchAsync(async (req, res, next) => {
  // Also send total no. of products, total sales using aggregation pipeline

  const categories = await Category.find({ store: req.store._id })

  res.status(200).json({
    status: 'success',
    message: 'Categories found successfully!',
    data: categories,
  })
})
