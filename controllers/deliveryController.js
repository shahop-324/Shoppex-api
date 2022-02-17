const PickupPoint = require('../model/PickupPointModel')
const Store = require('../model/StoreModel')
const Order = require('../model/ordersModel')
const Shipment = require('../model/shipmentModel')
const catchAsync = require('../utils/catchAsync')
const apiFeatures = require('../utils/apiFeatures')
const fetch = require('node-fetch')
const { v4: uuidv4 } = require('uuid')

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = require('twilio')(accountSid, authToken)

exports.addPickupPoint = catchAsync(async (req, res, next) => {
  // Create a new pickup point in delhivery api

  // Generate Unique name for each pickup point added

  const warehouse_name = uuidv4() // Save this warehouse_name to actual pickup point in QwikShop Database

  try {
    const pickupPointRes = await fetch(
      `https://staging-express.delhivery.com/api/backend/clientwarehouse/create/`,
      {
        method: 'POST',

        body: JSON.stringify({
          phone: req.body.phone,
          city: req.body.city,
          name: warehouse_name,
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
          Authorization: `Token 4c1065c25ed6d2ce7a406c596ae03d60d0d4fe13`,
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
      warehouse_name: warehouse_name,
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
  try {
    const { pickupPointId } = req.params

    const pickupPointDoc = await PickupPoint.findById(pickupPointId)

    try {
      const pickupPointRes = await fetch(
        `https://staging-express.delhivery.com/api/backend/clientwarehouse/edit/`,
        {
          method: 'POST',

          body: JSON.stringify({
            phone: req.body.phone,
            name: pickupPointDoc.delhivery_data.get('name'),
            pin: pickupPointDoc.delhivery_data.get('pincode'),
            address: req.body.address,
            registered_name: req.body.contactPersonName,
          }),

          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Token 4c1065c25ed6d2ce7a406c596ae03d60d0d4fe13`,
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
  } catch (error) {
    console.log(error)
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

// Assign Delhivery

exports.assignDelhivery = catchAsync(async (req, res, next) => {
  // * DONE Deduct money from wallet if(available) and if not available then ask to recharge wallet => Notify customer

  console.log(req.body.pickupPointId.value, req.body.shipmentId)

  const pickupPoint = await PickupPoint.findById(req.body.pickupPointId.value)
  const shipment = await Shipment.findById(req.body.shipmentId)
  const orderDoc = await Order.findById(shipment.order._id)

  shipment.carrier = 'Delhivery'
  shipment.updatedAt = Date.now()

  await shipment.save({ new: true, validateModifiedOnly: true })

  orderDoc.orderStatus = 'shipping'
  orderDoc.status = 'Accepted'

  await orderDoc.save({ new: true, validateModifiedOnly: true })

  const storeDoc = await Store.findById(shipment.store)

  storeDoc.walletAmount = storeDoc.walletAmount - shipment.order.deliveryCharge

  await storeDoc.save({ new: true, validateModifiedOnly: true })

  console.log(pickupPoint, shipment, storeDoc)

  // client.messages
  //   .create({
  //     body: `Hi, ${shipment.customer.name}, your order #${shipment.order.ref} from ${storeDoc.name} has been booked for shipment via Delhivery. You can check your order status by visiting qwikshop.online/${storeDoc.subName}`,
  //     from: '+1 775 535 7258',
  //     to: shipment.customer.phone,
  //   })
  //   .then((message) => {
  //     console.log(message.sid)
  //     console.log(`Successfully sent Notification to ${shipment.customer.name}`)
  //   })
  //   .catch((e) => {
  //     console.log(e)
  //     console.log(`Failed to send Notification to ${shipment.customer.name}`)
  //   })

  //  Find order which is being shipped
  // Find shipment and get related details
  // After successful call update carrier
  // Notify customer that their shipment has been booked

  const shipmentRes = await fetch(
    `https://staging-express.delhivery.com/api/cmu/create.json`,
    {
      method: 'POST',

      body: `format=json&data=${JSON.stringify({
        pickup_location: {
          pin: pickupPoint.delhivery_data.pincode,
          add: pickupPoint.delhivery_data.address,
          phone: pickupPoint.delhivery_data.phone,
          state: pickupPoint.state,
          city: pickupPoint.city,
          country: 'India',
          name: pickupPoint.delhivery_data.phone.name,
        },
        shipments: [
          {
            return_name: pickupPoint.delhivery_data.name,
            return_pin: pickupPoint.delhivery_data.pincode,
            return_city: pickupPoint.city,
            return_phone: pickupPoint.delhivery_data.phone,
            return_add: pickupPoint.delhivery_data.address,
            return_state: pickupPoint.state,
            return_country: 'India',
            order: orderDoc.ref,
            shipping_mode: 'Express', // Select the mode of transport
            phone: orderDoc.shippingAddress.shipping_contact,
            cod_amount:
              orderDoc.paymentMode === 'cod' ? orderDoc.charges.total : 0,
            name: orderDoc.shippingAddress.shipping_name,
            country: 'India',
            // "waybill": "waybillno.(trackingid)",
            // "seller_inv_date": "",
            order_date: orderDoc.createdAt,
            total_amount: orderDoc.charges.total,
            seller_add: storeDoc.address,
            // "seller_cst": "",
            add: orderDoc.shippingAddress.shipping_address1,
            seller_name: storeDoc.name,
            // "seller_inv": "",
            // "seller_tin": "",
            pin: orderDoc.shippingAddress.shipping_zip,
            quantity: '1',
            payment_mode: orderDoc.paymentMode === 'cod' ? 'COD' : 'Pre-paid',

            city: orderDoc.shippingAddress.shipping_city,
          },
        ],
      })}`,

      headers: {
        'Content-type': 'application/json',
        Authorization: `Token 4c1065c25ed6d2ce7a406c596ae03d60d0d4fe13`,
      },
    },
  )

  const result = await shipmentRes.json()

  if (!shipmentRes.ok) {
    if (!shipmentRes.message) {
      throw new Error('Something went wrong')
    } else {
      throw new Error(shipmentRes.message)
    }
  }

  console.log(result, 'This is the result of booking delhivery shipping')

  res.status(200).json({
    status: 'success',
    message: 'Shipment booked successfully!',
  })
})

// Assign Self shipping

exports.assignSelfShipping = catchAsync(async (req, res, next) => {
  // just update carrier as self shipping => Notify Customer
})

// Cancel Shipment
exports.cancelShippment = catchAsync(async (req, res, next) => {
  // Cancel shipment and cancel order and create a refund if online payment was made and reverse coins  => Notify customer
})

// Cancel order , Reject order => Create refund if online payment was maid and reverse coins  & Notify customer
