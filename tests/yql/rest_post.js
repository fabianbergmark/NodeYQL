module.exports = function(settings) {

  exports.js =
    "var v1 = '" + settings.url +  "/test/data/echo';\
var v2 = { 'test': 1 };\
var r = y.rest(v1).contentType('application/json').post(v2).response;\
response.object = save(r, v1);";

  exports.compare = function(local, remote) {
    if (local && remote)
      return local.result.return + '\n' == remote.result.return;
    else
      return false;
  }

  return exports;
}
