'use strict';

var URI = require('URIjs');

/**
 * Create a new context with the given http abstraction and set of
 * extensions
 * @constructor
 *
 * @classdesc
 * The {@link Context} encapsulates the state/context of a given resource
 * or request, including extensions available, the http mechanism for
 * dereferencing URLs, etc.
 */
var Context = function(http, extensions) {
  this.http = http;
  this.extensions = extensions;
};

/**
 * Given a possibly relative URL, resolve it using the context's
 * base URL, if it exists.
 * @arg {String} url The (possibly relative) URL to resolve.
 * @returns String The resolved URL. This may still be relative is no base
 * URL is set in the given context.
 */
Context.prototype.resolveUrl = function(url) {
  if (this.url) {
    url = new URI(url).absoluteTo(this.url).toString();
  }
  return url;
};

/**
 * Create a copy of the context with any base URL removed.
 * @returns {Context} the new context with base URL context removed.
 */
Context.prototype.withoutUrl = function() {
  return this.withUrl(undefined);
};

/**
 * Create a copy of the context with a new base URL.
 * @arg {String} url The new base URL.
 * @returns {Context} The new context with the base URL.
 */
Context.prototype.withUrl = function(url) {
  var c = new Context(this.http, this.extensions);
  c.url = url;
  return c;
};

module.exports = Context;
