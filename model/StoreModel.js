const mongoose = require('mongoose')

const staffMemberSchema = new mongoose.Schema({
  status: { type: String, enum: ['Pending', 'Accepted'], default: "Pending", },
  name: {
    type: String,
  },
  phone: {
    type: String,
  },
  email: { type: String },
  role: {
    type: String,
    enum: ['Admin', 'Staff'],
  },
  permissions: [
    {
      type: String,
      enum: [
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
    },
  ],
  addedAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
  },
})

const checkoutFieldSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  type: {
    type: String,
  },
  required: {
    type: Boolean,
    default: true,
  },
  options: [{ type: String }],
})

const storeSchema = new mongoose.Schema({
  setupCompleted: {
    type: Boolean,
    default: false,
  },
  storeName: {
    type: String,
  },
  country: {
    type: Map,
  },
  state: {
    type: String,
  },
  city: {
    type: String,
  },
  pincode: {
    type: Number,
  },
  address: {
    type: String,
  },
  landmark: {
    type: String,
  },
  gstin: {
    type: String,
  },
  subName: {
    type: String,
  },
  category: {
    type: Map,
  },
  phone: {
    type: String,
  },
  logo: { type: String },
  emailAddress: {
    type: String,
  },
  team: [staffMemberSchema],
  formFields: [checkoutFieldSchema],
  guestCheckout: {
    type: Boolean,
    default: true,
  },
  productsSold: {
    type: Number,
    default: 0,
  },
  customers: {
    type: Number,
    default: 0,
  },
  storeViews: {
    type: Number,
    default: 0,
  },
  amountOnHold: {
    type: Number,
    default: 0,
  },
  amountPaid: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  enableCOD: { type: Boolean, default: false },
  enablePartialCOD: { type: Boolean, default: false },
  partialCODPercentage: { type: Number, default: 20 },
  paymentMode: { type: String, default: 'upi' },
  upiId: { type: String },
  bank: { type: Map },
  accountNumber: { type: Number },
  accountHolderName: { type: String },
  IFSCCode: { type: String },
  // Manage
  favicon: { type: String },
  seoTitle: { type: String },
  seoMetaDescription: { type: String },
  seoImagePreview: { type: String },
  storePincode: { type: String },
  deliveryZones: [{ type: Map }],
  extraCharges: [{ type: Map }],
  gstEnabled: { type: Boolean, default: false },
  gstNumber: { type: String },
  gstPercentage: { type: Number },
  storeTimings: [{ type: Map }],
  termsOfService: { type: String },
  privacyPolicy: { type: String },
  refundPolicy: { type: String },
  shippingPolicy: { type: String },
  disclaimerPolicy: { type: String },

  // Notifications
  // Application notifications
  applicationBlog: { type: Boolean, default: true },
  applicationNews: { type: Boolean, default: true },
  applicationProduct: { type: Boolean, default: true },

  // Store Notifications
  storeAbondonedCart: { type: Boolean, default: true },
  storeOrder: { type: Boolean, default: true },
  storeStock: { type: Boolean, default: true },

  // Social Links
  facebookLink: { type: String },
  instagramLink: { type: String },
  twitterLink: { type: String },
})

const Store = mongoose.model('Store', storeSchema)
module.exports = Store
