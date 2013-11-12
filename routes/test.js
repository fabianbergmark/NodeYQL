/*
 * Generate YQL test handler.
 */

var request =  require('request')
  , fibers = require('fibers')
  , xpath = require('xpath');

module.exports = function(settings, table, xml) {

  var yql = require('./yql')(settings, table, xml);

  exports.getSrc = function(req, res) {
    res.setHeader('Content-Type', 'application/xml');
    res.send(xml.toString());
  }

  exports.getRun = function(req, res) {

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

  exports.getEnv = function(req, res) {
    res.send(environment());
  }

  function environment() {
    var name = table.replace(/\//g, '\.');
    return 'USE "' + settings.url + '/test/' + table + '/src" AS ' + name + ';';
  }

  exports.environment = environment;

  function run() {

    var samples = xpath.select('//sampleQuery', xml);

    if (samples.length > 0) {
      var vars = {};
      var sample = samples[0].toString().replace(/<sampleQuery>(.*?)<\/sampleQuery>/g, '$1');
      var regexp =
        /.*?where\s+(.*?)\s*=\s*'(.*?)'(?:\s+and\s+(.*?)\s*=\s*'(.*?)')*;.*?/gi;

      var vs = regexp.exec(sample);
      vs.shift();
      for (var i = 0; i < vs.length-1; i+=2) {
        var k = vs[i];
        var v = vs[i+1];
        vars[k] = v;
      }

      execute(sample)

      //yql.run(vars);
    }
  }

  exports.run = run;

  function execute(query) {
    var env = settings.url + '/test/' + table + '/env';
    var url = settings.yql.url
      + '?q=' + query
      + '&env=' + env;
    console.log(url);
    request(
      { "method": "GET",
        "uri": url },
      function(err, resp, body) {
        console.log(body);
      });
  }

  return exports;
}
