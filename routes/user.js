const express = require('express');
const User = require('../models/User');
const router = express.Router();
const authController = require("../controllers/auth") ;


// POST task (signUp)
router.post('/signUp', authController.signUp);

// POST task (login)
router.post('/login', authController.login);

module.exports = router;
