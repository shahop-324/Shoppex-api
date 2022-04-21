const catchAsync = require('../utils/catchAsync')
const apiFeatures = require('../utils/apiFeatures')
const Marketing = require('../model/marketingModel')
const randomstring = require('randomstring')
const Customer = require('../model/customerModel')
const WalletTransaction = require('../model/walletTransactionModel')

const WalletDebited = require('../Template/Mail/WalletDebited');

const sgMail = require('@sendgrid/mail')
const Store = require('../model/storeModel')
sgMail.setApiKey(process.env.SENDGRID_KEY)

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = require('twilio')(accountSid, authToken)

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
    status: 'Draft',
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

exports.createSMSCampaign = catchAsync(async (req, res, next) => {
  try{
    let newCampaign = await Marketing.create({
      campaignId: `camp_${randomstring.generate({
        length: 10,
        charset: 'alphabetic',
      })}`,
      store: req.store._id,
      name: req.body.name,
      channel: 'sms',
      message: req.body.message,
      createdAt: Date.now(),
      amount: req.body.customers.length * 1.5,
      status: 'Draft',
    })
  
    for (let element of req.body.customers) {
      newCampaign.customers.push(element)
    }
  
    await newCampaign.save({ new: true, validateModifiedOnly: true })
  
    res.status(200).json({
      status: 'success',
      message: 'Campaign created and saved as draft!',
      data: newCampaign,
    })
  }
  catch(error) {
    console.log(error);
  }
  
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

exports.updateMailCampaign = catchAsync(async (req, res, next) => {
  const updatedMailCampaign = await Marketing.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedAt: Date.now() },
    { new: true, validateModifiedOnly: true },
  )

  res.status(200).json({
    status: 'success',
    message: 'Email Template saved successfully!',
    data: updatedMailCampaign,
  })
})

exports.updateSMSCampaign = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const updatedSMSCampaign = await Marketing.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedAt: Date.now() },
    { new: true, validateModifiedOnly: true },
  )

  res.status(200).json({
    status: 'success',
    message: 'SMS campaign updated successfully!',
    data: updatedSMSCampaign,
  })
})

exports.sendEmailCampaign = catchAsync(async (req, res, next) => {
  // Deduct Money from store wallet and send email to every customer and do error handling

  const campaignDoc = await Marketing.findById(req.params.id)

  const store = await Store.findById(req.store._id)
  store.walletAmount = store.walletAmount - campaignDoc.amount

  const updatedStore = await store.save({
    new: true,
    validateModifiedOnly: true,
  })

  // Create a wallet transaction => type => Debit => amount => campaignDoc.amount => transactionId => generated => reason=> Email Campaign => timestamp => Date.now()

  const newTransactionDoc = await WalletTransaction.create({
    transactionId: `pay_${randomstring.generate({
      length: 10,
      charset: 'alphabetic',
    })}`,
    type: 'Debit',
    amount: campaignDoc.amount,
    reason: 'Email Campaign',
    timestamp: Date.now(),
    store: req.store._id,
  })

  // ! storeName, amount, reason, transactionId

  const msg = {
    to: updatedStore.emailAddress, // Change to your recipient
    from: 'payments@qwikshop.online', // Change to your verified sender
    subject: 'Your QwikShop Store Wallet has been Debited.',
    // text:
    //   'Hi we have changed your password as requested by you. If you think its a mistake then please contact us via support room or write to us at support@qwikshop.online',
    html: WalletDebited(store.storeName, campaignDoc.amount,'Email Campaign', newTransactionDoc.transactionId),
  }

  sgMail
  .send(msg)
  .then(() => {
    console.log('Wallet Debited Notification sent successfully!')
  })
  .catch((error) => {
    console.log('Falied to send wallet debited notification.')
  })

  campaignDoc.status = 'Sent'
  const updatedCampaign = await campaignDoc.save({
    new: true,
    validateModifiedOnly: true,
  })

  // Send email with error handling to all customers in list

  const emailHTML = campaignDoc.html.replace(/&lt;/g, '<').replace(/&gt;/g, '>')

  campaignDoc.customers.forEach(async (element) => {
    const customerDoc = await Customer.findById(element)

    if (customerDoc.email) {
      //  Send email here

      const msg = {
        to: customerDoc.email, // Change to your recipient
        from: 'marketing@qwikshop.online', // Change to your verified sender
        subject: campaignDoc.name,
        // text: `Here we can send plain text mail to our user.`,
        html: emailHTML,
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
  })

  // Send updated marketing doc to client

  res.status(200).json({
    status: 'success',
    message: 'Email Campaign Delivered successfully!',
    data: updatedCampaign,
    store: updatedStore,
  })
})

exports.sendSMSCampaign = catchAsync(async (req, res, next) => {
  // Deduct Money from store wallet and send email to every customer and do error handling

  const campaignDoc = await Marketing.findById(req.params.id)

  const store = await Store.findById(req.store._id)
  store.walletAmount = store.walletAmount - campaignDoc.amount

  const updatedStore = await store.save({
    new: true,
    validateModifiedOnly: true,
  })

  // Create a wallet transaction => type => Debit => amount => campaignDoc.amount => transactionId => generated => reason=> Email Campaign => timestamp => Date.now()

 const newTransactionDoc = await WalletTransaction.create({
    transactionId: `pay_${randomstring.generate({
      length: 10,
      charset: 'alphabetic',
    })}`,
    type: 'Debit',
    amount: campaignDoc.amount,
    reason: 'SMS Campaign',
    timestamp: Date.now(),
    store: req.store._id,
  })

  const msg = {
    to: updatedStore.emailAddress, // Change to your recipient
    from: 'payments@qwikshop.online', // Change to your verified sender
    subject: 'Your QwikShop Store Wallet has been Debited.',
    // text:
    //   'Hi we have changed your password as requested by you. If you think its a mistake then please contact us via support room or write to us at support@qwikshop.online',
    html: WalletDebited(store.storeName, campaignDoc.amount,'SMS Campaign', newTransactionDoc.transactionId),
  }

  sgMail
  .send(msg)
  .then(() => {
    console.log('Wallet Debited Notification sent successfully!')
  })
  .catch((error) => {
    console.log('Falied to send wallet debited notification.')
  })

  campaignDoc.status = 'Sent'
  const updatedCampaign = await campaignDoc.save({
    new: true,
    validateModifiedOnly: true,
  })

  // Send SMS with error handling to all customers in list

  const contacts = []

  campaignDoc.customers.forEach(async (element) => {
    const customerDoc = await Customer.findById(element)

    if (customerDoc.phone && !contacts.includes(customerDoc.phone)) {
      // Send SMS here

      client.messages
        .create({
          body: campaignDoc.message,
          from: '+1 775 535 7258',
          to: customerDoc.phone,
        })

        .then((message) => {
          console.log(message.sid)
          console.log(`Successfully sent Campaign SMS to ${element}`)
          contacts.push(customerDoc.phone)
        })
        .catch((e) => {
          console.log(e)
          console.log(`Failed to send Campaign SMS to ${element}`)
        })
    }
  })

  // Send updated marketing doc to client

  res.status(200).json({
    status: 'success',
    message: 'SMS Campaign Delivered successfully!',
    data: updatedCampaign,
    store: updatedStore,
  })
})
