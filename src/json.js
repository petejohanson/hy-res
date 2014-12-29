'use strict';

var JsonExtension = function() {
  this.applies = function(data, headers) {
    return headers['Content-Type'] === 'application/json';
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
