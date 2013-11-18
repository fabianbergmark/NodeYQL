/**
 * Module dependencies.
 */

var settings = require('./settings');

var express = require('express')
  , http = require('http')
  , path = require('path')
  , fibers = require('fibers')
  , DOMParser = require('xmldom').DOMParser
  , fs = require('fs')
  , walk = require('./helpers/walk')
  , yql  = { "table": require('./routes/yql/table'),
             "index":   require('./routes/yql') }
  , test = { "testcase": require('./routes/test/testcase'),
             "index": require('./routes/test') };

var app = express();

app.configure(function() {
  app.set('port', process.env.PORT || settings.port.internal);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

fibers(function() {

  var fiber = fibers.current;

  walk.walk(
    './tests',
    function (err, files) {
      fiber.run(files);
    });

  var files = fibers.yield();

  if (!files) {
    console.log("Error loading test files");
    return;
  }

  var files = files.filter(function(file) {
    return path.extname(file) === '.js';
  });

  files.forEach(function(file) {

    var js  = require(file)(settings).js;
    var rel = path.relative('tests', file);
    var pps = path.basename(rel, '.js');
    var testcase = require('./routes/test/testcase')(settings, pps, js);
    delete require.cache[require.resolve('./routes/test/testcase')];

    app.get('/test/' + pps, testcase.getRun);
    app.get('/test/' + pps + '/env', testcase.getEnv);
    app.get('/test/' + pps + '/src', testcase.getSrc);
    app.get('/test/' + pps + '/desc', testcase.getDesc);

    app.get('/api/test/' + pps, testcase.getApiRun);

  });

  var testIndex = test.index(settings, files);
  app.get('/test', testIndex.getIndex);
  app.get('/test/data/json', testIndex.getJSONData);

  walk.walk(
    'yql-tables',
    function(err, files) {
      fiber.run(files);
    });

  var files = fibers.yield();

  if (!files) {
    console.log("Error loading OpenTable files");
    return;
  }

  var files = files.filter(function(file) {
    return path.extname(file) === '.xml';
  });

  var tables = [];

  files.forEach(function(file) {
    fs.readFile(file, function(err, data) {
      try {
        var xml = new DOMParser().parseFromString(data.toString());
        rel = path.relative('yql-tables', file);
        pps = path.basename(rel, '.xml').replace(/\./g, '/');

        var table = yql.table(settings, rel, xml);
        tables.push(table);

        app.post('/' + pps, table.postRun);
        app.get('/'  + pps + '/env' , table.getEnv);
        app.get('/'  + pps + '/src' , table.getSrc);
        app.get('/'  + pps + '/test', table.getTest);

      } catch (err) {
        console.log('Invalid XML document: ' + file + " " + err);
      }
    });
  });

  var yqlIndex = yql.index(settings, tables);
  app.get('/', yqlIndex.getIndex);
  app.get('/env', yqlIndex.getEnv);

}).run();

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
