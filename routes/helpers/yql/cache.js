/*
 * Create YQL cache object.
 */

exports.create = function() {

  var cache = {
    "CacheOpResult": {},
    "decr"         : decr,
    "get"          : get,
    "incr"         : incr,
    "put"          : put,
    "remove"       : remove
  };
}

function decr(key, by, def, expiry, timeout) {

}

function get(key, timeout) {
  var cacheOpResult =
    { "op": "get" };


}

function incr(key, by, def, expiry, timeout) {

}

function put(key, value, expiry) {

}

function remove(key, timeout) {

}
