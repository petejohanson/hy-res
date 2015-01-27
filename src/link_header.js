'use strict';

var httpLink = require('http-link');

var _ = require('lodash');
var WebLink = require('./web_link');

var LinkHeaderExtension = function() {
  var http, extensions;

  this.initialize = function(_http, _extensions) {
    http = _http;
    extensions = _extensions;
  };

  this.applies = function(data, headers) {
    return _.isString(headers.link);
  };

  this.dataParser = function(data) {
    return {};
  };

  this.linkParser = function(data, headers, Resource) {
    var links = httpLink.parse(headers.link);

    var ret = {};
    for(var i = 0; i < links.length; i++) {
      var l = links[i];
      var wl = new WebLink(l, http, extensions);
      if (!_.isUndefined(ret[l.rel])) {
        ret[l.rel].push(wl);
      } else {
        ret[l.rel] = [wl];
      }

      delete l.rel;
    }
    return ret;
  };

  this.embeddedParser = function(data, headers) {
    return [];
  };
};

module.exports = LinkHeaderExtension;
