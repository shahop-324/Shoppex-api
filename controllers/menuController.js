const catchAsync = require('../utils/catchAsync')
const Menu = require('../model/MenuModel')

exports.createMenuItem = catchAsync(async (req, res, next) => {
  const newMenuItem = await Menu.create({
    ...req.body,
    store: req.store._id,
    createdAt: Date.now(),
  })

  res.status(200).json({
    status: 'success',
    message: 'Menu Created Successfully!',
    data: newMenuItem,
  })
})
exports.updateMenuItem = catchAsync(async (req, res, next) => {
  const updatedMenuItem = await Menu.findByIdAndUpdate(
    req.params.menuId,
    { ...req.body, updatedAt: Date.now() },
    { new: true, validateModifiedOnly: true },
  )

  res.status(200).json({
    status: 'success',
    message: 'Menu Updated Successfully!',
    data: updatedMenuItem,
  })
})
exports.deleteMenuItem = catchAsync(async (req, res, next) => {
  await Menu.findByIdAndDelete(req.params.menuId)
  res.status(200).json({
    status: 'success',
    message: 'Menu Deleted Successfully!',
  })
})
exports.getMenu = catchAsync(async (req, res, next) => {
  const menuItems = await Menu.find({ store: req.store._id })
  res.status(200).json({
    status: 'success',
    message: 'Menu found Successfully!',
    data: menuItems,
  })
})

// Create Model Fields => Write logic for CRUD
