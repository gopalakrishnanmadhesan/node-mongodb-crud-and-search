const express = require('express'),
	router = express.Router(),
	userModel = require('../models/userModel')(),
	empModel = require('../models/employmentModel')(),
	empController = require("../controllers/employmentController")();

router.get('/',  userModel.isAuth, empController.getAll);
router.post('/ajax/save', userModel.isAuth, empModel.createValidation, empModel.create);
router.get('/edit/:id',  userModel.isAuth, empController.getById);
router.post('/update/:id',  userModel.isAuth, empModel.createValidation, empModel.updateById, (req, res, next) => {
	res.redirect("/employment");
});
router.get('/delete/:id',  userModel.isAuth, empModel.removeById, (req, res, next) => {
	res.redirect("/employment");
});
router.get('/search',  userModel.isAuth, empController.searchPage);
router.get('/search/:employee_id/:searchtype(contributions|leading)',  userModel.isAuth, empController.ajaxSearch);

module.exports = router;