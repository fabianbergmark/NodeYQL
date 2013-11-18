module.exports = function(settings) {

  exports.js =
    "var url = '" + settings.url +  "/test/data';\
var v1 = y.rest(v1).get().response;\
var r = y.sonToXml(v1);\
response.object = save(r, v1);";

  return exports;
}
