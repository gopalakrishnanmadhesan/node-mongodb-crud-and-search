const request = require('request'),
	Promise = require('bluebird');

var ObjectId = require('mongodb').ObjectID;

module.exports = () => {
	const validationErrorMsg = (errorObj) => {
	    return new Promise((resolve, reject) => {
	    	let errors = {};
		    errorObj.map((item) => {
		      	if (errors[item["param"]]) {
		            errors[item["param"]].push(item["msg"]);
		        } else {
		            errors[item["param"]] = [];
		            errors[item["param"]].push(item["msg"]);
		        }
		    });
		    resolve(errors);
	  });
	};

	const searchObj = (param) => {
		if (param === "leadQry") {
		  return {
		    "from": 'employee_details',
		    "localField": 'lead_employee_id',
		    "foreignField": '_id',
		    "as": 'employeeDetails'
		  };
		} else {
		  return {
		    "from": 'employee_details',
		    "localField": 'employees_id',
		    "foreignField": '_id',
		    "as": 'employeeDetails'
		  };
		}
	}
	const EmployeeSearchFn = (params) => {
        if (params.searchtype == "contributions") {
            return [
                { "$lookup": searchObj("leadQry") },
                { "$unwind": "$employeeDetails" },
                {  $match : { "employees_id": new ObjectId(params.employee_id)} }
            ];
        } else {
            return [
                { $match : { "lead_employee_id": new ObjectId(params.employee_id)} },
                { "$lookup": searchObj("employeeQry") },
            ];
        }
    }
	const ProjectSearchFn = (params) => {
	    if (params.searchtype == "employees_list") {
			return [
				{ $match : { "_id": new ObjectId(params.project_id)} },
				{ "$lookup": searchObj("employeeQry") }
			];
	    } else {
	        return [
	            { $match : { "_id": new ObjectId(params.project_id)} },
	            { "$lookup": searchObj("leadQry") }
	        ];
	    }
	}

	const changeDateFormat = (date) => {
		return date.split("-").reverse().join("-")
	}

	const changeId = (ids) => {
		var idList = ids.map((item) => {
		  return new ObjectId(item);
		});

		return idList;
	}

	return {
		validationErrorMsg : validationErrorMsg,
		changeId : changeId,
		changeDateFormat : changeDateFormat,
		ProjectSearchFn : ProjectSearchFn,
		searchObj : searchObj,
		EmployeeSearchFn : EmployeeSearchFn,
	}
}