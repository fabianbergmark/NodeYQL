module.exports = function(settings) {

  exports.js =
    "var url = '" + settings.url +  "/test/data/echo/header';\
var v1 = 'text/plain';\
var data = y.rest(url).accept(v1).post('hej').response;\
var r = y.xparseJson(data).accept;\
response.object = save(r, v1);";

  return exports;
}
