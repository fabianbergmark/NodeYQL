/*
 * Run YQL test cases.
 */

var fibers = require('fibers')
  , fs = require('fs')
  , request = require('request')
  , xpath = require('xpath')
  , yqlGenerator = require('./yql')
  , jsDiff = require('diff');;

module.exports = function(settings, testcase, xml, compare) {

  var yahoo = require('./yahoo.js')(settings);

  exports.run = function(sid) {
    var local = executeLocal(sid);
    var remote = executeRemote();

    var diff;
    var pass = false;

    if (local && remote) {
      if (local.result && remote.result) {
        diff = jsDiff.diffLines(
          JSON.stringify(local.result, null, 2),
          JSON.stringify(remote.result.result, null, 2));
        pass = !diff.some(function(d) { return d.added || d.removed; });
      }
      if (compare)
        pass = compare(local, remote.result);
    }

    return { "local": local,
             "remote": remote,
             "result": { "pass": pass,
                         "diff": diff } };
  }

  function executeLocal(sid) {
    var select = xpath.select('//select', xml)[0];
    var yql = yqlGenerator(settings, 'empty', xml, select);
    return yql.run({}, sid);
  }

  function executeRemote() {
    var query = "SELECT * FROM " + testcase + ";";
    var env = settings.url + '/test/' + testcase + '/env';
    return yahoo.query(query, env);
  }

  return exports;
}
