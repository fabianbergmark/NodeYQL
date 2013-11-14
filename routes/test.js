/*
 * Generate YQL test handler.
 */

var request = require('request')
  , fibers  = require('fibers')
  , xpath   = require('xpath')
  , fs = require('fs')
  , uuidv4  = require('uuid-v4')
  , DOMParser = require('xmldom').DOMParser
  , DOM = require('xmldom').DOMImplementation;

var transform = require('./helpers/transform');

module.exports = function(settings, xml) {

  var table = 'test';

  var test = require('./helpers/test')(settings, xml);

  xml = test.create();

  exports.getRun = function(req, res) {

    fibers(function() {

      var result = run();
      res.send(result);

    }).run();
  }

  exports.getSrc = function(req, res) {
    res.setHeader('Content-Type', 'application/xml');
    res.send(xml.toString());
  }

  exports.getEnv = function(req, res) {
    res.send(environment());
  }

  function environment() {
    return 'USE "' + settings.url + '/test/src" AS ' + test + ';';
  }

  function executeLocal() {
    var select = xpath.select('//select', xml)[0];
    var yql = require('./helpers/yql')(settings, 'empty', xml, select);
    return yql.run({});
  }

  function executeRemote() {
    var query = "SELECT * FROM test;";
    execute(query);
  }

  exports.getData = function(req, res) {

    fs.readFile('routes/helpers/example.json', function (err, data) {
      res.send(data.toString());
    });

  }

  function run() {
    executeLocal();
    executeRemote();
  }

  exports.run = run;

  function execute(query) {
    var env = settings.url + '/test/env';
    var url = settings.yql.url
      + '?q=' + query
      + '&env=' + env;
    request(
      { "method": "GET",
        "uri": url },
      function(err, resp, body) {
        console.log(body);
      });
  }

  return exports;
}
