const catchAsync = require("../utils/catchAsync");
const User = require("../model/userModel");
const Store = require("../model/storeModel");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const Welcome = require("../Template/Mail/Welcome");
const randomstring = require("randomstring");
const UserRequest = require('../model/userRequestModel');

const StoreSubName = require("../model/storeSubNameModel");

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_KEY);

const signToken = (userId, storeId) =>
  jwt.sign({ userId, storeId }, process.env.JWT_SECRET);

exports.login = catchAsync(async (req, res, next) => {
  try {
    console.log(req.body);

    const existingUser = await User.findOneAndUpdate(
      { email: req.body.email },
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        image: req.body.image,
        googleId: req.body.googleId,
      },
      { new: true, validateModifiedOnly: true }
    );

    if (existingUser) {
      // Update existing user and login successfully

      const store = await Store.findById(existingUser.stores[0]);

      const storeId = existingUser.stores[0]._id;

      console.log(storeId);

      const token = signToken(existingUser._id, storeId);

      console.log(token);

      res.status(200).json({
        status: "success",
        message: "Logged in successfully!",
        token,
        store,
        user: existingUser,
        permissions: [
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
          "Questions",
          "Referral",
          "Wallet",
          "Reports",
        ],
      });
    } else {
      //  No account with this email found, Please register your new account
      res.status(400).json({
        status: "error",
        message:
          "No account with this email found, Please register your new account",
      });
    }
  } catch (error) {
    console.log(error);
  }
});

exports.register = catchAsync(async (req, res, next) => {
  // JUST CREATE A NEW USER AND CREATE A NEW STORE (INITIALISE WITH TIMESTAMP)

  try {
    // Make sure there is no other user with same email

    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      // Say that there is already an account with same email, please use a different email
      res.status(400).json({
        status: "error",
        message:
          "There is already an account with same email, please use a different email",
      });
    } else {
        const newUser = await User.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            googleId: req.body.googleId,
            image: req.body.image,
            refCode: randomstring.generate({
              length: 8,
              charset: "alphabetic",
            }), // Create and assign a new referral code
          });
      
          // ! Must check that if there is any pending invitation for this member using email then add to that store
      
          // ** Add this user as admin to its own store which is being created DONE
      
          // Create new store with given shopName and assign it to user
      
          const newStore = await Store.create({
            storeName: "",
            createdAt: Date.now(),
          });
      
          newStore.team.push({
            name: `${newUser.firstName} ${newUser.lastName}`,
            email: newUser.email,
            phone: newUser.phone,
            role: "Admin",
            addedAt: Date.now(),
            permissions: [
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
          });
      
          await newStore.save({ new: true, validateModifiedOnly: true });
      
          // Create a subname for store and create a subname doc for this store
      
          const newSubNameDoc = await StoreSubName.create({
            store: newStore._id,
            createdAt: Date.now(),
          });
      
          newUser.stores.push(newStore._id);
          // save store, user and subname doc
      
          let updatedUser = await newUser.save({
            new: true,
            validateModifiedOnly: true,
          });
      
          updatedUser = await User.findById(updatedUser._id).populate(
            "stores",
            "storeName logo _id"
          );
      
          await newSubNameDoc.save({ new: true, validateModifiedOnly: true });
          const updatedStore = await newStore.save({
            new: true,
            validateModifiedOnly: true,
          });
      
          // Destroy all userAccountRequests with this email
          await UserRequest.deleteMany({ email: req.body.email });
      
          // Create and send login token for this user
          const token = signToken(newUser._id, newUser.stores[0]);
      
          console.log(token);
      
          // TODO => Send welcome email to this user (P5)
      
          const msg = {
            to: newUser.email, // Change to your recipient
            from: "welcome@qwikshop.online", // Change to your verified sender
            subject: `Welcome to QwikShop`,
            html: Welcome(newUser.firstName),
          };
      
          sgMail
            .send(msg)
            .then(() => {
              console.log("Welcome Mail Sent successfully!");
            })
            .catch(() => {
              console.log("Failed to send Welcome mail.");
            });
      
          res.status(200).json({
            status: "success",
            message: "Email verified successfully!",
            token,
            user: updatedUser,
            store: updatedStore,
            permissions: [
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
              "Questions",
              "Referral",
              "Wallet",
              "Reports",
            ],
          });

    }

    
  } catch (error) {
    console.log(error);
  }
});
