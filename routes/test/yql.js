/*
 * Generate YQL test handler.
 */

var fibers = require('fibers')
  , path   = require('path');

module.exports = function(settings, files) {

  exports.getIndex = function(req, res) {

    var testcases = files.map(function(file) {
      var rel = path.relative('tests', file);
      var pps = path.basename(rel, '.js');
      var name = pps;
      var api = '/test/yql/api/' + pps;
      var route = '/test/yql/' + pps;
      return { 'route': route,
               'name': name,
               'run': api };
    });

    res.render('test', { 'testcases': testcases });
  }

  return exports;
}
