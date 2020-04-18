require('dotenv').config()
const MongoClient = require('mongodb').MongoClient,
  ObjectId = require('mongodb').ObjectID,
  Helpers = require('../helpers/utils')(),
  Employment = require('../models/employmentModel')(),
  url = process.env.MONGO_DB_URL;

module.exports = () => {
  const createValidation = (req, res, next) => {
    req.checkBody('name', 'Name is reqired').notEmpty()
    req.checkBody('start_date', 'start date is reqired').notEmpty()
    req.check('start_date').dd_mm_yyyy()
        .withMessage('Format should be dd-mm-yyyy')
    req.checkBody('end_date', 'End Date is reqired').notEmpty()
    req.check('end_date').dd_mm_yyyy()
        .withMessage('Format should be dd-mm-yyyy')
    req.checkBody('employees_id', 'Employees is reqired').notEmpty()
    req.checkBody('lead_employee_id', 'Lead is reqired').notEmpty()
    req.checkBody('status', 'status is reqired').notEmpty()
    if (req.validationErrors()) {
        Helpers.validationErrorMsg(req.validationErrors()).then((error) => {
            res.status(422).send({ status: "error", message: "Invaid Request Format", data: {error : error} });
        });
    } else next();
  }

  const projectObj = (req, res) => {
    return { 
      name: req.body.name,
      start_date: new Date(Helpers.changeDateFormat(req.body.start_date)),
      end_date: new Date(Helpers.changeDateFormat(req.body.end_date)), 
      employees_id: Helpers.changeId(req.body.employees_id),
      lead_employee_id: new ObjectId(req.body.lead_employee_id),
      status: req.body.status
    };

  }

  const create = (req, res) => {
    MongoClient.connect(url, (err, db) => {
      db.collection("projects").insertOne(projectObj(req), (err, result) => {
        if (err) {
          res.status(400).send({ status: "error", message: "Not inserted"});
        }
        else {
          res.status(200).send({ status: "success", message: "Created successfully!!!"});
        }
      });
    });
  }

  const getAll = (req, callback) => {
    MongoClient.connect(url, (err, db) => {
      db.collection('projects').find({}).toArray((err, result) => {
          if( err ) callback(err);
          callback(result);
      });
    });
  }

  const getListData = (req, callback) => {
    MongoClient.connect(url, (err, db) => {
      db.collection('projects').aggregate([
          { "$lookup": Helpers.searchObj("employeeQry") },
          { "$lookup": Helpers.searchObj("leadQry") },
          { "$unwind": "$LeadEmployeeDetail" }
      ]).toArray((err, result) => {
          if( err ) {
              console.log("err" + JSON.stringify(err));
          }
          Employment.getAll(req, (empl) => {
            callback({
              project: result,
              employment: empl
            });
          });
      });
    });
  };

  const updateById = (req, res, next) => {
    MongoClient.connect(url, (err, db) => {
      db.collection("projects").updateOne({"_id": new ObjectId(req.params.id)}, projectObj(req), (err, result) => {
        if (err) {
          callback(err);
        }
        else {
          next();
        }
      });
    });
  }

  const removeById = (req, res) => {
    MongoClient.connect(url, (err, db) => {
      db.collection("projects").deleteOne({"_id": new ObjectId(req.params.id)}, (err, result) => {
        if (err) {
          res.status(400).send({ status: "error", message: "Error Occured"});
        }
        else {
          res.status(200).send({ status: "success", message: "Deleted successfully"});
        }
      });
    });
  }

  const getById = (req, callback) => {
    MongoClient.connect(url, (err, db) => {
      db.collection('projects').findOne({"_id": new ObjectId(req.params.id)}, (err, result) => {
        if( err ) {
          console.log("err" + JSON.stringify(err));
        }
        Employment.getAll(req, (empl) => {
          callback({
            project: result,
            employment: empl
          });
        });
      });
    });
  };

  const isUserAsLead = (req, res, next) => {
    console.log(req.session.user);
    if (req.session && req.session.user && req.session.user['_id']) {
      let id = req.session.user['_id'];
      console.log(id);
      MongoClient.connect(url, (err, db) => {
        db.collection('projects').findOne({"lead_employee_id": new ObjectId(id)}, (err, result) => {
          console.log(result);
          if( err ) {
            console.log("err" + JSON.stringify(err));
          } else {
            // if (Object.keys(result).length > 0) {
            if (!result || Object.keys(result).length >= 0) { // testing purpose
               next();
            } else {
              res.status(400).send({ status: "error", message: "Permission Denied!"});
            }
          }
        });
      });
    } else {
      res.status(400).send({ status: "error", message: "Session Id Not Found"});
    }
    
  };

  const search = (req, callback) => {
    MongoClient.connect(url, (err, db) => {
        db.collection('projects').aggregate(Helpers.ProjectSearchFn(req.params)).toArray((err, result) => {
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
    getListData: getListData,
    search: search,
    removeById: removeById,
    isUserAsLead: isUserAsLead,
  }
};