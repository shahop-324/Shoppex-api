const catchAsync = require('../utils/catchAsync')

exports.createSMSCampaign = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { name, message, mobileNumbers } = req.body

  const newSMSCampaign = await SMSCampaign.create({
    store: id,
    name,
    message,
    mobileNumbers,
  })

  //    Send SMS campaign

  res.status(200).json({
    status: 'success',
    message: 'SMS campaign lauched successfully!',
    data: newSMSCampaign,
  })
})
exports.createWhatsAppCampaign = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { name, message, mobileNumbers } = req.body

  const newWhatsAppCampaign = await WhatsAppCampaign.create({
    store: id,
    name,
    message,
    mobileNumbers,
  })

  // Send WhatsApp campaign

  res.status(200).json({
    status: 'success',
    message: 'WhatsApp campaign lauched successfully!',
    data: newWhatsAppCampaign,
  })
})

exports.createGoogleAdsCampaign = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const {
    text1,
    text2,
    text3,
    description,
    keywords,
    gender,
    minAge,
    maxAge,
    locations,
    minRange,
    maxRange,
    dailyBudget,
    adDuration,
  } = req.body

  const newGoogleAdsCampaign = await GoogleAdsCampaign.create({
    store: id,
    text1,
    text2,
    text3,
    description,
    keywords,
    gender,
    minAge,
    maxAge,
    locations,
    minRange,
    maxRange,
    dailyBudget,
    adDuration,
    status: 'Under review',
  })

  // Create Google Ad Campaign

  res.status(200).json({
    status: 'success',
    message: 'Google Ad campaign lauched successfully!',
    data: newGoogleAdsCampaign,
  })
})

exports.createFacebookAdsCampaign = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const {
    headline,
    files,
    websiteURL,
    buttonLabel,
    gender,
    minAge,
    maxAge,
    locations,
    minRange,
    maxRange,
    dailyBudget,
    adDuration,
    facebook,
    messenger,
    instagram,
  } = req.body

  const newFacebookAdsCampaign = await FacebookAdsCampaign.create({
    store: id,
    headline,
    files,
    websiteURL,
    buttonLabel,
    gender,
    minAge,
    maxAge,
    locations,
    minRange,
    maxRange,
    dailyBudget,
    adDuration,
    facebook,
    messenger,
    instagram,
    status: 'Under review',
  })

  // Create Facebook Ad Campaign

  res.status(200).json({
    status: 'success',
    message: 'Facebook Ad campaign lauched successfully!',
    data: newFacebookAdsCampaign,
  })
})

// TODO Email Marketing

exports.getCapmaigns = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const smsCampaigns = await SMSCampaign.find({ store: id })
  const whatsAppCampaigns = await WhatsAppCampaign.find({ store: id })
  const googleAdCampaigns = await GoogleAdsCampaign.find({ store: id })
  const facebookAdCampaigns = await FacebookAdsCampaign.find({ store: id })

  res.status(200).json({
    status: 'success',
    data: {
      smsCampaigns,
      whatsAppCampaigns,
      googleAdCampaigns,
      facebookAdCampaigns,
    },
    message: 'Marketing Campaigns found successfully!',
  })
})

exports.pauseGoogleAdsCampaign = catchAsync(async (req, res, next) => {
  const { id, googleCampaignId } = req.body

  // TODO Ask Google to pause the ad
  // Find and pause google ad

  const updatedGoogleCampaign = await GoogleAdsCampaign.findByIdAndUpdate(
    googleCampaignId,
    { status: 'Paused' },
    { new: true, validateModifiedOnly: true },
  )

  res.status(200).json({
    status: 'success',
    data: updatedGoogleCampaign,
    message: 'Google Ad campaign paused successfully!',
  })
})

exports.puaseFacebookAdsCampaign = catchAsync(async (req, res, next) => {
  const { id, facebookCampaignId } = req.body

  // TODO Ask Facebook to pause the ad
  // Find and pause facebook ad

  const updatedFacebookCampaign = await FacebookAdsCampaign.findByIdAndUpdate(
    facebookCampaignId,
    { status: 'Paused' },
    { new: true, validateModifiedOnly: true },
  )

  res.status(200).json({
    status: 'success',
    data: updatedFacebookCampaign,
    message: 'Facebook Ad campaign paused successfully!',
  })
})
