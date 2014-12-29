'use strict';

var _ = require('lodash');
var Resource = require('./resource');
var UriTemplate = require('uritemplate');

var WebLink = function(data, http, extensions) {
  _.extend(this, data);
  this.$$http = http;
  this.$$extensions = extensions;
};

WebLink.prototype.follow = function(options) {
  var url = this.href;

  if (this.templated) {
    url = UriTemplate.parse(url).expand(options.data);
  }

  options = (options || {});
  options.headers = (options.headers || {});

  if(this.type && !options.headers.Accept) {
    options.headers.Accept = this.type;
  }

  var requestOptions = _.extend(options, { url: url });
  return Resource.fromRequest(this.$$http(requestOptions), this.$$extensions);
};

module.exports = WebLink;
