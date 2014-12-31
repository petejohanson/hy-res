'use strict';

var _ = require('lodash');
var WebLink = require('./web_link');
var LinkCollection = require('./link_collection');

var SirenExtension = function(mediaTypes) {
  var http, extensions;
  var mediaTypeSet = { 'application/vnd.siren+json': true };

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
    var ret = data.properties || {};
    if (data.title) {
      ret.title = data.title;
    }

    return ret;
  };

  this.linkParser = function(data, headers) {
    var ret = {};

    if (_.isObject(data.links)) {
      _.forEach(data.links, function (val) {
        var link = new WebLink(val, http, extensions);
        for (var li = 0; li < val.rel.length; li++) {
          var r = val.rel[li];
          if (ret.hasOwnProperty(r)) {
            ret[r].push(link);
          } else {
            ret[r] = [link];
          }
        }
      });
    }

    if (_.isObject(data.entities)) {
      _.forEach(data.entities, function(val) {
        if (!val.href) {
          return;
        }

        var link = new WebLink(val, http, extensions);
        for (var li = 0; li < val.rel.length; li++) {
          var r = val.rel[li];
          if (ret.hasOwnProperty(r)) {
            ret[r].push(link);
          } else {
            ret[r] = [link];
          }
        }
      });
    }
    return ret;
  };

  this.embeddedParser = function(data, headers) {
    var ret = {};
    if (!_.isArray(data.entities)) {
      return ret;
    }

    _.forEach(data.entities, function(val) {
      if (val.href) {
        return;
      }

      for (var li = 0; li < val.rel.length; li++) {
        var r = val.rel[li];
        if (!ret.hasOwnProperty(r)) {
          ret[r] = [];
        }
        ret[r].unshift(val);
      }
    });
    return ret;
  };
};

module.exports = SirenExtension;
