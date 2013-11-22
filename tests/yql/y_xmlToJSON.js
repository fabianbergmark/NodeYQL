module.exports = function(settings) {

  exports.js =
    "var url = '" + settings.url +  "/test/data/xml';\
var v1 = y.rest(url).get().response;\
var r = y.xmlToJSON(v1);\
response.object = save(r, v1);";

  exports.compare = function(local, result) {

  }

  return exports;
}
