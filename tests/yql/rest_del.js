module.exports = function(settings) {

  exports.js =
    "var v1 = 'test';\
var url = '" + settings.url +  "/test/data/' + v1;\
var r = y.rest(url).del().response;\
response.object = save(r, v1);";

  exports.compare = function(local, remote) {
    if (local && remote)
      return local.result.return + '\n' == remote.result.return;
    else
      return false;
  }

  return exports;
}
