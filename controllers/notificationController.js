const catchAsync = require('../utils/catchAsync')

exports.sendMessage = catchAsync(async (req, res, next) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const client = require('twilio')(accountSid, authToken)

  client.messages
    .create({
      body: 'Hi Dino, This is a test SMS from Shoppex API. Your OTP is 508978',
      from: "+1 610 421 0065",
      to: '+919770668454',
    })

    .then((message) => {
      console.log(message.sid)
      res.status(200).json({ status: 'success' })
    })
    .catch((e) => {
      console.log(e)
      res.status(400).json({ status: 'error' })
    })
})
