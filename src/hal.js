'use strict';

var _ = require('lodash');
var WebLink = require('./web_link');
var LinkCollection = require('./link_collection');

var HalExtension = function(mediaTypes) {
  var http, extensions;
  var mediaTypeSet = { 'application/hal+json': true };

  mediaTypes = mediaTypes || [];
  for (var i = 0; i < mediaTypes.length; i++) {
    mediaTypeSet[mediaTypes[i]] = true;
  }

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

  this.linkParser = function(data, headers) {
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
        linkArray.push(new WebLink(l, http, extensions));
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

