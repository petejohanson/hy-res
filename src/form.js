'use strict';

var _ = require('lodash');
var FormUrlEncoded = require('form-urlencoded');
var Resouce = require('./resource');

/**
 * Forms should not be created on their own, they are normally
 * accessed from a containing {@link Resource}.
 * @constructor
 *
 * @classdesc
 * The {@link Form} class encapsulates a hypermedia form that can be
 * updated with values at runtime and then submitted.
 * TODO: More details on field values, etc.
 */
var Form = function(data, context, http, extensions) {
  // Cloning is required to keep cloned Form
  // instances separate.
  _.merge(this, _.cloneDeep(data));

  this.$$data = data;
  this.$$context = context;
  this.$$http = http;
  this.$$extensions = extensions;
};

/**
 * Lookup the field by the given name.
 * @arg {string} name The name of the field to look up.
 * @returns {Object} Object containing the field values.
 */
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

/**
 * Perform an HTTP request to submit the form. The request itself
 * is created based on the URL, method, type, and field values.
 * @returns {Resource} A resource that will eventually be resolved with response details.
 */
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

  return Resouce.fromRequest(this.$$http(config), this.$$extensions);
};

/**
 * Clone the current {@link Form} so that fields can be updated
 * and not impact/change the original form field values.
 * @returns {Form} the cloned form.
 */
Form.prototype.clone = function() {
  return new Form(this.$$data,
                  this.$$context,
                  this.$$http,
                  this.$$extensions);
};

module.exports = Form;
