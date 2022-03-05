const jwt = require('jsonwebtoken')
const catchAsync = require('../utils/catchAsync')
const User = require('./../model/userModel')
const Store = require('../model/storeModel')
const UserRequest = require('./../model/userRequestModel')
const bcrypt = require('bcryptjs')
const { promisify } = require('util')
const crypto = require('crypto')
const otpGenerator = require('otp-generator')
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_KEY)
const StoreSubName = require('../model/storeSubNameModel')
const slugify = require('slugify')
const { nanoid } = require('nanoid')
const Admin = require('../model/adminModel')
const AppError = require('../utils/appError')
const Welcome = require('../Template/Mail/Welcome')
const ResetPassword = require('../Template/Mail/ResetPassword')
const PasswordChanged = require('../Template/Mail/PasswordChanged')
const VerifyOTP = require('../Template/Mail/VerifyOTP')

// this function will return you jwt token
const signToken = (userId, storeId) =>
  jwt.sign({ userId, storeId }, process.env.JWT_SECRET)

const signAdminToken = (adminId) =>
  jwt.sign({ adminId }, process.env.JWT_SECRET)

// Register user

exports.register = catchAsync(async (req, res, next) => {
  const {
    firstName,
    lastName,
    shopName,
    email,
    password,
    referralCode,
  } = req.body

  // Check if there is any account with same email => if yes then throw error

  const existingUser = await User.findOne({ email: email })

  if (existingUser) {
    res.status(400).json({
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
    referralCode,
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
    from: 'welcome@qwikshop.online', // Change to your verified sender
    subject: `Welcome to QwikShop`,
    text: `Hello, welcome to QwikShop. This is your OTP for verifying your email: ${otp}`,
    html: VerifyOTP(newUserRequest.firstName, otp),
  }

  sgMail
    .send(msg)
    .then(async () => {
      console.log('Verification mail sent successfully!')
      console.log('New account request created successfully!')

      res.status(201).json({
        status: 'success',
        message: 'Please confirm your email address using OTP sent.',
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
    from: 'welcome@qwikshop.online', // Change to your verified sender
    subject: `Verify your QwikShop Account Email`,
    text: `Here is your OTP for verifying your email: ${otp}`,
    html: VerifyOTP(userAccountRequest.firstName, otp),
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
  try {
    const { email, otp } = req.body

    console.log(email, otp)

    const user = await UserRequest.findOne({ email: email }).select('+otp')

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
      return;
    }

    // At this point we are sure that OTP has been successfully verified
    // Create actual user with this email and now no one can use this email again

    const newUser = await User.create({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      phone: user.phone,
      refCode: user.referralCode,
    })

    // ! Must Check who referred this user and keep track of referredBy referredUsers and upgradedByRefUsers
    let referrer

    if (user.referralCode) {
      referrer = await User.findOne({ referralCode: user.referralCode })
      if (referrer) {
        //
        referrer.referredUsers.push(newUser._id)
        await referrer.save({ new: true, validateModifiedOnly: true })

        newUser.referredBy = referrer._id
        await newUser.save({ new: true, validateModifiedOnly: true })
      }
    }

    // ! Must check that if there is any pending invitation for this member using email then add to that store

    // ** Add this user as admin to its own store which is being created DONE

    // Create new store with given shopName and assign it to user

    const newStore = await Store.create({
      storeName: user.shopName,
    })

    newStore.team.push({
      name: `${newUser.firstName} ${newUser.lastName}`,
      email: newUser.email,
      phone: newUser.phone,
      role: 'Admin',
      addedAt: Date.now(),
      permissions: [
        'Order',
        'Catalouge',
        'Delivery',
        'Customer',
        'Dining',
        'Marketing',
        'Payment',
        'Discount',
        'Manage',
        'Design',
        'Integration',
        'Reviews',
        'Reports',
      ],
    })

    await newStore.save({ new: true, validateModifiedOnly: true })

    // Create a subname for store and create a subname doc for this store

    const newSubNameDoc = await StoreSubName.create({
      store: newStore._id,
      createdAt: Date.now(),
    })

    // Find available sub-name

    let slugName = slugify(user.shopName.toLowerCase())
    let alternateSubname = nanoid()
    let isAvailable = true

    const subNameDocs = await StoreSubName.find({})

    for (let element of subNameDocs) {
      if (element.subName === slugName) {
        isAvailable = false
      }
    }

    if (isAvailable) {
      newSubNameDoc.subName = slugName
      newStore.subName = slugName
    } else {
      newSubNameDoc.subName = alternateSubname
      newStore.subName = alternateSubname
    }

    newUser.stores.push(newStore._id)
    // save store, user and subname doc

    let updatedUser = await newUser.save({
      new: true,
      validateModifiedOnly: true,
    })

    updatedUser = await User.findById(updatedUser._id).populate(
      'stores',
      'storeName logo _id',
    )

    await newSubNameDoc.save({ new: true, validateModifiedOnly: true })
    const updatedStore = await newStore.save({
      new: true,
      validateModifiedOnly: true,
    })

    // Destroy all userAccountRequests with this email
    await UserRequest.deleteMany({ email: email })

    // Create and send login token for this user
    const token = signToken(newUser._id, newUser.stores[0])

    console.log(token)

    // TODO => Send welcome email to this user (P5)

    // Send OTP verification on email

    const msg = {
      to: newUser.email, // Change to your recipient
      from: 'welcome@qwikshop.online', // Change to your verified sender
      subject: `Welcome to QwikShop`,
      html: Welcome(newUser.firstName),
    }

    sgMail
      .send(msg)
      .then(() => {
        console.log('Welcome Mail Sent successfully!')
      })
      .catch(() => {
        console.log('Failed to send Welcome mail.')
      })

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully!',
      token,
      user: updatedUser,
      store: updatedStore,
      permissions: [
        'Order',
        'Catalouge',
        'Delivery',
        'Customer',
        'Dining',
        'Marketing',
        'Payment',
        'Discount',
        'Manage',
        'Design',
        'Integration',
        'Reviews',
        'Questions',
        'Referral',
        'Wallet',
        'Reports',
      ],
    })
  } catch (error) {
    console.log(error)
  }
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

  const user = await User.findOne({ email: email })
    .select('+password')
    .populate('stores', 'storeName logo _id')

  if (!user || !(await user.correctPassword(password, user.password))) {
    res.status(400).json({
      status: 'error',
      message: 'Email or password is incorrect',
    })

    return
  }

  //  Find user permissions by checking if user is in store team members => if yes then get permissions from that else he/she is the admin
  // Send the first store user is part of as store doc

  const store = await Store.findById(user.stores[0])

  const storeId = user.stores[0]._id

  console.log(storeId)

  const token = signToken(user._id, storeId)

  console.log(token)

  res.status(200).json({
    status: 'success',
    message: 'Logged in successfully!',
    token,
    store,
    user,
    permissions: [
      'Order',
      'Catalouge',
      'Delivery',
      'Customer',
      'Dining',
      'Marketing',
      'Payment',
      'Discount',
      'Manage',
      'Design',
      'Integration',
      'Reviews',
      'Questions',
      'Referral',
      'Wallet',
      'Reports',
    ],
  })
})

// Login Admin

exports.loginAdmin = catchAsync(async (req, res, next) => {
  try {
    const { email, password } = req.body

    console.log(email, password)

    if (!email || !password) {
      res.status(400).json({
        status: 'error',
        message: 'Both email and password are required',
      })
      return
    }

    const admin = await Admin.findOne({ email: email }).select('+password')

    if (!admin || !(password === admin.password)) {
      res.status(400).json({
        status: 'error',
        message: 'Email or password is incorrect',
      })

      return
    }

    const token = signAdminToken(admin._id)

    res.status(200).json({
      status: 'success',
      message: 'Logged in successfully!',
      token,
      admin,
    })
  } catch (error) {
    console.log(error)
  }
})

// Protect Admin

exports.protectAdmin = catchAsync(async (req, res, next) => {
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

  // 3) Check if user & store still exists
  const freshAdmin = await Admin.findById(decoded.adminId)

  if (!freshAdmin) {
    return next(
      new AppError(
        'The admin belonging to this token does no longer exists.',
        401,
      ),
    )
  }
  // 4) Check if user changed password after the token was issued
  if (freshAdmin.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'This Admin has recently changed password! Please log in again.',
        401,
      ),
    )
  }

  // * ACCESS GRANTED
  // GRANT ACCESS TO PROTECTED ROUTE
  req.admin = freshAdmin
  next()
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

  // 3) Check if user & store still exists
  const freshUser = await User.findById(decoded.userId)
  const freshStore = await Store.findById(decoded.storeId)
  if (!freshUser || !freshStore) {
    return next(
      new AppError(
        'The user or store belonging to this token does no longer exists.',
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
  req.store = freshStore
  next()
})

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email })

  if (!user) {
    return next(
      new AppError(
        'There is no user with email address or you signed up with google.',
        404,
      ),
    )
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken()
  await user.save({ validateBeforeSave: false })

  // 3) Send it to user's email
  try {
    const resetURL = `https://app.qwikshop.online/auth/update-password/?token=${resetToken}`
    // const resetURL = `http://localhost:4000/auth/update-password/?token=${resetToken}`

    // Send Grid is implemented here

    const msg = {
      to: user.email, // Change to your recipient
      from: 'security@qwikshop.online', // Change to your verified sender
      subject: 'Your QwikShop Password Reset Link',
      // text: `use this link to reset your password. This link is valid for only 10 min ${resetURL}`,
      html: ResetPassword(user.firstName, resetURL),
    }

    sgMail
      .send(msg)
      .then(() => {
        res.status(200).json({
          status: 'success',
          message: 'Token sent to email!',
        })
      })
      .catch((error) => {})
  } catch (err) {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({ validateBeforeSave: false })

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500,
    )
  }
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
    console.log(req.body)
    user.password = await bcrypt.hash(req.body.new_pass, 12)
    user.passwordConfirm = await bcrypt.hash(req.body.pass_confirm, 12)
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    // Send mail to user that his/her password has been changed as per their request and to revert back if they think its a mistake

    const msg = {
      to: user.email, // Change to your recipient
      from: 'security@qwikshop.online', // Change to your verified sender
      subject: 'Alert, Your QwikShop Password has been changed.',
      // text:
      //   'Hi we have changed your password as requested by you. If you think its a mistake then please contact us via support room or write to us at support@qwikshop.online',
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

    // DO THIS ONLY

    const token = signToken(user._id, user.stores[0]._id)

    console.log(token)

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully!',
      token,
      store: user.stores[0],
      user,
      permissions: [
        'Order',
        'Catalouge',
        'Delivery',
        'Customer',
        'Dining',
        'Marketing',
        'Payment',
        'Discount',
        'Manage',
        'Design',
        'Integration',
        'Reviews',
        'Questions',
        'Referral',
        'Wallet',
        'Reports',
      ],
    })
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Failed to change password, Please try again',
    })
    console.log(error)
  }
})

exports.updatePassword = catchAsync(async (req, res, next) => {
  console.log(req.body)
  // 1) Get user from collection
  const user = await User.findById(req.user._id).select('+password')

  // 2) Check if POSTED current password is correct
  if (!(await user.correctPassword(req.body.oldPass, user.password))) {
    res.status(400).json({
      status: 'Failed',
      message: 'Your current password is wrong',
      wrongPassword: true,
    })

    return
  } else {
    // 3) If so, update password
    user.password = await bcrypt.hash(req.body.pass, 12)
    user.passwordConfirm = await bcrypt.hash(req.body.passConfirm, 12)
    user.passwordChangedAt = Date.now()
    await user.save()
    // User.findByIdAndUpdate will NOT work as intended!

    // 4) Log user in, send JWT
    const token = signToken(req.user._id, req.store._id)
    console.log(token)

    // Send email to this user's registered email informing about current password change

    res.status(200).json({
      status: 'success',
      token: token,
      message: 'Password changed successfully!',
    })
  }
})
