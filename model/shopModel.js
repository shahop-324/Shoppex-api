const mongoose = require('mongoose')

const shopSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  ownerName: {
    type: String,
  },
  mobile: {
    type: String,
  },
  email: {
    type: String,
    // TODO Validate
  },
  addressLine1: {
    type: String,
  },
  addressLine2: {
    type: String,
  },

  street: {
    type: String,
  },

  landmark: {
    type: String,
  },

  city: {
    type: String,
  },

  state: {
    type: String,
  },

  country: {
    type: String,
    default: 'India',
    enum: ['India'],
  },
  images: [
    {
      type: String,
    },
  ],
  pincode: {
    type: Number,
  },
  plan: {
    type: String,
    enum: ['Free', 'Gold', 'VIP'],
  },
  reviews: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Review',
    },
  ],
  // TODO avg Rating => virtual field
  theme: {
    type: String,
    enum: ['Light', 'Dark'],
  },
  domain: {
    type: String,
  },
  subDomain: {
    type: String,
  },
  totalSales: {
    type: Number,
  },
  totalOrders: {
    type: Number,
  },
  storeViews: {
    type: Number,
  },
  totalShipments: {
    type: Number,
  },
  totalRefunds: {
    type: Number,
  },
  totalRefundAmount: {
    type: Number,
  },
  googleAnalyticsEnabled: {
    type: Boolean,
    default: false,
  },
  facebookPixelEnabled: {
    type: Boolean,
    default: false,
  },
  dunzosEnabled: {
    type: Boolean,
    default: false,
  },
  timerEnabled: {
    type: Boolean,
    default: false,
  },
  intercomEnabled: {
    type: Boolean,
    default: false,
  },
  adwordsEnabled: {
    type: Boolean,
    default: false,
  },
  mailchimpEnabled: {
    type: Boolean,
    default: false,
  },
  whatsappEnabled: {
    type: Boolean,
    default: false,
  },
  googleMerchantEnabled: {
    type: Boolean,
    default: false,
  },
  googleConsoleEnabled: {
    type: Boolean,
    default: false,
  },
  SEOEnabled: {
    type: Boolean,
    default: false,
  },
  hellobarEnabled: {
    type: Boolean,
    default: false,
  },
  dripCampaignEnabled: {
    type: Boolean,
    default: false,
  },
  qrCode: {
    type: String,
  },
  openTime: {
    type: Date,
    //   TODO 9 am
  },
  closeTime: {
    type: Date,
  },
  currentOpenStatus: {
    type: Boolean,
    default: true,
  },
  nativePaymentIntegration: {
    type: Boolean,
    default: true,
  },
  razorpay: {
    type: Boolean,
    default: false,
  },
  cod: {
    type: Boolean,
    default: false,
  },
  orderFromMarketing: {
    type: Number,
  },
  salesFromMarketing: {
    type: Number,
    //   In Rs.
  },
  marketingCost: {
    type: Number,
  },
  sentMessages: {
    type: Number,
  },
  whatsAppMsgSent: {
    type: Number,
  },
})

const Shop = new mongoose.model('Shop', shopSchema)
module.exports = Shop