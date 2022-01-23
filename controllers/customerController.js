const Customer = require('../model/CustomerModel')
const catchAsync = require('../utils/catchAsync')

exports.addCustomer = catchAsync(async (req, res, next) => {
  const { storeId, name, phone, city } = req.body

  const newCustomer = await Customer.create({
    store: storeId,
    name,
    phone,
    city,
  })

  res.status(200).json({
    status: 'success',
    message: 'New Customer added successfully!',
    data: newCustomer,
  })
})

exports.updateCustomer = catchAsync(async (req, res, next) => {
  const { storeId, customerId, name, phone, city } = req.body
  const updatedCustomer = await Customer.findByIdAndUpdate(
    customerId,
    {
      store: storeId,
      name,
      phone,
      city,
    },
    { new: true, validateModifiedOnly: true },
  )

  res.status(200).json({
    status: 'success',
    message: 'Customer updated successfully!',
    data: updatedCustomer,
  })
})

exports.getCustomers = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const customers = await Customer.find({ store: id })

  res.status(200).json({
    status: 'success',
    message: 'Customers found successfully!',
    data: customers,
  })
})