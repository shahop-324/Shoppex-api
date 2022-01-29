const PickupPoint = require('../model/PickupPointModel')
const Shipment = require('../model/shipmentModel');
const catchAsync = require('../utils/catchAsync')
const apiFeatures = require('../utils/apiFeatures')

exports.addPickupPoint = catchAsync(async (req, res, next) => {
  const newPickupPoint = await PickupPoint.create({
    store: req.store._id,
    ...req.body,
  })

  res.status(200).json({
    status: 'success',
    data: newPickupPoint,
    message: 'New Pickup point added successfully!',
  })
})

exports.updatePickupPoint = catchAsync(async (req, res, next) => {
  const { pickupPointId } = req.params

  const updatedPickupPoint = await PickupPoint.findByIdAndUpdate(
    pickupPointId,
    { ...req.body },
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

  await PickupPoint.findByIdAndDelete(pickupPointId)

  res.status(200).json({
    status: 'success',
    message: 'Pickup point deleted successfully!',
  })
})

exports.deleteMultiplePickupPoint = catchAsync(async (req, res, next) => {
  const { pickupPointIds } = req.body
  for (let element of pickupPointIds) {
    await PickupPoint.findByIdAndDelete(element)
  }
  res.status(200).json({
    status: 'success',
    message: 'Pickup points deleted successfully!',
  })
})

exports.getPickupPoints = catchAsync(async (req, res, next) => {
  const query = PickupPoint.find({ store: req.store._id })
  const features = new apiFeatures(query, req.query).textFilter()

  const pickupPoints = await features.query

  res.status(200).json({
    status: 'success',
    message: 'Pickup points found successfully!',
    data: pickupPoints,
  })
})

// *************************************************** Shipment *************************************************** //

// Update shipment

exports.updateShipment = catchAsync(async (req, res, next) => {
  const { shipmentId } = req.params

  const updatedShipment = await Shipment.findByIdAndUpdate(
    shipmentId,
    {
      ...req.body,
    },
    { new: true, validateModifiedOnly: true },
  )

  res.status(200).json({
    status: 'success',
    data: updatedShipment,
    message: 'Shipment updated successfully!',
  })
})

// Fetch Shipments

exports.getShipments = catchAsync(async (req, res, next) => {
  const query = Shipment.find({ store: req.store._id });
  const features = new apiFeatures(query, req.query).textFilter()

  const shipments = await features.query

  res.status(200).json({
    status: 'success',
    message: 'Shipments found successfully!',
    data: shipments,
  })
})
