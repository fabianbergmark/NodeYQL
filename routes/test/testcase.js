/*
 * Generate YQL testcase handler.
 */

var fibers  = require('fibers')
  , xpath   = require('xpath')
  , fs = require('fs')
  , uuidv4  = require('uuid-v4')
  , DOMParser = require('xmldom').DOMParser;

var transform = require('../helpers/transform');

module.exports = function(settings, testcase, js) {

  var helper = require('../helpers/test')
  delete require.cache[require.resolve('../helpers/test')];

  var test = helper(settings, testcase, js);

  exports.js = js;
  exports.testcase = testcase;

  exports.getRun = function(req, res) {
    fibers(function() {
      var result = run();

      var pass = !result.diff.some(function(d) {return d.added || d.removed; });

      result.local = JSON.stringify(result.local, null, 2)
        .replace(/\\n/g, '\n')
        .replace(/\\\"/g, '"');
      result.remote = JSON.stringify(result.remote, null, 2)
        .replace(/\\n/g, '\n')
        .replace(/\\\"/g, '"');
      result.diff = JSON.stringify(result.diff, null, 2)
        .replace(/\\n/g, '\n')
        .replace(/\\\"/g, '"')
        .replace(/\\/g, '');
      res.render('test/testcase',
                 { 'testcase': testcase,
                   'src': js,
                   'pass': result.pass,
                   'result': result });
    }).run();
  }

  exports.getApiRun = function(req, res) {
    fibers(function() {
      var result = run();
      res.send(result);
    }).run();
  }

  exports.getSrc = function(req, res) {
    res.setHeader('Content-Type', 'application/xml');
    res.send(test.xml.toString());
  }

  exports.getEnv = function(req, res) {
    var use =
      'USE "' + settings.url +
      '/test/' + testcase + '/src" AS ' + testcase + ';';
    res.send(use);
  }

  exports.getDesc = function(req, res) {
    res.send('TODO');
  }

  function run() {
    return test.run();
  }

  return exports;
}
