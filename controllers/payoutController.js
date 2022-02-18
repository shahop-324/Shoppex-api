const catchAsync = require('../utils/catchAsync')
const Payout = require("../model/payoutModel");
const apiFeatures = require("../utils/apiFeatures");

exports.fetchPayouts = catchAsync(async(req, res, next) => {
    const query = Payout.find({ store: req.store._id })

    const features = new apiFeatures(query, req.query).textFilter()
    const payouts = await features.query

    res.status(200).json({
        status: "success",
        data: payouts,
        message: "Payouts found successfully!"
    })

})