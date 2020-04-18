require('dotenv').config()
const MongoClient = require('mongodb').MongoClient,
  bcrypt = require('bcryptjs'),
  jwt = require('jsonwebtoken'),
  Helpers = require('../helpers/utils')();

module.exports = () => {
  const signinValidation = (req, res, next) => {
    req.check('email', "Email is required").notEmpty()
    req.check('email', 'Email must be between 3 to 32 characters')
        .matches(/.+\@.+\..+/)
        .withMessage('Please enter a valid email address')
    req.check('password', "password is required").notEmpty()
    req.check('password')
        .isLength({min: 8})
        .withMessage("Password must contain atleast 8 characters")
        .matches(/\d/)
        .withMessage("password must contain a number")
    const errors = req.validationErrors()
    if (errors) {
        Helpers.validationErrorMsg(errors).then((error) => {
            res.status(400).send({ status: "error", message: "Invaid Request Format", data: {error : error} });
        });
    } else next();
  }
  const isAuth = (req, res, next) => {
    if (req.session && req.session.user && req.session.user['token']) {
      var tokenArray = req.session.user['token'].split(' ');
      let accessToken = tokenArray[0] === 'Bearer' ? tokenArray[1] : tokenArray[0];
      jwt.verify(accessToken, process.env.JWT_SECRET, function(err, decoded) {
        if (err) {
          req.session.destroy();
          res.redirect('/auth/login');
        } else {
          req.headers.authorization = req.session.user['token'];
          next();
        }
      });
    } else {
       res.redirect('/auth/login');
    }
  }
  
  const findByEmailAndPassword = (emailId, password, result) => {
    MongoClient.connect(process.env.MONGO_DB_URL, (err, db) => {
      db.collection("user").find({ email: emailId }).toArray((err, users) => {
        if (err) {
          result({});
        } else {
          checkPassword(users, password).then((res) => {
            result(res);
          }).catch((err) => {
            result({});
          });
        }
      });
    });
  };

  const checkPassword = (record, password) => {
    return new Promise((resolve, reject) => {
      record.forEach((userObject, key) => {
        if (bcrypt.compareSync(password, userObject["password"])) {
          // Create a token
          let userObj = {
            _id : userObject["_id"],
            email : userObject["email"],
            status: userObject["status"]
          };
          let token = jwt.sign({ user: userObj }, process.env.JWT_SECRET, { expiresIn: '1h' },  { algorithm: 'RS256'});
          userObj["token"] = `Bearer ${token}`;
          resolve(userObj);
        } else {
          reject({});
        }
      });
      
    });
  };

  return {
    signinValidation: signinValidation,
    isAuth: isAuth,
    findByEmailAndPassword: findByEmailAndPassword
  }
};