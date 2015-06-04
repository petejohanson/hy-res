'use strict';

var _ = require('lodash');
var Form = require('./form');
var WebLink = require('./web_link');
var LinkCollection = require('./link_collection');

/**
 * Create the Collection+JSON extension
 *
 * @constructor
 * @arg {Array} mediaTypes Media types in addition to
 * `application/collection+json` that should be handled by this extensions.
 * This allows for custom media types based on Collection+JSON to be handled
 * properly.
 *
 * @classdesc
 * Extension for processing
 * [Collection+JSON](http://amundsen.com/media-types/collection/format/)
 * responses.
 * By default, the extension will only process links and embedded
 * resources in responses if the HTTP response `Content-Type` header
 * equals `application/vnd.collection+json`. If you have a custom media type that
 * extends C+J, you can register it by passing it in the `mediaTypes`
 * parameter.
 */
var CollectionJsonExtension = function(mediaTypes) {
  var mediaTypeSet = { 'application/vnd.collection+json': true };

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

    // Handle parameters, e.g. application/collection+json; charset=UTF-8
    var type = h.split(';')[0];
    return mediaTypeSet[type] !==  undefined;
  };

  this.dataParser = function(data) {
    // The data parser really only applies when parsing
    // an included item for use as an embedded resource,
    // so here we don't expect to be nested under "collection".
    return data.data || [];
  };

  this.linkParser = function(data, headers, context) {
    var coll = data.collection;
    if (!coll) {
      return undefined;
    }

    var links = (coll.links || []).concat([{ rel: 'self', href: coll.href }]);

    return _(links)
       .map(function(l) { return new WebLink(l, context); })
       .groupBy('rel')
       .value();
  };

  var queryFormDefaults = {
    method: 'GET',
    type: 'application/x-www-form-urlencoded'
  };

  this.formParser = function(data, headers, context) {
    var coll = data.collection;
    if (!coll) {
      return undefined;
    }

    var formFactory = function(q) {
      var q2 = _.clone(q);
      q2.fields = q2.data;
      delete q2.data;
      return new Form(_.defaults(q2, queryFormDefaults), context);
    };

    return _.groupBy(_.map((coll.queries || []), formFactory), 'rel');
  };

  this.embeddedParser = function(data) {
    var coll = data.collection;
    if (!coll) {
      return undefined;
    }

    return { item: _.cloneDeep(coll.items) };
  };
};

module.exports = CollectionJsonExtension;

