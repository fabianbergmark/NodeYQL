/*
 * Create YQL date object.
 */

module.exports = function(settings) {

  exports.create = function() {

    var date = {
      'getOffsetFromEpochInMillis': getOffsetFromEpochInMillis
    };

    function getOffsetFromEpochInMillis(when) {
      var match;
      if (match = Date.parse(when)) {

      } else if (match = when.match(/^([+-])?\s*(\d+)\s*(year|month|week|day|hour|minute)s?$/)) {

      } else if (match = when.match(/^(\d+)\s*(year|month|week|day|hour|minute)s?\s+(from\s+now|after|after\s+today|later|old|ago)$/)) {

      } else if (match = when.match(/^now\s+([+-])\s*(\d+)\\s+(year|month|week|day|hour|minute)s?$/)) {

      } else if (match = when.match(/^last\s+(year|month|week)$/)) {

      } else if (when == 'now') {
        return Date.now();
      } else if (when == 'yesterday') {

      } else if (when == 'tomorrow') {

      }
    }

    return date;
  }

  return exports;
}
