module.exports = function(settings) {

  exports.js =
    "var r  = y.date.getOffsetFromEpochInMillis('now');\
response.object = save(r);";

  exports.compare = function(local, remote) {
    if (local && remote)
      return Math.abs(local.result.return - remote.result.return) < 10 * 1000;
    else
      return false;
  }

  return exports;
}
