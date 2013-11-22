module.exports = function(settings) {

  exports.js =
    "var url = '" + settings.url +  "/test/data/json';\
var v1 = 'secret';\
var v2 = y.rest(url).get().response;\
var r  = y.crypto.encodeHmacSHA1(v1, v2);\
response.object = save(r, v1, v2);";

  return exports;
}
