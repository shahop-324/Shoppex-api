const catchAsync = require('../utils/catchAsync')

exports.addPickupPoint = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const {
    type,
    storeName,
    country,
    region,
    city,
    address,
    pincode,
    landmark,
    phoneNumber,
    contactPersonName,
    contactEmail,
  } = req.body

  const newPickupPoint = await PickupPoints.create({
    store: id,
    type,
    storeName,
    country,
    region,
    city,
    address,
    pincode,
    landmark,
    phoneNumber,
    contactPersonName,
    contactEmail,
  })

  res.status(200).json({
    status: 'success',
    data: newPickupPoint,
    message: 'New Pickup point added successfully!',
  })
})

exports.updatePickupPoint = catchAsync(async (req, res, next) => {
  const { pickupPointId, id } = req.params

  const {
    type,
    storeName,
    country,
    region,
    city,
    address,
    pincode,
    landmark,
    phoneNumber,
    contactPersonName,
    contactEmail,
  } = req.body

  const updatedPickupPoint = await PickupPoints.findByIdAndUpdate(
    pickupPointId,
    {
      store: id,
      type,
      storeName,
      country,
      region,
      city,
      address,
      pincode,
      landmark,
      phoneNumber,
      contactPersonName,
      contactEmail,
    },
    { new: true, validateModifiedOnly: true },
  )

  res.status(200).json({
    status: 'success',
    data: updatedPickupPoint,
    message: 'Pickup point updated successfully!',
  })
})

exports.deletePickupPoint = catchAsync(async (req, res, next) => {
  const { pickupPointId } = req.params

  await PickupPoints.findByIdAndDelete(pickupPointId)

  res.status(200).json({
    status: 'success',
    message: 'Pickup point deleted successfully!',
  })
})

exports.getPickupPoints = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const pickupPoints = await PickupPoints.find({ store: id })

  res.status(200).json({
    status: 'success',
    message: 'Pickup points found successfully!',
    data: pickupPoints,
  })
})

// Shipment

exports.addShipment = catchAsync(async (req, res, next) => {
  // store, order, origination, destination, carrier, charge, status, currentLocation, self tracking link

  const {
    store,
    order,
    origination,
    destination,
    carrier,
    charge,
    status,
    currentLocation,
    selfTrackingLink,
    expectedDelivery,
  } = req.body

  const newShipment = await Shipment.create({
    store,
    order,
    origination,
    destination,
    carrier,
    charge,
    status,
    currentLocation,
    selfTrackingLink,
    expectedDelivery,
  })

  res.status(200).json({
    status: 'success',
    data: newShipment,
    message: 'Shipment Added successfully!',
  })
})

exports.updateShipment = catchAsync(async (req, res, next) => {
  const { shipmentId } = req.params

  const {
    store,
    order,
    origination,
    destination,
    carrier,
    charge,
    status,
    currentLocation,
    selfTrackingLink,
    expectedDelivery,
  } = req.body

  const updatedShipment = await Shipment.findByIdAndUpdate(
    shipmentId,
    {
      store,
      order,
      origination,
      destination,
      carrier,
      charge,
      status,
      currentLocation,
      selfTrackingLink,
      expectedDelivery,
    },
    { new: true, validateModifiedOnly: true },
  )

  res.status(200).json({
    status: 'success',
    data: updatedShipment,
    message: 'Shipment updated successfully!',
  })
})

exports.getShipments = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const shipments = await Shipment.find({ store: id })

  res.status(200).json({
    status: 'success',
    message: 'Shipments found successfully!',
    data: shipments,
  })
})
