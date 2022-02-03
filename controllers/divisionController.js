const Division = require('../model/DivisionModel')
const Product = require('../model/productModel')
const catchAsync = require('../utils/catchAsync')
const apiFeatures = require('../utils/apiFeatures')
const SubCategory = require('../model/SubCategoryModel')
// Add, Edit, Delete, Get => Division

const filterObj = (obj, ...allowedFields) => {
  const newObj = {}
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el]
  })
  return newObj
}

exports.addDivision = catchAsync(async (req, res, next) => {
  const { name, image, subCategory } = req.body

  const newDivision = await Division.create({
    store: req.store._id,
    name,
    image,
    subCategory,
  })

  // Find its subCategory and push its id into it

  const subCategoryDoc = await SubCategory.findById(subCategory.value)

  subCategoryDoc.divisions.push(newDivision._id)

  await subCategoryDoc.save({ new: true, validateModifiedOnly: true })

  res.status(200).json({
    status: 'success',
    message: 'New Division Added Successfully!',
    data: newDivision,
  })
})

exports.updateDivision = catchAsync(async (req, res, next) => {
  const { divisionId } = req.params

  const filteredBody = filterObj(
    req.body,
    'name',
    'image',
    'subCategory',
    'outOfStock',
    'hidden',
  )

  const updatedDivision = await Division.findByIdAndUpdate(
    divisionId,
    filteredBody,
    { new: true, validateModifiedOnly: true },
  )

  res.status(200).json({
    status: 'success',
    message: 'Division updated successfully!',
    data: updatedDivision,
  })
})

exports.deleteDivision = catchAsync(async (req, res, next) => {
  const { divisionId } = req.params

  // Remove all products in this sub subCategory
  // await Product.deleteMany({ division: divisionId })

  // Remove this subCategory
  await Division.findByIdAndDelete(divisionId)

  res.status(200).json({
    status: 'success',
    message: 'Division deleted successfully!',
  })
})

exports.deleteMultipleDivision = catchAsync(async (req, res, next) => {
  for (let element of req.body.divisionIds) {
    // Remove all products in this subCategory
    // await Product.deleteMany({ division: element })

    // Remove this subCategory
    await Division.findByIdAndDelete(element)
  }
  res.status(200).json({
    status: 'success',
    message: 'Divisions deleted successfully!',
  })
})

exports.getDivisions = catchAsync(async (req, res, next) => {
  // Also send total no. of products, total sales using aggregation pipeline
  const query = Division.find({ store: req.store._id })

  const features = new apiFeatures(query, req.query).textFilter()
  const divisions = await features.query

  res.status(200).json({
    status: 'success',
    message: 'Divisions found successfully!',
    data: divisions,
  })
})

exports.reorderDivisions = catchAsync(async (req, res, next) => {
  // Delete all of prev divisions and create new ones

  await Division.deleteMany({ store: req.store._id })

  const newDivisions = await Division.insertMany(req.body.divisions)

  res.status(200).json({
    message: 'Reordered successfully!',
    data: newDivisions,
    status: 'success',
  })
})
