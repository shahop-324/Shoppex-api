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

const app = express()



app.use(
  cors({
    origin: [
      'http://127.0.0.1:3001',
      'http://localhost:3001',
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

// const limiter = rateLimit({
//   max: 100000,
//   windowMs: 60 * 60 * 1000, // In one hour
//   message: 'Too many Requests from this IP, please try again in an hour!',
// })


app.use(express.json({ limit: '10kb' }))

app.use(
  express.urlencoded({
    extended: true,
  }),
)

app.use(mongosanitize())

app.use(xss())

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET)

app.use(globalErrorHandler)

module.exports = app
