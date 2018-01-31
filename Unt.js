var express = require("express");
var app = express();
const bcrypt = require('bcrypt');


      var apassword = 'test'

      var bpassword = "dishwasher-funk"

      var cpassword = "top-music"

      var dpassword = "ferrari25"

const hashedPassword = bcrypt.hashSync(dpassword, 10);
console.log(hashedPassword)