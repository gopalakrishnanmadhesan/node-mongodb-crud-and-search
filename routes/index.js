var express = require('express');
var router = express.Router();
userModel = require('../models/userModel')();

router.get('/',  userModel.isAuth, function(req, res) {
	res.render("dashboard");
});

module.exports = router;