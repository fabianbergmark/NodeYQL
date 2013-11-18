/*
 * Yahoo YQL calls.
 */

var request = require('request');

module.exports = function(settings) {

  exports.query = function(query, env) {

    var fiber = fibers.current;

    var url = settings.yql.url
      + '?q=' + query
      + '&format=json'
      + (env ? '&env=' + env : '')
    request(
      { "method": "GET",
        "uri": url },
      function(err, resp, body) {
        if (err) {
          fiber.run(null);
        } else {
          body = JSON.parse(body);
          fiber.run(body.query.results);
        }
      });

    return fibers.yield();
  }

  return exports;
}
