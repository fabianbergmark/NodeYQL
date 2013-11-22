/*
 * Generate YQL OpenTable handler.
 */

var fibers = require('fibers')
  , xpath = require('xpath')
  , xmldom = require('xmldom').DOMImplementation;

var yqlGenerator = require('../helpers/yql')
  , schema       = require('../helpers/json/schema');

module.exports = function(settings, table, xml) {

  exports.xml  = xml;
  exports.table = table;

  exports.getSrc = function(req, res) {
    res.setHeader('Content-Type', 'application/xml');
    res.send(xml.toString());
  }

  exports.getRun = function(req, res) {

    var author = xpath.select('//author', xml);
    author = author.length > 0 ?
      author[0].firstChild.toString() :
      '';

    var api = '/api/' + table.replace(/\./g, '/');
    var action = '/' + table.replace(/\./g, '/');

    var selects = xpath.select('//select', xml);

    var forms = selects.map(function(select) {

      var doc = new xmldom().createDocument();
      doc.appendChild(select.cloneNode(true));
      var keys = xpath.select('//key', doc);

      var fields = keys.map(function(key) {
        var id   = key.getAttribute('id');
        var def  = key.getAttribute('default');
        var req  = key.getAttribute('required');
        req = req == 'true' ? true : false;
        var xs_type = key.getAttribute('type');

        var type;
        switch (xs_type) {
        case 'xs:string':
          type = 'text';
          break;
        default:
          console.log('UNKNOWN TYPE: ' + xs_type);
          break;
        }

        return { 'id': id,
                 'type': type,
                 'default': def,
                 'required': req };
      });

      return { 'fields': fields };
    });

    res.render('yql/table',
               { 'name': table,
                 'api': api,
                 'action': action,
                 'author': author,
                 'forms': forms });
  }

  exports.postRun = function(req, res) {

    var sid = req.sessionID;

    fibers(function() {
      var post = req.body;

      try {
        var result = run(post, sid);
        res.send(result);
      } catch (err) {
        res.send(err);
      }
    }).run();
  }

  exports.postApiRun = function(req, res) {

    var sid = req.sessionID;

    fibers(function() {
      var post = req.body;

      try {
        var result = run(post, sid);
        res.send(result);
      } catch (err) {
        res.send(err);
      }
    }).run();
  }

  exports.getTest = function(req, res) {

    var sid = req.sessionID;

    fibers(function() {
      var results = test(sid);
      res.send(results);
    }).run();
  }

  exports.getSchema = function(req, res) {

    fibers.run(function() {
      var results = test();
      var schema = schemafy(results);
      res.send(schema);
    });
  }

  exports.getEnv = function(req, res) {
    res.send(environment());
  }

  function environment() {
    return 'USE "' + settings.url + '/' + table + '/src" AS ' + name + ';';
  }

  exports.environment = environment;

  function test(sid) {

    var samples = xpath.select('//sampleQuery', xml);

    if (samples.length > 0) {
      var vars = {};
      var sample = samples[0].toString().replace(/<sampleQuery>\s*(.*?)\s*<\/sampleQuery>/g, '$1') + ";";
      var regexp =
        /.*?where\s+(.*?)\s*=\s*['"]?(.*?)['"]?(?:\s+and\s+(.*?)\s*=\s*['"]?(.*?)['"]?)*;.*?/gi;

      var vs = regexp.exec(sample);
      if (vs) {
        for (var i = 1; i < vs.length-1; i+=2) {
          var k = vs[i];
          var v = vs[i+1];
          vars[k] = v;
        }
        return run(vars);
      } else {
        throw "No sample query";
      }
    }
  }

  exports.test = test;

  function run(vars, sid) {

    var selects = xpath.select('//select', xml);

    var env = {};

    if (!selects) {
      throw 'No selects';
    }

    var response;

    selects.some(function(select) {

      var doc = new xmldom().createDocument();
      doc.appendChild(select.cloneNode(true));

      var yql = yqlGenerator(settings, table, xml, doc);

      var keys = xpath.select('//key', doc);

      var missing = keys.some(function(key) {
        var id       = key.getAttribute('id')
          , as       = key.getAttribute('as')
          , def      = key.getAttribute('default')
          , type     = key.getAttribute('paramType')
          , required = key.getAttribute('required');

        if (required == 'true') {
          if (vars[id] === undefined && def === undefined) {
            return true;
          }
        }

        if (vars[id] !== undefined || def !== undefined) {
          var value;
          if (vars[id] !== undefined)
            value = vars[id];
          else
            value = def;

          env[id] = value;
        }
      });

      if (missing)
        return false;

      response = yql.run(env, sid);
      return true;
    });
    return response;
  }

  return exports;
}
