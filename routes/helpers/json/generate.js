/*
 * JSON data generation.
 */

function generate(schema) {

  if (schema.enum) {
    var enums = schema.enum;
    return enums[0];
  }

  switch (schema.type) {
  case "object":
    var object = {};
    var properties = schema.properties;
    for (property in properties) {
      object[property] = generate(properties[property]);
    }
    return object;
  case "array":
    var min = schema.minItems ? schema.minItems : 0;
    var size = min + 10;
    var array = [];
    for (var i = 0; i < size; ++i) {
      var item = generate(schema.items);
      array.push(item);
    }
    return array;
  case "string":
    var string = "test";
    return string;
  case "integer":
    var integer = 0;
    return integer;
  case "boolean":
    var boolean = false;
    return boolean;
  }
}

exports.generate = generate;
