var express = require("express");
var router = express.Router();

const fs=require('fs');
let routes=fs.readdirSync("./routes")

for(let route of routes){
  if(route.includes(".js") && route != 'index.js'){
    router.use("/"+route.replace(".js",""),require('./'+route))
  }
}

module.exports = router;
