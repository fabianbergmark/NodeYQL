/*
 * Generate YQL handler.
 */

var fibers = require('fibers')
  , xpath = require('xpath');

module.exports = function(settings, table, xml) {

  exports.getSrc = function(req, res) {
    res.setHeader('Content-Type', 'application/xml');
    res.send(xml.toString());
  }

  exports.postRun = function(req, res) {

    fibers(function() {
      var post = req.body;

      try {
        var result = run(post);
        res.send(result);
      } catch (err) {
        res.send(err);
      }
    }).run();
  }

  exports.getTest = function(req, res) {

    fibers(function() {

        var results = test();
        res.send(results);

    }).run();
  }

  exports.getEnv = function(req, res) {
    res.send(environment());
  }

  function environment() {
    var name = table.replace(/\//g, '\.');
    return 'USE "' + settings.url + '/' + table + '/src" AS ' + name + ';';
  }

  exports.environment = environment;

  function test() {

    var samples = xpath.select('//sampleQuery', xml);

    if (samples.length > 0) {
      var vars = {};
      var sample = samples[0].toString();
      var regexp =
        /.*?where\s+(.*?)\s*=\s*'(.*?)'(?:\s+and\s+(.*?)\s*=\s*'(.*?)')*;.*?/gi;

      var vs = regexp.exec(sample);
      vs.shift();
      for (var i = 0; i < vs.length-1; i+=2) {
        var k = vs[i];
        var v = vs[i+1];
        vars[k] = v;
      }

      return run(vars);
    }
  }

  exports.test = test;

  function run(vars) {
    var selects = xpath.select('//select', xml);

    var env = {};

    if (!selects) {
      throw 'No selects';
    }

    var response;

    selects.some(function(select) {

      var yql = require('./helpers/yql')(table, select);

      var keys = xpath.select('//key', select);

      var missing = keys.some(function(key) {
        var id       = key.getAttribute('id')
          , as       = key.getAttribute('as')
          , def      = key.getAttribute('default')
          , type     = key.getAttribute('paramType')
          , required = key.getAttribute('required');

        if (required == 'true') {
          if (vars[id] === undefined && def === undefined) {
            return true;
          }
        }

        if (vars[id] !== undefined || def !== undefined) {
          var value;
          if (vars[id] !== undefined)
            value = vars[id];
          else
            value = def;

          env[id] = value;
        }
      });

      if (missing)
        return false;

      var execute =
        xpath.select('//execute', xml)
        .toString()
        .replace(/[\s\S]*CDATA\[([\s\S]*?)\]\][\s\S]*/, '$1');

      response = yql.run(execute, env);
      return true;
    });
    return response;
  }

  exports.run = run;

  return exports;
}
