const catchAsync = require("../utils/catchAsync");
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  signatureVersion: "v4",
  region: "ap-south-1",
  accessKeyId: "AKIA3EQQNGREDXST6CHF",
  secretAccessKey: "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",
});

exports.generateUploadURL = catchAsync((req, res, next) => {
  const key = req.body.key;
  const fileType = req.body.fileType;

  s3.getSignedUrl(
    "putObject",
    {
      Bucket: "qwikshop",
      Key: key,
      ContentType: fileType,
    },
    (err, url) => {
      res.send({ key, url, err });
    }
  );
});
