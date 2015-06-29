'use strict';

var _ = require('lodash');
var FieldUtils = require('./field_utils');
var Form = require('./form');
var WebLink = require('./web_link');
var Resource = require('./resource');
var LinkCollection = require('./link_collection');

var cjObjectLinkParser = function(obj, headers, context) {

  var links = (obj.links || []).concat([{ rel: 'self', href: obj.href }]);

  return _(links)
    .map(function(l) { return new WebLink(l, context); })
    .groupBy('rel')
    .value();
};

var CollectionJsonItemExtension = function() {
  this.applies = _.constant(true);

  this.linkParser = cjObjectLinkParser;

  this.dataParser = function(data) {
    return data.data || [];
  };
};

/**
 * Create the Collection+JSON extension
 *
 * @constructor
 * @arg {Array} [mediaTypes] Media types in addition to
 * `application/collection+json` that should be handled by this extensions.
 * This allows for custom media types based on Collection+JSON to be handled
 * properly.
 *
 * @classdesc
 * **WARNING: The CollectionJsonExtension is incomplete, and not ready for production use**
 *
 * Extension for processing
 * [Collection+JSON](http://amundsen.com/media-types/collection/format/).
 * By default, the extension will only process links and embedded
 * resources in responses if the HTTP response `Content-Type` header
 * equals `application/vnd.collection+json`. If you have a custom media type that
 * extends C+J, you can register it by passing it in the `mediaTypes`
 * parameter.
 */
var CollectionJsonExtension = function(mediaTypes) {
  this.itemExtension = new CollectionJsonItemExtension();
  var mediaTypeSet = { 'application/vnd.collection+json': true };

  mediaTypes = mediaTypes || [];
  for (var i = 0; i < mediaTypes.length; i++) {
    mediaTypeSet[mediaTypes[i]] = true;
  }

  this.encoders = {
    'application/vnd.collection+json': function(data) {
      console.log(data);
      return JSON.stringify({
        template: {
          data: FieldUtils.extractFields(data)
        }
      });
    }
  };

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
    return cjObjectLinkParser(data.collection, headers, context);
  };

  var queryFormDefaults = {
    method: 'GET',
    type: 'application/x-www-form-urlencoded'
  };

  this.formParser = function(data, headers, context) {
    var coll = data.collection;

    var formFactory = function(q) {
      var q2 = _.clone(q);
      q2.fields = q2.data;
      delete q2.data;
      return new Form(_.defaults(q2, queryFormDefaults), context);
    };

    var forms = _.groupBy(_.map((coll.queries || []), formFactory), 'rel');

    if (coll.template) {
      forms['create-form'] = [
        new Form({
          href: coll.href,
          method: 'POST',
          type: 'application/vnd.collection+json',
          fields: coll.template.data
        }, context)
      ];
    }
    return forms;
  };

  this.embeddedParser = function(data, headers, context) {
    return {
      item: Resource.embeddedCollection(
        _.cloneDeep(data.collection.items),
        headers,
        context.withExtensions([this.itemExtension])
      )
    };
  };
};

module.exports = CollectionJsonExtension;
