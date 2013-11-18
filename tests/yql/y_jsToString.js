module.exports = function(settings) {

  exports.js =
    "var url = '" + settings.url +  "/test/data';\
var data = y.rest(url).get().response;\
var v1   = y.xparseJson(data);\
var r    = y.jsToString(v1);\
response.object = save(r, v1);";

  return exports;
}
