/*
 * Generate YQL test handler.
 */

var fibers = require('fibers')
  , path   = require('path');

module.exports = function(settings, apis) {

  exports.getIndex = function(req, res) {

    res.end();
  }

  exports.getEnv = function(req, res) {
    apis.forEach(function(api) {
      res.send(api.yql.environment());
    });
  }

  return exports;
}
