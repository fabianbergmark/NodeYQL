/*
 * Create YQL global Rest object.
 */

var fibers = require('fibers')
, xpath = require('xpath')
, request = require('request')
, querystring = require('querystring');

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

  function createQuerys(vars) {

    var result = {};

    var url = xpath.select('//url', select);
    if (url.length > 0 && url[0].firstChild) {

      url = url[0].firstChild.toString().trim();

      var querys = url.replace(/^.*?\?(.*)/, '$1');

      var regexp = /(.*?)=([^&]*)/g;
      var match;

      while (match = regexp.exec(querys)) {
        var key = match[1];
        var val = match[2];
        if (match = (/^{(.*)}$/).exec(val)) {

          var param = match[1];
          var k = xpath.select('//key[@id=\'' + param +  '\' and @paramType=\'path\']', select);
          if (k.length > 0) {
            if (vars[param] !== undefined) {
              val = vars[param];
            } else
              val = '';
          } else
            throw "Query parameter '" + param + "' has no associated key";
        }
        if (match = (/^{(.*)}$/).exec(key)) {
          var param = match[1];
          var k = xpath.select('//key[@id=\'' + param +  '\' and @paramType=\'query\']', select);
          if (k.length > 0) {
            if (vars[param] !== undefined) {
              key = vars[param];
            } else
              key = '';
          } else
            throw "Query parameter '" + param + "' has no associated key";
        }

        if (key !== '')
          result[key] = val;
      }
    }

    var querys = xpath.select('//key[@paramType=\'query\']', select);

    querys.forEach(function(query) {
      var id = query.getAttribute('id');
      if (vars[id] !== undefined && vars[id] !== '') {
        result[id] = vars[id];
      }
    });

    return result;
  }

  function createUrl(vars) {

    var url = xpath.select('//url', select);
    if (url.length > 0 && url[0].firstChild) {
      url = url[0].firstChild.toString().trim();

      var base = url.replace(/^(.*?)\?.*/, '$1');

      var regexp = /{(.*?)}/g;

      while (match = regexp.exec(base)) {
        var param = match[1];
        var key = xpath.select('//key[@id=\'' + param +  '\' and @paramType=\'path\']', select);
        if (key.length > 0) {
          key = key[0];

          var val = "";
          if (vars[param] !== undefined) {
            val = vars[param];
          }

          base = base.replace('{' + param + '}', val);
        }

      }

      return base;
    } else
      return "";
  }

  function buildUrl(base, querys) {

    var url = base;

    if (Object.keys(querys).length > 0) {
      url += "?";
      var first = true;
      for (var key in querys) {
        var val = querys[key];
        if (!first)
          url += "&";

        url += key + '=' + val;
        if (first)
          first = false;
      }
    }
    return url;
  }

  exports.create = function(vars) {

    var baseUrl = createUrl(vars);
    var querys = createQuerys(vars);
    var headers = createHeaders(vars);

    var url = buildUrl(baseUrl, querys);

    var rest = {
      "headers": headers,
      "url": url,
      "queryParms": "",
      "matrixParams": {},
      "accept": accept,
      "contentType": contentType,
      "decompress": decompress,
      "del": del,
      "fallbackCharset": fallbackCharset,
      "filerChars": filterChars,
      "forceCharset": forceCharset,
      "get": get,
      "head": head,
      "header": header,
      "jsonCompat": jsonCompat,
      "matrix": matrix,
      "path": path,
      "post": post,
      "put": put,
      "query": query,
      "querystring": querystring.stringify,
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
      return rest;
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
            try {
              body = JSON.parse(body);
            } catch (e) { }
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
      return rest;
    }

    function filterChars(filters) {
      return rest;
    }

    function forceCharset(charsets) {
      return rest;
    }

    function get() {
      logger.debug(
        'Running GET request',
        { url: rest.url,
          headers: rest.headers });
      var result = {
        "response": {}};

      var fiber = fibers.current;

      request(
        { "method"  : "GET",
          "uri"     : rest.url,
          "headers" : rest.headers,
          "timeout" : 1000,
          "followRedirect": false },
        function(err, resp, body) {
          logger.debug('GET request callback');
          result.url = rest.url;
          if (err) {
            logger.debug('GET request returned an error', { err: err });
            if (err.code == 'ETIMEDOUT')
              result.timeout = true;
          } else {
            try {
              body = JSON.parse(body);
            } catch (e) { }
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
      logger.debug(
        'Running HEAD request',
        { url: rest.url,
          headers: rest.headers });
      var result = {
        "response": {}};

      var fiber = fibers.current;

      request(
        { "method"  : "HEAD",
          "uri"     : rest.url,
          "headers" : rest.headers,
          "timeout" : 1000 },
        function(err, resp, body) {
          logger.debug('HEAD request callback');
          result.url = rest.url;
          if (err) {
            logger.debug('GET request returned an error', { err: err });
            if (err.code == 'ETIMEDOUT')
              result.timeout = true;
          } else {
            try {
              body = JSON.parse(body);
            } catch (e) { }
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
      rest.url += ';' + name + '=' + value;
      return rest;
    }

    function path(segment) {
      rest.url += '/' + segment;
      return rest;
    }

    function post(content) {
      logger.debug(
        'Running POST request',
        { url: rest.url,
          headers: rest.headers });
      var result = {
        "response": {}};
      var fiber = fibers.current;
      request(
        { "method"  : "POST",
          "uri"     : rest.url,
          "headers" : rest.headers,
          "timeout" : 1000,
          "body"    : content },
        function(err, resp, body) {
          logger.debug('POST request callback');
          result.url = rest.url;
          if (err) {
            logger.debug('POST request returned an error', { err: err });
            if (err.code == 'ETIMEDOUT')
              result.timeout = true;
          } else {
            try {
              body = JSON.parse(body);
            } catch (e) { }
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
      logger.debug(
        'Running PUT request',
        { url: rest.url,
          headers: rest.headers });
      var result = {
        "response": {}};

      var fiber = fibers.current;

      request(
        { "method"  : "PUT",
          "uri"     : rest.url,
          "headers" : rest.headers,
          "timeout" : 1000,
          "body"    : JSON.stringify(content) },
        function(err, resp, body) {
          logger.debug('PUT request callback');
          if (err) {
            logger.debug('PUT request returned an error', { err: err });
            if (err.code == 'ETIMEDOUT')
              result.timeout = true;
          } else {
            try {
              body = JSON.parse(body);
            } catch (e) { }
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

      var keys = {};
      if (!(key instanceof Array))
        keys[key] = value;
      else
        keys = key;

      for (var key in keys) {
        var val = keys[key];
        querys[key] = val;
      }

      rest.url = buildUrl(rest.url, querys);
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
