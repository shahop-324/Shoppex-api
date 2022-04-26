const admin = require('firebase-admin');

const serviceAccount = require("./qwikshop-cb1c9-firebase-adminsdk-lkndn-2431599736.json");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  module.exports.admin = admin;