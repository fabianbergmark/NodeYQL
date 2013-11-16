/*
 * Generate YQL test handler.
 */

var fibers  = require('fibers')
  , xpath   = require('xpath')
  , fs = require('fs')
  , helper = require('./helpers/test')
  , uuidv4  = require('uuid-v4')
  , DOMParser = require('xmldom').DOMParser
  , jsDiff = require('diff');

var transform = require('./helpers/transform');

module.exports = function(settings, table, js) {

  var test = helper(settings, table, js);

  var xml = test.create();

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
    var env = 'USE "' + settings.url + '/test/' + table + '/src" AS ' + table + ';';
    res.send(env);
  }

  function executeLocal() {
    var select = xpath.select('//select', xml)[0];
    var yql = require('./helpers/yql')(settings, 'empty', xml, select);
    return yql.run({});
  }

  function executeRemote() {
    var query = "SELECT * FROM " + table + ";";
    return test.execute(query, table);
  }

  function run() {
    var local = executeLocal();
    var remote = executeRemote();

    var diff = jsDiff.diffLines(
      JSON.stringify(local, null, 2),
      JSON.stringify(remote, null, 2));

    return { "local" : local,
             "remote": remote,
             "diff"  : diff };
  }

  exports.run = run;

  return exports;
}
