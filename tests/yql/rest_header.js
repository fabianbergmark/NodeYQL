module.exports = function(settings) {

  exports.js =
    "var url = '" + settings.url +  "/test/data/echo';\
var v1 = 'key';\
var v2 = 'val';\
var r = y.rest(url).header(v1, v2).head().headers[v1];\
response.object = save(r, v1);";

  return exports;
}
