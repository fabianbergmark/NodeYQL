module.exports = function(settings) {

  exports.js =
    "var v1 = 'utf8';\
var url = '" + settings.url + "/test/data/plain/' + v1;\
var r = y.rest(url).forceCharset(v1).get().response;\
response.object = save(r, v1);";

  return exports;
}
