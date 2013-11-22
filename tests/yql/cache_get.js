module.exports = function(settings) {

  exports.js =
    "var v1 = 'Key';\
var val = 'Value';\
var putOp = y.cache.put(v1, val);\
var r;\
if (putOp.result) {\
r = y.cache.get(v1).result;\
}\
response.object = save(r, v1);";

  exports.compare = function(local, remote) {
    return local.result.return && local.result.return.key == 'Key' &&
      local.result.return.value == 'Value';
  }

  return exports;
}
