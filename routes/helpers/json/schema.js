/**
 * JSON schema generator.
 */

function schemafy(json) {

  if (json === null) {
    schema.type = "null";
  } else if (Array.isArray(json)) {
    schema.type = "array";
    if (json.length > 0)
      schema.items = schemafy(json[0]);
  } else {
    var type = typeof json;
    var schema = {};
    switch (type) {
    case 'boolean':
      schema.type = 'boolean';
      break;
    case 'number':
      schema.type = 'number';
      break;
    case 'object':
      schema.type = 'object';
      schema.properties = {};
      for (key in json) {
        var val = json[key];
        schema.properties[key] = schemafy(val);
      }
      break;
    case 'string':
      schema.type = 'string';
      break;
    }
  }
}
