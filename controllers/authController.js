const catchAsync = require('../utils/catchAsync')
const User = require('./../model/userModel')
const UserRequest = require('./../model/userRequestModel')
const otpGenerator = require('otp-generator')
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_KEY)

exports.register = catchAsync(async (req, res, next) => {
  const { firstName, lastName, shopName, email, password } = req.body

  const newUserRequest = await UserRequest.create({
    firstName,
    lastName,
    shopName,
    email,
    password,
  });

  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });

  newUserRequest.otp = otp;
  newUserRequest.expiry = Date.now() + 30 * 60 * 1000;

  await newUserRequest.save({ new: true, validateModifiedOnly: true })

  const msg = {
    to: email, // Change to your recipient
    from: 'welcome@letstream.live', // Change to your verified sender
    subject: `Welcome to QwikShop`,
    text: `Hello, welcome to QwikShop. This is your OTP for verifying your email: ${otp}`,
    // html: WelcomeToBluemeet(newUser.firtsName),
  }

  sgMail
    .send(msg)
    .then(async () => {
      console.log('Verification mail sent successfully!');
    })
    .catch(async (error) => {
      console.log('Failed to send verification mail to our user.');
    });

  console.log(newUserRequest)

  res.status(201).json({
    status: 'success',
    // authySecret: newUserRequest, Create and send a secret for identification
  });
});
