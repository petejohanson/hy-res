'use strict';

var _ = require('lodash');

module.exports.extractFields = _.ary(_.partialRight(_.transform, function(res, val, key) {
    res.unshift({ name: key, value: val });
  }, []), 1);

//module.exports.reduceFields
