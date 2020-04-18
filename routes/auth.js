const express = require('express'),
	router = express.Router(),
	userModel = require('../models/userModel')();
	auth = require("../controllers/authController")();

router.get('/login', function(req, res, next) {
  	res.render('login');
});
router.post('/ajax/signin', userModel.signinValidation, auth.signin);
router.get('/ajax/signout', auth.signout);

module.exports = router;