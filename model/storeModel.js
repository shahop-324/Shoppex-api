const mongoose = require("mongoose");
const otpGenerator = require("otp-generator");

const staffMemberSchema = new mongoose.Schema({
  status: { type: String, enum: ["Pending", "Accepted"], default: "Pending" },
  name: {
    type: String,
  },
  phone: {
    type: String,
  },
  email: { type: String },
  role: {
    type: String,
    enum: ["Admin", "Staff"],
  },
  permissions: [
    {
      type: String,
      enum: [
        "Order",
        "Catalouge",
        "Delivery",
        "Customer",
        "Dining",
        "Marketing",
        "Payment",
        "Discount",
        "Manage",
        "Design",
        "Integration",
        "Reviews",
        "Reports",
      ],
    },
  ],
  addedAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
  },
});

const checkoutFieldSchema = new mongoose.Schema({
  fieldName: {
    type: String,
  },
  type: {
    type: Map,
  },
  required: {
    type: Boolean,
    default: true,
  },
  options: [{ type: Map }],
});

const storeSchema = new mongoose.Schema({
  qwikId: {
    type: String,
    default: otpGenerator.generate(10, {
      upperCaseAlphabets: false,
      specialChars: false,
      digit: true,
      lowerCaseAlphabets: true,
    }),
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  subName: {
    type: String,
  },
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

  paymentMode: { type: String, default: "upi" },
  upiId: { type: String },
  bank: { type: Map },
  accountNumber: { type: Number },
  accountHolderName: { type: String },
  IFSCCode: { type: String },
  // Manage
  favicon: { type: String },
  seoTitle: { type: String },
  seoMetaDescription: { type: String },
  seoMetaKeywords: { type: String },
  seoImagePreview: { type: String },
  storePincode: { type: String },
  deliveryZones: [{ type: Map }], // Unselect
  extraCharges: [{ type: Map }],
  gstEnabled: { type: Boolean, default: false },
  gstNumber: { type: String },
  gstPercentage: { type: Number },
  storeTimings: [{ type: Map }], // Unselect
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
  youtubeLink: { type: String },
  // Ambience
  mode: { type: String, default: "light" },
  primaryColor: { type: String, default: "#2065D1" },
  // Store Other info
  freeDeliveryAbove: { type: Number, default: 1000 },
  orderIsShippedIn: { type: Map },
  returnAccepted: { type: Boolean, default: false },
  replacementAccepted: { type: Boolean, default: false },
  returnPeriod: { type: Map },
  replacementPeriod: { type: Map },
  deliveryHappensWithin: { type: String },

  // Wallet
  walletAmount: {
    type: Number,
    default: 0,
  },
  theme: { type: String, default: "Lite" },
  themesUnlocked: { type: Boolean, default: false },
  // Store Theme Booleans
  showTrendingProducts: {
    type: Boolean,
    default: true,
  },
  showTopPicks: {
    type: Boolean,
    default: true,
  },
  showBestSeller: {
    type: Boolean,
    default: true,
  },
  showCustomerReviews: {
    type: Boolean,
    default: true,
  },
  showRecommendations: {
    type: Boolean,
    default: true,
  },
  showShopByCategory: {
    type: Boolean,
    default: true,
  },
  showNewArrivals: {
    type: Boolean,
    default: true,
  },
  showTopRatedProducts: {
    type: Boolean,
    default: true,
  },
  flashDeals: [
    {
      type: Map,
    },
  ],
  dealOfTheDay: [
    {
      type: Map,
    },
  ],
  dealOfTheWeek: [
    {
      type: Map,
    },
  ],
  dealOfTheMonth: [
    {
      type: Map,
    },
  ],
  bigDiscounts: [
    {
      type: Map,
    },
  ],
  featuredProducts: [
    {
      type: Map,
    },
  ],
  topCategories: [
    {
      type: Map,
    },
  ],
  banners: [
    {
      type: Map,
    },
  ],
  heroBanners: [
    {
      type: Map,
    },
  ],
  customBanners: [
    {
      type: Map,
    },
  ],
  imageBanners: [
    {
      type: Map,
    },
  ],
  customSections: [
    {
      type: Map,
    },
  ],
  GAMeasurementId: {
    type: String,
  },
  GAInstalled: { type: Boolean, default: false },
  GMCVerificationCode: {
    type: String,
  },
  GMCInstalled: { type: Boolean, default: false },
  GSCVerificationCode: {
    type: String,
  },
  GSCInstalled: { type: Boolean, default: false },
  WhatsAppNumber: {
    type: String,
  },
  WAOTP: {
    type: String,
  },
  WAVerified: {
    type: Boolean,
    default: false,
  },
  IntercomAppId: {
    type: String,
  },
  IntercomInstalled: {
    type: Boolean,
    default: false,
  },
  adWordsVerificationCode: {
    type: String,
  },
  adWordsInstalled: {
    type: Boolean,
    default: false,
  },
  FacebookPixelId: {
    type: String,
  },
  PixelInstalled: {
    type: Boolean,
    default: false,
  },
  mailchimpKey: {
    type: String,
  },
  mailchimpInstalled: {
    type: Boolean,
    default: false,
  },
  currentPlan: {
    type: String,
    default: "Free",
  },
  transaction_charge: {
    type: Number,
    default: 4,
  },
  currentPlanExpiresAt: {
    type: Date,
  },
  pricePer100gm: {
    type: Number,
    default: 10,
  },
  deliveryChargeType: {
    type: String,
    default: "Dynamic",
  },
  constantDeliveryChargeBasedOn: {
    type: String,
    default: "Weight",
  },
  pricePer5km: {
    type: Number,
    default: 15,
  },
  lat: {
    type: Number,
    default: 26.2662023,
  },
  long: {
    type: Number,
    default: 78.2081602,
  },
  mobileView: {
    type: String,
    default: "grid",
  },
  enableEstimatedDeliveryTime: {
    type: Boolean,
    default: true,
  },
  enableHeaderSocialIcons: {
    type: Boolean,
    default: true,
  },
  enableOrderCancellation: {
    type: Boolean,
    default: true,
  },
  showTerms: {
    type: Boolean,
    default: true,
  },
  showDisclaimerPolicy: {
    type: Boolean,
    default: true,
  },
  showPrivacyPolicy: {
    type: Boolean,
    default: true,
  },
  showReturnPolicy: {
    type: Boolean,
    default: true,
  },
  showShippingPolicy: {
    type: Boolean,
    default: true,
  },
  privateMessagingToken: {
    type: String,
  },
});

const Store = new mongoose.model("Store", storeSchema);
module.exports = Store;
