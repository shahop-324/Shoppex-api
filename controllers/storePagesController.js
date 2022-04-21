const catchAsync = require("../utils/catchAsync");
const apiFeatures = require("../utils/apiFeatures");
const StorePages = require("../model/storePages");
const slugify = require("slugify");

// Add Page

exports.addStorePage = catchAsync(async (req, res, next) => {
  const { html, name, type, designJSON, mobileDesign } = req.body;

  console.log(req.body);

  const pageSlug = slugify(name);

  const storePages = await StorePages.find({ store: req.store._id });

  if (storePages.map((el) => el.slug).includes(pageSlug)) {
    // Please change the name  of page (already used)
    res.status(400).json({
      status: "error",
      message: "A page with same name exists. Please modify name.",
    });
  } else {
    // Safe to proceed
    // Create a new page and log in to store

    const newPage = await StorePages.create({
      store: req.store._id,
      name,
      html,
      slug: pageSlug,
      type,
      designJSON: mobileDesign != null ? [] : designJSON,
      mobileDesign: mobileDesign != null ? mobileDesign : [],
      createdAt: Date.now(),
    });

    // Save slug to store doc

    res.status(200).json({
      status: "success",
      message: "Page Created successfully!",
      data: newPage,
    });
  }
});

// Edit Page

exports.editStorePage = catchAsync(async (req, res, next) => {
  const { pageId } = req.params; // Id of page being edited

  const storePage = await StorePages.findById(pageId);

  const prevSlug = storePage.slug;

  const { html, name, designJSON, mobileDesign } = req.body;

  const newSlug = slugify(name);

  const storePages = await StorePages.find({ store: req.store._id });

  if (prevSlug !== newSlug) {
    if (storePages.map((el) => el.slug).includes(newSlug)) {
      // Please change the name  of page (already used)
      res.status(400).json({
        status: "error",
        message: "A page with same name exists. Please modify name.",
      });
    } else {
      //   Update both slug,name and html

      const updatedPage = await StorePages.findByIdAndUpdate(pageId, {
        html,
        name,
        slug: newSlug,
        designJSON: mobileDesign != null ? [] : designJSON,
        mobileDesign: mobileDesign != null ? mobileDesign : [],
        updatedAt: Date.now(),
      });

      res.status(200).json({
        status: "success",
        message: "Page updated successfully!",
        data: updatedPage,
      });
    }
  } else {
    //   Simply update page as only html was altered

    const updatedPage = await StorePages.findByIdAndUpdate(pageId, {
      html,
      name,
      designJSON: mobileDesign != null ? [] : designJSON,
      mobileDesign: mobileDesign != null ? mobileDesign : [],
      updatedAt: Date.now(),
    });

    res.status(200).json({
      status: "success",
      message: "Page updated successfully!",
      data: updatedPage,
    });
  }
});

// Delete Page

exports.deleteStorePage = catchAsync(async (req, res, next) => {
  const { pageId } = req.params; // Id of page being edited

  await StorePages.findByIdAndDelete(pageId);

  res.status(200).json({
    status: "success",
    message: "Page deleted successfully!",
  });
});

// Fetch store pages

exports.fetchStorePages = catchAsync(async (req, res, next) => {
  const query = StorePages.find({ store: req.store._id });

  const features = new apiFeatures(query, req.query).textFilter();
  const pages = await features.query;

  res.status(200).json({
    status: "success",
    data: pages,
    message: "Store Pages found successfully",
  });
});
