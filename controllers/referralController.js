const catchAsync = require('../utils/catchAsync')
const apiFeatures = require('../utils/apiFeatures')
const Referral = require('../model/referralModel')

exports.fetchReferrals = catchAsync(async (req, res, next) => {
  const query = Referral.find({ store: req.store._id })

  const features = new apiFeatures(query, req.query).textFilter()
  const referrals = await features.query

  res.status(200).json({
    status: 'success',
    message: 'Referrals found successfully!',
    data: referrals,
  })
})

exports.addNewReferral = catchAsync(async (req, res, next) => {
  const newReferral = await Referral.create({
    ...req.body,
    store: req.store._id,
  })

  // TODO Inform this referrer via whatsapp and email that this store has added them as a referrer

  res.status(200).json({
    status: 'success',
    message: 'New Referrer Created successfully!',
    data: newReferral,
  })
})

exports.editReferral = catchAsync(async (req, res, next) => {
  const updatedReferral = await Referral.findByIdAndUpdate(
    req.params.id,
    { ...req.body },
    { new: true, validateModifiedOnly: true },
  )

  //    TODO Inform the referrer about this updated

  res.status(200).json({
    status: 'success',
    message: 'Referrer updated successfully!',
    data: updatedReferral,
  })
})

exports.deleteReferral = catchAsync(async (req, res, next) => {
  await Referral.findByIdAndDelete(req.params.id)

  // TODO Update this Referrer that he/she has been removed via mail, sms and whatsApp

  res.status(200).json({
    status: 'success',
    message: 'Referrer Removed Successfully!',
  })
})

exports.deleteMultipleReferral = catchAsync(async (req, res, next) => {
  for (let element of req.body.ids) {
    await Referral.findByIdAndDelete(element)
    // TODO Update this Referrer that he/she has been removed via mail, sms and whatsApp
  }
  res.status(200).json({
    status: 'success',
    message: 'Referrers Removed Successfully!',
  })
})