/*
 * Create YQL JS environment y object.
 */

var cache = require('./cache')
  , crypto = require('./crypto')
  , date = require('./date');

var vm = require('vm')
  , zlib = require('zlib')
  , htmltidy = require('htmltidy')
  , request = require('request');
module.exports = function(table, xml) {

  exports.create = function(restObj) {

    var y = {
      "cache": cache.create(),
      "context": {
        "table": table
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

    function deflate(string ,level) {
      var stream = zlib.createDeflate({ "level": level });
      return new Buffer(string).pipe(stream).toString('base64');
    }

    function env(file) {

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

      }

      return restObj;
    }

    function sync(flag) {

    }

    function tidy(html) {
      return wait.for(htmltidy.tidy, html);
    }

    function use(url, namespace) {

    }

    function xpath(object, xpath) {

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
