'use strict';

var URI = require('URIjs');

var Context = function(url) {
  this.url = url;
};

Context.prototype.resolveUrl = function(url) {
  if (this.url) {
    url = new URI(url).absoluteTo(this.url).toString();
  }
  return url;
};

Context.empty = new Context();

module.exports = Context;
