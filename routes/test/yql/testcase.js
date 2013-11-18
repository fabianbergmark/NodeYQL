/*
 * Generate YQL testcase handler.
 */

var fibers  = require('fibers'),
    xpath   = require('xpath'),
    fs = require('fs'),
    uuidv4  = require('uuid-v4'),
    DOMParser = require('xmldom').DOMParser;

var transform = require('../../helpers/transform');

module.exports = function(settings, testcase, js) {

  var helper = require('../../helpers/test')
  delete require.cache[require.resolve('../../helpers/test')];

  var test = helper(settings, testcase, js);

  exports.js = js;
  exports.testcase = testcase;

  exports.getRun = function(req, res) {
    fibers(function() {
      var result = run();

      var pass = false;
      if (result.diff !== undefined)
        pass = !result.diff.some(function(d) {return d.added || d.removed; });

      var local;
      var remote;
      var diff;

      if (result.local.result)
        local = JSON.stringify(result.local.result, null, 2)
        .replace(/\\n/g, '\n')
        .replace(/\\\"/g, '"');
      else
        local = JSON.stringify(result.local.error, null, 2);
      if (result.remote.result)
        var remote = JSON.stringify(result.remote.result, null, 2)
        .replace(/\\n/g, '\n')
        .replace(/\\\"/g, '"');
      else
        remote = JSON.stringify(result.remote.error, null, 2);
      if (result.diff)
        diff = JSON.stringify(result.diff, null, 2)
        .replace(/\\n/g, '\n')
        .replace(/\\\"/g, '"')
        .replace(/\\/g, '');
      res.render('test/testcase',
                 { 'testcase': testcase,
                   'src': js,
                   'pass': result.pass,
                   'result': { 'local': local,
                               'remote': remote,
                               'diff': diff } });
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
