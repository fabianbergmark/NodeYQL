module.exports = function(settings) {

  exports.js =
    "var url = '" + settings.url +  "/test/data';\
var v1 = 'key';\
var v2 = 'val';\
var r = y.rest(url).query(v1, v2).get().url;\
response.object = save(r, v1, v2);";

  return exports;
}
