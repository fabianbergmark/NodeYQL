module.exports = function(settings) {

  exports.js =
    "var v1 = '" + settings.url +  "/test/data/plain';\
var r = y.rest(v1).head().headers.test;\
response.object = save(r, v1);";

  return exports;
}
