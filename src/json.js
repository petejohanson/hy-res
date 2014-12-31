'use strict';

var JsonExtension = function() {
  this.applies = function(data, headers) {
    var h = headers['content-type'];
    if (!h) {
      return false;
    }

    // Handle parameters, e.g. application/json; charset=UTF-8
    var type = h.split(';')[0];
    return type === 'application/json';
  };

  this.dataParser = function(data) {
    return data;
  };

  this.linkParser = function(data, headers, Resource) {
    return {};
  };

  this.embeddedParser = function(data, headers) {
    return [];
  };
};

module.exports = JsonExtension;
