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
      var api = '/api/test/' + pps;
      var route = '/test/' + pps;
      return { 'route': route,
               'name': name,
               'run': api };
    });

    res.render('test', { 'testcases': testcases });
  }

  exports.getJSONData = function(req, res) {
    fs.readFile(
      'routes/helpers/example.json',
      function (err, data) {
        res.send(data.toString());
      });
  }

  return exports;
}
