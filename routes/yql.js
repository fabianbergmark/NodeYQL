/*
 * Generate YQL handler.
 */

var fibers = require('fibers')
  , xpath = require('xpath');

module.exports = function(settings, tables) {

  exports.getIndex = function(req, res) {
    res.send("hello " + tables.length);
  }

  exports.getEnv = function(req, res) {
    tables.forEach(function(table) {
      res.send(table.environment());
    });
  }

  return exports;
}
