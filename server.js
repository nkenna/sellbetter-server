#!/usr/bin/env nodejs

const express = require("express");
const bodyParser = require('body-parser');
const formidable = require('formidable');
const cors = require("cors");
const db = require("./models");
const fileUpload = require('express-fileupload');
const os = require('os');
var fs = require('fs');
const path = require("path");
const app = express();

app.use(cors());
app.options('*', cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload({
  useTempFiles : true,
  debug: true
}));

var filesFolderAvatar = path.join(__dirname, 'files/images/avatars');
var filesFolderHeaders = path.join(__dirname, 'app/controllers/images/headers');
var filesFolderPosts = path.join(__dirname, 'app/controllers/images/posts');

console.log(filesFolderAvatar);
console.log(filesFolderHeaders);
console.log(filesFolderPosts);

//app.use('/static', express.static(path.join(__dirname, 'public')))

app.use('/media-avatar', express.static(filesFolderAvatar));
app.use('/media-header', express.static(filesFolderHeaders));
app.use('/media-post', express.static(filesFolderPosts));


db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

  require("./routes/user.routes")(app);
  require("./routes/sale.routes")(app);


  app.get("/", (req, res) => {
    res.send("hello apache men");
});

const PORT = process.env.PORT || 8181;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}.`);
});