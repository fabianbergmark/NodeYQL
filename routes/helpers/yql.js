/*
 * Helper functions for YQL.
 */

var vm = require('vm')
  , xpath = require('xpath');

var transform = require('./transform');

module.exports = function(settings, table, xml, select) {

  var y = require('./yql/y')(settings, table, select)
    , rest = require('./yql/rest')(settings, table, select);

  exports.run = function(vars) {
    var env = {};
    env.response = {};
    env.request = rest.create(vars);
    env.y = y.create(env.request);

    var variables = xpath.select('//key[@paramType=\'variable\']', select);
    variables.forEach(function(variable) {
      var id = variable.getAttribute('id');
      if (vars[id] !== undefined) {
        env[id] = vars[id];
      }
    });

    env.fibers = fibers = require('fibers');
    env.console = console;

    var context = vm.createContext(env);

    var global =
      xpath.select('/table/execute', xml);
    if (global.length > 0) {
      global =
        global.toString()
        .replace(/[\s\S]*CDATA\[([\s\S]*?)\]\][\s\S]*/, '$1');

      try {
        var ecma = transform.ecma(global);
        vm.runInContext(ecma, context);
      } catch (err) {
        console.log("Error in table global js: " + err);
      }
    }

    var js =
      xpath.select('//execute', select);

    if (js.length > 0) {
      js =
        js.toString()
        .replace(/[\s\S]*CDATA\[([\s\S]*?)\]\][\s\S]*/, '$1');

      try {
        var ecma = transform.ecma(js);
        vm.runInContext(ecma, context);
        return env.response;
      } catch (err) {
        console.log("Error in table js: " + err);
      }
    }
  }

  return exports;
}
