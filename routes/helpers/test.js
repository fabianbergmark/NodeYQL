var xpath = require('xpath');

module.exports = function(settings, xml) {

  exports.create = function() {
    var save =
      'function save() {\
         var ret  = arguments[0];\
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

    var js =
      "y.include('http://www.datatables.org/javascript/json2.js');" +
      "var v1 = y.rest('" + url +  "').get().response;" +
      "var r  = JSON.parse(v1);" +
      "response[0] = save(r, v1);";

    var cdata = xml.createCDATASection(js);

    var execute = xpath.select('//select//execute', xml)[0];
    execute.appendChild(cdata);

    return xml;
  }

  return exports;
}
