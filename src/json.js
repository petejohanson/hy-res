'use strict';

var fieldUtils = require('./field_utils');

/**
 * Create a new JSON extension.
 *
 * @constructor
 * @implements {Extension}
 *
 * @classdesc
 * Extension for parsing basic field data from `application/json` responses.
 *
 */
var JsonExtension = function() {
  this.mediaTypes = ['application/json'];

  this.applies = function(data, headers) {
    var h = headers['content-type'];
    if (!h) {
      return false;
    }

    // Handle parameters, e.g. application/json; charset=UTF-8
    var type = h.split(';')[0];
    return type === 'application/json';
  };

  this.dataParser = fieldUtils.extractFields;
};

module.exports = JsonExtension;
