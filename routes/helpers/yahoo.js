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
        var response = {};
        response.data = body;
        if (!err && (resp.statusCode == 200 || resp.statusCode == 400)) {
          body = JSON.parse(body);
          if (body.error) {
            response.error = body.error;
          } else if (body.query)
            response.result = body.query.results;
          else
            response.error =  'Invalid response';
        } else
          response.error = err;
        fiber.run(response);
      });

    return fibers.yield();
  }

  return exports;
}
