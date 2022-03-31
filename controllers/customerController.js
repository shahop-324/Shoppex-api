const Customer = require("../model/customerModel");
const SMSCommunication = require("../model/sMSCommunicationsModel");
const catchAsync = require("../utils/catchAsync");
const apiFeatures = require("../utils/apiFeatures");

const randomstring = require("randomstring");
const WalletTransaction = require("../model/walletTransactionModel");
const WalletDebited = require("../Template/Mail/WalletDebited");

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_KEY);

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

exports.addNewCustomer = catchAsync(async (req, res, next) => {
  const newCustomer = await Customer.create({
    ...req.body,
    store: req.store._id,
    createdAt: Date.now(),
  });
  res.status(200).json({
    status: "success",
    data: newCustomer,
    message: "Customer added successfully!",
  });
});

exports.giveCoinsToCustomer = catchAsync(async (req, res, next) => {
  const customer = await Customer.findById(req.body.id);
  customer.coins = customer.coins * 1 + req.body.coins * 1;
  const updatedCustomer = customer.save({
    new: true,
    validateModifiedOnly: true,
  });

  res.status(200).json({
    status: "success",
    data: updatedCustomer,
    message: "Coins added successfully!",
  });
});

exports.updateCustomer = catchAsync(async (req, res, next) => {
  const updatedCustomer = await Customer.findByIdAndUpdate(
    req.params.id,
    { updatedAt: Date.now(), ...req.body },
    { new: true, validateModifiedOnly: true }
  );

  res.status(200).json({
    status: "success",
    data: updatedCustomer,
    message: "Customer updated successfully!",
  });
});

exports.deleteCustomer = catchAsync(async (req, res, next) => {
  await Customer.findByIdAndDelete(req.params.id);
  res.status(200).json({
    status: "success",
    message: "Customer removed successfully!",
  });
});

exports.fetchCustomers = catchAsync(async (req, res, next) => {
  const query = Customer.find({ store: req.store._id });

  const features = new apiFeatures(query, req.query).textFilter();
  const customers = await features.query;

  res.status(200).json({
    status: "success",
    message: "Customers found successfully!",
    data: customers,
  });
});

exports.deleteMultipleCustomers = catchAsync(async (req, res, next) => {
  for (let element of req.body.customerIds) {
    // Remove all customers included in list
    await Customer.findByIdAndDelete(element);
  }
  res.status(200).json({
    status: "success",
    message: "Customers removed successfully!",
  });
});

exports.importCustomers = catchAsync(async (req, res, next) => {
  // create customer by using loop
});

exports.sendSMSToCustomer = catchAsync(async (req, res, next) => {
  // Send sms and create a copy of communication in SMSCommunications

  // Check if we have more than 1.5 in our wallet then only allow to send message

  const storeDoc = await Store.findById(req.store._id);

  if (storeDoc.walletAmount > 1.5) {
    const { message, id } = req.body;

    const customer = await Customer.findById(id);

    console.log(customer, message);

    client.messages
      .create({
        body: message,
        from: "+1 775 535 7258",
        to: customer.phone,
      })

      .then(async (message) => {
        console.log(message.sid);
        console.log(
          `Message Sent successfully to ${customer.name} on mobile ${customer.phone}.`
        );
        await SMSCommunication.create({
          store: req.store._id,
          user: req.user._id,
          customer: id,
          message: req.body.message,
          createdAt: Date.now(),
        });

        // deduct amount from wallet

        storeDoc.walletAmount = storeDoc.walletAmount - 1.5;

        await storeDoc.save({ new: true, validateModifiedOnly: true });

        const newTransactionDoc = await WalletTransaction.create({
          transactionId: `pay_${randomstring.generate({
            length: 10,
            charset: "alphabetic",
          })}`,
          type: "Debit",
          amount: 1.5,
          reason: "SMS Communication",
          timestamp: Date.now(),
          store: req.store._id,
        });

        // ! storeName, amount, reason, transactionId

        const msg = {
          to: storeDoc.emailAddress, // Change to your recipient
          from: "payments@qwikshop.online", // Change to your verified sender
          subject: "Your QwikShop Store Wallet has been Debited.",
          // text:
          //   'Hi we have changed your password as requested by you. If you think its a mistake then please contact us via support room or write to us at support@qwikshop.online',
          html: WalletDebited(
            storeDoc.storeName,
            1.5,
            "SMS Communication",
            newTransactionDoc.transactionId
          ),
        };

        sgMail
          .send(msg)
          .then(() => {
            console.log("Wallet Debited Notification sent successfully!");
          })
          .catch((error) => {
            console.log("Falied to send wallet debited notification.");
          });

        res.status(200).json({
          status: "success",
          message: "SMS sent successfully!",
        });
      })
      .catch((e) => {
        console.log(e);
        console.log(
          `Failed to send SMS to ${customer.name} on mobile ${customer.phone}`
        );
        res.status(400).json({
          status: "error",
          message: "Failed to send SMS, Please try again.",
        });
      });
  } else {
    res.status(400).json({
      status: "failed",
      message:
        "You don't have enough wallet balance to send SMS. Please recharge your wallet.",
    });
  }
});

exports.bulkImportCustomers = catchAsync(async (req, res, next) => {
  const storeId = req.store._id;
  if (!storeId) {
    // Store not found => through exception
    res.status(400).json({
      status: "error",
      message: "Bad request, session expired. Please login again and try!",
    });
  } else {
    // Store found => proceed
    mRows = req.body.rows.map((e) => {
      delete e.id;
      return e;
    });
    let newCustomers = [];
    for (let element of mRows) {
      const newCust = await Customer.create({
        store: storeId,
        ...element,
      });
      newCustomers.push(newCust);
    }

    res.status(200).json({
      status: "success",
      data: newCustomers,
      message: "Customers imported successfully!",
    });
  }
});

exports.bulkUpdateCustomers = catchAsync(async (req, res, next) => {
  const storeId = req.store._id;
  if (!storeId) {
    // Store not found => through exception
    res.status(400).json({
      status: "error",
      message: "Bad request, session expired. Please login again and try!",
    });
  } else {
    // Store found => proceed
    for (let element of req.body.rows) {
      // element is the product with its _id
      await Customer.findByIdAndUpdate(
        element._id,
        {
          ...element,
        },
        { new: true, validateModifiedOnly: true }
      );
    }
    // Find all customers of this store and send as response
    const customers = await Customer.find({ store: storeId });
    res.status(200).json({
      status: "success",
      data: customers,
      message: "Customers updated successfully!",
    });
  }
});
