module.exports = function(settings) {

  exports.js =
    "var url = '" + settings.url +  "/test/data';\
var v1 = y.rest(url).get().response;\
var r  = y.crypto.encodeHmacSHA1(v1);\
response.object = save(r, v1);";

  return exports;
}
