module.exports = function(settings) {

  exports.js =
    "y.include('http://www.datatables.org/javascript/json2.js');\
var url = '" + settings.url +  "/test/data';\
var data = y.rest(url).get().response;\
var v1   = JSON.parse(data);\
var r    = y.jsToString(v1);\
response.object = save(r, v1);";

  return exports;
}