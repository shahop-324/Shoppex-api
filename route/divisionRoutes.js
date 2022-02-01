const express = require('express')
const router = express.Router()

const divisionController = require("../controllers/divisionController");
const authController = require("../controllers/authController");

router.get('/getAll', authController.protect, divisionController.getDivisions);
router.post('/create', authController.protect, divisionController.addDivision);
router.post('/reorder', authController.protect, divisionController.reorderDivisions);
router.patch('/update/:divisionId', authController.protect, divisionController.updateDivision);
router.delete('/delete/:divisionId', authController.protect, divisionController.deleteDivision);
router.delete('/deleteMultiple', authController.protect, divisionController.deleteMultipleDivision);

module.exports = router;