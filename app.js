/**
 * Module dependencies.
 */

var settings = require('./settings');

var express = require('express')
  , http = require('http')
  , path = require('path')
  , fibers = require('fibers')
  , fs = require('fs')
  , yql = require('./routes/yql')
  , DOMParser = require('xmldom').DOMParser
  , walk = require('./helpers/walk')
  , test = require('./routes/test');

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
    'routes/helpers/tests',
    function (err, files) {
      fiber.run(files);
    });

  var files = fibers.yield();

  if (!files) {
    console.log("Error loading test files");
    return;
  }
  var testCases = files.filter(function(fileCase) {
    return path.extname(fileCase) === '.js';
  });

  testCases.forEach(function(testCase) {

    var js = require(testCase)(settings).js;
    var rel = path.relative('helpers/tests', testCase);
    var table = path.basename(rel, '.js');
    var module = test(settings, table, js);

    app.get('/test/' + table, module.getRun);
    app.get('/test/' + table + '/env', module.getEnv);
    app.get('/test/' + table + '/src', module.getSrc);
  });

  app.get('/test/data', function(req, res) {
    fs.readFile(
      'routes/helpers/example.json',
      function (err, data) {
        res.send(data.toString());
      });
  });

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
  var openTables = files.filter(function(file) {
    return path.extname(file) === '.xml';
  });

  var environment = [];
  var testEnvironment = [];

  openTables.forEach(function(openTable) {
    fs.readFile(openTable, function(err, data) {
      try {
        var xml = new DOMParser().parseFromString(data.toString());

        rel = path.relative('yql-tables', openTable);
        table = path.basename(rel, '.xml').replace(/\./g, '/');

        var module     = yql(settings, table, xml);

        environment.push(module.environment());

        app.post('/' + table, module.postRun);
        app.get('/' + table + '/env', module.getEnv);
        app.get('/' + table + '/src', module.getSrc);
        app.get('/' + table + '/test', module.getTest);

      } catch (err) {
        console.log('Invalid XML document: ' + openTable + " " + err);
      }
    })
  });

  app.get('/env', function(req, res) {
    res.send(environment.join('\n'));
  });
}).run();

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
