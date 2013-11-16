var fibers = require('fibers')
  , fs = require('fs')
  , DOMParser = require('xmldom').DOMParser
  , request = require('request')
  , xpath = require('xpath');

module.exports = function(settings, table, js) {

  exports.create = function() {

    var fiber = fibers.current;

    fs.readFile(
      './routes/helpers/empty.xml',
      function(err, data) {
        if (err)
          fiber.run(null);
        else
          var xml = new DOMParser().parseFromString(data.toString());
          fiber.run(xml);
      });

    var xml = fibers.yield();

    var save =
'function save() {\
  var ret = arguments[0];\
  var result =\
    { "return"   : ret,\
      "arguments": [] };\
  for (var i = 1; i < arguments.length; ++i)\
    result.arguments.push(arguments[i]);\
   return result;\
}';

    var cdata = xml.createCDATASection(save);

    var global = xpath.select('/table/execute', xml)[0];
    global.appendChild(cdata);

    var url = settings.url + '/test/data';

    var cdata = xml.createCDATASection(js);

    var execute = xpath.select('//select//execute', xml)[0];
    execute.appendChild(cdata);

    return xml;
  }

  exports.execute = function(query, table) {

    var fiber = fibers.current;

    var env = settings.url + '/test/' + table + '/env';
    var url = settings.yql.url
        + '?q=' + query
        + '&format=json'
        + '&env=' + env
//        + '&debug=true'
//        + '&diagnostics=true';
    request(
      { "method": "GET",
        "uri": url },
      function(err, resp, body) {
        if (err) {
          fiber.run(null);
        } else {
          body = JSON.parse(body);
          fiber.run(body.query.results);
        }
      });

    return fibers.yield();
  }

  return exports;
}
