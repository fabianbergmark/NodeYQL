module.exports = function(settings) {

  exports.js =
    "var url = '" + settings.url +  "/test/data';\
var data = y.rest(url).get().response;\
var v1   = y.deflate(data, 1);\
var r    = y.inflate(v1);\
response.object = save(r, v1);";

  return exports;
}
