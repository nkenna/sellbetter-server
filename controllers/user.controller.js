const db = require("../models/index");
const User = db.users;
const VerifyCode = db.verifycodes;
const ResetCode = db.resetcodes;
const Device = db.devices;
const os = require('os');
var fs = require('fs');
const path = require("path");
var mime = require('mime');
var tools = require('../config/utils');
const cryptoRandomString = require('crypto-random-string');
const moment = require("moment");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const ExcelJS = require('exceljs');
const { supporters } = require("../models");

exports.createUser = (req, res) => {
    var result = {};
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var phone = req.body.phone;
  

    if(!email){
        result.status = "failed";
        result.message = "email is required";
        return res.status(400).send(result);
    }

    if(!password){
        result.status = "failed";
        result.message = "password is required";
        return res.status(400).send(result);
    }

    if(!phone){
        result.status = "failed";
        result.message = "phone number is required";
        return res.status(400).send(result);
    }

    if(password.length < 8){
        result.status = "failed";
        result.message = "password length must be equal to or greater than 8 characters.";
        return res.status(400).send(result);
    }

    User.findOne({ email: {$regex : email, $options: 'i'}})
    .then(userd => {
        if(userd){
            result.status = "failed";
            result.message = "email already exist";
            return res.status(409).send(result); 
        }

        bcrypt.hash(password, saltRounds, (err, hash) => {
            // Now we can store the password hash in db.
            if(err){
                result.status = "failed";
                result.message = "unknown error occurred - password hash failed";
                return res.status(500).send(result);
            }
    
            var newUser = new User({
                email: email,
                password: hash,
                name: name,
                phone: phone
            });

                
            newUser.save(newUser)
            .then(user => {
                // send verification email
                var vcode = new VerifyCode({
                    code: cryptoRandomString({length: 6, type: 'alphanumeric'}),
                    username: user.username,
                    userId: user._id
                });
    
                vcode.save(vcode)
                .then(vc => {
                    console.log("done creating verification code");
                    var emailtext = "<p>To verify your account. Click on this link or copy to your browser: " +
                    "https://sellbetter.com/verify-account/" + vc.code + "</p>";
                    
                    tools.sendEmail(
                        user.email,
                        "New Account Verification",
                        emailtext
                    );
                })
                .catch(err => console.log("error sending email"));
    
                
                result.status = "success";
                result.message = "user account created successfully";
                return res.status(200).send(result); 
    
                
            });
        });
    })
    .catch(err => {
        console.log(err);
        result.status = "failed";
        result.message = "error occurred finding email";
        return res.status(500).send(result);
    });  

    
}

exports.verifyUser = (req, res) => {
    var result = {};

    var code = req.body.code;

    if(!code){
        result.status = "failed";
        result.message = "invalid verification code";
        return res.status(400).send(result);
    }

    VerifyCode.findOne({code: code})
    .then(vc => {
        if(!vc){
            result.status = "failed";
            result.message = "invalid verification code";
            return res.status(404).send(result);
        }

        //find user
        User.findOne({_id: vc.userId})
        .then(user => {
            if(!user){
                result.status = "failed";
                result.message = "user not found";
                return res.status(404).send(result);
            }

            user.verified = true;
            User.updateOne({_id: user._id}, user)
            .then(vidd => console.log("done"))
            .catch(err => console.log("error updating user"));

            // delete verification code data
            VerifyCode.deleteOne({code: vc.code})
            .then(vidd => console.log("done deleting"))
            .catch(err => console.log("error verification code data"));

            var emailtext = "<p>Dear, " + user.username + "</p>" +
                            "You are indeed welcome to Dakowa. Dakowa platform is all about making it easy" +
                            " to get the best out of your loyal fans and audience. Feel free to check out our " +
                            "<a href=" +"https://dakowa.com/about" + ">about page</a> and <a href=\"https://dakowa.com/faq\">FAQ page</a> in order to learn more about this wonderful platform." +
                            "<p>Incase, you get confuse on how to use and navigate the platform, you can check out some of our tutorials on Medium:" +
                            "<ul>" +
                            "<li><a href=" + "https://ngdakowa.medium.com/how-to-create-a-page-on-dakowa-fce6af580593" +">Creating a Page on Dakowa</a></li>" +
                            "<li><a href=" + "https://ngdakowa.medium.com/how-to-upgrade-from-a-normal-dakowa-user-to-a-dakowa-creator-e8c04bd30f78" +">Upgrading from normal user to a Dakowa Creator</a></li>" +
                            "<li><a href=" + "https://ngdakowa.medium.com/integration-and-customization-on-dakowa-23f0d6cd0afe" + ">Integration and customization on Dakowa</a></li>" +
                            "<li><a href=\"\">Adding payment info on Dakowa</a></li>" +
                            "</ul>" +
                            "</p>" +
                            "<p>We believe that these few tutorials can get you started and you can always reach us on any of our communication channels.</p>" +
                            "<p>Thanks, Dakowa Team</p>"
                    
            tools.sendEmail(
                user.email,
                "Dakowa Family welcomes you",
                emailtext
            );

            var userData = {
                id: user._id,
                email: user.email,
                headerImage: user.headerImage,
                avatar: user.avatar,
                username: user.username,
                name: user.name
            }

            // find dakowa and follow the account
            User.findOne({email: "ngdakowa@gmail.com"})
            .then(dak => {
                if(!dak){
                    // follow dak
                    // check against duplicate follow
                    Follow.findOne({follower: user._id, following: dak._id})
                    .then(follow => {
                        if (!follow) {
                            if (dak._id != user._id) {
                                var follow = new Follow({
                                    follower: userFollower._id,
                                    following: user._id
                                }); 

                                follow.save(follow)
                                .then(data => {                                              
                                    console.log("Followed dakowa successfully")
                                })
                                .catch(err => {
                                    console.log(err);                                    
                                });
                            } 
                        } 
                        
                })
                }
            });

            result.status = "success";
            result.user = userData;
            result.message = "user verified successfully";
            return res.status(200).send(result);
        })
        .catch(err => {
            console.log(err);
            result.status = "failed";
            result.message = "error occurred finding user for verification";
            return res.status(500).send(result);
        });
    })
    .catch(err => {
        console.log(err);
        result.status = "failed";
        result.message = "error occurred verifying user";
        return res.status(500).send(result);
    });
}

exports.resendVerification = (req, res) => {
    var result = {};
    var email = req.body.email;

    if(!email){
        result.status = "failed";
        result.message = "email is required";
        return res.status(400).send(result);
    }

    User.findOne({email: email})
    .then(user => {
        if(!user){
            result.status = "failed";
            result.message = "user not found";
            return res.status(404).send(result);
        }

        // user was found. get the verification code
        VerifyCode.findOne({userId: user._id})
        .then(vc => {
            if(!vc){
                result.status = "failed";
                result.message = "user verification code not found";
                return res.status(404).send(result);
            }


            // send verification code in mail
            var emailtext = "To verify your account. Click on this link or copy to your browser: " +
                "https://dakowa.com/verify-account/" + vc.code ;

                    
                    
            tools.sendEmail(
                user.email,
                "New Account Verification",
                emailtext
            );

            result.status = "success";
            result.message = "user verification email sent";
            return res.status(200).send(result);
        });
    });
}

exports.loginUser = (req, res) => {
    var result = {};
    
    var phone = req.body.phone;
    var password = req.body.password;

    User.findOne({phone: phone})
    .then(user => {
        if(!user){
            result.status = "failed";
            result.message = "account does not exist";
            return res.status(404).send(result); 
        }

        // match user password since user exist
        bcrypt.compare(password, user.password, (err, resx) => {
            // if res == true, password matched
            // else wrong password
            if(resx == false){
                result.status = "failed";
                result.message = "wrong account credentials";
                return res.status(401).send(result);
            }


            if(user.verified == false){
                result.status = "failed";
                result.message = "unverified account";
                return res.status(423).send(result);
            }

            if(user.status == false){
                result.status = "failed";
                result.message = "flagged account";
                return res.status(403).send(result);
            }

            // everything seems alright, generate token
            var data = {
                email: user.email,
                userId: user._id
            }
            const token = tools.generateAccessToken(data);

            var userData = {
                email: user.email,
                name: user.name,
                id: user._id,
                avatar: user.avatar,
                phone: user.phone
            }

            result.user = userData;
            result.token = token;
            result.status = "success";
            result.message = "authenication success";
            return res.status(200).send(result);
        });
    
    })
    .catch(err => {
        console.log(err);
        result.status = "failed";
        result.message = "error occurred finding user";
        return res.status(500).send(result);
    });

}

exports.changePassword = (req, res) => {
    var result = {};

    var currentPassword = req.body.currentPassword;
    var newPassword = req.body.newPassword;
    var userId = req.body.userId;

    if(!newPassword){
        result.status = "failed";
        result.message = "password is required";
        return res.status(400).send(result);
    }

    if(newPassword.length < 8){
        result.status = "failed";
        result.message = "password length must be equal to or greater than 8 characters.";
        return res.status(400).send(result);
    }



    User.findOne({_id: userId})
    .then(user => {
        if(!user){
            result.status = "failed";
            result.message = "account does not exist";
            return res.status(404).send(result); 
        }

        bcrypt.compare(currentPassword, user.password, (err, resx) => {
            if(err){
                result.status = "failed";
                result.message = "error occurred changing password";
                return res.status(500).send(result);
            }

            if(resx == false){
                result.status = "failed";
                result.message = "wrong current password supplied";
                return res.status(401).send(result);
            }

            // change password
            bcrypt.hash(newPassword, saltRounds, (errx, hash) => {
                if(errx){
                    result.status = "failed";
                    result.message = "error occurred changing password";
                    return res.status(500).send(result);
                }

                user.password = hash;
                User.updateOne({username: user.username}, user)
                .then(updateData => {
                    result.status = "success";
                    result.message = "user updated successfully";
                    return res.status(200).send(result);
                })
                .catch(err => {
                    console.log(err);
                    result.status = "failed";
                    result.message = "error occurred during operation";
                    return res.status(500).send(result);
                });

            })
        })
       
    })
    .catch(err => {
        console.log(err);
        result.status = "failed";
        result.message = "error occurred finding user";
        return res.status(500).send(result);
    });
}

exports.sendResetEmail = (req, res) => {
    var result = {};
    var email = req.body.email;

    if(!email){
        result.status = "failed";
        result.message = "email is required";
        return res.status(400).send(result);
    }

    User.findOne({email: email})
    .then(user => {
        if(!user){
            result.status = "failed";
            result.message = "this email is not attached to any account";
            return res.status(404).send(result);
        }

        var code = cryptoRandomString({length: 32, type: 'alphanumeric'})

        // save code
        var rcode = new ResetCode({
            code: code,
            username: user.username,
            userId: user._id
        });

        rcode.save(rcode)
        .then(rc => {
            console.log("done creating verification code");
            var emailtext = "<p>You requested to reset your password. If you did not make this request, please contact support and change your password. If not, copy and paste this code on the required field: " +
            rc.code + "</p>" +
            "<p>Dakowa Team</p>";
            
            tools.sendEmail(
                user.email,
                "Reset Account password",
                emailtext
            );

            result.status = "success";
            result.message = "user reset password email sent";
            return res.status(200).send(result);
        })
        .catch(err => console.log("error sending email"));      
       
    });
}

exports.resetPassword = (req, res) => {
    var result = {};

    var code = req.body.code;
    var password = req.body.password;

   ResetCode.findOne({code: code})
   .then(rcode => {
    if(!rcode){
        result.status = "failed";
        result.message = "invalid reset code recieved";
        return res.status(400).send(result);
    }

    User.findOne({_id: rcode.userId})
    .then(user => {
        if(!user){
            result.status = "failed";
            result.message = "no user account found";
            return res.status(404).send(result);
        }

        bcrypt.hash(password, saltRounds, (err, hashed) => {
            if(err){
                result.status = "failed";
                result.message = "unknown error occurred - password hash failed";
                return res.status(500).send(result);
            }

            user.password = hashed;
            User.updateOne({_id: user._id}, user)
            .then(data => {
                result.status = "success";
                result.message = "password reset was successful. Procees to login";
                return res.status(200).send(result);
            })
            .catch(err => {
                console.log(err);
                result.status = "failed";
                result.message = "error occurred resetting password";
                return res.status(500).send(result);
            });

        });
    }).catch(err => {
        console.log(err);
        result.status = "failed";
        result.message = "error occurred finding user";
        return res.status(500).send(result);
    });


   })
   .catch(err => {
    console.log(err);
    result.status = "failed";
    result.message = "error occurred finding code";
    return res.status(500).send(result);
});

    
}




