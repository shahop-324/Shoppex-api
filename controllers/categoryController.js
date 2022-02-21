const Category = require('../model/categoryModel')
const Product = require('../model/productModel')
const catchAsync = require('../utils/catchAsync')
const apiFeatures = require('../utils/apiFeatures')
const SubCategory = require('../model/subCategoryModel')
const Division = require('../model/divisionModel')
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

exports.updateCategoryStock = catchAsync(async (req, res, next) => {
  const { categoryId } = req.params

  const filteredBody = filterObj(req.body, 'outOfStock', 'hidden')

  const updatedCategory = await Category.findByIdAndUpdate(
    categoryId,
    filteredBody,
    { new: true, validateModifiedOnly: true },
  )

  // Find all subcategory and then also divisions under sub category and do the same for all of them

  const storeSubCategories = await SubCategory.find({ store: req.store._id })

  const storeDivisions = await Division.find({ store: req.store._id })

  const eligibleSubCategories = storeSubCategories.filter((el) => {
    return el.category.get('value') === categoryId
  })

  console.log(eligibleSubCategories)

  eligibleSubCategories.forEach(async (e) => {
    await SubCategory.findByIdAndUpdate(e._id, filteredBody, {
      new: true,
      validateModifiedOnly: true,
    })

    // Find all Divisions that belongs to this sub category

    const eligibleDivisions = storeDivisions.filter((el) => {
      el.subCategory.get('value') === e._id
    })

    eligibleDivisions.forEach(async (elm) => {
      await Division.findByIdAndUpdate(elm._id, filteredBody, {
        new: true,
        validateModifiedOnly: true,
      })
    })
  })

  res.status(200).json({
    status: 'success',
    message: 'Category stock updated successfully!',
    data: updatedCategory,
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

  const storeProducts = await Product.find({store: req.store._id});

  const eligibleProducts = storeProducts.filter((el) => el.shopCategory.get('value') === categoryId);

  eligibleProducts.forEach(async(element) => {
    await Product.findByIdAndDelete(element._id)
  });

  const storeSubCategories = await SubCategory.find({ store: req.store._id })
  const storeDivisions = await Division.find({ store: req.store._id })

  const eligibleSubCategories = storeSubCategories.filter(
    (el) => el.category.get('value') === categoryId,
  )

  eligibleSubCategories.forEach(async (el) => {
    await SubCategory.findByIdAndDelete(el._id)

    // Find all Divisions and delete them as well

    const eligibleDivisions = storeDivisions.filter(
      (elm) => elm.subCategory.get('value') === el._id,
    )

    eligibleDivisions.forEach(async (a) => {
      await Division.findByIdAndDelete(a._id)
    })
  })

  // Remove this category
  await Category.findByIdAndDelete(categoryId)

  res.status(200).json({
    status: 'success',
    message: 'Category deleted successfully!',
  })
})

exports.deleteMultipleCategory = catchAsync(async (req, res, next) => {
  const storeProducts = await Product.find({store: req.store._id});

  for (let element of req.body.categoryIds) {
    // Remove all products in this Category

    const eligibleProducts = storeProducts.filter((el) => el.shopCategory.get('value') === element);

    eligibleProducts.forEach(async(element) => {
      await Product.findByIdAndDelete(element._id)
    });

  }

  const storeSubCategories = await SubCategory.find({ store: req.store._id })
  const storeDivisions = await Division.find({ store: req.store._id })

  // Find all Sub categories & divisions and delete them as well

  req.body.categoryIds.forEach((e) => {
    const eligibleSubCategories = storeSubCategories.filter(
      (el) => el.category.get('value') === e,
    )

    eligibleSubCategories.forEach(async (el) => {
      await SubCategory.findByIdAndDelete(el._id)

      // Find all Divisions and delete them as well

      const eligibleDivisions = storeDivisions.filter(
        (elm) => elm.subCategory.get('value') === el._id,
      )

      eligibleDivisions.forEach(async (a) => {
        await Division.findByIdAndDelete(a._id)
      })
    })
  })

  // Remove this category

  for (let element of req.body.categoryIds) {
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
