'use strict';

var _ = require('lodash');
var Context = require('./context');
var WebLink = require('./web_link');

/**
 * Entrypoint to an API.
 * @constructor
 * @extends WebLink
 * @arg {string} url The URL of the root of the API
 * @arg http The ES6 promise based HTTP abstraction (e.g. AngularJS $http, or [axios](https://www.npmjs.com/package/axios)
 * @arg {Array} extensions The extensions to use for processing responses
 */
var Root = function(url, http, extensions) {
  var ctx = new Context(http, extensions);

  WebLink.call(this, { href: url }, ctx.withUrl(url));
};

Root.prototype = _.create(WebLink.prototype, {
  'constructor': Root
});

module.exports = Root;
