module.exports = function(settings) {

  exports.js =
"var v1 = '" + settings.url +  "/test/data';\
var r = y.rest(v1).get().response;\
response.object = save(r, v1);";

  return exports;
}
