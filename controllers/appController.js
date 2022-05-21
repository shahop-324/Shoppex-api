const catchAsync = require("../utils/catchAsync");
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  signatureVersion: "v4",
  region: "ap-south-1",
  accessKeyId: "AKIARWFU6ILBXBP5JCPB",
  secretAccessKey: "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",
});



exports.generateUploadURL = catchAsync((req, res, next) => {
  const key = req.body.key;
  const fileType = req.body.fileType;

  s3.getSignedUrl(
    "putObject",
    {
      Bucket: "qwikshop-in",
      Key: key,
      ContentType: fileType,
    },
    (err, url) => {
      res.send({ key, url, err });
    }
  );
});