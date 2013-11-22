/*
 * Create YQL cache object.
 */

var sqlite3 = require('sqlite3');

module.exports = function(settings) {

  var db = new sqlite3.Database(':memory:');

  db.serialize(function() {
    db.run('CREATE TABLE cache (session VARCHAR(64) UNIQUE, key TEXT NOT NULL, value TEXT NOT NULL, expires DATETIME NOT NULL, UNIQUE (session, key, value) )');
  });

  exports.create = function(sid) {

    var cache = {
      "CacheOpResult": {},
      "decr"         : decr,
      "get"          : get,
      "incr"         : incr,
      "put"          : put,
      "remove"       : remove
    };

    function CacheOpResult(op) {
      this.op = op;
      this.value;
      this.__defineGetter__('result', function() {
        if (typeof this.value === 'undefined')
          this.value = fibers.yield();
        return this.value;
      });
    }

    function decr(key, by, def, expiry, timeout) {
      var fiber = fibers.current;
      db.all(
        'SELECT * FROM cache WHERE session = ? AND key = ?',
        [sid, key],
        function(err, rows) {
          if (rows.length > 0) {
            var value = rows[0].value;
            if (!isNaN(parseFloat(value)) && isFinite(value)) {
              db.run(
                'UPDATE cache SET value = value - 1 WHERE session = ? AND key = ?',
                [sid, key],
                function(err) {
                  if (err)
                    fiber.run(false);
                  else
                    fiber.run(true);
                });
            } else {
              fiber.run(false);
            }
          } else
            fiber.run(false);
        });
      return new CacheOpResult('decr');
    }

    function get(key, timeout) {
      var fiber = fibers.current;
      db.all('SELECT * FROM cache WHERE session = ? AND key = ?', [sid, key], function(err, rows) {
        if (rows.length > 0)
          fiber.run(rows[0])
        else
          fiber.run(null);
      });
      return new CacheOpResult('get');
    }

    function incr(key, by, def, expiry, timeout) {
      var fiber = fibers.current;
      db.all(
        'SELECT * FROM cache WHERE session = ? AND key = ?',
        [sid, key],
        function(err, rows) {
          if (rows.length > 0) {
            var value = rows[0].value;
            if (!isNaN(parseFloat(value)) && isFinite(value)) {
              db.all(
                'UPDATE cache SET value = value + 1 WHERE session = ? AND key = ?',
                [sid, key],
                function(err, rows) {
                  if (err)
                    fiber.run(false);
                  else
                    fiber.run(true);
                });
            } else {
              fiber.run(false);
            }
          } else
            fiber.run(false);
        });
      return new CacheOpResult('incr');
    }

    function put(key, value, expiry) {
      var fiber = fibers.current;

      if (typeof expiry === 'undefined')
        expiry = 2500;

      var expires = new Date();
      expires.setTime(expires.getTime() + expiry * 1000);

      db.run('INSERT INTO cache (session, key, value, expires) VALUES (?, ? , ?, ?)',
             [sid, key, value, expires], function(err) {
               if (err)
                 fiber.run(false);
               else
                 fiber.run(true);
             });
      return new CacheOpResult('put');
    }

    function remove(key, timeout) {
      var fiber = fibers.current;
      db.all('DELETE FROM cache WHERE session = ? AND key = ?', [sid, key], function(err, rows) {
        fiber.run(true);
      });
      return new CacheOpResult('remove');
    }

    return cache;
  }

  return exports;
}
