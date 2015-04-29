'use strict';

var _ = require('lodash');
var WebLink = require('./web_link');
var LinkCollection = require('./link_collection');

/**
 * Create the HAL extension
 *
 * @constructor
 * @arg {Array} mediaTypes Media types in addition to `application/hal+json`
 * that should be handled by this extensions. This allows for custom media
 * types based on HAL to be handled properly.
 *
 * @classdesc
 * Extension for processing
 * [HAL](http://tools.ietf.org/html/draft-kelly-json-hal-06) responses.
 * By default, the extension will only process links and embedded
 * resources in responses if the HTTP response `Content-Type` header
 * equals `application/hal+json`. If you have a custom media type that
 * extends HAL, you can register it by passing it in the `mediaTypes`
 * parameter.
 */
var HalExtension = function(mediaTypes) {
  var http, extensions;
  var mediaTypeSet = { 'application/hal+json': true };

  mediaTypes = mediaTypes || [];
  for (var i = 0; i < mediaTypes.length; i++) {
    mediaTypeSet[mediaTypes[i]] = true;
  }

  this.mediaTypes = _.keys(mediaTypeSet);

  this.initialize = function(_http, _extensions) {
    http = _http;
    extensions = _extensions;
  };

  this.applies = function(data, headers) {
    var h = headers['content-type'];
    if (!h) {
      return false;
    }

    // Handle parameters, e.g. application/hal+json; charset=UTF-8
    var type = h.split(';')[0];
    return mediaTypeSet[type] !==  undefined;
  };

  this.dataParser = function(data, headers) {
    var ret = {};
    _.assign(ret, data);
    delete ret._links;
    delete ret._embedded;
    return ret;
  };

  this.linkParser = function(data, headers, context) {
    if (!_.isObject(data._links)) {
      return null;
    }

    var ret = {};
    _.forEach(data._links, function(val, key) {
      if (!_.isArray(val)) {
        val = [val];
      }

      var linkArray = [];
      _.forEach(val, function(l) {
        linkArray.push(new WebLink(l, context, http, extensions));
      }, this);

      ret[key] = LinkCollection.fromArray(linkArray);
    }, this);
    return ret;
  };

  this.embeddedParser = function(data, headers) {
    var ret = {};
    _.forEach(data._embedded || {}, function(val, key) {
      if (!_.isArray(val)) {
        val = [val];
      }

      ret[key] = val;
    });

    return ret;
  };
};

module.exports = HalExtension;

