/*
 * Create YQL global Rest object.
 */

var fibers = require('fibers')
  , future =  require('fibers/future')
  , wait = future.wait
  , xpath = require('xpath')
  , request = require('request');

module.exports = function(settings, table, select) {

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

    var url = xpath.select('//url', select).toString().replace(/<url>\s*(.*?)\s*<\/url>/, '$1');

    var params = (/{(.*?)}/g).exec(url);

    if (params) {
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
      rest.headers['Accept'] = contentType;
      return rest;
    }

    function contentType(contentType) {
      rest.headers['Content-Type'] = contentType;
      return rest;
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
          result.url = rest.url;
          if (err) {
            if (err.code == 'ETIMEDOUT')
              result.timeout = true;
          } else {
            result.response = body;
            result.headers  = resp.headers;
            result.status   = resp.statusCode;
            result.timeout  = false;
          }
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
          result.url = rest.url;
          if (err) {
            if (err.code == 'ETIMEDOUT')
              result.timeout = true;
          } else {
            result.response = body;
            result.headers = resp.headers;
            result.status = resp.statusCode;
            result.timeout = false;
          }
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
          result.url = rest.url;
          if (err) {
            if (err.code == 'ETIMEDOUT')
              result.timeout = true;
          } else {
            result.response = body;
            result.headers = resp.headers;
            result.status = resp.statusCode;
            result.timeout = false;
          }
          fiber.run();
        });

      fibers.yield();
      return result;
    }

    function header(name, value) {
      rest.headers[name] = value;
      return rest;
    }

    function jsonCompat(mode) {
      return rest;
    }

    function matrix(name, value) {
      return rest;
    }

    function path(segment) {
      rest.url += '/' + segment;
      return rest;
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
          result.url = rest.url;
          if (err) {
            if (err.code == 'ETIMEDOUT')
              result.timeout = true;
          } else {
            result.response = body;
            result.headers  = resp.headers;
            result.status   = resp.statusCode;
            result.timeout  = false;
          }
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
          if (err) {
            if (err.code == 'ETIMEDOUT')
              result.timeout = true;
          } else {
            result.response = body;
            result.headers  = resp.headers;
            result.status   = resp.statusCode;
            result.timeout  = false;
          }
          fiber.run();
        });

      fibers.yield();
      return result;
    }

    function query(key, value) {

      var keys;
      if (!key instanceof Array)
        keys[key] = value;
      else
        keys = key;

      for (var key in keys) {
        var value = keys[key];
        vars[key] = value;
      }

      rest.url = createUrl(vars);
      return rest;
    }

    function timeout(ms) {
      rest.timeout = ms;
      return rest;
    }

    return rest;
  }

  return exports;
}
