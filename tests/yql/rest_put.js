module.exports = function(settings) {

  exports.js =
    "var v1 = '" + settings.url +  "/test/data/echo';\
var v2 = { 'test': 1 };\
var r = y.rest(v1).contentType('application/json').put(y.jsToString(v2)).response;\
response.object = save(r, v1, v2);";

  return exports;
}
