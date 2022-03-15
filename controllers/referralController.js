const catchAsync = require('../utils/catchAsync')
const apiFeatures = require('../utils/apiFeatures')
const Referral = require('../model/referralModel')
const ReferralPurchases = require('../model/referralPurchaseModel')

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

exports.fetchReferralPurchases = catchAsync(async (req, res, next) => {
  const purchases = await ReferralPurchases.find({ store: req.store._id })
    .populate('customer')
    .populate('order')

  console.log(purchases)

  res.status(200).json({
    status: 'success',
    data: purchases,
    message: 'Purchases found successfully!',
  })
})

exports.updateReferralPurchase = catchAsync(async (req, res, next) => {
  const updatedPurchase = await ReferralPurchases.findByIdAndUpdate(
    req.params.id,
    { paid: true },
    { validateModifiedOnly: true, new: true },
  )

  res.status(200).json({
    status: 'success',
    data: updatedPurchase,
    message: 'Marked as Paid successfully!',
  })
})

exports.bulkImportReferrals = catchAsync(async(req, res, next) => {
  const storeId = req.store._id;
  if (!storeId) {
    // Store not found => through exception
    res.status(400).json({
      status: "error",
      message: "Bad request, session expired. Please login again and try!",
    });
  } else {
// Store found => proceed
mRows = req.body.rows.map((e) => {
  delete e.id;
  return e;
});
let newReferrals = [];
for (let element of mRows) {
  const newRef = await Referral.create({
    store: storeId,
    ...element,
  });
  newReferrals.push(newRef);
}

res.status(200).json({
  status: "success",
  data: newReferrals,
  message: "Referrals imported successfully!",
});
  }
});

exports.bulkUpdateReferrals = catchAsync(async(req, res, next) => {
  const storeId = req.store._id;
  if (!storeId) {
    // Store not found => through exception
    res.status(400).json({
      status: "error",
      message: "Bad request, session expired. Please login again and try!",
    });
  } else {
    // Store found => proceed
    for (let element of req.body.rows) {
      // element is the product with its _id
      await Referral.findByIdAndUpdate(
        element._id,
        {
          ...element,
        },
        { new: true, validateModifiedOnly: true }
      );
    }
    // Find all referrals of this store and send as response
    const referrals = await Referral.find({ store: storeId });
    res.status(200).json({
      status: "success",
      data: referrals,
      message: "Referrals updated successfully!",
    });
  }
});