const express = require('express'),
	router = express.Router(),
	userModel = require('../models/userModel')(),
	empModel = require('../models/employmentModel')(),
	projectModel = require('../models/projectModel')(),
	projectController = require("../controllers/projectController")();

router.get('/',  userModel.isAuth, projectController.getAll);
router.post('/ajax/save', userModel.isAuth, projectModel.createValidation,  empModel.checkLeadEmployeeId,  empModel.checkEmployeesId, projectModel.create);
router.get('/edit/:id',  userModel.isAuth, projectController.getById);
router.post('/update/:id',  userModel.isAuth, projectModel.createValidation, projectModel.updateById, (req, res, next) => {
	res.redirect("/project");
});
router.get('/delete/:id', userModel.isAuth, projectModel.removeById, (req, res, next) => {
	res.redirect("/project");
});
router.get('/search',  userModel.isAuth, projectController.searchPage);
router.get('/search/:project_id/:searchtype(employees_list|lead)',  userModel.isAuth, projectModel.isUserAsLead, projectController.ajaxSearch);

module.exports = router;