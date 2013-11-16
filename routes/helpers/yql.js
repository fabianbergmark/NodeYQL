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
    env.response = { "object": {} };;
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
        var results = env.response.object;
        results = JSON.parse(JSON.stringify(results));
        var result =
            { "result": results };

        return YQLify(result);
      } catch (err) {
        console.log("Error in table js: " + err);
      }
    }
  }

  function YQLify(result) {
    if (result instanceof Array ) {
      if (result.length == 0)
        result = null;
      else if (result.length == 1)
        result = YQLify(result[0]);
      else {
        for (var i = 0; i < result.length; ++i)
          result[i] = YQLify(result[i]);
      }
    } else if (typeof result === 'object') {
      for(var key in result) {
        var val = result[key];
        val = YQLify(val);
        if (val == null)
          delete result[key]
        else
          result[key] = val;
      }
    } else if (typeof result === 'number') {
      result = "" + result;
    } else if (typeof result === 'boolean')
      result = "" + result;
    return result;
  }


  return exports;
}
