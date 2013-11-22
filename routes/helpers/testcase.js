var fibers  = require('fibers')
  , fs = require('fs')
  , xpath = require('xpath')
  , DOMParser = require('xmldom').DOMParser;

module.exports = function(settings, testcase, js) {

  var fiber = fibers.current;

  fs.readFile(
    './routes/helpers/empty.xml',
    function(err, data) {
      if (err)
        fiber.run(null);
      else {
        var xml = new DOMParser().parseFromString(data.toString());
        fiber.run(xml);
      }
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

  exports.xml = xml;

  return exports;
}
