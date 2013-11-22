module.exports = function(settings) {

  exports.js =
    "var url = '" + settings.url +  "/test/data/json';\
var data = y.rest(url).get().response;\
var v1 = y.crypto.encodeBase64(data);\
var r  = y.crypto.decodeBase64(v1);\
response.object = save(r, v1);";

  return exports;
}
