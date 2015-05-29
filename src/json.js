'use strict';

var _ = require('lodash');

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

  this.dataParser = _.ary(_.partialRight(_.transform, function(res, val, key) {
      res.unshift({ name: key, value: val });
  }, []), 1);
};

module.exports = JsonExtension;
