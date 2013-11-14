/*
 * Create YQL JS environment y object.
 */

var cache = require('./cache')
  , crypto = require('./crypto')
  , date = require('./date');

var vm = require('vm')
  , zlib = require('zlib')
  , xpathM = require('xpath')
  , htmltidy = require('htmltidy')
  , request = require('request');

module.exports = function(settings, table, select) {

  exports.create = function(restObj) {

    var name = table.replace(/\//g, '.');

    var threads = [];

    var y = {
      "cache": cache.create(),
      "context": {
        "host" : settings.url,
        "table": name
      },
      "crypto": crypto.create(),
      "date": date.create(),
      "decompress": decompress,
      "diagnostics": {},
      "env": env,
      "include": include,
      "inflate": inflate,
      "log": log,
      "query": query,
      "rest": rest,
      "sync": sync,
      "tidy": tidy,
      "use": use,
      "xpath": xpath
    }

    function decompress(data) {
      var fiber = fibers.current;
      zlib.gunzip(new Buffer(data, 'base64'), function(result) {
        fiber.run(result);
      });
      return fibers.yield();
    }

    function deflate(string, level) {

      var fiber = fibers.current;

      var stream = zlib.createDeflate({ "level": level });
      return new Buffer(string)
        .pipe(stream)
        .toString('base64')
        .on('end', function(result) {
          fiber.run(result);
        });

      return fibers.yield();
    }

    function env(src) {

    }

    function include(src) {
      var result = {
        "response": {}};

      var fiber = fibers.current;

      request(
        { "method"  : "GET",
          "uri"     : src },
        function(err, resp, body) {
          fiber.run(body);
        });

      var js = fibers.yield();
      vm.runInThisContext(js);
    }

    function inflate(data) {
      var result;
      var fiber = fibers.current;
      zlib.inflate(data, function(result) {
        fiber.run(result);
      });
      return fibers.yield();
    }

    function log(message) {

    }

    function query(statement, params, timeout, callback) {

    }

    function rest(url, callback) {
      restObj.url = url;
      if (callback) {
        fibers(function() {
          var fiber = fibers.current;

          var index = threads.push(fiber);

          request(
            { "method"  : "GET",
              "uri"     : restObj.url,
              "headers" : restObj.headers,
              "timeout" : restObj.timeout },
            function(err, resp, body) {
              var result = {};
              result.response = body;
              result.headers = resp.headers;
              result.status = resp.statusCode;
              result.timeout = false;
              fiber.run();
              callback(result);
            });

          try {
            fibers.yield();
          } catch (e) {
            delete threads[index];
          }
        }).run();
      }
      return restObj;
    }

    function sync(flag) {
      threads.forEach(function(thread) {
        if (thread !== undefined) {
          thread.yield();
        }
      });
    }

    function tidy(html) {

      var fiber = fibers.current;

      return htmltidy.tidy(html, function(err, html) {
        fiber.run(html);
      });

      return fibers.yield();
    }

    function use(url, namespace) {

    }

    function xpath(object, xpath) {
      return xpathM.select(object, xpath);
    }

    return y;
  }

  return exports;
}

// Conversion methods

function jsonToXml(json) {

}

function jsToString(json) {
  return JSON.stringify(json);
}

function xmlToJson(xml) {

}

function xparseJson(string) {
  return JSON.parse(string);
}
