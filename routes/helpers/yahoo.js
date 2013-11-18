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
      + '&debug=true'
      + '&diagnostics=true';
    request(
      { "method": "GET",
        "uri": url },
      function(err, resp, body) {
        if (!err && (resp.statusCode == 200 || resp.statusCode == 400)) {
          body = JSON.parse(body);
          if (body.error) {
            fiber.run({ 'error': body.error });
          } else if (body.query)
            fiber.run({ 'result': body.query.results });
          else
            fiber.run({ 'error': 'Invalid response' });
        } else
          fiber.run({ 'error': err });
      });

    return fibers.yield();
  }

  return exports;
}
