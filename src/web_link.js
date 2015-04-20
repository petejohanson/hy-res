'use strict';

var _ = require('lodash');
var Resource = require('./resource');
var URI = require('URIjs');
var UriTemplate = require('URIjs/src/URITemplate');

var WebLink = function(data, context, http, extensions) {
  _.extend(this, data);
  this.$$context = context;
  this.$$http = http;
  this.$$extensions = extensions;
};

WebLink.prototype.follow = function(options) {
  options = (options || {});
  options.headers = (options.headers || {});

  if(!options.headers.Accept) {
    if (this.type) {
      options.headers.Accept = this.type;
    } else {
      var accept = _.reduce(_.flatten(_.compact(_.pluck(this.$$extensions, 'mediaTypes'))), function(acc, s) { return acc + ',' + s; });
      if (accept) {
        options.headers.Accept = accept;
      }
    }
  }

  var requestOptions = _.extend(options, { url: this.resolvedUrl(options.data) });
  return Resource.fromRequest(this.$$http(requestOptions), this.$$extensions);
};

WebLink.prototype.resolvedUrl = function(data) {
  var url = this.href;

  if (this.templated) {
    url = new UriTemplate(url).expand(data);
  }

  if (this.$$context && this.$$context.url) {
    url = new URI(url).absoluteTo(this.$$context.url).toString();
  }

  return url;
};

module.exports = WebLink;
