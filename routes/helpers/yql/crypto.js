/*
 * Create YQL crypto object.
 */

var crypto = require('crypto')
  , uuidv4 = require('uuid-v4');

module.exports = function(settings) {

  exports.create = function() {

    var crypto = {
      "encodeHmacSHA256": encodeHmacSHA256,
      "encodeHmacSHA1": encodeHmacSHA1,
      "encodeMd5": encodeMd5,
      "encodeMd5Hex": encodeMd5Hex,
      "encodeSha": encodeSha,
      "encodeBase64": encodeBase64,
      "decodeBase64": decodeBase64,
      "uuid": uuid
    };

    return crypto;
  }

  function encodeHmacSHA256(secret, plaintext) {
    return crypto.createHmac('sha256', secret).update(plaintext).digest('base64');
  }

  function encodeHmacSHA1(secret, plaintext) {
    return crypto.createHmac('sha1', secret).update(plaintext).digest('base64');
  }

  function encodeMd5(plaintext) {
    return crypto.createHash('md5').update(plaintext).digest('base64');
  }

  function encodeMd5Hex(plaintext) {
    return crypto.createHash('md5').update(plaintext).digest('hex');
  }

  function encodeSha(plaintext) {
    return crypto.createHash('sha1').update(plaintext).digest('base64');
  }

  function encodeBase64(plaintext) {
    return new Buffer(plaintext).toString('base64');
  }

  function decodeBase64(plaintext) {
    return new Buffer(plaintext, 'base64').toString();
  }

  function uuid() {
    return uuidv4();
  }

  return exports;
}
