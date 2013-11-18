/*
 * JSON data generator from JSON schema.
 */

var fs        = require('fs'),
    xpath     = require('xpath'),
    fibers    = require('fibers'),
    DOMParser = require('xmldom').DOMParser,
    generator  = require('../../helpers/json/generate.js');

module.exports = function(settings, path) {

  var fiber = fibers.current;

  fs.readFile(
    'routes/helpers/empty.xml',
    function(err, data) {
      if (err)
        fiber.run(null);
      else {
        var xml = new DOMParser().parseFromString(data.toString());
        fiber.run(xml);
      }
    });

  var xml = fibers.yield();

  var documentationURL = xpath.select('/table/meta/documentationURL', xml)[0];
  documentationURL.appendChild(xml.createTextNode(settings.url + path + '/doc'));
  var url = xpath.select('/table/bindings/select/urls/url', xml)[0];
  url.appendChild(xml.createTextNode(settings.url + path + '/run'));
  var inputs = xpath.select('/table/bindings/select/inputs', xml)[0];
  var key = xml.createElement("key");
  key.setAttribute("id", "schema");
  key.setAttribute("type", "xs:string");
  key.setAttribute("paramType", "query");
  inputs.appendChild(key);

  exports.post = function(req, res) {
    var post = req.body;

    var schema = post.schema;
    if (schema) {
      console.log(schema);
      var gen = generator.generate(schema);
      res.send(gen);
    } else
      res.end();
  }

  exports.yql = {};
  exports.yql.getSrc = function(req, res) {
    res.setHeader('Content-Type', 'application/xml');
    res.send(xml.toString());
  }

  exports.yql.getEnv = function(req, res) {
    res.send(environment());
  }

  exports.yql.getDesc = function(req, res) {
    res.end();
  }

  function environment() {
    return 'USE "' + settings.url + path + '/yql/src" AS json_generator;';
  }

  return exports;
}
