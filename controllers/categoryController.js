const Category = require("../model/categoryModel");
const Product = require("../model/productModel");
const catchAsync = require("../utils/catchAsync");
const apiFeatures = require("../utils/apiFeatures");
const SubCategory = require("../model/subCategoryModel");
const { default: mongoose } = require("mongoose");
// Add, Edit, Delete, Get => Category

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.addCategory = catchAsync(async (req, res, next) => {
  const { name, image } = req.body;

  const newCategory = await Category.create({
    store: req.store._id,
    name,
    image,
  });

  res.status(200).json({
    status: "success",
    message: "New category added successfully!",
    data: newCategory,
  });
});

exports.updateCategoryStock = catchAsync(async (req, res, next) => {
  const { categoryId } = req.params;

  console.log(req.body);

  const filteredBody = filterObj(req.body, "outOfStock", "hidden");

  const updatedCategory = await Category.findByIdAndUpdate(
    categoryId,
    filteredBody,
    { new: true, validateModifiedOnly: true }
  );

  // Find all subcategory under sub category and do the same for all of them

  const storeSubCategories = await SubCategory.find({ store: req.store._id });

  const eligibleSubCategories = storeSubCategories.filter((el) => {
    return el.category.get("value") === categoryId;
  });

  console.log(eligibleSubCategories);

  eligibleSubCategories.forEach(async (e) => {
    await SubCategory.findByIdAndUpdate(e._id, filteredBody, {
      new: true,
      validateModifiedOnly: true,
    });

  });

  res.status(200).json({
    status: "success",
    message: "Category stock updated successfully!",
    data: updatedCategory,
  });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  const { categoryId } = req.params;

  console.log(req.body);

  const filteredBody = filterObj(
    req.body,
    "name",
    "image",
    "outOfStock",
    "hidden"
  );

  const updatedCategory = await Category.findByIdAndUpdate(
    categoryId,
    filteredBody,
    { new: true, validateModifiedOnly: true }
  );

  res.status(200).json({
    status: "success",
    message: "Category updated successfully!",
    data: updatedCategory,
  });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
  const { categoryId } = req.params;

  const storeProducts = await Product.find({ store: req.store._id });

  const eligibleProducts = storeProducts.filter(
    (el) => el.shopCategory ? el.shopCategory.get("value") === categoryId : false
  );

  eligibleProducts.forEach(async (element) => {
    await Product.findByIdAndDelete(element._id);
  });

  const storeSubCategories = await SubCategory.find({ store: req.store._id });
 
  const eligibleSubCategories = storeSubCategories.filter(
    (el) => el.category ? el.category.get("value") === categoryId : false
  );


  // Remove this category
  await Category.findByIdAndDelete(categoryId);

  res.status(200).json({
    status: "success",
    message: "Category deleted successfully!",
  });
});

exports.deleteMultipleCategory = catchAsync(async (req, res, next) => {
  const storeProducts = await Product.find({ store: req.store._id });

  for (let element of req.body.categoryIds) {
    // Remove all products in this Category

    const eligibleProducts = storeProducts.filter(
      (el) => el.shopCategory ? el.shopCategory.get("value") === element : false
    );

    eligibleProducts.forEach(async (element) => {
      await Product.findByIdAndDelete(element._id);
    });
  }

  const storeSubCategories = await SubCategory.find({ store: req.store._id });
  

  // Find all Sub categories & divisions and delete them as well

  req.body.categoryIds.forEach((e) => {
    const eligibleSubCategories = storeSubCategories.filter(
      (el) => el.category ? el.category.get("value") === e : false
    );
  });

  // Remove this category

  for (let element of req.body.categoryIds) {
    await Category.findByIdAndDelete(element);
  }

  res.status(200).json({
    status: "success",
    message: "Categories deleted successfully!",
  });
});

exports.getCategories = catchAsync(async (req, res, next) => {
  // Also send total no. of products, total sales using aggregation pipeline

  console.log(req.params);

  const query = Category.find({ store: req.store._id });

  const features = new apiFeatures(query, req.query).textFilter();
  const categories = await features.query;

  res.status(200).json({
    status: "success",
    message: "Categories found successfully!",
    data: categories,
  });
});

exports.reorderCategories = catchAsync(async (req, res, next) => {
  // Delete all of prev categories and create new ones

  if (req.body.isIdList) {
    console.log(req.body.categories[0].toString());
    // console.log(mongoose.Types.ObjectId(req.body.categories[0].slice(1, -1).toString()));
    // const searchCategory = await Category.findById( mongoose.Types.ObjectId(req.body.categories[0].toString()));
    const newList = req.body.categories.map(async (e) => {
      const id = e.toString();
      const searchCategory = await Category.findById(id);
      return searchCategory;
    });

    req.body.categories.forEach(async (e) => {
      const id = e.toString();
      await Category.findByIdAndDelete(id);
    });

    req.body.categories = newList;
  } else {
    await Category.deleteMany({ store: req.store._id });
  }

  setTimeout(async () => {
    console.log(req.body.categories);

    const newCategories = await Category.insertMany(req.body.categories);

    console.log(req.body.categories);

    res.status(200).json({
      message: "Reordered successfully!",
      data: newCategories,
      status: "success",
    });
  }, 2000);
});

exports.bulkImportCategories = catchAsync(async (req, res, next) => {
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
    let newCategories = [];
    for (let element of mRows) {
      const newCat = await Customer.create({
        store: storeId,
        ...element,
      });
      newCategories.push(newCat);
    }

    res.status(200).json({
      status: "success",
      data: newCategories,
      message: "Categories imported successfully!",
    });
  }
});

exports.bulkUpdateCategories = catchAsync(async (req, res, next) => {
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
      await Category.findByIdAndUpdate(
        element._id,
        {
          ...element,
        },
        { new: true, validateModifiedOnly: true }
      );
    }
    // Find all categories of this store and send as response
    const categories = await Category.find({ store: storeId });
    res.status(200).json({
      status: "success",
      data: categories,
      message: "Categories updated successfully!",
    });
  }
});
