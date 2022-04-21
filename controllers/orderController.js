const Order = require("../model/ordersModel");
const Product = require("../model/productModel");
const Customer = require("../model/customerModel");
const Refund = require("../model/refundModel");
const catchAsync = require("../utils/catchAsync");
const apiFeatures = require("../utils/apiFeatures");
const Shipment = require("../model/shipmentModel");
const Store = require("../model/storeModel");
const request = require("request");

const randomstring = require("randomstring");
const WalletTransaction = require("../model/walletTransactionModel");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const sgMail = require("@sendgrid/mail");
const OrderCancelled = require("../Template/Mail/OrderCancelled");
const RefundProccessed = require("../Template/Mail/RefundProccessed");
// const OrderAccepted = require('../Template/OrderAccepted');
sgMail.setApiKey(process.env.SENDGRID_KEY);

exports.createOrder = catchAsync(async (req, res, next) => {
  const {
    storeId,
    products,
    amount,
    paymentMode,
    paymentStatus,
    discountCode,
    mobile,
    customerName,
    deliveryAddress,
    deliveryPincode,
    checkoutFields,
    status,
    isDining,
    diningTable,
  } = req.body;

  const newOrder = await Order.create({
    store: storeId,
    products,
    amount,
    paymentMode,
    paymentStatus,
    discountCode,
    mobile,
    customerName,
    deliveryAddress,
    deliveryPincode,
    checkoutFields,
    status,
    isDining,
    diningTable,
    isCancelled: false,
    createdAt: Date.now(),
  });

  res.status(200).json({
    status: "success",
    message: "Order created successfully!",
    data: newOrder,
  });
});

exports.getOrders = catchAsync(async (req, res, next) => {
  try {
    const query = Order.find({ store: req.store._id });

    const features = new apiFeatures(query, req.query).textFilter();
    const orders = await features.query;

    res.status(200).json({
      status: "success",
      data: orders,
      message: "Orders found successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      staus: "error",
      message: error,
    });
  }
});

exports.getAbondonedCarts = catchAsync(async (req, res, next) => {
  const customers = await Customer.find({ store: req.store._id }).select(
    "+cart"
  );

  const products = await Product.find({ store: req.store._id });

  let abondonedCarts = customers
    .filter((el) => el.cart !== undefined && el.cart.length > 0)
    .map((el) => ({
      cart: el.cart.map((item) => {
        const prod = products.find((p) => {
          return p._id.toString() === item.product.toString();
        });
        // console.log(products);
        console.log(item.product.toString());
        // console.log(prod)
        return {
          qty: item.quantity,
          itemTotal: item.quantity * item.pricePerUnit,
          name: prod.productName,
          id: prod._id,
        };
      }),
      name: el.name,
      customerId: el._id,
      contact: el.phone,
      updatedAt: el.cartUpdatedAt || Date.now(),
    }));

  abondonedCarts = abondonedCarts.map((el) => {
    const { name, cart, customerId, contact, updatedAt } = el;

    let amount = 0;

    cart.forEach((el) => {
      amount = amount + el.itemTotal;
    });

    return {
      cart,
      name,
      customerId,
      contact,
      updatedAt,
      amount,
    };
  });

  // * Customer name DONE
  // * Customer Contact DONE
  // * Products with qty, name & _id, DONE
  // * Total Amount of cart DONE
  // * Last Updated time of cart DONE

  res.status(200).json({
    status: "success",
    data: abondonedCarts,
    message: "Abondoned carts found successfully!",
  });
});

exports.getRecentOrders = catchAsync(async (req, res, next) => {
  try {
    // get latest 6 orders
    const orders = await Order.find({ store: req.store._id })
      .sort({ timestamp: -1 })
      .limit(6);

    res.status(200).json({
      status: "success",
      data: orders,
      message: "successfully found latest orders",
    });
  } catch {
    console.log(error);
    res.status(400).json({
      staus: "error",
      message: error,
    });
  }
});

exports.acceptOrder = catchAsync(async (req, res, next) => {
  //  Move order to ACCEPTED state
  //  Move shipment to ACCEPTED state

  try {
    let acceptedOrder;

    if (req.body.id) {
      acceptedOrder = await Order.findByIdAndUpdate(
        req.body.id,
        { status: "Accepted", status_id: 0, updatedAt: Date.now() },
        { new: true, validateModifiedOnly: true }
      );
    } else {
      acceptedOrder = await Order.findOneAndUpdate(
        { ref: req.body.ref },
        { status: "Accepted", status_id: 0, updatedAt: Date.now() },
        { new: true, validateModifiedOnly: true }
      );
    }

    const acceptedShipment = await Shipment.findByIdAndUpdate(
      acceptedOrder.shipment._id,
      { status: "Accepted", status_id: 0, updatedAt: Date.now() },
      { new: true, validateModifiedOnly: true }
    );

    const customerDoc = acceptedShipment.customer;
    const storeDoc = await Store.findById(acceptedShipment.store);

    //  ! TODO Send email, SMS and whatsapp communication that order has been accepted

    // ! storeName, orderId, storeLink => ORDER ACCEPTED => SEND TO CUSTOMER

    // const msgToCustomer = {
    //   to: customerDoc.email, // Change to your recipient
    //   from: 'orders@qwikshop.online', // Change to your verified sender
    //   subject: `Your QwikShop Order #${acceptedOrder.ref} has been accepted & Confirmed by ${storeDoc.storeName}!`,
    //   // text:
    //   //   'Hi we have changed your password as requested by you. If you think its a mistake then please contact us via support room or write to us at support@qwikshop.online',
    //   html: OrderAccepted(
    //     storeDoc.storeName,
    //     acceptedOrder.ref,
    //     `https://qwikshop.online/${storeDoc.subName}`,
    //   ),
    // }

    // sgMail
    //   .send(msgToCustomer)
    //   .then(() => {
    //     console.log('Order Acceptance Notification sent successfully to customer')
    //   })
    //   .catch((error) => {
    //     console.log('Falied to send Order Acceptance notification to customer')
    //   })

    res.status(200).json({
      status: "success",
      data: acceptedOrder,
      message: "Order Accepted Successfully!",
    });
  } catch {
    console.log(error);
  }
});

exports.cancelOrder = catchAsync(async (req, res, next) => {
  try {
    // Mark order as cancelled => Create a refund if any amount was paid online and reverse coins in order

    // ! Remember to give refund only if it was a prepaid order and also cancel shipment with shiprocket if it was being shipped via shiprocket => Delivery charge will also be refunded

    let cancelledOrder;
    if (req.body.id) {
      cancelledOrder = await Order.findByIdAndUpdate(
        req.body.id,
        {
          status: "Cancelled",
          status_id: 8,
          updatedAt: Date.now(),
          reasonForCancellation: req.body.reason,
        },
        { new: true, validateModifiedOnly: true }
      );
    } else {
      cancelledOrder = await Order.findOneAndUpdate(
        { ref: req.body.ref },
        {
          status: "Cancelled",
          status_id: 8,
          updatedAt: Date.now(),
          reasonForCancellation: req.body.reason,
        },
        { new: true, validateModifiedOnly: true }
      );
    }

    // Mark corresponding shipment as cancelled

    const cancelledShipment = await Shipment.findByIdAndUpdate(
      cancelledOrder.shipment,
      {
        status: "Cancelled",
        status_id: 8,
        reasonForCancellation: req.body.reason,
      },
      { new: true, validateModifiedOnly: true }
    );

    const storeDoc = await Store.findById(cancelledOrder.store);

    const customerDoc = await Customer.findById(cancelledOrder.customer._id);

    customerDoc.coins = (
      customerDoc.coins -
      (cancelledOrder.coinsEarned || 0) +
      (cancelledOrder.coinsUsed || 0)
    ).toFixed(0);

    await customerDoc.save({ new: true, validateModifiedOnly: true });

    const orderDoc = cancelledOrder;

    console.log(`Payment Method is ${orderDoc.paymentMode}`);

    if (orderDoc.paymentMode !== "cod") {
      // Calculate total - coinsUsed === amount that needs to be refunded
      const amountToRefund = orderDoc.charges.total - cancelledOrder.coinsUsed;
      console.log(orderDoc.charges, orderDoc.charges.total, cancelledOrder.coinsUsed);
      console.log(
        `Amount to refund is ${amountToRefund}`,
        amountToRefund * 1 > 0
      );

      if (amountToRefund * 1 > 0) {
        await Refund.create({
          store: cancelledOrder.store,
          customer: cancelledOrder.customer._id,
          order: cancelledOrder._id,
          amount: amountToRefund,
          createdAt: Date.now(),
        });

        // ! amount, name, orderId, storeName

        const customerMsg = {
          to: customerDoc.email, // Change to your recipient
          from: "orders@qwikshop.online", // Change to your verified sender
          subject: `Refund of Rs.${amountToRefund} for Order #${orderDoc.ref} from store ${storeDoc.storeName} has been refunded successfully!.`,
          // text:
          //   'Hi we have changed your password as requested by you. If you think its a mistake then please contact us via support room or write to us at support@qwikshop.online',
          html: RefundProccessed(
            amountToRefund,
            customerDoc.name,
            orderDoc.ref,
            storeDoc.storeName
          ),
        };

        sgMail
          .send(customerMsg)
          .then(() => {
            console.log(
              "Order Refund proccessed Notification sent successfully to customer"
            );
          })
          .catch((error) => {
            console.log(
              "Falied to send Order Refund proccessed notification to customer"
            );
          });
      }
    }

    // Check if shipment was booked via shiprocket than cancel that shipment via shiprocket_order_id

    if (cancelledShipment.carrier === "Shiprocket") {
      // check if their is AWB number booked for this shipment
      if (cancelledShipment.AWB) {
        // Now we need to cancel this order booked via shiprocket

        let token = null;

        const options = {
          method: "POST",
          url: "https://apiv2.shiprocket.in/v1/external/auth/login",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "jyoti.shah@qwikshop.online",
            password: "op12345@shah",
          }),
        };

        request(options, async (error, response) => {
          if (error) throw new Error(error);
          // console.log(response.body)
          JSON.parse(response.body);
          const resp = await JSON.parse(response.body);

          // console.log(resp.token)

          token = resp.token;

          var options = {
            method: "POST",
            url: "https://apiv2.shiprocket.in/v1/external/orders/cancel",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              ids: [cancelledShipment.shiprocket_order_id],
            }),
          };
          request(options, function (error, response) {
            if (error) throw new Error(error);
            console.log(response.body);

            res.status(200).json({
              message:
                "Shipment via shiprocket has been cancelled successfully!",
              status: "success",
            });
          });
        });
      }
    }

    // storeName ,orderId, amount, mode, reason, storeLink

    const msg = {
      to: storeDoc.emailAddress, // Change to your recipient
      from: "orders@qwikshop.online", // Change to your verified sender
      subject: `Order #${cancelledOrder.ref} from store ${storeDoc.storeName} has been cancelled.`,
      // text:
      //   'Hi we have changed your password as requested by you. If you think its a mistake then please contact us via support room or write to us at support@qwikshop.online',
      html: OrderCancelled(
        storeDoc.storeName,
        cancelledOrder.ref,
        cancelledOrder.charges.total,
        cancelledOrder.paymentMode,
        `https://qwikshop.online/${storeDoc.subName}`
      ),
    };

    const msgToCustomer = {
      to: customerDoc.email, // Change to your recipient
      from: "orders@qwikshop.online", // Change to your verified sender
      subject: `Order #${cancelledOrder.ref} from store ${storeDoc.storeName} has been cancelled.`,
      // text:
      //   'Hi we have changed your password as requested by you. If you think its a mistake then please contact us via support room or write to us at support@qwikshop.online',
      html: OrderCancelled(
        storeDoc.storeName,
        cancelledOrder.ref,
        cancelledOrder.charges.total,
        cancelledOrder.paymentMode,
        `https://qwikshop.online/${storeDoc.subName}`
      ),
    };

    sgMail
      .send(msg)
      .then(() => {
        console.log("Order cancellation Notification sent successfully!");
      })
      .catch((error) => {
        console.log("Falied to send Order cancellation notification.");
      });

    sgMail
      .send(msgToCustomer)
      .then(() => {
        console.log(
          "Order cancellation Notification sent successfully to store!"
        );
      })
      .catch((error) => {
        console.log("Falied to send Order cancellation notification to store");
      });

    //  ! TODO Send email, SMS and whatsapp communication that order has been cancelled
    res.status(200).json({
      status: "success",
      data: cancelledOrder,
      shipment: cancelledShipment,
      message: "Order Cancelled Successfully!",
    });
  } catch (error) {
    console.log(error);
  }
});

exports.askForReview = catchAsync(async (req, res, next) => {
  // Check if we have more than 1.5 in our wallet then only allow to send message

  const storeDoc = await Store.findById(req.store._id);

  if (storeDoc.walletAmount > 1.5) {
    // Find customer and order and ask for review

    let orderDoc;

    if (req.body.ref) {
      orderDoc = await Order.findOne({ ref: req.body.ref });
    } else {
      orderDoc = await Order.findById(req.params.orderId);
    }

    const storeDoc = await Store.findById(orderDoc.store);

    const customer = orderDoc.customer;

    if (customer.phone) {
      // Send SMS here

      client.messages
        .create({
          body: `Dear Customer, Please provide your review for your order ID ${orderDoc.ref.toUpperCase()} which was placed via ${
            storeDoc.name
          }. Thanks.`,
          from: "+1 775 535 7258",
          to: customer.phone,
        })

        .then(async (message) => {
          console.log(message.sid);
          console.log(`Successfully sent SMS asking for review.`);

          // deduct amount from wallet

          storeDoc.walletAmount = storeDoc.walletAmount - 1.5;

          await storeDoc.save({ new: true, validateModifiedOnly: true });

          const newTransactionDoc = await WalletTransaction.create({
            store: req.store._id,
            transactionId: `pay_${randomstring.generate({
              length: 10,
              charset: "alphabetic",
            })}`,
            type: "Debit",
            amount: 1.5,
            reason: "Asked for review",
            timestamp: Date.now(),
          });

          // ! storeName, amount, reason, transactionId

          const msg = {
            to: req.store.emailAddress, // Change to your recipient
            from: "payments@qwikshop.online", // Change to your verified sender
            subject: "Your QwikShop Store Wallet has been Debited.",
            // text:
            //   'Hi we have changed your password as requested by you. If you think its a mistake then please contact us via support room or write to us at support@qwikshop.online',
            html: WalletDebited(
              req.store.storeName,
              1.5,
              "Asked for review",
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
            message: "Asked for review successfully!",
          });
        })
        .catch((e) => {
          console.log(e);
          console.log(`Failed to send SMS asking for review.`);
          res.status(200).json({
            status: "success",
            message: "Failed to Ask for review, Please try again",
          });
        });
    } else {
      res.status(200).json({
        status: "success",
        message:
          "Failed to Ask for review, customer has not provided their Mobile number. Please update customer.",
      });
    }
  } else {
    res.status(400).json({
      status: "failed",
      message:
        "You don't have enough wallet balance to ask for review via SMS. Please recharge your wallet.",
    });
  }
});
