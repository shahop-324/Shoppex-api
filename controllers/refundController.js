const catchAsync = require('../utils/catchAsync')
const Refund = require("../model/refundModel");
const apiFeatures = require("../utils/apiFeatures");

exports.fetchRefunds = catchAsync(async(req, res, next) => {
    const query = Refund.find({ store: req.store._id }).populate('order').populate('customer')

    const features = new apiFeatures(query, req.query).textFilter()
    const refunds = await features.query

    res.status(200).json({
        status: "success",
        data: refunds,
        message: "Refunds found successfully!"
    })

})