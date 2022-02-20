const PickupPoint = require('../model/pickupPointModel')
const Store = require('../model/storeModel')
const Order = require('../model/ordersModel')
const Shipment = require('../model/shipmentModel')
const catchAsync = require('../utils/catchAsync')
const apiFeatures = require('../utils/apiFeatures')
const fetch = require('node-fetch')
const { v4: uuidv4 } = require('uuid')
const { nanoid } = require('nanoid')
const request = require('request')
var uniqid = require('uniqid')
const Product = require('../model/productModel')
const Customer = require('../model/customerModel')

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = require('twilio')(accountSid, authToken)

exports.addPickupPoint = catchAsync(async (req, res, next) => {
  // Create a new pickup point in delhivery api

  // Generate Unique name for each pickup point added

  const warehouse_name = uniqid() // Save this warehouse_name to actual pickup point in QwikShop Database

  // Generate Token

  let token = null

  var options = {
    method: 'POST',
    url: 'https://apiv2.shiprocket.in/v1/external/auth/login',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'jyoti.shah@qwikshop.online',
      password: 'op12345@shah',
    }),
  }
  request(options, async (error, response) => {
    if (error) throw new Error(error)
    // console.log(response.body)
    JSON.parse(response.body)
    const resp = await JSON.parse(response.body)

    // console.log(resp.token)

    token = resp.token

    const options = {
      method: 'POST',
      url: 'https://apiv2.shiprocket.in/v1/external/settings/company/addpickup',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        pickup_location: warehouse_name,
        phone: req.body.phone * 1,
        city: req.body.city,
        pin_code: req.body.pincode * 1,
        address: req.body.address,
        country: 'India',
        email: req.body.contactEmail,
        name: req.body.contactPersonName,
        state: req.body.state,
      }),
    }

    try {
      request(options, async (error, response) => {
        if (error) throw new Error(error)
        // console.log(response.body)

        const result = await JSON.parse(response.body)

        // console.log(result)

        const newPickupPoint = await PickupPoint.create({
          store: req.store._id,
          ...req.body,
          warehouse_name: warehouse_name,
          shiprocket_data: result.data,
        })

        res.status(200).json({
          status: 'success',
          data: newPickupPoint,
          message: 'New Pickup point added successfully!',
        })
      })
    } catch (error) {
      // console.log(error)
      res.status(400).json({
        status: 'error',
        message: 'Failed to add Pick up point, Please try again!',
      })
    }
  })
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

      // console.log(pickupPointRes)

      const result = await pickupPointRes.json()

      if (!pickupPointRes.ok) {
        if (!pickupPointRes.message) {
          throw new Error('Something went wrong')
        } else {
          throw new Error(pickupPointRes.message)
        }
      }

      // console.log(result)

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
      // console.log(error)
      res.status(400).json({
        status: 'error',
        message: 'Failed to update Pick up point, Please try again!',
      })
    }
  } catch (error) {
    // console.log(error)
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

  if (req.body.status === 'Delivered') {
    // Mark Payment as completed and add money to on Hold for seller

    const shipmentDoc = await Shipment.findById(shipmentId)

    const orderDoc = await Order.findById(shipment.order._id)

    const storeDoc = await Store.findById(shipmentDoc.store)

    orderDoc.paidAmount = orderDoc.charges.total
    orderDoc.amountToConfirm = 0

    await orderDoc.save({ new: true, validateModifiedOnly: true })

    if (shipmentDoc.carrier !== 'Self') {
      storeDoc.amountOnHold = (
        storeDoc.amountOnHold * 1 +
        orderDoc.charges.total * 1 -
        orderDoc.coinsUsed * 1
      ).toFixed(2)

      await storeDoc.save({ new: true, validateModifiedOnly: true })
    }
  }

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

// Assign Shiprocket

exports.assignShiprocket = catchAsync(async (req, res, next) => {
  // * DONE Deduct money from wallet if(available) and if not available then ask to recharge wallet => Notify customer

  // console.log(req.body.pickupPointId.value, req.body.shipmentId)

  const pickupPoint = await PickupPoint.findById(req.body.pickupPointId.value)
  const shipment = await Shipment.findById(req.body.shipmentId)
  const orderDoc = await Order.findById(shipment.order._id)
  const customerDoc = await Customer.findById(orderDoc.customer._id)

  shipment.carrier = 'Shiprocket'
  shipment.updatedAt = Date.now()

  await shipment.save({ new: true, validateModifiedOnly: true })

  orderDoc.orderStatus = 'shipping'
  orderDoc.status = 'Accepted'

  await orderDoc.save({ new: true, validateModifiedOnly: true })

  const storeDoc = await Store.findById(shipment.store)

  storeDoc.walletAmount = storeDoc.walletAmount - shipment.order.deliveryCharge

  await storeDoc.save({ new: true, validateModifiedOnly: true })

  // console.log(pickupPoint, shipment, storeDoc)

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

  // Find order which is being shipped
  // Find shipment and get related details
  // After successful call update carrier
  // Notify customer that their shipment has been booked

  let token = null

  const options = {
    method: 'POST',
    url: 'https://apiv2.shiprocket.in/v1/external/auth/login',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'jyoti.shah@qwikshop.online',
      password: 'op12345@shah',
    }),
  }
  request(options, async (error, response) => {
    if (error) throw new Error(error)
    // console.log(response.body)
    JSON.parse(response.body)
    const resp = await JSON.parse(response.body)

    // console.log(resp.token)

    token = resp.token

    // Calculate weight, length, width, height and order Items array
    let totalWeight = 0

    const allProducts = await Product.find({})

    console.log(allProducts.length)

    const itemsArray = orderDoc.items.map((el) => {
      const product = allProducts.find(
        (elm) => elm._id.toString() === el.product.toString(),
      )
      totalWeight = totalWeight + (product.weight || 100)
      return {
        name: product.productName,
        sku: product.productSKU || 'SKU6787190',
        units: el.quantity,
        selling_price: Math.ceil(product.price * 1.18),
        hsn: 441122,
      }
    })

    console.log(itemsArray)

    setTimeout(async () => {
      var options = {
        method: 'POST',
        url: 'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_id: orderDoc.ref,
          order_date: orderDoc.createdAt,
          pickup_location: pickupPoint.warehouse_name,
          comment: `Seller: M/s ${storeDoc.name}`,
          billing_customer_name: orderDoc.billingAddress.get('shipping_name'),
          billing_last_name: orderDoc.billingAddress.get('shipping_name'),
          billing_address: orderDoc.billingAddress.get('shipping_address1'),
          billing_city: orderDoc.billingAddress.get('shipping_city'),
          billing_pincode: orderDoc.billingAddress.get('shipping_zip'),
          billing_state:
            orderDoc.billingAddress.get('shipping_state') || 'Madhya Pradesh',
          billing_country: 'India',
          billing_email: customerDoc.email,
          billing_phone: customerDoc.phone,
          shipping_is_billing: true,
          order_items: itemsArray,
          payment_method: orderDoc.paymentMode === 'cod' ? 'COD' : 'Prepaid',
          sub_total: Math.ceil(orderDoc.charges.get('total') * 1),
          length: 10,
          breadth: 15,
          height: 20,
          weight: (totalWeight / 1000).toFixed(1),
        }),
      }
      request(options, async (error, response) => {
        if (error) throw new Error(error)
        console.log(JSON.parse(response.body))

        const result = JSON.parse(response.body)

        const options = {
          method: 'POST',
          url: 'https://apiv2.shiprocket.in/v1/external/courier/assign/awb',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            shipment_id: result.shipment_id,
          }),
        }
        request(options, async (error, response) => {
          if (error) throw new Error(error)

          const awbResult = JSON.parse(response.body)
          console.log(awbResult)

          shipment.shiprocket_order_id = result.order_id
          shipment.shiprocket_shipment_id = result.shipment_id
          shipment.AWB = awbResult.response.data.awb_code

          shipment.pickup_time = awbResult.response.data.assigned_date_time.date
          shipment.courier_company_id =
            awbResult.response.data.courier_company_id
          shipment.applied_weight = awbResult.response.data.applied_weight
          shipment.courier_name = awbResult.response.data.courier_name
          shipment.routing_code = awbResult.response.data.routing_code
          shipment.invoice_no = awbResult.response.data.invoice_no
          shipment.transporter_id = awbResult.response.data.transporter_id
          shipment.transporter_name = awbResult.response.data.transporter_name

          const updatedShipment = await shipment.save({
            new: true,
            validateModifiedOnly: true,
          })

          res.status(200).json({
            status: 'success',
            shipment: updatedShipment,
            message: 'Shipment booked successfully!',
          })
        })
      })
    }, 2000)
  })
})

exports.requestPickup = catchAsync(async (req, res, next) => {
  const shipmentDoc = await Shipment.findById(req.params.shipmentId)

  let token = null

  const options = {
    method: 'POST',
    url: 'https://apiv2.shiprocket.in/v1/external/auth/login',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'jyoti.shah@qwikshop.online',
      password: 'op12345@shah',
    }),
  }

  request(options, async (error, response) => {
    if (error) throw new Error(error)
    // console.log(response.body)
    JSON.parse(response.body)
    const resp = await JSON.parse(response.body)

    // console.log(resp.token)

    token = resp.token

    const options = {
      method: 'POST',
      url: 'https://apiv2.shiprocket.in/v1/external/courier/generate/pickup',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        shipment_id: [shipmentDoc.shiprocket_shipment_id],
      }),
    }
    request(options, async (error, response) => {
      if (error) throw new Error(error)
      const result = JSON.parse(response.body)

      shipmentDoc.pickup_scheduled_date = result.response.pickup_scheduled_date
      shipmentDoc.pickup_token_number = result.response.pickup_token_number
      shipmentDoc.pickup_message = result.data

      const updatedShipment = await shipmentDoc.save({
        new: true,
        validateModifiedOnly: true,
      })

      res.status(200).json({
        status: 'success',
        data: result,
        shipment: updatedShipment,
        message: 'Pickup requested successfully!',
      })
    })
  })
})

exports.generateManifest = catchAsync(async (req, res, next) => {
  const shipmentDoc = await Shipment.findById(req.params.shipmentId)

  let token = null

  const options = {
    method: 'POST',
    url: 'https://apiv2.shiprocket.in/v1/external/auth/login',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'jyoti.shah@qwikshop.online',
      password: 'op12345@shah',
    }),
  }

  request(options, async (error, response) => {
    if (error) throw new Error(error)
    // console.log(response.body)
    JSON.parse(response.body)
    const resp = await JSON.parse(response.body)

    // console.log(resp.token)

    token = resp.token

    const options = {
      method: 'POST',
      url: 'https://apiv2.shiprocket.in/v1/external/manifests/generate',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        shipment_id: [186929429],
      }),
    }
    request(options, function (error, response) {
      if (error) throw new Error(error)
      console.log(response.body)
      const result = JSON.parse(response.body)
      res.status(200).json({
        status: 'success',
        data: result,
        message: 'Manifest Generated successfully!',
      })
    })
  })
})

exports.generateLabel = catchAsync(async (req, res, next) => {
  const shipmentDoc = await Shipment.findById(req.params.shipmentId)

  let token = null

  const options = {
    method: 'POST',
    url: 'https://apiv2.shiprocket.in/v1/external/auth/login',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'jyoti.shah@qwikshop.online',
      password: 'op12345@shah',
    }),
  }

  request(options, async (error, response) => {
    if (error) throw new Error(error)
    // console.log(response.body)
    JSON.parse(response.body)
    const resp = await JSON.parse(response.body)

    // console.log(resp.token)

    token = resp.token

    const options = {
      method: 'POST',
      url: 'https://apiv2.shiprocket.in/v1/external/courier/generate/label',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        shipment_id: [186929429],
      }),
    }
    request(options, function (error, response) {
      if (error) throw new Error(error)
      console.log(response.body)
      const result = JSON.parse(response.body)
      res.status(200).json({
        status: 'success',
        data: result,
        message: 'Manifest Generated successfully!',
      })
    })
  })
})

exports.generateInvoice = catchAsync(async (req, res, next) => {
  const shipmentDoc = await Shipment.findById(req.params.shipmentId)

  let token = null

  const options = {
    method: 'POST',
    url: 'https://apiv2.shiprocket.in/v1/external/auth/login',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'jyoti.shah@qwikshop.online',
      password: 'op12345@shah',
    }),
  }

  request(options, async (error, response) => {
    if (error) throw new Error(error)
    // console.log(response.body)
    JSON.parse(response.body)
    const resp = await JSON.parse(response.body)

    // console.log(resp.token)

    token = resp.token

    const options = {
      method: 'POST',
      url: 'https://apiv2.shiprocket.in/v1/external/orders/print/invoice',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ids: [187401964],
      }),
    }
    request(options, function (error, response) {
      if (error) throw new Error(error)
      console.log(response.body)
      const result = JSON.parse(response.body)
      res.status(200).json({
        status: 'success',
        data: result,
        message: 'Manifest Generated successfully!',
      })
    })
  })
})

exports.updateShipmentPickupLocation = catchAsync(async (req, res, next) => {
  const pickupPointDoc = await PickupPoint.findById(req.body.pickupPointId)

  const shipmentDoc = await Shipment.findById(req.body.shipmentId)

  let token = null

  const options = {
    method: 'POST',
    url: 'https://apiv2.shiprocket.in/v1/external/auth/login',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'jyoti.shah@qwikshop.online',
      password: 'op12345@shah',
    }),
  }

  request(options, async (error, response) => {
    if (error) throw new Error(error)
    // console.log(response.body)
    JSON.parse(response.body)
    const resp = await JSON.parse(response.body)

    // console.log(resp.token)

    token = resp.token

    var options = {
      method: 'PATCH',
      url: 'https://apiv2.shiprocket.in/v1/external/orders/address/pickup',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        order_id: [16167171],
        pickup_location: pickupPointDoc.warehouse_name,
      }),
    }
    request(options, function (error, response) {
      if (error) throw new Error(error)
      // console.log(response.body);

      const result = JSON.parse(response.body)

      console.log(result)

      res.status(200).json({
        status: 'success',
        data: result,
        message: 'Shipment Pickup location updated successfully!',
      })
    })
  })
})

exports.updateShipmentDeliveryAddress = catchAsync(async (req, res, next) => {
  const shipmentDoc = await Shipment.findById(req.body.shipmentId)

  let token = null

  const options = {
    method: 'POST',
    url: 'https://apiv2.shiprocket.in/v1/external/auth/login',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'jyoti.shah@qwikshop.online',
      password: 'op12345@shah',
    }),
  }

  request(options, async (error, response) => {
    if (error) throw new Error(error)
    // console.log(response.body)
    JSON.parse(response.body)
    const resp = await JSON.parse(response.body)

    // console.log(resp.token)

    token = resp.token

    const options = {
      method: 'POST',
      url: 'https://apiv2.shiprocket.in/v1/external/orders/address/update',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        order_id: shipmentDoc.shiprocket_order_id * 1,
        shipping_customer_name: req.body.shipping_customer_name,
        shipping_phone: req.body.shipping_phone * 1,
        shipping_address: req.body.shipping_address,
        shipping_address_2: req.body.shipping_address_2,
        shipping_city: req.body.shipping_city,
        shipping_state: req.body.shipping_state,
        shipping_country: req.body.shipping_country,
        shipping_pincode: req.body.shipping_pincode * 1,
        shipping_email: req.body.shipping_email,
        billing_alternate_phone: req.body.billing_alternate_phone,
      }),
    }
    request(options, function (error, response) {
      if (error) throw new Error(error)

      const result = JSON.parse(response.body)

      res.status(200).json({
        status: 'success',
        // data: result, => This request won't return any response body but just HTTP Response Code 202 => Update Accepted
        message: 'Shipment Delivery Address Updated successfully!',
      })
    })
  })
})

exports.trackShipment = catchAsync(async (req, res, next) => {
  // We will track shipment based on shipment_id

  const shipmentDoc = await Shipment.findById(req.body.shipmentId)

  let token = null

  const options = {
    method: 'POST',
    url: 'https://apiv2.shiprocket.in/v1/external/auth/login',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'jyoti.shah@qwikshop.online',
      password: 'op12345@shah',
    }),
  }

  request(options, async (error, response) => {
    if (error) throw new Error(error)
    // console.log(response.body)
    JSON.parse(response.body)
    const resp = await JSON.parse(response.body)

    // console.log(resp.token)

    token = resp.token

    const options = {
      method: 'GET',
      url: `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${shipmentDoc.shiprocket_shipment_id}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
    request(options, function (error, response) {
      if (error) throw new Error(error)
      // console.log(response.body);
      const result = JSON.parse(response.body)

      res.status(200).json({
        status: 'success',
        data: result,
        message: 'Shipment tracking status found successfully!',
      })
    })
  })
})

exports.cancelShipment = catchAsync(async (req, res, next) => {
  const shipmentDoc = await Shipment.findById(req.body.shipmentId)

  let token = null

  const options = {
    method: 'POST',
    url: 'https://apiv2.shiprocket.in/v1/external/auth/login',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'jyoti.shah@qwikshop.online',
      password: 'op12345@shah',
    }),
  }

  request(options, async (error, response) => {
    if (error) throw new Error(error)
    // console.log(response.body)
    JSON.parse(response.body)
    const resp = await JSON.parse(response.body)

    // console.log(resp.token)

    token = resp.token

    var options = {
      method: 'POST',
      url: 'https://apiv2.shiprocket.in/v1/external/orders/cancel',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ids: [shipmentDoc.shiprocket_order_id],
      }),
    }
    request(options, function (error, response) {
      if (error) throw new Error(error)
      console.log(response.body)

      res.status(200).json({
        message: 'Shipment cancelled successfully!',
        status: 'success',
      })
    })
  })
})

exports.getAllNDRShipments = catchAsync(async (req, res, next) => {
  // TODO => Get all NDR and filter out for specific store

  let token = null

  const options = {
    method: 'POST',
    url: 'https://apiv2.shiprocket.in/v1/external/auth/login',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'jyoti.shah@qwikshop.online',
      password: 'op12345@shah',
    }),
  }

  request(options, async (error, response) => {
    if (error) throw new Error(error)
    // console.log(response.body)
    JSON.parse(response.body)
    const resp = await JSON.parse(response.body)

    // console.log(resp.token)

    token = resp.token

    const options = {
      method: 'GET',
      url: 'https://apiv2.shiprocket.in/v1/external/ndr/all\n',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
    request(options, function (error, response) {
      if (error) throw new Error(error)
      console.log(response.body)

      const result = JSON.parse(response.body)

      res.status(200).json({
        status: 'success',
        data: result,
        message: 'Found all NDR orders.',
      })
    })
  })
})

exports.takeNDRAction = catchAsync(async (req, res, next) => {
  // TODO => Reattempt delivery or cancel shipment

  let token = null

  const options = {
    method: 'POST',
    url: 'https://apiv2.shiprocket.in/v1/external/auth/login',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'jyoti.shah@qwikshop.online',
      password: 'op12345@shah',
    }),
  }

  request(options, async (error, response) => {
    if (error) throw new Error(error)
    // console.log(response.body)
    JSON.parse(response.body)
    const resp = await JSON.parse(response.body)

    // console.log(resp.token)

    token = resp.token

    var options = {
      method: 'POST',
      url: `https://apiv2.shiprocket.in/v1/external/ndr/${req.body.awb}/action`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        action: req.body.action, // action can be 'return' or 're-attempt'
        comments: req.body.comment,
      }),
    }
    request(options, function (error, response) {
      if (error) throw new Error(error)
      console.log(response.body)

      // No Response body is sent in this request => Only HTTP Response code 202 (Accepted) will be received

      res.status(200).json({
        status: 'success',
        message:
          req.body.action === 'return'
            ? 'Shipment is returning to origin'
            : 'Shipment is being re-attempted',
      })
    })
  })
})

exports.checkCourierServicability = catchAsync(async (req, res, next) => {
  let token = null

  const options = {
    method: 'POST',
    url: 'https://apiv2.shiprocket.in/v1/external/auth/login',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'jyoti.shah@qwikshop.online',
      password: 'op12345@shah',
    }),
  }

  request(options, async (error, response) => {
    if (error) throw new Error(error)
    // console.log(response.body)
    JSON.parse(response.body)
    const resp = await JSON.parse(response.body)

    // console.log(resp.token)

    token = resp.token

    const options = {
      method: 'GET',
      url: `https://apiv2.shiprocket.in/v1/external/courier/serviceability/`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        pickup_postcode: req.body.pickup_postcode,
        delivery_postcode: req.body.delivery_postcode,
        cod: req.body.cod ? 1 : 0,
        weight: req.body.weight,
        declared_value: req.body.declared_value,
        mode: req.body.mode, // Air or Surface
        is_return: req.body.is_return ? 1 : 0,
      }),
    }
    request(options, function (error, response) {
      if (error) throw new Error(error)
      // console.log(response.body)
      const result = JSON.parse(response.body)

      res.status(200).json({
        status: 'success',
        message: 'Courier serviceability found successfully!',
        data: result,
      })
    })
  })
})

exports.generateRTOAWB = catchAsync(async (req, res, next) => {
  const shipmentDoc = await Shipment.findById(req.params.shipmentId)

  let token = null

  const options = {
    method: 'POST',
    url: 'https://apiv2.shiprocket.in/v1/external/auth/login',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'jyoti.shah@qwikshop.online',
      password: 'op12345@shah',
    }),
  }

  request(options, async (error, response) => {
    if (error) throw new Error(error)
    // console.log(response.body)
    JSON.parse(response.body)
    const resp = await JSON.parse(response.body)

    // console.log(resp.token)

    token = resp.token

    var options = {
      method: 'POST',
      url: 'https://apiv2.shiprocket.in/v1/external/courier/assign/awb',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        shipment_id: shipmentDoc.shiprocket_shipment_id,
        is_return: 1,
      }),
    }
    request(options, function (error, response) {
      if (error) throw new Error(error)
      console.log(response.body)
      const result = JSON.parse(response.body)

      res.status(200).json({
        status: 'success',
        data: result,
        message: 'Return shipment AWB Generated successfully!',
      })
    })
  })
})

exports.createReturnOrder = catchAsync(async (req, res, next) => {
  const pickupPoint = await PickupPoint.findById(req.body.pickupPointId.value)
  const shipment = await Shipment.findById(req.body.shipmentId)
  const orderDoc = await Order.findById(shipment.order._id)
  const customerDoc = await Customer.findById(orderDoc.customer._id)

  let token = null

  const options = {
    method: 'POST',
    url: 'https://apiv2.shiprocket.in/v1/external/auth/login',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'jyoti.shah@qwikshop.online',
      password: 'op12345@shah',
    }),
  }

  request(options, async (error, response) => {
    if (error) throw new Error(error)
    // console.log(response.body)
    JSON.parse(response.body)
    const resp = await JSON.parse(response.body)

    // console.log(resp.token)

    token = resp.token

    // Calculate weight, length, width, height and order Items array
    let totalWeight = 0

    const allProducts = await Product.find({})

    console.log(allProducts.length)

    const itemsArray = orderDoc.items.map((el) => {
      const product = allProducts.find(
        (elm) => elm._id.toString() === el.product.toString(),
      )
      totalWeight = totalWeight + (product.weight || 100)
      return {
        name: product.productName,
        sku: product.productSKU || 'SKU6787190',
        units: el.quantity,
        selling_price: Math.ceil(product.price * 1.18),
        hsn: 441122,
        qc_enable: false,
      }
    })

    console.log(itemsArray)

    var options = {
      method: 'POST',
      url: 'https://apiv2.shiprocket.in/v1/external/orders/create/return',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        order_id: nanoid(),
        order_date: orderDoc.createdAt,
        pickup_customer_name: orderDoc.shippingAddress.get('shipping_name'),
        pickup_last_name: orderDoc.shippingAddress.get('shipping_name'),
        pickup_address: orderDoc.shippingAddress.get('shipping_address1'),
        pickup_city: orderDoc.shippingAddress.get('shipping_city'),
        pickup_state:
          orderDoc.shippingAddress.get('shipping_state') || 'Madhya Pradesh',
        pickup_country: 'India',
        pickup_pincode: orderDoc.billingAddress.get('shipping_zip') * 1,
        pickup_email: customerDoc.email,
        pickup_phone: customerDoc.phone,
        pickup_isd_code: '91',

        shipping_customer_name: pickupPoint.contactPersonName,
        shipping_last_name: pickupPoint.contactPersonName,
        shipping_address: pickupPoint.address,
        shipping_city: pickupPoint.city,
        shipping_country: 'India',
        shipping_pincode: pickupPoint.pincode,
        shipping_state: pickupPoint.state,
        shipping_email: pickupPoint.contactEmail,
        shipping_isd_code: '91',
        shipping_phone: pickupPoint.phone,
        order_items: itemsArray,
        payment_method: orderDoc.paymentMode === 'cod' ? 'COD' : 'Prepaid',
        sub_total: Math.ceil(orderDoc.charges.get('total') * 1),
        length: 11,
        breadth: 11,
        height: 11,
        weight: (totalWeight / 1000).toFixed(1),
      }),
    }
    request(options, function (error, response) {
      if (error) throw new Error(error)
      const result = JSON.parse(response.body)
      res.status(200).json({
        status: 'success',
        message: 'Return Order Booked successfully!',
        data: result,
      })
    })
  })
})

// Assign Self shipping
exports.assignSelfShipping = catchAsync(async (req, res, next) => {
  // just update carrier as self shipping => Notify Customer
})

// ! THIS IS MOST IMPORTANT => Setup Webhook to update shipment status and send realtime mail & SMS notification

// Cancel order , Reject order => Create refund if online payment was maid and reverse coins  & Notify customer

exports.getTrackingUpdate = catchAsync(async(req, res, next) => {

  // x-api-key
  // 73278ui_832uj23i823jk12u12jyOI7732y12gfy821ugvcsexcjie98y78132hh9817

  // After successful verification of Origin as Shiprocket => UPDATE shipment_status, current_status_id, etd (estimated time of delivery), scans

  res.status(200).json({
    status: "success",
    message: "We are able to recieve update on this endpoint",
  })
})