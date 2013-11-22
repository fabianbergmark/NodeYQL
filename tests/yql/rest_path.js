module.exports = function(settings) {

  exports.js =
    "var url = '" + settings.url +  "/test/data';\
var v1 = 'json';\
var r = y.rest(url).path(v1).get().url;\
response.object = save(r, v1);";

  return exports;
}
