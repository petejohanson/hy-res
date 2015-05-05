'use strict';

var httpLink = require('http-link');

var _ = require('lodash');
var WebLink = require('./web_link');

var LinkHeaderExtension = function() {
  this.applies = function(data, headers) {
    return _.isString(headers.link);
  };

  this.linkParser = function(data, headers, context) {
    var links = httpLink.parse(headers.link);

    var ret = {};
    for(var i = 0; i < links.length; i++) {
      var l = links[i];
      var wl = new WebLink(l, context);
      if (!_.isUndefined(ret[l.rel])) {
        ret[l.rel].push(wl);
      } else {
        ret[l.rel] = [wl];
      }

      delete l.rel;
    }
    return ret;
  };
};

module.exports = LinkHeaderExtension;
