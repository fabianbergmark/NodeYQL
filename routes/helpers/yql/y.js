/*
 * Create YQL JS environment y object.
 */

var vm = require('vm')
  , zlib = require('zlib')
  , stream = require('stream')
  , bufferjs = require('bufferjs')
  , xpathM = require('xpath')
  , htmltidy = require('htmltidy')
  , request = require('request');

module.exports = function(settings, table, select) {

  var cache = require('./cache')(settings)
    , crypto = require('./crypto')(settings)
    , date = require('./date')(settings)


  exports.create = function(restObj, sid) {

    var name = table.replace(/\//g, '.');

    var threads = [];

    var y = {
      "cache": cache.create(sid),
      "context": {
        "host" : settings.url,
        "table": name
      },
      "crypto": crypto.create(),
      "date": date.create(),
      "deflate": deflate,
      "decompress": decompress,
      "diagnostics": {},
      "env": env,
      "include": include,
      "inflate": inflate,
      "jsToString": jsToString,
      "log": log,
      "query": query,
      "rest": rest,
      "sync": sync,
      "tidy": tidy,
      "use": use,
      "xparseJson": xparseJson,
      "xpath": xpath
    }

    function decompress(data) {
      var fiber = fibers.current;
      zlib.gunzip(new Buffer(data, 'base64'), function(err, result) {
        fiber.run(result.toString('utf8'));
      });
      return fibers.yield();
    }

    function deflate(string, level) {

      var fiber = fibers.current;

      var result = [];

      var out = new stream.Stream();

      out.write = function(data) {
        result.push(data);
      }

      out.end = function() {
        result = Buffer.concat(result);
        fiber.run(result.toString('base64'));
      }

      var deflate = zlib.createDeflate({ "level": level });
      deflate.end(string, 'utf8');
      deflate.pipe(out);

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
      var fiber = fibers.current;

      var buf = new Buffer(data, 'base64');
      zlib.inflate(buf, function(err, result) {
        fiber.run(result.toString('utf8'));
      });
      return fibers.yield();
    }

    function jsToString(json) {
      return JSON.stringify(json);
    }

    function log(message) {

    }

    function query(statement, params, timeout, callback) {

    }

    function rest(url, callback) {
      logger.debug(
        'Running REST GET request',
        { url: url,
          headers: restObj.headers });
      restObj.url = url;
      if (callback) {
        fibers(function() {
          var fiber = fibers.current;

          var index = threads.push(fiber);

          request(
            { "method"  : "GET",
              "uri"     : restObj.url,
              "headers" : restObj.headers,
              "timeout" : 1000 },
            function(err, resp, body) {
              logger.debug('REST GET request callback');
              var result = {};
              if (err) {
                logger.debug('REST GET request returned an error', { err: err });
                console.log(err);
              } else {
                result.response = body;
                result.headers = resp.headers;
                result.status = resp.statusCode;
                result.timeout = false;
              }
              fiber.run();
              callback(result);
            });

          try {
            fibers.yield();
            delete threads[index];
          } catch (e) {
          }
        }).run();
      }
      return restObj;
    }

    function sync(flag) {
      while (threads.length > 0) {
        var thread = threads.pop();
        if (thread !== undefined) {
          thread.yield();
        }
      };
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

    function xparseJson(string) {
      return JSON.parse(string);
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
