'use strict';

var _ = require('lodash');
var FormUrlEncoded = require('form-urlencoded');

var Form = function(data, context, http) {
  // Cloning is required to keep cloned Form
  // instances separate.
  _.merge(this, _.cloneDeep(data));

  this.$$data = data;
  this.$$context = context;
  this.$$http = http;
};

Form.prototype.field = function(name) {
  return _.find(this.fields, 'name', name);
};

var ContentTypeDataTransformers = {
  'application/json': function(data) {
    return JSON.stringify(data);
  },
  'application/x-www-form-urlencoded': function(data) {
    return data ? FormUrlEncoded.encode(data) : undefined;
  },
  'multipart/form-data': function(data) {
    var fd = new FormData();
    _.forEach(data, function(val, key) { fd.append(key, val); });

    return fd;
  }
};

Form.prototype.submit = function() { // TODO: options parameter?
  var config = {
    url: this.$$context.resolveUrl(this.href),
    method: this.method,
    transformRequest: [function(d, h) {
      var trans = ContentTypeDataTransformers[h['Content-Type']];
      return trans ? trans(d) : d;
    }],
    headers: { 'Content-Type': this.type || 'application/x-www-form-urlencoded' }
  };

  if (this.fields) {
    var fieldValues = _.map(this.fields, function(f) { var ret = {}; ret[f.name] = f.value; return ret; });
    var vals = _.assign.apply(this,_.flatten([{}, fieldValues]));

    var prop = this.method === 'GET' ? 'params' : 'data';
    config[prop] = vals;
  }

  // TODO: Better return value? Return a resource? Something else?
  return this.$$http(config);
};

Form.prototype.clone = function() {
  return new Form(this.$$data, this.$$context, this.$$http);
};

module.exports = Form;
