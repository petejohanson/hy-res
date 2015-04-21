'use strict';

var _ = require('lodash');

var Form = function(data, http) {
  _.merge(this, data);
  this.$$http = http;
};

Form.prototype.field = function(name) {
  if (!this.fields)
    return undefined;
  
  return _.find(this.fields, _.property('name', name));
};

Form.prototype.submit = function() { // TODO: options parameter?
  var config = {
    url: this.href,
    method: this.method,
    headers: { 'Content-Type': this.type || 'application/x-www-form-urlencoded' }
  };

  if (this.fields) {
    var fieldValues = _.map(this.fields, function(f) { var ret = {}; ret[f.name] = f.value; return ret; });

    config.data = _.assign.apply(this,_.flatten([{}, fieldValues]));
  }

  // TODO: Better return value? Return a resource? Something else?
  return this.$$http(config);
};

module.exports = Form;
