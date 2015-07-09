'use strict';

var URI = require('URIjs');
var _ = require('lodash');

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
var Context = function(http, extensions, defaultOptions) {
  this.http = http;
  this.extensions = extensions;
  this.defaultOptions = defaultOptions || {};
  this.headers = {};
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
 * Generate an HTTP Accept header from the extension media types,
 * preferring the context content type over others, e.g
 * `application/vnd.siren+json;application/json;q=0.5`.
 * @returns {string} The generated Accept header value
 */
Context.prototype.acceptHeader = function() {
  var mediaTypes = _(this.extensions).pluck('mediaTypes').flatten().compact();
  if (this.headers['content-type']) {
    var preferred = this.headers['content-type'];
    mediaTypes = mediaTypes.map(function(mt) { return mt === preferred ? mt : mt + ';q=0.5'; });
  }
  return mediaTypes.join(',');
};

/**
 * Create a copy of the context with any base URL removed.
 * @returns {Context} the new context with base URL context removed.
 */
Context.prototype.baseline = function() {
  return this.forResource(undefined);
};

/**
 * Create a copy of the context with a new resource context
 * @arg {Object} resource The context resource object.
 * @arg {String} resource.url The new context URL.
 * @arg {Object} resource.headers The headers of the resource context.
 * @returns {Context} The new context with the given resource.
 */
Context.prototype.forResource = function(resource) {
  var c = new Context(this.http, this.extensions, this.defaultOptions);
  resource = resource || {};
  c.url = resource.url;
  c.headers = resource.headers || {};

  return c;
};

/**
 * Merge the default options with the provided ones to produce the final
 * options for a follow operation.
 * @arg {Object} [options] The request specific options.
 * @returns {Object} The merged options.
 */
Context.prototype.withDefaults = function(options) {
  var ret = {};

  return _.merge({}, this.defaultOptions, options || {});
};

/**
 * Create a new context with the provided extensions overriding the existing ones.
 * @param {Array} extensions The new set of extensions to use for the context
 * @returns {Context} A new context w/ the provided extensions
 */
Context.prototype.withExtensions = function(extensions) {
  return new Context(this.http, extensions, this.defaultOptions);
};

module.exports = Context;
