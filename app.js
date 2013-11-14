/**
 * Module dependencies.
 */

var settings = require('./settings');

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , yql = require('./routes/yql')
  , xmldom = require('xmldom').DOMParser
  , walk = require('./helpers/walk');

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

app.get('/', routes.index);

fs.readFile('routes/helpers/empty.xml', function (err, data) {
  var empty = new xmldom().parseFromString(data.toString());
  var test = require('./routes/test')(settings, empty);

  app.get('/test', test.getRun);
  app.get('/test/env', test.getEnv);
  app.get('/test/src', test.getSrc);
  app.get('/test/data', test.getData);

});

walk.walk('yql-tables', function(err, files) {
  if (err) {
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
        var xml = new xmldom().parseFromString(data.toString());

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
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
