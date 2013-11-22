module.exports = function(settings) {

  exports.js =
    "var v1 = 'Key';\
var val = 'Value';\
var r = y.cache.put(v1, val).result;\
response.object = save(r, v1);";

  exports.compare = function(local, remote) {
    return local.result.return == "true";
  }

  return exports;
}
