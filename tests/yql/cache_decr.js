module.exports = function(settings) {

  exports.js =
    "var v1 = 'Key';\
var val = 10;\
y.cache.put(v1, val);\
var r = y.cache.decr(v1);\
response.object = save(r, v1);";

  return exports;
}
