const axios = require('axios')
const qs = require('query-string')
const morgan = require('morgan')
const express = require('express')
const helmet = require('helmet')
const mongosanitize = require('express-mongo-sanitize')
const bodyParser = require('body-parser')
const xss = require('xss-clean')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const session = require('cookie-session')
var request = require('superagent')
const querystring = require('querystring')
const { promisify } = require('util')
const Mailchimp = require('./model/mailchimpModel')
const Store = require('./model/storeModel')

const MAILCHIMP_CLIENT_ID = '919814706970'
const MAILCHIMP_CLIENT_SECRET =
  '3837302297576b7845b5ced8bd4691bb69ac7b8c5f90645887'

const OAUTH_CALLBACK = `https://app.qwikshop.online/connect-mailchimp`

const globalErrorHandler = require('./controllers/errController')
const catchAsync = require('./utils/catchAsync')

// Import routes

const authRoutes = require('./route/authRoutes')
const productRoutes = require('./route/productRoutes')
const notificationRoutes = require('./route/notificationRoutes')
const storeRoutes = require('./route/storeRoutes')
const userRoutes = require('./route/userRoutes')
const orderRoutes = require('./route/orderRoutes')
const generalRoutes = require('./route/generalRoutes')
const categoryRoutes = require('./route/categoryRoutes')
const subCategoryRoutes = require('./route/subCategoryRoutes')
const deliveryRoutes = require('./route/deliveryRoutes')
const discountRoutes = require('./route/discountRoutes')
const storePagesRoutes = require('./route/storePagesRoutes')
const referralRoutes = require('./route/referralRoutes')
const customerRoutes = require('./route/customerRoutes')
const reviewRoutes = require('./route/reviewRoutes')
const questionRoutes = require('./route/questionRoutes')
const marketingRoutes = require('./route/marketingRoutes')
const divisionRoutes = require('./route/divisionRoutes')
const razorpayRoutes = require('./route/razorpayRoutes')
const menuRoutes = require('./route/menuRoutes')
const transactionRoutes = require('./route/transactionRoutes')
const walletRoutes = require('./route/walletRoutes')
const adminRoutes = require('./route/adminRoutes')
const payoutRoutes = require("./route/payoutRoutes");
const refundRoutes = require("./route/refundRoutes");
const googleRoutes = require('./route/googleRoutes');
const mobileRoutes = require('./route/mobileRoutes');

const { application } = require('express')

const app = express()

app.use(
  cors({
    origin: [
      'https://127.0.0.1:3000',
      'https://127.0.0.1:3030',
      'http://127.0.0.1:3000',
      'http://localhost:3000',
      'http://localhost:3030',
      'https://127.0.0.1:4000',
      'http://127.0.0.1:4000',
      'http://localhost:4000',
      'https://zapier.com',
      'https://www.zapier.com',
      'https://www.qwikshop.online',
      'https://www.app.qwikshop.online',
      'https://qwikshop.online',
      'https://app.qwikshop.online',
      'https://www.admin.qwikshop.online',
      'https://admin.qwikshop.online',
      'https://app.shiprocket.in',
      'https://api.shiprocket.in',
      'https://www.app.shiprocket.in',
      'https://www.api.shiprocket.in',
      'https://shiprocket.in',
      'https://www.shiprocket.in'
    ],
    methods: ['GET', 'PATCH', 'POST', 'DELETE', 'PUT'],
    credentials: true,
  }),
)

app.use(cookieParser())

// Use JSON parser for all non-webhook routes
app.use(
  express.json({
    verify: (req, res, buf) => {
      const url = req.originalUrl
      if (
        url.startsWith('/api-eureka/eureka/v1/stripe/eventTicketPurchased') ||
        url.startsWith('/api-eureka/eureka/v1/stripe/eventPurchaseFailed')
      ) {
        req.rawBody = buf.toString()
      }
    },
  }),
)

// Setup express response and body parser configurations
app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(
  session({
    secret: 'keyboard cat',
    proxy: true,
    resave: true,
    saveUnintialized: true,
    cookie: {
      secure: false,
    },
  }),
)

app.use(helmet())

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.use(express.json({ limit: '10kb' }))

app.use(
  express.urlencoded({
    extended: true,
  }),
)

app.use(mongosanitize())

app.use(xss())

// api.shoppex.in/v1/auth/registerUser (POST);
app.use('/v1/general', generalRoutes)
app.use('/v1/auth', authRoutes)
app.use('/v1/product', productRoutes)
app.use('/v1/notification', notificationRoutes)
app.use('/v1/store', storeRoutes)
app.use('/v1/user', userRoutes)
app.use('/v1/order', orderRoutes)
app.use('/v1/category', categoryRoutes)
app.use('/v1/subCategory', subCategoryRoutes)
app.use('/v1/delivery', deliveryRoutes)
app.use('/v1/discount', discountRoutes)
app.use('/v1/pages', storePagesRoutes)
app.use('/v1/referral', referralRoutes)
app.use('/v1/customer', customerRoutes)
app.use('/v1/review', reviewRoutes)
app.use('/v1/questions', questionRoutes)
app.use('/v1/marketing', marketingRoutes)
app.use('/v1/division', divisionRoutes)
app.use('/v1/razorpay', razorpayRoutes)
app.use('/v1/menu', menuRoutes)
app.use('/v1/wallet', walletRoutes)
app.use('/v1/transaction', transactionRoutes)
app.use('/v1/admin', adminRoutes)
app.use('/v1/payout', payoutRoutes);
app.use('/v1/refund', refundRoutes);
app.use('/v1/google', googleRoutes);
app.use('/v1/mobile', mobileRoutes);

app.get('/v1/auth/mailchimp', (req, res, next) => {
  res.redirect(
    `https://login.mailchimp.com/oauth2/authorize?${querystring.stringify({
      response_type: 'code',
      client_id: MAILCHIMP_CLIENT_ID,
      redirect_uri: OAUTH_CALLBACK,
    })}`,
  )
})

app.post('/v1/oauth/mailchimp/callback', (req, res, next) => {
  try {
    const storeId = req.body.storeId

    console.log(storeId, 'This is store Id')

    let accessToken = null
    const config = {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
    const parameters = {
      grant_type: 'authorization_code',
      code: req.body.code,
      client_id: MAILCHIMP_CLIENT_ID,
      client_secret: MAILCHIMP_CLIENT_SECRET,
      redirect_uri: OAUTH_CALLBACK,
    }

    axios
      .post(
        'https://login.mailchimp.com/oauth2/token',
        qs.stringify(parameters),
        config,
      )
      .then((response) => {
        accessToken = response.data.access_token

        axios
          .get('https://login.mailchimp.com/oauth2/metadata', {
            headers: {
              Authorization: `OAuth ${accessToken}`,
            },
          })
          .then(async (metadataResponse) => {
            console.log(metadataResponse.data)

            Mailchimp.create({ ...metadataResponse.data, store: storeId })

            // Update store => Mark Mailchimp Installed => true

            const updatedStore = await Store.findByIdAndUpdate(
              storeId,
              { mailchimpInstalled: true },
              { new: true, validateModifiedOnly: true },
            )

            res.status(200).json({
              status: 'success',
              message: 'Mailchimp connected successfully!',
              data: updatedStore,
            })
          })
          .catch((error) => next(error))
      })
  } catch (error) {
    console.log(error)
  }
})

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET)

app.use(globalErrorHandler)

module.exports = app
