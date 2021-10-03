module.exports = app => {
    const sales = require("../controllers/sale.controller");
    
    var router = require("express").Router();
    var tools = require('../config/utils');

    // create new user
    router.post("/make-sale", sales.makeSale);
    router.post("/user-sales", sales.allSellerRecords);
   /* router.post("/check-username", users.checkUserName);
    
    router.post("/resend-verification", users.resendVerification);
    router.post("/login-user", users.loginUser);
    router.post("/user-profile", users.userProfile);  
   
    router.post("/update-device-token", users.updateDeviceToken); */
    
      
    app.use('/api/v1/sale', router);
    
};