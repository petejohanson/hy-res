'use strict';

var _ = require('lodash');

module.exports.extractFields = function(data) {
  return _.transform(data, function(res, val, key) {
    res.unshift({ name: key, value: val });
  }, []);
};
