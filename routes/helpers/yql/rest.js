/*
 * Create YQL global Rest object.
 */

var fibers = require('fibers')
  , future =  require('fibers/future')
  , wait = future.wait
  , xpath = require('xpath')
  , request = require('request');

module.exports = function(table, select) {

  function createHeaders(vars) {
    var result = {};
    var headers = xpath.select('//key[@paramType=\'header\']', select);

    headers.forEach(function(header) {
      var id = header.getAttribute('id');
      if (vars[id] !== undefined) {
        result[id] = vars[id];
      }
    });
    return result;
  }

  function createUrl(vars) {

    var url = xpath.select('//url', select).toString().replace(/<url>([\s\S]*?)<\/url>/, '$1');

    var params = (/{(.*?)}/g).exec(url);
    params.shift();
    for (var i = 0; i < params.length; ++i) {
      var param = params[i];
      var key = xpath.select('//key[@id=\'' + param +  '\' and @paramType=\'path\']', select);
      if (key) {
        key = key[0];

        var val = "";
        if (vars[param] !== undefined) {
          val = vars[param];
        }

        url = url.replace('{' + param + '}', val);
      }
    }

    var first = true;

    var querys = xpath.select('//key[@paramType=\'query\']', select);

    querys.forEach(function(query) {
      var id = query.getAttribute('id');
      if (vars[id] !== undefined && vars[id] !== '') {
        url += first ? '?' : '&';
        url += id + '=' + vars[id];
        if (first)
          first = false;
      }
    });

    return url;
  }

  exports.create = function(vars) {

    var url = createUrl(vars);
    var headers = createHeaders(vars);

    var rest = {
      "headers": headers,
      "url": url,
      "queryParms": "",
      "matrixParams": {},
      "accept": accept,
      "decompress": decompress,
      "del": del,
      "fallbackCharset": fallbackCharset,
      "filerChars": filterChars,
      "forceCharset": forceCharset,
      "get": get,
      "head": head,
      "jsonCompat": jsonCompat,
      "matrix": matrix,
      "path": path,
      "post": post,
      "put": put,
      "query": query,
      "timeout": timeout
    };

    function accept(contentType) {

    }

    function decompress(bool) {

    }

    function del() {
      var result = {
        "response": {}};

      var fiber = fibers.current;

      request(
        { "method"  : "DELETE",
          "uri"     : rest.url,
          "headers" : rest.headers },
        function(err, resp, body) {
          result.response = body;
          result.headers = resp.headers;
          result.status = resp.statusCode;
          result.timeout = false;
          result.url = rest.url;
          fiber.run();
        });

      fibers.yield();
      return result;
    }

    function fallbackCharset(charsets) {

    }

    function filterChars(filters) {

    }

    function forceCharset(charsets) {

    }

    function get() {
      var result = {
        "response": {}};

      var fiber = fibers.current;

      request(
        { "method"  : "GET",
          "uri"     : rest.url,
          "headers" : rest.headers },
        function(err, resp, body) {
          result.response = body;
          result.headers = resp.headers;
          result.status = resp.statusCode;
          result.timeout = false;
          result.url = rest.url;
          fiber.run();
        });

      fibers.yield();
      return result;
    }

    function head() {
      var result = {
        "response": {}};

      var fiber = fibers.current;

      request(
        { "method"  : "HEAD",
          "uri"     : rest.url,
          "headers" : rest.headers },
        function(err, resp, body) {
          result.response = body;
          result.headers = resp.headers;
          result.status = resp.statusCode;
          result.timeout = false;
          result.url = rest.url;
          fiber.run();
        });

      fibers.yield();
      return result;
    }

    function header(name, value) {
      rest.headers[name] = value;
    }

    function jsonCompat(mode) {

    }

    function matrix(name, value) {

    }

    function path(segment) {

    }

    function post(content) {
      var result = {
        "response": {}};

      var fiber = fibers.current;

      request(
        { "method"  : "POST",
          "uri"     : rest.url,
          "headers" : rest.headers,
          "body"    : content },
        function(err, resp, body) {
          result.response = body;
          result.headers = resp.headers;
          result.status = resp.statusCode;
          result.timeout = false;
          result.url = rest.url;
          fiber.run();
        });

      fibers.yield();
      return result;
    }

    function put(content) {
      var result = {
        "response": {}};

      var fiber = fibers.current;

      request(
        { "method"  : "PUT",
          "uri"     : rest.url,
          "headers" : rest.headers,
          "body"    : content },
        function(err, resp, body) {
          result.response = body;
          result.headers = resp.headers;
          result.status = resp.statusCode;
          result.timeout = false;
          result.url = rest.url;
          fiber.run();
        });

      fibers.yield();
      return result;
    }

    function query(key, value) {
      rest.url += "&" + key + "=" + value;
      return rest;
    }

    function timeout(ms) {

    }

    return rest;
  }

  return exports;
}
