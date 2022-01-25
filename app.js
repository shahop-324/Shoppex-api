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

const globalErrorHandler = require('./controllers/errController')
const catchAsync = require('./utils/catchAsync')

// Import routes

const authRoutes = require('./route/authRoutes')
const productRoutes = require('./route/productRoutes')
const notificationRoutes = require('./route/notificationRoutes')
const storeRoutes = require('./route/storeRoutes')
const userRoutes = require('./route/userRoutes')
const orderRoutes = require("./route/orderRoutes");
const generalRoutes = require("./route/generalRoutes");
const categoryRoutes = require("./route/categoryRoutes");

const { application } = require('express')

const app = express()

app.use(
  cors({
    origin: [
      'https://127.0.0.1:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3000',
      'https://www.letstream.live',
      'https://letstream.live',
      'https://zapier.com',
      'https://www.zapier.com',
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
app.use('/v1/general', generalRoutes);
app.use('/v1/auth', authRoutes)
app.use('/v1/product', productRoutes)
app.use('/v1/notification', notificationRoutes)
app.use('/v1/store', storeRoutes)
app.use('/v1/user', userRoutes)
app.use('/v1/order', orderRoutes);
app.use('/v1/category', categoryRoutes);

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET)

app.use(globalErrorHandler)

module.exports = app
