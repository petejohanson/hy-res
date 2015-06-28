'use strict';

var fieldUtils = require('./field_utils');

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
