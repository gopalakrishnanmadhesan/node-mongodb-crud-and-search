var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;

console.log(JSON.stringify(process.env.PORT));

router.post('/save', function(req, res) {
	var url = process.env.MONGO_DB_URL;

	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		var myobj = { name: req.body.name, shopname: req.body.shopname, gender: req.body.gender, status: req.body.status };
		db.collection("shops").insertOne(myobj, function(err, res) {
			if (err) throw err;
		});
	});
	res.status(200).send({ status: "success" });
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
