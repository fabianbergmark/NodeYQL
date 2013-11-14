/*
 * JavaScript code transformations.
 */

exports.ecma = function(js) {
  var for_each = /for\s+each\s*\((?:var)?\s*(.*?)\s+in\s+(.*?)\s*\)\s*/g;

  var ecma = js;

  var pattern = new RegExp(for_each);
  var match;
  while (match = pattern.exec(ecma)) {
    var variable = match[1];
    var iterable = match[2];

    var start = match.index;
    var blockstart = match.index + match[0].length;

    var nesting = 0;
    var i = start + match[0].length;
    for (; i < ecma.length; ++i) {
      if (ecma.charAt(i) === '{') {
        ++nesting;
      } else if (ecma.charAt(i) === '}') {
        --nesting;
        if (nesting === 0) {
          break;
        }
      }
    }
    var stop = i;

    var tmp = ecma.split('');
    var block = tmp.splice(blockstart, stop - blockstart + 1).join('');
    tmp.splice(start, blockstart - start);
    var before = tmp.splice(0, start).join('');
    var after = tmp.join('');
    ecma = tmp.join('');

    var foreach = iterable + ".forEach(function(" + variable + ") "
      + block
      + ");";


    ecma = before + foreach + after;
  }

  return ecma;
}
