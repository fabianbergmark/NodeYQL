/*
 * Generate YQL handler.
 */

var fibers = require('fibers')
  , path = require('path')
  , xpath = require('xpath');

module.exports = function(settings, files) {

  var tables = files.map(function(file) {
    var rel = path.relative('yql-tables', file);
    var table = path.basename(rel, '.xml');
    var pps = table.replace(/\./g, '/');
    var index  = '/' + pps;
    var source = '/' + pps + '/src';
    var sample = '/' + pps + '/test';

    var route = { 'index': index,
                  'source': source,
                  'sample': sample };

    return { 'name': table,
             'route': route };
  });

  exports.getIndex = function(req, res) {
    res.render('yql', { 'tables': tables });
  }

  exports.getEnv = function(req, res) {
    tables.forEach(function(table) {
      res.send(table.environment());
    });
  }

  return exports;
}
