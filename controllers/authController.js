const User = require('../models/userModel')()

module.exports = () => {
    const signin = (req, res) => {
        var emailId = req.body.email
        var password = req.body.password
        const user = User.findByEmailAndPassword(emailId, password, (obj) => {
            if (Object.keys(obj).length > 0) {
                req.session, req.session.user = {};
                req.session.user = obj;
                req.session.user.isloggedIn = 1;
                res.setHeader('authorization', obj['token']);
                res.status(200).send({ status: "success", data: obj });
            } else {
                res.status(401).send({ status: "failed", message: "Entered Username or Password mismatch" });
            }
        });
    };

    const signout = (req, res) => {
        res.clearCookie("t");
        res.json({message: "Signed out succesfully"});
    };

    return {
        signin: signin,
        signout: signout
    }
}

