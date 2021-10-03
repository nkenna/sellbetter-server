const dbConfig = require('../config/db.config');
const mongoose = require('mongoose');

const db = {};
db.url = dbConfig.url;
db.mongoose = mongoose;
db.users = require('./user.model')(mongoose);
db.verifycodes = require('./verifycode.model')(mongoose);
db.resetcodes = require('./resetcode.model')(mongoose);
db.sales = require('./sale.model')(mongoose);


module.exports = db;