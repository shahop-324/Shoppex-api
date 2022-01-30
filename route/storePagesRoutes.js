const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const storePagesController = require("../controllers/storePagesController");

// Fetch, Create, Update, Delete

router.get('/getAll', authController.protect, storePagesController.fetchStorePages);

router.post('/create', authController.protect, storePagesController.addStorePage);

router.patch('/update/:pageId', authController.protect, storePagesController.editStorePage);

router.delete('/delete/:pageId', authController.protect, storePagesController.deleteStorePage);


module.exports = router;