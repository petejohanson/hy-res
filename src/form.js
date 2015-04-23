'use strict';

var _ = require('lodash');

var Form = function(data, context, http) {
  // Cloning is required to keep cloned Form
  // instances separate.
  _.merge(this, _.cloneDeep(data));

  this.$$data = data;
  this.$$context = context;
  this.$$http = http;
};

Form.prototype.field = function(name) {
  if (!this.fields)
    return undefined;
  
  return _.find(this.fields, 'name', name);
};

var ContentTypeDataTransformers = {
  'application/x-www-form-urlencoded': function(data) {
    var elems = _.map(data, function(val, key) { return encodeURIComponent(key) + '=' + encodeURIComponent(val); });
    
    return elems.join('&').replace(/%20/g, '+');
  },
  'multipart/form-data': function(data) {
    var fd = new FormData();
    _.forEach(data, function(val, key) { console.log(val); fd.append(key, val); });

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
