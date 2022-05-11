const Product = require("../model/productModel");
const Catalouge = require("../model/catalougeModel");
// Add, Edit, Delete, Get => Product
const catchAsync = require("../utils/catchAsync");
const apiFeatures = require("../utils/apiFeatures");
const Store = require("../model/storeModel");
const Category = require("../model/categoryModel");
const SubCategory = require("../model/subCategoryModel");

exports.addProduct = catchAsync(async (req, res, next) => {
  console.log(req.body);

  // Category, SubCategory => Find and update them

  const shopCategory = req.body.category;
  const shopSubCategory = req.body.subCategory;

  // * DONE => Calculate if it qualifies for delivery or not
  // * DONE => Calculate lowest and highest price

  if (!req.body.discountedPrice) {
    req.body.discountedPrice = req.body.price;
  }

  let prices = [req.body.price];

  if (
    req.body.customVariants !== undefined &&
    req.body.customVariants.length > 0
  ) {
    req.body.customVariants.forEach((element) => {
      element.options.forEach((item) => {
        prices.push(item.price * 1);
      });
    });
  }

  // Now prices array contains all prices => just find min and max and you will have lowest and highest prices

  lowest = prices.reduce(function (p, v) {
    return p < v ? p : v;
  });

  highest = prices.reduce(function (p, v) {
    return p > v ? p : v;
  });

  let qualifyForFreeDelivery = false;

  const storeDoc = await Store.findById(req.store._id);
  const freeDeliveryThreshold = storeDoc.freeDeliveryAbove;

  if (highest * 1 >= freeDeliveryThreshold * 1) {
    qualifyForFreeDelivery = true;
  }

  const newProduct = await Product.create({
    ...req.body,
    discountedPrice: req.body.discountedPrice || req.body.price,
    lowestPrice: lowest,
    highestPrice: highest,
    store: req.store._id,
    freeDelivery: qualifyForFreeDelivery,
  });

  if (shopCategory) {
    newProduct.shopCategory = shopCategory;
    newProduct.id = newProduct._id;
    // Add this product id to this category

    const categoryDoc = await Category.findById(shopCategory.value);

    categoryDoc.products.push(newProduct._id);

    await categoryDoc.save({ new: true, validateModifiedOnly: true });
  }

  if (shopSubCategory) {
    newProduct.shopSubCategory = shopSubCategory;
    // Add this product id to this subCategory

    const subCategoryDoc = await SubCategory.findById(shopSubCategory.value);

    subCategoryDoc.products.push(newProduct._id);

    await subCategoryDoc.save({ new: true, validateModifiedOnly: true });
  }

  newProduct.updatedAt = Date.now();
  await newProduct.save({ new: true, validateModifiedOnly: true });

  // Add this product to its category

  await Catalouge.create({
    ...req.body,
    store: req.store._id,
  });

  // Update corresponding category

  res.status(200).json({
    status: "success",
    message: "Product Added successfully!",
    data: newProduct,
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  try {
    // * DONE => Calculate lowest and highest price
    // * DONE => Calculate if it qualifies for delivery or not

    // Category, SubCategory => Find and update them

    const shopCategory = req.body.category;
    const shopSubCategory = req.body.subCategory;

    if (!req.body.discountedPrice) {
      req.body.discountedPrice = req.body.price;
    }

    let prices = [req.body.price];

    if (
      req.body.customVariants !== undefined &&
      req.body.customVariants.length > 0
    ) {
      req.body.customVariants.forEach((element) => {
        element.options.forEach((item) => {
          prices.push(item.price * 1);
        });
      });
    }

    // Now prices array contains all prices => just find min and max and you will have lowest and highest prices

    lowest = prices.reduce(function (p, v) {
      return p < v ? p : v;
    });

    highest = prices.reduce(function (p, v) {
      return p > v ? p : v;
    });

    console.log(req.body);
    const productDoc = await Product.findById(req.params.productId);

    if (productDoc.shopCategory) {
      // Remove this product from prev shopCategory and add to new

      console.log(productDoc.shopCategory);

      const categoryDoc = await Category.findById(
        productDoc.shopCategory.get("value")
      );

      if (categoryDoc) {
        categoryDoc.products = categoryDoc.products.filter(
          (el) => el._id.toString() !== productDoc._id.toString()
        );

        await categoryDoc.save({ new: true, validateModifiedOnly: true });
      }
    }

    if (productDoc.shopSubCategory) {
      // Remove this product from prev shopSubCategory and add to new

      const subCategoryDoc = await SubCategory.findById(
        productDoc.shopSubCategory.get("value")
      );

      if (subCategoryDoc) {
        subCategoryDoc.products = subCategoryDoc.products.filter(
          (el) => el._id.toString() !== productDoc._id.toString()
        );

        await subCategoryDoc.save({ new: true, validateModifiedOnly: true });
      }
    }

    if (shopCategory && shopCategory.value != null) {
      productDoc.shopCategory = shopCategory;

      const newCategoryDoc = await Category.findById(
        shopCategory.value || shopCategory.get("value")
      );

      if (newCategoryDoc) {
        newCategoryDoc.products.push(productDoc._id);

        await newCategoryDoc.save({ new: true, validateModifiedOnly: true });
      }
    }

    console.log(shopSubCategory);
    if (shopSubCategory && shopSubCategory.value != null) {
      productDoc.shopSubCategory = shopSubCategory;

      const newSubCategoryDoc = await SubCategory.findById(
        shopSubCategory.value || shopSubCategory.get("value")
      );

      if (newSubCategoryDoc) {
        newSubCategoryDoc.products.push(productDoc._id);

        await newSubCategoryDoc.save({ new: true, validateModifiedOnly: true });
      }
    }

    if (
      req.body.excludedImages !== undefined &&
      req.body.excludedImages.length > 0
    ) {
      // exclude images that needs to be excluded

      productDoc.images = productDoc.images.filter(
        (el) => !req.body.excludedImages.includes(el)
      );
    }

    if (
      req.body.excludedVideos !== undefined &&
      req.body.excludedVideos.length > 0
    ) {
      // exclude videos that needs to be excluded
      productDoc.videos = productDoc.videos.filter(
        (el) => !req.body.excludedVideos.includes(el)
      );
    }

    // add videos that are added freshly

    if (req.body.videoKeys !== undefined && req.body.videoKeys.length > 0) {
      for (let element of req.body.videoKeys) {
        productDoc.videos.push(element);
      }
    }

    if (req.body.imageKeys !== undefined && req.body.imageKeys.length > 0) {
      // add images that are added freshly
      for (let element of req.body.imageKeys) {
        productDoc.images.push(element);
      }
    }

    productDoc.updatedAt = Date.now();

    const storeDoc = await Store.findById(productDoc.store);
    const freeDeliveryThreshold = storeDoc.freeDeliveryAbove;

    if (highest * 1 >= freeDeliveryThreshold * 1) {
      productDoc.freeDelivery = true;
    }

    // then update rest of the things

    await productDoc.save({ new: true, validateModifiedOnly: true });

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.productId,
      {
        ...req.body,
        discountedPrice: req.body.discountedPrice || req.body.price,
        lowestPrice: lowest,
        highestPrice: highest,
        quantityInStock: req.body.outOfStock
          ? 0
          : productDoc.quantityInStock > 5
          ? productDoc.quantityInStock
          : 100,
      },
      { new: true, validateModifiedOnly: true }
    );

    res.status(200).json({
      status: "success",
      message: "Product updated successfully!",
      data: updatedProduct,
    });
  } catch (error) {
    console.log(error);
  }
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  try {
    console.log(req.params.productId);

    const { productId } = req.params;

    const productDoc = await Product.findById(productId);

    if (productDoc.shopCategory) {
      console.log(productDoc.shopCategory);
      // Remove this product from prev shopCategory and add to new

      const categoryDoc = await Category.findById(
        productDoc.shopCategory.value !== undefined
          ? productDoc.shopCategory.value
          : productDoc.shopCategory["value"]
      );

      console.log(categoryDoc);

      if (categoryDoc) {
        categoryDoc.products = categoryDoc.products.filter(
          (el) => el._id.toString() !== productDoc._id.toString()
        );

        await categoryDoc.save({ new: true, validateModifiedOnly: true });
      }
    }

    if (productDoc.shopSubCategory) {
      // Remove this product from prev shopSubCategory and add to new

      const subCategoryDoc = await SubCategory.findById(
        productDoc.shopSubCategory.value !== undefined
          ? productDoc.shopSubCategory.value
          : productDoc.shopSubCategory["value"]
      );

      console.log(subCategoryDoc);

      if (subCategoryDoc) {
        subCategoryDoc.products = subCategoryDoc.products.filter(
          (el) => el._id.toString() !== productDoc._id.toString()
        );

        await subCategoryDoc.save({ new: true, validateModifiedOnly: true });
      }
    }

    // Remove all products in this category
    await Product.findByIdAndDelete(productId);

    // Remove this product from its category
    res.status(200).json({
      status: "success",
      message: "Product deleted successfully!",
    });
  } catch (error) {
    console.log(error);
  }
});

exports.deleteMultipleProduct = catchAsync(async (req, res, next) => {
  for (let element of req.body.productIds) {
    const productDoc = await Product.findById(element);

    if (productDoc.shopCategory) {
      // Remove this product from prev shopCategory and add to new

      const categoryDoc = await Category.findById(
        productDoc.shopCategory.value
      );

      categoryDoc.products = categoryDoc.products.filter(
        (el) => el._id.toString() !== productDoc._id.toString()
      );

      await categoryDoc.save({ new: true, validateModifiedOnly: true });
    }

    if (productDoc.shopSubCategory) {
      // Remove this product from prev shopSubCategory and add to new

      const subCategoryDoc = await SubCategory.findById(
        productDoc.shopSubCategory.value
      );

      subCategoryDoc.products = subCategoryDoc.products.filter(
        (el) => el._id.toString() !== productDoc._id.toString()
      );

      await subCategoryDoc.save({ new: true, validateModifiedOnly: true });
    }

    // Remove all products in this category
    await Product.findByIdAndDelete(element);
    // Remove this product from its category
  }
  res.status(200).json({
    status: "success",
    message: "Products deleted successfully!",
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  const productDoc = await Product.findById(productId);

  res.status(200).json({
    status: "success",
    message: "Product Found successfully!",
    data: productDoc,
  });
});

exports.getProducts = catchAsync(async (req, res, next) => {
  try {
    // Get all products of a store

    const query = Product.find({ store: req.store._id });

    const features = new apiFeatures(query, req.query).textFilter();
    const products = await features.query;

    res.status(200).json({
      status: "success",
      message: "Products found successfully!",
      data: products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      staus: "error",
      message: error,
    });
  }
});

exports.getLowInStockProducts = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const lowInStockProducts = await Product.find({
    $and: [{ store: id }, { quantityInStock: { $lte: 5 } }],
  });

  res.status(200).json({
    status: "success",
    data: lowInStockProducts,
    message: "Low in stcok products found successfully!",
  });
});

exports.getProductsByCategory = catchAsync(async (req, res, next) => {
  const { id, categoryId } = req.params;

  const products = await Product.find({
    $and: [{ store: id }, { shopCategory: categoryId }],
  });

  res.status(200).json({
    status: "success",
    data: products,
    message: "Products found successfully!",
  });
});

exports.bulkUploadProducts = catchAsync(async (req, res, next) => {
  const { products } = req.body;

  await Product.insertMany(products)
    .then((docs) => {
      res.status(200).json({
        status: "success",
        message: "Successfully uploaded products!",
        data: docs,
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: "error",
        message: "Failed to upload products.",
      });
    });
});

exports.bulkImportProducts = catchAsync(async (req, res, next) => {
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
    let newProducts = [];
    for (let element of mRows) {
      const newProd = await Product.create({
        store: storeId,
        ...element,
        discountedPrice: element.discountedPrice || element.price,
      });
      newProducts.push(newProd);
    }

    res.status(200).json({
      status: "success",
      data: newProducts,
      message: "Products imported successfully!",
    });
  }
});

exports.bulkUpdateProducts = catchAsync(async (req, res, next) => {
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
      await Product.findByIdAndUpdate(
        element._id,
        {
          ...element,
          discountedPrice: element.discountedPrice || element.price,
        },
        { new: true, validateModifiedOnly: true }
      );
    }
    // Find all products of this store and send as response
    const products = await Product.find({ store: storeId });
    res.status(200).json({
      status: "success",
      data: products,
      message: "Products updated successfully!",
    });
  }
});

exports.reorderProducts = catchAsync(async (req, res, next) => {
  // Delete all products and arrange them

  await Product.deleteMany({ store: req.store._id });

  const newProducts = await Product.insertMany(req.body.products);

  res.status(200).json({
    message: "Reordered successfully!",
    data: newProducts,
    status: "success",
  });
});
