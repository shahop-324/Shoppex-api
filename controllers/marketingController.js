const catchAsync = require('../utils/catchAsync')
const apiFeatures = require('../utils/apiFeatures')
const Marketing = require('../model/MarketingModel')
const randomstring = require('randomstring')

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_KEY)

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = require('twilio')(accountSid, authToken)

exports.createSMSCampaign = catchAsync(async (req, res, next) => {
  const newCampaign = await Marketing.create({
    store: req.store._id,
    ...req.body,
  })

  // send sms to all in the target audience list

  for (let element of newCampaign.customers) {
    client.messages
      .create({
        body: newCampaign.message,
        from: '+1 775 535 7258',
        to: element,
      })

      .then((message) => {
        console.log(message.sid)
        console.log(`Successfully sent Campaign SMS to ${element}`)
      })
      .catch((e) => {
        console.log(e)
        console.log(`Failed to send Campaign SMS to ${element}`)
      })
  }

  res.status(200).json({
    status: 'success',
    messgae: 'Campaign created and launched successfully!!',
    data: newCampaign,
  })
})

exports.createMailCampaign = catchAsync(async (req, res, next) => {
  let newCampaign = await Marketing.create({
    campaignId: `camp_${randomstring.generate({
      length: 10,
      charset: 'alphabetic',
    })}`,
    store: req.store._id,
    name: req.body.name,
    channel: 'email',
    createdAt: Date.now(),
    amount: req.body.customers.length * 1.5,
    status: 'Darft',
  })

  for (let element of req.body.customers) {
    newCampaign.customers.push(element)
  }

  await newCampaign.save({ new: true, validateModifiedOnly: true })

  res.status(200).json({
    status: 'success',
    messgae: 'Campaign created and saved as draft!',
    data: newCampaign,
  })
})

exports.launchMailCampaign = catchAsync(async (req, res, next) => {
  const campaign = await Marketing.findById(req.params.campaignId)

  for (let element of campaign) {
    const msg = {
      to: email, // Change to your recipient
      from: 'welcome@letstream.live', // Change to your verified sender
      subject: campaign.name,
      // text: `Here we can send plain text mail to our user.`,
      html: campaign.html,
    }

    sgMail
      .send(msg)
      .then(() => {
        console.log(`Campaign mail successfully sent to ${element}`)
      })
      .catch((error) => {
        console.log(error)
        console.log(`Failed to send campaign mail to ${element}`)
      })
  }

  res.status(200).json({
    status: 'success',
    message: 'Campaign launched successfully!',
  })
})

exports.sendTestEmailCampaign = catchAsync(async (req, res, next) => {
  const campaign = await Marketing.findById(req.params.campaignId)

  // Send mail

  const msg = {
    to: req.params.email, // Change to your recipient
    from: 'welcome@letstream.live', // Change to your verified sender
    subject: campaign.name,
    // text: `Hello, this is a test for sending email campaign.`,
    html: campaign.html,
  }

  sgMail
    .send(msg)
    .then(async () => {
      console.log('Campaign mail sent successfully!')

      res.status(201).json({
        status: 'success',
        message: 'Test mail sent successfully!',
      })
    })
    .catch(async (error) => {
      console.log(error)
      console.log('Failed to send test mail, Please try again.')

      res.status(400).json({
        status: 'error',
        message: 'Failed to send test mail, Please try again.',
      })
    })
})

exports.fetchCampaigns = catchAsync(async (req, res, next) => {
  const query = Marketing.find({ store: req.store._id })

  const features = new apiFeatures(query, req.query).textFilter()
  const campaigns = await features.query

  res.status(200).json({
    status: 'success',
    data: campaigns,
    message: 'Campaigns found successfully!',
  })
})


exports.updateMailCampaign = catchAsync(async(req, res, next) => {
 const updatedMailCampaign = await Marketing.findByIdAndUpdate(req.params.id, {...req.body, updatedAt: Date.now()}, {new: true, validateModifiedOnly: true});

 res.status(200).json({
   status: "success",
   message: "Email Template saved successfully!",
   data: updatedMailCampaign,
 })

})