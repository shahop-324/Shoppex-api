const SubCategory = require('../model/SubCategoryModel')
const Product = require('../model/productModel')
const catchAsync = require('../utils/catchAsync')
const apiFeatures = require('../utils/apiFeatures')
// Add, Edit, Delete, Get => SubCategory

const filterObj = (obj, ...allowedFields) => {
  const newObj = {}
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el]
  })
  return newObj
}

exports.addSubCategory = catchAsync(async (req, res, next) => {
  const { name, image, category } = req.body

  const newSubCategory = await SubCategory.create({
    store: req.store._id,
    name,
    image,
    category,
  })

  res.status(200).json({
    status: 'success',
    message: 'New Sub Category Added Successfully!',
    data: newSubCategory,
  })
})

exports.updateSubCategory = catchAsync(async (req, res, next) => {
  const { subCategoryId } = req.params

  const filteredBody = filterObj(
    req.body,
    'name',
    'image',
    'category',
    'outOfStock',
    'hidden',
  )

  const updatedSubCategory = await SubCategory.findByIdAndUpdate(
    subCategoryId,
    filteredBody,
    { new: true, validateModifiedOnly: true },
  )

  res.status(200).json({
    status: 'success',
    message: 'Sub Category updated successfully!',
    data: updatedSubCategory,
  })
})

exports.deleteSubCategory = catchAsync(async (req, res, next) => {
  const { subCategoryId } = req.params

  // Remove all products in this sub category
  await Product.deleteMany({ subShopCategory: categoryId })

  // Remove this category
  await SubCategory.findByIdAndDelete(subCategoryId)

  res.status(200).json({
    status: 'success',
    message: 'Sub Category deleted successfully!',
  })
})

exports.deleteMultipleSubCategory = catchAsync(async (req, res, next) => {
  for (let element of req.body.subCategoryIds) {
    // Remove all products in this subCategory
    await Product.deleteMany({ subShopCategory: element })

    // Remove this category
    await SubCategory.findByIdAndDelete(element)
  }
  res.status(200).json({
    status: 'success',
    message: 'Sub Categories deleted successfully!',
  })
})

exports.getSubCategories = catchAsync(async (req, res, next) => {
  // Also send total no. of products, total sales using aggregation pipeline

  console.log(req.params)

  const query = SubCategory.find({ store: req.store._id })

  const features = new apiFeatures(query, req.query).textFilter()
  const subCategories = await features.query

  res.status(200).json({
    status: 'success',
    message: 'Sub Categories found successfully!',
    data: subCategories,
  })
})

exports.reorderSubCategories = catchAsync(async (req, res, next) => {
  // Delete all of prev subCategories and create new ones

  await SubCategory.deleteMany({ store: req.store._id })

  const newSubCategories = await SubCategory.insertMany(req.body.subCategories)

  res.status(200).json({
    message: 'Reordered successfully!',
    data: newSubCategories,
    status: 'success',
  })
})
