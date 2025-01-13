const express = require('express');
// const User = require('../models/User');
const router = express.Router();
const userController = require("../controllers/user") ;


// POST task (signUp)
router.post('/signUp', userController.register);

// POST task (login)
router.post('/login', userController.login);

module.exports = router;
