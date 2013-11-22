module.exports = function(settings) {

  exports.js =
    "var v1 = 'Key';\
var val = 10;\
y.cache.put(v1, val).result;\
y.cache.decr(v1).result;\
var r = y.cache.get(v1).result;\
response.object = save(r, v1);";

  exports.compare = function(local, remote) {
    return local.result.return && local.result.return.key == 'Key' &&
      local.result.return.value == '9';
  }

  return exports;
}
