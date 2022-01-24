const Store = require('../model/StoreModel')
const catchAsync = require('../utils/catchAsync')

const slugify = require('slugify')
const { nanoid } = require('nanoid')
const StoreSubName = require('../model/StoreSubNameModel')
const StorePages = require('../model/StorePages')

// Get store details 

exports.getStoreDetails = catchAsync(async(req, res, next) => {
  const storeDoc = await Store.findById(req.store._id);
  res.status(200).json({
    status: "success",
    data: storeDoc,
    message: "Successfully found store details",
  })
});

// Setup Store

exports.setupStore = catchAsync(async (req, res, next) => {

  console.log(req.user, req.store, req.body);

  const {
    name,
    country,
    state,
    city,
    address,
    pincode,
    landmark,
    gstin,
    category,
    phone,
    image,
  } = req.body

  // Check if there is no previously assigned subname then assign new one

  const storeSubNameDoc = await StoreSubName.findOne({ store: req.store._id })

  if (!storeSubNameDoc) {
    const subName = nanoid()

    // Create a new subname Doc for this store

    await StoreSubName.create({
      subName,
      store: req.store._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    await Store.findByIdAndUpdate(
      req.store._id,
      { subName: subName },
      { new: true, validateModifiedOnly: true },
    )
  }

  const updatedStore = await Store.findByIdAndUpdate(
    req.store._id,
    {
      setupCompleted: true,
      name,
      country: country.label,
      state,
      city,
      pincode,
      address,
      landmark,
      gstin,
      category: category.label,
      phone,
      logo: image.path,
    },
    { new: true, validateModifiedOnly: true },
  )

  res.status(200).json({
    status: 'success',
    message: 'Store details updated successfully',
    data: updatedStore,
  });
});

// Update notification settings

exports.updateStoreNotification = catchAsync(async (req, res, next) => {
  const {
    orderPlaced,
    lowInStock,
    abondonedCart,
    newsAndAnnouncement,
    productUpdate,
    blogDigest,
  } = req.body

  const updatedStore = await Store.findByIdAndUpdate(
    req.params.id,
    {
      orderPlaced,
      lowInStock,
      abondonedCart,
      newsAndAnnouncement,
      productUpdate,
      blogDigest,
    },
    { new: true, validateModifiedOnly: true },
  )
  res.status(200).json({
    status: 'success',
    message: 'Notifications updated successfully!',
    data: updatedStore,
  })
})

// Update social links

exports.updateStoreSocialLinks = catchAsync(async (req, res, next) => {
  const { facebook, instagram, twitter } = req.body

  const updatedStore = await Store.findByIdAndUpdate(
    req.params.id,
    {
      facebook,
      instagram,
      twitter,
    },
    { new: true, validateModifiedOnly: true },
  )
  res.status(200).json({
    status: 'success',
    message: 'Social links updated successfully!',
    data: updatedStore,
  })
})

//! Add staff member
exports.addStaffMember = catchAsync(async (req, res, next) => {
  // Add staff member and send a Message to their number informing them
  const { name, phone, permissions } = req.body

  const storeDoc = await Store.findById(req.params.id)

  storeDoc.team.push({
    name: name,
    phone: phone,
    permissions: permissions,
    addedAt: Date.now(),
  })

  const updatedStore = await storeDoc.save({
    new: true,
    validateModifiedOnly: true,
  })

  // TODO Send a message to newly added member telling that he/she is added to this team

  res.status(200).json({
    status: 'success',
    message: 'Staff Member added successfully!',
    data: updatedStore,
  })
})

//! Edit staff member
exports.editStaffMember = catchAsync(async (req, res, next) => {
  const { memberId, id } = req.params

  const { name, phone, permissions } = req.body

  const storeDoc = await Store.findById(id)

  storeDoc.team = storeDoc.team.map((el) => {
    if (el._id !== memberId) {
      return el
    } else {
      el.name = name
      el.phone = phone
      el.permissions = permissions

      el.updatedAt = Date.now()

      return el
    }
  })

  const updatedStore = await storeDoc.save({
    new: true,
    validateModifiedOnly: true,
  })

  res.status(200).json({
    status: 'success',
    message: 'Staff Member updated successfully!',
    data: updatedStore,
  })
})

//! Delete staff Member
exports.removeStaffMember = catchAsync(async (req, res, next) => {
  const { memberId, id } = req.params
  const storeDoc = await Store.findById(id)

  storeDoc.team = storeDoc.team.filter((el) => el._id !== memberId)

  const updatedStore = await storeDoc.save({
    new: true,
    validateModifiedOnly: true,
  })

  res.status(200).json({
    status: 'success',
    message: 'Successfully Deleted Staff Member!',
    data: updatedStore,
  })
})

//! Add Checkout Field
exports.addCheckoutField = catchAsync(async (req, res, next) => {
  const { name, type, required, options } = req.body

  const storeDoc = await Store.findById(req.params.id)

  storeDoc.formFields.push({ name, type, required, options })

  const updatedStore = await storeDoc.save({
    new: true,
    validateModifiedOnly: true,
  })

  res.status(200).json({
    status: 'success',
    message: 'Checkout Field added successfully!',
    data: updatedStore,
  })
})

//! Edit Checkout Field
exports.editCheckoutField = catchAsync(async (req, res, next) => {
  const { fieldId, id } = req.params

  const { name, type, required, options } = req.body

  const storeDoc = await Store.findById(id)

  storeDoc.formFields = storeDoc.formFields.map((el) => {
    if (el._id !== fieldId) {
      return el
    }
    el.name = name
    el.type = type
    el.required = required
    el.options = options

    return el
  })

  const updatedStore = await storeDoc.save({
    new: true,
    validateModifiedOnly: true,
  })

  res.status(200).json({
    status: 'success',
    message: 'Checkout Field updated successfully!',
    data: updatedStore,
  })
})

//! Delete Checkout Field
exports.deleteCheckoutField = catchAsync(async (req, res, next) => {
  const { fieldId, id } = req.params

  const storeDoc = await Store.findById(id)

  storeDoc.formFields = storeDoc.formFields.filter((el) => el._id !== fieldId)

  const updatedStore = await storeDoc.save({
    new: true,
    validateModifiedOnly: true,
  })

  res.status(200).json({
    status: 'success',
    message: 'Checkout Field deleted successfully!',
    data: updatedStore,
  })
})

//! Toggle Guest Checkout form
exports.toggleGuestCheckout = catchAsync(async (req, res, next) => {
  const { guestCheckout, id } = req.body

  const updatedStore = await Store.findByIdAndUpdate(
    id,
    { guestCheckout },
    { new: true, validateModifiedOnly: true },
  )

  res.status(200).json({
    status: 'success',
    message: guestCheckout
      ? 'Guest Checkout Disabled successfully'
      : 'Guest Checkout Enabled successfully!',
    data: updatedStore,
  })
})

// Update Policies

exports.updateTerms = catchAsync(async (req, res, next) => {
  const { terms } = req.body

  const updatedStore = await Store.findByIdAndUpdate(
    req.params.id,
    {
      terms,
    },
    { new: true, validateModifiedOnly: true },
  )
  res.status(200).json({
    status: 'success',
    message: 'Terms of service updated successfully!',
    data: updatedStore,
  })
})

exports.updatePrivacyPolicy = catchAsync(async (req, res, next) => {
  const { privacyPolicy } = req.body

  const updatedStore = await Store.findByIdAndUpdate(
    req.params.id,
    {
      privacyPolicy,
    },
    { new: true, validateModifiedOnly: true },
  )
  res.status(200).json({
    status: 'success',
    message: 'Privacy policy updated successfully!',
    data: updatedStore,
  })
})

exports.updateRefundPolicy = catchAsync(async (req, res, next) => {
  const { refundPolicy } = req.body

  const updatedStore = await Store.findByIdAndUpdate(
    req.params.id,
    {
      refundPolicy,
    },
    { new: true, validateModifiedOnly: true },
  )
  res.status(200).json({
    status: 'success',
    message: 'Refund policy updated successfully!',
    data: updatedStore,
  })
})

//! TODO Update domain

exports.updateDomain = catchAsync(async (req, res, next) => {
  const { domainName } = req.body

  const updatedStore = await Store.findByIdAndUpdate(
    req.params.id,
    { domainName },
    { new: true, validateModifiedOnly: true },
  )

  res.status(200).json({
    status: 'success',
    message: 'Domain Name Added Successfully!',
    data: updatedStore,
  })
})

// ! Update Plan

exports.updatePlan = catchAsync(async (req, res, next) => {
  const { planName } = req.body

  const updatedStore = await Store.findByIdAndUpdate(
    req.params.id,
    { planName },
    { new: true, validateModifiedOnly: true },
  )

  res.status(200).json({
    status: 'success',
    message: 'Plan updated successfully!',
    data: updatedStore,
  })
})

// Add Page

exports.addStorePage = catchAsync(async (req, res, next) => {
  const { html, name } = req.body

  const pageSlug = slugify(name)

  const storeDoc = await Store.findById(req.params.id)

  if (storeDoc.pageSlugs.includes(pageSlug)) {
    // Please change the name  of page (already used)
    res.status(400).json({
      status: 'error',
      message: 'A page with same name exists. Please modify name.',
    })
  } else {
    // Safe to proceed
    // Create a new page and log in to store

    await StorePages.create({
      store: req.params.id,
      name,
      html,
      slug: pageSlug,
      createdAt: Date.now(),
    })

    // Save slug to store doc

    storeDoc.pageSlugs.push(pageSlug)
    await storeDoc.save({ new: true, validateModifiedOnly: true })

    res.status(200).json({
      status: 'success',
      message: 'Page Created successfully!',
    })
  }
})

// Edit Page

exports.editStorePage = catchAsync(async (req, res, next) => {
  const { pageId, id, slug } = req.params // Id of page being edited, id of store

  const { html, name } = req.body

  const newSlug = slugify(name)

  const storeDoc = await Store.findById(id)

  if (slug !== newSlug) {
    if (storeDoc.pageSlugs.includes(newSlug)) {
      // Please change the name  of page (already used)
      res.status(400).json({
        status: 'error',
        message: 'A page with same name exists. Please modify name.',
      })
    } else {
      //   Update both slug,name and html

      const updatedPage = await StorePages.findByIdAndUpdate(pageId, {
        html,
        name,
        newSlug,
        updatedAt: Date.now(),
      })

      // Update slug in  store

      let filtered = storeDoc.pageSlugs.filter((el) => el !== slug)

      filtered.push(newSlug)

      storeDoc.pageSlugs = filtered

      await storeDoc.save({ new: true, validateModifiedOnly: true })

      res.status(200).json({
        status: 'success',
        message: 'Page updated successfully!',
        data: updatedPage,
      })
    }
  } else {
    //   Simply update page as only html was altered

    const updatedPage = await StorePages.findByIdAndUpdate(pageId, {
      html,
      name,
      updatedAt: Date.now(),
    })

    res.status(200).json({
      status: 'success',
      message: 'Page updated successfully!',
      data: updatedPage,
    })
  }
})

// Delete Page

exports.deleteStorePage = catchAsync(async (req, res, next) => {
  const { pageId, id, slug } = req.params // Id of page being edited, id of store

  await StorePages.findByIdAndDelete(pageId)

  const storeDoc = await Store.findById(id)

  storeDoc.pageSlugs = storeDoc.pageSlugs.filter((el) => el !== slug)

  await storeDoc.save({ new: true, validateModifiedOnly: true })

  res.status(200).json({
    status: 'success',
    message: 'Page deleted successfully!',
  })
})

// Update Ambience

exports.updateStoreAmbience = catchAsync(async (req, res, next) => {
  const { mode, primaryColor } = req.body

  const updatedStore = await Store.findByIdAndUpdate(
    req.params.id,
    {
      mode,
      primaryColor,
    },
    { new: true, validateModifiedOnly: true },
  )
  res.status(200).json({
    status: 'success',
    message: 'Store Ambience updated successfully!',
    data: updatedStore,
  })
})

// Update Other info
exports.updateStoreOtheInfo = catchAsync(async (req, res, next) => {
  const {
    freeDeliveryAbove,
    orderIsShippedIn,
    returnAccepted,
    replacementAccepted,
    deliveryHappensWithin,
    deliveryState,
    deliveryCity,
    minDeliveryDistance,
    maxDeliveryDistance,
    showShopInsideDeliveryZoneOnly,
  } = req.body

  const updatedStore = await Store.findByIdAndUpdate(
    req.params.id,
    {
      freeDeliveryAbove,
      orderIsShippedIn,
      returnAccepted,
      replacementAccepted,
      deliveryHappensWithin,
      deliveryState,
      deliveryCity,
      minDeliveryDistance,
      maxDeliveryDistance,
      showShopInsideDeliveryZoneOnly,
    },
    { new: true, validateModifiedOnly: true },
  )
  res.status(200).json({
    status: 'success',
    message: 'Store Info updated successfully!',
    data: updatedStore,
  })
})

// Update Theme

exports.updateStoreTheme = catchAsync(async (req, res, next) => {
  const { theme } = req.body

  const updatedStore = await Store.findByIdAndUpdate(
    req.params.id,
    {
      theme,
    },
    { new: true, validateModifiedOnly: true },
  )
  res.status(200).json({
    status: 'success',
    message: 'Store theme updated successfully!',
    data: updatedStore,
  })
})
