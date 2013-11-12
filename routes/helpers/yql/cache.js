/*
 * Create YQL cache object.
 */

exports.create = function() {

  var cache = {
    "CacheOpResult": {},
    "decr": decr,
    "incr": incr,
    "put": put,
    "remove": remove
  };
}

function decr(key, by, def, expiry, timeout) {

}

function incr(key, by, def, expiry, timeout) {

}

function put(key, value, expiry) {

}

function remove(key, timeout) {

}
