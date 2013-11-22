module.exports = function(settings) {

  exports.js =
    "var url = '" + settings.url +  "/test/data/json';\
var v1 = true;\
var r = y.rest(url).decompress(v1).get().response;\
response.object = save(r, v1);";

  return exports;
}
