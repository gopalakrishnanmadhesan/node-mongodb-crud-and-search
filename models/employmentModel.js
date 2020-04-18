require('dotenv').config()
const MongoClient = require('mongodb').MongoClient,
  ObjectId = require('mongodb').ObjectID,
  bcrypt = require('bcryptjs'),
  Helpers = require('../helpers/utils')(),
  salt = bcrypt.genSaltSync(10),
  url = process.env.MONGO_DB_URL;

module.exports = () => {
  const createValidation = (req, res, next) => {
    req.checkBody('name', 'Name is reqired').notEmpty()
    req.check('email', "Email is required").notEmpty()
    req.check('email', 'Email must be between 3 to 32 characters')
        .matches(/.+\@.+\..+/)
        .withMessage('Please enter a valid email address')
    req.check('password', "password is required").notEmpty()
    req.check('password')
        .isLength({min: 8})
        .withMessage("Password must contain atleast 8 characters")
    req.checkBody('gender', 'gender is reqired').notEmpty()
    req.checkBody('status', 'status is reqired').notEmpty()
    req.checkBody('dob', 'dob is reqired').notEmpty()
    req.check('dob').dd_mm_yyyy()
        .withMessage('Format should be yyyy-mm-dd')
    req.checkBody('joining_date', 'Joining Date is reqired').notEmpty()
    req.check('joining_date').dd_mm_yyyy()
        .withMessage('Format should be yyyy-mm-dd')
    if (req.validationErrors()) {
        Helpers.validationErrorMsg(req.validationErrors()).then((error) => {
            res.status(422).send({ status: "error", message: "Invaid Request Format", data: {error : error} });
        });
    } else next();
  }

  const employeeObj = (req, res) => {
    return { 
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, salt),
      dob: new Date(Helpers.changeDateFormat(req.body.dob)),
      joining_date: new Date(Helpers.changeDateFormat(req.body.joining_date)), 
      gender: req.body.gender,
      status: req.body.status
    };
  }

  const create = (req, res) => {
    MongoClient.connect(url, (err, db) => {
      db.collection("employee_details").insertOne(employeeObj(req), (err, result) => {
        if (err) {
          res.status(400).send({ status: "error", message: "Not inserted"});
        }
        else {
          res.status(200).send({ status: "success", message: "Created successfully!!!"});
        }
      });
    });
  }

  const getById = (req, callback) => {
    MongoClient.connect(url, (err, db) => {
      db.collection('employee_details').findOne({"_id": new ObjectId(req.params.id)}, (err, result) => {
        if( err ) {
          console.log("err" + JSON.stringify(err));
        } else {
          callback(result)
        }
      });
    });
  }

  const getAll = (req, callback) => {
    MongoClient.connect(url, (err, db) => {
      db.collection('employee_details').find({}).toArray((err, result) => {
        if( err ) 
          callback(err);
        else
          callback(result);
      });
    });
  }

  const updateById = (req, res, next) => {
    MongoClient.connect(url, function(err, db) {
      db.collection("employee_details").updateOne({"_id": new ObjectId(req.params.id)}, employeeObj(req), function(err, result) {
        if(! err ) next();
      });
    });
  }

  const removeById = (req, res) => {
    MongoClient.connect(url, function(err, db) {
      db.collection("employee_details").deleteOne({"_id": new ObjectId(req.params.id)}, employeeObj(req), function(err, result) {
        if (err) {
          res.status(400).send({ status: "error", message: "Error Occured"});
        }
        else {
          res.status(200).send({ status: "success", message: "Deleted successfully"});
        }
      });
    });
  }

  const checkEmployeesId = (req, res, next) => {
    MongoClient.connect(url, (err, db) => {
      db.collection('employee_details').find( { _id : { $in : Helpers.changeId(req.body.employees_id) } }).toArray((err, result) => {
          if( err ) callback(err);
          if (Object.keys(result).length  ===  req.body.employees_id.length) {
            next();
          } else {
            res.status(400).send({ status: "error", message: "Employees Id is Wrong"});
          }
      });
    });
  }

  const checkLeadEmployeeId = (req, res, next) => {
    MongoClient.connect(url, (err, db) => {
        db.collection('employee_details').findOne({"_id": new ObjectId(req.body.lead_employee_id)}, (err, result) => {
            if( err ) callback(err);
            if (Object.keys(result).length > 0) {
               next();
            } else {
              res.status(400).send({ status: "error", message: "Lead Employee Id is Wrong"});
            }
        });
    });
  };


  const search = (req, callback) => {
    MongoClient.connect(url, (err, db) => {
      db.collection('projects').aggregate(Helpers.EmployeeSearchFn(req.params)).toArray((err, result) => {
          if( err ) callback(err);
          else callback(result);
      });
    });
  };

  return {
    createValidation: createValidation,
    create: create,
    getById: getById,
    getAll: getAll,
    updateById: updateById,
    removeById: removeById,
    checkEmployeesId: checkEmployeesId,
    checkLeadEmployeeId: checkLeadEmployeeId,
    search: search
  }
};