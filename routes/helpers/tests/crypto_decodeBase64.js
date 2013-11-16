module.exports = function(settings) {

  exports.js =
    "var url = '" + settings.url +  "/test/data';\
var data = y.rest(url).get().response;\
var v1 = y.crypt.encodebase64(data);\
var r  = y.crypto.decodeBase64(v1);\
response.object = save(r, v1);";

  return exports;
}
