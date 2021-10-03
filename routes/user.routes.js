module.exports = app => {
    const users = require("../controllers/user.controller");
    
    var router = require("express").Router();
    var tools = require('../config/utils');

    // create new user
    router.post("/create-user", users.createUser);
    router.post("/login-user", users.loginUser);
    router.post("/verify-user", users.verifyUser);
   /* router.post("/check-username", users.checkUserName);
    
    router.post("/resend-verification", users.resendVerification);
    router.post("/login-user", users.loginUser);
    router.post("/user-profile", users.userProfile);  
   
    router.post("/update-device-token", users.updateDeviceToken); */
    
      
    app.use('/api/v1/user', router);
    
};