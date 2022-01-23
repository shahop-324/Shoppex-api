const catchAsync = require('../utils/catchAsync')

exports.addTable = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { name } = req.body

  const newTable = await DiningTable.create({ store: id, name: name })

  res.status(200).json({
    status: 'success',
    data: newTable,
    message: 'New Dining Table Added successfully!',
  })
})

exports.updateTable = catchAsync(async (req, res, next) => {})

exports.addPendingOrder = catchAsync(async (req, res, next) => {
  const { tableId, id } = req.params

  const { pendingOrder } = req.body

  const tableDoc = await DiningTable.findById(tableId)

  tableDoc.pendingOrders.push(pendingOrder)

  const updatedTable = await tableDoc.save({
    new: true,
    validateModifiedOnly: true,
  })

  res.status(200).json({
    status: 'success',
    message: 'Pending order added successfully!',
    data: updatedTable,
  })
})

exports.removePendingOrder = catchAsync(async (req, res, next) => {
  const { tableId, id } = req.params

  const { servedOrder } = req.body

  const tableDoc = await DiningTable.findById(tableId)

  tableDoc.pendingOrders = tableDoc.pendingOrders.filter(
    (el) => el.toString() !== servedOrder.toString(),
  )

  const updatedTable = await tableDoc.save({
    new: true,
    validateModifiedOnly: true,
  })

  res.status(200).json({
    status: 'success',
    message: 'Order served successfully!',
    data: updatedTable,
  })
})

exports.deleteTable = catchAsync(async (req, res, next) => {
  const { tableId } = req.params

  // Check if there is any pending order then deny to delete

  const tableDoc = await DiningTable.findById(tableId)

  if (tableDoc.pendingOrders.length !== 0) {
    // There is a pending order => deny to delete and quote the reason
    res.status(400).json({
      status: 'error',
      message:
        'Unable to delete, please serve pending orders first or cancel them.',
    })
  } else {
    // No pending order on this table => Go ahead and delete it
    await DiningTable.findByIdAndDelete(tableId)

    res.status(400).json({
      status: 'success',
      message: 'Dining Table Deleted successfully!',
    })
  }
})

exports.getTables = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const tables = await DiningTable.find({ store: id })

  res.status(200).json({
    status: 'success',
    data: tables,
    message: 'Dining Tables found successfully!',
  })
})

exports.getTablesWithActiveOrders = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const tables = await DiningTable.find({ store: id })

  let activeTables = []

  for (let element of tables) {
    if (element.pendingOrders.length !== 0) {
      activeTables.push(element)
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Tables with active orders found successfully!',
    data: activeTables,
  })
})
