const Customer = require('../model/customerModel')
const SMSCommunication = require('../model/sMSCommunicationsModel')
const catchAsync = require('../utils/catchAsync')
const apiFeatures = require('../utils/apiFeatures')

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = require('twilio')(accountSid, authToken)

exports.addNewCustomer = catchAsync(async (req, res, next) => {
  const newCustomer = await Customer.create({
    ...req.body,
    store: req.store._id,
    createdAt: Date.now(),
  })
  res.status(200).json({
    status: 'success',
    data: newCustomer,
    message: 'Customer added successfully!',
  })
})

exports.giveCoinsToCustomer = catchAsync(async (req, res, next) => {
  const customer = await Customer.findById(req.body.id)
  customer.coins = customer.coins*1 + req.body.coins*1
  const updatedCustomer = customer.save({
    new: true,
    validateModifiedOnly: true,
  })

  res.status(200).json({
    status: 'success',
    data: updatedCustomer,
    message: 'Coins added successfully!',
  })
})

exports.updateCustomer = catchAsync(async (req, res, next) => {
  const updatedCustomer = await Customer.findByIdAndUpdate(
    req.params.id,
    { updatedAt: Date.now(), ...req.body },
    { new: true, validateModifiedOnly: true },
  )

  res.status(200).json({
    status: 'success',
    data: updatedCustomer,
    message: 'Customer updated successfully!',
  })
})

exports.deleteCustomer = catchAsync(async (req, res, next) => {
  await Customer.findByIdAndDelete(req.params.id)
  res.status(200).json({
    status: 'success',
    message: 'Customer removed successfully!',
  })
})

exports.fetchCustomers = catchAsync(async (req, res, next) => {
  const query = Customer.find({ store: req.store._id })

  const features = new apiFeatures(query, req.query).textFilter()
  const customers = await features.query

  res.status(200).json({
    status: 'success',
    message: 'Customers found successfully!',
    data: customers,
  })
})

exports.deleteMultipleCustomers = catchAsync(async (req, res, next) => {
  for (let element of req.body.customerIds) {
    // Remove all customers included in list
    await Customer.findByIdAndDelete(element)
  }
  res.status(200).json({
    status: 'success',
    message: 'Customers removed successfully!',
  })
})

exports.importCustomers = catchAsync(async (req, res, next) => {
  // create customer by using loop
})

exports.sendSMSToCustomer = catchAsync(async (req, res, next) => {
  // Send sms and create a copy of communication in SMSCommunications

  const { message, id } = req.body

  const customer = await Customer.findById(id)

  console.log(customer, message);

//   res.status(200).json({
//     status: "success",
// message: "This is a test",
//   })

  client.messages
    .create({
      body: message,
      from: '+1 775 535 7258',
      to: customer.phone,
    })

    .then(async (message) => {
      console.log(message.sid)
      console.log(
        `Message Sent successfully to ${customer.name} on mobile ${customer.phone}.`,
      )
      await SMSCommunication.create({
        store: req.store._id,
        user: req.user._id,
        customer: id,
        message: req.body.message,
        createdAt: Date.now(),
      })
      res.status(200).json({
        status: 'success',
        message: 'SMS sent successfully!',
      })
    })
    .catch((e) => {
      console.log(e)
      console.log(
        `Failed to send SMS to ${customer.name} on mobile ${customer.phone}`,
      )
      res.status(400).json({
        status: 'error',
        message: 'Failed to send SMS, Please try again.',
      })
    })
})
