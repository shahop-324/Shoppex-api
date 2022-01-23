const Store = require('../model/StoreModel')
const catchAsync = require('../utils/catchAsync')

// Store Timing
const updateStoreTiming = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const {
    sunday,
    monday,
    tuesday,
    wednesday,
    thrusday,
    friday,
    saturday,
    sunday,
  } = req.body

  const storeDoc = await Store.findById(id)

  storeDoc.sunday = sunday
  storeDoc.monday = monday
  storeDoc.tuesday = tuesday
  storeDoc.wednesday = wednesday
  storeDoc.thrusday = thrusday
  storeDoc.friday = friday
  storeDoc.saturday = saturday
  storeDoc.sunday = sunday

  const updatedStore = await storeDoc.save({
    new: true,
    validateModifiedOnly: true,
  })

  res.status(200).json({
    status: 'success',
    data: updatedStore,
    message: 'Store Timings updated successfully!',
  })
})

// Store charges
const updateStoreCharges = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const { gstin, gstPercent, extraCharges } = req.body

  const storeDoc = await Store.findById(id)

  storeDoc.gstin = gstin
  storeDoc.gstPercent = gstPercent
  storeDoc.extraCharges = extraCharges

  const updatedStore = await storeDoc.save({
    new: true,
    validateModifiedOnly: true,
  })

  res.status(200).json({
    status: 'success',
    data: updatedStore,
    message: 'Extra charges updated successfully!',
  })
})

// Store SEO
const updateStoreSEO = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const { title, metaDescription, socialSharingImage } = req.body

  const updatedStore = await Store.findByIdAndUpdate(
    id,
    { title, metaDescription, socialSharingImage },
    { new: true, validateModifiedOnly: true },
  )

  res.status(200).json({
    status: 'success',
    data: updatedStore,
    message: 'Store SEO settings updated successfully!',
  })
})

// Store Self delivery zones
const updateSelfDeliveryZone = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const { zones, storePincode } = req.body

  const storeDoc = await Store.findById(id)

  storeDoc.storePincode = storePincode

  storeDoc.selfDeliveryZone = zones

  const updatedDoc = await storeDoc.save({
    new: true,
    validateModifiedOnly: true,
  })

  res.status(200).json({
    status: 'success',
    data: updatedDoc,
    message: 'Self Delivery zone updated successfully!',
  })
})

// Store Android App
const getAndroidApp = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  // Fetch app from S3 and give it to user
})