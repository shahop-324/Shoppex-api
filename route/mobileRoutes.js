const express = require('express')
const router = express.Router()
const mobileController = require('../controllers/mobileController');

router.post('/login', mobileController.login);



router.post('/verifyAndLogin', mobileController.verifyAndLogin);



router.post('/resendLoginOTP', mobileController.resendLoginOTP);


router.post('/register', mobileController.register, mobileController.resendRegisterOTP);

router.post('/verifyAndRegister', mobileController.verifyAndRegister);

router.post('/resendRegisterOTP', mobileController.resendRegisterOTP);

module.exports = router;