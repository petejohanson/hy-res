'use strict';

var _ = require('lodash');
var WebLink = require('./web_link');

var Root = function(url, http, extensions) {
  _.forEach(extensions, function(e) {
    if (!e.initialize) {
      return;
    }

    e.initialize(http, extensions);
  });
  return new WebLink({ href: url }, http, extensions);
};

module.exports = Root;
