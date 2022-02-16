const Store = require('../model/StoreModel')
const catchAsync = require('../utils/catchAsync')
const jwt = require('jsonwebtoken')
const slugify = require('slugify')
const { nanoid } = require('nanoid')
const StoreSubName = require('../model/StoreSubNameModel')
const User = require('../model/userModel')
const StorePages = require('../model/StorePages')
const StaffInvitation = require('../model/staffInvitationModel')
const Product = require('../model/productModel')
const randomString = require('random-string')

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_KEY)

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = require('twilio')(accountSid, authToken)

// this function will return you jwt token
const signToken = (userId, storeId) =>
  jwt.sign({ userId, storeId }, process.env.JWT_SECRET)

const filterObj = (obj, ...allowedFields) => {
  const newObj = {}
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el]
  })
  return newObj
}

// Get store details

exports.getStoreDetails = catchAsync(async (req, res, next) => {
  const storeDoc = await Store.findById(req.store._id)
  res.status(200).json({
    status: 'success',
    data: storeDoc,
    message: 'Successfully found store details',
  })
})

// Setup Store

exports.setupStore = catchAsync(async (req, res, next) => {
  console.log(req.user, req.store, req.body)

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
  })
})

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
  const { name, phone, email, permissions } = req.body

  // Find user by this email

  const userDoc = await User.findOne({ email: email })

  if (userDoc) {
    // Add this store to user's stores array
    userDoc.stores.push(req.store._id)
  } else {
    await StaffInvitation.create({
      store: req.store._id,
      name: name,
      phone: phone,
      permissions: permissions,
      email: email,
      createdAt: Date.now(),
    })
  }

  const storeDoc = await Store.findById(req.store._id)

  storeDoc.team.push({
    name: name,
    phone: phone,
    permissions: permissions,
    addedAt: Date.now(),
    email: email,
    status: userDoc ? 'Accepted' : 'Pending',
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
  const { email } = req.params

  // Find this member by this email and update permission in store as well as invitation request

  const { permissions } = req.body

  const storeDoc = await Store.findById(req.store._id)

  storeDoc.team = storeDoc.team.map((el) => {
    if (el.email !== email) {
      return el
    } else {
      el.permissions = permissions
      el.updatedAt = Date.now()

      return el
    }
  })

  await StaffInvitation.findOneAndUpdate(
    { $and: [{ email: email }, { store: req.store._id }] },
    { permissions: permissions },
    { new: true, validateModifiedOnly: true },
  )

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
  const { email } = req.params
  const storeDoc = await Store.findById(req.store._id)

  storeDoc.team = storeDoc.team.filter((el) => el.email !== email)

  await StaffInvitation.findOneAndDelete({
    $and: [{ email: email }, { store: req.store._id }],
  })

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
  const { fieldName, type, required, options } = req.body

  const storeDoc = await Store.findById(req.store._id)

  storeDoc.formFields.push({ fieldName, type, required, options })

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
  const { fieldId } = req.params

  const { fieldName, type, required, options } = req.body

  const storeDoc = await Store.findById(req.store._id)

  storeDoc.formFields = storeDoc.formFields.map((el) => {
    if (el._id !== fieldId) {
      return el
    }
    el.name = fieldName
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
  const { fieldId } = req.params

  const storeDoc = await Store.findById(req.store._id)

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

// Update Ambience

exports.updateStoreAmbience = catchAsync(async (req, res, next) => {
  const { mode, primaryColor } = req.body

  const updatedStore = await Store.findByIdAndUpdate(
    req.store._id,
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
exports.updateStoreOtherInfo = catchAsync(async (req, res, next) => {
  const {
    freeDeliveryAbove,
    orderIsShippedIn,
    returnAccepted,
    replacementAccepted,
    returnPeriod,
    replacementPeriod,
    deliveryHappensWithin,
    deliveryState,
    deliveryCity,
    minDeliveryDistance,
    maxDeliveryDistance,
    showShopInsideDeliveryZoneOnly,
  } = req.body

  // * DONE => Map over all products of this store and determine if they qualify for free delivery or not

  const storeDoc = await Store.findById(req.store._id)

  const freeDeliveryThreshold = storeDoc.freeDeliveryAbove

  const storeDocs = await Product.find({ store: req.store._id })

  storeDocs.forEach(async (el) => {
    if (el.highestPrice * 1 >= freeDeliveryThreshold * 1) {
      el.freeDelivery = true
    }

    await el.save({ new: true, validateModifiedOnly: true })
  })

  const updatedStore = await Store.findByIdAndUpdate(
    req.store._id,
    {
      freeDeliveryAbove,
      orderIsShippedIn,
      returnAccepted,
      replacementAccepted,
      returnPeriod,
      replacementPeriod,
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
  const { theme } = req.params

  const updatedStore = await Store.findByIdAndUpdate(
    req.store._id,
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

exports.updatePaymentSettings = catchAsync(async (req, res, next) => {
  const updatedStore = await Store.findByIdAndUpdate(
    req.store._id,
    { ...req.body },
    { new: true, validateModifiedOnly: true },
  )

  res.status(200).json({
    status: 'success',
    message: 'Payout Settings updated successfully!',
    data: updatedStore,
  })
})

// Update store favicon

exports.updateFavicon = catchAsync(async (req, res, next) => {
  const updatedStore = await Store.findByIdAndUpdate(
    req.store._id,
    { ...req.body },
    { new: true, validateModifiedOnly: true },
  )

  res.status(200).json({
    status: 'success',
    data: updatedStore,
    message: 'Store favicon updated successfully!',
  })
})

// Update Store SEO

exports.updateStoreSEO = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(
    req.body,
    'seoTitle',
    'seoMetaDescription',
    'seoImagePreview',
  )
  const updatedStore = await Store.findByIdAndUpdate(
    req.store._id,
    filteredBody,
    { new: true, validateModifiedOnly: true },
  )

  res.status(200).json({
    status: 'success',
    data: updatedStore,
    message: 'Store SEO updated successfully!',
  })
})

exports.updateSelfDeliveryZone = catchAsync(async (req, res, next) => {
  const updatedStore = await Store.findByIdAndUpdate(
    req.store._id,
    { ...req.body },
    { new: true, validateModifiedOnly: true },
  )

  res.status(200).json({
    status: 'success',
    data: updatedStore,
    message: 'Self Delivery Zones updated successfully!',
  })
})

exports.updateManageCharges = catchAsync(async (req, res, next) => {
  const updatedStore = await Store.findByIdAndUpdate(
    req.store._id,
    { ...req.body },
    { new: true, validateModifiedOnly: true },
  )

  res.status(200).json({
    status: 'success',
    data: updatedStore,
    message: 'Extra charges updated successfully!',
  })
})

exports.updateStoreTimings = catchAsync(async (req, res, next) => {
  const updatedStore = await Store.findByIdAndUpdate(
    req.store._id,
    { ...req.body },
    { new: true, validateModifiedOnly: true },
  )

  res.status(200).json({
    status: 'success',
    data: updatedStore,
    message: 'Store timings updated successfully!',
  })
})

// Policy

exports.updatePolicy = catchAsync(async (req, res, next) => {
  const updatedStore = await Store.findByIdAndUpdate(
    req.store._id,
    { ...req.body },
    { new: true, validateModifiedOnly: true },
  )

  res.status(200).json({
    status: 'success',
    data: updatedStore,
    message: 'Store Policy Updated Successfully!',
  })
})

// Update Notifications

exports.updateNotifications = catchAsync(async (req, res, next) => {
  const updatedStore = await Store.findByIdAndUpdate(
    req.store._id,
    { ...req.body },
    { new: true, validateModifiedOnly: true },
  )

  res.status(200).json({
    status: 'success',
    data: updatedStore,
    message: 'Notification settings Updated Successfully!',
  })
})

// Update Social Links

exports.updateSocialLinks = catchAsync(async (req, res, next) => {
  const updatedStore = await Store.findByIdAndUpdate(
    req.store._id,
    { ...req.body },
    { new: true, validateModifiedOnly: true },
  )

  res.status(200).json({
    status: 'success',
    data: updatedStore,
    message: 'Social Links Updated Successfully!',
  })
})

// Update guest checkout
exports.updateGuestCheckout = catchAsync(async (req, res, next) => {
  const updatedStore = await Store.findByIdAndUpdate(
    req.store._id,
    { ...req.body },
    { new: true, validateModifiedOnly: true },
  )
  res.status(200).json({
    status: 'success',
    message: req.body.guestCheckout
      ? 'Guest checkout enabled successfully!'
      : 'Guest checkout disabled successfully!',
    data: updatedStore,
  })
})

// Update Store General Info

exports.updateGeneralStoreInfo = catchAsync(async (req, res, next) => {
  const storeDoc = await Store.findById(req.store._id)
  const storeSubNameDocs = await StoreSubName.find({})

  const allSubNames = storeSubNameDocs.map((el) => el.subName)

  if (!allSubNames.includes(req.body.subName)) {
    //  Safe to reassign subname
    storeDoc.subName = req.body.subName
    await StoreSubName.findOneAndUpdate(
      { store: req.store._id },
      { subName: req.body.subName },
      { new: true, validateModifiedOnly: true },
    )
  }

  if (req.body.key) {
    storeDoc.logo = req.body.key
  }

  //  Save store document

  await storeDoc.save({ new: true, validateModifiedOnly: true })

  // update store logo if !null
  // update store sub name
  // update other store info

  const updatedStore = await Store.findByIdAndUpdate(
    req.store._id,
    {
      storeName: req.body.storeName,
      country: req.body.country,
      state: req.body.state,
      city: req.body.city,
      address: req.body.address,
      pincode: req.body.pincode,
      landmark: req.body.landmark,
      gstin: req.body.gstin,
      category: req.body.category,
      phone: req.body.phone,
      emailAddress: req.body.emailAddress,
    },
    { new: true, validateModifiedOnly: true },
  )

  res.status(200).json({
    status: 'success',
    message: 'Store Profile updated successfully!',
    data: updatedStore,
  })
})

// Add staff member
// Directly add if user with same email is already on platform
// and create a invitation if not already present

exports.updateStore = catchAsync(async (req, res, next) => {
  const updatedStore = await Store.findByIdAndUpdate(
    req.store._id,
    { ...req.body },
    { new: true, validateModifiedOnly: true },
  )

  res.status(200).json({
    status: 'success',
    message: 'Store Updated successfully!',
    data: updatedStore,
  })
})

exports.updateWhatsAppNumber = catchAsync(async (req, res, next) => {
  // Update Number in store database and Generate a verification OTP and send on the requested number
  // Set WhatsApp Verified Status to false

  const WAOTP = randomString({
    length: 6,
    numeric: true,
    letters: false,
    special: false,
    exclude: ['a', 'b', '1'],
  })

  const updatedStore = await Store.findByIdAndUpdate(
    req.store._id,
    { WhatsAppNumber: req.body.phone, WAOTP, WAVerified: false },
    { new: true, validateModifiedOnly: true },
  )

  // Send SMS Notification

  client.messages
    .create({
      body: `${WAOTP} is your OTP to Confirm your WhatsApp Number with QwikShop.`,
      from: '+1 775 535 7258',
      to: req.body.phone,
    })

    .then((message) => {
      console.log(message.sid)
      console.log(`Successfully sent SMS`)
    })
    .catch((e) => {
      console.log(e)
      console.log(`Failed to send SMS`)
    })

  res.status(200).json({
    status: 'success',
    data: updatedStore,
    message: 'WhatsApp Number updated, Please verify via OTP',
  })
})

exports.verifyWhatsAppNumber = catchAsync(async (req, res, next) => {
  // Fetch Store doc and compare user provided and database WAOTP and if they are same then change status of WAVerified to true otherwise inform the user

  const storeDoc = await Store.findById(req.store._id)

  if (req.body.otp === storeDoc.WAOTP) {
    // Set WAOTP to undefined and WAVerified to true

    storeDoc.WAVerified = true
    storeDoc.WAOTP = undefined

    const updatedStoreDoc = await storeDoc.save({
      new: true,
      validateModifiedOnly: true,
    })

    res.status(200).json({
      status: 'success',
      message: 'WhatsApp Number verified successfully!',
      data: updatedStoreDoc,
    })
  } else {
    // Inform the user that the OTP is not correct

    res.status(400).json({
      status: 'error',
      message: 'Incorrect OTP, please enter correct OTP.',
    })
  }
})

exports.createNew = catchAsync(async (req, res, next) => {
  // Create a new store and update user doc and send new sign in token

  const newStore = await Store.create({
    owner: req.user._id,
    ...req.body,
    setupCompleted: true,
  })
  // Check if there is no previously assigned subname then assign new one

  const subName = nanoid()

  // Create a new subname Doc for this store

  await StoreSubName.create({
    subName,
    store: req.store._id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })

  const updatedStore = await Store.findByIdAndUpdate(
    newStore._id,
    { subName: subName },
    { new: true, validateModifiedOnly: true },
  )

  const userDoc = await User.findById(req.user._id).populate(
    'stores',
    'storeName logo _id',
  )

  userDoc.stores.push(updatedStore._id)

  const updatedUser = await userDoc.save({
    new: true,
    validateModifiedOnly: true,
  })

  // Sign new token

  const token = signToken(req.user._id, updatedStore._id)

  res.status(200).json({
    status: 'success',
    store: updatedStore,
    user: updatedUser,
    token: token,
    permissions: [
      'Order',
      'Catalouge',
      'Delivery',
      'Customer',
      'Dining',
      'Marketing',
      'Payment',
      'Discount',
      'Manage',
      'Design',
      'Integration',
      'Reviews',
      'Questions',
      'Referral',
      'Wallet',
      'Reports',
    ],
    message: 'New Store Created Successfully!',
  })
})

exports.switchStore = catchAsync(async (req, res, next) => {
  const storeId = req.params.storeId
  const userId = req.user._id

  const storeDoc = await Store.findById(storeId)

  const userDoc = await User.findById(userId)

  const token = signToken(userDoc._id, storeDoc._id)

  res.status(200).json({
    status: 'success',
    store: storeDoc,
    user: userDoc,
    token: token,
    permissions: [
      'Order',
      'Catalouge',
      'Delivery',
      'Customer',
      'Dining',
      'Marketing',
      'Payment',
      'Discount',
      'Manage',
      'Design',
      'Integration',
      'Reviews',
      'Questions',
      'Referral',
      'Wallet',
      'Reports',
    ],
    message: 'Store Switched successfully!',
  })
})

// While logging in store also send permissions along with token & Populate name, image of store in user

exports.updateHeroBanner = catchAsync(async (req, res, next) => {
  const storeDoc = await Store.findById(req.store._id)

  const banners = req.body.banners.map((el) => ({ ...el, file: null }))

  storeDoc.heroBanners = banners
  const updatedStoreDoc = await storeDoc.save({
    new: true,
    validateModifiedOnly: true,
  })

  res.status(200).json({
    status: 'success',
    data: updatedStoreDoc,
    message: 'Hero Banners Updated successfully!',
  })
})
exports.updateCustomBanner = catchAsync(async (req, res, next) => {
  const storeDoc = await Store.findById(req.store._id)

  const banners = req.body.banners.map((el) => ({ ...el, file: null }))

  storeDoc.customBanners = banners
  const updatedStoreDoc = await storeDoc.save({
    new: true,
    validateModifiedOnly: true,
  })

  res.status(200).json({
    status: 'success',
    data: updatedStoreDoc,
    message: 'Custom Banners Updated successfully!',
  })
})
exports.updateImageBanner = catchAsync(async (req, res, next) => {
  const storeDoc = await Store.findById(req.store._id)

  const banners = req.body.banners.map((el) => ({ ...el, file: null }))

  storeDoc.imageBanners = banners
  const updatedStoreDoc = await storeDoc.save({
    new: true,
    validateModifiedOnly: true,
  })

  res.status(200).json({
    status: 'success',
    data: updatedStoreDoc,
    message: 'Image Banners Updated successfully!',
  })
})
exports.updateCustomSections = catchAsync(async (req, res, next) => {
  const storeDoc = await Store.findById(req.store._id)

  const sections = req.body.sections

  storeDoc.customSections = sections
  const updatedStoreDoc = await storeDoc.save({
    new: true,
    validateModifiedOnly: true,
  })

  res.status(200).json({
    status: 'success',
    data: updatedStoreDoc,
    message: 'Custom Sections Updated successfully!',
  })
})
