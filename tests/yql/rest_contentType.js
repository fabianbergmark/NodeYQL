module.exports = function(settings) {

  exports.js =
    "var url = '" + settings.url +  "/test/data/echo/header';\
var v1 = 'application/json';\
var data = y.rest(url).contentType(v1).post({'test': 1}).response;\
var r = y.xparseJson(data)['content-type'];\
response.object = save(r, v1);";

  return exports;
}
