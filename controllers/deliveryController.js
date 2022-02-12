const PickupPoint = require('../model/PickupPointModel')
const Shipment = require('../model/shipmentModel')
const catchAsync = require('../utils/catchAsync')
const apiFeatures = require('../utils/apiFeatures')
const fetch = require('node-fetch')

exports.addPickupPoint = catchAsync(async (req, res, next) => {
  // Create a new pickup point in delhivery api

  try {
    const pickupPointRes = await fetch(
      `https://track.delhivery.com/api/backend/clientwarehouse/create/`,
      {
        method: 'POST',

        body: JSON.stringify({
          phone: req.body.phone,
          city: req.body.city,
          name: req.body.pickupPointName,
          pin: req.body.pincode,
          address: req.body.address,
          country: 'India',
          email: req.body.contactEmail,
          registered_name: req.body.contactPersonName,
          return_address: req.body.address,
          return_pin: req.body.pincode,
          return_city: req.body.city,
          return_state: req.body.state,
          return_country: 'India',
        }),

        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Token fb0d3f859f56a55f7ee5f74940a62f62708d5a29`,
        },
      },
    )

    console.log(pickupPointRes)

    const result = await pickupPointRes.json()

    if (!pickupPointRes.ok) {
      if (!pickupPointRes.message) {
        throw new Error('Something went wrong')
      } else {
        throw new Error(pickupPointRes.message)
      }
    }

    console.log(result)

    const newPickupPoint = await PickupPoint.create({
      store: req.store._id,
      ...req.body,
      delhivery_data: result.data,
    })

    res.status(200).json({
      status: 'success',
      data: newPickupPoint,
      message: 'New Pickup point added successfully!',
    })
  } catch (error) {
    console.log(error)
    res.status(400).json({
      status: 'error',
      message: 'Failed to add Pick up point, Please try again!',
    })
  }
})

exports.updatePickupPoint = catchAsync(async (req, res, next) => {
  const { pickupPointId } = req.params

  const pickupPointDoc = await PickupPoint.findById(pickupPointId)

  console.log( pickupPointDoc.delhivery_data)

  try {
    const pickupPointRes = await fetch(
      `https://track.delhivery.com/api/backend/clientwarehouse/edit/`,
      {
        method: 'POST',

        body: JSON.stringify({
          phone: req.body.phone,
          name: pickupPointDoc.delhivery_data.get(name),
          pin: pickupPointDoc.delhivery_data.get(pincode),
          address: req.body.address,
          registered_name: req.body.contactPersonName,
        }),

        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token fb0d3f859f56a55f7ee5f74940a62f62708d5a29`,
        },
      },
    )

    console.log(pickupPointRes)

    const result = await pickupPointRes.json()

    if (!pickupPointRes.ok) {
      if (!pickupPointRes.message) {
        throw new Error('Something went wrong')
      } else {
        throw new Error(pickupPointRes.message)
      }
    }

    console.log(result)

    const updatedPickupPoint = await PickupPoint.findByIdAndUpdate(
      pickupPointId,
      { ...req.body, delhivery_data: result.data, updatedAt: Date.now() },
      { new: true, validateModifiedOnly: true },
    )

    res.status(200).json({
      status: 'success',
      data: updatedPickupPoint,
      message: 'Pickup point updated successfully!',
    })
  } catch (error) {
    console.log(error)
    res.status(400).json({
      status: 'error',
      message: 'Failed to update Pick up point, Please try again!',
    })
  }
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
  const query = Shipment.find({ store: req.store._id })
  const features = new apiFeatures(query, req.query).textFilter()

  const shipments = await features.query

  res.status(200).json({
    status: 'success',
    message: 'Shipments found successfully!',
    data: shipments,
  })
})
