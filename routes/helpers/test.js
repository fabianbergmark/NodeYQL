/*
 * Run YQL test cases.
 */

var fibers = require('fibers')
  , fs = require('fs')
  , DOMParser = require('xmldom').DOMParser
  , request = require('request')
  , xpath = require('xpath')
  , yqlGenerator = require('./yql')
  , jsDiff = require('diff');;

module.exports = function(settings, testcase, js) {

  var yahoo = require('./yahoo.js')(settings);

  var fiber = fibers.current;

  fs.readFile(
    './routes/helpers/empty.xml',
    function(err, data) {
      if (err)
        fiber.run(null);
      else {
        var xml = new DOMParser().parseFromString(data.toString());
        fiber.run(xml);
        }
    });

  var xml = fibers.yield();

  var save =
'function save() {\
  var ret = arguments[0];\
  var result =\
    { "return"   : ret,\
      "arguments": [] };\
  for (var i = 1; i < arguments.length; ++i)\
    result.arguments.push(arguments[i]);\
   return result;\
}';

  var cdata = xml.createCDATASection(save);

  var global = xpath.select('/table/execute', xml)[0];
  global.appendChild(cdata);

  var url = settings.url + '/test/data';

  var cdata = xml.createCDATASection(js);

  var execute = xpath.select('//select//execute', xml)[0];
  execute.appendChild(cdata);

  exports.xml = xml;

  exports.run = function() {
    var local = executeLocal();
    var remote = executeRemote();

    var diff;
    var pass = false;

    if (local.result !== undefined && remote.result !== undefined) {
      diff = jsDiff.diffLines(
        JSON.stringify(local.result, null, 2),
        JSON.stringify(remote.result, null, 2));

      pass = !diff.some(function(d) {return d.added || d.removed; });
    }

    return { "local": local,
             "remote": remote,
             "diff": diff,
             "pass": pass };
  }

  function executeLocal() {
    var select = xpath.select('//select', xml)[0];
    var yql = yqlGenerator(settings, 'empty', xml, select);
    return yql.run({});
  }

  function executeRemote() {
    var query = "SELECT * FROM " + testcase + ";";
    var env = settings.url + '/test/' + testcase + '/env';
    return yahoo.query(query, env);
  }

  return exports;
}
