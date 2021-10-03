const db = require("../models/index");
const User = db.users;
const VerifyCode = db.verifycodes;
const ResetCode = db.resetcodes;
const Sale = db.sales;
const Device = db.devices;
const os = require('os');
var fs = require('fs');
const path = require("path");
var mime = require('mime');
var tools = require('../config/utils');
const cryptoRandomString = require('crypto-random-string');
const moment = require("moment");
const ExcelJS = require('exceljs');

exports.makeSale = (req, res) => {
    var result = {}; 
    var content = req.body.content;
    var sellerId = req.body.sellerId;
    var amount = req.body.amount;
    var creditSale = req.body.creditSale;
    var balance = req.body.balance;

    User.findOne({_id: sellerId})
    .then(seller => {
        if(!seller){
            result.status = "failed";
            result.message = "seller data not found";
            return res.status(404).send(result);
        }
        

        var sale = new Sale({
            content: content,
            amount: amount,
            sellerId: sellerId,
            creditSale: creditSale,
            balance: balance,
            ref: cryptoRandomString({length: 10, type: 'alphanumeric'}),
            seller: seller._id,
        });

        sale.save(sale)
        .then(newSale => {
            result.status = "success";
            result.sale = newSale;
            result.message = "sale was successful";
            return res.status(200).send(result);
        })
        .catch(err => {
            console.log(err);
            result.status = "failed";
            result.message = "error occurred saving sale";
            return res.status(500).send(result);
        });


    })
    .catch(err => {
        console.log(err);
        result.status = "failed";
        result.message = "error occurred finding seller";
        return res.status(500).send(result);
    });
}

exports.payCredit = (req, res) => {
    var result = {};

    var saleId = req.body.saleId;
    var sellerId = req.body.sellerId;
    var settleAmount = req.body.settleAmount;

    User.findOne({_id: sellerId})
    .then(seller => {
        if(!seller){
            result.status = "failed";
            result.message = "seller data not found";
            return res.status(404).send(result);
        }
        
        // find sale data
        Sale.findOne({_id: saleId})
        .then(sale => {
            if(!sale){
                result.status = "failed";
                result.message = "sale data not found";
                return res.status(404).send(result);
            }

            sale.balance = sale.balance + settleAmount;
            Sale.updateOne({_id: sale._id}, sale)
            .then(data => {
                result.status = "success";
                result.message = "sale balance updated";
                return res.status(200).send(result);
            })
        })
    })
    .catch(err => {
        console.log(err);
        result.status = "failed";
        result.message = "error occurred finding seller";
        return res.status(500).send(result);
    });

}

exports.allSellerRecords = (req, res) => {
    var result = {};

    Sale.find({sellerId: req.body.sellerId})
    .populate('seller', {password: 0})
    .then(sales => {
        result.status = "success";
        result.message = "sales found";
        result.salesCount = sales.length;
        result.sales = sales;
        return res.status(200).send(result);
    })
    .catch(err => {
        console.log(err);
        result.status = "failed";
        result.message = "error occurred finding sales";
        return res.status(500).send(result);
    });
}

