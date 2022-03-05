const catchAsync = require("../utils/catchAsync");
const User = require("../model/userModel");
const Store = require("../model/storeModel");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const Welcome = require("../Template/Mail/Welcome");
const randomstring = require("randomstring");
const UserRequest = require("../model/userRequestModel");
const otpGenerator = require("otp-generator");
const StoreSubName = require("../model/storeSubNameModel");
const slugify = require("slugify");
const { nanoid } = require("nanoid");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const signToken = (userId, storeId) =>
  jwt.sign({ userId, storeId }, process.env.JWT_SECRET);

exports.login = catchAsync(async (req, res, next) => {
  // Find if there is any user with given mobile number
  // if yes then generate and send OTP via mobile and send after storing in database

  const loginOTP = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });

  const existingUser = await User.findOneAndUpdate(
    { phone: req.body.mobile },
    { loginOTP },
    { new: true, validateModifiedOnly: true }
  );

  if (existingUser) {
    // send otp

    client.messages
      .create({
        body: `Your OTP for QwikShop is ${loginOTP}`,
        from: "+1 775 535 7258",
        to: existingUser.phone,
      })

      .then((message) => {
        console.log(message.sid);
        console.log(`OTP sent successfully!`);

        res.status(200).json({
          status: "success",
          message: "OTP sent successfully!",
        });
      })
      .catch((e) => {
        console.log(e);
        console.log(`Failed to send OTP`);

        res.status(400).json({
          status: "error",
          message: "Failed to send OTP, Please try again after sometime",
        });
      });
  } else {
    res.status(400).json({
      status: "error",
      message: "There is no account with this mobile number, Please register",
    });
  }
});

exports.resendLoginOTP = catchAsync(async (req, res, next) => {
  // JUST TAKE MOBILE NUMBER,fInd the user, generate new otp, send otp => DONE
  console.log(`+${req.body.mobile.substring(1)}`);

  const loginOTP = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });

  const existingUser = await User.findOneAndUpdate(
    { phone: `+${req.body.mobile.substring(1)}` },
    { loginOTP },
    { new: true, validateModifiedOnly: true }
  );

  if (existingUser) {
    client.messages
      .create({
        body: `Your OTP for QwikShop is ${loginOTP}`,
        from: "+1 775 535 7258",
        to: existingUser.phone,
      })

      .then((message) => {
        console.log(message.sid);
        console.log(`OTP sent successfully!`);

        res.status(200).json({
          status: "success",
          message: "OTP sent successfully!",
        });
      })
      .catch((e) => {
        console.log(e);
        console.log(`Failed to send OTP`);

        res.status(400).json({
          status: "error",
          message: "Failed to send OTP, Please try again after sometime",
        });
      });
  } else {
    res.status(400).json({
      status: "error",
      message: "Bad request, Incorrect mobile number.",
    });
  }
});

exports.verifyAndLogin = catchAsync(async (req, res, next) => {
  // Check if otp is correct then login => DONE

  console.log(req.body.mobile);

  console.log(`+${req.body.mobile.substring(1)}`);

  const existingUser = await User.findOne({
    phone: `+${req.body.mobile.substring(1)}`,
  });

  if (existingUser) {
    if (existingUser.loginOTP * 1 === req.body.otp * 1) {
      // Correct OTP => Login

      //   reset otp to null

      existingUser.loginOTP = null;

      await existingUser.save({ new: true, validateModifiedOnly: true });

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
      // Incorrect otp
      res.status(400).json({
        status: "error",
        message: "Incorrect OTP, Please try again.",
      });
    }
  } else {
    res.status(400).json({
      status: "error",
      message: "Bad request, Incorrect mobile number.",
    });
  }
});

exports.resendRegisterOTP = catchAsync(async (req, res, next) => {
  // USE UserRequest Model
  // JUST TAKE MOBILE NUMBER,fInd the user, generate new otp, send otp => DONE
  console.log(`+${req.body.mobile.substring(1)}`);

  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });

  const existingUserRequest = await UserRequest.findOneAndUpdate(
    { phone: `+${req.body.mobile.substring(1)}` },
    { otp },
    { new: true, validateModifiedOnly: true }
  );

  if (existingUserRequest) {
    client.messages
      .create({
        body: `Your OTP for QwikShop is ${otp}`,
        from: "+1 775 535 7258",
        to: existingUserRequest.phone,
      })

      .then((message) => {
        console.log(message.sid);
        console.log(`OTP sent successfully!`);

        res.status(200).json({
          status: "success",
          message: "OTP sent successfully!",
        });
      })
      .catch((e) => {
        console.log(e);
        console.log(`Failed to send OTP`);

        res.status(400).json({
          status: "error",
          message:
            "Failed to regsiter & send OTP, Please try again after sometime",
        });
      });
  } else {
    res.status(400).json({
      status: "error",
      message: "Bad request, Incorrect mobile number.",
    });
  }
});

exports.register = catchAsync(async (req, res, next) => {
  // Register user account request and send verification otp via mobile

  // USE UserRequest Model

  //   Make sure there is no exitsing user with same mobile number

  const { firstName, lastName, shopName, mobile, referralCode } = req.body;

  // Check if there is any account with same email => if yes then throw error

  const existingUser = await User.findOne({
    phone: `+${req.body.mobile.substring(1)}`,
  });

  if (existingUser) {
    res.status(400).json({
      status: "error",
      message:
        "Mobile number already registered on QwikShop, Please use different mobile.",
    });
    return;
  }

  // Delete all previous account request for same email

  await UserRequest.deleteMany({ phone: `+${req.body.mobile.substring(1)}` });

  // Create new account request for this email

  const newUserRequest = await UserRequest.create({
    firstName,
    lastName,
    shopName,
    phone: mobile,
    referralCode,
  });

  // Generate OTP

  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });

  // Save OTP to UserRequest (NOTE: We will implement OTP expiration after v1.0.0)

  newUserRequest.otp = otp;
  newUserRequest.expiry = Date.now() + 30 * 60 * 1000; // TODO => expiration feature will be implemented in coming days

  await newUserRequest.save({ new: true, validateModifiedOnly: true }); // Save latest changes to userRequest document

  // Send OTP verification on mobile

  client.messages
    .create({
      body: `Your OTP for QwikShop is ${otp}`,
      from: "+1 775 535 7258",
      to: req.body.mobile,
    })

    .then((message) => {
      console.log(message.sid);
      console.log(`OTP sent successfully!`);

      res.status(201).json({
        status: "success",
        message: "Please confirm your mobile using OTP.",
      });
    })
    .catch((e) => {
      console.log(e);
      console.log(`Failed to send OTP`);

      next(); // * This will pass execution to resend Mobile verification OTP middleware
    });
});

exports.verifyAndRegister = catchAsync(async (req, res, next) => {
  // Verify otp and create user account
  //   Delete all user requests with this mobile number

  try {
    const { mobile, otp } = req.body;

    console.log(`+${req.body.mobile.substring(1)}`, otp);

    const user = await UserRequest.findOne({
      phone: `+${req.body.mobile.substring(1)}`,
    }).select("+otp");

    console.log(user, otp);

    if (!user || !otp) {
      // Bad request
      res.status(400).json({
        status: "error",
        message: "Bad request",
      });
      return;
    }

    console.log(otp, user.otp);

    if (otp * 1 !== user.otp * 1) {
      // Incorrect OTP
      res.status(400).json({
        status: "error",
        message: "Incorrect OTP",
      });
      return;
    }

    // At this point we are sure that OTP has been successfully verified
    // Create actual user with this email and now no one can use this email again

    const newUser = await User.create({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      refCode: user.referralCode,
    });

    // ! Must Check who referred this user and keep track of referredBy referredUsers and upgradedByRefUsers
    let referrer;

    if (user.referralCode) {
      referrer = await User.findOne({ referralCode: user.referralCode });
      if (referrer) {
        //
        referrer.referredUsers.push(newUser._id);
        await referrer.save({ new: true, validateModifiedOnly: true });

        newUser.referredBy = referrer._id;
        await newUser.save({ new: true, validateModifiedOnly: true });
      }
    }

    // ! Must check that if there is any pending invitation for this member using email then add to that store

    // ** Add this user as admin to its own store which is being created DONE

    // Create new store with given shopName and assign it to user

    const newStore = await Store.create({
      storeName: user.shopName,
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

    // Find available sub-name

    let slugName = slugify(user.shopName.toLowerCase());
    let alternateSubname = nanoid();
    let isAvailable = true;

    const subNameDocs = await StoreSubName.find({});

    for (let element of subNameDocs) {
      if (element.subName === slugName) {
        isAvailable = false;
      }
    }

    if (isAvailable) {
      newSubNameDoc.subName = slugName;
      newStore.subName = slugName;
    } else {
      newSubNameDoc.subName = alternateSubname;
      newStore.subName = alternateSubname;
    }

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
    await UserRequest.deleteMany({ phone: `+${req.body.mobile.substring(1)}` });

    // Create and send login token for this user
    const token = signToken(newUser._id, newUser.stores[0]);

    console.log(token);

    res.status(200).json({
      status: "success",
      message: "Mobile verified successfully!",
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
  } catch (error) {
    console.log(error);
  }
});
