/*
 * Generate YQL testcase handler.
 */

var fibers  = require('fibers'),
    xpath   = require('xpath'),
    fs = require('fs'),
    uuidv4  = require('uuid-v4'),
    DOMParser = require('xmldom').DOMParser;

var transform = require('../../helpers/transform');

module.exports = function(settings, testcase, js, comp) {

  var helper = require('../../helpers/test')
  delete require.cache[require.resolve('../../helpers/test')];

  var test = require('../helpers/test')(settings, testcase, xml, comp);
  delete require.cache[require.resolve('../helpers/test')];

  exports.js = js;
  exports.testcase = testcase;

  exports.getRun = function(req, res) {

    var sid = req.sessionID;

    fibers(function() {
      var result = run(sid);

      var pass = false;
      if (result.diff !== undefined)
        pass = !result.diff.some(function(d) {return d.added || d.removed; });

      var local;
      var remote;
      var yahoo;
      var diff;

      if (result.local.result)
        local = JSON.stringify(result.local.result, null, 2)
        .replace(/\\n/g, '\n')
        .replace(/\\\"/g, '"');
      else
        local = JSON.stringify(result.local.error, null, 2);
      if (result.remote.result && result.remote.result.result)
        remote = JSON.stringify(result.remote.result.result, null, 2)
        .replace(/\\n/g, '\n')
        .replace(/\\\"/g, '"');
      else
        remote = JSON.stringify(result.remote.error, null, 2);
      if (result.remote.data)
        yahoo = result.remote.data;

      if (result.result.diff)
        diff = JSON.stringify(result.result.diff, null, 2)
        .replace(/\\n/g, '\n')
        .replace(/\\\"/g, '"')
        .replace(/\\/g, '');
      res.render('test/testcase',
                 { 'testcase': testcase,
                   'src': js,
                   'result': { 'local': local,
                               'remote': remote,
                               'diff': diff,
                               'pass': result.result.pass,
                               'yahoo': yahoo } });
    }).run();
  }

  exports.getApiRun = function(req, res) {

    var sid = req.sessionID;

    fibers(function() {
      var result = run(sid);
      res.send(result);
    }).run();
  }

  exports.getSrc = function(req, res) {
    res.setHeader('Content-Type', 'application/xml');
    res.send(xml.toString());
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

  function run(sid) {
    return test.run(sid);
  }

  return exports;
}
