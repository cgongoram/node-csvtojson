function csvtojson() {
  var web = require("../libs/interfaces").web;
  var Converter = require("../libs/core").Converter;
  var fs = require("fs");
  var options = require("./options.json");
  var cmds = options.commands;
  var opts = options.options;
  var exps = options.examples;
  // process.stdin.resume();
  process.stdin.setEncoding('utf8');
  var parsedCmd = {
    "cmd": "parse",
    "options": {},
    "inputStream": process.stdin
  };
  function _showHelp() {
    var key;
    console.log("Usage: csvtojson [<command>] [<options>] filepath ");
    console.log("");
    console.log("Commands: ");
    for (key in cmds) {
      if (cmds.hasOwnProperty(key)) {
        console.log("\t%s: %s", key, cmds[key]);
      }
    }
    console.log("Options: ");
    for (key in opts) {
      if (opts.hasOwnProperty(key)) {
        console.log("\t%s: %s", key, opts[key].desc);
      }
    }
    console.log("Examples: ");
    for (var i=0;i<exps.length;i++){
      console.log("\t%s",exps[i]);
    }
    process.exit(0);
  }
  function parse(){
    var is=parsedCmd.inputStream;
    if (is === process.stdin){
      if (is.isTTY){
        console.log("Please specify csv file path or pipe the csv data through.");
        console.log("");
        _showHelp();
      }
    }
    var args=parsedCmd.options;
    args.constructResult=false;
    args.toArrayString=true;
    var converter=new Converter(args);
    is.pipe(converter).pipe(process.stdout);
  }
  function startWebServer(){
    web.startWebServer(parsedCmd.options);
  }
  function run(){
    switch (parsedCmd.cmd){
      case "parse":
        parse();
      break;
      case "startserver":
        startWebServer();
      break;
      default:
        console.log("unknown command %s.",parsedCmd.cmd);
        _showHelp();
    }
  }
  function commandParser() {
    process.argv.slice(2).forEach(function (item) {
      if (item.indexOf("--") > -1) {
        var itemArr = item.split("=");
        var optName = itemArr[0];
        if (opts[optName] === undefined) {
          console.log("Option %s not supported.", optName);
          _showHelp();
        }
        var key = optName.replace("--", "");
        var val = itemArr[1];
        if (val === undefined) {
          val = "";
        }
        var type = opts[optName].type;
        switch (type) {
          case "string":
            val = val.toString();
            break;
          case "boolean":
            var lVal = val.toLowerCase();
            if (lVal === "true" || lVal === "y") {
              val = true;
            } else if (lVal === "false" || lVal === "n") {
              val = false;
            } else {
              console.log("Unknown boolean value %s for parameter %s.", val, optName);
              _showHelp();
            }
            break;
        }
        parsedCmd.options[key] = val;
      } else {
        if (cmds[item]) {
          parsedCmd.cmd = item;
        } else {
          if (fs.existsSync(item)) {
            parsedCmd.inputStream = fs.createReadStream(item);
          } else {
            console.log("unknow parameter %s.",item);
          }
        }
      }
    });
  }
  commandParser();
  run();
}
module.export = csvtojson;
if (!module.parent) {
  csvtojson();
}