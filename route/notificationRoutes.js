const express = require("express");
const notificationController = require("./../controllers/notificationController");

const router = express.Router();

router.post("/sendMessage", notificationController.sendMessage);

module.exports = router;