const catchAsync = require("../utils/catchAsync");
const Admin = require("../model/adminModel");
const Blog = require("../model/blogModel");
const Payout = require("../model/payoutModel");
const Refund = require("../model/refundModel");
const Store = require("../model/storeModel");
const randomstring = require("randomstring");

const sgMail = require("@sendgrid/mail");
const Customer = require("../model/customerModel");
const PayoutProccessed = require("../Template/Mail/PayoutProccessed");
sgMail.setApiKey(process.env.SENDGRID_KEY);

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const admin = require("../cloud_messaging");

// Create Admin
exports.createAdmin = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, phone, password } = req.body;

  const newAdmin = await Admin.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    createdAt: Date.now(),
  });

  res.status(200).json({
    status: "success",
    data: newAdmin,
    message: "Admin Created Successfully!",
  });
});

// Create Blog
exports.createBlog = catchAsync(async (req, res, next) => {});

// Edit Blog
exports.updateBlog = catchAsync(async (req, res, next) => {});
// Delete Blog
exports.deleteBlog = catchAsync(async (req, res, next) => {});
// Fetch Blogs
exports.fetchBlogs = catchAsync(async (req, res, next) => {});

// Fetch stores
exports.fetchStores = catchAsync(async (req, res, next) => {
  const stores = await Store.find({});

  res.status(200).json({
    status: "success",
    data: stores,
    message: "Stores found successfully!",
  });
});

// Fetch Payouts
exports.fetchPayouts = catchAsync(async (req, res, next) => {
  const payouts = await Payout.find({});
  res.status(200).json({
    status: "success",
    data: payouts,
    message: "Payouts found successfully!",
  });
});

// Create Payout
exports.createPayout = catchAsync(async (req, res, next) => {
  // TODO

  const { storeId, amount, method } = req.body;

  // Update Amount on hold and Amount paid for store

  const store_doc = await Store.findById(storeId);

  store_doc.amountPaid = store_doc.amountPaid * 1 + amount * 1;
  store_doc.amountOnHold = store_doc.amountOnHold * 1 - amount * 1;

  const updatedStore = await store_doc.save({
    new: true,
    validateModifiedOnly: true,
  });

  const new_payout = await Payout.create({
    store: storeId,
    amount: amount,
    currency: "INR",
    createdAt: Date.now(),
    method,
    payoutId: `pay_${randomstring.generate(10)}`,
    createdBy: req.admin._id,
  });

  const storeDoc = await Store.findById(storeId);

  try {
    const notification_options = {
      priority: "high",
      timeToLive: 60 * 60 * 24,
    };

    const privateMessagingToken = storeDoc.privateMessagingToken;
    const message = `Your Payout of Rs.${(amount / 100).toFixed(
      2
    )} Proccessed successfully!`;
    const options = notification_options;

    const payload = {
      notification: {
        title: "New Payout Proccessed",
        body: message,
        icon: "default",
      },
      data: {
        // Here we can send data in an object format
        type: "new_transaction", // ['low_stock', 'new_review', 'new_question', 'link', 'new_order', 'new_transaction']
        // url: if we want to send user to a webpage after clicking on notification
        p_tab: "2",
      },
    };

    if (privateMessagingToken) {
      admin
        .messaging()
        .sendToDevice(privateMessagingToken, payload, options)
        .then((response) => {
          console.log("Mobile Notification sent successfully!");
        })
        .catch((error) => {
          console.log(error, "Failed to send mobile notification");
        });
    }
  } catch (error) {
    console.log(error);
  }

  // storeName,
  // amount,
  // mode,
  // accountNo,
  // beneficiaryName,
  // bankName,
  // IFSCCode,
  // upiId,
  // transactionId,

  const msg = {
    to: updatedStore.emailAddress, // Change to your recipient
    from: "payouts@qwikshop.online", // Change to your verified sender
    subject: `We have proccessed your payout of Rs. ${amount} in your registered ${method}`,
    // text:
    //   'Hi we have changed your password as requested by you. If you think its a mistake then please contact us via support room or write to us at support@qwikshop.online',
    html: PayoutProccessed(
      updatedStore.storeName,
      amount,
      method,
      updatedStore.accountNumber,
      updatedStore.accountHolderName,
      updatedStore.bank ? updatedStore.bank.label : "NA",
      updatedStore.IFSCCode,
      updatedStore.upiId,
      new_payout.payoutId
    ),
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log("Payout Proccessed Notification sent successfully!");
    })
    .catch((error) => {
      console.log("Falied to send payout proccessed notification.");
    });

  // Notify Seller About Payment => Via SMS & EMAIL

  client.messages
    .create({
      body: `Dear QwikShop Seller, Your Payment of Rs. ${amount} for store ${store_doc.name} has been made successfully via registered ${method}. Thanks, QwikShop team.`,
      from: "+1 775 535 7258",
      to: store_doc.phone,
    })

    .then((message) => {
      console.log(message.sid);
      console.log(`Successfully sent SMS Notification`);
    })
    .catch((e) => {
      console.log(e);
      console.log(`Failed to send SMS Notification`);
    });

  res.status(200).json({
    status: "success",
    payout: new_payout,
    store: updatedStore,
    message: "Payout Created successfully!",
  });
});

// Fetch Refunds
exports.fetchRefunds = catchAsync(async (req, res, next) => {
  const refunds = await Refund.find({}).populate("order").populate("customer");
  res.status(200).json({
    status: "success",
    data: refunds,
    message: "Refunds found successfully!",
  });
});
// Update Refund
exports.resolveRefund = catchAsync(async (req, res, next) => {
  // TODO

  // Mark refund resolved at true => Notify Customer

  const Updated_refund = await Refund.findByIdAndUpdate(
    req.params.id,
    { resolved: true },
    { new: true, validateModifiedOnly: true }
  )
    .populate("customer")
    .populate("order")
    .populate("store");

  client.messages
    .create({
      body: `Dear ${Updated_refund.customer.name}, Your Refund of Rs. ${Updated_refund.amount} for Order #${Updated_refund.order._id} placed via ${Updated_refund.store.name} has been made successfully Proccessed. Thanks, ${Updated_refund.store.name} Team.`,
      from: "+1 775 535 7258",
      to: Updated_refund.customer.phone,
    })

    .then((message) => {
      console.log(message.sid);
      console.log(`Successfully sent SMS Notification`);
    })
    .catch((e) => {
      console.log(e);
      console.log(`Failed to send SMS Notification`);
    });

  res.status(200).json({
    status: "success",
    data: Updated_refund,
    message: "Refund successfully resolved!",
  });
});
