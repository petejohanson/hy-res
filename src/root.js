'use strict';

var _ = require('lodash');
var Context = require('./context');
var WebLink = require('./web_link');

var Root = function(url, http, extensions) {
  _.invoke(extensions, 'initialize', http, extensions);

  WebLink.call(this, { href: url }, new Context(url), http, extensions);
};

Root.prototype = _.create(WebLink.prototype, {
  'constructor': Root
});

module.exports = Root;
