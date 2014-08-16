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

  exports.getSample = function(req, res) {

    var sid = req.sessionID;

    fibers(function() {
      var results = sample(sid);
      res.send(results);
    }).run();
  }

  exports.getSchema = function(req, res) {

    var sid = req.sessionID;

    fibers(function() {
      var results = sample(sid);
      try {
        var s = schema.schemafy(results);
        res.send(s);
      } catch (e) {
        console.log(e);
        res.end();
      }
    }).run();
  }

  exports.getEnv = function(req, res) {
    res.send(environment());
  }

  function environment() {
    return 'USE "' + settings.url + '/' + table + '/src" AS ' + name + ';';
  }

  exports.environment = environment;

  function sample(sid) {
    var samples = xpath.select('//sampleQuery', xml);

    if (samples.length > 0) {
      var vars = {};
      var sample = samples[0].toString().replace(/<sampleQuery>\s*(.*?)\s*<\/sampleQuery>/gi, '$1').trim();
      var first =
        /where\s+([^\s'"]*)\s*=\s*['"]?([^'"]*)['"]?/gi;
      if (vs = first.exec(sample)) {
        vars[vs[1]] = vs[2];
        var rest = /and\s+([^\s'"]*)\s*=\s*['"]?([^'"]*)['"]?/gi
        while (m = rest.exec(sample)) {
          vars[m[1]] = m[2];
        }
      }

      return run(vars, sid);
    } else
        console.log("Didn't find sample query");
  }

  exports.sample = sample;

  function run(vars, sid) {

    var selects = xpath.select('//select', xml);

    var env = {};

    if (!selects) {
      throw 'No selects';
    }

    var response = null;

    selects.some(function(select) {

      var doc = new xmldom().createDocument();
      doc.appendChild(select.cloneNode(true));

      var yql = yqlGenerator(settings, table, xml, doc);
      logger.debug('Generated YQL executor for select');

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

      if (missing) {
        logger.warn('Some keys were missing, aborting select execution');
        return false;
      }

      response = yql.run(env, sid);
      return true;
    });

    if (response !== null)
      return response;
    else {
      logger.error('Unable to run any select');
      throw 'Unable to run any select';
    }
  }

  return exports;
}
