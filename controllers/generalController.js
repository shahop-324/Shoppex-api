const catchAsync = require('../utils/catchAsync')
const StoreSubName = require('../model/storeSubNameModel')

exports.getSubnames = catchAsync(async (req, res, next) => {
  try{
    const subnames = await StoreSubName.find({})

    const data = subnames.map((el) => el.subName)
  
    res.status(200).json({
      status: 'success',
      data: data,
      message: 'Successfully found subnames',
    });
  }
  catch(error) {
    console.log(error);
    res.status(400).json({
      staus: 'error',
      message: error,
    })
  }
  
});

exports.sendSMSMessage = catchAsync(async (req, res, next) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const client = require('twilio')(accountSid, authToken)

  client.messages
    .create({
      body: `But I can freely customise this message, like including a link https://www.google.com`,
      from: '+16104210065',
      to: '+919770668454',
    })
    .then((message) => {
      console.log(message.sid)
      res.status(200).json({
        status: 'success',
        sid: message.sid,
      })
    })
});