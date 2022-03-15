const SubCategory = require('../model/subCategoryModel')
const Product = require('../model/productModel')
const catchAsync = require('../utils/catchAsync')
const apiFeatures = require('../utils/apiFeatures')
const Category = require('../model/categoryModel')
const Division = require('../model/divisionModel')
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

  // Find its category and push its id into it

  const categoryDoc = await Category.findById(category.value)

  categoryDoc.subCategories.push(newSubCategory._id)

  await categoryDoc.save({ new: true, validateModifiedOnly: true })

  res.status(200).json({
    status: 'success',
    message: 'New Sub Category Added Successfully!',
    data: newSubCategory,
  })
})

exports.updateSubCategoryStock = catchAsync(async (req, res, next) => {
  const { subCategoryId } = req.params

  const filteredBody = filterObj(req.body, 'outOfStock', 'hidden')

  const updatedSubCategory = await SubCategory.findByIdAndUpdate(
    subCategoryId,
    filteredBody,
    { new: true, validateModifiedOnly: true },
  )

  // Find all divisions and do the same for all of them

  const storeDivisions = await Division.find({ store: req.store._id })

  const eligibleDivisions = storeDivisions.filter((el) => {
    return el.subCategory.get('value') === subCategoryId
  })

  console.log(eligibleDivisions)

  eligibleDivisions.forEach(async (e) => {
    await Division.findByIdAndUpdate(e._id, filteredBody, {
      new: true,
      validateModifiedOnly: true,
    })
  })

  res.status(200).json({
    status: 'success',
    message: 'Sub Category stock updated successfully!',
    data: updatedSubCategory,
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

  const storeProducts = await Product.find({store: req.store._id});

  const eligibleProducts = storeProducts.filter((el) => el.shopSubCategory.get('value') === subCategoryId);

  eligibleProducts.forEach(async(element) => {
    await Product.findByIdAndDelete(element._id)
  });

  const storeDivisions = await Division.find({ store: req.store._id })

  const eligibleDivisions = storeDivisions.filter(
    (el) => el.subCategory.get('value') === subCategoryId,
  )

  eligibleDivisions.forEach(async (el) => {
    await Division.findByIdAndDelete(el._id)
  })

  // Remove this category
  await SubCategory.findByIdAndDelete(subCategoryId)

  res.status(200).json({
    status: 'success',
    message: 'Sub Category deleted successfully!',
  })
})

exports.deleteMultipleSubCategory = catchAsync(async (req, res, next) => {

  const storeProducts = await Product.find({store: req.store._id});

  for (let element of req.body.subCategoryIds) {
    // Remove all products in this SubCategory

    const eligibleProducts = storeProducts.filter((el) => el.shopSubCategory.get('value') === element);

    eligibleProducts.forEach(async(element) => {
      await Product.findByIdAndDelete(element._id)
    });

  }

  const storeDivisions = await Division.find({ store: req.store._id })

  // Find all Sub categories & divisions and delete them as well

  req.body.subCategoryIds.forEach((e) => {
    const eligibleDivisions = storeDivisions.filter(
      (el) => el.subCategory.get('value') === e,
    )

    eligibleDivisions.forEach(async (el) => {
      await Division.findByIdAndDelete(el._id)
    })
  })

  // Remove this subCategory

  for (let element of req.body.subCategoryIds) {
    await SubCategory.findByIdAndDelete(element)
  }

  res.status(200).json({
    status: 'success',
    message: 'Sub Categories deleted successfully!',
  })
})

exports.getSubCategories = catchAsync(async (req, res, next) => {
  // Also send total no. of products, total sales using aggregation pipeline
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

exports.bulkImportSubCategories = catchAsync(async(req, res, next) => {
  const storeId = req.store._id;
  if (!storeId) {
    // Store not found => through exception
    res.status(400).json({
      status: "error",
      message: "Bad request, session expired. Please login again and try!",
    });
  } else {
// Store found => proceed
mRows = req.body.rows.map((e) => {
  delete e.id;
  return e;
});
let newSubCategories = [];
for (let element of mRows) {
  const newSubCat = await Customer.create({
    store: storeId,
    ...element,
  });
  newSubCategories.push(newSubCat);
}

res.status(200).json({
  status: "success",
  data: newSubCategories,
  message: "Sub Categories imported successfully!",
});
  }
});

exports.bulkUpdateSubCategories = catchAsync(async(req, res, next) => {
  const storeId = req.store._id;
  if (!storeId) {
    // Store not found => through exception
    res.status(400).json({
      status: "error",
      message: "Bad request, session expired. Please login again and try!",
    });
  } else {
    // Store found => proceed
    for (let element of req.body.rows) {
      // element is the product with its _id
      await SubCategory.findByIdAndUpdate(
        element._id,
        {
          ...element,
        },
        { new: true, validateModifiedOnly: true }
      );
    }
    // Find all subCategories of this store and send as response
    const subCategories = await SubCategory.find({ store: storeId });
    res.status(200).json({
      status: "success",
      data: subCategories,
      message: "Sub Categories updated successfully!",
    });
  }
});