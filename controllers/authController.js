const jwt = require('jsonwebtoken')
const catchAsync = require('../utils/catchAsync')
const User = require('./../model/userModel')
const UserRequest = require('./../model/userRequestModel')
const otpGenerator = require('otp-generator')
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_KEY)

// this function will return you jwt token
const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET)

// Register user

exports.register = catchAsync(async (req, res, next) => {
  const { firstName, lastName, shopName, email, password } = req.body

  // Check if there is any account with same email => if yes then throw error

  const existingUser = await User.findOne({ email: email })

  if (existingUser) {
    res.status(200).json({
      status: 'error',
      message:
        'Email already registered on QwikShop, Please use different email.',
    })
    return
  }

  // Delete all previous account request for same email

  await UserRequest.deleteMany({ email: email })

  // Create new account request for this email

  const newUserRequest = await UserRequest.create({
    firstName,
    lastName,
    shopName,
    email,
    password,
  })

  // Generate OTP

  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  })

  // Save OTP to UserRequest (NOTE: We will implement OTP expiration after v1.0.0)

  newUserRequest.otp = otp
  newUserRequest.expiry = Date.now() + 30 * 60 * 1000 // TODO => expiration feature will be implemented in coming days

  await newUserRequest.save({ new: true, validateModifiedOnly: true }) // Save latest changes to userRequest document

  // Send OTP verification on email

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
      console.log('Verification mail sent successfully!')
      console.log('New account request created successfully!')

      res.status(201).json({
        status: 'success',
      })
    })
    .catch(async (error) => {
      console.log('Failed to send verification mail to our user.')
      console.log(
        'New account request created successfully but failed to send verification OTP',
      )

      next() // * This will pass execution to resend Email verification OTP middleware
    })
})

exports.resendEmailVerificationOTP = catchAsync(async (req, res, next) => {
  const { email } = req.body

  if (!email) {
    // throw error => email is mandatory
    res.status(400).json({
      status: 'error',
      message: 'Bad request, Please try again.',
    })
    return
  }

  // Find if there is any userAccount request existing for this email

  const userAccountRequest = await UserRequest.findOne({ email: email })

  if (!userAccountRequest) {
    // throw error => no user request found for this email
    res.status(400).json({
      status: 'error',
      message: 'No user found with this email, Please Sign up first.',
    })
    return
  }

  // Here we can create and send a new OTP

  // Generate OTP

  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  })

  // Save OTP to UserRequest (NOTE: We will implement OTP expiration after v1.0.0)

  userAccountRequest.otp = otp
  userAccountRequest.expiry = Date.now() + 30 * 60 * 1000 // TODO => expiration feature will be implemented in coming days

  await userAccountRequest.save({ new: true, validateModifiedOnly: true }) // Save latest changes to userRequest document

  // Send OTP verification on email

  const msg = {
    to: email, // Change to your recipient
    from: 'welcome@letstream.live', // Change to your verified sender
    subject: `Verify your QwikShop Account Email`,
    text: `Here is your OTP for verifying your email: ${otp}`,
    // html: WelcomeToBluemeet(newUser.firtsName),
  }

  sgMail
    .send(msg)
    .then(() => {
      console.log('Verification OTP Sent successfully!')
      res.status(200).json({
        status: 'success',
        message: 'Verification OTP sent to mail',
      })
    })
    .catch(() => {
      console.log('Failed to send verification OTP')
      res.status(400).json({
        status: 'error',
        message: 'Failed to send verification OTP to mail',
      })
    })
})

// Verify OTP for registration

exports.verifyOTPForRegistration = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body

  console.log(email, otp)

  const user = await UserRequest.findOne({ email: email }).select('+otp')

  console.log(user)

  if (!user || !otp) {
    // Bad request
    res.status(400).json({
      status: 'error',
      message: 'Bad request',
    })
    return
  }

  if (!(await user.correctOTP(otp, user.otp))) {
    // Incorrect OTP
    res.status(400).json({
      status: 'error',
      message: 'Incorrect OTP',
    })
  }

  // At this point we are sure that OTP has been successfully verified
  // Create actual user with this email and now no one can use this email again

  const newUser = await User.create({
    firstName: user.firstName,
    lastName: user.lastName,
    shopName: user.shopName,
    email: user.email,
    password: user.password,
  })

  // Destroy all userAccountRequests with this email

  await UserRequest.deleteMany({ email: email })

  // Create and send login token for this user

  const token = signToken(newUser._id)

  // TODO => Send welcome email to this user (P5)

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully!',
  })
})

// Login user

exports.loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  console.log(email, password)

  if (!email || !password) {
    res.status(400).json({
      status: 'error',
      message: 'Both email and password are required',
    })
    return
  }

  const user = await User.findOne({ email: email }).select('+password')

  if (!user || !(await user.correctPassword(password, user.password))) {
    res.status(400).json({
      status: 'error',
      message: 'Email or password is incorrect',
    })

    return
  }

  const token = signToken(user._id)

  res.status(200).json({
    status: 'success',
    token,
  })
})

// Protect

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt
  }

  if (!token) {
    return next(
      new AppError(`You are not logged in! Please log in to get access.`, 401),
    )
  }
  // 2) Verification of token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

  // 3) Check if user still exists

  const freshUser = await User.findById(decoded.id)
  if (!freshUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exists.',
        401,
      ),
    )
  }
  // 4) Check if user changed password after the token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401),
    )
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = freshUser
  next()
})

// Reset password

exports.resetPassword = catchAsync(async (req, res, next) => {
  try {
    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex')

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    })

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400))
    }
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    // Send mail to user that his/her password has been changed as per their request and to revert back if they think its a mistake

    const msg = {
      to: user.email, // Change to your recipient
      from: 'security@letstream.live', // Change to your verified sender
      subject: 'Your Password has been changed.',
      text:
        'Hi we have changed your password as requested by you. If you think its a mistake then please contact us via support room or write to us at support@letstream.live',
      html: PasswordChanged(user.firstName),
    }

    sgMail
      .send(msg)
      .then(() => {
        console.log('Password reset confirmation sent to user successfully.')
      })
      .catch((error) => {
        console.log('Falied to send confirmation mail to user.')
      })

    // 3) Update changedPasswordAt property for the user
    // 4) Log the user in, send JWT
    createSendToken(user, 200, req, res)
  } catch (error) {
    console.log(error)
  }
})
