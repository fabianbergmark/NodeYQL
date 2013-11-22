module.exports = function(settings) {

  exports.js =
    "var r  = y.crypto.uuid();\
response.object = save(r);";

  exports.compare = function(local, remote) {
    if (local && remote) {
      var pattern = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/;
      return local.result.return.match(pattern) && remote.result.return.match(pattern);
    } else
      return false;
    }

  return exports;
}
