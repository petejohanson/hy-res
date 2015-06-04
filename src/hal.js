'use strict';

var _ = require('lodash');
var WebLink = require('./web_link');
var LinkCollection = require('./link_collection');
var Resource = require('./resource');

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
  var mediaTypeSet = { 'application/hal+json': true };

  mediaTypes = mediaTypes || [];
  for (var i = 0; i < mediaTypes.length; i++) {
    mediaTypeSet[mediaTypes[i]] = true;
  }

  this.mediaTypes = _.keys(mediaTypeSet);

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
    return _.transform(data, function(res, val, key) {
      if (key === '_links' || key === '_embedded')
        return;
      res.unshift({ name: key, value: val });
    }, []);
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
        // Because HAL uses link relations as object keys, we populate
        // the rel field on the link manually so the link is self
        // contained from this point onward.
        l.rel = key;
        linkArray.push(new WebLink(l, context));
      }, this);

      ret[key] = LinkCollection.fromArray(linkArray);
    }, this);
    return ret;
  };

  this.embeddedParser = function(data, headers, context) {
    var ret = {};
    _.forEach(data._embedded || {}, function(val, key) {
      if (!_.isArray(val)) {
        val = [val];
      }

      ret[key] = Resource.embeddedCollection(val, headers, context);
    });

    return ret;
  };
};

module.exports = HalExtension;

