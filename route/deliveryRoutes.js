const express = require('express')
const router = express.Router()

const deliveryController = require('../controllers/deliveryController')
const authController = require('../controllers/authController')

router.post('/pickupPoint/create', authController.protect, deliveryController.addPickupPoint);
router.get('/pickupPoint/getAll', authController.protect, deliveryController.getPickupPoints);
router.patch('/pickupPoint/update/:pickupPointId', authController.protect, deliveryController.updatePickupPoint);
router.delete('/pickupPoint/delete/:pickupPointId', authController.protect, deliveryController.deletePickupPoint);
router.delete('/pickupPoint/deleteMultiple', authController.protect, deliveryController.deleteMultiplePickupPoint);

// Update Shipment
router.patch('/shipment/update/:shipmentId', authController.protect, deliveryController.updateShipment);

// Fetch Shipment
router.get('/shipment/getAll', authController.protect, deliveryController.getShipments);

// Assign Courier to delhivery

router.post('/shipment/assignDelhivery', authController.protect, deliveryController.assignDelhivery);

module.exports = router;
