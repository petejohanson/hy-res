'use strict';

var _ = require('lodash');
var Form = require('./form');
var WebLink = require('./web_link');
var LinkCollection = require('./link_collection');

/**
 * Create the Siren extension
 *
 * @constructor
 * @arg {Array} mediaTypes Media types in addition to `application/vnd.siren+json`
 * that should be handled by this extensions. This allows for custom media
 * types based on Siren to be handled properly.
 *
 * @classdesc
 * Extension for processing
 * [Siren](https://github.com/kevinswiber/siren) responses.  By default,
 * the extension will only process links and embedded resources in
 * responses if the HTTP response `Content-Type` header equals
 * `application/vnd.siren+json`. If you have a custom media type that
 * extends SIren, you can register it by passing it in the `mediaTypes`
 * parameter.
 *
 * At this point, the Siren extension includes both the Siren `links` and
 * the sub-entity embedded links in the set queried by the {@link
 * Resource#$link}/{@link Resource#$links} functions.
 *
 * Siren's [actions](https://github.com/kevinswiber/siren#actions-1) are
 * exposed through {@link Resource#$form} and {@link Resource#$forms}.
 */
var SirenExtension = function(mediaTypes) {
  var formDefaults = {
    method: 'GET',
    type: 'application/x-www-form-urlencoded'
  };

  var http, extensions;
  var mediaTypeSet = { 'application/vnd.siren+json': true };

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
    var ret = data.properties || {};
    if (data.title) {
      ret.title = data.title;
    }

    return ret;
  };

  this.linkParser = function(data, headers, context) {
    var ret = {};

    if (_.isObject(data.links)) {
      _.forEach(data.links, function (val) {
        var link = new WebLink(val, context, http, extensions);
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

        var link = new WebLink(val, context, http, extensions);
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


  this.formParser = function(data, headers, context) {
    var formFactory = function(f) {
      return new Form(_.defaults(f, formDefaults), context, http);
    };

    return _.groupBy(_.map(data.actions, formFactory), 'name');
  };
};

module.exports = SirenExtension;
